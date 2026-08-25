import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Start a Project with Qubtic',
  description:
    'Start a conversation with Qubtic. Request a custom quote, technical consultation, or schedule an instant 20-minute scoping call directly with our solutions team.',
  alternates: {
    canonical: 'https://qubtic.tech/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
