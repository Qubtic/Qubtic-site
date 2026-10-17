import nodemailer from 'nodemailer';
import {
  FRAMEDROP_ICON_BASE64,
  QUBEAUTH_ICON_BASE64,
} from './logoAssets';
import { getPluginMetadata } from './plugins-registry';

export const LOGO_CID = 'logo@qubtic.tech';

/**
 * Strips data URI header and returns raw Buffer for inline CID attachments
 */
function getIconBuffer(base64Data: string): Buffer {
  const clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(clean, 'base64');
}

/**
 * Returns dynamic attachment array for the specified plugin
 */
export function getPluginEmailAttachments(pluginSlug: string = 'frame-drop') {
  const isQubeAuth = pluginSlug === 'qube-auth';
  const iconBase64 = isQubeAuth ? QUBEAUTH_ICON_BASE64 : FRAMEDROP_ICON_BASE64;
  const filename = isQubeAuth ? 'qube-auth-logo.png' : 'framedrop-logo.png';

  return [
    {
      filename,
      content: getIconBuffer(iconBase64),
      cid: LOGO_CID,
      contentType: 'image/png',
      contentDisposition: 'inline' as const,
    },
  ];
}

/**
 * Configures and returns Nodemailer transporter using Mailgun SMTP
 */
export function getMailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.mailgun.org';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || 'hello@qubtic.tech';
  const envPass = process.env.SMTP_PASS?.trim();
  const rawPass =
    envPass && !envPass.startsWith('680842d7860d24c147412b9f0128d431')
      ? envPass
      : '9iEggBuT#Xq-Ca*';
  const pass = rawPass.replace(/^"|"$/g, '');

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Verifies live SMTP connectivity
 */
export async function verifySmtpConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = getMailTransporter();
    await transporter.verify();
    return {
      success: true,
      message: `SMTP connected successfully to ${process.env.SMTP_HOST || 'smtp.mailgun.org'}:${process.env.SMTP_PORT || '587'}`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown SMTP verification error';
    return { success: false, message: msg };
  }
}

/**
 * Returns sender display name and email
 */
export function getSender(pluginSlug: string = 'frame-drop'): string {
  const plugin = getPluginMetadata(pluginSlug);
  const fromEmail = process.env.SMTP_FROM_EMAIL || 'hello@qubtic.tech';
  return `"${plugin.name} by Qubtic" <${fromEmail}>`;
}

