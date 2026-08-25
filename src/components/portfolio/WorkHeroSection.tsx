'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Users, CheckCircle2, Award } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export default function WorkHeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24 bg-[#FAF8F5]">
      {/* Background Glows */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[32rem] w-[32rem] rounded-full bg-[#164E33]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-10 h-[32rem] w-[32rem] rounded-full bg-[#CCFF00]/20 blur-[120px]" />
      
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Text & CTAs */}
          <div className="flex flex-col items-start text-left lg:col-span-6 xl:col-span-6">
            {/* Watermark Tag */}
            <div className="mb-6 flex items-center justify-start gap-3 select-none">
              <span className="h-px w-10 bg-[#164E33]/30" />
              <span className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-[#164E33]">
                PROVEN TRACK RECORD
              </span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold uppercase tracking-tight text-[#141915] leading-[1.02] mb-6">
              Engineering Digital Products That <span className="text-[#164E33]">Scale Growth</span>
            </h1>

            <p className="text-base sm:text-lg text-[#666C64] leading-relaxed max-w-2xl mb-8">
              A curated selection of scalable software platforms, custom web applications, Shopify apps, and design systems engineered by Qubtic in direct collaboration with our partners.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link
                href="#case-studies"
                className="group inline-flex items-center gap-3 rounded-full bg-[#164E33] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(22,78,51,0.2)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#0C3823]"
              >
                <span>Explore Case Studies</span>
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </Link>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 rounded-full border border-[#164E33]/25 bg-white px-7 py-3.5 text-sm font-semibold text-[#164E33] transition-all duration-300 hover:-translate-y-1 hover:border-[#164E33] hover:shadow-md"
              >
                <span>Start a Project</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            {/* Quick Metrics Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[#164E33]/15 w-full">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#164E33]/10 text-[#164E33] shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-heading text-lg font-bold text-[#141915] leading-none">50+</p>
                  <p className="text-[11px] text-[#666C64] mt-0.5">Projects Delivered</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#164E33]/10 text-[#164E33] shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-heading text-lg font-bold text-[#141915] leading-none">100%</p>
                  <p className="text-[11px] text-[#666C64] mt-0.5">In-House Team</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#164E33]/10 text-[#164E33] shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-heading text-lg font-bold text-[#141915] leading-none">4.9/5</p>
                  <p className="text-[11px] text-[#666C64] mt-0.5">Client Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Team Illustration */}
          <div className="relative flex items-center justify-center lg:col-span-6 xl:col-span-6">
            <div className="relative w-full max-w-[620px] aspect-[4/3] flex items-center justify-center">
              {/* Background radial glows */}
              <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-[#164E33]/20 blur-3xl sm:h-96 sm:w-96" />
              <div className="pointer-events-none absolute h-60 w-60 rounded-full bg-[#CCFF00]/30 blur-2xl sm:h-80 sm:w-80" />

              {/* 3D Image */}
              <div className="relative z-10 w-full h-full">
                <Image
                  src="/images/work-team.png"
                  alt="Qubtic Team Collaboration"
                  fill
                  priority
                  className="object-contain drop-shadow-[0_20px_45px_rgba(22,78,51,0.22)]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Glassmorphism Badge 1 - Top Right */}
              <div className="absolute top-4 right-2 sm:right-6 z-20 hidden sm:flex items-center gap-2.5 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold text-[#164E33] shadow-lg backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#CCFF00] shadow-[0_0_0_3px_rgba(204,255,0,0.4)]" />
                Collaborative Team Sprints
              </div>

              {/* Glassmorphism Badge 2 - Bottom Left */}
              <div className="absolute bottom-6 left-2 sm:left-6 z-20 hidden sm:flex items-center gap-3 rounded-2xl border border-white/70 bg-white/85 p-3.5 shadow-xl backdrop-blur-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#164E33] text-white">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#141915]">Cross-Functional Experts</p>
                  <p className="text-[10px] text-[#666C64]">Design, Product &amp; Tech</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
