/* B2A Smart Farming : application principale */
(function(){
const $=id=>document.getElementById(id);
const notr=e=>{e.setAttribute("data-notr","");return e};
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};
const num=v=>Math.max(0,Math.min(100,Number(v)||0));
const N=v=>{if(v===""||v==null)return null;const n=Number(String(v).replace(",","."));return isFinite(n)?n:null};
const pad=n=>String(n).padStart(2,"0");
const iso=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const today=()=>iso(new Date());
const daysBetween=(a,b)=>Math.round((new Date(b+"T12:00")-new Date(a+"T12:00"))/864e5);
const fmt=(v,d=0)=>v==null||!isFinite(v)?"—":v.toLocaleString("fr-FR",{maximumFractionDigits:d,minimumFractionDigits:d});
const fdate=s=>new Date(s+"T12:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short"});

/* ---------- state ---------- */
let db=null,user=null,me=null,canWrite=true;
let lots=[],saisies=[],analyses=[],previsions={},soins={},selLot=null,editLot=null;const busyPrev={};
const names={};

/* ---------- tabs ---------- */
const TABS=["tableau","saisie","calendrier","formules","ventes","couvoir","marche","diagnostic"];
function show(t){const chg=$("v-"+t)&&$("v-"+t).hidden;TABS.forEach(x=>{$("v-"+x).hidden=x!==t;$("tab-"+x).setAttribute("aria-selected",x===t)});if(t==="formules")setTimeout(()=>{try{renderFormules()}catch(e){}},0);if(t==="couvoir")setTimeout(()=>{try{window.renderCouvoir&&window.renderCouvoir()}catch(e){}},0);if(t==="ventes")setTimeout(()=>{try{fillVLots();renderVentes()}catch(e){}},0);if(chg)try{window.scrollTo(0,0)}catch(e){}try{history.replaceState(null,"","#"+t)}catch(e){}window.scrollTo(0,0)}
function goHome(){try{formOpen=false;detailOpen=false}catch(e){}$("lotform-card").hidden=true;show("tableau");try{renderLots()}catch(e){}window.scrollTo(0,0)}
TABS.forEach(t=>$("tab-"+t).onclick=()=>t==="tableau"?goHome():show(t));
{const lg=document.querySelector(".band .ic");if(lg){lg.style.cursor="pointer";lg.setAttribute("role","button");lg.setAttribute("tabindex","0");lg.setAttribute("aria-label","Retour à l'accueil");lg.onclick=goHome;lg.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();goHome()}}}}
show(TABS.includes(location.hash.slice(1))?location.hash.slice(1):"tableau");

function dbMsg(t,err){const m=$("dbmsg");m.hidden=!t;m.textContent=t||"";m.className="msg"+(err?" err":"")}

/* ---------- stats ---------- */
function isLayer(l){return /pondeuse/i.test(l.espece||"")}
function isCrop(l){return !!l&&l.type==="culture"}
const CC=()=>window.B2A_CULT||null;
function stats(l){
  const rows=saisies.filter(s=>s.lotId===l.id).sort((a,b)=>a.date<b.date?-1:1);
  let alive=(Number(l.effectif)||0)-(Number(l.mortsAvant)||0);const out=[];
  for(const s of rows){const start=alive;const o=N(s.oeufs),m=N(s.morts)||0,a=N(s.alimentKg);
    out.push({date:s.date,start,oeufs:o,morts:m,aliment:a,poids:N(s.poidsG),note:s.note,by:s.by,
      ponte:o!=null&&start>0&&isLayer(l)?o/start*100:null,lait:o!=null&&start>0&&isDairy(l)?o/start:null,poidsD:N(s.poidsG)!=null?(big(l)?N(s.poidsG)/1000:N(s.poidsG)):null,gpj:a!=null&&a>0&&start>0?a*1000/start:null});alive-=m;}
  const res={rows:out,alive,last:out[out.length-1]||null,l};
  const mean=a=>{const v=a.filter(x=>x!=null);return v.length?v.reduce((p,c)=>p+c,0)/v.length:null};
  const last7=out.slice(-7),prev7=out.slice(-14,-7);
  res.ponte7=mean(last7.map(r=>r.ponte));res.pontePrev=mean(prev7.map(r=>r.ponte));res.lait7=mean(last7.map(r=>r.lait));res.laitPrev=mean(prev7.map(r=>r.lait));
  res.morts7=last7.reduce((p,r)=>p+r.morts,0);res.mortsTot=(Number(l.effectif)||0)-alive;
  res.morts7pct=alive>0?res.morts7/alive*100:0;res.mortsTotPct=l.effectif?res.mortsTot/l.effectif*100:0;
  {const fr=last7.filter(r=>r.gpj!=null);const bd=fr.reduce((p,r)=>p+r.start,0);res.gpj7=bd>0?fr.reduce((p,r)=>p+r.aliment,0)*1000/bd:null;res.feedDays7=fr.length}
  const pa=Number(l.prixAliment)||0,pv=Number(l.prixOeuf)||0;
  const o7=last7.reduce((p,r)=>p+(r.oeufs||0),0);
  const both=last7.filter(r=>r.oeufs!=null&&r.aliment!=null&&r.aliment>0),ob=both.reduce((p,r)=>p+r.oeufs,0),ab=both.reduce((p,r)=>p+r.aliment,0);
  res.oeufs7=o7;res.coutOeuf=pa&&ob?ab*pa/ob:null;res.marge7=pv&&pa&&both.length?(ob*pv-ab*pa):null;
  const ageW=(Number(l.ageArrivee)||0)+(l.arrivee?Math.floor(daysBetween(l.arrivee,today())/7):0);res.ageW=ageW;
  const poidsRows=out.filter(r=>r.poids!=null);res.poids=poidsRows.length?poidsRows[poidsRows.length-1].poids:null;res.poidsDate=poidsRows.length?poidsRows[poidsRows.length-1].date:null;
  res.gmq=null;if(poidsRows.length>=2){const a=poidsRows[poidsRows.length-2],b=poidsRows[poidsRows.length-1];const dd=daysBetween(a.date,b.date);if(dd>0)res.gmq=(b.poids-a.poids)/dd}
  /* alerts */
  const al=[];
  if(!out.length)al.push(["warn","Aucune saisie pour ce lot. Commencez dans « Saisie du jour »."]);
  else{const gap=daysBetween(res.last.date,today());if(gap>=2)al.push(["warn",`Pas de saisie depuis ${gap} jours.`]);}
  if(isLayer(l)&&res.ponte7!=null&&res.pontePrev!=null){const d=res.ponte7-res.pontePrev;
    if(d<=-5)al.push(["bad",`Ponte en baisse de ${fmt(-d,1)} points sur 7 jours (${fmt(res.ponte7,1)} % contre ${fmt(res.pontePrev,1)} %). Vérifier eau, aliment, chaleur, maladie.`]);
    else if(d<=-2)al.push(["warn",`Ponte en léger recul : −${fmt(-d,1)} point sur 7 jours.`]);}
  if(isDairy(l)&&res.lait7!=null&&res.laitPrev!=null&&res.lait7<res.laitPrev*0.9)al.push(["warn",`Production de lait en baisse : ${fmt(res.lait7,2)} L/tête/jour contre ${fmt(res.laitPrev,2)} la semaine précédente. Vérifier eau, ration, mammites.`]);
  if((!hasProd(l)||isLayer(l))&&res.poids!=null&&res.poidsDate&&daysBetween(res.poidsDate,today())<=21){const aW=(Number(l.ageArrivee)||0)+(l.arrivee?daysBetween(l.arrivee,res.poidsDate)/7:0);const sw=stdWeight(l,aW);
    if(sw&&res.poids/1000<sw*0.9){const ra=ration(l,res);al.push([res.poids/1000<sw*0.8?"bad":"warn",`Croissance en retard : ${fmtW(l,res.poids)} contre ≈ ${fmtW(l,sw*1000)} attendu à cet âge (−${fmt((1-res.poids/1000/sw)*100)} %). Rattrapage : ${ra?`donner ${fmt(ra.g)} g par sujet et par jour, `:""}garder l'aliment de croissance, déparasiter et peser chaque semaine.`])}
    else if(sw&&res.poids/1000>sw*1.1&&isLayer(l)&&aW<18)al.push(["info",`Poulettes plus lourdes que le standard (${fmtW(l,res.poids)} contre ≈ ${fmtW(l,sw*1000)}) : ration légèrement réduite pour éviter l'engraissement avant la ponte.`]);}
  if(res.morts7pct>0.5)al.push(["bad",`Mortalité élevée : ${res.morts7} morts en 7 jours (${fmt(res.morts7pct,2)} % du lot). Faire autopsier un sujet par un vétérinaire.`]);
  else if(res.morts7pct>0.2)al.push(["warn",`Mortalité à surveiller : ${res.morts7} morts en 7 jours.`]);
  if(/poule|poulet|pintade/i.test(l.espece||"")&&res.gpj7!=null&&res.ageW>=18){
    if(res.gpj7<95)al.push(["warn",`Consommation faible : ${fmt(res.gpj7)} g/sujet/jour (normal 110–125 g pour une pondeuse adulte).`]);
    else if(res.gpj7>140)al.push(["warn",`Consommation élevée : ${fmt(res.gpj7)} g/sujet/jour. Vérifier le gaspillage aux mangeoires.`]);}
  res.alerts=al;res.level=al.some(a=>a[0]==="bad")?"bad":al.some(a=>a[0]==="warn")?"warn":"ok";
  return res;
}

/* ---------- programme sanitaire & alertes automatiques ---------- */
const PROG={
 pondeuse:{mode:"age",items:[
  {c:"marek",j:1,n:"Marek",t:"vaccin",v:"Injection au couvoir : demander le certificat"},
  {c:"vit1",j:1,n:"Vitamines anti-stress + sucre (3 jours)",t:"traitement",v:"Eau de boisson"},
  {c:"ndib1",j:5,n:"Newcastle + Bronchite (HB1 / H120)",t:"vaccin",v:"Eau de boisson ou goutte oculaire"},
  {c:"cocci1",j:10,n:"Anticoccidien préventif (3 jours)",t:"traitement",v:"Eau de boisson (amprolium)"},
  {c:"gum1",j:14,n:"Gumboro 1",t:"vaccin",v:"Eau de boisson"},
  {c:"nd2",j:21,n:"Newcastle rappel (La Sota)",t:"vaccin",v:"Eau de boisson"},
  {c:"gum2",j:24,n:"Gumboro 2",t:"vaccin",v:"Eau de boisson"},
  {c:"vario",j:35,n:"Variole aviaire",t:"vaccin",v:"Transfixion de l'aile"},
  {c:"verm1",j:42,n:"Déparasitage",t:"traitement",v:"Eau de boisson"},
  {c:"ndib2",j:49,n:"Newcastle + Bronchite rappel",t:"vaccin",v:"Eau de boisson"},
  {c:"typh",j:63,n:"Typhose aviaire",t:"vaccin",v:"Injection"},
  {c:"nd3",j:84,n:"Newcastle rappel (La Sota)",t:"vaccin",v:"Eau de boisson"},
  {c:"verm2",j:98,n:"Déparasitage",t:"traitement",v:"Eau de boisson"},
  {c:"ndeds",j:112,n:"Newcastle inactivé + EDS (ex. ITA-New)",t:"vaccin",v:"Injection intramusculaire, avant la ponte"},
  {c:"pondoirs",j:112,n:"Installer les pondoirs",t:"conduite",v:"1 nid pour 4 à 5 poules"},
  {c:"verm3",j:119,n:"Déparasitage + traitement poux avant ponte",t:"traitement",v:"Eau de boisson + poudre sur litière"},
  {c:"lum",j:120,n:"Allonger l'éclairage progressivement jusqu'à 16 h/jour",t:"conduite",v:"+30 min par semaine"},
  {c:"ndr",j:182,n:"Newcastle rappel en ponte (La Sota)",t:"vaccin",v:"Eau de boisson",every:56},
  {c:"vermr",j:203,n:"Déparasitage en ponte",t:"traitement",v:"Eau de boisson, produit sans délai d'attente sur les œufs",every:56}]},
 chair:{mode:"age",items:[
  {c:"marek",j:1,n:"Marek / Newcastle + Bronchite",t:"vaccin",v:"Au couvoir : demander le certificat"},
  {c:"vit1",j:1,n:"Vitamines anti-stress + sucre (3 jours)",t:"traitement",v:"Eau de boisson"},
  {c:"ndib1",j:7,n:"Newcastle + Bronchite (HB1 / H120)",t:"vaccin",v:"Eau de boisson"},
  {c:"cocci1",j:10,n:"Anticoccidien préventif (3 jours)",t:"traitement",v:"Eau de boisson"},
  {c:"gum1",j:12,n:"Gumboro 1",t:"vaccin",v:"Eau de boisson"},
  {c:"nd2",j:18,n:"Newcastle rappel (La Sota)",t:"vaccin",v:"Eau de boisson"},
  {c:"gum2",j:21,n:"Gumboro 2",t:"vaccin",v:"Eau de boisson"}]},
 local:{mode:"age",items:[
  {c:"ndib1",j:7,n:"Newcastle (HB1)",t:"vaccin",v:"Eau de boisson"},
  {c:"gum1",j:14,n:"Gumboro",t:"vaccin",v:"Eau de boisson"},
  {c:"nd2",j:21,n:"Newcastle rappel (La Sota)",t:"vaccin",v:"Eau de boisson"},
  {c:"vario",j:35,n:"Variole aviaire",t:"vaccin",v:"Transfixion de l'aile"},
  {c:"verm1",j:42,n:"Déparasitage",t:"traitement",v:"Eau de boisson"},
  {c:"ndr",j:105,n:"Newcastle rappel",t:"vaccin",v:"Eau de boisson",every:90},
  {c:"vermr",j:120,n:"Déparasitage",t:"traitement",v:"Eau de boisson",every:90}]},
 petitsrum:{mode:"arr",items:[
  {c:"verm1",j:7,n:"Déparasitage interne + externe",t:"traitement",v:"Voie orale + bain ou pour-on",every:90},
  {c:"ppr",j:14,n:"Peste des petits ruminants (PPR)",t:"vaccin",v:"Injection sous-cutanée",every:365},
  {c:"past",j:21,n:"Pasteurellose",t:"vaccin",v:"Injection",every:365}]},
 bovin:{mode:"arr",items:[
  {c:"verm1",j:7,n:"Déparasitage",t:"traitement",v:"Voie orale ou injection",every:90},
  {c:"ppcb",j:14,n:"Péripneumonie (PPCB)",t:"vaccin",v:"Injection",every:365},
  {c:"past",j:21,n:"Pasteurellose",t:"vaccin",v:"Injection",every:365},
  {c:"charb",j:28,n:"Charbon symptomatique",t:"vaccin",v:"Injection",every:365}]},
 porc:{mode:"arr",items:[
  {c:"verm1",j:7,n:"Déparasitage",t:"traitement",v:"Voie orale ou injection",every:60},
  {c:"fer",j:14,n:"Contrôle santé et hygiène de la porcherie",t:"conduite",v:"Désinfection, pédiluve",every:30}]},
 poisson:{mode:"arr",items:[
  {c:"accl",j:0,n:"Acclimatation des alevins",t:"conduite",v:"Égaliser la température de l'eau pendant 15 à 20 minutes avant le lâcher"},
  {c:"eau",j:7,n:"Contrôle de la qualité de l'eau",t:"conduite",v:"Couleur, odeur, pH 6,5 à 8,5, renouvellement partiel",every:14},
  {c:"peche",j:30,n:"Pêche de contrôle et pesée",t:"conduite",v:"Peser 20 à 30 poissons et ajuster la ration",every:30},
  {c:"tri",j:60,n:"Tri par taille",t:"conduite",v:"Séparer les gros et les petits (évite le cannibalisme du silure)",every:60},
  {c:"sel",j:45,n:"Bain de sel si poissons stressés ou blessés",t:"traitement",v:"Bain à 3 % de sel pendant 5 minutes",every:90}]}
};
function progKey(l){const e=l.espece||"";return /poisson|tilapia|silure|clarias/i.test(e)?"poisson":/pondeuse/i.test(e)?"pondeuse":/chair/i.test(e)?"chair":/poulet|pintade/i.test(e)?"local":/chèvre|mouton/i.test(e)?"petitsrum":/bovin|vache/i.test(e)?"bovin":/porc/i.test(e)?"porc":null}
const dAdd=(isoD,n)=>{const d=new Date(isoD+"T12:00");d.setDate(d.getDate()+Math.round(n));return iso(d)};
function programme(l){
  const out=isCrop(l)?(CC()?CC().programme(l,soins):[]):[];const key=isCrop(l)?null:progKey(l);if(key&&l.arrivee){const P=PROG[key];const age0=(Number(l.ageArrivee)||0)*7;
    const endJ=P.mode==="age"?(Number(l.ageFin)||defaultEnd(l))*7:730;
    P.items.forEach(it=>{const js=[];if(it.every){for(let j=it.j;j<=endJ-21;j+=it.every)js.push(j)}else js.push(it.j);
      js.forEach(j=>{const date=P.mode==="age"?dAdd(l.arrivee,j-1-age0):dAdd(l.arrivee,j);if(date<l.arrivee)return;
        const code=it.every?it.c+"-"+j:it.c;const sd=soins[l.id+"_"+code];
        out.push({code,nom:it.n,type:it.t,voie:it.v,date,ageW:P.mode==="age"?Math.floor((j-1)/7):null,done:!!(sd&&sd.fait),doneDate:sd&&sd.dateFait,by:sd&&sd.by})})})}
  Object.values(soins).filter(x=>x.lotId===l.id&&x.custom).forEach(x=>out.push({code:x.code,nom:x.nom,type:x.type||"traitement",voie:"Ajouté par vous",date:x.datePrevue,done:!!x.fait,doneDate:x.dateFait,by:x.by,custom:true}));
  return out.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
}
const FEEDS={pondeuse:[[0,"Démarrage"],[6,"Croissance"],[10,"Poulette"],[16,"Pré-ponte"],[18,"Ponte"]],chair:[[0,"Démarrage"],[3,"Croissance"],[5,"Finition"]]};
function feedPhase(l,w){const F=FEEDS[progKey(l)];if(!F)return null;let cur=F[0],next=null;for(let i=0;i<F.length;i++){if(w>=F[i][0]){cur=F[i];next=F[i+1]||null}}return {cur:cur[1],next}}
function feedStock(l,s){
  const rows=saisies.filter(x=>x.lotId===l.id);const recu=rows.reduce((p,r)=>p+(N(r.alimentRecu)||0),0);
  if(l.stockAliment==null&&!recu)return null;
  const used=rows.reduce((p,r)=>p+(N(r.alimentKg)||0),0);const stock=(Number(l.stockAliment)||0)+recu-used;
  const recent=s.rows.slice(-7).filter(r=>r.aliment!=null&&r.aliment>0);
  let daily=recent.length?recent.reduce((p,r)=>p+r.aliment,0)/recent.length:((ration(l,s)||{}).kg||s.alive*stdFeed(l,s.ageW)/1000);if(!daily||daily<=0)daily=s.alive*0.1||1;
  const days=Math.max(0,stock/daily);const order=addDays(Math.max(0,days-5));const qty=daily*28;
  return {stock,daily,days,rupture:addDays(days),order,qty,cost:qty*(Number(l.prixAliment)||0)};
}
function allAlerts(l,s){
  const crop=isCrop(l);const A=crop?(CC()?CC().alerts(l):[]):s.alerts.slice();const t=today();
  const prog=programme(l);const late=prog.filter(p=>!p.done&&daysBetween(p.date,t)>=1);
  if(late.length&&crop)A.unshift(["bad",`${late.length} travaux en retard, dont « ${late[late.length-1].nom} » prévu le ${fdate(late[late.length-1].date)} : marquez-les faits dans le calendrier.`,"cal"]);
  else if(late.length)A.unshift(["bad",`${late.length} soin(s) en retard, dont « ${late[late.length-1].nom} » prévu le ${fdate(late[late.length-1].date)} : marquez-les faits ou rattrapez-les.`,"cal"]);
  prog.filter(p=>!p.done&&daysBetween(t,p.date)>=0&&daysBetween(t,p.date)<=3).forEach(p=>{const d=daysBetween(t,p.date);
    A.push([d===0?"bad":"warn",`${p.type==="vaccin"?"Vaccin":p.type==="traitement"?"Traitement":"À faire"} ${d===0?"aujourd'hui":d===1?"demain":"dans "+d+" jours"} : ${p.nom}.`,"cal"])});
  if(crop){const o0={bad:0,warn:1,info:2,ok:3};return A.sort((a,b)=>o0[a[0]]-o0[b[0]])}
  const fs=feedStock(l,s);
  if(fs){if(fs.stock<=0)A.unshift(["bad",`Stock d'aliment épuisé selon les saisies. Acheter environ ${fmt(fs.qty)} kg (≈ ${fmt(fs.cost)} F pour 4 semaines), puis noter l'achat dans la saisie du jour.`,"feed"]);
    else if(fs.days<=3)A.unshift(["bad",`Rupture d'aliment dans ${fmt(fs.days)} jour(s) : il reste ${fmt(fs.stock)} kg. Acheter environ ${fmt(fs.qty)} kg (≈ ${fmt(fs.cost)} F pour 4 semaines).`,"feed"]);
    else if(fs.days<=7)A.push(["warn",`Commander l'aliment : stock de ${fmt(fs.stock)} kg, soit ≈ ${fmt(fs.days)} jours. Prévoir ${fmt(fs.qty)} kg (≈ ${fmt(fs.cost)} F).`,"feed"]);}
  else if(progKey(l)) A.push(["info","Indiquez votre stock d'aliment (bouton Modifier) pour être prévenu avant la rupture.","feed"]);
  const fa=feedAge(l,s),ph=feedPhase(l,fa);if(ph&&ph.next&&ph.next[0]-fa<=1&&ph.next[0]-fa>=0){
    const lag=s.ageW-fa;A.push(["warn",`Changement d'aliment : passer de « ${ph.cur} » à « ${ph.next[1]} » ${lag>=0.5?`quand le lot aura le poids standard de ${ph.next[0]} semaines`:`à ${ph.next[0]} semaines`} (vers le ${fdate(dAdd(l.arrivee,(ph.next[0]-(Number(l.ageArrivee)||0)+lag)*7))}). Faire la transition sur 3 à 5 jours.`,"feed"]);}
  const end=Number(l.ageFin)||defaultEnd(l);const left=end-s.ageW;
  if(isLayer(l)&&left>=0&&left<=4)A.push(["warn",`Fin de cycle dans ${left} semaine(s) : préparer la vente des poules de réforme et commander le prochain lot.`,"plan"]);
  if(!hasProd(l)&&left>=0&&left<=(isPoultry(l)?1:3))A.push(["warn",`Fin d'engraissement dans ${left} semaine(s) : organiser la vente (${sp(l).sale.toLowerCase()}) et préparer le prochain lot.`,"plan"]);
  if(isDairy(l)&&left>=0&&left<=4)A.push(["warn",`Fin de la période prévue dans ${left} semaine(s) : décider des réformes et du renouvellement.`,"plan"]);
  if(big(l)&&spKey(l)&&s.rows.length){const lp=s.rows.filter(r=>r.poids!=null).pop();if(!lp||daysBetween(lp.date,t)>30)A.push(["info","Pesée mensuelle : pesez quelques animaux (ou mesurez le tour de poitrine) et notez le poids moyen.","plan"])}
  if(isPoultry(l)&&s.ageW<18&&s.rows.length){const lastP=s.rows.filter(r=>r.poids!=null).pop();if(!lastP||daysBetween(lastP.date,t)>7)A.push(["info","Pesée hebdomadaire : pesez 10 sujets et notez le poids moyen dans la saisie.","plan"])}
  const order={bad:0,warn:1,info:2,ok:3};return A.sort((a,b)=>order[a[0]]-order[b[0]]);
}
let alertsAll=false;
function alertList(items,limit,showAll,onToggle){const w=el("div");w.style.display="grid";w.style.gap="8px";const ul=el("ul","alerts");
  items.slice(0,showAll?items.length:limit).forEach(it=>ul.append(it));w.append(ul);
  if(items.length>limit){const b=el("button","more",showAll?"Voir moins":`Voir les ${items.length} alertes`);b.type="button";b.onclick=onToggle;w.append(b)}return w}
