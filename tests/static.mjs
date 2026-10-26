// Contrôles rapides sans navigateur : syntaxe de chaque fichier JavaScript, cohérence des numéros de version,
// fichiers chargés présents et gardés hors connexion, manifeste valide, aucun secret dans le dépôt.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { ROOT } from "./harness.mjs";

const WWW = join(ROOT, "www");
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

// 1. syntaxe
for (const f of readdirSync(WWW).filter(f => f.endsWith(".js"))) {
  try { new vm.Script(readFileSync(join(WWW, f), "utf8"), { filename: f }); } catch (e) { fails.push(`Syntaxe : ${f} : ${e.message}`); }
}
// 2. versions : version.json = ?v= dans index.html = cache du service worker
const v = JSON.parse(readFileSync(join(WWW, "version.json"), "utf8")).v;
const index = readFileSync(join(WWW, "index.html"), "utf8");
const sw = readFileSync(join(WWW, "sw.js"), "utf8");
const scripts = [...index.matchAll(/<script src="([^"?]+)\?v=(\d+)"/g)];
ok(scripts.length > 5, "index.html : scripts introuvables");
for (const [, src, ver] of scripts) {
  ok(Number(ver) === v, `index.html : ${src}?v=${ver} alors que version.json dit ${v}`);
  ok(existsSync(join(WWW, src)), `index.html charge ${src}, fichier absent`);
  ok(src === "config.js" || sw.includes(`"${src}"`), `sw.js : ${src} n'est pas gardé pour le hors connexion`);
}
ok(sw.includes(`"b2a-v${v}"`), `sw.js : le cache doit s'appeler b2a-v${v}`);
for (const m of sw.matchAll(/"([\w./-]+\.(?:js|html|json|png))"/g)) ok(existsSync(join(WWW, m[1])), `sw.js garde ${m[1]}, fichier absent`);
// 3. i18n.js chargé en dernier (il traduit ce que les autres fichiers ont affiché)
ok(scripts.length && scripts[scripts.length - 1][1] === "i18n.js", "index.html : i18n.js doit être le dernier script");
// 4. manifeste
try { const m = JSON.parse(readFileSync(join(WWW, "manifest.json"), "utf8")); ok(m.name && m.icons && m.icons.length, "manifest.json incomplet"); } catch (e) { fails.push("manifest.json invalide : " + e.message); }
// 5. politique de sécurité du contenu sur chaque page
for (const f of readdirSync(WWW).filter(f => f.endsWith(".html"))) {
  ok(readFileSync(join(WWW, f), "utf8").includes("Content-Security-Policy"), `${f} : pas de Content-Security-Policy`);
}
// 6. aucun secret dans le dépôt (clé de signature, clé Anthropic, clé privée)
const walk = d => readdirSync(d, { withFileTypes: true }).flatMap(e => e.name === ".git" || e.name === "node_modules" ? [] : e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);
for (const f of walk(ROOT)) {
  if (/\.(jks|keystore|p12|pem)$/i.test(f)) fails.push(`Fichier de clé dans le dépôt : ${f}`);
  if (/\.(png|jpg|jpeg|pdf|apk|aab|ico|webp)$/i.test(f)) continue;
  const s = readFileSync(f, "utf8");
  if (/sk-ant-[A-Za-z0-9_-]{20,}/.test(s)) fails.push(`Clé Anthropic dans ${f}`);
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(s)) fails.push(`Clé privée dans ${f}`);
  if (/ANDROID_KEYSTORE_B64\s*[:=]\s*["']?[A-Za-z0-9+/]{200,}/.test(s)) fails.push(`Keystore en clair dans ${f}`);
}
// 7. règles Firestore : collections utilisées par l'application toutes couvertes
const rules = readFileSync(join(ROOT, "firestore.rules"), "utf8");
for (const c of ["inscriptions", "farms", "marche_annonces", "marche_commandes", "marche_contacts", "marche_vendeurs", "marche_boutiques", "marche_pieces", "marche_paiements", "marche_config", "services_pros", "services_paiements", "erreurs", "suppressions"])
  ok(rules.includes(`match /${c}/`), `firestore.rules : pas de règle pour ${c}`);

if (fails.length) { console.error("ÉCHEC des contrôles :\n- " + fails.join("\n- ")); process.exit(1); }
console.log(`Contrôles OK : syntaxe, version ${v}, ${scripts.length} scripts, sécurité, règles.`);
