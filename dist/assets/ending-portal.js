/* Residual light in the final clearing: no frame, doorway, or active field. */
window.createEndingAfterglow=({THREE:T,parent,x,z,reducedMotion,light=null})=>{
  const group=new T.Group();group.name='Journey complete — atmospheric afterglow';
  group.position.set(x,3.5,z-1.6);parent.add(group);
  const uniforms={uTime:{value:0},uPresence:{value:0}};
  const material=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,
    blending:T.AdditiveBlending,side:T.DoubleSide,
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec2 vUv;uniform float uTime,uPresence;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 p=(vUv-.5)*2.;float r=length(p),a=atan(p.y,p.x);
        float edge=1.-smoothstep(.76,1.,r);
        float openCenter=smoothstep(.25,.62,r);
        float cloud=noise(p*3.8+vec2(uTime*.006,-uTime*.004));
        float drift=.92+.08*sin(uTime*.12+a);
        // Incomplete, diffuse traces; never a closed ring or a central membrane.
        float gaps=smoothstep(.22,.8,sin(a*2.3+.4))*smoothstep(.2,.68,cloud);
        float trace=exp(-pow((r-.67-cloud*.025)/.026,2.))*gaps;
        float echo=exp(-pow((r-.78)/.04,2.))*smoothstep(.4,.9,sin(a*3.-.9));
        float haze=cloud*openCenter*edge*.09;
        float residual=pow(.5+.5*sin(uTime*.17+1.6),18.)*.012*trace;
        vec3 hue=mix(vec3(.34,.11,.55),vec3(.06,.36,.40),smoothstep(-.7,.8,p.x));
        hue=mix(hue,vec3(.45,.10,.31),smoothstep(.1,.8,p.y)*.35);
        float alpha=(haze+(trace*.07+echo*.018+residual)*edge)*drift*uPresence;
        gl_FragColor=vec4(hue,alpha);
      }`});
  group.add(new T.Mesh(new T.PlaneGeometry(14,10),material));
  // Keep the reserved light scene-owned so hidden scenery cannot alter shader counts.
  const glow=light||new T.PointLight(0x9275c9,0,8,2);
  glow.position.set(x,2.0,z+1.0);if(!light)parent.add(glow);
  return {update(time,cameraZ){
    const presence=1.-T.MathUtils.smoothstep(cameraZ-z,19,31);
    group.visible=presence>.001;uniforms.uPresence.value=presence;
    uniforms.uTime.value=reducedMotion?0:time;
    glow.intensity=1.8*presence;
  }};
};

// The lobby floor hands over to jungle ground; the final path fades into the clearing.
window.fadeEndingFloor=(material,kind,endingZ=-73.24)=>{
  const endDepth=-endingZ;
  material.transparent=true;
  material.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec3 vEndingWorld;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvEndingWorld=(modelMatrix*vec4(transformed,1.)).xyz;');
    shader.fragmentShader='varying vec3 vEndingWorld;\n'+shader.fragmentShader;
    const alpha=kind==='museum'?`diffuseColor.a*=1.-smoothstep(10.,17.,-vEndingWorld.z);`:kind==='path'?`float endDepth=smoothstep(${(endDepth-8.24).toFixed(2)},${(endDepth+.76).toFixed(2)},-vEndingWorld.z);float pathCenter=.82*sin((min(-vEndingWorld.z,25.)+max(0.,-vEndingWorld.z-25.)/1.44-23.)*.29);float edgeFade=1.-smoothstep(1.05,2.06,abs(vEndingWorld.x-pathCenter));diffuseColor.a*=mix(1.,edgeFade,endDepth)*(1.-smoothstep(${(endDepth+.16).toFixed(2)},${(endDepth+.81).toFixed(2)},-vEndingWorld.z));`:`diffuseColor.a*=1.-smoothstep(66.,74.,-vEndingWorld.z);`;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+alpha+'\nif(diffuseColor.a<.015)discard;');
  };
  material.customProgramCacheKey=()=>`ending-floor-${kind}-${endingZ}-64`;
};
