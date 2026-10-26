/* B2A Smart Farming : annuaire des vétérinaires et prestataires agricoles (partie payante)
   Les éleveurs et agriculteurs trouvent un vétérinaire, un technicien ou un prestataire et l'appellent directement.
   Les prestataires s'inscrivent en payant un abonnement (1, 3 ou 12 mois) par Orange Money ou Moov Money ;
   B2A vérifie le paiement dans utilisateurs.html et met la fiche en ligne jusqu'à la date de fin.
   B2A-HIGH-TECHNOLOGY-AUTOMATION · Bayere Abdoul Aziz

   Données (Firestore) :
   services_pros/<uid>      { nom, metier, specialites, ville, quartier, zones, tel, wa, horaires, deplace, agrement, desc, photo,
                              statut: attente|actif|suspendu|refuse, finLe, verifie, creeLe, majLe }
                              (fiche publique quand statut = actif et finLe dans le futur ; statut, finLe et verifie posés par B2A)
   services_paiements/<id>  { pro, nom, formule: m1|m3|m12, mois, montant, ref, telPayeur, statut: attente|valide|refuse, motif, creeLe, valideLe, finApres }
   marche_config/global     { svcM1, svcM3, svcM12, telPaiement, nomPaiement }  (écrit par B2A) */
(function(){
const B=window.B2A;if(!B||!B.app)return;const A=B.app;
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const notr=e=>{e.setAttribute("data-notr","");return e};
const fmt=v=>v==null||!isFinite(v)?"—":Number(v).toLocaleString("fr-FR",{maximumFractionDigits:0});
const ms=v=>v==null?0:typeof v==="number"?v:v.toMillis?v.toMillis():v.seconds?v.seconds*1000:0;
const dlong=t=>new Date(t).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});
const tr=s=>window.__tr?window.__tr(s):s;
const digits=s=>String(s||"").replace(/\D/g,"");
/* numéro international : +XXX gardé, 00XXX → XXX, 8 chiffres → Burkina (226) */
function intl(t){t=String(t||"").trim();if(/^\+/.test(t))return digits(t);let d=digits(t);if(d.startsWith("00"))return d.slice(2);if(d.length===8)return "226"+d;return d}

const METIERS=[["veto","Vétérinaire"],["auxiliaire","Infirmier ou auxiliaire d'élevage"],["pharma","Pharmacie vétérinaire"],["conseil","Conseiller agricole ou technicien"],
  ["aliment","Fabrication d'aliment (provenderie)"],["incubation","Incubation et éclosion à façon"],["abattage","Abattage et plumage"],["transport","Transport d'animaux et de récoltes"],
  ["labour","Labour et travaux des champs"],["phyto","Traitement des cultures (pulvérisation, drone)"],["irrigation","Forage, irrigation et pompes solaires"],
  ["construction","Construction de bâtiments d'élevage"],["reparation","Réparation de matériel"],["formation","Formation"],["autre","Autre service"]];
const MN=k=>(METIERS.find(m=>m[0]===k)||METIERS[METIERS.length-1])[1];
const FORMULES=[["m1",1,"1 mois"],["m3",3,"3 mois"],["m12",12,"12 mois"]];
const DEF={svcM1:2500,svcM3:6000,svcM12:20000,telPaiement:"",nomPaiement:"B2A-HIGH-TECHNOLOGY-AUTOMATION"};
const prix=f=>Number(cfg["svc"+f.toUpperCase()])||DEF["svc"+f.toUpperCase()];
const enLigne=p=>p&&p.statut==="actif"&&ms(p.finLe)>Date.now();

/* ---------- 1. données ---------- */
let S=null;
const quick=pr=>{pr.catch(()=>{});return Promise.race([pr,new Promise(r=>setTimeout(()=>r("local"),1500))])};
async function store(){if(S)return S;
  if(B.CFG){await B.loadFirebase(B.CFG);const u=await B.ensureUser(B.CFG);const fs=firebase.firestore();
    S={kind:"cloud",uid:u.uid,col:n=>fs.collection(n),doc:p=>fs.doc(p),ts:()=>firebase.firestore.FieldValue.serverTimestamp(),newId:n=>fs.collection(n).doc().id}}
  else{const db=await B.getDb();S={kind:"local",uid:B.me,col:n=>db.collection(n),doc:p=>db.doc(p),ts:()=>Date.now(),newId:()=>B.newId()}}
  return S}
/* écriture confirmée par le serveur (12 s maximum) pour signaler un refus au lieu de « rien ne se passe » */
function sure(pr){if(!S||S.kind!=="cloud"||!navigator.onLine)return quick(pr);return Promise.race([pr.then(()=>"ok"),new Promise(r=>setTimeout(()=>r("lent"),12000))])}

let cfg={...DEF},pros=[],mine=null,mesPaie=[],started=false,noAccess=false,failed=false;
let view="list",back="list",openId=null,cat="",q="",ville="",formule="m3",draft=null,flash="",flashT=0;
function listen(){if(started)return;started=true;
  store().then(s=>{
    const err=e=>{console.warn("services",e);if(e&&e.code==="permission-denied"&&!noAccess){noAccess=true;redraw(true)}};
    s.doc("marche_config/global").onSnapshot(d=>{cfg={...DEF,...(d.exists?d.data():{})};redraw()},err);
    s.col("services_pros").where("statut","==","actif").onSnapshot(x=>{pros=x.docs.map(d=>({id:d.id,...d.data()}));redraw()},err);
    s.doc("services_pros/"+s.uid).onSnapshot(d=>{mine=d.exists?{id:d.id,...d.data()}:null;redraw()},err);
    s.col("services_paiements").where("pro","==",s.uid).onSnapshot(x=>{mesPaie=x.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>ms(b.creeLe)-ms(a.creeLe));redraw()},err);
  }).catch(e=>{console.warn(e);failed=true;redraw(true)})}
/* pas de redessin pendant la saisie d'un formulaire (on perdrait ce qui est tapé) */
function redraw(force){if(!force&&(view==="form"||view==="pay"))return;const M=window.B2A_MARCHE;if(M&&M.render)M.render()}

/* ---------- 2. affichage (appelé par le Marché quand l'onglet « Services » est choisi) ---------- */
function render(Bd){listen();
  if(failed){Bd.append(el("p","msg err","Les services ont besoin d'internet pour s'ouvrir la première fois. Connectez-vous puis revenez."));return}
  if(noAccess){const c=el("section","card");c.append(el("h2","sec","Vétérinaires et services"),el("p","note","Les services ouvrent très bientôt. Revenez dans quelques instants."));Bd.append(c);return}
  if(flash&&Date.now()<flashT)Bd.append(el("p","msg good m-flash",flash));
  if(view==="form"){Bd.append(proForm());return}
  if(view==="pay"){Bd.append(payForm());return}
  if(view==="pro"){Bd.append(proSpace());return}
  if(view==="detail"){const p=visibles().find(x=>x.id===openId)||(mine&&mine.id===openId?mine:null);if(p){Bd.append(detail(p));return}view="list"}
  renderList(Bd)}
const visibles=()=>pros.filter(enLigne);

