const fs=require('fs'),vm=require('vm'),assert=require('assert');
const T=require('../dist/assets/three.min.js');
const html=require('./read-journey-source.cjs')();
const route=html.slice(html.indexOf('    const jungleStretch='),html.indexOf('    function sidePathOpening'));
const pose=html.slice(html.indexOf('    function pose(v)'),html.indexOf('    // Pause wheel/touch'));
const solve=html.slice(html.indexOf('    let cachedStopAspect='),html.indexOf('    const guide='));
for(const [w,h] of [[320,568],[390,844],[430,932],[844,390],[1280,720]]){
 const camera=new T.PerspectiveCamera(74,w/h,.1,180);
 const ctx={T,camera,ease:t=>t*t*(3-2*t),lerp:(a,b,t)=>a+(b-a)*t};vm.createContext(ctx);
 vm.runInContext(route+pose+'\nconst pageStops=jungleSidePaths;\n'+solve+'\nthis.stops=pageStops;this.targets=stopProgress();this.final=pose(1);this.clearingZ=endingZ;',ctx);
 assert.equal(ctx.stops.length,4,'Only four jungle destinations remain');
 assert.equal(ctx.stops.at(-1).id,'whats-happening');
 assert(1-ctx.targets.at(-1)<.19,'One normal swipe can finish after What’s Happening');
 assert(ctx.stops.at(-1).z+8.1-ctx.final.pos[2]<13,'Final approach must remain under 13m');
 for(let i=0;i<ctx.stops.length;i++){
  const stop=ctx.stops[i],distance=ctx.pose(ctx.targets[i]).pos[2]-stop.z;
  assert(Math.abs(distance-8.1)<.001,'Gesture must stop inside each readable card window');
  if(i)assert(ctx.stops[i-1].z-stop.z>7.48,'Physical stop spacing must grow by 44%');
 }
 for(let p=.581;p<=1;p+=.001){
  const z=ctx.pose(p).pos[2],visible=ctx.stops.filter(s=>z-s.z<=10&&z-s.z>6.2);
  assert(visible.length<=1,'Only one destination may be active');
 }
 assert(ctx.final.pos[2]-ctx.stops.at(-1).z<3,'Final card must clear well before arrival');
 camera.position.set(...ctx.final.pos);camera.lookAt(new T.Vector3(...ctx.final.look));camera.updateMatrixWorld();
 const x=ctx.final.pos[0];
 for(const point of [[x-2.92,6.88,ctx.clearingZ],[x+2.92,6.88,ctx.clearingZ],[x,0,ctx.clearingZ]]){
  const screen=new T.Vector3(...point).project(camera);
  assert(Math.abs(screen.x)<.84&&Math.abs(screen.y)<.85,`${w}×${h}: clearing composition must stay inside the frame`);
 }
}
for(const file of ['ending-portal.js','journey-atmosphere.js','jungle-lighting.js','journey-interface.js'])new vm.Script(fs.readFileSync(require('path').join(__dirname,'../dist/assets',file),'utf8'),{filename:file});
console.log('PASS: 44% wider stop spacing; single active card; all four gesture targets; short final approach; cleared finale; clearing framing at five desktop/mobile sizes; changed asset syntax.');
