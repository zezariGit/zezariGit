"use client";

import { useEffect, useRef, useState } from "react";

const MAX_RECORDING_SECONDS = 30;

export default function SubjectVoiceRecorder({ existingVoice = "", existingName = "" }) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(existingVoice ? 18 : 0);
  const [voiceDataUrl, setVoiceDataUrl] = useState("");
  const [voiceName, setVoiceName] = useState("");
  const [removedExisting, setRemovedExisting] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("");
  const wrapperRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const autoStopRef = useRef(null);
  const elapsedRef = useRef(0);
  const audioRef = useRef(null);

  const playableVoice = voiceDataUrl || (!removedExisting ? existingVoice : "");

  useEffect(() => {
    const form = wrapperRef.current?.closest("form");
    form?.dispatchEvent(new CustomEvent("subjectrecordingchange", { bubbles: true }));
  }, [recording, playableVoice]);

  useEffect(() => () => {
    window.clearInterval(timerRef.current);
    window.clearTimeout(autoStopRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  function finishRecording() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    window.clearInterval(timerRef.current);
    window.clearTimeout(autoStopRef.current);
    timerRef.current = null;
    autoStopRef.current = null;
    setRecording(false);
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setMessage("이 브라우저에서는 음성 녹음을 지원하지 않습니다.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      setElapsed(0);
      elapsedRef.current = 0;
      setPlaying(false);
      setMessage("");
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const recordedSeconds = Math.max(1, elapsedRef.current);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          setVoiceDataUrl(String(reader.result || ""));
          setVoiceName(`guardian-voice-${Date.now()}.webm`);
          setRemovedExisting(false);
          setDuration(recordedSeconds);
        };
        reader.readAsDataURL(blob);
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };
      recorder.start();
      setRecording(true);
      timerRef.current = window.setInterval(() => {
        setElapsed((current) => {
          const next = current + 1;
          elapsedRef.current = Math.min(next, MAX_RECORDING_SECONDS);
          if (next >= MAX_RECORDING_SECONDS) window.setTimeout(finishRecording, 0);
          return Math.min(next, MAX_RECORDING_SECONDS);
        });
      }, 1000);
      autoStopRef.current = window.setTimeout(finishRecording, MAX_RECORDING_SECONDS * 1000);
    } catch {
      setMessage("마이크 권한을 허용해야 녹음할 수 있습니다.");
    }
  }

  function clearRecording() {
    audioRef.current?.pause();
    setPlaying(false);
    setVoiceDataUrl("");
    setVoiceName("");
    setDuration(0);
    setRemovedExisting(Boolean(existingVoice));
  }

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setMessage("음성을 재생하지 못했습니다.");
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  return (
    <div className={`voice-recorder${recording ? " is-recording" : ""}${playableVoice ? " has-recording" : ""}`} ref={wrapperRef}>
      <input type="hidden" name="voiceDataUrl" value={voiceDataUrl} />
      <input type="hidden" name="voiceName" value={voiceName} />
      <input type="hidden" name="existingVoiceDataUrl" value={existingVoice || ""} />
      <input type="hidden" name="existingVoiceName" value={existingName || ""} />
      <input type="hidden" name="removeVoice" value={removedExisting ? "1" : "0"} />
      <input type="hidden" name="voiceRecording" value={recording ? "1" : "0"} />

      {!recording && !playableVoice && (
        <button className="voice-start-button" type="button" onClick={startRecording}>
          <MicrophoneIcon />
          <span>녹음 시작</span>
        </button>
      )}

      {recording && (
        <div className="voice-recording-panel" role="status" aria-live="polite">
          <div className="voice-recording-meta">
            <strong><i aria-hidden="true" /> 녹음 중</strong>
            <time>{formatTime(elapsed)} / 00:30</time>
          </div>
          <VoiceWave active />
          <button className="voice-stop-button" type="button" onClick={finishRecording}>
            <span aria-hidden="true" /> 녹음 중지
          </button>
        </div>
      )}

      {!recording && playableVoice && (
        <div className="voice-recorded-panel">
          <button className={`voice-play-button${playing ? " is-playing" : ""}`} type="button" onClick={togglePlayback} aria-label={playing ? "음성 일시정지" : "음성 재생"}>
            <PlayIcon paused={!playing} />
          </button>
          <VoiceWave />
          <time>{formatTime(duration || 18)}</time>
          <div className="voice-recorded-actions">
            <button type="button" onClick={startRecording}>다시 녹음</button>
            <button className="voice-delete-button" type="button" onClick={clearRecording} aria-label="음성 삭제">
              <TrashIcon /> 삭제
            </button>
          </div>
        </div>
      )}

      {playableVoice && (
        <audio ref={audioRef} src={playableVoice} onEnded={() => setPlaying(false)} preload="metadata" />
      )}
      {message && <small className="voice-recorder-message">{message}</small>}
    </div>
  );
}

function VoiceWave({ active = false }) {
  return (
    <div className={`voice-wave${active ? " active" : ""}`} aria-hidden="true">
      {Array.from({ length: 34 }, (_, index) => (
        <span key={index} style={{ height: `${7 + ((index * 11) % 21)}px` }} />
      ))}
    </div>
  );
}

function MicrophoneIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="3" width="8" height="12" rx="4" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" /></svg>;
}

function PlayIcon({ paused }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paused ? <path d="m9 7 8 5-8 5Z" /> : <><path d="M8 7v10" /><path d="M16 7v10" /></>}</svg>;
}

function TrashIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" /></svg>;
}

function formatTime(seconds) {
  return `00:${String(Math.max(0, Number(seconds) || 0)).padStart(2, "0")}`;
}
