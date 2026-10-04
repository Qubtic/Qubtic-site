'use client';

import * as React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  Smartphone, 
  Type, 
  Eye, 
  ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FrameDropPreflightEngineProps {
  className?: string;
}

export function FrameDropPreflightEngine({ className }: FrameDropPreflightEngineProps) {
  const [isRunningAudit, setIsRunningAudit] = React.useState(false);
  const [lastScanned, setLastScanned] = React.useState('Just now');
  const [auditScore, setAuditScore] = React.useState(100);

  const handleRunAudit = () => {
    setIsRunningAudit(true);
    setTimeout(() => {
      setIsRunningAudit(false);
      setLastScanned('Just now');
      setAuditScore(100);
    }, 1200);
  };

  const auditChecks = [
    {
      title: 'Automated Contrast Ratio Verification',
      badge: '≥ 4.5:1 WCAG AA',
      status: 'Passed (4.85:1 avg)',
      description: 'Scans all foreground typography against Obsidian Dark (#0A0D0C) and Crystal Light (#F4EFE6) backgrounds.',
      icon: Eye,
    },
    {
      title: 'Semantic Heading Hierarchy Scanner',
      badge: 'H1 - H4 Architecture',
      status: 'Passed (No Skipped Levels)',
      description: 'Guarantees singular document H1 with strict sequential descending H2/H3 nesting for screen readers.',
      icon: Type,
    },
    {
      title: 'Media Alt-Text & ARIA Label Engine',
      badge: '100% Coverage',
      status: 'Passed (0 Missing Tags)',
      description: 'Checks decorative vs informational images, ensuring descriptive alt tags and ARIA hidden attributes.',
      icon: ImageIcon,
    },
    {
      title: 'Mobile Viewport & Tap Target Heuristics',
      badge: '48x48px Minimum',
      status: 'Passed (Zero Overflow)',
      description: 'Simulates mobile device rendering to prevent horizontal scroll bars and enforce comfortable touch targets.',
      icon: Smartphone,
    },
  ];

  return (
    <section id="preflight-engine" className={cn('scroll-mt-36 py-12 sm:py-16 relative', className)}>
      <div className="relative mx-auto w-full">
        
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 sm:mb-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-800 mb-3.5 shadow-2xs backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              QUALITY PREFLIGHT ENGINE
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-[#141915] leading-tight">
              Built-in Quality Preflight Engine
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#555C54] leading-relaxed">
              Every section passes automated contrast ratio audits (≥ 4.5:1), heading hierarchy verification, image alt-text scans, and mobile viewport checks before you publish.
            </p>
          </div>

          {/* Trigger Scan Controls */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#141915]/10 text-xs text-[#555C54] shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Last Verification: <strong className="text-[#141915] font-semibold">{lastScanned}</strong></span>
            </div>

            <button
              type="button"
              onClick={handleRunAudit}
              disabled={isRunningAudit}
              className="inline-flex items-center gap-2 rounded-full bg-[#0C3823] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-all duration-200 hover:bg-[#164E33] hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isRunningAudit && 'animate-spin')} />
              <span>{isRunningAudit ? 'Scanning Canvas...' : 'Run Preflight Audit'}</span>
            </button>
          </div>
        </div>

        {/* Audit Dashboard Card */}
        <div className="rounded-[32px] border border-[#141915]/10 bg-white p-6 sm:p-8 md:p-10 shadow-sm">
          
          {/* Top Score Banner */}
          <div className="flex flex-wrap items-center justify-between gap-6 pb-6 sm:pb-8 border-b border-[#141915]/10 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-mono text-xl sm:text-2xl font-extrabold shadow-2xs border border-emerald-200">
                {auditScore}%
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold uppercase text-[#141915]">
                    Accessibility &amp; Structural Health Score
                  </h3>
                  <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Compliant
                  </span>
                </div>
                <p className="text-xs text-[#666C64] mt-0.5">
                  Pre-insertion preflight engine guarantees zero compliance warnings on Framer publish.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-[#141915]">WCAG 2.1 AA / AAA</span>
              <span className="text-[11px] text-[#666C64]">European &amp; US Standards</span>
            </div>
          </div>

          {/* Audit Items 4-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {auditChecks.map((check) => {
              const Icon = check.icon;
              return (
                <div
                  key={check.title}
                  className="flex flex-col justify-between rounded-2xl border border-[#141915]/8 bg-[#F8F6F0]/60 p-5 transition-all duration-200 hover:bg-white hover:shadow-md hover:border-[#141915]/15"
                >
                  <div>
                    {/* Icon & Badge Header */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-2xs border border-[#141915]/5 text-[#0C3823]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                        {check.badge}
                      </span>
                    </div>

                    <h4 className="font-heading text-sm font-bold uppercase text-[#141915] mb-2 leading-snug">
                      {check.title}
                    </h4>
                    <p className="text-xs text-[#555C54] leading-relaxed mb-4">
                      {check.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#141915]/8 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5 whitespace-nowrap">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{check.status}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
