"use client";

import { useMemo, useState } from "react";
import FormSubmitButton from "../form-submit-button";
import { SERVICE_REGULATION_META, normalizeServiceRegulationDocument } from "../../lib/service-regulations";

const FONT_SIZES = [14, 16, 18, 20, 24];

export default function ServiceRegulationEditor({ regulation, saveAction }) {
  const normalized = useMemo(() => normalizeServiceRegulationDocument(regulation, regulation.id), [regulation]);
  const [blocks, setBlocks] = useState(normalized.blocks);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = blocks[selectedIndex] || blocks[0];

  function updateSelected(changes) {
    setBlocks((current) => current.map((block, index) => (index === selectedIndex ? { ...block, ...changes } : block)));
  }

  function updateText(index, text) {
    setSelectedIndex(index);
    setBlocks((current) => current.map((block, blockIndex) => (blockIndex === index ? { ...block, text } : block)));
  }

  function addBlock() {
    const nextIndex = selectedIndex + 1;
    setBlocks((current) => [
      ...current.slice(0, nextIndex),
      { text: "새 문단", bold: false, fontSize: 16 },
      ...current.slice(nextIndex),
    ]);
    setSelectedIndex(nextIndex);
  }

  function removeBlock() {
    if (blocks.length <= 1) return;
    setBlocks((current) => current.filter((_, index) => index !== selectedIndex));
    setSelectedIndex((current) => Math.max(0, current - 1));
  }

  return (
    <form action={saveAction} className="service-regulation-admin-form">
      <input type="hidden" name="regulationType" value={regulation.id} />
      <input type="hidden" name="contentJson" value={JSON.stringify({ blocks })} />
      <div className="service-regulation-toolbar" aria-label="문단 서식 도구">
        <span>선택한 문단 서식</span>
        <button
          className={selected?.bold ? "active" : ""}
          type="button"
          onClick={() => updateSelected({ bold: !selected?.bold })}
          aria-pressed={Boolean(selected?.bold)}
          title="굵게"
        >
          <strong>B</strong>
        </button>
        <label>
          <span className="visually-hidden">글씨 크기</span>
          <select value={selected?.fontSize || 16} onChange={(event) => updateSelected({ fontSize: Number(event.target.value) })}>
            {FONT_SIZES.map((size) => <option key={size} value={size}>{size}px</option>)}
          </select>
        </label>
        <button type="button" onClick={addBlock}>문단 추가</button>
        <button type="button" onClick={removeBlock} disabled={blocks.length <= 1}>문단 삭제</button>
      </div>
      <div className="service-regulation-editor" aria-label={`${SERVICE_REGULATION_META[regulation.id].tabLabel} 규정 편집기`}>
        {blocks.map((block, index) => (
          <textarea
            className={selectedIndex === index ? "selected" : ""}
            key={`${regulation.id}-${index}`}
            value={block.text}
            onFocus={() => setSelectedIndex(index)}
            onChange={(event) => updateText(index, event.target.value)}
            style={{ fontSize: `${block.fontSize}px`, fontWeight: block.bold ? 800 : 400 }}
            rows={Math.max(1, block.text.split("\n").length)}
            maxLength={4000}
            required
          />
        ))}
      </div>
      <div className="service-regulation-save-bar">
        <p>저장한 내용은 회원가입 약관 상세 팝업에 즉시 반영됩니다.</p>
        <FormSubmitButton className="primary-button" pendingText="저장중">저장</FormSubmitButton>
      </div>
    </form>
  );
}
