/* B2A Smart Farming : vitrine « Solutions B2A Smart Building » (version Pro) — B2A-HIGH-TECHNOLOGY-AUTOMATION · Bayere Abdoul Aziz
   Présente l'armoire électrique de gestion de ferme vendue par B2A, sans prix (sur devis), avec la vue 3D du poulailler.
   Où elle apparaît : carte en haut de Marché > Acheter, bouton « Équiper ma ferme » dans Poulailler connecté et dans l'onglet Contrôle d'un lot.
   Demandes de devis : devis_b2a/<id> { uid, nom, tel, ville, pays, elevage, animaux, surface, niveau, install, message, statut: nouveau|traite, creeLe }
   + e-mail à B2A (FormSubmit, comme les inscriptions). Le contrôleur n'est jamais nommé : « dispositif de contrôle B2A Smart Building ». */
(function(){
const B=window.B2A;if(!B)return;
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const notr=e=>{e.setAttribute("data-notr","");return e};
const tr=s=>window.__tr?window.__tr(s):s;
const IMG="icons/armoire-b2a-3d.jpg";

/* ================= traductions ================= */
const T={
"Solutions B{0}A Smart Building":["B{0}A Smart Building solutions","Soluzioni B{0}A Smart Building","Soluciones B{0}A Smart Building"],
"Officiel B{0}A":["Official B{0}A","Ufficiale B{0}A","Oficial B{0}A"],
"Armoire électrique B{0}A pour la gestion de la ferme":["B{0}A electrical cabinet for farm management","Quadro elettrico B{0}A per la gestione della fattoria","Armario eléctrico B{0}A para la gestión de la granja"],
"Le dispositif de contrôle B{0}A Smart Building pilote votre bâtiment tout seul : lumière, ventilation, aliment, eau et climat, réglés selon l'âge et la santé de votre lot, et suivis dans l'application.":["The B{0}A Smart Building control device runs your building on its own: light, ventilation, feed, water and climate, set according to the age and health of your batch, and followed in the app.","Il dispositivo di controllo B{0}A Smart Building gestisce da solo il tuo edificio: luce, ventilazione, mangime, acqua e clima, regolati secondo l'età e la salute del lotto, e seguiti nell'app.","El dispositivo de control B{0}A Smart Building gestiona solo su edificio: luz, ventilación, pienso, agua y clima, ajustados según la edad y la salud del lote, y seguidos en la aplicación."],
"Découvrir":["Discover","Scopri","Descubrir"],
"Équiper ma ferme":["Equip my farm","Attrezza la mia fattoria","Equipar mi granja"],
"Voir le bâtiment en {0}D":["See the building in {0}D","Vedi l'edificio in {0}D","Ver el edificio en {0}D"],
"Touchez l'image pour ouvrir la démonstration {0}D.":["Tap the image to open the {0}D demo.","Tocca l'immagine per aprire la dimostrazione {0}D.","Toque la imagen para abrir la demostración {0}D."],
"Vue {0}D d'un poulailler équipé par B{1}A":["{0}D view of a poultry house equipped by B{1}A","Vista {0}D di un pollaio attrezzato da B{1}A","Vista {0}D de un gallinero equipado por B{1}A"],
"Ce que vous gagnez":["What you gain","Cosa guadagni","Lo que gana"],
"Moins de pertes : la chaleur, le manque d'eau ou l'ammoniac déclenchent une alerte tout de suite.":["Fewer losses: heat, lack of water or ammonia trigger an alert at once.","Meno perdite: caldo, mancanza d'acqua o ammoniaca fanno scattare subito un allarme.","Menos pérdidas: el calor, la falta de agua o el amoníaco activan una alerta al instante."],
"Moins de gaspillage : aliment et eau distribués et comptés chaque jour.":["Less waste: feed and water distributed and counted every day.","Meno sprechi: mangime e acqua distribuiti e contati ogni giorno.","Menos desperdicio: pienso y agua distribuidos y contados cada día."],
"Réglages automatiques selon l'âge et la santé du lot, sans calcul à faire.":["Automatic settings according to batch age and health, no calculation needed.","Regolazioni automatiche secondo età e salute del lotto, senza calcoli.","Ajustes automáticos según la edad y la salud del lote, sin cálculos."],
"Suivi à distance sur le téléphone, pour vous et votre équipe.":["Remote monitoring on the phone, for you and your team.","Controllo a distanza sul telefono, per te e la tua squadra.","Seguimiento a distancia en el teléfono, para usted y su equipo."],
"Trois niveaux d'équipement":["Three equipment levels","Tre livelli di dotazione","Tres niveles de equipamiento"],
"B{0}A Essentiel":["B{0}A Essential","B{0}A Essenziale","B{0}A Esencial"],"B{0}A Confort":["B{0}A Comfort","B{0}A Comfort","B{0}A Confort"],"B{0}A Pro":["B{0}A Pro","B{0}A Pro","B{0}A Pro"],
"Pour bien démarrer":["To get started","Per iniziare bene","Para empezar bien"],"Le plus demandé":["Most requested","Il più richiesto","El más pedido"],"Tout automatique":["Fully automatic","Tutto automatico","Todo automático"],
"Éclairage programmé":["Scheduled lighting","Illuminazione programmata","Iluminación programada"],
"Ventilation selon la température":["Ventilation according to temperature","Ventilazione secondo la temperatura","Ventilación según la temperatura"],
"Température et humidité":["Temperature and humidity","Temperatura e umidità","Temperatura y humedad"],
"Alertes sur le téléphone":["Alerts on the phone","Allarmi sul telefono","Alertas en el teléfono"],
"Tout le niveau Essentiel":["Everything in Essential","Tutto il livello Essenziale","Todo el nivel Esencial"],
"Distribution d'aliment et d'eau":["Feed and water distribution","Distribuzione di mangime e acqua","Distribución de pienso y agua"],
"Niveaux d'aliment et d'eau en {0} points":["Feed and water levels at {0} points","Livelli di mangime e acqua in {0} punti","Niveles de pienso y agua en {0} puntos"],
"Température et humidité en {0} points":["Temperature and humidity at {0} points","Temperatura e umidità in {0} punti","Temperatura y humedad en {0} puntos"],
"Totaux du jour dans l'application":["Daily totals in the app","Totali del giorno nell'app","Totales del día en la aplicación"],
"Tout le niveau Confort":["Everything in Comfort","Tutto il livello Comfort","Todo el nivel Confort"],
"Humidificateur":["Humidifier","Umidificatore","Humidificador"],
"Qualité de l'air (ammoniac, CO₂) et de l'eau":["Air quality (ammonia, CO₂) and water quality","Qualità dell'aria (ammoniaca, CO₂) e dell'acqua","Calidad del aire (amoníaco, CO₂) y del agua"],
"Détecteur de présence":["Presence detector","Rilevatore di presenza","Detector de presencia"],
"Consignes automatiques selon l'âge et la santé":["Automatic setpoints by age and health","Consegne automatiche secondo età e salute","Consignas automáticas según edad y salud"],
"Accès à distance sécurisé":["Secure remote access","Accesso remoto sicuro","Acceso remoto seguro"],
"En option : installation et mise en service par B{0}A, formation de votre équipe, contrat de maintenance annuel.":["Optional: installation and commissioning by B{0}A, training of your team, annual maintenance contract.","Opzionale: installazione e messa in servizio da B{0}A, formazione della squadra, contratto di manutenzione annuale.","Opcional: instalación y puesta en marcha por B{0}A, formación de su equipo, contrato de mantenimiento anual."],
"Pour les poulaillers, les autres élevages de l'application, les couveuses et les serres.":["For poultry houses, the other livestock in the app, incubators and greenhouses.","Per pollai, gli altri allevamenti dell'app, incubatrici e serre.","Para gallineros, las demás crías de la aplicación, incubadoras e invernaderos."],
"Prix sur devis : chaque bâtiment est différent. B{0}A vous rappelle avec une proposition adaptée.":["Price on quotation: every building is different. B{0}A calls you back with a suitable proposal.","Prezzo su preventivo: ogni edificio è diverso. B{0}A ti richiama con una proposta adatta.","Precio bajo presupuesto: cada edificio es diferente. B{0}A le llama con una propuesta adaptada."],
"Demander un devis":["Request a quotation","Richiedi un preventivo","Solicitar un presupuesto"],
"Demande de devis":["Quotation request","Richiesta di preventivo","Solicitud de presupuesto"],
"Niveau souhaité":["Desired level","Livello desiderato","Nivel deseado"],"Je ne sais pas encore":["I don't know yet","Non so ancora","Aún no lo sé"],
"Élevage ou culture":["Livestock or crop","Allevamento o coltura","Cría o cultivo"],"Choisir…":["Choose…","Scegli…","Elegir…"],
"Nombre d'animaux":["Number of animals","Numero di animali","Número de animales"],"Surface du bâtiment (m²)":["Building area (m²)","Superficie dell'edificio (m²)","Superficie del edificio (m²)"],
"Votre nom":["Your name","Il tuo nome","Su nombre"],"Téléphone (WhatsApp)":["Phone (WhatsApp)","Telefono (WhatsApp)","Teléfono (WhatsApp)"],
"Ville":["Town","Città","Ciudad"],"Pays":["Country","Paese","País"],
"Je veux l'installation par B{0}A":["I want installation by B{0}A","Voglio l'installazione da B{0}A","Quiero la instalación por B{0}A"],
"Votre besoin (facultatif)":["Your need (optional)","La tua esigenza (facoltativo)","Su necesidad (opcional)"],
"ex. bâtiment de {0} pondeuses, pas d'électricité la nuit…":["e.g. building with {0} layers, no electricity at night…","es. edificio da {0} ovaiole, niente elettricità di notte…","p. ej. galpón de {0} ponedoras, sin electricidad por la noche…"],
"Envoyer la demande":["Send the request","Invia la richiesta","Enviar la solicitud"],
"Indiquez votre nom.":["Enter your name.","Indica il tuo nome.","Indique su nombre."],"Indiquez un téléphone valide.":["Enter a valid phone number.","Indica un telefono valido.","Indique un teléfono válido."],"Indiquez votre ville.":["Enter your town.","Indica la tua città.","Indique su ciudad."],
"Demande envoyée. B{0}A vous contacte rapidement sur ce numéro.":["Request sent. B{0}A will contact you soon on this number.","Richiesta inviata. B{0}A ti contatta presto a questo numero.","Solicitud enviada. B{0}A le contactará pronto en este número."],
"Pas de connexion internet : la demande n'est pas partie. Réessayez quand vous avez du réseau.":["No internet connection: the request was not sent. Try again when you have network.","Nessuna connessione internet: la richiesta non è partita. Riprova quando hai rete.","Sin conexión a internet: la solicitud no se envió. Vuelva a intentarlo cuando tenga red."],
"Envoi impossible. Vérifiez la connexion et réessayez.":["Sending failed. Check the connection and try again.","Invio impossibile. Verifica la connessione e riprova.","Envío imposible. Compruebe la conexión e inténtelo de nuevo."],
"Fermer":["Close","Chiudi","Cerrar"],"Poules pondeuses":["Laying hens","Galline ovaiole","Gallinas ponedoras"],"Cailles":["Quails","Quaglie","Codornices"],"Poulets de chair":["Broilers","Polli da carne","Pollos de engorde"],"Volaille locale / pintades":["Local poultry / guinea fowl","Pollame locale / faraone","Aves locales / pintadas"],"Couvoir (poussins)":["Hatchery (chicks)","Incubatoio (pulcini)","Incubadora (pollitos)"],"Porcs":["Pigs","Suini","Cerdos"],"Moutons / chèvres":["Sheep / goats","Pecore / capre","Ovejas / cabras"],"Bovins":["Cattle","Bovini","Bovinos"],"Poissons":["Fish","Pesci","Peces"],"Cultures / serre":["Crops / greenhouse","Colture / serra","Cultivos / invernadero"],"Autre":["Other","Altro","Otro"],
"Pas encore de dispositif ? B{0}A équipe votre bâtiment.":["No device yet? B{0}A equips your building.","Ancora nessun dispositivo? B{0}A attrezza il tuo edificio.","¿Aún sin dispositivo? B{0}A equipa su edificio."],
};
{const D=window.B2A_DICT=window.B2A_DICT||{};["en","it","es"].forEach((l,i)=>{D[l]=D[l]||{};for(const k in T)if(D[l][k]==null)D[l][k]=T[k][i]})}

/* ================= styles ================= */
const css=el("style");css.textContent=`
.vt-card{display:grid;gap:12px;border-top:4px solid var(--millet)}
.vt-badge{justify-self:start;background:var(--millet-soft);color:#8a5d0c;font:800 11px var(--body);letter-spacing:.06em;text-transform:uppercase;border-radius:6px;padding:3px 8px}
.vt-img{display:block;width:100%;aspect-ratio:780/855;max-height:380px;object-fit:cover;object-position:center 40%;border-radius:12px;background:#f5d28a;border:0;padding:0;cursor:pointer}
.vt-img img{width:100%;height:100%;object-fit:cover;object-position:center 40%;border-radius:12px;display:block}
.vt-teaser{display:grid;grid-template-columns:110px 1fr;gap:12px;align-items:center}
.vt-teaser img{width:110px;height:110px;object-fit:cover;border-radius:12px;background:#f5d28a}
.vt-teaser b{font:800 16px var(--display);color:var(--heading,var(--ink))}
.vt-ov{position:fixed;inset:0;z-index:70;background:var(--bg);overflow-y:auto;-webkit-overflow-scrolling:touch}
.vt-in{max-width:720px;margin:0 auto;padding:calc(12px + env(safe-area-inset-top)) 14px calc(28px + env(safe-area-inset-bottom));display:grid;gap:14px}
.vt-top{display:flex;align-items:center;gap:10px;position:sticky;top:0;z-index:2;background:var(--bg);padding:6px 0}
.vt-top h2{flex:1;margin:0;font:800 18px var(--display);color:var(--heading,var(--ink))}
.vt-ben{margin:0;padding-left:18px;display:grid;gap:6px}
.vt-lvls{display:grid;gap:10px}
.vt-lvl{border:1px solid var(--line);border-radius:14px;padding:12px;background:var(--surface);display:grid;gap:6px}
.vt-lvl.star{border-color:var(--millet);box-shadow:0 0 0 1px var(--millet) inset}
.vt-lvl h4{margin:0;font:800 16px var(--display);color:var(--heading,var(--ink));display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.vt-lvl h4 small{font:700 11px var(--body);color:var(--muted);background:var(--bg);border-radius:999px;padding:2px 8px}
.vt-lvl ul{margin:0;padding-left:18px;display:grid;gap:3px;font-size:14px}
.vt-quote{background:var(--leaf-soft);border-radius:12px;padding:12px;font-weight:600}
.vt-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;align-items:end}.vt-form .full{grid-column:1/-1}
.vt-chk{display:flex;gap:8px;align-items:center;font-size:15px}
.vt-row{display:flex;gap:8px;flex-wrap:wrap}
`;document.head.append(css);

/* ================= contenu ================= */
const NIV=[["essentiel","B2A Essentiel","Pour bien démarrer",["Éclairage programmé","Ventilation selon la température","Température et humidité","Alertes sur le téléphone"]],
  ["confort","B2A Confort","Le plus demandé",["Tout le niveau Essentiel","Distribution d'aliment et d'eau","Niveaux d'aliment et d'eau en 3 points","Température et humidité en 3 points","Totaux du jour dans l'application"]],
  ["pro","B2A Pro","Tout automatique",["Tout le niveau Confort","Humidificateur","Qualité de l'air (ammoniac, CO₂) et de l'eau","Détecteur de présence","Consignes automatiques selon l'âge et la santé","Accès à distance sécurisé"]]];
const ELEV=["Poules pondeuses","Poulets de chair","Volaille locale / pintades","Cailles","Couvoir (poussins)","Porcs","Moutons / chèvres","Bovins","Poissons","Cultures / serre","Autre"];

function photo(){const b=el("button","vt-img");b.type="button";b.setAttribute("aria-label",tr("Voir le bâtiment en 3D"));
  const i=el("img");i.src=IMG;i.alt="Vue 3D d'un poulailler équipé par B2A";i.loading="lazy";b.append(i);b.onclick=open3D;return b}
/* ouvre la démonstration 3D de Poulailler connecté (chargée à la demande par poulailler.js) */
function open3D(){close();const t=$("tab-poulailler");if(!t)return;t.click();let n=0;const go=()=>{const b=$("pc-3d");if(b){b.click();return}if(++n<20)setTimeout(go,150)};setTimeout(go,200)}

/* ---------- carte courte (Marché, Contrôle, Poulailler connecté) ---------- */
function teaser(intro){const c=el("section","card vt-card");c.append(el("span","vt-badge","Officiel B2A"));
  const w=el("div","vt-teaser");const i=el("img");i.src=IMG;i.alt="Vue 3D d'un poulailler équipé par B2A";i.loading="lazy";i.style.cursor="pointer";i.onclick=()=>open();
  const t=el("div");t.style.display="grid";t.style.gap="4px";t.append(el("b",null,"Armoire électrique B2A pour la gestion de la ferme"),el("small","note",intro||"Prix sur devis : chaque bâtiment est différent. B2A vous rappelle avec une proposition adaptée."));
  w.append(i,t);c.append(w);const b=el("button","btn","Découvrir");b.type="button";b.onclick=()=>open();c.append(b);return c}

/* ---------- page complète ---------- */
let ov=null;
function open(focusDevis){if(ov)return;ov=el("div","vt-ov");ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-labelledby","vt-t");
  const box=el("div","vt-in");ov.append(box);
  const top=el("div","vt-top");const h=el("h2",null,"Solutions B2A Smart Building");h.id="vt-t";const x=el("button","btn small ghost","Fermer");x.type="button";x.onclick=()=>history.state&&history.state.vt?history.back():close();top.append(h,x);box.append(top);

  const c1=el("section","card vt-card");c1.append(el("span","vt-badge","Officiel B2A"),el("h3","sec","Armoire électrique B2A pour la gestion de la ferme"),photo(),el("p","note","Touchez l'image pour ouvrir la démonstration 3D."),
    el("p",null,"Le dispositif de contrôle B2A Smart Building pilote votre bâtiment tout seul : lumière, ventilation, aliment, eau et climat, réglés selon l'âge et la santé de votre lot, et suivis dans l'application."));
  const r=el("div","vt-row");const b3=el("button","btn small ghost","Voir le bâtiment en 3D");b3.type="button";b3.onclick=open3D;const bd=el("button","btn small","Demander un devis");bd.type="button";r.append(bd,b3);c1.append(r);box.append(c1);

  const c2=el("section","card");c2.append(el("h3","sec","Ce que vous gagnez"));const ul=el("ul","vt-ben");
  ["Moins de pertes : la chaleur, le manque d'eau ou l'ammoniac déclenchent une alerte tout de suite.","Moins de gaspillage : aliment et eau distribués et comptés chaque jour.","Réglages automatiques selon l'âge et la santé du lot, sans calcul à faire.","Suivi à distance sur le téléphone, pour vous et votre équipe."].forEach(t=>ul.append(el("li",null,t)));c2.append(ul);box.append(c2);

  const c3=el("section","card");c3.append(el("h3","sec","Trois niveaux d'équipement"));const L=el("div","vt-lvls");
  NIV.forEach(([k,n,s,f])=>{const d=el("div","vt-lvl"+(k==="confort"?" star":""));const t=el("h4",null);t.append(el("span",null,n),el("small",null,s));d.append(t);const u=el("ul");f.forEach(x=>u.append(el("li",null,x)));d.append(u);L.append(d)});
  c3.append(L,el("p","note","En option : installation et mise en service par B2A, formation de votre équipe, contrat de maintenance annuel."),el("p","note","Pour les poulaillers, les autres élevages de l'application, les couveuses et les serres."),
    el("p","vt-quote","Prix sur devis : chaque bâtiment est différent. B2A vous rappelle avec une proposition adaptée."));box.append(c3);

  const c4=devisForm();box.append(c4);bd.onclick=()=>c4.scrollIntoView({behavior:"smooth",block:"start"});
  document.body.append(ov);document.documentElement.style.overflow="hidden";
  try{history.pushState({vt:1},"")}catch(e){}
  if(focusDevis)setTimeout(()=>c4.scrollIntoView({block:"start"}),50)}
function close(){if(!ov)return;ov.remove();ov=null;document.documentElement.style.overflow=""}
addEventListener("popstate",()=>{if(ov)close()});

/* ---------- formulaire de devis ---------- */
function devisForm(){const c=el("section","card");c.id="vt-devis";c.append(el("h3","sec","Demande de devis"));const g=el("div","vt-form");
  const fld=(lb,mk,full)=>{const f=el("div","field"+(full?" full":""));const id="vt-"+Math.random().toString(36).slice(2,8);const l=el("label",null,lb);l.htmlFor=id;const i=mk();i.id=id;f.append(l,i);g.append(f);return i};
  const inp=(type,max,ph)=>()=>{const i=el("input");i.type=type;if(max)i.maxLength=max;if(ph)i.placeholder=ph;return i};
  const sel=(opts,first)=>()=>{const s=el("select");if(first)s.append(new Option(tr(first),""));opts.forEach(([v,t])=>s.append(new Option(tr(t),v)));return s};
  const niv=fld("Niveau souhaité",sel([["essentiel","B2A Essentiel"],["confort","B2A Confort"],["pro","B2A Pro"],["inconnu","Je ne sais pas encore"]]),true);niv.value="confort";
  const ele=fld("Élevage ou culture",sel(ELEV.map(e=>[e,e]),"Choisir…"),true);
  const nb=fld("Nombre d'animaux",inp("number"));nb.min="0";nb.inputMode="numeric";
  const sf=fld("Surface du bâtiment (m²)",inp("number"));sf.min="0";sf.inputMode="decimal";
  const nom=fld("Votre nom",inp("text",60));nom.value=(B.lsGet&&B.lsGet(B.LS_NAME))||"";
  const tel=fld("Téléphone (WhatsApp)",inp("tel",30));tel.inputMode="tel";
  const vil=fld("Ville",inp("text",60));const pay=fld("Pays",inp("text",40));pay.value="Burkina Faso";
  const ins=el("label","vt-chk full");const ck=el("input");ck.type="checkbox";ck.checked=true;ins.append(ck,el("span",null,"Je veux l'installation par B2A"));g.append(ins);
  const msg=fld("Votre besoin (facultatif)",()=>{const t=el("textarea");t.rows=3;t.maxLength=500;t.placeholder=tr("ex. bâtiment de 500 pondeuses, pas d'électricité la nuit…");return t},true);
  c.append(g);const m=el("p","msg");m.setAttribute("aria-live","polite");const b=el("button","btn","Envoyer la demande");b.type="button";c.append(b,m);
  const ko=t=>{m.textContent=tr(t);m.className="msg err"};
  b.onclick=async()=>{const d={niveau:niv.value,elevage:ele.value,animaux:Number(nb.value)||null,surface:Number(String(sf.value).replace(",","."))||null,nom:nom.value.trim().slice(0,60),tel:tel.value.trim().slice(0,30),
      ville:vil.value.trim().slice(0,60),pays:pay.value.trim().slice(0,40),install:ck.checked,message:msg.value.trim().slice(0,500)};
    if(!d.nom){ko("Indiquez votre nom.");nom.focus();return}if(String(d.tel).replace(/\D/g,"").length<8){ko("Indiquez un téléphone valide.");tel.focus();return}if(!d.ville){ko("Indiquez votre ville.");vil.focus();return}
    if(!navigator.onLine){ko("Pas de connexion internet : la demande n'est pas partie. Réessayez quand vous avez du réseau.");return}
    b.disabled=true;m.textContent="";let ok=false;
    try{if(B.CFG){await B.loadFirebase(B.CFG);const u=await B.ensureUser(B.CFG);const fs=firebase.firestore();
        await fs.collection("devis_b2a").add({...d,uid:u.uid,statut:"nouveau",creeLe:firebase.firestore.FieldValue.serverTimestamp()});ok=true}}catch(e){console.warn(e)}
    if(notify(d))ok=true;
    if(ok){m.textContent=tr("Demande envoyée. B2A vous contacte rapidement sur ce numéro.");m.className="msg good";b.hidden=true}
    else{ko("Envoi impossible. Vérifiez la connexion et réessayez.");b.disabled=false}};
  return c}
/* e-mail à B2A (même service que les inscriptions) */
function notify(d){const to=window.B2A_NOTIFY_ID||window.B2A_NOTIFY_EMAIL;if(!to)return false;
  const N={essentiel:"B2A Essentiel",confort:"B2A Confort",pro:"B2A Pro",inconnu:"À conseiller"};
  fetch("https://formsubmit.co/ajax/"+encodeURIComponent(to),{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},
    body:JSON.stringify({_subject:"B2A Smart Farming : demande de devis armoire B2A, "+d.nom+" ("+d.ville+")",_template:"table",_captcha:"false",
      "Nom":d.nom,"Téléphone":d.tel,"Ville":d.ville,"Pays":d.pays,"Élevage":d.elevage||"—","Animaux":d.animaux||"—","Surface (m²)":d.surface||"—","Niveau":N[d.niveau]||d.niveau,
      "Installation par B2A":d.install?"Oui":"Non","Besoin":d.message||"—","Voir les demandes":"https://azizyou2005.github.io/b2a-smart-farming/utilisateurs.html"})}).catch(()=>{});
  return true}

/* ================= emplacements ================= */
/* 1. Marché > Acheter : carte en haut */
{const body=$("m-body");if(body){let busy=false;new MutationObserver(()=>{if(busy)return;const v=document.querySelector('#m-seg [data-m="acheter"][aria-pressed="true"]');if(!v||$("vt-market"))return;
  busy=true;try{const c=teaser();c.id="vt-market";body.prepend(c)}finally{busy=false}}).observe(body,{childList:true})}}
/* 2. Poulailler connecté : bouton sous la vue 3D */
{const b=$("pc-3d");if(b&&!$("vt-pc")){const x=el("button","btn ghost","Équiper ma ferme");x.type="button";x.id="vt-pc";x.style.marginTop="8px";x.onclick=()=>open();b.after(x)}
 else{const V=$("v-poulailler");if(V){const mo=new MutationObserver(()=>{const p=$("pc-3d");if(p&&!$("vt-pc")){const x=el("button","btn ghost","Équiper ma ferme");x.type="button";x.id="vt-pc";x.style.marginTop="8px";x.onclick=()=>open();p.after(x);mo.disconnect()}});mo.observe(V,{childList:true,subtree:true})}}}
/* 3. onglet Contrôle d'un lot (version Pro) quand aucun dispositif n'est relié : appelé par pro.js */
window.B2A_VITRINE={open,teaser,devis:()=>open(true)};
})();
