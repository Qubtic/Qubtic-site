import { NextResponse } from 'next/server';
import { resolvePairingSession } from '@/lib/framer-auth';

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
    const deviceCode = body.device_code || body.deviceCode;

    if (!deviceCode) {
      return NextResponse.json(
        { success: false, status: 404, error: 'Missing device code parameter' },
        {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-framer-token',
          },
        }
      );
    }

    if (
      typeof deviceCode !== 'string' ||
      deviceCode.length !== 64 ||
      !/^[0-9a-f]{64}$/.test(deviceCode)
    ) {
      return NextResponse.json(
        { success: false, status: 400, error: 'Invalid device code format' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    const result = await resolvePairingSession(deviceCode);

    if (!result.success) {
      const httpStatus = typeof result.status === 'number' ? result.status : 400;
      return NextResponse.json(
        {
          success: false,
          status: result.status,
          error: result.error || 'Failed to resolve pairing session',
          ...(result.retry_in ? { retry_in: result.retry_in } : {}),
        },
        {
          status: httpStatus,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-framer-token',
      },
    });
  } catch (err: unknown) {
    console.error('Error resolving pairing session:', err);
    return NextResponse.json(
      { success: false, status: 500, error: 'Internal server error resolving pairing session' },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}
