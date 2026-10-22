const fs=require('fs'),vm=require('vm'),assert=require('assert');
const dir=require('path').resolve(__dirname,'..');
const html=fs.readFileSync(dir+'/dist/index.html','utf8');
for(const [i,m] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].entries())if(!/src=|type="(?:application|importmap)/.test(m[1]))new vm.Script(m[2],{filename:'inline-'+i});
const T=require(dir+'/dist/assets/three.min.js');
const fit=html.slice(html.indexOf('    function fitEntranceWordmark(){'),html.indexOf('    const entranceWallMaterials='));
for(const [width,height,safe] of [[390,844,0],[390,844,47],[320,568,0],[430,932,59],[844,390,0]]){
 const ctx={T,entranceWordmark:new T.Group(),arrivalCameraZ:26.768*.5/Math.tan(37*Math.PI/180)/1.2,arrivalEyeY:5,machineLift:.6,stage:{clientWidth:width,clientHeight:height,getBoundingClientRect:()=>({top:0})},root:{querySelector:()=>({getBoundingClientRect:()=>({bottom:safe+56})})},getComputedStyle:()=>({getPropertyValue:()=>String(safe)}),document:{body:{}},camera:{aspect:width/height},renderer:{shadowMap:{}}};
 vm.createContext(ctx);vm.runInContext(fit,ctx);ctx.fitEntranceWordmark();
 const worldH=2*(ctx.arrivalCameraZ+.09)*Math.tan(37*Math.PI/180),scale=ctx.entranceWordmark.scale.y;
 const top=height*(.5-(ctx.entranceWordmark.position.y+1.5*scale-ctx.arrivalEyeY)/worldH);
 assert(top>=safe+72-.01,`${width}×${height}: logo must clear safe area and controls`);
 assert(scale*12.1/worldH*height<=width*.901,'Logo must fit horizontally');
}
require('./check-guided-journey.cjs');
assert(!html.includes('GLOBAL_FOOTER_START'));
console.log('PASS: inline syntax, safe-area logo clearance at five mobile sizes, and no document-flow footer.');
