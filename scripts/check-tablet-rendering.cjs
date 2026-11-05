const assert=require('node:assert/strict'),vm=require('node:vm'),T=require('../dist/assets/three.min.js');
const {createJourneyPerformance}=require('../dist/assets/journey-performance.js');
const {createJungleLightBudget}=require('../dist/assets/jungle-light-budget.js');
const source=require('./read-journey-source.cjs')();
const run=(budget,seconds,dt)=>{for(let i=0;i<seconds/dt;i++)budget.sample(dt);};
for(const cores of [2,4,8])for(const [width,height] of [[810,1080],[1080,810],[810,965],[1024,1366]]){
  const budget=createJourneyPerformance({touch:true,cores,pixelRatio:2,width,height});
  assert(budget.budget.economy,'A desktop-mode tablet must start with lighter geometry');
  const pixels=()=>width*height*budget.budget.ratio**2;
  assert(pixels()<=800001,'Tablet opening starts at no more than 800k pixels');
  run(budget,3,1/30);assert(pixels()<600001,'30 FPS pressure lowers tablet GPU work within three seconds');
  run(budget,10,1/15);assert(pixels()>=449999&&pixels()<=450001,'Persistent overload reaches the bounded tablet floor');
  const lower=budget.budget.ratio;run(budget,4,1/60);assert.equal(budget.budget.ratio,lower,'A short recovery must not pump resolution');
  run(budget,160,1/60);assert(pixels()<=1200001,'Sustained recovery stays within the tablet ceiling');
  budget.resize(height,width);assert(height*width*budget.budget.ratio**2<=1200001);
  budget.resize(1366,1024);assert(1366*1024*budget.budget.ratio**2<=1200001);
}
assert.equal(createJourneyPerformance({touch:true,cores:6,pixelRatio:3,width:390,height:844}).budget.economy,false,'Healthy phone detail is preserved');
assert.equal(createJourneyPerformance({cores:8,pixelRatio:2,width:1440,height:900}).budget.economy,false,'Desktop detail is preserved');

const scene=new T.Scene(),budget=createJungleLightBudget(T,scene,{compact:true});
const entrance=Array.from({length:4},(_,i)=>{const l=budget.create(0x38ddff,20,15,1,'entrance');l.position.set(i-1.5,3,-i);return l;});
const jungle=Array.from({length:11},(_,i)=>{const l=budget.create(0x35ddbb,20,12);l.position.set(i%2?2:-2,2,-10-i*8);return l;});
const physical=scene.children.filter(x=>x.isPointLight),camera=new T.PerspectiveCamera();
assert.equal(physical.length,4,'All fifteen logical lights share four physical lights');
camera.position.set(0,3,15);budget.sync(camera,0,{snap:true,progress:0});
assert(budget.capture().every(x=>entrance.includes(x.source)),'The entrance retains all four original light sources');
for(const progress of [.1,.3,.4,.5,.6,.8,1,.6,.3,.1]){
  camera.position.set(0,3,15-progress*90);budget.sync(camera,.033,{snap:true,progress});
  assert.equal(scene.children.filter(x=>x.isPointLight).length,4,'Forward and reverse travel never recompile a different light count');
  const assigned=budget.capture().filter(x=>x.source).map(x=>x.source);
  assert.equal(new Set(assigned).size,assigned.length);
  if(progress>.58)assert(assigned.every(x=>jungle.includes(x)),'Entrance lights relinquish their slots after the crossing');
  if(progress<=.27)assert(assigned.every(x=>entrance.includes(x)),'Reverse travel restores entrance lights');
}
assert(!source.includes('new T.PointLight('),'Production must route every entrance light through the shared budget');
assert(source.includes('lightBudget.sync(camera,effectDelta,{progress:p})'));

function branch(economy,radius){
  const parent=new T.Group(),material=new T.MeshStandardMaterial();material.userData.bark=true;
  const context={T,quality:{compact:true,economy},revealWorld:parent,revealRandom:n=>{const v=Math.sin(n*127.13+53.7)*43758.5453;return v-Math.floor(v);},mesh(g,m,x,y,z,p){const node=new T.Mesh(g,m);p.add(node);return node;}};
  vm.createContext(context);vm.runInContext(source.slice(source.indexOf('    function* organicBranch('),source.indexOf('    function pathRibbon(')),context);
  const build=context.organicBranch([[-4.1,0,-11.5],[-4.2,2,-11.4],[-3.8,5,-11.7],[-3.2,7.3,-11.1]],radius,.035,material,56);
  let result;do{result=build.next();}while(!result.done);return result.value;
}
for(const radius of [1.16,.43,.13]){
  const full=branch(false,radius),lean=branch(true,radius),geometry=lean.branch.geometry;
  assert(geometry.index.count<full.branch.geometry.index.count*.6,'Tablet branches remove at least 40% of triangles');
  for(const key of ['position','normal','uv'])assert([...geometry.attributes[key].array].every(Number.isFinite));
  for(const t of [0,.25,.5,.75,1])assert(lean.curve.getPointAt(t).equals(full.curve.getPointAt(t)),'Branch placement and shape follow the same curve');
  const radial=geometry.parameters.radialSegments,normal=geometry.attributes.normal;
  for(let row=0;row<=geometry.parameters.tubularSegments;row++){
    const a=row*(radial+1),b=a+radial;
    assert(new T.Vector3().fromBufferAttribute(normal,a).distanceTo(new T.Vector3().fromBufferAttribute(normal,b))<1e-6,'Reduced-detail seams remain smooth');
  }
}
console.log('PASS: tablet budget and fast pressure response; phone/desktop detail; four shared lights through forward/reverse travel; 40%+ fewer branch triangles with unchanged curves and seamless normals.');
