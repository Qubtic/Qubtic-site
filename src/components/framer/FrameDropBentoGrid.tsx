'use client';

import * as React from 'react';
import { 
  MousePointerClick, 
  LayoutGrid, 
  Palette, 
  ShieldCheck, 
  Sliders, 
  ShieldAlert, 
  Sparkles, 
  Check, 
  Layers, 
  Sun, 
  Moon,
  Workflow,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function FrameDropBentoGrid() {
  const [previewTheme, setPreviewTheme] = React.useState<'dark' | 'light'>('dark');
  const [activeBrandColor, setActiveBrandColor] = React.useState<'emerald' | 'amber' | 'violet' | 'forest'>('forest');

  const brandColors = {
    forest: { hex: '#0C3823', name: 'Obsidian Forest' },
    emerald: { hex: '#059669', name: 'Emerald Mint' },
    amber: { hex: '#D97706', name: 'Sunlit Amber' },
    violet: { hex: '#7C3AED', name: 'Cyber Violet' },
  };

  return (
    <section id="features" className="py-16 sm:py-20 lg:py-28 relative">
      <div className="relative mx-auto w-full max-w-[1720px] px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        
        {/* Section Header */}
        <div className="mb-14 sm:mb-18 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0C3823]/15 bg-white/70 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0C3823] mb-4 shadow-2xs backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#CCFF00] animate-pulse" />
            ENGINEERED ARCHITECTURE
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[#141915] leading-[1.05]">
            Feature Matrix &amp; Value Pillars
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#555C54] leading-relaxed">
            Every section, container query, and design token is engineered to deliver instantaneous speed, absolute canvas safety, and uncompromised accessibility.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* Card 1: 1-Click Canvas Drop (Span 7) */}
          <div className="lg:col-span-7 group relative flex flex-col justify-between overflow-hidden rounded-[30px] border border-[#141915]/10 bg-white p-8 sm:p-10 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#0C3823]/5 blur-3xl group-hover:bg-[#0C3823]/10 transition-colors" />
            
            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0C3823]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0C3823]">
                  <MousePointerClick className="w-3.5 h-3.5" />
                  Instant Drop
                </span>
                <span className="font-mono text-xs font-semibold text-[#141915]/40">
                  PILLAR // 01
                </span>
              </div>

              <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-[#141915] mb-3">
                Direct Canvas Insertion
              </h3>
              <p className="text-base text-[#555C54] leading-relaxed max-w-xl">
                Drop responsive heroes, navigation bars, bento grids, and pricing tables directly onto your Framer canvas. Native components, responsive container queries, and clean React code with zero dependencies.
              </p>
            </div>

            {/* Visual Interactive Insertion Demo */}
            <div className="mt-8 rounded-2xl border border-[#141915]/10 bg-[#F7F4ED] p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs font-mono text-[#666C64] pb-3 border-b border-[#141915]/10 mb-3">
                <span className="flex items-center gap-1.5 font-semibold text-[#0C3823]">
                  <Workflow className="w-3.5 h-3.5" />
                  framer.insertComponent()
                </span>
                <span className="text-[11px] bg-white px-2 py-0.5 rounded border border-[#141915]/10">
                  Async Safe Pipeline
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['HeroSection.tsx', 'NavbarCapsule.tsx', 'BentoMatrix.tsx', 'PricingCards.tsx'].map((comp, idx) => (
                  <div key={comp} className="flex items-center justify-between bg-white rounded-xl p-2.5 border border-[#141915]/5 shadow-2xs">
                    <span className="font-mono text-[11px] font-medium text-[#141915] truncate">
                      {comp}
                    </span>
                    <Check className="w-3.5 h-3.5 text-[#0C3823] shrink-0 ml-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Visual Page Composer Studio (Span 5) */}
          <div className="lg:col-span-5 group relative flex flex-col justify-between overflow-hidden rounded-[30px] border border-[#141915]/10 bg-white p-8 sm:p-10 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#141915] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  <LayoutGrid className="w-3.5 h-3.5 text-[#CCFF00]" />
                  Studio Mode
                </span>
                <span className="font-mono text-xs font-semibold text-[#141915]/40">
                  PILLAR // 02
                </span>
              </div>

              <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-[#141915] mb-3">
                Interactive Multi-Section Composer
              </h3>
              <p className="text-base text-[#555C54] leading-relaxed">
                Assemble, reorder, preview, and customize your entire website layout inside the plugin before dropping it onto your canvas. Test responsive variations and content copy simultaneously.
              </p>
            </div>

            {/* Studio Slot Stack Demo */}
            <div className="mt-8 space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-[#0C3823] px-4 py-2.5 text-xs font-mono font-medium text-white shadow-sm">
                <span>Slot 01: Liquid Glass Navbar</span>
                <span className="text-[10px] text-[#CCFF00] bg-white/10 px-2 py-0.5 rounded">Pinned Top</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white border border-[#141915]/10 px-4 py-2.5 text-xs font-mono font-medium text-[#141915]">
                <span>Slot 02: Split Media Hero</span>
                <span className="text-[10px] text-[#666C64]">Active Slot</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white border border-[#141915]/10 px-4 py-2.5 text-xs font-mono font-medium text-[#141915]">
                <span>Slot 03: Bento Feature Grid</span>
                <span className="text-[10px] text-[#666C64]">Ready</span>
              </div>
            </div>
          </div>

          {/* Card 3: Liquid Glassmorphism & Theme Duality (Span 6) */}
          <div className="lg:col-span-6 group relative flex flex-col justify-between overflow-hidden rounded-[30px] border border-[#141915]/10 bg-white p-8 sm:p-10 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0C3823]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0C3823]">
                  <Palette className="w-3.5 h-3.5" />
                  Design System
                </span>
                
                {/* Theme Toggle Buttons */}
                <div className="flex items-center gap-1 rounded-full border border-[#141915]/10 bg-[#F4EFE6] p-1">
                  <button
                    onClick={() => setPreviewTheme('dark')}
                    className={cn(
                      'flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer',
                      previewTheme === 'dark' ? 'bg-[#0A0D0C] text-white shadow-2xs' : 'text-[#666C64]'
                    )}
                  >
                    <Moon className="w-3 h-3 text-[#CCFF00]" />
                    Obsidian
                  </button>
                  <button
                    onClick={() => setPreviewTheme('light')}
                    className={cn(
                      'flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer',
                      previewTheme === 'light' ? 'bg-white text-[#141915] shadow-2xs' : 'text-[#666C64]'
                    )}
                  >
                    <Sun className="w-3 h-3 text-amber-500" />
                    Crystal
                  </button>
                </div>
              </div>

              <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-[#141915] mb-3">
                Obsidian Dark &amp; Crystal Light
              </h3>
              <p className="text-base text-[#555C54] leading-relaxed">
                Crafted around Qubtic’s signature design tokens. Seamlessly switch between dark and light modes with backdrop blurs, subtle borders, micro-typography, and curated modern fonts (Inter, Plus Jakarta Sans, Outfit, DM Sans, Syne, Cinzel).
              </p>
            </div>

            {/* Interactive Theme Preview Card */}
            <div className="mt-8">
              <div
                className={cn(
                  'rounded-2xl p-6 transition-all duration-300 border',
                  previewTheme === 'dark'
                    ? 'bg-[#0A0D0C] text-white border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]'
                    : 'bg-[#F7F4ED] text-[#141915] border-[#141915]/10 shadow-[0_20px_40px_rgba(0,0,0,0.05)]'
                )}
              >
                <div className="flex items-center justify-between pb-3 border-b border-current/10">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#CCFF00]" />
                    <span className="text-xs font-mono uppercase tracking-wider">
                      {previewTheme === 'dark' ? 'Palettes: Obsidian #0A0D0C' : 'Palettes: Crystal #F4EFE6'}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white/10">
                    Backdrop-blur 24px
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-heading text-lg font-bold">Liquid Glass Surface</h4>
                    <p className="text-xs opacity-75 mt-0.5">Calibrated elevation &amp; translucent borders</p>
                  </div>
                  <span className="rounded-full bg-[#0C3823] px-3 py-1.5 text-xs font-semibold text-white">
                    Preview Mode
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Built-in Quality Preflight Engine (Span 6) */}
          <div className="lg:col-span-6 group relative flex flex-col justify-between overflow-hidden rounded-[30px] border border-[#141915]/10 bg-white p-8 sm:p-10 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  WCAG AA Verified
                </span>
                <span className="font-mono text-xs font-semibold text-[#141915]/40">
                  PILLAR // 04
                </span>
              </div>

              <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-[#141915] mb-3">
                Automated Accessibility &amp; Contrast Audits
              </h3>
              <p className="text-base text-[#555C54] leading-relaxed">
                Every component passes automated contrast ratio audits (≥ 4.5:1), heading hierarchy verification, image alt-text scans, and mobile viewport checks before you publish.
              </p>
            </div>

            {/* Preflight Check Metrics Visual */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 bg-[#F7F4ED] rounded-xl p-3.5 border border-[#141915]/5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#141915]">Contrast 4.8:1</span>
                  <span className="text-[10px] text-[#666C64]">Exceeds WCAG AA</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#F7F4ED] rounded-xl p-3.5 border border-[#141915]/5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#141915]">Heading Tree</span>
                  <span className="text-[10px] text-[#666C64]">H1-H4 Semantics</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#F7F4ED] rounded-xl p-3.5 border border-[#141915]/5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#141915]">Alt-Text Engine</span>
                  <span className="text-[10px] text-[#666C64]">100% Media Audit</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#F7F4ED] rounded-xl p-3.5 border border-[#141915]/5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#141915]">Mobile Viewport</span>
                  <span className="text-[10px] text-[#666C64]">Zero Horizontal Overflow</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Global Brand Tokens (Span 6) */}
          <div className="lg:col-span-6 group relative flex flex-col justify-between overflow-hidden rounded-[30px] border border-[#141915]/10 bg-white p-8 sm:p-10 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0C3823]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0C3823]">
                  <Sliders className="w-3.5 h-3.5" />
                  Global Tokens
                </span>
                <span className="font-mono text-xs font-semibold text-[#141915]/40">
                  PILLAR // 05
                </span>
              </div>

              <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-[#141915] mb-3">
                One-Click Brand Adaptation
              </h3>
              <p className="text-base text-[#555C54] leading-relaxed">
                Input your brand colors, primary typography, border radius, and spacing. Frame Drop automatically propagates your design system across every section in real time.
              </p>
            </div>

            {/* Interactive Color Token Picker */}
            <div className="mt-8 bg-[#F7F4ED] rounded-2xl p-4 sm:p-5 border border-[#141915]/10">
              <span className="text-xs font-mono font-semibold text-[#141915] block mb-3">
                Active Brand Palette: {brandColors[activeBrandColor].name}
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {(['forest', 'emerald', 'amber', 'violet'] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveBrandColor(key)}
                    className={cn(
                      'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all cursor-pointer border',
                      activeBrandColor === key
                        ? 'border-[#141915] bg-white shadow-2xs scale-105'
                        : 'border-transparent bg-white/60 hover:bg-white text-[#666C64]'
                    )}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full shadow-xs"
                      style={{ backgroundColor: brandColors[key].hex }}
                    />
                    <span className="capitalize">{key}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 6: Enterprise Safety & Non-Destructive Code (Span 6) */}
          <div className="lg:col-span-6 group relative flex flex-col justify-between overflow-hidden rounded-[30px] border border-[#141915]/10 bg-white p-8 sm:p-10 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#141915] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  <Cpu className="w-3.5 h-3.5 text-[#CCFF00]" />
                  Engineered by Qubtic
                </span>
                <span className="font-mono text-xs font-semibold text-[#141915]/40">
                  PILLAR // 06
                </span>
              </div>

              <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-[#141915] mb-3">
                Atomic Canvas Safety
              </h3>
              <p className="text-base text-[#555C54] leading-relaxed">
                Never worry about overwriting custom code. Frame Drop checks version hashes, isolates overrides, and executes atomic rollbacks if anything interrupts your insertion.
              </p>
            </div>

            {/* Atomic Checksum Visual */}
            <div className="mt-8 rounded-2xl bg-[#082417] p-4 text-white font-mono text-xs border border-white/10">
              <div className="flex items-center justify-between text-[#CCFF00] pb-2 border-b border-white/10 mb-2.5">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  SHA256 Collision Prevention
                </span>
                <span>Active Protection</span>
              </div>
              <p className="text-white/70 text-[11px] leading-relaxed font-sans">
                Each insertion computes a diff tree hash. Custom components in your canvas are quarantined from destructive overwrites.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
