/* B2A Smart Farming : caméras de la ferme (novembre 2026)
   Un clic sur « Ouvrir les caméras » ouvre directement l'écran des caméras, en direct dans l'application.
   Les caméras IP (ONVIF/RTSP) passent par le boîtier vidéo B2A installé à la ferme (serveur go2rtc) ;
   le téléphone le joint sur le réseau de la ferme ou à distance avec la VPN du routeur B2A.
   Secours : l'application cloud du fabricant (EseeCloud), ouverte directement, sans passer par le Play Store.
   Aucune adresse ni aucun identifiant n'est écrit ici (dépôt public) : les réglages restent sur le téléphone. */
(function(){
const LS="b2a-cameras";
const PKG="com.juanvision.eseecloud30";
const PLAY="https://play.google.com/store/apps/details?id="+PKG;
const IOS="https://apps.apple.com/app/id1032277907";
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const notr=e=>{e.setAttribute("data-notr","");return e};
const btn=(cls,txt,fn)=>{const b=el("button",cls,txt);b.type="button";if(fn)b.onclick=fn;return b};
const C=()=>window.Capacitor;
const native=()=>{const c=C();return !!(c&&c.isNativePlatform&&c.isNativePlatform())};
const plug=n=>{const c=C();return c&&c.Plugins&&c.Plugins[n]||null};

let cfg={srv:"",cams:[]};
try{const s=JSON.parse(localStorage.getItem(LS)||"{}");if(s&&typeof s==="object")cfg={srv:String(s.srv||""),cams:Array.isArray(s.cams)?s.cams.filter(c=>c&&c.id):[]}}catch(e){}
const save=()=>{try{localStorage.setItem(LS,JSON.stringify(cfg))}catch(e){}};
const base=()=>{let s=cfg.srv.trim().replace(/\/+$/,"");if(s&&!/^https?:\/\//i.test(s))s="http://"+s;return s};
const enc=encodeURIComponent;
const frameUrl=c=>base()+"/api/frame.jpeg?src="+enc(c.id)+"&t="+Date.now();
const liveUrl=c=>base()+"/stream.html?src="+enc(c.id)+"&mode=webrtc,mse,hls,mjpeg";
/* site web en https : le navigateur bloque les images http de la ferme ; l'application Android les accepte */
const blocked=()=>!native()&&location.protocol==="https:"&&/^http:/i.test(base());

/* ---------- application de secours (cloud du fabricant), ouverte directement ---------- */
async function openCloud(){
  const ua=navigator.userAgent||"";
  if(native()&&/Android/i.test(ua)){
    const AL=plug("AppLauncher");
    if(AL){try{const r=await AL.canOpenUrl({url:PKG});if(r&&r.value){await AL.openUrl({url:PKG});return}}catch(e){}}
    window.location.href="market://details?id="+PKG;return}
  if(/Android/i.test(ua)){window.location.href="intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package="+PKG+";S.browser_fallback_url="+enc(PLAY)+";end";return}
  if(/iPhone|iPad|iPod/i.test(ua)||(/Macintosh/i.test(ua)&&"ontouchend" in document)){window.location.href=IOS;return}
  window.open(PLAY,"_blank","noopener")}

/* ---------- écran ---------- */
const CSS=`.cam-ov{position:fixed;inset:0;z-index:8600;background:var(--bg);overflow:auto;-webkit-overflow-scrolling:touch}
.cam-top{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--surface);border-bottom:1px solid var(--line)}
.cam-top h2{margin:0;font-size:18px;color:var(--heading)}
.cam-wrap{max-width:900px;margin:0 auto;padding:12px 12px 90px;display:grid;gap:12px}
.cam-st{border-radius:12px;padding:10px 12px;font-size:14px;background:var(--surface);border:1px solid var(--line);color:var(--muted)}
.cam-st.ok{border-color:var(--ok);color:var(--ok)} .cam-st.bad{border-color:var(--bad);color:var(--bad);background:var(--bad-bg)}
.cam-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}
.cam-tile{position:relative;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#0b1220;cursor:pointer;padding:0;text-align:left;font:inherit;color:#fff}
.cam-tile .cam-img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:#0b1220}
.cam-tile .cam-off{display:none;position:absolute;inset:0 0 34px;place-items:center;font-size:14px;color:#c9d3e3;padding:10px;text-align:center}
.cam-tile.off .cam-off{display:grid} .cam-tile.off .cam-img{visibility:hidden}
.cam-tile .cam-lb{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 10px;background:var(--navy);font:700 14px var(--body)}
.cam-tile .cam-dot{width:10px;height:10px;border-radius:50%;background:var(--ok);flex:none} .cam-tile.off .cam-dot{background:var(--bad)}
.cam-live{position:fixed;inset:0;z-index:8700;background:#000;display:flex;flex-direction:column}
.cam-live .cam-top{background:#0b1220;border-color:#1d2a44} .cam-live .cam-top h2{color:#fff}
.cam-live iframe{flex:1;width:100%;border:0;background:#000}
.cam-row2{display:flex;gap:8px;flex-wrap:wrap}
.cam-list{display:grid;gap:8px}
.cam-li{display:grid;grid-template-columns:1fr 1fr auto;gap:6px;align-items:end}
@media (max-width:520px){.cam-li{grid-template-columns:1fr auto}.cam-li .field:first-child{grid-column:1/-1}}`;

let ov=null,timer=null,live=null;
function stopTimer(){if(timer){clearInterval(timer);timer=null}}
function open(){
  close();
  if(!$("cam-css")){const s=el("style");s.id="cam-css";s.textContent=CSS;document.head.append(s)}
  ov=el("div","cam-ov");ov.id="cam-ov";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-labelledby","cam-t");
  const top=el("div","cam-top");const bk=btn("back","‹ Retour",close);const h=el("h2",null,"Caméras de la ferme");h.id="cam-t";top.append(bk,h);
  const wrap=el("div","cam-wrap");wrap.id="cam-wrap";ov.append(top,wrap);document.body.append(ov);document.body.style.overflow="hidden";
  render();bk.focus()}
function close(){stopTimer();closeLive();if(ov){ov.remove();ov=null;document.body.style.overflow=""}}

function render(){
  const w=$("cam-wrap");if(!w)return;stopTimer();w.textContent="";
  if(!base()||!cfg.cams.length){
    const c=el("section","card");
    c.append(el("h2","sec","Aucune caméra configurée"),
      el("p","note","Ajoutez l'adresse du boîtier vidéo de la ferme et vos caméras pour les voir ici en direct."),
      el("p","note","À distance, activez d'abord la VPN B2A sur ce téléphone."));
    const r=el("div","cam-row2");r.append(btn("btn","Réglages des caméras",()=>settings()),btn("btn ghost","Ouvrir EseeCloud (secours)",openCloud));c.append(r);w.append(c);return}
  const st=el("div","cam-st","Connexion aux caméras…");st.id="cam-st";st.setAttribute("role","status");w.append(st);
  if(blocked()){st.className="cam-st";st.textContent="Sur le site web, chaque caméra s'ouvre dans un nouvel onglet. Pour les voir ici, utilisez l'application Android."}
  const g=el("div","cam-grid");g.id="cam-grid";
  cfg.cams.forEach((c,i)=>{
    const t=el("button","cam-tile");t.type="button";t.dataset.i=i;
    const img=el("img","cam-img");img.alt="";img.decoding="async";
    const off=el("span","cam-off","Caméra injoignable");
    const lb=el("span","cam-lb");lb.append(notr(el("span",null,c.nom||c.id)),el("i","cam-dot"));
    t.append(img,off,lb);t.onclick=()=>openLive(c);
    if(blocked())t.classList.add("off");
    else{img.onload=()=>{t.classList.remove("off");status()};img.onerror=()=>{t.classList.add("off");status()};img.src=frameUrl(c)}
    g.append(t)});
  w.append(g);
  const r=el("div","cam-row2");r.append(btn("btn ghost","Réglages des caméras",()=>settings()),btn("btn ghost","Ouvrir EseeCloud (secours)",openCloud));w.append(r);
  if(!blocked())timer=setInterval(refresh,4000)}
let stT=null;
function status(){clearTimeout(stT);stT=setTimeout(()=>{const st=$("cam-st"),g=$("cam-grid");if(!st||!g||blocked())return;
  const all=[...g.children],off=all.filter(t=>t.classList.contains("off")).length;
  if(!off){st.className="cam-st ok";st.textContent="Caméras connectées. Touchez une caméra pour la voir en direct."}
  else if(off===all.length){st.className="cam-st bad";st.textContent="Caméras injoignables. À distance, activez la VPN B2A sur ce téléphone, puis réessayez. Sinon, utilisez EseeCloud (secours)."}
  else{st.className="cam-st";st.textContent="Certaines caméras ne répondent pas : vérifiez leur batterie solaire et leur réseau."}},300)}
function refresh(){if(document.hidden||live)return;const g=$("cam-grid");if(!g)return;
  [...g.children].forEach(t=>{const c=cfg.cams[+t.dataset.i];const img=t.querySelector("img");if(c&&img)img.src=frameUrl(c)})}

function openLive(c){
  if(blocked()){window.open(liveUrl(c),"_blank","noopener");return}
  closeLive();live=el("div","cam-live");live.setAttribute("role","dialog");live.setAttribute("aria-modal","true");
  const top=el("div","cam-top");const bk=btn("back","‹ Retour",closeLive);const h=notr(el("h2",null,c.nom||c.id));top.append(bk,h);
  const f=el("iframe");f.src=liveUrl(c);f.title=c.nom||c.id;f.setAttribute("allow","autoplay; fullscreen");f.setAttribute("allowfullscreen","");
  live.append(top,f);document.body.append(live);bk.focus()}
function closeLive(){if(live){live.remove();live=null}}
document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;if(live)closeLive();else if(ov)close()});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&ov&&!live)refresh()});

