import { Suspense } from 'react';
import type { Metadata } from 'next';
import QubticFramerAuthPortal from '@/components/framer/auth/QubticFramerAuthPortal';
import { TechLoader } from '@/components/ui/TechLoader';

export const metadata: Metadata = {
  title: 'Qubtic Auth — Unified Authentication for Framer Plugins',
  description:
    'Secure external authentication, database sync, and user access for Qubtic Framer plugins including Qube Auth and Frame Drop.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070D09] flex items-center justify-center">
          <TechLoader size="md" text="Loading Qubtic Auth Portal..." />
        </div>
      }
    >
      <QubticFramerAuthPortal />
    </Suspense>
  );
}
