'use client';

import * as React from 'react';
import { useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface AnimatedCounterProps extends React.HTMLAttributes<HTMLSpanElement> {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  duration = 2000,
  className,
  ...props
}: AnimatedCounterProps) {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  React.useEffect(() => {
    if (isInView) {
      let startTime: number;
      let animationFrame: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);
        
        // Easing function: easeOutExpo
        const easeProgress = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
        
        setCount(Math.floor(easeProgress * target));

        if (percentage < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationFrame);
    }
  }, [isInView, target, duration]);

  const formattedCount = count.toLocaleString();

  return (
    <span ref={ref} className={cn('inline-block', className)} {...props}>
      {prefix}
      {formattedCount}
      {suffix}
    </span>
  );
}
