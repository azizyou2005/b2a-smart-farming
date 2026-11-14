/* B2A Smart Farming : statistiques nationales pour le ministère (page utilisateurs.html, compte B2A)
   1. B2A voit combien de fermes partagent leur résumé anonyme (stats_contrib, avec l'accord de l'éleveur).
   2. B2A calcule un rapport regroupé (par espèce, par zone, cultures, prix du Marché) et le publie (ministere_rapports).
   3. B2A donne ou retire l'accès au ministère (ministere_acces) : le ministère ne voit QUE les rapports publiés,
      sur ministere.html. Il n'a aucun accès aux fermes, aux inscriptions ni au code de l'application. */
(function(){
if(!window.B2A_FIREBASE||!window.firebase||!window.B2A_RAPPORT)return;
const R=window.B2A_RAPPORT;
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const fmt=R.fmt,ms=R.ms;
const norm=s=>String(s||"").trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const titre=s=>String(s||"").trim().replace(/\s+/g," ").replace(/(^|[\s-])(\p{L})/gu,(m,a,b)=>a+b.toUpperCase());
const PAGE="https://azizyou2005.github.io/b2a-smart-farming/ministere.html";
const UEMOA=["burkina faso","cote d ivoire","mali","niger","senegal","togo","benin","guinee bissau"];
const CATS={aliment:"Aliment",animaux:"Animaux vivants",oeufs:"Œufs",poussins:"Poussins",viande:"Viande et volaille abattue",lait:"Lait et produits laitiers",
  recoltes:"Récoltes",plants:"Plants et semences",fourrage:"Fourrage et foin",fumier:"Fumier et compost",materiel:"Matériel",autre:"Autre"};
const ESPK=["pondeuse","chair","local","caillepond","caillechair","porc","petitsrum","bovin","poisson","lapin","autre"];

const host=$("u-main");if(!host)return;
const sec=el("section","card");sec.id="mi-admin";sec.innerHTML=`<h2>Statistiques pour le ministère</h2>
  <p class="note">Les éleveurs qui ont accepté (Réglages > Statistiques nationales) envoient chaque jour un résumé anonyme de leur ferme. Ici, vous calculez un rapport regroupé et vous le publiez. Le ministère voit seulement les rapports publiés, jamais les fermes, les noms ni l'application.</p>
  <div class="kpis" id="mi-kpis"></div>
  <h3>1. Préparer un rapport</h3>
  <div class="mi-row">
    <div class="field"><label for="mi-pays">Pays</label><select id="mi-pays"></select></div>
    <div class="field"><label for="mi-seuil">Regrouper les groupes de moins de … fermes</label><input type="number" id="mi-seuil" min="3" max="20" value="3"></div>
    <div class="field"><label for="mi-titre">Titre</label><input id="mi-titre" maxlength="120" value="Statistiques nationales de l'élevage"></div>
  </div>
  <div class="acts"><button class="btn small" id="mi-calc" type="button">Calculer l'aperçu</button><button class="btn small ok" id="mi-pub" type="button" disabled>Publier pour le ministère</button>
    <button class="btn small ghost" id="mi-csv" type="button" disabled>Télécharger (Excel)</button><span class="msg" id="mi-msg" aria-live="polite"></span></div>
  <div id="mi-prev" class="mi-prev" hidden></div>
  <h3>2. Rapports publiés</h3><div class="list" id="mi-pubs"><p class="note">Chargement…</p></div>
  <h3>3. Accès du ministère</h3>
  <p class="note">Créez d'abord le compte de la personne du ministère dans Firebase : <b>Authentication > Users > Ajouter un utilisateur</b> (son e-mail et un mot de passe). Copiez son <b>UID</b> (colonne « UID de l'utilisateur »), puis collez-le ci-dessous. Elle se connecte ensuite sur la page du ministère.</p>
  <div class="mi-row">
    <div class="field"><label for="mi-uid">UID Firebase du compte</label><input id="mi-uid" maxlength="40" autocomplete="off" placeholder="ex. 7fK2…"></div>
    <div class="field"><label for="mi-nom">Service et nom</label><input id="mi-nom" maxlength="80" placeholder="ex. DGSV · M. Ouédraogo"></div>
    <div class="field"><label for="mi-mail">E-mail (pour mémoire)</label><input id="mi-mail" type="email" maxlength="100"></div>
  </div>
  <div class="acts"><button class="btn small" id="mi-add" type="button">Donner l'accès</button><span class="msg" id="mi-amsg" aria-live="polite"></span></div>
  <div class="list" id="mi-acc"></div>
  <p class="note">Page à envoyer au ministère : <a id="mi-link" target="_blank" rel="noopener"></a> <button class="btn small ghost" id="mi-copy" type="button">Copier le lien</button></p>`;
host.querySelector(".wrap").append(sec);
$("mi-link").href=PAGE;$("mi-link").textContent=PAGE;
const css=el("style");css.textContent=`#mi-admin h3{margin:10px 0 0;font:700 16px var(--display)}
.mi-row{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))}
.mi-prev{display:grid;gap:12px;border:2px dashed var(--line);border-radius:14px;padding:10px}.mi-prev .card{box-shadow:none}
#mi-admin .u-top b{font-size:16px}`;document.head.append(css);

const db=firebase.firestore();let contribs=[],pubs=[],acces=[],annonces=[],last=null,offs=[];
const note=d=>{(window.__adm=window.__adm||{}).ministere=d;document.dispatchEvent(new CustomEvent("b2a-admin",{detail:{k:"ministere",d}}))};
firebase.auth().onAuthStateChanged(u=>{offs.forEach(f=>f());offs=[];if(!u||u.isAnonymous)return;
  const err=x=>()=>{$(x).textContent="Lecture impossible : publiez les nouvelles règles Firestore (firestore.rules)."};
  offs.push(db.collection("stats_contrib").onSnapshot(s=>{contribs=s.docs.map(d=>({id:d.id,...d.data()}));renderKpis()},err("mi-msg")));
  offs.push(db.collection("ministere_rapports").orderBy("creeLe","desc").limit(30).onSnapshot(s=>{pubs=s.docs.map(d=>({id:d.id,...d.data()}));renderPubs()},()=>{$("mi-pubs").textContent="Lecture impossible : publiez les nouvelles règles Firestore."}));
  offs.push(db.collection("ministere_acces").onSnapshot(s=>{acces=s.docs.map(d=>({id:d.id,...d.data()}));renderAcc()},()=>{$("mi-acc").textContent=""}));
});

/* résumés valables : reçus dans les 60 derniers jours ; une ferme partagée (même clé) n'est comptée qu'une fois */
function actifs(){const lim=Date.now()-60*864e5;const by={};
  contribs.filter(x=>ms(x.majLe)>=lim).forEach(x=>{const k=x.cle?"f"+x.cle:"u"+x.id;if(!by[k]||ms(by[k].majLe)<ms(x.majLe))by[k]=x});return Object.values(by)}
function renderKpis(){const A=actifs();const P={};A.forEach(x=>{const k=norm(x.pays);if(!P[k])P[k]={n:0,lab:x.pays||"Non précisé"};P[k].n++});
  const K=$("mi-kpis");K.innerHTML="";const kp=(l,v,s,c)=>{const k=el("div","kpi"+(c?" "+c:""));k.append(el("span",null,l),el("b",null,v));if(s)k.append(el("small",null,s));return k};
  const anim=A.reduce((p,x)=>p+Object.values(x.especes||{}).reduce((q,o)=>q+(Number(o.effectif)||0),0),0);
  K.append(kp("Fermes qui partagent",fmt(A.length),"résumé reçu sous 60 jours","ok"),kp("Animaux suivis",fmt(anim)),kp("Pays",fmt(Object.keys(P).length)),kp("Rapports publiés",fmt(pubs.length)));
  const S=$("mi-pays");const cur=S.value||"burkina faso";S.innerHTML="";const list=Object.entries(P).sort((a,b)=>b[1].n-a[1].n);
  if(!P["burkina faso"])list.push(["burkina faso",{n:0,lab:"Burkina Faso"}]);
  list.forEach(([k,o])=>S.append(new Option(o.lab+" ("+o.n+" ferme"+(o.n>1?"s":"")+")",k)));S.value=list.some(x=>x[0]===cur)?cur:list[0][0];
  note({fermes:A.length})}

/* ---------- calcul du rapport regroupé ---------- */
function build(paysK,seuil,titreTxt){const C=actifs().filter(x=>norm(x.pays)===paysK);
  const paysLab=(C[0]&&C[0].pays)||($("mi-pays").selectedOptions[0]||{}).text||paysK;
  const blank=()=>({fermes:new Set(),lots:0,effectif:0,morts30:0,oeufs30:0,lait30:0,vaccDus:0,vaccFaits:0,alerte:0});
  const add=(o,f,x)=>{o.fermes.add(f);for(const k of ["lots","effectif","morts30","oeufs30","lait30","vaccDus","vaccFaits","alerte"])o[k]+=Number(x[k])||0};
  /* par espèce */
  const E={};C.forEach(x=>{for(const [k,o] of Object.entries(x.especes||{})){const kk=ESPK.includes(k)?k:"autre";add(E[kk]=E[kk]||blank(),x.id,o)}});
  const small=Object.keys(E).filter(k=>k!=="autre"&&E[k].fermes.size<seuil);
  small.forEach(k=>{const o=E[k],a=E.autre=E.autre||blank();o.fermes.forEach(f=>a.fermes.add(f));for(const q in o)if(q!=="fermes")a[q]+=o[q];delete E[k]});
  if(E.autre&&E.autre.fermes.size<seuil)delete E.autre;
  const especes=ESPK.filter(k=>E[k]).map(k=>({k,...E[k],fermes:E[k].fermes.size}));
  /* par zone : province déclarée, sinon ville de l'inscription */
  const Z={};C.forEach(x=>{const raw=(x.province||"").trim()||(x.ville||"").trim();const k=norm(raw)||"non precise";
    const z=Z[k]=Z[k]||{lab:raw?titre(raw):"Non précisé",...blank(),esp:{},espA:new Set()};
    for(const [ek,o] of Object.entries(x.especes||{})){add(z,x.id,o);z.esp[ek]=(z.esp[ek]||0)+(Number(o.effectif)||0);if(Number(o.alerte)>0)z.espA.add(ek)}
    if(!Object.keys(x.especes||{}).length)z.fermes.add(x.id)});
  const autres={lab:"Autres localités",...blank(),esp:{},espA:new Set()};let zones=[];
  Object.values(Z).forEach(z=>{if(z.fermes.size>=seuil)zones.push(z);else{z.fermes.forEach(f=>autres.fermes.add(f));for(const q of ["lots","effectif","morts30","oeufs30","lait30","vaccDus","vaccFaits","alerte"])autres[q]+=z[q];
    for(const [k,v] of Object.entries(z.esp))autres.esp[k]=(autres.esp[k]||0)+v;z.espA.forEach(k=>autres.espA.add(k))}});
  zones.sort((a,b)=>b.fermes.size-a.fermes.size);if(autres.fermes.size>=seuil)zones.push(autres);
  zones=zones.map(z=>({zone:z.lab,fermes:z.fermes.size,lots:z.lots,effectif:z.effectif,morts30:z.morts30,vaccDus:z.vaccDus,vaccFaits:z.vaccFaits,alerte:z.alerte,
    top:Object.entries(z.esp).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0]),especesAlerte:[...z.espA]}));
  /* cultures */
  const CU={};C.forEach(x=>{for(const [k,o] of Object.entries(x.cultures||{})){const c=CU[k]=CU[k]||{n:o.n||k,fermes:new Set(),lots:0,ha:0};c.fermes.add(x.id);c.lots+=Number(o.lots)||0;c.ha+=Number(o.ha)||0}});
  const cAut={n:"Autres cultures",fermes:new Set(),lots:0,ha:0};let cultures=[];
  Object.values(CU).forEach(c=>{if(c.fermes.size>=seuil)cultures.push(c);else{c.fermes.forEach(f=>cAut.fermes.add(f));cAut.lots+=c.lots;cAut.ha+=c.ha}});
  cultures.sort((a,b)=>b.ha-a.ha||b.fermes.size-a.fermes.size);if(cAut.fermes.size>=seuil)cultures.push(cAut);
  cultures=cultures.map(c=>({n:c.n,fermes:c.fermes.size,lots:c.lots,ha:Math.round(c.ha*10)/10}));
  /* prix du Marché : annonces en ligne, même monnaie, au moins « seuil » annonces par produit */
  const dev=UEMOA.includes(paysK)?"XOF":null;const PG={};
  annonces.filter(a=>a.statut==="actif"&&(!dev||(a.devise||"XOF")===dev)&&Number(a.prix)>0).forEach(a=>{const u=norm(a.unite);const k=(a.cat||"autre")+"|"+u;
    const g=PG[k]=PG[k]||{cat:CATS[a.cat]||"Autre",unite:String(a.unite||"").trim(),v:[],vend:new Set()};g.v.push(Number(a.prix));g.vend.add(a.vendeur)});
  const prix=Object.values(PG).filter(g=>g.v.length>=seuil&&g.vend.size>=Math.min(2,seuil)).map(g=>{const v=g.v.sort((a,b)=>a-b);const m=v.length>>1;
    return {cat:g.cat,unite:g.unite,n:v.length,med:Math.round(v.length%2?v[m]:(v[m-1]+v[m])/2),min:Math.round(v[0]),max:Math.round(v[v.length-1])}}).sort((a,b)=>b.n-a.n).slice(0,40);
  return {titre:titreTxt||"Statistiques nationales de l'élevage",pays:titre(paysLab.replace(/\s*\(\d+ fermes?\)$/,"")),seuil,nbFermes:C.length,nbZones:zones.length,
    especes,zones,cultures,prix,prixDevise:dev==="XOF"?"FCFA":"monnaie des annonces",genereLe:Date.now()}}

