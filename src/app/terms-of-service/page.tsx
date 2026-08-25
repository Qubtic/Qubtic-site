import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  Code2, 
  CheckCircle2, 
  ArrowUpRight, 
  HelpCircle, 
  Scale, 
  Clock, 
  FileCode, 
  CreditCard, 
  AlertCircle,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Terms of Service | Qubtic Digital Product Studio',
  description:
    'Comprehensive Terms of Service governing Qubtic software engineering, web development, SaaS product design, Shopify apps, and digital consultancy agreements.',
  alternates: {
    canonical: 'https://qubtic.tech/terms-of-service',
  },
  openGraph: {
    title: 'Terms of Service | Qubtic Digital Product Studio',
    description:
      'Clear, enterprise-grade terms and conditions governing software development, intellectual property transfer, milestone billing, and warranty periods at Qubtic.',
    url: 'https://qubtic.tech/terms-of-service',
    siteName: 'Qubtic',
    locale: 'en_US',
    type: 'website',
  },
};

const sections = [
  { id: 'acceptance', title: '1. Acceptance & Engagement Scope', icon: ShieldCheck },
  { id: 'services-sow', title: '2. Services & Statements of Work', icon: Briefcase },
  { id: 'sprints-approvals', title: '3. Agile Sprints & Client Approvals', icon: Clock },
  { id: 'intellectual-property', title: '4. Intellectual Property & 100% IP Transfer', icon: Code2 },
  { id: 'confidentiality-nda', title: '5. Confidentiality, NDA & Trade Secrets', icon: Lock },
  { id: 'billing-milestones', title: '6. Payment Schedules & Milestone Billing', icon: CreditCard },
  { id: 'client-responsibilities', title: '7. Client Obligations & Asset Handover', icon: Layers },
  { id: 'warranties-slas', title: '8. Code Warranties & Post-Launch Bug SLA', icon: CheckCircle2 },
  { id: 'third-party', title: '9. Third-Party Integrations & Cloud APIs', icon: FileCode },
  { id: 'liability', title: '10. Limitation of Liability & Indemnity', icon: Scale },
  { id: 'termination', title: '11. Term, Termination & Source Code Handover', icon: AlertCircle },
  { id: 'governing-law', title: '12. Governing Law & Dispute Resolution', icon: Scale },
  { id: 'contact', title: '13. Amendments & Legal Contact', icon: HelpCircle },
];

