"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatDateTime } from "../lib/date-format";

const PREVIEW_NOTIFICATIONS = [
  { id: "preview-location", category: "safety", title: "위치가 공유되었습니다", body: "박제자리 관리대상자의 현재 위치를 공유했습니다.", created_at: "2026-09-04T03:10:00.000Z", read_at: null },
  { id: "preview-contact", category: "safety", title: "보호자 안심번호로 연락이 왔습니다", body: "김제자리 관리대상자의 QR 페이지에서 보호자에게 연락했습니다.", created_at: "2026-09-04T01:20:00.000Z", read_at: null },
  { id: "preview-ad-active", category: "ad", title: "수정된 광고가 게재되었습니다", body: "Meta 검토가 완료되어 온라인 실종 광고가 다시 게재되었습니다.", created_at: "2026-09-04T01:12:00.000Z", read_at: "2026-09-04T01:15:00.000Z" },
  { id: "preview-ad-paused", category: "ad", title: "광고가 일시정지되었습니다", body: "광고 변경 요청으로 기존 광고가 일시정지되었습니다.", created_at: "2026-09-03T10:35:00.000Z", read_at: "2026-09-03T11:00:00.000Z" },
  { id: "preview-payment", category: "commerce", title: "결제가 완료되었습니다", body: "결제 내역을 확인해 주세요.", created_at: "2026-09-02T10:35:00.000Z", read_at: "2026-09-02T11:00:00.000Z" },
];

