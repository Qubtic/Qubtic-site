'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TechLoader } from '@/components/ui/TechLoader';

const emptySubscribe = () => () => {};

export function SitePreloader() {
  const isPreloaderSeen = React.useSyncExternalStore(
    emptySubscribe,
    () => sessionStorage.getItem('qubtic_preloader_seen') === 'true',
    () => true
  );
  const [timerExpired, setTimerExpired] = useState(false);

  useEffect(() => {
    if (isPreloaderSeen) return;

    const timer = setTimeout(() => {
      setTimerExpired(true);
      try {
        sessionStorage.setItem('qubtic_preloader_seen', 'true');
      } catch {
        // Ignore storage exceptions
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isPreloaderSeen]);

  const showLoader = !isPreloaderSeen && !timerExpired;

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          key="site-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(12px)' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[999999] pointer-events-auto"
        >
          <TechLoader size="fullscreen" text="INITIALIZING QUBTIC STUDIO..." />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SitePreloader;
