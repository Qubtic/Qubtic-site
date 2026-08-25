'use client';

import { useEffect, useRef, useState } from 'react';
import lottie, { AnimationItem } from 'lottie-web';

export function NotFoundAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    fetch('/animations/404-animation.json')
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
        console.error('Failed to load 404 Lottie animation:', err);
        setLoading(false);
      });

    return () => {
      if (animRef.current) {
        animRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-[540px] aspect-[4/3] mx-auto flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-[#0C3823]/20 border-t-[#0C3823] rounded-full animate-spin" />
        </div>
      )}
      <div ref={containerRef} className="w-full h-full drop-shadow-md" />
    </div>
  );
}
