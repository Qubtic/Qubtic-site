'use client';

import { useState, useEffect } from 'react';
import { PricingToggle } from '@/components/pricing/PricingToggle';
import { PricingCard } from '@/components/pricing/PricingCard';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import InteractiveCostEstimator from '@/components/pricing/InteractiveCostEstimator';
import { PricingAnimation } from '@/components/pricing/PricingAnimation';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ArrowUpRight, Loader2, ShieldCheck, Zap, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PricingData } from '@/lib/store';

type CategoryDisplay = 'Web Development' | 'SaaS Development' | 'Shopify Apps' | 'Framer';

const categoryMap: Record<CategoryDisplay, keyof PricingData> = {
  'Web Development': 'web',
  'SaaS Development': 'saas',
  'Shopify Apps': 'shopify',
  'Framer': 'framer',
};

const categories: CategoryDisplay[] = ['Web Development', 'SaaS Development', 'Shopify Apps', 'Framer'];

export default function PricingPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryDisplay>('Web Development');
  const [isAnnual, setIsAnnual] = useState(false);
  const [pricing, setPricing] = useState<PricingData | null>(null);

  useEffect(() => {
    fetch('/api/admin/pricing')
      .then((res) => res.json())
      .then((data) => setPricing(data))
      .catch((err) => console.error('Failed to load pricing data', err));
  }, []);

  const currentCategoryKey = categoryMap[selectedCategory];
  const activePlans = pricing ? pricing[currentCategoryKey] || [] : [];

  return (
    <div className="pt-32 pb-24 md:pt-36 md:pb-32 overflow-hidden">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        
        {/* Hero Banner Section with Lottie Animation */}
        <div className="relative mb-16 lg:mb-20">
          {/* Ambient Background Glow */}
          <div className="pointer-events-none absolute -left-40 -top-20 h-[32rem] w-[32rem] rounded-full bg-[#E8C48A]/30 blur-[120px]" />
          <div className="pointer-events-none absolute -right-40 top-0 h-[32rem] w-[32rem] rounded-full bg-[#0C3823]/10 blur-[120px]" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Header Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#0C3823]/15 bg-white/70 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0C3823] mb-4 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-[#CCFF00] animate-pulse" />
                TRANSPARENT VALUE
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-[#141915] font-heading mb-6 leading-[1.1]">
                Pricing Plans Built for Scale
              </h1>
              <p className="text-base sm:text-lg text-[#666C64] leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0">
                Honest, milestone-driven pricing for startups, creators, and scaling enterprises. No surprise fees or hidden lock-ins.
              </p>

              {/* Value Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto lg:mx-0 mb-8 text-left">
                <div className="flex items-center gap-3 bg-white/60 border border-[#141915]/8 rounded-2xl p-3.5 shadow-2xs">
                  <ShieldCheck className="w-5 h-5 text-[#0C3823] shrink-0" />
                  <span className="text-xs font-semibold text-[#141915]">Milestone Guarantees</span>
                </div>
                <div className="flex items-center gap-3 bg-white/60 border border-[#141915]/8 rounded-2xl p-3.5 shadow-2xs">
                  <Zap className="w-5 h-5 text-[#0C3823] shrink-0" />
                  <span className="text-xs font-semibold text-[#141915]">Rapid Delivery</span>
                </div>
                <div className="flex items-center gap-3 bg-white/60 border border-[#141915]/8 rounded-2xl p-3.5 shadow-2xs">
                  <Award className="w-5 h-5 text-[#0C3823] shrink-0" />
                  <span className="text-xs font-semibold text-[#141915]">Full Source IP</span>
                </div>
              </div>
            </div>

            {/* Right Lottie Animation Graphic */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[460px]">
                <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-[#0C3823]/10 to-[#CCFF00]/15 blur-3xl -z-10" />
                <PricingAnimation />
              </div>
            </div>
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#141915] text-white shadow-xs scale-[1.02]'
                  : 'bg-white text-[#666C64] border border-[#E5E0D8] hover:bg-[#F0EDE5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Annual Discount Switch */}
        <div className="mb-16">
          <PricingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />
        </div>

        {/* Pricing Cards Grid */}
        {!pricing ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#0C3823]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-24">
            {activePlans.map((tier, idx) => {
              const basePrice = isAnnual ? tier.price.annual : tier.price.monthly;
              const original = isAnnual ? tier.price.monthly : undefined;
              return (
                <PricingCard
                  key={idx}
                  name={tier.name}
                  price={basePrice}
                  originalPrice={original}
                  description={tier.description}
                  features={tier.features}
                  isPopular={tier.popular}
                  ctaText={tier.cta || (tier.popular ? 'Get Started' : 'Select Plan')}
                  ctaHref="/contact"
                />
              );
            })}
          </div>
        )}

        {/* Interactive Scope & Cost Estimator */}
        <div className="mb-24">
          <InteractiveCostEstimator />
        </div>

        {/* Custom Solution Box */}
        <div className="bg-[#0C3823] text-white rounded-[28px] md:rounded-[36px] p-8 sm:p-12 text-center max-w-4xl mx-auto mb-24 shadow-xl relative overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#CCFF00]/10 blur-3xl" />
          <h3 className="text-2xl sm:text-3xl font-bold uppercase font-heading mb-3">
            Need a Custom Architecture or Retainer?
          </h3>
          <p className="text-white/80 max-w-xl mx-auto mb-6 text-sm sm:text-base">
            We configure dedicated development squads, long-term SLA retainers, and enterprise system migrations tailored to your exact roadmap.
          </p>
          <Button href="/contact" variant="outline" size="md" className="border-white text-white hover:bg-white hover:text-[#0C3823]">
            <span>Request Custom Proposal</span>
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>

        {/* FAQ Section */}
        <div>
          <SectionHeading
            badge="QUESTIONS & ANSWERS"
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about our billing, milestone delivery, and warranties."
            align="center"
          />
          <PricingFAQ />
        </div>
      </div>
    </div>
  );
}
