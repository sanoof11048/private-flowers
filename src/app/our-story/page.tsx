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

export interface TimelineMediaItem {
  id?: string;
  type: "image" | "video";
  src: string;
  alt?: string;
  caption?: string;
}

export interface JournalMemoryEntry {
  id: string;
  date: string;
  title: string;
  storyText?: string;
  quote?: string;
  quoteLabel?: string;
  narrative?: string[];
  photo?: string;
  fallbackPhoto?: string;
  photoCaption?: string;
  photoLocation?: string;
  photoBadge?: string;
  tag?: string;
  media?: TimelineMediaItem[];
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
    id: "kinder-unicorn",
    date: "October 9, 2026",
    title: "Chocolates & the tiny unicorn",
    storyText: "A sweet exchange from our first drive — and a little keepsake from you.",
    tag: "Keepsake",
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
  {
    id: "birthday-oct-25",
    date: "October 25, 2026",
    title: "The Birthday Wish I'll Keep Forever ❤️",
    storyText:
      "Receiving your heartfelt birthday message and your prayers that we always stay together and support each other made this day unforgettable.",
    quote:
      "Happy Birthday, monusey🥹❤️🎂 You’re one of the most special people in my life, and I’m so lucky to have you. May Allah bless you with lots of happiness, success, and everything you wish for. 🫶🏻💗 I hope all your dreams come true, and I pray we always stay together and support each other. Thank you for being a part of my life. Again happy birthday ikakkaa!!😚",
    quoteLabel: "Lena's Birthday Wish · October 25, 2026",
    narrative: [
      "Receiving this message on October 25 meant more to me than any ordinary birthday greeting ever could. To read your words calling me one of the most special people in your life, praying that we always stay together and support each other, and thanking me for being part of your journey was a feeling I will hold onto forever.",
      "Not so long ago, we were two strangers passing by on a bus, and I was just hoping for a chance to know your name. Now, on this birthday, having your love, your prayers, and your genuine warmth with me made every tomorrow feel brighter.",
    ],
    media: [
      {
        id: "bday-1",
        type: "image",
        src: "/images/bday_wish_1.PNG",
        alt: "Lena's heartfelt birthday message screenshot",
        caption: "Her birthday wish · October 25, 2026",
      },
      {
        id: "bday-2",
        type: "video",
        src: "/images/bday_wish_2.MP4",
        caption: "Birthday moment · Video 1",
      },
      {
        id: "bday-3",
        type: "video",
        src: "/images/bday_wish_3.MP4",
        caption: "Birthday moment · Video 2",
      },
      {
        id: "bday-4",
        type: "video",
        src: "/images/bday_wish_4.MOV",
        caption: "Birthday moment · Video 3",
      },
    ],
    tag: "My Birthday",
  },
  {
    id: "car-date-oct-29",
    date: "October 29, 2026",
    title: "The Day We Finally Got Closer ❤️",
    storyText:
      "Walking together along the beach in the sunlight without a single touch, then finding our first shoulder hug, our first kiss, and playful bites in the quiet of the car.",
    narrative: [
      "At around 11:00 AM, we walked together along the beach under the warm morning sunlight. We were side by side, sharing the open air and the quiet rhythm of the waves, yet during that whole walk, there were no touches between us—just the simple, peaceful presence of being together.",
      "Later, when we were back inside the quiet space of the car, everything shifted into something closer and more personal. That was where we shared our first shoulder hug, pulling each other close in a way we never had before.",
      "And then came our first kiss—soft, tender, and the moment where all the time we had spent wondering and waiting simply melted away. Somewhere between our kisses and the little playful bites we traded with each other, the day became one of our most treasured memories. It was the day the quiet distance between us completely disappeared.",
    ],
    photo: "/images/oct_29_meet.webp",
    fallbackPhoto: "/images/oct_29_meet.jpg",
    photoCaption:
      "October 29, 2026 · The Day We Finally Got Closer · Beach walk, shoulder hug, our first kiss & playful bites",
    photoLocation: "Beach & Car Date",
    photoBadge: "Our Real Photograph",
    tag: "Got Closer",
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
              <span>December 2023 — Where our quiet story began</span>
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
                Maybe it was just another ordinary trip for you.
              </p>
              <p>
                But I remember seeing you on Puttekatt.
              </p>
              <p>
                I had no idea who you were, what your name was, or what kind of person you would turn out to be. I had only caught sight of you through the crowd.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                Yet for some reason, I couldn&apos;t stop hoping to see you again.
              </p>
              <p>
                After that, whenever I had the chance, I&apos;d look around for you. Sometimes I would wait, just hoping you might pass by.
              </p>
              <p>
                You didn&apos;t know I was looking. You weren&apos;t watching for me—you had no reason to.
              </p>
              <p>
                And that&apos;s what feels so surreal looking back. I was holding onto curiosity about a girl who didn&apos;t even know I existed yet.
              </p>
              <p className="font-serif text-base sm:text-lg text-[#6B2433] italic pl-4 border-l-2 border-rose-300 leading-relaxed">
                Back then, I didn&apos;t know your voice, your laugh, or how your messages would one day become the highlight of my days.
              </p>
              <p>
                I only knew that I wanted to know you. And that was enough to make sure you weren&apos;t just another face I forgot.
              </p>
              <div className="pt-3 border-t border-rose-100 font-serif italic text-base sm:text-lg text-[#7A2436] text-center font-medium">
                “You were a stranger then, Lena. But you were never just another stranger to me.”
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
              <p>
                Then came the day I finally gathered the courage to walk up to you at the school gate.
              </p>
              <p>
                All I wanted was one simple thing: to know your name.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                And your answer was simply: &apos;Perilla.&apos;
              </p>
              <p className="font-medium text-[#732B3B]">
                I still laugh thinking about it—our very first conversation, and you told me you didn&apos;t have a name. 😭
              </p>
              <p>
                I had spent days building up the nerve for that moment, and I still walked away without a clue what to call you.
              </p>
              <p>
                Before I could even figure out how to speak to you again, I found out you were in a relationship.
              </p>
              <p>
                So I stepped back quietly. I told myself that was that, and tried to move on.
              </p>
              <p className="font-serif text-base sm:text-lg text-[#782336] italic pl-4 border-l-2 border-rose-300">
                I never could have imagined that years later, you would be the one asking me to be your boyfriend.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B] pt-1">
                If someone had told me that at the school gate, I would have thought they were joking. But that was only the very first chapter of us.
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
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                Back then, you had no idea how curious I was, how much nerve it took to walk up to you, or how long I remembered that little exchange after it ended.
              </p>
              <p>
                And that was okay. You didn&apos;t owe me anything—we were still two strangers living completely separate lives.
              </p>
              <p className="font-serif text-base sm:text-lg text-[#782336] italic pl-4 border-l-2 border-rose-300">
                I&apos;m not telling you this so you feel bad about how it started. I&apos;m telling you because now, finally, I get to share my side of our story with you.
              </p>
              <p className="font-medium text-[#7A2436] pt-1">
                You get to see all the quiet moments where you were already on my mind, long before we ever spoke again.
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
              <p>
                More than two years passed. Then, on April 20, 2026, I took a quiet chance and liked your Instagram story.
              </p>
              <p>
                You liked mine back.
              </p>
              <p>
                Soon after, there were story replies, mutual notes, and close-friends stories. Little digital breadcrumbs that quietly brought you back into my world.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                I didn&apos;t assume it meant you liked me. But every time your name popped up on my screen, my entire day got a little brighter.
              </p>
              <p>
                I still didn&apos;t know if we&apos;d ever truly talk. I just appreciated those little glimpses into your life and the quiet familiarity growing between us.
              </p>
              <p className="font-serif text-base sm:text-lg text-[#782336] italic pl-4 border-l-2 border-rose-300 pt-1">
                It&apos;s funny how something as effortless as a story like can become the spark that reignites an entire story.
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
                You have no idea how many drafts I deleted before I finally sent a message.
              </p>
              <p>
                I kept overthinking every possibility—what if you left me on read? What if I made things awkward? I was bracing for disappointment before I even hit send.
              </p>
              <p>
                Then, on August 23 at exactly 6:57 PM, you posted a note, and I threw caution away.
              </p>
              <p className="font-serif text-2xl italic text-[#732B3B] font-semibold">
                &apos;Hi.&apos;
              </p>
              <p className="font-medium text-[#732B3B]">
                All that overthinking, and that was the grand opening line I managed. 😭
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#782336]">
                Yet it changed everything. Because you replied.
              </p>
              <p>
                One message turned into ten, ten turned into conversations that stretched into the night, and soon our streak became a daily habit neither of us wanted to break.
              </p>
              <p>
                For years, I had a thousand questions about the girl from Puttekatt. Now, I was finally getting to learn her answers.
              </p>
              <p className="font-serif text-base sm:text-lg text-[#8C1D32] italic pt-1 border-t border-rose-100">
                Little by little, you stopped being someone I wondered about from a distance. You became someone I looked forward to speaking with every single day.
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
                      "October 8, 2026 · Roadside whispers · Hearing your voice in person again.",
                    date: "October 8, 2026",
                    location: "Roadside Whispers",
                  })
                }
                className="group relative max-w-sm sm:max-w-md w-full bg-white p-3 sm:p-4 rounded-xl shadow-lg shadow-rose-950/8 border border-rose-100/90 hover:shadow-xl transition-all duration-300 hover:-rotate-1 cursor-zoom-in"
              >
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-amber-100/80 border border-amber-200/60 rounded-xs -rotate-2 shadow-xs z-10" />

                <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-rose-50">
                  <picture className="relative block w-full h-full">
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
              <p>
                I was in my car, and you were walking along the road.
              </p>
              <p>
                After months of screens and typed messages, there you were—standing in front of me in real life.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                And we spoke. Softly. Almost in whispers.
              </p>
              <p>
                On the surface, it was just two people pausing by the roadside for a brief exchange. But to me, hearing your physical voice right there felt completely different from any text on a phone.
              </p>
              <p>
                It was brief, a little hurried, and maybe even slightly awkward. I don&apos;t need to pretend it was a cinematic movie scene.
              </p>
              <p className="font-serif text-base sm:text-lg text-[#782336] italic pl-4 border-l-2 border-rose-300">
                It was real. And after waiting so long just to cross paths, those quiet whispers meant the world to me.
              </p>
              <p className="pt-1">
                Best of all, when that brief moment ended, we didn&apos;t have to leave our next encounter to chance. We agreed to meet properly the very next morning.
              </p>
              <div className="pt-3 border-t border-rose-100 font-serif italic text-base sm:text-lg text-[#7A2436] text-center font-medium">
                “I had spent so long hoping to see you. The next day, I finally got to spend time with you.”
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
                  <picture className="relative block w-full h-full">
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
              <p>
                I picked you up from Chemmad in my car for our very first car date.
              </p>
              <p>
                It wasn&apos;t about going somewhere extravagant or trying to put on an elaborate show. It was simply about having uninterrupted time beside you.
              </p>
              <p>
                We drove, we made little stops along the way, and we talked about everything that came to mind. For so long, I had only been able to imagine what you were like; now you were right there in the passenger seat, sharing your thoughts, your smile, and your quirks in real time.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                The time slipped away far too fast. Before I knew it, it was 12:20 PM, and I was dropping you off at the Chemmad bus stand.
              </p>
              <p className="font-serif text-base sm:text-lg text-[#782336] italic pl-4 border-l-2 border-rose-300">
                The irony still makes me smile—our story began on a bus back in 2023, and one of our fondest early memories ended at a bus stand.
              </p>
              <p>
                Only this time, you weren&apos;t a stranger I hoped to catch a glimpse of. You were someone I had just spent an unforgettable morning with.
              </p>
              <p className="pt-1">
                And we had our first selfie together—tangible proof that the morning was real, and that we were finally writing this story together.
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
              <p>I brought you chocolates for our drive.</p>
              <p>And in return, you handed me a tiny unicorn from a Kinder Joy egg. 🦄</p>
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                To anyone else, it&apos;s just a tiny plastic toy. But to me, it became an immediate treasure—because it came from you.
              </p>
              <p>
                I love that our memories aren&apos;t built on flashy, expensive gestures. They&apos;re woven out of little personal moments that only make sense to the two of us.
              </p>
              <p className="font-serif text-base sm:text-lg text-[#8C1D32] italic pl-4 border-l-2 border-rose-300">
                The chocolates, the tiny unicorn, the places we pulled over, the first selfie, and watching the clock count down to 12:20 PM. None of them needed to be grand to be unforgettable.
              </p>
              <p className="font-medium text-[#7A2436] pt-1">
                They were special simply because they were shared with you.
              </p>
            </div>
          </motion.div>
        </section>

        {/* =========================================================================
            SECTION 9 — OCTOBER 12: OUR FIRST PROPER CALL
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
              <p>
                Three days after our first car date came our first real phone call.
              </p>
              <p className="font-serif text-xl sm:text-2xl italic text-[#732B3B] font-semibold">
                October 12 · 11:46 AM · 51 minutes.
              </p>
              <p>
                It&apos;s funny how a specific number of minutes becomes unforgettable the moment it&apos;s spent with someone you adore.
              </p>
              <p>
                Texting had connected us, but hearing your voice right in my ear—laughing, pausing, and talking without a screen in between—brought an entirely new closeness.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#782336] pl-4 border-l-2 border-rose-300">
                There was no need for dramatic declarations. Just 51 effortless minutes of listening to each other, realizing that talking to you had become my favourite part of the day.
              </p>
            </div>
          </motion.div>
        </section>

        {/* =========================================================================
            SECTION 10 — OCTOBER 21: THE ONE FIRST MOVE THAT CAME FROM YOU
            (THE EMOTIONAL CLIMAX OF OUR STORY)
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
                <p>
                  I had made the first moves for so long—noticing you on Puttekatt, walking up to you at the gate, liking your story, and sending that nervous &apos;Hi&apos;.
                </p>
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
            SECTION 11 — A LITTLE ABOUT OUR FUTURE
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

            <div className="text-center space-y-1">
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium text-[#3D1D24]">
                A little about our future
              </h2>
              <p className="font-serif italic text-sm sm:text-base text-[#8C3A4D]">
                The life we hope to build together
              </p>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-[#4A353A] leading-relaxed">
              <p className="font-serif italic text-base sm:text-lg text-[#732B3B]">
                There&apos;s still so much ahead of us in life. We both have our own dreams to chase, work to do, and responsibilities we take seriously.
              </p>
              <p>
                The life we hope to build together isn&apos;t about dramatic promises—it&apos;s about growing side by side, learning from every challenge, and being there for each other on good days and difficult ones alike.
              </p>
              <p>
                We both have busy lives. I have my work and business, and there will be times when things get hectic, when replies might be late, or when we cannot talk as much as we&apos;d like.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#782336] pl-4 border-l-2 border-rose-300">
                I never want you to mistake that for caring less. You will never have to compete with work for a place in my life.
              </p>
              <p className="font-medium text-[#732B3B]">
                Even on the busiest days, what matters is that we choose each other—talking honestly, staying patient, and always finding our way back to one another.
              </p>
              <p>
                We cannot predict everything life will bring, but we can choose to work hard, learn from setbacks, and keep supporting each other as we grow.
              </p>
              <p className="font-serif italic text-base sm:text-lg text-[#782336]">
                I want us both to achieve our dreams for our future, and be genuinely happy with the people we&apos;re becoming together.
              </p>
              <div className="pt-3 border-t border-rose-200 text-center font-serif text-base sm:text-lg italic text-[#8C1D32] font-medium">
                “Where we hope life takes us together, having you by my side is what will make every tomorrow feel bright.”
              </div>
            </div>
          </motion.div>
        </section>

        {/* =========================================================================
            SECTION 12 — THE LETTER I WANT YOU TO READ SLOWLY
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
                I want us to keep building our future together, supporting each other through busy days and quiet days alike.
              </p>

              <p>
                I want us to talk honestly, understand each other, and be patient with each other as we grow side by side.
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
                I want you to feel them in the way I treat you, the time we make for each other, the way I listen to you, and the way we keep choosing to show up.
              </p>

              <p>
                I&apos;m so happy that we&apos;re here now.
              </p>

              <p>
                I don&apos;t know every detail of what comes next. We don&apos;t have to figure out everything today.
              </p>

              <p>
                I just want to keep experiencing life with you, keep making memories together, and keep building a future that makes both of us happy.
              </p>

              <div className="space-y-1.5 p-4 rounded-xl bg-rose-50/70 border border-rose-200/70 font-serif italic text-sm sm:text-base text-[#692934]">
                <p>Thank you for making that unexpected move on October 21.</p>
                <p>Thank you for being part of a story I never expected to get to tell.</p>
                <p>And thank you for being you.</p>
              </div>

              <div className="pt-2">
                <p className="font-serif text-lg sm:text-xl text-[#8C1D32] font-semibold">
                  From the boy who first saw you on Puttekatt… to the boy who gets to call you his girlfriend.
                </p>
                <p className="font-serif italic text-base sm:text-lg text-[#782336] mt-1">
                  And honestly, Lena? I&apos;m really, really happy about that.
                </p>
              </div>

              {/* Signature */}
              <div className="pt-6 text-right">
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
            SECTION 13 — TIMELINE & MEMORABLE KEEPSAKES
            ========================================================================= */}
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
                Memories and keepsakes we&apos;ve gathered, in the order they happened
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {JOURNAL_TIMELINE_ENTRIES.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col p-3.5 sm:p-4 rounded-2xl bg-rose-50/50 hover:bg-rose-50/80 transition-colors border border-rose-100/90 text-xs sm:text-sm gap-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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

                  {/* PROMINENT TREASURED LETTER / QUOTE KEEPSAKE */}
                  {item.quote && (
                    <div className="my-1 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white via-rose-50/80 to-pink-50/60 border border-rose-200/90 shadow-sm text-center space-y-2">
                      <span className="text-[10px] uppercase tracking-widest text-rose-500 font-semibold block">
                        {item.quoteLabel || "Treasure Keepsake"}
                      </span>
                      <p className="font-serif text-sm sm:text-base md:text-lg font-medium text-[#7A1C2E] leading-relaxed italic">
                        “{item.quote}”
                      </p>
                    </div>
                  )}

                  {/* DEEP TENDER FIRST-PERSON NARRATIVE */}
                  {item.narrative && item.narrative.length > 0 && (
                    <div className="space-y-2.5 text-xs sm:text-sm text-[#4A353A] leading-relaxed bg-white/85 p-3.5 sm:p-4 rounded-xl border border-rose-100">
                      {item.narrative.map((para, pIdx) => (
                        <p key={pIdx}>{para}</p>
                      ))}
                    </div>
                  )}

                  {/* MULTI-MEDIA GALLERY (E.G. BIRTHDAY ASSETS) */}
                  {item.media && item.media.length > 0 && (
                    <div className="pt-1 space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#7A3A46] font-serif">
                        <span className="font-medium flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                          Birthday Keepsakes &amp; Videos ({item.media.length})
                        </span>
                        <span className="text-[11px] italic text-[#8C6D73]">
                          Tap photo to enlarge · Videos playable with sound
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                        {item.media.map((m, mIdx) => (
                          <div
                            key={m.id || mIdx}
                            className="flex flex-col bg-white rounded-xl overflow-hidden border border-rose-200/80 shadow-xs hover:shadow-md transition-all"
                          >
                            <div className="relative aspect-[9/16] w-full bg-neutral-950 overflow-hidden">
                              {m.type === "image" ? (
                                <div
                                  onClick={() =>
                                    setActivePhoto({
                                      src: m.src,
                                      alt: m.alt || m.caption || "Birthday keepsake",
                                      caption: m.caption || "October 25, 2026 · Birthday Keepsake",
                                      date: "October 25, 2026",
                                      location: "Birthday Wish",
                                    })
                                  }
                                  className="relative w-full h-full cursor-zoom-in group"
                                >
                                  <Image
                                    src={m.src}
                                    alt={m.alt || "Birthday keepsake"}
                                    fill
                                    sizes="(max-width: 640px) 45vw, 200px"
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Maximize2 className="w-3 h-3" />
                                  </div>
                                </div>
                              ) : (
                                <video
                                  controls
                                  playsInline
                                  preload="metadata"
                                  className="w-full h-full object-cover"
                                >
                                  <source src={m.src} type="video/mp4" />
                                  <source src={m.src} type="video/quicktime" />
                                  Your browser does not support this video.
                                </video>
                              )}
                            </div>
                            {m.caption && (
                              <div className="p-2 text-center bg-rose-50/40 border-t border-rose-100">
                                <p className="text-[10px] font-serif text-[#692934] truncate">
                                  {m.caption}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* REAL PHOTOGRAPH PREVIEW (E.G. OCTOBER 29 CAR DATE) */}
                  {item.photo && !item.media && (
                    <div className="pt-2 pb-1 flex justify-center">
                      <figure
                        onClick={() =>
                          setActivePhoto({
                            src: item.photo!,
                            alt: `${item.title} - ${item.date}`,
                            caption:
                              item.photoCaption ||
                              `${item.date} · ${item.title}`,
                            date: item.date,
                            location: item.photoLocation || "Our Memory",
                          })
                        }
                        className="group relative max-w-sm sm:max-w-md w-full bg-white p-3 sm:p-4 rounded-2xl shadow-lg shadow-rose-950/8 border border-rose-200/90 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-zoom-in"
                      >
                        {item.photoBadge && (
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-rose-100/95 border border-rose-200/80 rounded-full shadow-xs z-10 text-[10px] font-serif text-[#8C1D32] flex items-center justify-center font-medium">
                            {item.photoBadge}
                          </div>
                        )}

                        <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-neutral-950 mt-1">
                          <picture className="relative block w-full h-full">
                            <source srcSet={item.photo} type="image/webp" />
                            {item.fallbackPhoto && (
                              <source srcSet={item.fallbackPhoto} type="image/jpeg" />
                            )}
                            <Image
                              src={item.photo}
                              alt={item.title}
                              fill
                              sizes="(max-width: 640px) 90vw, 420px"
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            />
                          </picture>
                          <div className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-black/60 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        <figcaption className="mt-3 text-center">
                          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-serif text-[#6B172A]">
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-100/80 border border-rose-200/60 font-medium">
                              {item.date}
                            </span>
                            {item.id === "car-date-oct-29" ? (
                              <>
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-100/80 border border-rose-200/60 font-medium">
                                  11:00 AM Beach walk
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-100/80 border border-rose-200/60 font-medium">
                                  Shoulder hug &amp; first kiss
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-100/80 border border-rose-200/60 font-medium">
                                  Playful bites
                                </span>
                              </>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-100/80 border border-rose-200/60 font-medium">
                                {item.tag || "Our Memory"}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#8C6D73] font-serif italic mt-1.5">
                            Tap photograph to view full size
                          </p>
                        </figcaption>
                      </figure>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CONCLUDING KEEPSAKE & ONGOING STORY NOTE */}
        <section className="relative pt-16 sm:pt-20 text-center">
          <motion.div
            {...animFadeUp}
            className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-100/60 via-pink-100/50 to-rose-100/60 border border-rose-200 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="w-12 h-px bg-rose-300" />
              <Heart className="w-4 h-4 text-rose-500 fill-rose-300/50" />
              <span className="w-12 h-px bg-rose-300" />
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#8C2337]">
              Our story is still being written ♡
            </h3>

            <p className="font-serif italic text-base sm:text-lg text-[#52333A] leading-relaxed">
              You once told me you didn&apos;t have a name. And now, Lena Fathima K, your name has become part of one of our favourite stories.
            </p>

            <p className="text-xs sm:text-sm font-serif italic text-[#7A454E] leading-relaxed">
              There are still so many little moments waiting to become memories as we walk toward our future together.
            </p>

            <div className="pt-2 border-t border-rose-200/60 text-xs text-[#87656C] font-serif italic">
              Our story began in December 2023. We found our way to each other in October 2026. And we&apos;re still writing it together.
            </div>
          </motion.div>
        </section>
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
