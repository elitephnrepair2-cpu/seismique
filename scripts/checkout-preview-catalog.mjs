import {CATALOG,ACCOUNT_ID} from '../server/checkout/catalog.mjs';
export const previewCatalog={sandbox:true,accountId:ACCOUNT_ID,ready:false,publishableKey:null,taxMode:'sandbox-disabled',catalog:Object.fromEntries(Object.entries(CATALOG).map(([sku,item])=>[sku,{sku,...item,unitAmount:item.expected,currency:'usd'}]))};
