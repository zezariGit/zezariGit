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

Keep the matching `https://zezari.vercel.app/api/auth/callback/{provider}` entries while the compatibility domain remains available. With `NEXTAUTH_URL` set to the custom domain, login started from the Vercel URL can complete on the custom domain.

## Payment And External Links

- Toss success/failure paths are relative application routes and use the active custom-domain origin after deployment.
- Meta advertisement destination links use the public app URL and therefore use the custom domain.
- Kakao/Naver map links are external coordinate links and are unaffected.

## Verification Checklist

- Both domains return HTTPS 200 for the home page.
- Both domains return HTTPS 200 for `/privacy`, PWA manifest, and service worker.
- A public `/find/{public_key}` path works on both domains.
- Social login initiation uses the custom-domain callback URL.
- New QR display/download URLs use `zezari.family`.
- Existing Vercel-domain QR links continue to resolve.
