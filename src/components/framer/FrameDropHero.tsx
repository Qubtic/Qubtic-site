'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  Sparkles, 
  Layers, 
  Zap, 
  ChevronRight
} from 'lucide-react';

interface FrameDropHeroProps {
  onInstallClick?: () => void;
  onExploreCatalog?: () => void;
}

export function FrameDropHero({ onInstallClick, onExploreCatalog }: FrameDropHeroProps) {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-36 md:pt-40 lg:pb-24">
      {/* Radiant Electric Blue Ambient Glows */}
      <div className="pointer-events-none absolute -left-40 top-12 h-[38rem] w-[38rem] rounded-full bg-[#0066FF]/12 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 top-16 h-[38rem] w-[38rem] rounded-full bg-[#00D2FF]/12 blur-[140px]" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-[30rem] w-[56rem] -translate-x-1/2 rounded-full bg-[#0066FF]/8 blur-[120px]" />

      <div className="relative mx-auto w-full max-w-[1720px] px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        
        {/* Top Breadcrumb & Status Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#666C64]">
            <Link href="/" className="hover:text-[#141915] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/services/framer-development" className="hover:text-[#141915] transition-colors">
              Framer
            </Link>
            <span>/</span>
            <span className="text-[#0066FF] font-bold inline-flex items-center gap-1.5">
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
            <span className="inline-flex items-center gap-2 rounded-full border border-[#0066FF]/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#0066FF] shadow-2xs backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#00D2FF] animate-pulse" />
              v0.2.0 Available on Framer Marketplace
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#141915]/10 bg-white/60 px-3 py-1 text-xs font-medium text-[#141915] backdrop-blur-md">
              Verified Plugin
            </span>
          </div>
        </div>

        {/* Center-Aligned Hero Header Copy */}
        <div className="mx-auto max-w-4xl text-center flex flex-col items-center">
          
          {/* Eyebrow Chip */}
          <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-[#0066FF]/25 bg-[#0066FF]/[0.06] px-4 py-1.5 backdrop-blur-md">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#0066FF]/15 p-0.5">
              <Image
                src="/images/brand/frame-drop-icon-transparent.png"
                alt="Frame Drop Logo"
                width={16}
                height={16}
                className="h-4 w-4 object-contain"
              />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0066FF]">
              Qubtic ™ · Built for Framer
            </span>
          </div>

          {/* Main Headline (Exact text from official banner) */}
          <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-[#141915] leading-[0.98]">
            Drag. Drop. <span className="text-[#0066FF] bg-gradient-to-r from-[#0066FF] to-[#00D2FF] bg-clip-text text-transparent">Build.</span>
          </h1>

          {/* Subheading (Exact text from official banner) */}
          <p className="mt-5 text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-[#141915] max-w-3xl leading-snug">
            Turn your designs into structured sections — instantly, with Frame Drop.
          </p>

          {/* Supporting Explanatory Paragraph */}
          <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-[#555C54]">
            The native Framer component suite and page studio engineered for founders, design agencies, and creators. Build pixel-perfect, WCAG-audited landing pages in seconds—without touching a line of code.
          </p>

          {/* The 3 Core Value Pillars (Matching banner icons & styling) */}
          <div className="mt-7 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 rounded-full border border-[#141915]/10 bg-white/70 px-5 py-2.5 shadow-2xs backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#141915]">
              <Zap className="h-4 w-4 text-[#0066FF]" />
              <span>Fast Workflow</span>
            </div>
            <span className="hidden sm:inline text-[#141915]/20">|</span>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#141915]">
              <Layers className="h-4 w-4 text-[#0066FF]" />
              <span>Clean Structure</span>
            </div>
            <span className="hidden sm:inline text-[#141915]/20">|</span>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#141915]">
              <Sparkles className="h-4 w-4 text-[#0066FF]" />
              <span>Built for Framer</span>
            </div>
          </div>

          {/* High-Converting CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
            <button
              type="button"
              onClick={onInstallClick}
              className="group relative inline-flex items-center gap-3 rounded-full bg-[#0066FF] px-8 py-4 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(0,102,255,0.32)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#0055DD] hover:shadow-[0_18px_40px_rgba(0,102,255,0.45)] cursor-pointer"
            >
              <span>Install on Framer</span>
              <span className="rounded-full bg-[#00D2FF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#021028]">
                Free to Start
              </span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            <a
              href="#catalog"
              onClick={onExploreCatalog}
              className="group inline-flex items-center gap-2.5 rounded-full border border-[#141915]/15 bg-white/80 px-7 py-4 text-sm font-semibold text-[#141915] shadow-xs backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:border-[#141915]/30"
            >
              <span>Explore 25+ Components</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>

            <Link
              href="/framer/frame-drop/docs"
              className="inline-flex items-center gap-1.5 px-4 py-4 text-xs font-semibold text-[#666C64] hover:text-[#0066FF] transition-colors"
            >
              <span>Documentation</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>

        {/* HERO CENTERPIECE SHOWCASE: The Official Banner in Full Uncropped Glory */}
        <div className="mt-12 sm:mt-16 w-full max-w-[1360px] mx-auto">
          <div className="relative rounded-[28px] sm:rounded-[36px] p-2.5 sm:p-4 bg-gradient-to-b from-[#0A162B] via-[#051024] to-[#020714] border border-white/20 shadow-[0_30px_90px_rgba(0,102,255,0.22)] backdrop-blur-xl">
            
            {/* Studio Window Chrome Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.04] rounded-t-[20px] sm:rounded-t-[28px]">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
                <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
              </div>

              <div className="flex items-center gap-2 text-xs font-mono font-medium text-white/80">
                <Image
                  src="/images/brand/frame-drop-icon-transparent.png"
                  alt="Frame Drop Logo"
                  width={16}
                  height={16}
                  className="h-4 w-4 object-contain brightness-110"
                />
                <span className="hidden sm:inline">Frame Drop Studio · Framer Canvas Plugin</span>
                <span className="sm:hidden">Frame Drop Studio</span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#00D2FF] bg-[#00D2FF]/10 border border-[#00D2FF]/20 px-2.5 py-1 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00D2FF] animate-pulse" />
                <span>Live Canvas</span>
              </div>
            </div>

            {/* Pristine Full Uncropped Banner Visual */}
            <div className="relative aspect-[1024/461] w-full overflow-hidden rounded-b-[20px] sm:rounded-b-[28px] bg-[#020714]">
              <Image
                src="/images/framedrop-banner.png"
                alt="Frame Drop - Drag. Drop. Build. Framer Plugin by Qubtic"
                fill
                priority
                className="object-contain object-center"
                sizes="(max-width: 1400px) 100vw, 1360px"
              />
            </div>

            {/* Interactive Quick Bar Under the Banner */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-xs text-white/60 bg-white/[0.03] rounded-2xl border border-white/5">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00D2FF]" />
                <span className="font-mono text-[11px] text-white/80">
                  Official Framer Component Suite by Qubtic Technologies
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <button
                  type="button"
                  onClick={onInstallClick}
                  className="text-[#00D2FF] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>1-Click Launch</span>
                  <ArrowUpRight className="h-3 w-3" />
                </button>
                <Link
                  href="/framer/frame-drop/docs"
                  className="hover:text-white transition-colors"
                >
                  Architecture Docs &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Trust Metrics Bar */}
        <div className="mt-14 mx-auto max-w-4xl pt-8 border-t border-[#141915]/10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <span className="font-heading text-3xl sm:text-4xl font-extrabold text-[#141915] tracking-tight">
              25+
            </span>
            <span className="text-xs text-[#666C64] font-medium mt-1">
              Production Sections
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-heading text-3xl sm:text-4xl font-extrabold text-[#0066FF] tracking-tight">
              1-Click
            </span>
            <span className="text-xs text-[#666C64] font-medium mt-1">
              Safe Canvas Insertion
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-heading text-3xl sm:text-4xl font-extrabold text-[#141915] tracking-tight">
              100%
            </span>
            <span className="text-xs text-[#666C64] font-medium mt-1">
              WCAG AA Compliant
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-heading text-3xl sm:text-4xl font-extrabold text-[#0066FF] tracking-tight">
              Zero
            </span>
            <span className="text-xs text-[#666C64] font-medium mt-1">
              Code Lock-in
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
