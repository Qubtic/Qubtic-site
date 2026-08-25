'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { 
  FaInstagram, 
  FaXTwitter, 
  FaLinkedinIn, 
  FaFacebookF, 
  FaGithub 
} from 'react-icons/fa6';

const menuLinks = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Our Work', href: '/portfolio' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'About Us', href: '/about' },
  { name: 'Insights', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

const serviceLinks = [
  { name: 'Web Development', href: '/services/web-development' },
  { name: 'SaaS Engineering', href: '/services/saas-development' },
  { name: 'Shopify Apps & Stores', href: '/services/shopify-apps' },
  { name: 'Framer Sites & Plugins', href: '/services/framer-development' },
  { name: 'Dedicated Retainers', href: '/pricing' },
];

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com/qubtic', icon: FaInstagram },
  { name: 'Twitter / X', href: 'https://twitter.com/qubtic', icon: FaXTwitter },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/qubtic', icon: FaLinkedinIn },
  { name: 'Facebook', href: 'https://facebook.com/qubtic', icon: FaFacebookF },
  { name: 'GitHub', href: 'https://github.com/qubtic', icon: FaGithub },
];

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
        <div className="absolute inset-0 bg-gradient-to-t from-[#002414]/95 via-[#00381F]/60 to-[#002414]/85" />
      </div>

      <div className="relative z-10 w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link href="/" className="group block h-12 w-44 overflow-hidden" aria-label="Qubtic Home">
              <Image
                src="/images/brand/qubtic-white.png"
                alt="Qubtic"
                width={1608}
                height={978}
                className="h-[106px] w-44 max-w-none -translate-y-[28px] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </Link>
            <p className="text-sm text-white/80 max-w-sm leading-relaxed font-normal">
              Qubtic is a digital product studio combining strategy, design, and senior engineering to build mission-critical digital experiences.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs text-white/70 w-fit">
              <span className="h-2 w-2 rounded-full bg-[#CCFF00] animate-pulse" />
              <span>Remote-First · Worldwide Delivery</span>
            </div>
          </div>

          {/* Nav Columns */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            
            {/* MENU Column */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] font-mono">
                MENU
              </h4>
              <ul className="flex flex-col gap-2.5 text-sm text-white/80">
                {menuLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                    >
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* SERVICES Column */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] font-mono">
                SERVICES
              </h4>
              <ul className="flex flex-col gap-2.5 text-sm text-white/80">
                {serviceLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                    >
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* SOCIAL MEDIA Column */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] font-mono">
                SOCIAL MEDIA
              </h4>
              <ul className="flex flex-col gap-2.5 text-sm text-white/80">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <li key={social.name}>
                      <a 
                        href={social.href} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="group inline-flex items-center gap-2.5 hover:text-white hover:translate-x-1 transition-all duration-200"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/80 group-hover:bg-[#CCFF00] group-hover:text-[#00381F] transition-colors shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span>{social.name}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#CCFF00]" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/15 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
          <p>&copy; {currentYear} QUIBTIC. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center gap-3.5">
            <Link href="/terms" className="hover:text-[#CCFF00] transition-colors">
              Terms of Service
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/privacy-policy" className="hover:text-[#CCFF00] transition-colors">
              Privacy Policy
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/refund-policy" className="hover:text-[#CCFF00] transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
