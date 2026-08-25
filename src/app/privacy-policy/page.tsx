import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Database, 
  FileText, 
  Server, 
  UserCheck, 
  Globe, 
  Trash2, 
  Clock, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  HelpCircle,
  KeyRound,
  FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Privacy Policy | Qubtic Digital Product Studio',
  description:
    'Comprehensive Privacy Policy outlining Qubtic data protection practices, GDPR & CCPA compliance, source code confidentiality, and user rights.',
  alternates: {
    canonical: 'https://qubtic.tech/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy | Qubtic Digital Product Studio',
    description:
      'Explore how Qubtic safeguards personal information, proprietary client data, and repository confidentiality with global privacy standards.',
    url: 'https://qubtic.tech/privacy-policy',
    siteName: 'Qubtic',
    locale: 'en_US',
    type: 'website',
  },
};

const sections = [
  { id: 'introduction', title: '1. Introduction & Global Privacy Commitment', icon: ShieldCheck },
  { id: 'regulations-scope', title: '2. Scope & Applicable Data Laws (GDPR & CCPA)', icon: Globe },
  { id: 'data-collection', title: '3. Categories of Information We Collect', icon: Database },
  { id: 'lawful-basis', title: '4. Lawful Basis for Data Processing', icon: FileCheck },
  { id: 'usage-purposes', title: '5. Purpose of Processing & Service Delivery', icon: Eye },
  { id: 'cookies-analytics', title: '6. Cookies, Telemetry & Tracking Policies', icon: Server },
  { id: 'client-confidentiality', title: '7. Client Confidentiality & Code Isolation', icon: KeyRound },
  { id: 'third-party-processors', title: '8. Subprocessors & Cloud Infrastructure', icon: Lock },
  { id: 'data-transfers-security', title: '9. Data Security & Encryption Standards', icon: ShieldCheck },
  { id: 'retention-purging', title: '10. Data Retention & Automatic Purging', icon: Trash2 },
  { id: 'user-rights', title: '11. Your Privacy Rights & Data Portability', icon: UserCheck },
  { id: 'children-privacy', title: '12. Protection of Minors', icon: FileText },
  { id: 'contact-dpo', title: '13. Policy Updates & Privacy Officer Contact', icon: HelpCircle },
];

