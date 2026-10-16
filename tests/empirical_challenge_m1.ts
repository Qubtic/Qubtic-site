/**
 * Empirical Challenge & Adversarial Stress Suite for Milestone 1
 * Targets:
 * 1. Route aliasing in getPluginMetadata
 * 2. Onboarding fields (empty, long, Unicode, special chars, SQL/XSS payloads)
 * 3. POST /api/framer-auth/session with varying payloads and malformed requests
 * 4. POST /api/framer-auth/otp with valid, invalid, rate-limited, and consumed codes
 * 5. POST /api/framer-auth/reset-password with valid, invalid, short passwords, and consumed codes
 * 6. GET & POST /api/framer-auth/teams
 * 7. Concurrency and data store consistency
 */

import assert from 'assert';
import crypto from 'crypto';
import { getPluginMetadata, REGISTERED_PLUGINS } from '../src/lib/plugins-registry';
import {
  createOrUpdateFramerUser,
  verifyFramerSessionToken,
  sendAuthOtpCode,
  verifyAuthOtpCode,
  requestAuthPasswordReset,
  resetAuthUserPassword,
  getFramerUsersList,
} from '../src/lib/framer-auth';
import { POST as sessionPOST, OPTIONS as sessionOPTIONS } from '../src/app/api/framer-auth/session/route';
import { POST as otpPOST, OPTIONS as otpOPTIONS } from '../src/app/api/framer-auth/otp/route';
import { POST as resetPOST, OPTIONS as resetOPTIONS } from '../src/app/api/framer-auth/reset-password/route';
import { GET as teamsGET, POST as teamsPOST, OPTIONS as teamsOPTIONS } from '../src/app/api/framer-auth/teams/route';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

const results: TestResult[] = [];

function recordPass(suite: string, name: string, details?: Record<string, unknown>) {
  results.push({ suite, name, passed: true, details });
  console.log(`  [PASS] ${name}`);
}

function recordFail(suite: string, name: string, err: unknown, details?: Record<string, unknown>) {
  const errMsg = err instanceof Error ? err.stack || err.message : String(err);
  results.push({ suite, name, passed: false, error: errMsg, details });
  console.error(`  [FAIL] ${name}: ${errMsg}`);
}

