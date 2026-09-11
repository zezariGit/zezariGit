import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [dashboard, registrationForm, voiceRecorder, voicePlayer, database, styles, ...subjectImages] = await Promise.all([
  readFile(new URL("../app/dashboard.js", import.meta.url), "utf8"),
  readFile(new URL("../app/subject-registration-form.js", import.meta.url), "utf8"),
  readFile(new URL("../app/subject-voice-recorder.js", import.meta.url), "utf8"),
  readFile(new URL("../app/subject-preview-voice-player.js", import.meta.url), "utf8"),
  readFile(new URL("../lib/db.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  readFile(new URL("../public/assets/subject-registration/photo-placeholder.png", import.meta.url)),
  readFile(new URL("../public/assets/subject-registration/completion-qr.png", import.meta.url)),
  readFile(new URL("../public/assets/subject-registration/completion-summary.png", import.meta.url)),
  readFile(new URL("../public/assets/subject-registration/shop-icon.png", import.meta.url)),
  readFile(new URL("../public/assets/subject-registration/dashboard-icon.png", import.meta.url)),
  readFile(new URL("../public/assets/dashboard/subject-preview-heading.png", import.meta.url)),
  readFile(new URL("../public/assets/dashboard/subject-preview-call.png", import.meta.url)),
  readFile(new URL("../public/assets/dashboard/subject-preview-location.png", import.meta.url)),
  readFile(new URL("../public/assets/dashboard/subject-preview-emergency.png", import.meta.url)),
  readFile(new URL("../public/assets/dashboard/subject-preview-voice.png", import.meta.url)),
  readFile(new URL("../public/assets/dashboard/subject-preview-message.png", import.meta.url)),
  readFile(new URL("../public/assets/dashboard/subject-preview-actions.png", import.meta.url)),
  readFile(new URL("../public/assets/dashboard/subject-preview-call-v2.png", import.meta.url)),
  readFile(new URL("../public/assets/dashboard/subject-preview-location-v2.png", import.meta.url)),
  readFile(new URL("../public/assets/dashboard/subject-preview-emergency-v2.png", import.meta.url)),
  readFile(new URL("../public/assets/dashboard/subject-preview-message-v2.png", import.meta.url)),
]);

assert.match(dashboard, /subject\.voice_data_url && \(/, "음성 영역은 등록된 음성이 있을 때만 표시해야 합니다.");
assert.match(dashboard, /subject-preview-heading\.png/, "미리보기 제목은 제공된 원본 이미지를 사용해야 합니다.");
assert.match(dashboard, /subject-preview-call-v2\.png[\s\S]*subject-preview-location-v2\.png[\s\S]*subject-preview-emergency-v2\.png/, "전화, 위치 공유, 112 신고는 새로 제공된 이미지를 각각 사용해야 합니다.");
assert.match(dashboard, /subject-preview-message-v2\.png[\s\S]*subject\.guardian_message/, "메시지 카드에는 실제 보호자 입력값이 표시되어야 합니다.");
assert.match(voicePlayer, /subject-preview-voice\.png/, "음성 재생 영역은 제공된 이미지를 사용해야 합니다.");
assert.match(dashboard, /대상자 정보 수정/);
assert.match(dashboard, /대상자 정보 등록/);
assert.ok(
  dashboard.indexOf('className="target-voice-field"') < dashboard.indexOf("<SubjectMessageField"),
  "보호자 음성 녹음은 보호자가 전하고픈 말보다 먼저 표시해야 합니다."
);
assert.match(dashboard, /subject-edit-helper[\s\S]*보호자 연락처는 \[설정\]/);
assert.match(dashboard, /대상자 등록이 완료되었습니다\./);
assert.match(dashboard, /completion-summary\.png/);
assert.doesNotMatch(dashboard, /subject-complete-button-icon/, "완료 화면 버튼은 텍스트만 표시해야 합니다.");
assert.match(dashboard, /href="\/shop"/);
assert.match(dashboard, /href="\/\?tab=dashboard"/);
assert.match(registrationForm, /message\.length <= 200/);
assert.match(registrationForm, /voiceRecording/);
assert.match(registrationForm, /disabled=\{!formReady \|\| recording\}/);
assert.match(voiceRecorder, /MAX_RECORDING_SECONDS = 30/);
assert.match(voiceRecorder, /RECORDING_AUDIO_BITS_PER_SECOND = 64_000/);
assert.match(voiceRecorder, /recording \|\| processing \? "1" : "0"/);
assert.match(voiceRecorder, /audio\/mp4/);
assert.match(voiceRecorder, /chunksRef\.current\[0\]\?\.type/);
assert.match(voiceRecorder, /removeVoice/);
assert.match(voiceRecorder, /iPhone 설정에서 Safari 또는 제자리를 선택한 뒤 마이크 권한을 허용해 주세요/);
assert.match(dashboard, /<span>\{gender\}<\/span>/, "성별은 남성, 여성으로 표시해야 합니다.");
assert.match(database, /guardianMessage\.length > 200/);
assert.match(database, /const removeVoice =/);
assert.match(database, /"audio\/x-m4a"/);
assert.match(database, /"audio\/aac"/);
assert.match(database, /audioBuffer\.length > 4 \* 1024 \* 1024/);
assert.match(styles, /\.subject-preview-emergency-grid/);
assert.match(styles, /\.voice-recording-panel/);
assert.match(styles, /\.target-field small,[\s\S]*font-size: 12px;[\s\S]*font-weight: 500;/, "서브 안내 문구 크기와 굵기를 통일해야 합니다.");
assert.match(styles, /\.subject-complete-qr-wrap/);
for (const image of subjectImages) {
  assert.equal(image.toString("ascii", 1, 4), "PNG");
}

console.log("Subject flow regression checks passed.");
