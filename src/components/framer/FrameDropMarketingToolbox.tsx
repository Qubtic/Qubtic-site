'use client';

import * as React from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Globe, 
  Sparkles, 
  Code2 
} from 'lucide-react';
import { 
  FaXTwitter, 
  FaLinkedinIn 
} from 'react-icons/fa6';
import { cn } from '@/lib/utils';

export function FrameDropMarketingToolbox() {
  const [activeTab, setActiveTab] = React.useState<'twitter' | 'linkedin' | 'seo'>('twitter');
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const snippets = {
    twitter: `Designing in Framer just got 10x faster. ⚡

Meet Frame Drop by @qubtictech:
A native Framer plugin packed with responsive sections, liquid glassmorphism, brand token sync, and automated WCAG preflight audits.

Drop directly to your canvas in 1 click. 👇

1/ Modular sections: Heroes, Bentos, Pricing & Nav
2/ Obsidian Dark & Crystal Light themes
3/ Zero code lock-in & atomic canvas safety

Try it free in Framer today: qubtic.tech/framer/frame-drop`,

    linkedin: `Exciting news from Qubtic Technologies! 🚀

We’ve officially launched Frame Drop—our native Framer component suite and page studio designed for modern founders, creative studios, and product designers.

Frame Drop eliminates layout friction by letting you browse, customize, and drop production-grade sections directly onto your Framer canvas with complete responsive layout support and zero code lock-in.

Key Highlights:
✨ 25+ Production-ready sections (Heroes, Bento Grids, Pricing & Social Proof)
🎨 Liquid Glassmorphism design tokens (Dark & Light duality)
🛡️ Built-in WCAG AA accessibility audit engine
⚡ Page Studio Composer for assembling full layouts before dropping

Try it out on Framer today or explore the docs at https://qubtic.tech/framer/frame-drop/docs`,

    seo: {
      pageTitle: 'Frame Drop by Qubtic | Native Framer Component Suite & Studio',
      metaDescription:
        'Build faster in Framer with Frame Drop by Qubtic. 1-click responsive section drops, Liquid Glassmorphism design tokens, automated WCAG accessibility audits, and Page Studio composer.',
      keywords:
        'Framer plugin, Frame Drop, Qubtic Technologies, Framer components, web design system, Framer bento grid, Framer hero sections, Framer templates',
      canonicalUrl: 'https://qubtic.tech/framer/frame-drop/docs',
    },
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <section id="marketing-toolbox" className="scroll-mt-36 py-12 sm:py-16 relative">
      <div className="relative mx-auto w-full">
        
        {/* Header */}
        <div className="mb-12 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0C3823]/15 bg-white/70 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0C3823] mb-4 shadow-2xs backdrop-blur-md">
            <Share2 className="w-3.5 h-3.5 text-[#0C3823]" />
            AGENCY &amp; CREATOR PRESS KIT
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[#141915] leading-[1.05]">
            Social &amp; Launch Snippets
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#555C54] leading-relaxed">
            Ready-to-publish marketing assets, developer community launch threads, and structured SEO metadata.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8">
          <button
            onClick={() => setActiveTab('twitter')}
            className={cn(
              'flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border',
              activeTab === 'twitter'
                ? 'bg-[#141915] text-white border-[#141915] shadow-xs'
                : 'bg-white text-[#666C64] border-[#141915]/10 hover:bg-[#F4EFE6]'
            )}
          >
            <FaXTwitter className="w-3.5 h-3.5" />
            Twitter / X Launch Thread
          </button>

          <button
            onClick={() => setActiveTab('linkedin')}
            className={cn(
              'flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border',
              activeTab === 'linkedin'
                ? 'bg-[#0077B5] text-white border-[#0077B5] shadow-xs'
                : 'bg-white text-[#666C64] border-[#141915]/10 hover:bg-[#F4EFE6]'
            )}
          >
            <FaLinkedinIn className="w-3.5 h-3.5" />
            LinkedIn Announcement
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={cn(
              'flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border',
              activeTab === 'seo'
                ? 'bg-[#0C3823] text-white border-[#0C3823] shadow-xs'
                : 'bg-white text-[#666C64] border-[#141915]/10 hover:bg-[#F4EFE6]'
            )}
          >
            <Globe className="w-3.5 h-3.5" />
            SEO &amp; Metadata
          </button>
        </div>

        {/* Content Box */}
        <div className="rounded-[32px] border border-[#141915]/10 bg-white p-6 sm:p-10 shadow-sm relative">
          
          {activeTab === 'twitter' && (
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#141915]/10 mb-6">
                <span className="font-mono text-xs text-[#666C64] flex items-center gap-2">
                  <FaXTwitter className="w-3.5 h-3.5 text-[#141915]" />
                  <span>X / Twitter Post Thread</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(snippets.twitter, 'twitter')}
                  className="flex items-center gap-1.5 rounded-full bg-[#141915] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0C3823] transition-colors cursor-pointer"
                >
                  {copiedKey === 'twitter' ? <Check className="w-3.5 h-3.5 text-[#CCFF00]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'twitter' ? 'Copied Post!' : 'Copy Thread'}</span>
                </button>
              </div>

              <pre className="whitespace-pre-wrap font-sans text-sm sm:text-base leading-relaxed text-[#141915] bg-[#F8F6F0] p-6 rounded-2xl border border-[#141915]/5">
                {snippets.twitter}
              </pre>
            </div>
          )}

          {activeTab === 'linkedin' && (
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#141915]/10 mb-6">
                <span className="font-mono text-xs text-[#666C64] flex items-center gap-2">
                  <FaLinkedinIn className="w-3.5 h-3.5 text-[#0077B5]" />
                  <span>LinkedIn Network Article</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(snippets.linkedin, 'linkedin')}
                  className="flex items-center gap-1.5 rounded-full bg-[#0077B5] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#005f93] transition-colors cursor-pointer"
                >
                  {copiedKey === 'linkedin' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'linkedin' ? 'Copied Post!' : 'Copy Announcement'}</span>
                </button>
              </div>

              <pre className="whitespace-pre-wrap font-sans text-sm sm:text-base leading-relaxed text-[#141915] bg-[#F8F6F0] p-6 rounded-2xl border border-[#141915]/5">
                {snippets.linkedin}
              </pre>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#141915]/10">
                <span className="font-mono text-xs text-[#666C64]">HTML Meta &amp; OpenGraph Standard</span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      JSON.stringify(snippets.seo, null, 2),
                      'seo-json'
                    )
                  }
                  className="flex items-center gap-1.5 rounded-full bg-[#0C3823] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#164E33] transition-colors cursor-pointer"
                >
                  {copiedKey === 'seo-json' ? <Check className="w-3.5 h-3.5 text-[#CCFF00]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'seo-json' ? 'Copied JSON!' : 'Copy JSON'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-[#F8F6F0] p-4 rounded-2xl border border-[#141915]/5">
                  <span className="text-[11px] font-mono uppercase text-[#0C3823] font-bold block mb-1">
                    Page Title:
                  </span>
                  <p className="text-sm font-semibold text-[#141915]">
                    {snippets.seo.pageTitle}
                  </p>
                </div>

                <div className="bg-[#F8F6F0] p-4 rounded-2xl border border-[#141915]/5">
                  <span className="text-[11px] font-mono uppercase text-[#0C3823] font-bold block mb-1">
                    Meta Description:
                  </span>
                  <p className="text-sm text-[#555C54] leading-relaxed">
                    {snippets.seo.metaDescription}
                  </p>
                </div>

                <div className="bg-[#F8F6F0] p-4 rounded-2xl border border-[#141915]/5">
                  <span className="text-[11px] font-mono uppercase text-[#0C3823] font-bold block mb-1">
                    Keywords:
                  </span>
                  <p className="text-xs font-mono text-[#555C54]">
                    {snippets.seo.keywords}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
