import type { Metadata } from 'next';
import { FrameDropDocsLayout } from '@/components/framer/FrameDropDocsLayout';

export const metadata: Metadata = {
  title: 'Frame Drop Documentation | Qubtic Technologies',
  description:
    'Complete documentation, component reference, and design token guides for Frame Drop for Framer by Qubtic.',
  alternates: {
    canonical: 'https://qubtic.tech/framer/frame-drop/docs',
  },
};

export default function FrameDropDocAliasPage() {
  return <FrameDropDocsLayout />;
}
