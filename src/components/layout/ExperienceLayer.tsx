'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring } from 'framer-motion';

const interactiveSelector = 'a, button, [role="button"], [data-cursor="interactive"], input[type="submit"], input[type="button"]';
const textInputSelector = 'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"]';

export function ExperienceLayer() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [interactive, setInteractive] = React.useState(false);
  const [overInput, setOverInput] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  // Exact hardware mouse position (0ms latency for the dot)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // High-frequency responsive springs for fluid, snappy follower elements (no sluggish drag)
  const ringX = useSpring(cursorX, { stiffness: 650, damping: 38, mass: 0.1 });
  const ringY = useSpring(cursorY, { stiffness: 650, damping: 38, mass: 0.1 });

  const glowX = useSpring(cursorX, { stiffness: 350, damping: 32, mass: 0.2 });
  const glowY = useSpring(cursorY, { stiffness: 350, damping: 32, mass: 0.2 });

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 130, damping: 28, restDelta: 0.001 });

  React.useEffect(() => {
    const pointerQuery = window.matchMedia('(pointer: fine)');
    const updatePointerMode = () => setEnabled(pointerQuery.matches && !reduceMotion);
    updatePointerMode();
    pointerQuery.addEventListener('change', updatePointerMode);
    return () => pointerQuery.removeEventListener('change', updatePointerMode);
  }, [reduceMotion]);

  React.useEffect(() => {
    if (!enabled) {
      document.body.classList.remove('custom-cursor-active');
      return;
    }

    document.body.classList.add('custom-cursor-active');

    // Pointer move ONLY updates motion values (zero React re-renders, 120fps+ GPU performance)
    const handlePointerMove = (event: PointerEvent) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
      if (!visible) setVisible(true);
    };

    // Separate hover tracking via event delegation - runs only on element boundary crossings
    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const isInput = Boolean(target.closest(textInputSelector));
      const isInteractive = isInput ? false : Boolean(target.closest(interactiveSelector));

      setInteractive((prev) => (prev !== isInteractive ? isInteractive : prev));
      setOverInput((prev) => (prev !== isInput ? isInput : prev));
    };

    const handlePointerOut = (event: PointerEvent) => {
      const related = event.relatedTarget instanceof Element ? event.relatedTarget : null;
      if (!related) {
        setInteractive(false);
        setOverInput(false);
        return;
      }

      const isInput = Boolean(related.closest(textInputSelector));
      const isInteractive = isInput ? false : Boolean(related.closest(interactiveSelector));

      setInteractive((prev) => (prev !== isInteractive ? isInteractive : prev));
      setOverInput((prev) => (prev !== isInput ? isInput : prev));
    };

    const handlePointerLeave = () => setVisible(false);
    const handlePointerEnter = () => setVisible(true);
    const handlePointerDown = () => setPressed(true);
    const handlePointerUp = () => setPressed(false);

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    window.addEventListener('pointerout', handlePointerOut, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('pointerenter', handlePointerEnter);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerover', handlePointerOver);
      window.removeEventListener('pointerout', handlePointerOut);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('pointerenter', handlePointerEnter);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [cursorX, cursorY, enabled, visible]);

  return (
    <>
      <motion.div className="site-scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />

      {enabled && (
        <>
          <motion.div
            className="cursor-ambient-glow"
            style={{
              x: glowX,
              y: glowY,
              translateX: '-50%',
              translateY: '-50%',
            }}
            animate={{ opacity: visible ? 1 : 0 }}
            transition={{ duration: 0.15 }}
            aria-hidden="true"
          />
          <motion.div
            className="cursor-ring"
            style={{
              x: ringX,
              y: ringY,
              translateX: '-50%',
              translateY: '-50%',
            }}
            animate={{
              opacity: visible ? 1 : 0,
              width: overInput ? 24 : interactive ? 54 : 32,
              height: overInput ? 32 : interactive ? 54 : 32,
              borderRadius: overInput ? 6 : 999,
              scale: pressed ? 0.8 : 1,
              backgroundColor: overInput
                ? 'rgba(12, 56, 35, 0.08)'
                : interactive
                ? 'rgba(204, 255, 0, 0.15)'
                : 'rgba(22, 78, 51, 0)',
              borderColor: overInput
                ? '#0C3823'
                : interactive
                ? '#CCFF00'
                : '#164E33',
            }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            aria-hidden="true"
          />
          <motion.div
            className="cursor-dot"
            style={{
              x: cursorX,
              y: cursorY,
              translateX: '-50%',
              translateY: '-50%',
            }}
            animate={{
              opacity: visible ? 1 : 0,
              scale: pressed ? 1.5 : overInput ? 0 : interactive ? 0.6 : 1,
              backgroundColor: interactive ? '#CCFF00' : '#164E33',
            }}
            transition={{ duration: 0.08 }}
            aria-hidden="true"
          />
        </>
      )}
    </>
  );
}
