# Tally — Calorie & Protein Tracker

A fast, offline, install-to-home-screen web app for tracking daily calories and
protein, tuned for **small screens such as mobile phones** (dark theme, big
touch targets, no network needed). Everything is plain HTML/CSS/JS — no build
step, no server, no accounts. All data lives in the device's browser storage.

## Features

- **Calories** — log food calories; **calories remaining** = goal − (food − exercise).
- **Protein** — every food entry tracks grams of protein toward a daily goal.
- **Exercise** — log calories burned; they subtract from the day's calorie total.
- **Midnight reset** — totals are keyed to the local calendar date, so at
  midnight the day automatically starts back at zero (survives the app being
  closed or the phone sleeping). Past days are kept in storage and included in
  your backup export, but the app only shows the current day — there's no
  in-app history view; you read older days from the exported JSON.
- **My foods** — save foods you eat often for quick adding. The saved list is
  collapsed by default; tap **Show foods** to expand it, then tap a food to log
  it (the list collapses again afterward). Saved foods also power the type-ahead
  suggestions when you add a food by name.
- **Editable goals** — tap the goal pill to set your calorie / protein targets.
- **Export / Import** — back up *foods + goals + history* (or just your foods)
  to a JSON file, then import it on another phone to move everything over.
- **Installable & offline** — "Add to Home Screen" makes it run full-screen like
  a native app and work with no connection.

## Install it

Copy these files to any web server — a static host like GitHub Pages, Netlify,
or Cloudflare Pages, or your own — then open the URL on your device and install
it as a PWA (in most browsers: menu → **Add to Home screen** / **Install app**).
Because it's a PWA it runs full-screen like a native app and keeps working
offline after the first load.

> The app uses a service worker, which browsers only enable over `http(s)` (not
> `file://`). Opening `index.html` directly as a `file://` still works for the
> tracker itself — only the offline service worker is skipped.

## Moving to a new phone

1. On the old phone: menu (⋯) → **Export backup**. Save/share the `.json` file.
2. On the new phone: open Tally → menu (⋯) → **Import backup** → pick the file.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The whole app (UI + logic + storage). |
| `manifest.webmanifest` | PWA metadata for installing to the home screen. |
| `sw.js` | Service worker for offline caching. |
| `icon.svg` | App icon. |
