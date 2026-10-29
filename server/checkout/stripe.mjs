import Stripe from 'stripe';
import { ACCOUNT_ID, CheckoutError } from './catalog.mjs';
let cached;
export function stripeClient(env = process.env) {
  if(env.STRIPE_TAX_ENABLED==='true')throw new CheckoutError('Stripe Tax setup requires review before it can be enabled.',503,'tax_not_configured');
  const key=env.STRIPE_SECRET_KEY;
  if (!key || !/^(sk|rk)_test_/.test(key) || env.STRIPE_ACCOUNT_ID !== ACCOUNT_ID) throw new CheckoutError('Sandbox payments are not configured yet.',503,'not_configured');
  if (!cached || cached.key!==key) cached={key,client:new Stripe(key,{maxNetworkRetries:2,timeout:15000})};
  return cached.client;
}
export async function verifyAccount(stripe) {
  const account=await stripe.accounts.retrieve();
  if (account.id!==ACCOUNT_ID) throw new CheckoutError('The sandbox account does not match this checkout.',503,'account_mismatch');
}
export function sessionParameters(order, catalog, origin, revision) {
  return {
    mode:'payment',ui_mode:'elements',
    integration_identifier:'seismique-sandbox-kxvnrpqa',
    customer_email:order.email,
    client_reference_id:order.checkoutId,
    line_items:Object.entries(order.cart).map(([sku,quantity]) => ({price:catalog[sku].priceId,quantity})),
    return_url:`${origin}/checkout/?return=1&session_id={CHECKOUT_SESSION_ID}`,
    metadata:{checkout_id:order.checkoutId,revision:String(revision),visit_date:order.visitDate,flow:'seismique-sandbox'},
    payment_intent_data:{metadata:{checkout_id:order.checkoutId,visit_date:order.visitDate,flow:'seismique-sandbox'}},
    // Tax is intentionally disabled until registration, categories and venue sourcing are verified.
    automatic_tax:{enabled:false}
  };
}
