"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface RealButterflyProps {
  fullyBloomed: boolean;
}

interface FlowerPerch {
  id: string;
  name: string;
  // Normalized stage coordinates (0 to 1 range across bouquet bounding box)
  // SVG coordinate (x / 520, y / 620)
  normX: number;
  normY: number;
  preferredAngle: number; // Resting rotation angle (degrees)
}

// Hand-calibrated flower perches mapped from florist arrangement
// SVG ViewBox is (0 0 520 620)
const FLOWER_PERCHES: FlowerPerch[] = [
  { id: "centerpiece-blush-rose", name: "Blush Rose Centerpiece", normX: 260 / 520, normY: 310 / 620, preferredAngle: 3 },
  { id: "tall-white-peony", name: "Tall White Center Rose", normX: 282 / 520, normY: 172 / 620, preferredAngle: -8 },
  { id: "tall-red-rose-left", name: "Velvety Red Rose Left", normX: 228 / 520, normY: 178 / 620, preferredAngle: 12 },
  { id: "canopy-pink-rose-top", name: "Top Canopy Pink Rose", normX: 260 / 520, normY: 78 / 620, preferredAngle: -4 },
  { id: "canopy-pink-rose-right", name: "Top Right Pink Rose", normX: 365 / 520, normY: 110 / 620, preferredAngle: -16 },
  { id: "canopy-pink-rose-left", name: "Top Left Pink Rose", normX: 155 / 520, normY: 110 / 620, preferredAngle: 16 },
  { id: "tall-pink-rose-left", name: "Pink Rose Tall Left", normX: 135 / 520, normY: 166 / 620, preferredAngle: 20 },
  { id: "tall-white-rose-right", name: "White Rose Tall Right", normX: 388 / 520, normY: 166 / 620, preferredAngle: -18 },
  { id: "foreground-white-rose-right", name: "White Rose Front Right", normX: 358 / 520, normY: 368 / 620, preferredAngle: -14 },
  { id: "foreground-red-rose-left", name: "Red Rose Front Left", normX: 212 / 520, normY: 320 / 620, preferredAngle: 12 },
  { id: "daisy-mid-left", name: "White Daisy Mid Left", normX: 125 / 520, normY: 280 / 620, preferredAngle: 15 },
  { id: "daisy-mid-right", name: "White Daisy Mid Right", normX: 395 / 520, normY: 280 / 620, preferredAngle: -15 },
];

interface Waypoint {
  normX: number;
  normY: number;
  time: number; // accumulated time in seconds
  wingState: "flap" | "glide" | "hover" | "settle";
}

// Catmull-Rom spline interpolation
function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const v0 = (p2 - p0) * 0.5;
  const v1 = (p3 - p1) * 0.5;
  const t2 = t * t;
  const t3 = t * t2;
  return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
}

function sampleSpline(points: Waypoint[], currentTime: number) {
  const n = points.length;
  if (currentTime <= points[0].time) {
    return {
      normX: points[0].normX,
      normY: points[0].normY,
      angle: 0,
      wingState: points[0].wingState,
    };
  }
  if (currentTime >= points[n - 1].time) {
    return {
      normX: points[n - 1].normX,
      normY: points[n - 1].normY,
      angle: 0,
      wingState: points[n - 1].wingState,
    };
  }

  let i = 0;
  while (i < n - 1 && points[i + 1].time < currentTime) {
    i++;
  }

  const p1 = points[i];
  const p2 = points[i + 1];
  const p0 = points[Math.max(0, i - 1)];
  const p3 = points[Math.min(n - 1, i + 2)];

  const segDuration = Math.max(0.001, p2.time - p1.time);
  const t = Math.min(Math.max((currentTime - p1.time) / segDuration, 0), 1);
  const easedT = t * t * (3 - 2 * t);

  const normX = catmullRom(p0.normX, p1.normX, p2.normX, p3.normX, easedT);
  const normY = catmullRom(p0.normY, p1.normY, p2.normY, p3.normY, easedT);

  // Lookahead derivative for natural flight tangent alignment & banking
  const dt = 0.035;
  const nextT = Math.min(easedT + dt, 1);
  const nextX = catmullRom(p0.normX, p1.normX, p2.normX, p3.normX, nextT);
  const nextY = catmullRom(p0.normY, p1.normY, p2.normY, p3.normY, nextT);

  const dx = nextX - normX;
  const dy = nextY - normY;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;

  return { normX, normY, angle, wingState: p1.wingState };
}

