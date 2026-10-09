(()=>{
  const root=document.getElementById('seismique-jungle-reveal');
  const menuButton=root.querySelector('.menu-toggle'),menu=root.querySelector('.menu-panel');
  const routes=['overview','exhibits','museum','mini-golf','parties','plan-your-visit','coming-soon','calendar','artists-team'];
  const planning=['tickets','hours-location','accessibility','faqs'];
  const urlFor=id=>id==='tour'?'/?resume=1#tour':planning.includes(id)?'/plan-your-visit/#'+id:routes.includes(id)?'/'+id+'/':null;
  const inTour=!!root.querySelector('.tour-view');
  function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');}
  menuButton.addEventListener('click',()=>{const opening=menu.hidden;menu.hidden=!opening;menuButton.setAttribute('aria-expanded',String(opening));root.tourControls?.pause();});
  document.addEventListener('click',event=>{if(!event.target.closest('.menu-panel,.menu-toggle'))closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){event.preventDefault();closeMenu();menuButton.focus();}});
  function remember(){if(!inTour)return;root.tourControls?.pause();const progress=root.navigationState?.().progress;if(Number.isFinite(progress)){try{sessionStorage.setItem('seismique-jungle-progress',String(progress));}catch{}}}
  root.querySelectorAll('a[href^="#"]').forEach(a=>{const url=urlFor(a.hash.slice(1));if(url)a.href=url;});
  root.querySelectorAll('.direct-nav a').forEach(a=>{if(a.pathname===location.pathname)a.setAttribute('aria-current','page');});
  root.addEventListener('click',event=>{if(event.target.closest('a'))remember();if(event.target.closest('a[href="#site-footer"]'))closeMenu();});
  root.visitorNavigation={open(id){const url=urlFor(id);if(url){remember();location.assign(url);}}};
  window.addEventListener('pagehide',remember);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)root.tourControls?.pause();});
  if(inTour){
    if(new URLSearchParams(location.search).has('resume')){try{const value=Number(sessionStorage.getItem('seismique-jungle-progress'));if(Number.isFinite(value)&&value>0)root.resumeProgress=Math.min(1,Math.max(0,value));}catch{}}
    const legacy=location.hash.slice(1);if(legacy&&legacy!=='tour'){const url=urlFor(legacy);if(url)location.replace(url);}
  }
})();
