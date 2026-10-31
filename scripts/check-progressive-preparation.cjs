const assert=require('node:assert/strict'),vm=require('node:vm'),T=require('../dist/assets/three.min.js');
const source=require('./read-journey-source.cjs')();
// A finished distant group cannot appear before its GPU preparation completes.
const parent=new T.Group(),group=new T.Group(),material=new T.MeshStandardMaterial();
const staticMesh=new T.Mesh(new T.BoxGeometry(),material),animated=new T.Group();group.add(staticMesh,animated);
let buildSteps=0,batches=0;
const ctx={distantSceneryJobs:[function*(){buildSteps++;yield;return group;}],window:{*batchStaticScenery(){batches++;yield;return {}; }},T,hangingPods:[{pivot:animated}],revealWorld:parent,revealTrees:18,root:{dataset:{}}};
vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('    function* prepareDistantScenery(){'),source.indexOf('    async function warmDistantGroup(')),ctx);
const job=ctx.prepareDistantScenery();assert.equal(job.next().done,false);assert.equal(parent.children.length,0);
assert.equal(job.next().done,false);assert.equal(parent.children.length,0);
const ready=job.next();assert.equal(ready.value.warm,group);assert.equal(parent.children.length,0,'Unuploaded geometry remains detached');
job.next();assert.equal(parent.children[0],group);assert.equal(staticMesh.matrixAutoUpdate,false);assert.equal(animated.matrixAutoUpdate,true,'Animated pods remain dynamic');assert.equal(ctx.root.dataset.preparedTrees,'18');assert.equal(job.next().done,true);assert.equal(buildSteps,1);assert.equal(batches,1);
// Isolated offscreen draws must never borrow or alter the visible lights/target.
async function warmTest(fail){
 const scene=new T.Scene();scene.fog=new T.Fog(0,20,49);const light=new T.PointLight(0xabcdef,7,12);light.position.set(2,3,4);scene.add(light);
 const tree=new T.Group(),mesh=new T.Mesh(new T.BoxGeometry(),material);tree.add(mesh);const camera=new T.PerspectiveCamera();let target='visible',disposed=0,draws=0;
 const warm={T:{...T,WebGLRenderTarget:class {dispose(){disposed++;}}},scene,camera,document:{hidden:false},root:{dataset:{}},window:{requestIdleCallback:true},requestIdleCallback:fn=>fn(),setTimeout,renderer:{async compileAsync(staging){assert.equal(staging.children.filter(n=>n.isPointLight).length,1);assert.notEqual(staging.children.find(n=>n.isPointLight),light);},getRenderTarget:()=>target,setRenderTarget(v){target=v;},render(staging){draws++;assert.equal(mesh.frustumCulled,false);assert.notEqual(staging,scene);if(fail)throw Error('upload failed');}}};
 vm.createContext(warm);vm.runInContext(source.slice(source.indexOf('    async function warmDistantGroup('),source.indexOf('    async function finishDistantPreparation(')),warm);
 if(fail)await assert.rejects(warm.warmDistantGroup(tree),/upload failed/);else await warm.warmDistantGroup(tree);
 assert.equal(draws,1);assert.equal(target,'visible');assert.equal(tree.parent,null);assert.equal(mesh.frustumCulled,true);assert.equal(disposed,1);assert.equal(light.intensity,7);assert.deepEqual(light.position.toArray(),[2,3,4]);
}
async function queueTest(){
 let resume,calls=0,finished=0;const jobs=[],warmGroup={};
 const work={preparationWaiting:false,preparationHandle:null,maxPrepSlice:0,profileFrames:false,document:{hidden:false},root:{dataset:{}},performance:{now:()=>0},revealReady:true,preparation:{next(){calls++;return calls===1?{value:{warm:warmGroup},done:false}:{done:true};}},window:{requestIdleCallback:true},requestIdleCallback(fn){jobs.push(fn);return jobs.length;},warmDistantGroup(group){assert.equal(group,warmGroup);return new Promise(resolve=>resume=resolve);},finishDistantPreparation(){finished++;},finishPreparation(){throw Error('Entrance must not restart');}};
 vm.createContext(work);vm.runInContext(source.slice(source.indexOf('    function queuePreparation(){'),source.indexOf('    function* prepareResources(){')),work);
 work.queuePreparation();jobs.shift()({timeRemaining:()=>10});assert.equal(calls,1);work.queuePreparation();assert.equal(jobs.length,0,'Overlay/visibility wake cannot create a duplicate build while an upload is pending');
 resume();await Promise.resolve();assert.equal(jobs.length,1);jobs.shift()({timeRemaining:()=>10});assert.equal(calls,2);assert.equal(finished,1);
}
(async()=>{await warmTest(false);await warmTest(true);await queueTest();console.log('PASS: distant scenery stays detached until complete/uploaded; one build; static freezing preserves animation; isolated warmup preserves visible lights, target, culling and resources on success/failure; pending GPU work cannot duplicate the preparation loop.');})().catch(e=>{console.error(e);process.exitCode=1;});
const requestSource=source.slice(source.indexOf('    function requestDestination('),source.indexOf('    function applyJourneyCamera('));
let advances=0;const navigation={pendingDestination:0,guideState:{mode:'idle'},root:{dataset:{distantPreparation:'building'},wakeJourney(){}},atJourneyEnd:()=>false,guide:{advance(){advances++;return true;},state(){return {mode:'transition',target:.7};}},updateLabels(){}};
vm.createContext(navigation);vm.runInContext(requestSource,navigation);assert.equal(navigation.requestDestination(1),true);assert.equal(advances,0,'Early Next queues the intent rather than entering unfinished scenery');assert.equal(navigation.pendingDestination,1);
navigation.root.dataset.distantPreparation='ready';navigation.requestDestination(1);assert.equal(advances,1);assert.equal(navigation.pendingDestination,0);
console.log('PASS: early Next is retained until distant scenery is ready, then enters the same animated transition.');
