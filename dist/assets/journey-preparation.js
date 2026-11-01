/* Idle work has a bounded timer fallback, including after Safari page restores. */
(function(scope){
  function createPreparationScheduler({idle=scope.requestIdleCallback?.bind(scope),cancelIdle=scope.cancelIdleCallback?.bind(scope),schedule=scope.setTimeout?.bind(scope)||setTimeout,cancel=scope.clearTimeout?.bind(scope)||clearTimeout}={}){
    let pending=null;
    function stop(){if(!pending)return;const work=pending;pending=null;if(work.idle!==null)cancelIdle?.(work.idle);if(work.timer!==null)cancel(work.timer);}
    return {get pending(){return pending!==null;},cancel:stop,schedule(task){
      if(pending)return pending;
      const work={idle:null,timer:null};pending=work;
      function run(deadline){if(pending!==work)return;stop();task(deadline);}
      work.timer=schedule(()=>run({didTimeout:true,timeRemaining:()=>0}),16);
      if(idle)work.idle=idle(run,{timeout:32});
      return work;
    }};
  }
  scope.createPreparationScheduler=createPreparationScheduler;
  scope.waitForPreparationSlot=()=>new Promise(resolve=>createPreparationScheduler().schedule(resolve));
  if(typeof module!=='undefined')module.exports={createPreparationScheduler};
})(typeof window!=='undefined'?window:globalThis);
