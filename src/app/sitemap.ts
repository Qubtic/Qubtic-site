import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://qubtic.com';

  const staticPages = [
    '',
    '/about',
    '/pricing',
    '/contact',
    '/blog',
    '/portfolio',
    '/privacy-policy',
    '/terms-of-service',
  ];

  const servicePages = [
    '/services/web-development',
    '/services/saas-development',
    '/services/shopify-apps',
    '/services/framer-development',
  ];

  // In a real app, you would fetch these dynamically from a CMS or database
  const blogSlugs = [
    'why-nextjs-is-best-for-business',
    'how-to-build-successful-saas',
    'top-10-shopify-apps',
    'framer-vs-webflow',
    'web-performance-optimization-guide'
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [
    ...staticPages.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency: (route === '' ? 'weekly' : 'monthly') as any,
      priority: route === '' ? 1.0 : 0.8,
    })),
    ...servicePages.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as any,
      priority: 0.9,
    })),
    ...blogSlugs.map((slug) => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as any,
      priority: 0.7,
    })),
  ];

  return sitemapEntries;
}
