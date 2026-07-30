# Product-Included QR Service

Project: REAL_QR_FIND / zezari

## Requirement
- Remove the `이용기간` and `상품 단독 구매` choice from the guardian shop.
- Charge only the selected product/design price.
- Include continuing managed-subject QR service with the product purchase.

## User Flow
1. Select a managed subject.
2. Select a product and zodiac design.
3. Select quantity and review the product price.
4. Continue through preview, shipping address, coupon, and Toss payment.
5. Receive the product and activate its QR.
6. Continue using the managed-subject public QR page without a separate period purchase or expiry date.

## Data Rules
- New service-included product orders continue to use the established `subscription` order callback path for Toss compatibility, with `plan_months = 0` as the permanent-service marker.
- `subscriptions.access_type = product_lifetime` identifies continuing product-based access.
- A waiting order creates `subscriptions.status = ready`; QR activation changes it to `active`.
- `product_lifetime` access has no `current_period_end` and is excluded from expiry normalization and period-pause controls.
- Existing period subscriptions remain `access_type = periodic` and retain their start/end dates.

## Pricing And Reporting
- Checkout subtotal is `selected design unit price x quantity`; the product price is used when the design has no override price.
- Coupon and final-payment amounts remain validated on the server.
- New `plan_months = 0` payments are counted as product revenue, not subscription-period revenue.
- Administrator payment pass still follows the same completion and QR activation states without creating real Toss revenue.

## Compatibility
- Existing products, designs, orders, and period subscriptions are not deleted or rewritten.
- The old standalone order and payment preparation APIs return HTTP 410 so cached clients cannot create the removed purchase type.
- Internal Toss callback URLs remain stable to avoid breaking payment completion links already in flight.

## Verification
- Next.js production build passes.
- Production Turso migrated to schema version `27`.
- `subscriptions.access_type` exists with default `periodic`.
- Existing subscription rows remain `periodic` after migration.
- A public QR page request succeeded after the migration.
- GitHub `main` commit `10514ab` was deployed through Vercel deployment `dpl_8R2gi56J4EdM2xLVMsBfsn5NxkCW`.
- Production home, shop, and public find routes returned HTTP 200; removed standalone APIs returned HTTP 410.
