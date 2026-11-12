import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
const native = createRequire(import.meta.url);
function load(file, dependencies = {}) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  new Function('require','exports',code)(name => name in dependencies ? dependencies[name] : native(name), exports);
  return exports;
}
const templates = load('../src/lib/billing/purchase-notifications.ts');
const purchase = { orderId: 'order-123', environment: 'production', email: 'client@example.test', teamEmail: 'team@example.test', amount: 7499, currency: 'usd' };

test('purchase creates separate customer and team confirmations with provider amount and stable per-order IDs', () => {
  const [customer, team] = templates.purchaseNotificationRows(purchase);
  assert.equal(customer.recipient, purchase.email);
  assert.equal(team.recipient, purchase.teamEmail);
  assert.match(customer.body, /\$74.99/);
  assert.match(customer.body, /sign in/);
  assert.notEqual(customer.id, team.id);
  assert.deepEqual(templates.purchaseNotificationRows(purchase), [customer, team]);
  const sandbox = templates.purchaseNotificationRows({...purchase,environment:'sandbox'});
  assert.notEqual(sandbox[0].id, customer.id);
  assert.match(sandbox[0].subject,/Sandbox/);
  assert.throws(()=>templates.purchaseNotificationRows({...purchase,email:'injected\r\nBcc:bad@example.test'}));
  assert.throws(()=>templates.purchaseNotificationRows({...purchase,teamEmail:''}));
});

test('outbox suppresses duplicate queued orders and retries only failed SMTP messages', async () => {
  const rows = new Map(), sent = [];
  let failTeam = true;
  const db = {
    from: () => ({
      upsert: async records => { for(const row of records) if(!rows.has(row.id)) rows.set(row.id,{...row}); return {error:null}; },
      update: patch => ({eq: async (_,id) => {Object.assign(rows.get(id),patch);return {error:null};}}),
    }),
    rpc: async () => ({data:[...rows.values()].filter(row=>!row.delivered_at),error:null}),
  };
  const email = load('../src/lib/email-service.ts', {
    './billing/purchase-notifications':templates,
    './plugin-control':{loadManagedMail:async()=>({purchase:true,teamEmail:purchase.teamEmail})},
    './supabase':{supabase:db},
    './logoAssets':{}, './plugins-registry':{getPluginMetadata:()=>({name:'Frame Drop'})},
    './managed-plugins':{serverPluginMetadata:async()=>({name:'Frame Drop'})},
    nodemailer:{createTransport:()=>({sendMail:async message=>{if(message.to===purchase.teamEmail && failTeam) throw new Error('SMTP unavailable');sent.push(message);return {messageId:'mock'};}})},
  });
  const previousUser=process.env.SMTP_USER, previousPass=process.env.SMTP_PASS;
  process.env.SMTP_USER='test-only';process.env.SMTP_PASS='test-only';
  try {
    await email.queueFrameDropPurchase(purchase);
    await email.queueFrameDropPurchase(purchase);
    assert.equal(rows.size,2);
    await email.flushTeamEvents();
    assert.equal(sent.length,1);
    assert.equal(sent[0].to,purchase.email);
    failTeam=false;
    await email.flushTeamEvents();
    assert.equal(sent.length,2);
    assert.equal(sent[1].to,purchase.teamEmail);
    await email.queueFrameDropPurchase(purchase);
    await email.flushTeamEvents();
    assert.equal(sent.length,2);
  } finally {
    if(previousUser===undefined)delete process.env.SMTP_USER;else process.env.SMTP_USER=previousUser;
    if(previousPass===undefined)delete process.env.SMTP_PASS;else process.env.SMTP_PASS=previousPass;
  }
});
