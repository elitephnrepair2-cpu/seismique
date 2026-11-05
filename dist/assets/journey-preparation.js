/* Idle work has a bounded timer fallback, including after Safari page restores. */
(function(scope){
  function createPreparationScheduler({idle=scope.requestIdleCallback?.bind(scope),cancelIdle=scope.cancelIdleCallback?.bind(scope),schedule=scope.setTimeout?.bind(scope)||setTimeout,cancel=scope.clearTimeout?.bind(scope)||clearTimeout}={}){
    let pending=null;
    function stop(){if(!pending)return;const work=pending;pending=null;if(work.idle!==null)cancelIdle?.(work.idle);if(work.timer!==null)cancel(work.timer);}
    return {get pending(){return pending!==null;},cancel:stop,schedule(task,{urgent=false}={}){
      if(pending)return pending;
      const work={idle:null,timer:null};pending=work;
      function run(deadline){if(pending!==work)return;stop();task(deadline);}
      // Without requestIdleCallback, Safari already clamps repeated timers.
      // Do not add a further 16 ms sleep to every small preparation slice.
      // Covered startup work yields to input without waiting for an idle frame.
      // Once the tour is visible, preserve the small background-work budget.
      work.timer=schedule(()=>run({didTimeout:true,timeRemaining:()=>0}),idle&&!urgent?16:0);
      if(idle&&!urgent)work.idle=idle(run,{timeout:32});
      return work;
    }};
  }
  scope.createPreparationScheduler=createPreparationScheduler;
  scope.waitForPreparationSlot=options=>new Promise(resolve=>createPreparationScheduler().schedule(resolve,options));
  if(typeof module!=='undefined')module.exports={createPreparationScheduler};
})(typeof window!=='undefined'?window:globalThis);
