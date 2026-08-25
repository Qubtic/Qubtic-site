'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Compass, Code2, ShieldCheck, Rocket, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    number: '01',
    title: 'Discovery & Product Architecture',
    description: 'We translate complex requirements into actionable tech blueprints, user flows, and clear sprint roadmaps.',
    icon: Compass,
  },
  {
    number: '02',
    title: 'Agile Sprint Engineering',
    description: 'Our senior developers write clean, maintainable code with continuous integration and weekly demo checkpoints.',
    icon: Code2,
  },
  {
    number: '03',
    title: 'Rigorous QA & Performance Testing',
    description: 'We execute automated test suites, accessibility audits, and Core Web Vitals optimizations for maximum speed.',
    icon: ShieldCheck,
  },
  {
    number: '04',
    title: 'Seamless Production Launch',
    description: 'We deploy to serverless or cloud infrastructure with zero downtime and ongoing performance monitoring.',
    icon: Rocket,
  },
];

export default function WorkProcessSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-20 md:py-28 bg-[#141915] text-white rounded-[32px] md:rounded-[44px] my-16 shadow-2xl">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-[#164E33]/30 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[#CCFF00]/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#CCFF00] backdrop-blur-md mb-4">
            HOW WE WORK
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase font-heading tracking-tight mb-6 leading-tight">
            Our Collaborative Engineering Process
          </h2>
          <p className="text-white/70 text-base sm:text-lg leading-relaxed">
            From initial concept to deployment, we work as a natural extension of your team to build digital products designed for scale.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition-all duration-300 hover:border-[#CCFF00]/50 hover:bg-white/[0.07] hover:-translate-y-1.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#CCFF00] bg-[#CCFF00]/10 px-3 py-1 rounded-full border border-[#CCFF00]/20">
                      {step.number}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#164E33] text-[#CCFF00]">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="font-heading text-xl font-semibold mb-3 text-white">
                    {step.title}
                  </h3>

                  <p className="text-sm text-white/65 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-semibold text-[#CCFF00]">
                  <span>Phase {step.number}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Call to action bar */}
        <div className="mt-16 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 rounded-full bg-[#CCFF00] px-8 py-4 text-sm font-bold uppercase tracking-wider text-[#164E33] shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white"
          >
            <span>Ready to Build With Us?</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
