# Tally Roadmap & Milestones

Tally is a fast, offline-first personal calorie and nutrition tracker built for mobile screens with zero build steps, zero external dependencies, and complete data ownership in device storage.

---

## Current Status: v1.5.0 + Storage, Offline & Accessibility Hardening

All core tracking, insights, offline resilience, and sheet accessibility features are implemented and verified across 44 automated Node test cases (`node --test tests/*.test.js` or `npm test`).

### Shipped Milestones

- **v1.0.0 — Core Tracker & USDA Search**
  - Instant calorie and protein logging with daily calorie target countdown.
  - Go-to foods list for single-tap addition.
  - USDA FoodData Central integration using device-local API key.
  - Local JSON export and import for device migration.

- **v1.2.0 — UI/UX Polish & Themes**
  - Editorial Pop Art theme styling with high-contrast touch targets.
  - Light, Dark, and Auto theme switching.
  - Pointer-based drag-and-drop reordering for saved go-to foods.

- **v1.3.0 — Complete Macro Tracking & Meals**
  - Full macro tracking: Carbs, Fat, Fiber, and Sugar with dynamic progress bars.
  - Water intake counter with daily glasses target and 1-tap logging.
  - Meal grouping (Breakfast 🍳, Lunch 🥗, Dinner 🍽️, Snack 🍎) with meal sub-totals.
  - Decimal serving multiplier (e.g., `1.5×`) and per-100g weight mode.
  - Timestamps on log entries and optional entry notes (tags).
  - 1-tap Undo banner for accidental deletions.
  - 7-day average daily intake and surplus/deficit banking.
  - Macro ratio goal presets (Balanced 30/40/30, High Carb 30/50/20, Low Carb 35/25/40).

- **v1.4.0 — PWA, Accessibility & Housekeeping**
  - Single source of truth for versioning (`version.js`) shared by app and service worker.
  - PWA home-screen app shortcuts for fast food/activity logging.
  - ARIA live announcements for screen readers and accessible progress bars.
  - "Offline" status pill indicator.
  - CSV history export with proper escaping and formatting.
  - Storage size warnings and backup schema versioning.
  - Initial Node test harness (`tests/tally-features.test.js`).

- **v1.5.0 — Insights, Trends & View Switcher**
  - 7-Day and 30-Day visual trend bar charts for calories and protein.
  - Weekly summary card with average intake, best day, and highest day.
  - View switcher tab bar toggling between **Today** and **Insights** panes.
  - 30-day Homer Simpson demo dataset for instant feature exploration.

- **Storage Persistence & Service Worker Resilience**
  - **Corrupt Storage Preservation**: Unreadable or malformed `localStorage` data is preserved on startup rather than wiped, exposing a **Download preserved data** menu action.
  - **Atomic Storage Updates**: State mutations during backup import, go-to merging, or resets occur only when storage writes succeed; failures leave current data intact.
  - **Zero-Valued Goal Retention**: Retains zero-valued targets and preserved fiber/sugar targets across backup sanitization.
  - **Service Worker Isolation**: Activation cleans only `tally-v*` cache versions, leaving unrelated caches on the same origin undisturbed.
  - **Resilient Offline Shell**: Offline fallback is strictly restricted to document navigation (`mode === "navigate"`), preventing HTML from being served for failed API or resource calls.
  - **Background Cache Lifecycles**: Cache refreshes are kept alive via `waitUntil` without blocking or delaying network responses.

- **Accessibility Hardening, UI Polish & Security (Current)**
  - **Accessible Sheet Dialogs & Focus Trapping**: All sheets now use native `inert`, `role="dialog"`, `aria-modal="true"`, and accessible heading labels (`aria-labelledby`). When opened, sibling page elements become `inert`. Keyboard focus wraps smoothly on `Tab` and `Shift+Tab`, skipping hidden/disabled items, and restores to the triggering control on `Escape`.
  - **Restored CSS Layout & Component Styles**: Added complete styling for `.row2` two-column inputs, `.suggest` typeahead item badges, `.empty-state` banners, `.collapsible-btn` secondary nutrient toggles, `.theme-picker` buttons, and `.manage-item` drag rows.
  - **USDA API Key Masking**: The USDA key input in the Settings menu is masked as a password with a dedicated accessible show/hide toggle button (`#toggleUsdaKey`), and automatically re-masks whenever the sheet closes.
  - **Unified Emoji Detection**: Single source of truth in `food-images.js` (`TallyFoodImages.detectEmoji`) for food keywords to emoji mapping with generic fallback.
  - **Strict Backup Payload Validation**: Non-object or array-wrapped JSON backups are safely rejected with user feedback before touching memory or storage.
  - **Tooling & CI Automation**: Integrated ESLint, Prettier, and GitHub Actions CI workflow running 44 automated tests.

---

## Upcoming Priorities

Drawn from the backlog menu in [`docs/100-ideas-to-enhance-this-app.md`](docs/100-ideas-to-enhance-this-app.md):

### 1. Tracking Speed & Convenience
- **Recent Foods List** (`#8`) — Surface the last 10 logged items for fast re-logging without searching.
- **Duplicate Entry** (`#10`) — 1-tap copy of any entry from earlier today.
- **Quick-Add Calories Only** (`#93`) — Fast calorie entry without requiring a food name or full macro breakdown.

### 2. Goal Flexibility
- **Calorie Deficit / Surplus Indicator** (`#22`) — Show whether intake is running at a surplus or deficit against target.
- **TDEE Calculator** (`#19`) — Simple in-app calculator estimating maintenance calories from height, weight, age, and activity level.
- **Weekday vs. Weekend Targets** (`#17`) — Separate goal targets for weekdays vs. weekends.

### 3. Insights & Analytics
- **History Browser** (`#28`) — Swipe or step back to inspect and edit entries from previous days.
- **Adherence Heatmap** (`#29`) — Monthly calendar view showing days goal was met.
- **Protein Source Breakdown** (`#35`) — Summary of foods providing the highest protein contribution over the last 7 days.

### 4. Barcode Scanning
- **Camera Barcode Scanner** (`#46`) — Utilize standard browser `BarcodeDetector` API to scan product barcodes directly into Open Food Facts search.

### 5. Backup & Sync
- **Periodic Export Reminder** (`#83`) — Lightweight reminder toast prompting export after significant logging history.
- **History Merge Mode** (`#84`) — Option to merge imported history days without replacing existing records.
