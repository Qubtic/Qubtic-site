import env from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { createPolar } from '@polar-sh/sdk/2026-10';
import { decryptSecrets } from '../src/lib/plugin-secrets.mjs';
env.loadEnvConfig(process.cwd());
const db = createClient(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});
for (const environment of ['sandbox','production']) {
 const {data:row,error}=await db.from('plugin_control').select('*').eq('id',`polar:${environment}`).single();
 if(error) throw new Error(`Cannot inspect ${environment} billing (${error.code}).`);
 const plugin=row.settings.plugins.find(plugin=>plugin.slug==='whatsapp-commerce');
 const credentials=decryptSecrets(row.secrets,process.env.PLUGIN_CONFIG_ENCRYPTION_KEY,row.id);
 const sdk=createPolar({accessToken:credentials.accessToken,environment,timeout:20});
 const {data:catalog,error:catalogError}=await db.from('billing_catalog').select('plugin_slug,cadence,product_id,benefit_id,enabled').eq('environment',environment).eq('plugin_slug','whatsapp-commerce');
 if(catalogError) throw new Error('Cannot inspect catalog.');
 console.log(JSON.stringify({environment,enabled:row.settings.enabled,plugin:{enabled:plugin?.enabled,plans:plugin?.plans},catalog}));
 const products=await sdk.products.list({organization_id:row.settings.organizationId,limit:100});
 console.log(JSON.stringify({environment,matchingProducts:products.items.filter(p=>/email|whatsapp/i.test(p.name)||p.metadata?.plugin_slug==='whatsapp-commerce').map(p=>({id:p.id,name:p.name,recurring:p.is_recurring,archived:p.is_archived,benefits:p.benefits.map(b=>b.id),prices:p.prices.filter(price=>!price.is_archived).map(price=>({amount:price.price_amount,currency:price.price_currency,type:price.amount_type}))}))}));
}
const {data:mail}=await db.from('plugin_control').select('settings').eq('id','mail').maybeSingle();
console.log(JSON.stringify({teamNotifications:{signup:mail?.settings.signup,recipientConfigured:Boolean(mail?.settings.teamEmail||process.env.TEAM_NOTIFICATION_EMAIL||process.env.SMTP_FROM_EMAIL)},emailSecretConfigured:Boolean(process.env.EMAIL_COMMERCE_SECRET)}));
