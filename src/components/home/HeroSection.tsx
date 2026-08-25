'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

interface HeroSectionProps {
  settings?: {
    heroBadge?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    primaryCtaText?: string;
  };
}

export default function HeroSection({ settings }: HeroSectionProps) {
  const reduceMotion = useReducedMotion();
  const title = settings?.heroTitle || 'We build digital products that scale your revenue';
  const subtitle = settings?.heroSubtitle || 'Qubtic is an elite software and design agency. We partner with fast-growing brands to build high-converting websites, SaaS platforms, and custom Shopify apps.';
  const ctaText = settings?.primaryCtaText || 'Explore our work';

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-36 sm:px-6 md:pt-40 lg:pb-24">
      <div className="pointer-events-none absolute -left-40 top-0 h-[34rem] w-[34rem] rounded-full bg-[#E8C48A]/35 blur-[110px]" />
      <div className="pointer-events-none absolute -right-40 top-0 h-[34rem] w-[34rem] rounded-full bg-[#E8C48A]/30 blur-[110px]" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-[28rem] w-[48rem] -translate-x-1/2 rounded-full bg-white/40 blur-[100px]" />

      <div className="relative mx-auto max-w-[1500px]">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Text & CTAs */}
          <div className="flex flex-col items-start text-left lg:col-span-7">
            {/* Top Watermark Accent: — QUBTIC — */}
            <div className="mb-6 flex items-center justify-start gap-4 select-none pointer-events-none sm:gap-6">
              <span className="h-px w-10 sm:w-16 bg-[#164E33]/25" />
              <span className="font-heading text-lg sm:text-2xl font-light uppercase tracking-[0.3em] text-[#164E33]/40">
                QUBTIC
              </span>
              <span className="h-px w-10 sm:w-16 bg-[#164E33]/25" />
            </div>

            {/* Badge Pill */}
            {/* <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#164E33]/15 bg-white/75 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#164E33] shadow-xs backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#CCFF00] shadow-[0_0_0_4px_rgba(204,255,0,0.2)]" />
              {badge}
            </div> */}

            <h1 className="font-heading text-4xl font-semibold uppercase leading-[0.96] tracking-[-0.06em] text-[#111512] sm:text-6xl md:text-6xl lg:text-[4.5rem] xl:text-[4.5rem]">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#687069] sm:text-lg sm:leading-8">
              {subtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-start gap-3.5">
              <Link href="/portfolio" className="group inline-flex items-center gap-3 rounded-full bg-[#164E33] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(22,78,51,0.2)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#0C3823]">
                {ctaText}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link href="/contact" className="group inline-flex items-center gap-3 rounded-full border border-[#164E33]/30 bg-white/45 px-7 py-3.5 text-sm font-semibold text-[#164E33] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white">
                Start a project
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#164E33]/45">
              <span>Scroll to explore</span>
              <motion.span animate={reduceMotion ? undefined : { y: [0, 5, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
                <ArrowDown className="h-4 w-4" />
              </motion.span>
            </div>
          </div>

          {/* Right Column: 3D Animation Graphic */}
          <div className="relative flex items-center justify-center lg:col-span-5">
            <div className="relative flex items-center justify-center p-4 sm:p-8">
              {/* Soft Ambient Radial Glow Behind the Cube */}
              <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-[#164E33]/15 blur-3xl sm:h-80 sm:w-80" />
              <div className="pointer-events-none absolute h-48 w-48 rounded-full bg-[#CCFF00]/30 blur-2xl sm:h-64 sm:w-64" />

              <div className="relative z-10">
                <Image
                  src="/3d-casual-life-blockchain-technologies.gif"
                  alt="3D Qubtic Animated Cube"
                  width={420}
                  height={420}
                  unoptimized
                  priority
                  className="h-auto w-64 drop-shadow-[0_24px_45px_rgba(22,78,51,0.28)] sm:w-80 md:w-96 lg:w-[420px]"
                />
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 50, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-14 overflow-hidden rounded-[28px] bg-[#164E33] p-3 shadow-[0_32px_80px_rgba(22,78,51,0.2)] sm:mt-16 sm:rounded-[38px] sm:p-4"
        >
          <div className="relative min-h-[430px] overflow-hidden rounded-[20px] sm:min-h-[520px] sm:rounded-[28px] lg:min-h-[650px]">
            <Image src="/images/hero-banner.jpg" alt="Qubtic product team collaborating" fill priority className="object-cover object-center transition-transform duration-[1400ms] hover:scale-[1.025]" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#082417]/70 via-transparent to-[#082417]/15" />
          </div>

          <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-white/25 bg-[#082417]/50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur-lg sm:left-8 sm:top-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#CCFF00]" />
            Strategy · Design · Engineering
          </div>

          <div className="absolute right-6 top-6 grid h-14 w-14 place-items-center rounded-full bg-[#CCFF00] text-[#164E33] shadow-xl sm:right-8 sm:top-8">
            <ArrowUpRight className="h-6 w-6" />
          </div>

          <div className="absolute bottom-6 left-6 right-6 grid gap-4 rounded-[20px] border border-white/20 bg-[#F7F4ED]/90 p-5 text-[#164E33] shadow-2xl backdrop-blur-xl sm:bottom-8 sm:left-auto sm:right-8 sm:w-[470px] sm:grid-cols-2 sm:p-6">
            <div><p className="font-heading text-3xl font-semibold tracking-[-0.06em]">50+</p><p className="mt-1 text-xs text-[#164E33]/55">Products shipped globally</p></div>
            <div><p className="font-heading text-3xl font-semibold tracking-[-0.06em]">4.9/5</p><p className="mt-1 text-xs text-[#164E33]/55">Partner satisfaction</p></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
