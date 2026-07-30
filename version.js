/* Single source of truth for the app version.
   Loaded by index.html (window) and sw.js (importScripts), so bumping this one
   line bumps both the displayed version and the service worker cache name. */
globalThis.TALLY_VERSION = "1.4.0";