export default function PrivacyPolicyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy - Qubtic',
    description: 'Privacy policy and data governance practices of Qubtic Digital Product Studio.',
    url: 'https://qubtic.tech/privacy-policy',
    publisher: {
      '@type': 'Organization',
      name: 'Qubtic Digital Product Studio',
      url: 'https://qubtic.tech',
      logo: 'https://qubtic.tech/images/brand/qubtic-green.png',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hello@qubtic.tech',
        contactType: 'privacy inquiries',
      },
    },
  };

  return (
    <div className="pb-24 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header Section with 3D Animated Shield */}
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24 bg-[#FAF8F5]">
        {/* Background Glows */}
        <div className="pointer-events-none absolute -left-40 top-0 h-[32rem] w-[32rem] rounded-full bg-[#164E33]/10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-40 top-10 h-[32rem] w-[32rem] rounded-full bg-[#CCFF00]/20 blur-[120px]" />

        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Left Column: Text & CTAs */}
            <div className="flex flex-col items-start text-left lg:col-span-6 xl:col-span-6">
              {/* Watermark Tag */}
              <div className="mb-6 flex items-center justify-start gap-3 select-none">
                <span className="h-px w-10 bg-[#164E33]/30" />
                <span className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-[#164E33]">
                  DATA GOVERNANCE &amp; PRIVACY
                </span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold uppercase tracking-tight text-[#141915] leading-[1.02] mb-6">
                Privacy &amp; Data <span className="text-[#164E33]">Protection</span>
              </h1>

              <p className="text-base sm:text-lg text-[#666C64] leading-relaxed max-w-2xl mb-8">
                We are strictly committed to safeguarding your personal data, client project specifications, and proprietary intellectual assets with zero data monetization, strict code isolation, and military-grade AES-256 encryption.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                <a
                  href="#introduction"
                  className="group inline-flex items-center gap-3 rounded-full bg-[#164E33] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(22,78,51,0.2)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#0C3823]"
                >
                  <span>Read Privacy Policy</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                <a
                  href="mailto:hello@qubtic.tech?subject=Privacy%20Inquiry"
                  className="group inline-flex items-center gap-3 rounded-full border border-[#164E33]/25 bg-white px-7 py-3.5 text-sm font-semibold text-[#164E33] transition-all duration-300 hover:-translate-y-1 hover:border-[#164E33] hover:shadow-md"
                >
                  <span>Contact Privacy Officer</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>

              {/* Quick Metrics & Compliance Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[#164E33]/15 w-full">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#164E33]/10 text-[#164E33] shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold text-[#141915] leading-none">GDPR / CCPA</p>
                    <p className="text-[11px] text-[#666C64] mt-0.5">Compliant</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#164E33]/10 text-[#164E33] shrink-0">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold text-[#141915] leading-none">AES-256</p>
                    <p className="text-[11px] text-[#666C64] mt-0.5">Data Encryption</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#164E33]/10 text-[#164E33] shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold text-[#141915] leading-none">100%</p>
                    <p className="text-[11px] text-[#666C64] mt-0.5">Code Isolation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Animated Shield Graphic with glowing effects and badges */}
            <div className="relative flex items-center justify-center lg:col-span-6 xl:col-span-6">
              <div className="relative w-full max-w-[560px] aspect-[4/3] flex items-center justify-center">
                {/* Ambient Radial Glows behind Shield */}
                <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-[#164E33]/20 blur-3xl sm:h-96 sm:w-96" />
                <div className="pointer-events-none absolute h-60 w-60 rounded-full bg-[#CCFF00]/25 blur-2xl sm:h-80 sm:w-80" />

                {/* 3D Animated Shield Graphic */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/3d-casual-life-shield-with-lock.gif"
                    alt="Qubtic Privacy and Security Shield"
                    width={500}
                    height={500}
                    unoptimized
                    priority
                    className="object-contain max-h-[440px] drop-shadow-[0_20px_45px_rgba(22,78,51,0.22)]"
                  />
                </div>

                {/* Glassmorphism Badge 1 - Top Right */}
                <div className="absolute top-4 right-2 sm:right-6 z-20 hidden sm:flex items-center gap-2.5 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold text-[#164E33] shadow-lg backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-[#CCFF00] shadow-[0_0_0_3px_rgba(204,255,0,0.4)]" />
                  AES-256 Vault Encryption
                </div>

                {/* Glassmorphism Badge 2 - Bottom Left */}
                <div className="absolute bottom-6 left-2 sm:left-6 z-20 hidden sm:flex items-center gap-2.5 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold text-[#164E33] shadow-lg backdrop-blur-md">
                  <KeyRound className="h-3.5 w-3.5 text-[#164E33]" />
                  Zero Data Selling Guaranteed
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 pt-12 md:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Sticky Table of Contents & Quick Summary Sidebar */}
          <aside className="lg:col-span-4 sticky top-28 hidden lg:flex flex-col gap-6">
            {/* Quick Navigation Card */}
            <div className="bg-white border border-[#E5E0D8] rounded-[28px] p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-[#E5E0D8]">
                <FileText className="w-4 h-4 text-[#164E33]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#141915]">
                  Policy Table of Contents
                </h2>
              </div>

              <nav className="flex flex-col space-y-1 text-[13px] sm:text-sm font-medium max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-[#4A5046] hover:text-[#0C3823] hover:bg-[#F0EDE5] transition-all"
                  >
                    <section.icon className="w-4 h-4 text-[#164E33] shrink-0" />
                    <span className="truncate">{section.title}</span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Privacy Pillars Summary Box */}
            <div className="bg-[#164E33] text-white rounded-[28px] p-6 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#CCFF00]" />
                <h3 className="text-sm font-bold uppercase font-heading text-[#CCFF00]">
                  Our Privacy Creed
                </h3>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-white/90 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5" />
                  <span><strong>Zero Data Monetization:</strong> We never sell, rent, or trade client information or leads.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5" />
                  <span><strong>Encrypted In-Transit &amp; At-Rest:</strong> AES-256 and TLS 1.3 encryption across all database records.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5" />
                  <span><strong>Instant Deletion on Demand:</strong> Full GDPR Right to be Forgotten within 48 hours of request.</span>
                </li>
              </ul>
            </div>

            {/* Privacy Officer Contact */}
            <div className="bg-[#F8F6F0] border border-[#E5E0D8] rounded-[28px] p-6 text-center">
              <h3 className="text-sm font-bold uppercase text-[#141915] mb-2">Have Data Inquiries?</h3>
              <p className="text-xs sm:text-sm text-[#666C64] mb-4">Contact our designated Data Protection Officer directly regarding data access, rectification, or NDA compliance.</p>
              <a 
                href="mailto:hello@qubtic.tech?subject=Privacy%20Data%20Request"
                className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-[#164E33] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0C3823] transition-colors"
              >
                <span>Email Privacy Officer</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </aside>

          {/* Policy Sections Document Body */}
          <main className="lg:col-span-8 bg-white border border-[#E5E0D8] rounded-[28px] md:rounded-[36px] p-6 sm:p-10 md:p-14 shadow-sm space-y-12 text-[#141915]">
            
            {/* Notice Callout */}
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-6 text-[15px] sm:text-base leading-relaxed text-[#333830]">
              <p className="font-bold text-[#0C3823] mb-1.5 text-base sm:text-lg">Executive Summary:</p>
              Qubtic values transparency and respect for user privacy. This policy articulates exactly what data we collect, how it is secured, and how you can exercise full control over your personal records under international data protection laws.
            </div>

            {/* Section 1 */}
            <section id="introduction" className="scroll-mt-32 space-y-4 pt-2 border-t border-[#E5E0D8] first:border-none first:pt-0">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  01
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Introduction &amp; Global Privacy Commitment
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Welcome to <strong>Qubtic Digital Product Studio</strong> (&ldquo;Qubtic&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;). We specialize in custom web development, SaaS product engineering, Shopify ecosystem engineering, and Framer development.
              </p>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                We operate with the highest ethical data standards, implementing Privacy by Design across our website (<a href="https://qubtic.tech" className="text-[#0C3823] font-semibold underline">qubtic.tech</a>), custom software client portals, inquiry forms, and server infrastructures.
              </p>
            </section>

            {/* Section 2 */}
            <section id="regulations-scope" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  02
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Scope &amp; Applicable Data Regulations
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                This Privacy Policy applies to all interactions with Qubtic, including our public website, client onboarding workflows, and inquiry submissions. Our operations strictly comply with:
              </p>
              <ul className="list-disc pl-6 text-[15px] sm:text-base text-[#4A5046] space-y-2.5 leading-[1.75]">
                <li><strong>General Data Protection Regulation (EU/UK GDPR):</strong> European and British data subject protection.</li>
                <li><strong>California Consumer Privacy Act &amp; CPRA:</strong> Privacy rights for California residents.</li>
                <li><strong>Personal Data Protection Acts (PDPA):</strong> Asia-Pacific and Commonwealth standards.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="data-collection" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  03
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Categories of Information We Collect
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                We only collect data strictly necessary to scope, engineer, and deliver high-performance software systems.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-6">
                  <h4 className="font-bold text-[#0C3823] mb-2.5 text-sm sm:text-base">Directly Provided Information:</h4>
                  <ul className="text-xs sm:text-sm text-[#4A5046] space-y-2 list-disc pl-4 leading-relaxed">
                    <li>Full Name &amp; Work Email Address</li>
                    <li>Company / Organization Name</li>
                    <li>Project Scope, Target Timeline &amp; Budget Range</li>
                    <li>Technical Specs &amp; RFP Documentation</li>
                  </ul>
                </div>
                <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-6">
                  <h4 className="font-bold text-[#0C3823] mb-2.5 text-sm sm:text-base">Automated Technical Telemetry:</h4>
                  <ul className="text-xs sm:text-sm text-[#4A5046] space-y-2 list-disc pl-4 leading-relaxed">
                    <li>IP Address &amp; Approximate Geographic Region</li>
                    <li>Browser Engine, Device Type &amp; OS Version</li>
                    <li>Page Load Times &amp; Interaction Telemetry</li>
                    <li>Referral URLs and Navigation Journeys</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="lawful-basis" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  04
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Lawful Basis for Data Processing
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Under GDPR Article 6, we process personal information pursuant to the following legal grounds:
              </p>
              <ul className="list-disc pl-6 text-[15px] sm:text-base text-[#4A5046] space-y-2.5 leading-[1.75]">
                <li><strong>Contractual Performance:</strong> Processing required to prepare estimates, execute Statements of Work, and deliver engineered code.</li>
                <li><strong>Explicit Consent:</strong> Provided when you submit an inquiry form or subscribe to architectural updates.</li>
                <li><strong>Legitimate Interests:</strong> Protecting our infrastructure against malicious attacks and maintaining site speed.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="usage-purposes" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  05
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Purpose of Data Processing
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                We use collected information exclusively to:
              </p>
              <ul className="list-disc pl-6 text-[15px] sm:text-base text-[#4A5046] space-y-2.5 leading-[1.75]">
                <li>Conduct architectural discovery sessions and deliver commercial proposals.</li>
                <li>Fulfill agreed milestones, code releases, and software deployments.</li>
                <li>Send automated project confirmations via Mailgun SMTP.</li>
                <li>Optimize website performance and prevent automated spam submissions.</li>
              </ul>
              <p className="text-[15px] sm:text-base font-semibold text-[#0C3823]">
                We do not sell, rent, monetize, or disclose your personal data to third-party advertisers.
              </p>
            </section>

            {/* Section 6 */}
            <section id="cookies-analytics" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  06
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Cookies, Telemetry &amp; Tracking Policies
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Our site uses strictly necessary session tokens (such as encrypted admin session cookies) and anonymous performance telemetry. We do not employ intrusive behavioral tracking or third-party ad retargeting pixels. You can configure your browser to reject cookies without losing access to our public portfolio.
              </p>
            </section>

            {/* Section 7 */}
            <section id="client-confidentiality" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  07
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Client Confidentiality &amp; Source Code Isolation
                </h2>
              </div>
              <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-6 text-[15px] sm:text-base space-y-2.5">
                <p className="font-bold text-[#0C3823] flex items-center gap-2 text-base sm:text-lg">
                  <KeyRound className="w-5 h-5 text-[#164E33]" />
                  Code Isolation Guarantee:
                </p>
                <p className="text-[#4A5046] leading-[1.75]">
                  All client codebases, database models, credentials, and API tokens are strictly isolated in dedicated private environments. We never cross-train models or share code logic across client boundaries.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="third-party-processors" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  08
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Subprocessors &amp; Cloud Infrastructure
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                We partner only with industry-leading, SOC2 Type II and ISO 27001 certified cloud infrastructure providers:
              </p>
              <ul className="list-disc pl-6 text-[15px] sm:text-base text-[#4A5046] space-y-2.5 leading-[1.75]">
                <li><strong>Supabase:</strong> Managed PostgreSQL storage with encryption at rest and Row-Level Security.</li>
                <li><strong>Vercel Inc.:</strong> Global edge hosting with automated DDoS mitigation and SSL termination.</li>
                <li><strong>Cloudinary:</strong> Secure cloud media asset storage with CDN delivery.</li>
                <li><strong>Mailgun Technologies:</strong> Transactional SMTP messaging under strict privacy controls.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="data-transfers-security" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  09
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Data Security &amp; Encryption Standards
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                We enforce multi-tiered defense protocols, including 256-bit AES database encryption, TLS 1.3 cryptographic protocols for data in transit, strict RBAC permissions, and continuous automated vulnerability monitoring.
              </p>
            </section>

            {/* Section 10 */}
            <section id="retention-purging" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  10
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Data Retention &amp; Automatic Purging
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                We retain client project records only for the duration of the engagement plus statutory tax and accounting retention requirements (typically 3 years). Inquiries that do not materialize into projects are automatically purged after twelve (12) months.
              </p>
            </section>

            {/* Section 11 */}
            <section id="user-rights" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  11
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Your Privacy Rights &amp; Data Portability
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Regardless of your geographic location, you enjoy full sovereignty over your personal data:
              </p>
              <ul className="list-disc pl-6 text-[15px] sm:text-base text-[#4A5046] space-y-2.5 leading-[1.75]">
                <li><strong>Right of Access:</strong> Request a complete machine-readable copy of your personal data.</li>
                <li><strong>Right to Rectification:</strong> Correct any inaccurate or incomplete records.</li>
                <li><strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> Request permanent deletion of all records.</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we process your information.</li>
              </ul>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                To exercise any of these rights, email our Data Protection Lead at <a href="mailto:hello@qubtic.tech" className="text-[#0C3823] font-semibold underline">hello@qubtic.tech</a>. We respond to all verified requests within forty-eight (48) hours without fee.
              </p>
            </section>

            {/* Section 12 */}
            <section id="children-privacy" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  12
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Protection of Minors
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Our services and commercial products are strictly aimed at businesses, founders, and professionals aged 18 and older. We do not knowingly solicit or collect data from individuals under 16 years of age.
              </p>
            </section>

            {/* Section 13 */}
            <section id="contact-dpo" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  13
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Policy Updates &amp; Privacy Officer Contact
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                We may revise this Privacy Policy periodically to reflect evolving privacy regulations or technological enhancements. Updated versions will be published with a revised timestamp.
              </p>
              <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-6 text-[15px] sm:text-base space-y-1.5">
                <p className="font-bold text-[#141915] mb-1">Data Protection Officer &amp; Privacy Team:</p>
                <p className="text-[#4A5046]">Email: <a href="mailto:hello@qubtic.tech" className="text-[#0C3823] font-semibold underline">hello@qubtic.tech</a></p>
                <p className="text-[#4A5046]">Direct Contact Portal: <Link href="/contact" className="text-[#0C3823] font-semibold underline">qubtic.tech/contact</Link></p>
              </div>
            </section>

          </main>
        </div>

        {/* Bottom CTA Block */}
        <div className="mt-16 bg-[#0C3823] text-white rounded-[28px] md:rounded-[36px] p-10 sm:p-14 text-center shadow-xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase font-heading mb-4">
            Security &amp; Confidentiality are at Our Core
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8 text-base sm:text-lg leading-relaxed">
            Ready to engineer scalable, high-performance software under world-class confidentiality standards?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button href="/contact" variant="primary" size="lg" className="bg-[#CCFF00] text-[#0C3823] hover:bg-white">
              <span>Start a Project</span>
              <ArrowUpRight className="w-4 h-4" />
            </Button>
            <Button href="/services" variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-[#0C3823]">
              <span>Explore Engineering Services</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
