"use client";

import { useRef, useState } from "react";

export default function GuardianVoicePlayer({ src, name = "보호자 음성 메시지" }) {
  const audioRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setMessage("");

    try {
      if (status === "playing") {
        audio.pause();
        setStatus("paused");
        return;
      }
      if (audio.ended) audio.currentTime = 0;
      await audio.play();
      setStatus("playing");
    } catch {
      setStatus("error");
      setMessage("보호자 음성을 재생하지 못했습니다. 휴대폰의 미디어 음량을 확인해 주세요.");
    }
  };

  return (
    <div className="find-audio-box">
      <span>{name}</span>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setStatus("playing")}
        onPause={() => setStatus((current) => (current === "playing" ? "paused" : current))}
        onEnded={() => setStatus("ended")}
        onError={() => {
          setStatus("error");
          setMessage("저장된 보호자 음성을 불러오지 못했습니다.");
        }}
      />
      <button
        className={`guardian-voice-play-button${status === "playing" ? " playing" : ""}`}
        type="button"
        onClick={togglePlayback}
        aria-pressed={status === "playing"}
      >
        <span className="guardian-voice-button-icon" aria-hidden="true">
          {status === "playing" ? "Ⅱ" : "▶"}
        </span>
        <span>
          {status === "playing"
            ? "보호자 음성 일시정지"
            : "보호자 음성 재생(심신안정용)"}
        </span>
      </button>
      {status === "playing" && <em>보호자 음성을 재생하고 있습니다.</em>}
      {message && <p className="find-audio-error">{message}</p>}
    </div>
  );
}
