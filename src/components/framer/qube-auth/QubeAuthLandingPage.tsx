'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2, 
  BookOpen, 
  Database
} from 'lucide-react';

import { QubeAuthHero } from './QubeAuthHero';
import { QubeAuthInteractiveSandbox } from './QubeAuthInteractiveSandbox';
import { QubeAuthBentoFeatures } from './QubeAuthBentoFeatures';
import { QubeAuthMonetizationDemo } from './QubeAuthMonetizationDemo';
import { QubeAuthWorkflow } from './QubeAuthWorkflow';
import { QubeAuthComponentCatalog } from './QubeAuthComponentCatalog';
import { QubeAuthSecurityRLS } from './QubeAuthSecurityRLS';
import { QubeAuthUseCases } from './QubeAuthUseCases';
import { QubeAuthFaq } from './QubeAuthFaq';
import { QubeAuthInstallModal } from './QubeAuthInstallModal';
import '@/styles/qube-auth-landing.css';

export function QubeAuthLandingPage() {
  const [isInstallModalOpen, setIsInstallModalOpen] = React.useState(false);

  const openInstall = () => setIsInstallModalOpen(true);
  const closeInstall = () => setIsInstallModalOpen(false);

  return (
    <div className="qube-landing">
      {/* 2. HERO SECTION WITH OFFICIAL BANNER SHOWCASE */}
      <div id="overview">
        <QubeAuthHero onInstallClick={openInstall} />
      </div>

      {/* 3. INTERACTIVE LIVE CANVAS SANDBOX */}
      <QubeAuthInteractiveSandbox />

      {/* 4. VALUE PILLARS & CORE FEATURES BENTO GRID */}
      <QubeAuthBentoFeatures />

      {/* 5. DUAL MONETIZATION ENGINE (STRIPE + POLAR & PAYWALLS) */}
      <QubeAuthMonetizationDemo />

      {/* 6. THE 5-STEP WORKFLOW PIPELINE */}
      <QubeAuthWorkflow />

      {/* 7. SEARCHABLE 30+ COMPONENT CATALOG */}
      <QubeAuthComponentCatalog />

      {/* 8. ZERO-TRUST SECURITY & RLS SCHEMAS */}
      <QubeAuthSecurityRLS />

      {/* 9. REAL-WORLD PRODUCTION USE CASES */}
      <QubeAuthUseCases />

      {/* 10. FREQUENTLY ASKED QUESTIONS */}
      <QubeAuthFaq />

      {/* 11. HIGH-CONVERTING BOTTOM CTA */}
      <section className="qube-cta-section">
        <div className="qube-container">
          <div className="qube-cta-box">
            <span className="qube-section-tag">
              <span className="qube-pulse-dot" />
              START MONETIZING TODAY
            </span>

            <h2 className="qube-section-title">
              Ready to Secure Your <br />
              <span className="qube-text-gradient">Framer Website?</span>
            </h2>

            <p className="qube-section-desc">
              Own your users, gate your content, and monetize recurring subscriptions with zero vendor lock-in and enterprise Row Level Security.
            </p>

            <div className="qube-hero-cta-group">
              <button
                type="button"
                onClick={openInstall}
                className="qube-btn-primary"
              >
                <span>Install on Framer Free</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>

              <Link
                href="/framer/qube-auth/docs"
                className="qube-btn-secondary"
              >
                <BookOpen className="h-4 w-4" />
                <span>Read Developer Docs</span>
              </Link>
            </div>

            <div className="qube-hero-tech-pills">
              <span className="qube-tech-pill">
                <CheckCircle2 className="h-4 w-4" />
                Free to Start · No Credit Card Required
              </span>
              <span className="qube-tech-pill">
                <Database className="h-4 w-4" />
                100% PostgreSQL Database Ownership
              </span>
              <span className="qube-tech-pill">
                <ShieldCheck className="h-4 w-4" />
                Enterprise RLS Ready
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 12. INSTALLATION MODAL */}
      <QubeAuthInstallModal
        isOpen={isInstallModalOpen}
        onClose={closeInstall}
      />

    </div>
  );
}
