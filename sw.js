/* Tally service worker — offline-first cache of the app shell.
   The cache name is derived from version.js, so bumping the version there is the
   only thing needed to make clients pick up an update. */
importScripts("./version.js");
const CACHE = "tally-v" + globalThis.TALLY_VERSION;
const ASSETS = [
  "./",
  "./index.html",
  "./version.js",
  "./food-images.js",
  "./tally-helpers.js",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-maskable.svg"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.startsWith("tally-v") && k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(e.request);
    const refresh = fetch(e.request).then(res => {
      if (res && res.ok && new URL(e.request.url).origin === self.location.origin) {
        // Caching is best effort: quota/response failures must not discard a
        // usable network response or hold it until a cache write completes.
        try {
          e.waitUntil(Promise.resolve(cache.put(e.request, res.clone())).catch(() => {}));
        } catch (_) {}
      }
      return res;
    });
    if (hit) {
      e.waitUntil(refresh.catch(() => {}));
      return hit;
    }
    try {
      return await refresh;
    } catch (error) {
      // The shell is a navigation fallback, never an API/image response.
      if (e.request.mode === "navigate") {
        return (await cache.match("./index.html")) || Response.error();
      }
      throw error;
    }
  })());
});
