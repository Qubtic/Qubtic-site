import { Suspense } from 'react';
import type { Metadata } from 'next';
import QubticFramerAuthPortal from '@/components/framer/auth/QubticFramerAuthPortal';
import { TechLoader } from '@/components/ui/TechLoader';
import { getPluginMetadata } from '@/lib/plugins-registry';

interface AuthPluginPageProps {
  params: Promise<{
    plugin: string;
  }>;
}

export async function generateMetadata({ params }: AuthPluginPageProps): Promise<Metadata> {
  const { plugin: rawSlug } = await params;
  const meta = getPluginMetadata(rawSlug);

  return {
    title: `Sign In to ${meta.name} — Qubtic Auth for Framer`,
    description: `Authenticate your account for ${meta.name} directly within the Framer ecosystem. Powered by Qubtic and Supabase.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AuthPluginPage({ params }: AuthPluginPageProps) {
  const { plugin: rawSlug } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070D09] flex items-center justify-center">
          <TechLoader size="md" text="Loading Plugin Auth Portal..." />
        </div>
      }
    >
      <QubticFramerAuthPortal initialPlugin={rawSlug} />
    </Suspense>
  );
}
