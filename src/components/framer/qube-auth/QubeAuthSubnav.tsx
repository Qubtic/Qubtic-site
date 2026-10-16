'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BookOpen } from 'lucide-react';

interface QubeAuthSubnavProps {
  onInstallClick?: () => void;
}

const NAV_ITEMS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Live Sandbox', href: '#sandbox' },
  { label: 'Features', href: '#features' },
  { label: 'Monetization', href: '#monetization' },
  { label: 'How It Works', href: '#workflow' },
  { label: 'Components (30+)', href: '#components' },
  { label: 'Security & RLS', href: '#security' },
  { label: 'Use Cases', href: '#use-cases' },
  { label: 'FAQ', href: '#faq' },
];

export function QubeAuthSubnav({ onInstallClick }: QubeAuthSubnavProps) {
  const [activeSection, setActiveSection] = React.useState('overview');

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = NAV_ITEMS.map((item) => item.href.substring(1));
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="qube-subnav-sticky">
      <div className="qube-subnav-container">
        <div className="qube-subnav-pill">
          
          {/* Logo & Product Brand */}
          <Link
            href="#overview"
            className="qube-subnav-brand"
          >
            <div className="qube-subnav-logo-box">
              <Image
                src="/images/qube-auth/qube-auth-logo.png"
                alt="Qube Auth"
                width={20}
                height={20}
              />
            </div>
            <span className="qube-subnav-title">
              Qube Auth
            </span>
            <span className="qube-subnav-version">
              v1.0.0
            </span>
          </Link>

          {/* Nav Items (scrollable horizontally on smaller screens) */}
          <div className="qube-subnav-links">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.href.substring(1);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`qube-subnav-link ${isActive ? 'active' : ''}`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          {/* Quick CTA Actions */}
          <div className="qube-subnav-actions">
            <Link
              href="/framer/qube-auth/docs"
              className="qube-subnav-docs-btn"
            >
              <BookOpen size={14} />
              <span>Docs</span>
            </Link>

            <button
              type="button"
              onClick={onInstallClick}
              className="qube-subnav-install-btn"
            >
              <span>Install</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
