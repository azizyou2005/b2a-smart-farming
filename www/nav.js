/* B2A Smart Farming : navigation simplifiée sur téléphone et tablette
   5 boutons en bas : Accueil, Gestion, Technique, Marché, Réglages.
   En bas : Accueil, puis un bouton par catégorie qui ouvre ses fonctions :
   Gestion de la ferme, Technique d'élevage, Marché et services, Réglages.
   Sur ordinateur (barre latérale), tous les onglets restent visibles, sous les mêmes titres de catégorie. */
(function(){
const nav=document.querySelector("nav.tabs");if(!nav)return;
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
/* Fonctions rangées par catégorie : [id, titre, description]
   id = onglet (tab-<id>) ou action spéciale (@bilan, @services, @reglages) */
const CATS=[
 {k:"gestion",t:"Gestion de la ferme",d:"Suivi du travail, chiffres et argent",items:[
  ["tableau","Accueil et alertes","Résumé du jour, alertes et lots en cours"],
  ["saisie","Saisie du jour","Œufs, morts, aliment et eau du jour"],
  ["ventes","Ventes et caisse","Factures, dépenses et bénéfice du mois"],
  ["@bilan","Bilan de l'année","Chiffre d'affaires, dépenses et bénéfice net"],
  ["personnel","Personnel et équipe","Pro : présences, tâches, paie et évaluations des employés"]]},
 {k:"technique",t:"Technique d'élevage",d:"Santé, soins, aliment et matériel",items:[
  ["calendrier","Calendrier des soins","Vaccins, traitements et rappels"],
  ["diagnostic","Photo IA et guide santé","Signes de maladie, causes probables, analyse photo"],
  ["formules","Formules d'aliment","Fabriquer l'aliment et calculer son coût"],
  ["couvoir","Couvoir","Couveuses, couvées et vente des poussins"],
  ["poulailler","Poulailler connecté","Aliment, eau, lumière, ventilation et alertes à distance"]]},
 {k:"marche",t:"Marché et services",d:"Acheter, vendre, trouver un professionnel",items:[
  ["marche","Marché B2A","Acheter et vendre œufs, volailles, aliment, matériel"],
  ["@services","Vétérinaires et services","Trouver un vétérinaire ou un technicien près de chez soi"]]},
 {k:"reglages",t:"Réglages",d:"",items:[
  ["@reglages","Réglages","Équipe, sauvegarde, rappels, taille du texte"]]}];
const MORE=[];CATS.forEach(c=>c.items.forEach(([id])=>{if(id[0]!=="@"&&!["tableau","saisie","calendrier","marche"].includes(id))MORE.push([id])}));
const order=["tableau"];
/* onglets du bas sur téléphone : Accueil + une catégorie par bouton */
const CICON={
 gestion:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
 technique:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/><path d="M9 11h6M12 8v6"/></svg>',
 marche:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16l-1.2-4H5.2z"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></svg>',
 reglages:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></svg>'};
const CLAB={gestion:"Gestion",technique:"Technique",marche:"Marché",reglages:"Réglages"};
const cbtn={};
CATS.forEach(c=>{const b=el("button","nav-catbtn");b.type="button";b.id="tab-cat-"+c.k;b.dataset.cat=c.k;b.setAttribute("role","tab");b.setAttribute("aria-selected","false");b.setAttribute("aria-haspopup","dialog");
  b.innerHTML=CICON[c.k];b.append(document.createTextNode(CLAB[c.k]));cbtn[c.k]=b});
/* ordre de la barre : par catégorie (titres visibles seulement sur ordinateur).
   Sur téléphone, seuls Accueil et les 4 boutons de catégorie restent visibles. */
CATS.forEach(c=>{const tabs=c.items.map(([id])=>id[0]==="@"?null:$("tab-"+id)).filter(Boolean);if(!tabs.length)return;
  nav.append(el("div","nav-cat",c.t));
  tabs.forEach(b=>{if(!order.includes(b.id.slice(4)))b.classList.add("nav-more");nav.append(b)})});
const home=$("tab-tableau");if(home)nav.prepend(home);
CATS.forEach(c=>nav.append(cbtn[c.k]));
nav.classList.add("nav5");

/* menu « Plus » : toutes les fonctions, rangées par catégorie */
const sheet=el("div","np-sheet");sheet.id="np-sheet";sheet.hidden=true;sheet.setAttribute("role","dialog");sheet.setAttribute("aria-modal","true");sheet.setAttribute("aria-labelledby","np-t");
const box=el("div","np-in");const head=el("div","np-head");const t=el("h2","sec","Toutes les fonctions");t.id="np-t";const x=el("button","np-x","Fermer");x.type="button";head.append(t,x);box.append(head);
const list=el("div","np-list");box.append(list);sheet.append(box);document.body.append(sheet);
function item(icon,title,desc,go,id){const b=el("button","np-item");b.type="button";if(id)b.dataset.t=id;const ic=el("span","np-ic");ic.innerHTML=icon;
  const tx=el("span","np-tx");tx.append(el("b",null,title),el("small",null,desc));b.append(ic,tx,el("span","np-go","›"));b.onclick=()=>{close();go()};return b}
const ICON={
 "@bilan":'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
 "@services":'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/><path d="M9 11h6M12 8v6"/></svg>',
 "@reglages":'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></svg>'};
const gear=document.querySelector(".gearbtn");
const tab=id=>$("tab-"+id);
const ACT={
 "@bilan":()=>{const v=tab("ventes");if(!v)return;v.click();setTimeout(()=>{const c=$("b-bilan");if(c)c.scrollIntoView({behavior:"smooth",block:"start"})},250)},
 "@services":()=>{const m=tab("marche");if(m)m.click();setTimeout(()=>{if(window.B2A_SERVICES&&window.B2A_SERVICES.open)window.B2A_SERVICES.open()},60)},
 "@reglages":()=>{if(gear)gear.click()}};
CATS.forEach(c=>{const its=c.items.filter(([id])=>id[0]==="@"?(id==="@reglages"?!!gear:id==="@bilan"?!!tab("ventes"):!!window.B2A_SERVICES):!!tab(id));if(!its.length)return;
  const g=el("section","np-cat");g.dataset.cat=c.k;const h=el("div","np-cat-h");h.append(el("b",null,c.t));if(c.d)h.append(el("small",null,c.d));g.append(h);
  its.forEach(([id,title,desc])=>{if(id[0]==="@"){g.append(item(ICON[id],title,desc,ACT[id]));return}
    const tb=tab(id);const svg=tb.querySelector("svg");g.append(item(svg?svg.outerHTML:"",title,desc,()=>tb.click(),id))});
  list.append(g)});
let lastFocus=null;
let curCat=null;
function open(k){lastFocus=document.activeElement;curCat=k||null;
  list.querySelectorAll(".np-cat").forEach(g=>{g.hidden=!!k&&g.dataset.cat!==k});list.classList.toggle("one",!!k);
  const c=CATS.find(z=>z.k===k);t.textContent=c?c.t:"Toutes les fonctions";
  sheet.hidden=false;document.documentElement.classList.add("np-open");if(k&&cbtn[k])cbtn[k].setAttribute("aria-expanded","true");
  list.querySelectorAll(".np-item").forEach(b=>b.classList.toggle("on",!!b.dataset.t&&$("tab-"+b.dataset.t).getAttribute("aria-selected")==="true"));setTimeout(()=>{const f=list.querySelector(".np-cat:not([hidden]) .np-item");if(f)f.focus()},30)}
function close(){if(sheet.hidden)return;sheet.hidden=true;document.documentElement.classList.remove("np-open");Object.values(cbtn).forEach(b=>b.setAttribute("aria-expanded","false"));curCat=null;if(lastFocus&&lastFocus.focus)try{lastFocus.focus()}catch(e){}}
Object.keys(cbtn).forEach(k=>cbtn[k].onclick=()=>{if(!sheet.hidden&&curCat===k)return close();
  if(k==="reglages"&&gear){close();gear.click();return}open(k)});x.onclick=close;
sheet.addEventListener("click",e=>{if(e.target===sheet)close()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});

/* le bouton de catégorie est en surbrillance quand on est dans un de ses onglets */
const allIds=[];CATS.forEach(c=>c.items.forEach(([id])=>{if(id[0]!=="@"&&id!=="tableau")allIds.push(id)}));
const sync=()=>{CATS.forEach(c=>{const on=c.items.some(([id])=>id[0]!=="@"&&id!=="tableau"&&$("tab-"+id)&&$("tab-"+id).getAttribute("aria-selected")==="true");cbtn[c.k].setAttribute("aria-selected",String(on))})};
const mo=new MutationObserver(sync);allIds.forEach(id=>{const b=$("tab-"+id);if(b)mo.observe(b,{attributes:true,attributeFilter:["aria-selected"]})});sync();

const css=el("style");css.textContent=`
nav.tabs.nav5{grid-template-columns:repeat(5,minmax(0,1fr))}
nav.tabs.nav5 button{font-size:12px;line-height:1.15;padding:7px 2px;min-height:58px}
nav.tabs.nav5 button svg{width:25px;height:25px}
nav.tabs.nav5 .nav-more,nav.tabs.nav5 .nav-cat{display:none}
@media (max-width:360px){nav.tabs.nav5 button{font-size:11px}}
@media (min-width:1024px){nav.tabs.nav5 .nav-more{display:flex}nav.tabs.nav5 .nav-catbtn{display:none}nav.tabs.nav5{grid-template-columns:1fr}nav.tabs.nav5 button{font-size:14px;min-height:48px}nav.tabs.nav5 .nav-cat{display:block;font:700 11px/1.2 var(--body);letter-spacing:.09em;text-transform:uppercase;color:var(--brand-gold,#d6a95a);padding:14px 10px 4px}nav.tabs.nav5 .nav-cat:first-child{padding-top:4px}}
.np-sheet{position:fixed;inset:0;z-index:60;background:rgb(5 10 20/.55);display:flex;align-items:flex-end;justify-content:center}
.np-sheet[hidden]{display:none}
.np-in{background:var(--surface);color:var(--ink);width:min(100%,560px);border-radius:20px 20px 0 0;padding:16px 16px calc(18px + env(safe-area-inset-bottom,0px));display:grid;gap:10px;max-height:85vh;overflow:auto;box-shadow:0 -10px 30px rgb(0 0 0/.25)}
.np-head{display:flex;justify-content:space-between;align-items:center}.np-head h2{margin:0}
.np-x{background:var(--navy,#1b2e4c);color:#fff;border:0;border-radius:999px;padding:8px 14px;font:700 14px var(--body);cursor:pointer}
.np-list{display:grid;gap:18px}.np-cat{display:grid;gap:8px}.np-cat[hidden]{display:none}.np-list.one .np-cat-h b{display:none}.np-cat-h{display:grid;gap:1px;padding:2px 4px}.np-cat-h b{font:700 13px/1.2 var(--body);letter-spacing:.08em;text-transform:uppercase;color:var(--brand-gold,#b8862f)}.np-cat-h small{color:var(--muted);font-size:13px}
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
 "Gestion":["Management","Gestione","Gestión"],"Technique":["Technical","Tecnica","Técnica"],
 "Toutes les fonctions":["All features","Tutte le funzioni","Todas las funciones"],
 "Gestion de la ferme":["Farm management","Gestione aziendale","Gestión de la granja"],"Suivi du travail, chiffres et argent":["Daily work, figures and money","Lavoro quotidiano, numeri e soldi","Trabajo diario, cifras y dinero"],
 "Technique d'élevage":["Farming techniques","Tecnica di allevamento","Técnica de cría"],"Santé, soins, aliment et matériel":["Health, care, feed and equipment","Salute, cure, mangime e attrezzature","Salud, cuidados, pienso y equipos"],
 "Marché et services":["Market and services","Mercato e servizi","Mercado y servicios"],"Acheter, vendre, trouver un professionnel":["Buy, sell, find a professional","Comprare, vendere, trovare un professionista","Comprar, vender, encontrar un profesional"],
 "Accueil et alertes":["Home and alerts","Home e avvisi","Inicio y alertas"],"Résumé du jour, alertes et lots en cours":["Today's summary, alerts and current batches","Riepilogo del giorno, avvisi e lotti in corso","Resumen del día, alertas y lotes en curso"],
 "Œufs, morts, aliment et eau du jour":["Today's eggs, deaths, feed and water","Uova, morti, mangime e acqua di oggi","Huevos, bajas, pienso y agua del día"],
 "Chiffre d'affaires, dépenses et bénéfice net":["Turnover, expenses and net profit","Fatturato, spese e utile netto","Facturación, gastos y beneficio neto"],
 "Calendrier des soins":["Care calendar","Calendario delle cure","Calendario de cuidados"],"Vaccins, traitements et rappels":["Vaccines, treatments and reminders","Vaccini, trattamenti e promemoria","Vacunas, tratamientos y recordatorios"],
 "Poulailler connecté":["Connected poultry house","Pollaio connesso","Gallinero conectado"],"Aliment, eau, lumière, ventilation et alertes à distance":["Feed, water, light, ventilation and remote alerts","Mangime, acqua, luce, ventilazione e avvisi a distanza","Pienso, agua, luz, ventilación y alertas a distancia"],
 "Marché B2A":["B2A Market","Mercato B2A","Mercado B2A"],"Acheter et vendre œufs, volailles, aliment, matériel":["Buy and sell eggs, poultry, feed, equipment","Comprare e vendere uova, pollame, mangime, attrezzature","Comprar y vender huevos, aves, pienso, equipos"],
 "Vétérinaires et services":["Vets and services","Veterinari e servizi","Veterinarios y servicios"],"Trouver un vétérinaire ou un technicien près de chez soi":["Find a vet or technician near you","Trova un veterinario o un tecnico vicino a te","Encontrar un veterinario o un técnico cerca de usted"],
 "Bilan de l'année":["Year review","Bilancio dell'anno","Balance del año"],
 "Fermer":["Close","Chiudi","Cerrar"]};
{const D=window.B2A_DICT=window.B2A_DICT||{};["en","it","es"].forEach((lg,i)=>{D[lg]=D[lg]||{};for(const k in TR)if(D[lg][k]==null)D[lg][k]=TR[k][i]})}
window.B2A_NAV={open,close};
})();
