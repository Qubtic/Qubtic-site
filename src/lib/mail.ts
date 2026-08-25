import nodemailer from 'nodemailer';

export interface SendContactEmailParams {
  name: string;
  email: string;
  company?: string;
  service: string;
  budget: string;
  message: string;
}

const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.mailgun.org';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    // Useful for Mailgun SMTP on port 587
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export async function sendContactEmail(params: SendContactEmailParams) {
  const transporter = getTransporter();
  const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || 'hello@qubtic.tech';
  const fromEmail = process.env.SMTP_FROM_EMAIL || 'hello@qubtic.tech';
  const fromName = process.env.SMTP_FROM_NAME || 'Qubtic Studio';

  const formattedFrom = `"${fromName}" <${fromEmail}>`;

  // 1. Email to Qubtic Team
  const adminMailOptions = {
    from: formattedFrom,
    to: receiverEmail,
    replyTo: `"${params.name}" <${params.email}>`,
    subject: `[New Inquiry] ${params.service} - ${params.name} (${params.budget})`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f8f6f0; padding: 24px; color: #141915;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e5e0d8;">
          <h2 style="color: #0c3823; margin-top: 0; font-size: 22px;">New Project Inquiry</h2>
          <p style="font-size: 14px; color: #666c64;">You have received a new contact request from the Qubtic website.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; font-weight: bold; width: 140px; background: #f0ede5; border-bottom: 1px solid #e5e0d8;">Sender Name</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e0d8;">${params.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; background: #f0ede5; border-bottom: 1px solid #e5e0d8;">Email</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e0d8;"><a href="mailto:${params.email}">${params.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; background: #f0ede5; border-bottom: 1px solid #e5e0d8;">Company</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e0d8;">${params.company || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; background: #f0ede5; border-bottom: 1px solid #e5e0d8;">Service Requested</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e0d8; font-weight: bold; color: #0c3823;">${params.service}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; background: #f0ede5; border-bottom: 1px solid #e5e0d8;">Estimated Budget</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e0d8;">${params.budget}</td>
            </tr>
          </table>

          <div style="margin-top: 24px; padding: 16px; background: #f8f7f2; border-left: 4px solid #0c3823; border-radius: 4px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #0c3823;">Project Overview & Goals</h3>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${params.message}</p>
          </div>

          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e0d8; text-align: center; font-size: 12px; color: #666c64;">
            Qubtic Digital Product Studio &bull; Sent via Mailgun SMTP
          </div>
        </div>
      </div>
    `,
  };

  // 2. Auto-Confirmation Email to Client
  const clientConfirmationMailOptions = {
    from: formattedFrom,
    to: params.email,
    subject: `We've received your request! - Qubtic Studio`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f8f6f0; padding: 24px; color: #141915;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e5e0d8;">
          <h2 style="color: #0c3823; margin-top: 0; font-size: 22px;">Thank You for Contacting Qubtic</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #141915;">Hi ${params.name},</p>
          <p style="font-size: 14px; line-height: 1.6; color: #666c64;">
            We have successfully received your project inquiry regarding <strong>${params.service}</strong>. Our engineering leadership team will review your requirements and get back to you within <strong>24 business hours</strong> with a clear scoping roadmap.
          </p>
          
          <div style="margin: 24px 0; padding: 16px; background: #f0ede5; border-radius: 12px; font-size: 13px; color: #0c3823;">
            <strong>Need instant feedback?</strong> Reply directly to this email or reach us at <a href="mailto:hello@qubtic.tech" style="color: #0c3823; font-weight: bold;">hello@qubtic.tech</a>.
          </div>

          <p style="font-size: 14px; color: #141915; margin-bottom: 4px;">Best regards,</p>
          <p style="font-size: 14px; font-weight: bold; color: #0c3823; margin-top: 0;">The Qubtic Engineering Team</p>
        </div>
      </div>
    `,
  };

  // Execute mailings safely
  try {
    const adminResult = await transporter.sendMail(adminMailOptions);
    
    // Try sending confirmation email (don't fail main flow if user email bounces)
    try {
      await transporter.sendMail(clientConfirmationMailOptions);
    } catch (err) {
      console.warn('Failed sending confirmation email to user:', err);
    }

    return adminResult;
  } catch (error) {
    console.warn('[Mail Warning] Direct SMTP delivery unavailable or failed:', error);
    return null;
  }
}
