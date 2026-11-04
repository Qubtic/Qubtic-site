import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-session';
export function proxy(request: NextRequest) {
    const session = verifyAdminSession(request.cookies.get('qubtic_admin_session')?.value);
    if (!session || !['admin', 'owner', 'ceo', 'superadmin'].includes(session.role.toLowerCase()))
        return NextResponse.json({ error: 'Administrator access required.' }, { status: 401 });
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && request.headers.get('origin') !== request.nextUrl.origin)
        return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
    return NextResponse.next();
}
export const config = { matcher: ['/api/admin/:path*'] };
