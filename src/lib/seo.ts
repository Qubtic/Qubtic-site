type JsonLdType = 'Organization' | 'WebSite' | 'Service' | 'BlogPosting' | 'FAQPage';

export function generateJsonLdString(type: JsonLdType, data: Record<string, unknown>): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return JSON.stringify(schema);
}

export const defaultOrganizationJsonLd = generateJsonLdString('Organization', {
  name: 'qubtic',
  url: 'https://qubtic.com',
  logo: 'https://qubtic.com/logo.png',
  description:
    'qubtic is a full-service IT solutions company specializing in custom web development, SaaS products, Shopify apps, and Framer websites.',
  sameAs: [
    'https://twitter.com/qubtic',
    'https://github.com/qubtic',
    'https://linkedin.com/company/qubtic',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-555-123-4567',
    contactType: 'customer service',
    email: 'hello@qubtic.tech',
    availableLanguage: 'English',
  },
});
