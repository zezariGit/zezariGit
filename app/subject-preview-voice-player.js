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
        <img src="/assets/dashboard/subject-preview-voice.png" alt="" />
      </button>
      <audio ref={audioRef} src={src} aria-label={name || "보호자 음성"} onEnded={() => setPlaying(false)} preload="metadata" />
    </div>
  );
}
