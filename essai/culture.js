/* B2A Smart Farming : lots de cultures et de plantations
   (champ, parcelle, plantation d'arbres) : fiche du lot, calendrier cultural, travaux, récoltes, rentabilité.
   B2A-HIGH-TECHNOLOGY-AUTOMATION · Bayere Abdoul Aziz */
(function(){
const B=window.B2A;if(!B||!B.app)return;const A=B.app;
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const notr=e=>{e.setAttribute("data-notr","");return e};
const N=v=>{if(v===""||v==null)return null;const n=Number(String(v).replace(",",".").replace(/\s/g,""));return isFinite(n)?n:null};
const pad=n=>String(n).padStart(2,"0");
const iso=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const today=()=>iso(new Date());
const dAdd=(s,n)=>{const d=new Date(s+"T12:00");d.setDate(d.getDate()+Math.round(n));return iso(d)};
const days=(a,b)=>Math.round((new Date(b+"T12:00")-new Date(a+"T12:00"))/864e5);
const fmt=(v,d=0)=>v==null||!isFinite(v)?"—":v.toLocaleString("fr-FR",{maximumFractionDigits:d,minimumFractionDigits:d});
const fdl=s=>s?new Date(s+"T12:00").toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}):"—";
const fds=s=>s?new Date(s+"T12:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short"}):"—";
const MOIS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];

/* ---------- 1. catalogue des cultures (valeurs indicatives Burkina Faso, à adapter) ----------
   g : groupe · cyc : jours du semis (ou repiquage) à la récolte · rdt : kg/ha · prix : F/kg · sem : semences kg/ha
   fert : [jour par rapport au semis, engrais, dose kg/ha] · arbres : rdtA kg/arbre adulte, dens arbres/ha, age [années, part de la pleine production], rec mois de récolte */
const CROPS={
 mais:{n:"Maïs",g:"cereale",cyc:100,rdt:2500,prix:200,sem:25,fert:[[-7,"compost",5000],[0,"npk14",200],[18,"uree",75],[42,"uree",75]],eca:"80 × 40 cm, 2 grains par poquet"},
 sorgho:{n:"Sorgho",g:"cereale",cyc:115,rdt:1100,prix:225,sem:8,fert:[[-7,"compost",3000],[0,"npk14",100],[40,"uree",50]],eca:"80 × 40 cm"},
 mil:{n:"Mil",g:"cereale",cyc:95,rdt:900,prix:250,sem:6,fert:[[-7,"compost",3000],[0,"npk14",100],[40,"uree",50]],eca:"80 × 60 cm"},
 riz:{n:"Riz",g:"cereale",cyc:120,rdt:3000,prix:200,sem:50,fert:[[-7,"compost",3000],[15,"npk15",200],[30,"uree",50],[57,"uree",50]],eca:"20 × 20 cm (repiquage)"},
 fonio:{n:"Fonio",g:"cereale",cyc:90,rdt:600,prix:500,sem:30,fert:[[-7,"compost",2500]],eca:"semis à la volée"},
 niebe:{n:"Niébé",g:"legume",cyc:75,rdt:900,prix:450,sem:20,fert:[[-7,"compost",2500],[0,"npk14",100]],eca:"80 × 40 cm",ins:true},
 arachide:{n:"Arachide",g:"legume",cyc:100,rdt:1100,prix:350,sem:80,fert:[[-7,"compost",2500],[0,"npk14",100]],eca:"40 × 15 cm",butte:true},
 soja:{n:"Soja",g:"legume",cyc:105,rdt:1200,prix:325,sem:60,fert:[[-7,"compost",2500],[0,"npk14",100]],eca:"50 × 5 cm"},
 voandzou:{n:"Voandzou (pois de terre)",g:"legume",cyc:110,rdt:800,prix:400,sem:60,fert:[[-7,"compost",2500]],eca:"40 × 20 cm",butte:true},
 sesame:{n:"Sésame",g:"legume",cyc:95,rdt:600,prix:750,sem:4,fert:[[-7,"compost",2500],[0,"npk15",100],[30,"uree",25]],eca:"60 × 20 cm"},
 coton:{n:"Coton",g:"coton",cyc:150,rdt:1100,prix:300,sem:30,fert:[[0,"npk15",150],[30,"uree",50]],eca:"80 × 30 cm"},
 tomate:{n:"Tomate",g:"mara",pep:true,cyc:90,rdt:18000,prix:250,sem:0.25,fert:[[-7,"compost",20000],[0,"npk15",150],[15,"uree",50],[40,"npk15",150],[60,"uree",50]],eca:"100 × 50 cm",tut:true},
 oignon:{n:"Oignon",g:"mara",pep:true,cyc:110,rdt:25000,prix:250,sem:4,fert:[[-7,"compost",20000],[0,"npk15",150],[15,"uree",50],[30,"npk15",150],[45,"uree",50]],eca:"15 × 10 cm"},
 chou:{n:"Chou",g:"mara",pep:true,cyc:85,rdt:25000,prix:150,sem:0.4,fert:[[-7,"compost",20000],[0,"npk15",150],[15,"uree",50],[35,"uree",50]],eca:"60 × 50 cm"},
 piment:{n:"Piment",g:"mara",pep:true,cyc:120,rdt:8000,prix:600,sem:0.3,fert:[[-7,"compost",20000],[0,"npk15",150],[20,"uree",50],[45,"npk15",150]],eca:"80 × 50 cm"},
 aubergine:{n:"Aubergine",g:"mara",pep:true,cyc:110,rdt:15000,prix:200,sem:0.3,fert:[[-7,"compost",20000],[0,"npk15",150],[20,"uree",50],[45,"npk15",150]],eca:"100 × 60 cm"},
 gombo:{n:"Gombo",g:"mara",cyc:60,rdt:7000,prix:300,sem:10,fert:[[-7,"compost",10000],[0,"npk15",100],[30,"uree",50]],eca:"80 × 40 cm"},
 pasteque:{n:"Pastèque",g:"mara",cyc:80,rdt:20000,prix:125,sem:2,fert:[[-7,"compost",10000],[0,"npk15",150],[30,"uree",50]],eca:"200 × 100 cm"},
 salade:{n:"Laitue",g:"mara",pep:true,cyc:45,rdt:15000,prix:300,sem:0.5,fert:[[-7,"compost",20000],[10,"uree",50]],eca:"25 × 25 cm"},
 manioc:{n:"Manioc",g:"racine",cyc:300,rdt:12000,prix:100,sem:0,bout:"≈ 10 000 boutures par ha",fert:[[-7,"compost",5000],[30,"npk15",100]],eca:"100 × 100 cm"},
 patate:{n:"Patate douce",g:"racine",cyc:120,rdt:12000,prix:150,sem:0,bout:"≈ 30 000 boutures par ha",fert:[[-7,"compost",5000],[30,"npk15",100]],eca:"100 × 30 cm sur billons"},
 fourrage:{n:"Fourrage (Brachiaria, Panicum, Mucuna…)",g:"fourrage",cyc:75,rdt:6000,prix:75,sem:10,fert:[[-7,"compost",5000],[0,"npk15",100],[30,"uree",50]],eca:"50 cm entre lignes"},
 anacarde:{n:"Anacardier (cajou)",g:"arbre",cult:"anacarde",rdtA:6,dens:100,prix:350,age:[[3,0],[4,0.15],[5,0.3],[6,0.5],[7,0.75],[99,1]],rec:[2,5],eca:"10 × 10 m",fl:12},
 manguier:{n:"Manguier",g:"arbre",cult:"manguier",rdtA:100,dens:100,prix:125,age:[[3,0],[4,0.1],[5,0.25],[6,0.45],[8,0.7],[99,1]],rec:[4,6],eca:"10 × 10 m",fl:1},
 agrumes:{n:"Agrumes (oranger, citronnier)",g:"arbre",rdtA:40,dens:400,prix:250,age:[[2,0],[3,0.15],[4,0.35],[6,0.7],[99,1]],rec:[11,2],eca:"5 × 5 m"},
 papayer:{n:"Papayer",g:"arbre",rdtA:25,dens:1600,prix:300,age:[[0.75,0],[1,0.6],[99,1]],rec:null,eca:"2,5 × 2,5 m"},
 bananier:{n:"Bananier",g:"arbre",rdtA:15,dens:1600,prix:250,age:[[0.8,0],[99,1]],rec:null,eca:"2,5 × 2,5 m"},
 moringa:{n:"Moringa",g:"arbre",rdtA:3,dens:2500,prix:1000,age:[[0.5,0],[99,1]],rec:null,eca:"2 × 2 m",note:"rendement en feuilles sèches"},
 arbre:{n:"Autre arbre fruitier",g:"arbre",rdtA:20,dens:100,prix:200,age:[[3,0],[5,0.5],[99,1]],rec:null,eca:"10 × 10 m"},
 autre:{n:"Autre culture",g:"autre",cyc:90,rdt:1000,prix:200,sem:0,fert:[],eca:""}
};
const GROUPS=[["Céréales",["mais","sorgho","mil","riz","fonio"]],["Légumineuses et oléagineux",["niebe","arachide","soja","voandzou","sesame"]],["Culture de rente",["coton"]],
 ["Maraîchage",["tomate","oignon","chou","piment","aubergine","gombo","pasteque","salade"]],["Racines et tubercules",["manioc","patate"]],["Fourrage",["fourrage"]],
 ["Arbres et plantations",["anacarde","manguier","agrumes","papayer","bananier","moringa","arbre"]],["Autre",["autre"]]];
const KINDS=[["prep","Préparation du sol"],["semis","Semis / plantation"],["engrais","Engrais / fumure"],["phyto","Traitement (insectes, maladies)"],["sarclage","Désherbage / sarclage"],
 ["irrigation","Irrigation"],["mo","Main-d'œuvre"],["recolte","Récolte"],["vente","Vente"],["obs","Observation"],["autre","Autre dépense"]];
const KN=k=>(KINDS.find(x=>x[0]===k)||KINDS[KINDS.length-1])[1];
const UNITS=[["kg","kg"],["sac100","sac de 100 kg"],["sac50","sac de 50 kg"],["tine","tine (≈ 17 kg)"],["plateau","plateau / caisse"],["l","litre"],["unite","unité"],["jour","jour de travail"]];
const UNIT_KG={kg:1,sac100:100,sac50:50,tine:17};
const UN=u=>(UNITS.find(x=>x[0]===u)||["",u||""])[1];

