/* Pack four lattice corners into one tiny texture lookup, instead of hashing
   every corner with trigonometry for every portal pixel on every frame. */
(function(scope){
  function createPortalNoise(T){
    const size=64,data=new Uint8Array(size*size*4);
    const hash=(x,y)=>{const v=Math.sin(((x%size+size)%size)*127.1+((y%size+size)%size)*311.7)*43758.5453;return Math.round((v-Math.floor(v))*255);};
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4;data[i]=hash(x,y);data[i+1]=hash(x+1,y);data[i+2]=hash(x,y+1);data[i+3]=hash(x+1,y+1);}
    const texture=new T.DataTexture(data,size,size,T.RGBAFormat);texture.minFilter=texture.magFilter=T.NearestFilter;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.generateMipmaps=false;texture.needsUpdate=true;return texture;
  }
  scope.createPortalNoise=createPortalNoise;
  if(typeof module!=='undefined')module.exports={createPortalNoise};
})(typeof window!=='undefined'?window:globalThis);
