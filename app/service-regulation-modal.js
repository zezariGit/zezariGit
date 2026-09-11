"use client";

import { useEffect, useState } from "react";
import ServiceRegulationDocument from "./service-regulation-document";
import { DEFAULT_SERVICE_REGULATIONS } from "../lib/service-regulations";

export default function ServiceRegulationModal({ type, initialDocument, onClose }) {
  const [document, setDocument] = useState(initialDocument || DEFAULT_SERVICE_REGULATIONS[type]);

  useEffect(() => {
    let active = true;
    const previousOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";

    fetch(`/api/service-regulations/${type}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (active && data?.regulation) setDocument(data.regulation);
      })
      .catch(() => {});

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      active = false;
      window.document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, type]);

  return (
    <div className="service-regulation-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="service-regulation-modal" role="dialog" aria-modal="true" aria-labelledby="service-regulation-title">
        <header>
          <button type="button" onClick={onClose} aria-label="약관 닫기">
            <span aria-hidden="true">‹</span>
          </button>
          <h2 id="service-regulation-title">{document.title}</h2>
          <span aria-hidden="true" />
        </header>
        <div className="service-regulation-scroll">
          <ServiceRegulationDocument document={document} />
        </div>
      </section>
    </div>
  );
}
