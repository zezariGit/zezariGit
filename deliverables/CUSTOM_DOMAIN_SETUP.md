# REAL_QR_FIND Custom Domain Setup

## Purpose

- Primary production URL: `https://zezari.family`
- Compatibility URL: `https://zezari.vercel.app`
- Both domains point to the same Vercel production project and deployment.

## Vercel Domain Status

- `zezari.family` is registered through Vercel.
- Vercel nameservers are active.
- Vercel CDN is active.
- The SSL certificate covers `zezari.family` and `*.zezari.family` and is configured for automatic renewal.
- The domain is connected to the `zezari` project.
- The existing `zezari.vercel.app` alias is retained for previously printed QR codes and old links.

## Application Configuration

The Vercel production variables below use the custom domain:

```text
NEXTAUTH_URL=https://zezari.family
PUBLIC_APP_URL=https://zezari.family
```

The source fallback URLs, Meta advertisement destination fallback, map API user-agent URL, and metadata base also use `https://zezari.family`.

## QR Compatibility

- New QR downloads and newly generated advertisement links use `https://zezari.family/find/{public_key}`.
- Existing `qr_codes.target_url` rows were migrated from the Vercel domain to the custom domain.
- Previously printed QR codes that contain `https://zezari.vercel.app/find/{public_key}` remain valid because the Vercel alias stays connected to the same application.
- A QR's `public_key` is unchanged, so no managed-subject matching data is replaced.

## OAuth Callback URLs

The social provider consoles must allow these callback URLs for login on the custom domain:

```text
https://zezari.family/api/auth/callback/google
https://zezari.family/api/auth/callback/kakao
https://zezari.family/api/auth/callback/naver
https://zezari.family/api/auth/callback/facebook
```

Keep the matching `https://zezari.vercel.app/api/auth/callback/{provider}` entries while the compatibility domain remains available. The authentication API emits a callback URL for the host used to open the service, so both callback URL sets are required when both domains offer direct login.

### Provider Console Status

- Google: custom-domain origin and callback registered; existing Vercel-domain and localhost entries retained.
- Naver: primary service URL changed to `https://zezari.family`; custom-domain and Vercel-domain callbacks registered.
- Naver operational note: the application is still in the `개발 중` state, so only registered application members can complete login until review approval.
- Kakao and Facebook callbacks remain separate provider-console follow-up items.

## Payment And External Links

- Toss success/failure paths are relative application routes and use the active custom-domain origin after deployment.
- Meta advertisement destination links use the public app URL and therefore use the custom domain.
- Kakao/Naver map links are external coordinate links and are unaffected.

## Verification Checklist

- PASS: Both domains return HTTPS 200 for the home page and point to the same production deployment.
- PASS: The custom domain returns HTTPS 200 for `/privacy`, PWA manifest, and service worker.
- PASS: A public `/find/{public_key}` path returns HTTPS 200 on both domains.
- PASS: The authentication provider API exposes credentials, Google, Kakao, Naver, and Facebook on both domains and creates host-matching callback URLs.
- PASS: All 40 stored QR target URLs use `zezari.family`, with 40 unique public keys and unchanged subject matching.
- PASS: Existing Vercel-domain QR links continue to resolve.
- PASS: Google opened its account chooser with the `zezari.family` callback and no redirect mismatch.
- PASS: Naver opened its consent screen with the `zezari.family` callback and no callback URL error.
- FOLLOW-UP: Register and verify the custom-domain callback in the Kakao and Facebook consoles.