$("mi-calc").onclick=async()=>{const m=$("mi-msg");m.textContent="Calcul…";m.className="msg";
  const seuil=Math.max(3,Math.min(20,Math.round(Number($("mi-seuil").value)||3)));$("mi-seuil").value=seuil;
  try{const s=await db.collection("marche_annonces").where("statut","==","actif").limit(2000).get();annonces=s.docs.map(d=>d.data())}catch(e){annonces=[]}
  last=build($("mi-pays").value,seuil,$("mi-titre").value.trim());
  const P=$("mi-prev");P.hidden=false;R.render(P,last);
  const ok=last.nbFermes>=seuil;$("mi-pub").disabled=!ok;$("mi-csv").disabled=false;
  m.textContent=ok?`Aperçu prêt : ${last.nbFermes} ferme(s). Vérifiez puis publiez.`:`Seulement ${last.nbFermes} ferme(s) dans ce pays : il en faut au moins ${seuil} pour publier sans qu'une ferme soit reconnaissable.`;
  m.className="msg"+(ok?"":" err")};
$("mi-csv").onclick=()=>{if(last)R.download(last)};
$("mi-pub").onclick=async()=>{if(!last)return;const b=$("mi-pub"),m=$("mi-msg");if(b.dataset.c!=="1"){b.dataset.c="1";b.textContent="Confirmer la publication";return}
  b.disabled=true;try{const rep={...last};delete rep.genereLe;rep.creeLe=firebase.firestore.FieldValue.serverTimestamp();
    await db.collection("ministere_rapports").add(rep);m.textContent="Rapport publié : le ministère le voit tout de suite sur sa page.";m.className="msg"}
  catch(e){console.warn(e);m.textContent="Publication impossible : vérifiez les règles Firestore et la connexion.";m.className="msg err"}
  b.dataset.c="";b.textContent="Publier pour le ministère";b.disabled=false};

