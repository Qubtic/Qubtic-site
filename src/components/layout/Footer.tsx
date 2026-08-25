'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith('/admin') || pathname === '/portfolio/admin') {
    return null;
  }

  return (
    <footer className="relative bg-[#00381F] text-white pt-16 pb-12 overflow-hidden">
      {/* Visible Ambient Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/images/footer-bg.jpg"
          alt="Footer Background"
          fill
          priority
          className="object-cover object-center opacity-75 mix-blend-screen"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#002414]/90 via-[#00381F]/50 to-[#002414]/80" />
      </div>

      <div className="relative z-10 w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16">
          {/* Brand Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Link href="/" className="group block h-12 w-44 overflow-hidden">
              <Image
                src="/images/brand/qubtic-white.png"
                alt="Qubtic"
                width={1608}
                height={978}
                className="h-[106px] w-44 max-w-none -translate-y-[28px] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </Link>
            <p className="text-sm text-white/80 max-w-md leading-relaxed font-normal">
              Qubtic is a digital product studio combining strategy, design, and engineering to build experiences that move ambitious businesses forward.
            </p>
          </div>

          {/* Nav Columns */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* MENU Column */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white">
                MENU
              </h4>
              <ul className="flex flex-col gap-3 text-sm text-white/80">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">Home</Link>
                </li>
                <li>
                  <Link href="/services" className="hover:text-white transition-colors">Service</Link>
                </li>
                <li>
                  <Link href="/portfolio" className="hover:text-white transition-colors">Our Work</Link>
                </li>
                <li>
                  <Link href="/portfolio" className="hover:text-white transition-colors">Project</Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
                </li>
              </ul>
            </div>

            {/* SERVICES Column */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white">
                SERVICES
              </h4>
              <ul className="flex flex-col gap-3 text-sm text-white/80">
                <li>
                  <Link href="/services/web-development" className="hover:text-white transition-colors">Web &amp; App Development</Link>
                </li>
                <li>
                  <Link href="/services/social-media" className="hover:text-white transition-colors">Social Media Marketing</Link>
                </li>
                <li>
                  <Link href="/services/email-marketing" className="hover:text-white transition-colors">Email Marketing</Link>
                </li>
                <li>
                  <Link href="/services/seo" className="hover:text-white transition-colors">SEO</Link>
                </li>
                <li>
                  <Link href="/services/creative-content" className="hover:text-white transition-colors">Creative &amp; Content</Link>
                </li>
              </ul>
            </div>

            {/* SOCIAL MEDIA Column */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white">
                SOCIAL MEDIA
              </h4>
              <ul className="flex flex-col gap-3 text-sm text-white/80">
                <li>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    Linkedin
                  </a>
                </li>
                <li>
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
          <p>&copy; {currentYear} QUIBTIC. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span>|</span>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/refund-policy" className="hover:text-white transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
