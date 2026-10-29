import pg from 'pg';
import { CheckoutError } from './catalog.mjs';
let pool;
export function database(env=process.env) {
  if(!env.DATABASE_URL)throw new CheckoutError('Sandbox order storage is not configured yet.',503,'not_configured');
  pool ||= new pg.Pool({connectionString:env.DATABASE_URL,max:3,connectionTimeoutMillis:8000,idleTimeoutMillis:10000});
  return pool;
}
export async function transaction(pool,callback) {
  const client=await pool.connect();
  try {await client.query('BEGIN');const result=await callback(client);await client.query('COMMIT');return result;}
  catch(error){await client.query('ROLLBACK');throw error;}
  finally{client.release();}
}
export async function rateLimit(pool, bucket, limit=30) {
  const key=`${Math.floor(Date.now()/600000)}:${bucket}`;
  const {rows}=await pool.query(`INSERT INTO checkout_rate_limits(bucket,count,expires_at) VALUES($1,1,now()+interval '10 minutes') ON CONFLICT(bucket) DO UPDATE SET count=checkout_rate_limits.count+1 RETURNING count`,[key]);
  if(rows[0].count>limit)throw new CheckoutError('Too many checkout requests. Please wait a few minutes.',429,'rate_limited');
}
