import type { Metadata } from 'next';
import FramerAuthBridgeSimulator from '@/components/framer/auth/FramerAuthBridgeSimulator';

export const metadata: Metadata = {
  title: 'Framer Plugin Auth Bridge & Simulator — Qubtic',
  description:
    'Test external authentication handshakes for Framer Marketplace plugins with live cross-window postMessage inspection.',
};

export default function FramerAuthBridgePage() {
  return (
    <div className="min-h-screen bg-[#070D09] text-white pt-28 sm:pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
      <FramerAuthBridgeSimulator />
    </div>
  );
}