/* --- trouver un service --- */
function renderList(Bd){
  const top=el("section","card s-intro");top.append(el("h2","sec","Vétérinaires et services agricoles"),
    el("p","note","Trouvez un vétérinaire, un technicien ou un prestataire près de chez vous et appelez-le directement."));
  if(mine){const b=el("button","btn small ghost","Mon espace prestataire");b.type="button";b.onclick=()=>go("pro");top.append(b)}
  Bd.append(top);
  const f=el("section","card m-filters");const s=el("input");s.type="search";s.placeholder="Rechercher : vétérinaire, vaccination, labour…";s.value=q;s.setAttribute("aria-label","Rechercher");
  const v=el("input");v.type="search";v.placeholder="Ville";v.value=ville;v.setAttribute("aria-label","Ville");v.style.flex="1 1 120px";
  const r=el("div","row");r.append(s,v);f.append(r);
  const present=new Set(visibles().map(p=>p.metier));
  const ch=el("div","m-chips");[["","Tout"],...METIERS.filter(m=>present.has(m[0])||m[0]==="veto")].forEach(([k,n])=>{const b=el("button","chip",n);b.type="button";b.setAttribute("aria-pressed",cat===k);
    b.onclick=()=>{cat=k;ch.querySelectorAll(".chip").forEach(x=>x.setAttribute("aria-pressed",x===b));list()};ch.append(b)});f.append(ch);
  const L=el("div","m-grid");f.append(L);Bd.append(f);
  s.oninput=()=>{q=s.value;list()};v.oninput=()=>{ville=v.value;list()};
  function list(){L.innerHTML="";const qq=q.trim().toLowerCase(),vv=ville.trim().toLowerCase();
    const res=visibles().filter(p=>(!cat||p.metier===cat)&&(!qq||[p.nom,MN(p.metier),tr(MN(p.metier)),p.specialites,p.desc,p.zones].join(" ").toLowerCase().includes(qq))
      &&(!vv||[p.ville,p.quartier,p.zones].join(" ").toLowerCase().includes(vv)))
      .sort((a,b)=>(b.verifie?1:0)-(a.verifie?1:0)||(a.metier==="veto"?0:1)-(b.metier==="veto"?0:1)||String(a.nom||"").localeCompare(String(b.nom||"")));
    if(!res.length){const e=el("div","empty");e.append(el("strong",null,visibles().length?"Aucun prestataire ne correspond":"Aucun prestataire inscrit pour l'instant"),
      el("span",null,visibles().length?"Changez la recherche, la ville ou le métier.":"Les vétérinaires et prestataires inscrits apparaîtront ici."));L.append(e);return}
    res.forEach(p=>L.append(card(p)))}
  list();
  /* appel aux prestataires */
  if(!mine){const c=el("section","card s-join");c.append(el("h2","sec","Vous êtes vétérinaire ou prestataire ?"),
    el("p","note","Présentez vos services à tous les éleveurs et agriculteurs qui utilisent B2A Smart Farming. Ils vous appellent directement."));
    const ul=el("ul","plain s-tarifs");FORMULES.forEach(([k,m,lab])=>ul.append(el("li",null,`${lab} : ${fmt(prix(k))} F`)));c.append(ul);
    const b=el("button","btn","Proposer mes services");b.type="button";b.onclick=()=>{draft=null;go("form")};c.append(b);Bd.append(c)}}
function card(p){const b=el("button","m-card s-card");b.type="button";const ph=el("div","m-ph s-ph");
  if(p.photo){const im=el("img");im.src=p.photo;im.alt="";im.loading="lazy";ph.append(im)}else ph.append(notr(el("span",null,String(p.nom||"?").trim().slice(0,1).toUpperCase())));b.append(ph);
  const t=el("div","m-tx");t.append(notr(el("b",null,p.nom||"Prestataire")),el("span","s-met",MN(p.metier)));
  if(p.verifie)t.append(el("span","m-ok","✓ Vérifié par B2A"));
  t.append(notr(el("small",null,[p.quartier,p.ville].filter(Boolean).join(", "))));if(p.deplace)t.append(el("small","s-dep","Se déplace à la ferme"));
  b.append(t);b.onclick=()=>{back=view==="pro"?"pro":"list";openId=p.id;go("detail")};return b}
function detail(p){const own=S&&p.id===S.uid;const c=el("div","card m-det");const bk=el("button","back","‹ Retour aux services");bk.type="button";bk.onclick=()=>go(back);c.append(bk);
  const h=el("div","s-head");const ph=el("div","s-av");if(p.photo){const im=el("img");im.src=p.photo;im.alt="";ph.append(im)}else ph.append(notr(el("span",null,String(p.nom||"?").trim().slice(0,1).toUpperCase())));
  const t=el("div");t.append(notr(el("h2","sec",p.nom||"Prestataire")),el("span","s-met",MN(p.metier)));if(p.verifie)t.append(el("span","m-ok","✓ Vérifié par B2A"));h.append(ph,t);c.append(h);
  const info=[["Spécialités",p.specialites],["Lieu",[p.quartier,p.ville].filter(Boolean).join(", ")],["Zones desservies",p.zones],["Horaires",p.horaires],
    ["N° d'agrément",p.agrement],["Déplacement",p.deplace?"Se déplace à la ferme":""]].filter(x=>x[1]);
  const dl=el("dl","cu-info");info.forEach(([k,v])=>{dl.append(el("dt",null,k));const dd=el("dd",null,String(v));if(k!=="Déplacement")notr(dd);dl.append(dd)});c.append(dl);
  if(p.desc)c.append(notr(el("p",null,p.desc)));
  const msg=tr("Bonjour, j'ai trouvé votre fiche sur B2A Smart Farming. J'ai besoin de vos services.");
  const r=el("div","row s-acts");const a1=el("a","btn","Appeler");a1.href="tel:+"+intl(p.tel);const a2=el("a","btn ghost","WhatsApp");a2.href="https://wa.me/"+intl(p.wa||p.tel)+"?text="+encodeURIComponent(msg);a2.target="_blank";a2.rel="noopener";
  r.append(a1,a2);c.append(r);
  c.append(el("p","note","B2A met en relation : convenez du prix, du rendez-vous et du paiement directement avec le prestataire."));
  if(own)c.append(el("p","note","C'est votre fiche. Modifiez-la dans « Mon espace prestataire »."));
  return c}

/* --- espace prestataire --- */
function statut(p){if(!p)return ["Pas encore inscrit","warn"];if(p.statut==="suspendu")return ["Fiche suspendue par B2A","bad"];if(p.statut==="refuse")return ["Paiement refusé","bad"];
  if(enLigne(p))return [`En ligne jusqu'au ${dlong(ms(p.finLe))}`,"ok"];if(p.statut==="actif"&&ms(p.finLe))return [`Abonnement terminé le ${dlong(ms(p.finLe))}`,"bad"];return ["En attente de vérification du paiement","warn"]}
