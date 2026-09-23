import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const [page, safePhone, locationShare, emergency, voice, voiceGraphic, styles] = await Promise.all([
  readFile(new URL("../app/find/[key]/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/find/[key]/safe-phone-call-button.js", import.meta.url), "utf8"),
  readFile(new URL("../app/find/[key]/location-share-button.js", import.meta.url), "utf8"),
  readFile(new URL("../app/find/[key]/emergency-call-button.js", import.meta.url), "utf8"),
  readFile(new URL("../app/find/[key]/guardian-voice-player.js", import.meta.url), "utf8"),
  readFile(new URL("../app/voice-playback-graphic.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

assert.match(page, /도움이 필요한 분의 정보입니다/);
assert.match(page, /함께 도와주세요/);
assert.match(page, /finder-public-action-grid[\s\S]*LocationShareButton[\s\S]*EmergencyCallButton/);
assert.match(page, /GuardianVoicePlayer[\s\S]*find-guardian-message/);
assert.match(page, /보호자가 전하고픈 말/);
assert.match(page, /assets\/finder\/zezari-wordmark\.png/);
assert.doesNotMatch(page, /subscriptionReady|!data\.qr_activated_at/);
assert.match(page, /const subscriptionActive = !data\.subscription_status/);
assert.match(page, /if \(state === "purchase-needed"\)[\s\S]*qr_activation_source: "subject_registration"[\s\S]*subject_status: "상품구매필요"/);
assert.doesNotMatch(page, /상품 수령 후 활성화|아직 활성화되지 않은 QR입니다|activateQrAction/);
assert.match(page, /unassigned"\}-icon-hd\.png/);
assert.match(page, /kakao-inquiry-hd\.png/);
assert.match(page, /미배정 QR입니다\./);
assert.match(page, /사용할 수 없는 QR 입니다\./);
assert.match(page, /gender === "남" \|\| gender === "남성"\) return "남성"/);
assert.match(page, /gender === "여" \|\| gender === "여성"\) return "여성"/);
assert.match(safePhone, /\/api\/find\/\$\{encodeURIComponent\(qrKey\)\}\/safe-phone/);
assert.match(safePhone, /window\.location\.assign\(data\.telUrl\)/);
assert.match(locationShare, /setStep\("intro"\)/);
assert.match(locationShare, /IntroScreen busy=\{busy\} onAgree=\{requestPermission\}/);
assert.doesNotMatch(locationShare, /onAgree=\{\(\) => setStep\("permission"\)\}/);
assert.match(locationShare, /if \(preview\) \{ setLocation\(PREVIEW_LOCATION\); setStep\("confirm"\); return; \}/);
assert.match(locationShare, /isPermissionDeniedError\(requestError\) \|\| permissionState === "denied" \? "permission-denied" : "location-error"/);
assert.match(locationShare, /PermissionDeniedScreen[\s\S]*onRetry=\{requestPermission\}/);
assert.match(locationShare, /navigator\.geolocation\.getCurrentPosition/);
assert.match(locationShare, /enableHighAccuracy: true, timeout: 12000, maximumAge: 0/);
assert.match(locationShare, /enableHighAccuracy: false, timeout: 18000, maximumAge: 60000/);
assert.match(locationShare, /navigator\.permissions\.query\(\{ name: "geolocation" \}\)/);
assert.match(emergency, /112에 전화할까요/);
assert.match(emergency, /href="tel:112"/);
assert.match(voice, /if \(!hasVoice\) return null/);
assert.match(voice, /audio\.play\(\)/);
assert.match(voice, /VoicePlaybackGraphic playing=\{status === "playing"\}/);
assert.match(voiceGraphic, /assets\/finder\/voice-play\.png[\s\S]*assets\/finder\/voice-waveform\.png/);
assert.match(styles, /\.finder-public-page[\s\S]*min-height:\s*100svh/);
assert.match(styles, /\.finder-public-page[\s\S]*grid-template-columns:\s*minmax\(0, 390px\)/);
assert.match(styles, /\.finder-public-shell[\s\S]*max-width:\s*390px/);
assert.match(styles, /\.finder-public-shell[\s\S]*margin-inline:\s*auto/);
assert.match(styles, /\.finder-public-shell[\s\S]*gap:\s*8px/);
assert.match(styles, /\.finder-public-shell[\s\S]*padding:\s*8px 15px 10px/);
assert.match(styles, /\.finder-public-brand[\s\S]*width:\s*76px/);
assert.match(styles, /@media \(max-height:\s*620px\) and \(max-width:\s*520px\)/);
assert.match(styles, /\.finder-public-action-grid[\s\S]*grid-template-columns:\s*repeat\(2/);
assert.match(styles, /\.location-flow\s*\{[\s\S]*height:\s*100dvh/);
assert.match(styles, /\.location-flow\s*\{[\s\S]*-webkit-overflow-scrolling:\s*touch/);
assert.match(styles, /\.location-flow\s*\{[\s\S]*touch-action:\s*pan-y/);
assert.match(styles, /\.qr-status-kakao-link\s*\{[\s\S]*margin-top:\s*28px/);

await Promise.all([
  "guardian-call.png",
  "location-share.png",
  "emergency-call.png",
  "guardian-voice-button.png",
  "guardian-message.png",
  "shield-check.png",
].map((name) => access(new URL(`../public/assets/finder/${name}`, import.meta.url))));

await Promise.all([
  "unassigned-icon-hd.png",
  "expired-icon-hd.png",
  "kakao-inquiry-hd.png",
].map((name) => access(new URL(`../public/assets/qr-status/${name}`, import.meta.url))));

console.log("finder public UI regression passed");
