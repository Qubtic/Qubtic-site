'use client';

import * as React from 'react';
import {
  Sparkles,
  Tag,
  Calendar,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Sliders,
  KeyRound,
  Cpu
} from 'lucide-react';

export function FrameDropChangelog() {
  const changelogItems = [
    {
      title: 'Expanded Section Catalog',
      badge: '25+ Sections',
      description:
        'Curated sections across Heroes, Floating Navbars, Bento Grids, Social Proof & Stats, Pricing Matrices, and FAQs.',
      icon: Layers,
    },
    {
      title: 'Liquid Glassmorphism Design System',
      badge: 'Obsidian & Crystal',
      description:
        'Obsidian Dark (#0A0D0C) and Crystal Light palettes with calibrated elevation, translucent glass borders, and backdrop filters.',
      icon: Sliders,
    },
    {
      title: 'Page Studio Composer',
      badge: 'Studio Mode',
      description:
        'Reorder and preview multi-slot sections with live copy editing before canvas generation.',
      icon: Sparkles,
    },
    {
      title: 'Preflight Quality Engine',
      badge: 'WCAG AA Verified',
      description:
        'Built-in automated checks for WCAG AA contrast, mobile overflow heuristics, and heading hierarchy.',
      icon: ShieldCheck,
    },
    {
      title: 'Passwordless OTP Sign-in',
      badge: 'Qubtic Auth',
      description:
        'Instant, secure authentication via Qubtic Auth for Early Bird & Pro members.',
      icon: KeyRound,
    },
    {
      title: 'Non-Destructive Canvas Architecture',
      badge: 'Atomic Safety',
      description:
        'Smart component file collision detection, preventing any accidental overwrite of your existing Framer code.',
      icon: Cpu,
    },
  ];

  return (
    <section id="changelog" className="scroll-mt-36 py-12 sm:py-16 relative">
      <div className="relative mx-auto w-full">

        {/* Release Tag Ribbon */}
        <div className="rounded-[32px] border border-[#141915]/10 bg-white p-8 sm:p-12 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-[#141915]/10 mb-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0C3823] px-3.5 py-1 text-xs font-mono font-bold text-white">
                <Tag className="w-3.5 h-3.5 text-[#CCFF00]" />
                Release v0.2.0
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#666C64] font-medium">
                <Calendar className="w-3.5 h-3.5" />
                October 2026
              </span>
              <span className="rounded-full bg-[#F4EFE6] px-3 py-1 text-xs font-semibold text-[#141915]">
                Product Launch &amp; Updates
              </span>
            </div>

            <span className="text-xs font-mono text-[#0C3823] font-bold">
              BUILD #2026.10-STABLE
            </span>
          </div>

          {/* Heading & Quote Callout */}
          <div className="max-w-4xl mb-10">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-[#141915] mb-6 leading-tight">
              What&apos;s New: Introducing Frame Drop for Framer by Qubtic
            </h2>

            <blockquote className="rounded-2xl border-l-4 border-[#0C3823] bg-[#F8F6F0] p-6 text-base sm:text-lg italic text-[#444A42] leading-relaxed">
              &ldquo;We&apos;re excited to unveil Frame Drop-a native Framer plugin built by the Qubtic Technologies engineering and design teams to accelerate how modern websites are built.&rdquo;
            </blockquote>
          </div>

          {/* What's Included Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#0C3823] mb-6">
              What&apos;s Included in this Release:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {changelogItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex flex-col justify-between rounded-2xl border border-[#141915]/8 bg-[#F8F6F0]/50 p-6 transition-all hover:bg-white hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 rounded-xl bg-white shadow-2xs border border-[#141915]/5 text-[#0C3823]">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-[#0C3823] bg-[#0C3823]/10 px-2.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      </div>

                      <h4 className="font-heading text-lg font-bold uppercase text-[#141915] mb-2 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#555C54] leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#141915]/8 flex items-center gap-1.5 text-xs font-semibold text-[#0C3823]">
                      <CheckCircle2 className="w-4 h-4 text-[#0C3823]" />
                      <span>Production Ready</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
