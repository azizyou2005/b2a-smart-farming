/* B2A Smart Farming : Marché B2A (partie payante)
   Les éleveurs et agriculteurs publient leurs produits (aliment, animaux, œufs, plants, récoltes…),
   les clients qui ont l'application commandent ; paiement direct entre eux (espèces, Orange Money, Moov Money).
   B2A prend une petite commission sur chaque vente conclue.
   B2A-HIGH-TECHNOLOGY-AUTOMATION · Bayere Abdoul Aziz

   Données (Firestore, hors des fermes, visibles par tous les inscrits) :
   marche_annonces/<id>   { vendeur, vendeurNom, vendeurTel, ville, cat, titre, desc, prix, unite, qte, photo, statut: actif|epuise|retire, creeLe, majLe }
   marche_commandes/<id>  { annonce, titre, vendeur, vendeurNom, vendeurTel, acheteur, acheteurNom, acheteurTel, acheteurVille, qte, unite, prix, total,
                            statut: demande|acceptee|refusee|vendue|annulee, taux, commission, creeLe, majLe, note }
   marche_boutiques/<uid> { nom, activite, ville, quartier, tel, horaires, desc, majLe }   (fiche publique de l'entreprise, seule visible par les acheteurs)
   marche_vendeurs/<uid>  { statut: actif|suspendu, nom, tel, ville, taux, accepteLe, cgu, cguLe }  (privé : vendeur et B2A)
   marche_pieces/<uid>    { type: cnib|entreprise, titulaire, cnib, rccm, ifu, photo, statut: attente|validee|refusee, motif, envoyeLe }  (privé : vendeur et B2A)
   marche_paiements/<id>  { vendeur, montant, date, note }   (écrit par B2A)
   marche_config/global   { taux, telPaiement, nomPaiement }  (écrit par B2A) */
(function(){
const B=window.B2A;if(!B||!B.app)return;const A=B.app;
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const notr=e=>{e.setAttribute("data-notr","");return e};
const N=v=>{if(v===""||v==null)return null;const n=Number(String(v).replace(",",".").replace(/\s/g,""));return isFinite(n)?n:null};
const fmt=(v,d=0)=>v==null||!isFinite(v)?"—":Number(v).toLocaleString("fr-FR",{maximumFractionDigits:d,minimumFractionDigits:d});
const pad=n=>String(n).padStart(2,"0");
const today=()=>{const d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())};
const ms=v=>v==null?0:typeof v==="number"?v:v.toMillis?v.toMillis():v.seconds?v.seconds*1000:0;
const fd=v=>{const t=ms(v);return t?new Date(t).toLocaleDateString("fr-FR",{day:"numeric",month:"short"}):"—"};
const tel226=t=>{let p=String(t||"").replace(/\D/g,"");if(p.length===8)p="226"+p;return p};

const CATS=[["aliment","Aliment"],["animaux","Animaux vivants"],["oeufs","Œufs"],["poussins","Poussins"],["viande","Viande et volaille abattue"],["lait","Lait et produits laitiers"],
  ["recoltes","Récoltes (céréales, légumes…)"],["plants","Plants et semences"],["fourrage","Fourrage et foin"],["fumier","Fumier et compost"],["materiel","Matériel"],["autre","Autre"]];
const CN=k=>(CATS.find(c=>c[0]===k)||CATS[CATS.length-1])[1];
const UNITS=["plateau de 30","unité","tête","kg","sac de 50 kg","sac de 100 kg","tine","litre","botte","lot"];
const ST={demande:["Nouvelle demande","warn"],acceptee:["Acceptée","ok"],refusee:["Refusée","bad"],vendue:["Vendue","ok"],annulee:["Annulée","bad"]};
const DEF={taux:5,telPaiement:"",nomPaiement:"B2A-HIGH-TECHNOLOGY-AUTOMATION"};

/* ---------- 1. accès aux données ---------- */
let S=null;
const quick=pr=>{pr.catch(()=>{});return Promise.race([pr,new Promise(r=>setTimeout(()=>r("local"),1500))])};
async function store(){if(S)return S;
  if(B.CFG){await B.loadFirebase(B.CFG);const u=await B.ensureUser(B.CFG);const fs=firebase.firestore();
    S={kind:"cloud",uid:u.uid,col:n=>fs.collection(n),doc:p=>fs.doc(p),ts:()=>firebase.firestore.FieldValue.serverTimestamp(),newId:n=>fs.collection(n).doc().id}}
  else{const db=await B.getDb();S={kind:"local",uid:B.me,col:n=>db.collection(n),doc:p=>db.doc(p),ts:()=>Date.now(),newId:()=>B.newId()}}
  return S}
const put=(p,d,o)=>quick(o?S.doc(p).set(d,o):S.doc(p).set(d));
const upd=(p,d)=>quick(S.doc(p).update(d));

/* ---------- 2. état ---------- */
let noAccess=false,cfg={...DEF},me=null,piece=null,cguOpen=false,pieceOpen=false,boutiques={},openB=null,ficheOpen=false,annonces=[],mesAnnonces=[],recues=[],passees=[],paiements=[];
let flashT=0,flash="",mode="acheter",cat="",q="",ville="",open=null,editA=null,formOpen=false,started=false;
const subs=[];
function listen(){if(started)return;started=true;
  store().then(s=>{
    const err=e=>{console.warn("marché",e);if(e&&e.code==="permission-denied"&&!noAccess){noAccess=true;render()}};
    subs.push(s.doc("marche_config/global").onSnapshot(d=>{cfg={...DEF,...(d.exists?d.data():{})};render()},err));
    subs.push(s.doc("marche_vendeurs/"+s.uid).onSnapshot(d=>{me=d.exists?d.data():null;render()},err));
    subs.push(s.doc("marche_pieces/"+s.uid).onSnapshot(d=>{piece=d.exists?d.data():null;render()},err));
    subs.push(s.col("marche_boutiques").limit(1000).onSnapshot(x=>{boutiques={};x.docs.forEach(d=>boutiques[d.id]=d.data());render()},err));
    subs.push(s.col("marche_annonces").where("statut","==","actif").limit(500).onSnapshot(x=>{annonces=x.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>ms(b.creeLe)-ms(a.creeLe));render()},err));
    subs.push(s.col("marche_annonces").where("vendeur","==",s.uid).onSnapshot(x=>{mesAnnonces=x.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>ms(b.creeLe)-ms(a.creeLe));render()},err));
    subs.push(s.col("marche_commandes").where("vendeur","==",s.uid).onSnapshot(x=>{recues=x.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>ms(b.creeLe)-ms(a.creeLe));render();badge()},err));
    subs.push(s.col("marche_commandes").where("acheteur","==",s.uid).onSnapshot(x=>{passees=x.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>ms(b.creeLe)-ms(a.creeLe));render()},err));
    subs.push(s.col("marche_paiements").where("vendeur","==",s.uid).onSnapshot(x=>{paiements=x.docs.map(d=>({id:d.id,...d.data()}));render()},err));
  }).catch(e=>{console.warn(e);const V=$("v-marche");if(V){V.querySelector("#m-body").innerHTML="";V.querySelector("#m-body").append(el("p","msg err","Le marché a besoin d'internet pour s'ouvrir la première fois. Connectez-vous puis revenez."))}})}
function badge(){const t=$("tab-marche");if(!t)return;const n=recues.filter(c=>c.statut==="demande").length;let b=t.querySelector(".m-badge");
  if(!n){if(b)b.remove();return}if(!b){b=el("span","m-badge");t.append(b)}b.textContent=n>9?"9+":String(n)}

