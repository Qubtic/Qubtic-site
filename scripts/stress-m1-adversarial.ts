/**
 * Challenger M1-2 Adversarial Empirical Test Suite
 * Milestone 1: External Auth Flows, Teams Route, Supabase Fallback, and UI State Transitions
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { GET as getTeamsRoute, POST as postTeamsRoute } from '@/app/api/framer-auth/teams/route';
import { POST as postSessionRoute } from '@/app/api/framer-auth/session/route';
import { POST as postOtpRoute } from '@/app/api/framer-auth/otp/route';
import { POST as postResetRoute } from '@/app/api/framer-auth/reset-password/route';
import {
  createOrUpdateFramerUser,
  verifyFramerSessionToken,
  getFramerUsersList,
  sendAuthOtpCode,
  verifyAuthOtpCode,
  requestAuthPasswordReset,
  resetAuthUserPassword,
  FramerUserRecord,
} from '@/lib/framer-auth';
import { supabase } from '@/lib/supabase';
import { getPluginMetadata } from '@/lib/plugins-registry';

const STORE_PATH = path.join(process.cwd(), 'src', 'data', 'store', 'framer_users.json');

// Helper to create Request object
function makeRequest(url: string, method: string = 'GET', body?: unknown, headers?: Record<string, string>) {
  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers || {}),
  };
  return new Request(url, {
    method,
    headers: reqHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

// Backup & restore local store
let originalStoreBackup: string | null = null;
function backupStore() {
  if (fs.existsSync(STORE_PATH)) {
    originalStoreBackup = fs.readFileSync(STORE_PATH, 'utf-8');
  }
}
function restoreStore() {
  if (originalStoreBackup !== null) {
    fs.writeFileSync(STORE_PATH, originalStoreBackup, 'utf-8');
  }
}

async function runAdversarialSuite() {
  console.log('================================================================');
  console.log('CHALLENGER M1-2 ADVERSARIAL STRESS TEST SUITE');
  console.log('Target: Milestone 1 Auth Flows, Teams Route, Supabase Fallback, UI Transitions');
  console.log('================================================================\n');

  backupStore();

  const results: { name: string; passed: boolean; details?: string }[] = [];

  // ============================================================================
  // SUITE 1: TEAMS/ROUTE.TS STRESS & CONCURRENCY TESTING
  // ============================================================================
  console.log('>>> [SUITE 1] teams/route.ts Validation, Concurrency & Workspace Switching');

  // Test 1.1: GET teams list
  try {
    const reqWithEmail = makeRequest('http://localhost:3000/api/framer-auth/teams?email=sarah.designer@studio.com');
    const resWithEmail = await getTeamsRoute(reqWithEmail);
    assert.strictEqual(resWithEmail.status, 200);
    const dataWithEmail = await resWithEmail.json();
    assert.strictEqual(dataWithEmail.success, true);
    assert.strictEqual(Array.isArray(dataWithEmail.teams), true);
    assert.strictEqual(dataWithEmail.teams.length, 3);
    assert.strictEqual(dataWithEmail.teams[0].id, 'team_personal');
    assert.strictEqual(dataWithEmail.teams[0].name, "sarah.designer's Workspace");
    assert.strictEqual(dataWithEmail.teams[0].isDefault, true);

    const reqNoEmail = makeRequest('http://localhost:3000/api/framer-auth/teams');
    const resNoEmail = await getTeamsRoute(reqNoEmail);
    const dataNoEmail = await resNoEmail.json();
    assert.strictEqual(dataNoEmail.teams[0].name, 'Personal Workspace');

    results.push({ name: '1.1 GET teams route structure and email personalization', passed: true });
    console.log('  ✔ 1.1 GET teams route structure & dynamic workspace name verified.');
  } catch (err: unknown) {
    results.push({ name: '1.1 GET teams route', passed: false, details: String(err) });
    console.error('  ✖ 1.1 FAILED:', err);
  }

  // Test 1.2: POST teams with invalid email formats
  try {
    const invalidEmails = [
      { payload: {}, desc: 'missing email' },
      { payload: { email: null }, desc: 'null email' },
      { payload: { email: 123456 }, desc: 'numeric email' },
      { payload: { email: '' }, desc: 'empty string' },
      { payload: { email: '   ' }, desc: 'whitespace string' },
      { payload: { email: 'invalid_no_at_domain.com' }, desc: 'missing @ sign' },
      { payload: { email: false }, desc: 'boolean email' },
    ];

    for (const testCase of invalidEmails) {
      const req = makeRequest('http://localhost:3000/api/framer-auth/teams', 'POST', testCase.payload);
      const res = await postTeamsRoute(req);
      assert.strictEqual(res.status, 400, `Expected 400 for ${testCase.desc}`);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert(data.message.includes('valid email address'), `Message mismatch for ${testCase.desc}`);
    }

    results.push({ name: '1.2 POST teams rejection of invalid email inputs', passed: true });
    console.log('  ✔ 1.2 POST teams route correctly rejects all 7 invalid email formats with 400 Bad Request.');
  } catch (err: unknown) {
    results.push({ name: '1.2 POST teams invalid email rejection', passed: false, details: String(err) });
    console.error('  ✖ 1.2 FAILED:', err);
  }

  // Test 1.3: POST teams workspace switching flow (initial create -> switch to agency -> switch to custom)
  const testEmail1 = `challenger.test.${Date.now()}@qubtic-review.test`;
  try {
    // Initial switch / creation (Personal Workspace)
    const req1 = makeRequest('http://localhost:3000/api/framer-auth/teams', 'POST', {
      email: testEmail1,
      name: 'Challenger Agent',
      teamId: 'team_personal',
      teamName: 'Personal Workspace',
      teamRole: 'Owner',
      plugin: 'frame-drop',
    });
    const res1 = await postTeamsRoute(req1);
    assert.strictEqual(res1.status, 200);
    const data1 = await res1.json();
    assert.strictEqual(data1.success, true);
    assert.strictEqual(data1.isNew, true, 'First registration must be isNew = true');
    assert.strictEqual(data1.user.team_id, 'team_personal');
    assert.strictEqual(data1.user.team_name, 'Personal Workspace');
    assert.strictEqual(data1.user.team_role, 'Owner');
    assert(data1.token.startsWith('qbt_fr_framedro_'), 'Token prefix must be frame-drop');
    assert(data1.sessionCode.length === 6, 'Session code must be 6 alphanumeric chars');

    // Second switch (Design Studio & Agency Hub) - Duplicate sign-up / workspace switch
    const req2 = makeRequest('http://localhost:3000/api/framer-auth/teams', 'POST', {
      email: testEmail1,
      teamId: 'team_agency',
      teamName: 'Design Studio & Agency Hub',
      teamRole: 'Admin',
      plugin: 'frame-drop',
    });
    const res2 = await postTeamsRoute(req2);
    assert.strictEqual(res2.status, 200);
    const data2 = await res2.json();
    assert.strictEqual(data2.success, true);
    assert.strictEqual(data2.isNew, false, 'Existing user workspace switch must have isNew = false');
    assert.strictEqual(data2.user.team_id, 'team_agency');
    assert.strictEqual(data2.user.team_name, 'Design Studio & Agency Hub');
    assert.strictEqual(data2.user.team_role, 'Admin');

    // Third switch (Custom Workspace)
    const req3 = makeRequest('http://localhost:3000/api/framer-auth/teams', 'POST', {
      email: testEmail1,
      teamId: 'custom',
      teamName: 'Brand Experience Lab',
      teamRole: 'Lead Designer',
      plugin: 'frame-drop',
    });
    const res3 = await postTeamsRoute(req3);
    assert.strictEqual(res3.status, 200);
    const data3 = await res3.json();
    assert.strictEqual(data3.success, true);
    assert.strictEqual(data3.isNew, false);
    assert.strictEqual(data3.user.team_id, 'custom');
    assert.strictEqual(data3.user.team_name, 'Brand Experience Lab');
    assert.strictEqual(data3.user.team_role, 'Lead Designer');

    results.push({ name: '1.3 Workspace switching & duplicate sign-up idempotency', passed: true });
    console.log('  ✔ 1.3 Workspace switching flow: Personal -> Agency -> Custom verified with correct team state.');
  } catch (err: unknown) {
    results.push({ name: '1.3 Workspace switching', passed: false, details: String(err) });
    console.error('  ✖ 1.3 FAILED:', err);
  }

  // Test 1.4: Concurrent workspace switching requests for SAME user
  try {
    console.log('  ... Stress-testing 10 concurrent workspace switch requests for single user');
    const teams = [
      { id: 'team_personal', name: 'Personal Studio', role: 'Owner' },
      { id: 'team_agency', name: 'Design Studio & Agency Hub', role: 'Admin' },
      { id: 'team_marketing', name: 'Growth & Brand Marketing Team', role: 'Editor' },
      { id: 'custom_1', name: 'Custom Design Ops', role: 'Lead' },
      { id: 'custom_2', name: 'Motion Hub', role: 'Creator' },
    ];

    const concurrentReqs = Array.from({ length: 10 }).map((_, i) => {
      const t = teams[i % teams.length];
      const req = makeRequest('http://localhost:3000/api/framer-auth/teams', 'POST', {
        email: testEmail1,
        teamId: t.id,
        teamName: t.name,
        teamRole: t.role,
        plugin: 'frame-drop',
      });
      return postTeamsRoute(req).then(async (res) => {
        assert.strictEqual(res.status, 200);
        const body = await res.json();
        assert.strictEqual(body.success, true);
        assert(body.token.startsWith('qbt_fr_'));
        return body;
      });
    });

    const responses = await Promise.all(concurrentReqs);
    assert.strictEqual(responses.length, 10);
    // Ensure all 10 got valid response objects
    for (const r of responses) {
      assert.strictEqual(r.user.email, testEmail1);
    }

    results.push({ name: '1.4 Concurrent workspace switching for same user (10 requests)', passed: true });
    console.log('  ✔ 1.4 All 10 concurrent workspace switch requests succeeded with HTTP 200 and valid tokens.');
  } catch (err: unknown) {
    results.push({ name: '1.4 Concurrent workspace switching', passed: false, details: String(err) });
    console.error('  ✖ 1.4 FAILED:', err);
  }

  // Test 1.5: Concurrent registrations with 15 DISTINCT new users
  try {
    console.log('  ... Stress-testing 15 concurrent registrations with distinct users');
    const distinctEmails = Array.from({ length: 15 }).map(
      (_, i) => `distinct.user.${Date.now()}.${i}@stress.test`
    );

    const distinctReqs = distinctEmails.map((email, idx) => {
      const req = makeRequest('http://localhost:3000/api/framer-auth/teams', 'POST', {
        email,
        name: `User ${idx}`,
        teamId: `team_${idx}`,
        teamName: `Workspace ${idx}`,
        teamRole: idx === 0 ? 'Owner' : 'Member',
        plugin: 'frame-drop',
      });
      return postTeamsRoute(req).then(async (res) => {
        assert.strictEqual(res.status, 200);
        const data = await res.json();
        assert.strictEqual(data.success, true);
        assert.strictEqual(data.isNew, true);
        return { email, token: data.token, user: data.user };
      });
    });

    const distinctResults = await Promise.all(distinctReqs);
    assert.strictEqual(distinctResults.length, 15);

    // Verify all tokens are unique
    const tokenSet = new Set(distinctResults.map((r) => r.token));
    assert.strictEqual(tokenSet.size, 15, 'All 15 generated tokens must be unique');

    // Verify store file integrity
    const rawStore = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsedStore = JSON.parse(rawStore) as FramerUserRecord[];
    assert(Array.isArray(parsedStore), 'Store must be a valid JSON array');

    for (const r of distinctResults) {
      const found = parsedStore.some((u) => u.email === r.email);
      assert(found, `User ${r.email} must exist in persistent store`);
    }

    results.push({ name: '1.5 Concurrent registrations of 15 distinct users with unique tokens', passed: true });
    console.log('  ✔ 1.5 15 concurrent registrations succeeded; 15/15 unique tokens generated & store verified.');
  } catch (err: unknown) {
    results.push({ name: '1.5 Concurrent distinct registrations', passed: false, details: String(err) });
    console.error('  ✖ 1.5 FAILED:', err);
  }

  // Test 1.6: Concurrent duplicate sign-ups for the EXACT SAME brand new user
  try {
    console.log('  ... Stress-testing 10 concurrent duplicate sign-ups for identical new email');
    const duplicateEmail = `race.signup.${Date.now()}@concurrency.test`;

    const duplicateReqs = Array.from({ length: 10 }).map((_, i) => {
      const req = makeRequest('http://localhost:3000/api/framer-auth/teams', 'POST', {
        email: duplicateEmail,
        name: `Racer ${i}`,
        teamId: `team_concurrent_${i}`,
        teamName: `Concurrent Team ${i}`,
        teamRole: i === 0 ? 'Owner' : 'Member',
        plugin: 'frame-drop',
      });
      return postTeamsRoute(req).then(async (res) => {
        assert.strictEqual(res.status, 200, `Concurrent duplicate sign-up must return 200, got ${res.status}`);
        const data = await res.json();
        assert.strictEqual(data.success, true);
        return data;
      });
    });

    const duplicateResults = await Promise.all(duplicateReqs);
    assert.strictEqual(duplicateResults.length, 10);

    // Verify all 10 got valid responses with duplicateEmail
    for (const r of duplicateResults) {
      assert.strictEqual(r.user.email, duplicateEmail);
      assert(r.token.startsWith('qbt_fr_'));
    }

    // Verify store has only 1 entry for this email/plugin
    const rawStore = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsedStore = JSON.parse(rawStore) as FramerUserRecord[];
    const matchingEntries = parsedStore.filter((u) => u.email === duplicateEmail && u.plugin_slug === 'frame-drop');
    assert.strictEqual(matchingEntries.length, 1, 'Store must contain exactly 1 entry for duplicate email to avoid data duplication');

    results.push({ name: '1.6 Concurrent duplicate sign-up race condition resilience (10 requests)', passed: true });
    console.log('  ✔ 1.6 All 10 concurrent duplicate sign-ups succeeded with HTTP 200, single user record maintained.');
  } catch (err: unknown) {
    results.push({ name: '1.6 Concurrent duplicate sign-up race condition', passed: false, details: String(err) });
    console.error('  ✖ 1.6 FAILED:', err);
  }

  // ============================================================================
  // SUITE 2: LOCAL JSON STORE PERSISTENCE & SUPABASE UNREACHABLE FALLBACK
  // ============================================================================
  console.log('\n>>> [SUITE 2] Local JSON Store Persistence & Supabase Fallback Behavior');

  // Test 2.1: Onboarding fields persistence in local store & retrieval
  try {
    const onboardingEmail = `onboarding.test.${Date.now()}@acmedesign.co`;
    const company = 'Acme Design Collective';
    const website = 'https://acmedesign.co';

    const sessionReq = makeRequest('http://localhost:3000/api/framer-auth/session', 'POST', {
      email: onboardingEmail,
      name: 'Jordan Designer',
      company_name: company,
      website_url: website,
      plugin: 'frame-drop',
      mode: 'signup',
    });
    const sessionRes = await postSessionRoute(sessionReq);
    assert.strictEqual(sessionRes.status, 200);
    const sessionData = await sessionRes.json();
    assert.strictEqual(sessionData.success, true);
    assert.strictEqual(sessionData.user.company_name, company);
    assert.strictEqual(sessionData.user.website_url, website);

    // Verify raw file persistence
    const rawUsers = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8')) as FramerUserRecord[];
    const diskUser = rawUsers.find((u) => u.email === onboardingEmail);
    assert(diskUser, 'User must be written to disk in framer_users.json');
    assert.strictEqual(diskUser.company_name, company);
    assert.strictEqual(diskUser.website_url, website);

    // Verify session token lookup
    const tokenUser = await verifyFramerSessionToken(sessionData.token, 'frame-drop');
    assert(tokenUser, 'Token must resolve user');
    assert.strictEqual(tokenUser.company_name, company);
    assert.strictEqual(tokenUser.website_url, website);

    results.push({ name: '2.1 Onboarding fields persistence in JSON store and token lookup', passed: true });
    console.log('  ✔ 2.1 Onboarding fields (company_name & website_url) persisted and verified from disk.');
  } catch (err: unknown) {
    results.push({ name: '2.1 Onboarding fields persistence', passed: false, details: String(err) });
    console.error('  ✖ 2.1 FAILED:', err);
  }

  // Test 2.2: Supabase Unreachable Fallback Simulation
  try {
    console.log('  ... Testing system behavior when Supabase is completely unreachable');

    // Temporarily spy/stub supabase.from to simulate network timeout / connection failure
    const originalFrom = supabase.from.bind(supabase);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from = function (table: string) {
      if (table === 'framer_users') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: null,
                  error: {
                    message: 'FetchError: getaddrinfo ENOTFOUND yxdcolirkiaslrhvmrht.supabase.co',
                    code: 'ENOTFOUND',
                    details: 'Failed to connect to Supabase backend API',
                  },
                }),
              }),
              order: () => Promise.resolve({
                data: null,
                error: { message: 'Network connection failed' },
              }),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: null,
                error: { message: 'Supabase unreachable on insert' },
              }),
            }),
          }),
          update: () => ({
            eq: () => ({
              select: () => ({
                single: async () => ({
                  data: null,
                  error: { message: 'Supabase unreachable on update' },
                }),
              }),
            }),
          }),
          delete: () => ({
            eq: () => Promise.reject(new Error('Supabase network connection refused')),
          }),
        };
      }
      return originalFrom(table);
    };

    const offlineEmail = `offline.designer.${Date.now()}@fallback.test`;

    // 1. Test createOrUpdateFramerUser during Supabase outage
    const offlineResult = await createOrUpdateFramerUser({
      email: offlineEmail,
      name: 'Offline Hero',
      company_name: 'Resilient Design Co',
      website_url: 'https://resilient.design',
      pluginSlug: 'frame-drop',
      plan: 'pro',
    });

    assert(offlineResult.user, 'Offline user must be created in fallback store');
    assert.strictEqual(offlineResult.isNew, true);
    assert.strictEqual(offlineResult.user.company_name, 'Resilient Design Co');
    assert(offlineResult.token.startsWith('qbt_fr_'));

    // 2. Test verifyFramerSessionToken during Supabase outage
    const offlineVerified = await verifyFramerSessionToken(offlineResult.token, 'frame-drop');
    assert(offlineVerified, 'Offline token must be verified via local JSON store');
    assert.strictEqual(offlineVerified.email, offlineEmail);
    assert.strictEqual(offlineVerified.company_name, 'Resilient Design Co');

    // 3. Test teams route POST during Supabase outage
    const offlineTeamsReq = makeRequest('http://localhost:3000/api/framer-auth/teams', 'POST', {
      email: offlineEmail,
      teamId: 'team_marketing',
      teamName: 'Growth & Brand Marketing Team',
      teamRole: 'Lead',
      plugin: 'frame-drop',
    });
    const offlineTeamsRes = await postTeamsRoute(offlineTeamsReq);
    assert.strictEqual(offlineTeamsRes.status, 200, 'Teams route must return 200 even during Supabase outage');
    const offlineTeamsData = await offlineTeamsRes.json();
    assert.strictEqual(offlineTeamsData.success, true);
    assert.strictEqual(offlineTeamsData.user.team_name, 'Growth & Brand Marketing Team');

    // 4. Test getFramerUsersList during Supabase outage
    const usersList = await getFramerUsersList();
    assert(usersList.users.length > 0, 'Users list must be populated from local fallback');
    assert(usersList.users.some((u) => u.email === offlineEmail), 'Offline user must be in user list');

    // Restore original supabase client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from = originalFrom;

    results.push({ name: '2.2 Supabase outage fallback: seamless creation, verification, and workspace switching', passed: true });
    console.log('  ✔ 2.2 System gracefully survived simulated Supabase outage (creation, verification, teams POST all 100% operational).');
  } catch (err: unknown) {
    results.push({ name: '2.2 Supabase outage fallback', passed: false, details: String(err) });
    console.error('  ✖ 2.2 FAILED:', err);
  }

  // ============================================================================
  // SUITE 3: UI FORM STATE TRANSITIONS IN QubticFramerAuthPortal.tsx
  // ============================================================================
  console.log('\n>>> [SUITE 3] UI Form State Transitions & Handshake Mechanics');

  // Test 3.1: OTP Flow State Transitions (send -> invalid verify -> valid verify -> session creation)
  try {
    const otpUserEmail = `otp.ui.tester.${Date.now()}@framermotion.dev`;

    // Step A: Request OTP
    const sendOtpReq = makeRequest('http://localhost:3000/api/framer-auth/otp', 'POST', {
      action: 'send',
      email: otpUserEmail,
      plugin: 'frame-drop',
    });
    const sendOtpRes = await postOtpRoute(sendOtpReq);
    assert.strictEqual(sendOtpRes.status, 200);
    const sendOtpData = await sendOtpRes.json();
    assert.strictEqual(sendOtpData.success, true);
    assert(sendOtpData.devCode, 'devCode must be returned for testing');

    // Step B: Submit invalid code
    const badOtpReq = makeRequest('http://localhost:3000/api/framer-auth/otp', 'POST', {
      action: 'verify',
      email: otpUserEmail,
      code: '000000',
      plugin: 'frame-drop',
    });
    const badOtpRes = await postOtpRoute(badOtpReq);
    assert.strictEqual(badOtpRes.status, 400);
    const badOtpData = await badOtpRes.json();
    assert.strictEqual(badOtpData.success, false);
    assert(badOtpData.message.includes('Invalid verification code'));

    // Step C: Submit valid code
    const validOtpReq = makeRequest('http://localhost:3000/api/framer-auth/otp', 'POST', {
      action: 'verify',
      email: otpUserEmail,
      code: sendOtpData.devCode,
      plugin: 'frame-drop',
    });
    const validOtpRes = await postOtpRoute(validOtpReq);
    assert.strictEqual(validOtpRes.status, 200);
    const validOtpData = await validOtpRes.json();
    assert.strictEqual(validOtpData.success, true);
    assert.strictEqual(validOtpData.user.email, otpUserEmail);
    assert(validOtpData.token.startsWith('qbt_fr_'));
    assert.strictEqual(validOtpData.sessionCode.length, 6);

    results.push({ name: '3.1 OTP state transition flow (dispatch -> invalid code rejection -> verification & session creation)', passed: true });
    console.log('  ✔ 3.1 OTP state transition flow passed (send -> reject bad code -> establish session).');
  } catch (err: unknown) {
    results.push({ name: '3.1 OTP state transition flow', passed: false, details: String(err) });
    console.error('  ✖ 3.1 FAILED:', err);
  }

  // Test 3.2: Password Reset State Transitions (request -> invalid code rejection -> password update & session)
  try {
    const resetUserEmail = `reset.ui.tester.${Date.now()}@designops.agency`;

    // Step A: Request password reset
    const requestResetReq = makeRequest('http://localhost:3000/api/framer-auth/reset-password', 'POST', {
      action: 'request',
      email: resetUserEmail,
      plugin: 'frame-drop',
    });
    const requestResetRes = await postResetRoute(requestResetReq);
    assert.strictEqual(requestResetRes.status, 200);
    const requestResetData = await requestResetRes.json();
    assert.strictEqual(requestResetData.success, true);
    assert(requestResetData.devCode, 'devCode must be generated for reset');

    // Step B: Submit invalid reset code
    const badResetReq = makeRequest('http://localhost:3000/api/framer-auth/reset-password', 'POST', {
      action: 'reset',
      email: resetUserEmail,
      code: '999999',
      newPassword: 'newBrandPassword2026!',
      plugin: 'frame-drop',
    });
    const badResetRes = await postResetRoute(badResetReq);
    assert.strictEqual(badResetRes.status, 400);
    const badResetData = await badResetRes.json();
    assert.strictEqual(badResetData.success, false);
    assert(badResetData.message.includes('Invalid reset code'));

    // Step C: Submit valid code and update password
    const validResetReq = makeRequest('http://localhost:3000/api/framer-auth/reset-password', 'POST', {
      action: 'reset',
      email: resetUserEmail,
      code: requestResetData.devCode,
      newPassword: 'newBrandPassword2026!',
      plugin: 'frame-drop',
    });
    const validResetRes = await postResetRoute(validResetReq);
    assert.strictEqual(validResetRes.status, 200);
    const validResetData = await validResetRes.json();
    assert.strictEqual(validResetData.success, true);
    assert.strictEqual(validResetData.user.email, resetUserEmail);
    assert(validResetData.token.startsWith('qbt_fr_'));

    results.push({ name: '3.2 Password reset state transition flow (request -> reject bad code -> set new password & authenticate)', passed: true });
    console.log('  ✔ 3.2 Password reset state transition flow verified.');
  } catch (err: unknown) {
    results.push({ name: '3.2 Password reset state transition flow', passed: false, details: String(err) });
    console.error('  ✖ 3.2 FAILED:', err);
  }

  // Test 3.3: Static Verification of QubticFramerAuthPortal.tsx component contracts
  try {
    const portalFile = path.join(process.cwd(), 'src', 'components', 'framer', 'auth', 'QubticFramerAuthPortal.tsx');
    const portalCode = fs.readFileSync(portalFile, 'utf-8');

    // Verify all 5 tab definitions exist
    assert(portalCode.includes("'signin' | 'signup' | 'otp' | 'reset' | 'teams'"), 'AuthTab union must include all 5 tabs');

    // Verify Onboarding fields (Feature F6)
    assert(portalCode.includes('name="company_name"'), 'Company name input field must exist');
    assert(portalCode.includes('name="website_url"'), 'Website URL input field must exist');
    assert(portalCode.includes('company_name: companyName'), 'companyName must be passed in submission payload');
    assert(portalCode.includes('website_url: websiteUrl'), 'websiteUrl must be passed in submission payload');

    // Verify PostMessage Handshake Contract
    assert(portalCode.includes("type: 'QUBTIC_AUTH_SUCCESS'"), 'PostMessage must declare QUBTIC_AUTH_SUCCESS');
    assert(portalCode.includes("source: 'qubtic-auth-portal'"), 'PostMessage must declare source qubtic-auth-portal');
    assert(portalCode.includes('token: successData.token'), 'PostMessage must broadcast token');
    assert(portalCode.includes('sessionCode: successData.sessionCode'), 'PostMessage must broadcast sessionCode');
    assert(portalCode.includes('window.opener.postMessage'), 'Must call window.opener.postMessage');

    // Verify Success View display of onboarding & teams
    assert(portalCode.includes('successData.user.company_name'), 'Success view must display company_name');
    assert(portalCode.includes('successData.user.team_name'), 'Success view must display team_name');
    assert(portalCode.includes('successData.sessionCode'), 'Success view must display 6-digit session pin');

    results.push({ name: '3.3 UI Component contracts: 5 tabs, onboarding fields, PostMessage handshake & success view', passed: true });
    console.log('  ✔ 3.3 QubticFramerAuthPortal component contracts (5 tabs, onboarding inputs, PostMessage handshake, success view) verified.');
  } catch (err: unknown) {
    results.push({ name: '3.3 UI Component contracts', passed: false, details: String(err) });
    console.error('  ✖ 3.3 FAILED:', err);
  }

  restoreStore();

  console.log('\n================================================================');
  console.log(`TEST EXECUTION SUMMARY: ${results.filter((r) => r.passed).length}/${results.length} PASSED`);
  console.log('================================================================');

  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    console.error('\nFAILED TESTS:');
    for (const f of failed) {
      console.error(`- ${f.name}: ${f.details}`);
    }
    process.exit(1);
  } else {
    console.log('ALL EMPIRICAL ADVERSARIAL STRESS TESTS COMPLETED SUCCESSFULLY (100% PASS)!');
    process.exit(0);
  }
}

runAdversarialSuite().catch((e) => {
  console.error('Unhandled suite error:', e);
  restoreStore();
  process.exit(1);
});
