import 'server-only';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import nodemailer from 'nodemailer';

export function mailAddress(value: unknown): string {
  if (typeof value === 'string') value = value.trim();
  if (typeof value !== 'string' || value.length > 254 || !/^[^\s@<>;,]+@[^\s@<>;,]+\.[^\s@<>;,]+$/.test(value)) throw new Error('Enter a valid email address.');
  return value.trim();
}
function publicAddress(address: string) {
  if (isIP(address) !== 4) return false;
  const [a, b] = address.split('.').map(Number);
  return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0)) || (a === 100 && b >= 64 && b <= 127) || (a === 198 && (b === 18 || b === 19)));
}
/** Resolve once and connect to a public IPv4 address; preserve the SMTP hostname for TLS verification. */
export async function smtpTransport(settings: any) {
  const host = String(settings.smtpHost || '').trim();
  const port = Number(settings.smtpPort);
  if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(host) || ![465, 587, 2525].includes(port) || !settings.smtpUser || !settings.smtpPass) throw new Error('Configure a public SMTP hostname, credentials and port 465, 587 or 2525.');
  const addresses = await lookup(host, { all: true, family: 4 });
  if (!addresses.length || addresses.some(entry => !publicAddress(entry.address))) throw new Error('SMTP must resolve to a public server.');
  return nodemailer.createTransport({ host: addresses[0].address, port, secure: port === 465, requireTLS: port !== 465,
    auth: { user: settings.smtpUser, pass: settings.smtpPass }, tls: { servername: host, rejectUnauthorized: true },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000 });
}