/* ---------- 3. calculs vendeur ---------- */
const isSeller=()=>!!me&&me.statut==="actif";
const taux=()=>me&&me.taux!=null?Number(me.taux):Number(cfg.taux)||0;
function compte(){const v=recues.filter(c=>c.statut==="vendue");const ventes=v.reduce((p,c)=>p+(Number(c.total)||0),0);const com=v.reduce((p,c)=>p+(Number(c.commission)||0),0);
  const paye=paiements.reduce((p,x)=>p+(Number(x.montant)||0),0);const m=today().slice(0,7);
  const mois=v.filter(c=>new Date(ms(c.venduLe)||ms(c.majLe)).toISOString().slice(0,7)===m);
  return {nb:v.length,ventes,com,paye,reste:Math.max(0,com-paye),moisV:mois.reduce((p,c)=>p+(Number(c.total)||0),0),moisN:mois.length}}

/* ---------- 4. affichage ---------- */
function render(){try{const sh=$("x-set");if(sh&&!sh.hidden)renderSetM()}catch(e){}const V=$("v-marche");if(!V||V.hidden)return;
  const seg=$("m-seg");seg.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.m===mode));
  const nNew=recues.filter(c=>c.statut==="demande").length;const vb=seg.querySelector('[data-m="vendre"]');vb.textContent=nNew?`Vendre (${nNew})`:"Vendre";
  const Bd=$("m-body");const keepY=window.scrollY;Bd.innerHTML="";
  /* règles Firebase du Marché pas encore publiées, ou accès retiré : message clair au lieu d'erreurs */
  if(noAccess){const c=el("section","card");c.append(el("h2","sec","Marché B2A"),el("p","note","Le Marché ouvre très bientôt. Revenez dans quelques instants."));Bd.append(c);return}
  if(mode==="acheter")renderBuy(Bd);else if(mode==="vendre")renderSell(Bd);else renderMine(Bd);
  window.scrollTo(0,keepY)}

/* --- acheter : les acheteurs voient seulement les produits en vente et la fiche publique du vendeur --- */
const enVente=()=>annonces.filter(a=>a.statut==="actif"&&!(a.qte!=null&&Number(a.qte)<=0));
const shop=a=>boutiques[a.vendeur]||{nom:a.vendeurNom,tel:a.vendeurTel,ville:a.ville};
function renderBuy(Bd){
  if(openB){Bd.append(shopView(openB));return}
  if(open){const a=annonces.find(x=>x.id===open)||mesAnnonces.find(x=>x.id===open);if(a){Bd.append(detail(a));return}open=null}
  const f=el("section","card m-filters");const s=el("input");s.type="search";s.placeholder="Rechercher : œufs, maïs, poussins…";s.value=q;s.setAttribute("aria-label","Rechercher");
  s.oninput=()=>{q=s.value;renderList(L)};const v=el("input");v.type="search";v.placeholder="Ville";v.value=ville;v.setAttribute("aria-label","Ville");v.style.maxWidth="160px";v.oninput=()=>{ville=v.value;renderList(L)};
  const r=el("div","row");r.append(s,v);f.append(r);
  const ch=el("div","m-chips");[["","Tout"],...CATS].forEach(([k,n])=>{const b=el("button","chip",n);b.type="button";b.setAttribute("aria-pressed",cat===k);b.onclick=()=>{cat=k;ch.querySelectorAll(".chip").forEach(x=>x.setAttribute("aria-pressed",x===b));renderList(L)};ch.append(b)});
  f.append(ch);const L=el("div","m-grid");f.append(L);Bd.append(f);renderList(L)}
function renderList(L){L.innerHTML="";const qq=q.trim().toLowerCase(),vv=ville.trim().toLowerCase();
  const list=enVente().filter(a=>(!cat||a.cat===cat)&&(!qq||[a.titre,a.desc,CN(a.cat),a.vendeurNom].join(" ").toLowerCase().includes(qq))&&(!vv||String(a.ville||"").toLowerCase().includes(vv)));
  if(!list.length){const e=el("div","empty");e.append(el("strong",null,annonces.length?"Aucun produit ne correspond":"Aucun produit en vente pour l'instant"),el("span",null,annonces.length?"Changez la recherche ou la catégorie.":"Les annonces des éleveurs et agriculteurs apparaîtront ici."));L.append(e);return}
  list.forEach(a=>L.append(cardA(a)))}
function cardA(a,own){const b=el("button","m-card");b.type="button";const ph=el("div","m-ph");if(a.photo){const im=el("img");im.src=a.photo;im.alt="";im.loading="lazy";ph.append(im)}else ph.append(el("span",null,CN(a.cat).slice(0,1)));
  b.append(ph);const t=el("div","m-tx");t.append(notr(el("b",null,a.titre||"Produit")),el("span","m-price",fmt(a.prix)+" F / "+(a.unite||"unité")),
    el("small",null,[a.qte!=null?fmt(a.qte)+" disponible(s)":null,a.ville].filter(Boolean).join(" · ")));
  if(!own)t.append(notr(el("small","m-sell",a.vendeurNom||"")));else t.append(el("span","pill s-"+(a.statut==="actif"?"ok":"warn"),a.statut==="actif"?"En vente":a.statut==="epuise"?"Épuisé":"Retiré"));
  b.append(t);b.onclick=()=>{open=a.id;openB=null;mode=own?"vendre":"acheter";render();window.scrollTo(0,0)};return b}
