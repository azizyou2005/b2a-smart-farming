/* B2A Smart Farming : gestion du Marché B2A par le propriétaire (commission, vendeurs, paiements)
   Page utilisateurs.html, après connexion avec le compte B2A. */
(function(){
if(!window.B2A_FIREBASE||!window.firebase)return;
const $=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const fmt=(n,d=0)=>Number(n||0).toLocaleString("fr-FR",{maximumFractionDigits:d,minimumFractionDigits:d});
const ms=v=>v==null?0:typeof v==="number"?v:v.toMillis?v.toMillis():0;
const host=$("u-main");if(!host)return;
const sec=el("section","card");sec.id="mk-admin";sec.innerHTML=`<h2>Marché B2A : vendeurs et commissions</h2>
  <p class="note">Commission prélevée sur chaque vente déclarée « vendue » par le vendeur. Les nouveaux vendeurs acceptent le taux en vigueur.</p>
  <div class="mk-cfg">
    <div class="field"><label for="mk-taux">Commission B2A (%)</label><input type="number" id="mk-taux" min="0" max="50" step="0.5"></div>
    <div class="field"><label for="mk-tel">Numéro pour payer la commission (Orange / Moov Money)</label><input type="tel" id="mk-tel" placeholder="ex. 70 00 00 00"></div>
    <div class="field"><label for="mk-nom">Nom du bénéficiaire</label><input type="text" id="mk-nom"></div>
    <button class="btn small" id="mk-save" type="button">Enregistrer</button><span class="msg" id="mk-msg"></span>
  </div>
  <div class="kpis" id="mk-kpis"></div>
  <div class="list" id="mk-list"></div>`;
host.querySelector(".wrap").append(sec);
const css=el("style");css.textContent=`.mk-cfg{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;align-items:end;margin:10px 0 14px}
#mk-admin .u{display:grid;gap:6px}#mk-admin .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}#mk-admin input.mk-pay{max-width:140px}.mk-piece{display:grid;gap:6px;padding:10px;border:1px dashed #c9cfd8;border-radius:10px}.mk-piece img{max-width:220px;max-height:150px;border-radius:8px;object-fit:cover}`;document.head.append(css);

const db=firebase.firestore();let vend=[],cmd=[],pay=[],pieces={},offs=[];
firebase.auth().onAuthStateChanged(u=>{offs.forEach(f=>f());offs=[];if(!u||u.isAnonymous)return;
  const err=e=>{$("mk-msg").textContent="Lecture impossible : publiez les règles Firestore du Marché (firestore.rules).";$("mk-msg").className="msg err"};
  offs.push(db.doc("marche_config/global").onSnapshot(d=>{const c=d.exists?d.data():{};$("mk-taux").value=c.taux??5;$("mk-tel").value=c.telPaiement||"";$("mk-nom").value=c.nomPaiement||"B2A-HIGH-TECHNOLOGY-AUTOMATION"},err));
  offs.push(db.collection("marche_vendeurs").onSnapshot(s=>{vend=s.docs.map(d=>({id:d.id,...d.data()}));render()},err));
  offs.push(db.collection("marche_commandes").onSnapshot(s=>{cmd=s.docs.map(d=>({id:d.id,...d.data()}));render()},err));
  offs.push(db.collection("marche_pieces").onSnapshot(s=>{pieces={};s.docs.forEach(d=>pieces[d.id]=d.data());render()},err));
  offs.push(db.collection("marche_paiements").onSnapshot(s=>{pay=s.docs.map(d=>({id:d.id,...d.data()}));render()},err))});
$("mk-save").onclick=async()=>{const t=Number(String($("mk-taux").value).replace(",","."));const m=$("mk-msg");
  if(!(t>=0&&t<=50)){m.textContent="Taux invalide.";m.className="msg err";return}
  try{await db.doc("marche_config/global").set({taux:t,telPaiement:$("mk-tel").value.trim(),nomPaiement:$("mk-nom").value.trim()},{merge:true});m.textContent="Enregistré. Les nouveaux vendeurs auront ce taux.";m.className="msg good"}
  catch(e){m.textContent="Échec de l'enregistrement.";m.className="msg err"}};
function kpi(l,v,s,c){const k=el("div","kpi"+(c?" "+c:""));k.append(el("span",null,l),el("b",null,v));if(s)k.append(el("small",null,s));return k}
function render(){const sold=cmd.filter(c=>c.statut==="vendue");const tot=sold.reduce((p,c)=>p+(Number(c.total)||0),0),com=sold.reduce((p,c)=>p+(Number(c.commission)||0),0),paid=pay.reduce((p,x)=>p+(Number(x.montant)||0),0);
  const K=$("mk-kpis");K.innerHTML="";K.append(kpi("Vendeurs actifs",fmt(vend.filter(v=>v.statut==="actif").length),fmt(vend.length)+" au total","ok"),
    kpi("Ventes conclues",fmt(tot)+" F",fmt(sold.length)+" vente(s)"),kpi("Commissions dues",fmt(com)+" F","depuis le début"),kpi("Commissions encaissées",fmt(paid)+" F","reste "+fmt(Math.max(0,com-paid))+" F",com-paid>0?"warn":null),
    kpi("Pièces à vérifier",fmt(Object.values(pieces).filter(p=>p.statut==="attente").length),"CNIB, RCCM / IFU",Object.values(pieces).some(p=>p.statut==="attente")?"warn":null),
    kpi("Commandes en cours",fmt(cmd.filter(c=>c.statut==="demande"||c.statut==="acceptee").length),"demandées ou acceptées"));
  const L=$("mk-list");L.innerHTML="";if(!vend.length){L.append(el("p","empty","Aucun vendeur pour l'instant."));return}
  vend.map(v=>{const s=sold.filter(c=>c.vendeur===v.id);const c2=s.reduce((p,c)=>p+(Number(c.commission)||0),0);const p2=pay.filter(x=>x.vendeur===v.id).reduce((p,x)=>p+(Number(x.montant)||0),0);
    return {v,ventes:s.reduce((p,c)=>p+(Number(c.total)||0),0),n:s.length,com:c2,paid:p2,reste:Math.max(0,c2-p2),encours:cmd.filter(c=>c.vendeur===v.id&&(c.statut==="demande"||c.statut==="acceptee")).length}})
  .sort((a,b)=>((pieces[b.v.id]||{}).statut==="attente")-((pieces[a.v.id]||{}).statut==="attente")||b.reste-a.reste||b.ventes-a.ventes).forEach(({v,ventes,n,com,paid,reste,encours})=>{
    const c=el("article","u");const top=el("div","u-top");top.append(el("b",null,v.nom||"Vendeur"),el("span","pill "+(v.statut==="actif"?"p-approuve":"p-bloque"),v.statut==="actif"?"Actif":"Suspendu"));c.append(top);
    c.append(el("small",null,[v.tel,v.ville,"commission "+fmt(v.taux,1)+" %","depuis le "+(ms(v.accepteLe)?new Date(ms(v.accepteLe)).toLocaleDateString("fr-FR"):"—")].filter(Boolean).join(" · ")));
    c.append(el("small",null,`Ventes : ${fmt(ventes)} F (${n}) · commission ${fmt(com)} F · payé ${fmt(paid)} F · reste ${fmt(reste)} F · ${encours} commande(s) en cours`));
    c.append(el("small",null,"Conditions acceptées : version "+(v.cgu||"—")+(ms(v.cguLe)?" le "+new Date(ms(v.cguLe)).toLocaleDateString("fr-FR"):"")));
    /* pièce justificative (privée : visible seulement ici) */
    const P=pieces[v.id];const pb0=el("div","mk-piece");
    if(!P)pb0.append(el("small",null,"Aucune pièce envoyée."));
    else{const lab={attente:"À vérifier",validee:"Validée",refusee:"Refusée"}[P.statut]||P.statut;
      pb0.append(el("b",null,`Pièce : ${P.type==="entreprise"?"Entreprise (RCCM / IFU)":"Particulier (CNIB)"} · ${lab}`));
      pb0.append(el("small",null,[P.titulaire,P.cnib?"CNIB "+P.cnib:null,P.rccm?"RCCM "+P.rccm:null,P.ifu?"IFU "+P.ifu:null,ms(P.envoyeLe)?"envoyée le "+new Date(ms(P.envoyeLe)).toLocaleDateString("fr-FR"):null].filter(Boolean).join(" · ")));
      if(P.motif)pb0.append(el("small",null,"Motif du refus : "+P.motif));
      if(P.photo){const a=el("a");a.href="#";const im=el("img");im.src=P.photo;im.alt="Pièce";a.append(im);a.onclick=e=>{e.preventDefault();const w=window.open();if(w){w.document.title="Pièce";const i=w.document.createElement("img");i.src=P.photo;i.style.maxWidth="100%";w.document.body.append(i)}};pb0.append(a)}
      if(P.statut!=="validee"){const ok=el("button","btn small ok","Valider la pièce");ok.type="button";
        ok.onclick=async()=>{ok.disabled=true;try{await db.doc("marche_pieces/"+v.id).update({statut:"validee",motif:"",verifieLe:firebase.firestore.FieldValue.serverTimestamp()});
          await db.doc("marche_boutiques/"+v.id).set({verifie:true},{merge:true})}catch(e){ok.disabled=false}};pb0.append(ok)}
      if(P.statut!=="refusee"){const mo=el("input");mo.type="text";mo.placeholder="Motif du refus (ex. photo illisible)";mo.maxLength=120;const no=el("button","btn small bad","Refuser");no.type="button";
        no.onclick=async()=>{if(!mo.value.trim()){mo.focus();return}no.disabled=true;try{await db.doc("marche_pieces/"+v.id).update({statut:"refusee",motif:mo.value.trim()});
          await db.doc("marche_boutiques/"+v.id).set({verifie:false},{merge:true})}catch(e){no.disabled=false}};const rr=el("div","row");rr.append(mo,no);pb0.append(rr)}}
    c.append(pb0);
    const r=el("div","row");const m=el("span","msg");
    const amt=el("input","mk-pay");amt.type="number";amt.min="0";amt.placeholder="Montant reçu";if(reste)amt.value=reste;
    const pb=el("button","btn small ok","Enregistrer le paiement");pb.type="button";
    pb.onclick=async()=>{const a=Number(amt.value);if(!(a>0)){m.textContent="Montant ?";return}pb.disabled=true;
      try{await db.collection("marche_paiements").add({vendeur:v.id,montant:a,date:firebase.firestore.FieldValue.serverTimestamp(),note:""});m.textContent="Paiement enregistré.";m.className="msg good"}catch(e){m.textContent="Échec.";m.className="msg err"}pb.disabled=false};
    const sb=el("button","btn small "+(v.statut==="actif"?"bad":"ok"),v.statut==="actif"?"Suspendre la boutique":"Réactiver la boutique");sb.type="button";
    sb.onclick=async()=>{if(v.statut==="actif"&&sb.dataset.c!=="1"){sb.dataset.c="1";sb.textContent="Confirmer : suspendre";return}
      try{const susp=v.statut==="actif";await db.doc("marche_vendeurs/"+v.id).update({statut:susp?"suspendu":"actif"});
        /* boutique suspendue : ses annonces sont retirées du marché */
        if(susp){const an=await db.collection("marche_annonces").where("vendeur","==",v.id).where("statut","==","actif").get();for(const d of an.docs)await d.ref.update({statut:"retire"})}}
      catch(e){m.textContent="Échec.";m.className="msg err"}};
    const wa=el("a","btn small ghost","WhatsApp");let ph=String(v.tel||"").replace(/\D/g,"");if(ph.length===8)ph="226"+ph;wa.href="https://wa.me/"+ph+"?text="+encodeURIComponent(`Bonjour ${v.nom||""}, B2A Smart Farming : votre commission du Marché à régler est de ${fmt(reste)} F. Merci !`);wa.target="_blank";wa.rel="noopener";
    r.append(amt,pb,sb,wa,m);c.append(r);L.append(c)})}
})();
