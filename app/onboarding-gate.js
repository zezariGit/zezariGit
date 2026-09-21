"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const STORAGE_KEY = "zezari:onboarding:hidden";
const SWIPE_THRESHOLD = 44;

const slides = [
  {
    number: "01",
    image: "/images/onboarding/1.png",
    imageAlt: "휴대전화로 QR 코드를 스캔하고 확인하는 모습",
    crop: { x: 27, y: 130, width: 336, height: 365 },
    title: (
      <>
        QR로 연결되는 <em>안심 서비스</em>
      </>
    ),
    body: (
      <>
        QR을 통해 필요한 정보를 빠르게 확인하고<br />
        보호자와 안전하게 연결합니다.
      </>
    ),
  },
  {
    number: "02",
    image: "/images/onboarding/2.png",
    imageAlt: "QR 확인 후 보호자 연락, 위치 공유, 보호자 음성을 이용하는 모습",
    crop: { x: 20, y: 130, width: 350, height: 385 },
    title: (
      <>
        발견 즉시 <em>연결되는</em> 도움
      </>
    ),
    body: (
      <>
        발견자가 QR을 스캔하면 보호자 연락,<br />
        위치 공유, 보호자 음성 재생까지<br />
        바로 연결됩니다.
      </>
    ),
  },
  {
    number: "03",
    image: "/images/onboarding/3.png",
    imageAlt: "실종 정보를 온라인 광고로 공유하는 모습",
    crop: { x: 20, y: 115, width: 350, height: 386 },
    title: <>온라인 실종 광고</>,
    body: (
      <>
        필요한 정보를 온라인으로 공유하고<br />
        더 많은 사람이 확인할 수 있도록 지원합니다.<br />
        (인스타그램, 페이스북)
      </>
    ),
  },
];

export default function OnboardingGate({ enabled, forceVisible = false, children }) {
  const [showOnboarding, setShowOnboarding] = useState(enabled);
  const [active, setActive] = useState(0);
  const dragStart = useRef(null);
  const swipeHandled = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setShowOnboarding(false);
      return;
    }

    if (forceVisible) {
      setShowOnboarding(true);
      return;
    }

    const hidden = window.localStorage.getItem(STORAGE_KEY) === "true";
    setShowOnboarding(!hidden);
  }, [enabled, forceVisible]);

  if (!enabled || !showOnboarding) return children;

  const hideForever = () => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setShowOnboarding(false);
  };

  const startSwipe = (event) => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    dragStart.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId, captured: false };
    swipeHandled.current = false;
  };

  const trackSwipe = (event) => {
    const drag = dragStart.current;
    if (!drag || drag.pointerId !== event.pointerId || drag.captured) return;
    const horizontalDistance = Math.abs(drag.x - event.clientX);
    const verticalDistance = Math.abs(drag.y - event.clientY);
    if (horizontalDistance < 8 || horizontalDistance <= verticalDistance) return;
    drag.captured = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const finishSwipe = (event) => {
    if (dragStart.current === null) return;
    const { x, y, pointerId } = dragStart.current;
    if (pointerId !== event.pointerId) return;
    const difference = x - event.clientX;
    const verticalDifference = y - event.clientY;
    dragStart.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (Math.abs(difference) < SWIPE_THRESHOLD || Math.abs(difference) <= Math.abs(verticalDifference)) return;

    swipeHandled.current = true;
    setActive((current) => (
      difference > 0
        ? Math.min(current + 1, slides.length - 1)
        : Math.max(current - 1, 0)
    ));
    window.setTimeout(() => { swipeHandled.current = false; }, 0);
  };

  const cancelSwipe = (event) => {
    dragStart.current = null;
    swipeHandled.current = false;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const preventClickAfterSwipe = (event, action) => {
    if (swipeHandled.current) {
      event.preventDefault();
      return;
    }
    action?.();
  };

  return (
    <main className="onboarding-page">
      <section
        className="onboarding-shell"
        aria-label="서비스 소개"
        data-active-slide={active + 1}
        onPointerDown={startSwipe}
        onPointerMove={trackSwipe}
        onPointerUp={finishSwipe}
        onPointerCancel={cancelSwipe}
      >
        <header className="onboarding-brand-row">
          <Image
            className="onboarding-wordmark"
            src="/icons/zezari-wordmark-v1-512.png"
            alt="제자리"
            width={512}
            height={512}
            draggable="false"
            priority
          />
          {active === slides.length - 1 && (
            <button className="onboarding-skip-button" type="button" onClick={(event) => preventClickAfterSwipe(event, hideForever)}>
              다시 보지 않기
            </button>
          )}
        </header>

        <div
          className="slide-window"
          tabIndex={0}
          aria-label={`${active + 1}번째 서비스 소개. 좌우로 밀어 이동할 수 있습니다.`}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") setActive((current) => Math.max(current - 1, 0));
            if (event.key === "ArrowRight") setActive((current) => Math.min(current + 1, slides.length - 1));
          }}
        >
          <div className="slide-track" style={{ transform: `translateX(-${active * 100}%)` }}>
            {slides.map((slide, index) => (
              <article className="slide" key={slide.number} aria-hidden={index !== active}>
                <div className="service-slide-card">
                  <SlideVisual slide={slide} />
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
              key={slide.number}
              type="button"
              aria-label={`${index + 1}번 소개 보기`}
              aria-current={index === active ? "step" : undefined}
              onClick={(event) => preventClickAfterSwipe(event, () => setActive(index))}
            />
          ))}
        </div>

        {active === slides.length - 1 && (
          <div className="onboarding-controls">
            <Link
              className="onboarding-start-button"
              href="/?login=1&signup=1"
              onClick={(event) => preventClickAfterSwipe(event)}
            >
              시작하기
            </Link>
            <p className="onboarding-login-prompt">
              이미 계정이 있나요?{" "}
              <Link href="/?login=1" onClick={(event) => preventClickAfterSwipe(event)}>로그인</Link>
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function SlideVisual({ slide }) {
  const cropStyle = {
    "--crop-ratio": `${slide.crop.width} / ${slide.crop.height}`,
    "--crop-image-width": `${(390 / slide.crop.width) * 100}%`,
    "--crop-left": `${(-slide.crop.x / slide.crop.width) * 100}%`,
    "--crop-top": `${(-slide.crop.y / slide.crop.height) * 100}%`,
  };

  return (
    <div className="onboarding-visual-crop" style={cropStyle}>
      <Image
        src={slide.image}
        alt={slide.imageAlt}
        width={390}
        height={844}
        draggable="false"
        priority
      />
    </div>
  );
}
