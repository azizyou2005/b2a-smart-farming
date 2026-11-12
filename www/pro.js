/* B2A Smart Farming : version Pro (payante) — B2A-HIGH-TECHNOLOGY-AUTOMATION · Bayere Abdoul Aziz
   Trois onglets en bas de chaque lot :
   1. Formation : vidéos et PDF de formation choisis selon l'espèce et l'âge du lot, téléchargeables pour le hors connexion.
   2. Contrôle : mesures (température, humidité, eau) enregistrées pour l'étude, avec plages conseillées, alertes et export.
   3. Vétérinaire : validation payante des vaccins par un vétérinaire en ligne dans Services (commission B2A à la validation).
   L'abonnement Pro (1, 3 ou 12 mois) se paie par Orange Money ou Moov Money ; B2A vérifie le paiement dans utilisateurs.html.

   Données (Firestore) :
   pro_fermes/<clé>          { finLe, formule }               clé = code de la ferme, ou « u_ » + identifiant sans ferme (écrit par B2A)
   pro_paiements/<id>        { uid, cle, nom, formule, mois, montant, ref, telPayeur, statut, creeLe }
   formations/<id>           { titre, desc, type: video|pdf, especes[], semDe, semA, url, taille, duree, ordre, publie }  (écrit par B2A)
   veto_demandes/<id>        { eleveur, eleveurNom, eleveurTel, cle, lotId, lot{}, vaccins[], veto, vetoNom, statut, message,
                               tarif, telPaiement, reponse, refPaiement, resultats{}, commentaire, signature, valideLe, taux, commission, comStatut }
   farms/<code>/mesures/<id> { lotId, date, heure, temp, hum, eau, alim, nh3, co2, t1, t2, t3, note, source (dispositif|demo), by, t }
   marche_config/global      { proM1, proM3, proM12, vetoTaux, telPaiement, nomPaiement }  (écrit par B2A) */
(function(){
const B=window.B2A;if(!B||!B.app)return;const A=B.app;
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const notr=e=>{e.setAttribute("data-notr","");return e};
const tr=s=>window.__tr?window.__tr(s):s;
const fmt=(v,d=0)=>v==null||!isFinite(v)?"—":Number(v).toLocaleString("fr-FR",{maximumFractionDigits:d,minimumFractionDigits:d});
const ms=v=>v==null?0:typeof v==="number"?v:v.toMillis?v.toMillis():v.seconds?v.seconds*1000:0;
const dlong=t=>new Date(t).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});
const pad=n=>String(n).padStart(2,"0");
const today=()=>{const d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())};
const nowHM=()=>{const d=new Date();return pad(d.getHours())+":"+pad(d.getMinutes())};
const N=v=>{if(v===""||v==null)return null;const n=Number(String(v).replace(",","."));return isFinite(n)?n:null};
const digits=s=>String(s||"").replace(/\D/g,"");
const okImg=u=>typeof u==="string"&&/^data:image\/(jpeg|png|webp);base64,/.test(u);
const LS_PRO="b2a-pro-fin",LS_FORM="b2a-formations",LS_CAT="b2a-formations-cat",CACHE_F="b2a-formations-v1";
/* catalogue des formations créées par B2A (vidéos et PDF publiés sur le site, branche « formations » du dépôt) */
const CAT_URL="https://azizyou2005.github.io/b2a-smart-farming/formations/catalogue.json";