function renderGlobalAlerts(){
  const act=lots.filter(l=>l.actif!==false);const box=$("globalAlerts");box.innerHTML="";const items=[];const order={bad:0,warn:1,info:2};
  const all=[];act.forEach(l=>{const s=stats(l);allAlerts(l,s).filter(a=>a[0]!=="ok").forEach(a=>all.push([a,l]))});
  all.sort((x,y)=>order[x[0][0]]-order[y[0][0]]).forEach(([a,l])=>{const li=el("li","s-"+a[0]);li.append(el("span","dot"));const sp=el("span");
    if(act.length>1)sp.append(notr(el("span","lotname",l.nom+" : ")));sp.append(document.createTextNode(a[1]));li.append(sp);li.style.cursor="pointer";li.onclick=()=>openLot(l.id);items.push(li)});
  box.append(alertList(items,3,alertsAll,()=>{alertsAll=!alertsAll;renderGlobalAlerts()}));
  $("alertcard").hidden=!items.length;renderHome();
  try{dispatchEvent(new CustomEvent("b2a-alerts"))}catch(e){}
}
function renderHome(){
  const h=new Date().getHours();{const H=$("hello-t");H.textContent=(h<12?"Bonjour":h<18?"Bon après-midi":"Bonsoir")+(myFirst?", ":"");if(myFirst)H.append(el("span",null,myFirst))}
  $("hello-d").textContent=new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
  const act=lots.filter(l=>l.actif!==false);const T=$("tiles");T.innerHTML="";
  if(!act.length){T.hidden=true;return}T.hidden=false;
  let animaux=0,oeufs=0,hasEggs=false,nb=0,nw=0,next=null;
  act.forEach(l=>{const s=stats(l);if(!isCrop(l))animaux+=s.alive;if(isLayer(l)){hasEggs=true;const r=s.rows.find(r=>r.date===today());if(r&&r.oeufs!=null)oeufs+=r.oeufs}
    allAlerts(l,s).forEach(a=>{if(a[0]==="bad")nb++;else if(a[0]==="warn")nw++});
    programme(l).filter(p=>!p.done&&p.date>=today()).slice(0,1).forEach(p=>{if(!next||p.date<next.p.date)next={p,l}})});
  const tile=(lbl,val,sm,cls,fn)=>{const t=el(fn?"button":"div","tile"+(cls?" "+cls:""));if(fn){t.type="button";t.onclick=fn}t.append(el("span",null,lbl),el("b",null,val));if(sm)t.append(el("small",null,sm));T.append(t)};
  {const na=act.filter(l=>!isCrop(l)).length,cr=act.filter(isCrop);if(na||!cr.length)tile("Animaux",fmt(animaux),na+" lot"+(na>1?"s":""));
   if(cr.length&&CC())tile("Cultures",CC().surfTxt(cr),cr.length+" lot"+(cr.length>1?"s":""),null,()=>openLot(cr[0].id))}
  if(hasEggs)tile("Œufs aujourd'hui",fmt(oeufs),fmt(oeufs/30,1)+" plateaux",null,()=>show("saisie"));
  tile("Alertes",String(nb+nw),nb?nb+" urgente"+(nb>1?"s":""):"rien d'urgent",nb?"bad":nw?"warn":"ok",()=>$("alertcard").scrollIntoView({behavior:"smooth"}));
  if(next){const d=daysBetween(today(),next.p.date);tile("Prochain soin",d===0?"Aujourd'hui":d===1?"Demain":"Dans "+d+" j",next.p.nom,d<=1?"warn":null,()=>show("calendrier"))}
}
$("goCal").onclick=()=>show("calendrier");
function calItem(p,l,showLot){
  const t=today(),d=daysBetween(t,p.date);const li=el("li",p.done?"done":d<0?"late":d<=3?"soon":"");
  const dd=el("div","d");dd.append(el("b",null,new Date(p.date+"T12:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short"})));
  dd.append(document.createTextNode(p.done?"fait":d<0?`retard ${-d} j`:d===0?"aujourd'hui":`J−${d}`));li.append(dd);
  const w=el("div","w");const b=el("b");b.append(el("span","t t-"+p.type,p.type==="conduite"?"Travaux":p.type),document.createTextNode(p.nom));w.append(b);
  const sub=[showLot?l.nom:null,p.ageW!=null?p.ageW+" sem.":null,p.voie,p.done&&p.doneDate?"fait le "+fdate(p.doneDate)+(p.by&&names[p.by]?" par "+names[p.by]:""):null].filter(Boolean).join(" · ");w.append(el("small",null,sub));li.append(w);
  if(canWrite&&db&&!p.virtual){const btn=el("button","btn small "+(p.done?"ghost":""),p.done?"Annuler":"Fait");btn.type="button";
    btn.onclick=async()=>{btn.disabled=true;try{await setDone(l,p,!p.done)}catch(e){dbMsg(errText(e),true);btn.disabled=false}};li.append(btn)}else li.append(el("span"));
  return li;
}
async function setDone(l,p,done){
  const id=l.id+"_"+p.code;
  if(p.custom){await db.doc("soins/"+id).update({fait:done,dateFait:done?today():null,by:me});return}
  if(done)await db.doc("soins/"+id).set({lotId:l.id,code:p.code,fait:true,dateFait:today(),by:me});else await db.doc("soins/"+id).delete();
}
let calLot=null;
async function renderCal(){
  const act=lots.filter(l=>l.actif!==false);const cs=$("c-lot");const keep=calLot||selLot;cs.innerHTML="";
  act.forEach(l=>{const o=notr(el("option",null,l.nom));o.value=l.id;cs.append(o)});if(act.find(l=>l.id===keep))cs.value=keep;calLot=cs.value||null;
  // upcoming 30 days, all lots
  const up=$("upcoming");up.innerHTML="";const t=today();let items=[];
  act.forEach(l=>{const s=stats(l);programme(l).filter(p=>!p.done&&daysBetween(t,p.date)>=-0&&daysBetween(t,p.date)<=30).forEach(p=>items.push([p,l]));
    if(isCrop(l))return;const fs=feedStock(l,s);if(fs&&fs.days<=35)items.push([{code:"feed",nom:`Acheter l'aliment (≈ ${fmt(fs.qty)} kg, ${fmt(fs.cost)} F)`,type:"conduite",voie:`stock actuel ${fmt(fs.stock)} kg`,date:iso(fs.order),virtual:true},l]);
    const fa=feedAge(l,s),ph=feedPhase(l,fa);if(ph&&ph.next){const dt=dAdd(l.arrivee,(ph.next[0]-(Number(l.ageArrivee)||0)+(s.ageW-fa))*7);if(daysBetween(t,dt)>=0&&daysBetween(t,dt)<=30)items.push([{code:"ph",nom:`Passer à l'aliment ${ph.next[1]}`,type:"conduite",voie:"transition sur 3 à 5 jours",date:dt,virtual:true},l])}});
  items.sort((a,b)=>a[0].date<b[0].date?-1:1);
  if(!items.length)up.append(el("li",null,act.length?"Rien de prévu dans les 30 prochains jours.":"Créez un lot pour générer son calendrier."));
  items.forEach(([p,l])=>up.append(calItem(p,l,act.length>1)));
  // lot calendar
  const body=$("calbody");body.innerHTML="";$("feedbox").innerHTML="";
  const l=act.find(x=>x.id===calLot);$("c-add").hidden=!l||!canWrite||!db;if(!l)return;
  const s=stats(l);const crop=isCrop(l);const fs=crop?null:feedStock(l,s),ph=crop?null:feedPhase(l,feedAge(l,s));
  const K=el("div","kpis");if(ph)K.append(kpi("Aliment conseillé",ph.cur,ph.next?`« ${ph.next[1]} » à ${ph.next[0]} sem.`:"jusqu'à la fin du cycle"));
  if(fs){K.append(kpi("Stock d'aliment",fmt(Math.max(0,fs.stock))+" kg",fs.stock<=0?"épuisé : commander":`≈ ${fmt(fs.days)} jours (${fmt(fs.daily)} kg/jour)`,fs.days<=7?"down":null));
    K.append(kpi("Prochain achat",fs.order.toLocaleDateString("fr-FR",{day:"numeric",month:"short"}),`≈ ${fmt(fs.qty)} kg · ${fmt(fs.cost)} F`))}
  else K.append(kpi("Stock d'aliment","—","à indiquer dans Modifier"));
  if(!crop)$("feedbox").append(K);
  const prog=programme(l);if(!prog.length){body.append(el("p","note",crop?"Indiquez la date de semis du lot pour générer son calendrier cultural.":"Pas de programme type pour cette espèce. Ajoutez vos soins ci-dessous."));return}
  await loadNames([...new Set(prog.map(p=>p.by).filter(Boolean))]);
  const late=prog.filter(p=>!p.done&&daysBetween(p.date,t)>=1),next=prog.filter(p=>!p.done&&daysBetween(p.date,t)<1),done=prog.filter(p=>p.done);
  if(late.length){const h=el("div","row between");h.append(el("h3","sec",`En retard (${late.length})`));
    if(canWrite&&db){const b=el("button","btn small ghost","Déjà tous faits");b.type="button";
      b.onclick=async()=>{if(b.dataset.c!=="1"){b.dataset.c="1";b.textContent="Confirmer : marquer "+late.length+" soins faits";return}
        b.disabled=true;for(const p of late){try{await setDone(l,p,true)}catch(e){dbMsg(errText(e),true);break}}};h.append(b)}
    body.append(h);const ul=el("ul","cal");late.forEach(p=>ul.append(calItem(p,l)));body.append(ul)}
  body.append(el("h3","sec","À venir"));const ul2=el("ul","cal");next.forEach(p=>ul2.append(calItem(p,l)));if(!next.length)ul2.append(el("li",null,"Plus rien de prévu jusqu'à la fin du cycle."));body.append(ul2);
  if(done.length){const dt=el("details","box");dt.append(el("summary",null,`Faits (${done.length})`));const ul3=el("ul","cal");done.forEach(p=>ul3.append(calItem(p,l)));dt.append(ul3);body.append(dt)}
}
$("c-lot").onchange=()=>{calLot=$("c-lot").value;renderCal()};
$("c-date").value=today();
$("c-save").onclick=async()=>{const l=lots.find(x=>x.id===calLot);const nom=$("c-nom").value.trim(),d=$("c-date").value;
  if(!l||!nom||!d){$("c-msg").textContent="Indiquez quoi et quand.";$("c-msg").className="msg err";return}
  const code="c"+Date.now();try{await db.doc("soins/"+l.id+"_"+code).set({lotId:l.id,code,nom,type:$("c-type").value,datePrevue:d,custom:true,fait:false,by:me});
    $("c-nom").value="";$("c-msg").textContent="Ajouté.";$("c-msg").className="msg good"}catch(e){$("c-msg").textContent=errText(e);$("c-msg").className="msg err"}};
/* ---------- formules d'aliment et plans de fumure ---------- */
const ING={
 mais:{n:"Maïs grain",pb:8.5,em:3300,ca:0.02,lys:0.25,met:0.18,prix:200},
 sorgho:{n:"Sorgho grain",pb:10,em:3200,ca:0.03,lys:0.22,met:0.17,prix:175,note:"Sorgho blanc de préférence (le sorgho rouge contient des tanins)."},
 mil:{n:"Petit mil",pb:11,em:3100,ca:0.03,lys:0.27,met:0.24,prix:225},
 son:{n:"Son de blé",pb:15,em:1300,ca:0.12,lys:0.6,met:0.22,prix:160},
 sonriz:{n:"Son de riz fin",pb:12,em:2200,ca:0.08,lys:0.55,met:0.25,prix:75,note:"Son fin, sans balles de riz, et frais (il rancit vite)."},
 dreche:{n:"Drêche de dolo séchée",pb:25,em:2000,ca:0.3,lys:0.8,met:0.45,prix:75,note:"Bien sécher au soleil pour éviter les moisissures."},
 soja:{n:"Tourteau de soja",pb:44,em:2400,ca:0.3,lys:2.8,met:0.62,prix:420},
 sojagrain:{n:"Soja grain grillé",pb:36,em:3300,ca:0.25,lys:2.2,met:0.5,prix:375,note:"Toujours griller ou cuire : le soja cru freine la croissance."},
 arachide:{n:"Tourteau d'arachide",pb:45,em:2600,ca:0.2,lys:1.5,met:0.5,prix:300,note:"Seulement sec et sans moisissure (risque d'aflatoxines)."},
 coton:{n:"Tourteau de coton",pb:38,em:1900,ca:0.2,lys:1.6,met:0.55,prix:250,note:"Contient du gossypol : respecter le taux maximum."},
 graincoton:{n:"Graine de coton",pb:22,em:0,ca:0.15,lys:0.9,met:0.35,prix:150,note:"Réservée aux ruminants."},
 fanes:{n:"Fanes d'arachide ou de niébé",pb:12,em:0,ca:1.2,lys:0.5,met:0.15,prix:100,note:"Broyées. Réservées aux ruminants."},
 poisson:{n:"Farine de poisson",pb:55,em:2800,ca:5,lys:4,met:1.5,prix:400,note:"Au-delà du maximum, goût de poisson dans les œufs et la viande."},
 sang:{n:"Farine de sang",pb:80,em:2800,ca:0.3,lys:7,met:1,prix:250,note:"Peu appétente : petites quantités seulement."},
 coquille:{n:"Coquille / calcaire",pb:0,em:0,ca:38,lys:0,met:0,prix:150},
 phosphate:{n:"Phosphate bicalcique",pb:0,em:0,ca:23,lys:0,met:0,prix:800},
 premix:{n:"Prémix (CMV)",pb:0,em:0,ca:0,lys:0,met:0,prix:2000,note:"Prendre le prémix adapté à l'espèce (volailles, porcs, poissons ou ruminants)."},
 sel:{n:"Sel",pb:0,em:0,ca:0,lys:0,met:0,prix:250},
 methionine:{n:"DL-Méthionine",pb:58,em:0,ca:0,lys:0,met:99,prix:3500},
 lysine:{n:"L-Lysine",pb:95,em:0,ca:0,lys:78,met:0,prix:2500},
 huile:{n:"Huile végétale",pb:0,em:8800,ca:0,lys:0,met:0,prix:1000},
 melasse:{n:"Mélasse",pb:4,em:2000,ca:0.8,lys:0,met:0,prix:150}
};
/* ingrédients utilisables par groupe d'espèces, avec taux maximum (% du mélange) */
const ING_LIM={
 volaille:{mais:70,sorgho:30,mil:30,son:15,sonriz:10,soja:40,sojagrain:20,arachide:8,coton:5,poisson:8,sang:2,huile:4,coquille:10,phosphate:2,premix:1,sel:0.4,lysine:0.5,methionine:0.4},
 porc:{mais:70,sorgho:40,mil:30,son:30,sonriz:25,dreche:20,soja:30,sojagrain:20,arachide:10,coton:5,poisson:8,sang:3,huile:4,melasse:10,coquille:2,phosphate:2,premix:1,sel:0.5,lysine:0.5,methionine:0.2},
 poisson:{mais:40,sorgho:20,son:20,sonriz:15,dreche:15,soja:45,sojagrain:25,arachide:20,coton:20,poisson:55,sang:8,huile:6,phosphate:2,premix:1.5,lysine:0.5,methionine:0.4},
 rum:{mais:50,sorgho:40,mil:30,son:50,sonriz:30,dreche:30,soja:15,arachide:20,coton:35,graincoton:30,fanes:30,melasse:15,coquille:2,phosphate:2,premix:1,sel:2}
};
const SP_GRP={pondeuse:"volaille",chair:"volaille",local:"volaille",porc:"porc",poisson:"poisson",petitsrum:"rum",chevrelait:"rum",bovin:"rum",vachelait:"rum"};
const SP_LIM_X={pondeuse:{coton:3,poisson:6},chair:{son:5,sonriz:5}};
function ingLim(sp){return Object.assign({},ING_LIM[SP_GRP[sp]]||{},SP_LIM_X[sp]||{})}
const SPN={pondeuse:"Poules pondeuses",chair:"Poulets de chair",local:"Poulets locaux et pintades",porc:"Porcs",poisson:"Poissons (tilapia, silure)",petitsrum:"Moutons et chèvres (croissance et embouche)",chevrelait:"Chèvres laitières",bovin:"Bovins (croissance et embouche)",vachelait:"Vaches laitières"};
/* a : âge en semaines [début, fin[ · c : objectifs · g : ration repère en g par animal et par jour */
const FORM={
 pondeuse:[
  {id:"demarrage",t:"Démarrage (0 à 6 semaines)",a:[0,6],g:25,c:{pb:[19.5,21],ca:[0.9,1.1],em:[2800,3000],lys:[1.05,1.2],met:[0.45,0.55]},d:"À volonté. Environ 10 à 45 g par sujet et par jour selon l'âge. Eau propre en permanence.",
   f:{mais:47.75,sorgho:15,soja:25,poisson:5,son:4,phosphate:1.5,coquille:0.8,premix:0.5,sel:0.25,methionine:0.15,lysine:0.05}},
  {id:"croissance",t:"Croissance (6 à 10 semaines), formule B2A",a:[6,10],g:52,c:{pb:[16,18],ca:[0.8,1.1],em:[2700,2900],lys:[0.8,1],met:[0.38,0.5]},d:"Environ 45 à 60 g par sujet et par jour. Faire la transition sur 3 à 5 jours en mélangeant l'ancien et le nouvel aliment.",
   f:{mais:66.6,soja:18,son:8,poisson:2,coton:2,coquille:1,phosphate:1.5,premix:0.4,sel:0.3,methionine:0.2}},
  {id:"poulette",t:"Poulette (10 à 16 semaines)",a:[10,16],g:70,c:{pb:[14.5,16.5],ca:[0.9,1.1],em:[2600,2800],lys:[0.68,0.85],met:[0.32,0.42]},d:"Environ 60 à 80 g par sujet et par jour. Peser chaque semaine pour rester proche du poids standard.",
   f:{mais:41.5,sorgho:20,son:15,sonriz:6,arachide:6,poisson:5,coton:3,phosphate:1.5,coquille:1.05,premix:0.5,sel:0.25,lysine:0.15,methionine:0.05}},
  {id:"preponte",t:"Pré-ponte (16 à 18 semaines)",a:[16,18],g:90,c:{pb:[16,17.5],ca:[2,2.8],em:[2650,2850],lys:[0.78,0.9],met:[0.36,0.45]},d:"Environ 80 à 100 g par sujet et par jour. Installer les pondoirs et allonger la lumière progressivement.",
   f:{mais:43.35,sorgho:20,son:10,soja:8.5,arachide:6,poisson:5,coquille:4.7,phosphate:1.5,premix:0.5,sel:0.25,lysine:0.1,methionine:0.1}},
  {id:"ponte",t:"Ponte (à partir de 18 semaines)",a:[18,999],g:115,c:{pb:[16,17.5],ca:[3.5,4.2],em:[2700,2850],lys:[0.8,0.9],met:[0.4,0.48]},d:"Environ 110 à 120 g par poule et par jour. Coquilles en libre-service en plus. Eau : environ 2 fois le poids d'aliment, davantage par forte chaleur.",
   f:{mais:42.25,sorgho:20,soja:12,coquille:8.3,arachide:6,poisson:5,son:3,phosphate:1.5,huile:1,premix:0.5,sel:0.25,methionine:0.15,lysine:0.05}}],
 chair:[
  {id:"demarrage",t:"Démarrage (0 à 3 semaines)",a:[0,3],g:50,c:{pb:[21.5,23.5],ca:[0.9,1.05],em:[2900,3050],lys:[1.28,1.45],met:[0.5,0.6]},d:"À volonté, de préférence en miettes. Environ 25 à 80 g par sujet et par jour.",
   f:{mais:46.95,soja:33,sorgho:10,poisson:5,huile:1.75,phosphate:1.5,coquille:0.8,premix:0.5,sel:0.25,methionine:0.15,lysine:0.1}},
  {id:"croissance",t:"Croissance (3 à 5 semaines)",a:[3,5],g:135,c:{pb:[19.5,21.5],ca:[0.85,0.95],em:[3000,3150],lys:[1.1,1.3],met:[0.46,0.55]},d:"À volonté. Environ 110 à 160 g par sujet et par jour.",
   f:{mais:41.15,soja:22.5,sorgho:20,arachide:6,poisson:4,huile:3.1,phosphate:1.5,coquille:0.7,premix:0.5,sel:0.25,lysine:0.15,methionine:0.15}},
  {id:"finition",t:"Finition (à partir de 5 semaines)",a:[5,999],g:175,c:{pb:[17.5,19.5],ca:[0.8,0.92],em:[3050,3200],lys:[0.95,1.15],met:[0.42,0.5]},d:"À volonté jusqu'à la vente. Environ 160 à 185 g par sujet et par jour.",
   f:{mais:45.8,sorgho:20,soja:19.5,arachide:6,huile:3.3,poisson:2,phosphate:1.5,coquille:0.85,premix:0.5,sel:0.25,lysine:0.15,methionine:0.15}}],
 local:[
  {id:"demarrage",t:"Démarrage poussins et pintadeaux (0 à 6 semaines)",a:[0,6],g:25,c:{pb:[22,24],ca:[0.9,1.1],em:[2750,2950],lys:[1.2,1.4],met:[0.5,0.62]},d:"À volonté. Les pintadeaux ont besoin de beaucoup de protéines les premières semaines.",
   f:{mais:39.95,soja:30.5,sorgho:16.5,poisson:6,son:4,phosphate:1.5,coquille:0.65,premix:0.5,sel:0.25,methionine:0.15}},
  {id:"croissance",t:"Croissance volailles locales (après 6 semaines)",a:[6,999],g:70,c:{pb:[15,17],ca:[0.9,1.1],em:[2550,2800],lys:[0.72,0.9],met:[0.32,0.42]},d:"Environ 50 à 90 g par sujet et par jour, en complément du parcours.",
   f:{mais:40.25,sorgho:17.5,son:15,sonriz:8,arachide:6,coton:5,poisson:5,phosphate:1.2,coquille:1.1,premix:0.5,sel:0.25,lysine:0.15,methionine:0.05}}],
 porc:[
  {id:"demarrage",t:"Porcelets (10 à 25 kg)",a:[0,10],g:750,c:{pb:[18.5,21],ca:[0.8,1],lys:[1.2,1.4]},d:"Environ 0,5 à 1 kg par porcelet et par jour, en 3 repas.",
   f:{mais:44.1,sorgho:20,soja:16.5,arachide:6,son:5,poisson:5,phosphate:1.5,coquille:0.7,premix:0.5,lysine:0.4,sel:0.3}},
  {id:"croissance",t:"Croissance (25 à 60 kg)",a:[10,18],g:1900,c:{pb:[15.5,17.5],ca:[0.65,0.85],lys:[0.88,1]},d:"Environ 1,5 à 2,3 kg par porc et par jour, en 2 repas.",
   f:{mais:35.15,sorgho:18,son:11,sonriz:10,dreche:10,poisson:5,arachide:4,coton:4,phosphate:1.5,premix:0.5,lysine:0.35,sel:0.3,coquille:0.2}},
  {id:"finition",t:"Finition (60 kg et plus)",a:[18,999],g:2650,c:{pb:[13,15],ca:[0.6,0.8],lys:[0.7,0.85]},d:"Environ 2,3 à 3 kg par porc et par jour, en 2 repas.",
   f:{mais:36.15,sorgho:18.5,son:13,sonriz:12,dreche:12,coton:5,phosphate:1.5,coquille:0.7,premix:0.5,lysine:0.35,sel:0.3}}],
 petitsrum:[
  {id:"jeune",t:"Agneaux et chevreaux sevrés (3 à 6 mois)",a:[0,26],g:250,c:{pb:[16.5,19],ca:[0.8,1.2]},d:"200 à 300 g de concentré par tête et par jour, avec du bon fourrage à volonté, une pierre à lécher et de l'eau propre.",
   f:{son:30,mais:28,coton:25,fanes:8,melasse:5,phosphate:1.5,coquille:1,sel:1,premix:0.5}},
  {id:"concentre",t:"Embouche (6 mois et plus)",a:[26,999],g:400,c:{pb:[15,17],ca:[0.6,1.1]},d:"300 à 500 g de concentré par tête et par jour, en 2 repas, avec du fourrage à volonté (fanes d'arachide ou de niébé, paille), une pierre à lécher et de l'eau propre.",
   f:{son:30,mais:30,graincoton:15,coton:12,fanes:5,melasse:5,coquille:1.5,sel:1,premix:0.5}}],
 chevrelait:[
  {id:"concentre",t:"Concentré chèvres laitières",a:[0,999],g:600,c:{pb:[16.5,19.5],ca:[0.8,1.2]},d:"300 à 500 g par jour, plus environ 300 g par litre de lait au-delà de 1 litre, avec du fourrage de qualité à volonté.",
   f:{son:30,mais:28.5,coton:20,graincoton:12,melasse:5,phosphate:1.5,sel:1.5,coquille:1,premix:0.5}}],
 bovin:[
  {id:"jeune",t:"Veaux et génisses sevrés (6 à 12 mois)",a:[0,52],g:1500,c:{pb:[16,18.5],ca:[0.7,1.1]},d:"1 à 2 kg par tête et par jour, avec du foin ou de la paille à volonté, une pierre à lécher et de l'eau propre.",
   f:{son:30,mais:30,coton:22,graincoton:8,melasse:6,coquille:1.5,sel:1.5,premix:1}},
  {id:"concentre",t:"Embouche (12 mois et plus)",a:[52,999],g:3500,c:{pb:[14,16.5],ca:[0.6,1.1]},d:"3 à 4 kg par tête et par jour, avec de la paille ou du foin à volonté, une pierre à lécher et 30 à 50 litres d'eau par jour.",
   f:{mais:31,son:30,graincoton:15,coton:12,melasse:8,coquille:1.5,sel:1.5,premix:1}}],
 poisson:[
  {id:"alevins",t:"Alevins (moins de 20 g)",a:[0,6],g:1,c:{pb:[40,45],ca:[1,3],lys:[2.2,3],met:[0.8,1.2]},d:"Aliment fin (farine ou miettes de 0,5 à 1 mm), 4 à 6 repas par jour. Environ 8 à 10 % du poids des poissons par jour. Pour le silure, viser 2 à 4 points de protéines en plus.",
   f:{poisson:45,soja:13,sorgho:9,arachide:8,son:6,coton:6,mais:5,huile:3,sang:3,phosphate:1,premix:1}},
  {id:"croissance",t:"Croissance (20 à 150 g)",a:[6,16],g:3.5,c:{pb:[32,36],ca:[0.9,2],lys:[1.75,2.2],met:[0.6,0.9]},d:"Granulés de 2 à 3 mm, 3 repas par jour. Environ 3 à 5 % du poids des poissons par jour. Arrêter de nourrir si les poissons ne mangent plus.",
   f:{poisson:20,coton:15,soja:12,arachide:12,sonriz:10,dreche:10,mais:9.95,son:7,huile:2,phosphate:1.5,premix:0.5,lysine:0.05}},
  {id:"finition",t:"Grossissement (150 g et plus)",a:[16,999],g:8,c:{pb:[28,32],ca:[0.8,2],lys:[1.5,1.9],met:[0.48,0.75]},d:"Granulés de 3 à 4 mm (flottants de préférence), 2 repas par jour. Environ 2 à 3 % du poids des poissons par jour. Réduire la ration par temps froid ou si l'eau est trouble.",
   f:{son:15,coton:15,soja:12,arachide:12,poisson:10,sonriz:10,dreche:10,mais:9.8,sorgho:2,huile:2,phosphate:1.5,premix:0.5,lysine:0.2}}],
 vachelait:[
  {id:"concentre",t:"Concentré vaches laitières",a:[0,999],g:4000,c:{pb:[17.5,20],ca:[0.8,1.2]},d:"1 à 2 kg par jour pour l'entretien, plus 1 kg pour 2 litres de lait, avec du fourrage de qualité à volonté.",
   f:{son:28,mais:25,coton:25,graincoton:12,melasse:5,phosphate:1.5,sel:1.5,coquille:1,premix:1}}]
};
const ENG={npk15:{n:"NPK 15-15-15",prix:20000},npk14:{n:"NPK 14-23-14",prix:20000},uree:{n:"Urée 46 %",prix:18000},compost:{n:"Compost ou fumier",prix:15000}};
const CULT={
 mais:{n:"Maïs",plan:[["Préparation du sol","compost",5000],["Au semis","npk14",200],["15 à 20 jours après le semis","uree",75],["Montaison (40 à 45 jours)","uree",75]],d:"Enfouir l'engrais à 5 cm du pied, sur sol humide. Ne pas épandre l'urée juste avant une forte pluie."},
 sorgho:{n:"Sorgho et mil",plan:[["Préparation du sol","compost",3000],["Au semis ou au démariage","npk14",100],["Montaison (35 à 45 jours)","uree",50]],d:"Apporter l'engrais en poquet à côté du pied, puis recouvrir de terre."},
 riz:{n:"Riz (bas-fonds)",plan:[["Préparation du sol","compost",3000],["Repiquage ou 15 jours après le semis","npk15",200],["Tallage (30 jours)","uree",50],["Initiation paniculaire (55 à 60 jours)","uree",50]],d:"Épandre l'urée sur une lame d'eau faible, après le désherbage."},
 niebe:{n:"Niébé",plan:[["Préparation du sol","compost",2500],["Au semis","npk14",100]],d:"Pas d'urée : le niébé fixe l'azote de l'air. Traiter contre les insectes à la floraison et à la formation des gousses."},
 arachide:{n:"Arachide",plan:[["Préparation du sol","compost",2500],["Au semis","npk14",100]],d:"Pas d'urée. Un sol meuble à la floraison facilite la formation des gousses."},
 tomate:{n:"Tomate et maraîchage",plan:[["Préparation des planches","compost",20000],["À la plantation","npk15",150],["Reprise (15 jours)","uree",50],["Début de la floraison","npk15",150],["Début de la fructification","uree",50]],d:"Arroser après chaque apport. Pour 100 m², les doses sont 100 fois plus faibles qu'à l'hectare."},
 oignon:{n:"Oignon",plan:[["Préparation des planches","compost",20000],["Au repiquage","npk15",150],["15 jours après le repiquage","uree",50],["30 jours après le repiquage","npk15",150],["45 jours après le repiquage","uree",50]],d:"Arrêter l'urée 1 mois avant la récolte pour une bonne conservation des bulbes."},
 anacarde:{n:"Anacardier",arbre:true,parHa:100,ages:[[1,100,5],[2,200,10],[3,400,10],[5,600,15],[99,1000,20]],d:"Épandre en couronne sous le bord du feuillage, puis griffer légèrement le sol. Désherber autour du pied avant chaque apport."},
 manguier:{n:"Manguier",arbre:true,parHa:100,ages:[[1,150,10],[2,300,10],[3,500,15],[5,800,20],[99,1500,30]],d:"Épandre en couronne sous le bord du feuillage. Arroser les jeunes arbres en saison sèche."}
};
let prixIng={},prixEng={},mesFormules=[];
const pIng=k=>Number(prixIng[k]??(ING[k]||{}).prix)||0,pEng=k=>Number(prixEng[k]??ENG[k].prix)||0;
const ingN=k=>ING[k]?ING[k].n:k;
function formAt(key,w){const L=FORM[key]||[];return L.find(x=>w>=x.a[0]&&w<x.a[1])||L[L.length-1]}
const FAKE_ESP={pondeuse:"Poules pondeuses",chair:"Poulets de chair",local:"Poulets locaux",porc:"Porcs"};
/* ration repère en g par animal et par jour, pour une espèce, un âge (semaines) et une formule */
function rationG(key,w,fo){
  if(FAKE_ESP[key]&&w!=null){try{const g=stdFeed({espece:FAKE_ESP[key]},w);if(g>0)return g}catch(e){}}
  return (fo&&fo.g)||((formAt(key,w==null?0:w)||{}).g)||0}
