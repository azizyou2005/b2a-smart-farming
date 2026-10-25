/* sécurité : refuser l'affichage dans un cadre d'un autre site */
if(window.top!==window.self){try{window.top.location=window.self.location.href}catch(e){document.documentElement.style.display="none"}}
/* B2A Smart Farming : services de l'application hors ligne
   (données sur le téléphone ou ferme partagée Firebase, IA par code d'accès, téléchargement des PDF) */
(function(){
const LS_DATA="b2a-farm-data-v1",LS_ME="b2a-device-id",LS_NAME="b2a-my-name",LS_FARM="b2a-farm-code",LS_CODE="b2a-ia-code",LS_INFO="b2a-ia-info";
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const lsSet=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}};
const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,10);
let me=lsGet(LS_ME);if(!me){me="d"+newId();lsSet(LS_ME,me)}
const CFG=window.B2A_FIREBASE||null;const farm=lsGet(LS_FARM)||"";
const IA_URL=(window.B2A_IA_URL||"").replace(/\/+$/,"")||null;
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const COLS=["lots","saisies","soins","analyses","previsions","formules","factures","reglages","members","contacts","depenses","couveuses","couvees"];

/* ---------- données sur le téléphone ---------- */
function makeLocal(){
  let data;try{data=JSON.parse(lsGet(LS_DATA)||"{}")}catch(e){data={}}
  const subs=new Set();let pT=0;
  const persist=()=>{clearTimeout(pT);pT=setTimeout(()=>{try{localStorage.setItem(LS_DATA,JSON.stringify(data))}catch(e){window.dispatchEvent(new CustomEvent("b2a-full"))}},150)};
  addEventListener("pagehide",()=>{clearTimeout(pT);try{localStorage.setItem(LS_DATA,JSON.stringify(data))}catch(e){}});
  const notify=()=>setTimeout(()=>subs.forEach(s=>{try{s.run()}catch(e){console.error(e)}}),0);
  const write=()=>{persist();notify()};
  const dsnap=(id,d)=>({id,exists:d!=null,data:()=>clone(d)});
  const qsnap=arr=>({docs:arr.map(([id,d])=>dsnap(id,d)),empty:!arr.length,size:arr.length});
  function docRef(name,id){return {id,path:name+"/"+id,
    get:async()=>dsnap(id,(data[name]||{})[id]),
    set:async(d,o)=>{const c=data[name]=data[name]||{};c[id]=o&&o.merge&&c[id]?Object.assign(c[id],clone(d)):clone(d);write()},
    update:async d=>{const c=(data[name]||{})[id];if(!c)throw {code:"not-found"};Object.assign(c,clone(d));write()},
    delete:async()=>{if(data[name])delete data[name][id];write()},
    onSnapshot(cb){const s={run:()=>cb(dsnap(id,(data[name]||{})[id]))};subs.add(s);setTimeout(s.run,0);return()=>subs.delete(s)}}}
  function query(name,filters,order,lim){
    const q={where:(f,op,v)=>query(name,[...filters,[f,op,v]],order,lim),orderBy:(f,d)=>query(name,filters,[f,d||"asc"],lim),limit:n=>query(name,filters,order,n),
      rows(){let r=Object.entries(data[name]||{});filters.forEach(([f,op,v])=>{if(op==="==")r=r.filter(([,d])=>d[f]===v)});
        if(order){const [f,dir]=order;r.sort((a,b)=>(a[1][f]>b[1][f]?1:a[1][f]<b[1][f]?-1:0)*(dir==="desc"?-1:1))}return lim?r.slice(0,lim):r},
      get:async()=>qsnap(q.rows()),
      onSnapshot(cb){const s={run:()=>cb(qsnap(q.rows()))};subs.add(s);setTimeout(s.run,0);return()=>subs.delete(s)},
      doc:id=>docRef(name,id||newId())};return q}
  return {kind:"local",collection:n=>query(n,[],null,null),doc:p=>{const i=p.indexOf("/");return docRef(p.slice(0,i),p.slice(i+1))}};
}

