'use client';

import * as React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export function ExperienceLayer() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 130, damping: 28, restDelta: 0.001 });

  React.useEffect(() => {
    document.body.classList.remove('custom-cursor-active');
  }, []);

  return (
    <motion.div className="site-scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />
  );
}
