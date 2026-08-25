'use client';

import * as React from 'react';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function StatsCounter() {
  const metrics = [
    { value: '99%', label: 'Client Satisfaction', growth: '+12% YoY' },
    { value: '150%', label: 'Avg Conversion Boost', growth: 'Proven ROI' },
    { value: '50+', label: 'Digital Products Shipped', growth: 'Global Reach' },
    { value: '4+', label: 'Years Experience', growth: 'Enterprise Ready' },
    { value: '99.9%', label: 'Cloud Infrastructure Uptime', growth: 'SLA Guaranteed' },
  ];

  return (
    <section className="py-16 md:py-24 border-t border-[#E5E0D8]">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        {/* Top Split About Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start mb-16">
          <div className="lg:col-span-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0C3823] block mb-2">
              WHO WE ARE
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-[#141915] font-heading leading-tight">
              About qubtic
            </h2>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-4">
            <p className="text-base sm:text-lg text-[#666C64] leading-relaxed">
              At qubtic, we build websites, develop software, and craft scalable apps that help businesses dominate their category. We combine engineering excellence with thoughtful UI/UX to deliver digital experiences that work better, load faster, and convert higher.
            </p>
            <div>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-[#0C3823] hover:text-[#164E33] transition-colors group"
              >
                <span>Read our full story</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* 5-Column Metrics Bar Chart Layout - Matches Image 2 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="bg-[#F0EDE5] border border-[#E5E0D8] rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:bg-white transition-all duration-200 group shadow-2xs"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#666C64]">
                  {metric.growth}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#0C3823] opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-[#141915] font-heading block mb-1">
                  {metric.value}
                </span>
                <span className="text-xs sm:text-sm text-[#666C64] font-medium leading-snug">
                  {metric.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
