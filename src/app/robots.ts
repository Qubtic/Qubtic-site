import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/admin', '/portfolio/admin'],
      },
    ],
    sitemap: 'https://qubtic.tech/sitemap.xml',
    host: 'https://qubtic.tech',
  };
}
