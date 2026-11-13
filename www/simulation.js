/* B2A Smart Farming : simulation complète d'un projet d'élevage ou de culture (version Pro)
   B2A-HIGH-TECHNOLOGY-AUTOMATION · Bayere Abdoul Aziz
   - Carte « Simuler un projet » sur l'accueil ; l'écran s'ouvre en plein écran.
   - Sans abonnement Pro en cours : écran d'abonnement de pro.js (B2A_PRO.lockCard).
   - Calcule : bâtiments (dimensions, nombre), surface du terrain, plan de construction (dessin),
     dépenses de départ détaillées (terrain → animaux / semences), fonds de roulement jusqu'à la première vente,
     fonctionnement par an, retour sur investissement, trésorerie mois par mois et étapes du projet.
   - Prix moyens au Burkina Faso (FCFA), tous modifiables ; les réglages sont gardés sur le téléphone (b2a-sim). */
(function(){
const B=window.B2A;if(!B)return;
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const notr=e=>{e.setAttribute("data-notr","");return e};
const tr=s=>window.__tr?window.__tr(s):s;
const fmt=(v,d=0)=>v==null||!isFinite(v)?"—":Number(v).toLocaleString("fr-FR",{maximumFractionDigits:d,minimumFractionDigits:d});
const F=v=>fmt(Math.round(v/1000)*1000)+" F";
const LS="b2a-sim";
const isPro=()=>!!(window.B2A_PRO&&window.B2A_PRO.isPro());

/* ================= données de base (moyennes Burkina Faso, modifiables) ================= */
/* Élevage, par animal et par bande : achat, alim (kg), pAlim (F/kg), vet, autres, vente (par animal vendu), mort (%),
   cycle (mois de production), vide (mois de vide sanitaire), delai (mois avant la 1re vente), etale (ventes réparties),
   dens (animaux par m²), W (largeur du bâtiment, m), equip (F par animal), moPer (animaux par ouvrier), uneFois (animaux achetés une seule fois) */
const ELV={
 pondeuse:{nom:"Poules pondeuses",u:"poules",def:1000,achat:750,alim:52,alimD:7.5,pAlim:320,vet:600,autres:400,vente:27500,mort:8,cycle:17,vide:1,delai:5,etale:true,dens:5,W:10,equip:1500,moPer:2000,bat:"Poulailler",
   venteLbl:"Œufs et poules de réforme par poule"},
 chair:{nom:"Poulets de chair",u:"poulets",def:1000,achat:600,alim:4.5,pAlim:380,vet:250,autres:150,vente:3250,mort:5,cycle:1.5,vide:.5,delai:1.5,etale:false,dens:10,W:10,equip:700,moPer:3000,bat:"Poulailler",venteLbl:"Prix de vente d'un poulet"},
 caillepond:{nom:"Cailles pondeuses",u:"cailles",def:1000,achat:400,alim:11,alimD:0.6,pAlim:350,vet:50,autres:50,vente:11000,mort:10,cycle:13.5,vide:.5,delai:1.5,etale:true,dens:40,W:6,equip:600,moPer:3000,bat:"Poulailler",
   venteLbl:"Œufs et cailles de réforme par caille"},
 caillechair:{nom:"Cailles de chair",u:"cailles",def:1000,achat:350,alim:.75,pAlim:380,vet:25,autres:25,vente:1250,mort:8,cycle:1.3,vide:.5,delai:1.3,etale:false,dens:40,W:6,equip:400,moPer:4000,bat:"Poulailler",venteLbl:"Prix de vente d'une caille"},
 local:{nom:"Poulets locaux et pintades",u:"sujets",def:500,achat:500,alim:6,pAlim:300,vet:200,autres:100,vente:3500,mort:10,cycle:4,vide:.5,delai:4,etale:false,dens:6,W:8,equip:600,moPer:2000,bat:"Poulailler",venteLbl:"Prix de vente d'un sujet"},
 porc:{nom:"Porcs à l'engraissement",u:"porcs",def:50,achat:25000,alim:250,pAlim:250,vet:3000,autres:2000,vente:120000,mort:4,cycle:5,vide:.5,delai:5,etale:false,dens:.7,W:8,equip:10000,moPer:100,bat:"Porcherie",venteLbl:"Prix de vente d'un porc"},
 mouton:{nom:"Embouche ovine (moutons)",u:"moutons",def:50,achat:45000,alim:160,pAlim:150,vet:1500,autres:500,vente:85000,mort:2,cycle:3,vide:.25,delai:3,etale:false,dens:.67,W:8,equip:5000,moPer:150,bat:"Bergerie",parc:true,venteLbl:"Prix de vente d'un mouton"},
 bovin:{nom:"Embouche bovine",u:"bœufs",def:20,achat:250000,alim:1200,pAlim:90,vet:5000,autres:3000,vente:450000,mort:1,cycle:4,vide:.5,delai:4,etale:false,dens:.25,W:10,equip:20000,moPer:40,bat:"Étable",parc:true,venteLbl:"Prix de vente d'un bœuf"},
 vache:{nom:"Vaches laitières",u:"vaches",def:10,achat:650000,alim:4500,pAlim:90,vet:15000,autres:20000,vente:1150000,mort:2,cycle:12,vide:0,delai:1,etale:true,dens:.125,W:10,equip:50000,moPer:15,bat:"Étable",parc:true,uneFois:true,venteLbl:"Lait et veau par vache et par an"},
 tilapia:{nom:"Pisciculture : tilapia",u:"alevins",def:5000,achat:50,alim:.64,pAlim:750,vet:0,autres:20,vente:800,mort:15,cycle:6,vide:.5,delai:6,etale:false,dens:5,W:10,equip:30,moPer:20000,bat:"Bassin",fish:true,venteLbl:"Prix de vente d'un poisson"},
 clarias:{nom:"Pisciculture : clarias (silure)",u:"alevins",def:5000,achat:75,alim:.96,pAlim:750,vet:0,autres:20,vente:1600,mort:15,cycle:6,vide:.5,delai:6,etale:false,dens:15,W:10,equip:30,moPer:20000,bat:"Bassin",fish:true,venteLbl:"Prix de vente d'un poisson"}
};
/* Culture, par hectare et par saison : semence, engrais, phyto, prep (préparation du sol), mo (main-d'œuvre), recolte,
   rend (kg/ha), prix (F/kg), cycle (mois), saisons (par an), irrig (irrigation obligatoire), delai (mois avant la 1re récolte) */
const CUL={
 mais:{nom:"Maïs",def:2,semence:25000,engrais:110000,phyto:25000,prep:60000,mo:90000,recolte:50000,rend:3500,prix:200,cycle:4,saisons:1,irrig:false},
 sorgho:{nom:"Sorgho",def:2,semence:8000,engrais:60000,phyto:10000,prep:60000,mo:70000,recolte:40000,rend:1500,prix:225,cycle:4,saisons:1,irrig:false},
 riz:{nom:"Riz irrigué",def:2,semence:40000,engrais:150000,phyto:30000,prep:90000,mo:150000,recolte:70000,rend:5000,prix:225,cycle:4,saisons:2,irrig:true},
 soja:{nom:"Soja",def:2,semence:40000,engrais:50000,phyto:25000,prep:60000,mo:80000,recolte:40000,rend:1500,prix:350,cycle:4,saisons:1,irrig:false},
 arachide:{nom:"Arachide",def:2,semence:70000,engrais:40000,phyto:15000,prep:60000,mo:100000,recolte:60000,rend:1500,prix:350,cycle:4,saisons:1,irrig:false},
 oignon:{nom:"Oignon (maraîchage)",def:1,semence:240000,engrais:300000,phyto:100000,prep:100000,mo:400000,recolte:100000,rend:25000,prix:250,cycle:4,saisons:1,irrig:true},
 tomate:{nom:"Tomate (maraîchage)",def:1,semence:150000,engrais:300000,phyto:150000,prep:100000,mo:450000,recolte:100000,rend:25000,prix:200,cycle:4,saisons:1,irrig:true},
 anacarde:{nom:"Anacarde (verger)",def:5,semence:0,engrais:30000,phyto:20000,prep:0,mo:60000,recolte:40000,rend:800,prix:450,cycle:12,saisons:1,irrig:false,verger:true,plants:100,pPlant:1000,trouaison:150000}
};
const NIV={trad:{lbl:"Traditionnel",m2:15000,bassin:3000,clot:5000,portail:150000,mois:1,irrig:300000},
           semi:{lbl:"Semi-moderne",m2:35000,bassin:8000,clot:12000,portail:250000,mois:2,irrig:1200000},
           mod:{lbl:"Moderne",m2:65000,bassin:25000,clot:35000,portail:500000,mois:3,irrig:2500000}};
const EAU={aucun:{lbl:"Pas de point d'eau (culture sous pluie)",c:0},forage:{lbl:"Forage avec pompe solaire",c:3500000},reseau:{lbl:"Branchement au réseau d'eau",c:250000},puits:{lbl:"Puits busé avec pompe",c:800000}};
const ELEC={solaire:{lbl:"Kit solaire",c:1200000},reseau:{lbl:"Branchement au réseau électrique",c:300000},aucune:{lbl:"Pas d'électricité",c:0}};
const DEMARCHES=250000,SALAIRE=50000,GARDIEN=40000;

/* ================= réglages gardés ================= */
const PT_E=3000,PT_C=150; // prix moyen du terrain (F/m²) : autour de la ville pour l'élevage, en zone rurale pour les champs
let st={type:"pondeuse",n:null,niv:"semi",eau:"forage",elec:"solaire",terrainOk:false,pTerrain:PT_E,salaire:SALAIRE,over:{}};
try{Object.assign(st,JSON.parse(B.lsGet(LS)||"{}"))}catch(e){}
const save=()=>{try{B.lsSet(LS,JSON.stringify(st))}catch(e){}};
const isCul=t=>!!CUL[t];
const base=()=>isCul(st.type)?CUL[st.type]:ELV[st.type];
const P=()=>({...base(),...(st.over[st.type]||{})});

/* ================= calcul ================= */
function calc(){
  const t=st.type,p=P(),niv=NIV[st.niv]||NIV.semi,cul=isCul(t);
  const N=Math.max(cul?.1:1,Number(st.n)||p.def);
  const inv=[],bats=[];let surfBat=0,annexes=[];
  /* ---------- bâtiments et surface ---------- */
  let plotW,plotD,layout;
  if(!cul){
    const area=Math.ceil(N/p.dens);surfBat=area;
    let n,L,W;
    if(p.fish){W=10;L=20;n=Math.max(1,Math.ceil(area/200))}
    else{W=p.W;n=Math.max(1,Math.ceil(area/(W*50)));L=Math.max(6,Math.ceil(area/(n*W)))}
    bats.push({nom:p.bat,n,L,W,s:n*L*W});
    const alimMois=N*p.alim/Math.max(p.cycle,1)/1000; // tonnes d'aliment par mois
    const mag=Math.max(12,Math.ceil(alimMois/.6)+6);
    const mW=mag<=24?4:6;annexes=[{nom:"Magasin d'aliment et de matériel",c:"M",L:Math.max(3,Math.ceil(mag/mW)),W:mW},{nom:"Bureau et vestiaire",c:"B",L:4,W:3},{nom:"Logement du gardien",c:"G",L:5,W:4}];
    if(p.parc)bats.push({nom:"Parc d'exercice (clôturé)",n,L,W,s:n*L*W,parc:true});
    const gap=p.fish?4:15,cols=n>3?2:1,rows=Math.ceil(n/cols),rowD=p.parc?W*2:W;
    const annW=annexes.reduce((a,x)=>a+x.L,0)+(annexes.length-1)*4+8;
    plotW=Math.ceil(Math.max(cols*L+(cols-1)*gap,annW)+10);
    plotD=Math.ceil(5+rows*rowD+(rows-1)*gap+12+6+5);
    layout={kind:"elv",n,L,W,gap,cols,rows,rowD,parc:!!p.parc,fish:!!p.fish};
  }else{
    const prod=N*p.rend*(p.saisons||1)/1000;
    const mag=Math.max(12,Math.ceil(prod/1.5));
    const mW=mag<=24?4:6;annexes=[{nom:"Magasin de stockage",c:"M",L:Math.max(3,Math.ceil(mag/mW)),W:mW},{nom:"Abri du matériel et des intrants",c:"A",L:5,W:4}];if(N>=3)annexes.push({nom:"Logement du gardien",c:"G",L:5,W:4});
    const side=Math.sqrt(N*10000);plotW=Math.ceil(side+10);plotD=Math.ceil(side+22);
    layout={kind:"cul",side,ha:N};
  }
  const surfTerrain=plotW*plotD,perim=2*(plotW+plotD);
  const surfAnnex=annexes.reduce((a,x)=>a+x.L*x.W,0);
  /* ---------- dépenses de départ ---------- */
  const add=(k,lbl,v,det)=>{inv.push({k,lbl,v:Math.max(0,Math.round(v)),det})};
  add("terrain","Terrain",st.terrainOk?0:surfTerrain*(Number(st.pTerrain)||0),st.terrainOk?"Déjà possédé":null);
  add("demarches","Démarches, papiers du terrain et plan",DEMARCHES);
  add("cloture","Clôture et portail",cul?perim*({trad:1500,semi:3000,mod:8000}[st.niv]||3000)+niv.portail/2:perim*niv.clot+niv.portail);
  if((EAU[st.eau]||EAU.forage).c)add("eau",(EAU[st.eau]||EAU.forage).lbl,(EAU[st.eau]||EAU.forage).c);
  if((ELEC[st.elec]||ELEC.aucune).c)add("elec",(ELEC[st.elec]||ELEC.aucune).lbl,(ELEC[st.elec]||ELEC.aucune).c);
  let batCost=0,equipCost=0,startCost=0;
  if(!cul){
    const m2=p.fish?niv.bassin:niv.m2;batCost=bats.filter(b=>!b.parc).reduce((a,b)=>a+b.s,0)*m2;
    add("bat",p.fish?"Bassins":"Bâtiments d'élevage",batCost);
    add("annexes","Magasin, bureau et logement du gardien",surfAnnex*NIV[st.niv==="trad"?"trad":"semi"].m2);
    equipCost=N*p.equip;add("equip",p.fish?"Matériel (filets, aérateur, balances)":"Équipements (mangeoires, abreuvoirs, éclairage…)",equipCost);
    startCost=N*p.achat;add("animaux",p.fish?"Alevins de départ":"Animaux de départ",startCost);
  }else{
    add("annexes","Magasin, abri et logement du gardien",surfAnnex*NIV[st.niv==="trad"?"trad":"semi"].m2);
    if(p.irrig)add("irrig","Irrigation (goutte-à-goutte, motopompe, tuyaux)",N*niv.irrig);
    equipCost=100000+50000*N;add("equip","Petit matériel (pulvérisateurs, outils, bâches)",equipCost);
    if(p.verger){startCost=N*(p.plants*p.pPlant+p.trouaison);add("plants","Plants greffés, piquetage et trouaison",startCost)}
  }
  /* ---------- trésorerie mois par mois (pas de 1/4 de mois) ---------- */
  const tC=1+niv.mois,tS=tC+.5; // début de production
  const c=cul?12/(p.saisons||1):p.cycle+p.vide;
  const nOuv=cul?0:Math.max(1,Math.ceil(N/p.moPer));
  const gardien=!cul||N>=3,moMois=nOuv*(Number(st.salaire)||SALAIRE)+(gardien?GARDIEN:0);
  const surv=cul?1:1-(p.mort||0)/100,moyen=cul?1:1-(p.mort||0)/200;
  const coutCycle=cul?N*(p.semence+p.engrais+p.phyto+p.prep+p.mo+p.recolte):N*moyen*(p.alim*p.pAlim+p.vet+p.autres);
  const venteCycle=cul?N*p.rend*p.prix:N*surv*p.vente;
  const achatCycle=cul?0:(p.uneFois?0:N*p.achat);
  const H=p.verger?240:180,dt=.25;
  const invHors=inv.reduce((a,x)=>a+x.v,0)-startCost; // achats répartis dans le temps ci-dessous
  const flows=[];
  const rampe=t=>{if(!p.verger)return 1;const y=Math.floor((t-tS)/12);return y<3?0:y===3?.25:y===4?.5:y===5?.75:1};
  for(let t=0;t<H;t+=dt){
    let out=0,inn=0;
    if(t<tC)out+=(invHors-inv.find(x=>x.k==="equip").v)*dt/tC; // terrain, clôture, eau, bâtiments… pendant les travaux
    if(t>=tC-dt&&t<tC)out+=inv.find(x=>x.k==="equip").v;
    if(t>=tS-dt&&t<tS)out+=startCost;
    if(t>=tS){
      out+=moMois*dt;
      const k=Math.floor((t-tS)/c),s=tS+k*c,inCycle=t-s<p.cycle;
      if(k>=1&&t-s<dt)out+=achatCycle;
      if(inCycle){if(p.alimD&&!cul){const fx=N*moyen*(p.vet+p.autres)/p.cycle,d=Math.min(p.delai,p.cycle-dt);out+=(fx+(t-s<d?N*moyen*p.alimD*p.pAlim/d:N*moyen*(p.alim-p.alimD)*p.pAlim/(p.cycle-d)))*dt}else out+=coutCycle*dt/p.cycle}
      const r=rampe(t);
      if(p.etale){if(inCycle&&t-s>=p.delai)inn+=venteCycle*dt/Math.max(p.cycle-p.delai,dt)}
      else if(t-s<p.cycle&&t-s+dt>=p.cycle)inn+=venteCycle*r;
    }
    flows.push({t,out,inn});
  }
  /* fonds de roulement : le plus gros manque d'argent pendant le PREMIER cycle (charges avant les premières ventes).
     Avant : cherché sur 15 ans → si le projet perd de l'argent, toutes les pertes de 15 ans s'ajoutaient ici. */
  let cum=0,cumOp=0,minOp=0,payback=null;const curve=[];
  const finFdr=tS+(p.verger?84:c); // verger : jusqu'à la production pleine (≈ 7 ans)
  flows.forEach(f=>{cum+=f.inn-f.out;if(f.t>=tS&&f.t<finFdr){cumOp+=f.inn-f.out;if(cumOp<minOp)minOp=cumOp}});
  const fdr=Math.max(0,-minOp);
  add("fdr","Fonds de roulement jusqu'aux premières ventes",fdr);
  /* imprévus : 10 % des investissements seulement (pas sur le fonds de roulement) */
  const sous=inv.filter(x=>x.k!=="fdr").reduce((a,x)=>a+x.v,0);add("impr","Imprévus (10 %)",sous*.1);
  const total=inv.reduce((a,x)=>a+x.v,0);
  cum=-(inv.find(x=>x.k==="impr").v);
  flows.forEach((f,i)=>{cum+=f.inn-f.out;if(i%4===3)curve.push({m:(i+1)/4,v:cum});if(payback==null&&f.t>tS&&cum>=0)payback=f.t});
  /* ---------- fonctionnement par an (à plein régime) ---------- */
  const cyc=12/c;
  const an=[];const ad=(lbl,v)=>an.push({lbl,v:Math.round(v)});
  if(!cul){
    ad("Ventes",venteCycle*cyc);
    if(achatCycle)ad(p.fish?"Achat des alevins":"Achat des animaux (nouvelles bandes)",achatCycle*cyc);
    ad("Aliment",N*moyen*p.alim*p.pAlim*cyc);
    if(p.vet)ad("Santé (vaccins, vétérinaire)",N*moyen*p.vet*cyc);
    ad("Autres charges (litière, énergie, transport)",N*moyen*p.autres*cyc);
  }else{
    ad("Ventes",venteCycle*cyc);
    if(p.semence)ad("Semences",N*p.semence*cyc);
    ad("Engrais",N*p.engrais*cyc);ad("Produits de traitement",N*p.phyto*cyc);
    if(p.prep)ad("Préparation du sol",N*p.prep*cyc);
    ad("Main-d'œuvre des champs",N*p.mo*cyc);ad("Récolte et transport",N*p.recolte*cyc);
  }
  if(moMois)ad(cul?"Gardien":"Main-d'œuvre (ouvriers et gardien)",moMois*12);
  const ventesAn=an[0].v,chargesAn=an.slice(1).reduce((a,x)=>a+x.v,0);
  const get=k=>(inv.find(x=>x.k===k)||{v:0}).v;
  const amort=(get("bat")+get("annexes"))/15+(get("equip")+get("irrig"))/5+(get("cloture")+get("eau")+get("elec"))/10;
  const margeAn=(ventesAn-chargesAn)*(p.verger?1:1),netAn=margeAn-amort;
  /* ---------- étapes ---------- */
  const et=[];const e=(de,a,lbl)=>et.push({de,a,lbl});
  e(0,1,"Démarches, terrain, plan et devis des artisans");
  e(1,tC,cul?"Clôture, point d'eau, magasin et irrigation":"Clôture, point d'eau, électricité et construction");
  if(!cul)e(tC,tS,"Équipement, désinfection et vide sanitaire");
  if(!cul)e(tS,tS,p.fish?"Mise en eau et arrivée des alevins":"Arrivée des animaux");
  else e(tS,tS,p.verger?"Plantation des plants greffés":"Semis ou repiquage");
  e(tS+(p.verger?36:(p.etale?p.delai:p.cycle)),null,p.verger?"Première récolte (le verger produit à plein vers la 7e année)":"Premières ventes");
  if(!cul&&!p.uneFois)e(tS+c,null,"Bande suivante (rythme de croisière)");
  const show=Math.min(H,Math.max(36,Math.ceil(((payback!=null?payback:H)+12)/12)*12));curve.splice(Math.floor(show));
  return {p,N,cul,bats,annexes,surfBat,surfAnnex,surfTerrain,plotW,plotD,perim,layout,inv,total,an,ventesAn,chargesAn,amort,margeAn,netAn,payback,curve,et,tS,nOuv,cyc};
}

/* ================= styles ================= */
const css=document.createElement("style");css.textContent=`
.sim-ov{position:fixed;inset:0;z-index:8500;background:var(--bg);overflow:auto;-webkit-overflow-scrolling:touch}
.sim-wrap{max-width:900px;margin:0 auto;padding:12px 12px 90px;display:grid;gap:12px}
.sim-top{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:10px;background:var(--leaf);color:#fff;padding:10px 12px;padding-top:max(10px,env(safe-area-inset-top))}
.sim-top h2{margin:0;font:800 17px var(--display);color:#fff;flex:1}.sim-top .back{background:none;border:0;color:#fff;font:700 16px var(--body);padding:6px 4px;cursor:pointer}
.sim-kpi{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}@media(min-width:620px){.sim-kpi{grid-template-columns:repeat(4,minmax(0,1fr))}}
.sim-kpi div{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px;display:grid;gap:2px}
.sim-kpi small{color:var(--muted);font-size:12.5px}.sim-kpi b{font:800 18px var(--display);color:var(--heading)}.sim-kpi .neg b{color:var(--bad)}
.sim-t{width:100%;border-collapse:collapse;font-size:14px}.sim-t td{padding:7px 4px;border-bottom:1px solid var(--line);vertical-align:top}.sim-t td.n{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.sim-t tr.tot td{font-weight:800;border-top:2px solid var(--ink);border-bottom:0}.sim-t small{display:block;color:var(--muted)}
.sim-plan svg,.sim-cash svg{width:100%;height:auto;display:block;background:var(--surface);border:1px solid var(--line);border-radius:10px}
.sim-steps{list-style:none;margin:0;padding:0;display:grid;gap:6px}.sim-steps li{display:grid;grid-template-columns:90px 1fr;gap:8px;font-size:14px}.sim-steps b{color:var(--heading)}
.sim-hyp{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.sim-hyp .field{margin:0}
.sim-actions{display:flex;flex-wrap:wrap;gap:8px}
`;document.head.append(css);

/* ================= dessins ================= */
const NS="http://www.w3.org/2000/svg";
const sv=(t,a,txt)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(txt!=null)e.textContent=txt;return e};
function planSVG(r){
  const W=r.plotW,D=r.plotD,pad=Math.max(W,D)*.07,s=sv("svg",{viewBox:`${-pad} ${-pad} ${W+2*pad} ${D+2*pad*1.6}`,role:"img"});
  const fs=Math.max(W,D)/24;s.setAttribute("aria-label","Plan de construction");
  const txt=(x,y,t,o={})=>{const e=sv("text",{x,y,"font-size":o.fs||fs,"text-anchor":o.a||"middle",fill:o.c||"currentColor","font-family":"sans-serif","font-weight":o.w||400},t);if(o.notr)e.setAttribute("data-notr","");s.append(e);return e};
  s.style.color="var(--ink)";
  s.append(sv("rect",{x:0,y:0,width:W,height:D,fill:"#eef5e6",stroke:"#3b7520","stroke-width":fs/5,"stroke-dasharray":`${fs} ${fs/2}`}));
  txt(W/2,-pad*.35,`${fmt(W)} m`,{notr:1});const vt=txt(-pad*.45,D/2,`${fmt(D)} m`,{notr:1});vt.setAttribute("transform",`rotate(-90 ${-pad*.45} ${D/2})`);
  /* nord */
  const nx=W+pad*.5,ny=pad*.2;s.append(sv("path",{d:`M${nx} ${ny+fs*2}L${nx} ${ny}M${nx-fs*.5} ${ny+fs*.7}L${nx} ${ny}L${nx+fs*.5} ${ny+fs*.7}`,stroke:"currentColor","stroke-width":fs/6,fill:"none"}));txt(nx,ny+fs*3,"N",{w:700,notr:1});
  const L=r.layout;
  if(L.kind==="elv"){
    const x0=5,y0=5;let i=0;
    for(let row=0;row<L.rows;row++)for(let col=0;col<L.cols&&i<L.n;col++,i++){
      const x=x0+col*(L.L+L.gap),y=y0+row*(L.rowD+L.gap);
      s.append(sv("rect",{x,y,width:L.L,height:L.W,fill:L.fish?"#cfe3f7":"#dfe6f2",stroke:"#1b2e4c","stroke-width":fs/6,rx:L.fish?fs/3:0}));
      txt(x+L.L/2,y+L.W/2+fs*.35,`${i+1} · ${fmt(L.L)}×${fmt(L.W)} m`,{fs:Math.min(fs,L.L/6),notr:1,w:700});
      if(L.parc)s.append(sv("rect",{x,y:y+L.W,width:L.L,height:L.W,fill:"none",stroke:"#9a6a10","stroke-width":fs/8,"stroke-dasharray":`${fs/2} ${fs/3}`}));
    }
    const ya=D-5-6;let xa=5;
    r.annexes.forEach(a=>{s.append(sv("rect",{x:xa,y:ya,width:a.L,height:a.W,fill:"#fbf1dc",stroke:"#9a6a10","stroke-width":fs/7}));txt(xa+a.L/2,ya+a.W/2+Math.min(fs,a.W*.6)*.35,a.c,{fs:Math.min(fs,a.W*.6),w:800,notr:1});xa+=a.L+4});
  }else{
    const side=L.side,x0=5,y0=5,n=Math.ceil(L.ha),cols=Math.ceil(Math.sqrt(n)),cell=side/cols;
    s.append(sv("rect",{x:x0,y:y0,width:side,height:side,fill:"#d9ecc6",stroke:"#3b7520","stroke-width":fs/6}));
    for(let k=1;k<cols;k++){s.append(sv("line",{x1:x0+k*cell,y1:y0,x2:x0+k*cell,y2:y0+side,stroke:"#3b7520","stroke-width":fs/10,"stroke-dasharray":`${fs/2} ${fs/2}`}));s.append(sv("line",{x1:x0,y1:y0+k*cell,x2:x0+side,y2:y0+k*cell,stroke:"#3b7520","stroke-width":fs/10,"stroke-dasharray":`${fs/2} ${fs/2}`}))}
    txt(x0+side/2,y0+side/2,`${fmt(L.ha,1)} ha`,{fs:fs*1.4,w:800,notr:1});
    let xa=5;const ya=D-5-6;r.annexes.forEach(a=>{s.append(sv("rect",{x:xa,y:ya,width:a.L,height:a.W,fill:"#fbf1dc",stroke:"#9a6a10","stroke-width":fs/7}));txt(xa+a.L/2,ya+a.W/2+Math.min(fs,a.W*.6)*.35,a.c,{fs:Math.min(fs,a.W*.6),w:800,notr:1});xa+=a.L+4});
  }
  /* entrée, point d'eau */
  s.append(sv("rect",{x:W-12,y:D-fs*.4,width:8,height:fs*.8,fill:"#b3372a"}));
  s.append(sv("circle",{cx:W-6,cy:D-14,r:fs*.7,fill:"#2c7fd0"}));
  /* légende */
  const ly=D+pad*.9;let lx=0;
  const leg=(col,lbl,dash)=>{s.append(sv("rect",{x:lx,y:ly-fs*.8,width:fs,height:fs,fill:dash?"none":col,stroke:col,"stroke-width":fs/8,"stroke-dasharray":dash?`${fs/3} ${fs/4}`:"none"}));const t=txt(lx+fs*1.3,ly,lbl,{a:"start",fs:fs*.85,notr:1});lx+=fs*1.6+lbl.length*fs*.47};
  if(L.kind==="elv"){leg(L.fish?"#2c7fd0":"#1b2e4c",tr(r.p.bat==="Bassin"?"Bassins":"Bâtiments"));if(L.parc)leg("#9a6a10",tr("Parc"),true)}else leg("#3b7520",tr("Champ"));
  leg("#9a6a10",tr("Annexes"));leg("#2c7fd0",tr("Eau"));leg("#b3372a",tr("Entrée"));
  return s}
function cashSVG(r){
  const pts=r.curve;if(!pts.length)return null;const W=640,H=200,Lm=58,Rm=10,T=12,Bm=26;
  const mx=pts[pts.length-1].m,vs=pts.map(x=>x.v),lo=Math.min(0,...vs),hi=Math.max(0,...vs),rg=hi-lo||1;
  const X=m=>Lm+(W-Lm-Rm)*m/mx,Y=v=>T+(H-T-Bm)*(hi-v)/rg;
  const s=sv("svg",{viewBox:`0 0 ${W} ${H}`,role:"img"});s.setAttribute("aria-label","Trésorerie cumulée");s.style.color="var(--muted)";
  s.append(sv("line",{x1:Lm,x2:W-Rm,y1:Y(0),y2:Y(0),stroke:"currentColor","stroke-width":1}));
  [lo,hi].forEach(v=>{const t=sv("text",{x:Lm-6,y:Y(v)+4,"font-size":11,"text-anchor":"end",fill:"currentColor","font-family":"sans-serif"},(v/1e6).toLocaleString("fr-FR",{maximumFractionDigits:1})+" M");t.setAttribute("data-notr","");s.append(t)});
  const st=mx>72?12:6;for(let m=0;m<=mx;m+=st){const t=sv("text",{x:X(m),y:H-8,"font-size":11,"text-anchor":"middle",fill:"currentColor","font-family":"sans-serif"},String(m));t.setAttribute("data-notr","");s.append(t)}
  s.append(sv("path",{d:pts.map((p,i)=>(i?"L":"M")+X(p.m).toFixed(1)+" "+Y(p.v).toFixed(1)).join(""),fill:"none",stroke:"#1b2e4c","stroke-width":2.5}));
  if(r.payback!=null){const x=X(r.payback);s.append(sv("line",{x1:x,x2:x,y1:T,y2:H-Bm,stroke:"#3b7520","stroke-width":1.5,"stroke-dasharray":"4 3"}))}
  return s}

/* ================= écran ================= */
let ov=null;
function open(){if(ov){ov.remove();ov=null}
  ov=el("div","sim-ov");ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");
  const top=el("div","sim-top"),bk=el("button","back","‹ Retour");bk.type="button";bk.onclick=close;
  const h=el("h2");h.append(notr(el("span","pro-badge","PRO")),document.createTextNode("Simulation d'un projet"));top.append(bk,h);
  const wrap=el("div","sim-wrap");ov.append(top,wrap);document.body.append(ov);document.body.style.overflow="hidden";
  if(!isPro()){const c=el("section","card");if(window.B2A_PRO&&window.B2A_PRO.lockCard)window.B2A_PRO.lockCard(c,"simulation");else c.append(el("p","note","La version Pro demande une connexion internet et un compte (inscription)."));wrap.append(c);bk.focus();return}
  form(wrap);bk.focus()}
function close(){if(ov){ov.remove();ov=null;document.body.style.overflow=""}}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&ov)close()});

