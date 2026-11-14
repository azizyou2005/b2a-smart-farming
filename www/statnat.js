/* B2A Smart Farming : statistiques nationales de l'élevage (pour le ministère de l'Agriculture et de l'Élevage).
   Avec l'accord de l'utilisateur (Réglages > Statistiques nationales), le téléphone envoie une fois par jour à B2A
   un résumé ANONYME de la ferme : pays, ville, province, et par espèce le nombre d'animaux, les morts sur 30 jours,
   la production, les vaccins faits / prévus. Jamais de nom, de téléphone, de client ni d'argent.
   B2A regroupe ces résumés et publie des rapports pour le ministère (ministere.html). Sans accord, rien n'est envoyé.
   Dans une ferme partagée, c'est le propriétaire qui décide ; les employés n'envoient rien (pas de double compte). */
(function(){
const B=window.B2A;if(!B||!B.app)return;const A=B.app;
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const LS="b2a-statnat",LS_ACC="b2a-acces",LS_LIEU="b2a-statnat-lieu";
const VERSION=((document.currentScript&&/[?&]v=([\d.]+)/.exec(document.currentScript.src))||[])[1]||"web";

/* ================= traductions ================= */
const T={
"Statistiques nationales de l'élevage":["National livestock statistics","Statistiche nazionali dell'allevamento","Estadísticas nacionales de ganadería"],
"Avec votre accord, l'application envoie chaque jour à B2A un résumé anonyme de votre ferme : nombre d'animaux par espèce, mortalité, production et vaccins faits. Jamais votre nom, votre téléphone, vos clients ni votre argent.":["With your consent, the app sends B2A an anonymous summary of your farm every day: number of animals per species, mortality, production and vaccines given. Never your name, your phone number, your customers or your money.","Con il tuo consenso, l'app invia ogni giorno a B2A un riepilogo anonimo della tua azienda: numero di animali per specie, mortalità, produzione e vaccini fatti. Mai il tuo nome, il tuo telefono, i tuoi clienti né i tuoi soldi.","Con tu acuerdo, la aplicación envía cada día a B2A un resumen anónimo de tu granja: número de animales por especie, mortalidad, producción y vacunas hechas. Nunca tu nombre, tu teléfono, tus clientes ni tu dinero."],
"B2A regroupe les résumés de toutes les fermes en statistiques par zone pour le ministère de l'Agriculture et de l'Élevage, afin de mieux suivre les maladies, les vaccinations et la production. Une zone avec moins de 3 fermes n'est jamais montrée seule.":["B2A combines the summaries of all farms into statistics by area for the Ministry of Agriculture and Livestock, to better track diseases, vaccinations and production. An area with fewer than 3 farms is never shown on its own.","B2A raggruppa i riepiloghi di tutte le aziende in statistiche per zona per il Ministero dell'Agricoltura e dell'Allevamento, per seguire meglio malattie, vaccinazioni e produzione. Una zona con meno di 3 aziende non viene mai mostrata da sola.","B2A agrupa los resúmenes de todas las granjas en estadísticas por zona para el Ministerio de Agricultura y Ganadería, para seguir mejor las enfermedades, las vacunaciones y la producción. Una zona con menos de 3 granjas nunca se muestra sola."],
"J'accepte de partager ce résumé anonyme":["I agree to share this anonymous summary","Accetto di condividere questo riepilogo anonimo","Acepto compartir este resumen anónimo"],
"Province ou région (facultatif)":["Province or region (optional)","Provincia o regione (facoltativo)","Provincia o región (opcional)"],
"ex. Kadiogo":["e.g. Kadiogo","es. Kadiogo","p. ej. Kadiogo"],
"Enregistrer":["Save","Salva","Guardar"],
"Voir ce qui est envoyé":["See what is sent","Vedi cosa viene inviato","Ver lo que se envía"],
"Masquer":["Hide","Nascondi","Ocultar"],
"Vous ne partagez rien pour l'instant.":["You are not sharing anything at the moment.","Per ora non condividi nulla.","Por ahora no compartes nada."],
"Partage activé. Envoi automatique une fois par jour quand il y a du réseau.":["Sharing is on. Sent automatically once a day when there is a network.","Condivisione attiva. Invio automatico una volta al giorno quando c'è rete.","Compartir activado. Envío automático una vez al día cuando hay red."],
"Dernier envoi : {0}":["Last sent: {0}","Ultimo invio: {0}","Último envío: {0}"],
"Partage arrêté. Votre résumé a été effacé chez B2A.":["Sharing stopped. Your summary has been deleted at B2A.","Condivisione interrotta. Il tuo riepilogo è stato cancellato presso B2A.","Compartir detenido. Tu resumen se ha borrado en B2A."],
"Partage arrêté. Votre résumé sera effacé chez B2A au retour du réseau.":["Sharing stopped. Your summary will be deleted at B2A when the network is back.","Condivisione interrotta. Il tuo riepilogo sarà cancellato presso B2A al ritorno della rete.","Compartir detenido. Tu resumen se borrará en B2A cuando vuelva la red."],
"Merci. Le résumé sera envoyé dès qu'il y aura du réseau.":["Thank you. The summary will be sent as soon as there is a network.","Grazie. Il riepilogo sarà inviato appena c'è rete.","Gracias. El resumen se enviará en cuanto haya red."],
"Merci, résumé envoyé.":["Thank you, summary sent.","Grazie, riepilogo inviato.","Gracias, resumen enviado."],
"Envoi impossible pour l'instant, nouvel essai plus tard.":["Cannot send right now, will try again later.","Invio impossibile per ora, nuovo tentativo più tardi.","No se puede enviar ahora, se volverá a intentar más tarde."],
"Dans une ferme partagée, c'est le propriétaire de la ferme qui choisit de participer. Votre téléphone n'envoie rien.":["In a shared farm, the farm owner chooses whether to take part. Your phone sends nothing.","In un'azienda condivisa è il proprietario dell'azienda che sceglie di partecipare. Il tuo telefono non invia nulla.","En una granja compartida, es el propietario de la granja quien elige participar. Tu teléfono no envía nada."],
"Lieu":["Location","Luogo","Lugar"],
"Aucun lot en cours : rien à envoyer.":["No current batch: nothing to send.","Nessun lotto in corso: niente da inviare.","Ningún lote en curso: nada que enviar."],
"Espèce":["Species","Specie","Especie"],"Animaux":["Animals","Animali","Animales"],"Morts 30 j":["Deaths 30 d","Morti 30 g","Muertes 30 d"],
"Production 30 j":["Production 30 d","Produzione 30 g","Producción 30 d"],"Vaccins faits":["Vaccines given","Vaccini fatti","Vacunas hechas"],
"{0} œufs":["{0} eggs","{0} uova","{0} huevos"],"{0} L de lait":["{0} L of milk","{0} L di latte","{0} L de leche"],
"Cultures":["Crops","Colture","Cultivos"],"Autre culture":["Other crop","Altra coltura","Otro cultivo"],
"Participer aux statistiques nationales de l'élevage ?":["Take part in the national livestock statistics?","Partecipare alle statistiche nazionali dell'allevamento?","¿Participar en las estadísticas nacionales de ganadería?"],
"Votre ferme peut aider le ministère de l'Agriculture et de l'Élevage à suivre les maladies et la production dans votre zone. Seul un résumé anonyme est envoyé (nombre d'animaux, mortalité, vaccins), jamais votre nom ni votre argent. Vous pouvez changer d'avis dans Réglages.":["Your farm can help the Ministry of Agriculture and Livestock track diseases and production in your area. Only an anonymous summary is sent (number of animals, mortality, vaccines), never your name or your money. You can change your mind in Settings.","La tua azienda può aiutare il Ministero dell'Agricoltura e dell'Allevamento a seguire le malattie e la produzione nella tua zona. Viene inviato solo un riepilogo anonimo (numero di animali, mortalità, vaccini), mai il tuo nome né i tuoi soldi. Puoi cambiare idea nelle Impostazioni.","Tu granja puede ayudar al Ministerio de Agricultura y Ganadería a seguir las enfermedades y la producción en tu zona. Solo se envía un resumen anónimo (número de animales, mortalidad, vacunas), nunca tu nombre ni tu dinero. Puedes cambiar de opinión en Ajustes."],
"Oui, je participe":["Yes, I take part","Sì, partecipo","Sí, participo"],"Non merci":["No thanks","No grazie","No gracias"],
"Poules pondeuses":["Laying hens","Galline ovaiole","Gallinas ponedoras"],"Poulets de chair":["Broilers","Polli da carne","Pollos de engorde"],
"Volaille locale, pintades":["Local poultry, guinea fowl","Pollame locale, faraone","Aves locales, pintadas"],"Cailles pondeuses":["Laying quails","Quaglie ovaiole","Codornices ponedoras"],
"Cailles de chair":["Meat quails","Quaglie da carne","Codornices de carne"],"Porcs":["Pigs","Suini","Cerdos"],"Moutons et chèvres":["Sheep and goats","Pecore e capre","Ovejas y cabras"],
"Bovins":["Cattle","Bovini","Bovinos"],"Poissons":["Fish","Pesci","Peces"],"Lapins":["Rabbits","Conigli","Conejos"],"Autres animaux":["Other animals","Altri animali","Otros animales"]
};
/* i18n.js remplace chaque nombre du texte par {0}, {1}… (« B2A » devient « B{0}A ») : on écrit les clés de la même façon */
{const nb=x=>{let i=0;return x.replace(/\d+(?:,\d+)?/g,()=>"{"+(i++)+"}")};
 const D=window.B2A_DICT=window.B2A_DICT||{};["en","it","es"].forEach((l,i)=>{D[l]=D[l]||{};for(const k in T){const kk=k.includes("{")?k:nb(k),v=k.includes("{")?T[k][i]:nb(T[k][i]);if(D[l][kk]==null)D[l][kk]=v}})}
/* textes écrits en français : i18n.js les traduit à l'affichage (les nombres et les dates sont reconnus tout seuls) */
const tr=(s,...a)=>{let x=s;a.forEach((v,i)=>{x=x.split("{"+i+"}").join(v)});return x};
const fmt=(v,d=0)=>Number(v||0).toLocaleString("fr-FR",{maximumFractionDigits:d});

/* ================= espèces (mêmes groupes que le tableau du ministère) ================= */
const ESP={pondeuse:"Poules pondeuses",chair:"Poulets de chair",local:"Volaille locale, pintades",caillepond:"Cailles pondeuses",caillechair:"Cailles de chair",
  porc:"Porcs",petitsrum:"Moutons et chèvres",bovin:"Bovins",poisson:"Poissons",lapin:"Lapins",autre:"Autres animaux"};
function cat(l){const e=l.espece||"";
  if(/poisson|tilapia|silure|clarias/i.test(e))return "poisson";
  if(/caille/i.test(e))return /chair/i.test(e)?"caillechair":"caillepond";
  if(/pondeuse/i.test(e))return "pondeuse";if(/chair/i.test(e))return "chair";
  if(/poule|poulet|pintade|volaille|dinde|canard|oie/i.test(e))return "local";
  if(/ch[èe]vre|mouton|brebis|bouc|b[ée]lier|ovin|caprin/i.test(e))return "petitsrum";
  if(/porc|truie|verrat/i.test(e))return "porc";if(/bovin|vache|taureau|z[ée]bu|veau|g[ée]nisse/i.test(e))return "bovin";
  if(/lapin/i.test(e))return "lapin";return "autre"}
const slug=s=>String(s||"autre").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"").slice(0,30)||"autre";
const pad=n=>String(n).padStart(2,"0");
const iso=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());

