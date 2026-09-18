"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Sparkles } from "lucide-react";

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Gentle harp/chime synthesizer fallback
  const playRomanticChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Pentatonic romantic chord progression (F# major / Eb minor frequencies)
      const notes = [
        369.99, // F#4
        440.0,  // A4
        493.88, // B4
        554.37, // C#5
        659.25, // E5
        739.99, // F#5
        880.0,  // A5
      ];

      const note = notes[Math.floor(Math.random() * notes.length)];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(note, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 3.0);
    } catch {
      // Audio context might be restricted
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current && audioLoaded) {
        audioRef.current.pause();
      }
      if (synthIntervalRef.current) {
        clearInterval(synthIntervalRef.current);
        synthIntervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
      if (audioRef.current && audioLoaded) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            startSynthesizer();
          });
      } else {
        startSynthesizer();
      }
    }
  };

  const startSynthesizer = () => {
    setIsPlaying(true);
    playRomanticChime();
    synthIntervalRef.current = setInterval(() => {
      playRomanticChime();
      if (Math.random() > 0.4) {
        setTimeout(() => playRomanticChime(), 350);
      }
    }, 2400);
  };

  useEffect(() => {
    return () => {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <audio
        ref={audioRef}
        src="/music.mp3"
        loop
        preload="none"
        onCanPlay={() => setAudioLoaded(true)}
      />
      <button
        onClick={togglePlay}
        aria-label={isPlaying ? "Mute romantic melody" : "Play romantic melody"}
        className={`group relative flex items-center gap-2 rounded-full px-4 py-2.5 text-xs tracking-wide transition-all duration-300 ${
          isPlaying
            ? "bg-[#6B172A] text-[#FAF6F0] shadow-lg shadow-[#6B172A]/20"
            : "luxury-glass text-[#6B172A] hover:bg-white"
        }`}
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          {isPlaying ? (
            <>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-40" />
              <Volume2 className="h-4 w-4" />
            </>
          ) : (
            <VolumeX className="h-4 w-4 opacity-70 group-hover:opacity-100" />
          )}
        </span>
        <span className="font-medium">
          {isPlaying ? "Melody Playing" : "Soft Melody"}
        </span>
        {isPlaying && (
          <Sparkles className="h-3 w-3 text-amber-300 animate-spin" style={{ animationDuration: "4s" }} />
        )}
      </button>
    </div>
  );
}
