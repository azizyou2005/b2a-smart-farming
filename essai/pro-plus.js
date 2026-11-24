/* B2A Smart Farming : version Pro — fonctions qui font gagner ou éviter de perdre de l'argent
   B2A-HIGH-TECHNOLOGY-AUTOMATION · Bayere Abdoul Aziz
   1. Veille sanitaire : mortalité brutale ou chute de ponte détectée sur la saisie du jour, causes probables selon
      l'espèce et l'âge, gestes immédiats, vétérinaire le plus proche, notification sur le téléphone.
   2. Alerte maladie de la zone : signalement anonyme (ville, type d'animaux, signe) ; quand plusieurs fermes de la
      même ville signalent le même signe en 14 jours, les abonnés de la ville sont prévenus.
   3. Alerte prix : vos prix de vente comparés aux prix trouvés sur internet dans votre ville.
   4. Rapport du mois à partager sur WhatsApp (production, ventes, bilan depuis janvier, alertes).
   5. Soins des 7 prochains jours à envoyer sur WhatsApp à l'équipe.
   6. Prix du jour des matières premières pour la formule d'aliment la moins chère.
   7. Commandes groupées B2A (aliment, poussins, vaccins à prix négocié).
   Les éleveurs sans abonnement voient qu'une alerte existe et ce que la version Pro leur apporterait. */
