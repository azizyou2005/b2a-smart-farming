/* ---------- langues (français, anglais, italien) ---------- */
(function(){
const LS_LANG="b2a-lang";
let LANG="fr";try{LANG=localStorage.getItem(LS_LANG)||"fr"}catch(e){}
if(!["fr","en","it","es"].includes(LANG))LANG="fr";
const LOCS={fr:"fr-FR",en:"en-GB",it:"it-IT",es:"es-ES"};
const DICT=window.B2A_DICT||{en:{},it:{}};
const MF=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const MA=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
const JR=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const MONTHS=[...MF.map((m,i)=>[m,i,"long"]),...MA.filter(m=>m.endsWith(".")).map(m=>[m,MA.indexOf(m),"short"])].sort((a,b)=>b[0].length-a[0].length);
const MALT=MONTHS.map(m=>esc(m[0])).join("|");
const DATE_RE=new RegExp(`(?:(${JR.join("|")}) )?(\\d{1,2}|1er) (${MALT})(?: (\\d{4}))?(?![\\p{L}])|(?<![\\p{L}\\d])(${MALT}) (\\d{4}|\\d{2})(?!\\d)`,"gu");
const NUM_RE=/\d{1,3}(?:[  ]\d{3})+(?:,\d+)?|\d+(?:,\d+)?/g;
const mInfo=name=>MONTHS.find(m=>m[0]===name);
function tokenize(s){
  const toks=[];let key="";let last=0;const parts=[];
  s.replace(DATE_RE,(m,wd,d,mo,y,mo2,y2,off)=>{parts.push([off,m.length,{t:"date",wd:!!wd,d:d?(d==="1er"?1:Number(d)):null,m:mInfo(mo||mo2),y:y||y2||null,raw:m}]);return m});
  const masked=s.replace(DATE_RE,m=>"\u0000".repeat(m.length));
  masked.replace(NUM_RE,(m,off)=>{parts.push([off,m.length,{t:"num",raw:m}]);return m});
  parts.sort((a,b)=>a[0]-b[0]);
  for(const[off,len,tok]of parts){key+=s.slice(last,off)+"{"+toks.length+"}";toks.push(tok);last=off+len}
  key+=s.slice(last);return {key,toks};
}
function fmtTok(tok,lang){const loc=LOCS[lang];
  if(tok.t==="num"){if(lang==="fr"||/^0\d/.test(tok.raw))return tok.raw;const r=tok.raw.replace(/[  ]/g,"");const dec=(r.split(",")[1]||"").length;const v=Number(r.replace(",","."));
    if(!isFinite(v))return tok.raw;return v.toLocaleString(loc,{minimumFractionDigits:dec,maximumFractionDigits:dec,useGrouping:r.length>4})}
  if(lang==="fr")return tok.raw;
  const now=new Date();const yy=tok.y?(tok.y.length===2?2000+Number(tok.y):Number(tok.y)):now.getFullYear();const dt=new Date(yy,tok.m[1],tok.d||1,12);
  if(tok.d==null)return dt.toLocaleDateString(loc,tok.y&&tok.y.length===2?{month:"short",year:"2-digit"}:{month:tok.m[2],year:"numeric"});
  const o={day:"numeric",month:tok.m[2]};if(tok.y)o.year="numeric";if(tok.wd)o.weekday="long";return dt.toLocaleDateString(loc,o)}
const norm=s=>s.replace(/[\s  ]+/g," ").trim();
const hasWords=k=>/\p{L}{2,}/u.test(k.replace(/\{q?\d+\}/g,""));
function trCore(src,lang){
  const lead=src.match(/^\s*/)[0],trail=src.match(/\s*$/)[0];const body=src.slice(lead.length,src.length-trail.length);if(!body)return src;
  const qs=[];const qb=body.replace(/« ([^«»]+?) »/g,(m,x)=>{qs.push(x);return "« "+String.fromCharCode(0xE000+qs.length-1)+" »"});
  const {key:key0,toks}=tokenize(qb);const k=norm(key0.replace(/[\uE000-\uE0FF]/g,c=>"{q"+(c.charCodeAt(0)-0xE000)+"}"));
  if(window.__i18nCollect)qs.forEach(x=>trCore(x,"fr"));
  if(window.__i18nCollect&&hasWords(k)){window.__i18nCollect.add(k);if(body.includes(" · "))body.split(" · ").forEach(x=>trCore(x,"fr"));const mm=body.match(/^(.*?) : (.+)$/s);if(mm){trCore(mm[1],"fr");trCore(mm[2],"fr")}}
  if(lang==="fr")return src;
  const D=DICT[lang]||{};let tpl=D[k];
  if(tpl==null){
    if(!hasWords(k))tpl=k;
    else if(/^- /.test(body)){const r=trCore(body.slice(2),lang);if(r!==body.slice(2))return lead+"- "+r+trail;return src}
    else if(/[.!?] [A-ZÀ-Ý«]/.test(body)&&!k.includes(" · ")){const ss=body.split(/(?<=[.!?]) (?=[A-ZÀ-Ý«])/);const out=ss.map(x=>trCore(x,lang));if(out.some((x,i)=>x!==ss[i]))return lead+out.join(" ")+trail;return src}
    else if(k.includes(" · ")){const segs=body.split(" · ");const out=segs.map(x=>trCore(x,lang));if(out.some((x,i)=>x!==segs[i]))return lead+out.join(" · ")+trail;return src}
    else{const m=body.match(/^(.*?)( : )(.+)$/s);if(m){const a=trCore(m[1],lang),b=trCore(m[3],lang);if(a!==m[1]||b!==m[3])return lead+a+": "+b+trail}return src}
  }
  tpl=tpl.replace(/\{(\d+):([^|}]*)\|([^}]*)\}/g,(m,i,one,many)=>{const t=toks[i];const v=t&&t.t==="num"?Number(t.raw.replace(/[\u202f\u00a0]/g,"").replace(",",".")):2;return v===1?one:many});
  return lead+tpl.replace(/\{q(\d+)\}/g,(m,i)=>qs[i]!=null?trCore(qs[i],lang):m).replace(/\{(\d+)\}/g,(m,i)=>toks[i]?fmtTok(toks[i],lang):m)+trail}
