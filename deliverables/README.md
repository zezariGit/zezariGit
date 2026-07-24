# Official Deliverables

This folder stores official implementation outputs for the REAL_QR_FIND project.

## Deliverable Policy
- Requirements documents, architecture notes, API designs, database designs, screen plans, test reports, release notes, and deployment notes should be stored here.
- Each development phase should create or update a deliverable when meaningful.
- Visual material prompts should be stored under `image_prompts/`.

## Current Deliverables
- `image_prompts/IMAGE_PROMPTS.md`: cumulative prompt archive for diagrams and generated visuals.
- `INTEGRATION_SETUP.md`: Vercel and Turso integration status and setup guide.
- `AUTH_SETUP.md`: Google login/signup setup requirements and environment variable plan.
- `AUTH_PHONE_VERIFICATION.md`: server-issued signup phone verification APIs, SMS env variables, token rules, and DB behavior.
- `PWA_SETUP.md`: installable web app setup for desktop and mobile.
- `ONBOARDING_FLOW.md`: three-page service introduction and skip behavior.
- `DATABASE_SCHEMA.md`: Turso schema for guardians and subjects.
- `ADMIN_SETUP.md`: admin page access, guardian activation, and subject lookup behavior.
- `UI_STYLE_GUIDE.md`: gov-style design base and future page styling rules.
- `QR_MANAGEMENT.md`: QR generation, unique URL strings, admin activation, and public find URL behavior.
- `TOSS_PAYMENTS_SETUP.md`: Toss Payments subscription payment foundation and callback flow.
- `PREPAID_PASS_PAYMENT.md`: one-time Toss payment, QR-based pass activation, renewal, pause/resume, expiry, and privacy rules.
- `PUSH_NOTIFICATION_SETUP.md`: guardian browser push registration and QR find-page notification flow.
- `PUBLIC_GUARDIAN_VOICE_PLAYBACK.md`: public QR page guardian voice playback button, states, access conditions, and privacy notes.
- `ADVERTISING_SETUP.md`: dashboard subject advertisement modal, admin daily rate, advertisement progress foundation, and Meta API preparation.
- `ADMIN_DASHBOARD_OPERATIONS_REVAMP.md`: operations-style admin dashboard with overview cards, trend chart, recent tables, order/ad/subscription/sales panels.
- `GUARDIAN_ADMIN_OPERATIONS_LAYOUT.md`: operations-style guardian management screen with status cards, extended filters, dense grid, detail panel, and CSV export additions.
- `ADMIN_AD_GRID_MANAGEMENT.md`: admin advertisement grid, selected-row actions, detail panel, click-count schema placeholder, and Meta API readiness.
- `ADMIN_MISSING_REPORT_MANAGEMENT.md`: admin missing-report menu, date/search filters, status mapping, and grid behavior.
- `LOCATION_SHARE_MANAGEMENT.md`: public QR location-share button, guardian push map links, `location_shares` table, and admin location-share grid/detail management.
- `ADMIN_SUBSCRIPTION_MANAGEMENT.md`: admin subscription grid, search filters, two-tab detail card, admin memo storage, and scroll behavior.
- `ADMIN_PAYMENT_EXPORT_MANAGEMENT.md`: admin payment ledger grid, product/pass/ad payment data source, and Excel-compatible CSV exports for admin grids.
- `PRODUCT_DESIGN_CATALOG.md`: product design-level image/detail-page management, order design linkage, and admin/user shop flow.
- `ADMIN_COUPON_MANAGEMENT.md`: admin coupon ledger, discount conditions, issue limits, status management, and user coupon registration validation.
- `ADMIN_NOTIFICATION_MANAGEMENT.md`: admin notification/message grid, right-side compose panel, push delivery action, and delivery result tracking.
- `ADMIN_MESSAGE_TEMPLATE_MANAGEMENT.md`: admin message template grid, locked automatic templates, push/KakaoTalk channel settings, and template seed data.
- `USER_MANUAL.md`: Google Docs user manual link, coverage, and maintenance rule.
- Current UI feedback pattern: submit buttons show inline progress bars, and server actions show bottom status messages via `notice` query parameters.

## Planned Deliverables
- Requirements specification
- System architecture document
- Database schema document
- API specification
- UI/UX screen flow
- Security and privacy checklist
- Test plan and test report
- Deployment guide
