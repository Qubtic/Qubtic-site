import { ensureEmailCommerceAccess } from '@/lib/email-commerce/access';
import { createOrderLedger } from '@/lib/email-commerce/order-ledger.mjs';
import { limit, database, withManagedBillingEnvironment } from '@/lib/billing/core';
import { openStore, validateOrder } from '@/lib/email-commerce/config.mjs';
import { mailAddress, smtpTransport } from '@/lib/email-commerce/smtp';

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Cache-Control': 'no-store' };
// Coalesce double clicks and retries durably across server instances. Provider delivery is not a payment confirmation.
export function OPTIONS() { return new Response(null, { status: 204, headers }); }
export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 3100000) throw new Error('Order request is too large.');
    const body = JSON.parse(raw);
    const config = openStore(body.token, process.env.EMAIL_COMMERCE_SECRET);
    if (!['sandbox', 'production'].includes(config.environment)) throw new Error('Invalid store environment.');
    const result = await withManagedBillingEnvironment(config.environment, async () => {
      await limit(`email-order:${config.site}:${config.userId}`, 10, 60);
      if (!await ensureEmailCommerceAccess(config.userId, config.site)) throw new Error('Email ordering is unavailable for this store. Contact the seller.');
      const { lines, currency, total } = validateOrder(config.products, body.lines);
      const customer = body.customer || {};
      const email = mailAddress(customer.email);
      const name = String(customer.name || '').trim();
      if (!name || name.length > 120 || /[\r\n]/.test(name)) throw new Error('Enter your name (up to 120 characters).');
      for (const field of ['phone', 'address', 'notes', 'contact']) if (typeof customer[field] !== 'undefined' && (typeof customer[field] !== 'string' || customer[field].length > 1000)) throw new Error('Customer details are too long.');
      if (typeof body.requestId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(body.requestId)) throw new Error('Invalid order reference.');
      const ledger = createOrderLedger(database().storage);
      const settings = config.settings;
      const transport = await smtpTransport(settings);
      const fingerprint = JSON.stringify({ email, name, lines: body.lines, customer });
      // The fingerprint binds retries to the same request and prevents silently replacing its contents.
      const claim = await ledger.claim(`${config.environment}:${config.userId}:${config.site}:${body.requestId}`, fingerprint);
      const orderId = claim.record.orderId;
      if (!claim.owned) {
        transport.close();
        return claim.record.result || { success: false, pending: true, orderId, message: `This order request is processing or its delivery is uncertain. Reference: ${orderId}. Contact the seller before creating another request.` };
      }
      try {
        const money = new Intl.NumberFormat('en', { style: 'currency', currency });
        const paymentLabels: Record<string, string> = { online_invoice: 'Request payment link / invoice', bank_transfer: 'Bank transfer', cod: 'Cash on delivery', pickup: 'Pay on pickup' };
        const text = [`${settings.business} — order and payment request ${orderId}`, `Customer: ${name}`, `Email: ${email}`, `Phone: ${customer.phone || ''}`, `Contact: ${customer.contact || ''}`, `Address: ${customer.address || ''}`, `Payment preference: ${paymentLabels[customer.paymentMethod] || paymentLabels.online_invoice}`, '', ...lines.map(line => `${line.name} [${line.sku}] × ${line.quantity} — ${money.format(line.price * line.quantity)}`), `Requested total: ${money.format(total)}`, '', `Notes: ${customer.notes || ''}`, 'This is an order request. Payment, current availability and delivery must be confirmed by the seller. Stock has not been reserved.'].join('\n');
        try {
          const sent = await transport.sendMail({ from: { name: settings.fromName, address: settings.fromEmail }, to: settings.merchantEmail, replyTo: { name, address: email }, subject: `Order request ${orderId} — ${settings.business}`, text });
          if (!sent.accepted?.length) throw new Error('The merchant email was not accepted by the SMTP server.');
          let receiptSent = false;
          const merchantResult = { success: true, orderId, receiptSent: false, message: `Order request emailed to the seller. Reference: ${orderId}. Payment and delivery are confirmed separately.` };
          await ledger.finish(claim, 'accepted', merchantResult);
          if (settings.customerReceipt) {
            try { const receipt = await transport.sendMail({ from: { name: settings.fromName, address: settings.fromEmail }, to: email, replyTo: settings.merchantEmail, subject: `Your order request ${orderId} — ${settings.business}`, text }); receiptSent = Boolean(receipt.accepted?.length); } catch { /* Merchant delivery succeeded; do not resubmit the order if a receipt fails. */ }
          }
          const result = { success: true, orderId, receiptSent, message: `Order request emailed to the seller. Reference: ${orderId}. ${receiptSent ? 'A copy was emailed to you.' : 'Keep this reference for the seller.'} Payment and delivery are confirmed separately.` };
          await ledger.finish(claim, 'accepted', result);
          return result;
        } catch {
          if (claim.record.state === 'accepted') return claim.record.result;
          const result = { success: false, pending: true, orderId, message: `Delivery is uncertain. Reference: ${orderId}. Contact the seller before placing another request.` };
          try { await ledger.finish(claim, 'uncertain', result); } catch { /* The durable pending claim still prevents resending. */ }
          return result;
        }
      } finally { transport.close(); }
    });
    return Response.json(result, { status: result?.pending ? 202 : 200, headers });
  } catch { return Response.json({ success: false, message: 'Order could not be sent. Check your details or contact the seller. If delivery is uncertain, contact the seller before retrying.' }, { status: 400, headers }); }
}
