const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const T=require('../dist/assets/three.min.js'),dir=path.join(__dirname,'../dist');
const sandbox={window:{}};vm.createContext(sandbox);
for(const name of ['jungle-lighting.js','destination-grass.js'])vm.runInContext(fs.readFileSync(path.join(dir,'assets',name),'utf8'),sandbox);
// Exercise actual material compilation hooks against the bundled Three shader.
const leaf=new T.MeshStandardMaterial(),bark=new T.MeshStandardMaterial(),trail=new T.MeshStandardMaterial();
sandbox.window.createJungleLighting({THREE:T,foliage:leaf,bark:[bark],path:trail,sidePath:trail.clone(),reducedMotion:false});
for(const material of [leaf,bark,trail]){
 const shader={vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader,uniforms:{}};
 material.onBeforeCompile(shader);
 assert(shader.fragmentShader.includes('outgoingLight*=mix(1.,livingEdgeCalm'),'The edge falloff must be attached to the actual shader output');
 assert(shader.vertexShader.includes('instanceMatrix*livingPosition'),'Instanced foliage must shade in world coordinates');
}
const ids=['exhibits','mini-golf','parties','whats-happening','plan-your-visit'];
function setup(reducedMotion=false){
 const buttons=ids.map(()=>({hidden:true,dataset:{},style:{setProperty(){}},addEventListener(){}}));
 const parent=new T.Group(),root={querySelector(selector){if(selector==='.scene')return{clientWidth:390};return buttons[ids.findIndex(id=>selector.includes('"'+id+'"'))];}};
 const stops=ids.map((id,i)=>({id,side:i%2?-1:1,curve:new T.CatmullRomCurve3([new T.Vector3(3,0,-25-i*8),new T.Vector3(5,0,-26-i*8)])}));
 const effect=sandbox.window.createDestinationGrass({THREE:T,parent,stops,root,groundAt:()=>.1,pathX:()=>0,softMap:new T.Texture(),reducedMotion});
 const group=parent.children[0],clusters=group.children.filter(n=>n.name.startsWith('Alien Grass —'));
 let clock=0;
 function tick(seconds,running=true){for(let i=0;i<seconds*60;i++){if(running)clock+=1/60;effect.update(.75,clock,1/60,running);}}
 return{buttons,parent,group,clusters,tick};
}
const a=setup();a.tick(.1);
const visibleLights=()=>{let count=0;a.parent.traverseVisible(o=>{if(o.isLight)count++;});return count;};
const lightCount=visibleLights();
const dormantGlobe=a.clusters[4].children.find(o=>o.geometry?.type==='SphereGeometry');
const dormantPhase=dormantGlobe.material.userData.glow.phase.value;
a.tick(2);assert.equal(dormantGlobe.material.userData.glow.phase.value,dormantPhase,'Offscreen bulbs must not animate');
assert(a.clusters.every(c=>!c.visible),'Inactive destinations must not leave rows of glowing bulbs');
assert.equal(a.parent.children.filter(c=>c.isPointLight).length,1,'Only one shared grass spill light');
assert.equal(a.clusters[0].children.filter(c=>c.geometry?.type==='SphereGeometry').length,4,'Four globes per cluster');
a.buttons[0].hidden=false;a.tick(2);assert(a.clusters[0].visible);assert.equal(visibleLights(),lightCount,'Revealing grass must not change the shader light count');
a.buttons[0].hidden=true;a.buttons[1].hidden=false;a.tick(4);
assert.deepEqual(a.clusters.map(c=>c.visible),[false,true,false,false,false],'The previous accent must settle fully after handoff');
a.buttons[1].hidden=true;a.tick(4);assert(a.clusters.every(c=>!c.visible));assert.equal(visibleLights(),lightCount,'Hiding grass must keep the shader light count stable');
const reduced=setup(true);reduced.buttons[2].hidden=false;reduced.tick(.1,false);assert(reduced.clusters[2].visible);reduced.buttons[2].hidden=true;reduced.tick(.1,false);assert(!reduced.clusters[2].visible);
console.log('PASS: real shader output hook; instanced edge lighting; four bulbs; one spill light; inactive cleanup; destination handoff; paused/reduced-motion state changes.');