function formulaForLot(l,s){const key=spKey(l);if(!FORM[key])return null;const fa=feedAge(l,s);const fo=formAt(key,fa);
  const ra=ration(l,s);let daily=s.gpj7!=null&&s.gpj7>0?s.alive*s.gpj7/1000:(ra?ra.kg:s.alive*stdFeed(l,s.ageW)/1000);
  /* lot en retard de poids : la quantité à fabriquer suit la ration de rattrapage, jamais moins */
  if(ra&&ra.f>1)daily=Math.max(daily,ra.kg);
  return {key,titre:fo.t,fo,f:fo.f,daily,week:Math.ceil(daily*7/5)*5}}
function nutri(f){let pb=0,em=0,ca=0,lys=0,met=0,t=0;for(const[k,v]of Object.entries(f)){const i=ING[k];t+=v;if(!i)continue;pb+=v*i.pb/100;em+=v*i.em/100;ca+=v*i.ca/100;lys+=v*(i.lys||0)/100;met+=v*(i.met||0)/100}return {pb,em,ca,lys,met,t}}
const pFab=()=>Math.max(0,Number(prixIng._fab??14)||0); // fabrication + sacs vides, F par kg (SAPRA : 500 F/sac de 50 kg + 200 F le sac)
const pTrans=()=>Math.max(0,Number(prixIng._trans??20)||0); // transport, F par kg (SAPRA : 10 000 F pour 500 kg)
function formCost(f){let c=0;for(const[k,v]of Object.entries(f))c+=v/100*pIng(k);return Object.keys(f).length?c+pFab()+pTrans():c}

/* état de l'onglet */
let fMode="animal",fKey="pondeuse",fId="ponte",fCur={},fQty=100,fLot="",fCult="mais",fSurf=1,fUnit="ha",fArbres=100,fAgeArbre=6;
let fNb=0,fAge=null,fAgeU="sem",fDays=0;
const DUR={7:"1 semaine",14:"2 semaines",30:"1 mois",90:"3 mois"};
let prixTimer=null;
function savePrix(){if(!db||!canWrite)return;clearTimeout(prixTimer);prixTimer=setTimeout(async()=>{try{await db.doc("reglages/prix").set({ing:prixIng,eng:prixEng,maj:today()})}catch(e){}},900)}
function fOptions(){const sel=$("f-phase");sel.innerHTML="";const g1=document.createElement("optgroup");g1.label="Formules conseillées";
  (FORM[fKey]||[]).forEach(x=>{const o=el("option",null,x.t);o.value=x.id;g1.append(o)});sel.append(g1);
  const mine=mesFormules.filter(m=>m.sp===fKey);if(mine.length){const g2=document.createElement("optgroup");g2.label="Mes formules";mine.forEach(m=>{const o=el("option",null,m.nom);o.value="m:"+m.id;g2.append(o)});sel.append(g2)}
  if(![...sel.options].some(o=>o.value===fId))fId=(FORM[fKey]||[{}])[0].id;sel.value=fId}
function fBase(){if(fId.startsWith("m:")){const m=mesFormules.find(x=>"m:"+x.id===fId);if(!m)return null;const ref=formAt(m.sp,fAgeW()??0)||{};return {t:m.nom,c:ref.c||{},g:ref.g,d:"Formule enregistrée par "+(names[m.by]||"vous")+".",f:m.f,mine:m}}
  return (FORM[fKey]||[]).find(x=>x.id===fId)}
function fLoad(){const b=fBase();fCur=b?{...b.f}:{};renderFormTable()}
/* âge saisi, converti en semaines */
function fAgeW(){if(fAge==null||!(fAge>=0))return null;return fAgeU==="mois"?fAge*52/12:fAge}
/* besoin journalier en kg pour le lot choisi ou pour le nombre d'animaux saisi */
function fNeed(){
  const l=lots.find(x=>x.id===fLot);
  if(l){const s=stats(l),r=formulaForLot(l,s);if(r)return {daily:r.daily,nb:s.alive,g:s.alive>0?r.daily*1000/s.alive:0,lot:l,ageW:s.ageW}}
  if(!(fNb>0))return null;const w=fAgeW();const b=fBase();const g=rationG(fKey,w,b);if(!g)return null;
  return {daily:fNb*g/1000,nb:fNb,g,ageW:w}}
const fmtG=g=>g>=1000?fmt(g/1000,1)+" kg":fmt(g,g<10?1:0)+" g";
function roundQty(x){return x>=20?Math.ceil(x/5)*5:Math.max(0.5,Math.ceil(x*2)/2)}
function applyDays(){const nd=fNeed();if(!fDays||!nd)return;$("f-qty").value=roundQty(nd.daily*fDays)}
function renderDays(){document.querySelectorAll("[data-days]").forEach(b=>b.setAttribute("aria-pressed",String(Number(b.dataset.days)===fDays)))}
function renderFormules(){
  if(!$("v-formules"))return;
  $("f-animal").setAttribute("aria-pressed",fMode==="animal");$("f-plante").setAttribute("aria-pressed",fMode==="plante");
  $("f-animal-box").hidden=fMode!=="animal";$("f-plante-box").hidden=fMode!=="plante";
  const ls=$("f-lot");const keep=fLot;ls.innerHTML="";const o0=el("option",null,"Aucun (choisir l'espèce)");o0.value="";ls.append(o0);
  lots.filter(l=>l.actif!==false&&FORM[spKey(l)]).forEach(l=>{const o=notr(el("option",null,l.nom));o.value=l.id;ls.append(o)});ls.value=lots.some(l=>l.id===keep)?keep:"";fLot=ls.value;
  const ss=$("f-sp");if(!ss.options.length)Object.entries(SPN).forEach(([k,n])=>{const o=el("option",null,n);o.value=k;ss.append(o)});ss.value=fKey;ss.disabled=!!fLot;
  ["f-age","f-ageu","f-nb"].forEach(id=>{if($(id))$(id).disabled=!!fLot});
  fOptions();
  if($("f-fab")&&document.activeElement!==$("f-fab"))$("f-fab").value=pFab();
  if($("f-trans")&&document.activeElement!==$("f-trans"))$("f-trans").value=pTrans();
  const cs=$("f-cult");if(!cs.options.length)Object.entries(CULT).forEach(([k,c])=>{const o=el("option",null,c.n);o.value=k;cs.append(o)});cs.value=fCult;
  renderDays();
  if(!Object.keys(fCur).length)fLoad();else renderFormTable();
  renderPlan();
}
function fromLot(){const l=lots.find(x=>x.id===fLot);if(!l)return;const s=stats(l);const r=formulaForLot(l,s);if(!r)return;
  fKey=r.key;fId=r.fo.id;fNb=s.alive;fAge=s.ageW;fAgeU="sem";
  $("f-nb").value=fNb;$("f-age").value=fAge;$("f-ageu").value="sem";
  fDays=fDays||7;fOptions();fLoad();applyDays();renderDays();renderFormTotals()}
/* choisit la formule conseillée qui correspond à l'âge saisi */
function pickByAge(){const w=fAgeW();if(w==null||fId.startsWith("m:"))return;const fo=formAt(fKey,w);if(fo&&fo.id!==fId){fId=fo.id;fOptions();fLoad()}}
function renderIngList(){
  const box=$("f-inglist");if(!box)return;box.innerHTML="";const L=ingLim(fKey);
  $("f-ingtitle").textContent="Ingrédients utilisables : "+(SPN[fKey]||"");
  const ul=el("ul","inglist");Object.keys(L).forEach(k=>{const i=ING[k];if(!i)return;const li=el("li");const tx=el("div","ix");tx.append(el("b",null,i.n));
    const st=[i.pb?`Protéines ${fmt(i.pb,1)} %`:null,`Maximum ${fmt(L[k],L[k]<1?1:0)} %`,`${fmt(pIng(k))} F/kg`].filter(Boolean);const sp=el("span","st");st.forEach((x,j)=>{if(j)sp.append(" · ");sp.append(el("span",null,x))});tx.append(sp);if(i.note)tx.append(el("small",null,i.note));li.append(tx);
    if(k in fCur)li.append(el("span","pill s-ok",fmt(fCur[k],2)+" %"));else{const bt=el("button","btn small ghost","Ajouter");bt.type="button";bt.onclick=()=>{fCur[k]=0;renderFormTable()};li.append(bt)}ul.append(li)});
  box.append(ul);
  box.append(el("p","note","Le maximum est la part la plus élevée conseillée dans le mélange pour cette espèce. Les ingrédients absents de la liste ne conviennent pas à cette espèce."))}
function renderFormTable(){
  const tb=$("f-body");tb.innerHTML="";const b=fBase()||{c:{},d:""};const L=ingLim(fKey);
  Object.entries(fCur).forEach(([k,v])=>{const tr=el("tr");tr.append(el("td",null,ingN(k)));
    const tdp=el("td","n"),ip=el("input");ip.type="number";ip.step="0.05";ip.min="0";ip.value=v;ip.setAttribute("aria-label","Pourcentage "+ingN(k));
    ip.oninput=()=>{fCur[k]=N(ip.value)||0;renderFormTotals()};tdp.append(ip);tr.append(tdp);
    tr.append(el("td","n kg"));
    const tdx=el("td","n"),ix=el("input");ix.type="number";ix.min="0";ix.value=pIng(k);ix.setAttribute("aria-label","Prix par kg "+ingN(k));
    ix.oninput=()=>{prixIng[k]=N(ix.value)||0;renderFormTotals();savePrix()};tdx.append(ix);tr.append(tdx);
    tr.append(el("td","n cost"));
    const tdd=el("td"),bd=el("button","btn small ghost","×");bd.type="button";bd.setAttribute("aria-label","Retirer "+ingN(k));bd.onclick=()=>{delete fCur[k];renderFormTable()};tdd.append(bd);tr.append(tdd);
    tr.dataset.k=k;tb.append(tr)});
  const add=$("f-add");add.innerHTML="";const oo=el("option",null,"Ajouter un ingrédient…");oo.value="";add.append(oo);
  Object.keys(L).filter(k=>ING[k]&&!(k in fCur)).forEach(k=>{const o=el("option",null,ING[k].n);o.value=k;add.append(o)});
  $("f-dist").textContent=b.d||"";$("f-del").hidden=!b.mine||!canWrite;
  renderFormTotals();
}
function renderFormTotals(){
  const q=Math.max(0,N($("f-qty").value)||0);fQty=q;const L=ingLim(fKey);
  document.querySelectorAll("#f-body tr").forEach(tr=>{const k=tr.dataset.k,v=fCur[k]||0;tr.querySelector(".kg").textContent=fmt(v*q/100,v*q/100<10?2:1);tr.querySelector(".cost").textContent=fmt(v/100*q*pIng(k));
    const over=!(k in L)||v>L[k]+1e-9;tr.querySelector("td").style.color=over?"var(--bad)":""});
  const n=nutri(fCur),cost=formCost(fCur),b=fBase()||{c:{}};
  const tot=$("f-total");tot.innerHTML="";if(Object.keys(fCur).length&&pFab()){const fr=el("tr");fr.append(el("td",null,"Fabrication et sacs"),el("td","n","—"),el("td","n","—"),el("td","n",fmt(pFab())),el("td","n",fmt(pFab()*q)),el("td"));fr.style.fontWeight="400";tot.append(fr)}if(Object.keys(fCur).length&&pTrans()){const fr=el("tr");fr.append(el("td",null,"Transport"),el("td","n","—"),el("td","n","—"),el("td","n",fmt(pTrans())),el("td","n",fmt(pTrans()*q)),el("td"));fr.style.fontWeight="400";tot.append(fr)}const tr=el("tr");tr.append(el("td",null,"Total"));const tp=el("td","n",fmt(n.t,1)+" %");if(Math.abs(n.t-100)>0.05)tp.style.color="var(--bad)";tr.append(tp,el("td","n",fmt(q*n.t/100,1)),el("td","n",fmt(cost)+" F/kg"),el("td","n",fmt(cost*q)+" F"),el("td"));tot.append(tr);
  $("f-warn").hidden=Math.abs(n.t-100)<=0.05;$("f-warn").textContent=`Le total fait ${fmt(n.t,1)} % : ajustez les pourcentages pour arriver à 100 %.`;
  const W=$("f-warn2");if(W){W.innerHTML="";Object.entries(fCur).forEach(([k,v])=>{if(!(k in L))W.append(el("li",null,`${ingN(k)} : ne convient pas à cette espèce.`));else if(v>L[k]+1e-9)W.append(el("li",null,`${ingN(k)} : ${fmt(v,2)} %, au-dessus du maximum conseillé de ${fmt(L[k],L[k]<1?1:0)} %.`))});W.hidden=!W.children.length}
  const K=$("f-kpis");K.innerHTML="";const C=b.c||{};
  const chk=(v,r)=>!r?null:v<r[0]?"down":v>r[1]?"down":"up";
  const sub=(r,u,d)=>r?`objectif ${fmt(r[0],d)} à ${fmt(r[1],d)}${u}`:"";
  K.append(kpi("Protéines (PB)",fmt(n.pb,1)+" %",sub(C.pb," %",1),chk(n.pb,C.pb)));
  K.append(kpi("Calcium",fmt(n.ca,2)+" %",sub(C.ca," %",2),chk(n.ca,C.ca)));
  if(C.em)K.append(kpi("Énergie",fmt(n.em)+" kcal/kg",sub(C.em,"",0),chk(n.em,C.em)));
  if(C.lys)K.append(kpi("Lysine",fmt(n.lys,2)+" %",sub(C.lys," %",2),chk(n.lys,C.lys)));
  if(C.met)K.append(kpi("Méthionine",fmt(n.met,2)+" %",sub(C.met," %",2),chk(n.met,C.met)));
  K.append(kpi("Coût du mélange",fmt(cost)+" F/kg",fmt(cost*q)+" F pour "+fmt(q)+" kg"));
  const box=$("f-lotinfo");box.innerHTML="";const nd=fNeed();const need=$("f-need");
  if(nd){const segs=[`Ration ≈ ${fmtG(nd.g)} par animal et par jour`,`${fmt(nd.daily,nd.daily<10?1:0)} kg par jour`,`${fmt(nd.daily*7,nd.daily*7<10?1:0)} kg par semaine`,`${fmt(nd.daily*30)} kg par mois`];
    need.textContent=(nd.lot?nd.lot.nom+" : "+fmt(nd.nb)+" sujets, âge ≈ "+fmt(Math.floor(nd.ageW))+" semaines · ":"")+segs.join(" · ");need.className="note";
    if(fDays){const dq=roundQty(nd.daily*fDays);K.append(kpi("Pour "+DUR[fDays],fmt(dq)+" kg",fmt(cost*dq)+" F"))}
    if(nd.lot&&Number(nd.lot.prixAliment)){const gain=(Number(nd.lot.prixAliment)-cost);K.append(kpi("Comparé à l'aliment acheté",(gain>=0?"− ":"+ ")+fmt(Math.abs(gain))+" F/kg",gain>=0?`économie ≈ ${fmt(gain*nd.daily*30)} F par mois`:"plus cher que votre aliment actuel",gain>=0?"up":"down"))}}
  else{need.textContent=fDays?"Indiquez le nombre d'animaux pour calculer la quantité.":"Indiquez le nombre d'animaux pour connaître le besoin par jour, par semaine et par mois.";need.className=fDays?"msg err":"note"}
  renderIngList();
}
$("f-animal").onclick=()=>{fMode="animal";renderFormules()};$("f-plante").onclick=()=>{fMode="plante";renderFormules()};
$("f-lot").onchange=()=>{fLot=$("f-lot").value;const dis=!!fLot;["f-sp","f-age","f-ageu","f-nb"].forEach(id=>$(id).disabled=dis);if(fLot)fromLot();else renderFormTotals()};
$("f-sp").onchange=()=>{fKey=$("f-sp").value;fId=(FORM[fKey]||[{}])[0].id;fOptions();pickByAge();fLoad();applyDays();renderFormTotals()};
$("f-phase").onchange=()=>{fId=$("f-phase").value;fLoad();applyDays();renderFormTotals()};
$("f-age").oninput=()=>{const v=$("f-age").value;fAge=v===""?null:Math.max(0,N(v)||0);pickByAge();applyDays();renderFormTotals()};
$("f-ageu").onchange=()=>{fAgeU=$("f-ageu").value;pickByAge();applyDays();renderFormTotals()};
$("f-nb").oninput=()=>{fNb=Math.max(0,N($("f-nb").value)||0);applyDays();renderFormTotals()};
$("f-qty").oninput=()=>{fDays=0;renderDays();renderFormTotals()};
if($("f-fab"))$("f-fab").oninput=()=>{prixIng._fab=Math.max(0,N($("f-fab").value)||0);renderFormTotals();savePrix()};
if($("f-trans"))$("f-trans").oninput=()=>{prixIng._trans=Math.max(0,N($("f-trans").value)||0);renderFormTotals();savePrix()};
document.querySelectorAll("[data-days]").forEach(b=>b.onclick=()=>{const d=Number(b.dataset.days);fDays=fDays===d?0:d;renderDays();applyDays();renderFormTotals();if(fDays&&!fNeed()&&!fLot)$("f-nb").focus()});
$("f-add").onchange=()=>{const k=$("f-add").value;if(k){fCur[k]=0;renderFormTable()}};
$("f-reset").onclick=fLoad;
$("f-save").onclick=async()=>{const nom=$("f-nom").value.trim();if(!nom){$("f-msg").textContent="Donnez un nom à votre formule.";$("f-msg").className="msg err";return}
  if(!db){$("f-msg").textContent="Enregistrement indisponible ici.";return}
  try{const ref=db.collection("formules").doc();await ref.set({nom,sp:fKey,f:fCur,by:me,date:today()});fId="m:"+ref.id;$("f-nom").value="";$("f-msg").textContent="Formule enregistrée.";$("f-msg").className="msg good"}
  catch(e){$("f-msg").textContent=errText(e);$("f-msg").className="msg err"}};
$("f-del").onclick=async()=>{const b=fBase();if(!b||!b.mine)return;const bt=$("f-del");if(bt.dataset.c!=="1"){bt.dataset.c="1";bt.textContent="Confirmer la suppression";return}
  bt.dataset.c="";bt.textContent="Supprimer cette formule";try{await db.doc("formules/"+b.mine.id).delete();fId=(FORM[fKey]||[{}])[0].id;fOptions();fLoad()}catch(e){dbMsg(errText(e),true)}};

/* plans de fumure */
function planRows(){const C=CULT[fCult];const rows=[];
  if(C.arbre){const n=Math.max(0,N($("f-arbres").value)||0),age=Math.max(0,N($("f-agearbre").value)||0);const a=C.ages.find(x=>age<=x[0])||C.ages[C.ages.length-1];
    rows.push(["Début de la saison des pluies","compost",a[2],"kg/arbre",a[2]*n]);
    rows.push(["Début de la saison des pluies","npk15",a[1]/2,"g/arbre",a[1]/2*n/1000]);
    rows.push(["Fin août ou début septembre","npk15",a[1]/2,"g/arbre",a[1]/2*n/1000]);
    return {rows,lbl:`${fmt(n)} arbres de ${fmt(age)} an(s)`}}
  const s=Math.max(0,N($("f-surf").value)||0),ha=$("f-unit").value==="m2"?s/10000:s;
  C.plan.forEach(([m,e,d])=>rows.push([m,e,d,"kg/ha",d*ha]));return {rows,lbl:$("f-unit").value==="m2"?`${fmt(s)} m²`:`${fmt(s,2)} ha`}}
function renderPlan(){const C=CULT[fCult];if(!C||!$("f-plan"))return;
  $("f-surfbox").hidden=!!C.arbre;$("f-arbrebox").hidden=!C.arbre;
  const {rows}=planRows();const tb=$("f-plan");tb.innerHTML="";let total=0;const sums={};
  rows.forEach(([m,e,d,u,q])=>{const tr=el("tr");const comp=e==="compost";const cost=comp?q/1000*pEng(e):q/50*pEng(e);total+=cost;sums[e]=(sums[e]||0)+q;
    tr.append(el("td",null,m),el("td",null,ENG[e].n),el("td","n",fmt(d,d<10?1:0)+" "+u),el("td","n",comp?fmt(q/1000,2)+" t":fmt(q,q<10?1:0)+" kg"),el("td","n",comp?"—":fmt(q/50,1)),el("td","n",fmt(cost)+" F"));tb.append(tr)});
  $("f-plantot").textContent=fmt(total)+" F";$("f-pland").textContent=C.d;
  const pr=$("f-prixeng");pr.innerHTML="";Object.keys(sums).forEach(k=>{const f=el("div","field"),lb=el("label",null,ENG[k].n+(k==="compost"?" (F par tonne)":" (F par sac de 50 kg)")),ip=el("input");
    lb.htmlFor="pe-"+k;ip.id="pe-"+k;ip.type="number";ip.min="0";ip.value=pEng(k);ip.oninput=()=>{prixEng[k]=N(ip.value)||0;savePrix();renderPlanCostOnly()};f.append(lb,ip);pr.append(f)});
}
function renderPlanCostOnly(){const a=document.activeElement&&document.activeElement.id;renderPlan();if(a&&$(a)){$(a).focus();const v=$(a).value;$(a).value="";$(a).value=v}}
["f-cult","f-surf","f-unit","f-arbres","f-agearbre"].forEach(id=>{$(id).addEventListener(id==="f-cult"||id==="f-unit"?"change":"input",()=>{if(id==="f-cult")fCult=$("f-cult").value;renderPlan()})});

/* ---------- PDF ---------- */
let pdfLibs=null;
function loadScriptOnce(src){return new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=()=>rej(new Error("load"));document.head.append(s)})}
function pdfReady(){if(window.jspdf&&window.jspdf.jsPDF&&window.jspdf.jsPDF.API.autoTable)return Promise.resolve();
  if(!pdfLibs)pdfLibs=(async()=>{await loadScriptOnce("libs/jspdf.umd.min.js");await loadScriptOnce("libs/jspdf.plugin.autotable.min.js")})().catch(e=>{pdfLibs=null;throw e});return pdfLibs}
const PT=s=>String(window.__tr?window.__tr(s??""):(s??"")).replace(/[   ]/g," ").replace(/[−–—]/g,"-").replace(/≈\s?/g,"~").replace(/→/g,"->").replace(/[’‘]/g,"'").replace(/[“”«»]/g,'"').replace(/…/g,"...").replace(/œ/g,"oe").replace(/Œ/g,"Oe").replace(/[•]/g,"-").replace(/[^\x00-\xff]/g,"");
const slug=s=>String(s||"lot").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^A-Za-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40)||"lot";
const NAVY=[27,46,76],INK=[20,29,46],MUTED=[90,100,119];
function pdfNew(title,sub){const {jsPDF}=window.jspdf;const doc=new jsPDF({unit:"mm",format:"a4"});const W=doc.internal.pageSize.getWidth();
  doc.setFillColor(0,0,0);doc.rect(0,0,W,26,"F");
  const ic=document.querySelector(".band .ic");try{if(ic)doc.addImage(ic.src,"PNG",12,5,16,16)}catch(e){}
  doc.setTextColor(255,255,255);doc.setFont("helvetica","bold");doc.setFontSize(15);doc.text("B2A Smart Farming",32,12.5);
  doc.setFont("helvetica","normal");doc.setFontSize(7.5);doc.setTextColor(150,160,180);doc.text("SMART BUILDING  ·  SMART FARMING",32,18.5);
  doc.setFontSize(9);doc.setTextColor(210,215,225);doc.text(PT(new Date().toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})),W-12,12.5,{align:"right"});
  doc.setTextColor(...NAVY);doc.setFont("helvetica","bold");doc.setFontSize(16);const TL=doc.splitTextToSize(PT(title),W-24);doc.text(TL,12,37);let y=37+TL.length*7;
  if(sub){doc.setFont("helvetica","normal");doc.setFontSize(10);doc.setTextColor(...MUTED);const L=doc.splitTextToSize(PT(sub),W-24);doc.text(L,12,y);y+=L.length*4.6+3}
  return {doc,y,W}}
