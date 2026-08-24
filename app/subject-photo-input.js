"use client";

import { useEffect, useRef, useState } from "react";

export default function SubjectPhotoInput({
  existingSrc = "",
  maxBytes,
  label = "관리대상 사진",
  required = false,
}) {
  const limitBytes = Math.max(1, Number(maxBytes) || 1024 * 1024);
  const [previewSrc, setPreviewSrc] = useState(existingSrc);
  const objectUrlRef = useRef("");

  useEffect(() => () => revokeObjectUrl(), []);

  function revokeObjectUrl() {
    if (!objectUrlRef.current) return;
    URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = "";
  }

  function handleFileChange(event) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) {
      revokeObjectUrl();
      setPreviewSrc(existingSrc);
      return;
    }

    if (file.size > limitBytes) {
      window.alert(`${label}은(는) ${formatMegabytes(limitBytes)}MB 이하의 이미지 파일만 업로드할 수 있습니다.`);
      input.value = "";
      revokeObjectUrl();
      setPreviewSrc(existingSrc);
      return;
    }

    revokeObjectUrl();
    objectUrlRef.current = URL.createObjectURL(file);
    setPreviewSrc(objectUrlRef.current);
  }

  return (
    <label className={`subject-avatar-picker${previewSrc ? " has-preview" : ""}`}>
      <span className="subject-avatar-preview">
        {previewSrc ? (
          <img src={previewSrc} alt={`${label} 미리보기`} />
        ) : (
          <span aria-hidden="true" />
        )}
      </span>
      <span className="camera-chip" aria-hidden="true">사진</span>
      <input
        name="photo"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        required={required}
        aria-label={previewSrc ? `${label} 변경하기` : `${label} 등록하기`}
      />
      <strong className="subject-photo-action">{previewSrc ? "변경하기" : "사진 등록하기"}</strong>
      <small className="subject-photo-limit">{formatMegabytes(limitBytes)}MB 이하</small>
    </label>
  );
}

function formatMegabytes(bytes) {
  const value = bytes / (1024 * 1024);
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}
