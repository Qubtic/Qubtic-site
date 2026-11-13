import { ensureEmailCommerceAccess } from '@/lib/email-commerce/access';
import { actor, billingRequest, limit } from '@/lib/billing/core';
import { mailAddress, smtpTransport } from '@/lib/email-commerce/smtp';
const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Framer-Site-Id, X-Billing-Environment', 'Cache-Control': 'no-store' };
export function OPTIONS() { return new Response(null, { status: 204, headers }); }
export function POST(request: Request) { return billingRequest(request, async () => {
  try {
    const user = await actor(request);
    const site = request.headers.get('x-framer-site-id');
    if (user.plugin !== 'whatsapp-commerce' || !site || !await ensureEmailCommerceAccess(user.id, site)) return Response.json({ success: false, message: 'Email Commerce Pro is required for this site.' }, { status: 403, headers });
    await limit(`email-test:${user.id}`, 3, 60);
    const raw = await request.text();
    if (raw.length > 20000) throw new Error('SMTP configuration is too large.');
    const { settings, isSampleOrder } = JSON.parse(raw);
    const to = mailAddress(settings.merchantEmail);
    const from = mailAddress(settings.fromEmail || settings.smtpUser || to);
    const transport = await smtpTransport(settings);
    try {
      await transport.verify();
      // Verify SMTP authentication first. Only the explicit test-email action dispatches mail.
      if (isSampleOrder) {
        const result = await transport.sendMail({ from, to, subject: 'Email Commerce — SMTP test', text: 'Your Email Commerce SMTP connection accepted this test email. No order or payment was created.' });
        if (!result.accepted?.length) throw new Error('The SMTP server did not accept the test email.');
      }
      return Response.json({ success: true, message: isSampleOrder ? 'Test email accepted by your SMTP server. Check the merchant inbox.' : 'SMTP authentication and TLS connection verified. No email was sent.' }, { headers });
    } finally { transport.close(); }
  } catch { return Response.json({ success: false, message: 'SMTP verification failed. Check the hostname, port, credentials and sender address.' }, { status: 400, headers }); }
}); }
