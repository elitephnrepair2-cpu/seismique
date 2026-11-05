/* Bake the existing deterministic surface pixels once, instead of on every phone. */
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const random=n=>{const v=Math.sin(n*127.13+53.7)*43758.5453;return v-Math.floor(v);};
const lerp=(a,b,t)=>(1-t)*a+t*b;
function noise(x,y,cells,seed=0){
  const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy);
  const sample=(a,b)=>random(((a%cells+cells)%cells)+((b%cells+cells)%cells)*cells+seed);
  return lerp(lerp(sample(ix,iy),sample(ix+1,iy),ux),lerp(sample(ix,iy+1),sample(ix+1,iy+1),ux),uy);
}
function pixels(name){
  const size=name==='stone'?128:256,data=new Uint8ClampedArray(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const k=(y*size+x)*4;let rgb;
    if(name==='bark')rgb=Array(3).fill((.43+noise(x/16,y/16,16,211)*.19+noise(x/4,y/4,64,407)*.10)*255);
    else if(name==='barkColor')rgb=Array(3).fill((.94+noise(x/64,y/64,4,819)*.06)*255);
    else if(name==='stone')rgb=Array(3).fill((.58*noise(x/8,y/8,16,170)+.27*noise(x/2,y/2,64,361)+.15*noise(x/32,y/32,4,542))*255);
    else if(name==='path'){
      const n=.52*noise(x/64,y/64,4,8)+.27*noise(x/16,y/16,16,72)+.15*noise(x/4,y/4,64,201)+.06*random(x+y*256);
      rgb=[20+n*15,56+n*27,59+n*25];
    }else throw Error('Unknown surface '+name);
    data.set(rgb,k);data[k+3]=255;
  }
  return {size,data};
}
function crc32(bytes){let c=0xffffffff;for(const byte of bytes){c^=byte;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
function chunk(type,data){const label=Buffer.from(type),length=Buffer.alloc(4),crc=Buffer.alloc(4);length.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([label,data])));return Buffer.concat([length,label,data,crc]);}
function png({size,data}){
  const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
  // PNG Sub filtering keeps these small, smooth maps compact without losing pixels.
  const stride=size*4,rows=Buffer.alloc((stride+1)*size);
  for(let y=0;y<size;y++){rows[y*(stride+1)]=1;for(let x=0;x<stride;x++)rows[y*(stride+1)+1+x]=(data[y*stride+x]-(x>=4?data[y*stride+x-4]:0)+256)&255;}
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(rows,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}
function build(directory){
  const assets={};
  for(const name of ['bark','barkColor','stone','path']){
    const bytes=png(pixels(name)),hash=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12),file=`jungle-${name}.${hash}.png`;
    fs.writeFileSync(path.join(directory,file),bytes);assets[name]={file,bytes:bytes.length};
  }
  return assets;
}
module.exports={build,pixels,png};