/* ================= traductions ================= */
const T={
"Formation":["Training","Formazione","Formación"],"Contrôle":["Monitoring","Controllo","Control"],"Vétérinaire":["Vet","Veterinario","Veterinario"],
"Version Pro":["Pro version","Versione Pro","Versión Pro"],"Fonction de la version Pro":["Pro version feature","Funzione della versione Pro","Función de la versión Pro"],
"la simulation complète d'un nouveau projet d'élevage ou de culture : dépenses, bâtiments, surface et plan de construction.":["a full simulation of a new livestock or crop project: costs, buildings, area and building plan.","la simulazione completa di un nuovo progetto di allevamento o coltivazione: spese, edifici, superficie e piano di costruzione.","la simulación completa de un nuevo proyecto ganadero o agrícola: gastos, edificios, superficie y plano de construcción."],
"Avec la version Pro, vous avez :":["With the Pro version you get:","Con la versione Pro hai:","Con la versión Pro tiene:"],
"Avec la version Pro, chaque lot vous donne :":["With the Pro version, each batch gives you:","Con la versione Pro, ogni lotto ti offre:","Con la versión Pro, cada lote le ofrece:"],
"des vidéos et des fiches PDF de formation adaptées à l'âge du lot, à garder sur le téléphone ;":["training videos and PDF sheets suited to the batch age, kept on the phone;","video e schede PDF di formazione adatte all'età del lotto, da tenere sul telefono;","vídeos y fichas PDF de formación según la edad del lote, guardados en el teléfono;"],
"l'enregistrement des mesures (température, humidité, eau) avec alertes et export pour l'étude ;":["recording of measurements (temperature, humidity, water) with alerts and export for analysis;","la registrazione delle misure (temperatura, umidità, acqua) con allarmi ed esportazione per lo studio;","el registro de mediciones (temperatura, humedad, agua) con alertas y exportación para el estudio;"],
"la validation de vos vaccins par le vétérinaire de votre choix (service payant) ;":["validation of your vaccines by the vet of your choice (paid service);","la convalida dei vaccini da parte del veterinario scelto (servizio a pagamento);","la validación de sus vacunas por el veterinario que elija (servicio de pago);"],
"l'étude du marché en temps réel et le prix de vente conseillé pour vos animaux, produits et matériel.":["real-time market study and suggested selling price for your animals, products and equipment.","lo studio di mercato in tempo reale e il prezzo di vendita consigliato per animali, prodotti e materiale.","el estudio de mercado en tiempo real y el precio de venta aconsejado para sus animales, productos y material."],
"Toute l'équipe de la ferme en profite avec un seul abonnement.":["The whole farm team benefits from a single subscription.","Tutta la squadra della fattoria ne approfitta con un solo abbonamento.","Todo el equipo de la granja lo aprovecha con una sola suscripción."],
"1 mois":["1 month","1 mese","1 mes"],"3 mois":["3 months","3 mesi","3 meses"],"12 mois":["12 months","12 mesi","12 meses"],
"Activer la version Pro":["Activate the Pro version","Attiva la versione Pro","Activar la versión Pro"],
"Envoyez {0} FCFA par Orange Money ou Moov Money au numéro ci-dessous, puis indiquez la référence du paiement.":["Send {0} FCFA by Orange Money or Moov Money to the number below, then enter the payment reference.","Invia {0} FCFA con Orange Money o Moov Money al numero qui sotto, poi indica il riferimento del pagamento.","Envíe {0} FCFA por Orange Money o Moov Money al número de abajo y luego indique la referencia del pago."],
"Numéro de paiement":["Payment number","Numero di pagamento","Número de pago"],"Bénéficiaire":["Recipient","Beneficiario","Beneficiario"],
"Référence du paiement":["Payment reference","Riferimento del pagamento","Referencia del pago"],"Téléphone qui a payé":["Phone that paid","Telefono che ha pagato","Teléfono que pagó"],
"J'ai payé : envoyer la référence":["I have paid: send the reference","Ho pagato: invia il riferimento","He pagado: enviar la referencia"],
"Paiement envoyé : B{0}A le vérifie et active la version Pro.":["Payment sent: B{0}A checks it and activates the Pro version.","Pagamento inviato: B{0}A lo verifica e attiva la versione Pro.","Pago enviado: B{0}A lo verifica y activa la versión Pro."],
"Paiement en cours de vérification par B{0}A.":["Payment being checked by B{0}A.","Pagamento in verifica da parte di B{0}A.","Pago en verificación por B{0}A."],
"Paiement refusé :":["Payment refused:","Pagamento rifiutato:","Pago rechazado:"],
"Le numéro de paiement n'est pas encore disponible. Contactez B{0}A sur WhatsApp.":["The payment number is not available yet. Contact B{0}A on WhatsApp.","Il numero di pagamento non è ancora disponibile. Contatta B{0}A su WhatsApp.","El número de pago aún no está disponible. Contacte a B{0}A por WhatsApp."],
"Indiquez la référence du paiement.":["Enter the payment reference.","Indica il riferimento del pagamento.","Indique la referencia del pago."],
"Indiquez le téléphone qui a payé.":["Enter the phone that paid.","Indica il telefono che ha pagato.","Indique el teléfono que pagó."],
"Envoi impossible. Vérifiez la connexion et réessayez.":["Sending failed. Check the connection and try again.","Invio impossibile. Verifica la connessione e riprova.","Envío imposible. Compruebe la conexión e inténtelo de nuevo."],
"La version Pro demande une connexion internet et un compte (inscription).":["The Pro version needs an internet connection and an account (registration).","La versione Pro richiede una connessione internet e un account (iscrizione).","La versión Pro requiere conexión a internet y una cuenta (registro)."],
"Version Pro active jusqu'au {0}":["Pro version active until {0}","Versione Pro attiva fino al {0}","Versión Pro activa hasta el {0}"],
"Renouveler":["Renew","Rinnova","Renovar"],
/* formation */
"Formations pour ce lot":["Training for this batch","Formazione per questo lotto","Formación para este lote"],
"Pour l'âge du lot (semaine {0})":["For the batch age (week {0})","Per l'età del lotto (settimana {0})","Para la edad del lote (semana {0})"],
"Toutes les formations de l'espèce":["All training for the species","Tutta la formazione della specie","Toda la formación de la especie"],
"Aucune formation n'est encore publiée pour cette espèce. B{0}A ajoute régulièrement de nouvelles vidéos et fiches.":["No training is published yet for this species. B{0}A regularly adds new videos and sheets.","Nessuna formazione ancora pubblicata per questa specie. B{0}A aggiunge regolarmente nuovi video e schede.","Aún no hay formación publicada para esta especie. B{0}A añade regularmente nuevos vídeos y fichas."],
"Vidéo":["Video","Video","Vídeo"],"Fiche PDF":["PDF sheet","Scheda PDF","Ficha PDF"],
"Regarder":["Watch","Guarda","Ver"],"Lire":["Read","Leggi","Leer"],
"Garder sur le téléphone":["Keep on the phone","Tieni sul telefono","Guardar en el teléfono"],"Sur le téléphone ✓":["On the phone ✓","Sul telefono ✓","En el teléfono ✓"],
"Retirer du téléphone":["Remove from the phone","Rimuovi dal telefono","Quitar del teléfono"],"Téléchargement…":["Downloading…","Download…","Descargando…"],
"Téléchargement impossible. Réessayez avec une bonne connexion (Wi-Fi conseillé).":["Download failed. Try again with a good connection (Wi-Fi recommended).","Download impossibile. Riprova con una buona connessione (Wi-Fi consigliato).","Descarga imposible. Inténtelo con una buena conexión (Wi-Fi recomendado)."],
"Sans internet, seules les formations gardées sur le téléphone s'ouvrent.":["Without internet, only training kept on the phone opens.","Senza internet si aprono solo le formazioni tenute sul telefono.","Sin internet, solo se abre la formación guardada en el teléfono."],
"Les vidéos sont lourdes : téléchargez-les en Wi-Fi.":["Videos are large: download them on Wi-Fi.","I video sono pesanti: scaricali in Wi-Fi.","Los vídeos pesan mucho: descárguelos con Wi-Fi."],
"Fermer":["Close","Chiudi","Cerrar"],"Mo":["MB","MB","MB"],"min":["min","min","min"],
/* contrôle */
"Nouvelle mesure":["New measurement","Nuova misura","Nueva medición"],"Date":["Date","Data","Fecha"],"Heure":["Time","Ora","Hora"],
"Température (°C)":["Temperature (°C)","Temperatura (°C)","Temperatura (°C)"],"Humidité (%)":["Humidity (%)","Umidità (%)","Humedad (%)"],
"Eau consommée (litres)":["Water used (litres)","Acqua consumata (litri)","Agua consumida (litros)"],"Remarque (facultatif)":["Note (optional)","Nota (facoltativa)","Nota (opcional)"],
"Enregistrer la mesure":["Save the measurement","Salva la misura","Guardar la medición"],"Mesure enregistrée.":["Measurement saved.","Misura salvata.","Medición guardada."],
"Indiquez au moins une valeur.":["Enter at least one value.","Indica almeno un valore.","Indique al menos un valor."],
"Plage conseillée pour l'âge du lot :":["Recommended range for the batch age:","Intervallo consigliato per l'età del lotto:","Rango recomendado para la edad del lote:"],
"Température {0} à {1} °C · humidité {2} à {3} %":["Temperature {0} to {1} °C · humidity {2} to {3} %","Temperatura da {0} a {1} °C · umidità da {2} a {3} %","Temperatura de {0} a {1} °C · humedad de {2} a {3} %"],
"Dernière mesure":["Last measurement","Ultima misura","Última medición"],"Moyenne 7 j":["7-day average","Media 7 g","Media 7 d"],"Min / max 7 j":["Min / max 7 d","Min / max 7 g","Mín / máx 7 d"],
"Hors plage 7 j":["Out of range 7 d","Fuori intervallo 7 g","Fuera de rango 7 d"],"Eau 7 j":["Water 7 d","Acqua 7 g","Agua 7 d"],
"Température":["Temperature","Temperatura","Temperatura"],"Humidité":["Humidity","Umidità","Humedad"],"Eau":["Water","Acqua","Agua"],"Remarque":["Note","Nota","Nota"],"Par":["By","Da","Por"],
"Trop chaud : {0} °C (conseillé {1} à {2} °C). Aérez, ombragez, donnez de l'eau fraîche.":["Too hot: {0} °C (recommended {1} to {2} °C). Ventilate, shade, give cool water.","Troppo caldo: {0} °C (consigliato da {1} a {2} °C). Arieggiare, fare ombra, dare acqua fresca.","Demasiado calor: {0} °C (recomendado de {1} a {2} °C). Ventile, dé sombra y agua fresca."],
"Trop froid : {0} °C (conseillé {1} à {2} °C). Chauffez et fermez les courants d'air.":["Too cold: {0} °C (recommended {1} to {2} °C). Heat and close draughts.","Troppo freddo: {0} °C (consigliato da {1} a {2} °C). Riscaldare e chiudere le correnti d'aria.","Demasiado frío: {0} °C (recomendado de {1} a {2} °C). Caliente y cierre las corrientes de aire."],
"Humidité hors plage : {0} % (conseillé {1} à {2} %).":["Humidity out of range: {0} % (recommended {1} to {2} %).","Umidità fuori intervallo: {0} % (consigliato da {1} a {2} %).","Humedad fuera de rango: {0} % (recomendado de {1} a {2} %)."],
"Dernière mesure dans la plage conseillée.":["Last measurement within the recommended range.","Ultima misura nell'intervallo consigliato.","Última medición dentro del rango recomendado."],
"Exporter (Excel)":["Export (Excel)","Esporta (Excel)","Exportar (Excel)"],"Aucune mesure pour ce lot.":["No measurement for this batch.","Nessuna misura per questo lotto.","Ninguna medición para este lote."],
"Le graphique apparaît après 2 mesures.":["The chart appears after 2 measurements.","Il grafico appare dopo 2 misure.","El gráfico aparece después de 2 mediciones."],
"Température (30 dernières mesures)":["Temperature (last 30 measurements)","Temperatura (ultime 30 misure)","Temperatura (últimas 30 mediciones)"],
"Bande verte : plage conseillée":["Green band: recommended range","Fascia verde: intervallo consigliato","Banda verde: rango recomendado"],
"Touchez une ligne pour la supprimer.":["Touch a row to delete it.","Tocca una riga per eliminarla.","Toque una fila para borrarla."],"Supprimer cette mesure ?":["Delete this measurement?","Eliminare questa misura?","¿Borrar esta medición?"],
"Bientôt : les mesures du dispositif B{0}A arriveront toutes seules.":["Coming soon: B{0}A device measurements will arrive automatically.","Presto: le misure del dispositivo B{0}A arriveranno da sole.","Pronto: las mediciones del dispositivo B{0}A llegarán solas."],
/* vétérinaire */
"Vaccins du lot":["Batch vaccines","Vaccini del lotto","Vacunas del lote"],"Validé par":["Validated by","Convalidato da","Validado por"],
"En attente du vétérinaire":["Waiting for the vet","In attesa del veterinario","Esperando al veterinario"],"Non validé":["Not validated","Non convalidato","No validado"],"Refusé par le vétérinaire":["Refused by the vet","Rifiutato dal veterinario","Rechazado por el veterinario"],
"Aucun vaccin fait n'est encore noté pour ce lot. Cochez les vaccins faits dans le Calendrier.":["No vaccine done is recorded yet for this batch. Tick the vaccines done in the Calendar.","Nessun vaccino fatto è ancora registrato per questo lotto. Spunta i vaccini fatti nel Calendario.","Aún no hay vacunas hechas registradas para este lote. Marque las vacunas hechas en el Calendario."],
"Faire valider par un vétérinaire":["Have them validated by a vet","Fai convalidare da un veterinario","Hacer validar por un veterinario"],
"Le vétérinaire vérifie vos vaccins et les valide. C'est un service payant : il vous indique son tarif avant de commencer. Un carnet validé rassure vos acheteurs sur le Marché.":["The vet checks your vaccines and validates them. It is a paid service: the vet tells you the fee before starting. A validated record reassures your buyers on the Market.","Il veterinario controlla i vaccini e li convalida. È un servizio a pagamento: ti indica la sua tariffa prima di iniziare. Un libretto convalidato rassicura i tuoi acquirenti sul Mercato.","El veterinario revisa sus vacunas y las valida. Es un servicio de pago: le indica su tarifa antes de empezar. Un registro validado tranquiliza a sus compradores en el Mercado."],
"Choisir le vétérinaire":["Choose the vet","Scegli il veterinario","Elegir el veterinario"],"Choisir…":["Choose…","Scegli…","Elegir…"],
"Aucun vétérinaire n'est en ligne pour le moment dans Services.":["No vet is online in Services at the moment.","Nessun veterinario è online al momento in Servizi.","No hay ningún veterinario en línea en Servicios por ahora."],
"Vaccins à faire valider":["Vaccines to validate","Vaccini da convalidare","Vacunas a validar"],"Produit utilisé (facultatif)":["Product used (optional)","Prodotto usato (facoltativo)","Producto usado (opcional)"],
"N° de lot du flacon (facultatif)":["Vial batch no. (optional)","N° di lotto del flacone (facoltativo)","N.º de lote del frasco (opcional)"],"Photo du flacon (facultatif)":["Vial photo (optional)","Foto del flacone (facoltativa)","Foto del frasco (opcional)"],
"Votre téléphone":["Your phone","Il tuo telefono","Su teléfono"],"Message au vétérinaire (facultatif)":["Message to the vet (optional)","Messaggio al veterinario (facoltativo)","Mensaje al veterinario (opcional)"],
"Envoyer la demande":["Send the request","Invia la richiesta","Enviar la solicitud"],"Demande envoyée au vétérinaire.":["Request sent to the vet.","Richiesta inviata al veterinario.","Solicitud enviada al veterinario."],
"Choisissez un vétérinaire.":["Choose a vet.","Scegli un veterinario.","Elija un veterinario."],"Cochez au moins un vaccin.":["Tick at least one vaccine.","Spunta almeno un vaccino.","Marque al menos una vacuna."],
"Indiquez votre téléphone.":["Enter your phone.","Indica il tuo telefono.","Indique su teléfono."],"Photo trop grande.":["Photo too large.","Foto troppo grande.","Foto demasiado grande."],
"Mes demandes pour ce lot":["My requests for this batch","Le mie richieste per questo lotto","Mis solicitudes para este lote"],
"En attente de réponse":["Waiting for reply","In attesa di risposta","Esperando respuesta"],"Acceptée : à payer":["Accepted: to pay","Accettata: da pagare","Aceptada: por pagar"],
"Payée : validation en cours":["Paid: validation in progress","Pagata: convalida in corso","Pagada: validación en curso"],"Validée":["Validated","Convalidata","Validada"],"Refusée":["Refused","Rifiutata","Rechazada"],"Annulée":["Cancelled","Annullata","Cancelada"],
"Tarif du vétérinaire : {0} FCFA":["Vet fee: {0} FCFA","Tariffa del veterinario: {0} FCFA","Tarifa del veterinario: {0} FCFA"],
"Payez directement le vétérinaire par Orange Money ou Moov Money, puis indiquez la référence.":["Pay the vet directly by Orange Money or Moov Money, then enter the reference.","Paga direttamente il veterinario con Orange Money o Moov Money, poi indica il riferimento.","Pague directamente al veterinario por Orange Money o Moov Money y luego indique la referencia."],
"Numéro du vétérinaire":["Vet's number","Numero del veterinario","Número del veterinario"],"Annuler la demande":["Cancel the request","Annulla la richiesta","Cancelar la solicitud"],
"Réponse du vétérinaire :":["Vet's reply:","Risposta del veterinario:","Respuesta del veterinario:"],"Commentaire du vétérinaire :":["Vet's comment:","Commento del veterinario:","Comentario del veterinario:"],
"Validé le {0}":["Validated on {0}","Convalidato il {0}","Validado el {0}"],"Conforme":["Compliant","Conforme","Conforme"],"Non conforme":["Not compliant","Non conforme","No conforme"],
"Partager le carnet validé":["Share the validated record","Condividi il libretto convalidato","Compartir el registro validado"],
/* espace vétérinaire */
"Demandes de validation des vaccins":["Vaccine validation requests","Richieste di convalida dei vaccini","Solicitudes de validación de vacunas"],
"Les éleveurs vous demandent de valider leurs vaccins. Fixez votre tarif, faites-vous payer directement, puis validez. Une commission B{0}A de {0} % du tarif est due à chaque validation.":["Farmers ask you to validate their vaccines. Set your fee, get paid directly, then validate. A B{0}A commission of {0} % of the fee is due for each validation.","Gli allevatori ti chiedono di convalidare i loro vaccini. Fissa la tua tariffa, fatti pagare direttamente, poi convalida. Per ogni convalida è dovuta a B{0}A una commissione del {0} % della tariffa.","Los ganaderos le piden validar sus vacunas. Fije su tarifa, cobre directamente y luego valide. Se debe una comisión B{0}A del {0} % de la tarifa por cada validación."],
"Aucune demande pour le moment.":["No request at the moment.","Nessuna richiesta al momento.","Ninguna solicitud por ahora."],
"Votre tarif (FCFA)":["Your fee (FCFA)","La tua tariffa (FCFA)","Su tarifa (FCFA)"],"Numéro où l'éleveur vous paie":["Number where the farmer pays you","Numero dove l'allevatore ti paga","Número donde el ganadero le paga"],
"Message à l'éleveur (facultatif)":["Message to the farmer (optional)","Messaggio all'allevatore (facoltativo)","Mensaje al ganadero (opcional)"],
"Accepter":["Accept","Accetta","Aceptar"],"Refuser":["Refuse","Rifiuta","Rechazar"],"Confirmer le refus":["Confirm refusal","Conferma il rifiuto","Confirmar el rechazo"],
"Indiquez votre tarif.":["Enter your fee.","Indica la tua tariffa.","Indique su tarifa."],"Référence du paiement de l'éleveur :":["Farmer's payment reference:","Riferimento del pagamento dell'allevatore:","Referencia del pago del ganadero:"],
"Vérifiez le paiement reçu avant de valider.":["Check the payment received before validating.","Verifica il pagamento ricevuto prima di convalidare.","Verifique el pago recibido antes de validar."],
"Commentaire (facultatif)":["Comment (optional)","Commento (facoltativo)","Comentario (opcional)"],"Valider les vaccins":["Validate the vaccines","Convalida i vaccini","Validar las vacunas"],
"Confirmer la validation":["Confirm validation","Conferma la convalida","Confirmar la validación"],"Commission B{0}A due : {0} FCFA":["B{0}A commission due: {0} FCFA","Commissione B{0}A dovuta: {0} FCFA","Comisión B{0}A debida: {0} FCFA"],
"Commission réglée":["Commission paid","Commissione pagata","Comisión pagada"],"Éleveur":["Farmer","Allevatore","Ganadero"],"Lot":["Batch","Lotto","Lote"],
"Effectif":["Headcount","Effettivo","Efectivo"],"Effectif {0}":["Headcount {0}","Effettivo {0}","Efectivo {0}"],"âge ≈ {0} sem.":["age ≈ {0} wk","età ≈ {0} sett.","edad ≈ {0} sem."],"fait le {0}":["done on {0}","fatto il {0}","hecho el {0}"],
"Produit :":["Product:","Prodotto:","Producto:"],"N° de lot :":["Batch no.:","N° di lotto:","N.º de lote:"],"Échec. Réessayez.":["Failed. Try again.","Errore. Riprova.","Error. Inténtelo de nuevo."]
};
{const D=window.B2A_DICT=window.B2A_DICT||{};["en","it","es"].forEach((l,i)=>{D[l]=D[l]||{};for(const k in T)if(D[l][k]==null)D[l][k]=T[k][i]})}

