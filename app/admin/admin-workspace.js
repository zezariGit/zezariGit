"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoutButton } from "../auth-actions";

const STORAGE_KEY = "zezari:admin-menu-collapsed";

const MENU_ITEMS = [
  { id: "dashboard", label: "대시보드", href: "/admin", icon: "home" },
  { id: "guardians", label: "보호자 관리", href: "/admin?section=guardians", icon: "guardian" },
  { id: "subjects", label: "대상자 관리", href: "/admin?section=subjects", icon: "group" },
  { id: "qr", label: "QR 관리", href: "/admin?section=qr", icon: "qr" },
  { id: "orders", label: "주문 관리", href: "/admin?section=orders", icon: "cart" },
  { id: "subscriptions", label: "구독 관리", href: "/admin?section=subscriptions", icon: "subscription" },
  { id: "payments", label: "결제 관리", href: "/admin?section=payments", icon: "payment" },
  { id: "coupons", label: "쿠폰 관리", href: "/admin?section=coupons", icon: "coupon" },
  { id: "products", label: "상품 관리", href: "/admin?section=products", icon: "box" },
  { id: "ads", label: "광고 관리", href: "/admin?section=ads", icon: "megaphone" },
  { id: "missing", label: "실종신고 관리", href: "/admin?section=missing", icon: "alert" },
  { id: "locations", label: "위치공유 관리", href: "/admin?section=locations", icon: "pin" },
  { id: "notifications", label: "알림 관리", href: "/admin?section=notifications", icon: "alert" },
  { id: "inquiries", label: "고객 문의", href: "/admin?section=inquiries", icon: "chat" },
  { id: "admins", label: "관리자 관리", href: "/admin?section=admins", icon: "shield" },
];

