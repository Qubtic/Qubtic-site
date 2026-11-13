import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sealStore, openStore, validateOrder } from '../src/lib/email-commerce/config.mjs';
import { createOrderLedger } from '../src/lib/email-commerce/order-ledger.mjs';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const secret = 'email-commerce-test-secret-at-least-32-characters';
const products = [{ sku: 'BAG', name: 'Bag', price: 25, currency: 'USD', stock: 3, draft: false }];

test('SMTP store tokens encrypt credentials and reject tampering and different keys', () => {
  const config = { settings: { smtpPass: 'private-password' }, products };
  const token = sealStore(config, secret);
  assert.ok(!token.includes('private-password'));
  assert.deepEqual(openStore(token, secret), config);
  assert.throws(() => openStore(token, secret + '-other'));
  const parts = token.split('.');
  parts[3] = (parts[3][0] === 'A' ? 'B' : 'A') + parts[3].slice(1);
  assert.throws(() => openStore(parts.join('.'), secret));
  assert.throws(() => sealStore(config, 'short'));
});

test('email order totals use merchant catalog prices and validate quantities', () => {
  const order = validateOrder(products, [{ sku: 'BAG', quantity: 2, price: 0.01 }]);
  assert.equal(order.total, 50);
  assert.equal(order.lines[0].price, 25);
  for (const quantity of [0, -1, 4, 1.5, NaN]) {
    assert.throws(() => validateOrder(products, [{ sku: 'BAG', quantity }]));
  }
  assert.throws(() => validateOrder(products, [{ sku: 'UNKNOWN', quantity: 1 }]));
  assert.throws(() => validateOrder(products, [{ sku: 'BAG', quantity: 1 }, { sku: 'BAG', quantity: 1 }]));
  assert.throws(() => validateOrder([{ ...products[0], draft: true }], [{ sku: 'BAG', quantity: 1 }]));
});

test('mixed currencies, invalid prices and empty requests cannot be emailed', () => {
  assert.throws(() => validateOrder(products, []));
  assert.throws(() => validateOrder([{ ...products[0], price: -1 }], [{ sku: 'BAG', quantity: 1 }]));
  assert.throws(() => validateOrder([...products, { ...products[0], sku: 'EUR', currency: 'EUR' }], [{ sku: 'BAG', quantity: 1 }, { sku: 'EUR', quantity: 1 }]));
});

