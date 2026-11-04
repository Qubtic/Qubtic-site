import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { setTimeout as delay } from 'node:timers/promises';
import ts from 'typescript';
import * as config from '../src/lib/billing/config.mjs';

const native = createRequire(import.meta.url);
function load(file, deps) {
  const exports = {};
  const js = ts.transpileModule(readFileSync(new URL('../' + file, import.meta.url), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  new Function('require', 'exports', js)(name => name in deps ? deps[name] : native(name), exports);
  return exports;
}
function harness() {
  for (const env of ['SANDBOX', 'PRODUCTION']) {
    process.env[`POLAR_${env}_ACCESS_TOKEN`] = `${env}-token`;
    process.env[`POLAR_${env}_ORGANIZATION_ID`] = `${env}-org`;
    process.env[`POLAR_${env}_WEBHOOK_SECRET`] = `${env}-secret`;
  }
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only';
  const calls = [];
  const core = load('src/lib/billing/core.ts', {
    './config.mjs': config,
    './upgrade-refunds': {},
    'server-only': {},
    '@supabase/supabase-js': { createClient: () => ({ rpc: async (name, args) => {
      calls.push({ name, args });
      return { data: name === 'billing_site_access' ? args.p_environment === 'sandbox' : args.p_environment };
    }, from: () => ({ upsert: async () => ({ error: null }) }) }) },
    '@polar-sh/sdk/2026-10': {
      createPolar: options => { calls.push({ provider: options }); return options; },
      webhooks: {
        validateEvent: async (_body, headers, secret) => {
          if (headers['test-secret'] !== secret) throw new Error('Wrong signature');
          return { type: 'order.paid' };
        },
        PolarWebhookUnknownTypeError: class extends Error {},
      },
    },
  });
  const request = (environment, callback, path = '/api/billing/status') => core.billingRequest(
    new Request('https://example.test' + path, {
      headers: environment === undefined ? {} : { 'X-Billing-Environment': environment },
    }), callback,
  );
  return { core, calls, request };
}

test('configuration defaults to production; legacy sandbox cannot supply production credentials', () => {
  assert.equal(config.parseBillingEnvironment(), 'production');
  for (const invalid of ['', 'test', 'SANDBOX', ' sandbox']) assert.throws(() => config.parseBillingEnvironment(invalid));
  const legacy = { POLAR_ENVIRONMENT: 'sandbox', POLAR_ACCESS_TOKEN: 'sandbox-token', POLAR_ORGANIZATION_ID: 'sandbox-org' };
  assert.equal(config.resolveBillingConfig(legacy).POLAR_ACCESS_TOKEN, undefined);
  assert.equal(config.resolveBillingConfig(legacy, 'sandbox').POLAR_ACCESS_TOKEN, 'sandbox-token');
  const incomplete = config.resolveBillingConfig({ ...legacy, POLAR_SANDBOX_ORGANIZATION_ID: 'new-org' }, 'sandbox');
  assert.equal(incomplete.POLAR_ACCESS_TOKEN, undefined);
  assert.equal(incomplete.POLAR_ORGANIZATION_ID, 'new-org');
});

test('concurrent requests keep provider credentials and entitlement RPCs isolated across awaits', async () => {
  const { core, calls, request } = harness();
  const results = await Promise.all(Array.from({ length: 24 }, (_, i) => {
    const selected = i % 2 ? 'sandbox' : undefined;
    return request(selected, async () => {
      const before = core.environment();
      await delay(i % 4);
      const sdk = core.polar();
      const paid = await core.paidAccess('same-user', 'whatsapp-commerce', 'same-site');
      const identity = await core.identity('same-user');
      return Response.json({ before, after: core.environment(), sdk, paid, identity });
    }).then(response => response.json());
  }));
  for (let i = 0; i < results.length; i++) {
    const expected = i % 2 ? 'sandbox' : 'production', row = results[i];
    assert.equal(row.before, expected);
    assert.equal(row.after, expected);
    assert.equal(row.sdk.environment, expected);
    assert.equal(row.sdk.accessToken, `${expected.toUpperCase()}-token`);
    assert.equal(row.identity, expected);
    assert.equal(row.paid, expected === 'sandbox');
  }
  assert.equal(core.environment(), 'production');
  assert.equal(calls.filter(row => row.provider).length, 24);
});

test('invalid/conflicting selectors fail before executing provider work; CORS permits the selector', async () => {
  const { core, request, calls } = harness();
  const callback = async () => { core.polar(); return Response.json({}); };
  assert.equal((await request('typo', callback)).status, 400);
  assert.equal((await request('sandbox', callback, '/api/billing/resolve?environment=production')).status, 400);
  assert.equal(calls.length, 0);
  assert.match(core.billingHeaders['Access-Control-Allow-Headers'], /X-Billing-Environment/);
});

test('missing sandbox token fails without attempting production; destinations match the selected environment', async () => {
  const { core, request, calls } = harness();
  delete process.env.POLAR_SANDBOX_ACCESS_TOKEN;
  assert.equal((await request('sandbox', async () => { core.polar(); return Response.json({}); })).status, 503);
  assert.equal(calls.length, 0);
  assert.throws(() => core.safePolarUrl('https://sandbox.polar.sh/checkout/test'));
  core.withBillingEnvironment('sandbox', () => {
    assert.equal(core.safePolarUrl('https://sandbox.polar.sh/checkout/test'), 'https://sandbox.polar.sh/checkout/test');
    assert.throws(() => core.safePolarUrl('https://buy.polar.sh/checkout/test'));
  });
});

test('webhook destination verifies only its own environment secret before persistence', async () => {
  const { core } = harness();
  const request = secret => new Request('https://example.test/api/billing/webhook?environment=production', {
    method: 'POST', headers: { 'test-secret': secret, 'webhook-id': 'event' }, body: '{}',
  });
  await assert.rejects(() => core.withBillingEnvironment('production', () => core.webhook(request('SANDBOX-secret'))), /Invalid webhook signature/);
  await assert.rejects(() => core.withBillingEnvironment('sandbox', () => core.webhook(request('PRODUCTION-secret'))), /Invalid webhook signature/);
});

test('explicit webhook and cron paths bind routing and preserve webhook bytes', async () => {
  const handler = async (request, context) => Response.json({
    action: (await context.params).action,
    environment: request.headers.get('x-billing-environment'),
    body: request.method === 'POST' ? await request.text() : null,
  });
  const deps = {
    '../../[action]/route': { GET: handler, POST: handler },
    '@/lib/billing/core': { billingHeaders: {} },
    '@/lib/billing/config.mjs': config,
  };
  const webhook = load('src/app/api/billing/webhook/[environment]/route.ts', deps);
  const cron = load('src/app/api/billing/reconcile/[environment]/route.ts', deps);
  const response = await webhook.POST(new Request('https://example.test/api/billing/webhook/production', {
    method: 'POST', headers: { 'X-Billing-Environment': 'sandbox' }, body: '{ "signed": "bytes" }',
  }), { params: Promise.resolve({ environment: 'production' }) });
  assert.deepEqual(await response.json(), { action: 'webhook', environment: 'production', body: '{ "signed": "bytes" }' });
  const reconciled = await cron.GET(new Request('https://example.test/api/billing/reconcile/sandbox'), {
    params: Promise.resolve({ environment: 'sandbox' }),
  });
  assert.equal((await reconciled.json()).environment, 'sandbox');
  assert.equal((await webhook.POST(new Request('https://example.test'), {
    params: Promise.resolve({ environment: 'typo' }),
  })).status, 400);
});
