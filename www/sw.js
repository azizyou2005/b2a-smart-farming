/* B2A Smart Farming : fonctionnement hors ligne */
const CACHE = "b2a-v22";  /* changer ce numéro à chaque nouvelle version */
const CORE = ["./", "index.html", "404.html", "config.js", "shim.js", "acces.js", "app.js", "dict.js", "i18n.js", "guide.js", "extra.js", "dict-extra.js", "couvoir.js", "plus.js", "libs/jspdf.umd.min.js", "libs/jspdf.plugin.autotable.min.js",
  "manifest.json", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png"];
const CACHEABLE = [self.location.host, "fonts.googleapis.com", "fonts.gstatic.com", "www.gstatic.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (!CACHEABLE.includes(url.host)) return;            // données Firebase : jamais en cache ici
  if (url.pathname.endsWith(".apk")) return;
  if (req.mode === "navigate") {                          // page : réseau d'abord, sinon copie locale
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put("index.html", c)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  if (url.host === self.location.host && /\.(js|json)$/.test(url.pathname)) {   // fichiers de l'app : réseau d'abord
    e.respondWith(fetch(req, { cache: "no-cache" }).then(r => { if (r && r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch: true })));
    return;
  }
  e.respondWith(caches.match(req).then(hit => {          // fichiers : copie locale, mise à jour en arrière-plan
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === "opaque")) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
