import { NextResponse } from 'next/server';
import { initiatePairingSession } from '@/lib/framer-auth';

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
    const body = await request.json().catch(() => ({}));
    const pluginSlug = body.plugin_slug || body.pluginSlug || body.plugin || 'frame-drop';
    const pluginName = body.plugin_name || body.pluginName;
    const ttlSeconds = body.expires_in || body.expiresIn || body.ttl || body.ttl_seconds;
    const metadata = body.metadata || {};

    const session = await initiatePairingSession({
      pluginSlug: typeof pluginSlug === 'string' ? pluginSlug : 'frame-drop',
      pluginName: typeof pluginName === 'string' ? pluginName : undefined,
      ttlSeconds: typeof ttlSeconds === 'number' ? ttlSeconds : undefined,
      metadata: typeof metadata === 'object' && metadata !== null ? metadata : {},
    });

    return NextResponse.json(session, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-framer-token, x-plugin-slug',
      },
    });
  } catch (err: unknown) {
    console.error('Error initiating pairing session:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error initiating pairing session' },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}
