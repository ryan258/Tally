# Tally — Calorie & Macro Tracker

A fast, offline, install-to-home-screen web app for tracking daily calories, protein, carbs, fat, and water intake, tuned for **small screens such as mobile phones** (dark/light themes, big touch targets, no network needed). Everything is plain HTML/CSS/JS — no build step, no server, no accounts. All data lives in the device's browser storage.

## Features

- **Calories** — log food calories; **calories remaining** = goal − (food − exercise).
- **Full Macros & Micronutrients** — track protein, carbs, fat, fiber, and sugar with live goal progress bars.
- **Water Intake Counter** — track daily glasses of water with simple `+` / `−` controls.
- **Meal Grouping & Timestamps** — organize daily entries by meal (Breakfast 🍳, Lunch 🥗, Dinner 🍽️, Snack 🍎) with timestamps (e.g. `8:30 AM`) and meal sub-totals.
- **Servings & Per-100g Toggle** — support decimal serving multipliers (e.g. 1.5×) or log foods by weight in grams (100g base scaling).
- **Exercise** — log calories burned; they subtract from the day's calorie total.
- **Weekly Calorie Averaging** — view 7-day average daily calories and banked surplus/deficit relative to logged days.
- **Macro-Percentage Goals** — select percentage goal ratios (e.g. 30/40/30 Balanced, 30/50/20 High Carb, 35/25/40 Low Carb) that auto-derive gram targets.
- **1-Tap Undo Toast** — restore deleted entries instantly with a non-blocking 5-second Undo banner.
- **Notes Field** — tag entries with notes (e.g. `🏷️ Post-workout`).
- **Midnight Reset** — totals are keyed to the local calendar date, so at midnight the day automatically starts back at zero.
- **My Foods & USDA Search** — save foods for quick adding, or search standard USDA FoodData Central items live.
- **Emoji Food Icons** — expressive, local icons for foods without image thumbnails.
- **Export / Import** — back up *foods + goals + history* (or just your foods) to a JSON file.
- **Installable & Offline** — "Add to Home Screen" PWA support.

## Install it

Copy these files to any web server — a static host like GitHub Pages, Netlify, or Cloudflare Pages, or your own — then open the URL on your device and install it as a PWA (in most browsers: menu → **Add to Home screen** / **Install app**).

## Moving to a new phone

1. On the old phone: menu (⋯) → **Export backup**. Save/share the `.json` file.
2. On the new phone: open Tally → menu (⋯) → **Import backup** → pick the file.

## Saving and recovery

If browser storage is unavailable or full, a persistent notice says changes are
not being saved; download a backup before closing the tab. Import replaces the
active state only after its backup has been saved successfully, validates
backup payload structures, and retains all goal fields including fiber/sugar and
zero-valued targets.

Malformed saved data is not overwritten at startup. The menu offers **Download
preserved data** for the original bytes; keep that copy before importing a full
backup. No automatic repair or real-data migration is performed. A download
request is not proof that the owner has safely stored/reviewed the file.

Service-worker updates retain unrelated application caches, keep refresh work
alive for its fetch event, and only use the app shell for offline document
navigation (never as an API response).

## Accessibility & Keyboard Navigation

Modal sheets (`#foodSheet`, `#exSheet`, `#manageSheet`, `#goalSheet`, `#menuSheet`)
are fully accessible dialogs with standard `role="dialog"`, `aria-modal="true"`,
and distinct accessible title IDs. When opened, background elements are set to
`inert` and focus is trapped inside the sheet (wrapping forward and backward on `Tab` /
`Shift+Tab`). Pressing `Escape` restores focus to the opener. Private fields such
as the USDA API key are masked by default with an accessible reveal toggle.

## Testing & Verification

The suite runs with `npm test` (or `node --test tests/*.test.js`) with 44 passing
tests across pure helpers, barcode safety, persistence resilience, sheet focus
trapping, and service-worker cache boundaries. CI runs via GitHub Actions on every push
and pull request. Linting is available via `npm run lint`.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The main UI markup, styles, and application controller script. |
| `version.js` | Single source of truth for the version — bump here to update both the UI and the service worker cache. |
| `tally-helpers.js` | Pure utilities for macro ratio derivations, serving scaling, meal grouping, 7-day averages, streak/consistency stats, CSV export, and date formatting. |
| `food-images.js` | Safe barcode lookup, image validation, keyword-to-emoji mapping, and local food-image fallbacks. |
| `manifest.webmanifest` | PWA metadata and home-screen shortcuts. |
| `sw.js` | Service worker for offline caching and isolated cache management. |
| `icon.svg` | App icon (standard "any" purpose). |
| `icon-maskable.svg` | Maskable icon — fills adaptive platform shapes. |
| `tests/*.test.js` | Automated Node test suite (`node --test tests/*.test.js`) covering helpers, barcode safety, storage recovery, accessibility focus trapping, and service worker. |
| [`ROADMAP.md`](ROADMAP.md) | Release milestones, current architecture status, and upcoming enhancement roadmap. |
| [`PROJECT_AUDIT.md`](PROJECT_AUDIT.md) | Code quality audit and enhancement proposals. |
| [`docs/100-ideas-to-enhance-this-app.md`](docs/100-ideas-to-enhance-this-app.md) | Backlog menu of potential features and enhancement ideas. |
| [`docs/phone-setup-instructions.md`](docs/phone-setup-instructions.md) | Mobile installation guide (iOS & Android PWA setup + USDA key). |
| [`docs/github-pages-instructions.md`](docs/github-pages-instructions.md) | GitHub Pages deployment guide & API key security practices. |
