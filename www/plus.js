/* B2A Smart Farming : lecture à voix haute, affichage (texte plus grand, plein soleil), rappels,
   contacts utiles (vétérinaires, fournisseurs, acheteurs), cahier de caisse et partage WhatsApp. */
(function(){
const B=window.B2A;if(!B||!B.app)return;const A=B.app;

/* ================= traductions des nouveaux écrans ================= */
const T={
"Écouter":["Listen","Ascolta","Escuchar"],
"Arrêter":["Stop","Ferma","Detener"],
"Lire à voix haute":["Read aloud","Leggi ad alta voce","Leer en voz alta"],
"Alertes du jour.":["Today's alerts.","Avvisi di oggi.","Alertas del día."],
"Partager":["Share","Condividi","Compartir"],
"Partager le bilan du lot":["Share the batch report","Condividi il resoconto del lotto","Compartir el balance del lote"],
"Affichage et voix":["Display and voice","Visualizzazione e voce","Pantalla y voz"],
"Taille du texte":["Text size","Dimensione del testo","Tamaño del texto"],
"Normale":["Normal","Normale","Normal"],
"Grande":["Large","Grande","Grande"],
"Très grande":["Very large","Molto grande","Muy grande"],
"Mode plein soleil":["Bright sunlight mode","Modalità pieno sole","Modo pleno sol"],
"Contraste renforcé, fond blanc et texte noir : plus lisible dehors.":["Stronger contrast, white background and black text: easier to read outdoors.","Contrasto rinforzato, sfondo bianco e testo nero: più leggibile all'aperto.","Contraste reforzado, fondo blanco y texto negro: más legible al aire libre."],
"Vitesse de la voix":["Voice speed","Velocità della voce","Velocidad de la voz"],
"Lente":["Slow","Lenta","Lenta"],
"Rapide":["Fast","Veloce","Rápida"],
"Essayer la voix":["Try the voice","Prova la voce","Probar la voz"],
"Bonjour. Je lis les alertes, les bilans et le guide santé à voix haute.":["Hello. I read the alerts, reports and health guide aloud.","Buongiorno. Leggo ad alta voce gli avvisi, i resoconti e la guida sanitaria.","Hola. Leo en voz alta las alertas, los balances y la guía de salud."],
"La lecture à voix haute n'est pas disponible sur ce téléphone.":["Reading aloud is not available on this phone.","La lettura ad alta voce non è disponibile su questo telefono.","La lectura en voz alta no está disponible en este teléfono."],
"Rappels":["Reminders","Promemoria","Recordatorios"],
"Recevoir un rappel le matin pour les vaccins, traitements et travaux du jour.":["Get a morning reminder for the day's vaccines, treatments and tasks.","Ricevi un promemoria al mattino per i vaccini, i trattamenti e i lavori del giorno.","Recibir un recordatorio por la mañana para las vacunas, tratamientos y tareas del día."],
"Activer les rappels":["Turn on reminders","Attiva i promemoria","Activar los recordatorios"],
"Désactiver":["Turn off","Disattiva","Desactivar"],
"Heure du rappel":["Reminder time","Ora del promemoria","Hora del recordatorio"],
"Rappels activés.":["Reminders on.","Promemoria attivati.","Recordatorios activados."],
"Rappels désactivés.":["Reminders off.","Promemoria disattivati.","Recordatorios desactivados."],
"Les notifications sont bloquées. Autorisez-les dans les réglages du téléphone.":["Notifications are blocked. Allow them in the phone settings.","Le notifiche sono bloccate. Consentile nelle impostazioni del telefono.","Las notificaciones están bloqueadas. Permítalas en los ajustes del teléfono."],
"Ce navigateur ne peut pas afficher de notifications.":["This browser cannot show notifications.","Questo browser non può mostrare notifiche.","Este navegador no puede mostrar notificaciones."],
"{0} rappel(s) programmé(s) sur ce téléphone, même application fermée et sans internet.":["{0} {0:reminder|reminders} scheduled on this phone, even with the app closed and without internet.","{0} {0:promemoria|promemoria} programmati su questo telefono, anche ad app chiusa e senza internet.","{0} {0:recordatorio|recordatorios} programados en este teléfono, incluso con la aplicación cerrada y sin internet."],
"Dans le navigateur, le rappel s'affiche quand vous ouvrez l'application. Pour être prévenu même application fermée, installez l'application Android.":["In the browser, the reminder shows when you open the app. To be notified even with the app closed, install the Android app.","Nel browser il promemoria compare quando apri l'app. Per essere avvisato anche ad app chiusa, installa l'app Android.","En el navegador, el recordatorio aparece al abrir la aplicación. Para recibir avisos con la aplicación cerrada, instale la aplicación Android."],
"Soins du jour":["Today's care","Cure di oggi","Cuidados del día"],
"Aujourd'hui":["Today","Oggi","Hoy"],
"{0} soin(s) en retard":["{0} overdue care {0:task|tasks}","{0} {0:cura|cure} in ritardo","{0} {0:cuidado|cuidados} atrasados"],
"Ouvrez l'application pour les marquer faits.":["Open the app to mark them done.","Apri l'app per segnarli come fatti.","Abra la aplicación para marcarlos como hechos."],
"Rappel de test : les rappels fonctionnent.":["Test reminder: reminders are working.","Promemoria di prova: i promemoria funzionano.","Recordatorio de prueba: los recordatorios funcionan."],
"Tester":["Test","Prova","Probar"],
"Mes contacts utiles":["My useful contacts","I miei contatti utili","Mis contactos útiles"],
"Vétérinaires, fournisseurs d'aliment et de poussins, acheteurs : appelez ou écrivez sur WhatsApp en un geste.":["Vets, feed and chick suppliers, buyers: call or message on WhatsApp in one tap.","Veterinari, fornitori di mangime e pulcini, acquirenti: chiama o scrivi su WhatsApp con un tocco.","Veterinarios, proveedores de pienso y pollitos, compradores: llame o escriba por WhatsApp con un toque."],
"+ Ajouter":["+ Add","+ Aggiungi","+ Añadir"],
"Tous":["All","Tutti","Todos"],
"Vétérinaires":["Vets","Veterinari","Veterinarios"],
"Fournisseurs":["Suppliers","Fornitori","Proveedores"],
"Acheteurs":["Buyers","Acquirenti","Compradores"],
"Autres":["Others","Altri","Otros"],
"Vétérinaire":["Vet","Veterinario","Veterinario"],
"Fournisseur":["Supplier","Fornitore","Proveedor"],
"Acheteur":["Buyer","Acquirente","Comprador"],
"Autre":["Other","Altro","Otro"],
"Nom":["Name","Nome","Nombre"],
"Rôle":["Role","Ruolo","Función"],
"Téléphone":["Phone","Telefono","Teléfono"],
"Indicatif du pays":["Country code","Prefisso internazionale","Prefijo del país"],
"Lieu (facultatif)":["Place (optional)","Luogo (facoltativo)","Lugar (opcional)"],
"Remarque (facultatif)":["Note (optional)","Nota (facoltativa)","Nota (opcional)"],
"ex. Dr Ouédraogo":["e.g. Dr Ouédraogo","es. Dr Ouédraogo","p. ej. Dr. Ouédraogo"],
"ex. Ouagadougou, Tanghin":["e.g. Ouagadougou, Tanghin","es. Ouagadougou, Tanghin","p. ej. Uagadugú, Tanghin"],
"ex. vend le maïs à 225 F/kg, livre le samedi":["e.g. sells maize at 225 F/kg, delivers on Saturday","es. vende il mais a 225 F/kg, consegna il sabato","p. ej. vende el maíz a 225 F/kg, entrega el sábado"],
"Enregistrer":["Save","Salva","Guardar"],
"Annuler":["Cancel","Annulla","Cancelar"],
"Modifier":["Edit","Modifica","Modificar"],
"Supprimer":["Delete","Elimina","Eliminar"],
"Confirmer la suppression":["Confirm deletion","Conferma l'eliminazione","Confirmar la eliminación"],
"Appeler":["Call","Chiama","Llamar"],
"WhatsApp":["WhatsApp","WhatsApp","WhatsApp"],
"Indiquez au moins un nom et un numéro.":["Enter at least a name and a number.","Indica almeno un nome e un numero.","Indique al menos un nombre y un número."],
"Aucun contact pour l'instant. Ajoutez votre vétérinaire en premier : c'est le plus utile en cas de maladie.":["No contacts yet. Add your vet first: that is the most useful one when disease strikes.","Nessun contatto per ora. Aggiungi prima il tuo veterinario: è il più utile in caso di malattia.","Aún no hay contactos. Añada primero a su veterinario: es el más útil en caso de enfermedad."],
"Appeler mon vétérinaire":["Call my vet","Chiama il mio veterinario","Llamar a mi veterinario"],
"Ajoutez le numéro de votre vétérinaire dans « Mes contacts utiles » (onglet Accueil) pour l'appeler d'ici en un geste.":["Add your vet's number in « My useful contacts » (Home tab) to call them from here in one tap.","Aggiungi il numero del tuo veterinario in « I miei contatti utili » (scheda Home) per chiamarlo da qui con un tocco.","Añada el número de su veterinario en « Mis contactos útiles » (pestaña Inicio) para llamarlo desde aquí con un toque."],
"Cahier de caisse":["Cash book","Libro cassa","Libro de caja"],
"Notez chaque dépense (aliment, poussins, vaccins, salaires…) : l'application calcule ce qui reste vraiment chaque mois.":["Record each expense (feed, chicks, vaccines, wages…): the app works out what is really left each month.","Annota ogni spesa (mangime, pulcini, vaccini, salari…): l'app calcola quanto resta davvero ogni mese.","Anote cada gasto (pienso, pollitos, vacunas, salarios…): la aplicación calcula lo que realmente queda cada mes."],
"Mois précédent":["Previous month","Mese precedente","Mes anterior"],
"Mois suivant":["Next month","Mese successivo","Mes siguiente"],
"Encaissé":["Received","Incassato","Cobrado"],
"Dépenses":["Expenses","Spese","Gastos"],
"Reste":["Balance","Saldo","Saldo"],
"{0} facture(s) payée(s)":["{0} paid {0:invoice|invoices}","{0} {0:fattura pagata|fatture pagate}","{0} {0:factura pagada|facturas pagadas}"],
"{0} dépense(s)":["{0} {0:expense|expenses}","{0} {0:spesa|spese}","{0} {0:gasto|gastos}"],
"bénéfice":["profit","utile","beneficio"],
"perte":["loss","perdita","pérdida"],
"+ Nouvelle dépense":["+ New expense","+ Nuova spesa","+ Nuevo gasto"],
"Date":["Date","Data","Fecha"],
"Catégorie":["Category","Categoria","Categoría"],
"Montant (FCFA)":["Amount (FCFA)","Importo (FCFA)","Importe (FCFA)"],
"Lot (facultatif)":["Batch (optional)","Lotto (facoltativo)","Lote (opcional)"],
"Aucun lot":["No batch","Nessun lotto","Ningún lote"],
"ex. 10 sacs de son de blé":["e.g. 10 bags of wheat bran","es. 10 sacchi di crusca di frumento","p. ej. 10 sacos de salvado de trigo"],
"Indiquez un montant.":["Enter an amount.","Indica un importo.","Indique un importe."],
"Dépense enregistrée.":["Expense saved.","Spesa salvata.","Gasto guardado."],
"Aucune dépense notée ce mois-ci.":["No expenses recorded this month.","Nessuna spesa annotata questo mese.","No hay gastos anotados este mes."],
"Où va l'argent":["Where the money goes","Dove vanno i soldi","Adónde va el dinero"],
"Partager le bilan du mois":["Share the month's report","Condividi il resoconto del mese","Compartir el balance del mes"],
"Les entrées sont les sommes payées sur les factures datées de ce mois.":["Income is the amount paid on invoices dated this month.","Le entrate sono le somme pagate sulle fatture datate questo mese.","Los ingresos son las sumas pagadas en las facturas con fecha de este mes."],
"Aliment":["Feed","Mangime","Pienso"],
"Animaux (poussins, achats)":["Animals (chicks, purchases)","Animali (pulcini, acquisti)","Animales (pollitos, compras)"],
"Vaccins et médicaments":["Vaccines and medicines","Vaccini e medicinali","Vacunas y medicamentos"],
"Main-d'œuvre":["Labour","Manodopera","Mano de obra"],
"Transport":["Transport","Trasporto","Transporte"],
"Eau et électricité":["Water and electricity","Acqua ed elettricità","Agua y electricidad"],
"Matériel et entretien":["Equipment and upkeep","Attrezzatura e manutenzione","Material y mantenimiento"],
"Faire connaître l'application":["Tell others about the app","Fai conoscere l'app","Dar a conocer la aplicación"],
"Envoyez l'application à un autre éleveur par WhatsApp, SMS ou Bluetooth. Elle est gratuite.":["Send the app to another farmer by WhatsApp, SMS or Bluetooth. It is free.","Invia l'app a un altro allevatore via WhatsApp, SMS o Bluetooth. È gratuita.","Envíe la aplicación a otro ganadero por WhatsApp, SMS o Bluetooth. Es gratuita."],
"Envoyer l'application à un ami":["Send the app to a friend","Invia l'app a un amico","Enviar la aplicación a un amigo"],
"Copier le lien":["Copy the link","Copia il link","Copiar el enlace"],
"Lien copié.":["Link copied.","Link copiato.","Enlace copiado."],
"Je vous recommande B2A Smart Farming : carnet d'élevage, calendrier des vaccins, formules d'aliment, factures et guide santé. Gratuit et fonctionne sans internet.":["I recommend B2A Smart Farming: farm record book, vaccine calendar, feed formulas, invoices and health guide. Free and works without internet.","Ti consiglio B2A Smart Farming: registro d'allevamento, calendario dei vaccini, formule di mangime, fatture e guida sanitaria. Gratuita e funziona senza internet.","Le recomiendo B2A Smart Farming: cuaderno de cría, calendario de vacunas, fórmulas de pienso, facturas y guía de salud. Gratuita y funciona sin internet."],
"Télécharger : {0}":["Download: {0}","Scarica: {0}","Descargar: {0}"],
"Bilan du lot « {q0} » au {0}":["Report for batch « {q0} » on {0}","Resoconto del lotto « {q0} » al {0}","Balance del lote « {q0} » al {0}"],
"Bilan de caisse – {q0}":["Cash report – {q0}","Resoconto di cassa – {q0}","Balance de caja – {q0}"],
"Effectif : {0} animaux (morts au total : {1}, soit {2} %)":["Headcount: {0} animals (total deaths: {1}, i.e. {2} %)","Effettivo: {0} animali (morti in totale: {1}, cioè {2} %)","Efectivo: {0} animales (muertes en total: {1}, es decir {2} %)"],
"Âge : {0} semaines":["Age: {0} weeks","Età: {0} settimane","Edad: {0} semanas"],
"Morts sur 7 jours : {0}":["Deaths over 7 days: {0}","Morti in 7 giorni: {0}","Muertes en 7 días: {0}"],
"Ponte moyenne sur 7 jours : {0} %":["Average laying rate over 7 days: {0} %","Deposizione media su 7 giorni: {0} %","Puesta media en 7 días: {0} %"],
"Œufs sur 7 jours : {0} ({1} plateaux)":["Eggs over 7 days: {0} ({1} trays)","Uova in 7 giorni: {0} ({1} vassoi)","Huevos en 7 días: {0} ({1} bandejas)"],
"Lait moyen : {0} L par tête et par jour":["Average milk: {0} L per head per day","Latte medio: {0} L per capo al giorno","Leche media: {0} L por cabeza y día"],
"Poids moyen : {0}":["Average weight: {0}","Peso medio: {0}","Peso medio: {0}"],
"Coût de l'aliment par œuf : {0} F":["Feed cost per egg: {0} F","Costo del mangime per uovo: {0} F","Coste del pienso por huevo: {0} F"],
"Marge sur 7 jours (ventes moins aliment) : {0} F":["7-day margin (sales minus feed): {0} F","Margine su 7 giorni (vendite meno mangime): {0} F","Margen en 7 días (ventas menos pienso): {0} F"],
"Alertes :":["Alerts:","Avvisi:","Alertas:"],
"Aucune alerte.":["No alerts.","Nessun avviso.","Ninguna alerta."],
"Entrées : {0} F":["Income: {0} F","Entrate: {0} F","Ingresos: {0} F"],
"Dépenses : {0} F":["Expenses: {0} F","Spese: {0} F","Gastos: {0} F"],
"Reste : {0} F":["Balance: {0} F","Saldo: {0} F","Saldo: {0} F"],
"Envoyé avec B2A Smart Farming":["Sent with B2A Smart Farming","Inviato con B2A Smart Farming","Enviado con B2A Smart Farming"]
};
{const D=window.B2A_DICT=window.B2A_DICT||{};["en","it","es"].forEach((l,i)=>{D[l]=D[l]||{};for(const k in T)if(D[l][k]==null)D[l][k]=T[k][i]})}

/* ================= outils ================= */
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const tr=s=>window.__tr?window.__tr(s):s;
const lang=()=>window.B2A_LANG?window.B2A_LANG():"fr";
const LOC={fr:"fr-FR",en:"en-GB",it:"it-IT",es:"es-ES"};
const pad=n=>String(n).padStart(2,"0");
const iso=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const today=()=>iso(new Date());
const fmt=(v,d)=>A.fmt(v,d);
const fdate=s=>new Date(s+"T12:00").toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});
const debounce=(f,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>f(...a),ms)}};
const isNative=()=>{const C=window.Capacitor;return !!(C&&C.isNativePlatform&&C.isNativePlatform())};
const plug=n=>isNative()&&window.Capacitor.Plugins&&window.Capacitor.Plugins[n]||null;
const APP_URL="https://azizyou2005.github.io/b2a-smart-farming/";
const ICON={
 spk:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
 stop:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
 share:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/></svg>',
 tel:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
 wa:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2z"/></svg>'
};
function iconBtn(cls,icon,label){const b=el("button",cls);b.type="button";b.innerHTML=ICON[icon];b.append(el("span",null,label));return b}

