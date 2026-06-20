"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState([]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read_at).length,
    [notifications]
  );

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/notifications", {
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "알림을 조회하지 못했습니다.");
      }
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
    } catch (error) {
      setMessage(error.message || "알림을 조회하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  const markRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "mark-read" }),
      });
      if (!response.ok) return;
      const readAt = new Date().toISOString();
      setNotifications((items) =>
        items.map((item) => ({
          ...item,
          read_at: item.read_at || readAt,
        }))
      );
    } catch {
      // The next refresh will recover the read state.
    }
  }, []);

  const deleteNotification = useCallback(async (notification) => {
    setMessage("");
    setNotifications((items) => items.filter((item) => item.id !== notification.id));

    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: notification.id }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "알림을 삭제하지 못했습니다.");
      }
    } catch (error) {
      setNotifications((items) => {
        if (items.some((item) => item.id === notification.id)) return items;
        return [...items, notification].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      setMessage(error.message || "알림을 삭제하지 못했습니다.");
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.serviceWorker) return undefined;

    const handleMessage = (event) => {
      if (event.data?.type !== "ZEZARI_PUSH_MESSAGE") return;
      loadNotifications();
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, [loadNotifications]);

  const toggleOpen = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      await loadNotifications();
      await markRead();
    }
  };

  return (
    <div className="notification-bell-wrap">
      <button
        className="corner-icon-button notification-bell-button"
        type="button"
        onClick={toggleOpen}
        aria-label="푸시 알림"
        aria-expanded={open}
        title="푸시 알림"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="notification-count" aria-label={`읽지 않은 알림 ${unreadCount}개`}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-popover" role="dialog" aria-label="푸시 알림 메시지">
          <div className="notification-popover-header">
            <strong>알림</strong>
            <button type="button" onClick={loadNotifications} disabled={loading}>
              {loading ? "조회중" : "새로고침"}
            </button>
          </div>

          {message && <p className="notification-message">{message}</p>}

          {notifications.length === 0 ? (
            <p className="notification-empty">아직 수신된 푸시 메시지가 없습니다.</p>
          ) : (
            <ul className="notification-list">
              {notifications.map((notification) => (
                <SwipeNotificationItem
                  notification={notification}
                  onDelete={deleteNotification}
                  key={notification.id}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function SwipeNotificationItem({ notification, onDelete }) {
  const gesture = useRef({ pointerId: null, startX: 0, startY: 0, horizontal: false });
  const offsetRef = useRef(0);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const updateOffset = (value) => {
    const limited = Math.max(-132, Math.min(132, value));
    offsetRef.current = limited;
    setOffset(limited);
  };

  const handlePointerDown = (event) => {
    if (deleting || event.button > 0) return;
    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      horizontal: false,
    };
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragging || gesture.current.pointerId !== event.pointerId || deleting) return;
    const deltaX = event.clientX - gesture.current.startX;
    const deltaY = event.clientY - gesture.current.startY;
    if (!gesture.current.horizontal && Math.abs(deltaY) > Math.abs(deltaX)) return;
    if (Math.abs(deltaX) > 5) gesture.current.horizontal = true;
    if (!gesture.current.horizontal) return;
    event.preventDefault();
    updateOffset(deltaX);
  };

  const finishGesture = (event, cancelled = false) => {
    if (gesture.current.pointerId !== event.pointerId) return;
    setDragging(false);
    gesture.current.pointerId = null;

    if (!cancelled && Math.abs(offsetRef.current) >= 72) {
      const direction = offsetRef.current < 0 ? -1 : 1;
      setDeleting(true);
      offsetRef.current = direction * 420;
      setOffset(direction * 420);
      window.setTimeout(() => onDelete(notification), 180);
      return;
    }
    updateOffset(0);
  };

  return (
    <li className="notification-swipe-row">
      <div className="notification-swipe-delete" aria-hidden="true">
        <span>삭제</span>
        <span>삭제</span>
      </div>
      <div
        className={`notification-swipe-content${notification.read_at ? "" : " unread"}${dragging ? " dragging" : ""}${deleting ? " deleting" : ""}`}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => finishGesture(event)}
        onPointerCancel={(event) => finishGesture(event, true)}
      >
        <strong>{notification.title || "REAL_QR_FIND 알림"}</strong>
        {notification.body && <span>{notification.body}</span>}
        <time dateTime={notification.created_at}>{formatNotificationTime(notification.created_at)}</time>
      </div>
    </li>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M18 9.7V15l1.7 2.2a.8.8 0 0 1-.6 1.3H4.9a.8.8 0 0 1-.6-1.3L6 15V9.7a6 6 0 0 1 12 0Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M9.8 20a2.3 2.3 0 0 0 4.4 0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function formatNotificationTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
