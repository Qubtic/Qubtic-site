'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  BookOpen, 
  ExternalLink, 
  ShieldCheck, 
  ArrowUpRight, 
  Menu, 
  X,
  Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FrameDropCatalogExplorer } from '@/components/framer/FrameDropCatalogExplorer';
import { FrameDropDesignSystem } from '@/components/framer/FrameDropDesignSystem';
import { FrameDropPreflightEngine } from '@/components/framer/FrameDropPreflightEngine';
import { FrameDropChangelog } from '@/components/framer/FrameDropChangelog';
import { FrameDropMarketingToolbox } from '@/components/framer/FrameDropMarketingToolbox';
import { FrameDropInstallModal } from '@/components/framer/FrameDropInstallModal';

const docNavigation = [
  {
    group: 'Getting Started',
    items: [
      { title: 'Overview & Architecture', href: '#overview' },
      { title: 'Installation & Setup', href: '#installation' },
      { title: 'Non-Destructive Safety', href: '#canvas-safety' },
    ],
  },
  {
    group: 'Component Library (34 Sections)',
    items: [
      { title: 'All Sections (34)', href: '#catalog' },
      { title: 'Heroes (6)', href: '#catalog-heroes' },
      { title: 'Navigation (2)', href: '#catalog-navigation' },
      { title: 'Bento Grids (3)', href: '#catalog-bento' },
      { title: 'Features & Process (4)', href: '#catalog-features' },
      { title: 'Services & Capabilities (3)', href: '#catalog-services' },
      { title: 'Social Proof & Stats (6)', href: '#catalog-social' },
      { title: 'Portfolio & Work (2)', href: '#catalog-portfolio' },
      { title: 'Pricing Matrices (2)', href: '#catalog-pricing' },
      { title: 'FAQs & Support (2)', href: '#catalog-faq' },
      { title: 'CTAs & Footers (4)', href: '#catalog-cta' },
    ],
  },
  {
    group: 'Design System & Tokens',
    items: [
      { title: 'Liquid Glassmorphism', href: '#design-system' },
      { title: 'Obsidian & Crystal Palettes', href: '#design-system' },
      { title: 'Typography Suite (13 Presets)', href: '#design-system' },
    ],
  },
  {
    group: 'Quality & Preflight',
    items: [
      { title: 'WCAG AA Accessibility', href: '#preflight-engine' },
      { title: 'Contrast Ratio Verification', href: '#preflight-engine' },
      { title: 'Live Preflight Scanner', href: '#preflight-engine' },
    ],
  },
  {
    group: 'Releases & Changelog',
    items: [
      { title: 'Release v0.2.0 Notes', href: '#changelog' },
      { title: 'Product Roadmap & Trajectory', href: '/framer/frame-drop/roadmap' },
      { title: 'Version Control & Rollback', href: '/framer/frame-drop/version-control' },
      { title: 'Feature Request & Community', href: '/feature-request' },
    ],
  },
  {
    group: 'Press Kit & Resources',
    items: [
      { title: 'Social Launch Threads', href: '#marketing-toolbox' },
      { title: 'SEO & Metadata', href: '#marketing-toolbox' },
      { title: 'Engineering Story', href: '/blog/introducing-frame-drop-framer-canvas' },
    ],
  },
];

