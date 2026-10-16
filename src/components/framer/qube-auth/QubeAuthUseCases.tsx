'use client';

import * as React from 'react';
import { 
  Rocket, 
  GraduationCap, 
  Building2, 
  Package, 
  ArrowUpRight, 
  Check, 
  Sparkles 
} from 'lucide-react';

export function QubeAuthUseCases() {
  const useCases = [
    {
      num: '01',
      title: 'Paid SaaS Applications & Micro-Startups',
      icon: Rocket,
      tag: 'B2B & B2C SaaS',
      desc: 'Build full membership gating without deploying external auth servers.',
      bullets: [
        'Collect registrations via Google, GitHub, or Email OTP',
        'Display 3-tier pricing table linked to Stripe or Polar',
        'Protect app workspace (/dashboard) using AuthGuard',
        'Automatic gating based on subscription status in Supabase',
      ],
      flowBadge: 'Google / Email → Stripe → /dashboard',
    },
    {
      num: '02',
      title: 'Premium Creator Communities & Video Courses',
      icon: GraduationCap,
      tag: 'Digital Learning',
      desc: 'Deliver public preview lessons and lock masterclasses behind seamless modals.',
      bullets: [
        'Free preview articles and videos on public Framer canvas',
        'Lock private modules inside PolarPaywallGuard or StripePaywallGuard',
        'Frictionless in-place modal checkout without page redirects',
        'Instant content unlock with automatic access re-check',
      ],
      flowBadge: 'Preview → Polar Modal → Unlocked Course',
    },
    {
      num: '03',
      title: 'B2B Client Portals & Enterprise Dashboards',
      icon: Building2,
      tag: 'Enterprise & Agencies',
      desc: 'Corporate domains, two-factor authentication, and self-service billing.',
      bullets: [
        'Corporate logins via Microsoft 365, Google Workspace & Okta SAML',
        'Enforce Two-Factor Authentication (MFA / TOTP) challenges',
        'Customer Portal button for self-service card updates & VAT invoices',
        'Quarantined profile metadata tied to company domain',
      ],
      flowBadge: 'SAML SSO → 2FA TOTP → Client Hub',
    },
    {
      num: '04',
      title: 'Digital Templates & Component Marketplaces',
      icon: Package,
      tag: 'Ecommerce & Downloads',
      desc: 'Allow visitors to preview tools as anonymous guests, then buy with 1 click.',
      bullets: [
        'Instant anonymous guest sessions for frictionless component testing',
        'One-time Polar or Stripe digital product checkout triggers',
        'Auto-send license keys and download links upon verified payment',
        'Zero friction conversion path for indie hackers & designers',
      ],
      flowBadge: 'Guest Preview → 1-Click Pay → License Key',
    },
  ];

  return (
    <section id="use-cases" className="qube-section">
      <div className="qube-container">
        
        {/* Section Header */}
        <div className="qube-section-header center">
          <span className="qube-section-tag">
            <Sparkles size={14} />
            PROVEN IN PRODUCTION
          </span>
          <h2 className="qube-section-title">
            Designed for Modern <br />
            <span className="qube-text-gradient">Business Models</span>
          </h2>
          <p className="qube-section-desc">
            Whether you are launching an indie micro-SaaS, monetizing digital templates, or running client portals for high-ticket agencies.
          </p>
        </div>

        {/* 4 Use Case Cards */}
        <div className="qube-usecases-grid">
          {useCases.map((uc) => {
            const Icon = uc.icon;
            return (
              <div key={uc.num} className="qube-usecase-card">
                <div>
                  <div className="qube-usecase-top">
                    <span className="qube-usecase-badge">
                      CASE {uc.num}
                    </span>
                    <span className="qube-usecase-tag">
                      {uc.tag}
                    </span>
                  </div>

                  <div className="qube-usecase-title-row">
                    <div className="qube-usecase-icon-box">
                      <Icon size={20} />
                    </div>
                    <h3 className="qube-usecase-title">
                      {uc.title}
                    </h3>
                  </div>

                  <p className="qube-usecase-desc">
                    {uc.desc}
                  </p>

                  <ul className="qube-usecase-bullets">
                    {uc.bullets.map((b) => (
                      <li key={b} className="qube-usecase-bullet-item">
                        <Check size={16} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="qube-usecase-footer">
                  <span className="qube-usecase-flow">
                    {uc.flowBadge}
                  </span>
                  <a href="#sandbox" className="qube-usecase-link">
                    <span>Test Flow</span>
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
