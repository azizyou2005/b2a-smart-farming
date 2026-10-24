/* B2A Smart Farming : couvoir (couveuses, couvées, vente des poussins) */
(function(){const D=window.B2A_DICT=window.B2A_DICT||{};const add=(l,o)=>{D[l]=Object.assign(D[l]||{},o)};
const T={
"Couvoir":["Hatchery","Incubatoio","Incubadora"],
"À faire au couvoir":["Hatchery to-do","Da fare in incubatoio","Tareas de incubación"],
"Couvées":["Batches","Covate","Incubaciones"],
"+ Mettre des œufs":["+ Set eggs","+ Metti uova","+ Poner huevos"],
"En cours":["Running","In corso","En curso"],
"Terminées":["Finished","Terminate","Terminadas"],
"Nouvelle couvée":["New batch","Nuova covata","Nueva incubación"],
"Modifier la couvée":["Edit batch","Modifica covata","Editar incubación"],
"Couveuse":["Incubator","Incubatrice","Incubadora"],
"Espèce":["Species","Specie","Especie"],
"Nombre d'œufs mis":["Eggs set","Uova messe","Huevos puestos"],
"Date de mise en incubation":["Setting date","Data di messa in incubazione","Fecha de puesta en incubación"],
"Origine des œufs (facultatif)":["Egg source (optional)","Origine delle uova (facoltativo)","Origen de los huevos (opcional)"],
"Prix d'un œuf (FCFA, facultatif)":["Price per egg (FCFA, optional)","Prezzo per uovo (FCFA, facoltativo)","Precio por huevo (FCFA, opcional)"],
"Enregistrer la couvée":["Save batch","Salva covata","Guardar incubación"],
"Mes couveuses":["My incubators","Le mie incubatrici","Mis incubadoras"],
"+ Ajouter une couveuse":["+ Add incubator","+ Aggiungi incubatrice","+ Añadir incubadora"],
"Nouvelle couveuse":["New incubator","Nuova incubatrice","Nueva incubadora"],
"Modifier la couveuse":["Edit incubator","Modifica incubatrice","Editar incubadora"],
"Modèle de départ":["Starting model","Modello di partenza","Modelo de partida"],
"Remplit la capacité, les dimensions et la puissance. Corrigez ensuite avec les chiffres de votre appareil.":["Fills in capacity, dimensions and power. Then correct them with your machine's figures.","Compila capacità, dimensioni e potenza. Poi correggi con i dati del tuo apparecchio.","Rellena capacidad, dimensiones y potencia. Luego corrige con los datos de tu aparato."],
"Nom de la couveuse":["Incubator name","Nome dell'incubatrice","Nombre de la incubadora"],
"Type":["Type","Tipo","Tipo"],
"Automatique (retournement et humidité)":["Automatic (turning and humidity)","Automatica (girata e umidità)","Automática (volteo y humedad)"],
"Semi-automatique (retournement auto)":["Semi-automatic (auto turning)","Semiautomatica (girata automatica)","Semiautomática (volteo automático)"],
"Manuelle":["Manual","Manuale","Manual"],
"Automatique":["Automatic","Automatica","Automática"],
"Semi-automatique":["Semi-automatic","Semiautomatica","Semiautomática"],
"Capacité (œufs de poule)":["Capacity (hen eggs)","Capacità (uova di gallina)","Capacidad (huevos de gallina)"],
"Nombre de plateaux":["Number of trays","Numero di vassoi","Número de bandejas"],
"Dimensions extérieures (cm)":["Outside dimensions (cm)","Dimensioni esterne (cm)","Dimensiones exteriores (cm)"],
"Longueur":["Length","Lunghezza","Largo"],"Largeur":["Width","Larghezza","Ancho"],"Hauteur":["Height","Altezza","Alto"],
"Puissance (W)":["Power (W)","Potenza (W)","Potencia (W)"],
"Alimentation":["Power supply","Alimentazione","Alimentación"],
"Secteur (SONABEL)":["Mains (SONABEL)","Rete (SONABEL)","Red (SONABEL)"],
"Secteur + batterie 12 V":["Mains + 12 V battery","Rete + batteria 12 V","Red + batería 12 V"],
"Solaire":["Solar","Solare","Solar"],"Pétrole / gaz":["Kerosene / gas","Petrolio / gas","Queroseno / gas"],
"État":["Status","Stato","Estado"],"En service":["In use","In funzione","En servicio"],"À l'arrêt":["Stopped","Ferma","Parada"],"En panne":["Broken","Guasta","Averiada"],
"Supprimer la couveuse":["Delete incubator","Elimina incubatrice","Eliminar incubadora"],
"Guide des réglages par espèce":["Settings guide by species","Guida alle impostazioni per specie","Guía de ajustes por especie"],
"Durée":["Duration","Durata","Duración"],"Température":["Temperature","Temperatura","Temperatura"],"Humidité":["Humidity","Umidità","Humedad"],"Mirages":["Candling","Speratura","Miraje"],
"Arrêt retournement · humidité":["Stop turning · humidity","Stop girata · umidità","Fin del volteo · humedad"],
"Prix de l'électricité (FCFA par kWh)":["Electricity price (FCFA per kWh)","Prezzo elettricità (FCFA per kWh)","Precio de la electricidad (FCFA por kWh)"],
"Sert à estimer le coût en électricité de chaque couvée.":["Used to estimate the electricity cost of each batch.","Serve a stimare il costo elettrico di ogni covata.","Sirve para estimar el coste eléctrico de cada incubación."],
"Couveuses":["Incubators","Incubatrici","Incubadoras"],"Places occupées":["Places used","Posti occupati","Plazas ocupadas"],
"Éclosions sous 7 jours":["Hatches within 7 days","Schiuse entro 7 giorni","Eclosiones en 7 días"],"Taux d'éclosion":["Hatch rate","Tasso di schiusa","Tasa de eclosión"],
"aucune enregistrée":["none recorded","nessuna registrata","ninguna registrada"],"aucune prévue":["none due","nessuna prevista","ninguna prevista"],"après la première couvée":["after the first batch","dopo la prima covata","tras la primera incubación"],
"Mise en incubation":["Eggs set","Messa in incubazione","Puesta en incubación"],"Premier mirage":["First candling","Prima speratura","Primer miraje"],"Second mirage":["Second candling","Seconda speratura","Segundo miraje"],
"Arrêt du retournement":["Stop turning","Stop alla girata","Fin del volteo"],"Éclosion prévue":["Expected hatch","Schiusa prevista","Eclosión prevista"],"Sortie et nettoyage":["Removal and cleaning","Uscita e pulizia","Salida y limpieza"],
"Retirer les œufs clairs (non fécondés)":["Remove clear (infertile) eggs","Togliere le uova chiare (non fecondate)","Retirar los huevos claros (no fecundados)"],
"Retirer les embryons morts":["Remove dead embryos","Togliere gli embrioni morti","Retirar los embriones muertos"],
"Laisser sécher les poussins dans la couveuse":["Let chicks dry inside the incubator","Lasciare asciugare i pulcini nell'incubatrice","Dejar secar los pollitos en la incubadora"],
"Poussins en poussinière, désinfecter la couveuse":["Chicks to the brooder, disinfect the incubator","Pulcini nella pulcinaia, disinfettare l'incubatrice","Pollitos a la criadora, desinfectar la incubadora"],
"Aujourd'hui":["Today","Oggi","Hoy"],"Demain":["Tomorrow","Domani","Mañana"],"Ouvrir":["Open","Apri","Abrir"],"‹ Fermer":["‹ Close","‹ Chiudi","‹ Cerrar"],
"Rien de prévu dans les 7 prochains jours.":["Nothing due in the next 7 days.","Niente in programma nei prossimi 7 giorni.","Nada previsto en los próximos 7 días."],
"Les mirages, l'arrêt du retournement et les éclosions de vos couvées s'afficheront ici.":["Candling, end of turning and hatch dates of your batches will appear here.","Speratura, stop alla girata e schiuse delle tue covate appariranno qui.","Los mirajes, el fin del volteo y las eclosiones aparecerán aquí."],
"Aucune couvée en cours":["No batch running","Nessuna covata in corso","Ninguna incubación en curso"],"Aucune couvée terminée":["No finished batch","Nessuna covata terminata","Ninguna incubación terminada"],
"Aucune couveuse":["No incubator","Nessuna incubatrice","Ninguna incubadora"],
"Œufs mis":["Eggs set","Uova messe","Huevos puestos"],"Fertiles":["Fertile","Fertili","Fértiles"],"Éclos":["Hatched","Schiuse","Eclosionados"],"Éclos / fertiles":["Hatched / fertile","Schiuse / fertili","Eclosionados / fértiles"],
"Électricité estimée":["Estimated electricity","Elettricità stimata","Electricidad estimada"],"Coût par poussin":["Cost per chick","Costo per pulcino","Coste por pollito"],
"Calendrier de la couvée":["Batch schedule","Calendario della covata","Calendario de la incubación"],"Résultats":["Results","Risultati","Resultados"],
"Œufs clairs au 1er mirage":["Clear eggs at 1st candling","Uova chiare alla 1ª speratura","Huevos claros en el 1er miraje"],"Embryons morts au 2e mirage":["Dead embryos at 2nd candling","Embrioni morti alla 2ª speratura","Embriones muertos en el 2º miraje"],"Poussins éclos":["Chicks hatched","Pulcini nati","Pollitos nacidos"],
"Remarque":["Note","Nota","Nota"],"Enregistrer les résultats":["Save results","Salva risultati","Guardar resultados"],"Clôturer la couvée":["Close batch","Chiudi covata","Cerrar incubación"],"Rouvrir la couvée":["Reopen batch","Riapri covata","Reabrir incubación"],
"Place disponible":["Space available","Posto disponibile","Espacio disponible"],"Couveuse trop pleine":["Incubator too full","Incubatrice troppo piena","Incubadora demasiado llena"],
"Volume":["Volume","Volume","Volumen"],"Par plateau":["Per tray","Per vassoio","Por bandeja"],"Caille / canard":["Quail / duck","Quaglia / anatra","Codorniz / pato"],
"Poule":["Hen","Gallina","Gallina"],"Pintade":["Guinea fowl","Faraona","Pintada"],"Caille":["Quail","Quaglia","Codorniz"],"Canard (commun)":["Duck (common)","Anatra (comune)","Pato (común)"],"Canard de Barbarie":["Muscovy duck","Anatra muta","Pato criollo"],"Dinde":["Turkey","Tacchino","Pavo"],"Oie":["Goose","Oca","Oca"],"Pigeon":["Pigeon","Piccione","Paloma"],
"Modèle personnalisé":["Custom model","Modello personalizzato","Modelo personalizado"],
"très bon":["very good","ottimo","muy bueno"],"correct":["fair","discreto","correcto"],"à améliorer":["needs work","da migliorare","a mejorar"],"Terminée":["Finished","Terminata","Terminada"],"À clôturer":["To close","Da chiudere","Por cerrar"],
"{0} jours":["{0} days","{0} giorni","{0} días"],"J{0} et J{1}":["D{0} and D{1}","G{0} e G{1}","D{0} y D{1}"],
"{0} œufs":["{0} eggs","{0} uova","{0} huevos"],"{0} couvée(s)":["{0} batch(es)","{0} covata/e","{0} incubación(es)"],
"Vente des poussins":["Chick sales","Vendita dei pulcini","Venta de pollitos"],
"Vente et bénéfice des poussins":["Chick sales and profit","Vendita e utile dei pulcini","Venta y beneficio de los pollitos"],
"Prix de vente d'un poussin (FCFA)":["Selling price per chick (FCFA)","Prezzo di vendita per pulcino (FCFA)","Precio de venta por pollito (FCFA)"],
"Taux d'éclosion prévu (%)":["Expected hatch rate (%)","Tasso di schiusa previsto (%)","Tasa de eclosión prevista (%)"],
"Pertes avant la vente (%)":["Losses before sale (%)","Perdite prima della vendita (%)","Pérdidas antes de la venta (%)"],
"Autres frais (FCFA)":["Other costs (FCFA)","Altre spese (FCFA)","Otros gastos (FCFA)"],
"Poussins vendus":["Chicks sold","Pulcini venduti","Pollitos vendidos"],"Montant encaissé (FCFA)":["Amount received (FCFA)","Importo incassato (FCFA)","Importe cobrado (FCFA)"],
"Poussins à vendre":["Chicks to sell","Pulcini da vendere","Pollitos a vender"],"Poussins prévus à vendre":["Chicks expected to sell","Pulcini previsti da vendere","Pollitos previstos a vender"],
"Recette prévue":["Expected revenue","Ricavo previsto","Ingreso previsto"],"Coûts":["Costs","Costi","Costes"],"Bénéfice prévu":["Expected profit","Utile previsto","Beneficio previsto"],
"Bénéfice réalisé":["Actual profit","Utile realizzato","Beneficio real"],"Prix minimum":["Minimum price","Prezzo minimo","Precio mínimo"],"par poussin pour ne pas perdre d'argent":["per chick to break even","per pulcino per non perdere","por pollito para no perder"],
"Scénario":["Scenario","Scenario","Escenario"],"Prudent":["Cautious","Prudente","Prudente"],"Prévu":["Expected","Previsto","Previsto"],"Favorable":["Favourable","Favorevole","Favorable"],
"Éclosion":["Hatch","Schiusa","Eclosión"],"Poussins":["Chicks","Pulcini","Pollitos"],"Recette":["Revenue","Ricavo","Ingreso"],"Bénéfice":["Profit","Utile","Beneficio"],"Couvée":["Batch","Covata","Incubación"],"Total":["Total","Totale","Total"],
"réalisé":["actual","realizzato","real"],"indiquez le prix de vente":["enter the selling price","indica il prezzo di vendita","indica el precio de venta"],
"vaccins, transport, aliment de démarrage":["vaccines, transport, starter feed","vaccini, trasporto, mangime starter","vacunas, transporte, pienso de inicio"],
"Enregistrer":["Save","Salva","Guardar"],
"Monophasé · {0} F":["Single-phase · {0} F","Monofase · {0} F","Monofásico · {0} F"],"Triphasé · {0} F":["Three-phase · {0} F","Trifase · {0} F","Trifásico · {0} F"],"Monophasé + TVA {0} % · {1} F":["Single-phase + VAT {0} % · {1} F","Monofase + IVA {0} % · {1} F","Monofásico + IVA {0} % · {1} F"],"Triphasé + TVA {0} % · {1} F":["Three-phase + VAT {0} % · {1} F","Trifase + IVA {0} % · {1} F","Trifásico + IVA {0} % · {1} F"],
"Valeurs de référence pour couveuse ventilée. Suivez d'abord la notice de votre appareil. J0 = jour de mise en incubation.":["Reference values for forced-air incubators. Follow your machine's manual first. D0 = setting day.","Valori di riferimento per incubatrice ventilata. Segui prima il manuale del tuo apparecchio. G0 = giorno di messa in incubazione.","Valores de referencia para incubadora ventilada. Sigue primero el manual de tu aparato. D0 = día de puesta."]
};
const L=["en","it","es"];Object.entries(T).forEach(([k,v])=>L.forEach((l,i)=>{const o={};o[k]=v[i];add(l,o)}));})();
/* ---------- couvoir : couveuses automatiques et couvées ---------- */
(function(){
const $=id=>document.getElementById(id);
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};
const N=v=>{if(v===""||v==null)return null;const n=Number(String(v).replace(",","."));return isFinite(n)?n:null};
const pad=n=>String(n).padStart(2,"0");
const iso=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const today=()=>iso(new Date());
const addDays=(s,n)=>{const d=new Date(s+"T12:00");d.setDate(d.getDate()+n);return iso(d)};
const daysBetween=(a,b)=>Math.round((new Date(b+"T12:00")-new Date(a+"T12:00"))/864e5);
const fmt=(v,d=0)=>v==null||!isFinite(v)?"—":v.toLocaleString("fr-FR",{maximumFractionDigits:d,minimumFractionDigits:d});
const fdate=s=>new Date(s+"T12:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short"});
const errText=e=>{const c=e&&e.code;return c==="invalid_argument"||c==="permission_denied"?"Vous n'avez pas le droit de modifier ces données (accès en lecture seule).":c==="quota_exceeded"?"Stockage plein : supprimez d'anciennes données.":"Échec de l'enregistrement. Réessayez."};

