/* Original wall-bound ink murals, composed from the supplied Seismique lobby references. */
(function () {
  'use strict';
  window.createEntranceMural = function ({THREE:T, scene, wallMaterials, apertureY, reducedMotion}) {
    const group = new T.Group();
    group.name = 'Entrance lobby illustrations';
    scene.add(group);
    const uniforms = {
      uMuralPower:{value:0},
      uMuralTime:{value:0},
      uMuralDischarge:{value:0},
      uMuralStrike:{value:new T.Vector3(0,apertureY,0)},
      uMuralCenter:{value:new T.Vector3(0,apertureY,.2)}
    };
    const loader = new T.TextureLoader();
    // The wall and its ink receive the same restrained reflection. Existing
    // physical lights still supply their normal diffuse/shadow response.
    function lightMaterial(material, lightMask) {
      const previous = material.onBeforeCompile;
      material.onBeforeCompile = function (shader, renderer) {
        previous.call(this, shader, renderer);
        Object.assign(shader.uniforms, uniforms);
        if(lightMask) shader.uniforms.uMuralMask={value:lightMask};
        shader.vertexShader = 'varying vec3 vMuralWorld;\n'+shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
          '#include <begin_vertex>\nvMuralWorld=(modelMatrix*vec4(position,1.)).xyz;');
        shader.fragmentShader = `
          varying vec3 vMuralWorld;
          uniform vec3 uMuralCenter;
          uniform float uMuralTime;
          uniform float uMuralPower,uMuralDischarge;
          uniform vec3 uMuralStrike;
          ${lightMask?'uniform sampler2D uMuralMask;':''}
        `+shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>',`
          #include <emissivemap_fragment>
          float muralDistance=distance(vMuralWorld,uMuralCenter);
          float muralSpill=exp(-muralDistance*.17)*uMuralPower;
          float muralSweep=.5+.5*sin(uMuralTime*.21+vMuralWorld.y*.20+vMuralWorld.x*.09);
          vec3 muralTint=mix(vec3(.11,.24,.42),vec3(.35,.055,.30),muralSweep);
          // Fade over distance, and retain black ink even under reflected light.
          float dischargeSpill=exp(-distance(vMuralWorld,uMuralStrike)*.19)*uMuralDischarge;
          totalEmissiveRadiance+=(muralTint*muralSpill+vec3(.12,.24,.39)*dischargeSpill)*(.04+diffuseColor.rgb*.42);
          ${lightMask?`
            vec3 muralMask=texture2D(uMuralMask,vMapUv).rgb;
            float eyeBreath=.60+.16*sin(uMuralTime*.49);
            float edgePass=pow(.5+.5*sin(uMuralTime*.23+1.4),6.);
            float lampBreath=.30+.20*pow(.5+.5*sin(uMuralTime*.67+2.1),4.);
            vec3 muralDetail=muralMask.g*vec3(.04,.34,.40)*eyeBreath
              +muralMask.r*vec3(.60,.10,.43)*edgePass*.38
              +muralMask.b*vec3(.29,.21,.70)*lampBreath;
            totalEmissiveRadiance+=muralDetail*uMuralPower+vec3(.14,.26,.42)*(muralMask.r+muralMask.g+muralMask.b)*dischargeSpill*.32;
          `:''}
        `);
      };
      material.customProgramCacheKey=()=>lightMask?'entrance-ink-reactive-v52':'entrance-wall-spill-v52';
    }
    wallMaterials.forEach(m=>lightMaterial(m));
    function mural(name,width,height,x,y,z,rotation,reactive=false) {
      const map=loader.load('/assets/entrance-'+name+'.svg?v=48');
      map.colorSpace=T.SRGBColorSpace;
      map.anisotropy=4;
      const material=new T.MeshStandardMaterial({
        color:0xfff7e7,map,emissive:0xfff7e7,emissiveMap:map,
        emissiveIntensity:.22,roughness:1,transparent:true,alphaTest:.025,
        depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1
      });
      const mask=reactive?loader.load('/assets/entrance-'+name+'-light.svg?v=48'):null;
      lightMaterial(material,mask);
      const plane=new T.Mesh(new T.PlaneGeometry(width,height),material);
      plane.name='Ink mural: '+name;
      plane.position.set(x,y,z);
      plane.rotation.y=rotation;
      plane.receiveShadow=true;
      group.add(plane);
    }
    // All artwork lies flush on the existing rear wall. Each side tells its
    // own story: robot observatory on the left, rocket expedition on the right.
    mural('left-field',13.2,16.5,-14.3,8.28,-.675,0,true);
    mural('right-field',13.2,16.5,14.3,8.28,-.675,0,true);
    mural('upper-panel',13.9,6.1,0,19.26,-.285,0);
    return {
      update(progress,time,power,discharge=0,strike) {
        group.visible=progress<.38;
        uniforms.uMuralPower.value=T.MathUtils.clamp(power,0,1)*(1-T.MathUtils.smoothstep(progress,.30,.38));
        uniforms.uMuralDischarge.value=reducedMotion?0:T.MathUtils.clamp(discharge,0,1)*(1-T.MathUtils.smoothstep(progress,.30,.38));
        if(strike)uniforms.uMuralStrike.value.copy(strike);
        // The caller supplies the existing pausable effects clock; no new loop.
        uniforms.uMuralTime.value=reducedMotion?0:time;
      }
    };
  };
})();