function detail(a){const own=S&&a.vendeur===S.uid;const c=el("div","card m-det");const bk=el("button","back","‹ Retour aux produits");bk.type="button";bk.onclick=()=>{open=null;render()};c.append(bk);
  if(a.photo){const im=el("img","m-big");im.src=a.photo;im.alt=a.titre||"";c.append(im)}
  c.append(notr(el("h2","sec",a.titre||"Produit")),el("div","m-price big",fmt(a.prix)+" F / "+(a.unite||"unité")));
  const info=[["Catégorie",CN(a.cat)],["Disponible",a.qte!=null?fmt(a.qte)+" "+(a.unite||""):"—"],["Lieu de retrait",a.ville],["Publié le",fd(a.creeLe)]].filter(x=>x[1]);
  const dl=el("dl","cu-info");info.forEach(([k,v])=>{dl.append(el("dt",null,k));dl.append(notr(el("dd",null,String(v))))});c.append(dl);
  if(a.desc)c.append(notr(el("p",null,a.desc)));
  if(own){c.append(el("p","note","C'est votre annonce. Modifiez-la dans « Vendre »."));return c}
  const sh=shop(a);const ph=tel226(sh.tel||a.vendeurTel);
  c.append(sellerBox(a.vendeur,sh,`Bonjour, je suis intéressé(e) par « ${a.titre} » vu sur le Marché B2A Smart Farming.`,true));
  /* commande */
  c.append(el("h3","sec","Commander"));const g=el("div","grid2");const fld=(lab,inp)=>{const f=el("div","field");const l=el("label",null,lab);inp.id="m-o-"+Math.random().toString(36).slice(2,7);l.htmlFor=inp.id;f.append(l,inp);g.append(f);return inp};
  const qt=fld(`Quantité (${a.unite||"unité"})`,Object.assign(el("input"),{type:"number",inputMode:"decimal",min:"0",value:"1"}));
  const nm=fld("Votre nom",Object.assign(el("input"),{type:"text",value:B.lsGet(B.LS_NAME)||"",maxLength:60}));
  const tl=fld("Votre téléphone",Object.assign(el("input"),{type:"tel",value:B.lsGet("b2a-m-tel")||"",placeholder:"ex. 70 12 34 56"}));
  const vl=fld("Votre ville",Object.assign(el("input"),{type:"text",value:B.lsGet("b2a-m-ville")||"",maxLength:60}));
  const nt=fld("Message (facultatif)",Object.assign(el("input"),{type:"text",placeholder:"ex. livraison samedi matin",maxLength:200}));
  c.append(g);const tot=el("p","m-total");const upT=()=>{tot.textContent="Total : "+fmt((N(qt.value)||0)*(Number(a.prix)||0))+" F"};qt.oninput=upT;upT();c.append(tot);
  const m=el("p","msg");const go=el("button","btn","Envoyer la commande");go.type="button";c.append(go,m);
  c.append(el("p","note","Le paiement se fait directement avec le vendeur (espèces, Orange Money, Moov Money) à la livraison ou selon votre accord."));
  go.onclick=async()=>{const n=N(qt.value);const bad=x=>{m.textContent=x;m.className="msg err"};
    if(!(n>0))return bad("Indiquez la quantité.");if(a.qte!=null&&n>a.qte)return bad(`Il n'en reste que ${fmt(a.qte)}.`);
    if(!nm.value.trim())return bad("Indiquez votre nom.");if(String(tl.value).replace(/\D/g,"").length<8)return bad("Indiquez votre numéro de téléphone.");
    B.lsSet("b2a-m-tel",tl.value.trim());B.lsSet("b2a-m-ville",vl.value.trim());
    const d={annonce:a.id,titre:a.titre||"",vendeur:a.vendeur,vendeurNom:sh.nom||a.vendeurNom||"",vendeurTel:sh.tel||a.vendeurTel||"",acheteur:S.uid,acheteurNom:nm.value.trim(),acheteurTel:tl.value.trim(),acheteurVille:vl.value.trim(),
      qte:n,unite:a.unite||"",prix:Number(a.prix)||0,total:Math.round(n*(Number(a.prix)||0)),statut:"demande",note:nt.value.trim(),creeLe:S.ts(),majLe:S.ts()};
    go.disabled=true;try{await put("marche_commandes/"+S.newId("marche_commandes"),d);flashT=Date.now()+15000;flash=`Commande envoyée à ${a.vendeurNom||"au vendeur"} : ${fmt(n)} ${a.unite||""} de « ${a.titre} » (${fmt(d.total)} F). Le vendeur va vous contacter.`;open=null;mode="mes";render();window.scrollTo(0,0);
      if(ph)window.open("https://wa.me/"+ph+"?text="+encodeURIComponent(`Bonjour ${a.vendeurNom||""}, je viens de commander sur le Marché B2A : ${fmt(n)} ${a.unite||""} de « ${a.titre} » (total ${fmt(d.total)} F). ${d.acheteurNom}, ${d.acheteurTel}${d.acheteurVille?", "+d.acheteurVille:""}.${d.note?" "+d.note:""}`),"_blank")}
    catch(e){console.warn(e);go.disabled=false;bad("La commande n'a pas pu être envoyée. Vérifiez la connexion.")}};
  return c}

/* fiche publique de l'entreprise : nom, activité, lieu, horaires, présentation et contact. Rien d'autre. */
function sellerBox(uid,sh,msg,link){const w=el("div","m-shop");const h=el("div","m-shop-h");const av=el("span","m-av",(sh.nom||"?").trim().slice(0,1).toUpperCase());
  const t=el("div");t.append(el("span","label","Vendu par"),notr(el("b",null,sh.nom||"Vendeur")));if(sh.verifie)t.append(el("span","m-ok","✓ Vendeur vérifié"));if(sh.activite)t.append(notr(el("small",null,sh.activite)));h.append(av,t);w.append(h);
  const info=[["Lieu",[sh.quartier,sh.ville].filter(Boolean).join(", ")],["Horaires",sh.horaires],["Téléphone",sh.tel]].filter(x=>x[1]);
  if(info.length){const dl=el("dl","cu-info");info.forEach(([k,v])=>{dl.append(el("dt",null,k));dl.append(notr(el("dd",null,String(v))))});w.append(dl)}
  if(sh.desc)w.append(notr(el("p","note",sh.desc)));
  const r=el("div","row");const ph=tel226(sh.tel);
  if(ph){const wa=el("a","btn small","WhatsApp");wa.href="https://wa.me/"+ph+"?text="+encodeURIComponent(msg||"Bonjour, je vous contacte depuis le Marché B2A Smart Farming.");wa.target="_blank";wa.rel="noopener";
    const tl=el("a","btn small ghost","Appeler");tl.href="tel:+"+ph;r.append(wa,tl)}
  if(link){const n=enVente().filter(x=>x.vendeur===uid).length;const b=el("button","btn small ghost",`Voir ses produits (${n})`);b.type="button";b.onclick=()=>{openB=uid;open=null;render();window.scrollTo(0,0)};r.append(b)}
  w.append(r);return w}
function shopView(uid){const list=enVente().filter(a=>a.vendeur===uid);const sh=boutiques[uid]||(list[0]?shop(list[0]):{nom:"Vendeur"});
  const c=el("section","card");const bk=el("button","back","‹ Retour aux produits");bk.type="button";bk.onclick=()=>{openB=null;render()};c.append(bk);
  c.append(sellerBox(uid,sh,null,false));c.append(el("h3","sec",`Produits en vente (${list.length})`));
  if(!list.length)c.append(el("p","note","Aucun produit en vente pour le moment."));const G=el("div","m-grid");list.forEach(a=>G.append(cardA(a)));c.append(G);return c}

