import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

function key(secret) {
  if (typeof secret !== 'string' || secret.length < 32) throw new Error('Email checkout requires EMAIL_COMMERCE_SECRET (at least 32 characters).');
  return createHash('sha256').update(`email-commerce:v1:${secret}`).digest();
}
/** Authenticate and encrypt merchant credentials before returning a public storefront token. */
export function sealStore(config, secret) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(secret), iv);
  cipher.setAAD(Buffer.from('email-commerce:v1'));
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(config), 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), ciphertext.toString('base64url')].join('.');
}
export function openStore(token, secret) {
  if (typeof token !== 'string' || token.length > 3000000) throw new Error('Invalid store configuration.');
  const [version, iv, tag, ciphertext, extra] = token.split('.');
  if (version !== 'v1' || !iv || !tag || !ciphertext || extra) throw new Error('Invalid store configuration.');
  const decipher = createDecipheriv('aes-256-gcm', key(secret), Buffer.from(iv, 'base64url'));
  decipher.setAAD(Buffer.from('email-commerce:v1'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64url')), decipher.final()]).toString('utf8'));
}
export function validateOrder(products, requested) {
  if (!Array.isArray(requested) || !requested.length || requested.length > 100) throw new Error('Choose between 1 and 100 order lines.');
  const seen = new Set();
  const lines = requested.map(line => {
    const product = products.find(product => product.sku === line.sku);
    if (!product || product.draft || seen.has(line.sku)) throw new Error('An order item is unavailable or duplicated.');
    seen.add(line.sku);
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1 || line.quantity > 999 || !Number.isFinite(product.price) || product.price < 0 || (product.stock !== null && (!Number.isSafeInteger(product.stock) || product.stock < line.quantity))) throw new Error('Review product prices, availability and quantities.');
    return { ...product, quantity: line.quantity };
  });
  const currency = lines[0].currency;
  if (!/^[A-Z]{3}$/.test(currency) || lines.some(line => line.currency !== currency)) throw new Error('Place separate requests for products in different currencies.');
  const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  if (!Number.isFinite(total)) throw new Error('Order total is too large.');
  return { lines, currency, total };
}
