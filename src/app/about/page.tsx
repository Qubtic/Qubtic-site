'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gem, Handshake, Target, BookOpen, ArrowUpRight, CheckCircle2, Award, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const timeline = [
  {
    year: '2022',
    title: 'Studio Founded',
    description: 'Qubtic was born with a mission to deliver elite digital engineering and design to ambitious brands.',
  },
  {
    year: '2023',
    title: 'First 20 Scale Projects',
    description: 'Expanded into full-stack SaaS engineering, supporting venture-backed startups across 5 countries.',
  },
  {
    year: '2024',
    title: 'Shopify Apps Ecosystem',
    description: 'Launched our dedicated Shopify app division, building automation tools for top-tier e-commerce brands.',
  },
  {
    year: '2025',
    title: 'Framer Plugin Innovations',
    description: 'Became an authorized Framer partner, crafting bespoke interactive templates and developer plugins.',
  },
  {
    year: '2026',
    title: 'Global Delivery Powerhouse',
    description: 'Over 50+ enterprise products shipped worldwide with a 99% client satisfaction benchmark.',
  },
];

const values = [
  {
    icon: Gem,
    title: 'Craft Over Shortcuts',
    description:
      'We obsess over clean code architecture, type safety, sub-second load times, and pixel-precise UI interactions.',
  },
  {
    icon: Handshake,
    title: 'Radical Transparency',
    description:
      'No black boxes or hidden roadblocks. You receive direct access to our engineers, sprint boards, and roadmap demos.',
  },
  {
    icon: Target,
    title: 'Business Metric Focus',
    description:
      'Stunning software is useless if it does not drive revenue, retention, or conversion. We build to generate ROI.',
  },
  {
    icon: BookOpen,
    title: 'Continuous Innovation',
    description:
      'We embrace modern frameworks, edge computing, and AI-accelerated workflows to give your company an unfair advantage.',
  },
];

