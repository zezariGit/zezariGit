"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const REVIEW_POLL_INTERVAL_MS = 5 * 60 * 1000;
const MAX_TIMEOUT_MS = 24 * 60 * 60 * 1000;

export default function AdStatusAutoSync({ reviewEnabled, nextExpiryDate = "" }) {
  const router = useRouter();

  useEffect(() => {
    if (!reviewEnabled && !nextExpiryDate) return undefined;

    let inFlight = false;
    let expiryTimeoutId;
    const synchronize = async () => {
      if (inFlight || document.visibilityState === "hidden") return;
      inFlight = true;
      try {
        const response = await fetch("/api/account/ads/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (!response.ok) return;
        const result = await response.json();
        const changed = Number(result.active || 0)
          + Number(result.rejected || 0)
          + Number(result.paused || 0)
          + Number(result.ended || 0)
          + Number(result.completed || 0);
        if (changed > 0) router.refresh();
      } catch {
        // The next interval retries while the advertisement remains under review.
      } finally {
        inFlight = false;
      }
    };

    const intervalId = reviewEnabled
      ? window.setInterval(synchronize, REVIEW_POLL_INTERVAL_MS)
      : undefined;
    const scheduleExpirySync = () => {
      if (!nextExpiryDate) return;
      const expiryTime = new Date(`${nextExpiryDate}T23:59:59+09:00`).getTime() + 1000;
      if (!Number.isFinite(expiryTime)) return;
      const delay = expiryTime - Date.now();
      if (delay <= 0) {
        synchronize();
        return;
      }
      expiryTimeoutId = window.setTimeout(() => {
        if (delay > MAX_TIMEOUT_MS) scheduleExpirySync();
        else synchronize();
      }, Math.min(delay, MAX_TIMEOUT_MS));
    };
    scheduleExpirySync();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") synchronize();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      if (intervalId) window.clearInterval(intervalId);
      if (expiryTimeoutId) window.clearTimeout(expiryTimeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [nextExpiryDate, reviewEnabled, router]);

  return null;
}
