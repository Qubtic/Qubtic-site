import RefundPolicyPage, { metadata as refundMetadata } from '@/app/refund-policy/page';

export const metadata = {
  ...refundMetadata,
  alternates: {
    canonical: 'https://qubtic.tech/refunds',
  },
};

export default function RefundsPage() {
  return <RefundPolicyPage />;
}
