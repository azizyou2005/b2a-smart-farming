/* B2A Smart Farming : inscription obligatoire, accès accordé automatiquement (B2A-HIGH-TECHNOLOGY-AUTOMATION, Bayere Abdoul Aziz)
   Chaque téléphone s'inscrit une fois (inscriptions/<uid>) ; le propriétaire peut retirer l'accès dans utilisateurs.html.
   Sans configuration Firebase, rien n'est bloqué. */
(function(){
const B=window.B2A;if(!B||!B.CFG)return;
const LS_ACC="b2a-acces";
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const pad=n=>String(n).padStart(2,"0");
const today=()=>{const d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())};
const VERSION="2026.10b";
const plateforme=()=>{const C=window.Capacitor;return C&&C.isNativePlatform&&C.isNativePlatform()?"android":/iphone|ipad/i.test(navigator.userAgent)?"iphone (web)":/android/i.test(navigator.userAgent)?"android (web)":"ordinateur (web)"};
let acc=null;try{acc=JSON.parse(B.lsGet(LS_ACC)||"null")}catch(e){acc=null}
const save=v=>{acc=v;B.lsSet(LS_ACC,v?JSON.stringify(v):null)};

/* ---------- écran ---------- */
const ov=el("div","acces");ov.id="acces";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-labelledby","acc-t");
const box=el("div","acces-in");ov.append(box);
const logo=document.querySelector(".band .ic");
function head(title,sub){box.innerHTML="";const h=el("div","acc-head");if(logo){const i=el("img");i.src=logo.src;i.alt="Logo B2A";h.append(i)}
  const t=el("div");t.append(el("b",null,"B2A Smart Farming"),el("small",null,"Smart Building · Smart Farming"));h.append(t);box.append(h);
  const c=el("section","card");c.append(el("h2","sec",title));c.querySelector("h2").id="acc-t";if(sub)c.append(el("p","note",sub));box.append(c);
  const f=el("p","acc-own","Application privée de B2A-HIGH-TECHNOLOGY-AUTOMATION · Bayere Abdoul Aziz");f.setAttribute("data-notr","");box.append(f);return c}
function show(){if(!ov.isConnected)document.body.append(ov);document.documentElement.classList.add("acces-on")}
function hide(){ov.remove();document.documentElement.classList.remove("acces-on")}

const ELEV=["Poules pondeuses","Poulets de chair","Volaille locale / pintades","Couvoir (poussins)","Porcs","Moutons / chèvres","Bovins","Poissons","Cultures","Autre"];
/* ---------- compte B2A (e-mail + mot de passe) : retrouver l'accès et les données après une réinstallation ---------- */
const AUTH_ERR={"auth/email-already-in-use":"Ce compte existe déjà. Touchez « J'ai déjà un compte » ci-dessous.","auth/credential-already-in-use":"Ce compte existe déjà. Touchez « J'ai déjà un compte » ci-dessous.",
  "auth/invalid-email":"Adresse e-mail invalide.","auth/weak-password":"Mot de passe trop court : au moins 6 caractères.","auth/wrong-password":"E-mail ou mot de passe incorrect.",
  "auth/user-not-found":"Aucun compte avec cet e-mail. Inscrivez-vous d'abord.","auth/invalid-credential":"E-mail ou mot de passe incorrect.","auth/invalid-login-credentials":"E-mail ou mot de passe incorrect.",
  "auth/too-many-requests":"Trop d'essais. Attendez quelques minutes puis réessayez.","auth/network-request-failed":"Pas de connexion internet. Réessayez.",
  "auth/operation-not-allowed":"La connexion par e-mail n'est pas activée. Contactez B2A.","auth/requires-recent-login":"Reconnectez-vous puis réessayez."};
const authErr=e=>AUTH_ERR[e&&e.code]||"L'opération a échoué. Vérifiez la connexion et réessayez.";
const okMail=m=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m);
function pwField(id,lb){const f=el("div","field");const l=el("label",null,lb);l.htmlFor=id;const w=el("div","acc-pw");const i=el("input");i.type="password";i.id=id;i.autocomplete="current-password";i.minLength=6;
  const t=el("button","btn small ghost","Voir");t.type="button";t.onclick=()=>{const v=i.type==="password";i.type=v?"text":"password";t.textContent=v?"Cacher":"Voir"};w.append(i,t);f.append(l,w);return [f,i]}
