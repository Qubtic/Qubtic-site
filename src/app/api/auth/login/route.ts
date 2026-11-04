import { createHash } from 'node:crypto';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { verifyAdminUserDb } from '@/lib/store';
import { createAdminSession } from '@/lib/admin-session';

export async function POST(request: Request) {
  try {
    if(request.headers.get('origin')!==new URL(request.url).origin)return NextResponse.json({error:'Invalid request origin.'},{status:403});
    const bucket=createHash('sha256').update('admin-login:'+ (request.headers.get('x-forwarded-for')||'unknown')).digest('hex');
    const {data:allowed,error:rateError}=await supabase.rpc('billing_throttle',{p_bucket:bucket,p_limit:10,p_seconds:900} as never);
    if(rateError||!allowed)return NextResponse.json({error:'Please try again later.'},{status:429});
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
      const sessionPayload = createAdminSession({ id: user.id, name: user.name, email: user.email, role: user.role });

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
