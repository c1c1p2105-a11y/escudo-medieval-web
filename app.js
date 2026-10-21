const viewer=document.querySelector('#shield');
const status=document.querySelector('#status');
const buttons=['steel','wood','bronze'].map(id=>document.getElementById(id));
let materials, defaults, walnut, woodDark=false, steelDark=false, bronzeRelief=true;
const setStatus=text=>{status.textContent=text};
function sync(){
  buttons[0].setAttribute('aria-pressed',String(steelDark));
  buttons[1].setAttribute('aria-pressed',String(woodDark));
  buttons[2].setAttribute('aria-pressed',String(bronzeRelief));
  document.querySelector('#steel-label').textContent=steelDark?'Acero pavonado':'Forjado natural';
  document.querySelector('#wood-label').textContent=woodDark?'Nogal oscuro':'Roble cálido';
  document.querySelector('#bronze-label').textContent=bronzeRelief?'Normal map activado':'Normal map desactivado';
}
viewer.addEventListener('progress',e=>{document.querySelector('#progress-fill').style.width=`${Math.round(e.detail.totalProgress*100)}%`;});
viewer.addEventListener('load',async()=>{
  const byName=Object.fromEntries(viewer.model.materials.map(m=>[m.name,m]));
  materials={steel:byName.Acero_Forjado,wood:byName.Madera_Roble,bronze:byName.Bronce_Envejecido};
  if(Object.values(materials).some(m=>!m)){setStatus('Error al identificar materiales');return;}
  defaults={steelColor:[...materials.steel.pbrMetallicRoughness.baseColorFactor],steelRoughness:materials.steel.pbrMetallicRoughness.roughnessFactor,wood:materials.wood.pbrMetallicRoughness.baseColorTexture.texture,bronze:materials.bronze.normalTexture.texture};
  for(const button of buttons)button.disabled=false;
  document.querySelector('#reset').disabled=false;
  document.querySelector('.progress').classList.add('done');
  setStatus('Modelo listo para explorar');
});
viewer.addEventListener('error',()=>{document.querySelector('#load-error').hidden=false;setStatus('Error de carga');for(const b of buttons)b.disabled=true;});
buttons[0].addEventListener('click',()=>{
  steelDark=!steelDark;
  materials.steel.pbrMetallicRoughness.setBaseColorFactor(steelDark?'#637485':defaults.steelColor);
  materials.steel.pbrMetallicRoughness.setRoughnessFactor(steelDark?.75:defaults.steelRoughness);
  sync();setStatus(steelDark?'Acero pavonado aplicado':'Acero natural restaurado');
});
buttons[1].addEventListener('click',async()=>{
  buttons[1].disabled=true;
  try{
    if(!walnut){setStatus('Cargando acabado de nogal…');walnut=await viewer.createTexture('assets/wood_walnut_basecolor.jpg');}
    woodDark=!woodDark;
    materials.wood.pbrMetallicRoughness.baseColorTexture.setTexture(woodDark?walnut:defaults.wood);
    sync();setStatus(woodDark?'Textura de nogal aplicada':'Textura de roble restaurada');
  }catch(error){setStatus('No se pudo cargar la textura');console.error(error);}
  finally{buttons[1].disabled=false;}
});
buttons[2].addEventListener('click',()=>{
  bronzeRelief=!bronzeRelief;
  materials.bronze.normalTexture.setTexture(bronzeRelief?defaults.bronze:null);
  sync();setStatus(bronzeRelief?'Relieve del bronce activado':'Relieve del bronce desactivado');
});
document.querySelector('#reset').addEventListener('click',()=>{
  steelDark=woodDark=false;bronzeRelief=true;
  materials.steel.pbrMetallicRoughness.setBaseColorFactor(defaults.steelColor);
  materials.steel.pbrMetallicRoughness.setRoughnessFactor(defaults.steelRoughness);
  materials.wood.pbrMetallicRoughness.baseColorTexture.setTexture(defaults.wood);
  materials.bronze.normalTexture.setTexture(defaults.bronze);
  sync();setStatus('Materiales originales restaurados');
});
document.querySelector('#front').addEventListener('click',()=>{viewer.cameraOrbit='0deg 90deg 2.6m';viewer.fieldOfView='30deg';setStatus('Vista frontal');});
document.querySelector('#back').addEventListener('click',()=>{viewer.cameraOrbit='180deg 82deg 2.6m';viewer.fieldOfView='30deg';setStatus('Vista posterior');});
fetch('assets/estadisticas.json').then(r=>r.json()).then(stats=>{
  document.querySelector('#triangles').textContent=stats.triangles.toLocaleString('es-MX');
  document.querySelector('#filesize').textContent=(stats.glb_bytes/1048576).toFixed(2)+' MB';
}).catch(()=>{});
