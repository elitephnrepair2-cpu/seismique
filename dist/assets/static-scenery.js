/* Combine nearby, opaque, stationary scenery without changing materials or depth. */
(function(scope){
  function* batchStaticScenery(T,parent,excluded=new Set()){
    parent.updateWorldMatrix(true,true);
    const inverse=parent.matrixWorld.clone().invert(),groups=new Map(),instances=[];
    function visit(node){
      if(excluded.has(node)||(node!==parent&&!node.visible))return;
      const g=node.geometry,m=node.material;
      if(node.isInstancedMesh&&node.count>=64&&!node.morphTexture)instances.push(node);
      if(node.isMesh&&node.children.length===0&&!node.isInstancedMesh&&!node.isSkinnedMesh&&m&&!Array.isArray(m)&&!m.transparent&&g?.attributes.position&&g.drawRange.start===0&&g.drawRange.count===Infinity&&!Object.keys(g.morphAttributes).length){
        const names=Object.keys(g.attributes).sort();
        if(names.every(n=>!g.attributes[n].isInterleavedBufferAttribute)){
          const relative=inverse.clone().multiply(node.matrixWorld);
          // Reflections require a winding correction; retain these uncommon meshes.
          if(relative.determinant()>0){
            if(!g.boundingBox)g.computeBoundingBox();
            const z=g.boundingBox.getCenter(new T.Vector3()).applyMatrix4(relative).z;
            const key=[m.uuid,Math.floor(z/8),node.castShadow,node.receiveShadow,node.renderOrder,node.frustumCulled,names.map(n=>n+g.attributes[n].itemSize+g.attributes[n].normalized+g.attributes[n].array.constructor.name).join(':')].join('/');
            if(!groups.has(key))groups.set(key,[]);
            groups.get(key).push({node,relative});
          }
        }
      }
      node.children.forEach(visit);
    }
    visit(parent);
    // Split whole-jungle instance buffers into local clusters. Frustum culling
    // can then reject plants behind the visitor instead of drawing every plant.
    for(const node of instances){
      const cells=new Map(),matrix=new T.Matrix4(),relative=inverse.clone().multiply(node.matrixWorld);
      for(let i=0;i<node.count;i++){
        node.getMatrixAt(i,matrix);matrix.premultiply(relative);
        const z=new T.Vector3().setFromMatrixPosition(matrix).z,key=Math.floor(z/8);
        if(!cells.has(key))cells.set(key,[]);cells.get(key).push({matrix:matrix.clone(),index:i});
      }
      if(cells.size<2)continue;
      for(const cell of cells.values()){
        const cluster=new T.InstancedMesh(node.geometry,node.material,cell.length);
        cluster.name='Local foliage cluster';cluster.castShadow=node.castShadow;cluster.receiveShadow=node.receiveShadow;cluster.renderOrder=node.renderOrder;
        cell.forEach(({matrix,index},i)=>{cluster.setMatrixAt(i,matrix);if(node.instanceColor){const color=new T.Color();node.getColorAt(index,color);cluster.setColorAt(i,color);}});
        cluster.computeBoundingSphere();parent.add(cluster);yield;
      }
      node.removeFromParent();
    }
    let before=0,after=0;
    for(const list of groups.values()){
      if(list.length<2)continue;
      // Bound allocations and idle work per chunk on phones.
      let chunk=[],vertices=0;
      function combine(){
        if(chunk.length<2)return;
        const first=chunk[0].node,names=Object.keys(first.geometry.attributes),copies=chunk.map(({node,relative})=>node.geometry.clone().applyMatrix4(relative));
        const merged=new T.BufferGeometry();
        for(const name of names){
          const sample=copies[0].attributes[name],array=new sample.array.constructor(copies.reduce((sum,g)=>sum+g.attributes[name].array.length,0));
          let offset=0;for(const g of copies){array.set(g.attributes[name].array,offset);offset+=g.attributes[name].array.length;}
          merged.setAttribute(name,new T.BufferAttribute(array,sample.itemSize,sample.normalized));
        }
        const indices=new Uint32Array(copies.reduce((sum,g)=>sum+(g.index?.count||g.attributes.position.count),0));
        let cursor=0,base=0;
        for(const g of copies){const count=g.index?.count||g.attributes.position.count;for(let i=0;i<count;i++)indices[cursor++]=base+(g.index?g.index.getX(i):i);base+=g.attributes.position.count;}
        merged.setIndex(new T.BufferAttribute(indices,1));merged.computeBoundingBox();merged.computeBoundingSphere();
        const mesh=new T.Mesh(merged,first.material);mesh.name='Batched static jungle';mesh.castShadow=first.castShadow;mesh.receiveShadow=first.receiveShadow;mesh.renderOrder=first.renderOrder;mesh.frustumCulled=first.frustumCulled;parent.add(mesh);
        for(const {node} of chunk)node.removeFromParent();copies.forEach(g=>g.dispose());before+=chunk.length;after++;
      }
      for(const item of list){
        const count=item.node.geometry.attributes.position.count;
        if(vertices+count>24000&&chunk.length){combine();yield;chunk=[];vertices=0;}
        chunk.push(item);vertices+=count;
      }
      combine();yield;
    }
    return {before,after};
  }
  scope.batchStaticScenery=batchStaticScenery;
  if(typeof module!=='undefined')module.exports={batchStaticScenery};
})(typeof window!=='undefined'?window:globalThis);