/* ---------- 2. calculs ---------- */
const crop=l=>CROPS[l.culture]||CROPS.autre;
const isTree=l=>crop(l).g==="arbre";
const ha=l=>{const s=Number(l.surface)||0;return l.unite==="m2"?s/10000:s};
const surfLbl=l=>l.surface==null||l.surface===""?"surface ?":l.unite==="m2"?fmt(Number(l.surface))+" m²":fmt(Number(l.surface),2)+" ha";
const cName=l=>l.culture==="autre"&&l.cultureAutre?l.cultureAutre:crop(l).n;
const start=l=>isTree(l)?l.datePlantation||null:l.dateSemis||null;
function harvestDate(l){if(isTree(l))return null;if(l.dateRecolte)return l.dateRecolte;const s=start(l);return s?dAdd(s,crop(l).cyc):null}
const trees=l=>{const c=crop(l);return Number(l.nbPieds)||Math.round(c.dens*ha(l))||0};
const treeAge=(l,at)=>{const s=start(l);return s?Math.max(0,days(s,at||today())/365.25):null};
function ageFactor(l,at){const c=crop(l),a=treeAge(l,at);if(a==null)return 1;const r=c.age.find(x=>a<x[0]);return r?r[1]:1}
const priceKg=l=>N(l.prixVente)??crop(l).prix;
/* production attendue de la campagne (kg) */
function expected(l){const c=crop(l);
  if(isTree(l)){if(N(l.rendementObj)!=null)return N(l.rendementObj)*ha(l);const at=nextSeason(l);return trees(l)*c.rdtA*ageFactor(l,at)}
  return ha(l)*(N(l.rendementObj)??c.rdt)}
function nextSeason(l){const c=crop(l);if(!c.rec)return today();const t=new Date();let y=t.getFullYear();const m=t.getMonth()+1;
  const endM=c.rec[1],startM=c.rec[0];const wraps=startM>endM;
  if(!wraps&&m>endM)y++;return y+"-"+pad(startM)+"-15"}
const yieldHa=l=>{const h=ha(l);return h>0?expected(l)/h:null};
/* opérations notées pour le lot */
const ops=l=>A.saisies().filter(s=>s.op&&s.lotId===l.id).sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:(b.createdAt||0)-(a.createdAt||0));
const opKg=o=>{const q=Number(o.qte)||0;const k=UNIT_KG[o.unite];return k?q*k:o.unite?0:q};
let depenses=[];
const lotDep=l=>depenses.filter(d=>d.lotId===l.id);
const lotFac=l=>A.factures().filter(f=>f.lotId===l.id);
function fertRows(l){const c=crop(l);const h=ha(l);const E=A.ENG;
  if(isTree(l)){const C=A.CULT[c.cult];if(!C)return [];const a=treeAge(l)||0;const r=C.ages.find(x=>a<=x[0])||C.ages[C.ages.length-1];const n=trees(l);
    return [["Début des pluies (juin–juillet)","compost",r[2]*n,`${fmt(r[2])} kg par arbre`],["Début des pluies (juin–juillet)","npk15",r[1]/2*n/1000,`${fmt(r[1]/2)} g par arbre`],["Fin août – début septembre","npk15",r[1]/2*n/1000,`${fmt(r[1]/2)} g par arbre`]]}
  return (c.fert||[]).map(([j,e,d])=>[j<0?`J−${-j} (avant semis)`:j===0?(c.g==="mara"?"Repiquage":"Semis"):`J+${j}`,e,d*h,`${fmt(d)} kg/ha`]).filter(r=>E[r[1]])}
const fertCost=rows=>rows.reduce((p,[,e,q])=>p+(e==="compost"?q/1000*A.pEng(e):q/50*A.pEng(e)),0);
const seedQty=l=>N(l.semenceQte)??(crop(l).sem*ha(l));
function plannedCosts(l){const fr=fertRows(l);const rows=[
   ["Semences / plants",N(l.prixSemence)!=null?(seedQty(l)||0)*N(l.prixSemence):N(l.coutPlants)],
   ["Préparation du sol",N(l.coutLabour)],["Engrais et fumure",N(l.coutEngrais)??(fr.length?Math.round(fertCost(fr)):null)],["Traitements",N(l.coutPhyto)],
   ["Main-d'œuvre",N(l.coutMO)],["Irrigation (carburant, pompe)",N(l.coutIrrigation)],["Location de la terre",N(l.coutLocation)],["Récolte, transport et sacs",N(l.coutAutres)]];
  return {rows,total:rows.reduce((p,r)=>p+(r[1]||0),0),estEngrais:N(l.coutEngrais)==null&&fr.length>0}}
function money(l){const O=ops(l);const P=plannedCosts(l);
  const spentOps=O.filter(o=>o.kind!=="vente"&&o.kind!=="recolte").reduce((p,o)=>p+(Number(o.cout)||0),0);
  const spentDep=lotDep(l).reduce((p,d)=>p+(Number(d.montant)||0),0);
  const harvested=O.filter(o=>o.kind==="recolte").reduce((p,o)=>p+opKg(o),0);
  const salesOps=O.filter(o=>o.kind==="vente").reduce((p,o)=>p+(Number(o.cout)||0),0);
  const soldOps=O.filter(o=>o.kind==="vente").reduce((p,o)=>p+opKg(o),0);
  let salesFac=0,soldFac=0;lotFac(l).forEach(f=>{salesFac+=A.facTotals(f).total||0;(f.lignes||[]).forEach(x=>{if(x.prod==="recolte")soldFac+=Number(x.qte)||0})});
  const prix=priceKg(l),exp=expected(l);
  const sold=soldOps+soldFac,stock=Math.max(0,harvested-sold);
  const spent=spentOps+spentDep,sales=salesOps+salesFac;
  return {P,spentOps,spentDep,spent,harvested,sales,salesOps,salesFac,sold,stock,prix,exp,
    planValue:exp*prix,planProfit:exp*prix-P.total,realProfit:sales+stock*prix-spent,
    costKg:exp>0&&P.total>0?P.total/exp:null,realCostKg:harvested>0&&spent>0?spent/harvested:null,
    breakEven:prix>0&&P.total>0?P.total/prix:null}}
/* stade de la culture */
function stage(l){const s=start(l);const t=today();
  if(isTree(l)){if(!s)return {lbl:"Date de plantation à indiquer",f:null};const a=treeAge(l);const af=ageFactor(l);
    const lbl=af===0?`Jeune plantation (${fmt(a,1)} an${a>=2?"s":""})`:af<1?`Entrée en production (${fmt(a,1)} ans)`:`Pleine production (${fmt(a,0)} ans)`;return {lbl,f:null}}
  if(!s)return {lbl:"Date de semis à indiquer",f:null};
  const cyc=Math.max(1,days(s,harvestDate(l)));const d=days(s,t);const f=d/cyc;
  const done=ops(l).some(o=>o.kind==="recolte");const mara=crop(l).g==="mara";
  let lbl;if(d<0)lbl=`Semis dans ${-d} jour${-d>1?"s":""}`;else if(f<0.12)lbl=mara?"Reprise":"Levée";else if(f<0.45)lbl="Croissance";else if(f<0.65)lbl="Floraison";
  else if(f<0.95)lbl=mara?"Fructification":"Maturation";else if(f<=1.2&&!done)lbl="Récolte";else lbl=done?"Récolté":"Récolte en retard";
  return {lbl,f,d,cyc}}

/* ---------- 3. calendrier cultural (utilisé par l'onglet Soins et les alertes) ---------- */
function tasks(l){const c=crop(l);const s=start(l);const out=[];if(!s)return out;
  const add=(code,date,nom,type,voie)=>out.push({code:"cu-"+code,date,nom,type:type||"conduite",voie:voie||""});
  if(isTree(l)){const from=dAdd(today(),-60),to=dAdd(today(),400);const y0=Number(from.slice(0,4));
    const fr=fertRows(l);const yearly=[[6,10,"desh","Désherber autour des pieds (cercle de 1 à 2 m)"],[7,1,"plant","Remplacer les plants morts (début des pluies)"],
      [8,15,"taille","Taille d'entretien : bois mort, gourmands, branches basses"],[10,20,"feu","Pare-feu autour de la plantation avant la saison sèche"]];
    if(fr.length){yearly.push([6,25,"f1",`Engrais : ${fr[0][3]} de fumier ou compost + ${fr[1][3]} de NPK 15-15-15`]);yearly.push([8,30,"f2",`Engrais : ${fr[2][3]} de NPK 15-15-15`])}
    if(c.fl)yearly.push([c.fl,10,"flo","Floraison : surveiller les insectes (punaises, thrips) et traiter si besoin"]);
    if(c.rec)yearly.push([c.rec[0],1,"rec",l.culture==="anacarde"?"Début de la récolte : ramasser les noix tombées tous les 2 à 3 jours, sécher 3 jours au soleil":"Début de la récolte"]);
    for(let y=y0;y<=y0+2;y++)yearly.forEach(([m,dd,k,nom])=>{const date=y+"-"+pad(m)+"-"+pad(dd);if(date>=from&&date<=to&&date>=s)add(k+"-"+y,date,nom,k==="flo"?"traitement":"conduite",(k==="f1"||k==="f2")?"autour de chaque arbre, sous le bord du feuillage":"")});
    return out}
  const R=Math.max(20,days(s,harvestDate(l)));const g=c.g;const T=[];
  if(g==="mara"){if(c.pep)T.push([-35,"pep","Pépinière : semer en planche ombragée et arroser matin et soir"]);
    T.push([-7,"plan","Préparer les planches et apporter le compost"],[0,"rep",(c.pep?"Repiquage":"Semis")+" (arroser avant et après)"],[7,"remp","Remplacer les plants morts"],[15,"bin","Binage et désherbage"]);
    if(c.tut)T.push([21,"tut","Tuteurage des plants"]);T.push([30,"tr1","Traitement préventif contre insectes et champignons","traitement"],[45,"tr2","2e traitement si des attaques sont visibles","traitement"],[Math.round(R*0.7),"rec1","Début de la récolte"],[R,"rec2","Fin de la récolte prévue"])}
  else if(g==="racine")T.push([-14,"prep","Préparer le sol et faire les billons"],[0,"pl","Plantation des boutures"],[30,"s1","1er sarclage"],[60,"s2","2e sarclage"],[R,"rec","Récolte"]);
  else if(g==="fourrage")T.push([-14,"prep","Préparer le sol"],[0,"sem","Semis"],[20,"s1","Sarclage"],[R,"c1","1re coupe (au début de la floraison)"],[R+45,"c2","2e coupe"],[R+90,"c3","3e coupe ou fauche pour le foin de saison sèche"]);
  else{T.push([-21,"prep","Nettoyer et labourer la parcelle (après les premières pluies utiles)"],[0,"sem","Semis"+(c.eca?" : "+c.eca:"")],[10,"lev","Contrôler la levée et ressemer les poquets manquants"]);
    if(g==="cereale"||g==="coton")T.push([15,"dem","Démariage : garder 2 plants par poquet"],[20,"s1","1er sarclage"],[35,"s2","2e sarclage et buttage"]);
    else T.push([15,"s1","1er sarclage"],[30,"s2",c.butte?"2e sarclage et buttage (avant la floraison)":"2e sarclage"]);
    if(g==="coton")[45,60,75,90].forEach((j,i)=>T.push([j,"tc"+i,`Traitement insecticide n° ${i+1} (programme coton)`,"traitement"]));
    else if(c.ins)T.push([35,"ti1","Traitement insecticide à la floraison","traitement"],[50,"ti2","Traitement à la formation des gousses","traitement"]);
    else if(g==="cereale")T.push([Math.round(R*0.45),"surv","Surveiller ravageurs et maladies (chenille légionnaire, foreurs, striga)","traitement"]);
    T.push([R-10,"prr","Préparer la récolte : sacs, main-d'œuvre, aire de séchage"],[R,"rec","Récolte"],[R+10,"sto",g==="legume"?"Sécher, battre et stocker (sacs hermétiques contre les insectes)":"Séchage, battage et stockage des grains (protéger contre les charançons)"])}
  T.forEach(([j,k,nom,type])=>add(k,dAdd(s,j),nom,type));
  fertRows(l).forEach((r,i)=>{const j=(c.fert[i]||[0])[0];const q=r[2];const comp=r[1]==="compost";
    add("eng"+i,dAdd(s,j),"Engrais : "+(A.ENG[r[1]]||{}).n,"conduite",`${r[3]} → ${comp?fmt(q/1000,1)+" t":fmt(q)+" kg"}${comp?"":" ("+fmt(q/50,1)+" sacs de 50 kg)"}`)});
  return out}
