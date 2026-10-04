import type { Metadata } from 'next';
import { FrameDropDocsLayout } from '@/components/framer/FrameDropDocsLayout';

export const metadata: Metadata = {
  title: 'Frame Drop by Qubtic | Native Framer Component Suite & Studio',
  description:
    'Build faster in Framer with Frame Drop by Qubtic. 1-click responsive section drops, Liquid Glassmorphism design tokens, automated WCAG accessibility audits, and Page Studio composer.',
  keywords: [
    'Framer plugin',
    'Frame Drop',
    'Qubtic Technologies',
    'Framer components',
    'web design system',
    'Framer bento grid',
    'Framer hero sections',
    'Framer templates',
    'Liquid Glassmorphism',
    'WCAG AA accessibility',
    'Framer page studio',
  ],
  alternates: {
    canonical: 'https://qubtic.tech/framer/frame-drop/docs',
  },
  openGraph: {
    title: 'Frame Drop by Qubtic | Native Framer Component Suite & Studio',
    description:
      'Build faster in Framer with Frame Drop by Qubtic. 1-click responsive section drops, Liquid Glassmorphism design tokens, automated WCAG accessibility audits, and Page Studio composer.',
    url: 'https://qubtic.tech/framer/frame-drop/docs',
    siteName: 'Qubtic',
    type: 'website',
    images: [
      {
        url: '/images/framedrop-promo.jpg',
        width: 1920,
        height: 1080,
        alt: 'Frame Drop by Qubtic - Native Framer Component Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frame Drop by Qubtic | Native Framer Component Suite & Studio',
    description:
      'Build faster in Framer with Frame Drop by Qubtic. 1-click responsive section drops, Liquid Glassmorphism design tokens, automated WCAG accessibility audits, and Page Studio composer.',
    images: ['/images/framedrop-promo.jpg'],
    creator: '@qubtic',
  },
};

export default function FrameDropDocsPage() {
  return <FrameDropDocsLayout />;
}
