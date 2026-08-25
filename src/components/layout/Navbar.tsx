'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Home', href: '/' },
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

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/admin') || pathname === '/portfolio/admin') {
    return null;
  }

  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 px-3 transition-all duration-500 sm:px-5', isScrolled ? 'pt-2' : 'pt-4')}>
      <motion.div
        layout
        className={cn(
          'liquid-glass-nav mx-auto flex h-[68px] items-center justify-between overflow-hidden rounded-[22px] px-4 text-[#164E33] transition-all duration-500 sm:px-5',
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

        <nav className="absolute left-1/2 z-10 hidden -translate-x-1/2 items-center gap-1 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : (pathname === link.href || pathname?.startsWith(`${link.href}/`));
            return (
              <Link
                key={link.name}
                href={link.href}
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
              {navLinks.map((link, index) => (
                <motion.div key={link.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}>
                  <Link href={link.href} onClick={() => setIsOpen(false)} className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm text-[#164E33]/75 transition-colors hover:bg-white/60 hover:text-[#164E33]">
                    {link.name}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              ))}
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
