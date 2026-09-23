-- QR codes are now created only when a subject is registered.
-- Existing unmatched pool rows are removed once; future discarded rows remain
-- so their public URLs can continue to show the expired QR screen.
DELETE FROM qr_codes
WHERE subject_id IS NULL;
