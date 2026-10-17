'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
export function FrameDropSubnav() {
  const navItems = [
    { label: 'Overview', href: '#overview' },
    { label: 'Pillars & Bento', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Catalog (34+)', href: '/framer/frame-drop/docs#catalog' },
    { label: 'Roadmap', href: '/framer/frame-drop/roadmap' },
    { label: 'Version Control', href: '/framer/frame-drop/version-control' },
    { label: 'Design System', href: '#design-system' },
    { label: 'Preflight (WCAG)', href: '#preflight-engine' },
    { label: 'Changelog v0.2.1', href: '#changelog' },
    { label: 'Feature Request', href: '/feature-request' },
    { label: 'Engineering Story', href: '#engineering-story' },
    { label: 'Press Kit', href: '#marketing-toolbox' },
  ];

  return (
    <div className="sticky top-20 z-40 w-full py-2.5 pointer-events-none mb-6">
      <div className="mx-auto max-w-[1500px] px-4 pointer-events-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-full bg-white/85 border border-[#141915]/10 shadow-md backdrop-blur-xl no-scrollbar justify-start sm:justify-center">
          <Link
            href="/framer/frame-drop"
            className="flex items-center gap-2 pl-2 pr-3 py-1 mr-1 rounded-full bg-[#0C3823]/5 hover:bg-[#0C3823]/10 transition-colors shrink-0"
          >
            <Image
              src="/images/brand/frame-drop-icon-transparent.png"
              alt="Frame Drop Logo"
              width={18}
              height={18}
              className="h-4.5 w-4.5 object-contain"
            />
            <span className="font-heading text-xs font-bold text-[#0C3823] tracking-tight">Frame Drop</span>
          </Link>
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