/* ================= styles ================= */
const css=el("style");css.textContent=`
.pro-lock{border:1px solid var(--line);border-radius:14px;padding:16px;display:grid;gap:12px;background:var(--surface)}
.pro-lock h3{margin:0;font:800 18px var(--display);color:var(--ink)}.pro-badge{display:inline-block;background:#1b2e4c;color:#fff;font:800 11px var(--body);letter-spacing:.08em;border-radius:6px;padding:3px 8px;margin-right:6px}
.pro-lock ul{margin:0;padding-left:18px;display:grid;gap:4px}
.pro-plans{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.pro-plans button{border:1px solid var(--line);background:var(--bg);border-radius:12px;padding:10px 6px;font:700 14px var(--body);cursor:pointer;color:var(--ink)}
.pro-plans button[aria-pressed="true"]{border-color:var(--leaf);background:var(--surface);box-shadow:0 0 0 2px var(--leaf) inset}.pro-plans b{display:block;font:800 16px var(--display)}
.pro-pay{background:var(--bg);border-radius:12px;padding:12px;display:grid;gap:4px}.pro-pay b{font:800 18px var(--display)}
.pro-ok{font:600 13px var(--body);color:var(--leaf);display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.fo-list{display:grid;gap:10px}.fo-it{border:1px solid var(--line);border-radius:12px;padding:12px;display:grid;gap:6px;background:var(--surface)}
.fo-it .fo-h{display:flex;gap:10px;align-items:flex-start}.fo-ic{flex:none;width:38px;height:38px;border-radius:10px;display:grid;place-items:center;background:var(--bg);font-size:18px}
.fo-it b{font:700 15px var(--body)}.fo-it small{color:var(--muted)}.fo-btns{display:flex;gap:8px;flex-wrap:wrap}
.fo-now{border-color:var(--leaf)}
.pro-modal{position:fixed;inset:0;z-index:9000;background:rgb(0 0 0/.8);display:grid;place-items:center;padding:12px}
.pro-modal video{width:100%;max-height:78vh;background:#000;border-radius:10px}.pro-modal .in{width:min(900px,100%);display:grid;gap:8px}
.pro-modal button{justify-self:end}
.me-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.me-form .full{grid-column:1/-1}
.me-manuel summary{cursor:pointer;padding:2px 0}.me-manuel[open] summary{margin-bottom:10px}.pe-src{margin:8px 0 0;padding-left:18px;display:grid;gap:6px;font-size:.92em}.pe-src a{color:var(--accent,#2f7d32);word-break:break-word}[data-pe] details summary{cursor:pointer;font-weight:600}
.me-range{font-size:13px;background:var(--bg);border-radius:10px;padding:8px 10px}
.vd-card{border:1px solid var(--line);border-radius:12px;padding:12px;display:grid;gap:8px;background:var(--surface)}
.vd-st{justify-self:start;font:700 12px var(--body);padding:3px 9px;border-radius:999px;background:var(--bg)}
.vd-st.ok{background:#e6f3dd;color:#2c6a17}.vd-st.warn{background:#fbf1dc;color:#8a5d0c}.vd-st.bad{background:#fbe3e0;color:#a3342a}
.vd-vac{display:grid;gap:6px;border-top:1px solid var(--line);padding-top:8px}.vd-vac img{width:90px;height:90px;object-fit:cover;border-radius:8px}
.vd-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.vx-list{list-style:none;margin:0;padding:0;display:grid;gap:6px}.vx-list li{display:flex;justify-content:space-between;gap:8px;align-items:center;border-bottom:1px solid var(--line);padding:6px 0;font-size:14px}
`;document.head.append(css);

/* ================= données globales (Firebase) ================= */
let S=null;
async function store(){if(S)return S;if(!B.CFG)return null;
  await B.loadFirebase(B.CFG);const u=await B.ensureUser(B.CFG);const fs=firebase.firestore();
  S={uid:u.uid,col:n=>fs.collection(n),doc:p=>fs.doc(p),ts:()=>firebase.firestore.FieldValue.serverTimestamp(),newId:n=>fs.collection(n).doc().id};return S}
const DEF={proM1:2500,proM3:6000,proM12:20000,vetoTaux:10,telPaiement:"",nomPaiement:"B2A-HIGH-TECHNOLOGY-AUTOMATION"};
let cfg={...DEF},proFin=Number(B.lsGet(LS_PRO))||0,mesPaie=[],formations=[],demandes=[],vetos=[],started=false,uid=null;
try{formations=JSON.parse(B.lsGet(LS_FORM)||"[]")}catch(e){formations=[]}
let catalogue=[];try{catalogue=JSON.parse(B.lsGet(LS_CAT)||"[]")}catch(e){catalogue=[]}
const allForm=()=>{const m=new Map();catalogue.concat(formations).forEach(f=>{if(f&&f.id&&f.url)m.set(f.id,f)});return [...m.values()]};
function loadCat(){if(!navigator.onLine)return;fetch(CAT_URL,{cache:"no-cache"}).then(r=>r.ok?r.json():null).then(j=>{if(!j||!Array.isArray(j.formations))return;
  catalogue=j.formations.filter(f=>f.publie!==false&&/^https:\/\//.test(f.url||""));try{B.lsSet(LS_CAT,JSON.stringify(catalogue))}catch(e){}rerender()}).catch(()=>{})}
setTimeout(loadCat,2500);
const cle=()=>B.farm||(uid?"u_"+uid:null);
/* Version d'essai (/essai/) : Pro débloqué pour tester, sans paiement. */
const ESSAI=/\/essai\//.test(location.pathname);
const finEff=()=>ESSAI?Math.max(proFin,Date.now()+30*864e5):proFin;
const isPro=()=>finEff()>Date.now();
const prixPro=f=>Number(cfg["pro"+f.toUpperCase()])||DEF["pro"+f.toUpperCase()];
const rerender=()=>{try{const D=$("lotdetail");if(D&&!D.hidden&&(window.B2A.lotTabs||[]).some(x=>x.k===curTab()))A.renderDetail()}catch(e){}};
const curTab=()=>{const b=document.querySelector("#lotdetail .subtabs button[aria-pressed='true']");return b?b.dataset.k:null};
async function start(){if(started)return;started=true;
  let s=null;try{s=await store()}catch(e){s=null}if(!s)return;uid=s.uid;
  const k=cle();
  if(k)s.doc("pro_fermes/"+k).onSnapshot(d=>{proFin=d.exists?ms(d.data().finLe):0;B.lsSet(LS_PRO,String(proFin));rerender()},()=>{});
  s.doc("marche_config/global").onSnapshot(d=>{cfg={...DEF,...(d.exists?d.data():{})};rerender()},()=>{});
  s.col("pro_paiements").where("uid","==",uid).onSnapshot(q=>{mesPaie=q.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>ms(b.creeLe)-ms(a.creeLe));rerender()},()=>{});
  s.col("formations").where("publie","==",true).onSnapshot(q=>{formations=q.docs.map(d=>({id:d.id,...d.data()}));
    try{B.lsSet(LS_FORM,JSON.stringify(formations))}catch(e){}rerender()},()=>{});
  s.col("veto_demandes").where("eleveur","==",uid).onSnapshot(q=>{demandes=q.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>ms(b.creeLe)-ms(a.creeLe));rerender()},()=>{});
}
setTimeout(()=>start().catch(()=>{started=false}),1500);

/* ================= écran « version Pro » (abonnement) ================= */
let plan="m3";
function lockCard(D,feature){
  const c=el("div","pro-lock");const h=el("h3");h.append(notr(el("span","pro-badge","PRO")),document.createTextNode(("Fonction de la version Pro")));c.append(h);
  if(!B.CFG){c.append(el("p","note","La version Pro demande une connexion internet et un compte (inscription)."));D.append(c);return}
  c.append(el("p",null,"Avec la version Pro, vous avez :"));
  const ul=el("ul");["des vidéos et des fiches PDF de formation adaptées à l'âge du lot, à garder sur le téléphone ;","l'enregistrement des mesures (température, humidité, eau) avec alertes et export pour l'étude ;","la validation de vos vaccins par le vétérinaire de votre choix (service payant) ;","l'étude du marché en temps réel et le prix de vente conseillé pour vos animaux, produits et matériel.","la simulation complète d'un nouveau projet d'élevage ou de culture : dépenses, bâtiments, surface et plan de construction."].forEach(t=>ul.append(el("li",null,t)));c.append(ul);
  c.append(el("p","note","Toute l'équipe de la ferme en profite avec un seul abonnement."));
  const wait=mesPaie.find(p=>p.statut==="attente"),ref=mesPaie.find(p=>p.statut==="refuse");
  if(wait){c.append(el("p","msg","Paiement en cours de vérification par B2A."));D.append(c);return}
  if(ref&&ref.motif){const p=el("p","msg err");p.append(document.createTextNode(("Paiement refusé :")+" "),notr(el("span",null,ref.motif)));c.append(p)}
  payForm(c);D.append(c)}
function payForm(c){
  const pl=el("div","pro-plans");pl.setAttribute("role","group");
  [["m1","1 mois"],["m3","3 mois"],["m12","12 mois"]].forEach(([f,lb])=>{const b=el("button");b.type="button";b.setAttribute("aria-pressed",plan===f);b.append(el("span",null,lb),el("b",null,fmt(prixPro(f))+" F"));b.onclick=()=>{plan=f;pl.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x===b))
    ;inst.textContent=(`Envoyez ${fmt(prixPro(plan))} FCFA par Orange Money ou Moov Money au numéro ci-dessous, puis indiquez la référence du paiement.`)};pl.append(b)});
  c.append(el("b",null,"Activer la version Pro"),pl);
  const inst=el("p","note",`Envoyez ${fmt(prixPro(plan))} FCFA par Orange Money ou Moov Money au numéro ci-dessous, puis indiquez la référence du paiement.`);c.append(inst);
  if(!cfg.telPaiement){c.append(el("p","msg err","Le numéro de paiement n'est pas encore disponible. Contactez B2A sur WhatsApp."));return}
  const pay=el("div","pro-pay");pay.append(el("small",null,"Numéro de paiement"),notr(el("b",null,cfg.telPaiement)),el("small",null,"Bénéficiaire"),notr(el("span",null,cfg.nomPaiement||DEF.nomPaiement)));c.append(pay);
  const g=el("div","grid2");const fld=(lb,type)=>{const f=el("div","field");const l=el("label",null,lb);const i=el("input");i.type=type;i.maxLength=40;const id="pro-"+Math.random().toString(36).slice(2,8);i.id=id;l.htmlFor=id;f.append(l,i);g.append(f);return i};
  const r=fld("Référence du paiement","text"),t=fld("Téléphone qui a payé","tel");t.inputMode="tel";c.append(g);
  const m=el("p","msg");m.setAttribute("aria-live","polite");const b=el("button","btn","J'ai payé : envoyer la référence");b.type="button";c.append(b,m);
  b.onclick=async()=>{if(!r.value.trim()){m.textContent=("Indiquez la référence du paiement.");m.className="msg err";return}
    if(digits(t.value).length<8){m.textContent=("Indiquez le téléphone qui a payé.");m.className="msg err";return}
    b.disabled=true;try{const s=await store();const k=cle();if(!s||!k)throw new Error("store");
      const mois={m1:1,m3:3,m12:12}[plan];
      await s.col("pro_paiements").add({uid:s.uid,cle:k,nom:(B.lsGet(B.LS_NAME)||"").slice(0,60),formule:plan,mois,montant:prixPro(plan),ref:r.value.trim().slice(0,40),telPayeur:t.value.trim().slice(0,30),statut:"attente",creeLe:s.ts()});
      m.textContent=("Paiement envoyé : B2A le vérifie et active la version Pro.");m.className="msg good"}
    catch(e){console.warn(e);m.textContent=("Envoi impossible. Vérifiez la connexion et réessayez.");m.className="msg err";b.disabled=false}}}
function proHead(D){const p=el("p","pro-ok");p.append(notr(el("span","pro-badge","PRO")),document.createTextNode((`Version Pro active jusqu'au ${dlong(finEff())}`)));
  if(proFin-Date.now()<15*864e5){const b=el("button","btn small ghost","Renouveler");b.type="button";b.onclick=()=>{const c=el("div","pro-lock");payForm(c);p.after(c);b.remove()};p.append(b)}D.append(p)}

/* ================= espèce et âge ================= */
function espKey(l){if(A.isCrop&&A.isCrop(l))return "culture";const e=l.espece||"";
  return /poisson|tilapia|silure|clarias/i.test(e)?"poisson":/pondeuse/i.test(e)?"pondeuse":/chair/i.test(e)?"chair":/poulet|pintade|caille|canard|dinde/i.test(e)?"local":/vache/i.test(e)?"vachelait":/chèvre.*lait/i.test(e)?"chevrelait":/chèvre|mouton/i.test(e)?"petitsrum":/bovin/i.test(e)?"bovin":/porc/i.test(e)?"porc":"autre"}
const isBird=k=>k==="pondeuse"||k==="chair"||k==="local";
/* plages conseillées (volailles) : chauffage dégressif les premières semaines, puis zone de confort de l'adulte */
function plage(l,s){const k=espKey(l);const w=s&&s.ageW!=null?s.ageW:null;
  if(isBird(k)&&w!=null){const T=w<1?[32,35]:w<2?[29,32]:w<3?[26,29]:w<4?[23,26]:[18,27];return {t:T,h:[50,70]}}
  if(k==="porc")return {t:w!=null&&w<4?[26,32]:[16,25],h:[50,75]};
  if(k==="petitsrum"||k==="bovin"||k==="vachelait"||k==="chevrelait")return {t:[5,27],h:[40,80]};
  return null}