/* résumé anonyme de la ferme : uniquement des nombres par espèce */
function resume(){
  const t=A.today(),d30=iso(new Date(Date.now()-30*864e5));const especes={},cultures={};let nb=0;
  for(const l of A.lots()){
    if(A.isCrop(l)){const C=window.B2A_CULT,cr=C&&C.crops&&C.crops[l.culture];const k=slug(l.culture);
      const n=l.culture==="autre"?"Autre culture":(cr&&cr.n)||l.culture||"Autre culture";
      const s=Number(l.surface)||0,ha=l.unite==="m2"?s/10000:s;
      const c=cultures[k]=cultures[k]||{n:String(n).slice(0,40),lots:0,ha:0};c.lots++;c.ha=Math.round((c.ha+Math.max(0,ha))*100)/100;nb++;continue}
    let s;try{s=A.stats(l)}catch(e){continue}
    const k=cat(l);const o=especes[k]=especes[k]||{lots:0,effectif:0,morts30:0,oeufs30:0,lait30:0,vaccDus:0,vaccFaits:0,alerte:0};
    o.lots++;nb++;o.effectif+=Math.max(0,Math.round(s.alive||0));
    const R=(s.rows||[]).filter(r=>r.date>=d30);o.morts30+=R.reduce((p,r)=>p+(Number(r.morts)||0),0);
    const prod=R.reduce((p,r)=>p+(Number(r.oeufs)||0),0);if(A.isDairy(l))o.lait30+=Math.round(prod);else if(A.isLayer(l))o.oeufs30+=Math.round(prod);
    try{const P=A.programme(l).filter(p=>p.type==="vaccin"&&p.date<=t);o.vaccDus+=P.length;o.vaccFaits+=P.filter(p=>p.done).length}catch(e){}
    if((s.morts7pct||0)>0.5)o.alerte++;
  }
  return {especes,cultures,nbLots:nb}}

