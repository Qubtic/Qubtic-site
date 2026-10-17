import { NextResponse } from 'next/server';
import { confirmPairingSession, verifyFramerSessionToken } from '@/lib/framer-auth';

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

function extractAuthToken(request: Request, bodyToken?: string): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match && match[1].trim()) {
      return match[1].trim();
    }
  }

  const framerHeader = request.headers.get('x-framer-token');
  if (framerHeader && framerHeader.trim()) {
    return framerHeader.trim();
  }

  if (bodyToken && typeof bodyToken === 'string' && bodyToken.trim()) {
    return bodyToken.trim();
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = extractAuthToken(request, body.token);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: missing authentication token' },
        {
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-framer-token',
          },
        }
      );
    }

    const user = await verifyFramerSessionToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: invalid or expired token' },
        {
          status: 401,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    if (user.status === 'suspended') {
      return NextResponse.json(
        { success: false, error: 'Suspended accounts cannot authorize plugins' },
        {
          status: 403,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    const rawUserCode = body.user_code || body.userCode || body.code;
    if (!rawUserCode || typeof rawUserCode !== 'string' || !rawUserCode.trim()) {
      return NextResponse.json(
        { success: false, error: 'Missing user_code in request body' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    const result = await confirmPairingSession(rawUserCode, user);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to confirm pairing session' },
        {
          status: result.status || 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message || 'Plugin paired successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          company_name: user.company_name,
          website_url: user.website_url,
          plugin_slug: user.plugin_slug,
          is_early_bird: Boolean(user.is_early_bird),
        },
      },
      {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (err: unknown) {
    console.error('Error confirming pairing session:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error confirming pairing session' },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}