function proSpace(){const c=el("section","card");const bk=el("button","back","‹ Retour aux services");bk.type="button";bk.onclick=()=>go("list");c.append(bk);
  c.append(el("h2","sec","Mon espace prestataire"));
  if(!mine){c.append(el("p","note","Vous n'avez pas encore de fiche."));const b=el("button","btn","Proposer mes services");b.type="button";b.onclick=()=>{draft=null;go("form")};c.append(b);return c}
  const [lab,cl]=statut(mine);c.append(el("p","pill s-"+cl+" s-stat",lab));
  const att=mesPaie.find(x=>x.statut==="attente");
  if(att){c.append(el("p","note","B2A vérifie votre paiement, puis met votre fiche en ligne. Vous pouvez envoyer la preuve par WhatsApp pour aller plus vite."));const w=proofBtn(att);if(w)c.append(w)}
  if(enLigne(mine)){const left=Math.ceil((ms(mine.finLe)-Date.now())/864e5);if(left<=7)c.append(el("p","msg err",`Votre abonnement se termine dans ${left} jour(s). Renouvelez-le pour rester visible.`))}
  if(mine.statut==="suspendu")c.append(el("p","note","Contactez B2A pour en connaître la raison."));
  const r=el("div","row");const e=el("button","btn ghost","Modifier ma fiche");e.type="button";e.onclick=()=>{draft={...mine};go("form")};r.append(e);
  if(!att&&mine.statut!=="suspendu"){const p=el("button","btn",enLigne(mine)?"Prolonger mon abonnement":"Payer mon abonnement");p.type="button";p.onclick=()=>{draft={...mine};go("pay")};r.append(p)}
  c.append(r);
  c.append(el("h3","sec","Ce que voient les éleveurs"));const prev=el("div","s-prev");prev.append(card(mine));c.append(prev);
  if(mesPaie.length){c.append(el("h3","sec","Mes paiements"));const ul=el("ul","plain s-pay");
    mesPaie.forEach(x=>{const li=el("li");const st={attente:["En vérification","warn"],valide:["Validé","ok"],refuse:["Refusé","bad"]}[x.statut]||["—","warn"];
      li.append(el("span",null,`${fmt(x.montant)} F · ${(FORMULES.find(f=>f[0]===x.formule)||[0,0,""])[2]} · ${ms(x.creeLe)?dlong(ms(x.creeLe)):""}`),el("span","pill s-"+st[1],st[0]));
      if(x.statut==="valide"&&ms(x.finApres))li.append(el("small",null,`En ligne jusqu'au ${dlong(ms(x.finApres))}`));
      if(x.statut==="refuse"&&x.motif)li.append(notr(el("small","msg err",x.motif)));ul.append(li)});c.append(ul)}
  const d=el("details","box");d.append(el("summary",null,"Conditions des services B2A"));d.append(conditions());c.append(d);
  const del=el("button","btn small ghost danger","Supprimer ma fiche");del.type="button";
  del.onclick=async()=>{if(del.dataset.c!=="1"){del.dataset.c="1";del.textContent="Confirmer : supprimer ma fiche";return}del.disabled=true;
    try{await sure(S.doc("services_pros/"+S.uid).delete());if(S.kind==="local")mine=null;go("list")}catch(e){del.disabled=false}};c.append(del);
  return c}
function proofBtn(x){if(!cfg.telPaiement)return null;const w=el("a","btn small ghost","Envoyer la preuve par WhatsApp");
  w.href="https://wa.me/"+intl(cfg.telPaiement)+"?text="+encodeURIComponent(`${tr("Bonjour B2A, j'ai payé mon abonnement aux Services B2A Smart Farming.")} ${fmt(x.montant)} F · ${x.ref||""} · ${(mine&&mine.nom)||x.nom||""} (${x.telPayeur||""})`);
  w.target="_blank";w.rel="noopener";return w}
function conditions(){const ul=el("ul","s-cond");["Votre fiche est publiée après vérification du paiement par B2A, pour la durée payée. Sans renouvellement, elle disparaît à la date de fin.",
  "Les informations doivent être exactes. Les vétérinaires et auxiliaires doivent être autorisés à exercer.",
  "B2A met en relation : le prix, la qualité et le paiement de vos prestations se règlent directement entre vous et vos clients.",
  "B2A peut suspendre une fiche en cas d'informations fausses ou de plaintes répétées des utilisateurs.",
  "Votre numéro de téléphone est visible par les utilisateurs de l'application quand votre fiche est en ligne."].forEach(t=>ul.append(el("li",null,t)));return ul}

/* --- fiche du prestataire (création ou modification) --- */
function proForm(){const p=draft||{};const c=el("section","card");const bk=el("button","back","‹ Annuler");bk.type="button";bk.onclick=()=>go(mine?"pro":"list");c.append(bk);
  c.append(el("h2","sec",mine?"Modifier ma fiche":"Proposer mes services"));
  if(!mine)c.append(el("p","note","Étape 1 sur 2 : votre fiche. Étape 2 : le paiement de l'abonnement."));
  const g=el("div","grid2");c.append(g);
  const fld=(lab,val,ph,max,type)=>{const f=el("div","field");const l=el("label",null,lab);const i=el("input");i.type=type||"text";i.id="s-f-"+Math.random().toString(36).slice(2,7);l.htmlFor=i.id;i.value=val||"";if(ph)i.placeholder=ph;i.maxLength=max||60;f.append(l,i);g.append(f);return [f,i]};
  const [,nom]=fld("Nom ou nom de l'entreprise",p.nom||B.lsGet(B.LS_NAME)||"","ex. Dr Ouédraogo Moussa",60);
  const fm=el("div","field");const lm=el("label",null,"Métier");const sm=el("select");sm.id="s-f-met";lm.htmlFor=sm.id;METIERS.forEach(([k,n])=>sm.append(new Option(n,k)));sm.value=p.metier||"veto";fm.append(lm,sm);g.append(fm);
  const [,spe]=fld("Spécialités (facultatif)",p.specialites,"ex. volailles, ruminants, vaccination à domicile",100);
  const [,tel]=fld("Téléphone",p.tel||B.lsGet("b2a-m-tel")||"","ex. 70 12 34 56",30,"tel");
  const [,wa]=fld("WhatsApp, si autre numéro (facultatif)",p.wa,"ex. 76 12 34 56",30,"tel");
  const [,vil]=fld("Ville",p.ville||B.lsGet("b2a-m-ville")||"","ex. Ouagadougou",60);
  const [,qua]=fld("Quartier ou village (facultatif)",p.quartier,"ex. Tanghin",60);
  const [,zon]=fld("Zones desservies (facultatif)",p.zones,"ex. Ouagadougou et 50 km autour",100);
  const [,hor]=fld("Horaires (facultatif)",p.horaires,"ex. Lundi–samedi, 7 h–18 h",60);
  const [fa,agr]=fld("N° d'agrément ou d'inscription à l'Ordre (facultatif)",p.agrement,"ex. 123/MRAH",40);
  const fd=el("div","field");const ld=el("label",null,"Présentation (facultatif)");const ds=el("textarea");ds.id="s-f-desc";ld.htmlFor=ds.id;ds.rows=3;ds.maxLength=400;ds.value=p.desc||"";
  ds.placeholder="ex. Vaccination, déparasitage, soins et suivi des élevages. Intervention rapide.";fd.append(ld,ds);g.append(fd);
  const dep=el("label","m-check");const dk=el("input");dk.type="checkbox";dk.checked=p.deplace!==false;dep.append(dk,document.createTextNode(" Je me déplace à la ferme"));c.append(dep);
  const syncA=()=>{fa.hidden=!["veto","auxiliaire","pharma"].includes(sm.value)};sm.onchange=syncA;syncA();
  /* photo ou logo */
  let photo=p.photo||"";const pw=el("div","m-photo");const pv=el("div","m-ph s-ph");const setPv=()=>{pv.innerHTML="";if(photo){const im=el("img");im.src=photo;im.alt="";pv.append(im)}else pv.append(el("span",null,"Photo"));if(rm)rm.hidden=!photo};let rm=null;
  const fi=el("input");fi.type="file";fi.accept="image/*";fi.id="s-f-photo";fi.hidden=true;const fl=el("label","btn small ghost","Photo ou logo (facultatif)");fl.htmlFor=fi.id;
  rm=el("button","btn small ghost","Retirer la photo");rm.type="button";rm.onclick=()=>{photo="";setPv()};setPv();
  const rr=el("div");rr.style.cssText="display:grid;gap:6px;justify-items:start";rr.append(fl,fi,rm);pw.append(pv,rr);c.append(pw);
  fi.onchange=async()=>{const f=fi.files[0];if(!f)return;try{photo=await compress(f,600,150000);setPv()}catch(e){}fi.value=""};
  const m=el("p","msg");const sv=el("button","btn",mine?"Enregistrer ma fiche":"Continuer : payer l'abonnement");sv.type="button";c.append(sv,m);
  sv.onclick=async()=>{const bad=x=>{m.textContent=x;m.className="msg err"};
    if(!nom.value.trim())return bad("Indiquez votre nom.");if(digits(tel.value).length<8)return bad("Indiquez votre numéro de téléphone.");if(!vil.value.trim())return bad("Indiquez votre ville.");
    const d={nom:nom.value.trim(),metier:sm.value,specialites:spe.value.trim(),tel:tel.value.trim(),wa:wa.value.trim(),ville:vil.value.trim(),quartier:qua.value.trim(),zones:zon.value.trim(),
      horaires:hor.value.trim(),agrement:fa.hidden?"":agr.value.trim(),desc:ds.value.trim(),deplace:dk.checked,photo};
    B.lsSet("b2a-m-tel",d.tel);B.lsSet("b2a-m-ville",d.ville);
    if(!mine){draft=d;go("pay");return}
    sv.disabled=true;try{const r=await sure(S.doc("services_pros/"+S.uid).update({...d,majLe:S.ts()}));if(S.kind==="local")mine={...mine,...d};flashT=Date.now()+15000;flash=r==="lent"?"Réseau lent : la fiche sera enregistrée dès que la connexion le permet.":"Fiche enregistrée.";draft=null;go("pro")}
    catch(e){console.warn(e);sv.disabled=false;bad(errTxt(e))}};
  return c}
