"use client";

import { useEffect, useState } from "react";
import { endAdminSupportLoginAction } from "./support-actions";

export default function SupportModeBanner() {
  const [supportUser, setSupportUser] = useState(null);

  useEffect(() => {
    let disposed = false;
    fetch("/api/auth/session", {
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    })
      .then((response) => response.json())
      .then((session) => {
        if (!disposed && session?.user?.supportMode) setSupportUser(session.user);
      })
      .catch(() => {});

    return () => {
      disposed = true;
    };
  }, []);

  if (!supportUser) return null;

  return (
    <aside className="support-mode-banner" aria-label="사용자지원 로그인 상태">
      <div>
        <strong>사용자지원 로그인</strong>
        <span>{supportUser.supportGuardianName || supportUser.name || "보호자"} 보호자 화면을 확인 중입니다.</span>
      </div>
      <form action={endAdminSupportLoginAction}>
        <button type="submit">관리자로 돌아가기</button>
      </form>
    </aside>
  );
}
