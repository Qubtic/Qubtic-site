'use client';

import * as React from 'react';
import { 
  Type, 
  Sun, 
  Moon, 
  Check, 
  Droplet 
} from 'lucide-react';
import { cn } from '@/lib/utils';

type FontName = 'Inter' | 'Plus Jakarta Sans' | 'Outfit' | 'DM Sans' | 'Syne' | 'Cinzel';

export function FrameDropDesignSystem() {
  const [activeTheme, setActiveTheme] = React.useState<'obsidian' | 'crystal'>('obsidian');
  const [selectedFont, setSelectedFont] = React.useState<FontName>('Plus Jakarta Sans');

  const fonts: { name: FontName; tag: string; sample: string }[] = [
    { name: 'Plus Jakarta Sans', tag: 'Headings & Display', sample: 'High-Converting Precision' },
    { name: 'Inter', tag: 'UI & Body Microcopy', sample: 'Neutral, crisp, legible at 11px' },
    { name: 'Outfit', tag: 'Tech & Modern SaaS', sample: 'Geometric curves and balanced punch' },
    { name: 'DM Sans', tag: 'Friendly & Commercial', sample: 'Humanist geometry for digital stores' },
    { name: 'Syne', tag: 'Avant-Garde & Creative', sample: 'Expressive brutalist editorial flare' },
    { name: 'Cinzel', tag: 'Luxury & High Fashion', sample: 'Classical proportions with modern edge' },
  ] as const;

  const colorTokens = [
    { name: 'Obsidian Dark', hex: '#0A0D0C', role: 'Default Dark Background', swatchClass: 'fd-token-swatch-obsidian' },
    { name: 'Dark Surface', hex: '#121615', role: 'Glassmorphic Card Elevation', swatchClass: 'fd-token-swatch-surface' },
    { name: 'Crystal Light', hex: '#F4EFE6', role: 'Warm Ambient Base', swatchClass: 'fd-token-swatch-crystal' },
    { name: 'Forest Green', hex: '#0C3823', role: 'Primary Brand Action', swatchClass: 'fd-token-swatch-forest' },
    { name: 'Deep Forest', hex: '#164E33', role: 'Hover & Border Accent', swatchClass: 'fd-token-swatch-deep-forest' },
    { name: 'Neon Lime', hex: '#CCFF00', role: 'High-Impact Focus Beacon', swatchClass: 'fd-token-swatch-lime' },
  ];

  return (
    <section id="design-system" className="scroll-mt-36 py-12 sm:py-16 relative">
      <div className="relative mx-auto w-full">
        
        {/* Section Header */}
        <div className="mb-14 sm:mb-18 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0C3823]/15 bg-white/70 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0C3823] mb-4 shadow-2xs backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#CCFF00] animate-pulse" />
            TOKEN HARMONY &amp; PALETTES
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[#141915] leading-[1.05]">
            Liquid Glassmorphism &amp; Theme Duality
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#555C54] leading-relaxed">
            Frame Drop brings Qubtic’s signature design tokens to Framer. Seamlessly navigate between Obsidian Dark (`#0A0D0C`) and Crystal Light palettes with calibrated elevation, translucent glass borders, and curated typography.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Color Palette & Font Pickers (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Color Swatch Card */}
            <div className="rounded-[28px] border border-[#141915]/10 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Droplet className="w-5 h-5 text-[#0C3823]" />
                <h3 className="font-heading text-xl font-bold uppercase text-[#141915]">
                  Calibrated Token Palette
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {colorTokens.map((token) => (
                  <div
                    key={token.name}
                    className="flex flex-col rounded-2xl border border-[#141915]/8 p-3.5 bg-[#F8F6F0]/60"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={cn('fd-token-swatch', token.swatchClass)}
                      />
                      <span className="font-mono text-[11px] font-bold text-[#141915]">
                        {token.hex}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#141915]">{token.name}</span>
                    <span className="text-[10px] text-[#666C64] mt-0.5">{token.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Font Pairings Picker */}
            <div className="rounded-[28px] border border-[#141915]/10 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-5 h-5 text-[#0C3823]" />
                <h3 className="font-heading text-xl font-bold uppercase text-[#141915]">
                  Curated Typography Suite
                </h3>
              </div>
              <p className="text-xs text-[#555C54] mb-5">
                Select a font to preview how Frame Drop components adapt in real time.
              </p>

              <div className="space-y-2">
                {fonts.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => setSelectedFont(f.name)}
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer',
                      selectedFont === f.name
                        ? 'bg-[#0C3823] text-white border-[#0C3823] shadow-xs'
                        : 'bg-[#F8F6F0]/70 text-[#141915] border-[#141915]/5 hover:bg-white'
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{f.name}</span>
                        <span
                          className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full',
                            selectedFont === f.name
                              ? 'bg-white/20 text-[#CCFF00]'
                              : 'bg-black/5 text-[#666C64]'
                          )}
                        >
                          {f.tag}
                        </span>
                      </div>
                      <p
                        className={cn(
                          'text-xs mt-1 truncate max-w-[260px]',
                          selectedFont === f.name ? 'text-white/80' : 'text-[#666C64]'
                        )}
                      >
                        {f.sample}
                      </p>
                    </div>
                    {selectedFont === f.name && (
                      <Check className="w-4 h-4 text-[#CCFF00] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Live Interactive Dual-Theme Canvas Sandbox (Span 7) */}
          <div className="lg:col-span-7">
            <div className="rounded-[32px] border border-[#141915]/10 bg-white p-6 sm:p-8 shadow-sm">
              
              {/* Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#141915]/10 mb-6">
                <div>
                  <h3 className="font-heading text-xl font-bold uppercase text-[#141915]">
                    Interactive Theme Sandbox
                  </h3>
                  <span className="text-xs text-[#666C64]">
                    Active Font: <span className="font-semibold text-[#0C3823]">{selectedFont}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 rounded-full bg-[#F4EFE6] p-1 border border-[#141915]/10">
                  <button
                    onClick={() => setActiveTheme('obsidian')}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer',
                      activeTheme === 'obsidian'
                        ? 'bg-[#0A0D0C] text-white shadow-2xs'
                        : 'text-[#666C64] hover:text-[#141915]'
                    )}
                  >
                    <Moon className="w-3.5 h-3.5 text-[#CCFF00]" />
                    Obsidian Dark
                  </button>
                  <button
                    onClick={() => setActiveTheme('crystal')}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer',
                      activeTheme === 'crystal'
                        ? 'bg-white text-[#141915] shadow-2xs'
                        : 'text-[#666C64] hover:text-[#141915]'
                    )}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    Crystal Light
                  </button>
                </div>
              </div>

              {/* The Live Component Card */}
              <div
                className={cn(
                  'rounded-[28px] p-8 sm:p-10 transition-all duration-500 relative overflow-hidden border',
                  activeTheme === 'obsidian'
                    ? 'bg-[#0A0D0C] text-white border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.6)]'
                    : 'bg-[#F4EFE6] text-[#141915] border-[#141915]/15 shadow-[0_25px_60px_rgba(0,0,0,0.06)]'
                )}
              >
                {/* Ambient Internal Glow */}
                <div
                  className={cn(
                    'pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl transition-opacity duration-500',
                    activeTheme === 'obsidian'
                      ? 'bg-[#0C3823]/40 opacity-100'
                      : 'bg-[#E8C48A]/50 opacity-100'
                  )}
                />

                {/* Subtitle Eyebrow */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-2 w-2 rounded-full bg-[#CCFF00] animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-widest opacity-80">
                    Live Component Drop
                  </span>
                </div>

                {/* Dynamic Title */}
                <h4 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-4 leading-tight">
                  Engineered with Liquid Precision.
                </h4>

                <p className="text-sm sm:text-base leading-relaxed opacity-80 mb-8 max-w-lg">
                  Every micro-interaction, drop shadow, and translucent border is mathematically calibrated to reflect optical refraction across all modern displays.
                </p>

                {/* Mockup Metric Bento Row Inside Live Card */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  <div
                    className={cn(
                      'rounded-2xl p-4 border backdrop-blur-md',
                      activeTheme === 'obsidian'
                        ? 'bg-white/5 border-white/10'
                        : 'bg-white/80 border-[#141915]/10'
                    )}
                  >
                    <span className="font-mono text-xl sm:text-2xl font-bold block">4.8:1</span>
                    <span className="text-[11px] opacity-70">Contrast Score</span>
                  </div>
                  <div
                    className={cn(
                      'rounded-2xl p-4 border backdrop-blur-md',
                      activeTheme === 'obsidian'
                        ? 'bg-white/5 border-white/10'
                        : 'bg-white/80 border-[#141915]/10'
                    )}
                  >
                    <span className="font-mono text-xl sm:text-2xl font-bold text-[#CCFF00] block">
                      0ms
                    </span>
                    <span className="text-[11px] opacity-70">Overhead Latency</span>
                  </div>
                  <div
                    className={cn(
                      'col-span-2 sm:col-span-1 rounded-2xl p-4 border backdrop-blur-md',
                      activeTheme === 'obsidian'
                        ? 'bg-white/5 border-white/10'
                        : 'bg-white/80 border-[#141915]/10'
                    )}
                  >
                    <span className="font-mono text-xl sm:text-2xl font-bold block">100%</span>
                    <span className="text-[11px] opacity-70">React Native</span>
                  </div>
                </div>

                {/* Mock CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm',
                      activeTheme === 'obsidian'
                        ? 'bg-[#CCFF00] text-[#141915]'
                        : 'bg-[#0C3823] text-white'
                    )}
                  >
                    Primary Action
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium border backdrop-blur-sm',
                      activeTheme === 'obsidian'
                        ? 'border-white/20 text-white'
                        : 'border-[#141915]/20 text-[#141915]'
                    )}
                  >
                    Secondary Button
                  </span>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
