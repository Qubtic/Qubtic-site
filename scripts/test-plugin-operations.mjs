import ts from 'typescript';
import {createRequire} from 'node:module';
const native=createRequire(import.meta.url);
import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {PGlite} from '@electric-sql/pglite';
test('operations preserve payment history, protect private data and support bounded conflict-safe undo',async()=>{
 const db=new PGlite();try{
 await db.exec('create role anon;create role authenticated;create role service_role;');
 for(const file of ['framer_users.sql','pairing_sessions.sql','billing.sql','billing_discounts.sql','billing_sites.sql','billing_telegram_sites.sql','migrations/20261104092628_plugin_control.sql','migrations/20261104095407_plugin_operations.sql'])await db.exec(readFileSync(new URL('../supabase/'+file,import.meta.url),'utf8'));
 const patch={email:'user@example.test',name:'New user',company_name:'Studio',website_url:'https://example.test',plugin_slug:'telegram-commerce',plugin_name:'Telegram Commerce',auth_token:'never-expose-this-token'};
 const call=async(action,id,body)=>(await db.query('select plugin_admin_mutate($1,$2,$3,$4) as result',[action,id,JSON.stringify(body),'admin'])).rows[0].result;
 const created=await call('create',null,patch);const uid=(await db.query("select id from framer_users where email='user@example.test'")).rows[0].id;
 const snapshot=(await db.query("select plugin_operations_snapshot('production','','',0) as result")).rows[0].result;
 assert.equal(snapshot.totalUsers,1);assert.equal(snapshot.users[0].email_verified,false);assert.ok(!JSON.stringify(snapshot).includes('never-expose-this-token'));assert.equal(snapshot.daily.length,30);
 const version=(await db.query('select updated_at::text as value from framer_users where id=$1',[uid])).rows[0].value;
 const changed=await call('update',uid,{name:'Edited',company_name:'Studio',website_url:'https://example.test',status:'suspended',expected_updated_at:version});
 await assert.rejects(()=>call('update',uid,{name:'stale',status:'active',expected_updated_at:version}));
 await db.query('select undo_plugin_admin_action($1,$2)',[changed.id,'admin']);assert.equal((await db.query('select status from framer_users where id=$1',[uid])).rows[0].status,'pending_verification');
 await assert.rejects(()=>db.query('select undo_plugin_admin_action($1,$2)',[changed.id,'admin']));
 await db.query("update plugin_admin_actions set undo_until=now()-interval '1 second' where id=$1",[created.id]);await assert.rejects(()=>db.query('select undo_plugin_admin_action($1,$2)',[created.id,'admin']));
 await db.exec("insert into plugin_team_events(id,event,plugin,email,available_at) values('future','manual','telegram-commerce','user@example.test',now()+interval '10 seconds'),('cancelled','manual','telegram-commerce','user@example.test',now()-interval '1 second');update plugin_team_events set cancelled_at=now() where id='cancelled';");assert.equal((await db.query('select * from claim_plugin_team_events()')).rows.length,0);
 await db.exec("update plugin_team_events set actor='admin' where id='future'");await assert.rejects(()=>db.query("select cancel_plugin_admin_mail('future','other-admin')"));await db.query("select cancel_plugin_admin_mail('future','admin')");assert.equal((await db.query("select cancelled_at is not null as cancelled from plugin_team_events where id='future'")).rows[0].cancelled,true);
 for(const table of ['plugin_admin_actions','plugin_mail_log'])assert.equal((await db.query("select has_table_privilege('anon',$1,'SELECT') as allowed",[table])).rows[0].allowed,false);
 // Undo of settings uses prior encrypted credentials and cannot overwrite a newer revision.
 const publish=async(rev,value)=>db.query("select publish_plugin_control('mail',$1,'cipher',$2,'admin',null)",[JSON.stringify({teamEmail:value}),rev]);
 await publish(0,'first@example.test');await publish(1,'second@example.test');const aid=(await db.query("select id from plugin_control_audit where config_id='mail' and revision=2")).rows[0].id;await db.query("select undo_plugin_control($1,'admin')",[aid]);assert.equal((await db.query("select settings from plugin_control where id='mail'")).rows[0].settings.teamEmail,'first@example.test');await assert.rejects(()=>db.query("select undo_plugin_control($1,'admin')",[aid]));
 }finally{await db.close();}
});


