/* One progress owner for intro, Next, gestures, and reverse navigation. No timers or RAF. */
(function(scope){
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const ease=t=>t*t*(3-2*t);
  const introSpeed=1.2;
  function createJourneyGuide({stops,reducedMotion=false,initialProgress=null}){
    const points=()=>[...stops(),1];
    const first=stops()[0];
    let progress=Number.isFinite(initialProgress)?clamp(initialProgress,0,1):0;
    let index=progress>=first-.006?points().reduce((best,n,i,all)=>Math.abs(n-progress)<Math.abs(all[best]-progress)?i:best,0):-1;
    let mode=index<0?'intro':'idle',ready=false,skipPending=false,transition=null;
    let introFrom=progress,introElapsed=0,motionVeil=0;
    const introDuration=Math.max(1,11/introSpeed*(first-progress)/first);
    const chargeEnd=Math.max(progress,Math.min(.17,first));
    const chargeDuration=Math.min(introDuration,3*(chargeEnd-progress)/.17);
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
            let remaining=dt;
            if(introElapsed<chargeDuration){
              const step=Math.min(remaining,chargeDuration-introElapsed);
              introElapsed+=step;remaining-=step;
              progress=introFrom+(chargeEnd-introFrom)*ease(introElapsed/chargeDuration);
              if(introElapsed<chargeDuration)return state();
            }
            // Begin a gentle approach immediately. A slower
            // phone can prepare here without freezing halfway through a move.
            if(!ready)return state();
            introElapsed=Math.min(introDuration,introElapsed+remaining);
            const travelDuration=Math.max(.001,introDuration-chargeDuration);
            progress=chargeEnd+(stops()[0]-chargeEnd)*ease((introElapsed-chargeDuration)/travelDuration);
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
