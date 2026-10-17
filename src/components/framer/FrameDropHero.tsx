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
  Volume2,
  VolumeX,
} from 'lucide-react';

interface FrameDropHeroProps {
  onInstallClick?: () => void;
  onExploreCatalog?: () => void;
}

export function FrameDropHero({ onInstallClick, onExploreCatalog }: FrameDropHeroProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = React.useState(true);

  const toggleSound = React.useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      const next = !videoRef.current.muted;
      videoRef.current.muted = next;
      setIsMuted(next);
      if (!next) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Attempt unmuted autoplay first (succeeds if user already clicked/interacted with site)
    video.muted = false;
    video.play()
      .then(() => {
        setIsMuted(false);
      })
      .catch(() => {
        // Browser blocked audio autoplay, start muted
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {});
      });

    // Automatically unmute on the first user interaction anywhere on the document
    const handleFirstInteraction = () => {
      if (video.muted) {
        video.muted = false;
        setIsMuted(false);
        video.play().catch(() => {});
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

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
              <span>v0.2.1 Available on Framer Marketplace</span>
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
              <span>Open on Framer</span>
              <ArrowUpRight className="fd-icon-sm" />
            </button>

            <a
              href="#catalog"
              onClick={onExploreCatalog}
              className="fd-btn-secondary"
            >
              <span>Explore 34+ Components</span>
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

          

            {/* Pristine Full Video Visual with Sound Controls */}
            <div
              className="fd-hero-banner-img-box"
              onClick={toggleSound}
              title={isMuted ? 'Click anywhere on video to unmute sound' : 'Click to mute sound'}
            >
              <video
                ref={videoRef}
                src="/images/framer-drop-video.mp4"
                poster="/images/framedrop-banner.png"
                autoPlay
                muted={isMuted}
                loop
                playsInline
                preload="auto"
                className="fd-hero-banner-video"
              >
                Your browser does not support the video tag.
              </video>

              {/* Sound / Unmute Overlay Pill */}
              <button
                type="button"
                onClick={toggleSound}
                className="fd-video-sound-toggle"
                aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="fd-sound-icon" />
                    <span>Unmute Sound</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="fd-sound-icon" />
                    <span>Sound On</span>
                  </>
                )}
              </button>
            </div>

          

          </div>
        </div>

        {/* Trust Metrics Bar */}
        <div className="fd-trust-metrics-bar">
          <div className="fd-metric-col">
            <span className="fd-metric-num">
              34+
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
