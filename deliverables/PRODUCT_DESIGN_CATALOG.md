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
5. Use the blank "new design" row to add one new design per save.

## User Flow
1. Guardian opens `/shop`.
2. Product category is selected.
3. Design picker shows each active design with its own image.
4. Preview step shows the selected design detail image if uploaded.
5. Checkout stores the selected `design_id`.
6. Admin orders and guardian billing history show the selected design name.

## Image Generation Prompt
Create a Korean mobile commerce UI mockup for a QR safety product shop. Show four product categories and, inside one category, a row of animal-shaped design thumbnails, each with a unique design image and a detailed product preview page. Use a restrained public-service style with white cards, civic blue accents, compact Korean labels, and clear checkout progression from product selection to design preview to payment.
