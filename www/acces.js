/* B2A Smart Farming : inscription obligatoire (e-mail + mot de passe facultatifs pour se reconnecter), accès accordé automatiquement (B2A-HIGH-TECHNOLOGY-AUTOMATION, Bayere Abdoul Aziz)
   Chaque téléphone s'inscrit une fois (inscriptions/<uid>) ; le propriétaire peut retirer l'accès dans utilisateurs.html.
   Sans configuration Firebase, rien n'est bloqué. */
(function(){
const B=window.B2A;if(!B||!B.CFG)return;
const LS_ACC="b2a-acces";
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const pad=n=>String(n).padStart(2,"0");
const today=()=>{const d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())};
const VERSION="2026.10";
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
const LS_MSG="b2a-acces-msg";
const okMail=x=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(x);
const mailErr=e=>{const c=(e&&e.code)||"";
  if(/email-already-in-use|credential-already-in-use|account-exists/.test(c))return "Cet e-mail a déjà un compte. Appuyez sur « J'ai déjà un compte » pour vous connecter.";
  if(/invalid-email/.test(c))return "Adresse e-mail non valide.";
  if(/weak-password/.test(c))return "Mot de passe trop court : 6 caractères minimum.";
  if(/invalid-credential|wrong-password|user-not-found|invalid-login/.test(c))return "E-mail ou mot de passe incorrect.";
  if(/too-many-requests/.test(c))return "Trop d'essais. Réessayez dans quelques minutes.";
  return null};
function form(err){const c=head("Inscription","Remplissez ce formulaire pour ouvrir l'application. Vos informations sont envoyées à B2A, propriétaire de l'application, qui peut retirer l'accès en cas d'abus.");
  const fld=(g,id,lb,type,ph,opts)=>{const f=el("div","field");const l=el("label",null,lb);l.htmlFor=id;let i;
    if(opts){i=el("select");i.append(new Option("Choisir…",""));opts.forEach(o=>i.append(new Option(o,o)))}else{i=el("input");i.type=type;if(ph)i.placeholder=ph}
    i.id=id;f.append(l,i);g.append(f);return i};
  const g=el("div","grid2");
  const p=fld(g,"acc-prenom","Prénom","text","ex. Moussa"),n=fld(g,"acc-nom","Nom","text","ex. Ouédraogo"),v=fld(g,"acc-ville","Ville ou village","text","ex. Koudougou"),
    py=fld(g,"acc-pays","Pays","text","ex. Burkina Faso"),e=fld(g,"acc-elev","Type d'élevage",null,null,ELEV),t=fld(g,"acc-taille","Taille","text","ex. 500 pondeuses, 2 couveuses");
  py.value="Burkina Faso";[p,n,v,t].forEach(i=>{i.maxLength=60;i.autocomplete="off"});p.autocomplete="given-name";n.autocomplete="family-name";
  c.append(g);
  /* compte e-mail facultatif : permet de retrouver l'accès et la ferme après une réinstallation ou sur un autre téléphone */
  c.append(el("h3","acc-sub","E-mail et mot de passe (facultatif)"),
    el("p","note","Si vous les indiquez, vous pourrez rentrer dans l'application avec eux la prochaine fois (nouveau téléphone, réinstallation) sans perdre votre accès, votre ferme ni votre équipe. Vous pouvez laisser vide."));
  const g2=el("div","grid2");const em=fld(g2,"acc-mail","E-mail","email","ex. moussa@gmail.com"),pw=fld(g2,"acc-pass","Mot de passe","password","6 caractères minimum");
  em.autocomplete="email";em.maxLength=100;em.inputMode="email";pw.autocomplete="new-password";pw.maxLength=100;c.append(g2);
  const m=el("p","msg"+(err?" err":""),err||"");m.setAttribute("aria-live","polite");c.append(m);
  const b=el("button","btn","M'inscrire et ouvrir l'application");b.type="button";c.append(b);
  c.append(el("p","note","Une connexion internet est nécessaire pour l'inscription. Ensuite, l'application marche sans internet."));
  const lg=el("button","btn ghost acc-alt","J'ai déjà un compte : me connecter");lg.type="button";lg.onclick=()=>login();c.append(lg);
  b.onclick=async()=>{const d={prenom:p.value.trim(),nom:n.value.trim(),ville:v.value.trim(),pays:py.value.trim(),elevage:e.value,taille:t.value.trim()};
    const mail=em.value.trim().toLowerCase(),pass=pw.value;
    if(!d.prenom||!d.nom){m.textContent="Indiquez votre prénom et votre nom.";m.className="msg err";return}
    if(!d.ville||!d.pays){m.textContent="Indiquez votre ville et votre pays.";m.className="msg err";return}
    if(!d.elevage){m.textContent="Choisissez votre type d'élevage.";m.className="msg err";return}
    if(mail||pass){if(!okMail(mail)){m.textContent="Adresse e-mail non valide (ou laissez l'e-mail et le mot de passe vides).";m.className="msg err";return}
      if(pass.length<6){m.textContent="Mot de passe trop court : 6 caractères minimum.";m.className="msg err";return}}
    if(!navigator.onLine){m.textContent="Pas de connexion internet. Connectez-vous puis appuyez à nouveau sur le bouton.";m.className="msg err";return}
    b.disabled=true;b.textContent="Envoi…";m.textContent="";
    const reset=x=>{b.disabled=false;b.textContent="M'inscrire et ouvrir l'application";m.textContent=x;m.className="msg err"};
    try{const u=await B.ensureUser(B.CFG);
      let linked=!u.isAnonymous&&!!u.email;
      if(mail&&u.isAnonymous){
        try{await u.linkWithCredential(firebase.auth.EmailAuthProvider.credential(mail,pass));linked=true}
        catch(x){console.warn(x);reset(mailErr(x)||"La création du compte e-mail a échoué. Vérifiez la connexion et réessayez.");return}}
      const ref=firebase.firestore().doc("inscriptions/"+u.uid);
      await ref.set({...d,statut:"approuve",creeLe:firebase.firestore.FieldValue.serverTimestamp(),vuLe:today(),
        plateforme:plateforme(),langue:(window.B2A_LANG?window.B2A_LANG():"fr"),version:VERSION,appareil:B.me});
      if(linked&&u.email){const x={email:u.email};if(B.farm)x.ferme=B.farm;ref.update(x).catch(()=>{})}
      if(!B.lsGet(B.LS_NAME))B.lsSet(B.LS_NAME,d.prenom+" "+d.nom);
      save({uid:u.uid,statut:"approuve"});notify(d,linked?u.email:"");hide();toast("Inscription réussie. Bienvenue dans B2A Smart Farming.");listen()}
    catch(err){console.warn(err);reset("L'inscription a échoué. Vérifiez la connexion et réessayez.")}}}

/* connexion avec l'e-mail et le mot de passe choisis à l'inscription */
function login(err){const c=head("Se connecter","Entrez l'e-mail et le mot de passe choisis à l'inscription. Vous retrouvez votre accès, votre ferme et votre équipe.");
  const g=el("div","grid2");const mk=(id,lb,type,ac)=>{const f=el("div","field");const l=el("label",null,lb);l.htmlFor=id;const i=el("input");i.type=type;i.id=id;i.autocomplete=ac;i.maxLength=100;f.append(l,i);g.append(f);return i};
  const em=mk("acc-lmail","E-mail","email","email"),pw=mk("acc-lpass","Mot de passe","password","current-password");em.inputMode="email";c.append(g);
  const m=el("p","msg"+(err?" err":""),err||"");m.setAttribute("aria-live","polite");c.append(m);
  const b=el("button","btn","Se connecter");b.type="button";c.append(b);
  const fg=el("button","btn ghost acc-alt","Mot de passe oublié ?");fg.type="button";c.append(fg);
  const bk=el("button","btn ghost acc-alt","Retour à l'inscription");bk.type="button";bk.onclick=()=>form();c.append(bk);
  const ko=x=>{m.textContent=x;m.className="msg err"};
  b.onclick=async()=>{const mail=em.value.trim().toLowerCase(),pass=pw.value;
    if(!okMail(mail)){ko("Adresse e-mail non valide.");return}
    if(!pass){ko("Entrez votre mot de passe.");return}
    if(!navigator.onLine){ko("Pas de connexion internet. Connectez-vous puis appuyez à nouveau sur le bouton.");return}
    b.disabled=true;b.textContent="Connexion…";m.textContent="";
    try{await B.loadFirebase(B.CFG);const cr=await firebase.auth().signInWithEmailAndPassword(mail,pass);const u=cr.user;
      const s=await firebase.firestore().doc("inscriptions/"+u.uid).get();
      if(!s.exists){save(null);B.lsSet(LS_MSG,"Aucune inscription pour ce compte : remplissez le formulaire.");location.reload();return}
      const v=s.data();save({uid:u.uid,statut:v.statut});
      if(v.ferme)B.lsSet(B.LS_FARM,v.ferme);
      if(!B.lsGet(B.LS_NAME)&&v.prenom)B.lsSet(B.LS_NAME,(v.prenom+" "+(v.nom||"")).trim());
      B.lsSet(LS_MSG,"ok");location.reload()}
    catch(x){console.warn(x);b.disabled=false;b.textContent="Se connecter";ko(mailErr(x)||"La connexion a échoué. Vérifiez la connexion internet et réessayez.")}};
  fg.onclick=async()=>{const mail=em.value.trim().toLowerCase();
    if(!okMail(mail)){ko("Écrivez d'abord votre e-mail ci-dessus, puis appuyez sur « Mot de passe oublié ? ».");return}
    if(!navigator.onLine){ko("Pas de connexion internet.");return}
    fg.disabled=true;
    try{await B.loadFirebase(B.CFG);const a=firebase.auth();a.languageCode=(window.B2A_LANG?window.B2A_LANG():"fr");await a.sendPasswordResetEmail(mail);
      m.textContent="Un e-mail pour choisir un nouveau mot de passe a été envoyé à "+mail+". Regardez aussi dans les spams.";m.className="msg good"}
    catch(x){console.warn(x);ko(mailErr(x)||"L'envoi a échoué. Vérifiez l'e-mail et la connexion.")}
    fg.disabled=false}}

/* Réglages : les personnes déjà inscrites sans e-mail peuvent protéger leur compte (même identifiant, rien n'est perdu) */
B.renderCompte=async(sec,box)=>{if(!sec||!box)return;box.innerHTML="";
  let u=null;try{u=await Promise.race([B.ensureUser(B.CFG),new Promise((_,r)=>setTimeout(()=>r(0),8000))])}catch(e){u=null}
  if(!u){sec.hidden=!acc;if(acc)box.append(el("p","note","Connectez-vous à internet pour voir ou protéger votre compte."));return}
  sec.hidden=false;
  if(!u.isAnonymous&&u.email){
    box.append(el("p","note","Votre compte est protégé. Avec cet e-mail et votre mot de passe, vous retrouvez votre accès, votre ferme et votre équipe sur un autre téléphone ou après une réinstallation (bouton « J'ai déjà un compte » à l'inscription)."));
    const a=el("p","acc-mail",u.email);a.setAttribute("data-notr","");box.append(a);
    const r=el("div","row");const rs=el("button","btn small ghost","Changer mon mot de passe");rs.type="button";const m=el("span","msg");m.setAttribute("aria-live","polite");
    rs.onclick=async()=>{if(!navigator.onLine){m.textContent="Pas de connexion internet.";m.className="msg err";return}rs.disabled=true;
      try{const au=firebase.auth();au.languageCode=(window.B2A_LANG?window.B2A_LANG():"fr");await au.sendPasswordResetEmail(u.email);
        m.textContent="Un e-mail pour choisir un nouveau mot de passe a été envoyé à "+u.email+". Regardez aussi dans les spams.";m.className="msg good"}
      catch(x){console.warn(x);m.textContent=mailErr(x)||"L'envoi a échoué. Vérifiez l'e-mail et la connexion.";m.className="msg err"}rs.disabled=false};
    r.append(rs,m);box.append(r);
    /* garder l'e-mail et la ferme dans l'inscription (anciens comptes) */
    firebase.firestore().doc("inscriptions/"+u.uid).get().then(d=>{if(!d.exists)return;const v=d.data(),x={};
      if(v.email!==u.email)x.email=u.email;if(B.farm&&v.ferme!==B.farm)x.ferme=B.farm;if(Object.keys(x).length)d.ref.update(x).catch(()=>{})}).catch(()=>{});
    return}
  box.append(el("p","note","Ajoutez un e-mail et un mot de passe pour retrouver votre accès, votre ferme et votre équipe si vous changez de téléphone ou réinstallez l'application. Rien ne change pour vos données actuelles."));
  const g=el("div","grid2");const mk=(id,lb,type,ph,ac)=>{const f=el("div","field");const l=el("label",null,lb);l.htmlFor=id;const i=el("input");i.type=type;i.id=id;i.placeholder=ph;i.autocomplete=ac;i.maxLength=100;f.append(l,i);g.append(f);return i};
  const em=mk("x-cmail","E-mail","email","ex. moussa@gmail.com","email"),pw=mk("x-cpass","Mot de passe","password","6 caractères minimum","new-password");em.inputMode="email";box.append(g);
  const r=el("div","row");const b=el("button","btn small","Protéger mon compte");b.type="button";const m=el("span","msg");m.setAttribute("aria-live","polite");r.append(b,m);box.append(r);
  const ko=x=>{m.textContent=x;m.className="msg err"};
  b.onclick=async()=>{const mail=em.value.trim().toLowerCase(),pass=pw.value;
    if(!okMail(mail)){ko("Adresse e-mail non valide.");return}
    if(pass.length<6){ko("Mot de passe trop court : 6 caractères minimum.");return}
    if(!navigator.onLine){ko("Pas de connexion internet. Connectez-vous puis appuyez à nouveau sur le bouton.");return}
    b.disabled=true;b.textContent="Envoi…";m.textContent="";
    try{await u.linkWithCredential(firebase.auth.EmailAuthProvider.credential(mail,pass));
      const x={email:u.email||mail};if(B.farm)x.ferme=B.farm;
      await firebase.firestore().doc("inscriptions/"+u.uid).update(x).catch(()=>{});
      toast("Compte protégé. Gardez bien votre e-mail et votre mot de passe.");B.renderCompte(sec,box)}
    catch(x){console.warn(x);b.disabled=false;b.textContent="Protéger mon compte";ko(mailErr(x)||"La création du compte e-mail a échoué. Vérifiez la connexion et réessayez.")}}};

/* e-mail au propriétaire (FormSubmit, sans compte) */
function notify(d,mail){const to=window.B2A_NOTIFY_EMAIL;if(!to)return;
  const admin=location.origin+location.pathname.replace(/[^/]*$/,"")+"utilisateurs.html";
  fetch("https://formsubmit.co/ajax/"+encodeURIComponent(to),{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},
    body:JSON.stringify({_subject:"B2A Smart Farming : nouvel utilisateur, "+d.prenom+" "+d.nom,_template:"table",_captcha:"false",
      "Prénom":d.prenom,"Nom":d.nom,"Ville":d.ville,"Pays":d.pays,"Élevage":d.elevage,"Taille":d.taille||"—","E-mail du compte":mail||"— (sans e-mail)","Appareil":plateforme(),
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
      /* compte e-mail : on garde le code de la ferme pour le retrouver après une réinstallation */
      if(v.email&&B.farm&&v.ferme!==B.farm)d.ref.update({ferme:B.farm}).catch(()=>{})}
    else if(st==="attente"){if(was==="approuve"||!ov.isConnected){show()}if(!box.querySelector(".acc-wait"))wait()}
    else{show();refused(st)}},e=>{console.warn(e)})}catch(e){console.warn(e)}}
function toast(t){const x=el("div","acc-toast",t);document.body.append(x);setTimeout(()=>x.remove(),5000)}

/* ---------- démarrage ---------- */
const msg0=B.lsGet(LS_MSG);if(msg0)B.lsSet(LS_MSG,null);
if(msg0==="ok")setTimeout(()=>toast("Connexion réussie. Vous retrouvez votre compte."),300);
if(acc&&acc.statut==="approuve"){listen()}            /* déjà accepté : l'app s'ouvre, même sans internet ; on vérifie en arrière-plan */
else if(acc&&acc.statut==="attente"){show();wait()}
else if(acc&&(acc.statut==="refuse"||acc.statut==="bloque")){show();refused(acc.statut);listen()}
else{show();form(msg0&&msg0!=="ok"?msg0:"")}
addEventListener("online",()=>{if(ov.isConnected&&box.querySelector(".acc-wait")){wait()}});
})();
