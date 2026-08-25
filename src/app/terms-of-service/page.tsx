export const metadata = {
  title: 'Terms of Service | qubtic',
  description: 'Terms and conditions for qubtic software engineering and design services.',
};

export default function TermsOfServicePage() {
  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0C3823] block mb-2">
            LEGAL AGREEMENT
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#141915] font-heading mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-[#666C64]">Last updated: August 2026</p>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-[28px] md:rounded-[36px] p-8 sm:p-12 md:p-16 shadow-sm space-y-8 text-[#141915]">
          <section className="space-y-3">
            <h2 className="text-xl font-bold uppercase font-heading text-[#141915]">
              1. Acceptance of Terms
            </h2>
            <p className="text-[#666C64] leading-relaxed text-sm">
              By accessing or engaging qubtic for custom web development, SaaS engineering, Shopify app creation, or Framer website development, you agree to be bound by these Terms of Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold uppercase font-heading text-[#141915]">
              2. Intellectual Property Rights
            </h2>
            <p className="text-[#666C64] leading-relaxed text-sm">
              Upon final milestone payment completion, all custom deliverables, code repositories, UI assets, and designs created specifically for the client become the sole proprietary property of the client. qubtic retains the right to display project outcomes in its portfolio unless a Non-Disclosure Agreement (NDA) specifies otherwise.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold uppercase font-heading text-[#141915]">
              3. Payment &amp; Milestone Deliveries
            </h2>
            <p className="text-[#666C64] leading-relaxed text-sm">
              Project fees, sprint schedules, and milestone delivery criteria are specified in individual Statements of Work (SOW). Invoices must be settled within the agreed timeframe to ensure continuous development velocity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold uppercase font-heading text-[#141915]">
              4. Warranties and Limitation of Liability
            </h2>
            <p className="text-[#666C64] leading-relaxed text-sm">
              qubtic warrants that all delivered software functions in accordance with the documented specifications during the agreed warranty support period.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
