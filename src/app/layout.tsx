import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ExperienceLayer } from '@/components/layout/ExperienceLayer';
import { PageTransition } from '@/components/layout/PageTransition';
import { SitePreloader } from '@/components/layout/SitePreloader';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
});

export const metadata: Metadata = {
  title: {
    template: '%s | qubtic',
    default: 'qubtic - Digital IT Solutions & Product Studio',
  },
  description:
    'qubtic provides world-class web development, custom SaaS product engineering, Shopify applications, and Framer design solutions.',
  keywords: [
    'Web Development',
    'SaaS Development',
    'Shopify Apps',
    'Framer Plugins',
    'IT Solutions',
    'qubtic',
  ],
  authors: [{ name: 'qubtic' }],
  metadataBase: new URL('https://qubtic.tech'),
  openGraph: {
    title: 'qubtic - Digital IT Solutions & Product Studio',
    description:
      'We build and scale digital products: Websites, SaaS Platforms, Shopify Apps, and Framer Sites.',
    url: 'https://qubtic.tech',
    siteName: 'qubtic',
    images: [
      {
        url: '/images/hero-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'qubtic Digital Studio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qubtic - Digital IT Solutions & Product Studio',
    description:
      'We build and scale digital products: Websites, SaaS Platforms, Shopify Apps, and Framer Sites.',
    images: ['/images/hero-banner.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.png?v=3', type: 'image/png' },
      { url: '/apple-icon.png?v=3', type: 'image/png' },
    ],
    shortcut: ['/favicon.png?v=3'],
    apple: [
      { url: '/apple-icon.png?v=3', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png?v=3" type="image/png" sizes="any" />
        <link rel="icon" href="/apple-icon.png?v=3" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png?v=3" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=3" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Quibtic',
              url: 'https://quibtic.com',
              logo: 'https://quibtic.com/images/brand/qubtic-green.png',
              sameAs: [
                'https://twitter.com/quibtic',
                'https://linkedin.com/company/quibtic',
                'https://github.com/quibtic',
              ],
            }),
          }}
        />
      </head>
      <body
        className="min-h-screen bg-[#F4EFE6] warm-ambient-bg text-[#141915] flex flex-col antialiased selection:bg-[#0C3823] selection:text-white"
        suppressHydrationWarning
      >
        <SitePreloader />
        <ExperienceLayer />
        <Navbar />
        <PageTransition>{children}</PageTransition>
        <Footer />
      </body>
    </html>
  );
}
