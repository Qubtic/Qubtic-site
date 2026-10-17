import { NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  sendAuthOtpCode,
  verifyAuthOtpCode,
  createOrUpdateFramerUser,
  findFramerUser,
  generateSessionCode,
  confirmPairingSession,
} from '@/lib/framer-auth';
import { getPluginMetadata } from '@/lib/plugins-registry';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-framer-token, x-plugin-slug',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action = 'send',
      email,
      code,
      plugin = 'frame-drop',
      name,
      password,
      company_name,
      companyName,
      website_url,
      websiteUrl,
      pairing_code,
      pairingCode,
      framerUserId,
      framerProjectId,
      plan = 'pro',
      mode,
    } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'A valid email address is required.' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const pluginMeta = getPluginMetadata(plugin);

    if (action === 'send') {
      // Check if user already exists when initiating registration OTP
      if (mode === 'signup') {
        const existing = await findFramerUser(email, pluginMeta.slug);
        if (existing && existing.status === 'active' && existing.metadata?.password_hash) {
          return NextResponse.json(
            {
              success: false,
              alreadyExists: true,
              message: 'An account with this email already exists. Please sign in instead.',
            },
            { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
          );
        }
      }

      const result = await sendAuthOtpCode(email, pluginMeta.slug);
      return NextResponse.json(result, {
        status: result.success ? 200 : 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (action === 'verify' || action === 'verify-signup') {
      if (!code || typeof code !== 'string') {
        return NextResponse.json(
          { success: false, message: 'A 6-digit verification code is required.' },
          { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }

      const verifyResult = await verifyAuthOtpCode(email, code, pluginMeta.slug);
      if (!verifyResult.valid) {
        return NextResponse.json(
          { success: false, message: verifyResult.message || 'Invalid or expired verification code.' },
          { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }

      const rawCompany = company_name || companyName || '';
      const resolvedCompany =
        typeof rawCompany === 'string' && rawCompany.trim().length > 0 ? rawCompany.trim() : undefined;

      const rawWebsite = website_url || websiteUrl || '';
      const resolvedWebsite =
        typeof rawWebsite === 'string' && rawWebsite.trim().length > 0 ? rawWebsite.trim() : undefined;

      // Hash password if provided during signup registration
      let passwordHash: string | undefined = undefined;
      if (typeof password === 'string' && password.length > 0) {
        passwordHash = crypto.createHash('sha256').update(password).digest('hex');
      }

      // Successful OTP verification - establish authenticated session
      const isSignupFlow = mode === 'signup' || action === 'verify-signup';
      const { user, isNew, token } = await createOrUpdateFramerUser({
        email,
        name: name || email.split('@')[0],
        company_name: resolvedCompany,
        website_url: resolvedWebsite,
        pluginSlug: pluginMeta.slug,
        framerUserId,
        framerProjectId,
        plan,
        metadata: {
          authMode: isSignupFlow ? 'signup_otp' : 'otp',
          email_verified: true,
          verifiedAt: new Date().toISOString(),
          ...(passwordHash ? { password_hash: passwordHash } : {}),
          ...(resolvedCompany ? { company_name: resolvedCompany } : {}),
          ...(resolvedWebsite ? { website_url: resolvedWebsite } : {}),
          clientIp: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          authenticatedVia: isSignupFlow
            ? 'Qubtic Auth Portal Signup Email Verification'
            : 'Qubtic Auth Portal OTP',
        },
      });

      // Automatically confirm pairing session if code is provided
      const rawPairCode =
        pairing_code || pairingCode || body.user_code || body.userCode || body.pairing_session_code;
      if (rawPairCode && typeof rawPairCode === 'string' && rawPairCode.trim().length > 0) {
        try {
          await confirmPairingSession(rawPairCode.trim().toUpperCase(), user);
        } catch (pairErr) {
          console.warn('[OTP Auth] Pairing auto-confirm error:', pairErr);
        }
      }

      const sessionCode = generateSessionCode();

      return NextResponse.json(
        {
          success: true,
          message: isSignupFlow
            ? `Email verified successfully! Welcome to ${pluginMeta.name}.`
            : `Code verified successfully! Welcome to ${pluginMeta.name}`,
          token,
          sessionCode,
          isNew,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            company_name: user.company_name,
            website_url: user.website_url,
            plan: user.plan,
            plugin_slug: user.plugin_slug,
            plugin_name: user.plugin_name,
            status: user.status,
            created_at: user.created_at,
            last_login_at: user.last_login_at,
          },
          plugin: {
            slug: pluginMeta.slug,
            name: pluginMeta.name,
            version: pluginMeta.version,
          },
        },
        { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action specified. Must be "send" or "verify".' },
      { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    console.error('Error in OTP auth route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error processing OTP request.' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
