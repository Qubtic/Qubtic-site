'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export interface TechLoaderProps {
  size?: 'inline' | 'sm' | 'md' | 'lg' | 'fullscreen';
  text?: string;
  className?: string;
}

export function TechLoader({
  size = 'md',
  text,
  className,
}: TechLoaderProps) {
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    if (size !== 'fullscreen') return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        const jump = Math.floor(Math.random() * 15) + 8;
        return Math.min(prev + jump, 98);
      });
    }, 180);
    return () => clearInterval(interval);
  }, [size]);

  // 1. INLINE LOADER (Buttons, small UI elements)
  if (size === 'inline') {
    return (
      <span className={cn('inline-flex items-center gap-2.5', className)}>
        <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
          <svg className="h-full w-full animate-spin text-[#CCFF00]" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-100"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="absolute h-1.5 w-1.5 rounded-full bg-[#CCFF00] shadow-[0_0_8px_#CCFF00]" />
        </span>
        {text && (
          <span className="font-mono text-xs font-semibold tracking-wider text-inherit">
            {text}
          </span>
        )}
      </span>
    );
  }

  // 2. FULLSCREEN CINEMATIC PRELOADER
  if (size === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center overflow-hidden bg-[#061C11] text-white select-none">
        {/* Ambient Studio Lighting / Radial Backdrop Glows */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-[38rem] w-[38rem] rounded-full bg-[#164E33]/40 blur-[140px]" />
        <div className="pointer-events-none absolute -right-32 -bottom-32 h-[38rem] w-[38rem] rounded-full bg-[#CCFF00]/12 blur-[150px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(22,78,51,0.25)_0%,transparent_70%)]" />

        {/* Subtle Cyber Grid Texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(#CCFF00 1px, transparent 1px), linear-gradient(90deg, #CCFF00 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Central Tech Module Container */}
        <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
          
          {/* THE TECH HOLDER / ORBITAL CORE */}
          <div className="relative flex items-center justify-center mb-8">
            {/* Ambient Aura Behind Core */}
            <div className="absolute h-36 w-36 rounded-full bg-[#CCFF00]/15 blur-2xl animate-pulse" />

            {/* Outer Reticle Ring with Rotating Dashes */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
              className="absolute h-32 w-32 rounded-full border border-dashed border-[#CCFF00]/25 pointer-events-none"
            />

            {/* Middle Precision Segment Ring (Counter-rotating) */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="absolute h-28 w-28 rounded-full border-t-2 border-r-2 border-transparent border-t-[#CCFF00]/80 border-r-[#CCFF00]/40 pointer-events-none shadow-[0_0_12px_rgba(204,255,0,0.2)]"
            />

            {/* Inner Pulsing Radar Track */}
            <motion.div
              animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="absolute h-20 w-20 rounded-full border border-[#164E33] bg-[#0C3823]/60 backdrop-blur-md shadow-inner"
            />

            {/* Corner Tech Framing Brackets */}
            <div className="absolute -inset-3 pointer-events-none">
              <span className="absolute top-0 left-0 h-2.5 w-2.5 border-t-2 border-l-2 border-[#CCFF00]/70" />
              <span className="absolute top-0 right-0 h-2.5 w-2.5 border-t-2 border-r-2 border-[#CCFF00]/70" />
              <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b-2 border-l-2 border-[#CCFF00]/70" />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2 border-[#CCFF00]/70" />
            </div>

            {/* Center Dynamic Brand Mark / Quantum Node */}
            <div className="relative z-10 flex h-20 w-20 items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  filter: [
                    'drop-shadow(0 0 10px rgba(204,255,0,0.5))',
                    'drop-shadow(0 0 20px rgba(204,255,0,0.8))',
                    'drop-shadow(0 0 10px rgba(204,255,0,0.5))',
                  ],
                }}
                transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                className="relative h-10 w-10"
              >
                <Image
                  src="/images/brand/qubtic-mark-white.png"
                  alt="Qubtic Core"
                  fill
                  priority
                  sizes="40px"
                  className="object-contain"
                />
              </motion.div>
            </div>
          </div>

          {/* Upper Micro Telemetry Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#164E33]/60 border border-[#CCFF00]/25 backdrop-blur-md mb-4 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CCFF00] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#CCFF00]" />
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#CCFF00]">
              QUBTIC CORE ENGINE · v2.6
            </span>
          </div>

          {/* Primary Status Title */}
          <h2 className="text-sm sm:text-base font-heading font-black uppercase tracking-[0.25em] text-white mb-4 drop-shadow-sm">
            {text || 'INITIALIZING QUBTIC STUDIO...'}
          </h2>

          {/* High-Tech Dynamic Progress Track Bar */}
          <div className="w-64 sm:w-72 mb-3">
            <div className="h-1.5 w-full bg-[#082417] rounded-full overflow-hidden border border-[#164E33]/70 p-px relative">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#164E33] via-[#CCFF00] to-[#FFFFFF] shadow-[0_0_12px_#CCFF00]"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut', duration: 0.3 }}
              />
            </div>
          </div>

          {/* Bottom Telemetry Metrics Readout */}
          <div className="flex items-center justify-between w-64 sm:w-72 font-mono text-[10px] text-[#666C64] uppercase tracking-wider">
            <span className="text-[#CCFF00]/70 flex items-center gap-1.5">
              <span className="inline-block h-1 w-1 rounded-full bg-[#CCFF00] animate-pulse" />
              <span>SYNCING DATA</span>
            </span>
            <span className="text-white font-bold">{progress}%</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. COMPONENT & MODAL EMBEDDED LOADERS (sm, md, lg)
  const dimensions = {
    sm: { container: 'h-12 w-12', core: 'h-6 w-6', text: 'text-[10px]', stroke: 1 },
    md: { container: 'h-16 w-16', core: 'h-8 w-8', text: 'text-xs', stroke: 1.5 },
    lg: { container: 'h-24 w-24', core: 'h-12 w-12', text: 'text-sm', stroke: 2 },
  };

  const currentDim = dimensions[size as 'sm' | 'md' | 'lg'] || dimensions.md;

  return (
    <div className={cn('flex flex-col items-center justify-center p-6 text-center select-none', className)}>
      {/* Tech Ring Holder */}
      <div className={cn('relative flex items-center justify-center mb-4', currentDim.container)}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-[#0C3823]/10 blur-md animate-pulse" />

        {/* Rotating Outer Dashed Orbit */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-dashed border-[#0C3823]/30 pointer-events-none"
        />

        {/* Counter Rotating Reticle Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          className="absolute inset-1 rounded-full border-t-2 border-transparent border-t-[#0C3823] pointer-events-none"
        />

        {/* Inner Pulsing Core */}
        <motion.div
          animate={{ scale: [0.92, 1.08, 0.92] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="relative flex items-center justify-center rounded-full bg-[#0C3823]/10 p-2 shadow-inner"
        >
          <span className="h-2 w-2 rounded-full bg-[#0C3823] shadow-[0_0_6px_rgba(12,56,35,0.4)]" />
        </motion.div>
      </div>

      {/* Status Text with Pulsing Radar Dot */}
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn('font-mono font-bold uppercase tracking-widest text-[#0C3823] flex items-center justify-center gap-2', currentDim.text)}
        >
          <span>{text}</span>
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0C3823] opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#0C3823]" />
          </span>
        </motion.div>
      )}
    </div>
  );
}

export default TechLoader;