function pdfH(P,t){if(P.y>262){P.doc.addPage();P.y=18}const d=P.doc;d.setFont("helvetica","bold");d.setFontSize(12);d.setTextColor(...NAVY);d.text(PT(t),12,P.y+4);d.setDrawColor(114,172,72);d.setLineWidth(0.7);d.line(12,P.y+6.2,34,P.y+6.2);P.y+=11}
function pdfP(P,t,o){o=o||{};const d=P.doc;d.setFont("helvetica",o.bold?"bold":"normal");d.setFontSize(o.size||10);d.setTextColor(...(o.color||INK));
  const L=d.splitTextToSize(PT(t),P.W-24);if(P.y+L.length*4.6>284){d.addPage();P.y=18}d.text(L,12,P.y);P.y+=L.length*4.6+1.5}
function pdfT(P,head,body,o){P.doc.autoTable(Object.assign({startY:P.y,head:[head.map(PT)],body:body.map(r=>r.map(PT)),margin:{left:12,right:12,top:16},
  styles:{font:"helvetica",fontSize:9,cellPadding:2,textColor:INK,lineColor:[216,221,231],lineWidth:0.1,overflow:"linebreak"},headStyles:{fillColor:NAVY,textColor:255,fontStyle:"bold"},
  alternateRowStyles:{fillColor:[244,246,250]},theme:"grid"},o||{}));P.y=P.doc.lastAutoTable.finalY+7}
async function pdfSave(P,name){const d=P.doc,n=d.getNumberOfPages();for(let i=1;i<=n;i++){d.setPage(i);d.setFont("helvetica","normal");d.setFontSize(8);d.setTextColor(120,128,145);
    d.text("B2A Smart Farming \u00b7 "+PT("document généré le "+new Date().toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"short"})),12,290);d.text(i+" / "+n,P.W-12,290,{align:"right"})}
  const dl=await claude.use("downloads").catch(()=>null);if(!dl)throw {code:"unavailable"};return dl.save({filename:name,data:d.output("blob")})}
async function pdfRun(btn,fn){const t=btn.textContent;btn.disabled=true;btn.textContent="Préparation…";
  try{await pdfReady();await fn();btn.textContent="PDF enregistré";setTimeout(()=>{btn.textContent=t},2500)}
  catch(e){btn.textContent=t;const c=e&&e.code;if(c!=="declined")dbMsg(c==="unavailable"||c==="not_granted"||c==="capability_disabled"?"Le téléchargement de fichiers n'est pas disponible dans cette vue.":c==="rate_limited"?"Un téléchargement est déjà en attente de confirmation.":"Le PDF n'a pas pu être créé. Vérifiez la connexion internet et réessayez.",true)}
  finally{btn.disabled=false}}
const money=v=>(v<0?"- ":"")+fmt(Math.abs(v))+" F";
const fdLong=iso=>new Date(iso+"T12:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"});
function invLabel(v){return v.ratio>=1?"Investissement de départ":`Investissement : part de ce lot (${fmt(v.years,1)} an sur ${fmt(v.du)} ans d'utilisation, total ${fmt(v.total)} F)`}
function bilanLines(l,s,f,base){const lines=[];const recO=f.rec+base.fut.oeufs,eggsAll=f.eggs+base.eggs;
  if(isLayer(l))lines.push([`Ventes d'œufs (${fmt(eggsAll)} œufs, ${fmt(eggsAll/30)} plateaux à ${fmt(Number(l.prixOeuf)||0)} F)`,recO,""]);
  if(isDairy(l))lines.push([`Ventes de lait (${fmt(eggsAll)} litres à ${fmt(Number(l.prixOeuf)||0)} F)`,recO,""]);
  lines.push([Number(l.prixKg)&&base.wEnd?`${sp(l).sale} (${fmt(base.birds)} × ${fmt(base.wEnd,base.wEnd<10?2:0)} kg à ${fmt(Number(l.prixKg))} F/kg)`:`${sp(l).sale} (${fmt(base.birds)} × ${fmt(Number(l.prixFin)||0)} F)`,base.fut.reforme,""]);
  const totR=recO+base.fut.reforme;lines.push(["Total recettes",totR,"b"]);
  const alKg=f.feedKg+base.fut.alimentKg,alF=f.dep.aliment+base.fut.aliment;
  lines.push([`Aliment (≈ ${fmt(alKg/1000,1)} t à ${fmt(Number(l.prixAliment)||0)} F/kg)`,-alF,""]);
  if(f.dep.invest)lines.push([invLabel(f.inv),-f.dep.invest,""]);
  if(f.dep.achat)lines.push([`Achat des sujets (${fmt(Number(l.effectif))} × ${fmt(Number(l.prixSujet)||0)} F)`,-f.dep.achat,""]);
  const chT=f.dep.charges+base.fut.charges;if(chT)lines.push([`Charges (${fmt(Number(l.chargesMois)||0)} F × ${fmt((base.end-(Number(l.ageArrivee)||0))*7/30.4)} mois)`,-chT,""]);
  const net=totR-alF-f.dep.invest-f.dep.achat-chT;lines.push(["Bénéfice net du cycle",net,"b"]);
  if(f.dep.invest)lines.push(["Bénéfice sans compter l'investissement",net+f.dep.invest,""]);
  return {lines,alF,chT,net}}
const boldRows=lines=>({didParseCell:d=>{if(d.section==="body"&&lines[d.row.index]&&lines[d.row.index][2]==="b")d.cell.styles.fontStyle="bold"}});
async function pdfLot(l){const s=stats(l),f=finance(l,s),base=project(l,s,f,1),low=project(l,s,f,0.9),high=project(l,s,f,1.05);
  const P=pdfNew("Rapport du lot : "+l.nom,[l.espece,l.race,l.arrivee?"arrivé le "+fdLong(l.arrivee):null,"âge ≈ "+s.ageW+" semaines",fmt(s.alive)+" sujets"].filter(Boolean).join("  ·  "));
  pdfH(P,"Chiffres clés");const k=[["Effectif actuel",`${fmt(s.alive)} (${fmt(s.mortsTot)} morts, ${fmt(s.mortsTotPct,1)} %)`]];
  if(isLayer(l))k.push(["Ponte moyenne sur 7 jours",s.ponte7!=null?fmt(s.ponte7,1)+" %":"-"],["Œufs sur 7 jours",`${fmt(s.oeufs7)} (${fmt(s.oeufs7/30,1)} plateaux)`]);
  if(isDairy(l))k.push(["Lait moyen sur 7 jours",s.lait7!=null?fmt(s.lait7,2)+" L par tête et par jour":"-"]);
  if(s.poids!=null)k.push(["Poids moyen (dernière pesée)",fmtW(l,s.poids)]);
  k.push(["Aliment consommé",s.gpj7!=null?fmt(s.gpj7)+" g par sujet et par jour":"non saisi"]);
  const fs=feedStock(l,s);if(fs)k.push(["Stock d'aliment",fs.stock<=0?"épuisé : commander":`${fmt(fs.stock)} kg (≈ ${fmt(fs.days)} jours, commander avant le ${fs.order.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})})`]);
  pdfT(P,["Indicateur","Valeur"],k,{columnStyles:{0:{cellWidth:70}}});
  {const R=lotSales(l);if(R.fs.length){const ff=finance(l,s);const reel=R.enc-ff.depTot;pdfH(P,"Ventes réelles");
    pdfT(P,["Indicateur","Valeur"],[["Ventes facturées",`${fmt(R.tot)} F (${R.fs.length} facture(s))`],["Encaissé",fmt(R.enc)+" F"],["Reste à encaisser",fmt(R.reste)+" F"],["Solde réel (encaissé − dépenses)",money(reel)]],{columnStyles:{0:{cellWidth:70}}})}}
  const A=allAlerts(l,s);if(A.length){pdfH(P,"Alertes");A.forEach(a=>pdfP(P,"- "+a[1],{color:a[0]==="bad"?[179,55,42]:a[0]==="warn"?[140,95,6]:INK}));P.y+=3}
  if(Number(l.prixAliment)){const B=bilanLines(l,s,f,base);pdfH(P,"Bilan prévu du cycle complet");
    pdfT(P,["Poste","Montant"],B.lines.map(([a,v])=>[a,money(v)]),Object.assign({columnStyles:{1:{halign:"right",cellWidth:40}}},boldRows(B.lines)));
    const what=isLayer(l)?"ponte":isDairy(l)?"lait":"croissance";
    pdfT(P,["Scénario","Début du bénéfice","Bénéfice net du cycle"],[[`Prudent (${what} -10 %)`,low],["Probable",base],[`Favorable (${what} +5 %)`,high]].map(([n,p])=>[n,beText(p),money(p.final)]),{columnStyles:{2:{halign:"right"}}});
    pdfP(P,"Hypothèses : courbes types de l'espèce ajustées à vos saisies, charges mensuelles constantes. Estimation indicative.",{size:8.5,color:MUTED});P.y+=2}
  const r=formulaForLot(l,s);if(r){pdfH(P,"Formule d'aliment conseillée");pdfP(P,`${r.titre}. Besoin ≈ ${fmt(r.daily,1)} kg par jour, soit ${fmt(r.week)} kg par semaine.`);
    pdfT(P,["Ingrédient","%","kg pour 1 semaine","Prix (F/kg)","Coût (F)"],Object.entries(r.f).map(([k,v])=>[ING[k].n,fmt(v,2),fmt(v*r.week/100,1),fmt(pIng(k)),fmt(v/100*r.week*pIng(k))]).concat([["Fabrication et sacs","","",fmt(pFab()),fmt(pFab()*r.week)],["Transport","","",fmt(pTrans()),fmt(pTrans()*r.week)],["Total","100",fmt(r.week),fmt(formCost(r.f)),fmt(formCost(r.f)*r.week)]]),{columnStyles:{1:{halign:"right"},2:{halign:"right"},3:{halign:"right"},4:{halign:"right"}}});
    pdfP(P,r.fo.d,{size:9,color:MUTED});P.y+=2}
  const prog=programme(l).filter(p=>!p.done&&daysBetween(today(),p.date)<=60);if(prog.length){pdfH(P,"Soins en retard et à venir (60 jours)");
    pdfT(P,["Date","Soin","Type","Statut"],prog.map(p=>{const d=daysBetween(today(),p.date);return [fdLong(p.date),p.nom,p.type,d<0?`En retard (${-d} j)`:d===0?"Aujourd'hui":`Dans ${d} j`]}))}
  if(s.rows.length){pdfH(P,"Dernières saisies");await loadNames([...new Set(s.rows.map(r=>r.by).filter(Boolean))]);
    pdfT(P,["Date",hasProd(l)?(isDairy(l)?"Lait (L)":"Œufs"):"Poids","Morts","Aliment (kg)","Par","Remarque"],s.rows.slice(-21).reverse().map(r=>[fdLong(r.date),hasProd(l)?fmt(r.oeufs):fmtW(l,r.poids),fmt(r.morts),r.aliment!=null?fmt(r.aliment,1):"-",(names[r.by]||"").replace(" (vous)",""),r.note||""]))}
  await pdfSave(P,`B2A-${slug(l.nom)}-rapport-${today()}.pdf`)}
async function pdfCal(l){const s=stats(l);const P=pdfNew("Calendrier sanitaire : "+l.nom,`${l.espece}${l.race?" · "+l.race:""}  ·  arrivé le ${fdLong(l.arrivee)}  ·  âge ≈ ${s.ageW} semaines`);
  const prog=programme(l);await loadNames([...new Set(prog.map(p=>p.by).filter(Boolean))]);
  pdfT(P,["Date","Âge","Type","Soin","Mode","Statut"],prog.map(p=>{const d=daysBetween(today(),p.date);return [fdLong(p.date),p.ageW!=null?p.ageW+" sem.":"",p.type,p.nom,p.voie||"",p.done?"Fait"+(p.doneDate?" le "+fdLong(p.doneDate):""):d<0?"En retard":d===0?"Aujourd'hui":"À faire"]}),
    {columnStyles:{0:{cellWidth:24},1:{cellWidth:14},2:{cellWidth:20},5:{cellWidth:28}},didParseCell:d=>{if(d.section==="body"){const v=String(d.row.raw[5]);if(v.startsWith("En retard"))d.cell.styles.textColor=[179,55,42];else if(v.startsWith("Fait"))d.cell.styles.textColor=[90,130,60]}}});
  pdfP(P,"Programme type pour l'Afrique de l'Ouest, à faire valider par votre vétérinaire. Cochez les cases au fur et à mesure.",{size:8.5,color:MUTED});
  await pdfSave(P,`B2A-${slug(l.nom)}-calendrier-${today()}.pdf`)}
async function pdfFormule(){const b=fBase()||{t:"",c:{},d:""};const n=nutri(fCur),cost=formCost(fCur),q=fQty||100;const l=lots.find(x=>x.id===fLot);
  const P=pdfNew("Formule d'aliment : "+(SPN[fKey]||""),b.t+(l?"  ·  pour le lot "+l.nom:""));
  pdfH(P,`Mélange pour ${fmt(q)} kg`);{const nd=fNeed();if(nd)pdfP(P,`Pour ${fmt(nd.nb)} animaux : ration ≈ ${fmtG(nd.g)} par animal et par jour, soit ${fmt(nd.daily,nd.daily<10?1:0)} kg par jour, ${fmt(nd.daily*7,nd.daily*7<10?1:0)} kg par semaine et ${fmt(nd.daily*30)} kg par mois.`+(fDays?` Cette quantité couvre environ ${DUR[fDays]}.`:""))}
  pdfT(P,["Ingrédient","%","Quantité (kg)","Prix (F/kg)","Coût (F)"],Object.entries(fCur).map(([k,v])=>[ING[k].n,fmt(v,2),fmt(v*q/100,2),fmt(pIng(k)),fmt(v/100*q*pIng(k))]).concat([["Fabrication et sacs","","",fmt(pFab()),fmt(pFab()*q)],["Transport","","",fmt(pTrans()),fmt(pTrans()*q)],["Total",fmt(n.t,1),fmt(q*n.t/100,1),fmt(cost),fmt(cost*q)]]),
    {columnStyles:{1:{halign:"right"},2:{halign:"right"},3:{halign:"right"},4:{halign:"right"}},didParseCell:d=>{if(d.section==="body"&&d.row.index===Object.keys(fCur).length+2)d.cell.styles.fontStyle="bold"}});
  pdfH(P,"Valeurs nutritives estimées");const C=b.c||{};const rg=(r,dd,u)=>r?`${fmt(r[0],dd)} à ${fmt(r[1],dd)}${u}`:"-";
  const rows=[["Protéines brutes",fmt(n.pb,1)+" %",rg(C.pb,1," %")],["Calcium",fmt(n.ca,2)+" %",rg(C.ca,1," %")]];if(C.em)rows.push(["Énergie métabolisable",fmt(n.em)+" kcal/kg",rg(C.em,0," kcal/kg")]);if(C.lys)rows.push(["Lysine",fmt(n.lys,2)+" %",rg(C.lys,2," %")]);if(C.met)rows.push(["Méthionine",fmt(n.met,2)+" %",rg(C.met,2," %")]);
  rows.push(["Coût du mélange",fmt(cost)+" F/kg",""]);pdfT(P,["Valeur","Formule","Objectif"],rows);
  pdfH(P,"Distribution");pdfP(P,b.d||"");
  pdfP(P,"Préparation : bien mélanger d'abord les petits ingrédients (prémix, sel, acides aminés, phosphate) avec un peu de maïs, puis ajouter ce pré-mélange au reste. Stocker au sec, à l'abri des rongeurs, et utiliser en moins d'un mois.");
  pdfP(P,"Valeurs calculées à partir de compositions moyennes des matières premières. Elles varient selon la qualité réelle : faire analyser l'aliment si possible.",{size:8.5,color:MUTED});
  await pdfSave(P,`B2A-formule-${slug(SPN[fKey])}-${slug(b.t).slice(0,20)}-${today()}.pdf`)}
async function pdfPlan(){const C=CULT[fCult];const {rows,lbl}=planRows();const P=pdfNew("Plan de fumure : "+C.n,lbl);
  let total=0;const body=rows.map(([m,e,d,u,q])=>{const comp=e==="compost";const cost=comp?q/1000*pEng(e):q/50*pEng(e);total+=cost;return [m,ENG[e].n,fmt(d,d<10?1:0)+" "+u,comp?fmt(q/1000,2)+" t":fmt(q,q<10?1:0)+" kg",comp?"-":fmt(q/50,1),fmt(cost)]});
  body.push(["Total","","","","",fmt(total)]);
  pdfT(P,["Moment","Engrais","Dose","Quantité totale","Sacs 50 kg","Coût (F)"],body,{columnStyles:{2:{halign:"right"},3:{halign:"right"},4:{halign:"right"},5:{halign:"right"}},didParseCell:d=>{if(d.section==="body"&&d.row.index===body.length-1)d.cell.styles.fontStyle="bold"}});
  pdfH(P,"Conseils");pdfP(P,C.d);
  pdfP(P,"Prix utilisés : "+Object.keys(ENG).filter(k=>rows.some(r=>r[1]===k)).map(k=>`${ENG[k].n} ${fmt(pEng(k))} F${k==="compost"?" la tonne":" le sac"}`).join(", ")+".",{size:9,color:MUTED});
  pdfP(P,"Doses générales à adapter au sol et à la variété. Demandez conseil à l'agent agricole de votre zone ; une analyse de sol permet d'ajuster les apports.",{size:8.5,color:MUTED});
  await pdfSave(P,`B2A-fumure-${slug(C.n)}-${today()}.pdf`)}
let lastReport=null;
async function pdfDiag(entry){const r=entry.r;const lot=lots.find(l=>l.id===entry.lotId);
  const P=pdfNew("Diagnostic : "+(r.race_ou_variete||r.nom),[r.nom,r.nom_scientifique,lot?"lot "+lot.nom:null,entry.date?new Date(entry.date).toLocaleString("fr-FR",{dateStyle:"long",timeStyle:"short"}):null].filter(Boolean).join("  ·  "));
  if(entry.thumb){try{P.doc.addImage(entry.thumb,"JPEG",P.W-52,30,40,40);P.y=Math.max(P.y,74)}catch(e){}}
  pdfP(P,`Confiance de l'identification : ${num(r.confiance)} %`+(Array.isArray(r.alternatives)&&r.alternatives.length?`. Autres possibilités : ${r.alternatives.join(", ")}.`:""));P.y+=2;
  if(Array.isArray(r.details)&&r.details.length)pdfT(P,["Caractéristique","Estimation"],r.details.map(d=>[d.label,d.value]));
  if(r.priorite){pdfH(P,"À faire maintenant");pdfP(P,r.priorite,{bold:true})}
  const Pt=r.potentiel||{},S=r.sante||{};pdfH(P,"Potentiel et santé");
  pdfT(P,["","Note","Avis"],[["Potentiel de croissance",num(Pt.score)+" / 100",(Pt.niveau||"")+(Pt.resume?". "+Pt.resume:"")],["Santé",num(S.score)+" / 100",(SANTE[S.etat]?SANTE[S.etat][0]:"")+(S.resume?". "+S.resume:"")]]);
  if(Array.isArray(Pt.indicateurs)&&Pt.indicateurs.length)pdfT(P,["Indicateur","Valeur attendue"],Pt.indicateurs.map(x=>[x.label,x.value]));
  if(Array.isArray(S.signes)&&S.signes.length)pdfT(P,["Signe observé","Gravité"],S.signes.map(x=>[x.texte,x.gravite==="grave"?"Grave":x.gravite==="moyen"?"Moyen":"Normal"]));
  if(Array.isArray(S.causes_possibles)&&S.causes_possibles.length)pdfP(P,"Causes possibles : "+S.causes_possibles.join(", ")+".");
  if(Array.isArray(r.suivi)&&r.suivi.length){pdfH(P,"Plan de suivi");pdfT(P,["Domaine","Action","Quand"],r.suivi.map(x=>[x.categorie,x.action,x.frequence]),{columnStyles:{0:{cellWidth:32},2:{cellWidth:34}}})}
  if(r.limites)pdfP(P,"Limites : "+r.limites,{size:9,color:MUTED});
  pdfP(P,"Analyse par intelligence artificielle à partir de photos : aide à la décision qui ne remplace pas l'examen d'un vétérinaire ou d'un agent agricole.",{size:8.5,color:MUTED});
  await pdfSave(P,`B2A-diagnostic-${slug(r.race_ou_variete||r.nom)}-${today()}.pdf`)}
$("f-pdf").onclick=()=>pdfRun($("f-pdf"),pdfFormule);
$("f-planpdf").onclick=()=>pdfRun($("f-planpdf"),pdfPlan);
$("c-pdf").onclick=()=>{const l=lots.find(x=>x.id===calLot);if(!l){dbMsg("Choisissez d'abord un lot.",true);return}pdfRun($("c-pdf"),()=>pdfCal(l))};
/* ---------- ventes et factures ---------- */
let factures=[],entreprise={},vEdit=null,vLines=[],vStat="payee",vFilter="all",vOpen=null;
const ENT_DEF={nom:"B2A Élevage Bayere",adresse:"Ouagadougou, Burkina Faso",tel:"",ifu:"",rccm:"",pied:"Merci pour votre confiance."};
const ent=()=>Object.assign({},ENT_DEF,entreprise);
const PRODS=[
 ["oeufs_plateau","Œufs (plateau de 30)","plateau",l=>Number(l.prixOeuf)*30||0],
 ["oeufs","Œufs (à l'unité)","œuf",l=>Number(l.prixOeuf)||0],
 ["poussins","Poussins d'un jour","tête",()=>0],
 ["reforme","Poules de réforme","tête",l=>Number(l.prixFin)||0],
 ["poulets","Poulets (par tête)","tête",l=>Number(l.prixFin)||0],
 ["poulets_kg","Poulets (au kg vif)","kg",l=>Number(l.prixKg)||0],
 ["animaux","Animaux sur pied","tête",l=>Number(l.prixFin)||0],
 ["animaux_kg","Animaux (au kg vif)","kg",l=>Number(l.prixKg)||0],
 ["lait","Lait","litre",l=>Number(l.prixOeuf)||0],
 ["aliment","Aliment","kg",l=>Number(l.prixAlimentAlt)||Number(l.prixAliment)||0],
 ["fumier","Fumier","sac",()=>0],
 ["recolte","Récolte (produits de culture)","kg",l=>Number(l.prixVente)||0],
 ["autre","Autre","unité",()=>0]];
const prodOf=k=>PRODS.find(p=>p[0]===k)||PRODS[PRODS.length-1];
const STAT={payee:["Payée","ok"],acompte:["Acompte","warn"],apayer:["À payer","bad"]};
const MODES=["Espèces","Orange Money","Moov Money","Virement bancaire","Chèque","Autre"];
function facTotals(f){const sous=(f.lignes||[]).reduce((p,x)=>p+(Number(x.qte)||0)*(Number(x.pu)||0),0);const rem=Math.min(sous,Number(f.remise)||0);const total=sous-rem;
  const paye=f.statut==="payee"?total:f.statut==="acompte"?Math.min(total,Number(f.paye)||0):0;return {sous,rem,total,paye,reste:total-paye}}
function nextNum(){const y=new Date().getFullYear();let max=0;factures.forEach(f=>{const m=String(f.num||"").match(/^FAC-(\d{4})-(\d+)$/);if(m&&Number(m[1])===y)max=Math.max(max,Number(m[2]))});return `FAC-${y}-${String(max+1).padStart(4,"0")}`}

/* montant en lettres (français) */
function enLettres(n){n=Math.round(Math.abs(n));if(n===0)return "zéro";
  const U=["","un","deux","trois","quatre","cinq","six","sept","huit","neuf","dix","onze","douze","treize","quatorze","quinze","seize"];
  const D={2:"vingt",3:"trente",4:"quarante",5:"cinquante",6:"soixante"};
  function c100(x){if(x<17)return U[x];if(x<20)return "dix-"+U[x-10];const t=Math.floor(x/10),u=x%10;
    if(t<7)return D[t]+(u===0?"":u===1?" et un":"-"+U[u]);
    if(t===7)return "soixante"+(u===1?" et onze":"-"+c100(10+u));
    if(t===8)return u===0?"quatre-vingts":"quatre-vingt-"+U[u];
    return "quatre-vingt-"+c100(10+u)}
  function c1000(x){const h=Math.floor(x/100),r=x%100;if(!h)return c100(r);return (h===1?"cent":U[h]+" cent"+(r?"":"s"))+(r?" "+c100(r):"")}
  const inv=s=>s.replace(/cents$/,"cent").replace(/vingts$/,"vingt");
  const parts=[];const md=Math.floor(n/1e9),mi=Math.floor(n%1e9/1e6),th=Math.floor(n%1e6/1e3),r=n%1e3;
  if(md)parts.push(c1000(md)+(md>1?" milliards":" milliard"));
  if(mi)parts.push(c1000(mi)+(mi>1?" millions":" million"));
  if(th)parts.push(th===1?"mille":inv(c1000(th))+" mille");
  if(r)parts.push(c1000(r));return parts.join(" ")}

