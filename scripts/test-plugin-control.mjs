import { createRequire } from 'node:module';
import * as billingConfig from '../src/lib/billing/config.mjs';
const native=createRequire(import.meta.url);
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {randomBytes} from 'node:crypto';
import {encryptSecrets,decryptSecrets} from '../src/lib/plugin-secrets.mjs';
import ts from 'typescript';
function load(file,deps){const exports={};const code=ts.transpileModule(readFileSync(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','exports',code)(name=>{return name in deps?deps[name]:native(name);},exports);return exports;}
test('credentials are encrypted, authenticated, bound to their row and fail closed with the wrong key',()=>{
 const key=randomBytes(32).toString('base64');const secret={accessToken:'private-token',webhookSecret:'private-signing-secret'};
 const cipher=encryptSecrets(secret,key,'polar:production');assert.ok(!cipher.includes('private'));assert.deepEqual(decryptSecrets(cipher,key,'polar:production'),secret);
 assert.throws(()=>decryptSecrets(cipher,key,'polar:sandbox'));assert.throws(()=>decryptSecrets(cipher,randomBytes(32).toString('base64'),'polar:production'));assert.throws(()=>encryptSecrets(secret,'bad','mail'));
});
test('publishing uses revisions and atomically preserves unrelated environments, audit and historical product ownership',async()=>{
 const db=new PGlite();try{
 await db.exec("create role anon;create role authenticated;create role service_role;create table billing_catalog(environment text,product_id text,plugin_slug text,cadence text,benefit_id text,enabled boolean,primary key(environment,product_id));");
 await db.exec(readFileSync(new URL('../supabase/migrations/20261104092628_plugin_control.sql',import.meta.url),'utf8'));
 const publish=(id,revision,rows)=>db.query('select publish_plugin_control($1,$2,$3,$4,$5,$6)',[id,JSON.stringify({enabled:true}),'encrypted-only',revision,'admin',JSON.stringify(rows)]);
 const rows=[{product_id:'product',plugin_slug:'telegram-commerce',cadence:'yearly',benefit_id:'benefit'}];
 await publish('polar:production',0,rows);await publish('polar:sandbox',0,rows);
 await assert.rejects(()=>publish('polar:production',0,rows));
 await assert.rejects(()=>publish('polar:production',1,[{...rows[0],plugin_slug:'other-plugin'}]));
 assert.equal((await db.query("select revision from plugin_control where id='polar:production'")).rows[0].revision,1);
 assert.equal((await db.query("select count(*)::int as n from billing_catalog where enabled")).rows[0].n,2);
 assert.equal((await db.query('select count(*)::int as n from plugin_control_audit')).rows[0].n,2);
 for(const role of ['anon','authenticated']){
 assert.equal((await db.query("select has_table_privilege($1,'plugin_control','SELECT') as allowed",[role])).rows[0].allowed,false);
 assert.equal((await db.query("select has_function_privilege($1,'publish_plugin_control(text,jsonb,text,integer,text,jsonb)','EXECUTE') as allowed",[role])).rows[0].allowed,false);
 }
 }finally{await db.close();}
});
test('admin API denies unsigned users and cross-origin writes and never returns stored secrets',async()=>{
 let session=null;const calls=[];
 const row={id:'polar:production',settings:{enabled:false},secrets:'ciphertext',revision:1};
 const query={select(){return query;},order(){return query;},limit(){return Promise.resolve({data:[]});},then(resolve){return Promise.resolve({data:[row]}).then(resolve);}};
 const api=load('src/app/api/admin/plugins/route.ts',{
 '@/lib/plugins-registry':load('src/lib/plugins-registry.ts',{}),
 'next/headers':{cookies:async()=>({get:()=>({value:'cookie'})})},'@/lib/admin-session':{verifyAdminSession:()=>session},'@/lib/supabase':{supabase:{from:()=>query}},'@/lib/plugin-control':{controlRecord:async()=>row,recordSecrets:()=>({accessToken:'never-return-this'})},'@/lib/plugin-secrets.mjs':{encryptSecrets},'@/lib/billing/config.mjs':{},'@polar-sh/sdk/2026-10':{},nodemailer:{}
 });
 assert.equal((await api.GET()).status,401);session={id:'admin',role:'admin'};
 const response=await api.GET();const data=await response.json();assert.equal(data.records[0].secrets,undefined);assert.deepEqual(data.records[0].configuredSecrets,['accessToken']);assert.ok(!JSON.stringify(data).includes('never-return-this'));
 assert.equal((await api.POST(new Request('https://site.test/api/admin/plugins',{method:'POST',headers:{origin:'https://attacker.test'},body:'{}'}))).status,400);
 assert.equal(calls.length,0);
});


test('sandbox is restricted to approved verified accounts while production is independent',async()=>{
 const user={id:'user',email:'tester@example.test',plugin_slug:'telegram-commerce',status:'active',metadata:{email_verified:true}};
 let allowed='';
 const core=load('src/lib/billing/core.ts',{
 'server-only':{},'./config.mjs':billingConfig,'./upgrade-refunds':{},'../email-service':{},
 '../plugin-control':{loadManagedBilling:async selected=>({POLAR_ENVIRONMENT:selected,managed:'true',MANAGED_PLUGINS:JSON.stringify([{slug:'telegram-commerce',enabled:true,testEmails:allowed}])})},
 '@supabase/supabase-js':{createClient:()=>({from:()=>{const q={select(){return q},eq(){return q},maybeSingle:async()=>({data:user})};return q;}})},'@polar-sh/sdk/2026-10':{}
 });
 process.env.SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='test-only';
 const request=selected=>{const req=new Request('https://example.test/api/billing/status',{headers:{Authorization:'Bearer test','X-Billing-Environment':selected}});return core.billingRequest(req,async()=>Response.json(await core.actor(req)));};
 assert.equal((await request('sandbox')).status,403);assert.equal((await request('production')).status,200);
 allowed='tester@example.test';assert.equal((await request('sandbox')).status,200);user.metadata.email_verified=false;assert.equal((await request('sandbox')).status,401);
});
