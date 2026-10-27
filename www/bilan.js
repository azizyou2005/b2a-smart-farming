/* B2A Smart Farming : bilan de l'année de toute la ferme (chiffre d'affaires, dépenses, bénéfice net par espèce).
   Sources : factures, cahier de caisse, saisies des lots et couvées. Les employées n'ont rien de plus à saisir. */
(function(){
const B=window.B2A;if(!B||!B.app)return;const A=B.app;

/* ================= traductions ================= */
const T={
"Bilan de l'année":["Yearly results","Bilancio dell'anno","Balance del año"],
"Ventes, dépenses et bénéfice net de toute la ferme, par espèce.":["Sales, costs and net profit of the whole farm, by species.","Vendite, spese e utile netto di tutta l'azienda, per specie.","Ventas, gastos y beneficio neto de toda la granja, por especie."],
"Année précédente":["Previous year","Anno precedente","Año anterior"],"Année suivante":["Next year","Anno successivo","Año siguiente"],
"Chiffre d'affaires":["Turnover","Fatturato","Volumen de negocio"],
"Dépenses":["Costs","Spese","Gastos"],
"Bénéfice net":["Net profit","Utile netto","Beneficio neto"],
"dont {0} F encaissés":["of which {0} F received","di cui {0} F incassati","de los cuales {0} F cobrados"],
"amortis inclus":["incl. depreciation","ammort. inclusi","amort. incluidas"],"Marge par espèce":["Margin by species","Margine per specie","Margen por especie"],"Ventes {0} F":["Sales {0} F","Vendite {0} F","Ventas {0} F"],"Dépenses {0} F":["Costs {0} F","Spese {0} F","Gastos {0} F"],
"après impôt":["after tax","dopo le imposte","después de impuestos"],
"perte":["loss","perdita","pérdida"],
"Autres ventes":["Other sales","Altre vendite","Otras ventas"],"Cultures":["Crops","Colture","Cultivos"],"Autre":["Other","Altro","Otro"],"Ventes":["Sales","Vendite","Ventas"],"Marge":["Margin","Margine","Margen"],
"Couvoir":["Hatchery","Incubatoio","Incubadora"],
"Charges communes":["Shared costs","Spese comuni","Gastos comunes"],
"Marge totale":["Total margin","Margine totale","Margen total"],
"Amortissements":["Depreciation","Ammortamenti","Amortizaciones"],
"Bénéfice avant impôt":["Profit before tax","Utile prima delle imposte","Beneficio antes de impuestos"],
"Impôt ({0} %)":["Tax ({0} %)","Imposte ({0} %)","Impuesto ({0} %)"],
"Si le rythme continue jusqu'à la fin de l'année":["If the current pace continues until the end of the year","Se il ritmo continua fino alla fine dell'anno","Si el ritmo sigue hasta el final del año"],
"Chiffre d'affaires prévu":["Expected turnover","Fatturato previsto","Volumen de negocio previsto"],
"Bénéfice net prévu":["Expected net profit","Utile netto previsto","Beneficio neto previsto"],
"Aucune vente ni dépense enregistrée pour cette année.":["No sales or costs recorded for this year.","Nessuna vendita né spesa registrata per quest'anno.","Ninguna venta ni gasto registrado para este año."],
"Réglages du bilan":["Results settings","Impostazioni del bilancio","Ajustes del balance"],
"Taux d'impôt sur le bénéfice (%)":["Tax rate on profit (%)","Aliquota d'imposta sull'utile (%)","Tipo de impuesto sobre el beneficio (%)"],
"Au Burkina Faso, l'impôt sur les sociétés est de {0} %.":["In Burkina Faso, corporate tax is {0} %.","In Burkina Faso l'imposta sulle società è del {0} %.","En Burkina Faso, el impuesto de sociedades es del {0} %."],
"Mettez {0} si votre activité est exonérée.":["Enter {0} if your activity is exempt.","Metti {0} se la tua attività è esente.","Pon {0} si tu actividad está exenta."],
"Durée d'amortissement (années)":["Depreciation period (years)","Durata dell'ammortamento (anni)","Duración de la amortización (años)"],
"Autres investissements (bâtiments, couveuses…) en FCFA":["Other investments (buildings, incubators…) in FCFA","Altri investimenti (edifici, incubatrici…) in FCFA","Otras inversiones (edificios, incubadoras…) en FCFA"],
"Année de l'investissement":["Year of the investment","Anno dell'investimento","Año de la inversión"],
"Enregistrer":["Save","Salva","Guardar"],"Enregistré.":["Saved.","Salvato.","Guardado."],"Échec de l'enregistrement.":["Saving failed.","Salvataggio non riuscito.","Error al guardar."],
"Comment c'est calculé":["How it is calculated","Come viene calcolato","Cómo se calcula"],
"Ventes : factures datées de l'année, et poussins encaissés au couvoir (jamais comptés deux fois).":["Sales: invoices dated in the year, and chicks paid at the hatchery (never counted twice).","Vendite: fatture dell'anno e pulcini incassati all'incubatoio (mai contati due volte).","Ventas: facturas del año y pollitos cobrados en la incubadora (nunca contados dos veces)."],
"Si aucune facture n'est faite pour une espèce, ses ventes d'œufs ou de lait sont estimées depuis les saisies du jour.":["If no invoice is made for a species, its egg or milk sales are estimated from the daily records.","Se non viene fatta nessuna fattura per una specie, le vendite di uova o latte sono stimate dalle registrazioni giornaliere.","Si no se hace ninguna factura para una especie, sus ventas de huevos o leche se estiman con los registros diarios."],
"Aliment et achat d'animaux : pris dans le cahier de caisse s'ils y sont notés, sinon calculés depuis vos saisies et vos lots.":["Feed and animal purchases: taken from the cash book if recorded there, otherwise calculated from your daily records and batches.","Mangime e acquisto animali: presi dal libro cassa se vi sono annotati, altrimenti calcolati dalle registrazioni e dai lotti.","Pienso y compra de animales: tomados del libro de caja si están anotados, si no calculados con tus registros y lotes."],
"Les investissements sont étalés sur la durée d'amortissement. Estimation à vérifier avec votre comptable.":["Investments are spread over the depreciation period. Estimate to check with your accountant.","Gli investimenti sono distribuiti sulla durata dell'ammortamento. Stima da verificare con il commercialista.","Las inversiones se reparten en la duración de la amortización. Estimación a comprobar con tu contable."]};
{const D=window.B2A_DICT=window.B2A_DICT||{};["en","it","es"].forEach((l,i)=>{D[l]=D[l]||{};for(const k in T)if(D[l][k]==null)D[l][k]=T[k][i]})}

/* ================= outils ================= */
const $=id=>document.getElementById(id);
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};
const N=v=>{if(v===""||v==null)return null;const n=Number(String(v).replace(",","."));return isFinite(n)?n:null};
const fmt=v=>A.fmt(v);
const money=v=>(v<0?"−":"")+fmt(Math.abs(Math.round(v)))+" F";
const yearOf=s=>Number(String(s||"").slice(0,4))||null;
const debounce=(f,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>f(...a),ms)}};

