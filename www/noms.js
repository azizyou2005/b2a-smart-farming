/* B2A Smart Farming : contrôle des noms à l'inscription et repérage des doublons (B2A-HIGH-TECHNOLOGY-AUTOMATION, Bayere Abdoul Aziz)
   Utilisé par l'écran d'inscription (acces.js) et par la page du propriétaire (utilisateurs.js).
   check() renvoie { erreur: texte ou "", suspect: [champs qui semblent mal écrits] }.
   - erreur  : inscription refusée (chiffres dans le nom, noms de test comme « John Doe », « aaa »…)
   - suspect : nom qui ressemble à des lettres tapées au hasard ; la personne doit confirmer. */
(function(){
const norm=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
/* noms de test ou de remplissage (robots de test, essais) */
const FAUX_NOMS=new Set(["john doe","jane doe","john smith","jean test","test test","foo bar","lorem ipsum","nom prenom","prenom nom","first last","firstname lastname"]);
const FAUX_MOTS=new Set(["test","tests","tester","testeur","testing","essai","demo","admin","user","utilisateur","inconnu","anonyme","anonymous","unknown","fake","faux","null","undefined","none","xxx","xyz","abc","abcd","toto","tata","titi","lorem","ipsum","qwerty","azerty","asdf","qsdf","prenom","firstname","lastname"]);
const CLAVIER=["qwer","wert","erty","rtyu","tyui","yuio","uiop","asdf","sdfg","dfgh","fghj","ghjk","hjkl","jklm","azer","zert","qsdf","wxcv","xcvb","cvbn","vbnm","zxcv","poiu","lkjh","mlkj"];
const LETTRES=/^[\p{L}][\p{L}\p{M}' .-]*$/u;
/* mot qui ressemble à des lettres tapées au hasard : presque pas de voyelles, ou une longue suite de consonnes */
function hasard(w){if(w.length<4)return false;const v=(w.match(/[aeiouy]/g)||[]).length;
  return v/w.length<0.25||/[^aeiouy0-9]{5,}/.test(w)||CLAVIER.some(k=>w.includes(k))}
function check(d){const p=norm(d.prenom),n=norm(d.nom),v=norm(d.ville);
  const r={erreur:"",suspect:[]};
  if(!LETTRES.test(String(d.prenom||"").trim())||!LETTRES.test(String(d.nom||"").trim())){r.erreur="Le prénom et le nom ne doivent contenir que des lettres.";return r}
  if(p.replace(/ /g,"").length<2||n.replace(/ /g,"").length<2){r.erreur="Le prénom et le nom doivent avoir au moins 2 lettres chacun.";return r}
  if(v&&v.replace(/[^a-z]/g,"").length<2){r.erreur="Indiquez le vrai nom de votre ville ou village.";return r}
  const full=p+" "+n;
  if(FAUX_NOMS.has(full)||full.split(" ").some(w=>FAUX_MOTS.has(w))||/(.)\1\1/.test(full.replace(/ /g,""))){r.erreur="Indiquez votre vrai prénom et votre vrai nom.";return r}
  if(v&&(v.split(" ").some(w=>FAUX_MOTS.has(w))||/([a-z])\1\1/.test(v))){r.erreur="Indiquez le vrai nom de votre ville ou village.";return r}
  if(p===n)r.suspect.push("nom");
  else if(full.split(" ").some(hasard))r.suspect.push("nom");
  if(v&&v.split(" ").some(w=>/^[a-z]+$/.test(w)&&hasard(w)))r.suspect.push("ville");
  return r}
/* clé pour repérer une même personne : prénom + nom (dans n'importe quel ordre) + ville + pays */
const cleNom=d=>[norm(d.prenom),norm(d.nom)].join(" ").split(" ").filter(Boolean).sort().join(" ")+"|"+norm(d.ville)+"|"+norm(d.pays);
async function sha(s){try{const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("b2a|"+s));
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("").slice(0,32)}catch(e){return ""}}
window.B2A_NOMS={norm,check,cleNom,sha};
})();
