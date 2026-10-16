'use client';

import * as React from 'react';
import { 
  Search, 
  Check, 
  Copy, 
  ArrowDownToLine, 
  ShieldCheck, 
  Smartphone, 
  Code 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CatalogItem {
  id: string;
  name: string;
  category: 'Heroes' | 'Floating Navbars' | 'Bento Grids' | 'Social Proof & Stats' | 'Pricing Matrices' | 'FAQs & Support';
  description: string;
  wcagContrast: string;
  responsiveBreakpoints: string[];
  slots: number;
  previewGradient: string;
  codeSnippet: string;
}

const catalogData: CatalogItem[] = [
  // Heroes
  {
    id: 'hero-01',
    name: 'Liquid Glass Split Media Hero',
    category: 'Heroes',
    description: 'Hero layout with backdrop-blur cards, dual CTAs, trust metric bar, and interactive 3D media container.',
    wcagContrast: '5.2:1',
    responsiveBreakpoints: ['Desktop (1440px)', 'Tablet (810px)', 'Mobile (390px)'],
    slots: 4,
    previewGradient: 'from-[#0C3823] to-[#082417]',
    codeSnippet: `<HeroSection theme="obsidian" backdropBlur="24px" ctaPrimary="Install Free" />`,
  },
  {
    id: 'hero-02',
    name: 'Minimalist Typography SaaS Hero',
    category: 'Heroes',
    description: 'Ultra-clean editorial headline with animated watermark, email capture input, and client badge ticker.',
    wcagContrast: '7.1:1',
    responsiveBreakpoints: ['Desktop', 'Tablet', 'Mobile'],
    slots: 3,
    previewGradient: 'from-[#141915] to-[#1c221d]',
    codeSnippet: `<MinimalHero heading="Design. Drop. Deploy." captureEmail={true} />`,
  },
  {
    id: 'hero-03',
    name: 'Bento Showcase Launchpad Hero',
    category: 'Heroes',
    description: 'Dynamic multi-card hero featuring floating live stats, code preview snippet, and responsive video reel.',
    wcagContrast: '4.9:1',
    responsiveBreakpoints: ['Desktop', 'Tablet', 'Mobile'],
    slots: 5,
    previewGradient: 'from-[#0A0D0C] to-[#164E33]',
    codeSnippet: `<BentoHero layout="3-col" interactiveWidgets={true} />`,
  },
  {
    id: 'hero-04',
    name: 'Editorial Studio Portfolio Hero',
    category: 'Heroes',
    description: 'Asymmetric typography layout with oversized numerals, custom hover cursors, and project preview reel.',
    wcagContrast: '6.4:1',
    responsiveBreakpoints: ['Desktop', 'Tablet', 'Mobile'],
    slots: 3,
    previewGradient: 'from-[#164E33] to-[#0C3823]',
    codeSnippet: `<StudioHero watermark="QUBTIC" studioMode={true} />`,
  },

  // Floating Navbars
  {
    id: 'nav-01',
    name: 'Refractive Glass Capsule Navbar',
    category: 'Floating Navbars',
    description: 'Floating pill navigation with real-time blur saturation, active route glow, and mobile drawer.',
    wcagContrast: '4.8:1',
    responsiveBreakpoints: ['All Breakpoints'],
    slots: 3,
    previewGradient: 'from-[#0C3823]/80 to-[#141915]/90',
    codeSnippet: `<GlassNavbar style="capsule" blur={28} sheenAnimation={true} />`,
  },
  {
    id: 'nav-02',
    name: 'Enterprise Sticky Split Header',
    category: 'Floating Navbars',
    description: 'Header with mega-menu dropdown support, multi-currency switcher, and notification beacon.',
    wcagContrast: '5.5:1',
    responsiveBreakpoints: ['Desktop', 'Tablet', 'Mobile'],
    slots: 4,
    previewGradient: 'from-[#141915] to-[#0A0D0C]',
    codeSnippet: `<EnterpriseHeader sticky={true} megaMenu={true} />`,
  },
  {
    id: 'nav-03',
    name: 'Minimal Clean Brand Header',
    category: 'Floating Navbars',
    description: 'Zero-clutter brand bar with inline contact CTA and hamburger menu for mobile devices.',
    wcagContrast: '8.0:1',
    responsiveBreakpoints: ['Desktop', 'Tablet', 'Mobile'],
    slots: 2,
    previewGradient: 'from-[#164E33] to-[#141915]',
    codeSnippet: `<BrandHeader contactLink="/contact" />`,
  },

  // Bento Grids
  {
    id: 'bento-01',
    name: 'Obsidian 6-Pack Architecture Bento',
    category: 'Bento Grids',
    description: 'Calibrated asymmetric grid featuring dark glass surfaces, neon accents, and interactive feature cards.',
    wcagContrast: '5.1:1',
    responsiveBreakpoints: ['Desktop', 'Tablet', 'Mobile'],
    slots: 6,
    previewGradient: 'from-[#0A0D0C] to-[#141915]',
    codeSnippet: `<BentoGrid columns={12} theme="obsidian" pillars={6} />`,
  },
  {
    id: 'bento-02',
    name: 'Interactive Chart & Metric Bento',
    category: 'Bento Grids',
    description: 'Feature bento with live animated counters, simulated sparkline charts, and user retention indicators.',
    wcagContrast: '4.7:1',
    responsiveBreakpoints: ['Desktop', 'Tablet', 'Mobile'],
    slots: 4,
    previewGradient: 'from-[#0C3823] to-[#103F29]',
    codeSnippet: `<MetricsBento chartType="sparkline" animateOnScroll={true} />`,
  },
  {
    id: 'bento-03',
    name: 'Crystal Light Agency Bento',
    category: 'Bento Grids',
    description: 'Warm cream aesthetic with subtle shadows, notched card corners, and high-contrast typography.',
    wcagContrast: '6.8:1',
    responsiveBreakpoints: ['Desktop', 'Tablet', 'Mobile'],
    slots: 5,
    previewGradient: 'from-[#F4EFE6] to-[#E5E0D8]',
    codeSnippet: `<AgencyBento theme="crystal" notchedCorners={true} />`,
  },

  // Social Proof & Stats
  {
    id: 'proof-01',
    name: 'Animated Milestone Counter Bar',
    category: 'Social Proof & Stats',
    description: 'Fast-loading stats row with dynamic numeric count-up and localized currency formatting.',
    wcagContrast: '7.5:1',
    responsiveBreakpoints: ['All Breakpoints'],
    slots: 4,
    previewGradient: 'from-[#0C3823] to-[#082417]',
    codeSnippet: `<StatsCounter counters={[{ label: "Projects", value: 150 }]} />`,
  },
  {
    id: 'proof-02',
    name: 'Infinite Seamless Logo Cloud',
    category: 'Social Proof & Stats',
    description: 'Smooth CSS hardware-accelerated marquee supporting SVG client logos with subtle monochrome tint.',
    wcagContrast: '4.6:1',
    responsiveBreakpoints: ['Desktop', 'Tablet', 'Mobile'],
    slots: 8,
    previewGradient: 'from-[#141915] to-[#1a1f1b]',
    codeSnippet: `<LogoCloud speed={30} pauseOnHover={true} />`,
  },
  {
    id: 'proof-03',
    name: 'Masonry Testimonial Wall of Love',
    category: 'Social Proof & Stats',
    description: 'Verified customer cards with avatar badges, star ratings, and company logo watermarks.',
    wcagContrast: '5.9:1',
    responsiveBreakpoints: ['Desktop', 'Tablet', 'Mobile'],
    slots: 6,
    previewGradient: 'from-[#0A0D0C] to-[#121615]',
    codeSnippet: `<TestimonialWall masonry={true} verifiedBadges={true} />`,
  },

  // Pricing Matrices
  {
    id: 'price-01',
    name: '3-Tier SaaS Pricing Matrix with Annual Toggle',
    category: 'Pricing Matrices',
    description: 'Clear pricing tiers with discount badge, feature checklist, recommended highlight, and Stripe checkout hooks.',
    wcagContrast: '5.3:1',
    responsiveBreakpoints: ['Desktop', 'Tablet', 'Mobile'],
    slots: 3,
    previewGradient: 'from-[#0C3823] to-[#082417]',
    codeSnippet: `<PricingMatrix annualDiscount={20} recommendedTier="Pro" />`,
  },
  {
    id: 'price-02',
    name: 'Enterprise Feature Comparison Grid',
    category: 'Pricing Matrices',
    description: 'Comprehensive column comparison with sticky header, check/cross icons, and custom tier tooltips.',
    wcagContrast: '6.2:1',
    responsiveBreakpoints: ['Desktop', 'Tablet', 'Mobile'],
    slots: 4,
    previewGradient: 'from-[#141915] to-[#0A0D0C]',
    codeSnippet: `<ComparisonTable stickyHeader={true} tooltips={true} />`,
  },
  {
    id: 'price-03',
    name: 'Single Product Lifetime Deal Card',
    category: 'Pricing Matrices',
    description: 'High-converting single card with countdown timer, early bird counter, and instant purchase button.',
    wcagContrast: '5.0:1',
    responsiveBreakpoints: ['All Breakpoints'],
    slots: 2,
    previewGradient: 'from-[#164E33] to-[#0C3823]',
    codeSnippet: `<LifetimeDealCard price="$149" seatsRemaining={12} />`,
  },

  // FAQs & Support
  {
    id: 'faq-01',
    name: 'Accordion FAQ with Category Filters',
    category: 'FAQs & Support',
    description: 'Accessible disclosure widgets with smooth height animations, search filtering, and schema.org FAQ markup.',
    wcagContrast: '7.8:1',
    responsiveBreakpoints: ['All Breakpoints'],
    slots: 6,
    previewGradient: 'from-[#141915] to-[#1a1f1b]',
    codeSnippet: `<AccordionFAQ schemaOrg={true} searchEnabled={true} />`,
  },
  {
    id: 'faq-02',
    name: 'Two-Column Editorial FAQ Layout',
    category: 'FAQs & Support',
    description: 'Side-by-side questions and answers with direct contact trigger and live chat support integration.',
    wcagContrast: '6.5:1',
    responsiveBreakpoints: ['Desktop', 'Tablet', 'Mobile'],
    slots: 6,
    previewGradient: 'from-[#0C3823] to-[#103F29]',
    codeSnippet: `<EditorialFAQ layout="2-column" contactCta={true} />`,
  },
];

const categories = [
  'All Sections',
  'Heroes',
  'Floating Navbars',
  'Bento Grids',
  'Social Proof & Stats',
  'Pricing Matrices',
  'FAQs & Support',
] as const;

export function FrameDropCatalogExplorer() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All Sections');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCodeId, setActiveCodeId] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [droppedId, setDroppedId] = React.useState<string | null>(null);

  const filteredItems = catalogData.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All Sections' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSimulateDrop = (id: string) => {
    setDroppedId(id);
    setTimeout(() => setDroppedId(null), 3000);
  };

  return (
    <section id="catalog" className="scroll-mt-36 py-12 sm:py-16 relative">
      <div className="relative mx-auto w-full">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12 sm:mb-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#0C3823]/15 bg-white/70 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0C3823] mb-4 shadow-2xs backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#CCFF00] animate-pulse" />
              25+ PRODUCTION PRESETS
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[#141915] leading-[1.05]">
              Interactive Component Catalog
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#555C54] leading-relaxed">
              Explore production-ready Framer sections across all core page archetypes. Each component features responsive container queries, dark/light token duality, and automated WCAG AA compliance.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666C64]" />
            <input
              type="text"
              placeholder="Search 25+ sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full bg-white border border-[#141915]/15 text-sm text-[#141915] placeholder:text-[#666C64] focus:border-[#0C3823] transition-colors shadow-2xs"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-10 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 border',
                selectedCategory === cat
                  ? 'bg-[#0C3823] text-white border-[#0C3823] shadow-xs'
                  : 'bg-white text-[#666C64] border-[#141915]/10 hover:bg-[#F4EFE6] hover:text-[#141915]'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Component Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {filteredItems.map((item) => {
            const isCodeOpen = activeCodeId === item.id;
            const isCopied = copiedId === item.id;
            const isDropped = droppedId === item.id;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-[#141915]/10 bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div>
                  {/* Top Bar with Category & Contrast Score */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0C3823] bg-[#0C3823]/10 px-2.5 py-1 rounded-full">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      WCAG {item.wcagContrast}
                    </span>
                  </div>

                  {/* Visual Preview Container */}
                  <div
                    className={cn(
                      'relative aspect-[16/9] w-full rounded-2xl p-4 flex flex-col justify-between overflow-hidden text-white mb-5 bg-gradient-to-br shadow-inner',
                      item.previewGradient
                    )}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
                      <span>{item.id}</span>
                      <span className="flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        Responsive
                      </span>
                    </div>

                    <div>
                      <div className="h-1.5 w-16 bg-[#CCFF00] rounded-full mb-1.5" />
                      <div className="h-2 w-28 bg-white/60 rounded-full" />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] font-mono">
                      <span>{item.slots} Customizable Slots</span>
                      <span className="text-[#CCFF00]">Native React</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-heading text-xl font-bold uppercase text-[#141915] mb-2 leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#555C54] leading-relaxed mb-6 font-normal">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-[#141915]/10">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSimulateDrop(item.id)}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs',
                        isDropped
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#0C3823] text-white hover:bg-[#164E33]'
                      )}
                    >
                      {isDropped ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Dropped!</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                          <span>Drop to Canvas</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveCodeId(isCodeOpen ? null : item.id)}
                      className={cn(
                        'p-2.5 rounded-full border transition-colors cursor-pointer',
                        isCodeOpen
                          ? 'bg-[#141915] text-white border-[#141915]'
                          : 'bg-[#F4EFE6] text-[#141915] border-[#141915]/15 hover:bg-white'
                      )}
                      title="Inspect Component Code"
                      aria-label="Inspect Component Code"
                    >
                      <Code className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Collapsible Code Drawer */}
                  {isCodeOpen && (
                    <div className="mt-3 rounded-xl bg-[#082417] p-3 text-white font-mono text-[11px] relative">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2 text-[10px] text-white/60">
                        <span>Framer Component Import</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(item.id, item.codeSnippet)}
                          className="flex items-center gap-1 text-[#CCFF00] hover:underline cursor-pointer"
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="overflow-x-auto text-[#CCFF00]">
                        <code>{item.codeSnippet}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
