/* B2A Smart Farming : navigation de la page d'administration (utilisateurs.html)
   Onglets : Tableau de bord · Utilisateurs · Marché · Services · Erreurs, avec pastilles « à traiter ».
   Le tableau de bord liste ce qui attend une action et donne les raccourcis utiles. Pensé pour le téléphone. */
(function(){
const main=document.getElementById("u-main");if(!main)return;
const wrap=main.querySelector(".wrap");if(!wrap)return;
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const fmt=n=>Number(n||0).toLocaleString("fr-FR",{maximumFractionDigits:0});
const LS="b2a-admin-onglet";

/* 1. regrouper le contenu existant en panneaux */
const usersPanel=el("div","an-panel");usersPanel.id="an-users";
const sectionsPar={marche:"mk-admin",services:"sv-admin",erreurs:"er-admin"};
const secs={};for(const [k,id] of Object.entries(sectionsPar))secs[k]=document.getElementById(id);
const children=[...wrap.children];
children.forEach(c=>{if(!Object.values(sectionsPar).includes(c.id))usersPanel.append(c)});
const dash=el("div","an-panel");dash.id="an-dash";
const panels={dash,users:usersPanel};
wrap.innerHTML="";wrap.append(dash,usersPanel);
for(const [k,id] of Object.entries(sectionsPar)){const p=el("div","an-panel");p.id="an-"+k;const s=secs[k];if(s)p.append(s);panels[k]=p;wrap.append(p)}

/* 2. barre d'onglets */
const TABS=[["dash","Tableau de bord"],["users","Utilisateurs"],["marche","Marché"],["services","Services"],["erreurs","Erreurs"]];
const bar=el("nav","an-tabs");bar.setAttribute("aria-label","Parties de l'administration");
const btns={};
TABS.forEach(([k,lab])=>{const b=el("button","an-tab");b.type="button";b.dataset.k=k;b.append(el("span",null,lab));const bd=el("span","an-badge");bd.hidden=true;b.append(bd);b.onclick=()=>show(k,true);btns[k]=b;bar.append(b)});
main.insertBefore(bar,wrap);
function show(k,user){if(!panels[k])k="dash";Object.entries(panels).forEach(([kk,p])=>p.hidden=kk!==k);Object.entries(btns).forEach(([kk,b])=>b.setAttribute("aria-current",kk===k?"page":"false"));
  try{localStorage.setItem(LS,k)}catch(e){}if(user)window.scrollTo({top:0,behavior:"smooth"});btns[k].scrollIntoView({block:"nearest",inline:"center"})}
/* aller à un onglet puis à un bloc précis */
function goTo(k,id){show(k,true);if(id)setTimeout(()=>{const t=document.getElementById(id);if(t){t.scrollIntoView({behavior:"smooth",block:"start"});t.classList.add("an-flash");setTimeout(()=>t.classList.remove("an-flash"),1600)}},80)}
let start="dash";try{start=localStorage.getItem(LS)||"dash"}catch(e){}
show(start,false);

/* 3. tableau de bord */
const S=window.__adm=window.__adm||{};
dash.innerHTML=`<section class="card an-todo"><h2>À faire</h2><div id="an-todo-list" class="an-list"><p class="note">Chargement…</p></div></section>
  <section class="card"><h2>Chiffres clés</h2><div class="kpis" id="an-kpis"></div></section>
  <section class="card"><h2>Raccourcis</h2><div class="an-links" id="an-links"></div></section>`;
const links=[["Ouvrir l'application","https://azizyou2005.github.io/b2a-smart-farming/"],["Codes d'accès IA","admin.html"],["Règles Firebase","https://console.firebase.google.com/project/b2a-smart-farming/firestore/rules"],
  ["Données Firebase","https://console.firebase.google.com/project/b2a-smart-farming/firestore/data"],["Tests et publications (GitHub)","https://github.com/azizyou2005/b2a-smart-farming/actions"],["Google Play Console","https://play.google.com/console"]];
const LK=document.getElementById("an-links");links.forEach(([t,h])=>{const a=el("a","btn small ghost",t);a.href=h;if(/^https/.test(h)){a.target="_blank";a.rel="noopener"}LK.append(a)});
function kpi(l,v,s,c){const k=el("div","kpi"+(c?" "+c:""));k.append(el("span",null,l),el("b",null,v));if(s)k.append(el("small",null,s));return k}
function render(){
  const u=S.users||{},m=S.marche||{},sv=S.services||{},er=S.erreurs||{},sp=S.suppr||{};
  /* actions à traiter, de la plus urgente à la moins urgente */
  const todo=[];
  const add=(n,txt,k,id,cls)=>{if(n>0)todo.push({n,txt,k,id,cls})};
  add(sp.n,"Demande(s) de suppression de compte : à traiter sous 30 jours","marche","mk-sup","bad");
  add(sv.att,"Paiement(s) Services à vérifier","services","sv-pay","warn");
  add(m.pieces,"Pièce(s) d'identité de vendeur à vérifier","marche","mk-list","warn");
  add(m.resteV,`Vendeur(s) avec une commission à payer (≈ ${fmt(m.reste)} F)`,"marche","mk-list","");
  add(sv.soon,"Fiche(s) Services qui se terminent sous 7 jours : à relancer","services","sv-list","");
  add(er.distinct,"Erreur(s) technique(s) signalée(s)","erreurs","er-list","");
  const T=document.getElementById("an-todo-list");T.innerHTML="";
  if(!Object.keys(S).length)T.append(el("p","note","Chargement…"));
  else if(!todo.length)T.append(el("p","an-ok","✓ Rien à traiter pour l'instant."));
  todo.forEach(t=>{const b=el("button","an-item "+(t.cls||""));b.type="button";b.append(el("span","an-n",fmt(t.n)),el("span","an-t",t.txt),el("span","an-go","›"));b.onclick=()=>goTo(t.k,t.id);T.append(b)});
  const K=document.getElementById("an-kpis");K.innerHTML="";
  K.append(kpi("Utilisateurs avec accès",fmt(u.acces),fmt(u.new7)+" nouveau(x) en 7 jours","ok"),kpi("Actifs 7 jours",fmt(u.a7),fmt(u.a30)+" sur 30 jours"),
    kpi("Vendeurs actifs",fmt(m.vendeurs),fmt(m.encours)+" commande(s) en cours"),kpi("Fiches Services en ligne",fmt(sv.online),"encaissé ce mois : "+fmt(sv.mois)+" F"),
    kpi("Commissions à encaisser",fmt(m.reste)+" F",fmt(m.resteV)+" vendeur(s)",m.reste>0.5?"warn":null));
  /* pastilles des onglets */
  const badge=(k,n,cls)=>{const b=btns[k].querySelector(".an-badge");b.hidden=!(n>0);b.textContent=n>99?"99+":String(n||"");b.className="an-badge"+(cls?" "+cls:"")};
  badge("marche",(m.pieces||0)+(sp.n||0),sp.n?"bad":"");badge("services",sv.att||0,"");badge("erreurs",er.distinct||0,"muted");badge("dash",todo.reduce((p,t)=>p+(t.k==="erreurs"?0:t.n),0),"");
  badge("users",u.new7||0,"muted")}
document.addEventListener("b2a-admin",render);render();

const css=el("style");css.textContent=`
.an-tabs{position:sticky;top:0;z-index:20;display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:10px max(16px,env(safe-area-inset-left,0px));margin:0 auto;max-width:900px;background:var(--page)}
.an-tabs::-webkit-scrollbar{display:none}
.an-tab{flex:none;display:inline-flex;align-items:center;gap:6px;border:1px solid rgb(255 255 255/.25);background:transparent;color:#fff;border-radius:999px;padding:9px 14px;font:700 15px var(--body);cursor:pointer;min-height:42px}
.an-tab[aria-current="page"]{background:#fff;color:var(--navy);border-color:#fff}
.an-badge{min-width:22px;height:22px;padding:0 6px;border-radius:11px;background:var(--gold);color:#1b2e4c;font:800 12px/22px var(--body);text-align:center}
.an-badge.bad{background:#e0533d;color:#fff}.an-badge.muted{background:rgb(255 255 255/.25);color:inherit}
.an-tab[aria-current="page"] .an-badge.muted{background:var(--soft);color:var(--ink)}
.an-panel{display:grid;gap:16px;grid-template-columns:minmax(0,1fr)}.an-panel[hidden]{display:none}
.an-list{display:grid;gap:8px}
.an-item{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;width:100%;text-align:left;padding:12px 14px;border:1px solid var(--line);border-left:5px solid var(--navy);border-radius:12px;background:var(--surface);color:var(--ink);font:600 15px/1.35 var(--body);cursor:pointer;min-height:56px}
.an-item.warn{border-left-color:var(--gold)}.an-item.bad{border-left-color:var(--bad)}
.an-n{min-width:36px;height:36px;border-radius:10px;background:var(--soft);display:grid;place-items:center;font:800 16px var(--display)}
.an-go{font-size:24px;color:var(--muted)}.an-ok{margin:0;color:var(--ok);font-weight:700}
.an-links{display:flex;flex-wrap:wrap;gap:8px}.an-links .btn{text-decoration:none}
.an-panel [id]{scroll-margin-top:76px}
.an-flash{outline:3px solid var(--gold);outline-offset:4px;border-radius:12px;transition:outline-color .3s}
@media (max-width:520px){.card{padding:14px}.kpi b{font-size:22px}#u-main input,#u-main select{font-size:16px}#mk-admin .row,#sv-admin .row{align-items:stretch}#sv-admin input.sv-motif,#mk-admin input{max-width:none;flex:1 1 100%}}`;
document.head.append(css);
})();
