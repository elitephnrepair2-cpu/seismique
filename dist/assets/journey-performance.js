/* Small runtime budget and a demand-driven loop. Camera timing stays independent. */
(function(scope){
  'use strict';
  function createJourneyPerformance({compact=false,cores=8,memory=8,pixelRatio=1}={}){
    const constrained=compact||cores<=4||memory<=4;
    const ceiling=Math.min(pixelRatio,constrained?1.15:1.8),floor=Math.min(ceiling,.9);
    let ratio=ceiling,elapsed=0,frames=0,slow=0,fast=0,cooldown=0;
    const budget={compact:constrained,ratio,density:constrained?.65:1,arcs:constrained?2:3,mistRange:constrained?28:40};
    function reset(){elapsed=frames=slow=fast=0;cooldown=2;}
    return {budget,reset,sample(seconds){
      // Ignore suspension gaps, but include genuinely slow phones in adaptation.
      if(!Number.isFinite(seconds)||seconds<=0||seconds>1){reset();return false;}
      cooldown=Math.max(0,cooldown-seconds);elapsed+=seconds;frames++;
      if(elapsed<2)return false;
      const average=elapsed/frames;elapsed=frames=0;
      slow=average>.028?slow+1:0;fast=average<.019?fast+1:0;
      let next=ratio;
      if(!cooldown&&slow>=2)next=Math.max(floor,ratio-.15);
      else if(!cooldown&&fast>=10)next=Math.min(ceiling,ratio+.10);
      if(Math.abs(next-ratio)<.001)return false;
      ratio=next;budget.ratio=ratio;
      budget.density=(constrained?.65:1)*(ratio<ceiling-.1?.8:1);
      budget.arcs=ratio<ceiling-.1?1:constrained?2:3;
      reset();cooldown=6;return true;
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
  scope.createJourneyPerformance=createJourneyPerformance;scope.createJourneyLoop=createJourneyLoop;
  if(typeof module!=='undefined')module.exports={createJourneyPerformance,createJourneyLoop};
})(typeof window!=='undefined'?window:globalThis);
