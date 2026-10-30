(()=>{
  const root=document.getElementById('seismique-jungle-reveal');
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused=preference.matches;
  function motionState(){document.body.classList.toggle('motion-off',paused);}
  motionState();
  preference.addEventListener?.('change',event=>{paused=event.matches;motionState();});
  document.body.classList.add('enhanced');
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}}},{threshold:.15});
    root.querySelectorAll('.world').forEach(section=>observer.observe(section));
  }else root.querySelectorAll('.world').forEach(section=>section.classList.add('in-view'));
  const dialog=document.getElementById('image-dialog'),detail=document.getElementById('dialog-image');let opener;
  root.querySelectorAll('.image-open').forEach(button=>button.addEventListener('click',()=>{
    opener=button;detail.src=button.dataset.image;detail.alt=button.dataset.title+' at Seismique';
    document.getElementById('dialog-title').textContent=button.dataset.title;
    document.getElementById('dialog-description').textContent=button.dataset.description;
    dialog.showModal();document.body.classList.add('dialog-open');
  }));
  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');opener?.focus({preventScroll:true});});
  window.addEventListener('pagehide',()=>{if(dialog.open)dialog.close();});
  root.querySelectorAll('img').forEach(image=>{
    function unavailable(){image.classList.add('load-failed');image.parentElement.classList.add('media-failed');}
    image.addEventListener('error',unavailable);image.addEventListener('load',()=>{image.classList.remove('load-failed');image.parentElement.classList.remove('media-failed');});if(image.getAttribute('src')&&image.complete&&!image.naturalWidth)unavailable();
  });
})();