/* ================= 1. Formation ================= */
const cacheOk=()=>"caches" in window;
async function inCache(url){if(!cacheOk()||!url)return false;try{const c=await caches.open(CACHE_F);return !!(await c.match(url))}catch(e){return false}}
async function openMedia(f){let src=f.url;
  if(cacheOk()){try{const c=await caches.open(CACHE_F);const r=await c.match(f.url);if(r)src=URL.createObjectURL(await r.blob())}catch(e){}}
  if(f.type==="pdf"){if(src!==f.url){const dl=await claude.use("downloads");if(dl){const b=await (await fetch(src)).blob();await dl.save({filename:(f.titre||"formation").replace(/[^\w\- ]+/g,"").slice(0,40)+".pdf",data:b});return}}
    window.open(f.url,"_blank","noopener");return}
  const ov=el("div","pro-modal");ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");const box=el("div","in");
  const v=el("video");v.controls=true;v.playsInline=true;v.setAttribute("playsinline","");v.src=src;
  const t=notr(el("b",null,f.titre||""));t.style.color="#fff";const x=el("button","btn small","Fermer");x.type="button";
  const close=()=>{try{v.pause()}catch(e){}ov.remove();if(src!==f.url)URL.revokeObjectURL(src)};x.onclick=close;ov.onclick=e=>{if(e.target===ov)close()};
  box.append(x,v,t);ov.append(box);document.body.append(ov);v.play().catch(()=>{})}
async function keep(f,btn,cb){btn.disabled=true;btn.textContent=("Téléchargement…");
  try{const r=await fetch(f.url);if(!r.ok)throw new Error("HTTP "+r.status);const c=await caches.open(CACHE_F);await c.put(f.url,r);cb()}
  catch(e){console.warn(e);btn.disabled=false;btn.textContent=("Garder sur le téléphone");alert(tr("Téléchargement impossible. Réessayez avec une bonne connexion (Wi-Fi conseillé)."))}}
function foItem(f,now){const c=el("div","fo-it"+(now?" fo-now":""));const h=el("div","fo-h");h.append(el("span","fo-ic",f.type==="pdf"?"📄":"▶"));
  const t=el("div");t.append(notr(el("b",null,f.titre||"")));
  const meta=[(f.type==="pdf"?"Fiche PDF":"Vidéo")];if(f.duree)meta.push(fmt(f.duree)+" "+("min"));if(f.taille)meta.push(fmt(f.taille/1048576,1)+" "+("Mo"));
  if(f.semDe!=null||f.semA!=null)meta.push((`semaine ${f.semDe??0} à ${f.semA??"…"}`));
  t.append(el("br"),el("small",null,meta.join(" · ")));if(f.desc){t.append(el("br"));t.append(notr(el("small",null,f.desc)))}h.append(t);c.append(h);
  const bx=el("div","fo-btns");const o=el("button","btn small",f.type==="pdf"?"Lire":"Regarder");o.type="button";o.onclick=()=>openMedia(f);bx.append(o);
  if(cacheOk()&&f.url){const k=el("button","btn small ghost","Garder sur le téléphone");k.type="button";bx.append(k);
    const set=has=>{k.disabled=false;k.textContent=(has?"Sur le téléphone ✓":"Garder sur le téléphone");k.onclick=has?null:()=>keep(f,k,()=>set(true));
      if(has&&!bx.querySelector(".fo-rm")){const rm=el("button","btn small ghost fo-rm","Retirer du téléphone");rm.type="button";rm.onclick=async()=>{try{const c=await caches.open(CACHE_F);await c.delete(f.url)}catch(e){}rm.remove();set(false)};bx.append(rm)}};
    inCache(f.url).then(set)}
  c.append(bx);return c}
T["semaine {0} à {1}"]=["week {0} to {1}","settimana da {0} a {1}","semana {0} a {1}"];T["semaine {0} à …"]=["week {0} to …","settimana da {0} a …","semana {0} a …"];
{const D=window.B2A_DICT;["en","it","es"].forEach((l,i)=>{["semaine {0} à {1}","semaine {0} à …"].forEach(k=>{if(D[l][k]==null)D[l][k]=T[k][i]})})}
function renderFormation(D,l,s){if(!isPro()){lockCard(D,"formation");return}proHead(D);
  const k=espKey(l),w=s&&s.ageW!=null?Math.floor(s.ageW):null;
  const mine=allForm().filter(f=>f.publie!==false&&(!f.especes||!f.especes.length||f.especes.includes(k)||f.especes.includes("tous"))).sort((a,b)=>(a.semDe??0)-(b.semDe??0)||(a.ordre||0)-(b.ordre||0));
  D.append(el("h3","sec","Formations pour ce lot"));
  if(!navigator.onLine)D.append(el("p","note","Sans internet, seules les formations gardées sur le téléphone s'ouvrent."));
  if(!mine.length){D.append(el("p","note","Aucune formation n'est encore publiée pour cette espèce. B2A ajoute régulièrement de nouvelles vidéos et fiches."));return}
  const now=w==null?[]:mine.filter(f=>(f.semDe==null||w>=f.semDe)&&(f.semA==null||w<=f.semA)&&(f.semDe!=null||f.semA!=null));
  if(now.length){D.append(el("h3","sec",`Pour l'âge du lot (semaine ${w})`));const L=el("div","fo-list");now.forEach(f=>L.append(foItem(f,true)));D.append(L)}
  const rest=mine.filter(f=>!now.includes(f));if(rest.length){D.append(el("h3","sec","Toutes les formations de l'espèce"));const L=el("div","fo-list");rest.forEach(f=>L.append(foItem(f,false)));D.append(L)}
  if(mine.some(f=>f.type!=="pdf"))D.append(el("p","note","Les vidéos sont lourdes : téléchargez-les en Wi-Fi."))}

/* ================= 2. Contrôle (mesures) ================= */
let mesures=[],mesSub=false;
async function listenMes(){if(mesSub)return;const db=A.db();if(!db)return;mesSub=true;
  db.collection("mesures").onSnapshot(q=>{mesures=q.docs.map(d=>({id:d.id,...d.data()}));if(curTab()==="controle")A.renderDetail()},()=>{mesSub=false})}
const mKey=m=>(m.date||"")+" "+(m.heure||"");
function lineSVG(rows,key,band){const P=rows.filter(r=>r[key]!=null);if(P.length<2)return null;const W=640,H=180,L=34,R=8,Tp=10,Bt=22;
  let lo=Math.min(...P.map(r=>r[key])),hi=Math.max(...P.map(r=>r[key]));if(band){lo=Math.min(lo,band[0]);hi=Math.max(hi,band[1])}lo=Math.floor(lo-1);hi=Math.ceil(hi+1);
  const x=i=>L+(W-L-R)*i/(P.length-1),y=v=>Tp+(H-Tp-Bt)*(1-(v-lo)/(hi-lo||1));
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${("Température")}" style="width:100%;height:auto">`;
  if(band)s+=`<rect x="${L}" y="${y(band[1])}" width="${W-L-R}" height="${y(band[0])-y(band[1])}" fill="#5fa83f" opacity=".15"/>`;
  [lo,(lo+hi)/2,hi].forEach(v=>{s+=`<text x="${L-4}" y="${y(v)+4}" font-size="11" text-anchor="end" fill="#5b6880">${Math.round(v)}</text><line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="#e3e8f0"/>`});
  s+=`<polyline fill="none" stroke="#1b2e4c" stroke-width="2.5" points="${P.map((r,i)=>x(i)+","+y(r[key])).join(" ")}"/>`;
  P.forEach((r,i)=>{const out=band&&(r[key]<band[0]||r[key]>band[1]);s+=`<circle cx="${x(i)}" cy="${y(r[key])}" r="3.5" fill="${out?"#c0392b":"#1b2e4c"}"/>`});
  s+=`<text x="${L}" y="${H-5}" font-size="11" fill="#5b6880">${P[0].date.slice(5).split("-").reverse().join("/")}</text><text x="${W-R}" y="${H-5}" font-size="11" text-anchor="end" fill="#5b6880">${P[P.length-1].date.slice(5).split("-").reverse().join("/")}</text>`;
  return s+"</svg>"}
const srcLbl=r=>r.source==="dispositif"?"Dispositif":r.source==="demo"?"Démo":"Saisie manuelle";
function csvLot(l,rows){const sep=";";const head=["Date","Heure","Température (°C)","Humidité (%)","Eau (L)","Aliment (kg)","NH3 (ppm)","CO2 (ppm)","Source","Remarque"].map(tr);
  const esc=v=>{const t=v==null?"":String(v);return /[;"\n]/.test(t)?'"'+t.replace(/"/g,'""')+'"':t};
  const lines=[head.join(sep),...rows.map(r=>[r.date,r.heure,r.temp!=null?String(r.temp).replace(".",","):"",r.hum!=null?String(r.hum).replace(".",","):"",r.eau!=null?String(r.eau).replace(".",","):"",r.alim!=null?String(r.alim).replace(".",","):"",r.nh3!=null?String(r.nh3).replace(".",","):"",r.co2!=null?String(r.co2):"",tr(srcLbl(r)),r.note||""].map(esc).join(sep))];
  return new Blob(["﻿"+lines.join("\r\n")],{type:"text/csv;charset=utf-8"})}
/* relevé automatique : chaque lecture du dispositif de contrôle B2A Smart Building (Poulailler connecté)
   enregistre une mesure par tranche de 30 minutes pour le lot relié au dispositif */
const AUTO_MIN=30,LS_AUTO="b2a-pro-auto";let lastAuto="";try{lastAuto=B.lsGet(LS_AUTO)||""}catch(e){}
const live=()=>{const L=window.B2A_PC_LIVE;return L&&Date.now()-L.t<3*60e3?L:null};
const num1=v=>v==null||v===""||isNaN(+v)?null:Math.round(+v*10)/10;
function autoMesure(){const L=live();if(!L||!L.lotId||!isPro())return;if(L.demo&&!ESSAI)return;
  const db=A.db&&A.db();if(!db||!(A.can&&A.can()))return;listenMes();
  const d=new Date(),m=Math.floor((d.getHours()*60+d.getMinutes())/AUTO_MIN)*AUTO_MIN,heure=pad(Math.floor(m/60))+":"+pad(m%60),date=today();
  const key=L.lotId+"_"+date+"_"+heure.replace(":","");if(lastAuto===key)return;
  const x=L.data||{},v={temp:num1(x.tMoy),hum:num1(x.hrMoy),eau:num1(x.eauJour),alim:num1(x.alimJour),nh3:num1(x.nh3),co2:num1(x.co2),t1:num1(x.t1),t2:num1(x.t2),t3:num1(x.t3)};
  if(v.temp==null&&v.hum==null)return;lastAuto=key;try{B.lsSet(LS_AUTO,key)}catch(e){}
  db.doc("mesures/"+key).set({lotId:L.lotId,date,heure,...v,note:"",source:L.demo?"demo":"dispositif",by:A.me(),t:Date.now()}).catch(()=>{lastAuto=""})}
let liveTick=0;window.addEventListener("b2a-pc-data",()=>{try{autoMesure()}catch(e){}
  if(curTab()==="controle"&&Date.now()-liveTick>15e3){liveTick=Date.now();rerender()}});
function deviceCard(D,l){const L=live(),c=el("div","card");const h=el("h3","sec","Relevé automatique");c.append(h);
  if(L&&L.lotId===l.id){const x=L.data||{};const p=el("p","msg good");p.textContent=(L.demo?"Mode démo du dispositif : les mesures de test sont enregistrées toutes seules.":"Dispositif de contrôle B2A Smart Building connecté : les mesures sont enregistrées toutes seules.");c.append(p);
    const K=el("div","kpis");const f=(v,u,d)=>v==null||isNaN(+v)?"—":fmt(+v,d)+u;
    K.append(A.kpi("Température moyenne",f(x.tMoy," °C",1),[x.t1,x.t2,x.t3].some(v=>v!=null)?[x.t1,x.t2,x.t3].map(v=>f(v,"°",1)).join(" · "):null));
    K.append(A.kpi("Humidité moyenne",f(x.hrMoy," %",0)));if(x.nh3!=null)K.append(A.kpi("Ammoniac (NH₃)",f(x.nh3," ppm",1)));if(x.co2!=null)K.append(A.kpi("CO₂",f(x.co2," ppm",0)));
    if(x.eauJour!=null)K.append(A.kpi("Eau aujourd'hui",f(x.eauJour," L",1)));if(x.alimJour!=null)K.append(A.kpi("Aliment aujourd'hui",f(x.alimJour," kg",1)));c.append(K);
    const n=el("p","note");n.append(el("span",null,"Dernière lecture :"),document.createTextNode(" "),notr(el("span",null,new Date(L.t).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}))),document.createTextNode(" · "),el("span",null,`Une mesure est gardée toutes les ${AUTO_MIN} minutes.`));c.append(n)}
  else if(L&&L.lotId){const p=el("p","note");p.append(el("span",null,"Le dispositif est relié à un autre lot :"),document.createTextNode(" "),notr(el("b",null,L.lotNom||"—")),document.createTextNode(". "),el("span",null,"Choisissez ce lot dans Poulailler connecté pour enregistrer ses mesures."));c.append(p)}
  else c.append(el("p","note","Aucun dispositif connecté pour le moment. Dès que le dispositif de contrôle B2A Smart Building est configuré dans Poulailler connecté, les mesures (température, humidité, eau, aliment, air) arrivent ici toutes seules."));
  const t=$("tab-poulailler");if(t){const b=el("button","btn small ghost","Ouvrir Poulailler connecté");b.type="button";b.style.justifySelf="start";b.onclick=()=>t.click();c.append(b)}
  D.append(c);
  /* pas de dispositif relié : vitrine de l'armoire B2A (vitrine.js) */
  if(!L&&window.B2A_VITRINE)D.append(window.B2A_VITRINE.teaser("Pas encore de dispositif ? B2A équipe votre bâtiment."))}
