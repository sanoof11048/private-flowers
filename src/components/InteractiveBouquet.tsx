"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, TouchpadIcon } from "lucide-react";
import confetti from "canvas-confetti";
import { ROMANTIC_CONFIG, InteractiveFlower } from "@/config/romanticContent";

export default function InteractiveBouquet() {
  const { sectionTitle, sectionSubtitle, bouquetImage, flowers } =
    ROMANTIC_CONFIG.interactiveBouquet;

  const [activeFlower, setActiveFlower] = useState<InteractiveFlower | null>(flowers[0]);
  const [tapCount, setTapCount] = useState(0);

  const handleFlowerTap = (flower: InteractiveFlower, e: React.MouseEvent) => {
    setActiveFlower(flower);
    setTapCount((prev) => prev + 1);

    // Subtle localized petal burst
    try {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 18,
        spread: 45,
        origin: { x, y },
        colors: ["#FCD1DC", "#F7A8B8", "#FFE3E8", "#DFBA73"],
        shapes: ["circle"],
        scalar: 0.9,
        gravity: 0.6,
        ticks: 120,
      });
    } catch {
      // Graceful fallback
    }
  };

  return (
    <section
      id="interactive"
      className="relative min-h-screen w-full px-4 py-24 sm:py-28 overflow-hidden bg-gradient-to-b from-transparent via-rose-50/30 to-transparent"
    >
      {/* Soft background lighting */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
        <div className="h-[450px] w-[450px] sm:h-[650px] sm:w-[650px] rounded-full bg-rose-100/30 blur-3xl" />
      </div>

      <div className="max-w-5xl w-full mx-auto">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 border border-rose-200 text-rose-800 text-xs font-serif uppercase tracking-widest mb-3 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Interactive Garden
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-serif-luxury font-medium text-[#4A1525] tracking-tight"
          >
            {sectionTitle}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg text-[#6B4E54] font-light mt-3"
          >
            {sectionSubtitle}
          </motion.p>
        </div>

        {/* Interactive Showcase: Layout with Bouquet on left/center & Note Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Bouquet Canvas Area (7 cols on desktop) */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="relative w-full max-w-[420px] sm:max-w-[480px] aspect-square rounded-3xl p-3.5 sm:p-4 luxury-glass shadow-2xl shadow-rose-950/10 border border-rose-200/80">
              <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-inner">
                <Image
                  src={bouquetImage}
                  alt="Interactive Bouquet for Lena"
                  fill
                  sizes="(max-width: 640px) 380px, 480px"
                  className="object-cover object-center"
                />

                <div className="absolute inset-0 bg-radial-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

                {/* Interactive Flower Hotspot Pins */}
                {flowers.map((flower) => {
                  const isSelected = activeFlower?.id === flower.id;

                  return (
                    <div
                      key={flower.id}
                      style={{ left: `${flower.x}%`, top: `${flower.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                    >
                      <button
                        onClick={(e) => handleFlowerTap(flower, e)}
                        aria-label={`Tap ${flower.name}`}
                        className={`relative group flex items-center justify-center cursor-pointer transition-all duration-300 ${
                          isSelected ? "scale-125" : "hover:scale-115 scale-100"
                        }`}
                      >
                        {/* Radiant pulse circle */}
                        <span className="absolute -inset-2 rounded-full bg-rose-400/40 animate-ping" />
                        <span
                          className={`relative flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full shadow-lg border backdrop-blur-md transition-colors ${
                            isSelected
                              ? "bg-[#801B34] border-white text-white shadow-rose-900/50"
                              : "bg-white/90 border-rose-300 text-rose-800 hover:bg-white"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isSelected ? "fill-white text-white" : "fill-rose-400 text-rose-500"
                            }`}
                          />
                        </span>

                        {/* Floating mini-label on hover/focus */}
                        <span className="absolute top-full mt-1 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {flower.name}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Instructions banner at bottom of bouquet */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-rose-200 shadow-md text-xs text-[#6B172A] font-serif italic flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                Tap any glowing heart on the flowers
              </div>
            </div>
          </div>

          {/* Secret Message Card (5 cols on desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {activeFlower && (
                <motion.div
                  key={activeFlower.id}
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="luxury-glass rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-xl shadow-rose-950/5 relative overflow-hidden"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-rose-200">
                      <Image
                        src={activeFlower.imageUrl}
                        alt={activeFlower.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-serif uppercase tracking-widest text-rose-600 font-semibold">
                        Blossom Whisper
                      </span>
                      <h3 className="text-xl font-serif text-[#4A1525] font-bold">
                        {activeFlower.name}
                      </h3>
                    </div>
                  </div>

                  {/* The Revealed Romantic Message */}
                  <div className="my-5 p-5 rounded-2xl bg-white/70 border border-rose-100 shadow-inner">
                    <p className="text-xl sm:text-2xl font-serif italic text-[#6B172A] leading-relaxed text-center">
                      &ldquo;{activeFlower.message}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#8A6D74] pt-2">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                      For Lena Fathima K
                    </span>
                    <span className="italic font-serif">A little daily reminder</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tap selector pills for accessible quick switching */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center lg:justify-start">
              {flowers.map((f) => (
                <button
                  key={f.id}
                  onClick={(e) => handleFlowerTap(f, e)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                    activeFlower?.id === f.id
                      ? "bg-[#6B172A] text-white shadow-xs"
                      : "bg-white/70 text-[#6B172A] hover:bg-white border border-rose-100"
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
