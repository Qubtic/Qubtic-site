import { Suspense } from 'react';
import type { Metadata } from 'next';
import QubticFramerAuthPortal from '@/components/framer/auth/QubticFramerAuthPortal';
import { TechLoader } from '@/components/ui/TechLoader';

export const metadata: Metadata = {
  title: 'Framer Plugin Authentication — Qubtic Ecosystem',
  description: 'External authentication gateway for Framer marketplace plugins.',
  robots: { index: false, follow: false },
};

export default function FramerAuthAliasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070D09] flex items-center justify-center">
          <TechLoader size="md" text="Loading Framer Authentication..." />
        </div>
      }
    >
      <QubticFramerAuthPortal />
    </Suspense>
  );
}