/* écran */
function vTile(lbl,val,sm,cls){const t=el("div","tile"+(cls?" "+cls:""));t.append(el("span",null,lbl),el("b",null,val));if(sm)t.append(el("small",null,sm));return t}
function renderVentes(){
  if(!$("v-ventes"))return;
  const T=$("v-tiles");T.innerHTML="";const m=today().slice(0,7);
  const mois=factures.filter(f=>(f.date||"").slice(0,7)===m);
  const tot=mois.reduce((p,f)=>p+facTotals(f).total,0),enc=mois.reduce((p,f)=>p+facTotals(f).paye,0);
  const reste=factures.reduce((p,f)=>p+facTotals(f).reste,0),nbr=factures.filter(f=>facTotals(f).reste>0).length;
  T.append(vTile("Ventes du mois",fmt(tot)+" F",mois.length+" facture(s)"),vTile("Encaissé ce mois",fmt(enc)+" F",null,"ok"),vTile("À encaisser",fmt(reste)+" F",nbr+" client(s)",reste>0?"warn":"ok"));
  document.querySelectorAll("#v-filters button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.f===vFilter));
  const L=$("v-list");L.innerHTML="";
  const list=factures.filter(f=>vFilter==="all"||(vFilter==="apayer"?facTotals(f).reste>0:facTotals(f).reste<=0));
  if(!list.length){const e=el("li","empty");e.append(el("strong",null,factures.length?"Aucune facture dans ce filtre":"Aucune facture pour l'instant"));
    if(!factures.length)e.append(el("span",null,"Créez votre première facture : choisissez le client, ajoutez les produits vendus, puis téléchargez le PDF."));L.append(e)}
  list.forEach(f=>{const t=facTotals(f);const st=t.reste<=0?"payee":f.statut==="acompte"?"acompte":"apayer";
    const li=el("li","inv");const top=el("button","inv-top");top.type="button";
    const a=el("div","inv-a");a.append(el("b",null,f.num),notr(el("span",null,(f.client&&f.client.nom)||"—")));
    const b=el("div","inv-b");b.append(el("b",null,fmt(t.total)+" F"),el("span","pill s-"+STAT[st][1],STAT[st][0]));
    top.append(a,b);top.onclick=()=>{vOpen=vOpen===f.id?null:f.id;renderVentes()};li.append(top);
    const sub=el("div","inv-sub");sub.append(el("span",null,new Date(f.date+"T12:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"})));
    if(t.reste>0&&t.paye>0)sub.append(el("span",null,"reste "+fmt(t.reste)+" F"));li.append(sub);
    if(vOpen===f.id){const act=el("div","btnrow inv-act");
      const pb=el("button","btn small","PDF");pb.type="button";pb.onclick=()=>pdfRun(pb,()=>pdfFacture(f));act.append(pb);
      const wa=el("a","btn small ghost","WhatsApp");wa.href=waLink(f);wa.target="_blank";wa.rel="noopener";act.append(wa);
      if(canWrite){if(t.reste>0){const pp=el("button","btn small ghost","Marquer payée");pp.type="button";pp.onclick=async()=>{try{await db.doc("factures/"+f.id).update({statut:"payee",paye:t.total,datePaiement:today()})}catch(e){dbMsg(errText(e),true)}};act.append(pp)}
        const ed=el("button","btn small ghost","Modifier");ed.type="button";ed.onclick=()=>openFacture(f);act.append(ed);
        const dl=el("button","btn small ghost danger","Supprimer");dl.type="button";dl.onclick=async()=>{if(dl.dataset.c!=="1"){dl.dataset.c="1";dl.textContent="Confirmer la suppression";return}
          try{await db.doc("factures/"+f.id).delete();vOpen=null}catch(e){dbMsg(errText(e),true)}};act.append(dl)}
      li.append(act)}
    L.append(li)});
  $("v-new").hidden=!canWrite||!db;
  const E=ent();["nom","adresse","tel","ifu","rccm","pied"].forEach(k=>{const i=$("e-"+k);if(i&&document.activeElement!==i)i.value=E[k]||""});
  const dlc=$("v-clients");dlc.innerHTML="";[...new Set(factures.map(f=>f.client&&f.client.nom).filter(Boolean))].forEach(n=>{const o=document.createElement("option");o.value=n;dlc.append(o)});
}
function waLink(f){const t=facTotals(f),E=ent();let ph=String((f.client&&f.client.tel)||"").replace(/\D/g,"");if(ph.length===8)ph="226"+ph;
  const L=[`${PT("Facture")} ${f.num} · ${E.nom}`,`${PT("Date")} : ${new Date(f.date+"T12:00").toLocaleDateString("fr-FR")}`];
  (f.lignes||[]).forEach(x=>L.push(`- ${x.desc||PT(prodOf(x.prod)[1])} : ${fmt(Number(x.qte))} × ${fmt(Number(x.pu))} F`));
  L.push(`${PT("Total")} : ${fmt(t.total)} F`);if(t.reste>0)L.push(`${PT("Reste à payer")} : ${fmt(t.reste)} F`);else L.push(PT("Payée")+". "+PT(E.pied||""));
  return "https://wa.me/"+(ph||"")+"?text="+encodeURIComponent(L.join("\n"))}

/* formulaire */
function fillVLots(){const s=$("v-lot");if(!s)return;const k=s.value;s.innerHTML="";const o0=el("option",null,"Aucun");o0.value="";s.append(o0);
  lots.filter(l=>l.actif!==false).forEach(l=>{const o=notr(el("option",null,l.nom));o.value=l.id;s.append(o)});s.value=k||""}
function openFacture(f){vEdit=f||null;$("v-form").hidden=false;$("v-listcard").hidden=true;$("v-tiles").hidden=true;$("v-entbox").hidden=true;fillVLots();
  $("v-ftitle").textContent=f?"Modifier la facture":"Nouvelle facture";$("v-num").textContent=f?f.num:nextNum();
  $("v-date").value=f?f.date:today();$("v-cnom").value=f?(f.client.nom||""):"";$("v-ctel").value=f?(f.client.tel||""):"";$("v-cadr").value=f?(f.client.adresse||""):"";
  $("v-lot").value=f?(f.lotId||""):"";$("v-remise").value=f&&f.remise?f.remise:"";vStat=f?f.statut:"payee";$("v-paye").value=f&&f.paye?f.paye:"";
  $("v-mode").value=f?(f.mode||"Espèces"):"Espèces";$("v-note").value=f?(f.note||""):"";
  vLines=f?JSON.parse(JSON.stringify(f.lignes||[])):[{prod:"oeufs_plateau",desc:"",qte:1,pu:0}];
  if(!f)applyLotPrices();renderVLines();renderVStat();$("v-msg").textContent="";window.scrollTo(0,0)}
function closeFacture(){$("v-form").hidden=true;$("v-listcard").hidden=false;$("v-tiles").hidden=false;$("v-entbox").hidden=false;vEdit=null;renderVentes();window.scrollTo(0,0)}
function applyLotPrices(){const l=lots.find(x=>x.id===$("v-lot").value);if(!l)return;
  if(vLines.length===1&&!vLines[0].desc){const k=isCrop(l)?"recolte":isLayer(l)?"oeufs_plateau":isDairy(l)?"lait":isPoultry(l)?(Number(l.prixKg)?"poulets_kg":"poulets"):(Number(l.prixKg)?"animaux_kg":"animaux");vLines[0].prod=k}
  vLines.forEach(x=>{if(!Number(x.pu)){const p=prodOf(x.prod)[3](l);if(p)x.pu=Math.round(p)}})}
function renderVLines(){const B=$("v-lines");B.innerHTML="";
  vLines.forEach((x,i)=>{const r=el("div","vline");
    const sel=document.createElement("select");sel.setAttribute("aria-label","Produit");PRODS.forEach(p=>{const o=el("option",null,p[1]);o.value=p[0];sel.append(o)});sel.value=x.prod;
    sel.onchange=()=>{x.prod=sel.value;const l=lots.find(y=>y.id===$("v-lot").value);const p=l?prodOf(x.prod)[3](l):0;if(p)x.pu=Math.round(p);renderVLines()};
    const d=el("input");d.type="text";d.placeholder="Précision (facultatif)";d.value=x.desc||"";d.oninput=()=>{x.desc=d.value};d.setAttribute("aria-label","Précision");
    const q=el("input");q.type="number";q.min="0";q.step="any";q.inputMode="decimal";q.value=x.qte;q.setAttribute("aria-label","Quantité");q.oninput=()=>{x.qte=N(q.value)||0;tot()};
    const u=el("span","vunit",prodOf(x.prod)[2]);
    const p=el("input");p.type="number";p.min="0";p.inputMode="decimal";p.value=x.pu||"";p.placeholder="Prix";p.setAttribute("aria-label","Prix unitaire (FCFA)");p.oninput=()=>{x.pu=N(p.value)||0;tot()};
    const t=el("b","vlt");const tot=()=>{t.textContent=fmt((Number(x.qte)||0)*(Number(x.pu)||0))+" F";renderVTotals()};
    const rm=el("button","btn small ghost","×");rm.type="button";rm.setAttribute("aria-label","Retirer la ligne");rm.onclick=()=>{vLines.splice(i,1);if(!vLines.length)vLines.push({prod:"autre",desc:"",qte:1,pu:0});renderVLines()};
    const g1=el("div","vl1");g1.append(sel,rm);const g2=el("div","vl2");const qf=el("label","vq");qf.append(el("span",null,"Qté"),q,u);const pf=el("label","vp");pf.append(el("span",null,"Prix unitaire"),p);g2.append(qf,pf,t);
    r.append(g1,d,g2);B.append(r);t.textContent=fmt((Number(x.qte)||0)*(Number(x.pu)||0))+" F"});
  renderVTotals()}
function curFac(){return {lignes:vLines,remise:N($("v-remise").value)||0,statut:vStat,paye:N($("v-paye").value)||0}}
function renderVTotals(){const t=facTotals(curFac());const B=$("v-totals");B.innerHTML="";
  const row=(a,b,c)=>{const r=el("div","vt"+(c?" "+c:""));r.append(el("span",null,a),el("b",null,b));B.append(r)};
  row("Sous-total",fmt(t.sous)+" F");if(t.rem)row("Remise","− "+fmt(t.rem)+" F");row("Total",fmt(t.total)+" F","big");
  if(vStat!=="payee")row("Reste à payer",fmt(t.reste)+" F","due")}
function renderVStat(){document.querySelectorAll("#v-stat button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.s===vStat));$("v-payebox").hidden=vStat!=="acompte";$("v-modebox").hidden=vStat==="apayer";renderVTotals()}
async function saveFacture(withPdf,btn){
  const nom=$("v-cnom").value.trim();const lignes=vLines.filter(x=>(Number(x.qte)||0)>0);
  if(!nom||!lignes.length){$("v-msg").textContent="Indiquez le client et au moins un produit avec une quantité.";$("v-msg").className="msg err";return}
  const body={num:vEdit?vEdit.num:$("v-num").textContent,date:$("v-date").value||today(),client:{nom,tel:$("v-ctel").value.trim(),adresse:$("v-cadr").value.trim()},lotId:$("v-lot").value||null,
    lignes:lignes.map(x=>({prod:x.prod,desc:(x.desc||"").trim(),qte:Number(x.qte)||0,pu:Number(x.pu)||0})),remise:N($("v-remise").value)||0,statut:vStat,paye:vStat==="acompte"?(N($("v-paye").value)||0):0,
    mode:vStat==="apayer"?"":$("v-mode").value,note:$("v-note").value.trim(),by:me,createdAt:vEdit?vEdit.createdAt||Date.now():Date.now()};
  if(vStat==="payee")body.paye=facTotals(body).total;
  try{const ref=vEdit?db.doc("factures/"+vEdit.id):db.collection("factures").doc();await ref.set(body);const saved={id:ref.id,...body};closeFacture();vOpen=ref.id;
    if(withPdf)await pdfRun(btn,()=>pdfFacture(saved))}catch(e){$("v-msg").textContent=errText(e);$("v-msg").className="msg err"}}
$("v-new").onclick=()=>openFacture(null);$("v-cancel").onclick=closeFacture;
$("v-addline").onclick=()=>{vLines.push({prod:"autre",desc:"",qte:1,pu:0});applyLotPrices();renderVLines()};
$("v-lot").onchange=()=>{applyLotPrices();renderVLines()};$("v-remise").oninput=renderVTotals;$("v-paye").oninput=renderVTotals;
document.querySelectorAll("#v-stat button").forEach(b=>b.onclick=()=>{vStat=b.dataset.s;renderVStat()});
document.querySelectorAll("#v-filters button").forEach(b=>b.onclick=()=>{vFilter=b.dataset.f;renderVentes()});
$("v-save").onclick=()=>saveFacture(false,$("v-save"));$("v-savepdf").onclick=()=>saveFacture(true,$("v-savepdf"));
$("v-cnom").addEventListener("change",()=>{const f=factures.find(x=>x.client&&x.client.nom===$("v-cnom").value);if(f){if(!$("v-ctel").value)$("v-ctel").value=f.client.tel||"";if(!$("v-cadr").value)$("v-cadr").value=f.client.adresse||""}});
{const ms=$("v-mode");MODES.forEach(m=>{const o=el("option",null,m);o.value=m;ms.append(o)})}
$("e-save").onclick=async()=>{const v={};["nom","adresse","tel","ifu","rccm","pied"].forEach(k=>v[k]=$("e-"+k).value.trim());
  try{await db.doc("reglages/entreprise").set(v);$("e-msg").textContent="Enregistré.";$("e-msg").className="msg good"}catch(e){$("e-msg").textContent=errText(e);$("e-msg").className="msg err"}};

/* PDF de la facture */
async function pdfFacture(f){const E=ent(),t=facTotals(f);const SEP=(window.B2A_LANG?window.B2A_LANG():"fr")==="fr"?" : ":": ";const st=t.reste<=0?"payee":f.statut==="acompte"?"acompte":"apayer";
  const P=pdfNew(PT("Facture")+" N° "+f.num,PT("Date")+SEP+new Date(f.date+"T12:00").toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}));const d=P.doc,W=P.W;
  const SAN=s=>PT.call(null,"\u0001"+s).slice(1);
  // tampon
  d.saveGraphicsState&&d.saveGraphicsState();const col=st==="payee"?[59,117,32]:st==="acompte"?[154,106,16]:[179,55,42];
  d.setDrawColor(...col);d.setTextColor(...col);d.setLineWidth(0.8);d.roundedRect(W-62,31,50,13,2,2,"S");d.setFont("helvetica","bold");d.setFontSize(13);
  d.text(PT(STAT[st][0]).toUpperCase(),W-37,39.6,{align:"center"});
  // vendeur / client
  const y0=P.y+2;d.setFontSize(8.5);d.setTextColor(90,100,119);d.setFont("helvetica","bold");d.text(PT("Vendeur").toUpperCase(),12,y0);d.text(PT("Client").toUpperCase(),W/2+4,y0);
  d.setFont("helvetica","normal");d.setTextColor(20,29,46);d.setFontSize(10.5);
  const vend=[E.nom,E.adresse,E.tel?PT("Tél.")+" "+E.tel:"",E.ifu?"IFU "+E.ifu:"",E.rccm?"RCCM "+E.rccm:""].filter(Boolean);
  const cli=[f.client.nom,f.client.adresse,f.client.tel?PT("Tél.")+" "+f.client.tel:""].filter(Boolean);
  vend.forEach((s,i)=>{d.setFont("helvetica",i?"normal":"bold");d.text(d.splitTextToSize(SAN(s),W/2-20)[0],12,y0+6+i*5)});
  cli.forEach((s,i)=>{d.setFont("helvetica",i?"normal":"bold");d.text(d.splitTextToSize(SAN(s),W/2-20)[0],W/2+4,y0+6+i*5)});
  P.y=y0+8+Math.max(vend.length,cli.length)*5;
  const lot=lots.find(l=>l.id===f.lotId);
  pdfT(P,["Désignation","Qté","Unité","Prix unitaire","Montant"],f.lignes.map(x=>[PT(prodOf(x.prod)[1])+(x.desc?" — "+x.desc:""),fmt(x.qte,x.qte%1?2:0),PT(prodOf(x.prod)[2]),fmt(x.pu)+" F",fmt(x.qte*x.pu)+" F"]),
    {columnStyles:{1:{halign:"right",cellWidth:16},2:{cellWidth:20},3:{halign:"right",cellWidth:30},4:{halign:"right",cellWidth:32}}});
  const rows=[["Sous-total",fmt(t.sous)+" F"]];if(t.rem)rows.push(["Remise","- "+fmt(t.rem)+" F"]);rows.push(["Total",fmt(t.total)+" F"]);
  if(t.paye>0&&t.reste>0)rows.push(["Déjà payé",fmt(t.paye)+" F"]);if(t.reste>0)rows.push(["Reste à payer",fmt(t.reste)+" F"]);
  d.autoTable({startY:P.y-3,body:rows.map(r=>[PT(r[0]),PT(r[1])]),margin:{left:W-12-82},tableWidth:82,theme:"plain",styles:{font:"helvetica",fontSize:10,cellPadding:1.8,textColor:[20,29,46]},
    columnStyles:{1:{halign:"right"}},didParseCell:c=>{const lab=rows[c.row.index][0];if(lab==="Total"){c.cell.styles.fontStyle="bold";c.cell.styles.fontSize=12;c.cell.styles.fillColor=[228,234,244]}if(lab==="Reste à payer"){c.cell.styles.fontStyle="bold";c.cell.styles.textColor=[179,55,42]}}});
  P.y=d.lastAutoTable.finalY+7;
  if((window.B2A_LANG?window.B2A_LANG():"fr")==="fr"){const w=enLettres(t.total);pdfP(P,"Arrêtée la présente facture à la somme de "+w+" ("+fmt(t.total)+") francs CFA.",{size:9.5})}
  if(f.mode&&st!=="apayer")pdfP(P,PT("Mode de paiement")+SEP+PT(f.mode),{size:9.5});
  if(lot)pdfP(P,PT("Lot")+SEP+lot.nom,{size:9,color:[90,100,119]});
  if(f.note)pdfP(P,PT("Remarque")+SEP+f.note,{size:9.5});
  P.y+=4;pdfP(P,E.pied||"",{bold:true,color:[27,46,76]});
  await pdfSave(P,`B2A-${f.num}-${slug(f.client.nom)}.pdf`)}

/* ---------- lots list ---------- */
/* lots clôturés : visibles pour pouvoir les rouvrir ou les supprimer (ils comptent encore dans le bilan) */
function renderClosed(){const L=$("lots");if(!L||!db)return;const cl=lots.filter(l=>l.actif===false);if(!cl.length)return;
  const D=el("details","closedlots");D.style.marginTop="10px";D.append(el("summary",null,"Lots clôturés ("+cl.length+")"));
  D.append(el("p","note","Ils comptent encore dans le bilan de l'année. Supprimez un lot créé par erreur ou pour un essai."));
  cl.forEach(l=>{const r=el("div","row between");r.style.cssText="padding:8px 0;border-top:1px solid var(--line, rgba(127,127,127,.25));gap:8px";
    const t=el("div");const nm=el("b",null,l.nom||l.espece||"Lot");nm.setAttribute("data-notr","");
    const sm=el("small",null,[l.espece,fmt(Number(l.effectif)||0)+" sujets",l.arrivee?fdate(l.arrivee):null].filter(Boolean).join(" · "));sm.style.display="block";t.append(nm,sm);
    const bx=el("div","row");bx.style.gap="6px";const ro=el("button","btn small ghost","Rouvrir");ro.type="button";const del=el("button","btn small ghost danger","Supprimer");del.type="button";
    ro.onclick=async()=>{try{await db.doc("lots/"+l.id).update({actif:true})}catch(e){alert(errText(e))}};
    del.onclick=async()=>{if(del.dataset.c!=="1"){del.dataset.c="1";del.textContent="Confirmer la suppression";return}
      try{await db.doc("lots/"+l.id).delete()}catch(e){del.dataset.c="";del.textContent="Supprimer";alert(errText(e))}};
    bx.append(ro,del);r.append(t,bx);D.append(r)});
  L.append(D)}
