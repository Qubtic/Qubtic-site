import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { settings, isSampleOrder } = body;

    const rawMerchant = (settings?.merchantEmail || '').trim();
    const primaryMerchant = rawMerchant || process.env.CONTACT_RECEIVER_EMAIL || 'hello@qubtic.tech';
    const testRecipients: string[] = [primaryMerchant];
    if (primaryMerchant.includes('@qubtic.tech') || primaryMerchant === 'hello@qubtic.tech') {
      if (process.env.CONTACT_RECEIVER_EMAIL && !testRecipients.includes(process.env.CONTACT_RECEIVER_EMAIL)) {
        testRecipients.push(process.env.CONTACT_RECEIVER_EMAIL);
      }
      if (process.env.CONTACT_FORWARD_EMAIL && !testRecipients.includes(process.env.CONTACT_FORWARD_EMAIL)) {
        testRecipients.push(process.env.CONTACT_FORWARD_EMAIL);
      }
    }
    const merchantEmail = primaryMerchant;
    const host = settings?.smtpHost || process.env.SMTP_HOST || 'smtp.mailgun.org';
    const port = Number(settings?.smtpPort) || parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = settings?.smtpSecure ?? (process.env.SMTP_SECURE === 'true' || port === 465);

    const rawUser = settings?.smtpUser || process.env.SMTP_USER || '';
    const user = rawUser.trim().replace(/^["']|["']$/g, '');
    const rawPass = settings?.smtpPass || process.env.SMTP_PASS || '';
    const pass = rawPass.trim().replace(/^["']|["']$/g, '');

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
      tls: {
        rejectUnauthorized: false,
      },
    });

    const storeName = settings?.business || 'Email Commerce';
    const currency = settings?.currency || 'USD';
    const fromSenderName = settings?.fromName || storeName;
    let fromSenderEmail = 'hello@qubtic.tech';
    if (!host.includes('mailgun') && settings?.fromEmail && !settings.fromEmail.includes('@gmail.com') && !settings.fromEmail.includes('@yahoo.com')) {
      fromSenderEmail = settings.fromEmail;
    } else if (user && user.includes('@') && !user.includes('@gmail.com')) {
      fromSenderEmail = user;
    }
    const formattedFrom = `"${fromSenderName}" <${fromSenderEmail}>`;

    const sampleOrderNum = Math.floor(100000 + Math.random() * 900000);

    const subject = isSampleOrder
      ? `[Sample Order #${sampleOrderNum}] Test Order from Jane Doe ($68.00 ${currency})`
      : `[Test Email] Email Commerce SMTP Connection Verified`;

    const html = isSampleOrder
      ? `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
            <tr>
              <td style="padding: 24px; background: #0f172a; color: #ffffff;">
                <h1 style="margin: 0; font-size: 20px; font-weight: 700;">${storeName}</h1>
                <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Automated Sample Order &bull; #${sampleOrderNum}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px;">
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px;">
                  <p style="margin: 0; font-size: 14px; color: #166534; font-weight: 600;">
                    &#10003; Automated SMTP Delivery Successful!
                  </p>
                  <p style="margin: 4px 0 0; font-size: 13px; color: #15803d;">
                    This is an automated test order dispatched directly to your merchant mailbox via ${host}:${port}.
                  </p>
                </div>

                <h3 style="margin: 0 0 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569;">Customer & Lead Info</h3>
                <table width="100%" style="font-size: 13px; color: #334155; margin-bottom: 16px;">
                  <tr><td style="padding: 4px 0; width: 140px; font-weight: 600;">Customer Name:</td><td>Jane Doe</td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 600;">Email:</td><td><a href="mailto:buyer@example.com" style="color: #2563eb;">buyer@example.com</a></td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 600;">Phone / WhatsApp:</td><td>+1 (555) 019-2834</td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 600;">Contact Channel:</td><td><span style="display:inline-block; padding:2px 8px; background:#dcfce7; color:#15803d; border-radius:4px; font-weight:600;">🟢 WhatsApp / Call</span></td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 600;">Fulfillment:</td><td><span style="display:inline-block; padding:2px 8px; background:#f1f5f9; color:#334155; border-radius:4px; font-weight:600;">📦 Physical Delivery</span></td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 600;">Payment System:</td><td><strong>Cash on Delivery (COD)</strong></td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 600;">Address:</td><td>742 Evergreen Terrace, Springfield</td></tr>
                </table>

                <h3 style="margin: 20px 0 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569;">Sample Order Items</h3>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                  <thead>
                    <tr style="background: #f1f5f9; text-align: left;">
                      <th style="padding: 8px 12px; font-size: 12px; color: #475569;">Item</th>
                      <th style="padding: 8px 12px; font-size: 12px; color: #475569; text-align: center;">Qty</th>
                      <th style="padding: 8px 12px; font-size: 12px; color: #475569; text-align: right;">Price</th>
                      <th style="padding: 8px 12px; font-size: 12px; color: #475569; text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">
                        <strong>Amber Dusk</strong><br/>
                        <span style="font-size: 12px; color: #64748b;">SKU: DEMO-PERF-001 &bull; 50ml Eau de Parfum</span>
                      </td>
                      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: center; color: #1e293b;">
                        1
                      </td>
                      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: right; color: #1e293b;">
                        $68.00
                      </td>
                      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: right; font-weight: 600; color: #0f172a;">
                        $68.00
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3" style="padding: 14px 12px; font-size: 14px; font-weight: 700; text-align: right; color: #0f172a;">Subtotal:</td>
                      <td style="padding: 14px 12px; font-size: 15px; font-weight: 700; text-align: right; color: #0f172a;">$68.00 ${currency}</td>
                    </tr>
                  </tfoot>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
                Sent automatically via Email Commerce &bull; Qubtic SMTP Gateway
              </td>
            </tr>
          </table>
        </div>
      `
      : `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
            <tr>
              <td style="padding: 24px; background: #0f172a; color: #ffffff;">
                <h1 style="margin: 0; font-size: 20px; font-weight: 700;">Email Commerce &bull; SMTP Test</h1>
                <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Automated connection test</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px;">
                <p style="font-size: 15px; color: #16a34a; font-weight: 600; margin-top: 0;">
                  &#10003; Your SMTP settings are working perfectly!
                </p>
                <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                  This test email confirms that your outgoing mail server is properly connected and authorized to dispatch live storefront orders automatically.
                </p>
                <table width="100%" style="font-size: 13px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-top: 16px;">
                  <tr><td style="font-weight: 600; padding: 4px 0;">SMTP Host:</td><td>${host}:${port}</td></tr>
                  <tr><td style="font-weight: 600; padding: 4px 0;">Username:</td><td>${user || '(default)'}</td></tr>
                  <tr><td style="font-weight: 600; padding: 4px 0;">Merchant Recipient:</td><td>${merchantEmail}</td></tr>
                  <tr><td style="font-weight: 600; padding: 4px 0;">Store Name:</td><td>${storeName}</td></tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
                Sent via Email Commerce &bull; Qubtic
              </td>
            </tr>
          </table>
        </div>
      `;

    await transporter.sendMail({
      from: formattedFrom,
      to: testRecipients.join(', '),
      subject,
      html,
    });

    return NextResponse.json(
      {
        success: true,
        message: `✓ Test email sent successfully to ${merchantEmail}! Please check your inbox.`,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error in test-smtp:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to send test email through SMTP server.',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
