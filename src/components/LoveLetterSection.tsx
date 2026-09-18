"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Heart } from "lucide-react";
import { ROMANTIC_CONFIG } from "@/config/romanticContent";

export default function LoveLetterSection() {
  const { heading, paragraphs, noteSubtext } = ROMANTIC_CONFIG.mainMessage;

  return (
    <section
      id="message"
      className="relative min-h-[90vh] w-full flex items-center justify-center px-4 py-20 overflow-hidden"
    >
      {/* Background soft ambient halo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div className="h-[400px] w-[400px] sm:h-[600px] sm:w-[600px] rounded-full bg-gradient-to-tr from-rose-100/50 via-amber-50/40 to-transparent blur-3xl" />
      </div>

      <div className="max-w-2xl w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative luxury-glass rounded-3xl p-8 sm:p-12 md:p-16 border border-rose-200/70 shadow-2xl shadow-rose-950/8"
        >
          {/* Subtle gold ribbon line decor */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 px-6 py-1.5 rounded-full bg-gradient-to-r from-[#801B34] via-[#9B2841] to-[#801B34] text-amber-100 shadow-md border border-amber-300/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[11px] sm:text-xs font-serif tracking-widest uppercase font-medium">
              A Note For Your Heart
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </div>

          {/* Letter Header */}
          <div className="text-center pt-2 sm:pt-4 mb-8 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif-luxury font-normal text-[#4A1525] tracking-tight">
              {heading}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-rose-300" />
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-300" />
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-rose-300" />
            </div>
          </div>

          {/* Letter Body - Handwritten style & elegant typography */}
          <div className="space-y-6 text-[#4A2831] leading-relaxed text-center sm:text-left">
            {paragraphs.map((p, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.2 + idx * 0.2 }}
                className="text-lg sm:text-xl md:text-2xl font-serif italic leading-relaxed text-[#4A2831]/95"
              >
                &ldquo;{p}&rdquo;
              </motion.p>
            ))}
          </div>

          {/* Subtle note footer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mt-10 pt-6 border-t border-rose-200/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
          >
            <span className="text-xs sm:text-sm text-[#8A6D74] font-light">
              {noteSubtext}
            </span>

            {/* Faux luxury wax seal stamp */}
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#801B34] to-[#4A0E1A] shadow-md flex items-center justify-center text-amber-200 text-xs font-serif font-bold border border-amber-300/30">
                LFK
              </div>
              <div className="text-[11px] text-[#6B172A] font-serif italic text-left">
                Made for Lena
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