async function runChallenge() {
  console.log('================================================================');
  console.log('RUNNING EMPIRICAL CHALLENGER STRESS SUITE (MILESTONE 1)');
  console.log('================================================================\n');

  // ---------------------------------------------------------------------------
  // SUITE 1: Route Aliasing & Slug Normalization
  // ---------------------------------------------------------------------------
  console.log('--- SUITE 1: Route Aliasing & Slug Normalization ---');

  const testAliasingCases = [
    { input: 'framedrop', expectedSlug: 'frame-drop', expectedName: 'Frame Drop' },
    { input: 'frame-drop', expectedSlug: 'frame-drop', expectedName: 'Frame Drop' },
    { input: 'plugin', expectedSlug: 'frame-drop', expectedName: 'Frame Drop' },
    { input: 'framedrop-auth', expectedSlug: 'frame-drop', expectedName: 'Frame Drop' },
    { input: null, expectedSlug: 'qube-auth', expectedName: 'Qube Auth' },
    { input: undefined, expectedSlug: 'qube-auth', expectedName: 'Qube Auth' },
    { input: '', expectedSlug: 'qube-auth', expectedName: 'Qube Auth' },
    { input: '   FRAMEDROP   ', expectedSlug: 'frame-drop', expectedName: 'Frame Drop' },
    { input: '  PLUGIN  ', expectedSlug: 'frame-drop', expectedName: 'Frame Drop' },
    { input: 'qube-auth', expectedSlug: 'qube-auth', expectedName: 'Qube Auth' },
    { input: 'future-sync-plugin', expectedSlug: 'future-sync-plugin', expectedName: 'Future Sync Plugin' },
  ];

  for (const tc of testAliasingCases) {
    const testName = `getPluginMetadata(${JSON.stringify(tc.input)})`;
    try {
      const meta = getPluginMetadata(tc.input as string);
      assert(meta, `Metadata must not be null/undefined for ${tc.input}`);
      assert.strictEqual(meta.slug, tc.expectedSlug, `Slug mismatch for input ${tc.input}`);
      assert.strictEqual(meta.name, tc.expectedName, `Name mismatch for input ${tc.input}`);
      assert(Array.isArray(meta.features), 'Features must be array');
      assert(Array.isArray(meta.scopes), 'Scopes must be array');
      assert(meta.accentColor, 'Accent color must be defined');
      recordPass('Route Aliasing', testName, { input: tc.input, slug: meta.slug });
    } catch (err) {
      recordFail('Route Aliasing', testName, err, { input: tc.input });
    }
  }

  // ---------------------------------------------------------------------------
  // SUITE 2: Onboarding Fields - Edge Cases & Extremes
  // ---------------------------------------------------------------------------
  console.log('\n--- SUITE 2: Onboarding Fields - Edge Cases & Extremes ---');

  const onboardingCases = [
    {
      desc: 'Empty company and website',
      company: '',
      website: '',
    },
    {
      desc: 'Unicode, Emojis, and Multi-language characters',
      company: 'ACME 🚀 创新 (Shenzhen) ñoño & GmbH',
      website: 'https://acme.org/🚀?user=汉字&lang=es#top',
    },
    {
      desc: 'Very long string (5,000 chars company, 2,000 chars URL)',
      company: 'EnterpriseCorp_'.repeat(333), // ~4995 chars
      website: 'https://example.com/deep/path/' + 'a'.repeat(1950),
    },
    {
      desc: 'Special Characters, Quotes, Ampersands, and Slashes',
      company: 'AT&T / O\'Reilly "Special" <Group> & Co.',
      website: 'https://domain.com/path?foo=bar&baz=1#anchor',
    },
    {
      desc: 'XSS and SQL Injection Strings',
      company: "<script>alert('XSS')</script>'; DROP TABLE framer_users; --",
      website: 'javascript:alert(1)',
    },
  ];

  for (const oc of onboardingCases) {
    const testName = `Onboarding Persistence: ${oc.desc}`;
    try {
      const uniqueEmail = `stress.${crypto.randomBytes(8).toString('hex')}@testdomain.io`;
      const res = await createOrUpdateFramerUser({
        email: uniqueEmail,
        name: 'Test Stress Subject',
        company_name: oc.company,
        website_url: oc.website,
        pluginSlug: 'frame-drop',
        plan: 'pro',
      });

      assert(res.user, 'User must be returned');
      assert.strictEqual(res.user.email, uniqueEmail);
      assert.strictEqual(res.user.company_name, oc.company, 'Company name must match verbatim');
      assert.strictEqual(res.user.website_url, oc.website, 'Website URL must match verbatim');
      assert(res.token, 'Token must be generated');

      // Verify retrieval using token
      const fetched = await verifyFramerSessionToken(res.token, 'frame-drop');
      assert(fetched, 'Session token must resolve user record');
      assert.strictEqual(fetched.company_name, oc.company, 'Retrieved company name must match');
      assert.strictEqual(fetched.website_url, oc.website, 'Retrieved website URL must match');

      recordPass('Onboarding Fields', testName, { length: oc.company.length });
    } catch (err) {
      recordFail('Onboarding Fields', testName, err);
    }
  }

  // Test updating existing user onboarding fields
  try {
    const testName = 'Onboarding: Update existing user fields without corruption';
    const email = `update.${crypto.randomBytes(8).toString('hex')}@agency.com`;
    const initial = await createOrUpdateFramerUser({
      email,
      name: 'Initial Name',
      company_name: 'Initial Company',
      website_url: 'https://initial.com',
      pluginSlug: 'frame-drop',
    });

    assert.strictEqual(initial.user.company_name, 'Initial Company');

    // Update with new values
    const updated = await createOrUpdateFramerUser({
      email,
      name: 'Updated Name',
      company_name: 'Updated Company LLC',
      website_url: 'https://updated.com',
      pluginSlug: 'frame-drop',
    });

    assert.strictEqual(updated.isNew, false, 'Must identify existing user');
    assert.strictEqual(updated.user.company_name, 'Updated Company LLC');
    assert.strictEqual(updated.user.website_url, 'https://updated.com');
    assert.strictEqual(updated.user.name, 'Updated Name');

    recordPass('Onboarding Fields', testName);
  } catch (err) {
    recordFail('Onboarding Fields', 'Onboarding: Update existing user fields without corruption', err);
  }

  // ---------------------------------------------------------------------------
  // SUITE 3: Auth Session Route (POST /api/framer-auth/session)
  // ---------------------------------------------------------------------------
  console.log('\n--- SUITE 3: Auth Session Route (POST /api/framer-auth/session) ---');

  // OPTIONS test
  try {
    const testName = 'OPTIONS /api/framer-auth/session (CORS)';
    const res = await sessionOPTIONS();
    assert.strictEqual(res.status, 204);
    assert.strictEqual(res.headers.get('Access-Control-Allow-Origin'), '*');
    recordPass('Session Route', testName);
  } catch (err) {
    recordFail('Session Route', 'OPTIONS /api/framer-auth/session (CORS)', err);
  }

  // Valid POST session with snake_case and aliased plugin
  try {
    const testName = 'POST /api/framer-auth/session with snake_case and plugin=framedrop';
    const email = `session.snake.${crypto.randomBytes(6).toString('hex')}@studio.co`;
    const req = new Request('http://localhost:3000/api/framer-auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name: 'Snake Designer',
        company_name: 'Studio North',
        website_url: 'https://north.studio',
        plugin: 'framedrop', // alias!
        team_name: 'Design Ops',
        team_role: 'Lead',
      }),
    });

    const res = await sessionPOST(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(data.token.startsWith('qbt_fr_'));
    assert(data.sessionCode);
    assert.strictEqual(data.user.email, email);
    assert.strictEqual(data.user.company_name, 'Studio North');
    assert.strictEqual(data.user.website_url, 'https://north.studio');
    assert.strictEqual(data.plugin.slug, 'frame-drop', 'Plugin alias framedrop must resolve to frame-drop');
    assert.strictEqual(data.plugin.name, 'Frame Drop');
    recordPass('Session Route', testName);
  } catch (err) {
    recordFail('Session Route', 'POST /api/framer-auth/session with snake_case and plugin=framedrop', err);
  }

  // Valid POST session with camelCase and plugin=plugin
  try {
    const testName = 'POST /api/framer-auth/session with camelCase and plugin=plugin';
    const email = `session.camel.${crypto.randomBytes(6).toString('hex')}@studio.co`;
    const req = new Request('http://localhost:3000/api/framer-auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name: 'Camel Designer',
        companyName: 'Camel Corp',
        websiteUrl: 'https://camel.io',
        plugin: 'plugin', // alias!
      }),
    });

    const res = await sessionPOST(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.company_name, 'Camel Corp');
    assert.strictEqual(data.user.website_url, 'https://camel.io');
    assert.strictEqual(data.plugin.slug, 'frame-drop');
    recordPass('Session Route', testName);
  } catch (err) {
    recordFail('Session Route', 'POST /api/framer-auth/session with camelCase and plugin=plugin', err);
  }

  // Invalid payload: missing email
  try {
    const testName = 'POST /api/framer-auth/session rejection on missing email';
    const req = new Request('http://localhost:3000/api/framer-auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'No Email User',
        company_name: 'Ghost Corp',
      }),
    });

    const res = await sessionPOST(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    recordPass('Session Route', testName);
  } catch (err) {
    recordFail('Session Route', 'POST /api/framer-auth/session rejection on missing email', err);
  }

  // Invalid payload: malformed email
  try {
    const testName = 'POST /api/framer-auth/session rejection on invalid email format';
    const req = new Request('http://localhost:3000/api/framer-auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'not-an-email',
      }),
    });

    const res = await sessionPOST(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    recordPass('Session Route', testName);
  } catch (err) {
    recordFail('Session Route', 'POST /api/framer-auth/session rejection on invalid email format', err);
  }

  // Edge payload: malformed JSON / empty body
  try {
    const testName = 'POST /api/framer-auth/session with empty body';
    const req = new Request('http://localhost:3000/api/framer-auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });

    const res = await sessionPOST(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    recordPass('Session Route', testName);
  } catch (err) {
    recordFail('Session Route', 'POST /api/framer-auth/session with empty body', err);
  }

  // ---------------------------------------------------------------------------
  // SUITE 4: OTP Route (POST /api/framer-auth/otp)
  // ---------------------------------------------------------------------------
  console.log('\n--- SUITE 4: OTP Route (POST /api/framer-auth/otp) ---');

  // OPTIONS test
  try {
    const testName = 'OPTIONS /api/framer-auth/otp (CORS)';
    const res = await otpOPTIONS();
    assert.strictEqual(res.status, 204);
    recordPass('OTP Route', testName);
  } catch (err) {
    recordFail('OTP Route', 'OPTIONS /api/framer-auth/otp (CORS)', err);
  }

  const otpTestEmail = `otp.stress.${crypto.randomBytes(6).toString('hex')}@domain.net`;

  // Action: send
  let generatedOtpCode = '';
  try {
    const testName = 'POST /api/framer-auth/otp action:send';
    const req = new Request('http://localhost:3000/api/framer-auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send',
        email: otpTestEmail,
        plugin: 'framedrop',
      }),
    });

    const res = await otpPOST(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(data.devCode, 'devCode should be returned in test/dev mode');
    assert.strictEqual(data.devCode.length, 6);
    generatedOtpCode = data.devCode;
    recordPass('OTP Route', testName, { code: generatedOtpCode });
  } catch (err) {
    recordFail('OTP Route', 'POST /api/framer-auth/otp action:send', err);
  }

  // Action: verify with missing code
  try {
    const testName = 'POST /api/framer-auth/otp verify rejection on missing code';
    const req = new Request('http://localhost:3000/api/framer-auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify',
        email: otpTestEmail,
      }),
    });

    const res = await otpPOST(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    recordPass('OTP Route', testName);
  } catch (err) {
    recordFail('OTP Route', 'POST /api/framer-auth/otp verify rejection on missing code', err);
  }

  // Action: verify with WRONG code
  try {
    const testName = 'POST /api/framer-auth/otp verify rejection on wrong code';
    const req = new Request('http://localhost:3000/api/framer-auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify',
        email: otpTestEmail,
        code: '999999', // intentionally incorrect
      }),
    });

    const res = await otpPOST(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert(data.message.includes('Invalid') || data.message.includes('expired'));
    recordPass('OTP Route', testName);
  } catch (err) {
    recordFail('OTP Route', 'POST /api/framer-auth/otp verify rejection on wrong code', err);
  }

  // Action: verify with CORRECT code
  try {
    const testName = 'POST /api/framer-auth/otp verify success with valid code';
    const req = new Request('http://localhost:3000/api/framer-auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify',
        email: otpTestEmail,
        code: generatedOtpCode,
        plugin: 'framedrop',
      }),
    });

    const res = await otpPOST(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(data.token.startsWith('qbt_fr_'));
    assert(data.sessionCode);
    assert.strictEqual(data.user.email, otpTestEmail);
    assert.strictEqual(data.plugin.slug, 'frame-drop');
    recordPass('OTP Route', testName);
  } catch (err) {
    recordFail('OTP Route', 'POST /api/framer-auth/otp verify success with valid code', err);
  }

  // Replay Attack: verify the SAME code again (must fail because it was consumed)
  try {
    const testName = 'POST /api/framer-auth/otp replay attack prevention (consumed code)';
    const req = new Request('http://localhost:3000/api/framer-auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify',
        email: otpTestEmail,
        code: generatedOtpCode,
      }),
    });

    const res = await otpPOST(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false, 'Consumed OTP must not be reusable');
    recordPass('OTP Route', testName);
  } catch (err) {
    recordFail('OTP Route', 'POST /api/framer-auth/otp replay attack prevention (consumed code)', err);
  }

  // Brute Force Lockout Test (>5 wrong attempts)
  try {
    const testName = 'POST /api/framer-auth/otp brute-force lockout after >5 failed attempts';
    const bruteEmail = `brute.${crypto.randomBytes(6).toString('hex')}@attack.org`;
    const sendReq = new Request('http://localhost:3000/api/framer-auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send', email: bruteEmail }),
    });
    const sendRes = await otpPOST(sendReq);
    const sendData = await sendRes.json();
    const realCode = sendData.devCode;

    // Send 6 invalid attempts
    for (let i = 1; i <= 6; i++) {
      const badReq = new Request('http://localhost:3000/api/framer-auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email: bruteEmail, code: '000000' }),
      });
      await otpPOST(badReq);
    }

    // Now attempt with the REAL code; it must be locked out
    const finalReq = new Request('http://localhost:3000/api/framer-auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', email: bruteEmail, code: realCode }),
    });
    const finalRes = await otpPOST(finalReq);
    assert.strictEqual(finalRes.status, 400);
    const finalData = await finalRes.json();
    assert.strictEqual(finalData.success, false);
    recordPass('OTP Route', testName);
  } catch (err) {
    recordFail('OTP Route', 'POST /api/framer-auth/otp brute-force lockout after >5 failed attempts', err);
  }

  // ---------------------------------------------------------------------------
  // SUITE 5: Password Reset Route (POST /api/framer-auth/reset-password)
  // ---------------------------------------------------------------------------
  console.log('\n--- SUITE 5: Password Reset Route (POST /api/framer-auth/reset-password) ---');

  // OPTIONS test
  try {
    const testName = 'OPTIONS /api/framer-auth/reset-password (CORS)';
    const res = await resetOPTIONS();
    assert.strictEqual(res.status, 204);
    recordPass('Password Reset Route', testName);
  } catch (err) {
    recordFail('Password Reset Route', 'OPTIONS /api/framer-auth/reset-password (CORS)', err);
  }

  const resetEmail = `reset.stress.${crypto.randomBytes(6).toString('hex')}@studio.co`;

  // Action: request
  let generatedResetCode = '';
  try {
    const testName = 'POST /api/framer-auth/reset-password action:request';
    const req = new Request('http://localhost:3000/api/framer-auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'request',
        email: resetEmail,
        plugin: 'framedrop',
      }),
    });

    const res = await resetPOST(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(data.devCode);
    generatedResetCode = data.devCode;
    recordPass('Password Reset Route', testName, { code: generatedResetCode });
  } catch (err) {
    recordFail('Password Reset Route', 'POST /api/framer-auth/reset-password action:request', err);
  }

  // Action: reset with short password (< 6 chars)
  try {
    const testName = 'POST /api/framer-auth/reset-password short password rejection';
    const req = new Request('http://localhost:3000/api/framer-auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reset',
        email: resetEmail,
        code: generatedResetCode,
        newPassword: '123', // < 6 chars
      }),
    });

    const res = await resetPOST(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert(data.message.includes('6 characters'));
    recordPass('Password Reset Route', testName);
  } catch (err) {
    recordFail('Password Reset Route', 'POST /api/framer-auth/reset-password short password rejection', err);
  }

  // Action: reset with wrong code
  try {
    const testName = 'POST /api/framer-auth/reset-password wrong code rejection';
    const req = new Request('http://localhost:3000/api/framer-auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reset',
        email: resetEmail,
        code: '111111',
        newPassword: 'myStrongPassword2026!',
      }),
    });

    const res = await resetPOST(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    recordPass('Password Reset Route', testName);
  } catch (err) {
    recordFail('Password Reset Route', 'POST /api/framer-auth/reset-password wrong code rejection', err);
  }

  // Action: reset with CORRECT code
  try {
    const testName = 'POST /api/framer-auth/reset-password valid reset completion';
    const req = new Request('http://localhost:3000/api/framer-auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reset',
        email: resetEmail,
        code: generatedResetCode,
        newPassword: 'myStrongPassword2026!',
        plugin: 'framedrop',
      }),
    });

    const res = await resetPOST(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(data.token);
    assert.strictEqual(data.user.email, resetEmail);
    assert.strictEqual(data.plugin.slug, 'frame-drop');
    recordPass('Password Reset Route', testName);
  } catch (err) {
    recordFail('Password Reset Route', 'POST /api/framer-auth/reset-password valid reset completion', err);
  }

  // Reset code replay attack (cannot reuse consumed reset code)
  try {
    const testName = 'POST /api/framer-auth/reset-password consumed code replay rejection';
    const req = new Request('http://localhost:3000/api/framer-auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reset',
        email: resetEmail,
        code: generatedResetCode,
        newPassword: 'anotherPassword123!',
      }),
    });

    const res = await resetPOST(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    recordPass('Password Reset Route', testName);
  } catch (err) {
    recordFail('Password Reset Route', 'POST /api/framer-auth/reset-password consumed code replay rejection', err);
  }

  // ---------------------------------------------------------------------------
  // SUITE 6: Teams Route (GET & POST /api/framer-auth/teams)
  // ---------------------------------------------------------------------------
  console.log('\n--- SUITE 6: Teams Route (GET & POST /api/framer-auth/teams) ---');

  // GET teams
  try {
    const testName = 'GET /api/framer-auth/teams default teams list';
    const req = new Request('http://localhost:3000/api/framer-auth/teams?email=designer@studio.com');
    const res = await teamsGET(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(Array.isArray(data.teams));
    assert(data.teams.length >= 3);
    assert.strictEqual(data.teams[0].name, "designer's Workspace");
    recordPass('Teams Route', testName, { count: data.teams.length });
  } catch (err) {
    recordFail('Teams Route', 'GET /api/framer-auth/teams default teams list', err);
  }

  // POST switch team
  try {
    const testName = 'POST /api/framer-auth/teams switch workspace';
    const email = `team.${crypto.randomBytes(6).toString('hex')}@studio.co`;
    const req = new Request('http://localhost:3000/api/framer-auth/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name: 'Team Player',
        teamId: 'team_agency',
        teamName: 'Design Studio & Agency Hub',
        teamRole: 'Admin',
        plugin: 'framedrop',
      }),
    });

    const res = await teamsPOST(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.team_id, 'team_agency');
    assert.strictEqual(data.user.team_name, 'Design Studio & Agency Hub');
    assert.strictEqual(data.plugin.slug, 'frame-drop');
    recordPass('Teams Route', testName);
  } catch (err) {
    recordFail('Teams Route', 'POST /api/framer-auth/teams switch workspace', err);
  }

  // ---------------------------------------------------------------------------
  // SUITE 7: Concurrency & Local Data Store Integrity
  // ---------------------------------------------------------------------------
  console.log('\n--- SUITE 7: Concurrency & Local Data Store Integrity ---');

  try {
    const testName = 'Concurrent user creations (10 parallel requests)';
    const parallelCount = 10;
    const promises = [];

    for (let i = 0; i < parallelCount; i++) {
      const email = `concurrent.${i}.${crypto.randomBytes(4).toString('hex')}@loadtest.com`;
      promises.push(
        createOrUpdateFramerUser({
          email,
          name: `Concurrent User ${i}`,
          company_name: `Concurrent Org ${i}`,
          website_url: `https://org${i}.com`,
          pluginSlug: 'frame-drop',
        })
      );
    }

    const createdUsers = await Promise.all(promises);
    assert.strictEqual(createdUsers.length, parallelCount);
    for (const u of createdUsers) {
      assert(u.token);
      assert(u.user.company_name);
    }

    // Verify stats
    const list = await getFramerUsersList();
    assert(list.stats.total >= parallelCount);
    recordPass('Concurrency & Store Integrity', testName, { totalUsers: list.stats.total });
  } catch (err) {
    recordFail('Concurrency & Store Integrity', 'Concurrent user creations (10 parallel requests)', err);
  }

  // ---------------------------------------------------------------------------
  // SUITE 8: Adversarial Security & Robustness Stress Tests
  // ---------------------------------------------------------------------------
  console.log('\n--- SUITE 8: Adversarial Security & Robustness Stress Tests ---');

  // Test 8.1: Prototype Property Leak in getPluginMetadata
  try {
    const testName = 'Prototype check: getPluginMetadata("constructor")';
    const meta = getPluginMetadata('constructor');
    // If it returns [Function: Object], that is a prototype leak!
    const isLeaked = typeof meta === 'function' || !meta.slug || !Array.isArray(meta.features);
    if (isLeaked) {
      console.warn('  [VULNERABILITY/DEFECT DISCOVERED]: getPluginMetadata("constructor") returns Function prototype instead of FramerPluginMetadata!');
      recordFail('Adversarial Security', testName, new Error('getPluginMetadata("constructor") returned prototype function instead of FramerPluginMetadata object'));
    } else {
      recordPass('Adversarial Security', testName);
    }
  } catch (err) {
    recordFail('Adversarial Security', 'Prototype check: getPluginMetadata("constructor")', err);
  }

  // Test 8.2: Session Route resistance to prototype slug
  try {
    const testName = 'POST /api/framer-auth/session with plugin="constructor"';
    const email = `proto.${crypto.randomBytes(6).toString('hex')}@studio.co`;
    const req = new Request('http://localhost:3000/api/framer-auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        plugin: 'constructor',
      }),
    });

    const res = await sessionPOST(req);
    // If it returns 500, it suffered an unhandled TypeError crash internally
    if (res.status === 500) {
      console.warn('  [DEFECT DISCOVERED]: POST /api/framer-auth/session returned 500 Internal Server Error when given plugin="constructor"!');
      recordFail('Adversarial Security', testName, new Error('Session route crashed with 500 on prototype property plugin="constructor"'));
    } else {
      recordPass('Adversarial Security', testName, { status: res.status });
    }
  } catch (err) {
    recordFail('Adversarial Security', 'POST /api/framer-auth/session with plugin="constructor"', err);
  }

  // Test 8.3: Malformed JSON syntax error handling
  try {
    const testName = 'POST /api/framer-auth/session with malformed JSON body';
    const req = new Request('http://localhost:3000/api/framer-auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"unclosed_json',
    });

    const res = await sessionPOST(req);
    // When malformed JSON is passed, request.json() throws SyntaxError.
    // In session/route.ts, it catches error and returns status 500.
    // Standard REST should ideally return 400 Bad Request, but let's record the behavior.
    assert(res.status === 400 || res.status === 500, 'Must handle malformed JSON safely without process termination');
    recordPass('Adversarial Security', testName, { status: res.status });
  } catch (err) {
    recordFail('Adversarial Security', 'POST /api/framer-auth/session with malformed JSON body', err);
  }

  // Test 8.4: Non-string / type-juggling email inputs
  try {
    const testName = 'Type-juggling email inputs: integer, boolean, object, array';
    const badInputs = [12345, true, false, { email: 'nested@test.com' }, ['array@test.com']];
    for (const bad of badInputs) {
      const req = new Request('http://localhost:3000/api/framer-auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: bad }),
      });
      const res = await sessionPOST(req);
      assert.strictEqual(res.status, 400, `Must reject non-string email ${JSON.stringify(bad)} with 400`);
    }
    recordPass('Adversarial Security', testName);
  } catch (err) {
    recordFail('Adversarial Security', 'Type-juggling email inputs: integer, boolean, object, array', err);
  }

  // Test 8.5: Verify OTP when none was ever requested
  try {
    const testName = 'POST /api/framer-auth/otp verify when no OTP was requested';
    const req = new Request('http://localhost:3000/api/framer-auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify',
        email: `ghost.${crypto.randomBytes(6).toString('hex')}@unrequested.io`,
        code: '123456',
      }),
    });
    const res = await otpPOST(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert(data.message.includes('No active verification code found'));
    recordPass('Adversarial Security', testName);
  } catch (err) {
    recordFail('Adversarial Security', 'POST /api/framer-auth/otp verify when no OTP was requested', err);
  }

  // Test 8.6: Password reset when none was ever requested
  try {
    const testName = 'POST /api/framer-auth/reset-password reset when no code requested';
    const req = new Request('http://localhost:3000/api/framer-auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reset',
        email: `ghost.reset.${crypto.randomBytes(6).toString('hex')}@unrequested.io`,
        code: '123456',
        newPassword: 'myStrongPassword2026!',
      }),
    });
    const res = await resetPOST(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert(data.message.includes('No active password reset request found'));
    recordPass('Adversarial Security', testName);
  } catch (err) {
    recordFail('Adversarial Security', 'POST /api/framer-auth/reset-password reset when no code requested', err);
  }

  // Test 8.7: Onboarding fields with numeric / non-string values
  try {
    const testName = 'Onboarding: non-string / numeric company and URL';
    const email = `type.coerce.${crypto.randomBytes(6).toString('hex')}@studio.co`;
    const res = await createOrUpdateFramerUser({
      email,
      name: 'Type Coercion Test',
      company_name: 123456 as unknown as string,
      website_url: 987654 as unknown as string,
      pluginSlug: 'frame-drop',
    });
    assert(res.user, 'User should be created/updated');
    recordPass('Adversarial Security', testName);
  } catch (err) {
    recordFail('Adversarial Security', 'Onboarding: non-string / numeric company and URL', err);
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n================================================================');
  console.log(`CHALLENGER SUITE COMPLETE: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('================================================================');

  if (failed > 0) {
    console.error(`\nFAILURE SUMMARY (${failed} tests failed):`);
    for (const r of results.filter((r) => !r.passed)) {
      console.error(`- [${r.suite}] ${r.name}: ${r.error}`);
    }
    process.exit(1);
  }
}

runChallenge().catch((fatal) => {
  console.error('Fatal crash executing challenge suite:', fatal);
  process.exit(1);
});