/* ---------- ferme partagée (Firebase, facultatif) ---------- */
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=()=>rej(new Error("load"));document.head.append(s)})}
/* chargement unique du SDK Firebase (partagé avec l'accès et la ferme) */
let fbP=null;
function loadFirebase(cfg){if(!fbP)fbP=(async()=>{const v="10.12.2",b=`https://www.gstatic.com/firebasejs/${v}/`;
  await loadScript(b+"firebase-app-compat.js");await loadScript(b+"firebase-auth-compat.js");await loadScript(b+"firebase-firestore-compat.js");
  if(!firebase.apps.length)firebase.initializeApp(cfg);
  /* cache illimité : les fiches déjà téléchargées restent sur le téléphone (la synchronisation ne relit que ce qui a changé) */
  const fs=firebase.firestore();try{fs.settings({ignoreUndefinedProperties:true,merge:true,cacheSizeBytes:firebase.firestore.CACHE_SIZE_UNLIMITED})}catch(e){}
  try{await fs.enablePersistence({synchronizeTabs:true});window.__b2aPersist=true}catch(e){window.__b2aPersist=false}
  return firebase})();fbP.catch(()=>{fbP=null});return fbP}
/* utilisateur Firebase de ce téléphone : on attend la session enregistrée avant d'en créer une */
let userP=null;
function ensureUser(cfg){if(!userP)userP=(async()=>{const fb=await loadFirebase(cfg);const a=fb.auth();
  const u=await new Promise(r=>{const off=a.onAuthStateChanged(x=>{off();r(x)})});
  if(u)return u;return (await a.signInAnonymously()).user})();userP.catch(()=>{userP=null});return userP}
