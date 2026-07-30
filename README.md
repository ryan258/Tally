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

## Files

| File | Purpose |
|------|---------|
| `index.html` | The main UI markup and application controller script. |
| `version.js` | Single source of truth for the version — bump here to update both the UI and the service worker cache. |
| `tally-helpers.js` | Pure utilities for macro ratio derivations, serving scaling, meal grouping, 7-day averages, streak/consistency stats, and CSV export. |
| `food-images.js` | Safe barcode lookup, image validation, and local food-image fallbacks. |
| `manifest.webmanifest` | PWA metadata and home-screen shortcuts. |
| `sw.js` | Service worker for offline caching. |
| `icon.svg` | App icon (standard "any" purpose). |
| `icon-maskable.svg` | Maskable icon — fills adaptive platform shapes. |
| [`docs/phone-setup-instructions.md`](docs/phone-setup-instructions.md) | Mobile installation guide (iOS & Android PWA setup + USDA key). |
| [`docs/github-pages-instructions.md`](docs/github-pages-instructions.md) | GitHub Pages deployment guide & API key security practices. |
