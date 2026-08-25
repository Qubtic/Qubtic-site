'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, Clock, Calendar, Sparkles, BookOpen } from 'lucide-react';
import { BlogPostItem } from '@/lib/store';
import { CloudImage } from '@/components/ui/CloudImage';

interface BlogClientProps {
  initialPosts: BlogPostItem[];
}

export function BlogClient({ initialPosts }: BlogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', ...Array.from(new Set(initialPosts.map((p) => p.category)))];

  const filteredPosts = initialPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = initialPosts[0];
  const gridPosts = selectedCategory === 'All' && !searchQuery ? filteredPosts.slice(1) : filteredPosts;

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Category Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 bg-white border border-[#E5E0D8] rounded-[24px] p-3 sm:p-4 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-[#0C3823] text-white shadow-sm'
                    : 'bg-[#F0EDE5] text-[#141915] hover:bg-[#E5E0D8]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666C64] pointer-events-none" />
          <input
            type="text"
            placeholder="Search insights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#F0EDE5] border border-[#E5E0D8] text-xs text-[#141915] placeholder:text-[#666C64] focus:outline-none focus:border-[#0C3823] transition-colors"
          />
        </div>
      </div>

      {/* Featured Story Hero Card (Only when showing All and no search) */}
      {selectedCategory === 'All' && !searchQuery && featuredPost && (
        <div className="relative overflow-hidden rounded-[32px] bg-[#082417] text-white border border-[#164E33]/40 shadow-2xl p-6 sm:p-10 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            {/* Image Column */}
            <div className="lg:col-span-6 relative aspect-[16/10] rounded-[24px] overflow-hidden border border-white/10 shadow-lg group">
              <CloudImage
                src={featuredPost.image || '/images/hero-banner.jpg'}
                alt={featuredPost.title}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                crop={{ type: 'auto', source: true }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#082417]/80 via-transparent to-transparent" />
              <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFF00] text-[#0C3823] text-[10px] font-mono font-bold uppercase tracking-widest shadow-md">
                <Sparkles className="w-3 h-3" />
                Featured Story
              </span>
            </div>

            {/* Text Content Column */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-bold uppercase tracking-wider text-[#CCFF00]">
                  {featuredPost.category}
                </span>
                <div className="flex items-center gap-2 text-xs text-white/60 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{featuredPost.readingTime}</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase font-heading leading-tight tracking-tight text-white">
                {featuredPost.title}
              </h2>

              <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal line-clamp-3">
                {featuredPost.excerpt}
              </p>

              <div className="pt-4 flex items-center justify-between border-t border-white/15">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#CCFF00] text-[#0C3823] flex items-center justify-center font-bold text-xs font-heading">
                    QC
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{featuredPost.author || 'qubtic Solutions Team'}</p>
                    <p className="text-[11px] text-white/60">{featuredPost.date}</p>
                  </div>
                </div>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="px-5 py-2.5 rounded-full bg-[#CCFF00] text-[#0C3823] text-xs font-bold uppercase tracking-wider hover:bg-white transition-all inline-flex items-center gap-2 shadow-md group/btn"
                >
                  <span>Read Story</span>
                  <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Cards Grid */}
      {gridPosts.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white rounded-[28px] border border-[#E5E0D8]">
          <BookOpen className="w-12 h-12 text-[#666C64]/40 mx-auto" />
          <h3 className="text-lg font-bold text-[#141915]">No matching insights found</h3>
          <p className="text-xs text-[#666C64]">Try adjusting your search query or selecting a different category tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {gridPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col h-full overflow-hidden bg-white border border-[#E5E0D8] rounded-[28px] shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:border-[#0C3823] hover:shadow-[0_20px_50px_rgba(12,56,35,0.12)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5"
            >
              {/* Image Banner */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#F0EDE5]">
                <CloudImage
                  src={post.image || '/images/services-showcase.jpg'}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-[1.035] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  crop={{ type: 'auto', source: true }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#0C3823] shadow-xs">
                    {post.category}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-white/90">
                  {post.readingTime}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 flex flex-1 flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#666C64]">
                    <Calendar className="w-3.5 h-3.5 text-[#0C3823]" />
                    <span>{post.date}</span>
                    <span>·</span>
                    <span className="font-semibold text-[#141915]">{post.author || 'qubtic Studio'}</span>
                  </div>

                  <h3 className="text-xl font-bold text-[#141915] font-heading leading-snug group-hover:text-[#0C3823] transition-colors duration-300">
                    {post.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#666C64] leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                {/* Footer Link */}
                <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#0C3823]">
                  <span>Read Article</span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0C3823] text-[#CCFF00] group-hover:bg-[#CCFF00] group-hover:text-[#0C3823] transition-all duration-500 shadow-xs">
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
export default BlogClient;
