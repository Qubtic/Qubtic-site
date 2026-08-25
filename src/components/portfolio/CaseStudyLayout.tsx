'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, TrendingUp, ExternalLink, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TechIcon } from '@/components/ui/TechIcon';
import { CloudImage } from '@/components/ui/CloudImage';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

interface ResultItem {
  label: string;
  value?: string | null;
  icon?: string;
}

interface Project {
  title: string;
  client: string;
  category: string;
  year: string;
  challenge: string;
  solution: string;
  results: ResultItem[];
  techStack: string[];
  testimonial: Testimonial;
  image?: string;
  liveUrl?: string;
}

interface CaseStudyLayoutProps {
  project: Project;
  prevSlug?: string;
  nextSlug?: string;
}

export default function CaseStudyLayout({ project, prevSlug, nextSlug }: CaseStudyLayoutProps) {
  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#666C64] mb-8">
          <Link href="/" className="hover:text-[#141915] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/portfolio" className="hover:text-[#141915] transition-colors">
            Our Work
          </Link>
          <span>/</span>
          <span className="text-[#0C3823] font-bold">{project.title}</span>
        </div>

        {/* Hero Meta Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-[#F0EDE5] border border-[#E5E0D8] text-[11px] font-bold uppercase tracking-wider text-[#0C3823]">
                {project.category}
              </span>
              <span className="text-xs text-[#666C64] font-semibold">
                Client: {project.client} · Year {project.year}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight text-[#141915] font-heading leading-tight">
              {project.title}
            </h1>
          </div>

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#0C3823] text-white hover:bg-[#CCFF00] hover:text-[#0C3823] text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md shrink-0 group"
            >
              <Globe className="w-4 h-4 text-[#CCFF00] group-hover:text-[#0C3823] transition-colors" />
              <span>Live Preview</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </a>
          )}
        </div>

        {/* Visual Showcase Banner */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-[28px] md:rounded-[36px] overflow-hidden border border-[#E5E0D8] mb-20 bg-[#F0EDE5] shadow-lg group">
          <CloudImage
            src={project.image || '/images/hero-banner.jpg'}
            alt={project.title}
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1280px) 100vw, 1280px"
            crop={{ type: 'auto', source: true }}
          />

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-6 right-6 z-20 inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#082417]/90 backdrop-blur-md border border-[#CCFF00]/40 text-white hover:bg-[#CCFF00] hover:text-[#082417] text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-xl hover:scale-105"
            >
              <span className="h-2 w-2 rounded-full bg-[#CCFF00] group-hover:bg-[#082417] animate-pulse" />
              <span>Launch Live Demo ↗</span>
            </a>
          )}
        </div>

        {/* 2-Column Challenge & Solution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-20">
          <div className="bg-white border border-[#E5E0D8] rounded-[28px] p-8 sm:p-10 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0C3823] block mb-3">
              THE PROBLEM
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold uppercase font-heading text-[#141915] mb-4">
              The Challenge
            </h2>
            <p className="text-base text-[#666C64] leading-relaxed font-normal">
              {project.challenge}
            </p>
          </div>

          <div className="bg-white border border-[#E5E0D8] rounded-[28px] p-8 sm:p-10 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0C3823] block mb-3">
              ENGINEERING APPROACH
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold uppercase font-heading text-[#141915] mb-4">
              Our Solution
            </h2>
            <p className="text-base text-[#666C64] leading-relaxed font-normal">
              {project.solution}
            </p>
          </div>
        </div>

        {/* Key Measurable Results with footer-bg.jpg texture overlay */}
        <div className="relative overflow-hidden rounded-[32px] md:rounded-[40px] bg-[#002B18] border border-[#164E33]/60 p-8 sm:p-12 md:p-16 mb-20 shadow-2xl">
          {/* Visible Ambient Background Image matching Footer */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image
              src="/images/footer-bg.jpg"
              alt="Studio Texture Background"
              fill
              priority
              className="object-cover object-center opacity-85 mix-blend-screen"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#001D10]/95 via-[#002B18]/60 to-[#001D10]/90" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-white/10">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#CCFF00] block mb-2">
                  BUSINESS IMPACT &amp; METRICS
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase font-heading text-white tracking-tight">
                  Measurable Results
                </h2>
              </div>
              <span className="text-xs font-mono text-white/60 tracking-wider">
                VERIFIED CASE METRICS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {project.results.map((res: any, idx: number) => {
                const isObject = typeof res === 'object' && res !== null;
                const text = isObject ? res.label || res.value : String(res);
                const rawVal = isObject ? res.value : null;
                const val = rawVal && rawVal !== '✓' && rawVal !== res.label ? rawVal : null;

                return (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-[24px] bg-[#082417]/80 backdrop-blur-xl border border-white/15 p-7 flex flex-col justify-between hover:border-[#CCFF00] hover:bg-[#082417]/95 transition-all duration-500 shadow-xl hover:-translate-y-1"
                  >
                    {/* Top Accent Line on hover */}
                    <span className="absolute inset-x-0 top-0 h-1 bg-[#CCFF00] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />

                    <div className="flex items-center justify-between mb-6">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#CCFF00] text-[#0C3823] font-bold shadow-[0_0_15px_rgba(204,255,0,0.3)] group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="w-5 h-5" />
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono font-bold tracking-widest text-[#CCFF00] uppercase">
                        KEY RESULT 0{idx + 1}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {val && (
                        <span className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-[#CCFF00] block">
                          {val}
                        </span>
                      )}
                      <p className="text-sm sm:text-base leading-relaxed text-white/95 font-medium group-hover:text-white transition-colors">
                        {text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tech Stack & Testimonial */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-20">
          <div className="lg:col-span-5 bg-white border border-[#E5E0D8] rounded-3xl p-8 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#0C3823] block mb-3">
                STACK
              </span>
              <h3 className="text-xl font-bold font-heading text-[#141915] mb-6">
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {project.techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F0EDE5] border border-[#E5E0D8] text-xs font-bold text-[#141915] shadow-2xs"
                  >
                    <TechIcon name={tech} className="w-4 h-4 shrink-0" />
                    <span>{tech}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#F0EDE5] border border-[#E5E0D8] rounded-3xl p-8 sm:p-10 flex flex-col justify-between">
            <p className="text-lg font-normal text-[#141915] italic leading-relaxed mb-6">
              &ldquo;{project.testimonial.quote}&rdquo;
            </p>
            <div>
              <span className="text-sm font-bold text-[#141915] font-heading block">
                {project.testimonial.author}
              </span>
              <span className="text-xs text-[#666C64]">
                {project.testimonial.role}, {project.client}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Between Projects */}
        <div className="flex items-center justify-between pt-8 border-t border-[#E5E0D8]">
          {prevSlug ? (
            <Link
              href={`/portfolio/${prevSlug}`}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0C3823] hover:text-[#164E33]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Project</span>
            </Link>
          ) : <div />}

          <Button href="/portfolio" variant="dark" size="sm">
            All Case Studies
          </Button>

          {nextSlug ? (
            <Link
              href={`/portfolio/${nextSlug}`}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0C3823] hover:text-[#164E33]"
            >
              <span>Next Project</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}
