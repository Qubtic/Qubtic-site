'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  ArrowUpRight, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Code2, 
  ExternalLink,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FrameDropHeroProps {
  onInstallClick?: () => void;
  onExploreCatalog?: () => void;
}

export function FrameDropHero({ onInstallClick, onExploreCatalog }: FrameDropHeroProps) {
  const reduceMotion = useReducedMotion();
  const [focusMode, setFocusMode] = React.useState<'product' | 'agency'>('product');

  const content = {
    product: {
      eyebrow: 'NEW PRODUCT FROM QUBTIC TECHNOLOGIES',
      headingMain: 'Design. Drop. Deploy.',
      headingSub: 'High-converting Framer sections dropped straight onto your canvas.',
      subheading:
        'Frame Drop by Qubtic is the native Framer component suite and page studio engineered for founders, design agencies, and creators. Build pixel-perfect, WCAG-audited landing pages in seconds—without touching a line of code.',
      primaryCta: 'Install on Framer',
      primaryTag: 'Free to Start',
      secondaryCta: 'Explore Component Library',
      secondaryHref: '#catalog',
    },
    agency: {
      eyebrow: 'THE FRAMER TOOLKIT BY QUBTIC',
      headingMain: 'Turn hours of Framer layout work',
      headingSub: 'into a single, effortless click.',
      subheading:
        'Stop rebuilding the same heroes, bento grids, pricing cards, and testimonials. Frame Drop brings Qubtic’s battle-tested Liquid Glassmorphism design system, automated accessibility preflights, and modular page composition directly into your Framer workflow.',
      primaryCta: 'Open in Framer',
      primaryTag: 'Plugin v0.2.0',
      secondaryCta: 'Read Documentation',
      secondaryHref: '#docs-architecture',
    },
  };

  const current = content[focusMode];

  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-36 md:pt-40 lg:pb-24">
      {/* Ambient Lighting & Glow Orbs */}
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
            <Link href="/services/framer-development" className="hover:text-[#141915] transition-colors">
              Framer
            </Link>
            <span>/</span>
            <span className="text-[#0C3823] font-bold inline-flex items-center gap-1.5">
              <Image
                src="/images/brand/frame-drop-icon-transparent.png"
                alt="Frame Drop"
                width={14}
                height={14}
                className="h-3.5 w-3.5 object-contain"
              />
              <span>Frame Drop</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#0C3823]/15 bg-white/80 px-3 py-1 text-xs font-semibold text-[#0C3823] shadow-2xs backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#CCFF00] animate-pulse" />
              v0.2.0 Available Now
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#141915]/10 bg-[#141915]/5 px-3 py-1 text-xs font-medium text-[#141915]">
              Framer Verified Plugin
            </span>
          </div>
        </div>

        {/* Perspective Switcher Toggle (Product vs Agency Focus) */}
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
            {/* Eyebrow with Brand Watermark Styling */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-[#0C3823]/15 shadow-2xs p-1">
                <Image
                  src="/images/brand/frame-drop-icon-transparent.png"
                  alt="Frame Drop Logo"
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                />
              </div>
              <span className="h-px w-6 bg-[#0C3823]/30" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#0C3823]">
                {current.eyebrow}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="font-heading text-4xl font-bold uppercase tracking-tight text-[#141915] sm:text-5xl md:text-6xl lg:text-[4.25rem] leading-[1.02]">
              <span>{current.headingMain}</span>{' '}
              <span className="block text-[#0C3823] text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-medium normal-case font-body tracking-tight mt-2 text-balance">
                {current.headingSub}
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-[#555C54]">
              {current.subheading}
            </p>

            {/* CTA Action Row */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
              <button
                type="button"
                onClick={onInstallClick}
                className="group relative inline-flex items-center gap-3 rounded-full bg-[#0C3823] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(12,56,35,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#164E33] cursor-pointer"
              >
                <span>{current.primaryCta}</span>
                <span className="rounded-full bg-[#CCFF00] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#141915]">
                  {current.primaryTag}
                </span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <a
                href={current.secondaryHref}
                onClick={onExploreCatalog}
                className="group inline-flex items-center gap-2.5 rounded-full border border-[#141915]/20 bg-white/70 px-7 py-3.5 text-sm font-semibold text-[#141915] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:border-[#141915]/40"
              >
                <span>{current.secondaryCta}</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            {/* Trust Metric Row */}
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

          {/* Right Column: Hero Visual Showcase (Framedrop Banner) */}
          <div className="relative lg:col-span-5">
            <div className="relative mx-auto w-full max-w-[620px] rounded-[32px] p-2 sm:p-3 bg-gradient-to-b from-white/90 via-white/50 to-white/20 border border-white/80 shadow-[0_30px_70px_rgba(22,78,51,0.18)] backdrop-blur-xl">
              
              {/* Window Bar Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#141915]/8 bg-white/70 rounded-t-[24px]">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-[#141915]">
                  <Image
                    src="/images/brand/frame-drop-icon-transparent.png"
                    alt="Frame Drop Logo"
                    width={16}
                    height={16}
                    className="h-4 w-4 object-contain"
                  />
                  <span>Frame Drop Studio · Framer Plugin</span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#0C3823] bg-[#0C3823]/10 px-2 py-0.5 rounded-full">
                  Live
                </div>
              </div>

              {/* Main Banner Image Canvas */}
              <div className="relative aspect-[1024/461] w-full overflow-hidden rounded-b-[24px] bg-[#040D1A]">
                <Image
                  src="/images/framedrop-banner.png"
                  alt="Frame Drop - Drag. Drop. Build. Framer Plugin by Qubtic"
                  fill
                  priority
                  className="object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />

                {/* Floating Micro Badge Overlay 1 */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-2 rounded-xl bg-[#040D1A]/85 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md border border-white/15">
                  <Zap className="h-3.5 w-3.5 text-[#0084FD]" />
                  <span>1-Click Safe Insertion</span>
                </div>

                {/* Floating Micro Badge Overlay 2 */}
                <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 rounded-xl bg-[#040D1A]/85 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md border border-white/15">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#0084FD]" />
                  <span>WCAG AA Pass</span>
                </div>
              </div>

              {/* Quick Interactive Tooltip bar beneath */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs text-[#555C54] bg-white/60 rounded-2xl border border-[#141915]/5">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/brand/frame-drop-icon-transparent.png"
                    alt="Frame Drop Icon"
                    width={14}
                    height={14}
                    className="h-3.5 w-3.5 object-contain"
                  />
                  <span>Drag. Drop. Build. Structured Sections</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-[#0C3823]">
                  <span>25+ Sections</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
