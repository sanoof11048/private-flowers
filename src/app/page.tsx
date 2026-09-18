"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
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

interface FlowerItem {
  id: string;
  name: string;
  src: string;
  // SVG Stem Path (ViewBox: 400 x 540, base at (200, 540))
  stem: {
    d: string;
    strokeWidth: number;
    delay: number;
    duration: number;
  };
  // Leaf along the stem
  leaf?: {
    d: string;
    origin: string;
    delay: number;
  };
  // Flower Blossom position (mapped to SVG coordinate system % & px)
  flower: {
    xPercent: number; // 0 to 100% horizontally
    yPercent: number; // 0 to 100% from bottom
    sizeMobile: number; // width/height on mobile in px
    sizeDesktop: number; // width/height on desktop in px
    rotate: number; // natural tilt in deg
    delay: number; // bloom start time
    duration: number; // bloom expansion duration
    zIndex: number; // depth layer
    swayClass: string;
  };
}

// 24 Botanical Elements arranged like a luxury hand-tied bouquet
const BOUQUET_SYSTEM: FlowerItem[] = [
  // ==========================================
  // BACKGROUND FOLIAGE & AIRY SPRIGS (Z: 4 - 8)
  // ==========================================
  {
    id: "eucalyptus-left",
    name: "Eucalyptus Left",
    src: "/flowers/eucalyptus.png",
    stem: { d: "M 200 540 C 160 420, 100 320, 75 190", strokeWidth: 2.8, delay: 0.8, duration: 2.2 },
    leaf: { d: "M 130 380 C 85 360, 50 330, 45 280 C 70 310, 110 335, 130 365", origin: "130px 380px", delay: 1.8 },
    flower: { xPercent: 18, yPercent: 62, sizeMobile: 135, sizeDesktop: 165, rotate: -26, delay: 2.0, duration: 2.0, zIndex: 4, swayClass: "animate-sway-2" },
  },
  {
    id: "eucalyptus-right",
    name: "Eucalyptus Right",
    src: "/flowers/eucalyptus.png",
    stem: { d: "M 200 540 C 240 420, 300 320, 325 190", strokeWidth: 2.8, delay: 1.1, duration: 2.2 },
    leaf: { d: "M 270 380 C 315 360, 350 330, 355 280 C 330 310, 290 335, 270 365", origin: "270px 380px", delay: 2.1 },
    flower: { xPercent: 82, yPercent: 62, sizeMobile: 135, sizeDesktop: 165, rotate: 26, delay: 2.3, duration: 2.0, zIndex: 4, swayClass: "animate-sway-3" },
  },
  {
    id: "babys-breath-back-left",
    name: "Baby's Breath Back Left",
    src: "/flowers/babys_breath.png",
    stem: { d: "M 200 540 C 170 380, 125 260, 105 145", strokeWidth: 2.0, delay: 1.5, duration: 2.0 },
    flower: { xPercent: 26, yPercent: 71, sizeMobile: 125, sizeDesktop: 155, rotate: -20, delay: 2.7, duration: 1.8, zIndex: 6, swayClass: "animate-sway-1" },
  },
  {
    id: "babys-breath-back-right",
    name: "Baby's Breath Back Right",
    src: "/flowers/babys_breath.png",
    stem: { d: "M 200 540 C 230 380, 275 260, 295 145", strokeWidth: 2.0, delay: 1.8, duration: 2.0 },
    flower: { xPercent: 74, yPercent: 71, sizeMobile: 125, sizeDesktop: 155, rotate: 20, delay: 3.0, duration: 1.8, zIndex: 6, swayClass: "animate-sway-2" },
  },
  {
    id: "cherry-blossom-top",
    name: "Cherry Blossom Branch Top",
    src: "/flowers/cherry_blossom.png",
    stem: { d: "M 200 540 C 205 360, 215 220, 210 90", strokeWidth: 2.2, delay: 2.2, duration: 2.2 },
    flower: { xPercent: 52, yPercent: 81, sizeMobile: 140, sizeDesktop: 175, rotate: 6, delay: 3.4, duration: 1.9, zIndex: 7, swayClass: "animate-sway-1" },
  },

  // ==========================================
  // MID-GROUND STATEMENT BLOOMS (Z: 10 - 18)
  // ==========================================
  {
    id: "lavender-left",
    name: "Lavender Left",
    src: "/flowers/lavender.png",
    stem: { d: "M 200 540 C 165 420, 110 320, 85 220", strokeWidth: 2.2, delay: 2.6, duration: 1.9 },
    flower: { xPercent: 21, yPercent: 57, sizeMobile: 110, sizeDesktop: 135, rotate: -30, delay: 3.8, duration: 1.5, zIndex: 10, swayClass: "animate-sway-2" },
  },
  {
    id: "lavender-right",
    name: "Lavender Right",
    src: "/flowers/lavender.png",
    stem: { d: "M 200 540 C 235 420, 290 320, 315 220", strokeWidth: 2.2, delay: 2.9, duration: 1.9 },
    flower: { xPercent: 79, yPercent: 57, sizeMobile: 110, sizeDesktop: 135, rotate: 30, delay: 4.1, duration: 1.5, zIndex: 10, swayClass: "animate-sway-3" },
  },
  {
    id: "pink-tulip-tall-left",
    name: "Pink Tulip Tall Left",
    src: "/flowers/pink_tulip.png",
    stem: { d: "M 200 540 C 185 390, 155 260, 145 140", strokeWidth: 3.4, delay: 3.2, duration: 2.0 },
    leaf: { d: "M 175 360 C 135 340, 100 310, 95 260 C 115 290, 150 315, 170 340", origin: "175px 360px", delay: 4.0 },
    flower: { xPercent: 36, yPercent: 72, sizeMobile: 105, sizeDesktop: 130, rotate: -15, delay: 4.5, duration: 1.6, zIndex: 14, swayClass: "animate-sway-3" },
  },
  {
    id: "white-rose-tall-right",
    name: "White Rose Tall Right",
    src: "/flowers/white_rose.png",
    stem: { d: "M 200 540 C 215 390, 245 260, 255 145", strokeWidth: 3.4, delay: 3.5, duration: 2.0 },
    leaf: { d: "M 225 360 C 265 340, 300 310, 305 260 C 285 290, 250 315, 230 340", origin: "225px 360px", delay: 4.3 },
    flower: { xPercent: 64, yPercent: 71, sizeMobile: 115, sizeDesktop: 140, rotate: 14, delay: 4.8, duration: 1.6, zIndex: 14, swayClass: "animate-sway-1" },
  },
  {
    id: "white-peony-tall-center",
    name: "White Peony Core",
    src: "/flowers/white_peony.png",
    stem: { d: "M 200 540 C 205 400, 215 280, 215 170", strokeWidth: 3.6, delay: 3.8, duration: 2.1 },
    leaf: { d: "M 210 390 C 240 375, 265 350, 270 310 C 250 335, 225 355, 208 375", origin: "210px 390px", delay: 4.7 },
    flower: { xPercent: 54, yPercent: 66, sizeMobile: 125, sizeDesktop: 155, rotate: 6, delay: 5.2, duration: 1.7, zIndex: 16, swayClass: "animate-sway-2" },
  },
  {
    id: "red-rose-tall-center",
    name: "Velvet Red Rose Tall",
    src: "/flowers/red_rose.png",
    stem: { d: "M 200 540 C 195 400, 185 280, 185 175", strokeWidth: 3.6, delay: 4.2, duration: 2.1 },
    leaf: { d: "M 190 390 C 160 375, 135 350, 130 310 C 150 335, 175 355, 192 375", origin: "190px 390px", delay: 5.1 },
    flower: { xPercent: 46, yPercent: 65, sizeMobile: 120, sizeDesktop: 150, rotate: -6, delay: 5.6, duration: 1.7, zIndex: 16, swayClass: "animate-sway-1" },
  },

  // ==========================================
  // MID-FOREGROUND VIBRANT ROSES & DAISIES (Z: 20 - 24)
  // ==========================================
  {
    id: "daisy-mid-left",
    name: "White Daisy Left",
    src: "/flowers/white_daisy.png",
    stem: { d: "M 200 540 C 175 420, 140 320, 125 230", strokeWidth: 2.6, delay: 4.6, duration: 1.8 },
    flower: { xPercent: 31, yPercent: 56, sizeMobile: 95, sizeDesktop: 120, rotate: -16, delay: 6.0, duration: 1.4, zIndex: 20, swayClass: "animate-sway-1" },
  },
  {
    id: "daisy-mid-right",
    name: "White Daisy Right",
    src: "/flowers/white_daisy.png",
    stem: { d: "M 200 540 C 225 420, 260 320, 275 230", strokeWidth: 2.6, delay: 4.9, duration: 1.8 },
    flower: { xPercent: 69, yPercent: 56, sizeMobile: 95, sizeDesktop: 120, rotate: 16, delay: 6.3, duration: 1.4, zIndex: 20, swayClass: "animate-sway-2" },
  },
  {
    id: "pink-rose-mid-left",
    name: "Pink English Rose Left",
    src: "/flowers/pink_rose.png",
    stem: { d: "M 200 540 C 185 430, 160 330, 155 240", strokeWidth: 3.2, delay: 5.3, duration: 1.8 },
    flower: { xPercent: 39, yPercent: 53, sizeMobile: 115, sizeDesktop: 145, rotate: -10, delay: 6.7, duration: 1.5, zIndex: 22, swayClass: "animate-sway-3" },
  },
  {
    id: "red-rose-mid-right",
    name: "Red Rose Mid Right",
    src: "/flowers/red_rose.png",
    stem: { d: "M 200 540 C 215 430, 240 330, 245 245", strokeWidth: 3.2, delay: 5.6, duration: 1.8 },
    flower: { xPercent: 61, yPercent: 52, sizeMobile: 115, sizeDesktop: 145, rotate: 10, delay: 7.0, duration: 1.5, zIndex: 22, swayClass: "animate-sway-1" },
  },
  {
    id: "babys-breath-mid-accent",
    name: "Baby's Breath Mid Accent",
    src: "/flowers/babys_breath.png",
    stem: { d: "M 200 540 C 200 420, 200 320, 200 240", strokeWidth: 1.8, delay: 5.9, duration: 1.6 },
    flower: { xPercent: 50, yPercent: 52, sizeMobile: 110, sizeDesktop: 135, rotate: 0, delay: 7.3, duration: 1.4, zIndex: 23, swayClass: "animate-sway-2" },
  },

  // ==========================================
  // FOREGROUND FOCAL BLOOMS (Z: 25 - 30)
  // ==========================================
  {
    id: "pink-tulip-front",
    name: "Pink Tulip Foreground",
    src: "/flowers/pink_tulip.png",
    stem: { d: "M 200 540 C 190 450, 170 370, 170 290", strokeWidth: 3.2, delay: 6.3, duration: 1.6 },
    flower: { xPercent: 42, yPercent: 43, sizeMobile: 105, sizeDesktop: 130, rotate: -8, delay: 7.7, duration: 1.4, zIndex: 26, swayClass: "animate-sway-2" },
  },
  {
    id: "white-peony-front",
    name: "White Peony Foreground",
    src: "/flowers/white_peony.png",
    stem: { d: "M 200 540 C 210 450, 230 370, 230 295", strokeWidth: 3.4, delay: 6.6, duration: 1.6 },
    flower: { xPercent: 58, yPercent: 42, sizeMobile: 115, sizeDesktop: 145, rotate: 7, delay: 8.0, duration: 1.4, zIndex: 26, swayClass: "animate-sway-3" },
  },
  {
    id: "pink-rose-front-center",
    name: "Blush Rose Centerpiece",
    src: "/flowers/pink_rose.png",
    stem: { d: "M 200 540 C 200 460, 200 380, 200 310", strokeWidth: 3.5, delay: 7.0, duration: 1.5 },
    flower: { xPercent: 50, yPercent: 39, sizeMobile: 120, sizeDesktop: 150, rotate: 0, delay: 8.4, duration: 1.5, zIndex: 28, swayClass: "animate-sway-1" },
  },
  {
    id: "white-daisy-front-left",
    name: "White Daisy Front Left",
    src: "/flowers/white_daisy.png",
    stem: { d: "M 200 540 C 185 470, 165 410, 160 340", strokeWidth: 2.4, delay: 7.3, duration: 1.4 },
    flower: { xPercent: 40, yPercent: 33, sizeMobile: 85, sizeDesktop: 105, rotate: -14, delay: 8.8, duration: 1.3, zIndex: 30, swayClass: "animate-sway-2" },
  },
  {
    id: "white-rose-front-right",
    name: "White Rose Front Right",
    src: "/flowers/white_rose.png",
    stem: { d: "M 200 540 C 215 470, 235 410, 240 340", strokeWidth: 2.8, delay: 7.6, duration: 1.4 },
    flower: { xPercent: 60, yPercent: 33, sizeMobile: 95, sizeDesktop: 115, rotate: 14, delay: 9.1, duration: 1.3, zIndex: 30, swayClass: "animate-sway-3" },
  },
];