/* f = nombre d'œufs de l'espèce qui tiennent dans la place d'un œuf de poule */
const SP={
  poule:   {n:"Poule",d:21,t:"37,7",h1:"50–55 %",h2:"65–70 %",m:[7,18],stop:18,f:1,tx:80},
  pintade: {n:"Pintade",d:27,t:"37,5",h1:"50–55 %",h2:"65–70 %",m:[8,24],stop:24,f:1.3,tx:70},
  caille:  {n:"Caille",d:17,t:"37,7",h1:"45–55 %",h2:"65–70 %",m:[6,14],stop:14,f:3.5,tx:70},
  canard:  {n:"Canard (commun)",d:28,t:"37,5",h1:"55–60 %",h2:"70–75 %",m:[8,25],stop:25,f:0.75,tx:70},
  barbarie:{n:"Canard de Barbarie",d:35,t:"37,5",h1:"55–60 %",h2:"70–75 %",m:[10,31],stop:32,f:0.75,tx:70},
  dinde:   {n:"Dinde",d:28,t:"37,5",h1:"50–55 %",h2:"65–70 %",m:[8,25],stop:25,f:0.65,tx:70},
  oie:     {n:"Oie",d:30,t:"37,4",h1:"50–55 %",h2:"70–75 %",m:[9,27],stop:27,f:0.4,tx:60},
  pigeon:  {n:"Pigeon",d:18,t:"37,5",h1:"50–55 %",h2:"65–70 %",m:[5,15],stop:15,f:1.6,tx:75}
};
/* modèles courants (valeurs indicatives) */
const PRESETS=[
  ["",  "Modèle personnalisé",null],
  ["24","Mini 24 œufs",{cap:24,plat:1,L:33,l:31,H:24,W:60}],
  ["56","56 œufs",{cap:56,plat:1,L:44,l:45,H:25,W:80}],
  ["112","112 œufs",{cap:112,plat:2,L:44,l:45,H:48,W:100}],
  ["204","204 œufs",{cap:204,plat:3,L:52,l:50,H:66,W:150}],
  ["352","352 œufs",{cap:352,plat:4,L:62,l:55,H:80,W:200}],
  ["528","528 œufs",{cap:528,plat:6,L:66,l:60,H:100,W:250}],
  ["1056","1 056 œufs",{cap:1056,plat:12,L:90,l:70,H:125,W:400}],
  ["2112","2 112 œufs",{cap:2112,plat:24,L:120,l:85,H:160,W:600}],
  ["5280","5 280 œufs (armoire)",{cap:5280,plat:60,L:160,l:110,H:190,W:1200}],
  ["7040","7 040 œufs (armoire)",{cap:7040,plat:80,L:180,l:120,H:200,W:1500}],
  ["10560","10 560 œufs (industrielle)",{cap:10560,plat:120,L:240,l:150,H:210,W:2500}],
  ["13200","13 200 œufs (industrielle)",{cap:13200,plat:150,L:280,l:160,H:210,W:3000}],
  ["16896","16 896 œufs (industrielle)",{cap:16896,plat:192,L:330,l:170,H:220,W:3500}],
  ["20000","20 000 œufs (industrielle)",{cap:20000,plat:228,L:380,l:180,H:220,W:4000}]
];
const MODE={auto:"Automatique",semi:"Semi-automatique",manuelle:"Manuelle"};
const ETAT={service:["En service","s-ok"],arret:["À l'arrêt","s-none"],panne:["En panne","s-bad"]};

