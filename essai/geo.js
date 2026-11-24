/* B2A Smart Farming : position facultative pour le Marché et les Services
   - Distance calculée dans le téléphone (aucun service extérieur, marche sans internet).
   - Les autres utilisateurs ne voient qu'une position arrondie à environ 2 km (protection contre les vols).
   - La position exacte d'un vendeur n'est donnée qu'à l'acheteur dont il accepte la commande (bouton Itinéraire).
   - Rien n'est suivi en continu : la position est lue seulement quand la personne touche un bouton. */
(function(){
const rad=x=>x*Math.PI/180;
const valid=p=>!!p&&typeof p.lat==="number"&&typeof p.lon==="number"&&isFinite(p.lat)&&isFinite(p.lon)&&Math.abs(p.lat)<=90&&Math.abs(p.lon)<=180;
/* distance à vol d'oiseau, en km */
function dist(a,b){if(!valid(a)||!valid(b))return null;const dLa=rad(b.lat-a.lat),dLo=rad(b.lon-a.lon);
  const h=Math.sin(dLa/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLo/2)**2;return 2*6371*Math.asin(Math.min(1,Math.sqrt(h)))}
/* arrondi à 0,02° (≈ 2 km) : assez pour une distance, pas assez pour trouver la ferme */
const coarse=p=>valid(p)?{lat:Math.round(p.lat*50)/50,lon:Math.round(p.lon*50)/50}:null;
const precise=p=>valid(p)?{lat:Math.round(p.lat*1e5)/1e5,lon:Math.round(p.lon*1e5)/1e5}:null;
function fmtKm(d){if(d==null)return "";if(d<2)return "< 2 km";return d<20?"≈ "+(Math.round(d*2)/2).toLocaleString("fr-FR")+" km":"≈ "+Math.round(d).toLocaleString("fr-FR")+" km"}
let mine=null;try{const m=JSON.parse(localStorage.getItem("b2a-geo-moi")||"null");if(valid(m))mine=m}catch(e){}
/* position du téléphone, sur demande seulement */
function here(){return new Promise((res,rej)=>{if(!navigator.geolocation)return rej({code:9});
  navigator.geolocation.getCurrentPosition(p=>{const v=precise({lat:p.coords.latitude,lon:p.coords.longitude});mine=v;try{localStorage.setItem("b2a-geo-moi",JSON.stringify(v))}catch(e){}res(v)},
    e=>rej(e||{code:2}),{enableHighAccuracy:true,timeout:20000,maximumAge:10*60*1000})})}
const errMsg=e=>e&&e.code===1?"Autorisation refusée : permettez la position pour B2A Smart Farming dans les réglages du téléphone, puis réessayez.":
  e&&e.code===9?"Ce téléphone ne donne pas sa position.":"Position introuvable. Activez la localisation (GPS) et réessayez, de préférence dehors.";
/* itinéraire : ouvre l'application de cartes du téléphone (Google Maps, Maps.me…) */
const route=p=>valid(p)?"https://www.google.com/maps/dir/?api=1&destination="+p.lat+","+p.lon:"";
window.B2A_GEO={valid,dist,coarse,precise,fmtKm,here,errMsg,route,mine:()=>mine};

const TR={"< {0} km":["< {0} km","< {0} km","< {0} km"],"≈ {0} km":["≈ {0} km","≈ {0} km","≈ {0} km"],
 "Autorisation refusée : permettez la position pour B{0}A Smart Farming dans les réglages du téléphone, puis réessayez.":["Permission denied: allow location for B{0}A Smart Farming in the phone settings, then try again.","Autorizzazione negata: consenti la posizione per B{0}A Smart Farming nelle impostazioni del telefono, poi riprova.","Permiso denegado: permita la ubicación para B{0}A Smart Farming en los ajustes del teléfono y vuelva a intentarlo."],
 "Ce téléphone ne donne pas sa position.":["This phone does not provide its location.","Questo telefono non fornisce la sua posizione.","Este teléfono no da su ubicación."],
 "Position introuvable. Activez la localisation (GPS) et réessayez, de préférence dehors.":["Location not found. Turn on location (GPS) and try again, preferably outdoors.","Posizione non trovata. Attiva la localizzazione (GPS) e riprova, meglio all'aperto.","Ubicación no encontrada. Active la localización (GPS) e inténtelo de nuevo, mejor al aire libre."],
 "📍 Près de moi":["📍 Near me","📍 Vicino a me","📍 Cerca de mí"],"Recherche de votre position…":["Finding your location…","Ricerca della tua posizione…","Buscando su ubicación…"],
 "Trié du plus proche au plus loin (distances à vol d'oiseau).":["Sorted from nearest to farthest (straight-line distances).","Ordinati dal più vicino al più lontano (distanze in linea d'aria).","Ordenado del más cercano al más lejano (distancias en línea recta)."],
 "Itinéraire":["Directions","Itinerario","Cómo llegar"],"Itinéraire vers le vendeur":["Directions to the seller","Itinerario verso il venditore","Cómo llegar al vendedor"],
 "Position (facultatif)":["Location (optional)","Posizione (facoltativo)","Ubicación (opcional)"],"Utiliser ma position":["Use my location","Usa la mia posizione","Usar mi ubicación"],"Retirer la position":["Remove location","Rimuovi la posizione","Quitar la ubicación"],
 "Position enregistrée.":["Location saved.","Posizione salvata.","Ubicación guardada."],"Aucune position enregistrée.":["No location saved.","Nessuna posizione salvata.","No hay ubicación guardada."],
 "Les acheteurs voient seulement une distance approximative (environ {0} km près). Votre position exacte est donnée à l'acheteur quand vous acceptez sa commande, pour l'itinéraire.":["Buyers only see an approximate distance (to about {0} km). Your exact location is given to the buyer when you accept their order, for directions.","Gli acquirenti vedono solo una distanza approssimativa (circa {0} km). La tua posizione esatta viene data all'acquirente quando accetti il suo ordine, per l'itinerario.","Los compradores solo ven una distancia aproximada (unos {0} km). Su ubicación exacta se da al comprador cuando usted acepta su pedido, para cómo llegar."],
 "Montrer ma position exacte (cabinet, boutique, atelier)":["Show my exact location (clinic, shop, workshop)","Mostra la mia posizione esatta (ambulatorio, negozio, laboratorio)","Mostrar mi ubicación exacta (consultorio, tienda, taller)"],
 "Sinon, les éleveurs voient seulement une distance approximative (environ {0} km près).":["Otherwise, farmers only see an approximate distance (to about {0} km).","Altrimenti gli allevatori vedono solo una distanza approssimativa (circa {0} km).","Si no, los ganaderos solo ven una distancia aproximada (unos {0} km)."],
 "Distance":["Distance","Distanza","Distancia"],"Position approximative":["Approximate location","Posizione approssimativa","Ubicación aproximada"]};
{const D=window.B2A_DICT=window.B2A_DICT||{};["en","it","es"].forEach((lg,i)=>{D[lg]=D[lg]||{};for(const k in TR)if(D[lg][k]==null)D[lg][k]=TR[k][i]})}
})();