export default function BotanicalBouquetPage() {
  const [started, setStarted] = useState(false);
  const [bloomComplete, setBloomComplete] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Background subtle glowing stardust fireflies
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

  // Auto-start after 1.4s or on user tap
  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(true);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  // Final bloom complete at 10.5s
  useEffect(() => {
    if (started) {
      const timer = setTimeout(() => {
        setBloomComplete(true);
      }, 10500);
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

      {/* Subtle Cinematic Soft Amber & Rose Glow behind the Bouquet */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 h-[60vh] w-[90vw] max-w-[650px] rounded-full bg-radial from-rose-950/18 via-amber-950/10 to-transparent blur-3xl pointer-events-none z-0"
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
      <header className="relative z-30 pt-8 sm:pt-12 px-4 text-center flex flex-col items-center">
        {/* Name: Lena Fathima K */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, delay: 0.2, ease: "easeOut" }}
          className="font-script-romantic text-4xl sm:text-5xl md:text-6xl text-[#FFF5F7] drop-shadow-[0_2px_22px_rgba(255,182,193,0.45)] tracking-wide"
        >
          Lena Fathima K
        </motion.h1>

        {/* Subtitle: "For you, Lena ❤️" (Visible from start as requested) */}
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
              className="text-xs sm:text-sm text-rose-200/60 font-light tracking-widest uppercase mt-3 font-sans"
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

      {/* Main Bouquet Stage: Procedural Botanical Stems + 100% Transparent Real Flower Blossoms */}
      <div className="relative z-10 w-full max-w-[440px] sm:max-w-[540px] md:max-w-[640px] h-[68vh] sm:h-[72vh] flex items-end justify-center pointer-events-none pb-0">
        {/* Layer 1: SVG Botanical Stems & Leaves growing organically */}
        <svg
          viewBox="0 0 400 540"
          className="absolute inset-0 w-full h-full overflow-visible z-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="stemGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#122515" />
              <stop offset="50%" stopColor="#2E5535" />
              <stop offset="100%" stopColor="#55825D" />
            </linearGradient>

            <linearGradient id="leafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1B3322" />
              <stop offset="60%" stopColor="#3E6B47" />
              <stop offset="100%" stopColor="#6C9A75" />
            </linearGradient>
          </defs>

          {/* Stems & Leaves */}
          {BOUQUET_SYSTEM.map((f) => (
            <g key={"stem-group-" + f.id}>
              {/* Stem Growth */}
              <motion.path
                d={f.stem.d}
                fill="none"
                stroke="url(#stemGrad)"
                strokeWidth={f.stem.strokeWidth}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: started ? 1 : 0 }}
                transition={{
                  duration: f.stem.duration,
                  delay: f.stem.delay,
                  ease: [0.25, 1, 0.5, 1],
                }}
              />

              {/* Leaves Unfurling along Stem */}
              {f.leaf && (
                <motion.path
                  d={f.leaf.d}
                  fill="url(#leafGrad)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: started ? 1 : 0,
                    opacity: started ? 0.95 : 0,
                  }}
                  transition={{
                    duration: 1.3,
                    delay: f.leaf.delay,
                    ease: "easeOut",
                  }}
                  style={{ transformOrigin: f.leaf.origin }}
                />
              )}
            </g>
          ))}
        </svg>

        {/* Layer 2: 24 Real Photographic Flower Blooms with 100% Transparent Backgrounds */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          {BOUQUET_SYSTEM.map((f) => (
            <motion.div
              key={"bloom-" + f.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: started ? [0, 1.14, 1] : 0,
                opacity: started ? 1 : 0,
              }}
              transition={{
                duration: f.flower.duration,
                delay: f.flower.delay,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              style={{
                left: `${f.flower.xPercent}%`,
                bottom: `${f.flower.yPercent}%`,
                zIndex: f.flower.zIndex,
                transform: `translate(-50%, 50%) rotate(${f.flower.rotate}deg)`,
                transformOrigin: "center bottom",
              }}
              className={`absolute flex items-center justify-center ${f.flower.swayClass}`}
            >
              {/* Responsive Size Container with Clean Transparent Flower PNG */}
              <div
                className="relative select-none pointer-events-none"
                style={{
                  width: `clamp(${f.flower.sizeMobile}px, 22vw, ${f.flower.sizeDesktop}px)`,
                  height: `clamp(${f.flower.sizeMobile}px, 22vw, ${f.flower.sizeDesktop}px)`,
                }}
              >
                <Image
                  src={f.src}
                  alt={f.name}
                  fill
                  sizes="(max-width: 640px) 130px, 175px"
                  className="object-contain"
                  priority
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Minimal Space */}
      <footer className="relative z-30 pb-3 text-center">
        <span className="text-[10px] text-stone-600 tracking-widest uppercase font-light">
          {bloomComplete ? "tap anywhere to bloom with love" : ""}
        </span>
      </footer>
    </main>
  );
}
