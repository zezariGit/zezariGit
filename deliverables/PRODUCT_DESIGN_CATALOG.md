# Product Design Catalog

## Summary
- Product categories remain in `products` such as sticker, bracelet, necklace, and keyring.
- Each product can now have multiple child designs in `product_designs`.
- A design can store its own selection image and detail-page image.
- New orders store `product_orders.design_id` while keeping the legacy `design_index` for compatibility.

## Database
- `product_designs`
  - `id`: design identifier.
  - `product_id`: parent product.
  - `name`: design name shown to admins and users.
  - `description`: detail-page helper text.
  - `option_image_data_url`: small selection thumbnail used on the design picker.
  - `detail_image_data_url`: detail/preview image used before checkout.
  - `unit_price`: optional design-specific standalone product price.
  - `is_active`: user-facing visibility.
  - `sort_order`: display order.
- `product_orders.design_id`
  - Stores the exact design selected by the guardian.
  - Existing orders without a design continue to render with product-level images.

## Admin Flow
1. Go to `/admin?section=products`.
2. Edit a product card.
3. Upload product representative image for the product selection screen.
4. In the design section, edit each design name, description, option image, detail image, optional price, active state, and sort order.
5. Click `+ 디자인 추가` only when another design is needed.
6. Each click adds one editable design row with thumbnail and detail-image upload controls.
7. Existing product and design images are retained from the database when no new file is uploaded.

## Upload Notes
- Image uploads are stored as data URLs in the database.
- Each image file is limited to 1MB by server validation.
- The admin form does not resubmit existing base64 image data in hidden fields; this prevents Server Action request bodies from growing every time a product is saved.
- `next.config.mjs` sets the Server Action body size limit to 8MB so a representative image plus design thumbnail/detail images can be submitted without hitting the default 1MB limit.

## Admin Layout Notes
- Product cards are aligned to the top of the product-management grid.
- A product with many design rows can grow vertically without stretching the internal layout of the other product cards in the same row.
- Product and design selection images keep their compact fixed thumbnail frames.
- Detail-page image previews do not use a fixed aspect-ratio frame. They follow the available card width and expand vertically using the uploaded image's original aspect ratio.

## User Flow
1. Guardian opens `/shop`.
2. Product category is selected.
3. Design picker shows only the active designs configured by the administrator.
4. If no design is configured yet, checkout continues with the product representative image instead of showing fake design options.
5. Preview step shows the selected design detail image if uploaded.
6. Checkout stores the selected `design_id`.
7. Admin orders and guardian billing history show the selected design name.

## Detail Image Display
- A long vertical detail-page image is displayed at the available page width with automatic height.
- The full detail image remains visible without cropping or being compressed into a short preview frame.
- Responsive width prevents the original image from overflowing narrow mobile screens while preserving its aspect ratio.

## Image Generation Prompt
Create a Korean mobile commerce UI mockup for a QR safety product shop. Show four product categories and, inside one category, a row of animal-shaped design thumbnails, each with a unique design image and a detailed product preview page. Use a restrained public-service style with white cards, civic blue accents, compact Korean labels, and clear checkout progression from product selection to design preview to payment.
