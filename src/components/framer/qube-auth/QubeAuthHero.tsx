'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  Lock, 
  Database, 
  CreditCard,
  UserCheck
} from 'lucide-react';

interface QubeAuthHeroProps {
  onInstallClick?: () => void;
}

export function QubeAuthHero({ onInstallClick }: QubeAuthHeroProps) {
  return (
    <section className="qube-hero-section">
      {/* Radiant Electric Lime & Deep Forest Ambient Glows */}
      <div className="qube-hero-orb-1" />
      <div className="qube-hero-orb-2" />
      <div className="qube-hero-orb-center" />

      <div className="qube-container">
        
        {/* Top Breadcrumb & Status Bar */}
        <div className="qube-hero-breadcrumb-bar">
          <div className="qube-hero-breadcrumbs">
            <Link href="/">
              Home
            </Link>
            <span>/</span>
            <Link href="/services/framer-development">
              Framer
            </Link>
            <span>/</span>
            <span className="qube-hero-badge-framer">
              <Image
                src="/images/qube-auth/qube-auth-logo.png"
                alt="Qube Auth"
                width={16}
                height={16}
              />
              <span>Qube Auth</span>
            </span>
          </div>

          <div className="qube-hero-status-pills">
            <span className="qube-status-pill-green">
              <span className="qube-pulse-dot" />
              v1.0.0 Live on Framer Marketplace
            </span>
            <span className="qube-status-pill-subtle">
              <ShieldCheck size={14} />
              Framer Verified Plugin
            </span>
          </div>
        </div>

        {/* Center-Aligned Hero Header Copy */}
        <div className="qube-hero-content">
          
          {/* Eyebrow Chip */}
          <div className="qube-eyebrow-chip">
            <div className="qube-eyebrow-logo-box">
              <Image
                src="/images/qube-auth/qube-auth-logo.png"
                alt="Qube Auth Logo"
                width={16}
                height={16}
              />
            </div>
            <span className="qube-eyebrow-text">
              Qubtic ™ · Framer Website Authentication Plugin
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="qube-hero-title">
            Secure Your <br />
            <span className="qube-text-gradient">
              Framer Website
            </span>
          </h1>

          {/* Subheading */}
          <p className="qube-hero-subtitle">
            Easy, powerful, and seamless authentication for your Framer projects.
          </p>

          {/* Supporting Explanatory Paragraph */}
          <p className="qube-hero-desc">
            Protect your users, manage access, and build with confidence. Powered by <strong>Supabase</strong>, <strong>Stripe</strong>, and <strong>Polar.sh</strong>. Zero vendor lock-in, enterprise-grade Row Level Security (RLS), and 30+ drag-and-drop Framer canvas components.
          </p>

          {/* The 3 Core Value Pillars */}
          <div className="qube-hero-pillars-bar">
            <div className="qube-hero-pillar-item">
              <div className="qube-pillar-icon-box">
                <ShieldCheck size={16} />
              </div>
              <span>Secure Authentication</span>
            </div>
            <span className="qube-pillar-divider">|</span>
            <div className="qube-hero-pillar-item">
              <div className="qube-pillar-icon-box">
                <Zap size={16} />
              </div>
              <span>Fast &amp; Easy Integration</span>
            </div>
            <span className="qube-pillar-divider">|</span>
            <div className="qube-hero-pillar-item">
              <div className="qube-pillar-icon-box">
                <UserCheck size={16} />
              </div>
              <span>Better User Experience</span>
            </div>
          </div>

          {/* Integration Tech Stack Pills */}
          <div className="qube-hero-tech-pills">
            <span className="qube-tech-pill">
              <Database size={12} />
              Supabase PostgreSQL + RLS
            </span>
            <span className="qube-tech-pill">
              <CreditCard size={12} />
              Stripe Billing &amp; Portals
            </span>
            <span className="qube-tech-pill">
              <Sparkles size={12} />
              Polar.sh Modal Checkout
            </span>
            <span className="qube-tech-pill">
              <Lock size={12} />
              WebAuthn Passkeys / Face ID
            </span>
          </div>

          {/* High-Converting CTA Buttons */}
          <div className="qube-hero-cta-group">
            <button
              type="button"
              onClick={onInstallClick}
              className="qube-btn-primary"
            >
              <span>Install on Framer</span>
              <span className="qube-tag-dark">
                Free
              </span>
              <ArrowUpRight size={16} />
            </button>

            <a
              href="#sandbox"
              className="qube-btn-secondary"
            >
              <span>Try Live Sandbox</span>
              <ChevronRight size={16} />
            </a>

            <Link
              href="/framer/qube-auth/docs"
              className="qube-btn-link"
            >
              <span>Docs</span>
              <ArrowUpRight size={14} />
            </Link>

            <Link
              href="/framer/auth-bridge"
              className="qube-btn-link"
            >
              <span>Test Handshake</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

        </div>

        {/* HERO CENTERPIECE SHOWCASE: The Official Banner */}
        <div className="qube-hero-banner-wrapper">
          <div className="qube-hero-banner-frame">
            
            {/* Studio Window Chrome Bar */}
            <div className="qube-hero-banner-chrome">
              <div className="qube-chrome-dots">
                <div className="qube-dot-red" />
                <div className="qube-dot-yellow" />
                <div className="qube-dot-green" />
              </div>

              <div className="qube-chrome-title">
                <Image
                  src="/images/qube-auth/qube-auth-logo.png"
                  alt="Qube Auth Logo"
                  width={16}
                  height={16}
                />
                <span>Qube Auth Suite · Native Framer Canvas Component</span>
              </div>

              <div className="qube-chrome-status">
                <span className="qube-pulse-dot" />
                <span>Zero Lock-in</span>
              </div>
            </div>

            {/* Pristine Full Uncropped Official Banner Visual */}
            <div className="qube-hero-banner-img-box">
              <Image
                src="/images/qube-auth/qube-auth-banner.png"
                alt="Qube Auth - Secure Your Framer Website"
                fill
                priority
                className="qube-hero-banner-img"
                sizes="(max-width: 1400px) 100vw, 1380px"
              />
            </div>

            {/* Interactive Quick Bar Under the Banner */}
            <div className="qube-banner-quick-bar">
              <div className="qube-quick-bar-left">
                <span className="qube-pulse-dot" />
                <span className="qube-quick-bar-meta">
                  Official Framer Component Suite by Qubtic · Powered by Supabase &amp; Stripe &amp; Polar
                </span>
              </div>

              <div className="qube-quick-bar-right">
                <button
                  type="button"
                  onClick={onInstallClick}
                  className="qube-quick-bar-btn"
                >
                  <span>1-Click Install</span>
                  <ArrowUpRight size={12} />
                </button>
                <Link
                  href="/framer/qube-auth/docs"
                  className="qube-quick-bar-link"
                >
                  SQL Schemas &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Trust Metrics Bar */}
        <div className="qube-trust-grid">
          <div>
            <div className="qube-trust-stat">
              30+
            </div>
            <div className="qube-trust-label">
              Framer Canvas Components
            </div>
          </div>
          <div>
            <div className="qube-trust-stat accent">
              100%
            </div>
            <div className="qube-trust-label">
              PostgreSQL Ownership
            </div>
          </div>
          <div>
            <div className="qube-trust-stat">
              Zero
            </div>
            <div className="qube-trust-label">
              Vendor Data Lock-in
            </div>
          </div>
          <div>
            <div className="qube-trust-stat accent">
              RLS
            </div>
            <div className="qube-trust-label">
              Enterprise Row Level Security
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
