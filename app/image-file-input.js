"use client";

export default function ImageFileInput({ name, maxBytes, label, className = "", required = false }) {
  const limitBytes = Math.max(1, Number(maxBytes) || 0);
  const limitMb = formatMegabytes(limitBytes);

  function validateFile(event) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file || file.size <= limitBytes) return;

    window.alert(`${label}은(는) ${limitMb}MB 이하의 이미지 파일만 업로드할 수 있습니다.`);
    input.value = "";
  }

  return (
    <input
      className={className || undefined}
      name={name}
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      onChange={validateFile}
      required={required}
    />
  );
}

function formatMegabytes(bytes) {
  const value = bytes / (1024 * 1024);
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}
