'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, MapPin, Clock, Loader2, ArrowUpRight, CheckCircle2, Copy, Check, Calendar, MessageSquare, ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { TechLoader } from '@/components/ui/TechLoader';

const SERVICE_OPTIONS = [
  { value: 'Web Development', label: 'Web App Development' },
  { value: 'SaaS Development', label: 'SaaS Product Engineering' },
  { value: 'Shopify App', label: 'Shopify Apps & Themes' },
  { value: 'Framer Development', label: 'Framer Sites & Plugins' },
  { value: 'Other', label: 'Custom IT Solution' },
];

const BUDGET_OPTIONS = [
  { value: '<$1K', label: '< $1,000 (Quick Sprint)' },
  { value: '$1K-$5K', label: '$1,000 – $5,000 (Starter Project)' },
  { value: '$5K-$15K', label: '$5,000 – $15,000 (Growth Platform)' },
  { value: '$15K-$30K', label: '$15,000 – $30,000 (Enterprise SaaS)' },
  { value: '$30K+', label: '$30,000+ (Custom Architecture)' },
];

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  service: z.enum([
    'Web Development',
    'SaaS Development',
    'Shopify App',
    'Framer Development',
    'Other',
  ]),
  budget: z.enum(['<$1K', '$1K-$5K', '$5K-$15K', '$15K-$30K', '$30K+']),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const reduceMotion = useReducedMotion();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('hello@qubtic.tech');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      service: 'Web Development',
      budget: '$5K-$15K',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSubmitStatus('success');
        reset();
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 md:pt-36 md:pb-32 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[34rem] w-[34rem] rounded-full bg-[#164E33]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-20 h-[34rem] w-[34rem] rounded-full bg-[#CCFF00]/15 blur-[120px]" />

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10">
        
        {/* Hero Section Header with 3D Animated GIF Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16 lg:mb-20">
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="mb-4 flex items-center justify-start gap-3 select-none">
              <span className="h-px w-10 bg-[#164E33]/30" />
              <span className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-[#164E33]">
                START A CONVERSATION
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight text-[#141915] font-heading leading-[1.04] mb-6">
              Let&apos;s Build Something <span className="text-[#164E33]">Exceptional Together</span>
            </h1>

            <p className="text-base sm:text-lg text-[#666C64] leading-relaxed max-w-2xl">
              Have a project in mind or need senior engineering guidance? Fill out the brief form below and our leadership team will respond within 24 business hours with a clear scoping roadmap.
            </p>
          </div>

          {/* Animated 3D Contact GIF Showcase */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center p-4">
              {/* Soft Ambient Radial Glow behind the GIF */}
              <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-[#164E33]/15 blur-3xl sm:h-72 sm:w-72" />
              <div className="pointer-events-none absolute h-48 w-48 rounded-full bg-[#CCFF00]/25 blur-2xl sm:h-56 sm:w-56" />

              <div className="relative z-10 w-full h-full">
                <Image
                  src="/images/support-agent-with-headset-on-smartphone-customer-service-assistance.gif"
                  alt="Customer Support & Assistance 3D Animation"
                  fill
                  unoptimized
                  priority
                  className="object-contain drop-shadow-[0_20px_45px_rgba(22,78,51,0.25)]"
                  sizes="(max-width: 768px) 100vw, 420px"
                />
              </div>

              {/* Floating Pill Badge */}
              <div className="absolute top-2 right-2 sm:right-4 z-20 flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-4 py-2 text-xs font-semibold text-[#164E33] shadow-lg backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#CCFF00] shadow-[0_0_0_3px_rgba(204,255,0,0.4)]" />
                <span>Direct Access to Engineers</span>
              </div>

              {/* Bottom Badge */}
              <div className="absolute bottom-2 left-2 sm:left-4 z-20 flex items-center gap-2 rounded-full border border-[#164E33]/20 bg-[#164E33] px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md">
                <ShieldCheck className="h-4 w-4 text-[#CCFF00]" />
                <span>24h Response Guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Form + Contact Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 bg-white border border-[#E5E0D8] rounded-[28px] md:rounded-[36px] p-8 sm:p-12 shadow-sm relative z-10">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#E5E0D8]">
              <div className="w-10 h-10 rounded-xl bg-[#164E33]/10 text-[#164E33] flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#141915] font-heading">
                  Send Us a Message
                </h2>
                <p className="text-xs text-[#666C64]">
                  Tell us about your project scope, targets, and timeline.
                </p>
              </div>
            </div>

            {submitStatus === 'success' ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#0C3823]/10 text-[#0C3823] flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#141915] font-heading mb-3">
                  Message Received!
                </h3>
                <p className="text-[#666C64] max-w-md mx-auto mb-8 text-sm">
                  Thank you for reaching out to Qubtic. We have received your inquiry and will be in touch within 24 business hours.
                </p>
                <Button onClick={() => setSubmitStatus('idle')} variant="dark">
                  Send Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {submitStatus === 'error' && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    Failed to send your request. Please verify your internet connection or email us directly at <a href="mailto:hello@qubtic.tech" className="underline font-bold">hello@qubtic.tech</a>.
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#141915] mb-2">
                      Your Name *
                    </label>
                    <input
                      {...register('name')}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-4 py-3 rounded-xl bg-[#F8F7F2] border border-[#E5E0D8] text-[#141915] placeholder:text-[#9EA39C] focus:outline-none focus:border-[#0C3823] transition-colors duration-200 text-sm"
                    />
                    {errors.name && (
                      <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#141915] mb-2">
                      Work Email *
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="alex@company.com"
                      className="w-full px-4 py-3 rounded-xl bg-[#F8F7F2] border border-[#E5E0D8] text-[#141915] placeholder:text-[#9EA39C] focus:outline-none focus:border-[#0C3823] transition-colors duration-200 text-sm"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#141915] mb-2">
                      Company / Organization
                    </label>
                    <input
                      {...register('company')}
                      placeholder="e.g. Acme Corp"
                      className="w-full px-4 py-3 rounded-xl bg-[#F8F7F2] border border-[#E5E0D8] text-[#141915] placeholder:text-[#9EA39C] focus:outline-none focus:border-[#0C3823] transition-colors duration-200 text-sm"
                    />
                  </div>
                  <div>
                    <Controller
                      name="service"
                      control={control}
                      render={({ field }) => (
                        <CustomSelect
                          label="Service Interest"
                          options={SERVICE_OPTIONS}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.service?.message}
                        />
                      )}
                    />
                  </div>
                </div>

                <div>
                  <Controller
                    name="budget"
                    control={control}
                    render={({ field }) => (
                      <CustomSelect
                        label="Estimated Budget Range"
                        options={BUDGET_OPTIONS}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.budget?.message}
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#141915] mb-2">
                    Project Overview &amp; Goals *
                  </label>
                  <textarea
                    {...register('message')}
                    rows={4}
                    placeholder="Tell us about what you want to build, desired timeline, or key technical goals..."
                    className="w-full px-4 py-3 rounded-xl bg-[#F8F7F2] border border-[#E5E0D8] text-[#141915] placeholder:text-[#9EA39C] focus:outline-none focus:border-[#0C3823] transition-colors duration-200 text-sm"
                  />
                  {errors.message && (
                    <p className="text-red-600 text-xs mt-1">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="forest"
                  size="lg"
                  className="w-full justify-center group"
                >
                  {isSubmitting ? (
                    <TechLoader size="inline" text="Sending Project Inquiry..." />
                  ) : (
                    <>
                      <span>Send Project Inquiry</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Right Column: Contact Details Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#0C3823] text-white rounded-[28px] md:rounded-[36px] p-8 sm:p-10 shadow-lg flex flex-col gap-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] block mb-2">
                  DIRECT CHANNELS
                </span>
                <h3 className="text-2xl font-bold font-heading">
                  Let&apos;s Connect Directly
                </h3>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#CCFF00] shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-white/60 uppercase tracking-wider block font-medium">
                        Email Us
                      </span>
                      <a
                        href="mailto:hello@qubtic.tech"
                        className="text-base font-semibold text-white hover:text-[#CCFF00] transition-colors"
                      >
                        hello@qubtic.tech
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                    title="Copy email to clipboard"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#CCFF00]" />
                        <span className="text-[11px] text-[#CCFF00] font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#CCFF00] shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-white/60 uppercase tracking-wider block font-medium">
                      Call Us
                    </span>
                    <a
                      href="tel:+15551234567"
                      className="text-base font-semibold text-white hover:text-[#CCFF00] transition-colors"
                    >
                      +1 (555) 123-4567
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#CCFF00] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-white/60 uppercase tracking-wider block font-medium">
                      Studio Location
                    </span>
                    <span className="text-base font-semibold text-white">
                      Remote-First · Worldwide Delivery
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#CCFF00] shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-white/60 uppercase tracking-wider block font-medium">
                      Working Hours
                    </span>
                    <span className="text-base font-semibold text-white">
                      Mon – Fri, 9:00 AM – 6:00 PM EST
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instant Calendar Booking Box - Elevated Premium Card */}
            <div className="relative overflow-hidden rounded-[28px] md:rounded-[32px] border border-[#E5E0D8] bg-gradient-to-br from-white via-[#FAF8F5] to-[#F4EFE6] p-7 md:p-8 shadow-md group transition-all duration-300 hover:shadow-xl hover:border-[#164E33]/30 flex flex-col gap-5">
              {/* Subtle Ambient Radial Glow */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#164E33]/10 blur-2xl group-hover:bg-[#CCFF00]/20 transition-all duration-500" />

              <div className="flex items-start gap-4 relative z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0C3823] text-[#CCFF00] shadow-[0_8px_20px_rgba(12,56,35,0.25)] shrink-0 transition-transform duration-300 group-hover:scale-105">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0C3823]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0C3823] mb-1.5 font-mono">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#164E33] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#164E33]" />
                    </span>
                    <span>LIVE CALENDAR</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-[#141915] font-heading tracking-tight">
                    Prefer an Instant Scoping Call?
                  </h4>
                  <p className="text-xs sm:text-sm text-[#666C64] leading-relaxed mt-1">
                    Skip the email queue and reserve a slot directly with our Lead Solutions Architect.
                  </p>
                </div>
              </div>

              {/* Quick Pillars */}
              <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-white/80 border border-[#E5E0D8]/70 text-[11px] font-semibold text-[#0C3823] relative z-10">
                <span className="flex items-center gap-1.5 justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#164E33] shrink-0" />
                  <span>20-Min Call</span>
                </span>
                <span className="flex items-center gap-1.5 justify-center border-x border-[#E5E0D8]/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#164E33] shrink-0" />
                  <span>Zero Obligation</span>
                </span>
                <span className="flex items-center gap-1.5 justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#164E33] shrink-0" />
                  <span>Direct Tech Lead</span>
                </span>
              </div>

              {/* Action Button */}
              <a
                href="https://calendly.com"
                target="_blank"
                rel="noreferrer"
                className="group/btn relative z-10 inline-flex items-center justify-center gap-3 w-full rounded-full bg-[#164E33] hover:bg-[#0C3823] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(22,78,51,0.2)] hover:shadow-[0_14px_30px_rgba(22,78,51,0.3)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <span>Schedule a 20-Minute Scoping Call</span>
                <ArrowUpRight className="w-4 h-4 text-[#CCFF00] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            {/* SLA Badge */}
            <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-[24px] p-5 sm:p-6 flex items-center gap-4 shadow-2xs">
              <div className="w-11 h-11 rounded-2xl bg-[#0C3823] text-[#CCFF00] flex items-center justify-center font-heading font-black text-sm shrink-0 shadow-sm">
                24h
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#141915]">
                  Guaranteed Fast Discovery Response
                </p>
                <p className="text-xs text-[#666C64] leading-relaxed mt-0.5">
                  All submitted inquiries receive a comprehensive scoping roadmap within one business day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
