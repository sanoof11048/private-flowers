"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Lock,
  RefreshCw,
  Gift,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Film,
  Sparkles,
  MessageSquare,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { ActiveGiftRecord, GiftType } from "@/types/gift";

function safeGetAdmKey(): string | null {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      return window.sessionStorage.getItem("__adm_key");
    }
  } catch {
    // Fail-safe
  }
  return null;
}

function safeSetAdmKey(val: string): void {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.setItem("__adm_key", val);
    }
  } catch {
    // Fail-safe
  }
}

// Preset Quick Templates for convenience
const PRESET_TEMPLATES: Array<{
  name: string;
  type: GiftType;
  title: string;
  subtitle: string;
  media_url?: string;
  tenor_post_id?: string;
  message?: string;
  punchline: string;
}> = [
  {
    name: "🍫 Kinder Joy",
    type: "image",
    title: "Something sweet 🍫",
    subtitle: "A classic essential",
    media_url: "/gifts/kinder-joy.png",
    punchline: "Okay fine... this one is actually edible 😂",
  },
  {
    name: "🐱 Cat Tenor GIF",
    type: "tenor",
    title: "Cat Attack 🐱",
    subtitle: "Okay... this one is for you 😂",
    tenor_post_id: "12553196888763818675",
    punchline: "Don't ask questions. 😂",
  },
  {
    name: "📸 Surprise Photo",
    type: "image",
    title: "A random surprise 📸",
    subtitle: "Certified moment",
    media_url: "/gifts/surprise.jpg",
    punchline: "Look at this distinguished gentleman 🍉😎",
  },
  {
    name: "🎬 Cinema Video",
    type: "video",
    title: "Watch this 🎬",
    subtitle: "Turn on your volume",
    media_url: "/gifts/video.mp4",
    punchline: "Peak cinema right here 🍿",
  },
  {
    name: "💬 Secret Note",
    type: "message",
    title: "Secret message 👀",
    subtitle: "Classified files",
    message: "Okay... you got everything. Except one thing. You owe me a treat now! 😂🍫",
    punchline: "😂",
  },
];

