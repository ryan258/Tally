# Tally — Calorie & Protein Tracker

A fast, offline, install-to-home-screen web app for tracking daily calories and
protein, tuned for a **Google Pixel 6a** (small OLED screen → dark theme, big
touch targets, no network needed). Everything is plain HTML/CSS/JS — no build
step, no server, no accounts. All data lives in the phone's browser storage.

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

## Run it on the phone

The app uses a service worker, which browsers only enable over `http(s)` or
`localhost` (not `file://`). Serve the folder and open it on the phone.

**Quick local serve (same Wi‑Fi):**

```bash
cd /home/switty/dev/tally
python3 -m http.server 8080
```

Then on the Pixel 6a's Chrome, go to `http://<your-computer-ip>:8080`.
Use Chrome menu → **Add to Home screen** to install it.

**Permanent option:** drop these files on any static host (GitHub Pages,
Netlify, Cloudflare Pages, etc.) and open the URL on the phone. Because it's a
PWA it will keep working offline after the first load.

> Tip: opening `index.html` directly as a `file://` still works for the tracker
> itself — only the offline service worker is skipped.

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