/* les travaux antérieurs à la création du lot sont considérés comme déjà faits (lot créé en cours de campagne) */
function programme(l,soins){const c0=l.createdAt?iso(new Date(l.createdAt)):null;
  return tasks(l).map(p=>{const sd=soins[l.id+"_"+p.code];const before=!sd&&c0&&p.date<c0;
    return Object.assign(p,{done:sd?!!sd.fait:!!before,doneDate:sd?sd.dateFait:null,by:sd&&sd.by,auto:!!before,virtual:!!before})})}
function alerts(l){const A2=[];const t=today();const s=start(l);
  if(!s)A2.push(["info",isTree(l)?"Indiquez la date de plantation (bouton Modifier) pour générer le calendrier de la plantation.":"Indiquez la date de semis (bouton Modifier) pour générer le calendrier cultural.","plan"]);
  if(!(ha(l)>0)&&!(isTree(l)&&Number(l.nbPieds)))A2.push(["info","Indiquez la surface de la parcelle pour calculer les semences, l'engrais et la production.","plan"]);
  if(!isTree(l)&&s){const h=harvestDate(l);const d=days(t,h);const done=ops(l).some(o=>o.kind==="recolte");
    const ds=days(t,s);if(ds>0&&ds<=14){const q=seedQty(l);A2.push(["warn",`Semis dans ${ds} jour(s) : préparer ${q?fmt(q,q<10?1:0)+" kg de semences":"les semences"} et l'engrais de fond.`,"plan"])}
    if(!done&&d>=0&&d<=10)A2.push(["warn",`Récolte prévue dans ${d} jour(s) : préparer les sacs, la main-d'œuvre et l'aire de séchage.`,"plan"]);
    if(!done&&d<0&&d>=-60)A2.push(["warn",`La récolte était prévue le ${fds(h)} : notez-la dans l'onglet Travaux (quantité récoltée).`,"plan"])}
  if(isTree(l)&&crop(l).rec){const m=new Date().getMonth()+1;const[a,b]=crop(l).rec;const inS=a<=b?m>=a&&m<=b:m>=a||m<=b;
    if(inS&&ageFactor(l)>0)A2.push(["info","Période de récolte : notez chaque ramassage dans l'onglet Travaux pour suivre la production réelle.","plan"])}
  return A2}

/* ---------- 4. carte dans « Mes lots » ---------- */
const LEAF='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19c3-4 6-7 10-10"/></svg>';
const TREE='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="6"/><path d="M12 15v6M9 21h6"/></svg>';
function level(l){const AA=A.allAlerts(l,{});return AA.some(a=>a[0]==="bad")?"bad":AA.some(a=>a[0]==="warn")?"warn":"ok"}
function card(l){const b=el("button","lot");b.type="button";const av=el("span","av");av.innerHTML=isTree(l)?TREE:LEAF;b.append(av);b.append(notr(el("b",null,l.nom||"Culture")));
  const st=stage(l);const parts=[cName(l)+(l.variete?" "+l.variete:""),isTree(l)&&Number(l.nbPieds)?fmt(Number(l.nbPieds))+" arbres":surfLbl(l),st.lbl+(st.f!=null&&st.d>=0&&st.f<1.2?` (J${st.d})`:"")];
  b.append(el("small",null,parts.filter(Boolean).join(" · ")));const lev=level(l);b.append(el("span","pill s-"+lev,{ok:"RAS",warn:"À surveiller",bad:"Alerte"}[lev]));
  b.append(el("span","go","›"));b.onclick=()=>{tab="resume";A.openLot(l.id)};return b}
function surfTxt(list){const h=list.reduce((p,l)=>p+ha(l),0);return h>=0.1?fmt(h,h<10?2:1)+" ha":fmt(h*10000)+" m²"}

/* ---------- 5. fiche du lot ---------- */
let tab="resume",opEdit=null,opOpen=false;
function detail(D,l){const H=el("div","detail-head");const bk=el("button","back","‹ Mes lots");bk.type="button";bk.onclick=A.closeLot;H.append(bk);
  const h=el("div","row between");const t=el("div");t.style.minWidth="0";t.append(notr(el("h2","sec",l.nom||"Culture")));
  t.append(el("div","note",[cName(l),l.variete,l.parcelle,isTree(l)?(l.datePlantation?"planté le "+fdl(l.datePlantation):null):(l.dateSemis?"semé le "+fdl(l.dateSemis):null)].filter(Boolean).join(" · ")));h.append(t);
  const bx=el("div","btnrow");const sh=el("button","btn small ghost","Partager");sh.type="button";sh.onclick=()=>share(l);bx.append(sh);
  if(A.can()){const e=el("button","btn small ghost","Modifier");e.type="button";e.onclick=()=>form(l);bx.append(e)}h.append(bx);H.append(h);
  const st=el("div","subtabs");[["resume","Résumé"],["travaux","Travaux"],["argent","Rentabilité"]].forEach(([k,lb])=>{const b=el("button",null,lb);b.type="button";b.setAttribute("aria-pressed",tab===k);b.onclick=()=>{tab=k;opOpen=false;A.renderDetail()};st.append(b)});
  H.append(st);D.append(H);
  if(tab==="resume")resume(D,l);else if(tab==="travaux")travaux(D,l);else argent(D,l)}

