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
async function makeCloud(cfg,code){
  const v="10.12.2",b=`https://www.gstatic.com/firebasejs/${v}/`;
  await loadScript(b+"firebase-app-compat.js");await loadScript(b+"firebase-auth-compat.js");await loadScript(b+"firebase-firestore-compat.js");
  if(!firebase.apps.length)firebase.initializeApp(cfg);
  const fs=firebase.firestore();try{fs.settings({ignoreUndefinedProperties:true,merge:true})}catch(e){}
  try{await fs.enablePersistence({synchronizeTabs:true})}catch(e){}
  firebase.auth().signInAnonymously().catch(()=>{});
  const base="farms/"+code;
  return {kind:"cloud",collection:n=>fs.collection(base+"/"+n),doc:p=>fs.doc(base+"/"+p)};
}
let dbP=null;
function getDb(){if(!dbP)dbP=(async()=>{
  if(CFG&&farm){try{return await makeCloud(CFG,farm)}catch(e){B2A.cloudFail=true;return makeLocal()}}
  return makeLocal()})();return dbP}

/* ---------- membres de l'équipe (noms) ---------- */
const members={};
getDb().then(db=>{
  db.collection("members").onSnapshot(s=>{s.docs.forEach(d=>{members[d.id]=(d.data()||{}).name||""})},()=>{});
  const n=lsGet(LS_NAME);if(n)db.doc("members/"+me).set({name:n,vu:new Date().toISOString().slice(0,10)}).catch(()=>{});
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
window.B2A={me,farm,CFG,IA_URL,COLS,lsGet,lsSet,newId,getDb,makeLocal,makeCloud,members,
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
