const fs=require('fs'),vm=require('vm'),assert=require('assert');
const T=require('../dist/assets/three.min.js');
const html=require('./read-journey-source.cjs')();
const route=html.slice(html.indexOf('    const jungleStretch='),html.indexOf('    function sidePathOpening'));
const path=html.slice(html.indexOf('    const approachKeys='),html.indexOf('    // Pause wheel/touch'));
for(const [w,h] of [[320,568],[390,844],[430,932],[844,390],[1280,720]]){
 const ctx={T,window:{},camera:{aspect:w/h},arrivalCameraZ:14.8,arrivalEyeY:5.35,ease:t=>t*t*(3-2*t),lerp:(a,b,t)=>a+(b-a)*t};vm.createContext(ctx);vm.runInContext(route+path,ctx);
 const z=p=>ctx.pose(p).pos[2],d=.00001;
 const incoming=(z(.58)-z(.58-d))/d,outgoing=(z(.58+d)-z(.58))/d;
 assert(incoming<-30&&outgoing<-30,'Camera must carry forward speed through the portal exit, not ease to a stop');
 assert(Math.abs(incoming-outgoing)<.1,'The portal and jungle paths must join with matching speed');
 vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist/assets/journey-motion.js'),'utf8'),ctx);
 const motion=ctx.window.createJourneyMotion();let p=.48,previousZ=z(p),checked=0;
 for(let frame=0;frame<600&&p<.68;frame++){
  const next=motion.advance(p,.72,1/60),nextZ=z(next);
  assert(nextZ<previousZ,'Forward travel must remain monotonic');
  if(p>.55&&next<.61){assert((previousZ-nextZ)*60>.6,'No perceptible dead zone while exiting the portal');checked++;}
  p=next;previousZ=nextZ;
 }
 assert(checked>10&&p>=.68,'The crossing must complete on every screen shape');
}
console.log('PASS: continuous portal exit position and speed, no transition dead zone, and monotonic travel at five screen sizes.');
// Small acceleration discontinuities feel like nudges even when position/speed
// match. Check both sides of every approach knot, including the jungle join.
for(const aspect of [320/568,390/844,430/932,844/390,1280/720]){
 const ctx={T,camera:{aspect},arrivalCameraZ:14.8,arrivalEyeY:5.35,ease:t=>t*t*(3-2*t),lerp:(a,b,t)=>a+(b-a)*t};vm.createContext(ctx);vm.runInContext(route+path,ctx);
 const z=p=>ctx.pose(p).pos[2],h=1e-6;
 for(const knot of [.17,.26,.33,.4,.5,.58]){
  const left=(z(knot)-2*z(knot-h)+z(knot-2*h))/(h*h),right=(z(knot+2*h)-2*z(knot+h)+z(knot))/(h*h);
  assert(Math.abs(left-right)<3,`Acceleration must remain continuous at ${knot}: ${left} versus ${right}`);
 }
 let previous=z(0);for(let i=1;i<=5800;i++){const current=z(i/10000);assert(current<=previous+1e-10,'The softened launch must never drift backward');previous=current;}
 for(const channel of ['pos','look'])for(const knot of [.27,.41,.42,.58]){
  const y=p=>ctx.pose(p)[channel][1],left=(y(knot)-2*y(knot-h)+y(knot-2*h))/(h*h),right=(y(knot+2*h)-2*y(knot+h)+y(knot))/(h*h);
  assert(Math.abs(left-right)<1,'Height and pitch easing must not introduce acceleration nudges');
 }
 for(const [p,expected] of [[0,14.8],[.17,14],[.26,8.8],[.33,1.8],[.4,-3],[.5,-9.4],[.58,-15]])assert(Math.abs(z(p)-expected)<1e-9,'Camera landmarks stay in their original positions');
}
console.log('PASS: matching acceleration at all six approach joins; unchanged landmarks, monotonic launch and original jungle-entry speed.');
