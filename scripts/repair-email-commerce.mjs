// Validate first; --apply provisions the existing USD 99.99 Lifetime offer and publishes atomically.
import env from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { createPolar } from '@polar-sh/sdk/2026-10';
import { decryptSecrets } from '../src/lib/plugin-secrets.mjs';
import { configuredCatalog } from '../src/lib/billing/config.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
env.loadEnvConfig(process.cwd());
const apply = process.argv.includes('--apply');
const db = createClient(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
for (const environment of ['sandbox', 'production']) {
  const { data: row, error } = await db.from('plugin_control').select('*').eq('id', `polar:${environment}`).single();
  if (error || !row.settings.enabled) throw new Error(`${environment} billing is unavailable.`);
  const settings = structuredClone(row.settings);
  const plugin = settings.plugins.find(plugin => plugin.slug === 'whatsapp-commerce');
  if (!plugin) throw new Error('Email Commerce registration is missing.');
  const secrets = decryptSecrets(row.secrets, process.env.PLUGIN_CONFIG_ENCRYPTION_KEY, row.id);
  const sdk = createPolar({ accessToken: secrets.accessToken, environment, timeout: 20 });
  let plan = plugin.plans.find(plan => plan.cadence === 'lifetime' && plan.productId);
  if (!plan) {
    if (!apply) { console.log(JSON.stringify({ environment, action: 'Create Email Commerce Pro Lifetime', amount: 9999, currency: 'usd' })); continue; }
    const journal = new URL(`../test-results/email-commerce-${environment}-product.json`, import.meta.url);
    await mkdir(new URL('../test-results/', import.meta.url), { recursive: true });
    let state = {};
    try { state = JSON.parse(await readFile(journal, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (!state.benefitId) { const benefit = await sdk.benefits.create({ type: 'custom', description: 'Email Commerce Pro Lifetime', properties: { note: 'Lifetime access for one Framer site.' }, metadata: { plugin_slug: 'whatsapp-commerce', environment } }); state.benefitId = benefit.id; await writeFile(journal, JSON.stringify(state)); }
    if (!state.productId) { const product = await sdk.products.create({ name: 'Email Commerce Pro - Lifetime', description: 'One-time Lifetime Email Commerce plugin access for one Framer site.', recurring_interval: null, prices: [{ amount_type: 'fixed', price_currency: 'usd', price_amount: 9999 }], metadata: { plugin_slug: 'whatsapp-commerce', environment } }); state.productId = product.id; await writeFile(journal, JSON.stringify(state)); }
    const product = await sdk.products.get(state.productId);
    if (!product.benefits.some(benefit => benefit.id === state.benefitId)) await sdk.products.updateBenefits(state.productId, { benefits: [...product.benefits.map(benefit => benefit.id), state.benefitId] });
    plan = { cadence: 'lifetime', productId: state.productId, benefitId: state.benefitId };
  }
  const product = await sdk.products.get(plan.productId);
  const benefitId = plan.benefitId || plugin.benefitId;
  if (product.organization_id !== settings.organizationId || product.is_archived || product.is_recurring || !product.benefits.some(benefit => benefit.id === benefitId)) throw new Error(`Invalid ${environment} Lifetime product.`);
  const prices = product.prices.filter(price => !price.is_archived && price.amount_type === 'fixed' && Number.isSafeInteger(price.price_amount) && price.price_amount > 0);
  if (prices.length !== 1) throw new Error('Lifetime needs one active fixed price.');
  const { data: existing, error: catalogError } = await db.from('billing_catalog').select('*').eq('environment', environment);
  if (catalogError) throw new Error('Cannot validate historical billing products.');
  if (existing.some(entry => entry.product_id === plan.productId && (entry.plugin_slug !== 'whatsapp-commerce' || entry.cadence !== 'lifetime')) || existing.some(entry => entry.benefit_id === benefitId && entry.plugin_slug !== 'whatsapp-commerce')) throw new Error('Historical product/benefit ownership conflicts.');
  plugin.enabled = true;
  plugin.benefitId = benefitId;
  plugin.plans = plugin.plans.map(entry => entry.cadence === 'lifetime' ? { ...plan, benefitId } : { ...entry, productId: '', benefitId });
  const catalog = configuredCatalog({ POLAR_ENVIRONMENT: environment, POLAR_EXTRA_CATALOG_JSON: JSON.stringify([...existing.filter(entry => entry.enabled && entry.plugin_slug !== 'whatsapp-commerce'), { plugin_slug: 'whatsapp-commerce', cadence: 'lifetime', product_id: plan.productId, benefit_id: benefitId }]) });
  console.log(JSON.stringify({ environment, action: apply ? 'publish' : 'validated', cadence: 'lifetime', amount: prices[0].price_amount, currency: prices[0].price_currency }));
  if (apply) { const { error } = await db.rpc('publish_plugin_control', { p_id: row.id, p_settings: settings, p_secrets: row.secrets, p_revision: row.revision, p_actor: 'codex:user-request:email-commerce-fixes', p_catalog: catalog }); if (error) throw new Error(`Atomic ${environment} publication failed (${error.code}); reload and retry.`); }
}
if (apply) {
 const { data: bucket } = await db.storage.getBucket('email-commerce-orders');
 if (bucket?.public) throw new Error('Order ledger bucket must be private.');
 if (!bucket) { const { error } = await db.storage.createBucket('email-commerce-orders', { public: false, fileSizeLimit: 16384, allowedMimeTypes: ['application/json'] }); if (error) throw new Error('Cannot provision private durable order tracking.'); }
 console.log('Private durable order tracking is ready.');
}