/* lie le compte e-mail à l'identifiant de ce téléphone (l'identifiant ne change pas : inscription, ferme et données restent) */
async function linkAccount(mail,pw){const u=await B.ensureUser(B.CFG);if(!u.isAnonymous)return u;
  const cred=firebase.auth.EmailAuthProvider.credential(mail,pw);const r=await u.linkWithCredential(cred);return r.user}
function form(err){const c=head("Inscription","Remplissez ce formulaire pour ouvrir l'application. Vos informations sont envoyées à B2A, propriétaire de l'application, qui peut retirer l'accès en cas d'abus.");
  const g=el("div","grid2");const fld=(id,lb,type,ph,opts)=>{const f=el("div","field");const l=el("label",null,lb);l.htmlFor=id;let i;
    if(opts){i=el("select");i.append(new Option("Choisir…",""));opts.forEach(o=>i.append(new Option(o,o)))}else{i=el("input");i.type=type;if(ph)i.placeholder=ph}
    i.id=id;f.append(l,i);g.append(f);return i};
  const p=fld("acc-prenom","Prénom","text","ex. Moussa"),n=fld("acc-nom","Nom","text","ex. Ouédraogo"),v=fld("acc-ville","Ville ou village","text","ex. Koudougou"),
    py=fld("acc-pays","Pays","text","ex. Burkina Faso"),e=fld("acc-elev","Type d'élevage",null,null,ELEV),t=fld("acc-taille","Taille","text","ex. 500 pondeuses, 2 couveuses");
  py.value="Burkina Faso";[p,n,v,t].forEach(i=>{i.maxLength=60;i.autocomplete="off"});p.autocomplete="given-name";n.autocomplete="family-name";
  c.append(g);
  c.append(el("h3","sec acc-sub","Votre compte"));c.append(el("p","note","Il protège vos données : si vous changez de téléphone ou réinstallez l'application, vous retrouvez votre accès et toutes vos données avec cet e-mail et ce mot de passe."));
  const g2=el("div","grid2");const mf=el("div","field");const ml=el("label",null,"E-mail");ml.htmlFor="acc-mail";const mi=el("input");mi.type="email";mi.id="acc-mail";mi.autocomplete="email";mi.placeholder="ex. moussa@gmail.com";mi.maxLength=100;mf.append(ml,mi);
  const [pf,pi]=pwField("acc-pw","Mot de passe (6 caractères minimum)");pi.autocomplete="new-password";g2.append(mf,pf);c.append(g2);
  const m=el("p","msg"+(err?" err":""),err||"");m.setAttribute("aria-live","polite");c.append(m);
  const b=el("button","btn","M'inscrire et ouvrir l'application");b.type="button";c.append(b);
  const lg=el("button","btn ghost","J'ai déjà un compte (réinstallation, nouveau téléphone)");lg.type="button";lg.onclick=()=>login();c.append(lg);
  c.append(el("p","note","Une connexion internet est nécessaire pour l'inscription. Ensuite, l'application marche sans internet."));
  b.onclick=async()=>{const d={prenom:p.value.trim(),nom:n.value.trim(),ville:v.value.trim(),pays:py.value.trim(),elevage:e.value,taille:t.value.trim()};const mail=mi.value.trim().toLowerCase(),pw=pi.value;
    const bad=x=>{m.textContent=x;m.className="msg err"};
    if(!d.prenom||!d.nom)return bad("Indiquez votre prénom et votre nom.");
    if(!d.ville||!d.pays)return bad("Indiquez votre ville et votre pays.");
    if(!d.elevage)return bad("Choisissez votre type d'élevage.");
    if(!okMail(mail)){mi.focus();return bad("Indiquez une adresse e-mail valide : elle sert à retrouver vos données.")}
    if(pw.length<6){pi.focus();return bad("Choisissez un mot de passe d'au moins 6 caractères.")}
    if(!navigator.onLine)return bad("Pas de connexion internet. Connectez-vous puis appuyez à nouveau sur le bouton.");
    b.disabled=true;b.textContent="Envoi…";m.textContent="";
    let u;try{await B.loadFirebase(B.CFG);u=await linkAccount(mail,pw)}
    catch(err){console.warn(err);b.disabled=false;b.textContent="M'inscrire et ouvrir l'application";return bad(authErr(err))}
    try{await firebase.firestore().doc("inscriptions/"+u.uid).set({...d,statut:"approuve",creeLe:firebase.firestore.FieldValue.serverTimestamp(),vuLe:today(),
        plateforme:plateforme(),langue:(window.B2A_LANG?window.B2A_LANG():"fr"),version:VERSION,appareil:B.me});
      firebase.firestore().doc("inscriptions/"+u.uid).update({email:mail}).catch(()=>{});
      if(!B.lsGet(B.LS_NAME))B.lsSet(B.LS_NAME,d.prenom);
      save({uid:u.uid,statut:"approuve"});notify({...d,email:mail});
      /* données en ligne dès le départ : elles survivent à une désinstallation */
      if(!B.farm){b.textContent="Préparation de votre ferme…";try{await B.createFarm();location.reload();return}catch(e){console.warn(e)}}
      hide();toast("Inscription réussie. Bienvenue dans B2A Smart Farming.");listen()}
    catch(err){console.warn(err);b.disabled=false;b.textContent="M'inscrire et ouvrir l'application";bad("L'inscription a échoué. Vérifiez la connexion et réessayez.")}}}
