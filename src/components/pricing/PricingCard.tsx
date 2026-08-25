import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import Link from 'next/link';

interface Feature {
  name: string;
  included: boolean;
}

interface PricingCardProps {
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: Feature[];
  isPopular?: boolean;
  ctaText: string;
  ctaHref: string;
}

export function PricingCard({
  name,
  price,
  originalPrice,
  description,
  features,
  isPopular,
  ctaText,
  ctaHref,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col h-full bg-white border rounded-[28px] p-8 transition-all duration-300 hover:shadow-xl',
        isPopular
          ? 'border-[#0C3823] ring-2 ring-[#0C3823] shadow-lg lg:-mt-4 lg:mb-4 bg-white'
          : 'border-[#E5E0D8]'
      )}
    >
      {isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="bg-[#0C3823] text-white text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-[#141915] font-heading mb-2">{name}</h3>
        <p className="text-sm text-[#666C64] leading-relaxed">{description}</p>
      </div>

      <div className="mb-8 pb-6 border-b border-[#E5E0D8]">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl sm:text-5xl font-bold text-[#141915] font-heading">
            ${price.toLocaleString()}
          </span>
          <span className="text-sm font-semibold text-[#666C64]">/project</span>
        </div>
        {originalPrice && (
          <div className="text-xs text-[#9EA39C] line-through mt-1">
            Regular ${originalPrice.toLocaleString()}
          </div>
        )}
      </div>

      <ul className="space-y-3.5 mb-8 flex-grow">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="shrink-0 mt-0.5">
              {feature.included ? (
                <Check className="w-4 h-4 text-[#0C3823]" />
              ) : (
                <X className="w-4 h-4 text-[#9EA39C]" />
              )}
            </span>
            <span
              className={cn(
                'text-sm font-medium leading-tight',
                feature.included ? 'text-[#141915]' : 'text-[#9EA39C] line-through'
              )}
            >
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={cn(
          'w-full py-3.5 px-6 rounded-full font-bold text-center text-sm transition-all duration-200 block shadow-xs',
          isPopular
            ? 'bg-[#0C3823] text-white hover:bg-[#164E33]'
            : 'bg-[#141915] text-white hover:bg-[#0C3823]'
        )}
      >
        {ctaText}
      </Link>
    </div>
  );
}
