"use client";

import { saveSubjectAction } from "./actions";

const REQUIRED_FIELDS = [
  { label: "이름", name: "subjectName", selector: "input[name='subjectName']" },
  { label: "생년월일", name: "birthDate", selector: "select[name='birthYearPart']" },
  { label: "성별", name: "gender", selector: "input[name='gender']" },
  { label: "보호자 메시지", name: "guardianMessage", selector: "textarea[name='guardianMessage']" },
];

export default function SubjectRegistrationForm({ children, hasExistingPhoto = false }) {
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
    window.alert(`필수 항목을 입력해 주세요.\n누락 항목: ${missing.join(", ")}`);

    const firstMissing = missing[0];
    const selector = firstMissing === "사진"
      ? "input[name='photo']"
      : REQUIRED_FIELDS.find((field) => field.label === firstMissing)?.selector;
    form.querySelector(selector)?.focus();
  }

  return (
    <form
      action={saveSubjectAction}
      className="subject-registration-form"
      noValidate
      onSubmit={validateRequiredFields}
    >
      {children}
    </form>
  );
}
