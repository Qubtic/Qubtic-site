import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { randomUUID } from 'node:crypto';
async function setup(){const db=new PGlite();await db.exec('create role anon;create role authenticated;create role service_role;');for(const file of ['framer_users.sql','pairing_sessions.sql','billing.sql','billing.sql'])await db.exec(await readFile(new URL(`../supabase/${file}`,import.meta.url),'utf8'));return db;}
test('billing identity joins only verified memberships and separates sandbox from production',async()=>{
 const db=await setup();try{
 const ids=[randomUUID(),randomUUID(),randomUUID()];
 for(let i=0;i<3;i++)await db.query("insert into framer_users(id,email,plugin_slug,auth_token,metadata)values($1,'same@example.test',$2,$3,$4)",[ids[i],['frame-drop','whatsapp-commerce','qube-auth'][i],'tok'+i,JSON.stringify({email_verified:i<2})]);
 const identity=async(id,env)=>(await db.query('select billing_identity($1,$2) as id',[id,env])).rows[0].id;
 assert.equal(await identity(ids[0],'sandbox'),await identity(ids[1],'sandbox'));
 assert.notEqual(await identity(ids[0],'production'),await identity(ids[0],'sandbox'));
 await assert.rejects(()=>identity(ids[2],'production'));
 assert.equal((await db.query('select count(*)::int as count from billing_memberships')).rows[0].count,3);
 for(const role of ['anon','authenticated']){const {rows}=await db.query(`select has_table_privilege('${role}','billing_orders','SELECT') as orders,has_table_privilege('${role}','framer_users','UPDATE') as auth,has_function_privilege('${role}','billing_identity(uuid,text)','EXECUTE') as rpc`);assert.deepEqual(rows[0],{orders:false,auth:false,rpc:false});}
 }finally{await db.close();}
});
test('atomic snapshots reject stale updates, preserve other plugins, upsert orders, and reject customer reassignment',async()=>{
 const db=await setup();try{
 const customer=randomUUID();await db.query("insert into billing_customers(id,email,environment)values($1,'payer@example.test','sandbox')",[customer]);
 const product=randomUUID();await db.query("insert into billing_catalog values('frame-drop','lifetime','sandbox',$1,$2,true)",[product,randomUUID()]);
 const order={id:'order1',plugin_slug:'frame-drop',cadence:'lifetime',product_id:product,status:'paid',amount:4900,refunded_amount:0,currency:'usd',created_at:'2026-10-30T00:00:00Z',subscription_id:null};
 const apply=async(time,grants,orders=[order])=>(await db.query('select billing_apply_snapshot($1,$2,$3,$4,$5,$6) as applied',[customer,time,'polar-customer',JSON.stringify(grants),JSON.stringify(orders),'[]'])).rows[0].applied;
 assert.equal(await apply('2026-10-30T01:00:00Z',[{plugin_slug:'frame-drop'}]),true);
 assert.equal(await apply('2026-10-30T00:59:00Z',[]),false);
 assert.equal((await db.query('select is_pro from plugin_entitlements')).rows[0].is_pro,true);
 await apply('2026-10-30T02:00:00Z',[],[{...order,status:'refunded',refunded_amount:4900}]);
 assert.equal((await db.query('select is_pro from plugin_entitlements')).rows[0].is_pro,false);
 assert.equal((await db.query('select count(*)::int as n from billing_orders')).rows[0].n,1);
 await assert.rejects(()=>db.query("select billing_apply_snapshot($1,now(),'another-customer','[]','[]','[]')",[customer]));
 }finally{await db.close();}
});
test('checkout uniqueness prevents concurrent active purchases and throttle persists limits',async()=>{
 const db=await setup();try{
 const user=randomUUID(),customer=randomUUID(),product=randomUUID();await db.query("insert into framer_users(id,email,plugin_slug,auth_token)values($1,'a@example.test','frame-drop','token')",[user]);await db.query("insert into billing_customers(id,email,environment)values($1,'a@example.test','sandbox')",[customer]);
 const insert=()=>db.query("insert into billing_checkouts(user_id,customer_id,environment,plugin_slug,cadence,product_id,request_key)values($1,$2,'sandbox','frame-drop','monthly',$3,$4)",[user,customer,product,randomUUID()]);
 await insert();await assert.rejects(insert);
 await db.exec("update billing_checkouts set status='succeeded'");await insert();
 assert.equal((await db.query("select billing_throttle('test',1,60) as allowed")).rows[0].allowed,true);
 assert.equal((await db.query("select billing_throttle('test',1,60) as allowed")).rows[0].allowed,false);
 }finally{await db.close();}
});

