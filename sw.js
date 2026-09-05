/* Iron Logbook service worker — offline-first app shell.
   Bump CACHE when you change any precached file; the app shows an
   "Update ready" toast and picks it up on the next reopen. */
var CACHE = "iron-logbook-v1";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./programme.html",
  "./training.ics",
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
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* Same-origin GET only. Serve from cache instantly, refresh in the
   background (stale-while-revalidate). Cross-origin requests (Google
   Fonts) are left to the browser; offline they fall back to the system
   font stack declared in the CSS. */
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req).then(function (cached) {
      var net = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === "basic") {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || net;
    })
  );
});
