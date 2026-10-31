import { NextResponse } from 'next/server';
import { getPluginMetadata } from '@/lib/plugins-registry';
import {
  createOrUpdateFramerUser,
  confirmPairingSession,
  sanitizeRedirectUrl,
} from '@/lib/framer-auth';

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

function resolveSiteUrl(request: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  if (forwardedHost && !forwardedHost.includes('localhost') && !forwardedHost.includes('127.0.0.1')) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  try {
    const origin = new URL(request.url).origin;
    if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return origin;
    }
  } catch {
    /* fallback below */
  }
  return 'https://www.qubtic.tech';
}

interface GoogleStatePayload {
  plugin: string;
  code?: string;
  return_url?: string;
  project?: string;
  framer_user?: string;
  mode?: string;
  nonce?: string;
  ts?: number;
}

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token?: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const googleError = searchParams.get('error');
  const code = searchParams.get('code');
  const rawState = searchParams.get('state');

  // Parse state payload
  let state: GoogleStatePayload = { plugin: 'frame-drop' };
  if (rawState) {
    try {
      state = JSON.parse(Buffer.from(rawState, 'base64url').toString('utf-8'));
    } catch {
      try {
        state = JSON.parse(decodeURIComponent(rawState));
      } catch (err) {
        console.warn('[Google Auth Callback] Failed to parse state payload:', err);
      }
    }
  }

  const pluginMeta = getPluginMetadata(state.plugin || 'frame-drop');
  const pluginSlug = pluginMeta.slug;
  const userCode = (state.code || '').trim().toUpperCase();

  const siteUrl = resolveSiteUrl(request);
  const callbackUrl = resolveGoogleCallbackUrl(request);

  const fallbackPortalUrl = new URL(`/auth/${pluginSlug}`, siteUrl);
  if (userCode) fallbackPortalUrl.searchParams.set('code', userCode);

  // Handle Google OAuth cancellation or error
  if (googleError) {
    console.warn(`[Google Auth Callback] Google returned error: ${googleError}`);
    fallbackPortalUrl.searchParams.set('error', `google_${googleError}`);
    return NextResponse.redirect(fallbackPortalUrl.toString());
  }

  if (!code) {
    fallbackPortalUrl.searchParams.set('error', 'missing_code');
    return NextResponse.redirect(fallbackPortalUrl.toString());
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('[Google Auth Callback] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing.');
    fallbackPortalUrl.searchParams.set('error', 'google_credentials_missing');
    return NextResponse.redirect(fallbackPortalUrl.toString());
  }

  try {
    // 1. Exchange authorization code for Google access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const tokenErr = await tokenResponse.text();
      console.error('[Google Auth Callback] Token exchange failed:', tokenErr);
      fallbackPortalUrl.searchParams.set('error', 'token_exchange_failed');
      return NextResponse.redirect(fallbackPortalUrl.toString());
    }

    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      fallbackPortalUrl.searchParams.set('error', 'missing_access_token');
      return NextResponse.redirect(fallbackPortalUrl.toString());
    }

    // 2. Fetch authenticated user profile from Google UserInfo endpoint
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('[Google Auth Callback] Failed to fetch user info from Google');
      fallbackPortalUrl.searchParams.set('error', 'userinfo_fetch_failed');
      return NextResponse.redirect(fallbackPortalUrl.toString());
    }

    const googleUser = (await userInfoResponse.json()) as GoogleUserInfo;

    if (!googleUser.email) {
      fallbackPortalUrl.searchParams.set('error', 'email_missing');
      return NextResponse.redirect(fallbackPortalUrl.toString());
    }

    const email = googleUser.email.toLowerCase().trim();
    const name = googleUser.name || email.split('@')[0];

    // 3. Create or update user in database with plugin attribution tracking
    const { user, token, isNew } = await createOrUpdateFramerUser({
      email,
      name,
      pluginSlug,
      framerUserId: state.framer_user || googleUser.sub,
      framerProjectId: state.project || '',
      metadata: {
        auth_provider: 'google',
        google_id: googleUser.sub,
        avatar_url: googleUser.picture || '',
        email_verified: googleUser.email_verified ?? true,
        last_google_signin_at: new Date().toISOString(),
      },
    });

    // 4. Confirm pairing session if user came from a Framer plugin pairing flow
    if (userCode) {
      try {
        await confirmPairingSession(userCode, user);
      } catch (err) {
        console.warn('[Google Auth Callback] Pairing session confirmation warning:', err);
      }
    }

    // 5. Construct successful redirect
    let destinationUrl: URL;

    const sanitizedReturn = sanitizeRedirectUrl(state.return_url);
    if (sanitizedReturn && sanitizedReturn.startsWith('http')) {
      destinationUrl = new URL(sanitizedReturn);
      destinationUrl.searchParams.set('token', token);
      destinationUrl.searchParams.set('plugin', pluginSlug);
      destinationUrl.searchParams.set('google_auth', 'success');
      if (userCode) destinationUrl.searchParams.set('code', userCode);
    } else {
      destinationUrl = new URL(`/auth/${pluginSlug}`, siteUrl);
      destinationUrl.searchParams.set('google_auth', 'success');
      destinationUrl.searchParams.set('token', token);
      destinationUrl.searchParams.set('email', user.email);
      destinationUrl.searchParams.set('name', user.name || name);
      destinationUrl.searchParams.set('is_new', isNew ? '1' : '0');
      if (userCode) destinationUrl.searchParams.set('code', userCode);
    }

    const response = NextResponse.redirect(destinationUrl.toString(), {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });

    // Set auth cookie for seamless persistent portal recognition
    response.cookies.set(`qubtic_framer_token_${pluginSlug}`, token, {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (err) {
    console.error('[Google Auth Callback] Unhandled callback error:', err);
    fallbackPortalUrl.searchParams.set('error', 'server_error');
    return NextResponse.redirect(fallbackPortalUrl.toString());
  }
}
