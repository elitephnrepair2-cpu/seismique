/* A fixed shader-light budget; logical sources retain their original animation. */
(function(scope){
  function createJungleLightBudget(T,scene,{compact=false}={}){
    const sources=[],slots=compact?Array.from({length:4},()=>{
      const light=new T.PointLight(0xffffff,0,1,2);scene.add(light);return {light,source:null};
    }):[];
    function create(color,intensity,distance,priority=1){
      const light=new T.PointLight(color,intensity,distance,2);light.userData.budgetPriority=priority;sources.push(light);
      if(!compact)scene.add(light);return light;
    }
    function sync(camera,seconds,{enabled=true,snap=false}={}){
      if(!compact)return;
      const dt=Math.max(0,Math.min(.1,seconds));
      if(!enabled){for(const slot of slots){slot.light.intensity=0;slot.source=null;}return;}
      const ranked=sources.filter(source=>source.intensity>.005).map(source=>{
        const distance=source.position.distanceTo(camera.position),behind=source.position.z>camera.position.z+4;
        const retained=slots.some(slot=>slot.source===source)?1.2:1;
        return {source,score:distance>source.distance+18?0:source.intensity/(4+distance*distance)*(behind?.2:1)*retained};
      }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score);
      // Preserve the active destination's small spill as well as the broad washes.
      const accent=ranked.find(item=>item.source.userData.budgetPriority>=4);
      const selected=accent?[accent.source]:[];
      for(const item of ranked)if(selected.length<slots.length&&!selected.includes(item.source))selected.push(item.source);
      for(const slot of slots){
        if(slot.source&&!selected.includes(slot.source)){
          slot.light.intensity=snap?0:T.MathUtils.damp(slot.light.intensity,0,60,dt);
          if(slot.light.intensity<.03)slot.source=null;else continue;
        }
        if(!slot.source){
          slot.source=selected.find(source=>!slots.some(other=>other.source===source))||null;
          slot.light.intensity=0;
        }
        const source=slot.source;if(!source)continue;
        slot.light.position.copy(source.position);slot.light.color.copy(source.color);slot.light.distance=source.distance;slot.light.decay=source.decay;
        slot.light.intensity=snap?source.intensity:T.MathUtils.damp(slot.light.intensity,source.intensity,14,dt);
      }
    }
    function capture(){return slots.map(slot=>({source:slot.source,position:slot.light.position.clone(),color:slot.light.color.clone(),intensity:slot.light.intensity,distance:slot.light.distance,decay:slot.light.decay}));}
    function restore(snapshot){snapshot.forEach((saved,i)=>{const slot=slots[i];slot.source=saved.source;slot.light.position.copy(saved.position);slot.light.color.copy(saved.color);slot.light.intensity=saved.intensity;slot.light.distance=saved.distance;slot.light.decay=saved.decay;});}
    return {create,sync,capture,restore,physicalCount:compact?4:11};
  }
  scope.createJungleLightBudget=createJungleLightBudget;
  if(typeof module!=='undefined')module.exports={createJungleLightBudget};
})(typeof window!=='undefined'?window:globalThis);
