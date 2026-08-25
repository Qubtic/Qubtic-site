import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'forest' | 'lime' | 'outline' | 'subtle';
  children: React.ReactNode;
}

export function Badge({
  variant = 'default',
  children,
  className,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full tracking-wide uppercase transition-colors';

  const variants = {
    default: 'bg-[#F0EDE5] text-[#141915] border border-[#E5E0D8]',
    forest: 'bg-[#0C3823]/10 text-[#0C3823] border border-[#0C3823]/20',
    lime: 'bg-[#CCFF00] text-[#141915] font-bold',
    outline: 'border border-[#141915] text-[#141915]',
    subtle: 'bg-white/80 backdrop-blur-sm text-[#141915] border border-[#E5E0D8] shadow-xs',
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
