# Ideas to Enhance Tally

A backlog of possible improvements for the Tally calorie & protein tracker. Grouped
by theme. Nothing here is committed work — it's a menu. Most items are small; a few
are meaningful features. Difficulty is a rough guide (S = an hour or two, M = a day,
L = a project).

The numbers are stable IDs from the original list of 100 — they never get reused or
renumbered, so `43` means the same thing forever. Shipped ideas are removed from this
file and recorded in [CHANGELOG.md](../CHANGELOG.md); the gaps in the numbering are
the done ones. **55 of 100 remain.**

---

## Tracking & data model

- `8` **Recent foods list** — surface the last 10 things you logged, not just saved foods. (S)
- `9` **Most-logged foods** ranking to reorder quick-add by frequency. (M)
- `10` **Duplicate an entry** with one tap. (S)
- `15` **Barcode-style food ID** stored with saved foods for future scanning. (M)

## Goals & targets

- `17` **Separate weekday / weekend goals**. (M)
- `19` **TDEE calculator** from height/weight/age/activity to suggest a goal. (M)
- `20` **Goal presets** — cut / maintain / bulk buttons. (S)
- `21` **Protein-per-kg-bodyweight helper** to set the protein goal. (S)
- `22` **Calorie deficit/surplus indicator** vs. goal, not just "remaining". (S)
- `23` **Adjustable goal per day** (planned refeed days). (M)
- `24` **"Calories left per meal" hint** based on remaining budget and time of day. (M)

## Insights & history

- `28` **History browser** — swipe back to view and edit past days. (M)
- `29` **Calendar heatmap** of goal adherence (green = hit, red = over). (M)
- `30` **Weight log** with a simple line chart alongside intake. (M)
- `31` **Correlate weight trend with average intake** over time. (L)
- `35` **Best protein sources** — which of your foods delivered the most protein this week. (M)

## USDA / food search

- `36` **Cache recent USDA results** so repeat searches are instant and offline. (M)
- `37` **Show serving size** from USDA data, not just per-100g. (M)
- `38` **Brand/generic filter** on USDA search results. (S)
- `39` **"Add to my foods" directly** from a USDA suggestion. (S)
- `40` **Fallback food database** bundled locally for common foods when no API key. (M)
- `41` **Open Food Facts** as an alternative/second source. (L)
- `42` **Search result count / "more results"** pagination. (S)
- `43` **Remember the last-used serving** for a USDA food. (M)
- `44` **Fuzzy/typo-tolerant matching** on saved-food search. (S)
- `45` **Validate the USDA key** on entry with a test call + checkmark. (S)

## Barcode & camera

- `46` **Barcode scanner** via the device camera (BarcodeDetector API). (L)
- `47` **Photo attachment** on an entry for a visual food journal. (M)
- `48` **OCR a nutrition label** to auto-fill calories/protein. (L)

## Accessibility

- `68` **High-contrast theme** option. (M)
- `70` **Font-size setting** independent of system. (M)

## PWA & offline

- `71` **Update prompt** — "New version available, tap to reload" when the SW updates. (M)
- `73` **Background sync** for queued USDA searches made while offline. (L)
- `75` **Share target** — share a food name into Tally from another app. (L)
- `76` **Periodic background reminder** to log dinner (Notifications + Periodic Sync). (L)
- `77` **Install prompt** button when `beforeinstallprompt` fires. (S)
- `78` **Screenshot entries** in the manifest for a richer install card. (S)

## Reminders & notifications

- `79` **Local notification** if you haven't logged by a set time. (M)
- `80` **Protein-behind nudge** in the afternoon if you're under pace. (M)
- `81` **Configurable reminder times**. (S)
- `82` **End-of-day summary notification**. (M)

## Backup & sync

- `83` **Auto-export reminder** every N days. (S)
- `84` **Import merge mode** for history (add days without wiping current). (M)
- `85` **Optional cloud sync** via a user-provided Gist/Dropbox token. (L)
- `86` **QR-code transfer** of foods between two phones. (M)
- `88` **Encrypted export** with a passphrase. (M)

## Templates & speed

- `89` **Meal templates** — save "usual breakfast" as one multi-food entry. (M)
- `90` **Copy yesterday's log** to today. (S)
- `91` **Bulk-add** several foods in one sheet. (M)
- `92` **Recipe builder** — combine foods into one saved item with summed macros. (L)
- `93` **Quick-add calories only** (no name) for a fast estimate. (S)

## Exercise

- `94` **Exercise presets** like saved foods (Walk 30min = 150 cal). (S)
- `95` **Step/activity import** from HealthKit / Google Fit. (L)
- `96` **Exercise type icons** (run, lift, walk) instead of one 🔥. (S)
- `97` **Net vs gross calorie toggle** — choose whether exercise adds back budget. (M)

---

*Keep the app small. Adopt an idea only when you'd actually use it — most of this list
should stay a list.*
