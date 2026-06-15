"use client";

import { useEffect, useState } from "react";

export default function PushNotificationButton() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const canUsePush =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setSupported(canUsePush);
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

      setEnabled(true);
      setMessage("푸시 알림이 켜졌습니다.");
    } catch (error) {
      setMessage(error.message || "푸시 알림 설정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!supported) return null;

  return (
    <div className="push-action-wrap">
      <button className="admin-link" type="button" onClick={enablePush} disabled={loading || enabled}>
        {enabled ? "푸시 알림 켜짐" : loading ? "설정 중" : "푸시 알림 켜기"}
      </button>
      {message && <p className="push-message">{message}</p>}
    </div>
  );
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