function resume(D,l){const c=crop(l);const AA=A.allAlerts(l,{});
  if(AA.length){const items=AA.map(a=>{const li=el("li","s-"+a[0]);li.append(el("span","dot"),el("span",null,a[1]));return li});D.append(A.alertList(items,3,!!D.dataset.all,()=>{D.dataset.all=D.dataset.all?"":"1";A.renderDetail()}))}
  else{const ul=el("ul","alerts");const li=el("li","s-ok");li.append(el("span","dot"),el("span",null,"Tout est à jour pour cette culture."));ul.append(li);D.append(ul)}
  const st=stage(l);
  if(st.f!=null){const w=el("div","cu-stage");const top=el("div","row between");top.append(el("b",null,st.lbl),el("span","note",st.d>=0?`Jour ${st.d} sur ${st.cyc}`:`semis le ${fds(start(l))}`));w.append(top);
    const bar=el("div","cu-bar");const fill=el("i");fill.style.width=Math.max(0,Math.min(100,st.f*100))+"%";bar.append(fill);w.append(bar);
    const lb=el("div","cu-lbls");(c.g==="mara"?["Repiquage","Croissance","Floraison","Fruits","Récolte"]:["Semis","Croissance","Floraison","Maturation","Récolte"]).forEach(x=>lb.append(el("span",null,x)));w.append(lb);D.append(w)}
  const K=el("div","kpis");const M=money(l);
  if(isTree(l)){K.append(A.kpi("Arbres",fmt(trees(l)),[surfLbl(l),c.eca?"écartement "+(l.ecartement||c.eca):null].filter(Boolean).join(" · ")));
    K.append(A.kpi("Âge de la plantation",start(l)?fmt(treeAge(l),1)+" ans":"—",st.lbl));
    K.append(A.kpi("Récolte attendue",fmt(M.exp)+" kg",c.rec?`saison ${MOIS[c.rec[0]-1]} – ${MOIS[c.rec[1]-1]}`:"sur l'année"))}
  else{K.append(A.kpi("Surface",surfLbl(l),l.association?"associé : "+l.association:(l.saison||null)));
    const hd=harvestDate(l);const dd=hd?days(today(),hd):null;K.append(A.kpi("Récolte prévue",hd?fds(hd):"—",dd==null?"date de semis à indiquer":dd>0?`dans ${dd} jours`:dd===0?"aujourd'hui":`il y a ${-dd} jours`,dd!=null&&dd<=10?"down":null));
    K.append(A.kpi("Production attendue",M.exp>=1000?fmt(M.exp/1000,1)+" t":fmt(M.exp)+" kg",`≈ ${fmt(yieldHa(l))} kg/ha`))}
  K.append(A.kpi("Récolté",fmt(M.harvested)+" kg",M.harvested&&ha(l)?`soit ${fmt(M.harvested/ha(l))} kg/ha · stock ${fmt(M.stock)} kg`:"à noter dans Travaux"));
  K.append(A.kpi("Valeur attendue",fmt(M.planValue)+" F",`${fmt(M.prix)} F/kg`+(Number(l.partFerme)?` · ${fmt(Number(l.partFerme))} % gardés pour la ferme`:"")));
  K.append(A.kpi("Bénéfice prévu",(M.planProfit<0?"−":"")+fmt(Math.abs(M.planProfit))+" F",M.P.total?"valeur − dépenses prévues":"indiquez les dépenses prévues",M.planProfit>=0?"up":"down"));
  D.append(K);
  /* calendrier */
  const prog=A.programme(l);const next=prog.filter(p=>!p.done&&days(today(),p.date)>=-30).slice(0,5);
  const hh=el("div","row between");hh.append(el("h3","sec","Calendrier cultural"));if(prog.length){const b=el("button","btn small ghost","Tout voir");b.type="button";b.onclick=()=>{A.setCalLot(l.id);A.show("calendrier")};hh.append(b)}D.append(hh);
  if(!prog.length)D.append(el("p","note",isTree(l)?"Indiquez la date de plantation pour obtenir le calendrier.":"Indiquez la date de semis pour obtenir le calendrier."));
  else{const ul=el("ul","cal");next.forEach(p=>ul.append(A.calItem(p,l)));if(!next.length)ul.append(el("li",null,"Tous les travaux prévus sont faits."));D.append(ul)}
  /* intrants */
  const fr=fertRows(l);const sq=seedQty(l);
  if(fr.length||sq||c.bout){D.append(el("h3","sec","Intrants nécessaires"));const w=el("div","tablewrap");const tb=el("table","data cu-int");
    const hd=el("tr");[["Quoi"],["Quand"],["Quantité","n"],["Coût","n"]].forEach(([x,cl])=>hd.append(el("th",cl||null,x)));const th=el("thead");th.append(hd);tb.append(th);const body=el("tbody");
    if(sq||c.bout){const tr=el("tr");tr.append(el("td",null,"Semences"+(l.variete?" ("+l.variete+")":"")),el("td",null,c.g==="mara"&&c.pep?"pépinière":"au semis"),el("td","n",sq?fmt(sq,sq<10?2:0)+" kg":c.bout||"—"),el("td","n",N(l.prixSemence)&&sq?fmt(sq*N(l.prixSemence))+" F":"—"));body.append(tr)}
    fr.forEach(([q0,e,q])=>{const comp=e==="compost";const tr=el("tr");const qc=el("td","n",comp?fmt(q/1000,2)+" t":fmt(q)+" kg");if(!comp){qc.append(el("br"),el("small",null,fmt(q/50,1)+" sacs"))}
      tr.append(el("td",null,(A.ENG[e]||{}).n),el("td",null,q0),qc,el("td","n",fmt(comp?q/1000*A.pEng(e):q/50*A.pEng(e))+" F"));body.append(tr)});
    tb.append(body);w.append(tb);D.append(w);if(fr.length)D.append(el("p","note","Prix des engrais : ceux de l'onglet Formules (sac de 50 kg). Enfouir l'engrais près du pied, sur sol humide."))}
  /* fiche parcelle */
  const info=[["Parcelle",l.parcelle],["Variété",l.variete],["Écartement",l.ecartement||c.eca],["Saison",l.saison],["Culture associée",l.association],["Type de sol",l.sol],["Eau",l.eau],["Irrigation",l.irrigation],["Culture précédente",l.precedent],["Destination",Number(l.partFerme)?`${fmt(Number(l.partFerme))} % gardés pour la ferme (aliment, semences, famille)`:null],["Remarque",l.note]].filter(x=>x[1]);
  if(info.length){D.append(el("h3","sec","Fiche de la parcelle"));const dl=el("dl","cu-info");info.forEach(([k,v])=>{dl.append(el("dt",null,k));dl.append(notr(el("dd",null,String(v))))});D.append(dl)}
  if(c.note)D.append(el("p","note","Production comptée : "+c.note+"."))}

function travaux(D,l){
  if(A.can()&&!opOpen){const b=el("button","btn","+ Noter un travail, une récolte ou une vente");b.type="button";b.style.justifySelf="start";b.onclick=()=>{opEdit=null;opOpen=true;A.renderDetail()};D.append(b)}
  if(opOpen)D.append(opForm(l));
  const O=ops(l);if(!O.length){D.append(el("p","note","Aucun travail noté. Notez ici le labour, le semis, les engrais, les traitements, la main-d'œuvre, chaque récolte et chaque vente : la rentabilité se calcule toute seule."));return}
  A.loadNames([...new Set(O.map(o=>o.by).filter(Boolean))]);
  const w=el("div","tablewrap");const tb=el("table","data");const hd=el("tr");[["Date"],["Travail"],["Détail"],["Quantité","n"],["Montant","n"],["Par"]].forEach(([x,c])=>hd.append(el("th",c||null,x)));
  const th=el("thead");th.append(hd);tb.append(th);const body=el("tbody");
  O.forEach(o=>{const tr=el("tr");tr.append(el("td",null,fds(o.date)),el("td",null,KN(o.kind)),notr(el("td",null,o.desc||"")),el("td","n",o.qte!=null&&o.qte!==""?fmt(Number(o.qte),2)+" "+UN(o.unite):"—"),
    el("td","n",o.cout?(o.kind==="vente"?"+":"")+fmt(Number(o.cout))+" F":"—"),el("td",null,A.names[o.by]||"—"));
    if(A.can()){tr.style.cursor="pointer";tr.onclick=()=>{opEdit=o;opOpen=true;A.renderDetail();window.scrollTo(0,0)}}body.append(tr)});
  tb.append(body);w.append(tb);D.append(w);if(A.can())D.append(el("p","note","Touchez une ligne pour la corriger ou la supprimer."))}
function opForm(l){const o=opEdit||{};const F=el("div","box cu-opf");F.append(el("h3","sec",opEdit?"Corriger":"Nouveau travail"));
  const g=el("div","grid2");const fld=(lab,inp,small)=>{const f=el("div","field");const lb=el("label",null,lab);inp.id=inp.id||"cuo-"+Math.random().toString(36).slice(2,7);lb.htmlFor=inp.id;f.append(lb,inp);if(small)f.append(el("small",null,small));g.append(f);return f};
  const dt=el("input");dt.type="date";dt.value=o.date||today();fld("Date",dt);
  const kd=el("select");KINDS.forEach(([k,n])=>{const x=el("option",null,n);x.value=k;kd.append(x)});kd.value=o.kind||"prep";fld("Type de travail",kd);
  const ds=el("input");ds.type="text";ds.value=o.desc||"";fld("Détail",ds);
  const qt=el("input");qt.type="number";qt.inputMode="decimal";qt.min="0";qt.value=o.qte??"";const fq=fld("Quantité",qt);
  const un=el("select");UNITS.forEach(([k,n])=>{const x=el("option",null,n);x.value=k;un.append(x)});un.value=o.unite||"kg";const fu=fld("Unité",un);
  const ct=el("input");ct.type="number";ct.inputMode="decimal";ct.min="0";ct.value=o.cout??"";const fc=fld("Coût (FCFA)",ct);
  const PH={prep:"ex. labour au tracteur, 2 ha",semis:"ex. maïs SR21, semences certifiées",engrais:"ex. NPK 14-23-14 au semis",phyto:"ex. insecticide contre la chenille légionnaire",sarclage:"ex. 1er sarclage, 4 ouvriers",
    irrigation:"ex. carburant motopompe",mo:"ex. 3 ouvriers × 2 jours",recolte:"ex. 1re récolte, épis séchés",vente:"ex. vendu à M. Ouédraogo",obs:"ex. attaque de chenilles sur la bordure nord",autre:"ex. sacs, transport"};
  const sync=()=>{const k=kd.value;ds.placeholder=PH[k]||"";fc.querySelector("label").textContent=k==="vente"?"Montant reçu (FCFA)":"Coût (FCFA)";fc.hidden=k==="recolte"||k==="obs";
    fq.hidden=fu.hidden=k==="obs"||k==="prep"||k==="sarclage";fq.querySelector("label").textContent=k==="recolte"?"Quantité récoltée":k==="vente"?"Quantité vendue":"Quantité";
    if(!opEdit&&(k==="recolte"||k==="vente")&&un.value==="jour")un.value="kg";if(!opEdit&&k==="mo")un.value="jour"};
  kd.onchange=sync;sync();F.append(g);
  const msg=el("span","msg");const row=el("div","btnrow");const sv=el("button","btn",opEdit?"Enregistrer":"Ajouter");sv.type="button";const cn=el("button","btn ghost","Annuler");cn.type="button";cn.onclick=()=>{opOpen=false;opEdit=null;A.renderDetail()};
  sv.onclick=async()=>{const db=A.db();if(!db)return;const k=kd.value;const q=N(qt.value),c2=N(ct.value);
    if(k==="recolte"&&!(q>0)){msg.textContent="Indiquez la quantité récoltée.";msg.className="msg err";return}
    if(k==="vente"&&!(c2>0)){msg.textContent="Indiquez le montant reçu.";msg.className="msg err";return}
    const body={lotId:l.id,op:true,date:dt.value||today(),kind:k,desc:ds.value.trim(),qte:fq.hidden?null:q,unite:fq.hidden?null:un.value,cout:fc.hidden?null:c2,by:o.by||A.me(),createdAt:o.createdAt||Date.now()};
    sv.disabled=true;try{const ref=opEdit?db.doc("saisies/"+opEdit.id):db.collection("saisies").doc();await ref.set(body);opOpen=false;opEdit=null;A.renderDetail()}
    catch(e){msg.textContent=A.errText(e);msg.className="msg err";sv.disabled=false}};
  row.append(sv,cn);
  if(opEdit){const dl=el("button","btn ghost danger","Supprimer");dl.type="button";dl.onclick=async()=>{if(dl.dataset.c!=="1"){dl.dataset.c="1";dl.textContent="Confirmer la suppression";return}
    try{await A.db().doc("saisies/"+opEdit.id).delete();opOpen=false;opEdit=null;A.renderDetail()}catch(e){msg.textContent=A.errText(e);msg.className="msg err"}};row.append(dl)}
  F.append(row,msg);return F}

