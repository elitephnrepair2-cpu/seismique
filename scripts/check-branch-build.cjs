const assert=require('node:assert/strict'),vm=require('node:vm'),crypto=require('node:crypto'),T=require('../dist/assets/three.min.js');
const {createPreparationScheduler}=require('../dist/assets/journey-preparation.js');
const source=require('./read-journey-source.cjs')();
// Golden geometry captured from the published pre-optimization builder. Check
// trunk, root/bough and twig profiles on both detail levels, including normals.
const cases=[
 [true,1.16,'a6e81bfd0ec8c0d99c0b345ecc8df254a38fd6c7c84945ddf9c73aab0bef98af'],
 [true,.43,'6159b0d6348b5b8e2746136cbf8057c760e94be3a60d177a94ec4f3304b0d4b3'],
 [true,.13,'e37706e8ff54e5156bb0956008ec47ef2fe97c2ea3fa3d379de90941cd6965b6'],
 [false,1.16,'66f02b7711d8618762be2c76f44123a8b13f6dea735fe3b119691d13650d5f11'],
 [false,.43,'0c2b540724e2effc18c8356c7c346937188f05bed4777a4cdcf5fc676b7e3a47'],
 [false,.13,'f70356c8e2eee99e5dd724e7f29a1616654d3280a754a91cf85b5e4bfb327ef6']
];
for(const [compact,radius,expected] of cases){
 const parent=new T.Group(),material=new T.MeshStandardMaterial();material.userData.bark=true;
 const ctx={T,quality:{compact},revealWorld:parent,revealRandom:n=>{const v=Math.sin(n*127.13+53.7)*43758.5453;return v-Math.floor(v);},mesh(g,m,x,y,z,p){const node=new T.Mesh(g,m);p.add(node);return node;}};
 vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('    function* organicBranch('),source.indexOf('    // Seamless value noise')),ctx);
 const iterator=ctx.organicBranch([[-4.1,0,-11.5],[-4.2,2,-11.4],[-3.8,5,-11.7],[-3.2,7.3,-11.1]],radius,.035,material,56);let step,yields=0;
 do{step=iterator.next();if(!step.done){yields++;assert.equal(parent.children.length,0);}}while(!step.done);
 const hash=crypto.createHash('sha256');for(const key of ['position','normal','uv'])hash.update(Buffer.from(step.value.branch.geometry.attributes[key].array.buffer));
 assert.equal(hash.digest('hex'),expected,'Faster calculations must preserve sculpted shape, texture mapping and smooth normals');assert(yields>0,'Geometry construction remains cooperative');
}
let queued,cancelled=0,calls=0,requestedDelay;
const scheduler=createPreparationScheduler({idle:null,schedule(fn,delay){queued=fn;requestedDelay=delay;return 1;},cancel(){cancelled++;}});
scheduler.schedule(()=>calls++);assert.equal(requestedDelay,0,'Browsers without idle callbacks must not pay an extra 16 ms per slice');queued();assert.equal(calls,1);assert.equal(cancelled,1);queued();assert.equal(calls,1);
console.log('PASS: byte-identical trunk/root/twig geometry at both detail levels; cooperative yields; no artificial per-slice delay without idle callbacks; exactly-once fallback.');
