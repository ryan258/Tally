# Phone Setup & App Installation Guide

This guide explains how to install **Tally** on your mobile phone (iPhone or Android) as a standalone Progressive Web App (PWA) and set up live food search.

---

## 1. iPhone (iOS) Installation

1. Open **Safari** on your iPhone *(iOS requires Safari for home screen PWA installation)*.
2. Navigate to your live app URL:
   ```
   https://ryan258.github.io/Tally/
   ```
3. Tap the **Share** button at the bottom of the screen (the square icon with an upward arrow `[↑]`).
4. Scroll down the share menu and tap **Add to Home Screen**.
5. Tap **Add** in the top-right corner.
6. Launch Tally from your Home Screen. It will run in full-screen mode like a native app.

---

## 2. Android Installation

1. Open **Google Chrome** (or your primary browser) on your phone.
2. Navigate to your live app URL:
   ```
   https://ryan258.github.io/Tally/
   ```
3. Tap the **three dots menu (⋮)** in the top right.
4. Select **Install app** or **Add to Home screen**.
5. Confirm by tapping **Install**.

---

## 3. Setting Up USDA Live Search

Tally supports live nutrition search using the official USDA FoodData Central database:

1. Obtain a free API key from [USDA FoodData Central](https://fdc.nal.usda.gov/api-guide.html) (takes ~30 seconds).
2. Open **Tally** on your phone.
3. Tap the **Menu (⋯)** button in the top right.
4. Scroll to **USDA Food Database API Key** and paste your key.
5. Tap anywhere outside the menu or tap Close.

Your API key is saved locally in your phone's browser storage (`localStorage`). It is **never sent to any third-party server or saved in public repository code**.

---

## 4. How Offline Mode & Backups Work

* **Offline Support**: Once loaded, Tally's Service Worker caches the app shell locally on your phone. You can track calories and protein even without cellular data or Wi-Fi.
* **Moving Data to a New Phone**:
  1. On your old phone: Menu (⋯) → **Export backup**. Save or share the `.json` file.
  2. On your new phone: Menu (⋯) → **Import backup** → select the `.json` file.
