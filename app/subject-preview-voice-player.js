"use client";

import { useRef, useState } from "react";

export default function SubjectPreviewVoicePlayer({ src, name }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  return (
    <div className={`subject-preview-action-map${src ? " has-voice" : ""}`}>
      <img
        src="/assets/dashboard/subject-preview-actions.png"
        alt="보호자에게 전화하기, 위치 공유, 112 신고, 보호자 음성 듣기"
      />
      <button className="subject-preview-action-hotspot call" type="button" disabled aria-label="보호자에게 전화하기, 미리보기에서는 사용할 수 없습니다" />
      <button className="subject-preview-action-hotspot location" type="button" disabled aria-label="위치 공유, 미리보기에서는 사용할 수 없습니다" />
      <button className="subject-preview-action-hotspot emergency" type="button" disabled aria-label="112 신고, 미리보기에서는 사용할 수 없습니다" />
      <button
        className="subject-preview-action-hotspot voice"
        type="button"
        onClick={toggle}
        disabled={!src}
        aria-label={src ? (playing ? "보호자 음성 일시정지" : "보호자 음성 재생") : "등록된 보호자 음성이 없습니다"}
      >
        <span className="visually-hidden">{playing ? "재생 중" : "재생"}</span>
      </button>
      <audio ref={audioRef} src={src} aria-label={name || "보호자 음성"} onEnded={() => setPlaying(false)} preload="metadata" />
    </div>
  );
}
