const assert=require('assert'),fs=require('fs'),vm=require('vm');
const {createJourneyGuide}=require('../dist/assets/journey-guide.js');
const stops=[.625,.723,.785,.846];
const make=(options={})=>createJourneyGuide({stops:()=>stops,...options});
const run=(g,seconds=12,opts={})=>{for(let i=0;i<seconds*60;i++)g.tick(1/60,opts);return g.state();};
let g=make();assert.equal(g.state().mode,'intro');run(g);assert.equal(g.state().index,0);assert.equal(g.state().progress,stops[0]);
run(g,120);assert.equal(g.state().index,0,'Content must never auto-advance');
for(let i=1;i<=4;i++){
 assert(g.advance(1));assert(!g.advance(1),'Repeated taps cannot queue another transition');
 const before=g.state().progress;g.tick(1/60);assert(g.state().progress>before&&g.state().progress<g.state().target,'Next must animate the environment');
 run(g,4);assert.equal(g.state().index,i);assert.equal(g.state().mode,'idle');run(g,10);assert.equal(g.state().index,i);
}
assert(!g.advance(1));assert(g.advance(-1));run(g,4);assert.equal(g.state().index,3);
g=make();run(g,20,{sceneReady:false});assert(g.state().progress<=.26);g.skip();assert.equal(g.state().skipPending,true);g.tick(1/60,{sceneReady:false});assert(g.state().progress<=.26);g.tick(1/60,{sceneReady:true});assert.equal(g.state().index,0);
g=make();g.tick(1/60);g.skip();assert.equal(g.state().index,0,'Warm skip is immediate');
g=make();run(g,3);const paused=g.state().progress;run(g,20,{introPlaying:false});assert.equal(g.state().progress,paused);run(g,12);assert.equal(g.state().index,0);
g=make({reducedMotion:true});g.tick(0);assert.equal(g.state().progress,0,'Reduced motion must first show the still entrance');
run(g,.6);assert.equal(g.state().progress,0);run(g,1.1);assert.equal(g.state().index,0);
g.advance();g.tick(0);assert.equal(g.state().progress,stops[0],'Reduced-motion travel must dissolve instead of blink');
run(g,.25);assert(g.state().motionVeil>0);assert.equal(g.state().progress,stops[0]);run(g,1);assert.equal(g.state().progress,stops[1]);assert.equal(g.state().motionVeil,0);
g=make({initialProgress:.78});g.tick(0);assert.equal(g.state().index,2);run(g,30);assert.equal(g.state().index,2,'Returning visitors must not restart intro');
const points=[];for(const hz of [30,60,120]){g=make();for(let i=0;i<hz*5;i++)g.tick(1/hz);points.push(g.state().progress);}assert(Math.max(...points)-Math.min(...points)<.00001);
// Exercise the real browser gesture handlers with the same controller as Next.
const html=require('./read-journey-source.cjs')();
const handlers=html.slice(html.indexOf('    // The complete viewport owns travel gestures.'),html.indexOf('    function skipIntro()'));
function harness(){
 const guide=make({initialProgress:stops[0]});guide.tick(0);const events={},keys={};let now=1000,opened=0;
 const root={dataset:{},addEventListener:(n,f)=>events[n]=f,setPointerCapture(){},hasPointerCapture(){return false;},releasePointerCapture(){}};
 const ctx={root,guide,stage:{clientHeight:844,addEventListener:(n,f)=>keys[n]=f},performance:{now:()=>now},dragY:null,requestDestination(direction){if(guide.state().index===4&&direction>0){opened++;return true;}return guide.advance(direction);},window:{addEventListener(){}}};
 vm.createContext(ctx);vm.runInContext(handlers,ctx);
 const event=(data={})=>({target:{closest:()=>null},clientY:700,clientX:180,pointerId:1,button:0,isPrimary:true,deltaY:80,deltaMode:0,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...data});
 return{guide,events,keys,event,root,advanceClock:n=>now+=n,get opened(){return opened;}};
}
let h=harness();h.events.wheel(h.event());assert.equal(h.guide.state().index,1);h.events.wheel(h.event());assert.equal(h.guide.state().index,1);run(h.guide,4);h.advanceClock(50);h.events.wheel(h.event());assert.equal(h.guide.state().index,1,'Trackpad inertia must not advance twice');h.advanceClock(300);h.events.wheel(h.event());assert.equal(h.guide.state().index,2);
h=harness();h.events.pointerdown(h.event());h.events.pointermove(h.event({clientY:695}));assert.equal(h.guide.state().index,0);h.events.pointermove(h.event({clientY:640,clientX:80}));assert.equal(h.guide.state().index,0);h.events.pointermove(h.event({clientY:640}));assert.equal(h.guide.state().index,1);h.events.pointermove(h.event({clientY:300}));assert.equal(h.guide.state().index,1);h.events.pointerup(h.event());run(h.guide,4);h.events.pointerdown(h.event());h.events.pointermove(h.event({clientY:760}));assert.equal(h.guide.state().index,0,'Swipe down must return one destination');
h=harness();h.keys.keydown(h.event({key:'PageDown'}));assert.equal(h.guide.state().index,1);h.keys.keydown(h.event({key:'PageDown',repeat:true}));assert.equal(h.guide.state().index,1);
h=harness();h.root.dataset.menuOpen='true';h.events.wheel(h.event());h.events.pointerdown(h.event());h.events.pointermove(h.event({clientY:200}));assert.equal(h.guide.state().index,0);h.root.dataset.menuOpen='false';h.root.dataset.visitOpen='true';h.keys.keydown(h.event({key:'PageDown'}));assert.equal(h.guide.state().index,0);
console.log('PASS: automatic intro, readiness gate, skip, effects pause, no timed content advance, animated Next, transition lock, reverse, reduced motion, resume, refresh rates, shared swipe/scroll/keyboard transitions, inertia rejection, and overlay isolation.');

g=make();run(g,9.3);assert.equal(g.state().index,0,'The faster opening remains under ten seconds');
g.advance();run(g,1.55);assert.equal(g.state().mode,'transition','Destination travel must keep its original pace');run(g,1);assert.equal(g.state().index,1);
g=make();g.tick(90);assert(g.state().progress<.001,'A loading stall must not fast-forward the opening');
assert(html.includes("document.addEventListener('DOMContentLoaded'"),'Construction waits until dependency parsing completes');
assert([...html.matchAll(/<script src=[^>]+>/g)].every(m=>m[0].includes('defer')),'Dependencies must not block the loading UI parser');
assert(html.includes('[data-first-frame="true"] .loading-portal'),'Loading cover remains until the first actual render');
console.log('PASS: faster intro independent of original destination pace, calm reduced-motion dissolves, stall protection and visible loading handoff.');
