# Image Generation Prompts

This file accumulates prompts for diagrams, visual assets, and presentation images needed for the REAL_QR_FIND project.

## 2026-06-12 - Initial Project Concept Visual

### Purpose
- Presentation image for the start of a real QR-based people-finding project.

### Prompt
Create a clean professional system-concept illustration for a project named "REAL_QR_FIND". Show a QR code connecting a finder, a protected user profile, location/contact workflow, and an administrator dashboard. The style should be modern, trustworthy, civic-tech inspired, with clear Korean public-service presentation aesthetics. Use blue, green, white, and neutral gray tones. Avoid cartoon style. Include abstract flow arrows, mobile phone UI, database/security shield, and notification elements. No real personal data.

### Notes
- Use this only as a concept image, not as a final UI design.

## 2026-06-14 - QR Generation And Find URL Flow

### Purpose
- Presentation diagram for the QR code lifecycle now implemented in the admin system.

### Prompt
Create a professional Korean civic-tech flow diagram for "REAL_QR_FIND" showing an administrator generating unique QR codes, storing QR labels and URL-safe public keys in a secure database, printing or distributing QR codes, and a finder scanning a QR that opens a public URL like `/find/{unique-key}`. Include active/inactive status controls, a database table concept, QR image cards, and a mobile find page. Use the same public-service visual style as a Korean government web service: clean white surfaces, blue accents, green success states, red inactive warning states, and clear arrows. Avoid real personal data and avoid cartoon exaggeration.

### Notes
- Use for presentation material explaining how QR records connect to public people-finding URLs.

## 2026-06-14 - Admin Role Management Flow

### Purpose
- Presentation diagram for managing administrators from registered guardian users.

### Prompt
Create a clean Korean public-service style system diagram for "REAL_QR_FIND" administrator role management. Show Google login leading to registered guardian users, a database field `guardians.is_admin`, and an admin page tab labeled "관리자 관리" where an existing admin grants or revokes administrator role for a guardian. Also show environment-based base admins as protected access outside the database. Use white cards, blue civic-tech accents, green enabled states, and neutral gray database/security icons. Avoid real personal information.

### Notes
- Use for explaining the difference between base admins from environment variables and DB-admin users granted through the admin page.
