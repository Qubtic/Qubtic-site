'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  BookOpen, 
  ChevronRight, 
  ChevronDown, 
  Mail, 
  Code2, 
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FrameDropBentoGrid } from '@/components/framer/FrameDropBentoGrid';
import { FrameDropHowItWorks } from '@/components/framer/FrameDropHowItWorks';
import { FrameDropInstallModal } from '@/components/framer/FrameDropInstallModal';

export function FrameDropLandingPage() {
  const [isInstallModalOpen, setIsInstallModalOpen] = React.useState(false);
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);
  const [focusMode, setFocusMode] = React.useState<'product' | 'agency'>('product');

  const openInstall = () => setIsInstallModalOpen(true);
  const closeInstall = () => setIsInstallModalOpen(false);

  const heroContent = {
    product: {
      eyebrow: 'NEW PRODUCT FROM QUBTIC TECHNOLOGIES',
      headingMain: 'Design. Drop. Deploy.',
      headingSub: 'High-converting Framer sections dropped straight onto your canvas.',
      subheading:
        'Frame Drop by Qubtic is the native Framer component suite and page studio engineered for founders, design agencies, and creators. Build pixel-perfect, WCAG-audited landing pages in seconds—without touching a line of code.',
      primaryCta: 'Install on Framer',
      primaryTag: 'Free to Start',
      secondaryCta: 'View Documentation',
      secondaryHref: '/framer/frame-drop/docs',
    },
    agency: {
      eyebrow: 'THE FRAMER TOOLKIT BY QUBTIC',
      headingMain: 'Turn hours of Framer layout work',
      headingSub: 'into a single, effortless click.',
      subheading:
        'Stop rebuilding the same heroes, bento grids, pricing cards, and testimonials. Frame Drop brings Qubtic’s battle-tested Liquid Glassmorphism design system, automated accessibility preflights, and modular page composition directly into your Framer workflow.',
      primaryCta: 'Open in Framer',
      primaryTag: 'Plugin v0.2.0',
      secondaryCta: 'Read Developer Docs',
      secondaryHref: '/framer/frame-drop/docs',
    },
  };

  const current = heroContent[focusMode];

  const featuredSections = [
    {
      name: 'Liquid Glass Split Media Hero',
      category: 'Heroes',
      desc: 'Backdrop-blur cards with dual CTAs, trust metric bar, and interactive 3D container.',
      gradient: 'from-[#0C3823] to-[#082417]',
    },
    {
      name: 'Refractive Glass Capsule Navbar',
      category: 'Floating Navbars',
      desc: 'Floating pill navigation with real-time blur saturation and responsive drawer.',
      gradient: 'from-[#141915] to-[#1c221d]',
    },
    {
      name: 'Obsidian 6-Pack Architecture Bento',
      category: 'Bento Grids',
      desc: 'Calibrated asymmetric grid featuring dark glass surfaces and neon accents.',
      gradient: 'from-[#0A0D0C] to-[#141915]',
    },
    {
      name: 'Masonry Testimonial Wall of Love',
      category: 'Social Proof',
      desc: 'Verified customer cards with avatar badges, star ratings, and company logo marks.',
      gradient: 'from-[#164E33] to-[#0C3823]',
    },
    {
      name: '3-Tier SaaS Pricing Matrix',
      category: 'Pricing',
      desc: 'Clear tiers with annual discount switch, feature checklists, and checkout hooks.',
      gradient: 'from-[#0C3823] to-[#082417]',
    },
    {
      name: 'Accordion FAQ with Category Filters',
      category: 'FAQs & Support',
      desc: 'Accessible disclosure widgets with smooth height animations and Schema.org markup.',
      gradient: 'from-[#141915] to-[#0A0D0C]',
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
    <div className="relative overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-36 md:pt-40 lg:pb-24">
        {/* Ambient Lighting */}
        <div className="pointer-events-none absolute -left-48 top-12 h-[36rem] w-[36rem] rounded-full bg-[#E8C48A]/35 blur-[120px]" />
        <div className="pointer-events-none absolute -right-48 top-16 h-[36rem] w-[36rem] rounded-full bg-[#0C3823]/15 blur-[130px]" />
        <div className="pointer-events-none absolute left-1/2 top-10 h-[28rem] w-[52rem] -translate-x-1/2 rounded-full bg-white/45 blur-[110px]" />

        <div className="relative mx-auto w-full max-w-[1720px] px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          
          {/* Breadcrumb & Version Pill */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#666C64]">
              <Link href="/" className="hover:text-[#141915] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-[#0C3823] font-bold">Frame Drop</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#0C3823]/15 bg-white/80 px-3 py-1 text-xs font-semibold text-[#0C3823] shadow-2xs backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#CCFF00] animate-pulse" />
                v0.2.0 Available Now
              </span>
              <Link
                href="/framer/frame-drop/docs"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#141915]/10 bg-white/60 px-3.5 py-1 text-xs font-semibold text-[#141915] hover:bg-white transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#0C3823]" />
                <span>Documentation</span>
              </Link>
            </div>
          </div>

          {/* Perspective Switcher */}
          <div className="mb-8 inline-flex items-center gap-1 rounded-full border border-[#141915]/10 bg-white/60 p-1 backdrop-blur-md shadow-xs">
            <button
              onClick={() => setFocusMode('product')}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer',
                focusMode === 'product'
                  ? 'bg-[#0C3823] text-white shadow-xs'
                  : 'text-[#666C64] hover:text-[#141915] hover:bg-black/5'
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Product Focus (Recommended)
            </button>
            <button
              onClick={() => setFocusMode('agency')}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer',
                focusMode === 'agency'
                  ? 'bg-[#0C3823] text-white shadow-xs'
                  : 'text-[#666C64] hover:text-[#141915] hover:bg-black/5'
              )}
            >
              <Code2 className="h-3.5 w-3.5" />
              Agency &amp; Developer Focus
            </button>
          </div>

          {/* Hero Grid */}
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
            
            {/* Left Column: Copy & Actions */}
            <div className="flex flex-col items-start text-left lg:col-span-7">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-[#0C3823]/30" />
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#0C3823]">
                  {current.eyebrow}
                </span>
                <span className="h-px w-8 bg-[#0C3823]/30" />
              </div>

              <h1 className="font-heading text-4xl font-bold uppercase tracking-tight text-[#141915] sm:text-5xl md:text-6xl lg:text-[4.25rem] leading-[1.02]">
                <span>{current.headingMain}</span>{' '}
                <span className="block text-[#0C3823] text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-medium normal-case font-body tracking-tight mt-2 text-balance">
                  {current.headingSub}
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-[#555C54]">
                {current.subheading}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
                <button
                  type="button"
                  onClick={openInstall}
                  className="group relative inline-flex items-center gap-3 rounded-full bg-[#0C3823] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(12,56,35,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#164E33] cursor-pointer"
                >
                  <span>{current.primaryCta}</span>
                  <span className="rounded-full bg-[#CCFF00] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#141915]">
                    {current.primaryTag}
                  </span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>

                <Link
                  href={current.secondaryHref}
                  className="group inline-flex items-center gap-2.5 rounded-full border border-[#141915]/20 bg-white/70 px-7 py-3.5 text-sm font-semibold text-[#141915] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:border-[#141915]/40"
                >
                  <span>{current.secondaryCta}</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Trust Metrics */}
              <div className="mt-12 w-full pt-8 border-t border-[#141915]/10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div className="flex flex-col">
                  <span className="font-heading text-2xl sm:text-3xl font-extrabold text-[#141915] tracking-tight">
                    25+
                  </span>
                  <span className="text-xs text-[#666C64] font-medium mt-0.5">
                    Production-Ready Sections
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0C3823] tracking-tight">
                    1-Click
                  </span>
                  <span className="text-xs text-[#666C64] font-medium mt-0.5">
                    Safe Canvas Insertion
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-heading text-2xl sm:text-3xl font-extrabold text-[#141915] tracking-tight">
                    100%
                  </span>
                  <span className="text-xs text-[#666C64] font-medium mt-0.5">
                    WCAG AA Accessible
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0C3823] tracking-tight">
                    Zero
                  </span>
                  <span className="text-xs text-[#666C64] font-medium mt-0.5">
                    Code Lock-in
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Showcase */}
            <div className="relative lg:col-span-5">
              <div className="relative mx-auto w-full max-w-[620px] rounded-[32px] p-2 sm:p-3 bg-gradient-to-b from-white/90 via-white/50 to-white/20 border border-white/80 shadow-[0_30px_70px_rgba(22,78,51,0.18)] backdrop-blur-xl">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#141915]/8 bg-white/70 rounded-t-[24px]">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-[#141915]/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#CCFF00]" />
                    <span>Frame Drop Studio · Framer Plugin</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#0C3823] bg-[#0C3823]/10 px-2 py-0.5 rounded-full">
                    Live
                  </div>
                </div>

                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-b-[24px] bg-[#0A0D0C]">
                  <Image
                    src="/images/framedrop-promo.jpg"
                    alt="Frame Drop Pro - Framer Native Component Studio by Qubtic"
                    fill
                    priority
                    className="object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-xl bg-[#0A0D0C]/85 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md border border-white/15">
                    <Zap className="h-3.5 w-3.5 text-[#CCFF00]" />
                    <span>1-Click Safe Insertion</span>
                  </div>
                  <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-xl bg-[#0A0D0C]/85 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md border border-white/15">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#CCFF00]" />
                    <span>WCAG AA &gt;= 4.5:1 Pass</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs text-[#555C54] bg-white/60 rounded-2xl border border-[#141915]/5">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-[#0C3823]" />
                    <span>Obsidian Dark &amp; Crystal Light Theme Duality</span>
                  </div>
                  <Link href="/framer/frame-drop/docs" className="flex items-center gap-1 font-semibold text-[#0C3823] hover:underline">
                    <span>Explore Docs</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. VALUE PILLARS & FEATURE MATRIX */}
      <FrameDropBentoGrid />

      {/* 3. HOW IT WORKS 3-STEP PIPELINE */}
      <FrameDropHowItWorks />

      {/* 4. CURATED COMPONENT SHOWCASE */}
      <section className="py-16 sm:py-20 lg:py-28 relative">
        <div className="relative mx-auto w-full max-w-[1720px] px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12 sm:mb-16">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#0C3823]/15 bg-white/70 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0C3823] mb-4 shadow-2xs backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#CCFF00] animate-pulse" />
                CURATED PRESETS
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[#141915] leading-[1.05]">
                Production Sections at Your Fingertips
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[#555C54] leading-relaxed">
                Drop high-converting sections directly onto your Framer canvas. Zero dependencies, pure responsive React code.
              </p>
            </div>

            <Link
              href="/framer/frame-drop/docs#catalog"
              className="inline-flex items-center gap-2 rounded-full bg-[#0C3823] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#164E33] transition-colors w-fit"
            >
              <span>Explore All 25+ Sections in Docs</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredSections.map((item) => (
              <div
                key={item.name}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-[#141915]/10 bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0C3823] bg-[#0C3823]/10 px-2.5 py-1 rounded-full">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      WCAG AA
                    </span>
                  </div>

                  <div className={cn('relative aspect-[16/9] w-full rounded-2xl p-4 flex flex-col justify-between overflow-hidden text-white mb-5 bg-gradient-to-br shadow-inner', item.gradient)}>
                    <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
                      <span>Native Framer React</span>
                      <span>Responsive</span>
                    </div>
                    <div>
                      <div className="h-1.5 w-16 bg-[#CCFF00] rounded-full mb-1.5" />
                      <div className="h-2 w-28 bg-white/60 rounded-full" />
                    </div>
                    <div className="text-[10px] font-mono text-[#CCFF00]">
                      1-Click Safe Drop
                    </div>
                  </div>

                  <h3 className="font-heading text-lg font-bold uppercase text-[#141915] mb-2 leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#555C54] leading-relaxed mb-6 font-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#141915]/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={openInstall}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#0C3823] hover:underline cursor-pointer"
                  >
                    <span>Drop in Framer</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href="/framer/frame-drop/docs#catalog"
                    className="text-xs text-[#666C64] hover:text-[#141915]"
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
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-[#141915]/10 bg-white p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#0C3823] block mb-2">
                INSIDE THE STUDIO
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-[#141915] mb-3">
                Why We Built Frame Drop
              </h3>
              <p className="text-sm text-[#555C54] leading-relaxed">
                Read our engineering story on why we replaced rigid full-site templates with modular, WCAG-audited sections and true design token harmony.
              </p>
            </div>

            <Link
              href="/blog/introducing-frame-drop-framer-canvas"
              className="inline-flex items-center gap-2 rounded-full bg-[#141915] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-[#0C3823] transition-colors shrink-0"
            >
              <span>Read the Story</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#0C3823]/15 bg-white/70 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0C3823] mb-4 shadow-2xs">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-[#141915]">
              Questions About Frame Drop
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.question}
                  className="rounded-[24px] border border-[#141915]/10 bg-white overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-6 sm:p-7 text-left cursor-pointer"
                  >
                    <span className="font-heading text-base sm:text-lg font-bold uppercase text-[#141915]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 text-[#0C3823] shrink-0 transition-transform duration-300 ml-4',
                        isOpen && 'rotate-180'
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 sm:px-7 sm:pb-7 text-sm sm:text-base text-[#555C54] leading-relaxed border-t border-[#141915]/5 pt-4">
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
      <section className="relative py-20 lg:py-28 bg-[#00381F] text-white overflow-hidden">
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#164E33]/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#CCFF00]/15 blur-3xl" />

        <div className="relative mx-auto w-full max-w-[1720px] px-4 sm:px-8 md:px-12 lg:px-16 text-center">
          <div className="max-w-4xl mx-auto bg-white rounded-[36px] sm:rounded-[48px] p-10 sm:p-16 md:p-20 text-[#141915] shadow-2xl border border-white/40">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#0C3823]/15 bg-[#F4EFE6] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0C3823] mb-6 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-[#CCFF00] animate-pulse" />
              START BUILDING TODAY
            </span>

            <h2 className="font-heading text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-tight">
              Ready to Accelerate Your <br className="hidden sm:inline" />
              Framer Workflow?
            </h2>

            <p className="text-base sm:text-lg text-[#555C54] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Join forward-thinking founders, design agencies, and creators building pixel-perfect, WCAG-audited landing pages with Frame Drop by Qubtic.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={openInstall}
                className="inline-flex items-center gap-2.5 rounded-full bg-[#0C3823] px-8 py-4 text-sm font-semibold text-white shadow-xl hover:bg-[#164E33] hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Install on Framer Free</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <Link
                href="/framer/frame-drop/docs"
                className="inline-flex items-center gap-2.5 rounded-full border border-[#141915]/20 bg-white px-8 py-4 text-sm font-semibold text-[#141915] hover:bg-[#F4EFE6] hover:-translate-y-0.5 transition-all"
              >
                <BookOpen className="w-4 h-4 text-[#0C3823]" />
                <span>Read Documentation</span>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#666C64]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                No Credit Card Required
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Atomic Canvas Safety
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#0C3823]" />
                25+ Curated Sections
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
