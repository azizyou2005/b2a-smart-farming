/* B2A Smart Farming : poulailler connecté – vue 3D (synoptique).
   Chargé seulement à l'ouverture de la vue 3D (avec libs/three.min.js et libs/OrbitControls.js) :
   aucun effet sur la vitesse de l'application tant que la vue n'est pas ouverte, et tout s'arrête à la fermeture. */
(function(){
"use strict";
const T={
"Dispositif":["Device","Dispositivo","Dispositivo"],
"Auto : étage {0} au-dessus de {1} °C, étage {2} au-dessus de {3} °C ; aussi si l'ammoniac dépasse {4} ppm.":["Auto: stage {0} above {1} °C, stage {2} above {3} °C; also if ammonia exceeds {4} ppm.","Auto: stadio {0} oltre {1} °C, stadio {2} oltre {3} °C; anche se l'ammoniaca supera {4} ppm.","Auto: etapa {0} por encima de {1} °C, etapa {2} por encima de {3} °C; también si el amoníaco supera {4} ppm."],
"étage {0} au-dessus de {1} °C, étage {2} au-dessus de {3} °C ; aussi si l'ammoniac dépasse {4} ppm.":["stage {0} above {1} °C, stage {2} above {3} °C; also if ammonia exceeds {4} ppm.","stadio {0} oltre {1} °C, stadio {2} oltre {3} °C; anche se l'ammoniaca supera {4} ppm.","etapa {0} por encima de {1} °C, etapa {2} por encima de {3} °C; también si el amoníaco supera {4} ppm."],
"Au-dessus de {0} °C, tout tourne même en Arrêt.":["Above {0} °C, everything runs even when set to Off.","Oltre {0} °C, tutto gira anche in Arresto.","Por encima de {0} °C, todo funciona incluso en Paro."],
"Fermer":["Close","Chiudi","Cerrar"],
"Poulailler en {0}D":["Poultry house in {0}D","Pollaio in {0}D","Gallinero en {0}D"],"Serre en {0}D":["Greenhouse in {0}D","Serra in {0}D","Invernadero en {0}D"],"Couveuse en {0}D":["Incubator in {0}D","Incubatrice in {0}D","Incubadora en {0}D"],"Élevage en {0}D":["Livestock building in {0}D","Allevamento in {0}D","Granja en {0}D"],"Bassin en {0}D":["Pond in {0}D","Vasca in {0}D","Estanque en {0}D"],"Arrosage":["Watering","Irrigazione","Riego"],
"Aucune alerte":["No alert","Nessun allarme","Ninguna alerta"],"1 alerte":["1 alert","1 allarme","1 alerta"],"{0} alertes":["{0} alerts","{0} allarmi","{0} alertas"],
"Intérieur":["Inside","Interno","Interior"],"Dessus":["Top","Dall'alto","Arriba"],"Extérieur":["Outside","Esterno","Exterior"],
"Simuler une panne":["Simulate a fault","Simula un guasto","Simular una avería"],"Acquitter":["Acknowledge","Tacitare","Reconocer"],
"Temp. moy.":["Avg temp.","Temp. media","Temp. media"],"Humidité":["Humidity","Umidità","Humedad"],"Eau jour":["Water today","Acqua oggi","Agua hoy"],"Batterie":["Battery","Batteria","Batería"],
"Éclairage":["Lighting","Illuminazione","Iluminación"],"Ventilation":["Ventilation","Ventilazione","Ventilación"],"Aliment":["Feed","Mangime","Pienso"],"Eau":["Water","Acqua","Agua"],"Humidificateur":["Humidifier","Umidificatore","Humidificador"],
"Automatique":["Automatic","Automatico","Automático"],"Manuel":["Manual","Manuale","Manual"],"Auto":["Auto","Auto","Auto"],"Marche":["On","Marcia","Marcha"],"Arrêt":["Off","Arresto","Paro"],
"Allumé (E{0}–E{1})":["On (E{0}–E{1})","Acceso (E{0}–E{1})","Encendido (E{0}–E{1})"],"Éteint":["Off","Spento","Apagado"],
"Étages {0} et {1} en marche (M{2}–M{3})":["Stages {0} and {1} running (M{2}–M{3})","Stadi {0} e {1} in marcia (M{2}–M{3})","Etapas {0} y {1} en marcha (M{2}–M{3})"],
"Étage {0} en marche (M{1}, M{2})":["Stage {0} running (M{1}, M{2})","Stadio {0} in marcia (M{1}, M{2})","Etapa {0} en marcha (M{1}, M{2})"],"Arrêtée":["Stopped","Ferma","Parada"],
"Moteur M{0} en marche":["Motor M{0} running","Motore M{0} in marcia","Motor M{0} en marcha"],"Moteur arrêté":["Motor stopped","Motore fermo","Motor parado"],
"Vanne YV{0} ouverte":["Valve YV{0} open","Valvola YV{0} aperta","Válvula YV{0} abierta"],"Vanne fermée":["Valve closed","Valvola chiusa","Válvula cerrada"],
"Pompe M{0} en marche":["Pump M{0} running","Pompa M{0} in marcia","Bomba M{0} en marcha"],"Arrêté":["Stopped","Fermo","Parado"],
"Pour voir comment la vue {0}D et les alertes réagissent.":["To see how the {0}D view and the alerts react.","Per vedere come reagiscono la vista {0}D e gli allarmi.","Para ver cómo reaccionan la vista {0}D y las alertas."],
"Chaleur":["Heat","Caldo","Calor"],"Eau ne remplit pas":["Water not filling","L'acqua non riempie","El agua no llena"],"Fuite d'eau":["Water leak","Perdita d'acqua","Fuga de agua"],"Vis bloquée":["Auger jammed","Coclea bloccata","Sinfín bloqueado"],"Sonde en défaut":["Faulty probe","Sonda guasta","Sonda averiada"],"Batterie faible":["Low battery","Batteria scarica","Batería baja"],"Tout réparer":["Repair all","Ripara tutto","Reparar todo"],
"sirène en marche":["siren on","sirena accesa","sirena encendida"],
"La vue {0}D n'est pas disponible sur ce téléphone.":["The {0}D view is not available on this phone.","La vista {0}D non è disponibile su questo telefono.","La vista {0}D no está disponible en este teléfono."],
"Touchez un équipement pour le commander.":["Tap a device to control it.","Tocca un apparecchio per comandarlo.","Toca un equipo para controlarlo."],
/* étiquettes dessinées dans la 3D */
"en défaut":["faulty","guasta","averiada"],"Cuve":["Tank","Serbatoio","Depósito"],"sels":["salts","sali","sales"],"Trémie":["Hopper","Tramoggia","Tolva"],"kg/jour":["kg/day","kg/giorno","kg/día"],
"Fuite d'eau !":["Water leak!","Perdita d'acqua!","¡Fuga de agua!"],"L'eau ne remplit pas !":["Water not filling!","L'acqua non riempie!","¡El agua no llena!"],"aujourd'hui":["today","oggi","hoy"],
"Ventilation : étages {0} + {1}":["Ventilation: stages {0} + {1}","Ventilazione: stadi {0} + {1}","Ventilación: etapas {0} + {1}"],"Ventilation : étage {0}":["Ventilation: stage {0}","Ventilazione: stadio {0}","Ventilación: etapa {0}"],"Ventilation arrêtée":["Ventilation off","Ventilazione ferma","Ventilación parada"],
"Éclairage allumé":["Lights on","Luci accese","Luces encendidas"],"Éclairage éteint":["Lights off","Luci spente","Luces apagadas"],"bloqué !":["jammed!","bloccato!","¡bloqueado!"],"en marche":["running","in marcia","en marcha"],"arrêté":["stopped","fermo","parado"],
"B{0} compteur":["B{0} meter","B{0} contatore","B{0} contador"],"YV{0} vanne":["YV{0} valve","YV{0} valvola","YV{0} válvula"],"M{0} pompe":["M{0} pump","M{0} pompa","M{0} bomba"],"Coffret A{0}":["Cabinet A{0}","Quadro A{0}","Armario A{0}"],
"B{0} luminosité":["B{0} light","B{0} luminosità","B{0} luminosidad"],"H{0} gyrophare":["H{0} beacon","H{0} lampeggiante","H{0} baliza"],"PV{0}, PV{1} – panneaux {2} × {3} W (sud)":["PV{0}, PV{1} – panels {2} × {3} W (south)","PV{0}, PV{1} – pannelli {2} × {3} W (sud)","PV{0}, PV{1} – paneles {2} × {3} W (sur)"],
};
{const D=window.B2A_DICT=window.B2A_DICT||{};["en","it","es"].forEach((l,i)=>{D[l]=D[l]||{};for(const k in T)if(D[l][k]==null)D[l][k]=T[k][i]})}
const tr=s=>window.__tr?window.__tr(s):s;
const LOC={fr:"fr-FR",en:"en-GB",it:"it-IT",es:"es-ES"};
const fc=(v,d=1)=>v==null||isNaN(v)?"—":Number(v).toLocaleString(LOC[window.B2A_LANG?window.B2A_LANG():"fr"]||"fr-FR",{minimumFractionDigits:d,maximumFractionDigits:d});
window.B2A_PC3D={open(B){
const ALARMES=B.ALARMES;
const LOT=B.lot?B.lot():{genre:"volaille"},GEN=LOT.genre||"volaille",ESP=LOT.esp||"",SUB=LOT.x||"";
const ok=k=>!B.pertinente||B.pertinente(k);
const root=document.createElement("div");root.id="p3";document.documentElement.style.overflow="hidden";
root.innerHTML=`<style>
#p3{position:fixed;inset:0;z-index:80;background:#0d1626;color:#e8edf5;font:15px/1.35 var(--body,system-ui,sans-serif);overflow:hidden;touch-action:none}
#p3-c{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
#p3-top{position:absolute;left:8px;right:8px;top:calc(8px + env(safe-area-inset-top));display:flex;flex-direction:column;gap:6px;pointer-events:none}
#p3 .r{display:flex;gap:6px;align-items:center;pointer-events:auto;overflow-x:auto;scrollbar-width:none}#p3 .r::-webkit-scrollbar{display:none}
#p3 h1{margin:0;font-size:15.5px;text-shadow:0 1px 3px #000;flex:1;white-space:nowrap;color:#fff}
#p3 .pill{flex:none;font-weight:700;font-size:12.5px;border-radius:999px;padding:4px 9px;background:rgb(16 27 46/.9);border:1px solid #2c3d5c}
#p3 .pill.demo{color:#e8b860}#p3 .pill.ok{color:#8ccb60}#p3 .pill.bad{color:#fff;background:#c0392b;border-color:#c0392b}
#p3 .x3{flex:none;border:0;background:#c0392b;color:#fff;border-radius:999px;padding:6px 12px;font-weight:700;font-size:13px;font-family:inherit;cursor:pointer}
#p3 .cmd{flex:none;display:flex;align-items:center;gap:6px;border:1px solid #2c3d5c;background:rgb(16 27 46/.9);color:#e8edf5;border-radius:12px;padding:6px 9px;font-weight:600;font-size:13px;font-family:inherit;cursor:pointer}
#p3 .cmd i{width:10px;height:10px;border-radius:50%;background:#5b6577;flex:none}
#p3 .cmd.on i{background:#8ccb60;box-shadow:0 0 8px #8ccb60}
#p3 .cmd small{font-size:10.5px;font-weight:700;border-radius:5px;padding:1px 4px;background:#23314b;color:#93a0b8}
#p3 .cmd small.man{background:#33290f;color:#e8b860}
#p3 .cmd.al{border-color:#f08a7a;animation:p3blink 1s infinite}
@keyframes p3blink{50%{background:#3a1d1a}}
#p3 .view{flex:none;border:1px solid #2c3d5c;background:rgb(16 27 46/.75);color:#c9d3e3;border-radius:999px;padding:5px 10px;font-weight:600;font-size:12.5px;font-family:inherit;cursor:pointer}
#p3 .view.on{background:#7dbb52;color:#08111f;border-color:#7dbb52}
#p3-alert{display:none;pointer-events:auto;background:#c0392b;color:#fff;border-radius:10px;padding:7px 10px;font-weight:700;font-size:13px}
#p3-vals{position:absolute;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px}
#p3 .v{background:rgb(16 27 46/.92);border:1px solid #2c3d5c;border-radius:10px;padding:5px 6px;min-width:0}
#p3 .v span{display:block;font-size:10px;letter-spacing:.04em;text-transform:uppercase;color:#93a0b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#p3 .v b{font-size:15px;white-space:nowrap}
#p3 .v.ok{border-color:#5f8f3f}#p3 .v.ok b{color:#8ccb60}#p3 .v.warn{border-color:#b38a3a}#p3 .v.warn b{color:#e8b860}#p3 .v.bad{border-color:#f08a7a}#p3 .v.bad b{color:#f08a7a}
#p3-sheet{position:absolute;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));max-width:520px;margin:0 auto;background:#101b2e;border:1px solid #2c3d5c;border-radius:16px;padding:12px 14px 14px;display:none;box-shadow:0 10px 30px rgb(0 0 0/.5);max-height:62vh;overflow:auto}
#p3-sheet h2{margin:0 0 4px;font-size:17px;display:flex;justify-content:space-between;align-items:center;gap:8px;color:#fff}
#p3-sheet .x{border:0;background:#23314b;color:#e8edf5;border-radius:999px;width:30px;height:30px;font-size:16px;cursor:pointer;flex:none}
#p3-sheet p{margin:6px 0;color:#c9d3e3;font-size:13.5px}
#p3 .seg{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}
#p3 .seg button{border:1px solid #2c3d5c;background:#16243b;color:#e8edf5;border-radius:10px;padding:10px 0;font-weight:700;font-size:14.5px;font-family:inherit;cursor:pointer}
#p3 .seg button.sel{background:#7dbb52;color:#08111f;border-color:#7dbb52}
#p3 .seg button.stop.sel{background:#3a1d1a;color:#f08a7a;border-color:#f08a7a}
#p3 .st{display:inline-block;font-weight:700;border-radius:999px;padding:2px 9px;font-size:12.5px;background:#23314b;color:#93a0b8}
#p3 .st.on{background:#1f3320;color:#8ccb60}
#p3-err{position:absolute;inset:0;display:flex;flex-direction:column;gap:14px;align-items:center;justify-content:center;text-align:center;padding:30px}
</style><canvas id="p3-c"></canvas>
<div id="p3-top">
  <div class="r"><h1>${{volaille:"Poulailler en 3D",animal:"Élevage en 3D",poisson:"Bassin en 3D",culture:"Serre en 3D",couvee:"Couveuse en 3D"}[GEN]}</h1><span class="pill ${B.demo()?"demo":"ok"}" id="p3-mode">${B.demo()?"Démo":"Dispositif"}</span><span class="pill ok" id="p3-alc">Aucune alerte</span><button class="x3" id="p3-close" type="button">Fermer</button></div>
  <div class="r" id="p3-cmds"></div>
  <div id="p3-alert"></div>
  <div class="r" id="p3-views"><button class="view on" data-v="int" type="button">Intérieur</button><button class="view" data-v="top" type="button">Dessus</button><button class="view" data-v="ext" type="button">Extérieur</button><button class="view" id="p3-panne" type="button">Simuler une panne</button><button class="view" id="p3-acq" type="button">Acquitter</button></div>
</div>
<div id="p3-vals"></div><div id="p3-sheet"></div>`;
document.body.append(root);
const canvas=root.querySelector("#p3-c");
let renderer;try{renderer=new THREE.WebGLRenderer({canvas,antialias:true});if(!renderer.getContext())throw 0}catch(e){
  root.innerHTML=`<div id="p3-err"><p>La vue 3D n'est pas disponible sur ce téléphone.</p><button class="x3" type="button">Fermer</button></div>`;
  root.querySelector("button").onclick=()=>{root.remove();document.documentElement.style.overflow=""};return}
renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));renderer.shadowMap.enabled=true;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x9fc3e6);scene.fog=new THREE.Fog(0x9fc3e6,45,95);
const camera=new THREE.PerspectiveCamera(50,1,0.02,200);
const controls=new THREE.OrbitControls(camera,canvas);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*0.495;
const hemi=new THREE.HemisphereLight(0xffffff,0x8a7a5a,0.75);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffffff,0.85);sun.position.set(8,18,22);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
Object.assign(sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16,near:1,far:60});scene.add(sun);
const G={walls:new THREE.Group(),roof:new THREE.Group(),cables:new THREE.Group(),hens:new THREE.Group(),labels:new THREE.Group(),labelsExt:new THREE.Group(),eq:new THREE.Group(),dyn:new THREE.Group(),feed:new THREE.Group(),alt:new THREE.Group(),lampL:new THREE.Group(),eauL:new THREE.Group()};
Object.values(G).forEach(g=>scene.add(g));
const M=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:0.8,metalness:0.05},o));
function box(w,h,d,c,x,y,z,g=G.eq,o){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==="number"?M(c,o):c);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
function cyl(r,h,c,x,y,z,axis="y",g=G.eq,o){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),M(c,o));m.position.set(x,y,z);if(axis==="x")m.rotation.z=Math.PI/2;if(axis==="z")m.rotation.x=Math.PI/2;m.castShadow=true;g.add(m);return m}
function sph(r,c,x,y,z,g=G.eq,o){const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),M(c,o));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m}
function drawTag(ctx,w,txt,col,bg){ctx.clearRect(0,0,w,64);ctx.font="bold 44px system-ui,sans-serif";ctx.fillStyle=bg||"rgba(255,255,255,.93)";ctx.strokeStyle=col;ctx.lineWidth=5;
  const r=14;ctx.beginPath();ctx.moveTo(r,3);ctx.lineTo(w-r,3);ctx.quadraticCurveTo(w-3,3,w-3,r);ctx.lineTo(w-3,61-r);ctx.quadraticCurveTo(w-3,61,w-r,61);ctx.lineTo(r,61);ctx.quadraticCurveTo(3,61,3,61-r);ctx.lineTo(3,r);ctx.quadraticCurveTo(3,3,r,3);ctx.fill();ctx.stroke();
  ctx.fillStyle=col;ctx.textBaseline="middle";ctx.fillText(txt,14,34)}
