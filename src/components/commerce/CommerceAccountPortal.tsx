"use client";
import QubticFramerAuthPortal from '@/components/framer/auth/QubticFramerAuthPortal';
/** Browser account verification follows the Qubtic pairing journey without accepting legacy plan flags. */
export function CommerceAccountPortal() {
  return <QubticFramerAuthPortal initialPlugin="whatsapp-commerce" />;
}
