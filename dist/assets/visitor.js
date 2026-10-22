(()=>{
  const root=document.getElementById('seismique-jungle-reveal');
  if(!root)return;
  const menuButton=root.querySelector('.menu-toggle'),menu=root.querySelector('.menu-panel');
  if(!menuButton||!menu)return;
  const routes=['exhibits','mini-golf','parties','whats-happening','plan-your-visit'];
  const planning=['tickets','hours-location','parking','accessibility','faqs','contact','policies'];
  const aliases={'coming-soon':'/whats-happening/#upcoming',calendar:'/whats-happening/#calendar','artists-team':'/exhibits/#meet-artists',overview:'/',museum:'/exhibits/'};
  const inTour=!!root.querySelector('.tour-view');
  const urlFor=id=>inTour&&id==='plan-your-visit'?'#visit-room':id==='tour'?'/':aliases[id]|| (planning.includes(id)?'/plan-your-visit/#'+id:routes.includes(id)?'/'+id+'/':null);
  function closeMenu(){root.dataset.menuOpen='false';menu.hidden=true;menuButton.setAttribute('aria-expanded','false');}
  menuButton.addEventListener('click',()=>{const opening=menu.hidden;root.dataset.menuOpen=String(opening);menu.hidden=!opening;menuButton.setAttribute('aria-expanded',String(opening));root.tourControls?.pause();});
  root.closeNavigation=closeMenu;
  document.addEventListener('click',event=>{if(!event.target.closest('.menu-panel,.menu-toggle'))closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){event.preventDefault();closeMenu();menuButton.focus();}});
  function remember(){if(!inTour)return;root.tourControls?.pause();const progress=root.navigationState?.().progress;if(Number.isFinite(progress)){try{sessionStorage.setItem('seismique-jungle-progress',String(progress));}catch{}}}
  root.querySelectorAll('a[href^="#"]').forEach(a=>{
    if(!inTour&&document.getElementById(a.hash.slice(1)))return;
    const url=urlFor(a.hash.slice(1));if(url)a.href=url;
  });
  if(!inTour)root.querySelectorAll('.direct-nav a').forEach(a=>{if(a.pathname===location.pathname)a.setAttribute('aria-current','page');});
  root.addEventListener('click',event=>{if(event.target.closest('a')){remember();closeMenu();}});
  root.visitorNavigation={open(id){const url=urlFor(id);if(url){remember();closeMenu();if(url==='#visit-room'&&root.visitRoom)root.visitRoom.open();else location.assign(url);}}};
  window.addEventListener('pagehide',remember);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)root.tourControls?.pause();});
  if(inTour){
    if(new URLSearchParams(location.search).has('resume')){try{const value=Number(sessionStorage.getItem('seismique-jungle-progress'));if(Number.isFinite(value)&&value>0)root.resumeProgress=Math.min(1,Math.max(0,value));}catch{}}
    const legacy=location.hash.slice(1);if(legacy&&legacy!=='tour'&&legacy!=='visit-room'&&legacy!=='site-footer'){const url=urlFor(legacy);if(url)location.replace(url);}
  }
})();
