import { Suspense } from 'react';
import type { Metadata } from 'next';
import QubticFramerAuthPortal from '@/components/framer/auth/QubticFramerAuthPortal';
export const metadata: Metadata = { title: 'Sign In to Telegram Commerce — Qubtic Auth for Framer', robots: { index: false, follow: false } };
export default function Page() {
  return <Suspense fallback={<p role="status">Loading Telegram Commerce sign-in…</p>}><QubticFramerAuthPortal initialPlugin="telegram-commerce" /></Suspense>;
}
