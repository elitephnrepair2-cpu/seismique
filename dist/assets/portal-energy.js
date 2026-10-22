/* A bounded, deterministic discharge score. The caller owns its pausable clock. */
(function(scope){
  'use strict';
  const duration=7.6;
  const clamp=x=>Math.max(0,Math.min(1,x));
  const smooth=(a,b,x)=>{const q=clamp((x-a)/(b-a));return q*q*(3-2*q);};
  function createPortalEnergyTimeline({reducedMotion=false,seed=8241}={}){
    let state=seed>>>0,lastHead=0,nextIdle=8.3,lastTime=-1;
    const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
    const events=[];
    function add(start,type,strength=1){
      const head=(lastHead+2+Math.floor(random()*6))%9;lastHead=head;
      const lengths={snap:.16+random()*.11,branch:.34+random()*.17,bridge:.24+random()*.15,crawl:.57+random()*.25,surge:.72};
      events.push({start,type,head,target:(head+2+Math.floor(random()*4))%9,duration:lengths[type],strength,width:(type==='surge'?.14:type==='snap'?.06:.08)+random()*.035,turn:(random()-.5)*1.4,reach:.38+random()*.62,seed:random()*900,age:0,power:0});
    }
    function reset(){
      state=seed>>>0;lastHead=0;nextIdle=8.3;events.length=0;
      [[.65,'crawl',.18],[1.36,'snap',.34],[1.95,'snap',.48],[2.52,'bridge',.58],[3.08,'branch',.72],[3.56,'crawl',.58],[4.16,'surge',1],[4.98,'snap',.52],[5.38,'bridge',.57],[5.78,'surge',1.14],[6.86,'crawl',.44]].forEach(e=>add(...e));
    }
    reset();
    const output={stage:'quiet',ready:false,power:0,formation:0,charge:0,instability:0,surge:0,reaction:0,events:[]};
    function sample(time){
      if(time<lastTime)reset();lastTime=time;
      output.events.length=0;output.surge=0;output.reaction=0;
      if(reducedMotion){Object.assign(output,{stage:'ready',ready:true,power:1,formation:1,charge:.16,instability:0});return output;}
      while(nextIdle<time+1.8){
        const roll=random(),type=roll<.34?'snap':roll<.58?'crawl':roll<.83?'branch':'bridge';
        add(nextIdle,type,.38+random()*.31);nextIdle+=.86+random()*1.15;
      }
      while(events.length&&events[0].start+events[0].duration<time-1)events.shift();
      for(const e of events){
        const age=time-e.start;if(age<0||age>=e.duration)continue;
        const u=age/e.duration;
        // A single rise and decay: no fast on/off oscillation or full-room strobe.
        e.age=u;e.power=smooth(0,e.type==='snap'?.18:.16,u)*(1-smooth(e.type==='surge'?.28:.23,1,u))*e.strength;
        if(output.events.length<3)output.events.push(e);
        output.reaction=Math.max(output.reaction,e.power*(e.type==='surge'?.8:e.type==='branch'?.28:.16));
        if(e.type==='surge')output.surge=e.power;
      }
      const unstable=smooth(3.3,3.7,time)*(1-smooth(6.1,7.35,time));
      const drop=(smooth(4.87,5.02,time)*(1-smooth(5.06,5.29,time))+.7*smooth(6.54,6.63,time)*(1-smooth(6.65,6.88,time)))*.12;
      output.stage=time<.65?'quiet':time<1.95?'priming':time<3.56?'charging':time<6.5?(output.surge>.45?'surge':'unstable'):time<duration?'stabilizing':'ready';
      output.ready=time>=duration;
      output.power=clamp((.015+.985*smooth(.5,6.8,time))*(1-drop)+output.surge*.12);
      output.formation=clamp(smooth(2.3,7.15,time)*(1-drop*.65));
      output.charge=(.16+.84*smooth(1.6,4.1,time))*(1-.82*smooth(6.0,duration,time));
      output.instability=unstable*(.45+.2*Math.sin(time*5.2))+output.surge*.28;
      return output;
    }
    return {sample,duration};
  }
  scope.createPortalEnergyTimeline=createPortalEnergyTimeline;
  if(typeof module!=='undefined')module.exports={createPortalEnergyTimeline};
})(typeof window!=='undefined'?window:globalThis);
