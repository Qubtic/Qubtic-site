export const metadata = {
  title: 'Privacy Policy | qubtic',
  description: 'Privacy Policy for qubtic website and digital services.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0C3823] block mb-2">
            LEGAL INFORMATION
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#141915] font-heading mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-[#666C64]">Last updated: August 2026</p>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-[28px] md:rounded-[36px] p-8 sm:p-12 md:p-16 shadow-sm space-y-8 text-[#141915]">
          <section className="space-y-3">
            <h2 className="text-xl font-bold uppercase font-heading text-[#141915]">
              1. Introduction
            </h2>
            <p className="text-[#666C64] leading-relaxed text-sm">
              Welcome to qubtic (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). We are committed to protecting your personal information and your right to privacy under GDPR, CCPA, and global privacy standards. For privacy inquiries, reach us at hello@qubtic.tech.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold uppercase font-heading text-[#141915]">
              2. Information We Collect
            </h2>
            <p className="text-[#666C64] leading-relaxed text-sm">
              We collect personal data you voluntarily provide when inquiring about our web development, SaaS, Shopify, or Framer services via our contact forms. This includes:
            </p>
            <ul className="list-disc pl-5 text-sm text-[#666C64] space-y-1">
              <li>Full Name</li>
              <li>Work Email Address</li>
              <li>Company Name and Project Scope</li>
              <li>Project Budget and Timeline Requirements</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold uppercase font-heading text-[#141915]">
              3. How We Use Your Information
            </h2>
            <p className="text-[#666C64] leading-relaxed text-sm">
              We utilize collected information solely to respond to project inquiries, deliver contractual services, optimize website performance, and maintain communications. We never sell your personal information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold uppercase font-heading text-[#141915]">
              4. Cookies and Analytical Trackers
            </h2>
            <p className="text-[#666C64] leading-relaxed text-sm">
              We use strictly necessary cookies and anonymous telemetry to analyze website performance, latency, and user journeys. You may disable cookies in your browser settings at any time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold uppercase font-heading text-[#141915]">
              5. Your Legal Privacy Rights
            </h2>
            <p className="text-[#666C64] leading-relaxed text-sm">
              You possess the right to access, rectify, or request permanent deletion of any personal data maintained by qubtic. To exercise these rights, submit a request to hello@qubtic.tech.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