let db=null,canWrite=true,machines=[],batches=[],kwh=null;
/* SONABEL, tarif normal monophasé (B1), tranche au-delà de 200 kWh/mois, hors taxes */
const KWH_DEF=109;const kwP=()=>kwh!=null&&kwh>0?kwh:KWH_DEF;
let bFilter="encours",editM=null,editB=null,openB=null;

const places=b=>{const s=SP[b.espece]||SP.poule;return (Number(b.oeufs)||0)/s.f};
const active=b=>b.statut!=="terminee";
const mach=id=>machines.find(m=>m.id===id);
function used(mid,exceptId){return batches.filter(b=>b.couveuseId===mid&&active(b)&&b.id!==exceptId).reduce((p,b)=>p+places(b),0)}

function events(b){const s=SP[b.espece]||SP.poule,d0=b.debut;
  return [
    [0,"Mise en incubation",`${s.t} °C · humidité ${s.h1}`],
    [s.m[0],"Premier mirage","Retirer les œufs clairs (non fécondés)"],
    [s.m[1],"Second mirage","Retirer les embryons morts"],
    [s.stop,"Arrêt du retournement",`Passer l'humidité à ${s.h2} et ne plus ouvrir`],
    [s.d,"Éclosion prévue","Laisser sécher les poussins dans la couveuse"],
    [s.d+1,"Sortie et nettoyage","Poussins en poussinière, désinfecter la couveuse"]
  ].map(([j,t,x])=>({j,t,x,date:addDays(d0,j)}))}

function dayOf(b){return daysBetween(b.debut,today())}

/* ---------- rendu ---------- */
function tile(lbl,val,sub,cls){const t=el("div","tile"+(cls?" "+cls:""));t.append(el("span",null,lbl),el("b",null,val));if(sub)t.append(el("small",null,sub));return t}

