export default function VoicePlaybackGraphic({ playing = false }) {
  return (
    <span className="voice-playback-graphic" aria-hidden="true">
      <span className="voice-playback-state-icon">
        {playing ? (
          <svg viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="29" />
            <path d="M25 21v22M39 21v22" />
          </svg>
        ) : (
          <img src="/assets/finder/voice-play.png" alt="" />
        )}
      </span>
      <img className="voice-playback-waveform" src="/assets/finder/voice-waveform.png" alt="" />
      <span className="voice-playback-copy">
        <strong>보호자 음성 듣기</strong>
        <small>대상자를 안심시켜 주세요</small>
      </span>
    </span>
  );
}
