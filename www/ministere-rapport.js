/* B2A Smart Farming : affichage d'un rapport « Statistiques nationales de l'élevage »
   (page ministere.html pour le ministère, et aperçu dans utilisateurs.html pour B2A).
   Le rapport ne contient que des chiffres regroupés : aucun nom, aucune ferme identifiable. */
(function(){
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const fmt=(n,d=0)=>n==null||!isFinite(n)?"—":Number(n).toLocaleString("fr-FR",{maximumFractionDigits:d,minimumFractionDigits:0});
const pct=(a,b,d=1)=>b>0?fmt(a/b*100,d)+" %":"—";
const ms=v=>v==null?0:typeof v==="number"?v:v.toMillis?v.toMillis():v.seconds?v.seconds*1000:0;
const dLong=t=>t?new Date(t).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}):"—";
const ESP={pondeuse:"Poules pondeuses",chair:"Poulets de chair",local:"Volaille locale, pintades",caillepond:"Cailles pondeuses",caillechair:"Cailles de chair",
  porc:"Porcs",petitsrum:"Moutons et chèvres",bovin:"Bovins",poisson:"Poissons",lapin:"Lapins",autre:"Autres animaux"};
const mortPct=o=>(o.effectif+o.morts30)>0?o.morts30/(o.effectif+o.morts30)*100:null;
const prodTxt=o=>[o.oeufs30?fmt(o.oeufs30)+" œufs":"",o.lait30?fmt(o.lait30)+" L de lait":""].filter(Boolean).join(" · ")||"—";

function kpi(l,v,s,c){const k=el("div","kpi"+(c?" "+c:""));k.append(el("span",null,l),el("b",null,v));if(s)k.append(el("small",null,s));return k}
function table(head,rows,numFrom){const w=el("div","tablewrap"),t=el("table");const h=el("tr");head.forEach((x,i)=>{const th=el("th",null,x);if(i>=numFrom)th.style.textAlign="right";h.append(th)});
  const th=el("thead");th.append(h);t.append(th);const tb=el("tbody");
  rows.forEach(r=>{const tr=el("tr");if(r.cls)tr.className=r.cls;(r.c||r).forEach((x,i)=>{const td=el("td",i>=numFrom?"n":null,x);tr.append(td)});tb.append(tr)});t.append(tb);w.append(t);return w}

function totals(rep){const E=rep.especes||[];const t={effectif:0,morts30:0,vaccDus:0,vaccFaits:0,alerte:0,lots:0};
  E.forEach(o=>{for(const k in t)t[k]+=Number(o[k])||0});return t}

function render(host,rep){host.innerHTML="";if(!rep){host.append(el("p","note","Aucun rapport publié pour l'instant."));return}
  const T=totals(rep);const zA=(rep.zones||[]).filter(z=>z.alerte>0);
  const head=el("section","card mr-head");
  head.append(el("h2",null,rep.titre||"Statistiques nationales de l'élevage"),
    el("p","note",`${rep.pays||""} · données des 30 derniers jours · rapport du ${dLong(ms(rep.creeLe)||rep.genereLe)}`));
  const K=el("div","kpis");
  K.append(kpi("Fermes participantes",fmt(rep.nbFermes),fmt(rep.nbZones||0)+" zone(s)","ok"),kpi("Animaux suivis",fmt(T.effectif),fmt(T.lots)+" lot(s)"),
    kpi("Mortalité 30 jours",T.effectif+T.morts30>0?fmt(T.morts30/(T.effectif+T.morts30)*100,1)+" %":"—",fmt(T.morts30)+" morts",T.effectif+T.morts30>0&&T.morts30/(T.effectif+T.morts30)>0.05?"warn":null),
    kpi("Vaccins faits à temps",pct(T.vaccFaits,T.vaccDus,0),fmt(T.vaccFaits)+" sur "+fmt(T.vaccDus)+" prévus",T.vaccDus&&T.vaccFaits/T.vaccDus<0.7?"warn":null),
    kpi("Lots en alerte mortalité",fmt(T.alerte),fmt(zA.length)+" zone(s) concernée(s)",T.alerte?"warn":null));
  head.append(K);host.append(head);

  if(zA.length){const s=el("section","card mr-alert");s.append(el("h2",null,"Zones à surveiller"),
      el("p","note","Zones où au moins un lot a perdu plus de 0,5 % de ses animaux en 7 jours. Une visite des services vétérinaires peut être utile."));
    s.append(table(["Zone","Fermes","Lots en alerte","Animaux","Espèces touchées"],zA.sort((a,b)=>b.alerte-a.alerte).map(z=>[z.zone,fmt(z.fermes),fmt(z.alerte),fmt(z.effectif),(z.especesAlerte||[]).map(k=>ESP[k]||k).join(", ")||"—"]),1));
    host.append(s)}

  const se=el("section","card");se.append(el("h2",null,"Par espèce"));
  se.append(table(["Espèce","Fermes","Animaux","Morts 30 j","Mortalité 30 j","Production 30 j","Vaccins faits / prévus","Lots en alerte"],
    (rep.especes||[]).map(o=>[ESP[o.k]||o.k,fmt(o.fermes),fmt(o.effectif),fmt(o.morts30),mortPct(o)==null?"—":fmt(mortPct(o),1)+" %",prodTxt(o),o.vaccDus?fmt(o.vaccFaits)+" / "+fmt(o.vaccDus)+" ("+pct(o.vaccFaits,o.vaccDus,0)+")":"—",fmt(o.alerte)]),1));
  host.append(se);

  const sz=el("section","card");sz.append(el("h2",null,"Par zone"),el("p","note",`Province ou ville déclarée par l'éleveur. Les zones de moins de ${rep.seuil||3} fermes sont regroupées dans « Autres localités ».`));
  sz.append(table(["Zone","Fermes","Animaux","Mortalité 30 j","Vaccins faits","Lots en alerte","Espèces principales"],
    (rep.zones||[]).map(z=>({cls:z.alerte?"mr-warn":"",c:[z.zone,fmt(z.fermes),fmt(z.effectif),(z.effectif+z.morts30)>0?fmt(z.morts30/(z.effectif+z.morts30)*100,1)+" %":"—",pct(z.vaccFaits,z.vaccDus,0),fmt(z.alerte),(z.top||[]).map(k=>ESP[k]||k).join(", ")||"—"]})),1));
  host.append(sz);

  if((rep.cultures||[]).length){const sc=el("section","card");sc.append(el("h2",null,"Cultures"));
    sc.append(table(["Culture","Fermes","Parcelles","Surface"],rep.cultures.map(c=>[c.n,fmt(c.fermes),fmt(c.lots),c.ha?fmt(c.ha,1)+" ha":"—"]),1));host.append(sc)}

  if((rep.prix||[]).length){const sp=el("section","card");sp.append(el("h2",null,"Prix observés sur le Marché B2A"),
      el("p","note",`Annonces en ligne au moment du rapport, en ${rep.prixDevise||"FCFA"}. Un produit n'apparaît que s'il a au moins ${rep.seuil||3} annonces.`));
    sp.append(table(["Produit","Unité","Annonces","Prix médian","Plus bas – plus haut"],rep.prix.map(p=>[p.cat,p.unite||"—",fmt(p.n),fmt(p.med),fmt(p.min)+" – "+fmt(p.max)]),2));host.append(sp)}

  const sm=el("section","card mr-meth");sm.append(el("h2",null,"Méthode"));
  [`Source : application B2A Smart Farming (B2A-HIGH-TECHNOLOGY-AUTOMATION). Seules les fermes qui ont donné leur accord dans l'application sont comptées.`,
   `Chaque ferme envoie un résumé anonyme une fois par jour : nombre d'animaux par espèce, morts des 30 derniers jours, production, vaccins prévus et faits selon le calendrier sanitaire. Aucun nom, téléphone, client ni montant d'argent n'est transmis.`,
   `Fermes comptées : résumé reçu dans les 60 derniers jours. Une ferme partagée par plusieurs téléphones n'est comptée qu'une fois. Les groupes de moins de ${rep.seuil||3} fermes sont fusionnés pour qu'aucune ferme ne puisse être reconnue.`,
   `« Lot en alerte » : plus de 0,5 % de morts sur 7 jours. « Vaccins faits » : vaccins du calendrier dont la date est passée et marqués faits par l'éleveur.`].forEach(t=>sm.append(el("p","note",t)));
  host.append(sm)}