/* --- vendre --- */
function renderSell(Bd){
  if(!isSeller()){Bd.append(becomeSeller());return}
  if(!cguOk()){Bd.append(cguRenew());return}
  if(formOpen){Bd.append(annForm());return}
  if(ficheOpen){Bd.append(ficheForm());return}
  if(open){const a=mesAnnonces.find(x=>x.id===open);if(a){Bd.append(detail(a));return}open=null}
  const C=compte();const K=el("div","kpis");
  K.append(A.kpi("Annonces en vente",String(mesAnnonces.filter(a=>a.statut==="actif").length),mesAnnonces.length+" au total"),
    A.kpi("Commandes à traiter",String(recues.filter(c=>c.statut==="demande"||c.statut==="acceptee").length),recues.filter(c=>c.statut==="demande").length+" nouvelle(s)"),
    A.kpi("Ventes du mois",fmt(C.moisV)+" F",C.moisN+" vente(s)"),
    A.kpi("Ventes totales",fmt(C.ventes)+" F",C.nb+" vente(s) conclue(s)"));
  Bd.append(K);
  /* commandes reçues */
  const C1=el("section","card");Bd.append(C1);C1.append(el("h2","sec","Commandes reçues"));const act=recues.filter(c=>c.statut==="demande"||c.statut==="acceptee"),old=recues.filter(c=>c.statut!=="demande"&&c.statut!=="acceptee");
  if(!act.length)C1.append(el("p","note","Aucune commande en attente."));act.forEach(c=>C1.append(orderCard(c,"vendeur")));
  if(old.length){const d=el("details","box");d.append(el("summary",null,`Historique (${old.length})`));const dw=el("div","m-hist");old.slice(0,50).forEach(c=>dw.append(orderCard(c,"vendeur")));d.append(dw);C1.append(d)}
  /* annonces */
  const C2=el("section","card");Bd.append(C2);const h=el("div","row between");h.append(el("h2","sec","Mes annonces"));const nb=el("button","btn small","+ Nouvelle annonce");nb.type="button";nb.onclick=()=>{editA=null;formOpen=true;render();window.scrollTo(0,0)};h.append(nb);C2.append(h);
  if(!mesAnnonces.length)C2.append(el("p","note","Publiez votre premier produit : il sera visible tout de suite par tous les utilisateurs de l'application."));
  const G=el("div","m-grid");mesAnnonces.forEach(a=>{const w=el("div","m-own");w.append(cardA(a,true));const r=el("div","row");
    const e=el("button","btn small ghost","Modifier");e.type="button";e.onclick=()=>{editA=a;formOpen=true;render();window.scrollTo(0,0)};r.append(e);
    if(a.statut==="actif"){const x=el("button","btn small ghost","Retirer");x.type="button";x.onclick=()=>upd("marche_annonces/"+a.id,{statut:"retire",majLe:S.ts()});r.append(x)}
    else{const x=el("button","btn small ghost","Remettre en vente");x.type="button";x.onclick=()=>upd("marche_annonces/"+a.id,{statut:"actif",majLe:S.ts()});r.append(x)}
    w.append(r);G.append(w)});C2.append(G);
  /* vérification de l'identité */
  if(pieceOpen||!piece||piece.statut!=="validee")Bd.append(pieceStatus());
  /* fiche publique */
  const C3=el("section","card");Bd.append(C3);const h3=el("div","row between");h3.append(el("h2","sec","Ma fiche entreprise"));const fe=el("button","btn small ghost","Modifier");fe.type="button";fe.onclick=()=>{ficheOpen=true;render();window.scrollTo(0,0)};h3.append(fe);C3.append(h3);
  C3.append(el("p","note","Voici ce que voient les acheteurs : vos produits en vente et cette fiche."));
  C3.append(sellerBox(S.uid,boutiques[S.uid]||{nom:me.nom,tel:me.tel,ville:me.ville},null,false));
  const pv=el("p","msg good m-priv","Vos lots, saisies, effectifs, aliment, ventes, factures, dépenses et commissions restent privés : aucun acheteur ne peut les voir.");C3.append(pv);
}
function ficheForm(){const b=boutiques[S.uid]||{nom:me.nom,tel:me.tel,ville:me.ville};const c=el("section","card");const bk=el("button","back","‹ Annuler");bk.type="button";bk.onclick=()=>{ficheOpen=false;render()};c.append(bk);
  c.append(el("h2","sec","Ma fiche entreprise"),el("p","note","Informations publiques, visibles par les acheteurs. N'y mettez rien de confidentiel."));
  const g=el("div","grid2");const fld=(lab,val,ph,max,type)=>{const f=el("div","field");const l=el("label",null,lab);const i=el("input");i.type=type||"text";i.id="m-f-"+Math.random().toString(36).slice(2,7);l.htmlFor=i.id;i.value=val||"";if(ph)i.placeholder=ph;i.maxLength=max||60;f.append(l,i);g.append(f);return i};
  const n=fld("Nom de l'entreprise",b.nom,"ex. B2A Élevage Bayere"),ac=fld("Activité",b.activite,"ex. Élevage de poules pondeuses"),t=fld("Téléphone / WhatsApp",b.tel,"ex. 70 12 34 56",30,"tel"),
    v=fld("Ville",b.ville,"ex. Ouagadougou"),qu=fld("Quartier ou village (facultatif)",b.quartier,"ex. Kouli"),ho=fld("Horaires (facultatif)",b.horaires,"ex. Lundi–samedi, 7 h–18 h");
  const fd2=el("div","field");const ld=el("label",null,"Présentation (facultatif)");const ds=el("textarea");ds.id="m-f-desc";ld.htmlFor=ds.id;ds.rows=3;ds.maxLength=400;ds.value=b.desc||"";ds.placeholder="ex. Œufs frais chaque jour, livraison à Ouagadougou";fd2.append(ld,ds);g.append(fd2);c.append(g);
  const m=el("p","msg");const sv=el("button","btn","Enregistrer ma fiche");sv.type="button";c.append(sv,m);
  sv.onclick=async()=>{const bad=x=>{m.textContent=x;m.className="msg err"};if(!n.value.trim())return bad("Indiquez le nom.");if(String(t.value).replace(/\D/g,"").length<8)return bad("Indiquez le téléphone.");if(!v.value.trim())return bad("Indiquez la ville.");
    sv.disabled=true;try{await saveShop({nom:n.value.trim(),activite:ac.value.trim(),tel:t.value.trim(),ville:v.value.trim(),quartier:qu.value.trim(),horaires:ho.value.trim(),desc:ds.value.trim()});ficheOpen=false;render()}
    catch(e){console.warn(e);sv.disabled=false;bad("Échec de l'enregistrement. Vérifiez la connexion.")}};return c}
async function saveShop(d){const body={...d,majLe:S.ts()};await put("marche_boutiques/"+S.uid,body,{merge:true});if(S.kind==="local"){boutiques[S.uid]={...(boutiques[S.uid]||{}),...body}}
  /* garder le nom et le contact à jour sur les annonces */
  for(const a of mesAnnonces){if(a.vendeurNom!==d.nom||a.vendeurTel!==d.tel)await upd("marche_annonces/"+a.id,{vendeurNom:d.nom,vendeurTel:d.tel,majLe:S.ts()})}}
/* ---------- conditions d'utilisation et pièce d'identité ---------- */
const CGU=()=>window.B2A_CGU||{VERSION:"0",TITRE:"Conditions d'utilisation",TEXTE:[]};
const cguOk=()=>!!me&&me.cgu===CGU().VERSION;
/* boîte de lecture des conditions ; onRead() est appelé quand la personne a tout lu (fin du texte atteinte) */
function cguBox(onRead){const w=el("div","m-cgu");const h=el("b",null,CGU().TITRE);const box=el("div","m-cgu-txt");box.tabIndex=0;box.setAttribute("aria-label",CGU().TITRE);
  CGU().TEXTE.forEach(([t,p])=>{box.append(el("h4",null,t),el("p",null,p.replace(/\{TAUX\}/g,fmt(Number(me&&me.taux!=null?me.taux:cfg.taux)||0,1))))});
  box.append(el("p","m-cgu-end",`Version ${CGU().VERSION} · B2A-HIGH-TECHNOLOGY-AUTOMATION`));
  const hint=el("small","m-cgu-hint","Faites défiler jusqu'à la fin pour pouvoir accepter.");let done=false;
  const chk=()=>{if(!done&&box.scrollTop+box.clientHeight>=box.scrollHeight-24){done=true;hint.textContent="Vous avez lu les conditions jusqu'au bout.";hint.className="m-cgu-hint ok";onRead&&onRead()}};
  box.addEventListener("scroll",chk);setTimeout(chk,300);w.append(h,box,hint);return w}
function cguAccept(lbl,onChange){const lb=el("label","m-check");const ck=el("input");ck.type="checkbox";ck.disabled=true;lb.append(ck,document.createTextNode(" "+lbl));lb.classList.add("off");
  ck.onchange=()=>onChange&&onChange(ck.checked);return {lb,ck,enable:()=>{ck.disabled=false;lb.classList.remove("off")}}}
