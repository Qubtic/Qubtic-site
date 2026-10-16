import { NextResponse } from 'next/server';
import { verifyFramerSessionToken } from '@/lib/framer-auth';

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryToken = searchParams.get('token');
    const queryPlugin = searchParams.get('plugin') || undefined;

    // Check token from query param, or Authorization header, or x-framer-token header
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : request.headers.get('x-framer-token');

    const token = queryToken || headerToken;
    const pluginSlug = queryPlugin || request.headers.get('x-plugin-slug') || undefined;

    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'Missing token parameter or Authorization header.' },
        {
          status: 401,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    const user = await verifyFramerSessionToken(token, pluginSlug);

    if (!user) {
      return NextResponse.json(
        { valid: false, message: 'Invalid, revoked, or expired Framer authentication token.' },
        {
          status: 401,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    const isPro = user.plan === 'pro' || user.plan === 'enterprise' || Boolean(user.is_early_bird);

    return NextResponse.json(
      {
        valid: true,
        is_pro: isPro,
        tier: user.plan,
        is_early_bird: Boolean(user.is_early_bird),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          company_name: user.company_name,
          website_url: user.website_url,
          plan: user.plan,
          is_pro: isPro,
          tier: user.plan,
          is_early_bird: Boolean(user.is_early_bird),
          early_bird_granted_at: user.early_bird_granted_at,
          plugin_slug: user.plugin_slug,
          plugin_name: user.plugin_name,
          status: user.status,
          created_at: user.created_at,
          last_login_at: user.last_login_at,
        },
      },
      {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (error) {
    console.error('Error verifying Framer token:', error);
    return NextResponse.json(
      { valid: false, message: 'Server error verifying session token.' },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.token || request.headers.get('x-framer-token');
    const plugin = body.plugin || undefined;

    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'Missing token in body.' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const user = await verifyFramerSessionToken(token, plugin);
    if (!user) {
      return NextResponse.json(
        { valid: false, message: 'Invalid or expired token.' },
        { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const isPro = user.plan === 'pro' || user.plan === 'enterprise' || Boolean(user.is_early_bird);

    return NextResponse.json(
      {
        valid: true,
        is_pro: isPro,
        tier: user.plan,
        is_early_bird: Boolean(user.is_early_bird),
        user: {
          ...user,
          is_pro: isPro,
          tier: user.plan,
          is_early_bird: Boolean(user.is_early_bird),
        },
      },
      { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch {
    return NextResponse.json(
      { valid: false, message: 'Server error' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