window.__tr=s=>LANG==="fr"&&!window.__i18nCollect?s:trCore(String(s),LANG);
window.B2A_LANG=()=>LANG;

/* application au DOM */
const TXT=new WeakMap(),ATT=new WeakMap();const ATTRS=["placeholder","aria-label","title","alt","label"];
const skip=el=>!el||el.closest&&el.closest("script,style,textarea,[data-notr]");
const skipA=el=>!el||el.closest&&el.closest("script,style,[data-notr]");
function doText(n){const p=n.parentElement;if(!p||skip(p))return;const cur=n.nodeValue;if(!cur||!/\p{L}|\d/u.test(cur))return;
  let rec=TXT.get(n);const src=rec&&rec.out===cur?rec.src:cur;
  if(p.tagName==="OPTION"&&!p.hasAttribute("value"))p.setAttribute("value",p.textContent);
  const out=trCore(src,LANG);TXT.set(n,{src,out});if(out!==cur)n.nodeValue=out}
function doAttrs(el){if(skipA(el))return;let m=ATT.get(el);if(!m){m={};ATT.set(el,m)}
  for(const a of ATTRS){if(!el.hasAttribute(a))continue;const cur=el.getAttribute(a);const rec=m[a];const src=rec&&rec.out===cur?rec.src:cur;const out=trCore(src,LANG);m[a]={src,out};if(out!==cur)el.setAttribute(a,out)}}
function walk(root){if(root.nodeType===3){doText(root);return}if(root.nodeType!==1||skipA(root))return;
  doAttrs(root);const it=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);let n;
  while((n=it.nextNode())){if(n.nodeType===3)doText(n);else doAttrs(n)}}
let pending=new Set(),sched=false;
const flush=()=>{sched=false;const list=[...pending];pending.clear();list.forEach(walk)};
const mo=new MutationObserver(ms=>{for(const m of ms){if(m.type==="characterData")pending.add(m.target);else m.addedNodes.forEach(x=>pending.add(x));if(m.type==="attributes")pending.add(m.target)}
  if(!sched){sched=true;requestAnimationFrame(flush);setTimeout(()=>{if(sched)flush()},60)}});
function start(){walk(document.body);mo.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS})}

/* sélecteur de langue */
function setLang(l){LANG=l;try{localStorage.setItem(LS_LANG,l)}catch(e){}document.documentElement.lang=l;walk(document.body);renderBtn()}
window.B2A_setLang=setLang;
const NAMES={fr:"Français",en:"English",it:"Italiano",es:"Español"};
let btn,menu;
function renderBtn(){if(btn)btn.querySelector("b").textContent=LANG.toUpperCase();if(menu)menu.querySelectorAll("button").forEach(b=>b.setAttribute("aria-checked",b.dataset.l===LANG))}
function buildMenu(){const band=document.querySelector(".band-in");if(!band)return;
  const w=document.createElement("div");w.className="langbox";w.setAttribute("data-notr","");
  btn=document.createElement("button");btn.type="button";btn.className="langbtn";btn.setAttribute("aria-haspopup","menu");btn.setAttribute("aria-label","Langue / Language / Lingua / Idioma");
  btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg><b></b>';
  menu=document.createElement("div");menu.className="langmenu";menu.hidden=true;menu.setAttribute("role","menu");
  for(const l of ["fr","en","it","es"]){const b=document.createElement("button");b.type="button";b.dataset.l=l;b.setAttribute("role","menuitemradio");b.textContent=NAMES[l];b.onclick=()=>{menu.hidden=true;setLang(l)};menu.append(b)}
  btn.onclick=e=>{e.stopPropagation();menu.hidden=!menu.hidden};document.addEventListener("click",()=>{if(menu)menu.hidden=true});
  w.append(btn,menu);const at=band.querySelector(".apptitle");band.insertBefore(w,at?at.nextSibling:null);renderBtn()}
document.documentElement.lang=LANG;buildMenu();start();
})();