/* champs de la pièce : particulier (CNIB) ou entreprise (RCCM + IFU), avec photo du document */
function pieceFields(c,p){p=p||{};const st={type:p.type||"cnib",photo:p.photo||""};
  c.append(el("h3","sec","Pièce justificative"));c.append(el("p","note","Elle reste privée : seul B2A la voit, pour vérifier le vendeur. Une fois validée, votre boutique affiche « Vendeur vérifié »."));
  const sg=el("div","seg");const b1=el("button",null,"Particulier (CNIB)"),b2=el("button",null,"Entreprise (RCCM / IFU)");[b1,b2].forEach(b=>b.type="button");sg.append(b1,b2);c.append(sg);
  const g=el("div","grid2");c.append(g);const fld=(lab,val,ph,max)=>{const f=el("div","field");const l=el("label",null,lab);const i=el("input");i.type="text";i.id="m-p-"+Math.random().toString(36).slice(2,7);l.htmlFor=i.id;i.value=val||"";if(ph)i.placeholder=ph;i.maxLength=max||40;i.autocomplete="off";f.append(l,i);g.append(f);return [f,i]};
  const [fT,tit]=fld("Nom du titulaire (comme sur la pièce)",p.titulaire,"ex. OUÉDRAOGO Moussa",80);
  const [fC,cn]=fld("Numéro de la CNIB",p.cnib,"ex. B12345678");const [fR,rc]=fld("Numéro RCCM",p.rccm,"ex. BF-OUA-01-2024-B12-00123");const [fI,ifu]=fld("Numéro IFU",p.ifu,"ex. 00123456X");
  const pw=el("div","m-photo");const pv=el("div","m-ph m-doc");const setPv=()=>{pv.innerHTML="";if(st.photo){const im=el("img");im.src=st.photo;im.alt="";pv.append(im)}else pv.append(el("span",null,"Photo"))};setPv();
  const fi=el("input");fi.type="file";fi.accept="image/*";fi.id="m-p-photo"+Math.random().toString(36).slice(2,6);fi.hidden=true;const fl=el("label","btn small ghost","Photo de la pièce");fl.htmlFor=fi.id;
  const lbl=el("small","note");const r=el("div");r.style.cssText="display:grid;gap:6px";r.append(fl,fi,lbl);pw.append(pv,r);c.append(pw);
  fi.onchange=async()=>{const f=fi.files[0];if(!f)return;try{st.photo=await compress(f,1000,300000);setPv()}catch(e){}fi.value=""};
  const sync=()=>{const ent=st.type==="entreprise";b1.setAttribute("aria-pressed",!ent);b2.setAttribute("aria-pressed",ent);fC.hidden=ent;fR.hidden=!ent;fI.hidden=!ent;
    fT.querySelector("label").textContent=ent?"Nom de l'entreprise (comme sur le RCCM)":"Nom du titulaire (comme sur la pièce)";
    lbl.textContent=ent?"Photo lisible de l'extrait RCCM ou de l'attestation IFU.":"Photo lisible du recto de la CNIB."};
  b1.onclick=()=>{st.type="cnib";sync()};b2.onclick=()=>{st.type="entreprise";sync()};sync();
  return {check:()=>{const ent=st.type==="entreprise";if(!tit.value.trim())return "Indiquez le nom du titulaire de la pièce.";
      if(!ent&&!/^[A-Za-z0-9 -]{6,20}$/.test(cn.value.trim()))return "Indiquez le numéro de la CNIB.";
      if(ent&&rc.value.trim().length<6)return "Indiquez le numéro RCCM.";if(ent&&!/^[A-Za-z0-9 -]{6,20}$/.test(ifu.value.trim()))return "Indiquez le numéro IFU.";
      if(!st.photo)return "Ajoutez la photo de la pièce.";return ""},
    data:()=>{const ent=st.type==="entreprise";return {type:st.type,titulaire:tit.value.trim(),cnib:ent?"":cn.value.trim().toUpperCase(),rccm:ent?rc.value.trim().toUpperCase():"",ifu:ent?ifu.value.trim().toUpperCase():"",photo:st.photo,statut:"attente",motif:"",envoyeLe:S.ts()}}}}
function becomeSeller(){const c=el("section","card m-join");c.append(el("h2","sec","Vendez vos produits sur le Marché B2A"));
  const ul=el("ul","plain");["Publiez vos œufs, animaux, poussins, aliment, plants, récoltes… : visibles tout de suite par tous les utilisateurs de B2A Smart Farming.",
    "Les clients commandent dans l'application ou vous écrivent sur WhatsApp ; vous êtes payé directement (espèces, Orange Money, Moov Money).",
    "Vous ne payez rien pour publier : une petite commission seulement sur les ventes conclues (voir les conditions ci-dessous).","Vos lots se transforment en annonce en un geste (œufs, réformes, récoltes…)."].forEach(t=>ul.append(el("li",null,t)));c.append(ul);
  c.append(el("h3","sec","Votre boutique"));
  const g=el("div","grid2");const fld=(id,lab,type,val,ph)=>{const f=el("div","field");const l=el("label",null,lab);l.htmlFor=id;const i=el("input");i.type=type;i.id=id;i.value=val||"";if(ph)i.placeholder=ph;i.maxLength=60;f.append(l,i);g.append(f);return i};
  const n=fld("m-j-nom","Nom de la boutique ou de la ferme","text",B.lsGet(B.LS_NAME)||"","ex. B2A Élevage Bayere");const t=fld("m-j-tel","Numéro WhatsApp","tel",B.lsGet("b2a-m-tel")||"","ex. 70 12 34 56");
  const v=fld("m-j-ville","Ville","text",B.lsGet("b2a-m-ville")||"","ex. Ouagadougou");const ac=fld("m-j-act","Activité","text","","ex. Élevage de poules pondeuses");c.append(g);
  c.append(el("p","note","Les acheteurs verront seulement vos produits en vente et votre fiche entreprise (nom, activité, ville, contact). Vos lots, chiffres, ventes et votre pièce d'identité restent privés."));
  const P=pieceFields(c,null);
  c.append(el("h3","sec","Conditions d'utilisation"));
  const acc=cguAccept(`J'ai lu et j'accepte les conditions d'utilisation du Marché B2A (version ${CGU().VERSION}), dont la commission de ${fmt(Number(cfg.taux)||0,1)} % sur chaque vente conclue.`);
  c.append(cguBox(acc.enable),acc.lb);
  const m=el("p","msg");const b=el("button","btn","Ouvrir ma boutique");b.type="button";c.append(b,m);
  b.onclick=async()=>{const bad=x=>{m.textContent=x;m.className="msg err"};if(!n.value.trim())return bad("Indiquez le nom de votre boutique.");if(String(t.value).replace(/\D/g,"").length<8)return bad("Indiquez votre numéro WhatsApp.");
    if(!v.value.trim())return bad("Indiquez votre ville.");const pe=P.check();if(pe)return bad(pe);
    if(acc.ck.disabled)return bad("Lisez les conditions d'utilisation jusqu'au bout.");if(!acc.ck.checked)return bad("Cochez l'acceptation des conditions d'utilisation.");
    B.lsSet("b2a-m-tel",t.value.trim());B.lsSet("b2a-m-ville",v.value.trim());b.disabled=true;b.textContent="Ouverture…";
    try{await put("marche_vendeurs/"+S.uid,{statut:"actif",nom:n.value.trim(),tel:t.value.trim(),ville:v.value.trim(),taux:Number(cfg.taux)||0,accepteLe:S.ts(),cgu:CGU().VERSION,cguLe:S.ts()});
      await put("marche_pieces/"+S.uid,P.data());
      await saveShop({nom:n.value.trim(),activite:ac.value.trim(),tel:t.value.trim(),ville:v.value.trim(),quartier:"",horaires:"",desc:""}).catch(()=>{});
      if(S.kind==="local"){me={statut:"actif",nom:n.value.trim(),tel:t.value.trim(),ville:v.value.trim(),taux:Number(cfg.taux)||0,cgu:CGU().VERSION};render()}}
    catch(e){console.warn(e);b.disabled=false;b.textContent="Ouvrir ma boutique";bad("L'ouverture a échoué. Vérifiez la connexion.")}};
  return c}
