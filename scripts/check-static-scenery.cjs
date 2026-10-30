const assert=require('node:assert/strict'),T=require('../dist/assets/three.min.js');
const {batchStaticScenery}=require('../dist/assets/static-scenery.js');
const parent=new T.Group(),material=new T.MeshStandardMaterial(),geometry=new T.BoxGeometry(1,2,3);
function add(x,z,group=parent){const m=new T.Mesh(geometry,material);m.position.set(x,1,z);m.receiveShadow=true;group.add(m);return m;}
const nested=new T.Group();nested.position.set(3,0,-2);nested.rotation.y=.3;parent.add(nested);
add(1,-1);add(2,0,nested);add(1,-20);
const animated=new T.Group();parent.add(animated);const live=add(3,0,animated);
const transparent=new T.Mesh(geometry,new T.MeshBasicMaterial({transparent:true}));parent.add(transparent);
const instance=new T.InstancedMesh(geometry,material,2);parent.add(instance);
parent.updateWorldMatrix(true,true);const original=[];parent.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&!o.material.transparent&&o!==live){const g=o.geometry.clone().applyMatrix4(o.matrixWorld);for(let i=0;i<g.attributes.position.count;i++)original.push(new T.Vector3().fromBufferAttribute(g.attributes.position,i).toArray().map(n=>n.toFixed(4)).join(','));}});
const work=batchStaticScenery(T,parent,new Set([animated]));let result;do{result=work.next();}while(!result.done);
assert.equal(result.value.before,2);assert.equal(result.value.after,1);assert.equal(live.parent,animated);assert.equal(transparent.parent,parent);assert.equal(instance.parent,parent);
const actual=[];parent.updateWorldMatrix(true,true);parent.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&!o.material.transparent&&o!==live){const g=o.geometry.clone().applyMatrix4(o.matrixWorld);for(let i=0;i<g.attributes.position.count;i++)actual.push(new T.Vector3().fromBufferAttribute(g.attributes.position,i).toArray().map(n=>n.toFixed(4)).join(','));}});
assert.deepEqual(actual.sort(),original.sort(),'Batching must preserve every vertex in world space');
const batch=parent.children.find(o=>o.name==='Batched static jungle');assert.equal(batch.material,material);assert(batch.receiveShadow);assert(batch.geometry.boundingSphere.radius>0);assert.equal(batch.geometry.index.count,geometry.index.count*2);
console.log('PASS: fewer scenery draws; identical world geometry/materials/shadows; spatial culling retained; animated, transparent and instanced scenery untouched.');

const vegetation=new T.Group(),many=new T.InstancedMesh(geometry,material,100);vegetation.add(many);
for(let i=0;i<100;i++){many.setMatrixAt(i,new T.Matrix4().makeTranslation(i%5,0,i<50?-4:-28));many.setColorAt(i,new T.Color(i<50?0xff0000:0x00ff00));}
const split=batchStaticScenery(T,vegetation);while(!split.next().done){}
assert.equal(vegetation.children.length,2);assert.equal(vegetation.children.reduce((n,m)=>n+m.count,0),100);
for(const cluster of vegetation.children){assert(cluster.geometry===geometry);assert(cluster.material===material);assert(cluster.geometry.boundingSphere||cluster.boundingSphere);assert(cluster.instanceColor);}
console.log('PASS: local foliage bounds preserve every instance and color while allowing independent frustum culling.');

// Some sculpted trunks encode their location in vertices, with a zero object origin.
const located=new T.Group();
for(const z of [-4,-5,-28,-29]){const g=geometry.clone().translate(0,0,z);located.add(new T.Mesh(g,material));}
const localBatch=batchStaticScenery(T,located);while(!localBatch.next().done){}
assert.equal(located.children.length,2,'Geometry-space locations must remain in separate spatial batches');
assert(located.children.every(m=>m.geometry.boundingBox.max.z-m.geometry.boundingBox.min.z<5));
console.log('PASS: world-coordinate trunk geometry groups by actual location, preserving local culling.');
