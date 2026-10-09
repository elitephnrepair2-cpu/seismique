/* Distant galaxy above the canopy. Scene depth keeps every leaf in front. */
window.createJungleSky=({THREE:T,scene,reducedMotion})=>{
  const group=new T.Group();group.name='Jungle galaxy';scene.add(group);
  const rand=n=>{const x=Math.sin(n*127.1+81.3)*43758.5453;return x-Math.floor(x);};
  const uniforms={uTime:{value:0},uFade:{value:0},uEnding:{value:0},uPixelRatio:{value:Math.min(devicePixelRatio,1.8)}};
  // Camera-relative geometry gives the sky celestial distance without flattening the canopy.
  const skyMaterial=new T.ShaderMaterial({uniforms,side:T.BackSide,depthWrite:false,fog:false,
    vertexShader:`varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*viewMatrix*vec4(position+cameraPosition,1.);}`,
    fragmentShader:`varying vec3 vDirection;uniform float uTime,uFade,uEnding;
      float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
      float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
      float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=noise(p)*a;p=p*2.07+vec3(1.7,3.1,2.4);a*=.5;}return v;}
      void main(){vec3 d=normalize(vDirection);float overhead=mix(smoothstep(.10,.42,d.y),smoothstep(-.62,.14,d.y),uEnding);vec3 base=vec3(.001,.002,.005);
        if(overhead<.001){gl_FragColor=vec4(base,1.);return;}
        vec3 p=d*3.6+vec3(uTime*.0015,0.,uTime*.0007);
        float cloud=fbm(p),detail=fbm(p*2.5+vec3(3.2,1.1,8.));
        float ribbon=exp(-pow((d.y-.43-d.x*.23+(cloud-.5)*.29)/.21,2.));
        float dust=smoothstep(.28,.76,cloud)*(.30+.70*detail)*ribbon;
        float rift=smoothstep(.41,.62,fbm(p*1.4+7.));
        vec3 hue=mix(vec3(.17,.023,.25),vec3(.024,.12,.145),smoothstep(.44,.72,cloud+d.x*.10));
        vec3 nebula=hue*dust*(.35+.65*rift)+vec3(.16,.018,.09)*pow(detail,3.)*ribbon*.45;
        float horizon=exp(-pow((d.y+.10-d.x*.23+(cloud-.5)*.4)/.35,2.));
        vec3 distant=mix(vec3(.13,.014,.21),vec3(.012,.075,.10),smoothstep(.40,.74,detail))*smoothstep(.32,.76,cloud)*(.35+.65*detail)*horizon;
        nebula+=distant*uEnding;
        gl_FragColor=vec4(base+nebula*overhead*uFade,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`});
  const dome=new T.Mesh(new T.SphereGeometry(84,32,20),skyMaterial);dome.frustumCulled=false;dome.renderOrder=-5;group.add(dome);
  const positions=[],sizes=[],brightness=[],phases=[],horizonFlags=[];
  for(let i=0;i<640;i++){
    const y=.13+rand(i+100)*.87,a=rand(i+300)*Math.PI*2,r=Math.sqrt(1-y*y);
    positions.push(Math.cos(a)*r*81,y*81,Math.sin(a)*r*81);
    sizes.push(1.15+Math.pow(rand(i+500),4)*1.45);brightness.push(.30+Math.pow(rand(i+700),2)*.47);phases.push(rand(i+900)*6.28);horizonFlags.push(0);
  }
  // Additional horizon stars reveal only in the final clearing; the canopy sky stays unchanged.
  for(let i=0;i<240;i++){
    const y=-.48+rand(i+2100)*.61,a=rand(i+2300)*Math.PI*2,r=Math.sqrt(1-y*y);
    positions.push(Math.cos(a)*r*81,y*81,Math.sin(a)*r*81);sizes.push(.95+Math.pow(rand(i+2500),4)*1.3);brightness.push(.23+rand(i+2700)*.35);phases.push(rand(i+2900)*6.28);horizonFlags.push(1);
  }
  const starGeometry=new T.BufferGeometry();starGeometry.setAttribute('aHorizon',new T.Float32BufferAttribute(horizonFlags,1));starGeometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));starGeometry.setAttribute('aSize',new T.Float32BufferAttribute(sizes,1));starGeometry.setAttribute('aBrightness',new T.Float32BufferAttribute(brightness,1));starGeometry.setAttribute('aPhase',new T.Float32BufferAttribute(phases,1));
  const starMaterial=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,
    vertexShader:`attribute float aSize,aBrightness,aPhase,aHorizon;uniform float uTime,uFade,uPixelRatio,uEnding;varying float vLight;void main(){vLight=aBrightness*(.93+.07*sin(uTime*.36+aPhase))*uFade*mix(mix(smoothstep(.13,.34,normalize(position).y),1.,uEnding*.8),uEnding,aHorizon);gl_Position=projectionMatrix*viewMatrix*vec4(position+cameraPosition,1.);gl_PointSize=aSize*uPixelRatio;}`,
    fragmentShader:`varying float vLight;void main(){float glow=1.-smoothstep(.05,.5,length(gl_PointCoord-.5));gl_FragColor=vec4(vec3(.78,.81,1.),glow*vLight);}`});
  const stars=new T.Points(starGeometry,starMaterial);stars.frustumCulled=false;stars.renderOrder=1;group.add(stars);
  // One pooled streak, with a soft taper. It never crosses the lower content area.
  const meteorUniforms={uHead:{value:new T.Vector2()},uDirection:{value:new T.Vector2()},uLength:{value:.12},uOpacity:{value:0}};
  const meteorMaterial=new T.ShaderMaterial({uniforms:meteorUniforms,transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,fog:false,
    vertexShader:`uniform vec2 uHead,uDirection;uniform float uLength;varying vec2 vUv;void main(){vUv=uv;vec2 side=vec2(-uDirection.y,uDirection.x);vec2 angle=uHead-uDirection*(1.-uv.x)*uLength+side*(uv.y-.5)*.0034*(.25+.75*uv.x);vec3 d=vec3(sin(angle.x)*cos(angle.y),sin(angle.y),-cos(angle.x)*cos(angle.y));gl_Position=projectionMatrix*viewMatrix*vec4(d*79.+cameraPosition,1.);}`,
    fragmentShader:`varying vec2 vUv;uniform float uOpacity;void main(){float core=pow(1.-abs(vUv.y*2.-1.),1.6),tail=pow(vUv.x,1.8);vec3 color=mix(vec3(.30,.45,.80),vec3(.88,.96,1.),pow(vUv.x,5.));gl_FragColor=vec4(color,core*tail*uOpacity);}`});
  const meteor=new T.Mesh(new T.PlaneGeometry(1,1,20,1),meteorMaterial);meteor.frustumCulled=false;meteor.renderOrder=2;meteor.visible=false;group.add(meteor);
  let lastTime=null,skyTime=0,nextMeteor=3.5,event=0,flight=null;
  return {update(progress,time){
    const dt=lastTime===null?0:Math.max(0,Math.min(.08,time-lastTime));lastTime=time;
    const fade=T.MathUtils.smoothstep(progress,.43,.60);group.visible=fade>.001;
    if(!reducedMotion&&progress>.55)skyTime+=dt;
    uniforms.uTime.value=reducedMotion?0:skyTime;uniforms.uFade.value=fade;uniforms.uEnding.value=T.MathUtils.smoothstep(progress,.84,.98);
    if(!reducedMotion&&group.visible&&skyTime>=nextMeteor){
      const direction=event%2? -1:1,elevation=.38+rand(event+1400)*.14;
      flight={start:skyTime,duration:1.25+rand(event+1401)*.40,x:-direction*(.28+rand(event+1402)*.16),y:elevation,dx:direction*(.61+rand(event+1403)*.14),dy:-.12};
      meteorUniforms.uDirection.value.set(flight.dx,flight.dy).normalize();meteorUniforms.uLength.value=.11+rand(event+1404)*.025;
      nextMeteor=skyTime+15+rand(event+1405)*10;event++;
    }
    meteor.visible=false;
    if(flight&&!reducedMotion&&fade>.1){
      const t=(skyTime-flight.start)/flight.duration;
      if(t<=1){meteor.visible=true;meteorUniforms.uHead.value.set(flight.x+flight.dx*t,flight.y+flight.dy*t);meteorUniforms.uOpacity.value=Math.sin(Math.PI*t)*.88*fade;}else flight=null;
    }
  }};
};
