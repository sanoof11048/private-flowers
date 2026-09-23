"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface RealButterflyProps {
  fullyBloomed: boolean;
}

interface FlowerPerch {
  id: string;
  name: string;
  // Normalized stage coordinates (0 to 1 range across bouquet SVG viewBox 0 0 520 620)
  normX: number;
  normY: number;
  preferredAngle: number; // Resting rotation angle (degrees)
}

// Hand-calibrated flower perches mapped from florist arrangement
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
  x: number;
  y: number;
  time: number; // accumulated time in seconds
  wingState: "flap" | "glide" | "hover" | "settle";
}

interface ViewportBounds {
  width: number;
  height: number;
  safeLeft: number;
  safeRight: number;
  safeTop: number;
  safeBottom: number;
  isMobile: boolean;
}

// Safely computes real visual flight bounds accounting for mobile toolbars & safe areas
function getViewportBounds(): ViewportBounds {
  let width = 390;
  let height = 844;
  let offsetLeft = 0;
  let offsetTop = 0;

  if (typeof window !== "undefined") {
    if (window.visualViewport) {
      width = window.visualViewport.width;
      height = window.visualViewport.height;
      offsetLeft = window.visualViewport.offsetLeft;
      offsetTop = window.visualViewport.offsetTop;
    } else {
      width = window.innerWidth || document.documentElement.clientWidth || 390;
      height = window.innerHeight || document.documentElement.clientHeight || 844;
    }
  }

  const isMobile = width < 640;
  // Margins tailored to prevent clipping against dynamic toolbars / status bars
  const marginX = isMobile ? Math.max(18, width * 0.05) : Math.max(32, width * 0.04);
  const marginTop = isMobile ? Math.max(28, height * 0.06) : Math.max(40, height * 0.05);
  const marginBottom = isMobile ? Math.max(36, height * 0.08) : Math.max(44, height * 0.06);

  return {
    width,
    height,
    safeLeft: offsetLeft + marginX,
    safeRight: offsetLeft + width - marginX,
    safeTop: offsetTop + marginTop,
    safeBottom: offsetTop + height - marginBottom,
    isMobile,
  };
}

// Dynamically calculates the exact screen pixel position of a flower from the bouquet DOM
function getFlowerScreenPosition(
  perch: FlowerPerch,
  bounds: ViewportBounds
): { x: number; y: number; isVisible: boolean } {
  if (typeof document !== "undefined") {
    const svg = document.querySelector('svg[viewBox="0 0 520 620"]') as SVGSVGElement | null;
    if (svg) {
      const rect = svg.getBoundingClientRect();
      const x = rect.left + perch.normX * rect.width;
      const y = rect.top + perch.normY * rect.height;

      const isVisible =
        x >= bounds.safeLeft &&
        x <= bounds.safeRight &&
        y >= bounds.safeTop &&
        y <= bounds.safeBottom;

      return {
        x: Math.max(bounds.safeLeft, Math.min(bounds.safeRight, x)),
        y: Math.max(bounds.safeTop, Math.min(bounds.safeBottom, y)),
        isVisible,
      };
    }
  }

  // Fallback to center-screen bouquet area
  const fallbackX = bounds.safeLeft + (bounds.safeRight - bounds.safeLeft) * perch.normX;
  const fallbackY = bounds.safeTop + (bounds.safeBottom - bounds.safeTop) * (0.3 + perch.normY * 0.5);
  return { x: fallbackX, y: fallbackY, isVisible: true };
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

  // Lookahead derivative for natural flight tangent alignment & banking
  const dt = 0.035;
  const nextT = Math.min(easedT + dt, 1);
  const nextX = catmullRom(p0.x, p1.x, p2.x, p3.x, nextT);
  const nextY = catmullRom(p0.y, p1.y, p2.y, p3.y, nextT);

  const dx = nextX - x;
  const dy = nextY - y;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;

  return { x, y, angle, wingState: p1.wingState };
}

