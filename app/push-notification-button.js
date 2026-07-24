"use client";

import { useEffect, useState } from "react";

export default function PushNotificationButton() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [installRequired, setInstallRequired] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const canUsePush =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    const iosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setSupported(canUsePush);
    setInstallRequired(iosDevice && !standalone);
    setEnabled(canUsePush && Notification.permission === "granted");
  }, []);

  const enablePush = async () => {
    setLoading(true);
    setMessage("");

    try {
      if (!supported) throw new Error("이 브라우저는 푸시 알림을 지원하지 않습니다.");

      const keyResponse = await fetch("/api/push/public-key");
      const keyData = await keyResponse.json();
      if (!keyData.configured || !keyData.publicKey) {
        throw new Error("푸시 알림 서버 키 설정이 필요합니다.");
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("브라우저 알림 권한이 필요합니다.");
      }

      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
        }));

      const saveResponse = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });
      const saveData = await saveResponse.json().catch(() => ({}));
      if (!saveResponse.ok) {
        throw new Error(saveData?.message || "푸시 구독 저장에 실패했습니다.");
      }

      await syncUnreadBadge();
      setEnabled(true);
      setMessage("알림센터 수신과 앱 아이콘 배지가 켜졌습니다.");
    } catch (error) {
      setMessage(error.message || "푸시 알림 설정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!supported) {
    if (!installRequired) return null;
    return <p className="push-message">iPhone에서는 홈 화면에 설치한 앱 아이콘으로 연 뒤 알림을 켜 주세요.</p>;
  }

  return (
    <div className="push-action-wrap">
      <button className="admin-link" type="button" onClick={enablePush} disabled={loading || enabled}>
        {enabled ? "푸시 알림 켜짐" : loading ? "설정 중" : "푸시 알림 켜기"}
      </button>
      {message && <p className="push-message">{message}</p>}
    </div>
  );
}

async function syncUnreadBadge() {
  try {
    const response = await fetch("/api/notifications", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json().catch(() => ({}));
    const count = Math.max(0, Number(data.unreadCount) || 0);
    if (count > 0 && typeof navigator.setAppBadge === "function") {
      await navigator.setAppBadge(Math.min(Math.floor(count), 999));
    } else if (count === 0 && typeof navigator.clearAppBadge === "function") {
      await navigator.clearAppBadge();
    }
  } catch {
    // The next notification refresh will retry badge synchronization.
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
