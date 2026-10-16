import type { Metadata } from 'next';
import { QubeAuthDocsLayout } from '@/components/framer/qube-auth/QubeAuthDocsLayout';

export const metadata: Metadata = {
  title: 'Qube Auth Documentation | Supabase & Stripe Setup Guide for Framer',
  description:
    'Comprehensive setup guide, PostgreSQL RLS schemas, Stripe webhooks, and 30+ canvas component API reference for Qube Auth by Qubtic.',
  keywords: [
    'Qube Auth documentation',
    'Framer Supabase setup',
    'Framer Stripe webhooks',
    'Framer Row Level Security',
    'Qube Auth SQL schema',
    'Framer paywall component',
    'Framer passkey setup',
  ],
  alternates: {
    canonical: 'https://qubtic.tech/framer/qube-auth/docs',
  },
  openGraph: {
    title: 'Qube Auth Documentation | Supabase & Stripe Setup Guide for Framer',
    description:
      'Comprehensive setup guide, PostgreSQL RLS schemas, Stripe webhooks, and 30+ canvas component API reference for Qube Auth by Qubtic.',
    url: 'https://qubtic.tech/framer/qube-auth/docs',
    siteName: 'Qubtic',
    type: 'website',
    images: [
      {
        url: '/images/qube-auth/qube-auth-banner.png',
        width: 1024,
        height: 550,
        alt: 'Qube Auth Documentation by Qubtic',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qube Auth Documentation | Supabase & Stripe Setup Guide for Framer',
    description:
      'Comprehensive setup guide, PostgreSQL RLS schemas, Stripe webhooks, and 30+ canvas component API reference for Qube Auth by Qubtic.',
    images: ['/images/qube-auth/qube-auth-banner.png'],
    creator: '@qubtic',
  },
};

export default function QubeAuthDocsPage() {
  return <QubeAuthDocsLayout />;
}
