'use client';

import Link from 'next/link';
import { ArrowUpRight, Globe, Layers, ShoppingBag, Palette } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Globe,
  Layers,
  ShoppingBag,
  Palette,
};

interface ServiceCardProps {
  title: string;
  description: string;
  icon: string;
  slug: string;
  index: number;
}

export default function ServiceCard({ title, description, icon, slug }: ServiceCardProps) {
  const Icon = iconMap[icon] || Globe;

  return (
    <Link
      href={`/services/${slug}`}
      className="group block h-full p-8 rounded-[28px] bg-white border border-[#E5E0D8] hover:border-[#0C3823] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <div className="w-12 h-12 rounded-2xl bg-[#0C3823]/10 flex items-center justify-center text-[#0C3823] mb-6 group-hover:bg-[#0C3823] group-hover:text-white transition-colors">
          <Icon className="w-6 h-6" />
        </div>

        <h3 className="text-2xl font-bold text-[#141915] font-heading mb-3 leading-snug">
          {title}
        </h3>

        <p className="text-[#666C64] leading-relaxed text-sm mb-8 font-normal">
          {description}
        </p>
      </div>

      <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#0C3823] group-hover:text-[#164E33]">
        <span>Explore Service</span>
        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </div>
    </Link>
  );
}
