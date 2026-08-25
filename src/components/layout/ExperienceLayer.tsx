'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring } from 'framer-motion';

const interactiveSelector = 'a, button, [role="button"], [data-cursor="interactive"]';
const textInputSelector = 'input, textarea, select, label, [contenteditable="true"], form';

export function ExperienceLayer() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [interactive, setInteractive] = React.useState(false);
  const [overInput, setOverInput] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const glowX = useSpring(cursorX, { stiffness: 55, damping: 24, mass: 1.2 });
  const glowY = useSpring(cursorY, { stiffness: 55, damping: 24, mass: 1.2 });
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

    const handlePointerMove = (event: PointerEvent) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
      setVisible(true);

      const target = event.target instanceof Element ? event.target : null;
      setInteractive(Boolean(target?.closest(interactiveSelector)));
      setOverInput(Boolean(target?.closest(textInputSelector)));
    };
    const handlePointerLeave = () => setVisible(false);
    const handlePointerEnter = () => setVisible(true);
    const handlePointerDown = () => setPressed(true);
    const handlePointerUp = () => setPressed(false);

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('pointerenter', handlePointerEnter);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('pointerenter', handlePointerEnter);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [cursorX, cursorY, enabled]);

  return (
    <>
      <motion.div className="site-scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />

      {enabled && (
        <>
          <motion.div
            className="cursor-ambient-glow"
            style={{ left: glowX, top: glowY }}
            animate={{ opacity: visible ? 1 : 0 }}
            aria-hidden="true"
          />
          <motion.div
            className="cursor-ring"
            style={{ left: cursorX, top: cursorY }}
            animate={{
              opacity: visible ? 1 : 0,
              width: overInput ? 24 : interactive ? 58 : 34,
              height: overInput ? 36 : interactive ? 58 : 34,
              borderRadius: overInput ? 8 : 999,
              scale: pressed ? 0.78 : 1,
              backgroundColor: overInput
                ? 'rgba(12, 56, 35, 0.12)'
                : interactive
                ? 'rgba(204, 255, 0, 0.2)'
                : 'rgba(22, 78, 51, 0)',
              borderColor: overInput
                ? '#0C3823'
                : interactive
                ? '#CCFF00'
                : '#164E33',
            }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            aria-hidden="true"
          />
          <motion.div
            className="cursor-dot"
            style={{ left: cursorX, top: cursorY }}
            animate={{
              opacity: visible ? 1 : 0,
              scale: pressed ? 1.7 : overInput ? 1.2 : interactive ? 0.55 : 1,
              backgroundColor: overInput
                ? '#0C3823'
                : interactive
                ? '#CCFF00'
                : '#164E33',
            }}
            transition={{ duration: 0.12 }}
            aria-hidden="true"
          />
        </>
      )}
    </>
  );
}
