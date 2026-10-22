const assert=require('node:assert/strict');
const {createPortalEnergyTimeline}=require('../dist/assets/portal-energy.js');
const timeline=createPortalEnergyTimeline(),phases=new Set(),types=new Set(),heads=new Set(),surges=new Set();
let maxEvents=0,quietFrames=0,readyFrames=0,peakReaction=0;
for(let i=0;i<=36000;i++){
 const time=i/60,s=timeline.sample(time);
 assert(Number.isFinite(s.power)&&s.power>=0&&s.power<=1);
 assert(s.formation>=0&&s.formation<=1);
 assert(s.events.length<=3,'Discharges must remain bounded');
 assert.equal(new Set(s.events.map(e=>e.head)).size,s.events.length,'Each ribbon belongs to one discharge');
 maxEvents=Math.max(maxEvents,s.events.length);peakReaction=Math.max(peakReaction,s.reaction);phases.add(s.stage);
 for(const e of s.events){types.add(e.type);heads.add(e.head);assert(e.duration>=.16);if(e.type==='surge')surges.add(e.start);}
 if(time>8){readyFrames++;if(!s.events.length)quietFrames++;assert.equal(s.stage,'ready');assert.equal(s.instability,0);}
}
assert.deepEqual([...phases].sort(),['quiet','priming','charging','unstable','surge','stabilizing','ready'].sort());
assert.equal(surges.size,2);assert([...surges][1]-[...surges][0]>1.5,'Major surges need breathing room');
assert.equal(types.size,5);assert(heads.size>=7);assert(quietFrames/readyFrames>.35,'Stable state must include quiet space');assert(peakReaction<=1);
const a=JSON.stringify(timeline.sample(4.4));assert.equal(JSON.stringify(timeline.sample(4.4)),a,'Paused clocks freeze every envelope');
assert.equal(a,JSON.stringify(createPortalEnergyTimeline().sample(4.4)),'Seeking/skipping produces a deterministic state');
const reduced=createPortalEnergyTimeline({reducedMotion:true});
for(const t of [0,1,4.4,6,100]){const s=reduced.sample(t);assert.equal(s.stage,'ready');assert.equal(s.events.length,0);assert.equal(s.surge,0);assert.equal(s.reaction,0);assert.equal(s.instability,0);}
console.log(`PASS: all seven activation stages; two separated surges; five arc types; at most ${maxEvents} simultaneous discharges; ${(100*quietFrames/readyFrames).toFixed(0)}% quiet time after stabilization; pause, seek, and reduced motion.`);