async function makeCloud(cfg,code){
  await loadFirebase(cfg);
  const fs=firebase.firestore();
  ensureUser(cfg).catch(()=>{});
  const base="farms/"+code;const FV=firebase.firestore.FieldValue,TS=firebase.firestore.Timestamp;
  /* Firestore applique l'écriture tout de suite sur le téléphone, mais sa promesse attend la réponse du serveur.
     Sans réseau (ou réseau faible), les boutons « Enregistrer » restaient bloqués et on ne pouvait plus corriger.
     On rend la main après 1,5 s au plus : l'envoi se fait tout seul au retour du réseau. Une erreur rapide (droits) reste signalée. */
  const quick=pr=>{pr.catch(()=>{});return Promise.race([pr,new Promise(r=>setTimeout(()=>r("local"),1500))])};

  /* ---------- synchronisation économe ----------
     Avant : à chaque ouverture, l'application relisait toutes les fiches de la ferme (jusqu'à 1 000 saisies, 2 000 dépenses…),
     ce qui épuisait vite le quota gratuit de Firebase. Maintenant :
     - chaque écriture porte une date de modification « _m » (heure du serveur) ;
     - à l'ouverture, les fiches viennent du cache du téléphone, et seul ce qui a changé depuis la dernière fois est lu ;
     - une suppression devient « _del » (pour que les autres téléphones l'apprennent sans tout relire) ;
     - une relecture complète a lieu tous les 3 jours (et sur demande dans Réglages) pour rattraper les anciennes versions. */
  const NOSYNC=new Set(["members"]);const syncs={};
  const msOf=v=>v&&v.toMillis?v.toMillis():0;
  function sync(n){if(syncs[n])return syncs[n];
    const col=fs.collection(base+"/"+n),map=new Map(),subs=new Set(),K="b2a-sync-"+code+"-"+n;
    let st={};try{st=JSON.parse(lsGet(K)||"{}")}catch(e){}
    let ready=false,err=null,maxT=st.t||0;
    /* repère = heure serveur la plus récente reçue (jamais l'horloge du téléphone, qui peut être fausse) */
    const save=()=>{st.t=maxT;st.n=map.size;lsSet(K,JSON.stringify(st))};
    const emit=()=>{ready=true;subs.forEach(f=>{try{f.next()}catch(e){console.error(e)}})};
    const apply=snap=>{snap.docChanges().forEach(ch=>{if(ch.type==="removed"){map.delete(ch.doc.id);return}const d=ch.doc.data({serverTimestamps:"estimate"});map.set(ch.doc.id,d);
      if(!ch.doc.metadata.hasPendingWrites){const m=msOf(d._m);if(m>maxT)maxT=m}})};
    const fail=e=>{err=e;subs.forEach(f=>{try{f.error&&f.error(e)}catch(x){}})};
    const fullDue=!window.__b2aPersist||!st.t&&!st.full||Date.now()-(st.full||0)>3*864e5;
    const S={map,subs,get ready(){return ready},get err(){return err},
      local(id,d,mode){const cur=map.get(id);if(mode==="del")map.delete(id);else map.set(id,mode==="merge"&&cur?Object.assign({},cur,d):d);emit()}};
    (async()=>{
      if(!fullDue){let c=null;try{c=await col.get({source:"cache"})}catch(e){}
        if(c&&(c.size||!st.n)){c.docs.forEach(d=>map.set(d.id,d.data({serverTimestamps:"estimate"})));emit();
          const since=TS.fromMillis(Math.max(0,(st.t||0)-120000));
          col.where("_m",">",since).onSnapshot(s2=>{apply(s2);save();emit()},fail);return}}
      /* relecture complète */
      col.onSnapshot(s2=>{apply(s2);st.full=Date.now();save();emit()},fail)})();
    return syncs[n]=S}
  const alive=d=>d&&!d._del;
  const mkSnap=list=>({docs:list.map(([id,d])=>({id,exists:true,data:()=>d})),size:list.length,empty:!list.length,metadata:{fromCache:false}});
  /* requête sur une collection synchronisée : tri et limite appliqués sur le téléphone */
  function q(n,ord,lim,real){return {
    orderBy:(f,d)=>q(n,[f,d||"asc"],lim,real.orderBy(f,d)),limit:k=>q(n,ord,k,real.limit(k)),
    where:(...a)=>real.where(...a),
    get:async(o)=>{const s2=await real.get(o);const docs=s2.docs.filter(d=>alive(d.data()));return {docs,size:docs.length,empty:!docs.length}},
    onSnapshot(a,b){const next=typeof a==="function"?a:a&&a.next,error=typeof b==="function"?b:a&&a.error;
      if(NOSYNC.has(n))return real.onSnapshot(next,error);
      const S=sync(n);const sub={next:()=>{let L=[...S.map.entries()].filter(([,d])=>alive(d));
        if(ord){const [f,dir]=ord;const v=x=>{const y=x[1][f];return y&&y.toMillis?y.toMillis():y};L.sort((x,y)=>(v(x)>v(y)?1:v(x)<v(y)?-1:0)*(dir==="desc"?-1:1))}
        if(lim)L=L.slice(0,lim);next(mkSnap(L))},error};
      S.subs.add(sub);if(S.ready)setTimeout(sub.next,0);return()=>S.subs.delete(sub)}}}
  /* écritures : date de modification ajoutée, suppression « douce », mise à jour immédiate de l'écran */
  function wrapDoc(ref,n){const id=ref.id;const S=()=>n&&!NOSYNC.has(n)&&syncs[n];
    return new Proxy(ref,{get(t,k){
      if(k==="set")return (d,o)=>{const body={...d,_m:FV.serverTimestamp(),_del:false};
        const s2=S();if(s2)s2.local(id,{...d,_m:TS.now(),_del:false},o&&o.merge?"merge":"set");return quick(o?t.set(body,o):t.set(body))};
      if(k==="update")return d=>{const s2=S();if(s2)s2.local(id,{...d,_m:TS.now()},"merge");return quick(t.update({...d,_m:FV.serverTimestamp()}))};
      if(k==="delete")return ()=>{if(NOSYNC.has(n))return quick(t.delete());const s2=S();if(s2)s2.local(id,null,"del");
        return quick(t.set({_del:true,_m:FV.serverTimestamp()},{merge:true}))};
      if(k==="get")return async o=>{const d=await t.get(o);const x=d.exists?d.data():null;return {id,exists:!!x&&alive(x),data:()=>x,ref:t}};
      if(k==="onSnapshot")return (a,b)=>{const next=typeof a==="function"?a:a&&a.next,error=typeof b==="function"?b:a&&a.error;
        return t.onSnapshot(d=>{const x=d.exists?d.data():null;next({id,exists:!!x&&alive(x),data:()=>x,metadata:d.metadata})},error)};
      const v=t[k];return typeof v==="function"?v.bind(t):v}})}
  const wrapCol=(col,n)=>{const Q=q(n,null,null,col);return new Proxy(col,{get(t,k){
      if(k==="doc")return (...a)=>wrapDoc(t.doc(...a),n);
      if(k in Q)return Q[k];const v=t[k];return typeof v==="function"?v.bind(t):v}})};
  return {kind:"cloud",collection:n=>wrapCol(fs.collection(base+"/"+n),n),doc:p=>{const i=p.indexOf("/");return wrapDoc(fs.doc(base+"/"+p),p.slice(0,i))},
    resync:()=>{Object.keys(localStorage).filter(k=>k.startsWith("b2a-sync-"+code+"-")).forEach(k=>lsSet(k,null))}};
}
const today=()=>new Date().toISOString().slice(0,10);
const withTimeout=(p,ms)=>Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error("timeout")),ms))]);

