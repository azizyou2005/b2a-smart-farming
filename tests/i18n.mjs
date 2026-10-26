// Couverture des traductions : parcourt tous les écrans en italien, anglais et espagnol et relève les textes restés en français.
// Échoue si un texte nouveau n'est pas traduit (à ajouter dans www/dict-fix.js ou dans le fichier du module).
// Les mots identiques dans les deux langues (noms, unités, marques) sont listés dans tests/i18n-autorises.json.
// Usage : node tests/i18n.mjs            → vérifie
//         node tests/i18n.mjs --liste    → écrit la liste actuelle dans tests/i18n-autorises.json
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { launch, openApp, visitAll, HERE } from "./harness.mjs";

// Code inséré dans i18n.js : note chaque texte affiché dont une partie n'a pas de traduction
const PATCH = `
const __trCore0=trCore;window.__miss=window.__miss||{};let __dep=0,__bad=null;
const __key=src=>{const body=src.trim();const qs=[];const qb=body.replace(/« ([^«»]+?) »/g,(m,x)=>{qs.push(x);return "« "+String.fromCharCode(0xE000+qs.length-1)+" »"});const {key:key0}=tokenize(qb);return norm(key0.replace(/[\\uE000-\\uE0FF]/g,c=>"{q"+(c.charCodeAt(0)-0xE000)+"}"))};
trCore=function(src,lang){if(lang==="fr")return __trCore0(src,lang);const top=__dep===0;if(top)__bad=[];__dep++;let out;try{out=__trCore0(src,lang)}finally{__dep--}
 try{if(out===src&&/\\p{L}{3,}/u.test(src)&&__bad)__bad.push(src.trim());if(top&&__bad.length){const parts=__bad.filter(x=>x!==src.trim());(parts.length?parts:[src.trim()]).forEach(x=>{window.__miss[__key(x)]=x})}}catch(e){}
 if(top)__bad=null;return out};
`;
const FILE = join(HERE, "i18n-autorises.json");
const allowed = existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8")) : {};
const write = process.argv.includes("--liste");
const result = {};
const browser = await launch();
try {
  for (const lang of ["it", "en", "es"]) {
    const { page, ctx } = await openApp(browser, { lang, patchI18n: PATCH });
    await visitAll(page);
    result[lang] = Object.keys(await page.evaluate(() => window.__miss || {})).sort();
    await ctx.close();
  }
} finally { await browser.close(); }

if (write) { writeFileSync(FILE, JSON.stringify(result, null, 1) + "\n"); console.log("Liste écrite :", Object.entries(result).map(([l, k]) => `${l} ${k.length}`).join(", ")); process.exit(0); }
const fails = [];
for (const [lang, keys] of Object.entries(result)) {
  const ok = new Set(allowed[lang] || []);
  const nouveaux = keys.filter(k => !ok.has(k));
  if (nouveaux.length) fails.push(`${lang} : ${nouveaux.length} texte(s) sans traduction :\n    ` + nouveaux.slice(0, 40).join("\n    "));
}
if (fails.length) { console.error("ÉCHEC des traductions :\n- " + fails.join("\n- ")); process.exit(1); }
console.log("Traductions OK : italien, anglais, espagnol.");