let db=null,canWrite=true,depenses=[],R={};
let year=new Date().getFullYear();

/* ================= carte ================= */
const card=el("section","card");card.id="b-bilan";
card.innerHTML=`<style>#b-tiles .tile{padding-left:8px;padding-right:8px}#b-tiles b{font-size:18px;white-space:nowrap}#b-tiles small{font-size:11px;overflow-wrap:normal;word-break:normal}</style><h2 class="sec">Bilan de l'année</h2>
<p class="note">Ventes, dépenses et bénéfice net de toute la ferme, par espèce.</p>
<div class="mnav"><button class="btn small ghost" type="button" id="b-yprev" aria-label="Année précédente">‹</button><b id="b-ylbl" data-notr></b><button class="btn small ghost" type="button" id="b-ynext" aria-label="Année suivante">›</button></div>
<div class="tiles" id="b-tiles" style="grid-template-columns:repeat(3,minmax(0,1fr))"></div>
<p class="note" id="b-empty" hidden>Aucune vente ni dépense enregistrée pour cette année.</p>
<div id="b-tables" style="display:grid;gap:8px"></div>
<div id="b-proj"></div>
<details class="box" id="b-set">
  <summary>Réglages du bilan</summary>
  <div class="grid2">
    <div class="field"><label for="b-impot">Taux d'impôt sur le bénéfice (%)</label><input type="number" id="b-impot" min="0" max="60" step="0.5" inputmode="decimal" placeholder="27,5"><small>Au Burkina Faso, l'impôt sur les sociétés est de 27,5 %. Mettez 0 si votre activité est exonérée.</small></div>
    <div class="field"><label for="b-duree">Durée d'amortissement (années)</label><input type="number" id="b-duree" min="1" max="30" inputmode="numeric" placeholder="5"></div>
    <div class="field"><label for="b-invest">Autres investissements (bâtiments, couveuses…) en FCFA</label><input type="number" id="b-invest" min="0" inputmode="decimal" placeholder="0"></div>
    <div class="field"><label for="b-investan">Année de l'investissement</label><input type="number" id="b-investan" min="2000" max="2100" inputmode="numeric"></div>
  </div>
  <div class="row"><button class="btn small" type="button" id="b-save">Enregistrer</button><span class="msg" id="b-msg"></span></div>
</details>
<details class="box">
  <summary>Comment c'est calculé</summary>
  <p class="note">Ventes : factures datées de l'année, et poussins encaissés au couvoir (jamais comptés deux fois).</p>
  <p class="note">Si aucune facture n'est faite pour une espèce, ses ventes d'œufs ou de lait sont estimées depuis les saisies du jour.</p>
  <p class="note">Aliment et achat d'animaux : pris dans le cahier de caisse s'ils y sont notés, sinon calculés depuis vos saisies et vos lots.</p>
  <p class="note">Les investissements sont étalés sur la durée d'amortissement. Estimation à vérifier avec votre comptable.</p>
</details>`;
{const after=$("p-caisse")||$("v-listcard");if(after)after.after(card);else{const v=$("v-ventes");if(v)v.append(card)}}
/* masquer pendant la saisie d'une facture */
{const f=$("v-form");if(f){const sync=()=>{card.hidden=!f.hidden};new MutationObserver(sync).observe(f,{attributes:true,attributeFilter:["hidden"]});sync()}}