/* styles des nouveaux éléments */
const css=el("style");css.textContent=`
.pbtn{display:inline-flex;align-items:center;gap:6px}
.pbtn svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;flex:none}
.pbtn.on{background:var(--leaf);color:var(--surface);border-color:var(--leaf)}
.spkrow{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}
input[type=tel]{width:100%;font:16px var(--body);padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink);min-height:46px}
.clist,.dlist{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.clist li{border:1px solid var(--line);border-radius:12px;padding:12px;display:grid;gap:8px}
.clist .who{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
.clist .who b{font-size:17px;overflow-wrap:anywhere}
.clist .who small{display:block;color:var(--muted)}
.clist .acts{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.clist .acts .btn{display:flex;justify-content:center;align-items:center;gap:8px;text-decoration:none;min-height:48px;font-size:16px}
.clist .acts svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.clist .acts .wa{background:#1f8a4c;color:#fff}
.clist .more2{display:flex;gap:8px;flex-wrap:wrap}
.rolepill{font:700 12px var(--body);padding:3px 9px;border-radius:999px;background:var(--leaf-soft);color:var(--heading);white-space:nowrap}
.rolepill.veto{background:var(--bad-bg);color:var(--bad)}
.mnav{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:8px}
.mnav b{text-align:center;font:700 17px var(--display);text-transform:capitalize}
.mnav button{min-width:44px;min-height:44px;font-size:20px}
.dlist li{display:grid;grid-template-columns:1fr auto;gap:2px 10px;border-bottom:1px solid var(--line);padding:8px 2px}
.dlist li b{font-family:var(--mono);font-variant-numeric:tabular-nums;text-align:right}
.dlist li small{color:var(--muted);align-self:center}
.dlist li .x{grid-column:2;justify-self:end;padding:4px 10px;font-size:13px}
.cbars{display:grid;gap:8px}
#p-dtiles .tile b{font-size:clamp(15px,4.3vw,20px);white-space:nowrap}
#p-dtiles .tile{padding:10px}
.cbars div{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;font-size:14px}
.cbars i{grid-column:1/-1;height:8px;border-radius:4px;background:var(--brand-gold);display:block}
.vetcall{display:grid;gap:8px;border:2px solid var(--bad);border-radius:12px;padding:12px}
.vetcall .acts{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.vetcall .btn{display:flex;justify-content:center;align-items:center;gap:8px;text-decoration:none}
.vetcall svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.9}
#p-rmsg:empty,#p-rst:empty,#p-smsg:empty{display:none}
.toggle{display:flex;gap:12px;align-items:center;cursor:pointer;font-weight:600}
.toggle input{width:22px;height:22px;accent-color:var(--brand-green);flex:none}
:root[data-sun]{--bg:#ffffff;--surface:#ffffff;--ink:#000000;--muted:#1f2733;--line:#5d6778;--heading:#000000;--leaf:#0b1a33;--leaf-soft:#e6ebf3;
  --green-ink:#1e4f0b;--ok:#1e4f0b;--warn:#5e3d00;--bad:#8a1a10;--ok-bg:#dcefcd;--warn-bg:#fbe7bf;--bad-bg:#f6d2cb;--on-primary:#fff;color-scheme:light}
:root[data-sun] body{font-weight:600}
:root[data-sun] .card,:root[data-sun] .tile:not(.hero .tile),:root[data-sun] .kpi,:root[data-sun] .lot{border-width:2px;box-shadow:none}
:root[data-sun] .note,:root[data-sun] .msg,:root[data-sun] .field small{color:#1f2733}
:root[data-sun] .btn.ghost{border-width:2px;border-color:#000}
:root[data-sun] input,:root[data-sun] select,:root[data-sun] textarea{border:2px solid #000 !important}
`;document.head.append(css);

