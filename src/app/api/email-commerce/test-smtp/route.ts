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
    const { settings } = body;

    const merchantEmail = (settings?.merchantEmail || process.env.CONTACT_RECEIVER_EMAIL || 'hello@qubtic.tech').trim();
    const host = settings?.smtpHost || process.env.SMTP_HOST || 'smtp.mailgun.org';
    const port = Number(settings?.smtpPort) || parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = settings?.smtpSecure ?? (process.env.SMTP_SECURE === 'true' || port === 465);
    const user = settings?.smtpUser || process.env.SMTP_USER || '';
    const pass = settings?.smtpPass || process.env.SMTP_PASS || '';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
      tls: {
        rejectUnauthorized: false,
      },
    });

    const fromSenderName = settings?.fromName || settings?.business || 'Email Commerce';
    const fromSenderEmail = settings?.fromEmail || user || 'orders@qubtic.tech';
    const formattedFrom = `"${fromSenderName}" <${fromSenderEmail}>`;

    const mailOptions = {
      from: formattedFrom,
      to: merchantEmail,
      subject: `[Test Email] Email Commerce SMTP Connection Verified`,
      html: `
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
                  <tr><td style="font-weight: 600; padding: 4px 0;">Username:</td><td>${user}</td></tr>
                  <tr><td style="font-weight: 600; padding: 4px 0;">Merchant Recipient:</td><td>${merchantEmail}</td></tr>
                  <tr><td style="font-weight: 600; padding: 4px 0;">Store Name:</td><td>${settings?.business || 'Your Store'}</td></tr>
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
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      {
        success: true,
        message: `Test email sent successfully! Please check your inbox at ${merchantEmail}.`,
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
