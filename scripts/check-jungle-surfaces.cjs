const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib'),vm=require('node:vm');
const base=path.join(__dirname,'../dist/assets'),manifest=JSON.parse(fs.readFileSync(path.join(base,'journey-loading.json'),'utf8'));
// Captured from the original Canvas ImageData, before replacing runtime generation.
const expected={bark:'7316717913dd2730c2e41aba12f0fb1c5e0bcd76922b9f39f35597a662c569b2',barkColor:'daa156793224df1057dfeb810d4535b3366d5f644b5df6efa3cdefa3b80741e3',stone:'451b701190076d477221aa5f626336f2811fdb264829979a96a1ac93e3733165',path:'2020a679a2dfae88ecd5b5fc7f42e4ca7e8a7facd6981245b8efca4cf46c23e9'};
let total=0;
for(const [name,asset] of Object.entries(manifest.surfaces)){
  const bytes=fs.readFileSync(path.join(base,asset.file)),parts=[];let width,height;
  assert(asset.file.includes(crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12)));
  for(let i=8;i<bytes.length;){const size=bytes.readUInt32BE(i),type=bytes.toString('ascii',i+4,i+8),data=bytes.subarray(i+8,i+8+size);if(type==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);}if(type==='IDAT')parts.push(data);i+=12+size;}
  const rows=zlib.inflateSync(Buffer.concat(parts)),stride=width*4,pixels=Buffer.alloc(width*height*4);
  for(let y=0;y<height;y++){assert.equal(rows[y*(stride+1)],1);for(let x=0;x<stride;x++)pixels[y*stride+x]=(rows[y*(stride+1)+x+1]+(x>=4?pixels[y*stride+x-4]:0))&255;}
  assert.equal(crypto.createHash('sha256').update(pixels).digest('hex'),expected[name],name+' pixels must exactly match the original art');total+=bytes.length;
}
assert(total<100000,'All four surfaces together must stay below 100 KB');
async function load(mode){
  const pending=[],loaded=[],assets=Object.fromEntries(Object.keys(expected).map(n=>[n,'/assets/'+n+'.png']));let timer,cleared=0,disposed=0;
  const T={RepeatWrapping:'repeat',SRGBColorSpace:'srgb',RGBAFormat:'rgba',TextureLoader:class{loadAsync(url){return new Promise((resolve,reject)=>pending.push({url,resolve,reject}));}},DataTexture:class{constructor(data,w,h){this.data=data;this.width=w;this.height=h;}}};
  const ctx={window:{journeySurfaceAssets:assets},Uint8Array,setTimeout(fn){timer=fn;return 1;},clearTimeout(){cleared++;}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(base,'jungle-surfaces.js'),'utf8'),ctx);
  const work=ctx.window.preloadJungleSurfaces(T);
  if(mode==='timeout')timer();
  else pending.forEach((request,i)=>{if(mode==='failure'&&i===0)request.reject(Error('offline'));else {const texture={dispose(){disposed++;}};loaded.push(texture);request.resolve(texture);}});
  const result=await work;assert.equal(cleared,1);assert.equal(result.mode,mode==='success'?'prebuilt':'fallback');assert.equal(Object.keys(result.maps).length,4);
  for(const map of Object.values(result.maps))assert.equal(map.wrapS,'repeat');
  assert.equal(result.maps.path.colorSpace,'srgb');assert.equal(result.maps.barkColor.anisotropy,4);
  if(mode==='timeout'){
    const before=Object.values(result.maps);pending.forEach(request=>request.resolve({dispose(){disposed++;}}));await Promise.resolve();await Promise.resolve();
    assert.equal(disposed,4,'Late images are disposed rather than swapping textures during the moving opening');assert.deepEqual(Object.values(result.maps),before);
  }
}
(async()=>{await load('success');await load('failure');await load('timeout');console.log('PASS: lossless original surface pixels; <100 KB total; successful, failed and stalled image requests; stable fallback with no late upload during travel.');})().catch(error=>{console.error(error);process.exitCode=1;});
