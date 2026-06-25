"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "zezari:admin-menu-collapsed";

const MENU_ITEMS = [
  { id: "dashboard", label: "대시보드", href: "/admin" },
  { id: "guardians", label: "보호자 관리", href: "/admin?section=guardians" },
  { id: "subjects", label: "관리대상자 관리", href: "/admin?section=subjects" },
  { id: "orders", label: "주문/배송", href: "/admin?section=orders" },
  { id: "qr", label: "QR 관리", href: "/admin?section=qr" },
  { id: "admins", label: "관리자 관리", href: "/admin?section=admins" },
  { id: "payments", label: "결제 관리", href: "/admin?section=payments" },
  { id: "products", label: "상품 관리", href: "/admin?section=products" },
  { id: "ads", label: "광고 관리", href: "/admin?section=ads" },
  { id: "missing", label: "실종신고 관리", href: "/admin?section=missing" },
  { id: "locations", label: "위치공유 관리", href: "/admin?section=locations" },
  { id: "inquiries", label: "고객문의", href: "/admin?section=inquiries" },
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
          <strong>관리 메뉴</strong>
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
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
