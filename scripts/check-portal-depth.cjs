const assert=require('node:assert/strict'),vm=require('node:vm');
const T=require('../dist/assets/three.min.js');
const {createPortalEnergyTimeline}=require('../dist/assets/portal-energy.js');
const source=require('./read-journey-source.cjs')();
const helpers=source.slice(source.indexOf('    function electricHash('),source.indexOf('    function vortexRadius('));
const discharge=source.slice(source.indexOf('      // Only active discharges'),source.indexOf('      // All room reactions'));
function fixture(compact,arcs){
  const ctx={T,scene:new T.Scene(),energyTime:0,apertureY:4.8,fieldRadius:3.445,fieldZ:-.65,fieldBend:.24,capTip:new T.Vector3(0,0,.057),quality:{compact,arcs},hue:.58,lightPower:1,branchEnd:new T.Vector3(),strikePosition:new T.Vector3(),fieldUniforms:{uHits:{value:Array.from({length:compact?2:3},()=>new T.Vector4())}}};
  vm.createContext(ctx);vm.runInContext(helpers,ctx);
  ctx.activeHeads=Array.from({length:9},(_,i)=>{
    const a=i*Math.PI*2/9,cap=new T.Object3D();cap.position.set(Math.cos(a)*3.6,4.8+Math.sin(a)*3.6,.1);cap.updateMatrixWorld();
    return {a,cap,start:new T.Vector3(),end:new T.Vector3(),power:0,tipMat:new T.MeshBasicMaterial(),flare:new T.Sprite(new T.SpriteMaterial()),impact:new T.Sprite(new T.SpriteMaterial()),arc:ctx.makeElectricalArc(25,.18),branches:[ctx.makeElectricalArc(11,.105),ctx.makeElectricalArc(9,.08)]};
  });
  return ctx;
}
let openRimFrames=0;
for(const compact of [false,true])for(const budget of [1,2]){
  const ctx=fixture(compact,budget),timeline=createPortalEnergyTimeline();
  function render(p,time,reduced=false){
    ctx.energyTime=time;ctx.opening=Math.sqrt(T.MathUtils.smoothstep(p,.015,.17));
    ctx.visibility=1-T.MathUtils.smoothstep(p,.315,.35);ctx.beamVisibility=1-T.MathUtils.smoothstep(ctx.opening,.08,.55);
    ctx.retract=T.MathUtils.smoothstep(ctx.opening,0,.60);ctx.clearRadius=Math.min(3.28,ctx.opening*ctx.fieldRadius*1.035+.025);
    ctx.energy=(reduced?createPortalEnergyTimeline({reducedMotion:true}):timeline).sample(time);
    vm.runInContext('{'+discharge+'}',ctx);
    return ctx.activeHeads.filter(h=>h.arc.object.visible);
  }
  for(const p of [0,.025,.055,.10,.17,.25,.32,.35])for(let frame=0;frame<600;frame++){
    const active=render(p,frame/30);
    assert(active.length<=budget,'Adaptive discharge budget must remain enforced');
    for(const head of active){
      assert(head.arc.points.every(v=>v.toArray().every(Number.isFinite)),'Arc vertices remain finite');
      if(ctx.opening>.28){
        assert(head.branches.every(b=>!b.object.visible),'Opening arcs do not branch across the doorway');
        assert(head.arc.points.every(v=>Math.hypot(v.x,v.y-ctx.apertureY)>3.34),'Opening arcs stay outside the clear passage');
        if(p>=.17&&p<=.25)openRimFrames++;
      }
    }
    if(p>=.35)assert.equal(active.length,0,'Electricity ends before the camera crosses the hardware');
  }
  render(.2,8.5);const before=ctx.activeHeads.map(h=>h.arc.points.map(p=>p.toArray()));
  render(.2,8.5);assert.deepEqual(ctx.activeHeads.map(h=>h.arc.points.map(p=>p.toArray())),before,'Frozen effects clocks freeze every arc vertex');
  assert.equal(render(.2,8.5,true).length,0,'Reduced motion has no electrical discharges');
}
assert(openRimFrames>0,'Electricity stays visible around a fully open portal');
console.log('PASS: open-rim electricity at both detail levels; adaptive arc caps; clear doorway; no crossing bolts; frozen clocks; reduced motion.');