function renderLots(){
  try{dispatchEvent(new CustomEvent("b2a-data"))}catch(e){}
  const L=$("lots");L.innerHTML="";const act=lots.filter(l=>l.actif!==false);queueMicrotask(renderClosed);
  if(!act.length){const e=el("div","empty");e.append(el("strong",null,db?"Aucun lot pour l'instant":"Chargement…"));
    if(db)e.append(el("span",null,"Créez votre premier lot (ex. vos pondeuses ISA Brown) pour suivre la ponte, la mortalité et l'aliment."));
    L.append(e);$("lotdetail").hidden=true;$("home").hidden=false;detailOpen=false;fillLotSelects();renderGlobalAlerts();return;}
  if(selLot&&!act.find(l=>l.id===selLot)){selLot=null;detailOpen=false}
  act.forEach(l=>{if(isCrop(l)){if(CC())L.append(CC().card(l));return}const s=stats(l);const AA=allAlerts(l,s);const lev=AA.some(a=>a[0]==="bad")?"bad":AA.some(a=>a[0]==="warn")?"warn":"ok";const b=el("button","lot");b.type="button";
    {const av=el("span","av");av.innerHTML=isPoultry(l)?'<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="13" rx="6.5" ry="8"/></svg>':isDairy(l)?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c3.5 4.5 6 8 6 11a6 6 0 0 1-12 0c0-3 2.5-6.5 6-11z"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13l8-7 8 7"/><path d="M8 13v6h8v-6"/></svg>';b.append(av)}b.append(notr(el("b",null,l.nom||"Lot")));
    const parts=[l.race||l.espece,fmt(s.alive)+" sujets"];if(isLayer(l)&&s.last&&s.last.ponte!=null)parts.push("ponte "+fmt(s.last.ponte,1)+" %");if(isDairy(l)&&s.lait7!=null)parts.push(fmt(s.lait7,1)+" L/tête/j");if(!hasProd(l)&&s.poids!=null)parts.push(fmtW(l,s.poids));
    b.append(el("small",null,parts.filter(Boolean).join(" · ")));
    const lab={ok:"RAS",warn:"À surveiller",bad:"Alerte"}[lev];b.append(el("span","pill s-"+lev,lab));
    b.append(el("span","go","›"));b.onclick=()=>openLot(l.id);L.append(b)});
  renderDetail();fillLotSelects();renderGlobalAlerts();renderCal();
}

/* ---------- lot detail ---------- */
function chartSVG(rows,key,unit,maxFixed,l,refFn){
  const pts=rows.filter(r=>r[key]!=null).slice(-30);if(pts.length<2)return null;
  const W=640,H=250,pl=62,pr=96,pt=16,pb=36;const vals=pts.map(p=>p[key]);
  const ageAt=p=>(Number(l&&l.ageArrivee)||0)+(l&&l.arrivee?daysBetween(l.arrivee,p.date)/7:0);
  const refs=refFn&&l&&l.arrivee?pts.map(p=>refFn(ageAt(p))):null;const allv=refs?vals.concat(refs.filter(v=>v!=null)):vals;
  const step=Math.max(...allv)<=10?1:10;
  let mx=maxFixed||Math.ceil(Math.max(...allv)*1.15/step)*step||step;let mn=maxFixed?0:Math.max(0,Math.floor(Math.min(...allv)*0.85/step)*step);if(mx<=mn)mx=mn+step;
  const x=i=>pl+i*(W-pl-pr)/(pts.length-1),y=v=>pt+(1-(v-mn)/(mx-mn))*(H-pt-pb);
  let g="";for(let k=0;k<=4;k++){const v=mn+(mx-mn)*k/4;g+=`<line class="grid" x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}"/><text class="axis" x="${pl-6}" y="${y(v)+4}" text-anchor="end">${fmt(v,step<10?1:0)}</text>`}
  const line=pts.map((p,i)=>`${i?"L":"M"}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join("");
  const area=line+`L${x(pts.length-1)},${y(mn)}L${x(0)},${y(mn)}Z`;
  let morts="";const mm=Math.max(1,...pts.map(p=>p.morts||0));pts.forEach((p,i)=>{if(p.morts>0){const h=Math.max(3,p.morts/mm*30);morts+=`<rect class="mort" x="${x(i)-2.5}" y="${H-pb-h}" width="5" height="${h}" rx="1"><title>${p.morts} mort(s) le ${fdate(p.date)}</title></rect>`}});
  let ref="";if(refs){const rp=refs.map((v,i)=>`${i?"L":"M"}${x(i).toFixed(1)},${y(v||0).toFixed(1)}`).join("");ref=`<path class="ref" d="${rp}"/>`}
  const lx=x(pts.length-1),lv=pts[pts.length-1][key];
  const xl=`<text class="axis" x="${pl}" y="${H-8}">${fdate(pts[0].date)}</text><text class="axis" x="${W-pr}" y="${H-8}" text-anchor="end">${fdate(pts[pts.length-1].date)}</text>`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution ${unit}">${g}<path class="area" d="${area}"/>${ref}<path class="line" d="${line}"/>${morts}<circle class="end" cx="${lx}" cy="${y(lv)}" r="5"/><text class="endlbl" x="${lx+9}" y="${y(lv)+4}">${fmt(lv,key==="ponte"||unit==="kg"?1:key==="lait"?2:0)} ${unit}</text>${xl}</svg>`;
}
function kpi(lbl,val,sub,cls){const d=el("div","kpi");d.append(el("span",null,lbl));const b=el("b",null,String(val).replace(/ (F|kg|g|%|L|sem\.)(?=$|\/)/g,"\u00a0$1").replace(/^([−+]) /,"$1\u00a0"));d.append(b);if(sub){const s=el("small",cls||null,sub);d.append(s)}return d}


/* ---------- rentabilité & prévisions ---------- */
const SP={
 pondeuse:{prod:"oeufs",unit:"œufs",end:80,mort:0.1,w:[[0,.04],[4,.27],[8,.66],[12,1.04],[16,1.38],[20,1.65],[30,1.9],[80,2.0]],sale:"Poules de réforme",prodName:"ponte"},
 chair:{end:7,mort:0.7,w:[[0,.042],[1,.19],[2,.47],[3,.94],[4,1.5],[5,2.1],[6,2.7],[7,3.2],[8,3.6]],sale:"Poulets vendus"},
 local:{end:20,mort:0.5,w:[[0,.035],[4,.3],[8,.8],[12,1.3],[16,1.7],[20,2.0],[30,2.2]],sale:"Volailles vendues"},
 petitsrum:{emb:13,mort:0.1,w:[[0,3],[12,12],[26,20],[52,30],[104,40]],sale:"Animaux vendus"},
 chevrelait:{prod:"lait",unit:"litres",lait:1.0,emb:104,mort:0.05,w:[[0,3],[52,30],[104,38]],sale:"Chèvres réformées",prodName:"lait"},
 bovin:{emb:17,mort:0.05,w:[[0,30],[26,150],[52,220],[104,330],[156,400],[208,450]],sale:"Bovins vendus"},
 vachelait:{prod:"lait",unit:"litres",lait:6,emb:104,mort:0.03,w:[[0,30],[104,330],[208,400]],sale:"Vaches réformées",prodName:"lait"},
 porc:{end:26,mort:0.2,w:[[0,1.5],[8,20],[16,55],[24,95],[28,110],[52,150]],sale:"Porcs vendus"},
 poisson:{end:28,mort:0.2,w:[[0,.002],[4,.01],[8,.04],[12,.09],[16,.16],[20,.25],[24,.36],[28,.48],[32,.6]],sale:"Poissons vendus"}
};
function spKey(l){const e=l.espece||"";return /poisson|tilapia|silure|clarias/i.test(e)?"poisson":/pondeuse/i.test(e)?"pondeuse":/chair/i.test(e)?"chair":/poulet|pintade/i.test(e)?"local":/vache/i.test(e)?"vachelait":/chèvre.*lait/i.test(e)?"chevrelait":/chèvre|mouton/i.test(e)?"petitsrum":/bovin/i.test(e)?"bovin":/porc/i.test(e)?"porc":null}
function sp(l){return SP[spKey(l)]||{mort:0.1,w:null,sale:"Animaux vendus"}}
function isPoultry(l){return /poule|poulet|pintade/i.test(l.espece||"")}
function isBroiler(l){return /chair/i.test(l.espece||"")}
function hasProd(l){return !!sp(l).prod}
function isDairy(l){return sp(l).prod==="lait"}
function big(l){return !isPoultry(l)&&spKey(l)!=="poisson"}
function prodUnit(l){return sp(l).unit||""}
function stdWeight(l,w){const W=sp(l).w;if(!W)return null;if(w<=W[0][0])return W[0][1];for(let i=1;i<W.length;i++){if(w<=W[i][0]){const [a,va]=W[i-1],[b,vb]=W[i];return va+(vb-va)*(w-a)/(b-a)}}return W[W.length-1][1]}
/* ---------- rattrapage de poids : la ration et l'aliment suivent le poids réel des animaux ---------- */
/* âge (semaines) auquel le standard de l'espèce atteint ce poids (kg) */
function ageForWeight(l,kg){const W=sp(l).w;if(!W||kg==null)return null;if(kg<=W[0][1])return W[0][0];
  for(let i=1;i<W.length;i++){const [a,va]=W[i-1],[b,vb]=W[i];if(kg<=vb)return a+(b-a)*(kg-va)/((vb-va)||1)}return W[W.length-1][0]}
/* état du poids d'après la dernière pesée (moins de 4 semaines) */
function weightStatus(l,s){if(!s||s.poids==null||!s.poidsDate||!l.arrivee||daysBetween(s.poidsDate,today())>28)return null;
  const aW=(Number(l.ageArrivee)||0)+daysBetween(l.arrivee,s.poidsDate)/7;const sw=stdWeight(l,aW);if(!sw)return null;
  const kg=s.poids/1000,ratio=kg/sw;const pa=ageForWeight(l,kg);
  /* âge « physiologique » aujourd'hui : l'âge du poids pesé + le temps écoulé depuis la pesée */
  const physio=pa==null?null:pa+(s.ageW-aW);
  return {kg,sw,ratio,aW,physio,date:s.poidsDate,late:ratio<0.95,ahead:ratio>1.1}}
/* coefficient de ration : + jusqu'à 15 % si les animaux sont en retard, − jusqu'à 10 % si les poulettes sont trop lourdes */
function catchFactor(l,ws){if(!ws)return 1;if(ws.late)return 1+Math.min(0.15,(1-ws.ratio)*0.6);
  if(ws.ahead&&(isLayer(l)?ws.aW<18:!isBroiler(l)))return 1-Math.min(0.1,(ws.ratio-1.1)*0.5);return 1}
/* âge utilisé pour choisir l'aliment : un lot en retard reste plus longtemps sur l'aliment de croissance */
function feedAge(l,s){const ws=weightStatus(l,s);if(ws&&ws.ratio<0.9&&ws.physio!=null)return Math.min(s.ageW,Math.max(0,ws.physio));return s.ageW}
function stdGain(l,w){const a=stdWeight(l,w),b=stdWeight(l,w+1);return a!=null&&b!=null?Math.max(0,(b-a)*1000/7):null}
function stdPonte(w){ // courbe type pondeuse brune (ISA Brown / Lohmann)
  if(w<18)return 0;if(w<19)return 10;if(w<20)return 35;if(w<21)return 60;if(w<22)return 80;if(w<23)return 89;if(w<25)return 93;if(w<31)return 95;
  return Math.max(65,95-(w-30)*0.55);}
function stdFeed(l,w){ // g/sujet/jour
  const k=spKey(l);
  if(k==="chair")return [25,50,80,110,140,160,175,185][Math.min(7,Math.max(0,Math.floor(w)))];
  if(k==="local")return w<4?20:w<8?45:w<12?65:w<16?80:90;
  if(k==="pondeuse"){const T=[10,17,23,28,34,39,44,49,53,57,61,64,67,70,73,76,80,85,92,98,103,107,110];const i=Math.max(0,Math.floor(w));return i<T.length?T[i]:115}
  if(isPoultry(l))return w<4?25:w<8?45:w<12?60:w<18?80:115;
  if(k==="petitsrum")return 300;if(k==="chevrelait")return 500;if(k==="bovin")return 3000;if(k==="vachelait")return 4000;
  if(k==="poisson"){const bw=(stdWeight(l,w)||0)*1000;return Math.round(bw*(bw<20?0.08:bw<100?0.05:bw<300?0.03:0.02)*10)/10}
  if(k==="porc")return w<8?600:w<16?1600:w<24?2300:2800;
  return 0;}
function ration(l,s,date){const d=date||today();const w=(Number(l.ageArrivee)||0)+(l.arrivee?Math.max(0,daysBetween(l.arrivee,d))/7:0);let g=stdFeed(l,w);if(!g||!s||!(s.alive>0))return null;
  const ws=weightStatus(l,s);const base=g;
  /* gros animaux et poissons : la ration suit le poids réel (et non l'âge seul) */
  /* (un animal en retard n'est jamais moins nourri : il reçoit la ration de son âge + le rattrapage) */
  if(ws&&(big(l)||spKey(l)==="poisson")&&ws.ratio>1){g=g*Math.min(1.5,ws.ratio)}
  const f=catchFactor(l,ws);g=g*f;g=g>=100?Math.round(g/5)*5:Math.round(g);
  return {g,kg:s.alive*g/1000,n:s.alive,base,f,ws}}
function defaultEnd(l){const P=sp(l);if(P.end)return P.end;if(P.emb)return (Number(l.ageArrivee)||0)+P.emb;return 52}
function fmtW(l,g){return g==null?"—":big(l)?fmt(g/1000,1)+" kg":fmt(g)+" g"}
function prodSummary(l,s){
  if(isLayer(l))return `Ponte moyenne 7 j : ${fmt(s.ponte7,1)} % (semaine précédente ${fmt(s.pontePrev,1)} %, standard ${fmt(stdPonte(s.ageW))} %).`;
  if(isDairy(l))return `Lait moyen 7 j : ${fmt(s.lait7,2)} L/tête/jour (standard ≈ ${fmt(sp(l).lait,1)} L).`;
  const sw=stdWeight(l,s.ageW);return `Poids moyen : ${fmtW(l,s.poids)} (standard à cet âge ≈ ${sw!=null?fmtW(l,sw*1000):"—"})${s.gmq!=null?`, gain moyen ${fmtW(l,s.gmq)}/jour`:""}.`;
}
/* investissement (bâtiment, matériel) : il sert à plusieurs lots, donc ce lot n'en porte que sa part
   = durée du lot ÷ durée d'utilisation (5 ans par défaut, comme le bilan de l'année) */
const INV_DUREE=5;
function investShare(l){const total=Number(l.investissement)||0;const du=N(l.dureeInvest)!=null&&N(l.dureeInvest)>0?N(l.dureeInvest):INV_DUREE;
  const end=Number(l.ageFin)||defaultEnd(l);const years=Math.max(0,(end-(Number(l.ageArrivee)||0))*7/365.25);
  const ratio=total?Math.min(1,years/du):0;return {total,du,years,ratio,part:Math.round(total*ratio)}}
function finance(l,s){
  const pa=Number(l.prixAliment)||0,pv=Number(l.prixOeuf)||0;
  const daysSince=l.arrivee?Math.max(0,daysBetween(l.arrivee,today())):0;
  const feedKg=(Number(l.alimentAvant)||0)+s.rows.reduce((p,r)=>p+(r.aliment||0),0),eggs=(Number(l.oeufsAvant)||0)+s.rows.reduce((p,r)=>p+(r.oeufs||0),0);
  const inv=investShare(l);
  const dep={achat:(Number(l.prixSujet)||0)*(Number(l.effectif)||0),invest:inv.part,aliment:feedKg*pa,charges:(Number(l.chargesMois)||0)*daysSince/30.4};
  const depTot=dep.achat+dep.invest+dep.aliment+dep.charges,rec=hasProd(l)?eggs*pv:0;
  const missing=[];if(!pa)missing.push("prix de l'aliment");if(hasProd(l)&&!pv)missing.push(isDairy(l)?"prix du litre de lait":"prix de l'œuf");if(!l.prixFin&&!l.prixKg&&!isLayer(l))missing.push("prix de vente en fin de cycle (par tête ou au kg)");
  return {dep,depTot,rec,solde:rec-depTot,eggs,feedKg,missing,inv,daysSince};
}
/* mortalité des 4 dernières semaines saisies (% par semaine), null s'il y a moins de 7 saisies */
function recentMort(s){const R=s.rows.filter(r=>daysBetween(r.date,today())<28);if(R.length<7)return null;
  const d=R.reduce((p,r)=>p+r.morts,0),bw=R.reduce((p,r)=>p+r.start,0)/7;return bw>0?d/bw:null}
function project(l,s,f,factor,paAlt){
  const P=sp(l),pa=paAlt||Number(l.prixAliment)||0,pv=Number(l.prixOeuf)||0,ch=(Number(l.chargesMois)||0)/4.345;
  const end=Number(l.ageFin)||defaultEnd(l),a0=s.ageW;
  /* mortalité : les 4 prochaines semaines suivent la mortalité réelle des 4 dernières semaines (plafonnée à 1 %/sem.),
     ensuite le taux normal (saisi dans le lot, sinon celui de l'espèce). Un mauvais jour ne pèse donc plus sur tout le cycle. */
  const mNorm=l.mortPrev!=null&&l.mortPrev!==""?Number(l.mortPrev)/100:(P.mort||0.1)/100;
  const mr=s.alive>0?recentMort(s):null;const mRecent=mr==null?mNorm:Math.min(0.01,Math.max(0.0005,mr));const m=mRecent;
  const r0=f.daysSince!=null?f.daysSince%7:0;
  let k=1;if(isLayer(l)&&s.ponte7!=null&&stdPonte(a0)>=30)k=Math.min(1.15,Math.max(0.5,s.ponte7/stdPonte(a0)));
  if(isDairy(l)&&s.lait7!=null&&P.lait)k=Math.min(1.6,Math.max(0.3,s.lait7/P.lait));
  let kw=1;if(s.poids!=null&&s.poidsDate&&daysBetween(s.poidsDate,today())<=30){const aW=(Number(l.ageArrivee)||0)+(l.arrivee?daysBetween(l.arrivee,s.poidsDate)/7:0);const sw=stdWeight(l,aW);if(sw)kw=Math.min(1.3,Math.max(0.6,s.poids/1000/sw))}
  const sf=hasProd(l)?1:factor;
  let birds=s.alive,solde=f.solde,eggs=0,be=f.solde>=0?0:null;const pts=[{w:0,solde}];
  const fut={oeufs:0,aliment:0,alimentKg:0,charges:0,reforme:0};let wEnd=null;
  for(let i=1;a0+i<=end;i++){const w=a0+i;
    /* 1re semaine : seulement les jours pas encore comptés dans les dépenses à ce jour */
    const fr=i===1?(7-r0)/7:1;const mw=i<=4?mRecent:mNorm;
    const g=(w>=18&&s.ageW>=18&&s.gpj7!=null&&isPoultry(l)&&!isBroiler(l))?s.gpj7:(s.gpj7!=null&&!isPoultry(l)?s.gpj7:stdFeed(l,w));
    let e=0;if(isLayer(l))e=birds*Math.min(98,stdPonte(w)*k*factor)/100*7*fr;else if(isDairy(l))e=birds*P.lait*k*factor*7*fr;eggs+=e;
    const kg=birds*g*7/1000*fr;fut.oeufs+=e*pv;fut.alimentKg+=kg;fut.aliment+=kg*pa;fut.charges+=ch*fr;
    solde+=e*pv-kg*pa-ch*fr;birds*=(1-mw*fr);
    if(a0+i+1>end){wEnd=(stdWeight(l,w)||0)*kw*sf;const unit=Number(l.prixKg)?wEnd*Number(l.prixKg):(Number(l.prixFin)||0)*sf;const r=birds*unit;fut.reforme+=r;solde+=r}
    pts.push({w:i,solde});if(be==null&&solde>=0)be=i;}
  return {pts,be,final:solde,eggs,birds,end,m,mNorm,mRecent,k,kw,wEnd,fut,weeks:Math.max(0,end-a0)};
}
const addDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return d};
const fdl=d=>d.toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});
function beText(pr){if(pr.be===0)return "Déjà atteint";if(pr.be==null)return "Pas avant la fin du cycle";return fdl(addDays(pr.be*7))}
function cashSVG(base,low,high,l,s){
  const pts=base.pts;if(pts.length<2)return null;
  const W=640,H=300,pl=86,pr=20,pt=42,pb=40,n=pts.length-1;
  const all=[...pts,...low.pts,...high.pts].map(p=>p.solde);let mx=Math.max(0,...all),mn=Math.min(0,...all);const pd=(mx-mn)*0.08||1;mx+=pd;mn-=pd;
  const x=i=>pl+i*(W-pl-pr)/n,y=v=>pt+(1-(v-mn)/(mx-mn))*(H-pt-pb),y0=y(0);
  const short=v=>{const a=Math.abs(v),sg=v<0?"−":v>0?"+":"";return sg+(a>=1e6?fmt(a/1e6,1)+" M":a>=1e3?fmt(a/1e3)+" k":fmt(a))};
  let o=`<defs><clipPath id="cpos"><rect x="0" y="0" width="${W}" height="${y0}"/></clipPath><clipPath id="cneg"><rect x="0" y="${y0}" width="${W}" height="${H}"/></clipPath></defs>`;
  // phases (pondeuses)
  if(isLayer(l)){const iL=Math.max(0,Math.min(n,18-s.ageW));
    if(iL>0)o+=`<rect class="phase" x="${pl}" y="${pt-22}" width="${x(iL)-pl}" height="16" rx="3"/><text class="phaselbl" x="${pl+6}" y="${pt-10}">Élevage</text>`;
    if(iL<n)o+=`<text class="phaselbl" x="${x(iL)+6}" y="${pt-10}">Ponte</text>`;
    o+=`<text class="phaselbl" x="${W-pr}" y="${pt-10}" text-anchor="end">Réforme</text>`;}
  // grid
  for(let j=0;j<=4;j++){const v=mn+(mx-mn)*j/4;o+=`<line class="grid" x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}"/><text class="axis" x="${pl-6}" y="${y(v)+4}" text-anchor="end">${short(v)}</text>`}
  // month ticks
  let last=-99;for(let i=0;i<=n;i++){const d=addDays(i*7);const prev=addDays(i*7-7);if(i===0||d.getMonth()!==prev.getMonth()){const q=d.getMonth()%3===0||i===0;if(q&&x(i)-last>110){
    o+=`<line class="grid" x1="${x(i)}" x2="${x(i)}" y1="${H-pb}" y2="${H-pb+4}"/><text class="axis" x="${x(i)}" y="${H-10}" text-anchor="${i===0?"start":"middle"}">${i===0?"Auj.":d.toLocaleDateString("fr-FR",{month:"short",year:"2-digit"})}</text>`;last=x(i)}}}
  // scenario band
  const bandTop=high.pts.map((p,i)=>`${i?"L":"M"}${x(i).toFixed(1)},${y(p.solde).toFixed(1)}`).join("");
  const bandBot=low.pts.slice().reverse().map((p,j)=>`L${x(low.pts.length-1-j).toFixed(1)},${y(p.solde).toFixed(1)}`).join("");
  o+=`<path class="band" d="${bandTop}${bandBot}Z"/>`;
  // area to zero, green above / red below
  const line=pts.map((p,i)=>`${i?"L":"M"}${x(i).toFixed(1)},${y(p.solde).toFixed(1)}`).join("");
  const area=`${line}L${x(n)},${y0}L${x(0)},${y0}Z`;
  o+=`<path class="pos" d="${area}" clip-path="url(#cpos)"/><path class="neg" d="${area}" clip-path="url(#cneg)"/>`;
  o+=`<line class="zero" x1="${pl}" x2="${W-pr}" y1="${y0}" y2="${y0}"/><path class="line" d="${line}"/>`;
  // breakeven
  const bi=base.be;if(bi>0){const bx=x(bi),lbl="Bénéfice dès "+addDays(bi*7).toLocaleDateString("fr-FR",{month:"short",year:"numeric"});const anchor=bx>W*0.7?"end":"start";
    o+=`<line x1="${bx}" x2="${bx}" y1="${pt}" y2="${H-pb}" stroke="var(--ok)" stroke-dasharray="4 4"/><circle cx="${bx}" cy="${y0}" r="6" fill="var(--ok)" stroke="var(--surface)" stroke-width="2"/><text class="belbl" x="${bx+(anchor==="end"?-8:8)}" y="${y0-10}" text-anchor="${anchor}">${lbl}</text>`}
  // start & end labels
  o+=`<circle class="end" cx="${x(0)}" cy="${y(pts[0].solde)}" r="4"/><circle class="end" cx="${x(n)}" cy="${y(pts[n].solde)}" r="5"/><text class="endlbl" x="${x(n)-8}" y="${y(pts[n].solde)-10}" text-anchor="end">${short(pts[n].solde)} F</text>`;
  // interaction
  o+=`<g class="tip" visibility="hidden"><line class="cursor" y1="${pt}" y2="${H-pb}"/><circle r="5" fill="var(--leaf)" stroke="var(--surface)" stroke-width="2"/><rect rx="8" height="58" width="236"/><text class="t1"></text><text class="t2"></text></g>`;
  o+=`<rect class="hit" x="${pl}" y="${pt}" width="${W-pl-pr}" height="${H-pt-pb}"/>`;
  return {svg:`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Solde cumulé prévu jusqu'à la fin du cycle">${o}</svg>`,
    attach(root){const sv=root.querySelector("svg"),tip=sv.querySelector(".tip"),hit=sv.querySelector(".hit");
      const move=ev=>{const r=sv.getBoundingClientRect(),px=(ev.clientX-r.left)*W/r.width;const i=Math.max(0,Math.min(n,Math.round((px-pl)/((W-pl-pr)/n))));
        const cx=x(i),cy=y(pts[i].solde);tip.setAttribute("visibility","visible");const ln=tip.querySelector("line");ln.setAttribute("x1",cx);ln.setAttribute("x2",cx);
        const c=tip.querySelector("circle");c.setAttribute("cx",cx);c.setAttribute("cy",cy);
        const bx=cx+246>W?cx-244:cx+8,by=Math.max(pt,Math.min(H-pb-60,cy-70));const rc=tip.querySelector("rect");rc.setAttribute("x",bx);rc.setAttribute("y",by);
        const t1=tip.querySelector(".t1"),t2=tip.querySelector(".t2");t1.setAttribute("x",bx+10);t1.setAttribute("y",by+24);t2.setAttribute("x",bx+10);t2.setAttribute("y",by+48);
        t1.textContent=addDays(i*7).toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"})+" · "+(s.ageW+i)+" sem.";
        t2.textContent="Solde "+short(pts[i].solde)+" F";};
      hit.addEventListener("pointermove",move);hit.addEventListener("pointerdown",move);hit.addEventListener("pointerleave",()=>tip.setAttribute("visibility","hidden"));}};
}
function lotSales(l){const fs=factures.filter(x=>x.lotId===l.id);let tot=0,enc=0;fs.forEach(x=>{const t=facTotals(x);tot+=t.total;enc+=t.paye});return {fs,tot,enc,reste:tot-enc}}
function renderRealSales(D,l,f){const R=lotSales(l);
  D.append(el("h3","sec","Ventes réelles"));
  if(!R.fs.length){const p=el("p","note","Aucune facture liée à ce lot. Dans l'onglet Ventes, choisissez ce lot en créant la facture pour suivre le bénéfice réellement encaissé.");D.append(p);
    if(canWrite&&db){const b=el("button","btn small ghost","+ Nouvelle facture");b.type="button";b.style.justifySelf="start";b.onclick=()=>{show("ventes");setTimeout(()=>{openFacture(null);$("v-lot").value=l.id;applyLotPrices();renderVLines()},30)};D.append(b)}return}
  const K=el("div","kpis");const reel=R.enc-f.depTot;
  K.append(kpi("Ventes facturées",fmt(R.tot)+" F",R.fs.length+" facture(s)"));
  K.append(kpi("Encaissé",fmt(R.enc)+" F",R.reste>0?"reste "+fmt(R.reste)+" F à encaisser":"tout est encaissé",R.reste>0?null:"up"));
  if(f.rec>0){const ec=R.tot-f.rec;K.append(kpi("Comparé à l'estimation",(ec>=0?"+":"−")+fmt(Math.abs(ec))+" F",`estimé d'après les saisies : ${fmt(f.rec)} F`,ec>=0?"up":"down"))}
  K.append(kpi("Solde réel",(reel<0?"−":"")+fmt(Math.abs(reel))+" F",reel<0?"encaissé − dépenses : capital encore à récupérer":"encaissé − dépenses : bénéfice réel",reel<0?"down":"up"));
  D.append(K);
  const w=el("div","tablewrap"),t=el("table","data");const hr=el("tr");[["Facture"],["Client"],["Date"],["Total","n"],["Statut"]].forEach(([x,c])=>hr.append(el("th",c||null,x)));const th=el("thead");th.append(hr);t.append(th);const tb=el("tbody");
  R.fs.slice(0,8).forEach(x=>{const tt=facTotals(x);const st=tt.reste<=0?"payee":x.statut==="acompte"?"acompte":"apayer";const tr=el("tr");const sp=el("td");sp.append(el("span","pill s-"+STAT[st][1],STAT[st][0]));
    const nu=el("td",null,x.num);nu.style.whiteSpace="nowrap";nu.style.fontFamily="var(--mono)";nu.style.fontSize="13px";const dt=el("td",null,fdate(x.date));dt.style.whiteSpace="nowrap";tr.append(nu,notr(el("td",null,(x.client&&x.client.nom)||"")),dt,el("td","n",fmt(tt.total)+" F"),sp);tr.style.cursor="pointer";tr.onclick=()=>{vOpen=x.id;show("ventes")};tb.append(tr)});
  t.append(tb);w.append(t);D.append(w);
  D.append(el("p","note","Le solde réel compare l'argent encaissé sur les factures de ce lot aux dépenses enregistrées à ce jour (achat, aliment saisi, charges, investissement)."))}
