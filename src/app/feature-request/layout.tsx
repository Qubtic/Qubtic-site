import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feature Request | Frame Drop Framer Plugin by Qubtic',
  description:
    'Shape the future of Frame Drop by Qubtic. Request custom Framer components, bento grids, design tokens, and workflow tooling directly from our core engineering team.',
  alternates: {
    canonical: 'https://qubtic.tech/feature-request',
  },
  openGraph: {
    title: 'Feature Request | Frame Drop Framer Plugin by Qubtic',
    description:
      'Shape the future of Frame Drop by Qubtic. Request custom Framer components, bento grids, design tokens, and workflow tooling directly from our core engineering team.',
    url: 'https://qubtic.tech/feature-request',
    siteName: 'Qubtic',
    type: 'website',
    images: [
      {
        url: '/images/framedrop-promo.jpg',
        width: 1920,
        height: 1080,
        alt: 'Frame Drop by Qubtic - Feature Request & Roadmap',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Feature Request | Frame Drop Framer Plugin by Qubtic',
    description:
      'Shape the future of Frame Drop by Qubtic. Request custom Framer components, bento grids, design tokens, and workflow tooling directly from our core engineering team.',
    images: ['/images/framedrop-promo.jpg'],
    creator: '@qubtic',
  },
};

export default function FeatureRequestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