/* ---------- équipe de la ferme : propriétaire et employés ----------
   farms/<code>               : { owner: identifiant Firebase du propriétaire, approbation: true/false }
   farms/<code>/members/<uid> : { name, dev, role: proprietaire|employe, statut: actif|attente|retire, vu }
   Une ferme sans document "farms/<code>" (créée avant cette version) reste ouverte à tous ceux qui ont le code. */
const TEAM={uid:null,owner:null,approbation:false,role:null,statut:null,list:[]};
async function joinFarm(cfg,code){
  const KEY="b2a-team-"+code;let saved=null;try{saved=JSON.parse(lsGet(KEY)||"null")}catch(e){}
  const apply=t=>{Object.assign(TEAM,{uid:t.uid,owner:t.owner,approbation:!!t.approbation,role:t.role,statut:t.statut})};
  const run=async()=>{
    const u=await ensureUser(cfg);const fs=firebase.firestore();
    const fRef=fs.doc("farms/"+code),mRef=fs.doc("farms/"+code+"/members/"+u.uid);
    let f=null;try{const s=await withTimeout(fRef.get(),15000);f=s.exists?s.data():null}catch(e){if(saved)return}
    const isOwn=!!(f&&f.owner===u.uid);
    let m=null;try{const s=await withTimeout(mRef.get(),15000);m=s.exists?s.data():null}catch(e){if(saved)return}
    const name=lsGet(LS_NAME)||"";
    if(!m){
      m={name,dev:me,role:isOwn?"proprietaire":"employe",statut:(!f||isOwn||!f.approbation)?"actif":"attente",vu:today(),
        creeLe:firebase.firestore.FieldValue.serverTimestamp()};
      /* il faut être inscrit dans l'équipe avant de lire les données de la ferme */
      await withTimeout(mRef.set(m),15000).catch(()=>{});
    }else{const up={vu:today(),dev:me};if(name&&name!==m.name)up.name=name;mRef.update(up).catch(()=>{})}
    const t={uid:u.uid,owner:f?f.owner:null,approbation:!!(f&&f.approbation),role:isOwn?"proprietaire":(f?"employe":"libre"),statut:isOwn?"actif":m.statut};
    const changed=saved&&(saved.statut!==t.statut||saved.role!==t.role);
    apply(t);lsSet(KEY,JSON.stringify(t));
    if(changed)location.reload();
    /* quand le propriétaire accepte ou retire ce téléphone, l'application se recharge */
    mRef.onSnapshot(s=>{if(!s.exists||s.metadata.fromCache||isOwn)return;const st=(s.data()||{}).statut;
      if(st&&st!==TEAM.statut){TEAM.statut=st;lsSet(KEY,JSON.stringify({...t,statut:st}));location.reload()}},()=>{});
    fRef.onSnapshot(s=>{if(s.metadata.fromCache)return;const d=s.exists?s.data():null;TEAM.owner=d?d.owner:null;TEAM.approbation=!!(d&&d.approbation);
      window.dispatchEvent(new CustomEvent("b2a-team"))},()=>{});
    window.dispatchEvent(new CustomEvent("b2a-team"));
  };
  /* déjà membre : on ouvre tout de suite (même sans internet) et on vérifie en arrière-plan */
  if(saved){apply(saved);run().catch(()=>{});return}
  await run();
}
let dbP=null;
function getDb(){if(!dbP)dbP=(async()=>{
  if(CFG&&farm){try{const db=await makeCloud(CFG,farm);try{await joinFarm(CFG,farm)}catch(e){}return db}catch(e){B2A.cloudFail=true;return makeLocal()}}
  return makeLocal()})();return dbP}

/* ---------- membres de l'équipe (noms) ---------- */
const members={};
getDb().then(db=>{
  db.collection("members").onSnapshot(s=>{
    TEAM.list=s.docs.map(d=>({id:d.id,...(d.data()||{})}));
    TEAM.list.forEach(d=>{members[d.dev||d.id]=d.name||""});
    window.dispatchEvent(new CustomEvent("b2a-team"))},()=>{});
  const n=lsGet(LS_NAME);if(n&&db.kind==="local")db.doc("members/"+me).set({name:n,vu:today()}).catch(()=>{});
});
const USER={
  id:async()=>me,
  me:async()=>({name:lsGet(LS_NAME)||""}),
  can:async()=>true,
  profiles:async ids=>{const o={};(ids||[]).forEach(i=>{const n=members[i]||(i===me?lsGet(LS_NAME):"");o[i]={name:n||"Quelqu'un"}});return o}
};