function renderPubs(){const L=$("mi-pubs");L.innerHTML="";if(!pubs.length){L.append(el("p","note","Aucun rapport publié."));return}
  pubs.forEach(p=>{const c=el("article","u");const t=el("div","u-top");t.append(el("b",null,(p.titre||"Rapport")+" · "+(p.pays||"")),el("span","pill p-approuve",fmt(p.nbFermes)+" fermes"));c.append(t);
    c.append(el("small",null,"Publié le "+R.dLong(ms(p.creeLe))));
    const a=el("div","acts");const v=el("button","btn small ghost","Voir");v.type="button";v.onclick=()=>{const P=$("mi-prev");P.hidden=false;R.render(P,p);last=p;$("mi-csv").disabled=false;$("mi-pub").disabled=true;P.scrollIntoView({behavior:"smooth"})};
    const x=el("button","btn small ghost","Excel");x.type="button";x.onclick=()=>R.download(p);
    const d=el("button","btn small bad","Retirer");d.type="button";d.onclick=async()=>{if(d.dataset.c!=="1"){d.dataset.c="1";d.textContent="Confirmer le retrait";return}d.disabled=true;
      try{await db.doc("ministere_rapports/"+p.id).delete()}catch(e){d.disabled=false;d.textContent="Échec"}};
    a.append(v,x,d);c.append(a);L.append(c)})}

