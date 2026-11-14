/* B2A Smart Farming : gestion de la version Pro par le propriétaire (page utilisateurs.html)
   Tarifs Pro et taux de commission vétérinaire, vérification des paiements Orange Money / Moov Money,
   abonnements Pro actifs, contenus de formation (vidéos et PDF envoyés dans Firebase Storage),
   commissions dues par les vétérinaires sur les validations de vaccins. */
(function(){
if(!window.B2A_FIREBASE||!window.firebase)return;
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const fmt=n=>Number(n||0).toLocaleString("fr-FR",{maximumFractionDigits:0});
const ms=v=>v==null?0:typeof v==="number"?v:v.toMillis?v.toMillis():0;
const dd=t=>t?new Date(t).toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"}):"—";
const tel226=t=>{let p=String(t||"").replace(/\D/g,"");if(p.length===8)p="226"+p;return p};
const FORM={m1:"1 mois",m3:"3 mois",m12:"12 mois",g12:"Groupement 12 mois"};
const DEF={proM1:2500,proM3:6000,proM12:20000,proG12:75000,vetoTaux:10};
const CODE_RE=/^([A-Z0-9]{10}|u_[A-Za-z0-9]{10,40})$/;
const PRODG={"aliment-ponte":"Aliment ponte (sacs de 50 kg)","aliment-chair":"Aliment chair (sacs de 50 kg)","aliment-betail":"Aliment bétail (sacs de 50 kg)","poussins-ponte":"Poussins pondeuses","poussins-chair":"Poussins chair","vaccins":"Vaccins (doses)","autre":"Autre"};
const ESP=[["tous","Toutes les espèces"],["pondeuse","Pondeuses"],["chair","Poulets de chair"],["local","Volaille locale / pintades"],["porc","Porcs"],["poisson","Poissons"],
  ["petitsrum","Moutons et chèvres"],["bovin","Bovins"],["vachelait","Vaches laitières"],["chevrelait","Chèvres laitières"],["culture","Cultures"]];
function finApres(cur,mois){const base=Math.max(Date.now(),cur||0);const d=new Date(base);const j=d.getDate();d.setMonth(d.getMonth()+mois);if(d.getDate()<j)d.setDate(0);d.setHours(23,59,0,0);return d.getTime()}

const host=$("u-main");if(!host)return;
const sec=el("section","card");sec.id="pr-admin";sec.innerHTML=`<h2>Version Pro</h2>
  <p class="note">Les éleveurs paient l'abonnement Pro par Orange Money ou Moov Money au numéro du Marché, puis envoient la référence. Vérifiez la somme reçue avant de valider : la version Pro s'ouvre pour toute la ferme jusqu'à la date de fin.</p>
  <div class="pr-cfg">
    <div class="field"><label for="pr-m1">Pro 1 mois (FCFA)</label><input type="number" id="pr-m1" min="0" step="100"></div>
    <div class="field"><label for="pr-m3">Pro 3 mois (FCFA)</label><input type="number" id="pr-m3" min="0" step="100"></div>
    <div class="field"><label for="pr-m12">Pro 12 mois (FCFA)</label><input type="number" id="pr-m12" min="0" step="100"></div>
    <div class="field"><label for="pr-g12">Groupement 12 mois, jusqu'à 5 fermes (FCFA)</label><input type="number" id="pr-g12" min="0" step="100"></div>
    <div class="field"><label for="pr-vt">Commission vétérinaire (%)</label><input type="number" id="pr-vt" min="0" max="50" step="1"></div>
    <button class="btn small" id="pr-save" type="button">Enregistrer</button><span class="msg" id="pr-msg"></span>
  </div>
  <div class="kpis" id="pr-kpis"></div>
  <h3>Paiements Pro à vérifier</h3><div class="list" id="pr-pay"></div>
  <h3>Abonnements Pro</h3><div class="list" id="pr-subs"></div>
  <h3>Commandes groupées B2A</h3><p class="note">Demandes d'aliment, de poussins et de vaccins des abonnés Pro : regroupez-les par ville, négociez avec le fournisseur, puis appelez chaque éleveur.</p><div class="list" id="pr-cg"></div>
  <h3>Alertes maladie des zones (14 derniers jours)</h3><div class="list" id="pr-zone"></div>
  <h3>Formations (vidéos et PDF)</h3>
  <div class="card pr-fo" id="pr-foform">
    <div class="pr-grid">
      <div class="field full"><label for="fo-titre">Titre</label><input id="fo-titre" maxlength="100" placeholder="ex. Démarrage des poussins : chauffage et densité"></div>
      <div class="field full"><label for="fo-desc">Description (facultatif)</label><input id="fo-desc" maxlength="300"></div>
      <div class="field"><label for="fo-type">Type</label><select id="fo-type"><option value="video">Vidéo</option><option value="pdf">PDF</option></select></div>
      <div class="field"><label for="fo-ordre">Ordre d'affichage</label><input type="number" id="fo-ordre" value="1"></div>
      <div class="field"><label for="fo-de">Semaine de (facultatif)</label><input type="number" id="fo-de" min="0"></div>
      <div class="field"><label for="fo-a">Semaine à (facultatif)</label><input type="number" id="fo-a" min="0"></div>
      <div class="field"><label for="fo-duree">Durée (minutes, vidéo)</label><input type="number" id="fo-duree" min="0"></div>
      <div class="field full"><span class="lbl">Espèces</span><div class="pr-esp" id="fo-esp"></div></div>
      <div class="field full"><label for="fo-file">Fichier (vidéo MP4 ou PDF, 300 Mo maximum)</label><input type="file" id="fo-file" accept="video/mp4,video/*,application/pdf"></div>
      <div class="field full"><label for="fo-url">… ou adresse du fichier déjà en ligne (https://…)</label><input id="fo-url" maxlength="500"></div>
    </div>
    <label class="pr-chk"><input type="checkbox" id="fo-pub" checked> Publier tout de suite</label>
    <progress id="fo-prog" max="100" value="0" hidden></progress>
    <div class="row"><button class="btn" id="fo-add" type="button">Ajouter la formation</button><span class="msg" id="fo-msg"></span></div>
  </div>
  <div class="list" id="pr-fo"></div>
  <h3>Commissions des vétérinaires</h3><div class="list" id="pr-veto"></div>
  <h3>Demandes de devis : armoire B2A</h3><div class="list" id="pr-devis"></div>`;
host.querySelector(".wrap").append(sec);
const css=el("style");css.textContent=`.pr-cfg{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;align-items:end;margin:6px 0 10px}
#pr-admin h3{font:700 16px var(--display);margin:8px 0 0}#pr-admin .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.pr-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.pr-grid .full{grid-column:1/-1}.pr-esp{display:flex;gap:6px 14px;flex-wrap:wrap}
.pr-esp label,.pr-chk{display:flex;gap:6px;align-items:center;font-size:14px;text-transform:none;letter-spacing:0}#pr-admin .lbl{font-size:12px;font-weight:700;color:var(--muted)}
#pr-admin progress{width:100%}#pr-admin .sv-ref{font:600 14px var(--mono);background:var(--soft);padding:2px 8px;border-radius:6px}`;document.head.append(css);
$("fo-esp").innerHTML=ESP.map(([k,n])=>`<label><input type="checkbox" value="${k}"${k==="pondeuse"?" checked":""}> ${n}</label>`).join("");

const db=firebase.firestore();let cfg={},pays=[],subs={},forms=[],vds=[],devis=[],offs=[],cgs=[],zones=[];
const note=(k,d)=>{(window.__adm=window.__adm||{})[k]=d;document.dispatchEvent(new CustomEvent("b2a-admin",{detail:{k,d}}))};
firebase.auth().onAuthStateChanged(u=>{offs.forEach(f=>f());offs=[];if(!u||u.isAnonymous)return;
  const err=()=>{$("pr-msg").textContent="Lecture impossible : publiez les nouvelles règles Firestore (firestore.rules).";$("pr-msg").className="msg err"};
  offs.push(db.doc("marche_config/global").onSnapshot(d=>{cfg=d.exists?d.data():{};["m1","m3","m12","g12"].forEach(k=>$("pr-"+k).value=cfg["pro"+k.toUpperCase()]??DEF["pro"+k.toUpperCase()]);$("pr-vt").value=cfg.vetoTaux??DEF.vetoTaux;render()},err));
  offs.push(db.collection("pro_paiements").onSnapshot(s=>{pays=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>ms(b.creeLe)-ms(a.creeLe));render()},err));
  offs.push(db.collection("pro_fermes").onSnapshot(s=>{subs={};s.docs.forEach(d=>subs[d.id]={id:d.id,...d.data()});render()},err));
  offs.push(db.collection("formations").onSnapshot(s=>{forms=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.ordre||0)-(b.ordre||0));renderFo()},err));
  offs.push(db.collection("commandes_groupees").onSnapshot(s=>{cgs=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>ms(b.creeLe)-ms(a.creeLe));renderCg()},()=>{}));
  {const lim=new Date(Date.now()-14*864e5).toISOString().slice(0,10);offs.push(db.collection("alertes_zone").where("date",">=",lim).onSnapshot(s=>{zones=s.docs.map(d=>d.data());renderZone()},()=>{}))}
  offs.push(db.collection("veto_demandes").where("statut","==","validee").onSnapshot(s=>{vds=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>ms(b.valideLe)-ms(a.valideLe));renderVeto()},err));
  offs.push(db.collection("devis_b2a").onSnapshot(s=>{devis=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>ms(b.creeLe)-ms(a.creeLe));renderDevis()},err))});
