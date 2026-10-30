import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/admin-session';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('qubtic_admin_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    try {
      const decoded = verifyAdminSession(sessionToken);
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
    } catch {
      // Invalid session token format
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
