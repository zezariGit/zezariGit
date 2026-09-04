"use client";

import { useEffect } from "react";
import { isPushSupported, registerPushDevice } from "./push-subscription-client";

const LAST_SYNC_STORAGE_KEY = "zezari:push-subscription-synced-at";
const ACTIVE_SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000;
const FOCUS_SYNC_THRESHOLD_MS = 30 * 60 * 1000;

export default function PushSubscriptionSync() {
  useEffect(() => {
    if (!isPushSupported()) return undefined;

    let disposed = false;
    let syncing = false;

    const syncSubscription = async ({ force = false } = {}) => {
      if (disposed || syncing || !navigator.onLine || Notification.permission !== "granted") return;

      const lastSyncedAt = getLastPushSyncAt();
      if (!force && Date.now() - lastSyncedAt < FOCUS_SYNC_THRESHOLD_MS) return;

      syncing = true;
      try {
        const sessionResponse = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        });
        const session = await sessionResponse.json().catch(() => null);
        if (!sessionResponse.ok || !session?.user) return;

        await registerPushDevice({ requestPermission: false });
        setLastPushSyncAt(Date.now());
      } catch {
        // A later focus, online event, service-worker update, or interval retries synchronization.
      } finally {
        syncing = false;
      }
    };

    const syncWhenActive = () => {
      if (document.visibilityState !== "visible") return;
      void syncSubscription();
    };
    const forceSync = () => void syncSubscription({ force: true });
    const handleServiceWorkerMessage = (event) => {
      if (event.data?.type === "ZEZARI_PUSH_RESYNC_REQUIRED") forceSync();
    };

    forceSync();
    const intervalId = window.setInterval(forceSync, ACTIVE_SYNC_INTERVAL_MS);
    document.addEventListener("visibilitychange", syncWhenActive);
    window.addEventListener("online", forceSync);
    window.addEventListener("zezari:push-connected", forceSync);
    navigator.serviceWorker.addEventListener("controllerchange", forceSync);
    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", syncWhenActive);
      window.removeEventListener("online", forceSync);
      window.removeEventListener("zezari:push-connected", forceSync);
      navigator.serviceWorker.removeEventListener("controllerchange", forceSync);
      navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
    };
  }, []);

  return null;
}

function getLastPushSyncAt() {
  try {
    return Number(window.localStorage.getItem(LAST_SYNC_STORAGE_KEY) || 0);
  } catch {
    return 0;
  }
}

function setLastPushSyncAt(value) {
  try {
    window.localStorage.setItem(LAST_SYNC_STORAGE_KEY, String(value));
  } catch {
    // Private browsing or storage policy may block localStorage; in-memory retries still work.
  }
}
