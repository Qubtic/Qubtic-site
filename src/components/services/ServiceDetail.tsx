'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronDown, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface Step {
  title: string;
  description: string;
}

interface Faq {
  question: string;
  answer: string;
}

interface ServiceData {
  title: string;
  subtitle: string;
  longDescription: string[];
  process: Step[];
  features: string[];
  techStack: string[];
  faq: Faq[];
}

interface ServiceDetailProps {
  service: ServiceData;
}

export default function ServiceDetail({ service }: ServiceDetailProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#666C64] mb-8">
          <Link href="/" className="hover:text-[#141915] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/services" className="hover:text-[#141915] transition-colors">
            Services
          </Link>
          <span>/</span>
          <span className="text-[#0C3823] font-bold">{service.title}</span>
        </div>

        {/* Hero Section */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0C3823] block mb-3">
            CAPABILITY DEEP DIVE
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight text-[#141915] font-heading mb-6 leading-tight">
            {service.title}
          </h1>
          <p className="text-base sm:text-lg text-[#666C64] leading-relaxed mb-8">
            {service.subtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button href="/contact" variant="forest" size="md">
              <span>Request Scoping Call</span>
              <ArrowUpRight className="w-4 h-4" />
            </Button>
            <Button href="/pricing" variant="outline" size="md">
              <span>View Pricing Plans</span>
            </Button>
          </div>
        </div>

        {/* Long Description Overview */}
        <div className="bg-white border border-[#E5E0D8] rounded-[28px] md:rounded-[36px] p-8 sm:p-12 mb-20 shadow-sm">
          <h2 className="text-2xl font-bold uppercase font-heading text-[#141915] mb-6">
            Overview &amp; Architecture
          </h2>
          <div className="space-y-4 text-[#666C64] text-base leading-relaxed">
            {service.longDescription.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        {/* Process Timeline Section */}
        <div className="mb-20">
          <div className="mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0C3823] block mb-2">
              OUR STEP-BY-STEP WORKFLOW
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#141915] font-heading">
              Delivery Process
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.process.map((step, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <span className="text-xs font-mono font-bold tracking-widest text-[#0C3823] bg-[#0C3823]/10 px-2.5 py-1 rounded-full inline-block mb-4">
                    STAGE 0{idx + 1}
                  </span>
                  <h3 className="text-xl font-bold text-[#141915] font-heading mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#666C64] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <div className="mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0C3823] block mb-2">
              WHAT YOU RECEIVE
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#141915] font-heading">
              Core Deliverables
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {service.features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-[#F0EDE5] border border-[#E5E0D8] rounded-xl p-4 flex items-center gap-3 text-[#141915] font-semibold text-sm"
              >
                <CheckCircle2 className="w-5 h-5 text-[#0C3823] shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-[#0C3823] text-white rounded-[28px] md:rounded-[36px] p-8 sm:p-12 mb-20 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] block mb-3">
            TECHNICAL FOUNDATION
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold uppercase font-heading mb-6">
            Technologies &amp; Frameworks
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {service.techStack.map((tech, idx) => (
              <span
                key={idx}
                className="px-4 py-2 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/15"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0C3823] block mb-2">
              QUESTIONS &amp; ANSWERS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#141915] font-heading">
              Service FAQ
            </h2>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-[#E5E0D8] border-y border-[#E5E0D8]">
            {service.faq.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="py-6">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="flex justify-between items-center w-full text-left font-heading text-lg font-bold text-[#141915] gap-4 cursor-pointer"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 text-[#0C3823] transition-transform duration-200 shrink-0',
                        isOpen && 'rotate-180'
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="pt-3 text-[#666C64] leading-relaxed text-sm animate-in fade-in duration-200">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-white border border-[#E5E0D8] rounded-[28px] md:rounded-[36px] p-10 sm:p-14 shadow-sm">
          <h3 className="text-2xl sm:text-3xl font-bold uppercase font-heading text-[#141915] mb-4">
            Ready to Build Your {service.title}?
          </h3>
          <p className="text-[#666C64] max-w-md mx-auto mb-8 text-sm sm:text-base">
            Let&apos;s evaluate your project requirements and prepare a milestone-driven plan.
          </p>
          <Button href="/contact" variant="forest" size="lg">
            <span>Start Your Project Today</span>
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
