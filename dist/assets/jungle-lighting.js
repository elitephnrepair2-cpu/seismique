/* Relight the existing jungle surfaces; no additional scenery or lights. */
window.createJungleLighting=({THREE:T,foliage,bark,path,sidePath,reducedMotion})=>{
  const uniforms={uJungleArrival:{value:0},uJungleRichness:{value:0},uLivingTime:{value:0}};
  function shade(material,kind){
    const previous=material.onBeforeCompile.bind(material),previousKey=material.customProgramCacheKey();
    material.onBeforeCompile=shader=>{
      previous(shader);Object.assign(shader.uniforms,uniforms);
      shader.vertexShader='varying vec3 vLivingWorld;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
        vec4 livingPosition=vec4(transformed,1.);
        #ifdef USE_INSTANCING
          livingPosition=instanceMatrix*livingPosition;
        #endif
        vLivingWorld=(modelMatrix*livingPosition).xyz;
      `);
      shader.fragmentShader='varying vec3 vLivingWorld;\nuniform float uJungleArrival,uJungleRichness,uLivingTime;\n'+shader.fragmentShader;
      const common=`
        float livingDepth=smoothstep(15.,51.,-vLivingWorld.z);
        float livingNear=1.-smoothstep(10.,33.,length(cameraPosition-vLivingWorld));
        float livingEnergy=uJungleArrival*(.48+.52*uJungleRichness)*(.72+.28*livingDepth);
        float livingDapple=smoothstep(.30,.86,.5+.5*sin(vLivingWorld.x*.83+sin(vLivingWorld.z*.37)+uLivingTime*.025)*sin(vLivingWorld.z*.62+vLivingWorld.y*.51));
        float livingRim=pow(1.-abs(dot(normal,normalize(vViewPosition))),3.2);
        vec3 livingTint=mix(vec3(.022,.31,.24),vec3(.24,.028,.26),smoothstep(-.4,.7,sin(vLivingWorld.z*.19)+vLivingWorld.x*.12));
      `;
      const treatment=kind==='leaf'?`
        // Translucent faces and grazing rims reveal only selected, nearby layers.
        float faceLight=.22+.78*livingDapple;
        totalEmissiveRadiance+=diffuseColor.rgb*faceLight*livingEnergy*(.10+.30*livingNear);
        totalEmissiveRadiance+=livingTint*livingRim*livingEnergy*(.04+.30*livingNear)*(.3+.7*livingDapple);
      `:kind==='bark'?`
        // Narrow grazing light follows the sculpted bark channels, leaving recesses dark.
        totalEmissiveRadiance+=livingTint*livingRim*livingDapple*livingEnergy*livingNear*.095;
      `:`
        // Broken pools of reflected canopy light leave the trail mostly in shadow.
        float trailEdge=smoothstep(.75,2.35,abs(vLivingWorld.x-.82*sin((-vLivingWorld.z-23.)*.29)));
        totalEmissiveRadiance+=mix(vec3(.002,.017,.022),livingTint*.065,trailEdge)*livingDapple*livingEnergy*livingNear;
      `;
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n'+common+treatment);
    };
    material.customProgramCacheKey=()=>previousKey+'-living-jungle-'+kind+'-44';
    material.needsUpdate=true;
  }
  shade(foliage,'leaf');bark.forEach(material=>shade(material,'bark'));shade(path,'path');shade(sidePath,'path');
  return{update(progress,time){
    uniforms.uJungleArrival.value=T.MathUtils.smoothstep(progress,.39,.60);
    uniforms.uJungleRichness.value=T.MathUtils.smoothstep(progress,.56,.94);
    uniforms.uLivingTime.value=reducedMotion?0:time;
  }};
};
