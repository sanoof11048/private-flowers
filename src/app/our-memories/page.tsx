"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Heart,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Film,
  Image as ImageIcon,
  LogOut,
  RefreshCw,
} from "lucide-react";

interface MediaItem {
  id: string;
  filename: string;
  relativePath?: string;
  type: "image" | "video";
  format: string;
  sizeBytes: number;
  mtime: number;
  width?: number;
  height?: number;
  aspectRatio?: number;
  mediaUrl?: string;
  thumbUrl?: string | null;
}

/**
 * High-performance Video Memory Card that defers video loading until in-view
 */
function VideoMemoryCard({
  item,
  index,
  isLoaded,
  onLoaded,
}: {
  item: MediaItem;
  index: number;
  isLoaded: boolean;
  onLoaded: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(index < 4);
  const mediaUrl = item.mediaUrl || `/api/memories/media/${item.id}`;

  useEffect(() => {
    if (isInView) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "350px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isInView]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-neutral-900 flex items-center justify-center"
      style={{ aspectRatio: item.aspectRatio ? `${item.aspectRatio}` : "0.75" }}
    >
      {isInView ? (
        <video
          src={mediaUrl}
          preload="metadata"
          playsInline
          muted
          onLoadedMetadata={onLoaded}
          onLoadedData={onLoaded}
          onError={onLoaded}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
            isLoaded ? "opacity-85 group-hover:opacity-100" : "opacity-0"
          }`}
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-900/90 flex items-center justify-center">
          <Film className="w-6 h-6 text-neutral-600" />
        </div>
      )}

      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors pointer-events-none">
        <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Play className="w-5 h-5 fill-white ml-0.5" />
        </div>
      </div>

      <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] text-white flex items-center gap-1 font-mono pointer-events-none">
        <Film className="w-3 h-3 text-rose-300" />
        <span>VIDEO · {item.format}</span>
      </div>
    </div>
  );
}

export default function OurMemoriesPage() {
  const prefersReducedMotion = useReducedMotion();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gallery Data & Filter State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Real-time Media Loading Tracking State
  const [loadedMediaIds, setLoadedMediaIds] = useState<Set<string>>(new Set());

  // Refined Loading Indicator Controls
  const [showIndicator, setShowIndicator] = useState(false);
  const [isFullyGathered, setIsFullyGathered] = useState(false);

  // Lightbox / Memory Viewer State
  const [activeViewerIndex, setActiveViewerIndex] = useState<number | null>(null);

  // Mark an item as loaded or failed (both count as completed attempts)
  const markLoaded = useCallback((id: string) => {
    setLoadedMediaIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // 1. Check Initial Authentication Status
  const checkAuthStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/memories/auth/status", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(Boolean(data.authenticated));
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // 2. Fetch Media List Once Authenticated
  const fetchMediaList = useCallback(async () => {
    setIsDiscovering(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/memories/list", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const items = data.items || [];
        setMediaItems(items);
        if (items.length === 0) {
          setLoadError("No memories were found in storage.");
        }
      } else if (res.status === 401) {
        setIsAuthenticated(false);
      } else {
        setLoadError(`Server returned status ${res.status}. Please try again.`);
      }
    } catch (err) {
      console.error("Failed to load memories:", err);
      setLoadError("Connection error while loading memories. Please check network and retry.");
    } finally {
      setIsDiscovering(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMediaList();
    }
  }, [isAuthenticated, fetchMediaList]);

  // 3. Controlled Background Progressive Preloader Queue
  // Loads visible media first, then progressively preloads remaining items with concurrency limit of 2
  useEffect(() => {
    if (mediaItems.length === 0) return;

    let isCancelled = false;
    const concurrency = 2;
    let activeWorkers = 0;
    let nextIndex = 0;

    const pumpQueue = () => {
      if (isCancelled) return;

      while (activeWorkers < concurrency && nextIndex < mediaItems.length) {
        const item = mediaItems[nextIndex];
        nextIndex++;

        // If already marked loaded from DOM or previous iteration, continue
        if (loadedMediaIds.has(item.id)) {
          continue;
        }

        activeWorkers++;

        if (item.type === "image") {
          const img = new Image();
          img.src = item.thumbUrl || `/api/memories/media/${item.id}?thumb=1`;

          const onFinish = () => {
            markLoaded(item.id);
            activeWorkers--;
            pumpQueue();
          };

          img.onload = onFinish;
          img.onerror = onFinish;
        } else {
          // Warm video stream probe via HTTP Range request (2KB header)
          const targetUrl = item.mediaUrl || `/api/memories/media/${item.id}`;
          fetch(targetUrl, {
            headers: { Range: "bytes=0-2048" },
          })
            .then(() => markLoaded(item.id))
            .catch(() => markLoaded(item.id))
            .finally(() => {
              activeWorkers--;
              pumpQueue();
            });
        }
      }
    };

    // Small delay to prioritize immediate DOM render of visible items
    const timer = setTimeout(() => {
      pumpQueue();
    }, 120);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [mediaItems, markLoaded, loadedMediaIds]);

  // Calculate live accurate progress
  const totalItemsCount = mediaItems.length;
  const loadedCount = Math.min(loadedMediaIds.size, totalItemsCount);
  const progressPercentage =
    totalItemsCount > 0 ? Math.round((loadedCount / totalItemsCount) * 100) : 0;
  const isFullyLoaded = totalItemsCount > 0 && loadedCount >= totalItemsCount;

  // 4. Subtle, Calm Indicator Lifecycle (Flash Avoidance & Graceful Completion)
  useEffect(() => {
    if (!isAuthenticated) return;

    // Grace period timer (140ms): only show if loading genuinely takes time
    const graceTimer = setTimeout(() => {
      if (!isFullyLoaded) {
        setShowIndicator(true);
      }
    }, 140);

    return () => clearTimeout(graceTimer);
  }, [isAuthenticated, isFullyLoaded]);

  useEffect(() => {
    if (isFullyLoaded && showIndicator) {
      setIsFullyGathered(true);
      // Let user calmly see completion transition, then gently dissolve
      const dismissTimer = setTimeout(() => {
        setShowIndicator(false);
      }, 1500);
      return () => clearTimeout(dismissTimer);
    }
  }, [isFullyLoaded, showIndicator]);

  // 5. Handle Login Submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/memories/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPassword("");
        setIsAuthenticated(true);
      } else {
        setAuthError(data.error || "Not quite, love. Try again ♡");
      }
    } catch {
      setAuthError("Could not connect. Please try again ♡");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Handle Logout / Lock Gallery
  const handleLogout = async () => {
    try {
      await fetch("/api/memories/auth/logout", {
        method: "POST",
      });
    } catch {
      // Ignore
    } finally {
      setIsAuthenticated(false);
      setMediaItems([]);
      setLoadedMediaIds(new Set());
      setShowIndicator(false);
      setIsFullyGathered(false);
      setActiveViewerIndex(null);
    }
  };

  // Filtered Media List
  const filteredItems = mediaItems.filter((item) => {
    if (filter === "image") return item.type === "image";
    if (filter === "video") return item.type === "video";
    return true;
  });

  // Modal Navigation
  const activeMedia =
    activeViewerIndex !== null ? filteredItems[activeViewerIndex] : null;

  const handlePrev = useCallback(() => {
    if (activeViewerIndex === null) return;
    setActiveViewerIndex((prev) =>
      prev! > 0 ? prev! - 1 : filteredItems.length - 1
    );
  }, [activeViewerIndex, filteredItems.length]);

  const handleNext = useCallback(() => {
    if (activeViewerIndex === null) return;
    setActiveViewerIndex((prev) =>
      prev! < filteredItems.length - 1 ? prev! + 1 : 0
    );
  }, [activeViewerIndex, filteredItems.length]);

  // Keyboard Navigation for Lightbox & Body Scroll Lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeViewerIndex === null) return;

      if (e.key === "Escape") {
        setActiveViewerIndex(null);
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    if (activeViewerIndex !== null) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeViewerIndex, handlePrev, handleNext]);

  // Loading initial authentication state
  if (isAuthenticated === null) {
    return (
      <main className="min-h-screen bg-[#FFF9F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-rose-200 border-t-rose-600 animate-spin" />
          <p className="font-serif italic text-sm text-[#732B3B]">
            Opening our little universe…
          </p>
        </div>
      </main>
    );
  }

  // =========================================================================
  // VIEW 1: THE PASSWORD LOCK SCREEN
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <main className="relative min-h-screen bg-[#FFF9F6] text-[#3D2C30] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden selection:bg-rose-200">
        {/* Soft Background Ambiance */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-[10%] left-[8%] w-80 h-80 rounded-full bg-rose-200/30 blur-3xl" />
          <div className="absolute bottom-[10%] right-[8%] w-96 h-96 rounded-full bg-pink-100/40 blur-3xl" />
        </div>

        {/* Floating Top Back to Bouquet Link */}
        <div className="absolute top-6 left-6 z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-xs sm:text-sm font-medium text-[#6B172A] border border-rose-200/80 shadow-sm backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-rose-500" />
            <span>Back to Bouquet</span>
          </Link>
        </div>

        {/* Lock Card */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative max-w-md w-full p-8 sm:p-10 rounded-3xl bg-white/90 backdrop-blur-md border-2 border-rose-200/80 shadow-2xl shadow-rose-950/10 text-center space-y-6"
        >
          {/* Decorative Lock Badge */}
          <div className="flex justify-center">
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center border border-rose-300 shadow-sm">
              <Lock className="w-7 h-7 text-[#8C2337]" />
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">
                <Heart className="w-3 h-3 fill-white" />
              </div>
            </div>
          </div>

          {/* Heading & Captions */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-widest text-rose-500 font-semibold block">
              Private Memories Gallery
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#3D1D24]">
              Our Little Secret ♡
            </h1>
            <p className="text-sm sm:text-base text-[#6B4F55] leading-relaxed">
              Some memories are too special to leave unlocked.
            </p>
            <p className="text-xs font-serif italic text-rose-600/80 pt-1">
              A private little corner of our story.
            </p>
          </div>

          {/* Password Form */}
          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (authError) setAuthError(null);
                }}
                placeholder="Enter password…"
                autoFocus
                required
                aria-label="Gallery password"
                className="w-full px-5 py-3.5 pr-12 rounded-2xl bg-rose-50/60 border border-rose-200/90 text-sm text-[#3D1D24] placeholder:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-600 p-1 rounded-full transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {authError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-serif italic text-rose-600 font-medium"
              >
                {authError}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#8C2337] via-[#A82842] to-[#8C2337] hover:from-[#781B2E] hover:to-[#781B2E] text-white text-sm font-medium tracking-wide shadow-lg shadow-rose-950/15 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  <span>Unlocking memories…</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-rose-200" />
                  <span>Unlock our memories</span>
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="pt-2 text-[11px] text-[#8C6D73] font-serif italic">
            Just for Sanoof and Lena Fathima K ♡
          </div>
        </motion.div>
      </main>
    );
  }

  // =========================================================================
  // VIEW 2: THE AUTHENTICATED PRIVATE MEMORIES GALLERY
  // =========================================================================
  return (
    <main className="relative min-h-screen bg-[#FFF9F6] text-[#3D2C30] selection:bg-rose-200 pb-32">
      {/* FLOATING TOP NAVIGATION BAR */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-xs font-medium text-[#6B172A] border border-rose-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Bouquet</span>
          </Link>
          <span className="hidden sm:inline text-xs font-serif italic text-rose-500">
            Sanoof × Lena
          </span>
        </div>

        {/* Lock Gallery Button (Logout) */}
        <button
          onClick={handleLogout}
          className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 hover:bg-rose-200 text-[#7A2436] text-xs font-medium border border-rose-300/80 transition-all cursor-pointer shadow-xs active:scale-95"
          title="Lock gallery and exit"
        >
          <Lock className="w-3.5 h-3.5 text-rose-600 transition-transform group-hover:scale-110" />
          <span>Lock Gallery</span>
          <LogOut className="w-3 h-3 text-rose-400 opacity-60" />
        </button>

        {/* Hairline Progress on Sticky Nav (Subtle Continuous Feedback on Scroll) */}
        <AnimatePresence>
          {showIndicator && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-rose-100/50 overflow-hidden pointer-events-none"
            >
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400"
                style={{
                  width: `${progressPercentage}%`,
                  transition: prefersReducedMotion
                    ? "none"
                    : "width 400ms cubic-bezier(0.16, 1, 0.3, 1)",
                  boxShadow: "0 0 6px rgba(225, 29, 72, 0.22)",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* GALLERY CONTENT WRAPPER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        {/* RESERVED SPACE FOR LOADING INDICATOR (GUARANTEES ZERO LAYOUT SHIFT) */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto h-11 flex items-center justify-center mb-4 relative">
          <AnimatePresence>
            {showIndicator && (
              <motion.div
                key="memory-progress-pill"
                initial={
                  prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="w-full px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-rose-200/70 shadow-xs flex flex-col gap-1.5 pointer-events-none"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-serif text-[#6B2836]">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                        isFullyGathered ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                    <span className="font-medium tracking-wide">
                      {isFullyGathered
                        ? "All memories gathered ♡"
                        : totalItemsCount === 0 || isDiscovering
                        ? "Gathering your memories…"
                        : `Gathering your memories… · ${progressPercentage}%`}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-[#8C5D66] tabular-nums">
                    {totalItemsCount > 0 ? `${loadedCount} of ${totalItemsCount}` : "…"}
                  </div>
                </div>

                {/* Refined Thin Progress Bar (2.5px with Subtle Rose Glow & Natural Transition) */}
                <div className="w-full h-[2.5px] bg-rose-100/70 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-[#BE185D] via-[#E11D48] to-[#FB7185] rounded-full"
                    style={{
                      width: `${progressPercentage}%`,
                      transition: prefersReducedMotion
                        ? "none"
                        : "width 400ms cubic-bezier(0.16, 1, 0.3, 1)",
                      boxShadow: "0 0 8px rgba(225, 29, 72, 0.22)",
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* HEADER SECTION */}
        <header className="text-center max-w-2xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-[11px] font-semibold tracking-[0.2em] text-[#8C3A4D] uppercase">
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span>JUST US · OUR MEMORIES</span>
            <Sparkles className="w-3 h-3 text-rose-400" />
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-[#3D1D24]">
            Our Little World ❤️
          </h1>

          <p className="text-sm sm:text-base text-[#6B4F55] leading-relaxed">
            Little moments, silly videos, random pictures, and memories I never want to lose.
          </p>

          {/* Intimate Letter Banner */}
          <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-white via-rose-50/50 to-pink-50/40 border border-rose-200/80 shadow-sm text-left space-y-3 font-serif text-sm sm:text-base leading-relaxed text-[#4A353A]">
            <p className="font-semibold text-[#8C2337]">
              Lena, these aren&apos;t just pictures.
            </p>
            <p>
              They&apos;re random moments, little memories, and pieces of our story that I wanted to keep somewhere special.
            </p>
            <p className="italic text-[#782336] pt-1 border-t border-rose-100">
              Whenever you open this page, I hope it reminds you how happy I am that we found our way to each other.
            </p>
          </div>
        </header>

        {/* FILTER CONTROLS */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-6 border-b border-rose-100 mb-8">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-rose-200/80 shadow-2xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-[#8C2D40] text-white shadow-xs"
                  : "text-[#69434B] hover:bg-rose-50"
              }`}
            >
              All ({mediaItems.length})
            </button>
            <button
              onClick={() => setFilter("image")}
              className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filter === "image"
                  ? "bg-[#8C2D40] text-white shadow-xs"
                  : "text-[#69434B] hover:bg-rose-50"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Photos ({mediaItems.filter((i) => i.type === "image").length})</span>
            </button>
            <button
              onClick={() => setFilter("video")}
              className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filter === "video"
                  ? "bg-[#8C2D40] text-white shadow-xs"
                  : "text-[#69434B] hover:bg-rose-50"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Videos ({mediaItems.filter((i) => i.type === "video").length})</span>
            </button>
          </div>

          <div className="text-xs font-serif italic text-[#875F66]">
            Showing {filteredItems.length} precious {filteredItems.length === 1 ? "memory" : "memories"}
          </div>
        </div>

        {/* SERVER LOAD ERROR STATE */}
        {!isDiscovering && loadError && mediaItems.length === 0 && (
          <div className="py-16 text-center space-y-4 p-8 rounded-3xl bg-white border border-rose-200/90 shadow-sm max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <Heart className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="font-serif text-lg text-[#3D1D24]">
                Could not load our memories
              </p>
              <p className="text-xs text-[#875F66]">
                {loadError}
              </p>
            </div>
            <button
              onClick={fetchMediaList}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8C2337] hover:bg-[#781B2E] text-white text-xs font-medium tracking-wide shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isDiscovering && !loadError && totalItemsCount > 0 && filteredItems.length === 0 && (
          <div className="py-24 text-center space-y-3 p-8 rounded-3xl bg-white border border-rose-200">
            <Heart className="w-10 h-10 text-rose-300 mx-auto" />
            <p className="font-serif text-lg text-[#3D1D24]">
              No memories found in this section
            </p>
            <p className="text-xs text-[#7A5B62] font-serif italic">
              New memories added to private storage will appear here automatically.
            </p>
          </div>
        )}

        {/* CALM SKELETON PLACEHOLDERS DURING DISCOVERY */}
        {isDiscovering && totalItemsCount === 0 && (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="break-inside-avoid rounded-2xl overflow-hidden bg-white/70 border border-rose-100 p-2 shadow-2xs space-y-2"
              >
                <div
                  className="w-full rounded-xl bg-gradient-to-b from-rose-100/30 via-pink-50/40 to-rose-100/20 flex items-center justify-center"
                  style={{ aspectRatio: i % 2 === 0 ? "3/4" : "4/3" }}
                >
                  <Heart className="w-5 h-5 text-rose-300/40 fill-rose-200/20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MASONRY / EDITORIAL GRID WITH ZERO LAYOUT SHIFT */}
        {filteredItems.length > 0 && (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filteredItems.map((item, index) => {
              const isVideo = item.type === "video";
              const thumbUrl = item.thumbUrl || `/api/memories/media/${item.id}?thumb=1`;
              const isItemLoaded = loadedMediaIds.has(item.id);

              return (
                <motion.div
                  key={item.id}
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-5%" }}
                  transition={{ duration: 0.4, delay: (index % 6) * 0.03 }}
                  onClick={() => setActiveViewerIndex(index)}
                  className="group relative break-inside-avoid rounded-2xl overflow-hidden bg-white border border-rose-100/90 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.015] cursor-pointer"
                >
                  {/* Photo or Video Card */}
                  {isVideo ? (
                    <VideoMemoryCard
                      item={item}
                      index={index}
                      isLoaded={isItemLoaded}
                      onLoaded={() => markLoaded(item.id)}
                    />
                  ) : (
                    <div
                      className="relative w-full overflow-hidden bg-rose-50/50"
                      style={{
                        aspectRatio: item.aspectRatio ? `${item.aspectRatio}` : "0.75",
                      }}
                    >
                      {/* Calm, Soft Placeholder Skeleton */}
                      {!isItemLoaded && (
                        <div className="absolute inset-0 bg-gradient-to-b from-rose-100/30 via-pink-50/40 to-rose-100/20 flex items-center justify-center">
                          <Heart className="w-5 h-5 text-rose-300/40 fill-rose-200/20" />
                        </div>
                      )}

                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbUrl}
                        alt={`Lena and Sanoof memory ${index + 1}`}
                        loading={index < 8 ? "eager" : "lazy"}
                        fetchPriority={index < 4 ? "high" : "auto"}
                        onLoad={() => markLoaded(item.id)}
                        onError={() => markLoaded(item.id)}
                        className={`w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500 ${
                          isItemLoaded ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </div>
                  )}

                  {/* Subtle Hover Reveal */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 pointer-events-none">
                    <p className="text-[11px] text-white/95 font-serif italic truncate">
                      Tap to open ♡
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* BOTTOM MEMORY FOOTER */}
        <footer className="mt-20 pt-10 border-t border-rose-200 text-center space-y-3">
          <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
            “More memories to come. Our story is still being written. ❤️”
          </p>
          <p className="text-xs text-[#8C6D73] font-serif">
            A private chronicle of Sanoof & Lena Fathima K
          </p>
        </footer>
      </div>

      {/* =========================================================================
          FULL-SCREEN MEMORY VIEWER (LIGHTBOX FOR PHOTOS & VIDEOS)
          ========================================================================= */}
      <AnimatePresence>
        {activeMedia && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Private memory viewer"
          >
            {/* Backdrop click to close */}
            <div
              className="absolute inset-0 cursor-pointer"
              onClick={() => setActiveViewerIndex(null)}
            />

            {/* Close Button */}
            <button
              onClick={() => setActiveViewerIndex(null)}
              className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close viewer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Position Indicator */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-mono text-white/90">
              {activeViewerIndex! + 1} of {filteredItems.length}
            </div>

            {/* Prev Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-transform active:scale-90 cursor-pointer"
              aria-label="Previous memory"
              title="Previous (Left arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-transform active:scale-90 cursor-pointer"
              aria-label="Next memory"
              title="Next (Right arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Central Media Container */}
            <motion.div
              key={activeMedia.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative z-30 max-w-5xl max-h-[88vh] w-full flex items-center justify-center p-2"
              onClick={(e) => e.stopPropagation()}
            >
              {activeMedia.type === "video" ? (
                <div className="relative max-h-[85vh] max-w-full flex items-center justify-center rounded-2xl overflow-hidden bg-black shadow-2xl">
                  <video
                    src={activeMedia.mediaUrl || `/api/memories/media/${activeMedia.id}`}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-[85vh] max-w-full rounded-2xl"
                  />
                </div>
              ) : (
                <div className="relative max-h-[85vh] max-w-full flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeMedia.mediaUrl || `/api/memories/media/${activeMedia.id}`}
                    alt="Lena and Sanoof private memory"
                    className="max-h-[85vh] max-w-full object-contain rounded-2xl"
                  />
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
