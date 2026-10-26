(()=>{const IT=localStorage.getItem('b2a-lang')==='it';localStorage.setItem('b2a-last-backup',String(Date.now()));
const d0=new Date();const iso=t=>{const d=new Date(d0.getTime()-t*864e5);return d.toISOString().slice(0,10)};
const lots={L1:{nom:IT?"Ovaiole Capannone A":"Pondeuses Bâtiment A",espece:"Poules pondeuses",race:"ISA Brown",effectif:500,arrivee:iso(140),ageArrivee:18,prixAliment:300,prixOeuf:75,prixKg:null,actif:true,prixSujet:3500,investissement:2500000,chargesMois:60000,ageFin:76,prixFin:2500,stockAliment:1200,createdAt:Date.now()-140*864e5},
 L2:{nom:IT?"Polli da carne Lotto 3":"Poulets de chair Lot 3",espece:"Poulets de chair",race:"Cobb 500",effectif:300,arrivee:iso(25),ageArrivee:1,prixAliment:350,prixKg:1800,actif:true,prixSujet:600,chargesMois:25000,ageFin:7,prixFin:3000,createdAt:Date.now()-25*864e5}};
const saisies={};
for(let i=20;i>=0;i--){const d=iso(i);saisies["L1_"+d]={lotId:"L1",date:d,oeufs:Math.round(430+Math.sin(i)*12+(20-i)*0.6),morts:i%7===0?1:0,alimentKg:58,alimentRecu:i===10?500:null,poidsG:null,note:"",by:"demo",updatedAt:Date.now()};}
for(let i=20;i>=0;i-=2){const d=iso(i);saisies["L2_"+d]={lotId:"L2",date:d,oeufs:null,morts:i%6===0?2:0,alimentKg:Math.round(20+ (20-i)*1.6),alimentRecu:null,poidsG:i%4===0?Math.round(1800-(i*70)):null,note:"",by:"demo",updatedAt:Date.now()};}
const contacts={C1:{nom:IT?"Dott. Ouédraogo (veterinario)":"Dr Ouédraogo (vétérinaire)",tel:"+22670000000",type:"Vétérinaire"}};
localStorage.setItem("b2a-farm-data-v1",JSON.stringify({lots,saisies,contacts}));
localStorage.setItem("b2a-my-name","Aziz");
})();