/* ================= 1. affichage : taille du texte, plein soleil ================= */
const ZOOM={n:1,g:1.15,tg:1.3};
function applyDisplay(){
  const z=ZOOM[B.lsGet("b2a-zoom")||"n"]||1;document.body.style.zoom=z===1?"":String(z);
  if(B.lsGet("b2a-sun")==="1")document.documentElement.setAttribute("data-sun","");else document.documentElement.removeAttribute("data-sun");
  const tc=document.querySelector('meta[name="theme-color"]');if(tc&&B.lsGet("b2a-sun")==="1")tc.content="#ffffff"}
applyDisplay();

/* ================= 2. lecture à voix haute ================= */
const Speech={on:false,btn:null,
  can(){return !!plug("TextToSpeech")||("speechSynthesis" in window&&typeof SpeechSynthesisUtterance!=="undefined")},
  rate(){return Number(B.lsGet("b2a-tts-rate")||"0.9")||0.9},
  voice(code){try{const v=speechSynthesis.getVoices();return v.find(x=>x.lang===code)||v.find(x=>x.lang&&x.lang.slice(0,2)===code.slice(0,2))||null}catch(e){return null}},
  async say(text,btn){
    if(this.on){const same=this.btn===btn;this.stop();if(same)return}
    text=clean(text);if(!text)return;
    this.on=true;this.btn=btn;mark(btn,true);const code=LOC[lang()]||"fr-FR";const rate=this.rate();
    try{const TTS=plug("TextToSpeech");
      if(TTS){const parts=chunks(text,3000);for(const p of parts){if(!this.on)break;await TTS.speak({text:p,lang:code,rate,pitch:1,volume:1,category:"playback"})}}
      else await new Promise(res=>{try{speechSynthesis.cancel()}catch(e){}
        /* phrases courtes : certains navigateurs coupent la lecture des textes longs */
        const parts=chunks(text,180);let i=0;const v=this.voice(code);
        const next=()=>{if(!this.on||i>=parts.length)return res();const u=new SpeechSynthesisUtterance(parts[i++]);u.lang=code;u.rate=rate;if(v)u.voice=v;u.onend=next;u.onerror=next;speechSynthesis.speak(u)};
        next()})
    }catch(e){console.warn(e)}
    if(this.btn===btn){this.on=false;mark(btn,false)}},
  stop(){this.on=false;const TTS=plug("TextToSpeech");if(TTS)TTS.stop().catch(()=>{});else{try{speechSynthesis.cancel()}catch(e){}}if(this.btn)mark(this.btn,false);this.btn=null}
};
try{if("speechSynthesis" in window)speechSynthesis.getVoices()}catch(e){}
addEventListener("pagehide",()=>Speech.stop());
function chunks(t,max){const out=[];const ss=t.match(/[^.!?;:\n]+[.!?;:]*/g)||[t];let cur="";
  for(let s of ss){s=s.trim();if(!s)continue;if((cur+" "+s).length>max&&cur){out.push(cur);cur=s}else cur=cur?cur+" "+s:s}if(cur)out.push(cur);return out}