const errTxt=e=>{const c=e&&e.code||"";return c==="permission-denied"?"Envoi refusé par le serveur. Fermez et rouvrez l'application, puis réessayez ; si cela continue, contactez B2A.":
  c==="unavailable"?"Pas de connexion au serveur. Réessayez quand le réseau revient.":"L'envoi a échoué. Vérifiez la connexion."};

/* --- paiement de l'abonnement --- */
function payForm(){const p=draft||mine||{};const c=el("section","card");const bk=el("button","back","‹ Retour");bk.type="button";bk.onclick=()=>go(mine?"pro":"form");c.append(bk);
  c.append(el("h2","sec",mine?"Payer mon abonnement":"Étape 2 sur 2 : l'abonnement"));
  c.append(el("p","note","Choisissez la durée. Votre fiche est visible par tous les utilisateurs de l'application pendant toute cette durée."));
  const sg=el("div","s-form");FORMULES.forEach(([k,mois,lab])=>{const b=el("button","s-opt");b.type="button";b.setAttribute("aria-pressed",formule===k);
    b.append(el("b",null,lab),el("span",null,`${fmt(prix(k))} F`));if(mois>1)b.append(el("small",null,`soit ${fmt(Math.round(prix(k)/mois))} F par mois`));
    b.onclick=()=>{formule=k;sg.querySelectorAll(".s-opt").forEach(x=>x.setAttribute("aria-pressed",x===b));upd()};sg.append(b)});c.append(sg);
  const how=el("div","priority s-how");c.append(how);
  const upd=()=>{how.innerHTML="";how.append(el("strong",null,"Comment payer"));
    if(cfg.telPaiement){how.append(el("span",null,`Envoyez ${fmt(prix(formule))} F par Orange Money ou Moov Money au numéro :`));const n=notr(el("b","s-num",cfg.telPaiement));how.append(n,notr(el("span",null,cfg.nomPaiement||"B2A")));
      how.append(el("span",null,"Gardez le SMS de confirmation : il contient la référence de la transaction."))}
    else how.append(el("span",null,"B2A vous indique le numéro de paiement par WhatsApp. Le numéro n'est pas encore affiché ici."))};upd();
  const g=el("div","grid2");c.append(g);const fld=(lab,val,ph,max,type)=>{const f=el("div","field");const l=el("label",null,lab);const i=el("input");i.type=type||"text";i.id="s-p-"+Math.random().toString(36).slice(2,7);l.htmlFor=i.id;i.value=val||"";if(ph)i.placeholder=ph;i.maxLength=max;f.append(l,i);g.append(f);return i};
  const tp=fld("Numéro qui a payé",B.lsGet("b2a-s-payeur")||p.tel||"","ex. 70 12 34 56",30,"tel");
  const rf=fld("Référence de la transaction (dans le SMS)","","ex. CI2410.1530.A1234",40);rf.autocomplete="off";
  c.append(el("h3","sec","Conditions"));c.append(conditions());
  const ok=el("label","m-check");const ck=el("input");ck.type="checkbox";ok.append(ck,document.createTextNode(" J'accepte les conditions des services B2A et j'atteste que mes informations sont exactes."));c.append(ok);
  const m=el("p","msg");const go2=el("button","btn","Envoyer ma demande");go2.type="button";c.append(go2,m);
  go2.onclick=async()=>{const bad=x=>{m.textContent=x;m.className="msg err"};
    if(digits(tp.value).length<8)return bad("Indiquez le numéro qui a payé.");if(rf.value.trim().length<4)return bad("Indiquez la référence de la transaction reçue par SMS.");
    if(!ck.checked)return bad("Cochez l'acceptation des conditions.");
    B.lsSet("b2a-s-payeur",tp.value.trim());go2.disabled=true;go2.textContent="Envoi…";
    try{if(!S)await store();
      if(!mine){const d={...draft,statut:"attente",creeLe:S.ts(),majLe:S.ts()};await sure(S.doc("services_pros/"+S.uid).set(d));if(S.kind==="local")mine={id:S.uid,...d}}
      const f=FORMULES.find(x=>x[0]===formule);const pay={pro:S.uid,nom:(draft&&draft.nom)||(mine&&mine.nom)||"",formule,mois:f[1],montant:prix(formule),ref:rf.value.trim().toUpperCase(),telPayeur:tp.value.trim(),statut:"attente",creeLe:S.ts()};
      const r2=await sure(S.doc("services_paiements/"+S.newId("services_paiements")).set(pay));if(S.kind==="local")mesPaie=[{...pay},...mesPaie];
      flashT=Date.now()+15000;flash=(r2==="lent"?"Réseau lent : la demande part dès que la connexion le permet. ":"")+"Demande envoyée. B2A vérifie votre paiement, puis met votre fiche en ligne.";draft=null;go("pro")}
    catch(e){console.warn(e);go2.disabled=false;go2.textContent="Envoyer ma demande";bad(errTxt(e))}};
  return c}

