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
  { id: "canopy-pink-rose-top", name: "Top Canopy Pink Rose", normX: 260 / 520, normY: 85 / 620, preferredAngle: -4 },
  { id: "canopy-pink-rose-right", name: "Top Right Pink Rose", normX: 355 / 520, normY: 115 / 620, preferredAngle: -16 },
  { id: "canopy-pink-rose-left", name: "Top Left Pink Rose", normX: 165 / 520, normY: 115 / 620, preferredAngle: 16 },
  { id: "tall-pink-rose-left", name: "Pink Rose Tall Left", normX: 145 / 520, normY: 170 / 620, preferredAngle: 20 },
  { id: "tall-white-rose-right", name: "White Rose Tall Right", normX: 375 / 520, normY: 170 / 620, preferredAngle: -18 },
  { id: "foreground-white-rose-right", name: "White Rose Front Right", normX: 350 / 520, normY: 360 / 620, preferredAngle: -14 },
  { id: "foreground-red-rose-left", name: "Red Rose Front Left", normX: 215 / 520, normY: 320 / 620, preferredAngle: 12 },
  { id: "daisy-mid-left", name: "White Daisy Mid Left", normX: 135 / 520, normY: 275 / 620, preferredAngle: 15 },
  { id: "daisy-mid-right", name: "White Daisy Mid Right", normX: 385 / 520, normY: 275 / 620, preferredAngle: -15 },
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

// Procedural organic flight generator with strict mobile viewport safety
function generateProceduralFlight(
  startPos: { normX: number; normY: number },
  targetPerch: FlowerPerch,
  isInitialEntry = false,
  isPlayfulReaction = false
): Waypoint[] {
  const waypoints: Waypoint[] = [];
  let t = 0;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const minX = isMobile ? 0.12 : 0.06;
  const maxX = isMobile ? 0.88 : 0.94;
  const minY = isMobile ? 0.08 : 0.06;
  const maxY = isMobile ? 0.70 : 0.85;

  const clampX = (val: number) => Math.max(minX, Math.min(maxX, val));
  const clampY = (val: number) => Math.max(minY, Math.min(maxY, val));

  if (isPlayfulReaction) {
    // Playful quick best-friend reaction loop: startles and loops away, then lands
    waypoints.push({ normX: clampX(startPos.normX), normY: clampY(startPos.normY), time: 0, wingState: "flap" });

    // Quick surprised dart upward-left or upward-right
    const dartDirection = Math.random() > 0.5 ? 1 : -1;
    const dartX = clampX(startPos.normX + dartDirection * (isMobile ? 0.18 : 0.28));
    const dartY = clampY(startPos.normY - (isMobile ? 0.16 : 0.24));
    t += 0.45;
    waypoints.push({ normX: dartX, normY: dartY, time: t, wingState: "flap" });

    // Playful loop arc across upper canopy
    const loopX = clampX(0.5 - dartDirection * (isMobile ? 0.15 : 0.22));
    const loopY = clampY(0.12 + Math.random() * 0.08);
    t += 0.65;
    waypoints.push({ normX: loopX, normY: loopY, time: t, wingState: "glide" });

    // Hover above target flower
    const hoverX = clampX(targetPerch.normX + (Math.random() - 0.5) * 0.06);
    const hoverY = clampY(targetPerch.normY - 0.07);
    t += 0.75;
    waypoints.push({ normX: hoverX, normY: hoverY, time: t, wingState: "hover" });

    // Touchdown
    t += 0.65;
    waypoints.push({ normX: targetPerch.normX, normY: targetPerch.normY, time: t, wingState: "settle" });
  } else if (isInitialEntry) {
    // Majestic entrance
    const startX = isMobile
      ? (Math.random() > 0.5 ? 0.92 : 0.08)
      : (Math.random() > 0.5 ? 1.05 : -0.05);
    const startY = 0.06 + Math.random() * 0.08;
    waypoints.push({ normX: startX, normY: startY, time: 0, wingState: "flap" });

    // Mid-air exploration curve within safe stage area
    const mid1X = startX > 0.5 ? (isMobile ? 0.78 : 0.82) : (isMobile ? 0.22 : 0.18);
    const mid1Y = 0.16 + Math.random() * 0.08;
    t += 1.3;
    waypoints.push({ normX: clampX(mid1X), normY: clampY(mid1Y), time: t, wingState: "flap" });

    // Glide across top floral canopy
    const canopyX = 0.5 + (Math.random() - 0.5) * (isMobile ? 0.16 : 0.22);
    const canopyY = 0.18 + Math.random() * 0.06;
    t += 1.2;
    waypoints.push({ normX: clampX(canopyX), normY: clampY(canopyY), time: t, wingState: "glide" });

    // Hover above target flower
    const swoopX = targetPerch.normX + (Math.random() - 0.5) * 0.08;
    const swoopY = targetPerch.normY - 0.08;
    t += 1.2;
    waypoints.push({ normX: clampX(swoopX), normY: clampY(swoopY), time: t, wingState: "hover" });

    // Decelerated touchdown
    t += 1.0;
    waypoints.push({ normX: targetPerch.normX, normY: targetPerch.normY, time: t, wingState: "settle" });
  } else {
    // Liftoff & flower-to-flower flight
    waypoints.push({ normX: clampX(startPos.normX), normY: clampY(startPos.normY), time: 0, wingState: "flap" });

    // Quick natural liftoff rise
    const liftoffX = startPos.normX + (Math.random() - 0.5) * (isMobile ? 0.05 : 0.08);
    const liftoffY = startPos.normY - (0.06 + Math.random() * 0.04);
    t += 0.65 + Math.random() * 0.2;
    waypoints.push({ normX: clampX(liftoffX), normY: clampY(liftoffY), time: t, wingState: "flap" });

    // 1 scenic dynamic intermediate arc point (kept short & controlled for mobile)
    const midX = 0.5 + (Math.random() - 0.5) * (isMobile ? 0.38 : 0.52);
    const midY = 0.18 + Math.random() * (isMobile ? 0.20 : 0.26);
    const wingState = Math.random() > 0.5 ? "glide" : "flap";
    t += 1.1 + Math.random() * 0.5;
    waypoints.push({ normX: clampX(midX), normY: clampY(midY), time: t, wingState });

    // Approach above target flower
    const approachX = targetPerch.normX + (Math.random() - 0.5) * 0.05;
    const approachY = targetPerch.normY - 0.06;
    t += 1.0 + Math.random() * 0.25;
    waypoints.push({ normX: clampX(approachX), normY: clampY(approachY), time: t, wingState: "hover" });

    // Touchdown
    t += 0.85 + Math.random() * 0.25;
    waypoints.push({ normX: targetPerch.normX, normY: targetPerch.normY, time: t, wingState: "settle" });
  }

  return waypoints;
}

