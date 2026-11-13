import { ensureEmailCommerceAccess } from '@/lib/email-commerce/access';
import { actor, billingRequest, environment, limit, database } from '@/lib/billing/core';
import { sealStore } from '@/lib/email-commerce/config.mjs';
import { mailAddress, smtpTransport } from '@/lib/email-commerce/smtp';

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Framer-Site-Id, X-Billing-Environment', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Cache-Control': 'no-store' };
export function OPTIONS() { return new Response(null, { status: 204, headers }); }
export function POST(request: Request) { return billingRequest(request, async () => {
  try {
    const user = await actor(request);
    const site = request.headers.get('x-framer-site-id');
    if (user.plugin !== 'whatsapp-commerce' || !site || !await ensureEmailCommerceAccess(user.id, site)) return Response.json({ error: 'Email Commerce Pro is required for this site.' }, { status: 403, headers });
    await limit(`email-config:${user.id}`, 10);
    const raw = await request.text();
    if (raw.length > 2000000) throw new Error('Store configuration is too large.');
    const { settings, products } = JSON.parse(raw);
    if (!Array.isArray(products) || !products.length || products.length > 2000) throw new Error('Choose between 1 and 2,000 products.');
    const merchantEmail = mailAddress(settings.merchantEmail);
    const fromEmail = mailAddress(settings.fromEmail || settings.smtpUser || merchantEmail);
    // Validate the transport before publishing; verification does not send a message.
    const transport = await smtpTransport(settings);
    try { await transport.verify(); } finally { transport.close(); }
    const token = sealStore({ userId: user.id, site, environment: environment(), products,
      settings: { business: String(settings.business || 'Store').slice(0, 120), merchantEmail, fromEmail, fromName: String(settings.fromName || settings.business || 'Store').slice(0, 120), customerReceipt: settings.customerReceipt === true, smtpHost: settings.smtpHost, smtpPort: settings.smtpPort, smtpUser: settings.smtpUser, smtpPass: settings.smtpPass } }, process.env.EMAIL_COMMERCE_SECRET);
    return Response.json({ token }, { headers });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : 'Could not configure email ordering.' }, { status: 400, headers }); }
}); }

/** Public readiness check never exposes SMTP credentials, encryption keys or customer data. */
export async function GET() {
  try {
    if (!process.env.EMAIL_COMMERCE_SECRET || process.env.EMAIL_COMMERCE_SECRET.length < 32) throw new Error('Not configured');
    const { data, error } = await database().storage.getBucket('email-commerce-orders');
    if (error || !data || data.public) throw new Error('Not configured');
    return Response.json({ service: 'email-commerce', version: 2, ready: true }, { headers });
  } catch { return Response.json({ service: 'email-commerce', version: 2, ready: false }, { status: 503, headers }); }
}
