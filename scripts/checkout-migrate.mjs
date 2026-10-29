import {readFile} from 'node:fs/promises';
import {database} from '../server/checkout/store.mjs';
if(process.env.CHECKOUT_DATABASE_CONFIRMED_SANDBOX!=='true')throw new Error('Set CHECKOUT_DATABASE_CONFIRMED_SANDBOX=true after verifying the DATABASE_URL targets a dedicated sandbox.');
const pool=database();
try{await pool.query(await readFile(new URL('../db/checkout.sql',import.meta.url),'utf8'));console.log('Sandbox checkout schema applied.');}finally{await pool.end();}
