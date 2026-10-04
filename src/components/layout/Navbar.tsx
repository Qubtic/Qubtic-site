'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ArrowUpRight, 
  Menu, 
  X, 
  ChevronDown, 
  Sparkles, 
  BookOpen, 
  Layers, 
  SlidersHorizontal 
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavLinkItem {
  name: string;
  href: string;
  isProduct?: boolean;
}

const navLinks: NavLinkItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Product', href: '/framer/frame-drop', isProduct: true },
  { name: 'Services', href: '/services' },
  { name: 'Work', href: '/portfolio' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'About', href: '/about' },
  { name: 'Insights', href: '/blog' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isProductOpen, setIsProductOpen] = React.useState(false);
  const [isMobileProductOpen, setIsMobileProductOpen] = React.useState(true);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    setIsProductOpen(false);
    setIsOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProductOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProductOpen(false);
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleProductEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsProductOpen(true);
  };

  const handleProductLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsProductOpen(false);
    }, 180);
  };

  const closeProductMenu = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsProductOpen(false);
  };

  if (pathname?.startsWith('/admin') || pathname === '/portfolio/admin') {
    return null;
  }

  const isProductActive = pathname?.startsWith('/framer') || pathname === '/feature-request';

  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 px-3 transition-all duration-500 sm:px-5', isScrolled ? 'pt-2' : 'pt-4')}>
      <motion.div
        layout
        className={cn(
          'liquid-glass-nav relative mx-auto flex h-[68px] items-center justify-between overflow-visible rounded-[22px] px-4 text-[#164E33] transition-all duration-500 sm:px-5',
          isScrolled ? 'liquid-glass-nav--scrolled max-w-6xl' : 'max-w-[1500px]'
        )}
      >
        <Link href="/" onClick={() => setIsOpen(false)} className="group relative z-10 block h-10 w-32 overflow-hidden" aria-label="Qubtic home">
          <Image
            src="/images/brand/qubtic-green.png"
            alt="Qubtic"
            width={1672}
            height={941}
            priority
            className="h-[72px] w-32 max-w-none -translate-y-[15px] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>

        {/* Center Desktop Navigation */}
        <nav className="absolute left-1/2 z-10 hidden -translate-x-1/2 items-center gap-1 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => {
            if (link.isProduct) {
              return (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={handleProductEnter}
                  onMouseLeave={handleProductLeave}
                >
                  <Link
                    href={link.href}
                    onClick={closeProductMenu}
                    className={cn(
                      'group relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300',
                      isProductActive
                        ? 'bg-[#164E33] text-white shadow-sm'
                        : isProductOpen
                        ? 'bg-white/80 text-[#164E33]'
                        : 'text-[#164E33]/60 hover:bg-white/60 hover:text-[#164E33]'
                    )}
                    aria-expanded={isProductOpen}
                    aria-haspopup="true"
                  >
                    <span>{link.name}</span>
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 transition-transform duration-300',
                        isProductOpen && 'rotate-180',
                        isProductActive ? 'text-white/80' : 'text-[#164E33]/60 group-hover:text-[#164E33]'
                      )}
                    />
                  </Link>
                </div>
              );
            }

            const isActive = link.href === '/' ? pathname === '/' : (pathname === link.href || pathname?.startsWith(`${link.href}/`));
            return (
              <Link
                key={link.name}
                href={link.href}
                onMouseEnter={closeProductMenu}
                className={cn(
                  'relative rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300',
                  isActive ? 'bg-[#164E33] text-white shadow-sm' : 'text-[#164E33]/60 hover:bg-white/60 hover:text-[#164E33]'
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Product Dropdown Frame */}
        <AnimatePresence>
          {isProductOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={handleProductEnter}
              onMouseLeave={handleProductLeave}
              className="absolute left-1/2 -translate-x-1/2 top-full pt-2.5 z-50 w-[620px] max-w-[calc(100vw-32px)] pointer-events-auto"
            >
              <div className="overflow-hidden rounded-[26px] border border-[#164E33]/15 bg-[#FAF8F5]/98 p-5 shadow-[0_24px_60px_rgba(12,56,35,0.16)] backdrop-blur-2xl text-[#141915]">
                {/* Header Bar */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#141915]/8">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#164E33] opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#164E33]" />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#164E33] font-heading">
                      Product Spotlight
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#164E33]/20 bg-[#164E33]/5 px-2.5 py-0.5 text-[10px] font-bold text-[#164E33]">
                      <Sparkles className="h-3 w-3 text-[#164E33]" />
                      <span>Framer Plugin</span>
                    </span>
                    <span className="rounded-full bg-[#CCFF00] px-2 py-0.5 text-[10px] font-bold text-[#0C3823]">
                      v0.2.0 Live
                    </span>
                  </div>
                </div>

                {/* Hero Product Card: Frame Drop */}
                <Link
                  href="/framer/frame-drop"
                  onClick={closeProductMenu}
                  className="group/product relative block overflow-hidden rounded-2xl border border-[#164E33]/10 bg-white p-4 transition-all duration-300 hover:border-[#164E33]/30 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0C3823] to-[#164E33] shadow-sm transition-transform duration-300 group-hover/product:scale-105 p-2 border border-white/20">
                      <Image
                        src="/images/brand/frame-drop-icon-transparent.png"
                        alt="Frame Drop Logo"
                        width={28}
                        height={28}
                        className="h-7 w-7 object-contain brightness-0 invert drop-shadow-[0_2px_8px_rgba(204,255,0,0.5)]"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-[#141915] font-heading group-hover/product:text-[#164E33] transition-colors">
                            Frame Drop
                          </h3>
                          <span className="text-[11px] font-medium text-[#666C64]">
                            by Qubtic
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#164E33] group-hover/product:translate-x-0.5 transition-transform">
                          <span>Explore Studio</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#555C54] leading-relaxed line-clamp-2">
                        Native Framer component suite & page studio. 1-click responsive section drops with Liquid Glass tokens and WCAG AA accessibility preflights.
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Subnav Quick Links Grid */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Link
                    href="/framer/frame-drop/docs"
                    onClick={closeProductMenu}
                    className="group/sub flex flex-col rounded-xl border border-transparent bg-white/60 p-3 transition-all duration-200 hover:border-[#164E33]/15 hover:bg-white hover:shadow-2xs"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-[#141915] group-hover/sub:text-[#164E33]">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#164E33]/10 text-[#164E33]">
                        <BookOpen className="h-3.5 w-3.5" />
                      </div>
                      <span>Documentation</span>
                    </div>
                    <p className="mt-1.5 text-[11px] text-[#666C64] leading-snug">
                      Setup guide, shortcuts & 25+ drops.
                    </p>
                  </Link>

                  <Link
                    href="/framer/frame-drop#catalog"
                    onClick={closeProductMenu}
                    className="group/sub flex flex-col rounded-xl border border-transparent bg-white/60 p-3 transition-all duration-200 hover:border-[#164E33]/15 hover:bg-white hover:shadow-2xs"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-[#141915] group-hover/sub:text-[#164E33]">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#164E33]/10 text-[#164E33]">
                        <Layers className="h-3.5 w-3.5" />
                      </div>
                      <span>Component Catalog</span>
                    </div>
                    <p className="mt-1.5 text-[11px] text-[#666C64] leading-snug">
                      Heroes, bentos, pricing & footers.
                    </p>
                  </Link>

                  <Link
                    href="/feature-request"
                    onClick={closeProductMenu}
                    className="group/sub flex flex-col rounded-xl border border-transparent bg-white/60 p-3 transition-all duration-200 hover:border-[#164E33]/15 hover:bg-white hover:shadow-2xs"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-[#141915] group-hover/sub:text-[#164E33]">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#164E33]/10 text-[#164E33]">
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                      </div>
                      <span>Feature Request</span>
                    </div>
                    <p className="mt-1.5 text-[11px] text-[#666C64] leading-snug">
                      Wishlist layouts & vote on sprint v0.3.
                    </p>
                  </Link>
                </div>

                {/* Bottom Footer Strip */}
                <div className="mt-3 flex items-center justify-between rounded-xl bg-[#0C3823] px-3.5 py-2.5 text-xs text-white">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#CCFF00]" />
                    <span className="text-[11px] text-white/90">
                      Zero code lock-in · Atomic rollback safe · 100% native Framer
                    </span>
                  </div>
                  <Link
                    href="/framer/frame-drop"
                    onClick={closeProductMenu}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#CCFF00] hover:underline"
                  >
                    <span>Get Frame Drop</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Link href="/contact" className="group relative z-10 hidden items-center gap-2 rounded-full bg-[#164E33] px-5 py-3 text-xs font-semibold text-white shadow-[0_8px_22px_rgba(22,78,51,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0C3823] md:inline-flex">
          Get in touch
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="relative z-10 grid h-10 w-10 place-items-center rounded-full border border-[#164E33]/15 bg-white/55 text-[#164E33] md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </motion.div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="liquid-glass-nav mx-auto mt-2 max-w-[1500px] overflow-hidden rounded-[24px] p-3 text-[#164E33] md:hidden"
          >
            <nav className="relative z-10 grid gap-1" aria-label="Mobile navigation">
              {navLinks.map((link, index) => {
                if (link.isProduct) {
                  return (
                    <motion.div key={link.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}>
                      <div className="rounded-2xl bg-white/40 p-1.5 border border-[#164E33]/10">
                        <button
                          type="button"
                          onClick={() => setIsMobileProductOpen((prev) => !prev)}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold text-[#164E33] transition-colors hover:bg-white/60"
                        >
                          <div className="flex items-center gap-2">
                            <span>{link.name}</span>
                            <span className="rounded-full bg-[#164E33]/10 px-2 py-0.5 text-[10px] font-bold text-[#164E33]">
                              Frame Drop
                            </span>
                          </div>
                          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isMobileProductOpen && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                          {isMobileProductOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-1 space-y-1 pl-1 pr-1 border-t border-[#141915]/6 pt-1.5">
                                <Link
                                  href="/framer/frame-drop"
                                  onClick={() => setIsOpen(false)}
                                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-[#141915] hover:bg-white/80"
                                >
                                  <div className="flex items-center gap-2">
                                    <Image
                                      src="/images/brand/frame-drop-icon-transparent.png"
                                      alt="Frame Drop Logo"
                                      width={16}
                                      height={16}
                                      className="h-4 w-4 object-contain"
                                    />
                                    <span>Frame Drop Overview</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-[#164E33] bg-[#CCFF00] px-1.5 py-0.5 rounded">v0.2.0</span>
                                </Link>

                                <Link
                                  href="/framer/frame-drop/docs"
                                  onClick={() => setIsOpen(false)}
                                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs text-[#555C54] hover:bg-white/80 hover:text-[#141915]"
                                >
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="h-3.5 w-3.5 text-[#164E33]" />
                                    <span>Documentation</span>
                                  </div>
                                  <ArrowUpRight className="h-3 w-3 text-[#666C64]" />
                                </Link>

                                <Link
                                  href="/framer/frame-drop#catalog"
                                  onClick={() => setIsOpen(false)}
                                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs text-[#555C54] hover:bg-white/80 hover:text-[#141915]"
                                >
                                  <div className="flex items-center gap-2">
                                    <Layers className="h-3.5 w-3.5 text-[#164E33]" />
                                    <span>Component Catalog (25+)</span>
                                  </div>
                                  <ArrowUpRight className="h-3 w-3 text-[#666C64]" />
                                </Link>

                                <Link
                                  href="/feature-request"
                                  onClick={() => setIsOpen(false)}
                                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs text-[#555C54] hover:bg-white/80 hover:text-[#141915]"
                                >
                                  <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="h-3.5 w-3.5 text-[#164E33]" />
                                    <span>Feature Request & Wishlist</span>
                                  </div>
                                  <ArrowUpRight className="h-3 w-3 text-[#666C64]" />
                                </Link>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                }

                const isActive = link.href === '/' ? pathname === '/' : (pathname === link.href || pathname?.startsWith(`${link.href}/`));
                return (
                  <motion.div key={link.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm transition-colors',
                        isActive ? 'bg-[#164E33] text-white font-semibold' : 'text-[#164E33]/75 hover:bg-white/60 hover:text-[#164E33]'
                      )}
                    >
                      {link.name}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="relative z-10 mt-3 flex items-center justify-between rounded-2xl bg-[#164E33] px-4 py-4 text-sm font-semibold text-white">
              Get in touch
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
