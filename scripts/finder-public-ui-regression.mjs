import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const [page, safePhone, locationShare, emergency, voice, styles] = await Promise.all([
  readFile(new URL("../app/find/[key]/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/find/[key]/safe-phone-call-button.js", import.meta.url), "utf8"),
  readFile(new URL("../app/find/[key]/location-share-button.js", import.meta.url), "utf8"),
  readFile(new URL("../app/find/[key]/emergency-call-button.js", import.meta.url), "utf8"),
  readFile(new URL("../app/find/[key]/guardian-voice-player.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

assert.match(page, /도움이 필요한 분의 정보입니다/);
assert.match(page, /함께 도와주세요/);
assert.match(page, /finder-public-action-grid[\s\S]*LocationShareButton[\s\S]*EmergencyCallButton/);
assert.match(page, /GuardianVoicePlayer[\s\S]*find-guardian-message/);
assert.match(page, /보호자가 전하고픈 말/);
assert.match(page, /assets\/finder\/zezari-wordmark\.png/);
assert.match(safePhone, /\/api\/find\/\$\{encodeURIComponent\(qrKey\)\}\/safe-phone/);
assert.match(safePhone, /window\.location\.assign\(data\.telUrl\)/);
assert.match(locationShare, /setStep\("intro"\)/);
assert.match(locationShare, /IntroScreen busy=\{busy\} onAgree=\{requestPermission\}/);
assert.doesNotMatch(locationShare, /onAgree=\{\(\) => setStep\("permission"\)\}/);
assert.doesNotMatch(locationShare, /if \(preview\) \{ setLocation\(PREVIEW_LOCATION\); setStep\("confirm"\); return; \}/);
assert.match(locationShare, /requestError\?\.code === 1 \? "permission-denied" : "location-error"/);
assert.match(locationShare, /PermissionDeniedScreen[\s\S]*onRetry=\{requestPermission\}/);
assert.match(locationShare, /navigator\.geolocation\.getCurrentPosition/);
assert.match(emergency, /112에 전화할까요/);
assert.match(emergency, /href="tel:112"/);
assert.match(voice, /if \(!hasVoice\) return null/);
assert.match(voice, /audio\.play\(\)/);
assert.match(styles, /\.finder-public-page[\s\S]*min-height:\s*100svh/);
assert.match(styles, /\.finder-public-action-grid[\s\S]*grid-template-columns:\s*repeat\(2/);

await Promise.all([
  "guardian-call.png",
  "location-share.png",
  "emergency-call.png",
  "voice-play.png",
  "voice-waveform.png",
  "guardian-message.png",
  "shield-check.png",
].map((name) => access(new URL(`../public/assets/finder/${name}`, import.meta.url))));

console.log("finder public UI regression passed");
