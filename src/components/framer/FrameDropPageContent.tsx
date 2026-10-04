'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Sparkles, Mail, CheckCircle2, ShieldCheck } from 'lucide-react';
import { FrameDropHero } from '@/components/framer/FrameDropHero';
import { FrameDropSubnav } from '@/components/framer/FrameDropSubnav';
import { FrameDropBentoGrid } from '@/components/framer/FrameDropBentoGrid';
import { FrameDropHowItWorks } from '@/components/framer/FrameDropHowItWorks';
import { FrameDropCatalogExplorer } from '@/components/framer/FrameDropCatalogExplorer';
import { FrameDropDesignSystem } from '@/components/framer/FrameDropDesignSystem';
import { FrameDropPreflightEngine } from '@/components/framer/FrameDropPreflightEngine';
import { FrameDropChangelog } from '@/components/framer/FrameDropChangelog';
import { FrameDropBlogArticle } from '@/components/framer/FrameDropBlogArticle';
import { FrameDropMarketingToolbox } from '@/components/framer/FrameDropMarketingToolbox';
import { FrameDropInstallModal } from '@/components/framer/FrameDropInstallModal';

export function FrameDropPageContent() {
  const [isInstallModalOpen, setIsInstallModalOpen] = React.useState(false);

  const openInstall = () => setIsInstallModalOpen(true);
  const closeInstall = () => setIsInstallModalOpen(false);

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div id="overview">
        <FrameDropHero onInstallClick={openInstall} />
      </div>

      {/* Official Hero Banner Showcase */}
      <section className="relative -mt-6 mb-12 sm:mb-16">
        <div className="relative mx-auto w-full max-w-[1720px] px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-gradient-to-b from-[#0A1322] to-[#040D1A] p-3 sm:p-5 shadow-[0_25px_60px_rgba(0,132,253,0.15)]">
            <div className="relative aspect-[1024/461] w-full overflow-hidden rounded-[24px]">
              <Image
                src="/images/framedrop-banner.png"
                alt="Frame Drop - Drag. Drop. Build. Official Hero Banner by Qubtic"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1720px) 100vw, 1600px"
              />
            </div>
            
            {/* Ambient Banner Footer Bar */}
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-xs text-white/70">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/images/brand/frame-drop-icon-transparent.png"
                  alt="Frame Drop Logo"
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                />
                <span className="font-heading font-bold text-white tracking-wide">FRAME DROP NATIVE CANVAS SUITE</span>
                <span className="hidden sm:inline text-white/40">·</span>
                <span className="hidden sm:inline text-white/80">Turn your designs into structured sections — instantly</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={openInstall}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#CCFF00] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#141915] shadow-xs hover:bg-white transition-colors cursor-pointer"
                >
                  <span>Install on Framer</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Sticky Sub-Nav */}
      <FrameDropSubnav />

      {/* Value Pillars (Bento Grid) */}
      <FrameDropBentoGrid />

      {/* 3-Step Workflow ("How It Works") */}
      <FrameDropHowItWorks />

      {/* 25+ Production Section Catalog Explorer */}
      <FrameDropCatalogExplorer />

      {/* Design System & Liquid Glassmorphism */}
      <FrameDropDesignSystem />

      {/* WCAG AA & Contrast Preflight Engine */}
      <FrameDropPreflightEngine />

      {/* Release Notes / Changelog v0.2.0 */}
      <FrameDropChangelog />

      {/* Official Launch Article / Blog Post */}
      <FrameDropBlogArticle onInstallClick={openInstall} />

      {/* Social & Launch Snippets (Press Kit) */}
      <FrameDropMarketingToolbox />

      {/* Bottom Conversion CTA Section */}
      <section className="relative py-20 lg:py-28 bg-[#00381F] text-white overflow-hidden mt-16">
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
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full border border-[#141915]/20 bg-white px-8 py-4 text-sm font-semibold text-[#141915] hover:bg-[#F4EFE6] hover:-translate-y-0.5 transition-all"
              >
                <Mail className="w-4 h-4 text-[#0C3823]" />
                <span>Talk with Qubtic Engineers</span>
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
