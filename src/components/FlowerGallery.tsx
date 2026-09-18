"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Info, X, Heart } from "lucide-react";
import { ROMANTIC_CONFIG, FlowerCard } from "@/config/romanticContent";

export default function FlowerGallery() {
  const { sectionTitle, sectionSubtitle, flowers } = ROMANTIC_CONFIG.gallery;
  const [selectedFlower, setSelectedFlower] = useState<FlowerCard | null>(null);

  return (
    <section id="flowers" className="relative min-h-screen w-full px-4 py-24 sm:py-28 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/3 left-0 h-96 w-96 rounded-full bg-rose-100/40 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-96 w-96 rounded-full bg-amber-50/50 blur-3xl" />
      </div>

      <div className="max-w-6xl w-full mx-auto">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-100/70 border border-rose-200 text-rose-800 text-xs font-serif uppercase tracking-widest mb-3"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Curated Blooms
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

        {/* Flowers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {flowers.map((flower, index) => (
            <motion.div
              key={flower.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.12 }}
              className="group relative"
            >
              <div className="relative h-full flex flex-col rounded-3xl overflow-hidden luxury-glass border border-rose-200/60 p-4 transition-all duration-500 group-hover:border-rose-300 group-hover:shadow-xl group-hover:shadow-rose-950/10 group-hover:-translate-y-1.5">
                {/* Real Flower Photograph Container */}
                <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-rose-50">
                  <Image
                    src={flower.imageUrl}
                    alt={flower.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />

                  {/* Botanical name pill */}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-[11px] font-serif italic border border-white/20">
                    {flower.botanicalName}
                  </span>
                </div>

                {/* Card Content */}
                <div className="pt-5 pb-2 px-2 flex flex-col flex-grow justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl sm:text-2xl font-serif text-[#4A1525] font-semibold">
                        {flower.name}
                      </h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                        {flower.symbolism}
                      </span>
                    </div>

                    <p className="text-base sm:text-lg font-serif italic text-[#7A3E4E] leading-snug mt-2">
                      &ldquo;{flower.tagline}&rdquo;
                    </p>

                    <p className="text-xs sm:text-sm text-[#6B4E54]/90 font-light mt-3 leading-relaxed">
                      {flower.description}
                    </p>
                  </div>

                  {/* Card bottom quick inspect button */}
                  <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedFlower(flower)}
                      className="text-xs text-[#9B2841] font-medium flex items-center gap-1.5 hover:underline cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                      View blossom detail
                    </button>
                    <Heart className="w-4 h-4 text-rose-300 group-hover:text-rose-500 group-hover:fill-rose-500 transition-colors duration-300" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Flower Detail Modal */}
      <AnimatePresence>
        {selectedFlower && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative max-w-lg w-full rounded-3xl bg-[#FAF6F0] p-6 sm:p-8 shadow-2xl border border-rose-200 overflow-hidden"
            >
              <button
                onClick={() => setSelectedFlower(null)}
                aria-label="Close modal"
                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 text-gray-600 hover:text-gray-900 border border-rose-100 shadow-xs cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden mb-5">
                <Image
                  src={selectedFlower.imageUrl}
                  alt={selectedFlower.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-2xl font-serif text-[#4A1525] font-bold">
                    {selectedFlower.name}
                  </h4>
                  <span className="text-xs px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-medium">
                    {selectedFlower.botanicalName}
                  </span>
                </div>

                <p className="text-lg font-serif italic text-rose-800">
                  &ldquo;{selectedFlower.tagline}&rdquo;
                </p>

                <p className="text-sm text-[#4A2831] leading-relaxed">
                  {selectedFlower.description}
                </p>

                <div className="pt-3 border-t border-rose-100 flex items-center justify-between text-xs text-[#8A6D74]">
                  <span>Symbolism: {selectedFlower.symbolism}</span>
                  <span className="italic font-serif">Selected for Lena</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
