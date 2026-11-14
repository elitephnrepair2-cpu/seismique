(()=>{
  const toolbar=document.querySelector('.directory-toolbar');
  const form=document.querySelector('.directory-search');
  const input=document.getElementById('artist-search');
  const count=document.getElementById('artist-count');
  const empty=document.querySelector('.directory-empty');
  const clear=form.querySelector('.search-clear');
  const normalize=value=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’‘“”']/g,'');
  const cards=[...document.querySelectorAll('.directory-card')].map(element=>({element,text:normalize(element.textContent)}));
  function filter(){
    const query=normalize(input.value.trim());
    let shown=0;
    for(const card of cards){
      card.element.hidden=!card.text.includes(query);
      if(!card.element.hidden)shown++;
    }
    count.textContent=query?`${shown} of ${cards.length} artist profiles`:`${cards.length} artist profiles`;
    empty.hidden=shown!==0;
    clear.hidden=!input.value;
  }
  function reset(){input.value='';filter();input.focus();}
  form.addEventListener('submit',event=>event.preventDefault());
  form.addEventListener('reset',event=>{event.preventDefault();reset();});
  input.addEventListener('input',filter);
  document.getElementById('show-all-artists').addEventListener('click',reset);
  toolbar.hidden=false;
})();
