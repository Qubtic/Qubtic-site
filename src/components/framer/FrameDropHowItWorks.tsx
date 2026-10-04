'use client';

import * as React from 'react';
import { 
  Compass, 
  SlidersHorizontal, 
  ArrowDownToLine, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Smartphone,
  Eye,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function FrameDropHowItWorks() {
  const [activeStep, setActiveStep] = React.useState<number>(1);
  const [isDropping, setIsDropping] = React.useState(false);
  const [dropSuccess, setDropSuccess] = React.useState(false);

  const handleSimulateDrop = () => {
    setIsDropping(true);
    setDropSuccess(false);
    setTimeout(() => {
      setIsDropping(false);
      setDropSuccess(true);
      setTimeout(() => setDropSuccess(false), 3500);
    }, 1200);
  };

  const steps = [
    {
      num: '01',
      title: 'Browse & Compose',
      tag: 'Pick Your Stack',
      short: 'Browse heroes, bentos, testimonials, and pricing.',
      description:
        'Explore curated categories tailored for SaaS, Studios, Portfolios, and Ecommerce, or assemble a complete page flow in the Studio Composer.',
      icon: Compass,
      highlights: ['25+ Production Presets', 'SaaS, Portfolio & Ecommerce', 'Drag & Reorder Multi-slots'],
    },
    {
      num: '02',
      title: 'Tune Your Brand & Preflight',
      tag: 'Customize & Audit',
      short: 'Tweak brand tokens, preview dark/light themes, and run WCAG audits.',
      description:
        'Adjust typography, brand colors, and layout spacing. Run the automated preflight audit to guarantee compliance and mobile responsiveness.',
      icon: SlidersHorizontal,
      highlights: ['Dynamic Palette Propagation', '6 Curated Modern Fonts', 'Real-time WCAG AA Audit'],
    },
    {
      num: '03',
      title: '1-Click Drop to Framer Canvas',
      tag: 'Drop to Canvas',
      short: 'Hit "Add to Canvas" to drop pure, responsive components.',
      description:
        'Click "Add to Canvas" and watch your production-ready section insert with full Framer property controls, ready to publish immediately.',
      icon: ArrowDownToLine,
      highlights: ['Instant Native Insertion', 'Full Property Controls in Framer', 'Zero Code Overwrite Risk'],
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 lg:py-28 relative bg-[#0C3823] text-white overflow-hidden rounded-[36px] sm:rounded-[48px] my-12 mx-3 sm:mx-6 lg:mx-8">
      {/* Ambient Lighting & Sheen */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[34rem] w-[34rem] rounded-full bg-[#164E33]/60 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[34rem] w-[34rem] rounded-full bg-[#CCFF00]/10 blur-[140px]" />

      <div className="relative mx-auto w-full max-w-[1600px] px-4 sm:px-8 md:px-12 lg:px-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#CCFF00] mb-4 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#CCFF00] animate-pulse" />
            3-STEP WORKFLOW
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-[1.08]">
            How Frame Drop Works
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/80 leading-relaxed font-normal">
            From design exploration to production canvas deployment in less than 30 seconds.
          </p>

          {/* ASCII / Pipeline Architectural Diagram (Visual Recreation) */}
          <div className="mt-8 hidden lg:block overflow-x-auto pb-2">
            <div className="inline-flex items-center gap-4 bg-[#082417] px-6 py-3.5 rounded-full border border-white/15 font-mono text-xs text-white/90 shadow-lg">
              <span className="text-[#CCFF00] font-bold">[01 / Pick Your Stack]</span>
              <span className="text-white/40 tracking-widest">────────►</span>
              <span className="text-[#CCFF00] font-bold">[02 / Customize &amp; Audit]</span>
              <span className="text-white/40 tracking-widest">────────►</span>
              <span className="text-[#CCFF00] font-bold">[03 / Drop to Canvas]</span>
            </div>
          </div>
        </div>

        {/* 3 Step Interactive Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = activeStep === idx + 1;

            return (
              <div
                key={step.num}
                onClick={() => setActiveStep(idx + 1)}
                className={cn(
                  'relative flex flex-col justify-between rounded-[32px] p-8 sm:p-10 transition-all duration-300 cursor-pointer border',
                  isCurrent
                    ? 'bg-white text-[#141915] border-white shadow-[0_20px_50px_rgba(0,0,0,0.35)] scale-[1.02]'
                    : 'bg-[#103F29]/80 text-white border-white/10 hover:border-white/25 hover:bg-[#103F29]'
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <span
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-lg font-bold shadow-sm',
                        isCurrent
                          ? 'bg-[#0C3823] text-[#CCFF00]'
                          : 'bg-white/10 text-white'
                      )}
                    >
                      {step.num}
                    </span>
                    <span
                      className={cn(
                        'text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full',
                        isCurrent
                          ? 'bg-[#0C3823]/10 text-[#0C3823]'
                          : 'bg-white/10 text-[#CCFF00]'
                      )}
                    >
                      {step.tag}
                    </span>
                  </div>

                  <h3
                    className={cn(
                      'font-heading text-2xl font-bold uppercase mb-3',
                      isCurrent ? 'text-[#141915]' : 'text-white'
                    )}
                  >
                    {step.title}
                  </h3>
                  
                  <p
                    className={cn(
                      'text-sm leading-relaxed mb-6 font-normal',
                      isCurrent ? 'text-[#555C54]' : 'text-white/75'
                    )}
                  >
                    {step.description}
                  </p>
                </div>

                <div>
                  <ul className="space-y-2.5 pt-6 border-t border-current/10 text-xs font-medium">
                    {step.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2
                          className={cn(
                            'w-4 h-4 shrink-0',
                            isCurrent ? 'text-[#0C3823]' : 'text-[#CCFF00]'
                          )}
                        />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Interactive Button for Step 3 */}
                  {step.num === '03' && (
                    <div className="mt-6 pt-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSimulateDrop();
                        }}
                        disabled={isDropping}
                        className={cn(
                          'w-full flex items-center justify-center gap-2 rounded-full py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md',
                          dropSuccess
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-[#0C3823] text-white hover:bg-[#164E33]'
                            : 'bg-[#CCFF00] text-[#141915] hover:bg-[#b5e600]'
                        )}
                      >
                        {isDropping ? (
                          <>
                            <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            <span>Inserting into Framer...</span>
                          </>
                        ) : dropSuccess ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Section Dropped Successfully!</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownToLine className="w-4 h-4" />
                            <span>Simulate 1-Click Drop</span>
                          </>
                        )}
                      </button>
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
