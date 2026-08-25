'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CloudImage } from '@/components/ui/CloudImage';

export default function FeaturedProjects() {
  const projects = [
    {
      title: 'NextHub E-Commerce Infrastructure',
      category: 'Web App & Headless Commerce',
      tag: 'WEB DEVELOPMENT',
      metric: '+150% Conversion Increase',
      description:
        'Engineered a headless multi-region e-commerce platform using Next.js 16, resulting in sub-second load times and a dramatic boost in checkout conversion rate.',
      image: '/images/work-1.jpg',
      slug: 'nexthub',
      highlights: ['Sub-second LCP score', 'Stripe & Shopify GraphQL', 'Automated inventory sync'],
    },
    {
      title: 'Analytix Pro Real-Time SaaS Dashboard',
      category: 'SaaS Platform & Data Engine',
      tag: 'SAAS PRODUCT',
      metric: '40K+ Daily Active Users',
      description:
        'Architected an end-to-end B2B analytics platform with real-time websocket data pipelines, role-based access control, and intuitive data visualization widgets.',
      image: '/images/work-2.jpg',
      slug: 'analytix-pro',
      highlights: ['Sub-50ms query response', 'Multi-tenant architecture', 'Automated PDF reporting'],
    },
    {
      title: 'StockSync Shopify Inventory App',
      category: 'Shopify Public App',
      tag: 'SHOPIFY ECOSYSTEM',
      metric: '1,200+ Active Stores',
      description:
        'Created a high-volume inventory sync and order management Shopify app featuring webhook automation and custom merchant dashboard controls.',
      image: '/images/hero-banner.jpg',
      slug: 'stocksync',
      highlights: ['Shopify App Store featured', '99.99% webhook uptime', '20+ hours saved/store/week'],
    },
  ];

  return (
    <section className="py-16 md:py-24 border-t border-[#E5E0D8]">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-[#E5E0D8] pb-8">
          <div className="flex flex-col items-start gap-3.5">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#0C3823]/18 bg-[#0C3823]/[0.06] px-4 py-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0C3823]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0C3823]/80">Featured Case Studies</span>
            </div>
            <h2 className="font-heading text-4xl font-semibold tracking-[-0.05em] text-[#141915] sm:text-5xl md:text-6xl">
              Our Work
            </h2>
          </div>
          <div>
            <Button href="/portfolio" variant="outline" size="md" className="group rounded-full px-6 py-3.5 border-[#0C3823]/25 font-semibold">
              <span>View All Projects</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Alternating Project Rows - Matches Editorial Layout */}
        <div className="flex flex-col gap-16 md:gap-24">
          {projects.map((project, idx) => {
            const isEven = idx % 2 === 1;
            return (
              <div
                key={project.slug}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center bg-white border border-[#E5E0D8] rounded-[28px] sm:rounded-[36px] md:rounded-[44px] p-6 sm:p-8 md:p-12 lg:p-14 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Content Column */}
                <div
                  className={`lg:col-span-6 flex flex-col justify-center ${isEven ? 'lg:order-2' : 'lg:order-1'
                    }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-[#F0EDE5] border border-[#E5E0D8] text-[11px] font-bold uppercase tracking-wider text-[#0C3823]">
                      {project.tag}
                    </span>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0C3823]/10 text-[#0C3823] text-[11px] font-bold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{project.metric}</span>
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-[#141915] font-heading mb-4 leading-snug">
                    {project.title}
                  </h3>

                  <p className="text-base text-[#666C64] leading-relaxed mb-6 font-normal">
                    {project.description}
                  </p>

                  {/* Highlights list */}
                  <ul className="flex flex-col gap-2.5 mb-8">
                    {project.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-[#141915] font-medium">
                        <CheckCircle2 className="w-4 h-4 text-[#0C3823] shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  <div>
                    <Button href={`/portfolio/${project.slug}`} variant="dark" size="md" className="group">
                      <span>View Case Study</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Button>
                  </div>
                </div>

                {/* Visual Image Column */}
                <div
                  className={`lg:col-span-6 relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden border border-[#E5E0D8] bg-[#F0EDE5] shadow-inner ${isEven ? 'lg:order-1' : 'lg:order-2'
                    }`}
                >
                  <CloudImage
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover object-center hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    crop={{ type: 'auto', source: true }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
