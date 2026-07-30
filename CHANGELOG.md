# Changelog

All notable changes to the Tally calorie & protein tracker project will be documented in this file.

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
