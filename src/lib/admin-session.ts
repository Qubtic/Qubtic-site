import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
export interface AdminSession { id: string; name: string; email: string; role: string; expiresAt: number }
const lifetime = 7 * 24 * 60 * 60 * 1000;
function key() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('Admin session signing is not configured.');
  return value;
}
export function createAdminSession(user: Omit<AdminSession, 'expiresAt'>): string {
  const body = Buffer.from(JSON.stringify({ ...user, expiresAt: Date.now() + lifetime })).toString('base64url');
  return `${body}.${createHmac('sha256', key()).update(body).digest('base64url')}`;
}
export function verifyAdminSession(token: string | undefined): AdminSession | null {
  if (!token) return null;
  try {
    const [body, signature, extra] = token.split('.');
    if (!body || !signature || extra) return null;
    const expected = createHmac('sha256', key()).update(body).digest();
    const supplied = Buffer.from(signature, 'base64url');
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return typeof data.id === 'string' && typeof data.email === 'string' && typeof data.role === 'string' && Number.isFinite(data.expiresAt) && data.expiresAt > Date.now() ? data : null;
  } catch { return null; }
}