function field(lbl,input,help){const f=el("div","field");const id="sim-"+Math.random().toString(36).slice(2,8);input.id=id;const l=el("label",null,lbl);l.htmlFor=id;f.append(l,input);if(help)f.append(el("small",null,help));return f}
function numIn(v,step){const i=el("input");i.type="number";i.inputMode="decimal";i.min="0";if(step)i.step=step;i.value=v==null?"":String(v);return i}
function selIn(opts,v){const s=el("select");opts.forEach(([k,lb,grp])=>{const o=el("option",null,lb);o.value=k;if(grp)o.dataset.g=grp;s.append(o)});s.value=v;return s}

function form(wrap){
  const cIn=el("section","card");cIn.append(el("h2","sec","Votre projet"),el("p","note","Choisissez le projet et sa taille : l'application calcule tout, du terrain jusqu'aux premières ventes."));
  /* type */
  const ty=el("select");[["Élevage",ELV],["Culture",CUL]].forEach(([g,obj])=>{const og=el("optgroup");og.label=g;Object.entries(obj).forEach(([k,v])=>{const o=el("option",null,v.nom);o.value=k;og.append(o)});ty.append(og)});ty.value=st.type;
  const nIn=numIn(st.n||base().def,isCul(st.type)?"0.5":"1");
  const nF=field(isCul(st.type)?"Surface à cultiver (hectares)":"Nombre d'animaux au départ",nIn);
  const g1=el("div","grid2");g1.append(field("Type de projet",ty),nF);
  /* niveau */
  const nivB=el("div","seg3");nivB.setAttribute("role","group");nivB.setAttribute("aria-label","Niveau de construction");
  Object.entries(NIV).forEach(([k,v])=>{const b=el("button",null,v.lbl);b.type="button";b.setAttribute("aria-pressed",st.niv===k);b.onclick=()=>{st.niv=k;nivB.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x===b));upd()};nivB.append(b)});
  const nivF=el("div","field");nivF.append(el("label",null,"Niveau de construction"),nivB,el("small",null,"Traditionnel : banco et tôle. Semi-moderne : parpaings, grillage et tôle. Moderne : charpente métallique et isolation."));
  const eau=selIn(Object.entries(EAU).map(([k,v])=>[k,v.lbl]),st.eau),elec=selIn(Object.entries(ELEC).map(([k,v])=>[k,v.lbl]),st.elec);
  const g2=el("div","grid2");g2.append(field("Eau",eau),field("Électricité",elec));
  const own=el("input");own.type="checkbox";own.checked=!!st.terrainOk;const ownL=el("label","chk");ownL.append(own,el("span",null,"J'ai déjà le terrain"));
  const pT=numIn(st.pTerrain,"100");const pTF=field("Prix du terrain (F par m²)",pT,"Zone autour de la ville : souvent entre 1 000 et 5 000 F le m². En zone rurale : bien moins cher.");
  cIn.append(g1,nivF,g2,ownL,pTF);
  /* hypothèses */
  const hyp=el("details","card");const sm=el("summary");sm.append(el("b",null,"Prix et rendements (modifiables)"));hyp.append(sm);const hg=el("div","sim-hyp");hyp.append(hg,el("p","note","Prix moyens au Burkina Faso : remplacez-les par ceux de votre zone pour un calcul exact."));
  const reset=el("button","btn small ghost","Remettre les prix de départ");reset.type="button";hyp.append(reset);
  const out=el("div");out.setAttribute("aria-live","polite");
  wrap.append(cIn,hyp,out);
  function hypFields(){hg.innerHTML="";const p=P(),o=st.over[st.type]=st.over[st.type]||{};
    const list=isCul(st.type)?[["rend","Rendement (kg par hectare)"],["prix","Prix de vente (F par kg)"],["semence","Semences (F par hectare)"],["engrais","Engrais (F par hectare)"],["phyto","Traitements (F par hectare)"],["mo","Main-d'œuvre (F par hectare)"]]
      :[["achat",ELV[st.type].fish?"Prix d'un alevin (F)":"Prix d'achat d'un animal (F)"],["vente",ELV[st.type].venteLbl+" (F)"],["pAlim","Prix de l'aliment (F par kg)"],["alim","Aliment par animal et par bande (kg)"],["mort","Pertes (%)"],["cycle","Durée d'une bande (mois)"]];
    list.forEach(([k,lb])=>{const i=numIn(p[k],"any");i.oninput=()=>{const v=Number(String(i.value).replace(",","."));if(i.value===""||!isFinite(v))delete o[k];else o[k]=v;upd()};hg.append(field(lb,i))});
    if(!isCul(st.type)){const i=numIn(st.salaire,"1000");i.oninput=()=>{st.salaire=Number(i.value)||SALAIRE;upd()};hg.append(field("Salaire d'un ouvrier (F par mois)",i))}}
  reset.onclick=()=>{delete st.over[st.type];st.salaire=SALAIRE;hypFields();upd()};
  ty.onchange=()=>{const was=isCul(st.type);st.type=ty.value;st.n=base().def;const c=isCul(st.type);if(was!==c){st.pTerrain=c?PT_C:PT_E;pT.value=String(st.pTerrain)}st.eau=c?(base().irrig?"forage":"aucun"):"forage";st.elec=c?"aucune":"solaire";eau.value=st.eau;elec.value=st.elec;nIn.value=String(st.n);nIn.step=isCul(st.type)?"0.5":"1";nF.querySelector("label").textContent=isCul(st.type)?"Surface à cultiver (hectares)":"Nombre d'animaux au départ";hypFields();upd()};
  nIn.oninput=()=>{const v=Number(String(nIn.value).replace(",","."));st.n=v>0?v:null;upd()};
  eau.onchange=()=>{st.eau=eau.value;upd()};elec.onchange=()=>{st.elec=elec.value;upd()};
  own.onchange=()=>{st.terrainOk=own.checked;pTF.hidden=own.checked;upd()};pTF.hidden=!!st.terrainOk;
  pT.oninput=()=>{st.pTerrain=Number(pT.value)||0;upd()};
  let tm=null;function upd(){save();clearTimeout(tm);tm=setTimeout(()=>results(out),120)}
  hypFields();results(out)}

