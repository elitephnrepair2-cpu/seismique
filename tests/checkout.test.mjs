import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID,randomBytes} from 'node:crypto';
import Stripe from 'stripe';
import {CATALOG,ACCOUNT_ID,normalizeCart,validateDate,verifiedCatalog,summaryFor,CheckoutError} from '../server/checkout/catalog.mjs';
import {upgradeMuseum,upgradeCost,eligibleForUpgrade} from '../dist/assets/checkout-cart.mjs';
import {sessionParameters,stripeClient} from '../server/checkout/stripe.mjs';
import {verifiedFulfillment,ticketRecords,processWebhook} from '../server/checkout/fulfillment.mjs';
import {createSession,readStatus,digest} from '../server/checkout/service.mjs';
import {checkoutHandler} from '../server/checkout/http.mjs';
const catalog=Object.fromEntries(Object.entries(CATALOG).map(([sku,x])=>[sku,{...x,unitAmount:x.expected}]));
const config={STRIPE_ACCOUNT_ID:ACCOUNT_ID,CHECKOUT_ORIGIN:'https://seismique.vercel.app',CHECKOUT_ENABLED:'true',DATABASE_URL:'test-fixture',STRIPE_PUBLISHABLE_KEY:'pk_test_fixture',STRIPE_WEBHOOK_SECRET:'whsec_fixture'};
const token='a'.repeat(64),checkoutId=randomUUID();
const visitDate='2099-10-29';
const input={checkoutId,cart:{museum_adult:2,museum_child:1},name:'Sandbox Guest',email:'sandbox@example.com',visitDate,promoCode:''};
const snapshot={...input,summary:summaryFor(input.cart,catalog)};
const paidSession={id:'cs_test_fixture',livemode:false,mode:'payment',status:'complete',payment_status:'paid',currency:'usd',amount_subtotal:9497,amount_total:9497,total_details:{amount_discount:0,amount_tax:0},metadata:{flow:'seismique-sandbox',checkout_id:checkoutId,visit_date:visitDate},payment_intent:'pi_fixture',automatic_tax:{enabled:false}};
const paidLines=snapshot.summary.lines.map(l=>({price:{id:l.priceId},quantity:l.quantity,amount_subtotal:l.amount,currency:'usd'}));
function stripeFixture(){
 const sessions=new Map(),idempotency=new Map();let creates=0;
 return {sessions,accounts:{retrieve:async()=>({id:ACCOUNT_ID})},prices:{retrieve:async id=>{const x=Object.values(CATALOG).find(x=>x.priceId===id);return {id,livemode:false,active:true,currency:'usd',unit_amount:x.expected,type:'one_time',billing_scheme:'per_unit'};}},promotionCodes:{list:async()=>({data:[]})},checkout:{sessions:{
 retrieve:async id=>sessions.get(id),
 expire:async id=>{const s=sessions.get(id);if(s.status!=='open')throw Object.assign(new Error(),{type:'StripeInvalidRequestError'});s.status='expired';return s;},
 create:async(params,opts)=>{
   if(idempotency.has(opts.idempotencyKey))return idempotency.get(opts.idempotencyKey);
   creates++;const amount=params.line_items.reduce((sum,l)=>sum+Object.values(CATALOG).find(x=>x.priceId===l.price).expected*l.quantity,0);
   const s={id:`cs_test_fixture${creates}`,status:'open',payment_status:'unpaid',livemode:false,client_secret:`fixture-secret-${creates}`,amount_total:amount,total_details:{amount_discount:0,amount_tax:0}};sessions.set(s.id,s);idempotency.set(opts.idempotencyKey,s);return s;
 },listLineItems:()=>({autoPagingToArray:async()=>paidLines})}},get creates(){return creates;}};
}
// A transactional repository fixture exercises service behavior; it is not a PostgreSQL integration test.
function poolFixture(){
 let state={drafts:new Map(),attempts:new Map(),orders:new Map(),events:new Map(),tickets:[],outbox:[]};let queue=Promise.resolve();
 async function query(sql,values=[]){
   if(sql==='BEGIN'){this.before=structuredClone(state);return {rows:[],rowCount:0};}
   if(sql==='ROLLBACK'){state=this.before;return {rows:[],rowCount:0};}
   if(sql==='COMMIT')return {rows:[],rowCount:0};
   const [a,b,c,d]=values;
   const result=(rows=[],rowCount=rows.length)=>({rows,rowCount});
   if(sql.startsWith('INSERT INTO checkout_drafts')){if(!state.drafts.has(a))state.drafts.set(a,{id:a,token_hash:b,revision:0,current_session:null});return result();}
   if(sql.startsWith('SELECT * FROM checkout_drafts'))return result([state.drafts.get(a)].filter(Boolean));
   if(sql.startsWith('SELECT id FROM checkout_drafts'))return result([{id:a}]);
   if(sql.startsWith('SELECT id,session_id FROM checkout_orders'))return result([...state.orders.values()].filter(x=>x.checkout_id===a));
   if(sql.startsWith('SELECT id FROM checkout_orders'))return result([...state.orders.values()].filter(x=>x.checkout_id===a));
   if(sql.startsWith('UPDATE checkout_drafts')){Object.assign(state.drafts.get(a),{fingerprint:b,revision:c,current_session:d});return result();}
   if(sql.startsWith('INSERT INTO checkout_attempts')){state.attempts.set(a,{checkout_id:b,revision:c,snapshot:JSON.parse(d)});return result();}
   if(sql.startsWith('SELECT snapshot FROM checkout_attempts'))return result(state.attempts.has(a)?[{snapshot:state.attempts.get(a).snapshot}]:[]);
   if(sql.startsWith('SELECT a.snapshot,a.payment_state,d.token_hash')){const attempt=state.attempts.get(a);return result(attempt?[{snapshot:attempt.snapshot,token_hash:state.drafts.get(attempt.checkout_id).token_hash}]:[]);}
   if(sql.startsWith('SELECT id,status,visit_date,total,currency FROM checkout_orders'))return result([...state.orders.values()].filter(x=>x.session_id===a));
   if(sql.startsWith('SELECT id,sku,status,token FROM checkout_tickets'))return result(state.tickets.filter(x=>x.order_id===a));
   if(sql.startsWith('INSERT INTO checkout_events')){if(state.events.has(a))return result();state.events.set(a,b);return result([{event_id:a}],1);}
   if(sql.startsWith('INSERT INTO checkout_orders')){if([...state.orders.values()].some(x=>x.checkout_id===b))throw new Error('duplicate checkout');const row={id:a,checkout_id:b,session_id:c,payment_intent:d,status:'paid',total:values[10],currency:'usd'};state.orders.set(a,row);return result();}
   if(sql.startsWith("UPDATE checkout_attempts SET payment_state='failed'")){if(state.attempts.has(a))state.attempts.get(a).payment_state='failed';return result();}
   if(sql.startsWith('INSERT INTO checkout_tickets')){state.tickets.push({id:a,order_id:b,ordinal:c,sku:d,token:values[4],status:'valid'});return result();}
   if(sql.startsWith('INSERT INTO checkout_email_outbox')){state.outbox.push(a);return result();}
   throw new Error('Unexpected SQL in fixture: '+sql);
 }
 return {query:query.bind({}),get state(){return state;},async connect(){let release;const previous=queue;queue=new Promise(r=>release=r);await previous;return {query,release};}};
}
test('six existing prices are unique and verified; tampered or live prices fail closed',async()=>{
 assert.equal(new Set(Object.values(CATALOG).map(x=>x.priceId)).size,6);
 const stripe=stripeFixture();assert.equal(Object.keys(await verifiedCatalog(stripe)).length,6);
 stripe.prices.retrieve=async()=>({livemode:true,active:true,currency:'usd',unit_amount:3499,type:'one_time'});
 await assert.rejects(()=>verifiedCatalog(stripe),/prices need review/);
});
test('reject live keys, the wrong account, invalid quantities, unknown prices and malformed dates',()=>{
 assert.throws(()=>stripeClient({...config,STRIPE_SECRET_KEY:'sk_live_fixture'}),CheckoutError);
 for(const cart of [{museum_adult:-1},{museum_adult:1.2},{museum_adult:51},{museum_adult:'2'},{museum_adult:1,price_fake:1},{},JSON.parse('{"__proto__":1}')])assert.throws(()=>normalizeCart(cart));
 for(const value of ['2026-13-01','2099-02-30','yesterday',null])assert.throws(()=>validateDate(value),CheckoutError);
 assert.throws(()=>validateDate('2099-10-29',{VISIT_BLOCKED_DATES:'2099-10-29'}));
 assert.equal(validateDate('2099-10-29'), '2099-10-29');
});
test('adult/child upgrades replace only eligible museum quantities and preserve headcount',()=>{
 const cart={museum_adult:2,museum_child:3,golf_adult:1,bundle_child:1};
 const result=upgradeMuseum(cart,{adult:1,child:2});
 assert.deepEqual(result,{museum_adult:1,museum_child:1,golf_adult:1,bundle_child:3,bundle_adult:1});
 assert.equal(upgradeCost(cart,{adult:1,child:2},catalog),4500);
 assert.equal(summaryFor(result,catalog).subtotal-summaryFor(cart,catalog).subtotal,4500);
 assert.equal(Object.values(result).reduce((a,b)=>a+b),Object.values(cart).reduce((a,b)=>a+b));
 assert.equal(eligibleForUpgrade({bundle_adult:1,golf_child:2}),false);
 assert.throws(()=>upgradeMuseum(cart,{adult:3}));
 assert.deepEqual(cart,{museum_adult:2,museum_child:3,golf_adult:1,bundle_child:1});
});
test('Checkout Session contains only allowlisted prices, disabled tax, and no client-supplied amounts',()=>{
 const params=sessionParameters(input,catalog,config.CHECKOUT_ORIGIN,1);
 assert.equal(params.ui_mode,'elements');assert.equal(params.automatic_tax.enabled,false);assert.equal(params.metadata.flow,'seismique-sandbox');
 assert.equal(params.line_items[0].price,CATALOG.museum_adult.priceId);assert.equal(params.line_items[0].quantity,2);
 assert.ok(!('payment_method_types' in params));assert.ok(!('amount' in params));assert.ok(!('success_url' in params));assert.equal(params.metadata.visit_date,visitDate);
});
test('session retries and concurrent requests reuse one session; upgrade expires original before replacement',async()=>{
 const stripe=stripeFixture(),pool=poolFixture();
 const request=()=>createSession({body:input,token,stripe,pool,env:config});
 const [first,retry]=await Promise.all([request(),request()]);assert.equal(first.sessionId,retry.sessionId);assert.equal(stripe.creates,1);
 const upgraded={...input,cart:upgradeMuseum(input.cart,{adult:2,child:1})};
 const second=await createSession({body:upgraded,token,stripe,pool,env:config});
 assert.equal(stripe.sessions.get(first.sessionId).status,'expired');assert.equal(second.summary.total,13997);assert.equal(stripe.creates,2);
 assert.deepEqual(pool.state.attempts.get(second.sessionId).snapshot.cart,{bundle_adult:2,bundle_child:1});
 stripe.sessions.get(second.sessionId).status='complete';
 await assert.rejects(()=>request(),/already been submitted/);assert.equal(stripe.creates,2);
});
test('forged totals, duplicate/changed lines, live events and unpaid payments cannot issue tickets',()=>{
 assert.equal(verifiedFulfillment(paidSession,snapshot,paidLines).total,9497);
 for(const session of [{...paidSession,livemode:true},{...paidSession,payment_status:'unpaid'},{...paidSession,amount_total:1},{...paidSession,metadata:{flow:'other'}},{...paidSession,total_details:{amount_tax:100}}])assert.throws(()=>verifiedFulfillment(session,snapshot,paidLines));
 assert.throws(()=>verifiedFulfillment(paidSession,snapshot,[...paidLines,paidLines[0]]));
 assert.throws(()=>verifiedFulfillment(paidSession,snapshot,[{...paidLines[0],quantity:99},paidLines[1]]));
});
test('verified payment creates one order and exactly one ticket per selection across webhook retries',async()=>{
 const stripe=stripeFixture(),pool=poolFixture();
 pool.state.drafts.set(checkoutId,{id:checkoutId,token_hash:digest(token)});pool.state.attempts.set(paidSession.id,{checkout_id:checkoutId,snapshot});stripe.sessions.set(paidSession.id,paidSession);
 const event={id:'evt_fixture',type:'checkout.session.completed',livemode:false,data:{object:paidSession}};
 const first=await processWebhook({event,stripe,pool});assert.equal(first.ticketCount,3);assert.equal(pool.state.orders.size,1);assert.equal(pool.state.tickets.length,3);assert.equal(pool.state.outbox.length,1);
 await processWebhook({event,stripe,pool});await processWebhook({event:{...event,id:'evt_async',type:'checkout.session.async_payment_succeeded'},stripe,pool});
 assert.equal(pool.state.tickets.length,3);assert.equal(pool.state.orders.size,1);assert.equal(pool.state.outbox.length,1);
 assert.equal(new Set(pool.state.tickets.map(t=>t.token)).size,3);
});
test('unpaid completion and failed-payment event produce no tickets',async()=>{
 const stripe=stripeFixture(),pool=poolFixture();
 const pending={...paidSession,payment_status:'unpaid',metadata:{flow:'other'}};stripe.sessions.set(pending.id,pending);
 await processWebhook({event:{id:'evt_pending',type:'checkout.session.completed',livemode:false,data:{object:pending}},stripe,pool});
 await processWebhook({event:{id:'evt_failed',type:'checkout.session.async_payment_failed',livemode:false,data:{object:pending}},stripe,pool});
 assert.equal(pool.state.orders.size,0);assert.equal(pool.state.tickets.length,0);
});
test('ticket identifiers and QR secrets are unique and contain no customer details',()=>{
 const tickets=ticketRecords(randomUUID(),{bundle_adult:2,bundle_child:3});assert.equal(tickets.length,5);
 assert.equal(new Set(tickets.map(t=>t.id)).size,5);assert.equal(new Set(tickets.map(t=>t.token)).size,5);assert.ok(tickets.every(t=>/^[a-f0-9]{64}$/.test(t.token)));
});
test('status and QR access require the original browser token; the success page cannot fulfill',async()=>{
 const pool=poolFixture(),stripe=stripeFixture();pool.state.drafts.set(checkoutId,{token_hash:digest(token)});pool.state.attempts.set(paidSession.id,{checkout_id:checkoutId,snapshot});stripe.sessions.set(paidSession.id,paidSession);
 await assert.rejects(()=>readStatus({sessionId:paidSession.id,token:'b'.repeat(64),stripe,pool}),/not found/);
 const state=await readStatus({sessionId:paidSession.id,token,stripe,pool});assert.equal(state.state,'processing');assert.equal(pool.state.orders.size,0);assert.equal(pool.state.tickets.length,0);
});
test('actual Stripe signature verification rejects forged and altered webhook bodies',async()=>{
 const stripe=new Stripe('sk_test_fixture'),pool=poolFixture();stripe.accounts.retrieve=async()=>({id:ACCOUNT_ID});
 const handler=checkoutHandler({env:config,stripeFactory:()=>stripe,poolFactory:()=>pool});
 const payload=JSON.stringify({id:'evt_signature',type:'unhandled.event',livemode:false,data:{object:{}}});
 const signature=stripe.webhooks.generateTestHeaderString({payload,secret:config.STRIPE_WEBHOOK_SECRET});
 const send=(body,sig)=>handler(new Request('https://seismique.vercel.app/api/checkout?action=webhook',{method:'POST',body,headers:{'stripe-signature':sig}}));
 assert.equal((await send(payload,signature)).status,200);
 assert.equal((await send(payload+' ',signature)).status,400);
 assert.equal((await send(payload,'invalid')).status,400);
 const live=JSON.stringify({id:'evt_live',livemode:true});assert.equal((await send(live,stripe.webhooks.generateTestHeaderString({payload:live,secret:config.STRIPE_WEBHOOK_SECRET}))).status,400);
});
test('API rejects foreign origins, unauthorized staff and live keys; no secrets are returned',async()=>{
 const stripe=stripeFixture(),handler=checkoutHandler({env:config,stripeFactory:()=>stripe,poolFactory:()=>poolFixture()});
 const badOrigin=await handler(new Request('https://seismique.vercel.app/api/checkout?action=session',{method:'POST',body:'{}',headers:{origin:'https://evil.example','Content-Type':'application/json'}}));assert.equal(badOrigin.status,403);
 const staff=await handler(new Request('https://seismique.vercel.app/api/checkout?action=validate',{method:'POST',body:'{}',headers:{origin:config.CHECKOUT_ORIGIN,authorization:'Bearer wrong'}}));assert.equal(staff.status,403);
 const catalogResponse=await handler(new Request('https://seismique.vercel.app/api/checkout'));const data=await catalogResponse.json();assert.equal(data.sandbox,true);assert.equal(data.catalog.bundle_adult.unitAmount,4999);assert.ok(!JSON.stringify(data).includes('whsec_'));
});
test('database schema has durable uniqueness constraints and atomic fulfillment/outbox boundaries',async()=>{
 const sql=await readFile(new URL('../db/checkout.sql',import.meta.url),'utf8');
 for(const constraint of ['session_id text PRIMARY KEY','checkout_id uuid NOT NULL UNIQUE','session_id text NOT NULL UNIQUE','event_id text PRIMARY KEY','UNIQUE(order_id,ordinal)','order_id uuid PRIMARY KEY','token text NOT NULL UNIQUE'])assert.ok(sql.includes(constraint));
});
test('declined Stripe creation rolls back the draft and cannot create orders or tickets',async()=>{
 const stripe=stripeFixture(),pool=poolFixture();stripe.checkout.sessions.create=async()=>{throw Object.assign(new Error('Declined fixture'),{type:'StripeCardError'});};
 await assert.rejects(()=>createSession({body:input,token,stripe,pool,env:config}),/Declined/);
 assert.equal(pool.state.orders.size,0);assert.equal(pool.state.tickets.length,0);assert.equal(pool.state.drafts.size,0);
});
test('QR endpoint returns a QR SVG only for a paid order and valid token',async()=>{
 const stripe=stripeFixture(),pool=poolFixture(),orderId=randomUUID();
 pool.state.drafts.set(checkoutId,{token_hash:digest(token)});pool.state.attempts.set(paidSession.id,{checkout_id:checkoutId,snapshot});pool.state.orders.set(orderId,{id:orderId,checkout_id:checkoutId,session_id:paidSession.id,status:'paid',total:9497,currency:'usd'});
 const ticket={id:randomUUID(),order_id:orderId,sku:'museum_adult',status:'valid',token:randomBytes(32).toString('hex')};pool.state.tickets.push(ticket);
 const handler=checkoutHandler({env:config,stripeFactory:()=>stripe,poolFactory:()=>pool,limit:async()=>{}});
 const response=await handler(new Request(`https://seismique.vercel.app/api/checkout?action=qr&session_id=${paidSession.id}&ticket_id=${ticket.id}`,{headers:{authorization:`Bearer ${token}`}}));
 assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/svg/);assert.match(await response.text(),/<svg/);assert.equal(response.headers.get('cache-control'),'no-store');
 const invalid=await handler(new Request(`https://seismique.vercel.app/api/checkout?action=qr&session_id=${paidSession.id}&ticket_id=${ticket.id}`,{headers:{authorization:`Bearer ${'b'.repeat(64)}`}}));assert.equal(invalid.status,404);
});
test('an asynchronous payment failure is saved and remains ticket-free on replay',async()=>{
 const stripe=stripeFixture(),pool=poolFixture();pool.state.attempts.set(paidSession.id,{checkout_id:checkoutId,snapshot});
 const session={...paidSession,payment_status:'unpaid'};stripe.sessions.set(session.id,session);
 const event={id:'evt_async_failed',type:'checkout.session.async_payment_failed',livemode:false,data:{object:session}};
 assert.deepEqual(await processWebhook({event,stripe,pool}),{failed:true});
 assert.equal(pool.state.attempts.get(session.id).payment_state,'failed');
 assert.deepEqual(await processWebhook({event,stripe,pool}),{duplicate:true});assert.equal(pool.state.tickets.length,0);
});