/* ================= calcul ================= */
/* Chaque lot compte dans le groupe de son espèce (ou de sa culture) : valable pour toutes les espèces de l'application. */
const COUV="Couvoir",AUTRES="Autres ventes",COMMUN="Charges communes";
const PROD_GRP={oeufs:"Poules pondeuses",oeufs_plateau:"Poules pondeuses",reforme:"Poules pondeuses",poulets:"Poulets de chair",poulets_kg:"Poulets de chair",poussins:COUV};
function grpOf(l){if(!l)return AUTRES;
  if(A.isCrop&&A.isCrop(l)){if(l.culture==="autre"&&l.cultureAutre)return l.cultureAutre;const C=window.B2A_CULT&&window.B2A_CULT.crops;return (C&&C[l.culture]&&C[l.culture].n)||"Cultures"}
  return l.espece||"Autre"}
function taux(){const v=N(R.impot);return v==null?27.5:Math.max(0,Math.min(60,v))}
function duree(){const v=N(R.duree);return v==null?5:Math.max(1,Math.min(30,Math.round(v)))}

function compute(Y){
  const lots=(A.allLots&&A.allLots())||A.lots()||[];const byId={};lots.forEach(l=>byId[l.id]=l);
  const order=[...new Set(lots.map(grpOf))];[COUV,AUTRES,COMMUN].forEach(g=>{if(!order.includes(g))order.push(g)});
  const acts={};const G=g=>acts[g]||(acts[g]={v:0,d:0},order.includes(g)||order.splice(order.length-3,0,g),acts[g]);
  order.forEach(g=>acts[g]={v:0,d:0});
  let enc=0,poussFact=0,poussPaye=0,nb=0;
  /* ventes : factures de l'année */
  (A.factures()||[]).forEach(f=>{if(yearOf(f.date)!==Y)return;const t=A.facTotals(f);nb++;enc+=t.paye||0;
    const ratio=t.sous?t.total/t.sous:0,pr=t.total?(t.paye||0)/t.total:0;const lot=f.lotId&&byId[f.lotId];
    (f.lignes||[]).forEach(x=>{const amt=(Number(x.qte)||0)*(Number(x.pu)||0)*ratio;
      if(x.prod==="poussins"){poussFact+=amt;poussPaye+=amt*pr;return}
      G(lot?grpOf(lot):(PROD_GRP[x.prod]||AUTRES)).v+=amt})});
  /* espèce sans facture cette année : ventes d'œufs ou de lait estimées depuis les saisies (prix du lot) */
  const facGrp=new Set(order.filter(g=>acts[g].v>0));
  (A.saisies()||[]).forEach(s=>{if(yearOf(s.date)!==Y)return;const l=byId[s.lotId];if(!l||facGrp.has(grpOf(l)))return;
    const q=N(s.oeufs),pv=Number(l.prixOeuf)||0;if(q&&pv&&(A.isLayer(l)||(A.isDairy&&A.isDairy(l)))){G(grpOf(l)).v+=q*pv;nb++}});
  /* couvoir : coûts des couvées et poussins encaissés (toutes espèces couvées) */
  let couvEnc=0;const C=window.B2A_COUV;
  if(C)(C.batches()||[]).forEach(b=>{if(yearOf(b.debut)!==Y)return;nb++;let s=null;try{s=C.sale(b)}catch(e){}
    if(!s)return;G(COUV).d+=s.c.total||0;if(s.reel!=null)couvEnc+=s.reel});
  G(COUV).v+=Math.max(poussFact,couvEnc);if(couvEnc>poussFact)enc+=couvEnc-poussPaye;
  /* dépenses : cahier de caisse */
  const cats=new Set();
  depenses.forEach(d=>{if(yearOf(d.date)!==Y)return;nb++;cats.add(d.cat);const l=d.lotId&&byId[d.lotId];
    G(l?grpOf(l):COMMUN).d+=Number(d.montant)||0});
  /* dépenses estimées depuis les lots quand elles ne sont pas dans la caisse */
  if(!cats.has("aliment"))(A.saisies()||[]).forEach(s=>{if(yearOf(s.date)!==Y)return;const l=byId[s.lotId];const kg=N(s.alimentKg),pa=l?Number(l.prixAliment)||0:0;
    if(l&&kg&&pa)G(grpOf(l)).d+=kg*pa});
  if(!cats.has("animaux"))lots.forEach(l=>{if(yearOf(l.arrivee)!==Y||(A.isCrop&&A.isCrop(l)))return;const v=(Number(l.prixSujet)||0)*(Number(l.effectif)||0);if(v){G(grpOf(l)).d+=v;nb++}});
  /* amortissements */
  const du=duree();let amort=0;
  const am=(inv,y0)=>{if(inv>0&&y0&&Y>=y0&&Y<y0+du)amort+=inv/du};
  lots.forEach(l=>am(Number(l.investissement)||0,yearOf(l.arrivee)));am(N(R.invest)||0,Math.round(N(R.investAn)||0));
  const rows=order.filter(g=>acts[g].v||acts[g].d).map(g=>[g,acts[g]]);
  const ca=rows.reduce((p,[,a])=>p+a.v,0),dep=rows.reduce((p,[,a])=>p+a.d,0);
  const marge=ca-dep,avant=marge-amort,imp=avant>0?avant*taux()/100:0;
  return {rows,ca,dep,marge,amort,avant,imp,net:avant-imp,enc,empty:!nb&&!amort};
}