function clean(t){return String(t).replace(/ | /g," ").replace(/·/g,",").replace(/[‹›«»“”]/g,"").replace(/(\d) F\b/g,lang()==="fr"?"$1 francs":"$1 CFA francs")
  .replace(/\bJ−(\d+)/g,"J moins $1").replace(/[ \t]+/g," ").replace(/\s*\n\s*/g,"\n").replace(/\n+/g,". ").replace(/([.!?:;])\s*\./g,"$1").trim()}
/* texte lisible d'un bloc, sans les boutons */
function readable(node){if(!node)return"";const c=node.cloneNode(true);
  c.querySelectorAll("button,select,input,textarea,svg,script,style,[data-nospeak],.spkrow,.bar").forEach(x=>x.remove());
  c.querySelectorAll("li,p,h1,h2,h3,h4,div,tr,strong,small,dt,dd,summary,section").forEach(x=>x.append(document.createTextNode("\n")));
  c.querySelectorAll("td,th").forEach(x=>x.append(document.createTextNode(", ")));
  return c.textContent}
function mark(btn,on){if(!btn||!btn.isConnected&&!on)return;btn.classList.toggle("on",on);btn.innerHTML=on?ICON.stop:ICON.spk;btn.append(el("span",null,on?"Arrêter":"Écouter"));btn.setAttribute("aria-pressed",String(on))}
function speakBtn(getText){const b=iconBtn("btn small ghost pbtn spk","spk","Écouter");b.setAttribute("aria-label","Lire à voix haute");b.setAttribute("data-nospeak","");
  b.onclick=()=>Speech.say(getText(),b);if(!Speech.can())b.hidden=true;return b}

/* alertes du jour (accueil) */
{const head=$("goCal")&&$("goCal").parentElement;if(head){const wrap=el("div","btnrow");head.insertBefore(wrap,$("goCal"));
  wrap.append(speakBtn(()=>tr("Alertes du jour.")+"\n"+readable($("globalAlerts"))),$("goCal"))}}
/* rapport IA et guide santé hors ligne */
function attachSpeak(box){if(!box)return;const fix=()=>{if(!box.children.length||box.querySelector(":scope > .spkrow"))return;
  const r=el("div","spkrow");r.setAttribute("data-nospeak","");r.append(speakBtn(()=>readable(box)));box.prepend(r)};
  new MutationObserver(debounce(fix,50)).observe(box,{childList:true});fix()}
attachSpeak($("report"));
const waitGuide=setInterval(()=>{if($("g-res")){clearInterval(waitGuide);attachSpeak($("g-res"));vetObserver($("g-res"))}},300);setTimeout(()=>clearInterval(waitGuide),15000);

/* ================= 3. partage ================= */
async function share(title,text){
  const S=plug("Share");
  if(S){try{await S.share({title,text,dialogTitle:title});return}catch(e){if(e&&/cancel/i.test(String(e.message||e)))return}}
  if(navigator.share){try{await navigator.share({title,text});return}catch(e){if(e&&e.name==="AbortError")return}}
  window.open("https://wa.me/?text="+encodeURIComponent(text),"_blank","noopener")}
function lotReport(l,s){
  const L=[];const P=x=>L.push(tr(x));
  L.push("B2A Smart Farming");P(`Bilan du lot « ${l.nom||"Lot"} » au ${fdate(today())}`);L.push("");
  P(`Effectif : ${fmt(s.alive)} animaux (morts au total : ${fmt(s.mortsTot)}, soit ${fmt(s.mortsTotPct,1)} %)`);
  if(s.ageW)P(`Âge : ${s.ageW} semaines`);
  P(`Morts sur 7 jours : ${fmt(s.morts7)}`);
  if(A.isLayer(l)){if(s.ponte7!=null)P(`Ponte moyenne sur 7 jours : ${fmt(s.ponte7,1)} %`);P(`Œufs sur 7 jours : ${fmt(s.oeufs7)} (${fmt(s.oeufs7/30,1)} plateaux)`);
    if(s.coutOeuf!=null)P(`Coût de l'aliment par œuf : ${fmt(s.coutOeuf,1)} F`)}
  if(A.isDairy(l)&&s.lait7!=null)P(`Lait moyen : ${fmt(s.lait7,1)} L par tête et par jour`);
  if(s.poids!=null)P(`Poids moyen : ${fmt(s.poids)} ${A.isLayer(l)||/poul|pintade|caille|canard|dinde/i.test(l.espece||"")?"g":"kg"}`);
  if(s.marge7!=null)P(`Marge sur 7 jours (ventes moins aliment) : ${fmt(s.marge7)} F`);
  L.push("");const al=A.allAlerts(l,s).filter(a=>a[0]==="bad"||a[0]==="warn");
  if(al.length){P("Alertes :");al.slice(0,6).forEach(a=>L.push("- "+tr(a[1])))}else P("Aucune alerte.");
  L.push("");L.push(tr("Envoyé avec B2A Smart Farming")+" · "+APP_URL);
  return L.join("\n")}
