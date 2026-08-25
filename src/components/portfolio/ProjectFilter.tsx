'use client';

import { cn } from '@/lib/utils';

export type FilterCategory = 'All' | 'website' | 'saas' | 'shopify' | 'framer';

interface ProjectFilterProps {
  activeFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
}

const filters: { label: string; value: FilterCategory }[] = [
  { label: 'All Work', value: 'All' },
  { label: 'Websites', value: 'website' },
  { label: 'SaaS Platforms', value: 'saas' },
  { label: 'Shopify Apps', value: 'shopify' },
  { label: 'Framer Sites', value: 'framer' },
];

export default function ProjectFilter({ activeFilter, onFilterChange }: ProjectFilterProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-12">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            "px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300",
            activeFilter === filter.value
              ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
