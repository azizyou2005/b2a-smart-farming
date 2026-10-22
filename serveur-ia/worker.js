/**
 * B2A Smart Farming : serveur IA (Cloudflare Worker)
 *
 * Il garde la clé Anthropic secrète, vérifie les codes d'accès et compte les analyses.
 *
 * À configurer dans Cloudflare (voir LISEZ-MOI.md) :
 *   - Liaison KV nommée        B2A_KV
 *   - Secret                   ANTHROPIC_API_KEY   (clé de console.anthropic.com)
 *   - Secret                   ADMIN_KEY           (mot de passe de la page d'administration)
 *   - Variable (facultative)   MODEL               (par défaut : claude-sonnet-5-5)
 */

const DEFAULT_MODEL = "claude-sonnet-5-5";
const MAX_IMAGES = 3;
const MAX_IMAGE_B64 = 1_800_000; // ≈ 1,3 Mo par photo après compression dans l'app

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, x-admin-key",
  "Access-Control-Max-Age": "86400",
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", ...CORS } });
const err = (status, erreur) => json({ erreur }, status);

const month = () => new Date().toISOString().slice(0, 7); // AAAA-MM
const clean = (v, max) => String(v ?? "").slice(0, max);
const normCode = c => String(c || "").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 40);

async function getCode(env, code) {
  if (!code) return null;
  const raw = await env.B2A_KV.get("code:" + code);
  return raw ? JSON.parse(raw) : null;
}
async function getUsage(env, code) {
  return Number(await env.B2A_KV.get(`usage:${code}:${month()}`)) || 0;
}
async function addUsage(env, code) {
  const n = (await getUsage(env, code)) + 1;
  await env.B2A_KV.put(`usage:${code}:${month()}`, String(n), { expirationTtl: 60 * 60 * 24 * 70 });
  return n;
}
function newCode() {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const r = crypto.getRandomValues(new Uint8Array(8));
  const s = Array.from(r, x => A[x % A.length]).join("");
  return `B2A-${s.slice(0, 4)}-${s.slice(4)}`;
}

/* ---------- consignes envoyées à Claude ---------- */
function promptDiagnostic(b) {
  const plante = b.type === "plante";
  return `Tu es un expert en zootechnie, médecine vétérinaire de terrain et agronomie tropicale (Afrique de l'Ouest et Europe).
Analyse la ou les photos jointes et le contexte. Sois concret et pratique pour un éleveur ou un agriculteur. Si la photo ne permet pas de conclure, dis-le et baisse la confiance. N'invente pas de signes que tu ne vois pas. Réponds en français.

CONTEXTE
Type : ${plante ? "PLANTE / culture" : "ANIMAL d'élevage"}
Pays / région : ${clean(b.pays, 120) || "non précisé"}
Objectif : ${clean(b.objectif, 120) || "non précisé"}
Âge connu : ${clean(b.age, 120) || "inconnu"}
Observations : ${clean(b.observations, 1500) || "aucune"}
${b.lot ? "DONNÉES DU LOT : " + clean(b.lot, 2500) : ""}

Réponds UNIQUEMENT avec un objet JSON de cette forme :
{"nom":"nom commun","nom_scientifique":"…","race_ou_variete":"…","confiance":0-100,"alternatives":["…"],
 "details":[{"label":"Âge estimé","value":"…"},{"label":"Sexe","value":"…"},{"label":"Poids / stade estimé","value":"…"},{"label":"État corporel","value":"…"}],
 "potentiel":{"score":0-100,"niveau":"Forte croissance | Croissance moyenne | Croissance faible","resume":"1-2 phrases","indicateurs":[{"label":"ex. GMQ attendu / ponte annuelle / rendement","value":"…"}]},
 "sante":{"etat":"bon | a_surveiller | alerte","score":0-100,"resume":"1-2 phrases","signes":[{"texte":"…","gravite":"ok | moyen | grave"}],"causes_possibles":["…"]},
 "priorite":"action la plus urgente, une phrase",
 "suivi":[{"categorie":"Alimentation | Eau | Vaccination | Déparasitage | Logement | Hygiène | Arrosage | Fertilisation | Traitement | Surveillance | Rentabilité","action":"action précise avec quantités","frequence":"…"}],
 "limites":"ce que la photo ne permet pas de savoir"}
Pour une plante, adapte details (stade, partie observée) et potentiel (vigueur, rendement). Si des données de lot sont fournies, utilise-les. Donne 5 à 8 lignes de suivi.`;
}
function promptPrevision(b) {
  const d = new Date();
  const mois = [1, 2, 3].map(i => new Date(d.getFullYear(), d.getMonth() + i, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }));
  return `Tu es un conseiller technico-économique en élevage en Afrique de l'Ouest. Analyse ce lot et fais des prévisions financières réalistes en FCFA. Réponds en français.

${clean(b.donnees, 6000)}

Réponds UNIQUEMENT avec ce JSON :
{"avis":"verdict en 1-2 phrases : rentable ou pas, à partir de quand","resume":"3-4 phrases d'analyse",
 "prevision_3_mois":[{"mois":"${mois[0]}","oeufs":nombre ou null,"recettes":nombre,"depenses":nombre,"resultat":nombre}, … pour ${mois.join(", ")}],
 "risques":[{"texte":"…","niveau":"eleve | moyen | faible"}],
 "leviers":[{"action":"action concrète","gain_estime":"ex. +45 000 F/mois"}]}
Donne 3 à 5 risques et 3 à 5 leviers adaptés (prix et fabrication de l'aliment, saison chaude, maladies, vente directe, réforme…).`;
}

