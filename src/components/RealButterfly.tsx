"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface RealButterflyProps {
  fullyBloomed: boolean;
}

interface FlowerPerch {
  id: string;
  name: string;
  x: number;
  y: number; // exact landing coordinates on top of flower head
  preferredAngle: number; // natural resting body angle (degrees)
}

// Hand-curated prominent floral landing perches (SVG viewBox 0 0 520 620)
const FLOWER_PERCHES: FlowerPerch[] = [
  { id: "centerpiece-blush-rose", name: "Blush Rose Centerpiece", x: 260, y: 310, preferredAngle: 4 },
  { id: "tall-white-peony", name: "Tall White Center Rose", x: 282, y: 172, preferredAngle: -8 },
  { id: "tall-red-rose-left", name: "Velvety Red Rose Left", x: 228, y: 178, preferredAngle: 12 },
  { id: "canopy-pink-rose-top", name: "Top Canopy Pink Rose", x: 260, y: 78, preferredAngle: -5 },
  { id: "canopy-pink-rose-right", name: "Top Right Pink Rose", x: 365, y: 110, preferredAngle: -18 },
  { id: "canopy-pink-rose-left", name: "Top Left Pink Rose", x: 155, y: 110, preferredAngle: 18 },
  { id: "tall-pink-rose-left", name: "Pink Rose Tall Left", x: 135, y: 166, preferredAngle: 22 },
  { id: "tall-white-rose-right", name: "White Rose Tall Right", x: 388, y: 166, preferredAngle: -20 },
  { id: "foreground-white-rose-right", name: "White Rose Front Right", x: 358, y: 368, preferredAngle: -15 },
  { id: "foreground-red-rose-left", name: "Red Rose Front Left", x: 212, y: 320, preferredAngle: 14 },
  { id: "daisy-mid-left", name: "White Daisy Mid Left", x: 125, y: 280, preferredAngle: 16 },
  { id: "daisy-mid-right", name: "White Daisy Mid Right", x: 395, y: 280, preferredAngle: -16 },
];

interface Waypoint {
  x: number;
  y: number;
  time: number; // accumulated time in seconds
  wingState: "flap" | "glide" | "hover" | "settle";
}

