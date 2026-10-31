const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const T=require('../dist/assets/three.min.js');
const {createJourneyPerformance}=require('../dist/assets/journey-performance.js');
for(const dpr of [1,2,3]){const p=createJourneyPerformance({compact:true,pixelRatio:dpr});assert.equal(p.budget.ratio,Math.min(dpr,1.5));for(let i=0;i<2000;i++)p.sample(.04);assert(p.budget.ratio>=Math.min(dpr,1.25),'Mobile crispness cannot fall below the protected resolution floor');assert(p.budget.ratio<=dpr);}
const html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8'),scene=fs.readFileSync(path.join(__dirname,'../dist/assets/journey-scene.js'),'utf8');
assert(Buffer.byteLength(html)<30000,'The first document must stay small enough for a fast loading shell');
const version=html.match(/<script src="([^"]*journey-scene.js\?v=[^"]+)"/)[1];assert(html.includes('rel="preload" href="'+version+'"'));
assert(scene.includes('antialias:true'),'Crisp silhouettes require antialiasing');new vm.Script('"use strict";\n'+scene);
async function verifyBake(fail=false){
 const context={window:{requestIdleCallback:true},requestIdleCallback:fn=>fn(),setTimeout};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/assets/jungle-sky.js'),'utf8'),context);
 const world=new T.Scene(),sky=context.window.createJungleSky({THREE:T,scene:world,reducedMotion:false,pixelRatio:1.5}),group=world.children[0],dome=group.children[0],stars=group.children[1];
 const points=stars.geometry.attributes.position.count;let target='visible',draws=0;const targets=[];
 const renderer={getRenderTarget:()=>target,setRenderTarget(value){target=value;if(value!=='visible')targets.push(value);},render(){draws++;if(fail&&draws===2)throw Error('test failure');}};
 if(fail){await assert.rejects(sky.prepare(renderer),/test failure/);assert(dome.material.fragmentShader.includes('fbm'));}
 else{await sky.prepare(renderer);assert.equal(draws,2);await sky.prepare(renderer);assert.equal(draws,2,'Nebula is cached once, not redrawn every frame');assert(!dome.material.fragmentShader.includes('fbm'),'Live sky must use texture samples instead of procedural cloud noise');assert(dome.material.uniforms.uCanopy.value.isTexture);assert.equal(dome.material.uniforms.uCanopy.value.colorSpace,T.SRGBColorSpace);assert.equal(points,stars.geometry.attributes.position.count);sky.update(.9,2);assert.equal(group.visible,true);}
 assert.equal(target,'visible','Baking never leaves the visible renderer pointed at a texture');assert(targets.every(t=>t.width===1024&&t.height===512));
}
(async()=>{await verifyBake();await verifyBake(true);console.log('PASS: sharper protected mobile resolution; antialiasing; small cacheable first document; two one-time nebula bakes; live stars preserved; render state restored.');})().catch(e=>{console.error(e);process.exitCode=1;});
