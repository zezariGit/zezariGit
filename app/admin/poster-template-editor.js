"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_POSTER_LAYOUT,
  POSTER_FIELD_LABELS,
  normalizePosterLayout,
} from "../../lib/poster-template";

const FIELD_NAMES = ["photo", "qr", "name", "age", "gender", "memo"];
const TEXT_FIELDS = new Set(["name", "age", "gender", "memo"]);

export default function PosterTemplateEditor({ initialTemplate, initialHistory, previewMode }) {
  const [template, setTemplate] = useState(initialTemplate);
  const [history, setHistory] = useState(initialHistory || []);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewPending, setPreviewPending] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const previewUrlRef = useRef("");
  const endpointSuffix = previewMode ? "?preview=1" : "";
  const normalizedLayout = useMemo(() => normalizePosterLayout(template.layout), [template.layout]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setPreviewPending(true);
      setError("");
      try {
        const response = await fetch(`/api/admin/poster-template/preview${endpointSuffix}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...template, layout: normalizedLayout }),
          signal: controller.signal,
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "미리보기를 만들지 못했습니다.");
        }
        const nextUrl = URL.createObjectURL(await response.blob());
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = nextUrl;
        setPreviewUrl(nextUrl);
      } catch (requestError) {
        if (requestError.name !== "AbortError") setError(requestError.message);
      } finally {
        if (!controller.signal.aborted) setPreviewPending(false);
      }
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [endpointSuffix, normalizedLayout, template.backgroundImageUrl, template.id, template.name, template.version]);

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  function updateField(fieldName, property, value) {
    setMessage("");
    setTemplate((current) => ({
      ...current,
      layout: {
        ...current.layout,
        [fieldName]: {
          ...current.layout[fieldName],
          [property]: value,
        },
      },
    }));
  }

  async function uploadBackground(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("PNG, JPEG, WebP 이미지만 사용할 수 있습니다.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError("배경 원본 이미지는 12MB 이하여야 합니다.");
      return;
    }
    setPreviewPending(true);
    setMessage("");
    setError("");
    try {
      const optimized = await optimizePosterBackground(file, normalizedLayout.canvas);
      setTemplate((current) => ({ ...current, backgroundImageUrl: optimized }));
      setMessage("배경 이미지가 포스터 크기에 맞게 적용되었습니다. 저장 버튼을 눌러 확정해 주세요.");
    } catch (uploadError) {
      setError(uploadError.message || "배경 이미지를 읽지 못했습니다.");
      setPreviewPending(false);
    }
  }

  async function save() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/admin/poster-template${endpointSuffix}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...template, layout: normalizedLayout }),
      });
      const responseText = await response.text();
      const data = parseJsonResponse(responseText);
      if (!response.ok) {
        const fallback = response.status === 413
          ? "배경 이미지 용량이 너무 큽니다. 이미지를 다시 선택해 주세요."
          : "저장하지 못했습니다.";
        throw new Error(data.message || fallback);
      }
      setTemplate(data.template);
      setHistory(data.history || []);
      setMessage(`포스터 템플릿 v${data.template.version}이 저장되었습니다.`);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="poster-template-editor">
      <section className="poster-template-preview-panel" aria-label="포스터 실시간 미리보기">
        <div className="poster-template-preview-heading">
          <h2>실시간 미리보기</h2>
          <span>{normalizedLayout.canvas.width} × {normalizedLayout.canvas.height}px</span>
        </div>
        <div className="poster-template-preview-frame">
          {previewUrl ? <img src={previewUrl} alt="샘플 데이터로 생성한 실종자 광고 포스터" /> : null}
          {previewPending ? <div className="poster-template-preview-loading">포스터 생성 중</div> : null}
        </div>
        <p className="poster-template-policy">저장한 템플릿은 이후 처음 발행되는 광고부터 적용됩니다. 이미 발행된 광고 소재는 변경되지 않습니다.</p>
      </section>

      <section className="poster-template-controls" aria-label="포스터 템플릿 편집">
        <div className="poster-template-basic-fields">
          <label>
            <span>템플릿 이름</span>
            <input
              value={template.name}
              maxLength={100}
              onChange={(event) => setTemplate((current) => ({ ...current, name: event.target.value }))}
            />
          </label>
          <label className="poster-template-upload">
            <span>배경 이미지</span>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadBackground} />
            <b>이미지 선택</b>
          </label>
          <button
            type="button"
            className="poster-template-reset"
            onClick={() => setTemplate((current) => ({
              ...current,
              layout: normalizePosterLayout(DEFAULT_POSTER_LAYOUT),
              backgroundImageUrl: "/assets/missing-ad-template.png",
            }))}
          >기본값 복원</button>
        </div>

        <div className="poster-template-field-list">
          {FIELD_NAMES.map((fieldName) => {
            const field = normalizedLayout[fieldName];
            return (
              <fieldset key={fieldName}>
                <legend>{POSTER_FIELD_LABELS[fieldName]}</legend>
                <div className="poster-template-input-grid">
                  <NumberControl label="X" value={field.x} onChange={(value) => updateField(fieldName, "x", value)} />
                  <NumberControl label="Y" value={field.y} onChange={(value) => updateField(fieldName, "y", value)} />
                  <NumberControl label="너비" value={field.width} onChange={(value) => updateField(fieldName, "width", value)} />
                  <NumberControl label="높이" value={field.height} onChange={(value) => updateField(fieldName, "height", value)} />
                  {TEXT_FIELDS.has(fieldName) ? (
                    <>
                      <NumberControl label="글자" value={field.fontSize} onChange={(value) => updateField(fieldName, "fontSize", value)} />
                      <NumberControl label="최소" value={field.minFontSize} onChange={(value) => updateField(fieldName, "minFontSize", value)} />
                      <NumberControl label="굵기" value={field.fontWeight} step={100} onChange={(value) => updateField(fieldName, "fontWeight", value)} />
                      <NumberControl label="줄 수" value={field.maxLines} onChange={(value) => updateField(fieldName, "maxLines", value)} />
                      <label className="poster-template-color-control">
                        <span>색상</span>
                        <input type="color" value={field.color} onChange={(event) => updateField(fieldName, "color", event.target.value)} />
                      </label>
                      <label>
                        <span>정렬</span>
                        <select value={field.textAlign} onChange={(event) => updateField(fieldName, "textAlign", event.target.value)}>
                          <option value="left">왼쪽</option>
                          <option value="center">가운데</option>
                          <option value="right">오른쪽</option>
                        </select>
                      </label>
                    </>
                  ) : (
                    <label>
                      <span>맞춤</span>
                      <select value={field.objectFit} onChange={(event) => updateField(fieldName, "objectFit", event.target.value)}>
                        <option value="cover">채우기</option>
                        <option value="contain">전체 보기</option>
                      </select>
                    </label>
                  )}
                </div>
              </fieldset>
            );
          })}
        </div>

        {error ? <p className="poster-template-feedback error" role="alert">{error}</p> : null}
        {message ? <p className="poster-template-feedback success" role="status">{message}</p> : null}
        <button type="button" className="poster-template-save" disabled={saving} onClick={save}>
          {saving ? "저장 중" : "활성 템플릿 저장"}
        </button>

        <details className="poster-template-history">
          <summary>버전 이력 {history.length}개</summary>
          {history.length ? history.map((item) => (
            <p key={item.id}>v{item.version} · {item.name} · {String(item.createdAt || "").slice(0, 16).replace("T", " ")}</p>
          )) : <p>아직 저장된 이전 버전이 없습니다.</p>}
        </details>
      </section>
    </div>
  );
}

function NumberControl({ label, value, step = 1, onChange }) {
  return (
    <label>
      <span>{label}</span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

async function optimizePosterBackground(file, canvasSize) {
  const source = await loadLocalImage(file);
  const width = Math.max(600, Math.min(1600, Math.round(Number(canvasSize?.width || 1080))));
  const height = Math.max(315, Math.min(2000, Math.round(Number(canvasSize?.height || 1350))));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    source.cleanup();
    throw new Error("배경 이미지 처리 기능을 사용할 수 없습니다.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  const scale = Math.min(width / source.width, height / source.height);
  const drawWidth = source.width * scale;
  const drawHeight = source.height * scale;
  context.drawImage(source.image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  source.cleanup();

  let quality = 0.94;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (estimateDataUrlBytes(dataUrl) > 1.5 * 1024 * 1024 && quality > 0.62) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  if (estimateDataUrlBytes(dataUrl) > 1.5 * 1024 * 1024) {
    throw new Error("배경 이미지를 저장 가능한 크기로 줄이지 못했습니다. 다른 이미지를 선택해 주세요.");
  }
  return dataUrl;
}

function loadLocalImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({
      image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      cleanup: () => URL.revokeObjectURL(objectUrl),
    });
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("배경 이미지 파일을 읽지 못했습니다."));
    };
    image.src = objectUrl;
  });
}

function estimateDataUrlBytes(dataUrl) {
  const encoded = String(dataUrl || "").split(",")[1] || "";
  return Math.ceil(encoded.length * 0.75);
}

function parseJsonResponse(value) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}
