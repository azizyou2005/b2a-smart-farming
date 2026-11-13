/* B2A Smart Farming : fonctionnement hors ligne */
const CACHE = "b2a-v60.29";  /* changer ce numéro à chaque nouvelle version : 60.1, 60.2, 60.3… */
const CORE = ["./", "index.html", "404.html", "config.js", "shim.js", "erreurs.js", "acces.js", "app.js", "langue.js", "i18n.js", "guide.js", "extra.js", "couvoir.js", "plus.js", "poulailler.js", "bilan.js", "culture.js", "geo.js", "marche-cgu.js", "signaler.js", "marche.js", "services.js", "pro.js", "vitrine.js", "simulation.js", "nav.js", "libs/jspdf.umd.min.js", "libs/jspdf.plugin.autotable.min.js",
  "manifest.json", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png",
  "icons/b2a-logo.png", "icons/b2a-nom.png", "icons/b2a-slogan.png", "icons/armoire-b2a-3d.jpg"];
const V = CACHE.slice(5);
/* les scripts de l'app sont demandés avec ?v=numéro : on les garde sous ce nom exact */
const PRE = CORE.map(f => /\.js$/.test(f) && !f.startsWith("libs/") ? f + "?v=" + V : f);
const WAIT = 3500;   /* réseau lent : au-delà de 3,5 s on ouvre la copie du téléphone (mise à jour en arrière-plan) */
const put = (req, r) => { if (r && r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; };
/* réseau d'abord, mais sans attendre plus de WAIT ms s'il existe une copie locale */
const netFirst = (req, key, fallback) => {
  const net = fetch(req, { cache: "no-cache" }).then(r => put(key, r));
  const local = () => caches.match(key, { ignoreSearch: true }).then(h => h || (fallback ? caches.match(fallback) : undefined));
  return new Promise(resolve => {
    let done = false;
    const finish = r => { if (!done && r) { done = true; resolve(r); } };
    const t = setTimeout(() => local().then(finish), WAIT);
    net.then(r => { clearTimeout(t); finish(r); })
       .catch(() => { clearTimeout(t); local().then(h => { if (h) finish(h); else if (!done) { done = true; resolve(Response.error()); } }); });
  });
};
const CACHEABLE = [self.location.host, "fonts.googleapis.com", "fonts.gstatic.com", "www.gstatic.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (!CACHEABLE.includes(url.host)) return;
  if (url.pathname.includes("/essai/")) return;               // version d'essai : jamais dans le cache de l'application publiée            // données Firebase : jamais en cache ici
  if (url.pathname.endsWith(".apk")) return;
  if (req.mode === "navigate") {                          // page : réseau d'abord (3,5 s maximum), sinon copie locale
    const key = /\/$/.test(url.pathname) ? new URL("index.html", url).href : url.origin + url.pathname;
    e.respondWith(netFirst(req, key, "index.html"));
    return;
  }
  if (url.host === self.location.host && /\.js$/.test(url.pathname) && url.searchParams.has("v")) {   // scripts numérotés : copie locale d'abord (le numéro change à chaque version)
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => put(req, r)).catch(() => caches.match(req, { ignoreSearch: true }))));
    return;
  }
  if (url.host === self.location.host && /\.(js|json)$/.test(url.pathname)) {   // autres fichiers de l'app (version.json…) : réseau d'abord
    e.respondWith(netFirst(req, req));
    return;
  }
  e.respondWith(caches.match(req).then(hit => {          // fichiers : copie locale, mise à jour en arrière-plan
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === "opaque")) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});

/* clic sur une notification : ramener l'application au premier plan sur le bon onglet */
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const tab = (e.notification.data && e.notification.data.tab) || "";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    const c = list.find(x => x.url.startsWith(self.registration.scope)) || list[0];
    if (c) { if (tab) c.postMessage({ b2aTab: tab }); return c.focus(); }
    return self.clients.openWindow("./" + (tab ? "#" + tab : ""));
  }));
});
