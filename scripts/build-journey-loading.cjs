/* Compile the homepage delivery files; editable scene sources stay separate. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib'),{minify}=require('terser');
const root=path.join(__dirname,'..'),assets=path.join(root,'dist/assets');
const read=name=>fs.readFileSync(path.join(assets,name),'utf8');
const groups={
 ui:['visitor.js','journey-interface.js'],
 jungle:['journey-atmosphere.js','jungle-lighting.js','jungle-sky.js','destination-grass.js'],
 entry:['journey-preparation.js','portal-noise.js','ending-portal.js','entrance-mural.js','portal-energy.js','journey-guide.js','static-scenery.js','journey-performance.js','jungle-light-budget.js','journey-scene.js']
};
(async()=>{
 const bundles={};
 async function bundle(name,extra=''){
  const inputs=Object.fromEntries(groups[name].map(file=>[file,read(file)]));if(extra)inputs['jungle-loader.js']=extra;
  // The loader must exist before the scene's DOMContentLoaded callback runs.
  const result=await minify(inputs,{compress:{passes:2},mangle:true,format:{comments:false}});
  const code=result.code+'\n',hash=crypto.createHash('sha256').update(code).digest('hex').slice(0,12),file=`journey-${name}.${hash}.js`;
  fs.writeFileSync(path.join(assets,file),code);bundles[name]={file,bytes:Buffer.byteLength(code),gzipBytes:zlib.gzipSync(code).length};return file;
 }
 await bundle('ui');const jungle=await bundle('jungle');
 const loader=`(()=>{let pending=null;window.loadJourneyJungle=()=>pending||(pending=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/assets/${jungle}';script.async=true;script.fetchPriority='low';script.onload=()=>resolve();script.onerror=()=>{pending=null;script.remove();reject(new Error('Jungle download interrupted'));};document.head.append(script);}));})();`;
 await bundle('entry',loader);
 let html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
 const replace=(name,pattern,text)=>{const block=`<!--journey:${name}-->\n${text}\n<!--/journey:${name}-->`;const marker=new RegExp(`<!--journey:${name}-->[\\s\\S]*?<!--/journey:${name}-->`);html=marker.test(html)?html.replace(marker,()=>block):html.replace(pattern,()=>block);};
 replace('preloads',/<link rel="preload" href="\/assets\/three[^\n]+\n<link rel="preload" href="\/assets\/journey-scene[^\n]+/,
  `<link rel="preload" href="/assets/three.min.js?v=160" as="script" fetchpriority="high">\n<link rel="preload" href="/assets/${bundles.entry.file}" as="script" fetchpriority="high">`);
 const styles=['visitor.css','journey-interface.css','navigation.css'].map(read).join('\n');
 replace('styles',/<link rel="stylesheet" href="\/assets\/visitor[^\n]+\n<link rel="stylesheet" href="\/assets\/journey-interface[^\n]+\n<link rel="stylesheet" href="\/assets\/navigation[^\n]+/,
  '<style data-journey-styles>\n'+styles+'\n</style>');
 replace('ui',/<script src="\/assets\/visitor[^>]+><\/script>/,`<script src="/assets/${bundles.ui.file}" defer fetchpriority="high"></script>`);
 replace('entry',/<script src="\/assets\/three[\s\S]*?<script src="\/assets\/journey-scene[^>]+><\/script>/,
  `<script src="/assets/three.min.js?v=160" defer fetchpriority="high"></script>\n<script src="/assets/${bundles.entry.file}" defer fetchpriority="high"></script>`);
 html=html.replace(/<script src="\/assets\/journey-interface[^>]+><\/script>/g,'');
 // Hidden visitor-room decorations should not compete with the entrance.
 html=html.replace('class="vr-illustration" src=','class="vr-illustration" loading="lazy" fetchpriority="low" src=').replace('class="vr-wave" src=','class="vr-wave" loading="lazy" fetchpriority="low" src=');
 html=html.replace(/(class="vr-(?:illustration|wave)" loading="lazy" fetchpriority="low" )(?:loading="lazy" fetchpriority="low" )+/g,'$1');
 fs.writeFileSync(path.join(root,'dist/index.html'),html);
 const manifest={bundles,htmlBytes:Buffer.byteLength(html),htmlGzipBytes:zlib.gzipSync(html).length};fs.writeFileSync(path.join(assets,'journey-loading.json'),JSON.stringify(manifest,null,2)+'\n');
 // Published content-addressed files must remain available to cached HTML,
 // Safari back/forward restores, and in-flight visits from older deployments.
 const retainedBundles=fs.readdirSync(assets).filter(file=>/^journey-(ui|entry|jungle)\.[a-f0-9]{12}\.js$/.test(file)).sort();
 const configPath=path.join(root,'vercel.json'),config=JSON.parse(fs.readFileSync(configPath,'utf8'));
 config.headers=config.headers.filter(rule=>!/^\/assets\/journey-(ui|entry|jungle)\.[a-f0-9]{12}\.js$/.test(rule.source));
 for(const file of retainedBundles)config.headers.unshift({source:'/assets/'+file,headers:[{key:'Cache-Control',value:'public, max-age=31536000, immutable'}]});
 fs.writeFileSync(configPath,JSON.stringify(config,null,2)+'\n');
 console.log(JSON.stringify(manifest,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
