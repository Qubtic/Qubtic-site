import type { Metadata } from 'next';
import { FrameDropVersionControl } from '@/components/framer/FrameDropVersionControl';

export const metadata: Metadata = {
  title: 'Frame Drop Version Control & Rollback | Non-Destructive Architecture | Qubtic',
  description:
    'Explore Frame Drop’s non-destructive canvas architecture, transactional rollback, point-in-time draft snapshots, and complete release changelog history.',
  keywords: [
    'Frame Drop version control',
    'Framer canvas rollback',
    'Framer draft snapshots',
    'non-destructive Framer plugin',
    'Qubtic Technologies',
    'Framer component history',
  ],
  alternates: {
    canonical: 'https://qubtic.tech/framer/frame-drop/version-control',
  },
  openGraph: {
    title: 'Frame Drop Version Control & Rollback | Non-Destructive Architecture | Qubtic',
    description:
      'Explore Frame Drop’s non-destructive canvas architecture, transactional rollback, point-in-time draft snapshots, and complete release changelog history.',
    url: 'https://qubtic.tech/framer/frame-drop/version-control',
    siteName: 'Qubtic',
    type: 'website',
    images: [
      {
        url: '/images/framedrop-banner.png',
        width: 1024,
        height: 461,
        alt: 'Frame Drop Version Control & Canvas Rollback Architecture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frame Drop Version Control & Rollback | Non-Destructive Architecture | Qubtic',
    description:
      'Explore Frame Drop’s non-destructive canvas architecture, transactional rollback, point-in-time draft snapshots, and complete release changelog history.',
    images: ['/images/framedrop-banner.png'],
    creator: '@qubtic',
  },
};

export default function FrameDropVersionControlPage() {
  return <FrameDropVersionControl />;
}
