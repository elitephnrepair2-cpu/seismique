(()=>{
  const footer=document.querySelector('.seismique-footer');
  if(!footer)return;
  const mobile=matchMedia('(max-width:700px)'),groups=[...footer.querySelectorAll('.sf-group')];
  function adapt(){
    for(const group of groups){group.open=!mobile.matches;group.querySelector('summary').tabIndex=mobile.matches?0:-1;}
  }
  footer.classList.add('sf-enhanced');adapt();mobile.addEventListener('change',adapt);
  for(const group of groups)group.querySelector('summary').addEventListener('click',event=>{if(!mobile.matches)event.preventDefault();});
  const shortcut=document.querySelector('.jungle-home .footer-shortcut');
  if(shortcut){
    const root=document.getElementById('seismique-jungle-reveal'),stage=root.querySelector('.scene');
    function syncShortcut(){
      const below=window.scrollY>root.clientHeight*.45;
      document.body.dataset.footerView=String(below);
      shortcut.href=below?'#tour':'#site-footer';
      shortcut.innerHTML=below?'Back to tour <span aria-hidden="true">↑</span>':'Visit info <span aria-hidden="true">↓</span>';
      shortcut.setAttribute('aria-label',below?'Return to your place in the walkthrough':'Visit information and contact — skip the walkthrough');
    }
    function openFooter(event){
      event.preventDefault();root.tourControls?.pause();
      footer.scrollIntoView({behavior:'instant',block:'start'});footer.focus({preventScroll:true});syncShortcut();
    }
    shortcut.addEventListener('click',event=>{
      if(shortcut.getAttribute('href')==='#tour'){
        event.preventDefault();window.scrollTo({top:0,behavior:'instant'});stage.focus({preventScroll:true});syncShortcut();
      }else openFooter(event);
    });
    root.querySelector('.journey-info-link')?.addEventListener('click',openFooter);
    window.addEventListener('scroll',syncShortcut,{passive:true});syncShortcut();
  }
})();
