'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { CloudImage } from '@/components/ui/CloudImage';

const insights = [
  { title: '4 ways to reduce technical debt during front-end dev', slug: 'why-nextjs-is-best-for-business', image: '/images/technical-debt-card.png', category: 'Development', readTime: '6 min' },
  { title: 'Top AI apps right now: design edition', slug: 'how-to-build-successful-saas', image: '/images/insight-2.jpg', category: 'Design tools', readTime: '8 min' },
  { title: 'Why the last thing you should cut corners on this year is your branding', slug: 'web-performance-optimization-guide', image: '/images/insight-3.jpg', category: 'Branding', readTime: '5 min' },
];

export default function LatestInsightSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col gap-6 border-b border-[#164E33]/15 pb-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="flex flex-col items-start gap-2">
            <h2 className="font-heading text-4xl font-semibold tracking-[-0.05em] text-[#164E33] sm:text-5xl md:text-6xl">
              Latest insight
            </h2>
          </div>
          <Link href="/blog" className="group inline-flex w-fit items-center gap-3 rounded-full bg-[#164E33] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0C3823] hover:shadow-[0_12px_24px_rgba(22,78,51,0.18)]">
            <span>View all articles</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>

        <div className="grid gap-7 md:grid-cols-3">
          {insights.map((item, index) => (
            <motion.article
              key={item.slug}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              className="h-full"
            >
              <Link href={`/blog/${item.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-[#164E33]/15 bg-white shadow-[0_18px_50px_rgba(22,78,51,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_65px_rgba(22,78,51,0.15)]">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#E7ECE8]">
                  <CloudImage src={item.image} alt={item.title} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" crop={{ type: 'auto', source: true }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#082417]/35 via-transparent to-transparent opacity-70" />
                  <span className="absolute left-5 top-5 rounded-full border border-white/50 bg-white/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#164E33] backdrop-blur-md">{item.category}</span>
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <div className="mb-4 flex items-center justify-between text-xs text-[#164E33]/55">
                    <span>Insight {String(index + 1).padStart(2, '0')}</span>
                    <span>{item.readTime} read</span>
                  </div>
                  <h3 className="mb-7 font-heading text-xl font-medium leading-[1.25] tracking-[-0.04em] text-[#141915] sm:text-2xl">{item.title}</h3>
                  <div className="mt-auto flex items-center justify-between border-t border-[#164E33]/12 pt-5 text-sm font-medium text-[#164E33]">
                    <span>Read article</span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#164E33] text-white transition-transform duration-300 group-hover:rotate-45">
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