/* ================= affichage ================= */
/* montant abrégé pour les tuiles (écran de téléphone) */
function short(v){const a=Math.abs(v),sg=v<0?"−":"";
  if(a>=1e6)return sg+(a/1e6).toLocaleString("fr-FR",{maximumFractionDigits:a>=1e8?0:2})+" M F";
  if(a>=1e4)return sg+Math.round(a/1e3).toLocaleString("fr-FR")+" k F";return money(v)}
/* liste lisible sur téléphone : libellé à gauche, montant à droite, détail dessous */
function list(items){const ul=el("ul","dlist");items.forEach(r=>{const li=el("li");li.style.display="flex";li.style.flexWrap="wrap";li.style.justifyContent="space-between";li.style.gap="2px 12px";
    const a=el("span",null,r.label),b=el("b",null,r.value);if(r.sign!=null)b.style.color=r.sign>=0?"var(--ok, #2e7d32)":"var(--bad, #c62828)";
    if(r.bold){a.style.fontWeight="700";b.style.fontSize="1.1em"}li.append(a,b);
    if(r.sub){const sm=el("small",null,r.sub);sm.style.flexBasis="100%";li.append(sm)}ul.append(li)});return ul}
function render(){
  if(!$("b-ylbl"))return;$("b-ylbl").textContent=String(year);const cy=new Date().getFullYear();$("b-ynext").disabled=year>=cy;
  const S=compute(year);const T2=$("b-tiles");T2.innerHTML="";
  const tile=(l,v,sm,cls)=>{const t=el("div","tile"+(cls?" "+cls:""));t.append(el("span",null,l),el("b",null,v));if(sm)t.append(el("small",null,sm));T2.append(t)};
  tile("Chiffre d'affaires",short(S.ca),S.enc>0?`dont ${fmt(Math.round(S.enc))} F encaissés`:null,"ok");
  tile("Dépenses",short(S.dep+S.amort),S.amort?"amortis inclus":null,S.dep?"warn":null);
  tile("Bénéfice net",short(S.net),S.net>=0?"après impôt":"perte",S.net>=0?"ok":"bad");
  $("b-empty").hidden=!S.empty;const W=$("b-tables");W.innerHTML="";$("b-proj").innerHTML="";if(S.empty)return;
  W.append(el("span","label","Marge par espèce"));
  W.append(list(S.rows.map(([n,a])=>({label:n,value:money(a.v-a.d),sign:a.v-a.d,sub:[a.v?`Ventes ${money(a.v)}`:null,a.d?`Dépenses ${money(a.d)}`:null].filter(Boolean).join(" · ")}))));
  const sum=[{label:"Marge totale",value:money(S.marge),sign:S.marge}];
  if(S.amort)sum.push({label:"Amortissements",value:money(-S.amort)});
  sum.push({label:"Bénéfice avant impôt",value:money(S.avant),sign:S.avant});
  sum.push({label:`Impôt (${String(taux()).replace(".",",")} %)`,value:money(-S.imp)});
  sum.push({label:"Bénéfice net",value:money(S.net),sign:S.net,bold:true});
  W.append(list(sum));
  /* projection sur l'année en cours */
  if(year===cy){const now=new Date(),d0=new Date(cy,0,1);const doy=Math.floor((now-d0)/864e5)+1;
    if(doy>=30&&doy<355){const k=365/doy;const avant=S.marge*k-S.amort,net=avant-(avant>0?avant*taux()/100:0);
      const P=$("b-proj");P.append(el("span","label","Si le rythme continue jusqu'à la fin de l'année"));
      const tl=el("div","tiles");tl.style.gridTemplateColumns="repeat(2,minmax(0,1fr))";
      [["Chiffre d'affaires prévu",short(S.ca*k),null],["Bénéfice net prévu",short(net),net>=0?"ok":"bad"]].forEach(([l,v,c])=>{const t=el("div","tile"+(c?" "+c:""));t.append(el("span",null,l),el("b",null,v));tl.append(t)});
      P.append(tl)}}
}
const rerender=debounce(()=>{try{render()}catch(e){}},120);
function fillSet(){if(document.activeElement&&document.activeElement.closest("#b-set"))return;
  $("b-impot").value=R.impot??"";$("b-duree").value=R.duree??"";$("b-invest").value=R.invest??"";$("b-investan").value=R.investAn??new Date().getFullYear()}