function renderControle(D,l,s){if(!isPro()){lockCard(D,"controle");return}proHead(D);listenMes();
  const db=A.db();const rows=mesures.filter(m=>m.lotId===l.id).sort((a,b)=>mKey(a)<mKey(b)?-1:1);const pl=plage(l,s);
  if(pl){const r=el("p","me-range");r.append(el("b",null,"Plage conseillée pour l'âge du lot :"),document.createTextNode(" "+(`Température ${pl.t[0]} à ${pl.t[1]} °C · humidité ${pl.h[0]} à ${pl.h[1]} %`)));D.append(r)}
  deviceCard(D,l);
  /* alerte sur la dernière mesure */
  const last=rows[rows.length-1];
  if(last&&pl){const ul=el("ul","alerts");const add=(c,t)=>{const li=el("li","s-"+c);li.append(el("span","dot"),el("span",null,t));ul.append(li)};
    if(last.temp!=null&&last.temp>pl.t[1])add("bad",`Trop chaud : ${fmt(last.temp,1)} °C (conseillé ${pl.t[0]} à ${pl.t[1]} °C). Aérez, ombragez, donnez de l'eau fraîche.`);
    else if(last.temp!=null&&last.temp<pl.t[0])add("bad",`Trop froid : ${fmt(last.temp,1)} °C (conseillé ${pl.t[0]} à ${pl.t[1]} °C). Chauffez et fermez les courants d'air.`);
    if(last.hum!=null&&(last.hum<pl.h[0]||last.hum>pl.h[1]))add("warn",`Humidité hors plage : ${fmt(last.hum)} % (conseillé ${pl.h[0]} à ${pl.h[1]} %).`);
    if(!ul.children.length)add("ok","Dernière mesure dans la plage conseillée.");D.append(ul)}
  /* chiffres clés */
  const d7=new Date();d7.setDate(d7.getDate()-7);const lim=d7.toISOString().slice(0,10);const r7=rows.filter(r=>r.date>=lim);
  const T7=r7.map(r=>r.temp).filter(v=>v!=null);const K=el("div","kpis");
  if(last)K.append(A.kpi("Dernière mesure",last.temp!=null?fmt(last.temp,1)+" °C":"—",[last.hum!=null?fmt(last.hum)+" %":null,last.date.split("-").reverse().join("/")+" "+(last.heure||"")].filter(Boolean).join(" · ")));
  if(T7.length){K.append(A.kpi("Moyenne 7 j",fmt(T7.reduce((a,b)=>a+b,0)/T7.length,1)+" °C"));K.append(A.kpi("Min / max 7 j",fmt(Math.min(...T7),1)+" / "+fmt(Math.max(...T7),1)+" °C"));
    if(pl)K.append(A.kpi("Hors plage 7 j",fmt(T7.filter(v=>v<pl.t[0]||v>pl.t[1]).length),null,T7.some(v=>v<pl.t[0]||v>pl.t[1])?"down":"up"))}
  const E7={};r7.forEach(r=>{if(r.eau==null)return;const e=E7[r.date]=E7[r.date]||{a:0,m:0};if(r.source)e.a=Math.max(e.a,r.eau);else e.m+=r.eau});   /* dispositif : total du jour (le plus grand relevé) ; saisie : somme */
  const ET=Object.values(E7);if(ET.length)K.append(A.kpi("Eau 7 j",fmt(ET.reduce((x,e)=>x+e.a+e.m,0),1)+" L"));
  if(K.children.length)D.append(K);
  /* formulaire */
  if(A.can()&&db){const c=el("details","card me-manuel");const sm=el("summary");sm.append(el("b",null,"Saisie manuelle (sans dispositif)"));c.append(sm);const g=el("div","me-form");
    const fld=(lb,type,val,cls)=>{const f=el("div","field"+(cls?" "+cls:""));const id="me-"+Math.random().toString(36).slice(2,8);const L=el("label",null,lb);L.htmlFor=id;const i=el("input");i.type=type;i.id=id;if(val!=null)i.value=val;if(type==="number"){i.inputMode="decimal";i.step="0.1"}f.append(L,i);g.append(f);return i};
    const dt=fld("Date","date",today()),hm=fld("Heure","time",nowHM()),te=fld("Température (°C)","number"),hu=fld("Humidité (%)","number"),ea=fld("Eau consommée (litres)","number"),no=fld("Remarque (facultatif)","text",null,"full");no.maxLength=120;
    c.append(g);const m=el("p","msg");const b=el("button","btn","Enregistrer la mesure");b.type="button";c.append(b,m);
    b.onclick=async()=>{const v={temp:N(te.value),hum:N(hu.value),eau:N(ea.value)};if(v.temp==null&&v.hum==null&&v.eau==null){m.textContent=("Indiquez au moins une valeur.");m.className="msg err";return}
      const date=dt.value||today(),heure=hm.value||nowHM();b.disabled=true;
      try{await db.doc("mesures/"+l.id+"_"+date+"_"+heure.replace(":","")).set({lotId:l.id,date,heure,...v,note:no.value.trim().slice(0,120),by:A.me(),t:Date.now()});
        m.textContent=("Mesure enregistrée.");m.className="msg good";te.value="";hu.value="";ea.value="";no.value=""}
      catch(e){m.textContent=A.errText?(A.errText(e)):("Échec. Réessayez.");m.className="msg err"}finally{b.disabled=false}};
    D.append(c)}
  /* graphique */
  D.append(el("h3","sec","Température (30 dernières mesures)"));const svg=lineSVG(rows.slice(-30),"temp",pl&&pl.t);
  if(svg){const w=el("div");w.innerHTML=svg;D.append(w);if(pl)D.append(el("p","note","Bande verte : plage conseillée"))}else D.append(el("p","note","Le graphique apparaît après 2 mesures."));
  /* tableau */
  if(!rows.length){D.append(el("p","note","Aucune mesure pour ce lot."));return}
  const ex=el("button","btn small ghost","Exporter (Excel)");ex.type="button";ex.style.justifySelf="start";
  ex.onclick=async()=>{const dl=await claude.use("downloads");const f=("mesures-"+(l.nom||"lot")).normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^A-Za-z0-9]+/g,"-").slice(0,40)+".csv";if(dl)dl.save({filename:f,data:csvLot(l,rows)})};D.append(ex);
  const w=el("div","tablewrap");const tb=el("table","data");const hd=el("tr");[["Date"],["Heure"],["Température","n"],["Humidité","n"],["Eau","n"],["Par"],["Remarque"]].forEach(([x,c])=>hd.append(el("th",c||null,x)));
  const th=el("thead");th.append(hd);tb.append(th);const body=el("tbody");
  rows.slice(-40).reverse().forEach(r=>{const tr_=el("tr");const out=pl&&r.temp!=null&&(r.temp<pl.t[0]||r.temp>pl.t[1]);
    tr_.append(el("td",null,r.date.split("-").reverse().slice(0,2).join("/")),el("td",null,r.heure||""),el("td","n"+(out?" bad":""),r.temp!=null?fmt(r.temp,1)+" °C":"—"),el("td","n",r.hum!=null?fmt(r.hum)+" %":"—"),el("td","n",r.eau!=null?fmt(r.eau,1)+" L":"—"),r.source?el("td",null,srcLbl(r)):notr(el("td",null,A.names[r.by]||"—")),notr(el("td",null,r.note||"")));
    if(A.can()&&db){tr_.style.cursor="pointer";tr_.onclick=async()=>{if(!confirm(tr("Supprimer cette mesure ?")))return;try{await db.doc("mesures/"+r.id).delete();mesures=mesures.filter(x=>x.id!==r.id);A.renderDetail()}catch(e){}}}
    body.append(tr_)});tb.append(body);w.append(tb);D.append(w);if(A.can())D.append(el("p","note","Touchez une ligne pour la supprimer."))}

/* ================= 3. Vétérinaire (validation des vaccins) ================= */
const isVac=p=>/vaccin/i.test(p.type||"")||/vaccin/i.test(p.nom||"");
function vacsFaits(l){try{return A.programme(l).filter(p=>p.done&&isVac(p))}catch(e){return []}}
function etatVac(l,code){const D=demandes.filter(d=>d.lotId===l.id&&d.cle===cle());
  const v=D.find(d=>d.statut==="validee"&&d.resultats&&d.resultats[code]);if(v)return {k:v.resultats[code].ok!==false?"ok":"bad",d:v};
  const p=D.find(d=>["attente","acceptee","payee"].includes(d.statut)&&(d.vaccins||[]).some(x=>x.code===code));if(p)return {k:"wait",d:p};return null}
const STV={attente:["En attente de réponse","warn"],acceptee:["Acceptée : à payer","warn"],payee:["Payée : validation en cours","warn"],validee:["Validée","ok"],refusee:["Refusée","bad"],annulee:["Annulée",""]};
async function loadVetos(){const s=await store();if(!s)return [];const q=await s.col("services_pros").where("statut","==","actif").get();
  vetos=q.docs.map(d=>({id:d.id,...d.data()})).filter(p=>p.metier==="veto"&&ms(p.finLe)>Date.now()&&p.id!==s.uid).sort((a,b)=>(a.ville||"").localeCompare(b.ville||""));return vetos}
function compress(file,MX,LIM){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>{let M=MX,q=.8;const draw=()=>{const r=Math.min(1,M/Math.max(im.width,im.height));
  const cv=document.createElement("canvas");cv.width=Math.round(im.width*r);cv.height=Math.round(im.height*r);cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);return cv.toDataURL("image/jpeg",q)};
  let u=draw();while(u.length>LIM&&q>.35){q-=.1;u=draw()}while(u.length>LIM&&M>200){M=Math.round(M*.8);u=draw()}URL.revokeObjectURL(im.src);u.length>LIM?rej(new Error("trop grand")):res(u)};
  im.onerror=rej;im.src=URL.createObjectURL(file)})}
let vForm=null;
function renderVeto(D,l,s){if(!isPro()){lockCard(D,"veto");return}proHead(D);
  if(!B.CFG){D.append(el("p","note","La version Pro demande une connexion internet et un compte (inscription)."));return}
  const vac=vacsFaits(l);D.append(el("h3","sec","Vaccins du lot"));
  if(!vac.length)D.append(el("p","note","Aucun vaccin fait n'est encore noté pour ce lot. Cochez les vaccins faits dans le Calendrier."));
  else{const ul=el("ul","vx-list");vac.forEach(p=>{const li=el("li");const t=el("span");t.append(notr(el("b",null,p.nom)),el("br"),el("small",null,`fait le ${A.fdate(p.doneDate||p.date)}`));
      const e=etatVac(l,p.code);const st=el("span","vd-st "+(e?e.k==="ok"?"ok":e.k==="bad"?"bad":"warn":""));
      if(e&&e.k==="ok"){st.append(document.createTextNode("✓ "+("Validé par")+" "),notr(el("span",null,e.d.vetoNom||"")))}else st.textContent=(e?e.k==="bad"?"Non conforme":"En attente du vétérinaire":"Non validé");
      li.append(t,st);ul.append(li)});D.append(ul)}
  const todo=vac.filter(p=>!etatVac(l,p.code));
  if(todo.length&&A.can()){const c=el("div","card");c.append(el("h3","sec","Faire valider par un vétérinaire"),el("p","note","Le vétérinaire vérifie vos vaccins et les valide. C'est un service payant : il vous indique son tarif avant de commencer. Un carnet validé rassure vos acheteurs sur le Marché."));
    if(vForm!==l.id){const b=el("button","btn","Faire valider par un vétérinaire");b.type="button";b.onclick=()=>{vForm=l.id;A.renderDetail()};c.append(b)}
    else demandeForm(c,l,s,todo);D.append(c)}
  const mine=demandes.filter(d=>d.lotId===l.id&&d.cle===cle());
  if(mine.length){D.append(el("h3","sec","Mes demandes pour ce lot"));mine.forEach(d=>D.append(demandeCard(d,l)))}}