test('atomic email verification consumes codes once and persists attempt limits across workers',async()=>{
 const db=await setup();try{
 const id=randomUUID();await db.query("insert into framer_users(id,email,plugin_slug,auth_token,status,metadata)values($1,'verify@example.test','frame-drop','otp-token','pending_verification',$2)",[id,JSON.stringify({otp_code:'123456',otp_expires_at:Date.now()+60000})]);
 const verify=(code,plugin='frame-drop')=>db.query("select auth_verify_code('verify@example.test',$1,$2,'otp') as ok",[plugin,code]);
 assert.equal((await verify('123456','whatsapp-commerce')).rows[0].ok,false);
 assert.equal((await verify('123456')).rows[0].ok,true);assert.equal((await verify('123456')).rows[0].ok,false);
 await db.query('update framer_users set metadata=$1 where id=$2',[JSON.stringify({otp_code:'123456',otp_expires_at:Date.now()+60000}),id]);
 for(let i=0;i<5;i++)assert.equal((await verify('000000')).rows[0].ok,false);
 assert.equal((await verify('123456')).rows[0].ok,false);
 }finally{await db.close();}
});

test('ENV catalog synchronization is atomic, retains history, and refuses cross-plugin product reassignment',async()=>{
 const db=await setup();try{
 await db.exec(await readFile(new URL('../supabase/billing_central_config.sql',import.meta.url),'utf8'));
 const products=[randomUUID(),randomUUID(),randomUUID()],benefit=randomUUID();
 const rows=['monthly','yearly','lifetime'].map((cadence,i)=>({plugin_slug:'whatsapp-commerce',cadence,product_id:products[i],benefit_id:benefit}));
 const sync=async(data,env='sandbox')=>db.query('select billing_configure_catalog($1,$2) as count',[env,JSON.stringify(data)]);
 assert.equal((await sync(rows)).rows[0].count,3);assert.equal((await sync(rows)).rows[0].count,3);
 const replacement=rows.map((row,i)=>i?row:{...row,product_id:randomUUID()});await sync(replacement);
 assert.equal((await db.query('select count(*)::int as count from billing_catalog')).rows[0].count,4);
 assert.equal((await db.query('select enabled from billing_catalog where product_id=$1',[products[0]])).rows[0].enabled,false);
 await assert.rejects(()=>sync(replacement.map(row=>({...row,plugin_slug:'frame-drop'}))));
 assert.equal((await db.query('select count(*)::int as count from billing_catalog where enabled')).rows[0].count,3);
 assert.equal((await db.query("select has_function_privilege('anon','billing_configure_catalog(text,jsonb)','EXECUTE') as allowed")).rows[0].allowed,false);
 }finally{await db.close();}
});
test('discount migration stores provider subtotal, discount and charged amount in plugin payment history',async()=>{
 const db=await setup();try{
  const migration=await readFile(new URL('../supabase/billing_discounts.sql',import.meta.url),'utf8');await db.exec(migration);await db.exec(migration);
  const customer=randomUUID(),product=randomUUID();await db.query("insert into billing_customers(id,email,environment) values($1,'discount@example.test','sandbox')",[customer]);
  await db.query("insert into billing_catalog values('whatsapp-commerce','lifetime','sandbox',$1,$2,true)",[product,randomUUID()]);
  const order={id:'discount-order',plugin_slug:'whatsapp-commerce',cadence:'lifetime',product_id:product,status:'paid',amount:7999,subtotal_amount:9999,discount_amount:2000,discount_id:randomUUID(),refunded_amount:0,currency:'usd',created_at:'2026-10-30T00:00:00Z'};
  await db.query('select billing_apply_snapshot($1,$2,$3,$4,$5,$6)',[customer,'2026-10-30T01:00:00Z','polar-discount-customer','[]',JSON.stringify([order]),'[]']);
  const {rows}=await db.query('select amount,subtotal_amount,discount_amount,discount_id from whatsapp_commerce_plugin_payments where polar_order_id=$1',[order.id]);
  assert.equal(Number(rows[0].amount),7999);assert.equal(Number(rows[0].subtotal_amount),9999);assert.equal(Number(rows[0].discount_amount),2000);assert.equal(rows[0].discount_id,order.discount_id);
 }finally{await db.close();}
});
