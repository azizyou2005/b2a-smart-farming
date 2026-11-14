/* B2A Smart Farming : page du ministère (ministere.html)
   Connexion par e-mail et mot de passe (compte créé par B2A), puis lecture des rapports publiés par B2A.
   Les règles Firestore ne donnent au ministère que la collection ministere_rapports (chiffres regroupés). */
(function(){
const $=id=>document.getElementById(id);
const R=window.B2A_RAPPORT;
if(!window.B2A_FIREBASE||!window.firebase||!R){$("m-lmsg").textContent="Service indisponible pour l'instant.";return}
if(!firebase.apps.length)firebase.initializeApp(window.B2A_FIREBASE);
const auth=firebase.auth(),db=firebase.firestore();let reps=[],off=null;
const err=c=>/invalid-credential|wrong-password|user-not-found|invalid-login|invalid-email/.test(c||"")?"E-mail ou mot de passe incorrect.":/too-many/.test(c||"")?"Trop d'essais. Réessayez dans quelques minutes.":"Connexion impossible. Vérifiez internet et réessayez.";
$("m-go").onclick=async()=>{const m=$("m-lmsg");m.className="msg";m.textContent="Connexion…";
  try{await auth.signInWithEmailAndPassword($("m-mail").value.trim(),$("m-pass").value);m.textContent=""}catch(e){m.textContent=err(e&&e.code);m.className="msg err"}};
$("m-pass").onkeydown=e=>{if(e.key==="Enter")$("m-go").click()};
$("m-forgot").onclick=async()=>{const m=$("m-lmsg"),mail=$("m-mail").value.trim();if(!mail){m.textContent="Écrivez d'abord votre e-mail.";m.className="msg err";return}
  try{await auth.sendPasswordResetEmail(mail)}catch(e){}m.textContent="Si ce compte existe, un e-mail pour choisir un nouveau mot de passe vient d'être envoyé.";m.className="msg"};
$("m-out").onclick=()=>auth.signOut();
$("m-print").onclick=()=>window.print();
$("m-csv").onclick=()=>{const r=reps.find(x=>x.id===$("m-sel").value);if(r)R.download(r)};
$("m-sel").onchange=()=>R.render($("m-rep"),reps.find(x=>x.id===$("m-sel").value));
auth.onAuthStateChanged(async u=>{if(off){off();off=null}reps=[];$("m-rep").innerHTML="";
  const inn=!!(u&&!u.isAnonymous);$("u-login").hidden=inn;$("m-out").hidden=!inn;$("mi-tools").hidden=true;$("m-refus").hidden=true;if(!inn)return;
  off=db.collection("ministere_rapports").orderBy("creeLe","desc").limit(50).onSnapshot(s=>{reps=s.docs.map(d=>({id:d.id,...d.data()}));
    const S=$("m-sel"),cur=S.value;S.innerHTML="";reps.forEach(r=>S.append(new Option(R.dLong(R.ms(r.creeLe))+" · "+(r.pays||"")+" · "+(r.nbFermes||0)+" fermes",r.id)));
    if(reps.some(r=>r.id===cur))S.value=cur;$("mi-tools").hidden=!reps.length;R.render($("m-rep"),reps.find(r=>r.id===S.value)||reps[0]||null)},
    ()=>{$("m-refus").hidden=false;$("mi-tools").hidden=true})});
})();
