'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function FrameDropSubnav() {
  const [activeSection, setActiveSection] = React.useState('overview');

  const navItems = [
    { label: 'Overview', href: '#overview' },
    { label: 'Pillars & Bento', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Catalog (25+)', href: '#catalog' },
    { label: 'Design System', href: '#design-system' },
    { label: 'Preflight (WCAG)', href: '#preflight-engine' },
    { label: 'Changelog v0.2.0', href: '#changelog' },
    { label: 'Feature Request', href: '/feature-request' },
    { label: 'Engineering Story', href: '#engineering-story' },
    { label: 'Press Kit', href: '#marketing-toolbox' },
  ];

  return (
    <div className="sticky top-20 z-40 w-full py-2.5 pointer-events-none mb-6">
      <div className="mx-auto max-w-[1500px] px-4 pointer-events-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-full bg-white/80 border border-[#141915]/10 shadow-md backdrop-blur-xl no-scrollbar justify-start sm:justify-center">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#555C54] hover:bg-[#0C3823] hover:text-white transition-all duration-200"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
