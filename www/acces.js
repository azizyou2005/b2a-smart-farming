/* B2A Smart Farming : accès sur autorisation du propriétaire (B2A-HIGH-TECHNOLOGY-AUTOMATION, Bayere Abdoul Aziz)
   Chaque téléphone envoie une demande (inscriptions/<uid>) ; l'application reste bloquée jusqu'à l'accord
   donné dans la page utilisateurs.html. Sans configuration Firebase, rien n'est bloqué. */
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
function form(err){const c=head("Demande d'accès","Cette application est réservée aux personnes autorisées par B2A. Remplissez ce formulaire : votre demande est envoyée au propriétaire, et l'application s'ouvre dès qu'elle est acceptée.");
  const g=el("div","grid2");const fld=(id,lb,type,ph,opts)=>{const f=el("div","field");const l=el("label",null,lb);l.htmlFor=id;let i;
    if(opts){i=el("select");i.append(new Option("Choisir…",""));opts.forEach(o=>i.append(new Option(o,o)))}else{i=el("input");i.type=type;if(ph)i.placeholder=ph}
    i.id=id;f.append(l,i);g.append(f);return i};
  const p=fld("acc-prenom","Prénom","text","ex. Moussa"),n=fld("acc-nom","Nom","text","ex. Ouédraogo"),v=fld("acc-ville","Ville ou village","text","ex. Koudougou"),
    py=fld("acc-pays","Pays","text","ex. Burkina Faso"),e=fld("acc-elev","Type d'élevage",null,null,ELEV),t=fld("acc-taille","Taille","text","ex. 500 pondeuses, 2 couveuses");
  py.value="Burkina Faso";[p,n,v,t].forEach(i=>{i.maxLength=60;i.autocomplete="off"});p.autocomplete="given-name";n.autocomplete="family-name";
  c.append(g);const m=el("p","msg"+(err?" err":""),err||"");m.setAttribute("aria-live","polite");c.append(m);
  const b=el("button","btn","Envoyer ma demande");b.type="button";c.append(b);
  c.append(el("p","note","Une connexion internet est nécessaire pour envoyer la demande. Ensuite, l'application marche sans internet."));
  b.onclick=async()=>{const d={prenom:p.value.trim(),nom:n.value.trim(),ville:v.value.trim(),pays:py.value.trim(),elevage:e.value,taille:t.value.trim()};
    if(!d.prenom||!d.nom){m.textContent="Indiquez votre prénom et votre nom.";m.className="msg err";return}
    if(!d.ville||!d.pays){m.textContent="Indiquez votre ville et votre pays.";m.className="msg err";return}
    if(!d.elevage){m.textContent="Choisissez votre type d'élevage.";m.className="msg err";return}
    if(!navigator.onLine){m.textContent="Pas de connexion internet. Connectez-vous puis appuyez à nouveau sur « Envoyer ma demande ».";m.className="msg err";return}
    b.disabled=true;b.textContent="Envoi…";m.textContent="";
    try{const u=await B.ensureUser(B.CFG);
      await firebase.firestore().doc("inscriptions/"+u.uid).set({...d,statut:"attente",creeLe:firebase.firestore.FieldValue.serverTimestamp(),vuLe:today(),
        plateforme:plateforme(),langue:(window.B2A_LANG?window.B2A_LANG():"fr"),version:VERSION,appareil:B.me});
      save({uid:u.uid,statut:"attente"});notify(d);wait()}
    catch(err){console.warn(err);b.disabled=false;b.textContent="Envoyer ma demande";m.textContent="L'envoi a échoué. Vérifiez la connexion et réessayez.";m.className="msg err"}}}

/* e-mail au propriétaire (FormSubmit, sans compte) */
function notify(d){const to=window.B2A_NOTIFY_EMAIL;if(!to)return;
  const admin=location.origin+location.pathname.replace(/[^/]*$/,"")+"utilisateurs.html";
  fetch("https://formsubmit.co/ajax/"+encodeURIComponent(to),{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},
    body:JSON.stringify({_subject:"B2A Smart Farming : nouvelle demande d'accès de "+d.prenom+" "+d.nom,_template:"table",_captcha:"false",
      "Prénom":d.prenom,"Nom":d.nom,"Ville":d.ville,"Pays":d.pays,"Élevage":d.elevage,"Taille":d.taille||"—","Appareil":plateforme(),
      "Valider la demande":admin.startsWith("http")?admin:"https://azizyou2005.github.io/b2a-smart-farming/utilisateurs.html"})}).catch(()=>{})}

let off=null;
function wait(){const c=head("Demande envoyée","Votre demande est en attente de validation par B2A. Cet écran s'ouvrira tout seul dès qu'elle sera acceptée.");
  const s=el("div","acc-wait");s.append(el("span","spinner"),el("span",null,navigator.onLine?"En attente de la réponse…":"Pas de connexion : la réponse s'affichera dès que vous serez connecté."));c.append(s);
  listen()}
function refused(st){const c=head(st==="bloque"?"Accès suspendu":"Demande refusée",st==="bloque"?"Votre accès à l'application a été suspendu par B2A.":"Votre demande d'accès n'a pas été acceptée.");
  c.append(el("p","note","Pour en parler, contactez B2A-HIGH-TECHNOLOGY-AUTOMATION :"));const a=el("p","acc-mail","azizyou2005@yahoo.fr");a.setAttribute("data-notr","");c.append(a)}

async function listen(){if(off)return;try{const u=await B.ensureUser(B.CFG);
  off=firebase.firestore().doc("inscriptions/"+u.uid).onSnapshot(d=>{if(!d.exists){if(d.metadata.fromCache)return;save(null);off&&off();off=null;show();form();return}
    const v=d.data(),st=v.statut;const was=acc&&acc.statut;save({uid:u.uid,statut:st});
    if(st==="approuve"){if(was!=="approuve"){hide();toast("Accès accordé. Bienvenue dans B2A Smart Farming.")}else hide();
      if(v.vuLe!==today()||v.version!==VERSION)d.ref.update({vuLe:today(),version:VERSION,plateforme:plateforme()}).catch(()=>{})}
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
