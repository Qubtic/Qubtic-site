'use client';

import * as React from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        'qubtic transformed our e-commerce platform into a high-performance machine. Our checkout conversion rate jumped by 150% within 60 days of launch.',
      author: 'Sarah Mitchell',
      role: 'CEO & Founder',
      company: 'TechVentures Retail',
      rating: 5,
    },
    {
      quote:
        'Building our enterprise SaaS platform with qubtic was seamless. Their engineering standards, security focus, and UI precision exceeded all benchmarks.',
      author: 'David Park',
      role: 'Head of Product',
      company: 'DataFlow Systems',
      rating: 5,
    },
    {
      quote:
        'The custom Shopify app qubtic built automated 20+ hours of inventory management per week. Truly a world-class IT solutions studio.',
      author: 'Maria Garcia',
      role: 'VP of E-Commerce',
      company: 'StyleHub Global',
      rating: 5,
    },
  ];

  const [currentIndex, setCurrentIndex] = React.useState(0);

  const prev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-16 md:py-24 border-t border-[#E5E0D8]">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14 gap-3.5">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#0C3823]/18 bg-[#0C3823]/[0.06] px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0C3823]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0C3823]/80">Client Feedback</span>
          </div>
          <h2 className="font-heading text-4xl font-semibold tracking-[-0.05em] text-[#141915] sm:text-5xl md:text-6xl">
            What Clients Say
          </h2>
          <p className="text-base sm:text-lg text-[#666C64] max-w-xl">
            Real feedback from founders and engineering leaders we partner with.
          </p>
        </div>

        {/* Testimonials 2-Column Grid - Expansive Full Width */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {testimonials.slice(0, 2).map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E5E0D8] rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative"
            >
              <Quote className="w-10 h-10 text-[#0C3823]/15 mb-4" />

              <p className="text-base sm:text-lg text-[#141915] leading-relaxed font-normal mb-8">
                &ldquo;{item.quote}&rdquo;
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-[#E5E0D8]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#0C3823] text-white flex items-center justify-center font-bold text-sm">
                    {item.author.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#141915] font-heading">
                      {item.author}
                    </h4>
                    <p className="text-xs text-[#666C64]">
                      {item.role}, {item.company}
                    </p>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