function login(err){const c=head("J'ai déjà un compte","Connectez-vous avec l'e-mail et le mot de passe choisis à l'inscription : vous retrouvez votre accès, votre ferme et toutes vos données.");
  const g=el("div","grid2");const mf=el("div","field");const ml=el("label",null,"E-mail");ml.htmlFor="acc-lmail";const mi=el("input");mi.type="email";mi.id="acc-lmail";mi.autocomplete="email";mf.append(ml,mi);
  const [pf,pi]=pwField("acc-lpw","Mot de passe");g.append(mf,pf);c.append(g);
  const m=el("p","msg"+(err?" err":""),err||"");m.setAttribute("aria-live","polite");c.append(m);
  const b=el("button","btn","Me connecter");b.type="button";c.append(b);
  const r=el("div","row");const fg=el("button","btn small ghost","Mot de passe oublié ?");fg.type="button";const bk=el("button","btn small ghost","‹ Retour à l'inscription");bk.type="button";bk.onclick=()=>form();r.append(fg,bk);c.append(r);
  const bad=(x,good)=>{m.textContent=x;m.className="msg"+(good?" good":" err")};
  fg.onclick=async()=>{const mail=mi.value.trim().toLowerCase();if(!okMail(mail)){mi.focus();return bad("Écrivez d'abord votre e-mail, puis touchez « Mot de passe oublié ? ».")}
    try{await B.loadFirebase(B.CFG);await firebase.auth().sendPasswordResetEmail(mail);bad("E-mail envoyé à "+mail+" : ouvrez-le pour choisir un nouveau mot de passe (regardez aussi dans les spams).",true)}catch(e){bad(authErr(e))}};
  b.onclick=async()=>{const mail=mi.value.trim().toLowerCase(),pw=pi.value;if(!okMail(mail))return bad("Indiquez votre e-mail.");if(!pw)return bad("Indiquez votre mot de passe.");
    if(!navigator.onLine)return bad("Pas de connexion internet. Connectez-vous puis réessayez.");
    b.disabled=true;b.textContent="Connexion…";m.textContent="";
    try{await B.loadFirebase(B.CFG);const res=await firebase.auth().signInWithEmailAndPassword(mail,pw);const uid=res.user.uid;
      const d=await firebase.firestore().doc("inscriptions/"+uid).get({source:"server"});
      if(d.exists){const v=d.data();
        if(v.appareil)B.lsSet(B.LS_ME,v.appareil);            /* même identifiant qu'avant : vos saisies gardent votre nom */
        if(v.prenom&&!B.lsGet(B.LS_NAME))B.lsSet(B.LS_NAME,v.prenom);
        const dn=res.user.displayName||"";const fm=v.ferme||(/^ferme:[A-Z0-9]{10}$/.test(dn)?dn.slice(6):null);
        if(fm)B.lsSet(B.LS_FARM,fm);                          /* la ferme et ses données reviennent */
        save({uid,statut:v.statut||"approuve"})}
      else{save(null);const dn=res.user.displayName||"";if(/^ferme:[A-Z0-9]{10}$/.test(dn))B.lsSet(B.LS_FARM,dn.slice(6))}   /* compte sans inscription : le formulaire s'affichera */
      location.reload()}
    catch(e){console.warn(e);b.disabled=false;b.textContent="Me connecter";bad(authErr(e))}}}