function argent(D,l){const M=money(l);const K=el("div","kpis");
  K.append(A.kpi("Dépenses prévues",fmt(M.P.total)+" F",ha(l)?fmt(M.P.total/ha(l))+" F par ha":null));
  K.append(A.kpi("Déjà dépensé",fmt(M.spent)+" F",M.spentDep?`dont ${fmt(M.spentDep)} F notés dans la caisse`:"travaux notés",M.P.total&&M.spent>M.P.total?"down":null));
  K.append(A.kpi("Valeur de la production",fmt(M.planValue)+" F",`${fmt(M.exp)} kg × ${fmt(M.prix)} F/kg`));
  K.append(A.kpi("Bénéfice prévu",(M.planProfit<0?"−":"")+fmt(Math.abs(M.planProfit))+" F",ha(l)?fmt(M.planProfit/ha(l))+" F par ha":null,M.planProfit>=0?"up":"down"));
  if(M.costKg!=null)K.append(A.kpi("Coût de revient prévu",fmt(M.costKg,0)+" F/kg",`prix de vente ${fmt(M.prix)} F/kg`,M.costKg<=M.prix?"up":"down"));
  if(M.breakEven!=null)K.append(A.kpi("Seuil de rentabilité",fmt(M.breakEven)+" kg",ha(l)?`soit ${fmt(M.breakEven/ha(l))} kg/ha à récolter`:"à récolter pour couvrir les dépenses"));
  D.append(K);
  D.append(el("h3","sec","Réel de la campagne"));const K2=el("div","kpis");
  K2.append(A.kpi("Récolté",fmt(M.harvested)+" kg",M.exp?`${fmt(M.harvested/M.exp*100)} % de la production attendue`:null));
  K2.append(A.kpi("Vendu",fmt(M.sales)+" F",`${fmt(M.sold)} kg`+(M.salesFac?` · dont ${fmt(M.salesFac)} F en factures`:"")));
  K2.append(A.kpi("Stock non vendu",fmt(M.stock)+" kg",`valeur ≈ ${fmt(M.stock*M.prix)} F`));
  if(M.realCostKg!=null)K2.append(A.kpi("Coût de revient réel",fmt(M.realCostKg)+" F/kg","dépenses ÷ récolte",M.realCostKg<=M.prix?"up":"down"));
  K2.append(A.kpi("Résultat réel",(M.realProfit<0?"−":"")+fmt(Math.abs(M.realProfit))+" F","ventes + stock − dépenses",M.realProfit>=0?"up":"down"));
  D.append(K2);
  D.append(el("h3","sec","Détail des dépenses"));const w=el("div","tablewrap");const tb=el("table","data");const hd=el("tr");[["Poste"],["Prévu","n"],["Réel","n"]].forEach(([x,c])=>hd.append(el("th",c||null,x)));
  const th=el("thead");th.append(hd);tb.append(th);const body=el("tbody");const O=ops(l);
  const real={"Semences / plants":["semis"],"Préparation du sol":["prep"],"Engrais et fumure":["engrais"],"Traitements":["phyto"],"Main-d'œuvre":["mo","sarclage"],"Irrigation (carburant, pompe)":["irrigation"],"Location de la terre":[],"Récolte, transport et sacs":["autre"]};
  M.P.rows.forEach(([k,v])=>{const r=O.filter(o=>(real[k]||[]).includes(o.kind)).reduce((p,o)=>p+(Number(o.cout)||0),0);const tr=el("tr");tr.append(el("td",null,k+(k==="Engrais et fumure"&&M.P.estEngrais?" (estimé)":"")),el("td","n",v?fmt(v)+" F":"—"),el("td","n",r?fmt(r)+" F":"—"));body.append(tr)});
  if(M.spentDep){const tr=el("tr");tr.append(el("td",null,"Dépenses de la caisse liées au lot"),el("td","n","—"),el("td","n",fmt(M.spentDep)+" F"));body.append(tr)}
  const inv=N(l.investissement);if(inv){const tr=el("tr");tr.append(el("td",null,"Investissement (clôture, puits, matériel)"),el("td","n",fmt(inv)+" F"),el("td","n","—"));body.append(tr)}
  const tt=el("tr");tt.append(el("th",null,"Total campagne"),el("th","n",fmt(M.P.total)+" F"),el("th","n",fmt(M.spent)+" F"));body.append(tt);tb.append(body);w.append(tb);D.append(w);
  if(inv&&M.planProfit>0)D.append(el("p","note",`Investissement remboursé en ≈ ${fmt(Math.ceil(inv/M.planProfit))} campagne(s) au bénéfice prévu.`));
  D.append(el("p","note","Hypothèses : rendement et prix indiqués dans la fiche (sinon moyennes indicatives du Burkina Faso), toute la récolte valorisée au prix de vente, même la part gardée pour la ferme. Notez chaque vente une seule fois : soit dans Travaux, soit par une facture liée au lot."))}

/* ---------- 6. partage WhatsApp ---------- */
function share(l){const M=money(l);const st=stage(l);const tr=s=>window.__tr?window.__tr(s):s;
  const L=["B2A Smart Farming",tr("Lot de culture")+" : "+l.nom,[cName(l),l.variete,isTree(l)?fmt(trees(l))+" "+tr("arbres"):surfLbl(l)].filter(Boolean).join(" · "),tr("Stade")+" : "+tr(st.lbl),
    tr(`Production attendue : ${fmt(M.exp)} kg`),tr(`Récolté : ${fmt(M.harvested)} kg`),tr(`Dépensé : ${fmt(M.spent)} F`),tr(`Bénéfice prévu : ${fmt(M.planProfit)} F`)];
  const next=A.programme(l).filter(p=>!p.done&&p.date>=today()).slice(0,3);if(next.length){L.push("",tr("À faire")+" :");next.forEach(p=>L.push("- "+fds(p.date)+" : "+tr(p.nom)))}
  const txt=L.join("\n");if(navigator.share)navigator.share({title:"B2A Smart Farming",text:txt}).catch(()=>{});else window.open("https://wa.me/?text="+encodeURIComponent(txt),"_blank")}

/* ---------- 7. contexte pour le diagnostic photo ---------- */
function context(l){const st=stage(l);const last=ops(l).slice(0,6).map(o=>`${o.date} ${KN(o.kind)}${o.desc?" ("+o.desc+")":""}`).join("; ");
  return `\nDONNÉES DU LOT « ${l.nom} » : culture ${cName(l)}${l.variete?" variété "+l.variete:""}, ${isTree(l)?trees(l)+" arbres, âge ≈ "+fmt(treeAge(l),1)+" ans":"surface "+surfLbl(l)+(l.dateSemis?", semé le "+l.dateSemis:"")}, stade : ${st.lbl}`+
    `${l.sol?", sol "+l.sol:""}${l.eau?", eau : "+l.eau:""}${l.irrigation?", irrigation "+l.irrigation:""}${l.precedent?", culture précédente "+l.precedent:""}. Derniers travaux : ${last||"aucun noté"}.\n`}

/* ---------- 8. choix du type de lot et formulaire ---------- */
const host=()=>$("lotform-card").parentNode;
let chooser=null,fcard=null,cEdit=null,cStep=0;
function hideAll(){$("home").hidden=true;$("lotdetail").hidden=true;$("lotform-card").hidden=true;if(chooser)chooser.hidden=true;if(fcard)fcard.hidden=true}
function done(id){A.setForm(false);if(chooser)chooser.hidden=true;if(fcard)fcard.hidden=true;if(id)A.setSel(id,true);A.renderLots();window.scrollTo(0,0);
  if(id)setTimeout(()=>{if(A.allLots().some(x=>x.id===id)){A.setSel(id,true);A.renderLots();window.scrollTo(0,0)}},120)}
function choose(){if(!chooser){chooser=el("section","card");chooser.hidden=true;const h=el("div","wiz-head");const bk=el("button","back","‹ Annuler");bk.type="button";bk.onclick=()=>done();
    h.append(bk,el("h2","sec","Nouveau lot"));chooser.append(h,el("p","wiz-intro","Que voulez-vous suivre ?"));const g=el("div","cu-choose");
    const opt=(svg,t,s,fn)=>{const b=el("button","lot");b.type="button";const av=el("span","av");av.innerHTML=svg;b.append(av,el("b",null,t),el("small",null,s),el("span","go","›"));b.onclick=fn;g.append(b)};
    opt('<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="13" rx="6.5" ry="8"/></svg>',"Animaux","Volailles, moutons, chèvres, bovins, porcs, poissons",()=>{chooser.hidden=true;A.openLotForm(null)});
    opt(LEAF,"Culture / plantation","Champ, maraîchage, fourrage, verger d'anacardiers ou de manguiers",()=>{chooser.hidden=true;form(null)});
    chooser.append(g);host().insertBefore(chooser,$("lotform-card"))}
  A.setForm(true);hideAll();chooser.hidden=false;window.scrollTo(0,0)}
const F=[ /* [étape, id, libellé, type, options, aide] */
 [0,"nom","Nom du lot","text",null,"ex. Maïs 2027 – Kouli ouest"],[0,"culture","Culture","crop"],[0,"cultureAutre","Nom de la culture","text",null,"ex. Gingembre"],[0,"variete","Variété","text",null,"ex. SR21, Komsaya, Bondofa"],
 [0,"parcelle","Parcelle / lieu","text",null,"ex. Kouli, moitié ouest"],[0,"surface","Surface","num"],[0,"unite","Unité","sel",[["ha","hectares (ha)"],["m2","mètres carrés (m²)"]]],
 [0,"dateSemis","Date de semis (ou de repiquage)","date"],[0,"datePlantation","Date de plantation","date"],[0,"nbPieds","Nombre d'arbres / de pieds","num"],[0,"ecartement","Écartement","text"],
 [0,"saison","Saison","sel",[["","—"],["Saison des pluies","Saison des pluies"],["Contre-saison (saison sèche)","Contre-saison (saison sèche)"],["Toute l'année (irrigué)","Toute l'année (irrigué)"]]],
 [0,"association","Culture associée","text",null,"ex. niébé entre les lignes"],
 [1,"rendementObj","Rendement attendu (kg par ha)","num"],[1,"prixVente","Prix de vente (FCFA / kg)","num"],[1,"dateRecolte","Date de récolte prévue","date"],[1,"partFerme","Part gardée pour la ferme (%)","num",null,"aliment des animaux, semences, famille"],
 [2,"semenceQte","Semences (kg)","num"],[2,"prixSemence","Prix des semences (FCFA / kg)","num"],[2,"coutPlants","Achat des plants (FCFA)","num",null,"pour les arbres ou les boutures"],
 [2,"coutLabour","Préparation du sol (FCFA)","num",null,"labour, tracteur, attelage, nettoyage"],[2,"coutEngrais","Engrais et fumure (FCFA)","num"],[2,"coutPhyto","Traitements (FCFA)","num",null,"insecticides, herbicides, fongicides"],
 [2,"coutMO","Main-d'œuvre (FCFA)","num",null,"semis, sarclages, récolte"],[2,"coutIrrigation","Irrigation (FCFA)","num",null,"carburant, électricité, pompe"],[2,"coutLocation","Location de la terre (FCFA)","num"],
 [2,"coutAutres","Récolte, transport et sacs (FCFA)","num"],[2,"investissement","Investissement de départ (FCFA)","num",null,"clôture, puits, matériel : non compté dans la campagne"],
 [3,"sol","Type de sol","sel",[["","—"],["Sableux","Sableux"],["Sablo-argileux","Sablo-argileux"],["Argileux","Argileux"],["Limoneux","Limoneux"],["Gravillonnaire","Gravillonnaire"],["Bas-fond","Bas-fond"]]],
 [3,"eau","Source d'eau","sel",[["","—"],["Pluie seulement","Pluie seulement"],["Puits","Puits"],["Forage","Forage"],["Barrage / retenue d'eau","Barrage / retenue d'eau"],["Rivière","Rivière"]]],
 [3,"irrigation","Irrigation","sel",[["","—"],["Aucune","Aucune"],["Arrosoir","Arrosoir"],["Goutte-à-goutte","Goutte-à-goutte"],["Aspersion","Aspersion"],["Gravitaire (rigoles)","Gravitaire (rigoles)"]]],
 [3,"precedent","Culture précédente","text",null,"ex. niébé, jachère"],[3,"note","Remarque","text",null,"ex. bordure nord inondable"]];
