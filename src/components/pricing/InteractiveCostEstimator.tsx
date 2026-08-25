'use client';

import * as React from 'react';
import { useState, useId } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Calculator, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type ProjectType = 'web' | 'saas' | 'shopify' | 'framer';

interface FeatureOption {
  id: string;
  label: string;
  price: number;
}

const basePrices: Record<ProjectType, { label: string; base: number; weeks: string }> = {
  web: { label: 'Custom Web Application', base: 2999, weeks: '3-4 Weeks' },
  saas: { label: 'Full-Stack SaaS Platform', base: 6999, weeks: '6-8 Weeks' },
  shopify: { label: 'Shopify App & Automation', base: 3499, weeks: '4-5 Weeks' },
  framer: { label: 'Interactive Framer Website', base: 1499, weeks: '2-3 Weeks' },
};

const featureList: FeatureOption[] = [
  { id: 'design-system', label: 'Bespoke Figma UI/UX Design System', price: 1200 },
  { id: 'billing', label: 'Stripe Billing & Subscription Engine', price: 1500 },
  { id: 'database', label: 'Multi-Tenant Database & Migrations', price: 1800 },
  { id: 'ai-api', label: 'AI Assistant / Custom API Integrations', price: 2000 },
  { id: 'seo-audit', label: 'Advanced SEO & Schema JSON-LD Setup', price: 800 },
  { id: 'sla-support', label: '60-Day Dedicated SLA Support & Warranty', price: 1000 },
];

export default function InteractiveCostEstimator() {
  const [projectType, setProjectType] = useState<ProjectType>('web');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['design-system', 'seo-audit']);
  const [isRush, setIsRush] = useState<boolean>(false);

  const toggleFeature = (id: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const featureTotal = selectedFeatures.reduce((acc, featId) => {
    const feat = featureList.find((f) => f.id === featId);
    return acc + (feat ? feat.price : 0);
  }, 0);

  const subtotal = basePrices[projectType].base + featureTotal;
  const finalTotal = isRush ? Math.round(subtotal * 1.25) : subtotal;
  const lowEstimate = Math.round(finalTotal * 0.9);
  const highEstimate = Math.round(finalTotal * 1.15);

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-[28px] sm:rounded-[36px] md:rounded-[44px] p-6 sm:p-10 md:p-14 shadow-md">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E5E0D8] mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C3823]/10 text-[#0C3823] text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>INSTANT PROJECT SCOPING</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#141915] font-heading">
            Interactive Cost Estimator
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#666C64] max-w-sm">
          Select your requirements below to calculate a transparent ballpark estimate and scope breakdown.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Controls */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Step 1: Project Type */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#141915] block mb-3">
              1. Select Project Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(basePrices) as ProjectType[]).map((key) => {
                const isSelected = projectType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setProjectType(key)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#0C3823] bg-[#0C3823]/5 shadow-xs'
                        : 'border-[#E5E0D8] bg-[#F8F7F2] hover:bg-white hover:border-[#0C3823]/30'
                    }`}
                  >
                    <span className="text-sm font-bold text-[#141915] font-heading block mb-1">
                      {basePrices[key].label}
                    </span>
                    <span className="text-xs text-[#0C3823] font-semibold">
                      From ${basePrices[key].base.toLocaleString()} · {basePrices[key].weeks}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Add-On Capabilities */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#141915] block mb-3">
              2. Add Desired Features &amp; Modules
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featureList.map((feat) => {
                const isChecked = selectedFeatures.includes(feat.id);
                return (
                  <button
                    key={feat.id}
                    type="button"
                    onClick={() => toggleFeature(feat.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 ${
                      isChecked
                        ? 'border-[#0C3823] bg-[#0C3823] text-white shadow-xs'
                        : 'border-[#E5E0D8] bg-white text-[#141915] hover:bg-[#F8F7F2]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                          isChecked
                            ? 'bg-[#CCFF00] text-[#0C3823] border-transparent'
                            : 'border-[#D5CEBF] bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-medium leading-snug">
                        {feat.label}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold whitespace-nowrap ${
                        isChecked ? 'text-[#CCFF00]' : 'text-[#0C3823]'
                      }`}
                    >
                      +${feat.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Delivery Velocity */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#141915] block mb-3">
              3. Delivery Velocity
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsRush(false)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  !isRush
                    ? 'border-[#0C3823] bg-[#0C3823]/5'
                    : 'border-[#E5E0D8] bg-[#F8F7F2]'
                }`}
              >
                <span className="text-xs font-bold text-[#141915] uppercase tracking-wider block mb-1">
                  Standard Velocity
                </span>
                <span className="text-xs text-[#666C64]">
                  Thorough sprint cycles ({basePrices[projectType].weeks})
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsRush(true)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  isRush
                    ? 'border-[#0C3823] bg-[#0C3823]/5'
                    : 'border-[#E5E0D8] bg-[#F8F7F2]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#141915] uppercase tracking-wider block">
                    Fast-Track Sprint
                  </span>
                  <span className="text-[10px] font-bold text-[#0C3823] bg-[#0C3823]/10 px-2 py-0.5 rounded-full">
                    PRIORITY
                  </span>
                </div>
                <span className="text-xs text-[#666C64]">
                  Dedicated double-velocity sprint squads
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Summary Card */}
        <div className="lg:col-span-5 bg-[#0C3823] text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col justify-between h-full">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] block mb-2">
              ESTIMATED PROJECT INVESTMENT
            </span>
            <div className="mb-6">
              <span className="text-4xl sm:text-5xl font-black font-heading tracking-tight text-white block">
                ${lowEstimate.toLocaleString()} – ${highEstimate.toLocaleString()}
              </span>
              <span className="text-xs text-white/70 mt-1 block">
                Estimated milestone delivery: {isRush ? 'Accelerated Sprint' : basePrices[projectType].weeks}
              </span>
            </div>

            {/* Inclusions summary */}
            <div className="pt-6 border-t border-white/15 space-y-3 mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80 block">
                Included in This Estimate:
              </span>
              <ul className="space-y-2 text-xs text-white/90">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>{basePrices[projectType].label} Core Architecture</span>
                </li>
                {selectedFeatures.map((featId) => {
                  const feat = featureList.find((f) => f.id === featId);
                  if (!feat) return null;
                  return (
                    <li key={featId} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#CCFF00]" />
                      <span>{feat.label}</span>
                    </li>
                  );
                })}
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>100% Code Ownership &amp; IP Transfer Upon Final Payment</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <Button
              href={`/contact?service=${encodeURIComponent(basePrices[projectType].label)}`}
              variant="lime"
              size="lg"
              className="w-full justify-center group"
            >
              <span>Book Discovery Call With This Scope</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
            <p className="text-[11px] text-white/60 text-center mt-3">
              No obligation · Full proposal &amp; timeline returned in 24h
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