/* e-mail au propriétaire (FormSubmit, sans compte) */
function notify(d){const to=window.B2A_NOTIFY_EMAIL;if(!to)return;
  const admin=location.origin+location.pathname.replace(/[^/]*$/,"")+"utilisateurs.html";
  fetch("https://formsubmit.co/ajax/"+encodeURIComponent(to),{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},
    body:JSON.stringify({_subject:"B2A Smart Farming : nouvel utilisateur, "+d.prenom+" "+d.nom,_template:"table",_captcha:"false",
      "Prénom":d.prenom,"Nom":d.nom,"Ville":d.ville,"Pays":d.pays,"Élevage":d.elevage,"Taille":d.taille||"—","Appareil":plateforme(),
      "Gérer les utilisateurs":admin.startsWith("http")?admin:"https://azizyou2005.github.io/b2a-smart-farming/utilisateurs.html"})}).catch(()=>{})}

let off=null;
function wait(){const c=head("Demande envoyée","Votre demande est en attente de validation par B2A. Cet écran s'ouvrira tout seul dès qu'elle sera acceptée.");
  const s=el("div","acc-wait");s.append(el("span","spinner"),el("span",null,navigator.onLine?"En attente de la réponse…":"Pas de connexion : la réponse s'affichera dès que vous serez connecté."));c.append(s);
  listen()}
function refused(st){const c=head("Accès retiré","Votre accès à l'application a été retiré par B2A.");
  c.append(el("p","note","Pour en parler, contactez B2A-HIGH-TECHNOLOGY-AUTOMATION :"));const a=el("p","acc-mail","azizyou2005@yahoo.fr");a.setAttribute("data-notr","");c.append(a)}

async function listen(){if(off)return;try{const u=await B.ensureUser(B.CFG);
  off=firebase.firestore().doc("inscriptions/"+u.uid).onSnapshot(d=>{if(!d.exists){if(d.metadata.fromCache)return;save(null);off&&off();off=null;show();form();return}
    const v=d.data(),st=v.statut;const was=acc&&acc.statut;save({uid:u.uid,statut:st});
    if(st==="approuve"){if(was!=="approuve"){hide();toast("Accès accordé. Bienvenue dans B2A Smart Farming.")}else hide();
      if(v.vuLe!==today()||v.version!==VERSION)d.ref.update({vuLe:today(),version:VERSION,plateforme:plateforme()}).catch(()=>{});
      /* garder le code de la ferme et l'e-mail dans l'inscription ; après une réinstallation, retrouver la ferme */
      if(B.farm&&(v.ferme!==B.farm||u.displayName!=="ferme:"+B.farm))B.saveFerme(B.farm);
      else if(!B.farm&&v.ferme&&!d.metadata.fromCache&&!sessionStorage.getItem("b2a-ferme-retour")){sessionStorage.setItem("b2a-ferme-retour","1");B.lsSet(B.LS_FARM,v.ferme);location.reload();return}
      if(u.email&&v.email!==u.email)d.ref.update({email:u.email}).catch(()=>{})}
    else if(st==="attente"){if(was==="approuve"||!ov.isConnected){show()}if(!box.querySelector(".acc-wait"))wait()}
    else{show();refused(st)}},e=>{console.warn(e)})}catch(e){console.warn(e)}}
function toast(t){const x=el("div","acc-toast",t);document.body.append(x);setTimeout(()=>x.remove(),5000)}

/* ---------- démarrage ---------- */
if(acc&&acc.statut==="approuve"){listen()}            /* déjà accepté : l'app s'ouvre, même sans internet ; on vérifie en arrière-plan */
else if(acc&&acc.statut==="attente"){show();wait()}
else if(acc&&(acc.statut==="refuse"||acc.statut==="bloque")){show();refused(acc.statut);listen()}
else{show();form()}
addEventListener("online",()=>{if(ov.isConnected&&box.querySelector(".acc-wait")){wait()}});
})();
