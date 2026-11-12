// Targeted sandbox repair: provider validation first, atomic publication only with --apply.
import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { createPolar } from '@polar-sh/sdk/2026-10';
import { decryptSecrets } from '../src/lib/plugin-secrets.mjs';
import { configuredCatalog } from '../src/lib/billing/config.mjs';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
nextEnv.loadEnvConfig(process.cwd());
const email = process.argv.find(arg => arg.startsWith('--email='))?.slice(8)?.trim().toLowerCase();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Pass the authorized sandbox tester with --email=address.');
const db = createClient(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: row, error } = await db.from('plugin_control').select('*').eq('id', 'polar:sandbox').single();
if (error || !row?.settings?.enabled) throw new Error('Sandbox environment is unavailable.');
const settings = structuredClone(row.settings);
const plugin = settings.plugins.find(p => p.slug === 'frame-drop');
const plan = plugin?.plans?.find(p => p.cadence === 'lifetime');
const replacement = process.argv.find(arg => arg.startsWith('--product-id='))?.slice(13);
if (replacement && plan) plan.productId = replacement;
const replacementBenefit = process.argv.find(arg => arg.startsWith('--benefit-id='))?.slice(13);
if (replacementBenefit && plugin) { plugin.benefitId = replacementBenefit; plugin.plans = plugin.plans.map(p => ({ ...p, benefitId: replacementBenefit })); }
if (!plan?.productId || !(plugin.benefitId || plan.benefitId)) throw new Error('Configure the FrameDrop sandbox Lifetime product and benefit first.');
const secrets = decryptSecrets(row.secrets, process.env.PLUGIN_CONFIG_ENCRYPTION_KEY, row.id);
const sdk = createPolar({ accessToken: secrets.accessToken, environment: 'sandbox', timeout: 20 });
const product = await sdk.products.get(plan.productId);
const benefitId = plugin.benefitId || plan.benefitId;
const { data: historical, error: historyError } = await db.from('billing_catalog').select('plugin_slug,cadence,product_id,benefit_id').eq('environment', 'sandbox');
if (historyError) throw new Error('Unable to verify historical product ownership.');
if (historical.some(p => p.product_id === plan.productId && (p.plugin_slug !== 'frame-drop' || p.cadence !== 'lifetime')))
  throw new Error('That sandbox product is historically bound to another plugin. Supply a new unused product with --product-id=UUID.');
if (historical.some(p => p.benefit_id === benefitId && p.plugin_slug !== 'frame-drop'))
  throw new Error('That Pro benefit is historically bound to another plugin. Create a distinct FrameDrop benefit.');
if (product.organization_id !== settings.organizationId || product.is_archived || product.is_recurring || !product.benefits.some(b => b.id === benefitId)) throw new Error('FrameDrop sandbox product, organization, or benefit validation failed.');
const prices = product.prices.filter(p => !p.is_archived && p.amount_type === 'fixed' && Number.isSafeInteger(p.price_amount) && p.price_amount > 0);
if (prices.length !== 1) throw new Error('FrameDrop Lifetime needs one active fixed price.');
const exports = {};
new Function('exports', ts.transpileModule(readFileSync(new URL('../src/lib/billing/discounts.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText)(exports);
await exports.resolveCheckoutDiscount(sdk, plugin.discount, 'lifetime', plan.productId, settings.organizationId);
plugin.enabled = true;
plugin.testEmails = [...new Set([...(plugin.testEmails || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean), email])].join(', ');
const { data: existing, error: catalogError } = await db.from('billing_catalog').select('*').eq('environment', 'sandbox').eq('enabled', true);
if (catalogError) throw new Error('Unable to read current sandbox catalog.');
// Preserve every other plugin's exact active sandbox catalog.
const catalog = configuredCatalog({ POLAR_ENVIRONMENT: 'sandbox', POLAR_EXTRA_CATALOG_JSON: JSON.stringify([
  ...existing.filter(p => p.plugin_slug !== 'frame-drop'),
  { plugin_slug: 'frame-drop', cadence: 'lifetime', product_id: plan.productId, benefit_id: benefitId },
]) });
console.log(JSON.stringify({ validated: true, environment: 'sandbox', plugin: 'frame-drop', priceAmount: prices[0].price_amount, currency: prices[0].price_currency, discountConfigured: !!plugin.discount?.code, approvedTester: true, preservedOtherPlans: existing.filter(p => p.plugin_slug !== 'frame-drop').length }));
if (process.argv.includes('--apply')) {
  const { error: publishError } = await db.rpc('publish_plugin_control', { p_id: row.id, p_settings: settings, p_secrets: row.secrets, p_revision: row.revision, p_actor: 'codex:user-request:framedrop-sandbox-repair', p_catalog: catalog });
  if (publishError) throw new Error(`Atomic sandbox publication failed (${publishError.code}: ${publishError.message}); no partial change was applied.`);
  console.log('Published FrameDrop sandbox Lifetime plan and approved tester. Production was not modified.');
}
