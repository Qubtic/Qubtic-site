'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { TechIcon } from '@/components/ui/TechIcon';
import { CloudImage } from '@/components/ui/CloudImage';

interface ProjectCardProps {
  title: string;
  category: string;
  slug: string;
  shortDescription: string;
  metric?: string;
  techStack?: string[];
  image?: string;
  liveUrl?: string;
  index: number;
}

const categoryLabels: Record<string, string> = {
  website: 'Web Development',
  saas: 'SaaS Platform',
  shopify: 'Shopify App',
  framer: 'Framer Site',
};

const projectImages: Record<string, string> = {
  nexthub: '/images/services-showcase.jpg',
  'analytix-pro': '/images/project-music.jpg',
  stocksync: '/images/work-2.jpg',
  'pixel-studio': '/images/hero-banner.jpg',
  medflow: '/images/work-1.jpg',
  'foodie-express': '/images/insight-1.jpg',
};

export default function ProjectCard({
  title,
  category,
  slug,
  shortDescription,
  metric,
  techStack = [],
  image,
  liveUrl,
  index,
}: ProjectCardProps) {
  const reduceMotion = useReducedMotion();
  const imgSrc = image ?? projectImages[slug] ?? '/images/work-1.jpg';

  return (
    <motion.article
      layout
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link
        href={`/portfolio/${slug}`}
        data-cursor="interactive"
        className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#164E33]/15 bg-white shadow-[0_14px_40px_rgba(22,78,51,0.07)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-[#164E33] hover:shadow-[0_24px_60px_rgba(22,78,51,0.18)]"
      >
        <div className="relative aspect-[5/4] overflow-hidden bg-[#E6ECE8]">
          <CloudImage
            src={imgSrc}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            crop={{ type: 'auto', source: true }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#082417]/65 via-transparent to-[#082417]/10 transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:from-[#082417]/85 group-hover:via-[#164E33]/10" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
            <span className="rounded-full border border-white/35 bg-[#082417]/45 px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-white backdrop-blur-md">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="rounded-full border border-white/45 bg-white/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#164E33] backdrop-blur-md">
              {categoryLabels[category] || category}
            </span>
          </div>

          {metric && (
            <div className="absolute bottom-5 left-5 rounded-full border border-white/25 bg-[#164E33]/85 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md">
              {metric}
            </div>
          )}

          <div className="absolute bottom-5 right-5 flex translate-y-3 items-center gap-2 rounded-full bg-[#CCFF00] py-2 pl-4 pr-2 text-xs font-semibold text-[#164E33] opacity-0 shadow-lg transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100">
            <span className="hidden sm:inline">View case study</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#164E33] text-white">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col overflow-hidden bg-white p-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[#164E33] sm:p-7">
          <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-[#CCFF00] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
          <span className="absolute -bottom-28 -right-24 h-64 w-64 rounded-full bg-[#CCFF00]/10 opacity-0 blur-3xl transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100" />

          <div className="relative z-10 mb-3 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#164E33]/55 transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-white/55">
            <span>Case study</span>
            <span className="h-px flex-1 bg-[#164E33]/15 transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-white/20" />
            <span>QBT / {String(index + 1).padStart(2, '0')}</span>
          </div>

          <h3 className="relative z-10 mb-3 font-heading text-2xl font-semibold leading-[1.15] tracking-[-0.05em] text-[#141915] transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-white">
            {title}
          </h3>
          <p className="relative z-10 mb-7 line-clamp-2 text-sm leading-6 text-[#6E736D] transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-white/65">
            {shortDescription}
          </p>

          <div className="relative z-10 mt-auto flex items-end justify-between gap-4 border-t border-[#164E33]/12 pt-5 transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-white/20">
            <div className="flex min-w-0 flex-wrap gap-1.5">
              {techStack.slice(0, 2).map((tech) => (
                <span key={tech} className="inline-flex items-center gap-1.5 rounded-full bg-[#F0EDE5] border border-[#E5E0D8] px-3 py-1 text-xs font-semibold text-[#141915] shadow-xs transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-white/15 group-hover:border-white/20 group-hover:text-white">
                  <TechIcon name={tech} className="w-4 h-4 shrink-0" />
                  <span>{tech}</span>
                </span>
              ))}
              {techStack.length > 2 && (
                <span className="inline-flex items-center rounded-full bg-[#F0EDE5] border border-[#E5E0D8] px-2.5 py-1 text-xs font-bold text-[#141915] transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-white/15 group-hover:border-white/20 group-hover:text-white">
                  +{techStack.length - 2}
                </span>
              )}
            </div>

            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#164E33] text-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-45 group-hover:bg-[#CCFF00] group-hover:text-[#164E33]">
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
