const fs=require('fs'),vm=require('vm'),assert=require('assert');
const T=require('../dist/assets/three.min.js');
const html=fs.readFileSync(require('path').join(__dirname,'../dist/index.html'),'utf8');
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