const NUMS=new Set(F.filter(f=>f[3]==="num").map(f=>f[1]));
const STEPS=["La culture","Récolte","Dépenses","Sol et eau"];
const INTRO=["La parcelle et ce que vous cultivez.","Ce que vous pensez récolter et vendre. Laissez vide pour utiliser les moyennes indicatives.","Les dépenses prévues pour cette campagne. Laissez vide ce que vous ne connaissez pas.","Facultatif : aide le diagnostic et le suivi."];
function buildForm(){fcard=el("section","card wiz");fcard.hidden=true;
  const h=el("div","wiz-head");const bk=el("button","back","‹ Annuler");bk.type="button";bk.onclick=()=>done();const tt=el("h2","sec","Nouveau lot de culture");tt.id="cu-title";
  const ol=el("ol","steps");STEPS.forEach((s,i)=>{const li=el("li");li.dataset.i=i;li.append(el("span",null,String(i+1)),document.createTextNode(s));li.onclick=()=>{if(i>cStep&&!ok())return;cStep=i;steps()};ol.append(li)});
  const msg=el("span","msg");msg.id="cu-msg";h.append(bk,tt,ol,msg);fcard.append(h);
  STEPS.forEach((s,i)=>{const st=el("div","wiz-step");st.dataset.step=i;st.append(el("p","wiz-intro",INTRO[i]));const g=el("div","grid2");
    F.filter(f=>f[0]===i).forEach(([,id,lab,type,opts,help])=>{const f=el("div","field");f.dataset.f=id;const lb=el("label",null,lab);lb.htmlFor="cu-"+id;let inp;
      if(type==="crop"){inp=el("select");GROUPS.forEach(([gn,keys])=>{const og=el("optgroup");og.label=gn;keys.forEach(k=>{const o=el("option",null,CROPS[k].n);o.value=k;og.append(o)});inp.append(og)})}
      else if(type==="sel"){inp=el("select");opts.forEach(([v,t])=>{const o=el("option",null,t);o.value=v;inp.append(o)})}
      else{inp=el("input");inp.type=type==="num"?"number":type;if(type==="num"){inp.inputMode="decimal";inp.min="0"}}
      inp.id="cu-"+id;f.append(lb,inp);const sm=el("small");sm.id="cu-h-"+id;if(help)sm.textContent=help;f.append(sm);g.append(f)});
    st.append(g);fcard.append(st)});
  const foot=el("div","wiz-foot");const pv=el("button","btn ghost","Précédent");pv.type="button";pv.id="cu-prev";const nx=el("button","btn","Suivant");nx.type="button";nx.id="cu-next";
  const sv=el("button","btn","Enregistrer le lot");sv.type="button";sv.id="cu-save";foot.append(pv,nx,sv);fcard.append(foot);
  const cl=el("button","btn ghost danger","Clôturer le lot");cl.type="button";cl.id="cu-close";fcard.append(cl);
  pv.onclick=()=>{cStep=Math.max(0,cStep-1);steps();window.scrollTo(0,0)};nx.onclick=()=>{if(!ok())return;cStep=Math.min(3,cStep+1);steps();window.scrollTo(0,0)};sv.onclick=save;
  cl.onclick=async()=>{if(!cEdit)return;if(cl.dataset.c!=="1"){cl.dataset.c="1";cl.textContent="Confirmer la clôture";return}
    try{await A.db().doc("lots/"+cEdit.id).update({actif:false});A.setSel(null,false);done()}catch(e){$("cu-msg").textContent=A.errText(e)}};
  ["culture","surface","unite","dateSemis","datePlantation","nbPieds","rendementObj","prixVente","semenceQte","prixSemence"].forEach(id=>{const i=$("cu-"+id)||fcard.querySelector("#cu-"+id);i.addEventListener(i.tagName==="SELECT"?"change":"input",sync)});
  host().insertBefore(fcard,$("lotform-card").nextSibling)}
const V=id=>fcard.querySelector("#cu-"+id);
const fake=()=>({culture:V("culture").value,surface:N(V("surface").value),unite:V("unite").value,dateSemis:V("dateSemis").value,datePlantation:V("datePlantation").value,nbPieds:N(V("nbPieds").value),
  rendementObj:N(V("rendementObj").value),prixVente:N(V("prixVente").value),semenceQte:N(V("semenceQte").value),prixSemence:N(V("prixSemence").value),dateRecolte:""});
const show=(id,on)=>{fcard.querySelector(`[data-f="${id}"]`).hidden=!on};
const help=(id,t)=>{fcard.querySelector("#cu-h-"+id).textContent=t};
function sync(){const l=fake();const c=crop(l);const tree=c.g==="arbre";
  show("cultureAutre",l.culture==="autre");show("dateSemis",!tree);show("dateRecolte",!tree);show("saison",!tree);show("datePlantation",tree);show("nbPieds",tree);
  show("semenceQte",!tree&&c.sem>0||l.culture==="autre");show("prixSemence",!tree&&c.sem>0||l.culture==="autre");show("coutPlants",tree||c.g==="racine");
  V("ecartement").placeholder=c.eca?"conseillé : "+c.eca:"";
  if(tree){const n=trees(l);help("nbPieds",ha(l)?`≈ ${fmt(c.dens*ha(l))} arbres pour ${surfLbl(l)} (${fmt(c.dens)} par ha)`:`${fmt(c.dens)} arbres par ha conseillés`);
    V("rendementObj").placeholder="facultatif";help("rendementObj",n?`Sinon calculé : ${fmt(n)} arbres × ${fmt(c.rdtA)} kg par arbre adulte${c.note?" ("+c.note+")":""}, selon l'âge`:`≈ ${fmt(c.rdtA)} kg par arbre adulte`)}
  else{V("rendementObj").placeholder=fmt(c.rdt);help("rendementObj",`Moyenne indicative : ${fmt(c.rdt)} kg/ha${ha(l)?" · production ≈ "+fmt(expected(l))+" kg":""}`)}
  V("prixVente").placeholder=fmt(c.prix);help("prixVente",`Indicatif : ${fmt(c.prix)} F/kg (à adapter au marché)`);
  const sd=c.sem*ha(l);V("semenceQte").placeholder=sd?fmt(sd,sd<10?2:0):"";help("semenceQte",c.sem?`Conseillé : ${fmt(c.sem,c.sem<1?2:0)} kg/ha`+(c.eca?" · "+c.eca:""):c.bout||"");
  const hd=!tree&&l.dateSemis?dAdd(l.dateSemis,c.cyc):null;V("dateRecolte").placeholder="";help("dateRecolte",hd?`Calculée : ${fdl(hd)} (cycle ≈ ${c.cyc} jours). Laissez vide pour garder ce calcul.`:`Cycle ≈ ${c.cyc||"—"} jours après le semis`);
  const fr=fertRows(l);help("coutEngrais",fr.length?`Estimé avec le plan de fumure : ≈ ${fmt(Math.round(fertCost(fr)))} F (laissez vide pour garder cette estimation)`:"");
  help("dateSemis",c.g==="mara"?"Pour le maraîchage : date du repiquage ou du semis en place":"");
  help("surface",tree?"facultatif si vous indiquez le nombre d'arbres":"")}
function steps(){fcard.querySelectorAll(".wiz-step").forEach(x=>x.hidden=Number(x.dataset.step)!==cStep);
  fcard.querySelectorAll(".steps li").forEach(li=>{const i=Number(li.dataset.i);li.className=i===cStep?"on":i<cStep?"done":""});
  const last=cStep===3;$("cu-prev").style.visibility=cStep?"visible":"hidden";$("cu-next").hidden=last;$("cu-save").hidden=!last&&!cEdit;$("cu-save").textContent=cEdit?"Enregistrer":"Enregistrer le lot";
  $("cu-save").style.gridColumn=(!last&&cEdit)?"1 / -1":"";$("cu-close").hidden=!cEdit||!A.can()}
function ok(){const m=$("cu-msg");if(cStep===0){const tree=crop(fake()).g==="arbre";
    if(!V("nom").value.trim()){m.textContent="Indiquez le nom du lot.";m.className="msg err";V("nom").focus();return false}
    if(!(N(V("surface").value)>0)&&!(tree&&N(V("nbPieds").value)>0)){m.textContent=tree?"Indiquez la surface ou le nombre d'arbres.":"Indiquez la surface de la parcelle.";m.className="msg err";V("surface").focus();return false}}
  m.textContent="";return true}
function form(l){if(!fcard)buildForm();cEdit=l||null;cStep=0;A.setForm(true);hideAll();fcard.hidden=false;$("cu-title").textContent=l?"Modifier le lot de culture":"Nouveau lot de culture";
  F.forEach(([,id,,type])=>{const i=V(id);const v=l?l[id]:null;i.value=v==null?(id==="unite"?"ha":id==="culture"?"mais":""):String(v)});
  if(!l)V("dateSemis").value="";$("cu-msg").textContent="";const cl=$("cu-close");cl.dataset.c="";cl.textContent="Clôturer le lot";sync();steps();window.scrollTo(0,0)}
