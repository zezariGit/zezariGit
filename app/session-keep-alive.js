"use client";

import { useEffect } from "react";

const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;
const FOCUS_REFRESH_THRESHOLD_MS = 30 * 60 * 1000;

export default function SessionKeepAlive() {
  useEffect(() => {
    let disposed = false;
    let lastRefreshAt = 0;

    const refreshSession = async () => {
      if (disposed || (typeof navigator !== "undefined" && !navigator.onLine)) return;

      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        });
        if (response.ok) lastRefreshAt = Date.now();
      } catch {
        // A later focus, online event, or interval retries the refresh.
      }
    };

    const refreshWhenActive = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastRefreshAt < FOCUS_REFRESH_THRESHOLD_MS) return;
      void refreshSession();
    };

    void refreshSession();
    const intervalId = window.setInterval(refreshSession, REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", refreshWhenActive);
    window.addEventListener("online", refreshWhenActive);

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshWhenActive);
      window.removeEventListener("online", refreshWhenActive);
    };
  }, []);

  return null;
}