/* nouvelle version des conditions à accepter */
function cguRenew(){const c=el("section","card m-join");c.append(el("h2","sec","Nouvelles conditions d'utilisation"));
  c.append(el("p","note","B2A a mis à jour les conditions du Marché. Lisez-les et acceptez-les pour continuer à vendre."));
  const acc=cguAccept(`J'ai lu et j'accepte les conditions d'utilisation du Marché B2A (version ${CGU().VERSION}).`);c.append(cguBox(acc.enable),acc.lb);
  const m=el("p","msg");const b=el("button","btn","Accepter et continuer");b.type="button";c.append(b,m);
  b.onclick=async()=>{if(!acc.ck.checked){m.textContent=acc.ck.disabled?"Lisez les conditions jusqu'au bout.":"Cochez l'acceptation.";m.className="msg err";return}
    b.disabled=true;try{await upd("marche_vendeurs/"+S.uid,{cgu:CGU().VERSION,cguLe:S.ts()});if(S.kind==="local"){me={...me,cgu:CGU().VERSION};render()}}catch(e){b.disabled=false}};return c}
/* statut de la pièce dans l'espace vendeur */
function pieceStatus(){const c=el("section","card");
  if(pieceOpen||!piece){c.append(el("h2","sec",piece?"Envoyer une nouvelle pièce":"Pièce justificative à envoyer"));
    if(piece&&piece.statut==="refusee"&&piece.motif)c.append(el("p","msg err","Motif du refus : "+piece.motif));
    const P=pieceFields(c,piece&&piece.statut==="refusee"?{...piece,photo:""}:piece);const m=el("p","msg");const b=el("button","btn","Envoyer la pièce");b.type="button";c.append(b,m);
    if(piece){const x=el("button","btn ghost","Annuler");x.type="button";x.onclick=()=>{pieceOpen=false;render()};c.append(x)}
    b.onclick=async()=>{const pe=P.check();if(pe){m.textContent=pe;m.className="msg err";return}b.disabled=true;
      try{await put("marche_pieces/"+S.uid,P.data());if(S.kind==="local")piece=P.data();pieceOpen=false;render()}catch(e){b.disabled=false;m.textContent="Échec de l'envoi. Vérifiez la connexion.";m.className="msg err"}};return c}
  const st=piece.statut;const lab={attente:["Pièce en cours de vérification par B2A","warn"],validee:["✓ Vendeur vérifié : votre pièce a été validée","ok"],refusee:["Pièce refusée : envoyez une nouvelle pièce","bad"]}[st]||["Pièce envoyée","warn"];
  const top=el("div","row between");top.append(el("h2","sec","Vérification"),el("span","pill s-"+lab[1],st==="validee"?"Vérifié":st==="refusee"?"Refusée":"En attente"));c.append(top);
  c.append(el("p","note",lab[0]+(piece.type==="entreprise"?" (RCCM / IFU).":" (CNIB).")));if(st==="refusee"&&piece.motif)c.append(el("p","msg err","Motif : "+piece.motif));
  if(st!=="validee"){const b=el("button","btn small ghost",st==="refusee"?"Envoyer une nouvelle pièce":"Remplacer la pièce");b.type="button";b.onclick=()=>{pieceOpen=true;render()};c.append(b)}
  return c}
/* proposer une annonce à partir d'un lot */
function fromLot(l){const C=window.B2A_CULT;
  if(A.isCrop&&A.isCrop(l)){const c=C&&C.crops[l.culture];return {cat:c&&c.g==="arbre"?"recoltes":"recoltes",titre:(l.espece||"Récolte")+(l.variete?" "+l.variete:""),unite:"kg",prix:Number(l.prixVente)||(c?c.prix:null)}}
  const e=l.espece||"";
  if(A.isLayer(l))return {cat:"oeufs",titre:"Œufs frais"+(l.race?" ("+l.race+")":""),unite:"plateau de 30",prix:Number(l.prixOeuf)?Math.round(Number(l.prixOeuf)*30):null};
  if(A.isDairy(l))return {cat:"lait",titre:"Lait frais",unite:"litre",prix:Number(l.prixOeuf)||null};
  if(/poulet|pintade/i.test(e))return {cat:"animaux",titre:e+(l.race?" "+l.race:""),unite:Number(l.prixKg)?"kg":"tête",prix:Number(l.prixKg)||Number(l.prixFin)||null};
  return {cat:"animaux",titre:e+(l.race?" "+l.race:""),unite:"tête",prix:Number(l.prixFin)||null}}
function annForm(){const a=editA||{};const c=el("section","card");const bk=el("button","back","‹ Annuler");bk.type="button";bk.onclick=()=>{formOpen=false;editA=null;render()};c.append(bk);
  c.append(el("h2","sec",editA?"Modifier l'annonce":"Nouvelle annonce"));
  const g=el("div","grid2");const fld=(lab,inp,help)=>{const f=el("div","field");const l=el("label",null,lab);inp.id="m-a-"+Math.random().toString(36).slice(2,7);l.htmlFor=inp.id;f.append(l,inp);if(help)f.append(el("small",null,help));g.append(f);return inp};
  const lots=A.lots();let ls=null;
  if(!editA&&lots.length){ls=el("select");ls.append(new Option("— Choisir un lot (facultatif) —",""));lots.forEach(l=>{const o=new Option(l.nom,l.id);o.setAttribute("data-notr","");ls.append(o)});fld("Remplir à partir d'un lot",ls,"Œufs, réformes, animaux, récolte…")}
  const ct=el("select");CATS.forEach(([k,n])=>ct.append(new Option(n,k)));ct.value=a.cat||"oeufs";fld("Catégorie",ct);
  const ti=fld("Titre",Object.assign(el("input"),{type:"text",value:a.titre||"",maxLength:80,placeholder:"ex. Œufs frais ISA Brown"}));
  const pr=fld("Prix (FCFA)",Object.assign(el("input"),{type:"number",inputMode:"decimal",min:"0",value:a.prix??""}));
  const un=el("select");UNITS.forEach(u=>un.append(new Option(u,u)));if(a.unite&&!UNITS.includes(a.unite))un.append(new Option(a.unite,a.unite));un.value=a.unite||"plateau de 30";fld("Prix pour",un);
  const qt=fld("Quantité disponible",Object.assign(el("input"),{type:"number",inputMode:"decimal",min:"0",value:a.qte??""}),"Diminue toute seule à chaque vente");
  const vi=fld("Ville / lieu de retrait",Object.assign(el("input"),{type:"text",value:a.ville||me.ville||"",maxLength:60}));
  const ds=el("textarea");ds.rows=3;ds.maxLength=600;ds.value=a.desc||"";ds.placeholder="ex. Œufs ramassés chaque matin, livraison possible à Ouagadougou";fld("Description",ds);
  c.append(g);
  if(ls)ls.onchange=()=>{const l=lots.find(x=>x.id===ls.value);if(!l)return;const p=fromLot(l);ct.value=p.cat;ti.value=p.titre;if(p.prix)pr.value=p.prix;if(!UNITS.includes(p.unite))un.append(new Option(p.unite,p.unite));un.value=p.unite};
  /* photo */
  let photo=a.photo||"";const pw=el("div","m-photo");const pv=el("div","m-ph");const setPv=()=>{pv.innerHTML="";if(photo){const im=el("img");im.src=photo;im.alt="";pv.append(im)}else pv.append(el("span",null,"Photo"))};setPv();
  const fi=el("input");fi.type="file";fi.accept="image/*";fi.id="m-a-photo";fi.hidden=true;const fl=el("label","btn small ghost","Ajouter une photo");fl.htmlFor="m-a-photo";
  const rm=el("button","btn small ghost","Enlever");rm.type="button";rm.onclick=()=>{photo="";setPv()};
  fi.onchange=async()=>{const f=fi.files[0];if(!f)return;try{photo=await compress(f);setPv()}catch(e){m.textContent="Photo non reconnue.";m.className="msg err"}fi.value=""};
  const pr2=el("div","row");pr2.append(fl,rm,fi);pw.append(pv,pr2);c.append(pw);
  const m=el("p","msg");const sv=el("button","btn",editA?"Enregistrer":"Publier l'annonce");sv.type="button";c.append(sv,m);
  sv.onclick=async()=>{const bad=x=>{m.textContent=x;m.className="msg err"};const p=N(pr.value),q2=N(qt.value);
    if(!ti.value.trim())return bad("Indiquez un titre.");if(!(p>0))return bad("Indiquez le prix.");if(q2!=null&&q2<0)return bad("Quantité invalide.");
    const bq=boutiques[S.uid]||me;const d={vendeur:S.uid,vendeurNom:bq.nom||me.nom||"",vendeurTel:bq.tel||me.tel||"",ville:vi.value.trim(),cat:ct.value,titre:ti.value.trim(),desc:ds.value.trim(),prix:p,unite:un.value,qte:q2,photo,
      statut:q2===0?"epuise":(editA?editA.statut==="retire"?"retire":"actif":"actif"),majLe:S.ts()};
    if(!editA)d.creeLe=S.ts();sv.disabled=true;
    try{const id=editA?editA.id:S.newId("marche_annonces");await (editA?upd("marche_annonces/"+id,d):put("marche_annonces/"+id,d));formOpen=false;editA=null;render()}
    catch(e){console.warn(e);sv.disabled=false;bad("L'annonce n'a pas pu être enregistrée. Vérifiez la connexion.")}};
  return c}