async function demandeForm(c,l,s,todo){const box=el("div");box.style.display="grid";box.style.gap="10px";c.append(box);box.append(el("p","note","Chargement…"));
  let V=[];try{V=await loadVetos()}catch(e){V=[]}box.innerHTML="";
  if(!V.length){box.append(el("p","msg err","Aucun vétérinaire n'est en ligne pour le moment dans Services."));return}
  const f1=el("div","field");const l1=el("label",null,"Choisir le vétérinaire");l1.htmlFor="vd-veto";const sel=el("select");sel.id="vd-veto";sel.append(new Option(("Choisir…"),""));
  V.forEach(v=>{const o=new Option([v.nom,v.ville,v.agrement?"agr. "+v.agrement:null].filter(Boolean).join(" · "),v.id);o.setAttribute("data-notr","");sel.append(o)});f1.append(l1,sel);box.append(f1);
  box.append(el("b",null,"Vaccins à faire valider"));const picks=[];
  todo.forEach(p=>{const w=el("div","vd-vac");const lb=el("label","vd-row");const cb=el("input");cb.type="checkbox";cb.checked=true;lb.append(cb,notr(el("b",null,p.nom)),el("small",null,`fait le ${A.fdate(p.doneDate||p.date)}`));w.append(lb);
    const g=el("div","grid2");const mk=(lb2,max)=>{const f=el("div","field");const id="vd-"+Math.random().toString(36).slice(2,8);const L=el("label",null,lb2);L.htmlFor=id;const i=el("input");i.id=id;i.maxLength=max;f.append(L,i);g.append(f);return i};
    const prod=mk("Produit utilisé (facultatif)",60),lot=mk("N° de lot du flacon (facultatif)",40);
    const fp=el("div","field");const lp=el("label",null,"Photo du flacon (facultatif)");const ip=el("input");ip.type="file";ip.accept="image/*";const id3="vd-"+Math.random().toString(36).slice(2,8);ip.id=id3;lp.htmlFor=id3;fp.append(lp,ip);g.append(fp);
    const pv=el("img");pv.hidden=true;pv.alt="";let photo="";ip.onchange=async()=>{const fl=ip.files[0];if(!fl)return;try{photo=await compress(fl,800,60000);pv.src=photo;pv.hidden=false}catch(e){alert(tr("Photo trop grande."))}};
    w.append(g,pv);box.append(w);picks.push({p,cb,prod,lot,get photo(){return photo}})});
  const g2=el("div","grid2");const ft=el("div","field");const lt=el("label",null,"Votre téléphone");lt.htmlFor="vd-tel";const tel=el("input");tel.id="vd-tel";tel.type="tel";tel.inputMode="tel";tel.maxLength=30;ft.append(lt,tel);g2.append(ft);box.append(g2);
  const fm=el("div","field");const lm=el("label",null,"Message au vétérinaire (facultatif)");lm.htmlFor="vd-msg";const msg=el("textarea");msg.id="vd-msg";msg.maxLength=500;fm.append(lm,msg);box.append(fm);
  const m=el("p","msg");const b=el("button","btn","Envoyer la demande");b.type="button";const an=el("button","btn ghost","Fermer");an.type="button";an.onclick=()=>{vForm=null;A.renderDetail()};
  const row=el("div","vd-row");row.append(b,an);box.append(row,m);
  b.onclick=async()=>{const v=V.find(x=>x.id===sel.value);if(!v){m.textContent=("Choisissez un vétérinaire.");m.className="msg err";return}
    const ch=picks.filter(x=>x.cb.checked);if(!ch.length){m.textContent=("Cochez au moins un vaccin.");m.className="msg err";return}
    if(digits(tel.value).length<8){m.textContent=("Indiquez votre téléphone.");m.className="msg err";return}
    b.disabled=true;try{const st=await store();
      const vaccins=ch.map(x=>({code:x.p.code,nom:String(x.p.nom||"").slice(0,80),date:x.p.doneDate||x.p.date||"",produit:x.prod.value.trim().slice(0,60),lotVaccin:x.lot.value.trim().slice(0,40),photo:x.photo||""}));
      await st.col("veto_demandes").add({eleveur:st.uid,eleveurNom:(B.lsGet(B.LS_NAME)||"Éleveur").slice(0,60),eleveurTel:tel.value.trim().slice(0,30),cle:cle(),lotId:l.id,
        lot:{nom:String(l.nom||"").slice(0,60),espece:String(l.espece||"").slice(0,60),race:String(l.race||"").slice(0,60),effectif:s.alive??null,arrivee:l.arrivee||"",ageW:s.ageW??null},
        vaccins,veto:v.id,vetoNom:String(v.nom||"").slice(0,60),statut:"attente",message:msg.value.trim().slice(0,500),creeLe:st.ts(),majLe:st.ts()});
      vForm=null;m.textContent=("Demande envoyée au vétérinaire.");m.className="msg good"}
    catch(e){console.warn(e);m.textContent=("Envoi impossible. Vérifiez la connexion et réessayez.");m.className="msg err";b.disabled=false}}}
function demandeCard(d,l){const c=el("div","vd-card");const st=STV[d.statut]||["",""];
  const h=el("div","vd-row");h.append(el("span","vd-st "+st[1],st[0]),notr(el("b",null,d.vetoNom||"")),el("small",null,dlong(ms(d.creeLe)||Date.now())));c.append(h);
  const ul=el("ul","vx-list");(d.vaccins||[]).forEach(v=>{const li=el("li");li.append(notr(el("span",null,v.nom)));const r=d.resultats&&d.resultats[v.code];
    if(r)li.append(el("span","vd-st "+(r.ok!==false?"ok":"bad"),r.ok!==false?"Conforme":"Non conforme"));ul.append(li)});c.append(ul);
  if(d.reponse){const p=el("p","note");p.append(el("b",null,"Réponse du vétérinaire :"),document.createTextNode(" "),notr(el("span",null,d.reponse)));c.append(p)}
  if(d.statut==="acceptee"){c.append(el("b",null,`Tarif du vétérinaire : ${fmt(d.tarif)} FCFA`),el("p","note","Payez directement le vétérinaire par Orange Money ou Moov Money, puis indiquez la référence."));
    const pay=el("div","pro-pay");pay.append(el("small",null,"Numéro du vétérinaire"),notr(el("b",null,d.telPaiement||"")));c.append(pay);
    const f=el("div","field");const lb=el("label",null,"Référence du paiement");const id="vr-"+d.id;lb.htmlFor=id;const i=el("input");i.id=id;i.maxLength=40;f.append(lb,i);c.append(f);
    const m=el("p","msg");const b=el("button","btn","J'ai payé : envoyer la référence");b.type="button";c.append(b,m);
    b.onclick=async()=>{if(!i.value.trim()){m.textContent=("Indiquez la référence du paiement.");m.className="msg err";return}b.disabled=true;
      try{const s=await store();await s.doc("veto_demandes/"+d.id).update({statut:"payee",refPaiement:i.value.trim().slice(0,40),majLe:s.ts()})}catch(e){m.textContent=("Échec. Réessayez.");m.className="msg err";b.disabled=false}}}
  if(d.statut==="validee"){if(d.commentaire){const p=el("p","note");p.append(el("b",null,"Commentaire du vétérinaire :"),document.createTextNode(" "),notr(el("span",null,d.commentaire)));c.append(p)}
    c.append(notr(el("small",null,d.signature||"")),el("small",null,`Validé le ${dlong(ms(d.valideLe))}`));
    const sh=el("button","btn small ghost","Partager le carnet validé");sh.type="button";sh.onclick=()=>shareCarnet(d);c.append(sh)}
  if(["attente","acceptee"].includes(d.statut)){const x=el("button","btn small ghost","Annuler la demande");x.type="button";x.onclick=async()=>{x.disabled=true;try{const s=await store();await s.doc("veto_demandes/"+d.id).update({statut:"annulee",majLe:s.ts()})}catch(e){x.disabled=false}};c.append(x)}
  return c}
function shareCarnet(d){const L=[tr("Carnet sanitaire validé par le vétérinaire"),"",`${tr("Lot")} : ${d.lot&&d.lot.nom||""} (${d.lot&&d.lot.espece||""})`,`${tr("Vétérinaire")} : ${d.signature||d.vetoNom||""}`,tr(`Validé le ${dlong(ms(d.valideLe))}`),""];
  (d.vaccins||[]).forEach(v=>{const r=d.resultats&&d.resultats[v.code];L.push(`- ${v.nom} (${v.date}) : ${tr(r&&r.ok===false?"Non conforme":"Conforme")}`)});
  if(d.commentaire)L.push("",d.commentaire);L.push("","B2A Smart Farming");const t=L.join("\n");
  if(navigator.share)navigator.share({title:"B2A Smart Farming",text:t}).catch(()=>{});else location.href="https://wa.me/?text="+encodeURIComponent(t)}
T["Carnet sanitaire validé par le vétérinaire"]=["Health record validated by the vet","Libretto sanitario convalidato dal veterinario","Registro sanitario validado por el veterinario"];
{const D=window.B2A_DICT;["en","it","es"].forEach((l,i)=>{const k="Carnet sanitaire validé par le vétérinaire";if(D[l][k]==null)D[l][k]=T[k][i]})}

/* ================= espace vétérinaire (Marché > Services) ================= */
let vdVeto=[],vetoSub=false,amVeto=false;
async function listenVeto(host){const s=await store();if(!s)return;
  if(!vetoSub){vetoSub=true;try{const me=await s.doc("services_pros/"+s.uid).get();amVeto=me.exists&&me.data().metier==="veto";
      if(amVeto){window.__b2aVetoFiche=me.data();s.col("veto_demandes").where("veto","==",s.uid).onSnapshot(q=>{vdVeto=q.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>ms(b.creeLe)-ms(a.creeLe));paintVeto()},()=>{})}}
    catch(e){vetoSub=false}}
  paintVeto()}
let vetoHost=null;
function paintVeto(){const h=vetoHost;if(!h||!h.isConnected||!amVeto)return;h.innerHTML="";const c=el("section","card");c.append(el("h2","sec","Demandes de validation des vaccins"));
  c.append(el("p","note",`Les éleveurs vous demandent de valider leurs vaccins. Fixez votre tarif, faites-vous payer directement, puis validez. Une commission B2A de ${fmt(cfg.vetoTaux)} % du tarif est due à chaque validation.`));
  const act=vdVeto.filter(d=>d.statut!=="annulee");if(!act.length)c.append(el("p","note","Aucune demande pour le moment."));
  act.forEach(d=>c.append(vetoCard(d)));h.append(c)}
