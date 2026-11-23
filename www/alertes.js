/* B2A Smart Farming : alertes sanitaires de zone.
   Un éleveur signale une maladie suspectée dans sa ferme (espèce, maladie, nombre de malades et de morts, zone).
   Les éleveurs proches (même province ou même ville, ou à moins de 40 km si les deux ont donné leur position) le voient
   sur l'accueil. Dès que 2 fermes différentes de la zone signalent la même maladie sur la même espèce en 21 jours,
   c'est une ALERTE : carte rouge et notification sur le téléphone, avec les gestes à faire tout de suite.
   Signalement ANONYME : ni nom, ni téléphone, ni nom de ferme. Seulement la zone (ville, province, position arrondie
   à ≈ 5 km si l'éleveur l'accepte), l'espèce, la maladie et les nombres. B2A regroupe les signalements par zone dans le
   rapport du ministère de l'Agriculture et de l'Élevage (admin-ministere.js).
   Données (Firestore) : alertes_zone/<uid>_<jour>_<groupe> { pays, province, ville, geo?, groupe, maladie, malades, morts,
   jour, auteur, cle?, creeLe, version } : un signalement par ferme, par jour et par espèce (renvoyer le met à jour).
   B2A-HIGH-TECHNOLOGY-AUTOMATION · Bayere Abdoul Aziz */