$("pr-save").onclick=async()=>{const m=$("pr-msg");const v={};for(const k of ["m1","m3","m12","g12"]){const n=Number($("pr-"+k).value);if(!(n>0)){m.textContent="Tarif invalide.";m.className="msg err";return}v["pro"+k.toUpperCase()]=n}
  const t=Number($("pr-vt").value);if(!(t>=0&&t<=50)){m.textContent="Commission invalide (0 à 50 %).";m.className="msg err";return}v.vetoTaux=Math.round(t);
  try{await db.doc("marche_config/global").set(v,{merge:true});m.textContent="Enregistré. Les tarifs s'affichent tout de suite dans l'application.";m.className="msg"}catch(e){m.textContent="Échec de l'enregistrement.";m.className="msg err"}};
function kpi(l,v,s,c){const k=el("div","kpi"+(c?" "+c:""));k.append(el("span",null,l),el("b",null,v));if(s)k.append(el("small",null,s));return k}
function wa(t,txt){const a=el("a","btn small ghost","WhatsApp");a.href="https://wa.me/"+tel226(t)+"?text="+encodeURIComponent(txt);a.target="_blank";a.rel="noopener";return a}

function render(){const now=Date.now(),mois=new Date().toISOString().slice(0,7);const att=pays.filter(p=>p.statut==="attente"),val=pays.filter(p=>p.statut==="valide");
  const act=Object.values(subs).filter(s=>ms(s.finLe)>now);
  const K=$("pr-kpis");K.innerHTML="";K.append(kpi("Fermes Pro actives",fmt(act.length),null,"ok"),kpi("Paiements à vérifier",fmt(att.length),null,att.length?"warn":null),
    kpi("Encaissé ce mois",fmt(val.filter(x=>new Date(ms(x.valideLe)||ms(x.creeLe)).toISOString().slice(0,7)===mois).reduce((s,x)=>s+(Number(x.montant)||0),0))+" F"),
    kpi("Encaissé au total",fmt(val.reduce((s,x)=>s+(Number(x.montant)||0),0))+" F"));
  note("pro",{att:att.length,actives:act.length});
  const L=$("pr-pay");L.innerHTML="";if(!att.length)L.append(el("p","note","Aucun paiement à vérifier."));
  att.forEach(p=>{const c=el("div","card");const r1=el("div","row");r1.append(el("b",null,(p.nom||"Éleveur")+" · "+FORM[p.formule]+" · "+fmt(p.montant)+" F"));c.append(r1);
    const ref=el("span","sv-ref",p.ref||"");c.append(el("small",null,"Référence : "),ref,el("small",null," · payé depuis "+(p.telPayeur||"—")+" · ferme "+p.cle+" · "+dd(ms(p.creeLe))));
    const cur=subs[p.cle];if(cur&&ms(cur.finLe)>now)c.append(el("small",null,"Déjà Pro jusqu'au "+dd(ms(cur.finLe))+" : les mois s'ajoutent."));
    const grp=String(p.groupe||"").split(/[\s,;]+/).map(x=>x.trim()).filter(x=>CODE_RE.test(x)&&x!==p.cle).slice(0,4);
    if(p.formule==="g12")c.append(el("small",null,"Groupement : "+(grp.length?grp.join(", "):"aucun autre code valable")+" (activés en même temps)."));
    if(p.parrain)c.append(el("small",null,"Code parrain : "+p.parrain+" (offrez-lui 1 mois après validation)."));
    const r=el("div","row");const m=el("span","msg");const ok=el("button","btn small ok","Paiement reçu : activer");ok.type="button";
    ok.onclick=async()=>{ok.disabled=true;try{const fin=finApres(cur?ms(cur.finLe):0,p.mois||1);const b=db.batch();
        b.set(db.doc("pro_fermes/"+p.cle),{finLe:firebase.firestore.Timestamp.fromMillis(fin),formule:p.formule,majLe:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
        if(p.formule==="g12")grp.forEach(k=>{const f2=finApres(subs[k]?ms(subs[k].finLe):0,12);b.set(db.doc("pro_fermes/"+k),{finLe:firebase.firestore.Timestamp.fromMillis(f2),formule:"g12",majLe:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})});
        b.update(db.doc("pro_paiements/"+p.id),{statut:"valide",valideLe:firebase.firestore.FieldValue.serverTimestamp(),finApres:fin});await b.commit()}catch(e){ok.disabled=false;m.textContent="Échec.";m.className="msg err"}};
    const mo=el("input");mo.placeholder="Motif du refus";mo.maxLength=120;mo.style.maxWidth="240px";const no=el("button","btn small bad","Refuser");no.type="button";
    no.onclick=async()=>{if(!mo.value.trim()){mo.focus();return}no.disabled=true;try{await db.doc("pro_paiements/"+p.id).update({statut:"refuse",motif:mo.value.trim()})}catch(e){no.disabled=false}};
    r.append(ok,mo,no,wa(p.telPayeur,"Bonjour, B2A Smart Farming : "),m);c.append(r);L.append(c)});
  /* parrainage : un mois offert au parrain d'un paiement validé */
  val.filter(p=>p.parrain&&CODE_RE.test(p.parrain)&&!p.parrainOffert).forEach(p=>{const c=el("div","card");c.append(el("b",null,"Parrainage : "+(p.nom||"Éleveur")+" s'est abonné avec le code "+p.parrain));
    const b=el("button","btn small ok","Offrir 1 mois au parrain");b.type="button";const m=el("span","msg");
    b.onclick=async()=>{b.disabled=true;try{const cur=subs[p.parrain];const fin=finApres(cur?ms(cur.finLe):0,1);const bt=db.batch();
      bt.set(db.doc("pro_fermes/"+p.parrain),{finLe:firebase.firestore.Timestamp.fromMillis(fin),formule:(cur&&cur.formule)||"m1",majLe:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
      bt.update(db.doc("pro_paiements/"+p.id),{parrainOffert:true});await bt.commit()}catch(e){b.disabled=false;m.textContent="Échec.";m.className="msg err"}};
    const r=el("div","row");r.append(b,m);c.append(r);L.append(c)});
  const S2=$("pr-subs");S2.innerHTML="";const all=Object.values(subs).sort((a,b)=>ms(b.finLe)-ms(a.finLe));if(!all.length)S2.append(el("p","note","Aucun abonnement Pro pour le moment."));
  all.forEach(s=>{const c=el("div","card");const on=ms(s.finLe)>now;const last=pays.find(p=>p.cle===s.id&&p.statut==="valide");
    c.append(el("b",null,(last&&last.nom?last.nom+" · ":"")+"ferme "+s.id),el("small",null,(on?"Pro jusqu'au ":"Terminé le ")+dd(ms(s.finLe))));
    const r=el("div","row");const g=el("button","btn small ghost","+1 mois offert");g.type="button";
    g.onclick=async()=>{if(g.dataset.c!=="1"){g.dataset.c="1";g.textContent="Confirmer : +1 mois";return}g.disabled=true;try{await db.doc("pro_fermes/"+s.id).set({finLe:firebase.firestore.Timestamp.fromMillis(finApres(ms(s.finLe),1)),majLe:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}catch(e){g.disabled=false}};
    const x=el("button","btn small bad","Arrêter");x.type="button";x.onclick=async()=>{if(x.dataset.c!=="1"){x.dataset.c="1";x.textContent="Confirmer l'arrêt";return}x.disabled=true;try{await db.doc("pro_fermes/"+s.id).set({finLe:firebase.firestore.Timestamp.fromMillis(Date.now()-1000)},{merge:true})}catch(e){x.disabled=false}};
    r.append(g);if(on)r.append(x);if(last)r.append(wa(last.telPayeur,on&&ms(s.finLe)-now<7*864e5?`Bonjour, votre version Pro de B2A Smart Farming se termine le ${dd(ms(s.finLe))}. Renouvelez dans l'application (un lot > Formation > Renouveler).`:"Bonjour, B2A Smart Farming : "));c.append(r);S2.append(c)})}

/* ---------- formations ---------- */
let storage=null;try{storage=firebase.storage?firebase.storage():null}catch(e){storage=null}
$("fo-add").onclick=async()=>{const m=$("fo-msg"),b=$("fo-add"),pr=$("fo-prog");const titre=$("fo-titre").value.trim();
  const esp=[...document.querySelectorAll("#fo-esp input:checked")].map(i=>i.value);const file=$("fo-file").files[0];const url0=$("fo-url").value.trim();
  if(!titre){m.textContent="Indiquez le titre.";m.className="msg err";return}if(!esp.length){m.textContent="Choisissez au moins une espèce.";m.className="msg err";return}
  if(!file&&!/^https:\/\//.test(url0)){m.textContent="Choisissez un fichier ou collez une adresse https://.";m.className="msg err";return}
  const num=id=>{const v=$(id).value;return v===""?null:Number(v)};const type=$("fo-type").value;
  b.disabled=true;m.textContent="";const id=db.collection("formations").doc().id;let url=url0,chemin="",taille=null;
  try{if(file){if(!storage)throw new Error("storage");if(file.size>300*1048576){throw new Error("taille")}
      chemin="formations/"+id+"-"+file.name.normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^A-Za-z0-9.]+/g,"-").slice(-60);
      const task=storage.ref(chemin).put(file,{contentType:file.type||(type==="pdf"?"application/pdf":"video/mp4")});pr.hidden=false;pr.value=0;
      await new Promise((res,rej)=>task.on("state_changed",s=>{pr.value=Math.round(s.bytesTransferred/s.totalBytes*100);m.textContent="Envoi : "+pr.value+" %";m.className="msg"},rej,res));
      url=await task.snapshot.ref.getDownloadURL();taille=file.size}
    await db.doc("formations/"+id).set({titre,desc:$("fo-desc").value.trim(),type,especes:esp,semDe:num("fo-de"),semA:num("fo-a"),duree:num("fo-duree"),ordre:num("fo-ordre")||0,
      url,chemin,taille,publie:$("fo-pub").checked,creeLe:firebase.firestore.FieldValue.serverTimestamp()});
    m.textContent="Formation ajoutée.";m.className="msg";["fo-titre","fo-desc","fo-url","fo-de","fo-a","fo-duree"].forEach(k=>$(k).value="");$("fo-file").value=""}
  catch(e){console.warn(e);m.textContent=e.message==="storage"?"Firebase Storage n'est pas activé : activez-le dans la console Firebase (Build > Storage) ou collez une adresse https://.":e.message==="taille"?"Fichier trop lourd (300 Mo maximum).":"Échec de l'envoi : vérifiez la connexion et les règles Storage (storage.rules).";m.className="msg err"}
  finally{b.disabled=false;pr.hidden=true}};
function renderFo(){const L=$("pr-fo");L.innerHTML="";if(!forms.length){L.append(el("p","note","Aucune formation. Ajoutez la première vidéo ou fiche PDF ci-dessus."));return}
  forms.forEach(f=>{const c=el("div","card");c.append(el("b",null,(f.type==="pdf"?"📄 ":"▶ ")+f.titre+(f.publie?"":" (non publiée)")),
    el("small",null,[(f.especes||[]).map(k=>(ESP.find(x=>x[0]===k)||[k,k])[1]).join(", "),f.semDe!=null||f.semA!=null?"semaine "+(f.semDe??0)+" à "+(f.semA??"…"):null,f.duree?f.duree+" min":null,f.taille?(f.taille/1048576).toFixed(1)+" Mo":null].filter(Boolean).join(" · ")));
    const r=el("div","row");const a=el("a","btn small ghost","Ouvrir");a.href=f.url;a.target="_blank";a.rel="noopener";
    const p=el("button","btn small "+(f.publie?"ghost":"ok"),f.publie?"Retirer de l'application":"Publier");p.type="button";p.onclick=async()=>{p.disabled=true;try{await db.doc("formations/"+f.id).update({publie:!f.publie})}catch(e){p.disabled=false}};
    const x=el("button","btn small bad","Supprimer");x.type="button";x.onclick=async()=>{if(x.dataset.c!=="1"){x.dataset.c="1";x.textContent="Confirmer la suppression";return}x.disabled=true;
      try{if(f.chemin&&storage)await storage.ref(f.chemin).delete().catch(()=>{});await db.doc("formations/"+f.id).delete()}catch(e){x.disabled=false}};
    r.append(a,p,x);c.append(r);L.append(c)})}

/* ---------- commissions des vétérinaires ---------- */
function renderVeto(){const L=$("pr-veto");L.innerHTML="";const due=vds.filter(d=>d.comStatut==="due"),tot=due.reduce((s,d)=>s+(Number(d.commission)||0),0);
  note("veto",{due:due.length,tot});
  L.append(el("p","note",due.length?`${due.length} validation(s) avec commission à encaisser : ${fmt(tot)} F au total.`:"Aucune commission à encaisser."));
  const par={};due.forEach(d=>{(par[d.veto]=par[d.veto]||[]).push(d)});
  Object.values(par).forEach(list=>{const c=el("div","card");const s=list.reduce((a,d)=>a+(Number(d.commission)||0),0);c.append(el("b",null,(list[0].vetoNom||"Vétérinaire")+" · "+fmt(s)+" F dus"));
    list.forEach(d=>c.append(el("small",null,dd(ms(d.valideLe))+" · "+(d.lot&&d.lot.nom||"lot")+" · tarif "+fmt(d.tarif)+" F · commission "+fmt(d.commission)+" F ("+d.taux+" %)")));
    const r=el("div","row");const b=el("button","btn small ok","Commission reçue");b.type="button";b.onclick=async()=>{b.disabled=true;try{const bt=db.batch();list.forEach(d=>bt.update(db.doc("veto_demandes/"+d.id),{comStatut:"reglee",regleeLe:firebase.firestore.FieldValue.serverTimestamp()}));await bt.commit()}catch(e){b.disabled=false}};
    r.append(b);c.append(r);L.append(c)});
  const ok=vds.filter(d=>d.comStatut==="reglee").length;if(ok)L.append(el("small",null,ok+" commission(s) déjà réglée(s)."))}
function renderCg(){const L=$("pr-cg");if(!L)return;L.innerHTML="";const att=cgs.filter(c=>c.statut==="attente");
  if(!att.length){L.append(el("p","note","Aucune commande groupée en attente."));return}
  const tot={};att.forEach(c=>{const k=(c.ville||"—")+" · "+(PRODG[c.produit]||c.produit);tot[k]=(tot[k]||0)+(Number(c.qte)||0)});
  const t=el("div","card");t.append(el("b",null,"Total par ville et par produit"));Object.entries(tot).forEach(([k,v])=>t.append(el("div",null,k+" : "+fmt(v))));L.append(t);
  att.forEach(c=>{const d=el("div","card");d.append(el("b",null,(c.nom||"Éleveur")+" · "+(PRODG[c.produit]||c.produit)+" · "+fmt(c.qte)),el("small",null,(c.ville||"")+" · "+(c.tel||"")+" · "+dd(ms(c.creeLe))+(c.note?" · "+c.note:"")));
    const r=el("div","row");const ok=el("button","btn small ok","Traitée");ok.type="button";ok.onclick=async()=>{ok.disabled=true;try{await db.doc("commandes_groupees/"+c.id).update({statut:"traitee"})}catch(e){ok.disabled=false}};
    r.append(ok,wa(c.tel,"Bonjour, B2A Smart Farming : votre commande groupée ("+(PRODG[c.produit]||c.produit)+", "+fmt(c.qte)+") : "));d.append(r);L.append(d)})}
function renderZone(){const L=$("pr-zone");if(!L)return;L.innerHTML="";const by={};zones.forEach(z=>{const k=(z.ville||"").trim().toLowerCase()+"|"+z.grp+"|"+z.signe;(by[k]=by[k]||{v:z.ville,g:z.grp,s:z.signe,a:new Set(),last:""}).a.add(z.auteur);if(z.date>by[k].last)by[k].last=z.date});
  const G={volaille:"volailles",porc:"porcs",rum:"ruminants",poisson:"poissons"},SG={mortalite:"mortalité brutale",ponte:"chute de ponte"};
  const rows=Object.values(by).sort((a,b)=>b.a.size-a.a.size);if(!rows.length){L.append(el("p","note","Aucune alerte signalée."));return}
  rows.forEach(r=>{const d=el("div","card");d.append(el("b",null,r.v+" · "+G[r.g]+" · "+SG[r.s]),el("small",null," "+r.a.size+" ferme(s), dernière le "+r.last+(r.a.size>=3?" : alerte affichée aux abonnés de la ville":"")));L.append(d)})}

/* ---------- demandes de devis (vitrine « Solutions B2A Smart Building ») ---------- */
const NIV={essentiel:"B2A Essentiel",confort:"B2A Confort",pro:"B2A Pro",inconnu:"Niveau à conseiller"};
function renderDevis(){const L=$("pr-devis");L.innerHTML="";const nv=devis.filter(d=>d.statut!=="traite");note("devis",{nouveaux:nv.length});
  L.append(el("p","note",nv.length?`${nv.length} demande(s) à rappeler.`:"Aucune nouvelle demande de devis."));
  devis.forEach(d=>{const c=el("div","card");c.append(el("b",null,(d.nom||"Client")+" · "+(d.ville||"")+(d.pays?", "+d.pays:"")+(d.statut==="traite"?" (traitée)":"")),
    el("small",null,[NIV[d.niveau]||d.niveau,d.elevage,d.animaux?fmt(d.animaux)+" animaux":null,d.surface?fmt(d.surface)+" m²":null,d.install?"installation par B2A":"sans installation",dd(ms(d.creeLe))].filter(Boolean).join(" · ")));
    if(d.message)c.append(el("small",null,"« "+d.message+" »"));
    const r=el("div","row");const t=el("a","btn small ghost","Appeler "+(d.tel||""));t.href="tel:"+String(d.tel||"").replace(/[^\d+]/g,"");
    r.append(t,wa(d.tel,`Bonjour ${d.nom||""}, B2A-HIGH-TECHNOLOGY-AUTOMATION suite à votre demande de devis pour l'armoire électrique B2A (${NIV[d.niveau]||""}) : `));
    const x=el("button","btn small "+(d.statut==="traite"?"ghost":"ok"),d.statut==="traite"?"Remettre à rappeler":"Marquer traitée");x.type="button";
    x.onclick=async()=>{x.disabled=true;try{await db.doc("devis_b2a/"+d.id).update({statut:d.statut==="traite"?"nouveau":"traite"})}catch(e){x.disabled=false}};r.append(x);c.append(r);L.append(c)})}
})();

