'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface LumaSpinProps {
  className?: string;
  size?: number; // width/height in px, default 65
  color?: string; // shadow color
  strokeWidth?: number;
}

export const LumaSpin: React.FC<LumaSpinProps> = ({
  className,
  size = 65,
  color,
  strokeWidth,
}) => {
  const borderWidth = strokeWidth || Math.max(3, Math.round(size * 0.05));

  return (
    <div
      className={cn('relative aspect-square flex items-center justify-center shrink-0 select-none pointer-events-none', className)}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <span
        className="absolute rounded-[50px] luma-spin-anim shadow-[inset_0_0_0_3px] text-[#0C3823]"
        style={{
          boxShadow: color ? `inset 0 0 0 ${borderWidth}px ${color}` : `inset 0 0 0 ${borderWidth}px currentColor`,
        }}
      />
      <span
        className="absolute rounded-[50px] luma-spin-anim luma-spin-delay shadow-[inset_0_0_0_3px] text-[#0C3823]"
        style={{
          boxShadow: color ? `inset 0 0 0 ${borderWidth}px ${color}` : `inset 0 0 0 ${borderWidth}px currentColor`,
        }}
      />
    </div>
  );
};

export const Component = LumaSpin;
export default LumaSpin;
