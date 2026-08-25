'use client';

import * as React from 'react';
import Link from 'next/link';

export default function TeamSection() {
  const team = [
    {
      name: 'Jordan Abigail',
      role: 'Senior UI/UX Designer',
      initials: 'JA',
      bg: 'from-stone-700 to-stone-900',
    },
    {
      name: 'Marcus Horizon',
      role: 'Senior Full Stack Lead',
      initials: 'MH',
      bg: 'from-[#0C3823] to-[#082417]',
    },
    {
      name: 'Ahmad Jalaludin',
      role: 'Software Architect',
      initials: 'AJ',
      bg: 'from-neutral-800 to-neutral-900',
    },
    {
      name: 'Jimmy Sullivan',
      role: 'Product Lead',
      initials: 'JS',
      bg: 'from-stone-800 to-stone-950',
    },
  ];

  return (
    <section className="py-16 md:py-24 border-t border-[#E2DBD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-[#E2DBD0] mb-12">
          <div className="flex flex-col items-start gap-3.5">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#0C3823]/18 bg-[#0C3823]/[0.06] px-4 py-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0C3823]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0C3823]/80">Our Team</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.05em] text-[#141915]">
              Our Best Designers & Engineers
            </h2>
          </div>
          <div>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-[#141915] text-xs font-bold tracking-wide transition-all shadow-2xs hover:-translate-y-0.5"
            >
              View more
            </Link>
          </div>
        </div>

        {/* 4-Column Designers Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {team.map((member, idx) => (
            <div
              key={idx}
              className="bg-[#EFECE3]/80 border border-[#E0D9CD] rounded-[28px] p-4 sm:p-5 flex flex-col items-center text-center hover:bg-white hover:border-[#141915] hover:shadow-md transition-all duration-300 group"
            >
              {/* Portrait Container */}
              <div
                className={`w-full aspect-[4/5] rounded-2xl bg-gradient-to-br ${member.bg} text-white flex items-center justify-center font-heading font-black text-3xl tracking-tight mb-4 shadow-inner group-hover:scale-[1.02] transition-transform`}
              >
                <span>{member.initials}</span>
              </div>

              <h3 className="text-base font-bold text-[#141915] font-heading mb-0.5">
                {member.name}
              </h3>
              <p className="text-xs text-[#8C9188] font-medium">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
