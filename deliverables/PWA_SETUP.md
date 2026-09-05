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
- `public/icons/zezari-wordmark-v1-192.png`
- `public/icons/zezari-wordmark-v1-512.png`
- `public/icons/zezari-wordmark-maskable-v1-512.png`
- `public/icons/zezari-wordmark-v1-180.png`
- `public/icons/zezari-wordmark-v1-48.png`
- `app/auth-actions.js`
- `app/layout.js`
- `app/page.js`
- `app/globals.css`

## Manifest
- App name: `zezari`
- Short name: `zezari`
- Display mode: `standalone`
- Start URL: `/`
- Theme color: `#26963f`
- Background color: `#f5f8f5`

## Service Worker
- Current cache name: `zezari-v18`
- Pre-caches only the web manifest and versioned app/notification icons.
- Uses network-first behavior only for explicit `/icons/`, `/assets/`, and manifest requests.
- Navigations, personalized pages, and all API routes bypass the service-worker cache.
- Handles Web Push notifications and opens the app when a notification is clicked.

## Install UI
- Android/Desktop Chrome:
  - Shows an `앱 설치` button when the browser fires `beforeinstallprompt`.
- Installed mode:
  - Installed mode stays visually quiet and does not render a separate status sentence.
- iOS:
  - Shows Safari home-screen guidance because iOS install cannot be triggered by JavaScript.

## Verification Checklist
- `npm run build` completes successfully.
- `https://zezari.family/manifest.webmanifest` returns the manifest.
- `https://zezari.family/sw.js` returns the service worker.
- `https://zezari.family/icons/zezari-wordmark-v1-192.png` returns the app icon.
- `https://zezari.family/icons/zezari-wordmark-v1-512.png` returns the app icon.
- Home page no longer displays `hellow`.
- Social login buttons display Google, Kakao, and Naver logos/text.
