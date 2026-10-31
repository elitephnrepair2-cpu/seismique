/* Precompute the existing soft galaxy field once, rather than on every phone. */
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const W=1024,H=512,canopy=Buffer.alloc(W*H*3),horizon=Buffer.alloc(W*H*3),f=Math.fround;
const fract=x=>x-Math.floor(x),mix=(a,b,t)=>a+(b-a)*t,clamp=x=>Math.max(0,Math.min(1,x)),smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
function hash(x,y,z){x=f(fract(f(f(x*.3183099)+.1))*17);y=f(fract(f(f(y*.3183099)+.2))*17);z=f(fract(f(f(z*.3183099)+.3))*17);return fract(f(f(f(x*y)*z)*f(f(x+y)+z)));}
function noise(x,y,z){const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z);let a=x-ix,b=y-iy,c=z-iz;a=a*a*(3-2*a);b=b*b*(3-2*b);c=c*c*(3-2*c);return mix(mix(mix(hash(ix,iy,iz),hash(ix+1,iy,iz),a),mix(hash(ix,iy+1,iz),hash(ix+1,iy+1,iz),a),b),mix(mix(hash(ix,iy,iz+1),hash(ix+1,iy,iz+1),a),mix(hash(ix,iy+1,iz+1),hash(ix+1,iy+1,iz+1),a),b),c);}
function fbm(x,y,z){let v=0,a=.5;for(let i=0;i<4;i++){v+=noise(x,y,z)*a;x=x*2.07+1.7;y=y*2.07+3.1;z=z*2.07+2.4;a*=.5;}return v;}
const encode=x=>Math.round(clamp(x<=.0031308?12.92*x:1.055*Math.pow(x,1/2.4)-.055)*255);
for(let row=0;row<H;row++)for(let col=0;col<W;col++){
 const longitude=((col+.5)/W-.5)*Math.PI*2,latitude=(.5-(row+.5)/H)*Math.PI,dx=Math.sin(longitude)*Math.cos(latitude),dy=Math.sin(latitude),dz=Math.cos(longitude)*Math.cos(latitude),x=dx*3.6,y=dy*3.6,z=dz*3.6;
 const cloud=fbm(x,y,z),detail=fbm(x*2.5+3.2,y*2.5+1.1,z*2.5+8),rift=smooth(.41,.62,fbm(x*1.4+7,y*1.4+7,z*1.4+7));
 const ribbon=Math.exp(-Math.pow((dy-.43-dx*.23+(cloud-.5)*.29)/.21,2)),dust=smooth(.28,.76,cloud)*(.30+.70*detail)*ribbon,tint=smooth(.44,.72,cloud+dx*.10),warm=Math.pow(detail,3)*ribbon*.45;
 const haze=Math.exp(-Math.pow((dy+.10-dx*.23+(cloud-.5)*.4)/.35,2)),distantTint=smooth(.40,.74,detail),distantPower=smooth(.32,.76,cloud)*(.35+.65*detail)*haze;
 const near=[mix(.17,.024,tint),mix(.023,.12,tint),mix(.25,.145,tint)].map((v,i)=>v*dust*(.35+.65*rift)+[.16,.018,.09][i]*warm),far=[mix(.13,.012,distantTint),mix(.014,.075,distantTint),mix(.21,.10,distantTint)].map(v=>v*distantPower);
 const k=(row*W+col)*3;for(let i=0;i<3;i++){const base=[.001,.002,.005][i];canopy[k+i]=encode(base+near[i]*smooth(.10,.42,dy));horizon[k+i]=encode(base+(near[i]+far[i])*smooth(-.62,.14,dy));}
}
const table=Array.from({length:256},(_,n)=>{let c=n;for(let i=0;i<8;i++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc(data){let c=0xffffffff;for(const b of data)c=table[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
function chunk(type,data){const tag=Buffer.from(type),body=Buffer.concat([tag,data]),out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length);body.copy(out,4);out.writeUInt32BE(crc(body),out.length-4);return out;}
function png(rgb){const raw=Buffer.alloc((W*3+1)*H);for(let y=0;y<H;y++){const offset=y*(W*3+1);raw[offset]=1;for(let x=0;x<W*3;x++)raw[offset+1+x]=(rgb[y*W*3+x]-(x>=3?rgb[y*W*3+x-3]:0)+256)&255;}const header=Buffer.alloc(13);header.writeUInt32BE(W);header.writeUInt32BE(H,4);header[8]=8;header[9]=2;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);}
for(const [name,data] of [['canopy',canopy],['horizon',horizon]]){const file=path.join(require('node:os').tmpdir(),'nebula-'+name+'-v1.png'),bytes=png(data);fs.writeFileSync(file,bytes);console.log(path.basename(file)+': '+bytes.length+' bytes');}