function kpi(lbl,v,neg){const d=el("div",neg?"neg":null);d.append(el("small",null,lbl),notr(el("b",null,v)));return d}
function tableRows(rows,totalLbl,total){const t=el("table","sim-t");rows.forEach(r=>{const tr_=el("tr");const a=el("td");a.append(el("span",null,r.lbl));if(r.det)a.append(el("small",null,r.det));const b=notr(el("td","n",F(r.v)));tr_.append(a,b);t.append(tr_)});
  if(totalLbl){const tt=el("tr","tot");tt.append(el("td",null,totalLbl),notr(el("td","n",F(total))));t.append(tt)}return t}
const moisTxt=m=>m==null?null:m<24?`${fmt(Math.ceil(m))} ${tr("mois")}`:`${fmt(m/12,1)} ${tr("ans")}`;

function results(out){out.innerHTML="";let r;try{r=calc()}catch(e){console.warn(e);out.append(el("p","msg err","Calcul impossible avec ces chiffres. Vérifiez les valeurs saisies."));return}
  /* résumé */
  const k=el("div","sim-kpi");k.append(kpi("Investissement total",F(r.total)),kpi("Résultat net par an",F(r.netAn),r.netAn<0),kpi("Argent récupéré après",r.payback!=null?moisTxt(r.payback):tr(r.margeAn>0?"Plus de 15 ans":"Pas rentable"),r.payback==null),kpi("Surface du terrain",r.surfTerrain>=10000?`${fmt(r.surfTerrain/10000,2)} ha`:`${fmt(r.surfTerrain)} m²`));
  out.append(k);
  if(r.netAn<0)out.append(el("p","msg err","Avec ces prix, le projet perd de l'argent chaque année. Essayez une autre taille, un niveau de construction plus simple ou d'autres prix de vente."));
  /* plan */
  const cP=el("section","card sim-plan");cP.append(el("h2","sec","Plan de construction"));cP.append(planSVG(r));
  const tb=el("table","sim-t");
  const row=(a,b,c,cN)=>{const x=el("tr");const t1=el("td");t1.append(el("span",null,a));if(c)t1.append(cN?notr(el("small",null,c)):el("small",null,c));x.append(t1,notr(el("td","n",b)));tb.append(x)};
  r.bats.forEach(b=>row(b.nom,`${b.parc?"":(b.n>1?"1–"+b.n:"1")+" · "}${b.n} × ${fmt(b.L)} m × ${fmt(b.W)} m = ${fmt(b.s)} m²`,b.parc?null:r.p.fish?"Profondeur d'eau : 1 à 1,2 m":"Axe long orienté est-ouest, contre le soleil"));
  r.annexes.forEach(a=>row(a.nom,`${a.c} · ${fmt(a.L)} m × ${fmt(a.W)} m = ${fmt(a.L*a.W)} m²`));
  if(r.cul)row("Champ",`${fmt(r.N,1)} ha = ${fmt(r.N*10000)} m²`);
  row("Terrain clôturé",`${fmt(r.plotW)} m × ${fmt(r.plotD)} m = ${fmt(r.surfTerrain)} m²`,`${tr("Longueur de clôture")} : ${fmt(r.perim)} m`,true);
  cP.append(tb);
  const tips=r.cul?["Placez le magasin près de l'entrée et de la piste, à l'abri de l'eau.","Gardez un couloir de 4 à 5 m autour du champ pour le passage et le feu de brousse."]
    :r.p.fish?["Bassins à l'ombre partielle, près du point d'eau, avec une pente pour vider l'eau.","Gardez 4 m entre les bassins pour le passage et les filets."]
    :["Gardez 15 m entre deux bâtiments et un pédiluve à l'entrée de chacun (biosécurité).","Magasin et bureau près de l'entrée : les visiteurs n'entrent pas dans la zone des animaux."];
  const ul=el("ul","note");tips.forEach(t=>ul.append(el("li",null,t)));cP.append(ul);
  out.append(cP);
  /* dépenses */
  const cI=el("section","card");cI.append(el("h2","sec","Dépenses de départ"),el("p","note","Tout l'argent à prévoir, du terrain jusqu'aux premières ventes."));
  cI.append(tableRows(r.inv.filter(x=>x.v>0||x.det),"Total à prévoir",r.total));out.append(cI);
  /* fonctionnement */
  const cA=el("section","card");cA.append(el("h2","sec","Fonctionnement par an"),el("p","note",r.p.verger?"Quand le verger produit à plein (vers la 7e année).":"Quand l'élevage ou la culture tourne à plein régime."));
  const rowsA=r.an.slice();
  const t2=tableRows(rowsA.slice(0,1),null);const t3=tableRows(rowsA.slice(1),"Total des charges",r.chargesAn);
  const t4=el("table","sim-t");[["Marge avant amortissement",r.margeAn],["Amortissement (usure des bâtiments et du matériel)",-r.amort],["Résultat net par an",r.netAn]].forEach(([a,v],i)=>{const x=el("tr",i===2?"tot":null);x.append(el("td",null,a),notr(el("td","n",F(v))));t4.append(x)});
  cA.append(t2,el("h3","sec","Charges"),t3,t4);
  if(!r.cul)cA.append(notr(el("p","note",`${tr("Bandes par an")} : ${fmt(r.cyc,1)} · ${tr("Ouvriers")} : ${r.nOuv}`)));
  out.append(cA);
  /* trésorerie */
  const cC=el("section","card sim-cash");cC.append(el("h2","sec","Trésorerie mois par mois"),el("p","note","Argent cumulé depuis le début du projet (en millions de F) : la courbe repasse au-dessus de zéro quand l'investissement est remboursé."));
  const cs=cashSVG(r);if(cs)cC.append(cs);cC.append(el("p","note","Mois depuis le début du projet"));out.append(cC);
  /* étapes */
  const cE=el("section","card");cE.append(el("h2","sec","Étapes du projet"));const ol=el("ol","sim-steps");
  r.et.forEach(x=>{const li=el("li");const when=x.a!=null&&Math.ceil(x.a)>Math.floor(x.de)+1?`${tr("Mois")} ${fmt(Math.floor(x.de)+1)}–${fmt(Math.ceil(x.a))}`:`${tr("Mois")} ${fmt(Math.floor(x.de)+1)}`;li.append(notr(el("b",null,when)),el("span",null,x.lbl));ol.append(li)});
  cE.append(ol);out.append(cE);
  /* actions */
  const act=el("div","sim-actions");const sh=el("button","btn","Partager le résumé");sh.type="button";sh.onclick=()=>share(r);
  const dl=el("button","btn ghost","Télécharger le détail (CSV)");dl.type="button";dl.onclick=()=>csv(r);
  act.append(sh,dl);out.append(act,el("p","note","Simulation indicative : demandez des devis aux artisans et aux fournisseurs avant d'investir."));
}
function summary(r){const L=[`B2A Smart Farming — ${tr("Simulation d'un projet")}`,`${tr(r.p.nom)} : ${fmt(r.N,r.cul?1:0)} ${r.cul?"ha":tr(r.p.u)} · ${tr(NIV[st.niv].lbl)}`,"",
  `${tr("Investissement total")} : ${F(r.total)}`,`${tr("Résultat net par an")} : ${F(r.netAn)}`,`${tr("Argent récupéré après")} : ${r.payback!=null?moisTxt(r.payback):tr(r.margeAn>0?"Plus de 15 ans":"Pas rentable")}`,`${tr("Surface du terrain")} : ${fmt(r.surfTerrain)} m² (${fmt(r.plotW)} × ${fmt(r.plotD)} m)`,"",
  tr("Dépenses de départ")+" :",...r.inv.filter(x=>x.v>0).map(x=>`- ${tr(x.lbl)} : ${F(x.v)}`),"",tr("Bâtiments")+" :",...r.bats.concat(r.annexes.map(a=>({nom:a.nom,n:1,L:a.L,W:a.W,s:a.L*a.W}))).map(b=>`- ${tr(b.nom)} : ${b.n} × ${fmt(b.L)} × ${fmt(b.W)} m = ${fmt(b.s)} m²`)];return L.join("\n")}
