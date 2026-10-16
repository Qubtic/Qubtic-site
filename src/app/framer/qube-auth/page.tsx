import type { Metadata } from 'next';
import { QubeAuthLandingPage } from '@/components/framer/qube-auth/QubeAuthLandingPage';

export const metadata: Metadata = {
  title: 'Qube Auth by Qubtic | The Complete Framer Authentication & Monetization Suite',
  description:
    'Own your users, secure your content, and monetize seamlessly in Framer. Powered by Supabase, Stripe, and Polar.sh. Zero vendor lock-in, enterprise-grade Row Level Security (RLS), and 30+ drag-and-drop Framer canvas components.',
  keywords: [
    'Qube Auth',
    'Framer authentication',
    'Framer plugin',
    'Supabase Framer',
    'Stripe Framer paywall',
    'Polar.sh Framer',
    'Framer login component',
    'Framer membership site',
    'Framer passkeys',
    'Framer WebAuthn',
    'Qubtic Technologies',
    'Row Level Security',
    'PostgreSQL Framer',
  ],
  alternates: {
    canonical: 'https://qubtic.tech/framer/qube-auth',
  },
  openGraph: {
    title: 'Qube Auth by Qubtic | The Complete Framer Authentication & Monetization Suite',
    description:
      'Own your users, secure your content, and monetize seamlessly in Framer. Powered by Supabase, Stripe, and Polar.sh. Zero vendor lock-in and 30+ drag-and-drop components.',
    url: 'https://qubtic.tech/framer/qube-auth',
    siteName: 'Qubtic',
    type: 'website',
    images: [
      {
        url: '/images/qube-auth/qube-auth-banner.png',
        alt: 'Qube Auth - Secure Your Framer Website by Qubtic',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qube Auth by Qubtic | The Complete Framer Authentication & Monetization Suite',
    description:
      'Own your users, secure your content, and monetize seamlessly in Framer. Powered by Supabase, Stripe, and Polar.sh.',
    images: ['/images/qube-auth/qube-auth-banner.png'],
    creator: '@qubtic',
  },
};

export default function QubeAuthProductPage() {
  return <QubeAuthLandingPage />;
}
