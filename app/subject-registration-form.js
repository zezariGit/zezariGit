"use client";

import { useRef, useState } from "react";
import { saveSubjectAction } from "./actions";

const REQUIRED_FIELDS = [
  { label: "이름", name: "subjectName", selector: "input[name='subjectName']" },
  { label: "생년월일", name: "birthDate", selector: "select[name='birthYearPart']" },
  { label: "성별", name: "gender", selector: "input[name='gender']" },
  { label: "보호자 메시지", name: "guardianMessage", selector: "textarea[name='guardianMessage']" },
];

export default function SubjectRegistrationForm({ children, hasExistingPhoto = false }) {
  const formRef = useRef(null);
  const [missingFields, setMissingFields] = useState([]);

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
      ? "input[name='photo']"
      : REQUIRED_FIELDS.find((field) => field.label === firstMissing)?.selector;
    setMissingFields([]);
    window.setTimeout(() => formRef.current?.querySelector(selector)?.focus(), 0);
  }

  return (
    <form
      action={saveSubjectAction}
      className="subject-registration-form"
      noValidate
      onSubmit={validateRequiredFields}
      ref={formRef}
    >
      {children}
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
