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

interface FlowerElement {
  id: string;
  name: string;
  src: string;
  stem: {
    d: string;
    strokeWidth: number;
    delay: number;
    duration: number;
  };
  bloom: {
    x: number; // percentage from center
    y: number; // percentage from bottom
    size: number; // width in px
    rotate: number;
    delay: number;
    duration: number;
    zIndex: number;
    swayClass: string;
  };
}

// 22 Real Botanical Flowers & Foliage forming an abundant, natural bouquet
const BOUQUET_FLOWERS: FlowerElement[] = [
  // 1. Deep Foundation Stems & Background Foliage
  {
    id: "eucalyptus-left",
    name: "Eucalyptus Leaves Left",
    src: "/flowers/eucalyptus.jpg",
    stem: { d: "M 200 520 C 170 420, 110 320, 80 200", strokeWidth: 2.8, delay: 0.8, duration: 2.0 },
    bloom: { x: 20, y: 58, size: 140, rotate: -22, delay: 1.8, duration: 1.8, zIndex: 4, swayClass: "animate-sway-2" },
  },
  {
    id: "eucalyptus-right",
    name: "Eucalyptus Leaves Right",
    src: "/flowers/eucalyptus.jpg",
    stem: { d: "M 200 520 C 230 420, 290 320, 320 200", strokeWidth: 2.8, delay: 1.2, duration: 2.0 },
    bloom: { x: 80, y: 58, size: 140, rotate: 22, delay: 2.2, duration: 1.8, zIndex: 4, swayClass: "animate-sway-3" },
  },

  // 2. Statement Tall Blooms
  {
    id: "red-rose-center",
    name: "Velvety Red Rose",
    src: "/flowers/red_rose.jpg",
    stem: { d: "M 200 520 C 195 400, 185 280, 185 160", strokeWidth: 3.5, delay: 1.6, duration: 2.2 },
    bloom: { x: 46, y: 68, size: 110, rotate: -6, delay: 2.8, duration: 1.6, zIndex: 18, swayClass: "animate-sway-1" },
  },
  {
    id: "white-peony-center",
    name: "Lush White Peony",
    src: "/flowers/white_peony.jpg",
    stem: { d: "M 200 520 C 210 400, 225 290, 230 170", strokeWidth: 3.5, delay: 2.2, duration: 2.2 },
    bloom: { x: 57, y: 66, size: 125, rotate: 8, delay: 3.4, duration: 1.6, zIndex: 17, swayClass: "animate-sway-2" },
  },
  {
    id: "pink-tulip-top",
    name: "Pink Tulip Top",
    src: "/flowers/pink_tulip.jpg",
    stem: { d: "M 200 520 C 190 380, 160 250, 145 130", strokeWidth: 3.2, delay: 2.8, duration: 2.0 },
    bloom: { x: 36, y: 74, size: 100, rotate: -14, delay: 4.0, duration: 1.5, zIndex: 16, swayClass: "animate-sway-3" },
  },
  {
    id: "white-rose-tall",
    name: "White Rose Tall",
    src: "/flowers/white_rose.jpg",
    stem: { d: "M 200 520 C 215 380, 245 250, 260 135", strokeWidth: 3.2, delay: 3.2, duration: 2.0 },
    bloom: { x: 65, y: 73, size: 110, rotate: 12, delay: 4.4, duration: 1.5, zIndex: 16, swayClass: "animate-sway-1" },
  },

  // 3. Delicate Baby's Breath & Sakura Sprigs
  {
    id: "babys-breath-left",
    name: "Baby's Breath Left",
    src: "/flowers/babys_breath.jpg",
    stem: { d: "M 200 520 C 170 390, 120 280, 95 160", strokeWidth: 2.0, delay: 3.8, duration: 1.8 },
    bloom: { x: 24, y: 67, size: 130, rotate: -25, delay: 4.8, duration: 1.6, zIndex: 10, swayClass: "animate-sway-2" },
  },
  {
    id: "babys-breath-right",
    name: "Baby's Breath Right",
    src: "/flowers/babys_breath.jpg",
    stem: { d: "M 200 520 C 230 390, 280 280, 305 160", strokeWidth: 2.0, delay: 4.2, duration: 1.8 },
    bloom: { x: 76, y: 67, size: 130, rotate: 25, delay: 5.2, duration: 1.6, zIndex: 10, swayClass: "animate-sway-3" },
  },
  {
    id: "cherry-blossom-top",
    name: "Cherry Blossom Branch",
    src: "/flowers/cherry_blossom.jpg",
    stem: { d: "M 200 520 C 205 350, 215 220, 210 100", strokeWidth: 2.2, delay: 4.6, duration: 2.2 },
    bloom: { x: 52, y: 80, size: 135, rotate: 5, delay: 5.6, duration: 1.8, zIndex: 14, swayClass: "animate-sway-1" },
  },

  // 4. Wildflowers, Lavender & Daisies
  {
    id: "lavender-left",
    name: "Lavender Left",
    src: "/flowers/lavender.jpg",
    stem: { d: "M 200 520 C 160 410, 100 310, 70 210", strokeWidth: 2.2, delay: 5.0, duration: 1.8 },
    bloom: { x: 18, y: 55, size: 115, rotate: -28, delay: 6.0, duration: 1.4, zIndex: 12, swayClass: "animate-sway-2" },
  },
  {
    id: "lavender-right",
    name: "Lavender Right",
    src: "/flowers/lavender.jpg",
    stem: { d: "M 200 520 C 240 410, 300 310, 330 210", strokeWidth: 2.2, delay: 5.4, duration: 1.8 },
    bloom: { x: 82, y: 55, size: 115, rotate: 28, delay: 6.4, duration: 1.4, zIndex: 12, swayClass: "animate-sway-3" },
  },
  {
    id: "daisy-mid-left",
    name: "White Daisy Mid Left",
    src: "/flowers/white_daisy.jpg",
    stem: { d: "M 200 520 C 175 400, 140 300, 130 220", strokeWidth: 2.5, delay: 5.8, duration: 1.6 },
    bloom: { x: 32, y: 56, size: 90, rotate: -15, delay: 6.8, duration: 1.3, zIndex: 20, swayClass: "animate-sway-1" },
  },
  {
    id: "daisy-mid-right",
    name: "White Daisy Mid Right",
    src: "/flowers/white_daisy.jpg",
    stem: { d: "M 200 520 C 225 400, 260 300, 270 220", strokeWidth: 2.5, delay: 6.2, duration: 1.6 },
    bloom: { x: 68, y: 56, size: 90, rotate: 15, delay: 7.2, duration: 1.3, zIndex: 20, swayClass: "animate-sway-2" },
  },

  // 5. Mid-Foreground Lush Roses & Peonies
  {
    id: "pink-rose-mid",
    name: "Pink English Rose",
    src: "/flowers/pink_rose.jpg",
    stem: { d: "M 200 520 C 185 410, 165 320, 160 230", strokeWidth: 3.2, delay: 6.6, duration: 1.6 },
    bloom: { x: 40, y: 53, size: 110, rotate: -8, delay: 7.6, duration: 1.5, zIndex: 22, swayClass: "animate-sway-3" },
  },
  {
    id: "red-rose-mid",
    name: "Red Rose Foreground",
    src: "/flowers/red_rose.jpg",
    stem: { d: "M 200 520 C 215 410, 235 320, 240 235", strokeWidth: 3.2, delay: 7.0, duration: 1.6 },
    bloom: { x: 60, y: 52, size: 110, rotate: 10, delay: 8.0, duration: 1.5, zIndex: 22, swayClass: "animate-sway-1" },
  },
  {
    id: "pink-tulip-lower",
    name: "Pink Tulip Foreground",
    src: "/flowers/pink_tulip.jpg",
    stem: { d: "M 200 520 C 190 430, 175 350, 175 280", strokeWidth: 3.0, delay: 7.4, duration: 1.5 },
    bloom: { x: 44, y: 44, size: 95, rotate: -6, delay: 8.4, duration: 1.4, zIndex: 24, swayClass: "animate-sway-2" },
  },
  {
    id: "white-peony-foreground",
    name: "White Peony Core",
    src: "/flowers/white_peony.jpg",
    stem: { d: "M 200 520 C 205 430, 215 350, 215 285", strokeWidth: 3.2, delay: 7.8, duration: 1.5 },
    bloom: { x: 54, y: 43, size: 105, rotate: 4, delay: 8.8, duration: 1.4, zIndex: 25, swayClass: "animate-sway-3" },
  },

  // 6. Base Delicate Sprigs & Florets Tucking Everything Together
  {
    id: "babys-breath-core",
    name: "Baby's Breath Core Accent",
    src: "/flowers/babys_breath.jpg",
    stem: { d: "M 200 520 C 200 440, 200 370, 200 300", strokeWidth: 1.8, delay: 8.2, duration: 1.4 },
    bloom: { x: 50, y: 41, size: 105, rotate: 0, delay: 9.2, duration: 1.3, zIndex: 26, swayClass: "animate-sway-1" },
  },
  {
    id: "white-daisy-front",
    name: "White Daisy Front Accent",
    src: "/flowers/white_daisy.jpg",
    stem: { d: "M 200 520 C 185 450, 170 380, 165 320", strokeWidth: 2.2, delay: 8.5, duration: 1.3 },
    bloom: { x: 41, y: 35, size: 75, rotate: -12, delay: 9.5, duration: 1.2, zIndex: 28, swayClass: "animate-sway-2" },
  },
  {
    id: "pink-rose-front",
    name: "Pink Rose Front Accent",
    src: "/flowers/pink_rose.jpg",
    stem: { d: "M 200 520 C 215 450, 230 380, 235 320", strokeWidth: 2.2, delay: 8.8, duration: 1.3 },
    bloom: { x: 59, y: 35, size: 85, rotate: 12, delay: 9.8, duration: 1.2, zIndex: 28, swayClass: "animate-sway-3" },
  },
];

