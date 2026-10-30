import { Suspense } from 'react';
import type { Metadata } from 'next';
import QubticFramerAuthPortal from '@/components/framer/auth/QubticFramerAuthPortal';
export const metadata: Metadata = { title: 'Sign In to WhatsApp Commerce — Qubtic Auth for Framer', robots: { index: false, follow: false } };
export default function Page() {
  return <Suspense fallback={<p role="status">Loading WhatsApp Commerce sign-in…</p>}><QubticFramerAuthPortal initialPlugin="whatsapp-commerce" /></Suspense>;
}
