"use client";

import { useEffect, useRef, useState } from "react";

export default function SubjectPhotoInput({
  existingSrc = "",
  maxBytes,
  label = "대상자 사진",
  required = false,
  mode = "create",
}) {
  const limitBytes = Math.max(1, Number(maxBytes) || 1024 * 1024);
  const [previewSrc, setPreviewSrc] = useState(existingSrc);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSource, setActiveSource] = useState("");
  const [isIOS, setIsIOS] = useState(false);
  const objectUrlRef = useRef("");
  const cameraInputRef = useRef(null);
  const albumInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userAgent = window.navigator.userAgent || "";
    const isTouchIPad = window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
    setIsIOS(/iPad|iPhone|iPod/i.test(userAgent) || isTouchIPad);

    return () => revokeObjectUrl();
  }, []);

  function revokeObjectUrl() {
    if (!objectUrlRef.current) return;
    URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = "";
  }

  function applySelectedFile(file, source, input) {
    if (file.size > limitBytes) {
      window.alert(`${label}은(는) ${formatMegabytes(limitBytes)}MB 이하의 이미지 파일만 업로드할 수 있습니다.`);
      if (input) input.value = "";
      revokeObjectUrl();
      setPreviewSrc(existingSrc);
      return;
    }

    setActiveSource(source);
    revokeObjectUrl();
    objectUrlRef.current = URL.createObjectURL(file);
    setPreviewSrc(objectUrlRef.current);
  }

  function handleFileChange(event, source) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    applySelectedFile(file, source, input);
  }

  function openPicker(inputRef) {
    setPickerOpen(false);
    inputRef.current?.click();
  }

  async function openFileApp() {
    setPickerOpen(false);

    if (typeof window.showOpenFilePicker !== "function") {
      fileInputRef.current?.click();
      return;
    }

    try {
      const [handle] = await window.showOpenFilePicker({
        id: "subject-photo-file",
        multiple: false,
        startIn: "pictures",
        excludeAcceptAllOption: true,
        types: [
          {
            description: "이미지 파일",
            accept: {
              "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"],
            },
          },
        ],
      });
      const file = await handle.getFile();
      const input = fileInputRef.current;
      if (!input) return;
      const transfer = new DataTransfer();
      transfer.items.add(file);
      input.files = transfer.files;
      applySelectedFile(file, "file", input);
    } catch (error) {
      if (error?.name !== "AbortError") fileInputRef.current?.click();
    }
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
          <img
            className="subject-photo-placeholder-image"
            src="/assets/subject-registration/photo-placeholder.png"
            alt=""
            aria-hidden="true"
          />
        )}
        </span>
        {previewSrc && <span className="camera-chip" aria-hidden="true"><CameraIcon /></span>}
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
      {isIOS && (
        <input
          ref={albumInputRef}
          className="subject-photo-native-input"
          name={activeSource === "album" ? "photo" : undefined}
          type="file"
          accept="image/*"
          onChange={(event) => handleFileChange(event, "album")}
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
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
      {mode === "create" && (
        <span className="subject-photo-copy">
          <strong className="subject-photo-action">사진 등록</strong>
          <small className="subject-photo-limit">사진은 1장만 등록할 수 있으며,<br />최대 용량은 {formatMegabytes(limitBytes)}MB입니다.</small>
        </span>
      )}
      {mode === "edit" && (
        <small className="subject-photo-limit edit-photo-limit">사진은 최대 {formatMegabytes(limitBytes)}MB까지<br />등록할 수 있습니다.</small>
      )}
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
            {isIOS && (
              <button type="button" onClick={() => openPicker(albumInputRef)}>
                앨범 앱
              </button>
            )}
            <button type="button" onClick={openFileApp}>
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

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M8.5 6 10 4h4l1.5 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.5Z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </svg>
  );
}

function formatMegabytes(bytes) {
  const value = bytes / (1024 * 1024);
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}
