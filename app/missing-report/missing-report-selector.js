"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDateOnly } from "../../lib/date-format";

export default function MissingReportSelector({ subjects = [], initialSubjectId = "", forceNew = false }) {
  const initialSubject = subjects.find((subject) => subject.id === initialSubjectId) || null;
  const initialStatus = normalizeStatus(initialSubject?.status);
  const [selectedId, setSelectedId] = useState(initialStatus === "안전" ? initialSubjectId : "");
  const [blockedId, setBlockedId] = useState("");
  const [activeAdSubject, setActiveAdSubject] = useState(null);
  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === selectedId) || null,
    [selectedId, subjects]
  );
  const nextHref = selectedSubject ? buildAdSetupHref(selectedSubject.id, forceNew) : "";

  const handleChoose = (subject) => {
    const status = normalizeStatus(subject.status);
    if (status === "상품구매필요") {
      setSelectedId("");
      setBlockedId(subject.id);
      setActiveAdSubject(null);
      return;
    }
    if (status === "찾는중") {
      setSelectedId("");
      setBlockedId("");
      setActiveAdSubject(subject);
      return;
    }

    setBlockedId("");
    setActiveAdSubject(null);
    setSelectedId(subject.id);
  };

  return (
    <section className="missing-report-panel" aria-label="온라인 실종광고 대상자 선택">
      <header className="missing-report-topbar">
        <Link href="/?tab=dashboard" aria-label="대시보드로 돌아가기">←</Link>
        <h1 className="sr-only">온라인 실종광고 대상자 선택</h1>
      </header>

      <div className="missing-report-title" aria-hidden="true">
        <p>어떤 대상자를</p>
        <p>찾고 계신가요?</p>
      </div>

      <div className="missing-subject-box">
        <strong>등록된 대상자</strong>
        <div className="missing-subject-list" role="radiogroup" aria-label="실종광고 대상자">
          {subjects.map((subject) => {
            const status = normalizeStatus(subject.status);
            const blocked = status === "상품구매필요";
            const selected = selectedId === subject.id;
            const warned = blockedId === subject.id;

            return (
              <button
                className={`missing-subject-card${selected ? " selected" : ""}${warned ? " warned" : ""}`}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={blocked ? `${subject.name}, 상품 구매 필요, 선택 불가` : undefined}
                onClick={() => handleChoose(subject)}
                key={subject.id}
              >
                <SubjectPhoto subject={subject} />
                <span className="missing-subject-identity">
                  <strong>{subject.name}</strong>
                  <em>{formatDate(subject.birth_date)}</em>
                </span>
                <StatusBadge status={status} />
                <span className={`missing-subject-check${selected ? " selected" : ""}`} aria-hidden="true">
                  {selected ? "✓" : ""}
                </span>
              </button>
            );
          })}
          {subjects.length === 0 && <p className="missing-empty-text">등록된 대상자가 없습니다.</p>}
        </div>
      </div>

      <div className="missing-report-notice" aria-live="polite">
        {blockedId && (
          <p><span aria-hidden="true">!</span> QR 전용 상품을 구매해야 실종신고를 할 수 있어요.</p>
        )}
      </div>

      {nextHref ? (
        <Link className="missing-next-button" href={nextHref}>다음</Link>
      ) : (
        <button className="missing-next-button disabled" type="button" disabled>다음</button>
      )}

      {activeAdSubject && <ActiveAdDialog subject={activeAdSubject} onClose={() => setActiveAdSubject(null)} />}
    </section>
  );
}

function ActiveAdDialog({ subject, onClose }) {
  const imageSrc = subject.ad_creative_image_url
    || (subject.ad_id && subject.ad_id !== "preview-ad" ? `/api/ads/${encodeURIComponent(subject.ad_id)}/creative` : "")
    || "/assets/missing-ad-template.png";

  return (
    <div
      className="missing-ad-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="missing-ad-dialog" role="dialog" aria-modal="true" aria-labelledby="missing-active-ad-title">
        <header>
          <h2 id="missing-active-ad-title">진행 중인 실종광고가 있어요</h2>
          <p>현재 진행 중인 온라인 실종 광고가 있습니다.</p>
          <p>다른 지역·범위·기간으로 광고를 추가하시겠어요?</p>
        </header>
        <div className="missing-ad-dialog-summary">
          <img
            src={imageSrc}
            alt={`${subject.name} 실종광고 포스터`}
            onError={(event) => {
              event.currentTarget.src = "/assets/missing-ad-template.png";
            }}
          />
          <div>
            <strong>{subject.name}</strong>
            <dl>
              <div><dt>광고지역</dt><dd>{subject.ad_region || "지역 미입력"}</dd></div>
              <div><dt>광고기간</dt><dd>{formatPeriod(subject.ad_start_date, subject.ad_end_date)}</dd></div>
              <div><dt>광고금액</dt><dd>{formatCurrency(subject.ad_amount)}</dd></div>
              <div><dt>도달수</dt><dd>{formatNumber(subject.ad_reach_count)}명</dd></div>
            </dl>
          </div>
        </div>
        <div className="missing-ad-dialog-actions">
          <button type="button" onClick={onClose}>취소</button>
          <Link href={buildAdSetupHref(subject.id, true)}>광고 추가하기</Link>
        </div>
      </section>
    </div>
  );
}

function SubjectPhoto({ subject }) {
  const photoSrc = subject.photo_url || subject.photo_data_url;
  if (photoSrc) return <img className="missing-subject-photo" src={photoSrc} alt={`${subject.name} 사진`} />;
  return <span className="missing-subject-photo empty" aria-hidden="true"><i /></span>;
}

function StatusBadge({ status }) {
  return <em className={`status-badge ${statusClass(status)}`}>{statusLabel(status)}</em>;
}

function normalizeStatus(status) {
  if (status === "문제없음") return "안전";
  if (status === "QR활성화필요") return "상품구매필요";
  if (["상품구매필요", "안전", "찾는중"].includes(status)) return status;
  return "상품구매필요";
}

function statusLabel(status) {
  if (status === "상품구매필요") return "상품 구매 필요";
  if (status === "찾는중") return "찾는 중";
  return "안전";
}

function statusClass(status) {
  if (status === "상품구매필요") return "purchase-needed";
  if (status === "찾는중") return "searching";
  return "safe";
}

function buildAdSetupHref(subjectId, forceNew = false) {
  return `/?tab=dashboard&adSubject=${encodeURIComponent(subjectId)}${forceNew ? "&newAd=1" : ""}`;
}

function formatDate(value) {
  return formatDateOnly(value).replace(/-/g, ".");
}

function formatPeriod(start, end) {
  if (!start || !end) return "기간 미입력";
  const formattedStart = formatDate(start);
  const formattedEnd = formatDate(end);
  return formattedStart && formattedEnd ? `${formattedStart}~${formattedEnd}` : "기간 미입력";
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("ko-KR");
}
