/* B2A Smart Farming : version Pro — Simulation d'un projet d'élevage ou de culture
   B2A-HIGH-TECHNOLOGY-AUTOMATION · Bayere Abdoul Aziz
   Avant de commencer un projet, l'éleveur ou l'agriculteur choisit ce qu'il veut faire (poules pondeuses, poulets de chair,
   porcs, moutons, bovins, poissons, ou une culture) et la taille du projet. L'application calcule :
   - toutes les dépenses du début à la fin : terrain, bâtiment, clôture, eau, matériel, animaux ou semences, aliment,
     soins, main-d'œuvre, eau et électricité, imprévus ;
   - les recettes, le bénéfice, la rentabilité et le mois où l'argent investi est récupéré ;
   - la superficie nécessaire (bâtiment, annexes, terrain) et le plan de construction (dessin + matériaux) ;
   - le plan de financement : argent à réunir, apport personnel, crédit et mensualité ;
   - le calendrier mois par mois, exportable en PDF ou partagé sur WhatsApp.
   Les valeurs par défaut sont indicatives (Burkina Faso, FCFA) et modifiables ; quand B2A a trouvé assez de prix sur
   internet (étude du marché de la version Pro), ce prix remplace la valeur par défaut. */
(function(){
const B=window.B2A;if(!B||!B.app)return;const A=B.app;
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const notr=e=>{e.setAttribute("data-notr","");return e};
const tr=s=>window.__tr?window.__tr(s):s;
const fmt=(v,d=0)=>v==null||!isFinite(v)?"—":Number(v).toLocaleString("fr-FR",{maximumFractionDigits:d,minimumFractionDigits:d});
const N=v=>{if(v===""||v==null)return null;const n=Number(String(v).replace(",",".").replace(/\s/g,""));return isFinite(n)?n:null};
const F=v=>fmt(Math.round(v))+" F";
const LS="b2a-projet-sim";
const PRO=()=>window.B2A_PRO||null;
const isPro=()=>{const p=PRO();return !!(p&&p.isPro&&p.isPro())};
const ESSAI=/\/essai\//.test(location.pathname);
/* prix trouvés sur internet (au moins 3 prix) : div = taille de l'unité (sac de 50 kg → 50) */
const web=(pid,div)=>{try{const p=PRO();const e=p&&p.etude?p.etude(pid):null;return e&&e.n>=3&&e.prix?Math.round(e.prix/(div||1)):null}catch(e){return null}};

/* ================= traductions ================= */
const T={
"Simulation de projet":["Project simulation","Simulazione di progetto","Simulación de proyecto"],
"Dépenses, bâtiment, superficie et financement d'un nouveau projet":["Expenses, building, area and financing of a new project","Spese, edificio, superficie e finanziamento di un nuovo progetto","Gastos, edificio, superficie y financiación de un nuevo proyecto"],
"Simulez votre projet avant de commencer : toutes les dépenses du début à la fin, du bâtiment aux animaux, la superficie nécessaire, le plan de construction et le plan de financement.":["Simulate your project before starting: all expenses from start to finish, from the building to the animals, the area needed, the building plan and the financing plan.","Simula il tuo progetto prima di iniziare: tutte le spese dall'inizio alla fine, dall'edificio agli animali, la superficie necessaria, la pianta dell'edificio e il piano di finanziamento.","Simule su proyecto antes de empezar: todos los gastos de principio a fin, del edificio a los animales, la superficie necesaria, el plano de construcción y el plan de financiación."],
"Le projet":["The project","Il progetto","El proyecto"],"Type de projet":["Type of project","Tipo di progetto","Tipo de proyecto"],
"Élevage":["Livestock","Allevamento","Ganadería"],"Culture":["Crop","Coltivazione","Cultivo"],
"Poules pondeuses (œufs)":["Laying hens (eggs)","Galline ovaiole (uova)","Gallinas ponedoras (huevos)"],"Poulets de chair":["Broilers","Polli da carne","Pollos de engorde"],
"Poulets locaux améliorés ou pintades":["Improved local chickens or guinea fowl","Polli locali migliorati o faraone","Pollos locales mejorados o pintadas"],
"Porcs (engraissement)":["Pigs (fattening)","Suini (ingrasso)","Cerdos (engorde)"],"Moutons (embouche)":["Sheep (fattening)","Ovini (ingrasso)","Ovejas (engorde)"],
"Bovins (embouche)":["Cattle (fattening)","Bovini (ingrasso)","Bovinos (engorde)"],"Poissons (tilapia en bassins)":["Fish (tilapia in tanks)","Pesci (tilapia in vasche)","Peces (tilapia en estanques)"],
"Nombre d'animaux au départ":["Number of animals at the start","Numero di animali all'inizio","Número de animales al inicio"],
"Nombre d'alevins au départ":["Number of fingerlings at the start","Numero di avannotti all'inizio","Número de alevines al inicio"],
"Nombre de bandes (cycles) à simuler":["Number of batches (cycles) to simulate","Numero di cicli da simulare","Número de ciclos a simular"],
"Surface cultivée (hectares)":["Cultivated area (hectares)","Superficie coltivata (ettari)","Superficie cultivada (hectáreas)"],
"Nombre de campagnes":["Number of seasons","Numero di campagne","Número de campañas"],
"Type de bâtiment":["Type of building","Tipo di edificio","Tipo de edificio"],
"Banco amélioré et tôles":["Improved mud brick and metal sheets","Mattoni crudi migliorati e lamiere","Adobe mejorado y chapas"],
"Semi-dur (muret en parpaings, grillage, tôles)":["Semi-permanent (block low wall, wire mesh, metal sheets)","Semi-permanente (muretto in blocchi, rete, lamiere)","Semipermanente (murete de bloques, malla, chapas)"],
"Dur (parpaings, charpente métallique, tôles isolées)":["Permanent (concrete blocks, steel frame, insulated sheets)","In muratura (blocchi, struttura metallica, lamiere isolate)","Permanente (bloques, estructura metálica, chapas aisladas)"],
"Prix du terrain (F par m², {0} si vous l'avez déjà)":["Land price (F per m², {0} if you already have it)", "Prezzo del terreno (F al m², {0} se lo hai già)", "Precio del terreno (F por m², {0} si ya lo tiene)"],
"Clôture du terrain":["Fence around the land","Recinzione del terreno","Cerca del terreno"],"Forage":["Borehole","Pozzo trivellato","Pozo"],
"Château d'eau (citerne {0} {1} L)":["Water tower ({0},{1} L tank)", "Serbatoio d'acqua (cisterna {0}.{1} L)", "Depósito de agua (cisterna {0}.{1} L)"],
"Bureau et vestiaire":["Office and changing room","Ufficio e spogliatoio","Oficina y vestuario"],"Culture irriguée (motopompe)":["Irrigated crop (motor pump)","Coltura irrigata (motopompa)","Cultivo de regadío (motobomba)"],
"Prix et hypothèses (modifiables)":["Prices and assumptions (editable)","Prezzi e ipotesi (modificabili)","Precios e hipótesis (modificables)"],
"Valeurs indicatives au Burkina Faso : remplacez-les par vos prix. Les prix marqués « {q0} » viennent de l'étude du marché B{0}A.":["Indicative values in Burkina Faso: replace them with your prices. Prices marked « {q0} » come from the B{0}A market study.", "Valori indicativi in Burkina Faso: sostituiscili con i tuoi prezzi. I prezzi segnati « {q0} » vengono dallo studio di mercato B{0}A.", "Valores orientativos en Burkina Faso: sustitúyalos por sus precios. Los precios marcados « {q0} » vienen del estudio de mercado B{0}A."],
"internet":["internet","internet","internet"],"Remettre les valeurs par défaut":["Reset default values","Ripristina i valori predefiniti","Restablecer los valores por defecto"],
/* paramètres */
"Prix du poussin d'un jour (F)":["Price of a day-old chick (F)","Prezzo del pulcino di un giorno (F)","Precio del pollito de un día (F)"],
"Prix de l'animal à l'achat (F)":["Purchase price of the animal (F)","Prezzo d'acquisto dell'animale (F)","Precio de compra del animal (F)"],
"Prix du porcelet (F)":["Price of the piglet (F)","Prezzo del maialino (F)","Precio del lechón (F)"],"Prix de l'alevin (F)":["Price of the fingerling (F)","Prezzo dell'avannotto (F)","Precio del alevín (F)"],
"Mortalité sur la bande (%)":["Mortality over the batch (%)","Mortalità nel ciclo (%)","Mortalidad en el ciclo (%)"],
"Aliment poussin et poulette jusqu'à {0} semaines (kg par sujet)":["Chick and pullet feed up to {0} weeks (kg per bird)", "Mangime pulcino e pollastra fino a {0} settimane (kg per capo)", "Pienso pollito y pollita hasta {0} semanas (kg por ave)"],
"Prix de l'aliment poussin et poulette (F/kg)":["Price of chick and pullet feed (F/kg)","Prezzo del mangime pulcino e pollastra (F/kg)","Precio del pienso pollito y pollita (F/kg)"],
"Aliment en ponte (g par poule et par jour)":["Laying feed (g per hen per day)","Mangime in deposizione (g per gallina al giorno)","Pienso de puesta (g por gallina y día)"],
"Prix de l'aliment ponte (F/kg)":["Price of laying feed (F/kg)","Prezzo del mangime deposizione (F/kg)","Precio del pienso de puesta (F/kg)"],
"Taux de ponte moyen (%)":["Average laying rate (%)","Tasso medio di deposizione (%)","Tasa media de puesta (%)"],
"Prix du plateau de {0} œufs (F)":["Price of a tray of {0} eggs (F)", "Prezzo del vassoio da {0} uova (F)", "Precio de la bandeja de {0} huevos (F)"],
"Prix de la poule de réforme (F)":["Price of a spent hen (F)","Prezzo della gallina a fine carriera (F)","Precio de la gallina de desecho (F)"],
"Aliment par sujet sur la bande (kg)":["Feed per animal over the batch (kg)","Mangime per capo nel ciclo (kg)","Pienso por animal en el ciclo (kg)"],
"Prix de l'aliment (F/kg)":["Feed price (F/kg)","Prezzo del mangime (F/kg)","Precio del pienso (F/kg)"],
"Concentré par animal sur la bande (kg)":["Concentrate per animal over the batch (kg)","Concentrato per capo nel ciclo (kg)","Concentrado por animal en el ciclo (kg)"],
"Prix du concentré (F/kg)":["Concentrate price (F/kg)","Prezzo del concentrato (F/kg)","Precio del concentrado (F/kg)"],
"Fourrage par animal sur la bande (kg)":["Fodder per animal over the batch (kg)","Foraggio per capo nel ciclo (kg)","Forraje por animal en el ciclo (kg)"],
"Prix du fourrage (F/kg)":["Fodder price (F/kg)","Prezzo del foraggio (F/kg)","Precio del forraje (F/kg)"],
"Prix de vente par animal (F)":["Selling price per animal (F)","Prezzo di vendita per capo (F)","Precio de venta por animal (F)"],
"Poids du poisson à la vente (kg)":["Fish weight at sale (kg)","Peso del pesce alla vendita (kg)","Peso del pez a la venta (kg)"],
"Prix du poisson (F/kg)":["Fish price (F/kg)","Prezzo del pesce (F/kg)","Precio del pescado (F/kg)"],
"Vaccins et soins (F par sujet)":["Vaccines and care (F per animal)","Vaccini e cure (F per capo)","Vacunas y cuidados (F por animal)"],
"Sujets par ouvrier":["Animals per worker","Capi per operaio","Animales por trabajador"],
"Salaire mensuel d'un ouvrier (F)":["Monthly wage of a worker (F)","Stipendio mensile di un operaio (F)","Salario mensual de un trabajador (F)"],
"Eau et électricité (F par sujet et par mois)":["Water and electricity (F per animal per month)","Acqua ed elettricità (F per capo al mese)","Agua y electricidad (F por animal y mes)"],
"Litière (F par m² et par bande)":["Litter (F per m² per batch)","Lettiera (F per m² per ciclo)","Cama (F por m² y ciclo)"],
"Coût du bassin en bâche (F par m²)":["Cost of the lined tank (F per m²)","Costo della vasca in telo (F al m²)","Coste del estanque de lona (F por m²)"],
"Rendement (kg par ha)":["Yield (kg per ha)","Resa (kg per ha)","Rendimiento (kg por ha)"],"Prix de vente (F/kg)":["Selling price (F/kg)","Prezzo di vendita (F/kg)","Precio de venta (F/kg)"],
"Semences (kg par ha)":["Seeds (kg per ha)","Sementi (kg per ha)","Semillas (kg por ha)"],"Prix des semences (F/kg)":["Seed price (F/kg)","Prezzo delle sementi (F/kg)","Precio de las semillas (F/kg)"],
"Boutures ou plants (F par ha)":["Cuttings or seedlings (F per ha)","Talee o piantine (F per ha)","Esquejes o plantones (F por ha)"],
"Travaux du sol, semis, entretien et récolte (F par ha)":["Tillage, sowing, maintenance and harvest (F per ha)","Lavorazione, semina, manutenzione e raccolta (F per ha)","Labranza, siembra, mantenimiento y cosecha (F por ha)"],
"Traitements (F par ha)":["Crop protection (F per ha)","Trattamenti (F per ha)","Tratamientos (F por ha)"],
"Carburant de la motopompe (F par ha et par mois)":["Motor pump fuel (F per ha per month)","Carburante della motopompa (F per ha al mese)","Combustible de la motobomba (F por ha y mes)"],
/* résultats */
"Résultat du projet":["Project result","Risultato del progetto","Resultado del proyecto"],"Durée du projet":["Project duration","Durata del progetto","Duración del proyecto"],
"mois":["months","mesi","meses"],"Investissement de départ":["Starting investment","Investimento iniziale","Inversión inicial"],
"Dépenses de fonctionnement":["Operating expenses","Spese di gestione","Gastos de funcionamiento"],"Total des dépenses":["Total expenses","Totale delle spese","Total de gastos"],
"Recettes prévues":["Expected income","Entrate previste","Ingresos previstos"],"Bénéfice prévu":["Expected profit","Utile previsto","Beneficio previsto"],
"Rentabilité":["Return","Redditività","Rentabilidad"],
"Bénéfice par bande (sans l'investissement)":["Profit per batch (without the investment)","Utile per ciclo (senza l'investimento)","Beneficio por ciclo (sin la inversión)"],
"Bénéfice par campagne (sans l'investissement)":["Profit per season (without the investment)","Utile per campagna (senza l'investimento)","Beneficio por campaña (sin la inversión)"],
"Bandes pour rembourser l'investissement":["Batches to repay the investment","Cicli per ripagare l'investimento","Ciclos para devolver la inversión"],
"Campagnes pour rembourser l'investissement":["Seasons to repay the investment","Campagne per ripagare l'investimento","Campañas para devolver la inversión"],"Argent à réunir avant de commencer":["Money to gather before starting","Denaro da raccogliere prima di iniziare","Dinero a reunir antes de empezar"],
"L'argent investi est récupéré au mois":["The money invested is recovered in month","Il denaro investito si recupera al mese","El dinero invertido se recupera en el mes"],
"L'argent investi n'est pas récupéré pendant la durée simulée : ajoutez des bandes, ou revoyez les prix.":["The money invested is not recovered within the simulated period: add batches or review the prices.","Il denaro investito non si recupera nel periodo simulato: aggiungi cicli o rivedi i prezzi.","El dinero invertido no se recupera en el periodo simulado: añada ciclos o revise los precios."],
"Attention : avec ces prix, le projet perd de l'argent.":["Warning: with these prices, the project loses money.","Attenzione: con questi prezzi, il progetto perde denaro.","Atención: con estos precios, el proyecto pierde dinero."],
"Le bâtiment et le matériel restent après le projet : les bandes suivantes coûtent moins cher.":["The building and equipment remain after the project: the next batches cost less.","L'edificio e il materiale restano dopo il progetto: i cicli successivi costano meno.","El edificio y el material quedan tras el proyecto: los ciclos siguientes cuestan menos."],
"Superficie nécessaire":["Area needed","Superficie necessaria","Superficie necesaria"],
"Surface pour les animaux":["Area for the animals","Superficie per gli animali","Superficie para los animales"],"Surface des bassins":["Tank area","Superficie delle vasche","Superficie de los estanques"],
"Magasin d'aliment":["Feed store","Magazzino del mangime","Almacén de pienso"],"Sas sanitaire et pédiluve":["Hygiene lock and footbath","Zona filtro e pediluvio","Esclusa sanitaria y pediluvio"],
"Surface couverte totale":["Total covered area","Superficie coperta totale","Superficie cubierta total"],"Parc extérieur":["Outdoor pen","Recinto esterno","Corral exterior"],
"Bâtiments":["Buildings","Edifici","Edificios"],"Terrain nécessaire":["Land needed","Terreno necessario","Terreno necesario"],
"Densité":["Density","Densità","Densidad"],"par m²":["per m²","per m²","por m²"],
"Surface cultivée":["Cultivated area","Superficie coltivata","Superficie cultivada"],"Magasin de récolte":["Harvest store","Magazzino del raccolto","Almacén de cosecha"],
"Écartement":["Spacing","Sesto d'impianto","Marco de plantación"],"Dimensions de la parcelle":["Plot dimensions","Dimensioni dell'appezzamento","Dimensiones de la parcela"],
"Plan de construction":["Building plan","Pianta dell'edificio","Plano de construcción"],"Plan de la parcelle":["Plot plan","Pianta dell'appezzamento","Plano de la parcela"],
"Vue de dessus, à l'échelle. Orientez la longueur des bâtiments d'est en ouest : le soleil n'entre pas à l'intérieur et l'air circule.":["Top view, to scale. Point the length of the buildings east-west: the sun does not get inside and the air flows.","Vista dall'alto, in scala. Orienta la lunghezza degli edifici da est a ovest: il sole non entra e l'aria circola.","Vista superior, a escala. Oriente el largo de los edificios de este a oeste: el sol no entra y el aire circula."],
"Matériaux du bâtiment (estimation)":["Building materials (estimate)","Materiali dell'edificio (stima)","Materiales del edificio (estimación)"],
"Tôles ({0} m)":["Metal sheets ({0} m)", "Lamiere ({0} m)", "Chapas ({0} m)"],"Parpaings de {0}":["{0} cm concrete blocks", "Blocchi da {0}", "Bloques de {0}"],
"Grillage":["Wire mesh","Rete metallica","Malla metálica"],"Poteaux":["Posts","Pali","Postes"],"Ciment (sacs de {0} kg)":["Cement ({0} kg bags)", "Cemento (sacchi da {0} kg)", "Cemento (sacos de {0} kg)"],
"Hauteur du muret":["Low wall height","Altezza del muretto","Altura del murete"],"Hauteur sous toiture":["Height under the roof","Altezza sotto il tetto","Altura bajo el techo"],
"Bâche de bassin":["Tank liner","Telo per vasca","Lona de estanque"],
"Détail des dépenses":["Expense details","Dettaglio delle spese","Detalle de los gastos"],"Poste":["Item","Voce","Partida"],"Montant":["Amount","Importo","Importe"],
"Investissement":["Investment","Investimento","Inversión"],"Fonctionnement":["Operation","Gestione","Funcionamiento"],
"Terrain":["Land","Terreno","Terreno"],"Construction du bâtiment":["Construction of the building","Costruzione dell'edificio","Construcción del edificio"],
"Construction des bassins":["Construction of the tanks","Costruzione delle vasche","Construcción de los estanques"],"Clôture":["Fence","Recinzione","Cerca"],
"Installation électrique et éclairage":["Electrical installation and lighting","Impianto elettrico e illuminazione","Instalación eléctrica e iluminación"],
"Matériel d'élevage":["Livestock equipment","Attrezzatura d'allevamento","Material de cría"],"Motopompe et tuyaux":["Motor pump and pipes","Motopompa e tubi","Motobomba y tubos"],
"Achat des animaux":["Purchase of the animals","Acquisto degli animali","Compra de los animales"],"Achat des alevins":["Purchase of the fingerlings","Acquisto degli avannotti","Compra de los alevines"],
"Aliment":["Feed","Mangime","Pienso"],"Aliment poussin et poulette":["Chick and pullet feed","Mangime pulcino e pollastra","Pienso pollito y pollita"],"Aliment ponte":["Laying feed","Mangime deposizione","Pienso de puesta"],
"Concentré":["Concentrate","Concentrato","Concentrado"],"Fourrage":["Fodder","Foraggio","Forraje"],
"Vaccins et soins":["Vaccines and care","Vaccini e cure","Vacunas y cuidados"],"Main-d'œuvre":["Labour","Manodopera","Mano de obra"],
"Eau et électricité":["Water and electricity","Acqua ed elettricità","Agua y electricidad"],"Litière":["Litter","Lettiera","Cama"],
"Imprévus ({0} %)":["Contingencies ({0} %)", "Imprevisti ({0} %)", "Imprevistos ({0} %)"],
"Semences et plants":["Seeds and seedlings","Sementi e piantine","Semillas y plantones"],"Engrais et compost":["Fertiliser and compost","Concimi e compost","Abonos y compost"],
"Travaux":["Field work","Lavori","Trabajos"],"Traitements":["Crop protection","Trattamenti","Tratamientos"],"Carburant de la motopompe":["Motor pump fuel","Carburante della motopompa","Combustible de la motobomba"],
"Sacs, transport et vente":["Bags, transport and sales","Sacchi, trasporto e vendita","Sacos, transporte y venta"],
"Recettes":["Income","Entrate","Ingresos"],"Vente des œufs":["Egg sales","Vendita delle uova","Venta de huevos"],"Vente des poules de réforme":["Sale of spent hens","Vendita delle galline a fine carriera","Venta de gallinas de desecho"],
"Vente des animaux":["Sale of the animals","Vendita degli animali","Venta de los animales"],"Vente des poissons":["Sale of the fish","Vendita dei pesci","Venta de los peces"],"Vente de la récolte":["Sale of the harvest","Vendita del raccolto","Venta de la cosecha"],
"Production":["Production","Produzione","Producción"],"plateaux d'œufs":["egg trays","vassoi di uova","bandejas de huevos"],"animaux vendus":["animals sold","animali venduti","animales vendidos"],"kg de poisson":["kg of fish","kg di pesce","kg de pescado"],"kg récoltés":["kg harvested","kg raccolti","kg cosechados"],
"Plan de financement":["Financing plan","Piano di finanziamento","Plan de financiación"],
"Besoins":["Needs","Fabbisogni","Necesidades"],"Ressources":["Resources","Risorse","Recursos"],
"Investissement de départ (bâtiment, matériel, animaux)":["Starting investment (building, equipment, animals)","Investimento iniziale (edificio, attrezzatura, animali)","Inversión inicial (edificio, material, animales)"],
"Fonds de roulement jusqu'aux premières recettes":["Working capital until the first income","Capitale circolante fino alle prime entrate","Fondo de maniobra hasta los primeros ingresos"],
"Marge de sécurité ({0} %)":["Safety margin ({0} %)", "Margine di sicurezza ({0} %)", "Margen de seguridad ({0} %)"],
"Apport personnel":["Personal contribution","Apporto personale","Aportación personal"],"Crédit ou partenaire":["Loan or partner","Credito o socio","Crédito o socio"],
"Apport personnel (%)":["Personal contribution (%)","Apporto personale (%)","Aportación personal (%)"],"Taux du crédit (% par an)":["Loan rate (% per year)","Tasso del credito (% annuo)","Tipo del crédito (% anual)"],
"Durée du crédit (mois)":["Loan duration (months)","Durata del credito (mesi)","Duración del crédito (meses)"],
"Mensualité du crédit":["Monthly loan payment","Rata mensile del credito","Cuota mensual del crédito"],"Coût total du crédit (intérêts)":["Total cost of the loan (interest)","Costo totale del credito (interessi)","Coste total del crédito (intereses)"],
"Bénéfice après remboursement du crédit":["Profit after repaying the loan","Utile dopo il rimborso del credito","Beneficio después de devolver el crédito"],
"Calendrier mois par mois":["Month-by-month calendar","Calendario mese per mese","Calendario mes a mes"],"Mois":["Month","Mese","Mes"],
"Dépenses":["Expenses","Spese","Gastos"],"Solde cumulé":["Cumulative balance","Saldo cumulato","Saldo acumulado"],"Ce qui se passe":["What happens","Cosa succede","Qué ocurre"],
"Construction et achat du matériel":["Construction and purchase of equipment","Costruzione e acquisto dell'attrezzatura","Construcción y compra del material"],
"Arrivée des animaux":["Arrival of the animals","Arrivo degli animali","Llegada de los animales"],"Début de la ponte":["Start of laying","Inizio della deposizione","Inicio de la puesta"],
"Vente de la bande":["Sale of the batch","Vendita del ciclo","Venta del ciclo"],"Réforme et fin de la bande":["Culling and end of the batch","Riforma e fine del ciclo","Desecho y fin del ciclo"],
"Semis ou plantation":["Sowing or planting","Semina o trapianto","Siembra o plantación"],"Récolte et vente":["Harvest and sale","Raccolta e vendita","Cosecha y venta"],
"Télécharger le PDF":["Download the PDF","Scarica il PDF","Descargar el PDF"],"Partager":["Share","Condividi","Compartir"],
"Simulation du projet":["Project simulation","Simulazione del progetto","Simulación del proyecto"],
"Valeurs indicatives, à vérifier avec vos fournisseurs avant de commencer.":["Indicative values, to check with your suppliers before starting.","Valori indicativi, da verificare con i fornitori prima di iniziare.","Valores orientativos, a comprobar con sus proveedores antes de empezar."],
"Entrée":["Entrance","Ingresso","Entrada"],"Citerne":["Tank","Cisterna","Cisterna"],"Fumière":["Manure pit","Concimaia","Estercolero"],"Bassins":["Tanks","Vasche","Estanques"],
"Magasin":["Store","Magazzino","Almacén"],"Bureau":["Office","Ufficio","Oficina"],"Parc":["Pen","Recinto","Corral"],"Bâtiment":["Building","Edificio","Edificio"],"Parcelle":["Plot","Appezzamento","Parcela"],
"Motopompe":["Motor pump","Motopompa","Motobomba"],"Sas":["Lock","Filtro","Esclusa"],
"Mangeoires ({0} pour {1})":["Feeders ({0} per {1})", "Mangiatoie ({0} ogni {1})", "Comederos ({0} por {1})"],"Mangeoires ({0} pour {1})":["Feeders ({0} per {1})", "Mangiatoie ({0} ogni {1})", "Comederos ({0} por {1})"],
"Abreuvoirs ({0} pour {1})":["Drinkers ({0} per {1})", "Abbeveratoi ({0} ogni {1})", "Bebederos ({0} por {1})"],"Abreuvoirs ({0} pour {1})":["Drinkers ({0} per {1})", "Abbeveratoi ({0} ogni {1})", "Bebederos ({0} por {1})"],
"Pondoirs ({0} nid pour {1} poules)":["Nest boxes ({0} nest per {1} hens)", "Nidi ({0} ogni {1} galline)", "Nidales ({0} nido por {1} gallinas)"],
"Chauffage poussins ({0} radiant pour {1})":["Chick heaters ({0} radiant per {1})", "Riscaldamento pulcini ({0} radiante ogni {1})", "Calefacción pollitos ({0} radiante por {1})"],
"Éclairage ({0} lampe pour {1})":["Lighting ({0} lamp per {1})", "Illuminazione ({0} lampada ogni {1})", "Iluminación ({0} lámpara por {1})"],
"Auges et abreuvoirs ({0} par loge de {1})":["Troughs and drinkers ({0} per pen of {1})", "Truogoli e abbeveratoi ({0} per box da {1})", "Comederos y bebederos ({0} por corral de {1})"],
"Mangeoires et abreuvoirs ({0} pour {1})":["Feeders and drinkers ({0} per {1})", "Mangiatoie e abbeveratoi ({0} ogni {1})", "Comederos y bebederos ({0} por {1})"],
"Auges et abreuvoirs ({0} pour {1})":["Troughs and drinkers ({0} per {1})", "Truogoli e abbeveratoi ({0} ogni {1})", "Comederos y bebederos ({0} por {1})"],
"Pompe et aérateur ({0} pour {1} {2} poissons)":["Pump and aerator ({0} per {1},{2} fish)", "Pompa e aeratore ({0} ogni {1}.{2} pesci)", "Bomba y aireador ({0} por {1}.{2} peces)"],
"Filets et matériel de pêche ({0} lot pour {1} {2})":["Nets and fishing equipment ({0} set per {1},{2})", "Reti e attrezzatura da pesca ({0} set ogni {1}.{2})", "Redes y material de pesca ({0} lote por {1}.{2})"],
"Quantité":["Quantity","Quantità","Cantidad"],"Prix unitaire":["Unit price","Prezzo unitario","Precio unitario"],
"Matériel":["Equipment","Attrezzatura","Material"],"Choisissez la culture":["Choose the crop","Scegli la coltura","Elija el cultivo"]
};
{const D=window.B2A_DICT=window.B2A_DICT||{};["en","it","es"].forEach((l,i)=>{D[l]=D[l]||{};for(const k in T)if(D[l][k]==null)D[l][k]=T[k][i]})}

/* ================= données (valeurs indicatives Burkina Faso, FCFA) =================
   cw : semaines de la bande · vide : vide sanitaire (semaines) · larg : largeur du bâtiment (m) · dens : animaux par m² couvert
   aire : m² de parc extérieur par animal · h : hauteur du muret (m) · mo : sujets par ouvrier
   P : paramètres modifiables [clé, libellé, valeur, prix internet (id, taille de l'unité)] */
const BAT={banco:["Banco amélioré et tôles",12000],semidur:["Semi-dur (muret en parpaings, grillage, tôles)",25000],dur:["Dur (parpaings, charpente métallique, tôles isolées)",45000]};
const COMMUNS=[["sante","Vaccins et soins (F par sujet)"],["mo","Sujets par ouvrier"],["sal","Salaire mensuel d'un ouvrier (F)",50000],["eau","Eau et électricité (F par sujet et par mois)"]];
const ESP={
 pondeuse:{n:"Poules pondeuses (œufs)",q:1000,cw:80,vide:3,cy:1,cyMax:3,larg:8,dens:5,h:0.6,volaille:true,
  P:[["achat","Prix du poussin d'un jour (F)",750],["mort","Mortalité sur la bande (%)",8],["alimE","Aliment poussin et poulette jusqu'à 18 semaines (kg par sujet)",7],["pAlimE","Prix de l'aliment poussin et poulette (F/kg)",330,["aliment-ponte",50]],
     ["alimP","Aliment en ponte (g par poule et par jour)",115],["pAlimP","Prix de l'aliment ponte (F/kg)",300,["aliment-ponte",50]],["ponte","Taux de ponte moyen (%)",80],
     ["vOeuf","Prix du plateau de 30 œufs (F)",2250,["oeufs-plateau",1]],["reforme","Prix de la poule de réforme (F)",2500,["pondeuse-reforme",1]],["sante",null,400],["mo",null,1500],["sal",null],["eau",null,15],["lit","Litière (F par m² et par bande)",300]],
  eq:[["Mangeoires (1 pour 25)",25,5000],["Abreuvoirs (1 pour 50)",50,4500],["Pondoirs (1 nid pour 5 poules)",5,2500],["Chauffage poussins (1 radiant pour 500)",500,25000],["Éclairage (1 lampe pour 100)",100,3000]]},
 chair:{n:"Poulets de chair",q:500,cw:7,vide:2,cy:6,cyMax:12,larg:8,dens:8,h:0.5,volaille:true,
  P:[["achat","Prix du poussin d'un jour (F)",650,["poussin-chair",1]],["mort","Mortalité sur la bande (%)",5],["alim","Aliment par sujet sur la bande (kg)",4.3],["pAlim","Prix de l'aliment (F/kg)",360,["aliment-chair",50]],
     ["vente","Prix de vente par animal (F)",3000,["poulet-chair",1]],["sante",null,200],["mo",null,3000],["sal",null],["eau",null,15],["lit","Litière (F par m² et par bande)",300]],
  eq:[["Mangeoires (1 pour 50)",50,5000],["Abreuvoirs (1 pour 60)",60,4500],["Chauffage poussins (1 radiant pour 500)",500,25000],["Éclairage (1 lampe pour 100)",100,3000]]},
 local:{n:"Poulets locaux améliorés ou pintades",q:500,cw:16,vide:2,cy:2,cyMax:4,larg:8,dens:6,h:0.5,volaille:true,
  P:[["achat","Prix du poussin d'un jour (F)",500,["poussin-local",1]],["mort","Mortalité sur la bande (%)",10],["alim","Aliment par sujet sur la bande (kg)",6],["pAlim","Prix de l'aliment (F/kg)",275],
     ["vente","Prix de vente par animal (F)",3500,["poulet-local",1]],["sante",null,250],["mo",null,2000],["sal",null],["eau",null,10],["lit","Litière (F par m² et par bande)",300]],
  eq:[["Mangeoires (1 pour 50)",50,5000],["Abreuvoirs (1 pour 60)",60,4500],["Chauffage poussins (1 radiant pour 500)",500,25000],["Éclairage (1 lampe pour 100)",100,3000]]},
 porc:{n:"Porcs (engraissement)",q:20,cw:22,vide:2,cy:1,cyMax:3,larg:8,dens:0.8,h:1.2,
  P:[["achat","Prix du porcelet (F)",25000],["mort","Mortalité sur la bande (%)",3],["alim","Aliment par sujet sur la bande (kg)",260],["pAlim","Prix de l'aliment (F/kg)",225],
     ["vente","Prix de vente par animal (F)",135000],["sante",null,3500],["mo",null,50],["sal",null],["eau",null,150]],
  eq:[["Auges et abreuvoirs (1 par loge de 10)",10,25000]]},
 mouton:{n:"Moutons (embouche)",q:30,cw:13,vide:1,cy:1,cyMax:4,larg:8,dens:0.6,aire:3,h:1,
  P:[["achat","Prix de l'animal à l'achat (F)",45000],["mort","Mortalité sur la bande (%)",2],["alim","Concentré par animal sur la bande (kg)",55],["pAlim","Prix du concentré (F/kg)",200,["aliment-betail",50]],
     ["alim2","Fourrage par animal sur la bande (kg)",110],["pAlim2","Prix du fourrage (F/kg)",60],["vente","Prix de vente par animal (F)",80000,["mouton",1]],["sante",null,2500],["mo",null,60],["sal",null],["eau",null,60]],
  eq:[["Mangeoires et abreuvoirs (1 pour 10)",10,15000]]},
 bovin:{n:"Bovins (embouche)",q:10,cw:17,vide:1,cy:1,cyMax:3,larg:10,dens:0.25,aire:8,h:1.2,
  P:[["achat","Prix de l'animal à l'achat (F)",250000],["mort","Mortalité sur la bande (%)",1],["alim","Concentré par animal sur la bande (kg)",360],["pAlim","Prix du concentré (F/kg)",175,["aliment-betail",50]],
     ["alim2","Fourrage par animal sur la bande (kg)",715],["pAlim2","Prix du fourrage (F/kg)",50],["vente","Prix de vente par animal (F)",420000,["boeuf",1]],["sante",null,10000],["mo",null,15],["sal",null],["eau",null,200]],
  eq:[["Auges et abreuvoirs (1 pour 5)",5,25000]]},
 poisson:{n:"Poissons (tilapia en bassins)",q:3000,cw:26,vide:2,cy:1,cyMax:2,dens:15,poisson:true,
  P:[["achat","Prix de l'alevin (F)",60],["mort","Mortalité sur la bande (%)",20],["alim","Aliment par sujet sur la bande (kg)",0.6],["pAlim","Prix de l'aliment (F/kg)",650],
     ["poids","Poids du poisson à la vente (kg)",0.35],["pKg","Prix du poisson (F/kg)",2500,["tilapia",1]],["bassin","Coût du bassin en bâche (F par m²)",7000],["sante",null,5],["mo",null,5000],["sal",null],["eau",null,8]],
  eq:[["Pompe et aérateur (1 pour 3 000 poissons)",3000,250000],["Filets et matériel de pêche (1 lot pour 3 000)",3000,60000]]}
};
const CROPS=()=>{const C=window.B2A_CULT&&window.B2A_CULT.crops||{};const o={};for(const k in C){const c=C[k];if(c&&c.cyc&&c.g!=="arbre"&&k!=="autre")o[k]=c}return o};
const SEMP={cereale:600,legume:900,coton:0,mara:60000,fourrage:1500,racine:0};
const WEBC={mais:["mais",100],mil:["mil",100],sorgho:["sorgho",100],riz:["riz",50],niebe:["niebe",1],arachide:["arachide",1],sesame:["sesame",1],oignon:["oignon",1],tomate:["tomate",1],soja:["soja",1]};
const cropP=(k,c)=>{const mara=c.g==="mara";return [["rdt","Rendement (kg par ha)",c.rdt],["prix","Prix de vente (F/kg)",c.prix,WEBC[k]],
  c.sem?["sem","Semences (kg par ha)",c.sem]:["bout","Boutures ou plants (F par ha)",c.g==="racine"?150000:0],
  c.sem?["pSem","Prix des semences (F/kg)",SEMP[c.g]??600,["semence-"+k,1]]:null,
  ["trav","Travaux du sol, semis, entretien et récolte (F par ha)",mara?300000:c.g==="racine"?180000:125000],["trait","Traitements (F par ha)",mara?90000:c.g==="coton"?45000:25000],
  ["carb","Carburant de la motopompe (F par ha et par mois)",40000]].filter(Boolean)};

/* ================= état ================= */
let S={type:"pondeuse",crop:"mais",q:null,cy:null,ha:1,camp:1,bat:"semidur",terrain:0,cloture:true,forage:false,citerne:true,bureau:true,irr:null,apport:30,taux:12,duree:24,v:{}};
try{const s=JSON.parse(B.lsGet?B.lsGet(LS)||"null":localStorage.getItem(LS));if(s&&typeof s==="object")S={...S,...s,v:s.v||{}}}catch(e){}
const save=()=>{try{const j=JSON.stringify(S);B.lsSet?B.lsSet(LS,j):localStorage.setItem(LS,j)}catch(e){}};
const isCropT=()=>S.type==="culture";
/* clôture d'un champ : proposée d'office pour le maraîchage seulement */
const clotC=()=>S.clotC==null?crop().g==="mara":!!S.clotC;
const citC=()=>S.citC==null?crop().g==="mara":!!S.citC;
const spec=()=>isCropT()?null:ESP[S.type];
const crop=()=>CROPS()[S.crop]||CROPS().mais||{n:"Maïs",g:"cereale",cyc:100,rdt:2500,prix:200,sem:25,fert:[]};
function params(){if(isCropT())return cropP(S.crop,crop());const s=spec();return s.P.map(p=>{if(p[1]!=null)return p;const c=COMMUNS.find(x=>x[0]===p[0]);return [p[0],c[1],p[2]!=null?p[2]:c[2],p[3]]})}
/* valeur d'un paramètre : saisie de l'utilisateur, sinon prix internet, sinon valeur par défaut */
const pkey=k=>(isCropT()?"c_"+S.crop:S.type)+"."+k;
function val(k){const p=params().find(x=>x[0]===k);if(!p)return 0;const u=S.v[pkey(k)];if(u!=null&&u!=="")return Number(u)||0;const w=p[3]?web(p[3][0],p[3][1]):null;return w!=null?w:p[2]}
const isWeb=k=>{const p=params().find(x=>x[0]===k);const u=S.v[pkey(k)];return !(u!=null&&u!=="")&&!!(p&&p[3]&&web(p[3][0],p[3][1])!=null)};
const qty=()=>{const s=spec();return Math.max(1,Math.round(N(S.q)||s.q))};
const cycles=()=>{const s=spec();return Math.min(s.cyMax,Math.max(1,Math.round(N(S.cy)||s.cy)))};
const pEngK=e=>{try{return A.pEng?A.pEng(e):({npk15:20000,npk14:20000,uree:18000,compost:15000})[e]||0}catch(x){return 0}};

/* ================= calcul ================= */
const WPM=4.345;
function simAnimaux(){
  const s=spec(),q=qty(),C=cycles(),mort=val("mort")/100,surv=q*(1-mort),avg=(q+surv)/2;
  const cyW=s.cw+s.vide,W=C*cyW,M=Math.max(1,Math.ceil(W/WPM));
  const months=Array.from({length:M+1},(_,i)=>({dep:0,rec:0,ev:[]}));
  const mi=w=>Math.min(M,1+Math.floor(w/WPM));
  const add=(w,k,v,kind)=>{const m=months[mi(w)];m[kind]+=v;post[k]=(post[k]||0)+v};
  const post={};const prod={};
  /* bâtiment et surfaces */
  const animM2=s.poisson?q/s.dens:q/s.dens;
  let feedMonthKg=0;
  if(S.type==="pondeuse")feedMonthKg=avg*val("alimP")/1000*30.4;else feedMonthKg=avg*((val("alim")||0)+(val("alim2")||0))/s.cw*WPM*1.6;
  const mag=Math.max(9,Math.ceil(feedMonthKg/400));
  const sas=s.poisson?0:4,bur=S.bureau?9:0;
  const larg=s.larg||8;const lenTot=s.poisson?0:animM2/larg;const nBat=s.poisson?0:Math.max(1,Math.ceil(lenTot/50));const len=s.poisson?0:Math.max(6,Math.ceil(lenTot/nBat*2)/2);
  const couvert=(s.poisson?0:nBat*larg*len)+mag+sas+bur;
  const parc=s.aire?q*s.aire:0;
  const bassinN=s.poisson?Math.max(1,Math.ceil(animM2/50)):0;
  /* terrain : bâtiments côte à côte (15 m entre eux), 10 m de marge, une bande de 14 m pour le magasin, la citerne et la fumière */
  let tW,tL;
  if(s.poisson){const cols=Math.min(4,bassinN),rows=Math.ceil(bassinN/cols);tW=cols*10+(cols-1)*3+20;tL=rows*5+(rows-1)*3+20+14}
  else{const parcW=parc?Math.ceil(parc/nBat/len):0;tW=Math.max(40,nBat*(larg+parcW)+(nBat-1)*15+20);tL=len+20+14}
  if(s.poisson)tW=Math.max(40,tW);
  const terrain=tW*tL;
  /* investissement (mois 0) */
  const inv=(k,v)=>{if(v>0){months[0].dep+=v;post[k]=(post[k]||0)+v}};
  const pm2=BAT[S.bat][1];
  inv("Terrain",terrain*(N(S.terrain)||0));
  if(s.poisson){inv("Construction des bassins",animM2*val("bassin"));inv("Construction du bâtiment",(mag+bur)*pm2)}
  else inv("Construction du bâtiment",couvert*pm2);
  if(S.cloture)inv("Clôture",2*(tW+tL)*4500);
  if(S.forage)inv("Forage",3500000);if(S.citerne)inv("Château d'eau (citerne 2 000 L)",350000);
  inv("Installation électrique et éclairage",couvert*1000);
  const eqL=s.eq.map(([n,r,p])=>{const nb=Math.max(1,Math.ceil(q/r));return [n,nb,p,nb*p]});inv("Matériel d'élevage",eqL.reduce((a,x)=>a+x[3],0));
  months[0].ev.push("Construction et achat du matériel");
  /* bandes */
  for(let c=0;c<C;c++){const w0=c*cyW;
    add(w0,s.poisson?"Achat des alevins":"Achat des animaux",q*val("achat"),"dep");months[mi(w0)].ev.push("Arrivée des animaux");
    if(s.volaille)add(w0,"Litière",len*larg*nBat*val("lit"),"dep");
    for(let w=0;w<s.cw;w++){const wk=w0+w;
      add(wk,"Vaccins et soins",q*val("sante")/s.cw,"dep");
      if(S.type==="pondeuse"){
        if(w<18)add(wk,"Aliment poussin et poulette",avg*val("alimE")*val("pAlimE")*(w+0.5)/162,"dep");
        else{add(wk,"Aliment ponte",avg*val("alimP")/1000*7*val("pAlimP"),"dep");
          const tr=avg*val("ponte")/100*7/30;add(wk,"Vente des œufs",tr*val("vOeuf"),"rec");prod.oeufs=(prod.oeufs||0)+tr;
          if(w===18)months[mi(wk)].ev.push("Début de la ponte")}}
      else{const r=(w+0.5)/(s.cw*s.cw/2);add(wk,val("alim2")?"Concentré":"Aliment",avg*val("alim")*val("pAlim")*r,"dep");
        if(val("alim2"))add(wk,"Fourrage",avg*val("alim2")*val("pAlim2")/s.cw,"dep")}}
    const wEnd=w0+s.cw-1;
    if(S.type==="pondeuse"){add(wEnd,"Vente des poules de réforme",surv*val("reforme"),"rec");months[mi(wEnd)].ev.push("Réforme et fin de la bande")}
    else if(s.poisson){const kg=surv*val("poids");add(wEnd,"Vente des poissons",kg*val("pKg"),"rec");prod.kg=(prod.kg||0)+kg;months[mi(wEnd)].ev.push("Vente de la bande")}
    else{add(wEnd,"Vente des animaux",surv*val("vente"),"rec");prod.tetes=(prod.tetes||0)+surv;months[mi(wEnd)].ev.push("Vente de la bande")}}
  /* charges mensuelles */
  /* petits élevages : un demi-poste (l'éleveur fait une partie du travail) */
  const ouv=val("mo")>0?Math.max(0.5,Math.ceil(q/val("mo")*2)/2):0;
  for(let m=1;m<=M;m++){const mm=months[m];const mo=ouv*val("sal"),ea=avg*val("eau");mm.dep+=mo+ea;post["Main-d'œuvre"]=(post["Main-d'œuvre"]||0)+mo;post["Eau et électricité"]=(post["Eau et électricité"]||0)+ea}
  /* matériaux */
  const mat=[];
  if(!s.poisson){const roof=(larg+1.2)*(len+1.2)*nBat+(mag+bur+sas)*1.3,per=2*(larg+len)*nBat;
    mat.push(["Tôles (2 m)",Math.ceil(roof/1.6)],["Parpaings de 15",Math.ceil(per*s.h*12.5+Math.sqrt(mag+bur+sas)*4*2.4*12.5)],["Grillage",Math.ceil(per*Math.max(0,2.4-s.h)),"m²"],["Poteaux",Math.ceil(per/3)+nBat*2],
      ["Ciment (sacs de 50 kg)",Math.ceil(couvert*0.08*7+per*s.h*12.5/40)]);
  }else mat.push(["Bâche de bassin",Math.ceil(animM2*1.6),"m²"],["Tôles (2 m)",Math.ceil((mag+bur)*1.3/1.6)]);
  return {kind:"animal",s,q,C,M,months,post,prod,surv,eqL,mat,ouv,
    surf:{animM2,mag,sas,bur,couvert,parc,larg,len,nBat,tW,tL,terrain,bassinN}}}

function simCulture(){
  const c=crop(),ha=Math.max(0.05,N(S.ha)||1),camp=Math.min(c.g==="racine"?1:2,Math.max(1,Math.round(N(S.camp)||1)));
  const irr=S.irr==null?c.g==="mara"||camp>1:!!S.irr;
  const cycM=Math.max(1,Math.ceil(c.cyc/30.4)),M=camp*(cycM+1);
  const months=Array.from({length:M+1},()=>({dep:0,rec:0,ev:[]}));const post={};const prod={};
  const add=(m,k,v,kind)=>{const x=months[Math.min(M,m)];x[kind]+=v;post[k]=(post[k]||0)+v};
  const side=Math.sqrt(ha*10000);const tW=Math.max(30,Math.ceil(side)+10),tL=Math.ceil(side)+10+(ha>0.5?12:8);
  const magKg=val("rdt")*ha;const mag=Math.max(9,Math.ceil(magKg/600));
  const inv=(k,v)=>{if(v>0){months[0].dep+=v;post[k]=(post[k]||0)+v}};
  inv("Terrain",tW*tL*(N(S.terrain)||0));
  if(clotC())inv("Clôture",2*(tW+tL)*(c.g==="mara"?3000:2000));
  if(irr)inv("Motopompe et tuyaux",Math.ceil(ha/2)*450000);
  if(S.forage)inv("Forage",3500000);if(citC())inv("Château d'eau (citerne 2 000 L)",350000);
  inv("Construction du bâtiment",mag*BAT[S.bat][1]);
  months[0].ev.push("Construction et achat du matériel");
  for(let k=0;k<camp;k++){const m0=1+k*(cycM+1);
    add(m0,"Semences et plants",c.sem?val("sem")*val("pSem")*ha:val("bout")*ha,"dep");
    (c.fert||[]).forEach(([d,e,dose])=>{const pr=e==="compost"?pEngK(e)/1000:pEngK(e)/50;add(m0+Math.max(0,Math.floor(d/30.4)),"Engrais et compost",dose*ha*pr,"dep")});
    for(let m=0;m<cycM;m++){add(m0+m,"Travaux",val("trav")*ha/cycM,"dep");add(m0+m,"Traitements",val("trait")*ha/cycM,"dep");if(irr)add(m0+m,"Carburant de la motopompe",val("carb")*ha,"dep")}
    const kg=val("rdt")*ha,rec=kg*val("prix");const mH=m0+cycM;
    add(mH,"Vente de la récolte",rec,"rec");add(mH,"Sacs, transport et vente",kg/100*600+rec*0.05,"dep");prod.kg=(prod.kg||0)+kg;
    months[m0].ev.push("Semis ou plantation");months[Math.min(M,mH)].ev.push("Récolte et vente")}
  return {kind:"culture",c,ha,camp,irr,M,months,post,prod,mat:[],surf:{ha,side,tW,tL,terrain:tW*tL,mag}}}

const INV=["Terrain","Construction du bâtiment","Construction des bassins","Clôture","Forage","Château d'eau (citerne 2 000 L)","Installation électrique et éclairage","Matériel d'élevage","Motopompe et tuyaux"];
const REC=["Vente des œufs","Vente des poules de réforme","Vente des animaux","Vente des poissons","Vente de la récolte"];
function compute(){
  const r=isCropT()?simCulture():simAnimaux();
  /* imprévus : 5 % des dépenses de fonctionnement, réparties chaque mois */
  r.months.forEach((m,i)=>{if(i===0)return;const op=m.dep*0.05;m.dep+=op;r.post["Imprévus (5 %)"]=(r.post["Imprévus (5 %)"]||0)+op});
  let cum=0,minC=0,back=null;r.months.forEach((m,i)=>{cum+=m.rec-m.dep;m.cum=cum;if(cum<minC)minC=cum;if(back==null&&i>0&&cum>=0&&minC<0)back=i});
  const inv=INV.reduce((a,k)=>a+(r.post[k]||0),0),rec=REC.reduce((a,k)=>a+(r.post[k]||0),0);
  const dep=Object.keys(r.post).filter(k=>!REC.includes(k)).reduce((a,k)=>a+r.post[k],0);
  r.inv=inv;r.dep=dep;r.op=dep-inv;r.rec=rec;r.ben=rec-dep;r.renta=dep?r.ben/dep*100:0;r.back=back;
  /* une bande (ou une campagne) sans l'investissement : le bâtiment et le matériel servent ensuite pour les suivantes */
  r.nb=r.kind==="culture"?r.camp:r.C;r.parBande=(rec-r.op)/r.nb;r.bandesInv=r.parBande>0?Math.ceil(inv/r.parBande):null;
  /* financement */
  const besoin=-minC,bfr=Math.max(0,besoin-inv),marge=besoin*0.1,tot=Math.round((besoin+marge)/1000)*1000;
  const ap=Math.min(100,Math.max(0,N(S.apport)??30))/100,cred=tot*(1-ap),i=(N(S.taux)||0)/1200,n=Math.max(1,Math.round(N(S.duree)||24));
  const mens=cred>0?(i?cred*i/(1-Math.pow(1+i,-n)):cred/n):0;
  r.fin={besoin,bfr,marge,tot,apport:tot*ap,cred,mens,inter:mens*n-cred,n};
  return r}

/* ================= plan (SVG à l'échelle) ================= */
const NS="http://www.w3.org/2000/svg";
function svgEl(t,a,x){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(x!=null)e.textContent=x;return e}
function plan(r){const u=r.surf;const W=u.tW,L=u.tL;const sc=Math.min(640/W,420/L);const pw=W*sc+40,ph=L*sc+50;
  const g=notr(svgEl("svg",{viewBox:`0 0 ${pw} ${ph}`,width:"100%",role:"img","aria-label":tr(r.kind==="culture"?"Plan de la parcelle":"Plan de construction"),style:"max-width:720px;background:#f7f5ee;border-radius:12px"}));
  const X=v=>20+v*sc,Y=v=>20+v*sc;
  const leg=new Map();g.__leg=leg;const box=(x,y,w,h,fill,lab,dim)=>{if(lab&&!leg.has(lab))leg.set(lab,fill);g.append(svgEl("rect",{x:X(x),y:Y(y),width:w*sc,height:h*sc,fill,stroke:"#1b2e4c","stroke-width":1.2,rx:2}));
    const fs=Math.max(8,Math.min(13,w*sc/7));if(lab&&w*sc>34&&h*sc>14){const t=notr(svgEl("text",{x:X(x+w/2),y:Y(y+h/2)+(dim?-2:4),"text-anchor":"middle","font-size":fs,"font-weight":700,fill:"#1b2e4c"},tr(lab)));g.append(t)}
    if(dim&&w*sc>40&&h*sc>26)g.append(notr(svgEl("text",{x:X(x+w/2),y:Y(y+h/2)+fs+2,"text-anchor":"middle","font-size":fs-1,fill:"#1b2e4c"},dim)))};
  /* terrain + clôture */
  const clo=r.kind==="culture"?clotC():S.cloture;g.append(svgEl("rect",{x:X(0),y:Y(0),width:W*sc,height:L*sc,fill:"#e9f1df",stroke:clo?"#2c6a17":"#9aa","stroke-width":2,"stroke-dasharray":clo?"6 3":"2 4"}));
  g.append(notr(svgEl("text",{x:X(W/2),y:Y(L)+16,"text-anchor":"middle","font-size":12,fill:"#1b2e4c"},`${fmt(W)} m`)));
  const vt=notr(svgEl("text",{x:12,y:Y(L/2),"text-anchor":"middle","font-size":12,fill:"#1b2e4c",transform:`rotate(-90 12 ${Y(L/2)})`},`${fmt(L)} m`));g.append(vt);
  /* nord */
  g.append(svgEl("path",{d:`M${pw-22} 34 l6 -16 l6 16 l-6 -4z`,fill:"#1b2e4c"}),notr(svgEl("text",{x:pw-16,y:46,"text-anchor":"middle","font-size":11,"font-weight":700,fill:"#1b2e4c"},"N")));
  /* bande des services en bas (côté entrée) */
  const yS=L-12;let xs=10;
  if(r.kind==="culture"){box(10,10,u.side,u.side,"#cfe5b4","Parcelle",`${fmt(u.side)} × ${fmt(u.side)} m`);
    const ms=Math.sqrt(u.mag);box(xs,yS+1,Math.max(3,ms),Math.min(9,ms),"#fff","Magasin");xs+=Math.max(3,ms)+3;
    if(r.irr){box(xs,yS+2,3,3,"#bcd7f0","Motopompe");xs+=6}}
  else if(r.s.poisson){const cols=Math.min(4,u.bassinN);for(let i=0;i<u.bassinN;i++){const cx=i%cols,cy=Math.floor(i/cols);box(10+cx*13,10+cy*8,10,5,"#bcd7f0",i===0?"Bassins":"",i===0?"10 × 5 m":null)}
    const mw=Math.ceil(Math.sqrt(u.mag+u.bur));box(xs,yS+1,mw,Math.min(10,mw),"#fff","Magasin");xs+=mw+3}
  else{const parcW=u.parc?Math.ceil(u.parc/u.nBat/u.len):0;
    for(let i=0;i<u.nBat;i++){const x=10+i*(u.larg+parcW+15);box(x,10,u.larg,u.len,"#ffffff","Bâtiment",`${fmt(u.larg)} × ${fmt(u.len,1)} m`);
      if(parcW)box(x+u.larg,10,parcW,u.len,"#f3e7c9","Parc",`${fmt(parcW)} × ${fmt(u.len,1)} m`)}
    const mw=Math.min(8,Math.ceil(Math.sqrt(u.mag)));box(xs,yS+1,Math.ceil(u.mag/mw),mw,"#e3e8f0","Magasin",`${fmt(u.mag)} m²`);xs+=Math.ceil(u.mag/mw)+3;
    box(xs,yS+4,2,2,"#d9e8f5","Sas");xs+=4;
    if(u.bur){box(xs,yS+1,3,3,"#f2e6f0","Bureau");xs+=5}
    box(W-7,yS+2,5,4,"#d8c6a6","Fumière");}
  if(r.kind==="culture"?citC():S.citerne)box(W-6,3,3,3,"#bcd7f0","Citerne");
  /* entrée */
  g.append(svgEl("rect",{x:X(W/2-2.5),y:Y(L)-3,width:5*sc,height:6,fill:"#d6a95a"}));
  g.append(notr(svgEl("text",{x:X(W/2),y:Y(L)-6,"text-anchor":"middle","font-size":10,fill:"#8a5d0c"},tr("Entrée"))));
  return g}

/* ================= affichage ================= */
const css=el("style");css.textContent=`
#v-projet .pj-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}#v-projet .pj-grid .full{grid-column:1/-1}
#v-projet .pj-chk{display:flex;flex-wrap:wrap;gap:8px 16px}#v-projet .pj-chk label{display:flex;gap:6px;align-items:center;font-size:14px}
#v-projet .pj-kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
#v-projet .pj-k{background:var(--bg);border-radius:12px;padding:10px}#v-projet .pj-k small{display:block;color:var(--muted);font-size:12px}#v-projet .pj-k b{font:800 18px var(--display);color:var(--heading,var(--ink))}
#v-projet .pj-k.big{grid-column:1/-1;background:#1b2e4c;color:#fff}#v-projet .pj-k.big small{color:#cfd8e6}#v-projet .pj-k.big b{color:#fff;font-size:22px}
#v-projet .pj-k.good b{color:#2c6a17}#v-projet .pj-k.bad b{color:#a3342a}
#v-projet table{width:100%;border-collapse:collapse;font-size:14px}#v-projet td,#v-projet th{padding:6px 6px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}#v-projet td.n,#v-projet th.n{text-align:right}#v-projet .pj-scroll td.n{white-space:nowrap}#v-projet td:first-child{min-width:7em}
#v-projet .pj-leg{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:13px;margin:8px 0 4px}#v-projet .pj-leg span{display:inline-flex;gap:6px;align-items:center}#v-projet .pj-leg i{width:14px;height:14px;border:1px solid #1b2e4c;border-radius:3px;display:inline-block}
#v-projet tr.sub td{font-weight:800;background:var(--bg)}#v-projet tr.tot td{font-weight:800;border-top:2px solid var(--ink)}
#v-projet .pj-scroll{overflow-x:auto}#v-projet .pj-web{font-size:11px;font-weight:700;color:#2c6a17;background:#e6f3dd;border-radius:6px;padding:1px 6px;margin-left:4px}
#v-projet .pj-btns{display:flex;gap:8px;flex-wrap:wrap}#v-projet .neg{color:#a3342a}
@media (max-width:420px){#v-projet .pj-grid{grid-template-columns:1fr}}`;document.head.append(css);

let view=null;
function field(host,lab,input,full){const f=el("div","field"+(full?" full":""));const id="pj-"+Math.random().toString(36).slice(2,8);input.id=id;const l=el("label",null,lab);l.htmlFor=id;f.append(l,input);host.append(f);return input}
function num(v,step){const i=el("input");i.type="number";i.inputMode="decimal";i.min="0";if(step)i.step=step;i.value=v==null?"":v;return i}
function kpi(host,lab,v,cls){const k=el("div","pj-k"+(cls?" "+cls:""));k.append(el("small",null,lab),notr(el("b",null,v)));host.append(k);return k}
function row(tb,lab,v,cls,unit){const t=el("tr",cls||null);const a=el("td",null,lab);const b=notr(el("td","n",v));t.append(a,b);if(unit!==undefined)t.append(notr(el("td","n",unit)));tb.append(t);return t}
const card=(t)=>{const c=el("section","card");if(t)c.append(el("h2","sec",t));return c};

function render(){if(!view)return;view.innerHTML="";
  const head=card(null);const h=el("h2","sec");h.append(notr(el("span","pro-badge","PRO")),document.createTextNode("Simulation de projet"));head.append(h);
  head.append(el("p","note","Simulez votre projet avant de commencer : toutes les dépenses du début à la fin, du bâtiment aux animaux, la superficie nécessaire, le plan de construction et le plan de financement."));
  view.append(head);
  if(!isPro()){const p=PRO();if(p&&p.lockCard)p.lockCard(head,"projet");return}
  /* ---------- formulaire ---------- */
  const fc=card("Le projet");const g=el("div","pj-grid");fc.append(g);
  const sel=el("select");const og1=el("optgroup");og1.label="Élevage";Object.entries(ESP).forEach(([k,s])=>{const o=el("option",null,s.n);o.value=k;og1.append(o)});
  const o2=el("option",null,"Culture");o2.value="culture";sel.append(og1,o2);sel.value=S.type;
  field(g,"Type de projet",sel,true).onchange=()=>{S.type=sel.value;S.q=null;S.cy=null;save();render()};
  if(isCropT()){const cs=el("select");Object.entries(CROPS()).forEach(([k,c])=>{const o=el("option",null,c.n);o.value=k;cs.append(o)});cs.value=S.crop in CROPS()?S.crop:"mais";
    field(g,"Choisissez la culture",cs,true).onchange=()=>{S.crop=cs.value;S.irr=null;S.clotC=null;S.citC=null;save();render()};
    const ha=field(g,"Surface cultivée (hectares)",num(S.ha,"0.05"));ha.oninput=()=>{S.ha=ha.value;upd()};
    const cp=field(g,"Nombre de campagnes",num(S.camp,"1"));cp.max="2";cp.oninput=()=>{S.camp=cp.value;upd()}}
  else{const s=spec();const qi=field(g,s.poisson?"Nombre d'alevins au départ":"Nombre d'animaux au départ",num(S.q??s.q,"1"));qi.oninput=()=>{S.q=qi.value;upd()};
    if(s.cyMax>1){const ci=field(g,"Nombre de bandes (cycles) à simuler",num(S.cy??s.cy,"1"));ci.max=String(s.cyMax);ci.oninput=()=>{S.cy=ci.value;upd()}}}
  const bs=el("select");Object.entries(BAT).forEach(([k,[n,p]])=>{const o=el("option",null,n);o.value=k;bs.append(o)});bs.value=S.bat;field(g,"Type de bâtiment",bs,true).onchange=()=>{S.bat=bs.value;upd()};
  const ti=field(g,"Prix du terrain (F par m², 0 si vous l'avez déjà)",num(S.terrain,"100"),true);ti.oninput=()=>{S.terrain=ti.value;upd()};
  const ck=el("div","pj-chk full");g.append(ck);
  const chk=(k,lab)=>{const l=el("label");const i=el("input");i.type="checkbox";i.checked=k==="irr"?(S.irr==null?(crop().g==="mara"||(N(S.camp)||1)>1):!!S.irr):k==="clotC"?clotC():k==="citC"?citC():!!S[k];i.onchange=()=>{S[k]=i.checked;upd()};l.append(i,el("span",null,lab));ck.append(l)};
  chk(isCropT()?"clotC":"cloture","Clôture du terrain");chk(isCropT()?"citC":"citerne","Château d'eau (citerne 2 000 L)");chk("forage","Forage");
  if(isCropT())chk("irr","Culture irriguée (motopompe)");else if(!spec().poisson)chk("bureau","Bureau et vestiaire");
  /* hypothèses */
  const det=el("details");det.append(el("summary",null,"Prix et hypothèses (modifiables)"));
  det.append(el("p","note","Valeurs indicatives au Burkina Faso : remplacez-les par vos prix. Les prix marqués « internet » viennent de l'étude du marché B2A."));
  const pg=el("div","pj-grid");det.append(pg);
  params().forEach(([k,lab])=>{if(isCropT()&&k==="carb"&&!((S.irr==null)?(crop().g==="mara"||(N(S.camp)||1)>1):S.irr))return;
    const i=num(null,"any");i.placeholder=fmt(val(k),2).replace(/,00$/,"");const u=S.v[pkey(k)];if(u!=null&&u!=="")i.value=u;
    const f=field(pg,lab,i);if(isWeb(k)){const lb=f.parentNode.querySelector("label");lb.append(el("span","pj-web","internet"))}
    i.oninput=()=>{S.v[pkey(k)]=i.value;upd()}});
  const rs=el("button","btn small ghost","Remettre les valeurs par défaut");rs.type="button";rs.onclick=()=>{Object.keys(S.v).filter(k=>k.startsWith((isCropT()?"c_"+S.crop:S.type)+".")).forEach(k=>delete S.v[k]);save();render()};det.append(rs);
  fc.append(det);view.append(fc);
  const out=el("div");out.id="pj-out";view.append(out);results(out);
  if(PRO()&&PRO().loadPrix)try{PRO().loadPrix()}catch(e){}}
let updT=null;function upd(){save();clearTimeout(updT);updT=setTimeout(()=>{const o=$("pj-out");if(o){o.innerHTML="";results(o)}},250)}

function results(out){let r;try{r=compute()}catch(e){console.warn(e);out.append(el("p","msg err","—"));return}window.__b2aProjet=r;
  const nom=r.kind==="culture"?r.c.n:r.s.n;
  /* résumé */
  const c1=card("Résultat du projet");const k=el("div","pj-kpis");c1.append(k);
  kpi(k,"Argent à réunir avant de commencer",F(r.fin.tot),"big");
  kpi(k,"Investissement de départ",F(r.inv));kpi(k,"Dépenses de fonctionnement",F(r.op));
  kpi(k,"Total des dépenses",F(r.dep));kpi(k,"Recettes prévues",F(r.rec));
  kpi(k,"Bénéfice prévu",F(r.ben),r.ben>=0?"good":"bad");kpi(k,"Rentabilité",fmt(r.renta,0)+" %",r.ben>=0?"good":"bad");
  kpi(k,"Durée du projet",fmt(r.M)+" "+tr("mois"));
  const pr=r.prod;kpi(k,"Production",pr.oeufs?fmt(pr.oeufs)+" "+tr("plateaux d'œufs"):pr.tetes?fmt(pr.tetes)+" "+tr("animaux vendus"):r.kind==="culture"?fmt(pr.kg)+" "+tr("kg récoltés"):fmt(pr.kg)+" "+tr("kg de poisson"));
  kpi(k,r.kind==="culture"?"Bénéfice par campagne (sans l'investissement)":"Bénéfice par bande (sans l'investissement)",F(r.parBande),r.parBande>=0?"good":"bad");
  kpi(k,r.kind==="culture"?"Campagnes pour rembourser l'investissement":"Bandes pour rembourser l'investissement",r.bandesInv!=null?fmt(r.bandesInv):"—");
  if(r.back!=null){const p=el("p","msg good");p.append(el("span",null,"L'argent investi est récupéré au mois"),document.createTextNode(" "),notr(el("b",null,String(r.back))));c1.append(p)}
  else c1.append(el("p","msg"+(r.parBande<0?" err":""),r.parBande<0?"Attention : avec ces prix, le projet perd de l'argent.":"L'argent investi n'est pas récupéré pendant la durée simulée : ajoutez des bandes, ou revoyez les prix."));
  if(r.kind==="animal"&&r.inv>0)c1.append(el("p","note","Le bâtiment et le matériel restent après le projet : les bandes suivantes coûtent moins cher."));
  const bt=el("div","pj-btns");const b1=el("button","btn small","Télécharger le PDF");b1.type="button";b1.onclick=()=>pdf(r,nom).catch(e=>console.warn(e));
  const b2=el("button","btn small ghost","Partager");b2.type="button";b2.onclick=()=>share(r,nom);bt.append(b1,b2);c1.append(bt);out.append(c1);
  /* superficie */
  const c2=card("Superficie nécessaire");const t2=el("table");const tb2=el("tbody");t2.append(tb2);c2.append(t2);const u=r.surf;
  if(r.kind==="culture"){row(tb2,"Surface cultivée",fmt(u.ha,2)+" ha ("+fmt(u.ha*10000)+" m²)");row(tb2,"Dimensions de la parcelle",fmt(u.side)+" × "+fmt(u.side)+" m");
    if(r.c.eca)row(tb2,"Écartement",r.c.eca);row(tb2,"Magasin de récolte",fmt(u.mag)+" m²")}
  else{if(r.s.poisson)row(tb2,"Surface des bassins",fmt(u.animM2)+" m² ("+fmt(u.bassinN)+" × 50 m²)");
    else{row(tb2,"Surface pour les animaux",fmt(u.animM2)+" m²");row(tb2,"Densité",fmt(r.s.dens,2).replace(/,00$/,"")+" "+tr("par m²"))}
    row(tb2,"Magasin d'aliment",fmt(u.mag)+" m²");if(u.sas)row(tb2,"Sas sanitaire et pédiluve",fmt(u.sas)+" m²");if(u.bur)row(tb2,"Bureau et vestiaire",fmt(u.bur)+" m²");
    row(tb2,"Surface couverte totale",fmt(u.couvert)+" m²","sub");if(u.parc)row(tb2,"Parc extérieur",fmt(u.parc)+" m²");
    if(!r.s.poisson)row(tb2,"Bâtiments",fmt(u.nBat)+" × ("+fmt(u.larg)+" × "+fmt(u.len,1)+" m)")}
  row(tb2,"Terrain nécessaire",fmt(u.tW)+" × "+fmt(u.tL)+" m = "+fmt(u.terrain)+" m² ("+fmt(u.terrain/10000,2)+" ha)","tot");out.append(c2);
  /* plan */
  const c3=card(r.kind==="culture"?"Plan de la parcelle":"Plan de construction");c3.append(el("p","note","Vue de dessus, à l'échelle. Orientez la longueur des bâtiments d'est en ouest : le soleil n'entre pas à l'intérieur et l'air circule."));
  const sv=plan(r);sv.id="pj-svg";c3.append(sv);
  const lg=el("div","pj-leg");sv.__leg.forEach((f,lab)=>{const sp=el("span");const i=el("i");i.style.background=f;sp.append(i,el("span",null,lab));lg.append(sp)});c3.append(lg);
  if(r.mat.length){c3.append(el("h3","sec","Matériaux du bâtiment (estimation)"));const t=el("table"),tb=el("tbody");t.append(tb);
    if(r.kind==="animal"&&!r.s.poisson){row(tb,"Type de bâtiment",tr(BAT[S.bat][0]));row(tb,"Hauteur du muret",fmt(r.s.h,1)+" m");row(tb,"Hauteur sous toiture",(r.s.volaille?"2,8":"3")+" m")}
    r.mat.forEach(([n,q,un])=>row(tb,n,fmt(q)+(un?" "+un:"")));c3.append(t)}
  if(r.eqL&&r.eqL.length){c3.append(el("h3","sec","Matériel"));const t=el("table"),th=el("thead"),tb=el("tbody");const hr=el("tr");["Matériel","Quantité","Prix unitaire","Montant"].forEach((x,i)=>hr.append(el("th",i?"n":null,x)));th.append(hr);t.append(th,tb);
    r.eqL.forEach(([n,nb,p,tot])=>{const tt=el("tr");tt.append(el("td",null,n),notr(el("td","n",fmt(nb))),notr(el("td","n",F(p))),notr(el("td","n",F(tot))));tb.append(tt)});c3.append(t)}
  out.append(c3);
  /* dépenses */
  const c4=card("Détail des dépenses");const t4=el("table"),tb4=el("tbody");t4.append(tb4);c4.append(t4);
  const keys=Object.keys(r.post).filter(k=>r.post[k]>0.5);
  row(tb4,"Investissement","","sub");keys.filter(k=>INV.includes(k)).forEach(k=>row(tb4,k,F(r.post[k])));
  row(tb4,"Fonctionnement","","sub");keys.filter(k=>!INV.includes(k)&&!REC.includes(k)).forEach(k=>row(tb4,k,F(r.post[k])));
  row(tb4,"Total des dépenses",F(r.dep),"tot");
  row(tb4,"Recettes","","sub");keys.filter(k=>REC.includes(k)).forEach(k=>row(tb4,k,F(r.post[k])));
  row(tb4,"Bénéfice prévu",F(r.ben),"tot");out.append(c4);
  /* financement */
  const c5=card("Plan de financement");const fg=el("div","pj-grid");c5.append(fg);
  const ai=field(fg,"Apport personnel (%)",num(S.apport,"5"));ai.max="100";ai.oninput=()=>{S.apport=ai.value;upd()};
  const xi=field(fg,"Taux du crédit (% par an)",num(S.taux,"0.5"));xi.oninput=()=>{S.taux=xi.value;upd()};
  const di=field(fg,"Durée du crédit (mois)",num(S.duree,"1"));di.oninput=()=>{S.duree=di.value;upd()};
  const t5=el("table"),tb5=el("tbody");t5.append(tb5);c5.append(t5);const f=r.fin;
  row(tb5,"Besoins","","sub");row(tb5,"Investissement de départ (bâtiment, matériel, animaux)",F(Math.min(f.besoin,r.months[0].dep+(r.months[1]?r.months[1].dep:0))));
  row(tb5,"Fonds de roulement jusqu'aux premières recettes",F(Math.max(0,f.besoin-Math.min(f.besoin,r.months[0].dep+(r.months[1]?r.months[1].dep:0)))));
  row(tb5,"Marge de sécurité (10 %)",F(f.marge));row(tb5,"Argent à réunir avant de commencer",F(f.tot),"tot");
  row(tb5,"Ressources","","sub");row(tb5,"Apport personnel",F(f.apport));row(tb5,"Crédit ou partenaire",F(f.cred));
  if(f.cred>0){row(tb5,"Mensualité du crédit",F(f.mens)+" × "+f.n);row(tb5,"Coût total du crédit (intérêts)",F(f.inter));row(tb5,"Bénéfice après remboursement du crédit",F(r.ben-f.inter),"tot")}
  out.append(c5);
  /* calendrier */
  const c6=card("Calendrier mois par mois");const sc=el("div","pj-scroll");const t6=el("table"),th6=el("thead"),tb6=el("tbody");const hr=el("tr");
  ["Mois","Dépenses","Recettes","Solde cumulé","Ce qui se passe"].forEach((x,i)=>hr.append(el("th",i&&i<4?"n":null,x)));th6.append(hr);t6.append(th6,tb6);sc.append(t6);c6.append(sc);
  r.months.forEach((m,i)=>{const tt=el("tr");tt.append(notr(el("td",null,String(i))),notr(el("td","n",F(m.dep))),notr(el("td","n",m.rec?F(m.rec):"—")),notr(el("td","n"+(m.cum<0?" neg":""),F(m.cum))));
    const ev=el("td");[...new Set(m.ev)].forEach((e,j)=>{if(j)ev.append(document.createTextNode(" · "));ev.append(el("span",null,e))});tt.append(ev);tb6.append(tt)});
  out.append(c6);
  out.append(el("p","note","Valeurs indicatives, à vérifier avec vos fournisseurs avant de commencer."))}

/* ================= PDF et partage ================= */
const svgPng=svg=>new Promise(res=>{try{const x=new XMLSerializer().serializeToString(svg);const im=new Image();const w=1400,h=Math.round(w*svg.viewBox.baseVal.height/svg.viewBox.baseVal.width);
  im.onload=()=>{const c=document.createElement("canvas");c.width=w;c.height=h;const g=c.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,w,h);g.drawImage(im,0,0,w,h);res({d:c.toDataURL("image/jpeg",0.85),w,h})};
  im.onerror=()=>res(null);im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(x)}catch(e){res(null)}});
const pdfTxt=s=>String(s).replace(/ | /g," ");
const loadJs=src=>new Promise((res,rej)=>{if(document.querySelector(`script[data-pj="${src}"]`))return res();const s=document.createElement("script");s.src=src;s.dataset.pj=src;s.onload=res;s.onerror=rej;document.head.append(s)});
async function pdfLibs(){if(window.jspdf&&window.jspdf.jsPDF&&window.jspdf.jsPDF.API.autoTable)return;await loadJs("libs/jspdf.umd.min.js");await loadJs("libs/jspdf.plugin.autotable.min.js")}
async function pdf(r,nom){await pdfLibs();if(!window.jspdf)return;const {jsPDF}=window.jspdf;const doc=new jsPDF({unit:"mm",format:"a4"});const W=doc.internal.pageSize.getWidth();
  const T2=s=>pdfTxt(tr(s));let y=16;
  doc.setFillColor(27,46,76);doc.rect(0,0,W,24,"F");doc.setTextColor(255);doc.setFontSize(15);doc.text(pdfTxt(tr("Simulation du projet")+" : "+tr(nom)),12,11);
  doc.setFontSize(9);doc.text("B2A Smart Farming · B2A-HIGH-TECHNOLOGY-AUTOMATION · "+new Date().toLocaleDateString("fr-FR"),12,18);doc.setTextColor(20);y=32;
  const tab=(title,body,head)=>{doc.setFontSize(12);doc.setFont(undefined,"bold");doc.text(T2(title),12,y);doc.setFont(undefined,"normal");
    doc.autoTable({startY:y+3,head:head?[head.map(T2)]:undefined,body:body.map(rw=>rw.map(c=>pdfTxt(c))),theme:"grid",styles:{fontSize:9,cellPadding:1.6},headStyles:{fillColor:[27,46,76]},
      columnStyles:{1:{halign:"right"},2:{halign:"right"},3:{halign:"right"}},margin:{left:12,right:12}});y=doc.lastAutoTable.finalY+8;if(y>260){doc.addPage();y=16}};
  const u=r.surf;
  tab("Résultat du projet",[[T2("Argent à réunir avant de commencer"),F(r.fin.tot)],[T2("Investissement de départ"),F(r.inv)],[T2("Dépenses de fonctionnement"),F(r.op)],[T2("Total des dépenses"),F(r.dep)],
    [T2("Recettes prévues"),F(r.rec)],[T2("Bénéfice prévu"),F(r.ben)],[T2("Rentabilité"),fmt(r.renta)+" %"],[T2(r.kind==="culture"?"Bénéfice par campagne (sans l'investissement)":"Bénéfice par bande (sans l'investissement)"),F(r.parBande)],[T2(r.kind==="culture"?"Campagnes pour rembourser l'investissement":"Bandes pour rembourser l'investissement"),r.bandesInv!=null?String(r.bandesInv):"-"],[T2("Durée du projet"),r.M+" "+T2("mois")],[T2("L'argent investi est récupéré au mois"),r.back!=null?String(r.back):"—"]]);
  const sb=r.kind==="culture"?[[T2("Surface cultivée"),fmt(u.ha,2)+" ha"],[T2("Dimensions de la parcelle"),fmt(u.side)+" x "+fmt(u.side)+" m"],[T2("Magasin de récolte"),fmt(u.mag)+" m²"]]
    :[[T2(r.s.poisson?"Surface des bassins":"Surface pour les animaux"),fmt(u.animM2)+" m²"],[T2("Magasin d'aliment"),fmt(u.mag)+" m²"],[T2("Surface couverte totale"),fmt(u.couvert)+" m²"]].concat(u.parc?[[T2("Parc extérieur"),fmt(u.parc)+" m²"]]:[],r.s.poisson?[]:[[T2("Bâtiments"),u.nBat+" x ("+fmt(u.larg)+" x "+fmt(u.len,1)+" m)"]]);
  sb.push([T2("Terrain nécessaire"),fmt(u.tW)+" x "+fmt(u.tL)+" m = "+fmt(u.terrain)+" m²"]);tab("Superficie nécessaire",sb);
  const img=await svgPng($("pj-svg")||plan(r));if(img){doc.setFontSize(12);doc.setFont(undefined,"bold");doc.text(T2(r.kind==="culture"?"Plan de la parcelle":"Plan de construction"),12,y);doc.setFont(undefined,"normal");
    const iw=W-24,ih=iw*img.h/img.w;if(y+ih>280){doc.addPage();y=16}doc.addImage(img.d,"JPEG",12,y+3,iw,ih);y+=ih+10;if(y>260){doc.addPage();y=16}}
  if(r.mat.length)tab("Matériaux du bâtiment (estimation)",r.mat.map(([n,q,un])=>[T2(n),fmt(q)+(un?" "+un:"")]));
  if(r.eqL&&r.eqL.length)tab("Matériel",r.eqL.map(([n,nb,p,t])=>[T2(n),fmt(nb),F(p),F(t)]),["Matériel","Quantité","Prix unitaire","Montant"]);
  const ks=Object.keys(r.post).filter(k=>r.post[k]>0.5);
  tab("Détail des dépenses",[[T2("Investissement"),""],...ks.filter(k=>INV.includes(k)).map(k=>[T2(k),F(r.post[k])]),[T2("Fonctionnement"),""],...ks.filter(k=>!INV.includes(k)&&!REC.includes(k)).map(k=>[T2(k),F(r.post[k])]),
    [T2("Total des dépenses"),F(r.dep)],[T2("Recettes"),""],...ks.filter(k=>REC.includes(k)).map(k=>[T2(k),F(r.post[k])]),[T2("Bénéfice prévu"),F(r.ben)]]);
  const f=r.fin;tab("Plan de financement",[[T2("Argent à réunir avant de commencer"),F(f.tot)],[T2("Apport personnel"),F(f.apport)],[T2("Crédit ou partenaire"),F(f.cred)]].concat(f.cred>0?[[T2("Mensualité du crédit"),F(f.mens)+" x "+f.n],[T2("Coût total du crédit (intérêts)"),F(f.inter)]]:[]));
  tab("Calendrier mois par mois",r.months.map((m,i)=>[String(i),F(m.dep),m.rec?F(m.rec):"-",F(m.cum),[...new Set(m.ev)].map(T2).join(" · ")]),["Mois","Dépenses","Recettes","Solde cumulé","Ce qui se passe"]);
  doc.setFontSize(8);doc.text(T2("Valeurs indicatives, à vérifier avec vos fournisseurs avant de commencer."),12,Math.min(287,y));
  const name="simulation-"+(r.kind==="culture"?S.crop:S.type)+".pdf";
  try{const dl=window.claude&&await window.claude.use("downloads");if(dl){await dl.save({filename:name,data:doc.output("blob")});return}}catch(e){}
  doc.save(name)}
function share(r,nom){const L=[tr("Simulation du projet")+" : "+tr(nom),
  tr("Argent à réunir avant de commencer")+" : "+F(r.fin.tot),tr("Investissement de départ")+" : "+F(r.inv),tr("Total des dépenses")+" : "+F(r.dep),
  tr("Recettes prévues")+" : "+F(r.rec),tr("Bénéfice prévu")+" : "+F(r.ben)+" ("+fmt(r.renta)+" %)",tr("Durée du projet")+" : "+r.M+" "+tr("mois"),
  tr("Terrain nécessaire")+" : "+fmt(r.surf.terrain)+" m²","","B2A Smart Farming"].map(pdfTxt).join("\n");
  if(navigator.share){navigator.share({text:L}).catch(()=>{});return}
  window.open("https://wa.me/?text="+encodeURIComponent(L),"_blank","noopener")}

/* ================= onglet ================= */
const nav=document.querySelector("nav.tabs"),wrap=document.querySelector(".wrap");
if(nav&&wrap){
  const tb=el("button");tb.type="button";tb.setAttribute("role","tab");tb.id="tab-projet";tb.setAttribute("aria-selected","false");
  tb.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18"/><path d="M5 21V10l7-5 7 5v11"/><path d="M9 21v-5h6v5"/><path d="M15 3h5v5"/><path d="M20 3l-5 5"/></svg>';tb.append(document.createTextNode("Simulation de projet"));nav.append(tb);
  view=el("div","view");view.id="v-projet";view.hidden=true;const last=$("v-diagnostic");if(last&&last.parentNode===wrap)last.after(view);else wrap.append(view);
  const open=()=>{document.querySelectorAll('.wrap > .view[id^="v-"]').forEach(x=>{x.hidden=x!==view});
    document.querySelectorAll('nav.tabs [role="tab"]').forEach(t=>t.setAttribute("aria-selected",String(t===tb)));
    try{history.replaceState(null,"","#projet")}catch(e){}window.scrollTo(0,0);render()};
  tb.addEventListener("click",open);
  /* un autre onglet : on cache la simulation (app.js ne connaît pas cet onglet) */
  nav.querySelectorAll('[role="tab"]').forEach(t=>{if(t!==tb)t.addEventListener("click",()=>{view.hidden=true;tb.setAttribute("aria-selected","false")})});
  if(location.hash==="#projet")setTimeout(open,80);
  /* la version Pro devient active plus tard (paiement vérifié) : on redessine */
  let was=isPro();setInterval(()=>{const n=isPro();if(n!==was){was=n;if(!view.hidden)render()}},4000);
}
window.B2A_PROJET={compute,render,state:()=>S};
})();
