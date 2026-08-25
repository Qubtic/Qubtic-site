'use client';

import { useEffect, useRef, useState } from 'react';
import lottie, { AnimationItem } from 'lottie-web';

export function PricingAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    fetch('/animations/pricing-animation.json')
      .then((res) => res.json())
      .then((animationData) => {
        if (!containerRef.current) return;

        if (animRef.current) {
          animRef.current.destroy();
        }

        animRef.current = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData,
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load Pricing Lottie animation:', err);
        setLoading(false);
      });

    return () => {
      if (animRef.current) {
        animRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-[500px] aspect-square mx-auto flex items-center justify-center pointer-events-none">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-[#0C3823]/20 border-t-[#0C3823] rounded-full animate-spin" />
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
