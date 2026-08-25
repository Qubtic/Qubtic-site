'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'forest' | 'dark' | 'outline' | 'ghost' | 'lime';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}

export function Button({
  variant = 'dark',
  size = 'md',
  href,
  target,
  rel,
  children,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    dark: 'bg-[#141915] text-white hover:bg-[#0C3823] shadow-sm',
    forest: 'bg-[#0C3823] text-white hover:bg-[#164E33] shadow-sm',
    primary: 'bg-[#0C3823] text-white hover:bg-[#164E33] shadow-sm',
    outline: 'border border-[#141915] text-[#141915] bg-transparent hover:bg-[#141915] hover:text-white',
    ghost: 'text-[#141915] hover:bg-[#E5E0D8]/40',
    lime: 'bg-[#CCFF00] text-[#141915] hover:bg-[#B3E600] font-semibold',
  };

  const sizes = {
    sm: 'text-xs px-4 py-2 gap-1.5',
    md: 'text-sm px-6 py-2.5 gap-2',
    lg: 'text-base px-8 py-3.5 gap-2.5',
  };

  const combinedClassName = cn(baseStyles, variants[variant], sizes[size], className);

  if (href) {
    return (
      <Link
        href={href}
        target={target}
        rel={target === '_blank' ? (rel || 'noopener noreferrer') : rel}
        className={combinedClassName}
      >
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}
