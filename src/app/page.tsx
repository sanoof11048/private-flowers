"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StarParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedY: number;
  speedX: number;
  pulseSpeed: number;
}

interface PlantLeaf {
  t: number; // position along stem curve (0 = base, 1 = tip)
  side: "left" | "right";
  length: number;
  angle: number;
  delayOffset: number;
}

interface PlantDefinition {
  id: string;
  name: string;
  flowerSrc: string;
  layer: "back" | "mid" | "front";
  flowerSize: number; // diameter in SVG units
  flowerOffsetY?: number; // small vertical adjustment to align stem tip under receptacle
  // Stem geometry (viewBox 0 0 400 580)
  startX: number;
  startY: number;
  controlX: number;
  controlY: number;
  endX: number;
  endY: number;
  stemWidth: number;
  stemColor?: string;
  // Timing
  startDelay: number;
  stemDuration: number;
  bloomDelay: number;
  bloomDuration: number;
  // Foliage
  leaves?: PlantLeaf[];
  // Sway physics class
  swayClass: string;
}

// 30 Hand-crafted Botanical Plants forming a wide, lush, real hand-tied bouquet
const BOUQUET_PLANTS: PlantDefinition[] = [
  // =========================================================
  // 1. FAR-LEFT & FAR-RIGHT OUTER WIDE STRUCTURE (Layer: back)
  // =========================================================
  {
    id: "eucalyptus-outer-left",
    name: "Outer Eucalyptus Left",
    flowerSrc: "/flowers/eucalyptus.png",
    layer: "back",
    flowerSize: 130,
    startX: 170,
    startY: 570,
    controlX: 95,
    controlY: 380,
    endX: 42,
    endY: 220,
    stemWidth: 2.8,
    startDelay: 0.5,
    stemDuration: 2.2,
    bloomDelay: 2.1,
    bloomDuration: 1.6,
    leaves: [
      { t: 0.45, side: "left", length: 32, angle: -40, delayOffset: 1.0 },
      { t: 0.70, side: "right", length: 28, angle: 30, delayOffset: 1.4 },
    ],
    swayClass: "animate-sway-2",
  },
  {
    id: "eucalyptus-outer-right",
    name: "Outer Eucalyptus Right",
    flowerSrc: "/flowers/eucalyptus.png",
    layer: "back",
    flowerSize: 130,
    startX: 230,
    startY: 570,
    controlX: 305,
    controlY: 380,
    endX: 358,
    endY: 220,
    stemWidth: 2.8,
    startDelay: 0.8,
    stemDuration: 2.2,
    bloomDelay: 2.4,
    bloomDuration: 1.6,
    leaves: [
      { t: 0.45, side: "right", length: 32, angle: 40, delayOffset: 1.0 },
      { t: 0.70, side: "left", length: 28, angle: -30, delayOffset: 1.4 },
    ],
    swayClass: "animate-sway-3",
  },
  {
    id: "babys-breath-wide-left",
    name: "Baby's Breath Wide Left",
    flowerSrc: "/flowers/babys_breath.png",
    layer: "back",
    flowerSize: 110,
    startX: 175,
    startY: 570,
    controlX: 115,
    controlY: 340,
    endX: 68,
    endY: 155,
    stemWidth: 2.0,
    startDelay: 1.2,
    stemDuration: 2.0,
    bloomDelay: 2.7,
    bloomDuration: 1.5,
    swayClass: "animate-sway-1",
  },
  {
    id: "babys-breath-wide-right",
    name: "Baby's Breath Wide Right",
    flowerSrc: "/flowers/babys_breath.png",
    layer: "back",
    flowerSize: 110,
    startX: 225,
    startY: 570,
    controlX: 285,
    controlY: 340,
    endX: 332,
    endY: 155,
    stemWidth: 2.0,
    startDelay: 1.5,
    stemDuration: 2.0,
    bloomDelay: 3.0,
    bloomDuration: 1.5,
    swayClass: "animate-sway-2",
  },

  // =========================================================
  // 2. TALL BACKGROUND STATEMENT BLOOMS & WILD LAVENDER (Layer: back)
  // =========================================================
  {
    id: "cherry-blossom-top",
    name: "Cherry Blossom Branch Top",
    flowerSrc: "/flowers/cherry_blossom.png",
    layer: "back",
    flowerSize: 135,
    startX: 202,
    startY: 570,
    controlX: 212,
    controlY: 300,
    endX: 205,
    endY: 88,
    stemWidth: 2.4,
    startDelay: 1.9,
    stemDuration: 2.3,
    bloomDelay: 3.6,
    bloomDuration: 1.7,
    swayClass: "animate-sway-1",
  },
  {
    id: "lavender-mid-left",
    name: "Lavender Mid Left",
    flowerSrc: "/flowers/lavender.png",
    layer: "back",
    flowerSize: 105,
    startX: 180,
    startY: 570,
    controlX: 135,
    controlY: 370,
    endX: 102,
    endY: 245,
    stemWidth: 2.2,
    startDelay: 2.3,
    stemDuration: 1.9,
    bloomDelay: 3.8,
    bloomDuration: 1.4,
    swayClass: "animate-sway-2",
  },
  {
    id: "lavender-mid-right",
    name: "Lavender Mid Right",
    flowerSrc: "/flowers/lavender.png",
    layer: "back",
    flowerSize: 105,
    startX: 220,
    startY: 570,
    controlX: 265,
    controlY: 370,
    endX: 298,
    endY: 245,
    stemWidth: 2.2,
    startDelay: 2.6,
    stemDuration: 1.9,
    bloomDelay: 4.1,
    bloomDuration: 1.4,
    swayClass: "animate-sway-3",
  },

  // =========================================================
  // 3. TALL MIDGROUND ROSES & TULIPS (Layer: mid)
  // =========================================================
  {
    id: "pink-tulip-tall-left",
    name: "Pink Tulip Tall Left",
    flowerSrc: "/flowers/pink_tulip.png",
    layer: "mid",
    flowerSize: 105,
    startX: 185,
    startY: 570,
    controlX: 155,
    controlY: 330,
    endX: 142,
    endY: 142,
    stemWidth: 3.2,
    startDelay: 3.0,
    stemDuration: 2.0,
    bloomDelay: 4.5,
    bloomDuration: 1.6,
    leaves: [
      { t: 0.55, side: "left", length: 36, angle: -35, delayOffset: 1.1 },
      { t: 0.75, side: "right", length: 28, angle: 25, delayOffset: 1.4 },
    ],
    swayClass: "animate-sway-3",
  },
  {
    id: "white-rose-tall-right",
    name: "White Rose Tall Right",
    flowerSrc: "/flowers/white_rose.png",
    layer: "mid",
    flowerSize: 115,
    startX: 215,
    startY: 570,
    controlX: 245,
    controlY: 330,
    endX: 258,
    endY: 146,
    stemWidth: 3.2,
    startDelay: 3.3,
    stemDuration: 2.0,
    bloomDelay: 4.8,
    bloomDuration: 1.6,
    leaves: [
      { t: 0.55, side: "right", length: 36, angle: 35, delayOffset: 1.1 },
      { t: 0.75, side: "left", length: 28, angle: -25, delayOffset: 1.4 },
    ],
    swayClass: "animate-sway-1",
  },
  {
    id: "white-peony-upper-center",
    name: "White Peony Upper Center",
    flowerSrc: "/flowers/white_peony.png",
    layer: "mid",
    flowerSize: 125,
    startX: 205,
    startY: 570,
    controlX: 215,
    controlY: 330,
    endX: 218,
    endY: 175,
    stemWidth: 3.5,
    startDelay: 3.7,
    stemDuration: 2.0,
    bloomDelay: 5.2,
    bloomDuration: 1.6,
    leaves: [
      { t: 0.60, side: "right", length: 34, angle: 30, delayOffset: 1.2 },
    ],
    swayClass: "animate-sway-2",
  },
  {
    id: "red-rose-upper-left",
    name: "Velvety Red Rose Upper Left",
    flowerSrc: "/flowers/red_rose.png",
    layer: "mid",
    flowerSize: 115,
    startX: 190,
    startY: 570,
    controlX: 180,
    controlY: 330,
    endX: 178,
    endY: 182,
    stemWidth: 3.5,
    startDelay: 4.0,
    stemDuration: 2.0,
    bloomDelay: 5.5,
    bloomDuration: 1.6,
    leaves: [
      { t: 0.60, side: "left", length: 34, angle: -30, delayOffset: 1.2 },
    ],
    swayClass: "animate-sway-1",
  },

  // =========================================================
  // 4. MID-LAYER DAISIES, ROSES & FILLERS (Layer: mid)
  // =========================================================
  {
    id: "white-daisy-mid-left",
    name: "White Daisy Mid Left",
    flowerSrc: "/flowers/white_daisy.png",
    layer: "mid",
    flowerSize: 92,
    startX: 180,
    startY: 570,
    controlX: 145,
    controlY: 380,
    endX: 125,
    endY: 232,
    stemWidth: 2.6,
    startDelay: 4.4,
    stemDuration: 1.8,
    bloomDelay: 5.8,
    bloomDuration: 1.4,
    leaves: [
      { t: 0.50, side: "left", length: 26, angle: -35, delayOffset: 0.9 },
    ],
    swayClass: "animate-sway-1",
  },
  {
    id: "white-daisy-mid-right",
    name: "White Daisy Mid Right",
    flowerSrc: "/flowers/white_daisy.png",
    layer: "mid",
    flowerSize: 92,
    startX: 220,
    startY: 570,
    controlX: 255,
    controlY: 380,
    endX: 275,
    endY: 232,
    stemWidth: 2.6,
    startDelay: 4.7,
    stemDuration: 1.8,
    bloomDelay: 6.1,
    bloomDuration: 1.4,
    leaves: [
      { t: 0.50, side: "right", length: 26, angle: 35, delayOffset: 0.9 },
    ],
    swayClass: "animate-sway-2",
  },
  {
    id: "pink-rose-mid-left",
    name: "Pink English Rose Mid Left",
    flowerSrc: "/flowers/pink_rose.png",
    layer: "mid",
    flowerSize: 112,
    startX: 188,
    startY: 570,
    controlX: 165,
    controlY: 390,
    endX: 156,
    endY: 248,
    stemWidth: 3.2,
    startDelay: 5.0,
    stemDuration: 1.7,
    bloomDelay: 6.4,
    bloomDuration: 1.5,
    leaves: [
      { t: 0.55, side: "left", length: 30, angle: -28, delayOffset: 0.9 },
    ],
    swayClass: "animate-sway-3",
  },
  {
    id: "red-rose-mid-right",
    name: "Red Rose Mid Right",
    flowerSrc: "/flowers/red_rose.png",
    layer: "mid",
    flowerSize: 112,
    startX: 212,
    startY: 570,
    controlX: 235,
    controlY: 390,
    endX: 244,
    endY: 250,
    stemWidth: 3.2,
    startDelay: 5.3,
    stemDuration: 1.7,
    bloomDelay: 6.7,
    bloomDuration: 1.5,
    leaves: [
      { t: 0.55, side: "right", length: 30, angle: 28, delayOffset: 0.9 },
    ],
    swayClass: "animate-sway-1",
  },
  {
    id: "babys-breath-mid-center",
    name: "Baby's Breath Mid Center Filler",
    flowerSrc: "/flowers/babys_breath.png",
    layer: "mid",
    flowerSize: 105,
    startX: 200,
    startY: 570,
    controlX: 200,
    controlY: 380,
    endX: 200,
    endY: 238,
    stemWidth: 1.8,
    startDelay: 5.6,
    stemDuration: 1.6,
    bloomDelay: 6.9,
    bloomDuration: 1.4,
    swayClass: "animate-sway-2",
  },

  // =========================================================
  // 5. FOREGROUND MAIN FOCAL BLOOMS (Layer: front)
  // =========================================================
  {
    id: "pink-tulip-front-left",
    name: "Pink Tulip Foreground Left",
    flowerSrc: "/flowers/pink_tulip.png",
    layer: "front",
    flowerSize: 100,
    startX: 190,
    startY: 570,
    controlX: 175,
    controlY: 420,
    endX: 168,
    endY: 305,
    stemWidth: 3.2,
    startDelay: 6.0,
    stemDuration: 1.5,
    bloomDelay: 7.2,
    bloomDuration: 1.4,
    leaves: [
      { t: 0.55, side: "left", length: 32, angle: -32, delayOffset: 0.8 },
    ],
    swayClass: "animate-sway-2",
  },
  {
    id: "white-peony-front-right",
    name: "White Peony Foreground Right",
    flowerSrc: "/flowers/white_peony.png",
    layer: "front",
    flowerSize: 118,
    startX: 210,
    startY: 570,
    controlX: 225,
    controlY: 420,
    endX: 232,
    endY: 308,
    stemWidth: 3.4,
    startDelay: 6.3,
    stemDuration: 1.5,
    bloomDelay: 7.5,
    bloomDuration: 1.4,
    leaves: [
      { t: 0.55, side: "right", length: 32, angle: 32, delayOffset: 0.8 },
    ],
    swayClass: "animate-sway-3",
  },
  {
    id: "pink-rose-focal-center",
    name: "Blush English Rose Centerpiece",
    flowerSrc: "/flowers/pink_rose.png",
    layer: "front",
    flowerSize: 122,
    startX: 200,
    startY: 570,
    controlX: 200,
    controlY: 430,
    endX: 200,
    endY: 318,
    stemWidth: 3.6,
    startDelay: 6.7,
    stemDuration: 1.5,
    bloomDelay: 7.9,
    bloomDuration: 1.5,
    leaves: [
      { t: 0.50, side: "left", length: 28, angle: -25, delayOffset: 0.8 },
      { t: 0.50, side: "right", length: 28, angle: 25, delayOffset: 0.8 },
    ],
    swayClass: "animate-sway-1",
  },
  {
    id: "white-daisy-front-left",
    name: "White Daisy Front Left",
    flowerSrc: "/flowers/white_daisy.png",
    layer: "front",
    flowerSize: 85,
    startX: 185,
    startY: 570,
    controlX: 168,
    controlY: 460,
    endX: 158,
    endY: 362,
    stemWidth: 2.4,
    startDelay: 7.1,
    stemDuration: 1.4,
    bloomDelay: 8.2,
    bloomDuration: 1.3,
    swayClass: "animate-sway-2",
  },
  {
    id: "white-rose-front-right",
    name: "White Rose Front Right",
    flowerSrc: "/flowers/white_rose.png",
    layer: "front",
    flowerSize: 95,
    startX: 215,
    startY: 570,
    controlX: 232,
    controlY: 460,
    endX: 242,
    endY: 362,
    stemWidth: 2.8,
    startDelay: 7.4,
    stemDuration: 1.4,
    bloomDelay: 8.5,
    bloomDuration: 1.3,
    swayClass: "animate-sway-3",
  },
  {
    id: "babys-breath-front-tuck",
    name: "Baby's Breath Front Tuck",
    flowerSrc: "/flowers/babys_breath.png",
    layer: "front",
    flowerSize: 95,
    startX: 200,
    startY: 570,
    controlX: 200,
    controlY: 470,
    endX: 200,
    endY: 388,
    stemWidth: 1.8,
    startDelay: 7.8,
    stemDuration: 1.3,
    bloomDelay: 8.8,
    bloomDuration: 1.2,
    swayClass: "animate-sway-1",
  },
];