function label(txt,x,y,z,col="#0a5aa8",size=0.32,grp){txt=tr(txt);
  const c=document.createElement("canvas"),ctx=c.getContext("2d");ctx.font="bold 44px system-ui,sans-serif";const w=Math.ceil(ctx.measureText(txt).width)+28;c.width=w;c.height=64;drawTag(ctx,w,txt,col);
  const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false}));
  s.scale.set(size*w/64,size,1);s.position.set(x,y,z);s.renderOrder=10;(grp||G.labels).add(s);return s}
/* étiquette de valeur qui se met à jour */
function dyn(x,y,z,size=0.3){const CW=1024,c=document.createElement("canvas");c.width=CW;c.height=64;const ctx=c.getContext("2d");const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false}));s.position.set(x,y,z);s.renderOrder=11;s.scale.set(size*CW/64,size,1);G.dyn.add(s);let last="";
  return{s,set(txt,col){const k=txt+col;if(k===last)return;last=k;ctx.clearRect(0,0,CW,64);ctx.font="bold 44px system-ui,sans-serif";
    const w=Math.min(CW,Math.ceil(ctx.measureText(txt).width)+28);drawTag(ctx,w,txt,col);t.needsUpdate=true;s.center.set(w/2/CW,0.5)}}}

/* ---------- terrain et sol ---------- */
const ground=new THREE.Mesh(new THREE.PlaneGeometry(80,80),M(0xc8a96b));ground.rotation.x=-Math.PI/2;ground.position.set(6,-0.01,3.5);ground.receiveShadow=true;scene.add(ground);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(12,7),M(0xe8d9a8));floor.rotation.x=-Math.PI/2;floor.position.set(6,0.005,3.5);floor.receiveShadow=true;scene.add(floor);
/* ---------- murs (h 2,5 m, ép. 0,2 m) avec ouvertures ---------- */
const wallM=M(0xf2efe8,{transparent:true,opacity:1}),WH=2.5,T=0.2;
function wall(x1,z1,x2,z2,holes=[]){ // holes : [début, fin, bas, haut] le long du mur
  const len=Math.hypot(x2-x1,z2-z1),ang=Math.atan2(z2-z1,x2-x1);
  const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(len,0);shape.lineTo(len,WH);shape.lineTo(0,WH);shape.lineTo(0,0);
  holes.forEach(([a,b,lo,hi])=>{const h=new THREE.Path();h.moveTo(a,lo);h.lineTo(b,lo);h.lineTo(b,hi);h.lineTo(a,hi);h.lineTo(a,lo);shape.holes.push(h)});
  const g=new THREE.ExtrudeGeometry(shape,{depth:T,bevelEnabled:false});const m=new THREE.Mesh(g,wallM);
  m.rotation.y=-ang;m.position.set(x1,0,z1);m.castShadow=true;m.receiveShadow=true;G.walls.add(m);return m}
