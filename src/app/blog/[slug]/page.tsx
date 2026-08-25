import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getBlogDb, BlogPostItem } from '@/lib/store';
import { ArrowLeft, Clock, Calendar, User, Share2, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blogPosts = await getBlogDb();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return { title: 'Article Not Found' };

  return {
    title: `${post.title} - qubtic Insights`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blogPosts = await getBlogDb();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="pt-28 pb-24 md:pt-36 md:pb-32">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0C3823] hover:text-[#164E33] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Insights</span>
          </Link>
        </div>

        {/* Article Header */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0C3823]/5 border border-[#0C3823]/10 text-xs font-bold uppercase tracking-wider text-[#0C3823] mb-6">
            {post.category}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-[#141915] font-heading leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#666C64] font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#0C3823]" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#0C3823]" />
              <span>{post.readingTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#0C3823]" />
              <span>{post.author || 'qubtic Team'}</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {post.image && (
          <div className="max-w-4xl mx-auto mb-12 rounded-[28px] overflow-hidden aspect-[16/9] relative border border-[#E5E0D8] shadow-lg">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content Body */}
        <div className="max-w-3xl mx-auto">
          <div className="text-lg text-[#666C64] leading-relaxed mb-8 font-medium border-l-2 border-[#0C3823] pl-6 italic">
            {post.excerpt}
          </div>

          <div className="prose prose-lg max-w-none text-[#141915] space-y-6 leading-relaxed">
            {post.content ? (
              <div className="whitespace-pre-line text-base sm:text-lg text-[#333]">
                {post.content}
              </div>
            ) : (
              <p>
                In today&apos;s fast-moving software and e-commerce environment, having the right architectural foundation is critical.
                From choosing the optimal rendering strategy to optimizing edge networks, our engineering team continuously experiments
                with the highest standards in digital development.
              </p>
            )}
          </div>

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t border-[#E5E0D8] flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wider text-[#141915]">
              Share this Insight
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="p-2.5 rounded-full bg-white border border-[#E5E0D8] text-[#0C3823] hover:bg-[#0C3823] hover:text-white transition-colors"
                title="Share Article"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="max-w-5xl mx-auto mt-20 pt-16 border-t border-[#E5E0D8]">
            <h3 className="text-2xl font-bold uppercase font-heading text-[#141915] mb-8 text-center">
              Related Perspectives
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedPosts.map((rPost) => (
                <Link
                  key={rPost.slug}
                  href={`/blog/${rPost.slug}`}
                  className="group bg-white border border-[#E5E0D8] rounded-[24px] p-6 hover:shadow-xl hover:border-[#0C3823]/30 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0C3823] block mb-2">
                      {rPost.category}
                    </span>
                    <h4 className="text-xl font-bold uppercase font-heading text-[#141915] group-hover:text-[#0C3823] transition-colors mb-3 leading-snug">
                      {rPost.title}
                    </h4>
                    <p className="text-xs text-[#666C64] line-clamp-2 mb-4 leading-relaxed">
                      {rPost.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[#0C3823] pt-4 border-t border-[#E5E0D8]/60">
                    <span>{rPost.readingTime}</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