(function(){
const B=window.B2A;if(!B||!B.app)return;const A=B.app;
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const notr=e=>{e.setAttribute("data-notr","");return e};
const tr=s=>window.__tr?window.__tr(s):s;
const fmt=(v,d=0)=>v==null||!isFinite(v)?"—":Number(v).toLocaleString("fr-FR",{maximumFractionDigits:d,minimumFractionDigits:d});
const N=v=>{if(v===""||v==null)return null;const n=Number(String(v).replace(",","."));return isFinite(n)?n:null};
const pad=n=>String(n).padStart(2,"0");
const iso=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const today=()=>iso(new Date());
const days=(a,b)=>Math.round((new Date(b+"T12:00")-new Date(a+"T12:00"))/864e5);
const PRO=()=>window.B2A_PRO||null;
const isPro=()=>{const p=PRO();return !!(p&&p.isPro&&p.isPro())};
const web=(pid,div)=>{try{const p=PRO();const e=p&&p.etude?p.etude(pid,ville()):null;return e&&e.n>=3?{...e,v:Math.round(e.prix/(div||1))}:null}catch(x){return null}};
const norm=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/\s+/g," ").trim();
const share=t=>{if(navigator.share)navigator.share({text:t}).catch(()=>{});else window.open("https://wa.me/?text="+encodeURIComponent(t),"_blank","noopener")};

/* ================= traductions ================= */
const T={
"vérifié":["verified","verificato","verificado"],
"Veille sanitaire":["Health watch","Sorveglianza sanitaria","Vigilancia sanitaria"],
"Mortalité brutale":["Sudden deaths","Mortalità improvvisa","Mortalidad repentina"],"Chute de ponte":["Drop in laying","Calo della deposizione","Caída de la puesta"],
"morts aujourd'hui":["deaths today","morti oggi","muertes hoy"],"en moyenne avant":["on average before","in media prima","de media antes"],
"ponte des 3 derniers jours":["laying over the last 3 days","deposizione degli ultimi 3 giorni","puesta de los últimos 3 días"],"avant":["before","prima","antes"],
"Causes probables":["Likely causes","Cause probabili","Causas probables"],"À faire tout de suite":["To do right away","Da fare subito","Hacer de inmediato"],
"Trouver un vétérinaire":["Find a vet","Trova un veterinario","Encontrar un veterinario"],"Guide santé et photo":["Health guide and photo","Guida sanitaria e foto","Guía de salud y foto"],
"Une anomalie est détectée sur un lot :":["An anomaly has been detected on a batch:","È stata rilevata un'anomalia su un lotto:","Se ha detectado una anomalía en un lote:"],
"La version Pro vous donne les causes probables, les gestes à faire tout de suite et le vétérinaire le plus proche.":["The Pro version gives you the likely causes, what to do right away and the nearest vet.","La versione Pro ti indica le cause probabili, cosa fare subito e il veterinario più vicino.","La versión Pro le da las causas probables, lo que hay que hacer de inmediato y el veterinario más cercano."],
"Découvrir la version Pro":["Discover the Pro version","Scopri la versione Pro","Descubrir la versión Pro"],
"Alerte maladie dans votre zone":["Disease alert in your area","Allerta malattia nella tua zona","Alerta de enfermedad en su zona"],
"fermes de votre ville ont signalé ce signe ces 14 derniers jours :":["farms in your town reported this sign in the last 14 days:","fattorie della tua città hanno segnalato questo segno negli ultimi 14 giorni:","granjas de su ciudad han señalado este signo en los últimos 14 días:"],
"Renforcez la biosécurité : pédiluve, pas de visiteurs, pas d'achat d'animaux, vaccins à jour.":["Strengthen biosecurity: footbath, no visitors, no animal purchases, vaccines up to date.","Rafforza la biosicurezza: pediluvio, niente visitatori, niente acquisti di animali, vaccini aggiornati.","Refuerce la bioseguridad: pediluvio, sin visitas, sin compra de animales, vacunas al día."],
"Une alerte maladie concerne votre ville. La version Pro vous dit laquelle et comment protéger vos animaux.":["A disease alert concerns your town. The Pro version tells you which one and how to protect your animals.","Un'allerta malattia riguarda la tua città. La versione Pro ti dice quale e come proteggere i tuoi animali.","Una alerta de enfermedad afecta a su ciudad. La versión Pro le dice cuál y cómo proteger a sus animales."],
"volailles":["poultry","pollame","aves"],"porcs":["pigs","suini","cerdos"],"ruminants":["ruminants","ruminanti","rumiantes"],"poissons":["fish","pesci","peces"],
"mortalité brutale":["sudden deaths","mortalità improvvisa","mortalidad repentina"],"chute de ponte":["drop in laying","calo della deposizione","caída de la puesta"],
"Vos prix de vente":["Your selling prices","I tuoi prezzi di vendita","Sus precios de venta"],
"Vous vendez":["You sell","Vendi","Usted vende"],"Prix du marché":["Market price","Prezzo di mercato","Precio del mercado"],
"Vous vendez moins cher que le marché : vous pourriez gagner environ":["You sell below the market: you could earn about","Vendi meno caro del mercato: potresti guadagnare circa","Vende más barato que el mercado: podría ganar alrededor de"],
"par mois.":["per month.","al mese.","al mes."],
"Vous vendez plus cher que le marché : attention à la mévente.":["You sell above the market: beware of unsold stock.","Vendi più caro del mercato: attenzione all'invenduto.","Vende más caro que el mercado: cuidado con no vender."],
"Votre prix est dans la moyenne du marché.":["Your price is in line with the market.","Il tuo prezzo è nella media del mercato.","Su precio está en la media del mercado."],
"Plateau de 30 œufs":["Tray of 30 eggs","Vassoio da 30 uova","Bandeja de 30 huevos"],"Poulet de chair":["Broiler","Pollo da carne","Pollo de engorde"],
"Rapport du mois":["Monthly report","Rapporto del mese","Informe del mes"],
"Œufs":["Eggs","Uova","Huevos"],"plateaux":["trays","vassoi","bandejas"],"Morts":["Deaths","Morti","Muertes"],"Ventes facturées":["Invoiced sales","Vendite fatturate","Ventas facturadas"],
"Depuis janvier":["Since January","Da gennaio","Desde enero"],"Chiffre d'affaires":["Turnover","Fatturato","Facturación"],"Dépenses":["Expenses","Spese","Gastos"],"Bénéfice net":["Net profit","Utile netto","Beneficio neto"],
"Alertes en cours":["Current alerts","Avvisi in corso","Alertas en curso"],"Aucune":["None","Nessuno","Ninguna"],
"Partager sur WhatsApp":["Share on WhatsApp","Condividi su WhatsApp","Compartir en WhatsApp"],
"Me le rappeler à la fin du mois":["Remind me at the end of the month","Ricordamelo a fine mese","Recordármelo a fin de mes"],"Rappel programmé.":["Reminder scheduled.","Promemoria programmato.","Recordatorio programado."],
"Soins des {0} prochains jours":["Care for the next {0} days","Cure dei prossimi {0} giorni","Cuidados de los próximos {0} días"],
"Envoyez la liste à votre équipe ou à votre vétérinaire sur WhatsApp.":["Send the list to your team or your vet on WhatsApp.","Invia l'elenco alla tua squadra o al tuo veterinario su WhatsApp.","Envíe la lista a su equipo o a su veterinario por WhatsApp."],
"Aucun soin prévu dans les {0} prochains jours.":["No care planned in the next {0} days.","Nessuna cura prevista nei prossimi {0} giorni.","Ningún cuidado previsto en los próximos {0} días."],
"Prix du jour des matières premières":["Today's prices of raw materials","Prezzi del giorno delle materie prime","Precios del día de las materias primas"],
"Prix trouvés sur internet dans votre ville. Appliquez-les, puis calculez la formule la moins chère.":["Prices found online in your town. Apply them, then work out the cheapest formula.","Prezzi trovati su internet nella tua città. Applicali, poi calcola la formula più economica.","Precios encontrados en internet en su ciudad. Aplíquelos y calcule la fórmula más barata."],
"Appliquer les prix du jour et calculer la formule la moins chère":["Apply today's prices and work out the cheapest formula","Applica i prezzi del giorno e calcola la formula più economica","Aplicar los precios del día y calcular la fórmula más barata"],
"Pas encore assez de prix trouvés pour les matières premières.":["Not enough prices found yet for raw materials.","Non sono ancora stati trovati abbastanza prezzi per le materie prime.","Todavía no hay suficientes precios para las materias primas."],
"Votre prix":["Your price","Il tuo prezzo","Su precio"],"Prix du jour":["Today's price","Prezzo del giorno","Precio del día"],
"Commandes groupées B{0}A":["B{0}A group orders","Ordini di gruppo B{0}A","Pedidos agrupados B{0}A"],
"Aliment, poussins et vaccins moins chers : B{0}A regroupe les commandes des abonnés de votre ville et négocie le prix avec le fournisseur.":["Cheaper feed, chicks and vaccines: B{0}A groups the orders of subscribers in your town and negotiates the price with the supplier.","Mangime, pulcini e vaccini meno cari: B{0}A raggruppa gli ordini degli abbonati della tua città e negozia il prezzo con il fornitore.","Pienso, pollitos y vacunas más baratos: B{0}A agrupa los pedidos de los abonados de su ciudad y negocia el precio con el proveedor."],
"Commander":["Order","Ordina","Pedir"],"Produit":["Product","Prodotto","Producto"],"Quantité":["Quantity","Quantità","Cantidad"],"Ville":["Town","Città","Ciudad"],
"Téléphone":["Phone","Telefono","Teléfono"],"Remarque (facultatif)":["Note (optional)","Nota (facoltativa)","Observación (opcional)"],"Envoyer la demande":["Send the request","Invia la richiesta","Enviar la solicitud"],
"Demande envoyée : B{0}A vous appelle avec le prix négocié.":["Request sent: B{0}A will call you with the negotiated price.","Richiesta inviata: B{0}A ti chiamerà con il prezzo negoziato.","Solicitud enviada: B{0}A le llamará con el precio negociado."],
"Indiquez la quantité, la ville et le téléphone.":["Enter the quantity, the town and the phone.","Indica la quantità, la città e il telefono.","Indique la cantidad, la ciudad y el teléfono."],
"Envoi impossible. Vérifiez la connexion et réessayez.":["Sending failed. Check the connection and try again.","Invio impossibile. Verifica la connessione e riprova.","Envío imposible. Compruebe la conexión e inténtelo de nuevo."],
"Mes demandes":["My requests","Le mie richieste","Mis solicitudes"],"en attente":["pending","in attesa","pendiente"],"traitée":["handled","gestita","atendida"],
"Aliment ponte (sacs de {0} kg)":["Laying feed ({0} kg bags)","Mangime deposizione (sacchi da {0} kg)","Pienso de puesta (sacos de {0} kg)"],
"Aliment chair (sacs de {0} kg)":["Broiler feed ({0} kg bags)","Mangime polli da carne (sacchi da {0} kg)","Pienso de engorde (sacos de {0} kg)"],
"Aliment bétail (sacs de {0} kg)":["Livestock feed ({0} kg bags)","Mangime bestiame (sacchi da {0} kg)","Pienso para ganado (sacos de {0} kg)"],
"Poussins pondeuses":["Layer chicks","Pulcini ovaiole","Pollitos ponedoras"],"Poussins chair":["Broiler chicks","Pulcini da carne","Pollitos de engorde"],"Vaccins (doses)":["Vaccines (doses)","Vaccini (dosi)","Vacunas (dosis)"],"Autre":["Other","Altro","Otro"],
/* causes et gestes */
"Maladie de Newcastle : râles, torticolis, diarrhée verdâtre. Très contagieuse.":["Newcastle disease: rattling breath, twisted neck, greenish diarrhoea. Highly contagious.","Malattia di Newcastle: rantoli, torcicollo, diarrea verdastra. Molto contagiosa.","Enfermedad de Newcastle: estertores, tortícolis, diarrea verdosa. Muy contagiosa."],
"Gumboro (3 à 8 semaines) : diarrhée blanche, plumes ébouriffées, abattement.":["Gumboro (3 to 8 weeks): white diarrhoea, ruffled feathers, dullness.","Gumboro (da 3 a 8 settimane): diarrea bianca, piume arruffate, abbattimento.","Gumboro (de 3 a 8 semanas): diarrea blanca, plumas erizadas, decaimiento."],
"Coccidiose : fientes avec du sang, poussins en boule.":["Coccidiosis: droppings with blood, chicks huddled.","Coccidiosi: feci con sangue, pulcini raggomitolati.","Coccidiosis: heces con sangre, pollitos acurrucados."],
"Coup de froid ou de chaleur au démarrage : vérifier le chauffage et l'aération.":["Chill or heat stress at brooding: check heating and ventilation.","Colpo di freddo o di calore nella prima fase: controllare riscaldamento e aerazione.","Golpe de frío o de calor al inicio: revisar la calefacción y la ventilación."],
"Coup de chaleur : halètement, ailes écartées, morts aux heures chaudes.":["Heat stroke: panting, spread wings, deaths in the hot hours.","Colpo di calore: ansimare, ali aperte, morti nelle ore calde.","Golpe de calor: jadeo, alas abiertas, muertes en las horas de calor."],
"Choléra aviaire ou colibacillose : morts brutales chez les adultes.":["Fowl cholera or colibacillosis: sudden deaths in adults.","Colera aviare o colibacillosi: morti improvvise negli adulti.","Cólera aviar o colibacilosis: muertes repentinas en adultos."],
"Grippe aviaire : beaucoup de morts en 1 à 2 jours, crêtes violettes. Prévenir les services vétérinaires.":["Avian influenza: many deaths in 1 to 2 days, purple combs. Alert the veterinary services.","Influenza aviaria: molti morti in 1-2 giorni, creste violacee. Avvisare i servizi veterinari.","Gripe aviar: muchas muertes en 1 a 2 días, crestas moradas. Avisar a los servicios veterinarios."],
"Manque d'eau ou aliment abîmé : abreuvoirs vides, aliment moisi.":["Lack of water or spoiled feed: empty drinkers, mouldy feed.","Mancanza d'acqua o mangime guasto: abbeveratoi vuoti, mangime ammuffito.","Falta de agua o pienso estropeado: bebederos vacíos, pienso enmohecido."],
"Stress de chaleur : ponte en baisse aux saisons chaudes.":["Heat stress: lower laying in hot seasons.","Stress da calore: deposizione in calo nelle stagioni calde.","Estrés por calor: menos puesta en las épocas de calor."],
"Aliment changé, mal dosé ou pauvre en calcium.":["Feed changed, badly dosed or low in calcium.","Mangime cambiato, mal dosato o povero di calcio.","Pienso cambiado, mal dosificado o pobre en calcio."],
"Bronchite infectieuse ou Newcastle : œufs déformés, à coquille fine.":["Infectious bronchitis or Newcastle: misshapen, thin-shelled eggs.","Bronchite infettiva o Newcastle: uova deformi, a guscio sottile.","Bronquitis infecciosa o Newcastle: huevos deformes, de cáscara fina."],
"Éclairage trop court : moins de 16 heures de lumière par jour.":["Lighting too short: less than 16 hours of light a day.","Illuminazione troppo breve: meno di 16 ore di luce al giorno.","Iluminación demasiado corta: menos de 16 horas de luz al día."],
"Poux et acariens : poules qui se grattent, crêtes pâles.":["Lice and mites: hens scratching, pale combs.","Pidocchi e acari: galline che si grattano, creste pallide.","Piojos y ácaros: gallinas que se rascan, crestas pálidas."],
"Peste porcine africaine : fièvre, taches rouges, morts rapides. Prévenir les services vétérinaires.":["African swine fever: fever, red patches, rapid deaths. Alert the veterinary services.","Peste suina africana: febbre, macchie rosse, morti rapide. Avvisare i servizi veterinari.","Peste porcina africana: fiebre, manchas rojas, muertes rápidas. Avisar a los servicios veterinarios."],
"Coup de chaleur : halètement, animaux couchés, morts aux heures chaudes.":["Heat stroke: panting, animals lying down, deaths in the hot hours.","Colpo di calore: ansimare, animali sdraiati, morti nelle ore calde.","Golpe de calor: jadeo, animales tumbados, muertes en las horas de calor."],
"Diarrhées des jeunes (colibacillose).":["Diarrhoea in young animals (colibacillosis).","Diarree dei giovani (colibacillosi).","Diarreas de los jóvenes (colibacilosis)."],
"Intoxication : aliment moisi, plantes toxiques, excès d'urée.":["Poisoning: mouldy feed, toxic plants, too much urea.","Intossicazione: mangime ammuffito, piante tossiche, eccesso di urea.","Intoxicación: pienso enmohecido, plantas tóxicas, exceso de urea."],
"Peste des petits ruminants (PPR) : fièvre, jetage, diarrhée.":["Peste des petits ruminants (PPR): fever, nasal discharge, diarrhoea.","Peste dei piccoli ruminanti (PPR): febbre, scolo nasale, diarrea.","Peste de los pequeños rumiantes (PPR): fiebre, secreción nasal, diarrea."],
"Pasteurellose : toux, fièvre, respiration difficile.":["Pasteurellosis: cough, fever, difficult breathing.","Pasteurellosi: tosse, febbre, respirazione difficile.","Pasteurelosis: tos, fiebre, respiración difícil."],
"Parasites : amaigrissement, diarrhée, muqueuses pâles.":["Parasites: weight loss, diarrhoea, pale mucous membranes.","Parassiti: dimagrimento, diarrea, mucose pallide.","Parásitos: adelgazamiento, diarrea, mucosas pálidas."],
"Manque d'oxygène : poissons en surface le matin.":["Lack of oxygen: fish at the surface in the morning.","Mancanza di ossigeno: pesci in superficie al mattino.","Falta de oxígeno: peces en la superficie por la mañana."],
"Eau sale ou trop chaude : changer une partie de l'eau.":["Dirty or too warm water: change part of the water.","Acqua sporca o troppo calda: cambiare una parte dell'acqua.","Agua sucia o demasiado caliente: cambiar parte del agua."],
"Trop d'aliment : les restes pourrissent dans l'eau.":["Too much feed: leftovers rot in the water.","Troppo mangime: i resti marciscono nell'acqua.","Demasiado pienso: los restos se pudren en el agua."],
"Maladie bactérienne : taches, nageoires abîmées.":["Bacterial disease: spots, damaged fins.","Malattia batterica: macchie, pinne danneggiate.","Enfermedad bacteriana: manchas, aletas dañadas."],
"Isoler les malades et retirer les morts tout de suite (brûler ou enterrer avec de la chaux).":["Isolate sick animals and remove the dead at once (burn or bury with lime).","Isolare i malati e togliere subito i morti (bruciare o seppellire con calce).","Aislar a los enfermos y retirar los muertos de inmediato (quemar o enterrar con cal)."],
"Appeler un vétérinaire aujourd'hui et faire autopsier un sujet.":["Call a vet today and have one animal autopsied.","Chiamare un veterinario oggi e far fare l'autopsia a un capo.","Llamar a un veterinario hoy y hacer la autopsia de un animal."],
"Ne pas vendre ni déplacer d'animaux du lot avant l'avis du vétérinaire.":["Do not sell or move animals from the batch before the vet's advice.","Non vendere né spostare animali del lotto prima del parere del veterinario.","No vender ni mover animales del lote antes del consejo del veterinario."],
"Pédiluve à l'entrée, matériel désinfecté, aucune visite.":["Footbath at the entrance, disinfected equipment, no visits.","Pediluvio all'ingresso, materiale disinfettato, nessuna visita.","Pediluvio en la entrada, material desinfectado, ninguna visita."],
"Vérifier l'eau (propre, fraîche, en quantité) et l'aliment.":["Check the water (clean, cool, enough) and the feed.","Controllare l'acqua (pulita, fresca, sufficiente) e il mangime.","Revisar el agua (limpia, fresca, suficiente) y el pienso."],
"Alerte sanitaire":["Health alert","Allerta sanitaria","Alerta sanitaria"]
};
{const D=window.B2A_DICT=window.B2A_DICT||{};["en","it","es"].forEach((l,i)=>{D[l]=D[l]||{};for(const k in T)if(D[l][k]==null)D[l][k]=T[k][i]})}

/* ================= styles ================= */
const css=el("style");css.textContent=`
.pp-card{border-left:5px solid #1b2e4c}.pp-card.bad{border-left-color:#a3342a}.pp-card.warn{border-left-color:#d6a95a}.pp-card.good{border-left-color:#2c6a17}
.pp-card h2{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.pp-card ul{margin:4px 0 8px;padding-left:20px;display:grid;gap:4px}
.pp-btns{display:flex;gap:8px;flex-wrap:wrap}.pp-sub{font:700 14px var(--body);margin:8px 0 2px}
.pp-tab{width:100%;border-collapse:collapse;font-size:14px}.pp-tab td{padding:5px 4px;border-bottom:1px solid var(--line)}.pp-tab td.n{text-align:right;white-space:nowrap}
.pp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.pp-grid .full{grid-column:1/-1}
.m-pro{display:inline-flex;gap:4px;align-items:center;align-self:start;font-size:11px;font-weight:700;color:#2c6a17;background:#e6f3dd;border-radius:6px;padding:1px 6px}
.m-pro b{color:#fff;background:#1b2e4c;border-radius:4px;padding:0 4px;font-size:10px;letter-spacing:.06em}.m-card-pro{box-shadow:0 0 0 2px #72ac48 inset}`;document.head.append(css);

/* ================= ville de l'utilisateur (inscription) ================= */
let VILLE=B.lsGet("b2a-pp-ville")||"",PAYS=B.lsGet("b2a-pp-pays")||"";
const ville=()=>VILLE||B.lsGet("b2a-pe-ville")||"";
async function loadVille(){if(VILLE||!B.CFG||!navigator.onLine)return;try{const s=PRO()&&await PRO().store();if(!s)return;const d=await s.doc("inscriptions/"+s.uid).get();
  if(d.exists){VILLE=(d.data().ville||"").trim();PAYS=(d.data().pays||"").trim();if(VILLE)B.lsSet("b2a-pp-ville",VILLE);if(PAYS)B.lsSet("b2a-pp-pays",PAYS);paint()}}catch(e){}}

/* ================= 1. veille sanitaire ================= */
const grpOf=l=>{const e=norm(l.espece);return /poisson|tilapia|silure|clarias/.test(e)?"poisson":/porc|truie/.test(e)?"porc":/mouton|chevre|bovin|vache|boeuf|ovin|caprin/.test(e)?"rum":/poule|poulet|pintade|dinde|caille|canard|pondeuse|chair|volaille/.test(e)?"volaille":null};
function causes(g,signe,age){
  if(g==="volaille"&&signe==="ponte")return ["Stress de chaleur : ponte en baisse aux saisons chaudes.","Manque d'eau ou aliment abîmé : abreuvoirs vides, aliment moisi.","Aliment changé, mal dosé ou pauvre en calcium.","Bronchite infectieuse ou Newcastle : œufs déformés, à coquille fine.","Éclairage trop court : moins de 16 heures de lumière par jour.","Poux et acariens : poules qui se grattent, crêtes pâles."];
  if(g==="volaille"){const c=["Maladie de Newcastle : râles, torticolis, diarrhée verdâtre. Très contagieuse."];
    if(age!=null&&age>=3&&age<=8)c.push("Gumboro (3 à 8 semaines) : diarrhée blanche, plumes ébouriffées, abattement.");
    if(age!=null&&age<=8)c.push("Coccidiose : fientes avec du sang, poussins en boule.","Coup de froid ou de chaleur au démarrage : vérifier le chauffage et l'aération.");
    else c.push("Coup de chaleur : halètement, ailes écartées, morts aux heures chaudes.","Choléra aviaire ou colibacillose : morts brutales chez les adultes.");
    c.push("Grippe aviaire : beaucoup de morts en 1 à 2 jours, crêtes violettes. Prévenir les services vétérinaires.","Manque d'eau ou aliment abîmé : abreuvoirs vides, aliment moisi.");return c}
  if(g==="porc")return ["Peste porcine africaine : fièvre, taches rouges, morts rapides. Prévenir les services vétérinaires.","Coup de chaleur : halètement, animaux couchés, morts aux heures chaudes.","Diarrhées des jeunes (colibacillose).","Intoxication : aliment moisi, plantes toxiques, excès d'urée."];
  if(g==="rum")return ["Peste des petits ruminants (PPR) : fièvre, jetage, diarrhée.","Pasteurellose : toux, fièvre, respiration difficile.","Parasites : amaigrissement, diarrhée, muqueuses pâles.","Intoxication : aliment moisi, plantes toxiques, excès d'urée."];
  return ["Manque d'oxygène : poissons en surface le matin.","Eau sale ou trop chaude : changer une partie de l'eau.","Trop d'aliment : les restes pourrissent dans l'eau.","Maladie bactérienne : taches, nageoires abîmées."]}
const GESTES=["Isoler les malades et retirer les morts tout de suite (brûler ou enterrer avec de la chaux).","Appeler un vétérinaire aujourd'hui et faire autopsier un sujet.","Ne pas vendre ni déplacer d'animaux du lot avant l'avis du vétérinaire.","Pédiluve à l'entrée, matériel désinfecté, aucune visite.","Vérifier l'eau (propre, fraîche, en quantité) et l'aliment."];
const mean=a=>a.length?a.reduce((p,c)=>p+c,0)/a.length:null;
/* anomalies détectées sur la dernière saisie (aujourd'hui ou hier) */
function anomalies(){const out=[];const t=today();
  (A.lots()||[]).forEach(l=>{if(A.isCrop&&A.isCrop(l))return;const g=grpOf(l);if(!g)return;let s;try{s=A.stats(l)}catch(e){return}
    const R=s.rows||[];if(!R.length)return;const last=R[R.length-1];if(days(last.date,t)>1)return;
    const prev=R.slice(-8,-1).map(r=>r.morts||0);const avg=mean(prev)||0;const m=last.morts||0;
    if(m>=Math.max(3,last.start*0.003)&&m>=3*avg+1)out.push({l,g,signe:"mortalite",bad:m>=last.start*0.01,m,avg,date:last.date,age:s.ageW});
    if(A.isLayer&&A.isLayer(l)){const p3=mean(R.slice(-3).map(r=>r.ponte).filter(x=>x!=null)),p7=mean(R.slice(-10,-3).map(r=>r.ponte).filter(x=>x!=null));
      if(p3!=null&&p7!=null&&p7-p3>=8)out.push({l,g,signe:"ponte",bad:p7-p3>=15,p3,p7,date:last.date,age:s.ageW})}});
  return out}
function anoCard(a){const c=el("section","card pp-card "+(a.bad?"bad":"warn"));const h=el("h2","sec");h.append(notr(el("span","pro-badge","PRO")),el("span",null,a.signe==="ponte"?"Chute de ponte":"Mortalité brutale"),document.createTextNode(" · "),notr(el("span",null,a.l.nom||a.l.espece||"")));c.append(h);
  const p=el("p");if(a.signe==="ponte"){p.append(el("span",null,"ponte des 3 derniers jours"),notr(el("b",null," "+fmt(a.p3,1)+" % ")),el("span",null,"avant"),notr(el("span",null," "+fmt(a.p7,1)+" %")))}
  else{p.append(notr(el("b",null,fmt(a.m)+" ")),el("span",null,"morts aujourd'hui"),document.createTextNode(" ("),el("span",null,"en moyenne avant"),notr(el("span",null," "+fmt(a.avg,1)+")")))}c.append(p);
  c.append(el("p","pp-sub","Causes probables"));const u=el("ul");causes(a.g,a.signe,a.age).forEach(x=>u.append(el("li",null,x)));c.append(u);
  c.append(el("p","pp-sub","À faire tout de suite"));const u2=el("ul");GESTES.forEach(x=>u2.append(el("li",null,x)));c.append(u2);
  const bt=el("div","pp-btns");const v=el("button","btn small","Trouver un vétérinaire");v.type="button";v.onclick=()=>{const m=$("tab-marche");if(m)m.click();setTimeout(()=>{try{window.B2A_SERVICES&&window.B2A_SERVICES.open&&window.B2A_SERVICES.open()}catch(e){}},80)};
  const gd=el("button","btn small ghost","Guide santé et photo");gd.type="button";gd.onclick=()=>{const d=$("tab-diagnostic");if(d)d.click()};bt.append(v,gd);c.append(bt);return c}
function teaser(msg,detail){const c=el("section","card pp-card warn");const h=el("h2","sec");h.append(notr(el("span","pro-badge","PRO")),el("span",null,"Alerte sanitaire"));c.append(h);
  const p=el("p");p.append(el("span",null,msg));if(detail)p.append(document.createTextNode(" "),notr(el("b",null,detail)));c.append(p);
  if(msg.indexOf("lot")>=0)c.append(el("p","note","La version Pro vous donne les causes probables, les gestes à faire tout de suite et le vétérinaire le plus proche."));
  const b=el("button","btn small","Découvrir la version Pro");b.type="button";b.onclick=()=>{b.remove();const p2=PRO();if(p2&&p2.lockCard)p2.lockCard(c,"sante")};c.append(b);return c}
/* notification une fois par jour et par lot */
async function notify(a){const k="b2a-pp-n-"+a.l.id+"-"+a.signe;if(B.lsGet(k)===today())return;B.lsSet(k,today());
  const title=tr(a.signe==="ponte"?"Chute de ponte":"Mortalité brutale")+" · "+(a.l.nom||""),body=tr("Causes probables")+" : "+tr(causes(a.g,a.signe,a.age)[0]);
  try{const C=window.Capacitor,LN=C&&C.Plugins&&C.Plugins.LocalNotifications;
    if(LN&&C.isNativePlatform&&C.isNativePlatform()){await LN.schedule({notifications:[{id:96000000+Math.floor(Math.random()*999999),title,body,schedule:{at:new Date(Date.now()+3000)},extra:{tab:"tableau"}}]});return}
    if("Notification" in window&&Notification.permission==="granted"){const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();if(reg&&reg.showNotification)reg.showNotification(title,{body,icon:"icons/icon-192.png",tag:k});else new Notification(title,{body})}}catch(e){}}

/* ================= 2. alertes de la zone ================= */
let zone=[],zoneT=0;
async function report(a){if(!B.CFG||!navigator.onLine||!ville())return;const k="b2a-pp-z-"+a.g+"-"+a.signe;if(B.lsGet(k)===today())return;
  try{const s=PRO()&&await PRO().store();if(!s)return;const date=today();
    await s.doc("alertes_zone/"+s.uid+"_"+date+"_"+a.g).set({auteur:s.uid,ville:norm(ville()),pays:norm(PAYS).slice(0,40),grp:a.g,signe:a.signe,date,creeLe:s.ts()});B.lsSet(k,today())}catch(e){B.lsSet(k,today())}}
async function loadZone(){if(!B.CFG||!navigator.onLine||!ville()||Date.now()-zoneT<30*60e3)return;zoneT=Date.now();
  try{const s=PRO()&&await PRO().store();if(!s)return;const q=await s.col("alertes_zone").where("ville","==",norm(ville())).limit(300).get();
    const lim=iso(new Date(Date.now()-14*864e5));const by={};q.docs.forEach(d=>{const z=d.data();if(z.date<lim||z.auteur===s.uid)return;const k=z.grp+"|"+z.signe;(by[k]=by[k]||{g:z.grp,s:z.signe,a:new Set()}).a.add(z.auteur)});
    zone=Object.values(by).filter(x=>x.a.size>=2).map(x=>({g:x.g,s:x.s,n:x.a.size}));paint()}catch(e){}}
const GN={volaille:"volailles",porc:"porcs",rum:"ruminants",poisson:"poissons"},SN={mortalite:"mortalité brutale",ponte:"chute de ponte"};
function zoneCard(z){const c=el("section","card pp-card bad");const h=el("h2","sec");h.append(notr(el("span","pro-badge","PRO")),el("span",null,"Alerte maladie dans votre zone"));c.append(h);
  const p=el("p");p.append(notr(el("b",null,fmt(z.n)+" ")),el("span",null,"fermes de votre ville ont signalé ce signe ces 14 derniers jours :"),document.createTextNode(" "),el("b",null,GN[z.g]),document.createTextNode(", "),el("span",null,SN[z.s]));c.append(p);
  c.append(el("p",null,"Renforcez la biosécurité : pédiluve, pas de visiteurs, pas d'achat d'animaux, vaccins à jour."));
  const u=el("ul");causes(z.g,z.s,null).slice(0,3).forEach(x=>u.append(el("li",null,x)));c.append(u);return c}

/* ================= 3. alerte prix ================= */
function prixCard(){const lines=[];
  (A.lots()||[]).forEach(l=>{if(A.isCrop&&A.isCrop(l))return;let s=null;try{s=A.stats(l)}catch(e){}
    if(A.isLayer&&A.isLayer(l)&&Number(l.prixOeuf)>0){const w=web("oeufs-plateau",1);if(w){const mine=Number(l.prixOeuf)*30;const tpm=s&&s.oeufs7?s.oeufs7/7*30/30:0;lines.push({lab:"Plateau de 30 œufs",lot:l.nom,mine,w,gain:mine<w.q1?(w.med-mine)*tpm:0})}}
    else if(/chair/i.test(l.espece||"")&&Number(l.prixSujet)>0){const w=web("poulet-chair",1);if(w)lines.push({lab:"Poulet de chair",lot:l.nom,mine:Number(l.prixSujet),w,gain:0})}});
  if(!lines.length)return null;
  const c=el("section","card pp-card "+(lines.some(x=>x.mine<x.w.q1)?"warn":"good"));const h=el("h2","sec");h.append(notr(el("span","pro-badge","PRO")),el("span",null,"Vos prix de vente"));c.append(h);
  lines.forEach(x=>{const d=el("div");const t=el("p");t.append(el("b",null,x.lab),notr(el("span",null," · "+(x.lot||"")+" · ")),el("span",null,"Vous vendez"),notr(el("b",null," "+fmt(x.mine)+" F")),document.createTextNode(" · "),el("span",null,"Prix du marché"),notr(el("b",null," "+fmt(x.w.prix)+" F")),notr(el("span",null," ("+fmt(x.w.q1)+" – "+fmt(x.w.q3)+" F)")));d.append(t);
    const m=el("p","msg");if(x.mine<x.w.q1){m.className="msg err";m.append(el("span",null,"Vous vendez moins cher que le marché : vous pourriez gagner environ"),notr(el("b",null,x.gain>0?" "+fmt(Math.round(x.gain/500)*500)+" F ":" … ")),el("span",null,"par mois."))}
    else if(x.mine>x.w.q3)m.append(el("span",null,"Vous vendez plus cher que le marché : attention à la mévente."));else{m.className="msg good";m.append(el("span",null,"Votre prix est dans la moyenne du marché."))}d.append(m);c.append(d)});return c}

/* ================= 4. rapport du mois ================= */
const MOIS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
function rapport(){const t=new Date(),ym=iso(t).slice(0,7),Y=t.getFullYear();let oe=0,mo=0;
  (A.saisies()||[]).forEach(s=>{if(String(s.date||"").slice(0,7)!==ym)return;oe+=N(s.oeufs)||0;mo+=N(s.morts)||0});
  let ven=0;(A.factures()||[]).forEach(f=>{if(String(f.date||"").slice(0,7)===ym)try{ven+=A.facTotals(f).total||0}catch(e){}});
  let bil=null;try{bil=window.B2A_BILAN&&window.B2A_BILAN.compute(Y)}catch(e){bil=null}
  const al=[];(A.lots()||[]).forEach(l=>{try{const s=A.stats(l);(s.alerts||[]).filter(a=>a[0]==="bad").forEach(a=>al.push((l.nom||"")+" : "+tr(a[1])))}catch(e){}});
  anomalies().forEach(a=>al.push((a.l.nom||"")+" : "+tr(a.signe==="ponte"?"Chute de ponte":"Mortalité brutale")));
  let lg="fr";try{lg=window.B2A_LANG?window.B2A_LANG():"fr"}catch(e){}
  return {mois:t.toLocaleDateString(lg,{month:"long",year:"numeric"}),oe,mo,ven,bil,al}}
function rapportTxt(r){const L=["B2A Smart Farming · "+tr("Rapport du mois")+" · "+r.mois,""];
  if(r.oe)L.push(tr("Œufs")+" : "+fmt(r.oe)+" ("+fmt(r.oe/30)+" "+tr("plateaux")+")");L.push(tr("Morts")+" : "+fmt(r.mo));L.push(tr("Ventes facturées")+" : "+fmt(r.ven)+" F");
  if(r.bil&&!r.bil.empty)L.push("",tr("Depuis janvier")+" :",tr("Chiffre d'affaires")+" : "+fmt(r.bil.ca)+" F",tr("Dépenses")+" : "+fmt(r.bil.dep)+" F",tr("Bénéfice net")+" : "+fmt(r.bil.net)+" F");
  L.push("",tr("Alertes en cours")+" : "+(r.al.length?"":tr("Aucune")));r.al.slice(0,8).forEach(a=>L.push("• "+a));return L.join("\n").replace(/ | /g," ")}
function rapportCard(){const r=rapport();const c=el("section","card pp-card");const h=el("h2","sec");h.append(notr(el("span","pro-badge","PRO")),el("span",null,"Rapport du mois"),document.createTextNode(" · "),notr(el("span",null,r.mois)));c.append(h);
  const t=el("table","pp-tab"),b=el("tbody");t.append(b);const row=(k,v)=>{const x=el("tr");x.append(el("td",null,k),notr(el("td","n",v)));b.append(x)};
  if(r.oe)row("Œufs",fmt(r.oe)+" ("+fmt(r.oe/30)+" "+tr("plateaux")+")");row("Morts",fmt(r.mo));row("Ventes facturées",fmt(r.ven)+" F");
  if(r.bil&&!r.bil.empty){row("Chiffre d'affaires",fmt(r.bil.ca)+" F");row("Dépenses",fmt(r.bil.dep)+" F");row("Bénéfice net",fmt(r.bil.net)+" F")}c.append(t);
  const bt=el("div","pp-btns");const s=el("button","btn small","Partager sur WhatsApp");s.type="button";s.onclick=()=>share(rapportTxt(rapport()));bt.append(s);
  const C=window.Capacitor;if(C&&C.isNativePlatform&&C.isNativePlatform()&&C.Plugins&&C.Plugins.LocalNotifications){const rb=el("button","btn small ghost","Me le rappeler à la fin du mois");rb.type="button";const m=el("span","msg");
    rb.onclick=async()=>{const d=new Date();const e=new Date(d.getFullYear(),d.getMonth()+1,0,19,0,0);if(e<=d)e.setMonth(e.getMonth()+1,0);
      try{await C.Plugins.LocalNotifications.schedule({notifications:[{id:95000001,title:tr("Rapport du mois")+" · B2A Smart Farming",body:tr("Partager sur WhatsApp"),schedule:{at:e,allowWhileIdle:true},extra:{tab:"tableau"}}]});m.textContent=tr("Rappel programmé.");m.className="msg good"}catch(x){}};bt.append(rb,m)}
  c.append(bt);return c}

/* ================= accueil : affichage ================= */
let host=null,sig="";
function paint(force){const home=$("home")||$("v-tableau");if(!home)return;
  if(!host){host=el("div");host.id="pp-home";const ac=$("alertcard");if(ac&&ac.parentNode)ac.parentNode.insertBefore(host,ac);else home.prepend(host)}
  const ano=anomalies();const s=[isPro(),ano.map(a=>a.l.id+a.signe).join(),JSON.stringify(zone),(A.saisies()||[]).length,(A.factures()||[]).length,(A.lots()||[]).length].join("|");
  if(s===sig&&!force)return;sig=s;host.innerHTML="";
  if(isPro()){ano.forEach(a=>{host.append(anoCard(a));notify(a);report(a)});zone.forEach(z=>host.append(zoneCard(z)));
    const pc=prixCard();if(pc)host.append(pc);if((A.lots()||[]).length)host.append(rapportCard())}
  else{if(ano.length)host.append(teaser("Une anomalie est détectée sur un lot :",ano.map(a=>a.l.nom).join(", ")));
    else if(zone.length)host.append(teaser("Une alerte maladie concerne votre ville. La version Pro vous dit laquelle et comment protéger vos animaux."))}}

/* ================= 5. soins des 7 prochains jours (calendrier) ================= */
function soins7(){const t=today(),end=iso(new Date(Date.now()+7*864e5));const L=[];
  (A.lots()||[]).forEach(l=>{let p=[];try{p=A.programme(l)}catch(e){}p.forEach(x=>{if(!x.done&&x.date>=t&&x.date<=end)L.push({d:x.date,n:x.nom,l:l.nom||""})})});return L.sort((a,b)=>a.d<b.d?-1:1)}
function paintSoins(){const v=$("v-calendrier");if(!v||v.hidden)return;let c=$("pp-soins");if(!c){c=el("section","card pp-card");c.id="pp-soins";v.prepend(c)}c.innerHTML="";
  const h=el("h2","sec");h.append(notr(el("span","pro-badge","PRO")),el("span",null,"Soins des 7 prochains jours"));c.append(h);
  if(!isPro()){const p=PRO();if(p&&p.lockCard)p.lockCard(c,"soins");return}
  c.append(el("p","note","Envoyez la liste à votre équipe ou à votre vétérinaire sur WhatsApp."));const L=soins7();
  if(!L.length){c.append(el("p",null,"Aucun soin prévu dans les 7 prochains jours."));return}
  const u=el("ul");L.forEach(x=>{const li=el("li");li.append(notr(el("b",null,new Date(x.d+"T12:00").toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})+" · ")),el("span",null,x.n),notr(el("span",null," ("+x.l+")")));u.append(li)});c.append(u);
  const b=el("button","btn small","Partager sur WhatsApp");b.type="button";b.onclick=()=>share(["B2A Smart Farming · "+tr("Soins des 7 prochains jours"),""].concat(L.map(x=>"• "+new Date(x.d+"T12:00").toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"})+" : "+tr(x.n)+" ("+x.l+")")).join("\n"));c.append(b)}

/* ================= 6. prix du jour des matières premières (formules) ================= */
const MAP={mais:["mais",100],sorgho:["sorgho",100],mil:["mil",100],soja:["tourteau-soja",50],son:["son",50],sonriz:["son",50]};
function paintForm(){const box=$("f-animal-box");if(!box||$("v-formules").hidden)return;let c=$("pp-form");if(!c){c=el("section","card pp-card");c.id="pp-form";box.prepend(c)}c.innerHTML="";
  const h=el("h2","sec");h.append(notr(el("span","pro-badge","PRO")),el("span",null,"Prix du jour des matières premières"));c.append(h);
  if(!isPro()){const p=PRO();if(p&&p.lockCard)p.lockCard(c,"formule");return}
  try{PRO().loadPrix()}catch(e){}
  const rows=Object.entries(MAP).map(([k,[pid,div]])=>{const w=web(pid,div);return w&&A.ING&&A.ING[k]?{k,n:A.ING[k].n,cur:A.prixIng?A.prixIng(k):null,v:w.v}:null}).filter(Boolean);
  if(!rows.length){c.append(el("p","note","Pas encore assez de prix trouvés pour les matières premières."));return}
  c.append(el("p","note","Prix trouvés sur internet dans votre ville. Appliquez-les, puis calculez la formule la moins chère."));
  const t=el("table","pp-tab"),b=el("tbody");t.append(b);const hr=el("tr");[["",""],["Votre prix","n"],["Prix du jour","n"]].forEach(([x,cl])=>hr.append(el("td",cl||null,x)));b.append(hr);
  rows.forEach(r=>{const x=el("tr");x.append(el("td",null,r.n),notr(el("td","n",fmt(r.cur)+" F/kg")),notr(el("td","n",fmt(r.v)+" F/kg")));b.append(x)});c.append(t);
  const ap=el("button","btn small","Appliquer les prix du jour et calculer la formule la moins chère");ap.type="button";
  ap.onclick=()=>{rows.forEach(r=>{try{A.setPrixIng(r.k,r.v)}catch(e){}});try{A.renderFormules()}catch(e){}setTimeout(()=>{const o=$("f-opt");if(o){o.click();const m=$("f-optmsg");if(m)m.scrollIntoView({behavior:"smooth",block:"center"})}paintForm()},150)};c.append(ap)}

/* ================= 7. commandes groupées (Marché) ================= */
const PRODG=[["aliment-ponte","Aliment ponte (sacs de 50 kg)"],["aliment-chair","Aliment chair (sacs de 50 kg)"],["aliment-betail","Aliment bétail (sacs de 50 kg)"],["poussins-ponte","Poussins pondeuses"],["poussins-chair","Poussins chair"],["vaccins","Vaccins (doses)"],["autre","Autre"]];
let mesCg=null;
function cgCard(){const c=el("section","card pp-card");c.id="pp-cg";const h=el("h2","sec");h.append(notr(el("span","pro-badge","PRO")),el("span",null,"Commandes groupées B2A"));c.append(h);
  c.append(el("p","note","Aliment, poussins et vaccins moins chers : B2A regroupe les commandes des abonnés de votre ville et négocie le prix avec le fournisseur."));
  if(!isPro()){const p=PRO();if(p&&p.lockCard)p.lockCard(c,"groupe");return c}
  const open=el("button","btn small","Commander");open.type="button";c.append(open);
  open.onclick=()=>{open.remove();const g=el("div","pp-grid");const fld=(lab,inp,full)=>{const f=el("div","field"+(full?" full":""));const id="pp-"+Math.random().toString(36).slice(2,8);inp.id=id;const l=el("label",null,lab);l.htmlFor=id;f.append(l,inp);g.append(f);return inp};
    const pr=el("select");PRODG.forEach(([k,n])=>{const o=el("option",null,n);o.value=k;pr.append(o)});fld("Produit",pr,true);
    const q=el("input");q.type="number";q.min="1";q.inputMode="numeric";fld("Quantité",q);const vi=el("input");vi.maxLength=60;vi.value=ville();fld("Ville",vi);
    const te=el("input");te.type="tel";te.maxLength=30;fld("Téléphone",te,true);const no=el("input");no.maxLength=300;fld("Remarque (facultatif)",no,true);
    const m=el("p","msg");m.setAttribute("aria-live","polite");const sb=el("button","btn","Envoyer la demande");sb.type="button";c.append(g,sb,m);
    sb.onclick=async()=>{const qq=Math.round(N(q.value)||0);if(!(qq>0)||!vi.value.trim()||String(te.value).replace(/\D/g,"").length<8){m.textContent=tr("Indiquez la quantité, la ville et le téléphone.");m.className="msg err";return}
      sb.disabled=true;try{const s=await PRO().store();if(!s)throw new Error("store");
        await s.col("commandes_groupees").add({uid:s.uid,cle:String(PRO().cle()||"").slice(0,50),nom:(B.lsGet(B.LS_NAME)||"").slice(0,60),tel:te.value.trim().slice(0,30),ville:vi.value.trim().slice(0,60),produit:pr.value,qte:qq,note:no.value.trim().slice(0,300),statut:"attente",creeLe:s.ts()});
        m.textContent=tr("Demande envoyée : B2A vous appelle avec le prix négocié.");m.className="msg good";mesCg=null}catch(e){console.warn(e);m.textContent=tr("Envoi impossible. Vérifiez la connexion et réessayez.");m.className="msg err";sb.disabled=false}}};
  /* mes demandes */
  const lst=el("div");c.append(lst);
  (async()=>{try{if(!mesCg){const s=await PRO().store();if(!s)return;const q=await s.col("commandes_groupees").where("uid","==",s.uid).limit(20).get();mesCg=q.docs.map(d=>d.data())}
    if(!mesCg.length)return;lst.append(el("p","pp-sub","Mes demandes"));const u=el("ul");mesCg.forEach(x=>{const li=el("li");li.append(el("span",null,(PRODG.find(p=>p[0]===x.produit)||["",x.produit])[1]),notr(el("span",null," · "+fmt(x.qte)+" · ")),el("span",null,x.statut==="traitee"?"traitée":"en attente"));u.append(li)});lst.append(u)}catch(e){}})();
  return c}
{const body=$("m-body");if(body){let busy=false;new MutationObserver(()=>{if(busy)return;const v=document.querySelector('#m-seg [data-m="acheter"][aria-pressed="true"]');if(!v||$("pp-cg")||!B.CFG)return;
  busy=true;try{body.prepend(cgCard())}finally{busy=false}}).observe(body,{childList:true})}}

/* ================= boucle ================= */
const tick=()=>{try{if($("v-tableau")&&!$("v-tableau").hidden)paint()}catch(e){console.warn(e)}try{paintSoins()}catch(e){}try{paintForm()}catch(e){}};
document.querySelectorAll('nav.tabs [role="tab"]').forEach(t=>t.addEventListener("click",()=>setTimeout(()=>{sig="";tick()},120)));
setInterval(tick,5000);setTimeout(()=>{tick();loadVille().then(loadZone)},2500);setInterval(()=>{loadVille().then(loadZone)},30*60e3);
window.B2A_PROPLUS={anomalies,rapport,rapportTxt,paint:()=>{sig="";paint()},soins7};
})();
