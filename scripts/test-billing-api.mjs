import * as billingConfiguration from '../src/lib/billing/config.mjs';
import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createRequire} from 'node:module';import {createHmac,randomUUID} from 'node:crypto';import ts from 'typescript';
const native=createRequire(import.meta.url);const realSdk=native('@polar-sh/sdk/2026-10');
function load(path,deps){const exports={};const js=ts.transpileModule(readFileSync(new URL('../'+path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;new Function('require','exports',js)(name=>name in deps?deps[name]:native(name),exports);return exports;}
function harness(){
 process.env.POLAR_ENVIRONMENT='sandbox';process.env.POLAR_ACCESS_TOKEN='test-only';process.env.POLAR_ORGANIZATION_ID='org1';process.env.SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='test-only';process.env.POLAR_WEBHOOK_SECRET='whsec_'+Buffer.alloc(32,1).toString('base64');
 const customer=randomUUID(),product=randomUUID(),monthlyProduct=randomUUID(),yearlyProduct=randomUUID(),benefit=randomUUID();const tables={framer_users:[{id:'user',email:'owner@example.test',plugin_slug:'whatsapp-commerce',auth_token:'token',status:'active',metadata:{email_verified:true}}],billing_customers:[{id:customer,email:'owner@example.test',environment:'sandbox',polar_customer_id:'polar1'}],billing_catalog:[{plugin_slug:'whatsapp-commerce',cadence:'lifetime',product_id:product,benefit_id:benefit,environment:'sandbox',enabled:true},{plugin_slug:'whatsapp-commerce',cadence:'monthly',product_id:monthlyProduct,benefit_id:benefit,environment:'sandbox',enabled:true},{plugin_slug:'whatsapp-commerce',cadence:'yearly',product_id:yearlyProduct,benefit_id:benefit,environment:'sandbox',enabled:true}],billing_memberships:[{user_id:'user',customer_id:customer,plugin_slug:'whatsapp-commerce',environment:'sandbox'}],plugin_entitlements:[],billing_orders:[],billing_subscriptions:[],billing_checkouts:[],billing_webhook_events:[]};
 const desiredCatalog=structuredClone(tables.billing_catalog);
 const calls=[];let paid=false;let databaseError=false;let apiError=false;let checkoutProducts=[{id:monthlyProduct}];
 const state={id:'polar1',external_id:customer,organization_id:'org1',deleted_at:null,granted_benefits:[{benefit_id:benefit}],active_subscriptions:[]};
 const order={id:'order1',customer_id:'polar1',customer:{organization_id:'org1'},product_id:product,status:'paid',total_amount:4900,refunded_amount:0,currency:'usd',created_at:'2026-10-30T00:00:00Z',subscription_id:null};
 const discountId=randomUUID();
 const sdk={discounts:{get:async()=>({id:discountId,organization_id:'org1',products:[{id:product}],type:'fixed',duration:'once',currency:'usd',amount:2000,starts_at:null,ends_at:null,max_redemptions:null,redemptions_count:0}),create:async body=>{calls.push({method:'discounts.create',...body});return{id:discountId,...body};}},subscriptions:{iterList:async function*(){for(const sub of state.active_subscriptions)yield sub;},update:async(id,body)=>{const s=state.active_subscriptions.find(x=>x.id===id);if(s&&body.cancel_at_period_end!==undefined)s.cancel_at_period_end=body.cancel_at_period_end;return s;},revoke:async id=>{calls.push({method:'subscriptions.revoke',id});return{id,status:'canceled'};}},customers:{getExternal:async()=>state,get:async()=>{if(apiError)throw new Error('API offline');return state;},getState:async()=>{if(apiError)throw new Error('API offline');return state;}},orders:{get:async()=>order,iterList:async function*(){yield order;}},products:{get:async id=>({organization_id:'org1',is_archived:false,is_recurring:id!==product,recurring_interval:id===monthlyProduct?'month':id===yearlyProduct?'year':null,prices:[{amount_type:'fixed',price_amount:4900,price_currency:'usd',is_archived:false}],benefits:[{id:benefit}]})},checkouts:{get:async()=>({status:'open',products:checkoutProducts}),create:async body=>{calls.push(body);return{id:'checkout1',url:'https://buy.polar.sh/test',expires_at:'2099-01-01T00:00:00Z'};}},customerSessions:{create:async body=>{calls.push(body);return{customer_portal_url:'https://polar.sh/portal/test'};}}};
 const db={rpc:async(name,args)=>{calls.push({name,args});if(databaseError)return{error:{}};if(name==='billing_identity')return{data:customer};if(name==='billing_throttle')return{data:true};if(name==='billing_site_has_purchase')return{data:tables.billing_subscriptions.some(s=>s.site_id===args.p_site&&s.status==='active'&&Date.parse(s.current_period_end)>Date.now())};if(name==='billing_site_access')return{data:paid&&args.p_site==='site-a'};if(name==='billing_apply_snapshot'||name==='billing_apply_site_snapshot'){paid=args.p_grants.length>0;return{data:true};}return{data:null};},from(table){let filters=[],op='select',payload,upsertOptions;const q={select(){return q;},eq(k,v){filters.push(row=>row[k]===v);return q;},in(k,v){filters.push(row=>v.includes(row[k]));return q;},lt(k,v){filters.push(row=>row[k]<v);return q;},not(){return q;},order(){return q;},limit(){return q;},insert(v){op='insert';payload=v;return q;},update(v){op='update';payload=v;return q;},upsert(v,o){op='upsert';payload=v;upsertOptions=o;return q;},async maybeSingle(){const r=await q;return{...r,data:r.data?.[0]||null};},async single(){return q.maybeSingle();},then(resolve){if(databaseError)return Promise.resolve({error:{message:'private db error'}}).then(resolve);let rows=(tables[table]||[]).filter(row=>filters.every(f=>f(row)));if(table==='plugin_entitlements')rows=paid?[{is_pro:true,verified_until:'2099-01-01'}]:[];if(op==='insert'){rows=[{id:randomUUID(),created_at:new Date().toISOString(),status:'creating',...payload}];tables[table].push(...rows);}if(op==='upsert'){const existing=tables[table].find(row=>row.event_id===payload.event_id&&row.environment===payload.environment);if(!existing){rows=[{attempts:0,status:'pending',...payload}];tables[table].push(...rows);}else if(!upsertOptions?.ignoreDuplicates)Object.assign(existing,payload);}if(op==='update')for(const row of rows)Object.assign(row,payload);return Promise.resolve({data:structuredClone(rows),error:null}).then(resolve);}};return q;}};
 const core=load('src/lib/billing/core.ts',{'./config.mjs':{configuredCatalog:()=>desiredCatalog,catalogMatches:billingConfiguration.catalogMatches},'server-only':{},'@supabase/supabase-js':{createClient:()=>db},'@polar-sh/sdk/2026-10':{...realSdk,createPolar:()=>sdk}});const route=load('src/app/api/billing/[action]/route.ts',{'@/lib/billing/core':core,'@/lib/billing/config.mjs':billingConfiguration});
 const request=async(action,body,token='token',site='site-a')=>{const r=await route[body===undefined?'GET':'POST'](new Request('https://example.test/api/billing/'+action,{method:body===undefined?'GET':'POST',headers:{'X-Framer-Site-Id':site,Authorization:`Bearer ${token}`,...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)})}),{params:Promise.resolve({action:action.split('?')[0]})});return{status:r.status,data:await r.json()};};
 return{core,route,request,tables,calls,state,order,customer,product,monthlyProduct,yearlyProduct,benefit,discountId,setPaid:v=>paid=v,setDbError:v=>databaseError=v,setApiError:v=>apiError=v,setCheckoutProducts:v=>checkoutProducts=v};
}
test('checkout binds verified identity and ignores client prices and account IDs',async()=>{const h=harness();const response=await h.request('checkout',{cadence:'lifetime',request_id:randomUUID(),customer_id:'attacker',price:1,plugin:'frame-drop'});assert.equal(response.status,200);const checkout=h.calls.find(call=>call.external_customer_id);assert.equal(checkout.external_customer_id,h.customer);assert.equal(checkout.customer_email,'owner@example.test');assert.deepEqual(checkout.products,[h.yearlyProduct,h.monthlyProduct,h.product]);assert.equal(checkout.allow_trial,false);assert.ok(!JSON.stringify(checkout).includes('Bearer'));});
test('guests, unverified and suspended sessions cannot start checkout',async()=>{const h=harness();for(const state of ['pending_verification','suspended']){h.tables.framer_users[0].status=state;assert.equal((await h.request('checkout',{cadence:'lifetime',request_id:randomUUID()})).status,401);}h.tables.framer_users[0].status='active';h.tables.framer_users[0].metadata.email_verified=false;assert.equal((await h.request('checkout',{})).status,401);});
test('catalog and environment prevent buying another plugin or sandbox product',async()=>{const h=harness();h.tables.billing_catalog[0].plugin_slug='frame-drop';assert.equal((await h.request('checkout',{cadence:'lifetime',request_id:randomUUID()})).status,503);h.tables.billing_catalog[0].plugin_slug='whatsapp-commerce';h.tables.billing_catalog[0].environment='production';assert.equal((await h.request('checkout',{cadence:'lifetime',request_id:randomUUID()})).status,503);});
test('checkout retries reuse the same checkout without creating duplicate purchases',async()=>{const h=harness();const key=randomUUID();await h.request('checkout',{cadence:'lifetime',request_id:key});await h.request('checkout',{cadence:'lifetime',request_id:key});assert.equal(h.calls.filter(call=>call.external_customer_id).length,1);});
test('active Pro blocks duplicate checkout and redirect URLs are restricted',async()=>{const h=harness();h.setPaid(true);assert.equal((await h.request('checkout',{cadence:'lifetime',request_id:randomUUID()})).status,409);for(const url of ['http://buy.polar.sh/test','https://evil.test/','https://buy.polar.sh@evil.test/'])assert.throws(()=>h.core.safePolarUrl(url));});
test('lifetime access requires its benefit and an unrefunded paid order; another plugin never unlocks',()=>{const h=harness();const entries=h.tables.billing_catalog;assert.deepEqual(h.core.normalizeState(h.state,entries,[h.order]).grants,[{plugin_slug:'whatsapp-commerce',access_ends_at:null}]);assert.deepEqual(h.core.normalizeState(h.state,entries,[{...h.order,status:'pending'}]).grants,[]);assert.deepEqual(h.core.normalizeState(h.state,entries,[{...h.order,refunded_amount:4900}]).grants,[]);assert.deepEqual(h.core.normalizeState({...h.state,granted_benefits:[]},entries,[h.order]).grants,[]);assert.throws(()=>h.core.normalizeState(h.state,entries,[{...h.order,customer_id:'attacker'}]));});
function signed(body,id='msg_test',offset=0){const timestamp=String(Math.floor(Date.now()/1000)+offset);const signature=createHmac('sha256',Buffer.alloc(32,1)).update(id+'.'+timestamp+'.'+body).digest('base64');return new Request('https://example.test/webhook',{method:'POST',headers:{'webhook-id':id,'webhook-timestamp':timestamp,'webhook-signature':'v1,'+signature},body});}
test('official SDK rejects forged or expired webhooks before database changes',async()=>{const h=harness();const body=JSON.stringify({type:'order.paid',timestamp:new Date().toISOString(),data:{customer_id:'polar1'}});await assert.rejects(()=>h.core.webhook(new Request('https://example.test',{method:'POST',body})));await assert.rejects(()=>h.core.webhook(signed(body,'old',-3600)));assert.equal(h.tables.billing_webhook_events.length,0);});
test('signed events reconcile canonical state, deduplicate delivery, and preserve failed events for retry',async()=>{const h=harness();const body=JSON.stringify({type:'order.paid',timestamp:new Date().toISOString(),data:{customer_id:'polar1'}});h.setApiError(true);await assert.rejects(()=>h.core.webhook(signed(body)));assert.equal(h.tables.billing_webhook_events[0].status,'pending');h.setApiError(false);await h.core.webhook(signed(body));await h.core.webhook(signed(body));assert.equal(h.tables.billing_webhook_events.length,1);assert.equal(h.tables.billing_webhook_events[0].status,'processed');assert.equal(h.calls.filter(call=>call.name==='billing_apply_site_snapshot').length,1);});
test('database outage fails closed and does not leak private diagnostics',async()=>{const h=harness();h.setDbError(true);const response=await h.request('status');assert.equal(response.status,503);assert.ok(!JSON.stringify(response.data).includes('private'));});
test('reconciliation endpoint requires its own server credential',async()=>{const h=harness();assert.equal((await h.request('reconcile',{})).status,401);});

test('recurring Pro requires a paid current period and respects cancellations and full refunds',()=>{
 const h=harness();const now=Date.now();const start=new Date(now-3600000).toISOString(),end=new Date(now+3600000).toISOString();const entries=[{...h.tables.billing_catalog[0],cadence:'monthly'}];
 const sub={id:'subscription1',product_id:h.product,status:'active',current_period_start:start,current_period_end:end,cancel_at_period_end:true};
 const state={...h.state,active_subscriptions:[sub]};const order={...h.order,subscription_id:'subscription1',created_at:new Date(now-1800000).toISOString()};
 assert.equal(h.core.normalizeState(state,entries,[order],[sub]).grants[0].access_ends_at,end);
 assert.equal(h.core.normalizeState(state,entries,[{...order,created_at:'2020-01-01'}],[sub]).grants.length,0);
 assert.equal(h.core.normalizeState(state,entries,[order],[{...sub,status:'canceled'}]).grants.length,0);
 assert.equal(h.core.normalizeState(state,entries,[{...order,refunded_amount:4900}],[sub]).grants.length,0);
 assert.equal(h.core.normalizeState(state,entries,[{...order,status:'partially_refunded',refunded_amount:100}],[sub]).grants.length,1);
});


test('refresh discovers a paid customer even if all initial webhook deliveries were missed',async()=>{
 const h=harness();h.tables.billing_customers[0].polar_customer_id=null;
 await h.core.synchronize(h.customer);
 assert.equal(h.calls.filter(call=>call.name==='billing_apply_site_snapshot').length,1);
 assert.equal(h.calls.find(call=>call.name==='billing_apply_site_snapshot').args.p_grants[0].plugin_slug,'whatsapp-commerce');
});

test('single account-linked checkout offers all three products and records Polar discount on the selected order',async()=>{const h=harness();const listing=await h.request('catalog');assert.equal(listing.status,200);assert.equal(listing.data.plans.length,3);const response=await h.request('checkout',{request_id:randomUUID(),product_id:'attacker'});assert.equal(response.status,200);const checkout=h.calls.find(call=>call.external_customer_id);assert.deepEqual(checkout.products,[h.yearlyProduct,h.monthlyProduct,h.product]);assert.equal(checkout.allow_discount_codes,true);assert.equal(checkout.discount_id,undefined);const order={...h.order,subtotal_amount:4900,discount_amount:2000,discount_id:h.discountId,total_amount:2900};assert.equal(h.core.normalizeState(h.state,h.tables.billing_catalog,[order]).orders[0].discount_amount,2000);});

test('old single-plan checkout returns recovery choices and explicit replacement opens the three-plan selector',async()=>{const h=harness();h.tables.billing_checkouts.push({id:randomUUID(),user_id:'user',site_id:'site-a',environment:'sandbox',plugin_slug:'whatsapp-commerce',product_id:h.monthlyProduct,status:'open',polar_checkout_id:'old',checkout_url:'https://sandbox.polar.sh/checkout/old',expires_at:'2099-01-01T00:00:00Z'});const conflict=await h.request('checkout',{request_id:randomUUID()});assert.equal(conflict.status,409);assert.equal(conflict.data.can_replace,true);assert.equal(conflict.data.previous_url,'https://sandbox.polar.sh/checkout/old');const next=await h.request('checkout',{request_id:randomUUID(),replace_previous:true});assert.equal(next.status,200);assert.equal(h.tables.billing_checkouts[0].status,'superseded');assert.deepEqual(h.calls.find(call=>call.external_customer_id).products,[h.yearlyProduct,h.monthlyProduct,h.product]);});

test('resolve endpoint verifies channel and returns open checkout url without requiring credentials',async()=>{
 const h=harness();
 const bad=await h.request('resolve?channel=bad-id');
 assert.equal(bad.status,400);
 const channel=randomUUID();
 const pending=await h.request('resolve?channel='+channel);
 assert.equal(pending.status,404);
 h.tables.billing_checkouts.push({id:randomUUID(),user_id:'user',site_id:'site-a',environment:'sandbox',plugin_slug:'whatsapp-commerce',product_id:h.product,request_key:channel,status:'open',checkout_url:'https://sandbox.polar.sh/checkout/active',expires_at:'2099-01-01T00:00:00Z'});
 const ok=await h.request('resolve?channel='+channel);
 assert.equal(ok.status,200);
 assert.equal(ok.data.url,'https://sandbox.polar.sh/checkout/active');
});


test('resolve distinguishes active creation, expired creation, and terminal checkout states',async()=>{
 const h=harness();const channel=randomUUID();
 const row={id:randomUUID(),environment:'sandbox',request_key:channel,status:'creating',expires_at:'2099-01-01T00:00:00Z'};
 h.tables.billing_checkouts.push(row);
 assert.equal((await h.request('resolve?channel='+channel)).status,202);
 row.expires_at='2000-01-01T00:00:00Z';
 assert.equal((await h.request('resolve?channel='+channel)).status,410);
 row.expires_at='2099-01-01T00:00:00Z';row.status='succeeded';
 assert.equal((await h.request('resolve?channel='+channel)).status,410);
});

test('reused checkout resolves for the new launch channel without a duplicate Polar checkout',async()=>{
 const h=harness();const channel=randomUUID();
 h.setCheckoutProducts([h.yearlyProduct,h.monthlyProduct,h.product].map(id=>({id})));
 h.tables.billing_checkouts.push({id:randomUUID(),user_id:'user',site_id:'site-a',environment:'sandbox',plugin_slug:'whatsapp-commerce',product_id:h.yearlyProduct,request_key:randomUUID(),status:'open',polar_checkout_id:'old',checkout_url:'https://sandbox.polar.sh/checkout/old',expires_at:'2099-01-01T00:00:00Z'});
 const response=await h.request('checkout',{request_id:channel});
 assert.equal(response.status,200);
 assert.equal((await h.request('resolve?channel='+channel)).data.url,response.data.url);
 assert.equal(h.calls.filter(call=>call.external_customer_id).length,0);
});


test('checkout requires a site and never reuses another sites request or checkout',async()=>{
 const h=harness();const key=randomUUID();
 assert.equal((await h.request('checkout',{request_id:key},'token','')).status,400);
 assert.equal((await h.request('checkout',{request_id:key})).status,200);
 assert.equal(h.tables.billing_checkouts[0].site_id,'site-a');
 assert.equal(h.calls.find(c=>c.external_customer_id).metadata.site_id,'site-a');
 assert.equal((await h.request('checkout',{request_id:key},'token','site-b')).status,409);
 assert.equal((await h.request('checkout',{request_id:randomUUID()},'token','site-b')).status,200);
 h.setPaid(true);
 assert.equal((await h.request('status',undefined,'token','site-a')).data.is_pro,true);
 assert.equal((await h.request('status',undefined,'token','site-b')).data.is_pro,false);
 assert.equal(await h.core.paidAccess('user','whatsapp-commerce'),false);
});

test('site grants follow the original checkout across renewals and reject subscription reassignment',()=>{
 const h=harness();const now=Date.now();const start=new Date(now-3600000).toISOString(),end=new Date(now+3600000).toISOString();
 const sub={id:'subscription',product_id:h.monthlyProduct,status:'active',current_period_start:start,current_period_end:end,cancel_at_period_end:false};
 const initial={...h.order,id:'initial',product_id:h.monthlyProduct,subscription_id:'subscription',checkout_id:'checkout-a',created_at:'2020-01-01'};
 const renewal={...initial,id:'renewal',checkout_id:null,created_at:new Date(now-1000).toISOString()};
 const checkouts=[{site_id:'site-a',polar_checkout_id:'checkout-a',plugin_slug:'whatsapp-commerce'},{site_id:'site-b',polar_checkout_id:'checkout-b',plugin_slug:'whatsapp-commerce'}];
 const snapshot=h.core.normalizeSiteState(h.state,h.tables.billing_catalog,[initial,renewal],[sub],checkouts);
 assert.deepEqual(snapshot.siteGrants,[{plugin_slug:'whatsapp-commerce',access_ends_at:end,site_id:'site-a'}]);
 assert.equal(snapshot.orders.find(o=>o.id==='renewal').site_id,'site-a');
 assert.equal(snapshot.subscriptions[0].site_id,'site-a');
 assert.deepEqual(h.core.normalizeSiteState(h.state,h.tables.billing_catalog,[initial,{...renewal,refunded_amount:4900}],[sub],checkouts).siteGrants,[]);
 assert.deepEqual(h.core.normalizeSiteState(h.state,h.tables.billing_catalog,[initial,renewal],[{...sub,status:'canceled'}],checkouts).siteGrants,[]);
 assert.throws(()=>h.core.normalizeSiteState(h.state,h.tables.billing_catalog,[initial,{...renewal,checkout_id:'checkout-b'}],[sub],checkouts),/assignment mismatch/);
 assert.deepEqual(h.core.normalizeSiteState(h.state,h.tables.billing_catalog,[{...h.order,metadata:{site_id:'site-b'}}],[],checkouts).siteGrants,[]);
 const lifetime=h.core.normalizeSiteState(h.state,h.tables.billing_catalog,[{...h.order,checkout_id:'checkout-b'}],[],checkouts);
 assert.deepEqual(lifetime.siteGrants,[{plugin_slug:'whatsapp-commerce',access_ends_at:null,site_id:'site-b'}]);
});

test('an existing site subscription blocks duplicate checkout even after its verification cache expires',async()=>{
 const h=harness();h.tables.billing_subscriptions.push({site_id:'site-a',status:'active',current_period_end:'2099-01-01'});
 assert.equal((await h.request('checkout',{request_id:randomUUID()})).status,409);
 assert.equal((await h.request('checkout',{request_id:randomUUID()},'token','site-b')).status,200);
});

test('cancel action updates recurring cancellation and leaves Pro active until period end',async()=>{
 const h=harness();
 const end=new Date(Date.now()+86400000).toISOString();
 h.tables.billing_subscriptions.push({polar_subscription_id:'sub1',environment:'sandbox',customer_id:h.customer,plugin_slug:'whatsapp-commerce',site_id:'site-a',status:'active',current_period_end:end,cancel_at_period_end:false});
 h.state.active_subscriptions.push({id:'sub1',product_id:h.monthlyProduct,status:'active',current_period_start:new Date().toISOString(),current_period_end:end,cancel_at_period_end:false});
 const res=await h.request('cancel',{});
 assert.equal(res.status,200);
 assert.equal(res.data.cancel_at_period_end,true);
 assert.equal(res.data.current_period_end,end);
});

test('monthly subscriber upgrading to yearly gets automatically calculated proration discount and upgrade checkout',async()=>{
 const h=harness();
 const now=Date.now();
 // Monthly period: started 5 days ago, ends in 25 days (total 30 days)
 const start=new Date(now - 5*86400000).toISOString();
 const end=new Date(now + 25*86400000).toISOString();
 h.tables.billing_subscriptions.push({polar_subscription_id:'sub_month',environment:'sandbox',customer_id:h.customer,plugin_slug:'whatsapp-commerce',site_id:'site-a',cadence:'monthly',status:'active',current_period_end:end,cancel_at_period_end:false});
 h.tables.billing_orders.push({environment:'sandbox',polar_order_id:'order_month',customer_id:h.customer,plugin_slug:'whatsapp-commerce',cadence:'monthly',product_id:h.monthlyProduct,status:'paid',amount:500,subtotal_amount:500,discount_amount:0,refunded_amount:0,currency:'usd',purchased_at:start,subscription_id:'sub_month',site_id:'site-a'});

 const response=await h.request('checkout',{cadence:'yearly',request_id:randomUUID()});
 assert.equal(response.status,200);
 assert.ok(response.data.url);

 // Verify a discount was created for the remaining unused days
 const discountCall=h.calls.find(c=>c.method==='discounts.create');
 assert.ok(discountCall,'Proration discount must be created');
 assert.equal(discountCall.type,'fixed');
 assert.equal(discountCall.duration,'once');
 assert.deepEqual(discountCall.products,[h.yearlyProduct]);
 // 500 cents * (25 / 30) = ~417 cents
 assert.ok(discountCall.amount>=400 && discountCall.amount<=425,'Unused credit calculation should match ~25 days of $5 monthly');

 // Verify checkout creation has upgrade metadata, yearly product, and discount attached
 const checkoutCall=h.calls.find(c=>c.external_customer_id&&c.metadata?.is_upgrade==='true');
 assert.ok(checkoutCall);
 assert.deepEqual(checkoutCall.products,[h.yearlyProduct]);
 assert.equal(checkoutCall.metadata.previous_subscription_id,'sub_month');
 assert.equal(checkoutCall.discount_id,h.discountId);
});

test('monthly subscriber upgrading to lifetime opens full-price checkout with NO discount',async()=>{
 const h=harness();
 const end=new Date(Date.now() + 25*86400000).toISOString();
 h.tables.billing_subscriptions.push({polar_subscription_id:'sub_month2',environment:'sandbox',customer_id:h.customer,plugin_slug:'whatsapp-commerce',site_id:'site-a',cadence:'monthly',status:'active',current_period_end:end,cancel_at_period_end:false});
 h.tables.billing_orders.push({environment:'sandbox',polar_order_id:'order_month2',customer_id:h.customer,plugin_slug:'whatsapp-commerce',cadence:'monthly',product_id:h.monthlyProduct,status:'paid',amount:500,subtotal_amount:500,discount_amount:0,refunded_amount:0,currency:'usd',purchased_at:new Date().toISOString(),subscription_id:'sub_month2',site_id:'site-a'});

 const response=await h.request('checkout',{cadence:'lifetime',request_id:randomUUID()});
 assert.equal(response.status,200);
 assert.ok(response.data.url);

 // Lifetime MUST NOT create a discount
 const discountCall=h.calls.find(c=>c.method==='discounts.create');
 assert.equal(discountCall,undefined,'Strictly NO discount for lifetime package');

 const checkoutCall=h.calls.find(c=>c.external_customer_id&&c.metadata?.is_upgrade==='true');
 assert.ok(checkoutCall);
 assert.deepEqual(checkoutCall.products,[h.product]);
 assert.equal(checkoutCall.discount_id,undefined,'Lifetime checkout must have no discount');
});

test('monthly subscriber attempting duplicate monthly checkout is rejected',async()=>{
 const h=harness();
 const end=new Date(Date.now() + 25*86400000).toISOString();
 h.tables.billing_subscriptions.push({polar_subscription_id:'sub_month3',environment:'sandbox',customer_id:h.customer,plugin_slug:'whatsapp-commerce',site_id:'site-a',cadence:'monthly',status:'active',current_period_end:end,cancel_at_period_end:false});

 const response=await h.request('checkout',{cadence:'monthly',request_id:randomUUID()});
 assert.equal(response.status,409);
 assert.match(response.data.error,/Pro is already active/);
});

test('lifetime subscriber attempting any checkout is rejected',async()=>{
 const h=harness();
 h.tables.billing_orders.push({environment:'sandbox',polar_order_id:'order_life',customer_id:h.customer,plugin_slug:'whatsapp-commerce',cadence:'lifetime',product_id:h.product,status:'paid',amount:9900,subtotal_amount:9900,discount_amount:0,refunded_amount:0,currency:'usd',purchased_at:new Date().toISOString(),subscription_id:null,site_id:'site-a'});

 const yearlyRes=await h.request('checkout',{cadence:'yearly',request_id:randomUUID()});
 assert.equal(yearlyRes.status,409);
 const lifeRes=await h.request('checkout',{cadence:'lifetime',request_id:randomUUID()});
 assert.equal(lifeRes.status,409);
});
