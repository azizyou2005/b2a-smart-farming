/* B2A Smart Farming : page du propriétaire pour accepter les utilisateurs et les compter */
(function(){
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const fmt=n=>n.toLocaleString("fr-FR");
const pad=n=>String(n).padStart(2,"0");
const dayAgo=k=>{const d=new Date();d.setDate(d.getDate()-k);return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())};
const ST={attente:["En attente","p-attente"],approuve:["Accès actif","p-approuve"],refuse:["Accès retiré","p-refuse"],bloque:["Accès retiré","p-bloque"]};
if(!window.B2A_FIREBASE){$("u-lmsg").textContent="Firebase n'est pas encore configuré : remplissez window.B2A_FIREBASE dans config.js (voir LISEZ-MOI.md).";$("u-lmsg").className="msg err";$("u-go").disabled=true;return}
firebase.initializeApp(window.B2A_FIREBASE);
const auth=firebase.auth(),db=firebase.firestore();
let users=[],filter="approuve",off=null;

$("u-go").onclick=async()=>{const m=$("u-lmsg");m.textContent="";m.className="msg";
  try{$("u-go").disabled=true;await auth.signInWithEmailAndPassword($("u-mail").value.trim(),$("u-pass").value)}
  catch(e){m.textContent=e&&e.code==="auth/too-many-requests"?"Trop d'essais. Réessayez dans quelques minutes.":"E-mail ou mot de passe incorrect.";m.className="msg err"}
  finally{$("u-go").disabled=false}};
$("u-pass").addEventListener("keydown",e=>{if(e.key==="Enter")$("u-go").click()});
$("u-out").onclick=()=>auth.signOut();

auth.onAuthStateChanged(u=>{const isMail=u&&!u.isAnonymous;$("u-login").hidden=isMail;$("u-main").hidden=!isMail;$("u-out").hidden=!isMail;
  if(off){off();off=null}
  if(!isMail)return;
  off=db.collection("inscriptions").onSnapshot(s=>{users=s.docs.map(d=>({id:d.id,...d.data()}));render()},
    e=>{$("u-main").hidden=true;$("u-login").hidden=false;$("u-lmsg").textContent="Ce compte n'a pas le droit de voir les utilisateurs. Vérifiez les règles Firestore et l'e-mail du propriétaire.";$("u-lmsg").className="msg err"})});

document.querySelectorAll("#u-filter .chip").forEach(b=>b.onclick=()=>{filter=b.dataset.f;render()});
$("u-q").addEventListener("input",()=>render());

const note=(k,d)=>{(window.__adm=window.__adm||{})[k]=d;document.dispatchEvent(new CustomEvent("b2a-admin",{detail:{k,d}}))};
function kpi(l,v,s,c){const k=el("div","kpi"+(c?" "+c:""));k.append(el("span",null,l),el("b",null,v));if(s)k.append(el("small",null,s));return k}
/* à vérifier : nom de test ou tapé au hasard, ou même personne inscrite plusieurs fois
   (même téléphone, même nom dans la même ville, ou même e-mail). Dans un doublon, on garde l'inscription ouverte le plus récemment. */
const NM=window.B2A_NOMS;
function verifs(){const R={};users.forEach(u=>{const c=NM?NM.check(u):{erreur:"",suspect:[]};R[u.id]={suspect:!!(c.erreur||c.suspect.length),raison:c.erreur?"Faux nom ou nom de test":c.suspect.length?"Nom ou ville qui semble tapé au hasard":"",doublon:null}});
  const par={};const find=x=>par[x]===x?x:(par[x]=find(par[x]));users.forEach(u=>par[u.id]=u.id);
  const join=(k,fn)=>{const g={};users.forEach(u=>{const v=fn(u);if(!v)return;if(g[v])par[find(u.id)]=find(g[v]);else g[v]=u.id})};
  join("app",u=>u.appareil||"");join("mail",u=>(u.email||"").toLowerCase());join("nom",u=>NM&&u.prenom&&u.nom?NM.cleNom(u):"");
  const G={};users.forEach(u=>(G[find(u.id)]=G[find(u.id)]||[]).push(u));
  const t=u=>(u.creeLe&&u.creeLe.seconds)||0;
  Object.values(G).forEach(g=>{if(g.length<2)return;g.sort((a,b)=>(b.vuLe||"").localeCompare(a.vuLe||"")||t(b)-t(a));
    const k=g[0],nom=((k.prenom||"")+" "+(k.nom||"")).trim();g.slice(1).forEach(u=>R[u.id].doublon=nom||"une autre inscription")});
  return R}
function render(){
  const by=s=>users.filter(u=>u.statut===s).length;
  const V=verifs(),aVerif=u=>V[u.id]&&(V[u.id].suspect||V[u.id].doublon),nV=users.filter(aVerif).length;
  const acc=users.filter(u=>u.statut==="approuve");
  const a7=acc.filter(u=>(u.vuLe||"")>=dayAgo(7)).length,a30=acc.filter(u=>(u.vuLe||"")>=dayAgo(30)).length;
  const K=$("u-kpis");K.innerHTML="";
  /* fidélité : parmi les personnes inscrites depuis plus de 30 jours, combien ont encore ouvert l'app ces 30 derniers jours */
  const old=acc.filter(u=>u.creeLe&&u.creeLe.toDate&&u.creeLe.toDate()<new Date(Date.now()-30*864e5)),kept=old.filter(u=>(u.vuLe||"")>=dayAgo(30)).length;
  const new7=users.filter(u=>u.creeLe&&u.creeLe.toDate&&u.creeLe.toDate()>=new Date(Date.now()-7*864e5)).length;
  K.append(kpi("Utilisateurs avec accès",fmt(acc.length),fmt(users.length)+" inscrits au total","ok"),
    kpi("Nouveaux 7 jours",fmt(new7),"inscriptions récentes"),
    kpi("Actifs 7 jours",fmt(a7),"ont ouvert l'app"),kpi("Actifs 30 jours",fmt(a30),"ont ouvert l'app"),
    kpi("Fidélité",old.length?fmt(Math.round(kept/old.length*100))+" %":"—",old.length?fmt(kept)+" sur "+fmt(old.length)+" inscrits depuis plus de 30 jours ont rouvert l'app ce mois-ci":"pas encore d'inscrits de plus de 30 jours",old.length&&kept/old.length<0.3?"warn":""),
    kpi("Accès retiré",fmt(by("refuse")+by("bloque"))),
    kpi("À vérifier",fmt(nV),"noms suspects et doublons",nV?"warn":""));
  const cv=document.querySelector('#u-filter .chip[data-f="verifier"]');if(cv)cv.textContent="À vérifier"+(nV?" ("+nV+")":"");
  note("users",{total:users.length,acces:acc.length,new7,a7,a30,fidelite:old.length?kept/old.length:null,
    list:users.map(u=>({statut:u.statut,pays:u.pays,elevage:u.elevage,plateforme:u.plateforme,langue:u.langue,vu:u.vuLe||"",cree:u.creeLe&&u.creeLe.toMillis?u.creeLe.toMillis():0}))});
  document.querySelectorAll("#u-filter .chip").forEach(b=>b.setAttribute("aria-pressed",b.dataset.f===filter));
  const q=$("u-q").value.trim().toLowerCase();
  let list=users.filter(u=>filter==="tous"||(filter==="verifier"?aVerif(u):filter==="refuse"?u.statut==="refuse"||u.statut==="bloque":u.statut===filter));
  if(q)list=list.filter(u=>[u.prenom,u.nom,u.ville,u.pays,u.elevage,u.taille].join(" ").toLowerCase().includes(q));
  list.sort((a,b)=>((b.creeLe&&b.creeLe.seconds)||0)-((a.creeLe&&a.creeLe.seconds)||0));
  const L=$("u-list");L.innerHTML="";
  if(!list.length)L.append(el("p","empty",filter==="approuve"?"Aucun utilisateur inscrit pour l'instant.":filter==="verifier"?"Rien à vérifier : aucun nom suspect ni doublon.":"Personne dans cette liste."));
  /* effacer d'un coup les inscriptions à vérifier (robots de test, faux noms, anciennes inscriptions en double) */
  if(filter==="verifier"&&list.length){const w=el("div","bulk");const m=el("span","msg");
    w.append(el("p","note","Robots de test de Google Play (« John Doe », lettres au hasard), faux noms et anciennes inscriptions d'une personne déjà inscrite. Pour un doublon, l'inscription la plus récente est gardée."));
    const b=el("button","btn small bad","Effacer ces "+fmt(list.length)+" inscriptions");b.type="button";
    b.onclick=async()=>{if(b.dataset.c!=="1"){b.dataset.c="1";b.textContent="Confirmer : effacer "+fmt(list.length)+" inscriptions";return}
      b.disabled=true;b.textContent="Suppression…";
      try{for(let i=0;i<list.length;i+=400){const bt=db.batch();list.slice(i,i+400).forEach(u=>bt.delete(db.doc("inscriptions/"+u.id)));await bt.commit()}}
      catch(e){m.textContent="Échec de la suppression. Vérifiez la connexion.";m.className="msg err";b.disabled=false;b.dataset.c="";b.textContent="Réessayer"}};
    w.append(b,m);L.append(w)}
  list.forEach(u=>{const c=el("article","u");const st=ST[u.statut]||ST.attente;
    const top=el("div","u-top");const pills=el("div","pills");pills.append(el("span","pill "+st[1],st[0]));
    const vf=V[u.id]||{};if(vf.suspect)pills.append(el("span","pill p-suspect","Nom suspect"));if(vf.doublon)pills.append(el("span","pill p-doublon","Doublon probable"));
    top.append(el("b",null,(u.prenom||"")+" "+(u.nom||"")),pills);
    const quand=u.creeLe&&u.creeLe.toDate?u.creeLe.toDate().toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"}):"—";
    c.append(top,el("small",null,(u.ville||"?")+", "+(u.pays||"?")+" · "+(u.elevage||"élevage non précisé")+(u.taille?" · "+u.taille:"")),
      ...(vf.raison||vf.doublon?[el("small","u-why",[vf.raison,vf.doublon?"Même personne que « "+vf.doublon+" » (inscription plus récente, gardée)":""].filter(Boolean).join(" · "))]:[]),
      el("small",null,"Inscrit le "+quand+" · "+(u.plateforme||"")+(u.vuLe?" · dernière ouverture le "+new Date(u.vuLe+"T12:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short"}):"")));
    const A=el("div","acts");const msg=el("span","msg");
    const set=async(s,btn)=>{btn.disabled=true;try{await db.doc("inscriptions/"+u.id).update({statut:s,decideLe:firebase.firestore.FieldValue.serverTimestamp()})}catch(e){msg.textContent="Échec. Vérifiez la connexion.";msg.className="msg err";btn.disabled=false}};
    const mk=(t,cls,fn)=>{const b=el("button","btn small "+cls,t);b.type="button";b.onclick=()=>fn(b);A.append(b)};
    if(u.statut==="approuve")mk("Retirer l'accès","bad",b=>{if(b.dataset.c!=="1"){b.dataset.c="1";b.textContent="Confirmer : retirer l'accès";return}set("bloque",b)});
    else mk("Rendre l'accès","ok",b=>set("approuve",b));
    mk("Effacer l'inscription","ghost",b=>{if(b.dataset.c!=="1"){b.dataset.c="1";b.textContent="Confirmer : la personne devra se réinscrire";return}
      b.disabled=true;db.doc("inscriptions/"+u.id).delete().catch(()=>{msg.textContent="Échec de la suppression.";msg.className="msg err";b.disabled=false})});
    A.append(msg);c.append(A);L.append(c)});
  /* par pays */
  const P={};acc.forEach(u=>{const k=(u.pays||"Non précisé").trim();P[k]=(P[k]||0)+1});
  const T=$("u-pays");T.innerHTML="";const h=el("tr");h.append(el("th",null,"Pays"),el("th",null,"Avec accès"));T.append(h);
  Object.entries(P).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>{const r=el("tr");r.append(el("td",null,k),el("td","n",fmt(v)));T.append(r)});
  if(!acc.length){const r=el("tr");const td=el("td",null,"Aucun utilisateur pour l'instant.");td.colSpan=2;r.append(td);T.append(r)}
}
})();
