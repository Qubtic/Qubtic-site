import ts from 'typescript';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
const native=createRequire(import.meta.url);
function load(file,deps){const out={};const code=ts.transpileModule(readFileSync(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','exports',code)(name=>name in deps?deps[name]:native(name),out);return out;}
const registry=load('src/lib/plugins-registry.ts',{});
async function database(){const db=new PGlite();await db.exec('create role anon;create role authenticated;create role service_role;');for(const file of ['framer_users.sql','pairing_sessions.sql','billing.sql','billing_discounts.sql','billing_sites.sql','billing_telegram_sites.sql','migrations/20261104092628_plugin_control.sql','migrations/20261104095407_plugin_operations.sql','migrations/20261104112717_smtp_credentials_to_vercel.sql','migrations/20261106115046_plugin_catalog_uuid_publish.sql','migrations/20261106122130_dashboard_plugin_registry.sql'])await db.exec(readFileSync(new URL('../supabase/'+file,import.meta.url),'utf8'));return db;}

test('registration preserves live catalogs, denies public access, validates permanent IDs and enforces bounded undo',async()=>{
 const db=await database();try{
 const call=async(action,slug,name,actor='admin',id=null)=>(await db.query('select manage_plugin_registration($1,$2,$3,$4,$5) result',[action,slug,name,actor,id])).rows[0].result;
 assert.equal((await db.query('select count(*)::int n from plugin_registry where builtin')).rows[0].n,5);
 await db.exec('set role service_role');await call('create','service-check','Service Check');await db.exec('reset role');
 for(const slug of ['telegram-commerce','email-commerce','framedrop','plugin','framedrop-auth','keyvault','Bad ID','bad_id'])await assert.rejects(()=>call('create',slug,'Example'));
 await assert.rejects(()=>call('create','sample','<script>'));await assert.rejects(()=>call('create','sample','Bad\nName'));
 const result=await call('create','catalog-tool','Catalog Tool');await assert.rejects(()=>call('create','catalog-tool','Duplicate'));
 assert.equal((await db.query('select count(*)::int n from billing_catalog')).rows[0].n,0);assert.equal((await db.query('select count(*)::int n from plugin_control')).rows[0].n,0);
 await assert.rejects(()=>call('undo',null,null,'other-admin',result.id));await call('undo',null,null,'admin',result.id);
 assert.equal((await db.query("select cancelled_at is not null cancelled from plugin_registry where slug='catalog-tool'")).rows[0].cancelled,true);
 const again=await call('create','catalog-tool','Updated Tool');await db.query("update plugin_registration_actions set undo_until=now()-interval '1 second' where id=$1",[again.id]);await assert.rejects(()=>call('undo',null,null,'admin',again.id));
 const used=await call('create','used-tool','Used Tool');await db.query("insert into plugin_control(id,settings) values('polar:production',$1)",[JSON.stringify({enabled:false,plugins:[{slug:'used-tool'}]})]);await assert.rejects(()=>call('undo',null,null,'admin',used.id));
 for(const role of ['anon','authenticated']){
  for(const table of ['plugin_registry','plugin_registration_actions'])for(const privilege of ['SELECT','INSERT','UPDATE','DELETE'])assert.equal((await db.query('select has_table_privilege($1,$2,$3) allowed',[role,table,privilege])).rows[0].allowed,false);
  assert.equal((await db.query("select has_function_privilege($1,'manage_plugin_registration(text,text,text,text,uuid)','EXECUTE') allowed",[role])).rows[0].allowed,false);
 }
 assert.equal((await db.query("select relrowsecurity enabled from pg_class where oid='plugin_registry'::regclass")).rows[0].enabled,true);
 }finally{await db.close();}
});

test('registration API uses signed admin authority, rejects aliases and passes only identity fields to SQL',async()=>{
 let allowed=false, args;const api=load('src/app/api/admin/plugin-registry/route.ts',{
 '@/lib/admin-guard':{requirePluginAdmin:async request=>{if(!allowed)throw Error('Administrator access required.');if(request.headers.get('origin')!=='https://admin.test')throw Error('Invalid request origin.');return {id:'real-admin'};}},
 '@/lib/plugins-registry':registry,'@/lib/supabase':{supabase:{rpc:async(name,input)=>{args=input;return {data:{id:'11111111-1111-4111-8111-111111111111',undoUntil:new Date(Date.now()+5000).toISOString()}};}}}
 });
 const request=(body,origin='https://admin.test')=>new Request('https://admin.test/api/admin/plugin-registry',{method:'POST',headers:{origin},body:JSON.stringify(body)});
 assert.equal((await api.POST(request({action:'create',slug:'my-tool',name:'My Tool'}))).status,401);allowed=true;
 assert.equal((await api.POST(request({action:'create',slug:'my-tool',name:'My Tool'},'https://attacker.test'))).status,400);
 for(const slug of ['telegram-commerce','email-commerce','framedrop','bad_id','UpperCase'])assert.equal((await api.POST(request({action:'create',slug,name:'Tool'}))).status,400);
 const response=await api.POST(request({action:'create',slug:'my-tool',name:' My Tool ',enabled:true,secrets:{accessToken:'never-store'},actor:'forged-admin'}));
 assert.equal(response.status,200);assert.equal((await response.json()).undo.action,'undo-registration');assert.equal(args.p_actor,'real-admin');assert.equal(args.p_name,'My Tool');assert.deepEqual(Object.keys(args).sort(),['p_action','p_actor','p_id','p_name','p_slug']);
});

test('dynamic registrations merge with canonical builtins without mutating the static registry and supply custom auth branding',async()=>{
 const before=Object.keys(registry.REGISTERED_PLUGINS).length;
 const q={select(){return q},is(){return q},eq(){return q},order:async()=>({data:[{slug:'new-tool',name:'Custom Tool Name'}]}),maybeSingle:async()=>({data:{name:'Custom Tool Name'}})};
 const managed=load('src/lib/managed-plugins.ts',{'server-only':{},'./plugins-registry':registry,'./supabase':{supabase:{from:table=>table==='plugin_control'?{select(){return this},eq(){return this},maybeSingle:async()=>({data:{settings:{plugins:[{slug:'new-tool',logo:'https://res.cloudinary.com/demo/image/upload/tool.png'}]}}})}:q}}});
 const list=await managed.registeredPlugins();assert.equal(new Set(list.map(p=>p.slug)).size,list.length);assert.equal(list.find(p=>p.slug==='new-tool').name,'Custom Tool Name');assert.equal(Object.keys(registry.REGISTERED_PLUGINS).length,before);
 const metadata=await managed.serverPluginMetadata('new-tool');assert.equal(metadata.name,'Custom Tool Name');assert.match(metadata.logo,/tool.png/);assert.equal((await managed.serverPluginMetadata('email-commerce')).slug,'whatsapp-commerce');
});
