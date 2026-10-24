/* B2A Smart Farming : réglages, code d'accès IA et guide santé hors ligne */
(function(){
const B=window.B2A;const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
let db=null,lots=[];
B.getDb().then(d=>{db=d;db.collection("lots").onSnapshot(s=>{lots=s.docs.map(x=>({id:x.id,...x.data()})).filter(l=>l.actif!==false);fillLots()},()=>{});
  if(B.cloudFail)msg("La ferme partagée n'a pas pu se connecter (première ouverture sans internet ?). Les saisies restent sur ce téléphone en attendant.");
  if(B.team.statut==="attente")msg("Votre demande est en attente : le propriétaire de la ferme doit vous accepter. L'application s'ouvrira dès qu'il aura accepté.");
  if(B.team.statut==="retire")msg("Le propriétaire vous a retiré de cette ferme. Vous pouvez quitter la ferme dans Réglages.")});
addEventListener("b2a-full",()=>msg("La mémoire du téléphone est pleine : téléchargez une sauvegarde dans Réglages."));
function msg(t){const m=$("dbmsg");if(!m)return;m.textContent=t;m.className="msg err";m.hidden=false}

/* ================= Réglages ================= */
const band=document.querySelector(".band-in");
const gear=el("button","gearbtn");gear.type="button";gear.setAttribute("aria-label","Réglages");
gear.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
if(band)band.append(gear);
const sheet=el("div","sheet");sheet.id="x-set";sheet.hidden=true;sheet.setAttribute("role","dialog");sheet.setAttribute("aria-modal","true");sheet.setAttribute("aria-labelledby","x-set-t");
sheet.innerHTML=`<div class="sheet-in">
  <div class="row between"><h2 class="sec" id="x-set-t">Réglages</h2><button class="btn small ghost" type="button" id="x-close">Fermer</button></div>
  <section class="card">
    <h3 class="sec">Votre nom</h3>
    <p class="note">Il s'affiche à côté de vos saisies pour que l'équipe sache qui a fait quoi.</p>
    <div class="row"><input type="text" id="x-nom" placeholder="ex. Moussa" style="max-width:240px"><button class="btn small" id="x-nsave" type="button">Enregistrer</button><span class="msg" id="x-nmsg"></span></div>
  </section>
  <section class="card"><h3 class="sec">Partager avec l'équipe</h3><p class="note" id="x-sst"></p><div id="x-sync" style="display:grid;gap:10px"></div></section>
  <section class="card">
    <h3 class="sec">Sauvegarde</h3>
    <p class="note">Téléchargez une copie de toutes vos données (lots, saisies, soins, formules, factures). Pour changer de téléphone, importez-la sur le nouveau.</p>
    <div class="row"><button class="btn small" id="x-export" type="button">Télécharger une sauvegarde</button>
      <label class="btn small ghost" for="x-import">Importer une sauvegarde</label><input type="file" id="x-import" accept="application/json,.json" hidden></div>
    <span class="msg" id="x-bmsg"></span>
  </section>
  <section class="card" id="x-inst">
    <h3 class="sec">Installer l'application</h3>
    <p class="note">Android (Chrome) : menu ⋮ puis “Ajouter à l'écran d'accueil”. iPhone (Safari) : bouton Partager puis “Sur l'écran d'accueil”. Après la première ouverture, l'application marche sans internet.</p>
    <div class="row"><button class="btn small" id="x-install" type="button" hidden>Installer maintenant</button>
      <button class="btn small ghost" id="x-apk" type="button">Télécharger l'application Android (APK)</button></div>
    <span class="msg" id="x-amsg" aria-live="polite"></span>
  </section>
  <section class="card owner" id="x-owner">
    <h3 class="sec">Propriétaire de l'application</h3>
    <dl class="ownl">
      <div><dt>Entreprise</dt><dd data-notr>B2A-HIGH-TECHNOLOGY-AUTOMATION</dd></div>
      <div><dt>Propriétaire et gérant</dt><dd data-notr>Bayere Abdoul Aziz</dd></div>
      <div><dt>Siège</dt><dd>Ouagadougou, Burkina Faso (RCCM 2024)</dd></div>
      <div><dt>Contact</dt><dd data-notr>azizyou2005@yahoo.fr</dd></div>
    </dl>
    <p class="note">B2A Smart Farming est une application privée, propriété exclusive de B2A-HIGH-TECHNOLOGY-AUTOMATION et de Bayere Abdoul Aziz. Le code, les textes, les guides, le nom, le logo et le slogan B2A sont protégés. Toute copie, revente ou réutilisation sans autorisation écrite est interdite. L'utilisation gratuite de l'application publiée par B2A reste autorisée pour votre propre élevage.</p>
    <p class="note">© 2026 B2A-HIGH-TECHNOLOGY-AUTOMATION · Bayere Abdoul Aziz. Tous droits réservés.</p>
  </section>
  <p class="note" style="text-align:center">B2A Smart Farming · version gratuite · <a href="https://azizyou2005.github.io/b2a-smart-farming/confidentialite.html" target="_blank" rel="noopener">Confidentialité</a></p>
</div>`;
document.body.append(sheet);
let lastFocus=null;
/* Le bouton « retour » du téléphone ferme les Réglages au lieu de quitter l'application */
let setHist=false;
function openSet(){lastFocus=document.activeElement;renderSet();sheet.hidden=false;document.body.style.overflow="hidden";$("x-close").focus();
  try{history.pushState({b2aSet:1},"");setHist=true}catch(e){}}
function hideSet(){sheet.hidden=true;document.body.style.overflow="";if(lastFocus&&lastFocus.focus)lastFocus.focus()}
function closeSet(){if(sheet.hidden)return;if(setHist){setHist=false;history.back()}else hideSet()}
addEventListener("popstate",()=>{if(!sheet.hidden){setHist=false;hideSet()}});
gear.onclick=openSet;$("x-close").onclick=closeSet;
sheet.addEventListener("click",e=>{if(e.target===sheet)closeSet()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!sheet.hidden)closeSet()});
function renderSet(){
  $("x-nom").value=B.lsGet(B.LS_NAME)||"";
  const st=$("x-sst"),box=$("x-sync");box.innerHTML="";
  if(!B.CFG){st.textContent="Vos données sont enregistrées sur ce téléphone. Le partage entre téléphones n'est pas encore activé pour cette installation.";return}
  const T=B.team;
  if(B.farm){
    st.textContent=db&&db.kind==="cloud"?"Ce téléphone partage les données de la ferme ci-dessous. Hors connexion, les saisies sont gardées et envoyées au retour du réseau.":"Ferme enregistrée, connexion en attente.";
    if(T.statut==="attente")st.textContent="Votre demande est en attente : le propriétaire de la ferme doit vous accepter.";
    if(T.statut==="retire")st.textContent="Le propriétaire vous a retiré de cette ferme.";
    const code=el("div","farmcode",B.farm);code.setAttribute("data-notr","");box.append(code);
    const r=el("div","row");
    if(T.statut!=="retire"){
      const cp=el("button","btn small","Copier le code");cp.type="button";cp.onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(B.farm).then(()=>cp.textContent="Copié",()=>{})};
      const wa=el("a","btn small ghost","Envoyer par WhatsApp");wa.href="https://wa.me/?text="+encodeURIComponent(`B2A Smart Farming\nhttps://azizyou2005.github.io/b2a-smart-farming/\nRéglages > Rejoindre une ferme > ${B.farm}`);wa.target="_blank";wa.rel="noopener";
      r.append(cp,wa)}
    const q=el("button","btn small ghost","Quitter la ferme");q.type="button";q.onclick=()=>{if(q.dataset.c!=="1"){q.dataset.c="1";q.textContent="Confirmer : quitter";return}B.lsSet(B.LS_FARM,null);location.reload()};
    r.append(q);box.append(r);
    if(T.role==="proprietaire")renderOwner(box);
    else{
      if(T.role==="libre"&&T.uid&&db&&db.kind==="cloud"){
        box.append(el("p","note","Cette ferme n'a pas encore de propriétaire. Le propriétaire peut accepter ou retirer les employés."));
        const cl=el("button","btn small","Devenir propriétaire de cette ferme");cl.type="button";
        cl.onclick=async()=>{if(cl.dataset.c!=="1"){cl.dataset.c="1";cl.textContent="Confirmer : je suis le propriétaire";return}
          cl.disabled=true;try{const fs=firebase.firestore();
            await fs.doc("farms/"+B.farm).set({owner:T.uid,approbation:false,creeLe:firebase.firestore.FieldValue.serverTimestamp()});
            await fs.doc("farms/"+B.farm+"/members/"+T.uid).set({name:B.lsGet(B.LS_NAME)||"",dev:B.me,role:"proprietaire",statut:"actif",vu:today()},{merge:true});
            location.reload()}catch(e){cl.disabled=false;cl.textContent="Devenir propriétaire de cette ferme";st.textContent="Échec. Vérifiez la connexion."}};
        box.append(cl)}
      const ms=Object.entries(B.members);if(ms.length&&T.statut!=="retire"){box.append(el("span","label","Membres"));const ul=el("ul","members");ms.forEach(([id,n])=>{const li=el("li",null,(n||"Sans nom")+(id===B.me?" (vous)":""));li.setAttribute("data-notr","");ul.append(li)});box.append(ul)}
    }
  }else{
    st.textContent="Vos données sont sur ce téléphone. Créez une ferme pour les partager avec votre équipe, ou rejoignez une ferme avec son code.";
    const c=el("button","btn small","Créer une ferme et y envoyer mes données");c.type="button";
    c.onclick=async()=>{if(!navigator.onLine){st.textContent="Il faut internet pour créer la ferme la première fois.";return}
      c.disabled=true;c.textContent="Création…";const local=B.makeLocal();
      const code=Array.from({length:10},()=>"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random()*32)]).join("");
      try{const cloud=await B.makeCloud(B.CFG,code);const u=await B.ensureUser(B.CFG);const fs=firebase.firestore();
        /* le téléphone qui crée la ferme en devient le propriétaire */
        /* si les nouvelles règles Firebase ne sont pas encore publiées, la ferme est créée sans propriétaire (comme avant) */
        try{await fs.doc("farms/"+code).set({owner:u.uid,approbation:false,creeLe:firebase.firestore.FieldValue.serverTimestamp()});
          await fs.doc("farms/"+code+"/members/"+u.uid).set({name:B.lsGet(B.LS_NAME)||"",dev:B.me,role:"proprietaire",statut:"actif",vu:today(),creeLe:firebase.firestore.FieldValue.serverTimestamp()})}catch(e){}
        for(const n of B.COLS){if(n==="members")continue;const sn=await local.collection(n).get();for(const d of sn.docs)await cloud.doc(n+"/"+d.id).set(d.data())}
        B.lsSet(B.LS_FARM,code);location.reload()}catch(e){c.disabled=false;c.textContent="Créer une ferme et y envoyer mes données";st.textContent="La création a échoué. Vérifiez la connexion."}};
    box.append(c);
    const j=el("div","row");const inp=el("input");inp.type="text";inp.placeholder="Code de la ferme";inp.style.maxWidth="200px";inp.style.textTransform="uppercase";inp.setAttribute("aria-label","Code de la ferme");
    const jb=el("button","btn small ghost","Rejoindre");jb.type="button";jb.onclick=()=>{const v=inp.value.trim().toUpperCase().replace(/[^A-Z0-9]/g,"");if(v.length!==10){st.textContent="Code invalide.";return}B.lsSet(B.LS_FARM,v);location.reload()};
    j.append(inp,jb);box.append(el("span","label","Rejoindre une ferme"),j);
  }
}
/* gestion de l'équipe, réservée au propriétaire */
const ST_TXT={actif:"Actif",attente:"En attente",retire:"Retiré"};
function renderOwner(box){
  const T=B.team,fs=firebase.firestore();
  box.append(el("p","note good","Vous êtes le propriétaire de cette ferme. Vous voyez en direct ce que l'équipe enregistre."));
  const lab=el("label","row");const cb=el("input");cb.type="checkbox";cb.checked=!!T.approbation;
  cb.onchange=async()=>{cb.disabled=true;try{await fs.doc("farms/"+B.farm).update({approbation:cb.checked})}catch(e){cb.checked=!cb.checked}cb.disabled=false};
  lab.append(cb,el("span",null,"J'accepte moi-même chaque nouveau membre"));box.append(lab);
  const list=T.list.filter(m=>m.statut);
  box.append(el("span","label","Équipe"));
  if(!list.length){box.append(el("p","note","Personne n'a encore rejoint la ferme. Envoyez le code à vos employés."));return}
  const order={attente:0,actif:1,retire:2};list.sort((a,b)=>(order[a.statut]-order[b.statut])||((a.name||"").localeCompare(b.name||"")));
  const ul=el("ul","members");ul.style.cssText="display:grid;gap:8px;list-style:none;padding:0";
  list.forEach(m=>{const li=el("li");li.style.cssText="display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px";
    const nm=el("strong",null,(m.name||"Sans nom")+(m.id===T.uid?" (vous)":""));nm.setAttribute("data-notr","");
    li.append(nm,el("span","note",m.role==="proprietaire"?"Propriétaire":"Employé"),el("span","note",ST_TXT[m.statut]||""));
    if(m.vu){const v=el("span","note",m.vu);v.setAttribute("data-notr","");li.append(el("span","note","Vu le"),v)}
    const act=(t,s,ghost)=>{const b=el("button","btn small"+(ghost?" ghost":""),t);b.type="button";
      b.onclick=async()=>{if(s==="retire"&&b.dataset.c!=="1"){b.dataset.c="1";b.textContent="Confirmer : retirer";return}
        b.disabled=true;try{await fs.doc("farms/"+B.farm+"/members/"+m.id).update({statut:s})}catch(e){b.disabled=false}};li.append(b)};
    if(m.id!==T.uid){
      if(m.statut==="attente"){act("Accepter","actif");act("Refuser","retire",true)}
      else if(m.statut==="actif")act("Retirer","retire",true);
      else act("Réintégrer","actif",true)}
    ul.append(li)});
  box.append(ul);
}
addEventListener("b2a-team",()=>{if(!sheet.hidden)renderSet()});
$("x-nsave").onclick=async()=>{const n=$("x-nom").value.trim();B.lsSet(B.LS_NAME,n||null);$("x-nmsg").textContent="Enregistré.";if(!db||!n)return;
  try{if(db.kind==="cloud"&&B.team.uid)await db.doc("members/"+B.team.uid).update({name:n,vu:today()});else await db.doc("members/"+B.me).set({name:n,vu:today()})}catch(e){}};
$("x-export").onclick=async()=>{
  if(!db)return;const out={app:"B2A Smart Farming",version:2,exporte:new Date().toISOString()};
  for(const n of B.COLS){const s=await db.collection(n).get();out[n]=s.docs.map(d=>({id:d.id,...d.data()}))}
  const blob=new Blob([JSON.stringify(out)],{type:"application/json"});
  try{const dl=await window.claude.use("downloads");await dl.save({filename:"b2a-sauvegarde-"+today()+".json",data:blob});$("x-bmsg").textContent="Sauvegarde téléchargée. Gardez-la ou envoyez-la par WhatsApp."}
  catch(e){$("x-bmsg").textContent="Le téléchargement a échoué."}};
$("x-import").onchange=async e=>{const f=e.target.files[0];if(!f||!db)return;
  try{if(f.size>30*1024*1024)throw 0;const d=JSON.parse(await f.text());if(!d||typeof d!=="object"||Array.isArray(d))throw 0;
    /* contrôle du fichier : seulement nos collections, des identifiants simples et des objets ordinaires */
    const okId=v=>typeof v==="string"&&/^[A-Za-z0-9_.-]{1,150}$/.test(v)&&v!=="."&&v!=="..";
    const plain=v=>v&&typeof v==="object"&&!Array.isArray(v);
    const scrub=v=>Array.isArray(v)?v.map(scrub):plain(v)?Object.fromEntries(Object.entries(v).filter(([k])=>!/^__|^(constructor|prototype)$/.test(k)).map(([k,x])=>[k,scrub(x)])):v;
    let n=0;for(const col of B.COLS){const arr=d[col];if(!Array.isArray(arr))continue;for(const x of arr){if(!plain(x))continue;const {id,...rest}=x;if(okId(id)){await db.doc(col+"/"+id).set(scrub(rest));n++}}}
    $("x-bmsg").textContent=n+" éléments importés."}catch(err){$("x-bmsg").textContent="Fichier non reconnu."}e.target.value=""};
let installEvt=null;addEventListener("beforeinstallprompt",e=>{e.preventDefault();installEvt=e;$("x-install").hidden=false});
$("x-install").onclick=async()=>{if(!installEvt)return;installEvt.prompt();await installEvt.userChoice;installEvt=null;$("x-install").hidden=true};
if(window.Capacitor)$("x-inst").hidden=true;
/* APK : on vérifie d'abord que le fichier existe, et on ne quitte jamais l'application */
const APK="b2a-smart-farming.apk";
$("x-apk").onclick=async()=>{const b=$("x-apk"),m=$("x-amsg");m.className="msg";
  if(!navigator.onLine){m.textContent="Il faut internet pour télécharger l'application Android.";return}
  b.disabled=true;m.textContent="Vérification…";
  let ok=false;try{const r=await fetch(APK,{method:"HEAD",cache:"no-store"});ok=r.ok&&!/text\/html/i.test(r.headers.get("content-type")||"")}catch(e){}
  b.disabled=false;
  if(!ok){m.className="msg err";m.textContent="L'application Android (APK) n'est pas encore disponible. Utilisez « Ajouter à l'écran d'accueil » ci-dessus : c'est la même application.";return}
  const a=document.createElement("a");a.href=APK;a.download=APK;a.target="_blank";a.rel="noopener";document.body.append(a);a.click();a.remove();
  m.className="msg good";m.textContent="Téléchargement lancé. Ouvrez le fichier reçu pour installer l'application."};

/* ================= Code d'accès IA (onglet Photo IA) ================= */
const V=$("v-diagnostic");
const iaCard=el("section","card iacard");iaCard.id="x-ia";
V.insertBefore(iaCard,V.firstChild);
function renderIa(){
  iaCard.innerHTML="";const {info}=B.ia();
  const h=el("div","row between");h.append(el("h2","sec","Diagnostic photo par IA"));h.append(el("span","pill s-info","Avec code d'accès"));iaCard.append(h);
  if(!B.IA_URL){iaCard.append(el("p","note","L'analyse des photos par l'IA sera disponible avec un code d'accès B2A. En attendant, le guide santé plus bas fonctionne sans internet."));return}
  if(info){const r=el("div","row between");const t=el("span","msg good",(info.nom?"Accès « "+info.nom+" » · ":"")+(info.restant==null?"":info.restant+" analyse(s) restante(s) ce mois"));
    const f=el("button","btn small ghost","Retirer le code");f.type="button";f.onclick=()=>{B.iaForget();location.reload()};r.append(t,f);iaCard.append(r);
    if(!navigator.onLine)iaCard.append(el("p","note","Pas de connexion internet : l'analyse reprendra au retour du réseau."));return}
  iaCard.append(el("p","note","Les clients et partenaires B2A reçoivent un code d'accès qui débloque l'analyse des photos d'animaux et de plantes, et les prévisions par l'IA."));
  const r=el("div","row");const inp=el("input");inp.type="text";inp.placeholder="B2A-XXXX-XXXX";inp.autocomplete="off";inp.setAttribute("aria-label","Code d'accès");inp.style.cssText="max-width:220px;text-transform:uppercase;font-family:var(--mono)";
  const b=el("button","btn","Activer");b.type="button";const m=el("span","msg");r.append(inp,b,m);iaCard.append(r);
  b.onclick=async()=>{const c=inp.value.trim().toUpperCase();if(!c){m.textContent="Entrez votre code.";return}
    if(!navigator.onLine){m.textContent="Il faut internet pour activer le code.";return}
    b.disabled=true;m.textContent="Vérification…";
    try{await B.iaVerify(c);location.reload()}
    catch(e){b.disabled=false;m.className="msg err";m.textContent=e&&(e.status===401||e.status===403)?"Code invalide ou désactivé. Contactez B2A.":"Le serveur IA ne répond pas. Réessayez plus tard."}};
}
renderIa();addEventListener("online",renderIa);addEventListener("offline",renderIa);
setTimeout(()=>B.iaRefresh().then(renderIa),1500);

/* ================= Guide santé hors ligne ================= */
const G0=window.B2A_GUIDE;let gGroup="volaille";const gSel=new Set();
const gCard=el("section","card");gCard.innerHTML=`<h2 class="sec">Guide santé (sans internet)</h2>
  <p class="note">Touchez les signes que vous observez, puis voyez les causes probables et quoi faire.</p>
  <div class="seg4" id="g-groups" role="group" aria-label="Espèce"></div>
  <div id="g-signs" style="display:grid;gap:10px"></div>
  <div class="grid2"><div class="field"><label for="g-lot">Lot concerné (facultatif)</label><select id="g-lot"></select></div></div>
  <div class="row"><button class="btn" id="g-go" type="button" disabled>Voir les causes probables</button><button class="btn ghost" id="g-reset" type="button">Effacer</button></div>`;
const gRes=el("section");gRes.id="g-res";gRes.style.cssText="display:grid;gap:12px";gRes.setAttribute("aria-live","polite");
const note=V.querySelector(":scope > p.note:last-of-type");V.insertBefore(gCard,note);V.insertBefore(gRes,note);
function fillLots(){const ls=$("g-lot");if(!ls)return;const keep=ls.value;ls.innerHTML="";const o0=el("option",null,"Aucun");o0.value="";ls.append(o0);
  lots.forEach(l=>{const o=el("option",null,l.nom);o.value=l.id;o.setAttribute("data-notr","");ls.append(o)});ls.value=keep||""}
function renderGuide(){
  const G=G0[gGroup];const seg=$("g-groups");seg.innerHTML="";
  Object.entries(G0).forEach(([k,g])=>{const b=el("button",null,g.nom);b.type="button";b.setAttribute("aria-pressed",k===gGroup);b.onclick=()=>{gGroup=k;gSel.clear();renderGuide();gRes.innerHTML=""};seg.append(b)});
  const box=$("g-signs");box.innerHTML="";
  G.signs.forEach(([cat,list])=>{box.append(el("span","label",cat));const w=el("div","chips");
    list.forEach(([id,lb])=>{const b=el("button","chip",lb);b.type="button";b.setAttribute("aria-pressed",gSel.has(id));b.onclick=()=>{gSel.has(id)?gSel.delete(id):gSel.add(id);b.setAttribute("aria-pressed",gSel.has(id));$("g-go").disabled=!gSel.size};w.append(b)});box.append(w)});
  $("g-go").disabled=!gSel.size;fillLots()}
$("g-reset").onclick=()=>{gSel.clear();renderGuide();gRes.innerHTML=""};
$("g-go").onclick=()=>{
  const G=G0[gGroup];const sel=[...gSel];
  const res=G.maladies.map(m=>{const hit=m.s.filter(x=>gSel.has(x)).length;return {m,hit,score:hit?Math.round((hit/m.s.length*0.6+hit/sel.length*0.4)*100):0}}).filter(r=>r.hit).sort((a,b)=>b.score-a.score).slice(0,4);
  gRes.innerHTML="";
  if(!res.length){gRes.append(el("p","note","Aucune maladie de la liste ne correspond. Décrivez les signes au vétérinaire."));return}
  if(res.some(r=>r.m.urg===2&&r.score>=40)){const b=el("div","urgent");b.append(el("strong",null,"Maladie grave et contagieuse possible"),el("span",null,"Isolez les animaux, ne vendez et ne déplacez rien, et appelez tout de suite le vétérinaire ou les services vétérinaires."));gRes.append(b)}
  res.forEach(r=>{const c=el("div","dis card");const h=el("div","row between");h.append(el("h3","sec",r.m.n));
    h.append(el("span","pill "+(r.m.urg===2?"s-bad":r.m.urg===1?"s-warn":"s-info"),r.m.urg===2?"Urgent":r.m.urg===1?"Vétérinaire":"Courant"));c.append(h);
    const bar=el("div","bar"),i=el("i");i.style.width=r.score+"%";i.style.background="var(--brand-green)";bar.append(i);c.append(bar);
    c.append(el("small","note",`Correspondance ${r.score} % · ${r.hit} signe(s) sur ${r.m.s.length}`));
    c.append(el("strong",null,"Que faire maintenant"));const ul=el("ul");r.m.a.forEach(x=>ul.append(el("li",null,x)));c.append(ul);
    const pv=el("p");pv.style.margin="0";pv.append(el("b",null,"Prévention"),el("span",null," : "+r.m.p));c.append(pv);
    const lotId=$("g-lot").value;if(lotId&&db){const b=el("button","btn small ghost","Noter dans le calendrier du lot");b.type="button";b.style.justifySelf="start";
      b.onclick=async()=>{const code="c"+Date.now();try{await db.doc("soins/"+lotId+"_"+code).set({lotId,code,nom:"Suspicion : "+r.m.n+" (à confirmer)",type:"traitement",datePrevue:today(),custom:true,fait:false,by:B.me});b.textContent="Noté";b.disabled=true}catch(e){b.textContent="Échec"}};c.append(b)}
    gRes.append(c)});
  gRes.append(el("p","note","Ce guide aide à réagir vite mais ne remplace pas un vétérinaire. Les doses se lisent toujours sur la notice du produit."));
  gRes.scrollIntoView({behavior:"smooth",block:"start"});
};
renderGuide();

/* fonctionnement sans internet */
if("serviceWorker" in navigator&&!window.Capacitor&&(location.protocol==="https:"||location.hostname==="localhost"||location.hostname==="127.0.0.1"))
  navigator.serviceWorker.register("sw.js").catch(()=>{});
})();
