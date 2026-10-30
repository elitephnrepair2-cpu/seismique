const assert=require('node:assert/strict');
const {createJourneyPerformance,createJourneyLoop}=require('../dist/assets/journey-performance.js');
const mobile=createJourneyPerformance({compact:true,cores:6,memory:8,pixelRatio:3});
const desktop=createJourneyPerformance({pixelRatio:2});
assert.equal(mobile.budget.ratio,1.5);assert.equal(desktop.budget.ratio,1.8);
assert(mobile.budget.density<desktop.budget.density);
function sample(controller,seconds,dt){for(let i=0;i<seconds/dt;i++)controller.sample(dt);}
sample(mobile,20,1/60);assert(mobile.budget.ratio>=1.5&&mobile.budget.ratio<=1.75,'Healthy phones retain or improve crispness');
const healthy=mobile.budget.ratio;mobile.sample(.8);assert.equal(mobile.budget.ratio,healthy,'A tab-resume gap must not lower quality');
sample(mobile,8,1/25);assert(mobile.budget.ratio<healthy,'Sustained slow rendering lowers GPU work');
const lower=mobile.budget.ratio;sample(mobile,4,1/60);assert.equal(mobile.budget.ratio,lower,'Recovery must not oscillate on a few good frames');
sample(mobile,80,1/60);assert.equal(mobile.budget.ratio,1.75,'Sustained recovery restores bounded quality');
sample(mobile,100,1/20);assert(mobile.budget.ratio>=1.25,'Quality has a legibility floor');
const struggling=createJourneyPerformance({compact:true,pixelRatio:3});
sample(struggling,8,.2);assert(struggling.budget.ratio<1.5,'A phone rendering at five FPS must still reduce GPU work');
const beforeGap=struggling.budget.ratio;struggling.sample(90);assert.equal(struggling.budget.ratio,beforeGap,'Suspending a tab does not change quality');
let id=0,now=0,animate=true,calls=0,lastDt=-1;const callbacks=new Map();
const loop=createJourneyLoop({request(fn){callbacks.set(++id,fn);return id;},cancel(key){callbacks.delete(key);},render(dt){calls++;lastDt=dt;return animate;}});
function tick(gap=16.667){now+=gap;const pending=[...callbacks.values()];callbacks.clear();pending.forEach(fn=>fn(now));}
loop.wake();loop.wake();assert.equal(callbacks.size,1,'Never create duplicate RAF chains');
tick();tick();assert(lastDt>0&&lastDt<.02);
loop.setVisible(false);assert.equal(callbacks.size,0);const rested=calls;tick(90000);assert.equal(calls,rested,'Hidden scenes do no rendering');
loop.setVisible(true);tick();assert.equal(lastDt,0,'Resume never catches up ninety seconds of motion');
animate=false;tick();assert.equal(callbacks.size,0,'Paused stationary scenes stop requesting frames');
loop.wake();tick();assert.equal(calls,rested+3,'Input wakes a paused scene for one render');
animate=true;loop.wake();tick();assert.equal(callbacks.size,1);loop.dispose();assert.equal(callbacks.size,0);loop.wake();assert.equal(callbacks.size,0);
console.log('PASS: bounded mobile budgets, sustained-pressure scaling, slow recovery, visibility cancellation, clean resume, paused demand rendering, single RAF chain and disposal.');

// Exercise the production resize callbacks without requiring a GPU.
const fs=require('node:fs'),vm=require('node:vm');
const html=require('./read-journey-source.cjs')();
const resizeSource=html.slice(html.indexOf('    let pendingViewport='),html.indexOf('    const sceneResize='));
let bufferChanges=0,wakes=0;
const ctx={stage:{clientWidth:390,clientHeight:844},root:{wakeJourney(){wakes++;}},renderer:{setSize(){bufferChanges++;}},camera:{aspect:1,fov:76,updateProjectionMatrix(){}},fitEntranceWordmark(){},destinationGrass:{resize(){}},viewportWidth:0,viewportHeight:0};
vm.createContext(ctx);vm.runInContext(resizeSource,ctx);
ctx.resize();ctx.resize();assert.equal(bufferChanges,0,'Resize observers must not clear the canvas between draws');
ctx.applyViewport();assert.equal(bufferChanges,1,'Repeated viewport changes coalesce into one buffer update');
assert.equal(ctx.camera.fov,76,'Viewport changes preserve the current cinematic lens');
ctx.resize();ctx.applyViewport();assert.equal(bufferChanges,1,'Unchanged dimensions never reallocate the canvas');
ctx.stage.clientHeight=800;ctx.resize();ctx.stage.clientHeight=790;ctx.resize();ctx.applyViewport();assert.equal(bufferChanges,2);assert.equal(ctx.viewportHeight,790);
assert(html.indexOf('applyViewport();',html.indexOf('function frame('))<html.indexOf('renderer.render(scene,camera);lastVisualProgress=p'),'Pending resize is applied in the render callback');
console.log('PASS: frame-bound viewport resizing, coalesced browser-chrome changes, unchanged-buffer protection and lens preservation.');
