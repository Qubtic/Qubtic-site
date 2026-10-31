import type { Metadata } from 'next';
import { BillingReturnClient } from './BillingReturnClient';

export const metadata: Metadata = {
  title: 'Return to your plugin — Qubtic',
  description: 'Your payment status has been verified securely with Polar. Return to your Framer plugin.',
  robots: { index: false, follow: false },
};

export default function BillingReturn() {
  return <BillingReturnClient />;
}
