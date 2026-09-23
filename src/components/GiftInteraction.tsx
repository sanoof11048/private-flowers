"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GIFTS_CONFIG, GiftItem } from "@/config/gifts";

interface GiftInteractionProps {
  visible: boolean;
}

export default function GiftInteraction({ visible }: GiftInteractionProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [mediaErrorMap, setMediaErrorMap] = useState<Record<string, boolean>>({});
  const [secretStepIndex, setSecretStepIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Stop video when closing viewer or switching gifts
  useEffect(() => {
    if (!selectedGift && videoRef.current) {
      videoRef.current.pause();
    }
  }, [selectedGift]);

  // Handle progressive secret message timer
  useEffect(() => {
    if (selectedGift?.type === "message" && selectedGift.secretSteps) {
      setSecretStepIndex(0);
      const timer1 = setTimeout(() => setSecretStepIndex(1), 1400);
      const timer2 = setTimeout(() => setSecretStepIndex(2), 3000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [selectedGift]);

  if (!visible) return null;

  const handleMediaError = (id: string) => {
    setMediaErrorMap((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="relative z-20 w-full max-w-md mx-auto mt-4 sm:mt-6 mb-6 px-4 text-center select-none">
      <AnimatePresence mode="wait">
        {/* State 0: Initial Subtle Invite Button */}
        {!isGalleryOpen ? (
          <motion.div
            key="gift-invite-btn"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ duration: 0.7, delay: 1.2, ease: "easeOut" }}
            className="flex justify-center"
          >
            <button
              type="button"
              onClick={() => setIsGalleryOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 border border-white/15 text-white/85 hover:text-white text-xs sm:text-sm font-medium tracking-wide shadow-md backdrop-blur-md transition-all duration-200 cursor-pointer touch-manipulation"
              title="Click for a surprise 🎁"
            >
              <span>Do you want a gift? 🎁</span>
            </button>
          </motion.div>
        ) : !selectedGift ? (
          /* State 1: Gift Selector Grid */
          <motion.div
            key="gift-selector-grid"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full bg-[#13141a]/85 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-lg"
          >
            {/* Header */}
            <div className="mb-3.5">
              <h3 className="text-sm sm:text-base font-medium text-rose-200/95 tracking-wide">
                Do you want a gift? 🎁
              </h3>
              <p className="text-[11px] sm:text-xs text-white/50 mt-0.5">
                Choose one 👀
              </p>
            </div>

            {/* Gift Options Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
              {GIFTS_CONFIG.map((gift) => (
                <button
                  key={gift.id}
                  type="button"
                  onClick={() => setSelectedGift(gift)}
                  className="group relative flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] active:scale-95 border border-white/[0.08] hover:border-rose-400/30 transition-all duration-200 cursor-pointer touch-manipulation text-center"
                >
                  <span className="text-2xl sm:text-3xl mb-1.5 transition-transform duration-200 group-hover:scale-110">
                    {gift.icon}
                  </span>
                  <span className="text-[11px] sm:text-xs font-medium text-white/85 group-hover:text-white line-clamp-1">
                    {gift.title}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-white/40 group-hover:text-white/60 line-clamp-1 mt-0.5">
                    {gift.subtitle}
                  </span>
                </button>
              ))}
            </div>

            {/* Subtle Close Prompt */}
            <div className="mt-3.5 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="text-[10px] sm:text-xs text-white/40 hover:text-white/70 transition-colors py-1 px-3 rounded-full hover:bg-white/[0.04]"
              >
                Close gift box
              </button>
            </div>
          </motion.div>
        ) : (
          /* State 2: Selected Gift Viewer */
          <motion.div
            key={`gift-viewer-${selectedGift.id}`}
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{
              opacity: 1,
              scale: [0.9, 1.03, 1],
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full bg-[#13141a]/90 border border-white/12 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl pointer-events-auto"
          >
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <button
                type="button"
                onClick={() => setSelectedGift(null)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-rose-200/80 hover:text-rose-200 transition-colors cursor-pointer touch-manipulation"
              >
                <span>← Back to gifts</span>
              </button>
              <span className="text-[11px] text-white/40 tracking-wide font-mono uppercase">
                {selectedGift.badge}
              </span>
            </div>

            {/* Media Content Display */}
            <div className="flex flex-col items-center justify-center min-h-[160px] my-1">
              {/* If media failed to load, show clean friendly placeholder */}
              {selectedGift.src && mediaErrorMap[selectedGift.id] ? (
                <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-white/[0.03] border border-white/10 w-full max-w-[240px] text-center">
                  <span className="text-3xl mb-2">🎁</span>
                  <p className="text-xs sm:text-sm font-medium text-white/80">
                    Gift coming soon 🎁
                  </p>
                  <p className="text-[10px] text-white/40 mt-1">
                    Asset placeholder ready
                  </p>
                </div>
              ) : selectedGift.type === "product" || selectedGift.type === "image" ? (
                <div className="relative w-36 sm:w-44 aspect-square flex items-center justify-center p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedGift.src}
                    alt={selectedGift.title}
                    onError={() => handleMediaError(selectedGift.id)}
                    className="w-full h-full object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)] rounded-xl pointer-events-none"
                    draggable={false}
                  />
                </div>
              ) : selectedGift.type === "gif" ? (
                <div className="relative w-40 sm:w-48 max-h-[220px] flex items-center justify-center overflow-hidden rounded-xl bg-black/20 border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedGift.src}
                    alt={selectedGift.title}
                    onError={() => handleMediaError(selectedGift.id)}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              ) : selectedGift.type === "video" ? (
                <div className="w-full max-w-[280px] aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10 shadow-lg">
                  <video
                    ref={videoRef}
                    src={selectedGift.src}
                    controls
                    playsInline
                    preload="metadata"
                    onError={() => handleMediaError(selectedGift.id)}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : selectedGift.type === "message" ? (
                /* Multi-Stage Secret Message Reveal */
                <div className="flex flex-col items-center justify-center py-4 px-3 space-y-2 text-center min-h-[140px]">
                  {selectedGift.secretSteps?.map((stepText, idx) => (
                    <motion.p
                      key={idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{
                        opacity: secretStepIndex >= idx ? 1 : 0,
                        y: secretStepIndex >= idx ? 0 : 6,
                      }}
                      transition={{ duration: 0.4 }}
                      className={`font-medium ${
                        idx === 0
                          ? "text-xs sm:text-sm text-white/70"
                          : idx === 1
                          ? "text-xs sm:text-sm text-rose-300 font-semibold"
                          : "text-sm sm:text-base text-rose-200 font-bold"
                      }`}
                    >
                      {secretStepIndex >= idx ? stepText : ""}
                    </motion.p>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Playful Best-Friend Punchlines */}
            {selectedGift.type !== "message" && (
              <div className="mt-3 text-center">
                <p className="text-xs sm:text-sm font-medium text-rose-200/90">
                  {selectedGift.punchline}
                </p>
                {selectedGift.subtext && (
                  <p className="text-[10px] sm:text-xs text-white/50 mt-0.5 tracking-wide">
                    {selectedGift.subtext}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