function compress(file,MX,LIM){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>{const M=MX||800,r=Math.min(1,M/Math.max(im.width,im.height));const cv=document.createElement("canvas");
  cv.width=Math.round(im.width*r);cv.height=Math.round(im.height*r);cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);let q=0.72,u=cv.toDataURL("image/jpeg",q);
  while(u.length>(LIM||350000)&&q>0.35){q-=0.1;u=cv.toDataURL("image/jpeg",q)}URL.revokeObjectURL(im.src);res(u)};im.onerror=rej;im.src=URL.createObjectURL(file)})}

/* --- commandes --- */
function orderCard(c,side){const w=el("div","m-order");const st=ST[c.statut]||ST.demande;
  const top=el("div","row between");top.append(notr(el("b",null,c.titre||"Produit")),el("span","pill s-"+st[1],st[0]));w.append(top);
  w.append(el("span",null,`${fmt(c.qte)} ${c.unite||""} × ${fmt(c.prix)} F = ${fmt(c.total)} F`));
  const who=side==="vendeur"?[c.acheteurNom,c.acheteurTel,c.acheteurVille]:[c.vendeurNom,c.vendeurTel];w.append(notr(el("small",null,who.filter(Boolean).join(" · ")+" · "+fd(c.creeLe))));
  if(c.note)w.append(notr(el("small","m-note","« "+c.note+" »")));
  const r=el("div","row");const ph=tel226(side==="vendeur"?c.acheteurTel:c.vendeurTel);
  if(ph){const wa=el("a","btn small ghost","WhatsApp");wa.href="https://wa.me/"+ph;wa.target="_blank";wa.rel="noopener";const tl=el("a","btn small ghost","Appeler");tl.href="tel:+"+ph;r.append(wa,tl)}
  const act=(t,cls,fn)=>{const b=el("button","btn small "+cls,t);b.type="button";b.onclick=async()=>{b.disabled=true;try{await fn()}catch(e){console.warn(e);b.disabled=false}};r.append(b)};
  const set=s=>upd("marche_commandes/"+c.id,{statut:s,majLe:S.ts()});
  if(side==="vendeur"){
    if(c.statut==="demande"){act("Accepter","",()=>set("acceptee"));act("Refuser","ghost",()=>set("refusee"))}
    if(c.statut==="acceptee")act("Vendu : livré et payé","",async()=>{const t=taux();const com=Math.round((Number(c.total)||0)*t/100);
      await upd("marche_commandes/"+c.id,{statut:"vendue",taux:t,commission:com,venduLe:S.ts(),majLe:S.ts()});
      const a=mesAnnonces.find(x=>x.id===c.annonce);if(a&&a.qte!=null){const left=Math.max(0,(Number(a.qte)||0)-(Number(c.qte)||0));await upd("marche_annonces/"+a.id,{qte:left,statut:left===0?"epuise":a.statut,majLe:S.ts()})}});
    if(c.statut==="acceptee")act("Annuler","ghost",()=>set("annulee"))}
  else if(c.statut==="demande")act("Annuler ma commande","ghost",()=>set("annulee"));
  w.append(r);return w}
function renderMine(Bd){if(flash&&Date.now()<flashT){Bd.append(el("p","msg good m-flash",flash))}const C=el("section","card");Bd.append(C);C.append(el("h2","sec","Mes commandes"));
  if(!passees.length){C.append(el("p","note","Vous n'avez encore rien commandé. Touchez « Acheter » pour voir les produits en vente."));return}
  passees.forEach(c=>C.append(orderCard(c,"acheteur")))}

/* ---------- 4 bis. commission : visible seulement dans Réglages, pour le vendeur ---------- */
function renderSetM(){const sh=$("x-set");if(!sh)return;let sec=$("m-set");
  if(!isSeller()){if(sec)sec.remove();return}
  if(!sec){sec=el("section","card");sec.id="m-set";const at=sh.querySelector("#x-acct")||sh.querySelector(".sheet-head");const host=sh.querySelector(".sheet-in");
    const after=[...host.children].find(x=>x.tagName==="SECTION");host.insertBefore(sec,after||null)}
  sec.innerHTML="";const C=compte();sec.append(el("h3","sec","Marché B2A : ma commission"));
  if(piece&&piece.statut==="validee")sec.append(el("p","msg good","✓ Vendeur vérifié"));
  sec.append(el("p","note",`Commission B2A : ${fmt(taux(),1)} % sur chaque vente conclue (déclarée « Vendu » dans le Marché).`));
  const K=el("div","kpis");K.append(A.kpi("Commission totale",fmt(C.com)+" F",C.nb+" vente(s)"),A.kpi("Déjà payé",fmt(C.paye)+" F"),A.kpi("Reste à payer",fmt(C.reste)+" F",null,C.reste>0?"down":null));sec.append(K);
  if(C.reste>0){sec.append(el("p","note",cfg.telPaiement?`Payez par Orange Money ou Moov Money au ${cfg.telPaiement} (${cfg.nomPaiement||"B2A"}), puis envoyez la preuve par WhatsApp : B2A enregistre le paiement.`:"B2A vous indiquera le numéro de paiement (Orange Money ou Moov Money)."));
    if(cfg.telPaiement){const w=el("a","btn small ghost","Envoyer la preuve par WhatsApp");w.href="https://wa.me/"+tel226(cfg.telPaiement)+"?text="+encodeURIComponent(`Bonjour B2A, je paie ma commission du Marché : ${fmt(C.reste)} F. Vendeur : ${me.nom||""} (${me.tel||""}).`);w.target="_blank";w.rel="noopener";sec.append(w)}}
  addCguLink(sec)}
