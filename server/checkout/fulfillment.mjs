import {randomUUID,randomBytes} from 'node:crypto';
import {CheckoutError,CATALOG} from './catalog.mjs';
import {transaction} from './store.mjs';
export function verifiedFulfillment(session, snapshot, lines) {
  if(session.livemode!==false||session.mode!=='payment'||session.status!=='complete'||!['paid','no_payment_required'].includes(session.payment_status)||session.metadata?.flow!=='seismique-sandbox'||session.metadata.checkout_id!==snapshot.checkoutId||session.metadata.visit_date!==snapshot.visitDate)throw new CheckoutError('Payment is not verified for fulfillment.',409,'payment_unverified');
  if(session.payment_status==='no_payment_required'&&session.amount_total!==0)throw new CheckoutError('Invalid zero-value order.',409);
  const expected=new Map(snapshot.summary.lines.map(l=>[l.priceId,l]));
  if(lines.length!==expected.size)throw new CheckoutError('Payment line items do not match the order.',409,'line_mismatch');
  for(const line of lines){
    const p=typeof line.price==='string'?line.price:line.price?.id;
    const saved=expected.get(p);
    if(!saved||saved.quantity!==line.quantity||line.amount_subtotal!==saved.amount||line.currency!=='usd')throw new CheckoutError('Payment line items do not match the order.',409,'line_mismatch');
    expected.delete(p);
  }
  const discount=session.total_details?.amount_discount||0,tax=session.total_details?.amount_tax||0;
  if((snapshot.stripeTotal!==undefined&&snapshot.stripeTotal!==session.amount_total)||(snapshot.stripeDiscount!==undefined&&snapshot.stripeDiscount!==discount)||session.currency!=='usd'||session.amount_subtotal!==snapshot.summary.subtotal||session.amount_total!==snapshot.summary.subtotal-discount+tax||!Number.isInteger(session.amount_total)||session.amount_total<0||tax!==0||session.automatic_tax?.enabled)throw new CheckoutError('Payment totals do not match this sandbox order.',409,'total_mismatch');
  return {subtotal:session.amount_subtotal,discount,tax,total:session.amount_total};
}
export function ticketRecords(orderId,cart){
  const tickets=[];
  for(const [sku,n] of Object.entries(cart)){
    if(!Object.hasOwn(CATALOG,sku))throw new CheckoutError('Unknown ticket type.',409);
    for(let i=0;i<n;i++)tickets.push({id:randomUUID(),orderId,ordinal:tickets.length+1,sku,token:randomBytes(32).toString('hex')});
  }
  return tickets;
}
export async function processWebhook({event,stripe,pool}){
  if(event.livemode!==false)throw new CheckoutError('Live events are not accepted.',400,'live_event');
  const success=['checkout.session.completed','checkout.session.async_payment_succeeded'];
  if(event.type==='checkout.session.async_payment_failed'){
    const session=await stripe.checkout.sessions.retrieve(event.data.object.id);
    if(session.livemode!==false||session.metadata?.flow!=='seismique-sandbox')return {ignored:true};
    return transaction(pool,async db=>{
      const inserted=await db.query('INSERT INTO checkout_events(event_id,event_type) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING event_id',[event.id,event.type]);
      if(!inserted.rowCount)return {duplicate:true};
      await db.query("UPDATE checkout_attempts SET payment_state='failed' WHERE session_id=$1",[session.id]);
      return {failed:true};
    });
  }
  if(['charge.refunded','charge.dispute.created'].includes(event.type)){
    const object=event.data.object;
    const pi=typeof object.payment_intent==='object'?object.payment_intent?.id:object.payment_intent;
    if(!pi)return {ignored:true};
    const intent=await stripe.paymentIntents.retrieve(pi);
    if(intent.livemode!==false||intent.metadata?.flow!=='seismique-sandbox')return {ignored:true};
    if(event.type==='charge.refunded'&&!object.refunded)return {manualReview:true};
    return transaction(pool,async db=>{
      await db.query('SELECT id FROM checkout_drafts WHERE id=$1 FOR UPDATE',[intent.metadata.checkout_id]);
      const found=(await db.query('SELECT id FROM checkout_orders WHERE payment_intent=$1',[pi])).rows[0];
      if(!found)throw new CheckoutError('Paid order is not available yet; retry risk event.',503);
      const inserted=await db.query('INSERT INTO checkout_events(event_id,event_type) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING event_id',[event.id,event.type]);
      if(!inserted.rowCount)return {duplicate:true};
      const order=(await db.query('UPDATE checkout_orders SET status=$2 WHERE payment_intent=$1 RETURNING id',[pi,event.type==='charge.refunded'?'refunded':'disputed'])).rows[0];
      if(order)await db.query("UPDATE checkout_tickets SET status='void' WHERE order_id=$1",[order.id]);
      return {updated:Boolean(order)};
    });
  }
  if(!success.includes(event.type))return {ignored:true};
  // completed can arrive before an asynchronous payment succeeds. Do not consume it as paid.
  if(!['paid','no_payment_required'].includes(event.data.object.payment_status))return {pending:true};
  const session=await stripe.checkout.sessions.retrieve(event.data.object.id);
  const attempt=(await pool.query('SELECT snapshot FROM checkout_attempts WHERE session_id=$1',[session.id])).rows[0];
  if(!attempt){if(session.metadata?.flow==='seismique-sandbox')throw new CheckoutError('Order snapshot is not available yet; retry webhook.',503);return {ignored:true};}
  const lines=await stripe.checkout.sessions.listLineItems(session.id,{limit:100}).autoPagingToArray({limit:100});
  const totals=verifiedFulfillment(session,attempt.snapshot,lines),snapshot=attempt.snapshot;
  return transaction(pool,async db=>{
    await db.query('SELECT id FROM checkout_drafts WHERE id=$1 FOR UPDATE',[snapshot.checkoutId]);
    const inserted=await db.query('INSERT INTO checkout_events(event_id,event_type) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING event_id',[event.id,event.type]);
    if(!inserted.rowCount)return {duplicate:true};
    const existing=(await db.query('SELECT id,session_id FROM checkout_orders WHERE checkout_id=$1',[snapshot.checkoutId])).rows[0];
    if(existing){if(existing.session_id!==session.id)throw new CheckoutError('Conflicting paid session requires review.',409);return {duplicate:true};}
    const id=randomUUID(),pi=typeof session.payment_intent==='object'?session.payment_intent?.id:session.payment_intent;
    await db.query(`INSERT INTO checkout_orders(id,checkout_id,session_id,payment_intent,status,email,name,visit_date,currency,subtotal,discount,tax,total) VALUES($1,$2,$3,$4,'paid',$5,$6,$7,'usd',$8,$9,$10,$11)`,[id,snapshot.checkoutId,session.id,pi||null,snapshot.email,snapshot.name,snapshot.visitDate,totals.subtotal,totals.discount,totals.tax,totals.total]);
    const tickets=ticketRecords(id,snapshot.cart);
    for(const ticket of tickets)await db.query('INSERT INTO checkout_tickets(id,order_id,ordinal,sku,token) VALUES($1,$2,$3,$4,$5)',[ticket.id,id,ticket.ordinal,ticket.sku,ticket.token]);
    await db.query('INSERT INTO checkout_email_outbox(order_id) VALUES($1) ON CONFLICT DO NOTHING',[id]);
    return {fulfilled:true,orderId:id,ticketCount:tickets.length};
  });
}
export async function redeemTicket(pool,payload,{redeem=false}={}){
  if(typeof payload!=='string'||!/^SEISMIQUE-TEST:[0-9a-f-]{36}:[0-9a-f]{64}$/.test(payload))throw new CheckoutError('Invalid sandbox ticket.',404);
  const [,id,token]=payload.split(':');
  return transaction(pool,async db=>{
    const row=(await db.query('SELECT t.id,t.sku,t.status,o.visit_date,o.status AS order_status FROM checkout_tickets t JOIN checkout_orders o ON o.id=t.order_id WHERE t.id=$1 AND t.token=$2 FOR UPDATE OF t',[id,token])).rows[0];
    if(!row)throw new CheckoutError('Ticket not found.',404);
    if(row.status!=='valid'||row.order_status!=='paid')return {...row,accepted:false};
    // This is a sandbox validation primitive. Visit-date, bundle component and re-entry rules are pending.
    if(redeem)await db.query("UPDATE checkout_tickets SET status='redeemed',redeemed_at=now() WHERE id=$1",[id]);
    return {...row,status:redeem?'redeemed':row.status,accepted:true,sandbox:true};
  });
}