function renderAcc(){const L=$("mi-acc");L.innerHTML="";if(!acces.length){L.append(el("p","note","Aucun compte du ministère pour l'instant."));return}
  acces.forEach(x=>{const c=el("article","u");const t=el("div","u-top");t.append(el("b",null,x.nom||"Compte du ministère"),el("span","pill p-approuve","Accès actif"));c.append(t);
    c.append(el("small",null,[x.email,"UID "+x.id,x.ajouteLe?"depuis le "+R.dLong(ms(x.ajouteLe)):""].filter(Boolean).join(" · ")));
    const d=el("button","btn small bad","Retirer l'accès");d.type="button";d.onclick=async()=>{if(d.dataset.c!=="1"){d.dataset.c="1";d.textContent="Confirmer";return}d.disabled=true;
      try{await db.doc("ministere_acces/"+x.id).delete()}catch(e){d.disabled=false;d.textContent="Échec"}};
    const a=el("div","acts");a.append(d);c.append(a);L.append(c)})}
$("mi-add").onclick=async()=>{const uid=$("mi-uid").value.trim(),m=$("mi-amsg");
  if(!/^[A-Za-z0-9]{20,40}$/.test(uid)){m.textContent="UID non valide : copiez-le depuis Firebase > Authentication > Users.";m.className="msg err";return}
  try{await db.doc("ministere_acces/"+uid).set({nom:$("mi-nom").value.trim().slice(0,80),email:$("mi-mail").value.trim().slice(0,100),ajouteLe:firebase.firestore.FieldValue.serverTimestamp()});
    m.textContent="Accès donné. Envoyez-lui le lien de la page du ministère.";m.className="msg";$("mi-uid").value="";$("mi-nom").value="";$("mi-mail").value=""}
  catch(e){m.textContent="Échec : vérifiez les règles Firestore.";m.className="msg err"}};
$("mi-copy").onclick=async()=>{try{await navigator.clipboard.writeText(PAGE);$("mi-copy").textContent="Lien copié"}catch(e){}};
})();
