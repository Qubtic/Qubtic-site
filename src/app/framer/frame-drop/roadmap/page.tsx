import type { Metadata } from 'next';
import { FrameDropRoadmap } from '@/components/framer/FrameDropRoadmap';

export const metadata: Metadata = {
  title: 'Frame Drop Roadmap | Product Milestones & Trajectory | Qubtic',
  description:
    'Discover what is shipped, in development, and planned for Frame Drop by Qubtic. Explore upcoming milestones for native Framer components, canvas sync, CMS blueprints, and design tokens.',
  keywords: [
    'Frame Drop roadmap',
    'Framer plugin roadmap',
    'Qubtic Technologies',
    'Framer component updates',
    'Framer CMS blueprints',
    'Framer design tokens',
    'Framer canvas sync',
  ],
  alternates: {
    canonical: 'https://qubtic.tech/framer/frame-drop/roadmap',
  },
  openGraph: {
    title: 'Frame Drop Roadmap | Product Milestones & Trajectory | Qubtic',
    description:
      'Discover what is shipped, in development, and planned for Frame Drop by Qubtic. Explore upcoming milestones for native Framer components, canvas sync, CMS blueprints, and design tokens.',
    url: 'https://qubtic.tech/framer/frame-drop/roadmap',
    siteName: 'Qubtic',
    type: 'website',
    images: [
      {
        url: '/images/framedrop-banner.png',
        width: 1024,
        height: 461,
        alt: 'Frame Drop Product Roadmap - Qubtic Technologies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frame Drop Roadmap | Product Milestones & Trajectory | Qubtic',
    description:
      'Discover what is shipped, in development, and planned for Frame Drop by Qubtic. Explore upcoming milestones for native Framer components, canvas sync, CMS blueprints, and design tokens.',
    images: ['/images/framedrop-banner.png'],
    creator: '@qubtic',
  },
};

export default function FrameDropRoadmapPage() {
  return <FrameDropRoadmap />;
}
