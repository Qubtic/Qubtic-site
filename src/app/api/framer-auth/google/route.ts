import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPluginMetadata } from '@/lib/plugins-registry';
import { sanitizeRedirectUrl } from '@/lib/framer-auth';

export const dynamic = 'force-dynamic';

function resolveGoogleCallbackUrl(request: Request): string {
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI.trim();
  }
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  if (forwardedHost && !forwardedHost.includes('localhost') && !forwardedHost.includes('127.0.0.1')) {
    return `${forwardedProto}://${forwardedHost}/api/framer-auth/google/callback`;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '')}/api/framer-auth/google/callback`;
  }
  try {
    const origin = new URL(request.url).origin;
    if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return `${origin}/api/framer-auth/google/callback`;
    }
  } catch {
    /* fallback below */
  }
  return 'https://www.qubtic.tech/api/framer-auth/google/callback';
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-plugin-slug',
    },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const rawPlugin = searchParams.get('plugin') || 'frame-drop';
    const pluginMeta = getPluginMetadata(rawPlugin);

    const code = searchParams.get('code') || searchParams.get('user_code') || '';
    const returnUrl = searchParams.get('return_url') || searchParams.get('redirect_uri') || '';
    const project = searchParams.get('project') || searchParams.get('project_id') || '';
    const framerUser = searchParams.get('framer_user') || searchParams.get('user_id') || '';
    const mode = searchParams.get('mode') || 'signin';

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('[Google Auth] GOOGLE_CLIENT_ID is not configured in environment.');
      const fallbackUrl = new URL(`/auth/${pluginMeta.slug}`, request.url);
      fallbackUrl.searchParams.set('error', 'google_not_configured');
      if (code) fallbackUrl.searchParams.set('code', code);
      return NextResponse.redirect(fallbackUrl.toString());
    }

    const callbackUrl = resolveGoogleCallbackUrl(request);

    // Secure state payload encoding plugin name, pairing code, and context
    const statePayload = {
      plugin: pluginMeta.slug,
      code: code.trim().toUpperCase(),
      return_url: sanitizeRedirectUrl(returnUrl) || '',
      project: project.trim(),
      framer_user: framerUser.trim(),
      mode,
      nonce: crypto.randomBytes(16).toString('hex'),
      ts: Date.now(),
    };

    const encodedState = Buffer.from(JSON.stringify(statePayload)).toString('base64url');

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId);
    googleAuthUrl.searchParams.set('redirect_uri', callbackUrl);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'select_account');
    googleAuthUrl.searchParams.set('state', encodedState);

    return NextResponse.redirect(googleAuthUrl.toString(), {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err) {
    console.error('[Google Auth] Error initiating OAuth flow:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to initiate Google authentication.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Support POST as well by reading body and delegating or redirecting
  try {
    const body = await request.json().catch(() => ({}));
    const rawPlugin = body.plugin || 'frame-drop';
    const pluginMeta = getPluginMetadata(rawPlugin);

    const code = body.code || body.user_code || '';
    const returnUrl = body.return_url || body.redirect_uri || '';
    const project = body.project || body.project_id || '';
    const framerUser = body.framer_user || body.user_id || '';
    const mode = body.mode || 'signin';

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        {
          success: false,
          error: 'GOOGLE_CLIENT_ID is not configured on the server.',
        },
        { status: 500 }
      );
    }

    const callbackUrl = resolveGoogleCallbackUrl(request);

    const statePayload = {
      plugin: pluginMeta.slug,
      code: typeof code === 'string' ? code.trim().toUpperCase() : '',
      return_url: sanitizeRedirectUrl(returnUrl) || '',
      project: typeof project === 'string' ? project.trim() : '',
      framer_user: typeof framerUser === 'string' ? framerUser.trim() : '',
      mode,
      nonce: crypto.randomBytes(16).toString('hex'),
      ts: Date.now(),
    };

    const encodedState = Buffer.from(JSON.stringify(statePayload)).toString('base64url');

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId);
    googleAuthUrl.searchParams.set('redirect_uri', callbackUrl);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'select_account');
    googleAuthUrl.searchParams.set('state', encodedState);

    return NextResponse.json({
      success: true,
      auth_url: googleAuthUrl.toString(),
    });
  } catch (err) {
    console.error('[Google Auth] POST error:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to generate Google auth URL.' },
      { status: 500 }
    );
  }
}