wall(-0.2,-0.2,12.2,-0.2);                                       // nord
const ws=wall(12.2,7.2,-0.2,7.2);                                // sud
wall(-0.2,7.2,-0.2,-0.2,[[1.2,1.9,0.55,1.25],[2.6,3.3,0.55,1.25],[4.0,4.7,0.55,1.25],[5.4,6.1,0.55,1.25]]); // ouest : ventilateurs
wall(12.2,-0.2,12.2,7.2,[[0.8,1.4,1.2,1.9],[1.6,2.8,0,2.1],[3.4,4.0,1.2,1.9]]);  // est : entrées d'air, porte
// local technique
wall(10,4.5,12,4.5);wall(10,7,10,4.5,[[0.3,1.2,0,2.0]]);
G.walls.children.forEach(m=>{m.material=wallM});
// grillages des entrées d'air
[[1.1],[3.7]].forEach(([z])=>box(0.04,0.7,0.6,new THREE.MeshStandardMaterial({color:0x6a7a8a,wireframe:true}),12.3,1.55,z,G.walls));
/* ---------- toiture deux pans + panneaux au sud ---------- */
(function(){const ridge=3.6,ov=0.4;
  const roofM=M(0x8e9aa6,{metalness:0.4,roughness:0.5,side:THREE.DoubleSide});
  const halfW=3.5+T+ov,rise=ridge-WH+0.02,slope=Math.hypot(halfW,rise),ang=Math.atan2(rise,halfW);
  [-1,1].forEach(s=>{const m=new THREE.Mesh(new THREE.BoxGeometry(12.4+2*ov,0.06,slope),roofM);
    m.position.set(6,WH+rise/2,3.5+s*halfW/2);m.rotation.x=s*ang;m.castShadow=true;G.roof.add(m)});
  // pignons
  [ -0.2, 12.2 ].forEach(x=>{const sh=new THREE.Shape();sh.moveTo(-3.7,0);sh.lineTo(3.7,0);sh.lineTo(0,ridge-WH);sh.lineTo(-3.7,0);
    const g=new THREE.ExtrudeGeometry(sh,{depth:0.2,bevelEnabled:false});const m=new THREE.Mesh(g,wallM);m.rotation.y=Math.PI/2;m.position.set(x+(x<0?0:0.2)-0.2+0.2,WH,3.5);G.roof.add(m)});
  // panneaux PV sur le pan sud (z > 3.5)
  const pvM=M(0x1d2f5a,{metalness:0.6,roughness:0.25});
  [4.2,5.5].forEach((x,i)=>{const p=new THREE.Mesh(new THREE.BoxGeometry(1.0,0.04,1.65),pvM);
    p.position.set(x,WH+rise*0.45+0.07,3.5+halfW*0.55);p.rotation.x=ang;p.castShadow=true;G.roof.add(p)});
  label("PV1, PV2 – panneaux 2 × 200 W (sud)",4.85,ridge+0.6,6.2,"#b9770e",0.36,G.roof);
})();
/* ---------- ventilateurs (pignon ouest) ---------- */
const blades=[],fanBoxes=[];
[[1.55,"M6"],[2.95,"M7"],[4.35,"M8"],[5.75,"M9"]].forEach(([z,ref])=>{
  box(0.25,0.8,0.8,0x3b4252,0.0,0.9,z);
  const b=new THREE.Group();for(let k=0;k<3;k++){const bl=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.32,0.09),M(0xd5d8dc));bl.position.y=0.16;const p=new THREE.Group();p.add(bl);p.rotation.x=k*2.094;b.add(p)}
  b.position.set(0.15,0.9,z);G.eq.add(b);blades.push(b);label(ref,-0.45,1.55,z,"#c0392b",0.26,G.labelsExt);fanBoxes.push(b)});
