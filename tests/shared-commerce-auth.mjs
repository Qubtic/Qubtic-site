import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { PGlite } from '@electric-sql/pglite';

const nativeRequire = createRequire(import.meta.url);
const root = new URL('../', import.meta.url);
function load(file, dependencies = {}) {
  const source = readFileSync(new URL(file, root), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const exports = {};
  new Function('require', 'exports', js)(name => name in dependencies ? dependencies[name] : nativeRequire(name), exports);
  return exports;
}

function harness() {
  const tables = { framer_users: [], framer_pairing_sessions: [] };
  const files = new Map();
  const messages = [];
  const faults = { table: null, operation: null, throws: false, empty: false };
  const supabase = {
    async rpc(name, { p_email, p_plugin, p_code, p_kind }) {
      assert.equal(name, 'auth_verify_code');
      if (faults.table === 'rpc') return { data: false, error: new Error('RPC unavailable') };
      const row = tables.framer_users.find(u => u.email === p_email.trim().toLowerCase() && u.plugin_slug === p_plugin);
      const metadata = row?.metadata;
      if (!row || ['inactive', 'suspended'].includes(row.status) || !metadata || metadata[`${p_kind}_expires_at`] < Date.now() || metadata[`${p_kind}_code`] !== p_code) return { data: false, error: null };
      for (const suffix of ['code', 'expires_at', 'attempts']) delete metadata[`${p_kind}_${suffix}`];
      return { data: true, error: null };
    },
    from(table) {
      const filters = []; let operation = 'select'; let payload;
      const query = {
        select() { return query; }, eq(k, v) { filters.push(row => row[k] === v); return query; },
        or(value) { const terms = value.split(',').map(term => term.split('.eq.')); filters.push(row => terms.some(([k, v]) => row[k] === v)); return query; },
        insert(value) { operation = 'insert'; payload = value; return query; },
        update(value) { operation = 'update'; payload = value; return query; },
        async maybeSingle() { const r = await query; return { ...r, data: r.data?.[0] || null }; },
        async single() { return query.maybeSingle(); },
        then(resolve, reject) {
          return Promise.resolve().then(() => {
            if (faults.table === table && (!faults.operation || faults.operation === operation)) {
              if (faults.throws) throw new Error('Database disconnected');
              return { data: null, error: faults.empty ? null : new Error('Database unavailable') };
            }
            let rows = tables[table].filter(row => filters.every(filter => filter(row)));
            if (operation === 'insert') { const row = { id: crypto.randomUUID(), ...structuredClone(payload) }; tables[table].push(row); rows = [row]; }
            if (operation === 'update') for (const row of rows) Object.assign(row, structuredClone(payload));
            return { data: structuredClone(rows), error: null };
          }).then(resolve, reject);
        },
      };
      return query;
    },
  };
  const registry = load('src/lib/plugins-registry.ts');
  const passwords = load('src/lib/passwords.ts', { 'server-only': {} });
  const auth = load('src/lib/framer-auth.ts', {
    './passwords': passwords, './supabase': { supabase }, './plugins-registry': registry, './managed-plugins':{serverPluginMetadata:async slug=>registry.getPluginMetadata(slug)},
    fs: { existsSync: file => files.has(file), mkdirSync() {}, readFileSync: file => files.get(file), writeFileSync: (file, data) => files.set(file, data) },
    './email-service': { sendVerificationEmail: async (...args) => messages.push(args), sendPasswordResetEmail: async (...args) => messages.push(args), sendNewUserTeamNotification: async () => {} },
  });
  const route = file => load(`src/app/api/framer-auth/${file}/route.ts`, {
    'next/server': { NextResponse: { json: (data, options) => Response.json(data, options) } },
    '@/lib/framer-auth': auth, '@/lib/plugins-registry': registry, '@/lib/passwords': passwords,
    '@/lib/auth-rate-limit': { authRateLimit: async () => true },
  });
  const request = body => new Request('https://www.qubtic.tech/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { auth, tables, messages, faults, files, route, request };
}

const products = ['telegram-commerce', 'whatsapp-commerce'];
const email = 'owner@example.test';
async function signup(h, product) {
  assert.equal((await h.auth.sendAuthOtpCode(email, product)).success, true);
  const code = h.messages.at(-1)[1];
  assert.equal(h.messages.at(-1)[3], product);
  const response = await h.route('otp').POST(h.request({ action: 'verify-signup', email, code, password: 'secure-password', plugin: product, mode: 'signup', plan: 'pro' }));
  assert.equal(response.status, 200);
  return response.json();
}

for (const product of products) {
  test(`${product}: verified Free signup, password sign-in, OTP and reset are plugin-isolated`, async () => {
    const h = harness();
    const account = await signup(h, product);
    const otherProduct = products.find(p => p !== product);
    const other = await signup(h, otherProduct);
    assert.equal(account.user.plan, 'free');
    assert.match(account.token, new RegExp(`^qbt_fr_${product.split('-')[0]}_[a-f0-9]{48}$`));
    assert.equal(await h.auth.verifyFramerSessionToken(account.token, otherProduct), null);
    assert.equal(h.tables.framer_users.length, 2);
    assert.equal((await h.route('session').POST(h.request({ email, plugin: product, mode: 'signin', password: 'wrong-password' }))).status, 401);
    const signin = await h.route('session').POST(h.request({ email, plugin: product, mode: 'signin', password: 'secure-password', plan: 'pro', metadata: { is_early_bird: true, password_hash: 'forged' } }));
    assert.equal(signin.status, 200); assert.equal((await signin.json()).user.plan, 'free');
    await h.auth.sendAuthOtpCode(email, product); const otp = h.messages.at(-1)[1];
    assert.equal((await h.auth.verifyAuthOtpCode(email, otp, otherProduct)).valid, false);
    assert.equal((await h.auth.verifyAuthOtpCode(email, otp, product)).valid, true);
    assert.equal((await h.auth.verifyAuthOtpCode(email, otp, product)).valid, false);
    await h.auth.requestAuthPasswordReset(email, product); const resetCode = h.messages.at(-1)[1];
    assert.equal((await h.auth.resetAuthUserPassword(email, resetCode, 'new-password', otherProduct)).success, false);
    const reset = await h.auth.resetAuthUserPassword(email, resetCode, 'new-password', product);
    assert.equal(reset.success, true); assert.equal(reset.user.plan, 'free');
    assert.equal((await h.auth.resetAuthUserPassword(email, resetCode, 'another-password', product)).success, false);
    assert.equal((await h.route('session').POST(h.request({ email, plugin: product, mode: 'signin', password: 'new-password' }))).status, 200);
    assert.notEqual(await h.auth.verifyFramerSessionToken(other.token, otherProduct), null);
  });

  test(`${product}: WC pairing compatibility, account checks and revocation`, async () => {
    const h = harness(); const account = await signup(h, product);
    const pair = await h.auth.initiatePairingSession({ pluginSlug: product, pluginName: 'Forged name' });
    assert.match(pair.user_code, /^WC-[A-Z2-9]{4}$/);
    assert.equal(new URL(pair.verification_uri).pathname, `/auth/${product}`);
    assert.equal(h.tables.framer_pairing_sessions[0].plugin_name, product === 'telegram-commerce' ? 'Telegram Commerce' : 'Email Commerce');
    const user = await h.auth.verifyFramerSessionToken(account.token, product);
    const other = await h.auth.createOrUpdateFramerUser({ email, pluginSlug: products.find(p => p !== product) });
    assert.equal((await h.auth.confirmPairingSession(pair.user_code, null)).status, 403);
    assert.equal((await h.auth.confirmPairingSession(pair.user_code, other.user)).status, 403);
    assert.equal((await h.auth.confirmPairingSession(pair.user_code, { ...user, status: 'inactive' })).status, 403);
    assert.equal((await h.auth.confirmPairingSession(pair.user_code, user)).success, true);
    assert.equal((await h.auth.resolvePairingSession(pair.device_code)).auth_token, account.token);
    await h.auth.revokeCommerceSession(account.token);
    assert.equal(await h.auth.verifyFramerSessionToken(account.token), null);
    const row = h.tables.framer_users.find(u => u.plugin_slug === product);
    for (const status of ['pending_verification', 'inactive', 'suspended']) {
      row.status = status; assert.equal(await h.auth.verifyFramerSessionToken(row.auth_token), null);
    }
  });

  test(`${product}: production persistence fails closed, including pairing transitions and retry grace`, async () => {
    const previous = process.env.NODE_ENV; process.env.NODE_ENV = 'production';
    try {
      const h = harness(); const account = await signup(h, product);
      const user = await h.auth.verifyFramerSessionToken(account.token, product);
      const pair = await h.auth.initiatePairingSession({ pluginSlug: product });
      h.faults.table = 'framer_pairing_sessions'; h.faults.operation = 'update';
      assert.equal((await h.auth.confirmPairingSession(pair.user_code, user)).success, false);
      assert.equal(h.tables.framer_pairing_sessions[0].status, 'pending');
      h.faults.empty = true;
      assert.equal((await h.auth.confirmPairingSession(pair.user_code, user)).success, false);
      h.faults.table = null; h.faults.empty = false;
      assert.equal((await h.auth.confirmPairingSession(pair.user_code, user)).success, true);
      h.faults.table = 'framer_pairing_sessions';
      assert.equal((await h.auth.resolvePairingSession(pair.device_code)).success, false);
      h.faults.table = null;
      assert.equal((await h.auth.resolvePairingSession(pair.device_code)).auth_token, account.token);
      assert.equal((await h.auth.resolvePairingSession(pair.device_code)).auth_token, account.token);
      await h.auth.revokeCommerceSession(account.token);
      assert.equal((await h.auth.resolvePairingSession(pair.device_code)).success, false);
      for (const throws of [false, true]) {
        h.faults.table = 'framer_users'; h.faults.operation = null; h.faults.throws = throws;
        assert.equal(await h.auth.findFramerUser(email, product), null);
        assert.equal(await h.auth.verifyFramerSessionToken(user.auth_token, product), null);
        await assert.rejects(h.auth.createOrUpdateFramerUser({ email, pluginSlug: product }));
        const sent = h.messages.length;
        assert.equal((await h.auth.sendAuthOtpCode(email, product)).success, false);
        assert.equal((await h.auth.requestAuthPasswordReset(email, product)).success, false);
        assert.equal(h.messages.length, sent);
        h.faults.table = 'framer_pairing_sessions';
        assert.equal((await h.auth.resolvePairingSession(pair.device_code)).success, false);
        assert.equal((await h.auth.confirmPairingSession(pair.user_code, user)).success, false);
        assert.equal(await h.auth.getPairingSession(pair.user_code), null);
        await assert.rejects(h.auth.initiatePairingSession({ pluginSlug: product }));
      }
      h.faults.throws = false; h.faults.table = 'framer_users'; h.faults.operation = 'update';
      const sent = h.messages.length;
      assert.equal((await h.auth.sendAuthOtpCode(email, product)).success, false);
      assert.equal((await h.auth.requestAuthPasswordReset(email, product)).success, false);
      assert.equal(h.messages.length, sent);
      h.faults.operation = 'insert';
      assert.equal((await h.auth.sendAuthOtpCode('new@example.test', product)).success, false);
      h.faults.table = 'rpc';
      assert.equal((await h.auth.verifyAuthOtpCode(email, '123456', product)).valid, false);
      assert.equal((await h.auth.resetAuthUserPassword(email, '123456', 'new-password', product)).success, false);
    } finally {
      if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous;
    }
  });
}

test('existing shared schema and code RPC support Telegram without a new migration', async () => {
  const db = new PGlite();
  try {
    await db.exec('create role anon; create role authenticated; create role service_role;');
    for (const file of ['framer_users.sql', 'pairing_sessions.sql', 'auth_server_only.sql']) await db.exec(readFileSync(new URL(`supabase/${file}`, root), 'utf8'));
    const sql = readFileSync(new URL('supabase/billing.sql', root), 'utf8');
    await db.exec(sql.slice(sql.indexOf('CREATE OR REPLACE FUNCTION auth_verify_code(')));
    for (const product of products) await db.query("insert into framer_users(email,plugin_slug,auth_token,metadata) values ($1,$2,$3,$4)", [email, product, product, JSON.stringify({ otp_code: product === 'telegram-commerce' ? '123456' : '654321', otp_expires_at: Date.now() + 600000, reset_code: '234567', reset_expires_at: Date.now() + 600000 })]);
    assert.equal((await db.query('select count(*)::integer as n from framer_users')).rows[0].n, 2);
    const verify = async (product, code, kind) => (await db.query('select auth_verify_code($1,$2,$3,$4) as valid', [email, product, code, kind])).rows[0].valid;
    assert.equal(await verify('whatsapp-commerce', '123456', 'otp'), false);
    assert.equal(await verify('telegram-commerce', '123456', 'otp'), true);
    assert.equal(await verify('telegram-commerce', '123456', 'otp'), false);
    assert.equal(await verify('whatsapp-commerce', '654321', 'otp'), true);
    assert.equal(await verify('telegram-commerce', '234567', 'reset'), true);
    assert.equal(await verify('telegram-commerce', '234567', 'reset'), false);
    for (const role of ['anon', 'authenticated']) assert.equal((await db.query(`select has_table_privilege('${role}','framer_users','SELECT') as allowed`)).rows[0].allowed, false);
  } finally { await db.close(); }
});


test('Email Commerce alias reuses the existing account and pairing identity', async () => {
 const h = harness();
 const result = await signup(h, 'whatsapp-commerce');
 const before = h.tables.framer_users.length;
 const verified = await h.auth.verifyFramerSessionToken(result.token, 'email-commerce');
 assert.equal(verified.plugin_slug, 'whatsapp-commerce');
 const pair = await h.auth.initiatePairingSession({ pluginSlug: 'email-commerce' });
 assert.equal(h.tables.framer_pairing_sessions.at(-1).plugin_slug, 'whatsapp-commerce');
 assert.equal(h.tables.framer_pairing_sessions.at(-1).plugin_name, 'Email Commerce');
 assert.equal(new URL(pair.verification_uri).pathname, '/auth/whatsapp-commerce');
 assert.equal(h.tables.framer_users.length, before);
});
