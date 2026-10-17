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
  category: string;
  description: string;
  wcagContrast: string;
  responsiveBreakpoints: string[];
  slots: number;
  tier: 'free' | 'pro';
  previewGradient: string;
  codeSnippet: string;
}

const catalogData: CatalogItem[] = [
  // Heroes (6)
  {
    id: 'hero-studio',
    name: 'Studio / 01',
    category: 'Heroes',
    description: 'An image-led opening with a clear point of view and sculptural composition.',
    wcagContrast: '6.2:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 2,
    tier: 'free',
    previewGradient: 'from-[#0C3823] to-[#082417]',
    codeSnippet: `<FrameDropSection kind="hero" variant="image" brandName="Minimal Studio" />`,
  },
  {
    id: 'hero-product',
    name: 'Product / 02',
    category: 'Heroes',
    description: 'A focused headline with room for your collaborative product interface and tour.',
    wcagContrast: '5.8:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 3,
    tier: 'free',
    previewGradient: 'from-[#164E33] to-[#0C3823]',
    codeSnippet: `<FrameDropSection kind="hero" variant="light" cta="Get started" secondaryCta="Watch product tour" />`,
  },
  {
    id: 'hero-minimal',
    name: 'Studio / 03',
    category: 'Heroes',
    description: 'High-contrast typographic headline with dual conversion CTAs and subtle metrics.',
    wcagContrast: '7.4:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 3,
    tier: 'pro',
    previewGradient: 'from-[#141915] to-[#1c221d]',
    codeSnippet: `<FrameDropSection kind="hero" variant="dark" cta="Start free trial" />`,
  },
  {
    id: 'hero-cards',
    name: 'Showcase / 05',
    category: 'Heroes',
    description: 'Hero with staggered 3D avatar columns, team credits, and conversion action buttons.',
    wcagContrast: '5.4:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 5,
    tier: 'free',
    previewGradient: 'from-[#0A0D0C] to-[#164E33]',
    codeSnippet: `<FrameDropSection kind="hero" variant="light" layout="cards" />`,
  },
  {
    id: 'hero-editorial',
    name: 'Agency / 04',
    category: 'Heroes',
    description: 'Full-bleed imagery with architectural poise, quiet geometry, and monograph links.',
    wcagContrast: '6.8:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 2,
    tier: 'free',
    previewGradient: 'from-[#1c221d] to-[#0A0D0C]',
    codeSnippet: `<FrameDropSection kind="hero" variant="image" cta="View monograph" />`,
  },
  {
    id: 'hero-agency-glass',
    name: 'Agency / Glass Spatial 06',
    category: 'Heroes',
    description: 'Spatial liquid glass agency hero with live commission status pulse, rotating aura glow, floating glass metric cards, and conversion CTAs.',
    wcagContrast: '5.1:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 4,
    tier: 'pro',
    previewGradient: 'from-[#0C3823] to-[#082417]',
    codeSnippet: `<FrameDropSection kind="hero" layout="agency-hero" variant="dark" />`,
  },

  // Navigation (2)
  {
    id: 'nav-simple',
    name: 'Essential navigation',
    category: 'Navigation',
    description: 'A sleek full-width studio header bar with responsive typography, anchor links, and primary action.',
    wcagContrast: '8.1:1',
    responsiveBreakpoints: ['All Breakpoints'],
    slots: 4,
    tier: 'free',
    previewGradient: 'from-[#141915] to-[#164E33]',
    codeSnippet: `<FrameDropSection kind="navigation" variant="light" />`,
  },
  {
    id: 'nav-pill',
    name: 'Floating dock navigation',
    category: 'Navigation',
    description: 'A floating glass dock capsule with frosted backdrop blur, segmented links, and quick actions.',
    wcagContrast: '4.9:1',
    responsiveBreakpoints: ['All Breakpoints'],
    slots: 5,
    tier: 'pro',
    previewGradient: 'from-[#0C3823]/80 to-[#141915]/90',
    codeSnippet: `<FrameDropSection kind="navigation" align="center" variant="light" />`,
  },

  // Social Proof & Stats (6)
  {
    id: 'logos',
    name: 'In good company',
    category: 'Social Proof & Stats',
    description: 'A quiet, responsive brand strip of partner and customer logo marks.',
    wcagContrast: '6.5:1',
    responsiveBreakpoints: ['All Breakpoints'],
    slots: 4,
    tier: 'free',
    previewGradient: 'from-[#141915] to-[#1a1f1b]',
    codeSnippet: `<FrameDropSection kind="logos" variant="light" />`,
  },
  {
    id: 'quote',
    name: 'Words that matter',
    category: 'Social Proof & Stats',
    description: 'A single customer story front and center with author verification and portrait image.',
    wcagContrast: '6.0:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 2,
    tier: 'free',
    previewGradient: 'from-[#0C3823] to-[#103F29]',
    codeSnippet: `<FrameDropSection kind="testimonial" variant="light" />`,
  },
  {
    id: 'quote-executive',
    name: 'Executive endorsement',
    category: 'Social Proof & Stats',
    description: 'A prominent high-profile endorsement emphasizing strategic impact, enterprise scale, and trust.',
    wcagContrast: '7.2:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 2,
    tier: 'pro',
    previewGradient: 'from-[#0A0D0C] to-[#141915]',
    codeSnippet: `<FrameDropSection kind="testimonial" variant="dark" />`,
  },
  {
    id: 'stats',
    name: 'By the numbers',
    category: 'Social Proof & Stats',
    description: 'Three concise proof points with large numeric values and descriptive labels.',
    wcagContrast: '7.6:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 3,
    tier: 'free',
    previewGradient: 'from-[#141915] to-[#0A0D0C]',
    codeSnippet: `<FrameDropSection kind="stats" variant="dark" />`,
  },
  {
    id: 'stats-impact',
    name: 'Key milestones',
    category: 'Social Proof & Stats',
    description: 'Three bold statistic cards celebrating measurable business milestones and pipeline generated.',
    wcagContrast: '6.4:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 3,
    tier: 'pro',
    previewGradient: 'from-[#0C3823] to-[#082417]',
    codeSnippet: `<FrameDropSection kind="stats" variant="light" />`,
  },
  {
    id: 'stats-agency-glass',
    name: 'Agency / Business Growth 03',
    category: 'Social Proof & Stats',
    description: 'Obsidian glass stats cards with rotating conic border glow, animated trend vectors, and measurable business proof.',
    wcagContrast: '5.2:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 4,
    tier: 'pro',
    previewGradient: 'from-[#0A0D0C] to-[#121615]',
    codeSnippet: `<FrameDropSection kind="stats" layout="agency-stats" variant="dark" />`,
  },

  // Features & Process (4)
  {
    id: 'features',
    name: 'Three good reasons',
    category: 'Features & Process',
    description: 'Three core benefits with a consistent visual rhythm, clear typography, and subtle icons.',
    wcagContrast: '6.5:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 3,
    tier: 'free',
    previewGradient: 'from-[#164E33] to-[#0C3823]',
    codeSnippet: `<FrameDropSection kind="features" variant="light" />`,
  },
  {
    id: 'features-steps',
    name: 'Three-step process',
    category: 'Features & Process',
    description: 'A clear step-by-step methodology explaining how you deliver results from discovery to scale.',
    wcagContrast: '6.1:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 3,
    tier: 'free',
    previewGradient: 'from-[#0C3823] to-[#103F29]',
    codeSnippet: `<FrameDropSection kind="features" variant="light" />`,
  },
  {
    id: 'features-cards',
    name: 'Product capabilities',
    category: 'Features & Process',
    description: 'Structured card matrix highlighting core platform advantages with status badges and performance metrics.',
    wcagContrast: '7.0:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 3,
    tier: 'pro',
    previewGradient: 'from-[#141915] to-[#1a1f1b]',
    codeSnippet: `<FrameDropSection kind="features" variant="dark" />`,
  },
  {
    id: 'features-agency-pipeline',
    name: 'Agency / Process Pipeline 04',
    category: 'Features & Process',
    description: 'Interactive 4-stage agency execution pipeline with glowing laser connectors, animated milestone cards, and sprint checklists.',
    wcagContrast: '5.5:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 4,
    tier: 'free',
    previewGradient: 'from-[#0C3823] to-[#141915]',
    codeSnippet: `<FrameDropSection kind="features" layout="agency-pipeline" variant="light" />`,
  },

  // Services & Capabilities (3)
  {
    id: 'services-carousel',
    name: 'Services Carousel / 01',
    category: 'Services',
    description: 'Interactive service cards carousel with watermark brand marks, right edge fade mask, and modern slide animation.',
    wcagContrast: '5.8:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 4,
    tier: 'free',
    previewGradient: 'from-[#F4EFE6] to-[#E5E0D8]',
    codeSnippet: `<FrameDropSection kind="services" variant="light" />`,
  },
  {
    id: 'services-carousel-dark',
    name: 'Services Carousel / 02',
    category: 'Services',
    description: 'Obsidian dark glass service cards carousel with luminous outline brand marks and modern hover motion.',
    wcagContrast: '7.3:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 4,
    tier: 'pro',
    previewGradient: 'from-[#0A0D0C] to-[#141915]',
    codeSnippet: `<FrameDropSection kind="services" variant="dark" />`,
  },
  {
    id: 'services-agency-glass',
    name: 'Agency / Services Matrix 03',
    category: 'Services',
    description: 'Interactive agency service cards with multi-stop glass reflection, floating service indices, animated hover reveal, and deliverables tags.',
    wcagContrast: '6.2:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 4,
    tier: 'free',
    previewGradient: 'from-[#0C3823] to-[#082417]',
    codeSnippet: `<FrameDropSection kind="services" layout="agency-matrix" variant="light" />`,
  },

  // Bento Grids (3)
  {
    id: 'bento',
    name: 'The bigger picture',
    category: 'Bento Grids',
    description: 'An asymmetric feature grid with a visual anchor, photography spotlight, and cohesive detail cards.',
    wcagContrast: '5.9:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 4,
    tier: 'free',
    previewGradient: 'from-[#141915] to-[#1c221d]',
    codeSnippet: `<FrameDropSection kind="bento" variant="light" />`,
  },
  {
    id: 'bento-creative',
    name: 'Visual bento grid',
    category: 'Bento Grids',
    description: 'An asymmetric bento layout featuring a primary visual spotlight and secondary detail cards with micro-motion.',
    wcagContrast: '6.3:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 4,
    tier: 'pro',
    previewGradient: 'from-[#164E33] to-[#0C3823]',
    codeSnippet: `<FrameDropSection kind="bento" variant="light" />`,
  },
  {
    id: 'bento-agency-glass',
    name: 'Agency / Glass Bento 03',
    category: 'Bento Grids',
    description: 'Asymmetric dark glass bento matrix with interactive hover depth, animated border beams, live performance radars, and conversion telemetry.',
    wcagContrast: '5.0:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 4,
    tier: 'pro',
    previewGradient: 'from-[#0A0D0C] to-[#141915]',
    codeSnippet: `<FrameDropSection kind="bento" layout="agency-bento" variant="dark" />`,
  },

  // Portfolio & Work (2)
  {
    id: 'work',
    name: 'Selected work',
    category: 'Portfolio & Work',
    description: 'A two-column project showcase with high-res imagery, typography tags, and case study links.',
    wcagContrast: '6.7:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 3,
    tier: 'free',
    previewGradient: 'from-[#0C3823] to-[#103F29]',
    codeSnippet: `<FrameDropSection kind="work" variant="light" />`,
  },
  {
    id: 'work-showcase',
    name: 'Featured projects / 02',
    category: 'Portfolio & Work',
    description: 'A two-column editorial portfolio layout with high-impact project visuals and dark mode elegance.',
    wcagContrast: '7.1:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 3,
    tier: 'pro',
    previewGradient: 'from-[#141915] to-[#0A0D0C]',
    codeSnippet: `<FrameDropSection kind="work" variant="dark" />`,
  },

  // Pricing Plans (2)
  {
    id: 'pricing',
    name: 'Room to grow',
    category: 'Pricing',
    description: 'Three clear plans with one highlighted option, feature lists, and straightforward billing tiers.',
    wcagContrast: '6.0:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 3,
    tier: 'free',
    previewGradient: 'from-[#0C3823] to-[#082417]',
    codeSnippet: `<FrameDropSection kind="pricing" variant="light" />`,
  },
  {
    id: 'pricing-compare',
    name: 'Startup & Scale plans',
    category: 'Pricing',
    description: 'Three tailored tiers with featured growth tier for SaaS and digital creators, badge flags, and SLA guarantees.',
    wcagContrast: '7.2:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 3,
    tier: 'pro',
    previewGradient: 'from-[#0A0D0C] to-[#164E33]',
    codeSnippet: `<FrameDropSection kind="pricing" variant="dark" />`,
  },

  // FAQs (2)
  {
    id: 'faq',
    name: 'Before you ask',
    category: 'FAQs & Support',
    description: 'A clean, accessible accordion for answering initial onboarding and client questions.',
    wcagContrast: '8.0:1',
    responsiveBreakpoints: ['All Breakpoints'],
    slots: 3,
    tier: 'free',
    previewGradient: 'from-[#141915] to-[#1a1f1b]',
    codeSnippet: `<FrameDropSection kind="faq" variant="light" />`,
  },
  {
    id: 'faq-extended',
    name: 'Answers & clarity',
    category: 'FAQs & Support',
    description: 'Organized FAQ accordion addressing licensing, customization, responsive design, and custom code support.',
    wcagContrast: '7.5:1',
    responsiveBreakpoints: ['All Breakpoints'],
    slots: 3,
    tier: 'pro',
    previewGradient: 'from-[#0C3823] to-[#103F29]',
    codeSnippet: `<FrameDropSection kind="faq" variant="dark" />`,
  },

  // Calls to Action & Footers (4)
  {
    id: 'cta',
    name: 'The next chapter',
    category: 'CTAs & Footer',
    description: 'A focused closing invitation with direct email and contact links.',
    wcagContrast: '7.4:1',
    responsiveBreakpoints: ['All Breakpoints'],
    slots: 2,
    tier: 'free',
    previewGradient: 'from-[#164E33] to-[#0C3823]',
    codeSnippet: `<FrameDropSection kind="cta" variant="dark" />`,
  },
  {
    id: 'cta-impact',
    name: 'High-conversion banner',
    category: 'CTAs & Footer',
    description: 'A dark closing banner with radial glow, dual buttons, and instant setup guarantees.',
    wcagContrast: '7.6:1',
    responsiveBreakpoints: ['All Breakpoints'],
    slots: 3,
    tier: 'pro',
    previewGradient: 'from-[#0A0D0C] to-[#082417]',
    codeSnippet: `<FrameDropSection kind="cta" variant="dark" />`,
  },
  {
    id: 'resources',
    name: 'Notes & perspectives',
    category: 'CTAs & Footer',
    description: 'Three editorial stories with photography; includes a native Framer CMS blueprint.',
    wcagContrast: '6.4:1',
    responsiveBreakpoints: ['375px', '768px', '1200px', '1440px'],
    slots: 3,
    tier: 'free',
    previewGradient: 'from-[#141915] to-[#164E33]',
    codeSnippet: `<FrameDropSection kind="resources" variant="light" />`,
  },
  {
    id: 'footer',
    name: 'A considered ending',
    category: 'CTAs & Footer',
    description: 'Brand details, copyright metadata, and essential navigational links.',
    wcagContrast: '8.2:1',
    responsiveBreakpoints: ['All Breakpoints'],
    slots: 4,
    tier: 'free',
    previewGradient: 'from-[#0C3823] to-[#082417]',
    codeSnippet: `<FrameDropSection kind="footer" variant="light" />`,
  },
];

