/* Event inquiry preparation only. No booking, remote submission or browser storage. */
(function(scope){
  const recipient='info@seismique.com';
  function buildPlan(v){
    const clean=value=>String(value??'').trim();
    const date=clean(v.eventDate),prettyDate=/^\d{4}-\d{2}-\d{2}$/.test(date)?date.slice(5,7)+'/'+date.slice(8,10)+'/'+date.slice(0,4):'Still deciding';
    const budget=v.budgetHelp?'Help estimating a budget':clean(v.budget)?'$'+Number(v.budget).toLocaleString('en-US')+' USD total':'Not specified';
    const rows=[['Occasion',clean(v.occasion)],['Guests',clean(v.guests)],['Space',clean(v.space)||'Help me choose'],['Date',prettyDate+(v.flexible?' · flexible':'')],['Start time',clean(v.startTime)?clean(v.startTime)+' (Houston time)':'To discuss'],['Duration',clean(v.duration)||'To discuss'],['Interests',(v.interests||[]).map(clean).filter(Boolean).join(', ')||'Open to suggestions'],['Budget',budget],['Notes',clean(v.notes)||'None added'],['Name',clean(v.name)],['Email',clean(v.email)]];
    if(clean(v.phone))rows.push(['Phone',clean(v.phone)]);
    if(clean(v.company))rows.push(['Company',clean(v.company)]);
    const subject='Seismique event inquiry — '+clean(v.occasion)+(date?' — '+date:'');
    const body='Hello Seismique events manager,\n\nI would like to discuss an event. Here is my plan:\n\n'+rows.map(([label,value])=>label+': '+value).join('\n')+'\n\nPlease let me know about availability, suitable options and pricing. I understand this inquiry does not reserve a date.\n\nThank you!';
    return {rows,body,mailto:'mailto:'+recipient+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)};
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={buildPlan};
  if(typeof document==='undefined')return;
  const form=document.getElementById('event-inquiry-form');if(!form)return;
  const steps=[...form.querySelectorAll('[data-event-step]')],progress=[...form.querySelectorAll('.event-form-progress li')],review=document.getElementById('event-plan-review'),reviewDetails=document.getElementById('event-review-details'),emailLink=document.getElementById('event-email-link'),copyStatus=document.getElementById('event-copy-status'),copyFallback=document.getElementById('event-copy-fallback');
  let current=0,plan=null;
  const field=name=>form.elements.namedItem(name);
  function updateDateMinimum(){field('eventDate').min=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
  function focusHeading(heading){
    heading.tabIndex=-1;heading.focus({preventScroll:true});heading.scrollIntoView({block:'start',behavior:'auto'});
  }
  function showStep(index,focus=true){
    current=index;form.hidden=false;review.hidden=true;
    steps.forEach((step,i)=>{step.hidden=i!==index;});
    progress.forEach((item,i)=>{if(i===index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');});
    if(focus)focusHeading(steps[index].querySelector('legend'));
  }
  function validStep(index){
    updateDateMinimum();
    for(const input of steps[index].querySelectorAll('input,select,textarea')){
      if(input.name==='name')input.setCustomValidity(input.value.trim()?'':'Please enter your name.');
      if(!input.disabled&&!input.checkValidity()){showStep(index,false);const details=input.closest('details');if(details)details.open=true;input.reportValidity();return false;}
    }
    return true;
  }
  function values(){
    const v={};for(const name of ['occasion','guests','space','eventDate','startTime','duration','budget','notes','name','email','phone','company'])v[name]=field(name).value;
    v.flexible=field('flexible').checked;v.budgetHelp=field('budgetHelp').checked;v.interests=[...form.querySelectorAll('[name="interests"]:checked')].map(input=>input.value);return v;
  }
  form.querySelectorAll('[data-next]').forEach(button=>button.addEventListener('click',()=>{if(validStep(current))showStep(current+1);}));
  form.querySelectorAll('[data-back]').forEach(button=>button.addEventListener('click',()=>showStep(current-1)));
  field('budgetHelp').addEventListener('change',()=>{field('budget').disabled=field('budgetHelp').checked;});
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(current<steps.length-1){if(validStep(current))showStep(current+1);return;}
    for(let i=0;i<steps.length;i++)if(!validStep(i))return;
    plan=buildPlan(values());reviewDetails.replaceChildren();
    for(const [label,value] of plan.rows){const row=document.createElement('div'),term=document.createElement('dt'),description=document.createElement('dd');term.textContent=label;description.textContent=value;row.append(term,description);reviewDetails.append(row);}
    emailLink.href=plan.mailto;copyStatus.textContent='';copyFallback.hidden=true;copyFallback.querySelector('textarea').value=plan.body;
    form.hidden=true;review.hidden=false;focusHeading(document.getElementById('event-review-title'));
  });
  document.getElementById('event-edit-plan').addEventListener('click',()=>showStep(0));
  document.getElementById('event-copy-plan').addEventListener('click',async()=>{
    if(!plan)return;
    try{await navigator.clipboard.writeText(plan.body);copyStatus.textContent='Inquiry copied. Paste it into an email to '+recipient+'.';}
    catch{copyFallback.hidden=false;copyFallback.querySelector('textarea').focus();copyFallback.querySelector('textarea').select();copyStatus.textContent='Select and copy the inquiry below, then paste it into your email.';}
  });
  emailLink.addEventListener('click',()=>{copyStatus.textContent='Finish sending in your email app. If it does not open, use Copy inquiry.';});
  document.querySelectorAll('[data-occasion]').forEach(link=>link.addEventListener('click',()=>{field('occasion').value=link.dataset.occasion;showStep(0,false);}));
  document.querySelectorAll('a[href="#private-event-inquiry"]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();if(link.dataset.space)field('space').value=link.dataset.space;showStep(0);}));
  updateDateMinimum();document.getElementById('events-form-fallback').hidden=true;form.hidden=false;showStep(0,false);
  window.addEventListener('pageshow',()=>{updateDateMinimum();field('budget').disabled=field('budgetHelp').checked;});
})(typeof window!=='undefined'?window:globalThis);
