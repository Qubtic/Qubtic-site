'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  BookOpen, 
  ChevronDown 
} from 'lucide-react';
import '@/styles/frame-drop-landing.css';
import { FrameDropHero } from '@/components/framer/FrameDropHero';
import { FrameDropBentoGrid } from '@/components/framer/FrameDropBentoGrid';
import { FrameDropHowItWorks } from '@/components/framer/FrameDropHowItWorks';
import { FrameDropInstallModal } from '@/components/framer/FrameDropInstallModal';

export function FrameDropLandingPage() {
  const [isInstallModalOpen, setIsInstallModalOpen] = React.useState(false);
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);

  const openInstall = () => setIsInstallModalOpen(true);
  const closeInstall = () => setIsInstallModalOpen(false);

  const featuredSections = [
    {
      name: 'Liquid Glass Split Media Hero',
      category: 'Heroes',
      desc: 'Backdrop-blur cards with dual CTAs, trust metric bar, and interactive 3D container.',
      gradientKey: 'hero',
    },
    {
      name: 'Refractive Glass Capsule Navbar',
      category: 'Floating Navbars',
      desc: 'Floating pill navigation with real-time blur saturation and responsive drawer.',
      gradientKey: 'navbar',
    },
    {
      name: 'Obsidian 6-Pack Architecture Bento',
      category: 'Bento Grids',
      desc: 'Calibrated asymmetric grid featuring dark glass surfaces and neon accents.',
      gradientKey: 'bento',
    },
    {
      name: 'Masonry Testimonial Wall of Love',
      category: 'Social Proof',
      desc: 'Verified customer cards with avatar badges, star ratings, and company logo marks.',
      gradientKey: 'social',
    },
    {
      name: '3-Tier SaaS Pricing Matrix',
      category: 'Pricing',
      desc: 'Clear tiers with annual discount switch, feature checklists, and checkout hooks.',
      gradientKey: 'pricing',
    },
    {
      name: 'Accordion FAQ with Category Filters',
      category: 'FAQs & Support',
      desc: 'Accessible disclosure widgets with smooth height animations and Schema.org markup.',
      gradientKey: 'faq',
    },
  ];

  const faqs = [
    {
      question: 'Is Frame Drop free to get started?',
      answer:
        'Yes! Frame Drop is available directly inside the Framer Plugin Marketplace. You can start free with our essential core components or upgrade to Frame Drop Pro for unlimited access to all 25+ production-ready sections, Studio Composer, and advanced design tokens.',
    },
    {
      question: 'How does atomic canvas safety prevent code overwrites?',
      answer:
        'Frame Drop computes a SHA256 checksum diff tree before every insertion. It verifies existing component IDs in your Framer project, ensuring that existing custom code overrides and components are completely quarantined from accidental overwrites. If any operation is interrupted, an atomic rollback restores your canvas instantly.',
    },
    {
      question: 'Can I customize brand colors and fonts?',
      answer:
        'Absolutely. Frame Drop includes global token synchronization. You can input your primary brand colors, typography, border radius, and spacing inside the plugin studio. Changes immediately propagate across every section you drop.',
    },
    {
      question: 'Are all components fully accessible?',
      answer:
        'Yes. Every component in Frame Drop passes our built-in Quality Preflight Engine before publication, ensuring contrast ratios ≥ 4.5:1 (WCAG 2.1 AA/AAA compliant), semantic heading hierarchies (H1-H4), 100% alt-text coverage, and zero mobile viewport overflow.',
    },
    {
      question: 'Do I get clean React code without third-party lock-in?',
      answer:
        'Yes. All components insert pure, native Framer React components onto your canvas. There are zero external runtime dependencies, ensuring maximum speed, SEO performance, and complete freedom to customize properties natively.',
    },
  ];

  return (
    <div className="fd-landing">
      
      {/* 1. HERO SECTION */}
      <div id="overview">
        <FrameDropHero onInstallClick={openInstall} />
      </div>

      {/* 2. VALUE PILLARS & FEATURE MATRIX */}
      <FrameDropBentoGrid />

      {/* 3. HOW IT WORKS 3-STEP PIPELINE */}
      <FrameDropHowItWorks />

      {/* 4. CURATED COMPONENT SHOWCASE */}
      <section id="catalog" className="fd-presets-section">
        <div className="fd-container">
          
          <div className="fd-presets-header-row">
            <div>
              <span className="fd-presets-tag">
                <span className="fd-pulse-lime" />
                CURATED PRESETS
              </span>
              <h2 className="fd-presets-title">
                Production Sections at Your Fingertips
              </h2>
              <p className="fd-presets-desc">
                Drop high-converting sections directly onto your Framer canvas. Zero dependencies, pure responsive React code.
              </p>
            </div>

            <Link
              href="/framer/frame-drop/docs#catalog"
              className="fd-presets-link-btn"
            >
              <span>Explore All 25+ Sections in Docs</span>
              <ArrowUpRight className="fd-icon-sm" />
            </Link>
          </div>

          <div className="fd-presets-grid">
            {featuredSections.map((item) => (
              <div
                key={item.name}
                className="fd-preset-card"
              >
                <div>
                  <div className="fd-card-header">
                    <span className="fd-preset-category">
                      {item.category}
                    </span>
                    <span className="fd-preset-wcag">
                      <ShieldCheck className="fd-icon-xs" />
                      <span>WCAG AA</span>
                    </span>
                  </div>

                  <div className="fd-preset-preview-box" data-gradient={item.gradientKey}>
                    <div className="fd-card-header">
                      <span className="fd-pillar-num">Native Framer React</span>
                      <span className="fd-pillar-num">Responsive</span>
                    </div>
                    <div>
                      <span className="fd-swatch-circle fd-swatch-emerald" />
                    </div>
                    <div className="fd-slot-badge-pinned">
                      1-Click Safe Drop
                    </div>
                  </div>

                  <h3 className="fd-card-title">
                    {item.name}
                  </h3>
                  <p className="fd-card-desc">
                    {item.desc}
                  </p>
                </div>

                <div className="fd-preset-footer">
                  <button
                    type="button"
                    onClick={openInstall}
                    className="fd-preset-drop-btn"
                  >
                    <span>Drop in Framer</span>
                    <ArrowUpRight className="fd-icon-xs" />
                  </button>
                  <Link
                    href="/framer/frame-drop/docs#catalog"
                    className="fd-preset-inspect-link"
                  >
                    Inspect Props &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. EDITORIAL STORY CALLOUT */}
      <section className="fd-editorial-section">
        <div className="fd-editorial-container">
          <div className="fd-editorial-card">
            <div>
              <span className="fd-editorial-tag">
                INSIDE THE STUDIO
              </span>
              <h3 className="fd-editorial-title">
                Why We Built Frame Drop
              </h3>
              <p className="fd-editorial-desc">
                Read our engineering story on why we replaced rigid full-site templates with modular, WCAG-audited sections and true design token harmony.
              </p>
            </div>

            <Link
              href="/blog/introducing-frame-drop-framer-canvas"
              className="fd-editorial-btn"
            >
              <span>Read the Story</span>
              <ArrowUpRight className="fd-icon-sm" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="fd-faq-section">
        <div className="fd-faq-container">
          <div className="fd-faq-header">
            <span className="fd-faq-tag">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="fd-faq-title">
              Questions About Frame Drop
            </h2>
          </div>

          <div className="fd-faq-list">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.question}
                  className={`fd-faq-item ${isOpen ? 'open' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="fd-faq-trigger"
                  >
                    <span className="fd-faq-question">
                      {faq.question}
                    </span>
                    <ChevronDown className="fd-faq-chevron" />
                  </button>

                  {isOpen && (
                    <div className="fd-faq-answer">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. HIGH-CONVERTING BOTTOM CTA */}
      <section className="fd-bottom-cta-section">
        <div className="fd-cta-glow-left" />
        <div className="fd-cta-glow-right" />

        <div className="fd-container">
          <div className="fd-bottom-cta-box">
            <span className="fd-bottom-cta-tag">
              <span className="fd-pulse-lime" />
              START BUILDING TODAY
            </span>

            <h2 className="fd-bottom-cta-title">
              Ready to Accelerate Your Framer Workflow?
            </h2>

            <p className="fd-bottom-cta-desc">
              Join forward-thinking founders, design agencies, and creators building pixel-perfect, WCAG-audited landing pages with Frame Drop by Qubtic.
            </p>

            <div className="fd-bottom-cta-actions">
              <button
                type="button"
                onClick={openInstall}
                className="fd-bottom-cta-btn-primary"
              >
                <span>Install on Framer Free</span>
                <ArrowUpRight className="fd-icon-sm" />
              </button>

              <Link
                href="/framer/frame-drop/docs"
                className="fd-bottom-cta-btn-secondary"
              >
                <BookOpen className="fd-icon-sm" />
                <span>Read Documentation</span>
              </Link>
            </div>

            <div className="fd-bottom-cta-trust">
              <span className="fd-trust-item">
                <CheckCircle2 className="fd-icon-sm" />
                <span>No Credit Card Required</span>
              </span>
              <span className="fd-trust-item">
                <ShieldCheck className="fd-icon-sm" />
                <span>Atomic Canvas Safety</span>
              </span>
              <span className="fd-trust-item">
                <Sparkles className="fd-icon-sm" />
                <span>25+ Curated Sections</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Install Modal */}
      <FrameDropInstallModal
        isOpen={isInstallModalOpen}
        onClose={closeInstall}
      />
    </div>
  );
}
