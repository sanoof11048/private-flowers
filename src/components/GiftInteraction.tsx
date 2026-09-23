"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GiftInteractionProps {
  visible: boolean;
}

export default function GiftInteraction({ visible }: GiftInteractionProps) {
  const [isOpened, setIsOpened] = useState(false);

  if (!visible) return null;

  return (
    <div className="relative z-20 w-full max-w-xs mx-auto mt-2 sm:mt-4 mb-4 px-4 text-center select-none">
      <AnimatePresence mode="wait">
        {!isOpened ? (
          <motion.div
            key="gift-btn"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
            transition={{ duration: 0.7, delay: 1.5, ease: "easeOut" }}
            className="flex justify-center"
          >
            <button
              type="button"
              onClick={() => setIsOpened(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 border border-white/15 text-white/85 hover:text-white text-xs sm:text-sm font-medium tracking-wide shadow-md backdrop-blur-sm transition-all duration-200 cursor-pointer touch-manipulation"
              title="Click for a surprise 🎁"
            >
              <span>Do you want a gift? 🎁</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="gift-content"
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{
              opacity: 1,
              scale: [0.85, 1.05, 1],
              y: 0,
            }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex flex-col items-center justify-center pointer-events-auto"
          >
            {/* Real Kinder Joy Product Image */}
            <div className="relative w-40 sm:w-48 aspect-square flex items-center justify-center p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/kinder-joy.png"
                alt="Kinder Joy"
                className="w-full h-full object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)] rounded-xl pointer-events-none"
                draggable={false}
              />
            </div>

            {/* Playful Best-Friend Punchlines */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="text-sm sm:text-base font-medium text-rose-200/90 mt-2"
            >
              Your gift 😂🍫
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-[11px] sm:text-xs text-white/50 mt-0.5 tracking-wide"
            >
              Don&apos;t say I never give you anything.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
