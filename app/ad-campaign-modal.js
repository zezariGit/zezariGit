"use client";

import { useMemo, useState } from "react";
import FormSubmitButton from "./form-submit-button";

const statusLabels = {
  active: "광고중",
  paused: "일시정지",
  ready: "준비중",
  ended: "종료",
};

export default function AdCampaignModal({
  subject,
  dailyRate,
  createAction,
  pauseAction,
  resumeAction,
  endAction,
}) {
  const today = useMemo(() => getDateInputValue(new Date()), []);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [region, setRegion] = useState(subject?.ad_region || "");
  const quote = calculateQuote(startDate, endDate, dailyRate);
  const activeAd = ["active", "paused", "ready"].includes(subject?.ad_status || "");

  if (!subject) return null;

  return (
    <section className="ad-modal-backdrop" aria-label="광고 신청">
      <div className="ad-modal">
        <div className="ad-modal-header">
          <div>
            <p className="intro-kicker">광고</p>
            <h2>{subject.name} 광고 관리</h2>
            <p>Meta API 연동 전까지 광고 신청과 진행 상태를 서비스 DB에 저장합니다.</p>
          </div>
          <a className="plain-button" href="/?tab=dashboard">
            닫기
          </a>
        </div>

        {activeAd ? (
          <div className="ad-current-panel">
            <div className="ad-current-summary">
              <span className={`ad-status-pill ${subject.ad_status}`}>{statusLabels[subject.ad_status] || "진행중"}</span>
              <strong>{formatCurrency(subject.ad_amount || 0)}</strong>
              <span>
                {formatDate(subject.ad_start_date)} ~ {formatDate(subject.ad_end_date)}
              </span>
              <span>{subject.ad_region || "지역 미입력"}</span>
              <span>Meta API: {subject.ad_meta_status || "연동 대기"}</span>
            </div>
            <div className="ad-state-actions">
              {subject.ad_status === "active" && (
                <form action={pauseAction}>
                  <input type="hidden" name="adId" value={subject.ad_id} />
                  <FormSubmitButton className="activate-button" pendingText="정지중">
                    일시정지
                  </FormSubmitButton>
                </form>
              )}
              {subject.ad_status === "paused" && (
                <form action={resumeAction}>
                  <input type="hidden" name="adId" value={subject.ad_id} />
                  <FormSubmitButton className="activate-button" pendingText="재개중">
                    광고 재개
                  </FormSubmitButton>
                </form>
              )}
              <form action={endAction}>
                <input type="hidden" name="adId" value={subject.ad_id} />
                <FormSubmitButton className="danger-button compact" pendingText="종료중">
                  광고끝내기
                </FormSubmitButton>
              </form>
            </div>
          </div>
        ) : (
          <form action={createAction} className="ad-request-form">
            <input type="hidden" name="subjectId" value={subject.id} />
            <label className="full-field">
              광고지역
              <input
                name="region"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                placeholder="예: 서울 강남구, 부산 해운대구"
                required
              />
            </label>
            <label>
              시작일
              <input
                name="startDate"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </label>
            <label>
              종료일
              <input
                name="endDate"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                required
              />
            </label>
            <div className="ad-quote full-field">
              <span>일 단가 {formatCurrency(dailyRate)}</span>
              <strong>{quote.valid ? formatCurrency(quote.amount) : "기간을 확인해 주세요"}</strong>
              <span>{quote.valid ? `${quote.days}일 기준` : "종료일은 시작일 이후여야 합니다."}</span>
            </div>
            <FormSubmitButton className="action full-field" pendingText="저장중">
              광고 신청 저장
            </FormSubmitButton>
          </form>
        )}
      </div>
    </section>
  );
}

function calculateQuote(startDate, endDate, dailyRate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const rate = Number(dailyRate || 0);
  if (!start || !end || end < start) {
    return { valid: false, days: 0, amount: 0 };
  }

  const days = Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  return {
    valid: true,
    days,
    amount: days * Math.max(0, Math.floor(rate)),
  };
}

function parseDate(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

function getDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function formatDate(value) {
  if (!value) return "-";
  return String(value).replaceAll("-", ".");
}
