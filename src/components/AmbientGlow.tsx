"use client";

import React from "react";
import { motion } from "framer-motion";

export default function AmbientGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Top soft rose glow */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.5, 0.35],
          x: [0, 15, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[10%] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-br from-rose-200/50 via-pink-100/40 to-transparent blur-3xl md:h-[700px] md:w-[700px]"
      />

      {/* Subtle gold glow on right */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-[35%] -right-[10%] h-[400px] w-[400px] rounded-full bg-amber-100/40 blur-3xl md:h-[600px] md:w-[600px]"
      />

      {/* Gentle blush glow on bottom left */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
        className="absolute bottom-[10%] -left-[10%] h-[450px] w-[450px] rounded-full bg-rose-100/40 blur-3xl md:h-[650px] md:w-[650px]"
      />
    </div>
  );
}