export default function PrivateGiftSetterPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeGift, setActiveGift] = useState<ActiveGiftRecord | null>(null);
  const [dbStatus, setDbStatus] = useState<{ configured: boolean; host: string; database: string } | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [formType, setFormType] = useState<GiftType>("image");
  const [formTitle, setFormTitle] = useState("Something sweet 🍫");
  const [formSubtitle, setFormSubtitle] = useState("A classic essential");
  const [formMediaUrl, setFormMediaUrl] = useState("/gifts/kinder-joy.png");
  const [formTenorId, setFormTenorId] = useState("12553196888763818675");
  const [formMessage, setFormMessage] = useState("");
  const [formPunchline, setFormPunchline] = useState("Okay fine... this one is actually edible 😂");

  // Fetch gift settings
  const fetchGiftData = useCallback(async (authPass: string) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/gift/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: authPass, action: "get" }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setIsAuthenticated(false);
          setAuthError("Incorrect password. Access denied.");
        } else {
          setErrorMsg(data.error || "Failed to load gift data.");
        }
        return;
      }

      setIsAuthenticated(true);
      setActiveGift(data.activeGift);
      if (data.dbStatus) setDbStatus(data.dbStatus);
      safeSetAdmKey(authPass);
    } catch {
      setErrorMsg("Network error connecting to server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-login if session exists
  useEffect(() => {
    const saved = safeGetAdmKey();
    if (saved) {
      setPassword(saved);
      fetchGiftData(saved);
    }
  }, [fetchGiftData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setAuthError("Please enter the password.");
      return;
    }
    setAuthError("");
    fetchGiftData(password.trim());
  };

  const handleSetPreset = (p: typeof PRESET_TEMPLATES[0]) => {
    setFormType(p.type);
    setFormTitle(p.title);
    setFormSubtitle(p.subtitle);
    if (p.media_url) setFormMediaUrl(p.media_url);
    if (p.tenor_post_id) setFormTenorId(p.tenor_post_id);
    if (p.message) setFormMessage(p.message);
    setFormPunchline(p.punchline);
  };

  const handleSaveActiveGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setErrorMsg("Please enter a gift title.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/gift/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          action: "set",
          giftData: {
            type: formType,
            title: formTitle.trim(),
            subtitle: formSubtitle.trim() || undefined,
            media_url:
              formType === "image" || formType === "gif" || formType === "video"
                ? formMediaUrl.trim()
                : undefined,
            tenor_post_id: formType === "tenor" ? formTenorId.trim() : undefined,
            message: formType === "message" ? formMessage.trim() : undefined,
            punchline: formPunchline.trim() || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to update active gift.");
        return;
      }

      setActiveGift(data.activeGift);
      setSuccessMsg("Active gift updated ✓ (Homepage will now show this gift)");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch {
      setErrorMsg("Network error saving active gift.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveActiveGift = async () => {
    if (!confirm("Are you sure you want to remove the active gift? The gift prompt will disappear from the homepage.")) {
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/gift/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action: "clear" }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to clear active gift.");
        return;
      }

      setActiveGift(null);
      setSuccessMsg("Active gift removed. Homepage gift button is now hidden.");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch {
      setErrorMsg("Network error removing active gift.");
    } finally {
      setIsLoading(false);
    }
  };

  // Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090e] text-rose-100 flex items-center justify-center p-4 font-sans select-none">
        <div className="w-full max-w-sm p-6 sm:p-8 rounded-3xl bg-[#12141c]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-400/20 text-rose-300">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-semibold text-center text-white tracking-wide">
            Gift Setter 🎁
          </h1>
          <p className="text-xs text-center text-white/50 mt-1 mb-6">
            Enter private password to manage active gifts
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-rose-400/50 transition-colors"
                autoFocus
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-medium text-sm shadow-lg shadow-rose-900/40 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Access Gift Setter"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-rose-100 font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#12141c]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-400/20 text-rose-300">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-wide">
                  Gift Setter 🎁
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                  Live Control
                </span>
              </div>
              <p className="text-xs text-white/50">
                Choose the ONE active gift that appears on the homepage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {dbStatus && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-[140px] font-mono text-[11px]">
                  {dbStatus.host}
                </span>
              </div>
            )}
            <button
              onClick={() => fetchGiftData(password)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white/80 hover:text-white transition-colors cursor-pointer border border-white/10"
              title="Refresh status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Notifications */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3 shadow-lg">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* SECTION 1: CURRENT ACTIVE GIFT */}
        <section className="p-6 rounded-3xl bg-[#12141c]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div>
              <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider font-mono">
                Current Active Gift
              </h2>
              <p className="text-xs text-white/50">
                This is what visitors currently receive on the website
              </p>
            </div>
            {activeGift && (
              <button
                onClick={handleRemoveActiveGift}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-300 hover:text-rose-200 transition-colors border border-rose-500/20 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Active Gift</span>
              </button>
            )}
          </div>

          {activeGift ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-400/20 text-rose-200 text-xs font-medium">
                  <span className="capitalize">{activeGift.type} Gift</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-wide">
                  {activeGift.title}
                </h3>
                {activeGift.subtitle && (
                  <p className="text-sm text-white/60">{activeGift.subtitle}</p>
                )}
                {activeGift.punchline && (
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs text-rose-200/90 font-medium">
                    Reaction: {activeGift.punchline}
                  </div>
                )}
                <div className="text-[11px] text-white/40 pt-2 font-mono">
                  Active in database · Updated {new Date(activeGift.updated_at || Date.now()).toLocaleTimeString()}
                </div>
              </div>

              {/* Active Gift Live Preview Card */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/40 border border-white/10 min-h-[200px]">
                <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider mb-2">
                  Visitor View
                </span>
                <AdminGiftMediaPreview gift={activeGift} />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 px-4 rounded-2xl bg-black/20 border border-dashed border-white/10">
              <span className="text-3xl mb-2 block">🎁💤</span>
              <h3 className="text-sm font-semibold text-white/80">
                No Active Gift Set
              </h3>
              <p className="text-xs text-white/40 max-w-sm mx-auto mt-1">
                The homepage gift button is currently hidden. Select a gift below and click &quot;Set as Active Gift&quot; to enable it.
              </p>
            </div>
          )}
        </section>

        {/* SECTION 2: CONFIGURE & SET NEW ACTIVE GIFT */}
        <section className="p-6 rounded-3xl bg-[#12141c]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="pb-4 mb-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider font-mono">
              Choose &amp; Set New Gift
            </h2>
            <p className="text-xs text-white/50">
              Select a gift type, customize content, preview live, and publish
            </p>
          </div>

          {/* Quick Presets */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-white/60 mb-2">
              Quick Templates
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_TEMPLATES.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleSetPreset(p)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Type Selector Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-white/60 mb-2">
              Gift Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(
                [
                  { id: "image", label: "Image", icon: ImageIcon },
                  { id: "gif", label: "GIF", icon: Sparkles },
                  { id: "video", label: "Video", icon: Film },
                  { id: "tenor", label: "Tenor GIF", icon: ExternalLink },
                  { id: "message", label: "Text Message", icon: MessageSquare },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFormType(id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                    formType === id
                      ? "bg-rose-500/20 border-rose-400/50 text-white shadow-lg shadow-rose-950/30"
                      : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveActiveGift} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Gift Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Something sweet 🍫"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-rose-400/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Optional Subtitle
                </label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="e.g. Okay... this one is for you 😂"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-rose-400/50"
                />
              </div>
            </div>

            {/* Dynamic Type Specific Fields */}
            {formType === "image" || formType === "gif" || formType === "video" ? (
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Media URL / Local Asset Path *
                </label>
                <input
                  type="text"
                  value={formMediaUrl}
                  onChange={(e) => setFormMediaUrl(e.target.value)}
                  placeholder="e.g. /gifts/kinder-joy.png or https://example.com/media.mp4"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-rose-400/50 font-mono text-xs"
                  required
                />
                <p className="text-[11px] text-white/40 mt-1">
                  Supports local assets in <code className="text-rose-200">/public/gifts/</code> or external HTTPS URLs.
                </p>
              </div>
            ) : formType === "tenor" ? (
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Tenor Post ID *
                </label>
                <input
                  type="text"
                  value={formTenorId}
                  onChange={(e) => setFormTenorId(e.target.value)}
                  placeholder="e.g. 12553196888763818675"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-rose-400/50 font-mono"
                  required
                />
                <p className="text-[11px] text-white/40 mt-1">
                  The ID from the Tenor URL. Loaded on-demand safely.
                </p>
              </div>
            ) : formType === "message" ? (
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Message Content *
                </label>
                <textarea
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Write your secret message..."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-rose-400/50"
                  required
                />
              </div>
            ) : null}

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Reaction / Punchline
              </label>
              <input
                type="text"
                value={formPunchline}
                onChange={(e) => setFormPunchline(e.target.value)}
                placeholder="e.g. Don't ask questions. 😂"
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-rose-400/50"
              />
            </div>

            {/* LIVE PREVIEW BOX BEFORE SAVING */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-white/70 mb-2 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-rose-300" />
                <span>Live Preview (What visitor will see)</span>
              </label>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center justify-center min-h-[180px]">
                <AdminGiftMediaPreview
                  gift={{
                    id: "preview",
                    type: formType,
                    title: formTitle,
                    subtitle: formSubtitle,
                    media_url: formMediaUrl,
                    tenor_post_id: formTenorId,
                    message: formMessage,
                    punchline: formPunchline,
                    is_active: true,
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-semibold text-sm shadow-xl shadow-rose-950/40 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4" />
                <span>Set as Active Gift 🎁</span>
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

// Sub-component to render clean preview in admin dashboard
function AdminGiftMediaPreview({ gift }: { gift: Partial<ActiveGiftRecord> }) {
  const tenorContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gift.type === "tenor" && gift.tenor_post_id) {
      const SCRIPT_ID = "tenor-embed-script";
      const triggerScan = () => {
        const win = window as unknown as { Tenor?: { Embed?: { init?: () => void } } };
        if (typeof win.Tenor?.Embed?.init === "function") {
          win.Tenor.Embed.init();
        }
      };

      if (!document.getElementById(SCRIPT_ID)) {
        const s = document.createElement("script");
        s.id = SCRIPT_ID;
        s.src = "https://tenor.com/embed.js";
        s.async = true;
        s.onload = triggerScan;
        document.body.appendChild(s);
      } else {
        triggerScan();
      }
    }
  }, [gift.type, gift.tenor_post_id]);

  if (gift.type === "image" || gift.type === "gif") {
    return (
      <div className="flex flex-col items-center">
        <div className="w-36 h-36 relative rounded-xl overflow-hidden bg-black/30 border border-white/10 flex items-center justify-center p-1">
          {gift.media_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gift.media_url}
              alt={gift.title || "Gift preview"}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-xs text-white/40">No URL provided</span>
          )}
        </div>
        <p className="text-xs font-medium text-rose-200 mt-2">{gift.title}</p>
      </div>
    );
  }

  if (gift.type === "video") {
    return (
      <div className="flex flex-col items-center w-full max-w-[240px]">
        <div className="w-full aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10">
          {gift.media_url ? (
            <video
              src={gift.media_url}
              controls
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-white/40">
              No Video URL
            </div>
          )}
        </div>
        <p className="text-xs font-medium text-rose-200 mt-2">{gift.title}</p>
      </div>
    );
  }

  if (gift.type === "tenor") {
    return (
      <div className="flex flex-col items-center">
        <div
          ref={tenorContainerRef}
          className="w-36 h-36 relative rounded-xl overflow-hidden bg-black/30 border border-white/10 flex items-center justify-center p-0.5"
        >
          {gift.tenor_post_id ? (
            <div
              className="tenor-gif-embed w-full h-full"
              data-postid={gift.tenor_post_id}
              data-share-method="host"
              data-aspect-ratio="1"
              data-width="100%"
            >
              <a href={`https://tenor.com/view/${gift.tenor_post_id}`}>Tenor GIF</a>
            </div>
          ) : (
            <span className="text-xs text-white/40">No Post ID</span>
          )}
        </div>
        <p className="text-xs font-medium text-rose-200 mt-2">{gift.title}</p>
      </div>
    );
  }

  if (gift.type === "message") {
    return (
      <div className="text-center p-3 rounded-xl bg-white/[0.04] border border-white/10 max-w-xs">
        <h4 className="text-sm font-semibold text-white">{gift.title}</h4>
        <p className="text-xs text-rose-200/90 mt-1">{gift.message || "Message content..."}</p>
        {gift.punchline && (
          <p className="text-[11px] text-white/50 mt-1.5">{gift.punchline}</p>
        )}
      </div>
    );
  }

  return null;
}