/* ---------- ligne d'eau, cuve, compteur, vanne ---------- */
const blue=0x3d8fe0;
const pipe=cyl(0.025,9,blue,5.1,0.4,2.0,"x");
for(let x=0.8;x<9.6;x+=0.5)cyl(0.01,0.06,0xaaaaaa,x,0.36,2.0);
const flo=[];[[9.3,"B1"],[5.2,"B2"],[0.9,"B3"]].forEach(([x,ref])=>{flo.push(sph(0.07,0x1f5fbf,x,0.47,2.0));label(ref,x,0.85,2.0,"#1f5fbf",0.24,G.eauL)});
cyl(0.03,1.6,blue,10.2,0.4,2.8,"z");cyl(0.03,0.6,blue,9.9,0.4,2.0,"x");
cyl(0.03,3.3,blue,11.85,0.4,3.6,"x");
box(0.16,0.12,0.12,0x2c3e50,11.3,0.4,3.6);label("B7 compteur",11.3,0.85,3.6,"#1f5fbf",0.24);
const yv=box(0.14,0.18,0.14,0x16a085,10.7,0.45,3.6);label("YV1 vanne",10.7,1.15,3.6,"#1f5fbf",0.24);
cyl(0.6,1.2,0x2a6fbd,13.4,1.15,3.6,"y",G.eq,{roughness:0.5});box(1.3,0.55,1.3,0x7f8c8d,13.4,0.27,3.6);

/* ---------- ligne d'aliment, trémie, moteur, pesons ---------- */
const feedLine=box(8.8,0.08,0.18,0xc9a24a,5.0,0.3,4.15,G.feed);
box(0.6,0.7,0.6,new THREE.MeshStandardMaterial({color:0xd8b35b,transparent:true,opacity:0.35}),9.7,1.0,4.15,G.feed);const tremieFill=box(0.56,0.66,0.56,0xc9a24a,9.7,1.0,4.15,G.feed);box(0.25,0.25,0.25,0x7f8c8d,9.7,0.55,4.15,G.feed);
[[-0.25,-0.25],[0.25,-0.25],[-0.25,0.25],[0.25,0.25]].forEach(([dx,dz])=>cyl(0.03,0.6,0x555555,9.7+dx,0.35,4.15+dz,"y",G.feed));
const mot=cyl(0.09,0.22,0x444444,10.1,0.6,4.15,"x",G.feed);const motMark=box(0.03,0.16,0.03,0xf1c40f,10.22,0.6,4.15,G.feed);

const fpts=[];[[8.8,"B4"],[5.2,"B5"],[0.9,"B6"]].forEach(([x,ref])=>{fpts.push(box(0.07,0.12,0.07,0x8a6a1f,x,0.42,4.05,G.feed));label(ref,x,0.8,4.15,"#8a6a1f",0.24,G.feed)});
/* ---------- brumisation ---------- */
cyl(0.012,9.0,0x16a085,5.3,2.2,3.4,"x");for(let k=0;k<6;k++){const x=1.2+1.5*k;sph(0.04,0x16a085,x,2.17,3.4)}
const pump=box(0.3,0.25,0.25,0x16a085,10.4,0.3,3.0);label("M5 pompe",10.4,0.75,3.0,"#16a085",0.24);
/* ---------- éclairage ---------- */
const lamps=[];
[1.5,4.0,6.5,9.0].forEach((x,k)=>{[[1.2,1+k],[5.8,5+k]].forEach(([z,n])=>{const s=sph(0.1,0xfff3b0,x,2.2,z,G.eq,{emissive:0xffd54f,emissiveIntensity:0});lamps.push(s);label("E"+n,x,2.45,z,"#b7950b",0.22,G.lampL)})});
/* ---------- capteurs d'ambiance ---------- */
[[8.6,"B21"],[6.0,"B22"],[2.4,"B23"]].forEach(([x,ref])=>{box(0.08,0.12,0.05,0xe74c3c,x,0.6,2.75);cyl(0.008,1.9,0x999999,x,1.6,2.75)});
box(0.08,0.12,0.05,0x8e44ad,2.6,0.5,5.15);box(0.08,0.12,0.05,0x8e44ad,2.6,1.0,5.15);cyl(0.008,1.9,0x999999,2.6,1.5,5.15);

