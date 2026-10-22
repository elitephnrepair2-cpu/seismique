/* A bounded, damped camera drive: continuous across swipes, with no bounce. */
(()=>{
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  window.createJourneyMotion=()=>{
    let velocity=0;
    return {
      reset(){velocity=0;},
      advance(current,target,elapsed,reduced=false){
        target=clamp(target,0,1);
        if(reduced){velocity=0;return target;}
        // A delayed frame must not catch up in one large visible camera jump.
        const dt=clamp(elapsed,0,.05),steps=Math.max(1,Math.ceil(dt*120)),h=dt/steps;
        for(let i=0;i<steps;i++){
          const error=target-current;
          if(Math.abs(error)<.000001&&Math.abs(velocity)<.00001){current=target;velocity=0;break;}
          const t=clamp((current-.52)/.10,0,1),blend=t*t*(3-2*t);
          const speed=.24+(.044-.24)*blend,acceleration=.85+(.20-.85)*blend;
          velocity+=clamp(144*error-24*velocity,-acceleration,acceleration)*h;
          velocity=clamp(velocity,-speed,speed);
          const step=velocity*h;
          if(step*error>0&&Math.abs(step)>=Math.abs(error)){current=target;velocity=0;}
          else current=clamp(current+step,0,1);
        }
        return current;
      }
    };
  };
})();
