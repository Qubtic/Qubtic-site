import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  darkTheme?: boolean;
  className?: string;
}

export function SectionHeading({
  badge,
  title,
  subtitle,
  align = 'left',
  darkTheme = false,
  className,
}: SectionHeadingProps) {
  const alignment = {
    left: 'text-left items-start',
    center: 'text-center items-center mx-auto',
    right: 'text-right items-end ml-auto',
  };

  return (
    <div className={cn('flex flex-col gap-3 mb-10 md:mb-14', alignment[align], className)}>
      {badge && (
        <Badge variant={darkTheme ? 'subtle' : 'forest'} className="mb-1">
          {badge}
        </Badge>
      )}
      <h2
        className={cn(
          'text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight uppercase font-heading',
          darkTheme ? 'text-white' : 'text-[#141915]'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'text-base md:text-lg max-w-2xl font-normal leading-relaxed',
            darkTheme ? 'text-white/80' : 'text-[#666C64]'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
