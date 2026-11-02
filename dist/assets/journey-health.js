/* Bounded, local-only diagnostics and a recovery path independent of WebGL. */
(function(scope){
  function createJourneyHealth({now=()=>performance.now(),stallMs=30000,onRecovery=()=>{},onSample=()=>{},onChange=()=>{}}={}){
    let last=now(),quiet=0,activeMs=0,key='',recovering=false,reason='',complete=false;
    let seconds=0,frames=0,slowFrames=0,longest=0;
    const events=[],samples=[];
    function event(type,value){events.push({at:Math.round(activeMs),type,value});if(events.length>24)events.shift();onChange();}
    const api={
      tick({active=true,stage='',progress=0,complete:done=false,waiting=false}={}){
        const time=now(),delta=Math.max(0,Math.min(2000,time-last));last=time;
        if(!active)return;
        activeMs+=delta;
        const next=stage+':'+Math.floor(progress*100);
        if(next!==key){key=next;quiet=0;event('stage',next);}else quiet+=delta;
        if(done&&!complete){complete=true;event('first-destination','ready');}
        if(done&&!waiting){quiet=0;if(recovering&&['stalled','download'].includes(reason)){recovering=false;reason='';event('recovered','ready');}}
        else if(quiet>=stallMs&&!recovering)api.fail('stalled');
      },
      fail(code){if(recovering&&(reason===code||reason==='graphics'))return;recovering=true;reason=code;event('recovery',code);onRecovery(code);},
      frame(dt){
        if(!Number.isFinite(dt)||dt<=0||dt>1){seconds=frames=slowFrames=longest=0;return;}
        seconds+=dt;frames++;if(dt>.05)slowFrames++;longest=Math.max(longest,dt);
        if(seconds<2)return;
        const sample={fps:Math.round(frames/seconds),slowFrames,maxFrameMs:Math.round(longest*1000)};
        samples.push(sample);if(samples.length>12)samples.shift();seconds=frames=slowFrames=longest=0;onSample(sample);onChange();
      },
      snapshot(){return {version:1,activeMs:Math.round(activeMs),complete,recovering,reason,events:events.map(e=>({...e})),samples:samples.map(s=>({...s}))};}
    };
    return api;
  }
  scope.createJourneyHealth=createJourneyHealth;
  if(typeof module!=='undefined')module.exports={createJourneyHealth};
  if(!scope.document)return;
  const root=document.getElementById('seismique-jungle-reveal');if(!root?.querySelector('.tour-view'))return;
  const notice=root.querySelector('.error'),loading=root.querySelector('.loading-portal');
  let noticeCode='',lastSaved=-Infinity,latestProgress=0,latestMode='intro',lastSample=null;
  const messages={stalled:'The tour is taking longer than expected. You can explore Seismique right away below.',graphics:'This device paused the 3D tour. You can keep exploring the website below.',download:'The tour download was interrupted. You can still explore the website below.',preparation:'The 3D tour could not finish preparing. You can still explore the website below.'};
  function showRecovery(code){
    noticeCode=code;root.dataset.recovery=code;loading.hidden=true;
    const text=document.createElement('p');text.textContent=messages[code]||messages.preparation;
    const links=document.createElement('nav');links.setAttribute('aria-label','Continue without the 3D tour');
    for(const [label,href] of [['Explore Museum','/exhibits/'],['Glow Mini Golf','/mini-golf/'],['Plan Your Visit','/plan-your-visit/']]){
      const link=document.createElement('a');link.textContent=label;link.href=href;links.append(link);
    }
    const retry=document.createElement('button');retry.type='button';retry.textContent='Retry tour';retry.addEventListener('click',()=>location.reload());links.append(retry);
    notice.replaceChildren(text,links);notice.setAttribute('role','status');notice.hidden=false;
  }
  function save(force=false){
    if(!root.journeyHealth||(!force&&performance.now()-lastSaved<5000))return;
    lastSaved=performance.now();
    try{sessionStorage.setItem('seismique-journey-health',JSON.stringify({...health.snapshot(),renderScale:root.dataset.renderScale,effectsLevel:root.dataset.effectsLevel,sky:root.dataset.skyMode,lastSample}));}catch{}
  }
  const health=createJourneyHealth({onRecovery:showRecovery,onChange:()=>save(),onSample(sample){lastSample=sample;root.dataset.healthFps=String(sample.fps);root.dataset.healthMaxFrameMs=String(sample.maxFrameMs);}});
  root.journeyHealth={fail:code=>health.fail(code),frame(dt,progress,mode){latestProgress=progress;latestMode=mode;health.frame(dt);},snapshot:()=>health.snapshot()};
  function inspect(){
    const ds=root.dataset;
    health.tick({active:!document.hidden&&ds.menuOpen!=='true'&&ds.visitOpen!=='true',stage:[ds.entrancePreparation||'starting',ds.scenePreparation||'waiting',ds.distantPreparation||'waiting'].join('/'),progress:latestProgress,complete:latestMode!=='intro'&&ds.scenePreparation==='ready',waiting:ds.waitingForScenery==='true'});
    const report=health.snapshot();root.dataset.healthStatus=report.recovering?'recovery':report.complete?'ready':'starting';
    if(noticeCode&&!report.recovering){notice.hidden=true;noticeCode='';delete root.dataset.recovery;}
    save();
  }
  const timer=setInterval(inspect,1000);
  // Stop the clock while hidden; do not count time spent in another app as a stall.
  document.addEventListener('visibilitychange',()=>{health.tick({active:false});if(document.hidden)save(true);});
  root.addEventListener('webglcontextlost',()=>health.fail('graphics'),true);
  window.addEventListener('error',event=>{if(event.target?.tagName==='SCRIPT'&&/\/assets\/(?:journey-|three)/.test(event.target.src||''))health.fail('download');},true);
  window.addEventListener('pagehide',event=>{save(true);if(!event.persisted)clearInterval(timer);});
  window.addEventListener('pageshow',()=>health.tick({active:false}));
})(typeof window!=='undefined'?window:globalThis);
