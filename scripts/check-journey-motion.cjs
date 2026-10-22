const fs=require('fs'),vm=require('vm'),assert=require('assert');
const sandbox={window:{}};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist/assets/journey-motion.js'),'utf8'),sandbox);
const create=sandbox.window.createJourneyMotion;
function run(hz){
 const motion=create();let p=.65,previousVelocity=0,maxAcceleration=0;
 for(let i=0;i<hz*3;i++){
  const next=motion.advance(p,.73,1/hz),velocity=(next-p)*hz;
  assert(next>=p&&next<=.73,'Forward travel must not bounce or overshoot a destination');
  assert(velocity<=.044001,'Keep the readable jungle speed limit');
  maxAcceleration=Math.max(maxAcceleration,Math.abs(velocity-previousVelocity)*hz);
  previousVelocity=velocity;p=next;
 }
 assert(maxAcceleration<.25,'Camera acceleration must stay bounded');
 assert(p>.729,'The camera must settle promptly');return p;
}
const positions=[30,60,90,120].map(run);
assert(Math.max(...positions)-Math.min(...positions)<.0001,'Motion must agree across refresh rates');
let motion=create(),p=.65;
for(let i=0;i<30;i++)p=motion.advance(p,.8,1/60);
const before=p,after=motion.advance(p,.8,.8);
assert(after-before<=.044*.05+.000001,'A stalled frame must not jump forward');
for(let i=0;i<180;i++)p=motion.advance(p,.62,1/60);
assert(Math.abs(p-.62)<.00001,'Reversal must settle without oscillation');
motion.reset();assert.equal(motion.advance(p,p,1/60),p,'Pause must stop all residual motion');
assert.equal(motion.advance(p,.9,1/60,true),.9,'Reduced motion must bypass easing');
console.log('PASS: bounded acceleration; no overshoot; 30/60/90/120Hz consistency; stall protection; reversal; pause; reduced motion.');
