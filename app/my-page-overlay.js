"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ModalScrollLock from "./modal-scroll-lock";

const OPEN_EVENT = "zezari:open-my-page";

export function OpenMyPageButton({ className = "", title = "설정", children }) {
  return (
    <button
      className={className || undefined}
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      aria-label={title}
      title={title}
      data-tooltip={title}
    >
      {children}
    </button>
  );
}

export default function MyPageOverlay({ initialOpen = false, closeHref = "/?tab=dashboard", children }) {
  const [open, setOpen] = useState(initialOpen);
  const router = useRouter();

  const openModal = useCallback(() => {
    setOpen(true);
    const url = new URL(window.location.href);
    if (url.searchParams.get("panel") !== "my") {
      url.searchParams.set("panel", "my");
      window.history.pushState({ zezariMyPage: true }, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.get("panel") === "my") {
      window.history.replaceState({}, "", closeHref);
    }
  }, [closeHref]);

  useEffect(() => {
    window.addEventListener(OPEN_EVENT, openModal);
    const handlePopState = () => {
      setOpen(new URL(window.location.href).searchParams.get("panel") === "my");
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener(OPEN_EVENT, openModal);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [openModal]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeModal, open]);

  if (!open) return null;

  return (
    <section
      className="modal-backdrop my-page-backdrop"
      aria-label="설정"
      role="dialog"
      aria-modal="true"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
      onClick={(event) => {
        if (event.target.closest?.("[data-my-page-close]")) closeModal();
        const navigationLink = event.target.closest?.("[data-my-page-navigate]");
        if (navigationLink) {
          event.preventDefault();
          setOpen(false);
          router.push(navigationLink.getAttribute("href") || closeHref);
        }
      }}
    >
      <ModalScrollLock />
      {children}
    </section>
  );
}
