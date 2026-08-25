'use client';

import * as React from 'react';

const partners = [
  { name: 'Y Combinator Alumni', tag: 'YC S23' },
  { name: 'Shopify Plus Partner', tag: 'OFFICIAL' },
  { name: 'Vercel Enterprise', tag: 'VERIFIED' },
  { name: 'AWS Cloud Network', tag: 'ADVANCED' },
  { name: 'Stripe Verified Partner', tag: 'ECOSYSTEM' },
  { name: 'Framer Expert Studio', tag: 'AUTHORIZED' },
];

export default function ClientLogoCloud() {
  return (
    <section className="py-12 border-y border-[#E5E0D8] bg-[#F0EDE5]/40 backdrop-blur-xs">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="flex flex-col items-center text-center mb-8">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#6E736D]">
            TRUSTED BY AMBITIOUS FOUNDERS &amp; ENGINEERING LEADERS GLOBALLY
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 items-center justify-items-center">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="w-full h-14 rounded-2xl bg-white/80 border border-[#E5E0D8] px-4 flex items-center justify-between hover:bg-white hover:border-[#0C3823]/40 hover:shadow-xs transition-all duration-200 group cursor-default"
            >
              <span className="font-heading font-black text-xs uppercase tracking-tight text-[#141915]/70 group-hover:text-[#141915] transition-colors">
                {partner.name}
              </span>
              <span className="text-[9px] font-mono font-bold tracking-widest text-[#0C3823] bg-[#0C3823]/10 px-1.5 py-0.5 rounded-sm">
                {partner.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
