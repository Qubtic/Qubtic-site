'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TechLoader } from '@/components/ui/TechLoader';

export function SitePreloader() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // Check if session preloader already ran in current tab session
    const hasLoaded = sessionStorage.getItem('qubtic_preloader_seen');
    if (hasLoaded) {
      setShowLoader(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowLoader(false);
      sessionStorage.setItem('qubtic_preloader_seen', 'true');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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
