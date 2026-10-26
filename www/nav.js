/* B2A Smart Farming : navigation simplifiée sur téléphone et tablette
   5 boutons en bas : Accueil, Saisie du jour, Soins, Marché, Plus.
   « Plus » ouvre un menu avec Photo IA et santé, Formules, Ventes, Couvoir et Réglages.
   Sur ordinateur (barre latérale), tous les onglets restent visibles. */
(function(){
const nav=document.querySelector("nav.tabs");if(!nav)return;
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
/* onglets rangés dans « Plus » : [id, titre, description] */
const MORE=[["diagnostic","Photo IA et guide santé","Signes de maladie, causes probables, analyse photo"],
  ["formules","Formules d'aliment","Fabriquer l'aliment et calculer son coût"],
  ["ventes","Ventes et caisse","Factures, dépenses et bénéfice du mois"],
  ["couvoir","Couvoir","Couveuses, couvées et vente des poussins"]];
const order=["tableau","saisie","calendrier","marche"];
/* ordre des boutons : les 4 principaux, puis « Plus », puis les autres (cachés sur téléphone) */
order.forEach(id=>{const b=$("tab-"+id);if(b)nav.append(b)});
const plus=el("button","nav-plus");plus.type="button";plus.id="tab-plus";plus.setAttribute("role","tab");plus.setAttribute("aria-selected","false");plus.setAttribute("aria-haspopup","dialog");
plus.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><circle cx="16.75" cy="16.75" r="3.4"/></svg>';
plus.append(document.createTextNode("Plus"));nav.append(plus);
MORE.forEach(([id])=>{const b=$("tab-"+id);if(b){b.classList.add("nav-more");nav.append(b)}});
nav.classList.add("nav5");

/* menu « Plus » */
const sheet=el("div","np-sheet");sheet.id="np-sheet";sheet.hidden=true;sheet.setAttribute("role","dialog");sheet.setAttribute("aria-modal","true");sheet.setAttribute("aria-labelledby","np-t");
const box=el("div","np-in");const head=el("div","np-head");const t=el("h2","sec","Plus");t.id="np-t";const x=el("button","np-x","Fermer");x.type="button";head.append(t,x);box.append(head);
const list=el("div","np-list");box.append(list);sheet.append(box);document.body.append(sheet);
function item(icon,title,desc,go,id){const b=el("button","np-item");b.type="button";if(id)b.dataset.t=id;const ic=el("span","np-ic");ic.innerHTML=icon;
  const tx=el("span","np-tx");tx.append(el("b",null,title),el("small",null,desc));b.append(ic,tx,el("span","np-go","›"));b.onclick=()=>{close();go()};return b}
MORE.forEach(([id,title,desc])=>{const tb=$("tab-"+id);if(!tb)return;const svg=tb.querySelector("svg");list.append(item(svg?svg.outerHTML:"",title,desc,()=>tb.click(),id))});
const gear=document.querySelector(".gearbtn");
if(gear)list.append(item('<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  "Réglages","Équipe, sauvegarde, rappels, taille du texte",()=>gear.click()));
let lastFocus=null;
function open(){lastFocus=document.activeElement;sheet.hidden=false;document.documentElement.classList.add("np-open");plus.setAttribute("aria-expanded","true");
  list.querySelectorAll(".np-item").forEach(b=>b.classList.toggle("on",!!b.dataset.t&&$("tab-"+b.dataset.t).getAttribute("aria-selected")==="true"));setTimeout(()=>{const f=list.querySelector(".np-item");if(f)f.focus()},30)}
function close(){if(sheet.hidden)return;sheet.hidden=true;document.documentElement.classList.remove("np-open");plus.setAttribute("aria-expanded","false");if(lastFocus&&lastFocus.focus)try{lastFocus.focus()}catch(e){}}
plus.onclick=()=>sheet.hidden?open():close();x.onclick=close;
sheet.addEventListener("click",e=>{if(e.target===sheet)close()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});

/* « Plus » est en surbrillance quand on est dans un de ses onglets */
const sync=()=>{const on=MORE.some(([id])=>{const b=$("tab-"+id);return b&&b.getAttribute("aria-selected")==="true"});plus.setAttribute("aria-selected",String(on))};
const mo=new MutationObserver(sync);MORE.forEach(([id])=>{const b=$("tab-"+id);if(b)mo.observe(b,{attributes:true,attributeFilter:["aria-selected"]})});sync();

const css=el("style");css.textContent=`
nav.tabs.nav5{grid-template-columns:repeat(5,minmax(0,1fr))}
nav.tabs.nav5 button{font-size:12px;line-height:1.15;padding:7px 2px;min-height:58px}
nav.tabs.nav5 button svg{width:25px;height:25px}
nav.tabs.nav5 .nav-more{display:none}
@media (max-width:360px){nav.tabs.nav5 button{font-size:11px}}
@media (min-width:1024px){nav.tabs.nav5 .nav-more{display:flex}nav.tabs.nav5 .nav-plus{display:none}nav.tabs.nav5{grid-template-columns:1fr}nav.tabs.nav5 button{font-size:14px;min-height:48px}}
.np-sheet{position:fixed;inset:0;z-index:60;background:rgb(5 10 20/.55);display:flex;align-items:flex-end;justify-content:center}
.np-sheet[hidden]{display:none}
.np-in{background:var(--surface);color:var(--ink);width:min(100%,560px);border-radius:20px 20px 0 0;padding:16px 16px calc(18px + env(safe-area-inset-bottom,0px));display:grid;gap:10px;max-height:85vh;overflow:auto;box-shadow:0 -10px 30px rgb(0 0 0/.25)}
.np-head{display:flex;justify-content:space-between;align-items:center}.np-head h2{margin:0}
.np-x{background:var(--navy,#1b2e4c);color:#fff;border:0;border-radius:999px;padding:8px 14px;font:700 14px var(--body);cursor:pointer}
.np-list{display:grid;gap:8px}
.np-item{display:grid;grid-template-columns:48px minmax(0,1fr) auto;gap:12px;align-items:center;text-align:left;width:100%;padding:12px;border:1px solid var(--line);border-radius:14px;background:var(--surface);color:var(--ink);font:inherit;cursor:pointer;min-height:68px}
.np-item.on{border-color:var(--navy,#1b2e4c);box-shadow:inset 4px 0 0 var(--brand-green,#72ac48)}
.np-ic{width:48px;height:48px;border-radius:13px;background:var(--navy,#1b2e4c);display:grid;place-items:center}
.np-ic svg{width:26px;height:26px;fill:none;stroke:var(--brand-green,#72ac48);stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.np-tx{display:grid;gap:2px;min-width:0}.np-tx b{font:700 17px/1.2 var(--display);color:var(--heading)}.np-tx small{color:var(--muted);font-size:14px;line-height:1.3}
.np-go{font-size:26px;color:var(--muted);line-height:1}
html.np-open{overflow:hidden}
@media (min-width:1024px){.np-sheet{align-items:center}.np-in{border-radius:20px}}`;
document.head.append(css);

const TR={"Plus":["More","Altro","Más"],"Photo IA et guide santé":["AI photo and health guide","Foto IA e guida sanitaria","Foto IA y guía de salud"],
 "Signes de maladie, causes probables, analyse photo":["Disease signs, likely causes, photo analysis","Segni di malattia, cause probabili, analisi foto","Signos de enfermedad, causas probables, análisis de fotos"],
 "Formules d'aliment":["Feed formulas","Formule dei mangimi","Fórmulas de pienso"],"Fabriquer l'aliment et calculer son coût":["Make feed and work out its cost","Prepara il mangime e calcolane il costo","Fabricar el pienso y calcular su coste"],
 "Ventes et caisse":["Sales and cash book","Vendite e cassa","Ventas y caja"],"Factures, dépenses et bénéfice du mois":["Invoices, expenses and monthly profit","Fatture, spese e utile del mese","Facturas, gastos y beneficio del mes"],
 "Couvoir":["Hatchery","Incubatoio","Incubadora"],"Couveuses, couvées et vente des poussins":["Incubators, batches and chick sales","Incubatrici, covate e vendita dei pulcini","Incubadoras, nidadas y venta de pollitos"],
 "Réglages":["Settings","Impostazioni","Ajustes"],"Équipe, sauvegarde, rappels, taille du texte":["Team, backup, reminders, text size","Squadra, backup, promemoria, dimensione del testo","Equipo, copia de seguridad, recordatorios, tamaño del texto"],
 "Fermer":["Close","Chiudi","Cerrar"]};
{const D=window.B2A_DICT=window.B2A_DICT||{};["en","it","es"].forEach((lg,i)=>{D[lg]=D[lg]||{};for(const k in TR)if(D[lg][k]==null)D[lg][k]=TR[k][i]})}
window.B2A_NAV={open,close};
})();
