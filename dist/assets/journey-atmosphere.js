/* Entrance-inspired atmosphere layered onto the existing portal and jungle. */
window.createJourneyAtmosphere=({THREE:T,scene,machine,revealWorld,apertureY,mouthZ,portalDepth,vortexRadius,softMap,reducedMotion,mapJungleZ=z=>z,light=null})=>{
  // The continuous energy surface owns the tunnel. Keep only the foliage
  // and distant mist here, so no reflective panels cover that surface.
  const edgeLayer=new T.Group();revealWorld.add(edgeLayer);
  const uniforms={uTime:{value:0},uJungle:{value:0},uRichness:{value:0}};
  const random=n=>{const v=Math.sin(n*93.17+11.8)*43758.54;return v-Math.floor(v);};
  // Early foliage is attached to the far rim, outside the clear central opening.
  const leafShape=new T.Shape();leafShape.moveTo(0,0);leafShape.bezierCurveTo(-.38,.32,-.32,.87,0,1.35);leafShape.bezierCurveTo(.33,.88,.40,.35,0,0);
  const leafGeometry=new T.ShapeGeometry(leafShape,5),leafMaterial=new T.MeshStandardMaterial({color:0x244c3c,emissive:0x0b3b31,emissiveIntensity:.26,roughness:.8,side:T.DoubleSide});
  const rimLeaves=new T.InstancedMesh(leafGeometry,leafMaterial,96),dummy=new T.Object3D();let leafCount=0;
  for(let cluster=0;cluster<16;cluster++){
    const side=cluster%2?1:-1,z=-9.4-Math.floor(cluster/2)*.55,x=side*(3.65+random(cluster+33)*.55),y=3.5+random(cluster+84)*2.3;
    for(let leaf=0;leaf<6;leaf++){
      dummy.position.set(x,y,z);dummy.rotation.set(.3+random(cluster)*.5,side*.35,(leaf-2.5)*.32-side*.8);const scale=.55+random(cluster+leaf)*.30;dummy.scale.setScalar(scale);dummy.updateMatrix();rimLeaves.setMatrixAt(leafCount++,dummy.matrix);
    }
  }
  rimLeaves.count=leafCount;edgeLayer.add(rimLeaves);
  const bridgeLight=light||new T.PointLight(0x32b9a2,8,11,2);bridgeLight.position.set(0,3.8,-10.8);if(!light)scene.add(bridgeLight);
  // Reuse the existing mist pockets for soft, broken shafts between foliage layers.
  const mists=[];
  for(let i=0;i<6;i++){
    const side=i%2?1:-1,z=mapJungleZ(-19-Math.floor(i/2)*18);
    const material=new T.ShaderMaterial({uniforms:{...uniforms,uSoft:{value:softMap},uSeed:{value:i},uHue:{value:new T.Color(i%3===0?0xb45bc3:0x36c5b5)}},transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,
      vertexShader:`varying vec2 vMistUv;void main(){vMistUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader:`varying vec2 vMistUv;uniform sampler2D uSoft;uniform float uTime,uSeed,uRichness,uJungle;uniform vec3 uHue;
        void main(){vec2 uv=vMistUv;float drift=sin(uTime*.035+uSeed)*.035;
          float shaft=exp(-pow((uv.x-.44+(uv.y-.5)*.33+drift)/.14,2.));
          float broken=.65+.35*sin(uv.y*5.+uSeed+sin(uv.x*6.));
          float feather=texture2D(uSoft,uv).a;
          gl_FragColor=vec4(uHue,feather*(.009+shaft*broken*.026)*uJungle*(.65+.65*uRichness));
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`});
    const mist=new T.Mesh(new T.PlaneGeometry(6.5,4.5),material);mist.position.set(side*6.3,3.3,z);mist.rotation.y=-side*.28;edgeLayer.add(mist);mists.push({mist,baseX:side*6.3});
  }
  return {update(progress,time,power,cameraZ=0,mistRange=40){
    uniforms.uTime.value=reducedMotion?0:time;
    uniforms.uJungle.value=T.MathUtils.smoothstep(progress,.28,.56);
    uniforms.uRichness.value=T.MathUtils.smoothstep(progress,.56,.94);
    bridgeLight.intensity=6+5*T.MathUtils.smoothstep(progress,.30,.52);
    mists.forEach(({mist,baseX},i)=>{
      const distance=cameraZ-mist.position.z;
      mist.visible=progress>.30&&distance>-7&&distance<mistRange;
      if(mist.visible)mist.position.x=baseX+(reducedMotion?0:Math.sin(time*.025+i)*.12);
    });
  }};
};
