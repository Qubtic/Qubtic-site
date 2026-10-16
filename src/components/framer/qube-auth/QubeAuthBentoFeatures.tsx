'use client';

import * as React from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Fingerprint, 
  CreditCard, 
  Database, 
  Sparkles, 
  Layers, 
  Lock, 
  Smartphone, 
  Mail, 
  Globe, 
  Users, 
  Palette, 
  Zap
} from 'lucide-react';
import { 
  FaGoogle, 
  FaGithub, 
  FaApple, 
  FaMicrosoft, 
  FaSlack, 
  FaLinkedin, 
  FaDiscord, 
  FaXTwitter 
} from 'react-icons/fa6';

export function QubeAuthBentoFeatures() {
  return (
    <section id="features" className="qube-section">
      <div className="qube-container">
        
        {/* Section Header */}
        <div className="qube-section-header">
          <span className="qube-section-tag">
            <Sparkles size={14} />
            FULL-SPECTRUM SUITE
          </span>
          <h2 className="qube-section-title">
            Built for Serious SaaS <br />
            <span className="qube-text-gradient">&amp; Digital Creators</span>
          </h2>
          <p className="qube-section-desc">
            Everything required to authenticate users, manage sessions, restrict content, and monetize recurring subscriptions directly inside your Framer canvas.
          </p>

          <div className="qube-catalog-header-badge">
            <span className="qube-pulse-dot" />
            <span>Zero Vendor Lock-in · 100% Supabase Ownership</span>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="qube-bento-grid">
          
          {/* Card 1: Enterprise Authentication (8 cols) */}
          <div className="qube-bento-card col-8">
            <div>
              <div className="qube-card-icon-header">
                <span className="qube-card-tag">
                  <Lock size={14} />
                  Pillar 01 · Authentication Engine
                </span>
                <span className="qube-catalog-lang-tag">
                  RFC-6749 PKCE Compliant
                </span>
              </div>

              <h3 className="qube-card-title">
                Enterprise-Grade User Authentication
              </h3>
              <p className="qube-card-desc">
                From frictionless one-click passwordless logins to hardware biometrics and corporate SSO, give your users the fastest, most secure sign-in experience on the web.
              </p>

              {/* Feature Pills Grid */}
              <div className="qube-feature-pills-grid">
                <div className="qube-feature-mini-pill">
                  <div className="qube-feature-mini-title">
                    <Fingerprint size={16} />
                    <span>WebAuthn Passkeys</span>
                  </div>
                  <p className="qube-feature-mini-desc">
                    Touch ID, Face ID, and Windows Hello one-tap biometrics.
                  </p>
                </div>

                <div className="qube-feature-mini-pill">
                  <div className="qube-feature-mini-title">
                    <Mail size={16} />
                    <span>Passwordless Magic Links</span>
                  </div>
                  <p className="qube-feature-mini-desc">
                    Instant zero-password email login dispatched via Supabase.
                  </p>
                </div>

                <div className="qube-feature-mini-pill">
                  <div className="qube-feature-mini-title">
                    <KeyRound size={16} />
                    <span>6-Digit OTP / 2FA</span>
                  </div>
                  <p className="qube-feature-mini-desc">
                    Email passcodes and TOTP multi-factor verification.
                  </p>
                </div>

                <div className="qube-feature-mini-pill">
                  <div className="qube-feature-mini-title">
                    <Smartphone size={16} />
                    <span>Phone SMS Auth</span>
                  </div>
                  <p className="qube-feature-mini-desc">
                    Twilio &amp; MessageBird integration with auto-format prefix.
                  </p>
                </div>

                <div className="qube-feature-mini-pill">
                  <div className="qube-feature-mini-title">
                    <Globe size={16} />
                    <span>Enterprise SAML SSO</span>
                  </div>
                  <p className="qube-feature-mini-desc">
                    Okta, Azure Active Directory, and Google Workspace SSO.
                  </p>
                </div>

                <div className="qube-feature-mini-pill">
                  <div className="qube-feature-mini-title">
                    <Users size={16} />
                    <span>Anonymous Guests</span>
                  </div>
                  <p className="qube-feature-mini-desc">
                    One-tap instant test drives converted to permanent accounts.
                  </p>
                </div>
              </div>
            </div>

            <div className="qube-catalog-card-footer">
              <span>Client-Side RFC-7636 PKCE Tokens</span>
              <span className="qube-callout-footer-action">0 Cookie Interception</span>
            </div>
          </div>

          {/* Card 2: 8 Major Social Providers (4 cols) */}
          <div className="qube-bento-card col-4">
            <div>
              <div className="qube-card-icon-header">
                <span className="qube-card-tag">
                  <Globe size={14} />
                  Pillar 02 · Social OAuth
                </span>
                <span className="qube-catalog-lang-tag">8 Providers</span>
              </div>

              <h3 className="qube-card-title">
                Universal OAuth
              </h3>
              <p className="qube-card-desc">
                Enable 1-click social logins with verified scopes and auto-synced avatars.
              </p>

              {/* 8 Social Icons Bar */}
              <div className="qube-social-oauth-bar qube-space-b-6">
                <div className="qube-social-btn" title="Google"><FaGoogle size={16} /></div>
                <div className="qube-social-btn" title="GitHub"><FaGithub size={16} /></div>
                <div className="qube-social-btn" title="Apple"><FaApple size={16} /></div>
                <div className="qube-social-btn" title="Microsoft"><FaMicrosoft size={16} /></div>
                <div className="qube-social-btn" title="Slack"><FaSlack size={16} /></div>
                <div className="qube-social-btn" title="LinkedIn"><FaLinkedin size={16} /></div>
                <div className="qube-social-btn" title="Discord"><FaDiscord size={16} /></div>
                <div className="qube-social-btn" title="X (Twitter)"><FaXTwitter size={16} /></div>
              </div>

              <div className="qube-card-checklist">
                <div className="qube-check-item">
                  <ShieldCheck size={16} />
                  <span>Custom OAuth scopes &amp; claims</span>
                </div>
                <div className="qube-check-item">
                  <ShieldCheck size={16} />
                  <span>Automatic member profile avatar sync</span>
                </div>
              </div>
            </div>

            <div className="qube-catalog-card-footer">
              <span>Custom Redirect Paths</span>
              <span className="qube-callout-footer-action">Instant Auth</span>
            </div>
          </div>

          {/* Card 3: Dual Paywall & Monetization Suite (6 cols) */}
          <div className="qube-bento-card col-6">
            <div>
              <div className="qube-card-icon-header">
                <span className="qube-card-tag">
                  <CreditCard size={14} />
                  Pillar 03 · Dual Monetization
                </span>
                <span className="qube-catalog-lang-tag">Stripe + Polar.sh</span>
              </div>

              <h3 className="qube-card-title">
                Stripe &amp; Polar.sh Paywalls
              </h3>
              <p className="qube-card-desc">
                Gate entire pages, nested component layers, or specific canvas frames based on verified customer subscription tiers in your Supabase database.
              </p>

              <div className="qube-card-checklist qube-space-b-6">
                <div className="qube-check-item">
                  <Zap size={16} />
                  <div>
                    <strong>Stripe &amp; Polar Paywall Guards:</strong> Drop around any content. Automatically checks active subscriptions.
                  </div>
                </div>
                <div className="qube-check-item">
                  <Zap size={16} />
                  <div>
                    <strong>Self-Service Customer Portal:</strong> Enable subscribers to manage payment cards and invoices with zero support overhead.
                  </div>
                </div>
              </div>
            </div>

            <div className="qube-catalog-card-footer">
              <span>Checkout Options: Modal, Redirect, New Tab</span>
              <span className="qube-callout-footer-action">Instant Re-Check Flow</span>
            </div>
          </div>

          {/* Card 4: Appearance Studio & 8 Curated Presets (6 cols) */}
          <div className="qube-bento-card col-6">
            <div>
              <div className="qube-card-icon-header">
                <span className="qube-card-tag">
                  <Palette size={14} />
                  Pillar 04 · Design Token Studio
                </span>
                <span className="qube-catalog-lang-tag">WCAG AA Pass</span>
              </div>

              <h3 className="qube-card-title">
                8 Curated Designer Presets
              </h3>
              <p className="qube-card-desc">
                Synchronizes seamlessly with your Framer editor theme and published site settings. Every preset features dual-layer background depth and passes strict WCAG AA accessibility contrast checks.
              </p>

              {/* 8 Preset Badges with zero inline CSS */}
              <div className="qube-presets-grid">
                {[
                  { id: 'framer-blue', name: 'Framer Blue' },
                  { id: 'monochrome', name: 'Monochrome' },
                  { id: 'midnight', name: 'Midnight' },
                  { id: 'emerald', name: 'Emerald' },
                  { id: 'violet', name: 'Violet' },
                  { id: 'aurora-teal', name: 'Aurora Teal' },
                  { id: 'sunset-ember', name: 'Sunset Ember' },
                  { id: 'cyber-lime', name: 'Cyber Lime' },
                ].map((item) => (
                  <div key={item.id} className="qube-preset-item">
                    <span className="qube-preset-dot" data-color={item.id} />
                    <span className="qube-preset-name">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="qube-feature-mini-pill qube-bento-split-row">
                <div className="qube-feature-mini-title qube-no-margin">
                  <ShieldCheck size={16} />
                  <span>Built-in WCAG AA Contrast Analyzer</span>
                </div>
                <span className="qube-tier-badge qube-badge-inline">
                  Ratio &ge; 4.5:1 Pass
                </span>
              </div>
            </div>

            <div className="qube-catalog-card-footer">
              <span>Canvas Dark &amp; Light Mode Auto-Sync</span>
              <span className="qube-callout-footer-action">Dual-Layer Gradients</span>
            </div>
          </div>

          {/* Card 5: Zero-Trust Security & RLS (12 cols) */}
          <div className="qube-bento-card col-12">
            <div className="qube-bento-split-row">
              <div className="qube-bento-col-text">
                <span className="qube-card-tag qube-mt-4">
                  <Database size={14} />
                  Pillar 05 · Zero-Trust Security
                </span>
                <h3 className="qube-section-title qube-title-lg">
                  You Own 100% of Your Database
                </h3>
                <p className="qube-section-desc">
                  Unlike traditional third-party auth plugins that trap your customer accounts in external SaaS silos, Qube Auth communicates directly from your Framer site to your own Supabase PostgreSQL database. No proxy servers, zero data leakage, and true database Row Level Security (RLS).
                </p>
              </div>

              <div className="qube-bento-action-group">
                <a href="#security" className="qube-btn-primary">
                  <span>Explore Security Spec</span>
                  <ShieldCheck size={16} />
                </a>
                <a href="#components" className="qube-btn-secondary">
                  <span>Browse 30+ Components</span>
                  <Layers size={16} />
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
