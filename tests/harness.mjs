// Outils communs aux tests : ouvre l'application dans Chromium, sans internet, avec des données d'exemple.
// Les fichiers sont servis depuis le dossier donné (www, ou la copie compressée publiée).
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, "..");
const SEED = readFileSync(join(HERE, "donnees-exemple.js"), "utf8");
const TYPES = { js: "text/javascript", html: "text/html", json: "application/json", png: "image/png", css: "text/css", svg: "image/svg+xml" };

// Prestataire d'exemple pour l'annuaire des Services
const SERVICES = `{"services_pros":{"p1":{"nom":"Dr Test","metier":"veto","ville":"Ouagadougou","tel":"70123456","statut":"actif","finLe":Date.now()+9e9,"verifie":true,"deplace":true,"specialites":"volailles","zones":"Ouaga","horaires":"7 h–18 h","agrement":"1","geo":{"lat":12.36,"lon":-1.53},"geoExacte":true}}}`;

/** Lance le navigateur. PW_CHROMIUM permet d'utiliser un Chromium déjà installé. */
export async function launch() {
  return chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
}

/**
 * Ouvre l'application. opts : { lang, dir, width, height, patchI18n (code inséré dans i18n.js), seed }
 * Renvoie { page, errors } ; errors reçoit les erreurs JavaScript de la page.
 */
export async function openApp(browser, opts = {}) {
  const { lang = "fr", dir = join(ROOT, "www"), width = 400, height = 860, patchI18n = "", seed = true } = opts;
  // position simulée : Ouagadougou (pour « Près de moi » et les distances)
  const ctx = await browser.newContext({ viewport: { width, height }, acceptDownloads: true, permissions: ["geolocation"], geolocation: { latitude: 12.3714, longitude: -1.5197 } });
  await ctx.route("**/*", async route => {
    const url = route.request().url();
    if (url.includes("config.js")) return route.fulfill({ body: "window.B2A_FIREBASE=null;window.B2A_IA_URL=null;window.B2A_NOTIFY_EMAIL=null;", contentType: "text/javascript" });
    if (!url.startsWith("https://app/")) return route.abort(); // aucun accès à internet pendant les tests
    const path = url.slice("https://app/".length).split("?")[0] || "index.html";
    try {
      let body = readFileSync(join(dir, path));
      if (path === "i18n.js" && patchI18n) {
        let s = body.toString("utf8");
        s = s.replace("function trCore(src,lang){", "let trCore;trCore=function(src,lang){");
        const i = s.indexOf("window.__tr=");
        body = Buffer.from(s.slice(0, i) + patchI18n + s.slice(i));
      }
      return route.fulfill({ body, contentType: TYPES[path.split(".").pop()] || "application/octet-stream" });
    } catch { return route.fulfill({ status: 404 }); }
  });
  const init = seed
    ? `if(!localStorage.getItem('seeded')){localStorage.setItem('b2a-lang','${lang}');${SEED};const d=JSON.parse(localStorage.getItem('b2a-farm-data-v1'));Object.assign(d,${SERVICES});localStorage.setItem('b2a-farm-data-v1',JSON.stringify(d));localStorage.setItem('seeded','1')}`
    : `if(!localStorage.getItem('seeded')){localStorage.setItem('b2a-lang','${lang}');localStorage.setItem('seeded','1')}`;
  await ctx.addInitScript(init);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(String(e && e.stack || e)));
  page.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push("console: " + m.text()); });
  await page.goto("https://app/index.html");
  await page.waitForTimeout(1500);
  return { page, errors, ctx };
}

/** Parcourt tous les écrans de l'application (onglets, menus, formulaires, Marché, Services, guide santé, réglages). */
export async function visitAll(page) {
  const W = t => page.waitForTimeout(t);
  const openDetails = () => page.evaluate(() => document.querySelectorAll("details").forEach(d => (d.open = true))).catch(() => {});
  const click = async (sel, t = 500) => { try { await page.locator(sel).first().click({ timeout: 2500 }); await W(t); await openDetails(); return true; } catch { return false; } };
  const tab = async t => { await page.evaluate(id => document.getElementById("tab-" + id).click(), t); await W(600); await openDetails(); };
  const selects = async scope => {
    const n = await page.evaluate(sc => document.querySelectorAll(sc + " select").length, scope);
    for (let i = 0; i < n; i++) {
      const vals = await page.evaluate(([sc, k]) => { const s = document.querySelectorAll(sc + " select")[k]; return s && s.offsetParent ? [...s.options].map(o => o.value) : []; }, [scope, i]);
      for (const v of vals.slice(0, 14)) {
        await page.evaluate(([sc, k, val]) => { const s = document.querySelectorAll(sc + " select")[k]; if (!s) return; s.value = val; s.dispatchEvent(new Event("change", { bubbles: true })); s.dispatchEvent(new Event("input", { bubbles: true })); }, [scope, i, v]).catch(() => {});
        await W(100);
      }
    }
  };
  await openDetails();
  await click("text=/Voir les \\d+ alertes|Show all|Vedi|Ver /");
  await click("#p-cadd"); await click("#p-ccancel");
  for (const k of [0, 1]) { await tab("tableau"); await click(`#lots .lot >> nth=${k}`, 800); for (const j of [0, 1, 2]) await click(`.subtabs button >> nth=${j}`, 500); }
  for (const kind of [0, 1]) {
    await tab("tableau"); await click("#btn-newlot", 600); await click(`#v-tableau .card:visible button:visible >> nth=${kind + 1}`, 700);
    for (const j of [0, 1, 2, 3]) await click(`#l-steps li >> nth=${j}`, 400);
    await selects("#v-tableau"); await click(".back:visible", 400);
  }
  await tab("saisie"); await selects("#v-saisie");
  await tab("calendrier"); await selects("#v-calendrier");
  await tab("formules"); await selects("#v-formules");
  await tab("ventes"); await click("#v-new", 700); await selects("#v-ventes"); await click("#v-cancel", 400);
  await tab("couvoir"); await click("#v-couvoir >> text=/couveuse|incubator|incubatrice|incubadora/i", 700);
  await tab("marche");
  for (const m of ["acheter", "vendre", "services", "mes"]) await click(`#m-seg [data-m=${m}]`, 700);
  await click("#m-seg [data-m=services]", 500); await click(".s-card", 500); await click("#m-body .back", 400); await click(".s-join .btn", 600);
  await tab("diagnostic"); await selects("#v-diagnostic");
  await page.evaluate(() => [...document.querySelectorAll("#v-diagnostic [aria-pressed=false]")].slice(0, 30).forEach(b => { try { b.click(); } catch {} }));
  await click("#v-diagnostic >> text=/Voir les causes|See likely|Vedi le cause|Ver las causas/", 700);
  await tab("tableau"); await click(".gearbtn", 700); await selects("#x-set"); await page.keyboard.press("Escape"); await W(300);
  await click(".langbtn", 300); await page.keyboard.press("Escape");
  await click("#tab-plus", 400); await page.keyboard.press("Escape");
}
