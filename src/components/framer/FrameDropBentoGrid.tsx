'use client';

import * as React from 'react';
import { 
  MousePointerClick, 
  LayoutGrid, 
  Palette, 
  ShieldCheck, 
  Sliders, 
  ShieldAlert, 
  Check, 
  Sun, 
  Moon,
  Workflow,
  Cpu
} from 'lucide-react';

export function FrameDropBentoGrid() {
  const [previewTheme, setPreviewTheme] = React.useState<'dark' | 'light'>('dark');
  const [activeBrandColor, setActiveBrandColor] = React.useState<'forest' | 'emerald' | 'amber' | 'violet'>('forest');

  const brandColors = {
    forest: { name: 'Obsidian Forest' },
    emerald: { name: 'Emerald Mint' },
    amber: { name: 'Sunlit Amber' },
    violet: { name: 'Cyber Violet' },
  };

  return (
    <section id="features" className="fd-section">
      <div className="fd-container">
        
        {/* Section Header */}
        <div className="fd-section-header">
          <span className="fd-section-tag">
            <span className="fd-pulse-lime" />
            ENGINEERED ARCHITECTURE
          </span>
          <h2 className="fd-section-title">
            Feature Matrix &amp; Value Pillars
          </h2>
          <p className="fd-section-desc">
            Every section, container query, and design token is engineered to deliver instantaneous speed, absolute canvas safety, and uncompromised accessibility.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="fd-bento-grid">
          
          {/* Card 1: 1-Click Canvas Drop (Span 7) */}
          <div className="fd-bento-card fd-col-7">
            <div>
              <div className="fd-card-header">
                <span className="fd-card-tag">
                  <MousePointerClick className="fd-icon-xs" />
                  Instant Drop
                </span>
                <span className="fd-pillar-num">
                  PILLAR // 01
                </span>
              </div>

              <h3 className="fd-card-title">
                Direct Canvas Insertion
              </h3>
              <p className="fd-card-desc">
                Drop responsive heroes, navigation bars, bento grids, and pricing tables directly onto your Framer canvas. Native components, responsive container queries, and clean React code with zero dependencies.
              </p>
            </div>

            {/* Visual Interactive Insertion Demo */}
            <div className="fd-demo-box">
              <div className="fd-demo-box-header">
                <span className="fd-hero-pillar-item">
                  <Workflow className="fd-icon-xs" />
                  framer.insertComponent()
                </span>
                <span className="fd-demo-box-badge">
                  Async Safe Pipeline
                </span>
              </div>
              <div className="fd-demo-grid">
                {['HeroSection.tsx', 'NavbarCapsule.tsx', 'BentoMatrix.tsx', 'PricingCards.tsx'].map((comp) => (
                  <div key={comp} className="fd-demo-chip">
                    <span className="fd-demo-chip-text">
                      {comp}
                    </span>
                    <Check className="fd-icon-xs" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Visual Page Composer Studio (Span 5) */}
          <div className="fd-bento-card fd-col-5">
            <div>
              <div className="fd-card-header">
                <span className="fd-card-tag-dark">
                  <LayoutGrid className="fd-icon-xs" />
                  Studio Mode
                </span>
                <span className="fd-pillar-num">
                  PILLAR // 02
                </span>
              </div>

              <h3 className="fd-card-title">
                Interactive Multi-Section Composer
              </h3>
              <p className="fd-card-desc">
                Assemble, reorder, preview, and customize your entire website layout inside the plugin before dropping it onto your canvas. Test responsive variations and content copy simultaneously.
              </p>
            </div>

            {/* Studio Slot Stack Demo */}
            <div className="fd-slot-stack">
              <div className="fd-slot-item-pinned">
                <span>Slot 01: Liquid Glass Navbar</span>
                <span className="fd-slot-badge-pinned">Pinned Top</span>
              </div>
              <div className="fd-slot-item-active">
                <span>Slot 02: Split Media Hero</span>
                <span className="fd-slot-badge-subtle">Active Slot</span>
              </div>
              <div className="fd-slot-item-active">
                <span>Slot 03: Bento Feature Grid</span>
                <span className="fd-slot-badge-subtle">Ready</span>
              </div>
            </div>
          </div>

          {/* Card 3: Liquid Glassmorphism & Theme Duality (Span 6) */}
          <div className="fd-bento-card fd-col-6">
            <div>
              <div className="fd-card-header">
                <span className="fd-card-tag">
                  <Palette className="fd-icon-xs" />
                  Design System
                </span>
                
                {/* Theme Toggle Buttons */}
                <div className="fd-theme-toggle-group">
                  <button
                    type="button"
                    onClick={() => setPreviewTheme('dark')}
                    className={`fd-theme-toggle-btn ${previewTheme === 'dark' ? 'active-dark' : ''}`}
                  >
                    <Moon className="fd-icon-xs" />
                    <span>Obsidian</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTheme('light')}
                    className={`fd-theme-toggle-btn ${previewTheme === 'light' ? 'active-light' : ''}`}
                  >
                    <Sun className="fd-icon-xs" />
                    <span>Crystal</span>
                  </button>
                </div>
              </div>

              <h3 className="fd-card-title">
                Obsidian Dark &amp; Crystal Light
              </h3>
              <p className="fd-card-desc">
                Crafted around Qubtic’s signature design tokens. Seamlessly switch between dark and light modes with backdrop blurs, subtle borders, micro-typography, and curated modern fonts (Inter, Plus Jakarta Sans, Outfit, DM Sans, Syne, Cinzel).
              </p>
            </div>

            {/* Interactive Theme Preview Card */}
            <div className="fd-theme-preview-card" data-theme={previewTheme}>
              <div className="fd-theme-preview-header">
                <div className="fd-hero-pillar-item">
                  <span className="fd-pulse-lime" />
                  <span className="fd-pillar-num">
                    {previewTheme === 'dark' ? 'Palettes: Obsidian #0A0D0C' : 'Palettes: Crystal #F4EFE6'}
                  </span>
                </div>
                <span className="fd-slot-badge-pinned">
                  Backdrop-blur 24px
                </span>
              </div>
              <div className="fd-theme-preview-body">
                <div>
                  <h4 className="fd-card-title">Liquid Glass Surface</h4>
                  <p className="fd-card-desc">Calibrated elevation &amp; translucent borders</p>
                </div>
                <span className="fd-theme-preview-badge">
                  Preview Mode
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Built-in Quality Preflight Engine (Span 6) */}
          <div className="fd-bento-card fd-col-6">
            <div>
              <div className="fd-card-header">
                <span className="fd-card-tag-emerald">
                  <ShieldCheck className="fd-icon-xs" />
                  WCAG AA Verified
                </span>
                <span className="fd-pillar-num">
                  PILLAR // 04
                </span>
              </div>

              <h3 className="fd-card-title">
                Automated Accessibility &amp; Contrast Audits
              </h3>
              <p className="fd-card-desc">
                Every component passes automated contrast ratio audits (≥ 4.5:1), heading hierarchy verification, image alt-text scans, and mobile viewport checks before you publish.
              </p>
            </div>

            {/* Preflight Check Metrics Visual */}
            <div className="fd-audit-checklist">
              <div className="fd-audit-check-item">
                <Check className="fd-icon-sm" />
                <div>
                  <span className="fd-audit-check-title">Contrast 4.8:1</span>
                  <span className="fd-audit-check-desc">Exceeds WCAG AA</span>
                </div>
              </div>
              <div className="fd-audit-check-item">
                <Check className="fd-icon-sm" />
                <div>
                  <span className="fd-audit-check-title">Heading Tree</span>
                  <span className="fd-audit-check-desc">H1-H4 Semantics</span>
                </div>
              </div>
              <div className="fd-audit-check-item">
                <Check className="fd-icon-sm" />
                <div>
                  <span className="fd-audit-check-title">Alt-Text Engine</span>
                  <span className="fd-audit-check-desc">100% Media Audit</span>
                </div>
              </div>
              <div className="fd-audit-check-item">
                <Check className="fd-icon-sm" />
                <div>
                  <span className="fd-audit-check-title">Mobile Viewport</span>
                  <span className="fd-audit-check-desc">Zero Horizontal Overflow</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Global Brand Tokens (Span 6) */}
          <div className="fd-bento-card fd-col-6">
            <div>
              <div className="fd-card-header">
                <span className="fd-card-tag">
                  <Sliders className="fd-icon-xs" />
                  Global Tokens
                </span>
                <span className="fd-pillar-num">
                  PILLAR // 05
                </span>
              </div>

              <h3 className="fd-card-title">
                One-Click Brand Adaptation
              </h3>
              <p className="fd-card-desc">
                Input your brand colors, primary typography, border radius, and spacing. Frame Drop automatically propagates your design system across every section in real time.
              </p>
            </div>

            {/* Interactive Color Token Picker */}
            <div className="fd-brand-picker-box">
              <span className="fd-brand-picker-title">
                Active Brand Palette: {brandColors[activeBrandColor].name}
              </span>
              <div className="fd-brand-swatches-row">
                {(['forest', 'emerald', 'amber', 'violet'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveBrandColor(key)}
                    className={`fd-brand-swatch-btn ${activeBrandColor === key ? 'active' : 'inactive'}`}
                  >
                    <span className={`fd-swatch-circle fd-swatch-${key}`} />
                    <span>{key}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 6: Enterprise Safety & Non-Destructive Code (Span 6) */}
          <div className="fd-bento-card fd-col-6">
            <div>
              <div className="fd-card-header">
                <span className="fd-card-tag-dark">
                  <Cpu className="fd-icon-xs" />
                  Engineered by Qubtic
                </span>
                <span className="fd-pillar-num">
                  PILLAR // 06
                </span>
              </div>

              <h3 className="fd-card-title">
                Non-Destructive Canvas Architecture
              </h3>
              <p className="fd-card-desc">
                Never worry about overwriting custom code. Frame Drop inspects project files, isolates component exports into dedicated namespaces, and executes an automated transactional rollback if anything interrupts your insertion.
              </p>
            </div>

            {/* Atomic Checksum Visual */}
            <div className="fd-safety-box">
              <div className="fd-safety-box-header">
                <span className="fd-hero-pillar-item">
                  <ShieldAlert className="fd-icon-xs" />
                  Code File Isolation &amp; Rollback
                </span>
                <span>Active Protection</span>
              </div>
              <p className="fd-safety-box-desc">
                Each insertion verifies project permissions and code namespaces. Generated nodes are tracked and automatically rolled back on error, preserving your existing canvas.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
