'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  Sparkles,
  Layers,
  Zap,
  ChevronRight
} from 'lucide-react';

interface FrameDropHeroProps {
  onInstallClick?: () => void;
  onExploreCatalog?: () => void;
}

export function FrameDropHero({ onInstallClick, onExploreCatalog }: FrameDropHeroProps) {
  return (
    <section className="fd-hero-section">
      {/* Radiant Electric Blue Ambient Glows */}
      <div className="fd-hero-glow-left" />
      <div className="fd-hero-glow-right" />
      <div className="fd-hero-glow-center" />

      <div className="fd-container">

        {/* Top Breadcrumb & Status Bar */}
        <div className="fd-hero-top-bar">
          <div className="fd-hero-breadcrumbs">
            <Link href="/">
              Home
            </Link>
            <span>/</span>
            <Link href="/services/framer-development">
              Framer
            </Link>
            <span>/</span>
            <span className="fd-hero-badge-brand">
              <Image
                src="/images/brand/frame-drop-icon-transparent.png"
                alt="Frame Drop"
                width={14}
                height={14}
                className="fd-icon-xs"
              />
              <span>Frame Drop</span>
            </span>
          </div>

          <div className="fd-hero-status-pills">
            <span className="fd-status-pill-blue">
              <span className="fd-pulse-cyan" />
              <span>v0.2.0 Available on Framer Marketplace</span>
            </span>
            <span className="fd-status-pill-subtle">
              Verified Plugin
            </span>
          </div>
        </div>

        {/* Center-Aligned Hero Header Copy */}
        <div className="fd-hero-content">

          {/* Eyebrow Chip */}
          <div className="fd-eyebrow-chip">
            <div className="fd-eyebrow-icon-box">
              <Image
                src="/images/brand/frame-drop-icon-transparent.png"
                alt="Frame Drop Logo"
                width={16}
                height={16}
                className="fd-icon-xs"
              />
            </div>
            <span className="fd-eyebrow-text">
              Qubtic ™ · Built for Framer
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="fd-hero-title">
            Drag. Drop. <span className="fd-title-accent">Build.</span>
          </h1>

          {/* Subheading */}
          <p className="fd-hero-subtitle">
            Turn your designs into structured sections - instantly, with Frame Drop.
          </p>

          {/* Supporting Explanatory Paragraph */}
          <p className="fd-hero-desc">
            The native Framer component suite and page studio engineered for founders, design agencies, and creators. Build pixel-perfect, WCAG-audited landing pages in seconds-without touching a line of code.
          </p>

          {/* The 3 Core Value Pillars */}
          <div className="fd-hero-pillars-bar">
            <div className="fd-hero-pillar-item">
              <Zap className="fd-icon-sm" />
              <span>Fast Workflow</span>
            </div>
            <span className="fd-pillar-divider">|</span>
            <div className="fd-hero-pillar-item">
              <Layers className="fd-icon-sm" />
              <span>Clean Structure</span>
            </div>
            <span className="fd-pillar-divider">|</span>
            <div className="fd-hero-pillar-item">
              <Sparkles className="fd-icon-sm" />
              <span>Built for Framer</span>
            </div>
          </div>

          {/* High-Converting CTA Buttons */}
          <div className="fd-hero-cta-group">
            <button
              type="button"
              onClick={onInstallClick}
              className="fd-btn-primary"
            >
              <span>Install on Framer</span>
              <span className="fd-tag-cyan">
                Free to Start
              </span>
              <ArrowUpRight className="fd-icon-sm" />
            </button>

            <a
              href="#catalog"
              onClick={onExploreCatalog}
              className="fd-btn-secondary"
            >
              <span>Explore 25+ Components</span>
              <ChevronRight className="fd-icon-sm" />
            </a>

            <Link
              href="/framer/frame-drop/docs"
              className="fd-btn-link"
            >
              <span>Documentation</span>
              <ArrowUpRight className="fd-icon-xs" />
            </Link>
          </div>

        </div>

        {/* HERO CENTERPIECE SHOWCASE: The Official Banner in Full Uncropped Glory */}
        <div className="fd-hero-banner-wrapper">
          <div className="fd-hero-banner-frame">

            {/* Studio Window Chrome Bar */}
            <div className="fd-hero-banner-chrome">
              <div className="fd-chrome-dots">
                <div className="fd-dot-red" />
                <div className="fd-dot-yellow" />
                <div className="fd-dot-green" />
              </div>

              <div className="fd-chrome-title">
                <Image
                  src="/images/brand/frame-drop-icon-transparent.png"
                  alt="Frame Drop Logo"
                  width={16}
                  height={16}
                  className="fd-icon-xs"
                />
                <span>Frame Drop Studio · Framer Canvas Plugin</span>
              </div>

              <div className="fd-chrome-status">
                <span className="fd-pulse-cyan" />
                <span>Live Canvas</span>
              </div>
            </div>

            {/* Pristine Full Uncropped Banner Visual */}
            <div className="fd-hero-banner-img-box">
              <Image
                src="/images/framedrop-banner.png"
                alt="Frame Drop - Drag. Drop. Build. Framer Plugin by Qubtic"
                fill
                priority
                className="fd-hero-banner-img"
                sizes="(max-width: 1400px) 100vw, 1360px"
              />
            </div>

            {/* Interactive Quick Bar Under the Banner */}
            <div className="fd-banner-quick-bar">
              <div className="fd-hero-pillar-item">
                <span className="fd-pulse-cyan" />
                <span>
                  Official Framer Component Suite by Qubtic Technologies
                </span>
              </div>

              <div className="fd-hero-pillar-item">
                <button
                  type="button"
                  onClick={onInstallClick}
                  className="fd-banner-quick-link"
                >
                  <span>1-Click Launch</span>
                  <ArrowUpRight className="fd-icon-xs" />
                </button>
                <Link
                  href="/framer/frame-drop/docs"
                  className="fd-banner-quick-doc"
                >
                  Architecture Docs &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Trust Metrics Bar */}
        <div className="fd-trust-metrics-bar">
          <div className="fd-metric-col">
            <span className="fd-metric-num">
              25+
            </span>
            <span className="fd-metric-label">
              Production Sections
            </span>
          </div>
          <div className="fd-metric-col">
            <span className="fd-metric-num-blue">
              1-Click
            </span>
            <span className="fd-metric-label">
              Safe Canvas Insertion
            </span>
          </div>
          <div className="fd-metric-col">
            <span className="fd-metric-num">
              100%
            </span>
            <span className="fd-metric-label">
              WCAG AA Compliant
            </span>
          </div>
          <div className="fd-metric-col">
            <span className="fd-metric-num-blue">
              Zero
            </span>
            <span className="fd-metric-label">
              Code Lock-in
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