// Procedural organic flight generator with safe boundary clamping
function generateProceduralFlight(
  startPos: { normX: number; normY: number },
  targetPerch: FlowerPerch,
  isInitialEntry = false
): Waypoint[] {
  const waypoints: Waypoint[] = [];
  let t = 0;

  if (isInitialEntry) {
    // Majestic entrance from outside stage boundaries
    const startX = Math.random() > 0.5 ? 1.08 : -0.08;
    const startY = 0.08 + Math.random() * 0.12;
    waypoints.push({ normX: startX, normY: startY, time: 0, wingState: "flap" });

    // Mid-air exploration curve within safe stage area
    const mid1X = startX > 0.5 ? 0.82 + Math.random() * 0.06 : 0.16 + Math.random() * 0.06;
    const mid1Y = 0.18 + Math.random() * 0.08;
    t += 1.4;
    waypoints.push({ normX: mid1X, normY: mid1Y, time: t, wingState: "flap" });

    // Glide across top floral canopy
    const canopyX = 0.5 + (Math.random() - 0.5) * 0.22;
    const canopyY = 0.22 + Math.random() * 0.06;
    t += 1.3;
    waypoints.push({ normX: canopyX, normY: canopyY, time: t, wingState: "glide" });

    // Hover above target flower
    const swoopX = Math.max(0.08, Math.min(0.92, targetPerch.normX + (Math.random() - 0.5) * 0.12));
    const swoopY = Math.max(0.08, targetPerch.normY - 0.08 - Math.random() * 0.04);
    t += 1.3;
    waypoints.push({ normX: swoopX, normY: swoopY, time: t, wingState: "hover" });

    // Decelerated touchdown
    t += 1.1;
    waypoints.push({ normX: targetPerch.normX, normY: targetPerch.normY, time: t, wingState: "settle" });
  } else {
    // Liftoff & flower-to-flower flight
    waypoints.push({ normX: startPos.normX, normY: startPos.normY, time: 0, wingState: "flap" });

    // Quick natural liftoff rise
    const liftoffX = Math.max(0.06, Math.min(0.94, startPos.normX + (Math.random() - 0.5) * 0.08));
    const liftoffY = Math.max(0.06, startPos.normY - (0.07 + Math.random() * 0.05));
    t += 0.7 + Math.random() * 0.25;
    waypoints.push({ normX: liftoffX, normY: liftoffY, time: t, wingState: "flap" });

    // 1 or 2 scenic dynamic intermediate arc points
    const numArcs = Math.random() > 0.4 ? 2 : 1;
    for (let k = 0; k < numArcs; k++) {
      const midX = 0.5 + (Math.random() - 0.5) * 0.55;
      const midY = 0.22 + Math.random() * 0.28;
      const wingState = Math.random() > 0.5 ? "glide" : "flap";
      t += 1.2 + Math.random() * 0.7;
      waypoints.push({ normX: Math.max(0.06, Math.min(0.94, midX)), normY: Math.max(0.06, Math.min(0.92, midY)), time: t, wingState });
    }

    // Approach above target flower
    const approachX = Math.max(0.06, Math.min(0.94, targetPerch.normX + (Math.random() - 0.5) * 0.06));
    const approachY = Math.max(0.06, targetPerch.normY - 0.06 - Math.random() * 0.03);
    t += 1.1 + Math.random() * 0.3;
    waypoints.push({ normX: approachX, normY: approachY, time: t, wingState: "hover" });

    // Touchdown
    t += 0.9 + Math.random() * 0.3;
    waypoints.push({ normX: targetPerch.normX, normY: targetPerch.normY, time: t, wingState: "settle" });
  }

  return waypoints;
}

