"use client";

import { useEffect, useRef } from "react";

// Module-level guard to strictly prevent double-tracking in React StrictMode & hydration
let hasFiredTrackingInSession = false;

function safeGetStorage(key: string): string | null {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      return window.sessionStorage.getItem(key);
    }
  } catch {
    // Gracefully handle SecurityError / QuotaExceeded in iOS Safari Private / WebViews
  }
  return null;
}

function safeSetStorage(key: string, value: string): void {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.setItem(key, value);
    }
  } catch {
    // Silent fallback
  }
}

function generateAnonymousId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // Fallback
  }
  return "v_" + Math.random().toString(36).substring(2, 12) + "_" + Date.now().toString(36);
}

/**
 * Production-hardened silent visit tracker.
 * Works seamlessly across iOS Safari, Instagram In-App Browser, Android Chrome, and Desktop.
 * Protected against storage exceptions, React StrictMode double-invocations, and network stalls.
 */
export default function VisitTracker() {
  const isMountedRef = useRef(false);

  useEffect(() => {
    // Strictly prevent duplicate execution across component remounts or StrictMode
    if (isMountedRef.current || hasFiredTrackingInSession) {
      return;
    }
    isMountedRef.current = true;
    hasFiredTrackingInSession = true;

    try {
      // 1. Retrieve or generate anonymous session visit ID safely
      let anonymousVisitId = safeGetStorage("__lena_vid");
      if (!anonymousVisitId) {
        anonymousVisitId = generateAnonymousId();
        safeSetStorage("__lena_vid", anonymousVisitId);
      }

      // 2. Safely capture path and referrer
      let path = "/";
      let referrer = "Direct";

      if (typeof window !== "undefined") {
        path = window.location.pathname || "/";
      }

      if (typeof document !== "undefined" && document.referrer) {
        referrer = document.referrer;
      }

      const payload = {
        visitId: anonymousVisitId,
        path,
        referrer,
      };

      const jsonPayload = JSON.stringify(payload);

      // 3. Guaranteed immediate asynchronous delivery via fetch with keepalive
      if (typeof fetch === "function") {
        fetch("/api/visit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: jsonPayload,
          keepalive: true,
        }).catch(() => {
          // Fail-safe: silently handle any client network interruptions
        });
      }
    } catch {
      // Ultimate safeguard: never affect visitor UI or experience
    }
  }, []);

  return null; // Zero visual footprint
}
