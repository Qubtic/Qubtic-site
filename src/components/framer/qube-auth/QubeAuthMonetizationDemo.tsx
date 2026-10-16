'use client';

import * as React from 'react';
import { 
  CreditCard, 
  Check, 
  Lock, 
  Unlock, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  FileText 
} from 'lucide-react';

type MemberState = 'signed-out' | 'free' | 'pro';

export function QubeAuthMonetizationDemo() {
  const [provider, setProvider] = React.useState<'stripe' | 'polar'>('stripe');
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'annual'>('annual');
  const [memberState, setMemberState] = React.useState<MemberState>('signed-out');
  const [isCheckingAccess, setIsCheckingAccess] = React.useState(false);
  const [accessCheckedMessage, setAccessCheckedMessage] = React.useState<string | null>(null);

  const handleRecheckAccess = () => {
    setIsCheckingAccess(true);
    setAccessCheckedMessage(null);
    setTimeout(() => {
      setIsCheckingAccess(false);
      if (memberState === 'pro') {
        setAccessCheckedMessage('✓ Verified with Supabase subscriptions table: Active Pro tier confirmed!');
      } else if (memberState === 'free') {
        setAccessCheckedMessage('ℹ User found, but active subscription required. Presenting upgrade card.');
      } else {
        setAccessCheckedMessage('⚠ No active session found. Presenting sign-in & subscription card.');
      }
    }, 600);
  };

  const pricingTiers = [
    {
      name: 'Starter Tier',
      monthlyPrice: '$19',
      annualPrice: '$15',
      desc: 'Ideal for independent creators, newsletter gating, and personal tools.',
      features: [
        'Single Framer site license',
        'Standard Email & Magic Links',
        'Basic member profile dashboard',
        'Community support',
        'Stripe / Polar checkout trigger',
      ],
      popular: false,
      cta: provider === 'stripe' ? 'Start with Stripe' : 'Start with Polar',
    },
    {
      name: 'Pro Member',
      monthlyPrice: '$49',
      annualPrice: '$39',
      desc: 'Engineered for revenue-generating SaaS applications and digital studios.',
      features: [
        'Unlimited paid members',
        'Biometric WebAuthn Passkeys',
        'Dual Paywall Guards (Canvas & Page)',
        'Self-service customer billing portal',
        'Priority Slack & GitHub support',
        'Prefill email passing to checkout',
      ],
      popular: true,
      cta: provider === 'stripe' ? 'Subscribe with Stripe' : 'Checkout via Polar Modal',
    },
    {
      name: 'Enterprise',
      monthlyPrice: '$149',
      annualPrice: '$119',
      desc: 'For scaling B2B startups requiring custom domains, SAML SSO, and audit logs.',
      features: [
        'Corporate SAML 2.0 SSO (Okta, Azure)',
        'Two-factor MFA / TOTP challenges',
        'Multiple payment gateway fallbacks',
        'Custom Supabase Auth domains',
        'Dedicated onboarding engineer',
        'Custom RLS security review',
      ],
      popular: false,
      cta: 'Contact Enterprise',
    },
  ];

  return (
    <section id="monetization" className="qube-section">
      <div className="qube-container">
        
        {/* Section Header */}
        <div className="qube-section-header center">
          <span className="qube-section-tag">
            <CreditCard size={14} />
            DUAL MONETIZATION ENGINE
          </span>
          <h2 className="qube-section-title">
            Turn Any Framer Layer <br />
            <span className="qube-text-gradient">Into Paid Recurring Revenue</span>
          </h2>
          <p className="qube-section-desc">
            Effortlessly switch between Stripe and Polar.sh. Drop responsive pricing tables, checkout buttons, and database-backed paywalls directly onto your Framer canvas.
          </p>

          {/* Dual Engine & Billing Cycle Switchers */}
          <div className="qube-monetization-toolbar">
            
            {/* Payment Engine Switcher */}
            <div className="qube-cycle-pill">
              <button
                type="button"
                onClick={() => setProvider('stripe')}
                className={`qube-cycle-btn ${provider === 'stripe' ? 'active' : ''}`}
              >
                Stripe Engine
              </button>
              <button
                type="button"
                onClick={() => setProvider('polar')}
                className={`qube-cycle-btn ${provider === 'polar' ? 'active' : ''}`}
              >
                Polar.sh Engine
              </button>
            </div>

            {/* Monthly / Annual Switcher */}
            <div className="qube-cycle-pill">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`qube-cycle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`qube-cycle-btn ${billingCycle === 'annual' ? 'active' : ''}`}
              >
                <span>Annual Billing</span>
                <span className="qube-cycle-save-badge">
                  Save 20%
                </span>
              </button>
            </div>

          </div>
        </div>

        {/* 3-Tier SaaS Pricing Matrix Cards */}
        <div className="qube-monetization-grid qube-mb-20">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`qube-tier-card ${tier.popular ? 'popular' : ''}`}
            >
              {tier.popular && (
                <div className="qube-tier-badge">
                  Most Popular
                </div>
              )}

              <div>
                <div className="qube-tier-header">
                  <h3 className="qube-tier-name">
                    {tier.name}
                  </h3>
        
                </div>

                <div className="qube-tier-price-row">
                  <span className="qube-tier-price-val">
                    {billingCycle === 'annual' ? tier.annualPrice : tier.monthlyPrice}
                  </span>
                  <span className="qube-tier-price-unit">
                    / user / month
                  </span>
                </div>

                <p className="qube-card-desc">
                  {tier.desc}
                </p>

                <div className="qube-tier-divider" />

                <ul className="qube-tier-features">
                  {tier.features.map((feat) => (
                    <li key={feat} className="qube-tier-feature-item">
                      <Check size={16} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                className={`qube-tier-cta-btn ${tier.popular ? 'primary' : 'secondary'}`}
              >
                <span>{tier.cta}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* LIVE PAYWALL GUARD DEMO SECTION */}
        <div className="qube-paywall-box">
          <div className="qube-section-header">
            <span className="qube-section-tag">
              <ShieldCheck size={14} />
              INTERACTIVE DEMO: StripePaywallGuard &amp; PolarPaywallGuard
            </span>
            <h3 className="qube-section-title">
              See How Paywall Guards Protect Content
            </h3>
            <p className="qube-section-desc">
              Wrap any Framer layer, frame, or page with <code>PaywallGuard</code>. In real time, the component queries your Supabase <code>subscriptions</code> table. If the member doesn&apos;t meet the tier, the content is securely quarantined.
            </p>
          </div>

          {/* Interactive Member State Simulator Switcher */}
          <div className="qube-paywall-states">
            <span className="qube-callout-tag qube-no-margin">Simulate Visitor State:</span>
            {([
              { id: 'signed-out', label: '1. Anonymous / Signed Out', icon: Lock },
              { id: 'free', label: '2. Free Member (No Subscription)', icon: Zap },
              { id: 'pro', label: '3. Paid Pro Subscriber', icon: Unlock },
            ] as const).map((st) => {
              const Icon = st.icon;
              const isActive = memberState === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setMemberState(st.id);
                    setAccessCheckedMessage(null);
                  }}
                  className={`qube-paywall-state-btn ${isActive ? 'active' : ''}`}
                >
                  <Icon size={14} />
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>

          {/* VIRTUAL PAYWALLED CANVAS AREA */}
          <div className="qube-paywall-stage">
            
            {/* If Member State is PRO: Content is UNLOCKED */}
            {memberState === 'pro' ? (
              <div className="qube-paywall-unlocked">
                <div className="qube-unlocked-icon-badge">
                  <Unlock size={32} />
                </div>
                <span className="qube-section-tag">
                  <Check size={14} /> Access Granted · Pro Member
                </span>
                <h4 className="qube-card-title">
                  🎉 Exclusive Member Content Unlocked!
                </h4>
                <p className="qube-card-desc">
                  This entire Framer canvas section is currently rendering live because your Supabase <code>subscriptions</code> table confirmed an active Pro subscription!
                </p>

                <div className="qube-catalog-header-badge">
                  <FileText size={16} />
                  <span>Private Video Tutorial &amp; Figma Assets Included</span>
                </div>
              </div>
            ) : (
              /* If Member State is NOT Pro: PAYWALL CARD RENDERS */
              <div className="qube-paywall-locked-card">
                <div className="qube-locked-icon-badge">
                  <Lock size={28} />
                </div>
                <span className="qube-callout-tag qube-justify-center">
                  Paywall Guard Active
                </span>
                <h4 className="qube-card-title">
                  {memberState === 'signed-out' ? 'Sign In & Subscribe to Unlock' : 'Upgrade to Pro Tier'}
                </h4>
                <p className="qube-card-desc">
                  {memberState === 'signed-out'
                    ? 'This private section requires an authenticated member account with an active Pro subscription.'
                    : 'Your account is currently on the Free tier. Upgrade to access premium Framer assets & downloads.'}
                </p>

                <div className="qube-btn-stack">
                  <button
                    type="button"
                    className="qube-btn-primary qube-btn-full"
                  >
                    <span>{provider === 'stripe' ? 'Unlock with Stripe ($39/mo)' : 'Unlock with Polar ($39/mo)'}</span>
                    <ArrowRight size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={handleRecheckAccess}
                    disabled={isCheckingAccess}
                    className="qube-btn-secondary qube-btn-full"
                  >
                    <RefreshCw size={14} />
                    <span>Check access again</span>
                  </button>
                </div>

                {accessCheckedMessage && (
                  <p className="qube-workflow-tip qube-mt-4">
                    {accessCheckedMessage}
                  </p>
                )}
              </div>
            )}

          </div>

          {/* Self-Service Portal Feature Callout */}
          <div className="qube-paywall-portal-bar">
            <div className="qube-callout-tag qube-no-margin qube-text-none">
              <span className="qube-pulse-dot" />
              <span>Self-Service Customer Billing Portal included: subscribers update cards &amp; download tax invoices without support.</span>
            </div>
            <div className="qube-tech-pill">
              <code>&lt;StripeCustomerPortalButton /&gt; | &lt;PolarCustomerPortalButton /&gt;</code>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
