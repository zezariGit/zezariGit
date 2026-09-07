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
    <div className="subject-preview-voice-player">
      <button type="button" onClick={toggle} aria-label={playing ? "보호자 음성 일시정지" : "보호자 음성 재생"}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {playing ? <><path d="M8 7v10" /><path d="M16 7v10" /></> : <path d="m9 7 8 5-8 5Z" />}
        </svg>
      </button>
      <span className="subject-preview-wave" aria-hidden="true">
        {Array.from({ length: 20 }, (_, index) => <i key={index} style={{ height: `${8 + ((index * 9) % 22)}px` }} />)}
      </span>
      <span>
        <strong>보호자 음성 듣기</strong>
        <small>대상자를 안심시켜 주세요</small>
      </span>
      <audio ref={audioRef} src={src} aria-label={name || "보호자 음성"} onEnded={() => setPlaying(false)} preload="metadata" />
    </div>
  );
}