// Helper to compute a quadratic bezier point B(t)
function getBezierPoint(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  t: number
) {
  const invT = 1 - t;
  const x = invT * invT * p0.x + 2 * invT * t * p1.x + t * t * p2.x;
  const y = invT * invT * p0.y + 2 * invT * t * p1.y + t * t * p2.y;
  return { x, y };
}

// Helper to compute leaf path along stem
function generateLeafPath(
  plant: PlantDefinition,
  leaf: PlantLeaf
) {
  const p0 = { x: plant.startX, y: plant.startY };
  const p1 = { x: plant.controlX, y: plant.controlY };
  const p2 = { x: plant.endX, y: plant.endY };
  const origin = getBezierPoint(p0, p1, p2, leaf.t);

  // Compute tangent
  const invT = 1 - leaf.t;
  const dx = 2 * invT * (p1.x - p0.x) + 2 * leaf.t * (p2.x - p1.x);
  const dy = 2 * invT * (p1.y - p0.y) + 2 * leaf.t * (p2.y - p1.y);
  const stemAngle = Math.atan2(dy, dx); // radians

  const angleRad = (leaf.angle * Math.PI) / 180;
  const leafDir = stemAngle + angleRad + (leaf.side === "left" ? -Math.PI / 2 : Math.PI / 2);

  const tipX = origin.x + Math.cos(leafDir) * leaf.length;
  const tipY = origin.y + Math.sin(leafDir) * leaf.length;

  const midX = (origin.x + tipX) / 2 + (leaf.side === "left" ? -6 : 6);
  const midY = (origin.y + tipY) / 2 - 4;

  const d = `M ${origin.x} ${origin.y} Q ${midX} ${midY} ${tipX} ${tipY} Q ${origin.x + (leaf.side === "left" ? 4 : -4)} ${origin.y - 2} ${origin.x} ${origin.y}`;
  return { d, origin: `${origin.x}px ${origin.y}px` };
}

