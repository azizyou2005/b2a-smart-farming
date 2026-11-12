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
const sectionsPar={marche:"mk-admin",services:"sv-admin",pro:"pr-admin",erreurs:"er-admin"};
const secs={};for(const [k,id] of Object.entries(sectionsPar))secs[k]=document.getElementById(id);
const children=[...wrap.children];
children.forEach(c=>{if(!Object.values(sectionsPar).includes(c.id))usersPanel.append(c)});
const dash=el("div","an-panel");dash.id="an-dash";
const stats=el("div","an-panel");stats.id="an-stats";
const panels={dash,stats,users:usersPanel};
wrap.innerHTML="";wrap.append(dash,stats,usersPanel);
for(const [k,id] of Object.entries(sectionsPar)){const p=el("div","an-panel");p.id="an-"+k;const s=secs[k];if(s)p.append(s);panels[k]=p;wrap.append(p)}

/* 2. barre d'onglets */
const TABS=[["dash","Tableau de bord"],["stats","Statistiques"],["users","Utilisateurs"],["marche","Marché"],["services","Services"],["pro","Version Pro"],["erreurs","Erreurs"]];
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
  ["Données Firebase","https://console.firebase.google.com/project/b2a-smart-farming/firestore/data"],["Tests et publications (GitHub)","https://github.com/azizyou2005/b2a-smart-farming/actions"],["Google Play Console","https://play.google.com/console"],["App Store Connect (Apple)","https://appstoreconnect.apple.com"]];
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

/* 4. statistiques : inscriptions, élevages, pays, activité, ventes du Marché */
stats.innerHTML=`<section class="card"><h2>Inscriptions</h2><div class="kpis" id="st-ukpi"></div><h3 class="an-h3">Nouvelles inscriptions par mois</h3><div id="st-mois" class="st-bars"></div></section>
  <section class="card"><h2>Par type d'élevage</h2><p class="note">Utilisateurs avec accès.</p><div id="st-elev" class="st-bars"></div></section>
  <section class="card"><h2>Par pays</h2><div id="st-pays" class="st-bars"></div></section>
  <section class="card"><h2>Activité</h2><div class="kpis" id="st-akpi"></div><h3 class="an-h3">Téléphones utilisés</h3><div id="st-plat" class="st-bars"></div><h3 class="an-h3">Langue choisie à l'inscription</h3><div id="st-lang" class="st-bars"></div></section>
  <section class="card"><h2>Ventes du Marché</h2><div class="kpis" id="st-mkpi"></div><h3 class="an-h3">Ventes conclues par mois (FCFA)</h3><div id="st-vmois" class="st-bars"></div>
    <h3 class="an-h3">Meilleurs vendeurs</h3><div id="st-vend" class="st-bars"></div><h3 class="an-h3">Commandes par étape</h3><div id="st-cmd" class="st-bars"></div></section>`;
const MOIS=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
const pad=n=>String(n).padStart(2,"0");
const last12=()=>{const out=[];const d=new Date();d.setDate(1);for(let i=11;i>=0;i--){const x=new Date(d.getFullYear(),d.getMonth()-i,1);out.push([x.getFullYear()+"-"+pad(x.getMonth()+1),MOIS[x.getMonth()]+" "+String(x.getFullYear()).slice(2)])}return out};
const mKey=t=>{const d=new Date(t);return d.getFullYear()+"-"+pad(d.getMonth()+1)};
const dayAgo=k=>{const d=new Date();d.setDate(d.getDate()-k);return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())};
/* barres horizontales : [libellé, valeur, texte affiché] */
function bars(id,rows,empty){const B=document.getElementById(id);B.innerHTML="";if(!rows.length||!rows.some(r=>r[1]>0)){B.append(el("p","note",empty||"Pas encore de données."));return}
  const max=Math.max(...rows.map(r=>r[1]),1);rows.forEach(([l,v,t])=>{const r=el("div","st-row");r.append(el("span","st-l",l));const tr=el("span","st-t");const i=el("i");i.style.width=(v>0?Math.max(1.5,v/max*100):0)+"%";tr.append(i);r.append(tr,el("b","st-v",t!=null?t:fmt(v)));B.append(r)})}
