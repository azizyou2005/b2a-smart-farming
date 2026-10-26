/* B2A Smart Farming : gestion des Services (vétérinaires et prestataires) par le propriétaire
   Tarifs des abonnements, vérification des paiements Orange Money / Moov Money, mise en ligne, suspension.
   Page utilisateurs.html, après connexion avec le compte B2A. */
(function(){
if(!window.B2A_FIREBASE||!window.firebase)return;
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const fmt=n=>Number(n||0).toLocaleString("fr-FR",{maximumFractionDigits:0});
const ms=v=>v==null?0:typeof v==="number"?v:v.toMillis?v.toMillis():0;
const dd=t=>t?new Date(t).toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"}):"—";
const tel226=t=>{let p=String(t||"").replace(/\D/g,"");if(p.length===8)p="226"+p;return p};
const METIERS={veto:"Vétérinaire",auxiliaire:"Infirmier ou auxiliaire d'élevage",pharma:"Pharmacie vétérinaire",conseil:"Conseiller agricole ou technicien",aliment:"Fabrication d'aliment",
  incubation:"Incubation à façon",abattage:"Abattage et plumage",transport:"Transport",labour:"Labour et travaux des champs",phyto:"Traitement des cultures",irrigation:"Forage et irrigation",
  construction:"Construction de bâtiments",reparation:"Réparation de matériel",formation:"Formation",autre:"Autre service"};
const FORM={m1:"1 mois",m3:"3 mois",m12:"12 mois"};
const DEF={svcM1:2500,svcM3:6000,svcM12:20000};
/* date de fin : on ajoute les mois à partir de la fin actuelle si la fiche est encore en ligne, sinon à partir d'aujourd'hui */
function finApres(pro,mois){const base=Math.max(Date.now(),pro&&pro.statut==="actif"?ms(pro.finLe):0);const d=new Date(base);const j=d.getDate();d.setMonth(d.getMonth()+mois);if(d.getDate()<j)d.setDate(0);d.setHours(23,59,0,0);return d.getTime()}

const host=$("u-main");if(!host)return;
const sec=el("section","card");sec.id="sv-admin";sec.innerHTML=`<h2>Services : vétérinaires et prestataires</h2>
  <p class="note">Les prestataires paient l'abonnement par Orange Money ou Moov Money au numéro du Marché (réglé plus haut), puis envoient la référence. Vérifiez la somme reçue avant de valider : la fiche passe en ligne jusqu'à la date de fin.</p>
  <div class="sv-cfg">
    <div class="field"><label for="sv-m1">1 mois (FCFA)</label><input type="number" id="sv-m1" min="0" step="100"></div>
    <div class="field"><label for="sv-m3">3 mois (FCFA)</label><input type="number" id="sv-m3" min="0" step="100"></div>
    <div class="field"><label for="sv-m12">12 mois (FCFA)</label><input type="number" id="sv-m12" min="0" step="100"></div>
    <button class="btn small" id="sv-save" type="button">Enregistrer les tarifs</button><span class="msg" id="sv-msg"></span>
  </div>
  <div class="kpis" id="sv-kpis"></div>
  <h3>Paiements à vérifier</h3><div class="list" id="sv-pay"></div>
  <h3>Prestataires</h3><div class="list" id="sv-list"></div>`;
host.querySelector(".wrap").append(sec);
const css=el("style");css.textContent=`.sv-cfg{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;align-items:end;margin:6px 0 10px}
#sv-admin h3{font:700 16px var(--display);margin:8px 0 0}#sv-admin .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
#sv-admin .sv-ph{width:56px;height:56px;border-radius:12px;object-fit:cover;flex:none}#sv-admin .sv-h{display:flex;gap:12px;align-items:center}
#sv-admin input.sv-motif{max-width:260px}#sv-admin .sv-ref{font:600 14px var(--mono);background:var(--soft);padding:2px 8px;border-radius:6px}`;document.head.append(css);

const db=firebase.firestore();let cfg={},pros={},pays=[],offs=[];
firebase.auth().onAuthStateChanged(u=>{offs.forEach(f=>f());offs=[];if(!u||u.isAnonymous)return;
  const err=()=>{$("sv-msg").textContent="Lecture impossible : publiez les nouvelles règles Firestore (firestore.rules).";$("sv-msg").className="msg err"};
  offs.push(db.doc("marche_config/global").onSnapshot(d=>{cfg=d.exists?d.data():{};["m1","m3","m12"].forEach(k=>$("sv-"+k).value=cfg["svc"+k.toUpperCase()]??DEF["svc"+k.toUpperCase()]);render()},err));
  offs.push(db.collection("services_pros").onSnapshot(s=>{pros={};s.docs.forEach(d=>pros[d.id]={id:d.id,...d.data()});render()},err));
  offs.push(db.collection("services_paiements").onSnapshot(s=>{pays=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>ms(b.creeLe)-ms(a.creeLe));render()},err))});
$("sv-save").onclick=async()=>{const m=$("sv-msg");const v={};for(const k of ["m1","m3","m12"]){const n=Number($("sv-"+k).value);if(!(n>0)){m.textContent="Tarif invalide.";m.className="msg err";return}v["svc"+k.toUpperCase()]=n}
  try{await db.doc("marche_config/global").set(v,{merge:true});m.textContent="Tarifs enregistrés. Ils s'affichent tout de suite dans l'application.";m.className="msg"}catch(e){m.textContent="Échec de l'enregistrement.";m.className="msg err"}};
function kpi(l,v,s,c){const k=el("div","kpi"+(c?" "+c:""));k.append(el("span",null,l),el("b",null,v));if(s)k.append(el("small",null,s));return k}
const enLigne=p=>p.statut==="actif"&&ms(p.finLe)>Date.now();

function render(){const now=Date.now(),mois=new Date().toISOString().slice(0,7);const P=Object.values(pros);const val=pays.filter(x=>x.statut==="valide");
  const att=pays.filter(x=>x.statut==="attente");const soon=P.filter(p=>enLigne(p)&&ms(p.finLe)-now<7*864e5);
  const K=$("sv-kpis");K.innerHTML="";K.append(kpi("Fiches en ligne",fmt(P.filter(enLigne).length),fmt(P.length)+" prestataire(s) au total","ok"),
    kpi("Paiements à vérifier",fmt(att.length),att.length?fmt(att.reduce((s,x)=>s+(Number(x.montant)||0),0))+" F annoncés":"aucun",att.length?"warn":null),
    kpi("Encaissé ce mois",fmt(val.filter(x=>new Date(ms(x.valideLe)||ms(x.creeLe)).toISOString().slice(0,7)===mois).reduce((s,x)=>s+(Number(x.montant)||0),0))+" F"),
    kpi("Encaissé au total",fmt(val.reduce((s,x)=>s+(Number(x.montant)||0),0))+" F",fmt(val.length)+" abonnement(s)"),
    kpi("Finissent sous 7 jours",fmt(soon.length),"à relancer",soon.length?"warn":null));
  /* paiements en attente */
  const L1=$("sv-pay");L1.innerHTML="";if(!att.length)L1.append(el("p","note","Aucun paiement à vérifier."));
  att.forEach(x=>{const p=pros[x.pro]||{};const c=el("article","u");const top=el("div","u-top");top.append(el("b",null,(p.nom||x.nom||"Prestataire")+" · "+(METIERS[p.metier]||"")),el("span","pill p-attente","À vérifier"));c.append(top);
    const r0=el("div","row");r0.append(el("span",null,`${fmt(x.montant)} F · ${FORM[x.formule]||x.formule} · payé depuis ${x.telPayeur||"—"} · le ${dd(ms(x.creeLe))}`),el("span","sv-ref",x.ref||"sans référence"));c.append(r0);
    c.append(el("small",null,[p.tel?"Tél. "+p.tel:null,[p.quartier,p.ville].filter(Boolean).join(", "),p.agrement?"Agrément "+p.agrement:null].filter(Boolean).join(" · ")));
    const fin=finApres(p,Number(x.mois)||1);const r=el("div","row");const m=el("span","msg");
    const ok=el("button","btn small ok",`Valider : en ligne jusqu'au ${dd(fin)}`);ok.type="button";
    ok.onclick=async()=>{ok.disabled=true;try{const f=firebase.firestore.Timestamp.fromMillis(finApres(pros[x.pro]||{},Number(x.mois)||1));const b=db.batch();
        b.set(db.doc("services_pros/"+x.pro),{statut:"actif",finLe:f,majLe:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
        b.update(db.doc("services_paiements/"+x.id),{statut:"valide",motif:"",valideLe:firebase.firestore.FieldValue.serverTimestamp(),finApres:f});await b.commit()}
      catch(e){console.warn(e);ok.disabled=false;m.textContent="Échec.";m.className="msg err"}};
    const mo=el("input","sv-motif");mo.type="text";mo.placeholder="Motif du refus (ex. paiement non reçu)";mo.maxLength=120;
    const no=el("button","btn small bad","Refuser");no.type="button";
    no.onclick=async()=>{if(!mo.value.trim()){mo.focus();return}no.disabled=true;try{await db.doc("services_paiements/"+x.id).update({statut:"refuse",motif:mo.value.trim()});
        if(pros[x.pro]&&pros[x.pro].statut==="attente"&&!pays.some(y=>y.pro===x.pro&&y.statut==="valide"))await db.doc("services_pros/"+x.pro).update({statut:"refuse"})}
      catch(e){no.disabled=false;m.textContent="Échec.";m.className="msg err"}};
    r.append(ok,mo,no,wa(p.tel||x.telPayeur,`Bonjour ${p.nom||""}, B2A Smart Farming : nous vérifions votre paiement de ${fmt(x.montant)} F (référence ${x.ref||"—"}).`),m);c.append(r);L1.append(c)});
  /* prestataires */
  const L2=$("sv-list");L2.innerHTML="";if(!P.length){L2.append(el("p","note","Aucun prestataire inscrit pour l'instant."));return}
  P.sort((a,b)=>(enLigne(b)?1:0)-(enLigne(a)?1:0)||ms(a.finLe)-ms(b.finLe)).forEach(p=>{const c=el("article","u");const h=el("div","sv-h");
    if(p.photo){const im=el("img","sv-ph");im.src=p.photo;im.alt="";h.append(im)}
    const st=enLigne(p)?["En ligne","p-approuve"]:p.statut==="suspendu"?["Suspendue","p-bloque"]:p.statut==="refuse"?["Refusée","p-refuse"]:p.statut==="actif"?["Expirée","p-bloque"]:["En attente","p-attente"];
    const top=el("div","u-top");top.style.flex="1";top.append(el("b",null,(p.nom||"Prestataire")+(p.verifie?" ✓":"")),el("span","pill "+st[1],st[0]));h.append(top);c.append(h);
    c.append(el("small",null,[METIERS[p.metier]||p.metier,p.specialites,[p.quartier,p.ville].filter(Boolean).join(", "),p.tel,p.agrement?"Agrément "+p.agrement:null].filter(Boolean).join(" · ")));
    c.append(el("small",null,(ms(p.finLe)?(enLigne(p)?"En ligne jusqu'au ":"Fin le ")+dd(ms(p.finLe)):"Jamais en ligne")+" · inscrit le "+dd(ms(p.creeLe))+" · "+pays.filter(y=>y.pro===p.id&&y.statut==="valide").length+" paiement(s) validé(s)"));
    if(p.desc)c.append(el("small",null,p.desc));
    const r=el("div","row");const m=el("span","msg");
    const vb=el("button","btn small "+(p.verifie?"ghost":"ok"),p.verifie?"Retirer « Vérifié »":"Marquer « Vérifié »");vb.type="button";
    vb.onclick=async()=>{vb.disabled=true;try{await db.doc("services_pros/"+p.id).update({verifie:!p.verifie})}catch(e){vb.disabled=false}};
    const gift=el("button","btn small ghost","+1 mois offert");gift.type="button";
    gift.onclick=async()=>{if(gift.dataset.c!=="1"){gift.dataset.c="1";gift.textContent="Confirmer : +1 mois";return}gift.disabled=true;
      try{await db.doc("services_pros/"+p.id).update({statut:"actif",finLe:firebase.firestore.Timestamp.fromMillis(finApres(p,1))})}catch(e){gift.disabled=false}};
    const sb=el("button","btn small "+(p.statut==="suspendu"?"ok":"bad"),p.statut==="suspendu"?"Réactiver":"Suspendre");sb.type="button";
    sb.onclick=async()=>{if(p.statut!=="suspendu"&&sb.dataset.c!=="1"){sb.dataset.c="1";sb.textContent="Confirmer : suspendre";return}sb.disabled=true;
      try{await db.doc("services_pros/"+p.id).update({statut:p.statut==="suspendu"?(ms(p.finLe)?"actif":"attente"):"suspendu"})}catch(e){sb.disabled=false;m.textContent="Échec.";m.className="msg err"}};
    const left=Math.ceil((ms(p.finLe)-Date.now())/864e5);
    r.append(vb,gift,sb,wa(p.wa||p.tel,enLigne(p)&&left<=7?`Bonjour ${p.nom||""}, votre fiche sur B2A Smart Farming se termine le ${dd(ms(p.finLe))}. Renouvelez dans l'application (Marché > Services > Mon espace prestataire) pour rester visible.`:`Bonjour ${p.nom||""}, B2A Smart Farming : `),m);
    c.append(r);L2.append(c)})}
function wa(t,txt){const a=el("a","btn small ghost","WhatsApp");a.href="https://wa.me/"+tel226(t)+"?text="+encodeURIComponent(txt);a.target="_blank";a.rel="noopener";return a}
})();
