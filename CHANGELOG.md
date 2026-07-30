# Changelog

All notable changes to the Tally calorie & protein tracker project will be documented in this file.

## [1.3.0] - 2026-07-30

### Added — Tracking, Data Model & Goal Enhancements (Ideas 1–7, 11, 13, 14, 16, 18)

- **1 & 2. Carbs, Fat, Fiber & Sugar Tracking**: Added full macro and micronutrient tracking (Carbs, Fat, Fiber, Sugar) across log entries, saved foods, summary dashboard, export/import, and USDA search.
- **3. Water Intake Counter**: Added an interactive daily water counter (`💧 Water Intake`) with `+` / `−` glass tracking and daily targets.
- **4. Meal Grouping**: Added meal section tags (**Breakfast 🍳**, **Lunch 🥗**, **Dinner 🍽️**, **Snack 🍎**) with meal sub-totals.
- **5. Timestamp Each Entry**: Recorded creation timestamps for food and exercise log entries, displayed on today's log.
- **6 & 13. Editable Decimal Serving Quantity**: Added decimal quantity support (e.g. `1.5×`, `0.5×`) in food entry sheets with dynamic nutrient scaling.
- **7. Per-100g vs Per-Serving Toggle**: Added a unit mode toggle switch ("Per serving" vs "Per 100g weight") for proportional nutrient logging by weight in grams.
- **11. Single-Item Delete Undo**: Replaced deletion confirmations with a 1-tap **Undo** toast (`Deleted [Food Name]`) restoring log items to their exact position.
- **14. Entry Notes Field**: Added optional `Notes` input field for food and exercise entries rendered as tags (e.g. `🏷️ Post-workout`).
- **16. Weekly Calorie Averaging**: Added a 7-day average calorie card displaying daily average intake and banked surplus/deficit relative to logged days.
- **18. Macro-Percentage Goals**: Added macro percentage ratio presets (30/40/30 Balanced, 30/50/20 High Carb, 35/25/40 Low Carb) auto-calculating gram targets from daily calorie goals.

### Fixed
- **Manual Servings Scaling**: Fixed manual food entry servings scaling by dynamically syncing manual inputs to base nutrients.
- **Base Nutrient Scope**: Fixed leak of `baseFoodNutrients` across sheet modes and hid servings wrap in Edit / New Saved food modes.
- **Quick-Add Meal Tagging**: Fixed quick-add chips to dynamically infer current meal tag rather than using stale initial state.
- **Weekly Bank Calculation**: Corrected 7-day bank deficit/surplus calculation to scale target relative to logged days only instead of unlogged days.
- **USDA Exact ID Matching**: Refactored USDA nutrient parsing to match exact USDA nutrient ID numbers (1008, 1003, 1005, 1004, 1079, 2000) instead of loose substrings.
- **Refactored `logFood` Signature**: Updated `logFood` to accept a clean options object.
- **CSS Text Ellipsis**: Fixed text truncation on long item names inside flex container log rows.
- **Goal Load Migration**: Preserved intentional `0` values in goal migration checks.

## [1.2.0] - 2026-07-30

### Added — UI & UX Enhancements (Ideas 49–64)

- **49. Light theme / System-preference theme toggle**: Added Dark, Light, and System Auto theme modes with custom CSS tokens for crisp high-contrast light mode.
- **50. Swipe-to-delete on log rows**: Added smooth touch swipe-left gestures to delete food/exercise entries on mobile touchscreens.
- **51. Drag-to-reorder saved foods**: Added drag handles (`⋮⋮`) in My Foods to reorder saved foods with automatic persistent storage.
- **52. Haptic feedback**: Integrated `navigator.vibrate` for physical haptic pulses on adding entries, deleting, and chip interactions.
- **53. Pull-to-refresh**: Added pull-down gesture at top of screen to trigger manual rollover checks.
- **54. Ring/donut progress for calories**: Replaced/complemented calorie bar with a responsive SVG Donut Ring gauge.
- **55. Animated count-up on remaining calories**: Animated numeric transitions (`requestAnimationFrame`) for calorie and protein counters.
- **56. Collapse summary on scroll**: Added a compact sticky header summary bar when scrolling down the page.
- **57. Search box in "My foods"**: Added live filter input (`#manageSearch`) inside the My Foods sheet.
- **58. Food categories & emoji**: Added custom and auto-detected emoji icons (🥚, 🍗, 🥣, 🍌, 🥤, etc.) for quick scanning on chips and logs.
- **59. Empty-state illustrations**: Added clean SVG vector empty-state graphics for empty logs and empty food lists.
- **60. Confirm-on-clear-day toast with undo**: Replaced blocking `confirm()` modal with a non-blocking toast offering a 5-second **Undo** button.
- **61. Larger tap targets audit**: Standardized minimum touch target sizes ($\ge 48\text{px} \times 48\text{px}$) for one-handed phone use.
- **62. Keyboard "next" flow**: Enabled `enterkeyhint` sequence (`Name` → `Calories` → `Protein` → `Submit`) on food input fields.
- **63. Sticky "Add" button inside sheets**: Sticky action button containers in bottom sheets for easy reach on long content.
- **64. Prominent goal-exceeded state**: Highlighted calorie card with warning dark red gradient, bad border color, and warning badge when budget is exceeded.

### Fixed
- **Stored XSS Security Fix**: Escaped `emoji` across all render sites (`esc(emoji)`) and clamped imported emoji length to 10 chars.
- **Service Worker Cache Bumping**: Corrected `sw.js` cache version to `tally-v7`.
- **UI & Layout Fixes**: Restored missing `.empty-note` CSS styling, fixed `<small>` element loss on calorie counter animations, and preserved custom emojis when quick-adding foods.

## [1.1.0] - 2026-07-29

### Added
- **USDA FoodData Central Live Search**: Integrated live food search with calories and protein lookup.
- **Device-Local API Key Storage**: Stored USDA API key in browser `localStorage` to keep keys private on static GitHub Pages.

## [1.0.0] - 2026-07-29

### Added
- Initial release of Tally — Calorie & Protein Tracker PWA.
