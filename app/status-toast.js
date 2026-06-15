"use client";

import { useEffect, useState } from "react";

export default function StatusToast({ message = "", type = "success" }) {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    setVisible(Boolean(message));
    if (!message) return undefined;
    const timer = window.setTimeout(() => setVisible(false), 4200);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message || !visible) return null;

  return (
    <div className={`status-toast ${type === "error" ? "error" : "success"}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
