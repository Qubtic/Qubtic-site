import { NextResponse } from 'next/server';
import { verifyFramerSessionToken, EARLY_BIRD_CUTOFF_DATE } from '@/lib/framer-auth';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-framer-token, x-plugin-slug',
    },
  });
}

function parseBearerToken(headerValue: string | null): string | null {
  if (!headerValue || typeof headerValue !== 'string') return null;
  const match = headerValue.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1].trim();
  return token.length > 0 ? token : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryToken = searchParams.get('token');
    const authHeader = request.headers.get('authorization');
    const framerHeader = request.headers.get('x-framer-token');

    let token: string | null = null;
    if (authHeader) {
      token = parseBearerToken(authHeader);
    } else if (framerHeader && framerHeader.trim()) {
      token = framerHeader.trim();
    } else if (queryToken && queryToken.trim()) {
      token = queryToken.trim();
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: missing token' },
        {
          status: 401,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    const user = await verifyFramerSessionToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        {
          status: 401,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    if (user.status === 'suspended') {
      return NextResponse.json(
        { success: false, error: 'Account suspended' },
        {
          status: 403,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    const isPro = user.plan === 'pro' || user.plan === 'enterprise' || Boolean(user.is_early_bird);

    return NextResponse.json(
      {
        success: true,
        user_id: user.id,
        email: user.email,
        tier: user.plan,
        is_pro: isPro,
        is_early_bird: Boolean(user.is_early_bird),
        early_bird_cutoff: EARLY_BIRD_CUTOFF_DATE,
        capabilities: isPro
          ? ['pro_components', 'token_sync', 'bulk_export', 'custom_styles']
          : ['free_components'],
        active_features: {
          unlimited_inserts: isPro,
          pro_templates: isPro,
          team_collaboration: isPro,
        },
        status: user.status || 'active',
      },
      {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (err: unknown) {
    console.error('Error verifying entitlement:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error verifying entitlement' },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}
