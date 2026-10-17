export interface FramerPluginMetadata {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  version: string;
  logo: string;
  accentColor: string;
  glowColor: string;
  badge: string;
  docsUrl: string;
  productUrl: string;
  features: string[];
  scopes: { id: string; label: string; description: string }[];
}

export const REGISTERED_PLUGINS: Record<string, FramerPluginMetadata> = {
  'qube-auth': {
    slug: 'qube-auth',
    name: 'Qube Auth',
    shortName: 'Qube Auth',
    tagline: 'Framer Authentication & Monetization Suite',
    description: 'Enterprise-grade user auth, Supabase PostgreSQL ownership, and Stripe/Polar paywalls directly in your Framer canvas.',
    version: 'v1.0.0',
    logo: '/images/qube-auth/qube-auth-logo.png',
    accentColor: '#A6FF00',
    glowColor: 'rgba(166, 255, 0, 0.35)',
    badge: 'Verified Plugin',
    docsUrl: '/framer/qube-auth/docs',
    productUrl: '/framer/qube-auth',
    features: [
      'Supabase Database Ownership',
      'Passkeys, WebAuthn & Magic Links',
      'Stripe & Polar Monetization',
      'Row Level Security (RLS)',
    ],
    scopes: [
      { id: 'profile', label: 'Member Profile', description: 'Access to email, display name, and avatar' },
      { id: 'session', label: 'Session Management', description: 'Maintain active session inside Framer editor' },
      { id: 'monetization', label: 'Subscription Status', description: 'Query active Stripe or Polar tier' },
    ],
  },
  'frame-drop': {
    slug: 'frame-drop',
    name: 'Frame Drop',
    shortName: 'Frame Drop',
    tagline: 'Smart Asset & Component Sync for Framer',
    description: 'Instant 1-click cloud sync of high-fidelity vectors, design tokens, and components directly to your Framer canvas.',
    version: 'v1.2.0',
    logo: '/images/brand/frame-drop-logo.png',
    accentColor: '#0066FF',
    glowColor: 'rgba(0, 102, 255, 0.35)',
    badge: 'Official Plugin',
    docsUrl: '/framer/frame-drop',
    productUrl: '/framer/frame-drop',
    features: [
      'Cloud Component Library',
      'Instant Canvas Sync',
      'Design Token Importer',
      'Team Collaboration Hub',
    ],
    scopes: [
      { id: 'profile', label: 'Designer Identity', description: 'Access to designer email and workspace' },
      { id: 'sync', label: 'Cloud Asset Sync', description: 'Save and retrieve custom canvas assets' },
    ],
  },
  'framedrop': {
    slug: 'frame-drop',
    name: 'Frame Drop',
    shortName: 'Frame Drop',
    tagline: 'Smart Asset & Component Sync for Framer',
    description: 'Instant 1-click cloud sync of high-fidelity vectors, design tokens, and components directly to your Framer canvas.',
    version: 'v1.2.0',
    logo: '/images/brand/frame-drop-logo.png',
    accentColor: '#0066FF',
    glowColor: 'rgba(0, 102, 255, 0.35)',
    badge: 'Official Plugin',
    docsUrl: '/framer/frame-drop',
    productUrl: '/framer/frame-drop',
    features: [
      'Cloud Component Library',
      'Instant Canvas Sync',
      'Design Token Importer',
      'Team Collaboration Hub',
    ],
    scopes: [
      { id: 'profile', label: 'Designer Identity', description: 'Access to designer email and workspace' },
      { id: 'sync', label: 'Cloud Asset Sync', description: 'Save and retrieve custom canvas assets' },
    ],
  },
};

/**
 * Returns plugin metadata for a given slug, or creates a clean fallback
 * so future plugins work seamlessly without any manual code updates.
 */
export function getPluginMetadata(rawSlug?: string | null): FramerPluginMetadata {
  let slug = (rawSlug || 'qube-auth').toLowerCase().trim();

  // Normalize aliases so /auth/framedrop, /auth/frame-drop, and /auth/plugin load full metadata cleanly
  if (slug === 'framedrop' || slug === 'plugin' || slug === 'framedrop-auth') {
    slug = 'frame-drop';
  }

  if (Object.prototype.hasOwnProperty.call(REGISTERED_PLUGINS, slug)) {
    return REGISTERED_PLUGINS[slug];
  }

  // Graceful fallback for dynamic / future plugins:
  // e.g. "qube-forms" -> "Qube Forms"
  const formattedName = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    slug,
    name: formattedName || 'Qubtic Framer Plugin',
    shortName: formattedName || 'Plugin',
    tagline: 'Qubtic Ecosystem Plugin for Framer',
    description: `Authentication and external backend services for ${formattedName} in the Framer Marketplace.`,
    version: 'v1.0.0',
    logo: '/images/qube-auth/qube-auth-logo.png',
    accentColor: '#A6FF00',
    glowColor: 'rgba(166, 255, 0, 0.35)',
    badge: 'Qubtic Plugin',
    docsUrl: `/framer/${slug}`,
    productUrl: `/framer/${slug}`,
    features: [
      'Unified Qubtic Identity',
      'Enterprise-Grade Backend',
      'Automated Session Handshake',
    ],
    scopes: [
      { id: 'profile', label: 'User Profile', description: 'Access to user email and account identity' },
      { id: 'session', label: 'Plugin Session', description: 'Establish secure connection to Framer editor' },
    ],
  };
}
