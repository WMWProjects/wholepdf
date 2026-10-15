/* Kill Or Commit: offline support. Caches the app's own files only. Your list lives in this browser's storage, never here. */
const VERSION = "1.1.0";
const CACHE = "killorcommit-" + VERSION;
const ASSETS = ["./", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("killorcommit-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = req.mode === "navigate" ? "./" : req;
    const cached = await cache.match(key, { ignoreSearch: true });
    const fresh = fetch(req).then((res) => { if (res && res.ok && res.type === "basic") cache.put(key, res.clone()); return res; }).catch(() => cached);
    return cached || fresh; // open instantly from the saved copy; quietly refresh it for next time
  })());
});
