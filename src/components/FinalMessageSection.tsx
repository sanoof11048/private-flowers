"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Sparkles, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
import { ROMANTIC_CONFIG } from "@/config/romanticContent";

export default function FinalMessageSection() {
  const { heading, body, bouquetImage, signoff } = ROMANTIC_CONFIG.finalMessage;
  const [smiled, setSmiled] = useState(false);

  const handleSmileClick = () => {
    setSmiled(true);
    try {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.8 },
        colors: ["#FCD1DC", "#F7A8B8", "#E66882", "#DFBA73", "#FFFFFF"],
        shapes: ["circle"],
        scalar: 1.1,
      });
    } catch {
      // Ignore
    }
  };

  const handleReplay = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section
      id="for-you"
      className="relative min-h-screen w-full px-4 py-24 sm:py-32 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
        <div className="h-[500px] w-[500px] sm:h-[700px] sm:w-[700px] rounded-full bg-gradient-to-tr from-rose-200/40 via-pink-100/30 to-amber-100/20 blur-3xl" />
      </div>

      <div className="max-w-3xl w-full mx-auto text-center z-10">
        {/* Step 1: Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="space-y-4 mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/70 border border-rose-200 text-xs font-serif uppercase tracking-widest text-[#9B2841] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            From The Bottom of My Heart
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif-luxury font-medium text-[#4A1525] tracking-tight">
            {heading}
          </h2>
        </motion.div>

        {/* Step 2: Main Emotional Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="luxury-glass rounded-3xl p-8 sm:p-12 border border-rose-200 shadow-2xl shadow-rose-950/8 mb-10 max-w-2xl mx-auto"
        >
          <p className="text-xl sm:text-2xl md:text-3xl font-serif italic leading-relaxed text-[#4A1525] whitespace-pre-line">
            {body}
          </p>

          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-3 my-8">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-rose-300" />
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-rose-300" />
          </div>

          {/* Realistic Final Bouquet Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="relative mx-auto my-6 h-[220px] w-[220px] sm:h-[280px] sm:w-[280px] rounded-full p-2.5 luxury-glass shadow-xl"
          >
            <div className="relative h-full w-full rounded-full overflow-hidden border border-white/80">
              <Image
                src={bouquetImage}
                alt="Romantic Bouquet for Lena Fathima K"
                fill
                sizes="(max-width: 640px) 220px, 280px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rose-950/20 via-transparent to-transparent" />
            </div>
          </motion.div>

          {/* Signoff */}
          <div className="mt-8 text-right pr-4 sm:pr-8">
            <p className="text-xl sm:text-2xl font-serif italic text-[#6B172A] leading-tight whitespace-pre-line">
              {signoff}
            </p>
          </div>
        </motion.div>

        {/* Action Buttons: Smile & Replay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={handleSmileClick}
            className="px-6 py-3 rounded-full bg-white/80 hover:bg-white text-[#6B172A] border border-rose-200/80 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-sm font-medium cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 ${
                smiled ? "text-rose-500 fill-rose-500 scale-125" : "text-rose-400"
              } transition-transform`}
            />
            <span>{smiled ? "Made you smile! ✨" : "Send a gentle smile"}</span>
          </button>

          <button
            onClick={handleReplay}
            className="px-6 py-3 rounded-full luxury-glass text-[#6B172A] hover:bg-white border border-rose-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-2 text-sm font-medium cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Replay bouquet opening</span>
          </button>
        </motion.div>

        {/* Minimal Footer */}
        <footer className="mt-20 pt-8 border-t border-rose-200/40 text-center text-xs text-[#8A6D74] space-y-1">
          <p className="font-serif italic text-sm text-[#6B172A]">
            Forever in bloom for Lena Fathima K
          </p>
          <p className="font-light text-[11px]">
            A private gift of love & flowers • {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </section>
  );
}
