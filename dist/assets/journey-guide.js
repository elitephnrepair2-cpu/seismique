/* One progress owner for intro, Next, gestures, and reverse navigation. No timers or RAF. */
(function(scope){
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const ease=t=>t*t*(3-2*t);
  const travelSpeed=1.2;
  function createJourneyGuide({stops,reducedMotion=false,initialProgress=null}){
    const points=()=>[...stops(),1];
    const first=stops()[0];
    let progress=Number.isFinite(initialProgress)?clamp(initialProgress,0,1):0;
    let index=progress>=first-.006?points().reduce((best,n,i,all)=>Math.abs(n-progress)<Math.abs(all[best]-progress)?i:best,0):-1;
    let mode=index<0?'intro':'idle',ready=false,skipPending=false,transition=null;
    let introFrom=progress,introElapsed=0;
    const introDuration=Math.max(1,11/travelSpeed*(first-progress)/first);
    function state(){return {progress,target:mode==='intro'?stops()[0]:points()[index],index,mode,busy:mode!=='idle',skipPending,ready};}
    function settle(i){index=i;progress=points()[i];mode='idle';transition=null;skipPending=false;}
    return {
      state,
      skip(){if(mode!=='intro')return false;skipPending=true;if(ready)settle(0);return true;},
      advance(direction=1){
        if(mode!=='idle'||!ready)return false;
        const next=clamp(index+Math.sign(direction),0,points().length-1);
        if(next===index)return false;
        index=next;mode='transition';
        transition={from:progress,elapsed:0,duration:clamp(Math.abs(points()[index]-progress)/.055,1.4,2.6)/travelSpeed};
        return true;
      },
      tick(seconds,{sceneReady=true,introPlaying=true}={}){
        ready=sceneReady;
        const dt=clamp(seconds,0,.05);
        if(!ready&&mode!=='intro'){progress=Math.min(progress,.26);return state();}
        if(mode==='intro'){
          if((skipPending||reducedMotion)&&ready){settle(0);return state();}
          if(introPlaying&&!skipPending){
            const nextElapsed=Math.min(introDuration,introElapsed+dt);
            const next=introFrom+(stops()[0]-introFrom)*ease(nextElapsed/introDuration);
            // Wait before the tunnel crossing until geometry and shaders are warm.
            if(ready||next<=.26){introElapsed=nextElapsed;progress=next;}
            if(introElapsed===introDuration&&ready)settle(0);
          }
        }else if(mode==='transition'&&ready){
          if(reducedMotion){settle(index);return state();}
          transition.elapsed=Math.min(transition.duration,transition.elapsed+dt);
          progress=transition.from+(points()[index]-transition.from)*ease(transition.elapsed/transition.duration);
          if(transition.elapsed===transition.duration)settle(index);
        }else if(mode==='idle'&&ready){progress=points()[index];}
        return state();
      }
    };
  }
  scope.createJourneyGuide=createJourneyGuide;
  if(typeof module!=='undefined')module.exports={createJourneyGuide};
})(typeof window!=='undefined'?window:globalThis);
