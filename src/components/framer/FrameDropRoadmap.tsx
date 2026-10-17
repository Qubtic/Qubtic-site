'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ShieldCheck, 
  Palette, 
  Database, 
  Cpu, 
  ArrowUpRight, 
  Lightbulb, 
  ExternalLink,
  ChevronRight,
  GitBranch,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FrameDropInstallModal } from '@/components/framer/FrameDropInstallModal';

export type RoadmapStatus = 'shipped' | 'in-progress' | 'planned' | 'under-review';

export interface RoadmapItem {
  id: string;
  title: string;
  category: 'Canvas Engine' | 'Component Presets' | 'Design Tokens' | 'CMS & Blueprints' | 'Accessibility';
  status: RoadmapStatus;
  milestone: string;
  description: string;
  highlights: string[];
  votes: number;
}

const roadmapData: RoadmapItem[] = [
  // Shipped (v0.2.0)
  {
    id: 'feat-catalog-34',
    title: '34+ Production Section Presets',
    category: 'Component Presets',
    status: 'shipped',
    milestone: 'v0.2.0 (Stable)',
    description: 'Curated library of 34 production-ready Framer sections across 10 categories: Heroes, Navigation, Bento Grids, Features, Services, Stats, Portfolio, Pricing, FAQs, and CTAs.',
    highlights: ['100% Native React code', 'Early Bird Pro tier support', '1-Click canvas drop'],
    votes: 342,
  },
  {
    id: 'feat-liquid-glass',
    title: 'Liquid Glassmorphism Design System',
    category: 'Design Tokens',
    status: 'shipped',
    milestone: 'v0.2.0 (Stable)',
    description: 'Calibrated token harmony featuring Obsidian Dark (#0A0D0C) and Crystal Light (#F4EFE6) palettes with optical refraction and translucent borders.',
    highlights: ['Theme duality switcher', 'Sub-pixel glass borders', 'Optical blur presets'],
    votes: 288,
  },
  {
    id: 'feat-preflight-engine',
    title: 'Automated WCAG AA Preflight Engine',
    category: 'Accessibility',
    status: 'shipped',
    milestone: 'v0.2.0 (Stable)',
    description: 'Integrated pre-insertion verification guaranteeing >= 4.5:1 contrast ratios, single H1 heading hierarchy, descriptive image alt-tags, and 48x48px tap targets.',
    highlights: ['Zero compliance warnings', 'Real-time score audit', 'Mobile overflow checks'],
    votes: 215,
  },
  {
    id: 'feat-non-destructive-safety',
    title: 'Non-Destructive Canvas Safety & Rollback',
    category: 'Canvas Engine',
    status: 'shipped',
    milestone: 'v0.2.0 (Stable)',
    description: 'Isolated component code files (FrameDropSection.tsx) with transactional rollback if an insertion is interrupted or fails.',
    highlights: ['Zero code overwrite', 'Namespace sandboxing', 'Automated node teardown'],
    votes: 264,
  },
  {
    id: 'feat-external-web-pairing',
    title: 'Browser Pairing Authentication on Qubtic',
    category: 'Canvas Engine',
    status: 'shipped',
    milestone: 'v0.2.0 (Stable)',
    description: 'RFC 8628 pairing flow handing off authentication securely to qubtic.tech without collecting passwords or PII inside the plugin.',
    highlights: ['1-Click browser handoff', 'Auto-sync pairing code', 'Early Bird Pro entitlement'],
    votes: 198,
  },

  // In Development (v0.2.1)
  {
    id: 'feat-canvas-sync',
    title: 'Bi-Directional Canvas Node Sync',
    category: 'Canvas Engine',
    status: 'in-progress',
    milestone: 'v0.2.1 (Q4 2026)',
    description: 'Read live property overrides directly from the active Framer canvas tree and reflect customized token values back into the plugin UI.',
    highlights: ['Active node inspection', 'Live token reflection', 'Zero re-import latency'],
    votes: 412,
  },
  {
    id: 'feat-cms-autolink',
    title: 'One-Click Framer CMS Blueprints',
    category: 'CMS & Blueprints',
    status: 'in-progress',
    milestone: 'v0.2.1 (Q4 2026)',
    description: 'Automated provisioning of editable Framer CMS collections for portfolio case studies, blog resources, and team member directories.',
    highlights: ['Pre-mapped schema fields', 'Sample content generator', 'Dynamic slot binding'],
    votes: 356,
  },
  {
    id: 'feat-smart-color-mapper',
    title: 'Intelligent Project Color Style Matcher',
    category: 'Design Tokens',
    status: 'in-progress',
    milestone: 'v0.2.1 (Q4 2026)',
    description: 'Scan all existing Framer color styles in the active project and automatically map brand tokens to matching local color variables.',
    highlights: ['Framer style auto-detect', 'Token mapping matrix', 'Live contrast evaluation'],
    votes: 279,
  },

  // Planned (v0.3.0)
  {
    id: 'feat-page-studio-composer',
    title: 'Full Page Multi-Slot Composer with Drag & Drop',
    category: 'Canvas Engine',
    status: 'planned',
    milestone: 'v0.3.0 (Q1 2027)',
    description: 'Visual multi-section builder allowing designers to assemble, reorder, preview, and insert complete landing pages in a single transaction.',
    highlights: ['Drag-and-drop reordering', 'Shared brand propagating', 'Full page 1-click drop'],
    votes: 520,
  },
  {
    id: 'feat-custom-component-exporter',
    title: 'Standalone Component TSX Exporter',
    category: 'Component Presets',
    status: 'planned',
    milestone: 'v0.3.0 (Q1 2027)',
    description: 'Export customized Framer components as self-contained TypeScript/React packages for direct integration in Next.js or Vite projects.',
    highlights: ['Clean Tailwind/CSS output', 'Zero vendor lock-in', 'Portable React TSX'],
    votes: 384,
  },
  {
    id: 'feat-breakpoint-staging',
    title: 'Interactive Multi-Breakpoint Staging View',
    category: 'Accessibility',
    status: 'planned',
    milestone: 'v0.3.0 (Q1 2027)',
    description: 'Simultaneous side-by-side preview of sections across 375px (Mobile), 768px (Tablet), 1200px (Desktop), and 1440px (Ultra-wide).',
    highlights: ['Live synchronized scrolling', 'Container query debugging', 'Tap target validation'],
    votes: 310,
  },

  // Under Review
  {
    id: 'feat-ai-copy-sync',
    title: 'Context-Aware Copy & Brand Voice Generator',
    category: 'CMS & Blueprints',
    status: 'under-review',
    milestone: 'Under Consideration',
    description: 'Generate high-converting headlines, body copy, and value propositions tailored to your company website and industry positioning.',
    highlights: ['Brand tone calibration', 'WCAG headline lengths', 'Instant slot populator'],
    votes: 245,
  },
];

