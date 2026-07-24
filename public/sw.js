const CACHE_NAME = "zezari-v16";
const APP_SHELL = ["/", "/manifest.webmanifest"];

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
  if (url.pathname.startsWith("/api/auth")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/")))
  );
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
