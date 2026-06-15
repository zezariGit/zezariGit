# Toss Payments Setup

Project: REAL_QR_FIND / zezari

## Status
- Subscription payment foundation implemented.
- Advertisement payment is planned for a later phase.

## Implemented Product
- Toss Payments V2 auto-billing subscription flow.
- The first dashboard integration is guardian subscription payment.

## User Flow
1. Logged-in guardian opens the dashboard.
2. The `현재 상태` header shows:
   - `구독결제하기` when not subscribed.
   - `구독중` when subscription status is active.
3. Clicking `구독결제하기` calls the server prepare API.
4. The browser loads Toss Payments V2 SDK:
   - `https://js.tosspayments.com/v2/standard`
5. The client starts card billing authentication:
   - `payment.requestBillingAuth({ method: "CARD", successUrl, failUrl })`
6. Toss redirects to:
   - Success: `/payments/toss/subscription/success`
   - Fail: `/payments/toss/subscription/fail`
7. On success, the server:
   - Issues a billing key with `POST /v1/billing/authorizations/issue`.
   - Approves the first subscription billing payment with `POST /v1/billing/{billingKey}`.
   - Stores subscription status as `active`.

## Environment Variables

```text
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
TOSS_SUBSCRIPTION_AMOUNT=9900
TOSS_SUBSCRIPTION_ORDER_NAME=zezari 월 구독
```

Alternative legacy names supported by code:

```text
TOSSPAYMENTS_CLIENT_KEY=
TOSSPAYMENTS_SECRET_KEY=
```

## Callback URLs

Production:

```text
https://zezari.vercel.app/payments/toss/subscription/success
https://zezari.vercel.app/payments/toss/subscription/fail
```

Local:

```text
http://localhost:3000/payments/toss/subscription/success
http://localhost:3000/payments/toss/subscription/fail
```

## Database
- Table: `subscriptions`
- Important fields:
  - `guardian_id`
  - `customer_key`
  - `billing_key`
  - `status`
  - `amount`
  - `last_order_id`
  - `last_payment_key`
  - `last_payment_status`

## Security Rules
- Toss secret key is used only on the server.
- Toss client key is exposed only to the browser when both Toss keys are configured.
- The server stores the subscription result only after Toss server API succeeds.
- Billing key payment is server-only.

## Notes
- Auto-billing may require a Toss Payments contract/review for production use.
- Toss Payments does not provide subscription scheduling. Later recurring billing needs a scheduler or cron job.
- Current implementation charges the first subscription payment immediately after billing key issuance.
