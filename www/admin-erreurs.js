/* B2A Smart Farming : erreurs techniques signalées par les téléphones (page utilisateurs.html, compte B2A) */
(function(){
if(!window.B2A_FIREBASE||!window.firebase)return;
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const ms=v=>v==null?0:typeof v==="number"?v:v.toMillis?v.toMillis():0;
const host=$("u-main");if(!host)return;
const sec=el("section","card");sec.id="er-admin";sec.innerHTML=`<h2>Erreurs de l'application</h2>
  <p class="note">Erreurs techniques envoyées automatiquement par les téléphones (sans données de la ferme). Une erreur qui revient souvent après une nouvelle version signale un problème à corriger.</p>
  <div class="row" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span id="er-sum" class="note"></span><button class="btn small bad" id="er-clear" type="button" hidden>Tout effacer</button><span class="msg" id="er-msg"></span></div>
  <div class="list" id="er-list"></div>`;
host.querySelector(".wrap").append(sec);
const css=el("style");css.textContent=`#er-admin .er{display:grid;gap:4px}#er-admin .er code{font:12px/1.4 var(--mono);white-space:pre-wrap;overflow-wrap:anywhere;background:var(--soft);padding:6px 8px;border-radius:8px;max-height:120px;overflow:auto}`;document.head.append(css);
const db=firebase.firestore();let docs=[],off=null;
firebase.auth().onAuthStateChanged(u=>{if(off){off();off=null}if(!u||u.isAnonymous)return;
  off=db.collection("erreurs").orderBy("creeLe","desc").limit(300).onSnapshot(s=>{docs=s.docs;render()},()=>{$("er-sum").textContent="Lecture impossible : publiez les règles Firestore (firestore.rules).";})});
function render(){const L=$("er-list");L.innerHTML="";const g={};
  docs.forEach(d=>{const x=d.data();const k=(x.msg||"")+"|"+(x.src||"");const o=g[k]=g[k]||{x,n:0,last:0,vers:new Set(),plats:new Set()};o.n+=Number(x.nb)||1;o.last=Math.max(o.last,ms(x.creeLe));if(x.version)o.vers.add(x.version);if(x.plateforme)o.plats.add(x.plateforme)});
  const list=Object.values(g).sort((a,b)=>b.last-a.last);$("er-sum").textContent=docs.length?`${list.length} erreur(s) différente(s), ${docs.length} signalement(s) (300 derniers).`:"Aucune erreur signalée.";$("er-clear").hidden=!docs.length;
  list.slice(0,60).forEach(o=>{const c=el("article","u er");const top=el("div","u-top");top.append(el("b",null,o.x.msg||"(sans message)"),el("span","pill p-attente","× "+o.n));c.append(top);
    c.append(el("small",null,[o.x.src,[...o.vers].join(", "),[...o.plats].join(", "),o.last?"dernière le "+new Date(o.last).toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"short"}):""].filter(Boolean).join(" · ")));
    if(o.x.pile)c.append(el("code",null,o.x.pile));L.append(c)})}
$("er-clear").onclick=async()=>{const b=$("er-clear");if(b.dataset.c!=="1"){b.dataset.c="1";b.textContent="Confirmer : tout effacer";return}b.disabled=true;
  try{for(let i=0;i<docs.length;i+=400){const bt=db.batch();docs.slice(i,i+400).forEach(d=>bt.delete(d.ref));await bt.commit()}$("er-msg").textContent="Effacé."}catch(e){$("er-msg").textContent="Échec."}
  b.disabled=false;b.dataset.c="";b.textContent="Tout effacer"};
})();