const team = [
  {
    name: 'Alex Chen',
    role: 'CEO & Solutions Architect',
    bio: '10+ years leading software architecture, previously engineering scalable web systems for global brands.',
    initials: 'AC',
  },
  {
    name: 'Marcus Rivera',
    role: 'Head of Engineering',
    bio: 'Specialist in distributed microservices, TypeScript, Next.js App Router, and Postgres optimizations.',
    initials: 'MR',
  },
  {
    name: 'Sarah Kim',
    role: 'Lead Product Designer',
    bio: 'Award-winning UX/UI designer focused on high-conversion design systems, typography, and micro-interactions.',
    initials: 'SK',
  },
  {
    name: 'James Okafor',
    role: 'Senior Full Stack Lead',
    bio: 'Expert in GraphQL, Shopify App Bridge, automated CI/CD pipelines, and secure API gateways.',
    initials: 'JO',
  },
  {
    name: 'Emily Zhang',
    role: 'Client Delivery Manager',
    bio: 'Agile delivery lead ensuring every project milestone is shipped on time, within scope, and bug-free.',
    initials: 'EZ',
  },
];

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24 md:pt-36 md:pb-32 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[34rem] w-[34rem] rounded-full bg-[#164E33]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-20 h-[34rem] w-[34rem] rounded-full bg-[#CCFF00]/15 blur-[120px]" />

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10">
        
        {/* Split Hero Section featuring Animated about.gif */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-20 lg:mb-24">
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="mb-4 flex items-center justify-start gap-3 select-none">
              <span className="h-px w-10 bg-[#164E33]/30" />
              <span className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-[#164E33]">
                OUR STORY &amp; MISSION
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold uppercase tracking-tight text-[#141915] font-heading leading-[1.02] mb-6">
              Engineering Digital Products That <span className="text-[#164E33]">Move The Needle</span>
            </h1>

            <p className="text-base sm:text-lg text-[#666C64] leading-relaxed font-normal max-w-2xl mb-8">
              Qubtic was founded on the belief that extraordinary digital products are built at the intersection of engineering rigor and human-centered design. We help forward-thinking companies launch web apps, SaaS platforms, and custom digital tools that scale effortlessly.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link
                href="/portfolio"
                className="group inline-flex items-center gap-3 rounded-full bg-[#164E33] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(22,78,51,0.2)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#0C3823]"
              >
                <span>Explore Our Work</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 rounded-full border border-[#164E33]/25 bg-white px-7 py-3.5 text-sm font-semibold text-[#164E33] transition-all duration-300 hover:-translate-y-1 hover:border-[#164E33] hover:shadow-md"
              >
                <span>Partner With Us</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#164E33]/15 w-full">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#164E33]/10 text-[#164E33] shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-heading text-lg font-bold text-[#141915] leading-none">50+</p>
                  <p className="text-[11px] text-[#666C64] mt-0.5">Products Shipped</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#164E33]/10 text-[#164E33] shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-heading text-lg font-bold text-[#141915] leading-none">100%</p>
                  <p className="text-[11px] text-[#666C64] mt-0.5">In-House Squad</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#164E33]/10 text-[#164E33] shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-heading text-lg font-bold text-[#141915] leading-none">99%</p>
                  <p className="text-[11px] text-[#666C64] mt-0.5">Client Satisfaction</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Animated about.gif Showcase */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[460px] aspect-square flex items-center justify-center p-4">
              {/* Soft Ambient Radial Glow behind the GIF */}
              <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-[#164E33]/15 blur-3xl sm:h-80 sm:w-80" />
              <div className="pointer-events-none absolute h-56 w-56 rounded-full bg-[#CCFF00]/25 blur-2xl sm:h-64 sm:w-64" />

              <div className="relative z-10 w-full h-full">
                <Image
                  src="/images/about.gif"
                  alt="About Qubtic Engineering 3D Animation"
                  fill
                  unoptimized
                  priority
                  className="object-contain drop-shadow-[0_20px_45px_rgba(22,78,51,0.25)]"
                  sizes="(max-width: 768px) 100vw, 460px"
                />
              </div>

              {/* Glassmorphism Badge 1 - Top Right */}
              <div className="absolute top-2 right-2 sm:right-4 z-20 flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-4 py-2 text-xs font-semibold text-[#164E33] shadow-lg backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-[#164E33]" />
                <span>Senior Engineering Studio</span>
              </div>

              {/* Glassmorphism Badge 2 - Bottom Left */}
              <div className="absolute bottom-2 left-2 sm:left-4 z-20 flex items-center gap-2 rounded-full border border-[#164E33]/20 bg-[#164E33] px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#CCFF00] shadow-[0_0_0_3px_rgba(204,255,0,0.4)]" />
                <span>Modern Web &amp; SaaS Architecture</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Statement Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#0C3823] text-white rounded-[28px] md:rounded-[36px] p-8 sm:p-12 md:p-16 mb-24 shadow-xl relative overflow-hidden"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#CCFF00]/10 blur-3xl" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] block mb-3">
            OUR CORE BELIEF
          </span>
          <p className="text-xl sm:text-2xl md:text-3xl font-heading font-semibold leading-snug max-w-4xl">
            {"“Great software shouldn't just look beautiful—it must operate flawlessly, convert visitors into customers, and scale reliably for millions of interactions.”"}
          </p>
        </motion.div>

        {/* Timeline Section */}
        <div className="mb-24">
          <div className="mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0C3823] block mb-2">
              OUR JOURNEY
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#141915] font-heading">
              How We Grew
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {timeline.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-white border border-[#E5E0D8] rounded-2xl p-6 flex flex-col justify-between hover:shadow-md hover:border-[#164E33]/30 transition-all duration-300"
              >
                <div>
                  <span className="text-2xl font-black text-[#0C3823] font-heading block mb-2">
                    {item.year}
                  </span>
                  <h3 className="text-base font-bold text-[#141915] font-heading mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#666C64] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Core Values Section */}
        <div className="mb-24">
          <div className="mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0C3823] block mb-2">
              HOW WE OPERATE
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#141915] font-heading">
              Our Core Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white border border-[#E5E0D8] rounded-3xl p-8 flex gap-5 hover:shadow-lg hover:border-[#164E33]/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#0C3823]/10 flex items-center justify-center text-[#0C3823] shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#141915] font-heading mb-2">
                      {val.title}
                    </h3>
                    <p className="text-sm text-[#666C64] leading-relaxed font-normal">
                      {val.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-24">
          <div className="mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0C3823] block mb-2">
              THE SQUAD
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#141915] font-heading">
              Leadership &amp; Engineering
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {team.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-white border border-[#E5E0D8] rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-md hover:border-[#164E33]/30 transition-all duration-300"
              >
                <div className="w-20 h-20 rounded-full bg-[#0C3823] text-white flex items-center justify-center font-heading font-black text-xl mb-4 shadow-sm">
                  {member.initials}
                </div>
                <h3 className="text-base font-bold text-[#141915] font-heading mb-1">
                  {member.name}
                </h3>
                <p className="text-xs font-semibold text-[#0C3823] mb-3">
                  {member.role}
                </p>
                <p className="text-xs text-[#666C64] leading-relaxed">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Footer Block */}
        <div className="text-center bg-[#F0EDE5] border border-[#E5E0D8] rounded-[28px] md:rounded-[36px] p-10 sm:p-14">
          <h3 className="text-2xl sm:text-3xl font-bold uppercase font-heading text-[#141915] mb-4">
            Let&apos;s Build Your Next Digital Solution
          </h3>
          <p className="text-[#666C64] max-w-md mx-auto mb-8 text-sm sm:text-base">
            Tell us about your roadmap, timeline, and goals. We respond within 24 business hours.
          </p>
          <Button href="/contact" variant="forest" size="lg">
            <span>Get in Touch with Our Team</span>
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
