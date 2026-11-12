/** Durable per-order messages, created only after a verified paid event is reconciled. */
export function purchaseNotificationRows(input: {
  orderId: string; environment: string; email: string; teamEmail: string;
  amount?: number; currency?: string;
}) {
  const { orderId, environment, email, teamEmail } = input;
  if (!orderId || orderId.length > 200 || /[\r\n]/.test(orderId) || !['production', 'sandbox'].includes(environment)) throw new Error('Invalid purchase notification reference.');
  for (const address of [email, teamEmail]) if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(address)) throw new Error('Purchase notification recipient is not configured.');
  let paid = 'Confirmed by the payment provider';
  if (Number.isSafeInteger(input.amount) && input.amount! >= 0 && /^[a-z]{3}$/i.test(input.currency || '')) {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: input.currency!.toUpperCase() });
    const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
    paid = formatter.format(input.amount! / 10 ** digits);
  }
  const prefix = environment === 'sandbox' ? '[Sandbox] ' : '';
  const reference = `frame-drop:${environment}:${orderId}`;
  return [
    { id: `purchase-receipt:${reference}`, event: 'purchase_receipt', plugin: 'frame-drop', email, recipient: email,
      subject: `${prefix}Your Frame Drop purchase confirmation`,
      body: `Thank you for purchasing Frame Drop Pro.\n\nPayment: ${paid}\nOrder: ${orderId}\nAccount: ${email}\n\nOpen Frame Drop in Framer and sign in with this Qubtic account to insert Pro components and Studio bundles. Your account access is verified by the plugin.\n\nFor help, contact hello@qubtic.tech.\nMade by Qubtic` },
    { id: `purchase:${reference}`, event: 'purchase', plugin: 'frame-drop', email, recipient: teamEmail,
      subject: `${prefix}Frame Drop purchase received`,
      body: `A verified Frame Drop payment was completed.\n\nCustomer: ${email}\nPayment: ${paid}\nOrder: ${orderId}\nEnvironment: ${environment}\n\nThis notification follows server-side payment verification.` },
  ];
}
