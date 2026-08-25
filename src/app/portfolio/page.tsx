import { Metadata } from 'next';
import WorkHeroSection from '@/components/portfolio/WorkHeroSection';
import WorkProcessSection from '@/components/portfolio/WorkProcessSection';
import PortfolioGallery from '@/components/portfolio/PortfolioGallery';
import { Button } from '@/components/ui/Button';
import { ArrowUpRight } from 'lucide-react';
import { getProjectsDb } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Our Work - Portfolio & Case Studies',
  description:
    'Explore featured case studies and digital products engineered by Qubtic across web apps, SaaS, Shopify, and Framer.',
};

export default async function PortfolioPage() {
  const storeProjects = await getProjectsDb();

  const projectsData = storeProjects.map((p) => ({
    title: p.title,
    category: p.category,
    slug: p.slug,
    metric: p.metric || '',
    shortDescription: p.shortDescription,
    techStack: p.techStack || [],
  }));

  return (
    <div className="pb-24 md:pb-32">
      {/* Hero Section featuring 3D Team Graphic */}
      <WorkHeroSection />

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 pt-16" id="case-studies">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0C3823] block mb-2">
            FEATURED PORTFOLIO
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-[#141915] font-heading mb-4">
            Explore Case Studies
          </h2>
          <p className="text-base sm:text-lg text-[#666C64] leading-relaxed">
            Filter by category or technology stack to view comprehensive breakdowns of client challenges, technical architecture, and results.
          </p>
        </div>

        {/* Interactive Gallery */}
        <div className="mb-16">
          <PortfolioGallery initialProjects={projectsData} />
        </div>

        {/* Collaborative Process Section */}
        <WorkProcessSection />

        {/* Bottom CTA Block */}
        <div className="bg-[#0C3823] text-white rounded-[28px] md:rounded-[36px] p-10 sm:p-14 text-center shadow-xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase font-heading mb-4">
            Have a Project in Mind?
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
            Let&apos;s build a digital product that elevates your brand and accelerates measurable growth.
          </p>
          <Button href="/contact" variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-[#0C3823]">
            <span>Start a Project With Us</span>
            <ArrowUpRight className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