const categories = [
  'All Sections',
  'Heroes',
  'Navigation',
  'Bento Grids',
  'Features & Process',
  'Services',
  'Social Proof & Stats',
  'Portfolio & Work',
  'Pricing',
  'FAQs & Support',
  'CTAs & Footer',
] as const;

const hashToCategory: Record<string, string> = {
  '#catalog': 'All Sections',
  '#catalog-all': 'All Sections',
  '#catalog-heroes': 'Heroes',
  '#catalog-navigation': 'Navigation',
  '#catalog-bento': 'Bento Grids',
  '#catalog-features': 'Features & Process',
  '#catalog-services': 'Services',
  '#catalog-social': 'Social Proof & Stats',
  '#catalog-portfolio': 'Portfolio & Work',
  '#catalog-pricing': 'Pricing',
  '#catalog-faq': 'FAQs & Support',
  '#catalog-cta': 'CTAs & Footer',
};

const categoryToHash: Record<string, string> = {
  'All Sections': '#catalog',
  'Heroes': '#catalog-heroes',
  'Navigation': '#catalog-navigation',
  'Bento Grids': '#catalog-bento',
  'Features & Process': '#catalog-features',
  'Services': '#catalog-services',
  'Social Proof & Stats': '#catalog-social',
  'Portfolio & Work': '#catalog-portfolio',
  'Pricing': '#catalog-pricing',
  'FAQs & Support': '#catalog-faq',
  'CTAs & Footer': '#catalog-cta',
};