function render(){
  if(!$("v-couvoir"))return;
  const act=batches.filter(active),capTot=machines.filter(m=>m.etat!=="panne").reduce((p,m)=>p+(Number(m.capacite)||0),0);
  const occ=act.reduce((p,b)=>p+places(b),0);
  const soon=act.filter(b=>{const s=SP[b.espece]||SP.poule;const r=s.d-dayOf(b);return r>=0&&r<=7});
  const fin=batches.filter(b=>b.statut==="terminee"&&N(b.eclos)!=null&&Number(b.oeufs)>0);
  const taux=fin.length?fin.reduce((p,b)=>p+Number(b.eclos),0)/fin.reduce((p,b)=>p+Number(b.oeufs),0)*100:null;
  const T=$("cv-tiles");T.innerHTML="";
  T.append(tile("Couveuses",String(machines.length),machines.length?fmt(capTot)+" places disponibles au total":"aucune enregistrée"),
    tile("Places occupées",capTot?fmt(occ/capTot*100)+" %":"—",fmt(occ)+" / "+fmt(capTot)+" œufs de poule",capTot&&occ>capTot?"bad":null),
    tile("Éclosions sous 7 jours",String(soon.reduce((p,b)=>p+(Number(b.oeufs)||0),0)),soon.length?soon.length+" couvée(s)":"aucune prévue"),
    tile("Taux d'éclosion",taux==null?"—":fmt(taux)+" %",fin.length?"sur "+fin.length+" couvée(s) terminée(s)":"après la première couvée",taux==null?null:taux>=75?"ok":taux>=60?"warn":"bad"));
  renderTodo();renderSales();renderBatches();renderMachines();renderGuide();
  if(openB)renderDetail();
}

/* ---------- vente des poussins ---------- */
function histTx(esp){const f=batches.filter(b=>b.espece===esp&&b.statut==="terminee"&&N(b.eclos)!=null&&Number(b.oeufs)>0);
  if(!f.length)return null;return f.reduce((p,b)=>p+Number(b.eclos),0)/f.reduce((p,b)=>p+Number(b.oeufs),0)*100}
function txPrevu(b){const v=N(b.txPrevu);if(v!=null)return v;const h=histTx(b.espece);return h!=null?Math.round(h):(SP[b.espece]||SP.poule).tx}
function costs(b){const s=SP[b.espece]||SP.poule,m=mach(b.couveuseId);const o=Number(b.oeufs)||0;
  const W=m?Number(m.W)||0:0,cap=m?Number(m.capacite)||0:0;const share=cap?Math.min(1,places(b)/cap):1;
  const kw=W*0.5*24*s.d/1000*share;const oeufs=(N(b.coutOeuf)||0)*o,elec=kw*kwP(),frais=N(b.frais)||0;
  return {kw,oeufs,elec,frais,total:oeufs+elec+frais}}
/* tx en %, pertes en % ; renvoie la prévision de vente */
function sale(b,txOverride){const o=Number(b.oeufs)||0,ec=N(b.eclos),c=costs(b),prix=N(b.prixVente)||0,pertes=N(b.pertes)!=null?N(b.pertes):3;
  const tx=txOverride!=null?txOverride:txPrevu(b);const nes=txOverride==null&&ec!=null?ec:o*tx/100;
  const vendables=Math.max(0,Math.floor(nes*(1-pertes/100)));const recette=vendables*prix;
  const vendus=N(b.vendus),enc=N(b.encaisse);const reel=enc!=null?enc:vendus!=null?vendus*prix:null;
  return {nes,vendables,prix,recette,c,benef:recette-c.total,parPoussin:vendables?(recette-c.total)/vendables:null,
    seuil:vendables?c.total/vendables:null,reel,benefReel:reel!=null?reel-c.total:null,vendus,pertes,tx}}
function signCls(v){return v==null?"":v>=0?"pos":"neg"}
function renderSales(){const K=$("cv-skpis"),T=$("cv-stab");if(!K)return;K.innerHTML="";T.innerHTML="";
  const kp=(l,v,sm,cls)=>{const k=el("div","kpi");const bb=el("b",cls||null,v);k.append(el("span",null,l),bb);if(sm)k.append(el("small",null,sm));K.append(k)};
  const act=batches.filter(active),fin=batches.filter(b=>!active(b));
  const sa=act.map(b=>[b,sale(b)]),sf=fin.map(b=>[b,sale(b)]);
  const noPrix=sa.filter(([b])=>!N(b.prixVente)).length;
  const spx=sa.filter(([,x])=>x.prix),bp=spx.reduce((p,[,x])=>p+x.benef,0),npx=spx.reduce((p,[,x])=>p+x.vendables,0),rp=sa.reduce((p,[,x])=>p+x.recette,0),np=sa.reduce((p,[,x])=>p+x.vendables,0);
  const real=sf.filter(([,x])=>x.reel!=null),br=real.reduce((p,[,x])=>p+x.benefReel,0),er=real.reduce((p,[,x])=>p+x.reel,0);
  kp("Poussins à vendre",fmt(np),act.length?act.length+" couvée(s) en cours":"aucune couvée en cours");
  kp("Recette prévue",fmt(rp)+" F",noPrix?noPrix+" couvée(s) sans prix de vente":"couvées en cours");
  kp("Bénéfice prévu",spx.length?fmt(bp)+" F":"—",npx?"soit "+fmt(bp/npx)+" F par poussin":act.length?"indiquez le prix de vente dans la couvée":"",spx.length?signCls(bp):"");
  kp("Bénéfice réalisé",real.length?fmt(br)+" F":"—",real.length?fmt(er)+" F encaissés · "+real.length+" couvée(s)":"saisissez les ventes dans une couvée terminée",real.length?signCls(br):"");
  const rows=[...sa,...sf.slice().sort((a,b)=>a[0].debut<b[0].debut?1:-1).slice(0,8)];
  if(!rows.length){T.parentElement.hidden=true;return}T.parentElement.hidden=false;
  const h=el("thead"),tr=el("tr");[["Couvée"],["Poussins","n"],["Recette","n"],["Coûts","n"],["Bénéfice","n"]].forEach(([x,c])=>tr.append(el("th",c||null,x)));h.append(tr);
  const bd=el("tbody");let tR=0,tC=0,tB=0,tN=0;
  rows.forEach(([b,x])=>{const s=SP[b.espece]||SP.poule;const done=!active(b)&&x.reel!=null;const rec=done?x.reel:x.recette,ben=done?x.benefReel:x.benef,nb=done&&x.vendus!=null?x.vendus:x.vendables;
    tR+=rec;tC+=x.c.total;if(x.prix||done)tB+=ben;tN+=nb;
    const r=el("tr");const td0=el("td");td0.append(el("b",null,s.n+" · "+fmt(Number(b.oeufs))+" œufs"),el("br"),el("small",null,(active(b)?"prévu · éclosion le "+fdate(addDays(b.debut,s.d)):"réalisé")));
    r.append(td0,el("td","n",fmt(nb)),el("td","n",x.prix||done?fmt(rec):"prix ?"),el("td","n",fmt(x.c.total)),el("td","n "+signCls(ben),x.prix||done?fmt(ben):"—"));
    r.onclick=()=>openDetail(b.id);bd.append(r)});
  const ft=el("tr","tot");ft.append(el("td",null,"Total"),el("td","n",fmt(tN)),el("td","n",fmt(tR)),el("td","n",fmt(tC)),el("td","n "+signCls(tB),fmt(tB)));bd.append(ft);
  T.append(h,bd)}

