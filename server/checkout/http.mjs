import QRCode from 'qrcode';
import {CheckoutError,verifiedCatalog,ACCOUNT_ID} from './catalog.mjs';
import {stripeClient,verifyAccount} from './stripe.mjs';
import {database,rateLimit} from './store.mjs';
import {createSession,readStatus,digest,safeEqual} from './service.mjs';
import {processWebhook,redeemTicket} from './fulfillment.mjs';
const json=(data,status=200,headers={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',...headers}});
function configuredOrigin(env){
  let origin;
  try{origin=new URL(env.CHECKOUT_ORIGIN);if(origin.origin!==env.CHECKOUT_ORIGIN||(!['localhost','127.0.0.1'].includes(origin.hostname)&&origin.protocol!=='https:'))throw Error();}
  catch{throw new CheckoutError('Sandbox checkout origin is not configured.',503,'not_configured');}
  return origin.origin;
}
function checkOrigin(request,env){
  const allowed=[configuredOrigin(env),...(env.CHECKOUT_ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean)];
  const origin=request.headers.get('origin');
  if(origin&&!allowed.includes(origin))throw new CheckoutError('This checkout origin is not allowed.',403,'origin');
  if(!origin&&request.method==='POST')throw new CheckoutError('Missing checkout origin.',403,'origin');
  return origin?{'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Allow-Methods':'GET,POST,OPTIONS'}:{};
}
async function rawBody(request,max){
  const reader=request.body?.getReader();if(!reader)return Buffer.alloc(0);
  const parts=[];let length=0;
  for(;;){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>max){await reader.cancel();throw new CheckoutError('Request too large.',413);}parts.push(value);}
  return Buffer.concat(parts);
}
function bearer(request){const token=request.headers.get('authorization')?.replace(/^Bearer /,'');if(!token||token.length>256)throw new CheckoutError('Checkout authorization is required.',401);return token;}
export function checkoutHandler({env=process.env,stripeFactory=stripeClient,poolFactory=database,limit=rateLimit}={}){
  return async request=>{
    const url=new URL(request.url),action=url.searchParams.get('action')||'catalog';let cors={};
    try{
      if(action==='webhook'){
        if(request.method!=='POST')return json({error:'Method not allowed.'},405,{Allow:'POST'});
        if(!env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_'))throw new CheckoutError('Webhook verification is not configured.',503,'not_configured');
        const stripe=stripeFactory(env),raw=await rawBody(request,1024*1024);let event;
        try{event=stripe.webhooks.constructEvent(raw,request.headers.get('stripe-signature'),env.STRIPE_WEBHOOK_SECRET);}
        catch{throw new CheckoutError('Invalid webhook signature.',400,'signature');}
        if(event.livemode!==false)throw new CheckoutError('Live events are not accepted.',400,'live_event');
        await verifyAccount(stripe);
        return json(await processWebhook({event,stripe,pool:poolFactory(env)}));
      }
      cors=checkOrigin(request,env);
      if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
      if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405,{...cors,Allow:'GET,POST,OPTIONS'});
      if(action==='catalog'){
        if(request.method!=='GET')return json({error:'Method not allowed.'},405,cors);
        const stripe=stripeFactory(env);await verifyAccount(stripe);
        const catalog=await verifiedCatalog(stripe);
        const ready=env.CHECKOUT_ENABLED==='true'&&Boolean(env.DATABASE_URL)&&Boolean(env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_'))&&Boolean(env.STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_'));
        return json({sandbox:true,accountId:ACCOUNT_ID,catalog,ready,publishableKey:env.STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_')?env.STRIPE_PUBLISHABLE_KEY:null,taxMode:'sandbox-disabled',dateRules:{allowed:(env.VISIT_ALLOWED_DATES||'').split(',').filter(Boolean),blocked:(env.VISIT_BLOCKED_DATES||'').split(',').filter(Boolean),earliest:env.VISIT_EARLIEST_DATE||null,latest:env.VISIT_LATEST_DATE||null}},200,cors);
      }
      const token=bearer(request);
      if(action==='validate'){
        if(request.method!=='POST')return json({error:'Method not allowed.'},405,cors);
        if(!env.TICKET_STAFF_API_KEY||!safeEqual(token,env.TICKET_STAFF_API_KEY))throw new CheckoutError('Staff authorization is required.',403);
        const body=JSON.parse((await rawBody(request,8192)).toString());
        return json(await redeemTicket(poolFactory(env),body.payload,{redeem:body.redeem===true}),200,cors);
      }
      if(!/^[0-9a-f]{64}$/.test(token))throw new CheckoutError('Invalid checkout authorization.',401);
      const stripe=stripeFactory(env),pool=poolFactory(env);
      if(action==='session'){
        if(request.method!=='POST')return json({error:'Method not allowed.'},405,cors);
        if(env.CHECKOUT_ENABLED!=='true'||!env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_')||!env.STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_'))throw new CheckoutError('Sandbox payments are not enabled yet.',503,'not_configured');
        if(!request.headers.get('content-type')?.startsWith('application/json'))throw new CheckoutError('JSON is required.',415);
        // Vercel supplies this proxy header. Tokens add another independent request bucket.
        const ip=request.headers.get('x-real-ip')||'local';
        await limit(pool,`session:ip:${digest(ip)}`,60);await limit(pool,`session:token:${digest(token)}`,30);
        const body=JSON.parse((await rawBody(request,16384)).toString());
        return json(await createSession({body,token,stripe,pool,env}),200,cors);
      }
      if(['status','qr'].includes(action)){
        if(request.method!=='GET')return json({error:'Method not allowed.'},405,cors);
        await limit(pool,`status:${digest(token)}`,180);
        const status=await readStatus({sessionId:url.searchParams.get('session_id'),token,stripe,pool});
        if(action==='status'){
          if(status.tickets)status.tickets=status.tickets.map(({token:secret,...ticket})=>ticket);
          return json(status,200,cors);
        }
        if(status.state!=='paid')throw new CheckoutError('Verified tickets are not ready.',409,'not_ready');
        const ticket=status.tickets.find(x=>x.id===url.searchParams.get('ticket_id'));
        if(!ticket||ticket.status!=='valid')throw new CheckoutError('Ticket is not valid.',404);
        const svg=await QRCode.toString(`SEISMIQUE-TEST:${ticket.id}:${ticket.token}`,{type:'svg',errorCorrectionLevel:'M',margin:4,width:240});
        return new Response(svg,{headers:{...cors,'Content-Type':'image/svg+xml','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'",'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
      }
      throw new CheckoutError('Unknown checkout endpoint.',404);
    }catch(error){
      if(error instanceof SyntaxError)return json({error:'Invalid request.',code:'invalid_request'},400,cors);
      if(error instanceof CheckoutError)return json({error:error.message,code:error.code},error.status,cors);
      // Log category only. Never log bodies, emails, client secrets, tokens, or credentials.
      console.error('checkout_request_failed',{action,type:error.type||error.name||'Error'});
      return json({error:'Checkout is temporarily unavailable. Please try again.',code:'unavailable'},503,cors);
    }
  };
}
