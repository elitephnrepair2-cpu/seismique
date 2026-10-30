/* One viewport; explicit journey/visitor-room modes and recoverable history. */
(()=>{
  const root=document.getElementById('seismique-jungle-reveal');
  const room=document.getElementById('visit-room');
  if(!root||!room)return;
  const stage=root.querySelector('.scene'),scroller=room.querySelector('.vr-scroll');
  const finale=root.querySelector('.journey-finale');
  const finish=root.querySelector('.journey-finish'),cue=root.querySelector('.journey-cue'),progress=root.querySelector('.journey-progress');
  const cueDevice=matchMedia('(pointer:coarse), (max-width:700px)');
  const controls=root.querySelector('.destination-controls'),next=root.querySelector('.destination-next'),nextLabel=next.querySelector('[data-next-label]'),gesture=root.querySelector('#destination-gesture'),announcement=root.querySelector('.journey-announcement');
  const labels=['Immersive Museum','Glow Mini Golf','Parties & Events','What’s Happening'];
  let returnFocus=stage,lastPercent=-1,lastDestination=-2,roomScroll=0;
  function open({history=true}={}){
    if(room.open)return;
    root.tourControls?.pause();returnFocus=document.activeElement;root.closeNavigation?.();
    root.dataset.visitOpen='true';
    room.dataset.effectsPaused=String(matchMedia('(prefers-reduced-motion: reduce)').matches);
    room.showModal();scroller.scrollTop=roomScroll;
    room.querySelector('.vr-return').focus({preventScroll:true});
    if(history&&location.hash!=='#visit-room')window.history.pushState({seismiqueVisitRoom:true},'', '#visit-room');
  }
  function hide(){
    if(!room.open)return;
    roomScroll=scroller.scrollTop;room.close();root.dataset.visitOpen='false';
    const focus=returnFocus?.isConnected&&returnFocus.getClientRects().length&&!returnFocus.closest('[hidden]')?returnFocus:root.querySelector('.menu-toggle');
    focus.focus({preventScroll:true});
  }
  function close(){
    hide();
    if(window.history.state?.seismiqueVisitRoom)window.history.back();
    else if(location.hash==='#visit-room')window.history.replaceState(null,'','#tour');
  }
  root.visitRoom={open,close};
  room.querySelector('[data-close-visit]').addEventListener('click',close);
  room.addEventListener('cancel',event=>{event.preventDefault();close();});
  room.addEventListener('close',()=>{root.dataset.visitOpen='false';});
  finish.addEventListener('click',()=>open());
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href="#visit-room"],a[href="#site-footer"]');
    if(!link||!root.contains(link))return;
    event.preventDefault();open();
  });
  room.querySelectorAll('.vr-jumplinks a').forEach(link=>link.addEventListener('click',event=>{
    if(link.getAttribute('href')?.startsWith('#')!==true)return;
    const destination=room.querySelector(link.hash);if(!destination)return;
    event.preventDefault();if(destination.tagName==='DETAILS')destination.open=true;
    destination.scrollIntoView({block:'start',behavior:'instant'});
    const focusTarget=destination.querySelector('summary,h2')||destination;
    focusTarget.setAttribute('tabindex','-1');focusTarget.focus({preventScroll:true});
  }));
  room.querySelector('[data-show-terms]').addEventListener('click',()=>{
    const terms=room.querySelector('#vr-terms');terms.open=true;terms.scrollIntoView({block:'end',behavior:'instant'});terms.querySelector('summary').focus({preventScroll:true});
  });
  window.addEventListener('popstate',()=>{if(location.hash==='#visit-room')open({history:false});else hide();});
  window.addEventListener('hashchange',()=>{if(location.hash==='#visit-room')open({history:false});else if(room.open)hide();});
  if(['#visit-room','#site-footer'].includes(location.hash)){
    window.history.replaceState(null,'','#visit-room');open({history:false});
  }
  root.journeyInterface={update(value,atEnd,state){
    const percent=Math.round(value*100);
    if(percent!==lastPercent){progress.setAttribute('aria-valuenow',String(percent));progress.style.setProperty('--journey-progress',value);lastPercent=percent;}
    // Start the invitation as the camera settles; hide it fully when reversing.
    const arriving=value>=.94;
    finish.hidden=!arriving;finale.hidden=!arriving;
    const arrival=Math.max(0,Math.min(1,(value-.94)/.045));
    finale.style.opacity=String(arrival*arrival*(3-2*arrival));
    finale.inert=arrival<.45;
    const browsing=state.ready&&state.mode!=='intro'&&state.index<labels.length;
    controls.hidden=!browsing;
    next.setAttribute('aria-disabled',String(state.busy||!state.ready));
    const label=state.busy?'MOVING…':state.index===labels.length-1?'PLAN YOUR VISIT':'NEXT: '+(labels[state.index+1]||labels[0]).toUpperCase();
    if(nextLabel.textContent!==label)nextLabel.textContent=label;
    gesture.textContent=cueDevice.matches?'or swipe up':'or scroll';
    gesture.hidden=state.busy;
    // One gesture cue, located with Next; the entrance and finale need no duplicate.
    cue.hidden=true;
    if(atEnd&&root.focusFinaleOnArrival){root.focusFinaleOnArrival=false;finale.querySelector('.finale-ticket').focus({preventScroll:true});}
    if(state.mode==='idle'&&state.ready&&state.index!==lastDestination){
      announcement.textContent=atEnd?'Your digital journey is complete. Now step inside.':labels[state.index]+'. '+label+'.';
      lastDestination=state.index;
    }

  }};
})();
