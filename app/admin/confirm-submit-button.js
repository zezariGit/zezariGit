"use client";

import { useFormStatus } from "react-dom";

export default function ConfirmSubmitButton({
  children,
  confirmMessage,
  pendingText = "처리중",
  className = "danger-button compact",
}) {
  const { pending } = useFormStatus();

  function handleClick(event) {
    if (!window.confirm(confirmMessage)) event.preventDefault();
  }

  return (
    <button
      className={`${className} pending-button`}
      type="submit"
      disabled={pending}
      onClick={handleClick}
    >
      <span>{pending ? pendingText : children}</span>
      {pending && <span className="button-progress" aria-hidden="true" />}
    </button>
  );
}
