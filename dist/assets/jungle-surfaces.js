/* Download surface maps during entrance construction; never calculate noise pixels in a frame. */
(function(scope){
  scope.preloadJungleSurfaces=(T)=>{
    const maps={},loader=new T.TextureLoader();
    const defaults={bark:145,barkColor:245,stone:128,path:[28,70,72]};
    let settled=false,timer;
    const tasks=Object.entries(scope.journeySurfaceAssets).map(([name,url])=>loader.loadAsync(url).then(texture=>{
      if(settled){texture.dispose();return;}
      maps[name]=texture;
    }).catch(()=>{}));
    return Promise.race([Promise.all(tasks),new Promise(resolve=>{timer=setTimeout(resolve,2500);})]).then(()=>{
      clearTimeout(timer);settled=true;let fallback=0;
      for(const name of Object.keys(defaults)){
        if(!maps[name]){
          const color=Array.isArray(defaults[name])?defaults[name]:Array(3).fill(defaults[name]);
          maps[name]=new T.DataTexture(new Uint8Array([...color,255]),1,1,T.RGBAFormat);maps[name].needsUpdate=true;fallback++;
        }
        const texture=maps[name];texture.wrapS=texture.wrapT=T.RepeatWrapping;
        if(name==='bark'||name==='barkColor')texture.anisotropy=4;
        if(name==='barkColor'||name==='path')texture.colorSpace=T.SRGBColorSpace;
      }
      return {maps,mode:fallback?'fallback':'prebuilt'};
    });
  };
})(window);
