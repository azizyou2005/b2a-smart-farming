// Prépare un fichier de traduction par langue : www/dict-en.js, www/dict-it.js, www/dict-es.js.
// Le téléphone ne télécharge que la langue choisie (rien en français), au lieu des 330 Ko de dict.js + dict-extra.js + dict-fix.js.
// Les traductions se modifient toujours dans dict.js, dict-extra.js, dict-fix.js (ou dans le fichier du module) :
// ce script est relancé automatiquement avant chaque publication.
// Usage : node outils/langues.mjs              → écrit les 3 fichiers
//         node outils/langues.mjs --verifier   → échoue si les fichiers ne sont pas à jour
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const WWW = join(dirname(fileURLToPath(import.meta.url)), "..", "www");
const LANGS = ["en", "it", "es"];
const run = files => {
  const window = {};
  const ctx = vm.createContext({ window, Object, JSON });
  for (const f of files) vm.runInContext(readFileSync(join(WWW, f), "utf8"), ctx, { filename: f });
  return window.B2A_DICT || {};
};
// Dans l'ordre d'origine : dict.js puis dict-extra.js remplacent ; dict-fix.js complète seulement (après les modules)
const O = run(["dict.js", "dict-extra.js"]);
const F = run(["dict-fix.js"]);

const verifier = process.argv.includes("--verifier");
const bad = [];
for (const l of LANGS) {
  const out = `/* Traductions ${l} — fichier PRÉPARÉ AUTOMATIQUEMENT par outils/langues.mjs à partir de dict.js, dict-extra.js et dict-fix.js. Ne pas modifier ici. */
(function(){var D=window.B2A_DICT=window.B2A_DICT||{};D.${l}=Object.assign(D.${l}||{},${JSON.stringify(O[l] || {})});
var F=window.B2A_DICT_FILL=window.B2A_DICT_FILL||{};F.${l}=${JSON.stringify(F[l] || {})};
(window.B2A_LANG_OK=window.B2A_LANG_OK||{}).${l}=1})();
`;
  const p = join(WWW, `dict-${l}.js`);
  if (verifier) { if (!existsSync(p) || readFileSync(p, "utf8") !== out) bad.push(`dict-${l}.js`); }
  else writeFileSync(p, out);
}
if (bad.length) { console.error("Fichiers de langue pas à jour : " + bad.join(", ") + " → lancer : node outils/langues.mjs"); process.exit(1); }
console.log(verifier ? "Fichiers de langue à jour." : "Écrit : " + LANGS.map(l => `dict-${l}.js`).join(", "));
