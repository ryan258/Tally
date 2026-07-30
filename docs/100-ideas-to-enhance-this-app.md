# 100 Ideas to Enhance Tally

A backlog of possible improvements for the Tally calorie & protein tracker. Grouped
by theme. Nothing here is committed work — it's a menu. Most items are small; a few
are meaningful features. Difficulty is a rough guide (S = an hour or two, M = a day,
L = a project).

---

## Tracking & data model

1. **Track carbs and fat**, not just calories and protein. (M)
2. **Track fiber and sugar** as optional secondary nutrients. (M)
3. **Water intake counter** with a daily glass/oz goal. (S)
4. **Meal grouping** — tag entries as breakfast / lunch / dinner / snack. (M)
5. **Timestamp each entry** so the log shows *when* you ate. (S)
6. **Editable serving quantity** — log "2× Egg" instead of adding twice. (M)
7. **Per-100g vs per-serving toggle** when saving a food. (M)
8. **Recent foods list** — surface the last 10 things you logged, not just saved foods. (S)
9. **Most-logged foods** ranking to reorder quick-add by frequency. (M)
10. **Duplicate an entry** with one tap. (S)
11. **Undo last delete** via the toast ("Deleted — Undo"). (S)
12. **Negative-calorie sanity cap** — warn if a single entry exceeds e.g. 5000 cal (likely a typo). (S)
13. **Decimal serving support** for protein powders measured in scoops. (S)
14. **Notes field** on an entry ("post-workout", "cheat meal"). (S)
15. **Barcode-style food ID** stored with saved foods for future scanning. (M)

## Goals & targets

16. **Weekly calorie averaging** — bank surplus/deficit across the week. (M)
17. **Separate weekday / weekend goals**. (M)
18. **Macro-percentage goals** (e.g. 40/30/30) that derive gram targets. (M)
19. **TDEE calculator** from height/weight/age/activity to suggest a goal. (M)
20. **Goal presets** — cut / maintain / bulk buttons. (S)
21. **Protein-per-kg-bodyweight helper** to set the protein goal. (S)
22. **Calorie deficit/surplus indicator** vs. goal, not just "remaining". (S)
23. **Adjustable goal per day** (planned refeed days). (M)
24. **"Calories left per meal" hint** based on remaining budget and time of day. (M)

## Insights & history

25. **7-day / 30-day trend charts** for calories and protein. (M)
26. **Streak counter** — consecutive days you hit your protein goal. (S)
27. **Weekly summary card** — averages, best/worst day, goal-hit rate. (M)
28. **History browser** — swipe back to view and edit past days. (M)
29. **Calendar heatmap** of goal adherence (green = hit, red = over). (M)
30. **Weight log** with a simple line chart alongside intake. (M)
31. **Correlate weight trend with average intake** over time. (L)
32. **Protein-goal hit rate** as a headline stat. (S)
33. **"You logged X days this month"** consistency nudge. (S)
34. **Export history as CSV** for spreadsheet analysis. (S)
35. **Best protein sources** — which of your foods delivered the most protein this week. (M)

## USDA / food search

36. **Cache recent USDA results** so repeat searches are instant and offline. (M)
37. **Show serving size** from USDA data, not just per-100g. (M)
38. **Brand/generic filter** on USDA search results. (S)
39. **"Add to my foods" directly** from a USDA suggestion. (S)
40. **Fallback food database** bundled locally for common foods when no API key. (M)
41. **Open Food Facts** as an alternative/second source. (L)
42. **Search result count / "more results"** pagination. (S)
43. **Remember the last-used serving** for a USDA food. (M)
44. **Fuzzy/typo-tolerant matching** on saved-food search. (S)
45. **Validate the USDA key** on entry with a test call + checkmark. (S)

## Barcode & camera

46. **Barcode scanner** via the device camera (BarcodeDetector API). (L)
47. **Photo attachment** on an entry for a visual food journal. (M)
48. **OCR a nutrition label** to auto-fill calories/protein. (L)

## UI & UX

*Items 49–64 implemented in v1.2.0 — see [CHANGELOG.md](file:///Users/ryanjohnson/Projects/Tally/CHANGELOG.md)*

## Accessibility

65. **ARIA live region** announcing totals after each add/delete. (S)
66. **Focus management** — move focus into a sheet when it opens, restore on close. (S)
67. **Reduced-motion support** (`prefers-reduced-motion`) for sheet/bar transitions. (S)
68. **High-contrast theme** option. (M)
69. **Screen-reader labels** on the progress bars (value + goal). (S)
70. **Font-size setting** independent of system. (M)

## PWA & offline

71. **Update prompt** — "New version available, tap to reload" when the SW updates. (M)
72. **Offline indicator** in the header. (S)
73. **Background sync** for queued USDA searches made while offline. (L)
74. **App shortcuts** (manifest `shortcuts`) — jump straight to "Add food". (S)
75. **Share target** — share a food name into Tally from another app. (L)
76. **Periodic background reminder** to log dinner (Notifications + Periodic Sync). (L)
77. **Install prompt** button when `beforeinstallprompt` fires. (S)
78. **Screenshot entries** in the manifest for a richer install card. (S)

## Reminders & notifications

79. **Local notification** if you haven't logged by a set time. (M)
80. **Protein-behind nudge** in the afternoon if you're under pace. (M)
81. **Configurable reminder times**. (S)
82. **End-of-day summary notification**. (M)

## Backup & sync

83. **Auto-export reminder** every N days. (S)
84. **Import merge mode** for history (add days without wiping current). (M)
85. **Optional cloud sync** via a user-provided Gist/Dropbox token. (L)
86. **QR-code transfer** of foods between two phones. (M)
87. **Backup file versioning** with a schema version field. (S)
88. **Encrypted export** with a passphrase. (M)

## Templates & speed

89. **Meal templates** — save "usual breakfast" as one multi-food entry. (M)
90. **Copy yesterday's log** to today. (S)
91. **Bulk-add** several foods in one sheet. (M)
92. **Recipe builder** — combine foods into one saved item with summed macros. (L)
93. **Quick-add calories only** (no name) for a fast estimate. (S)

## Exercise

94. **Exercise presets** like saved foods (Walk 30min = 150 cal). (S)
95. **Step/activity import** from HealthKit / Google Fit. (L)
96. **Exercise type icons** (run, lift, walk) instead of one 🔥. (S)
97. **Net vs gross calorie toggle** — choose whether exercise adds back budget. (M)

## Housekeeping & quality

98. **Tie `sw.js` CACHE name to `VERSION`** so a bump can't be forgotten. (S)
99. **A tiny test harness** (`test.html`) exercising totals/sanitizers/rollover with asserts. (M)
100. **Data-size warning** — nudge to export if history grows large in `localStorage`. (S)

---

*Keep the app small. Adopt an idea only when you'd actually use it — most of this list
should stay a list.*