box(0.1,0.1,0.06,0xffffff,1.0,2.0,7.32);label("B9 luminosité",1.0,2.35,7.4,"#0a5aa8",0.22,G.labelsExt);
/* ---------- local technique : coffret, batterie, MPPT ---------- */
box(0.5,0.35,0.3,0x27ae60,10.5,0.18,6.55);
box(0.25,0.35,0.1,0xffffff,11.2,1.3,6.93);label("U1 MPPT",11.2,1.65,6.85,"#1b2e4c",0.22);
const cofX=11.94,cofZ=5.8;
box(0.25,0.8,0.6,0xd5d8dc,cofX-0.1,1.4,cofZ,G.eq,{metalness:0.3});label("Coffret A1",cofX-0.35,2.0,cofZ,"#1b2e4c",0.26);
const siren=box(0.14,0.08,0.2,0xe74c3c,cofX-0.1,1.86,cofZ,G.eq,{emissive:0xff0000,emissiveIntensity:0});
const gyro=cyl(0.06,0.12,0xf39c12,12.35,2.2,1.0,"y",G.eq,{emissive:0xe67e22,emissiveIntensity:0});label("H1 gyrophare",12.6,2.5,1.0,"#c0392b",0.22,G.labelsExt);
/* ---------- chemin de câbles (h 2,4 m) ---------- */
const trayM=M(0x95a5a6,{metalness:0.5});
[[11.9,2.4,4.9,0.1,0.06,1.4],[10.95,2.4,4.3,1.9,0.06,0.1],[10.0,2.4,4.0,0.1,0.06,0.6],[5.15,2.4,3.7,9.7,0.06,0.15],[0.3,2.4,3.5,0.15,0.06,5.8]].forEach(([x,y,z,w,h,d])=>box(w,h,d,trayM,x,y,z,G.cables));
[[8.6,2.75],[6.0,2.75],[2.4,2.75],[2.6,5.15]].forEach(([x,z])=>{cyl(0.01,1.8,0x34495e,x+0.05,1.5,z+0.02,"y",G.cables)});
/* ---------- poules ---------- */
(function(){const body=new THREE.SphereGeometry(0.13,12,10),head=new THREE.SphereGeometry(0.06,10,8),bm=M(0xb5651d),hm=M(0xc0392b);
  let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  for(let i=0;i<70;i++){const x=0.6+rnd()*9.0,z=0.4+rnd()*6.2;if(x>9.8&&z>4.3)continue;if(Math.abs(z-4.15)<0.2||Math.abs(z-2.0)<0.15)continue;
    const g=new THREE.Group();const b=new THREE.Mesh(body,bm);b.scale.set(1.3,1,1);b.position.y=0.15;const h=new THREE.Mesh(head,hm);h.position.set(0.16,0.27,0);g.add(b,h);
    g.position.set(x,0,z);g.rotation.y=rnd()*6.28;g.traverse(o=>{o.castShadow=true});G.hens.add(g)}})();



/* ---------- contenu selon le lot choisi : volailles, autres animaux, bassin, cultures ou couveuse ---------- */
(function(){if(GEN==="volaille")return;G.hens.visible=false;
  let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};const A=G.alt;
  const libre=(x,z)=>!(x>9.6&&z>4.2)&&Math.abs(z-4.15)>0.3&&Math.abs(z-2.0)>0.25;
  if(GEN==="culture"){floor.material.color.setHex(0x6b4f33);const tige=M(0x3e7d2a),feu=M(0x4caf50),fruit=M(0xd84315);const fruits=SUB==="mara"||SUB==="legume";
    for(const z of [0.8,1.4,2.6,3.2,3.8,4.7,5.3,5.9,6.5])for(let x=0.7;x<9.5;x+=0.55){if(!libre(x,z))continue;const h=0.35+rnd()*0.25;
      const g=new THREE.Group();const t=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.02,h,6),tige);t.position.y=h/2;
      const f=new THREE.Mesh(new THREE.SphereGeometry(0.13+rnd()*0.05,8,6),feu);f.position.y=h;f.scale.set(1,0.8,1);g.add(t,f);
      if(fruits&&rnd()<0.35){const r=new THREE.Mesh(new THREE.SphereGeometry(0.035,6,5),fruit);r.position.set(0.08,h-0.05,0.04);g.add(r)}
      g.position.set(x,0,z);g.traverse(o=>{o.castShadow=true});A.add(g)}
    for(const z of [1.1,2.9,5.0,6.2])box(8.8,0.02,0.02,0x1f5fbf,5.0,0.03,z,A)}   // goutte-à-goutte
  else if(GEN==="couvee"){const blanc=/canard|barbarie|oie/i.test(SUB)?0xf4f1e8:/caille/i.test(SUB)?0xd9c7a0:0xe9cfa6,oeuf=M(blanc,{roughness:0.6});
    [3.2,7.2].forEach(cx=>{box(1.7,1.9,1.1,0xdfe6ec,cx,0.95,3.5,A,{metalness:0.2});box(1.5,1.6,0.02,new THREE.MeshStandardMaterial({color:0x9fd3ff,transparent:true,opacity:0.35}),cx,1.0,4.06,A);
      [0.45,0.95,1.45].forEach(y=>{box(1.4,0.03,0.9,0x95a5a6,cx,y,3.5,A);for(let i=0;i<8;i++)for(let j=0;j<5;j++){const e=new THREE.Mesh(new THREE.SphereGeometry(0.06,10,8),oeuf);e.scale.set(1,1.3,1);e.position.set(cx-0.6+i*0.17,y+0.09,3.15+j*0.17);A.add(e)}})})}
  else if(GEN==="poisson"){floor.material.color.setHex(0xbdb39a);const eau=new THREE.MeshStandardMaterial({color:0x2f86c8,transparent:true,opacity:0.7,roughness:0.2});
    [[3.0,1.1],[3.0,5.6],[7.6,1.1],[7.6,5.6]].forEach(([x,z])=>{box(3.6,0.25,1.4,0x8e8e8e,x,0.12,z,A);box(3.4,0.04,1.2,eau,x,0.25,z,A);
      for(let k=0;k<10;k++){const f=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,6),M(0xe67e22));f.scale.set(1.8,0.7,0.6);f.position.set(x-1.5+rnd()*3,0.2,z-0.5+rnd()*1.0);f.rotation.y=rnd()*6.28;A.add(f)}})}
  else{ /* animaux à quatre pattes */
    const P=/porc/.test(ESP)?{c:0xf2b8ae,w:0.8,h:0.42,d:0.38,n:26}:/bovin|vache/.test(ESP)?{c:/vache/.test(ESP)?0xf5f5f5:0x7a5232,t:/vache/.test(ESP)?0x222222:null,w:1.5,h:0.75,d:0.55,n:10}:{c:/chevre/.test(ESP)?0x9c6b3e:0xeee6d3,w:0.65,h:0.4,d:0.3,n:28};
    for(let i=0;i<P.n;i++){const x=0.8+rnd()*8.6,z=0.5+rnd()*6.1;if(!libre(x,z))continue;const g=new THREE.Group(),m=M(P.c);
      const b=new THREE.Mesh(new THREE.BoxGeometry(P.w,P.h*0.6,P.d),m);b.position.y=P.h*0.7;const hd=new THREE.Mesh(new THREE.BoxGeometry(P.w*0.3,P.h*0.45,P.d*0.75),m);hd.position.set(P.w*0.58,P.h*0.85,0);g.add(b,hd);
      if(P.t){const tc=new THREE.Mesh(new THREE.BoxGeometry(P.w*0.35,P.h*0.62,P.d*1.02),M(P.t));tc.position.set(-P.w*0.1,P.h*0.7,0);g.add(tc)}
      [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([a,c])=>{const l=new THREE.Mesh(new THREE.BoxGeometry(P.w*0.1,P.h*0.45,P.d*0.15),m);l.position.set(a*P.w*0.38,P.h*0.22,c*P.d*0.35);g.add(l)});
      g.position.set(x,0,z);g.rotation.y=rnd()*6.28;g.traverse(o=>{o.castShadow=true});A.add(g)}}})();
