'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  GitBranch, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  Save, 
  FileCode2, 
  Layers, 
  History, 
  ExternalLink, 
  Cpu, 
  ArrowRight,
  Terminal,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FrameDropInstallModal } from '@/components/framer/FrameDropInstallModal';

interface MockSnapshot {
  id: string;
  name: string;
  date: string;
  sectionsCount: number;
  theme: string;
  badge: string;
}

export function FrameDropVersionControl() {
  const [isInstallOpen, setIsInstallOpen] = React.useState(false);
  const [simulatedSnapshots, setSimulatedSnapshots] = React.useState<MockSnapshot[]>([
    {
      id: 'snap-03',
      name: 'Client Presentation Final Draft',
      date: '10 mins ago',
      sectionsCount: 5,
      theme: 'Obsidian Dark',
      badge: 'Active Draft',
    },
    {
      id: 'snap-02',
      name: 'Light Mode Typography Exploration',
      date: '2 hours ago',
      sectionsCount: 4,
      theme: 'Crystal Light',
      badge: 'Snapshot',
    },
    {
      id: 'snap-01',
      name: 'Initial Wireframe Composition',
      date: 'Yesterday',
      sectionsCount: 3,
      theme: 'Obsidian Dark',
      badge: 'Baseline',
    },
  ]);
  const [activeSnapshotId, setActiveSnapshotId] = React.useState('snap-03');
  const [rollbackSuccess, setRollbackSuccess] = React.useState<string | null>(null);

  const handleSimulateRollback = (id: string, name: string) => {
    setActiveSnapshotId(id);
    setRollbackSuccess(name);
    setTimeout(() => {
      setRollbackSuccess(null);
    }, 3000);
  };

  const releases = [
    {
      version: 'v0.2.1',
      badge: 'Current Stable',
      date: 'October 2026',
      summary: 'Framer Marketplace Security Hardening, Zero-PII Browser Pairing on Qubtic, and Strict DOM Sanitization.',
      changes: [
        'Eliminated all in-plugin personal identity fields (email, name, OTP) in favor of RFC 8628 OAuth 2.0 Device Pairing on qubtic.tech.',
        'Permanently locked backend API endpoint to https://qubtic.tech with zero arbitrary URL configuration or local storage overrides.',
        'Removed all external health check probes, /api/health requests, and background interval polling.',
        'Enforced strict DOM and element sanitization with zero raw innerHTML or dangerouslySetInnerHTML sinks.',
        'Added dynamic brand logo customization with vector emblem and image URL support.',
      ],
    },
    {
      version: 'v0.2.0',
      badge: 'Previous Milestone',
      date: 'October 2026',
      summary: '34 Production Section Presets, Liquid Glassmorphism Design System, and WCAG Preflight Engine.',
      changes: [
        'Added 34 production-grade section presets across 10 core page categories.',
        'Integrated automated WCAG AA preflight contrast checker (>= 4.5:1 ratio).',
        'Built-in non-destructive canvas architecture with transactional rollback on insertion interrupts.',
        'Curated 13-preset typography suite including Plus Jakarta Sans, Syne, and Cinzel.',
      ],
    },
    {
      version: 'v0.1.5',
      badge: 'Previous Milestone',
      date: 'September 2026',
      summary: 'Visual Studio Flow Composer, Obsidian Dark & Crystal Light palettes, and portable JSON backup.',
      changes: [
        'Added visual multi-slot reordering and live copy editing before dropping to canvas.',
        'Introduced dual theme token harmony with translucent glassmorphic borders.',
        'Enabled portable workspace state backup and restore via standard JSON.',
        'Framer CMS collection blueprints for Case Studies and Journal Resources.',
      ],
    },
    {
      version: 'v0.1.0',
      badge: 'Initial Release',
      date: 'August 2026',
      summary: 'Initial canvas insertion engine and foundation component library.',
      changes: [
        'Initial Framer Plugin Marketplace build with 15 core section layouts.',
        'Responsive container query breakpoints across mobile, tablet, and desktop.',
        'Pure native Framer React component generation with zero dependencies.',
      ],
    },
  ];

  return (
    <div className="relative pt-24 pb-20 sm:pt-28">
      {/* Top Banner / Breadcrumbs */}
      <div className="border-b border-[#141915]/10 bg-[#F4EFE6] sticky top-[68px] z-30 shadow-2xs">
        <div className="mx-auto max-w-[1720px] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
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
            <span className="text-[#141915]">Version Control &amp; Rollback</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/framer/frame-drop/docs"
              className="text-xs font-semibold text-[#555C54] hover:text-[#141915] transition-colors"
            >
              <span>Documentation</span>
            </Link>
            <span className="text-[#141915]/20">&bull;</span>
            <Link
              href="/framer/frame-drop/roadmap"
              className="text-xs font-semibold text-[#555C54] hover:text-[#141915] transition-colors"
            >
              <span>Product Roadmap</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsInstallOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#0C3823] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-2xs hover:bg-[#164E33] transition-colors cursor-pointer ml-2"
            >
              <span>Install Plugin</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1720px] px-4 sm:px-8 md:px-12 lg:px-16 pt-12 sm:pt-16">
        
        {/* Header Hero */}
        <div className="max-w-4xl mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0C3823]/15 bg-white/70 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0C3823] mb-4 shadow-2xs backdrop-blur-md">
            <GitBranch className="w-3.5 h-3.5 text-[#0C3823]" />
            CANVAS VERSION CONTROL &amp; ROLLBACK
          </span>
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight text-[#141915] leading-[1.05] mb-6">
            Non-Destructive Safety &amp; Version History
          </h1>
          <p className="text-base sm:text-lg text-[#555C54] leading-relaxed max-w-3xl">
            Never risk losing client work or overwriting existing component code. Frame Drop isolates code generation into safe namespaces, provides point-in-time draft snapshots, and executes automated transactional rollbacks.
          </p>
        </div>

        {/* 3 Pillars of Version Control Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="rounded-[28px] border border-[#141915]/10 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0C3823] text-white mb-5 shadow-2xs">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl font-bold uppercase text-[#141915] mb-2">
              Transactional Rollback
            </h3>
            <p className="text-xs sm:text-sm text-[#555C54] leading-relaxed mb-4">
              If a network interruption, permission error, or manual cancellation occurs during insertion, all generated canvas nodes are immediately swept and removed, preserving your canvas tree.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Automated Teardown Active
            </span>
          </div>

          <div className="rounded-[28px] border border-[#141915]/10 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0C3823] text-white mb-5 shadow-2xs">
              <FileCode2 className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl font-bold uppercase text-[#141915] mb-2">
              Code File Isolation
            </h3>
            <p className="text-xs sm:text-sm text-[#555C54] leading-relaxed mb-4">
              Frame Drop inspects existing project files before writing. Component exports are sandboxed into dedicated files (e.g. <code>FrameDropSection.tsx</code>), avoiding collisions with custom user code.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#0C3823] bg-[#0C3823]/10 px-2.5 py-1 rounded-full">
              <Cpu className="w-3.5 h-3.5" />
              Namespace Sandboxed
            </span>
          </div>

          <div className="rounded-[28px] border border-[#141915]/10 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0C3823] text-white mb-5 shadow-2xs">
              <History className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl font-bold uppercase text-[#141915] mb-2">
              Draft Version Snapshots
            </h3>
            <p className="text-xs sm:text-sm text-[#555C54] leading-relaxed mb-4">
              Capture point-in-time snapshots of your page layouts, custom copy, and token settings. Restore previous iterations in 1 click or export portable JSON backups across team projects.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              <Save className="w-3.5 h-3.5 text-blue-600" />
              1-Click Snapshot Restore
            </span>
          </div>
        </div>

        {/* Interactive Snapshot Simulator Section */}
        <div className="rounded-[32px] border border-[#141915]/10 bg-white p-6 sm:p-10 shadow-sm mb-16">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#141915]/10 mb-8">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0C3823] bg-[#0C3823]/10 px-3 py-1 rounded-full">
                Interactive Simulator
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-[#141915] mt-2">
                Draft Snapshot &amp; Rollback Manager
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#666C64] max-w-md">
              Test how Frame Drop records point-in-time composition states and allows instantaneous rollbacks without modifying published canvas files.
            </p>
          </div>

          {rollbackSuccess && (
            <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Draft state successfully rolled back to <strong>&ldquo;{rollbackSuccess}&rdquo;</strong>!</span>
            </div>
          )}

          <div className="space-y-4">
            {simulatedSnapshots.map((snap) => {
              const isActive = activeSnapshotId === snap.id;
              return (
                <div
                  key={snap.id}
                  className={cn(
                    'flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border transition-all duration-200',
                    isActive
                      ? 'bg-[#F4EFE6] border-[#0C3823]/30 shadow-xs'
                      : 'bg-[#F8F6F0]/60 border-[#141915]/10 hover:bg-white'
                  )}
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold',
                        isActive ? 'bg-[#0C3823] text-white' : 'bg-white text-[#555C54] border border-[#141915]/10'
                      )}
                    >
                      <History className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h4 className="font-heading text-base font-bold text-[#141915]">
                          {snap.name}
                        </h4>
                        <span
                          className={cn(
                            'text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase',
                            isActive ? 'bg-[#0C3823] text-white' : 'bg-black/5 text-[#666C64]'
                          )}
                        >
                          {snap.badge}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#666C64]">
                        <span>{snap.date}</span>
                        <span>&bull;</span>
                        <span>{snap.sectionsCount} Sections</span>
                        <span>&bull;</span>
                        <span>Theme: {snap.theme}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider">
                        <Check className="w-3.5 h-3.5" />
                        Current Active State
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSimulateRollback(snap.id, snap.name)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#0C3823] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-[#164E33] transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Rollback to This</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Release Version History Section */}
        <div className="rounded-[32px] border border-[#141915]/10 bg-white p-6 sm:p-10 shadow-sm mb-16">
          <div className="flex items-center justify-between pb-6 border-b border-[#141915]/10 mb-8">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0C3823] bg-[#0C3823]/10 px-3 py-1 rounded-full">
                Version History
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-[#141915] mt-2">
                Release Timeline &amp; Changelog
              </h2>
            </div>
            <span className="font-mono text-xs text-[#0C3823] font-bold">
              BUILD #2026.10-STABLE
            </span>
          </div>

          <div className="space-y-8">
            {releases.map((rel) => (
              <div key={rel.version} className="relative pl-6 sm:pl-8 border-l-2 border-[#0C3823]/20 pb-6 last:pb-0">
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-[#0C3823] border-4 border-white" />
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="font-heading text-xl font-bold text-[#141915]">
                    {rel.version}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#0C3823] bg-[#0C3823]/10 px-2.5 py-0.5 rounded-full">
                    {rel.badge}
                  </span>
                  <span className="text-xs text-[#666C64]">
                    {rel.date}
                  </span>
                </div>
                <p className="text-sm font-medium text-[#141915] mb-4">
                  {rel.summary}
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-[#555C54]">
                  {rel.changes.map((change, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0C3823] mt-2 shrink-0" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

      </div>

      <FrameDropInstallModal isOpen={isInstallOpen} onClose={() => setIsInstallOpen(false)} />
    </div>
  );
}