B.onDetail=(bx,l,s)=>{
  const sh=iconBtn("btn small ghost pbtn","share","Partager");sh.setAttribute("aria-label","Partager le bilan du lot");
  sh.onclick=()=>share("B2A Smart Farming",lotReport(l,s));
  const sp=speakBtn(()=>{const D=$("lotdetail");const parts=[l.nom||"",readable(D&&D.querySelector(".alerts")),readable(D&&D.querySelector(".kpis"))];return parts.join("\n")});
  bx.prepend(sp,sh)};
function appMessage(){return tr("Je vous recommande B2A Smart Farming : carnet d'élevage, calendrier des vaccins, formules d'aliment, factures et guide santé. Gratuit et fonctionne sans internet.")+"\n"+tr(`Télécharger : ${APP_URL}`)}

/* ================= 4. contacts utiles ================= */
const ROLES=[["veto","Vétérinaire","Vétérinaires"],["fourn","Fournisseur","Fournisseurs"],["achet","Acheteur","Acheteurs"],["autre","Autre","Autres"]];
const roleName=r=>(ROLES.find(x=>x[0]===r)||ROLES[3])[1];
let db=null,contacts=[],depenses=[],cFilter="all",cEdit=null;
const digits=s=>String(s||"").replace(/\D/g,"");
function intl(c){let t=String(c.tel||"").trim();if(/^\+/.test(t))return digits(t);let d=digits(t);if(d.startsWith("00"))return d.slice(2);
  const cc=digits(c.cc||"226");if(cc&&d.length<=10&&!d.startsWith(cc))d=cc+d.replace(/^0+/,"");return d}
const telHref=c=>"tel:+"+intl(c);
const waHref=c=>"https://wa.me/"+intl(c);

const cCard=el("section","card");cCard.id="p-contacts";
cCard.innerHTML=`<div class="row between"><h2 class="sec">Mes contacts utiles</h2><button class="btn small ghost" type="button" id="p-cadd">+ Ajouter</button></div>
<p class="note">Vétérinaires, fournisseurs d'aliment et de poussins, acheteurs : appelez ou écrivez sur WhatsApp en un geste.</p>
<div class="chips" id="p-cfil"></div>
<div id="p-cform" hidden style="display:grid;gap:12px">
  <div class="grid2">
    <div class="field"><label for="p-cnom">Nom</label><input type="text" id="p-cnom" placeholder="ex. Dr Ouédraogo" autocomplete="off"></div>
    <div class="field"><label for="p-crole">Rôle</label><select id="p-crole"></select></div>
    <div class="field"><label for="p-ctel">Téléphone</label><input type="tel" id="p-ctel" inputmode="tel" placeholder="ex. 70 12 34 56"></div>
    <div class="field"><label for="p-ccc">Indicatif du pays</label><input type="tel" id="p-ccc" inputmode="numeric" placeholder="226"></div>
    <div class="field"><label for="p-clieu">Lieu (facultatif)</label><input type="text" id="p-clieu" placeholder="ex. Ouagadougou, Tanghin"></div>
    <div class="field"><label for="p-cnote">Remarque (facultatif)</label><input type="text" id="p-cnote" placeholder="ex. vend le maïs à 225 F/kg, livre le samedi"></div>
  </div>
  <div class="row"><button class="btn" type="button" id="p-csave">Enregistrer</button><button class="btn ghost" type="button" id="p-ccancel">Annuler</button><span class="msg" id="p-cmsg"></span></div>
</div>
<ul class="clist" id="p-clist"></ul>`;
{const home=$("home");if(home)home.append(cCard)}
ROLES.forEach(([k,n])=>{const o=el("option",null,n);o.value=k;$("p-crole").append(o)});
function renderCFilters(){const F=$("p-cfil");F.innerHTML="";
  [["all","Tous"],...ROLES.map(r=>[r[0],r[2]])].forEach(([k,n])=>{const nb=k==="all"?contacts.length:contacts.filter(c=>c.role===k).length;if(k!=="all"&&!nb)return;
    const b=el("button","chip",n);b.type="button";b.setAttribute("aria-pressed",String(cFilter===k));b.onclick=()=>{cFilter=k;renderContacts()};F.append(b)});
  F.hidden=contacts.length<2}
function renderContacts(){
  renderCFilters();const L=$("p-clist");L.innerHTML="";
  const list=contacts.filter(c=>cFilter==="all"||c.role===cFilter).sort((a,b)=>(a.role==="veto"?0:1)-(b.role==="veto"?0:1)||(a.nom||"").localeCompare(b.nom||""));
  if(!contacts.length){const li=el("li");li.style.border="0";li.style.padding="0";li.append(el("p","note","Aucun contact pour l'instant. Ajoutez votre vétérinaire en premier : c'est le plus utile en cas de maladie."));L.append(li);return}
  list.forEach(c=>{const li=el("li");const w=el("div","who");const t=el("div");const nm=el("b",null,c.nom);nm.setAttribute("data-notr","");t.append(nm);
    const sub=[c.tel,c.lieu].filter(Boolean).join(" · ");if(sub){const s=el("small",null,sub);s.setAttribute("data-notr","");t.append(s)}
    if(c.note){const s=el("small",null,c.note);s.setAttribute("data-notr","");t.append(s)}
    w.append(t,el("span","rolepill"+(c.role==="veto"?" veto":""),roleName(c.role)));li.append(w);
    const acts=el("div","acts");const a1=el("a","btn");a1.href=telHref(c);a1.innerHTML=ICON.tel;a1.append(el("span",null,"Appeler"));
    const a2=el("a","btn wa");a2.href=waHref(c);a2.target="_blank";a2.rel="noopener";a2.innerHTML=ICON.wa;a2.append(el("span",null,"WhatsApp"));acts.append(a1,a2);li.append(acts);
    if(A.can()){const m=el("div","more2");const e=el("button","btn small ghost","Modifier");e.type="button";e.onclick=()=>openCForm(c);
      const d=el("button","btn small ghost danger","Supprimer");d.type="button";d.onclick=async()=>{if(d.dataset.c!=="1"){d.dataset.c="1";d.textContent="Confirmer la suppression";return}try{await db.doc("contacts/"+c.id).delete()}catch(e){}};
      m.append(e,d);li.append(m)}
    L.append(li)});
  refreshVetBoxes()}
function openCForm(c){cEdit=c||null;$("p-cform").hidden=false;$("p-cnom").value=c?c.nom||"":"";$("p-crole").value=c?c.role||"veto":(contacts.some(x=>x.role==="veto")?"fourn":"veto");
  $("p-ctel").value=c?c.tel||"":"";$("p-ccc").value=c?c.cc||"":(B.lsGet("b2a-cc")||"226");$("p-clieu").value=c?c.lieu||"":"";$("p-cnote").value=c?c.note||"":"";$("p-cmsg").textContent="";$("p-cnom").focus()}
function closeCForm(){$("p-cform").hidden=true;cEdit=null}
$("p-cadd").onclick=()=>openCForm(null);$("p-ccancel").onclick=closeCForm;
$("p-csave").onclick=async()=>{const nom=$("p-cnom").value.trim(),tel=$("p-ctel").value.trim();const m=$("p-cmsg");
  if(!nom||digits(tel).length<6){m.textContent="Indiquez au moins un nom et un numéro.";m.className="msg err";return}
  const cc=digits($("p-ccc").value)||"";if(cc)B.lsSet("b2a-cc",cc);
  const d={nom,role:$("p-crole").value,tel,cc,lieu:$("p-clieu").value.trim(),note:$("p-cnote").value.trim(),by:B.me};
  try{if(cEdit)await db.doc("contacts/"+cEdit.id).update(d);else await db.collection("contacts").doc().set(Object.assign(d,{createdAt:Date.now()}));closeCForm()}
  catch(e){m.textContent="Échec";m.className="msg err"}};

