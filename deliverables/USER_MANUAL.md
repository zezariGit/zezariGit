# REAL_QR_FIND 사용자 통합 설명서

Project: REAL_QR_FIND / zezari

## Primary Document

- Google Docs: https://docs.google.com/document/d/1DdcqFv79lcAj4eCuiXaOTsJmpTKWtvBRErWJsoAidEM
- Title: `REAL_QR_FIND 사용자 통합 설명서`
- Created: 2026-06-16 KST
- Service URL used in the manual: https://zezari.vercel.app

## Purpose

This deliverable is the local index for the integrated user manual. The full user-facing manual is maintained in Google Docs so it can be opened, presented, shared, and updated easily.

## Coverage

The manual explains the current implemented service from both user and admin perspectives:

- Social signup/login with Google, Kakao, and Naver button states.
- Login/signup screen redesigned with guardian ID/password fields, auto-login checkbox, forgot-password helper, and SNS icon row.
- Direct guardian signup flow: phone verification, basic information input, signup completion, and post-signup navigation to subject registration or dashboard.
- SNS first-login signup completion flow: incomplete social accounts must fill the same guardian signup information before entering the dashboard; SNS name/email values are prefilled when available.
- PWA installation and onboarding flow.
- Guardian dashboard and separated user tabs: dashboard, guardian information, and managed subject information.
- Managed subject registration, update, deletion, photo upload, and status display.
- Managed subject guardian memo/message and per-subject guardian voice recording.
- New subject registration completion screen with assigned QR information.
- Subscription payment options, active state, pause, and resume.
- Subject-level advertisement request and progress state foundation.
- QR public find page, QR matching, download, activation, guardian message/audio playback, and guardian notification.
- Safe-number privacy behavior: the public QR page does not expose the guardian's raw phone number.
- Admin guardian management, admin role management, QR management, payment management, and advertisement management.
- Shared progress indicators and bottom status messages.
- High-level data explanations for guardians, subjects, QR codes, subscriptions, push subscriptions, and advertisements.
- Actual screenshot examples for onboarding, login, admin login, public QR unmatched state, and public QR matched state with private information redacted.
- Latest login redesign screenshot: `deliverables/user_manual_screenshots/login_redesign.png`.
- Latest direct signup phone-verification screenshot: `deliverables/user_manual_screenshots/signup_phone_step.png`.

## Screenshot Assets

Local source screenshots are stored in:

- `deliverables/user_manual_screenshots/`

The Google Docs manual includes the selected screenshots directly. The matched QR public-page screenshot was redacted before insertion because it can contain guardian contact details and managed subject information.

Guardian dashboard and authenticated admin tab screenshots still require an active guardian/admin login session before they can be captured as real screens.

## Maintenance Rule

When a new screen, button, database-backed field, admin function, or public user flow is added, update:

- The Google Docs manual.
- This local deliverable index if the manual URL or coverage changes.
- `logs/DEV_HANDOFF_LOG.md`.
- `logs/PRESENTATION_PROGRESS_LOG.md`.

Never store live environment values, API keys, tokens, test secrets, or user private credentials in the manual or logs.

## Current Privacy Note

The guardian's private `phone` value remains available for authenticated owner/admin workflows, but the public QR page uses `safe_phone` only. If no safe number has been issued yet, the public page shows `안심번호 준비중`.

## Current Signup Note

Direct signup currently uses a test-mode phone verification code displayed on the page. Replace this with a real SMS provider before production identity verification is considered complete.
