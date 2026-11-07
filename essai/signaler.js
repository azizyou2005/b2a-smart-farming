/* B2A Smart Farming : signaler et bloquer (Marché et Services)
   Exigence Google Play pour les contenus publiés par les utilisateurs : chaque annonce, boutique ou fiche de prestataire
   peut être signalée à B2A, et l'utilisateur peut bloquer un vendeur ou un prestataire pour ne plus voir ses publications.
   Données (Firestore) : signalements/<id> { type: annonce|vendeur|prestataire, cible, vendeur, nom, titre, motif, detail, auteur, creeLe }
   (création par tout inscrit, lecture et suppression par B2A seulement).
   Le blocage reste dans le téléphone (liste locale) : rien n'est envoyé au vendeur bloqué.
   B2A-HIGH-TECHNOLOGY-AUTOMATION · Bayere Abdoul Aziz */
(function(){
const B=window.B2A;if(!B)return;
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const notr=e=>{e.setAttribute("translate","no");e.classList.add("notranslate");return e};
const KEY="b2a-bloques";
const get=()=>{try{const v=JSON.parse(B.lsGet(KEY)||"{}");return v&&typeof v==="object"?v:{}}catch(e){return {}}};
const save=v=>B.lsSet(KEY,Object.keys(v).length?JSON.stringify(v):null);
const blocked=uid=>!!uid&&Object.prototype.hasOwnProperty.call(get(),uid);
const subs=new Set();const changed=()=>subs.forEach(f=>{try{f()}catch(e){}});
function block(uid,nom){if(!uid)return;const v=get();v[uid]=String(nom||"").slice(0,60);save(v);changed()}
function unblock(uid){const v=get();delete v[uid];save(v);changed()}

let S=null;
async function store(){if(S)return S;if(!B.CFG)return null;
  await B.loadFirebase(B.CFG);const u=await B.ensureUser(B.CFG);const fs=firebase.firestore();
  S={uid:u.uid,fs,ts:()=>firebase.firestore.FieldValue.serverTimestamp()};return S}

const MOTIFS=[["arnaque","Arnaque ou fraude"],["interdit","Produit interdit ou dangereux"],["choquant","Contenu choquant ou insultant"],
  ["faux","Fausse annonce ou fausses informations"],["autre","Autre raison"]];

/* boutons « Signaler » et « Bloquer » à placer sous une annonce, une boutique ou une fiche de prestataire
   o = { type, cible, vendeur, nom, titre, quoi (« ce vendeur » / « ce prestataire »), onBlock } */
function box(o){const w=el("div","sg-box");const r=el("div","row sg-acts");
  const sb=el("button","btn small ghost","⚑ Signaler");sb.type="button";
  const isB=blocked(o.vendeur);const bb=el("button","btn small ghost",isB?(o.type==="prestataire"?"Débloquer ce prestataire":"Débloquer ce vendeur"):(o.type==="prestataire"?"Bloquer ce prestataire":"Bloquer ce vendeur"));bb.type="button";
  r.append(sb,bb);w.append(r);
  const m=el("p","msg");m.hidden=true;
  bb.onclick=()=>{if(blocked(o.vendeur)){unblock(o.vendeur);bb.textContent=o.type==="prestataire"?"Bloquer ce prestataire":"Bloquer ce vendeur";m.hidden=false;m.className="msg good";m.textContent="Débloqué : ses publications sont de nouveau visibles.";return}
    if(bb.dataset.c!=="1"){bb.dataset.c="1";bb.textContent="Confirmer le blocage";return}
    block(o.vendeur,o.nom);bb.dataset.c="";if(o.onBlock)o.onBlock()};
  let F=null;
  sb.onclick=()=>{if(F){F.remove();F=null;return}F=form(o,m);w.insertBefore(F,m)};
  w.append(m);return w}

function form(o,m){const f=el("div","sg-form");f.append(el("b",null,"Signaler à B2A"));
  f.append(el("p","note","Dites-nous ce qui ne va pas. B2A vérifie chaque signalement et peut retirer l'annonce ou suspendre le compte."));
  const fl=el("div","field");const lb=el("label",null,"Raison");const sel=el("select");sel.id="sg-m-"+Math.random().toString(36).slice(2,7);lb.htmlFor=sel.id;
  MOTIFS.forEach(([k,n])=>sel.append(new Option(n,k)));fl.append(lb,sel);f.append(fl);
  const fd=el("div","field");const ld=el("label",null,"Précisions (facultatif)");const ta=el("textarea");ta.id=sel.id+"-d";ld.htmlFor=ta.id;ta.maxLength=500;ta.rows=3;fd.append(ld,ta);f.append(fd);
  const go=el("button","btn small","Envoyer le signalement");go.type="button";f.append(go);
  go.onclick=async()=>{go.disabled=true;go.textContent="Envoi…";
    const done=(ok,t)=>{m.hidden=false;m.className="msg "+(ok?"good":"err");m.textContent=t;if(ok)f.remove();else{go.disabled=false;go.textContent="Envoyer le signalement"}};
    try{const s=await store();if(!s)return done(false,"Connexion au service en ligne nécessaire pour envoyer un signalement.");
      const d={type:o.type,cible:String(o.cible||""),vendeur:String(o.vendeur||""),nom:String(o.nom||"").slice(0,80),titre:String(o.titre||"").slice(0,120),
        motif:sel.value,detail:ta.value.trim().slice(0,500),auteur:s.uid,creeLe:s.ts()};
      const pr=s.fs.collection("signalements").add(d);pr.catch(()=>{});
      const res=await Promise.race([pr.then(()=>"ok"),new Promise(r=>setTimeout(()=>r("lent"),8000))]);
      done(true,res==="lent"?"Signalement enregistré : il part dès que la connexion le permet. Merci.":"Merci : votre signalement a été envoyé à B2A.")}
    catch(e){console.warn(e);done(false,"Envoi impossible. Vérifiez la connexion puis réessayez.")}};
  return f}

/* liste des vendeurs et prestataires bloqués, avec « Débloquer » */
function manage(){const v=get();const ids=Object.keys(v);if(!ids.length)return null;
  const d=el("details","sg-list");d.append(el("summary",null,"Vendeurs et prestataires bloqués"));
  ids.forEach(id=>{const r=el("div","row between");r.append(notr(el("span",null,v[id]||"—")));const b=el("button","btn small ghost","Débloquer");b.type="button";b.onclick=()=>{unblock(id);r.remove();if(!Object.keys(get()).length)d.remove()};r.append(b);d.append(r)});
  return d}

const css=el("style");css.textContent=`.sg-box{display:grid;gap:8px}.sg-acts{gap:8px;flex-wrap:wrap}.sg-form{display:grid;gap:8px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--bg)}
.sg-form textarea{font:15px var(--body);padding:8px 10px;border:1.5px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink);resize:vertical}.sg-form p{margin:0}
.sg-list{display:grid;gap:6px;font-size:14px}.sg-list summary{cursor:pointer;color:var(--muted)}`;document.head.append(css);

const TR={"⚑ Signaler":["⚑ Report","⚑ Segnala","⚑ Denunciar"],"Bloquer ce vendeur":["Block this seller","Blocca questo venditore","Bloquear a este vendedor"],
 "Débloquer ce vendeur":["Unblock this seller","Sblocca questo venditore","Desbloquear a este vendedor"],"Bloquer ce prestataire":["Block this provider","Blocca questo prestatore","Bloquear a este proveedor"],
 "Débloquer ce prestataire":["Unblock this provider","Sblocca questo prestatore","Desbloquear a este proveedor"],"Confirmer le blocage":["Confirm block","Conferma il blocco","Confirmar el bloqueo"],
 "Débloqué : ses publications sont de nouveau visibles.":["Unblocked: their posts are visible again.","Sbloccato: le sue pubblicazioni sono di nuovo visibili.","Desbloqueado: sus publicaciones vuelven a ser visibles."],
 "Signaler à B2A":["Report to B2A","Segnala a B2A","Denunciar a B2A"],
 "Dites-nous ce qui ne va pas. B2A vérifie chaque signalement et peut retirer l'annonce ou suspendre le compte.":["Tell us what is wrong. B2A checks every report and can remove the listing or suspend the account.","Dicci cosa non va. B2A controlla ogni segnalazione e può ritirare l'annuncio o sospendere l'account.","Díganos qué ocurre. B2A revisa cada denuncia y puede retirar el anuncio o suspender la cuenta."],
 "Raison":["Reason","Motivo","Motivo"],"Précisions (facultatif)":["Details (optional)","Dettagli (facoltativo)","Detalles (opcional)"],"Envoyer le signalement":["Send report","Invia segnalazione","Enviar denuncia"],"Envoi…":["Sending…","Invio…","Enviando…"],
 "Arnaque ou fraude":["Scam or fraud","Truffa o frode","Estafa o fraude"],"Produit interdit ou dangereux":["Prohibited or dangerous product","Prodotto vietato o pericoloso","Producto prohibido o peligroso"],
 "Contenu choquant ou insultant":["Offensive or insulting content","Contenuto offensivo o ingiurioso","Contenido ofensivo o insultante"],"Fausse annonce ou fausses informations":["Fake listing or false information","Annuncio falso o informazioni false","Anuncio falso o información falsa"],
 "Autre raison":["Other reason","Altro motivo","Otro motivo"],
 "Connexion au service en ligne nécessaire pour envoyer un signalement.":["An online connection is needed to send a report.","Serve la connessione al servizio online per inviare una segnalazione.","Se necesita conexión al servicio en línea para enviar una denuncia."],
 "Signalement enregistré : il part dès que la connexion le permet. Merci.":["Report saved: it will be sent as soon as the connection allows. Thank you.","Segnalazione registrata: partirà appena la connessione lo permette. Grazie.","Denuncia guardada: se enviará en cuanto la conexión lo permita. Gracias."],
 "Merci : votre signalement a été envoyé à B2A.":["Thank you: your report has been sent to B2A.","Grazie: la tua segnalazione è stata inviata a B2A.","Gracias: su denuncia se ha enviado a B2A."],
 "Envoi impossible. Vérifiez la connexion puis réessayez.":["Could not send. Check the connection and try again.","Invio impossibile. Controlla la connessione e riprova.","No se pudo enviar. Compruebe la conexión e inténtelo de nuevo."],
 "Vendeurs et prestataires bloqués":["Blocked sellers and providers","Venditori e prestatori bloccati","Vendedores y proveedores bloqueados"],"Débloquer":["Unblock","Sblocca","Desbloquear"]};
/* même conversion des clés que services.js : chaque nombre (le « 2 » de « B2A ») devient {0}, {1}… */
{const RX=/\{(\d+)(:[^|}]*\|[^}]*)?\}|\d{1,3}(?:[   ]\d{3})+(?:,\d+)?|\d+(?:,\d+)?/g;
 const conv=(k,vals)=>{let n=0;const map={},lits=[];const nk=k.replace(RX,(m,i,pl)=>{if(i!=null){if(!(i in map))map[i]=n++;return "{"+map[i]+(pl||"")+"}"}lits.push(n);return "{"+(n++)+"}"});
   return [nk,vals.map(v=>{let li=0;return v.replace(RX,(m,i,pl)=>{if(i!=null)return "{"+(i in map?map[i]:i)+(pl||"")+"}";const x=lits[li++];return x!=null?"{"+x+"}":m})})]};
 const D=window.B2A_DICT=window.B2A_DICT||{};for(const k0 in TR){const [k,v]=conv(k0,TR[k0]);["en","it","es"].forEach((lg,i)=>{D[lg]=D[lg]||{};if(D[lg][k]==null)D[lg][k]=v[i]})}}

window.B2A_SIGNAL={box,manage,blocked,block,unblock,onChange:f=>subs.add(f)};
})();
