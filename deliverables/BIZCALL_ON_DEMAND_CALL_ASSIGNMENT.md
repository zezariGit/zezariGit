# Bizcall On-Demand Call Assignment

The active design and verification record is maintained in `BIZCALL_SAFE_PHONE_POOL.md`.

Key decision: REAL_QR_FIND does not preload or cap a local inventory of 050 numbers. The server calls Bizcall `auto_expire_mapp` only after a finder presses the call button, records the provider-selected number, and relies on the contract inventory for horizontal capacity.

Security values, real phone numbers, and assigned virtual numbers are intentionally excluded from this deliverable.
