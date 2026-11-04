import 'server-only';
import { cookies } from 'next/headers';
import { verifyAdminSession } from './admin-session';
export async function requirePluginAdmin(request?: Request) {
    const session = verifyAdminSession((await cookies()).get('qubtic_admin_session')?.value);
    if (!session || !['admin', 'owner', 'ceo', 'superadmin'].includes(session.role.toLowerCase()))
        throw Error('Administrator access required.');
    if (request && request.method !== 'GET' && request.headers.get('origin') !== new URL(request.url).origin)
        throw Error('Invalid request origin.');
    return session;
}
