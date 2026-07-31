# REAL_QR_FIND Dynamic Product Catalog

## Purpose

- Let administrators manage the products shown in the guardian purchase select box.
- Keep the existing product-design structure and zodiac design selection.
- Support long vertical product detail images without forcing them into a fixed-height frame.

## Administrator Features

- Add a new product with name, price, display order, description, representative image, and long detail-page image.
- View every purchase product in one dense grid with thumbnail, name, price, visibility, order, and detail-page registration status.
- Select one grid row and edit only that product in a fixed right-side detail panel, so one product's content never changes another product's layout.
- Switch the detail panel between `상품 정보` and `디자인 관리` tabs; every tab scrolls inside the fixed panel.
- Initialize each new product with the existing 12 zodiac design names so design selection remains available immediately.
- Activate or hide each product from the guardian purchase screen.
- Edit the same fields for existing products.
- Keep product-specific design rows, design images, design prices, visibility, and design detail images unchanged.
- Representative images allow up to 1MB; product detail-page images allow up to 4MB.
- A newly created product returns to the administrator page with that product selected for immediate follow-up editing.

## Guardian Purchase Integration

- `/shop` reads all active products from the database instead of a fixed slug allow-list.
- Products are ordered by the administrator's display order and then by Korean product name.
- Product selection immediately updates the price, description, representative image, and available designs.
- The preview shows the product's long detail page at its original aspect ratio.
- When a selected design also has a separate detail image, it is shown as an additional design-detail section.

## Data And Performance

- `products.detail_image_data_url` stores the product-level detail image.
- `products.detail_image_name` stores the original file name.
- The product list returns only a `has_detail_image` marker rather than embedding the large image body.
- `/api/products/{id}/detail` streams the selected detail image on demand with cache headers.
- Database schema version: 28.

## Verification

- `npm run build` must pass.
- `git diff --check` must pass.
- The Turso `products` table must contain both detail-image columns.
- An administrator can open the new-product form and existing product editors.
- The product grid keeps stable columns and both the grid and detail panel provide internal scrolling when data grows.
- Selecting another product row immediately changes the right-side editor without a page request.
- Active products appear in the guardian product select box; hidden products do not.
- A long product detail image renders at natural width and proportional height in the purchase preview.
- A temporary inactive product image request returns HTTP 200 with its original image MIME type, and the test product is removed afterward.
- PASS: An authenticated production administrator opened the new-product form and existing product editors.
- PASS: A temporary active product with 12 zodiac rows appeared in the guardian product select box; selecting it updated the price and description.
- PASS: The temporary product and design rows were removed, restoring the original seven active products.
- PASS: The redesigned production administrator screen displayed seven products in a dense grid with a non-overlapping fixed detail panel at a 1440px viewport.
- PASS: Selecting `팔찌` changed the editor name, price, selected radio, and URL immediately without a server navigation.
- PASS: The `디자인 관리` tab displayed 12 rows inside a fixed-height internal scroll area, and the new-product panel exposed both thumbnail and long detail-page uploads.
- PASS: The guardian product select retained the seven active products and the selected product retained all twelve zodiac design options.

## 2026-07-31 Deployment

- GitHub commit: `571a773`
- Vercel production deployment: `dpl_7YtMvwc4KVPGNPtT4TWsAfoBHFEX` (`READY`)
- Production aliases: `https://zezari.family`, `https://zezari.vercel.app`
- Both aliases and their administrator product routes returned HTTP 200.
