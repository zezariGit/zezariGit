"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveSubjectAction } from "./actions";
import FormSubmitButton from "./form-submit-button";

const REQUIRED_FIELDS = [
  { label: "이름", name: "subjectName", selector: "input[name='subjectName']" },
  { label: "생년월일", name: "birthDate", selector: "select[name='birthYearPart']" },
  { label: "성별", name: "gender", selector: "input[name='gender']" },
  { label: "보호자 메시지", name: "guardianMessage", selector: "textarea[name='guardianMessage']" },
];

export default function SubjectRegistrationForm({
  children,
  hasExistingPhoto = false,
  editing = false,
}) {
  const formRef = useRef(null);
  const [missingFields, setMissingFields] = useState([]);
  const [formReady, setFormReady] = useState(false);
  const [recording, setRecording] = useState(false);

  const updateFormState = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    const formData = new FormData(form);
    const photo = formData.get("photo");
    const hasNewPhoto = photo instanceof File && photo.size > 0;
    const hasPhotoPreview = Boolean(form.querySelector(".subject-avatar-picker.has-preview"));
    const hasBirthDate = ["birthYearPart", "birthMonthPart", "birthDayPart"]
      .every((name) => String(formData.get(name) || "").trim());
    const message = String(formData.get("guardianMessage") || "").trim();
    const isRecording = String(formData.get("voiceRecording") || "") === "1";

    setRecording(isRecording);
    setFormReady(Boolean(
      (hasExistingPhoto || hasNewPhoto || hasPhotoPreview)
      && String(formData.get("subjectName") || "").trim()
      && hasBirthDate
      && String(formData.get("gender") || "").trim()
      && message
      && message.length <= 200
      && !isRecording
    ));
  }, [hasExistingPhoto]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return undefined;
    const handleRecordingChange = () => window.setTimeout(updateFormState, 0);
    form.addEventListener("subjectrecordingchange", handleRecordingChange);
    window.setTimeout(updateFormState, 0);
    return () => form.removeEventListener("subjectrecordingchange", handleRecordingChange);
  }, [updateFormState]);

  function validateRequiredFields(event) {
    const form = event.currentTarget;
    const formData = new FormData(form);
    const photo = formData.get("photo");
    const hasNewPhoto = photo instanceof File && photo.size > 0;
    const missing = [];

    if (!hasExistingPhoto && !hasNewPhoto) missing.push("사진");
    for (const field of REQUIRED_FIELDS) {
      if (!String(formData.get(field.name) || "").trim()) missing.push(field.label);
    }

    if (missing.length === 0) return;

    event.preventDefault();
    setMissingFields(missing);
  }

  function closeValidationDialog() {
    const firstMissing = missingFields[0];
    const selector = firstMissing === "사진"
      ? ".subject-photo-trigger"
      : REQUIRED_FIELDS.find((field) => field.label === firstMissing)?.selector;
    setMissingFields([]);
    window.setTimeout(() => formRef.current?.querySelector(selector)?.focus(), 0);
  }

  return (
    <form
      action={saveSubjectAction}
      className={`subject-registration-form ${editing ? "is-editing" : "is-registering"}`}
      noValidate
      onSubmit={validateRequiredFields}
      onInput={() => window.setTimeout(updateFormState, 0)}
      onChange={() => window.setTimeout(updateFormState, 0)}
      ref={formRef}
    >
      {children}
      <FormSubmitButton
        className="login-submit target-submit-button"
        pendingText={editing ? "수정 중" : "등록 중"}
        disabled={!formReady || recording}
      >
        {editing ? "수정 완료" : "등록하기"}
      </FormSubmitButton>
      {missingFields.length > 0 && (
        <div className="subject-validation-backdrop" role="presentation">
          <section
            className="subject-validation-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="subject-validation-title"
          >
            <h2 id="subject-validation-title">필수 항목을 확인해 주세요</h2>
            <p>다음 항목이 입력되지 않았습니다.</p>
            <strong>{missingFields.join(", ")}</strong>
            <button type="button" className="login-submit" onClick={closeValidationDialog} autoFocus>
              확인
            </button>
          </section>
        </div>
      )}
    </form>
  );
}