const statusTabs = [
  { label: 'All Milestones', value: 'all' },
  { label: 'Shipped (v0.2.0)', value: 'shipped' },
  { label: 'In Development (v0.2.1)', value: 'in-progress' },
  { label: 'Planned (v0.3.0)', value: 'planned' },
  { label: 'Under Consideration', value: 'under-review' },
] as const;

export function FrameDropRoadmap() {
  const [selectedFilter, setSelectedFilter] = React.useState<string>('all');
  const [isInstallOpen, setIsInstallOpen] = React.useState(false);

  const filteredItems = roadmapData.filter((item) => {
    if (selectedFilter === 'all') return true;
    return item.status === selectedFilter;
  });

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
            <span className="text-[#141915]">Product Roadmap</span>
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
              href="/framer/frame-drop/version-control"
              className="text-xs font-semibold text-[#555C54] hover:text-[#141915] transition-colors"
            >
              <span>Version Control</span>
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
            <Compass className="w-3.5 h-3.5 text-[#0C3823]" />
            PRODUCT EVOLUTION &amp; TRAJECTORY
          </span>
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight text-[#141915] leading-[1.05] mb-6">
            Frame Drop Public Roadmap
          </h1>
          <p className="text-base sm:text-lg text-[#555C54] leading-relaxed max-w-3xl">
            Discover what our engineering and design teams are actively shipping, testing, and planning for Frame Drop. Every feature is prioritized according to real community feedback and production studio demands.
          </p>
        </div>

        {/* Milestone Quick Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          <div className="rounded-[24px] border border-[#141915]/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Active Release
              </span>
              <span className="font-mono text-xs font-bold text-[#0C3823]">v0.2.0</span>
            </div>
            <h3 className="font-heading text-lg font-bold uppercase text-[#141915] mb-1">
              Production Foundation
            </h3>
            <p className="text-xs text-[#555C54] leading-relaxed">
              34 Section Presets, Liquid Glassmorphism tokens, automated WCAG AA checks, and RFC 8628 pairing auth.
            </p>
          </div>

          <div className="rounded-[24px] border border-[#141915]/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-800 bg-blue-100 border border-blue-200 px-2.5 py-0.5 rounded-full">
                In Development
              </span>
              <span className="font-mono text-xs font-bold text-blue-700">v0.2.1</span>
            </div>
            <h3 className="font-heading text-lg font-bold uppercase text-[#141915] mb-1">
              Studio Intelligence
            </h3>
            <p className="text-xs text-[#555C54] leading-relaxed">
              Live Bi-Directional Canvas Node Sync, Framer CMS Collection auto-blueprints, and Project Color Matcher.
            </p>
          </div>

          <div className="rounded-[24px] border border-[#141915]/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full">
                Planned
              </span>
              <span className="font-mono text-xs font-bold text-amber-700">v0.3.0</span>
            </div>
            <h3 className="font-heading text-lg font-bold uppercase text-[#141915] mb-1">
              Visual Page Composer
            </h3>
            <p className="text-xs text-[#555C54] leading-relaxed">
              Drag-and-drop full page assembler, portable React TSX exporter, and live synchronized breakpoint staging.
            </p>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-10 overflow-x-auto pb-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedFilter(tab.value)}
              className={cn(
                'rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 border',
                selectedFilter === tab.value
                  ? 'bg-[#0C3823] text-white border-[#0C3823] shadow-xs'
                  : 'bg-white text-[#666C64] border-[#141915]/10 hover:bg-[#F4EFE6] hover:text-[#141915]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Roadmap Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch mb-16">
          {filteredItems.map((item) => {
            const isShipped = item.status === 'shipped';
            const isInProgress = item.status === 'in-progress';
            const isPlanned = item.status === 'planned';

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-[28px] border border-[#141915]/10 bg-white p-6 sm:p-7 shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#141915]/20"
              >
                <div>
                  {/* Top Bar with Category, Milestone & Status */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0C3823] bg-[#0C3823]/10 px-2.5 py-1 rounded-full">
                      {item.category}
                    </span>

                    <span
                      className={cn(
                        'text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border',
                        isShipped && 'bg-emerald-100 text-emerald-800 border-emerald-300',
                        isInProgress && 'bg-blue-100 text-blue-800 border-blue-300',
                        isPlanned && 'bg-amber-100 text-amber-800 border-amber-300',
                        item.status === 'under-review' && 'bg-purple-100 text-purple-800 border-purple-300'
                      )}
                    >
                      {item.milestone}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-heading text-xl font-bold uppercase text-[#141915] mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#555C54] leading-relaxed mb-6">
                    {item.description}
                  </p>

                  {/* Feature Highlights List */}
                  <div className="space-y-2 mb-6">
                    {item.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#141915]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0C3823] shrink-0" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="pt-4 border-t border-[#141915]/10 flex items-center justify-between">
                  <span className="text-xs font-mono text-[#666C64]">
                    {item.votes} Community Votes
                  </span>

                  <Link
                    href="/feature-request"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0C3823] hover:underline"
                  >
                    <span>Vote / Feedback</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Suggestion Bottom Card */}
        <div className="rounded-[32px] border border-[#141915]/10 bg-[#0C3823] text-white p-8 sm:p-12 shadow-lg relative overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#164E33] blur-3xl opacity-80" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#CCFF00] mb-4">
              <Lightbulb className="w-3.5 h-3.5 text-[#CCFF00]" />
              HAVE A FEATURE REQUEST?
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
              Shape the Next Release of Frame Drop
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-6">
              Our engineering team reviews community ideas on weekly triage sprints. Submit your component layouts, token needs, or Framer integration ideas directly.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/feature-request"
                className="inline-flex items-center gap-2 rounded-full bg-[#CCFF00] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#141915] shadow-xs hover:bg-[#b8e600] transition-colors"
              >
                <span>Submit Feature Request</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/framer/frame-drop/docs"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-colors"
              >
                <span>Browse Live Docs</span>
              </Link>
            </div>
          </div>
        </div>

      </div>

      <FrameDropInstallModal isOpen={isInstallOpen} onClose={() => setIsInstallOpen(false)} />
    </div>
  );
}
