import {createHash,randomUUID,timingSafeEqual} from 'node:crypto';
import {CheckoutError,verifiedCatalog,validateInput,summaryFor} from './catalog.mjs';
import {sessionParameters,verifyAccount} from './stripe.mjs';
import {transaction} from './store.mjs';
export const digest = text => createHash('sha256').update(text).digest('hex');
export function safeEqual(a,b){const x=Buffer.from(a||''),y=Buffer.from(b||'');return x.length===y.length&&timingSafeEqual(x,y);}
export function authorizeDraft(row,token){if(!row||!safeEqual(row.token_hash,digest(token)))throw new CheckoutError('Checkout not found.',404,'not_found');}
export function sessionSummary(session, snapshot) {
  return {...snapshot.summary,discount:session.total_details?.amount_discount||0,tax:session.total_details?.amount_tax||0,total:session.amount_total,visitDate:snapshot.visitDate,taxMode:'sandbox-disabled',status:session.status,paymentStatus:session.payment_status};
}
export async function createSession({body,token,stripe,pool,env,now}) {
  const order=validateInput({...body,token},env,now);
  await verifyAccount(stripe);
  const catalog=await verifiedCatalog(stripe),summary=summaryFor(order.cart,catalog);
  const fingerprint=digest(JSON.stringify(order));
  return transaction(pool,async db => {
    await db.query('INSERT INTO checkout_drafts(id,token_hash) VALUES($1,$2) ON CONFLICT(id) DO NOTHING',[order.checkoutId,digest(token)]);
    const draft=(await db.query('SELECT * FROM checkout_drafts WHERE id=$1 FOR UPDATE',[order.checkoutId])).rows[0];
    authorizeDraft(draft,token);
    const paid=(await db.query('SELECT id FROM checkout_orders WHERE checkout_id=$1',[draft.id])).rows[0];
    if(paid)throw new CheckoutError('This order is already paid. Open its confirmation.',409,'already_paid');
    if(draft.current_session){
      const previous=await stripe.checkout.sessions.retrieve(draft.current_session);
      if(previous.livemode!==false)throw new CheckoutError('Sandbox mismatch.',503,'account_mismatch');
      if(previous.status==='complete')throw new CheckoutError('This order has already been submitted. Check its confirmation.',409,'already_submitted');
      if(draft.fingerprint===fingerprint&&previous.status==='open') {
        const snapshot=(await db.query('SELECT snapshot FROM checkout_attempts WHERE session_id=$1',[previous.id])).rows[0].snapshot;
        return {sessionId:previous.id,clientSecret:previous.client_secret,summary:sessionSummary(previous,snapshot)};
      }
      // Expiration wins or completion wins at Stripe; never leave two payable revisions open.
      if(previous.status==='open'){
        try{await stripe.checkout.sessions.expire(previous.id);}
        catch(error){if(error.type==='StripeInvalidRequestError')throw new CheckoutError('The previous payment is being processed. Check its confirmation.',409,'already_submitted');throw error;}
      }
    }
    const revision=draft.revision+1;
    const params=sessionParameters(order,catalog,env.CHECKOUT_ORIGIN,revision);
    if(order.promoCode){
      const promotions=await stripe.promotionCodes.list({code:order.promoCode,active:true,limit:2});
      if(promotions.data.length!==1)throw new CheckoutError('That promotion code is not available.');
      params.discounts=[{promotion_code:promotions.data[0].id}];
    }
    let session;
    try{session=await stripe.checkout.sessions.create(params,{idempotencyKey:`seismique:${order.checkoutId}:${revision}:${fingerprint}`});}
    catch(error){if(order.promoCode&&error.type==='StripeInvalidRequestError')throw new CheckoutError('That promotion cannot be used with this order.');throw error;}
    if(session.livemode!==false||!session.client_secret||!Number.isInteger(session.amount_total))throw new CheckoutError('Unable to prepare sandbox payment.',502,'stripe_response');
    const snapshot={...order,summary,stripeTotal:session.amount_total,stripeDiscount:session.total_details?.amount_discount||0};
    await db.query('INSERT INTO checkout_attempts(session_id,checkout_id,revision,snapshot) VALUES($1,$2,$3,$4)',[session.id,draft.id,revision,JSON.stringify(snapshot)]);
    await db.query('UPDATE checkout_drafts SET fingerprint=$2,revision=$3,current_session=$4,updated_at=now() WHERE id=$1',[draft.id,fingerprint,revision,session.id]);
    return {sessionId:session.id,clientSecret:session.client_secret,summary:sessionSummary(session,snapshot)};
  });
}
export async function readStatus({sessionId,token,stripe,pool}){
  if(!/^cs_test_[A-Za-z0-9]+$/.test(sessionId||''))throw new CheckoutError('Invalid sandbox checkout.');
  const result=await pool.query('SELECT a.snapshot,a.payment_state,d.token_hash FROM checkout_attempts a JOIN checkout_drafts d ON d.id=a.checkout_id WHERE a.session_id=$1',[sessionId]);
  const row=result.rows[0];authorizeDraft(row,token);
  const order=(await pool.query('SELECT id,status,visit_date,total,currency FROM checkout_orders WHERE session_id=$1',[sessionId])).rows[0];
  if(order){
    const tickets=(await pool.query('SELECT id,sku,status,token FROM checkout_tickets WHERE order_id=$1 ORDER BY ordinal',[order.id])).rows;
    return {state:order.status,order:{id:order.id,visitDate:row.snapshot.visitDate,total:order.total,currency:order.currency},tickets};
  }
  const session=await stripe.checkout.sessions.retrieve(sessionId);
  if(session.livemode!==false)throw new CheckoutError('Sandbox mismatch.',503);
  return {state:row.payment_state==='failed'?'failed':session.status==='expired'?'expired':session.status==='complete'?'processing':'unpaid',summary:sessionSummary(session,row.snapshot)};
}
export function newOrderId(){return randomUUID();}
