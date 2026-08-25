import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ServiceCard from '@/components/services/ServiceCard';
import { ArrowUpRight, CheckCircle2, Layers, Cpu, Sparkles, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getServicesDb } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Digital Engineering Services | Qubtic Digital Product Studio',
  description:
    'End-to-end digital engineering solutions: High-performance Web Development, SaaS Product Engineering, Shopify Apps, and Framer interactive sites.',
  alternates: {
    canonical: 'https://qubtic.tech/services',
  },
};

export default async function ServicesPage() {
  const services = await getServicesDb();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: services.map((s, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://qubtic.tech/services/${s.slug}`,
      name: s.title,
      description: s.shortDescription,
    })),
  };

  return (
    <div className="pb-24 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section matching Work Hero Background & Animations */}
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
                  ENGINEERING CAPABILITIES
                </span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold uppercase tracking-tight text-[#141915] leading-[1.02] mb-6">
                End-To-End Digital <span className="text-[#164E33]">Product Engineering</span>
              </h1>

              <p className="text-base sm:text-lg text-[#666C64] leading-relaxed max-w-2xl mb-8">
                We architect, design, and engineer mission-critical digital systems. From high-converting web applications to multi-tenant SaaS platforms and bespoke Shopify extensions, our code is built for speed, resilience, and maximum commercial impact.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Link
                  href="#services-grid"
                  className="group inline-flex items-center gap-3 rounded-full bg-[#164E33] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(22,78,51,0.2)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#0C3823]"
                >
                  <span>Explore Capabilities</span>
                  <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                </Link>
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-3 rounded-full border border-[#164E33]/25 bg-white px-7 py-3.5 text-sm font-semibold text-[#164E33] transition-all duration-300 hover:-translate-y-1 hover:border-[#164E33] hover:shadow-md"
                >
                  <span>Request Custom Quote</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>

              {/* Quick Metrics Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[#164E33]/15 w-full">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#164E33]/10 text-[#164E33] shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold text-[#141915] leading-none">99.9%</p>
                    <p className="text-[11px] text-[#666C64] mt-0.5">SLA &amp; Uptime</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#164E33]/10 text-[#164E33] shrink-0">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold text-[#141915] leading-none">Full-Stack</p>
                    <p className="text-[11px] text-[#666C64] mt-0.5">Architecture</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#164E33]/10 text-[#164E33] shrink-0">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold text-[#141915] leading-none">100%</p>
                    <p className="text-[11px] text-[#666C64] mt-0.5">Modern Stack</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Animated Illustration with matching radial glows & floating glassmorphism badges */}
            <div className="relative flex items-center justify-center lg:col-span-6 xl:col-span-6">
              <div className="relative w-full max-w-[620px] aspect-[4/3] flex items-center justify-center">
                {/* Background radial glows */}
                <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-[#164E33]/20 blur-3xl sm:h-96 sm:w-96" />
                <div className="pointer-events-none absolute h-60 w-60 rounded-full bg-[#CCFF00]/30 blur-2xl sm:h-80 sm:w-80" />

                {/* 3D Animated Service Image */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/service.gif"
                    alt="Qubtic Digital Engineering Services"
                    width={540}
                    height={540}
                    unoptimized
                    priority
                    className="object-contain max-h-[460px] drop-shadow-[0_20px_45px_rgba(22,78,51,0.22)]"
                  />
                </div>

                {/* Glassmorphism Badge 1 - Top Right */}
                <div className="absolute top-4 right-2 sm:right-6 z-20 hidden sm:flex items-center gap-2.5 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold text-[#164E33] shadow-lg backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-[#CCFF00] shadow-[0_0_0_3px_rgba(204,255,0,0.4)]" />
                  Full-Cycle Engineering
                </div>

                {/* Glassmorphism Badge 2 - Bottom Left */}
                <div className="absolute bottom-6 left-2 sm:left-6 z-20 hidden sm:flex items-center gap-3 rounded-2xl border border-white/70 bg-white/85 p-3.5 shadow-xl backdrop-blur-md">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#164E33] text-white">
                    <Sparkles className="h-5 w-5 text-[#CCFF00]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#141915]">Production-Ready Code</p>
                    <p className="text-[10px] text-[#666C64]">Scalable &amp; High-Performance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 pt-16" id="services-grid">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0C3823] block mb-2">
            SPECIALIZED DISCIPLINES
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-[#141915] font-heading">
            Tailored Engineering Solutions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {services.map((service, index) => (
            <ServiceCard
              key={service.slug}
              title={service.title}
              description={service.shortDescription}
              icon={service.icon}
              slug={service.slug}
              index={index}
            />
          ))}
        </div>

        {/* Bottom CTA Block */}
        <div className="bg-[#0C3823] text-white rounded-[28px] md:rounded-[36px] p-10 sm:p-14 text-center shadow-xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase font-heading mb-4">
            Ready to Build Something Extraordinary?
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
            Schedule an architectural discovery session with our engineering leads to discuss your scope, tech stack, and roadmap.
          </p>
          <Button href="/contact" variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-[#0C3823]">
            <span>Start a Project</span>
            <ArrowUpRight className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