function vetoCard(d){const c=el("div","vd-card");const st=STV[d.statut]||["",""];const fiche=window.__b2aVetoFiche||{};
  const h=el("div","vd-row");h.append(el("span","vd-st "+st[1],st[0]),el("small",null,dlong(ms(d.creeLe)||Date.now())));c.append(h);
  const L=d.lot||{};const info=el("p");info.append(el("b",null,("Éleveur")+" : "),notr(el("span",null,(d.eleveurNom||"")+" · "+(d.eleveurTel||""))),el("br"),el("b",null,("Lot")+" : "),
    notr(el("span",null,[L.nom,L.espece,L.race].filter(Boolean).join(" · "))),el("br"),el("span",null,[L.effectif!=null?("Effectif")+" "+fmt(L.effectif):null,L.ageW!=null?(`âge ≈ ${fmt(L.ageW)} sem.`):null].filter(Boolean).join(" · ")));c.append(info);
  if(d.message){c.append(notr(el("p","note",d.message)))}
  const res={};
  (d.vaccins||[]).forEach(v=>{const w=el("div","vd-vac");w.append(notr(el("b",null,v.nom)),el("small",null,`fait le ${v.date?v.date.split("-").reverse().join("/"):"—"}`));
    if(v.produit){const p=el("small");p.append(document.createTextNode(("Produit :")+" "),notr(el("span",null,v.produit)));w.append(p)}
    if(v.lotVaccin){const p=el("small");p.append(document.createTextNode(("N° de lot :")+" "),notr(el("span",null,v.lotVaccin)));w.append(p)}
    if(okImg(v.photo)){const i=el("img");i.src=v.photo;i.alt="";w.append(i)}
    if(["acceptee","payee"].includes(d.statut)){res[v.code]={ok:true};const seg=el("div","vd-row");const ok=el("button","btn small","Conforme"),no=el("button","btn small ghost","Non conforme");[ok,no].forEach(x=>x.type="button");
      const set=v2=>{res[v.code].ok=v2;ok.className="btn small"+(v2?"":" ghost");no.className="btn small"+(v2?" ghost":"")};ok.onclick=()=>set(true);no.onclick=()=>set(false);seg.append(ok,no);w.append(seg)}
    if(d.statut==="validee"&&d.resultats&&d.resultats[v.code])w.append(el("span","vd-st "+(d.resultats[v.code].ok!==false?"ok":"bad"),d.resultats[v.code].ok!==false?"Conforme":"Non conforme"));
    c.append(w)});
  const m=el("p","msg");
  if(d.statut==="attente"){const g=el("div","grid2");const mk=(lb,type,val,max)=>{const f=el("div","field");const id="vv-"+Math.random().toString(36).slice(2,8);const L2=el("label",null,lb);L2.htmlFor=id;const i=el("input");i.type=type;i.id=id;if(val)i.value=val;if(max)i.maxLength=max;f.append(L2,i);g.append(f);return i};
    const ta=mk("Votre tarif (FCFA)","number"),tp=mk("Numéro où l'éleveur vous paie","tel",fiche.tel||"",30);ta.inputMode="numeric";
    const fr=el("div","field");const lr=el("label",null,"Message à l'éleveur (facultatif)");lr.htmlFor="vv-r-"+d.id;const rp=el("input");rp.id="vv-r-"+d.id;rp.maxLength=300;fr.append(lr,rp);
    c.append(g,fr);const row=el("div","vd-row");const ac=el("button","btn","Accepter"),rf=el("button","btn ghost","Refuser");[ac,rf].forEach(x=>x.type="button");row.append(ac,rf);c.append(row,m);
    ac.onclick=async()=>{const t=Math.round(N(ta.value)||0);if(!(t>0)){m.textContent=("Indiquez votre tarif.");m.className="msg err";return}ac.disabled=true;
      try{const s=await store();await s.doc("veto_demandes/"+d.id).update({statut:"acceptee",tarif:t,telPaiement:tp.value.trim().slice(0,30),reponse:rp.value.trim().slice(0,300),majLe:s.ts()})}catch(e){m.textContent=("Échec. Réessayez.");m.className="msg err";ac.disabled=false}};
    rf.onclick=()=>refuse(d,rf,rp,m)}
  else if(["acceptee","payee"].includes(d.statut)){c.append(el("b",null,`Tarif du vétérinaire : ${fmt(d.tarif)} FCFA`));
    if(d.refPaiement){const p=el("p");p.append(el("b",null,"Référence du paiement de l'éleveur :"),document.createTextNode(" "),notr(el("span",null,d.refPaiement)));c.append(p)}
    c.append(el("p","note","Vérifiez le paiement reçu avant de valider."));
    const fc=el("div","field");const lc=el("label",null,"Commentaire (facultatif)");lc.htmlFor="vv-c-"+d.id;const co=el("textarea");co.id="vv-c-"+d.id;co.maxLength=500;fc.append(lc,co);c.append(fc);
    const row=el("div","vd-row");const va=el("button","btn","Valider les vaccins"),rf=el("button","btn ghost","Refuser");[va,rf].forEach(x=>x.type="button");row.append(va,rf);c.append(row,m);
    va.onclick=async()=>{if(va.dataset.c!=="1"){va.dataset.c="1";va.textContent=("Confirmer la validation");return}va.disabled=true;
      try{const s=await store();const taux=Number(cfg.vetoTaux);const sig=[fiche.nom||d.vetoNom,fiche.agrement?"agrément "+fiche.agrement:null,fiche.ville].filter(Boolean).join(" · ").slice(0,120);
        await s.doc("veto_demandes/"+d.id).update({statut:"validee",resultats:res,commentaire:co.value.trim().slice(0,500),signature:sig,valideLe:Date.now(),taux,commission:d.tarif*taux/100,comStatut:"due",majLe:s.ts()})}
      catch(e){console.warn(e);m.textContent=("Échec. Réessayez.");m.className="msg err";va.disabled=false}};
    rf.onclick=()=>refuse(d,rf,null,m)}
  else if(d.statut==="validee"){c.append(el("small",null,`Validé le ${dlong(ms(d.valideLe))}`));c.append(el("b",null,d.comStatut==="reglee"?("Commission réglée"):(`Commission B2A due : ${fmt(d.commission)} FCFA`)))}
  return c}
async function refuse(d,btn,rp,m){if(btn.dataset.c!=="1"){btn.dataset.c="1";btn.textContent=("Confirmer le refus");return}btn.disabled=true;
  try{const s=await store();await s.doc("veto_demandes/"+d.id).update({statut:"refusee",reponse:rp?rp.value.trim().slice(0,300):"",majLe:s.ts()})}catch(e){m.textContent=("Échec. Réessayez.");m.className="msg err";btn.disabled=false}}
T["agrément {0}"]=["licence {0}","abilitazione {0}","licencia {0}"];
/* brancher l'espace vétérinaire en haut de Marché > Services */
{const SV=window.B2A_SERVICES;if(SV&&SV.render){const orig=SV.render.bind(SV);SV.render=function(Bd){const r=orig(Bd);try{if(B.CFG){vetoHost=el("div");Bd.prepend(vetoHost);listenVeto().catch(()=>{})}}catch(e){}return r}}}

/* ================= 4. Étude du marché (prix relevés sur internet) et prix conseillé =================
   Les prix viennent d'internet (annonces CoinAfrique, Rodwoko…, prix officiels, presse), relevés chaque jour par B2A
   et publiés dans formations/marche/prix.json. Les annonces du Marché de l'application ne sont pas utilisées. */
const TM={
"Prix du marché":["Market prices","Prezzi di mercato","Precios del mercado"],"Étude du marché":["Market study","Studio di mercato","Estudio de mercado"],
"Prix conseillé":["Suggested price","Prezzo consigliato","Precio aconsejado"],"Fourchette du marché":["Market range","Forbice di mercato","Rango del mercado"],
"Prix relevés":["Prices found","Prezzi rilevati","Precios encontrados"],"Tendance 30 j":["30-day trend","Tendenza 30 g","Tendencia 30 d"],"stable":["stable","stabile","estable"],
"dont {0} dans votre ville":["including {0} in your town","di cui {0} nella tua città","de ellos {0} en su ciudad"],
"Catégorie":["Category","Categoria","Categoría"],"Mot-clé (facultatif)":["Keyword (optional)","Parola chiave (facoltativa)","Palabra clave (opcional)"],
"Votre ville (facultatif)":["Your town (optional)","La tua città (facoltativa)","Su ciudad (opcional)"],"ex. ISA Brown, couveuse, panneau solaire":["e.g. ISA Brown, incubator, solar panel","es. ISA Brown, incubatrice, pannello solare","p. ej. ISA Brown, incubadora, panel solar"],
"Toutes":["All","Tutte","Todas"],"Rechercher":["Search","Cerca","Buscar"],"Chargement…":["Loading…","Caricamento…","Cargando…"],
"Médiane des prix trouvés sur internet.":["Median of the prices found online.","Mediana dei prezzi trovati su internet.","Mediana de los precios encontrados en internet."],
"Peu de prix trouvés : prix indicatif.":["Few prices found: indicative price.","Pochi prezzi trovati: prezzo indicativo.","Pocos precios encontrados: precio orientativo."],
"Votre coût d'aliment : {0} F par plateau.":["Your feed cost: {0} F per tray.","Il tuo costo del mangime: {0} F per vassoio.","Su coste de pienso: {0} F por bandeja."],
"Attention : le prix du marché couvre à peine votre coût.":["Warning: the market price barely covers your cost.","Attenzione: il prezzo di mercato copre appena il tuo costo.","Atención: el precio del mercado apenas cubre su coste."],
"Marge estimée sur l'aliment : {0} %":["Estimated margin over feed: {0} %","Margine stimato sul mangime: {0} %","Margen estimado sobre el pienso: {0} %"],
"Autre produit ou matériel":["Other product or equipment","Altro prodotto o materiale","Otro producto o material"],
"Sources":["Sources","Fonti","Fuentes"],"annonce":["listing","annuncio","anuncio"],"prix officiel":["official price","prezzo ufficiale","precio oficial"],"presse":["press","stampa","prensa"],"boutique":["shop","negozio","tienda"],
"Prix relevés sur internet au Burkina Faso (annonces, prix officiels, presse, boutiques), mis à jour chaque jour par B{0}A.":["Prices found online in Burkina Faso (listings, official prices, press, shops), updated every day by B{0}A.","Prezzi rilevati su internet in Burkina Faso (annunci, prezzi ufficiali, stampa, negozi), aggiornati ogni giorno da B{0}A.","Precios encontrados en internet en Burkina Faso (anuncios, precios oficiales, prensa, tiendas), actualizados cada día por B{0}A."],"Mise à jour :":["Updated:","Aggiornamento:","Actualización:"],
"Pas encore de prix trouvé sur internet pour ce produit. B{0}A ajoute des produits à chaque mise à jour.":["No price found online for this product yet. B{0}A adds products at every update.","Nessun prezzo trovato ancora su internet per questo prodotto. B{0}A aggiunge prodotti a ogni aggiornamento.","Todavía no hay precio en internet para este producto. B{0}A añade productos en cada actualización."],
"Les prix du marché demandent une connexion internet la première fois.":["Market prices need an internet connection the first time.","I prezzi di mercato richiedono una connessione internet la prima volta.","Los precios del mercado necesitan conexión a internet la primera vez."],
"Trouvez le bon prix avant de publier votre annonce : prix conseillé et fourchette, d'après les prix trouvés sur internet.":["Find the right price before publishing your listing: suggested price and range, based on prices found online.","Trova il prezzo giusto prima di pubblicare l'annuncio: prezzo consigliato e forbice, secondo i prezzi trovati su internet.","Encuentre el precio correcto antes de publicar su anuncio: precio aconsejado y rango, según los precios encontrados en internet."],
"Voir l'étude du marché":["See the market study","Vedi lo studio di mercato","Ver el estudio de mercado"],
"Relevé automatique":["Automatic readings","Rilevazione automatica","Lectura automática"],
"Dispositif de contrôle B{0}A Smart Building connecté : les mesures sont enregistrées toutes seules.":["B{0}A Smart Building control device connected: measurements are recorded automatically.","Dispositivo di controllo B{0}A Smart Building collegato: le misure vengono registrate da sole.","Dispositivo de control B{0}A Smart Building conectado: las medidas se registran solas."],
"Mode démo du dispositif : les mesures de test sont enregistrées toutes seules.":["Device demo mode: test measurements are recorded automatically.","Modalità demo del dispositivo: le misure di prova vengono registrate da sole.","Modo demo del dispositivo: las medidas de prueba se registran solas."],
"Température moyenne":["Average temperature","Temperatura media","Temperatura media"],"Humidité moyenne":["Average humidity","Umidità media","Humedad media"],
"Ammoniac (NH₃)":["Ammonia (NH₃)","Ammoniaca (NH₃)","Amoníaco (NH₃)"],"Eau aujourd'hui":["Water today","Acqua oggi","Agua hoy"],"Aliment aujourd'hui":["Feed today","Mangime oggi","Pienso hoy"],
"Dernière lecture :":["Last reading:","Ultima lettura:","Última lectura:"],"Une mesure est gardée toutes les {0} minutes.":["One measurement is kept every {0} minutes.","Una misura viene conservata ogni {0} minuti.","Se guarda una medida cada {0} minutos."],
"Le dispositif est relié à un autre lot :":["The device is linked to another batch:","Il dispositivo è collegato a un altro lotto:","El dispositivo está vinculado a otro lote:"],
"Choisissez ce lot dans Poulailler connecté pour enregistrer ses mesures.":["Choose this batch in Connected poultry house to record its measurements.","Scegli questo lotto in Pollaio connesso per registrarne le misure.","Elija este lote en Gallinero conectado para registrar sus medidas."],
"Aucun dispositif connecté pour le moment. Dès que le dispositif de contrôle B{0}A Smart Building est configuré dans Poulailler connecté, les mesures (température, humidité, eau, aliment, air) arrivent ici toutes seules.":["No device connected yet. As soon as the B{0}A Smart Building control device is set up in Connected poultry house, measurements (temperature, humidity, water, feed, air) arrive here automatically.","Nessun dispositivo collegato per ora. Appena il dispositivo di controllo B{0}A Smart Building è configurato in Pollaio connesso, le misure (temperatura, umidità, acqua, mangime, aria) arrivano qui da sole.","Ningún dispositivo conectado por ahora. En cuanto el dispositivo de control B{0}A Smart Building esté configurado en Gallinero conectado, las medidas (temperatura, humedad, agua, pienso, aire) llegan aquí solas."],
"Ouvrir Poulailler connecté":["Open Connected poultry house","Apri Pollaio connesso","Abrir Gallinero conectado"],
"Saisie manuelle (sans dispositif)":["Manual entry (without device)","Inserimento manuale (senza dispositivo)","Entrada manual (sin dispositivo)"],
"Dispositif":["Device","Dispositivo","Dispositivo"],"Démo":["Demo","Demo","Demo"],"Saisie manuelle":["Manual entry","Inserimento manuale","Entrada manual"],
"plateau de {0}":["tray of {0}","vassoio da {0}","bandeja de {0}"],"sac de {0} kg":["{0} kg bag","sacco da {0} kg","saco de {0} kg"],"unité":["unit","unità","unidad"],"litre":["litre","litro","litro"],"tête":["head","capo","cabeza"],
"Aliment (kg)":["Feed (kg)","Mangime (kg)","Pienso (kg)"],"Source":["Source","Fonte","Fuente"]
};
{const D=window.B2A_DICT;["en","it","es"].forEach((l,i)=>{for(const k in TM)if(D[l][k]==null)D[l][k]=TM[k][i]})}
const MCATS=[["aliment","Aliment"],["animaux","Animaux vivants"],["oeufs","Œufs"],["poussins","Poussins"],["viande","Viande et volaille abattue"],["lait","Lait et produits laitiers"],
  ["recoltes","Récoltes (céréales, légumes…)"],["plants","Plants et semences"],["fourrage","Fourrage et foin"],["fumier","Fumier et compost"],["materiel","Matériel"],["autre","Autre"]];
