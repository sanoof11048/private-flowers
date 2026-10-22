"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Heart,
  Calendar,
  Clock,
  Phone,
  Sparkles,
  ChevronDown,
  X,
  Maximize2,
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Briefcase,
  Smile,
} from "lucide-react";

interface SongTrack {
  id: string;
  title: string;
  src: string;
}

const PLAYLIST: SongTrack[] = [
  {
    id: "magale",
    title: "Magale",
    src: "/Magale.mp3",
  },
  {
    id: "barbaad",
    title: "Barbaad — Saiyaara",
    src: "/Barbaad%20Saiyaara%20320%20Kbps.mp3",
  },
];

interface LightboxImage {
  src: string;
  alt: string;
  caption: string;
  date: string;
  location?: string;
}

export interface JournalMemoryEntry {
  id: string;
  date: string;
  title: string;
  storyText?: string;
  photo?: string;
  tag?: string;
}

// Reusable chronicle entries in chronological order — easily extendable as new memories are made!
export const JOURNAL_TIMELINE_ENTRIES: JournalMemoryEntry[] = [
  {
    id: "puttekatt",
    date: "December 2023",
    title: "The first sight on Puttekatt",
    storyText: "Where my interest and feelings quietly began.",
    photo: "/images/Bus.jpeg",
    tag: "Where it began",
  },
  {
    id: "school-gate",
    date: "February 2024",
    title: "Asking your name & “Perilla.”",
    storyText: "Our first little conversation at the school gate.",
    photo: "/images/school-gate.jpg",
    tag: "First words",
  },
  {
    id: "instagram",
    date: "April 20, 2026",
    title: "Instagram stories & notes",
    storyText: "A story like and notes that brought you back into my world.",
    tag: "Reconnecting",
  },
  {
    id: "hi-message",
    date: "August 23, 2026",
    title: "The nervous first “Hi.”",
    storyText: "Replying to your note at 6:57 PM after so much overthinking.",
    tag: "First message",
  },
  {
    id: "whispers",
    date: "October 8, 2026",
    title: "Our first roadside whispers",
    storyText: "Seeing you in real life and exchanging soft words by the road.",
    photo: "/images/oct_8_visit.webp",
    tag: "In person again",
  },
  {
    id: "chemmad-date",
    date: "October 9, 2026",
    title: "Our first car date & selfie",
    storyText: "Spending the morning together from Chemmad to the bus stand.",
    photo: "/images/oct_9_visit.webp",
    tag: "First meet",
  },
  {
    id: "call-51",
    date: "October 12, 2026",
    title: "Our first 51-minute call",
    storyText: "Hearing each other's voices for 51 minutes at 11:46 AM.",
    tag: "Hearing voices",
  },
  {
    id: "confession",
    date: "October 21, 2026",
    title: "Your unexpected question & “YES. OBVIOUSLY.”",
    storyText: "When you asked me to be your boyfriend at 2:27 PM.",
    tag: "Official",
  },
];

