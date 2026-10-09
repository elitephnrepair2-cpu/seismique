/* Entrance-inspired atmosphere layered onto the existing portal and jungle. */
window.createJourneyAtmosphere=({THREE:T,scene,machine,revealWorld,apertureY,mouthZ,portalDepth,vortexRadius,softMap,reducedMotion})=>{
  const portalLayer=new T.Group();machine.add(portalLayer);
  const edgeLayer=new T.Group();revealWorld.add(edgeLayer);
  const uniforms={uTravel:{value:0},uTime:{value:0},uJungle:{value:0},uPower:{value:0},uMotion:{value:0},uRichness:{value:0}};
  const random=n=>{const v=Math.sin(n*93.17+11.8)*43758.54;return v-Math.floor(v);};
  const leafCanvas=document.createElement('canvas');leafCanvas.width=leafCanvas.height=256;
  const ctx=leafCanvas.getContext('2d');ctx.clearRect(0,0,256,256);
  for(let i=0;i<35;i++){
    ctx.save();ctx.translate(random(i)*256,random(i+51)*256);ctx.rotate(random(i+90)*6.28);
    ctx.fillStyle=`rgba(19,65,51,${.45+random(i+120)*.45})`;ctx.beginPath();ctx.moveTo(0,-27);ctx.bezierCurveTo(17,-10,14,12,0,29);ctx.bezierCurveTo(-13,9,-14,-12,0,-27);ctx.fill();ctx.restore();
  }
  const leafMap=new T.CanvasTexture(leafCanvas);leafMap.wrapS=leafMap.wrapT=T.RepeatWrapping;
  uniforms.uLeaves={value:leafMap};
  // Offset triangles give highlights real angular changes as the camera moves.
  const vertices=[],uvs=[],facetIds=[],sectors=18,bands=7;
  function point(a,d,inset){const r=vortexRadius(d)-inset;return [Math.cos(a)*r,apertureY+Math.sin(a)*r,mouthZ-d*portalDepth];}
  for(let row=0;row<bands;row++)for(let i=0;i<sectors;i++){
    if(Math.sin((i+.5)/sectors*Math.PI*2)<-.73)continue;
    const a0=(i+.009)/sectors*Math.PI*2,a1=(i+.991)/sectors*Math.PI*2;
    const d0=.055+row*.13+.002,d1=.055+(row+1)*.13-.002;
    const inset=.035+random(i+row*sectors)*.035;
    const skew=.020*Math.sin(i*2.17+row*1.4);
    const points=[point(a0,d0+skew,inset),point(a1,d0-skew,inset+.06),point(a1,d1-skew,inset+.13),point(a0,d1+skew,inset+.025)];
    const coords=[[i/sectors,d0],[(i+1)/sectors,d0],[(i+1)/sectors,d1],[i/sectors,d1]];
    for(let triangle=0;triangle<2;triangle++){if((i+row*3)%6===0&&triangle===1)continue;for(const index of (triangle?[0,2,3]:[0,1,2])){vertices.push(...points[index]);uvs.push(...coords[index]);facetIds.push(i+row*1.7+triangle*2.1);}}
  }
  const facetGeometry=new T.BufferGeometry();facetGeometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));facetGeometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));facetGeometry.setAttribute('aFacet',new T.Float32BufferAttribute(facetIds,1));facetGeometry.computeVertexNormals();
  const facetMaterial=new T.ShaderMaterial({uniforms,side:T.DoubleSide,
    vertexShader:`attribute float aFacet;varying float vFacet;varying vec2 vUv;varying vec3 vWorld;varying vec3 vNormal;void main(){vFacet=aFacet;vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;vNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`varying float vFacet;varying vec2 vUv;varying vec3 vWorld;varying vec3 vNormal;uniform float uTravel,uTime,uJungle,uPower;uniform sampler2D uLeaves;
      void main(){vec3 eye=normalize(cameraPosition-vWorld),r=reflect(-eye,normalize(vNormal));
        float panel=vFacet;
        float sweep=pow(.5+.5*sin(r.x*4.+r.y*5.+r.z*3.+panel*.43+uTravel*.9+uTime*.025),10.);
        float silver=pow(.5+.5*sin(r.y*7.-r.x*2.+panel*.37+uTravel*.5),24.);
        float beyond=smoothstep(.48,.96,vUv.y)*(.35+.65*uJungle);
        vec3 tint=mix(vec3(.23,.012,.16),vec3(.018,.14,.115),beyond);
        vec3 col=vec3(.010,.012,.020)+tint*(.18+sweep*.80)+vec3(.30,.26,.34)*silver*.42;
        vec4 leaves=texture2D(uLeaves,vec2(vUv.x*3.+r.x*.10+uTravel*.025,vUv.y*1.7+r.y*.12));
        col=mix(col,col*.36+leaves.rgb*.22,leaves.a*beyond*.78);
        float selected=step(.72,fract(panel*.618));
        float streak=pow(.5+.5*sin(r.y*2.+r.x*1.4+vUv.y*1.5+uTravel*.22),95.)*selected;
        col+=mix(vec3(.03,.34,.48),vec3(.02,.25,.16),beyond)*streak*.20;
        gl_FragColor=vec4(col*(.16+.84*uPower),1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`});
  portalLayer.add(new T.Mesh(facetGeometry,facetMaterial));
  const metal=new T.MeshStandardMaterial({color:0x413b50,metalness:.78,roughness:.31,emissive:0x1e0826,emissiveIntensity:.15});
  for(let ring=0;ring<3;ring++){
    const d=.18+ring*.29,brace=new T.Mesh(new T.TorusGeometry(vortexRadius(d)-.045,.042,6,48,Math.PI*1.55),metal);
    brace.position.set(0,apertureY,mouthZ-d*portalDepth);brace.rotation.z=.2+ring*.71;portalLayer.add(brace);
  }
  // Short, fine cyan inlays remain architectural accents rather than a full neon cage.
  const streakVertices=[];
  for(let i=0;i<7;i++){
    const a=.22+i*.87,d0=.15+random(i+50)*.45,d1=d0+.10+random(i+75)*.12;
    streakVertices.push(...point(a,d0,.09),...point(a+.025,d1,.09));
  }
  const streakGeo=new T.BufferGeometry();streakGeo.setAttribute('position',new T.Float32BufferAttribute(streakVertices,3));
  const inlayMaterial=new T.LineBasicMaterial({color:0x4b9cd0,transparent:true,opacity:.34});portalLayer.add(new T.LineSegments(streakGeo,inlayMaterial));
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
  const bridgeLight=new T.PointLight(0x32b9a2,8,11,2);bridgeLight.position.set(0,3.8,-10.8);edgeLayer.add(bridgeLight);
  // Dark, interrupted side surfaces sit behind the planting. No rings or tunnel walls in view.
  const edgeMaterial=new T.ShaderMaterial({uniforms,side:T.DoubleSide,
    vertexShader:`varying vec2 vUv;varying vec3 vWorld;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`varying vec2 vUv;varying vec3 vWorld;uniform float uTravel,uMotion,uJungle;
      void main(){float soft=sin(vUv.x*3.14159)*sin(vUv.y*3.14159);
        float face=floor(vUv.x*3.+vUv.y*1.3),plane=.5+.5*sin(face*3.1+vUv.y*2.);
        float spill=pow(.5+.5*sin(vUv.x*2.8+vUv.y*2.+face*1.7+uTravel*.23),7.)*soft;
        float glint=pow(.5+.5*sin(vUv.y*3.+vUv.x*1.8+uTravel*.9+vWorld.z*.05),35.)*soft*uMotion;
        vec3 hue=mix(vec3(.055,.012,.075),vec3(.008,.040,.045),.5+.5*sin(vWorld.z*.19));
        vec3 col=vec3(.004,.006,.012)+hue*(plane*.10+spill*.36+glint*.18)*uJungle;
        gl_FragColor=vec4(col,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`});
  for(const side of [-1,1])for(let row=0;row<5;row++){
    const panel=new T.Mesh(new T.PlaneGeometry(8.0,7.7),edgeMaterial);panel.position.set(side*10.9,3.95,-18.5-row*8.0);panel.rotation.y=-side*Math.PI/2;edgeLayer.add(panel);
  }
  // Reuse the existing mist pockets for soft, broken shafts between foliage layers.
  const mists=[];
  for(let i=0;i<10;i++){
    const side=i%2?1:-1,z=-19-Math.floor(i/2)*8;
    const material=new T.ShaderMaterial({uniforms:{...uniforms,uSoft:{value:softMap},uSeed:{value:i},uHue:{value:new T.Color(i%3===0?0xb45bc3:0x36c5b5)}},transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,
      vertexShader:`varying vec2 vMistUv;void main(){vMistUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader:`varying vec2 vMistUv;uniform sampler2D uSoft;uniform float uTime,uSeed,uRichness,uJungle;uniform vec3 uHue;
        void main(){vec2 uv=vMistUv;float drift=sin(uTime*.035+uSeed)*.035;
          float shaft=exp(-pow((uv.x-.44+(uv.y-.5)*.33+drift)/.14,2.));
          float broken=.65+.35*sin(uv.y*5.+uSeed+sin(uv.x*6.));
          float feather=texture2D(uSoft,uv).a;
          gl_FragColor=vec4(uHue,feather*(.016+shaft*broken*.043)*uJungle*(.65+.65*uRichness));
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`});
    const mist=new T.Mesh(new T.PlaneGeometry(5.0,4.5),material);mist.position.set(side*6.3,3.3,z);mist.rotation.y=-side*.28;edgeLayer.add(mist);mists.push({mist,baseX:side*6.3});
  }
  let previous=0,motion=0;
  return {update(progress,time,power){
    motion+=(Math.min(1,Math.abs(progress-previous)*90)-motion)*.1;previous=progress;
    uniforms.uTravel.value=reducedMotion?0:progress*3;uniforms.uTime.value=reducedMotion?0:time;
    uniforms.uJungle.value=T.MathUtils.smoothstep(progress,.28,.56);uniforms.uPower.value=power;uniforms.uMotion.value=reducedMotion?0:motion;
    uniforms.uRichness.value=T.MathUtils.smoothstep(progress,.56,.94);
    portalLayer.visible=progress>.012&&progress<.61;inlayMaterial.opacity=.30*power;
    bridgeLight.intensity=6+5*T.MathUtils.smoothstep(progress,.30,.52);
    mists.forEach(({mist,baseX},i)=>{mist.position.x=baseX+(reducedMotion?0:Math.sin(time*.025+i)*.12);});
  }};
};
