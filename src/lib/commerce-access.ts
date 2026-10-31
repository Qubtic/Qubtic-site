import 'server-only';
import { paidAccess } from './billing/core';
import { initiatePairingSession, resolvePairingSession, verifyFramerSessionToken, revokeCommerceSession, getPairingSession } from './framer-auth';

const PRODUCT = 'whatsapp-commerce';
const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Framer-Site-Id', 'Cache-Control': 'no-store' };
function reply(body: unknown, status = 200) { return Response.json(body, { status, headers }); }
function bearer(request: Request) { return request.headers.get('authorization')?.match(/^Bearer ([^\s]+)$/i)?.[1] || ''; }

/** Compatibility transport for the plugin. Qubtic Auth owns accounts, email verification, and pairing. */
export async function commerceRequest(request: Request, action: string) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  try {
    const body = request.method === 'POST' ? await request.json().catch(() => null) : {};
    if (!body || typeof body !== 'object' || Array.isArray(body)) return reply({ error: 'Invalid request.' }, 400);
    if (action === 'pair' && request.method === 'POST') {
      if (body.action === 'initiate') {
        return reply(await initiatePairingSession({ pluginSlug: PRODUCT, pluginName: 'WhatsApp Commerce', ttlSeconds: 600 }));
      }
      if (body.action === 'resolve' && typeof body.device_code === 'string' && /^[a-f0-9]{64}$/.test(body.device_code)) {
        const session = await getPairingSession(body.device_code);
        if (!session || session.plugin_slug !== PRODUCT) return reply({ error: 'Invalid connection code.' }, 400);
        const result = await resolvePairingSession(body.device_code);
        if (result.status === 410) return reply({ status: 'expired' });
        if (!result.success) return reply({ error: 'Connection could not be checked.' }, typeof result.status === 'number' ? result.status : 400);
        return reply({ status: result.status === 'authorization_pending' ? 'pending' : result.status, ...(result.status === 'success' ? { token: result.auth_token } : {}) });
      }
      return reply({ error: 'Connect through the Qubtic Auth portal.' }, 400);
    }
    if (action === 'auth') return reply({ error: 'Use the Qubtic Auth signup and sign-in portal for WhatsApp Commerce.' }, 410);
    if (action === 'access' && ['GET', 'POST'].includes(request.method)) {
      const user = await verifyFramerSessionToken(bearer(request), PRODUCT);
      if (!user || user.plugin_slug !== PRODUCT || user.status !== 'active' || user.metadata?.email_verified !== true) return reply({ error: 'Sign in to WhatsApp Commerce first.' }, 401);
      const isPro=await paidAccess(user.id,PRODUCT,request.headers.get('x-framer-site-id'));
      return reply({ authenticated: true, product: PRODUCT, email: user.email, name: user.name, company_name: user.company_name, website_url: user.website_url, plan: isPro ? 'pro' : 'free', is_pro: isPro });
    }
    if (action === 'signout' && request.method === 'POST') {
      await revokeCommerceSession(bearer(request));
      return reply({ success: true });
    }
    return reply({ error: 'Not found.' }, 404);
  } catch {
    // Do not log private device codes, email codes, or bearer tokens.
    return reply({ error: 'Account service is unavailable. Please try again shortly.' }, 503);
  }
}
