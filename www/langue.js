/* B2A Smart Farming : charge seulement les traductions de la langue choisie (rien en français).
   Les fichiers dict-en.js, dict-it.js, dict-es.js sont préparés par outils/langues.mjs. */
(function(){
var LANGS=["en","it","es"],L="fr";
try{L=localStorage.getItem("b2a-lang")||"";
  /* première ouverture (aucune donnée B2A sur ce téléphone) : langue du téléphone si elle existe dans l'application, sinon français.
     Les personnes qui utilisent déjà l'application gardent leur langue. */
  if(!L){var used=false;for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i)||"";if(k.indexOf("b2a")===0&&k!=="b2a-device-id"){used=true;break}}
    if(!used){var nl=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||""]);
      for(var j=0;j<nl.length;j++){var c=String(nl[j]||"").slice(0,2).toLowerCase();if(c==="fr"||LANGS.indexOf(c)>=0){L=c;break}}
      if(L)localStorage.setItem("b2a-lang",L)}}
  L=L||"fr"}catch(e){L="fr"}
var me=document.currentScript,v=(me&&/[?&]v=([\d.]+)/.exec(me.src)||[])[1]||"";
var url=function(l){return "dict-"+l+".js"+(v?"?v="+v:"")};
window.B2A_DICT=window.B2A_DICT||{};
window.B2A_LANG_OK=window.B2A_LANG_OK||{};
/* chargement à la demande (changement de langue) : renvoie une promesse */
window.B2A_loadLang=function(l){
  if(l==="fr"||window.B2A_LANG_OK[l])return Promise.resolve();
  if(LANGS.indexOf(l)<0)return Promise.reject(new Error("langue inconnue"));
  return new Promise(function(ok,ko){var s=document.createElement("script");s.src=url(l);
    s.onload=function(){window.B2A_LANG_OK[l]?ok():ko(new Error("langue"))};s.onerror=function(){s.remove();ko(new Error("langue"))};
    document.head.appendChild(s)})};
/* au démarrage : chargé tout de suite, avant l'affichage, pour éviter de voir le français une fraction de seconde */
if(LANGS.indexOf(L)>=0)document.write('<script src="'+url(L)+'"><\/script>');
})();
