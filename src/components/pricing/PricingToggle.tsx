'use client';

import { cn } from '@/lib/utils';

interface PricingToggleProps {
  isAnnual: boolean;
  onToggle: (value: boolean) => void;
}

export function PricingToggle({ isAnnual, onToggle }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="bg-[#F0EDE5] border border-[#E5E0D8] p-1.5 rounded-full flex items-center shadow-inner">
        <button
          onClick={() => onToggle(false)}
          className={cn(
            'px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer',
            !isAnnual
              ? 'bg-[#141915] text-white shadow-xs'
              : 'text-[#666C64] hover:text-[#141915]'
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => onToggle(true)}
          className={cn(
            'px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2',
            isAnnual
              ? 'bg-[#0C3823] text-white shadow-xs'
              : 'text-[#666C64] hover:text-[#141915]'
          )}
        >
          <span>Annual Plan</span>
          <span className="bg-[#CCFF00] text-[#141915] text-[10px] font-black px-2 py-0.5 rounded-full">
            SAVE 20%
          </span>
        </button>
      </div>
    </div>
  );
}
