'use client';

import { motion } from 'framer-motion';
import { TechIcon } from '@/components/ui/TechIcon';

const technologies = [
  'Next.js', 'React', 'TypeScript', 'Node.js',
  'Tailwind CSS', 'PostgreSQL', 'Prisma', 'Shopify',
  'Framer', 'Figma', 'Vercel', 'AWS', 'Stripe', 'Supabase'
];

export default function TechStack() {
  return (
    <section className="py-20 lg:py-28 bg-white/[0.02]">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Technologies We Love
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 lg:gap-8 items-center justify-items-center">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech}
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-center gap-2.5 hover:bg-white/10 hover:border-white/20 transition-all cursor-default h-16 group">
                <TechIcon name={tech} className="w-5 h-5 shrink-0" />
                <span className="font-semibold text-slate-300 group-hover:text-white transition-colors text-sm text-center">
                  {tech}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
