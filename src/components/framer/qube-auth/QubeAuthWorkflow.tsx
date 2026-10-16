'use client';

import * as React from 'react';
import { 
  Database, 
  Compass, 
  CreditCard, 
  FileCode2, 
  Layers, 
  ArrowRight, 
  Copy, 
  Check, 
  Sparkles,
  Zap
} from 'lucide-react';

export function QubeAuthWorkflow() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [copiedCode, setCopiedCode] = React.useState(false);

  const steps = [
    {
      num: '01',
      title: 'Connect Supabase in 1 Click',
      icon: Database,
      tag: '60 Seconds Setup',
      summary: 'Link your own PostgreSQL database with zero vendor lock-in.',
      detail:
        'Open the Qube Auth plugin inside Framer, enter your HTTPS Supabase Project URL and your client-safe Publishable Key (or legacy anon key). Click Test Connection to validate endpoints in real time. We never request service-role secret keys.',
      codeTitle: 'Supabase Safe Client Credentials',
      code: `// Qube Auth connects directly to your Supabase instance:
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// Zero proxy servers. Zero middleware. 100% direct PostgreSQL RLS.`,
      tip: 'Strict browser safety: Never enter service-role secret keys or DB master passwords in client-side code.',
    },
    {
      num: '02',
      title: 'Configure Smart Routes',
      icon: Compass,
      tag: 'Client-Side Routing',
      summary: 'Define where users go when they sign in, sign out, or recover passwords.',
      detail:
        'Configure your site navigation flow in the Qube Auth setup modal. The plugin handles PKCE authorization code exchanges, email OTP verification, and seamless redirects automatically without page reloads.',
      codeTitle: 'Route Configuration Matrix',
      code: `{
  "publicSignInUrl": "/signin",
  "signedInDestination": "/dashboard",
  "signedOutRedirect": "/",
  "passwordRecoveryUrl": "/reset-password",
  "authCallbackUrl": "/auth/callback"
}`,
      tip: 'Supports both standard Framer page links and custom subdomain routing.',
    },
    {
      num: '03',
      title: 'Connect Payment Gateways',
      icon: CreditCard,
      tag: 'Stripe or Polar.sh',
      summary: 'Choose your monetization provider and configure checkout links.',
      detail:
        'Select either Stripe or Polar.sh. Enter your subscription pricing links, checkout table IDs, and self-service customer portal link. Enable optional prefill passing so signed-in members have their email auto-filled at checkout.',
      codeTitle: 'Monetization Gateway Settings',
      code: `const paymentConfig = {
  provider: "stripe", // or "polar"
  starterCheckoutUrl: "https://buy.stripe.com/test_starter_plan",
  proCheckoutUrl: "https://buy.stripe.com/test_pro_membership",
  customerPortalUrl: "https://billing.stripe.com/p/session/portal_xyz",
  embedType: "modal" // "modal" | "redirect" | "new_tab"
};`,
      tip: 'Polar.sh provides a sleek native iframe modal overlay that keeps users directly on your Framer page.',
    },
    {
      num: '04',
      title: 'Compile Component Library',
      icon: FileCode2,
      tag: 'Zero-Dependency Code',
      summary: 'Click "Install Library" to generate Qube-Auth.tsx into Framer Code assets.',
      detail:
        'Qube Auth compiles your custom configurations and selected design tokens directly into a single, clean, zero-dependency Qube-Auth.tsx file placed into your Framer project Assets → Code panel. Subsequent updates happen in place without breaking canvas references.',
      codeTitle: 'Compiled Assets → Code → Qube-Auth.tsx',
      code: `// Qube-Auth.tsx automatically created in Framer Assets
import { createClient } from "@supabase/supabase-js";
import { AuthForm, StripePricingTable, PaywallGuard } from "./qube-auth";

// Fully optimized bundle, tree-shakeable, and 100% editable if needed!
export { AuthForm, PaywallGuard, UserProfileMenu };`,
      tip: 'Quarantined file architecture ensures other custom code files and components remain 100% untouched.',
    },
    {
      num: '05',
      title: 'Drag, Drop & Publish',
      icon: Layers,
      tag: 'Visual Canvas Workflow',
      summary: 'Drag authentication cards, pricing tables, and paywalls onto your canvas.',
      detail:
        'Open Framer Assets panel, drag any authentication form, pricing table, or paywall guard directly onto your canvas. Customize colors, fonts, and logic props in the Framer right sidebar, and click Publish! Your membership SaaS is live.',
      codeTitle: 'Framer Canvas Component Props',
      code: `<PaywallGuard
  requiredTier="pro"
  fallback="modal"
  onAccessDenied={() => console.log("Paywall triggered")}
>
  {/* Drop exclusive video, downloads, or dashboard layers here! */}
  <ExclusiveMemberContent />
</PaywallGuard>`,
      tip: 'Works seamlessly with Framer responsive breakpoints (Desktop, Tablet, and Mobile).',
    },
  ];

  const current = steps[activeStep];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(current.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section id="workflow" className="qube-section">
      <div className="qube-container">
        
        {/* Section Header */}
        <div className="qube-section-header center">
          <span className="qube-section-tag">
            <Zap size={14} />
            THE 5-STEP WORKFLOW
          </span>
          <h2 className="qube-section-title">
            From Zero to Live SaaS <br />
            <span className="qube-text-gradient">In Under 5 Minutes</span>
          </h2>
          <p className="qube-section-desc">
            No complex backend wiring, zero webhook servers to manage, and no proprietary lock-in. Here is how simple the deployment pipeline is.
          </p>
        </div>

        {/* 5 Stepper Progress Bar */}
        <div className="qube-workflow-stepper-bar">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => {
                  setActiveStep(idx);
                  setCopiedCode(false);
                }}
                className={`qube-workflow-stepper-item ${isActive ? 'active' : ''}`}
              >
                <div className="qube-stepper-top">
                  <span className="qube-stepper-num">
                    STEP {st.num}
                  </span>
                  <Icon size={16} />
                </div>
                <h3 className="qube-stepper-title">
                  {st.title}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Active Step Showcase Card */}
        <div className="qube-workflow-card">
          <div className="qube-workflow-layout">
            
            {/* Step Explanation */}
            <div>
              <div className="qube-callout-tag">
                <span className="qube-badge">
                  STEP {current.num} OF 05
                </span>
                <span>•</span>
                <span>{current.tag}</span>
              </div>

              <h3 className="qube-card-title">
                {current.title}
              </h3>

              <p className="qube-workflow-summary">
                {current.summary}
              </p>

              <p className="qube-card-desc">
                {current.detail}
              </p>

              {/* Helpful Tip Alert */}
              <div className="qube-workflow-tip">
                <Sparkles size={16} />
                <div>
                  <strong className="qube-alert-title">Architecture Tip:</strong>
                  <span>{current.tip}</span>
                </div>
              </div>

              {/* Navigation controls */}
              <div className="qube-workflow-nav-bar">
                <button
                  type="button"
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className="qube-workflow-prev-btn"
                >
                  &larr; Previous Step
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                  disabled={activeStep === steps.length - 1}
                  className="qube-workflow-next-btn"
                >
                  <span>Next Step</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Code / Configuration Preview Terminal */}
            <div className="qube-code-viewer">
              <div className="qube-code-header">
                <div className="qube-chrome-dots">
                  <span className="qube-dot-red" />
                  <span className="qube-dot-yellow" />
                  <span className="qube-dot-green" />
                  <span className="qube-chrome-title">
                    {current.codeTitle}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="qube-terminal-copy-btn"
                >
                  {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="qube-code-content">
                {current.code}
              </pre>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