export default function NotificationBell({ preview = false }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState(preview ? PREVIEW_NOTIFICATIONS : []);
  const [unreadCount, setUnreadCount] = useState(preview ? 2 : 0);
  const popoverRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    if (preview) {
      setNotifications(PREVIEW_NOTIFICATIONS);
      setUnreadCount(PREVIEW_NOTIFICATIONS.filter((item) => !item.read_at).length);
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "알림을 조회하지 못했습니다.");
      const nextNotifications = Array.isArray(data.notifications) ? data.notifications : [];
      setNotifications(nextNotifications);
      setUnreadCount(Number.isFinite(Number(data.unreadCount))
        ? Math.max(0, Number(data.unreadCount))
        : nextNotifications.filter((item) => !item.read_at).length);
    } catch (error) {
      setMessage(error.message || "알림을 조회하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [preview]);

  const markRead = useCallback(async (notification) => {
    if (notification.read_at) return;
    const readAt = new Date().toISOString();
    setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, read_at: readAt } : item));
    setUnreadCount((count) => Math.max(0, count - 1));
    if (preview) return;

    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-read", id: notification.id }),
      });
      if (!response.ok) throw new Error("알림을 읽음 처리하지 못했습니다.");
      await notifyServiceWorker({ type: "ZEZARI_NOTIFICATIONS_READ" });
    } catch (error) {
      setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, read_at: null } : item));
      setUnreadCount((count) => count + 1);
      setMessage(error.message || "알림을 읽음 처리하지 못했습니다.");
    }
  }, [preview]);

  const closePopover = useCallback(() => {
    if (window.history.state?.zezariNotifications) window.history.back();
    else setOpen(false);
  }, []);

  const toggleOpen = async () => {
    if (open) {
      closePopover();
      return;
    }
    window.history.pushState({ ...window.history.state, zezariNotifications: true }, "", window.location.href);
    setOpen(true);
    await loadNotifications();
  };

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.serviceWorker || preview) return undefined;
    const handleMessage = (event) => {
      if (event.data?.type !== "ZEZARI_PUSH_MESSAGE") return;
      const nextUnreadCount = Number(event.data?.payload?.unreadCount);
      if (Number.isFinite(nextUnreadCount)) setUnreadCount(Math.max(0, nextUnreadCount));
      loadNotifications();
    };
    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, [loadNotifications, preview]);

  useEffect(() => { updateInstalledAppBadge(unreadCount); }, [unreadCount]);

  useEffect(() => {
    if (!open) return undefined;
    const closeFromOutside = (event) => {
      if (!popoverRef.current?.contains(event.target)) closePopover();
    };
    const closeFromKeyboard = (event) => { if (event.key === "Escape") closePopover(); };
    const closeFromHistory = () => setOpen(false);
    document.addEventListener("pointerdown", closeFromOutside);
    window.addEventListener("keydown", closeFromKeyboard);
    window.addEventListener("popstate", closeFromHistory);
    return () => {
      document.removeEventListener("pointerdown", closeFromOutside);
      window.removeEventListener("keydown", closeFromKeyboard);
      window.removeEventListener("popstate", closeFromHistory);
    };
  }, [closePopover, open]);

  return (
    <div className="notification-bell-wrap" ref={popoverRef}>
      <button className="corner-icon-button notification-bell-button" type="button" onClick={toggleOpen} aria-label="푸시 알림" aria-expanded={open} title="푸시 알림">
        <img className="dashboard-corner-icon" src="/assets/dashboard/notification.png" alt="" />
        {unreadCount > 0 && <span className="notification-count" aria-label={`읽지 않은 알림 ${unreadCount}개`}>{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <section className="notification-popover" role="dialog" aria-label="알림" aria-modal="false">
          <header className="notification-popover-header">
            <button className="notification-back-button" type="button" onClick={closePopover} aria-label="알림 닫기"><ChevronLeftIcon /></button>
            <strong>알림</strong>
            <button className={`notification-refresh-button${loading ? " loading" : ""}`} type="button" onClick={loadNotifications} disabled={loading} aria-label={loading ? "알림 조회 중" : "알림 새로고침"}><RefreshIcon /></button>
          </header>
          {message && <p className="notification-message">{message}</p>}
          {notifications.length === 0 ? (
            <div className="notification-empty">
              <img src="/assets/notifications/empty.png" alt="" />
              <strong>새로운 알림이 없습니다.</strong>
              <span>중요한 이벤트가 발생하면 여기에 표시됩니다.</span>
            </div>
          ) : (
            <ul className="notification-list">
              {notifications.map((notification) => <NotificationItem notification={notification} onRead={markRead} key={notification.id} />)}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function NotificationItem({ notification, onRead }) {
  const unread = !notification.read_at;
  const category = resolveNotificationCategory(notification);
  return (
    <li>
      <button className={`notification-item${unread ? " unread" : ""}`} type="button" onClick={() => onRead(notification)} aria-label={`${notification.title || "제자리 알림"}${unread ? ", 읽지 않음" : ", 읽음"}`}>
        <span className="notification-unread-dot" aria-hidden="true" />
        <img className="notification-category-icon" src={`/assets/notifications/${category}-${unread ? "unread" : "read"}.png`} alt="" />
        <span className="notification-item-copy">
          <strong>{notification.title || "제자리 알림"}</strong>
          {notification.body && <span>{notification.body}</span>}
          <time dateTime={notification.created_at}>{formatDateTime(notification.created_at, "")}</time>
        </span>
      </button>
    </li>
  );
}

function resolveNotificationCategory(notification) {
  if (["safety", "ad", "commerce"].includes(notification.category)) return notification.category;
  const value = `${notification.event_key || ""} ${notification.title || ""} ${notification.body || ""}`;
  if (/광고|Meta|META/.test(value)) return "ad";
  if (/결제|상품|환불|취소/.test(value)) return "commerce";
  return "safety";
}

function ChevronLeftIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>;
}

function RefreshIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6v5h-5" /><path d="M18.4 15.6A7.5 7.5 0 1 1 19.6 8L20 11" /></svg>;
}

async function updateInstalledAppBadge(value) {
  const count = Math.max(0, Number(value) || 0);
  try {
    if (count > 0 && typeof navigator?.setAppBadge === "function") await navigator.setAppBadge(Math.min(Math.floor(count), 999));
    else if (count === 0 && typeof navigator?.clearAppBadge === "function") await navigator.clearAppBadge();
  } catch {
    // Badge visibility is controlled by the installed app and device settings.
  }
}

async function notifyServiceWorker(message) {
  if (typeof navigator === "undefined" || !navigator.serviceWorker) return;
  const registration = await navigator.serviceWorker.ready.catch(() => null);
  registration?.active?.postMessage(message);
}