export default function BotanicalMotionBouquet() {
  const [started, setStarted] = useState(false);
  const [bloomComplete, setBloomComplete] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Background delicate stardust simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const count = width < 600 ? 25 : 45;
    const particles: StarParticle[] = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.6 + 0.6,
        opacity: Math.random() * 0.65 + 0.25,
        speedY: -(Math.random() * 0.28 + 0.08),
        speedX: (Math.random() - 0.5) * 0.16,
        pulseSpeed: Math.random() * 0.03 + 0.01,
      });
    }

    let frame = 0;
    let animId: number;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        const currentOpacity =
          p.opacity * (0.6 + 0.4 * Math.sin(frame * p.pulseSpeed));

        ctx.save();
        ctx.fillStyle = `rgba(255, 238, 220, ${currentOpacity})`;
        ctx.shadowColor = "rgba(255, 205, 160, 0.75)";
        ctx.shadowBlur = p.size * 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Auto-start after 1.2s or on user tap
  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Completion marker at 10.2s
  useEffect(() => {
    if (started) {
      const timer = setTimeout(() => {
        setBloomComplete(true);
      }, 10200);
      return () => clearTimeout(timer);
    }
  }, [started]);

  const handleScreenTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!started) {
      setStarted(true);
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRipples((prev) => [...prev, { id: Date.now() + Math.random(), x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 1200);
  };

  return (
    <main
      onClick={handleScreenTap}
      className="relative h-[100svh] w-full bg-[#050505] text-[#ECE6E2] overflow-hidden flex flex-col justify-between items-center cursor-pointer select-none"
    >
      {/* Background Star Particle Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-0 h-full w-full"
      />

      {/* Subtle Cinematic Soft Ambient Lighting behind the Bouquet */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 h-[65vh] w-[95vw] max-w-[700px] rounded-full bg-radial from-rose-950/20 via-amber-950/10 to-transparent blur-3xl pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* Touch Glow Ripples */}
      <div className="absolute inset-0 pointer-events-none z-40">
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ left: r.x, top: r.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-gradient-to-r from-rose-300/40 to-amber-200/40 blur-md"
          />
        ))}
      </div>

      {/* Top Header Section: Lena Fathima K & "For you, Lena ❤️" */}
      <header className="relative z-30 pt-7 sm:pt-10 px-4 text-center flex flex-col items-center">
        {/* Name: Lena Fathima K */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, delay: 0.2, ease: "easeOut" }}
          className="font-script-romantic text-4xl sm:text-5xl md:text-6xl text-[#FFF5F7] drop-shadow-[0_2px_22px_rgba(255,182,193,0.45)] tracking-wide"
        >
          Lena Fathima K
        </motion.h1>

        {/* Subtitle: "For you, Lena ❤️" */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, delay: 0.7, ease: "easeOut" }}
          className="font-serif-luxury text-lg sm:text-xl md:text-2xl text-rose-200/90 italic tracking-wide mt-1 drop-shadow-[0_0_12px_rgba(244,114,182,0.3)]"
        >
          For you, Lena ❤️
        </motion.p>

        {/* Initial Tap Prompt */}
        <AnimatePresence>
          {!started && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.85, 0.3] }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="text-xs sm:text-sm text-rose-200/60 font-light tracking-widest uppercase mt-2.5 font-sans"
            >
              Tap anywhere to bloom
            </motion.p>
          )}
        </AnimatePresence>

        {/* Final Soft Polish Note when bouquet finishes blooming */}
        <AnimatePresence>
          {bloomComplete && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-[11px] sm:text-xs text-stone-400 font-light tracking-wider uppercase font-sans mt-1.5"
            >
              Just because.
            </motion.p>
          )}
        </AnimatePresence>
      </header>

      {/* Main Single SVG Botanical Stage: Stems + Foliage + Flowers in ONE Unified Coordinate Space */}
      <div className="relative z-10 w-full max-w-[460px] sm:max-w-[560px] md:max-w-[660px] h-[68vh] sm:h-[72vh] flex items-end justify-center pointer-events-none pb-0">
        <svg
          viewBox="0 0 400 580"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Natural botanical stem gradients */}
            <linearGradient id="stemGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0F2112" />
              <stop offset="40%" stopColor="#224729" />
              <stop offset="80%" stopColor="#3E6B48" />
              <stop offset="100%" stopColor="#5D8B66" />
            </linearGradient>

            {/* Leaf gradient */}
            <linearGradient id="leafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1B3322" />
              <stop offset="50%" stopColor="#355D3D" />
              <stop offset="100%" stopColor="#5B8764" />
            </linearGradient>
          </defs>

          {/* Render all 30 botanical plant units */}
          {BOUQUET_PLANTS.map((plant) => {
            const stemD = `M ${plant.startX} ${plant.startY} Q ${plant.controlX} ${plant.controlY} ${plant.endX} ${plant.endY}`;

            return (
              <g
                key={"plant-" + plant.id}
                className={plant.swayClass}
                style={{
                  transformOrigin: `${plant.startX}px ${plant.startY}px`,
                }}
              >
                {/* 1. Stem growing upward from base */}
                <motion.path
                  d={stemD}
                  fill="none"
                  stroke="url(#stemGrad)"
                  strokeWidth={plant.stemWidth}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: started ? 1 : 0 }}
                  transition={{
                    duration: plant.stemDuration,
                    delay: plant.startDelay,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />

                {/* 2. Leaves along stem */}
                {plant.leaves?.map((leaf, lIdx) => {
                  const leafData = generateLeafPath(plant, leaf);

                  return (
                    <motion.path
                      key={`leaf-${plant.id}-${lIdx}`}
                      d={leafData.d}
                      fill="url(#leafGrad)"
                      opacity="0.92"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: started ? 1 : 0,
                        opacity: started ? 0.92 : 0,
                      }}
                      transition={{
                        duration: 1.2,
                        delay: plant.startDelay + leaf.delayOffset,
                        ease: "easeOut",
                      }}
                      style={{ transformOrigin: leafData.origin }}
                    />
                  );
                })}

                {/* 3. Flower Head blooming at the EXACT stem endpoint (endX, endY) */}
                <motion.g
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: started ? [0, 1.12, 1] : 0,
                    opacity: started ? 1 : 0,
                  }}
                  transition={{
                    duration: plant.bloomDuration,
                    delay: plant.bloomDelay,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  style={{
                    transformOrigin: `${plant.endX}px ${plant.endY}px`,
                  }}
                >
                  <image
                    href={plant.flowerSrc}
                    x={plant.endX - plant.flowerSize / 2}
                    y={plant.endY - plant.flowerSize / 2 + (plant.flowerOffsetY ?? 0)}
                    width={plant.flowerSize}
                    height={plant.flowerSize}
                    preserveAspectRatio="xMidYMid meet"
                  />
                </motion.g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom Minimal Hint */}
      <footer className="relative z-30 pb-3 text-center">
        <span className="text-[10px] text-stone-600 tracking-widest uppercase font-light">
          {bloomComplete ? "tap anywhere to bloom with love" : ""}
        </span>
      </footer>
    </main>
  );
}