function compress(file,MX,LIM){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>{let M=MX,q=.8;const draw=()=>{const r=Math.min(1,M/Math.max(im.width,im.height));
  const cv=document.createElement("canvas");cv.width=Math.round(im.width*r);cv.height=Math.round(im.height*r);cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);return cv.toDataURL("image/jpeg",q)};
  let u=draw();while(u.length>LIM&&q>.35){q-=.1;u=draw()}while(u.length>LIM&&M>200){M=Math.round(M*.8);u=draw()}URL.revokeObjectURL(im.src);u.length>LIM?rej(new Error("trop grand")):res(u)};
  im.onerror=rej;im.src=URL.createObjectURL(file)})}

function go(v){view=v;const M=window.B2A_MARCHE;if(M&&M.render)M.render();window.scrollTo(0,0)}
/* ouvrir l'annuaire depuis l'accueil ou le guide santé */
function openServices(metier){cat=metier||"";view="list";const M=window.B2A_MARCHE;if(M&&M.setMode)M.setMode("services")}

/* ---------- 3. raccourci sur l'accueil ---------- */
{const home=$("home");if(home){const c=el("section","card s-home");c.id="s-home";
  c.innerHTML=`<div class="s-home-in"><div class="s-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/><path d="M9 11h6M12 8v6"/></svg></div>
    <div><h2 class="sec">Besoin d'un vétérinaire ?</h2><p class="note">Vétérinaires, techniciens et prestataires près de chez vous.</p></div></div>`;
  const b=el("button","btn","Trouver un service");b.type="button";b.onclick=()=>openServices("");c.append(b);
  const ct=$("p-contacts");if(ct&&ct.parentNode===home)home.insertBefore(c,ct);else home.append(c)}}
const css=el("style");css.textContent=`
.s-intro{gap:8px}.s-intro .btn{justify-self:start}
.s-met{color:var(--green-ink,#3b7520);font:600 13px/1.3 var(--body)}.s-dep{color:var(--muted)}
.s-card{grid-template-rows:none;grid-template-columns:64px minmax(0,1fr);align-items:center;gap:12px;padding:12px}.s-card .m-tx{gap:3px;padding:0}
.s-card .s-ph{width:64px;height:64px;aspect-ratio:auto;border-radius:14px;background:var(--navy,#1b2e4c);color:var(--brand-green,#72ac48);font:800 24px var(--display)}
.m-ok{justify-self:start}.s-intro,.m-filters .row{flex-wrap:wrap}.m-filters input[type=search]{flex:1 1 180px}
.s-prev .s-card{background:var(--surface)}.m-photo .s-ph{width:96px;height:96px;aspect-ratio:auto;border-radius:16px;font:600 14px var(--body)}
.s-head{display:flex;gap:14px;align-items:center}.s-head h2{margin:0}.s-head>div:last-child{display:grid;gap:4px}
.s-av{width:72px;height:72px;border-radius:16px;overflow:hidden;flex:none;display:grid;place-items:center;background:var(--navy,#1b2e4c);color:var(--brand-green,#72ac48);font:800 28px var(--display)}
.s-av img{width:100%;height:100%;object-fit:cover}
.s-acts .btn{flex:1 1 140px;text-align:center}
.s-join{border:2px solid var(--brand-gold,#deab50)}.s-tarifs{margin:0;padding-left:18px;display:grid;gap:2px;font-weight:600}
.s-form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.s-opt{display:grid;gap:2px;justify-items:center;text-align:center;padding:12px 6px;border:1.5px solid var(--line);border-radius:12px;background:var(--surface);color:var(--ink);font:inherit;cursor:pointer}
.s-opt b{font:800 16px var(--display)}.s-opt span{font:700 15px var(--display);color:var(--heading)}.s-opt small{color:var(--muted);font-size:12px}
.s-opt[aria-pressed="true"]{border-color:var(--navy,#1b2e4c);box-shadow:inset 0 -3px 0 var(--brand-green,#72ac48);background:var(--leaf-soft,#e4eaf4)}
.s-how{display:grid;gap:4px}.s-num{font:800 22px var(--display);letter-spacing:.03em;color:var(--heading)}
.s-cond{margin:0;padding-left:18px;display:grid;gap:6px;font-size:14px;color:var(--ink)}
.s-stat{justify-self:start;white-space:normal}.s-prev{max-width:320px}
.s-pay{display:grid;gap:8px;margin:0;padding:0;list-style:none}.s-pay li{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;justify-content:space-between;padding:10px 12px;border:1px solid var(--line);border-radius:10px}
.s-pay li small{flex-basis:100%}
.s-home{gap:12px}.s-home-in{display:flex;gap:14px;align-items:center}.s-home h2{margin:0}.s-home .note{margin:2px 0 0}.s-home .btn{justify-self:start}
.s-ico{width:52px;height:52px;border-radius:14px;background:var(--navy,#1b2e4c);display:grid;place-items:center;flex:none}
.s-ico svg{width:28px;height:28px;fill:none;stroke:var(--brand-green,#72ac48);stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.s-find{margin-top:6px;background:var(--brand-green,#72ac48)!important;color:#fff!important;border:0!important;justify-self:start}
#m-seg{grid-template-columns:repeat(4,minmax(0,1fr))}#m-seg button{padding:10px 2px;font-size:13.5px;line-height:1.2}`;
document.head.append(css);

