"use client";

import { useEffect } from "react";

let lockCount = 0;
let previousState = null;

export default function ModalScrollLock() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;

    if (lockCount === 0) {
      previousState = {
        scrollY,
        htmlOverflow: html.style.overflow,
        htmlTouchAction: html.style.touchAction,
        bodyOverflow: body.style.overflow,
        bodyPosition: body.style.position,
        bodyTop: body.style.top,
        bodyLeft: body.style.left,
        bodyRight: body.style.right,
        bodyWidth: body.style.width,
        bodyTouchAction: body.style.touchAction,
      };

      html.classList.add("modal-open");
      body.classList.add("modal-open");
      html.style.overflow = "hidden";
      html.style.touchAction = "none";
      body.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.touchAction = "none";
    }

    lockCount += 1;

    const preventBackgroundTouchMove = (event) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest("[data-modal-surface]")) {
        event.preventDefault();
      }
    };

    document.addEventListener("touchmove", preventBackgroundTouchMove, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventBackgroundTouchMove);
      lockCount = Math.max(0, lockCount - 1);

      if (lockCount > 0 || !previousState) return;

      html.classList.remove("modal-open");
      body.classList.remove("modal-open");
      html.style.overflow = previousState.htmlOverflow;
      html.style.touchAction = previousState.htmlTouchAction;
      body.style.overflow = previousState.bodyOverflow;
      body.style.position = previousState.bodyPosition;
      body.style.top = previousState.bodyTop;
      body.style.left = previousState.bodyLeft;
      body.style.right = previousState.bodyRight;
      body.style.width = previousState.bodyWidth;
      body.style.touchAction = previousState.bodyTouchAction;
      window.scrollTo(0, previousState.scrollY);
      previousState = null;
    };
  }, []);

  return null;
}
