# Public Guardian Voice Playback

Project: REAL_QR_FIND / zezari
Date: 2026-07-24

## Requirement
- Let a finder play the guardian-recorded voice from the public managed-subject QR page.
- Use a clear mobile button labeled `보호자 음성 재생(심신안정용)`.

## Display Conditions
- The QR exists and is enabled.
- The guardian activated the QR.
- The guardian has an active service period.
- The selected subject has `subjects.voice_data_url`.
- When no guardian voice is saved, the playback button is not rendered.

## Interaction
- Initial/finished state: `보호자 음성 재생(심신안정용)`
- Playing state: `보호자 음성 일시정지`
- Playing shows `보호자 음성을 재생하고 있습니다.`
- Playback errors show an inline message under the button.
- The recorded audio filename is displayed above the button.

## Implementation
- Client component: `app/find/[key]/guardian-voice-player.js`
- Public page: `app/find/[key]/page.js`
- Styling: `app/globals.css`
- Uses the browser HTML Audio API and preserves the existing `subjects.voice_data_url` storage format.

## Privacy
- Guardian audio is visible only through an active QR public page with an active subscription.
- Audio can contain personal information. The guardian registration/edit screen should continue to explain that the recording is played to a finder for subject support.

## Verification
- `npm run build` succeeded.
- A read-only Turso lookup found an eligible active QR with saved guardian voice.
- The local public page returned HTTP 200 and included the playback button label.
