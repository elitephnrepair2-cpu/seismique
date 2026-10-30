(()=>{
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=preference.matches;
 function sync(){
  document.body.classList.toggle('motion-off',paused);
 }
 sync();
 preference.addEventListener('change',event=>{paused=event.matches;sync();});
 // Close the menu when keyboard focus leaves it, preserving natural tab order.
 const header=document.querySelector('.experience-header');
 header.addEventListener('focusout',event=>{
  if(event.relatedTarget&&!header.contains(event.relatedTarget)){
   header.querySelector('.menu-panel').hidden=true;
   header.querySelector('.menu-toggle').setAttribute('aria-expanded','false');
  }
 });
})();
