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
  readFile(new URL("../public/assets/subject-registration/shop-icon.png", import.meta.url)),
  readFile(new URL("../public/assets/subject-registration/dashboard-icon.png", import.meta.url)),
  readFile(new URL("../public/assets/dashboard/subject-preview-heading.png", import.meta.url)),
  readFile(new URL("../public/assets/dashboard/subject-preview-call.png", import.meta.url)),
  readFile(new URL("../public/assets/dashboard/subject-preview-location.png", import.meta.url)),
  readFile(new URL("../public/assets/dashboard/subject-preview-emergency.png", import.meta.url)),
  readFile(new URL("../public/assets/dashboard/subject-preview-voice.png", import.meta.url)),
  readFile(new URL("../public/assets/dashboard/subject-preview-message.png", import.meta.url)),
  readFile(new URL("../public/assets/dashboard/subject-preview-actions.png", import.meta.url)),
]);

assert.match(dashboard, /src=\{subject\.voice_data_url \|\| ""\}/, "등록된 보호자 음성을 합본 작업 영역에 전달해야 합니다.");
assert.match(dashboard, /subject-preview-heading\.png/, "미리보기 제목은 제공된 원본 이미지를 사용해야 합니다.");
assert.match(dashboard, /subject-preview-message\.png/, "보호자 메시지 제목은 제공된 원본 이미지를 사용해야 합니다.");
assert.match(voicePlayer, /subject-preview-actions\.png/, "미리보기 작업 영역은 제공된 합본 이미지를 사용해야 합니다.");
assert.match(voicePlayer, /subject-preview-action-hotspot call[\s\S]*subject-preview-action-hotspot location[\s\S]*subject-preview-action-hotspot emergency[\s\S]*subject-preview-action-hotspot voice/, "합본 이미지의 각 작업은 독립된 버튼이어야 합니다.");
assert.match(dashboard, /대상자 정보 수정/);
assert.match(dashboard, /대상자 정보 등록/);
assert.match(dashboard, /대상자 등록이 완료되었습니다\./);
assert.match(dashboard, /href="\/shop"/);
assert.match(dashboard, /href="\/\?tab=dashboard"/);
assert.match(registrationForm, /message\.length <= 200/);
assert.match(registrationForm, /voiceRecording/);
assert.match(registrationForm, /disabled=\{!formReady \|\| recording\}/);
assert.match(voiceRecorder, /MAX_RECORDING_SECONDS = 30/);
assert.match(voiceRecorder, /removeVoice/);
assert.match(database, /guardianMessage\.length > 200/);
assert.match(database, /const removeVoice =/);
assert.match(styles, /\.subject-preview-emergency-grid/);
assert.match(styles, /\.voice-recording-panel/);
assert.match(styles, /\.subject-complete-qr-wrap/);
for (const image of subjectImages) {
  assert.equal(image.toString("ascii", 1, 4), "PNG");
}

console.log("Subject flow regression checks passed.");
