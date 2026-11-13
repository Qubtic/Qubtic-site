import { createHash, randomUUID } from 'node:crypto';
export const ORDER_BUCKET = 'email-commerce-orders';
const digest = value => createHash('sha256').update(value).digest('hex');
/** Private durable claims use atomic create (upsert:false); no instance can resend an existing claim. */
export function createOrderLedger(storage) {
  const bucket = storage.from(ORDER_BUCKET);
  return {
    async claim(identity, fingerprint) {
      const path = `${digest(identity)}.json`;
      const record = { version: 1, fingerprint: digest(fingerprint), orderId: `EC-${randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase()}`, state: 'pending', createdAt: new Date().toISOString() };
      const { error } = await bucket.upload(path, JSON.stringify(record), { contentType: 'application/json', cacheControl: '0', upsert: false });
      if (!error) return { path, record, owned: true };
      // A conflict is normal; any storage outage fails closed before SMTP dispatch.
      const { data, error: readError } = await bucket.download(path);
      if (readError || !data) throw new Error('Durable order tracking is unavailable. Please try again later.');
      const existing = JSON.parse(await data.text());
      if (existing.version !== 1 || existing.fingerprint !== record.fingerprint) throw new Error('This order reference belongs to a different request.');
      return { path, record: existing, owned: false };
    },
    async finish(claim, state, result) {
      const record = { ...claim.record, state, result, updatedAt: new Date().toISOString() };
      const { error } = await bucket.upload(claim.path, JSON.stringify(record), { contentType: 'application/json', cacheControl: '0', upsert: true });
      if (error) throw new Error('Order delivery tracking is uncertain. Contact the seller with your order reference.');
      claim.record = record;
    },
  };
}
