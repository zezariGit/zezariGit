"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export default function MissingReportSelector({ subjects = [] }) {
  const [selectedId, setSelectedId] = useState("");
  const [notice, setNotice] = useState("");
  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === selectedId) || null,
    [selectedId, subjects]
  );
  const selectedStatus = normalizeStatus(selectedSubject?.status);
  const nextHref =
    selectedStatus === "안전"
      ? `/?tab=dashboard&adSubject=${encodeURIComponent(selectedSubject.id)}`
      : selectedStatus === "찾는중"
        ? "/account/ads"
        : "";

  const handleChoose = (subject) => {
    const status = normalizeStatus(subject.status);
    if (status === "상품구매필요") {
      const message = "전용 QR 상품을 구매해야 서비스를 이용할 수 있습니다.";
      setSelectedId("");
      setNotice(message);
      window.alert(message);
      return;
    }
    if (status === "QR활성화필요") {
      const message = "상품 내 QR코드를 활성화해야 서비스를 이용할 수 있습니다.";
      setSelectedId("");
      setNotice(message);
      window.alert(message);
      return;
    }

    setNotice(status === "찾는중" ? "이미 찾는중인 대상자입니다. 광고 대시보드로 이동할 수 있습니다." : "");
    setSelectedId(subject.id);
  };

  return (
    <section className="missing-report-panel" aria-label="온라인 실종신고 대상자 선택">
      <header className="missing-report-topbar">
        <Link href="/" aria-label="대시보드로 돌아가기">‹</Link>
        <h1>온라인 실종신고</h1>
        <span aria-hidden="true" />
      </header>

      <div className="missing-report-title">
        <p>어떤 대상자를</p>
        <p>찾고 계신가요?</p>
      </div>

      <div className="missing-subject-box">
        <strong>등록 대상자</strong>
        <div className="missing-subject-list">
          {subjects.map((subject) => {
            const status = normalizeStatus(subject.status);
            const isBlocked = status === "상품구매필요" || status === "QR활성화필요";
            const selected = selectedId === subject.id;

            return (
              <button
                className={`missing-subject-card${selected ? " selected" : ""}${isBlocked ? " blocked" : ""}`}
                type="button"
                onClick={() => handleChoose(subject)}
                aria-disabled={isBlocked}
                key={subject.id}
              >
                <SubjectPhoto subject={subject} />
                <span>
                  <strong>{subject.name}</strong>
                  <em>{formatDate(subject.birth_date)}</em>
                </span>
                <StatusBadge status={status} />
              </button>
            );
          })}
          {subjects.length === 0 && (
            <p className="missing-empty-text">등록된 관리대상이 없습니다. 관리대상정보에서 대상자를 먼저 등록해 주세요.</p>
          )}
        </div>
      </div>

      {notice && (
        <div className="missing-warning" role="alert">
          <p>{notice}</p>
          {notice.includes("상품") && <Link href="/shop">상품 구매 페이지로 이동</Link>}
        </div>
      )}

      {nextHref ? (
        <Link className="missing-next-button" href={nextHref}>
          다음
        </Link>
      ) : (
        <button className="missing-next-button disabled" type="button" disabled>
          다음
        </button>
      )}
    </section>
  );
}

function SubjectPhoto({ subject }) {
  const photoSrc = subject.photo_url || subject.photo_data_url;
  if (photoSrc) {
    return <img className="missing-subject-photo" src={photoSrc} alt={`${subject.name} 사진`} />;
  }
  return (
    <span className="missing-subject-photo empty" aria-hidden="true">
      <i />
    </span>
  );
}

function StatusBadge({ status }) {
  return <em className={`status-badge ${statusClass(status)}`}>{status}</em>;
}

function normalizeStatus(status) {
  if (status === "문제없음") return "안전";
  if (["상품구매필요", "QR활성화필요", "안전", "찾는중"].includes(status)) return status;
  return "상품구매필요";
}

function statusClass(status) {
  if (status === "상품구매필요") return "purchase-needed";
  if (status === "QR활성화필요") return "qr-needed";
  if (status === "찾는중") return "searching";
  return "safe";
}

function formatDate(value) {
  if (!value) return "-";
  return String(value).replaceAll("-", ".");
}
