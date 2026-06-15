"use client";

import { useFormStatus } from "react-dom";

export default function FormSubmitButton({
  children,
  pendingText = "처리중",
  className = "primary-button compact",
  type = "submit",
  disabled = false,
}) {
  const { pending } = useFormStatus();

  return (
    <button className={`${className} pending-button`} type={type} disabled={disabled || pending}>
      <span>{pending ? pendingText : children}</span>
      {pending && <span className="button-progress" aria-hidden="true" />}
    </button>
  );
}