async function share(r){const t=summary(r);try{if(navigator.share){await navigator.share({title:"B2A Smart Farming",text:t});return}}catch(e){if(e&&e.name==="AbortError")return}
  location.href="https://wa.me/?text="+encodeURIComponent(t)}
async function csv(r){const sep=";",esc=v=>{const t=v==null?"":String(v);return /[;"\n]/.test(t)?'"'+t.replace(/"/g,'""')+'"':t};
  const L=[[tr("Rubrique"),tr("Détail"),tr("Montant (F CFA)")]];
  r.inv.forEach(x=>L.push([tr("Dépenses de départ"),tr(x.lbl),Math.round(x.v)]));L.push([tr("Dépenses de départ"),tr("Total à prévoir"),Math.round(r.total)]);
  r.an.forEach(x=>L.push([tr("Fonctionnement par an"),tr(x.lbl),x.v]));L.push([tr("Fonctionnement par an"),tr("Résultat net par an"),Math.round(r.netAn)]);
  r.bats.concat(r.annexes.map(a=>({nom:a.nom,n:1,L:a.L,W:a.W,s:a.L*a.W}))).forEach(b=>L.push([tr("Bâtiments"),`${tr(b.nom)} (${b.n} × ${b.L} × ${b.W} m)`,`${b.s} m²`]));
  L.push([tr("Surface du terrain"),`${r.plotW} × ${r.plotD} m`,`${r.surfTerrain} m²`]);
  const blob=new Blob(["﻿"+L.map(x=>x.map(esc).join(sep)).join("\r\n")],{type:"text/csv;charset=utf-8"});
  const dl=await claude.use("downloads");if(dl)dl.save({filename:"simulation-"+st.type+".csv",data:blob})}

/* ================= carte sur l'accueil ================= */
function homeCard(){if($("sim-home"))return;const lots=$("lots");const host=lots&&lots.closest("section");if(!host)return;
  const c=el("section","card cam-card");c.id="sim-home";const r=el("div","cam-row");const ic=el("span","cam-ico");ic.setAttribute("aria-hidden","true");
  ic.innerHTML='<svg viewBox="0 0 24 24"><path d="M3 21h18"/><path d="M5 21V10l7-5 7 5v11"/><path d="M9 21v-6h6v6"/><path d="M16 3h5v5"/></svg>';
  const tx=el("div","cam-txt");const h=el("h2","sec");h.append(notr(el("span","pro-badge","PRO")),document.createTextNode("Simuler un projet"));
  tx.append(h,el("p",null,"Avant d'investir : toutes les dépenses du début à la fin, les bâtiments, la surface du terrain et le plan de construction."));
  const b=el("button","btn","Faire une simulation");b.type="button";b.onclick=open;r.append(ic,tx);c.append(r,b);host.after(c)}
homeCard();setTimeout(homeCard,1500);
window.B2A_SIM={open,calc:()=>calc(),state:()=>st};

/* ================= traductions (anglais, italien, espagnol) ================= */
const T={
"Simuler un projet":["Simulate a project","Simula un progetto","Simular un proyecto"],
"Simulation d'un projet":["Project simulation","Simulazione di un progetto","Simulación de un proyecto"],
"Avant d'investir : toutes les dépenses du début à la fin, les bâtiments, la surface du terrain et le plan de construction.":["Before investing: every cost from start to finish, the buildings, the land area and the building plan.","Prima di investire: tutte le spese dall'inizio alla fine, gli edifici, la superficie del terreno e il piano di costruzione.","Antes de invertir: todos los gastos de principio a fin, los edificios, la superficie del terreno y el plano de construcción."],
"Faire une simulation":["Run a simulation","Fai una simulazione","Hacer una simulación"],
"‹ Retour":["‹ Back","‹ Indietro","‹ Volver"],
"Votre projet":["Your project","Il tuo progetto","Su proyecto"],
"Choisissez le projet et sa taille : l'application calcule tout, du terrain jusqu'aux premières ventes.":["Choose the project and its size: the app calculates everything, from the land to the first sales.","Scegli il progetto e la sua dimensione: l'app calcola tutto, dal terreno alle prime vendite.","Elija el proyecto y su tamaño: la aplicación lo calcula todo, del terreno a las primeras ventas."],
"Élevage":["Livestock","Allevamento","Ganadería"],"Culture":["Crops","Coltivazione","Cultivo"],
"Type de projet":["Project type","Tipo di progetto","Tipo de proyecto"],
"Nombre d'animaux au départ":["Number of animals at start","Numero di animali all'inizio","Número de animales al inicio"],
"Surface à cultiver (hectares)":["Area to farm (hectares)","Superficie da coltivare (ettari)","Superficie a cultivar (hectáreas)"],
"Niveau de construction":["Construction level","Livello di costruzione","Nivel de construcción"],
"Traditionnel":["Traditional","Tradizionale","Tradicional"],"Semi-moderne":["Semi-modern","Semi-moderno","Semimoderno"],"Moderne":["Modern","Moderno","Moderno"],
"Traditionnel : banco et tôle. Semi-moderne : parpaings, grillage et tôle. Moderne : charpente métallique et isolation.":["Traditional: mud brick and metal sheets. Semi-modern: concrete blocks, wire mesh and metal sheets. Modern: steel frame and insulation.","Tradizionale: mattoni di fango e lamiera. Semi-moderno: blocchi di cemento, rete e lamiera. Moderno: struttura in acciaio e isolamento.","Tradicional: adobe y chapa. Semimoderno: bloques de hormigón, malla y chapa. Moderno: estructura metálica y aislamiento."],
"Eau":["Water","Acqua","Agua"],"Électricité":["Electricity","Elettricità","Electricidad"],
"Forage avec pompe solaire":["Borehole with solar pump","Pozzo trivellato con pompa solare","Pozo perforado con bomba solar"],
"Branchement au réseau d'eau":["Water mains connection","Allacciamento alla rete idrica","Conexión a la red de agua"],
"Puits busé avec pompe":["Lined well with pump","Pozzo rivestito con pompa","Pozo revestido con bomba"],
"Kit solaire":["Solar kit","Kit solare","Kit solar"],
"Branchement au réseau électrique":["Power grid connection","Allacciamento alla rete elettrica","Conexión a la red eléctrica"],
"Pas d'électricité":["No electricity","Nessuna elettricità","Sin electricidad"],
"J'ai déjà le terrain":["I already own the land","Ho già il terreno","Ya tengo el terreno"],
"Prix du terrain (F par m²)":["Land price (F per m²)","Prezzo del terreno (F al m²)","Precio del terreno (F por m²)"],
"Zone autour de la ville : souvent entre {0} et {1} F le m².":["Area around the city: often between {0} and {1} F per m².","Zona intorno alla città: spesso tra {0} e {1} F al m².","Zona alrededor de la ciudad: a menudo entre {0} y {1} F el m²."],
"En zone rurale : bien moins cher.":["In rural areas: much cheaper.","In zona rurale: molto meno caro.","En zona rural: mucho más barato."],
"Prix et rendements (modifiables)":["Prices and yields (editable)","Prezzi e rese (modificabili)","Precios y rendimientos (modificables)"],
"Prix moyens au Burkina Faso : remplacez-les par ceux de votre zone pour un calcul exact.":["Average prices in Burkina Faso: replace them with those of your area for an exact calculation.","Prezzi medi in Burkina Faso: sostituiscili con quelli della tua zona per un calcolo esatto.","Precios medios en Burkina Faso: sustitúyalos por los de su zona para un cálculo exacto."],
"Remettre les prix de départ":["Reset the default prices","Ripristina i prezzi iniziali","Restablecer los precios iniciales"],
"Rendement (kg par hectare)":["Yield (kg per hectare)","Resa (kg per ettaro)","Rendimiento (kg por hectárea)"],
"Prix de vente (F par kg)":["Selling price (F per kg)","Prezzo di vendita (F al kg)","Precio de venta (F por kg)"],
"Semences (F par hectare)":["Seeds (F per hectare)","Sementi (F per ettaro)","Semillas (F por hectárea)"],
"Engrais (F par hectare)":["Fertiliser (F per hectare)","Concimi (F per ettaro)","Abonos (F por hectárea)"],
"Traitements (F par hectare)":["Crop protection (F per hectare)","Trattamenti (F per ettaro)","Tratamientos (F por hectárea)"],
"Main-d'œuvre (F par hectare)":["Labour (F per hectare)","Manodopera (F per ettaro)","Mano de obra (F por hectárea)"],
"Prix d'un alevin (F)":["Price of a fingerling (F)","Prezzo di un avannotto (F)","Precio de un alevín (F)"],
"Prix d'achat d'un animal (F)":["Purchase price of an animal (F)","Prezzo d'acquisto di un animale (F)","Precio de compra de un animal (F)"],
"Prix de l'aliment (F par kg)":["Feed price (F per kg)","Prezzo del mangime (F al kg)","Precio del pienso (F por kg)"],
"Aliment par animal et par bande (kg)":["Feed per animal per batch (kg)","Mangime per animale e per ciclo (kg)","Pienso por animal y por lote (kg)"],
"Pertes (%)":["Losses (%)","Perdite (%)","Pérdidas (%)"],
"Durée d'une bande (mois)":["Batch duration (months)","Durata di un ciclo (mesi)","Duración de un lote (meses)"],
"Salaire d'un ouvrier (F par mois)":["Worker's wage (F per month)","Stipendio di un operaio (F al mese)","Salario de un obrero (F por mes)"],
"Œufs et poules de réforme par poule (F)":["Eggs and spent hens per hen (F)","Uova e galline a fine carriera per gallina (F)","Huevos y gallinas de desecho por gallina (F)"],
"Prix de vente d'un poulet (F)":["Selling price of a chicken (F)","Prezzo di vendita di un pollo (F)","Precio de venta de un pollo (F)"],
"Prix de vente d'un sujet (F)":["Selling price of a bird (F)","Prezzo di vendita di un capo (F)","Precio de venta de un ave (F)"],
"Prix de vente d'un porc (F)":["Selling price of a pig (F)","Prezzo di vendita di un maiale (F)","Precio de venta de un cerdo (F)"],
"Prix de vente d'un mouton (F)":["Selling price of a sheep (F)","Prezzo di vendita di una pecora (F)","Precio de venta de una oveja (F)"],
"Prix de vente d'un bœuf (F)":["Selling price of a steer (F)","Prezzo di vendita di un bue (F)","Precio de venta de un buey (F)"],
"Lait et veau par vache et par an (F)":["Milk and calf per cow per year (F)","Latte e vitello per vacca e per anno (F)","Leche y ternero por vaca y por año (F)"],
"Prix de vente d'un poisson (F)":["Selling price of a fish (F)","Prezzo di vendita di un pesce (F)","Precio de venta de un pez (F)"],
"Poules pondeuses":["Laying hens","Galline ovaiole","Gallinas ponedoras"],"Poulets de chair":["Broilers","Polli da carne","Pollos de engorde"],
"Poulets locaux et pintades":["Local chickens and guinea fowl","Polli locali e faraone","Pollos locales y pintadas"],
"Porcs à l'engraissement":["Fattening pigs","Suini all'ingrasso","Cerdos de engorde"],"Embouche ovine (moutons)":["Sheep fattening","Ingrasso ovino (pecore)","Engorde ovino (ovejas)"],
"Embouche bovine":["Cattle fattening","Ingrasso bovino","Engorde bovino"],"Vaches laitières":["Dairy cows","Vacche da latte","Vacas lecheras"],
"Pisciculture : tilapia":["Fish farming: tilapia","Piscicoltura: tilapia","Piscicultura: tilapia"],"Pisciculture : clarias (silure)":["Fish farming: clarias (catfish)","Piscicoltura: clarias (pesce gatto)","Piscicultura: clarias (bagre)"],
"Maïs":["Maize","Mais","Maíz"],"Sorgho":["Sorghum","Sorgo","Sorgo"],"Riz irrigué":["Irrigated rice","Riso irrigato","Arroz de regadío"],"Soja":["Soybean","Soia","Soja"],"Arachide":["Groundnut","Arachide","Cacahuete"],
"Oignon (maraîchage)":["Onion (market gardening)","Cipolla (orticoltura)","Cebolla (horticultura)"],"Tomate (maraîchage)":["Tomato (market gardening)","Pomodoro (orticoltura)","Tomate (horticultura)"],"Anacarde (verger)":["Cashew (orchard)","Anacardio (frutteto)","Anacardo (huerto)"],
"poules":["hens","galline","gallinas"],"cailles":["quails","quaglie","codornices"],"Cailles pondeuses":["Laying quails","Quaglie ovaiole","Codornices ponedoras"],"Cailles de chair":["Meat quails","Quaglie da carne","Codornices de engorde"],"Œufs et cailles de réforme par caille (F)":["Eggs and spent quails per quail (F)","Uova e quaglie a fine carriera per quaglia (F)","Huevos y codornices de desecho por codorniz (F)"],"Prix de vente d'une caille (F)":["Selling price of a quail (F)","Prezzo di vendita di una quaglia (F)","Precio de venta de una codorniz (F)"],"poulets":["chickens","polli","pollos"],"sujets":["birds","capi","aves"],"porcs":["pigs","maiali","cerdos"],"moutons":["sheep","pecore","ovejas"],"bœufs":["steers","buoi","bueyes"],"vaches":["cows","vacche","vacas"],"alevins":["fingerlings","avannotti","alevines"],
"Poulailler":["Poultry house","Pollaio","Gallinero"],"Porcherie":["Pigsty","Porcilaia","Porqueriza"],"Bergerie":["Sheep pen","Ovile","Aprisco"],"Étable":["Cattle shed","Stalla","Establo"],"Bassin":["Pond","Vasca","Estanque"],
"Parc d'exercice (clôturé)":["Fenced exercise yard","Recinto esterno (recintato)","Corral de ejercicio (vallado)"],
"Magasin d'aliment et de matériel":["Feed and equipment store","Magazzino mangime e materiale","Almacén de pienso y material"],
"Bureau et vestiaire":["Office and changing room","Ufficio e spogliatoio","Oficina y vestuario"],
"Logement du gardien":["Guard's house","Alloggio del custode","Vivienda del guarda"],
"Magasin de stockage":["Storage warehouse","Magazzino di stoccaggio","Almacén"],
"Abri du matériel et des intrants":["Shelter for tools and inputs","Riparo per attrezzi e input","Cobertizo de material e insumos"],
"Terrain":["Land","Terreno","Terreno"],"Déjà possédé":["Already owned","Già posseduto","Ya en propiedad"],
"Démarches, papiers du terrain et plan":["Paperwork, land documents and plan","Pratiche, documenti del terreno e progetto","Trámites, papeles del terreno y plano"],
"Clôture et portail":["Fence and gate","Recinzione e cancello","Valla y portón"],
"Bassins":["Ponds","Vasche","Estanques"],"Bâtiments d'élevage":["Livestock buildings","Edifici d'allevamento","Edificios ganaderos"],
"Magasin, bureau et logement du gardien":["Store, office and guard's house","Magazzino, ufficio e alloggio del custode","Almacén, oficina y vivienda del guarda"],
"Matériel (filets, aérateur, balances)":["Equipment (nets, aerator, scales)","Materiale (reti, aeratore, bilance)","Material (redes, aireador, básculas)"],
"Équipements (mangeoires, abreuvoirs, éclairage…)":["Equipment (feeders, drinkers, lighting…)","Attrezzature (mangiatoie, abbeveratoi, illuminazione…)","Equipos (comederos, bebederos, iluminación…)"],
"Alevins de départ":["Starting fingerlings","Avannotti iniziali","Alevines iniciales"],"Animaux de départ":["Starting animals","Animali iniziali","Animales iniciales"],
"Magasin, abri et logement du gardien":["Store, shelter and guard's house","Magazzino, riparo e alloggio del custode","Almacén, cobertizo y vivienda del guarda"],
"Irrigation (goutte-à-goutte, motopompe, tuyaux)":["Irrigation (drip, motor pump, pipes)","Irrigazione (goccia a goccia, motopompa, tubi)","Riego (goteo, motobomba, tubos)"],
"Irrigation d'appoint":["Supplementary irrigation","Irrigazione di soccorso","Riego de apoyo"],
"Petit matériel (pulvérisateurs, outils, bâches)":["Small equipment (sprayers, tools, tarpaulins)","Piccola attrezzatura (irroratrici, attrezzi, teloni)","Material pequeño (pulverizadores, herramientas, lonas)"],
"Plants greffés, piquetage et trouaison":["Grafted seedlings, staking and planting holes","Piantine innestate, picchettatura e buche","Plantones injertados, estaquillado y hoyos"],
"Fonds de roulement jusqu'aux premières ventes":["Working capital until the first sales","Capitale circolante fino alle prime vendite","Fondo de maniobra hasta las primeras ventas"],
"Imprévus ({0} %)":["Contingencies ({0}%)","Imprevisti ({0}%)","Imprevistos ({0} %)"],
"Ventes":["Sales","Vendite","Ventas"],"Achat des alevins":["Purchase of fingerlings","Acquisto degli avannotti","Compra de alevines"],
"Achat des animaux (nouvelles bandes)":["Purchase of animals (new batches)","Acquisto degli animali (nuovi cicli)","Compra de animales (nuevos lotes)"],
"Aliment":["Feed","Mangime","Pienso"],"Santé (vaccins, vétérinaire)":["Health (vaccines, vet)","Salute (vaccini, veterinario)","Salud (vacunas, veterinario)"],
"Autres charges (litière, énergie, transport)":["Other costs (litter, energy, transport)","Altri costi (lettiera, energia, trasporto)","Otros gastos (cama, energía, transporte)"],
"Semences":["Seeds","Sementi","Semillas"],"Engrais":["Fertiliser","Concimi","Abonos"],"Produits de traitement":["Crop protection products","Prodotti per i trattamenti","Productos de tratamiento"],
"Préparation du sol":["Soil preparation","Preparazione del terreno","Preparación del suelo"],"Main-d'œuvre des champs":["Field labour","Manodopera nei campi","Mano de obra del campo"],
"Récolte et transport":["Harvest and transport","Raccolta e trasporto","Cosecha y transporte"],"Gardien":["Guard","Custode","Guarda"],
"Main-d'œuvre (ouvriers et gardien)":["Labour (workers and guard)","Manodopera (operai e custode)","Mano de obra (obreros y guarda)"],
"Démarches, terrain, plan et devis des artisans":["Paperwork, land, plan and builders' quotes","Pratiche, terreno, progetto e preventivi degli artigiani","Trámites, terreno, plano y presupuestos de los albañiles"],
"Clôture, point d'eau, magasin et irrigation":["Fence, water point, store and irrigation","Recinzione, punto acqua, magazzino e irrigazione","Valla, punto de agua, almacén y riego"],
"Clôture, point d'eau, électricité et construction":["Fence, water point, electricity and construction","Recinzione, punto acqua, elettricità e costruzione","Valla, punto de agua, electricidad y construcción"],
"Équipement, désinfection et vide sanitaire":["Equipment, disinfection and rest period","Attrezzature, disinfezione e vuoto sanitario","Equipamiento, desinfección y vacío sanitario"],
"Mise en eau et arrivée des alevins":["Filling the ponds and arrival of fingerlings","Riempimento delle vasche e arrivo degli avannotti","Llenado de estanques y llegada de alevines"],
"Arrivée des animaux":["Arrival of the animals","Arrivo degli animali","Llegada de los animales"],
"Plantation des plants greffés":["Planting the grafted seedlings","Messa a dimora delle piantine innestate","Plantación de los plantones injertados"],
"Semis ou repiquage":["Sowing or transplanting","Semina o trapianto","Siembra o trasplante"],
"Première récolte (le verger produit à plein vers la {0}e année)":["First harvest (the orchard reaches full yield around year {0})","Primo raccolto (il frutteto produce a pieno verso il {0}° anno)","Primera cosecha (el huerto produce a pleno hacia el {0}.º año)"],
"Premières ventes":["First sales","Prime vendite","Primeras ventas"],"Bande suivante (rythme de croisière)":["Next batch (cruising speed)","Ciclo successivo (regime normale)","Lote siguiente (ritmo normal)"],
"Investissement total":["Total investment","Investimento totale","Inversión total"],"Résultat net par an":["Net result per year","Risultato netto per anno","Resultado neto por año"],
"Argent récupéré après":["Money recovered after","Denaro recuperato dopo","Dinero recuperado tras"],"Pas rentable":["Not profitable","Non redditizio","No rentable"],"Plus de {0} ans":["More than {0} years","Più di {0} anni","Más de {0} años"],"Pas de point d'eau (culture sous pluie)":["No water point (rain-fed crop)","Nessun punto acqua (coltura in asciutto)","Sin punto de agua (cultivo de secano)"],
"Surface du terrain":["Land area","Superficie del terreno","Superficie del terreno"],"mois":["months","mesi","meses"],"ans":["years","anni","años"],"Mois":["Month","Mese","Mes"],
"Avec ces prix, le projet perd de l'argent chaque année. Essayez une autre taille, un niveau de construction plus simple ou d'autres prix de vente.":["With these prices the project loses money every year. Try another size, a simpler construction level or other selling prices.","Con questi prezzi il progetto perde denaro ogni anno. Prova un'altra dimensione, un livello di costruzione più semplice o altri prezzi di vendita.","Con estos precios el proyecto pierde dinero cada año. Pruebe otro tamaño, un nivel de construcción más sencillo u otros precios de venta."],
"Plan de construction":["Building plan","Piano di costruzione","Plano de construcción"],
"Profondeur d'eau : {0} à {1} m":["Water depth: {0} to {1} m","Profondità dell'acqua: da {0} a {1} m","Profundidad del agua: de {0} a {1} m"],
"Axe long orienté est-ouest, contre le soleil":["Long axis facing east-west, against the sun","Asse lungo orientato est-ovest, contro il sole","Eje largo orientado este-oeste, contra el sol"],
"Champ":["Field","Campo","Campo"],"Terrain clôturé":["Fenced land","Terreno recintato","Terreno vallado"],"Longueur de clôture":["Fence length","Lunghezza della recinzione","Longitud de la valla"],
"Bâtiments":["Buildings","Edifici","Edificios"],"Parc":["Yard","Recinto","Corral"],"Annexes":["Annexes","Annessi","Anexos"],"Entrée":["Entrance","Ingresso","Entrada"],
"Placez le magasin près de l'entrée et de la piste, à l'abri de l'eau.":["Put the store near the entrance and the track, safe from water.","Metti il magazzino vicino all'ingresso e alla pista, al riparo dall'acqua.","Coloque el almacén cerca de la entrada y del camino, protegido del agua."],
"Gardez un couloir de {0} à {1} m autour du champ pour le passage et le feu de brousse.":["Keep a {0} to {1} m strip around the field for access and against bush fires.","Lascia una fascia di {0}-{1} m intorno al campo per il passaggio e contro gli incendi.","Deje un pasillo de {0} a {1} m alrededor del campo para el paso y contra los incendios."],
"Bassins à l'ombre partielle, près du point d'eau, avec une pente pour vider l'eau.":["Ponds in partial shade, near the water point, with a slope to drain them.","Vasche in mezz'ombra, vicino al punto acqua, con una pendenza per svuotarle.","Estanques a media sombra, cerca del punto de agua, con pendiente para vaciarlos."],
"Gardez {0} m entre les bassins pour le passage et les filets.":["Keep {0} m between ponds for access and nets.","Lascia {0} m tra le vasche per il passaggio e le reti.","Deje {0} m entre los estanques para el paso y las redes."],
"Gardez {0} m entre deux bâtiments et un pédiluve à l'entrée de chacun (biosécurité).":["Keep {0} m between two buildings and a footbath at each entrance (biosecurity).","Lascia {0} m tra due edifici e un pediluvio all'ingresso di ciascuno (biosicurezza).","Deje {0} m entre dos edificios y un pediluvio en cada entrada (bioseguridad)."],
"Magasin et bureau près de l'entrée : les visiteurs n'entrent pas dans la zone des animaux.":["Store and office near the entrance: visitors do not enter the animal area.","Magazzino e ufficio vicino all'ingresso: i visitatori non entrano nella zona degli animali.","Almacén y oficina cerca de la entrada: los visitantes no entran en la zona de animales."],
"Dépenses de départ":["Start-up costs","Spese iniziali","Gastos iniciales"],
"Tout l'argent à prévoir, du terrain jusqu'aux premières ventes.":["All the money to plan for, from the land to the first sales.","Tutto il denaro da prevedere, dal terreno alle prime vendite.","Todo el dinero a prever, del terreno a las primeras ventas."],
"Total à prévoir":["Total to plan for","Totale da prevedere","Total a prever"],
"Fonctionnement par an":["Running per year","Gestione per anno","Funcionamiento por año"],
"Quand le verger produit à plein (vers la {0}e année).":["When the orchard is at full yield (around year {0}).","Quando il frutteto produce a pieno (verso il {0}° anno).","Cuando el huerto produce a pleno (hacia el {0}.º año)."],
"Quand l'élevage ou la culture tourne à plein régime.":["When the farm is running at full capacity.","Quando l'allevamento o la coltivazione funziona a pieno regime.","Cuando la granja o el cultivo funciona a pleno rendimiento."],
"Total des charges":["Total costs","Totale dei costi","Total de gastos"],"Charges":["Costs","Costi","Gastos"],
"Marge avant amortissement":["Margin before depreciation","Margine prima dell'ammortamento","Margen antes de amortización"],
"Amortissement (usure des bâtiments et du matériel)":["Depreciation (wear of buildings and equipment)","Ammortamento (usura di edifici e attrezzature)","Amortización (desgaste de edificios y material)"],
"Bandes par an":["Batches per year","Cicli per anno","Lotes por año"],"Ouvriers":["Workers","Operai","Obreros"],
"Trésorerie mois par mois":["Cash flow month by month","Liquidità mese per mese","Tesorería mes a mes"],"Trésorerie cumulée":["Cumulative cash","Liquidità cumulata","Tesorería acumulada"],
"Argent cumulé depuis le début du projet (en millions de F) : la courbe repasse au-dessus de zéro quand l'investissement est remboursé.":["Cumulative money since the start of the project (in millions of F): the curve goes back above zero when the investment is paid back.","Denaro cumulato dall'inizio del progetto (in milioni di F): la curva torna sopra lo zero quando l'investimento è ripagato.","Dinero acumulado desde el inicio del proyecto (en millones de F): la curva vuelve a superar el cero cuando la inversión está amortizada."],
"Mois depuis le début du projet":["Months since the start of the project","Mesi dall'inizio del progetto","Meses desde el inicio del proyecto"],
"Étapes du projet":["Project steps","Fasi del progetto","Etapas del proyecto"],
"Partager le résumé":["Share the summary","Condividi il riepilogo","Compartir el resumen"],"Télécharger le détail (CSV)":["Download the details (CSV)","Scarica il dettaglio (CSV)","Descargar el detalle (CSV)"],
"Simulation indicative : demandez des devis aux artisans et aux fournisseurs avant d'investir.":["Indicative simulation: ask builders and suppliers for quotes before investing.","Simulazione indicativa: chiedi preventivi ad artigiani e fornitori prima di investire.","Simulación orientativa: pida presupuestos a albañiles y proveedores antes de invertir."],
"Calcul impossible avec ces chiffres. Vérifiez les valeurs saisies.":["Cannot calculate with these figures. Check the values entered.","Calcolo impossibile con questi numeri. Controlla i valori inseriti.","Cálculo imposible con estas cifras. Compruebe los valores introducidos."],
"Rubrique":["Section","Voce","Apartado"],"Détail":["Detail","Dettaglio","Detalle"],"Montant (F CFA)":["Amount (F CFA)","Importo (F CFA)","Importe (F CFA)"],
"La version Pro demande une connexion internet et un compte (inscription).":["The Pro version requires an internet connection and an account (sign-up).","La versione Pro richiede una connessione internet e un account (iscrizione).","La versión Pro requiere conexión a internet y una cuenta (registro)."]
};
{const D=window.B2A_DICT=window.B2A_DICT||{};["en","it","es"].forEach((l,i)=>{D[l]=D[l]||{};for(const k in T)if(T[k]&&D[l][k]==null)D[l][k]=T[k][i]})}
})();
