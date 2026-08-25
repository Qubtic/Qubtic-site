import { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldCheck, 
  FileText, 
  CreditCard, 
  RotateCcw, 
  Clock, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  HelpCircle,
  Briefcase,
  Layers,
  Scale,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | Qubtic Digital Product Studio',
  description:
    'Comprehensive Refund & Cancellation Policy outlining Qubtic terms for milestone billing, pre-kickoff discovery, retainer cancellations, and 30-day bug warranty.',
  alternates: {
    canonical: 'https://qubtic.tech/refund-policy',
  },
  openGraph: {
    title: 'Refund & Cancellation Policy | Qubtic Digital Product Studio',
    description:
      'Clear, transparent refund and cancellation terms for custom software engineering, SaaS development, and sprint retainers at Qubtic.',
    url: 'https://qubtic.tech/refund-policy',
    siteName: 'Qubtic',
    locale: 'en_US',
    type: 'website',
  },
};

const sections = [
  { id: 'objective', title: '1. Policy Objective & Commercial Transparency', icon: ShieldCheck },
  { id: 'service-models', title: '2. Scope of Services & Engagement Models', icon: Briefcase },
  { id: 'pre-kickoff', title: '3. Pre-Kickoff & Initial Discovery Cancellations', icon: RotateCcw },
  { id: 'milestone-sprints', title: '4. Milestone Deliverables & Sprint Billing', icon: Layers },
  { id: 'retainers', title: '5. Subscription & Monthly Retainer Cancellations', icon: RefreshCw },
  { id: 'warranty-sla', title: '6. 30-Day Code Warranty & Defect Remediation SLA', icon: CheckCircle2 },
  { id: 'third-party', title: '7. Third-Party Fees, APIs & Cloud Hosting', icon: CreditCard },
  { id: 'request-procedure', title: '8. Refund Request Procedure & Dispute Resolution', icon: Scale },
  { id: 'processing-timelines', title: '9. Processing Timelines & Reimbursement Methods', icon: Clock },
  { id: 'billing-contact', title: '10. Policy Amendments & Billing Contact Details', icon: HelpCircle },
];

