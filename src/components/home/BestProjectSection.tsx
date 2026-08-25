'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const projects = [
  {
    title: 'Lakote Real Estate',
    location: 'Jakarta, Indonesia',
    href: '/portfolio/nexthub',
    image: '/images/services-showcase.jpg',
    category: 'Digital platform',
    year: '2026',
    summary: 'A refined property discovery experience designed around clarity, confidence, and effortless exploration.',
  },
  {
    title: 'Musikalis Music Platform',
    location: 'Kuala Lumpur, Malaysia',
    href: '/portfolio/analytix-pro',
    image: '/images/project-music.jpg',
    category: 'Product design',
    year: '2025',
  },
  {
    title: 'Bankot Financial Web',
    location: 'Sydney, Australia',
    href: '/portfolio/stocksync',
    image: '/images/work-2.jpg',
    category: 'Web experience',
    year: '2025',
  },
  {
    title: 'Course Online Platform',
    location: 'Dubai, UAE',
    href: '/portfolio/pixel-studio',
    image: '/images/hero-banner.jpg',
    category: 'Learning platform',
    year: '2024',
  },
];

export default function BestProjectSection() {
  const reduceMotion = useReducedMotion();
  const [featured, ...secondaryProjects] = projects;

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.header
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col gap-6 border-b border-[#164E33]/15 pb-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="flex flex-col items-start gap-2">
            <h2 className="font-heading text-4xl font-semibold tracking-[-0.05em] text-[#164E33] sm:text-5xl md:text-6xl lg:text-6xl">
              Projects with purpose.
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="group inline-flex w-fit items-center gap-3 rounded-full border border-[#164E33]/25 bg-white/60 px-6 py-3.5 text-sm font-semibold text-[#164E33] shadow-xs backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#164E33] hover:text-white hover:shadow-[0_12px_24px_rgba(22,78,51,0.18)]"
          >
            <span>View all work</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.header>

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-7">
          <motion.article
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7"
          >
            <Link href={featured.href} className="group flex h-full min-h-[620px] flex-col overflow-hidden rounded-[30px] bg-[#164E33] p-3 text-white sm:p-4">
              <div className="relative min-h-[360px] flex-1 overflow-hidden rounded-[22px] bg-[#0E3825]">
                <Image src={featured.image} alt={featured.title} fill priority className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]" sizes="(max-width: 1024px) 100vw, 58vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#082417]/55 via-transparent to-transparent" />
                <div className="absolute left-5 top-5 flex gap-2">
                  <span className="rounded-full border border-white/35 bg-[#082417]/45 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] backdrop-blur-md">Featured</span>
                  <span className="rounded-full border border-white/35 bg-[#082417]/45 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] backdrop-blur-md">{featured.year}</span>
                </div>
              </div>

              <div className="grid gap-7 px-3 py-7 sm:grid-cols-[1fr_auto] sm:items-end sm:px-5 sm:py-8">
                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.17em] text-white/55">{featured.category} · {featured.location}</p>
                  <h3 className="mb-4 font-heading text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">{featured.title}</h3>
                  <p className="max-w-xl text-sm leading-6 text-white/65">{featured.summary}</p>
                </div>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#164E33] transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="h-6 w-6" />
                </span>
              </div>
            </Link>
          </motion.article>

          <div className="grid gap-5 lg:col-span-5">
            {secondaryProjects.map((project, index) => (
              <motion.article
                key={project.title}
                initial={false}
                animate={{ opacity: 1, x: 0 }}
              >
                <Link href={project.href} className="group grid min-h-[190px] grid-cols-[38%_1fr] overflow-hidden rounded-[24px] border border-[#164E33]/15 bg-white transition-all duration-400 hover:-translate-y-1 hover:border-[#164E33]/35 hover:shadow-[0_18px_45px_rgba(22,78,51,0.1)]">
                  <div className="relative overflow-hidden bg-[#E6ECE8]">
                    <Image src={project.image} alt={project.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 1024px) 38vw, 18vw" />
                  </div>
                  <div className="flex min-w-0 flex-col p-5 sm:p-6">
                    <div className="mb-6 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-[#164E33]/55">
                      <span>{project.category}</span>
                      <span>{project.year}</span>
                    </div>
                    <h3 className="font-heading text-xl font-semibold leading-tight tracking-[-0.045em] text-[#141915] sm:text-2xl">{project.title}</h3>
                    <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                      <p className="text-xs text-[#164E33]/55">{project.location}</p>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#164E33]/25 text-[#164E33] transition-all duration-300 group-hover:bg-[#164E33] group-hover:text-white">
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
