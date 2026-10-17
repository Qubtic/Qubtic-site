'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Share2,
  Copy,
  Check,
  Globe,
  Download,
  ImageIcon
} from 'lucide-react';
import {
  FaXTwitter,
  FaLinkedinIn
} from 'react-icons/fa6';
import { cn } from '@/lib/utils';

export function FrameDropMarketingToolbox() {
  const [activeTab, setActiveTab] = React.useState<'twitter' | 'linkedin' | 'seo' | 'brand'>('twitter');
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

We’ve officially launched Frame Drop-our native Framer component suite and page studio designed for modern founders, creative studios, and product designers.

Frame Drop eliminates layout friction by letting you browse, customize, and drop production-grade sections directly onto your Framer canvas with complete responsive layout support and zero code lock-in.

Key Highlights:
✨ 34+ Production-ready sections (Heroes, Bento Grids, Pricing & Social Proof)
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

  const brandAssets = [
    {
      title: 'Official Hero Banner',
      dims: '1024 × 461 PNG',
      src: '/images/framedrop-banner.png',
      desc: 'Primary promotional banner, social graph preview, and marketing asset.',
      aspect: 'aspect-[1024/461]',
      bgDark: false,
    },
    {
      title: 'Frame Drop Logo Mark',
      dims: '1024 × 1024 PNG',
      src: '/images/brand/frame-drop-logo.png',
      desc: 'Official square identity mark with blue camera frame & droplet stack.',
      aspect: 'aspect-square',
      bgDark: false,
    },
    {
      title: 'Transparent UI Icon',
      dims: 'Alpha PNG',
      src: '/images/brand/frame-drop-icon-transparent.png',
      desc: 'Clean transparent cutout for dark navigation bars, badges, and button icons.',
      aspect: 'aspect-square',
      bgDark: true,
    },
  ];

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
            Social &amp; Brand Assets
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#555C54] leading-relaxed">
            Ready-to-publish marketing assets, official logos &amp; banners, developer launch threads, and structured SEO metadata.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8">
          <button
            onClick={() => setActiveTab('brand')}
            className={cn(
              'flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border',
              activeTab === 'brand'
                ? 'bg-[#0066FF] text-white border-[#0066FF] shadow-xs'
                : 'bg-white text-[#666C64] border-[#141915]/10 hover:bg-[#F4EFE6]'
            )}
          >
            <div className="w-4 h-4 rounded bg-[#0066FF]/20 flex items-center justify-center p-0.5">
              <Image
                src="/images/brand/frame-drop-icon-transparent.png"
                alt="Frame Drop"
                width={16}
                height={16}
                className="w-full h-full object-contain brightness-110"
              />
            </div>
            Official Brand Assets
          </button>

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

          {/* Brand Assets Tab */}
          {activeTab === 'brand' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#141915]/10 gap-3">
                <span className="font-mono text-xs text-[#666C64] flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-[#0066FF]" />
                  <span>Official Frame Drop Press &amp; Media Kit</span>
                </span>
                <span className="text-xs font-mono text-[#0066FF] font-semibold bg-[#0066FF]/10 px-3 py-1 rounded-full w-fit">
                  High-Resolution • PNG 300DPI
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {brandAssets.map((asset, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-2xl border border-[#141915]/10 bg-[#F8F6F0] p-4 overflow-hidden group hover:border-[#0066FF]/40 transition-colors"
                  >
                    <div>
                      {/* Image Preview */}
                      <div className={cn(
                        'relative w-full rounded-xl overflow-hidden border border-[#141915]/10 mb-4 flex items-center justify-center',
                        asset.aspect,
                        asset.bgDark ? 'bg-gradient-to-br from-[#051329] to-[#010915] p-6' : 'bg-white'
                      )}>
                        <Image
                          src={asset.src}
                          alt={asset.title}
                          fill
                          className={cn(
                            asset.bgDark ? 'object-contain p-4' : 'object-cover'
                          )}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h4 className="font-heading text-base font-bold text-[#141915]">
                          {asset.title}
                        </h4>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0066FF] bg-white px-2 py-0.5 rounded border border-[#0066FF]/20">
                          {asset.dims}
                        </span>
                      </div>
                      <p className="text-xs text-[#666C64] leading-relaxed mb-4">
                        {asset.desc}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-[#141915]/10">
                      <a
                        href={asset.src}
                        download
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#141915] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0066FF] transition-colors cursor-pointer text-center"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy(asset.src, `asset-${idx}`)}
                        className="inline-flex items-center justify-center gap-1 rounded-full bg-white border border-[#141915]/15 px-3 py-2 text-xs font-semibold text-[#141915] hover:bg-[#EAE5DC] transition-colors cursor-pointer"
                        title="Copy asset path"
                      >
                        {copiedKey === `asset-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-[#0C3823]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#666C64]" />
                        )}
                        <span>{copiedKey === `asset-${idx}` ? 'Copied' : 'Path'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
