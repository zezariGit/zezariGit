"use client";

import { useRef, useState } from "react";

export default function GuardianVoicePlayer({ src, name = "보호자 음성 메시지" }) {
  const audioRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const hasVoice = Boolean(src);

  if (!hasVoice) return null;

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!hasVoice || !audio) return;
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
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        aria-label={name}
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
        aria-label={status === "playing" ? "보호자 음성 일시정지" : "보호자 음성 듣기"}
      >
        <img className="guardian-voice-button-image" src="/assets/finder/guardian-voice-button.png" alt="" />
      </button>
      {status === "playing" && <em>보호자 음성을 재생하고 있습니다.</em>}
      {message && <p className="find-audio-error">{message}</p>}
    </div>
  );
}
