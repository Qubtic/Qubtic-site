export const mainNavLinks = [
  { label: 'Home', href: '/' },
  { 
    label: 'Product', 
    href: '/framer/frame-drop',
    subItems: [
      { label: 'Qube Auth', href: '/framer/qube-auth', badge: 'v1.0.0 New' },
      { label: 'Frame Drop', href: '/framer/frame-drop', badge: 'v0.2.1' },
      { label: 'Qube Auth Docs', href: '/framer/qube-auth/docs' },
      { label: 'Frame Drop Docs', href: '/framer/frame-drop/docs' },
      { label: 'Component Catalog', href: '/framer/qube-auth#components' },
      { label: 'Feature Request', href: '/feature-request' }
    ]
  },
  { label: 'Services', href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' }
];

export const footerLinks = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' }
  ],
  services: [
    { label: 'Web Development', href: '/services/web-development' },
    { label: 'SaaS Development', href: '/services/saas-development' },
    { label: 'Shopify Apps', href: '/services/shopify-apps' },
    { label: 'Framer Development', href: '/services/framer-development' },
    { label: 'Qube Auth (Framer Suite)', href: '/framer/qube-auth' },
    { label: 'Frame Drop (Framer Plugin)', href: '/framer/frame-drop/docs' },
    { label: 'Feature Request', href: '/feature-request' }
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms-of-service' }
  ],
  contact: [
    { label: 'hello@qubtic.tech', href: 'mailto:hello@qubtic.tech' },
    { label: '+1 (555) 123-4567', href: 'tel:+15551234567' },
    { label: 'Remote-first, Worldwide', href: '#' }
  ]
};
