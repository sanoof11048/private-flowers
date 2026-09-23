"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ActiveGiftRecord } from "@/types/gift";

interface GiftInteractionProps {
  visible?: boolean;
}

export default function GiftInteraction({ visible = true }: GiftInteractionProps) {
  const [activeGift, setActiveGift] = useState<ActiveGiftRecord | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch the server-side single active gift
  const fetchActiveGift = useCallback(async () => {
    try {
      const res = await fetch("/api/gift/active", {
        method: "GET",
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.activeGift) {
          setActiveGift(data.activeGift);
        } else {
          setActiveGift(null);
        }
      }
    } catch {
      // Non-blocking fallback
    }
  }, []);

  useEffect(() => {
    fetchActiveGift();
  }, [fetchActiveGift]);

  // Pause video if closed
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  // If no active gift is configured by admin, render nothing
  if (!visible || !activeGift) return null;

  return (
    <>
      {/* FIXED TOP-RIGHT VIEWPORT GIFT BUTTON */}
      <div className="fixed mt-25 top-[calc(12px+env(safe-area-inset-top,0px))] right-[calc(12px+env(safe-area-inset-right,0px))] sm:top-5 sm:right-6 z-[9999] pointer-events-auto select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setMediaError(false);
            }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#13141f]/90 hover:bg-[#1a1c2b]/95 active:scale-95 border border-rose-300/25 hover:border-rose-300/40 text-rose-100 hover:text-white text-xs sm:text-sm font-medium tracking-wide shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-200 cursor-pointer touch-manipulation whitespace-nowrap"
            title="Click for your gift 🎁"
          >
            <span>Do you want a gift? 🎁</span>
          </button>
        </motion.div>
      </div>

      {/* ACTIVE GIFT DISPLAY MODAL OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto select-none">
            {/* Background backdrop click to close */}
            <div
              className="absolute inset-0"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              key={`gift-viewer-${activeGift.id || "active"}`}
              initial={{ opacity: 0, scale: 0.92, y: 14 }}
              animate={{
                opacity: 1,
                scale: [0.92, 1.02, 1],
                y: 0,
              }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-sm sm:max-w-md bg-[#13141a]/95 border border-white/12 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl pointer-events-auto text-center max-h-[90vh] overflow-y-auto"
            >
              {/* Top Navigation & Close */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-rose-200/80 hover:text-rose-200 transition-colors cursor-pointer touch-manipulation"
                >
                  <span>← Back</span>
                </button>
                <span className="text-[11px] text-white/40 tracking-wide font-mono uppercase">
                  {activeGift.type} gift
                </span>
              </div>

              {/* Gift Title & Optional Subtitle */}
              <div className="mb-3">
                <h3 className="text-sm sm:text-base font-bold text-rose-200 tracking-wide">
                  {activeGift.title}
                </h3>
                {activeGift.subtitle && (
                  <p className="text-[11px] sm:text-xs text-white/50 mt-0.5">
                    {activeGift.subtitle}
                  </p>
                )}
              </div>

              {/* Media Content Display */}
              <div className="flex flex-col items-center justify-center min-h-[160px] my-1">
                {mediaError ? (
                  <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-white/[0.03] border border-white/10 w-full max-w-[240px] text-center">
                    <span className="text-3xl mb-2">🎁</span>
                    <p className="text-xs sm:text-sm font-medium text-white/80">
                      Gift coming soon 🎁
                    </p>
                  </div>
                ) : activeGift.type === "image" || activeGift.type === "gif" ? (
                  <div className="relative w-40 sm:w-48 aspect-square flex items-center justify-center p-1 rounded-xl bg-black/20 border border-white/5 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeGift.media_url || "/gifts/surprise.jpg"}
                      alt={activeGift.title}
                      onError={() => setMediaError(true)}
                      className="w-full h-full object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)] rounded-lg pointer-events-none"
                      draggable={false}
                    />
                  </div>
                ) : activeGift.type === "video" ? (
                  <div className="w-full max-w-[280px] aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10 shadow-lg">
                    <video
                      ref={videoRef}
                      src={activeGift.media_url || ""}
                      controls
                      playsInline
                      preload="metadata"
                      onError={() => setMediaError(true)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : activeGift.type === "tenor" ? (
                  <ActiveTenorEmbed
                    postId={activeGift.tenor_post_id || "12553196888763818675"}
                    onError={() => setMediaError(true)}
                  />
                ) : activeGift.type === "message" ? (
                  <div className="flex flex-col items-center justify-center py-4 px-3 space-y-2 text-center min-h-[100px] bg-white/[0.03] border border-white/5 rounded-xl w-full">
                    <p className="text-xs sm:text-sm text-rose-200/90 font-medium">
                      {activeGift.message || "A special message just for you."}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Playful Best-Friend Punchlines */}
              {activeGift.punchline && (
                <div className="mt-3 text-center">
                  <p className="text-xs sm:text-sm font-medium text-rose-200/90">
                    {activeGift.punchline}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Active Tenor GIF Embed with safe on-demand script & fallback
function ActiveTenorEmbed({
  postId,
  onError,
}: {
  postId: string;
  onError?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const SCRIPT_ID = "tenor-embed-script";

    const triggerTenorScan = () => {
      if (typeof window !== "undefined") {
        const win = window as unknown as {
          Tenor?: { Embed?: { init?: () => void } };
        };
        if (typeof win.Tenor?.Embed?.init === "function") {
          win.Tenor.Embed.init();
        }
      }
    };

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://tenor.com/embed.js";
      script.async = true;
      script.onload = () => {
        if (isMounted) triggerTenorScan();
      };
      script.onerror = () => {
        if (isMounted) {
          setLoadFailed(true);
          onError?.();
        }
      };
      document.body.appendChild(script);
    } else {
      triggerTenorScan();
    }

    return () => {
      isMounted = false;
    };
  }, [postId, onError]);

  if (loadFailed) {
    return (
      <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-white/[0.03] border border-white/10 w-full max-w-[240px] text-center">
        <span className="text-3xl mb-2">🐱💤</span>
        <p className="text-xs sm:text-sm font-medium text-white/85">
          Cat is taking a nap 😂
        </p>
        <a
          href={`https://tenor.com/view/${postId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-xs text-rose-200 font-medium transition-colors touch-manipulation"
        >
          Open GIF ↗
        </a>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-44 sm:w-52 aspect-square max-w-[220px] max-h-[220px] flex items-center justify-center overflow-hidden rounded-xl bg-black/20 border border-white/5 shadow-lg p-0.5 pointer-events-auto"
    >
      <div
        className="tenor-gif-embed w-full h-full"
        data-postid={postId}
        data-share-method="host"
        data-aspect-ratio="1"
        data-width="100%"
      >
        <a href={`https://tenor.com/view/${postId}`}>Cat Sticker</a>
      </div>
    </div>
  );
}
