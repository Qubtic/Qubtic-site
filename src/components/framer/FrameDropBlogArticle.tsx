'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  Clock, 
  User, 
  ArrowUpRight 
} from 'lucide-react';

interface FrameDropBlogArticleProps {
  onInstallClick?: () => void;
}

export function FrameDropBlogArticle({ onInstallClick }: FrameDropBlogArticleProps) {
  return (
    <article id="engineering-story" className="py-16 sm:py-20 lg:py-28 relative">
      <div className="relative mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Article Meta Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold uppercase tracking-wider text-[#666C64] mb-4">
            <span className="flex items-center gap-1.5 text-[#0C3823]">
              <User className="w-3.5 h-3.5" />
              By Qubtic Technologies Team
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Reading Time: 3 min
            </span>
            <span>•</span>
            <span className="rounded-full bg-[#0C3823]/10 px-3 py-0.5 text-[#0C3823] font-bold">
              Engineering Deep-Dive
            </span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-[#141915] leading-[1.08] text-balance">
            Introducing Frame Drop: Bringing Engineering Precision to the Framer Canvas
          </h2>
        </div>

        {/* Editorial Body Content */}
        <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-[#141915]/10 p-8 sm:p-12 md:p-16 shadow-sm space-y-8 text-base sm:text-lg text-[#333831] leading-relaxed">
          
          <p className="text-lg sm:text-xl font-normal text-[#141915] leading-relaxed">
            At Qubtic Technologies, our mission has always been to bridge the gap between world-class product design and robust engineering infrastructure.
          </p>

          <p>
            When designing for the web in tools like Framer, teams often run into a recurring challenge: rebuilding standard UI patterns from scratch, maintaining consistent accessibility standards, and ensuring design token harmony across multiple breakpoints.
          </p>

          <div className="my-10 border-y border-[#141915]/10 py-8">
            <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-[#0C3823] mb-6">
              Why We Built Frame Drop
            </h3>
            <p className="text-base text-[#555C54] mb-6">
              We built <strong className="text-[#141915]">Frame Drop</strong> to give founders, freelancers, and enterprise design teams an unfair speed advantage:
            </p>

            <div className="space-y-6">
              {/* Point 1 */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0C3823] text-white font-mono text-sm font-bold shadow-xs">
                  01
                </div>
                <div>
                  <h4 className="font-heading text-lg font-bold uppercase text-[#141915]">
                    No generic templates
                  </h4>
                  <p className="mt-1 text-sm sm:text-base text-[#555C54] leading-relaxed">
                    Instead of rigid full-site templates that take days to customize, Frame Drop provides modular, hyper-flexible sections that drop in cleanly alongside your existing canvas work.
                  </p>
                </div>
              </div>

              {/* Point 2 */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0C3823] text-white font-mono text-sm font-bold shadow-xs">
                  02
                </div>
                <div>
                  <h4 className="font-heading text-lg font-bold uppercase text-[#141915]">
                    Engineered with accessibility first
                  </h4>
                  <p className="mt-1 text-sm sm:text-base text-[#555C54] leading-relaxed">
                    Aesthetics shouldn&apos;t sacrifice usability. Frame Drop features an integrated preflight engine checking WCAG AA compliance, text contrasts, and touch targets in real time.
                  </p>
                </div>
              </div>

              {/* Point 3 */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0C3823] text-white font-mono text-sm font-bold shadow-xs">
                  03
                </div>
                <div>
                  <h4 className="font-heading text-lg font-bold uppercase text-[#141915]">
                    True token harmony
                  </h4>
                  <p className="mt-1 text-sm sm:text-base text-[#555C54] leading-relaxed">
                    Your brand isn&apos;t static. Custom font pickers, border radii, and color overrides propagate instantaneously to all inserted components.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-heading text-2xl font-bold uppercase text-[#141915] mb-4">
              Start Building with Frame Drop
            </h3>
            <p className="text-base text-[#555C54] leading-relaxed mb-8">
              Frame Drop is available directly inside the Framer Plugin Marketplace. Start free with essential components or unlock Frame Drop Pro for unlimited access to the entire design kit.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onInstallClick}
                className="inline-flex items-center gap-2 rounded-full bg-[#0C3823] px-7 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#164E33] hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Launch Frame Drop in Framer</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <Link
                href="#catalog"
                className="inline-flex items-center gap-2 rounded-full border border-[#141915]/20 bg-[#F4EFE6] px-6 py-3 text-sm font-semibold text-[#141915] transition-all duration-200 hover:bg-white"
              >
                <span>View Component Catalog</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </article>
  );
}