function renderTodo(){const U=$("cv-todo");U.innerHTML="";const t0=today(),items=[];
  batches.filter(active).forEach(b=>events(b).forEach(e=>{const dd=daysBetween(t0,e.date);if(e.j>0&&dd>=-2&&dd<=7)items.push({b,e,dd})}));
  items.sort((a,b)=>a.dd-b.dd);
  if(!items.length){const li=el("li");li.style.gridTemplateColumns="1fr";li.append(el("span","msg",batches.some(active)?"Rien de prévu dans les 7 prochains jours.":"Les mirages, l'arrêt du retournement et les éclosions de vos couvées s'afficheront ici."));U.append(li);return}
  items.slice(0,12).forEach(({b,e,dd})=>{const li=el("li",dd<0?"late":dd<=1?"soon":"");
    const d=el("div","d");d.append(el("b",null,dd===0?"Aujourd'hui":dd===1?"Demain":dd<0?"Il y a "+(-dd)+" j":fdate(e.date)),document.createTextNode("J"+e.j));
    const w=el("div","w");const m=mach(b.couveuseId);w.append(el("b",null,e.t),el("small",null,(SP[b.espece]||SP.poule).n+" · "+fmt(Number(b.oeufs))+" œufs · "+(m?m.nom:"couveuse supprimée")),el("small",null,e.x));
    const go=el("button","btn small ghost","Ouvrir");go.type="button";go.onclick=()=>openDetail(b.id);
    li.append(d,w,go);U.append(li)})}

function progress(b){const s=SP[b.espece]||SP.poule;const j=Math.max(0,Math.min(s.d,dayOf(b)));
  const w=el("div","cvprog");const bar=el("div","bar");const i=el("i");i.style.width=(j/s.d*100)+"%";i.style.background="var(--brand-green)";bar.append(i);
  const mk=el("div","cvmarks");[s.m[0],s.m[1],s.stop].forEach(x=>{const k=el("span");k.style.left=(x/s.d*100)+"%";mk.append(k)});w.append(bar,mk);return w}

function bStatus(b){const s=SP[b.espece]||SP.poule;if(b.statut==="terminee"){const r=N(b.eclos);return [r!=null&&b.oeufs?fmt(r/b.oeufs*100)+" % éclos":"Terminée","s-none"]}
  const j=dayOf(b);if(j<0)return ["Commence le "+fdate(b.debut),"s-none"];
  if(j>s.d+2)return ["À clôturer","s-bad"];if(j>=s.stop)return ["Éclosion J"+j+"/"+s.d,"s-warn"];return ["J"+j+" / "+s.d,"s-ok"]}

