(()=>{
 const section=document.getElementById('calendar');if(!section)return;
 const days=section.querySelector('.calendar-days'),month=section.querySelector('#calendar-month');
 const today=new Date();
 let shown=new Date(today.getFullYear(),today.getMonth(),1),selected=new Date(today.getFullYear(),today.getMonth(),today.getDate());
 const label=new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric'}),full=new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
 function select(date){selected=date;section.querySelector('.selected-day').textContent=full.format(date);section.querySelector('.selected-message').textContent='No confirmed events are listed for this day yet.';days.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.day)===date.getDate()&&shown.getMonth()===date.getMonth()&&shown.getFullYear()===date.getFullYear())));}
 function render(){month.textContent=label.format(shown);days.replaceChildren();for(let i=0;i<shown.getDay();i++){const space=document.createElement('span');space.setAttribute('aria-hidden','true');days.append(space);}const count=new Date(shown.getFullYear(),shown.getMonth()+1,0).getDate();for(let d=1;d<=count;d++){const date=new Date(shown.getFullYear(),shown.getMonth(),d),button=document.createElement('button');button.type='button';button.textContent=String(d);button.dataset.day=String(d);button.setAttribute('aria-label',full.format(date));button.addEventListener('click',()=>select(date));days.append(button);}select(selected);}
 section.querySelector('.calendar-prev').addEventListener('click',()=>{shown=new Date(shown.getFullYear(),shown.getMonth()-1,1);selected=new Date(shown);render();});section.querySelector('.calendar-next').addEventListener('click',()=>{shown=new Date(shown.getFullYear(),shown.getMonth()+1,1);selected=new Date(shown);render();});render();
})();