/* ================= accord, lieu, envoi ================= */
const rd=k=>{try{return JSON.parse(B.lsGet(k)||"null")}catch(e){return null}};
let st=rd(LS)||{};const save=()=>B.lsSet(LS,JSON.stringify(st));
const approuve=()=>{const a=rd(LS_ACC);return !!(a&&a.statut==="approuve"&&a.uid)};
const employe=()=>!!(B.farm&&B.team&&B.team.role==="employe");
const dispo=()=>!!B.CFG&&approuve();

async function lieu(fs,uid){let L=rd(LS_LIEU);if(L&&L.pays)return L;
  const p=rd("b2a-profil");if(p&&p.pays){L={ville:p.ville||"",pays:p.pays};B.lsSet(LS_LIEU,JSON.stringify(L));return L}
  try{const s=await fs.doc("inscriptions/"+uid).get();const d=s.exists?s.data():null;if(d){L={ville:d.ville||"",pays:d.pays||""};B.lsSet(LS_LIEU,JSON.stringify(L));return L}}catch(e){}
  return {ville:"",pays:""}}

let busy=false;
async function envoyer(force){
  if(busy||!dispo()||employe()||!navigator.onLine)return null;busy=true;
  try{const u=await B.ensureUser(B.CFG);const fs=firebase.firestore();const ref=fs.doc("stats_contrib/"+u.uid);
    if(st.ok!==true){if(st.aEffacer){await ref.delete();delete st.aEffacer;save()}return "off"}
    if(!force&&st.envoi&&Date.now()-st.envoi<20*3600e3)return "deja";
    const r=resume();const L=await lieu(fs,u.uid);
    const cle=B.farm&&window.B2A_NOMS?await window.B2A_NOMS.sha("ferme|"+B.farm):"";
    await ref.set({pays:String(L.pays||"").slice(0,60),ville:String(L.ville||"").slice(0,60),province:String(st.province||"").slice(0,60),cle,
      especes:r.especes,cultures:r.cultures,nbLots:r.nbLots,majLe:firebase.firestore.FieldValue.serverTimestamp(),version:VERSION});
    st.envoi=Date.now();save();return "ok"}
  catch(e){console.warn("statnat",e);return "err"}
  finally{busy=false}}