function addCguLink(sec){const d=el("details","box");d.append(el("summary",null,"Lire les conditions d'utilisation du Marché"));d.append(cguBox());sec.append(d)}
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest(".gearbtn"))setTimeout(()=>{listen();renderSetM()},60)});

/* ---------- 5. onglet ---------- */
const V=$("v-marche");if(!V)return;
V.innerHTML=`<section class="card m-head"><div class="row between"><h2 class="sec">Marché B2A</h2><span class="note">Éleveurs et agriculteurs</span></div>
  <div class="seg3" id="m-seg" role="group" aria-label="Marché"><button type="button" data-m="acheter">Acheter</button><button type="button" data-m="vendre">Vendre</button><button type="button" data-m="mes">Mes commandes</button></div></section>
  <div id="m-body" style="display:grid;gap:14px"></div>`;
$("m-seg").querySelectorAll("button").forEach(b=>b.onclick=()=>{mode=b.dataset.m;open=null;formOpen=false;render();window.scrollTo(0,0)});
const T=$("tab-marche");if(T)T.addEventListener("click",()=>{listen();setTimeout(render,0)});
if(!V.hidden){listen();render()}
/* les commandes reçues s'affichent aussi en pastille, même hors de l'onglet */
setTimeout(()=>{if(B.CFG?navigator.onLine:true)listen()},4000);

const css=el("style");css.textContent=`
.m-filters{display:grid;gap:12px}.m-filters input{flex:1;min-width:0;font:16px var(--body);padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink);min-height:46px}
.m-chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}.m-chips .chip{flex:none;white-space:nowrap}
.m-chips .chip[aria-pressed="true"]{background:var(--navy,#1b2e4c);color:#fff;border-color:transparent}
.m-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,230px),1fr));gap:12px}
.m-card{display:grid;grid-template-rows:auto 1fr;text-align:left;padding:0;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--surface);cursor:pointer;color:var(--ink);font:inherit}
.m-ph{aspect-ratio:4/3;background:var(--bg);display:grid;place-items:center;overflow:hidden;color:var(--muted);font:800 28px var(--display)}
.m-ph img{width:100%;height:100%;object-fit:cover}
.m-tx{display:grid;gap:3px;padding:10px 12px 12px}.m-tx b{font:700 15px/1.25 var(--display)}
.m-price{font:800 16px var(--display);color:var(--leaf)}.m-price.big{font-size:22px}
.m-sell{color:var(--muted)}.m-own{display:grid;gap:8px}
.m-det{gap:12px}.m-big{width:100%;max-height:360px;object-fit:cover;border-radius:12px}
.m-total{font:700 16px var(--display);margin:0}
.m-order{display:grid;gap:4px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--surface)}
a.btn{text-decoration:none}.m-flash{background:var(--surface);padding:12px 14px;border-radius:12px;margin:0}
.m-shop{display:grid;gap:10px;padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--bg)}.m-shop-h{display:flex;gap:12px;align-items:center}
.m-av{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:var(--navy,#1b2e4c);color:var(--brand-green,#7bc043);font:800 18px var(--display);flex:none}
.m-shop-h b{display:block;font:700 17px var(--display)}.m-priv{margin:0}
.m-ok{display:inline-block;margin-top:3px;font:700 12px var(--body);color:#1e7b34;background:#e3f4e6;padding:2px 8px;border-radius:999px}
.m-cgu{display:grid;gap:6px}.m-cgu-txt{max-height:300px;overflow-y:auto;border:1px solid var(--line);border-radius:12px;padding:12px 14px;background:var(--bg);font-size:14px;line-height:1.5}
.m-cgu-txt h4{margin:12px 0 4px;font:700 14px var(--display);color:var(--heading)}.m-cgu-txt h4:first-child{margin-top:0}.m-cgu-txt p{margin:0}.m-cgu-end{margin-top:12px!important;color:var(--muted);font-size:12px}
.m-cgu-hint{color:var(--muted)}.m-cgu-hint.ok{color:#1e7b34}.m-check.off{opacity:.55}.m-doc{aspect-ratio:3/2}
.m-hist{display:grid;gap:10px;margin-top:10px}
.m-note{color:var(--muted);font-style:italic}
.m-photo{display:grid;grid-template-columns:120px 1fr;gap:12px;align-items:center}.m-photo .m-ph{border-radius:12px}
.m-check{display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.4}.m-check input{margin-top:3px;width:20px;height:20px;flex:none}
.m-head .seg3{margin-top:10px}
#tab-marche{position:relative}.m-badge{position:absolute;top:2px;right:calc(50% - 22px);min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#c0392b;color:#fff;font:800 11px/18px var(--body);text-align:center}
nav.tabs{grid-template-columns:repeat(8,minmax(0,1fr))}
@media (max-width:420px){nav.tabs button{font-size:9px}nav.tabs button svg{width:21px;height:21px}}`;
document.head.append(css);

/* ---------- 6. traductions principales ---------- */
const TR={"Marché":["Market","Mercato","Mercado"],"Marché B2A":["B2A Market","Mercato B2A","Mercado B2A"],"Acheter":["Buy","Compra","Comprar"],"Vendre":["Sell","Vendi","Vender"],"Mes commandes":["My orders","I miei ordini","Mis pedidos"],
 "Éleveurs et agriculteurs":["Livestock and crop farmers","Allevatori e agricoltori","Ganaderos y agricultores"],"Commander":["Order","Ordina","Pedir"],"Envoyer la commande":["Send order","Invia ordine","Enviar pedido"],
 "Nouvelle annonce":["New listing","Nuovo annuncio","Nuevo anuncio"],"+ Nouvelle annonce":["+ New listing","+ Nuovo annuncio","+ Nuevo anuncio"],"Publier l'annonce":["Publish listing","Pubblica annuncio","Publicar anuncio"],"Mes annonces":["My listings","I miei annunci","Mis anuncios"],
 "Commandes reçues":["Orders received","Ordini ricevuti","Pedidos recibidos"],"Ouvrir ma boutique":["Open my shop","Apri il mio negozio","Abrir mi tienda"],"Accepter":["Accept","Accetta","Aceptar"],"Refuser":["Decline","Rifiuta","Rechazar"],
 "Vendu : livré et payé":["Sold: delivered and paid","Venduto: consegnato e pagato","Vendido: entregado y pagado"],"Aliment":["Feed","Mangime","Pienso"],"Animaux vivants":["Live animals","Animali vivi","Animales vivos"],"Œufs":["Eggs","Uova","Huevos"],"Poussins":["Chicks","Pulcini","Pollitos"],
 "Récoltes (céréales, légumes…)":["Harvests (grain, vegetables…)","Raccolti (cereali, ortaggi…)","Cosechas (cereales, hortalizas…)"],"Plants et semences":["Seedlings and seeds","Piantine e sementi","Plantones y semillas"],"Matériel":["Equipment","Attrezzatura","Material"],"Tout":["All","Tutto","Todo"]};
{const D=window.B2A_DICT=window.B2A_DICT||{};["en","it","es"].forEach((lg,i)=>{D[lg]=D[lg]||{};for(const k in TR)if(D[lg][k]==null)D[lg][k]=TR[k][i]})}
window.B2A_MARCHE={render,listen};
})();