if(GEN==="culture"||GEN==="couvee")G.feed.visible=false;
if(GEN==="couvee"){lamps.forEach(l=>l.visible=false);flo.forEach(f=>f.visible=false);G.lampL.visible=false;G.eauL.visible=false}
const lampLights=[new THREE.PointLight(0xffe08a,0,9,1.6),new THREE.PointLight(0xffe08a,0,9,1.6)];lampLights[0].position.set(5,2.1,1.6);lampLights[1].position.set(5,2.1,5.4);lampLights.forEach(l=>scene.add(l));
tremieFill.geometry.translate(0,0.33,0);tremieFill.position.y=0.67;
/* brumisation : gouttelettes */
const mistN=360,mistG=new THREE.BufferGeometry(),mistP=new Float32Array(mistN*3),mistV=new Float32Array(mistN);
for(let i=0;i<mistN;i++){mistP[i*3]=1.2+1.5*(i%6)+(Math.random()-.5)*0.5;mistP[i*3+1]=2.15-Math.random()*1.2;mistP[i*3+2]=3.4+(Math.random()-.5)*0.5;mistV[i]=0.004+Math.random()*0.006}
mistG.setAttribute("position",new THREE.BufferAttribute(mistP,3));
const mist=new THREE.Points(mistG,new THREE.PointsMaterial({color:0xdff3ff,size:0.05,transparent:true,opacity:0.75,depthWrite:false}));mist.visible=false;scene.add(mist);
/* étiquettes de valeurs */
const VL={b21:dyn(8.6,1.0,2.75),b22:dyn(6.0,1.0,2.75),b23:dyn(2.4,1.0,2.75),air:dyn(2.6,1.45,5.15),cuve:dyn(13.4,2.2,3.6,0.32),bat:dyn(10.5,0.65,6.55,0.26),
  tre:dyn(9.7,1.75,4.15),eau:dyn(11.3,0.9,3.6,0.26),vent:dyn(-0.4,2.0,3.6),ecl:dyn(5.2,2.75,3.5),mot:dyn(10.3,0.25,4.6,0.24)};
const C_OK="#2e7d32",C_W="#b26a00",C_B="#c62828",C_N="#1b2e4c";
if(GEN==="culture"||GEN==="couvee"){VL.tre.s.visible=false;VL.mot.s.visible=false}
if(GEN==="couvee"){VL.eau.s.visible=false;VL.ecl.s.visible=false}
if(GEN!=="volaille"&&GEN!=="animal")VL.air.s.visible=false;


let D={};
async function poll(){try{await B.refresh();D=B.data()||{};ui()}catch(e){}}
const timer=setInterval(poll,1000);
const fmt=(v,d=1)=>v==null||isNaN(v)?"—":Number(v).toLocaleString("fr-FR",{minimumFractionDigits:d,maximumFractionDigits:d});
function lvl(v,a,b,c,d){if(v==null||isNaN(v))return"";if(v>=a&&v<=b)return"ok";if(v>=c&&v<=d)return"warn";return"bad"}
const COL={ok:C_OK,warn:C_W,bad:C_B,"":C_N};
/* ---------- commandes ---------- */
const CMDS=[
 {k:"modeEclairage",out:"lampes",name:"Éclairage",icon:"💡",al:[],
  info:()=>`Auto : ${fmt(D.dureeLumiere,D.dureeLumiere%1?1:0)} h de lumière par jour selon l'âge, à partir de ${hhmm(D.heureAllumage)} ; lampes seulement quand il fait sombre.`,
  st:()=>D.lampes?"Allumé (E1–E8)":"Éteint"},
 {k:"modeVentil",out:"vent1",name:"Ventilation",icon:"🌀",al:["alChaleur","alNh3"],
  info:()=>`Auto : étage 1 au-dessus de ${fmt(D.seuilVent1)} °C, étage 2 au-dessus de ${fmt(D.seuilVent2)} °C ; aussi si l'ammoniac dépasse 20 ppm. Au-dessus de 35 °C, tout tourne même en Arrêt.`,
  st:()=>D.vent2?"Étages 1 et 2 en marche (M6–M9)":D.vent1?"Étage 1 en marche (M6, M7)":"Arrêtée"},
 {k:"modeAliment",out:"moteur",name:"Aliment",icon:"🌾",al:["alVis","alTremie"],
  info:()=>`Auto : distribution quand 2 points sur 3 sont vides, seulement quand il fait clair. Trémie : ${fmt(D.tremieKg,0)} kg · aujourd'hui ${fmt(D.alimJour)} kg.`,
  st:()=>D.moteur?"Moteur M1 en marche":"Moteur arrêté"},
 {k:"modeEau",out:"vanne",name:"Eau",icon:"💧",al:["alEauRemplit","alFuite","alEauQualite"],
  info:()=>`Auto : la vanne s'ouvre dès qu'un point manque d'eau et se ferme quand la fin de ligne est pleine. Aujourd'hui ${fmt(D.eauJour,0)} L · pH ${fmt(D.ph)} · sels ${fmt(D.tds,0)} ppm.`,
  st:()=>D.vanne?"Vanne YV1 ouverte":"Vanne fermée"},
 {k:"modeHumid",out:"humid",name:"Humidificateur",icon:"🌫️",al:[],
  info:()=>`Auto : marche sous ${fmt(D.hrBasse,0)} % d'humidité moyenne, et pour rafraîchir au-dessus de 33 °C ; jamais au-dessus de 75 %.`,
  st:()=>D.humid?"Pompe M5 en marche":"Arrêté"}];