export default function OurStoryPage() {
  const prefersReducedMotion = useReducedMotion();
  const [activePhoto, setActivePhoto] = useState<LightboxImage | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  // Background Music state & playlist
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const currentTrack = PLAYLIST[currentTrackIndex];

  const switchTrack = async (newIndex: number) => {
    setCurrentTrackIndex(newIndex);
    if (audioRef.current) {
      audioRef.current.src = PLAYLIST[newIndex].src;
      audioRef.current.load();
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setPlaybackError(null);
      } catch {
        setIsPlaying(false);
      }
    }
  };

  const nextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % PLAYLIST.length;
    switchTrack(nextIdx);
  };

  const prevTrack = () => {
    const prevIdx = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    switchTrack(prevIdx);
  };

  const togglePlaySong = async () => {
    if (!audioRef.current) return;
    setPlaybackError(null);

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn("Playback prevented or failed:", err);
        setIsPlaying(false);
        setPlaybackError("Tap to play again ♡");
      }
    }
  };

  // Bulletproof Automatic audio play on mount with fallback to any first user touch/click gesture
  useEffect(() => {
    let unmounted = false;

    const tryPlayAudio = async () => {
      if (!audioRef.current || unmounted) return false;
      try {
        await audioRef.current.play();
        if (!unmounted) {
          setIsPlaying(true);
          setPlaybackError(null);
        }
        return true;
      } catch {
        return false;
      }
    };

    // 1. Attempt immediate autoplay on mount
    tryPlayAudio().then((success) => {
      if (success) return;

      // 2. Browser autoplay policy blocked unprompted audio;
      // Listen for the very first user interaction anywhere on the page
      const gestureEvents: (keyof WindowEventMap)[] = [
        "click",
        "touchstart",
        "touchend",
        "pointerdown",
        "keydown",
      ];

      const unlockAudio = async () => {
        const played = await tryPlayAudio();
        if (played) {
          gestureEvents.forEach((evt) => {
            window.removeEventListener(evt, unlockAudio);
            document.removeEventListener(evt, unlockAudio);
          });
        }
      };

      gestureEvents.forEach((evt) => {
        window.addEventListener(evt, unlockAudio, { passive: true });
        document.addEventListener(evt, unlockAudio, { passive: true });
      });
    });

    return () => {
      unmounted = true;
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Track reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, currentProgress)));
      }
      setIsHeaderVisible(window.scrollY > 350);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle ESC key for photo lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activePhoto) {
        setActivePhoto(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhoto]);

  const scrollToFirstMemory = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setPlaybackError(null);
      }).catch(() => { });
    }
    const el = document.getElementById("first-time-i-saw-you");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const animFadeUp = {
    initial: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-10%" },
    transition: { duration: 0.8, ease: "easeOut" as const },
  };

  return (
    <main className="relative min-h-screen bg-[#FFF9F6] text-[#3D2C30] font-sans overflow-x-hidden selection:bg-rose-200 selection:text-rose-950">
      {/* TOP READING PROGRESS BAR */}
      <div
        className="fixed top-0 left-0 right-0 h-1.5 z-50 bg-rose-100/60 backdrop-blur-sm"
        role="progressbar"
        aria-valuenow={Math.round(readingProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Story Reading Progress"
      >
        <div
          className="h-full bg-gradient-to-r from-rose-300 via-rose-400 to-[#D4707F] transition-[width] duration-150 ease-out shadow-[0_0_8px_rgba(224,122,139,0.5)]"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* FLOATING TOP NAVIGATION PILL */}
      <nav
        aria-label="Story navigation"
        className={`fixed top-4 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-8 pointer-events-none transition-all duration-300 ${isHeaderVisible ? "opacity-100 translate-y-0" : "opacity-95 translate-y-0"
          }`}
      >
        {/* Back to Bouquet */}
        <Link
          href="/"
          className="pointer-events-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-xs sm:text-sm font-medium text-[#6B172A] border border-rose-200/80 shadow-sm backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          title="Return to flowers bouquet"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-rose-500" />
          <span>Bouquet</span>
        </Link>

        {/* Story Title Tag & Reading percentage indicator */}
        <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 text-xs font-serif text-[#6B172A] border border-rose-200/80 shadow-sm backdrop-blur-md">
          <span className="italic font-medium">Sanoof & Lena Fathima K</span>
          <span className="w-1 h-1 rounded-full bg-rose-300" />
          <span className="text-[11px] font-sans text-rose-700/80 tabular-nums">
            {Math.round(readingProgress)}%
          </span>
        </div>
      </nav>

      {/* BACKGROUND DECORATIVE FLOATING AMBIENCE */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 opacity-60">
        <div className="absolute top-[8%] left-[6%] w-72 h-72 rounded-full bg-gradient-to-br from-rose-100/40 to-pink-200/20 blur-3xl" />
        <div className="absolute top-[38%] right-[5%] w-80 h-80 rounded-full bg-gradient-to-br from-amber-100/30 to-rose-100/30 blur-3xl" />
        <div className="absolute top-[70%] left-[10%] w-72 h-72 rounded-full bg-gradient-to-br from-pink-100/40 to-rose-200/25 blur-3xl" />
      </div>

      {/* =========================================================================
          HERO HEADER
          ========================================================================= */}
      <header className="relative min-h-[92vh] sm:min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-16 pb-12">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50/90 border border-rose-200/70 text-[11px] sm:text-xs font-semibold tracking-[0.22em] text-[#8C3A4D] uppercase shadow-xs mb-6"
          >
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span>EVERYTHING I NEVER KNEW HOW TO TELL YOU</span>
            <Sparkles className="w-3 h-3 text-rose-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.3rem] font-medium leading-[1.22] text-[#3D1D24] mb-6 tracking-tight"
          >
            Some stories begin before two people even know each other.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl text-[#6B4F55] leading-relaxed max-w-xl font-light mb-8"
          >
            I don&apos;t know exactly when you became this special to me. I just know that talking to you became something I look forward to, and even ordinary days feel different because of you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.55 }}
            className="flex flex-col items-center gap-1.5 mb-8"
          >
            <div className="font-script-romantic text-4xl sm:text-5xl text-[#9C3247] drop-shadow-xs">
              Sanoof & Lena Fathima K
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-serif italic text-[#875F66]">
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              <span>December 2023 — From a quiet glance to forever</span>
            </div>
          </motion.div>

          {/* Music Controller in Hero */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.62 }}
            className="flex flex-col items-center gap-2 mb-6"
          >
            <div className="flex items-center gap-1 p-1 rounded-full bg-white/90 border border-rose-200/90 shadow-sm backdrop-blur-xs">
              <button
                type="button"
                onClick={togglePlaySong}
                aria-label={isPlaying ? `Pause ${currentTrack.title}` : `Play our song: ${currentTrack.title}`}
                className={`group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${isPlaying
                  ? "bg-rose-100/95 text-[#8C1D32] shadow-xs"
                  : "hover:bg-rose-50 text-[#7A3644]"
                  }`}
              >
                <Music className={`w-3.5 h-3.5 text-rose-500 ${isPlaying ? "animate-pulse" : ""}`} />
                <span>{isPlaying ? `Playing: ${currentTrack.title} ♫` : `Play: ${currentTrack.title} ♡`}</span>
                {isPlaying && (
                  <div className="flex items-end gap-0.5 h-3 px-0.5">
                    <span className="w-0.5 h-2 bg-rose-500 rounded-full animate-audio-bar" />
                    <span className="w-0.5 h-3 bg-rose-600 rounded-full animate-audio-bar" style={{ animationDelay: "0.2s" }} />
                    <span className="w-0.5 h-1.5 bg-rose-400 rounded-full animate-audio-bar" style={{ animationDelay: "0.4s" }} />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={nextTrack}
                aria-label="Switch song"
                className="p-1.5 rounded-full hover:bg-rose-100 text-[#7A3644] transition-colors cursor-pointer"
                title="Switch song"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Song Switcher Pills */}
            <div className="flex items-center gap-1.5 text-[11px] font-serif">
              {PLAYLIST.map((track, idx) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => switchTrack(idx)}
                  className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${idx === currentTrackIndex
                    ? "bg-rose-200/90 text-[#6B172A] font-semibold shadow-2xs"
                    : "bg-white/60 hover:bg-white text-[#7A5B62] border border-rose-100"
                    }`}
                >
                  {track.title}
                </button>
              ))}
            </div>

            {playbackError && (
              <p className="text-xs text-rose-600 italic font-serif">
                {playbackError}
              </p>
            )}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            onClick={scrollToFirstMemory}
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#8C2D40] hover:bg-[#782335] text-rose-50 text-sm font-medium tracking-wide shadow-md shadow-rose-900/15 hover:shadow-lg hover:shadow-rose-900/25 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          >
            <span>Come, let me tell you our story</span>
            <ChevronDown className="w-4 h-4 text-rose-200 transition-transform duration-300 group-hover:translate-y-0.5" />
          </motion.button>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-40 animate-bounce hidden sm:block">
          <div className="w-5 h-8 rounded-full border border-rose-400/60 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-rose-400 animate-pulse" />
          </div>
        </div>
      </header>

      {/* CONTINUOUS STORY CONTAINER */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pb-48">
        <div className="absolute top-12 bottom-24 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-rose-200 to-transparent hidden md:block pointer-events-none" />

        {/* =========================================================================
            SECTION 1 — THE FIRST TIME I SAW YOU (DECEMBER 2023)
            ========================================================================= */}
        <section
          id="first-time-i-saw-you"
          className="relative pt-16 sm:pt-24 scroll-mt-20"
        >
          <motion.div {...animFadeUp} className="space-y-6">
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/70 border border-rose-200/60 text-xs font-serif font-medium text-[#7A2B3B]">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                December 2023
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-center font-medium text-[#3D1D24]">
              The first time I saw you
            </h2>

            {/* Puttekatt Bus Photograph */}
            <div className="flex justify-center pt-2 pb-4">
              <figure
                onClick={() =>
                  setActivePhoto({
                    src: "/images/Bus.jpeg",
                    alt: "The bus named Puttekatt where Sanoof first saw Lena in December 2023",
                    caption: "You were a stranger then, Lena. But you weren't just another face I forgot.",
                    date: "December 2023",
                    location: "Puttekatt Bus",
                  })
                }
                className="group relative max-w-sm sm:max-w-md w-full bg-white p-3 sm:p-4 rounded-xl shadow-lg shadow-rose-950/8 border border-rose-100/90 hover:shadow-xl transition-all duration-300 hover:-rotate-1 cursor-zoom-in"
              >
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-amber-100/80 border border-amber-200/60 rounded-xs -rotate-2 shadow-xs z-10" />

                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-rose-50">
                  <Image
                    src="/images/Bus.jpeg"
                    alt="The bus named Puttekatt where Sanoof first saw Lena in December 2023"
                    fill
                    sizes="(max-width: 640px) 90vw, 420px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    priority
                  />
                  <div className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-black/45 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <figcaption className="mt-3 text-center">
                  <p className="font-script-romantic text-xl sm:text-2xl text-[#823344]">
                    “Puttekatt — where my feelings quietly started.”
                  </p>
                  <p className="text-[11px] text-[#8C6D73] font-serif italic mt-0.5">
                    Tap photograph to view full size
                  </p>
                </figcaption>
              </figure>
            </div>

            {/* Pure, Honest Narrative */}
            <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-xs p-6 sm:p-8 rounded-2xl border border-rose-100/90 shadow-sm leading-relaxed space-y-4 text-sm sm:text-base text-[#4A353A]">
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                Lena, I don&apos;t know if you remember anything about that day.
                Maybe it was just another ordinary day for you.
              </p>
              <p>
                But I remember seeing you on Puttekatt.
              </p>
              <p>
                I didn&apos;t know your name. I didn&apos;t know anything about you.
                I had no idea who you were or what kind of person you would turn out to be.
              </p>
              <p>
                I had only seen you.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                But for some reason, I wanted to see you again.
              </p>
              <p>
                After that, whenever I had the chance, I&apos;d look for you. Sometimes I would wait, hoping I might see you somewhere.
              </p>
              <p>
                You didn&apos;t even know I was doing that. You weren&apos;t looking for me. You didn&apos;t have a reason to.
              </p>
              <p>
                And that&apos;s the part that feels so strange when I look back.
              </p>
              <p>
                I was becoming curious about someone who didn&apos;t even know my name.
              </p>
              <p>
                I wondered who you were. What your name was. What it would be like to actually talk to you.
              </p>
              <p>
                Back then, I didn&apos;t know any of the things I know about you today.
              </p>
              <p className="font-serif text-base sm:text-lg text-[#6B2433] italic pl-4 border-l-2 border-rose-300 leading-relaxed">
                I didn&apos;t know your voice, your favourite little things, or how our conversations would eventually become a part of my everyday life.
              </p>
              <p>
                I only knew that I wanted to know you.
              </p>
              <p>
                And that was enough to make me remember you.
              </p>
              <div className="pt-3 border-t border-rose-100 font-serif italic text-base sm:text-lg text-[#7A2436] text-center font-medium">
                “You were a stranger then, Lena. But you weren&apos;t just another face I forgot.”
              </div>
            </div>
          </motion.div>
        </section>

        {/* =========================================================================
            SECTION 2 — THE FIRST TIME I TRIED TO KNOW YOUR NAME (FEBRUARY 2024)
            ========================================================================= */}
        <section className="relative pt-20 sm:pt-28">
          <motion.div {...animFadeUp} className="space-y-6">
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/70 border border-rose-200/60 text-xs font-serif font-medium text-[#7A2B3B]">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                February 2024
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-center font-medium text-[#3D1D24]">
              The first time I tried to know your name
            </h2>

            {/* School Gate Photo */}
            <div className="flex justify-center pt-2 pb-4">
              <figure
                onClick={() =>
                  setActivePhoto({
                    src: "/images/school-gate.jpg",
                    alt: "The school gate where Sanoof asked Lena her name in February 2024",
                    caption: "The school gate where I finally tried to ask your name.",
                    date: "February 2024",
                    location: "School Gate",
                  })
                }
                className="group relative max-w-sm sm:max-w-md w-full bg-white p-3 sm:p-4 rounded-xl shadow-lg shadow-rose-950/8 border border-rose-100/90 hover:shadow-xl transition-all duration-300 hover:rotate-1 cursor-zoom-in"
              >
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-amber-100/80 border border-amber-200/60 rounded-xs rotate-2 shadow-xs z-10" />

                <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-rose-50">
                  <Image
                    src="/images/school-gate.jpg"
                    alt="School gate where the first conversation happened"
                    fill
                    sizes="(max-width: 640px) 90vw, 420px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-black/45 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <figcaption className="mt-3 text-center">
                  <p className="font-script-romantic text-xl text-[#823344]">
                    The gate where I finally found the courage to speak
                  </p>
                </figcaption>
              </figure>
            </div>

            {/* Typography Highlight: Perilla */}
            <div className="max-w-xl mx-auto my-6 text-center">
              <div className="relative inline-block px-8 py-5 rounded-2xl bg-gradient-to-r from-rose-50 via-white to-pink-50 border border-rose-200/70 shadow-xs">
                <span className="text-xs uppercase tracking-widest text-rose-500 font-semibold block mb-1">
                  The answer I got
                </span>
                <span className="font-serif text-3xl sm:text-4xl italic text-[#782436] font-semibold tracking-tight">
                  “Perilla.”
                </span>
                <p className="text-xs sm:text-sm text-[#875860] italic mt-1 font-serif">
                  “I don&apos;t have a name.”
                </p>
              </div>
            </div>

            <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-xs p-6 sm:p-8 rounded-2xl border border-rose-100/90 shadow-sm leading-relaxed space-y-4 text-sm sm:text-base text-[#4A353A]">
              <p>Then came the day I finally tried to talk to you.</p>
              <p>I asked your name.</p>
              <p>
                That&apos;s all I wanted to know. Your name. Just one small thing about the girl I&apos;d been hoping to see again.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                And you said, &apos;Perilla.&apos;
              </p>
              <p className="font-medium text-[#732B3B]">
                I still can&apos;t believe that was our first little conversation. 😭
              </p>
              <p>
                I had spent so much time building up the courage to ask you one simple question, and somehow I still walked away without knowing your name.
              </p>
              <p>
                At the time, I didn&apos;t know how to turn that moment into another conversation. Then I found out you already had a boyfriend.
              </p>
              <p>So I stepped back.</p>
              <p>
                I thought that was it. I thought I had missed my chance, and I tried to move on.
              </p>
              <p>
                I didn&apos;t know that one day, you would be the person asking me about being your boyfriend.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B] pt-1">
                Honestly, if someone had told me that back then, I probably wouldn&apos;t have believed them.
              </p>
            </div>
          </motion.div>
        </section>

        {/* =========================================================================
            SECTION 3 — WHAT YOU DIDN'T KNOW BACK THEN (SHORT QUIET SECTION)
            ========================================================================= */}
        <section className="relative pt-20 sm:pt-28 text-center">
          <motion.div {...animFadeUp} className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center justify-center gap-3">
              <span className="w-16 sm:w-24 h-px bg-rose-200" />
              <Heart className="w-4 h-4 text-rose-400 fill-rose-300/40" />
              <span className="w-16 sm:w-24 h-px bg-rose-200" />
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium text-[#3D1D24]">
              What you didn&apos;t know back then
            </h2>

            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-white/90 to-rose-50/50 border border-rose-200/80 shadow-sm space-y-4 text-sm sm:text-base text-[#4A353A] leading-relaxed text-left">
              <p className="font-serif italic text-base text-[#732B3B]">
                You didn&apos;t know how curious I was about you.
              </p>
              <p className="font-serif italic text-base text-[#732B3B]">
                You didn&apos;t know how much courage it took for me to approach you.
              </p>
              <p className="font-serif italic text-base text-[#732B3B]">
                You didn&apos;t know that I remembered that little moment long after it was over.
              </p>
              <p>
                And that&apos;s okay. You didn&apos;t owe me anything. We were just two people who didn&apos;t know each other yet.
              </p>
              <p>
                I&apos;m not telling you these things because I want you to feel bad about the past.
              </p>
              <p className="font-serif text-base sm:text-lg text-[#782336] italic pl-4 border-l-2 border-rose-300">
                I&apos;m telling you because now I finally get to share that past with you.
              </p>
              <p>
                You get to know the little things you never knew about me.
              </p>
              <p className="font-medium text-[#7A2436] pt-1">
                And I get to tell you the story from my side.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="w-16 sm:w-24 h-px bg-rose-200" />
              <span className="w-1.5 h-1.5 rounded-full bg-rose-300" />
              <span className="w-16 sm:w-24 h-px bg-rose-200" />
            </div>
          </motion.div>
        </section>

        {/* =========================================================================
            SECTION 4 — APRIL 20: INSTAGRAM BROUGHT YOU BACK INTO MY WORLD
            ========================================================================= */}
        <section className="relative pt-20 sm:pt-28">
          <motion.div {...animFadeUp} className="space-y-6">
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/70 border border-rose-200/60 text-xs font-serif font-medium text-[#7A2B3B]">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                April 20, 2026
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-center font-medium text-[#3D1D24]">
              April 20 — Instagram brought you back into my world
            </h2>

            {/* Instagram Aesthetic Recreation */}
            <div className="flex flex-wrap items-center justify-center gap-4 py-4">
              <div className="relative p-3.5 rounded-2xl bg-white border border-rose-100 shadow-sm flex items-center gap-3 max-w-xs">
                <div className="w-12 h-12 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#FFF9F6] flex items-center justify-center text-xs font-serif text-[#782336] font-semibold">
                    Story
                  </div>
                </div>
                <div className="text-left text-xs">
                  <p className="font-semibold text-[#423134]">A story liked</p>
                  <p className="text-[11px] text-rose-500 flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-rose-500" />
                    <span>A little notification</span>
                  </p>
                </div>
              </div>

              <div className="relative p-3.5 rounded-2xl bg-white border border-rose-100 shadow-sm flex items-center gap-3 max-w-xs">
                <div className="w-12 h-12 rounded-full p-[2.5px] bg-emerald-400 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#FFF9F6] flex items-center justify-center text-xs font-serif text-emerald-700 font-semibold">
                    CF
                  </div>
                </div>
                <div className="text-left text-xs">
                  <p className="font-semibold text-[#423134]">Close friends & notes</p>
                  <p className="text-[11px] text-[#7A5A60]">
                    Becoming familiar with each other
                  </p>
                </div>
              </div>
            </div>

            <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-xs p-6 sm:p-8 rounded-2xl border border-rose-100/90 shadow-sm leading-relaxed space-y-4 text-sm sm:text-base text-[#4A353A]">
              <p>Then, on April 20, 2026, I liked your Instagram story.</p>
              <p>You liked mine too.</p>
              <p>
                Then there were notes, close-friends stories, and more little interactions.
              </p>
              <p>
                Maybe they were ordinary things. I knew they didn&apos;t necessarily mean you liked me.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                But I was happy to see you again.
              </p>
              <p>
                I found myself noticing your name on my screen. I liked that, in a small way, we were becoming familiar with each other.
              </p>
              <p>
                I still didn&apos;t know if we&apos;d ever really talk.
              </p>
              <p>
                I was curious about you, but I didn&apos;t want to assume anything.
              </p>
              <p>
                I just enjoyed those little moments for what they were.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#782336] pt-1">
                Looking back, it&apos;s funny how something as small as a story like can become part of the beginning of a much bigger story.
              </p>
            </div>
          </motion.div>
        </section>

        {/* =========================================================================
            SECTION 5 — AUGUST 23: THE MESSAGE I WAS NERVOUS TO SEND
            ========================================================================= */}
        <section className="relative pt-20 sm:pt-28">
          <motion.div {...animFadeUp} className="space-y-6">
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/70 border border-rose-200/60 text-xs font-serif font-medium text-[#7A2B3B]">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                August 23, 2026 · 6:57 PM
              </span>
            </div>

            <div className="text-center">
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium text-[#3D1D24]">
                The message I was nervous to send
              </h2>
              <p className="font-script-romantic text-2xl sm:text-3xl text-[#8C2D40] mt-1">
                One word. After all that thinking.
              </p>
            </div>

            {/* Chat Bubble Visual Recreation */}
            <div className="max-w-sm mx-auto my-6">
              <div className="bg-white/90 p-4 rounded-2xl border border-rose-100 shadow-md">
                <div className="text-[11px] text-center text-rose-400 font-serif italic mb-3">
                  Reply to your note · August 23 · 6:57 PM
                </div>
                <div className="flex justify-end">
                  <div className="relative max-w-[80%] bg-gradient-to-br from-[#8C2D40] to-[#A33B50] text-white px-4 py-2.5 rounded-2xl rounded-tr-xs shadow-sm">
                    <p className="text-base font-medium">Hi</p>
                    <div className="flex items-center justify-end gap-1 text-[10px] text-rose-200/80 mt-1">
                      <span>6:57 PM</span>
                      <span>✓✓</span>
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs font-serif italic text-[#7A4F57] mt-3">
                  “Started with one word. Changed everything.”
                </p>
              </div>
            </div>

            <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-xs p-6 sm:p-8 rounded-2xl border border-rose-100/90 shadow-sm leading-relaxed space-y-4 text-sm sm:text-base text-[#4A353A]">
              <p>
                Do you know how many times I probably thought about texting you before I actually did it?
              </p>
              <p>
                I kept thinking about what might happen if I tried.
              </p>
              <p>
                Maybe you&apos;d reply. Maybe you wouldn&apos;t. Maybe I&apos;d end up feeling disappointed all over again.
              </p>
              <p>
                I was preparing myself for rejection before I&apos;d even sent a message.
              </p>
              <p>
                And then, on August 23 at 6:57 PM, I finally replied to your note.
              </p>
              <p className="font-serif text-2xl italic text-[#732B3B] font-semibold">
                &apos;Hi.&apos;
              </p>
              <p className="font-medium text-[#732B3B]">
                One word. That&apos;s what I came up with after all that thinking. 😭
              </p>
              <p>
                But I&apos;m so glad I sent it.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#782336]">
                Because we started talking.
              </p>
              <p>
                And then we kept talking.
              </p>
              <p>
                Our conversations became a part of our days. The streak continued. We kept finding reasons to message each other again.
              </p>
              <p>
                I started getting to know you instead of just wondering about you.
              </p>
              <p>
                That was the difference.
              </p>
              <p>
                Before, I had a thousand questions about the girl I&apos;d seen on a bus.
              </p>
              <p>
                Now, I could actually talk to her.
              </p>
              <p className="font-serif text-base sm:text-lg text-[#8C1D32] italic pt-1 border-t border-rose-100">
                And little by little, you stopped being just someone I was curious about. You became someone I genuinely cared about.
              </p>
            </div>
          </motion.div>
        </section>

        {/* =========================================================================
            SECTION 6 — OCTOBER 8: OUR FIRST WHISPERS
            ========================================================================= */}
        <section className="relative pt-20 sm:pt-28">
          <motion.div {...animFadeUp} className="space-y-6">
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/70 border border-rose-200/60 text-xs font-serif font-medium text-[#7A2B3B]">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                October 8, 2026 · Roadside Encounter
              </span>
            </div>

            <div className="text-center">
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium text-[#3D1D24]">
                October 8 — Our first whispers
              </h2>
              <p className="font-serif italic text-sm sm:text-base text-[#8C3A4D] mt-1">
                “Quietly. Almost in whispers.”
              </p>
            </div>

            {/* October 8 Real Photograph */}
            <div className="flex justify-center pt-2 pb-4">
              <figure
                onClick={() =>
                  setActivePhoto({
                    src: "/images/oct_8_visit.webp",
                    alt: "October 8, 2026 - When Sanoof and Lena saw each other again along the road",
                    caption:
                      "I had spent so long hoping to see you. On October 9, I finally got to spend time with you.",
                    date: "October 8, 2026",
                    location: "Roadside Whispers",
                  })
                }
                className="group relative max-w-sm sm:max-w-md w-full bg-white p-3 sm:p-4 rounded-xl shadow-lg shadow-rose-950/8 border border-rose-100/90 hover:shadow-xl transition-all duration-300 hover:-rotate-1 cursor-zoom-in"
              >
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-amber-100/80 border border-amber-200/60 rounded-xs -rotate-2 shadow-xs z-10" />

                <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-rose-50">
                  <picture>
                    <source srcSet="/images/oct_8_visit.webp" type="image/webp" />
                    <source srcSet="/images/oct_8_visit.jpg" type="image/jpeg" />
                    <Image
                      src="/images/oct_8_visit.webp"
                      alt="October 8 roadside encounter"
                      fill
                      sizes="(max-width: 640px) 90vw, 420px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </picture>
                  <div className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-black/45 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <figcaption className="mt-3 text-center">
                  <p className="font-script-romantic text-xl sm:text-2xl text-[#823344]">
                    “Still, I remember those whispers.”
                  </p>
                  <p className="text-[11px] text-[#8C6D73] font-serif italic mt-0.5">
                    Tap to enlarge photograph
                  </p>
                </figcaption>
              </figure>
            </div>

            <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-xs p-6 sm:p-8 rounded-2xl border border-rose-100/90 shadow-sm leading-relaxed space-y-4 text-sm sm:text-base text-[#4A353A]">
              <p>I still remember October 8.</p>
              <p>I was in my car, and you were walking along the road.</p>
              <p>
                After all that time, all those Instagram interactions, and all those messages, we were finally seeing each other in real life again.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                And we spoke.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                Quietly. Almost in whispers.
              </p>
              <p>
                It&apos;s such a small thing when I explain it like that, isn&apos;t it?
              </p>
              <p>Two people exchanging a few words on the road.</p>
              <p className="font-serif text-base text-[#782336] italic pl-4 border-l-2 border-rose-300">
                But to me, it felt different from every message we&apos;d sent.
              </p>
              <p>
                When I texted you, I had time to read your words and think about my reply.
              </p>
              <p>
                But there, you were actually in front of me.
              </p>
              <p>
                I could hear you. I could see you. We were talking in the same place, at the same time.
              </p>
              <p>
                I don&apos;t even know if you saw me properly. I know I got to see you, but the moment was brief, and we were both speaking quietly.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                Still, I remember those whispers.
              </p>
              <p>
                I had once hoped just to catch a glimpse of you. Now, after all those years, we were exchanging words.
              </p>
              <p>
                I don&apos;t need to pretend it was some perfect movie scene.
              </p>
              <p>
                It was simple. A little awkward, maybe. Just a real moment between two people who had finally started getting to know each other.
              </p>
              <p>
                But I was happy that it happened.
              </p>
              <p>
                And the next day, we planned to meet properly.
              </p>
              <p>
                For once, I didn&apos;t have to hope that I&apos;d happen to see you somewhere.
              </p>
              <p className="font-medium text-[#7A2436]">
                We had actually made a plan.
              </p>
              <div className="pt-3 border-t border-rose-100 font-serif italic text-base sm:text-lg text-[#7A2436] text-center font-medium">
                “I had spent so long hoping to see you. On October 9, I finally got to spend time with you.”
              </div>
            </div>
          </motion.div>
        </section>

        {/* =========================================================================
            SECTION 7 — OCTOBER 9: THE DAY I FINALLY GOT TO KNOW YOU
            ========================================================================= */}
        <section className="relative pt-20 sm:pt-28">
          <motion.div
            {...animFadeUp}
            className="relative space-y-6 p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-white via-rose-50/40 to-pink-50/30 border-2 border-rose-200/80 shadow-xl shadow-rose-950/5"
          >
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-200/70 border border-rose-300/80 text-xs sm:text-sm font-serif font-semibold text-[#6B172A] shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                October 9, 2026 · Our First Meet
              </span>
            </div>

            <div className="text-center space-y-1">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-[#3D1D24]">
                The day I finally got to know you
              </h2>
              <p className="font-script-romantic text-2xl sm:text-3xl md:text-4xl text-[#942B40]">
                “From wondering about you to sitting beside you.”
              </p>
            </div>

            {/* Prominent October 9 First Selfie Photograph */}
            <div className="flex justify-center pt-2 pb-4">
              <figure
                onClick={() =>
                  setActivePhoto({
                    src: "/images/oct_9_visit.webp",
                    alt: "October 9, 2026 - Our first proper meet and first selfie together",
                    caption:
                      "October 9, 2026 · Our first car date · Chemmad bus stand",
                    date: "October 9, 2026",
                    location: "Chemmad",
                  })
                }
                className="group relative max-w-md sm:max-w-xl w-full bg-white p-3.5 sm:p-5 rounded-2xl shadow-xl shadow-rose-950/12 border border-rose-200/90 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] cursor-zoom-in"
              >
                <div className="absolute -top-3 -left-3 w-16 h-6 bg-amber-100/90 border border-amber-200 rounded-xs -rotate-45 shadow-xs z-10" />
                <div className="absolute -top-3 -right-3 w-16 h-6 bg-amber-100/90 border border-amber-200 rounded-xs rotate-45 shadow-xs z-10" />

                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-rose-50">
                  <picture>
                    <source srcSet="/images/oct_9_visit.webp" type="image/webp" />
                    <source srcSet="/images/oct_9_visit.jpg" type="image/jpeg" />
                    <Image
                      src="/images/oct_9_visit.webp"
                      alt="Our first selfie on October 9, 2026"
                      fill
                      sizes="(max-width: 768px) 95vw, 600px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </picture>
                  <div className="absolute bottom-3 right-3 p-2 rounded-full bg-black/50 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>

                <figcaption className="mt-4 text-center">
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-serif text-[#6B172A]">
                    <span className="px-2.5 py-1 rounded-full bg-rose-100/80 border border-rose-200/60 font-medium">
                      October 9, 2026
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-rose-100/80 border border-rose-200/60 font-medium">
                      Our first car date
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-rose-100/80 border border-rose-200/60 font-medium">
                      12:20 PM · Chemmad bus stand
                    </span>
                  </div>
                </figcaption>
              </figure>
            </div>

            {/* Deep Narrative of the Car Date */}
            <div className="max-w-2xl mx-auto bg-white/85 backdrop-blur-xs p-6 sm:p-8 rounded-2xl border border-rose-100 shadow-sm leading-relaxed space-y-4 text-sm sm:text-base text-[#4A353A]">
              <p>I picked you up from Chemmad in my car.</p>
              <p className="font-serif italic text-base sm:text-lg text-[#782336]">
                Our first car date.
              </p>
              <p>
                I wish I could explain exactly why that meant so much to me without making it sound bigger than it was.
              </p>
              <p>
                It wasn&apos;t about going somewhere expensive or planning the perfect date.
              </p>
              <p className="font-medium text-[#732B3B]">
                It was about finally getting to spend time with you.
              </p>
              <p>
                We stopped at different places. We talked about so many things. We kept talking until it was time for me to drop you off.
              </p>
              <p>
                For a long time, I had only been able to wonder what it would be like to know you.
              </p>
              <p>
                Now I was actually sitting with you, talking to you, listening to you, and discovering more about the person you really were.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                I wasn&apos;t just curious about you anymore.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                I was getting to know you.
              </p>
              <p>
                And I liked that. I liked having that time with you.
              </p>
              <p>
                Then it was 12:20 PM, and I dropped you at Chemmad bus stand.
              </p>
              <p className="font-serif text-base text-[#782336] italic pl-4 border-l-2 border-rose-300">
                The funny thing is that our story started with a bus, and one of my favourite early memories ended at a bus stand.
              </p>
              <p>
                But everything felt different now.
              </p>
              <p>
                Back then, you were someone I hoped to see.
              </p>
              <p>
                That day, you were someone I had actually spent my time with.
              </p>
              <p>
                We even had our first selfie together.
              </p>
              <p>
                I could look at that picture and remember that the day really happened.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#8C1D32] pt-1">
                I got to meet you properly, Lena.
              </p>
              <p className="font-medium text-[#7A2436]">
                And I was genuinely happy about that.
              </p>
            </div>
          </motion.div>
        </section>

        {/* =========================================================================
            SECTION 8 — THE CHOCOLATES AND THE LITTLE UNICORN
            ========================================================================= */}
        <section className="relative pt-20 sm:pt-28">
          <motion.div {...animFadeUp} className="space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-center font-medium text-[#3D1D24]">
              The chocolates and the little unicorn
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-2">
              <div className="relative p-6 sm:p-7 rounded-2xl bg-white/85 border border-rose-100 shadow-md flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-2xl shadow-xs">
                    🍫
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#4A2029]">
                    I brought you chocolates
                  </h3>
                  <p className="text-sm sm:text-base text-[#4A353A] leading-relaxed">
                    Something sweet I was happy to give you during our first drive.
                  </p>
                </div>
                <div className="text-xs font-serif italic text-rose-500/80 pt-2 border-t border-rose-100">
                  A sweet little memory
                </div>
              </div>

              <div className="relative p-6 sm:p-7 rounded-2xl bg-white/85 border border-rose-100 shadow-md flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-pink-50 border border-pink-200/80 flex items-center justify-center text-2xl shadow-xs">
                    🦄
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#4A2029]">
                    And you gave me a tiny unicorn
                  </h3>
                  <p className="text-sm sm:text-base text-[#4A353A] leading-relaxed">
                    A tiny unicorn from Kinder Joy. 🦄
                  </p>
                </div>
                <div className="text-xs font-serif italic text-rose-500/80 pt-2 border-t border-rose-100">
                  Treasured ever since
                </div>
              </div>
            </div>

            <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-xs p-6 sm:p-8 rounded-2xl border border-rose-100/90 shadow-sm leading-relaxed space-y-4 text-sm sm:text-base text-[#4A353A]">
              <p>I brought you chocolates.</p>
              <p>And you gave me a tiny unicorn from Kinder Joy. 🦄</p>
              <p>I know, it&apos;s just a little toy.</p>
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                But it&apos;s from you.
              </p>
              <p className="font-medium text-[#732B3B]">
                That&apos;s what makes it special to me.
              </p>
              <p>
                I like that our memories aren&apos;t made up of huge, expensive things. They&apos;re made up of random little details that probably wouldn&apos;t mean much to anyone else.
              </p>
              <p className="font-serif italic text-base text-[#782336] pl-4 border-l-2 border-rose-300">
                The chocolates I gave you. The tiny unicorn you gave me. The first selfie. The places we stopped. The time I dropped you off.
              </p>
              <p>These are the things I want to remember.</p>
              <p>Not because every single thing was extraordinary.</p>
              <p className="font-serif text-base sm:text-lg text-[#8C1D32] italic font-medium pt-1">
                Because they happened with you.
              </p>
            </div>
          </motion.div>
        </section>

        {/* =========================================================================
            SECTION 9 — THE FIRST MOVES WERE ALMOST ALWAYS MINE
            ========================================================================= */}
        <section className="relative pt-20 sm:pt-28 text-center">
          <motion.div {...animFadeUp} className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/70 border border-rose-200/60 text-xs font-serif font-medium text-[#7A2B3B]">
                <Smile className="w-3.5 h-3.5 text-rose-500" />
                Honest confession
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium text-[#3D1D24]">
              I think you can guess who kept making the first move. 😭
            </h2>

            <div className="p-6 sm:p-8 rounded-2xl bg-white/80 backdrop-blur-xs border border-rose-100/90 shadow-sm leading-relaxed space-y-4 text-sm sm:text-base text-[#4A353A] text-left">
              <p>I have to admit, Lena, I made most of the first moves.</p>
              <div className="space-y-2 pl-4 border-l-2 border-rose-300 font-serif italic text-[#732B3B]">
                <p>I was the one who noticed you first.</p>
                <p>I was the one who kept hoping to see you.</p>
                <p>I was the one who finally came up to you and asked your name.</p>
                <p>I was the one who started looking for little ways to reconnect.</p>
                <p>I was the one who liked your story, waited for the right moment, and finally sent that first &apos;Hi&apos;.</p>
                <p>I was the one who kept trying to understand whether there could ever be something between us.</p>
              </div>
              <p>And even when I was nervous, I still tried.</p>
              <p>Not because I expected anything from you.</p>
              <p className="font-serif italic text-base sm:text-lg text-[#782336]">
                I just wanted the chance to know you.
              </p>
              <p>
                Of course, I was scared. I didn&apos;t want to embarrass myself, and I didn&apos;t want to face another rejection.
              </p>
              <p>
                But I kept trying because getting to know you mattered to me.
              </p>
              <p className="font-serif text-base sm:text-lg text-[#8C1D32] italic font-semibold pt-2 border-t border-rose-100">
                And then, after all those first moves from my side, you made the move I never expected.
              </p>
            </div>
          </motion.div>
        </section>

        {/* =========================================================================
            SECTION 10 — MY WORK, MY BUSINESS, AND THE TIME I STILL WANT FOR YOU
            ========================================================================= */}
        <section className="relative pt-20 sm:pt-28">
          <motion.div
            {...animFadeUp}
            className="max-w-2xl mx-auto p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-white via-rose-50/50 to-amber-50/30 border-2 border-rose-200 shadow-lg space-y-6"
          >
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-100/90 text-xs font-serif font-medium text-[#732B3B] border border-rose-200">
                <Briefcase className="w-3.5 h-3.5 text-rose-500" />
                A Promise of Care
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-center font-medium text-[#3D1D24]">
              My work, my business, and the time I still want for you
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#4A353A] leading-relaxed">
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                Lena, there&apos;s something else I want you to understand about me.
              </p>
              <p>
                I have work to do. I have my business, my responsibilities, and things I need to build for my future.
              </p>
              <p>
                Some days, things might get busy. I might reply late. I might miss a day of texting or calling because I have too much going on.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#782336] pl-4 border-l-2 border-rose-300">
                And I don&apos;t want you to mistake that for me caring less about you.
              </p>
              <p className="font-medium text-[#732B3B]">
                Even on the busiest days, you still matter to me.
              </p>
              <p>
                I might not always be able to give you every minute of my day, but I want to make time for you. I want to come back to our conversations. I want to hear about your day, tell you about mine, and keep sharing those little parts of our lives.
              </p>
              <p>
                I don&apos;t want to make promises that sound beautiful today and become impossible tomorrow.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#782336]">
                I want to show you, through my actions, that you&apos;re important to me.
              </p>
              <div className="space-y-2 p-4 rounded-xl bg-white/90 border border-rose-100 text-sm sm:text-base font-serif italic text-[#632330]">
                <p>If I get busy, it doesn&apos;t mean I&apos;ve forgotten you.</p>
                <p>If I go quiet because of work, it doesn&apos;t mean my feelings have suddenly changed.</p>
                <p>And if there are days when I can&apos;t talk as much as I&apos;d like, I still want you to know that I&apos;m here.</p>
              </div>
              <p>
                I will wait for you. I will make time for you. And I want us to understand each other, even on the days when life gets busy.
              </p>
              <p>
                I can&apos;t promise that I&apos;ll always be available every second.
              </p>
              <p className="font-serif text-base sm:text-lg text-[#8C1D32] italic font-semibold">
                But I can promise that I don&apos;t want you to feel like you have to compete with my work for a place in my life.
              </p>
              <p>
                I want to build my future, and I want to keep making space for you in it.
              </p>
              <p>
                We both have our own lives, our own responsibilities, and our own difficult days.
              </p>
              <p>
                I want us to support each other through all of that.
              </p>
              <p>Not just when everything is easy.</p>
              <p>Not just when we have hours to talk.</p>
              <div className="pt-3 border-t border-rose-200 text-center font-serif text-base sm:text-lg italic text-[#8C1D32] font-medium">
                “Even when life gets busy, I still want it to be us, choosing to understand each other and finding our way back to one another.”
              </div>
            </div>
          </motion.div>
        </section>

        {/* =========================================================================
            SECTION 11 — OCTOBER 12: OUR FIRST PROPER CALL
            ========================================================================= */}
        <section className="relative pt-20 sm:pt-28">
          <motion.div {...animFadeUp} className="space-y-6">
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/70 border border-rose-200/60 text-xs font-serif font-medium text-[#7A2B3B]">
                <Phone className="w-3.5 h-3.5 text-rose-500" />
                October 12, 2026 · 11:46 AM
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-center font-medium text-[#3D1D24]">
              October 12 — Our first proper call
            </h2>

            {/* Minimal Call-Memory Card */}
            <div className="max-w-md mx-auto my-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-white via-rose-50/60 to-white border border-rose-200/80 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shadow-xs">
                    <Phone className="w-5 h-5 fill-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs font-serif text-rose-500/90 uppercase tracking-wider">
                      Voice Call · 11:46 AM
                    </p>
                    <p className="font-serif text-xl sm:text-2xl font-semibold text-[#421D26]">
                      51 minutes together
                    </p>
                  </div>
                </div>

                <div className="flex items-end gap-1 h-8 px-2">
                  <span
                    className="w-1 bg-rose-400 rounded-full animate-audio-bar"
                    style={{ height: "40%", animationDelay: "0.1s" }}
                  />
                  <span
                    className="w-1 bg-rose-500 rounded-full animate-audio-bar"
                    style={{ height: "80%", animationDelay: "0.3s" }}
                  />
                  <span
                    className="w-1 bg-rose-400 rounded-full animate-audio-bar"
                    style={{ height: "100%", animationDelay: "0.2s" }}
                  />
                  <span
                    className="w-1 bg-rose-600 rounded-full animate-audio-bar"
                    style={{ height: "65%", animationDelay: "0.45s" }}
                  />
                  <span
                    className="w-1 bg-rose-400 rounded-full animate-audio-bar"
                    style={{ height: "90%", animationDelay: "0.15s" }}
                  />
                  <span
                    className="w-1 bg-rose-500 rounded-full animate-audio-bar"
                    style={{ height: "50%", animationDelay: "0.35s" }}
                  />
                </div>
              </div>
            </div>

            <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-xs p-6 sm:p-8 rounded-2xl border border-rose-100/90 shadow-sm leading-relaxed space-y-4 text-sm sm:text-base text-[#4A353A]">
              <p>Then came our first proper call.</p>
              <p>October 12. 11:46 AM.</p>
              <p className="font-serif text-xl sm:text-2xl italic text-[#732B3B] font-semibold">
                Fifty-one minutes.
              </p>
              <p>
                It&apos;s funny how a number can become a memory when it&apos;s attached to someone you care about.
              </p>
              <p>
                We had already been texting, but hearing each other&apos;s voices was another step.
              </p>
              <p>
                For those 51 minutes, we had time to talk and share a little more of ourselves.
              </p>
              <p>
                I don&apos;t need to turn that call into a dramatic moment.
              </p>
              <p>
                I&apos;m happy simply remembering that it happened.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#782336] pt-1 border-t border-rose-100">
                It was another part of us getting closer, one conversation at a time.
              </p>
            </div>
          </motion.div>
        </section>

        {/* =========================================================================
            SECTION 12 — OCTOBER 21: THE ONE FIRST MOVE THAT CAME FROM YOU
            (THE EMOTIONAL CLIMAX OF THE ENTIRE STORY)
            ========================================================================= */}
        <section className="relative pt-24 sm:pt-36">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative p-6 sm:p-10 md:p-12 rounded-3xl bg-gradient-to-b from-[#FFF0F3] via-[#FFE4E9] to-[#FFF5F7] border-2 border-rose-300 shadow-2xl shadow-rose-900/10 space-y-8"
          >
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500 text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md shadow-rose-500/30">
                <Heart className="w-4 h-4 fill-white" />
                October 21, 2026 · 2:27 PM
              </span>
            </div>

            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-widest text-rose-600 font-semibold">
                The One First Move That Came From You
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#8C1D32]">
                October 21, 2026 · 2:27 PM
              </h2>
            </div>

            {/* HER EXACT MESSAGE CARD */}
            <div className="max-w-xl mx-auto my-6">
              <div className="relative p-6 sm:p-8 rounded-2xl bg-white shadow-xl shadow-rose-950/10 border-2 border-rose-300 text-center">
                <span className="text-[11px] uppercase tracking-widest text-rose-500 font-semibold block mb-2">
                  Her Message · Exactly As She Sent It
                </span>
                <p className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#8C1D32] leading-snug tracking-tight">
                  “Helloo!! Nnte boyfriend avan interested anoo??!! Say only yes or no!!”
                </p>
              </div>
            </div>

            {/* Emotional Honest Narration */}
            <div className="max-w-xl mx-auto space-y-4 text-sm sm:text-base text-[#4A353A] leading-relaxed bg-white/85 p-6 sm:p-8 rounded-2xl border border-rose-200/80 shadow-xs">
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                Lena, after all that time, do you know what surprised me the most?
              </p>
              <p className="font-serif text-xl sm:text-2xl font-bold text-[#8C1D32]">
                It was you.
              </p>
              <p>
                For so long, I was the one trying to find the courage to make a move.
              </p>
              <p>
                I was the one wondering if you were interested. I was the one trying to ask about relationships without asking directly. I was the one preparing myself for the possibility that you might say no.
              </p>
              <p className="font-serif text-lg sm:text-xl italic text-[#732333]">
                And then you sent me that message.
              </p>
              <p>You asked me.</p>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#8C1D32] tracking-wide">
                YOU.
              </p>
              <p>
                I had spent so much time wondering how I could tell you what I felt, and suddenly, I was the one being asked.
              </p>
              <p>
                I genuinely wasn&apos;t expecting it.
              </p>
              <p>
                I was happy, shocked, and probably not nearly as cool as I would have wanted to be.
              </p>
              <p>
                And then you told me to say only yes or no.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#782336]">
                After all those years of overthinking, I finally had a question that didn&apos;t need a complicated answer.
              </p>
            </div>

            {/* THE ANSWER REVEAL */}
            <div className="text-center pt-4 space-y-6">
              <div className="inline-block px-8 py-4 sm:px-12 sm:py-5 rounded-3xl bg-gradient-to-r from-[#8C1D32] via-[#A82842] to-[#8C1D32] text-white shadow-xl shadow-rose-900/30">
                <span className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                  YES. OBVIOUSLY. ❤️
                </span>
              </div>

              <div className="max-w-xl mx-auto space-y-4 text-sm sm:text-base text-[#4A353A] leading-relaxed bg-white/85 p-6 sm:p-8 rounded-2xl border border-rose-200/80 shadow-xs text-left">
                <p>Of course, I was interested.</p>
                <p>
                  I had wanted the chance to know you for so long. I had been happy about every little step that brought us closer.
                </p>
                <p className="font-serif text-base sm:text-lg text-[#732B3B] italic">
                  And now, the girl who once didn&apos;t even know my name was asking if I wanted to be her boyfriend.
                </p>
                <p>
                  You have no idea how special that feels when I think about where we started.
                </p>
                <p>I made the first move so many times.</p>
                <p className="font-serif text-lg sm:text-xl text-[#8C1D32] font-semibold">
                  But that final move was yours.
                </p>
                <p>
                  And I love that it was you who asked me.
                </p>
                <p>
                  Because our story isn&apos;t just about me liking you from the beginning.
                </p>
                <p className="font-serif text-base sm:text-lg text-[#782336] italic pl-4 border-l-2 border-rose-300">
                  It&apos;s also about the moment you chose to take a step toward me.
                </p>
                <p className="font-medium text-[#7A2436] pt-1">
                  That message is going to stay special to me for a long time.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* =========================================================================
            SECTION 13 — A LITTLE ABOUT TOMORROW (SUBTLE FUTURE & AMBITION)
            ========================================================================= */}
        <section className="relative pt-20 sm:pt-28">
          <motion.div
            {...animFadeUp}
            className="max-w-2xl mx-auto p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-white via-rose-50/50 to-pink-50/30 border-2 border-rose-200 shadow-lg space-y-6"
          >
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-100/90 text-xs font-serif font-medium text-[#732B3B] border border-rose-200">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                Thoughts on What Lies Ahead
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-center font-medium text-[#3D1D24]">
              A little about tomorrow
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#4A353A] leading-relaxed">
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                There&apos;s still so much I want to do in life. I have dreams to chase, work to do, and a lot to prove to myself.
              </p>
              <p>
                I want to build a life that I&apos;m proud of, and sometimes, when I imagine the days ahead, I find myself thinking about you too.
              </p>
              <p>
                I don&apos;t know exactly what life has planned for us. But I know I want to keep growing, work hard, and become someone who can share good days with you and face the difficult ones beside you.
              </p>
              <div className="p-4 sm:p-5 rounded-2xl bg-white/90 border border-rose-100 space-y-2 font-serif italic text-sm sm:text-base text-[#632330]">
                <p>
                  I have dreams and responsibilities, and I take them seriously.
                </p>
                <p>
                  I want to become a better version of myself, not just for a relationship, but for my own life too.
                </p>
                <p>
                  I cannot predict how life will go, but I can choose to work hard, learn from setbacks, and keep improving.
                </p>
              </div>
              <p className="font-serif italic text-base sm:text-lg text-[#782336] pl-4 border-l-2 border-rose-300">
                I want us both to grow, achieve our dreams, and be happy with the people we&apos;re becoming.
              </p>
              <div className="pt-3 border-t border-rose-200 text-center font-serif text-base sm:text-lg italic text-[#8C1D32] font-medium">
                “I just want you to know that, when I think about the days ahead, you have a place in my thoughts.”
              </div>
            </div>
          </motion.div>
        </section>

        {/* =========================================================================
            SECTION 14 — THE LETTER I WANT YOU TO READ SLOWLY
            ========================================================================= */}
        <section className="relative pt-24 sm:pt-36">
          <motion.div
            {...animFadeUp}
            className="max-w-2xl mx-auto p-8 sm:p-12 md:p-16 rounded-3xl bg-white/95 border border-rose-200/80 shadow-2xl shadow-rose-950/5 space-y-8"
          >
            <div className="text-center">
              <div className="inline-flex p-3 rounded-full bg-rose-50 border border-rose-200 text-rose-500 animate-heart-pulse mb-3">
                <Heart className="w-6 h-6 fill-rose-400" />
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#3D1D24]">
                A letter to Lena
              </h2>
              <p className="text-xs font-serif text-rose-500/80 italic mt-1">
                Please read this slowly ♡
              </p>
            </div>

            <div className="space-y-6 text-sm sm:text-base text-[#4A353A] leading-relaxed font-normal">
              <p className="font-serif text-2xl sm:text-3xl text-[#8C2337] font-medium">
                Lena,
              </p>

              <p>
                Sometimes I think about how strange our story is.
              </p>

              <p>
                I saw you on a bus before I knew your name.
              </p>

              <p>
                I wanted to talk to you before I knew anything about you.
              </p>

              <p>
                I tried to ask your name and failed.
              </p>

              <p>
                I thought I had to give up.
              </p>

              <p className="font-serif italic text-base sm:text-lg text-[#782336]">
                Then, somehow, we found our way back to each other.
              </p>

              <p>
                I still smile when I remember those little things. The first Instagram interactions. The message I was nervous to send. The whispers on October 8. Our first car date. The chocolates. Your little unicorn. Our first proper call.
              </p>

              <p className="font-serif italic text-base sm:text-lg text-[#732B3B] pl-4 border-l-2 border-rose-300">
                And then your message on October 21.
              </p>

              <p>
                If someone had told me in December 2023 that this would be our story, I don&apos;t think I would have believed them.
              </p>

              <p>
                Back then, I didn&apos;t know what would happen. I was just curious about you.
              </p>

              <p>
                Now, I know so much more about you, and I want to keep learning.
              </p>

              <p>
                I want to know the things that make you happy. I want to hear about the random things that happen in your day. I want to know when something is bothering you, and I want to be someone you feel comfortable talking to.
              </p>

              <p>
                I want us to laugh about silly things. I want us to have memories that only make sense to us. I want us to look back at ordinary days and realise how much those days meant.
              </p>

              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                And I want you to know that I have a life I&apos;m working hard to build, too.
              </p>

              <p>
                Sometimes my work and business will keep me busy. I might not always be able to call or text when I want to.
              </p>

              <p className="font-medium text-[#732B3B]">
                But I don&apos;t want you to feel forgotten when that happens.
              </p>

              <p>
                I want to keep making time for you, even when life gets complicated.
              </p>

              <p>
                I want us to talk honestly, understand each other, and be patient with each other when we need it.
              </p>

              <p>
                I&apos;m not saying I&apos;ll always do everything perfectly. I know I won&apos;t.
              </p>

              <p>
                But I want to keep trying.
              </p>

              <p className="font-serif text-base sm:text-lg text-[#782336] italic pl-4 border-l-2 border-rose-300">
                I want to be someone who makes you feel cared for, someone you can talk to, someone who listens, and someone who doesn&apos;t make you guess whether you matter.
              </p>

              <p className="font-serif text-lg sm:text-xl text-[#8C1D32] font-semibold">
                Because you do matter to me.
              </p>

              <p>
                And I don&apos;t want my feelings to exist only in a beautiful page or a long message.
              </p>

              <p>
                I want you to feel them in the way I treat you, the time I make for you, the way I listen to you, and the way I keep choosing to show up.
              </p>

              <p>
                I&apos;m so happy that we&apos;re here now.
              </p>

              <p>
                I don&apos;t know every detail of what comes next. We don&apos;t have to figure out everything today.
              </p>

              <p>
                I just want to keep getting to know you, keep making memories with you, and keep building something that makes both of us happy.
              </p>

              <div className="space-y-1.5 p-4 rounded-xl bg-rose-50/70 border border-rose-200/70 font-serif italic text-sm sm:text-base text-[#692934]">
                <p>Thank you for making that unexpected move on October 21.</p>
                <p>Thank you for being part of a story I never expected to get to tell.</p>
                <p>And thank you for being you.</p>
              </div>

              <p>
                Once, I hoped I&apos;d see you again.
              </p>

              <p className="font-serif text-lg sm:text-xl text-[#8C1D32] font-semibold">
                Now, I get to call you my girlfriend.
              </p>

              <p className="font-serif italic text-base sm:text-lg text-[#782336]">
                And honestly, Lena?
              </p>

              <p className="font-serif text-xl sm:text-2xl text-[#8C1D32] font-bold">
                I&apos;m really, really happy about that.
              </p>

              {/* Signature */}
              <div className="pt-8 text-right">
                <p className="font-script-romantic text-3xl sm:text-4xl text-[#8C2337]">
                  Yours,
                </p>
                <p className="font-script-romantic text-3xl sm:text-4xl text-[#8C2337] mt-1">
                  Sanoof. ❤️
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* =========================================================================
            SECTION 14 — FINAL CLOSING: ONE LAST THING
            ========================================================================= */}
        <section className="relative pt-24 sm:pt-36 text-center">
          <motion.div {...animFadeUp} className="max-w-xl mx-auto space-y-10">
            {/* Visual pause with generous whitespace */}
            <div className="space-y-3">
              <p className="font-serif text-lg sm:text-xl md:text-2xl italic text-[#732B3B]">
                “From the boy who first saw you on Puttekatt…”
              </p>
            </div>

            <div className="py-8 sm:py-12 flex items-center justify-center">
              <div className="flex items-center gap-3">
                <span className="w-12 sm:w-16 h-px bg-rose-300" />
                <Heart className="w-5 h-5 text-rose-500 fill-rose-400" />
                <span className="w-12 sm:w-16 h-px bg-rose-300" />
              </div>
            </div>

            <div className="space-y-4">
              <p className="font-serif text-xl sm:text-2xl md:text-3xl font-medium text-[#8C1D32]">
                “…to the boy who gets to call you his girlfriend.”
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-white/90 via-rose-50/50 to-pink-50/40 border border-rose-200/90 shadow-md space-y-5 text-sm sm:text-base text-[#4A353A] leading-relaxed text-left">
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                I liked you first.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                I made most of the first moves.
              </p>
              <p className="font-serif text-base sm:text-lg text-[#8C1D32] italic font-semibold">
                But one of my favourite memories will always be the day you made the last one.
              </p>
              <p>
                And if life gets busy, if we have quiet days, if we cannot talk as much as we want to, I hope we remember that we can always communicate, understand each other, and make time for what matters.
              </p>
              <p>
                I&apos;m still the same boy who wants to know more about you.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#782336]">
                Only now, I get to know you for real.
              </p>
              <p className="font-serif text-lg sm:text-xl text-[#8C1D32] font-semibold pt-2 border-t border-rose-100 text-center">
                And I&apos;m so happy it&apos;s you, Lena. ❤️
              </p>
              <div className="pt-4 text-center">
                <p className="font-script-romantic text-3xl sm:text-4xl text-[#8C2337]">
                  Your Sanoof.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* =========================================================================
            SECTION 15 — TIMELINE & MEMORABLE KEEPSAKES
            ========================================================================= */}

        {/* AN ONGOING JOURNAL OF US — TIMELINE */}
        <section className="relative pt-20 sm:pt-28">
          <motion.div
            {...animFadeUp}
            className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white/90 border border-rose-200/80 shadow-md space-y-6"
          >
            <div className="text-center space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/70 text-xs font-serif text-[#7A2B3B] font-medium">
                <Bookmark className="w-3.5 h-3.5 text-rose-500" />
                An Ongoing Journal of Us
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#3D1D24]">
                Look how far we&apos;ve come
              </h3>
              <p className="text-xs font-serif italic text-[#8C6D73]">
                Memories we&apos;ve gathered, in the order they happened
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {JOURNAL_TIMELINE_ENTRIES.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 rounded-xl bg-rose-50/50 hover:bg-rose-50 transition-colors border border-rose-100/80 text-xs sm:text-sm gap-2"
                >
                  <div className="flex items-start sm:items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <span className="font-serif font-medium text-[#4A262E] block sm:inline">
                        {item.title}
                      </span>
                      {item.storyText && (
                        <p className="text-[11px] text-[#7A5B62] font-serif italic mt-0.5">
                          {item.storyText}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {item.tag && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100/80 text-[#7A2B3B] font-serif">
                        {item.tag}
                      </span>
                    )}
                    <span className="text-[#875F66] font-mono text-[11px] sm:text-xs">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* THINGS I'LL ALWAYS ASSOCIATE WITH OUR STORY */}
        <section className="relative pt-16 sm:pt-20">
          <motion.div
            {...animFadeUp}
            className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white/90 border border-rose-200/80 shadow-md space-y-6"
          >
            <div className="text-center space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/70 text-xs font-serif text-[#7A2B3B] font-medium">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                Keepsakes & Memories
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#3D1D24]">
                Things I&apos;ll always associate with our story
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm">
              {[
                { term: "Puttekatt", desc: "where I first saw you." },
                { term: "“Perilla”", desc: "the name I never got at the gate." },
                {
                  term: "Instagram",
                  desc: "where we slowly found our way back into each other's lives.",
                },
                {
                  term: "“Hi”",
                  desc: "the message that started our everyday conversations.",
                },
                {
                  term: "Roadside whispers",
                  desc: "our first quiet real-life exchange in October.",
                },
                { term: "Chemmad", desc: "where our first car date began and ended." },
                { term: "A tiny unicorn", desc: "the Kinder Joy gift you gave me." },
                { term: "51 minutes", desc: "our first proper call together." },
                { term: "“Yes, obviously”", desc: "my answer to your question." },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-rose-50/40 to-white border border-rose-100/90 shadow-2xs space-y-1"
                >
                  <p className="font-serif font-semibold text-[#732B3B]">
                    {item.term}
                  </p>
                  <p className="text-[#694F54] text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>


        <section className="relative pt-16 sm:pt-20 text-center">
          <motion.div
            {...animFadeUp}
            className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-100/60 via-pink-100/50 to-rose-100/60 border border-rose-200 shadow-sm space-y-3"
          >
            <p className="font-serif text-lg sm:text-xl font-semibold text-[#8C2337]">
              One little thing about you
            </p>

            <p className="font-serif italic text-base sm:text-lg text-[#52333A] leading-relaxed">
              You once told me you didn&apos;t have a name.
            </p>

            <p className="font-serif italic text-base sm:text-lg text-[#8C1D32] font-semibold leading-relaxed">
              And now, Lena Fathima K, your name has become part of one of my favourite stories. ❤️
            </p>
          </motion.div>
        </section>


        {/* JOURNAL CONTINUATION CLOSING NOTE */}
        <section className="relative pt-12 pb-4 text-center">
          <motion.div {...animFadeUp} className="max-w-xl mx-auto space-y-3">
            <div className="flex items-center justify-center gap-3">
              <span className="w-12 h-px bg-rose-200" />
              <Heart className="w-4 h-4 text-rose-400 fill-rose-300/40" />
              <span className="w-12 h-px bg-rose-200" />
            </div>
            <p className="font-serif italic text-lg sm:text-xl text-[#732B3B] font-medium leading-relaxed">
              “Our story is still being written.”
            </p>
            <p className="text-xs sm:text-sm font-serif italic text-[#8C6D73]">
              There are still so many little moments waiting to become memories.
            </p>
            <p className="text-[11px] font-sans text-rose-500/80 tracking-widest uppercase font-medium">
              An ongoing journal · With you ♡
            </p>
          </motion.div>
        </section>

        {/* Footer Summary */}
        <div className="pt-8 text-center text-xs text-[#87656C] font-serif italic">
          Our story began in December 2023. We found our way to each other in
          October 2026. And we&apos;re still writing it together.
        </div>
      </div>

      {/* =========================================================================
          ACCESSIBLE LIGHTBOX MODAL FOR REAL PHOTOGRAPHS
          ========================================================================= */}
      <AnimatePresence>
        {activePhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label="Enlarged photo preview"
          >
            <div
              className="absolute inset-0 cursor-pointer"
              onClick={() => setActivePhoto(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative z-10 max-w-3xl w-full bg-white rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col items-center max-h-[92vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                aria-label="Close enlarged photo"
                className="absolute top-3 right-3 p-2 rounded-full bg-rose-50 hover:bg-rose-100 text-[#421D26] transition-colors cursor-pointer z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative w-full max-h-[70vh] aspect-auto flex items-center justify-center overflow-hidden rounded-xl bg-neutral-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activePhoto.src}
                  alt={activePhoto.alt}
                  className="max-w-full max-h-[68vh] object-contain rounded-lg"
                />
              </div>

              <div className="w-full mt-4 text-center space-y-1">
                <p className="font-serif text-lg sm:text-xl text-[#3D1D24] font-medium">
                  {activePhoto.caption}
                </p>
                <div className="flex items-center justify-center gap-3 text-xs text-[#7A5B62] font-serif italic">
                  <span>{activePhoto.date}</span>
                  {activePhoto.location && (
                    <>
                      <span>•</span>
                      <span>{activePhoto.location}</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING MUSIC CONTROLLER */}
      <div
        className="fixed z-40 pointer-events-auto select-none"
        style={{
          bottom: "max(16px, env(safe-area-inset-bottom, 16px))",
          right: "max(16px, env(safe-area-inset-right, 16px))",
        }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-2 rounded-full bg-white/95 hover:bg-white border border-rose-200/90 shadow-lg shadow-rose-950/10 backdrop-blur-md transition-all duration-300">
          <button
            type="button"
            onClick={prevTrack}
            aria-label="Previous track"
            className="p-1 rounded-full text-[#7A3644] hover:bg-rose-50 transition-colors cursor-pointer"
            title="Previous track"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={togglePlaySong}
            aria-label={isPlaying ? `Pause ${currentTrack.title}` : `Play ${currentTrack.title}`}
            className="w-8 h-8 rounded-full bg-[#8C2D40] hover:bg-[#782335] text-white flex items-center justify-center transition-transform active:scale-95 shadow-xs cursor-pointer shrink-0"
            title={isPlaying ? "Pause music" : `Play ${currentTrack.title}`}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-white" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={nextTrack}
            aria-label="Next track"
            className="p-1 rounded-full text-[#7A3644] hover:bg-rose-50 transition-colors cursor-pointer"
            title="Next track"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <div className="hidden sm:flex flex-col pr-1 text-left min-w-[110px]">
            <span className="text-[11px] font-medium text-[#4A262E] leading-tight flex items-center gap-1.5">
              <span>{currentTrack.title}</span>
              {isPlaying && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              )}
            </span>
            <span className="text-[10px] text-[#875F66] font-serif italic">
              {isPlaying ? "Playing automatically ♡" : "Tap to play ♡"}
            </span>
          </div>

          {isPlaying && (
            <div className="flex items-end gap-0.5 h-3.5 px-1">
              <span className="w-0.5 h-2 bg-rose-400 rounded-full animate-audio-bar" />
              <span className="w-0.5 h-3.5 bg-rose-500 rounded-full animate-audio-bar" style={{ animationDelay: "0.15s" }} />
              <span className="w-0.5 h-2.5 bg-rose-600 rounded-full animate-audio-bar" style={{ animationDelay: "0.3s" }} />
              <span className="w-0.5 h-1.5 bg-rose-400 rounded-full animate-audio-bar" style={{ animationDelay: "0.45s" }} />
            </div>
          )}
        </div>
      </div>

      {/* SINGLE PERSISTENT AUDIO ELEMENT */}
      <audio
        ref={audioRef}
        src={currentTrack.src}
        preload="auto"
        autoPlay
        playsInline
        loop={false}
        onPlay={() => {
          setIsPlaying(true);
          setPlaybackError(null);
        }}
        onPause={() => {
          setIsPlaying(false);
        }}
        onEnded={nextTrack}
        onError={() => {
          setIsPlaying(false);
          setPlaybackError("Tap to play again ♡");
        }}
      />
    </main>
  );
}