async function choisir(ok,fromCard){st.ok=!!ok;st.le=Date.now();if(!ok){delete st.envoi;st.aEffacer=true}save();
  const box=$("sn-prompt");if(box)box.remove();
  const r=await envoyer(true);
  const txt=ok?(r==="ok"?"Merci, résumé envoyé.":navigator.onLine?"Envoi impossible pour l'instant, nouvel essai plus tard.":"Merci. Le résumé sera envoyé dès qu'il y aura du réseau.")
    :(r==="off"?"Partage arrêté. Votre résumé a été effacé chez B2A.":"Partage arrêté. Votre résumé sera effacé chez B2A au retour du réseau.");
  renderCard();const m=$("sn-msg");if(fromCard&&m)m.textContent=txt;else if(ok)toastMsg(txt);return r}

/* ================= Réglages : carte « Statistiques nationales » ================= */
function preview(box){box.innerHTML="";const r=resume();const keys=Object.keys(r.especes);
  if(!keys.length&&!Object.keys(r.cultures).length){box.append(el("p","note",tr("Aucun lot en cours : rien à envoyer.")));return}
  const L=rd(LS_LIEU)||rd("b2a-profil")||{};const lieuTxt=[L.ville,st.province,L.pays].filter(Boolean).join(", ");
  if(lieuTxt){const p=el("p","note");const v=el("span",null,lieuTxt);v.setAttribute("data-notr","");p.append(el("b",null,"Lieu")," : ",v);box.append(p)}
  if(keys.length){const w=el("div","tablewrap"),t=el("table","data");const h=el("tr");["Espèce","Animaux","Morts 30 j","Production 30 j","Vaccins faits"].forEach(x=>h.append(el("th",null,tr(x))));
    const th=el("thead");th.append(h);t.append(th);const tb=el("tbody");
    keys.forEach(k=>{const o=r.especes[k];const tr0=el("tr");
      const prod=o.oeufs30?tr("{0} œufs",fmt(o.oeufs30)):o.lait30?tr("{0} L de lait",fmt(o.lait30)):"—";
      tr0.append(el("td",null,tr(ESP[k])),el("td",null,fmt(o.effectif)),el("td",null,fmt(o.morts30)),el("td",null,prod),el("td",null,o.vaccDus?fmt(o.vaccFaits)+" / "+fmt(o.vaccDus):"—"));
      tb.append(tr0)});t.append(tb);w.append(t);box.append(w)}
  const C=Object.values(r.cultures);if(C.length){const p=el("p","note");p.append(el("b",null,"Cultures")," : ");
    const s=el("span",null,C.map(c=>c.n+(c.ha?" ("+fmt(c.ha,2)+" ha)":"")).join(", "));s.setAttribute("data-notr","");p.append(s);box.append(p)}}

