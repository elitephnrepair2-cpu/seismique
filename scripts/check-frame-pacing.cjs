const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {createJourneyCadence}=require('../dist/assets/journey-performance.js');
for(const refresh of [30,60,90,120]){
 const cadence=createJourneyCadence(30);let updates=0,elapsed=0;
 cadence.consume(0,true);
 for(let i=0;i<refresh*4;i++){const dt=cadence.consume(1/refresh);if(dt!==null){updates++;elapsed+=dt;}}
 assert.equal(updates,120,`${refresh}Hz camera frames must produce exactly 30Hz background updates`);
 assert(Math.abs(elapsed-4)<1e-5,'Accents retain elapsed time instead of slowing down');
 assert.equal(cadence.consume(0,true),0,'A destination change can refresh immediately');
}
const html=require('./read-journey-source.cjs')();
assert(!html.includes('if(changed||secondaryElapsed'),'Camera movement must not bypass the effects budget');
assert(html.includes("quality.ratio<renderer.getPixelRatio()||guideState.mode==='idle'"),'Overloaded frames can reduce GPU work immediately; recovery waits for a settled camera');
assert(html.indexOf('await warmJungleBuffers();')<html.indexOf("revealReady=true;revealWorld.visible=true"),'GPU preparation finishes before the crossing is released');
const source=html.slice(html.indexOf('    async function warmJungleBuffers('),html.indexOf('    async function finishPreparation(){'));
async function checkWarmup(fail=false){
 let disposed=0,draws=0,target='original';
 const camera={clone(){return {position:{set(){}},lookAt(){},updateMatrixWorld(){}};}};
 const ctx={performance:{now:()=>1000},root:{dataset:{}},document:{hidden:false},T:{WebGLRenderTarget:class {constructor(w,h){assert.equal(w,32);assert.equal(h,32);}dispose(){disposed++;}}},camera,lightBudget:{sync(){},capture(){return [];},restore(){}},revealWorld:{visible:false},scene:{},stopProgress:()=>[.625,.723,.785,.846],pose:()=>({pos:[0,1,2],look:[0,1,-2]}),window:{requestIdleCallback:true},requestIdleCallback:fn=>fn(),renderer:{getRenderTarget:()=>target,setRenderTarget(value){target=value;},render(scene,probe){assert.notEqual(probe,camera);draws++;if(fail&&draws===2)throw Error('GPU unavailable');}},setTimeout};
 vm.createContext(ctx);vm.runInContext(source,ctx);
 if(fail)await assert.rejects(ctx.warmJungleBuffers(),/GPU unavailable/);else {await ctx.warmJungleBuffers();assert.equal(draws,3);assert.equal(ctx.root.dataset.gpuPreparation,'ready');}
 assert.equal(target,'original','Visible render target is always restored');assert.equal(ctx.revealWorld.visible,false);assert.equal(disposed,1,'Warmup target must not leak GPU memory');
}
(async()=>{await checkWarmup();await checkWarmup(true);console.log('PASS: camera-independent 30Hz effects at 30/60/90/120Hz; elapsed-time preservation; settled quality changes; GPU warmup before reveal; render state and resources restored on success/failure.');})().catch(error=>{console.error(error);process.exitCode=1;});
async function checkDeferredWarmup(){
 let mode='intro',draws=0,waits=0,target=null;
 const ctx={performance:{now:()=>0},root:{dataset:{}},document:{hidden:false},T:{WebGLRenderTarget:class{dispose(){}}},camera:{clone:()=>({position:{set(){}},lookAt(){},updateMatrixWorld(){}})},lightBudget:{capture:()=>[],restore(){},sync(){}},revealWorld:{visible:true},scene:{},stopProgress:()=>[.625],pose:()=>({pos:[0,0,0],look:[0,0,-1]}),guide:{state:()=>({mode})},window:{requestIdleCallback:true},requestIdleCallback:fn=>fn(),setTimeout(fn){assert.equal(draws,0,'Future-destination warming must not draw during the moving intro');waits++;mode='idle';fn();},renderer:{getRenderTarget:()=>target,setRenderTarget:v=>target=v,render(){assert.equal(mode,'idle');draws++;}}};
 vm.createContext(ctx);vm.runInContext(source,ctx);await ctx.warmJungleBuffers([.8],true);assert.equal(waits,1);assert.equal(draws,1);assert.equal(target,null);
 console.log('PASS: future-view GPU warming waits until the opening camera settles.');
}
checkDeferredWarmup().catch(e=>{console.error(e);process.exitCode=1;});
