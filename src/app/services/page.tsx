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
  title: 'Our Services - Custom Web & Software Development',
  description:
    'End-to-end digital solutions including Web Development, SaaS Product Engineering, Shopify Apps, and Framer Development.',
};

export default async function ServicesPage() {
  const services = await getServicesDb();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: services.map((s, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://qubtic.com/services/${s.slug}`,
      name: s.title,
      description: s.shortDescription,
    })),
  };

  return (
    <div className="pt-32 pb-24 md:pt-36 md:pb-32 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[34rem] w-[34rem] rounded-full bg-[#164E33]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-20 h-[34rem] w-[34rem] rounded-full bg-[#CCFF00]/15 blur-[120px]" />

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10">
        
        {/* Split Hero Section featuring Animated service.gif */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-20 lg:mb-24">
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="mb-4 flex items-center justify-start gap-3 select-none">
              <span className="h-px w-10 bg-[#164E33]/30" />
              <span className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-[#164E33]">
                ENGINEERING CAPABILITIES
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold uppercase tracking-tight text-[#141915] font-heading leading-[1.02] mb-6">
              End-To-End Digital <span className="text-[#164E33]">Product Engineering</span>
            </h1>

            <p className="text-base sm:text-lg text-[#666C64] leading-relaxed font-normal max-w-2xl mb-8">
              We architect, design, and engineer mission-critical digital systems. From high-converting web applications to multi-tenant SaaS platforms and bespoke Shopify extensions, our code is built for speed, resilience, and maximum commercial impact.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button href="#services-grid" variant="primary" size="lg">
                <span>Explore Capabilities</span>
                <ArrowDown className="w-4 h-4" />
              </Button>
              <Button href="/contact" variant="outline" size="lg">
                <span>Request Custom Quote</span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-[36px] overflow-hidden border border-[#E5E0D8] bg-[#F4EFE6]/60 p-4 shadow-xl flex items-center justify-center">
              <Image
                src="/images/service.gif"
                alt="Qubtic Digital Engineering Services"
                width={500}
                height={500}
                unoptimized
                className="w-full h-full object-contain rounded-[28px]"
                priority
              />
            </div>
          </div>
        </div>

        {/* Services Grid Section */}
        <div id="services-grid" className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0C3823] block mb-2 font-mono">
              SPECIALIZED DISCIPLINES
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-[#141915] font-heading">
              Tailored Engineering Solutions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