function renderCard(){const sec=$("sn-card");if(!sec)return;const B0=$("sn-body");B0.innerHTML="";
  if(employe()){B0.append(el("p","note",tr("Dans une ferme partagée, c'est le propriétaire de la ferme qui choisit de participer. Votre téléphone n'envoie rien.")));return}
  const lab=el("label","sn-chk");const cb=el("input");cb.type="checkbox";cb.id="sn-ok";cb.checked=st.ok===true;lab.append(cb,el("span",null,tr("J'accepte de partager ce résumé anonyme")));B0.append(lab);
  const f=el("div","field");const fl=el("label",null,tr("Province ou région (facultatif)"));fl.htmlFor="sn-prov";const pi=el("input");pi.type="text";pi.id="sn-prov";pi.maxLength=60;
  pi.placeholder=tr("ex. Kadiogo");pi.value=st.province||"";pi.setAttribute("data-notr","");f.append(fl,pi);B0.append(f);
  const row=el("div","row");const sv=el("button","btn small",tr("Enregistrer"));sv.type="button";const pv=el("button","btn small ghost",tr("Voir ce qui est envoyé"));pv.type="button";row.append(sv,pv);B0.append(row);
  const stt=el("p","note");stt.setAttribute("aria-live","polite");
  stt.textContent=st.ok===true?tr("Partage activé. Envoi automatique une fois par jour quand il y a du réseau.")+"":tr("Vous ne partagez rien pour l'instant.");
  B0.append(stt);if(st.ok===true&&st.envoi)B0.append(el("p","note",tr("Dernier envoi : {0}",new Date(st.envoi).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}))));const msg=el("p","msg");msg.id="sn-msg";msg.setAttribute("aria-live","polite");B0.append(msg);const box=el("div","sn-prev");box.hidden=true;B0.append(box);
  sv.onclick=()=>{st.province=pi.value.trim().slice(0,60);save();sv.disabled=true;choisir(cb.checked,true)};
  pv.onclick=()=>{box.hidden=!box.hidden;pv.textContent=tr(box.hidden?"Voir ce qui est envoyé":"Masquer");if(!box.hidden)preview(box)}}

