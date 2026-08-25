'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: "What's included in each development plan?",
    answer:
      'Every plan includes dedicated senior engineering, responsive design, cross-browser testing, SEO technical setup, and post-launch support. Higher tiers include custom backend architectures, complex integrations, and dedicated staging environments.',
  },
  {
    question: 'Do you offer custom pricing for enterprise projects?',
    answer:
      'Yes. If your project has specific compliance, security, multi-region scalability, or legacy system migration requirements, we create custom tailored scope proposals.',
  },
  {
    question: "What is your project payment structure?",
    answer:
      'Our standard billing structure is 50% upfront to kick off discovery and architecture, and 50% upon final user acceptance testing and production deployment.',
  },
  {
    question: 'How long does a typical project take to deliver?',
    answer:
      'Websites typically take 2–4 weeks, Shopify apps and custom storefronts take 3–6 weeks, while end-to-end SaaS products take 6–12 weeks depending on feature complexity.',
  },
  {
    question: 'Do you provide ongoing maintenance and SLA support?',
    answer:
      'Yes, we offer ongoing retainer tiers covering uptime monitoring, security patches, new feature sprints, and guaranteed SLA response times.',
  },
];

export function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-3xl mx-auto divide-y divide-[#E5E0D8] border-y border-[#E5E0D8]">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="py-6">
            <button
              onClick={() => toggle(idx)}
              className="flex justify-between items-center w-full text-left font-heading text-lg font-bold text-[#141915] gap-4 cursor-pointer"
            >
              <span>{faq.question}</span>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-[#0C3823] transition-transform duration-200 shrink-0',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
            {isOpen && (
              <div className="pt-3 text-[#666C64] leading-relaxed text-sm animate-in fade-in duration-200 font-normal">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
