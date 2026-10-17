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
      name: 'Spatial Liquid Glass Agency Hero',
      category: 'Heroes',
      desc: 'Spatial liquid glass agency hero with commission status pulse, rotating aura glow, floating metric cards, and dual conversion CTAs.',
      gradientKey: 'hero',
    },
    {
      name: 'Floating Glass Dock Navigation',
      category: 'Navigation',
      desc: 'Floating pill navigation with real-time blur saturation, segmented routes, and responsive mobile drawer.',
      gradientKey: 'navbar',
    },
    {
      name: 'Agency Dark Glass Bento Matrix',
      category: 'Bento Grids',
      desc: 'Asymmetric dark glass bento matrix with interactive hover depth, animated border beams, and conversion telemetry.',
      gradientKey: 'bento',
    },
    {
      name: 'Obsidian Business Growth Stats',
      category: 'Social Proof & Stats',
      desc: 'Obsidian glass metrics cards with rotating conic border glow, animated trend vectors, and measurable business proof.',
      gradientKey: 'social',
    },
    {
      name: 'Startup & Scale Pricing Matrix',
      category: 'Pricing',
      desc: 'Three tailored tiers with featured scale plan, annual discount switch, feature checklists, and checkout hooks.',
      gradientKey: 'pricing',
    },
    {
      name: 'Accessible Accordion FAQ',
      category: 'FAQs & Support',
      desc: 'Accessible disclosure widgets with smooth height animations, category sorting, and semantic markup.',
      gradientKey: 'faq',
    },
  ];

  const faqs = [
    {
      question: 'Is Frame Drop free to get started?',
      answer:
        'Yes! Frame Drop is available directly inside the Framer Plugin Marketplace. You can start free with our essential core components or claim Frame Drop Pro for unlimited access to all 34+ production-ready sections, Studio Composer, and advanced design tokens.',
    },
    {
      question: 'How does non-destructive canvas safety prevent code overwrites?',
      answer:
        'Frame Drop uses a non-destructive canvas architecture. It inspects existing component files in your Framer project, isolates code exports into safe namespaces, and inserts sections without modifying your existing canvas nodes. If any insertion is interrupted or fails compilation, an automated transactional rollback immediately cleans up generated nodes, preserving your project state.',
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
              <span>Explore All 34+ Sections in Docs</span>
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
                <span>Open on Framer Free</span>
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
                <span>34+ Curated Sections</span>
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
