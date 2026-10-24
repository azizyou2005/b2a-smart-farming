/* B2A Smart Farming : page du propriétaire pour accepter les utilisateurs et les compter */
(function(){
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const fmt=n=>n.toLocaleString("fr-FR");
const pad=n=>String(n).padStart(2,"0");
const dayAgo=k=>{const d=new Date();d.setDate(d.getDate()-k);return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())};
const ST={attente:["En attente","p-attente"],approuve:["Accepté","p-approuve"],refuse:["Refusé","p-refuse"],bloque:["Suspendu","p-bloque"]};
if(!window.B2A_FIREBASE){$("u-lmsg").textContent="Firebase n'est pas encore configuré : remplissez window.B2A_FIREBASE dans config.js (voir LISEZ-MOI.md).";$("u-lmsg").className="msg err";$("u-go").disabled=true;return}
firebase.initializeApp(window.B2A_FIREBASE);
const auth=firebase.auth(),db=firebase.firestore();
let users=[],filter="attente",off=null;

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

function kpi(l,v,s,c){const k=el("div","kpi"+(c?" "+c:""));k.append(el("span",null,l),el("b",null,v));if(s)k.append(el("small",null,s));return k}
function render(){
  const by=s=>users.filter(u=>u.statut===s).length;
  const acc=users.filter(u=>u.statut==="approuve");
  const a7=acc.filter(u=>(u.vuLe||"")>=dayAgo(7)).length,a30=acc.filter(u=>(u.vuLe||"")>=dayAgo(30)).length;
  const K=$("u-kpis");K.innerHTML="";
  K.append(kpi("Utilisateurs acceptés",fmt(acc.length),fmt(users.length)+" demandes au total","ok"),
    kpi("En attente",fmt(by("attente")),by("attente")?"à valider":"rien à valider",by("attente")?"warn":""),
    kpi("Actifs 7 jours",fmt(a7),"ont ouvert l'app"),kpi("Actifs 30 jours",fmt(a30),"ont ouvert l'app"),
    kpi("Refusés / suspendus",fmt(by("refuse")+by("bloque"))));
  document.querySelectorAll("#u-filter .chip").forEach(b=>b.setAttribute("aria-pressed",b.dataset.f===filter));
  const q=$("u-q").value.trim().toLowerCase();
  let list=users.filter(u=>filter==="tous"||(filter==="refuse"?u.statut==="refuse"||u.statut==="bloque":u.statut===filter));
  if(q)list=list.filter(u=>[u.prenom,u.nom,u.ville,u.pays,u.elevage,u.taille].join(" ").toLowerCase().includes(q));
  list.sort((a,b)=>((b.creeLe&&b.creeLe.seconds)||0)-((a.creeLe&&a.creeLe.seconds)||0));
  const L=$("u-list");L.innerHTML="";
  if(!list.length)L.append(el("p","empty",filter==="attente"?"Aucune demande en attente.":"Personne dans cette liste."));
  list.forEach(u=>{const c=el("article","u");const st=ST[u.statut]||ST.attente;
    const top=el("div","u-top");top.append(el("b",null,(u.prenom||"")+" "+(u.nom||"")),el("span","pill "+st[1],st[0]));
    const quand=u.creeLe&&u.creeLe.toDate?u.creeLe.toDate().toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"}):"—";
    c.append(top,el("small",null,(u.ville||"?")+", "+(u.pays||"?")+" · "+(u.elevage||"élevage non précisé")+(u.taille?" · "+u.taille:"")),
      el("small",null,"Demande du "+quand+" · "+(u.plateforme||"")+(u.vuLe?" · dernière ouverture le "+new Date(u.vuLe+"T12:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short"}):"")));
    const A=el("div","acts");const msg=el("span","msg");
    const set=async(s,btn)=>{btn.disabled=true;try{await db.doc("inscriptions/"+u.id).update({statut:s,decideLe:firebase.firestore.FieldValue.serverTimestamp()})}catch(e){msg.textContent="Échec. Vérifiez la connexion.";msg.className="msg err";btn.disabled=false}};
    const mk=(t,cls,fn)=>{const b=el("button","btn small "+cls,t);b.type="button";b.onclick=()=>fn(b);A.append(b)};
    if(u.statut!=="approuve")mk("Accepter","ok",b=>set("approuve",b));
    if(u.statut==="attente")mk("Refuser","bad",b=>set("refuse",b));
    if(u.statut==="approuve")mk("Suspendre l'accès","bad",b=>set("bloque",b));
    mk("Supprimer","ghost",b=>{if(b.dataset.c!=="1"){b.dataset.c="1";b.textContent="Confirmer la suppression";return}
      b.disabled=true;db.doc("inscriptions/"+u.id).delete().catch(()=>{msg.textContent="Échec de la suppression.";msg.className="msg err";b.disabled=false})});
    A.append(msg);c.append(A);L.append(c)});
  /* par pays */
  const P={};acc.forEach(u=>{const k=(u.pays||"Non précisé").trim();P[k]=(P[k]||0)+1});
  const T=$("u-pays");T.innerHTML="";const h=el("tr");h.append(el("th",null,"Pays"),el("th",null,"Acceptés"));T.append(h);
  Object.entries(P).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>{const r=el("tr");r.append(el("td",null,k),el("td","n",fmt(v)));T.append(r)});
  if(!acc.length){const r=el("tr");const td=el("td",null,"Aucun utilisateur accepté pour l'instant.");td.colSpan=2;r.append(td);T.append(r)}
}
})();
