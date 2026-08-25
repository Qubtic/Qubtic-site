import type { Metadata, Viewport } from 'next';
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

export const viewport: Viewport = {
  themeColor: '#00381F',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: '%s | Qubtic Digital Product Studio',
    default: 'Qubtic | Premier Digital Product Studio & Software Engineering',
  },
  description:
    'Qubtic is an engineering-first digital product studio building high-performance web applications, scalable SaaS platforms, custom Shopify apps, and bespoke Framer experiences.',
  keywords: [
    'Qubtic',
    'Qubtic Studio',
    'Qubtic Tech',
    'qubtic.tech',
    'Qubtic Digital Product Studio',
    'Qubtic Web Development',
    'Qubtic SaaS Engineering',
    'Digital Product Studio',
    'Software Engineering Agency',
    'Qubtic Development Agency',
    'SaaS Platform Development',
    'Custom Web Applications',
    'Shopify App Developers',
    'Framer Design Studio',
    'Full-Stack Architecture',
    'Modern Web Engineering',
  ],
  authors: [{ name: 'Qubtic', url: 'https://qubtic.tech' }],
  creator: 'Qubtic',
  publisher: 'Qubtic Digital Product Studio',
  category: 'technology',
  metadataBase: new URL('https://qubtic.tech'),
  alternates: {
    canonical: 'https://qubtic.tech',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Qubtic | Premier Digital Product Studio & Software Engineering',
    description:
      'We design, architect, and engineer mission-critical digital products: High-Performance Web Applications, Custom SaaS Platforms, Shopify Apps, and Framer Experiences.',
    url: 'https://qubtic.tech',
    siteName: 'Qubtic',
    images: [
      {
        url: '/images/hero-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Qubtic Digital Product Studio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qubtic | Premier Digital Product Studio & Software Engineering',
    description:
      'We design, architect, and engineer mission-critical digital products: High-Performance Web Applications, Custom SaaS Platforms, Shopify Apps, and Framer Experiences.',
    images: ['/images/hero-banner.jpg'],
    creator: '@qubtic',
    site: '@qubtic',
  },
  icons: {
    icon: [
      { url: '/favicon.png?v=4', type: 'image/png' },
      { url: '/apple-icon.png?v=4', type: 'image/png' },
    ],
    shortcut: ['/favicon.png?v=4'],
    apple: [
      { url: '/apple-icon.png?v=4', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'ProfessionalService'],
        '@id': 'https://qubtic.tech/#organization',
        name: 'Qubtic',
        legalName: 'Qubtic Digital Product Studio',
        alternateName: [
          'Qubtic Studio',
          'Qubtic Tech',
          'Qubtic Digital Product Studio',
          'qubtic.tech',
        ],
        url: 'https://qubtic.tech',
        logo: {
          '@type': 'ImageObject',
          url: 'https://qubtic.tech/images/brand/qubtic-green.png',
          width: 1672,
          height: 941,
        },
        image: 'https://qubtic.tech/images/brand/qubtic-icon.png',
        description:
          'Qubtic is a premier digital product studio combining strategy, design, and senior engineering to build mission-critical digital experiences.',
        email: 'hello@qubtic.tech',
        priceRange: '$$$',
        areaServed: 'Worldwide',
        sameAs: [
          'https://twitter.com/qubtic',
          'https://linkedin.com/company/qubtic',
          'https://github.com/qubtic',
          'https://instagram.com/qubtic',
          'https://facebook.com/qubtic',
        ],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            email: 'hello@qubtic.tech',
            contactType: 'customer service & project discovery',
            availableLanguage: ['English'],
          },
        ],
        knowsAbout: [
          'Web Application Development',
          'SaaS Product Engineering',
          'Next.js & React Frameworks',
          'Shopify App Development',
          'Framer Design & Development',
          'Cloud Architecture & DevOps',
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Qubtic Engineering Services',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Custom Web Application Development',
                url: 'https://qubtic.tech/services/web-development',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'SaaS Product Engineering',
                url: 'https://qubtic.tech/services/saas-development',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Shopify Apps & Store Engineering',
                url: 'https://qubtic.tech/services/shopify-apps',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Framer Development & Interactive Experiences',
                url: 'https://qubtic.tech/services/framer-development',
              },
            },
          ],
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://qubtic.tech/#website',
        url: 'https://qubtic.tech',
        name: 'Qubtic',
        description: 'Premier Digital Product Studio & Software Engineering',
        publisher: {
          '@id': 'https://qubtic.tech/#organization',
        },
      },
    ],
  };

  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png?v=4" type="image/png" sizes="any" />
        <link rel="icon" href="/apple-icon.png?v=4" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png?v=4" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=4" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
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
