# User Dashboard Subject Preview

## Scope

- Dashboard subject cards now show only the subject name, birth date, and one canonical state badge.
- Clicking a subject card opens an authenticated guardian-only preview at `/?tab=dashboard&previewSubject={subjectId}`.
- The public QR route remains `/find/{publicKey}` and never renders an edit action.
- Subject editing starts from the guardian preview and returns to the same preview after a successful save.
- My Page no longer contains subject list, add, or edit controls.

## Canonical State Rule

The UI resolves exactly one state in this priority order:

1. `찾는중`: the subject has an active missing-state value.
2. `안전`: the assigned QR is enabled and has an activation timestamp.
3. `QR활성화필요`: a paid product order exists, the stored state already reached the purchase stage, or an activated QR is currently disabled.
4. `상품구매필요`: the subject is registered but none of the above conditions applies.

The existing `subjects.status` values remain the workflow enum. Dashboard queries additionally expose `has_product_purchase` from paid product orders so the display does not rely on a decorative label or advertisement state.

## Guardian Preview

- Shows photo, name, birth date, gender, age, canonical state, guardian message, and optional recorded voice.
- `수정하기` opens `/?tab=subjects&editSubject={subjectId}` with existing values populated.
- `확인` returns to the dashboard.
- Ownership is enforced by the authenticated dashboard query; a guardian cannot select another guardian's subject by changing the query string.

## UI Updates

- The top-right My Page trigger uses a gear icon.
- Notification refresh uses an icon-only control with accessible labels and a loading rotation.
- Dashboard subject cards are keyboard-focusable links with stable desktop and mobile layouts.

## Verification

- `npm run build`
- `npm run security:check`
- `npm run test:qr-claim`
- `git diff --check`
- Local browser load, content, error-overlay, console, and screenshot checks
