/* Iron Logbook service worker — offline-first app shell.
   Bump CACHE when you change any precached file; the app shows an
   "Update ready" toast and picks it up on the next reopen. */
var CACHE = "iron-logbook-v2.0.1";
var ASSETS = [
  "./",
  "./index.html",
  "./src/styles.css",
  "./src/poses.js",
  "./src/catalog.js",
  "./src/model.js",
  "./src/app.js",
  "./icons/mark.svg",
  "./manifest.webmanifest",
  "./programme.html",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k.startsWith("iron-logbook-") && k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* The versioned app shell stays consistent until the next worker activates.
   Never mix newly fetched HTML with an older cached script. External links
   and fonts use the network; the interface has system-font fallbacks. */
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;
  var base = new URL('./', self.location.href);
  var path = url.pathname.startsWith(base.pathname) ? './' + url.pathname.slice(base.pathname.length) : '';
  if (ASSETS.indexOf(path) < 0) return;
  e.respondWith(caches.open(CACHE).then(function (cache) {
    return cache.match(path).then(function (cached) {
      return cached || fetch(req).catch(function () { return new Response('This page is not cached yet.', {status:503,headers:{'Content-Type':'text/plain'}}); });
    });
  }));
});
