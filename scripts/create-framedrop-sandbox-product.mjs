// Explicitly authorized sandbox provisioning; never accesses production provider credentials.
import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { createPolar } from '@polar-sh/sdk/2026-10';
import { decryptSecrets } from '../src/lib/plugin-secrets.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
nextEnv.loadEnvConfig(process.cwd());
const db = createClient(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: row, error } = await db.from('plugin_control').select('*').eq('id', 'polar:sandbox').single();
if (error || !row.settings.enabled) throw new Error('Sandbox environment unavailable.');
const secrets = decryptSecrets(row.secrets, process.env.PLUGIN_CONFIG_ENCRYPTION_KEY, row.id);
const sdk = createPolar({ accessToken: secrets.accessToken, environment: 'sandbox', timeout: 20 });
const directory = new URL('../test-results/', import.meta.url);
const journal = new URL('framedrop-sandbox-product.json', directory);
await mkdir(directory, { recursive: true });
let state = {};
try { state = JSON.parse(await readFile(journal, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
if (!state.benefitId) {
  const benefit = await sdk.benefits.create({ type: 'custom', description: 'FrameDrop Pro sandbox access (dedicated)', properties: { note: 'Lifetime access for FrameDrop sandbox testing.' }, metadata: { plugin_slug: 'frame-drop', environment: 'sandbox' } });
  state.benefitId = benefit.id;
  await writeFile(journal, JSON.stringify(state, null, 2));
}
if (!state.productId) {
  const product = await sdk.products.create({ name: 'Frame Drop Pro - Lifetime (Sandbox)', description: 'Dedicated FrameDrop Lifetime sandbox product. One-time purchase.', recurring_interval: null, prices: [{ amount_type: 'fixed', price_currency: 'usd', price_amount: 9999 }], metadata: { plugin_slug: 'frame-drop', environment: 'sandbox' } });
  state.productId = product.id;
  await writeFile(journal, JSON.stringify(state, null, 2));
}
const product = await sdk.products.updateBenefits(state.productId, { benefits: [state.benefitId] });
if (!product.benefits.some(b => b.id === state.benefitId)) throw new Error('Dedicated benefit was not attached.');
const plugin = row.settings.plugins.find(p => p.slug === 'frame-drop');
if (plugin.discount?.code && plugin.discount.cadences?.includes('lifetime')) {
  const listing = await sdk.discounts.list({ organization_id: row.settings.organizationId, query: plugin.discount.code, limit: 100 });
  const matches = listing.items.filter(d => d.code === plugin.discount.code);
  if (matches.length !== 1) throw new Error('Saved sandbox coupon did not match one discount.');
  const discount = matches[0];
  if (discount.organization_id !== row.settings.organizationId) throw new Error('Coupon organization mismatch.');
  const products = discount.products.map(p => p.id);
  if (products.length && !products.includes(state.productId)) {
    await sdk.discounts.update(discount.id, { products: [...products, state.productId] });
  }
}
console.log(JSON.stringify({ ...state, environment: 'sandbox', amount: 9999, currency: 'usd' }));
