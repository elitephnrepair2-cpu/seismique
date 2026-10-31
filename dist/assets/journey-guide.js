/* One progress owner for intro, Next, gestures, and reverse navigation. No timers or RAF. */
(function(scope){
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const ease=t=>t*t*(3-2*t);
  const introSpeed=1.2;
  // One continuous camera curve: a gentle launch and a settled destination.
  const introEase=t=>ease(t)+.22*t*(1-t)*(1-t);
  function createJourneyGuide({stops,reducedMotion=false,initialProgress=null}){
    const points=()=>[...stops(),1];
    const first=stops()[0];
    let progress=Number.isFinite(initialProgress)?clamp(initialProgress,0,1):0;
    let index=progress>=first-.006?points().reduce((best,n,i,all)=>Math.abs(n-progress)<Math.abs(all[best]-progress)?i:best,0):-1;
    let mode=index<0?'intro':'idle',ready=false,skipPending=false,transition=null;
    let introFrom=progress,introElapsed=0,introRate=1,readyElapsed=0,motionVeil=0;
    const introDuration=Math.max(1,11/introSpeed*(first-progress)/first);
    const safeEnd=Math.max(progress,Math.min(.26,first));
    let lo=0,hi=1;
    for(let i=0;i<32;i++){const t=(lo+hi)/2;if(introEase(t)<(safeEnd-progress)/(first-progress||1))lo=t;else hi=t;}
    const safeElapsed=introDuration*(lo+hi)/2;
    function state(){return {progress,target:mode==='intro'?stops()[0]:points()[index],index,mode,busy:mode!=='idle',skipPending,ready,motionVeil};}
    function settle(i){index=i;progress=points()[i];mode='idle';transition=null;skipPending=false;motionVeil=0;}
    return {
      state,
      skip(){if(mode!=='intro')return false;skipPending=true;if(ready)settle(0);return true;},
      advance(direction=1){
        if(mode!=='idle'||!ready)return false;
        const next=clamp(index+Math.sign(direction),0,points().length-1);
        if(next===index)return false;
        index=next;mode='transition';
        transition={from:progress,elapsed:0,duration:reducedMotion?1:clamp(Math.abs(points()[index]-progress)/.055,1.4,2.6)};
        return true;
      },
      tick(seconds,{sceneReady=true,introPlaying=true}={}){
        ready=sceneReady;
        const dt=clamp(seconds,0,.05);
        if(!ready&&mode!=='intro'){progress=Math.min(progress,.26);return state();}
        if(mode==='intro'){
          if(skipPending&&ready){settle(0);return state();}
          if(reducedMotion){
            // A still entrance and a quiet dissolve, rather than an instant jump.
            // Keep device accessibility preferences without hiding the opening.
            if(ready&&introPlaying){
              introElapsed=Math.min(1.6,introElapsed+dt);
              motionVeil=introElapsed<.6?0:Math.max(0,1-Math.abs((introElapsed-.6)-.5)/.5);
              if(introElapsed>=1.1)progress=stops()[0];
              if(introElapsed>=1.6)settle(0);
            }
            return state();
          }
          if(introPlaying&&!skipPending){
            // Slow the clock gently only if preparation is unusually late.
            // Do not finish one easing curve, stop, and launch a second one.
            // The camera stays on the lobby side of the threshold until ready.
            readyElapsed=ready?Math.min(.45,readyElapsed+dt):0;
            const safeRate=clamp((safeElapsed-introElapsed)/.8,0,1);
            const desiredRate=safeRate+(1-safeRate)*ease(readyElapsed/.45);
            introRate+=(desiredRate-introRate)*(1-Math.exp(-dt/.18));
            const limit=ready?introDuration:safeElapsed;
            introElapsed=Math.min(limit,introElapsed+dt*introRate);
            progress=introFrom+(stops()[0]-introFrom)*introEase(introElapsed/introDuration);
            if(introElapsed===introDuration)settle(0);
          }
        }else if(mode==='transition'&&ready){
          transition.elapsed=Math.min(transition.duration,transition.elapsed+dt);
          const amount=transition.elapsed/transition.duration;
          motionVeil=reducedMotion?1-Math.abs(amount*2-1):0;
          progress=reducedMotion?(amount<.5?transition.from:points()[index]):transition.from+(points()[index]-transition.from)*ease(amount);
          if(transition.elapsed===transition.duration)settle(index);
        }else if(mode==='idle'&&ready){progress=points()[index];}
        return state();
      }
    };
  }
  scope.createJourneyGuide=createJourneyGuide;
  if(typeof module!=='undefined')module.exports={createJourneyGuide};
})(typeof window!=='undefined'?window:globalThis);
