"use client";

import { useState } from "react";

export default function SubjectMessageField({ value = "" }) {
  const [message, setMessage] = useState(String(value || "").slice(0, 200));

  return (
    <label className="target-field target-message-field">
      <span>보호자가 전하고픈 말</span>
      <small>QR을 스캔한 발견자에게 보여지는 메시지입니다.</small>
      <textarea
        name="guardianMessage"
        value={message}
        onChange={(event) => setMessage(event.target.value.slice(0, 200))}
        placeholder="대상자를 발견한 분에게 전할 말을 입력해 주세요."
        rows={4}
        maxLength={200}
        required
      />
      <em className="subject-message-count">{message.length} / 200</em>
    </label>
  );
}
