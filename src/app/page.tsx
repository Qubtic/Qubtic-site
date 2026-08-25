import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import BestProjectSection from '@/components/home/BestProjectSection';
import ServicesOverview from '@/components/home/ServicesOverview';
import LatestInsightSection from '@/components/home/LatestInsightSection';
import CTASection from '@/components/home/CTASection';
import { getSettingsDb } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Qubtic | Premier Digital Product Studio & Software Engineering',
  description:
    'Qubtic is an engineering-first digital product studio building high-performance web applications, custom SaaS platforms, Shopify applications, and Framer digital experiences.',
  alternates: {
    canonical: 'https://qubtic.tech',
  },
};

export default async function Home() {
  const settings = await getSettingsDb();

  return (
    <>
      <HeroSection settings={settings} />

      {/* Editorial Quote Statement Block */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg sm:text-xl md:text-2xl text-[#141915] font-normal leading-relaxed">
            &ldquo;People build websites, develop brands, and build shops selling stuff. A better internet, for people, one site at a time. We work better and more efficiently than others.&rdquo;
          </p>
        </div>
      </section>

      {/* BEST PROJECT Section */}
      <BestProjectSection />

      {/* OUR SERVICES Section */}
      <ServicesOverview />

      {/* LATEST INSIGHT Section */}
      <LatestInsightSection />

      {/* READY TO WORK WITH US? Section */}
      <CTASection />
    </>
  );
}
