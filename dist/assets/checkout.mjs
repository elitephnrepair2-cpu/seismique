import {upgradeMuseum,upgradeCost,eligibleForUpgrade,money} from './checkout-cart.mjs';
const $=id=>document.getElementById(id),form=$('choose-form');
let config,cart={},summary=null,session=null,checkout=null,actions=null,paymentElement=null,expressElement=null,busy=false,paying=false,canConfirm=false,currentStage='choose',pollTimer,pollCount=0;
const storage={get(k){try{return sessionStorage.getItem(k);}catch{return null;}},set(k,v){try{sessionStorage.setItem(k,v);}catch{}}};
const randomToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');
const checkoutId=storage.get('seismique-checkout-id')||crypto.randomUUID(),token=storage.get('seismique-checkout-token')||randomToken();
storage.set('seismique-checkout-id',checkoutId);storage.set('seismique-checkout-token',token);
let declined=storage.get(`seismique-upgrade-declined:${checkoutId}`)==='true';
const apiURL=(action,params={})=>{const url=new URL('/api/checkout',location.origin);url.searchParams.set('action',action);for(const [k,v]of Object.entries(params))url.searchParams.set(k,v);return url;};
async function api(action,{method='GET',body,params}={}){
  const response=await fetch(apiURL(action,params),{method,credentials:'same-origin',headers:{'Accept':'application/json',...(action!=='catalog'?{'Authorization':`Bearer ${token}`} :{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
  let data;try{data=await response.json();}catch{throw new Error('The sandbox payment server is not connected yet.');}
  if(!response.ok)throw Object.assign(new Error(data.error||'Unable to continue checkout.'),{code:data.code});
  return data;
}
function error(message=''){const node=$('checkout-error');node.textContent=message;node.hidden=!message;if(message)node.scrollIntoView({behavior:'auto',block:'nearest'});}
function setBusy(value){busy=value;document.querySelectorAll('button').forEach(b=>b.disabled=value);if(!value){$('payment-button').disabled=!config?.ready;$('complete-purchase').disabled=!actions||paying||!canConfirm;updateUpgradePrice();}}
function showStage(stage){
  currentStage=stage;for(const name of ['choose','review','payment','confirmation'])$('stage-'+name).hidden=name!==stage;
  const index=['choose','review','payment'].indexOf(stage);document.querySelectorAll('.checkout-steps li').forEach((li,i)=>{if(i===index)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
  const title=$(stage==='choose'?'choose-title':`${stage}-title`);title?.focus({preventScroll:true});title?.scrollIntoView({block:'start',behavior:'auto'});
}
function selectedCart(){const experience=form.elements.experience.value;const cart={};for(const age of ['adult','child']){const n=Number(form.elements[age].value);if(!Number.isInteger(n)||n<0||n>50)throw new Error('Enter a valid ticket quantity.');if(n)cart[`${experience}_${age}`]=n;}if(!Object.keys(cart).length||Object.values(cart).reduce((a,b)=>a+b,0)>50)throw new Error('Choose between 1 and 50 tickets for this sandbox order.');return cart;}
function previewSummary(){const lines=Object.entries(cart).map(([sku,quantity])=>({sku,quantity,label:config.catalog[sku].label,unitAmount:config.catalog[sku].unitAmount,amount:config.catalog[sku].unitAmount*quantity}));const subtotal=lines.reduce((sum,l)=>sum+l.amount,0);return {lines,subtotal,total:subtotal,discount:0,tax:0,visitDate:form.elements.visitDate.value,preview:true};}
function renderSummary(value=summary||previewSummary()){
  $('summary-lines').replaceChildren();
  for(const line of value.lines){const row=document.createElement('div');row.className='summary-line';const label=document.createElement('span'),price=document.createElement('span');label.textContent=`${line.quantity} × ${line.label}`;price.textContent=money(line.amount);row.append(label,price);$('summary-lines').append(row);}
  $('summary-date').textContent=value.visitDate?new Date(`${value.visitDate}T12:00:00`).toLocaleDateString('en-US',{weekday:'short',month:'long',day:'numeric',year:'numeric'}):'Choose your visit date';
  $('summary-subtotal').textContent=money(value.subtotal);$('summary-total').textContent=money(value.total);$('discount-row').hidden=!value.discount;$('summary-discount').textContent=`−${money(value.discount||0)}`;
  $('summary-tax').textContent='Not enabled · sandbox';$('total-label').textContent=value.preview?'Preview estimate':'Sandbox total';
  $('summary-source').textContent=value.preview?'Estimate using the six verified sandbox prices. Payment totals must be confirmed by the server.':'Total confirmed by Stripe. Tax collection is disabled in this sandbox.';
}
function renderReview(){
  $('review-lines').replaceChildren();
  for(const line of (summary||previewSummary()).lines){const row=document.createElement('p');row.className='review-line';row.textContent=`${line.quantity} × ${line.label} · ${money(line.amount)}`;$('review-lines').append(row);}
  $('bundle-upsell').hidden=declined||!eligibleForUpgrade(cart);
  $('review-title').textContent=declined||!eligibleForUpgrade(cart)?'Your visit, all together.':'A little more extraordinary?';
  $('review-total').textContent=`${(summary||previewSummary()).preview?'Preview estimate':'Sandbox total'} · ${money((summary||previewSummary()).total)}`;
  $('decline-upgrade').textContent=Object.keys(cart).some(x=>x.startsWith('bundle_'))?'Keep remaining museum tickets':'Continue with museum only';
  for(const age of ['adult','child']){const select=$('upgrade-'+(age==='adult'?'adults':'children'));select.replaceChildren();const max=cart[`museum_${age}`]||0;for(let i=0;i<=max;i++){const opt=document.createElement('option');opt.value=i;opt.textContent=i;select.append(opt);}select.value=max;select.closest('label').hidden=!max;}
  updateUpgradePrice();renderSummary();
}
function upgradeAmounts(){return {adult:Number($('upgrade-adults').value),child:Number($('upgrade-children').value)};}
function updateUpgradePrice(){if(!config)return;const amounts=upgradeAmounts();const cost=upgradeCost(cart,amounts,config.catalog);$('upgrade-price').textContent=`Add ${money(cost)} to this order`;$('upgrade-button').disabled=busy||cost<=0;}
function updateChoice(){if(!config)return;const exp=form.elements.experience.value;for(const age of ['adult','child'])$(age+'-price').textContent=`${money(config.catalog[`${exp}_${age}`].unitAmount)} each`;try{cart=selectedCart();summary=null;renderSummary();}catch{}}
function orderBody(){return {checkoutId,cart,visitDate:form.elements.visitDate.value,name:form.elements.name.value,email:form.elements.email.value,promoCode:$('promo-code').value.trim()};}
async function prepare(){
  if(!config.ready){session=null;summary=previewSummary();return;}
  session=await api('session',{method:'POST',body:orderBody()});summary=session.summary;storage.set('seismique-checkout-session',session.sessionId);
}
form.addEventListener('change',updateChoice);form.addEventListener('input',event=>{if(event.target.matches('[name="adult"],[name="child"],[name="visitDate"]'))updateChoice();});
document.querySelectorAll('[data-quantity]').forEach(button=>button.addEventListener('click',()=>{const input=form.elements[button.dataset.quantity];input.value=Math.max(0,Math.min(50,Number(input.value)+Number(button.dataset.change)));updateChoice();}));
form.addEventListener('submit',async event=>{event.preventDefault();if(busy||!form.reportValidity())return;error();setBusy(true);try{cart=selectedCart();await prepare();renderReview();showStage('review');}catch(e){error(e.message);}finally{setBusy(false);}});
$('upgrade-adults').addEventListener('change',updateUpgradePrice);$('upgrade-children').addEventListener('change',updateUpgradePrice);
$('upgrade-button').addEventListener('click',async()=>{if(busy)return;const previous=cart,oldSummary=summary;setBusy(true);error();try{cart=upgradeMuseum(cart,upgradeAmounts());await prepare();renderReview();$('promo-note').textContent='Your museum tickets were replaced with bundles. No duplicate admission tickets were added.';}catch(e){cart=previous;summary=oldSummary;error(e.message);}finally{setBusy(false);}});
$('decline-upgrade').addEventListener('click',()=>{declined=true;storage.set(`seismique-upgrade-declined:${checkoutId}`,'true');$('bundle-upsell').hidden=true;$('review-title').textContent='Your visit, all together.';});
$('edit-selection').addEventListener('click',()=>{if(busy)return;summary=null;$('promo-note').textContent='';showStage('choose');updateChoice();});
$('apply-promo').addEventListener('click',async()=>{if(busy)return;error();if(!config.ready){$('promo-note').textContent='Promotion validation becomes available when the sandbox payment server is connected.';return;}setBusy(true);try{await prepare();renderReview();$('promo-note').textContent=summary.discount?`Promotion applied: ${money(summary.discount)} off.`:'No promotion applied.';}catch(e){error(e.message);}finally{setBusy(false);}});
function destroyElements(){paymentElement?.destroy();expressElement?.destroy();checkout?.destroy();paymentElement=expressElement=checkout=actions=null;canConfirm=false;$('payment-element').replaceChildren();$('express-checkout-element').replaceChildren();}
async function mountPayment(){
  if(!session?.clientSecret||!config.publishableKey?.startsWith('pk_test_')||typeof Stripe!=='function')throw new Error('Secure sandbox payment is not available. Please try again.');
  destroyElements();
  const stripe=Stripe(config.publishableKey);
  checkout=stripe.initCheckoutElementsSdk({clientSecret:session.clientSecret,elementsOptions:{appearance:{theme:'night',variables:{colorPrimary:'#a17aff',colorBackground:'#14101d',colorText:'#f7f3ff',colorDanger:'#ffacbe',borderRadius:'4px',fontFamily:'Arial, sans-serif'}}}});
  const result=await checkout.loadActions();if(result.type==='error')throw new Error(result.error.message);actions=result.actions;
  checkout.on('change',value=>{
    const total=value.total?.total?.amount;
    // Display Stripe's own formatted total when available; do not calculate a payment amount in the client.
    $('complete-purchase').textContent=`Complete test purchase · ${total||money(summary.total)}`;
    canConfirm=Boolean(value.canConfirm);$('complete-purchase').disabled=paying||!canConfirm;
  });
  const initial=actions.getSession();canConfirm=Boolean(initial.canConfirm);
  paymentElement=checkout.createPaymentElement({layout:'accordion'});paymentElement.mount('#payment-element');
  expressElement=checkout.createExpressCheckoutElement();expressElement.mount('#express-checkout-element');
  expressElement.on('confirm',event=>confirmPayment(event));
  $('complete-purchase').textContent=`Complete test purchase · ${money(summary.total)}`;
}
async function confirmPayment(expressEvent){
  if(paying||!actions)return;paying=true;error();$('complete-purchase').disabled=true;$('back-to-review').disabled=true;
  try{
    const result=await actions.confirm(expressEvent?{expressCheckoutConfirmEvent:expressEvent}:{});
    if(result.type==='error')throw new Error(result.error.message);
    // Confirmation UI never creates tickets. Only read the webhook-backed order status.
    showStage('confirmation');await checkConfirmation();
  }catch(e){error(e.message);}finally{paying=false;$('complete-purchase').disabled=!canConfirm;$('back-to-review').disabled=false;}
}
$('payment-button').addEventListener('click',async()=>{if(busy||!config.ready)return;error();setBusy(true);try{await prepare();renderSummary();showStage('payment');await mountPayment();}catch(e){showStage('review');error(e.message);}finally{setBusy(false);}});
$('payment-form').addEventListener('submit',event=>{event.preventDefault();confirmPayment();});
$('back-to-review').addEventListener('click',()=>{if(paying)return;destroyElements();showStage('review');});
async function showTickets(data){
  $('confirmed-order').replaceChildren();const p=document.createElement('p');p.textContent=`Order ${data.order.id} · ${money(data.order.total)}`;$('confirmed-order').append(p);$('ticket-list').replaceChildren();
  for(const ticket of data.tickets){
    const article=document.createElement('article');article.className='ticket';const image=document.createElement('img');image.alt=`Sandbox QR code for ${config.catalog[ticket.sku]?.label||'ticket'}`;
    const info=document.createElement('div'),title=document.createElement('strong'),id=document.createElement('p');title.textContent=config.catalog[ticket.sku]?.label||ticket.sku;id.textContent=`TEST TICKET · ${ticket.status} · ${ticket.id}`;info.append(title,id);article.append(info);$('ticket-list').append(article);
    if(ticket.status==='valid'){
      const response=await fetch(apiURL('qr',{session_id:session.sessionId,ticket_id:ticket.id}),{headers:{Authorization:`Bearer ${token}`}});if(!response.ok)continue;
      const blob=await response.blob(),url=URL.createObjectURL(blob);image.src=url;article.prepend(image);const link=document.createElement('a');link.href=url;link.download=`seismique-test-${ticket.id}.svg`;link.textContent='Save QR code';info.append(link);
    }
  }
}
async function checkConfirmation(){
  if(!session?.sessionId)return;clearTimeout(pollTimer);$('check-confirmation').disabled=true;
  try{const data=await api('status',{params:{session_id:session.sessionId}});
    const paid=data.state==='paid';$('confirmation-title').textContent=paid?'Your test tickets are ready.':data.state==='processing'?'Payment received. Verifying tickets.':data.state==='expired'?'This checkout has expired.':data.state==='unpaid'?'Payment is not complete.':'This order needs attention.';
    $('confirmation-message').textContent=paid?'Your sandbox payment was verified by Stripe webhook. These tickets are for testing only.':data.state==='processing'?'Waiting for secure webhook confirmation. No tickets have been issued yet.':data.state==='unpaid'?'No tickets have been issued. Return to your selection to retry.':data.state==='expired'?'No tickets were issued for this expired checkout.':'Tickets cannot be issued for this order status.';
    if(data.summary){summary=data.summary;renderSummary();}
    if(paid){await showTickets(data);$('check-confirmation').hidden=true;}
    else if(data.state==='processing'&&pollCount++<12)pollTimer=setTimeout(checkConfirmation,2500);
  }catch(e){error(e.message);}finally{$('check-confirmation').disabled=false;}
}
$('check-confirmation').addEventListener('click',checkConfirmation);
async function init(){
  try{config=await api('catalog');}catch{config=await fetch('/assets/checkout-preview.json').then(r=>r.json());}
  if(storage.get('seismique-checkout-token')!==token){config.ready=false;error('Enable session storage in this browser before testing payment, so your confirmation stays accessible.');}
  $('connection-note').textContent=config.ready?'Stripe sandbox connected. Test payments only; no real admission.':'Preview mode: ticket selection and bundle upgrades are available. Payment is disabled until the sandbox server, credentials, and order storage are connected.';
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());$('visit-date').min=config.dateRules?.earliest||today;if(config.dateRules?.latest)$('visit-date').max=config.dateRules.latest;
  document.querySelectorAll('[data-experience-price]').forEach(el=>el.textContent=`From ${money(config.catalog[`${el.dataset.experiencePrice}_child`].unitAmount)}`);
  updateChoice();setBusy(false);
  const returnId=new URLSearchParams(location.search).get('session_id');if(returnId){session={sessionId:returnId};showStage('confirmation');await checkConfirmation();history.replaceState(null,'','/checkout/');}
}
init().catch(()=>error('The sandbox checkout could not load. Please refresh and try again.'));