$("b-yprev").onclick=()=>{year--;render()};
$("b-ynext").onclick=()=>{if(year<new Date().getFullYear()){year++;render()}};
$("b-save").onclick=async()=>{const m=$("b-msg");
  R={impot:N($("b-impot").value),duree:N($("b-duree").value),invest:N($("b-invest").value),investAn:N($("b-investan").value)};render();
  if(!db||!canWrite){m.textContent="Échec de l'enregistrement.";m.className="msg err";return}
  try{await db.doc("reglages/bilan").set(R);m.textContent="Enregistré.";m.className="msg good"}catch(e){m.textContent="Échec de l'enregistrement.";m.className="msg err"}};
addEventListener("b2a-factures",rerender);addEventListener("b2a-data",rerender);
{const t=$("tab-ventes");if(t)t.addEventListener("click",rerender)}
fillSet();render();

(async()=>{
  try{const u=await claude.use("user");if(u){const cw=await u.can("data.write");if(cw===false)canWrite=false}}catch(e){}
  try{db=await claude.use("db")}catch(e){db=null}
  if(!canWrite)$("b-save").hidden=true;
  if(!db)return;
  db.collection("depenses").onSnapshot(s=>{depenses=s.docs.map(d=>({id:d.id,...d.data()}));rerender()},()=>{});
  db.collection("couvees").onSnapshot(()=>rerender(),()=>{});
  db.collection("saisies").onSnapshot(()=>rerender(),()=>{});
  db.doc("reglages/bilan").onSnapshot(d=>{R=d.exists?d.data():{};fillSet();rerender()},()=>{});
})();
})();