(function(){
const B=window.B2A;if(!B||!B.app)return;const A=B.app;
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const notr=e=>{e.setAttribute("data-notr","");return e};
const VERSION=((document.currentScript&&/[?&]v=([\d.]+)/.exec(document.currentScript.src))||[])[1]||"web";
const LS_CACHE="b2a-az-cache",LS_MINE="b2a-az-mine",LS_FILE="b2a-az-file",LS_NOTIF="b2a-az-notif",LS_GEO="b2a-az-geo";
const JOURS=21,RAYON=40,SEUIL=2;

/* ================= traductions ================= */
const T={
"Santé dans ma zone":["Health in my area","Salute nella mia zona","Salud en mi zona"],
"Aucune maladie signalée près de chez vous ces 3 dernières semaines.":["No disease reported near you in the last 3 weeks.","Nessuna malattia segnalata vicino a te nelle ultime 3 settimane.","Ninguna enfermedad señalada cerca de ti en las últimas 3 semanas."],
"Les éleveurs de votre zone se préviennent entre eux : si vous voyez une maladie contagieuse, signalez-la. C'est anonyme.":["Farmers in your area warn each other: if you see a contagious disease, report it. It is anonymous.","Gli allevatori della tua zona si avvisano a vicenda: se vedi una malattia contagiosa, segnalala. È anonimo.","Los ganaderos de tu zona se avisan entre ellos: si ves una enfermedad contagiosa, señálala. Es anónimo."],
"Signaler une maladie dans ma ferme":["Report a disease on my farm","Segnala una malattia nella mia azienda","Señalar una enfermedad en mi granja"],
"Trouver un vétérinaire":["Find a vet","Trova un veterinario","Buscar un veterinario"],
"ALERTE":["ALERT","ALLERTA","ALERTA"],"À surveiller":["To watch","Da tenere d'occhio","A vigilar"],
"{0} fermes de votre zone signalent cette maladie":["{0} farms in your area report this disease","{0} aziende della tua zona segnalano questa malattia","{0} granjas de tu zona señalan esta enfermedad"],
"1 ferme de votre zone signale cette maladie":["1 farm in your area reports this disease","1 azienda della tua zona segnala questa malattia","1 granja de tu zona señala esta enfermedad"],
"{0} malades, {1} morts":["{0} sick, {1} dead","{0} malati, {1} morti","{0} enfermos, {1} muertos"],
"Dernier signalement : {0}":["Last report: {0}","Ultima segnalazione: {0}","Última señal: {0}"],
"Que faire maintenant":["What to do now","Cosa fare adesso","Qué hacer ahora"],
"Limitez les visites, lavez et désinfectez les mains, les bottes et le matériel, isolez les animaux malades et n'achetez pas d'animaux pendant 3 semaines.":["Limit visits, wash and disinfect hands, boots and equipment, isolate sick animals and do not buy animals for 3 weeks.","Limita le visite, lava e disinfetta mani, stivali e attrezzi, isola gli animali malati e non comprare animali per 3 settimane.","Limita las visitas, lava y desinfecta manos, botas y material, aísla a los animales enfermos y no compres animales durante 3 semanas."],
"Mis à jour le {0}":["Updated on {0}","Aggiornato il {0}","Actualizado el {0}"],
"Hors connexion : dernières alertes connues.":["Offline: last known alerts.","Offline: ultime allerte conosciute.","Sin conexión: últimas alertas conocidas."],
"Inscrivez-vous dans l'application pour recevoir les alertes de votre zone et pouvoir signaler une maladie.":["Register in the app to receive alerts for your area and to report a disease.","Iscriviti nell'app per ricevere le allerte della tua zona e poter segnalare una malattia.","Regístrate en la aplicación para recibir las alertas de tu zona y poder señalar una enfermedad."],
"Mortalité anormale dans le lot":["Abnormal mortality in batch","Mortalità anomala nel lotto","Mortalidad anormal en el lote"],
"Si vous pensez à une maladie, signalez-la pour prévenir vos voisins.":["If you suspect a disease, report it to warn your neighbours.","Se pensi a una malattia, segnalala per avvisare i vicini.","Si sospechas una enfermedad, señálala para avisar a tus vecinos."],
"Signaler":["Report","Segnala","Señalar"],
"Espèce touchée":["Species affected","Specie colpita","Especie afectada"],"Maladie suspectée":["Suspected disease","Malattia sospetta","Enfermedad sospechada"],
"Animaux malades":["Sick animals","Animali malati","Animales enfermos"],"Animaux morts":["Dead animals","Animali morti","Animales muertos"],
"Ville ou village":["Town or village","Città o villaggio","Ciudad o pueblo"],"Province ou région":["Province or region","Provincia o regione","Provincia o región"],"Pays":["Country","Paese","País"],
"Ajouter ma position approximative (≈ 5 km) pour prévenir les fermes proches":["Add my approximate position (≈ 5 km) to warn nearby farms","Aggiungi la mia posizione approssimativa (≈ 5 km) per avvisare le aziende vicine","Añadir mi posición aproximada (≈ 5 km) para avisar a las granjas cercanas"],
"Anonyme : les autres éleveurs et le ministère voient seulement la zone, l'espèce, la maladie et les nombres. Jamais votre nom, votre téléphone ni votre ferme.":["Anonymous: other farmers and the ministry only see the area, the species, the disease and the numbers. Never your name, your phone or your farm.","Anonimo: gli altri allevatori e il ministero vedono solo la zona, la specie, la malattia e i numeri. Mai il tuo nome, il tuo telefono né la tua azienda.","Anónimo: los demás ganaderos y el ministerio solo ven la zona, la especie, la enfermedad y los números. Nunca tu nombre, tu teléfono ni tu granja."],
"Envoyer le signalement":["Send the report","Invia la segnalazione","Enviar la señal"],"Annuler":["Cancel","Annulla","Cancelar"],
"Indiquez au moins votre ville ou votre province.":["Enter at least your town or your province.","Indica almeno la tua città o la tua provincia.","Indica al menos tu ciudad o tu provincia."],
"Merci : vos voisins sont prévenus.":["Thank you: your neighbours have been warned.","Grazie: i tuoi vicini sono avvisati.","Gracias: tus vecinos están avisados."],
"Merci : le signalement partira dès qu'il y aura du réseau.":["Thank you: the report will be sent as soon as there is a network.","Grazie: la segnalazione partirà appena c'è rete.","Gracias: la señal se enviará en cuanto haya red."],
"Envoi impossible pour l'instant, nouvel essai plus tard.":["Cannot send right now, will try again later.","Invio impossibile per ora, nuovo tentativo più tardi.","No se puede enviar ahora, se volverá a intentar más tarde."],
"Mes signalements":["My reports","Le mie segnalazioni","Mis señales"],"Retirer":["Remove","Ritira","Retirar"],"en attente de réseau":["waiting for network","in attesa di rete","esperando red"],
"Fausse alerte ? Retirez votre signalement.":["False alarm? Remove your report.","Falso allarme? Ritira la tua segnalazione.","¿Falsa alarma? Retira tu señal."],
"Pour les maladies graves, prévenez aussi les services vétérinaires de l'État.":["For serious diseases, also inform the state veterinary services.","Per le malattie gravi, avvisa anche i servizi veterinari dello Stato.","Para las enfermedades graves, avisa también a los servicios veterinarios del Estado."],
"Vous pensez à une maladie contagieuse ?":["Do you suspect a contagious disease?","Pensi a una malattia contagiosa?","¿Sospechas una enfermedad contagiosa?"],
"Signalez-la pour prévenir les éleveurs de votre zone. C'est anonyme.":["Report it to warn farmers in your area. It is anonymous.","Segnalala per avvisare gli allevatori della tua zona. È anonimo.","Señálala para avisar a los ganaderos de tu zona. Es anónimo."],
"Alerte maladie dans votre zone":["Disease alert in your area","Allerta malattia nella tua zona","Alerta de enfermedad en tu zona"],
"Autres signalements dans votre zone (espèces que vous n'élevez pas) : {0}":["Other reports in your area (species you do not raise): {0}","Altre segnalazioni nella tua zona (specie che non allevi): {0}","Otras señales en tu zona (especies que no crías): {0}"],
/* espèces */
"Volailles (poules, pintades, cailles…)":["Poultry (chickens, guinea fowl, quails…)","Pollame (galline, faraone, quaglie…)","Aves (gallinas, pintadas, codornices…)"],
"Volailles":["Poultry","Pollame","Aves"],"Porcs":["Pigs","Suini","Cerdos"],"Moutons et chèvres":["Sheep and goats","Pecore e capre","Ovejas y cabras"],"Bovins":["Cattle","Bovini","Bovinos"],
"Lapins":["Rabbits","Conigli","Conejos"],"Poissons":["Fish","Pesci","Peces"],"Autres animaux":["Other animals","Altri animali","Otros animales"],
/* maladies */
"Maladie inconnue ou mortalité anormale":["Unknown disease or abnormal mortality","Malattia sconosciuta o mortalità anomala","Enfermedad desconocida o mortalidad anormal"],
"Maladie de Newcastle":["Newcastle disease","Malattia di Newcastle","Enfermedad de Newcastle"],"Grippe aviaire":["Avian influenza (bird flu)","Influenza aviaria","Gripe aviar"],
"Maladie de Gumboro":["Gumboro disease","Malattia di Gumboro","Enfermedad de Gumboro"],"Variole aviaire":["Fowl pox","Vaiolo aviare","Viruela aviar"],
"Choléra aviaire (pasteurellose)":["Fowl cholera (pasteurellosis)","Colera aviare (pasteurellosi)","Cólera aviar (pasteurelosis)"],"Coccidiose":["Coccidiosis","Coccidiosi","Coccidiosis"],
"Maladie respiratoire (coryza, mycoplasmose)":["Respiratory disease (coryza, mycoplasmosis)","Malattia respiratoria (corizza, micoplasmosi)","Enfermedad respiratoria (coriza, micoplasmosis)"],
"Typhose ou pullorose":["Fowl typhoid or pullorum","Tifosi o pullorosi","Tifosis o pulorosis"],
"Peste porcine africaine":["African swine fever","Peste suina africana","Peste porcina africana"],"Rouget du porc":["Swine erysipelas","Mal rossino","Erisipela porcina"],
"Maladie respiratoire":["Respiratory disease","Malattia respiratoria","Enfermedad respiratoria"],"Diarrhées":["Diarrhoea","Diarree","Diarreas"],
"Peste des petits ruminants (PPR)":["Peste des petits ruminants (PPR)","Peste dei piccoli ruminanti (PPR)","Peste de los pequeños rumiantes (PPR)"],"Pasteurellose":["Pasteurellosis","Pasteurellosi","Pasteurelosis"],
"Clavelée ou variole caprine":["Sheep pox or goat pox","Vaiolo ovino o caprino","Viruela ovina o caprina"],"Fièvre aphteuse":["Foot-and-mouth disease","Afta epizootica","Fiebre aftosa"],"Charbon":["Anthrax","Carbonchio","Carbunco"],
"Péripneumonie contagieuse bovine (PPCB)":["Contagious bovine pleuropneumonia (CBPP)","Pleuropolmonite contagiosa bovina (PPCB)","Pleuroneumonía contagiosa bovina (PPCB)"],
"Dermatose nodulaire":["Lumpy skin disease","Dermatite nodulare","Dermatosis nodular"],"Trypanosomose":["Trypanosomiasis","Tripanosomiasi","Tripanosomiasis"],
"Maladie hémorragique du lapin":["Rabbit haemorrhagic disease","Malattia emorragica del coniglio","Enfermedad hemorrágica del conejo"],"Myxomatose":["Myxomatosis","Mixomatosi","Mixomatosis"],
"Mortalité de poissons":["Fish mortality","Moria di pesci","Mortalidad de peces"],
/* conseils */
"Vaccinez sans attendre contre la Newcastle les animaux non protégés (rappel si le dernier vaccin date de plus de 3 mois).":["Vaccinate unprotected birds against Newcastle without delay (booster if the last vaccine was more than 3 months ago).","Vaccina subito contro la Newcastle gli animali non protetti (richiamo se l'ultimo vaccino risale a più di 3 mesi fa).","Vacuna sin esperar contra Newcastle a los animales no protegidos (refuerzo si la última vacuna tiene más de 3 meses)."],
"Il n'y a pas de traitement : prévenez tout de suite les services vétérinaires. Gardez les volailles enfermées, loin des oiseaux sauvages, ne touchez pas les oiseaux morts à mains nues et ne vendez ni ne déplacez aucun animal.":["There is no treatment: inform the veterinary services immediately. Keep poultry shut in, away from wild birds, do not touch dead birds with bare hands and do not sell or move any animal.","Non c'è cura: avvisa subito i servizi veterinari. Tieni il pollame chiuso, lontano dagli uccelli selvatici, non toccare gli uccelli morti a mani nude e non vendere né spostare nessun animale.","No hay tratamiento: avisa enseguida a los servicios veterinarios. Mantén las aves encerradas, lejos de las aves silvestres, no toques las aves muertas con las manos desnudas y no vendas ni muevas ningún animal."],
"Vérifiez que les poussins et les jeunes ont reçu le vaccin Gumboro.":["Check that chicks and young birds have received the Gumboro vaccine.","Verifica che pulcini e giovani abbiano ricevuto il vaccino Gumboro.","Comprueba que los pollitos y los jóvenes han recibido la vacuna Gumboro."],
"Vaccinez contre la variole aviaire les animaux non protégés et luttez contre les moustiques.":["Vaccinate unprotected birds against fowl pox and fight mosquitoes.","Vaccina contro il vaiolo aviare gli animali non protetti e combatti le zanzare.","Vacuna contra la viruela aviar a los animales no protegidos y lucha contra los mosquitos."],
"Il n'y a ni vaccin ni traitement : prévenez les services vétérinaires. N'achetez pas de porcs, ne donnez pas de restes de cuisine aux porcs et interdisez les visites.":["There is no vaccine or treatment: inform the veterinary services. Do not buy pigs, do not feed kitchen scraps to pigs and forbid visits.","Non esistono vaccino né cura: avvisa i servizi veterinari. Non comprare suini, non dare avanzi di cucina ai suini e vieta le visite.","No hay vacuna ni tratamiento: avisa a los servicios veterinarios. No compres cerdos, no les des restos de cocina y prohíbe las visitas."],
"Vaccinez contre la PPR les moutons et les chèvres non protégés.":["Vaccinate unprotected sheep and goats against PPR.","Vaccina contro la PPR pecore e capre non protette.","Vacuna contra la PPR a las ovejas y cabras no protegidas."],
"Prévenez les services vétérinaires, ne déplacez pas d'animaux et désinfectez les bottes et les véhicules.":["Inform the veterinary services, do not move animals and disinfect boots and vehicles.","Avvisa i servizi veterinari, non spostare animali e disinfetta stivali e veicoli.","Avisa a los servicios veterinarios, no muevas animales y desinfecta botas y vehículos."],
"Prévenez les services vétérinaires. Ne mangez jamais un animal mort subitement et n'ouvrez pas le cadavre : c'est dangereux pour l'homme.":["Inform the veterinary services. Never eat an animal that died suddenly and do not open the carcass: it is dangerous for humans.","Avvisa i servizi veterinari. Non mangiare mai un animale morto all'improvviso e non aprire la carcassa: è pericoloso per l'uomo.","Avisa a los servicios veterinarios. Nunca comas un animal muerto de repente y no abras el cadáver: es peligroso para las personas."],
"Prévenez les services vétérinaires et faites vacciner le troupeau.":["Inform the veterinary services and have the herd vaccinated.","Avvisa i servizi veterinari e fai vaccinare la mandria.","Avisa a los servicios veterinarios y haz vacunar al rebaño."],
"Faites vacciner le troupeau et luttez contre les mouches et les moustiques.":["Have the herd vaccinated and fight flies and mosquitoes.","Fai vaccinare la mandria e combatti mosche e zanzare.","Haz vacunar al rebaño y lucha contra moscas y mosquitos."],
"Confirmer":["Confirm","Conferma","Confirmar"],
"Demandez conseil à un vétérinaire.":["Ask a vet for advice.","Chiedi consiglio a un veterinario.","Pide consejo a un veterinario."]
};
{const nb=x=>{let i=0;return x.replace(/\d+(?:,\d+)?/g,()=>"{"+(i++)+"}")};
 const D=window.B2A_DICT=window.B2A_DICT||{};["en","it","es"].forEach((l,i)=>{D[l]=D[l]||{};for(const k in T){const kk=k.includes("{")?k:nb(k),v=k.includes("{")?T[k][i]:nb(T[k][i]);if(D[l][kk]==null)D[l][kk]=v}})}
const tr=(s,...a)=>{let x=s;a.forEach((v,i)=>{x=x.split("{"+i+"}").join(v)});return x};
const fmt=v=>Number(v||0).toLocaleString("fr-FR",{maximumFractionDigits:0});

/* ================= espèces et maladies ================= */
const GR={volaille:"Volailles (poules, pintades, cailles…)",porc:"Porcs",petitsrum:"Moutons et chèvres",bovin:"Bovins",lapin:"Lapins",poisson:"Poissons",autre:"Autres animaux"};
const GRC={volaille:"Volailles"};
const INC=["inconnue","Maladie inconnue ou mortalité anormale"];
const MAL={
  volaille:[["newcastle","Maladie de Newcastle"],["grippe","Grippe aviaire"],["gumboro","Maladie de Gumboro"],["variole","Variole aviaire"],["cholera","Choléra aviaire (pasteurellose)"],
    ["coccidiose","Coccidiose"],["respiratoire","Maladie respiratoire (coryza, mycoplasmose)"],["typhose","Typhose ou pullorose"]],
  porc:[["ppa","Peste porcine africaine"],["rouget","Rouget du porc"],["respiratoire","Maladie respiratoire"],["diarrhee","Diarrhées"]],
  petitsrum:[["ppr","Peste des petits ruminants (PPR)"],["pasteurellose","Pasteurellose"],["clavelee","Clavelée ou variole caprine"],["aphteuse","Fièvre aphteuse"],["charbon","Charbon"]],
  bovin:[["aphteuse","Fièvre aphteuse"],["ppcb","Péripneumonie contagieuse bovine (PPCB)"],["dermatose","Dermatose nodulaire"],["charbon","Charbon"],["trypano","Trypanosomose"]],
  lapin:[["vhd","Maladie hémorragique du lapin"],["myxomatose","Myxomatose"],["diarrhee","Diarrhées"]],
  poisson:[["mortalite","Mortalité de poissons"]],autre:[]};
const malList=g=>[...(MAL[g]||[]),INC];
const malName=(g,m)=>(malList(g).find(x=>x[0]===m)||INC)[1];
const CONSEIL={newcastle:"Vaccinez sans attendre contre la Newcastle les animaux non protégés (rappel si le dernier vaccin date de plus de 3 mois).",
  grippe:"Il n'y a pas de traitement : prévenez tout de suite les services vétérinaires. Gardez les volailles enfermées, loin des oiseaux sauvages, ne touchez pas les oiseaux morts à mains nues et ne vendez ni ne déplacez aucun animal.",
  gumboro:"Vérifiez que les poussins et les jeunes ont reçu le vaccin Gumboro.",variole:"Vaccinez contre la variole aviaire les animaux non protégés et luttez contre les moustiques.",
  ppa:"Il n'y a ni vaccin ni traitement : prévenez les services vétérinaires. N'achetez pas de porcs, ne donnez pas de restes de cuisine aux porcs et interdisez les visites.",
  ppr:"Vaccinez contre la PPR les moutons et les chèvres non protégés.",aphteuse:"Prévenez les services vétérinaires, ne déplacez pas d'animaux et désinfectez les bottes et les véhicules.",
  charbon:"Prévenez les services vétérinaires. Ne mangez jamais un animal mort subitement et n'ouvrez pas le cadavre : c'est dangereux pour l'homme.",
  ppcb:"Prévenez les services vétérinaires et faites vacciner le troupeau.",dermatose:"Faites vacciner le troupeau et luttez contre les mouches et les moustiques."};
const GRAVE=new Set(["grippe","ppa","aphteuse","charbon","ppcb","ppr"]);
const BIO="Limitez les visites, lavez et désinfectez les mains, les bottes et le matériel, isolez les animaux malades et n'achetez pas d'animaux pendant 3 semaines.";
/* espèce d'un lot → groupe */
function groupe(l){const e=l.espece||"";
  if(/poisson|tilapia|silure|clarias/i.test(e))return "poisson";
  if(/caille|pondeuse|chair|poule|poulet|pintade|volaille|dinde|canard|oie/i.test(e))return "volaille";
  if(/ch[èe]vre|mouton|brebis|bouc|b[ée]lier|ovin|caprin/i.test(e))return "petitsrum";
  if(/porc|truie|verrat/i.test(e))return "porc";if(/bovin|vache|taureau|z[ée]bu|veau|g[ée]nisse/i.test(e))return "bovin";
  if(/lapin/i.test(e))return "lapin";return "autre"}
const animaux=()=>A.lots().filter(l=>!A.isCrop(l));
const mesGroupes=()=>new Set(animaux().map(groupe));

/* ================= outils ================= */
const rd=k=>{try{return JSON.parse(B.lsGet(k)||"null")}catch(e){return null}};
const wr=(k,v)=>B.lsSet(k,v==null?null:JSON.stringify(v));
const norm=s=>String(s||"").trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const pad=n=>String(n).padStart(2,"0");
const iso=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const jourMin=()=>iso(new Date(Date.now()-JOURS*864e5));
const dLong=j=>{const d=new Date(j+"T12:00:00");return isNaN(d)?j:d.toLocaleDateString("fr-FR",{day:"numeric",month:"long"})};
const approuve=()=>{const a=rd("b2a-acces");return !!(a&&a.statut==="approuve"&&a.uid)};
const dispo=()=>!!B.CFG&&approuve();
const G=()=>window.B2A_GEO;
/* position arrondie à 0,05° (≈ 5 km) : assez pour une distance entre fermes, pas pour trouver une ferme */
const arrondi=p=>G()&&G().valid(p)?{lat:Math.round(p.lat*20)/20,lon:Math.round(p.lon*20)/20}:null;

/* lieu de la ferme : choisi au dernier signalement, sinon profil d'inscription et province des statistiques nationales */
function lieu(){const L=rd(LS_GEO)||{};const p=rd("b2a-profil")||{},s=rd("b2a-statnat-lieu")||{},sn=rd("b2a-statnat")||{};
  return {pays:L.pays||p.pays||s.pays||"",province:L.province||sn.province||"",ville:L.ville||p.ville||s.ville||"",geo:L.sansGeo?null:arrondi(G()&&G().mine())}}

/* une ferme est « proche » : même pays, puis < 40 km si les deux positions sont connues, sinon même province, sinon même ville */
function proche(r,me){const pa=norm(r.pays),pb=norm(me.pays);if(pa&&pb&&pa!==pb)return false;
  if(r.geo&&me.geo&&G()){const d=G().dist(r.geo,me.geo);if(d!=null)return d<=RAYON}
  const va=norm(r.province),vb=norm(me.province);if(va&&vb)return va===vb;
  const wa=norm(r.ville),wb=norm(me.ville);return !!wa&&wa===wb}

/* regroupe les signalements proches par espèce et maladie */
function analyse(list,me,groupes){const min=jourMin();const Gs={};let autres=0;
  for(const r of list||[]){if(!r||r.jour<min||!proche(r,me))continue;
    if(groupes&&groupes.size&&!groupes.has(r.groupe)){autres++;continue}
    const k=r.groupe+"|"+r.maladie;const o=Gs[k]=Gs[k]||{groupe:r.groupe,maladie:r.maladie,fermes:new Set(),malades:0,morts:0,dernier:""};
    o.fermes.add(r.cle||r.auteur||r.id);o.malades+=Number(r.malades)||0;o.morts+=Number(r.morts)||0;if(r.jour>o.dernier)o.dernier=r.jour}
  const out=Object.values(Gs).map(o=>({...o,nb:o.fermes.size,alerte:o.fermes.size>=SEUIL}));
  out.sort((a,b)=>(b.alerte-a.alerte)||(b.nb-a.nb)||(b.dernier>a.dernier?1:-1));return {groupes:out,autres}}

/* ================= Firebase ================= */
let S=null;
async function store(){if(S)return S;if(!dispo())return null;await B.loadFirebase(B.CFG);const u=await B.ensureUser(B.CFG);S={uid:u.uid,fs:firebase.firestore()};return S}
let lecture=false;
async function charger(){if(lecture||!dispo()||!navigator.onLine)return;lecture=true;
  try{const s=await store();if(!s)return;const q=await s.fs.collection("alertes_zone").where("jour",">=",jourMin()).limit(1500).get();
    const list=q.docs.map(d=>{const x=d.data();return {id:d.id,pays:x.pays||"",province:x.province||"",ville:x.ville||"",geo:x.geo||null,groupe:x.groupe,maladie:x.maladie,
      malades:x.malades||0,morts:x.morts||0,jour:x.jour,auteur:x.auteur||"",cle:x.cle||""}});
    wr(LS_CACHE,{le:Date.now(),list});render();notifier()}
  catch(e){console.warn("alertes",e)}finally{lecture=false}}

async function envoyerFile(){const F=rd(LS_FILE)||[];if(!F.length||!dispo()||!navigator.onLine)return "attente";
  let res="ok";const rest=[];
  for(const r of F){try{const s=await store();const id=s.uid+"_"+r.jour+"_"+r.groupe;
      const cle=B.farm&&window.B2A_NOMS?await window.B2A_NOMS.sha("ferme|"+B.farm):"";
      const doc={pays:r.pays,province:r.province,ville:r.ville,groupe:r.groupe,maladie:r.maladie,malades:r.malades,morts:r.morts,jour:r.jour,auteur:s.uid,cle,
        creeLe:firebase.firestore.FieldValue.serverTimestamp(),version:VERSION};if(r.geo)doc.geo=r.geo;
      await s.fs.doc("alertes_zone/"+id).set(doc);const M=rd(LS_MINE)||[];const i=M.findIndex(m=>m.id===id||m.tmp===r.tmp);
      const m={id,groupe:r.groupe,maladie:r.maladie,jour:r.jour};if(i>=0)M[i]=m;else M.unshift(m);wr(LS_MINE,M.slice(0,20))}
    catch(e){console.warn("alertes",e);res="err";rest.push(r)}}
  wr(LS_FILE,rest.length?rest:null);if(res==="ok")charger();return res}

async function retirer(m){const M=(rd(LS_MINE)||[]).filter(x=>x!==m&&x.id!==m.id);
  if(m.tmp){wr(LS_FILE,(rd(LS_FILE)||[]).filter(r=>r.tmp!==m.tmp)||null);wr(LS_MINE,M);render();return}
  try{const s=await store();if(s)await s.fs.doc("alertes_zone/"+m.id).delete();wr(LS_MINE,M);
    const C=rd(LS_CACHE);if(C){C.list=(C.list||[]).filter(r=>r.id!==m.id);wr(LS_CACHE,C)}}catch(e){console.warn("alertes",e)}render()}

/* ================= notification sur le téléphone ================= */
async function notifier(){const C=rd(LS_CACHE);if(!C||!animaux().length)return;const res=analyse(C.list,lieu(),mesGroupes());
  const deja=rd(LS_NOTIF)||{};const min=jourMin();for(const k in deja)if(deja[k]<min)delete deja[k];
  const neuf=res.groupes.filter(g=>g.alerte&&!deja[g.groupe+"|"+g.maladie]);if(!neuf.length){wr(LS_NOTIF,deja);return}
  const g=neuf[0];const titre=window.__tr?window.__tr(tr("Alerte maladie dans votre zone")):tr("Alerte maladie dans votre zone");
  const t=s=>window.__tr?window.__tr(s):s;const corps=t(malName(g.groupe,g.maladie))+" · "+t(GRC[g.groupe]||GR[g.groupe])+" · "+t(tr("{0} fermes de votre zone signalent cette maladie",fmt(g.nb)));
  try{const Cap=window.Capacitor;const LN=Cap&&Cap.isNativePlatform&&Cap.isNativePlatform()&&Cap.Plugins&&Cap.Plugins.LocalNotifications;
    if(LN){const p=await LN.checkPermissions().catch(()=>null);if(p&&p.display==="granted")await LN.schedule({notifications:[{id:95000000+Math.floor(Math.random()*999999),title:titre,body:corps,schedule:{at:new Date(Date.now()+1500),allowWhileIdle:true},extra:{tab:"tableau"}}]})}
    else if("Notification" in window&&Notification.permission==="granted"){const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();
      const o={body:corps,icon:"icons/icon-192.png",badge:"icons/icon-192.png",tag:"b2a-az-"+g.groupe+g.maladie,data:{tab:"tableau"}};if(reg&&reg.showNotification)await reg.showNotification(titre,o);else new Notification(titre,o)}}catch(e){}
  neuf.forEach(x=>{deja[x.groupe+"|"+x.maladie]=x.dernier});wr(LS_NOTIF,deja)}

/* ================= carte de l'accueil ================= */
let formOuvert=false,formInit=null;
function veto(){const b=$("tab-marche");if(b)b.click();setTimeout(()=>{const S=window.B2A_SERVICES;if(S&&S.open)S.open("veto")},300)}
function ligneGroupe(g){const d=el("div","az-it "+(g.alerte?"az-bad":"az-warn"));
  const h=el("div","az-h");h.append(el("span","az-tag",tr(g.alerte?"ALERTE":"À surveiller")),el("b",null,tr(malName(g.groupe,g.maladie))),el("span","az-sp",tr(GRC[g.groupe]||GR[g.groupe])));d.append(h);
  d.append(el("p","az-l",g.nb>1?tr("{0} fermes de votre zone signalent cette maladie",fmt(g.nb)):tr("1 ferme de votre zone signale cette maladie")));
  const p=el("p","az-l az-m");p.append(el("span",null,tr("{0} malades, {1} morts",fmt(g.malades),fmt(g.morts)))," · ",el("span",null,tr("Dernier signalement : {0}",dLong(g.dernier))));d.append(p);
  if(g.alerte){const c=el("div","az-c");c.append(el("b",null,tr("Que faire maintenant")));const ul=el("ul");
    [CONSEIL[g.maladie]||"Demandez conseil à un vétérinaire.",BIO].forEach(x=>ul.append(el("li",null,tr(x))));
    if(GRAVE.has(g.maladie))ul.append(el("li",null,tr("Pour les maladies graves, prévenez aussi les services vétérinaires de l'État.")));c.append(ul);d.append(c)}
  return d}

function render(){if(!$("home"))return;let c=$("az-card");
  if(!animaux().length&&!formOuvert){if(c)c.remove();return}
  if(!c){c=el("section","card az-card");c.id="az-card";const ref=$("alertcard");const home=$("home");
    if(ref&&ref.parentNode===home)home.insertBefore(c,ref.nextSibling);else home.insertBefore(c,home.children[1]||null)}
  c.innerHTML="";c.append(el("h2","sec",tr("Santé dans ma zone")));
  const C=rd(LS_CACHE);const res=analyse(C&&C.list,lieu(),mesGroupes());const nAl=res.groupes.filter(g=>g.alerte).length;
  c.classList.toggle("az-on",nAl>0);
  if(!dispo())c.append(el("p","note",tr("Inscrivez-vous dans l'application pour recevoir les alertes de votre zone et pouvoir signaler une maladie.")));
  else if(!res.groupes.length)c.append(el("p","az-ok",tr("Aucune maladie signalée près de chez vous ces 3 dernières semaines.")));
  res.groupes.forEach(g=>c.append(ligneGroupe(g)));
  if(res.autres)c.append(el("p","note",tr("Autres signalements dans votre zone (espèces que vous n'élevez pas) : {0}",fmt(res.autres))));
  /* lot avec beaucoup de morts : proposer de signaler */
  if(!formOuvert)animaux().forEach(l=>{let s;try{s=A.stats(l)}catch(e){return}if(!((s.morts7pct||0)>0.5))return;
    const g=groupe(l);const M=rd(LS_MINE)||[];if(M.some(m=>m.groupe===g&&m.jour>=iso(new Date(Date.now()-7*864e5))))return;
    const w=el("div","az-sug");const t=el("p");t.append(el("b",null,tr("Mortalité anormale dans le lot"))," ",notr(el("span",null,"« "+(l.nom||"")+" »")),". ",el("span",null,tr("Si vous pensez à une maladie, signalez-la pour prévenir vos voisins.")));
    const b=el("button","btn small",tr("Signaler"));b.type="button";b.onclick=()=>ouvrir({groupe:g,morts:s.morts7||0});w.append(t,b);c.append(w)});
  if(formOuvert)c.append(formulaire());
  else{c.append(el("p","note",tr("Les éleveurs de votre zone se préviennent entre eux : si vous voyez une maladie contagieuse, signalez-la. C'est anonyme.")));
    const r=el("div","row");const sb=el("button","btn small",tr("Signaler une maladie dans ma ferme"));sb.type="button";sb.id="az-sig";sb.onclick=()=>ouvrir();
    const vb=el("button","btn small ghost",tr("Trouver un vétérinaire"));vb.type="button";vb.onclick=veto;r.append(sb,vb);c.append(r)}
  /* mes signalements */
  const M=(rd(LS_MINE)||[]).filter(m=>m.jour>=jourMin());const F=rd(LS_FILE)||[];
  const tous=[...F.map(r=>({tmp:r.tmp,groupe:r.groupe,maladie:r.maladie,jour:r.jour,att:true})),...M.filter(m=>!F.some(r=>r.tmp&&r.tmp===m.tmp))];
  if(tous.length){const d=el("details","az-mine");d.append(el("summary",null,tr("Mes signalements")+" ("+tous.length+")"));d.append(el("p","note",tr("Fausse alerte ? Retirez votre signalement.")));
    tous.forEach(m=>{const r=el("div","row between az-mr");const t=el("span");t.append(el("span",null,tr(malName(m.groupe,m.maladie)))," · ",el("span",null,tr(GRC[m.groupe]||GR[m.groupe]))," · ",el("span",null,dLong(m.jour)));
      if(m.att)t.append(" · ",el("i",null,tr("en attente de réseau")));const x=el("button","btn small ghost",tr("Retirer"));x.type="button";
      x.onclick=()=>{if(x.dataset.c!=="1"){x.dataset.c="1";x.textContent=tr("Confirmer");return}x.disabled=true;retirer(m)};r.append(t,x);d.append(r)});c.append(d)}
  if(C&&C.le&&dispo())c.append(el("p","note az-maj",(navigator.onLine?"":tr("Hors connexion : dernières alertes connues.")+" ")+tr("Mis à jour le {0}",new Date(C.le).toLocaleDateString("fr-FR",{day:"numeric",month:"long"}))))}

function ouvrir(o){formOuvert=true;formInit=o||{};render();const c=$("az-card");if(c&&c.scrollIntoView)try{c.scrollIntoView({block:"start",behavior:"smooth"})}catch(e){}}
function fermer(){formOuvert=false;formInit=null;render()}

function champ(lab,input){const f=el("div","field");const l=el("label",null,tr(lab));input.id=input.id||"az-"+Math.random().toString(36).slice(2,8);l.htmlFor=input.id;f.append(l,input);return f}
function formulaire(){const o=formInit||{};const w=el("div","az-form");w.id="az-form";const L=lieu();
  const gs=[...mesGroupes()];const sg=el("select");sg.id="az-g";Object.keys(GR).forEach(k=>sg.append(new Option(tr(GR[k]),k)));sg.value=o.groupe||gs[0]||"volaille";
  const sm=el("select");sm.id="az-m";const fillM=()=>{sm.innerHTML="";malList(sg.value).forEach(([k,n])=>sm.append(new Option(tr(n),k)))};fillM();sg.onchange=fillM;
  const num=(id,v)=>{const i=el("input");i.type="number";i.min="0";i.max="1000000";i.inputMode="numeric";i.id=id;if(v)i.value=v;return i};
  const im=num("az-ma",o.malades),io=num("az-mo",o.morts);
  const txt=(id,v,ph)=>{const i=el("input");i.type="text";i.maxLength=60;i.id=id;i.value=v||"";if(ph)i.placeholder=ph;notr(i);return i};
  const iv=txt("az-v",L.ville),ip=txt("az-p",L.province,"Kadiogo"),ipa=txt("az-pa",L.pays||"Burkina Faso");
  const g1=el("div","grid2");g1.append(champ("Espèce touchée",sg),champ("Maladie suspectée",sm),champ("Animaux malades",im),champ("Animaux morts",io));
  const g2=el("div","grid2");g2.append(champ("Ville ou village",iv),champ("Province ou région",ip),champ("Pays",ipa));
  const lab=el("label","az-chk");const cb=el("input");cb.type="checkbox";cb.id="az-geo";const LG=rd(LS_GEO)||{};cb.checked=!LG.sansGeo;
  lab.append(cb,el("span",null,tr("Ajouter ma position approximative (≈ 5 km) pour prévenir les fermes proches")));
  const msg=el("p","msg");msg.setAttribute("aria-live","polite");
  const r=el("div","row");const ok=el("button","btn",tr("Envoyer le signalement"));ok.type="button";ok.id="az-ok";const an=el("button","btn ghost",tr("Annuler"));an.type="button";an.onclick=fermer;r.append(ok,an);
  w.append(g1,g2,lab,el("p","note",tr("Anonyme : les autres éleveurs et le ministère voient seulement la zone, l'espèce, la maladie et les nombres. Jamais votre nom, votre téléphone ni votre ferme.")),r,msg);
  ok.onclick=async()=>{const n=v=>Math.max(0,Math.min(1000000,Math.round(Number(v)||0)));
    const lieu2={pays:ipa.value.trim().slice(0,60),province:ip.value.trim().slice(0,60),ville:iv.value.trim().slice(0,60),sansGeo:!cb.checked};
    if(!lieu2.ville&&!lieu2.province){msg.className="msg err";msg.textContent=tr("Indiquez au moins votre ville ou votre province.");return}
    if(!dispo()){msg.className="msg err";msg.textContent=tr("Inscrivez-vous dans l'application pour recevoir les alertes de votre zone et pouvoir signaler une maladie.");return}
    wr(LS_GEO,lieu2);ok.disabled=true;
    let geo=null;if(cb.checked&&G()){geo=arrondi(G().mine());if(!geo)try{geo=arrondi(await G().here())}catch(e){geo=null}}
    const rep={tmp:"t"+Date.now(),pays:lieu2.pays,province:lieu2.province,ville:lieu2.ville,geo,groupe:sg.value,maladie:sm.value,malades:n(im.value),morts:n(io.value),jour:A.today()};
    const F=(rd(LS_FILE)||[]).filter(x=>!(x.jour===rep.jour&&x.groupe===rep.groupe));F.push(rep);wr(LS_FILE,F);
    const res=await envoyerFile();formOuvert=false;render();
    const c=$("az-card");if(c){const m=el("p","msg"+(res==="err"?" err":""),tr(res==="ok"?"Merci : vos voisins sont prévenus.":res==="err"?"Envoi impossible pour l'instant, nouvel essai plus tard.":"Merci : le signalement partira dès qu'il y aura du réseau."));
      m.setAttribute("role","status");c.insertBefore(m,c.children[1]||null)}};
  return w}

/* raccourci dans l'onglet Diagnostic */
function diag(){const v=$("v-diagnostic");if(!v||$("az-diag"))return;const c=el("section","card az-diag");c.id="az-diag";
  c.append(el("h2","sec",tr("Vous pensez à une maladie contagieuse ?")),el("p","note",tr("Signalez-la pour prévenir les éleveurs de votre zone. C'est anonyme.")));
  const b=el("button","btn small",tr("Signaler une maladie dans ma ferme"));b.type="button";b.onclick=()=>{const t=$("tab-tableau");if(t)t.click();setTimeout(()=>ouvrir(),200)};c.append(b);
  const n=v.querySelector(":scope > p.note");v.insertBefore(c,n||null)}

const css=el("style");css.textContent=`.az-card{display:grid;gap:10px}.az-card.az-on{border-left:5px solid var(--bad)}
.az-ok{margin:0;padding:10px 12px;border-radius:10px;background:var(--ok-bg);color:var(--ok);font-weight:600}
.az-it{border-radius:10px;padding:10px 12px;display:grid;gap:4px}.az-bad{background:var(--bad-bg)}.az-warn{background:var(--warn-bg)}
.az-h{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:baseline}.az-tag{font-size:12px;font-weight:800;letter-spacing:.04em;padding:2px 8px;border-radius:99px;color:#fff;background:var(--warn)}
.az-bad .az-tag{background:var(--bad)}.az-sp{color:var(--muted);font-size:14px}.az-l{margin:0}.az-m{color:var(--muted);font-size:14px}
.az-c ul{margin:4px 0 0;padding-left:20px;display:grid;gap:4px}.az-sug{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:10px 12px;border-radius:10px;background:var(--warn-bg)}.az-sug p{margin:0;flex:1 1 220px}
.az-form{display:grid;gap:10px}.az-chk{display:flex;gap:10px;align-items:flex-start}.az-chk input{width:22px;height:22px;flex:none;margin-top:1px}
.az-mine summary{cursor:pointer;font-weight:600}.az-mr{gap:8px;padding:6px 0;border-top:1px solid var(--line)}.az-maj{font-size:13px}`;
document.head.append(css);

/* démarrage */
function go(){render();diag();setTimeout(()=>{envoyerFile();charger()},4000);setInterval(charger,3*3600e3)}
addEventListener("online",()=>{envoyerFile();charger()});
addEventListener("b2a-data",()=>render());
document.addEventListener("visibilitychange",()=>{if(!document.hidden){const C=rd(LS_CACHE);if(!C||Date.now()-C.le>30*60e3)charger()}});
document.addEventListener("b2a-lang",()=>{render();const d=$("az-diag");if(d){d.remove();diag()}});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",go);else go();
setTimeout(()=>{render();charger()},9000);
window.B2A_ALERTES={analyse,proche,render,charger,ouvrir,groupe,MAL,GR,malName};
})();
