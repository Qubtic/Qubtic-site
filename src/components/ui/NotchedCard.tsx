'use client';

import * as React from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotchedCardProps {
  image: string;
  alt: string;
  aspectRatio?: 'square' | 'video' | '4/3';
  showButton?: boolean;
  className?: string;
}

export function NotchedCard({
  image,
  alt,
  aspectRatio = '4/3',
  showButton = true,
  className,
}: NotchedCardProps) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-[16/10]',
    '4/3': 'aspect-[4/3]',
  };

  return (
    <div
      className={cn(
        'relative rounded-[24px] sm:rounded-[28px] overflow-visible bg-transparent border-0 shadow-none select-none',
        aspectClasses[aspectRatio],
        className
      )}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[23px] sm:rounded-[27px]">
        <Image
          src={image}
          alt={alt}
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      {/* Pixel-Perfect Bottom-Right Cutout Notch with Neon Button (Matching Image 1 & 2) */}
      {showButton && (
        <div className="absolute -bottom-[1px] -right-[1px] z-10 pointer-events-auto">
          <div className="relative w-[5.5rem] h-[5.5rem] sm:w-24 sm:h-24">
            {/* SVG Mask Background creating the smooth organic inverted fillet curve */}
            <svg
              className="w-full h-full fill-[#F4EFE6] block"
              viewBox="0 0 96 96"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M96 0H66C66 22 55 35 37 35C18 35 17 49 17 66C17 82 11 90 0 90V96H96V0Z" />
            </svg>

            {/* Vibrant Neon Lime Circular Action Button */}
            <div className="absolute bottom-1 right-5">
              <div className="w-12 h-12 rounded-full bg-[#B6FF1E] hover:bg-[#9EFF00] text-[#141915] flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:rotate-12 cursor-pointer">
                <ArrowUpRight className="w-6 h-6 stroke-[1.8]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