export default function RefundPolicyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Refund and Cancellation Policy - Qubtic',
    description: 'Official refund, cancellation, and dispute policies for software development services by Qubtic Digital Product Studio.',
    url: 'https://qubtic.tech/refund-policy',
    publisher: {
      '@type': 'Organization',
      name: 'Qubtic Digital Product Studio',
      url: 'https://qubtic.tech',
      logo: 'https://qubtic.tech/images/brand/qubtic-green.png',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hello@qubtic.tech',
        contactType: 'billing and refund inquiries',
      },
    },
  };

  return (
    <div className="pb-24 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header Section */}
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20 bg-[#FAF8F5]">
        {/* Background Glows */}
        <div className="pointer-events-none absolute -left-40 top-0 h-[32rem] w-[32rem] rounded-full bg-[#164E33]/10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-40 top-10 h-[32rem] w-[32rem] rounded-full bg-[#CCFF00]/20 blur-[120px]" />

        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Tag */}
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-[#164E33]/20 bg-[#164E33]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#164E33]">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>COMMERCIAL TERMS &amp; CANCELLATION</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight text-[#141915] leading-[1.05] mb-6">
              Refund &amp; Cancellation <span className="text-[#164E33]">Policy</span>
            </h1>

            <p className="text-base sm:text-lg text-[#666C64] leading-relaxed max-w-2xl mx-auto mb-6">
              Transparent terms explaining how deposits, milestone payments, monthly developer retainers, and quality warranties are managed across all Qubtic engineering agreements.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-[#666C64]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 border border-[#E5E0D8] shadow-xs">
                <Clock className="w-3.5 h-3.5 text-[#164E33]" />
                Last Updated: August 2026
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 border border-[#E5E0D8] shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0C3823]" />
                Direct Merchant Compliance
              </span>
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

            {/* Key Guarantees Summary Box */}
            <div className="bg-[#164E33] text-white rounded-[28px] p-6 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#CCFF00]" />
                <h3 className="text-sm font-bold uppercase font-heading text-[#CCFF00]">
                  Core Refund Principles
                </h3>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-white/90 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5" />
                  <span><strong>100% Pre-Kickoff Refund:</strong> Cancel before sprint commencement for a full deposit refund (minus gateway fees).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5" />
                  <span><strong>Milestone Review Period:</strong> 7 days to review deliverables and request revisions before milestone sign-off.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5" />
                  <span><strong>30-Day Defect Warranty:</strong> Free remediation of bugs and discrepancies post-deployment.</span>
                </li>
              </ul>
            </div>

            {/* Billing Support Card */}
            <div className="bg-[#F8F6F0] border border-[#E5E0D8] rounded-[28px] p-6 text-center">
              <h3 className="text-sm font-bold uppercase text-[#141915] mb-2">Billing &amp; Invoice Support</h3>
              <p className="text-xs sm:text-sm text-[#666C64] mb-4">Have questions about milestone invoices, payment gateways, or cancellation terms?</p>
              <a 
                href="mailto:hello@qubtic.tech?subject=Billing%20Support%20Request"
                className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-[#164E33] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0C3823] transition-colors"
              >
                <span>Contact Billing Team</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </aside>

          {/* Policy Sections Document Body */}
          <main className="lg:col-span-8 bg-white border border-[#E5E0D8] rounded-[28px] md:rounded-[36px] p-6 sm:p-10 md:p-14 shadow-sm space-y-12 text-[#141915]">
            
            {/* Notice Callout */}
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-6 text-[15px] sm:text-base leading-relaxed text-[#333830]">
              <p className="font-bold text-[#0C3823] mb-1.5 text-base sm:text-lg">Commercial Summary:</p>
              Qubtic operates on transparent, milestone-driven software delivery schedules. This Refund &amp; Cancellation Policy governs how upfront deposits, progress billing, retainer plans, and post-delivery code warranties are handled.
            </div>

            {/* Section 1 */}
            <section id="objective" className="scroll-mt-32 space-y-4 pt-2 border-t border-[#E5E0D8] first:border-none first:pt-0">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  01
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Policy Objective &amp; Commercial Transparency
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                At <strong>Qubtic Digital Product Studio</strong> (&ldquo;Qubtic&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;), we are committed to providing world-class software engineering, SaaS product development, Shopify ecosystem apps, and Framer digital experiences.
              </p>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Because bespoke digital product engineering involves dedicated engineering talent, architecture planning, and custom source code creation, this policy outlines the conditions under which refunds, milestone adjustments, and contract cancellations are processed.
              </p>
            </section>

            {/* Section 2 */}
            <section id="service-models" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  02
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Scope of Services &amp; Engagement Models
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Refund considerations vary based on the commercial structure of your engagement:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-6">
                  <h4 className="font-bold text-[#0C3823] mb-2.5 text-sm sm:text-base">Fixed-Scope Milestone Contracts:</h4>
                  <p className="text-xs sm:text-sm text-[#4A5046] leading-relaxed">
                    Projects partitioned into distinct sprint milestones (e.g. Design, Architecture, Development, QA, Deployment) with milestone-specific deliverables and sign-off criteria.
                  </p>
                </div>
                <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-6">
                  <h4 className="font-bold text-[#0C3823] mb-2.5 text-sm sm:text-base">Monthly Retainers &amp; Dedicated Sprints:</h4>
                  <p className="text-xs sm:text-sm text-[#4A5046] leading-relaxed">
                    Ongoing engineering retainers or subscription packages providing dedicated senior engineering hours, continuous maintenance, and roadmap feature execution.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="pre-kickoff" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  03
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Pre-Kickoff &amp; Initial Discovery Cancellations
                </h2>
              </div>
              <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-6 text-[15px] sm:text-base space-y-2.5">
                <p className="font-bold text-[#0C3823] flex items-center gap-2 text-base sm:text-lg">
                  <RotateCcw className="w-5 h-5 text-[#164E33]" />
                  100% Pre-Kickoff Deposit Refund:
                </p>
                <p className="text-[#4A5046] leading-[1.75]">
                  If a Client decides to cancel a project in writing prior to the formal project kickoff meeting or before custom architectural sprint work commences (within <strong>48 hours of initial deposit payment</strong>), Qubtic will issue a <strong>100% full refund</strong> of the deposit, less any non-recoverable third-party payment gateway transaction processing fees.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section id="milestone-sprints" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  04
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Milestone Deliverables &amp; Sprint Billing
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                For active projects operating under a Statement of Work (SOW):
              </p>
              <ul className="list-disc pl-6 text-[15px] sm:text-base text-[#4A5046] space-y-2.5 leading-[1.75]">
                <li><strong>Completed &amp; Approved Milestones:</strong> Once a milestone deliverable is reviewed, deployed to staging, and approved by the Client, payments allocated to that milestone become final and non-refundable, as dedicated hours and IP have been transferred.</li>
                <li><strong>In-Progress Milestones:</strong> If an engagement is terminated mid-sprint, the Client is only billed for the proportional hours or completed feature modules delivered up to the termination date. Any unearned surplus deposit for future unstarted milestones is refunded.</li>
                <li><strong>Review &amp; Revision Period:</strong> Clients have <strong>seven (7) business days</strong> upon milestone delivery to test functionality and request adjustments in alignment with the SOW specifications.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="retainers" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  05
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Subscription &amp; Monthly Retainer Cancellations
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                For monthly engineering plans and maintenance retainers:
              </p>
              <ul className="list-disc pl-6 text-[15px] sm:text-base text-[#4A5046] space-y-2.5 leading-[1.75]">
                <li>Clients may cancel ongoing monthly subscriptions at any time by providing at least <strong>fourteen (14) calendar days written notice</strong> prior to the subsequent monthly billing renewal date.</li>
                <li>Retainer fees for the currently active billing month are non-refundable once the cycle has commenced and engineering resources have been reserved.</li>
                <li>No long-term lock-in or cancellation penalties are imposed for month-to-month retainers.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="warranty-sla" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  06
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  30-Day Code Warranty &amp; Defect Remediation SLA
                </h2>
              </div>
              <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-6 text-[15px] sm:text-base space-y-2.5">
                <p className="font-bold text-[#0C3823] flex items-center gap-2 text-base sm:text-lg">
                  <ShieldCheck className="w-5 h-5 text-[#164E33]" />
                  Quality Assurance Commitment:
                </p>
                <p className="text-[#4A5046] leading-[1.75]">
                  Every custom software release is backed by a <strong>30-day post-launch warranty period</strong>. In the unlikely event that a deliverable contains bugs or fails to meet the approved SOW specifications, Qubtic will remediate the defect promptly at zero additional cost.
                </p>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                If Qubtic is unable to resolve a critical verified defect that prevents the core agreed functionality within a reasonable timeframe, the Client may be eligible for a partial or proportional refund corresponding to that specific module.
              </p>
            </section>

            {/* Section 7 */}
            <section id="third-party" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  07
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Third-Party Fees, APIs &amp; Cloud Hosting
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Fees paid to external third-party service providers (including but not limited to domain registrars, Vercel hosting, Supabase infrastructure, Cloudinary media storage, Mailgun email services, Shopify app store fees, or Stripe transaction fees) are paid directly to those respective vendors and are entirely non-refundable by Qubtic.
              </p>
            </section>

            {/* Section 8 */}
            <section id="request-procedure" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  08
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Refund Request Procedure &amp; Dispute Resolution
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                To submit a formal refund or billing adjustment request:
              </p>
              <ol className="list-decimal pl-6 text-[15px] sm:text-base text-[#4A5046] space-y-2.5 leading-[1.75]">
                <li>Submit an email to <a href="mailto:hello@qubtic.tech" className="text-[#0C3823] font-semibold underline">hello@qubtic.tech</a> with the subject line: <strong>&ldquo;Billing Dispute / Refund Request - [Project Name]&rdquo;</strong>.</li>
                <li>Include invoice numbers, milestone details, and a clear explanation of the discrepancy or cancellation rationale.</li>
                <li>Our executive leadership and technical leads will review the request within <strong>three (3) business days</strong> to initiate an amicable resolution.</li>
              </ol>
            </section>

            {/* Section 9 */}
            <section id="processing-timelines" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  09
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Processing Timelines &amp; Reimbursement Methods
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Once a refund is approved in writing:
              </p>
              <ul className="list-disc pl-6 text-[15px] sm:text-base text-[#4A5046] space-y-2.5 leading-[1.75]">
                <li>Refunds are initiated within <strong>forty-eight (48) hours</strong> of approval.</li>
                <li>Funds are returned directly to the original payment method (Stripe Credit/Debit Card, Wire Transfer, ACH, or Wise).</li>
                <li>Depending on your banking institution, funds typically reflect in your account within <strong>5 to 10 business days</strong>.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section id="billing-contact" className="scroll-mt-32 space-y-4 pt-8 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0C3823] text-xs font-bold text-[#CCFF00]">
                  10
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase font-heading text-[#141915] tracking-tight">
                  Policy Amendments &amp; Billing Contact
                </h2>
              </div>
              <p className="text-[15px] sm:text-base text-[#4A5046] leading-[1.75]">
                Qubtic reserves the right to amend this Refund &amp; Cancellation Policy. Any modifications apply prospectively to new Statements of Work and renewal periods.
              </p>
              <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-6 text-[15px] sm:text-base space-y-1.5">
                <p className="font-bold text-[#141915] mb-1">Billing &amp; Commercial Accounts Department:</p>
                <p className="text-[#4A5046]">Email: <a href="mailto:hello@qubtic.tech" className="text-[#0C3823] font-semibold underline">hello@qubtic.tech</a></p>
                <p className="text-[#4A5046]">Direct Portal: <Link href="/contact" className="text-[#0C3823] font-semibold underline">qubtic.tech/contact</Link></p>
              </div>
            </section>

          </main>
        </div>

        {/* Bottom CTA Block */}
        <div className="mt-16 bg-[#0C3823] text-white rounded-[28px] md:rounded-[36px] p-10 sm:p-14 text-center shadow-xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase font-heading mb-4">
            Partner With a Transparent, Reliable Engineering Studio
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8 text-base sm:text-lg leading-relaxed">
            Have a project in mind? Let&apos;s architect a clear scope, timeline, and milestone structure tailored to your goals.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button href="/contact" variant="primary" size="lg" className="bg-[#CCFF00] text-[#0C3823] hover:bg-white">
              <span>Start a Project</span>
              <ArrowUpRight className="w-4 h-4" />
            </Button>
            <Button href="/pricing" variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-[#0C3823]">
              <span>View Transparent Pricing</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
