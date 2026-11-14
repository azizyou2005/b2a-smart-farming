(()=>{const IT=localStorage.getItem('b2a-lang')==='it';localStorage.setItem('b2a-last-backup',String(Date.now()));
const d0=new Date();const iso=t=>{const d=new Date(d0.getTime()-t*864e5);return d.toISOString().slice(0,10)};
const lots={L1:{nom:IT?"Ovaiole Capannone A":"Pondeuses Bâtiment A",espece:"Poules pondeuses",race:"ISA Brown",effectif:500,arrivee:iso(140),ageArrivee:18,prixAliment:300,prixOeuf:75,prixKg:null,actif:true,prixSujet:3500,investissement:2500000,chargesMois:60000,ageFin:76,prixFin:2500,stockAliment:1200,createdAt:Date.now()-140*864e5},
 L2:{nom:IT?"Polli da carne Lotto 3":"Poulets de chair Lot 3",espece:"Poulets de chair",race:"Cobb 500",effectif:300,arrivee:iso(25),ageArrivee:1,prixAliment:350,prixKg:1800,actif:true,prixSujet:600,chargesMois:25000,ageFin:7,prixFin:3000,createdAt:Date.now()-25*864e5}};
const saisies={};
for(let i=20;i>=0;i--){const d=iso(i);saisies["L1_"+d]={lotId:"L1",date:d,oeufs:Math.round(430+Math.sin(i)*12+(20-i)*0.6),morts:i%7===0?1:0,alimentKg:58,alimentRecu:i===10?500:null,poidsG:null,note:"",by:"demo",updatedAt:Date.now()};}
for(let i=20;i>=0;i-=2){const d=iso(i);saisies["L2_"+d]={lotId:"L2",date:d,oeufs:null,morts:i%6===0?2:0,alimentKg:Math.round(20+ (20-i)*1.6),alimentRecu:null,poidsG:i%4===0?Math.round(1800-(i*70)):null,note:"",by:"demo",updatedAt:Date.now()};}
const contacts={C1:{nom:IT?"Dott. Ouédraogo (veterinario)":"Dr Ouédraogo (vétérinaire)",tel:"+22670000000",type:"Vétérinaire"}};
const personnel={P1:{nom:"Awa Ouédraogo",poste:"Soigneur / soigneuse",tel:"70112233",embauche:iso(300),membre:null,actif:true,createdAt:1},P2:{nom:"Issa Kaboré",poste:"Gardien",tel:"76445566",embauche:iso(90),membre:null,actif:true,createdAt:2}};
const rh_contrats={P1:{salaire:45000},P2:{salaire:35000}};
const presences={};for(let i=10;i>=1;i--){const d=iso(i);presences[d]={date:d,p:{P1:i===4?"absent":"present",P2:i===2?"retard":"present"},by:"demo"}}
const taches={T1:{titre:"Nourrir les animaux",pid:"P1",date:iso(10),rep:"jour",faits:{[iso(1)]:{par:"Awa",le:1},[iso(2)]:{par:"Awa",le:1}},by:"demo",createdAt:1},T2:{titre:"Nettoyer le bâtiment",pid:"P2",date:iso(7),rep:"semaine",faits:{},by:"demo",createdAt:2}};
const paies={Y1:{pid:"P1",mois:iso(0).slice(0,7),type:"avance",montant:10000,mode:"orange",date:iso(0),depId:null,by:"demo",createdAt:1}};
const evaluations={E1:{pid:"P1",date:iso(40),notes:{ponctualite:3,travail:4,animaux:4,hygiene:3,comportement:5},moyenne:3.8,commentaire:"",by:"demo",createdAt:1},E2:{pid:"P1",date:iso(3),notes:{ponctualite:4,travail:5,animaux:5,hygiene:4,comportement:5},moyenne:4.6,commentaire:"",by:"demo",createdAt:2}};
localStorage.setItem("b2a-farm-data-v1",JSON.stringify({lots,saisies,contacts,personnel,rh_contrats,presences,taches,paies,evaluations}));
localStorage.setItem("b2a-my-name","Aziz");
})();
