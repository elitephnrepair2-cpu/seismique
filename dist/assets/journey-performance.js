/* Small runtime budget and a demand-driven loop. Camera timing stays independent. */
(function(scope){
  'use strict';
  function createJourneyPerformance({compact=false,touch=false,cores=8,memory=8,pixelRatio=1,width=390,height=844}={}){
    const constrained=compact||touch||cores<=4||memory<=4;
    // Large touch screens need a smaller per-frame budget than phones. This
    // also covers iPad Safari's desktop presentation without guessing its model.
    const economy=constrained&&(cores<=4||(touch&&Math.min(width,height)>=600));
    let area=Math.max(1,width*height),ceiling,floor;
    const upperPixels=economy?1200000:constrained?1600000:3000000,lowerPixels=economy?450000:constrained?900000:1600000;
    function limits(){ceiling=Math.min(pixelRatio,constrained?1.75:1.8,Math.sqrt(upperPixels/area));floor=Math.min(ceiling,economy?.9:constrained?1.25:.9,Math.sqrt(lowerPixels/area));}
    limits();
    let ratio=Math.min(ceiling,constrained?1.5:ceiling,Math.sqrt((economy?800000:constrained?1200000:2600000)/area)),elapsed=0,frames=0,slow=0,fast=0,cooldown=0,effectsLevel=economy?1:0;
    const budget={compact:constrained,economy,ratio,density:constrained?.65:1,arcs:constrained?2:3,mistRange:constrained?28:40,effectsLevel,effectsHz:constrained?30:60};
    function refresh(){
      budget.ratio=ratio;budget.effectsLevel=effectsLevel;
      budget.density=(constrained?.65:1)*[1,.75,.5][effectsLevel]*(ratio<ceiling-.1?.8:1);
      budget.arcs=effectsLevel||ratio<ceiling-.1?1:constrained?2:3;
      budget.effectsHz=constrained?[30,24,20][effectsLevel]:[60,30,24][effectsLevel];
      budget.mistRange=(constrained?28:40)*[1,.85,.7][effectsLevel];
    }
    if(economy)refresh();
    function reset(){elapsed=frames=slow=fast=0;cooldown=.75;}
    return {budget,reset,resize(w,h){area=Math.max(1,w*h);limits();const next=Math.max(floor,Math.min(ceiling,ratio));if(Math.abs(next-ratio)<.001)return false;ratio=next;refresh();return true;},sample(seconds){
      // Measure from the first portal frame, before the jungle is ready.
      // A suspended tab is excluded; consistently slow frames still count.
      if(!Number.isFinite(seconds)||seconds<=0||seconds>1){reset();return false;}
      cooldown=Math.max(0,cooldown-seconds);elapsed+=seconds;frames++;
      if(elapsed<(economy?.5:.75))return false;
      const average=elapsed/frames;elapsed=frames=0;
      slow=average>(economy?.024:.028)?slow+1:0;fast=average<.019?fast+1:0;
      let next=ratio;
      // Shed decorative work before sacrificing crispness. Keep shader light
      // counts fixed: changing those during travel would trigger recompilation.
      if(!cooldown&&(average>.066||slow>=2)){
        if(effectsLevel<2){effectsLevel++;refresh();reset();cooldown=economy?.5:1.5;return true;}
        next=Math.max(floor,ratio-(average>.066?.20:.15));
      }else if(!cooldown&&fast>=27){
        if(ratio<ceiling-.001)next=Math.min(ceiling,ratio+.10);
        else if(effectsLevel>0){effectsLevel--;refresh();reset();cooldown=6;return true;}
      }
      if(Math.abs(next-ratio)<.001)return false;
      const lowering=next<ratio;ratio=next;refresh();reset();cooldown=lowering?(economy?.5:1.5):6;return true;
    }};
  }
  function createJourneyCadence(hz=30){
    let interval=1/hz,phase=0,total=0;
    return {setHz(value){interval=1/Math.max(1,value);phase=Math.min(phase,interval);},consume(seconds,force=false){
      total+=seconds;phase+=seconds;
      if(!force&&phase+1e-7<interval)return null;
      const delta=total;total=0;phase=force?0:Math.max(0,phase-Math.floor((phase+1e-7)/interval)*interval);return delta;
    }};
  }
  function createJourneyLoop({request,cancel,render}){
    let id=null,visible=true,disposed=false,last=null;
    function tick(now){
      id=null;if(!visible||disposed)return;
      const elapsed=last===null?0:Math.max(0,(now-last)/1000);last=now;
      if(render(Math.min(.05,elapsed),now,elapsed)!==false)wake();else last=null;
    }
    function wake(){if(visible&&!disposed&&id===null)id=request(tick);}
    return {wake,setVisible(value){
      visible=Boolean(value);last=null;
      if(!visible&&id!==null){cancel(id);id=null;}
      if(visible)wake();
    },dispose(){disposed=true;if(id!==null)cancel(id);id=null;last=null;}};
  }
  scope.createJourneyPerformance=createJourneyPerformance;scope.createJourneyLoop=createJourneyLoop;scope.createJourneyCadence=createJourneyCadence;
  if(typeof module!=='undefined')module.exports={createJourneyPerformance,createJourneyLoop,createJourneyCadence};
})(typeof window!=='undefined'?window:globalThis);
