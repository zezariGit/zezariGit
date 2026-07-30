# Guardian-First Product Selection

Project: REAL_QR_FIND / zezari

## Requirement
- Replace the category-card-first shop flow with three select boxes.
- Select a managed subject first, then a product, then a Korean zodiac design.
- Keep the existing preview, shipping, coupon, Toss payment, administrator payment-pass, order, and QR activation flows.

## Selection Order
1. `나의 관리대상`
2. `상품`
3. `디자인`
4. Quantity
5. Product preview
6. Shipping, coupon, and payment

## Product Options
- 팔찌
- 목걸이
- 키링
- 팔찌&목걸이
- 목걸이&키링
- 팔찌&목걸이&키링
- 스티커

The three combination choices are stored as normal catalog products. This preserves the existing one-product-per-order contract and allows administrators to manage their representative image, detail images, price, active state, and designs without introducing a separate cart schema.

## Zodiac Designs
- 쥐, 소, 호랑이, 토끼, 용, 뱀, 말, 양, 원숭이, 닭, 개, 돼지.
- Each product owns its own design rows, so administrators can upload different thumbnails and detail pages for the same zodiac animal on different products.
- The shop displays only active designs whose names match the twelve zodiac options.

## Pricing
- Purchase uses the selected design's price when configured; otherwise it uses the product price.
- Default combination prices are the sum of their included base products.
- Product purchase includes continuing QR service without a separate period or standalone-purchase choice.
- Coupon eligibility and discount validation remain server-calculated.

## Data Compatibility
- Existing products, designs, and orders are retained.
- New combination products and missing zodiac designs are inserted only when absent.
- `product_orders.product_id` and `product_orders.design_id` continue to identify the exact purchased option.
- Production Turso schema version is `27`.

## Verification
- Seven required product slugs exist in production.
- Each required product has twelve active zodiac design names.
- Next.js production build passes.
- Existing Toss preparation APIs receive the newly selected product and design IDs without a request-contract change.
- GitHub `main` commit `87c43a7` was deployed through Vercel deployment `dpl_GumWVzpyDT6dXpverJ1Lgihznztj`.
- `https://zezari.vercel.app` and `https://zezari.vercel.app/shop` returned HTTP 200 after the production alias was assigned.