function renderFinance(D,l,s){
  const f=finance(l,s);renderRealSales(D,l,f);D.append(el("h3","sec","Prévisions"));
  if(f.missing.length){const p=el("p","msg err","Pour calculer le bénéfice, ajoutez : "+f.missing.join(", ")+" (bouton Modifier).");D.append(p);if(!Number(l.prixAliment))return}
  const K=el("div","kpis");
  K.append(kpi("Dépenses à ce jour",fmt(f.depTot)+" F",`achat ${fmt(f.dep.achat)} · aliment ${fmt(f.dep.aliment)} · charges ${fmt(f.dep.charges)}`+(f.dep.invest?` · invest. (part du lot) ${fmt(f.dep.invest)}`:"")));
  K.append(kpi("Recettes à ce jour",fmt(f.rec)+" F",hasProd(l)?fmt(f.eggs)+" "+prodUnit(l)+" vendus":"vente en fin de cycle"));
  K.append(kpi("Solde actuel",(f.solde<0?"−":"")+fmt(Math.abs(f.solde))+" F",f.solde<0?"capital encore à récupérer":"bénéfice cumulé",f.solde<0?"down":"up"));
  const base=project(l,s,f,1),low=project(l,s,f,0.9),high=project(l,s,f,1.05);
  K.append(kpi("Début du bénéfice",base.be===0?"Atteint":base.be==null?"—":"≈ "+base.be+" sem.",beText(base),base.be==null?"down":"up"));
  K.append(kpi("Bénéfice net du cycle",(base.final<0?"−":"")+fmt(Math.abs(base.final))+" F",`à ${base.end} semaines d'âge`+(isLayer(l)?` · ${fmt(base.eggs/30)} plateaux à venir`:isDairy(l)?` · ${fmt(base.eggs)} L à venir`:""),base.final<0?"down":"up"));
  D.append(K);
  const cs=cashSVG(base,low,high,l,s);if(cs){D.append(el("h3","sec","Évolution de votre argent"));const w=el("div");w.innerHTML=cs.svg;cs.attach(w);D.append(w);
    const lg=el("div","legend");lg.innerHTML='<span><i></i>Solde cumulé (probable)</span><span><i class="b"></i>Entre prudent et favorable</span>';D.append(lg);
    D.append(el("p","note","Sous la ligne zéro (rouge) : argent investi pas encore récupéré. Au-dessus (vert) : bénéfice. Touchez le graphique pour lire une date."))}
  // Bilan prévu du cycle complet
  D.append(el("h3","sec","Bilan prévu du cycle complet"));
  const bt=el("div","tablewrap"),tt=el("table","data");const bb=el("tbody");
  const money=v=>(v<0?"− ":"")+fmt(Math.abs(v))+" F";
  const {lines,alF,chT}=bilanLines(l,s,f,base);
  lines.forEach(([lbl,v,b])=>{const tr=el("tr");const a=el("td",null,lbl),c=el("td","n",money(v));if(b){a.style.fontWeight="700";c.style.fontWeight="700";tr.style.background="var(--bg)"}
    if(lbl.startsWith("Bénéfice net"))c.style.color=v<0?"var(--bad)":"var(--ok)";tr.append(a,c);bb.append(tr)});
  tt.append(bb);bt.append(tt);D.append(bt);
D.append(el("p","note",`L'aliment représente ${fmt(alF/(alF+f.dep.invest+f.dep.achat+chT||1)*100)} % des dépenses : chaque baisse de 10 F/kg rapporte environ ${fmt(base.fut.alimentKg*10)} F d'ici la fin du cycle.`));
  // Scénarios
  D.append(el("h3","sec","Scénarios"));
  const w=el("div","tablewrap"),t=el("table","data");const hr=el("tr");[["Scénario"],["Début du bénéfice"],["Bénéfice net du cycle","n"]].forEach(([x,c])=>hr.append(el("th",c||null,x)));
  const th=el("thead");th.append(hr);t.append(th);const tb=el("tbody");
  const what=isLayer(l)?"ponte":isDairy(l)?"lait":"croissance";
  const sc=[[`Prudent (${what} −10 %)`,low],["Probable",base],[`Favorable (${what} +5 %)`,high]];
  if(Number(l.prixAlimentAlt))sc.push([`Aliment maison à ${fmt(Number(l.prixAlimentAlt))} F/kg`,project(l,s,f,1,Number(l.prixAlimentAlt))]);
  sc.forEach(([n,p])=>{const tr=el("tr");if(p===base)tr.style.fontWeight="700";const c=el("td","n",money(p.final));c.style.color=p.final<0?"var(--bad)":"var(--ok)";tr.append(el("td",null,n),el("td",null,beText(p)),c);tb.append(tr)});
  t.append(tb);w.append(t);D.append(w);
  D.append(el("p","note",`Hypothèses : ${isLayer(l)?`courbe de ponte type ajustée à votre ponte réelle (×${fmt(base.k,2)}), tous les œufs vendus, `:isDairy(l)?`lait ≈ ${fmt(sp(l).lait*base.k,1)} L/tête/jour, tout le lait vendu, `:`courbe de croissance type${base.kw!==1?` ajustée à vos pesées (×${fmt(base.kw,2)})`:""}, `}${Number(l.prixKg)?"vente au poids, ":""}mortalité ${fmt(base.mNorm*100,2)} %/semaine, aliment ${s.gpj7!=null?"selon vos saisies":"selon les besoins types de l'espèce"}, charges mensuelles constantes. L'aliment maison ne s'applique qu'à l'aliment restant à acheter.`));
  if(base.mRecent!==base.mNorm)D.append(el("p","note",`Les 4 prochaines semaines suivent la mortalité réelle de vos saisies : ${fmt(base.mRecent*100,2)} %/semaine.`));
  if(f.inv.total&&f.inv.ratio<1)D.append(el("p","note",`Investissement réparti sur ${fmt(f.inv.du)} ans d'utilisation : ce lot en porte ${fmt(f.inv.part)} F sur ${fmt(f.inv.total)} F.`));
  if(window.B2A&&!(window.B2A.IA_URL&&window.B2A.ia().info))return;
  const box=el("div","card");box.style.background="var(--bg)";
  const hd=el("div","row between");hd.append(el("strong",null,"Analyse et prévisions par l'IA"));
  const btn=el("button","btn small",previsions[l.id]?"Mettre à jour":"Lancer l'analyse");btn.type="button";hd.append(btn);box.append(hd);
  const out=el("div");out.style.display="grid";out.style.gap="10px";box.append(out);
  const pv=previsions[l.id];if(pv&&pv.r)renderPrev(out,pv);else out.append(el("p","note","L'IA étudie vos chiffres et vous donne une prévision sur 3 mois, les risques et les actions pour gagner plus."));
  if(busyPrev[l.id]){btn.disabled=true;btn.textContent="Analyse en cours…"}
  btn.onclick=()=>runPrev(l,s,f,base,low,high);D.append(box);
}
function renderPrev(out,pv){const r=pv.r;out.innerHTML="";
  out.append(el("p","note","Analyse du "+new Date(pv.date).toLocaleString("fr-FR",{dateStyle:"medium",timeStyle:"short"})));
  if(r.avis){const p=el("div","priority");p.append(el("strong",null,"Avis général"),document.createTextNode(r.avis));out.append(p)}
  if(r.resume)out.append(el("p",null,r.resume));
  if(Array.isArray(r.prevision_3_mois)&&r.prevision_3_mois.length){const w=el("div","tablewrap"),t=el("table","data");const hr=el("tr");
    [["Mois"],["Œufs","n"],["Recettes","n"],["Dépenses","n"],["Résultat","n"]].forEach(([x,c])=>hr.append(el("th",c||null,x)));const th=el("thead");th.append(hr);t.append(th);const tb=el("tbody");
    r.prevision_3_mois.forEach(m=>{const tr=el("tr");const res=Number(m.resultat);tr.append(el("td",null,m.mois),el("td","n",m.oeufs!=null?fmt(Number(m.oeufs)):"—"),el("td","n",fmt(Number(m.recettes))+" F"),el("td","n",fmt(Number(m.depenses))+" F"));
      const td=el("td","n",(res<0?"−":"")+fmt(Math.abs(res))+" F");td.style.color=res<0?"var(--bad)":"var(--ok)";tr.append(td);tb.append(tr)});t.append(tb);w.append(t);out.append(w)}
  if(Array.isArray(r.risques)&&r.risques.length){out.append(el("strong",null,"Risques"));const ul=el("ul","alerts");r.risques.forEach(x=>{const li=el("li","s-"+(x.niveau==="eleve"?"bad":x.niveau==="moyen"?"warn":"ok"));li.append(el("span","dot"),el("span",null,x.texte));ul.append(li)});out.append(ul)}
  if(Array.isArray(r.leviers)&&r.leviers.length){out.append(el("strong",null,"Actions pour améliorer le bénéfice"));const w=el("div","tablewrap"),t=el("table","data");const tb=el("tbody");
    r.leviers.forEach(x=>{const tr=el("tr");tr.append(el("td",null,x.action),el("td","n",x.gain_estime||""));tb.append(tr)});t.append(tb);w.append(t);out.append(w)}
}
async function runPrev(l,s,f,base,low,high){
  if(!sample){dbMsg("L'analyse par IA demande un code d'accès B2A (onglet Photo IA).",true);return}
  busyPrev[l.id]=true;renderDetail();
  const rows=s.rows.slice(-21).map(r=>`${r.date}: œufs ${r.oeufs??"-"}, morts ${r.morts}, aliment ${r.aliment??"-"} kg`).join("\n");
  const start=new Date();const mois=[0,1,2].map(i=>new Date(start.getFullYear(),start.getMonth()+i+1,1).toLocaleDateString("fr-FR",{month:"long",year:"numeric"}));
  const p=`Tu es un conseiller technico-économique en élevage en Afrique de l'Ouest (Burkina Faso). Analyse ce lot et fais des prévisions financières réalistes en FCFA. Réponds en ${({fr:"français",en:"anglais (English)",it:"italien (italiano)",es:"espagnol (español)"})[window.B2A_LANG?window.B2A_LANG():"fr"]}, y compris pour les libellés et valeurs texte du JSON.

LOT : ${l.nom} — ${l.espece}, ${l.race||"race non précisée"}, arrivé le ${l.arrivee}, âge actuel ≈ ${s.ageW} semaines, fin de cycle prévue à ${base.end} semaines.
Effectif : ${s.alive} vivants sur ${l.effectif} (morts 7 j : ${s.morts7}).
${prodSummary(l,s)}
Aliment : ${s.gpj7!=null?fmt(s.gpj7)+" g/sujet/jour":"non saisi"} ; prix ${l.prixAliment||"?"} FCFA/kg.
Prix : produit (œuf ou litre) ${l.prixOeuf||"-"} FCFA, vente au kg vif ${l.prixKg||"-"} FCFA, achat ${l.prixSujet||"-"} FCFA/sujet, vente fin de cycle ${l.prixFin||"-"} FCFA/sujet, charges ${l.chargesMois||0} FCFA/mois, investissement ${l.investissement||0} FCFA (part comptée pour ce lot : ${fmt(f.inv.part)} FCFA, réparti sur ${fmt(f.inv.du)} ans).
À ce jour : dépenses ${fmt(f.depTot)} FCFA, recettes ${fmt(f.rec)} FCFA, solde ${fmt(f.solde)} FCFA.
Projection de l'app : début du bénéfice ${beText(base)} (prudent : ${beText(low)}, favorable : ${beText(high)}), résultat fin de cycle ${fmt(base.final)} FCFA.
Alertes : ${s.alerts.map(a=>a[1]).join(" ")||"aucune"}
21 derniers jours :
${rows||"aucune saisie"}

Réponds UNIQUEMENT avec ce JSON :
{"avis":"verdict en 1-2 phrases : rentable ou pas, quand","resume":"3-4 phrases d'analyse",
 "prevision_3_mois":[{"mois":"${mois[0]}","oeufs":nombre ou null,"recettes":nombre,"depenses":nombre,"resultat":nombre}, …pour ${mois.join(", ")}],
 "risques":[{"texte":"…","niveau":"eleve | moyen | faible"}],
 "leviers":[{"action":"action concrète","gain_estime":"ex. +45 000 F/mois"}]}
Donne 3 à 5 risques et 3 à 5 leviers adaptés (prix de l'aliment, fabrication d'aliment, saison chaude, Newcastle, vente directe, plateaux, réforme…).`;
  try{const r=await sample.json(p,{cache:false});if(!r||typeof r!=="object")throw{code:"invalid_json"};
    const doc={r,date:new Date().toISOString(),by:me};previsions[l.id]=doc;
    if(db&&canWrite){try{await db.doc("previsions/"+l.id).set(doc)}catch(e){}}
  }catch(e){const c=e&&e.code;dbMsg(c==="not_granted"?"Code d'accès refusé. Vérifiez votre code dans l'onglet Photo IA.":c==="rate_limited"?"Trop de demandes. Réessayez plus tard.":"L'analyse n'a pas abouti. Réessayez.",true)}
  finally{busyPrev[l.id]=false;renderDetail()}
}

let rt=0;
let detailOpen=false,detTab="resume",myFirst="";
function openLot(id){selLot=id;detailOpen=true;detTab="resume";show("tableau");renderLots();window.scrollTo(0,0)}
function closeLot(){detailOpen=false;renderLots();window.scrollTo(0,0)}
async function renderDetail(){
  const my=++rt;
  const l=lots.find(x=>x.id===selLot);const D=$("lotdetail");
  if(formOpen){$("home").hidden=true;D.hidden=true;return}
  $("home").hidden=!!(detailOpen&&l);
  if(!l||!detailOpen){D.hidden=true;return}
  if(isCrop(l)){D.hidden=false;D.innerHTML="";if(CC())CC().detail(D,l);return}
  const s=stats(l);await loadNames([...new Set(s.rows.slice(-30).map(r=>r.by).filter(Boolean))]);if(my!==rt)return;
  D.hidden=false;D.innerHTML="";
  const H=el("div","detail-head");const bk=el("button","back","‹ Mes lots");bk.type="button";bk.onclick=closeLot;H.append(bk);
  const h=el("div","row between");const t=el("div");t.style.minWidth="0";t.append(notr(el("h2","sec",l.nom||"Lot")));
  t.append(el("div","note",[l.espece,l.race,l.arrivee?"arrivé le "+new Date(l.arrivee+"T12:00").toLocaleDateString("fr-FR"):null,s.ageW?"âge ≈ "+s.ageW+" sem.":null].filter(Boolean).join(" · ")));
  h.append(t);
  {const bx=el("div","btnrow");const pb=el("button","btn small ghost","PDF");pb.type="button";pb.setAttribute("aria-label","Rapport PDF du lot");pb.onclick=()=>pdfRun(pb,()=>pdfLot(l));bx.append(pb);
   if(canWrite){const e=el("button","btn small ghost","Modifier");e.type="button";e.onclick=()=>openLotForm(l);bx.append(e)}h.append(bx);
   try{window.B2A.onDetail&&window.B2A.onDetail(bx,l,s)}catch(e){console.error(e)}}
  H.append(h);
  const st=el("div","subtabs");[["resume","Résumé"],["argent","Rentabilité"],["saisies","Saisies"]].forEach(([k,lb])=>{const b=el("button",null,lb);b.type="button";b.setAttribute("aria-pressed",detTab===k);b.onclick=()=>{detTab=k;renderDetail()};st.append(b)});
  H.append(st);D.append(H);

  if(detTab==="resume"){
    const AA=allAlerts(l,s);
    if(AA.length){const items=AA.map(a=>{const li=el("li","s-"+a[0]);li.append(el("span","dot"),el("span",null,a[1]));return li});D.append(alertList(items,2,!!D.dataset.all,()=>{D.dataset.all=D.dataset.all?"":"1";renderDetail()}))}
    else{const ul=el("ul","alerts");const li=el("li","s-ok");li.append(el("span","dot"),el("span",null,"Aucune anomalie sur les 7 derniers jours."));ul.append(li);D.append(ul)}
    const K=el("div","kpis");
    K.append(kpi("Effectif actuel",fmt(s.alive),`${fmt(s.mortsTot)} morts (${fmt(s.mortsTotPct,1)} %)`));
    if(isLayer(l)){
      const d=s.ponte7!=null&&s.pontePrev!=null?s.ponte7-s.pontePrev:null;
      K.append(kpi("Ponte moy. 7 j",s.ponte7!=null?fmt(s.ponte7,1)+" %":"—",d!=null?(d>=0?"+":"−")+fmt(Math.abs(d),1)+" pt vs sem. préc.":null,d==null?null:d>=0?"up":"down"));
      K.append(kpi("Œufs 7 j",fmt(s.oeufs7),fmt(s.oeufs7/30,1)+" plateaux"));
    }
    K.append(kpi("Aliment",s.gpj7!=null?fmt(s.gpj7)+" g":"—",s.gpj7!=null?`par sujet et par jour · ≈ ${fmt(s.gpj7*7/1000,2)} kg par semaine`:"par sujet et par jour (7 j)"));
    {const ra=ration(l,s);if(ra)K.append(kpi("Ration conseillée",fmt(ra.kg,1)+" kg / jour",`pour ${fmt(ra.n)} sujets · ${fmtG(ra.g)} par sujet`+(ra.ws?(ra.f>1?` · rattrapage +${fmt((ra.f-1)*100)} %`:ra.f<1?` · réduite ${fmt((1-ra.f)*100)} %`:" · selon le poids pesé"):" · selon l'âge (pesez pour l'ajuster)"),ra.ws&&ra.f>1?"down":null))}
    const fs=feedStock(l,s);if(fs)K.append(kpi("Stock d'aliment",fmt(Math.max(0,fs.stock))+" kg",fs.days<=0?"rupture : commander":`≈ ${fmt(fs.days)} jours · commander avant le ${fs.order.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}`,fs.days<=7?"down":null));
    if(s.coutOeuf!=null)K.append(kpi("Coût aliment / œuf",fmt(s.coutOeuf,1)+" F","moyenne 7 j"));
    if(s.marge7!=null)K.append(kpi("Marge sur aliment 7 j",fmt(s.marge7)+" F",s.marge7>=0?"ventes − aliment":"perte : à analyser",s.marge7>=0?"up":"down"));
    if(isDairy(l))K.append(kpi("Lait moy. 7 j",s.lait7!=null?fmt(s.lait7,2)+" L":"—",`par tête et par jour · standard ≈ ${fmt(sp(l).lait,1)} L`));
    if(s.poids!=null){const sw=stdWeight(l,s.ageW);K.append(kpi("Poids moyen",fmtW(l,s.poids),(sw?"standard ≈ "+fmtW(l,sw*1000):"dernière pesée")+(s.gmq!=null?" · +"+fmtW(l,s.gmq)+"/jour":""),sw?(s.poids/1000>=sw*0.95?"up":"down"):null))}
    D.append(K);
    {const ws=weightStatus(l,s),ra=ws&&ration(l,s);
     if(ws&&ra&&(ws.late||ws.ahead)){const g=el("div","suggest");
      if(ws.late){const def=(ws.sw-ws.kg)*1000,sg=stdGain(l,s.ageW);
        /* durée réaliste : 4 semaines (volailles) ou 8 semaines (gros animaux), sans dépasser 2 fois le gain normal */
        let wk=big(l)?8:4;if(sg)wk=Math.max(wk,Math.ceil(def/(sg*7)));const need=sg!=null?sg+def/(wk*7):null;
        g.append(el("span","label","Rattrapage de poids"),el("b",null,`${fmtW(l,ws.kg*1000)} pesés le ${fdate(ws.date)} : ${fmt((1-ws.ratio)*100)} % sous le standard (${fmtW(l,ws.sw*1000)})`));
        const ul=el("ul","plain");[
          `Ration : ${fmtG(ra.g)} par sujet et par jour (au lieu de ${fmtG(ra.base)}), soit ${fmt(ra.kg,1)} kg pour le lot.`,
          ws.physio!=null&&ws.physio<s.ageW-0.5?`Aliment : le lot a le poids d'un lot de ${fmt(ws.physio,0)} semaines ; garder l'aliment de cette étape jusqu'au poids standard.`:null,
          need!=null?`Objectif : rattraper ${fmtW(l,def)} en ${wk} semaines, soit un gain d'environ ${fmtG(need)} par jour (standard ≈ ${fmtG(sg)}).`:null,
          "Vérifier l'eau (toujours propre et à volonté), la place aux mangeoires et déparasiter si ce n'est pas fait.",
          "Peser 10 sujets chaque semaine : la ration se recalcule toute seule avec le nouveau poids."].filter(Boolean).forEach(t=>ul.append(el("li",null,t)));g.append(ul)}
      else{g.append(el("span","label","Poids au-dessus du standard"),el("b",null,`${fmtW(l,ws.kg*1000)} contre ${fmtW(l,ws.sw*1000)} attendu`));
        g.append(el("span","note",ra.f<1?`Ration réduite à ${fmtG(ra.g)} par sujet et par jour pour éviter l'engraissement.`:"Bonne croissance : continuer la ration normale."))}
      D.append(g)}}
    const key=isLayer(l)?"ponte":isDairy(l)?"lait":"poidsD";
    const unitC=key==="ponte"?"%":key==="lait"?"L":big(l)?"kg":"g";
    const refFn=key==="ponte"?stdPonte:key==="lait"?(()=>sp(l).lait):(sp(l).w?(a=>stdWeight(l,a)*(big(l)?1:1000)):null);
    const svg=chartSVG(s.rows,key,unitC,key==="ponte"?100:0,l,refFn);
    const lblC={ponte:"Taux de ponte (30 derniers jours)",lait:"Lait par tête et par jour (L)",poidsD:`Poids moyen (${unitC})`}[key];
    D.append(el("h3","sec",lblC));
    if(svg){const w=el("div");w.innerHTML=svg;D.append(w);const lg=el("div","legend");lg.innerHTML=(refFn?`<span><i></i>Vos chiffres</span><span><i class="d"></i>Standard de l'espèce</span>`:"")+'<span>Barres rouges : morts du jour</span>';D.append(lg)}
    else D.append(el("p","note","Le graphique apparaît après 2 saisies."));
    const r=formulaForLot(l,s);if(r){const g=el("div","suggest");g.append(el("span","label","Aliment conseillé maintenant"),el("b",null,r.titre),el("span","note",`Besoin ≈ ${fmt(r.daily,1)} kg par jour, soit ${fmt(r.week)} kg par semaine.`));
      const b=el("button","btn small ghost","Voir la formule");b.type="button";b.style.justifySelf="start";b.onclick=()=>{fMode="animal";fLot=l.id;show("formules");setTimeout(()=>{$("f-lot").value=l.id;fLot=l.id;$("f-sp").disabled=true;fromLot()},20)};g.append(b);D.append(g)}
    const la=analyses.filter(a=>a.lotId===l.id).slice(0,3);
    if(la.length){D.append(el("h3","sec","Diagnostics photo du lot"));const Hh=el("div","hist");la.forEach(a=>Hh.append(histBtn(a)));D.append(Hh)}
  }
  if(detTab==="argent")renderFinance(D,l,s);
  if(detTab==="saisies"){
    if(canWrite){const b=el("button","btn","+ Saisie du jour");b.type="button";b.style.justifySelf="start";b.onclick=()=>{show("saisie");$("s-lot").value=l.id;$("s-date").value=today();loadSaisie()};D.append(b)}
    if(!s.rows.length)D.append(el("p","note","Aucune saisie pour ce lot."));
    else{const recent=s.rows.slice(-30).reverse();const prodH=hasProd(l)?(isDairy(l)?"Lait":"Œufs"):"Poids";
      const w=el("div","tablewrap");const tb=el("table","data");
      const hd=el("tr");[["Date"],[prodH,"n"],...(isLayer(l)?[["Ponte","n"]]:[]),["Morts","n"],["Aliment","n"],["Par",""],["Remarque",""]].forEach(([x,c])=>hd.append(el("th",c||null,x)));
      const th=el("thead");th.append(hd);tb.append(th);const body=el("tbody");
      recent.forEach(r=>{const tr=el("tr");tr.append(el("td",null,fdate(r.date)),el("td","n",hasProd(l)?fmt(r.oeufs,isDairy(l)?1:0):fmtW(l,r.poids)));if(isLayer(l))tr.append(el("td","n",r.ponte!=null?fmt(r.ponte,1)+" %":"—"));
        tr.append(el("td","n",fmt(r.morts)),el("td","n",r.aliment!=null?fmt(r.aliment,1)+" kg":"—"),el("td",null,(names[r.by]||"—")),el("td",null,r.note||""));
        if(canWrite){tr.style.cursor="pointer";tr.onclick=()=>{show("saisie");$("s-lot").value=l.id;$("s-date").value=r.date;loadSaisie()}}body.append(tr)});
      tb.append(body);w.append(tb);D.append(w);
      if(canWrite)D.append(el("p","note","Erreur dans une fiche (morts, œufs, aliment…) ? Touchez la ligne pour la corriger ou la supprimer."))}
  }
}

async function loadNames(ids){const miss=ids.filter(i=>!(i in names));if(!miss.length||!user)return;
  try{const ps=await user.profiles(miss);miss.forEach(i=>{names[i]=(ps[i]&&ps[i].name)||"Quelqu'un";if(me&&i===me)names[i]+=" (vous)"})}catch(e){}}

/* ---------- lot form ---------- */
let formOpen=false,lStep=0;
function openLotForm(l){if(l&&isCrop(l)&&CC()){CC().form(l);return}editLot=l||null;formOpen=true;lStep=0;$("lotform-card").hidden=false;$("home").hidden=true;$("lotdetail").hidden=true;$("lotform-title").textContent=l?"Modifier le lot":"Nouveau lot";
  $("l-nom").value=l?l.nom||"":"";$("l-espece").value=l?l.espece||"Poules pondeuses":"Poules pondeuses";$("l-race").value=l?l.race||"":"";
  $("l-effectif").value=l?l.effectif??"":"";$("l-arrivee").value=l?l.arrivee||"":today();$("l-age").value=l?l.ageArrivee??0:0;
  $("l-paliment").value=l?l.prixAliment??"":"";$("l-pkg").value=l?l.prixKg??"":"";$("l-pvente").value=l?l.prixOeuf??"":"";$("l-close").hidden=!l;$("l-msg").textContent="";if(l&&l.espece&&![...$("l-espece").options].some(o=>o.value===l.espece)){const o=el("option",null,l.espece);$("l-espece").append(o);$("l-espece").value=l.espece}
  const lay=!l||isLayer(l);$("l-psujet").value=l?l.prixSujet??"":"";$("l-invest").value=l?l.investissement??"":"";$("l-dureeinv").value=l?l.dureeInvest??"":"";$("l-charges").value=l?l.chargesMois??"":"";
  $("l-agefin").value=l?l.ageFin??"":"";$("l-pfin").value=l?l.prixFin??"":"";
  $("l-palt").value=l?l.prixAlimentAlt??"":"";$("l-mortprev").value=l?l.mortPrev??"":"";$("l-aavant").value=l?l.alimentAvant??"":"";$("l-mavant").value=l?l.mortsAvant??"":"";$("l-oavant").value=l?l.oeufsAvant??"":"";$("l-stock").value=l?l.stockAliment??"":"";
  syncSpeciesForm();renderStep();window.scrollTo(0,0)}
function closeForm(){formOpen=false;$("lotform-card").hidden=true;renderLots();window.scrollTo(0,0)}
function stepOk(){if(lStep===0&&(!$("l-nom").value.trim()||!N($("l-effectif").value))){$("l-msg").textContent="Indiquez au moins le nom du lot et le nombre d'animaux.";$("l-msg").className="msg err";$("l-nom").focus();return false}$("l-msg").textContent="";return true}
function renderStep(){document.querySelectorAll("#lotform-card .wiz-step").forEach(x=>x.hidden=Number(x.dataset.step)!==lStep);
  document.querySelectorAll("#l-steps li").forEach(li=>{const i=Number(li.dataset.i);li.className=i===lStep?"on":i<lStep?"done":""});
  $("l-prev").style.visibility=lStep===0?"hidden":"visible";const last=lStep===3;
  $("l-next").hidden=last;$("l-save").hidden=!last&&!editLot;$("l-save").textContent=editLot?"Enregistrer":"Enregistrer le lot";
  $("l-save").style.gridColumn=(!last&&editLot)?"1 / -1":"";
  $("l-close").hidden=!editLot||!canWrite}
$("l-next").onclick=()=>{if(!stepOk())return;lStep=Math.min(3,lStep+1);renderStep();window.scrollTo(0,0)};
$("l-prev").onclick=()=>{lStep=Math.max(0,lStep-1);renderStep();window.scrollTo(0,0)};
document.querySelectorAll("#l-steps li").forEach(li=>li.onclick=()=>{const i=Number(li.dataset.i);if(i>lStep&&!stepOk())return;lStep=i;renderStep()});
$("btn-newlot").onclick=()=>CC()?CC().choose():openLotForm(null);
function syncSpeciesForm(){const fake={espece:$("l-espece").value,ageArrivee:N($("l-age").value)||0};
  $("l-agefin").placeholder=defaultEnd(fake)+" par défaut";
  $("l-pvente").closest(".field").hidden=!hasProd(fake);$("l-pvente-lbl").textContent=isDairy(fake)?"Prix de vente d'un litre de lait (FCFA)":"Prix de vente d'un œuf (FCFA)";
  $("l-oavant").previousElementSibling.textContent=isDairy(fake)?"Lait déjà vendu (litres)":"Œufs déjà ramassés";$("l-oavant").closest(".field").hidden=!hasProd(fake);}
