'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  Sparkles,
  Layers,
  Zap,
  ChevronRight,
  CheckCircle2
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

        {/* HERO CENTERPIECE SHOWCASE: Full-Detail Native 3D Studio Showcase */}
        <div className="fd-hero-banner-wrapper">
          <div className="fd-showcase-card">
            {/* Ambient Lighting & Sheen */}
            <div className="fd-showcase-ambient-glow" />
            <div className="fd-showcase-ambient-grid" />

            <div className="fd-showcase-content">
              {/* Left Column: Product Branding & Vector Typography */}
              <div className="fd-showcase-left">
                {/* Agency Lockup */}
                <div className="fd-showcase-agency">
                  <Image
                    src="/images/brand/qubtic-white.png"
                    alt="Qubtic"
                    width={92}
                    height={22}
                    className="fd-showcase-agency-img"
                  />
                  <span className="fd-showcase-agency-tm">™</span>
                  <span className="fd-showcase-agency-divider">/</span>
                  <span className="fd-showcase-agency-tag">
                    Build Smarter. Faster.
                  </span>
                </div>

                {/* Frame Drop Brand Emblem */}
                <div className="fd-showcase-brand">
                  <div className="fd-showcase-icon-box">
                    <Image
                      src="/images/brand/frame-drop-icon-transparent.png"
                      alt="Frame Drop Icon"
                      width={52}
                      height={52}
                      className="fd-showcase-icon-img"
                    />
                  </div>
                  <div className="fd-showcase-brand-text">
                    <span className="fd-showcase-brand-name">Frame Drop</span>
                    <span className="fd-showcase-brand-badge">Native Framer Suite</span>
                  </div>
                </div>

                {/* Headline & Subtitle */}
                <h2 className="fd-showcase-headline">
                  Drag. Drop. Build.
                </h2>
                <p className="fd-showcase-subtitle">
                  Turn your designs into structured sections — instantly, with Frame Drop.
                </p>

                {/* Core Feature Pillars */}
                <div className="fd-showcase-pillars">
                  <div className="fd-showcase-pillar">
                    <div className="fd-showcase-pillar-icon">
                      <Zap size={14} />
                    </div>
                    <span>Fast Workflow</span>
                  </div>
                  <div className="fd-showcase-pillar">
                    <div className="fd-showcase-pillar-icon">
                      <Layers size={14} />
                    </div>
                    <span>Clean Structure</span>
                  </div>
                  <div className="fd-showcase-pillar">
                    <div className="fd-showcase-pillar-icon">
                      <Sparkles size={14} />
                    </div>
                    <span>Built for Framer</span>
                  </div>
                </div>

                {/* Interactive Action Row */}
                <div className="fd-showcase-action-row">
                  <button
                    type="button"
                    onClick={onInstallClick}
                    className="fd-showcase-btn-primary"
                  >
                    <span>Install on Framer</span>
                    <ArrowUpRight size={14} />
                  </button>
                  <Link
                    href="/framer/frame-drop/docs"
                    className="fd-showcase-btn-secondary"
                  >
                    Documentation &rarr;
                  </Link>
                </div>
              </div>

              {/* Right Column: 3D High-Detail Interactive Canvas Studio */}
              <div className="fd-showcase-right">
                {/* 3D Ambient Glowing Rings (Mimicking original 3D render depth) */}
                <div className="fd-canvas-ambient-ring fd-canvas-ambient-ring--1" />
                <div className="fd-canvas-ambient-ring fd-canvas-ambient-ring--2" />

                {/* Floating 3D Framer Logo Tile 1 */}
                <div className="fd-floating-framer-chip fd-floating-framer-chip--top">
                  <svg width="18" height="26" viewBox="0 0 18 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0H18V8.66667H9V17.3333L0 8.66667V0Z" fill="white"/>
                    <path d="M0 8.66667H9L18 17.3333H0V8.66667Z" fill="#38BDF8"/>
                    <path d="M0 17.3333H9V26L0 17.3333Z" fill="white"/>
                  </svg>
                  <span>Framer Canvas</span>
                </div>

                {/* Floating 3D Framer Logo Tile 2 (Right-floating orb from original image) */}
                <div className="fd-floating-framer-tile">
                  <svg width="22" height="32" viewBox="0 0 18 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0H18V8.66667H9V17.3333L0 8.66667V0Z" fill="white"/>
                    <path d="M0 8.66667H9L18 17.3333H0V8.66667Z" fill="#00D2FF"/>
                    <path d="M0 17.3333H9V26L0 17.3333Z" fill="white"/>
                  </svg>
                </div>

                <div className="fd-canvas-studio-stage">
                  {/* Main 3D Frosted Glass Canvas Window */}
                  <div className="fd-canvas-window">
                    {/* Window Titlebar */}
                    <div className="fd-canvas-window-header">
                      <div className="fd-canvas-window-dots">
                        <span className="fd-w-dot fd-w-dot--red" />
                        <span className="fd-w-dot fd-w-dot--yellow" />
                        <span className="fd-w-dot fd-w-dot--green" />
                      </div>
                      <span className="fd-canvas-window-title">
                        FrameDrop · Live Canvas Studio
                      </span>
                      <span className="fd-canvas-window-badge">
                        <span className="fd-pulse-dot-cyan" />
                        Live
                      </span>
                    </div>

                    {/* Canvas Stage Area */}
                    <div className="fd-canvas-body">
                      {/* Section 1: Pre-inserted Hero Section */}
                      <div className="fd-canvas-section fd-canvas-section--top">
                        <div className="fd-cs-bar">
                          <span className="fd-cs-tag">SECTION-01 · HERO</span>
                          <span className="fd-cs-meta">100% WCAG AA</span>
                        </div>
                        <div className="fd-cs-preview-row">
                          <div className="fd-cs-img-placeholder">
                            <Layers size={13} />
                          </div>
                          <div className="fd-cs-text-skeleton">
                            <div className="fd-cs-line fd-cs-line--title" />
                            <div className="fd-cs-line fd-cs-line--sub" />
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Active Component Drop (Glowing Electric Blue with 3D Cursor) */}
                      <div className="fd-canvas-section fd-canvas-section--active">
                        <div className="fd-active-drop-glow" />
                        <div className="fd-cs-bar">
                          <span className="fd-cs-tag-active">
                            <span className="fd-pulse-cyan-sm" />
                            DROPPING SECTION · BENTO GRID
                          </span>
                          <span className="fd-cs-meta-active">Responsive</span>
                        </div>
                        <div className="fd-cs-preview-row">
                          <div className="fd-cs-img-placeholder-active">
                            <Sparkles size={16} />
                          </div>
                          <div className="fd-cs-text-skeleton">
                            <div className="fd-cs-line fd-cs-line--title-active" />
                            <div className="fd-cs-line fd-cs-line--sub-active" />
                          </div>
                        </div>

                        {/* 3D Drop Cursor */}
                        <div className="fd-3d-cursor">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="fd-cursor-svg">
                            <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill="#00D2FF" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round"/>
                          </svg>
                          <span className="fd-cursor-tooltip">1-Click Drop</span>
                        </div>
                      </div>

                      {/* Section 3: Next Slot Target */}
                      <div className="fd-canvas-section fd-canvas-section--target">
                        <span className="fd-target-text">+ Drop Next Section (25+ Available)</span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Micro-badge 1 */}
                  <div className="fd-floating-badge fd-floating-badge--bottom-left">
                    <CheckCircle2 size={12} className="text-[#22C55E]" />
                    <span>Auto Token Sync</span>
                  </div>

                  {/* Floating Micro-badge 2 */}
                  <div className="fd-floating-badge fd-floating-badge--top-right">
                    <Zap size={12} className="text-[#38BDF8]" />
                    <span>Zero Code Lock-in</span>
                  </div>
                </div>
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