async function save(){const db=A.db();if(!db)return;cStep=0;if(!ok()){steps();return}
  const body={type:"culture",actif:true,createdAt:cEdit?cEdit.createdAt||Date.now():Date.now()};
  F.forEach(([,id])=>{const v=V(id).value;body[id]=NUMS.has(id)?N(v):(v||"").trim()});
  if(body.culture!=="autre")body.cultureAutre="";body.espece=body.culture==="autre"&&body.cultureAutre?body.cultureAutre:CROPS[body.culture].n;
  const tree=CROPS[body.culture].g==="arbre";if(tree){body.dateSemis="";body.dateRecolte=""}else{body.datePlantation="";body.nbPieds=null}
  const sv=$("cu-save");sv.disabled=true;
  try{const ref=cEdit?db.doc("lots/"+cEdit.id):db.collection("lots").doc();await ref.set(body);tab="resume";done(ref.id)}
  catch(e){$("cu-msg").textContent=A.errText(e);$("cu-msg").className="msg err";cStep=3;steps()}finally{sv.disabled=false}}

/* ---------- 9. styles, hauteur de l'en-tête, dépenses ---------- */
const css=el("style");css.textContent=`
.cu-stage{display:grid;gap:8px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--surface)}
.cu-bar{height:10px;border-radius:99px;background:var(--bg);overflow:hidden}.cu-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--brand-green,#5aa83c),var(--brand-gold,#e2a83a))}
.cu-lbls{display:grid;grid-template-columns:repeat(5,1fr);font:600 11px/1.2 var(--body);color:var(--muted);text-align:center}
.cu-lbls span:first-child{text-align:left}.cu-lbls span:last-child{text-align:right}
.cu-info{display:grid;grid-template-columns:minmax(110px,auto) 1fr;gap:6px 14px;margin:0}.cu-info dt{color:var(--muted);font-weight:600}.cu-info dd{margin:0;overflow-wrap:anywhere}
.cu-choose{display:grid;gap:10px}.cu-choose .lot{grid-template-columns:auto 1fr auto}.cu-choose .lot .go{grid-column:3;grid-row:1/span 2;align-self:center}
.cu-int td,.cu-int th{padding-left:6px;padding-right:6px}.cu-int td.n{white-space:nowrap}
.cu-opf{display:grid;gap:12px;padding:14px;border:1px solid var(--line);border-radius:12px}
.lot .av svg path{fill:none}`;
document.head.append(css);
{const band=document.querySelector(".band");if(band){const set=()=>document.documentElement.style.setProperty("--bandh",band.getBoundingClientRect().height+"px");set();
  try{new ResizeObserver(set).observe(band)}catch(e){addEventListener("resize",set)}}}
if(B.getDb)B.getDb().then(db=>{if(!db)return;db.collection("depenses").onSnapshot(s=>{depenses=s.docs.map(d=>({id:d.id,...d.data()}));
  const l=A.allLots().find(x=>A.isCrop(x)&&$("lotdetail")&&!$("lotdetail").hidden);if(l)A.renderDetail()},()=>{})}).catch(()=>{});

