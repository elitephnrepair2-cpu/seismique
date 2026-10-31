/* Small runtime budget and a demand-driven loop. Camera timing stays independent. */
(function(scope){
  'use strict';
  function createJourneyPerformance({compact=false,touch=false,cores=8,memory=8,pixelRatio=1,width=390,height=844}={}){
    const constrained=compact||touch||cores<=4||memory<=4;
    let area=Math.max(1,width*height),ceiling,floor;
    const upperPixels=constrained?1600000:3000000,lowerPixels=constrained?900000:1600000;
    function limits(){ceiling=Math.min(pixelRatio,constrained?1.75:1.8,Math.sqrt(upperPixels/area));floor=Math.min(ceiling,constrained?1.25:.9,Math.sqrt(lowerPixels/area));}
    limits();
    let ratio=Math.min(ceiling,constrained?1.5:ceiling,Math.sqrt((constrained?1200000:2600000)/area)),elapsed=0,frames=0,slow=0,fast=0,cooldown=0;
    const budget={compact:constrained,ratio,density:constrained?.65:1,arcs:constrained?2:3,mistRange:constrained?28:40};
    function refresh(){budget.ratio=ratio;budget.density=(constrained?.65:1)*(ratio<ceiling-.1?.8:1);budget.arcs=ratio<ceiling-.1?1:constrained?2:3;}
    function reset(){elapsed=frames=slow=fast=0;cooldown=.75;}
    return {budget,reset,resize(w,h){area=Math.max(1,w*h);limits();const next=Math.max(floor,Math.min(ceiling,ratio));if(Math.abs(next-ratio)<.001)return false;ratio=next;refresh();return true;},sample(seconds){
      // Measure from the first portal frame, before the jungle is ready.
      // A suspended tab is excluded; consistently slow frames still count.
      if(!Number.isFinite(seconds)||seconds<=0||seconds>1){reset();return false;}
      cooldown=Math.max(0,cooldown-seconds);elapsed+=seconds;frames++;
      if(elapsed<.75)return false;
      const average=elapsed/frames;elapsed=frames=0;
      slow=average>.028?slow+1:0;fast=average<.019?fast+1:0;
      let next=ratio;
      if(!cooldown&&(average>.066||slow>=2))next=Math.max(floor,ratio-(average>.066?.20:.15));
      else if(!cooldown&&fast>=27)next=Math.min(ceiling,ratio+.10);
      if(Math.abs(next-ratio)<.001)return false;
      const lowering=next<ratio;ratio=next;refresh();reset();cooldown=lowering?1.5:6;return true;
    }};
  }
  function createJourneyCadence(hz=30){
    const interval=1/hz;let phase=0,total=0;
    return {consume(seconds,force=false){
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
