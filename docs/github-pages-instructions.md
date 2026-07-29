# GitHub Pages Hosting & Deployment Guide

This document explains how **Tally** is hosted on GitHub Pages, how to enable/configure hosting, and how security is maintained for client-side API keys.

---

## 1. Hosting Architecture

Tally is a zero-build, static Progressive Web App (PWA) composed of:
- `index.html` (UI + Logic + Local Storage)
- `sw.js` (Offline Service Worker Cache)
- `manifest.webmanifest` (PWA Installation Metadata)
- `icon.svg` & `icon-maskable.svg` (App Icons)

Because it consists of standard static assets, it can be hosted for free on **GitHub Pages**, Netlify, Cloudflare Pages, or any web server over HTTPS.

---

## 2. Enabling GitHub Pages

If deploying a new repository or reconfiguring hosting:

### Option A: Via GitHub Web Interface
1. Go to your repository on GitHub: `https://github.com/USERNAME/REPOSITORY`
2. Open **Settings** → **Pages** (under Code and automation).
3. Under **Build and deployment** → **Source**, choose **Deploy from a branch**.
4. Select **Branch: `main`** and **Folder: `/ (root)`**.
5. Click **Save**.

### Option B: Via GitHub CLI (`gh`)
You can enable Pages directly from your terminal:
```bash
gh api repos/:owner/:repo/pages -f "source[branch]=main" -f "source[path]=/"
```

Your live site URL will be:
```
https://<USERNAME>.github.io/<REPOSITORY>/
```

---

## 3. Protecting API Keys on Public Static Hosts

### The Challenge
Static hosting services like GitHub Pages serve files directly to client browsers. **Any API key hardcoded inside JavaScript or HTML files on a public static host is visible to anyone inspecting page source or network traffic.**

### The Solution
Tally handles API keys using **Device-Local Storage**:
1. No API keys are hardcoded in `index.html` or committed to Git.
2. The user pastes their USDA API key into the app's **Menu (⋯)** sheet on their device.
3. The key is saved locally in browser `localStorage` (`state.usdaApiKey`).
4. When performing live searches, Tally queries `api.nal.usda.gov` directly from the client using the locally stored key.

This guarantees your personal API key remains private while deploying public code to GitHub Pages.

---

## 4. Deploying Updates

To deploy changes to your live site:

1. Commit your modified files:
   ```bash
   git add index.html sw.js README.md
   git commit -m "feat: your description"
   ```
2. Push to the `main` branch:
   ```bash
   git push origin main
   ```
3. GitHub Pages automatically re-builds and publishes the update within ~30–60 seconds.

> **Note on Service Worker Updates**: When modifying `index.html` or `sw.js`, remember to bump the `CACHE` name in `sw.js` (e.g., `tally-v4` → `tally-v5`) and `VERSION` in `index.html` so installed PWA clients fetch the updated cache shell immediately.
