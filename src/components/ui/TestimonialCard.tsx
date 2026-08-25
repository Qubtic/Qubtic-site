import * as React from 'react';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface TestimonialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  avatarUrl?: string;
}

export function TestimonialCard({
  quote,
  author,
  role,
  company,
  rating,
  avatarUrl,
  className,
  ...props
}: TestimonialCardProps) {
  return (
    <div
      className={cn(
        'min-w-[300px] md:min-w-[400px] p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex flex-col',
        className
      )}
      {...props}
    >
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'w-5 h-5',
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-white/20'
            )}
          />
        ))}
      </div>
      <blockquote className="flex-1 text-slate-300 italic mb-6">
        "{quote}"
      </blockquote>
      <div className="flex items-center gap-4 mt-auto">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={author}
            width={48}
            height={48}
            className="rounded-full w-12 h-12 object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
            {author.charAt(0)}
          </div>
        )}
        <div>
          <div className="text-white font-semibold">{author}</div>
          <div className="text-slate-400 text-sm">
            {role} at {company}
          </div>
        </div>
      </div>
    </div>
  );
}