export default function RealButterfly({ fullyBloomed }: RealButterflyProps) {
  const [active, setActive] = useState(false);
  const [isLandedState, setIsLandedState] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Direct DOM Element Refs (Eliminates 60-120 React re-renders/sec during flight)
  const butterflyContainerRef = useRef<HTMLDivElement>(null);
  const leftWingRef = useRef<HTMLDivElement>(null);
  const rightWingRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  const waypointsRef = useRef<Waypoint[]>([]);
  const flightStartTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const restTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLandedRef = useRef(false);
  const currentCoordsRef = useRef({ normX: 0.85, normY: 0.1, angle: -25 });
  const currentPerchIndexRef = useRef(0);
  const isPageVisibleRef = useRef(true);
  const hasInitializedRef = useRef(false);

  // Directly apply GPU-accelerated transforms to DOM elements
  const applyDOMTransforms = useCallback((normX: number, normY: number, angle: number, wingAngle: number, shadowOpacity: number) => {
    if (butterflyContainerRef.current) {
      // Use percentage translate3d for pixel-perfect responsiveness across all viewport sizes
      butterflyContainerRef.current.style.transform = `translate3d(${normX * 100}%, ${normY * 100}%, 0) translate3d(-50%, -50%, 0) rotate(${angle.toFixed(1)}deg)`;
      (butterflyContainerRef.current.style as CSSStyleDeclaration & { webkitTransform: string }).webkitTransform = `translate3d(${normX * 100}%, ${normY * 100}%, 0) translate3d(-50%, -50%, 0) rotate(${angle.toFixed(1)}deg)`;
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
      shadowRef.current.style.transform = `scale(${shadowScale.toFixed(2)}, 0.6) translate3d(0, 8px, 0)`;
      (shadowRef.current.style as CSSStyleDeclaration & { webkitTransform: string }).webkitTransform = `scale(${shadowScale.toFixed(2)}, 0.6) translate3d(0, 8px, 0)`;
    }
  }, []);

  // Initiate flight to a new flower (autonomous or triggered)
  const takeFlightToNewFlower = useCallback((isPlayful = false) => {
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

    waypointsRef.current = generateProceduralFlight(currentCoordsRef.current, targetPerch, false, isPlayful);
    flightStartTimeRef.current = null;
    isLandedRef.current = false;
    setIsLandedState(false);
  }, []);

  // 1. Initial Calm Delay after Full Bloom (~5.5 seconds)
  useEffect(() => {
    if (fullyBloomed && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const entryDelay = setTimeout(() => {
        const firstPerch = FLOWER_PERCHES[0]; // Centerpiece rose
        currentPerchIndexRef.current = 0;
        waypointsRef.current = generateProceduralFlight({ normX: 0.88, normY: 0.08 }, firstPerch, true, false);
        flightStartTimeRef.current = null;
        isLandedRef.current = false;
        setIsLandedState(false);
        setActive(true);
      }, 5500);

      return () => clearTimeout(entryDelay);
    }
  }, [fullyBloomed]);

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
        const totalFlightTime = waypoints.length > 0 ? waypoints[waypoints.length - 1].time : 4.5;

        if (elapsedSec >= totalFlightTime) {
          // Touchdown
          isLandedRef.current = true;
          setIsLandedState(true);

          const currentPerch = FLOWER_PERCHES[currentPerchIndexRef.current];
          const landedCoords = {
            normX: currentPerch.normX,
            normY: currentPerch.normY,
            angle: currentPerch.preferredAngle + (Math.random() - 0.5) * 4,
          };
          currentCoordsRef.current = landedCoords;
          applyDOMTransforms(landedCoords.normX, landedCoords.normY, landedCoords.angle, 24, 0.75);

          // Rest for 4.5s – 8.5s before autonomous takeoff
          const restDuration = Math.random() * 4000 + 4500;
          restTimeoutRef.current = setTimeout(() => {
            takeFlightToNewFlower(false);
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
          wingAngle = Math.max(-8, flapVal * 54 + 22);
          shadowOpacity = 0.32;
        } else if (sampled.wingState === "glide") {
          const glideBank = Math.sin(elapsedSec * 3.2) * 5;
          wingAngle = 10 + glideBank;
          shadowOpacity = 0.25;
        } else if (sampled.wingState === "hover") {
          const hoverVal = Math.sin(elapsedSec * 13);
          wingAngle = Math.max(4, hoverVal * 36 + 20);
          shadowOpacity = 0.35;
        } else if (sampled.wingState === "settle") {
          const settleProgress = Math.min((elapsedSec - (totalFlightTime - 0.75)) / 0.75, 1);
          wingAngle = 18 + Math.sin(settleProgress * Math.PI) * 10 + settleProgress * 6;
          shadowOpacity = 0.4 + settleProgress * 0.35;
        }

        applyDOMTransforms(sampled.normX, sampled.normY, sampled.angle, wingAngle, shadowOpacity);
      } else {
        // === RESTING STATE (Gentle periodic basking/breathing flex) ===
        const t = timestamp / 1000;
        const breathCycle = Math.sin(t * 1.8);
        const isSlowFlex = Math.sin(t * 0.35) > 0.3;
        const flexAmount = isSlowFlex ? Math.max(0, breathCycle) * 14 : Math.max(0, breathCycle) * 3.5;
        const wingAngle = 22 + flexAmount;

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
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, [active, takeFlightToNewFlower, applyDOMTransforms]);

  // Tiny Best-Friend Interaction Handler (Playful reaction + "Hey! 😂" message)
  const handleButterflyTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!active) return;

    setHasInteracted(true);
    setShowMessage(true);

    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setShowMessage(false);
    }, 1800);

    // Butterfly startles and takes off in a playful unexpected direction
    takeFlightToNewFlower(true);
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
        className="absolute top-0 left-0 pointer-events-auto select-none touch-manipulation"
        style={{
          width: "clamp(32px, 5.5vw, 52px)",
          height: "clamp(32px, 5.5vw, 52px)",
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
            className="absolute -inset-5 cursor-pointer z-50 rounded-full pointer-events-auto touch-manipulation"
            onClick={handleButterflyTap}
            onTouchStart={handleButterflyTap}
            title="Tap the butterfly 🦋"
          />

          {/* Tiny Floating Playful Best-Friend Reaction Badge */}
          {showMessage && (
            <div
              className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#121217]/95 border border-rose-400/40 text-rose-200 text-[11px] font-medium rounded-full shadow-lg pointer-events-none whitespace-nowrap animate-bounce"
              style={{
                filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.7))",
              }}
            >
              Hey! 😂
            </div>
          )}
        </div>
      </div>

      {/* Subtle, elegant prompt hint for best friend: "Tap the butterfly 🦋" */}
      {isLandedState && !hasInteracted && (
        <div className="absolute -bottom-8 sm:-bottom-10 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-700 opacity-80 hover:opacity-100">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm text-[11px] sm:text-xs text-white/50 tracking-wide">
            <span>Tap the butterfly 🦋</span>
          </div>
        </div>
      )}
    </div>
  );
}
