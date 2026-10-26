/* B2A Smart Farming : signalement des erreurs techniques à B2A
   Quand l'application plante sur un téléphone, un message court est envoyé à B2A (texte de l'erreur, fichier, version,
   type de téléphone, langue, écran). Aucune donnée de la ferme, aucun nom, aucun numéro.
   Au plus 5 erreurs différentes par ouverture ; hors connexion, elles attendent le retour du réseau (10 au plus).
   Seul le propriétaire de l'application les lit, dans utilisateurs.html. */
(function(){
const B=window.B2A;if(!B||!B.CFG)return;
const LS="b2a-err-q",MAX=5,QMAX=10;let sent=0;const seen={};
const load=()=>{try{return JSON.parse(localStorage.getItem(LS)||"[]")}catch(e){return []}};
const save=q=>{try{q.length?localStorage.setItem(LS,JSON.stringify(q.slice(-QMAX))):localStorage.removeItem(LS)}catch(e){}};
const ver=()=>{const s=document.querySelector('script[src*="app.js"]');const m=s&&/[?&]v=(\d+)/.exec(s.src);return m?"v"+m[1]:""};
const plat=()=>{const C=window.Capacitor;return C&&C.isNativePlatform&&C.isNativePlatform()?"android (apk)":/iphone|ipad/i.test(navigator.userAgent)?"iphone (web)":/android/i.test(navigator.userAgent)?"android (web)":"ordinateur (web)"};
/* on retire les adresses complètes (seul le nom du fichier compte) et tout ce qui ressemble à un numéro de téléphone ou un e-mail */
const clean=(s,n)=>String(s||"").replace(/https?:\/\/[^\s)'"]*\/([^\/\s)'"?]+)(\?[^\s)'"]*)?/g,"$1").replace(/[\w.+-]+@[\w-]+\.[\w.]+/g,"[e-mail]").replace(/\+?\d[\d  ]{7,}\d/g,"[nombre]").slice(0,n);
/* bruit sans intérêt : réseau coupé, droits Firebase, extensions du navigateur */
const NOISE=/network|offline|failed to fetch|load failed|unavailable|permission|quota|aborterror|the operation was aborted|resizeobserver|script error|chrome-extension|moz-extension/i;
function rec(msg,src,line,col,stack){msg=String(msg||"");if(!msg||NOISE.test(msg)||NOISE.test(String(src||"")))return;
  const key=msg+"|"+src+"|"+line;if(seen[key]||sent>=MAX)return;seen[key]=1;sent++;
  let lang="fr";try{lang=window.B2A_LANG?window.B2A_LANG():"fr"}catch(e){}
  const d={msg:clean(msg,300),src:clean((src||"")+(line?":"+line+":"+(col||0):""),200),pile:clean(stack,1500),version:ver(),plateforme:plat(),langue:String(lang).slice(0,5),
    ecran:(location.hash||"").slice(1,30)||"tableau",nb:1};
  const q=load();const same=q.find(x=>x.msg===d.msg&&x.src===d.src);if(same)same.nb=Math.min(100,(same.nb||1)+1);else q.push(d);save(q);setTimeout(flush,2000)}
let busy=false;
async function flush(){if(busy||!navigator.onLine)return;const fb=window.firebase;if(!fb||!fb.apps||!fb.apps.length||!fb.auth||!fb.auth().currentUser)return;
  const q=load();if(!q.length)return;busy=true;save([]);
  try{const col=fb.firestore().collection("erreurs");for(const d of q)await col.add({...d,creeLe:fb.firestore.FieldValue.serverTimestamp()})}
  catch(e){/* refus (règles pas encore publiées) : on n'insiste pas */}finally{busy=false}}
addEventListener("error",e=>{if(!e||e.target&&e.target!==window)return;rec(e.message,e.filename,e.lineno,e.colno,e.error&&e.error.stack)});
addEventListener("unhandledrejection",e=>{const r=e&&e.reason;rec(r&&r.message||String(r||""),"",0,0,r&&r.stack)});
addEventListener("online",()=>setTimeout(flush,3000));
setTimeout(flush,15000);
window.B2A_ERREURS={flush,count:()=>load().length};
})();
