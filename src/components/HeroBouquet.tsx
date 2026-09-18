"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Sparkles, Heart, Flower2 } from "lucide-react";
import { ROMANTIC_CONFIG } from "@/config/romanticContent";

export default function HeroBouquet() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenBouquet = () => {
    setIsOpen(true);

    // Realistic delicate floral petal burst
    try {
      // Center burst
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#FCD1DC", "#F7A8B8", "#E66882", "#FFF0F3", "#DFBA73"],
        shapes: ["circle"],
        scalar: 1.2,
        ticks: 200,
        gravity: 0.6,
        drift: 0.1,
      });

      // Secondary floating side drifts
      setTimeout(() => {
        confetti({
          particleCount: 35,
          angle: 60,
          spread: 60,
          origin: { x: 0.2, y: 0.6 },
          colors: ["#FFE3E8", "#FCD1DC", "#E66882"],
          gravity: 0.5,
          scalar: 1.1,
        });
        confetti({
          particleCount: 35,
          angle: 120,
          spread: 60,
          origin: { x: 0.8, y: 0.6 },
          colors: ["#FFE3E8", "#FCD1DC", "#DFBA73"],
          gravity: 0.5,
          scalar: 1.1,
        });
      }, 250);
    } catch {
      // Fallback gracefully if canvas-confetti is unsupported
    }

    // Smooth transition to the love letter section after bouquet blooms
    setTimeout(() => {
      const messageEl = document.getElementById("message");
      if (messageEl) {
        messageEl.scrollIntoView({ behavior: "smooth" });
      }
    }, 1000);
  };

  return (
    <section
      id="bouquet"
      className="relative min-h-[100dvh] w-full flex flex-col items-center justify-between px-4 pt-20 pb-8 sm:pt-24 sm:pb-12 overflow-hidden"
    >
      {/* Cinematic subtle glow backdrop behind bouquet */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: [1, 1.08, 1] }}
          transition={{
            opacity: { duration: 2, ease: "easeOut" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          }}
          className="h-[300px] w-[300px] sm:h-[450px] sm:w-[450px] rounded-full bg-gradient-to-tr from-rose-200/40 via-pink-100/50 to-amber-100/30 blur-2xl"
        />
      </div>

      {/* Top Header Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl w-full flex flex-col items-center text-center space-y-2 z-20"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 border border-rose-200/60 shadow-xs mb-1">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-[11px] sm:text-xs font-medium tracking-widest uppercase text-rose-800/80">
            {ROMANTIC_CONFIG.hero.preTitle}
          </span>
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif-luxury font-medium tracking-tight text-[#4A1525] drop-shadow-xs">
          {ROMANTIC_CONFIG.hero.title}
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-[#6B4E54] font-light max-w-md mx-auto leading-relaxed">
          {ROMANTIC_CONFIG.hero.subtitle}
        </p>
      </motion.div>

      {/* Center Bouquet Experience */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{
          opacity: 1,
          scale: isOpen ? 1.06 : 1,
          y: 0,
        }}
        transition={{
          opacity: { duration: 1.5, delay: 0.2, ease: "easeOut" },
          scale: { duration: isOpen ? 0.9 : 1.5, ease: "easeOut" },
          y: { duration: 1.2, ease: "easeOut" },
        }}
        className="relative my-auto py-2 group z-20 flex flex-col items-center"
      >
        {/* Outer romantic blooming halo */}
        <motion.div
          animate={{
            rotate: 360,
            scale: isOpen ? [1, 1.15, 1.05] : [1, 1.03, 1],
          }}
          transition={{
            rotate: { duration: 60, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute -inset-4 sm:-inset-6 rounded-full border border-rose-200/50 border-dashed pointer-events-none"
        />

        {/* Bouquet Frame with realistic imagery & luxury glass border */}
        <div className="relative h-[240px] w-[240px] sm:h-[320px] sm:w-[320px] md:h-[360px] md:w-[360px] rounded-full p-2.5 sm:p-3 luxury-glass shadow-2xl shadow-rose-950/10">
          <div className="relative h-full w-full rounded-full overflow-hidden border border-white/80 shadow-inner">
            <Image
              src={ROMANTIC_CONFIG.hero.bouquetImage}
              alt={ROMANTIC_CONFIG.hero.bouquetAlt}
              fill
              priority
              sizes="(max-width: 640px) 240px, (max-width: 768px) 320px, 360px"
              className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
            />

            {/* Soft overlay gradient for cinematic warmth */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#4A1525]/25 via-transparent to-rose-100/10 pointer-events-none" />

            {/* Floating micro-shimmer sparkle nodes */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/4 h-2 w-2 rounded-full bg-white shadow-lg shadow-white"
              />
              <motion.div
                animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1, ease: "easeInOut" }}
                className="absolute bottom-1/3 right-1/4 h-2 w-2 rounded-full bg-rose-200 shadow-lg shadow-rose-200"
              />
            </div>
          </div>

          {/* Subtle floating romantic tag badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full luxury-glass border border-rose-300/60 shadow-lg flex items-center gap-1.5 whitespace-nowrap"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-serif italic text-[#6B172A] tracking-wider">
              Roses • Baby&apos;s Breath • Tulips • Peonies
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* CTA Button: Open Your Bouquet & Bottom Prompts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
        className="w-full flex flex-col items-center text-center z-20 mt-4"
      >
        <button
          onClick={handleOpenBouquet}
          disabled={isOpen}
          className={`relative group px-8 py-3.5 sm:px-10 sm:py-4 rounded-full font-medium text-sm sm:text-base tracking-wide transition-all duration-500 cursor-pointer shadow-xl ${
            isOpen
              ? "bg-rose-100 text-rose-900 border border-rose-300 scale-95 shadow-inner"
              : "bg-gradient-to-r from-[#801B34] via-[#9B2841] to-[#6B172A] text-[#FAF6F0] hover:shadow-rose-900/30 hover:scale-[1.03] active:scale-[0.98] border border-rose-400/30"
          }`}
        >
          <span className="relative z-10 flex items-center gap-2.5">
            <Flower2 className="w-4 h-4 text-rose-200" />
            {isOpen ? "Bouquet Blossomed ✨" : ROMANTIC_CONFIG.hero.ctaButton}
          </span>

          {!isOpen && (
            <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-rose-300 via-amber-200 to-rose-300 opacity-0 group-hover:opacity-40 blur-sm transition-opacity duration-500 -z-10" />
          )}
        </button>

        <p className="mt-2 text-xs text-[#8A6D74] font-light italic">
          Tap to open the bouquet & reveal what&apos;s inside
        </p>
      </motion.div>
    </section>
  );
}
