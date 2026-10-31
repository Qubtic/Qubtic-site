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
  if(action==='resolve' && request.method==='GET'){
   const urlObj=new URL(request.url);
   const channel=urlObj.searchParams.get('channel')||'';
   if(!/^[0-9a-f-]{36}$/i.test(channel)) throw new BillingError('Invalid channel.',400);
   await limit(`resolve:${channel}`,30,60);
   const {data:checkout,error}=await db.from('billing_checkouts').select('checkout_url,status,expires_at').eq('environment',env).eq('request_key',channel).maybeSingle();
   check(error);
   if(!checkout) return reply({error:'No checkout exists for this link yet.'},404);
   if(checkout.status==='open' && checkout.checkout_url && Date.parse(checkout.expires_at)>Date.now()){
    return reply({url:safePolarUrl(checkout.checkout_url)});
   }
   if(checkout.status==='creating' && Date.parse(checkout.expires_at)>Date.now()) return reply({pending:true},202);
   throw new BillingError('Checkout is expired or unavailable.',410);
  }
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
   const {data:orders,error}=await db.from('billing_orders').select('polar_order_id,cadence,status,amount,subtotal_amount,discount_amount,refunded_amount,currency,purchased_at').eq('environment',env).eq('customer_id',customerId).eq('plugin_slug',user.plugin).order('purchased_at',{ascending:false}).limit(100);check(error);
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
   const body=(()=>{try{return JSON.parse(raw);}catch{return null;}})() as {cadence?:Cadence;request_id?:string;replace_previous?:boolean}|null;
   if(!body || (body.cadence && !['monthly','yearly','lifetime'].includes(body.cadence)) || !/^[0-9a-f-]{36}$/i.test(body.request_id||'')) throw new BillingError('Choose a valid billing period.',400);
   const [entries,alreadyPro,existingResult]=await Promise.all([catalog(),paidAccess(user.id,user.plugin),db.from('billing_checkouts').select('*').eq('user_id',user.id).eq('request_key',body.request_id).maybeSingle()]);
   const rows=entries.filter(item=>item.plugin_slug===user.plugin);
   const selectable=['yearly','monthly','lifetime'].map(cadence=>rows.find(item=>item.cadence===cadence));
   if(selectable.some(item=>!item)) throw new BillingError('Pro checkout is not fully configured yet.',409);
   const row=selectable[0]!;
   if(alreadyPro) throw new BillingError('Pro is already active. Manage billing to change your plan.',409);
   const {data:existing,error:existingError}=existingResult;check(existingError);
   if(existing){
    if(existing.environment!==env || existing.product_id!==row.product_id) throw new BillingError('Checkout request does not match.',409);
    if(existing.status==='open' && existing.checkout_url && Date.parse(existing.expires_at)>Date.now()) return reply({url:safePolarUrl(existing.checkout_url)});
    throw new BillingError('This checkout request is already processing or expired. Start a new checkout.',409);
   }
   const sdk=polar();
   await Promise.all(selectable.map(async selected=>{
    const product=await sdk.products.get(selected!.product_id);
    if(product.organization_id!==process.env.POLAR_ORGANIZATION_ID || product.is_archived || !product.benefits.some(b=>b.id===row.benefit_id)) throw new BillingError('Plan configuration is invalid.');
    const prices=product.prices.filter(price=>!price.is_archived);
    if(!prices.length||prices.some(price=>price.amount_type!=='fixed'||!('price_amount' in price)||typeof price.price_amount!=='number'||price.price_amount<=0))throw new BillingError('Pro requires a configured fixed paid price.');
    if((selected!.cadence==='lifetime' && product.is_recurring)||(selected!.cadence!=='lifetime' && (!product.is_recurring || product.recurring_interval!==(selected!.cadence==='monthly'?'month':'year')))) throw new BillingError('Plan billing interval does not match.');
   }));
   const {error:expiryError}=await db.from('billing_checkouts').update({status:'expired'}).eq('user_id',user.id).eq('environment',env).in('status',['creating','open']).lt('expires_at',new Date().toISOString());check(expiryError);
   const {data:openCheckout,error:openError}=await db.from('billing_checkouts').select('*').eq('user_id',user.id).eq('environment',env).in('status',['creating','open']).maybeSingle();check(openError);
   if(openCheckout){
    if(!openCheckout.checkout_url || !openCheckout.polar_checkout_id || openCheckout.plugin_slug!==user.plugin) throw new BillingError('Another checkout is still processing. Please try again shortly.',409);
    const previous=await sdk.checkouts.get(openCheckout.polar_checkout_id);
    if(previous.status!=='open') throw new BillingError('Your previous checkout changed status. Refresh billing before starting another.',409);
    const available=previous.products.map(item=>item.id).sort().join(',')===selectable.map(item=>item!.product_id).sort().join(',');
    if(available){
     // Rebind the polling fallback to this launch tab when reusing an open checkout.
     const {data:rebound,error:rebindError}=await db.from('billing_checkouts').update({request_key:body.request_id}).eq('id',openCheckout.id).eq('status','open').select('id').maybeSingle();check(rebindError);
     if(!rebound)throw new BillingError('Checkout changed status. Refresh billing and try again.',409);
     return reply({url:safePolarUrl(openCheckout.checkout_url)});
    }
    if(body.replace_previous!==true)return reply({error:'An earlier checkout is still open. Continue it or start a new Pro checkout to choose a plan.',previous_url:safePolarUrl(openCheckout.checkout_url),can_replace:true},409);
    const {error:replaceError}=await db.from('billing_checkouts').update({status:'superseded'}).eq('id',openCheckout.id).eq('status','open');check(replaceError);
   }
   const id=randomUUID();
   const {error:insertError}=await db.from('billing_checkouts').insert({id,user_id:user.id,customer_id:customerId,environment:env,plugin_slug:user.plugin,cadence:row.cadence,product_id:row.product_id,request_key:body.request_id});check(insertError);
   // The account ID comes exclusively from verified database identity. No bearer tokens in URLs.
   const checkout=await sdk.checkouts.create({products:selectable.map(item=>item!.product_id),external_customer_id:customerId,customer_email:user.email,customer_name:user.name,allow_trial:false,allow_discount_codes:true,success_url:`${billingSiteUrl(process.env)}/billing/return`,return_url:`${billingSiteUrl(process.env)}/billing/return`,metadata:{qubtic_checkout_id:id,plugin_slug:user.plugin}});
   const url=safePolarUrl(checkout.url);
   const {error:updateError}=await db.from('billing_checkouts').update({polar_checkout_id:checkout.id,checkout_url:url,status:'open',expires_at:checkout.expires_at}).eq('id',id).eq('status','creating');check(updateError);
   return reply({url});
  }
  throw new BillingError('Not found.',404);
 }catch(error){return reply({error:error instanceof BillingError?error.message:'Billing service is unavailable. Please try again.'},error instanceof BillingError?error.status:503);}
}
export const GET=handle;export const POST=handle;export const OPTIONS=handle;
