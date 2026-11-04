import nextEnv from '@next/env';
import {createClient} from '@supabase/supabase-js';
import {resolveBillingConfig,configuredCatalog} from '../src/lib/billing/config.mjs';
import {encryptSecrets} from '../src/lib/plugin-secrets.mjs';
nextEnv.loadEnvConfig(process.cwd(),false);
if(!process.argv.includes('--apply')){console.log('Run with --apply after applying the plugin control migration. Reads legacy local ENV and imports encrypted records. No secrets are printed.');process.exit(0);}
const db=createClient(process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const configs=[];
for(const environment of ['production','sandbox']) {
 const env=resolveBillingConfig(process.env,environment);const catalog=configuredCatalog(env);
 if(!env.POLAR_ACCESS_TOKEN||!catalog.length)continue;
 const plugins=[...new Set(catalog.map(r=>r.plugin_slug))].map(slug=>({slug,name:slug==='whatsapp-commerce'?'Email Commerce':slug,enabled:true,manifest:'{}',testEmails:'',plans:catalog.filter(r=>r.plugin_slug===slug).map(r=>({cadence:r.cadence,productId:r.product_id,benefitId:r.benefit_id}))}));
 configs.push({id:'polar:'+environment,settings:{enabled:true,organizationId:env.POLAR_ORGANIZATION_ID,plugins},secrets:{accessToken:env.POLAR_ACCESS_TOKEN,webhookSecret:env.POLAR_WEBHOOK_SECRET},catalog});
}
if(process.env.TEAM_NOTIFICATION_EMAIL||process.env.SMTP_FROM_EMAIL)configs.push({id:'mail',settings:{teamEmail:process.env.TEAM_NOTIFICATION_EMAIL||process.env.SMTP_FROM_EMAIL,signup:true,signin:false,purchase:true},secrets:{},catalog:null});
// Encrypt/validate everything before the first write. Existing dashboard rows are never overwritten.
for(const row of configs)row.encrypted=row.id==='mail'?'':encryptSecrets(row.secrets,process.env.PLUGIN_CONFIG_ENCRYPTION_KEY,row.id);
for(const row of configs){const {data:existing,error:readError}=await db.from('plugin_control').select('id').eq('id',row.id).maybeSingle();if(readError)throw new Error('Apply the migration first.');if(existing){console.log(row.id+': already configured; skipped.');continue;}
const {error}=await db.rpc('publish_plugin_control',{p_id:row.id,p_settings:row.settings,p_secrets:row.encrypted,p_revision:0,p_actor:'local-bootstrap',p_catalog:row.catalog});if(error)throw new Error('Import failed; existing data was retained.');console.log(row.id+': encrypted configuration imported.');}
console.log('Open Plugins & payments, verify every environment and add sandbox developer emails before removing legacy ENV.');
