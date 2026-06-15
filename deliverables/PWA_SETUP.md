# PWA Setup

Project: REAL_QR_FIND / zezari

## Status
- Implemented.

## Purpose
- Allow users to install the web app like an app from supported browsers.
- Support desktop Chrome installation and Android home-screen installation.
- Provide iOS home-screen guidance because iOS Safari does not expose the same programmable install prompt.

## Implemented Files
- `public/manifest.webmanifest`
- `public/sw.js`
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/maskable-512.png`
- `app/auth-actions.js`
- `app/layout.js`
- `app/page.js`
- `app/globals.css`

## Manifest
- App name: `zezari`
- Short name: `zezari`
- Display mode: `standalone`
- Start URL: `/`
- Theme color: `#176b5b`
- Background color: `#f6f8f7`

## Service Worker
- Current cache name: `zezari-v13`
- Caches app shell:
  - `/`
  - `/manifest.webmanifest`
- Uses network-first behavior for GET requests.
- Excludes `/api/auth` routes from service worker handling to avoid interfering with OAuth login.
- Handles Web Push notifications and opens the app when a notification is clicked.

## Install UI
- Android/Desktop Chrome:
  - Shows an `앱 설치` button when the browser fires `beforeinstallprompt`.
- Installed mode:
  - Shows `앱으로 실행 중입니다.`
- iOS:
  - Shows Safari home-screen guidance because iOS install cannot be triggered by JavaScript.

## Verification Checklist
- `npm run build` completes successfully.
- `https://zezari.vercel.app/manifest.webmanifest` returns the manifest.
- `https://zezari.vercel.app/sw.js` returns the service worker.
- `https://zezari.vercel.app/icons/icon-192.png` returns the app icon.
- `https://zezari.vercel.app/icons/icon-512.png` returns the app icon.
- Home page no longer displays `hellow`.
- Social login buttons display Google, Kakao, and Naver logos/text.