/* export tableur (CSV, séparateur « ; » pour Excel en français) */
function csv(rep){const q=v=>{const s=String(v==null?"":v);return /[;"\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};const L=[];const row=a=>L.push(a.map(q).join(";"));
  row([rep.titre||"Statistiques nationales de l'élevage"]);row(["Pays",rep.pays||""]);row(["Date du rapport",dLong(ms(rep.creeLe)||rep.genereLe)]);row(["Fermes participantes",rep.nbFermes]);row([]);
  row(["PAR ESPÈCE"]);row(["Espèce","Fermes","Lots","Animaux","Morts 30 j","Mortalité 30 j (%)","Œufs 30 j","Lait 30 j (L)","Vaccins prévus","Vaccins faits","Lots en alerte"]);
  (rep.especes||[]).forEach(o=>row([ESP[o.k]||o.k,o.fermes,o.lots,o.effectif,o.morts30,mortPct(o)==null?"":mortPct(o).toFixed(2).replace(".",","),o.oeufs30,o.lait30,o.vaccDus,o.vaccFaits,o.alerte]));row([]);
  row(["PAR ZONE"]);row(["Zone","Fermes","Animaux","Morts 30 j","Vaccins prévus","Vaccins faits","Lots en alerte","Espèces principales"]);
  (rep.zones||[]).forEach(z=>row([z.zone,z.fermes,z.effectif,z.morts30,z.vaccDus,z.vaccFaits,z.alerte,(z.top||[]).map(k=>ESP[k]||k).join(", ")]));
  if((rep.cultures||[]).length){row([]);row(["CULTURES"]);row(["Culture","Fermes","Parcelles","Surface (ha)"]);rep.cultures.forEach(c=>row([c.n,c.fermes,c.lots,String(c.ha||0).replace(".",",")]))}
  if((rep.prix||[]).length){row([]);row(["PRIX DU MARCHÉ ("+(rep.prixDevise||"FCFA")+")"]);row(["Produit","Unité","Annonces","Prix médian","Prix le plus bas","Prix le plus haut"]);rep.prix.forEach(p=>row([p.cat,p.unite,p.n,p.med,p.min,p.max]))}
  return "﻿"+L.join("\r\n")}
function download(rep){const b=new Blob([csv(rep)],{type:"text/csv;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(b);
  const d=new Date(ms(rep.creeLe)||rep.genereLe||Date.now());a.download="statistiques-elevage-"+d.toISOString().slice(0,10)+".csv";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),20000)}

const css=el("style");css.textContent=`tr.mr-warn td{background:var(--warn-bg)}.mr-alert{border-left:5px solid var(--gold)}.mr-meth .note{font-size:13px}
@media print{body{background:#fff!important;color:#000}.band .out,.mr-noprint,.an-tabs,#mi-tools,#u-login{display:none!important}.card{box-shadow:none;break-inside:avoid;border-color:#ccc}h1,.lead,.foot{color:#000!important}}`;
document.head.append(css);
window.B2A_RAPPORT={render,csv,download,ESP,ms,dLong,fmt};
})();
