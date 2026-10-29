export const emptyCart = () => ({});
export function upgradeMuseum(cart, amounts) {
  const next = {...cart};
  for (const age of ['adult','child']) {
    const quantity = amounts[age] || 0, museum = `museum_${age}`, bundle = `bundle_${age}`;
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > (cart[museum] || 0)) throw new Error('Invalid upgrade quantity.');
    next[museum] = (next[museum] || 0)-quantity;
    next[bundle] = (next[bundle] || 0)+quantity;
  }
  return Object.fromEntries(Object.entries(next).filter(([,n]) => n>0));
}
export function upgradeCost(cart, amounts, catalog) {
  let total=0;
  for(const age of ['adult','child']) {
    const n=amounts[age]||0;
    if(!Number.isInteger(n)||n<0||n>(cart[`museum_${age}`]||0))throw new Error('Invalid upgrade quantity.');
    total+=n*(catalog[`bundle_${age}`].unitAmount-catalog[`museum_${age}`].unitAmount);
  }
  return total;
}
export const eligibleForUpgrade = cart => Boolean((cart.museum_adult||0)+(cart.museum_child||0));
export const money = cents => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
