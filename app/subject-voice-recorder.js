"use client";

import { useRef, useState } from "react";

export default function SubjectVoiceRecorder({ existingVoice = "", existingName = "" }) {
  const [recording, setRecording] = useState(false);
  const [voiceDataUrl, setVoiceDataUrl] = useState("");
  const [voiceName, setVoiceName] = useState("");
  const [message, setMessage] = useState("");
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setMessage("이 브라우저에서는 음성녹음을 지원하지 않습니다.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          setVoiceDataUrl(String(reader.result || ""));
          setVoiceName(`guardian-voice-${Date.now()}.webm`);
          setMessage("음성녹음이 준비되었습니다. 저장 버튼을 눌러 반영해 주세요.");
        };
        reader.readAsDataURL(blob);
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };
      recorder.start();
      setRecording(true);
      setMessage("녹음 중입니다.");
    } catch {
      setMessage("마이크 권한을 허용해야 녹음할 수 있습니다.");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const clearRecording = () => {
    setVoiceDataUrl("");
    setVoiceName("");
    setMessage("새 녹음을 취소했습니다.");
  };

  const playableVoice = voiceDataUrl || existingVoice;

  return (
    <div className="voice-recorder">
      <input type="hidden" name="voiceDataUrl" value={voiceDataUrl} />
      <input type="hidden" name="voiceName" value={voiceName} />
      <input type="hidden" name="existingVoiceDataUrl" value={existingVoice || ""} />
      <input type="hidden" name="existingVoiceName" value={existingName || ""} />

      <div className="voice-recorder-controls">
        {!recording ? (
          <button className="voice-record-button" type="button" onClick={startRecording}>
            녹음
          </button>
        ) : (
          <button className="voice-stop-button" type="button" onClick={stopRecording}>
            정지
          </button>
        )}
        <div className="voice-wave" aria-hidden="true">
          {Array.from({ length: 24 }, (_, index) => (
            <span key={index} style={{ height: `${12 + ((index * 7) % 28)}px` }} />
          ))}
        </div>
        {(voiceDataUrl || existingVoice) && (
          <button className="voice-clear-button" type="button" onClick={clearRecording}>
            삭제
          </button>
        )}
      </div>

      {playableVoice && <audio controls src={playableVoice} />}
      {message && <small>{message}</small>}
    </div>
  );
}
