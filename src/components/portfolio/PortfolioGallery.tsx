'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ProjectCard from '@/components/portfolio/ProjectCard';

interface Project {
  title: string;
  category: string;
  slug: string;
  shortDescription: string;
  metric?: string;
  techStack?: string[];
  image?: string;
  liveUrl?: string;
}

interface PortfolioGalleryProps {
  initialProjects: Project[];
}

export default function PortfolioGallery({ initialProjects }: PortfolioGalleryProps) {
  const [filter, setFilter] = useState<string>('all');
  const [selectedTech, setSelectedTech] = useState<string>('all');

  // Extract all unique tech tags
  const allTechs = Array.from(
    new Set(initialProjects.flatMap((p) => p.techStack || []))
  );

  const filteredProjects = initialProjects.filter((project) => {
    const matchesCategory = filter === 'all' || project.category === filter;
    const matchesTech =
      selectedTech === 'all' || (project.techStack && project.techStack.includes(selectedTech));
    return matchesCategory && matchesTech;
  });

  const filterOptions = [
    { label: 'All Projects', value: 'all' },
    { label: 'Web Applications', value: 'website' },
    { label: 'SaaS Platforms', value: 'saas' },
    { label: 'Shopify Apps', value: 'shopify' },
    { label: 'Framer Sites', value: 'framer' },
  ];

  return (
    <div>
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2.5 mb-6">
        {filterOptions.map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              filter === item.value
                ? 'bg-[#141915] text-white shadow-xs'
                : 'bg-white text-[#666C64] border border-[#E5E0D8] hover:bg-[#F0EDE5]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tech Stack Sub-filters */}
      <div className="flex flex-wrap justify-center items-center gap-2 mb-14">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#6E736D] mr-2">
          Filter by Tech:
        </span>
        <button
          onClick={() => setSelectedTech('all')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            selectedTech === 'all'
              ? 'bg-[#0C3823] text-white'
              : 'bg-[#F0EDE5] text-[#666C64] hover:text-[#141915]'
          }`}
        >
          All Tech
        </button>
        {allTechs.map((tech) => (
          <button
            key={tech}
            onClick={() => setSelectedTech(tech === selectedTech ? 'all' : tech)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedTech === tech
                ? 'bg-[#0C3823] text-white'
                : 'bg-[#F0EDE5] text-[#666C64] hover:text-[#141915]'
            }`}
          >
            {tech}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => {
            const originalIndex = initialProjects.findIndex((item) => item.slug === project.slug);
            return (
              <ProjectCard
                key={project.slug}
                title={project.title}
                category={project.category}
                slug={project.slug}
                shortDescription={project.shortDescription}
                metric={project.metric}
                techStack={project.techStack}
                image={project.image}
                liveUrl={project.liveUrl}
                index={originalIndex}
              />
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