export default function RealisticBouquetExperience() {
  const [started, setStarted] = useState(false);
  const [bloomComplete, setBloomComplete] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Background gentle fireflies / stardust simulation
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

    const count = width < 600 ? 28 : 50;
    const particles: StarParticle[] = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.6,
        opacity: Math.random() * 0.7 + 0.2,
        speedY: -(Math.random() * 0.3 + 0.1),
        speedX: (Math.random() - 0.5) * 0.18,
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
        ctx.fillStyle = `rgba(255, 235, 215, ${currentOpacity})`;
        ctx.shadowColor = "rgba(255, 200, 160, 0.8)";
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

  // Automatically begin growing after 1.5s
  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Mark completion of the full 22-flower bouquet
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

      {/* Subtle Warm Amber & Rose Ambient Bottom Halo */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[65vh] w-[95vw] max-w-[700px] rounded-full bg-radial from-rose-950/15 via-amber-950/10 to-transparent blur-3xl pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* Touch Glow Ripples */}
      <div className="absolute inset-0 pointer-events-none z-30">
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

      {/* Top Header Section: Lena's Name & Final Message */}
      <header className="relative z-30 pt-8 sm:pt-12 px-4 text-center flex flex-col items-center">
        {/* Name: Lena Fathima K */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, delay: 0.3, ease: "easeOut" }}
          className="font-script-romantic text-4xl sm:text-5xl md:text-6xl text-[#FFF5F7] drop-shadow-[0_2px_20px_rgba(255,182,193,0.4)] tracking-wide"
        >
          Lena Fathima K
        </motion.h1>

        {/* Initial Tap Prompt */}
        <AnimatePresence>
          {!started && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="text-xs sm:text-sm text-rose-200/60 font-light tracking-widest uppercase mt-3 font-sans"
            >
              tap anywhere
            </motion.p>
          )}
        </AnimatePresence>

        {/* Final Soft Reveal Text: "For you, Lena ❤️" */}
        <AnimatePresence>
          {bloomComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="mt-3 flex flex-col items-center space-y-1"
            >
              <p className="font-serif-luxury text-xl sm:text-2xl text-rose-200/95 italic tracking-wide drop-shadow-[0_0_12px_rgba(244,114,182,0.4)]">
                For you, Lena ❤️
              </p>
              <p className="text-[11px] sm:text-xs text-stone-400 font-light tracking-wider uppercase font-sans">
                Just because.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Bouquet Container: Procedural Botanical Stems + Real Photographic Flower Blooms */}
      <div className="relative z-10 w-full max-w-[460px] sm:max-w-[540px] md:max-w-[620px] h-[68vh] sm:h-[72vh] flex items-end justify-center pointer-events-none pb-0">
        {/* Layer 1: SVG Stems growing organically from the bottom */}
        <svg
          viewBox="0 0 400 520"
          className="absolute inset-0 w-full h-full overflow-visible z-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="stemGradMain" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#1B3322" />
              <stop offset="60%" stopColor="#3E6B47" />
              <stop offset="100%" stopColor="#6C9A75" />
            </linearGradient>
            <linearGradient id="stemGradLight" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#1A3320" />
              <stop offset="60%" stopColor="#4D7C57" />
              <stop offset="100%" stopColor="#78A682" />
            </linearGradient>
          </defs>

          {/* Stems */}
          {BOUQUET_FLOWERS.map((f) => (
            <motion.path
              key={"stem-" + f.id}
              d={f.stem.d}
              fill="none"
              stroke="url(#stemGradMain)"
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
          ))}
        </svg>

        {/* Layer 2: 22 Individual Real Photographic Flowers with Natural Blooming & Sway */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          {BOUQUET_FLOWERS.map((f) => (
            <motion.div
              key={"bloom-" + f.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: started ? [0, 1.12, 1] : 0,
                opacity: started ? 1 : 0,
              }}
              transition={{
                duration: f.bloom.duration,
                delay: f.bloom.delay,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              style={{
                left: `${f.bloom.x}%`,
                bottom: `${f.bloom.y}%`,
                width: `${f.bloom.size}px`,
                height: `${f.bloom.size}px`,
                zIndex: f.bloom.zIndex,
                transform: `translate(-50%, 50%) rotate(${f.bloom.rotate}deg)`,
                transformOrigin: "center bottom",
              }}
              className={`absolute flex items-center justify-center ${f.bloom.swayClass}`}
            >
              {/* Real Photograph with Screen blend on Pitch Black (#000000) for seamless organic alpha */}
              <div className="relative w-full h-full mix-blend-screen select-none pointer-events-none">
                <Image
                  src={f.src}
                  alt={f.name}
                  fill
                  sizes="(max-width: 640px) 120px, 160px"
                  className="object-contain"
                  priority
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Very subtle bottom hint */}
      <footer className="relative z-30 pb-3 text-center">
        <span className="text-[10px] text-stone-600 tracking-widest uppercase font-light">
          {bloomComplete ? "tap anywhere to bloom with love" : ""}
        </span>
      </footer>
    </main>
  );
}
