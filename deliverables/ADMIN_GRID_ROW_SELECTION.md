# Admin Grid Row Selection

## Goal

Administrator master-detail grids use one selection rule: clicking any non-header data cell selects that record and refreshes the detail panel on the right.

## Applied Behavior

- Location shares, safe phones, notifications, message templates, orders, advertisements, subscriptions, guardians, subjects, and QR records retain their existing whole-row Next.js links.
- Payment and coupon rows are now whole-row links. The final `상세보기` cell is a visual label rather than the only clickable area.
- Product rows select from any cell, not only the leading radio control or final detail button.
- Product rows support `Enter` and `Space` when the row itself has keyboard focus.
- Selectable rows use a pointer cursor, a green focus outline, and the existing selected-row highlight.
- Header rows, placeholders, empty rows, dashboards, and audit tables without a right-side detail panel remain non-selectable.

## Regression Guard

Run:

```powershell
npm run test:admin-grid
```

The check confirms that all URL-driven master-detail record rows use whole-row links and that the product catalog retains click and keyboard selection behavior.

## Production Verification

- Feature commit: `bbb3e30`
- Vercel deployment: `dpl_6MS6zX2UX6c6Mj5FqmVfqRKN9KeU`
- Canonical alias: `https://zezari.family`
- Payment: selecting a transaction-type cell changed `paymentRecord` and refreshed the payment detail.
- Coupon: selecting a coupon-code cell changed `coupon` and refreshed the coupon editor.
- Product: selecting a price cell changed `product` and refreshed the product editor.
- The remaining URL-driven master-detail grids rendered their real data rows as whole-row links in the authenticated production administrator session.
- The canonical administrator URL returned HTTP 200, and the production deployment error-log scan found no retained errors.

No record mutation, payment action, or administrator form submission was performed during verification.