function renderBatches(){const L=$("cv-batches");L.innerHTML="";
  document.querySelectorAll("#cv-bfilter button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.f===bFilter));
  const list=batches.filter(b=>bFilter==="encours"?active(b):!active(b)).sort((a,b)=>bFilter==="encours"?(a.debut<b.debut?-1:1):(a.debut<b.debut?1:-1));
  if(!list.length){const e=el("div","empty");e.append(el("strong",null,bFilter==="encours"?"Aucune couvée en cours":"Aucune couvée terminée"),el("span",null,machines.length?"Appuyez sur « + Mettre des œufs » pour lancer une couvée : les dates de mirage et d'éclosion sont calculées pour vous.":"Ajoutez d'abord une couveuse plus bas, puis lancez une couvée."));L.append(e);return}
  list.forEach(b=>{const s=SP[b.espece]||SP.poule,m=mach(b.couveuseId),st=bStatus(b);
    const c=el("button","lot cvbatch");c.type="button";c.setAttribute("aria-pressed",openB===b.id);
    c.append(el("b",null,s.n+" · "+fmt(Number(b.oeufs))+" œufs"),el("small",null,(m?m.nom:"couveuse supprimée")+" · éclosion le "+fdate(addDays(b.debut,s.d))),el("span","pill "+st[1],st[0]));
    if(active(b))c.append(progress(b));
    c.onclick=()=>openDetail(b.id);L.append(c)})}

function capLine(m){const cap=Number(m.capacite)||0;return ["poule","caille","pintade","canard","oie"].map(k=>SP[k].n.replace(" (commun)","")+" "+fmt(Math.floor(cap*SP[k].f))).join(" · ")}

function renderMachines(){const L=$("cv-machines");L.innerHTML="";
  if(!machines.length){const e=el("div","empty");e.append(el("strong",null,"Aucune couveuse"),el("span",null,"Enregistrez vos couveuses (de 24 à 20 000 œufs) avec leurs dimensions : l'application calcule les places libres pour chaque espèce."));L.append(e);return}
  machines.slice().sort((a,b)=>(Number(a.capacite)||0)-(Number(b.capacite)||0)).forEach(m=>{const cap=Number(m.capacite)||0,u=used(m.id),et=ETAT[m.etat]||ETAT.service;
    const c=el("button","lot cvmach");c.type="button";c.setAttribute("aria-pressed","false");
    const dims=[m.L,m.l,m.H].every(x=>Number(x)>0)?fmt(Number(m.L))+" × "+fmt(Number(m.l))+" × "+fmt(Number(m.H))+" cm":"dimensions non saisies";
    c.append(el("b",null,m.nom||"Couveuse"),el("small",null,(MODE[m.mode]||"")+" · "+fmt(cap)+" œufs · "+(Number(m.plateaux)||"?")+" plateau(x) · "+dims+(Number(m.W)?" · "+fmt(Number(m.W))+" W":"")),el("span","pill "+et[1],et[0]));
    const occ=el("div","cvprog");const bar=el("div","bar");const i=el("i");const pct=cap?Math.min(100,u/cap*100):0;i.style.width=pct+"%";i.style.background=u>cap?"var(--bad)":"var(--navy)";bar.append(i);
    occ.append(bar,el("small",null,cap?"Occupée à "+fmt(u/cap*100)+" % · libre : "+fmt(Math.max(0,cap-u))+" œufs de poule":"Capacité non saisie"));
    const sp=el("small","cvsp",capLine(m));c.append(occ,sp);
    c.onclick=()=>openMForm(m);L.append(c)})}

function renderGuide(){const T=$("cv-guidetab");if(T.dataset.done)return;T.dataset.done="1";
  const h=el("thead"),tr=el("tr");["Espèce","Durée","Température","Humidité","Mirages","Arrêt retournement · humidité"].forEach(x=>tr.append(el("th",null,x)));h.append(tr);
  const bd=el("tbody");Object.values(SP).forEach(s=>{const r=el("tr");[s.n,s.d+" jours",s.t+" °C",s.h1,"J"+s.m[0]+" et J"+s.m[1],"J"+s.stop+" · "+s.h2].forEach((x,i)=>{const td=el("td",i===1||i===2?"n":null,x);r.append(td)});bd.append(r)});
  T.append(h,bd)}

/* ---------- détail d'une couvée ---------- */
function openDetail(id){openB=id;$("cv-bform").hidden=true;$("cv-mform").hidden=true;renderBatches();renderDetail();$("cv-bdetail").scrollIntoView({behavior:"smooth",block:"start"})}
function closeDetail(){openB=null;$("cv-bdetail").hidden=true;renderBatches()}

function renderDetail(){const C=$("cv-bdetail");const b=batches.find(x=>x.id===openB);if(!b){C.hidden=true;return}
  if(C.contains(document.activeElement)&&document.activeElement.tagName==="INPUT")return;
  C.hidden=false;C.innerHTML="";const s=SP[b.espece]||SP.poule,m=mach(b.couveuseId),st=bStatus(b);
  const head=el("div","wiz-head");const bk=el("button","back","‹ Fermer");bk.type="button";bk.onclick=closeDetail;
  const rw=el("div","row between");rw.append(el("h2","sec",s.n+" · "+fmt(Number(b.oeufs))+" œufs"),el("span","pill "+st[1],st[0]));
  head.append(bk,rw,el("small","msg",(m?m.nom:"Couveuse supprimée")+" · mis le "+fdate(b.debut)+(b.origine?" · "+b.origine:"")));C.append(head);
  if(active(b))C.append(progress(b));

  /* chiffres */
  const o=Number(b.oeufs)||0,c1=N(b.clairs1)||0,c2=N(b.clairs2)||0,ec=N(b.eclos);const fert=o-c1;
  const K=el("div","kpis");const kp=(l,v,sm)=>{const k=el("div","kpi");k.append(el("span",null,l),el("b",null,v));if(sm)k.append(el("small",null,sm));K.append(k)};
  kp("Œufs mis",fmt(o));kp("Fertiles",b.clairs1!=null&&b.clairs1!==""?fmt(fert):"—",b.clairs1!=null&&b.clairs1!==""&&o?fmt(fert/o*100)+" % de fécondité":"après le premier mirage");
  kp("Éclos",ec==null?"—":fmt(ec),ec!=null&&o?fmt(ec/o*100)+" % des œufs mis":"");
  kp("Éclos / fertiles",ec!=null&&fert>0?fmt(ec/fert*100)+" %":"—",ec!=null&&fert>0?(ec/fert>=0.85?"très bon":ec/fert>=0.7?"correct":"à améliorer"):"");
  /* coûts */
  const W=m?Number(m.W)||0:0,cap=m?Number(m.capacite)||0:0;const share=cap?Math.min(1,places(b)/cap):1;
  const kw=W*0.5*24*s.d/1000*share;const ce=(N(b.coutOeuf)||0)*o,cel=kw*kwP();
  kp("Électricité estimée",W?fmt(kw,1)+" kWh":"—",W?fmt(cel)+" FCFA à "+fmt(kwP())+" F/kWh":"puissance de la couveuse non saisie");
  if(ce||cel)kp("Coût par poussin",ec?fmt((ce+cel)/ec)+" F":"—",fmt(ce+cel)+" FCFA au total");
  C.append(K);

  /* vente et bénéfice */
  const SB=el("div","cvsale");SB.append(el("h3",null,"Vente et bénéfice des poussins"));
  const sg=el("div","grid3");const sfld=(id,lb,val,ph,help)=>{const f=el("div","field");const l=el("label",null,lb);l.htmlFor=id;const i=el("input");i.type="number";i.id=id;i.min="0";i.inputMode="decimal";i.value=val==null?"":val;if(ph!=null)i.placeholder=ph;f.append(l,i);if(help)f.append(el("small",null,help));sg.append(f);return i};
  const ht=histTx(b.espece);
  const sPrix=sfld("cv-sprix","Prix de vente d'un poussin (FCFA)",b.prixVente,"ex. 500");
  const sTx=sfld("cv-stx","Taux d'éclosion prévu (%)",b.txPrevu,String(txPrevu({...b,txPrevu:null})),ht!=null?"votre moyenne : "+fmt(ht)+" %":"valeur habituelle pour l'espèce");
  const sPer=sfld("cv-sper","Pertes avant la vente (%)",b.pertes,"3");
  const sFr=sfld("cv-sfrais","Autres frais (FCFA)",b.frais,"0","vaccins, transport, aliment de démarrage");
  const sVd=sfld("cv-svend","Poussins vendus",b.vendus,"");
  const sEn=sfld("cv-senc","Montant encaissé (FCFA)",b.encaisse,"");
  SB.append(sg);const SR=el("div");SB.append(SR);C.append(SB);
  const draft=()=>({...b,prixVente:N(sPrix.value),txPrevu:N(sTx.value),pertes:N(sPer.value),frais:N(sFr.value),vendus:N(sVd.value),encaisse:N(sEn.value)});
  const calcSale=()=>{SR.innerHTML="";const d=draft(),x=sale(d);const KK=el("div","kpis");
    const kk=(l,v,sm,cls)=>{const k=el("div","kpi");k.append(el("span",null,l),el("b",cls||null,v));if(sm)k.append(el("small",null,sm));KK.append(k)};
    kk(N(d.eclos)!=null?"Poussins à vendre":"Poussins prévus à vendre",fmt(x.vendables),N(d.eclos)!=null?fmt(N(d.eclos))+" éclos − "+fmt(x.pertes)+" % de pertes":fmt(Number(d.oeufs))+" œufs × "+fmt(x.tx)+" % − "+fmt(x.pertes)+" %");
    kk("Recette prévue",x.prix?fmt(x.recette)+" F":"—",x.prix?fmt(x.vendables)+" × "+fmt(x.prix)+" F":"indiquez le prix de vente");
    kk("Coûts",fmt(x.c.total)+" F","œufs "+fmt(x.c.oeufs)+" · électricité "+fmt(x.c.elec)+" · frais "+fmt(x.c.frais));
    kk("Bénéfice prévu",x.prix?fmt(x.benef)+" F":"—",x.prix&&x.parPoussin!=null?fmt(x.parPoussin)+" F par poussin":"",x.prix?signCls(x.benef):"");
    kk("Prix minimum",x.seuil!=null?fmt(Math.ceil(x.seuil))+" F":"—","par poussin pour ne pas perdre d'argent");
    if(x.reel!=null)kk("Bénéfice réalisé",fmt(x.benefReel)+" F",fmt(x.reel)+" F encaissés"+(x.vendus!=null?" · "+fmt(x.vendus)+" vendus":""),signCls(x.benefReel));
    SR.append(KK);
    if(x.prix&&N(d.eclos)==null){const tb=el("table","data");const th=el("thead"),r0=el("tr");[["Scénario"],["Éclosion","n"],["Poussins","n"],["Recette","n"],["Bénéfice","n"]].forEach(([t,c])=>r0.append(el("th",c||null,t)));th.append(r0);
      const tbd=el("tbody");[["Prudent",Math.max(0,x.tx-15)],["Prévu",x.tx],["Favorable",Math.min(100,x.tx+8)]].forEach(([lb,t])=>{const y=sale(d,t);const r=el("tr");r.append(el("td",null,lb),el("td","n",fmt(t)+" %"),el("td","n",fmt(y.vendables)),el("td","n",fmt(y.recette)),el("td","n "+signCls(y.benef),fmt(y.benef)));tbd.append(r)});
      tb.append(th,tbd);const w=el("div","tablewrap");w.append(tb);SR.append(w)}
    if(kwh==null&&x.c.kw)SR.append(el("p","note","Électricité comptée au tarif SONABEL de "+KWH_DEF+" F/kWh hors taxes. Modifiez-le dans le guide des réglages si votre tarif est différent."))};
  [sPrix,sTx,sPer,sFr,sVd,sEn].forEach(i=>i.addEventListener("input",calcSale));calcSale();

  /* calendrier */
  C.append(el("span","label","Calendrier de la couvée"));
  const U=el("ul","cal");const t0=today();
  events(b).forEach(e=>{const dd=daysBetween(t0,e.date);const li=el("li",b.statut==="terminee"||dd<0?"done":dd<=1?"soon":"");
    const d=el("div","d");d.append(el("b",null,"J"+e.j),document.createTextNode(fdate(e.date)));
    const w=el("div","w");w.append(el("b",null,e.t),el("small",null,e.x));li.append(d,w,el("span",null,dd===0?"Aujourd'hui":""));U.append(li)});
  C.append(U);

  /* résultats */
  C.append(el("span","label","Résultats"));
  const g=el("div","grid3");const fld=(id,lb,val,ph)=>{const f=el("div","field");const l=el("label",null,lb);l.htmlFor=id;const i=el("input");i.type="number";i.id=id;i.min="0";i.inputMode="numeric";i.value=val==null?"":val;if(ph)i.placeholder=ph;f.append(l,i);g.append(f);return i};
  const i1=fld("cv-r1","Œufs clairs au 1er mirage",b.clairs1),i2=fld("cv-r2","Embryons morts au 2e mirage",b.clairs2),i3=fld("cv-r3","Poussins éclos",b.eclos);
  C.append(g);
  const nf=el("div","field");const nl=el("label",null,"Remarque");nl.htmlFor="cv-rnote";const nt=el("textarea");nt.id="cv-rnote";nt.value=b.note||"";nt.placeholder="ex. coupure de courant de 3 h à J10";nf.append(nl,nt);C.append(nf);
  const msg=el("span","msg");C.append(msg);
  if(canWrite&&db){const row=el("div","btnrow");
    const sv=el("button","btn small","Enregistrer");sv.type="button";
    const save=async(extra)=>{const body={clairs1:N(i1.value),clairs2:N(i2.value),eclos:N(i3.value),note:nt.value.trim(),prixVente:N(sPrix.value),txPrevu:N(sTx.value),pertes:N(sPer.value),frais:N(sFr.value),vendus:N(sVd.value),encaisse:N(sEn.value),...extra};
      if(body.eclos!=null&&body.eclos>o){msg.textContent="Le nombre d'éclos dépasse le nombre d'œufs mis.";msg.className="msg err";return false}
      try{await db.doc("couvees/"+b.id).update(body);msg.textContent="Enregistré.";msg.className="msg good";return true}catch(e){msg.textContent=errText(e);msg.className="msg err";return false}};
    sv.onclick=async()=>{sv.disabled=true;document.activeElement.blur();await save({});sv.disabled=false};
    const cl=el("button","btn small ghost",b.statut==="terminee"?"Rouvrir la couvée":"Clôturer la couvée");cl.type="button";
    cl.onclick=async()=>{cl.disabled=true;document.activeElement.blur();await save({statut:b.statut==="terminee"?"encours":"terminee",fin:b.statut==="terminee"?null:today()});cl.disabled=false};
    const ed=el("button","btn small ghost","Modifier");ed.type="button";ed.onclick=()=>openBForm(b);
    const dl=el("button","btn small ghost danger","Supprimer");dl.type="button";
    dl.onclick=async()=>{if(dl.dataset.c!=="1"){dl.dataset.c="1";dl.textContent="Confirmer la suppression";return}
      try{await db.doc("couvees/"+b.id).delete();closeDetail()}catch(e){msg.textContent=errText(e);msg.className="msg err"}};
    row.append(sv,cl,ed,dl);C.append(row)}
}

/* ---------- formulaire couvée ---------- */
function fillBSelects(sel){const M=$("cv-bmach");M.innerHTML="";machines.filter(m=>m.etat!=="panne"||m.id===sel).forEach(m=>{const o=el("option",null,m.nom+" ("+fmt(Number(m.capacite)||0)+" œufs)");o.value=m.id;M.append(o)});
  const E=$("cv-besp");if(!E.options.length)Object.entries(SP).forEach(([k,s])=>{const o=el("option",null,s.n+" · "+s.d+" jours");o.value=k;E.append(o)})}
function openBForm(b){if(!machines.length){$("cv-newmach").click();return}
  editB=b||null;fillBSelects(b&&b.couveuseId);$("cv-btitle").textContent=b?"Modifier la couvée":"Nouvelle couvée";
  $("cv-bmach").value=b?b.couveuseId:(machines.find(m=>m.etat!=="panne")||machines[0]).id;$("cv-besp").value=b?b.espece:"poule";
  $("cv-boeufs").value=b?b.oeufs:"";$("cv-bdate").value=b?b.debut:today();$("cv-borig").value=b?b.origine||"":"";$("cv-bcout").value=b&&b.coutOeuf!=null?b.coutOeuf:"";
  $("cv-bmsg").textContent="";$("cv-bdetail").hidden=true;$("cv-mform").hidden=true;$("cv-bform").hidden=false;bCheck();$("cv-bform").scrollIntoView({behavior:"smooth",block:"start"})}
function closeBForm(){$("cv-bform").hidden=true;editB=null;if(openB)renderDetail()}
function bCheck(){const B=$("cv-bcheck");B.innerHTML="";const m=mach($("cv-bmach").value);if(!m)return;const s=SP[$("cv-besp").value]||SP.poule;
  const cap=Number(m.capacite)||0,u=used(m.id,editB&&editB.id),freeEggs=Math.max(0,Math.floor((cap-u)*s.f)),n=N($("cv-boeufs").value)||0,d0=$("cv-bdate").value||today();
  const ok=n<=freeEggs;const p=el("div",ok?"priority":"priority cvbad");
  p.append(el("strong",null,ok?"Place disponible":"Couveuse trop pleine"),el("span",null,"Place libre pour "+fmt(freeEggs)+" œufs de "+s.n.toLowerCase().replace(" (commun)","")+" dans « "+m.nom+" »."+(ok?"":" Réduisez le nombre d'œufs ou choisissez une autre couveuse.")));
  B.append(p);
  if(m.mode==="manuelle")B.append(el("p","note","Couveuse manuelle : pensez à retourner les œufs 3 à 5 fois par jour jusqu'à J"+s.stop+"."));
  B.append(el("p","note","Éclosion prévue le "+fdate(addDays(d0,s.d))+" (J"+s.d+"). Mirages à J"+s.m[0]+" et J"+s.m[1]+", arrêt du retournement à J"+s.stop+"."))}
["cv-bmach","cv-besp","cv-bdate"].forEach(id=>$(id).addEventListener("change",bCheck));$("cv-boeufs").addEventListener("input",bCheck);
$("cv-newbatch").onclick=()=>openBForm(null);$("cv-bcancel").onclick=closeBForm;$("cv-bcancel2").onclick=closeBForm;
$("cv-bsave").onclick=async()=>{const msg=$("cv-bmsg");const n=N($("cv-boeufs").value),d=$("cv-bdate").value,mid=$("cv-bmach").value;
  if(!mid){msg.textContent="Choisissez une couveuse.";msg.className="msg err";return}
  if(!n||n<1){msg.textContent="Indiquez le nombre d'œufs mis.";msg.className="msg err";return}
  if(!d){msg.textContent="Indiquez la date de mise en incubation.";msg.className="msg err";return}
  if(!db||!canWrite){msg.textContent="Accès en lecture seule : enregistrement impossible.";msg.className="msg err";return}
  const body={couveuseId:mid,espece:$("cv-besp").value,oeufs:Math.round(n),debut:d,origine:$("cv-borig").value.trim(),coutOeuf:N($("cv-bcout").value),
    statut:editB?editB.statut||"encours":"encours",createdAt:editB?editB.createdAt||Date.now():Date.now()};
  $("cv-bsave").disabled=true;
  try{if(editB)await db.doc("couvees/"+editB.id).update(body);else{const ref=db.collection("couvees").doc();await ref.set(body);openB=ref.id}
    bFilter="encours";$("cv-bform").hidden=true;editB=null;render()}
  catch(e){msg.textContent=errText(e);msg.className="msg err"}finally{$("cv-bsave").disabled=false}};
document.querySelectorAll("#cv-bfilter button").forEach(b=>b.onclick=()=>{bFilter=b.dataset.f;renderBatches()});

/* ---------- formulaire couveuse ---------- */
{const P=$("cv-mpreset");PRESETS.forEach(([k,lb])=>{const o=el("option",null,lb);o.value=k;P.append(o)})}
const MF=["nom","mode","cap","plat","L","l","H","W","energie","etat","note"];
function openMForm(m){editM=m||null;$("cv-mtitle").textContent=m?"Modifier la couveuse":"Nouvelle couveuse";
  $("cv-mpreset").value="";$("cv-mnom").value=m?m.nom||"":"Couveuse "+(machines.length+1);$("cv-mmode").value=m?m.mode||"auto":"auto";
  $("cv-mcap").value=m?m.capacite:"";$("cv-mplat").value=m?m.plateaux||"":"";["L","l","H","W"].forEach(k=>$("cv-m"+k).value=m&&m[k]!=null?m[k]:"");
  $("cv-menergie").value=m?m.energie||"secteur":"secteur";$("cv-metat").value=m?m.etat||"service":"service";$("cv-mnote").value=m?m.note||"":"";
  $("cv-mdel").hidden=!m||!canWrite;$("cv-mdel").dataset.c="";$("cv-mdel").textContent="Supprimer la couveuse";$("cv-mmsg").textContent="";
  $("cv-bform").hidden=true;$("cv-mform").hidden=false;mCalc();$("cv-mform").scrollIntoView({behavior:"smooth",block:"start"})}
function closeMForm(){$("cv-mform").hidden=true;editM=null}
function mCalc(){const B=$("cv-mcalc");B.innerHTML="";const cap=N($("cv-mcap").value)||0,L=N($("cv-mL").value),l=N($("cv-ml").value),H=N($("cv-mH").value),W=N($("cv-mW").value),pl=N($("cv-mplat").value);
  if(!cap&&!(L&&l&&H))return;const K=el("div","kpis");const kp=(a,v,sm)=>{const k=el("div","kpi");k.append(el("span",null,a),el("b",null,v));if(sm)k.append(el("small",null,sm));K.append(k)};
  if(L&&l&&H)kp("Volume",fmt(L*l*H/1000)+" L","encombrement au sol "+fmt(L*l/10000,2)+" m²");
  if(cap&&pl)kp("Par plateau",fmt(cap/pl)+" œufs");
  if(cap)kp("Caille / canard",fmt(Math.floor(cap*SP.caille.f))+" / "+fmt(Math.floor(cap*SP.canard.f)),"œufs environ");
  if(W){const k=W*0.5*24*21/1000;kp("Électricité / couvée poule",fmt(k,1)+" kWh",fmt(k*kwP())+" FCFA à "+fmt(kwP())+" F/kWh (21 j)")}
  B.append(K)}
$("cv-mpreset").onchange=()=>{const p=PRESETS.find(x=>x[0]===$("cv-mpreset").value);if(!p||!p[2])return;const v=p[2];
  $("cv-mcap").value=v.cap;$("cv-mplat").value=v.plat;$("cv-mL").value=v.L;$("cv-ml").value=v.l;$("cv-mH").value=v.H;$("cv-mW").value=v.W;
  if(!editM&&/^Couveuse \d+$/.test($("cv-mnom").value))$("cv-mnom").value="Couveuse "+v.cap+" œufs";mCalc()};
["cv-mcap","cv-mplat","cv-mL","cv-ml","cv-mH","cv-mW"].forEach(id=>$(id).addEventListener("input",mCalc));
$("cv-newmach").onclick=()=>openMForm(null);$("cv-mcancel").onclick=closeMForm;$("cv-mcancel2").onclick=closeMForm;
$("cv-msave").onclick=async()=>{const msg=$("cv-mmsg");const nom=$("cv-mnom").value.trim(),cap=N($("cv-mcap").value);
  if(!nom){msg.textContent="Donnez un nom à la couveuse.";msg.className="msg err";return}
  if(!cap||cap<1){msg.textContent="Indiquez la capacité en œufs de poule (choisissez un modèle si vous ne la connaissez pas).";msg.className="msg err";return}
  if(!db||!canWrite){msg.textContent="Accès en lecture seule : enregistrement impossible.";msg.className="msg err";return}
  const body={nom,mode:$("cv-mmode").value,capacite:Math.round(cap),plateaux:N($("cv-mplat").value),L:N($("cv-mL").value),l:N($("cv-ml").value),H:N($("cv-mH").value),W:N($("cv-mW").value),
    energie:$("cv-menergie").value,etat:$("cv-metat").value,note:$("cv-mnote").value.trim(),createdAt:editM?editM.createdAt||Date.now():Date.now()};
  $("cv-msave").disabled=true;
  try{const ref=editM?db.doc("couveuses/"+editM.id):db.collection("couveuses").doc();await ref.set(body);closeMForm()}
  catch(e){msg.textContent=errText(e);msg.className="msg err"}finally{$("cv-msave").disabled=false}};
$("cv-mdel").onclick=async()=>{const bt=$("cv-mdel");if(!editM)return;
  if(batches.some(b=>b.couveuseId===editM.id&&active(b))){$("cv-mmsg").textContent="Cette couveuse contient une couvée en cours : clôturez-la d'abord.";$("cv-mmsg").className="msg err";return}
  if(bt.dataset.c!=="1"){bt.dataset.c="1";bt.textContent="Confirmer la suppression";return}
  try{await db.doc("couveuses/"+editM.id).delete();closeMForm()}catch(e){$("cv-mmsg").textContent=errText(e);$("cv-mmsg").className="msg err"}};

/* prix du kWh */
document.querySelectorAll("#cv-kwhp button").forEach(b=>b.onclick=()=>{$("cv-kwh").value=b.dataset.v;$("cv-kwh").dispatchEvent(new Event("input"))});
let kwhT=null;$("cv-kwh").addEventListener("input",()=>{kwh=N($("cv-kwh").value);render();clearTimeout(kwhT);if(!db||!canWrite)return;kwhT=setTimeout(async()=>{try{await db.doc("reglages/couvoir").set({kwh})}catch(e){}},900)});

window.renderCouvoir=render;
render();

(async()=>{
  try{const u=await claude.use("user");if(u){const cw=await u.can("data.write");if(cw===false)canWrite=false}}catch(e){}
  try{db=await claude.use("db")}catch(e){db=null}
  if(!db){$("cv-newbatch").hidden=true;$("cv-newmach").hidden=true;return}
  if(!canWrite){$("cv-newbatch").hidden=true;$("cv-newmach").hidden=true}
  const vis=()=>!$("v-couvoir").hidden;
  const busy=()=>!$("cv-bform").hidden||!$("cv-mform").hidden;
  db.collection("couveuses").onSnapshot(s=>{machines=s.docs.map(d=>({id:d.id,...d.data()}));if(vis()&&!busy())render();else if(!busy())render()},()=>{});
  db.collection("couvees").onSnapshot(s=>{batches=s.docs.map(d=>({id:d.id,...d.data()}));if(!busy())render()},()=>{});
  db.doc("reglages/couvoir").onSnapshot(d=>{const v=d.exists?d.data():{};kwh=N(v.kwh);if(document.activeElement!==$("cv-kwh"))$("cv-kwh").value=kwh==null?"":kwh;if(!busy())render()},()=>{});
})();
})();