// Procedural organic flight generator with strict mobile viewport safety
function generateProceduralFlight(
  startPos: { x: number; y: number },
  targetPerchPos: { x: number; y: number },
  bounds: ViewportBounds,
  isInitialEntry = false,
  isPlayfulReaction = false
): Waypoint[] {
  const waypoints: Waypoint[] = [];
  let t = 0;

  const clampX = (val: number) => Math.max(bounds.safeLeft, Math.min(bounds.safeRight, val));
  const clampY = (val: number) => Math.max(bounds.safeTop, Math.min(bounds.safeBottom, val));

  const targetX = clampX(targetPerchPos.x);
  const targetY = clampY(targetPerchPos.y);

  if (isPlayfulReaction) {
    // Quick surprised dart upward and away, joyful loop arc, then descent onto target flower
    waypoints.push({ x: clampX(startPos.x), y: clampY(startPos.y), time: 0, wingState: "flap" });

    const dartDir = Math.random() > 0.5 ? 1 : -1;
    const dartDistX = bounds.isMobile ? bounds.width * 0.28 : bounds.width * 0.25;
    const dartDistY = bounds.isMobile ? bounds.height * 0.22 : bounds.height * 0.26;

    const dartX = clampX(startPos.x + dartDir * dartDistX);
    const dartY = clampY(startPos.y - dartDistY);
    t += 0.5;
    waypoints.push({ x: dartX, y: dartY, time: t, wingState: "flap" });

    // Wide high canopy loop
    const loopX = clampX(bounds.safeLeft + (bounds.safeRight - bounds.safeLeft) * (0.5 - dartDir * 0.25));
    const loopY = clampY(bounds.safeTop + (bounds.safeBottom - bounds.safeTop) * (0.12 + Math.random() * 0.1));
    t += 0.7;
    waypoints.push({ x: loopX, y: loopY, time: t, wingState: "glide" });

    // Hover above target flower
    const hoverX = clampX(targetX + (Math.random() - 0.5) * (bounds.isMobile ? 24 : 40));
    const hoverY = clampY(targetY - (bounds.isMobile ? 32 : 45));
    t += 0.8;
    waypoints.push({ x: hoverX, y: hoverY, time: t, wingState: "hover" });

    // Touchdown
    t += 0.7;
    waypoints.push({ x: targetX, y: targetY, time: t, wingState: "settle" });
  } else if (isInitialEntry) {
    // Majestic entrance from screen edge into bouquet
    const fromRight = Math.random() > 0.5;
    const startX = fromRight ? bounds.safeRight : bounds.safeLeft;
    const startY = bounds.safeTop + (bounds.safeBottom - bounds.safeTop) * (0.05 + Math.random() * 0.1);
    waypoints.push({ x: startX, y: startY, time: 0, wingState: "flap" });

    // Scenic mid-air exploration curve
    const mid1X = clampX(bounds.safeLeft + (bounds.safeRight - bounds.safeLeft) * (fromRight ? 0.72 : 0.28));
    const mid1Y = bounds.safeTop + (bounds.safeBottom - bounds.safeTop) * (0.18 + Math.random() * 0.12);
    t += 1.3;
    waypoints.push({ x: mid1X, y: mid1Y, time: t, wingState: "flap" });

    // Glide across bouquet canopy
    const canopyX = clampX(bounds.safeLeft + (bounds.safeRight - bounds.safeLeft) * (0.5 + (Math.random() - 0.5) * 0.3));
    const canopyY = bounds.safeTop + (bounds.safeBottom - bounds.safeTop) * (0.2 + Math.random() * 0.1);
    t += 1.2;
    waypoints.push({ x: canopyX, y: canopyY, time: t, wingState: "glide" });

    // Hover above centerpiece
    const swoopX = clampX(targetX + (Math.random() - 0.5) * 30);
    const swoopY = clampY(targetY - 35);
    t += 1.2;
    waypoints.push({ x: swoopX, y: swoopY, time: t, wingState: "hover" });

    // Touchdown
    t += 1.0;
    waypoints.push({ x: targetX, y: targetY, time: t, wingState: "settle" });
  } else {
    // Organic liftoff and flower-to-flower flight
    waypoints.push({ x: clampX(startPos.x), y: clampY(startPos.y), time: 0, wingState: "flap" });

    // Natural liftoff rise
    const liftoffX = clampX(startPos.x + (Math.random() - 0.5) * 40);
    const liftoffY = clampY(startPos.y - (30 + Math.random() * 30));
    t += 0.7;
    waypoints.push({ x: liftoffX, y: liftoffY, time: t, wingState: "flap" });

    // Dynamic sweeping curve across screen / floral arrangement
    const midX = clampX(bounds.safeLeft + (bounds.safeRight - bounds.safeLeft) * (0.2 + Math.random() * 0.6));
    const midY = clampY(bounds.safeTop + (bounds.safeBottom - bounds.safeTop) * (0.15 + Math.random() * 0.35));
    const wingState = Math.random() > 0.45 ? "glide" : "flap";
    t += 1.2 + Math.random() * 0.4;
    waypoints.push({ x: midX, y: midY, time: t, wingState });

    // Approach and hover above destination flower
    const approachX = clampX(targetX + (Math.random() - 0.5) * 24);
    const approachY = clampY(targetY - 28);
    t += 1.0 + Math.random() * 0.3;
    waypoints.push({ x: approachX, y: approachY, time: t, wingState: "hover" });

    // Decelerated gentle touchdown
    t += 0.85 + Math.random() * 0.25;
    waypoints.push({ x: targetX, y: targetY, time: t, wingState: "settle" });
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
  const currentCoordsRef = useRef({ x: 200, y: 150, angle: -20 });
  const currentPerchIndexRef = useRef(0);
  const isPageVisibleRef = useRef(true);
  const hasInitializedRef = useRef(false);

  // Directly apply GPU-accelerated transforms in exact screen pixels
  const applyDOMTransforms = useCallback(
    (x: number, y: number, angle: number, wingAngle: number, shadowOpacity: number) => {
      if (butterflyContainerRef.current) {
        butterflyContainerRef.current.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate3d(-50%, -50%, 0) rotate(${angle.toFixed(1)}deg)`;
        (butterflyContainerRef.current.style as CSSStyleDeclaration & { webkitTransform: string }).webkitTransform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate3d(-50%, -50%, 0) rotate(${angle.toFixed(1)}deg)`;
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
    },
    []
  );

  // Initiate flight to a new flower (autonomous or triggered)
  const takeFlightToNewFlower = useCallback((isPlayful = false) => {
    if (restTimeoutRef.current) {
      clearTimeout(restTimeoutRef.current);
      restTimeoutRef.current = null;
    }

    const bounds = getViewportBounds();

    // Find all flowers currently visible inside the viewport bounds
    const visiblePerchCandidates: { perch: FlowerPerch; index: number; screenPos: { x: number; y: number } }[] = [];
    FLOWER_PERCHES.forEach((perch, idx) => {
      const pos = getFlowerScreenPosition(perch, bounds);
      if (pos.isVisible) {
        visiblePerchCandidates.push({ perch, index: idx, screenPos: pos });
      }
    });

    let chosenCandidate = visiblePerchCandidates[0];
    if (visiblePerchCandidates.length > 1) {
      const otherCandidates = visiblePerchCandidates.filter((c) => c.index !== currentPerchIndexRef.current);
      const pool = otherCandidates.length > 0 ? otherCandidates : visiblePerchCandidates;
      chosenCandidate = pool[Math.floor(Math.random() * pool.length)];
    } else if (!chosenCandidate) {
      // If no flower detected inside bounds, fallback to centerpiece
      const firstPerch = FLOWER_PERCHES[0];
      chosenCandidate = {
        perch: firstPerch,
        index: 0,
        screenPos: getFlowerScreenPosition(firstPerch, bounds),
      };
    }

    currentPerchIndexRef.current = chosenCandidate.index;
    waypointsRef.current = generateProceduralFlight(
      currentCoordsRef.current,
      chosenCandidate.screenPos,
      bounds,
      false,
      isPlayful
    );
    flightStartTimeRef.current = null;
    isLandedRef.current = false;
    setIsLandedState(false);
  }, []);

  // 1. Initial Calm Delay after Full Bloom (~5.5 seconds)
  useEffect(() => {
    if (fullyBloomed && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const entryDelay = setTimeout(() => {
        const bounds = getViewportBounds();
        const firstPerch = FLOWER_PERCHES[0]; // Centerpiece rose
        currentPerchIndexRef.current = 0;
        const targetPos = getFlowerScreenPosition(firstPerch, bounds);

        const startX = bounds.safeRight - 20;
        const startY = bounds.safeTop + 40;
        currentCoordsRef.current = { x: startX, y: startY, angle: -25 };

        waypointsRef.current = generateProceduralFlight(
          { x: startX, y: startY },
          targetPos,
          bounds,
          true,
          false
        );
        flightStartTimeRef.current = null;
        isLandedRef.current = false;
        setIsLandedState(false);
        setActive(true);
      }, 5500);

      return () => clearTimeout(entryDelay);
    }
  }, [fullyBloomed]);

  // 2. High-Performance Hardware-Accelerated Animation Loop & Viewport Event Listeners
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

    // Handle viewport resize & orientation changes
    const handleViewportChange = () => {
      const bounds = getViewportBounds();
      // Clamp current position if out of bounds after orientation shift
      currentCoordsRef.current = {
        x: Math.max(bounds.safeLeft, Math.min(bounds.safeRight, currentCoordsRef.current.x)),
        y: Math.max(bounds.safeTop, Math.min(bounds.safeBottom, currentCoordsRef.current.y)),
        angle: currentCoordsRef.current.angle,
      };
      if (isLandedRef.current) {
        const currentPerch = FLOWER_PERCHES[currentPerchIndexRef.current];
        const targetPos = getFlowerScreenPosition(currentPerch, bounds);
        currentCoordsRef.current = {
          x: targetPos.x,
          y: targetPos.y,
          angle: currentPerch.preferredAngle,
        };
        applyDOMTransforms(targetPos.x, targetPos.y, currentPerch.preferredAngle, 22, 0.75);
      }
    };

    window.addEventListener("resize", handleViewportChange, { passive: true });
    window.addEventListener("orientationchange", handleViewportChange, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange, { passive: true });
    }

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
          // Touchdown on flower
          isLandedRef.current = true;
          setIsLandedState(true);

          const bounds = getViewportBounds();
          const currentPerch = FLOWER_PERCHES[currentPerchIndexRef.current];
          const landedPos = getFlowerScreenPosition(currentPerch, bounds);
          const landedCoords = {
            x: landedPos.x,
            y: landedPos.y,
            angle: currentPerch.preferredAngle + (Math.random() - 0.5) * 4,
          };
          currentCoordsRef.current = landedCoords;
          applyDOMTransforms(landedCoords.x, landedCoords.y, landedCoords.angle, 22, 0.75);

          // Rest for 4.5s – 8.5s before autonomous takeoff
          const restDuration = Math.random() * 4000 + 4500;
          restTimeoutRef.current = setTimeout(() => {
            takeFlightToNewFlower(false);
          }, restDuration);

          localAnimId = requestAnimationFrame(loop);
          return;
        }

        const sampled = sampleSpline(waypoints, elapsedSec);
        currentCoordsRef.current = { x: sampled.x, y: sampled.y, angle: sampled.angle };

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

        applyDOMTransforms(sampled.x, sampled.y, sampled.angle, wingAngle, shadowOpacity);
      } else {
        // === RESTING STATE (Gentle periodic basking/breathing flex) ===
        const t = timestamp / 1000;
        const breathCycle = Math.sin(t * 1.8);
        const isSlowFlex = Math.sin(t * 0.35) > 0.3;
        const flexAmount = isSlowFlex ? Math.max(0, breathCycle) * 14 : Math.max(0, breathCycle) * 3.5;
        const wingAngle = 22 + flexAmount;

        const { x, y, angle } = currentCoordsRef.current;
        applyDOMTransforms(x, y, angle, wingAngle, 0.75);
      }

      localAnimId = requestAnimationFrame(loop);
    };

    localAnimId = requestAnimationFrame(loop);
    animFrameRef.current = localAnimId;

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("orientationchange", handleViewportChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleViewportChange);
      }
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
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-30">
      {/* Hardware-Accelerated Native 3D Butterfly Container */}
      <div
        ref={butterflyContainerRef}
        onClick={handleButterflyTap}
        onTouchStart={handleButterflyTap}
        className="absolute top-0 left-0 pointer-events-auto select-none touch-manipulation"
        style={{
          width: "clamp(34px, 5.5vw, 50px)",
          height: "clamp(34px, 5.5vw, 50px)",
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
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-700 opacity-80 hover:opacity-100 z-40">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm text-[11px] sm:text-xs text-white/50 tracking-wide shadow-sm">
            <span>Tap the butterfly 🦋</span>
          </div>
        </div>
      )}
    </div>
  );
}
