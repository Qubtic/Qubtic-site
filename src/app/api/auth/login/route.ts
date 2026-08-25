import { NextResponse } from 'next/server';
import { verifyAdminUserDb } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Please enter both email/username and password' },
        { status: 400 }
      );
    }

    // Verify admin user against Supabase admin_users table
    const user = await verifyAdminUserDb(username, password);

    if (user) {
      const sessionPayload = Buffer.from(
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          timestamp: Date.now(),
        })
      ).toString('base64');

      const response = NextResponse.json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

      response.cookies.set('qubtic_admin_session', sessionPayload, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid email/username or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error processing authentication' },
      { status: 500 }
    );
  }
}
