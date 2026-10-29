export const ACCOUNT_ID = 'acct_1UVus1BRtAmy9egL';
export const CATALOG = Object.freeze({
  museum_adult: { label: 'Museum · Adult', experience: 'museum', age: 'adult', priceId: 'price_1UW12uBRtAmy9egLFc56mTJL', expected: 3499 },
  museum_child: { label: 'Museum · Child', experience: 'museum', age: 'child', priceId: 'price_1UW13HBRtAmy9egLtcoyCSKq', expected: 2499 },
  golf_adult: { label: 'Glow Mini Golf · Adult', experience: 'golf', age: 'adult', priceId: 'price_1UW13JBRtAmy9egLAaiOncAj', expected: 2499 },
  golf_child: { label: 'Glow Mini Golf · Child', experience: 'golf', age: 'child', priceId: 'price_1UW13LBRtAmy9egLDszsPF6v', expected: 2199 },
  bundle_adult: { label: 'Museum + Mini Golf · Adult', experience: 'bundle', age: 'adult', priceId: 'price_1UW13NBRtAmy9egLIoM7kRHw', expected: 4999 },
  bundle_child: { label: 'Museum + Mini Golf · Child', experience: 'bundle', age: 'child', priceId: 'price_1UW13OBRtAmy9egL0Smq6Elb', expected: 3999 }
});
export class CheckoutError extends Error {
  constructor(message, status = 400, code = 'invalid_request') { super(message); this.status = status; this.code = code; }
}
export function normalizeCart(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new CheckoutError('Choose your tickets.');
  const cart = {};
  for (const [sku, quantity] of Object.entries(value)) {
    if (!Object.hasOwn(CATALOG, sku) || !Number.isSafeInteger(quantity) || quantity < 0 || quantity > 50) throw new CheckoutError('Invalid ticket selection.');
    if (quantity) cart[sku] = quantity;
  }
  const total = Object.values(cart).reduce((a,b) => a+b, 0);
  // Technical request limit, not a claim about venue capacity or admission policy.
  if (!total || total > 50) throw new CheckoutError('Choose between 1 and 50 tickets per sandbox order.');
  return Object.fromEntries(Object.entries(cart).sort(([a],[b]) => a.localeCompare(b)));
}
export function validateDate(value, config = {}, now = new Date()) {
  const date = typeof value === 'string' ? new Date(`${value}T12:00:00Z`) : new Date(NaN);
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(date.getTime()) || date.toISOString().slice(0,10) !== value) throw new CheckoutError('Choose a valid visit date.');
  const today = new Intl.DateTimeFormat('en-CA', {timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  if (value < today) throw new CheckoutError('Choose today or a future visit date.');
  const list = key => (config[key] || '').split(',').map(x => x.trim()).filter(Boolean);
  if ((config.VISIT_EARLIEST_DATE && value < config.VISIT_EARLIEST_DATE) || (config.VISIT_LATEST_DATE && value > config.VISIT_LATEST_DATE) || list('VISIT_BLOCKED_DATES').includes(value) || (list('VISIT_ALLOWED_DATES').length && !list('VISIT_ALLOWED_DATES').includes(value))) throw new CheckoutError('That date is not available in this sandbox.');
  return value;
}
export function validateInput(body, env, now) {
  if (!body || typeof body !== 'object') throw new CheckoutError('Invalid order.');
  if (typeof body.email !== 'string' || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) throw new CheckoutError('Enter a valid email address.');
  if (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 120) throw new CheckoutError('Enter your name.');
  const promoCode = body.promoCode || '';
  if (typeof promoCode !== 'string' || promoCode.length > 80 || /[\x00-\x1f]/.test(promoCode)) throw new CheckoutError('Invalid promotion code.');
  if (typeof body.checkoutId !== 'string' || !/^[0-9a-f-]{36}$/.test(body.checkoutId)) throw new CheckoutError('Restart this checkout.');
  if (typeof body.token !== 'string' || !/^[0-9a-f]{64}$/.test(body.token)) throw new CheckoutError('Restart this checkout.');
  return { checkoutId:body.checkoutId, cart:normalizeCart(body.cart), visitDate:validateDate(body.visitDate,env,now), email:body.email.trim().toLowerCase(), name:body.name.trim(), promoCode:promoCode.trim() };
}
export async function verifiedCatalog(stripe) {
  const rows = await Promise.all(Object.entries(CATALOG).map(async ([sku, item]) => {
    const price = await stripe.prices.retrieve(item.priceId);
    if (price.livemode !== false || !price.active || price.currency !== 'usd' || price.unit_amount !== item.expected || price.type !== 'one_time' || price.recurring || price.billing_scheme !== 'per_unit' || price.transform_quantity) throw new CheckoutError('Ticket prices need review before checkout can continue.',503,'catalog_mismatch');
    return { sku, ...item, unitAmount:price.unit_amount, currency:price.currency };
  }));
  return Object.fromEntries(rows.map(row => [row.sku,row]));
}
export function summaryFor(cart, catalog) {
  const lines = Object.entries(cart).map(([sku,quantity]) => ({ sku,label:catalog[sku].label,quantity,unitAmount:catalog[sku].unitAmount,amount:catalog[sku].unitAmount*quantity,priceId:catalog[sku].priceId }));
  const subtotal = lines.reduce((sum,line) => sum+line.amount,0);
  return {lines,subtotal,currency:'usd'};
}
