// Explicit recovery for an account's verified purchase receipts and existing notification outbox.
// Defaults to inspection; --send queues/delivers only this account's FrameDrop notifications.
import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { createPolar } from '@polar-sh/sdk/2026-10';
import nodemailer from 'nodemailer';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { decryptSecrets } from '../src/lib/plugin-secrets.mjs';
nextEnv.loadEnvConfig(process.cwd());
const email = process.argv.find(arg => arg.startsWith('--email='))?.slice(8);
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Pass --email=account.');
const send = process.argv.includes('--send');
const db = createClient(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: controls, error } = await db.from('plugin_control').select('*').in('id', ['mail', 'polar:sandbox']);
if (error) throw new Error('Configuration unavailable.');
const mail = controls.find(row => row.id === 'mail').settings;
const sandbox = controls.find(row => row.id === 'polar:sandbox');
const secrets = decryptSecrets(sandbox.secrets, process.env.PLUGIN_CONFIG_ENCRYPTION_KEY, sandbox.id);
const sdk = createPolar({ accessToken: secrets.accessToken, environment: 'sandbox', timeout: 20 });
const templates = {};
new Function('exports', ts.transpileModule(readFileSync(new URL('../src/lib/billing/purchase-notifications.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText)(templates);
const { data: customers, error: customerError } = await db.from('billing_customers').select('id,polar_customer_id').eq('environment', 'sandbox').eq('email', email);
if (customerError) throw new Error('Customer lookup failed.');
let verified = 0;
for (const customer of customers) {
 const { data: orders, error } = await db.from('billing_orders').select('polar_order_id').eq('environment', 'sandbox').eq('plugin_slug', 'frame-drop').eq('customer_id', customer.id).eq('status', 'paid');
 if (error) throw new Error('Order lookup failed.');
 for (const record of orders) {
  const order = await sdk.orders.get(record.polar_order_id);
  if (order.status !== 'paid' || order.customer_id !== customer.polar_customer_id || order.customer.organization_id !== sandbox.settings.organizationId) throw new Error('Provider paid order ownership mismatch.');
  const { data: binding } = await db.from('billing_checkouts').select('id').eq('environment', 'sandbox').eq('plugin_slug', 'frame-drop').eq('polar_checkout_id', order.checkout_id).eq('customer_id', customer.id).maybeSingle();
  if (!binding) throw new Error('Verified FrameDrop checkout binding missing.');
  verified++;
  if (send) {
   const { error } = await db.from('plugin_team_events').upsert(templates.purchaseNotificationRows({ orderId: order.id, environment: 'sandbox', email, teamEmail: mail.teamEmail, amount: order.total_amount, currency: order.currency }), { onConflict: 'id', ignoreDuplicates: true });
   if (error) throw new Error('Purchase messages could not be queued.');
  }
 }
}
if (send) {
 const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST || 'smtp.mailgun.org', port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }, connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 10000 });
 await transport.verify();
 const { data: rows, error } = await db.from('plugin_team_events').select('*').eq('plugin', 'frame-drop').eq('email', email).in('event', ['signup', 'purchase', 'purchase_receipt']).is('delivered_at', null).is('cancelled_at', null);
 if (error) throw new Error('Outbox unavailable.');
 let accepted = 0;
 for (const item of rows) {
  if (item.event === 'manual' || (item.event !== 'purchase_receipt' && !mail[item.event])) continue;
  if (item.lease_until && Date.parse(item.lease_until) > Date.now()) continue;
  const lease = new Date(Date.now() + 120000).toISOString();
  const { data: claimed, error } = await db.from('plugin_team_events').update({ lease_until: lease, attempts: item.attempts + 1 }).eq('id', item.id).is('delivered_at', null).eq('attempts', item.attempts).select('id').maybeSingle();
  if (error || !claimed) continue;
  const recipient = item.event === 'purchase_receipt' ? email : mail.teamEmail;
  if (item.recipient && item.recipient !== recipient) throw new Error('Recipient differs from the authorized customer/team destination.');
  await transport.sendMail({ from: `"Frame Drop by Qubtic" <${process.env.SMTP_FROM_EMAIL || 'hello@qubtic.tech'}>`, to: recipient, subject: item.subject || `Qubtic: ${item.event} · Frame Drop`, text: item.body || `Event: ${item.event}\nPlugin: Frame Drop\nAccount: ${email}\nReference: ${item.id}` });
  const { error: markError } = await db.from('plugin_team_events').update({ delivered_at: new Date().toISOString() }).eq('id', item.id).eq('lease_until', lease);
  if (markError) throw new Error('SMTP accepted a message but the delivery marker failed; review before retrying.');
  await db.from('plugin_mail_log').insert({ email: recipient, plugin: 'frame-drop', event: item.event, status: 'smtp_accepted' });
  accepted++;
 }
 transport.close();
 console.log(JSON.stringify({ verifiedSandboxOrders: verified, smtpAccepted: accepted }));
} else console.log(JSON.stringify({ verifiedSandboxOrders: verified, readyToRecover: true }));
