import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Our Studio | Qubtic Digital Product Engineering',
  description:
    'Learn about Qubtic Digital Product Studio, our mission, senior engineering philosophy, and track record building scalable web apps and digital products.',
  alternates: {
    canonical: 'https://qubtic.tech/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
