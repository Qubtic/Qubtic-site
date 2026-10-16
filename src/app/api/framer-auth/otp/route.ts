import { NextResponse } from 'next/server';
import {
  sendAuthOtpCode,
  verifyAuthOtpCode,
  createOrUpdateFramerUser,
  generateSessionCode,
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
      framerUserId,
      framerProjectId,
      plan = 'pro',
    } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'A valid email address is required.' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const pluginMeta = getPluginMetadata(plugin);

    if (action === 'send') {
      const result = await sendAuthOtpCode(email, pluginMeta.slug);
      return NextResponse.json(result, {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (action === 'verify') {
      if (!code || typeof code !== 'string') {
        return NextResponse.json(
          { success: false, message: 'A 6-digit verification code is required.' },
          { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }

      const verifyResult = await verifyAuthOtpCode(email, code);
      if (!verifyResult.valid) {
        return NextResponse.json(
          { success: false, message: verifyResult.message || 'Invalid or expired verification code.' },
          { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }

      // Successful OTP verification - establish authenticated session
      const { user, isNew, token } = await createOrUpdateFramerUser({
        email,
        name: name || email.split('@')[0],
        pluginSlug: pluginMeta.slug,
        framerUserId,
        framerProjectId,
        plan,
        metadata: {
          authMode: 'otp',
          verifiedAt: new Date().toISOString(),
          clientIp: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          authenticatedVia: 'Qubtic Auth Portal OTP',
        },
      });

      const sessionCode = generateSessionCode();

      return NextResponse.json(
        {
          success: true,
          message: 'Code verified successfully! Welcome to ' + pluginMeta.name,
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
