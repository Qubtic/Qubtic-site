import type { Metadata } from 'next';
import FeatureRequestPage from '@/app/feature-request/page';

export const metadata: Metadata = {
  title: 'Feature Request | Frame Drop Framer Plugin by Qubtic',
  description:
    'Shape the future of Frame Drop by Qubtic. Request custom Framer components, bento grids, design tokens, and workflow tooling directly from our core engineering team.',
  alternates: {
    canonical: 'https://qubtic.tech/feature-request',
  },
};

export default function FrameDropFeatureRequestPage() {
  return <FeatureRequestPage />;
}
