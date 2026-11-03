// Captures d'écran pour Google Play (1080x1920), avec les données d'exemple, sans internet.
// Usage : node tests/captures.mjs x "tab|tableau|1-accueil;click|#lots .lot|2-lot;tab|saisie|3-saisie"
//   étapes séparées par « ; » : tab|<onglet>|<nom> · click|<sélecteur>|<nom> · js|<code>|<nom> (nom vide = pas de capture)
//   images écrites dans le dossier CAPTURES (par défaut ./captures). PW_CHROMIUM = Chromium déjà installé (facultatif).
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, HERE } from "./harness.mjs";
const SEED = readFileSync(join(HERE, "donnees-exemple.js"), "utf8");
const TYPES = { js: "text/javascript", html: "text/html", json: "application/json", png: "image/png", css: "text/css", svg: "image/svg+xml" };
import { mkdirSync } from "node:fs";
const OUT = process.env.CAPTURES || "captures"; mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const ctx = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: "fr-FR", timezoneId: "Africa/Ouagadougou" });
await ctx.route("**/*", async r => { const u = r.request().url();
  if (u.includes("config.js")) return r.fulfill({ body: "window.B2A_FIREBASE=null;window.B2A_IA_URL=null;window.B2A_NOTIFY_EMAIL=null;window.B2A_CONTACT_EMAIL='azizyou2005@yahoo.fr';", contentType: "text/javascript" });
  if (!u.startsWith("https://app/")) return r.abort();
  const p = u.slice(12).split("?")[0] || "index.html";
  try { return r.fulfill({ body: readFileSync(join(ROOT, "www", p)), contentType: TYPES[p.split(".").pop()] || "application/octet-stream" }); } catch { return r.fulfill({ status: 404 }); } });
await ctx.addInitScript(`if(!localStorage.getItem('seeded')){localStorage.setItem('b2a-lang','fr');${SEED};localStorage.setItem('seeded','1')}`);
const page = await ctx.newPage();
await page.goto("https://app/index.html"); await page.waitForTimeout(2500);
const W = t => page.waitForTimeout(t);
const tab = async id => { await page.evaluate(i => { const t = document.getElementById("tab-" + i); t && t.click(); window.scrollTo(0, 0); }, id); await W(900); };
const shot = async n => { await page.evaluate(() => window.scrollTo(0, 0)); await W(300); await page.screenshot({ path: `${OUT}/${n}.png` }); console.log("ok", n); };
const tabs = await page.evaluate(() => [...document.querySelectorAll("[id^=tab-]")].map(e => e.id + ":" + e.textContent.trim()));
console.log(tabs.join(" | "));
if (process.argv[3]) { for (const step of process.argv[3].split(";")) { const [kind, arg, n] = step.split("|");
    if (kind === "tab") await tab(arg); else if (kind === "click") { await page.locator(arg).first().click(); await W(1200); } else if (kind === "js") { await page.evaluate(arg); await W(1200); }
    if (n) await shot(n); } await b.close(); process.exit(0); }
for (const [id, n] of (process.argv[2] || "tableau").split(",").map(x => x.split(":"))) { await tab(id); await shot(n || id); }
await b.close();