/* « Appeler mon vétérinaire » sous le guide santé et le rapport photo */
const vetBoxes=new Set();
function vetBox(){const w=el("div","vetcall");w.setAttribute("data-nospeak","");w.dataset.vet="1";fillVet(w);return w}
function fillVet(w){w.innerHTML="";const vets=contacts.filter(c=>c.role==="veto");
  if(!vets.length){w.style.borderColor="var(--line)";w.append(el("p","note","Ajoutez le numéro de votre vétérinaire dans « Mes contacts utiles » (onglet Accueil) pour l'appeler d'ici en un geste."));return}
  w.style.borderColor="";vets.slice(0,2).forEach(c=>{const nm=el("b",null,c.nom);nm.setAttribute("data-notr","");w.append(nm);const acts=el("div","acts");
    const a1=el("a","btn");a1.href=telHref(c);a1.innerHTML=ICON.tel;a1.append(el("span",null,"Appeler"));
    const a2=el("a","btn ghost");a2.href=waHref(c);a2.target="_blank";a2.rel="noopener";a2.innerHTML=ICON.wa;a2.append(el("span",null,"WhatsApp"));acts.append(a1,a2);w.append(acts)})}
function refreshVetBoxes(){vetBoxes.forEach(w=>{if(w.isConnected)fillVet(w);else vetBoxes.delete(w)})}
function vetObserver(box){if(!box)return;const fix=()=>{if(!box.children.length||box.querySelector(":scope > .vetcall"))return;
  const w=vetBox();vetBoxes.add(w);const sr=box.querySelector(":scope > .spkrow");if(sr)sr.after(w);else box.prepend(w)};
  new MutationObserver(debounce(fix,80)).observe(box,{childList:true});fix()}
vetObserver($("report"));

/* ================= 5. cahier de caisse ================= */
const CATS=[["aliment","Aliment"],["animaux","Animaux (poussins, achats)"],["sante","Vaccins et médicaments"],["mo","Main-d'œuvre"],["transport","Transport"],["energie","Eau et électricité"],["materiel","Matériel et entretien"],["autre","Autre"]];
const catName=k=>(CATS.find(c=>c[0]===k)||CATS[7])[1];
let dMonth=today().slice(0,7),dDel=null;
const kCard=el("section","card");kCard.id="p-caisse";
kCard.innerHTML=`<div class="row between"><h2 class="sec">Cahier de caisse</h2><button class="btn small" type="button" id="p-dadd">+ Nouvelle dépense</button></div>
<p class="note">Notez chaque dépense (aliment, poussins, vaccins, salaires…) : l'application calcule ce qui reste vraiment chaque mois.</p>
<div class="mnav"><button class="btn small ghost" type="button" id="p-mprev" aria-label="Mois précédent">‹</button><b id="p-mlbl"></b><button class="btn small ghost" type="button" id="p-mnext" aria-label="Mois suivant">›</button></div>
<div class="tiles" id="p-dtiles" style="grid-template-columns:repeat(3,minmax(0,1fr))"></div>
<div id="p-dform" hidden style="display:grid;gap:12px">
  <div class="grid2">
    <div class="field"><label for="p-ddate">Date</label><input type="date" id="p-ddate"></div>
    <div class="field"><label for="p-dcat">Catégorie</label><select id="p-dcat"></select></div>
    <div class="field"><label for="p-dmt">Montant (FCFA)</label><input type="number" id="p-dmt" min="0" inputmode="decimal" placeholder="0"></div>
    <div class="field"><label for="p-dlot">Lot (facultatif)</label><select id="p-dlot"></select></div>
  </div>
  <div class="field"><label for="p-dnote">Remarque (facultatif)</label><input type="text" id="p-dnote" placeholder="ex. 10 sacs de son de blé"></div>
  <div class="row"><button class="btn" type="button" id="p-dsave">Enregistrer</button><button class="btn ghost" type="button" id="p-dcancel">Annuler</button><span class="msg" id="p-dmsg"></span></div>
</div>
<div id="p-dbars"></div>
<ul class="dlist" id="p-dlist"></ul>
<div class="row"><button class="btn small ghost pbtn" type="button" id="p-dshare">${ICON.share}<span>Partager le bilan du mois</span></button></div>
<p class="note">Les entrées sont les sommes payées sur les factures datées de ce mois.</p>`;
{const after=$("v-listcard");if(after)after.after(kCard)}
CATS.forEach(([k,n])=>{const o=el("option",null,n);o.value=k;$("p-dcat").append(o)});
/* masquer pendant la saisie d'une facture */
{const f=$("v-form");if(f){const sync=()=>{kCard.hidden=!f.hidden};new MutationObserver(sync).observe(f,{attributes:true,attributeFilter:["hidden"]});sync()}}
const monthLbl=m=>new Date(m+"-15T12:00").toLocaleDateString(LOC[lang()]||"fr-FR",{month:"long",year:"numeric"});
const addMonth=(m,n)=>{const d=new Date(m+"-15T12:00");d.setMonth(d.getMonth()+n);return iso(d).slice(0,7)};
function monthSums(m){
  const fac=(A.factures()||[]).filter(f=>(f.date||"").slice(0,7)===m);const enc=fac.reduce((p,f)=>p+(A.facTotals(f).paye||0),0);
  const dep=depenses.filter(d=>(d.date||"").slice(0,7)===m);const out=dep.reduce((p,d)=>p+(Number(d.montant)||0),0);
  return {enc,out,dep,nbFac:fac.filter(f=>A.facTotals(f).paye>0).length,solde:enc-out}}
function renderCaisse(){
  if(!$("p-mlbl"))return;const lb=$("p-mlbl");lb.textContent=monthLbl(dMonth);lb.setAttribute("data-notr","");
  $("p-mnext").disabled=dMonth>=today().slice(0,7);
  const S=monthSums(dMonth);const T=$("p-dtiles");T.innerHTML="";
  const tile=(l,v,sm,cls)=>{const t=el("div","tile"+(cls?" "+cls:""));t.append(el("span",null,l),el("b",null,v));if(sm)t.append(el("small",null,sm));T.append(t)};
  tile("Encaissé",fmt(S.enc)+" F",S.nbFac+" facture(s) payée(s)","ok");tile("Dépenses",fmt(S.out)+" F",S.dep.length+" dépense(s)",S.out?"warn":null);
  tile("Reste",(S.solde<0?"−":"")+fmt(Math.abs(S.solde))+" F",S.solde>=0?"bénéfice":"perte",S.solde>=0?"ok":"bad");
  const BR=$("p-dbars");BR.innerHTML="";if(S.out>0){const by={};S.dep.forEach(d=>{by[d.cat]=(by[d.cat]||0)+(Number(d.montant)||0)});
    const w=el("div","cbars");w.append(el("span","label","Où va l'argent"));Object.entries(by).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>{const r=el("div");r.append(el("span",null,catName(k)),el("b",null,fmt(v)+" F ("+fmt(v/S.out*100)+" %)"));
      const i=el("i");i.style.width=Math.max(2,v/S.out*100)+"%";r.append(i);w.append(r)});BR.append(w)}
  const L=$("p-dlist");L.innerHTML="";
  if(!S.dep.length){L.append(el("li","note","Aucune dépense notée ce mois-ci."));L.firstChild.style.display="block";L.firstChild.style.border="0"}
  const lots=A.lots();
  S.dep.sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:(b.createdAt||0)-(a.createdAt||0)).forEach(d=>{const li=el("li");
    li.append(el("span",null,catName(d.cat)),el("b",null,fmt(Number(d.montant)||0)+" F"));
    const lot=lots.find(x=>x.id===d.lotId);const info=[new Date(d.date+"T12:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short"}),lot&&lot.nom,d.note].filter(Boolean).join(" · ");
    li.append(el("small",null,info));
    if(A.can()){const x=el("button","btn small ghost danger x",dDel===d.id?"Confirmer la suppression":"Supprimer");x.type="button";
      x.onclick=async()=>{if(dDel!==d.id){dDel=d.id;renderCaisse();return}dDel=null;try{await db.doc("depenses/"+d.id).delete()}catch(e){}};li.append(x)}
    L.append(li)});
  $("p-dadd").hidden=!A.can()}
