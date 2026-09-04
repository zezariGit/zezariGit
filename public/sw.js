const CACHE_NAME = "zezari-v17";
const APP_SHELL = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (!isCacheableStaticRequest(event.request, url)) return;

  event.respondWith(
    caches.match(event.request).then(async (cached) => {
      try {
        const response = await fetch(event.request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, response.clone());
        }
        return response;
      } catch (error) {
        if (cached) return cached;
        throw error;
      }
    })
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(refreshPushSubscription(event));
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data?.json?.() || {};
  } catch {
    data = {};
  }
  const title = data.title || "REAL_QR_FIND 알림";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    silent: false,
    vibrate: [180, 80, 180],
    tag: data.notificationId || `zezari-${Date.now()}`,
    renotify: true,
    data: {
      url: data.url || "/",
      notificationId: data.notificationId || "",
    },
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      updateAppBadge(data.unreadCount),
      broadcastPushMessage({
        title,
        body: data.body || "",
        url: data.url || "/",
        notificationId: data.notificationId || "",
        createdAt: data.createdAt || new Date().toISOString(),
        unreadCount: normalizeBadgeCount(data.unreadCount),
      }),
    ])
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    Promise.all([
      markNotificationsRead(),
      clearAppBadge(),
      closeDisplayedNotifications(),
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        if (isExternalUrl(targetUrl)) {
          return self.clients.openWindow(targetUrl);
        }

        for (const client of clients) {
          if ("focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        return self.clients.openWindow(targetUrl);
      }),
    ])
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "ZEZARI_NOTIFICATIONS_READ") {
    event.waitUntil(Promise.all([clearAppBadge(), closeDisplayedNotifications()]));
    return;
  }

  if (event.data?.type === "ZEZARI_NOTIFICATION_DELETED" && event.data.notificationId) {
    event.waitUntil(closeDisplayedNotification(event.data.notificationId));
  }
});

function isCacheableStaticRequest(request, url) {
  if (url.origin !== self.location.origin || request.mode === "navigate") return false;
  if (url.pathname === "/manifest.webmanifest") return true;
  return url.pathname.startsWith("/icons/") || url.pathname.startsWith("/assets/");
}

async function refreshPushSubscription(event) {
  try {
    let subscription = event.newSubscription || null;
    if (!subscription) {
      const applicationServerKey = await getPushApplicationServerKey();
      subscription = await self.registration.pushManager.getSubscription();

      if (subscription && !subscriptionKeyMatches(subscription, applicationServerKey)) {
        await subscription.unsubscribe();
        subscription = null;
      }
      if (!subscription) {
        subscription = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }
    }

    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });
    if (!response.ok) throw new Error(`Push subscription sync failed: ${response.status}`);
  } catch {
    await broadcastPushResyncRequired();
  }
}

async function getPushApplicationServerKey() {
  const response = await fetch("/api/push/public-key", {
    cache: "no-store",
    credentials: "include",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.configured || !data.publicKey) {
    throw new Error("Push public key is unavailable.");
  }
  return urlBase64ToUint8Array(data.publicKey);
}

function subscriptionKeyMatches(subscription, expectedKey) {
  const storedKey = subscription?.options?.applicationServerKey;
  if (!storedKey) return true;
  const storedBytes = new Uint8Array(storedKey);
  if (storedBytes.length !== expectedKey.length) return false;
  return storedBytes.every((value, index) => value === expectedKey[index]);
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = self.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

async function broadcastPushResyncRequired() {
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  await Promise.all(
    clients.map((client) => client.postMessage({ type: "ZEZARI_PUSH_RESYNC_REQUIRED" }))
  );
}

function isExternalUrl(value) {
  try {
    return new URL(value, self.location.origin).origin !== self.location.origin;
  } catch {
    return false;
  }
}

async function broadcastPushMessage(payload) {
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  await Promise.all(
    clients.map((client) =>
      client.postMessage({
        type: "ZEZARI_PUSH_MESSAGE",
        payload,
      })
    )
  );
}

async function updateAppBadge(value) {
  const count = normalizeBadgeCount(value);
  if (count <= 0) return clearAppBadge();
  if (typeof self.navigator?.setAppBadge !== "function") return;

  try {
    await self.navigator.setAppBadge(count);
  } catch {
    // The operating system may manage badges from notification state instead.
  }
}

async function clearAppBadge() {
  if (typeof self.navigator?.clearAppBadge !== "function") return;
  try {
    await self.navigator.clearAppBadge();
  } catch {
    // Badge permission and launcher support are controlled by the device.
  }
}

async function markNotificationsRead() {
  try {
    await fetch("/api/notifications", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "mark-read" }),
    });
  } catch {
    // The app refresh will reconcile unread state if the device is offline.
  }
}

async function closeDisplayedNotifications() {
  const notifications = await self.registration.getNotifications();
  notifications.forEach((notification) => notification.close());
}

async function closeDisplayedNotification(notificationId) {
  const notifications = await self.registration.getNotifications({
    tag: String(notificationId),
  });
  notifications.forEach((notification) => notification.close());
}

function normalizeBadgeCount(value) {
  const count = Number(value);
  if (!Number.isFinite(count) || count <= 0) return 0;
  return Math.min(Math.floor(count), 999);
}
