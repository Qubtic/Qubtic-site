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
  BookOpen, 
  Layers, 
  SlidersHorizontal,
  Compass,
  GitBranch
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import '@/styles/navbar.css';

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

  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsProductOpen(false);
    setIsOpen(false);
  }

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

  if (
    pathname?.startsWith('/admin') ||
    pathname === '/portfolio/admin' ||
    pathname?.startsWith('/auth') ||
    pathname === '/framer/auth'
  ) {
    return null;
  }

  const isProductActive = pathname?.startsWith('/framer') || pathname === '/feature-request';

  return (
    <header className={cn('qubtic-navbar-header', isScrolled && 'qubtic-navbar-header--scrolled')}>
      <motion.div
        layout
        className={cn(
          'qubtic-navbar liquid-glass-nav',
          isScrolled && 'qubtic-navbar--scrolled liquid-glass-nav--scrolled'
        )}
      >
        <Link href="/" onClick={() => setIsOpen(false)} className="qubtic-navbar__logo-link" aria-label="Qubtic home">
          <Image
            src="/images/brand/qubtic-green.png"
            alt="Qubtic"
            width={1672}
            height={941}
            priority
            className="qubtic-navbar__logo-img"
          />
        </Link>

        {/* Center Desktop Navigation */}
        <nav className="qubtic-nav-menu" aria-label="Main navigation">
          {navLinks.map((link) => {
            if (link.isProduct) {
              return (
                <div
                  key={link.name}
                  className="qubtic-nav-item"
                  onMouseEnter={handleProductEnter}
                  onMouseLeave={handleProductLeave}
                >
                  <button
                    type="button"
                    onClick={() => setIsProductOpen((prev) => !prev)}
                    className={cn(
                      'qubtic-nav-btn',
                      isProductActive && 'qubtic-nav-btn--active',
                      isProductOpen && !isProductActive && 'qubtic-nav-btn--open'
                    )}
                    aria-expanded={isProductOpen}
                    aria-haspopup="true"
                  >
                    <span>{link.name}</span>
                    <ChevronDown className="qubtic-nav-chevron" />
                  </button>
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
                  'qubtic-nav-link',
                  isActive && 'qubtic-nav-link--active'
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
            <div
              className="qubtic-dropdown-wrapper"
              onMouseEnter={handleProductEnter}
              onMouseLeave={handleProductLeave}
            >
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="qubtic-dropdown"
              >
                <div className="qubtic-dropdown__card">
                  {/* Header Bar */}
                  <div className="qubtic-dropdown__header">
                    <span className="qubtic-dropdown__header-title">
                      Featured Products
                    </span>
                    <span className="qubtic-dropdown__header-meta">
                      Framer Ecosystem
                    </span>
                  </div>

                  {/* Product List */}
                  <div className="qubtic-dropdown__list" role="list">
                    {/* Qube Auth */}
                    <Link
                      href="/framer/qube-auth"
                      onClick={closeProductMenu}
                      className="qubtic-dropdown__list-item"
                      role="listitem"
                    >
                      <div className="qubtic-dropdown__product-icon">
                        <Image
                          src="/images/qube-auth/qube-auth-logo.png"
                          alt="Qube Auth Logo"
                          width={24}
                          height={24}
                          className="qubtic-dropdown__product-img"
                        />
                      </div>
                      <div className="qubtic-dropdown__item-content">
                        <div className="qubtic-dropdown__title-row">
                          <h3 className="qubtic-dropdown__title">Qube Auth</h3>
                          <span className="qubtic-dropdown__badge">
                            v1.0 · New
                          </span>
                        </div>
                        <p className="qubtic-dropdown__desc">
                          Full-stack auth, user licensing &amp; Supabase toolkit for Framer.
                        </p>
                      </div>
                      <div className="qubtic-dropdown__action">
                        <ArrowUpRight className="qubtic-dropdown__arrow" />
                      </div>
                    </Link>

                    {/* Frame Drop */}
                    <Link
                      href="/framer/frame-drop"
                      onClick={closeProductMenu}
                      className="qubtic-dropdown__list-item"
                      role="listitem"
                    >
                      <div className="qubtic-dropdown__product-icon">
                        <Image
                          src="/images/brand/frame-drop-icon-transparent.png"
                          alt="Frame Drop Logo"
                          width={24}
                          height={24}
                          className="qubtic-dropdown__product-img"
                        />
                      </div>
                      <div className="qubtic-dropdown__item-content">
                        <div className="qubtic-dropdown__title-row">
                          <h3 className="qubtic-dropdown__title">Frame Drop</h3>
                          <span className="qubtic-dropdown__badge qubtic-dropdown__badge--live">
                            v0.2 · Live
                          </span>
                        </div>
                        <p className="qubtic-dropdown__desc">
                          Native Framer component studio with 34+ responsive section drops.
                        </p>
                      </div>
                      <div className="qubtic-dropdown__action">
                        <ArrowUpRight className="qubtic-dropdown__arrow" />
                      </div>
                    </Link>

                    {/* WhatsApp Commerce */}
                    <Link
                      href="/auth/whatsapp-commerce"
                      onClick={closeProductMenu}
                      className="qubtic-dropdown__list-item qubtic-dropdown__list-item--soon"
                      role="listitem"
                    >
                      <div className="qubtic-dropdown__product-icon qubtic-dropdown__product-icon--whatsapp">
                        <Image
                          src="/images/brand/whatsapp-commerce-logo.png"
                          alt="WhatsApp Commerce Logo"
                          width={24}
                          height={24}
                          className="qubtic-dropdown__product-img"
                        />
                      </div>
                      <div className="qubtic-dropdown__item-content">
                        <div className="qubtic-dropdown__title-row">
                          <h3 className="qubtic-dropdown__title">WhatsApp Commerce</h3>
                          <span className="qubtic-dropdown__badge qubtic-dropdown__badge--soon">
                            Coming Soon
                          </span>
                        </div>
                        <p className="qubtic-dropdown__desc">
                          Framer CMS store builder, Excel sync &amp; instant WhatsApp click-to-chat checkout.
                        </p>
                      </div>
                      <div className="qubtic-dropdown__action">
                        <span className="qubtic-dropdown__action-pill">Early Access</span>
                        <ArrowUpRight className="qubtic-dropdown__arrow" />
                      </div>
                    </Link>

                    {/* E-com Link (WooCommerce) */}
                    <Link
                      href="/feature-request"
                      onClick={closeProductMenu}
                      className="qubtic-dropdown__list-item qubtic-dropdown__list-item--soon"
                      role="listitem"
                    >
                      <div className="qubtic-dropdown__product-icon qubtic-dropdown__product-icon--woo">
                        <Image
                          src="/images/brand/ecom-link-icon.svg"
                          alt="E-com Link (WooCommerce) Logo"
                          width={24}
                          height={24}
                          className="qubtic-dropdown__product-img"
                        />
                      </div>
                      <div className="qubtic-dropdown__item-content">
                        <div className="qubtic-dropdown__title-row">
                          <h3 className="qubtic-dropdown__title">E-com Link</h3>
                          <span className="qubtic-dropdown__badge qubtic-dropdown__badge--soon">
                            Coming Soon
                          </span>
                        </div>
                        <p className="qubtic-dropdown__desc">
                          WooCommerce catalog sync &amp; automated checkout bridge for Framer.
                        </p>
                      </div>
                      <div className="qubtic-dropdown__action">
                        <span className="qubtic-dropdown__action-pill">WooCommerce</span>
                        <ArrowUpRight className="qubtic-dropdown__arrow" />
                      </div>
                    </Link>
                  </div>

                  {/* Quick Product Links Strip */}
                  <div className="qubtic-dropdown__footer">
                    <div className="qubtic-dropdown__footer-links">
                      <Link
                        href="/framer/frame-drop/docs"
                        onClick={closeProductMenu}
                        className="qubtic-dropdown__footer-link"
                      >
                        <BookOpen className="qubtic-dropdown__footer-icon" />
                        <span>Docs</span>
                      </Link>
                      <Link
                        href="/framer/frame-drop/docs#catalog"
                        onClick={closeProductMenu}
                        className="qubtic-dropdown__footer-link"
                      >
                        <Layers className="qubtic-dropdown__footer-icon" />
                        <span>Catalog</span>
                      </Link>
                      <Link
                        href="/framer/frame-drop/roadmap"
                        onClick={closeProductMenu}
                        className="qubtic-dropdown__footer-link"
                      >
                        <Compass className="qubtic-dropdown__footer-icon" />
                        <span>Roadmap</span>
                      </Link>
                      <Link
                        href="/framer/frame-drop/version-control"
                        onClick={closeProductMenu}
                        className="qubtic-dropdown__footer-link"
                      >
                        <GitBranch className="qubtic-dropdown__footer-icon" />
                        <span>Version Control</span>
                      </Link>
                    </div>
                    <Link
                      href="/feature-request"
                      onClick={closeProductMenu}
                      className="qubtic-dropdown__footer-cta"
                    >
                      <span>Requests</span>
                      <ArrowUpRight className="qubtic-dropdown__footer-cta-arrow" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <Link href="/contact" className="qubtic-navbar__cta-btn">
          Get in touch
          <ArrowUpRight className="qubtic-navbar__cta-icon" />
        </Link>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="qubtic-navbar__mobile-toggle"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="qubtic-navbar__mobile-toggle-icon" />
          ) : (
            <Menu className="qubtic-navbar__mobile-toggle-icon" />
          )}
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
            className="qubtic-mobile-drawer liquid-glass-nav"
          >
            <nav className="qubtic-mobile-nav" aria-label="Mobile navigation">
              {navLinks.map((link, index) => {
                if (link.isProduct) {
                  return (
                    <motion.div key={link.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}>
                      <div className="qubtic-mobile-product-box">
                        <button
                          type="button"
                          onClick={() => setIsMobileProductOpen((prev) => !prev)}
                          className="qubtic-mobile-product-btn"
                        >
                          <div className="qubtic-mobile-product-btn-left">
                            <span>{link.name}</span>
                            <span className="qubtic-mobile-product-pill">
                              Frame Drop
                            </span>
                          </div>
                          <ChevronDown className={cn("qubtic-mobile-product-chevron", isMobileProductOpen && "qubtic-mobile-product-chevron--open")} />
                        </button>

                        <AnimatePresence>
                          {isMobileProductOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="qubtic-mobile-accordion-content"
                            >
                              <div className="qubtic-mobile-sublist">
                                <Link
                                  href="/framer/qube-auth"
                                  onClick={() => setIsOpen(false)}
                                  className="qubtic-mobile-sublink qubtic-mobile-sublink--featured"
                                >
                                  <div className="qubtic-mobile-sublink-left">
                                    <Image
                                      src="/images/qube-auth/qube-auth-logo.png"
                                      alt="Qube Auth Logo"
                                      width={16}
                                      height={16}
                                      className="qubtic-mobile-sublink-img"
                                    />
                                    <span>Qube Auth (Framer Suite)</span>
                                  </div>
                                  <span className="qubtic-mobile-sublink-badge qubtic-mobile-sublink-badge--new">NEW</span>
                                </Link>

                                <Link
                                  href="/framer/qube-auth/docs"
                                  onClick={() => setIsOpen(false)}
                                  className="qubtic-mobile-sublink"
                                >
                                  <div className="qubtic-mobile-sublink-left">
                                    <BookOpen className="qubtic-mobile-sublink-icon" />
                                    <span>Qube Auth Docs</span>
                                  </div>
                                  <ArrowUpRight className="qubtic-mobile-sublink-arrow" />
                                </Link>

                                <Link
                                  href="/framer/frame-drop"
                                  onClick={() => setIsOpen(false)}
                                  className="qubtic-mobile-sublink"
                                >
                                  <div className="qubtic-mobile-sublink-left">
                                    <Image
                                      src="/images/brand/frame-drop-icon-transparent.png"
                                      alt="Frame Drop Logo"
                                      width={16}
                                      height={16}
                                      className="qubtic-mobile-sublink-img"
                                    />
                                    <span>Frame Drop Overview</span>
                                  </div>
                                  <span className="qubtic-mobile-sublink-badge qubtic-mobile-sublink-badge--live">v0.2.1</span>
                                </Link>

                                <Link
                                  href="/framer/frame-drop/docs"
                                  onClick={() => setIsOpen(false)}
                                  className="qubtic-mobile-sublink"
                                >
                                  <div className="qubtic-mobile-sublink-left">
                                    <BookOpen className="qubtic-mobile-sublink-icon" />
                                    <span>Documentation</span>
                                  </div>
                                  <ArrowUpRight className="qubtic-mobile-sublink-arrow" />
                                </Link>

                                <Link
                                  href="/framer/frame-drop/docs#catalog"
                                  onClick={() => setIsOpen(false)}
                                  className="qubtic-mobile-sublink"
                                >
                                  <div className="qubtic-mobile-sublink-left">
                                    <Layers className="qubtic-mobile-sublink-icon" />
                                    <span>Component Catalog (34+)</span>
                                  </div>
                                  <ArrowUpRight className="qubtic-mobile-sublink-arrow" />
                                </Link>

                                <Link
                                  href="/framer/frame-drop/roadmap"
                                  onClick={() => setIsOpen(false)}
                                  className="qubtic-mobile-sublink"
                                >
                                  <div className="qubtic-mobile-sublink-left">
                                    <Compass className="qubtic-mobile-sublink-icon" />
                                    <span>Product Roadmap</span>
                                  </div>
                                  <ArrowUpRight className="qubtic-mobile-sublink-arrow" />
                                </Link>

                                <Link
                                  href="/framer/frame-drop/version-control"
                                  onClick={() => setIsOpen(false)}
                                  className="qubtic-mobile-sublink"
                                >
                                  <div className="qubtic-mobile-sublink-left">
                                    <GitBranch className="qubtic-mobile-sublink-icon" />
                                    <span>Version Control &amp; Rollback</span>
                                  </div>
                                  <ArrowUpRight className="qubtic-mobile-sublink-arrow" />
                                </Link>

                                <Link
                                  href="/auth/whatsapp-commerce"
                                  onClick={() => setIsOpen(false)}
                                  className="qubtic-mobile-sublink qubtic-mobile-sublink--soon"
                                >
                                  <div className="qubtic-mobile-sublink-left">
                                    <Image
                                      src="/images/brand/whatsapp-commerce-logo.png"
                                      alt="WhatsApp Commerce Logo"
                                      width={16}
                                      height={16}
                                      className="qubtic-mobile-sublink-img"
                                    />
                                    <span>WhatsApp Commerce</span>
                                  </div>
                                  <span className="qubtic-mobile-sublink-badge qubtic-mobile-sublink-badge--soon">SOON</span>
                                </Link>

                                <Link
                                  href="/feature-request"
                                  onClick={() => setIsOpen(false)}
                                  className="qubtic-mobile-sublink qubtic-mobile-sublink--soon"
                                >
                                  <div className="qubtic-mobile-sublink-left">
                                    <Image
                                      src="/images/brand/ecom-link-icon.svg"
                                      alt="E-com Link (WooCommerce) Logo"
                                      width={16}
                                      height={16}
                                      className="qubtic-mobile-sublink-img"
                                    />
                                    <span>E-com Link (WooCommerce)</span>
                                  </div>
                                  <span className="qubtic-mobile-sublink-badge qubtic-mobile-sublink-badge--soon">SOON</span>
                                </Link>

                                <Link
                                  href="/feature-request"
                                  onClick={() => setIsOpen(false)}
                                  className="qubtic-mobile-sublink"
                                >
                                  <div className="qubtic-mobile-sublink-left">
                                    <SlidersHorizontal className="qubtic-mobile-sublink-icon" />
                                    <span>Feature Request &amp; Wishlist</span>
                                  </div>
                                  <ArrowUpRight className="qubtic-mobile-sublink-arrow" />
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
                        'qubtic-mobile-link',
                        isActive && 'qubtic-mobile-link--active'
                      )}
                    >
                      {link.name}
                      <ArrowUpRight className="qubtic-mobile-link-icon" />
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="qubtic-mobile-cta">
              Get in touch
              <ArrowUpRight className="qubtic-mobile-link-icon" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
