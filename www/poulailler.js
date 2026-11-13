/* B2A Smart Farming : poulailler connecté.
   Pilote le dispositif de contrôle B2A Smart Building (aliment, eau, éclairage, humidificateur, ventilation),
   lit les mesures (3 sondes, 3 points d'eau, 3 points d'aliment, totaux, qualité de l'air et de l'eau) et affiche les alertes.
   Liaison : API REST du dispositif (lecture et écriture groupées), par CapacitorHttp dans l'application Android.
   À distance : uniquement par le VPN du routeur B2A, jamais par redirection de port.
   Tant qu'aucun dispositif n'est configuré, l'écran fonctionne en mode démo (simulation). */
(function(){
const B=window.B2A;if(!B||!B.app)return;const A=B.app;
const V=document.getElementById("v-poulailler");if(!V)return;

/* ================= traductions (même format que les autres écrans de l'app) ================= */
const T={
"Poulailler":["Poultry house","Pollaio","Gallinero"],
"Poulailler connecté":["Connected poultry house","Pollaio connesso","Gallinero conectado"],
"Vue {0}D du poulailler":["{0}D view of the poultry house","Vista {0}D del pollaio","Vista {0}D del gallinero"],
"Voir et commander les équipements dans le bâtiment en {0}D : lumières, ventilateurs, moteur, eau, valeurs en couleur.":["See and control the equipment in the building in {0}D: lights, fans, motor, water, colour-coded values.","Vedere e comandare gli apparecchi dell'edificio in {0}D: luci, ventilatori, motore, acqua, valori a colori.","Ver y controlar los equipos del edificio en {0}D: luces, ventiladores, motor, agua, valores en color."],
"La vue {0}D n'a pas pu se charger.":["The {0}D view could not load.","Impossibile caricare la vista {0}D.","No se pudo cargar la vista {0}D."],
"Aliment, eau, lumière, ventilation et alertes à distance":["Feed, water, light, ventilation and alerts remotely","Mangime, acqua, luce, ventilazione e allarmi a distanza","Pienso, agua, luz, ventilación y alertas a distancia"],
"Dispositif de contrôle B{0}A Smart Building":["B{0}A Smart Building control device","Dispositivo di controllo B{0}A Smart Building","Dispositivo de control B{0}A Smart Building"],
"Démo":["Demo","Demo","Demo"],"Mode démo":["Demo mode","Modalità demo","Modo demo"],
"simulation, aucun dispositif branché.":["simulation, no device connected.","simulazione, nessun dispositivo collegato.","simulación, ningún dispositivo conectado."],
"Mode démo : simulation, aucun dispositif branché.":["Demo mode: simulation, no device connected.","Modalità demo: simulazione, nessun dispositivo collegato.","Modo demo: simulación, ningún dispositivo conectado."],
"Configurez la connexion en bas de l'écran.":["Set up the connection at the bottom of the screen.","Configura la connessione in fondo allo schermo.","Configura la conexión al final de la pantalla."],
"Hors ligne":["Offline","Offline","Sin conexión"],"Commande non envoyée":["Command not sent","Comando non inviato","Orden no enviada"],
"Dispositif injoignable (VPN actif ?)":["Device unreachable (VPN on?)","Dispositivo non raggiungibile (VPN attiva?)","Dispositivo inaccesible (¿VPN activa?)"],
"Dispositif injoignable":["Device unreachable","Dispositivo non raggiungibile","Dispositivo inaccesible"],
"Vérifier le routeur 4G, le VPN et l'alimentation à la ferme":["Check the 4G router, the VPN and the power supply at the farm","Verificare il router 4G, la VPN e l'alimentazione in fattoria","Comprobar el router 4G, la VPN y la alimentación en la granja"],
"Alertes":["Alerts","Allarmi","Alertas"],"Aucune":["None","Nessuno","Ninguna"],"{0} alerte":["{0} alert","{0} allarme","{0} alerta"],"{0} alertes":["{0} alerts","{0} allarmi","{0} alertas"],
"Sur place":["On site","In loco","En el lugar"],"Acquitter":["Acknowledge","Tacitare","Reconocer"],"Activer le son":["Enable sound","Attiva il suono","Activar el sonido"],"Son activé":["Sound on","Suono attivo","Sonido activado"],
"Urgence : sirène, gyrophare, SMS et notification.":["Emergency: siren, beacon, SMS and notification.","Urgenza: sirena, lampeggiante, SMS e notifica.","Urgencia: sirena, baliza, SMS y notificación."],
"sirène, gyrophare, SMS et notification.":["siren, beacon, SMS and notification.","sirena, lampeggiante, SMS e notifica.","sirena, baliza, SMS y notificación."],
"Attention : gyrophare et notification.":["Warning: beacon and notification.","Attenzione: lampeggiante e notifica.","Atención: baliza y notificación."],
"gyrophare et notification.":["beacon and notification.","lampeggiante e notifica.","baliza y notificación."],
"La sirène se coupe avec « {q0} » (ici ou bouton sur le coffret) ; l'alerte reste affichée tant que le problème n'est pas réglé.":["The siren stops with \"{q0}\" (here or the button on the cabinet); the alert stays on screen until the problem is fixed.","La sirena si spegne con « {q0} » (qui o con il pulsante sul quadro); l'allarme resta visibile finché il problema non è risolto.","La sirena se apaga con « {q0} » (aquí o con el botón del armario); la alerta sigue visible hasta que se resuelva el problema."],
"Simuler une panne (démo)":["Simulate a fault (demo)","Simula un guasto (demo)","Simular una avería (demo)"],
"Chaleur":["Heat","Caldo","Calor"],"Sonde en défaut":["Faulty probe","Sonda guasta","Sonda averiada"],"Eau ne remplit pas":["Water not filling","L'acqua non riempie","El agua no llena"],
"Fuite d'eau":["Water leak","Perdita d'acqua","Fuga de agua"],"Vis bloquée":["Auger jammed","Coclea bloccata","Sinfín bloqueado"],"Batterie faible":["Low battery","Batteria scarica","Batería baja"],"Tout réparer":["Repair all","Ripara tutto","Reparar todo"],
"Tout fonctionne normalement.":["Everything is working normally.","Tutto funziona normalmente.","Todo funciona con normalidad."],
"Urgence":["Emergency","Urgenza","Urgencia"],"Attention":["Warning","Attenzione","Atención"],
"Urgence au poulailler":["Emergency at the poultry house","Urgenza al pollaio","Urgencia en el gallinero"],"Attention au poulailler":["Warning at the poultry house","Attenzione al pollaio","Atención en el gallinero"],
"depuis {0} h {1}":["since {0}:{1}","dalle {0}:{1}","desde las {0}:{1}"],
"Sirène et gyrophare en marche":["Siren and beacon on","Sirena e lampeggiante accesi","Sirena y baliza encendidas"],"Gyrophare allumé":["Beacon on","Lampeggiante acceso","Baliza encendida"],"Sirène coupée":["Siren off","Sirena spenta","Sirena apagada"],
"Chaleur : plus de {0} °C dans le poulailler":["Heat: above {0} °C in the poultry house","Caldo: oltre {0} °C nel pollaio","Calor: más de {0} °C en el gallinero"],
"plus de {0} °C dans le poulailler":["above {0} °C in the poultry house","oltre {0} °C nel pollaio","más de {0} °C en el gallinero"],
"Vérifier ventilateurs et brumisation, ouvrir le bâtiment":["Check fans and misting, open up the building","Verificare ventilatori e nebulizzazione, aprire l'edificio","Comprobar ventiladores y nebulización, abrir la nave"],
"L'eau ne remplit pas les abreuvoirs":["Water is not filling the drinkers","L'acqua non riempie gli abbeveratoi","El agua no llena los bebederos"],
"Cuve vide, tuyau bouché ou électrovanne en panne":["Empty tank, blocked pipe or faulty solenoid valve","Serbatoio vuoto, tubo ostruito o elettrovalvola guasta","Depósito vacío, tubo obstruido o electroválvula averiada"],
"Fuite d'eau : le compteur tourne vanne fermée":["Water leak: meter running with valve closed","Perdita d'acqua: il contatore gira a valvola chiusa","Fuga de agua: el contador gira con la válvula cerrada"],
"le compteur tourne vanne fermée":["meter running with valve closed","il contatore gira a valvola chiusa","el contador gira con la válvula cerrada"],
"Couper l'arrivée et chercher la fuite":["Shut off the supply and find the leak","Chiudere l'arrivo e cercare la perdita","Cortar la entrada y buscar la fuga"],
"Aliment : moteur en marche mais rien ne sort":["Feed: motor running but nothing comes out","Mangime: motore in marcia ma non esce nulla","Pienso: motor en marcha pero no sale nada"],
"moteur en marche mais rien ne sort":["motor running but nothing comes out","motore in marcia ma non esce nulla","motor en marcha pero no sale nada"],
"Trémie vide ou vis bloquée":["Empty hopper or jammed auger","Tramoggia vuota o coclea bloccata","Tolva vacía o sinfín bloqueado"],
"Batterie faible : moins de {0} V":["Low battery: below {0} V","Batteria scarica: meno di {0} V","Batería baja: menos de {0} V"],"moins de {0} V":["below {0} V","meno di {0} V","menos de {0} V"],
"Vérifier panneaux et régulateur, délestage en cours":["Check panels and charge controller, load shedding active","Verificare pannelli e regolatore, distacco carichi in corso","Comprobar paneles y regulador, deslastre en curso"],
"Ammoniac au-dessus de {0} ppm":["Ammonia above {0} ppm","Ammoniaca oltre {0} ppm","Amoníaco por encima de {0} ppm"],
"Changer la litière, aérer":["Change the litter, ventilate","Cambiare la lettiera, arieggiare","Cambiar la cama, ventilar"],
"Une sonde température-humidité est en défaut":["A temperature-humidity probe is faulty","Una sonda temperatura-umidità è guasta","Una sonda de temperatura-humedad está averiada"],
"Moyenne calculée avec les autres sondes ; vérifier le câble":["Average calculated with the other probes; check the cable","Media calcolata con le altre sonde; verificare il cavo","Media calculada con las otras sondas; comprobar el cable"],
"Trémie presque vide (moins de {0} kg)":["Hopper almost empty (below {0} kg)","Tramoggia quasi vuota (meno di {0} kg)","Tolva casi vacía (menos de {0} kg)"],
"Remplir la trémie":["Fill the hopper","Riempire la tramoggia","Llenar la tolva"],
"Qualité de l'eau hors limites (pH ou sels)":["Water quality out of range (pH or salts)","Qualità dell'acqua fuori limite (pH o sali)","Calidad del agua fuera de límites (pH o sales)"],
"Vérifier la cuve et les traitements":["Check the tank and treatments","Verificare il serbatoio e i trattamenti","Comprobar el depósito y los tratamientos"],
"Pilotage":["Control mode","Comando","Mando"],"Automatique":["Automatic","Automatico","Automático"],"Manuel":["Manual","Manuale","Manual"],"Mixte":["Mixed","Misto","Mixto"],
"Tout en Auto":["All on Auto","Tutto in Auto","Todo en Auto"],"Tout en Manuel":["All on Manual","Tutto in Manuale","Todo en Manual"],"Auto":["Auto","Auto","Auto"],
"Marche":["On","Marcia","Marcha"],"Arrêt":["Off","Arresto","Paro"],
"bon":["good","buono","bueno"],"à surveiller":["to watch","da sorvegliare","a vigilar"],"hors limite":["out of range","fuori limite","fuera de límite"],
"Le dispositif décide seul avec les consignes du lot (âge et santé).":["The device decides on its own using the flock's setpoints (age and health).","Il dispositivo decide da solo con i setpoint del lotto (età e salute).","El dispositivo decide solo con las consignas del lote (edad y salud)."],
"Tout est en manuel : vous commandez chaque équipement.":["Everything is on manual: you control each device.","Tutto è in manuale: comandi ogni apparecchio.","Todo está en manual: controlas cada equipo."],
"Tout est en manuel":["Everything is on manual","Tutto è in manuale","Todo está en manual"],"vous commandez chaque équipement.":["you control each device.","comandi ogni apparecchio.","controlas cada equipo."],
"Les sécurités restent actives (chaleur, ligne pleine, trémie vide).":["Safeties stay active (heat, full line, empty hopper).","Le sicurezze restano attive (caldo, linea piena, tramoggia vuota).","Las seguridades siguen activas (calor, línea llena, tolva vacía)."],
"{0} commandes en manuel, {1} en automatique.":["{0} commands on manual, {1} on automatic.","{0} comandi in manuale, {1} in automatico.","{0} órdenes en manual, {1} en automático."],
"{0} commande en manuel, {1} en automatique.":["{0} command on manual, {1} on automatic.","{0} comando in manuale, {1} in automatico.","{0} orden en manual, {1} en automático."],
"Manuel : Marche forcée jusqu'au retour en Auto.":["Manual: forced On until switched back to Auto.","Manuale: Marcia forzata fino al ritorno in Auto.","Manual: Marcha forzada hasta volver a Auto."],
"Marche forcée jusqu'au retour en Auto.":["Forced On until switched back to Auto.","Marcia forzata fino al ritorno in Auto.","Marcha forzada hasta volver a Auto."],
"Manuel : Arrêt forcé jusqu'au retour en Auto.":["Manual: forced Off until switched back to Auto.","Manuale: Arresto forzato fino al ritorno in Auto.","Manual: Paro forzado hasta volver a Auto."],
"Arrêt forcé jusqu'au retour en Auto.":["Forced Off until switched back to Auto.","Arresto forzato fino al ritorno in Auto.","Paro forzado hasta volver a Auto."],
"Lot et consignes automatiques":["Flock and automatic setpoints","Lotto e setpoint automatici","Lote y consignas automáticas"],"Sain":["Healthy","Sano","Sano"],"Mode santé":["Health mode","Modalità salute","Modo salud"],
"Lot sain":["Healthy flock","Lotto sano","Lote sano"],"Lot malade":["Sick flock","Lotto malato","Lote enfermo"],"Pondeuses (démo)":["Layers (demo)","Ovaiole (demo)","Ponedoras (demo)"],
"Âge : {0} semaines":["Age: {0} weeks","Età: {0} settimane","Edad: {0} semanas"],"Âge : {0} jours":["Age: {0} days","Età: {0} giorni","Edad: {0} días"],
"{0} semaines":["{0} weeks","{0} settimane","{0} semanas"],"{0} jours":["{0} days","{0} giorni","{0} días"],
"{0} animaux":["{0} animals","{0} animali","{0} animales"],"pondeuses":["layers","ovaiole","ponedoras"],"poulets de chair":["broilers","polli da carne","pollos de engorde"],
"poulets locaux et pintades":["local chickens and guinea fowl","polli locali e faraone","pollos locales y pintadas"],"porcs":["pigs","suini","cerdos"],"moutons et chèvres":["sheep and goats","pecore e capre","ovejas y cabras"],"chèvres laitières":["dairy goats","capre da latte","cabras lecheras"],"bovins":["cattle","bovini","bovinos"],"couvée":["incubation batch","covata","incubación"],"Élevage connecté":["Connected farm","Allevamento connesso","Granja conectada"],"Bassin connecté":["Connected pond","Vasca connessa","Estanque conectado"],"Serre connectée":["Connected greenhouse","Serra connessa","Invernadero conectado"],"Couveuse connectée":["Connected incubator","Incubatrice connessa","Incubadora conectada"],"Vue {0}D":["{0}D view","Vista {0}D","Vista {0}D"],"Arrosage":["Watering","Irrigazione","Riego"],"culture":["crop","coltura","cultivo"],"Couvée : {0} œufs":["Batch: {0} eggs","Covata: {0} uova","Incubación: {0} huevos"],"{0} œufs":["{0} eggs","{0} uova","{0} huevos"],"Jour {0} sur {1}":["Day {0} of {1}","Giorno {0} di {1}","Día {0} de {1}"],"Jour {0} depuis le semis":["Day {0} since sowing","Giorno {0} dalla semina","Día {0} desde la siembra"],
"Couvée : retournement des œufs jusqu'à J{0}, puis humidité d'éclosion.":["Incubation: egg turning until day {0}, then hatching humidity.","Covata: girata delle uova fino al giorno {0}, poi umidità di schiusa.","Incubación: volteo de los huevos hasta el día {0}, luego humedad de eclosión."],"Retournement arrêté : humidité d'éclosion, ne plus ouvrir la couveuse.":["Turning stopped: hatching humidity, do not open the incubator any more.","Girata fermata: umidità di schiusa, non aprire più l'incubatrice.","Volteo detenido: humedad de eclosión, no abrir más la incubadora."],
"Culture : arrosage selon l'humidité, aération de la serre au-dessus des seuils.":["Crop: watering according to humidity, greenhouse ventilation above the thresholds.","Coltura: irrigazione secondo l'umidità, aerazione della serra sopra le soglie.","Cultivo: riego según la humedad, ventilación del invernadero por encima de los umbrales."],"vaches laitières":["dairy cows","vacche da latte","vacas lecheras"],"poissons":["fish","pesci","peces"],"autres animaux":["other animals","altri animali","otros animales"],
"vérifier l'état des animaux.":["check the animals.","controllare gli animali.","revisar los animales."],"Eau en baisse de {0} % sur {1} jours : vérifier l'état des animaux.":["Water down {0} % over {1} days: check the animals.","Acqua in calo del {0} % su {1} giorni: controllare gli animali.","Agua en bajada del {0} % en {1} días: revisar los animales."],
"Température cible":["Target temperature","Temperatura obiettivo","Temperatura objetivo"],"Lumière par jour":["Light per day","Luce al giorno","Luz por día"],
"Ventilation étages {0} / {1}":["Ventilation stages {0} / {1}","Ventilazione stadi {0} / {1}","Ventilación etapas {0} / {1}"],
"Consignes non envoyées : dispositif injoignable. Il garde les dernières reçues.":["Setpoints not sent: device unreachable. It keeps the last ones received.","Setpoint non inviati: dispositivo non raggiungibile. Mantiene gli ultimi ricevuti.","Consignas no enviadas: dispositivo inaccesible. Mantiene las últimas recibidas."],
"Mode santé : température plus haute, ventilation forte seulement en grosse chaleur, lumière inchangée en ponte.":["Health mode: higher temperature, strong ventilation only in great heat, light unchanged during lay.","Modalità salute: temperatura più alta, ventilazione forte solo con molto caldo, luce invariata in deposizione.","Modo salud: temperatura más alta, ventilación fuerte solo con mucho calor, luz sin cambios en puesta."],
"température plus haute, ventilation forte seulement en grosse chaleur, lumière inchangée en ponte.":["higher temperature, strong ventilation only in great heat, light unchanged during lay.","temperatura più alta, ventilazione forte solo con molto caldo, luce invariata in deposizione.","temperatura más alta, ventilación fuerte solo con mucho calor, luz sin cambios en puesta."],
"Envoyées au dispositif à {0} h {1}.":["Sent to the device at {0}:{1}.","Inviati al dispositivo alle {0}:{1}.","Enviadas al dispositivo a las {0}:{1}."],
"Ambiance":["Climate","Ambiente","Ambiente"],"Mis à jour à {0} h {1}":["Updated at {0}:{1}","Aggiornato alle {0}:{1}","Actualizado a las {0}:{1}"],
"Température moyenne":["Average temperature","Temperatura media","Temperatura media"],"Humidité moyenne":["Average humidity","Umidità media","Humedad media"],
"Ammoniac":["Ammonia","Ammoniaca","Amoníaco"],"Sondes {0}":["Probes {0}","Sonde {0}","Sondas {0}"],"limite {0} ppm":["limit {0} ppm","limite {0} ppm","límite {0} ppm"],"ppm":["ppm","ppm","ppm"],
"Distribution d'aliment":["Feed distribution","Distribuzione mangime","Distribución de pienso"],"Début":["Start","Inizio","Inicio"],"Milieu":["Middle","Metà","Medio"],"Fin de ligne":["End of line","Fine linea","Fin de línea"],
"Hier":["Yesterday","Ieri","Ayer"],"Trémie":["Hopper","Tramoggia","Tolva"],"Moteur en marche":["Motor running","Motore in marcia","Motor en marcha"],"Moteur arrêté":["Motor stopped","Motore fermo","Motor parado"],
"distribution quand {0} points sur {1} sont vides, seulement quand il fait clair ; arrêt quand la fin de ligne est pleine.":["feeds when {0} of {1} points are empty, only when it is light; stops when the end of the line is full.","distribuisce quando {0} punti su {1} sono vuoti, solo con luce; si ferma quando la fine linea è piena.","distribuye cuando {0} de {1} puntos están vacíos, solo con luz; se para cuando el final de línea está lleno."],
"Auto : distribution quand {0} points sur {1} sont vides, seulement quand il fait clair ; arrêt quand la fin de ligne est pleine.":["Auto: feeds when {0} of {1} points are empty, only when it is light; stops when the end of the line is full.","Auto: distribuisce quando {0} punti su {1} sono vuoti, solo con luce; si ferma quando la fine linea è piena.","Auto: distribuye cuando {0} de {1} puntos están vacíos, solo con luz; se para cuando el final de línea está lleno."],
"Sécurité : le moteur s'arrête quand la fin de ligne est pleine ou la trémie vide.":["Safety: the motor stops when the end of the line is full or the hopper empty.","Sicurezza: il motore si ferma quando la fine linea è piena o la tramoggia vuota.","Seguridad: el motor se para cuando el final de línea está lleno o la tolva vacía."],
"le moteur s'arrête quand la fin de ligne est pleine ou la trémie vide.":["the motor stops when the end of the line is full or the hopper empty.","il motore si ferma quando la fine linea è piena o la tramoggia vuota.","el motor se para cuando el final de línea está lleno o la tolva vacía."],
"Distribution d'eau":["Water distribution","Distribuzione acqua","Distribución de agua"],"Vanne ouverte":["Valve open","Valvola aperta","Válvula abierta"],"Vanne fermée":["Valve closed","Valvola chiusa","Válvula cerrada"],
"pH de l'eau":["Water pH","pH dell'acqua","pH del agua"],"normal {0} à {1}":["normal {0} to {1}","normale {0}–{1}","normal {0} a {1}"],"Sels dissous":["Dissolved salts","Sali disciolti","Sales disueltas"],
"la vanne s'ouvre dès qu'un point manque d'eau et se ferme quand la fin de ligne est pleine ({0} min au maximum).":["the valve opens as soon as a point lacks water and closes when the end of the line is full ({0} min max).","la valvola si apre appena un punto è senz'acqua e si chiude quando la fine linea è piena (max {0} min).","la válvula se abre en cuanto falta agua en un punto y se cierra cuando el final de línea está lleno ({0} min máx.)."],
"Auto : la vanne s'ouvre dès qu'un point manque d'eau et se ferme quand la fin de ligne est pleine ({0} min au maximum).":["Auto: the valve opens as soon as a point lacks water and closes when the end of the line is full ({0} min max).","Auto: la valvola si apre appena un punto è senz'acqua e si chiude quando la fine linea è piena (max {0} min).","Auto: la válvula se abre en cuanto falta agua en un punto y se cierra cuando el final de línea está lleno ({0} min máx.)."],
"Sécurité : la vanne se ferme quand la ligne est pleine.":["Safety: the valve closes when the line is full.","Sicurezza: la valvola si chiude quando la linea è piena.","Seguridad: la válvula se cierra cuando la línea está llena."],
"la vanne se ferme quand la ligne est pleine.":["the valve closes when the line is full.","la valvola si chiude quando la linea è piena.","la válvula se cierra cuando la línea está llena."],
"Attention : plus aucun remplissage automatique.":["Warning: no more automatic filling.","Attenzione: nessun riempimento automatico.","Atención: ya no hay llenado automático."],
"plus aucun remplissage automatique.":["no more automatic filling.","nessun riempimento automatico.","ya no hay llenado automático."],
"Éclairage":["Lighting","Illuminazione","Iluminación"],"Allumé":["On","Acceso","Encendido"],"Éteint":["Off","Spento","Apagado"],"Allumage le matin":["Morning switch-on","Accensione al mattino","Encendido por la mañana"],
"{0} h de lumière par jour selon l'âge, à partir de {1} h {2} ; lampes seulement quand il fait sombre.":["{0} h of light per day by age, from {1}:{2}; lamps only when it is dark.","{0} h di luce al giorno secondo l'età, dalle {1}:{2}; lampade solo quando è buio.","{0} h de luz al día según la edad, a partir de las {1}:{2}; lámparas solo cuando está oscuro."],
"Auto : {0} h de lumière par jour selon l'âge, à partir de {1} h {2} ; lampes seulement quand il fait sombre.":["Auto: {0} h of light per day by age, from {1}:{2}; lamps only when it is dark.","Auto: {0} h di luce al giorno secondo l'età, dalle {1}:{2}; lampade solo quando è buio.","Auto: {0} h de luz al día según la edad, a partir de las {1}:{2}; lámparas solo cuando está oscuro."],
"{0} h {1}":["{0}:{1}","{0}:{1}","{0}:{1}"],
"En ponte, un arrêt prolongé fait baisser la production.":["During lay, a long switch-off lowers production.","In deposizione, uno spegnimento prolungato riduce la produzione.","En puesta, un apagado prolongado baja la producción."],
"Humidificateur":["Humidifier","Umidificatore","Humidificador"],"En marche":["Running","In marcia","En marcha"],"Arrêté":["Stopped","Fermo","Parado"],
"marche sous {0} % d'humidité moyenne, et en refroidissement au-dessus de {1} °C ; jamais au-dessus de {2} %.":["runs below {0} % average humidity, and for cooling above {1} °C; never above {2} %.","in marcia sotto {0} % di umidità media, e per raffrescare oltre {1} °C; mai oltre {2} %.","funciona por debajo de {0} % de humedad media, y para enfriar por encima de {1} °C; nunca por encima de {2} %."],
"Auto : marche sous {0} % d'humidité moyenne, et en refroidissement au-dessus de {1} °C ; jamais au-dessus de {2} %.":["Auto: runs below {0} % average humidity, and for cooling above {1} °C; never above {2} %.","Auto: in marcia sotto {0} % di umidità media, e per raffrescare oltre {1} °C; mai oltre {2} %.","Auto: funciona por debajo de {0} % de humedad media, y para enfriar por encima de {1} °C; nunca por encima de {2} %."],
"Ventilation":["Ventilation","Ventilazione","Ventilación"],"Arrêtée":["Stopped","Ferma","Parada"],"Étage {0}":["Stage {0}","Stadio {0}","Etapa {0}"],"Étages {0} et {1}":["Stages {0} and {1}","Stadi {0} e {1}","Etapas {0} y {1}"],
"Plus de {0} °C : la ventilation tourne malgré l'arrêt manuel (sécurité chaleur).":["Above {0} °C: ventilation runs despite manual Off (heat safety).","Oltre {0} °C: la ventilazione gira nonostante l'arresto manuale (sicurezza caldo).","Más de {0} °C: la ventilación funciona pese al paro manual (seguridad de calor)."],
"étage {0} au-dessus de {1} °C, étage {2} au-dessus de {3} °C ; aussi si l'ammoniac dépasse {4} ppm ou le CO₂ {5} ppm.":["stage {0} above {1} °C, stage {2} above {3} °C; also if ammonia exceeds {4} ppm or CO₂ {5} ppm.","stadio {0} oltre {1} °C, stadio {2} oltre {3} °C; anche se l'ammoniaca supera {4} ppm o la CO₂ {5} ppm.","etapa {0} por encima de {1} °C, etapa {2} por encima de {3} °C; también si el amoníaco supera {4} ppm o el CO₂ {5} ppm."],
"Auto : étage {0} au-dessus de {1} °C, étage {2} au-dessus de {3} °C ; aussi si l'ammoniac dépasse {4} ppm ou le CO₂ {5} ppm.":["Auto: stage {0} above {1} °C, stage {2} above {3} °C; also if ammonia exceeds {4} ppm or CO₂ {5} ppm.","Auto: stadio {0} oltre {1} °C, stadio {2} oltre {3} °C; anche se l'ammoniaca supera {4} ppm o la CO₂ {5} ppm.","Auto: etapa {0} por encima de {1} °C, etapa {2} por encima de {3} °C; también si el amoníaco supera {4} ppm o el CO₂ {5} ppm."],
"Au-dessus de {0} °C, la ventilation repart d'elle-même.":["Above {0} °C, ventilation restarts on its own.","Oltre {0} °C, la ventilazione riparte da sola.","Por encima de {0} °C, la ventilación vuelve a arrancar sola."],
"Analyse santé":["Health analysis","Analisi salute","Análisis de salud"],"journée d'hier":["yesterday","ieri","ayer"],
"Eau / aliment":["Water / feed","Acqua / mangime","Agua / pienso"],"repère ≈ {0}":["benchmark ≈ {0}","riferimento ≈ {0}","referencia ≈ {0}"],"g/poule":["g/hen","g/gallina","g/gallina"],"ml/poule":["ml/hen","ml/gallina","ml/gallina"],"g/poisson":["g/fish","g/pesce","g/pez"],"kg/porc":["kg/pig","kg/suino","kg/cerdo"],"L/porc":["L/pig","L/suino","L/cerdo"],"kg/animal":["kg/animal","kg/animale","kg/animal"],"L/animal":["L/animal","L/animale","L/animal"],"g/animal":["g/animal","g/animale","g/animal"],"ml/animal":["ml/animal","ml/animale","ml/animal"],
"+{0} % sur {1} jours":["+{0} % over {1} days","+{0} % su {1} giorni","+{0} % en {1} días"],"−{0} % sur {1} jours":["−{0} % over {1} days","−{0} % su {1} giorni","−{0} % en {1} días"],
"Eau en baisse de {0} % sur {1} jours : vérifier l'état des poules.":["Water down {0} % over {1} days: check the hens.","Acqua in calo del {0} % su {1} giorni: controllare le galline.","Agua en bajada del {0} % en {1} días: revisar las gallinas."],
"Eau en baisse de {0} % sur {1} jours":["Water down {0} % over {1} days","Acqua in calo del {0} % su {1} giorni","Agua en bajada del {0} % en {1} días"],"vérifier l'état des poules.":["check the hens.","controllare le galline.","revisar las gallinas."],
"Aliment en baisse de {0} % sur {1} jours.":["Feed down {0} % over {1} days.","Mangime in calo del {0} % su {1} giorni.","Pienso en bajada del {0} % en {1} días."],
"Ammoniac élevé : litière à changer.":["High ammonia: change the litter.","Ammoniaca alta: cambiare la lettiera.","Amoníaco alto: cambiar la cama."],"Ammoniac élevé":["High ammonia","Ammoniaca alta","Amoníaco alto"],"litière à changer.":["change the litter.","cambiare la lettiera.","cambiar la cama."],
"pH de l'eau hors de {0} à {1}.":["Water pH outside {0} to {1}.","pH dell'acqua fuori da {0}–{1}.","pH del agua fuera de {0} a {1}."],"Trop de sels dissous dans l'eau.":["Too many dissolved salts in the water.","Troppi sali disciolti nell'acqua.","Demasiadas sales disueltas en el agua."],
"Consommations normales, air et eau dans les limites.":["Normal consumption, air and water within limits.","Consumi normali, aria e acqua nei limiti.","Consumos normales, aire y agua dentro de los límites."],
"Connexion au dispositif":["Device connection","Connessione al dispositivo","Conexión al dispositivo"],"Mode démo (simulation, sans dispositif)":["Demo mode (simulation, no device)","Modalità demo (simulazione, senza dispositivo)","Modo demo (simulación, sin dispositivo)"],
"Adresse IP du dispositif":["Device IP address","Indirizzo IP del dispositivo","Dirección IP del dispositivo"],"Utilisateur":["User","Utente","Usuario"],"Mot de passe":["Password","Password","Contraseña"],
"ex. {0}.{1}.{2}.{3}":["e.g. {0}.{1}.{2}.{3}","es. {0}.{1}.{2}.{3}","ej. {0}.{1}.{2}.{3}"],
"Enregistrer et se connecter":["Save and connect","Salva e connetti","Guardar y conectar"],
"Ces informations restent seulement sur ce téléphone.":["This information stays only on this phone.","Queste informazioni restano solo su questo telefono.","Esta información queda solo en este teléfono."],
"À distance, activez d'abord le VPN du routeur B{0}A.":["Remotely, first turn on the B{0}A router VPN.","Da remoto, attivare prima la VPN del router B{0}A.","A distancia, activa primero la VPN del router B{0}A."],
"Le dispositif n'est jamais ouvert directement sur internet.":["The device is never exposed directly to the internet.","Il dispositivo non è mai esposto direttamente su internet.","El dispositivo nunca se expone directamente a internet."],
"Première connexion : installez le certificat du dispositif sur le téléphone (Réglages, Sécurité, Installer un certificat).":["First connection: install the device certificate on the phone (Settings, Security, Install a certificate).","Prima connessione: installa il certificato del dispositivo sul telefono (Impostazioni, Sicurezza, Installa un certificato).","Primera conexión: instala el certificado del dispositivo en el teléfono (Ajustes, Seguridad, Instalar un certificado)."],
"Sur ordinateur ou iPhone, ouvrez d'abord l'adresse du dispositif dans le navigateur et acceptez son certificat.":["On a computer or iPhone, first open the device address in the browser and accept its certificate.","Su computer o iPhone, apri prima l'indirizzo del dispositivo nel browser e accetta il suo certificato.","En un ordenador o iPhone, abre primero la dirección del dispositivo en el navegador y acepta su certificado."]
};
{const D=window.B2A_DICT=window.B2A_DICT||{};["en","it","es"].forEach((l,i)=>{D[l]=D[l]||{};for(const k in T)if(D[l][k]==null)D[l][k]=T[k][i]})}

/* ================= points du dispositif (numéros d'exemple, à aligner sur son programme) ================= */
const AV="analogValue",AI="analogInput",BV="binaryValue",MSV="multiStateValue";
const POINTS={
  modeAliment:[MSV,1],modeEau:[MSV,2],modeEclairage:[MSV,3],modeHumid:[MSV,4],modeVentil:[MSV,5],   // 1 Auto, 2 Manuel Marche, 3 Manuel Arrêt
  espece:[MSV,6],langue:[MSV,7],etatSante:[MSV,8],
  tCible:[AV,40],hrBasse:[AV,41],hrHaute:[AV,42],dureeLumiere:[AV,43],seuilVent1:[AV,44],seuilVent2:[AV,45],heureAllumage:[AV,46],modeSante:[BV,30],
  dateArrivee:[AV,50],ageArrivee:[AV,51],effectif:[AV,52],ageJours:[AV,53],
  tMoy:[AV,20],hrMoy:[AV,21],t1:[AV,22],h1:[AV,23],t2:[AV,24],h2:[AV,25],t3:[AV,26],h3:[AV,27],
  nh3:[AI,11],co2:[AI,12],ph:[AI,13],tds:[AI,14],batterie:[AI,10],
  eau1:[BV,1],eau2:[BV,2],eau3:[BV,3],alim1:[BV,4],alim2:[BV,5],alim3:[BV,6],
  eauJour:[AV,30],alimJour:[AV,31],eauHier:[AV,32],alimHier:[AV,33],tremieKg:[AV,34],
  moteur:[BV,10],vanne:[BV,11],lampes:[BV,12],humid:[BV,13],vent1:[BV,14],vent2:[BV,15],
  alarme:[BV,16],sirene:[BV,17],acquitter:[BV,39],
  alChaleur:[BV,40],alNh3:[BV,41],alSonde:[BV,42],alEauRemplit:[BV,43],alFuite:[BV,44],alVis:[BV,45],alTremie:[BV,46],alEauQualite:[BV,47],alBatterie:[BV,48]
};
/* niveau 3 = urgence (sirène, gyrophare, SMS, notification) · 2 = attention (gyrophare, notification) */
const ALARMES={
  alChaleur:[3,"Chaleur : plus de 35 °C dans le poulailler","Vérifier ventilateurs et brumisation, ouvrir le bâtiment"],
  alEauRemplit:[3,"L'eau ne remplit pas les abreuvoirs","Cuve vide, tuyau bouché ou électrovanne en panne"],
  alFuite:[3,"Fuite d'eau : le compteur tourne vanne fermée","Couper l'arrivée et chercher la fuite"],
  alVis:[3,"Aliment : moteur en marche mais rien ne sort","Trémie vide ou vis bloquée"],
  alBatterie:[3,"Batterie faible : moins de 24 V","Vérifier panneaux et régulateur, délestage en cours"],
  alNh3:[2,"Ammoniac au-dessus de 25 ppm","Changer la litière, aérer"],
  alSonde:[2,"Une sonde température-humidité est en défaut","Moyenne calculée avec les autres sondes ; vérifier le câble"],
  alTremie:[2,"Trémie presque vide (moins de 20 kg)","Remplir la trémie"],
  alEauQualite:[2,"Qualité de l'eau hors limites (pH ou sels)","Vérifier la cuve et les traitements"]
};
const CMDS={modeAliment:"moteur",modeEau:"vanne",modeEclairage:"lampes",modeHumid:"humid",modeVentil:"vent1"};

/* ================= consignes selon l'espèce, l'âge et la santé (repères de départ, à valider avec le guide de la souche) ================= */
/* espèce du lot : clé, nom affiché et code envoyé au dispositif (point espece) */
const ESPECES={pondeuse:[1,"pondeuses"],chair:[2,"poulets de chair"],local:[3,"poulets locaux et pintades"],porc:[4,"porcs"],petitsrum:[5,"moutons et chèvres"],
  chevrelait:[6,"chèvres laitières"],bovin:[7,"bovins"],vachelait:[8,"vaches laitières"],poisson:[9,"poissons"],autre:[10,"autres animaux"],couvee:[11,"couvée"],culture:[12,"culture"]};
const VOLAILLES=["pondeuse","chair","local"];
const genre=esp=>esp==="couvee"||esp==="culture"||esp==="poisson"?esp:VOLAILLES.includes(esp)?"volaille":"animal";
/* alertes qui ne concernent pas le lot choisi (pas d'aliment en serre, pas d'ammoniac dans une couveuse…) */
const HORS={culture:["alNh3","alVis","alTremie"],couvee:["alNh3","alVis","alTremie","alEauRemplit","alFuite","alEauQualite"],poisson:["alNh3"]};
const pertinente=k=>!(HORS[genre(infoLot().esp)]||[]).includes(k);
function especeDe(l){const e=(l&&l.espece)||"";
  return /poisson|tilapia|silure|clarias/i.test(e)?"poisson":/caille/i.test(e)?"local":/pondeuse/i.test(e)?"pondeuse":/chair/i.test(e)?"chair":/poulet|pintade|caille|dinde|canard/i.test(e)?"local":
    /vache/i.test(e)?"vachelait":/chèvre.*lait/i.test(e)?"chevrelait":/chèvre|mouton|brebis|agneau/i.test(e)?"petitsrum":/bovin|veau|taurillon/i.test(e)?"bovin":/porc|truie/i.test(e)?"porc":"autre"}
const num=x=>Number(String(x==null?"":x).replace(",","."));
const plage=x=>{const m=String(x||"").match(/(\d+)\D+(\d+)/);return m?[+m[1],+m[2]]:[50,55]};
function consignes(ageJ,esp,sante,X){
  const s=Math.floor(ageJ/7)+1;let t,hb=50,hh=70,lum=12,v1,v2;
  if(esp==="couvee"){ /* couveuse : paramètres de l'espèce du couvoir ; après l'arrêt du retournement, humidité d'éclosion */
    const p=X||{t:"37,7",h1:"50–55 %",h2:"65–70 %",stop:18},fin=ageJ>=(p.stop||18);t=num(p.t)||37.7;if(fin)t=Math.round((t-0.2)*10)/10;
    [hb,hh]=plage(fin?p.h2:p.h1);return{tCible:t,hrBasse:hb,hrHaute:hh,dureeLumiere:0,seuilVent1:+(t+0.5).toFixed(1),seuilVent2:+(t+1.5).toFixed(1),modeSante:0}}
  if(esp==="culture"){ /* serre ou parcelle : maraîchage plus humide, jeunes plants (moins de 3 semaines) protégés */
    const g=X||"autre",jeune=ageJ<21;t=g==="mara"?24:25;hb=jeune?70:g==="mara"?60:50;hh=jeune?90:g==="mara"?80:85;
    return{tCible:t,hrBasse:hb,hrHaute:hh,dureeLumiere:12,seuilVent1:g==="mara"?28:30,seuilVent2:g==="mara"?32:34,modeSante:0}}
  if(esp==="pondeuse"){
    if(ageJ<=3){t=33;hb=60;hh=70;lum=22.5}else if(s===1){t=31.5;hb=60;hh=70;lum=20}else if(s===2){t=29.5;hb=55;hh=65;lum=16}
    else if(s===3){t=27.5;hb=50;hh=65;lum=14}else if(s===4){t=25.5;hb=50;hh=70;lum=12}else{t=23;hb=50;hh=70;lum=s<=16?11:Math.min(16,11+0.5*(s-16))}
  }else if(esp==="chair"){ /* poulets de chair : environ 32 °C au premier jour, puis baisse régulière vers 21 °C */
    t=Math.max(21,Math.round((32-ageJ*0.3)*2)/2);hb=ageJ<=7?60:50;lum=ageJ<=7?23:18}
  else if(esp==="local"&&X&&X.caille){ /* cailles : 37 à 38 °C au premier jour, puis −3 °C par semaine ; 16 h de lumière pour la ponte */
    t=Math.max(21,Math.round((38-ageJ*0.45)*2)/2);hb=ageJ<=7?60:50;lum=ageJ<=7?23:ageJ<=28?16:X.ponte?16:12}
  else if(esp==="local"){ /* poulets locaux, pintades : démarrage plus chaud et croissance plus lente */
    t=Math.max(21,Math.round((33-ageJ*0.25)*2)/2);hb=ageJ<=7?60:50;lum=ageJ<=7?23:ageJ<=28?16:12}
  else if(esp==="porc"){ /* porcelets au chaud, porcs à l'engrais au frais : sensibles à la chaleur */
    t=ageJ<=7?30:ageJ<=28?28:ageJ<=56?25:ageJ<=84?22:20;hb=50;hh=70;lum=ageJ<=56?16:12;v1=t+3;v2=t+6}
  else if(esp==="petitsrum"||esp==="chevrelait"){ /* agneaux et chevreaux protégés du froid, adultes ventilés dès 25 °C */
    t=ageJ<=14?22:ageJ<=60?18:16;hh=75;lum=esp==="chevrelait"&&ageJ>60?16:12;v1=Math.max(t+3,25);v2=Math.max(t+7,29)}
  else if(esp==="bovin"||esp==="vachelait"){ /* veaux à l'abri, adultes : stress de chaleur dès 22 à 25 °C */
    t=ageJ<=56?18:15;hh=75;lum=esp==="vachelait"&&ageJ>56?16:12;v1=Math.max(t+3,22);v2=Math.max(t+7,26)}
  else if(esp==="poisson"){t=28;hb=0;hh=100;lum=12;v1=31;v2=33}   /* bassins : pas d'humidificateur */
  else{t=22;v1=26;v2=29}
  if(v1==null){v1=t+2;v2=t+5}
  if(sante){if(VOLAILLES.includes(esp)||(esp==="porc"&&ageJ<=56)){t+=1.5;v1=t+2;v2=t+7}else t+=1}
  return {tCible:t,hrBasse:hb,hrHaute:hh,dureeLumiere:lum,seuilVent1:v1,seuilVent2:v2,modeSante:sante?1:0}
}

/* ================= liaison avec le dispositif ================= */
function client(cfg){
  const base=`https://${cfg.ip}/api/rest/v1/protocols/bacnet/local/objects`;
  const headers={Authorization:"Basic "+btoa(`${cfg.user}:${cfg.password}`),"Content-Type":"application/json",Accept:"application/json"};
  const C=window.Capacitor,native=C&&C.Plugins&&C.Plugins.CapacitorHttp;
  async function post(path,body){
    if(native){const r=await native.request({url:base+path,method:"POST",headers,data:body,connectTimeout:8000,readTimeout:8000});
      if(r.status>=300)throw new Error("HTTP "+r.status);return typeof r.data==="string"?JSON.parse(r.data):r.data}
    const r=await fetch(base+path,{method:"POST",headers,body:JSON.stringify(body)});if(!r.ok)throw new Error("HTTP "+r.status);return r.json()}
  const ref=k=>({type:POINTS[k][0],instance:POINTS[k][1],property:"presentValue",arrayIndex:-1});
  return{
    async readAll(){const keys=Object.keys(POINTS);const res=await post("/read-property-multiple",{encode:"text",propertyReferences:keys.map(ref)});
      const refs=res.propertyReferences||[],out={};keys.forEach((k,i)=>{const v=refs[i]&&(refs[i].value??refs[i].message),n=Number(v);out[k]=v==null?null:isNaN(n)?(v==="active"?1:v==="inactive"?0:v):n});return out},
    async write(vals){const list=Object.entries(vals).filter(([k])=>POINTS[k]).map(([k,v])=>Object.assign(ref(k),{value:String(v)}));
      if(list.length)return post("/write-property-multiple",{encode:"text",propertyReferences:list})}
  }
}

/* ================= simulateur (mode démo) : se comporte comme le programme du dispositif ================= */
function simulator(){
  const h0=new Date().getHours()+new Date().getMinutes()/60;
  const s={modeAliment:1,modeEau:1,modeEclairage:1,modeHumid:1,modeVentil:1,tCible:23,hrBasse:50,hrHaute:70,dureeLumiere:11,seuilVent1:25,seuilVent2:28,heureAllumage:4.5,modeSante:0,
    tMoy:0,hrMoy:0,t1:0,h1:0,t2:0,h2:0,t3:0,h3:0,nh3:14,co2:1600,ph:7.2,tds:480,batterie:26.4,eau1:1,eau2:1,eau3:1,alim1:1,alim2:1,alim3:1,
    eauJour:Math.round(h0/24*104),alimJour:Math.round(Math.min(1,Math.max(0,(h0-6)/12))*49),eauHier:104,alimHier:49.2,tremieKg:126,
    moteur:0,vanne:0,lampes:0,humid:0,vent1:0,vent2:0,alarme:0,sirene:0};
  Object.keys(ALARMES).forEach(a=>s[a]=0);
  let eauLvl=.8,alimLvl=.7,k=0,panne="",tVanne=0,tMoteur=0,tSirene=0;const acq=new Set();
  function step(){
    k++;const h=new Date().getHours()+new Date().getMinutes()/60,jour=h>=6.25&&h<=18.25;
    const ext=27+4*Math.sin(k/40)+(jour?3:0)-s.vent1*1.5-s.vent2*1.5-s.humid*1.2+(panne==="chaleur"?15:0);
    s.t1=+(ext+0.2*Math.sin(k/7)).toFixed(1);s.t2=+(ext+0.6).toFixed(1);s.t3=+(ext-0.4).toFixed(1);
    const hrb=38+4*Math.sin(k/33)+s.humid*16-s.vent2*3;s.h1=Math.round(hrb);s.h2=Math.round(hrb+2);s.h3=Math.round(hrb-1);
    if(panne==="sonde"){s.t2=-40;s.h2=0}
    const ok=[[s.t1,s.h1],[s.t2,s.h2],[s.t3,s.h3]].filter(([t,x])=>t>-10&&t<60&&x>0&&x<=100);
    s.tMoy=+(ok.reduce((a,x)=>a+x[0],0)/ok.length).toFixed(1);s.hrMoy=Math.round(ok.reduce((a,x)=>a+x[1],0)/ok.length);
    s.batterie=+(panne==="batterie"?23.2:26.2+(jour?0.6:-0.2)).toFixed(1);
    s.nh3=+Math.max(4,15+5*Math.sin(k/50)-s.vent1*3-s.vent2*3+(s.modeSante?4:0)).toFixed(1);s.co2=Math.round(1500+500*Math.sin(k/45)-s.vent1*300);
    s.ph=+(7.2+0.1*Math.sin(k/60)).toFixed(1);s.tds=Math.round(480+20*Math.sin(k/70));
    const dans=((h-s.heureAllumage+24)%24)<s.dureeLumiere;s.lampes=s.modeEclairage===2?1:s.modeEclairage===3?0:(dans&&!jour?1:0);const clair=jour||s.lampes;
    eauLvl=Math.max(0,eauLvl-0.012);const manque=!(s.eau1&&s.eau2&&s.eau3);
    if(s.modeEau===2)s.vanne=eauLvl<1?1:0;else if(s.modeEau===3)s.vanne=0;else if(!s.vanne&&manque)s.vanne=1;else if(s.vanne&&eauLvl>0.95)s.vanne=0;
    if(s.vanne&&panne!=="eau"){eauLvl=Math.min(1,eauLvl+0.06);s.eauJour=+(s.eauJour+0.9).toFixed(1)}tVanne=s.vanne?tVanne+1:0;
    if(panne==="fuite"&&!s.vanne)s.eauJour=+(s.eauJour+0.5).toFixed(1);
    s.eau1=+(eauLvl>0.1);s.eau2=+(eauLvl>0.3);s.eau3=+(eauLvl>0.5);
    alimLvl=Math.max(0,alimLvl-(clair?0.01:0.002));const vides=3-(s.alim1+s.alim2+s.alim3);
    if(s.modeAliment===2)s.moteur=(alimLvl<1&&s.tremieKg>0)?1:0;else if(s.modeAliment===3)s.moteur=0;
    else if(!s.moteur&&vides>=2&&clair&&s.tremieKg>0)s.moteur=1;else if(s.moteur&&(alimLvl>0.95||!clair))s.moteur=0;
    if(panne==="vis")s.moteur=1;
    if(s.moteur&&panne!=="vis"){alimLvl=Math.min(1,alimLvl+0.05);s.alimJour=+(s.alimJour+0.35).toFixed(1);s.tremieKg=+Math.max(0,s.tremieKg-0.35).toFixed(1)}tMoteur=s.moteur?tMoteur+1:0;
    s.alim1=+(alimLvl>0.15);s.alim2=+(alimLvl>0.35);s.alim3=+(alimLvl>0.55);
    const froid=s.tMoy>33&&s.hrMoy<70&&(k%10===0),hum=s.hrMoy<s.hrBasse||(s.humid&&s.hrMoy<s.hrBasse+10)||froid;
    s.humid=s.modeHumid===2?1:s.modeHumid===3?0:(hum&&s.hrMoy<75?1:0);
    const v1=s.tMoy>s.seuilVent1||s.nh3>20||s.co2>3000,v2=s.tMoy>s.seuilVent2||s.nh3>25;
    if(s.tMoy>35){s.vent1=1;s.vent2=1}else if(s.modeVentil===2){s.vent1=1;s.vent2=+v2}else if(s.modeVentil===3){s.vent1=0;s.vent2=0}else{s.vent1=+v1;s.vent2=+v2}
    s.alChaleur=+(s.tMoy>35);s.alNh3=+(s.nh3>25);s.alSonde=+(ok.length<3);s.alEauRemplit=+(tVanne>20);s.alFuite=+(panne==="fuite");
    s.alVis=+(tMoteur>8&&panne==="vis");s.alTremie=+(s.tremieKg<20);s.alEauQualite=+(s.ph<6||s.ph>8||s.tds>1000);s.alBatterie=+(s.batterie<24);
    const act=Object.keys(ALARMES).filter(a=>s[a]);[...acq].forEach(a=>{if(!s[a])acq.delete(a)});
    s.alarme=+act.length;const urg=act.filter(a=>ALARMES[a][0]===3&&!acq.has(a));tSirene=urg.length?tSirene+1:0;s.sirene=+(urg.length>0&&tSirene<=180);
  }
  step();const timer=setInterval(step,1000);
  return{timer,
    readAll:async()=>({...s}),
    write:async vals=>{vals=Object.assign({},vals);
      if("panne" in vals){panne=vals.panne;if(panne==="eau")eauLvl=0.25;acq.clear();delete vals.panne}
      if("acquitter" in vals){Object.keys(ALARMES).forEach(a=>{if(s[a])acq.add(a)});s.sirene=0;delete vals.acquitter}
      Object.entries(vals).forEach(([k,v])=>{if(k in s)s[k]=Number(v)});
      if("modeSante" in vals){s.eauHier=Number(vals.modeSante)?86:104;s.alimHier=Number(vals.modeSante)?44.1:49.2}step()}}
}

/* ================= outils ================= */
const $=id=>document.getElementById(id);
const tr=s=>window.__tr?window.__tr(s):s;
const LOC={fr:"fr-FR",en:"en-GB",it:"it-IT",es:"es-ES"};
const loc=()=>LOC[window.B2A_LANG?window.B2A_LANG():"fr"]||"fr-FR";
const fmt=(v,d=1)=>v==null||isNaN(v)?"—":Number(v).toLocaleString("fr-FR",{minimumFractionDigits:d,maximumFractionDigits:d});
const hhmm=h=>{const m=Math.round(((h%24)+24)%24*60);return String(Math.floor(m/60)%24).padStart(2,"0")+" h "+String(m%60).padStart(2,"0")};
const hrs=h=>fmt(h,h%1?1:0)+" h";
const heure=d=>String(d.getHours()).padStart(2,"0")+" h "+String(d.getMinutes()).padStart(2,"0");
const LS="b2a-poulailler";
let cfg={};try{cfg=JSON.parse(localStorage.getItem(LS)||"{}")}catch(e){}
const saveCfg=()=>{try{localStorage.setItem(LS,JSON.stringify(cfg))}catch(e){}};

/* ================= écran ================= */
const seg2=k=>`<div class="seg3 pc-seg2" id="pc-seg-${k}" role="group"><button type="button" data-p="auto">Auto</button><button type="button" data-p="man">Manuel</button></div>
  <div class="pc-man" id="pc-man-${k}"><button type="button" class="on" data-v="2">Marche</button><button type="button" class="off" data-v="3">Arrêt</button></div>`;
const kpi=(id,label,unit,sub)=>`<div class="tile pc-k" id="pc-kp-${id}"><span>${label}</span><b><i id="pc-k-${id}">—</i>${unit?` <small>${unit}</small>`:""}</b>${sub!=null?`<small id="pc-ks-${id}">${sub}</small>`:""}</div>`;
const points=(p,water)=>`<div class="pc-pts">${["Début","Milieu","Fin de ligne"].map((n,i)=>`<div class="pc-pt${water?" w":""}" id="pc-${p}${i+1}"><i></i><span>${n}</span></div>`).join("")}</div>`;
V.innerHTML=`<style>
#v-poulailler .pc-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
#v-poulailler .pc-st{font:700 13px var(--body);border-radius:999px;padding:4px 10px;white-space:nowrap;background:var(--bg);color:var(--muted)}
#v-poulailler .pc-st.on{background:var(--ok-bg);color:var(--ok)} #v-poulailler .pc-st.warn{background:var(--warn-bg);color:var(--warn)} #v-poulailler .pc-st.bad{background:var(--bad-bg);color:var(--bad)}
#v-poulailler .pc-k b{font-size:21px} #v-poulailler .pc-k b i{font-style:normal} #v-poulailler .pc-k small{color:var(--muted)}
#v-poulailler .pc-k.ok{border-color:var(--ok)} #v-poulailler .pc-k.ok b i{color:var(--ok)}
#v-poulailler .pc-k.warn{border-color:var(--warn)} #v-poulailler .pc-k.warn b i{color:var(--warn)}
#v-poulailler .pc-k.bad{border-color:var(--bad)} #v-poulailler .pc-k.bad b i{color:var(--bad)}
#v-poulailler .tiles.pc-3{grid-template-columns:repeat(3,minmax(0,1fr))}
#v-poulailler .pc-seg2{grid-template-columns:1fr 1fr}
#v-poulailler .pc-seg2 button.sel,#v-poulailler .pc-sante button.sel{background:var(--surface);color:var(--heading);box-shadow:inset 0 -3px 0 var(--brand-green),0 1px 2px rgb(0 0 0/.1)}
#v-poulailler .pc-man{display:none;grid-template-columns:1fr 1fr;gap:8px} #v-poulailler .pc-man.show{display:grid}
#v-poulailler .pc-man button{border:1px solid var(--line);background:var(--surface);color:var(--ink);font:700 15px var(--body);padding:10px 0;border-radius:10px;cursor:pointer}
#v-poulailler .pc-man button.on.sel{background:var(--ok);color:var(--surface);border-color:var(--ok)} #v-poulailler .pc-man button.off.sel{background:var(--bad-bg);color:var(--bad);border-color:var(--bad)}
#v-poulailler .pc-pts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
#v-poulailler .pc-pt{border:1px solid var(--line);border-radius:12px;padding:8px;text-align:center;font-size:13px;color:var(--muted)}
#v-poulailler .pc-pt i{display:block;width:14px;height:14px;border-radius:50%;margin:0 auto 4px;background:var(--bad)}
#v-poulailler .pc-pt.full i{background:var(--ok)} #v-poulailler .pc-pt.w.full i{background:#4a9be8}
#v-poulailler .pc-al{border-radius:12px;padding:10px 12px;display:grid;gap:2px;border:1px solid}
#v-poulailler .pc-al.n3{background:var(--bad-bg);border-color:var(--bad)} #v-poulailler .pc-al.n3 b{color:var(--bad)}
#v-poulailler .pc-al.n2{background:var(--warn-bg);border-color:var(--warn)} #v-poulailler .pc-al.n2 b{color:var(--warn)}
#v-poulailler .pc-al small{color:var(--muted)}
#v-poulailler .card.pc-alerting{border-color:var(--bad);box-shadow:0 0 0 2px var(--bad-bg)}
#v-poulailler .pc-row{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
#v-poulailler .pc-2b{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#v-poulailler .pc-step{display:flex;align-items:center;gap:6px}
#v-poulailler .pc-step button{width:40px;height:40px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:700 20px var(--body);cursor:pointer}
#v-poulailler .pc-step output{min-width:84px;text-align:center;font-weight:700}
#v-poulailler .pc-legend{display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:var(--muted)}
#v-poulailler .pc-legend i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px;vertical-align:-1px}
#v-poulailler .pc-note.warn{color:var(--warn)} #v-poulailler .pc-note.bad{color:var(--bad)} #v-poulailler .pc-note.ok{color:var(--ok)}
#v-poulailler .pc-sim{display:flex;flex-wrap:wrap;gap:8px}
#pc-toast{position:fixed;left:50%;top:12px;transform:translateX(-50%);width:min(92%,440px);background:var(--bad-bg);color:var(--bad);border:1px solid var(--bad);border-radius:12px;padding:10px 14px;font-weight:700;z-index:90;display:none;pointer-events:none}
</style>
<section class="card">
  <div class="pc-head"><div><h2 class="sec">Poulailler connecté</h2><p class="note">Dispositif de contrôle B2A Smart Building</p></div><span class="pc-st" id="pc-status">Démo</span></div>
  <p class="note" id="pc-demo-note">Mode démo : simulation, aucun dispositif branché. Configurez la connexion en bas de l'écran.</p>
  <button class="btn" type="button" id="pc-3d">Vue 3D du poulailler</button>
  <p class="note">Voir et commander les équipements dans le bâtiment en 3D : lumières, ventilateurs, moteur, eau, valeurs en couleur.</p>
</section>
<section class="card" id="pc-card-al">
  <div class="pc-head"><h2 class="sec">Alertes</h2><span class="pc-st on" id="pc-s-al">Aucune</span></div>
  <div class="pc-alist" id="pc-al-list" style="display:grid;gap:8px"></div>
  <div class="pc-row"><span class="note">Sur place</span><span class="pc-st" id="pc-s-siren">Sirène coupée</span></div>
  <div class="pc-2b"><button class="btn" type="button" id="pc-acq">Acquitter</button><button class="btn ghost" type="button" id="pc-son">Activer le son</button></div>
  <p class="note">Urgence : sirène, gyrophare, SMS et notification. Attention : gyrophare et notification. La sirène se coupe avec « Acquitter » (ici ou bouton sur le coffret) ; l'alerte reste affichée tant que le problème n'est pas réglé.</p>
  <details class="box" id="pc-simbox"><summary>Simuler une panne (démo)</summary>
    <div class="pc-sim"><button class="chip" type="button" data-panne="chaleur">Chaleur</button><button class="chip" type="button" data-panne="sonde">Sonde en défaut</button><button class="chip" type="button" data-panne="eau">Eau ne remplit pas</button><button class="chip" type="button" data-panne="fuite">Fuite d'eau</button><button class="chip" type="button" data-panne="vis">Vis bloquée</button><button class="chip" type="button" data-panne="batterie">Batterie faible</button><button class="chip" type="button" data-panne="">Tout réparer</button></div>
  </details>
</section>
<section class="card">
  <div class="pc-head"><h2 class="sec">Pilotage</h2><span class="pc-st on" id="pc-s-pilot">Automatique</span></div>
  <div class="seg3 pc-seg2" id="pc-seg-global" role="group"><button type="button" data-p="auto">Tout en Auto</button><button type="button" data-p="man">Tout en Manuel</button></div>
  <p class="note" id="pc-n-pilot"></p>
  <div class="pc-legend"><span><i style="background:var(--ok)"></i>bon</span><span><i style="background:var(--warn)"></i>à surveiller</span><span><i style="background:var(--bad)"></i>hors limite</span></div>
</section>
<section class="card">
  <div class="pc-head"><h2 class="sec">Lot et consignes automatiques</h2><span class="pc-st on" id="pc-s-sante">Sain</span></div>
  <div class="field"><label for="pc-lot">Lot</label><select id="pc-lot"></select></div>
  <p class="note" id="pc-lotinfo"></p>
  <div class="seg3 pc-seg2 pc-sante" id="pc-seg-sante" role="group"><button type="button" data-v="0">Lot sain</button><button type="button" data-v="1">Lot malade</button></div>
  <div class="tiles">${kpi("ct","Température cible","°C")}${kpi("ch","Humidité","%")}${kpi("cl","Lumière par jour","h")}${kpi("cv","Ventilation étages 1 / 2","°C")}</div>
  <p class="note" id="pc-c-note"></p>
</section>
<section class="card">
  <div class="pc-head"><h2 class="sec">Ambiance</h2><span class="note" id="pc-updated">—</span></div>
  <div class="tiles">${kpi("t","Température moyenne","°C","")}${kpi("h","Humidité moyenne","%","")}${kpi("nh3","Ammoniac","ppm","limite 20 ppm")}${kpi("co2","CO₂","ppm","limite 3000 ppm")}</div>
</section>
<section class="card">
  <div class="pc-head"><h2 class="sec">Distribution d'aliment</h2><span class="pc-st" id="pc-s-moteur">Moteur arrêté</span></div>
  ${points("a",false)}${seg2("modeAliment")}
  <div class="tiles pc-3">${kpi("aj","Aujourd'hui","kg")}${kpi("ah","Hier","kg")}${kpi("tr","Trémie","kg")}</div>
  <p class="note" id="pc-n-alim"></p>
</section>
<section class="card">
  <div class="pc-head"><h2 class="sec">Distribution d'eau</h2><span class="pc-st" id="pc-s-vanne">Vanne fermée</span></div>
  ${points("e",true)}${seg2("modeEau")}
  <div class="tiles">${kpi("ej","Aujourd'hui","L")}${kpi("eh","Hier","L")}${kpi("ph","pH de l'eau","","normal 6 à 8")}${kpi("tds","Sels dissous","ppm","limite 1000 ppm")}</div>
  <p class="note" id="pc-n-eau"></p>
</section>
<section class="card">
  <div class="pc-head"><h2 class="sec">Éclairage</h2><span class="pc-st" id="pc-s-lampes">Éteint</span></div>
  ${seg2("modeEclairage")}
  <div class="pc-row"><span>Allumage le matin</span><div class="pc-step"><button type="button" data-d="-0.5" aria-label="−">−</button><output id="pc-o-heure">—</output><button type="button" data-d="0.5" aria-label="+">+</button></div></div>
  <p class="note" id="pc-n-ecl"></p>
</section>
<section class="card">
  <div class="pc-head"><h2 class="sec">Humidificateur</h2><span class="pc-st" id="pc-s-humid">Arrêté</span></div>
  ${seg2("modeHumid")}<p class="note" id="pc-n-humid"></p>
</section>
<section class="card">
  <div class="pc-head"><h2 class="sec">Ventilation</h2><span class="pc-st" id="pc-s-vent">Arrêtée</span></div>
  ${seg2("modeVentil")}<p class="note" id="pc-n-vent"></p>
</section>
<section class="card">
  <div class="pc-head"><h2 class="sec">Analyse santé</h2><span class="note">journée d'hier</span></div>
  <div class="tiles pc-3">${kpi("ap","Aliment","g/poule","")}${kpi("ep","Eau","ml/poule","")}${kpi("ra","Eau / aliment","","repère ≈ 2")}</div>
  <div id="pc-alerts" style="display:grid;gap:6px"></div>
</section>
<details class="card" id="pc-cfg"><summary><b>Connexion au dispositif</b></summary>
  <label class="pc-row" style="justify-content:flex-start"><input type="checkbox" id="pc-c-demo"> Mode démo (simulation, sans dispositif)</label>
  <div class="field"><label for="pc-c-ip">Adresse IP du dispositif</label><input type="text" id="pc-c-ip" placeholder="ex. 192.168.1.50" autocomplete="off" inputmode="decimal"></div>
  <div class="field"><label for="pc-c-user">Utilisateur</label><input type="text" id="pc-c-user" autocomplete="off"></div>
  <div class="field"><label for="pc-c-pw">Mot de passe</label><input type="password" id="pc-c-pw" autocomplete="off"></div>
  <button class="btn" type="button" id="pc-c-save">Enregistrer et se connecter</button>
  <p class="note">Ces informations restent seulement sur ce téléphone. À distance, activez d'abord le VPN du routeur B2A. Le dispositif n'est jamais ouvert directement sur internet.</p>
  <p class="note">Première connexion : installez le certificat du dispositif sur le téléphone (Réglages, Sécurité, Installer un certificat). Sur ordinateur ou iPhone, ouvrez d'abord l'adresse du dispositif dans le navigateur et acceptez son certificat.</p>
</details>`;
const toastEl=document.createElement("div");toastEl.id="pc-toast";toastEl.setAttribute("data-notr","");toastEl.setAttribute("role","alert");document.body.append(toastEl);

/* ================= état ================= */
let api=null,data={},busy=false,demo=true,horsLigne=null,envoye=null,timer=null,santeForcee=null;
const vues={};let sonActif=false,audio=null;

function couveesEnCours(){let b=[];try{b=(window.B2A_COUV&&window.B2A_COUV.batches()||[]).filter(x=>(x.statut||"encours")==="encours")}catch(e){}
  return b.map(x=>({id:"couv:"+x.id,nom:`Couvée : ${fmt(x.oeufs,0)} œufs`,__couv:x}))}
function lotsPoules(){return (A.lots()||[]).concat(couveesEnCours())}
function lotChoisi(){const L=lotsPoules();return L.find(l=>l.id===cfg.lotId)||L.find(l=>A.isLayer(l))||L[0]||null}
const jours=d=>{if(!d)return 0;const n=Math.floor((new Date(A.today()+"T12:00")-new Date(d+"T12:00"))/864e5);return n>0?n:0};
function infoLot(){
  const l=lotChoisi();if(!l)return{l:null,ageJ:109,esp:"pondeuse",ponte:true,alive:430,sante:0};
  if(l.__couv){const b=l.__couv;let p=null;try{p=(window.B2A_COUV.sp&&window.B2A_COUV.sp()||{})[b.espece]||null}catch(e){}
    return{l,ageJ:jours(b.debut),esp:"couvee",X:p||{t:"37,7",h1:"50–55 %",h2:"65–70 %",stop:18,d:21},ponte:false,alive:Number(b.oeufs)||0,sante:0}}
  if(A.isCrop&&A.isCrop(l)){let g="autre";try{const C=window.B2A_CULT&&window.B2A_CULT.crops;g=(C&&(C[l.culture]||C.autre)||{}).g||"autre"}catch(e){}
    return{l,ageJ:jours(l.dateSemis||l.datePlantation),esp:"culture",X:g,ponte:false,alive:0,sante:0}}
  let ageJ=Math.round((Number(l.ageArrivee)||0)*7);
  if(l.arrivee){const d=Math.floor((new Date(A.today()+"T12:00")-new Date(l.arrivee+"T12:00"))/864e5);if(d>0)ageJ+=d}
  let s=null;try{s=A.stats(l)}catch(e){}
  let malade=0;try{malade=+(!!s&&(s.morts7pct>1||(A.allAlerts(l,s)||[]).some(a=>a[0]==="bad")))}catch(e){}
  const esp=especeDe(l);const cai=/caille/i.test(l.espece||""),caiP=cai&&/pondeuse/i.test(l.espece||"");
  return{l,ageJ,esp,X:cai?{caille:true,ponte:caiP}:undefined,ponte:esp==="pondeuse"||caiP,alive:s?s.alive:Number(l.effectif)||0,sante:santeForcee!=null?santeForcee:malade}
}
function setStatus(cls,t){const e=$("pc-status");e.className="pc-st "+cls;e.textContent=t}
function connect(){
  if(api&&api.timer)clearInterval(api.timer);
  demo=cfg.demo!==false||!cfg.ip;api=demo?simulator():client(cfg);
  setStatus(demo?"warn":"on",demo?"Démo":cfg.ip);$("pc-demo-note").hidden=!demo;$("pc-simbox").hidden=!demo;
  $("pc-c-demo").checked=demo;$("pc-c-ip").value=cfg.ip||"";$("pc-c-user").value=cfg.user||"";$("pc-c-pw").value=cfg.password||"";
  envoyerConsignes()}
let tick=0,lotsSig="";
async function refresh(){
  if(!api)return;if(V.hidden&&(demo||(tick++%10)))return;   // écran fermé : la démo s'arrête, le vrai dispositif est surveillé toutes les 30 s pour les alertes
  {const sig=lotsPoules().map(l=>l.id).join();if(sig!==lotsSig){const premier=lotsSig==="";lotsSig=sig;if(!premier&&!busy){envoyerConsignes();return}}}
  try{data=await api.readAll();horsLigne=null;render();
    try{const I=infoLot();window.B2A_PC_HIER=!demo&&I.l&&!I.l.__couv&&I.esp!=="culture"&&data.alimHier>0?{lotId:I.l.id,date:new Date(new Date(A.today()+"T12:00")-864e5).toISOString().slice(0,10),alimKg:Math.round(data.alimHier*10)/10}:null}catch(e){}try{const I=infoLot();window.B2A_PC_LIVE={t:Date.now(),demo,data:Object.assign({},data),lotId:I.l&&!I.l.__couv?I.l.id:null,lotNom:(I.l&&I.l.nom)||""};window.dispatchEvent(new Event("b2a-pc-data"))}catch(e){}   /* relevés pour l'onglet Contrôle (version Pro) */
    if($("pc-status").classList.contains("bad"))setStatus(demo?"warn":"on",demo?"Démo":cfg.ip)}
  catch(e){setStatus("bad","Hors ligne");$("pc-updated").textContent="Dispositif injoignable (VPN actif ?)";if(!horsLigne)horsLigne=Date.now();renderAlertes()}}
async function send(vals){busy=true;try{await api.write(vals);await refresh()}catch(e){setStatus("bad","Commande non envoyée")}finally{busy=false}}

/* consignes de l'âge et de la santé, envoyées au dispositif avec les données du lot */
async function envoyerConsignes(){
  const I=infoLot(),c=consignes(I.ageJ,I.esp,I.sante,I.X);
  const vals=Object.assign({},c,{ageJours:I.ageJ,effectif:I.alive});
  busy=true;try{await api.write(vals);envoye=new Date()}catch(e){envoye=null}
  try{await api.write({espece:ESPECES[I.esp][0]})}catch(e){}   /* envoyé à part : un ancien programme du dispositif qui ne connaît que 1 et 2 ne bloque pas les consignes */
  finally{busy=false}
  renderLot(I,c);refresh()}
/* n'affiche que ce qui concerne le lot choisi */
function adapter(I){
  const g=genre(I.esp),sec=id=>$(id)&&$(id).closest("section");
  const cache={alim:g==="culture"||g==="couvee",eau:g==="couvee",ecl:g==="couvee",hum:g==="poisson",san:g==="culture"||g==="couvee",nh3:g!=="volaille"&&g!=="animal"};
  sec("pc-s-moteur").hidden=cache.alim;sec("pc-s-vanne").hidden=cache.eau;sec("pc-s-lampes").hidden=cache.ecl;sec("pc-s-humid").hidden=cache.hum;sec("pc-alerts").hidden=cache.san;
  $("pc-kp-nh3").hidden=cache.nh3;
  const h=V.querySelector("h2.sec");if(h)h.textContent={volaille:"Poulailler connecté",animal:"Élevage connecté",poisson:"Bassin connecté",culture:"Serre connectée",couvee:"Couveuse connectée"}[g];
  $("pc-3d").textContent=g==="volaille"?"Vue 3D du poulailler":"Vue 3D";
  const he=$("pc-s-vanne").closest(".pc-head").querySelector("h2");if(he)he.textContent=g==="culture"?"Arrosage":"Distribution d'eau"}
function renderLot(I,c){
  const sel=$("pc-lot"),L=lotsPoules();const cur=I.l?I.l.id:"";
  sel.innerHTML=L.length?L.map(l=>`<option value="${l.id}">${String(l.nom||l.espece||"Lot").replace(/[<>&"]/g,"")}</option>`).join(""):`<option value="">Pondeuses (démo)</option>`;sel.value=cur;
  const sem=Math.floor(I.ageJ/7);
  $("pc-lotinfo").textContent=I.esp==="couvee"?`Jour ${I.ageJ} sur ${I.X.d||21} · ${fmt(I.alive,0)} œufs · couvée`:I.esp==="culture"?`Jour ${I.ageJ} depuis le semis · culture`:
    (I.ageJ<14?`Âge : ${I.ageJ} jours`:`Âge : ${sem} semaines`)+` · ${fmt(I.alive,0)} animaux · `+ESPECES[I.esp][1];
  $("pc-seg-sante").hidden=I.esp==="couvee"||I.esp==="culture";adapter(I);
  $("pc-k-ct").textContent=fmt(c.tCible);$("pc-k-ch").textContent=c.hrBasse+" – "+c.hrHaute;$("pc-k-cl").textContent=fmt(c.dureeLumiere,c.dureeLumiere%1?1:0);
  $("pc-k-cv").textContent=fmt(c.seuilVent1,c.seuilVent1%1?1:0)+" / "+fmt(c.seuilVent2,c.seuilVent2%1?1:0);
  document.querySelectorAll("#pc-seg-sante button").forEach(b=>b.classList.toggle("sel",Number(b.dataset.v)===I.sante));
  const st=$("pc-s-sante");st.className="pc-st "+(I.sante?"warn":"on");st.textContent=I.sante?"Mode santé":"Sain";
  const n=$("pc-c-note");
  if(!envoye){n.className="note pc-note bad";n.textContent="Consignes non envoyées : dispositif injoignable. Il garde les dernières reçues.";return}
  n.className="note pc-note"+(I.sante?" warn":"");
  n.textContent=(I.esp==="couvee"?(I.ageJ>=(I.X.stop||18)?"Retournement arrêté : humidité d'éclosion, ne plus ouvrir la couveuse. ":`Couvée : retournement des œufs jusqu'à J${I.X.stop||18}, puis humidité d'éclosion. `):
    I.esp==="culture"?"Culture : arrosage selon l'humidité, aération de la serre au-dessus des seuils. ":I.sante?"Mode santé : température plus haute, ventilation forte seulement en grosse chaleur, lumière inchangée en ponte. ":"")+`Envoyées au dispositif à ${heure(envoye)}.`}

/* ================= alertes ================= */
function bip(){if(!sonActif||!audio)return;
  try{[0,0.35].forEach(t=>{const o=audio.createOscillator(),g=audio.createGain();o.type="square";o.frequency.value=t?660:880;
    g.gain.setValueAtTime(0.15,audio.currentTime+t);g.gain.exponentialRampToValueAtTime(0.001,audio.currentTime+t+0.3);o.connect(g);g.connect(audio.destination);o.start(audio.currentTime+t);o.stop(audio.currentTime+t+0.3)})}catch(e){}}
function toast(t){if(document.getElementById("p3"))return;   /* vue 3D ouverte : elle affiche déjà ses alertes, le bandeau cacherait « Fermer » */
  toastEl.textContent=t;toastEl.style.display="block";clearTimeout(toast.h);toast.h=setTimeout(()=>toastEl.style.display="none",6000)}
async function notifier(titre,texte){
  const C=window.Capacitor;const LN=C&&C.isNativePlatform&&C.isNativePlatform()&&C.Plugins&&C.Plugins.LocalNotifications;if(!LN)return;
  try{const p=await LN.checkPermissions();if(p.display!=="granted")await LN.requestPermissions();
    await LN.schedule({notifications:[{id:Date.now()%2147483647,title:titre,body:texte}]})}catch(e){}}
function renderAlertes(){
  const list=[];Object.entries(ALARMES).forEach(([k,a])=>{if(data[k]&&pertinente(k))list.push({k,n:a[0],t:a[1],x:a[2]})});
  if(horsLigne&&Date.now()-horsLigne>(demo?15e3:3e5))list.push({k:"horsLigne",n:3,t:"Dispositif injoignable",x:"Vérifier le routeur 4G, le VPN et l'alimentation à la ferme"});
  list.sort((a,b)=>b.n-a.n);const now=new Date();
  list.forEach(a=>{if(!vues[a.k]){vues[a.k]=now;toast("⚠ "+tr(a.t));notifier(tr(a.n===3?"Urgence au poulailler":"Attention au poulailler"),tr(a.t)+". "+tr(a.x));if(a.n===3)bip()}});
  Object.keys(vues).forEach(k=>{if(!list.some(a=>a.k===k))delete vues[k]});
  const L=$("pc-al-list");L.innerHTML="";
  if(!list.length){const p=document.createElement("p");p.className="note pc-note ok";p.textContent="Tout fonctionne normalement.";L.append(p)}
  list.forEach(a=>{const d=document.createElement("div");d.className="pc-al n"+a.n;const b=document.createElement("b");b.textContent=(a.n===3?"Urgence : ":"Attention : ")+a.t;
    const s=document.createElement("small");s.textContent=a.x+` · depuis ${heure(vues[a.k])}`;d.append(b,s);L.append(d)});
  const n3=list.filter(a=>a.n===3).length,sa=$("pc-s-al");sa.className="pc-st "+(n3?"bad":list.length?"warn":"on");
  sa.textContent=list.length?(list.length>1?`${list.length} alertes`:"1 alerte"):"Aucune";
  $("pc-card-al").classList.toggle("pc-alerting",n3>0);
  const si=$("pc-s-siren");
  if(data.sirene){si.className="pc-st bad";si.textContent="Sirène et gyrophare en marche"}
  else if(data.alarme){si.className="pc-st warn";si.textContent="Gyrophare allumé"}
  else{si.className="pc-st";si.textContent="Sirène coupée"}}

/* ================= affichage ================= */
function lvl(v,okLo,okHi,wLo,wHi){if(v==null||isNaN(v))return null;if(v>=okLo&&v<=okHi)return"ok";if(v>=wLo&&v<=wHi)return"warn";return"bad"}
function flag(id,c){const e=$("pc-kp-"+id);if(!e)return;e.classList.remove("ok","warn","bad");if(c)e.classList.add(c)}
function setK(id,v){const e=$("pc-k-"+id);if(e)e.textContent=v}
function setS(id,v){const e=$("pc-ks-"+id);if(e)e.textContent=v}
function state(id,on,a,b,warn){const e=$("pc-s-"+id);e.className="pc-st"+(on?(warn?" warn":" on"):"");e.textContent=on?a:b}
function pt(id,on){const e=$("pc-"+id);if(e)e.classList.toggle("full",!!on)}
function pilot(k){const m=data[k],man=m!==1;
  document.querySelectorAll("#pc-seg-"+k+" button").forEach(b=>b.classList.toggle("sel",(b.dataset.p==="man")===man));
  $("pc-man-"+k).classList.toggle("show",man);document.querySelectorAll("#pc-man-"+k+" button").forEach(b=>b.classList.toggle("sel",Number(b.dataset.v)===m))}
function manuel(m,sec){return(m===2?"Manuel : Marche forcée jusqu'au retour en Auto.":"Manuel : Arrêt forcé jusqu'au retour en Auto.")+(sec?" "+sec:"")}
function hist(key,v){ /* moyenne des 7 derniers jours connus, gardée sur ce téléphone */
  let H={};try{H=JSON.parse(localStorage.getItem(LS+"-h")||"{}")}catch(e){}
  const d=new Date(Date.now()-864e5).toISOString().slice(0,10);H[key]=H[key]||{};if(v!=null&&!demo)H[key][d]=v;
  const days=Object.keys(H[key]).sort().slice(-8);days.slice(0,-7).forEach(x=>delete H[key][x]);try{localStorage.setItem(LS+"-h",JSON.stringify(H))}catch(e){}
  const vals=Object.values(H[key]);return vals.length>=3?vals.reduce((a,b)=>a+b,0)/vals.length:null}
function render(){
  renderAlertes();const d=data,now=new Date(),h=now.getHours()+now.getMinutes()/60;
  $("pc-updated").textContent=`Mis à jour à ${heure(now)}`;
  const modes=Object.keys(CMDS).map(k=>d[k]),nA=modes.filter(m=>m===1).length,gl=nA===5?"auto":nA===0?"man":"mixte";
  document.querySelectorAll("#pc-seg-global button").forEach(b=>b.classList.toggle("sel",b.dataset.p===gl));
  const sp=$("pc-s-pilot");sp.className="pc-st "+(gl==="auto"?"on":"warn");sp.textContent=gl==="auto"?"Automatique":gl==="man"?"Manuel":"Mixte";
  $("pc-n-pilot").textContent=gl==="auto"?"Le dispositif décide seul avec les consignes du lot (âge et santé).":gl==="man"?"Tout est en manuel : vous commandez chaque équipement. Les sécurités restent actives (chaleur, ligne pleine, trémie vide).":(5-nA>1?`${5-nA} commandes en manuel, ${nA} en automatique.`:`1 commande en manuel, ${nA} en automatique.`);
  setK("t",fmt(d.tMoy));setS("t",`Sondes ${fmt(d.t1)} · ${fmt(d.t2)} · ${fmt(d.t3)}`);
  setK("h",fmt(d.hrMoy,0));setS("h",`Sondes ${fmt(d.h1,0)} · ${fmt(d.h2,0)} · ${fmt(d.h3,0)}`);
  setK("nh3",fmt(d.nh3));setK("co2",fmt(d.co2,0));
  flag("t",d.tMoy>35?"bad":lvl(d.tMoy,d.tCible-1.5,d.tCible+1.5,d.tCible-3,d.tCible+3));flag("h",lvl(d.hrMoy,d.hrBasse,d.hrHaute,d.hrBasse-10,d.hrHaute+5));
  flag("nh3",lvl(d.nh3,0,15,0,25));flag("co2",lvl(d.co2,0,2500,0,3000));
  const fE=Math.max(0.05,h/24),fA=Math.max(0.05,Math.min(1,(h-5)/13));
  const I=infoLot(),refA=hist("alim",d.alimHier)||(demo?49.5:d.alimHier),refE=hist("eau",d.eauHier)||(demo?105:d.eauHier);
  pt("a1",d.alim1);pt("a2",d.alim2);pt("a3",d.alim3);pilot("modeAliment");state("moteur",d.moteur,"Moteur en marche","Moteur arrêté");
  setK("aj",fmt(d.alimJour));setK("ah",fmt(d.alimHier));setK("tr",fmt(d.tremieKg,0));
  flag("aj",lvl(d.alimJour/(d.alimHier*fA),0.85,1.2,0.7,1.35));flag("ah",lvl(d.alimHier/refA,0.95,1.1,0.85,1.2));flag("tr",lvl(d.tremieKg,40,1e9,20,1e9));
  $("pc-n-alim").textContent=d.modeAliment===1?"Auto : distribution quand 2 points sur 3 sont vides, seulement quand il fait clair ; arrêt quand la fin de ligne est pleine.":manuel(d.modeAliment,d.modeAliment===2?"Sécurité : le moteur s'arrête quand la fin de ligne est pleine ou la trémie vide.":"");
  pt("e1",d.eau1);pt("e2",d.eau2);pt("e3",d.eau3);pilot("modeEau");state("vanne",d.vanne,"Vanne ouverte","Vanne fermée");
  setK("ej",fmt(d.eauJour,0));setK("eh",fmt(d.eauHier,0));setK("ph",fmt(d.ph));setK("tds",fmt(d.tds,0));
  flag("ej",lvl(d.eauJour/(d.eauHier*fE),0.85,1.25,0.7,1.5));flag("eh",lvl(d.eauHier/refE,0.95,1.15,0.85,1.3));flag("ph",lvl(d.ph,6.5,7.5,6,8));flag("tds",lvl(d.tds,0,1000,0,3000));
  $("pc-n-eau").textContent=d.modeEau===1?"Auto : la vanne s'ouvre dès qu'un point manque d'eau et se ferme quand la fin de ligne est pleine (10 min au maximum).":manuel(d.modeEau,d.modeEau===2?"Sécurité : la vanne se ferme quand la ligne est pleine.":"Attention : plus aucun remplissage automatique.");
  pilot("modeEclairage");state("lampes",d.lampes,"Allumé","Éteint");$("pc-o-heure").textContent=hhmm(d.heureAllumage);
  $("pc-n-ecl").textContent=d.modeEclairage===1?`Auto : ${hrs(d.dureeLumiere)} de lumière par jour selon l'âge, à partir de ${hhmm(d.heureAllumage)} ; lampes seulement quand il fait sombre.`:manuel(d.modeEclairage,d.modeEclairage===3?"En ponte, un arrêt prolongé fait baisser la production.":"");
  pilot("modeHumid");state("humid",d.humid,"En marche","Arrêté");
  $("pc-n-humid").textContent=d.modeHumid===1?`Auto : marche sous ${fmt(d.hrBasse,0)} % d'humidité moyenne, et en refroidissement au-dessus de 33 °C ; jamais au-dessus de 75 %.`:manuel(d.modeHumid,"");
  pilot("modeVentil");state("vent",d.vent1||d.vent2,d.vent2?"Étages 1 et 2":"Étage 1","Arrêtée",d.vent2);
  const nv=$("pc-n-vent");
  if(d.tMoy>35&&d.modeVentil===3){nv.className="note pc-note warn";nv.textContent="Plus de 35 °C : la ventilation tourne malgré l'arrêt manuel (sécurité chaleur)."}
  else{nv.className="note";nv.textContent=d.modeVentil===1?`Auto : étage 1 au-dessus de ${fmt(d.seuilVent1)} °C, étage 2 au-dessus de ${fmt(d.seuilVent2)} °C ; aussi si l'ammoniac dépasse 20 ppm ou le CO₂ 3000 ppm.`:manuel(d.modeVentil,d.modeVentil===3?"Au-dessus de 35 °C, la ventilation repart d'elle-même.":"")}
  /* unités et repères selon l'espèce du lot (poules, porcs, ruminants, poissons) */
  const e0=I.esp,gros=/porc|petitsrum|chevrelait|bovin|vachelait/.test(e0),pois=e0==="poisson";
  const U=VOLAILLES.includes(e0)?["g/poule","ml/poule","repère ≈ 2"]:e0==="porc"?["kg/porc","L/porc","repère ≈ 3"]:gros?["kg/animal","L/animal","repère ≈ 4"]:pois?["g/poisson","",""]:["g/animal","ml/animal",""];
  {const u=(id,t)=>{const x=$("pc-kp-"+id);const sm=x&&x.querySelector("b small");if(sm)sm.textContent=t};u("ap",U[0]);u("ep",U[1]);if($("pc-ks-ra"))$("pc-ks-ra").textContent=U[2];
   $("pc-kp-ep").hidden=pois;$("pc-kp-ra").hidden=pois||!U[2]}
  const n=I.alive||430,gp=d.alimHier*1000/n/(gros?1000:1),ml=d.eauHier*1000/n/(gros?1000:1),ra=d.eauHier/d.alimHier,ve=(d.eauHier/refE-1)*100,va=(d.alimHier/refA-1)*100;
  setK("ap",fmt(gp,gros?1:0));setK("ep",fmt(ml,gros?1:0));setK("ra",fmt(ra));
  setS("ap",`${va>=0?"+":"−"}${fmt(Math.abs(va),0)} % sur 7 jours`);setS("ep",`${ve>=0?"+":"−"}${fmt(Math.abs(ve),0)} % sur 7 jours`);
  flag("ap",lvl(va,-5,10,-15,20));flag("ep",lvl(ve,-5,15,-15,30));{const e=infoLot().esp,R=VOLAILLES.includes(e)?[1.6,2.6,1.3,3.2]:e==="porc"?[2,4,1.5,5]:/petitsrum|chevrelait|bovin|vachelait/.test(e)?[3,6,2,8]:null;flag("ra",R?lvl(ra,...R):"")}
  const Al=[];
  if(ve<-15&&!pois)Al.push(["bad",`Eau en baisse de ${fmt(-ve,0)} % sur 7 jours : vérifier l'état des ${VOLAILLES.includes(infoLot().esp)?"poules":"animaux"}.`]);
  if(va<-15)Al.push(["bad",`Aliment en baisse de ${fmt(-va,0)} % sur 7 jours.`]);
  if(d.nh3>20&&pertinente("alNh3"))Al.push(["warn","Ammoniac élevé : litière à changer."]);
  if(d.ph<6||d.ph>8)Al.push(["bad","pH de l'eau hors de 6 à 8."]);
  if(d.tds>1000)Al.push(["bad","Trop de sels dissous dans l'eau."]);
  if(!Al.length)Al.push(["ok","Consommations normales, air et eau dans les limites."]);
  const P=$("pc-alerts");P.innerHTML="";Al.forEach(([c,t])=>{const p=document.createElement("p");p.className="note pc-note "+c;p.textContent=t;P.append(p)})}

/* ================= commandes ================= */
const versManuel=k=>data[CMDS[k]]?2:3;
Object.keys(CMDS).forEach(k=>{
  document.querySelectorAll("#pc-seg-"+k+" button").forEach(b=>b.onclick=()=>send({[k]:b.dataset.p==="auto"?1:(data[k]!==1?data[k]:versManuel(k))}));
  document.querySelectorAll("#pc-man-"+k+" button").forEach(b=>b.onclick=()=>send({[k]:Number(b.dataset.v)}))});
document.querySelectorAll("#pc-seg-global button").forEach(b=>b.onclick=()=>{const v={};Object.keys(CMDS).forEach(k=>v[k]=b.dataset.p==="auto"?1:(data[k]!==1?data[k]:versManuel(k)));send(v)});
document.querySelectorAll("#v-poulailler .pc-step button").forEach(b=>b.onclick=()=>send({heureAllumage:Math.min(8,Math.max(2,(data.heureAllumage||4.5)+Number(b.dataset.d)))}));
document.querySelectorAll("#pc-seg-sante button").forEach(b=>b.onclick=()=>{santeForcee=Number(b.dataset.v);envoyerConsignes()});
$("pc-lot").onchange=e=>{cfg.lotId=e.target.value;saveCfg();santeForcee=null;envoyerConsignes()};
$("pc-acq").onclick=()=>send({acquitter:1});
$("pc-son").onclick=()=>{try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume&&audio.resume()}catch(e){}
  sonActif=!sonActif;$("pc-son").textContent=sonActif?"Son activé":"Activer le son";if(sonActif)bip()};
document.querySelectorAll("#pc-simbox [data-panne]").forEach(b=>b.onclick=()=>{if(demo)send({panne:b.dataset.panne})});
$("pc-c-save").onclick=()=>{cfg=Object.assign(cfg,{demo:$("pc-c-demo").checked,ip:$("pc-c-ip").value.trim(),user:$("pc-c-user").value.trim(),password:$("pc-c-pw").value});saveCfg();connect()};

/* ================= vue 3D : chargée seulement quand on l'ouvre (aucun effet sur la vitesse de l'app sinon) ================= */
function loadScript(src){return new Promise((ok,ko)=>{const e=document.createElement("script");e.src=src;e.onload=ok;e.onerror=ko;document.head.append(e)})}
const VER=(()=>{const e=document.querySelector('script[src*="poulailler.js"]');const m=e&&/[?&]v=([\d.]+)/.exec(e.getAttribute("src"));return m?m[1]:"1"})();
$("pc-3d").onclick=async()=>{const b=$("pc-3d");if(b.disabled)return;b.disabled=true;b.style.opacity=".6";
  try{if(!window.THREE)await loadScript("libs/three.min.js?v="+VER);if(!window.THREE.OrbitControls)await loadScript("libs/OrbitControls.js?v="+VER);
    if(!window.B2A_PC3D)await loadScript("poulailler3d.js?v="+VER);if(!started)start();
    window.B2A_PC3D.open({data:()=>data,refresh,send,demo:()=>demo,ALARMES,lot:()=>{const I=infoLot();return{genre:genre(I.esp),esp:I.esp,x:I.esp==="culture"?I.X:I.esp==="couvee"?(I.l&&I.l.__couv&&I.l.__couv.espece)||"":""}},pertinente})}
  catch(e){toast(tr("La vue 3D n'a pas pu se charger."))}
  finally{b.disabled=false;b.style.opacity=""}};

/* ================= démarrage : seulement quand l'écran est ouvert ================= */
let started=false;
function start(){if(started)return;started=true;connect();timer=setInterval(()=>{if(!busy)refresh()},3000)}
function onShow(){if(V.hidden)return;if(!started)start();else envoyerConsignes()}
new MutationObserver(onShow).observe(V,{attributes:true,attributeFilter:["hidden"]});
if(cfg.ip&&cfg.demo===false)start();   // dispositif configuré : surveillance des alertes dès l'ouverture de l'application
setInterval(()=>{if(data.sirene&&!V.hidden)bip()},2500);
onShow();
})();
