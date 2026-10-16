'use client';

import * as React from 'react';
import { 
  Search, 
  Layers, 
  Lock, 
  CreditCard, 
  Globe, 
  Sparkles, 
  Check, 
  Copy, 
  ShieldCheck, 
  SlidersHorizontal,
  Fingerprint,
  Users
} from 'lucide-react';

interface ComponentSpec {
  category: 'Forms' | 'Social' | 'Payments' | 'Fields' | 'User' | 'Security';
  name: string;
  exportId: string;
  tier: 'Free' | 'Pro';
  desc: string;
  propsPreview: string;
}

export function QubeAuthComponentCatalog() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
  const [selectedTier, setSelectedTier] = React.useState<string>('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const components: ComponentSpec[] = [
    // Forms
    {
      category: 'Forms',
      name: 'Tabbed Auth Form',
      exportId: 'AuthForm',
      tier: 'Free',
      desc: 'Unified Sign In, Sign Up, and Social OAuth switcher with animated tab transitions.',
      propsPreview: '<AuthForm preset="qubtic-emerald" allowPasskeys={true} redirectTo="/dashboard" />',
    },
    {
      category: 'Forms',
      name: 'Sign-In Form',
      exportId: 'SignInForm',
      tier: 'Free',
      desc: 'Credentials login with email, password, remember-me checkbox, and recovery links.',
      propsPreview: '<SignInForm onSignInSuccess={(user) => console.log(user)} />',
    },
    {
      category: 'Forms',
      name: 'Sign-Up Form',
      exportId: 'SignUpForm',
      tier: 'Free',
      desc: 'Account registration with full name, password confirmation, and terms agreement.',
      propsPreview: '<SignUpForm requireTerms={true} termsUrl="/terms" />',
    },
    {
      category: 'Forms',
      name: 'Magic Link Form',
      exportId: 'MagicLinkForm',
      tier: 'Free',
      desc: 'One-click passwordless email login dispatched directly to user inbox.',
      propsPreview: '<MagicLinkForm buttonText="Send Magic Link" />',
    },
    {
      category: 'Forms',
      name: '6-Digit Email OTP Form',
      exportId: 'EmailOtpForm',
      tier: 'Pro',
      desc: 'Direct in-place email passcode verification without leaving the Framer page.',
      propsPreview: '<EmailOtpForm autoSubmit={true} onOtpVerified={() => navigate("/dashboard")} />',
    },
    {
      category: 'Forms',
      name: 'Phone SMS OTP Form',
      exportId: 'PhoneAuthForm',
      tier: 'Pro',
      desc: 'Mobile phone input with country prefix and instant SMS passcode verification.',
      propsPreview: '<PhoneAuthForm defaultCountry="US" />',
    },
    {
      category: 'Forms',
      name: 'Enterprise SAML SSO',
      exportId: 'EnterpriseSsoForm',
      tier: 'Pro',
      desc: 'Corporate domain Single Sign-On compatible with Okta, Azure AD, and Google Workspace.',
      propsPreview: '<EnterpriseSsoForm domainDetection={true} />',
    },
    {
      category: 'Forms',
      name: 'TOTP 2FA Verification',
      exportId: 'MfaVerifyForm',
      tier: 'Pro',
      desc: 'Time-based authenticator challenge supporting Google Authenticator, 1Password, and Authy.',
      propsPreview: '<MfaVerifyForm challengeType="totp" />',
    },

    // Social & Passkeys
    {
      category: 'Social',
      name: 'Passkey Sign-in Button',
      exportId: 'PasskeySignInButton',
      tier: 'Pro',
      desc: 'Biometric WebAuthn (Touch ID, Face ID, Windows Hello) one-tap passwordless login.',
      propsPreview: '<PasskeySignInButton label="Sign in with Face ID" />',
    },
    {
      category: 'Social',
      name: 'Google Sign-in',
      exportId: 'GoogleSignInButton',
      tier: 'Free',
      desc: 'Official branded Google OAuth 2.0 PKCE sign-in button.',
      propsPreview: '<GoogleSignInButton variant="filled" />',
    },
    {
      category: 'Social',
      name: 'GitHub Sign-in',
      exportId: 'GitHubSignInButton',
      tier: 'Free',
      desc: 'Developer-focused GitHub OAuth button with authentic vector mark.',
      propsPreview: '<GitHubSignInButton scopes={["read:user"]} />',
    },
    {
      category: 'Social',
      name: 'Apple Sign-in',
      exportId: 'AppleSignInButton',
      tier: 'Pro',
      desc: 'Official Apple ID sign-in with clean dark and light design variants.',
      propsPreview: '<AppleSignInButton theme="black" />',
    },
    {
      category: 'Social',
      name: 'Microsoft Sign-in',
      exportId: 'MicrosoftSignInButton',
      tier: 'Pro',
      desc: 'Microsoft 365 and Azure AD enterprise sign-in button.',
      propsPreview: '<MicrosoftSignInButton tenant="common" />',
    },
    {
      category: 'Social',
      name: 'LinkedIn Sign-in',
      exportId: 'LinkedInSignInButton',
      tier: 'Pro',
      desc: 'B2B professional network sign-in for creator and agency apps.',
      propsPreview: '<LinkedInSignInButton />',
    },
    {
      category: 'Social',
      name: 'Slack Sign-in',
      exportId: 'SlackSignInButton',
      tier: 'Pro',
      desc: 'Workplace collaboration team sign-in for internal company portals.',
      propsPreview: '<SlackSignInButton />',
    },

    // Payments & Monetization
    {
      category: 'Payments',
      name: 'Stripe Pricing Table',
      exportId: 'StripePricingTable',
      tier: 'Pro',
      desc: '3-tier SaaS responsive pricing table with Monthly/Annual switcher and discount badges.',
      propsPreview: '<StripePricingTable highlightTier="pro" defaultCycle="annual" />',
    },
    {
      category: 'Payments',
      name: 'Stripe Checkout Button',
      exportId: 'StripeCheckoutButton',
      tier: 'Pro',
      desc: 'High-converting Stripe payment trigger supporting Hosted, Redirect, or New Tab.',
      propsPreview: '<StripeCheckoutButton priceId="price_1N..." prefillEmail={true} />',
    },
    {
      category: 'Payments',
      name: 'Stripe Billing Portal',
      exportId: 'StripeCustomerPortalButton',
      tier: 'Pro',
      desc: 'Self-service card management, plan upgrading, and VAT/GST tax invoice downloads.',
      propsPreview: '<StripeCustomerPortalButton label="Manage Subscription" />',
    },
    {
      category: 'Payments',
      name: 'Stripe Paywall Guard',
      exportId: 'StripePaywallGuard',
      tier: 'Pro',
      desc: 'Gated content wrapper querying Supabase subscriptions table in real time.',
      propsPreview: '<StripePaywallGuard requiredTier="pro"><SecretContent /></StripePaywallGuard>',
    },
    {
      category: 'Payments',
      name: 'Polar Pricing Table',
      exportId: 'PolarPricingTable',
      tier: 'Pro',
      desc: 'Complete 3-tier SaaS pricing table with Polar modal overlay checkout.',
      propsPreview: '<PolarPricingTable organization="acme" />',
    },
    {
      category: 'Payments',
      name: 'Polar Checkout Button',
      exportId: 'PolarCheckoutButton',
      tier: 'Pro',
      desc: 'High-converting Polar modal or redirect checkout button for digital goods.',
      propsPreview: '<PolarCheckoutButton productId="prod_..." embed="modal" />',
    },
    {
      category: 'Payments',
      name: 'Polar Billing Portal',
      exportId: 'PolarCustomerPortalButton',
      tier: 'Pro',
      desc: 'Polar self-service subscription hub for invoice history and plan upgrades.',
      propsPreview: '<PolarCustomerPortalButton />',
    },
    {
      category: 'Payments',
      name: 'Polar Paywall Guard',
      exportId: 'PolarPaywallGuard',
      tier: 'Pro',
      desc: 'Subscription-gated canvas layer wrapper linked to Polar customer record.',
      propsPreview: '<PolarPaywallGuard><PremiumComponent /></PolarPaywallGuard>',
    },

    // Fields & Modular UI
    {
      category: 'Fields',
      name: '4/6-Digit OTP PIN Input',
      exportId: 'OtpInput',
      tier: 'Free',
      desc: 'Auto-advancing numeric verification boxes with arrow keys, backspace, and paste support.',
      propsPreview: '<OtpInput length={6} onComplete={(code) => verify(code)} />',
    },
    {
      category: 'Fields',
      name: 'Password Input',
      exportId: 'PasswordInput',
      tier: 'Free',
      desc: 'Modular password input box with interactive eye show/hide toggle.',
      propsPreview: '<PasswordInput placeholder="Enter secure password" />',
    },

    // User & Session
    {
      category: 'User',
      name: 'User Profile Menu',
      exportId: 'UserProfileMenu',
      tier: 'Free',
      desc: 'Avatar dropdown menu with member details, role badge, and one-click sign out.',
      propsPreview: '<UserProfileMenu showAvatar={true} onSignOut={() => router.push("/")} />',
    },
    {
      category: 'User',
      name: 'Auth Status Pill',
      exportId: 'AuthStatus',
      tier: 'Free',
      desc: 'Live visual indicator of authentication state (Signed In / Signed Out / Pro).',
      propsPreview: '<AuthStatus showRole={true} />',
    },

    // Security
    {
      category: 'Security',
      name: 'Route Auth Guard',
      exportId: 'AuthGuard',
      tier: 'Pro',
      desc: 'Protected route gate with automated redirects for unauthorized visitors.',
      propsPreview: '<AuthGuard redirectTo="/signin"><DashboardView /></AuthGuard>',
    },
  ];

  const filteredComponents = components.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesTier = selectedTier === 'All' || item.tier === selectedTier;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.exportId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesTier && matchesSearch;
  });

  const handleCopyExport = (exportId: string, props: string) => {
    navigator.clipboard.writeText(props);
    setCopiedId(exportId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="components" className="py-20 lg:py-28 relative bg-[#070D09] text-white overflow-hidden">
      {/* Background accents */}
      <div className="pointer-events-none absolute -left-48 top-1/3 h-96 w-96 rounded-full bg-[#164E33]/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-48 bottom-1/4 h-96 w-96 rounded-full bg-[#A6FF00]/10 blur-3xl" />

      <div className="qube-container">
        
        {/* Section Header */}
        <div className="qube-section-header">
          <span className="qube-section-tag">
            <Layers size={14} />
            CANVAS ASSET INVENTORY
          </span>
          <h2 className="qube-section-title">
            30+ Drag-and-Drop <br />
            <span className="qube-text-gradient">Canvas Components</span>
          </h2>
          <p className="qube-section-desc">
            Compiled into a single, zero-dependency <code>Qube-Auth.tsx</code> file directly inside your Framer project&apos;s code panel.
          </p>

          <div className="qube-catalog-header-badge">
            <span className="qube-pulse-dot" />
            <span>Zero Runtime Dependencies · Pure React</span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="qube-catalog-filter-bar">
          
          {/* Category Chips */}
          <div className="qube-catalog-tabs">
            {['All', 'Forms', 'Social', 'Payments', 'Fields', 'User', 'Security'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`qube-catalog-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input & Tier Filter */}
          <div className="qube-catalog-search-group">
            <div className="qube-catalog-search-wrapper">
              <Search size={14} className="qube-catalog-search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 30+ components..."
                className="qube-catalog-search-input"
              />
            </div>

            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="qube-catalog-select"
            >
              <option value="All">All Tiers</option>
              <option value="Free">Free Only</option>
              <option value="Pro">Pro Only</option>
            </select>
          </div>

        </div>

        {/* Component Grid */}
        <div className="qube-catalog-grid">
          {filteredComponents.map((comp) => {
            const isCopied = copiedId === comp.exportId;
            return (
              <div
                key={comp.exportId}
                className="qube-catalog-card"
              >
                <div>
                  <div className="qube-catalog-card-header">
                    <span className="qube-catalog-category-tag">
                      {comp.category}
                    </span>
                    <span className={`qube-catalog-tier-badge ${comp.tier === 'Pro' ? 'pro' : 'free'}`}>
                      {comp.tier} Tier
                    </span>
                  </div>

                  <h3 className="qube-card-title">
                    {comp.name}
                  </h3>

                  <div className="qube-catalog-code-snippet">
                    <code>
                      &lt;{comp.exportId} /&gt;
                    </code>
                  </div>

                  <p className="qube-card-desc">
                    {comp.desc}
                  </p>
                </div>

                <div className="qube-catalog-card-footer">
                  <span className="qube-catalog-lang-tag">Framer JSX</span>
                  <button
                    type="button"
                    onClick={() => handleCopyExport(comp.exportId, comp.propsPreview)}
                    className="qube-catalog-copy-btn"
                  >
                    {isCopied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{isCopied ? 'Code Copied' : 'Copy JSX'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredComponents.length === 0 && (
          <div className="qube-catalog-empty">
            <p>No components match your search criteria.</p>
          </div>
        )}

      </div>
    </section>
  );
}