/* ---------- 10. traductions ---------- */
const T={
"Culture / plantation":["Crop / plantation","Coltura / piantagione","Cultivo / plantación"],"Que voulez-vous suivre ?":["What do you want to track?","Cosa vuoi seguire?","¿Qué quiere seguir?"],
"Animaux":["Animals","Animali","Animales"],"Volailles, moutons, chèvres, bovins, porcs, poissons":["Poultry, sheep, goats, cattle, pigs, fish","Pollame, pecore, capre, bovini, maiali, pesci","Aves, ovejas, cabras, bovinos, cerdos, peces"],
"Champ, maraîchage, fourrage, verger d'anacardiers ou de manguiers":["Field, vegetables, fodder, cashew or mango orchard","Campo, orto, foraggio, frutteto di anacardi o manghi","Campo, hortalizas, forraje, huerto de anacardos o mangos"],
"Nouveau lot de culture":["New crop batch","Nuovo lotto di coltura","Nuevo lote de cultivo"],"Modifier le lot de culture":["Edit crop batch","Modifica lotto di coltura","Editar lote de cultivo"],
"La culture":["The crop","La coltura","El cultivo"],"Récolte":["Harvest","Raccolto","Cosecha"],"Dépenses":["Expenses","Spese","Gastos"],"Sol et eau":["Soil and water","Suolo e acqua","Suelo y agua"],
"La parcelle et ce que vous cultivez.":["The plot and what you grow.","L'appezzamento e cosa coltivi.","La parcela y lo que cultiva."],
"Ce que vous pensez récolter et vendre. Laissez vide pour utiliser les moyennes indicatives.":["What you expect to harvest and sell. Leave blank to use indicative averages.","Quanto pensi di raccogliere e vendere. Lascia vuoto per usare le medie indicative.","Lo que espera cosechar y vender. Déjelo vacío para usar los promedios indicativos."],
"Les dépenses prévues pour cette campagne. Laissez vide ce que vous ne connaissez pas.":["Planned expenses for this season. Leave blank what you don't know.","Spese previste per questa campagna. Lascia vuoto ciò che non sai.","Gastos previstos para esta campaña. Deje vacío lo que no sepa."],
"Facultatif : aide le diagnostic et le suivi.":["Optional: helps diagnosis and follow-up.","Facoltativo: aiuta la diagnosi e il monitoraggio.","Opcional: ayuda al diagnóstico y al seguimiento."],
"Culture":["Crop","Coltura","Cultivo"],"Nom de la culture":["Crop name","Nome della coltura","Nombre del cultivo"],"Variété":["Variety","Varietà","Variedad"],"Parcelle / lieu":["Plot / place","Appezzamento / luogo","Parcela / lugar"],
"Surface":["Area","Superficie","Superficie"],"Unité":["Unit","Unità","Unidad"],"hectares (ha)":["hectares (ha)","ettari (ha)","hectáreas (ha)"],"mètres carrés (m²)":["square metres (m²)","metri quadrati (m²)","metros cuadrados (m²)"],
"Date de semis (ou de repiquage)":["Sowing (or transplanting) date","Data di semina (o trapianto)","Fecha de siembra (o trasplante)"],"Date de plantation":["Planting date","Data di impianto","Fecha de plantación"],
"Nombre d'arbres / de pieds":["Number of trees / plants","Numero di alberi / piante","Número de árboles / plantas"],"Écartement":["Spacing","Sesto d'impianto","Marco de plantación"],"Saison":["Season","Stagione","Temporada"],
"Saison des pluies":["Rainy season","Stagione delle piogge","Temporada de lluvias"],"Contre-saison (saison sèche)":["Off-season (dry season)","Controstagione (stagione secca)","Contraestación (temporada seca)"],"Toute l'année (irrigué)":["All year (irrigated)","Tutto l'anno (irrigato)","Todo el año (regado)"],
"Culture associée":["Intercrop","Coltura consociata","Cultivo asociado"],"Rendement attendu (kg par ha)":["Expected yield (kg per ha)","Resa attesa (kg per ha)","Rendimiento esperado (kg por ha)"],
"Prix de vente (FCFA / kg)":["Selling price (FCFA / kg)","Prezzo di vendita (FCFA / kg)","Precio de venta (FCFA / kg)"],"Date de récolte prévue":["Planned harvest date","Data di raccolta prevista","Fecha de cosecha prevista"],
"Part gardée pour la ferme (%)":["Share kept for the farm (%)","Quota tenuta per l'azienda (%)","Parte guardada para la granja (%)"],"aliment des animaux, semences, famille":["animal feed, seed, family","mangime, sementi, famiglia","pienso, semillas, familia"],
"Semences (kg)":["Seed (kg)","Sementi (kg)","Semillas (kg)"],"Prix des semences (FCFA / kg)":["Seed price (FCFA / kg)","Prezzo delle sementi (FCFA / kg)","Precio de la semilla (FCFA / kg)"],"Achat des plants (FCFA)":["Seedlings purchase (FCFA)","Acquisto piantine (FCFA)","Compra de plantones (FCFA)"],
"Préparation du sol (FCFA)":["Land preparation (FCFA)","Preparazione del terreno (FCFA)","Preparación del suelo (FCFA)"],"Engrais et fumure (FCFA)":["Fertiliser and manure (FCFA)","Concimi e letame (FCFA)","Abonos y estiércol (FCFA)"],
"Traitements (FCFA)":["Crop protection (FCFA)","Trattamenti (FCFA)","Tratamientos (FCFA)"],"Main-d'œuvre (FCFA)":["Labour (FCFA)","Manodopera (FCFA)","Mano de obra (FCFA)"],"Irrigation (FCFA)":["Irrigation (FCFA)","Irrigazione (FCFA)","Riego (FCFA)"],
"Location de la terre (FCFA)":["Land rent (FCFA)","Affitto del terreno (FCFA)","Alquiler de la tierra (FCFA)"],"Récolte, transport et sacs (FCFA)":["Harvest, transport and bags (FCFA)","Raccolta, trasporto e sacchi (FCFA)","Cosecha, transporte y sacos (FCFA)"],
"Investissement de départ (FCFA)":["Initial investment (FCFA)","Investimento iniziale (FCFA)","Inversión inicial (FCFA)"],"Type de sol":["Soil type","Tipo di suolo","Tipo de suelo"],"Source d'eau":["Water source","Fonte d'acqua","Fuente de agua"],
"Irrigation":["Irrigation","Irrigazione","Riego"],"Culture précédente":["Previous crop","Coltura precedente","Cultivo anterior"],"Remarque":["Note","Nota","Observación"],
"Travaux":["Field work","Lavori","Labores"],"Rentabilité":["Profitability","Redditività","Rentabilidad"],"Résumé":["Summary","Riepilogo","Resumen"],"Partager":["Share","Condividi","Compartir"],
"Calendrier cultural":["Crop calendar","Calendario colturale","Calendario de cultivo"],"Tout voir":["See all","Vedi tutto","Ver todo"],"Intrants nécessaires":["Inputs needed","Input necessari","Insumos necesarios"],"Fiche de la parcelle":["Plot sheet","Scheda dell'appezzamento","Ficha de la parcela"],
"Surface":["Area","Superficie","Superficie"],"Récolte prévue":["Planned harvest","Raccolto previsto","Cosecha prevista"],"Production attendue":["Expected production","Produzione attesa","Producción esperada"],"Récolté":["Harvested","Raccolto","Cosechado"],
"Valeur attendue":["Expected value","Valore atteso","Valor esperado"],"Bénéfice prévu":["Planned profit","Utile previsto","Beneficio previsto"],"Arbres":["Trees","Alberi","Árboles"],"Âge de la plantation":["Plantation age","Età dell'impianto","Edad de la plantación"],"Récolte attendue":["Expected harvest","Raccolto atteso","Cosecha esperada"],
"Levée":["Emergence","Emergenza","Emergencia"],"Croissance":["Growth","Crescita","Crecimiento"],"Floraison":["Flowering","Fioritura","Floración"],"Maturation":["Ripening","Maturazione","Maduración"],"Reprise":["Establishment","Attecchimento","Arraigo"],"Fructification":["Fruiting","Fruttificazione","Fructificación"],
"Récolté":["Harvested","Raccolto","Cosechado"],"Récolte en retard":["Harvest overdue","Raccolta in ritardo","Cosecha atrasada"],"Semis":["Sowing","Semina","Siembra"],"Repiquage":["Transplanting","Trapianto","Trasplante"],"Fruits":["Fruits","Frutti","Frutos"],
"Quoi":["What","Cosa","Qué"],"Quand":["When","Quando","Cuándo"],"Quantité":["Quantity","Quantità","Cantidad"],"Coût":["Cost","Costo","Coste"],"Semences":["Seed","Sementi","Semillas"],"Date":["Date","Data","Fecha"],"Travail":["Work","Lavoro","Labor"],"Détail":["Detail","Dettaglio","Detalle"],"Montant":["Amount","Importo","Importe"],"Par":["By","Da","Por"],
"+ Noter un travail, une récolte ou une vente":["+ Record work, a harvest or a sale","+ Registra un lavoro, un raccolto o una vendita","+ Anotar una labor, una cosecha o una venta"],"Nouveau travail":["New work","Nuovo lavoro","Nueva labor"],"Corriger":["Correct","Correggi","Corregir"],
"Type de travail":["Type of work","Tipo di lavoro","Tipo de labor"],"Coût (FCFA)":["Cost (FCFA)","Costo (FCFA)","Coste (FCFA)"],"Montant reçu (FCFA)":["Amount received (FCFA)","Importo ricevuto (FCFA)","Importe recibido (FCFA)"],"Quantité récoltée":["Quantity harvested","Quantità raccolta","Cantidad cosechada"],"Quantité vendue":["Quantity sold","Quantità venduta","Cantidad vendida"],
"Ajouter":["Add","Aggiungi","Añadir"],"Préparation du sol":["Land preparation","Preparazione del terreno","Preparación del suelo"],"Semis / plantation":["Sowing / planting","Semina / impianto","Siembra / plantación"],"Engrais / fumure":["Fertiliser / manure","Concimazione","Abonado"],
"Traitement (insectes, maladies)":["Treatment (pests, diseases)","Trattamento (insetti, malattie)","Tratamiento (plagas, enfermedades)"],"Désherbage / sarclage":["Weeding","Diserbo / sarchiatura","Deshierbe / escarda"],"Main-d'œuvre":["Labour","Manodopera","Mano de obra"],"Vente":["Sale","Vendita","Venta"],"Observation":["Observation","Osservazione","Observación"],"Autre dépense":["Other expense","Altra spesa","Otro gasto"],
"kg":["kg","kg","kg"],"sac de 100 kg":["100 kg bag","sacco da 100 kg","saco de 100 kg"],"sac de 50 kg":["50 kg bag","sacco da 50 kg","saco de 50 kg"],"tine (≈ 17 kg)":["tine (≈ 17 kg)","tine (≈ 17 kg)","tine (≈ 17 kg)"],"plateau / caisse":["tray / crate","vassoio / cassa","bandeja / caja"],"litre":["litre","litro","litro"],"unité":["unit","unità","unidad"],"jour de travail":["work day","giornata di lavoro","jornada de trabajo"],
"Dépenses prévues":["Planned expenses","Spese previste","Gastos previstos"],"Déjà dépensé":["Already spent","Già speso","Ya gastado"],"Valeur de la production":["Production value","Valore della produzione","Valor de la producción"],"Coût de revient prévu":["Planned cost price","Costo di produzione previsto","Coste de producción previsto"],
"Seuil de rentabilité":["Break-even","Punto di pareggio","Umbral de rentabilidad"],"Réel de la campagne":["Actual season figures","Dati reali della campagna","Real de la campaña"],"Vendu":["Sold","Venduto","Vendido"],"Stock non vendu":["Unsold stock","Scorta invenduta","Existencias sin vender"],"Coût de revient réel":["Actual cost price","Costo di produzione reale","Coste de producción real"],
"Résultat réel":["Actual result","Risultato reale","Resultado real"],"Détail des dépenses":["Expense details","Dettaglio delle spese","Detalle de los gastos"],"Poste":["Item","Voce","Partida"],"Prévu":["Planned","Previsto","Previsto"],"Réel":["Actual","Reale","Real"],"Total campagne":["Season total","Totale campagna","Total campaña"],
"Semences / plants":["Seed / seedlings","Sementi / piantine","Semillas / plantones"],"Engrais et fumure":["Fertiliser and manure","Concimi e letame","Abonos y estiércol"],"Traitements":["Crop protection","Trattamenti","Tratamientos"],"Irrigation (carburant, pompe)":["Irrigation (fuel, pump)","Irrigazione (carburante, pompa)","Riego (combustible, bomba)"],
"Location de la terre":["Land rent","Affitto del terreno","Alquiler de la tierra"],"Récolte, transport et sacs":["Harvest, transport and bags","Raccolta, trasporto e sacchi","Cosecha, transporte y sacos"],"Cultures":["Crops","Colture","Cultivos"],
"Céréales":["Cereals","Cereali","Cereales"],"Légumineuses et oléagineux":["Legumes and oilseeds","Leguminose e oleaginose","Leguminosas y oleaginosas"],"Culture de rente":["Cash crop","Coltura da reddito","Cultivo comercial"],"Maraîchage":["Vegetables","Orticoltura","Hortalizas"],"Racines et tubercules":["Roots and tubers","Radici e tuberi","Raíces y tubérculos"],"Fourrage":["Fodder","Foraggio","Forraje"],"Arbres et plantations":["Trees and plantations","Alberi e piantagioni","Árboles y plantaciones"],"Autre":["Other","Altro","Otro"],
"Maïs":["Maize","Mais","Maíz"],"Sorgho":["Sorghum","Sorgo","Sorgo"],"Mil":["Millet","Miglio","Mijo"],"Riz":["Rice","Riso","Arroz"],"Fonio":["Fonio","Fonio","Fonio"],"Niébé":["Cowpea","Fagiolo dall'occhio","Caupí"],"Arachide":["Groundnut","Arachide","Cacahuete"],"Soja":["Soybean","Soia","Soja"],"Voandzou (pois de terre)":["Bambara groundnut","Voandzou (arachide bambara)","Voandzou (maní bambara)"],"Sésame":["Sesame","Sesamo","Sésamo"],"Coton":["Cotton","Cotone","Algodón"],
"Tomate":["Tomato","Pomodoro","Tomate"],"Oignon":["Onion","Cipolla","Cebolla"],"Chou":["Cabbage","Cavolo","Col"],"Piment":["Chilli","Peperoncino","Chile"],"Aubergine":["Eggplant","Melanzana","Berenjena"],"Gombo":["Okra","Gombo","Quimbombó"],"Pastèque":["Watermelon","Anguria","Sandía"],"Laitue":["Lettuce","Lattuga","Lechuga"],"Manioc":["Cassava","Manioca","Yuca"],"Patate douce":["Sweet potato","Patata dolce","Batata"],
"Fourrage (Brachiaria, Panicum, Mucuna…)":["Fodder (Brachiaria, Panicum, Mucuna…)","Foraggio (Brachiaria, Panicum, Mucuna…)","Forraje (Brachiaria, Panicum, Mucuna…)"],"Anacardier (cajou)":["Cashew tree","Anacardio","Anacardo"],"Manguier":["Mango tree","Mango","Mango"],"Agrumes (oranger, citronnier)":["Citrus (orange, lemon)","Agrumi (arancio, limone)","Cítricos (naranjo, limonero)"],"Papayer":["Papaya","Papaya","Papayo"],"Bananier":["Banana","Banano","Banano"],"Moringa":["Moringa","Moringa","Moringa"],"Autre arbre fruitier":["Other fruit tree","Altro albero da frutto","Otro frutal"],"Autre culture":["Other crop","Altra coltura","Otro cultivo"],
"Sableux":["Sandy","Sabbioso","Arenoso"],"Sablo-argileux":["Sandy clay","Sabbioso-argilloso","Arenoso-arcilloso"],"Argileux":["Clay","Argilloso","Arcilloso"],"Limoneux":["Silty","Limoso","Limoso"],"Gravillonnaire":["Gravelly","Ghiaioso","Gravoso"],"Bas-fond":["Lowland","Fondovalle","Bajo"],
"Pluie seulement":["Rain only","Solo pioggia","Solo lluvia"],"Puits":["Well","Pozzo","Pozo"],"Forage":["Borehole","Pozzo trivellato","Perforación"],"Barrage / retenue d'eau":["Dam / reservoir","Diga / invaso","Presa / embalse"],"Rivière":["River","Fiume","Río"],"Aucune":["None","Nessuna","Ninguna"],"Arrosoir":["Watering can","Annaffiatoio","Regadera"],"Goutte-à-goutte":["Drip","Goccia a goccia","Goteo"],"Aspersion":["Sprinkler","Aspersione","Aspersión"],"Gravitaire (rigoles)":["Furrow","A gravità (solchi)","Por gravedad (surcos)"],
"Clôturer le lot":["Close batch","Chiudi il lotto","Cerrar el lote"],"Enregistrer le lot":["Save batch","Salva il lotto","Guardar el lote"],"Tout est à jour pour cette culture.":["Everything is up to date for this crop.","Tutto è aggiornato per questa coltura.","Todo está al día para este cultivo."],
"Récolte":["Harvest","Raccolta","Cosecha"],"Indiquez la surface de la parcelle.":["Enter the plot area.","Indica la superficie dell'appezzamento.","Indique la superficie de la parcela."],"Indiquez le nom du lot.":["Enter the batch name.","Indica il nome del lotto.","Indique el nombre del lote."],
"Date de semis à indiquer":["Sowing date to be entered","Data di semina da indicare","Fecha de siembra por indicar"],"Date de plantation à indiquer":["Planting date to be entered","Data di impianto da indicare","Fecha de plantación por indicar"]
};
{const D=window.B2A_DICT=window.B2A_DICT||{};["en","it","es"].forEach((lg,i)=>{D[lg]=D[lg]||{};for(const k in T)if(D[lg][k]==null)D[lg][k]=T[k][i]})}

window.B2A_CULT={choose,form,card,detail,alerts,programme,context,surfTxt,crops:CROPS};
try{A.renderLots()}catch(e){}
})();
