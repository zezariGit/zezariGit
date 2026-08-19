"use client";

import { useEffect, useRef, useState } from "react";

export default function ManagedSubjectCarousel({ children, pageCount }) {
  const carouselRef = useRef(null);
  const frameRef = useRef(null);
  const [activePage, setActivePage] = useState(0);
  const totalPages = Math.max(1, Number(pageCount) || 1);

  useEffect(() => {
    setActivePage((current) => Math.min(current, totalPages - 1));
  }, [totalPages]);

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  }, []);

  const updateActivePage = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const carousel = carouselRef.current;
      if (!carousel || carousel.clientWidth <= 0) return;
      const nextPage = Math.max(
        0,
        Math.min(totalPages - 1, Math.round(carousel.scrollLeft / carousel.clientWidth))
      );
      setActivePage(nextPage);
    });
  };

  const moveToPage = (pageIndex) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollTo({
      left: carousel.clientWidth * pageIndex,
      behavior: "smooth",
    });
    setActivePage(pageIndex);
  };

  return (
    <div className="managed-carousel-shell">
      <div
        className="managed-carousel"
        aria-label="관리대상 목록, 한 화면에 3명씩 표시"
        onScroll={updateActivePage}
        ref={carouselRef}
      >
        {children}
      </div>
      <div className="managed-page-dots" aria-label={`관리대상 목록 ${totalPages}페이지`}>
        {Array.from({ length: totalPages }, (_, pageIndex) => (
          <button
            className={pageIndex === activePage ? "active" : ""}
            type="button"
            aria-label={`${pageIndex + 1}페이지로 이동`}
            aria-current={pageIndex === activePage ? "page" : undefined}
            onClick={() => moveToPage(pageIndex)}
            key={`managed-page-dot-${pageIndex}`}
          />
        ))}
      </div>
    </div>
  );
}