function fakeStorage() {
  const objects = new Map();
  return { objects, from: () => ({
    async upload(path, contents, options) {
      if (!options.upsert && objects.has(path)) return { error: { statusCode: '409' } };
      objects.set(path, contents); return { data: { path }, error: null };
    },
    async download(path) { return objects.has(path) ? { data: new Blob([objects.get(path)]), error: null } : { error: new Error('Missing') }; },
  }) };
}
function harness({ pro = true, receiptFails = false, merchantFails = false, storage = fakeStorage() } = {}) {
  const sent = [];
  process.env.EMAIL_COMMERCE_SECRET = secret;
  const config = { userId: 'owner', site: 'site-a', environment: 'production', products, settings: { business: 'Shop', merchantEmail: 'seller@example.com', fromEmail: 'seller@example.com', fromName: 'Shop', customerReceipt: true } };
  const dependencies = {
    'node:crypto': { randomUUID: () => 'test-order-id' },
    '@/lib/billing/core': { limit: async () => {}, database: () => ({ storage }), withManagedBillingEnvironment: (_env, work) => work() },
    '@/lib/email-commerce/access': { ensureEmailCommerceAccess: async () => pro },
    '@/lib/email-commerce/order-ledger.mjs': { createOrderLedger },
    '@/lib/email-commerce/config.mjs': { openStore, validateOrder },
    '@/lib/email-commerce/smtp': {
      mailAddress: value => { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '')) throw new Error('Invalid email'); return value; },
      smtpTransport: async () => ({ close() {}, sendMail: async message => {
        sent.push(message);
        if (merchantFails || (receiptFails && sent.length === 2)) throw new Error('SMTP failed');
        return { accepted: [message.to] };
      } }),
    },
  };
  const code = ts.transpileModule(readFileSync(new URL('../src/app/api/email-commerce/order/route.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const route = {};
  new Function('require', 'exports', code)(name => {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency ${name}`);
    return dependencies[name];
  }, route);
  const body = { token: sealStore(config, secret), requestId: 'request-1234567890123456', customer: { name: 'Ada', email: 'ada@example.com', paymentMethod: 'online_invoice' }, lines: [{ sku: 'BAG', quantity: 2 }] };
  return { sent, body, storage, request: (data = body) => route.POST(new Request('https://example.test/api/email-commerce/order', { method: 'POST', body: JSON.stringify(data) })) };
}

test('SMTP dispatch sends itemized merchant request and optional customer receipt', async () => {
  const h = harness();
  const response = await h.request();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).success, true);
  assert.equal(h.sent.length, 2);
  assert.equal(h.sent[0].to, 'seller@example.com');
  assert.equal(h.sent[1].to, 'ada@example.com');
  assert.match(h.sent[0].text, /Requested total: \$50.00/);
  assert.match(h.sent[0].text, /Stock has not been reserved/);
  assert.ok(h.sent[0].text.includes('\nCustomer: Ada')); 
});

test('parallel retries coalesce, changed request contents conflict, and receipt failure does not resend an order', async () => {
  const h = harness({ receiptFails: true });
  const responses = await Promise.all([h.request(), h.request()]);
  for (const response of responses) {
    assert.ok([200, 202].includes(response.status));
    const result = await response.json();
    if (result.success) assert.equal(result.receiptSent, false);
  }
  assert.equal(h.sent.length, 2);
  await h.request();
  assert.equal(h.sent.length, 2);
  assert.equal((await h.request({ ...h.body, lines: [{ sku: 'BAG', quantity: 1 }] })).status, 400);
  assert.equal(h.sent.length, 2);
});

test('forged token, invalid quantities, missing email and revoked access never send mail', async () => {
  const h = harness();
  for (const body of [{ ...h.body, token: 'forged' }, { ...h.body, lines: [{ sku: 'BAG', quantity: 4 }] }, { ...h.body, customer: { name: 'Ada' } }]) {
    assert.equal((await h.request(body)).status, 400);
  }
  assert.equal(h.sent.length, 0);
  const revoked = harness({ pro: false });
  assert.equal((await revoked.request()).status, 400);
  assert.equal(revoked.sent.length, 0);
});

test('SMTP merchant rejection returns an honest failure', async () => {
  const h = harness({ merchantFails: true });
  const response = await h.request();
  assert.equal(response.status, 202);
  assert.equal((await response.json()).pending, true);
  await h.request();
  assert.equal(h.sent.length, 1);
});


test('a fresh server instance reads the durable claim instead of sending another SMTP message', async () => {
  const storage = fakeStorage();
  const first = harness({ storage });
  const response = await first.request(); const result = await response.json();
  assert.equal(result.success, true);
  const restarted = harness({ storage });
  const retry = await restarted.request(first.body);
  assert.deepEqual(await retry.json(), result);
  assert.equal(restarted.sent.length, 0);
  const records = [...storage.objects.values()].join('');
  assert.ok(!records.includes('ada@example.com'));
});

test('a durable pending claim after a crash never automatically retries SMTP', async () => {
  const h = harness();
  const ledger = createOrderLedger(h.storage);
  const fingerprint = JSON.stringify({ email: h.body.customer.email, name: h.body.customer.name, lines: h.body.lines, customer: h.body.customer });
  await ledger.claim(`production:owner:site-a:${h.body.requestId}`, fingerprint);
  const response = await h.request();
  assert.equal(response.status, 202);
  assert.equal((await response.json()).pending, true);
  assert.equal(h.sent.length, 0);
});

test('storage failure blocks dispatch and does not fall back to in-memory claims', async () => {
  const storage = { from: () => ({ upload: async () => ({ error: new Error('Offline') }), download: async () => ({ error: new Error('Offline') }) }) };
  const h = harness({ storage });
  assert.equal((await h.request()).status, 400);
  assert.equal(h.sent.length, 0);
});

test('expired billing verification is reconciled, but a revoked purchase remains denied', async () => {
  function accessHarness(results) {
    let calls = [];
    const code = ts.transpileModule(readFileSync(new URL('../src/lib/email-commerce/access.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const exports = {};
    new Function('require', 'exports', code)(name => name === 'server-only' ? {} : { paidAccess: async () => { calls.push('access'); return results.shift(); }, limit: async () => { calls.push('limit'); }, identity: async () => { calls.push('identity'); return 'customer'; }, synchronize: async () => { calls.push('sync'); } }, exports);
    return { calls, access: exports.ensureEmailCommerceAccess };
  }
  const recovered = accessHarness([false, true]); assert.equal(await recovered.access('owner','site'), true); assert.deepEqual(recovered.calls, ['access','limit','identity','sync','access']);
  const revoked = accessHarness([false, false]); assert.equal(await revoked.access('owner','site'), false);
  const active = accessHarness([true]); assert.equal(await active.access('owner','site'), true); assert.deepEqual(active.calls, ['access']);
});


test('readiness is private-data-free and fails closed for missing secrets, missing or public storage', async () => {
  let bucket = { public: false };
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL('../src/app/api/email-commerce/config/route.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const dependencies = {
    '@/lib/billing/core': { database: () => ({ storage: { getBucket: async () => ({ data: bucket }) } }) },
    '@/lib/email-commerce/access': {}, '@/lib/email-commerce/config.mjs': {}, '@/lib/email-commerce/smtp': {},
  };
  new Function('require','exports',code)(name => dependencies[name], exports);
  process.env.EMAIL_COMMERCE_SECRET = secret;
  const ready = await exports.GET(); assert.equal(ready.status, 200); assert.deepEqual(await ready.json(), { service: 'email-commerce', version: 2, ready: true });
  bucket = { public: true }; assert.equal((await exports.GET()).status, 503);
  bucket = null; assert.equal((await exports.GET()).status, 503);
  bucket = { public: false }; process.env.EMAIL_COMMERCE_SECRET = ''; assert.equal((await exports.GET()).status, 503);
  process.env.EMAIL_COMMERCE_SECRET = secret;
});
