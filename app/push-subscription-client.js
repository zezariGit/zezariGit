"use client";

let registrationPromise = null;

export function isPushSupported() {
  return (
    typeof window !== "undefined"
    && "serviceWorker" in navigator
    && "PushManager" in window
    && "Notification" in window
  );
}

export async function registerPushDevice({ requestPermission = false } = {}) {
  if (registrationPromise) return registrationPromise;

  const pending = registerAndSavePushDevice({ requestPermission });
  registrationPromise = pending;

  try {
    return await pending;
  } finally {
    if (registrationPromise === pending) registrationPromise = null;
  }
}

async function registerAndSavePushDevice({ requestPermission }) {
  if (!isPushSupported()) {
    throw new Error("이 브라우저는 푸시 알림을 지원하지 않습니다.");
  }
  if (Notification.permission === "denied") {
    throw new Error("휴대폰 설정에서 zezari 알림을 허용한 뒤 다시 시도해 주세요.");
  }
  if (requestPermission && Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("휴대폰 알림 권한을 허용해 주세요.");
    }
  }
  if (Notification.permission !== "granted") {
    throw new Error("휴대폰 알림 권한이 필요합니다.");
  }

  const keyResponse = await fetch("/api/push/public-key", {
    cache: "no-store",
    credentials: "same-origin",
  });
  const keyData = await keyResponse.json().catch(() => ({}));
  if (!keyResponse.ok || !keyData.configured || !keyData.publicKey) {
    throw new Error("푸시 알림 서버 키 설정이 필요합니다.");
  }

  await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });
  const registration = await navigator.serviceWorker.ready;
  const applicationServerKey = urlBase64ToUint8Array(keyData.publicKey);
  let subscription = await registration.pushManager.getSubscription();

  if (subscription && !subscriptionKeyMatches(subscription, applicationServerKey)) {
    await subscription.unsubscribe();
    subscription = null;
  }
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  }

  const saveResponse = await fetch("/api/push/subscribe", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscription),
  });
  const saveData = await saveResponse.json().catch(() => ({}));
  if (!saveResponse.ok) {
    const error = new Error(saveData?.message || "기기 푸시 연결 저장에 실패했습니다.");
    error.status = saveResponse.status;
    throw error;
  }

  return subscription;
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
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}
