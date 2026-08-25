import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transparent Pricing & Retainer Plans | Qubtic',
  description:
    'Explore transparent pricing plans and engineering retainer packages for Web Development, SaaS Product Engineering, Shopify Apps, and Framer sites at Qubtic.',
  alternates: {
    canonical: 'https://qubtic.tech/pricing',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
