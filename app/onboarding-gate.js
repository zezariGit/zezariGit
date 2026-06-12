"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "zezari:onboarding:hidden";

const slides = [
  {
    number: "01",
    title: "QR로 연결되는 안심 서비스",
    body: "QR을 통해 필요한 정보를 빠르게 확인하고 보호자와 연결합니다.",
    kind: "qr",
  },
  {
    number: "02",
    title: "실종 발생 시 빠른 대응",
    body: "상황 발생 후 연락과 확인 흐름을 단순하게 만들어 대응 시간을 줄입니다.",
    kind: "response",
  },
  {
    number: "03",
    title: "온라인 실종 공고",
    body: "필요한 정보를 온라인으로 공유하고 확인할 수 있도록 지원합니다.",
    kind: "notice",
  },
];

export default function OnboardingGate({ enabled, children }) {
  const [showOnboarding, setShowOnboarding] = useState(enabled);
  const [active, setActive] = useState(0);
  const [touchStart, setTouchStart] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setShowOnboarding(false);
      return;
    }

    const hidden = window.localStorage.getItem(STORAGE_KEY) === "true";
    setShowOnboarding(!hidden);
  }, [enabled]);

  if (!enabled || !showOnboarding) return children;

  const isLast = active === slides.length - 1;

  const goNext = () => {
    if (isLast) {
      setShowOnboarding(false);
      return;
    }
    setActive((current) => Math.min(current + 1, slides.length - 1));
  };

  const hideForever = () => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setShowOnboarding(false);
  };

  const goPrevious = () => {
    setActive((current) => Math.max(current - 1, 0));
  };

  const handleTouchEnd = (event) => {
    if (touchStart === null) return;
    const diff = touchStart - event.changedTouches[0].clientX;
    if (Math.abs(diff) < 40) return;
    if (diff > 0) setActive((current) => Math.min(current + 1, slides.length - 1));
    if (diff < 0) setActive((current) => Math.max(current - 1, 0));
    setTouchStart(null);
  };

  return (
    <main className="onboarding-page">
      <section className="onboarding-shell" aria-label="서비스 소개">
        <div className="onboarding-top">
          <div>
            <p className="intro-kicker">zezari</p>
            <h1 className="intro-label">서비스 소개</h1>
          </div>
          <button className="plain-button" type="button" onClick={hideForever}>
            다시보지 않기
          </button>
        </div>

        <div
          className="slide-window"
          onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
          onTouchEnd={handleTouchEnd}
        >
          <div className="slide-track" style={{ transform: `translateX(-${active * 100}%)` }}>
            {slides.map((slide) => (
              <article className="slide" key={slide.number}>
                <div className="service-slide-card">
                  <div className="slide-visual">
                    <SlideArt kind={slide.kind} />
                  </div>
                  <div className="slide-copy">
                    <span className="slide-number">{slide.number}</span>
                    <h2>{slide.title}</h2>
                    <p>{slide.body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="slide-dots" aria-label="서비스 소개 페이지">
          {slides.map((slide, index) => (
            <button
              className={index === active ? "dot active" : "dot"}
              type="button"
              key={slide.number}
              aria-label={`${index + 1}번 소개 보기`}
              onClick={() => setActive(index)}
            />
          ))}
        </div>

        <div className="onboarding-controls">
          <button
            className="ghost-button"
            type="button"
            onClick={goPrevious}
            disabled={active === 0}
          >
            이전
          </button>
          <button className="primary-button" type="button" onClick={goNext}>
            {isLast ? "로그인 시작" : "다음"}
          </button>
        </div>
      </section>
    </main>
  );
}

function SlideArt({ kind }) {
  if (kind === "response") {
    return (
      <svg viewBox="0 0 220 150" role="img" aria-label="빠른 대응">
        <rect x="54" y="72" width="112" height="38" rx="10" fill="#17202a" />
        <rect x="70" y="57" width="80" height="40" rx="8" fill="#2d4f6f" />
        <circle cx="82" cy="113" r="14" fill="#17202a" />
        <circle cx="146" cy="113" r="14" fill="#17202a" />
        <circle cx="82" cy="113" r="6" fill="#ffffff" />
        <circle cx="146" cy="113" r="6" fill="#ffffff" />
        <rect x="96" y="66" width="28" height="24" rx="4" fill="#ffffff" />
        <path d="M100 79h20M110 69v20" stroke="#176b5b" strokeWidth="4" strokeLinecap="round" />
        <path d="M140 55l12-14 14 14" fill="none" stroke="#6b4acb" strokeWidth="6" strokeLinecap="round" />
        <circle cx="166" cy="39" r="10" fill="#f7c948" />
      </svg>
    );
  }

  if (kind === "notice") {
    return (
      <svg viewBox="0 0 220 150" role="img" aria-label="온라인 공고">
        <rect x="58" y="28" width="60" height="94" rx="10" fill="#ffffff" stroke="#17202a" strokeWidth="5" />
        <rect x="72" y="42" width="32" height="32" rx="5" fill="#e7f1ee" />
        <path d="M78 58h20M88 48v20" stroke="#176b5b" strokeWidth="4" strokeLinecap="round" />
        <rect x="75" y="84" width="28" height="4" rx="2" fill="#6b4acb" />
        <rect x="72" y="94" width="34" height="4" rx="2" fill="#d8e0dc" />
        <circle cx="146" cy="78" r="24" fill="#e7f1ee" />
        <path d="M134 78l9 9 19-22" fill="none" stroke="#176b5b" strokeWidth="7" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 220 150" role="img" aria-label="QR 안심 서비스">
      <rect x="82" y="25" width="58" height="92" rx="10" fill="#ffffff" stroke="#17202a" strokeWidth="5" />
      <rect x="96" y="51" width="30" height="30" fill="#f6f8f7" stroke="#17202a" strokeWidth="3" />
      <path d="M101 56h8v8h-8zM115 56h6v6h-6zM101 70h6v6h-6zM114 68h8v8h-8z" fill="#17202a" />
      <circle cx="60" cy="79" r="17" fill="#6b4acb" />
      <rect x="45" y="95" width="32" height="34" rx="8" fill="#2d4f6f" />
      <circle cx="162" cy="79" r="17" fill="#f7c948" />
      <rect x="146" y="95" width="34" height="34" rx="8" fill="#f1f5f3" />
      <path d="M77 86c10 3 19 4 29 3M139 89c12 0 22-2 32-8" stroke="#176b5b" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
