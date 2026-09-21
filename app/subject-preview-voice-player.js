"use client";

import { useRef, useState } from "react";
import VoicePlaybackGraphic from "./voice-playback-graphic";

export default function SubjectPreviewVoicePlayer({ src, name }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
    }
  }

  return (
    <div className="subject-preview-voice-player">
      <button type="button" onClick={toggle} aria-label={playing ? "보호자 음성 일시정지" : "보호자 음성 재생"}>
        <VoicePlaybackGraphic playing={playing} />
      </button>
      <audio
        ref={audioRef}
        src={src}
        aria-label={name || "보호자 음성"}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => setPlaying(false)}
        preload="metadata"
      />
    </div>
  );
}