export function FrameDropDocsLayout() {
  const [isInstallModalOpen, setIsInstallModalOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeHash, setActiveHash] = React.useState('#overview');

  React.useEffect(() => {
    const updateHash = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        setActiveHash(window.location.hash.toLowerCase());
      }
    };
    updateHash();
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);

  return (
    <div className="relative pt-24 pb-20 sm:pt-28">
      {/* Docs Top Bar */}
      <div className="border-b border-[#141915]/10 bg-[#F4EFE6] sticky top-[68px] z-30 shadow-2xs">
        <div className="mx-auto max-w-[1720px] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg border border-[#141915]/15 text-[#141915]"
              aria-label="Toggle Docs Sidebar"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#666C64]">
              <Link href="/framer/frame-drop" className="flex items-center gap-2 text-[#0C3823] hover:underline font-bold">
                <Image
                  src="/images/brand/frame-drop-icon-transparent.png"
                  alt="Frame Drop Logo"
                  width={18}
                  height={18}
                  className="h-4.5 w-4.5 object-contain"
                />
                <span>Frame Drop</span>
              </Link>
              <span>/</span>
              <span className="text-[#141915]">Documentation</span>
            </div>

            <span className="rounded-full bg-[#0C3823]/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#0C3823]">
              v0.2.0
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/framer/frame-drop"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#555C54] hover:text-[#141915] transition-colors"
            >
              <span>Product Overview</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#0C3823] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-2xs hover:bg-[#164E33] transition-colors cursor-pointer"
            >
              <span>Install Plugin</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container with Sidebar */}
      <div className="mx-auto max-w-[1720px] px-4 sm:px-8 md:px-12 lg:px-16 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Sticky Sidebar (Desktop & Mobile Drawer) */}
          <aside
            className={cn(
              'lg:col-span-3 sticky top-36 z-20 space-y-6',
              mobileMenuOpen
                ? 'fixed inset-x-4 top-36 bg-white rounded-3xl p-6 shadow-2xl border border-[#141915]/15 max-h-[80vh] overflow-y-auto z-50 block'
                : 'hidden lg:block'
            )}
          >
            <div className="rounded-3xl border border-[#141915]/10 bg-white/95 backdrop-blur-md p-6 shadow-2xs">
              <div className="flex items-center gap-2.5 mb-4">
                <Image
                  src="/images/brand/frame-drop-icon-transparent.png"
                  alt="Frame Drop"
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                />
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0C3823]">
                  DOCUMENTATION DIRECTORY
                </h3>
              </div>

              <div className="space-y-6">
                {docNavigation.map((group) => (
                  <div key={group.group}>
                    <h4 className="font-heading text-xs font-bold uppercase text-[#141915] mb-2.5 opacity-90">
                      {group.group}
                    </h4>
                    <ul className="space-y-1.5 text-xs">
                      {group.items.map((item) => {
                        const isActive = activeHash === item.href.toLowerCase();
                        return (
                          <li key={item.title}>
                            <a
                              href={item.href}
                              onClick={() => {
                                setActiveHash(item.href.toLowerCase());
                                setMobileMenuOpen(false);
                              }}
                              className={cn(
                                'block rounded-lg px-2.5 py-1.5 transition-colors font-medium',
                                isActive
                                  ? 'bg-[#0C3823] text-white font-semibold shadow-2xs'
                                  : 'text-[#555C54] hover:bg-[#F4EFE6] hover:text-[#0C3823]'
                              )}
                            >
                              {item.title}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-[#141915]/10 flex flex-col gap-2">
                <span className="text-[11px] font-mono text-[#666C64]">Need custom components?</span>
                <Link
                  href="/contact"
                  className="text-xs font-bold text-[#0C3823] hover:underline flex items-center gap-1"
                >
                  <span>Talk with Studio Engineers</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Main Documentation Content Area (Span 9) */}
          <main className="lg:col-span-9 space-y-12">
            
            {/* Overview / Introduction Section */}
            <section id="overview" className="scroll-mt-36 rounded-[32px] border border-[#141915]/10 bg-white p-8 sm:p-12 shadow-sm">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#0C3823]/15 bg-[#F4EFE6] px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#0C3823] mb-4 shadow-2xs">
                  <BookOpen className="w-3.5 h-3.5" />
                  DEVELOPER &amp; DESIGNER GUIDE
                </span>

                <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-[#141915] mb-6 leading-tight">
                  Frame Drop Documentation
                </h1>

                <p className="text-base sm:text-lg text-[#555C54] leading-relaxed mb-8 font-normal">
                  Frame Drop is the native Framer component suite and page studio engineered by Qubtic Technologies. It enables creators, agencies, and founders to drop production-grade, WCAG-audited sections directly onto the Framer canvas.
                </p>

                {/* Hero Banner Visual Card */}
                <div className="mb-8 overflow-hidden rounded-[24px] border border-[#141915]/10 bg-[#040D1A] shadow-lg">
                  <div className="relative aspect-[1024/461] w-full">
                    <Image
                      src="/images/framedrop-banner.png"
                      alt="Frame Drop Official Banner"
                      fill
                      priority
                      className="object-contain object-center"
                      sizes="(max-width: 1200px) 100vw, 900px"
                    />
                  </div>
                </div>

                {/* Quick Feature Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#141915]/10">
                  <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#141915]/5">
                    <span className="font-heading text-xl font-bold text-[#141915] block">34+ Sections</span>
                    <span className="text-xs text-[#666C64]">Heroes, Bentos, Navbars &amp; Pricing</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#141915]/5">
                    <span className="font-heading text-xl font-bold text-[#0C3823] block">WCAG AA</span>
                    <span className="text-xs text-[#666C64]">≥ 4.5:1 Contrast &amp; Alt-Text Audited</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#141915]/5">
                    <span className="font-heading text-xl font-bold text-[#141915] block">Zero Lock-in</span>
                    <span className="text-xs text-[#666C64]">Pure native Framer React components</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Installation & Setup Section */}
            <section id="installation" className="scroll-mt-36 rounded-[32px] border border-[#141915]/10 bg-white p-8 sm:p-12 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-5 h-5 text-[#0C3823]" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0C3823]">
                  QUICKSTART
                </span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-[#141915] mb-6">
                Installation &amp; Canvas Setup
              </h2>

              <p className="text-sm sm:text-base text-[#555C54] leading-relaxed mb-6">
                Install Frame Drop directly inside your Framer desktop app or browser canvas with zero configuration:
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#F8F6F0] border border-[#141915]/5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0C3823] text-white font-mono text-xs font-bold">
                    01
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase text-[#141915]">
                      Open Your Framer Project
                    </h3>
                    <p className="text-xs text-[#555C54] mt-1">
                      Navigate to any existing Framer project or launch a new canvas in your Framer account.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#F8F6F0] border border-[#141915]/5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0C3823] text-white font-mono text-xs font-bold">
                    02
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase text-[#141915]">
                      Invoke Plugin Search
                    </h3>
                    <p className="text-xs text-[#555C54] mt-1">
                      Press <kbd className="px-2 py-0.5 bg-white border border-black/10 rounded font-mono text-xs">Cmd + K</kbd> (Mac) or <kbd className="px-2 py-0.5 bg-white border border-black/10 rounded font-mono text-xs">Ctrl + K</kbd> (Windows) and type <strong>&ldquo;Frame Drop&rdquo;</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#F8F6F0] border border-[#141915]/5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0C3823] text-white font-mono text-xs font-bold">
                    03
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase text-[#141915]">
                      One-Click Insertion
                    </h3>
                    <p className="text-xs text-[#555C54] mt-1">
                      Browse sections or use the Visual Page Composer to drop responsive layouts directly into your canvas tree.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsInstallModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0C3823] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-[#164E33] transition-colors cursor-pointer"
                >
                  <span>Launch Framer Marketplace</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>

            {/* Non-Destructive Canvas Architecture Section */}
            <section id="canvas-safety" className="scroll-mt-36 rounded-[32px] border border-[#141915]/10 bg-white p-8 sm:p-12 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-[#0C3823]" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0C3823]">
                  SAFETY ARCHITECTURE
                </span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-[#141915] mb-4">
                Non-Destructive Canvas Architecture &amp; Rollback
              </h2>

              <p className="text-sm sm:text-base text-[#555C54] leading-relaxed mb-6">
                Never worry about overwriting custom code. Frame Drop inspects project files, isolates component exports into safe namespaces, and executes automated transactional rollbacks if anything interrupts your insertion.
              </p>

              <div className="rounded-2xl bg-[#082417] p-5 text-white font-mono text-xs border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-[#CCFF00] pb-2 border-b border-white/10">
                  <span>File Isolation &amp; Transactional Rollback</span>
                  <span>Active</span>
                </div>
                <p className="text-white/80 font-sans text-xs leading-relaxed">
                  Before any component tree is written, Frame Drop verifies project permissions and isolates code files (e.g. frame-dropSection.tsx), preventing collision with custom code. If an insertion fails, all generated canvas nodes are immediately removed, preserving your project state.
                </p>
              </div>
            </section>

            {/* Interactive Component Catalog */}
            <FrameDropCatalogExplorer />

            {/* Liquid Glassmorphism & Design Tokens */}
            <FrameDropDesignSystem />

            {/* WCAG & Quality Preflight Engine */}
            <FrameDropPreflightEngine />

            {/* Release Changelog v0.2.0 */}
            <FrameDropChangelog />

            {/* Press Kit & Marketing Toolbox */}
            <FrameDropMarketingToolbox />

          </main>

        </div>
      </div>

      {/* Install Modal */}
      <FrameDropInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
