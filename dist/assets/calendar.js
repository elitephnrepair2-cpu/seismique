/* Public listings only. Populate dates only from explicitly confirmed sessions; never infer recurrences. */
(function(){
 const audiences={all:'all audiences',adults:'adults',families:'kids & families'};
 function filterEvents(events,audience){return events.filter(event=>event.status==='published'&&(audience==='all'||event.audiences.includes(audience)));}
 function eventsOnDate(events,audience,date){return filterEvents(events,audience).filter(event=>event.dates.includes(date));}
 if(typeof module!=='undefined'&&module.exports)module.exports={filterEvents,eventsOnDate};
 if(typeof document==='undefined')return;
 const section=document.getElementById('calendar');if(!section)return;
 const events=JSON.parse(document.getElementById('public-events-data').textContent);
 const days=section.querySelector('.calendar-days'),month=section.querySelector('#calendar-month'),status=section.querySelector('.event-filter-status');
 const houston=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const [year,mon,day]=houston.split('-').map(Number),today=new Date(year,mon-1,day);
 let shown=new Date(year,mon-1,1),selected=new Date(today),audience='all';
 const label=new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric'}),full=new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
 const key=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
 function select(date){
  selected=date;section.querySelector('.selected-day').textContent=full.format(date);
  const matching=eventsOnDate(events,audience,key(date)),list=section.querySelector('.calendar-day-events');list.replaceChildren();
  section.querySelector('.selected-message').textContent=matching.length?`${matching.length} confirmed ${matching.length===1?'event':'events'} for ${audiences[audience]}.`:`No confirmed dated listings for ${audiences[audience]} on this day. Check registration above for available sessions.`;
  matching.forEach(event=>{const item=document.createElement('li'),a=document.createElement('a');a.textContent=event.title+' — registration ↗';a.href=event.url;a.target='_blank';a.rel='noopener noreferrer';item.append(a);list.append(item);});
  days.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.date===key(date))));
 }
 function render(){
  month.textContent=label.format(shown);days.replaceChildren();
  for(let i=0;i<shown.getDay();i++){const blank=document.createElement('span');blank.setAttribute('aria-hidden','true');days.append(blank);}
  const count=new Date(shown.getFullYear(),shown.getMonth()+1,0).getDate();
  for(let d=1;d<=count;d++){const date=new Date(shown.getFullYear(),shown.getMonth(),d),button=document.createElement('button'),matches=eventsOnDate(events,audience,key(date));button.type='button';button.textContent=String(d);button.dataset.date=key(date);button.dataset.hasEvent=String(matches.length>0);button.setAttribute('aria-label',full.format(date)+(matches.length?`, ${matches.length} events`:''));if(key(date)===key(today))button.setAttribute('aria-current','date');button.addEventListener('click',()=>select(date));days.append(button);}
  select(selected);
 }
 section.querySelectorAll('[data-audience-filter]').forEach(button=>button.addEventListener('click',()=>{
  audience=button.dataset.audienceFilter;const visible=filterEvents(events,audience);
  section.querySelectorAll('[data-audience-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  section.querySelectorAll('[data-event-id]').forEach(card=>{card.hidden=!visible.some(event=>event.id===card.dataset.eventId);});
  status.textContent=`Showing ${visible.length} ${visible.length===1?'listed event':'listed events'} for ${audiences[audience]}.`;render();
 }));
 section.querySelector('.calendar-prev').addEventListener('click',()=>{shown=new Date(shown.getFullYear(),shown.getMonth()-1,1);selected=new Date(shown);render();});
 section.querySelector('.calendar-next').addEventListener('click',()=>{shown=new Date(shown.getFullYear(),shown.getMonth()+1,1);selected=new Date(shown);render();});render();
})();
