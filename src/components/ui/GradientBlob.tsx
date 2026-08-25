import * as React from 'react';
import { cn } from '@/lib/utils';

export interface GradientBlobProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: 'blue' | 'purple' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
}

export function GradientBlob({
  className,
  color = 'blue',
  size = 'md',
  ...props
}: GradientBlobProps) {
  const colors = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500',
  };

  const sizes = {
    sm: 'w-64 h-64',
    md: 'w-96 h-96',
    lg: 'w-[500px] h-[500px]',
  };

  return (
    <div
      className={cn(
        'absolute rounded-full opacity-20 blur-3xl animate-pulse-slow',
        colors[color],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
