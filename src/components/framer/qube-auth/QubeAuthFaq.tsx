'use client';

import * as React from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export function QubeAuthFaq() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const faqs = [
    {
      question: 'Do I need a paid Qube Auth subscription to use this?',
      answer:
        'No. Qube Auth installs an open, production-ready component library directly into your project code assets. You only pay for your own third-party infrastructure (e.g. Supabase, Stripe, or Polar transaction fees), maintaining complete data ownership and independence.',
    },
    {
      question: "Where are my users' passwords and emails stored?",
      answer:
        'In your own Supabase project’s PostgreSQL database. Qube Auth communicates directly from client-side PKCE requests to your Supabase Auth endpoints. We never proxy, store, or intercept your customer credentials.',
    },
    {
      question: 'Can visitors inspect the page source code and bypass the paywall?',
      answer:
        "In static frontend sites like Framer, HTML and client-side code are delivered to the browser. Qube Auth's PaywallGuard protects user presentation seamlessly. For true data security, your private API routes, backend data, files, and Supabase tables must be guarded with Row Level Security (RLS) policies. Qube Auth provides production-ready RLS scripts in the plugin documentation.",
    },
    {
      question: "What happens if a user's subscription expires or payment fails?",
      answer:
        'When a subscription status in your Supabase subscriptions table changes to past_due, canceled, or reaches its expiry timestamp, PaywallGuard automatically fails closed and presents the subscription upgrade card with a live "Check access again" trigger.',
    },
    {
      question: 'Can I use both Stripe and Polar on the same site?',
      answer:
        'Yes! You can configure Stripe for your core subscriptions and Polar for developer digital downloads or lifetime perks, or toggle between them at any time in the Payments tab.',
    },
    {
      question: 'How do Passkeys work in Framer?',
      answer:
        "Qube Auth leverages Supabase's WebAuthn passkey implementation. Confirmed members can register their device's biometric sensor (Face ID / Touch ID / Windows Hello) with a single tap, enabling lightning-fast passwordless logins on subsequent visits.",
    },
    {
      question: 'Does it support custom domains?',
      answer:
        'Yes. Qube Auth supports custom Supabase authentication domains (e.g. auth.yourcompany.com) as well as your custom Framer production domain.',
    },
  ];

  return (
    <section id="faq" className="qube-section">
      <div className="qube-container">
        
        {/* Header */}
        <div className="qube-section-header center">
          <span className="qube-section-tag">
            <HelpCircle className="w-3.5 h-3.5" />
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="qube-section-title">
            Everything You Need <br />
            <span className="qube-text-gradient">To Know</span>
          </h2>
          <p className="qube-section-desc">
            Got questions about database security, payment webhooks, or Framer compatibility? We have you covered.
          </p>
        </div>

        {/* Accordion list */}
        <div className="qube-faq-accordion">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className={`qube-faq-item ${isOpen ? 'open' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="qube-faq-trigger"
                >
                  <span>{faq.question}</span>
                  <ChevronDown size={20} />
                </button>

                {isOpen && (
                  <div className="qube-faq-answer">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
