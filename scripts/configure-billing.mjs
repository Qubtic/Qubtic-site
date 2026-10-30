import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
import { createClient } from '@supabase/supabase-js';
import { createPolar } from '@polar-sh/sdk/2026-10';
import { readFileSync } from 'node:fs';
import { configuredCatalog, configurationProblems, billingSiteUrl, catalogMatches, PLUGINS, CADENCES } from '../src/lib/billing/config.mjs';
const args=new Set(process.argv.slice(2));
if(args.has('--organization')) {
 loadEnvConfig(process.cwd(),process.env.NODE_ENV!=='production');
 if(!process.env.POLAR_ACCESS_TOKEN||!['sandbox','production'].includes(process.env.POLAR_ENVIRONMENT)){console.error('Set POLAR_ACCESS_TOKEN and POLAR_ENVIRONMENT first.');process.exitCode=1;}
 else {try{const client=createPolar({accessToken:process.env.POLAR_ACCESS_TOKEN,environment:process.env.POLAR_ENVIRONMENT,timeout:20});const result=await client.organizations.list({limit:2});if(result.items.length!==1||result.pagination.total_count!==1)throw new Error('Expected exactly one accessible organization. Copy your organization UUID from Polar settings.');console.log(`POLAR_ORGANIZATION_ID=${result.items[0].id}`);}catch{console.error('Could not resolve the organization. Check your Organization Access Token and environment.');process.exitCode=1;}}
} else if(args.has('--example')) {
 const example=readFileSync(new URL('../.env.example',import.meta.url),'utf8');
 const keys=new Set([...example.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map(match=>match[1]));
 const required=['POLAR_ENVIRONMENT','POLAR_ACCESS_TOKEN','POLAR_ORGANIZATION_ID','POLAR_WEBHOOK_SECRET','BILLING_CRON_SECRET','ADMIN_SESSION_SECRET','NEXT_PUBLIC_SITE_URL','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY',...PLUGINS.flatMap(plugin=>[...CADENCES.map(c=>`${plugin.prefix}_${c.toUpperCase()}_PRODUCT_ID`),`${plugin.prefix}_PRO_BENEFIT_ID`])];
 const missing=required.filter(key=>!keys.has(key));
 if(missing.length){console.error('Missing template keys: '+missing.join(', '));process.exitCode=1;}else console.log('Central ENV template includes every required billing/auth setting. No credentials loaded and no network requests made.');
} else {
 loadEnvConfig(process.cwd(),process.env.NODE_ENV!=='production');
 const problems=configurationProblems(process.env);
 if(problems.length){for(const problem of problems)console.error(problem);process.exitCode=1;}
 else {
  const rows=configuredCatalog(process.env),origin=billingSiteUrl(process.env);
  console.log(`Local configuration valid: ${rows.length} plans; ${process.env.POLAR_ENVIRONMENT}. Values and secrets are hidden.`);
  console.log(`Webhook: ${origin}/api/billing/webhook`);
  if(args.has('--remote')||args.has('--apply')) {
   try {
    const db=createClient(process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
    const polar=createPolar({accessToken:process.env.POLAR_ACCESS_TOKEN,environment:process.env.POLAR_ENVIRONMENT,timeout:20});
    // OATs use resource APIs; OAuth authorize requires an OAuth client and cannot inspect OAT scopes.
    const organizations=await polar.organizations.list({limit:2});
    if(organizations.items.length!==1||organizations.pagination.total_count!==1||organizations.items[0].id!==process.env.POLAR_ORGANIZATION_ID)throw new Error('Use an Organization Access Token belonging to POLAR_ORGANIZATION_ID.');
    for(const service of [polar.customers,polar.orders,polar.subscriptions])await service.list({organization_id:process.env.POLAR_ORGANIZATION_ID,limit:1});
    const org=await polar.organizations.get(process.env.POLAR_ORGANIZATION_ID);
    if(org.id!==process.env.POLAR_ORGANIZATION_ID)throw new Error('Organization mismatch.');
    for(const row of rows){
     const product=await polar.products.get(row.product_id);
     if(product.organization_id!==org.id||product.is_archived||!product.benefits.some(benefit=>benefit.id===row.benefit_id))throw new Error(`${row.plugin_slug}/${row.cadence}: product or attached Pro benefit is invalid.`);
     if(row.cadence==='lifetime'?product.is_recurring:!product.is_recurring||product.recurring_interval!==(row.cadence==='monthly'?'month':'year')||product.recurring_interval_count!==1)throw new Error(`${row.plugin_slug}/${row.cadence}: billing interval does not match.`);
     const prices=product.prices.filter(price=>!price.is_archived);
     if(!prices.length||prices.some(price=>price.amount_type!=='fixed'||typeof price.price_amount!=='number'||price.price_amount<=0))throw new Error(`${row.plugin_slug}/${row.cadence}: configure a positive fixed price.`);
     const discountKey=`POLAR_${row.plugin_slug.replaceAll('-','_').toUpperCase()}_${row.cadence.toUpperCase()}_DISCOUNT_ID`;
     if(process.env[discountKey]){const discount=await polar.discounts.get(process.env[discountKey]);const price=prices[0];if(discount.organization_id!==org.id||!discount.products.some(item=>(typeof item==='string'?item:item.id)===row.product_id)||discount.type!=='fixed'||discount.currency!==price.price_currency||discount.amount<=0||discount.amount>=price.price_amount)throw new Error(`${row.plugin_slug}/${row.cadence}: discount is not eligible or would make checkout free.`);}
    }
    const {data:current,error}=await db.from('billing_catalog').select('*').eq('environment',process.env.POLAR_ENVIRONMENT);if(error)throw new Error('Billing schema is unavailable. Apply the billing migrations first.');
    if(args.has('--apply')){
     const {data,error:applyError}=await db.rpc('billing_configure_catalog',{p_environment:process.env.POLAR_ENVIRONMENT,p_rows:rows});
     if(applyError)throw new Error('Catalog synchronization failed. Apply billing_central_config.sql and check server-role permissions.');
     console.log(`Synced ${data} enabled plans from central ENV. Retired rows were retained for purchase history.`);
    }else if(!catalogMatches(current||[],rows))throw new Error('Database catalog differs from ENV. Run npm run billing:configure after reviewing your settings.');
    console.log('Remote checks passed: resource read permissions, organization, products, benefits, prices, configured discounts, and database catalog. Checkout/customer-session write permissions require the sandbox acceptance test. No checkout or payment was created.');
    console.log('Webhook delivery and cron execution still require the sandbox acceptance test in POLAR_DASHBOARD_GUIDE.md.');
   }catch(error){console.error(error instanceof Error&&error.message&&!('statusCode' in error)?error.message:'Remote validation failed. Check credentials, token scopes, environment, and connectivity. Provider payloads are hidden.');process.exitCode=1;}
  }
 }
}