function mountCard(){if(!dispo()||$("sn-card"))return;const sheet=$("x-set");if(!sheet)return;const own=$("x-owner");
  const sec=el("section","card");sec.id="sn-card";sec.append(el("h3","sec",tr("Statistiques nationales de l'élevage")),
    el("p","note",tr("Avec votre accord, l'application envoie chaque jour à B2A un résumé anonyme de votre ferme : nombre d'animaux par espèce, mortalité, production et vaccins faits. Jamais votre nom, votre téléphone, vos clients ni votre argent.")),
    el("p","note",tr("B2A regroupe les résumés de toutes les fermes en statistiques par zone pour le ministère de l'Agriculture et de l'Élevage, afin de mieux suivre les maladies, les vaccinations et la production. Une zone avec moins de 3 fermes n'est jamais montrée seule.")));
  const b=el("div");b.id="sn-body";b.style.display="grid";b.style.gap="10px";sec.append(b);
  if(own&&own.parentNode)own.parentNode.insertBefore(sec,own);else (sheet.querySelector(".sheet-in")||sheet).append(sec);renderCard()}

/* ================= question unique sur l'accueil ================= */
function prompt(){if(!dispo()||employe()||st.ok!=null||$("sn-prompt"))return;const home=$("home");if(!home||!A.lots().length)return;
  const c=el("section","card sn-prompt");c.id="sn-prompt";c.append(el("h2","sec",tr("Participer aux statistiques nationales de l'élevage ?")),
    el("p","note",tr("Votre ferme peut aider le ministère de l'Agriculture et de l'Élevage à suivre les maladies et la production dans votre zone. Seul un résumé anonyme est envoyé (nombre d'animaux, mortalité, vaccins), jamais votre nom ni votre argent. Vous pouvez changer d'avis dans Réglages.")));
  const r=el("div","row");const y=el("button","btn small",tr("Oui, je participe"));y.type="button";const n=el("button","btn small ghost",tr("Non merci"));n.type="button";r.append(y,n);c.append(r);
  y.onclick=()=>choisir(true,false);n.onclick=()=>choisir(false,false);
  home.insertBefore(c,home.firstChild)}
function toastMsg(t){const d=el("div","sn-toast",t);d.setAttribute("role","status");document.body.append(d);setTimeout(()=>d.remove(),4000)}

const css=el("style");css.textContent=`.sn-chk{display:flex;gap:10px;align-items:flex-start;font-weight:600}.sn-chk input{width:22px;height:22px;flex:none;margin-top:1px}
.sn-prompt{border-left:5px solid var(--green,#72ac48)}.sn-prev{display:grid;gap:8px}
.sn-toast{position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:#1b2e4c;color:#fff;padding:10px 16px;border-radius:10px;z-index:9999;max-width:90vw;font-size:15px;box-shadow:0 6px 18px rgb(0 0 0/.25)}`;
document.head.append(css);

/* démarrage : carte dans Réglages, question sur l'accueil, envoi quotidien */
function go(){mountCard();setTimeout(prompt,6000);setTimeout(()=>envoyer(false),15000);setInterval(()=>envoyer(false),3*3600e3)}
addEventListener("online",()=>envoyer(false));addEventListener("b2a-team",()=>{renderCard();if(employe()){const p=$("sn-prompt");if(p)p.remove()}});
document.addEventListener("b2a-lang",()=>{const s=$("sn-card");if(s){s.remove();mountCard()}});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",go);else go();
/* l'inscription peut arriver après le chargement : réessayer d'afficher la carte */
setTimeout(mountCard,8000);
window.B2A_STATNAT={resume,envoyer,cat,mountCard,prompt};
})();