export default function RealButterfly({ fullyBloomed }: RealButterflyProps) {
  const [active, setActive] = useState(false);
  const [isLandedState, setIsLandedState] = useState(false);

  // Direct DOM Element Refs (Eliminates 60-120 React re-renders/sec during flight)
  const butterflyContainerRef = useRef<HTMLDivElement>(null);
  const leftWingRef = useRef<HTMLDivElement>(null);
  const rightWingRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  const waypointsRef = useRef<Waypoint[]>([]);
  const flightStartTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const restTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLandedRef = useRef(false);
  const currentCoordsRef = useRef({ normX: 1.05, normY: 0.1, angle: -25 });
  const currentPerchIndexRef = useRef(0);
  const isPageVisibleRef = useRef(true);

  // Directly apply GPU-accelerated transforms to DOM elements
  const applyDOMTransforms = useCallback((normX: number, normY: number, angle: number, wingAngle: number, shadowOpacity: number) => {
    if (butterflyContainerRef.current) {
      // Use percentage translate3d for pixel-perfect responsiveness across all viewport sizes
      butterflyContainerRef.current.style.transform = `translate3d(${normX * 100}%, ${normY * 100}%, 0) translate3d(-50%, -50%, 0) rotate(${angle.toFixed(1)}deg)`;
    }
    if (leftWingRef.current) {
      leftWingRef.current.style.transform = `rotateY(${wingAngle.toFixed(1)}deg)`;
      (leftWingRef.current.style as CSSStyleDeclaration & { webkitTransform: string }).webkitTransform = `rotateY(${wingAngle.toFixed(1)}deg)`;
    }
    if (rightWingRef.current) {
      rightWingRef.current.style.transform = `rotateY(-${wingAngle.toFixed(1)}deg)`;
      (rightWingRef.current.style as CSSStyleDeclaration & { webkitTransform: string }).webkitTransform = `rotateY(-${wingAngle.toFixed(1)}deg)`;
    }
    if (shadowRef.current) {
      shadowRef.current.style.opacity = shadowOpacity.toFixed(2);
      const shadowScale = Math.max(0.3, 1 - wingAngle / 90);
      shadowRef.current.style.transform = `scale(${shadowScale.toFixed(2)}, 0.6) translate3d(0, 10px, 0)`;
    }
  }, []);

  // Initiate flight to a new flower
  const takeFlightToNewFlower = useCallback(() => {
    if (restTimeoutRef.current) {
      clearTimeout(restTimeoutRef.current);
      restTimeoutRef.current = null;
    }

    let nextIndex = Math.floor(Math.random() * FLOWER_PERCHES.length);
    if (nextIndex === currentPerchIndexRef.current) {
      nextIndex = (nextIndex + 1 + Math.floor(Math.random() * (FLOWER_PERCHES.length - 1))) % FLOWER_PERCHES.length;
    }

    currentPerchIndexRef.current = nextIndex;
    const targetPerch = FLOWER_PERCHES[nextIndex];

    waypointsRef.current = generateProceduralFlight(currentCoordsRef.current, targetPerch, false);
    flightStartTimeRef.current = null;
    isLandedRef.current = false;
    setIsLandedState(false);
  }, []);

  // 1. Initial Calm Delay after Full Bloom (~6 seconds)
  useEffect(() => {
    if (fullyBloomed && !active) {
      const entryDelay = setTimeout(() => {
        const firstPerch = FLOWER_PERCHES[0]; // Centerpiece rose
        currentPerchIndexRef.current = 0;
        waypointsRef.current = generateProceduralFlight({ normX: 1.06, normY: 0.1 }, firstPerch, true);
        flightStartTimeRef.current = null;
        isLandedRef.current = false;
        setIsLandedState(false);
        setActive(true);
      }, 6000);

      return () => clearTimeout(entryDelay);
    }
  }, [fullyBloomed, active]);

  // 2. High-Performance Hardware-Accelerated Animation Loop
  useEffect(() => {
    if (!active) return;

    // Handle Page Visibility changes (Pauses animation when screen is off / tab hidden)
    const handleVisibilityChange = () => {
      isPageVisibleRef.current = !document.hidden;
      if (isPageVisibleRef.current) {
        flightStartTimeRef.current = null; // reset timestamp delta gracefully
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let localAnimId: number;

    const loop = (timestamp: number) => {
      if (!isPageVisibleRef.current) {
        localAnimId = requestAnimationFrame(loop);
        return;
      }

      if (!isLandedRef.current) {
        // === FLIGHT STATE ===
        if (!flightStartTimeRef.current) {
          flightStartTimeRef.current = timestamp;
        }
        const elapsedSec = (timestamp - flightStartTimeRef.current) / 1000;
        const waypoints = waypointsRef.current;
        const totalFlightTime = waypoints.length > 0 ? waypoints[waypoints.length - 1].time : 5.0;

        if (elapsedSec >= totalFlightTime) {
          // Touchdown
          isLandedRef.current = true;
          setIsLandedState(true);

          const currentPerch = FLOWER_PERCHES[currentPerchIndexRef.current];
          const landedCoords = {
            normX: currentPerch.normX,
            normY: currentPerch.normY,
            angle: currentPerch.preferredAngle + (Math.random() - 0.5) * 5,
          };
          currentCoordsRef.current = landedCoords;
          applyDOMTransforms(landedCoords.normX, landedCoords.normY, landedCoords.angle, 25, 0.75);

          // Rest for 4.5s – 9.0s before autonomous takeoff
          const restDuration = Math.random() * 4500 + 4500;
          restTimeoutRef.current = setTimeout(() => {
            takeFlightToNewFlower();
          }, restDuration);

          localAnimId = requestAnimationFrame(loop);
          return;
        }

        const sampled = sampleSpline(waypoints, elapsedSec);
        currentCoordsRef.current = { normX: sampled.normX, normY: sampled.normY, angle: sampled.angle };

        let wingAngle = 22;
        let shadowOpacity = 0.28;

        if (sampled.wingState === "flap") {
          const flapSpeed = 17 + Math.sin(elapsedSec * 4) * 3;
          const flapVal = Math.sin(elapsedSec * flapSpeed);
          wingAngle = Math.max(-8, flapVal * 56 + 22);
          shadowOpacity = 0.32;
        } else if (sampled.wingState === "glide") {
          const glideBank = Math.sin(elapsedSec * 3.2) * 5;
          wingAngle = 11 + glideBank;
          shadowOpacity = 0.25;
        } else if (sampled.wingState === "hover") {
          const hoverVal = Math.sin(elapsedSec * 13);
          wingAngle = Math.max(4, hoverVal * 38 + 20);
          shadowOpacity = 0.35;
        } else if (sampled.wingState === "settle") {
          const settleProgress = Math.min((elapsedSec - (totalFlightTime - 0.8)) / 0.8, 1);
          wingAngle = 18 + Math.sin(settleProgress * Math.PI) * 12 + settleProgress * 8;
          shadowOpacity = 0.4 + settleProgress * 0.35;
        }

        applyDOMTransforms(sampled.normX, sampled.normY, sampled.angle, wingAngle, shadowOpacity);
      } else {
        // === RESTING STATE (Gentle periodic basking/breathing flex) ===
        const t = timestamp / 1000;
        const breathCycle = Math.sin(t * 1.8);
        const isSlowFlex = Math.sin(t * 0.35) > 0.3;
        const flexAmount = isSlowFlex ? Math.max(0, breathCycle) * 16 : Math.max(0, breathCycle) * 4;
        const wingAngle = 23 + flexAmount;

        const { normX, normY, angle } = currentCoordsRef.current;
        applyDOMTransforms(normX, normY, angle, wingAngle, 0.75);
      }

      localAnimId = requestAnimationFrame(loop);
    };

    localAnimId = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(localAnimId);
      if (restTimeoutRef.current) {
        clearTimeout(restTimeoutRef.current);
      }
    };
  }, [active, takeFlightToNewFlower, applyDOMTransforms]);

  const handleButterflyTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (active) {
      takeFlightToNewFlower();
    }
  };

  if (!active) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-20">
      {/* Hardware-Accelerated Native 3D Butterfly Container */}
      <div
        ref={butterflyContainerRef}
        onClick={handleButterflyTap}
        onTouchStart={handleButterflyTap}
        className="absolute top-0 left-0 pointer-events-auto select-none"
        style={{
          width: "clamp(38px, 6.2vw, 56px)",
          height: "clamp(38px, 6.2vw, 56px)",
          willChange: "transform",
          cursor: isLandedState ? "pointer" : "default",
          transformOrigin: "center center",
          WebkitTransformOrigin: "center center",
        }}
      >
        {/* Soft Realistic Cast Shadow on Flower Petals */}
        <div
          ref={shadowRef}
          className="absolute inset-0 bg-black/45 rounded-full blur-[2px] pointer-events-none"
          style={{
            transformOrigin: "center center",
            WebkitTransformOrigin: "center center",
            willChange: "transform, opacity",
          }}
        />

        {/* 3D Kinematic Hinged Wing Articulation Engine */}
        <div
          className="w-full h-full relative"
          style={{
            perspective: "600px",
            WebkitPerspective: "600px",
            perspectiveOrigin: "50% 50%",
            WebkitPerspectiveOrigin: "50% 50%",
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
          }}
        >
          {/* Left Wing (Hinges along 50% vertical midline) */}
          <div
            ref={leftWingRef}
            className="absolute inset-0 pointer-events-none"
            style={{
              transformOrigin: "50% 50%",
              WebkitTransformOrigin: "50% 50%",
              backfaceVisibility: "visible",
              WebkitBackfaceVisibility: "visible",
              willChange: "transform",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/butterfly-wing-left.png"
              alt=""
              className="w-full h-full object-contain pointer-events-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
              draggable={false}
            />
          </div>

          {/* Right Wing (Hinges symmetrically along 50% vertical midline) */}
          <div
            ref={rightWingRef}
            className="absolute inset-0 pointer-events-none"
            style={{
              transformOrigin: "50% 50%",
              WebkitTransformOrigin: "50% 50%",
              backfaceVisibility: "visible",
              WebkitBackfaceVisibility: "visible",
              willChange: "transform",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/butterfly-wing-right.png"
              alt=""
              className="w-full h-full object-contain pointer-events-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
              draggable={false}
            />
          </div>

          {/* Slender Thorax, Abdomen & Antennae Layer */}
          <div className="absolute inset-0 pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/butterfly-body.png"
              alt=""
              className="w-full h-full object-contain pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
              draggable={false}
            />
          </div>

          {/* Generous Invisible Touch Target for Effortless Mobile Discovery */}
          <div
            className="absolute -inset-4 cursor-pointer z-50 rounded-full pointer-events-auto"
            onClick={handleButterflyTap}
            onTouchStart={handleButterflyTap}
            title="A delicate visitor"
          />
        </div>
      </div>
    </div>
  );
}