const hhmm=h=>{const m=Math.round(((h%24)+24)%24*60);return String(Math.floor(m/60)%24).padStart(2,"0")+" h "+String(m%60).padStart(2,"0")};
const cmdBox=document.getElementById("p3-cmds");
const CMD_OK=i=>!((GEN==="culture"||GEN==="couvee")&&i===2)&&!(GEN==="couvee"&&(i===0||i===3))&&!(GEN==="poisson"&&i===4);
if(GEN==="culture")CMDS[3].name="Arrosage";
CMDS.forEach((c,i)=>{const b=document.createElement("button");b.className="cmd";b.innerHTML=`<i></i>${c.icon} <span>${c.name}</span> <small data-notr>A</small>`;b.onclick=()=>open(i);c.btn=b;if(CMD_OK(i))cmdBox.append(b)});
let openIdx=-1;const sheet=document.getElementById("p3-sheet");
function open(i){openIdx=i;renderSheet();sheet.style.display="block";document.getElementById("p3-vals").style.visibility="hidden"}
function closeSheet(){openIdx=-1;sheet.style.display="none";document.getElementById("p3-vals").style.visibility="visible"}
function send(v){Promise.resolve(B.send(v)).then(()=>setTimeout(poll,150))}
function renderSheet(){ /* construit le panneau une fois ; ui() ne fait que mettre à jour ses textes */
  if(openIdx<0)return;
  if(openIdx===99){sheet.innerHTML=`<h2>Simuler une panne <button class="x" id="sx">✕</button></h2><p>Pour voir comment la vue 3D et les alertes réagissent.</p>
    <div class="seg">${[["chaleur","Chaleur"],["eau","Eau ne remplit pas"],["fuite","Fuite d'eau"],["vis","Vis bloquée"],["sonde","Sonde en défaut"],["batterie","Batterie faible"]].map(([k,n])=>`<button data-p="${k}">${n}</button>`).join("")}</div>
    <div class="seg" style="grid-template-columns:1fr"><button data-p="">Tout réparer</button></div>`;
    sheet.querySelector("#sx").onclick=closeSheet;sheet.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{send({panne:b.dataset.p});closeSheet()});return}
  const c=CMDS[openIdx];
  sheet.innerHTML=`<h2><span>${c.icon} <span>${c.name}</span></span> <button class="x" id="sx">✕</button></h2>
    <span class="st" id="s-st"></span> <span class="st" id="s-md"></span>
    <p id="s-info"></p>
    <div class="seg"><button data-m="1">Auto</button><button data-m="man">Manuel</button></div>
    <div class="seg" id="s-man"><button data-m="2">Marche</button><button data-m="3" class="stop">Arrêt</button></div>`;
  sheet.querySelector("#sx").onclick=closeSheet;
  sheet.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{const on=!!D[c.out],v=b.dataset.m==="man"?(D[c.k]!==1?D[c.k]:(on?2:3)):Number(b.dataset.m);send({[c.k]:v})});
  updSheet()}
function updSheet(){
  if(openIdx<0||openIdx===99)return;const c=CMDS[openIdx],m=D[c.k],man=m!==1,on=!!D[c.out];
  const st=sheet.querySelector("#s-st");st.textContent=c.st();st.className="st"+(on?" on":"");
  sheet.querySelector("#s-md").textContent=man?"Manuel":"Automatique";sheet.querySelector("#s-info").textContent=c.info();
  sheet.querySelector('[data-m="1"]').classList.toggle("sel",!man);sheet.querySelector('[data-m="man"]').classList.toggle("sel",man);
  sheet.querySelector("#s-man").style.display=man?"grid":"none";
  sheet.querySelector('[data-m="2"]').classList.toggle("sel",m===2);sheet.querySelector('[data-m="3"]').classList.toggle("sel",m===3)}
const bp=document.getElementById("p3-panne");if(B.demo())bp.onclick=()=>open(99);else bp.remove();
document.getElementById("p3-acq").onclick=()=>send({acquitter:1});

/* ---------- toucher un équipement dans la 3D ---------- */
const pick=[];const reg=(objs,i)=>{if(CMD_OK(i))objs.forEach(o=>{o.userData.cmd=i;pick.push(o)})};
reg(lamps,0);reg(fanBoxes.concat(blades.flatMap(b=>b.children)),1);reg([tremieFill,mot,feedLine].concat(fpts),2);reg([yv,pipe].concat(flo),3);reg([pump],4);
const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();let down=null;
canvas.addEventListener("pointerdown",e=>{down=[e.clientX,e.clientY]});
canvas.addEventListener("pointerup",e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>8)return;
  ptr.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ptr,camera);
  const hit=ray.intersectObjects(pick,true).find(h=>{let o=h.object;while(o&&o.userData.cmd==null)o=o.parent;return o});
  if(hit){let o=hit.object;while(o.userData.cmd==null)o=o.parent;open(o.userData.cmd)}else if(openIdx>=0)closeSheet()});

/* ---------- mise à jour de l'interface ---------- */
const ALN=Object.keys(ALARMES);
function ui(){
  const act=ALN.filter(a=>D[a]&&ok(a));
  CMDS.forEach(c=>{const on=!!D[c.out],man=D[c.k]!==1;c.btn.classList.toggle("on",on);const s=c.btn.querySelector("small");s.textContent=man?"M":"A";s.className=man?"man":"";
    c.btn.classList.toggle("al",c.al.some(a=>D[a]&&ok(a)))});
  const ac=document.getElementById("p3-alc");ac.textContent=act.length?(act.length>1?act.length+" alertes":"1 alerte"):"Aucune alerte";ac.className="pill "+(act.length?"bad":"ok");
  const al=document.getElementById("p3-alert");al.style.display=act.length?"block":"none";
  al.textContent=act.map(a=>tr(ALARMES[a][1])).join(" · ")+(D.sirene?" · "+tr("sirène en marche"):"");al.setAttribute("data-notr","")
  const V=[["Temp. moy.",fmt(D.tMoy)+" °C",D.tMoy>35?"bad":lvl(D.tMoy,D.tCible-1.5,D.tCible+1.5,D.tCible-3,D.tCible+3)],
    ["Humidité",fmt(D.hrMoy,0)+" %",lvl(D.hrMoy,D.hrBasse,D.hrHaute,D.hrBasse-10,D.hrHaute+5)],
    ["NH₃",fmt(D.nh3,0)+" ppm",lvl(D.nh3,0,15,0,25)],
    ["Eau jour",fmt(D.eauJour,0)+" L",lvl(D.eauJour/(D.eauHier*Math.max(.05,new Date().getHours()/24)),0.85,1.25,0.7,1.5)],
    ["Batterie",fmt(D.batterie)+" V",lvl(D.batterie,25,29.5,24,29.5)]];
  document.getElementById("p3-vals").innerHTML=V.filter(([l])=>!(l==="NH₃"&&GEN!=="volaille"&&GEN!=="animal")&&!(l==="Eau jour"&&GEN==="couvee")).map(([l,v,c])=>`<div class="v ${c}"><span>${l}</span><b>${v}</b></div>`).join("");
  // étiquettes 3D
  [["b21","t1","h1","B21"],["b22","t2","h2","B22"],["b23","t3","h3","B23"]].forEach(([k,t,h,r])=>{const bad=D[t]<-10||D[t]>60;
    VL[k].set(bad?`${r} ${tr("en défaut")}`:`${r} ${fc(D[t])} °C · ${fc(D[h],0)} %`,COL[bad?"bad":lvl(D[t],D.tCible-1.5,D.tCible+1.5,D.tCible-3,D.tCible+3)])});
  VL.air.set(`NH₃ ${fc(D.nh3,0)} ppm · CO₂ ${fc(D.co2,0)}`,COL[D.nh3>25?"bad":D.nh3>15||D.co2>2500?"warn":"ok"]);
  VL.cuve.set(`${tr("Cuve")} · pH ${fc(D.ph)} · ${tr("sels")} ${fc(D.tds,0)} ppm`,COL[lvl(D.ph,6.5,7.5,6,8)==="bad"||D.tds>3000?"bad":lvl(D.ph,6.5,7.5,6,8)==="warn"||D.tds>1000?"warn":"ok"]);
  VL.bat.set(`G1 ${fc(D.batterie)} V`,COL[lvl(D.batterie,25,29.5,24,29.5)]);
  VL.tre.set(`${tr("Trémie")} ${fc(D.tremieKg,0)} kg · ${fc(D.alimJour)} ${tr("kg/jour")}`,COL[lvl(D.tremieKg,40,1e9,20,1e9)]);
  VL.eau.set(D.alFuite?tr("Fuite d'eau !"):D.alEauRemplit?tr("L'eau ne remplit pas !"):`${tr("Eau")} ${fc(D.eauJour,0)} L ${tr("aujourd'hui")}`,D.alFuite||D.alEauRemplit?C_B:"#1f5fbf");
  VL.vent.set(tr(D.vent2?"Ventilation : étages 1 + 2":D.vent1?"Ventilation : étage 1":"Ventilation arrêtée"),D.vent1?C_OK:C_N);
  VL.ecl.set(tr(D.lampes?"Éclairage allumé":"Éclairage éteint"),D.lampes?"#b7950b":C_N);
  VL.mot.set("M1 "+tr(D.alVis?"bloqué !":D.moteur?"en marche":"arrêté"),D.alVis?C_B:D.moteur?C_OK:C_N);
  updSheet()}

