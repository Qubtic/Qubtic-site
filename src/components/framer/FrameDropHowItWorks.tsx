'use client';

import * as React from 'react';
import { 
  Compass, 
  SlidersHorizontal, 
  ArrowDownToLine, 
  CheckCircle2, 
  Check
} from 'lucide-react';

export function FrameDropHowItWorks() {
  const [activeStep, setActiveStep] = React.useState<number>(1);
  const [isDropping, setIsDropping] = React.useState(false);
  const [dropSuccess, setDropSuccess] = React.useState(false);

  const handleSimulateDrop = () => {
    setIsDropping(true);
    setDropSuccess(false);
    setTimeout(() => {
      setIsDropping(false);
      setDropSuccess(true);
      setTimeout(() => setDropSuccess(false), 3500);
    }, 1200);
  };

  const steps = [
    {
      num: '01',
      title: 'Browse & Compose',
      tag: 'Pick Your Stack',
      description:
        'Explore 34+ production sections across 10 categories, choose from 7 full-page recipes (Studio, SaaS, Portfolio, Service, Agency Flagship), or assemble a custom multi-slot flow in the Studio Composer.',
      icon: Compass,
      highlights: ['34+ Production Sections', '7 Full-Page Recipes', 'Up to 30 Studio Slots'],
    },
    {
      num: '02',
      title: 'Tune Your Brand & Preflight',
      tag: 'Customize & Audit',
      description:
        'Adjust typography, brand colors, radius, and spacing. Run the automated preflight audit to guarantee contrast compliance, heading semantics, and mobile responsiveness.',
      icon: SlidersHorizontal,
      highlights: ['Dynamic Token Sync', '13 Curated Typography Styles', 'Real-time WCAG AA Audit'],
    },
    {
      num: '03',
      title: '1-Click Drop to Framer Canvas',
      tag: 'Drop to Canvas',
      description:
        'Click "Add to Canvas" and watch your production-ready section insert with full Framer property controls, ready to publish immediately.',
      icon: ArrowDownToLine,
      highlights: ['Native Framer Code Insertion', 'Auto-Breakpoints (375px to 1440px)', 'Non-Destructive Rollback Safe'],
    },
  ];

  return (
    <section id="how-it-works" className="fd-how-section">
      {/* Ambient Lighting & Sheen */}
      <div className="fd-how-glow-left" />
      <div className="fd-how-glow-right" />

      <div className="fd-container">
        
        {/* Section Header */}
        <div className="fd-how-header">
          <span className="fd-how-tag">
            <span className="fd-pulse-lime" />
            3-STEP WORKFLOW
          </span>
          <h2 className="fd-how-title">
            How Frame Drop Works
          </h2>
          <p className="fd-how-desc">
            From design exploration to production canvas deployment in less than 30 seconds.
          </p>

          {/* Pipeline Architectural Diagram */}
          <div className="fd-pipeline-diagram">
            <div className="fd-pipeline-pill">
              <span>[01 / Pick Your Stack]</span>
              <span>────────►</span>
              <span>[02 / Customize &amp; Audit]</span>
              <span>────────►</span>
              <span>[03 / Drop to Canvas]</span>
            </div>
          </div>
        </div>

        {/* 3 Step Interactive Cards */}
        <div className="fd-steps-grid">
          {steps.map((step, idx) => {
            const isCurrent = activeStep === idx + 1;

            return (
              <div
                key={step.num}
                onClick={() => setActiveStep(idx + 1)}
                className={`fd-step-card-interactive ${isCurrent ? 'active' : 'inactive'}`}
              >
                <div>
                  <div className="fd-card-header">
                    <span className="fd-step-num-badge">
                      {step.num}
                    </span>
                    <span className="fd-step-tag-badge">
                      {step.tag}
                    </span>
                  </div>

                  <h3 className="fd-step-title">
                    {step.title}
                  </h3>
                  
                  <p className="fd-step-desc">
                    {step.description}
                  </p>
                </div>

                <div>
                  <ul className="fd-step-highlights">
                    {step.highlights.map((h, i) => (
                      <li key={i} className="fd-step-highlight-item">
                        <CheckCircle2 className="fd-icon-sm fd-step-highlight-icon" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Interactive Button for Step 3 */}
                  {step.num === '03' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSimulateDrop();
                      }}
                      disabled={isDropping}
                      className={`fd-simulate-btn ${dropSuccess ? 'success' : ''}`}
                    >
                      {isDropping ? (
                        <>
                          <span className="fd-icon-xs fd-spin" />
                          <span>Inserting into Framer...</span>
                        </>
                      ) : dropSuccess ? (
                        <>
                          <Check className="fd-icon-sm" />
                          <span>Section Dropped Successfully!</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownToLine className="fd-icon-sm" />
                          <span>Simulate 1-Click Drop</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
