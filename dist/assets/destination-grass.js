/* Alien Grass-inspired jungle growth: frosted globes, bowed blue stems and woven leaves. */
window.createDestinationGrass=({THREE:T,parent,stops,root,groundAt,pathX,softMap,reducedMotion,light=null,compact:initialCompact=null})=>{
  const group=new T.Group();group.name='Alien Grass destination accents';parent.add(group);
  const palettes={
    exhibits:[0x4bc7e5,0xa16cde,0x587de8],
    'mini-golf':[0x90d966,0xd96ebf,0x55cdd2],
    parties:[0xe67bb6,0xad78d6,0xe6a282,0x75c0bc],
    'whats-happening':[0x99bbdf,0xb9a2d9,0xc3d6da],
    'plan-your-visit':[0x95d3d7,0xb6addb,0xe0e6e2]
  };
  const stemMaterial=new T.MeshStandardMaterial({color:0x244771,metalness:.38,roughness:.47,transparent:true,opacity:.24,depthWrite:false});
  const collarMaterial=new T.MeshStandardMaterial({color:0x202536,metalness:.62,roughness:.36,transparent:true});
  const leafMaterial=new T.MeshStandardMaterial({color:0x204536,roughness:.85,side:T.DoubleSide,transparent:true});
  const bulbGeometry=new T.SphereGeometry(1,20,14),collarGeometry=new T.CylinderGeometry(.047,.052,.085,8);
  const leafShape=new T.Shape();leafShape.moveTo(0,0);leafShape.bezierCurveTo(-.16,.14,-.2,.5,0,.75);leafShape.bezierCurveTo(.19,.48,.14,.13,0,0);const leafGeometry=new T.ShapeGeometry(leafShape,5);
  const dormant=new T.Color(0x172333),milk=new T.Color(0xe8e5ec),temp=new T.Color();
  // Loose clumps vary in depth and height; the recognizable globes belong to the jungle here.
  const layout=[[-.65,-1.02,3.10,.23],[-.10,-1.90,4.12,.25],[.62,-1.50,3.65,.22],[1.35,-.85,2.14,.24]];
  const mobileLayout=[[-.62,-3.0,3.35],[-.20,-3.5,4.28],[.12,-3.1,3.69],[.56,-3.8,3.55]];
  function frostedMaterial(){
    const material=new T.MeshStandardMaterial({color:dormant,emissive:0x000000,emissiveIntensity:1,roughness:.72,metalness:.015,transparent:true,opacity:.18,depthWrite:false});
    const glow={companion:{value:new T.Color()},phase:{value:0}};
    material.userData.glow=glow;
    material.onBeforeCompile=shader=>{
      shader.uniforms.grassCompanion=glow.companion;shader.uniforms.grassPhase=glow.phase;
      shader.vertexShader='varying vec3 vGrassLocal;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGrassLocal=normalize(position);');
      shader.fragmentShader='varying vec3 vGrassLocal;\nuniform vec3 grassCompanion;\nuniform float grassPhase;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
        float frostFlow=vGrassLocal.y*.76+vGrassLocal.x*.34+sin(vGrassLocal.z*2.1+grassPhase)*.16;
        float colorVeil=smoothstep(-.78,.82,frostFlow);
        totalEmissiveRadiance=mix(totalEmissiveRadiance,grassCompanion,colorVeil*.62);
      `);
    };
    material.customProgramCacheKey=()=> 'jungle-frosted-globe-v1';
    return material;
  }
  const clusters=stops.map((stop,index)=>{
    const node=new T.Group();node.name='Alien Grass — '+stop.id;group.add(node);
    const anchor=stop.curve.getPointAt(.28),button=root.querySelector('[data-jungle-page="'+stop.id+'"]');
    const colors=(palettes[stop.id]||palettes['plan-your-visit']).map(c=>new T.Color(c));
    const activeStem=stemMaterial.clone();
    const cluster={id:stop.id,node,anchor,button,colors,side:stop.side,level:0,age:0,wasActive:false,hover:false,focus:false,wasFocused:false,bulbs:[],lightColor:new T.Color(),stemMaterial:activeStem,index};
    button.addEventListener('pointerenter',()=>cluster.hover=true);button.addEventListener('pointerleave',()=>cluster.hover=false);
    button.addEventListener('focus',()=>cluster.focus=true);button.addEventListener('blur',()=>cluster.focus=false);
    for(let i=0;i<layout.length;i++){
      const [offset,dz,top,radius]=layout[i],x=anchor.x+stop.side*offset,z=anchor.z+dz,base=groundAt(x,z),height=Math.max(.92,top-base);
      const stem=new T.Mesh(new T.BufferGeometry(),activeStem);node.add(stem);
      const collar=new T.Mesh(collarGeometry,collarMaterial);collar.position.set(x,base+height-.05,z);node.add(collar);
      const material=frostedMaterial();
      const bulb=new T.Mesh(bulbGeometry,material);bulb.scale.set(radius,radius*1.035,radius);bulb.position.set(x,base+height+radius*.77,z);node.add(bulb);
      const halo=new T.Sprite(new T.SpriteMaterial({map:softMap,color:0xffffff,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending}));halo.position.copy(bulb.position);halo.scale.setScalar(radius*3.45);node.add(halo);
      const contact=new T.Mesh(new T.CircleGeometry(.13,12),new T.MeshBasicMaterial({color:0x111b17,transparent:true,opacity:.72,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.set(x,base+.006,z);node.add(contact);
      const sprouts=[];for(let leaf=0;leaf<2;leaf++){
        const sprout=new T.Mesh(leafGeometry,leafMaterial);sprout.position.set(x,base+.01,z);sprout.rotation.set(.30,(i+leaf)*2.4,leaf?-.63:.61);sprout.scale.setScalar(.70+(i%3)*.14);node.add(sprout);sprouts.push(sprout);
      }
      const climbingLeaves=[];
      for(let j=0;j<2;j++){
        const leaf=new T.Mesh(leafGeometry,leafMaterial);leaf.scale.setScalar(j?.88:.70);node.add(leaf);climbingLeaves.push(leaf);
      }
      // Two globes peek through attached leaves; keep most silhouettes open and readable.
      const veilLeaf=(i===2||i===4)?new T.Mesh(leafGeometry,leafMaterial):null;
      if(veilLeaf)node.add(veilLeaf);
      cluster.bulbs.push({material,halo,bulb,stem,collar,contact,sprouts,climbingLeaves,veilLeaf,radius,level:0,index:i});
    }
    const pool=new T.Mesh(new T.PlaneGeometry(2.6,1.7),new T.MeshBasicMaterial({map:softMap,color:colors[0],transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending}));pool.rotation.x=-Math.PI/2;pool.position.set(anchor.x+stop.side*.7,groundAt(anchor.x+stop.side*.7,anchor.z-.45)+.02,anchor.z-.45);node.add(pool);cluster.pool=pool;
    return cluster;
  });
  // One shared local spill follows the active cluster.
  const spillLights=Array.from({length:1},()=>{const spill=light||new T.PointLight(0x9cb3d8,0,3.6,2);if(!light)parent.add(spill);return spill;});
  let compact=null;
  function arrange(isCompact){
    compact=isCompact;
    for(const c of clusters){
      for(const b of c.bulbs){
        const [offset,dz,top]=(compact?mobileLayout:layout)[b.index],z=c.anchor.z+dz;
        let x=c.anchor.x+c.side*offset;
        // Compact view uses the inner planting shoulder so the globes remain visible at path bends.
        const edge=pathX(z)+c.side*(compact?1.5+b.index%3*.09:2.32);
        x=compact?edge+c.side*(offset+.1)*.72:(c.side>0?Math.max(x,edge):Math.min(x,edge));
        const variation=.11*Math.sin(c.index*1.7+b.index*2.4),base=groundAt(x,z),height=Math.max(.92,top+variation+(compact?.25:0)-base),radius=b.radius*(compact?.83:1);
        const lean=(compact?.16:.30)*Math.sin(b.index*2.3+c.index*.7),bow=c.side*(compact?.24:.42)*(b.index%2?1:-.65);
        const stemPath=new T.CatmullRomCurve3([
          new T.Vector3(x,base,z),new T.Vector3(x+bow,base+height*.30,z-.12),
          new T.Vector3(x+lean-bow*.35,base+height*.72,z+.09),new T.Vector3(x+lean,base+height,z)
        ]);
        b.stem.geometry.dispose();b.stem.geometry=new T.TubeGeometry(stemPath,22,.033,7,false);
        const tip=stemPath.getPoint(1),tangent=stemPath.getTangent(1);
        b.collar.position.copy(tip).addScaledVector(tangent,-.035);b.collar.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),tangent);
        b.bulb.position.copy(tip).addScaledVector(tangent,radius*.77);b.bulb.scale.set(radius,radius*1.035,radius);
        b.halo.position.copy(b.bulb.position);b.halo.scale.setScalar(radius*3.45);b.contact.position.set(x,base+.006,z);
        b.sprouts.forEach(sprout=>sprout.position.set(x,base+.01,z));
        b.climbingLeaves.forEach((leaf,j)=>{leaf.position.copy(stemPath.getPoint(j?.50:.22));leaf.rotation.set(.20,c.side*.55+(j?-.35:.35),c.side*(j?-.70:.62));});
        if(b.veilLeaf){b.veilLeaf.position.copy(b.bulb.position).add(new T.Vector3(-c.side*.14,-radius*1.35,radius*.65));b.veilLeaf.rotation.set(.16,c.side*.22,-c.side*.58);b.veilLeaf.scale.set(.84,.77,1);}
      }
      const center=c.bulbs[2].contact.position;c.pool.position.set(center.x,groundAt(center.x,center.z)+.025,center.z);c.pool.scale.setScalar(compact?.75:1);
    }
  }
  arrange(initialCompact??(root.querySelector('.scene').clientWidth<700));
  let previousTime=null,motionTime=0,lastCssTime=-Infinity;
  return {resize(narrow){if(narrow!==compact)arrange(narrow);},update(progress,time,dt,running){
    const effectDelta=previousTime===null?0:Math.max(0,Math.min(.08,time-previousTime));previousTime=time;
    if(running&&!reducedMotion)motionTime+=effectDelta;
    const presence=1-T.MathUtils.smoothstep(progress,.965,.995);group.visible=progress>.40&&presence>.001;collarMaterial.transparent=true;collarMaterial.opacity=presence;leafMaterial.transparent=true;leafMaterial.opacity=presence;
    const refreshCss=motionTime-lastCssTime>.25||lastCssTime===-Infinity;
    if(refreshCss)lastCssTime=motionTime;
    for(const cluster of clusters){
      const active=!cluster.button.hidden&&progress<.985,changed=active!==cluster.wasActive;
      if(changed){cluster.age=0;cluster.wasActive=active;cluster.button.dataset.grassActive=String(active);}
      const animated=running&&!reducedMotion;
      cluster.age+=animated?dt:0;
      const focus=cluster.hover||cluster.focus,target=active?(focus?.78:.68):0,staticUpdate=reducedMotion||changed||focus!==cluster.wasFocused;cluster.wasFocused=focus;
      cluster.level=animated?T.MathUtils.damp(cluster.level,target,active?2.0:2.6,dt):(staticUpdate?target:cluster.level);
      cluster.node.visible=active||cluster.level>.012;
      if(!cluster.node.visible){
        cluster.level=0;
        if(changed)cluster.button.style.setProperty('--grass-power','0');
        continue;
      }
      let total=0;
      for(const bulb of cluster.bulbs){
        const wake=active?T.MathUtils.smoothstep(cluster.age-bulb.index*.085,0,.80):1;
        const targetLevel=animated?cluster.level*wake:target;
        bulb.level=animated?T.MathUtils.damp(bulb.level,targetLevel,3.2,dt):(staticUpdate?targetLevel:bulb.level);total+=bulb.level;
        const cycle=motionTime/18+bulb.index*.43+cluster.index*.19,a=Math.floor(cycle)%cluster.colors.length,b=(a+1)%cluster.colors.length,mix=T.MathUtils.smoothstep(cycle%1,0,1);
        temp.copy(cluster.colors[a]).lerp(cluster.colors[b],mix);
        // A tiny, slow breath never switches a lit globe off or blows it out to white.
        const breath=reducedMotion?1:.96+.04*Math.sin(motionTime*.72-bulb.index*.42);
        bulb.material.color.copy(dormant).lerp(milk,.26*bulb.level).lerp(temp,.62*bulb.level);
        bulb.material.emissive.copy(temp).multiplyScalar(bulb.level*.43*breath);bulb.material.opacity=(.08+.92*Math.min(1,bulb.level/.84))*presence;bulb.contact.material.opacity=.72*presence;
        const glow=bulb.material.userData.glow;
        glow.companion.value.copy(cluster.colors[b]).lerp(cluster.colors[(b+1)%cluster.colors.length],mix).multiplyScalar(bulb.level*.43*breath);
        glow.phase.value=motionTime*.13+bulb.index*.8;
        bulb.halo.visible=bulb.level>.008;bulb.halo.material.color.copy(temp);bulb.halo.material.opacity=bulb.level*.045*breath*presence;
        if(bulb.index===1)cluster.lightColor.copy(temp);
      }
      const power=total/cluster.bulbs.length;cluster.stemMaterial.emissive.copy(cluster.lightColor).multiplyScalar(power*.045);cluster.stemMaterial.opacity=(.24+.76*Math.min(1,power/.84))*presence;
      cluster.pool.material.color.copy(cluster.lightColor);cluster.pool.material.opacity=power*.055*presence;
      if(refreshCss||changed){
        cluster.button.style.setProperty('--grass-rgb',`${Math.round(cluster.lightColor.r*255)},${Math.round(cluster.lightColor.g*255)},${Math.round(cluster.lightColor.b*255)}`);
        cluster.button.style.setProperty('--grass-power',active?'1':'0');
      }
    }
    let brightest=clusters[0];for(const c of clusters)if(c.level>brightest.level)brightest=c;
    spillLights.forEach(light=>{const c=brightest;light.position.set(c.pool.position.x,1.6,c.pool.position.z);light.color.copy(c.lightColor);light.intensity=group.visible?c.level*c.level*1.05*presence:0;});
  }};
};
