"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const REVIEW_POLL_INTERVAL_MS = 5 * 60 * 1000;

export default function AdStatusAutoSync({ enabled }) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return undefined;

    let inFlight = false;
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

    const intervalId = window.setInterval(synchronize, REVIEW_POLL_INTERVAL_MS);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") synchronize();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, router]);

  return null;
}
