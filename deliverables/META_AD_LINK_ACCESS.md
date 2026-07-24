# Meta Advertisement Link Access

Project: REAL_QR_FIND / zezari

## Requirement
- A mobile viewer must be able to open the managed-subject page without scanning the QR code displayed inside the same advertisement.
- A guardian must be able to open the published advertisement after payment and automatic Meta publication.

## Implementation
1. The Meta creative CTA links directly to `/find/{public_key}`.
2. The primary advertisement text includes the same full managed-subject URL.
3. The captured advertisement poster prints the URL below its QR code.
4. After Meta creates the ad, the server reads `preview_shareable_link` and `creative.effective_object_story_id`.
5. Turso stores these values in `subject_ads.meta_preview_url` and `subject_ads.meta_story_id`.
6. The guardian advertisement dashboard shows:
   - `관리대상 페이지`: opens the public managed-subject page.
   - `광고 피드 보기`: opens Meta's shareable advertisement preview.

## Existing Advertisements
- Production schema version `25` adds both Meta link fields.
- Existing advertisements with a stored Meta ad ID are backfilled through the Graph API.
- Backfill does not create, activate, pause, or charge a new advertisement.

## Failure Handling
- Advertisement delivery remains successful if Meta has not produced a preview URL yet.
- Campaign, ad set, creative, and ad IDs are still stored.
- The preview URL can be fetched and stored later without republishing the advertisement.

## Privacy And Security
- Meta credentials remain server-only and are never included in the URL shown to guardians.
- The public destination contains only the QR public key.
- The preview URL is shown only inside the authenticated guardian advertisement dashboard.

## Operational Meaning
- `광고 피드 보기` is Meta's shareable advertisement preview link.
- It is not guaranteed to be a permanent organic Facebook Page-post permalink.
- The managed-subject page remains the durable destination controlled by REAL_QR_FIND.