/* ---------- 4. traductions ---------- */
const TR={
"Services":["Services","Servizi","Servicios"],
"Vétérinaires et services":["Vets and services","Veterinari e servizi","Veterinarios y servicios"],
"Vétérinaires et services agricoles":["Vets and farm services","Veterinari e servizi agricoli","Veterinarios y servicios agrícolas"],
"Trouvez un vétérinaire, un technicien ou un prestataire près de chez vous et appelez-le directement.":["Find a vet, a technician or a service provider near you and call them directly.","Trova un veterinario, un tecnico o un fornitore di servizi vicino a te e chiamalo direttamente.","Encuentre un veterinario, un técnico o un proveedor cerca de usted y llámelo directamente."],
"Mon espace prestataire":["My provider space","Il mio spazio fornitore","Mi espacio de proveedor"],
"Rechercher : vétérinaire, vaccination, labour…":["Search: vet, vaccination, ploughing…","Cerca: veterinario, vaccinazione, aratura…","Buscar: veterinario, vacunación, arado…"],
"Aucun prestataire ne correspond":["No provider matches","Nessun fornitore corrisponde","Ningún proveedor coincide"],
"Aucun prestataire inscrit pour l'instant":["No providers registered yet","Nessun fornitore iscritto per ora","Aún no hay proveedores inscritos"],
"Changez la recherche, la ville ou le métier.":["Change the search, the town or the trade.","Cambia la ricerca, la città o il mestiere.","Cambie la búsqueda, la ciudad o el oficio."],
"Les vétérinaires et prestataires inscrits apparaîtront ici.":["Registered vets and providers will appear here.","I veterinari e i fornitori iscritti compariranno qui.","Los veterinarios y proveedores inscritos aparecerán aquí."],
"Vous êtes vétérinaire ou prestataire ?":["Are you a vet or a service provider?","Sei veterinario o fornitore di servizi?","¿Es usted veterinario o proveedor?"],
"Présentez vos services à tous les éleveurs et agriculteurs qui utilisent B2A Smart Farming. Ils vous appellent directement.":["Show your services to every livestock and crop farmer using B2A Smart Farming. They call you directly.","Presenta i tuoi servizi a tutti gli allevatori e agricoltori che usano B2A Smart Farming. Ti chiamano direttamente.","Presente sus servicios a todos los ganaderos y agricultores que usan B2A Smart Farming. Le llaman directamente."],
"Proposer mes services":["Offer my services","Offri i miei servizi","Ofrecer mis servicios"],
"{0} mois : {1} F":["{0} {0:month|months}: {1} F","{0} {0:mese|mesi}: {1} F","{0} {0:mes|meses}: {1} F"],
"{0} mois":["{0} {0:month|months}","{0} {0:mese|mesi}","{0} {0:mes|meses}"],
"Prestataire":["Provider","Fornitore","Proveedor"],
"✓ Vérifié par B2A":["✓ Verified by B2A","✓ Verificato da B2A","✓ Verificado por B2A"],
"Se déplace à la ferme":["Comes to the farm","Si sposta in fattoria","Se desplaza a la granja"],
"‹ Retour aux services":["‹ Back to services","‹ Torna ai servizi","‹ Volver a los servicios"],
"Spécialités":["Specialities","Specialità","Especialidades"],"Lieu":["Location","Luogo","Lugar"],"Zones desservies":["Areas served","Zone servite","Zonas atendidas"],
"Horaires":["Opening hours","Orari","Horario"],"N° d'agrément":["Licence no.","N. di abilitazione","N.º de habilitación"],"Déplacement":["Farm visits","Spostamenti","Desplazamiento"],
"Appeler":["Call","Chiama","Llamar"],
"Bonjour, j'ai trouvé votre fiche sur B2A Smart Farming. J'ai besoin de vos services.":["Hello, I found your profile on B2A Smart Farming. I need your services.","Buongiorno, ho trovato la sua scheda su B2A Smart Farming. Ho bisogno dei suoi servizi.","Hola, encontré su ficha en B2A Smart Farming. Necesito sus servicios."],
"B2A met en relation : convenez du prix, du rendez-vous et du paiement directement avec le prestataire.":["B2A connects you: agree on the price, the appointment and the payment directly with the provider.","B2A vi mette in contatto: concorda prezzo, appuntamento e pagamento direttamente con il fornitore.","B2A le pone en contacto: acuerde el precio, la cita y el pago directamente con el proveedor."],
"C'est votre fiche. Modifiez-la dans {q0}.":["This is your profile. Edit it in {q0}.","È la tua scheda. Modificala in {q0}.","Es su ficha. Modifíquela en {q0}."],
"Pas encore inscrit":["Not registered yet","Non ancora iscritto","Aún no inscrito"],"Fiche suspendue par B2A":["Profile suspended by B2A","Scheda sospesa da B2A","Ficha suspendida por B2A"],
"Paiement refusé":["Payment refused","Pagamento rifiutato","Pago rechazado"],"En ligne jusqu'au {0}":["Online until {0}","Online fino al {0}","En línea hasta el {0}"],
"Abonnement terminé le {0}":["Subscription ended on {0}","Abbonamento terminato il {0}","Suscripción terminada el {0}"],
"En attente de vérification du paiement":["Waiting for payment check","In attesa di verifica del pagamento","Esperando la verificación del pago"],
"Vous n'avez pas encore de fiche.":["You don't have a profile yet.","Non hai ancora una scheda.","Aún no tiene ficha."],
"B2A vérifie votre paiement, puis met votre fiche en ligne. Vous pouvez envoyer la preuve par WhatsApp pour aller plus vite.":["B2A checks your payment, then puts your profile online. You can send the proof by WhatsApp to speed things up.","B2A verifica il pagamento, poi mette online la tua scheda. Puoi inviare la prova su WhatsApp per fare prima.","B2A verifica su pago y luego publica su ficha. Puede enviar el comprobante por WhatsApp para ir más rápido."],
"Votre abonnement se termine dans {0} jour(s). Renouvelez-le pour rester visible.":["Your subscription ends in {0} day(s). Renew it to stay visible.","Il tuo abbonamento termina tra {0} giorno/i. Rinnovalo per restare visibile.","Su suscripción termina en {0} día(s). Renuévela para seguir visible."],
"Contactez B2A pour en connaître la raison.":["Contact B2A to find out why.","Contatta B2A per conoscerne il motivo.","Contacte con B2A para saber el motivo."],
"Modifier ma fiche":["Edit my profile","Modifica la mia scheda","Modificar mi ficha"],"Prolonger mon abonnement":["Extend my subscription","Prolunga il mio abbonamento","Prolongar mi suscripción"],
"Payer mon abonnement":["Pay my subscription","Paga il mio abbonamento","Pagar mi suscripción"],"Ce que voient les éleveurs":["What farmers see","Cosa vedono gli allevatori","Lo que ven los ganaderos"],
"Mes paiements":["My payments","I miei pagamenti","Mis pagos"],"En vérification":["Being checked","In verifica","En verificación"],"Validé":["Approved","Convalidato","Validado"],"Refusé":["Refused","Rifiutato","Rechazado"],
"Conditions des services B2A":["B2A services terms","Condizioni dei servizi B2A","Condiciones de los servicios B2A"],
"Supprimer ma fiche":["Delete my profile","Elimina la mia scheda","Eliminar mi ficha"],"Confirmer : supprimer ma fiche":["Confirm: delete my profile","Conferma: elimina la mia scheda","Confirmar: eliminar mi ficha"],
"Envoyer la preuve par WhatsApp":["Send the proof by WhatsApp","Invia la prova su WhatsApp","Enviar el comprobante por WhatsApp"],
"Bonjour B2A, j'ai payé mon abonnement aux Services B2A Smart Farming.":["Hello B2A, I have paid my B2A Smart Farming Services subscription.","Buongiorno B2A, ho pagato il mio abbonamento ai Servizi B2A Smart Farming.","Hola B2A, he pagado mi suscripción a los Servicios B2A Smart Farming."],
"Votre fiche est publiée après vérification du paiement par B2A, pour la durée payée. Sans renouvellement, elle disparaît à la date de fin.":["Your profile is published once B2A has checked the payment, for the period paid. Without renewal, it disappears on the end date.","La tua scheda è pubblicata dopo la verifica del pagamento da parte di B2A, per la durata pagata. Senza rinnovo, scompare alla data di fine.","Su ficha se publica tras la verificación del pago por B2A, durante el periodo pagado. Sin renovación, desaparece en la fecha de fin."],
"Les informations doivent être exactes. Les vétérinaires et auxiliaires doivent être autorisés à exercer.":["Information must be accurate. Vets and animal health assistants must be authorised to practise.","Le informazioni devono essere esatte. Veterinari e ausiliari devono essere autorizzati a esercitare.","La información debe ser exacta. Los veterinarios y auxiliares deben estar autorizados a ejercer."],
"B2A met en relation : le prix, la qualité et le paiement de vos prestations se règlent directement entre vous et vos clients.":["B2A connects you: the price, quality and payment of your services are settled directly between you and your clients.","B2A vi mette in contatto: prezzo, qualità e pagamento delle prestazioni si regolano direttamente tra te e i tuoi clienti.","B2A le pone en contacto: el precio, la calidad y el pago de sus servicios se acuerdan directamente entre usted y sus clientes."],
"B2A peut suspendre une fiche en cas d'informations fausses ou de plaintes répétées des utilisateurs.":["B2A may suspend a profile in case of false information or repeated complaints from users.","B2A può sospendere una scheda in caso di informazioni false o reclami ripetuti degli utenti.","B2A puede suspender una ficha en caso de información falsa o quejas repetidas de los usuarios."],
"Votre numéro de téléphone est visible par les utilisateurs de l'application quand votre fiche est en ligne.":["Your phone number is visible to app users while your profile is online.","Il tuo numero di telefono è visibile agli utenti dell'app quando la scheda è online.","Su número de teléfono es visible para los usuarios de la app mientras su ficha está en línea."],
"‹ Annuler":["‹ Cancel","‹ Annulla","‹ Cancelar"],"‹ Retour":["‹ Back","‹ Indietro","‹ Volver"],
"Étape 1 sur 2 : votre fiche. Étape 2 : le paiement de l'abonnement.":["Step 1 of 2: your profile. Step 2: paying the subscription.","Passo 1 di 2: la tua scheda. Passo 2: il pagamento dell'abbonamento.","Paso 1 de 2: su ficha. Paso 2: el pago de la suscripción."],
"Nom ou nom de l'entreprise":["Name or business name","Nome o nome dell'azienda","Nombre o nombre de la empresa"],"Métier":["Trade","Mestiere","Oficio"],
"Spécialités (facultatif)":["Specialities (optional)","Specialità (facoltativo)","Especialidades (opcional)"],"Téléphone":["Phone","Telefono","Teléfono"],
"WhatsApp, si autre numéro (facultatif)":["WhatsApp, if a different number (optional)","WhatsApp, se è un altro numero (facoltativo)","WhatsApp, si es otro número (opcional)"],
"Ville":["Town","Città","Ciudad"],"Quartier ou village (facultatif)":["Neighbourhood or village (optional)","Quartiere o villaggio (facoltativo)","Barrio o pueblo (opcional)"],
"Zones desservies (facultatif)":["Areas served (optional)","Zone servite (facoltativo)","Zonas atendidas (opcional)"],"Horaires (facultatif)":["Opening hours (optional)","Orari (facoltativo)","Horario (opcional)"],
"N° d'agrément ou d'inscription à l'Ordre (facultatif)":["Licence or professional order no. (optional)","N. di abilitazione o di iscrizione all'Ordine (facoltativo)","N.º de habilitación o de colegiación (opcional)"],
"Présentation (facultatif)":["Description (optional)","Presentazione (facoltativo)","Presentación (opcional)"],
"ex. volailles, ruminants, vaccination à domicile":["e.g. poultry, ruminants, home vaccination","es. pollame, ruminanti, vaccinazione a domicilio","p. ej. aves, rumiantes, vacunación a domicilio"],
"ex. Ouagadougou et 50 km autour":["e.g. Ouagadougou and 50 km around","es. Ouagadougou e 50 km intorno","p. ej. Uagadugú y 50 km alrededor"],
"ex. Vaccination, déparasitage, soins et suivi des élevages. Intervention rapide.":["e.g. Vaccination, deworming, care and follow-up of farms. Fast response.","es. Vaccinazione, sverminazione, cure e controllo degli allevamenti. Intervento rapido.","p. ej. Vacunación, desparasitación, cuidados y seguimiento de granjas. Intervención rápida."],
"Je me déplace à la ferme":["I visit farms","Mi sposto in fattoria","Me desplazo a la granja"],"Photo ou logo (facultatif)":["Photo or logo (optional)","Foto o logo (facoltativo)","Foto o logo (opcional)"],
"Retirer la photo":["Remove photo","Rimuovi la foto","Quitar la foto"],"Enregistrer ma fiche":["Save my profile","Salva la mia scheda","Guardar mi ficha"],
"Continuer : payer l'abonnement":["Continue: pay the subscription","Continua: paga l'abbonamento","Continuar: pagar la suscripción"],
"Indiquez votre nom.":["Enter your name.","Inserisci il tuo nome.","Indique su nombre."],"Indiquez votre numéro de téléphone.":["Enter your phone number.","Inserisci il tuo numero di telefono.","Indique su número de teléfono."],
"Indiquez votre ville.":["Enter your town.","Inserisci la tua città.","Indique su ciudad."],"Fiche enregistrée.":["Profile saved.","Scheda salvata.","Ficha guardada."],
"Réseau lent : la fiche sera enregistrée dès que la connexion le permet.":["Slow network: the profile will be saved as soon as the connection allows.","Rete lenta: la scheda sarà salvata appena la connessione lo permette.","Red lenta: la ficha se guardará en cuanto la conexión lo permita."],
"Étape 2 sur 2 : l'abonnement":["Step 2 of 2: the subscription","Passo 2 di 2: l'abbonamento","Paso 2 de 2: la suscripción"],
"Choisissez la durée. Votre fiche est visible par tous les utilisateurs de l'application pendant toute cette durée.":["Choose the duration. Your profile is visible to all app users for that whole period.","Scegli la durata. La tua scheda è visibile a tutti gli utenti dell'app per tutto questo periodo.","Elija la duración. Su ficha es visible para todos los usuarios de la app durante todo ese periodo."],
"soit {0} F par mois":["i.e. {0} F per month","cioè {0} F al mese","es decir, {0} F al mes"],"Comment payer":["How to pay","Come pagare","Cómo pagar"],
"Envoyez {0} F par Orange Money ou Moov Money au numéro :":["Send {0} F by Orange Money or Moov Money to:","Invia {0} F con Orange Money o Moov Money al numero:","Envíe {0} F por Orange Money o Moov Money al número:"],
"Gardez le SMS de confirmation : il contient la référence de la transaction.":["Keep the confirmation SMS: it contains the transaction reference.","Conserva l'SMS di conferma: contiene il riferimento della transazione.","Guarde el SMS de confirmación: contiene la referencia de la transacción."],
"B2A vous indique le numéro de paiement par WhatsApp. Le numéro n'est pas encore affiché ici.":["B2A will give you the payment number by WhatsApp. It is not shown here yet.","B2A ti indica il numero di pagamento su WhatsApp. Il numero non è ancora mostrato qui.","B2A le indicará el número de pago por WhatsApp. Aún no se muestra aquí."],
"Numéro qui a payé":["Number that paid","Numero che ha pagato","Número que pagó"],"Référence de la transaction (dans le SMS)":["Transaction reference (in the SMS)","Riferimento della transazione (nell'SMS)","Referencia de la transacción (en el SMS)"],
"Conditions":["Terms","Condizioni","Condiciones"],
"J'accepte les conditions des services B2A et j'atteste que mes informations sont exactes.":["I accept the B2A services terms and confirm that my information is accurate.","Accetto le condizioni dei servizi B2A e dichiaro che le mie informazioni sono esatte.","Acepto las condiciones de los servicios B2A y certifico que mi información es exacta."],
"Envoyer ma demande":["Send my request","Invia la mia richiesta","Enviar mi solicitud"],"Envoi…":["Sending…","Invio…","Enviando…"],
"Indiquez le numéro qui a payé.":["Enter the number that paid.","Inserisci il numero che ha pagato.","Indique el número que pagó."],
"Indiquez la référence de la transaction reçue par SMS.":["Enter the transaction reference received by SMS.","Inserisci il riferimento della transazione ricevuto via SMS.","Indique la referencia de la transacción recibida por SMS."],
"Cochez l'acceptation des conditions.":["Tick the box to accept the terms.","Spunta l'accettazione delle condizioni.","Marque la aceptación de las condiciones."],
"Demande envoyée. B2A vérifie votre paiement, puis met votre fiche en ligne.":["Request sent. B2A checks your payment, then puts your profile online.","Richiesta inviata. B2A verifica il pagamento, poi mette online la tua scheda.","Solicitud enviada. B2A verifica su pago y luego publica su ficha."],
"Réseau lent : la demande part dès que la connexion le permet.":["Slow network: the request will be sent as soon as the connection allows.","Rete lenta: la richiesta parte appena la connessione lo permette.","Red lenta: la solicitud se enviará en cuanto la conexión lo permita."],
"Envoi refusé par le serveur. Fermez et rouvrez l'application, puis réessayez ; si cela continue, contactez B2A.":["Rejected by the server. Close and reopen the app, then try again; if it continues, contact B2A.","Invio rifiutato dal server. Chiudi e riapri l'app, poi riprova; se continua, contatta B2A.","Envío rechazado por el servidor. Cierre y vuelva a abrir la app e inténtelo de nuevo; si continúa, contacte con B2A."],
"L'envoi a échoué. Vérifiez la connexion.":["Sending failed. Check the connection.","Invio non riuscito. Controlla la connessione.","El envío falló. Compruebe la conexión."],
"Les services ont besoin d'internet pour s'ouvrir la première fois. Connectez-vous puis revenez.":["Services need internet the first time. Connect, then come back.","I servizi hanno bisogno di internet la prima volta. Connettiti e torna qui.","Los servicios necesitan internet la primera vez. Conéctese y vuelva."],
"Les services ouvrent très bientôt. Revenez dans quelques instants.":["Services open very soon. Come back in a moment.","I servizi aprono molto presto. Torna tra qualche istante.","Los servicios abren muy pronto. Vuelva en unos instantes."],
"Besoin d'un vétérinaire ?":["Need a vet?","Ti serve un veterinario?","¿Necesita un veterinario?"],
"Vétérinaires, techniciens et prestataires près de chez vous.":["Vets, technicians and service providers near you.","Veterinari, tecnici e fornitori di servizi vicino a te.","Veterinarios, técnicos y proveedores cerca de usted."],
"Trouver un service":["Find a service","Trova un servizio","Buscar un servicio"],"Trouver un vétérinaire près de chez moi":["Find a vet near me","Trova un veterinario vicino a me","Buscar un veterinario cerca de mí"],
"Photo":["Photo","Foto","Foto"],"Vétérinaire":["Vet","Veterinario","Veterinario"],"Infirmier ou auxiliaire d'élevage":["Animal health assistant","Infermiere o ausiliario zootecnico","Enfermero o auxiliar ganadero"],
"Pharmacie vétérinaire":["Veterinary pharmacy","Farmacia veterinaria","Farmacia veterinaria"],"Conseiller agricole ou technicien":["Farm adviser or technician","Consulente agricolo o tecnico","Asesor agrícola o técnico"],
"Fabrication d'aliment (provenderie)":["Feed milling","Produzione di mangimi (mangimificio)","Fabricación de pienso"],"Incubation et éclosion à façon":["Contract hatching","Incubazione e schiusa conto terzi","Incubación y eclosión por encargo"],
"Abattage et plumage":["Slaughter and plucking","Macellazione e spiumatura","Sacrificio y desplume"],"Transport d'animaux et de récoltes":["Transport of animals and crops","Trasporto di animali e raccolti","Transporte de animales y cosechas"],
"Labour et travaux des champs":["Ploughing and field work","Aratura e lavori nei campi","Arado y labores del campo"],"Traitement des cultures (pulvérisation, drone)":["Crop spraying (sprayer, drone)","Trattamento delle colture (irrorazione, drone)","Tratamiento de cultivos (pulverización, dron)"],
"Forage, irrigation et pompes solaires":["Boreholes, irrigation and solar pumps","Pozzi, irrigazione e pompe solari","Pozos, riego y bombas solares"],"Construction de bâtiments d'élevage":["Building livestock housing","Costruzione di edifici per l'allevamento","Construcción de naves ganaderas"],
"Réparation de matériel":["Equipment repair","Riparazione di attrezzature","Reparación de equipos"],"Formation":["Training","Formazione","Formación"],"Autre service":["Other service","Altro servizio","Otro servicio"],
"ex. Dr Ouédraogo Moussa":["e.g. Dr Ouédraogo Moussa","es. Dott. Ouédraogo Moussa","p. ej. Dr. Ouédraogo Moussa"],"ex. 70 12 34 56":["e.g. 70 12 34 56","es. 70 12 34 56","p. ej. 70 12 34 56"],
"ex. Ouagadougou":["e.g. Ouagadougou","es. Ouagadougou","p. ej. Uagadugú"],"ex. Tanghin":["e.g. Tanghin","es. Tanghin","p. ej. Tanghin"],"ex. 123/MRAH":["e.g. 123/MRAH","es. 123/MRAH","p. ej. 123/MRAH"],
"ex. Lundi–samedi, 7 h–18 h":["e.g. Monday–Saturday, 7 h–18 h","es. Lunedì–sabato, ore 7–18","p. ej. Lunes–sábado, 7 h–18 h"],
"ex. CI2410.1530.A1234":["e.g. CI2410.1530.A1234","es. CI2410.1530.A1234","p. ej. CI2410.1530.A1234"],
"Marché B2A":["B2A Market","Mercato B2A","Mercado B2A"]};
/* les clés suivent le découpage de i18n.js : chaque nombre du texte (même le « 2 » de « B2A ») devient {0}, {1}… dans l'ordre */
{const RX=/\{(\d+)(:[^|}]*\|[^}]*)?\}|\d{1,3}(?:[\u202f\u00a0 ]\d{3})+(?:,\d+)?|\d+(?:,\d+)?/g;
 const conv=(k,vals)=>{let n=0;const map={},lits=[];const nk=k.replace(RX,(m,i,pl)=>{if(i!=null){if(!(i in map))map[i]=n++;return "{"+map[i]+(pl||"")+"}"}lits.push(n);return "{"+(n++)+"}"});
   return [nk,vals.map(v=>{let li=0;return v.replace(RX,(m,i,pl)=>{if(i!=null)return "{"+(i in map?map[i]:i)+(pl||"")+"}";const x=lits[li++];return x!=null?"{"+x+"}":m})})]};
 const D=window.B2A_DICT=window.B2A_DICT||{};for(const k0 in TR){const [k,v]=conv(k0,TR[k0]);["en","it","es"].forEach((lg,i)=>{D[lg]=D[lg]||{};if(D[lg][k]==null)D[lg][k]=v[i]})}}
window.B2A_SERVICES={render,listen,open:openServices,home:()=>{view="list"}};
})();