test('operations API authenticates filters and ignores injected licensing and recipient fields',async()=>{
 let authorized=false;const calls=[];let inserted;
 const exports={};const source=ts.transpileModule(readFileSync(new URL('../src/app/api/admin/plugin-operations/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const deps={
 '@/lib/admin-guard':{requirePluginAdmin:async request=>{if(!authorized)throw Error('Administrator access required.');if(request&&request.headers.get('origin')!=='https://admin.test')throw Error('Invalid request origin.');return {id:'admin'};}},
 '@/lib/plugins-registry':{REGISTERED_PLUGINS:{'telegram-commerce':{slug:'telegram-commerce',name:'Telegram Commerce'}}},
 '@/lib/supabase':{supabase:{rpc:async(name,args)=>{calls.push({name,args});return {data:{id:'audit',undoUntil:new Date(Date.now()+5000).toISOString()}};},from:()=>({select(){return this},eq(){return this},maybeSingle:async()=>({data:{email:'real@example.test',plugin_slug:'telegram-commerce'}}),insert:async value=>{inserted=value;return {};}})}}};
 new Function('require','exports',source)(name=>name in deps?deps[name]:native(name),exports);
 assert.equal((await exports.GET(new Request('https://admin.test/api/admin/plugin-operations'))).status,401);authorized=true;
 assert.equal((await exports.GET(new Request('https://admin.test/api/admin/plugin-operations'))).status,200);assert.equal(calls[0].args.p_environment,'production');
 assert.equal((await exports.GET(new Request('https://admin.test/api/admin/plugin-operations?environment=invalid'))).status,400);
 const post=body=>exports.POST(new Request('https://admin.test/api/admin/plugin-operations',{method:'POST',headers:{origin:'https://admin.test'},body:JSON.stringify(body)}));
 assert.equal((await post({action:'update',userId:'user',patch:{name:'Name',company_name:'',website_url:'',status:'active',expected_updated_at:new Date().toISOString(),plan:'pro',auth_token:'injected',metadata:{email_verified:true}}})).status,200);
 const patch=calls.at(-1).args.p_patch;assert.equal(patch.plan,undefined);assert.equal(patch.auth_token,undefined);assert.equal(patch.metadata,undefined);
 assert.equal((await post({action:'mail',userId:'user',email:'attacker@example.test',subject:'Account support',message:'A plain text message'})).status,200);assert.equal(inserted.email,'real@example.test');assert.equal(inserted.actor,'admin');assert.ok(Date.parse(inserted.available_at)>Date.now());
});


test('SMTP cleanup removes old credentials and undo snapshots without changing Polar or team preferences',async()=>{
 const db=new PGlite();try{
 await db.exec('create role anon;create role authenticated;create role service_role;');
 for(const file of ['framer_users.sql','pairing_sessions.sql','billing.sql','billing_discounts.sql','billing_sites.sql','billing_telegram_sites.sql','migrations/20261104092628_plugin_control.sql','migrations/20261104095407_plugin_operations.sql'])await db.exec(readFileSync(new URL('../supabase/'+file,import.meta.url),'utf8'));
 const old={teamEmail:'team@example.test',signup:true,signin:false,purchase:true,host:'old-smtp',user:'old-user',password:'old-password',from:'old@example.test'};
 const publish=(settings,revision)=>db.query("select publish_plugin_control('mail',$1,'old-mail-ciphertext',$2,'admin',null)",[JSON.stringify(settings),revision]);
 await publish(old,0);await publish(old,1);await db.query("select publish_plugin_control('polar:production','{}','polar-ciphertext',0,'admin',null)");
 await db.exec(readFileSync(new URL('../supabase/migrations/20261104112717_smtp_credentials_to_vercel.sql',import.meta.url),'utf8'));
 const expected={teamEmail:'team@example.test',signup:true,signin:false,purchase:true};
 let row=(await db.query("select * from plugin_control where id='mail'")).rows[0];assert.equal(row.secrets,'');assert.deepEqual(row.settings,expected);assert.equal(row.revision,3);
 assert.equal((await db.query("select secrets from plugin_control where id='polar:production'")).rows[0].secrets,'polar-ciphertext');
 const snapshots=(await db.query("select prior_secrets,prior_settings from plugin_control_audit where config_id='mail'")).rows;assert.ok(snapshots.every(a=>a.prior_secrets===null));assert.deepEqual(snapshots[1].prior_settings,expected);
 await publish(old,3);row=(await db.query("select * from plugin_control where id='mail'")).rows[0];assert.equal(row.secrets,'');assert.deepEqual(row.settings,expected);
 const audit=(await db.query("select id from plugin_control_audit where config_id='mail' order by id desc limit 1")).rows[0];await db.query("select undo_plugin_control($1,'admin')",[audit.id]);assert.equal((await db.query("select secrets from plugin_control where id='mail'")).rows[0].secrets,'');
 for(const role of ['anon','authenticated'])assert.equal((await db.query("select has_function_privilege($1,'sanitize_plugin_mail_preferences()','EXECUTE') as allowed",[role])).rows[0].allowed,false);
 }finally{await db.close();}
});
