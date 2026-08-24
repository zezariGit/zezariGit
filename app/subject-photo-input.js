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
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSource, setActiveSource] = useState("");
  const objectUrlRef = useRef("");
  const cameraInputRef = useRef(null);
  const albumInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => () => revokeObjectUrl(), []);

  function revokeObjectUrl() {
    if (!objectUrlRef.current) return;
    URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = "";
  }

  function handleFileChange(event, source) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > limitBytes) {
      window.alert(`${label}은(는) ${formatMegabytes(limitBytes)}MB 이하의 이미지 파일만 업로드할 수 있습니다.`);
      input.value = "";
      revokeObjectUrl();
      setPreviewSrc(existingSrc);
      return;
    }

    setActiveSource(source);
    revokeObjectUrl();
    objectUrlRef.current = URL.createObjectURL(file);
    setPreviewSrc(objectUrlRef.current);
  }

  function openPicker(inputRef) {
    setPickerOpen(false);
    inputRef.current?.click();
  }

  return (
    <div className={`subject-avatar-picker${previewSrc ? " has-preview" : ""}`}>
      <button
        type="button"
        className="subject-photo-trigger"
        onClick={() => setPickerOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={pickerOpen}
        aria-required={required}
        aria-label={previewSrc ? `${label} 변경하기` : `${label} 등록하기`}
      >
        <span className="subject-avatar-preview">
        {previewSrc ? (
          <img src={previewSrc} alt={`${label} 미리보기`} />
        ) : (
          <span aria-hidden="true" />
        )}
        </span>
        <span className="camera-chip" aria-hidden="true">사진</span>
      </button>
      <input
        ref={cameraInputRef}
        className="subject-photo-native-input"
        name={activeSource === "camera" ? "photo" : undefined}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(event) => handleFileChange(event, "camera")}
        aria-hidden="true"
        tabIndex={-1}
      />
      <input
        ref={albumInputRef}
        className="subject-photo-native-input"
        name={activeSource === "album" ? "photo" : undefined}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(event) => handleFileChange(event, "album")}
        aria-hidden="true"
        tabIndex={-1}
      />
      <input
        ref={fileInputRef}
        className="subject-photo-native-input"
        name={activeSource === "file" ? "photo" : undefined}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif"
        onChange={(event) => handleFileChange(event, "file")}
        aria-hidden="true"
        tabIndex={-1}
      />
      <strong className="subject-photo-action">{previewSrc ? "변경하기" : "사진 등록하기"}</strong>
      <small className="subject-photo-limit">{formatMegabytes(limitBytes)}MB 이하</small>
      {pickerOpen && (
        <div
          className="subject-photo-picker-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPickerOpen(false);
          }}
        >
          <section
            className="subject-photo-picker-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subject-photo-picker-title"
          >
            <h2 id="subject-photo-picker-title">사진 업로드 방법</h2>
            <button type="button" onClick={() => openPicker(cameraInputRef)}>
              사진 촬영 앱
            </button>
            <button type="button" onClick={() => openPicker(albumInputRef)}>
              앨범 앱
            </button>
            <button type="button" onClick={() => openPicker(fileInputRef)}>
              파일 앱
            </button>
            <button type="button" className="subject-photo-picker-cancel" onClick={() => setPickerOpen(false)}>
              취소
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

function formatMegabytes(bytes) {
  const value = bytes / (1024 * 1024);
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}