export default function AdminWorkspace({ activeSection, children }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  function toggleMenu() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  const toggleLabel = collapsed ? "관리자 메뉴 펼치기" : "관리자 메뉴 숨기기";

  return (
    <div className={`admin-workspace${collapsed ? " is-menu-collapsed" : ""}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link className="admin-sidebar-brand" href="/admin" title="제자리 관리자">
            <SidebarIcon name="shield" />
            <strong>제자리 관리자</strong>
          </Link>
          <button
            type="button"
            className="admin-sidebar-toggle"
            onClick={toggleMenu}
            aria-label={toggleLabel}
            aria-expanded={!collapsed}
            aria-controls="admin-primary-menu"
            title={toggleLabel}
          >
            <span className="admin-sidebar-toggle-icon" aria-hidden="true" />
          </button>
        </div>
        <nav id="admin-primary-menu" className="admin-menu" aria-label="관리자 메뉴">
          {MENU_ITEMS.map((item) => (
            <Link className={activeSection === item.id ? "active" : ""} href={item.href} key={item.id}>
              <SidebarIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-actions" aria-label="관리자 빠른 작업">
          <Link className="admin-sidebar-action" href="/">
            <SidebarIcon name="screen" />
            <span>사용자 화면</span>
          </Link>
          <LogoutButton className="admin-sidebar-action admin-sidebar-logout">
            <SidebarIcon name="logout" />
            <span>로그아웃</span>
          </LogoutButton>
        </div>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}

function SidebarIcon({ name }) {
  return (
    <svg className="admin-sidebar-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {iconPath(name)}
    </svg>
  );
}

function iconPath(name) {
  switch (name) {
    case "home":
      return (
        <>
          <path d="M3.5 10.5 12 3.8l8.5 6.7" />
          <path d="M5.5 9.5v10h13v-10" />
          <path d="M9.5 19.5v-6h5v6" />
        </>
      );
    case "guardian":
      return (
        <>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.5 19.5c.8-3.6 3.1-5.4 6.5-5.4s5.7 1.8 6.5 5.4" />
        </>
      );
    case "group":
      return (
        <>
          <circle cx="9" cy="8.5" r="2.8" />
          <circle cx="16" cy="9.5" r="2.4" />
          <path d="M3.8 19c.7-3.3 2.6-5 5.2-5s4.5 1.7 5.2 5" />
          <path d="M13.5 15.1c2.6.2 4.3 1.5 5 3.9" />
        </>
      );
    case "qr":
      return (
        <>
          <path d="M4 4h5v5H4z" />
          <path d="M15 4h5v5h-5z" />
          <path d="M4 15h5v5H4z" />
          <path d="M13 13h2v2h-2z" />
          <path d="M18 13h2v2h-2z" />
          <path d="M13 18h2v2h-2z" />
          <path d="M18 18h2v2h-2z" />
        </>
      );
    case "cart":
      return (
        <>
          <path d="M4 5h2l2 10h9.5l2-7H7" />
          <circle cx="10" cy="19" r="1.5" />
          <circle cx="17" cy="19" r="1.5" />
        </>
      );
    case "payment":
      return (
        <>
          <rect x="3.5" y="6" width="17" height="12" rx="2" />
          <path d="M3.5 10h17" />
          <path d="M7 15h5" />
        </>
      );
    case "coupon":
      return (
        <>
          <path d="M4 8.5V6.8C4 5.8 4.8 5 5.8 5h12.4c1 0 1.8.8 1.8 1.8v1.7a3 3 0 0 0 0 6v2.7c0 1-.8 1.8-1.8 1.8H5.8c-1 0-1.8-.8-1.8-1.8v-2.7a3 3 0 0 0 0-6z" />
          <path d="M9 9.5h.01" />
          <path d="M15 14.5h.01" />
          <path d="M15.5 9 8.5 16" />
        </>
      );
    case "subscription":
      return (
        <>
          <circle cx="12" cy="12" r="7.5" />
          <path d="M10 8.5v7" />
          <path d="M10 8.5 15.5 12 10 15.5" />
        </>
      );
    case "box":
      return (
        <>
          <path d="M4 8.5 12 4l8 4.5-8 4.5z" />
          <path d="M4 8.5v7L12 20l8-4.5v-7" />
          <path d="M12 13v7" />
        </>
      );
    case "megaphone":
      return (
        <>
          <path d="M4 13h3l9 4V7l-9 4H4z" />
          <path d="M7 13.5 8.4 20" />
          <path d="M19 9.5c.9.7 1.3 1.5 1.3 2.5s-.4 1.8-1.3 2.5" />
        </>
      );
    case "alert":
      return (
        <>
          <path d="M12 4c3.8 0 6.5 2.7 6.5 6.4v3.2l1.5 2.6H4l1.5-2.6v-3.2C5.5 6.7 8.2 4 12 4z" />
          <path d="M9.7 19c.5.8 1.3 1.2 2.3 1.2s1.8-.4 2.3-1.2" />
        </>
      );
    case "pin":
      return (
        <>
          <path d="M12 21s6-5.5 6-11a6 6 0 0 0-12 0c0 5.5 6 11 6 11z" />
          <circle cx="12" cy="10" r="2.2" />
        </>
      );
    case "chat":
      return (
        <>
          <path d="M4 6.5c0-1.4 1.1-2.5 2.5-2.5h11C18.9 4 20 5.1 20 6.5v6c0 1.4-1.1 2.5-2.5 2.5H11l-5 4v-4.2A2.5 2.5 0 0 1 4 12.5z" />
          <path d="M8 8.5h8" />
          <path d="M8 12h5" />
        </>
      );
    case "screen":
      return (
        <>
          <rect x="3.5" y="5" width="17" height="11" rx="2" />
          <path d="M9 20h6" />
          <path d="M12 16v4" />
        </>
      );
    case "logout":
      return (
        <>
          <path d="M10 5H5.5v14H10" />
          <path d="M13 8.5 17.5 12 13 15.5" />
          <path d="M8.5 12h9" />
        </>
      );
    case "shield":
    default:
      return (
        <>
          <path d="M12 3.5 19 6v5.8c0 4.4-2.8 7.4-7 8.7-4.2-1.3-7-4.3-7-8.7V6z" />
          <path d="m9 12 2 2 4-4" />
        </>
      );
  }
}