/* ---------- réglages (gardés sur ce téléphone seulement) ---------- */
function field(lbl,input,help){const f=el("div","field");const id="cam-"+Math.random().toString(36).slice(2,8);input.id=id;const l=el("label",null,lbl);l.htmlFor=id;f.append(l,input);if(help)f.append(el("small",null,help));return f}
function txt(v,ph){const i=notr(el("input"));i.type="text";i.value=v||"";if(ph)i.placeholder=ph;i.autocomplete="off";i.spellcheck=false;i.maxLength=120;return i}
function settings(){
  const w=$("cam-wrap");if(!w)return;stopTimer();w.textContent="";
  const draft={srv:cfg.srv,cams:cfg.cams.map(c=>({id:c.id,nom:c.nom||""}))};
  const c1=el("section","card");c1.append(el("h2","sec","Boîtier vidéo de la ferme"));
  const srv=txt(draft.srv,"http://192.168.1.10:1984");srv.inputMode="url";srv.oninput=()=>{draft.srv=srv.value};
  c1.append(field("Adresse du boîtier vidéo",srv,"Adresse locale du serveur vidéo qui reçoit les caméras ONVIF/RTSP. À distance, elle fonctionne avec la VPN B2A active."));
  const msg=el("p","note");msg.setAttribute("role","status");
  const find=btn("btn ghost","Rechercher les caméras",async()=>{
    draft.srv=srv.value;const b=draft.srv.trim().replace(/\/+$/,"");const u=(/^https?:\/\//i.test(b)?b:"http://"+b)+"/api/streams";
    if(!b){msg.textContent="Indiquez d'abord l'adresse du boîtier vidéo.";return}
    msg.textContent="Recherche des caméras…";
    try{const ctl=new AbortController();const tm=setTimeout(()=>ctl.abort(),6000);const r=await fetch(u,{signal:ctl.signal,cache:"no-store"});clearTimeout(tm);
      const j=await r.json();const ids=Object.keys(j||{});let n=0;
      ids.forEach(id=>{if(!draft.cams.some(c=>c.id===id)){draft.cams.push({id,nom:id});n++}});
      msg.textContent=ids.length?"Caméras trouvées : "+ids.length+". Nouvelles : "+n+".":"Aucune caméra trouvée sur ce boîtier.";list()}
    catch(e){msg.textContent="Boîtier vidéo injoignable. Vérifiez l'adresse, le réseau de la ferme ou la VPN B2A."}});
  c1.append(find,msg);
  const c2=el("section","card");c2.append(el("h2","sec","Mes caméras"),el("p","note","Nom affiché et nom du flux dans le boîtier vidéo (par exemple : pondoir, entree, champ-nord)."));
  const L=el("div","cam-list");c2.append(L);
  function list(){L.textContent="";
    draft.cams.forEach((c,i)=>{const row=el("div","cam-li");
      const n=txt(c.nom,"Pondoir");n.oninput=()=>{c.nom=n.value};const f=txt(c.id,"pondoir");f.oninput=()=>{c.id=f.value.trim()};
      row.append(field("Nom de la caméra",n),field("Flux",f),btn("btn small ghost","Supprimer",()=>{draft.cams.splice(i,1);list()}));L.append(row)});
    if(!draft.cams.length)L.append(el("p","note","Aucune caméra pour l'instant."))}
  list();
  c2.append(btn("btn small ghost","+ Ajouter une caméra",()=>{draft.cams.push({id:"",nom:""});list()}));
  const r=el("div","cam-row2");
  r.append(btn("btn","Enregistrer",()=>{cfg={srv:draft.srv.trim(),cams:draft.cams.filter(c=>c.id).map(c=>({id:c.id,nom:(c.nom||"").trim()||c.id}))};save();render()}),
    btn("btn ghost","Annuler",render));
  const c3=el("section","card");c3.append(el("p","note","Ces réglages restent sur ce téléphone : ils ne sont jamais envoyés à B2A ni sur internet."));
  w.append(c1,c2,r,c3);srv.focus()}

/* bouton de l'accueil : un clic → caméras en direct */
const b=$("btn-cameras");if(b)b.addEventListener("click",open);
window.B2A_CAMS={open,close,openCloud};
})();