$("p-mprev").onclick=()=>{dMonth=addMonth(dMonth,-1);renderCaisse()};
$("p-mnext").onclick=()=>{if(dMonth<today().slice(0,7)){dMonth=addMonth(dMonth,1);renderCaisse()}};
function openDForm(){const F=$("p-dform");F.hidden=false;$("p-ddate").value=dMonth===today().slice(0,7)?today():dMonth+"-01";$("p-dmt").value="";$("p-dnote").value="";$("p-dmsg").textContent="";
  const S=$("p-dlot");S.innerHTML="";const o=el("option",null,"Aucun lot");o.value="";S.append(o);A.lots().forEach(l=>{const x=el("option",null,l.nom||"Lot");x.value=l.id;x.setAttribute("data-notr","");S.append(x)});
  $("p-dmt").focus()}
$("p-dadd").onclick=openDForm;$("p-dcancel").onclick=()=>{$("p-dform").hidden=true};
$("p-dsave").onclick=async()=>{const mt=Number(String($("p-dmt").value).replace(",","."));const m=$("p-dmsg");
  if(!(mt>0)){m.textContent="Indiquez un montant.";m.className="msg err";return}
  const d={date:$("p-ddate").value||today(),cat:$("p-dcat").value,montant:mt,lotId:$("p-dlot").value||null,note:$("p-dnote").value.trim(),by:B.me,createdAt:Date.now()};
  try{await db.collection("depenses").doc().set(d);$("p-dform").hidden=true;dMonth=d.date.slice(0,7);m.textContent="";renderCaisse()}catch(e){m.textContent="Échec";m.className="msg err"}};
$("p-dshare").onclick=()=>{const S=monthSums(dMonth);const L=["B2A Smart Farming",tr(`Bilan de caisse – « ${monthLbl(dMonth)} »`),"",
  tr(`Entrées : ${fmt(S.enc)} F`),tr(`Dépenses : ${fmt(S.out)} F`),tr(`Reste : ${(S.solde<0?"−":"")+fmt(Math.abs(S.solde))} F`)];
  if(S.out>0){const by={};S.dep.forEach(d=>{by[d.cat]=(by[d.cat]||0)+(Number(d.montant)||0)});L.push("");Object.entries(by).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>L.push("- "+tr(catName(k))+" : "+fmt(v)+" F"))}
  L.push("",tr("Envoyé avec B2A Smart Farming")+" · "+APP_URL);share("B2A Smart Farming",L.join("\n"))};
addEventListener("b2a-factures",debounce(renderCaisse,100));

/* ================= 6. rappels ================= */
const R={
  on:()=>B.lsGet("b2a-rem")==="1",hour:()=>{const h=Number(B.lsGet("b2a-rem-h"));return h>=4&&h<=21?h:7},
  /* soins à venir, regroupés par jour */
  plan(days){const t=today();const end=iso(new Date(Date.now()+days*864e5));const byDay={};let late=0;
    A.lots().forEach(l=>{let prog=[];try{prog=A.programme(l)}catch(e){}
      prog.forEach(p=>{if(p.done)return;if(p.date<t){late++;return}if(p.date>end)return;(byDay[p.date]=byDay[p.date]||[]).push({p,l})})});
    return {byDay,late}},
  text(items,multi){return items.map(({p,l})=>tr(p.nom)+(multi?" ("+(l.nom||"")+")":"")).join(" · ")},
  async schedule(){
    const LN=plug("LocalNotifications");if(!LN)return null;
    try{const pend=await LN.getPending();const ids=(pend&&pend.notifications||[]).map(n=>({id:n.id}));if(ids.length)await LN.cancel({notifications:ids})}catch(e){}
    if(!this.on())return 0;
    const {byDay,late}=this.plan(60);const multi=A.lots().length>1;const now=Date.now();const list=[];
    Object.keys(byDay).sort().forEach(d=>{const at=new Date(d+"T"+pad(this.hour())+":00:00");if(at.getTime()<=now+60000)return;
      list.push({id:Number(d.replace(/-/g,""))%2147483647,title:tr("Soins du jour")+" · B2A Smart Farming",body:this.text(byDay[d],multi),largeBody:this.text(byDay[d],multi),
        schedule:{at,allowWhileIdle:true},extra:{tab:"calendrier"}})});
    if(late){const d=new Date();d.setDate(d.getDate()+(d.getHours()>=this.hour()?1:0));d.setHours(this.hour(),5,0,0);
      list.push({id:99,title:tr(`${late} soin(s) en retard`),body:tr("Ouvrez l'application pour les marquer faits."),schedule:{at:d,allowWhileIdle:true},extra:{tab:"calendrier"}})}
    const L2=list.slice(0,60);if(L2.length)await LN.schedule({notifications:L2});return L2.length},
  /* navigateur : notification à l'ouverture, une fois par jour */
  async webCheck(){if(isNative()||!this.on()||!("Notification" in window)||Notification.permission!=="granted")return;
    if(new Date().getHours()<this.hour()||B.lsGet("b2a-rem-last")===today())return;
    const {byDay,late}=this.plan(0);const items=byDay[today()]||[];if(!items.length&&!late)return;
    const body=[items.length?tr("Aujourd'hui")+" : "+this.text(items,A.lots().length>1):null,late?tr(`${late} soin(s) en retard`):null].filter(Boolean).join("\n");
    B.lsSet("b2a-rem-last",today());
    try{const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();const o={body,icon:"icons/icon-192.png",badge:"icons/icon-192.png",tag:"b2a-soins"};
      if(reg&&reg.showNotification)await reg.showNotification(tr("Soins du jour"),o);else new Notification(tr("Soins du jour"),o)}catch(e){}},
  async enable(){const msg=$("p-rmsg");
    const LN=plug("LocalNotifications");
    if(LN){let p=await LN.checkPermissions().catch(()=>({display:"prompt"}));if(p.display!=="granted")p=await LN.requestPermissions().catch(()=>({display:"denied"}));
      if(p.display!=="granted"){msg.textContent="Les notifications sont bloquées. Autorisez-les dans les réglages du téléphone.";msg.className="msg err";return false}}
    else{if(!("Notification" in window)){msg.textContent="Ce navigateur ne peut pas afficher de notifications.";msg.className="msg err";return false}
      let p=Notification.permission;if(p==="default")p=await Notification.requestPermission();
      if(p!=="granted"){msg.textContent="Les notifications sont bloquées. Autorisez-les dans les réglages du téléphone.";msg.className="msg err";return false}}
    B.lsSet("b2a-rem","1");return true}
};
const resched=debounce(async()=>{try{const n=await R.schedule();if(n!=null)lastCount=n;renderRemStatus()}catch(e){console.warn(e)}R.webCheck()},2500);
let lastCount=null;
addEventListener("b2a-data",resched);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)resched()});
setInterval(()=>R.webCheck(),30*60*1000);
{const LN=plug("LocalNotifications");if(LN&&LN.addListener)LN.addListener("localNotificationActionPerformed",a=>{try{const tab=a&&a.notification&&a.notification.extra&&a.notification.extra.tab;if(tab)A.show(tab)}catch(e){}})}

