import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';

test('Frame Drop purchase unlocks only its bound website, with no account-wide or sandbox leakage',async()=>{
 const db=new PGlite();
 try{
  await db.exec('create role anon;create role authenticated;create role service_role;');
  for(const name of ['framer_users.sql','pairing_sessions.sql','billing.sql','billing_discounts.sql','billing_sites.sql','billing_telegram_sites.sql','billing_environments.sql','billing_discounted_orders.sql','billing_framedrop_sites.sql','billing_framedrop_sites.sql'])await db.exec(await readFile(new URL('../supabase/'+name,import.meta.url),'utf8'));
  const user=randomUUID(),product=randomUUID(),benefit=randomUUID();
  await db.query("insert into framer_users(id,email,plugin_slug,auth_token,status,metadata) values($1,'buyer@example.test','frame-drop','test-only','active','{\"email_verified\":true}')",[user]);
  const customer=(await db.query("select billing_identity($1,'production') as id",[user])).rows[0].id;
  await db.query("insert into billing_catalog(plugin_slug,cadence,environment,product_id,benefit_id,enabled)values('frame-drop','lifetime','production',$1,$2,true)",[product,benefit]);
  await db.query("insert into billing_checkouts(user_id,customer_id,environment,plugin_slug,cadence,product_id,request_key,polar_checkout_id,site_id,status)values($1,$2,'production','frame-drop','lifetime',$3,$4,'checkout-a','site-a','succeeded')",[user,customer,product,randomUUID()]);
  const order={id:'order-a',plugin_slug:'frame-drop',cadence:'lifetime',product_id:product,status:'paid',amount:7999,refunded_amount:0,currency:'usd',created_at:new Date().toISOString(),site_id:'site-a'};
  const apply=async(grants,orders)=>db.query('select billing_apply_site_snapshot($1,$2,$3,$4,$5,$6,$7)',[customer,new Date().toISOString(),'polar-buyer',JSON.stringify([{plugin_slug:'frame-drop'}]),JSON.stringify(orders),'[]',JSON.stringify(grants)]);
  await apply([{plugin_slug:'frame-drop',site_id:'site-a'}],[order]);
  const access=async(site,environment='production',plugin='frame-drop')=>(await db.query('select billing_site_access($1,$2,$3,$4) as allowed',[user,plugin,environment,site])).rows[0].allowed;
  assert.equal(await access('site-a'),true);
  assert.equal(await access('site-b'),false);
  assert.equal(await access(null),false);
  assert.equal(await access('site-a','sandbox'),false);
  assert.equal(await access('site-a','production','telegram-commerce'),false);
  assert.equal((await db.query("select count(*)::int as count from plugin_entitlements where plugin_slug='frame-drop' and is_pro")).rows[0].count,0);
  assert.equal((await db.query("select billing_site_has_purchase($1,'site-a','frame-drop') as paid",[customer])).rows[0].paid,true);
  assert.equal((await db.query("select billing_site_has_purchase($1,'site-b','frame-drop') as paid",[customer])).rows[0].paid,false);
  await assert.rejects(()=>db.query("insert into billing_checkouts(user_id,customer_id,environment,plugin_slug,cadence,product_id,request_key,site_id)values($1,$2,'production','frame-drop','lifetime',$3,$4,'site-a')",[user,customer,product,randomUUID()]));
  await db.query("insert into billing_checkouts(user_id,customer_id,environment,plugin_slug,cadence,product_id,request_key,site_id)values($1,$2,'production','frame-drop','lifetime',$3,$4,'site-b')",[user,customer,product,randomUUID()]);
  // Payment reversals remove access only after the authoritative snapshot updates.
  await apply([],[{...order,status:'refunded',refunded_amount:7999}]);
  assert.equal(await access('site-a'),false);
  for(const role of ['anon','authenticated'])assert.equal((await db.query(`select has_function_privilege('${role}','billing_site_access(uuid,text,text,text)','EXECUTE') as allowed`)).rows[0].allowed,false);
 }finally{await db.close();}
});