// -----------------------------------------------------------------------------
// 1. Account Verification / OTP Email Template
// -----------------------------------------------------------------------------
export function generateVerificationEmailHtml(
  code: string,
  recipientName?: string,
  pluginSlug: string = 'frame-drop',
  logoSrc: string = `cid:${LOGO_CID}`
): string {
  const plugin = getPluginMetadata(pluginSlug);
  const greeting = recipientName && recipientName.trim() ? `Hi ${recipientName.trim()},` : 'Hello,';
  const brandBarColor = '#164E33';
  const badgeColor = '#86EFAC';
  const accentBorder = plugin.slug === 'qube-auth' ? '#164E33' : '#164E33';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ${plugin.name} Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%; background-color: #F1F5F3; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container (520px) -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #FFFFFF; border: 1px solid #D1DDD6; border-radius: 18px; overflow: hidden; box-shadow: 0 16px 36px -10px rgba(22, 78, 51, 0.15);">
          
          <!-- BRAND TOP BAR (#164E33) -->
          <tr>
            <td style="background-color: ${brandBarColor}; padding: 18px 28px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" valign="middle">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="middle" style="padding-right: 12px; width: 36px;">
                          <img src="${logoSrc}" alt="${plugin.name}" width="36" height="36" style="display: block; width: 36px; height: 36px; border-radius: 9px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); border: 0; outline: none; text-decoration: none;" />
                        </td>
                        <td valign="middle">
                          <div style="font-size: 16px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.8px; line-height: 18px;">${plugin.name}</div>
                          <div style="font-size: 9px; font-weight: 700; color: ${badgeColor}; letter-spacing: 1.5px; text-transform: uppercase;">BY QUBTIC TECHNOLOGIES</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; padding: 4px 10px; background: rgba(255, 255, 255, 0.12); border-radius: 6px; font-size: 11px; font-weight: 600; color: #F0FDF4;">
                      SECURE SIGN-IN
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HERO CARD -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: center; background: linear-gradient(180deg, #EAF7F0 0%, #FFFFFF 100%); border-bottom: 1px solid #E2E8F0;">
              <div style="width: 52px; height: 52px; margin: 0 auto 16px auto; background: #DCFCE7; border: 2px solid ${accentBorder}; border-radius: 50%; text-align: center; line-height: 52px;">
                <span style="font-size: 24px; color: #164E33; line-height: 52px; display: inline-block;">⚡</span>
              </div>
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 800; color: #0F291C; letter-spacing: -0.4px;">
                Your Sign-In Verification Code
              </h1>
              <p style="margin: 0; font-size: 14px; line-height: 22px; color: #475569;">
                ${greeting} enter the 6-digit code below into your <strong>${plugin.name}</strong> authentication page to complete your login.
              </p>
            </td>
          </tr>

          <!-- OTP CODE BOX -->
          <tr>
            <td style="padding: 24px 32px;">
              <div style="background-color: #F8FAF9; border: 2px dashed ${accentBorder}; border-radius: 14px; padding: 22px 16px; text-align: center; margin-bottom: 20px;">
                <div style="font-family: 'SF Mono', Monaco, 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #164E33; display: inline-block; padding-left: 10px;">
                  ${code}
                </div>
                <div style="margin-top: 8px; font-size: 11px; font-weight: 600; color: #64748B; letter-spacing: 0.8px; text-transform: uppercase;">
                  Single-Use Passcode &bull; Valid for 10 Minutes
                </div>
              </div>

              <!-- NOTICE -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #EAF7F0; border-left: 4px solid #164E33; border-radius: 6px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 12px 14px;">
                    <p style="margin: 0; font-size: 12.5px; line-height: 19px; color: #164E33;">
                      ⏳ <strong>Time-Sensitive:</strong> For security reasons, this code will expire automatically in 10 minutes. Do not share this code with anyone.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; line-height: 18px; color: #64748B; text-align: center;">
                If you did not request this email, you can safely ignore it. Your account remains completely secure.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #164E33; padding: 20px 32px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #FFFFFF;">
                ${plugin.name} &bull; Native Framer Component Suite
              </p>
              <p style="margin: 0 0 6px 0; font-size: 11px; color: #86EFAC;">
                &copy; ${new Date().getFullYear()} Qubtic Technologies. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 10.5px; color: #A7F3D0;">
                <a href="https://qubtic.tech" style="color: #FFFFFF; text-decoration: underline;" target="_blank">qubtic.tech</a> &bull; Secure Authentication Service
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// -----------------------------------------------------------------------------
// 2. Password Reset Email Template
// -----------------------------------------------------------------------------
export function generatePasswordResetEmailHtml(
  code: string,
  recipientName?: string,
  pluginSlug: string = 'frame-drop',
  logoSrc: string = `cid:${LOGO_CID}`
): string {
  const plugin = getPluginMetadata(pluginSlug);
  const greeting = recipientName && recipientName.trim() ? `Hi ${recipientName.trim()},` : 'Hello,';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your ${plugin.name} Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%; background-color: #F1F5F3; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #FFFFFF; border: 1px solid #D1DDD6; border-radius: 18px; overflow: hidden; box-shadow: 0 16px 36px -10px rgba(22, 78, 51, 0.15);">
          
          <!-- BRAND TOP BAR (#164E33) -->
          <tr>
            <td style="background-color: #164E33; padding: 18px 28px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" valign="middle">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="middle" style="padding-right: 12px; width: 36px;">
                          <img src="${logoSrc}" alt="${plugin.name}" width="36" height="36" style="display: block; width: 36px; height: 36px; border-radius: 9px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); border: 0;" />
                        </td>
                        <td valign="middle">
                          <div style="font-size: 16px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.8px; line-height: 18px;">${plugin.name}</div>
                          <div style="font-size: 9px; font-weight: 700; color: #86EFAC; letter-spacing: 1.5px; text-transform: uppercase;">BY QUBTIC TECHNOLOGIES</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; padding: 4px 10px; background: rgba(255, 255, 255, 0.12); border-radius: 6px; font-size: 11px; font-weight: 600; color: #F0FDF4;">
                      PASSWORD RESET
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HERO CARD -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: center; background: linear-gradient(180deg, #EAF7F0 0%, #FFFFFF 100%); border-bottom: 1px solid #E2E8F0;">
              <div style="width: 52px; height: 52px; margin: 0 auto 16px auto; background: #DCFCE7; border: 2px solid #164E33; border-radius: 50%; text-align: center; line-height: 52px;">
                <span style="font-size: 24px; color: #164E33; line-height: 52px; display: inline-block;">🔒</span>
              </div>
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 800; color: #0F291C; letter-spacing: -0.4px;">
                Password Reset Request
              </h1>
              <p style="margin: 0; font-size: 14px; line-height: 22px; color: #475569;">
                ${greeting} we received a request to reset your password for <strong>${plugin.name}</strong>. Enter the 6-digit confirmation code below to choose a new password:
              </p>
            </td>
          </tr>

          <!-- RESET CODE BOX -->
          <tr>
            <td style="padding: 24px 32px;">
              <div style="background-color: #F8FAF9; border: 2px dashed #164E33; border-radius: 14px; padding: 22px 16px; text-align: center; margin-bottom: 20px;">
                <div style="font-family: 'SF Mono', Monaco, 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #164E33; display: inline-block; padding-left: 10px;">
                  ${code}
                </div>
                <div style="margin-top: 8px; font-size: 11px; font-weight: 600; color: #64748B; letter-spacing: 0.8px; text-transform: uppercase;">
                  Reset Authorization Code &bull; Valid for 15 Minutes
                </div>
              </div>

              <!-- NOTICE -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #EAF7F0; border-left: 4px solid #164E33; border-radius: 6px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 12px 14px;">
                    <p style="margin: 0; font-size: 12.5px; line-height: 19px; color: #164E33;">
                      ⏳ <strong>Time-Sensitive:</strong> This code is valid for 15 minutes. If you did not request a password reset, you can safely disregard this email.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; line-height: 18px; color: #64748B; text-align: center;">
                Need help? Contact support at <a href="mailto:hello@qubtic.tech" style="color: #164E33; font-weight: 600;">hello@qubtic.tech</a>
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #164E33; padding: 20px 32px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #FFFFFF;">
                ${plugin.name} &bull; Native Framer Component Suite
              </p>
              <p style="margin: 0 0 6px 0; font-size: 11px; color: #86EFAC;">
                &copy; ${new Date().getFullYear()} Qubtic Technologies. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 10.5px; color: #A7F3D0;">
                <a href="https://qubtic.tech" style="color: #FFFFFF; text-decoration: underline;" target="_blank">qubtic.tech</a> &bull; Secure Authentication Service
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// -----------------------------------------------------------------------------
// 3. Team Notification Email Template (Sent to Qubtic Team on New Sign Up)
// Executive modular card design based on reference layout (Nishar Multani / Basis card layout)
// -----------------------------------------------------------------------------
export function generateNewUserTeamNotificationEmailHtml(
  user: {
    id?: string;
    email: string;
    name?: string | null;
    company_name?: string | null;
    website_url?: string | null;
    plugin_name?: string | null;
    plugin_slug?: string | null;
    plan?: string | null;
    role?: string | null;
    created_at?: string | Date;
    createdAt?: string | Date;
  },
  meta?: {
    origin?: string;
    framerUserId?: string;
    framerSiteUrl?: string;
    authMode?: string;
    pairingCode?: string;
  },
  pluginSlug: string = 'frame-drop',
  logoSrc: string = `cid:${LOGO_CID}`
): string {
  const plugin = getPluginMetadata(user.plugin_slug || pluginSlug);
  const dateRaw = user.created_at || user.createdAt;
  const now = dateRaw ? new Date(dateRaw) : new Date();

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const formattedDate = now.toLocaleDateString('en-US', dateOptions);
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });

  const userName = user.name && user.name.trim() !== '' ? user.name.trim() : 'Not specified';
  const userEmail = user.email;
  const userId = user.id || 'Auto-assigned';
  const shortId = userId.length > 8 ? userId.substring(0, 8).toUpperCase() : userId.toUpperCase();
  const userRole = (user.role || 'user').toUpperCase();
  const planName = (user.plan || 'pro').toUpperCase();
  const companyName = user.company_name && user.company_name.trim() !== '' ? user.company_name.trim() : 'Not specified';
  const websiteUrl = user.website_url && user.website_url.trim() !== '' ? user.website_url.trim() : 'Not specified';
  const framerUserId = meta?.framerUserId && meta.framerUserId.trim() !== '' ? meta.framerUserId.trim() : 'usr_framer_studio';
  const framerSiteUrl = meta?.framerSiteUrl || meta?.origin || `https://framer.com/projects/${plugin.name}-Studio`;
  const authMode = meta?.authMode || 'Passwordless Web Auth';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Member Provisioned - Qubtic Team Notification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #EEF2F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%; background-color: #EEF2F0; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- 540px Executive Modular Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #FFFFFF; border: 1px solid #D1DDD6; border-radius: 18px; overflow: hidden; box-shadow: 0 18px 40px -12px rgba(22, 78, 51, 0.18);">
          
          <!-- 1. TOP BRAND HEADER BAR (#164E33) -->
          <tr>
            <td style="background-color: #164E33; padding: 18px 24px; border-bottom: 2px solid #0E3622;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <!-- Left: Qubtic 3D Brand Badge -->
                  <td align="left" valign="middle">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="middle" style="padding-right: 12px; width: 38px;">
                          <img src="${logoSrc}" alt="${plugin.name}" width="38" height="38" style="display: block; width: 38px; height: 38px; border-radius: 9px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35); border: 0;" />
                        </td>
                        <td valign="middle">
                          <div style="font-size: 16px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.8px; line-height: 18px;">${plugin.name}</div>
                          <div style="font-size: 9px; font-weight: 700; color: #86EFAC; letter-spacing: 1.5px; text-transform: uppercase;">QUBTIC TECHNOLOGIES HQ</div>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Right: Live Timestamp / Date -->
                  <td align="right" valign="middle">
                    <div style="font-size: 11px; font-weight: 600; color: #E2E8F0; letter-spacing: -0.2px;">
                      ${formattedDate}
                    </div>
                    <div style="font-size: 9.5px; color: #86EFAC; margin-top: 2px; font-family: monospace;">
                      ${formattedTime}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 2. HERO STATUS CARD -->
          <tr>
            <td style="padding: 28px 24px 24px 24px; background: linear-gradient(180deg, #EAF7F0 0%, #F5FBF7 100%); border-bottom: 1px solid #D5E5DC; text-align: center;">
              
              <!-- Circular Status Badge Icon -->
              <div style="width: 48px; height: 48px; margin: 0 auto 12px auto; background-color: #FFFFFF; border: 2px solid #164E33; border-radius: 50%; text-align: center; line-height: 48px; box-shadow: 0 6px 14px rgba(22, 78, 51, 0.12);">
                <span style="font-size: 22px; color: #164E33; line-height: 48px; display: inline-block;">✓</span>
              </div>

              <!-- Main Title -->
              <h1 style="margin: 0 0 6px 0; font-size: 21px; font-weight: 800; color: #0F291C; letter-spacing: -0.3px;">
                New Member Provisioned
              </h1>
              
              <!-- Subtitle -->
              <p style="margin: 0 0 18px 0; font-size: 13.5px; line-height: 20px; color: #475569; max-width: 420px; margin-left: auto; margin-right: auto;">
                A new user has successfully verified their identity via <strong>${authMode}</strong> and joined the <strong>${plugin.name}</strong> platform.
              </p>

              <!-- Action Bar (Two Side-by-Side Pills) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
                <tr>
                  <!-- Left Pill: User ID Reference -->
                  <td valign="middle" style="padding-right: 8px;">
                    <div style="padding: 8px 14px; background-color: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 11.5px; font-weight: 700; color: #334155; font-family: monospace;">
                      <span style="color: #164E33; font-weight: 800;">ID:</span> #${shortId}
                    </div>
                  </td>
                  <!-- Right Pill: 1-Click "Reply to Member" Button -->
                  <td valign="middle">
                    <a href="mailto:${userEmail}" style="display: inline-block; padding: 8px 16px; background-color: #164E33; color: #FFFFFF; font-size: 11.5px; font-weight: 700; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 10px rgba(22, 78, 51, 0.25);">
                      ✉ Reply to Member
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- 3. MAIN CONTENT BODY (Modular Cards) -->
          <tr>
            <td style="padding: 22px 24px;">

              <!-- SECTION 1: MEMBER REGISTRATION SUMMARY -->
              <div style="background-color: #F8FAF9; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px 18px; margin-bottom: 16px;">
                <div style="font-size: 10.5px; font-weight: 800; color: #164E33; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">
                  MEMBER PROFILE & IDENTITY
                </div>
                
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 6px 0; font-size: 12px; color: #64748B; font-weight: 500; width: 130px;">Full Name</td>
                    <td style="padding: 6px 0; font-size: 13px; color: #0F172A; font-weight: 700;">${userName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 12px; color: #64748B; font-weight: 500;">Email Address</td>
                    <td style="padding: 6px 0; font-size: 13px; color: #164E33; font-weight: 700; font-family: monospace;">${userEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 12px; color: #64748B; font-weight: 500;">Plugin Origin</td>
                    <td style="padding: 6px 0; font-size: 12px; color: #0F172A; font-weight: 700;">
                      <span style="display: inline-block; padding: 2px 7px; background-color: #F1F5F9; border: 1px solid #CBD5E1; border-radius: 4px;">
                        ${plugin.name} (${plugin.slug})
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 12px; color: #64748B; font-weight: 500;">Company Name</td>
                    <td style="padding: 6px 0; font-size: 12px; color: #334155;">${companyName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 12px; color: #64748B; font-weight: 500;">Website URL</td>
                    <td style="padding: 6px 0; font-size: 12px; color: #334155;">${websiteUrl}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 12px; color: #64748B; font-weight: 500;">Account UUID</td>
                    <td style="padding: 6px 0; font-size: 11.5px; color: #475569; font-family: monospace;">${userId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 12px; color: #64748B; font-weight: 500;">Framer User ID</td>
                    <td style="padding: 6px 0; font-size: 11.5px; color: #0F172A; font-weight: 600; font-family: monospace;">
                      <span style="display: inline-block; padding: 2px 7px; background-color: #F1F5F9; border: 1px solid #CBD5E1; border-radius: 4px;">
                        ${framerUserId}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 12px; color: #64748B; font-weight: 500;">Framer Project URL</td>
                    <td style="padding: 6px 0; font-size: 12px; color: #164E33; font-weight: 600; word-break: break-all;">
                      <a href="${framerSiteUrl}" style="color: #164E33; text-decoration: underline;" target="_blank">
                        ${framerSiteUrl}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 12px; color: #64748B; font-weight: 500;">Access Role & Tier</td>
                    <td style="padding: 6px 0; font-size: 12px;">
                      <span style="display: inline-block; padding: 2px 8px; background-color: #DCFCE7; border: 1px solid #86EFAC; border-radius: 4px; font-size: 10px; font-weight: 700; color: #164E33;">
                        ${userRole} &bull; ${plugin.name.toUpperCase()} ${planName} EARLY BIRD
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 12px; color: #64748B; font-weight: 500;">Auth Verification</td>
                    <td style="padding: 6px 0; font-size: 12px; color: #16A34A; font-weight: 600;">
                      ✓ ${authMode} (Verified)
                    </td>
                  </tr>
                </table>
              </div>

              <!-- SECTION 2: DIRECT OUTREACH STRIP -->
              <div style="background-color: #F8FAF9; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 16px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td width="24" valign="middle" style="padding-right: 8px;">
                      <span style="font-size: 16px; line-height: 20px;">💬</span>
                    </td>
                    <td valign="middle">
                      <span style="font-size: 11.5px; color: #475569;">
                        Need to assist this user? Click <strong>"Reply to Member"</strong> above or message them directly at <strong style="color: #164E33;">${userEmail}</strong>.
                      </span>
                    </td>
                  </tr>
                </table>
              </div>

            </td>
          </tr>

          <!-- 4. BOTTOM FOOTER BAR (#164E33) -->
          <tr>
            <td style="background-color: #164E33; padding: 22px 24px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              
              <!-- Quick Links -->
              <div style="margin-bottom: 10px;">
                <a href="https://qubtic.tech" style="color: #E2E8F0; text-decoration: none; font-size: 11px; font-weight: 700; margin: 0 8px; letter-spacing: 0.5px;" target="_blank">PORTAL</a>
                <span style="color: #86EFAC; font-size: 10px;">&bull;</span>
                <a href="mailto:hello@qubtic.tech" style="color: #E2E8F0; text-decoration: none; font-size: 11px; font-weight: 700; margin: 0 8px; letter-spacing: 0.5px;">SUPPORT</a>
                <span style="color: #86EFAC; font-size: 10px;">&bull;</span>
                <a href="https://qubtic.tech/privacy" style="color: #E2E8F0; text-decoration: none; font-size: 11px; font-weight: 700; margin: 0 8px; letter-spacing: 0.5px;" target="_blank">PRIVACY</a>
                <span style="color: #86EFAC; font-size: 10px;">&bull;</span>
                <a href="https://qubtic.tech/terms" style="color: #E2E8F0; text-decoration: none; font-size: 11px; font-weight: 700; margin: 0 8px; letter-spacing: 0.5px;" target="_blank">TERMS</a>
              </div>

              <!-- Copyright & Brand Lockup -->
              <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: #FFFFFF;">
                Qubtic Technologies &bull; ${plugin.name} Pro Platform
              </p>
              <p style="margin: 0; font-size: 10px; color: #86EFAC;">
                &copy; ${now.getFullYear()} Qubtic Technologies. All rights reserved. Automated Team Notification.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// -----------------------------------------------------------------------------
// 4. Team Member Invitation Email Template
// -----------------------------------------------------------------------------
export function generateTeamInviteEmailHtml(
  inviteeEmail: string,
  inviterName: string = 'Team Administrator',
  teamName: string = 'Workspace',
  pluginSlug: string = 'frame-drop',
  inviteLink: string = 'https://qubtic.tech/auth',
  role: string = 'Editor',
  logoSrc: string = `cid:${LOGO_CID}`
): string {
  const plugin = getPluginMetadata(pluginSlug);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to Join ${teamName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%; background-color: #F1F5F3; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #FFFFFF; border: 1px solid #D1DDD6; border-radius: 18px; overflow: hidden; box-shadow: 0 16px 36px -10px rgba(22, 78, 51, 0.15);">
          
          <!-- TOP BAR -->
          <tr>
            <td style="background-color: #164E33; padding: 18px 28px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" valign="middle">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="middle" style="padding-right: 12px; width: 36px;">
                          <img src="${logoSrc}" alt="${plugin.name}" width="36" height="36" style="display: block; width: 36px; height: 36px; border-radius: 9px;" />
                        </td>
                        <td valign="middle">
                          <div style="font-size: 16px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.8px; line-height: 18px;">${plugin.name}</div>
                          <div style="font-size: 9px; font-weight: 700; color: #86EFAC; letter-spacing: 1.5px; text-transform: uppercase;">TEAM INVITATION</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; padding: 4px 10px; background: rgba(255, 255, 255, 0.12); border-radius: 6px; font-size: 11px; font-weight: 600; color: #F0FDF4;">
                      COLLABORATION
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HERO -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: center; background: linear-gradient(180deg, #EAF7F0 0%, #FFFFFF 100%); border-bottom: 1px solid #E2E8F0;">
              <div style="width: 52px; height: 52px; margin: 0 auto 16px auto; background: #DCFCE7; border: 2px solid #164E33; border-radius: 50%; text-align: center; line-height: 52px;">
                <span style="font-size: 24px; color: #164E33; line-height: 52px; display: inline-block;">👥</span>
              </div>
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 800; color: #0F291C; letter-spacing: -0.4px;">
                You've Been Invited to Join ${teamName}
              </h1>
              <p style="margin: 0; font-size: 14px; line-height: 22px; color: #475569;">
                <strong>${inviterName}</strong> has invited you to collaborate on <strong>${plugin.name}</strong> as a team <strong>${role}</strong>.
              </p>
            </td>
          </tr>

          <!-- CTA BUTTON -->
          <tr>
            <td style="padding: 28px 32px; text-align: center;">
              <div style="margin-bottom: 24px;">
                <a href="${inviteLink}" style="display: inline-block; padding: 14px 32px; background-color: #164E33; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; box-shadow: 0 6px 18px rgba(22, 78, 51, 0.3);">
                  Accept Invitation &bull; Join ${teamName}
                </a>
              </div>
              <p style="margin: 0; font-size: 12px; color: #64748B;">
                This invitation is assigned to <strong>${inviteeEmail}</strong>. If you did not expect this invitation, you can ignore this email.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #164E33; padding: 20px 32px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: #FFFFFF;">
                Qubtic Technologies &bull; ${plugin.name} Platform
              </p>
              <p style="margin: 0; font-size: 10px; color: #86EFAC;">
                &copy; ${new Date().getFullYear()} Qubtic Technologies. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// -----------------------------------------------------------------------------
// Dispatch Methods
// -----------------------------------------------------------------------------

/**
 * Sends a 6-digit verification / OTP email with inline brand logo
 */
export async function sendVerificationEmail(
  to: string,
  code: string,
  name?: string,
  pluginSlug: string = 'frame-drop'
): Promise<{ messageId: string }> {
  const plugin = getPluginMetadata(pluginSlug);
  const transporter = getMailTransporter();
  const html = generateVerificationEmailHtml(code, name, plugin.slug);
  const attachments = getPluginEmailAttachments(plugin.slug);
  const from = getSender(plugin.slug);

  const info = await transporter.sendMail({
    from,
    to,
    subject: `Your ${plugin.name} Verification Code: ${code} (Qubtic)`,
    text: `Your ${plugin.name} (by Qubtic) verification code is ${code}. It expires in 10 minutes.`,
    html,
    attachments,
  });

  return { messageId: info.messageId };
}

/**
 * Sends a 6-digit password reset email with inline brand logo
 */
export async function sendPasswordResetEmail(
  to: string,
  code: string,
  name?: string,
  pluginSlug: string = 'frame-drop'
): Promise<{ messageId: string }> {
  const plugin = getPluginMetadata(pluginSlug);
  const transporter = getMailTransporter();
  const html = generatePasswordResetEmailHtml(code, name, plugin.slug);
  const attachments = getPluginEmailAttachments(plugin.slug);
  const from = getSender(plugin.slug);

  const info = await transporter.sendMail({
    from,
    to,
    subject: `Your ${plugin.name} Password Reset Code: ${code} (Qubtic)`,
    text: `Your ${plugin.name} (by Qubtic) password reset code is ${code}. It expires in 15 minutes.`,
    html,
    attachments,
  });

  return { messageId: info.messageId };
}

/**
 * Dispatches automated new user team notification to Qubtic team
 */
export async function sendNewUserTeamNotification(
  user: {
    id?: string;
    email: string;
    name?: string | null;
    company_name?: string | null;
    website_url?: string | null;
    plugin_name?: string | null;
    plugin_slug?: string | null;
    plan?: string | null;
    role?: string | null;
    created_at?: string | Date;
    createdAt?: string | Date;
  },
  meta?: {
    origin?: string;
    framerUserId?: string;
    framerSiteUrl?: string;
    authMode?: string;
    pairingCode?: string;
  },
  pluginSlug: string = 'frame-drop'
): Promise<{ messageId: string }> {
  const plugin = getPluginMetadata(user.plugin_slug || pluginSlug);
  const transporter = getMailTransporter();
  const html = generateNewUserTeamNotificationEmailHtml(user, meta, plugin.slug);
  const attachments = getPluginEmailAttachments(plugin.slug);
  const from = getSender(plugin.slug);
  const targetEmail = process.env.TEAM_NOTIFICATION_EMAIL || 'hello@qubtic.tech';

  const info = await transporter.sendMail({
    from,
    to: targetEmail,
    subject: `🚀 New Member: ${user.name || user.email} via ${plugin.name} | Qubtic Team Alert`,
    text: `New member registered on ${plugin.name} (Qubtic)!\nEmail: ${user.email}\nName: ${user.name || 'N/A'}\nPlugin: ${plugin.name} (${plugin.slug})\nID: ${user.id || 'N/A'}\nCreated: ${user.created_at || user.createdAt || new Date().toISOString()}\nTeam alert sent to: ${targetEmail}`,
    html,
    attachments,
  });

  return { messageId: info.messageId };
}

/**
 * Sends a team member invitation email
 */
export async function sendTeamInviteEmail(
  to: string,
  inviterName: string = 'Team Administrator',
  teamName: string = 'Workspace',
  pluginSlug: string = 'frame-drop',
  inviteLink: string = 'https://qubtic.tech/auth',
  role: string = 'Editor'
): Promise<{ messageId: string }> {
  const plugin = getPluginMetadata(pluginSlug);
  const transporter = getMailTransporter();
  const html = generateTeamInviteEmailHtml(to, inviterName, teamName, plugin.slug, inviteLink, role);
  const attachments = getPluginEmailAttachments(plugin.slug);
  const from = getSender(plugin.slug);

  const info = await transporter.sendMail({
    from,
    to,
    subject: `You've been invited to join ${teamName} on ${plugin.name}`,
    text: `${inviterName} has invited you to join ${teamName} on ${plugin.name} as ${role}. Accept your invitation here: ${inviteLink}`,
    html,
    attachments,
  });

  return { messageId: info.messageId };
}
