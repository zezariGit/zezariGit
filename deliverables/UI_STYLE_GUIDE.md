# UI Style Guide

Project: REAL_QR_FIND / zezari

## Status
- Implemented.

## Base Style
- The project now uses `css/gov-style.css` as the shared design base.
- It provides the public-sector / neutral minimal light-blue style tokens and common component classes.

## Global Application
- `app/layout.js` imports:
  - `../css/gov-style.css`
  - `./globals.css`
- `gov-style.css` is loaded first.
- `app/globals.css` keeps app-specific layout rules and maps existing custom classes to the gov-style design tokens.

## Design Tokens
- Primary color:
  - `--c-primary`
  - `--c-primary-dark`
  - `--c-primary-light`
- Surface/background:
  - `--c-bg`
  - `--c-surface`
- Text:
  - `--c-text`
  - `--c-text-muted`
- State colors:
  - success, warning, danger, info token groups

## Existing Pages Covered
- Login
- Onboarding
- Guardian dashboard
- Information entry
- Admin page
- PWA install UI

## Future Page Guidance
- New pages should use `gov-style.css` utility/component classes where practical:
  - `.container`
  - `.card`
  - `.btn`
  - `.btn-primary`
  - `.btn-secondary`
  - `.form-input`
  - `.form-select`
  - `.table-wrap`
  - `.badge`
  - `.alert`
- App-specific custom classes should use the `--c-*` tokens from `gov-style.css`.
- Avoid introducing unrelated color palettes unless the product direction changes.

## PWA Theme
- Manifest and viewport theme color were updated to the gov-style primary blue:
  - `#2e86c1`