export default function TermsOfServicePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service - Qubtic',
    description: 'Terms and conditions for custom software development, SaaS engineering, and digital solutions by Qubtic.',
    url: 'https://qubtic.tech/terms-of-service',
    publisher: {
      '@type': 'Organization',
      name: 'Qubtic Digital Product Studio',
      url: 'https://qubtic.tech',
      logo: 'https://qubtic.tech/images/brand/qubtic-green.png',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hello@qubtic.tech',
        contactType: 'customer service',
      },
    },
  };

  return (
    <div className="pb-24 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header Section with 3D Animated Illustration */}
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
                  LEGAL FRAMEWORK &amp; AGREEMENT
                </span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold uppercase tracking-tight text-[#141915] leading-[1.02] mb-6">
                Terms of <span className="text-[#164E33]">Service</span>
              </h1>

              <p className="text-base sm:text-lg text-[#666C64] leading-relaxed max-w-2xl mb-8">
                Transparent, founder-friendly contractual terms designed to safeguard intellectual property, clarify milestone deliveries, and ensure seamless software development execution.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                <a
                  href="#acceptance"
                  className="group inline-flex items-center gap-3 rounded-full bg-[#164E33] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(22,78,51,0.2)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#0C3823]"
                >
                  <span>Explore Terms</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-3 rounded-full border border-[#164E33]/25 bg-white px-7 py-3.5 text-sm font-semibold text-[#164E33] transition-all duration-300 hover:-translate-y-1 hover:border-[#164E33] hover:shadow-md"
                >
                  <span>Request Custom MSA</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>

              {/* Quick Metrics & Compliance Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[#164E33]/15 w-full">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#164E33]/10 text-[#164E33] shrink-0">
                    <Code2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold text-[#141915] leading-none">100% IP</p>
                    <p className="text-[11px] text-[#666C64] mt-0.5">Transfer</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#164E33]/10 text-[#164E33] shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold text-[#141915] leading-none">30-Day</p>
                    <p className="text-[11px] text-[#666C64] mt-0.5">Bug Warranty</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#164E33]/10 text-[#164E33] shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold text-[#141915] leading-none">Mutual NDA</p>
                    <p className="text-[11px] text-[#666C64] mt-0.5">Protected</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Animated Illustration with glowing effects and badges */}
            <div className="relative flex items-center justify-center lg:col-span-6 xl:col-span-6">
              <div className="relative w-full max-w-[560px] aspect-[4/3] flex items-center justify-center">
                {/* Ambient Radial Glows behind the 3D Graphic */}
                <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-[#164E33]/20 blur-3xl sm:h-96 sm:w-96" />
                <div className="pointer-events-none absolute h-60 w-60 rounded-full bg-[#CCFF00]/25 blur-2xl sm:h-80 sm:w-80" />

                {/* 3D Animated Illustration */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/contact.gif"
                    alt="Qubtic Transparent Contract & Terms 3D Animation"
                    width={520}
                    height={520}
                    unoptimized
                    priority
                    className="object-contain max-h-[440px] drop-shadow-[0_20px_45px_rgba(22,78,51,0.22)]"
                  />
                </div>

                {/* Glassmorphism Badge 1 - Top Right */}
                <div className="absolute top-4 right-2 sm:right-6 z-20 hidden sm:flex items-center gap-2.5 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold text-[#164E33] shadow-lg backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-[#CCFF00] shadow-[0_0_0_3px_rgba(204,255,0,0.4)]" />
                  100% IP Transfer Guaranteed
                </div>

                {/* Glassmorphism Badge 2 - Bottom Left */}
                <div className="absolute bottom-6 left-2 sm:left-6 z-20 hidden sm:flex items-center gap-2.5 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold text-[#164E33] shadow-lg backdrop-blur-md">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#164E33]" />
                  Founder-Friendly Commercial Terms
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
                  Table of Contents
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

            {/* Key Commitments Summary Box */}
            <div className="bg-[#164E33] text-white rounded-[28px] p-6 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#CCFF00]" />
                <h3 className="text-sm font-bold uppercase font-heading text-[#CCFF00]">
                  Core Guarantees
                </h3>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-white/90 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5" />
                  <span><strong>100% IP Transfer:</strong> Full repository, design, and trademark asset rights upon milestone payment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5" />
                  <span><strong>Mutual NDA:</strong> Rigorous trade secret and proprietary codebase protection.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5" />
                  <span><strong>30-Day Warranty:</strong> Guaranteed complimentary bug remediation post-deployment.</span>
                </li>
              </ul>
            </div>

            {/* Custom Agreement Contact */}
            <div className="bg-[#F8F6F0] border border-[#E5E0D8] rounded-[28px] p-6 text-center">
              <h3 className="text-sm font-bold uppercase text-[#141915] mb-2">Need a Custom MSA or Enterprise NDA?</h3>
              <p className="text-xs sm:text-sm text-[#666C64] mb-4">We accommodate tailored master service agreements for enterprise partners and institutional procurement teams.</p>
              <Button href="/contact" variant="primary" size="sm" className="w-full justify-center">
                <span>Request Custom MSA</span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </div>
          </aside>

          {/* Legal Sections Document Body */}
          <main className="lg:col-span-8 bg-white border border-[#E5E0D8] rounded-[28px] md:rounded-[36px] p-6 sm:p-10 md:p-14 shadow-sm space-y-12 text-[#141915]">
            
            {/* Notice Callout */}
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-6 text-[15px] sm:text-base leading-relaxed text-[#333830]">
              <p className="font-bold text-[#0C3823] mb-1.5 text-base sm:text-lg">Important Overview:</p>
              Please review these Terms of Service thoroughly. By commissioning Qubtic for digital engineering, UI/UX architecture, SaaS development, or technical consulting services, you enter into a legally binding agreement governing deliverables, intellectual property, timelines, and payment structures.
            </div>

            {/* Section 1 */}
            <section id="acceptance" className="scroll-mt-32 space-y-4 pt-2 border-t border-[#E5E0D8] first:border-none first:pt-0">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  01
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Acceptance of Terms &amp; Engagement Scope
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                These Terms of Service (&ldquo;Terms&rdquo;, &ldquo;Agreement&rdquo;) constitute a legally enforceable contract between <strong>Qubtic Digital Product Studio</strong> (&ldquo;Qubtic&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) and the client entity or individual (&ldquo;Client&rdquo;, &ldquo;you&rdquo;) executing a Statement of Work, quotation, or project agreement.
              </p>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Engaging Qubtic for software engineering, custom web applications, SaaS platform development, Shopify app/store engineering, Framer digital products, or dedicated developer sprints confirms your unconditional acceptance of these terms.
              </p>
            </section>

            {/* Section 2 */}
            <section id="services-sow" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  02
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Services &amp; Statements of Work (SOW)
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                All client engagements are formally defined through a Statement of Work (&ldquo;SOW&rdquo;), Project Proposal, or Subscription Service Order. Each document specifies:
              </p>
              <ul className="list-disc pl-6 text-[15px] sm:text-base text-[#4A5046] space-y-2.5 leading-[1.75]">
                <li>Specific deliverables, feature specifications, and architectural constraints.</li>
                <li>Agile sprint schedule, delivery phases, and milestone targets.</li>
                <li>Fixed fee or time-and-materials payment structures.</li>
                <li>Designated communication channels, repository access, and staging environments.</li>
              </ul>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Any modifications to the documented scope of work (&ldquo;Scope Creep&rdquo;) must be mutually agreed upon in writing via a Change Order prior to development execution.
              </p>
            </section>

            {/* Section 3 */}
            <section id="sprints-approvals" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  03
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Agile Sprints &amp; Client Milestone Approvals
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Qubtic follows a structured, milestone-driven development process. Deliverables are deployed to protected staging environments for client validation.
              </p>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                The Client shall have <strong>seven (7) business days</strong> following milestone notification to review deliverables and provide written acceptance or detailed, actionable bug feedback. In the absence of written rejection within this window, the milestone is deemed formally accepted.
              </p>
            </section>

            {/* Section 4 */}
            <section id="intellectual-property" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  04
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Intellectual Property Rights &amp; 100% IP Transfer
                </h2>
              </div>
              <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-6 text-[15px] sm:text-base space-y-2.5">
                <p className="font-bold text-[#0C3823] flex items-center gap-2 text-base sm:text-lg">
                  <ShieldCheck className="w-5 h-5 text-[#164E33]" />
                  Total Ownership Guarantee:
                </p>
                <p className="text-[#4A5046] leading-[1.75]">
                  Upon final payment of all contractual fees for a specific project, <strong>all custom source code, databases, design tokens, UI components, Figma schemas, and digital deliverables created specifically for the Client become the exclusive, unencumbered proprietary property of the Client.</strong>
                </p>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                <strong>Pre-Existing Tools &amp; Open Source:</strong> Qubtic retains ownership of its internal boilerplate libraries, standard DevOps configurations, and general utility functions (&ldquo;Background IP&rdquo;). Qubtic grants Client an irrevocable, worldwide, perpetual, royalty-free license to use, modify, and distribute any Background IP integrated into the custom deliverables.
              </p>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                <strong>Portfolio Rights:</strong> Unless restricted by an active Non-Disclosure Agreement (NDA), Qubtic reserves the right to display project outcomes, screenshots, and aggregate metrics in marketing case studies and technical portfolios.
              </p>
            </section>

            {/* Section 5 */}
            <section id="confidentiality-nda" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  05
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Confidentiality, NDA &amp; Trade Secrets
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Both parties agree to treat all business plans, financial records, customer databases, technical architectures, and unpublished source code as strictly confidential. Neither party shall disclose Confidential Information to third parties without prior written consent, except to necessary subcontractors bound by equal non-disclosure covenants.
              </p>
            </section>

            {/* Section 6 */}
            <section id="billing-milestones" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  06
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Payment Schedules, Milestone Billing &amp; Invoicing
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Standard project structures require an initial deposit prior to kickoff, with subsequent payments linked to milestone completions or monthly sprint cycles.
              </p>
              <ul className="list-disc pl-6 text-[15px] sm:text-base text-[#4A5046] space-y-2.5 leading-[1.75]">
                <li>Invoices are due within <strong>seven (7) calendar days</strong> of issuance unless otherwise stipulated.</li>
                <li>Late payments exceeding 14 calendar days may incur a 1.5% monthly financing charge or temporary suspension of active sprint development.</li>
                <li>Deposits and milestone payments for completed, approved sprint work are non-refundable.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="client-responsibilities" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  07
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Client Obligations &amp; Asset Handover
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Timely project delivery requires prompt client collaboration. Client agrees to provide necessary third-party API credentials, domain access, brand assets, and feedback in a timely manner. Project timeline delays stemming from overdue client assets shall automatically extend targeted delivery milestones.
              </p>
            </section>

            {/* Section 8 */}
            <section id="warranties-slas" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  08
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Code Warranties &amp; 30-Day Post-Launch Bug SLA
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Qubtic warrants that all delivered software will perform in substantial accordance with the written technical specifications for a period of <strong>thirty (30) calendar days</strong> following production deployment (&ldquo;Warranty Period&rdquo;).
              </p>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                During the Warranty Period, Qubtic shall promptly remediate any verifiable defects or bugs at zero additional charge. This warranty does not cover issues resulting from third-party modifications, unauthorized server changes, or subsequent browser API deprecations.
              </p>
            </section>

            {/* Section 9 */}
            <section id="third-party" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  09
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Third-Party Integrations, APIs &amp; Cloud Hosting
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Software engineered by Qubtic frequently interfaces with external vendors (e.g. Supabase, Vercel, Stripe, Cloudinary, Mailgun, AWS, Shopify APIs). Qubtic is not liable for service outages, rate limits, breaking API revisions, or billing policies imposed by external providers.
              </p>
            </section>

            {/* Section 10 */}
            <section id="liability" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  10
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Limitation of Liability &amp; Indemnification
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                To the maximum extent permitted by applicable law, neither party shall be liable for indirect, incidental, punitive, or consequential damages (including loss of profits, data, or business goodwill).
              </p>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Qubtic&apos;s cumulative financial liability arising from any claim related to this Agreement shall be strictly capped at the total amount paid by Client to Qubtic under the applicable SOW in the three (3) months preceding the claim.
              </p>
            </section>

            {/* Section 11 */}
            <section id="termination" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  11
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Term, Termination &amp; Handover Protocol
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Either party may terminate an ongoing engagement with fourteen (14) days written notice. Upon termination, Client shall pay for all work satisfactorily completed up to the date of notice. Following settlement, Qubtic shall transfer all code repositories, database snapshots, and documentation in its possession.
              </p>
            </section>

            {/* Section 12 */}
            <section id="governing-law" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  12
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Governing Law &amp; Dispute Resolution
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                This Agreement shall be governed by and construed in accordance with international commercial law principles. In the event of a dispute, both parties commit to an initial 30-day amicable mediation period prior to initiating formal arbitration proceedings.
              </p>
            </section>

            {/* Section 13 */}
            <section id="contact" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  13
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Amendments &amp; Legal Contact
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Qubtic may periodically update these Terms to reflect legislative changes or expanded capabilities. Significant modifications will be announced on our website with updated revision timestamps.
              </p>
              <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-6 text-[15px] sm:text-base space-y-1.5">
                <p className="font-bold text-[#141915] mb-1">Legal Inquiries &amp; Contract Notices:</p>
                <p className="text-[#4A5046]">Email: <a href="mailto:hello@qubtic.tech" className="text-[#0C3823] font-semibold underline">hello@qubtic.tech</a></p>
                <p className="text-[#4A5046]">Direct Portal: <Link href="/contact" className="text-[#0C3823] font-semibold underline">qubtic.tech/contact</Link></p>
              </div>
            </section>

          </main>
        </div>

        {/* Bottom CTA Block */}
        <div className="mt-16 bg-[#0C3823] text-white rounded-[28px] md:rounded-[36px] p-10 sm:p-14 text-center shadow-xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase font-heading mb-4">
            Ready to Partner With a World-Class Engineering Team?
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8 text-base sm:text-lg leading-relaxed">
            Let&apos;s discuss your technical architecture, sprint timeline, and deliverables under a protected NDA.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button href="/contact" variant="primary" size="lg" className="bg-[#CCFF00] text-[#0C3823] hover:bg-white">
              <span>Initiate Project Discovery</span>
              <ArrowUpRight className="w-4 h-4" />
            </Button>
            <Button href="/pricing" variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-[#0C3823]">
              <span>View Pricing Models</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