/* ---------- téléchargement des PDF ---------- */
const blobB64=b=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(",")[1]);r.onerror=rej;r.readAsDataURL(b)});
const DL={save:async({filename,data})=>{
  const C=window.Capacitor;
  if(C&&C.isNativePlatform&&C.isNativePlatform()&&C.Plugins&&C.Plugins.Filesystem){
    const b64=await blobB64(data);
    const w=await C.Plugins.Filesystem.writeFile({path:filename,data:b64,directory:"CACHE"});
    if(C.Plugins.Share)await C.Plugins.Share.share({title:filename,url:w.uri,dialogTitle:filename}).catch(()=>{});
    return {ok:true}}
  const a=document.createElement("a");a.href=URL.createObjectURL(data);a.download=filename;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),20000);return {ok:true}}};

/* ---------- IA avec code d'accès ---------- */
let iaCode=lsGet(LS_CODE)||"",iaInfo=null;try{iaInfo=iaCode?JSON.parse(lsGet(LS_INFO)||"null"):null}catch(e){iaInfo=null}
function iaSave(){lsSet(LS_CODE,iaCode||null);lsSet(LS_INFO,iaInfo?JSON.stringify(iaInfo):null);window.dispatchEvent(new CustomEvent("b2a-ia"))}
async function iaCall(path,body,signal){
  const r=await fetch(IA_URL+path,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body),signal});
  let d={};try{d=await r.json()}catch(e){}
  if(!r.ok)throw {status:r.status,msg:d.erreur||""};return d}
function toJpeg(file){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>{const m=1280,r=Math.min(1,m/Math.max(im.width,im.height));
  const c=document.createElement("canvas");c.width=Math.round(im.width*r);c.height=Math.round(im.height*r);c.getContext("2d").drawImage(im,0,0,c.width,c.height);
  res(c.toDataURL("image/jpeg",0.82).split(",")[1])};im.onerror=()=>rej({code:"image_rejected"});im.src=URL.createObjectURL(file)})}
const SAMPLE={
  limits:async()=>({images:3}),
  json:async(prompt,opts={})=>{
    if(!navigator.onLine)throw {code:"offline"};
    const imgs=await Promise.all((opts.images||[]).slice(0,3).map(toJpeg));
    let d;try{d=await iaCall("/analyse",{code:iaCode,tache:"libre",prompt:String(prompt),images:imgs},opts.signal)}
    catch(e){if(e&&e.name==="AbortError")throw {code:"cancelled"};
      if(e&&(e.status===401||e.status===403)){iaCode="";iaInfo=null;iaSave();throw {code:"not_granted"}}
      if(e&&e.status===429){if(iaInfo){iaInfo.restant=0;iaSave()}throw {code:"rate_limited"}}
      if(e&&e.status===413)throw {code:"image_rejected"};
      throw {code:"network"}}
    if(iaInfo){iaInfo.restant=d.restant;iaSave()}
    return d.resultat}
};

/* ---------- interface commune ---------- */
window.B2A={me,farm,CFG,IA_URL,COLS,lsGet,lsSet,newId,getDb,makeLocal,makeCloud,loadFirebase,ensureUser,members,team:TEAM,
  LS_NAME,LS_FARM,
  ia:()=>({code:iaCode,info:iaInfo}),
  iaVerify:async code=>{const d=await iaCall("/verifier",{code});iaCode=code;iaInfo={nom:d.nom,restant:d.restant};iaSave();return iaInfo},
  iaForget:()=>{iaCode="";iaInfo=null;iaSave()},
  iaRefresh:async()=>{if(!IA_URL||!iaCode||!navigator.onLine)return;try{const d=await iaCall("/verifier",{code:iaCode});iaInfo={nom:d.nom,restant:d.restant};iaSave()}catch(e){if(e&&(e.status===401||e.status===403)){iaCode="";iaInfo=null;iaSave()}}}
};
window.claude={use:async name=>{
  if(name==="db")return getDb();
  if(name==="user")return USER;
  if(name==="downloads")return DL;
  if(name==="sample")return IA_URL&&iaCode&&iaInfo?SAMPLE:null;
  return null}};
})();
