/* B2A Smart Farming : ressources humaines de la ferme
   Fiches des employés, présences, tâches du jour, paie (salaires, avances, primes) et évaluations faites par le propriétaire.
   Partagé avec l'équipe : personnel (nom, poste, téléphone), presences, taches.
   Fonction de la version Pro (abonnement de la ferme, comme la simulation).
   Réservé au propriétaire : rh_contrats (salaire), paies, evaluations (règles Firebase : propriétaire seulement).
   Chaque paiement peut être noté aussi dans le cahier de caisse (catégorie Main-d'œuvre) : il compte alors dans le bilan. */
(function(){
const B=window.B2A;if(!B||!B.app)return;const A=B.app;
const V=document.getElementById("v-personnel");if(!V)return;

/* ================= traductions ================= */
const T={
"Personnel":["Staff","Personale","Personal"],
"la gestion du personnel : présences, tâches, paie et évaluations des employés.":["staff management: attendance, tasks, pay and staff reviews.","la gestione del personale: presenze, compiti, paghe e valutazioni dei dipendenti.","la gestión del personal: asistencia, tareas, pagos y evaluaciones de los empleados."],
"Personnel et équipe":["Staff and team","Personale e squadra","Personal y equipo"],
"Pro : présences, tâches, paie et évaluations des employés":["Pro: staff attendance, tasks, pay and reviews","Pro: presenze, compiti, paghe e valutazioni dei dipendenti","Pro: asistencia, tareas, pagos y evaluaciones de los empleados"],
"Équipe":["Team","Squadra","Equipo"],
"Présences":["Attendance","Presenze","Asistencia"],
"Tâches":["Tasks","Compiti","Tareas"],
"Paie":["Pay","Paghe","Pagos"],
"Évaluations":["Reviews","Valutazioni","Evaluaciones"],
"Employés actifs":["Active staff","Dipendenti attivi","Empleados activos"],
"Présents aujourd'hui":["Present today","Presenti oggi","Presentes hoy"],
"Tâches faites aujourd'hui":["Tasks done today","Compiti fatti oggi","Tareas hechas hoy"],
"Reste à payer ce mois":["Left to pay this month","Da pagare questo mese","Por pagar este mes"],
"+ Ajouter un employé":["+ Add a staff member","+ Aggiungi un dipendente","+ Añadir un empleado"],
"Aucun employé pour l'instant. Ajoutez les personnes qui travaillent à la ferme pour suivre leurs présences, leurs tâches, leur paie et leurs évaluations.":["No staff yet. Add the people who work on the farm to track their attendance, tasks, pay and reviews.","Ancora nessun dipendente. Aggiungi le persone che lavorano in azienda per seguire presenze, compiti, paghe e valutazioni.","Aún no hay empleados. Añada a las personas que trabajan en la granja para seguir su asistencia, tareas, pagos y evaluaciones."],
"Nouvel employé":["New staff member","Nuovo dipendente","Nuevo empleado"],
"Modifier la fiche":["Edit record","Modifica la scheda","Editar la ficha"],
"Nom et prénom":["Full name","Nome e cognome","Nombre y apellido"],
"Poste":["Job","Mansione","Puesto"],
"Téléphone":["Phone","Telefono","Teléfono"],
"Date d'embauche":["Hiring date","Data di assunzione","Fecha de contratación"],
"Salaire mensuel (FCFA)":["Monthly salary (FCFA)","Stipendio mensile (FCFA)","Salario mensual (FCFA)"],
"Visible seulement par le propriétaire.":["Visible only to the owner.","Visibile solo al proprietario.","Visible solo para el propietario."],
"Téléphone de l'équipe (facultatif)":["Team phone (optional)","Telefono della squadra (facoltativo)","Teléfono del equipo (opcional)"],
"Si l'employé a l'application sur son téléphone, il voit ses tâches et les marque faites.":["If the staff member has the app on their phone, they see their tasks and mark them done.","Se il dipendente ha l'app sul telefono, vede i suoi compiti e li segna come fatti.","Si el empleado tiene la aplicación en su teléfono, ve sus tareas y las marca como hechas."],
"Aucun":["None","Nessuno","Ninguno"],
"Soigneur / soigneuse":["Animal keeper","Addetto/a agli animali","Cuidador/a"],
"Ramassage des œufs":["Egg collection","Raccolta delle uova","Recogida de huevos"],
"Gardien":["Guard","Guardiano","Vigilante"],
"Vendeur / vendeuse":["Seller","Venditore/venditrice","Vendedor/a"],
"Chauffeur / livreur":["Driver / delivery","Autista / fattorino","Chófer / repartidor"],
"Gérant de la ferme":["Farm manager","Gestore dell'azienda","Encargado de la granja"],
"Ouvrier agricole":["Farm worker","Operaio agricolo","Peón agrícola"],
"Autre":["Other","Altro","Otro"],
"Indiquez le nom.":["Enter the name.","Indica il nome.","Indique el nombre."],
"Enregistrer":["Save","Salva","Guardar"],
"Annuler":["Cancel","Annulla","Cancelar"],
"Enregistré.":["Saved.","Salvato.","Guardado."],
"Échec de l'enregistrement.":["Saving failed.","Salvataggio non riuscito.","No se pudo guardar."],
"Retirer de l'équipe":["Remove from team","Togli dalla squadra","Quitar del equipo"],
"Confirmer : retirer":["Confirm: remove","Conferma: togli","Confirmar: quitar"],
"Anciens employés":["Former staff","Ex dipendenti","Antiguos empleados"],
"Réintégrer":["Reinstate","Reintegra","Reincorporar"],
"Appeler":["Call","Chiama","Llamar"],
"Modifier":["Edit","Modifica","Editar"],
"Évaluer":["Review","Valuta","Evaluar"],
"Présent":["Present","Presente","Presente"],
"Absent":["Absent","Assente","Ausente"],
"Retard":["Late","In ritardo","Retraso"],
"Congé":["Leave","Ferie","Permiso"],
"Malade":["Sick","Malato","Enfermo"],
"Pas noté":["Not recorded","Non segnato","Sin anotar"],
"Présences du mois":["Attendance this month","Presenze del mese","Asistencia del mes"],
"Touchez la situation de chaque employé pour la journée choisie.":["Tap each staff member's status for the chosen day.","Tocca la situazione di ogni dipendente per il giorno scelto.","Toque la situación de cada empleado para el día elegido."],
"Tout le monde présent":["Everyone present","Tutti presenti","Todos presentes"],
"Jours présents":["Days present","Giorni presenti","Días presentes"],
"Absences":["Absences","Assenze","Ausencias"],
"Retards":["Late arrivals","Ritardi","Retrasos"],
"Congés / maladie":["Leave / sick","Ferie / malattia","Permisos / enfermedad"],
"Taux de présence":["Attendance rate","Tasso di presenza","Tasa de asistencia"],
"Jour précédent":["Previous day","Giorno precedente","Día anterior"],
"Jour suivant":["Next day","Giorno successivo","Día siguiente"],
"Mois précédent":["Previous month","Mese precedente","Mes anterior"],
"Mois suivant":["Next month","Mese successivo","Mes siguiente"],
"Ajoutez d'abord un employé dans l'onglet Équipe.":["First add a staff member in the Team tab.","Prima aggiungi un dipendente nella scheda Squadra.","Primero añada un empleado en la pestaña Equipo."],
"Tâches du jour":["Today's tasks","Compiti del giorno","Tareas del día"],
"Mes tâches du jour":["My tasks today","I miei compiti di oggi","Mis tareas del día"],
"+ Nouvelle tâche":["+ New task","+ Nuovo compito","+ Nueva tarea"],
"Aucune tâche prévue ce jour.":["No task planned for this day.","Nessun compito previsto per questo giorno.","No hay tareas previstas para este día."],
"Tâche":["Task","Compito","Tarea"],
"Qui ?":["Who?","Chi?","¿Quién?"],
"Toute l'équipe":["Whole team","Tutta la squadra","Todo el equipo"],
"À partir du":["Starting on","A partire dal","A partir del"],
"Répétition":["Repeat","Ripetizione","Repetición"],
"Une seule fois":["Once","Una sola volta","Una sola vez"],
"Chaque jour":["Every day","Ogni giorno","Cada día"],
"Chaque semaine":["Every week","Ogni settimana","Cada semana"],
"Nourrir les animaux":["Feed the animals","Dare da mangiare agli animali","Alimentar a los animales"],
"Donner l'eau":["Give water","Dare l'acqua","Dar agua"],
"Nettoyer le bâtiment":["Clean the building","Pulire il capannone","Limpiar el galpón"],
"Changer la litière":["Change the litter","Cambiare la lettiera","Cambiar la cama"],
"Faire les soins":["Give the treatments","Fare le cure","Hacer los cuidados"],
"Noter la saisie du jour":["Enter today's record","Fare la registrazione del giorno","Anotar el registro del día"],
"Indiquez la tâche.":["Enter the task.","Indica il compito.","Indique la tarea."],
"Fait":["Done","Fatto","Hecho"],
"À faire":["To do","Da fare","Por hacer"],
"Supprimer":["Delete","Elimina","Eliminar"],
"Confirmer : supprimer":["Confirm: delete","Conferma: elimina","Confirmar: eliminar"],
"Tâches faites ce mois":["Tasks done this month","Compiti fatti questo mese","Tareas hechas este mes"],
"Tâches oubliées hier : {0}":["Tasks forgotten yesterday: {0}","Compiti dimenticati ieri: {0}","Tareas olvidadas ayer: {0}"],
"Salaire":["Salary","Stipendio","Salario"],
"Avance":["Advance","Anticipo","Anticipo"],
"Prime":["Bonus","Premio","Prima"],
"Salaire du mois":["Monthly salary","Stipendio del mese","Salario del mes"],
"Déjà payé":["Already paid","Già pagato","Ya pagado"],
"Reste à payer":["Left to pay","Da pagare","Por pagar"],
"Total payé ce mois":["Total paid this month","Totale pagato questo mese","Total pagado este mes"],
"Payer":["Pay","Paga","Pagar"],
"Nouveau paiement":["New payment","Nuovo pagamento","Nuevo pago"],
"Type":["Type","Tipo","Tipo"],
"Montant (FCFA)":["Amount (FCFA)","Importo (FCFA)","Importe (FCFA)"],
"Mode de paiement":["Payment method","Metodo di pagamento","Forma de pago"],
"Espèces":["Cash","Contanti","Efectivo"],
"Virement":["Bank transfer","Bonifico","Transferencia"],
"Date":["Date","Data","Fecha"],
"Noter aussi dans la caisse (Main-d'œuvre)":["Also record in the cash book (Labour)","Segna anche in cassa (Manodopera)","Anotar también en la caja (Mano de obra)"],
"Le paiement compte alors dans les dépenses et le bilan de l'année.":["The payment then counts in the costs and the yearly report.","Il pagamento conta così nelle spese e nel bilancio dell'anno.","El pago cuenta entonces en los gastos y el balance del año."],
"Indiquez un montant.":["Enter an amount.","Indica un importo.","Indique un importe."],
"Paiements du mois":["Payments this month","Pagamenti del mese","Pagos del mes"],
"Aucun paiement ce mois.":["No payment this month.","Nessun pagamento questo mese.","Ningún pago este mes."],
"Salaire non indiqué : ajoutez-le dans la fiche de l'employé.":["Salary not set: add it in the staff record.","Stipendio non indicato: aggiungilo nella scheda del dipendente.","Salario no indicado: añádalo en la ficha del empleado."],
"Payé":["Paid","Pagato","Pagado"],
"Envoyer le reçu par WhatsApp":["Send the receipt by WhatsApp","Invia la ricevuta via WhatsApp","Enviar el recibo por WhatsApp"],
"Nouvelle évaluation":["New review","Nuova valutazione","Nueva evaluación"],
"Employé":["Staff member","Dipendente","Empleado"],
"Ponctualité":["Punctuality","Puntualità","Puntualidad"],
"Qualité du travail":["Quality of work","Qualità del lavoro","Calidad del trabajo"],
"Soin des animaux":["Animal care","Cura degli animali","Cuidado de los animales"],
"Hygiène et propreté":["Hygiene and cleanliness","Igiene e pulizia","Higiene y limpieza"],
"Comportement et honnêteté":["Behaviour and honesty","Comportamento e onestà","Comportamiento y honestidad"],
"Commentaire (facultatif)":["Comment (optional)","Commento (facoltativo)","Comentario (opcional)"],
"ex. très sérieux, doit mieux nettoyer les abreuvoirs":["e.g. very reliable, must clean the drinkers better","es. molto serio, deve pulire meglio gli abbeveratoi","p. ej. muy serio, debe limpiar mejor los bebederos"],
"Donnez une note de {0} à {1} à chaque critère.":["Give each criterion a score from {0} to {1}.","Dai un voto da {0} a {1} a ogni criterio.","Dé una nota de {0} a {1} a cada criterio."],
"Notez chaque critère.":["Score each criterion.","Valuta ogni criterio.","Califique cada criterio."],
"Choisissez l'employé.":["Choose the staff member.","Scegli il dipendente.","Elija el empleado."],
"Enregistrer l'évaluation":["Save the review","Salva la valutazione","Guardar la evaluación"],
"Chiffres du mois (automatiques)":["This month's figures (automatic)","Dati del mese (automatici)","Cifras del mes (automáticas)"],
"Dernière note":["Latest score","Ultimo voto","Última nota"],
"Pas encore évalué":["Not reviewed yet","Non ancora valutato","Aún no evaluado"],
"Historique":["History","Storico","Historial"],
"Excellent":["Excellent","Eccellente","Excelente"],
"Bien":["Good","Buono","Bien"],
"Moyen":["Average","Medio","Regular"],
"À améliorer":["Needs improvement","Da migliorare","A mejorar"],
"Insuffisant":["Poor","Insufficiente","Insuficiente"],
"En progrès":["Improving","In miglioramento","Mejorando"],
"En baisse":["Declining","In calo","Empeorando"],
"Les salaires, la paie et les évaluations sont visibles seulement par le propriétaire de la ferme.":["Salaries, pay and reviews are visible only to the farm owner.","Stipendi, paghe e valutazioni sono visibili solo al proprietario dell'azienda.","Los salarios, los pagos y las evaluaciones solo los ve el propietario de la granja."],
"Vos tâches sont ci-dessous. Touchez « Fait » quand une tâche est terminée : le propriétaire le voit tout de suite.":["Your tasks are below. Tap \"Done\" when a task is finished: the owner sees it right away.","I tuoi compiti sono qui sotto. Tocca « Fatto » quando un compito è finito: il proprietario lo vede subito.","Sus tareas están abajo. Toque « Hecho » cuando termine una tarea: el propietario lo ve enseguida."],
"Fait par {q0}":["Done by {q0}","Fatto da {q0}","Hecho por {q0}"],
"Pour {q0}":["For {q0}","Per {q0}","Para {q0}"],
"Reçu de paiement":["Payment receipt","Ricevuta di pagamento","Recibo de pago"],
"Ressources humaines : présences, tâches, paie et évaluations de l'équipe.":["Human resources: team attendance, tasks, pay and reviews.","Risorse umane: presenze, compiti, paghe e valutazioni della squadra.","Recursos humanos: asistencia, tareas, pagos y evaluaciones del equipo."],
"Toute la semaine":["All week","Tutta la settimana","Toda la semana"],
"Employés":["Staff","Dipendenti","Empleados"],
"Lecture seule : vous ne pouvez pas modifier.":["Read only: you cannot make changes.","Sola lettura: non puoi modificare.","Solo lectura: no puede modificar."]
};
{const D=window.B2A_DICT=window.B2A_DICT||{};["en","it","es"].forEach((l,i)=>{D[l]=D[l]||{};for(const k in T)if(D[l][k]==null)D[l][k]=T[k][i]})}

/* ================= outils ================= */
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const notr=e=>{e.setAttribute("data-notr","");return e};
const btn=(t,c,fn)=>{const b=el("button",c||"btn small",t);b.type="button";if(fn)b.onclick=fn;return b};
const today=()=>A.today?A.today():new Date().toISOString().slice(0,10);
const F=v=>A.fmt(Math.round(Number(v)||0))+" F";
const fdate=d=>A.fdate?A.fdate(d):d;
const addDay=(d,n)=>{const x=new Date(d+"T12:00");x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
const addMonth=(m,n)=>{const [y,mo]=m.split("-").map(Number);const d=new Date(y,mo-1+n,1);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")};
const mLabel=m=>new Date(m+"-15T12:00").toLocaleDateString("fr-FR",{month:"long",year:"numeric"});
const dLabel=d=>new Date(d+"T12:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
const daysOf=m=>{const [y,mo]=m.split("-").map(Number);const n=new Date(y,mo,0).getDate();const t=today();const out=[];for(let i=1;i<=n;i++){const d=m+"-"+String(i).padStart(2,"0");if(d<=t)out.push(d)}return out};
const field=(lbl,input,small)=>{const f=el("div","field");const id="rh-"+Math.random().toString(36).slice(2,8);input.id=id;const l=el("label",null,lbl);l.htmlFor=id;f.append(l,input);if(small)f.append(el("small",null,small));return f};
const inp=(type,val,ph)=>{const i=el("input");i.type=type;if(val!=null)i.value=val;if(ph)i.placeholder=ph;if(type==="number"){i.min="0";i.inputMode="decimal"}return i};
const sel=(opts,val)=>{const s=el("select");opts.forEach(([v,t,nt])=>{const o=el("option",null,t);o.value=v;if(nt)o.setAttribute("data-notr","");s.append(o)});if(val!=null)s.value=val;return s};
const msgEl=()=>{const m=el("span","msg");m.setAttribute("aria-live","polite");return m};
const say=(m,t,ok)=>{m.textContent=t;m.className="msg "+(ok?"good":"err")};

const POSTES=["Soigneur / soigneuse","Ramassage des œufs","Gardien","Vendeur / vendeuse","Chauffeur / livreur","Gérant de la ferme","Ouvrier agricole","Autre"];
const PST=[["present","Présent","s-ok"],["retard","Retard","s-warn"],["absent","Absent","s-bad"],["conge","Congé","s-none"],["malade","Malade","s-none"]];
const MODES=[["especes","Espèces"],["orange","Orange Money"],["moov","Moov Money"],["wave","Wave"],["virement","Virement"]];
const PTYPES=[["salaire","Salaire"],["avance","Avance"],["prime","Prime"]];
const CRIT=[["ponctualite","Ponctualité"],["travail","Qualité du travail"],["animaux","Soin des animaux"],["hygiene","Hygiène et propreté"],["comportement","Comportement et honnêteté"]];
const TSUG=["Nourrir les animaux","Donner l'eau","Ramassage des œufs","Nettoyer le bâtiment","Changer la litière","Faire les soins","Noter la saisie du jour"];
const appr=n=>n>=4.5?["Excellent","s-ok"]:n>=3.5?["Bien","s-ok"]:n>=2.5?["Moyen","s-warn"]:n>=1.5?["À améliorer","s-warn"]:["Insuffisant","s-bad"];

/* ================= état ================= */
let db=null,boss=false,sub="equipe";
let pers=[],pres={},taches=[],contrats={},paies=[],evals=[];
let day=today(),month=today().slice(0,7);
let form=null;   // formulaire ouvert : {k:"pers"|"tache"|"paie"|"eval", ...}
const canW=()=>!A.can||A.can()!==false;
const active=()=>pers.filter(p=>p.actif!==false).sort((a,b)=>(a.nom||"").localeCompare(b.nom||""));
const pName=id=>{const p=pers.find(x=>x.id===id);return p?p.nom||"—":"—"};
const myPid=()=>{const u=B.team&&B.team.uid;if(!u)return null;const p=pers.find(x=>x.membre===u&&x.actif!==false);return p?p.id:null};
function isBoss(){if(!db)return false;if(db.kind==="local"||!B.farm)return true;const r=B.team&&B.team.role;return r==="proprietaire"||r==="libre"}

/* tâches prévues un jour donné */
function tasksOn(d){return taches.filter(t=>{if(!t.date||t.date>d)return false;if(t.fin&&t.fin<d)return false;
  if(t.rep==="jour")return true;if(t.rep==="semaine")return new Date(t.date+"T12:00").getDay()===new Date(d+"T12:00").getDay();return t.date===d})}
const doneOn=(t,d)=>!!(t.faits&&t.faits[d]);

/* chiffres automatiques d'un employé pour un mois */
function stats(pid,m){const days=daysOf(m);let pr=0,ab=0,re=0,co=0,noted=0;
  days.forEach(d=>{const s=(pres[d]||{})[pid];if(!s)return;noted++;if(s==="present")pr++;else if(s==="retard"){pr++;re++}else if(s==="absent")ab++;else co++});
  let tot=0,ok=0;days.forEach(d=>{if(d===today())return;tasksOn(d).forEach(t=>{if(t.pid&&t.pid!==pid)return;if(!t.pid)return;tot++;if(doneOn(t,d))ok++})});
  const base=noted-co;return {pr,ab,re,co,noted,taux:base>0?Math.round(pr/base*100):null,tTot:tot,tOk:ok,tTaux:tot?Math.round(ok/tot*100):null}}
function paidIn(pid,m){return paies.filter(p=>p.pid===pid&&p.mois===m).reduce((s,p)=>s+(Number(p.montant)||0),0)}
function lastEval(pid){const l=evals.filter(e=>e.pid===pid).sort((a,b)=>(b.date||"").localeCompare(a.date||"")||(b.createdAt||0)-(a.createdAt||0));return l}

/* ================= rendu ================= */
function render(){
  boss=isBoss();V.innerHTML="";
  const head=el("section","card");const h=el("div","row between");h.append(el("h2","sec","Personnel"));head.append(h);
  head.append(el("p","note",boss?"Ressources humaines : présences, tâches, paie et évaluations de l'équipe.":"Vos tâches sont ci-dessous. Touchez « Fait » quand une tâche est terminée : le propriétaire le voit tout de suite."));
  if(!canW())head.append(el("p","note","Lecture seule : vous ne pouvez pas modifier."));
  V.append(head);
  /* fonction de la version Pro : sans abonnement, on montre l'offre Pro */
  const P=window.B2A_PRO;
  if(!(P&&P.isPro&&P.isPro())){h.firstChild.prepend(notr(el("span","pro-badge","PRO")),document.createTextNode(" "));
    const c=el("section","card");if(P&&P.lockCard)P.lockCard(c,"personnel");else c.append(el("p","note","La version Pro demande une connexion internet et un compte (inscription)."));V.append(c);return}
  if(!boss){sub="taches";renderTaches();return}
  const tabs=[["equipe","Équipe"],["presences","Présences"],["taches","Tâches"],["paie","Paie"],["evals","Évaluations"]];
  const st=el("div","subtabs rh-tabs");st.style.gridTemplateColumns="repeat(5,1fr)";st.setAttribute("role","group");
  tabs.forEach(([k,t])=>{const b=btn(t,null,()=>{sub=k;form=null;render()});b.className="";b.setAttribute("aria-pressed",String(sub===k));st.append(b)});
  head.append(st);
  ({equipe:renderEquipe,presences:renderPresences,taches:renderTaches,paie:renderPaie,evals:renderEvals})[sub]();
}

/* ---------- Équipe ---------- */
function renderEquipe(){
  const L=active(),t=today();
  const tiles=el("div","tiles");
  const tile=(l,v,c)=>{const x=el("div","tile"+(c?" "+c:""));x.append(el("span",null,l),el("b",null,v));tiles.append(x)};
  tile("Employés actifs",String(L.length));
  tile("Présents aujourd'hui",String(L.filter(p=>["present","retard"].includes((pres[t]||{})[p.id])).length)+" / "+L.length);
  const tt=tasksOn(t);tile("Tâches faites aujourd'hui",tt.filter(x=>doneOn(x,t)).length+" / "+tt.length);
  const reste=L.reduce((s,p)=>s+Math.max(0,(Number((contrats[p.id]||{}).salaire)||0)-paidIn(p.id,t.slice(0,7))),0);
  tile("Reste à payer ce mois",F(reste),reste>0?"warn":"ok");
  V.append(tiles);
  if(form&&form.k==="pers"){V.append(persForm());return}
  const c=el("section","card");const r=el("div","row between");r.append(el("h3","sec","Équipe"));
  if(canW())r.append(btn("+ Ajouter un employé","btn small",()=>{form={k:"pers"};render()}));c.append(r);
  if(!L.length)c.append(el("p","note","Aucun employé pour l'instant. Ajoutez les personnes qui travaillent à la ferme pour suivre leurs présences, leurs tâches, leur paie et leurs évaluations."));
  const ul=el("ul","rh-list");
  L.forEach(p=>{const li=el("li","rh-item");const top=el("div","row between");
    const nm=notr(el("strong",null,p.nom||"—"));const ps=(pres[t]||{})[p.id];const pst=PST.find(x=>x[0]===ps);
    top.append(nm,pst?el("span","pill "+pst[2],pst[1]):el("span","pill s-none","Pas noté"));li.append(top);
    const info=el("div","note");info.append(el("span",null,p.poste||""));if(p.tel){info.append(document.createTextNode(" · "));info.append(notr(el("span",null,p.tel)))}li.append(info);
    const s=stats(p.id,t.slice(0,7)),ev=lastEval(p.id)[0];const ln=el("div","rh-mini");
    ln.append(el("span",null,"Taux de présence"),notr(el("b",null,s.taux==null?"—":s.taux+" %")));
    ln.append(el("span",null,"Dernière note"),ev?notr(el("b",null,A.fmt(ev.moyenne,1)+" / 5")):el("b",null,"—"));
    const sal=Number((contrats[p.id]||{}).salaire)||0;if(sal){ln.append(el("span",null,"Reste à payer"),notr(el("b",null,F(Math.max(0,sal-paidIn(p.id,t.slice(0,7)))))))}
    li.append(ln);
    const a=el("div","row");
    if(p.tel){const call=el("a","btn small ghost","Appeler");call.href="tel:"+p.tel.replace(/[^\d+]/g,"");a.append(call)}
    if(canW()){a.append(btn("Modifier","btn small ghost",()=>{form={k:"pers",id:p.id};render()}));
      a.append(btn("Évaluer","btn small ghost",()=>{sub="evals";form={k:"eval",pid:p.id};render()}))}
    li.append(a);ul.append(li)});
  c.append(ul);V.append(c);
  const old=pers.filter(p=>p.actif===false);
  if(old.length){const d=el("details","box card");d.append(el("summary",null,"Anciens employés"));const u=el("ul","rh-list");
    old.forEach(p=>{const li=el("li","row between");li.append(notr(el("span",null,p.nom||"—")));if(canW())li.append(btn("Réintégrer","btn small ghost",async()=>{try{await db.doc("personnel/"+p.id).update({actif:true})}catch(e){}}));u.append(li)});
    d.append(u);V.append(d)}
}
function persForm(){
  const p=form.id?pers.find(x=>x.id===form.id)||{}:{};const c=el("section","card");
  c.append(el("h3","sec",form.id?"Modifier la fiche":"Nouvel employé"));
  const nom=inp("text",p.nom||"","ex. Awa Ouédraogo");nom.maxLength=60;
  const poste=sel(POSTES.map(x=>[x,x]),POSTES.includes(p.poste)?p.poste:(p.poste?"Autre":POSTES[0]));
  const tel=inp("tel",p.tel||"","ex. 70 12 34 56");tel.inputMode="tel";tel.maxLength=25;
  const emb=inp("date",p.embauche||today());
  const sal=inp("number",(contrats[form.id]||{}).salaire||"","0");
  const mem=sel([["","Aucun"],...((B.team&&B.team.list)||[]).filter(m=>m.statut==="actif"&&m.role!=="proprietaire").map(m=>[m.id,m.name||"—",1])],p.membre||"");
  const g=el("div","grid2");g.append(field("Nom et prénom",notr(nom)),field("Poste",poste),field("Téléphone",tel),field("Date d'embauche",emb),
    field("Salaire mensuel (FCFA)",sal,"Visible seulement par le propriétaire."));
  if(db.kind==="cloud")g.append(field("Téléphone de l'équipe (facultatif)",mem,"Si l'employé a l'application sur son téléphone, il voit ses tâches et les marque faites."));
  c.append(g);
  const m=msgEl();const r=el("div","row");
  r.append(btn("Enregistrer","btn",async()=>{const n=nom.value.trim();if(!n){say(m,"Indiquez le nom.");return}
    const id=form.id||B.newId();
    const d={nom:n.slice(0,60),poste:poste.value,tel:tel.value.trim().slice(0,25),embauche:emb.value||"",membre:mem.value||null,actif:true};
    if(!form.id)d.createdAt=Date.now();
    try{await db.doc("personnel/"+id).set(d,{merge:true});await db.doc("rh_contrats/"+id).set({salaire:Number(sal.value)||0},{merge:true});form=null;render()}catch(e){say(m,"Échec de l'enregistrement.")}}));
  r.append(btn("Annuler","btn ghost",()=>{form=null;render()}));
  if(form.id){const x=btn("Retirer de l'équipe","btn small ghost danger");x.onclick=async()=>{if(x.dataset.c!=="1"){x.dataset.c="1";x.textContent="Confirmer : retirer";return}
    try{await db.doc("personnel/"+form.id).update({actif:false});form=null;render()}catch(e){say(m,"Échec de l'enregistrement.")}};r.append(x)}
  r.append(m);c.append(r);setTimeout(()=>nom.focus(),0);return c}

/* ---------- Présences ---------- */
function dayNav(onChange){const r=el("div","row between rh-nav");
  r.append(btn("‹","btn small ghost",()=>{day=addDay(day,-1);onChange()}));r.lastChild.setAttribute("aria-label","Jour précédent");
  const d=inp("date",day);d.max=today();d.onchange=()=>{if(d.value){day=d.value>today()?today():d.value;onChange()}};d.setAttribute("aria-label","Date");d.style.maxWidth="170px";
  r.append(d);const nx=btn("›","btn small ghost",()=>{if(day<today()){day=addDay(day,1);onChange()}});nx.setAttribute("aria-label","Jour suivant");nx.disabled=day>=today();r.append(nx);return r}
function monthNav(onChange){const r=el("div","row between rh-nav");
  const pv=btn("‹","btn small ghost",()=>{month=addMonth(month,-1);onChange()});pv.setAttribute("aria-label","Mois précédent");
  const nx=btn("›","btn small ghost",()=>{if(month<today().slice(0,7)){month=addMonth(month,1);onChange()}});nx.setAttribute("aria-label","Mois suivant");nx.disabled=month>=today().slice(0,7);
  r.append(pv,el("strong",null,mLabel(month)),nx);return r}
function renderPresences(){
  const L=active();const c=el("section","card");c.append(el("h3","sec","Présences"));
  if(!L.length){c.append(el("p","note","Ajoutez d'abord un employé dans l'onglet Équipe."));V.append(c);return}
  c.append(dayNav(render),el("p","note",dLabel(day)),el("p","note","Touchez la situation de chaque employé pour la journée choisie."));
  const cur=pres[day]||{};
  const save=async np=>{pres[day]=np;render();try{await db.doc("presences/"+day).set({date:day,p:np,by:B.me})}catch(e){}};
  if(canW())c.append(btn("Tout le monde présent","btn small ghost",()=>{const np={...cur};L.forEach(p=>{if(!np[p.id])np[p.id]="present"});save(np)}));
  const ul=el("ul","rh-list");
  L.forEach(p=>{const li=el("li","rh-item");li.append(notr(el("strong",null,p.nom||"—")));
    const g=el("div","chips");g.setAttribute("role","group");
    PST.forEach(([k,t])=>{const b=el("button","chip",t);b.type="button";b.setAttribute("aria-pressed",String(cur[p.id]===k));b.disabled=!canW();
      b.onclick=()=>{const np={...cur};if(np[p.id]===k)delete np[p.id];else np[p.id]=k;save(np)};g.append(b)});
    li.append(g);ul.append(li)});
  c.append(ul);V.append(c);
  /* résumé du mois */
  const m=el("section","card");m.append(el("h3","sec","Présences du mois"),monthNav(render));
  const tw=el("div","tablewrap");const tb=el("table","data");const th=el("tr");
  ["Employé","Jours présents","Retards","Absences","Congés / maladie","Taux de présence"].forEach((x,i)=>{const e=el("th",i?"n":null,x);th.append(e)});
  const thead=el("thead");thead.append(th);tb.append(thead);const body=el("tbody");
  L.forEach(p=>{const s=stats(p.id,month);const tr=el("tr");tr.append(notr(el("td",null,p.nom||"—")));
    [s.pr,s.re,s.ab,s.co].forEach(v=>tr.append(notr(el("td","n",String(v)))));tr.append(notr(el("td","n",s.taux==null?"—":s.taux+" %")));body.append(tr)});
  tb.append(body);tw.append(tb);m.append(tw);V.append(m)}

/* ---------- Tâches ---------- */
function renderTaches(){
  if(form&&form.k==="tache"){V.append(tacheForm());return}
  const mine=boss?null:myPid();
  const c=el("section","card");const r=el("div","row between");r.append(el("h3","sec",boss?"Tâches du jour":"Mes tâches du jour"));
  if(boss&&canW())r.append(btn("+ Nouvelle tâche","btn small",()=>{form={k:"tache"};render()}));c.append(r);
  c.append(dayNav(render),el("p","note",dLabel(day)));
  if(boss&&day===today()){const y=addDay(day,-1);const miss=tasksOn(y).filter(t=>!doneOn(t,y)).length;if(miss)c.append(el("p","msg err","Tâches oubliées hier : "+miss))}
  let list=tasksOn(day);if(!boss&&mine)list=list.filter(t=>!t.pid||t.pid===mine);
  list.sort((a,b)=>doneOn(a,day)-doneOn(b,day)||(a.titre||"").localeCompare(b.titre||""));
  if(!list.length)c.append(el("p","note","Aucune tâche prévue ce jour."));
  const ul=el("ul","rh-list");
  list.forEach(t=>{const li=el("li","rh-item");const ok=doneOn(t,day);const top=el("div","row between");
    const tt=el("strong",null,t.titre||"");if(!TSUG.includes(t.titre))notr(tt);if(ok)tt.style.textDecoration="line-through";top.append(tt);
    const b=el("button","btn small"+(ok?" ghost":""),ok?"Fait":"À faire");b.type="button";b.setAttribute("aria-pressed",String(ok));b.disabled=!canW();
    b.onclick=async()=>{const f={...(t.faits||{})};if(ok)delete f[day];else f[day]={par:B.lsGet(B.LS_NAME)||"",le:Date.now()};t.faits=f;render();
      try{await db.doc("taches/"+t.id).update({faits:f})}catch(e){}};top.append(b);li.append(top);
    const info=el("div","note");info.append(t.pid?notr(el("span",null,pName(t.pid))):el("span",null,"Toute l'équipe"));
    info.append(document.createTextNode(" · "));info.append(el("span",null,t.rep==="jour"?"Chaque jour":t.rep==="semaine"?"Chaque semaine":"Une seule fois"));li.append(info);
    if(ok&&t.faits[day].par){const w=el("div","note");w.append(el("span",null,"Fait"),document.createTextNode(" · "),notr(el("span",null,t.faits[day].par)));li.append(w)}
    if(boss&&canW()){const x=btn("Supprimer","btn small ghost danger");x.onclick=async()=>{if(x.dataset.c!=="1"){x.dataset.c="1";x.textContent="Confirmer : supprimer";return}
      try{if(t.rep&&t.rep!=="une"&&t.date<day)await db.doc("taches/"+t.id).update({fin:addDay(day,-1)});else await db.doc("taches/"+t.id).delete()}catch(e){}};li.append(x)}
    ul.append(li)});
  c.append(ul);V.append(c);
  if(boss){const L=active();if(!L.length)return;const m=el("section","card");m.append(el("h3","sec","Tâches faites ce mois"),monthNav(render));
    const ul2=el("ul","rh-list");L.forEach(p=>{const s=stats(p.id,month);const li=el("li","row between");li.append(notr(el("span",null,p.nom||"—")),notr(el("b",null,s.tTot?s.tOk+" / "+s.tTot+" ("+s.tTaux+" %)":"—")));ul2.append(li)});
    m.append(ul2);V.append(m)}}
function tacheForm(){const c=el("section","card");c.append(el("h3","sec","+ Nouvelle tâche"));
  const ti=inp("text","","ex. Nourrir les animaux");ti.maxLength=80;
  const ch=el("div","chips");TSUG.forEach(s=>{const b=el("button","chip",s);b.type="button";b.onclick=()=>{ti.value=s};ch.append(b)});
  const who=sel([["","Toute l'équipe"],...active().map(p=>[p.id,p.nom||"—",1])]);
  const d=inp("date",day);const rep=sel([["une","Une seule fois"],["jour","Chaque jour"],["semaine","Chaque semaine"]],"jour");
  const g=el("div","grid2");g.append(field("Tâche",ti),field("Qui ?",who),field("À partir du",d),field("Répétition",rep));
  c.append(ch,g);const m=msgEl();const r=el("div","row");
  r.append(btn("Enregistrer","btn",async()=>{const t=ti.value.trim();if(!t){say(m,"Indiquez la tâche.");return}
    try{await db.collection("taches").doc().set({titre:t.slice(0,80),pid:who.value||"",date:d.value||today(),rep:rep.value,faits:{},by:B.me,createdAt:Date.now()});form=null;render()}catch(e){say(m,"Échec de l'enregistrement.")}}));
  r.append(btn("Annuler","btn ghost",()=>{form=null;render()}),m);c.append(r);return c}

/* ---------- Paie (propriétaire) ---------- */
function renderPaie(){
  const L=active();
  if(form&&form.k==="paie"){V.append(paieForm());return}
  const c=el("section","card");c.append(el("h3","sec","Paie"),monthNav(render));
  if(!L.length){c.append(el("p","note","Ajoutez d'abord un employé dans l'onglet Équipe."));V.append(c);return}
  const totPaid=paies.filter(p=>p.mois===month).reduce((s,p)=>s+(Number(p.montant)||0),0);
  const tiles=el("div","tiles");const tl=(l,v,cl)=>{const x=el("div","tile"+(cl?" "+cl:""));x.append(el("span",null,l),notr(el("b",null,v)));tiles.append(x)};
  const reste=L.reduce((s,p)=>s+Math.max(0,(Number((contrats[p.id]||{}).salaire)||0)-paidIn(p.id,month)),0);
  tl("Total payé ce mois",F(totPaid));tl("Reste à payer",F(reste),reste>0?"warn":"ok");c.append(tiles);
  const ul=el("ul","rh-list");
  L.forEach(p=>{const sal=Number((contrats[p.id]||{}).salaire)||0,pd=paidIn(p.id,month),rs=Math.max(0,sal-pd);
    const li=el("li","rh-item");const top=el("div","row between");top.append(notr(el("strong",null,p.nom||"—")));
    if(sal)top.append(el("span","pill "+(rs?"s-warn":"s-ok"),rs?"Reste à payer":"Payé"));li.append(top);
    if(!sal)li.append(el("p","note","Salaire non indiqué : ajoutez-le dans la fiche de l'employé."));
    const ln=el("div","rh-mini");ln.append(el("span",null,"Salaire du mois"),notr(el("b",null,F(sal))),el("span",null,"Déjà payé"),notr(el("b",null,F(pd))),el("span",null,"Reste à payer"),notr(el("b",null,F(rs))));li.append(ln);
    if(canW())li.append(btn("Payer","btn small",()=>{form={k:"paie",pid:p.id,reste:rs};render()}));ul.append(li)});
  c.append(ul);V.append(c);
  const h=el("section","card");h.append(el("h3","sec","Paiements du mois"));
  const lst=paies.filter(p=>p.mois===month).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  if(!lst.length)h.append(el("p","note","Aucun paiement ce mois."));
  const u=el("ul","rh-list");
  lst.forEach(p=>{const li=el("li","rh-item");const top=el("div","row between");top.append(notr(el("strong",null,pName(p.pid))),notr(el("b",null,F(p.montant))));li.append(top);
    const info=el("div","note");info.append(el("span",null,(PTYPES.find(x=>x[0]===p.type)||[,""])[1]),document.createTextNode(" · "),el("span",null,(MODES.find(x=>x[0]===p.mode)||[,""])[1]),document.createTextNode(" · "),el("span",null,fdate(p.date)));li.append(info);
    const a=el("div","row");
    const per=pers.find(x=>x.id===p.pid);
    const wa=el("a","btn small ghost","Envoyer le reçu par WhatsApp");wa.target="_blank";wa.rel="noopener";
    const txt=`B2A Smart Farming – Reçu de paiement\n${pName(p.pid)}\n${(PTYPES.find(x=>x[0]===p.type)||[,""])[1]} ${mLabel(p.mois)} : ${F(p.montant)}\n${(MODES.find(x=>x[0]===p.mode)||[,""])[1]} · ${p.date}`;
    wa.href="https://wa.me/"+(per&&per.tel?per.tel.replace(/\D/g,""):"")+"?text="+encodeURIComponent(txt);a.append(wa);
    if(canW()){const x=btn("Supprimer","btn small ghost danger");x.onclick=async()=>{if(x.dataset.c!=="1"){x.dataset.c="1";x.textContent="Confirmer : supprimer";return}
      try{if(p.depId)await db.doc("depenses/"+p.depId).delete().catch(()=>{});await db.doc("paies/"+p.id).delete()}catch(e){}};a.append(x)}
    li.append(a);u.append(li)});
  h.append(u);V.append(h)}
function paieForm(){const c=el("section","card");const nm=pName(form.pid);
  const t=el("h3","sec");t.append(el("span",null,"Nouveau paiement"),document.createTextNode(" · "),notr(el("span",null,nm)));c.append(t);
  const ty=sel(PTYPES,form.reste>0?"salaire":"prime");const mt=inp("number",form.reste||"","0");
  const mo=sel(MODES,"especes");const d=inp("date",month===today().slice(0,7)?today():month+"-28");
  const g=el("div","grid2");g.append(field("Type",ty),field("Montant (FCFA)",mt),field("Mode de paiement",mo),field("Date",d));c.append(g);
  const lab=el("label","row");const cb=el("input");cb.type="checkbox";cb.checked=true;lab.append(cb,el("span",null,"Noter aussi dans la caisse (Main-d'œuvre)"));
  c.append(lab,el("p","note","Le paiement compte alors dans les dépenses et le bilan de l'année."));
  const m=msgEl();const r=el("div","row");
  r.append(btn("Enregistrer","btn",async()=>{const v=Number(String(mt.value).replace(",","."));if(!(v>0)){say(m,"Indiquez un montant.");return}
    const date=d.value||today();const id=B.newId();let depId=null;
    try{if(cb.checked){depId="rh"+id;await db.doc("depenses/"+depId).set({date,cat:"mo",montant:v,lotId:null,note:(PTYPES.find(x=>x[0]===ty.value)||[,""])[1]+" – "+nm,by:B.me,createdAt:Date.now(),rh:id})}
      await db.doc("paies/"+id).set({pid:form.pid,mois:month,type:ty.value,montant:v,mode:mo.value,date,depId,by:B.me,createdAt:Date.now()});form=null;render()}
    catch(e){say(m,"Échec de l'enregistrement.")}}));
  r.append(btn("Annuler","btn ghost",()=>{form=null;render()}),m);c.append(r);return c}

/* ---------- Évaluations (propriétaire) ---------- */
function renderEvals(){
  const L=active();
  if(!L.length){const c=el("section","card");c.append(el("h3","sec","Évaluations"),el("p","note","Ajoutez d'abord un employé dans l'onglet Équipe."));V.append(c);return}
  if(form&&form.k==="eval"){V.append(evalForm());}
  else{const c=el("section","card");const r=el("div","row between");r.append(el("h3","sec","Évaluations"));
    if(canW())r.append(btn("Nouvelle évaluation","btn small",()=>{form={k:"eval",pid:""};render()}));c.append(r);V.append(c)}
  const m0=today().slice(0,7);
  L.forEach(p=>{const c=el("section","card");const top=el("div","row between");top.append(notr(el("h3","sec",p.nom||"—")));
    const l=lastEval(p.id);
    if(l[0]){const [t,cl]=appr(l[0].moyenne);top.append(el("span","pill "+cl,t))}else top.append(el("span","pill s-none","Pas encore évalué"));c.append(top);
    const s=stats(p.id,m0);c.append(el("span","label","Chiffres du mois (automatiques)"));
    const ln=el("div","rh-mini");ln.append(el("span",null,"Taux de présence"),notr(el("b",null,s.taux==null?"—":s.taux+" %")),el("span",null,"Retards"),notr(el("b",null,String(s.re))),
      el("span",null,"Tâches faites ce mois"),notr(el("b",null,s.tTot?s.tTaux+" %":"—")));c.append(ln);
    if(l[0]){const e=l[0];const ln2=el("div","rh-mini");ln2.append(el("span",null,"Dernière note"),notr(el("b",null,A.fmt(e.moyenne,1)+" / 5")));
      if(l[1]){const dlt=e.moyenne-l[1].moyenne;if(Math.abs(dlt)>=0.3)ln2.append(el("span",null,dlt>0?"En progrès":"En baisse"),notr(el("b",null,(dlt>0?"+":"")+A.fmt(dlt,1))))}
      c.append(ln2);
      const bars=el("div","rh-crit");CRIT.forEach(([k,t])=>{const v=Number((e.notes||{})[k])||0;const row=el("div","rh-cr");row.append(el("span",null,t),notr(el("b",null,"★".repeat(v)+"☆".repeat(5-v))));bars.append(row)});c.append(bars);
      if(e.commentaire){const q=notr(el("p","note","« "+e.commentaire+" »"));c.append(q)}
      if(l.length>1){const d=el("details");d.append(el("summary",null,"Historique"));const u=el("ul","rh-list");
        l.forEach(x=>{const li=el("li","row between");li.append(el("span",null,fdate(x.date)),notr(el("b",null,A.fmt(x.moyenne,1)+" / 5")));
          if(canW()){const del=btn("Supprimer","btn small ghost danger");del.onclick=async()=>{if(del.dataset.c!=="1"){del.dataset.c="1";del.textContent="Confirmer : supprimer";return}try{await db.doc("evaluations/"+x.id).delete()}catch(e){}};li.append(del)}
          u.append(li)});d.append(u);c.append(d)}}
    if(canW())c.append(btn("Évaluer","btn small ghost",()=>{form={k:"eval",pid:p.id};render();window.scrollTo(0,0)}));
    V.append(c)})}
function evalForm(){const c=el("section","card");c.append(el("h3","sec","Nouvelle évaluation"));
  const who=sel([["","—"],...active().map(p=>[p.id,p.nom||"—",1])],form.pid||"");const d=inp("date",today());d.max=today();
  const g=el("div","grid2");g.append(field("Employé",who),field("Date",d));c.append(g,el("p","note","Donnez une note de 1 à 5 à chaque critère."));
  const notes={};
  CRIT.forEach(([k,t])=>{const row=el("div","rh-cr");row.append(el("span",null,t));const st=el("div","rh-stars");st.setAttribute("role","group");st.setAttribute("aria-label",t);
    const draw=()=>st.querySelectorAll("button").forEach((b,i)=>{b.setAttribute("aria-pressed",String(i<(notes[k]||0)));b.textContent=i<(notes[k]||0)?"★":"☆"});
    for(let i=1;i<=5;i++){const b=el("button","rh-star","☆");b.type="button";b.setAttribute("aria-label",i+" / 5");b.onclick=()=>{notes[k]=i;draw()};st.append(b)}
    row.append(st);c.append(row)});
  const com=el("textarea");com.maxLength=300;com.placeholder="ex. très sérieux, doit mieux nettoyer les abreuvoirs";c.append(field("Commentaire (facultatif)",com));
  const m=msgEl();const r=el("div","row");
  r.append(btn("Enregistrer l'évaluation","btn",async()=>{if(!who.value){say(m,"Choisissez l'employé.");return}
    if(CRIT.some(([k])=>!notes[k])){say(m,"Notez chaque critère.");return}
    const moy=Math.round(CRIT.reduce((s,[k])=>s+notes[k],0)/CRIT.length*10)/10;const s=stats(who.value,(d.value||today()).slice(0,7));
    try{await db.collection("evaluations").doc().set({pid:who.value,date:d.value||today(),notes:{...notes},moyenne:moy,commentaire:com.value.trim().slice(0,300),
      presence:s.taux,taches:s.tTaux,par:B.lsGet(B.LS_NAME)||"",by:B.me,createdAt:Date.now()});form=null;render()}catch(e){say(m,"Échec de l'enregistrement.")}}));
  r.append(btn("Annuler","btn ghost",()=>{form=null;render()}),m);c.append(r);return c}

/* ================= styles ================= */
{const s=document.createElement("style");s.textContent=`
.rh-list{list-style:none;padding:0;margin:0;display:grid;gap:10px}
.rh-item{border:1px solid var(--line);border-radius:12px;padding:10px 12px;display:grid;gap:6px}
.rh-mini{display:grid;grid-template-columns:auto auto;justify-content:start;gap:2px 14px;font-size:14px}
.rh-mini span{color:var(--muted)}
.rh-nav{align-items:center}
.rh-tabs button{font-size:13px}
.rh-crit{display:grid;gap:4px}
.rh-cr{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px}
.rh-cr b{color:var(--warn);letter-spacing:2px}
.rh-stars{display:flex;gap:2px}
.rh-star{border:0;background:transparent;font-size:28px;line-height:1;color:var(--warn);cursor:pointer;padding:4px}
@media (max-width:420px){.rh-tabs button{font-size:12px;padding:9px 2px}}`;document.head.append(s)}

/* ================= données ================= */
let unsub=[];
function listen(){unsub.forEach(f=>{try{f()}catch(e){}});unsub=[];boss=isBoss();
  const on=(n,fn)=>{try{unsub.push(db.collection(n).onSnapshot(s=>{fn(s.docs.map(d=>({id:d.id,...d.data()})));if(!V.hidden)render()},()=>{}))}catch(e){}};
  on("personnel",a=>{pers=a});
  on("presences",a=>{pres={};a.forEach(x=>{pres[x.date||x.id]=x.p||{}})});
  on("taches",a=>{taches=a});
  if(boss){on("rh_contrats",a=>{contrats={};a.forEach(x=>{contrats[x.id]=x})});on("paies",a=>{paies=a});on("evaluations",a=>{evals=a})}
  else{contrats={};paies=[];evals=[]}}
B.getDb().then(d=>{db=d;listen();render()}).catch(()=>{});
addEventListener("b2a-pro",()=>{if(db&&!V.hidden)render()});
addEventListener("b2a-team",()=>{if(db&&isBoss()!==boss){listen()}if(db&&!V.hidden)render()});
{const t=document.getElementById("tab-personnel");if(t)t.addEventListener("click",()=>{if(db){day=today();render()}})}
window.renderPersonnel=()=>{if(db)render()};
})();
