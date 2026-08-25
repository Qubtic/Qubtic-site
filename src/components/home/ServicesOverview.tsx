'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const services = [
  { number: '01', title: 'Web Design', slug: 'web-development', description: 'Fast, expressive websites built to turn attention into meaningful action.' },
  { number: '02', title: 'UI/UX Design', slug: 'web-development', description: 'Clear product experiences that feel intuitive from the very first interaction.' },
  { number: '03', title: 'Brand Design', slug: 'saas-development', description: 'Distinctive visual systems that give growing businesses a memorable voice.' },
  { number: '04', title: 'Graphic Design', slug: 'framer-development', description: 'Campaign and product visuals designed to communicate with clarity and energy.' },
];

export default function ServicesOverview() {
  const [activeService, setActiveService] = React.useState(0);
  const reduceMotion = useReducedMotion();

  return (
    <section className="px-3 py-3 sm:px-5 sm:py-5">
      <div className="relative overflow-hidden rounded-[28px] bg-[#0E3825] text-white sm:rounded-[40px]">
        {/* Ambient Wave Graphic Texture Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/images/footer-bg.jpg"
            alt="Services Ambient Texture"
            fill
            priority
            className="object-cover object-center opacity-55 mix-blend-screen"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0E3825]/90 via-[#0C3823]/70 to-[#082417]/90" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1720px] px-5 py-16 sm:px-8 md:py-24 lg:px-12">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 flex flex-col gap-6 border-b border-white/20 pb-8 md:mb-16 md:flex-row md:items-end md:justify-between"
          >
            <div className="flex flex-col items-start gap-3.5">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#CCFF00]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">What We Do</span>
              </div>
              <h2 className="max-w-2xl font-heading text-4xl font-semibold tracking-[-0.05em] sm:text-5xl md:text-6xl">
                Ideas, shaped into digital experiences.
              </h2>
            </div>
            <Link href="/services" className="group inline-flex w-fit items-center gap-3 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-[#164E33]">
              <span>Explore services</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>

          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <motion.div
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              className="relative min-h-[360px] overflow-hidden rounded-[24px] bg-[#0E3825] lg:sticky lg:top-28 lg:min-h-[540px]"
            >
              <Image src="/images/services-showcase.jpg" alt="Digital product design showcase" fill className="object-cover transition-transform duration-700 hover:scale-[1.03]" sizes="(max-width: 1024px) 100vw, 42vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#082417]/90 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <div className="mb-3 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/60">
                  <span>Selected service</span><span className="h-px w-8 bg-white/35" /><span>{services[activeService].number}</span>
                </div>
                <p className="font-heading text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{services[activeService].title}</p>
              </div>
            </motion.div>

            <div className="divide-y divide-white/20 border-y border-white/20">
              {services.map((service, index) => {
                const isActive = activeService === index;
                return (
                  <motion.div key={`${service.number}-${service.title}`} initial={false} animate={{ opacity: 1, x: 0 }}>
                    <Link href={`/services/${service.slug}`} onMouseEnter={() => setActiveService(index)} onFocus={() => setActiveService(index)} className={`group grid gap-5 px-1 py-7 transition-all duration-300 sm:grid-cols-[52px_1fr_auto] sm:items-start sm:py-9 ${isActive ? 'text-white' : 'text-white/55 hover:text-white'}`}>
                      <span className="pt-1 font-mono text-xs text-white/45">{service.number}</span>
                      <div>
                        <h3 className="mb-3 font-heading text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">{service.title}</h3>
                        <p className={`max-w-lg text-sm leading-6 transition-colors ${isActive ? 'text-white/70' : 'text-white/40'}`}>{service.description}</p>
                      </div>
                      <span className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ${isActive ? 'rotate-0 bg-white text-[#164E33]' : 'rotate-45 border border-white/25 text-white group-hover:rotate-0'}`}>
                        <ArrowUpRight className="h-5 w-5" />
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