// Catmull-Rom spline interpolation for organic flight trajectories
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
      x: points[0].x,
      y: points[0].y,
      angle: 0,
      wingState: points[0].wingState,
    };
  }
  if (currentTime >= points[n - 1].time) {
    return {
      x: points[n - 1].x,
      y: points[n - 1].y,
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

  const x = catmullRom(p0.x, p1.x, p2.x, p3.x, easedT);
  const y = catmullRom(p0.y, p1.y, p2.y, p3.y, easedT);

  // Lookahead derivative to calculate realistic body banking & tangent orientation
  const dt = 0.035;
  const nextT = Math.min(easedT + dt, 1);
  const nextX = catmullRom(p0.x, p1.x, p2.x, p3.x, nextT);
  const nextY = catmullRom(p0.y, p1.y, p2.y, p3.y, nextT);

  const dx = nextX - x;
  const dy = nextY - y;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90; // +90deg because butterfly image points upwards

  return { x, y, angle, wingState: p1.wingState };
}

// Procedural generator for unique, non-repeating organic flight paths
function generateProceduralFlight(
  startPos: { x: number; y: number },
  targetPerch: FlowerPerch,
  isInitialEntry: boolean = false
): Waypoint[] {
  const waypoints: Waypoint[] = [];
  let t = 0;

  if (isInitialEntry) {
    // Initial majestic entrance from outside viewport
    const startX = Math.random() > 0.5 ? 565 : -45;
    const startY = Math.random() * 80 + 40;
    waypoints.push({ x: startX, y: startY, time: 0, wingState: "flap" });

    // Mid-air exploration curve
    const mid1X = startX > 260 ? 440 + Math.random() * 30 : 80 + Math.random() * 30;
    const mid1Y = 100 + Math.random() * 40;
    t += 1.4;
    waypoints.push({ x: mid1X, y: mid1Y, time: t, wingState: "flap" });

    // Glide across top floral canopy
    const canopyX = 260 + (Math.random() - 0.5) * 100;
    const canopyY = 130 + Math.random() * 30;
    t += 1.3;
    waypoints.push({ x: canopyX, y: canopyY, time: t, wingState: "glide" });

    // Hover or swoop near target flower
    const swoopX = targetPerch.x + (Math.random() - 0.5) * 60;
    const swoopY = targetPerch.y - 45 - Math.random() * 25;
    t += 1.4;
    waypoints.push({ x: swoopX, y: swoopY, time: t, wingState: "hover" });

    // Gentle deceleration into landing
    t += 1.2;
    waypoints.push({ x: targetPerch.x, y: targetPerch.y, time: t, wingState: "settle" });
  } else {
    // Liftoff & inter-flower flight
    waypoints.push({ x: startPos.x, y: startPos.y, time: 0, wingState: "flap" });

    // Quick natural liftoff rise
    const liftoffX = startPos.x + (Math.random() - 0.5) * 35;
    const liftoffY = startPos.y - (35 + Math.random() * 30);
    t += 0.7 + Math.random() * 0.3;
    waypoints.push({ x: liftoffX, y: liftoffY, time: t, wingState: "flap" });

    // 1 or 2 scenic dynamic intermediate arc points
    const numArcs = Math.random() > 0.4 ? 2 : 1;
    for (let k = 0; k < numArcs; k++) {
      const midX = 260 + (Math.random() - 0.5) * 260;
      const midY = 120 + Math.random() * 160;
      const wingState = Math.random() > 0.5 ? "glide" : "flap";
      t += 1.2 + Math.random() * 0.8;
      waypoints.push({ x: midX, y: midY, time: t, wingState });
    }

    // Approach above the target flower
    const approachX = targetPerch.x + (Math.random() - 0.5) * 25;
    const approachY = targetPerch.y - 30 - Math.random() * 20;
    t += 1.1 + Math.random() * 0.4;
    waypoints.push({ x: approachX, y: approachY, time: t, wingState: "hover" });

    // Decelerated gentle touchdown
    t += 0.9 + Math.random() * 0.3;
    waypoints.push({ x: targetPerch.x, y: targetPerch.y, time: t, wingState: "settle" });
  }

  return waypoints;
}

export default function RealButterfly({ fullyBloomed }: RealButterflyProps) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false); // whether butterfly has entered the scene
  const [isLanded, setIsLanded] = useState(false);
  const [currentPerchIndex, setCurrentPerchIndex] = useState(0);

  const [coords, setCoords] = useState<{ x: number; y: number; angle: number }>({
    x: 565,
    y: 70,
    angle: -30,
  });
  const [wingAngle, setWingAngle] = useState(24);

  const waypointsRef = useRef<Waypoint[]>([]);
  const flightStartTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const restTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLandedRef = useRef(false);
  const currentCoordsRef = useRef({ x: 565, y: 70, angle: -30 });
  const currentPerchIndexRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Initial Discovery Delay (5.5s–7.5s calm pause after bouquet completes bloom)
  useEffect(() => {
    if (fullyBloomed && !active) {
      const entryDelay = setTimeout(() => {
        // Pick centerpiece rose as the majestic first landing
        const firstPerch = FLOWER_PERCHES[0];
        currentPerchIndexRef.current = 0;
        setCurrentPerchIndex(0);

        const initialPath = generateProceduralFlight({ x: 565, y: 70 }, firstPerch, true);
        waypointsRef.current = initialPath;
        flightStartTimeRef.current = null;
        isLandedRef.current = false;
        setIsLanded(false);
        setActive(true);
      }, 6200);

      return () => clearTimeout(entryDelay);
    }
  }, [fullyBloomed, active]);

  // Helper function to initiate a new flight to a different flower
  const takeFlightToNewFlower = useCallback(() => {
    if (restTimeoutRef.current) {
      clearTimeout(restTimeoutRef.current);
      restTimeoutRef.current = null;
    }

    // Pick a new, different flower perch
    let nextIndex = Math.floor(Math.random() * FLOWER_PERCHES.length);
    if (nextIndex === currentPerchIndexRef.current) {
      nextIndex = (nextIndex + 1 + Math.floor(Math.random() * (FLOWER_PERCHES.length - 1))) % FLOWER_PERCHES.length;
    }

    currentPerchIndexRef.current = nextIndex;
    setCurrentPerchIndex(nextIndex);
    const targetPerch = FLOWER_PERCHES[nextIndex];

    const newPath = generateProceduralFlight(currentCoordsRef.current, targetPerch, false);
    waypointsRef.current = newPath;
    flightStartTimeRef.current = null;
    isLandedRef.current = false;
    setIsLanded(false);
  }, []);

  // 2. Flight Kinematics & Wing Motion Loop
  useEffect(() => {
    if (!active) return;

    let localAnimId: number;

    const loop = (timestamp: number) => {
      if (!isLandedRef.current) {
        // === FLIGHT STATE ===
        if (!flightStartTimeRef.current) {
          flightStartTimeRef.current = timestamp;
        }
        const elapsedSec = (timestamp - flightStartTimeRef.current) / 1000;
        const waypoints = waypointsRef.current;
        const totalFlightTime = waypoints.length > 0 ? waypoints[waypoints.length - 1].time : 5.0;

        if (elapsedSec >= totalFlightTime) {
          // --- TOUCHDOWN ON FLOWER ---
          isLandedRef.current = true;
          setIsLanded(true);

          const currentPerch = FLOWER_PERCHES[currentPerchIndexRef.current];
          const landedCoords = {
            x: currentPerch.x,
            y: currentPerch.y,
            angle: currentPerch.preferredAngle + (Math.random() - 0.5) * 6,
          };
          currentCoordsRef.current = landedCoords;
          setCoords(landedCoords);
          setWingAngle(24 + Math.random() * 6);

          // Schedule peaceful rest period (4.5s – 9.0s randomized) before next flight
          const restDuration = Math.random() * 4500 + 4500;
          restTimeoutRef.current = setTimeout(() => {
            takeFlightToNewFlower();
          }, restDuration);

          localAnimId = requestAnimationFrame(loop);
          return;
        }

        // --- IN-FLIGHT SPLINE SAMPLING ---
        const sampled = sampleSpline(waypoints, elapsedSec);
        currentCoordsRef.current = { x: sampled.x, y: sampled.y, angle: sampled.angle };
        setCoords(currentCoordsRef.current);

        // Biomechanical wing articulation
        if (sampled.wingState === "flap") {
          const flapSpeed = 17 + Math.sin(elapsedSec * 4) * 3;
          const flapVal = Math.sin(elapsedSec * flapSpeed);
          setWingAngle(Math.max(-8, flapVal * 56 + 22));
        } else if (sampled.wingState === "glide") {
          // Serene aerodynamic gliding with subtle air current bank
          const glideBank = Math.sin(elapsedSec * 3.2) * 5;
          setWingAngle(11 + glideBank);
        } else if (sampled.wingState === "hover") {
          const hoverVal = Math.sin(elapsedSec * 13);
          setWingAngle(Math.max(4, hoverVal * 38 + 20));
        } else if (sampled.wingState === "settle") {
          const settleProgress = Math.min((elapsedSec - (totalFlightTime - 0.8)) / 0.8, 1);
          const landingTargetAngle = 26;
          setWingAngle(18 + Math.sin(settleProgress * Math.PI) * 12 + settleProgress * (landingTargetAngle - 18));
        }
      } else {
        // === LANDED / RESTING STATE (Gentle biological breathing & occasional basking flex) ===
        const t = timestamp / 1000;
        const breathCycle = Math.sin(t * 1.8);
        const isSlowFlex = Math.sin(t * 0.35) > 0.3;
        const flexAmount = isSlowFlex ? Math.max(0, breathCycle) * 16 : Math.max(0, breathCycle) * 4;

        setWingAngle(23 + flexAmount);
      }

      localAnimId = requestAnimationFrame(loop);
    };

    localAnimId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(localAnimId);
      if (restTimeoutRef.current) {
        clearTimeout(restTimeoutRef.current);
      }
    };
  }, [active, takeFlightToNewFlower]);

  // 3. User Interaction on Butterfly (Reacts organically and takes flight to another flower)
  const handleButterflyTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); // preserve background stardust tap ripples
    if (active) {
      takeFlightToNewFlower();
    }
  };

  if (!mounted || !active) {
    return null;
  }

  // Realistic physical wingspan in SVG coordinate scale (~52px)
  const butterflySize = 52;

  return (
    <g
      transform={`translate(${coords.x}, ${coords.y}) rotate(${coords.angle})`}
      className="pointer-events-auto select-none"
      onClick={handleButterflyTap}
      onTouchStart={handleButterflyTap}
      style={{
        cursor: isLanded ? "pointer" : "default",
        willChange: "transform",
      }}
    >
      {/* Soft realistic cast shadow on the flower beneath */}
      <ellipse
        cx="0"
        cy="7"
        rx={butterflySize * 0.32 * Math.max(0.28, 1 - wingAngle / 90)}
        ry={butterflySize * 0.16}
        fill="rgba(0, 0, 0, 0.44)"
        filter="blur(2px)"
        opacity={isLanded ? 0.76 : 0.28}
        className="pointer-events-none"
      />

      {/* 3D Realistic Butterfly Body and Separated Kinematic Wings */}
      <foreignObject
        x={-butterflySize / 2}
        y={-butterflySize / 2}
        width={butterflySize}
        height={butterflySize}
        className="overflow-visible"
      >
        <div
          className="w-full h-full relative"
          style={{
            perspective: "600px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          {/* Left Wing (Rotates along vertical midline 50% 50%) */}
          <div
            className="absolute inset-0"
            style={{
              transformOrigin: "50% 50%",
              transform: `rotateY(${wingAngle}deg)`,
              backfaceVisibility: "visible",
              transition: isLanded ? "transform 0.18s ease-out" : "none",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/butterfly-wing-left.png"
              alt=""
              className="w-full h-full object-contain pointer-events-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]"
              draggable={false}
            />
          </div>

          {/* Right Wing (Rotates symmetrically along vertical midline 50% 50%) */}
          <div
            className="absolute inset-0"
            style={{
              transformOrigin: "50% 50%",
              transform: `rotateY(-${wingAngle}deg)`,
              backfaceVisibility: "visible",
              transition: isLanded ? "transform 0.18s ease-out" : "none",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/butterfly-wing-right.png"
              alt=""
              className="w-full h-full object-contain pointer-events-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]"
              draggable={false}
            />
          </div>

          {/* Slender Thorax, Abdomen & Delicate Antennae */}
          <div className="absolute inset-0 pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/butterfly-body.png"
              alt=""
              className="w-full h-full object-contain pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]"
              draggable={false}
            />
          </div>

          {/* Invisible expanded tap hit target for smooth mobile discovery */}
          <div
            className="absolute -inset-6 cursor-pointer z-50 rounded-full pointer-events-auto"
            onClick={handleButterflyTap}
            onTouchStart={handleButterflyTap}
            title="A delicate visitor"
          />
        </div>
      </foreignObject>
    </g>
  );
}