/* ---------- animation : l'état des équipements se voit dans la 3D ---------- */
const grey=new THREE.Color(0x6b7280),lampOn=new THREE.Color(0xfff3b0);
let t=0;
function animate(){t+=0.016;
  const on=!!D.lampes;lamps.forEach(l=>{l.material.emissiveIntensity=on?1.3:0;l.material.color.copy(on?lampOn:grey)});lampLights.forEach(l=>l.intensity=on?0.6:0);
  blades.forEach((b,i)=>{if(i<2?D.vent1:D.vent2)b.rotation.x+=0.45});
  if(D.moteur){mot.rotation.x+=0.3;motMark.position.y=0.6+0.08*Math.sin(t*12);feedLine.material.emissive.setHex(0x6b4f12);feedLine.material.emissiveIntensity=0.5+0.5*Math.sin(t*8)}else{feedLine.material.emissiveIntensity=0}
  tremieFill.scale.y=Math.max(0.02,Math.min(1,(D.tremieKg||0)/150));tremieFill.material.color.setHex(D.tremieKg<20?0xe74c3c:0xc9a24a);
  fpts.forEach((p,i)=>p.material.color.setHex(D["alim"+(i+1)]?0xc9a24a:0xe74c3c));
  flo.forEach((f,i)=>f.material.color.setHex(D["eau"+(i+1)]?0x2f86e8:0xe74c3c));
  pipe.material.emissive.setHex(0x1565c0);pipe.material.emissiveIntensity=D.vanne?0.6+0.4*Math.sin(t*10):0;
  yv.material.color.setHex(D.vanne?0x2ecc71:0x7f8c8d);
  pump.material.color.setHex(D.humid?0x1abc9c:0x5d6d7e);
  mist.visible=!!D.humid;if(mist.visible){for(let i=0;i<mistN;i++){mistP[i*3+1]-=mistV[i];if(mistP[i*3+1]<0.9)mistP[i*3+1]=2.15}mistG.attributes.position.needsUpdate=true}
  const blink=D.alarme&&Math.sin(t*10)>0;gyro.material.emissiveIntensity=blink?2:0;gyro.material.color.setHex(blink?0xffa000:0x8a5a1a);
  siren.material.emissiveIntensity=D.sirene&&Math.sin(t*14)>0?1.5:0;
  hemi.intensity=0.75;
}


/* ---------- vues et cadrage automatique ---------- */
const wallMat=G.walls.children[0].material;
const VIEWS={int:{d:[0.45,0.7,0.55],pd:[0.85,0.95,0.3],r:7.2,pr:6.4,t:[6.2,0.4,3.5]},top:{d:[0,1,0.02],r:7.3,t:[6.6,0,3.5]},ext:{d:[0.55,0.42,0.72],pd:[0.85,0.5,0.55],r:7.4,pr:6.8,t:[6.4,1.2,3.6]}};
let cur="int",freeH=1,aspect=1,anim=null;
function place(v){const V=VIEWS[v],F=THREE.MathUtils.degToRad(camera.fov),fv=2*Math.atan(Math.tan(F/2)*freeH),fh=2*Math.atan(Math.tan(F/2)*aspect);
  const port=innerWidth<innerHeight,r=port&&V.pr?V.pr:V.r;const dist=r/Math.sin(Math.min(fv,fh)/2)*1.02;let d=new THREE.Vector3(...(port&&V.pd?V.pd:V.d));if(v==="top"&&port)d=new THREE.Vector3(0.02,1,0);
  d.normalize();const tg=new THREE.Vector3(...V.t);return[tg.clone().add(d.multiplyScalar(dist)),tg]}
function go(v){cur=v;document.querySelectorAll("#p3-views [data-v]").forEach(b=>b.classList.toggle("on",b.dataset.v===v));
  G.roof.visible=v==="ext";G.labels.visible=v!=="ext";G.lampL.visible=G.eauL.visible=v!=="ext"&&GEN!=="couvee";G.dyn.visible=true;wallMat.transparent=true;wallMat.opacity=v==="int"?0.35:1;wallMat.depthWrite=v!=="int";
  const[p1,t1]=place(v),p0=camera.position.clone(),t0=controls.target.clone(),st=performance.now();
  anim=()=>{const k=Math.min(1,(performance.now()-st)/900),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;camera.position.lerpVectors(p0,p1,e);controls.target.lerpVectors(t0,t1,e);if(k>=1)anim=null}}
document.querySelectorAll("#p3-views [data-v]").forEach(b=>b.onclick=()=>go(b.dataset.v));
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);
  const top=document.getElementById("p3-top").getBoundingClientRect().bottom+4,bot=h-document.getElementById("p3-vals").getBoundingClientRect().top+4;
  freeH=Math.max(0.35,(h-top-bot)/h);aspect=w/h;camera.aspect=aspect;camera.updateProjectionMatrix()}
const onResize=()=>{resize();go(cur)};addEventListener("resize",onResize);
poll().then(()=>{resize();const[p,tg]=place("int");camera.position.copy(p);controls.target.copy(tg);go("int")});
renderer.setAnimationLoop(()=>{if(anim)anim();animate();controls.update();renderer.render(scene,camera)});
/* fermeture : tout s'arrête, rien ne tourne en arrière-plan */
function close(){clearInterval(timer);removeEventListener("resize",onResize);renderer.setAnimationLoop(null);
  scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(m.map)m.map.dispose();m.dispose()})}});
  renderer.dispose();try{renderer.forceContextLoss()}catch(e){}root.remove();document.documentElement.style.overflow="";if(B.onClose)B.onClose()}
document.getElementById("p3-close").onclick=close;

}};
})();
