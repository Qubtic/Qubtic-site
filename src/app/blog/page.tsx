import Image from 'next/image';
import { getBlogDb } from '@/lib/store';
import { BlogClient } from '@/components/blog/BlogClient';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Insights & Technical Blog | Qubtic Digital Product Studio',
  description:
    'Deep dives and technical insights on full-stack SaaS architecture, Shopify apps, and modern web engineering by the Qubtic team.',
  alternates: {
    canonical: 'https://qubtic.tech/blog',
  },
};

export default async function BlogPage() {
  const blogPosts = await getBlogDb();

  return (
    <div className="pt-28 pb-24 md:pt-36 md:pb-32">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        {/* Modern Studio 2-Column Hero Section with 3D Image */}
        <div className="relative mb-14 overflow-hidden rounded-[36px] bg-[#F4EFE6] border border-[#E5E0D8] p-8 sm:p-12 md:p-14 shadow-sm warm-ambient-bg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Text Column */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0C3823] text-white text-xs font-mono font-bold uppercase tracking-widest shadow-xs">
                ENGINEERING &amp; DESIGN INSIGHTS
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight text-[#141915] font-heading leading-[1.05]">
                LATEST INSIGHTS
              </h1>

              <p className="text-base sm:text-lg text-[#6E736D] leading-relaxed max-w-xl">
                In-depth perspectives on modern web frameworks, SaaS product engineering, e-commerce development, and conversion design.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider text-[#0C3823]">
                <div className="flex items-center gap-2 bg-white/80 border border-[#E5E0D8] px-4 py-2 rounded-full shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-[#CCFF00] animate-pulse" />
                  <span>5+ Published Guides</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 border border-[#E5E0D8] px-4 py-2 rounded-full shadow-xs">
                  <span>Weekly Technical Writeups</span>
                </div>
              </div>
            </div>

            {/* Right 3D Illustration Column */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-[4/3] rounded-[28px] overflow-hidden drop-shadow-xl">
                <Image
                  src="/images/blog-hero-3d.png"
                  alt="Qubtic Blog Engineering Insights"
                  fill
                  priority
                  className="object-contain hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Client Component with Search, Category Tabs, Featured Hero, and Grid */}
        <BlogClient initialPosts={blogPosts} />

        {/* Newsletter Signup Banner */}
        <div className="mt-24 bg-[#0C3823] text-white rounded-[28px] md:rounded-[36px] p-10 sm:p-14 text-center max-w-4xl mx-auto shadow-xl border border-[#164E33]/40">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#CCFF00] block mb-2">
            STAY AHEAD OF THE CURVE
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold uppercase font-heading mb-4">
            Subscribe to qubtic Engineering Insights
          </h3>
          <p className="text-white/80 max-w-lg mx-auto mb-8 text-sm leading-relaxed">
            Get monthly technical writeups on Next.js performance, SaaS architecture, and conversion UI/UX delivered directly to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-sm focus:outline-none focus:border-[#CCFF00] flex-1"
            />
            <Button variant="lime" size="md">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
