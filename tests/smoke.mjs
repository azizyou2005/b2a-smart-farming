// Test des écrans : ouvre l'application dans les 4 langues, parcourt tous les écrans et échoue à la moindre erreur JavaScript.
// Vérifie aussi la navigation (5 boutons + « Plus »), l'annuaire des Services et l'export PDF.
// Usage : node tests/smoke.mjs [dossier]   (par défaut www ; en CI, aussi la copie compressée publiée)
import { join, resolve } from "node:path";
import { launch, openApp, visitAll, ROOT } from "./harness.mjs";

const dir = process.argv[2] ? resolve(process.argv[2]) : join(ROOT, "www");
const fails = [];
const browser = await launch();
try {
  for (const lang of ["fr", "it", "en", "es"]) {
    const { page, errors, ctx } = await openApp(browser, { lang, dir });
    // navigation téléphone : 5 boutons visibles
    const visible = await page.evaluate(() => [...document.querySelectorAll("nav.tabs button")].filter(b => b.offsetParent).length);
    if (visible !== 5) fails.push(`${lang} : ${visible} boutons visibles en bas au lieu de 5`);
    await visitAll(page);
    // Services : au moins le prestataire d'exemple
    await page.evaluate(() => window.B2A_SERVICES.open(""));
    await page.waitForTimeout(800);
    const cards = await page.locator(".s-card").count();
    if (cards < 1) fails.push(`${lang} : l'annuaire des Services n'affiche aucun prestataire`);
    // « Près de moi » : distance affichée sur la fiche du prestataire
    await page.locator("#m-body .m-near").first().click().catch(() => {});
    await page.waitForTimeout(1500);
    const dists = await page.locator(".s-card .m-dist").count();
    if (dists < 1) fails.push(`${lang} : « Près de moi » n'affiche pas la distance des prestataires`);
    await page.locator(".s-card").first().click().catch(() => {});
    await page.waitForTimeout(500);
    const route = await page.locator("#m-body a:has-text('Itinéraire'), #m-body a:has-text('Directions'), #m-body a:has-text('Itinerario'), #m-body a:has-text('Cómo llegar')").count();
    if (route < 1) fails.push(`${lang} : pas de bouton Itinéraire pour un prestataire à position exacte`);
    // Marché : « Près de moi » sans erreur
    await page.evaluate(() => window.B2A_MARCHE.setMode("acheter"));
    await page.waitForTimeout(500);
    await page.locator("#m-body .m-near").first().click().catch(() => fails.push(`${lang} : bouton « Près de moi » absent du Marché`));
    await page.waitForTimeout(1000);
    if (lang === "fr") {
      // export PDF du lot
      await page.evaluate(() => document.getElementById("tab-tableau").click());
      await page.waitForTimeout(500);
      await page.locator("#lots .lot").first().click();
      await page.waitForTimeout(600);
      try {
        const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 20000 }), page.locator("#v-tableau button:has-text('PDF')").first().click()]);
        if (!/\.pdf$/.test(dl.suggestedFilename())) fails.push("PDF : nom de fichier inattendu " + dl.suggestedFilename());
      } catch (e) { fails.push("PDF du lot non généré : " + e.message.split("\n")[0]); }
    }
    errors.forEach(e => fails.push(`${lang} : ${e.split("\n").slice(0, 3).join(" | ")}`));
    await ctx.close();
  }
  // ordinateur : barre latérale avec tous les onglets
  const { page, errors, ctx } = await openApp(browser, { dir, width: 1280, height: 800 });
  const side = await page.evaluate(() => [...document.querySelectorAll("nav.tabs button")].filter(b => b.offsetParent).length);
  if (side < 8) fails.push(`ordinateur : ${side} onglets visibles au lieu de 8`);
  errors.forEach(e => fails.push("ordinateur : " + e));
  await ctx.close();
} finally { await browser.close(); }

if (fails.length) { console.error("ÉCHEC du test des écrans (" + dir + ") :\n- " + [...new Set(fails)].join("\n- ")); process.exit(1); }
console.log("Écrans OK (" + dir + ") : 4 langues, navigation, Services, PDF, aucune erreur JavaScript.");
