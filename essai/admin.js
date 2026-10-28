/* sécurité : refuser l'affichage dans un cadre d'un autre site */
if(window.top!==window.self){try{window.top.location=window.self.location.href}catch(e){document.documentElement.style.display="none"}}
(function(){
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
/* le mot de passe administrateur reste seulement le temps de la session (onglet fermé = effacé) */
const sget=k=>{try{return sessionStorage.getItem(k)}catch(e){return null}},sset=(k,v)=>{try{v==null?sessionStorage.removeItem(k):sessionStorage.setItem(k,v)}catch(e){}};
try{localStorage.removeItem("b2a-admin-key")}catch(e){}
const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}},set=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}};
let URL_=get("b2a-admin-url")||(window.B2A_IA_URL||""),KEY=sget("b2a-admin-key")||"";
$("a-url").value=URL_;$("a-key").value=KEY;
async function api(path,method,body){const r=await fetch(URL_.replace(/\/+$/,"")+path,{method:method||"GET",headers:{"content-type":"application/json","x-admin-key":KEY},body:body?JSON.stringify(body):undefined});
  const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.erreur||("Erreur "+r.status));return d}
async function load(){const d=await api("/admin/codes");const L=$("list");L.innerHTML="";
  let tot=0;d.codes.forEach(c=>{tot+=c.utilise;const tr=el("tr",c.actif?"":"off");tr.append(el("td","c",c.code),el("td",null,c.nom||"—"),el("td","n",c.utilise+" / "+c.quota));
    const td=el("td");
    const cp=el("button","btn small ghost","Copier");cp.onclick=()=>navigator.clipboard&&navigator.clipboard.writeText(c.code).then(()=>cp.textContent="Copié",()=>{});
    const wa=el("a","btn small ghost","WhatsApp");wa.href="https://wa.me/?text="+encodeURIComponent("Votre code d'accès IA B2A Smart Farming : "+c.code+"\nDans l'application : onglet Santé & IA > Activer.");wa.target="_blank";wa.rel="noopener";
    const q=el("button","btn small ghost","Quota");q.onclick=async()=>{const inp=el("input");inp.type="number";inp.value=c.quota;inp.style.width="90px";const ok=el("button","btn small","OK");
      ok.onclick=async()=>{try{await api("/admin/codes/"+c.code,"POST",{quota:Number(inp.value)});load()}catch(e){alertMsg(e)}};td.innerHTML="";td.append(inp,ok)};
    const t=el("button","btn small "+(c.actif?"ghost":""),c.actif?"Désactiver":"Réactiver");t.onclick=async()=>{try{await api("/admin/codes/"+c.code,"POST",{actif:!c.actif});load()}catch(e){alertMsg(e)}};
    const del=el("button","btn small ghost","Supprimer");del.onclick=async()=>{if(del.dataset.c!=="1"){del.dataset.c="1";del.textContent="Confirmer";return}try{await api("/admin/codes/"+c.code,"DELETE");load()}catch(e){alertMsg(e)}};
    td.append(cp,wa,q,t,del);tr.append(td);L.append(tr)});
  if(!d.codes.length)L.append(el("tr",null,"")).append(el("td",null,"Aucun code pour l'instant."));
  $("sum").textContent=`${d.codes.length} code(s) · ${tot} analyse(s) en ${d.mois}`}
function alertMsg(e){$("n-msg").textContent=e.message;$("n-msg").className="msg err"}
$("a-go").onclick=async()=>{URL_=$("a-url").value.trim();KEY=$("a-key").value;$("a-msg").textContent="Connexion…";
  try{await load();set("b2a-admin-url",URL_);sset("b2a-admin-key",KEY);$("login").hidden=true;$("panel").hidden=false;$("a-msg").textContent=""}catch(e){$("a-msg").textContent=e.message;$("a-msg").className="msg err"}};
$("a-out").onclick=()=>{sset("b2a-admin-key",null);KEY="";$("a-key").value="";$("panel").hidden=true;$("login").hidden=false};
$("n-save").onclick=async()=>{try{const c=await api("/admin/codes","POST",{nom:$("n-nom").value,quota:Number($("n-quota").value),code:$("n-code").value});
  $("n-msg").textContent="Code créé : "+c.code;$("n-msg").className="msg good";$("n-nom").value="";$("n-code").value="";load()}catch(e){alertMsg(e)}};
if(URL_&&KEY)$("a-go").click();
})();