function extractJson(text) {
  try { return JSON.parse(text); } catch (e) {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch (e) {} }
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  if (a >= 0 && b > a) { try { return JSON.parse(text.slice(a, b + 1)); } catch (e) {} }
  return null;
}

async function askClaude(env, prompt, images) {
  const content = (images || []).map(data => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data } }));
  content.push({ type: "text", text: prompt });
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: env.MODEL || DEFAULT_MODEL, max_tokens: 4000, messages: [{ role: "user", content }] }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((d.error && d.error.message) || "Erreur Anthropic " + r.status);
  const text = (d.content || []).filter(c => c.type === "text").map(c => c.text).join("\n");
  const out = extractJson(text);
  if (!out) throw new Error("Réponse illisible");
  return out;
}

/* ---------- routes ---------- */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (!env.B2A_KV) return err(500, "Liaison KV B2A_KV manquante");

    try {
      if (path === "/" && request.method === "GET") return json({ service: "B2A Smart Farming IA", ok: true });

      /* --- application --- */
      if (path === "/verifier" && request.method === "POST") {
        const b = await request.json().catch(() => ({}));
        const code = normCode(b.code);
        const c = await getCode(env, code);
        if (!c || !c.actif) return err(403, "Code invalide ou désactivé");
        const used = await getUsage(env, code);
        return json({ ok: true, nom: c.nom || "", quota: c.quota, restant: Math.max(0, c.quota - used) });
      }

      if (path === "/analyse" && request.method === "POST") {
        if (!env.ANTHROPIC_API_KEY) return err(500, "Clé Anthropic non configurée");
        const b = await request.json().catch(() => null);
        if (!b) return err(400, "Requête invalide");
        const code = normCode(b.code);
        const c = await getCode(env, code);
        if (!c || !c.actif) return err(403, "Code invalide ou désactivé");
        const used = await getUsage(env, code);
        if (used >= c.quota) return err(429, "Quota du mois atteint");

        let prompt, images = [];
        if (b.tache === "diagnostic") {
          images = Array.isArray(b.images) ? b.images.slice(0, MAX_IMAGES) : [];
          if (!images.length) return err(400, "Ajoutez au moins une photo");
          if (images.some(i => typeof i !== "string" || i.length > MAX_IMAGE_B64)) return err(413, "Photo trop lourde");
          prompt = promptDiagnostic(b);
        } else if (b.tache === "libre") {
          prompt = clean(b.prompt, 20000);
          if (!prompt) return err(400, "Consigne vide");
          images = Array.isArray(b.images) ? b.images.slice(0, MAX_IMAGES) : [];
          if (images.some(i => typeof i !== "string" || i.length > MAX_IMAGE_B64)) return err(413, "Photo trop lourde");
        } else if (b.tache === "prevision") {
          prompt = promptPrevision(b);
        } else return err(400, "Tâche inconnue");

        const resultat = await askClaude(env, prompt, images);
        const n = await addUsage(env, code);
        return json({ resultat, restant: Math.max(0, c.quota - n) });
      }

      /* --- administration (B2A) --- */
      if (path.startsWith("/admin")) {
        if (!env.ADMIN_KEY || request.headers.get("x-admin-key") !== env.ADMIN_KEY) return err(401, "Mot de passe administrateur incorrect");

        if (path === "/admin/codes" && request.method === "GET") {
          const list = await env.B2A_KV.list({ prefix: "code:" });
          const codes = await Promise.all(list.keys.map(async k => {
            const code = k.name.slice(5);
            const c = JSON.parse((await env.B2A_KV.get(k.name)) || "{}");
            return { code, ...c, utilise: await getUsage(env, code) };
          }));
          codes.sort((a, b) => (b.cree || "").localeCompare(a.cree || ""));
          return json({ codes, mois: month() });
        }
        if (path === "/admin/codes" && request.method === "POST") {
          const b = await request.json().catch(() => ({}));
          let code = normCode(b.code) || newCode();
          if (await env.B2A_KV.get("code:" + code)) return err(409, "Ce code existe déjà");
          const c = { nom: clean(b.nom, 80), quota: Math.max(1, Math.min(10000, Number(b.quota) || 30)), actif: true, cree: new Date().toISOString() };
          await env.B2A_KV.put("code:" + code, JSON.stringify(c));
          return json({ code, ...c, utilise: 0 });
        }
        const m = path.match(/^\/admin\/codes\/([A-Z0-9-]+)$/i);
        if (m) {
          const code = normCode(m[1]);
          const c = await getCode(env, code);
          if (!c) return err(404, "Code introuvable");
          if (request.method === "DELETE") { await env.B2A_KV.delete("code:" + code); return json({ ok: true }); }
          if (request.method === "POST") {
            const b = await request.json().catch(() => ({}));
            if (b.actif !== undefined) c.actif = !!b.actif;
            if (b.quota !== undefined) c.quota = Math.max(1, Math.min(10000, Number(b.quota) || c.quota));
            if (b.nom !== undefined) c.nom = clean(b.nom, 80);
            await env.B2A_KV.put("code:" + code, JSON.stringify(c));
            return json({ code, ...c, utilise: await getUsage(env, code) });
          }
        }
      }
      return err(404, "Adresse inconnue");
    } catch (e) {
      return err(502, "L'analyse a échoué : " + (e && e.message ? e.message : "erreur inconnue"));
    }
  },
};