/* ================= 7. réglages ================= */
const setIn=document.querySelector("#x-set .sheet-in");
if(setIn){
  const anchor=setIn.querySelector("#x-inst")||setIn.lastElementChild;
  const s1=el("section","card");s1.innerHTML=`<h3 class="sec">Affichage et voix</h3>
    <div class="field"><span class="label">Taille du texte</span><div class="seg3" id="p-zoom" role="group" aria-label="Taille du texte"><button type="button" data-z="n">Normale</button><button type="button" data-z="g">Grande</button><button type="button" data-z="tg">Très grande</button></div></div>
    <label class="toggle"><input type="checkbox" id="p-sun"><span>Mode plein soleil</span></label>
    <p class="note">Contraste renforcé, fond blanc et texte noir : plus lisible dehors.</p>
    <div class="field" id="p-ttsbox"><span class="label">Vitesse de la voix</span><div class="seg3" id="p-rate" role="group" aria-label="Vitesse de la voix"><button type="button" data-r="0.75">Lente</button><button type="button" data-r="0.9">Normale</button><button type="button" data-r="1.1">Rapide</button></div>
      <div class="row"><button class="btn small ghost pbtn" type="button" id="p-ttstest">${ICON.spk}<span>Essayer la voix</span></button></div></div>
    <p class="note" id="p-ttsno" hidden>La lecture à voix haute n'est pas disponible sur ce téléphone.</p>`;
  const s2=el("section","card");s2.innerHTML=`<h3 class="sec">Rappels</h3>
    <p class="note">Recevoir un rappel le matin pour les vaccins, traitements et travaux du jour.</p>
    <div class="row"><button class="btn small" type="button" id="p-ron">Activer les rappels</button>
      <label for="p-rh" class="note" style="font-size:14px">Heure du rappel</label><select id="p-rh" style="max-width:110px"></select>
      <button class="btn small ghost" type="button" id="p-rtest" hidden>Tester</button></div>
    <p class="msg" id="p-rmsg" aria-live="polite"></p><p class="note" id="p-rst"></p>`;
  const s3=el("section","card");s3.innerHTML=`<h3 class="sec">Faire connaître l'application</h3>
    <p class="note">Envoyez l'application à un autre éleveur par WhatsApp, SMS ou Bluetooth. Elle est gratuite.</p>
    <div class="row"><button class="btn small pbtn" type="button" id="p-sendapp">${ICON.share}<span>Envoyer l'application à un ami</span></button><button class="btn small ghost" type="button" id="p-copy">Copier le lien</button><span class="msg" id="p-smsg"></span></div>`;
  setIn.insertBefore(s1,anchor);setIn.insertBefore(s2,anchor);setIn.insertBefore(s3,anchor);
  for(let h=5;h<=20;h++){const o=el("option",null,pad(h)+":00");o.value=String(h);o.setAttribute("data-notr","");$("p-rh").append(o)}
}
function renderDisplay(){const z=B.lsGet("b2a-zoom")||"n";document.querySelectorAll("#p-zoom button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.z===z)));
  $("p-sun").checked=B.lsGet("b2a-sun")==="1";const r=String(Speech.rate());document.querySelectorAll("#p-rate button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.r===r)));
  $("p-ttsbox").hidden=!Speech.can();$("p-ttsno").hidden=Speech.can()}
function renderRemStatus(){if(!$("p-ron"))return;const on=R.on();$("p-ron").textContent=on?"Désactiver":"Activer les rappels";$("p-ron").className="btn small"+(on?" ghost":"");
  $("p-rh").value=String(R.hour());$("p-rtest").hidden=!on;
  $("p-rst").textContent=!on?"":isNative()?(lastCount!=null?tr(`${lastCount} rappel(s) programmé(s) sur ce téléphone, même application fermée et sans internet.`):""):"Dans le navigateur, le rappel s'affiche quand vous ouvrez l'application. Pour être prévenu même application fermée, installez l'application Android."}
if($("p-zoom")){
  document.querySelectorAll("#p-zoom button").forEach(b=>b.onclick=()=>{B.lsSet("b2a-zoom",b.dataset.z==="n"?null:b.dataset.z);applyDisplay();renderDisplay()});
  $("p-sun").onchange=()=>{B.lsSet("b2a-sun",$("p-sun").checked?"1":null);applyDisplay();if(!$("p-sun").checked){const tc=document.querySelector('meta[name="theme-color"]');if(tc)tc.content="#ffffff"}};
  document.querySelectorAll("#p-rate button").forEach(b=>b.onclick=()=>{B.lsSet("b2a-tts-rate",b.dataset.r);renderDisplay()});
  $("p-ttstest").onclick=()=>Speech.say(tr("Bonjour. Je lis les alertes, les bilans et le guide santé à voix haute."),null);
  $("p-ron").onclick=async()=>{const m=$("p-rmsg");m.textContent="";m.className="msg";
    if(R.on()){B.lsSet("b2a-rem",null);await R.schedule().catch(()=>{});lastCount=null;m.textContent="Rappels désactivés.";renderRemStatus();return}
    if(await R.enable()){m.textContent="Rappels activés.";m.className="msg ok";lastCount=await R.schedule().catch(()=>null);B.lsSet("b2a-rem-last",null);R.webCheck();renderRemStatus()}};
  $("p-rh").onchange=async()=>{B.lsSet("b2a-rem-h",$("p-rh").value);B.lsSet("b2a-rem-last",null);lastCount=await R.schedule().catch(()=>null);renderRemStatus()};
  $("p-rtest").onclick=async()=>{const LN=plug("LocalNotifications");const body=tr("Rappel de test : les rappels fonctionnent.");
    try{if(LN)await LN.schedule({notifications:[{id:98,title:"B2A Smart Farming",body,schedule:{at:new Date(Date.now()+5000),allowWhileIdle:true}}]});
      else{const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();if(reg&&reg.showNotification)await reg.showNotification("B2A Smart Farming",{body,icon:"icons/icon-192.png"});else new Notification("B2A Smart Farming",{body})}}catch(e){}};
  $("p-sendapp").onclick=()=>share("B2A Smart Farming",appMessage());
  $("p-copy").onclick=async()=>{try{await navigator.clipboard.writeText(appMessage());$("p-smsg").textContent="Lien copié."}catch(e){window.prompt("",APP_URL)}};
  $("x-set")&&new MutationObserver(()=>{if(!$("x-set").hidden){renderDisplay();renderRemStatus()}}).observe($("x-set"),{attributes:true,attributeFilter:["hidden"]});
}

/* ================= données ================= */
B.getDb().then(d=>{db=d;
  db.collection("contacts").onSnapshot(s=>{contacts=s.docs.map(x=>({id:x.id,...x.data()}));renderContacts()},()=>{});
  db.collection("depenses").orderBy("date","desc").limit(2000).onSnapshot(s=>{depenses=s.docs.map(x=>({id:x.id,...x.data()}));renderCaisse()},()=>{});
  resched()}).catch(()=>{cCard.hidden=true;kCard.hidden=true});
renderContacts();renderCaisse();
})();
