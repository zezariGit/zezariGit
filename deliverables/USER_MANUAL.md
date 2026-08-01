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
- Guardian information address input with Kakao Postcode search; selected postcode/basic address is saved in the existing guardian address field and can be edited with detail address text.
- Top-right My Page person icon with hover tooltip for account summary, guardian/subject overview, push notification setting, support links, and logout.
- Top-left bell icon notification panel for finder push messages stored per guardian.
- Managed subject registration, update, deletion, photo upload, and status display.
- Managed subject guardian memo/message and per-subject guardian voice recording.
- New subject registration completion screen with assigned QR information.
- Dashboard product purchase button opens the dedicated `/shop` product selection flow.
- Product selection flow: admin-managed product image cards, design/quantity/managed subject/subscription period selection, product preview, order information entry, shipping address, payment method, and Toss checkout.
- Product standalone purchase details are shown only after the subscribed guardian selects the standalone purchase tab.
- Product standalone purchase uses Toss product payment and is available only to already-subscribed guardians.
- Administrators see a `결제패스` test button on product, subscription, and advertisement checkout screens; it completes the downstream test state without a Toss charge and does not add to real revenue totals.
- Product subscription payment from the shop remains pending/ready until the guardian receives the physical product and activates the QR code.
- Subscription payment options, active state, pause, and resume.
- Subject-level advertisement request and progress state foundation.
- QR public find page, QR matching, download, guardian activation after product receipt, guardian message/audio playback, and guardian notification.
- Public QR pages hide managed-subject information until the owning guardian activates the QR code.
- Safe-number privacy behavior: the public QR page does not expose the guardian's raw phone number.
- Admin guardian management, admin role management, QR management, payment management, product image/price management, and advertisement management.
- Shared progress indicators and bottom status messages.
- User privacy policy at `/privacy`, accessible from the bottom of both the onboarding/login view and authenticated guardian dashboard.
- High-level data explanations for guardians, subjects, QR codes, subscriptions, products, product orders, push subscriptions, guardian notifications, and advertisements.
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

Screenshots supplied during planning are structure references. Final UI styling should follow the project's shared CSS system and gov-style visual language unless the user explicitly asks for an exact visual copy.

## Current Privacy Note

The guardian's private `phone` value remains available for authenticated owner/admin workflows, but a valid public QR access only shows a 24-hour shared number allocated from `safe_phone_pool`. If no pool number can be allocated, the public page shows `안심번호 준비중` and never falls back to the private phone.

The active public QR page does not display the guardian's name, email, or address. It provides the safe-number call link, guardian message/audio, and one `위치공유` button. The location action does not ask the finder to enter a phone number or location description.

The current privacy policy is available at `https://zezari.vercel.app/privacy`. It documents the protected account data, public QR disclosure scope, location sharing, external processors, retention rules, user rights, and privacy contact information.

## Current Signup Note

Direct and first-time SNS signup use a server-issued SMS verification code and one-time verification token. Production delivery requires the configured SMS provider credentials; the development bypass code is restricted to local development.