$("l-espece").onchange=syncSpeciesForm;$("l-age").addEventListener("input",syncSpeciesForm);
$("l-cancel").onclick=closeForm;
$("l-save").onclick=async()=>{
  if(!db)return;const eff=N($("l-effectif").value);
  if(/pondeuse/i.test($("l-espece").value)&&N($("l-agefin").value)!=null&&N($("l-agefin").value)<40){$("l-msg").textContent="Pour des pondeuses, la fin du cycle est vers 72 à 80 semaines (7 correspond aux poulets de chair).";$("l-msg").className="msg err";return}
  if(!$("l-nom").value.trim()||!eff){lStep=0;renderStep();$("l-msg").textContent="Indiquez au moins le nom et l'effectif.";$("l-msg").className="msg err";return}
  const body={nom:$("l-nom").value.trim(),espece:$("l-espece").value,race:$("l-race").value.trim(),effectif:eff,arrivee:$("l-arrivee").value||today(),
    ageArrivee:N($("l-age").value)||0,prixAliment:N($("l-paliment").value),prixOeuf:N($("l-pvente").value),prixKg:N($("l-pkg").value),actif:true,
    prixSujet:N($("l-psujet").value),investissement:N($("l-invest").value),dureeInvest:N($("l-dureeinv").value),chargesMois:N($("l-charges").value),ageFin:N($("l-agefin").value),prixFin:N($("l-pfin").value),
    prixAlimentAlt:N($("l-palt").value),mortPrev:N($("l-mortprev").value),alimentAvant:N($("l-aavant").value),mortsAvant:N($("l-mavant").value),oeufsAvant:N($("l-oavant").value),stockAliment:N($("l-stock").value),
    createdAt:editLot?editLot.createdAt||Date.now():Date.now()};
  $("l-save").disabled=true;
  try{const ref=editLot?db.doc("lots/"+editLot.id):db.collection("lots").doc();await ref.set(body);selLot=ref.id;closeForm()}
  catch(e){$("l-msg").textContent=errText(e);$("l-msg").className="msg err"}finally{$("l-save").disabled=false}};
$("l-close").onclick=async()=>{if(!editLot)return;
  if($("l-close").dataset.confirm!=="1"){$("l-close").dataset.confirm="1";$("l-close").textContent="Confirmer la clôture";return}
  $("l-close").dataset.confirm="";$("l-close").textContent="Clôturer le lot";
  try{await db.doc("lots/"+editLot.id).update({actif:false});selLot=null;detailOpen=false;closeForm()}catch(e){$("l-msg").textContent=errText(e)}};
function errText(e){const c=e&&e.code;return c==="invalid_argument"?"Vous n'avez pas le droit de modifier ces données (accès en lecture seule).":c==="quota_exceeded"?"Stockage plein : supprimez d'anciennes données.":"Échec de l'enregistrement. Réessayez."}

/* ---------- saisie ---------- */
function fillLotSelects(){
  const all=lots.filter(l=>l.actif!==false),act=all.filter(l=>!isCrop(l));
  const s=$("s-lot"),keep=s.value;s.innerHTML="";act.forEach(l=>{const o=notr(el("option",null,l.nom));o.value=l.id;s.append(o)});
  if(act.find(l=>l.id===keep))s.value=keep;else if(selLot)s.value=selLot;
  const c=$("ctx-lot"),k2=c.value;c.innerHTML="";const o0=el("option",null,"Aucun");o0.value="";c.append(o0);all.forEach(l=>{const o=notr(el("option",null,l.nom));o.value=l.id;c.append(o)});c.value=k2||"";
  $("s-save").disabled=!act.length||!canWrite||!db;
  if(!act.length&&db)sMsg(all.length?"La saisie du jour concerne les lots d'animaux. Pour une culture, notez les travaux dans la fiche du lot.":"Créez d'abord un lot dans le tableau de bord.");
}
function sMsg(t,cls){$("s-msg").textContent=t||"";$("s-msg").className="msg"+(cls?" "+cls:"")}
function loadSaisie(){const id=$("s-lot").value,d=$("s-date").value;const s=saisies.find(x=>x.lotId===id&&x.date===d);
  $("s-oeufs").value=s?s.oeufs??"":"";$("s-morts").value=s?s.morts??0:0;$("s-aliment").value=s?s.alimentKg??"":"";const lS=lots.find(x=>x.id===$("s-lot").value);const bigS=lS&&big(lS);$("s-poids").value=s&&s.poidsG!=null?(bigS?s.poidsG/1000:s.poidsG):"";
  $("s-poids").previousElementSibling.textContent=bigS?"Poids moyen (kg)":"Poids moyen (g)";$("s-poids").step=bigS?"0.1":"1";$("s-recu").value=s?s.alimentRecu??"":"";$("s-note").value=s?s.note||"":"";
  {const lR=lots.find(x=>x.id===id),h=$("s-ration");if(h){const ra=lR?ration(lR,stats(lR),d):null;h.textContent=ra?`Conseillé : ≈ ${fmt(ra.kg,1)} kg pour ${fmt(ra.n)} sujets (${fmt(ra.g)} g par sujet), selon l'âge.`:"";h.hidden=!ra;h.onclick=ra?()=>{if(!$("s-aliment").value)$("s-aliment").value=Math.round(ra.kg*10)/10}:null}}
  const l=lots.find(x=>x.id===id);$("s-oeufs").closest(".field").hidden=l?!hasProd(l):false;$("s-oeufs").previousElementSibling.textContent=l&&isDairy(l)?"Lait trait (litres)":"Œufs ramassés";$("s-oeufs").step=l&&isDairy(l)?"0.5":"1";
  sMsg(s?"Fiche existante chargée : corrigez les chiffres (morts, œufs, aliment…) puis touchez Enregistrer.":"");
  const del=$("s-del");if(del){del.hidden=!s||!canWrite;del.dataset.c="";del.textContent="Supprimer cette fiche"}}
$("s-date").value=today();$("s-lot").onchange=loadSaisie;$("s-date").onchange=loadSaisie;
$("s-save").onclick=async()=>{
  const id=$("s-lot").value,d=$("s-date").value;if(!db||!id||!d)return;
  if(d>today()){sMsg("La date ne peut pas être dans le futur.","err");return}
  const body={lotId:id,date:d,oeufs:N($("s-oeufs").value),morts:N($("s-morts").value)||0,alimentKg:N($("s-aliment").value),alimentRecu:N($("s-recu").value),poidsG:(()=>{const v=N($("s-poids").value);const lS=lots.find(x=>x.id===id);return v==null?null:(lS&&big(lS)?v*1000:v)})(),note:$("s-note").value.trim(),by:me,updatedAt:Date.now()};
  $("s-save").disabled=true;sMsg("Enregistrement…");
  try{const r=await db.doc("saisies/"+id+"_"+d).set(body);sMsg(r==="local"?"Enregistré sur ce téléphone : envoi automatique au retour du réseau.":"Enregistré. Vous pouvez encore corriger cette fiche à tout moment.","good");$("s-del").hidden=!canWrite}
  catch(e){sMsg(errText(e),"err")}finally{$("s-save").disabled=false}};
$("s-del").onclick=async()=>{const id=$("s-lot").value,d=$("s-date").value,b=$("s-del");if(!db||!id||!d)return;
  if(b.dataset.c!=="1"){b.dataset.c="1";b.textContent="Confirmer la suppression";return}
  b.disabled=true;try{await db.doc("saisies/"+id+"_"+d).delete();saisies=saisies.filter(x=>!(x.lotId===id&&x.date===d));loadSaisie();renderLots();sMsg("Fiche supprimée.","good")}catch(e){sMsg(errText(e),"err")}finally{b.disabled=false}};

/* ---------- db boot ---------- */
(async()=>{
  try{user=await claude.use("user");if(user){me=await user.id();try{const pr=await user.me();myFirst=(pr&&pr.name||"").split(" ")[0]}catch(e){}const cw=await user.can("data.write");if(cw===false)canWrite=false}}catch(e){}
  try{db=await claude.use("db")}catch(e){db=null}
  if(!db){dbMsg("Le carnet partagé n'est pas disponible ici. Le diagnostic photo reste utilisable.",true);$("btn-newlot").hidden=true;renderLots();loadLocalHist();return}
  if(!canWrite){dbMsg("Accès en lecture seule : vous voyez les chiffres mais ne pouvez pas saisir.");$("btn-newlot").hidden=true}
  const fail=e=>{if(e&&e.code==="revoked")dbMsg("L'accès aux données a été retiré.",true);else dbMsg("Connexion aux données interrompue. Rechargez la page.",true)};
  db.collection("lots").onSnapshot(s=>{lots=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));renderLots()},fail);
  db.collection("saisies").orderBy("date","desc").limit(1000).onSnapshot(s=>{saisies=s.docs.map(d=>({id:d.id,...d.data()}));renderLots();if(!$("v-saisie").hidden&&!document.activeElement.closest("#v-saisie"))loadSaisie()},fail);
  db.collection("analyses").orderBy("date","desc").limit(40).onSnapshot(s=>{analyses=s.docs.map(d=>({id:d.id,...d.data()}));renderHist();renderDetail()},fail);
  db.doc("reglages/prix").onSnapshot(d=>{const v=d.exists?d.data():{};prixIng=Object.assign({},v.ing||{});prixEng=Object.assign({},v.eng||{});if(!$("v-formules").hidden&&!document.activeElement.closest("#v-formules"))renderFormules()},fail);
  db.collection("factures").orderBy("createdAt","desc").limit(1000).onSnapshot(s=>{factures=s.docs.map(d=>({id:d.id,...d.data()}));dispatchEvent(new CustomEvent("b2a-factures"));if(!$("v-ventes").hidden&&$("v-form").hidden)renderVentes()},fail);
  db.doc("reglages/entreprise").onSnapshot(d=>{entreprise=d.exists?d.data():{};if(!$("v-ventes").hidden&&$("v-form").hidden)renderVentes()},fail);
  db.collection("formules").onSnapshot(s=>{mesFormules=s.docs.map(d=>({id:d.id,...d.data()}));if(!$("v-formules").hidden&&!document.activeElement.closest("#v-formules"))renderFormules()},fail);
  db.collection("soins").onSnapshot(s=>{soins={};s.docs.forEach(d=>soins[d.id]={id:d.id,...d.data()});renderLots()},fail);
  db.collection("previsions").onSnapshot(s=>{previsions={};s.docs.forEach(d=>previsions[d.id]=d.data());renderDetail()},fail);
  renderLots();loadSaisie();
})();
/* accès pour les modules complémentaires (plus.js) */
window.B2A.app={isCrop,kpi,alertList,calItem,errText,loadNames,names,openLotForm,closeLot,renderLots,renderDetail,notr,
  saisies:()=>saisies,soins:()=>soins,allLots:()=>lots,CULT,ENG,pEng,setForm:v=>{formOpen=v},setSel:(id,open)=>{selLot=id;detailOpen=!!open},setCalLot:id=>{calLot=id},
  db:()=>db,me:()=>me,can:()=>canWrite,lots:()=>lots.filter(l=>l.actif!==false),stats,allAlerts,programme,isLayer,isDairy,fmt,fdate,today,show,openLot,factures:()=>factures,facTotals,spName:l=>sp(l).sale};

/* ---------- diagnostic ---------- */
const OBJ={animal:["Non précisé","Ponte","Chair / engraissement","Lait","Reproduction / élevage","Traction"],
           plante:["Non précisé","Récolte / rendement","Semences","Fourrage","Plantation pérenne (anacarde, manguier…)"]};
let kind="animal",files=[],sample=null,ctl=null,localHist=[];
const HKEY="agrodiag-history-v1";
function loadLocalHist(){try{localHist=JSON.parse(localStorage.getItem(HKEY)||"[]")}catch(e){localHist=[]}renderHist()}
function setKind(k){kind=k;$("t-animal").setAttribute("aria-pressed",k==="animal");$("t-plante").setAttribute("aria-pressed",k==="plante");
  $("ctx-obj").innerHTML="";OBJ[k].forEach(o=>$("ctx-obj").append(el("option",null,o)))}
$("t-animal").onclick=()=>setKind("animal");$("t-plante").onclick=()=>setKind("plante");setKind("animal");
function renderThumbs(){const t=$("thumbs");t.innerHTML="";files.forEach((f,i)=>{const d=el("div");const im=el("img");im.src=URL.createObjectURL(f);im.alt="Photo "+(i+1);
  const b=el("button",null,"×");b.type="button";b.setAttribute("aria-label","Retirer la photo "+(i+1));b.onclick=()=>{files.splice(i,1);renderThumbs()};d.append(im,b);t.append(d)});updateBtn()}
const onPick=e=>{for(const f of e.target.files){if(files.length<3&&f.type.startsWith("image/"))files.push(f)}e.target.value="";renderThumbs()};
$("file").onchange=onPick;$("file-cam").onchange=onPick;
function setMsg(t,err){$("msg").textContent=t;$("msg").className="msg"+(err?" err":"")}
function updateBtn(){$("analyse").disabled=!(sample&&files.length&&!ctl);
  if(!ctl){if(!sample)setMsg("Connexion au service IA…");else if(!files.length)setMsg("Ajoutez au moins une photo.");else setMsg(files.length+" photo(s) prête(s).")}}
(async()=>{try{const s=await claude.use("sample");if(!s){setMsg("Pour l'analyse photo par IA, activez votre code d'accès B2A ci-dessus.",true);return}
  const lim=await s.limits().catch(()=>null);if(!lim||!lim.images){setMsg("L'envoi de photos n'est pas disponible ici.",true);return}
  sample=s;updateBtn()}catch(e){setMsg("L'analyse n'est pas disponible ici.",true)}})();

function lotContext(id){const l=lots.find(x=>x.id===id);if(!l)return "";if(isCrop(l))return CC()?CC().context(l):"";const s=stats(l);
  return `\nDONNÉES DU LOT « ${l.nom} » : ${l.espece}, ${l.race||"race non précisée"}, âge ≈ ${s.ageW} semaines, effectif ${s.alive} (départ ${l.effectif}), mortalité 7 j : ${s.morts7}, cumulée ${fmt(s.mortsTotPct,1)} %` +
    ", "+prodSummary(l,s)+`, aliment ${fmt(s.gpj7)} g/sujet/jour. Alertes : ${s.alerts.map(a=>a[1]).join(" ")||"aucune"}.\n`}
function prompt(){
  return `Tu es un expert en zootechnie, médecine vétérinaire de terrain et agronomie tropicale (Afrique de l'Ouest et Europe).
Analyse la ou les photos jointes et le contexte. Sois concret et pratique pour un éleveur/agriculteur. Si la photo ne permet pas de conclure, dis-le et baisse la confiance. N'invente pas de signes que tu ne vois pas. Réponds en ${({fr:"français",en:"anglais (English)",it:"italien (italiano)",es:"espagnol (español)"})[window.B2A_LANG?window.B2A_LANG():"fr"]}, y compris pour les libellés et valeurs texte du JSON.

CONTEXTE
Type: ${kind==="animal"?"ANIMAL d'élevage":"PLANTE / culture"}
Pays/région: ${$("ctx-pays").value||"non précisé"}
Objectif: ${$("ctx-obj").value}
Âge connu: ${$("ctx-age").value||"inconnu"}
Observations: ${$("ctx-obs").value||"aucune"}${lotContext($("ctx-lot").value)}
Réponds UNIQUEMENT avec un objet JSON de cette forme :
{"nom":"nom commun","nom_scientifique":"…","race_ou_variete":"…","confiance":0-100,"alternatives":["…"],
 "details":[{"label":"Âge estimé","value":"…"},{"label":"Sexe","value":"…"},{"label":"Poids / stade estimé","value":"…"},{"label":"État corporel","value":"…"}],
 "potentiel":{"score":0-100,"niveau":"Forte croissance | Croissance moyenne | Croissance faible","resume":"1-2 phrases","indicateurs":[{"label":"ex. GMQ attendu / ponte annuelle / rendement","value":"…"}]},
 "sante":{"etat":"bon | a_surveiller | alerte","score":0-100,"resume":"1-2 phrases","signes":[{"texte":"…","gravite":"ok | moyen | grave"}],"causes_possibles":["…"]},
 "priorite":"action la plus urgente, une phrase",
 "suivi":[{"categorie":"Alimentation | Eau | Vaccination | Déparasitage | Logement | Hygiène | Arrosage | Fertilisation | Traitement | Surveillance | Rentabilité","action":"action précise avec quantités","frequence":"…"}],
 "limites":"ce que la photo ne permet pas de savoir"}
Pour une plante, adapte details (stade, partie observée) et potentiel (vigueur, rendement). Si des données de lot sont fournies, utilise-les dans ton diagnostic. Donne 5 à 8 lignes de suivi.`}

$("analyse").onclick=async()=>{
  if(!sample||!files.length)return;
  ctl=new AbortController();$("analyse").disabled=true;$("stop").hidden=false;$("spin").hidden=false;setMsg("Analyse en cours… (30 à 90 secondes)");
  const snap=files.slice(),k=kind,lotId=$("ctx-lot").value||null;
  try{const r=await sample.json(prompt(),{images:snap,signal:ctl.signal,cache:false});
    if(!r||typeof r!=="object"||!r.nom)throw{code:"invalid_json"};
    const thumb=await makeThumb(snap[0]);const entry={r,k,thumb,lotId,date:new Date().toISOString(),by:me};
    renderReport(entry,false);
    if(db&&canWrite){try{await db.collection("analyses").doc().set(entry);setMsg("Analyse terminée et enregistrée.")}catch(e){setMsg("Analyse terminée, mais non enregistrée.",true)}}
    else{localHist.unshift(entry);localHist=localHist.slice(0,12);try{localStorage.setItem(HKEY,JSON.stringify(localHist))}catch(e){}renderHist();setMsg("Analyse terminée.")}
    $("report").scrollIntoView({behavior:"smooth",block:"start"});
  }catch(e){const c=e&&e.code;
    const m={cancelled:"Analyse arrêtée.",not_granted:"Code d'accès refusé. Vérifiez votre code dans l'onglet Photo IA.",rate_limited:"Trop de demandes. Réessayez dans quelques minutes.",
      image_rejected:"Photo refusée : essayez une autre image (JPEG ou PNG).",refused:"L'IA n'a pas pu analyser cette photo. Essayez une autre image.",
      invalid_json:"Réponse incomplète. Appuyez à nouveau sur Analyser.",session_expired:"Vérifiez votre code d'accès."};
    setMsg(m[c]||"Erreur de connexion. Appuyez à nouveau sur Analyser.",c!=="cancelled");if(c==="not_granted"||c==="sampling_disabled")sample=null;
  }finally{ctl=null;$("stop").hidden=true;$("spin").hidden=true;$("analyse").disabled=!(sample&&files.length)}};
$("stop").onclick=()=>ctl&&ctl.abort();

function makeThumb(f){return new Promise(res=>{const im=new Image();im.onload=()=>{const c=document.createElement("canvas"),s=160,r=Math.max(s/im.width,s/im.height);
  c.width=s;c.height=s;const w=im.width*r,h=im.height*r;c.getContext("2d").drawImage(im,(s-w)/2,(s-h)/2,w,h);try{res(c.toDataURL("image/jpeg",.7))}catch(e){res("")}};im.onerror=()=>res("");im.src=URL.createObjectURL(f)})}

function tone(s){return s>=70?"ok":s>=45?"warn":"bad"}
const SANTE={bon:["Bonne santé","ok"],a_surveiller:["À surveiller","warn"],alerte:["Alerte","bad"]};
function renderReport(entry,isExample){
  const {r,k,thumb}=entry;const R=$("report");R.innerHTML="";
  const head=el("div","report-head");if(thumb){const im=el("img");im.src=thumb;im.alt="";head.append(im)}
  const id=el("div","id");const lot=lots.find(l=>l.id===entry.lotId);
  id.append(el("span","tag",isExample?"Exemple de rapport":(k==="animal"?"Animal":"Plante")+(lot?" · "+lot.nom:"")));
  id.append(el("h2",null,r.race_ou_variete||r.nom));
  const sub=el("div");sub.append(document.createTextNode((r.nom||"")+" · "));sub.append(el("span","sci",r.nom_scientifique||""));id.append(sub);
  id.append(el("div","conf","Confiance identification : "+num(r.confiance)+" %"));
  if(Array.isArray(r.alternatives)&&r.alternatives.length)id.append(el("div","alts","Autres possibilités : "+r.alternatives.join(", ")));
  head.append(id);R.append(head);
  if(Array.isArray(r.details)&&r.details.length){const dl=el("dl","facts");r.details.forEach(d=>{const w=el("div");w.append(el("dt",null,d.label),el("dd",null,d.value));dl.append(w)});R.append(dl)}
  if(r.priorite){const p=el("div","priority");p.append(el("strong",null,"À faire maintenant"),document.createTextNode(r.priorite));R.append(p)}
  const meters=el("div","meters");
  const P=r.potentiel||{},ps=num(P.score),pt=tone(ps);
  const m1=el("div","meter");const h1=el("h3");h1.append(el("span",null,"Potentiel de croissance"),el("span","score",ps));m1.append(h1);
  const b1=el("div","bar"),i1=el("i");i1.style.width=ps+"%";i1.style.background=`var(--${pt})`;b1.append(i1);m1.append(b1);
  m1.append(el("span","pill s-"+pt,P.niveau||"—"));if(P.resume)m1.append(el("p",null,P.resume));
  if(Array.isArray(P.indicateurs)&&P.indicateurs.length){const ul=el("ul");P.indicateurs.forEach(x=>{const li=el("li");li.append(el("b",null,x.label+" : "),document.createTextNode(x.value));ul.append(li)});m1.append(ul)}
  meters.append(m1);
  const S=r.sante||{},ss=num(S.score),st=SANTE[S.etat]||["—",tone(ss)];
  const m2=el("div","meter");const h2=el("h3");h2.append(el("span",null,"Santé"),el("span","score",ss));m2.append(h2);
  const b2=el("div","bar"),i2=el("i");i2.style.width=ss+"%";i2.style.background=`var(--${st[1]})`;b2.append(i2);m2.append(b2);
  m2.append(el("span","pill s-"+st[1],st[0]));if(S.resume)m2.append(el("p",null,S.resume));meters.append(m2);R.append(meters);
  if(Array.isArray(S.signes)&&S.signes.length){R.append(el("h3","sec","Signes observés"));const ul=el("ul","signs");
    S.signes.forEach(s=>{const li=el("li"),d=el("span","dot");d.style.background=`var(--${s.gravite==="grave"?"bad":s.gravite==="moyen"?"warn":"ok"})`;li.append(d,el("span",null,s.texte));ul.append(li)});R.append(ul)}
  if(Array.isArray(S.causes_possibles)&&S.causes_possibles.length){const p=el("p");p.style.margin="0";p.append(el("b",null,"Causes possibles : "),document.createTextNode(S.causes_possibles.join(" · ")));R.append(p)}
  if(Array.isArray(r.suivi)&&r.suivi.length){R.append(el("h3","sec","Plan de suivi"));const w=el("div","tablewrap"),t=el("table","data plan");
    const th=el("tr");["Domaine","Action","Quand"].forEach(x=>th.append(el("th",null,x)));const thead=el("thead");thead.append(th);t.append(thead);
    const tb=el("tbody");r.suivi.forEach(s=>{const tr=el("tr");tr.append(el("td",null,s.categorie),el("td",null,s.action),el("td",null,s.frequence));tb.append(tr)});t.append(tb);w.append(t);R.append(w)}
  if(r.limites)R.append(el("p","note","Limites : "+r.limites));
  if(!isExample){lastReport=entry;const pb=el("button","btn ghost","Télécharger le diagnostic en PDF");pb.type="button";pb.onclick=()=>pdfRun(pb,()=>pdfDiag(entry));R.append(pb)}
}
function histBtn(h){const b=el("button");b.type="button";if(h.thumb){const im=el("img");im.src=h.thumb;im.alt="";b.append(im)}
  const t=el("span","t");const lot=lots.find(l=>l.id===h.lotId);
  t.append(el("b",null,(h.r&&(h.r.race_ou_variete||h.r.nom))||"Analyse"),el("small",null,new Date(h.date).toLocaleString("fr-FR",{dateStyle:"medium",timeStyle:"short"})+(lot?" · "+lot.nom:"")+" · Santé "+num(h.r&&h.r.sante&&h.r.sante.score)));
  b.append(t);b.onclick=()=>{show("diagnostic");renderReport(h,false);$("report").scrollIntoView({behavior:"smooth"})};return b}
function renderHist(){const list=db?analyses:localHist;const H=$("hist");H.innerHTML="";$("histcard").hidden=!list.length;list.forEach(h=>H.append(histBtn(h)))}

const EXAMPLE={k:"animal",thumb:"",r:{
  nom:"Poule pondeuse",nom_scientifique:"Gallus gallus domesticus",race_ou_variete:"ISA Brown",confiance:82,alternatives:["Lohmann Brown","Hy-Line Brown"],
  details:[{label:"Âge estimé",value:"28–32 semaines"},{label:"Sexe",value:"Femelle"},{label:"Poids estimé",value:"1,9 kg"},{label:"État corporel",value:"Bon, plumage complet"}],
  potentiel:{score:84,niveau:"Forte croissance",resume:"Souche hybride très productive, en plein pic de ponte. Le potentiel dépend surtout de l'alimentation et de la chaleur.",
    indicateurs:[{label:"Ponte attendue",value:"300–320 œufs / an"},{label:"Pic de ponte",value:"92–95 % vers 26–30 sem."},{label:"Consommation",value:"110–120 g d'aliment / jour"}]},
  sante:{etat:"a_surveiller",score:68,resume:"Animal vif et crête rouge, mais quelques plumes abîmées sur le dos et une légère pâleur à surveiller.",
    signes:[{texte:"Crête rouge et bien droite",gravite:"ok"},{texte:"Plumes cassées sur le dos (picage possible)",gravite:"moyen"},{texte:"Légère pâleur des barbillons",gravite:"moyen"}],
    causes_possibles:["Picage lié à la densité ou au manque de protéines","Parasites externes (poux rouges)","Début d'anémie"]},
  priorite:"Inspecter les perchoirs la nuit pour les poux rouges et vérifier la densité (max. 5 poules/m² au sol).",
  suivi:[{categorie:"Alimentation",action:"Aliment ponte 16–17 % protéines, 3,5–4 % calcium, coquilles en libre-service",frequence:"Quotidien"},
    {categorie:"Eau",action:"Eau fraîche à volonté ; vitamines + électrolytes par forte chaleur",frequence:"Quotidien"},
    {categorie:"Vaccination",action:"Rappel Newcastle (La Sota) dans l'eau de boisson",frequence:"Toutes les 8–12 semaines"},
    {categorie:"Déparasitage",action:"Vermifuge et traitement des poux sur litière et perchoirs",frequence:"Tous les 2–3 mois"},
    {categorie:"Surveillance",action:"Saisir ponte et mortalité chaque jour dans le carnet",frequence:"Quotidien"}],
  limites:"La photo ne montre pas les fientes, l'intérieur du bec ni les pattes de près."}};
renderReport(EXAMPLE,true);renderLots();
})();