const count=(list,key,map)=>{const o={};list.forEach(x=>{const k=(map?map(x[key]):x[key])||"Non précisé";o[k]=(o[k]||0)+1});return Object.entries(o).sort((a,b)=>b[1]-a[1])};
const PLAT=p=>{p=String(p||"");return /^android$/i.test(p)?"Application Android":/iphone/i.test(p)?"iPhone (navigateur)":/android/i.test(p)?"Android (navigateur)":p?"Ordinateur / autre":"Non précisé"};
const LANGN={fr:"Français",en:"Anglais",it:"Italien",es:"Espagnol"};
function renderStats(){const u=S.users||{},m=S.marche||{};const L=u.list||[];const acc=L.filter(x=>x.statut==="approuve");
  const M=last12();const now=Date.now();
  const thisM=M[11][0],prevM=M[10][0];const nThis=L.filter(x=>x.cree&&mKey(x.cree)===thisM).length,nPrev=L.filter(x=>x.cree&&mKey(x.cree)===prevM).length;
  const U=document.getElementById("st-ukpi");U.innerHTML="";
  U.append(kpi("Inscrits au total",fmt(L.length),fmt(acc.length)+" avec accès","ok"),kpi("Ce mois-ci",fmt(nThis),"mois dernier : "+fmt(nPrev)),kpi("Nouveaux 7 jours",fmt(L.filter(x=>x.cree>=now-7*864e5).length)));
  bars("st-mois",M.map(([k,lab])=>[lab,L.filter(x=>x.cree&&mKey(x.cree)===k).length]));
  bars("st-elev",count(acc,"elevage"));
  bars("st-pays",count(acc,"pays",p=>String(p||"").trim()).slice(0,12));
  const a7=acc.filter(x=>x.vu>=dayAgo(7)).length,a30=acc.filter(x=>x.vu>=dayAgo(30)).length,a1=acc.filter(x=>x.vu>=dayAgo(1)).length;
  const A=document.getElementById("st-akpi");A.innerHTML="";
  A.append(kpi("Actifs aujourd'hui / hier",fmt(a1)),kpi("Actifs 7 jours",fmt(a7),acc.length?Math.round(a7/acc.length*100)+" % des utilisateurs":""),kpi("Actifs 30 jours",fmt(a30),acc.length?Math.round(a30/acc.length*100)+" % des utilisateurs":""),
    kpi("Inactifs depuis 30 jours",fmt(acc.length-a30),"n'ont pas rouvert l'app",acc.length&&a30/acc.length<0.3?"warn":null));
  bars("st-plat",count(acc,"plateforme",PLAT));
  bars("st-lang",count(acc,"langue",l=>l?(LANGN[l]||l):"Français (avant le choix de langue)"));
  /* Marché */
  const V=m.ventes||[];const tot=V.reduce((p,x)=>p+x.f,0);const vThis=V.filter(x=>x.t&&mKey(x.t)===thisM),vPrev=V.filter(x=>x.t&&mKey(x.t)===prevM);
  const K=document.getElementById("st-mkpi");K.innerHTML="";
  K.append(kpi("Ventes conclues",fmt(tot)+" F",fmt(V.length)+" vente(s) au total","ok"),kpi("Ce mois-ci",fmt(vThis.reduce((p,x)=>p+x.f,0))+" F",fmt(vThis.length)+" vente(s) · mois dernier "+fmt(vPrev.reduce((p,x)=>p+x.f,0))+" F"),
    kpi("Panier moyen",V.length?fmt(tot/V.length)+" F":"—"),kpi("Commissions",fmt(m.commissions||0)+" F","encaissé "+fmt(m.encaisse||0)+" F"));
  bars("st-vmois",M.map(([k,lab])=>{const xs=V.filter(x=>x.t&&mKey(x.t)===k);const f=xs.reduce((p,x)=>p+x.f,0);return [lab,f,fmt(f)+" F ("+xs.length+")"]}),"Aucune vente conclue pour l'instant.");
  const bySel={};V.forEach(x=>{const k=x.vid||x.v;if(!bySel[k])bySel[k]={n:x.v||"Vendeur",f:0,c:0};bySel[k].f+=x.f;bySel[k].c++});
  bars("st-vend",Object.values(bySel).sort((a,b)=>b.f-a.f).slice(0,8).map(x=>[x.n,x.f,fmt(x.f)+" F ("+x.c+")"]),"Aucune vente conclue pour l'instant.");
  const SN={demande:"Demandées (en attente du vendeur)",acceptee:"Acceptées",vendue:"Vendues",refusee:"Refusées",annulee:"Annulées"};
  bars("st-cmd",Object.entries(m.statuts||{}).sort((a,b)=>b[1]-a[1]).map(([k,v])=>[SN[k]||k,v]),"Aucune commande pour l'instant.")}
document.addEventListener("b2a-admin",renderStats);renderStats();

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
.an-h3{margin:18px 0 8px;font:700 15px var(--body);color:var(--muted)}
.st-bars{display:grid;grid-template-columns:minmax(90px,36%) minmax(0,1fr) auto;gap:8px 10px;align-items:center;font-size:14px}.st-bars>.note{grid-column:1/-1}.st-row{display:contents}
.st-l{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.st-t{height:12px;background:var(--soft);border-radius:6px;overflow:hidden}.st-t i{display:block;height:100%;background:var(--navy);border-radius:6px}
.st-v{font-variant-numeric:tabular-nums;white-space:nowrap;font-size:13px}
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