export function FrameDropCatalogExplorer() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All Sections');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCodeId, setActiveCodeId] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [droppedId, setDroppedId] = React.useState<string | null>(null);

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      'All Sections': catalogData.length,
    };
    for (const item of catalogData) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, []);

  React.useEffect(() => {
    const syncFromHash = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash.toLowerCase();
      if (hash && hashToCategory[hash]) {
        setSelectedCategory(hashToCategory[hash]);
        if (hash.startsWith('#catalog-')) {
          const el = document.getElementById('catalog');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    const hash = categoryToHash[cat];
    if (hash && typeof window !== 'undefined') {
      window.history.replaceState(null, '', hash);
    }
  };

  const filteredItems = catalogData.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All Sections' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
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
              34+ PRODUCTION PRESETS
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[#141915] leading-[1.05]">
              Interactive Component Catalog
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#555C54] leading-relaxed">
              Explore 34 production-ready Framer sections across all core page archetypes. Each component features responsive container queries, dark/light token duality, and automated WCAG AA compliance.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666C64]" />
            <input
              type="text"
              placeholder="Search 34+ sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full bg-white border border-[#141915]/15 text-sm text-[#141915] placeholder:text-[#666C64] focus:border-[#0C3823] transition-colors shadow-2xs"
            />
          </div>
        </div>

        {/* Category Pills with Authentic Section Count Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-10 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleSelectCategory(cat)}
                className={cn(
                  'rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 border flex items-center gap-2',
                  isSelected
                    ? 'bg-[#0C3823] text-white border-[#0C3823] shadow-xs'
                    : 'bg-white text-[#666C64] border-[#141915]/10 hover:bg-[#F4EFE6] hover:text-[#141915]'
                )}
              >
                <span>{cat}</span>
                <span
                  className={cn(
                    'text-[10px] font-mono px-1.5 py-0.5 rounded-full',
                    isSelected ? 'bg-white/20 text-[#CCFF00]' : 'bg-[#141915]/5 text-[#666C64]'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Component Grid or Empty State */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {filteredItems.length === 0 ? (
            <div className="col-span-full rounded-[28px] border border-[#141915]/10 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4EFE6] text-[#0C3823] mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold uppercase text-[#141915] mb-2">
                No Sections Found
              </h3>
              <p className="text-sm text-[#555C54] max-w-md mx-auto mb-6">
                No components match your search term &ldquo;{searchQuery}&rdquo; in category &ldquo;{selectedCategory}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  handleSelectCategory('All Sections');
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#0C3823] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#164E33] transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
            const isCodeOpen = activeCodeId === item.id;
            const isCopied = copiedId === item.id;
            const isDropped = droppedId === item.id;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-[#141915]/10 bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div>
                  {/* Top Bar with Category, Plan Tier & Contrast Score */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#0C3823] bg-[#0C3823]/10 px-2.5 py-1 rounded-full">
                        {item.category}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border',
                          item.tier === 'pro'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                        )}
                      >
                        {item.tier === 'pro' ? 'Early Bird Pro' : 'Free'}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
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
          }))}
        </div>

      </div>
    </section>
  );
}