const normT=t=>String(t||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim();
const PRIX_URL="https://azizyou2005.github.io/b2a-smart-farming/formations/marche/prix.json",LS_PRIX="b2a-prix-web",LS_VILLE="b2a-pe-ville";
let prixWeb=null,prixBusy=false;try{prixWeb=JSON.parse(B.lsGet(LS_PRIX)||"null")}catch(e){prixWeb=null}
const repaintPe=()=>document.querySelectorAll("[data-pe]").forEach(x=>{try{x.__pe&&x.__pe()}catch(e){}});
function loadPrix(){if(prixBusy||!navigator.onLine)return;if(prixWeb&&prixWeb.__t&&Date.now()-prixWeb.__t<2*3600e3)return;prixBusy=true;
  fetch(PRIX_URL,{cache:"no-cache"}).then(r=>r.ok?r.json():null).then(j=>{if(!j||!Array.isArray(j.produits)||!Array.isArray(j.releves))return;
    j.releves=j.releves.filter(r=>r&&Number(r.prix)>0&&/^https:\/\//.test(r.url||""));j.__t=Date.now();prixWeb=j;try{B.lsSet(LS_PRIX,JSON.stringify(j))}catch(e){}repaintPe()})
  .catch(()=>{}).finally(()=>{prixBusy=false})}
const langue=()=>{try{return window.B2A_LANG?window.B2A_LANG():"fr"}catch(e){return "fr"}};
const pNom=p=>(p.nom&&(p.nom[langue()]||p.nom.fr))||p.id;
const quant=(a,p)=>{if(!a.length)return null;const i=(a.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return a[lo]+(a[hi]-a[lo])*(i-lo)};
const arr=v=>v<1000?Math.round(v/25)*25:v<10000?Math.round(v/50)*50:Math.round(v/500)*500;
function etude(pid,ville){if(!prixWeb)return null;const p=prixWeb.produits.find(x=>x.id===pid);if(!p)return null;
  const all=prixWeb.releves.filter(r=>r.produit===pid),vil=normT(ville),loc=vil?all.filter(r=>normT(r.ville)===vil):[];const use=loc.length>=3?loc:all;
  if(!use.length)return {p,n:0};
  let P=use.map(r=>+r.prix).sort((a,b)=>a-b);
  if(P.length>=5){const q1=quant(P,.25),q3=quant(P,.75),iq=q3-q1;P=P.filter(v=>v>=q1-1.5*iq&&v<=q3+1.5*iq)}
  const med=quant(P,.5),q1=quant(P,.25),q3=quant(P,.75);
  let tend=null;const H=(prixWeb.historique||{})[pid]||[];if(H.length>=2){const last=H[H.length-1],lim=new Date(new Date(last.date+"T12:00")-28*864e5).toISOString().slice(0,10);
    const old=H.filter(h=>h.date<=lim).pop();if(old&&old.med>0)tend=last.med/old.med-1}
  return {p,n:use.length,nLoc:loc.length,med,q1,q3,prix:arr(med),tend,src:use.slice().sort((a,b)=>a.date<b.date?1:-1)}}
const TYP={annonce:"annonce",officiel:"prix officiel",presse:"presse",boutique:"boutique"};
function peCard(pid,cost){const c=el("div","card");c.setAttribute("data-pe","");
  const paint=()=>{c.innerHTML="";
    if(!prixWeb){c.append(el("p","note",navigator.onLine?"Chargement…":"Les prix du marché demandent une connexion internet la première fois."));return}
    const p=prixWeb.produits.find(x=>x.id===pid);const h=el("h3","sec");h.append(notr(el("span",null,p?pNom(p):pid)));if(p&&p.unite&&!normT(p.nom.fr).includes(normT(p.unite)))h.append(document.createTextNode(" · "),el("span",null,p.unite));c.append(h);
    const e=etude(pid,B.lsGet(LS_VILLE)||"");if(!e||!e.n){c.append(el("p","note","Pas encore de prix trouvé sur internet pour ce produit. B2A ajoute des produits à chaque mise à jour."));return}
    const K=el("div","kpis");
    K.append(A.kpi("Prix conseillé",fmt(e.prix)+" F",("Médiane des prix trouvés sur internet."),"up"));
    K.append(A.kpi("Fourchette du marché",fmt(arr(e.q1))+" – "+fmt(arr(e.q3))+" F"));
    K.append(A.kpi("Prix relevés",fmt(e.n),e.nLoc?(`dont ${fmt(e.nLoc)} dans votre ville`):null));
    if(e.tend!=null)K.append(A.kpi("Tendance 30 j",Math.abs(e.tend)<.02?("stable"):(e.tend>0?"+":"−")+fmt(Math.abs(e.tend)*100)+" %",null,e.tend>.02?"up":e.tend<-.02?"down":null));
    c.append(K);
    if(cost&&cost.v>0){c.append(el("p","note",cost.lbl));const mg=(e.prix-cost.v)/e.prix;
      c.append(el("p",mg<.1?"msg err":"note",mg<.1?("Attention : le prix du marché couvre à peine votre coût."):(`Marge estimée sur l'aliment : ${fmt(mg*100)} %`)))}
    if(e.n<3)c.append(el("p","note","Peu de prix trouvés : prix indicatif."));
    const d=el("details");const sm=el("summary",null,"Sources");d.append(sm);const ul=el("ul","pe-src");
    e.src.slice(0,8).forEach(r=>{const li=el("li");const a=el("a");a.href=r.url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=r.source;notr(a);
      li.append(notr(el("b",null,fmt(r.prix)+" F")),document.createTextNode(" · "),a,document.createTextNode(" · "),notr(el("span",null,(r.ville||"")+" · "+r.date.split("-").reverse().join("/"))),document.createTextNode(" ("),el("span",null,TYP[r.type]||r.type),document.createTextNode(")"));ul.append(li)});
    d.append(ul);c.append(d)};
  c.__pe=paint;paint();loadPrix();return c}
function peTool(host,def){const c=el("div","card");c.setAttribute("data-pe","");const g=el("div","me-form");
  const mk=(lb,node)=>{const f=el("div","field");const id="pe-"+Math.random().toString(36).slice(2,8);const L=el("label",null,lb);L.htmlFor=id;node.id=id;f.append(L,node);g.append(f);return node};
  const sc=el("select");sc.append(new Option("Toutes",""));MCATS.forEach(([k,n])=>sc.append(new Option(n,k)));sc.value=def&&def.cat||"";
  const sm=el("input");sm.maxLength=40;sm.placeholder="ex. ISA Brown, couveuse, panneau solaire";const sv=el("input");sv.maxLength=60;sv.value=B.lsGet(LS_VILLE)||"";
  mk("Catégorie",sc);mk("Mot-clé (facultatif)",sm);mk("Votre ville (facultatif)",sv);c.append(g);
  const out=el("div");out.style.display="grid";out.style.gap="10px";const b=el("button","btn","Rechercher");b.type="button";c.append(b,out);
  const run=()=>{B.lsSet(LS_VILLE,sv.value.trim()||null);out.innerHTML="";if(!prixWeb){out.append(el("p","note",navigator.onLine?"Chargement…":"Les prix du marché demandent une connexion internet la première fois."));return}
    const m=normT(sm.value).split(/\s+/).filter(Boolean);
    const L=prixWeb.produits.filter(p=>(!sc.value||p.cat===sc.value)&&m.every(w=>normT(pNom(p)+" "+p.nom.fr+" "+(p.mots||[]).join(" ")).includes(w)));
    if(!L.length){out.append(el("p","note","Pas encore de prix trouvé sur internet pour ce produit. B2A ajoute des produits à chaque mise à jour."));return}
    L.slice(0,8).forEach(p=>out.append(peCard(p.id)))};
  b.onclick=run;c.__pe=()=>{if(out.childElementCount&&!out.querySelector("[data-pe]"))run()};loadPrix();host.append(c);return c}
function presets(l){const k=espKey(l);return {pondeuse:["oeufs-plateau","pondeuse-reforme","aliment-ponte"],chair:["poulet-chair","poussin-chair","aliment-chair"],
  local:["poulet-local","pintadeau","poussin-local","dinde"],vachelait:["lait","boeuf","aliment-betail"],chevrelait:["lait","chevre"],petitsrum:["mouton","chevre","aliment-betail"],
  bovin:["boeuf","viande-boeuf","aliment-betail"],poisson:["tilapia"],porc:["porc"]}[k]||[]}
function prixNote(D){D.append(el("p","note","Prix relevés sur internet au Burkina Faso (annonces, prix officiels, presse, boutiques), mis à jour chaque jour par B2A."));
  const p=el("p","note");p.setAttribute("data-pe","");p.__pe=()=>{p.innerHTML="";const lb=el("span",null,"Mise à jour :");p.append(lb,document.createTextNode(" "),notr(el("span",null,prixWeb&&prixWeb.maj?new Date(Date.parse(prixWeb.maj)).toLocaleDateString("fr-FR"):"—")))};p.__pe();D.append(p)}
function renderPrix(D,l,s){if(!isPro()){lockCard(D,"prix");return}proHead(D);loadPrix();
  D.append(el("h3","sec","Prix du marché"));prixNote(D);
  presets(l).forEach(id=>{let cost=null;if(id==="oeufs-plateau"&&s&&s.coutOeuf!=null)cost={v:s.coutOeuf*30,lbl:(`Votre coût d'aliment : ${fmt(s.coutOeuf*30)} F par plateau.`)};D.append(peCard(id,cost))});
  D.append(el("h3","sec","Autre produit ou matériel"));peTool(D,{cat:""})}
/* carte « Étude du marché » en haut de Marché > Vendre */
{const body=$("m-body");if(body){let busy=false;new MutationObserver(()=>{if(busy)return;const v=document.querySelector('#m-seg [data-m="vendre"][aria-pressed="true"]');if(!v||$("pe-market"))return;
  busy=true;try{const c=el("section","card");c.id="pe-market";const h=el("h2","sec");h.append(notr(el("span","pro-badge","PRO")),document.createTextNode(("Étude du marché")));c.append(h,el("p","note","Trouvez le bon prix avant de publier votre annonce : prix conseillé et fourchette, d'après les prix trouvés sur internet."));
    if(isPro()){const w=el("div");c.append(w);const b=el("button","btn small ghost","Voir l'étude du marché");b.type="button";b.onclick=()=>{b.remove();peTool(w,{cat:""})};c.append(b)}
    else lockCard(c,"prix");body.prepend(c)}finally{busy=false}}).observe(body,{childList:true})}}

/* ================= onglets du lot ================= */
B.lotTabs=(B.lotTabs||[]).concat([
  {k:"formation",label:"Formation",render:renderFormation},
  {k:"controle",label:"Contrôle",render:renderControle,show:l=>!(A.isCrop&&A.isCrop(l))},
  {k:"veto",label:"Vétérinaire",render:renderVeto,show:l=>!(A.isCrop&&A.isCrop(l))},
  {k:"prix",label:"Prix du marché",render:renderPrix,show:l=>!(A.isCrop&&A.isCrop(l))}
]);
/* clé des boutons d'onglet (pour savoir lequel est ouvert) */
new MutationObserver(()=>{const st=document.querySelector("#lotdetail .subtabs");if(!st)return;const ks=["resume","argent","saisies",...B.lotTabs.map(x=>x.k)];
  [...st.querySelectorAll("button")].forEach((b,i)=>{if(!b.dataset.k)b.dataset.k=ks[i]||""})}).observe(document.body,{childList:true,subtree:true});
window.B2A_PRO={isPro,start,cfg:()=>cfg,lockCard};
})();
