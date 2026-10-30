import { billingSiteUrl } from '@/lib/billing/config.mjs';
import { actor, BillingError, billingHeaders, catalog, check, cronAuthorized, database, environment, identity, limit, paidAccess, polar, processEvent, safePolarUrl, synchronize, webhook, type Cadence } from '@/lib/billing/core';
import { randomUUID } from 'node:crypto';
export const runtime='nodejs';
export const maxDuration=60;
type Context={params:Promise<{action:string}>};
function reply(body:unknown,status=200){return Response.json(body,{status,headers:billingHeaders});}
async function handle(request:Request,{params}:Context){
 if(request.method==='OPTIONS') return new Response(null,{status:204,headers:billingHeaders});
 const {action}=await params;
 try{
  if(action==='webhook' && request.method==='POST'){await webhook(request);return reply({received:true},202);}
  const db=database();const env=environment();
  if(action==='reconcile' && request.method==='POST'){
   if(!cronAuthorized(request)) throw new BillingError('Unauthorized.',401);
   // Bounded durable batches; oldest snapshots first. Failed events remain pending.
   const {data:events,error}=await db.from('billing_webhook_events').select('event_id').eq('environment',env).eq('status','pending').lt('attempts',20).order('created_at').limit(10);check(error);
   let failed=0;
   for(const item of events||[]){try{await processEvent(item.event_id);}catch{failed++;}}
   const {data:customers,error:e}=await db.from('billing_customers').select('id').eq('environment',env).not('polar_customer_id','is',null).order('last_attempted_at',{nullsFirst:true}).limit(10);check(e);
   for(const item of customers||[]){try{await synchronize(item.id);}catch{failed++;}}
   const {data:pending,error:pendingError}=await db.from('billing_checkouts').select('customer_id').eq('environment',env).in('status',['creating','open']).gt('expires_at',new Date().toISOString()).order('last_checked_at',{nullsFirst:true}).limit(10);check(pendingError);
   for(const id of new Set((pending||[]).map(row=>row.customer_id))){try{await synchronize(id);}catch{failed++;}}
   return reply({processed:(events||[]).length,reconciled:(customers||[]).length,failed},failed?503:200);
  }
  const user=await actor(request);await limit(`api:${user.id}`);
  if(action==='catalog' && request.method==='GET'){
   const rows=(await catalog()).filter(row=>row.plugin_slug===user.plugin);
   return reply({plans:rows.map(row=>({cadence:row.cadence,available:true}))});
  }
  const customerId=await identity(user.id);
  if(action==='status' && request.method==='GET'){
   const {data:orders,error}=await db.from('billing_orders').select('polar_order_id,cadence,status,amount,refunded_amount,currency,purchased_at').eq('environment',env).eq('customer_id',customerId).eq('plugin_slug',user.plugin).order('purchased_at',{ascending:false}).limit(100);check(error);
   const {data:subscriptions,error:e}=await db.from('billing_subscriptions').select('cadence,status,current_period_end,cancel_at_period_end').eq('environment',env).eq('customer_id',customerId).eq('plugin_slug',user.plugin);check(e);
   return reply({plugin:user.plugin,is_pro:await paidAccess(user.id,user.plugin),orders:orders||[],subscriptions:subscriptions||[]});
  }
  if(action==='refresh' && request.method==='POST'){
   await limit(`refresh:${user.id}`,6,60);await synchronize(customerId);
   return reply({is_pro:await paidAccess(user.id,user.plugin)});
  }
  if(action==='portal' && request.method==='POST'){
   const {data,error}=await db.from('billing_customers').select('polar_customer_id').eq('id',customerId).single();check(error);
   if(!data?.polar_customer_id) throw new BillingError('No purchases are linked to this account yet.',409);
   const session=await polar().customerSessions.create({customer_id:data.polar_customer_id});
   return reply({url:safePolarUrl(session.customer_portal_url)});
  }
  if(action==='checkout' && request.method==='POST'){
   await limit(`checkout:${user.id}`,5,300);
   const raw=await request.text();if(Buffer.byteLength(raw)>4096)throw new BillingError('Request too large.',413);
   const body=(()=>{try{return JSON.parse(raw);}catch{return null;}})() as {cadence?:Cadence;request_id?:string}|null;
   if(!body || !['monthly','yearly','lifetime'].includes(body.cadence||'') || !/^[0-9a-f-]{36}$/i.test(body.request_id||'')) throw new BillingError('Choose a valid billing period.',400);
   const row=(await catalog()).find(item=>item.plugin_slug===user.plugin && item.cadence===body.cadence);
   if(!row) throw new BillingError('This plan is not available yet.',409);
   if(await paidAccess(user.id,user.plugin)) throw new BillingError('Pro is already active. Manage billing to change your plan.',409);
   const {data:existing,error:existingError}=await db.from('billing_checkouts').select('*').eq('user_id',user.id).eq('request_key',body.request_id).maybeSingle();check(existingError);
   if(existing){
    if(existing.environment!==env || existing.product_id!==row.product_id) throw new BillingError('Checkout request does not match.',409);
    if(existing.checkout_url && Date.parse(existing.expires_at)>Date.now()) return reply({url:safePolarUrl(existing.checkout_url)});
    throw new BillingError('This checkout request is already processing or expired. Start a new checkout.',409);
   }
   const sdk=polar();const product=await sdk.products.get(row.product_id);
   if(product.organization_id!==process.env.POLAR_ORGANIZATION_ID || product.is_archived || !product.benefits.some(b=>b.id===row.benefit_id)) throw new BillingError('Plan configuration is invalid.');
   const prices=product.prices.filter(price=>!price.is_archived);
   if(!prices.length||prices.some(price=>price.amount_type!=='fixed'||!('price_amount' in price)||typeof price.price_amount!=='number'||price.price_amount<=0))throw new BillingError('Pro requires a configured fixed paid price.');
   if((row.cadence==='lifetime' && product.is_recurring)||(row.cadence!=='lifetime' && (!product.is_recurring || product.recurring_interval!==(row.cadence==='monthly'?'month':'year')))) throw new BillingError('Plan billing interval does not match.');
   const {error:expiryError}=await db.from('billing_checkouts').update({status:'expired'}).eq('user_id',user.id).eq('environment',env).in('status',['creating','open']).lt('expires_at',new Date().toISOString());check(expiryError);
   const {data:openCheckout,error:openError}=await db.from('billing_checkouts').select('*').eq('user_id',user.id).eq('environment',env).in('status',['creating','open']).maybeSingle();check(openError);
   if(openCheckout){if(openCheckout.checkout_url && openCheckout.product_id===row.product_id)return reply({url:safePolarUrl(openCheckout.checkout_url)});throw new BillingError('Another checkout is already open. Complete it or wait for it to expire.',409);}
   const id=randomUUID();
   const {error:insertError}=await db.from('billing_checkouts').insert({id,user_id:user.id,customer_id:customerId,environment:env,plugin_slug:user.plugin,cadence:row.cadence,product_id:row.product_id,request_key:body.request_id});check(insertError);
   // The account ID comes exclusively from verified database identity. No bearer tokens in URLs.
   const checkout=await sdk.checkouts.create({products:[row.product_id],external_customer_id:customerId,customer_email:user.email,customer_name:user.name,allow_trial:false,success_url:`${billingSiteUrl(process.env)}/billing/return`,return_url:`${billingSiteUrl(process.env)}/billing/return`,metadata:{qubtic_checkout_id:id,plugin_slug:user.plugin}});
   const url=safePolarUrl(checkout.url);
   const {error:updateError}=await db.from('billing_checkouts').update({polar_checkout_id:checkout.id,checkout_url:url,status:'open',expires_at:checkout.expires_at}).eq('id',id).eq('status','creating');check(updateError);
   return reply({url});
  }
  throw new BillingError('Not found.',404);
 }catch(error){return reply({error:error instanceof BillingError?error.message:'Billing service is unavailable. Please try again.'},error instanceof BillingError?error.status:503);}
}
export const GET=handle;export const POST=handle;export const OPTIONS=handle;
