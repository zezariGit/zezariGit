"use client";

import { useEffect, useState } from "react";
import { isPushSupported, registerPushDevice } from "./push-subscription-client";

export default function PushNotificationButton() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [installRequired, setInstallRequired] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const canUsePush = isPushSupported();
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    const iosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setSupported(canUsePush);
    setInstallRequired(iosDevice && !standalone);

    if (canUsePush && Notification.permission === "granted") {
      setLoading(true);
      registerPushDevice({ requestPermission: false })
        .then(async () => {
          if (cancelled) return;
          await syncUnreadBadge();
          setEnabled(true);
          setMessage("기기 푸시 연결이 확인되었습니다.");
        })
        .catch((error) => {
          if (cancelled) return;
          setEnabled(false);
          setMessage(error.message || "기기 푸시 연결을 다시 진행해 주세요.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const enablePush = async () => {
    setLoading(true);
    setMessage("");

    try {
      if (!supported) throw new Error("이 브라우저는 푸시 알림을 지원하지 않습니다.");
      await registerPushDevice({ requestPermission: true });
      window.dispatchEvent(new Event("zezari:push-connected"));
      await syncUnreadBadge();
      const testMessage = await requestTestPush();
      setEnabled(true);
      setMessage(testMessage);
    } catch (error) {
      setEnabled(false);
      setMessage(error.message || "푸시 알림 설정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const sendTestPush = async () => {
    setLoading(true);
    setMessage("");

    try {
      await registerPushDevice({ requestPermission: false });
      setMessage(await requestTestPush());
    } catch (error) {
      setEnabled(false);
      setMessage(error.message || "테스트 알림 발송에 실패했습니다.");
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
      <button
        className="admin-link"
        type="button"
        onClick={enabled ? sendTestPush : enablePush}
        disabled={loading}
      >
        {loading ? "연결 확인 중" : enabled ? "테스트 알림 보내기" : "푸시 알림 연결하기"}
      </button>
      {message && <p className="push-message">{message}</p>}
    </div>
  );
}

async function requestTestPush() {
  const response = await fetch("/api/push/test", {
    method: "POST",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || "테스트 알림 발송에 실패했습니다.");
  }
  return data?.message || "테스트 알림을 발송했습니다.";
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
