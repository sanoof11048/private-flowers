"use client";

import { useEffect, useRef } from "react";

/**
 * Silent, non-blocking visit beacon.
 * Automatically records visit upon initial page load without asking visitor any questions.
 * Strictly protected against duplicate triggers from React re-renders or StrictMode.
 */
export default function VisitTracker() {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    // 1. In-memory ref check (prevents re-render / double-mount duplicates)
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;

    // 2. Session check to guarantee unique visit tracking per page load
    try {
      let anonymousVisitId = "";
      if (typeof window !== "undefined" && window.sessionStorage) {
        anonymousVisitId = window.sessionStorage.getItem("__v_id") || "";
        if (!anonymousVisitId) {
          anonymousVisitId =
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : "v_" + Math.random().toString(36).substring(2, 15);
          window.sessionStorage.setItem("__v_id", anonymousVisitId);
        }
      }

      const payload = {
        visitId: anonymousVisitId,
        path: typeof window !== "undefined" ? window.location.pathname : "/",
        referrer: typeof document !== "undefined" && document.referrer ? document.referrer : "Direct",
      };

      const jsonPayload = JSON.stringify(payload);

      // 3. Asynchronously transmit beacon in background without blocking rendering
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const blob = new Blob([jsonPayload], { type: "application/json" });
        const sent = navigator.sendBeacon("/api/visit", blob);
        if (sent) return;
      }

      // Fallback: asynchronous fetch with keepalive
      if (typeof fetch === "function") {
        fetch("/api/visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: jsonPayload,
          keepalive: true,
        }).catch(() => {
          // Fail-safe: silently ignore network errors
        });
      }
    } catch {
      // Fail-safe: never throw or disrupt visitor experience
    }
  }, []);

  return null; // Zero UI footprint
}
