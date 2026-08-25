import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('qubtic_admin_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    try {
      const decoded = JSON.parse(Buffer.from(sessionToken, 'base64').toString('utf-8'));
      if (decoded && decoded.email) {
        return NextResponse.json({
          authenticated: true,
          user: {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role || 'admin',
          },
        });
      }
    } catch (parseErr) {
      // Invalid session token format
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
