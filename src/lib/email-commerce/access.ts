import 'server-only';
import { paidAccess, identity, synchronize, limit } from '@/lib/billing/core';

/** Reconcile an expired verification lease, then honor the fresh server decision (including refunds). */
export async function ensureEmailCommerceAccess(userId: string, site: string): Promise<boolean> {
  if (await paidAccess(userId, 'whatsapp-commerce', site)) return true;
  await limit(`email-access-refresh:${userId}:${site}`, 3, 60);
  const customer = await identity(userId);
  await synchronize(customer);
  return paidAccess(userId, 'whatsapp-commerce', site);
}
