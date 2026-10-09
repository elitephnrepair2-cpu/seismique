/* A closed, architectural threshold at the end of the jungle. */
window.createEndingPortal=({THREE:T,parent,x,z,reducedMotion})=>{
  const group=new T.Group();group.name='Your next discovery — closed portal';group.position.set(x,0,z);parent.add(group);
  const centerY=3.13,rx=2.32,ry=2.82;
  const faceCanvases=[];
  for(let i=0;i<6;i++){
    const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');
    const g=ctx.createLinearGradient(0,0,128,128);g.addColorStop(0,'#070d1c');g.addColorStop(.27,i%2?'#684064':'#324d5e');g.addColorStop(.40,'#a4adb8');g.addColorStop(.47,'#181827');g.addColorStop(.73,'#4f315c');g.addColorStop(1,'#090e17');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);faceCanvases.push(c);
  }
  const reflection=new T.CubeTexture(faceCanvases);reflection.colorSpace=T.SRGBColorSpace;reflection.needsUpdate=true;
  const metal=new T.MeshPhysicalMaterial({color:0x737586,metalness:.86,roughness:.28,envMap:reflection,envMapIntensity:.85,clearcoat:.4,clearcoatRoughness:.3});
  const darkMetal=new T.MeshStandardMaterial({color:0x151625,metalness:.7,roughness:.4,envMap:reflection,envMapIntensity:.45});
  const add=(geometry,material,px=0,py=0,pz=0)=>{const m=new T.Mesh(geometry,material);m.position.set(px,py,pz);group.add(m);return m;};
  const shell=new T.Shape();shell.absellipse(0,centerY,2.72,3.22,0,Math.PI*2,false,0);
  const hole=new T.Path();hole.absellipse(0,centerY,rx,ry,0,Math.PI*2,true,0);shell.holes.push(hole);
  add(new T.ExtrudeGeometry(shell,{depth:.50,bevelEnabled:true,bevelSize:.09,bevelThickness:.085,bevelSegments:3,curveSegments:64}),metal,0,0,-.25);
  const arc=(radiusX,radiusY,a0,a1,depth,thickness,material)=>{
    const points=[];for(let i=0;i<=96;i++){const a=a0+(a1-a0)*i/96;points.push(new T.Vector3(Math.cos(a)*radiusX,centerY+Math.sin(a)*radiusY,depth));}
    return add(new T.TubeGeometry(new T.CatmullRomCurve3(points),96,thickness,6,false),material);
  };
  arc(2.81,3.30,0,Math.PI*2,-.13,.072,darkMetal);
  // Separated inset accents read as engineered details, with dark gaps for restraint.
  const cyan=new T.MeshBasicMaterial({color:0x5cb9c8}),violet=new T.MeshBasicMaterial({color:0x8d6faf});
  for(let segment=0;segment<8;segment++){
    const a=segment*Math.PI/4+.06;
    arc(rx+.035,ry+.035,a,a+.66,.32,.017,segment%3===0?cyan:violet);
  }
  for(let i=0;i<12;i++){
    const a=(i+.5)/12*Math.PI*2,px=Math.cos(a)*2.54,py=centerY+Math.sin(a)*3.04;
    const clasp=add(new T.BoxGeometry(.20,.14,.12),darkMetal,px,py,.34);clasp.rotation.z=a;
    const pin=add(new T.CylinderGeometry(.029,.029,.018,8),metal,px,py,.415);pin.rotation.x=Math.PI/2;
  }
  const uniforms={uTime:{value:0},uPulse:{value:0}};
  const noise=`float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=noise(p)*a;p=mat2(.8,-.6,.6,.8)*p*2.04+3.4;a*=.5;}return v;}`;
  const membraneMaterial=new T.ShaderMaterial({uniforms,side:T.DoubleSide,
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec2 vUv;uniform float uTime,uPulse;${noise}
      void main(){vec2 p=(vUv-.5)*2.;float r=length(p),a=atan(p.y,p.x),turn=uTime*.018;
        vec2 q=mat2(cos(turn),-sin(turn),sin(turn),cos(turn))*p;
        float cloud=fbm(q*2.9+vec2(uTime*.007,-uTime*.009)),detail=fbm(q*5.4+cloud*2.1);
        float veil=smoothstep(.26,.75,cloud)*(.30+.70*detail),filament=pow(.5+.5*sin(a*2.0-r*7.+cloud*4.-uTime*.055),10.)*smoothstep(.18,.8,r)*(1.-smoothstep(.83,1.,r));
        vec3 mist=mix(vec3(.09,.014,.17),vec3(.02,.12,.14),smoothstep(.45,.72,detail));
        vec3 col=vec3(.003,.004,.012)+mist*veil*.72+vec3(.035,.06,.105)*filament*.65;
        col+=vec3(.055,.025,.11)*pow(r,12.)*(.4+uPulse*.25);
        gl_FragColor=vec4(col,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`});
  const membrane=add(new T.CircleGeometry(1,96),membraneMaterial,0,centerY,-.17);membrane.scale.set(rx,ry,1);
  const rimMaterial=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,
    vertexShader:`varying vec3 vPosition;void main(){vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec3 vPosition;uniform float uTime,uPulse;void main(){float a=atan((vPosition.y-3.13)/2.82,vPosition.x/2.32);float sweep=pow(.5+.5*cos(a-uTime*.15),16.);vec3 hue=mix(vec3(.52,.20,.77),vec3(.20,.75,.82),.5+.5*sin(a));gl_FragColor=vec4(hue,.20+sweep*.30+uPulse*.12);}`});
  arc(rx-.012,ry-.012,0,Math.PI*2,.30,.022,rimMaterial);
  // The title is mounted above the opening, with brackets connecting it to the shell.
  for(const side of [-1,1])add(new T.BoxGeometry(.075,.64,.10),darkMetal,side*1.80,6.28,-.02);
  const plaqueShape=new T.Shape();plaqueShape.moveTo(-2.96,-.25);plaqueShape.lineTo(-2.82,-.38);plaqueShape.lineTo(2.82,-.38);plaqueShape.lineTo(2.96,-.25);plaqueShape.lineTo(2.96,.25);plaqueShape.lineTo(2.82,.38);plaqueShape.lineTo(-2.82,.38);plaqueShape.lineTo(-2.96,.25);plaqueShape.closePath();
  add(new T.ExtrudeGeometry(plaqueShape,{depth:.09,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:1}),darkMetal,0,6.83,.08);
  const titleCanvas=document.createElement('canvas');titleCanvas.width=2048;titleCanvas.height=256;const ctx=titleCanvas.getContext('2d');
  ctx.fillStyle='#f5f1ff';ctx.font='800 109px Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('YOUR NEXT DISCOVERY',1024,131,1930);
  const titleTexture=new T.CanvasTexture(titleCanvas);titleTexture.colorSpace=T.SRGBColorSpace;
  add(new T.PlaneGeometry(5.64,.705),new T.MeshBasicMaterial({map:titleTexture,transparent:true,depthWrite:false}),0,6.83,.21);
  // Solid feet meet the roots and walkway. The portal is never an interaction target.
  for(const side of [-1,1])add(new T.BoxGeometry(.68,.16,1.05),darkMetal,side*1.85,.08,.04);
  const glow=new T.PointLight(0x9275c9,9,8,2);glow.position.set(0,3.8,1.0);group.add(glow);
  return {update(time){const t=reducedMotion?0:time;uniforms.uTime.value=t;uniforms.uPulse.value=reducedMotion?0:Math.pow(.5+.5*Math.sin(t*.25),8.);glow.intensity=9+uniforms.uPulse.value*1.2;}};
};

// Only the last few metres fade; the museum and every earlier jungle stop keep their materials.
window.fadeEndingFloor=(material,kind)=>{
  material.transparent=true;
  material.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec3 vEndingWorld;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvEndingWorld=(modelMatrix*vec4(transformed,1.)).xyz;');
    shader.fragmentShader='varying vec3 vEndingWorld;\n'+shader.fragmentShader;
    const alpha=kind==='museum'?`diffuseColor.a*=1.-smoothstep(43.,45.,-vEndingWorld.z);`:kind==='path'?`float endDepth=smoothstep(47.,56.,-vEndingWorld.z);float pathCenter=.82*sin((-vEndingWorld.z-23.)*.29);float edgeFade=1.-smoothstep(1.05,2.06,abs(vEndingWorld.x-pathCenter));diffuseColor.a*=mix(1.,edgeFade,endDepth)*(1.-smoothstep(55.6,56.1,-vEndingWorld.z));`:`diffuseColor.a*=1.-smoothstep(46.5,55.,-vEndingWorld.z);`;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+alpha+'\nif(diffuseColor.a<.015)discard;');
  };
  material.customProgramCacheKey=()=>`ending-floor-${kind}-40`;
};
