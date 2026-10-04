'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Sparkles, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Mail, 
  Copy, 
  Check, 
  ArrowUpRight, 
  CheckCircle2, 
  Rocket, 
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  Code2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { TechLoader } from '@/components/ui/TechLoader';

const CATEGORY_OPTIONS = [
  { value: 'Section Component', label: 'Section Component (Hero, Bento, Header, Pricing, Footer)' },
  { value: 'Interactive Canvas Element', label: 'Interactive Element (3D Spline, Shaders, Tabs, Carousel)' },
  { value: 'Design Tokens & Themes', label: 'Design Tokens & Themes (Liquid Glass, Obsidian, Crystal Light)' },
  { value: 'CMS & Dynamic Collections', label: 'CMS & Dynamic Collection Integrations' },
  { value: 'Accessibility (WCAG AA)', label: 'Accessibility (WCAG AA Preflight & Color Audits)' },
  { value: 'Workflow & Plugin Usability', label: 'Workflow & Canvas Productivity Tooling' },
  { value: 'Other Custom Idea', label: 'Other Custom Feature / Enhancement' },
];

const USE_CASE_OPTIONS = [
  { value: 'SaaS & AI Tech Landing Pages', label: 'SaaS & AI Tech Landing Pages' },
  { value: 'Agency & Client Portfolios', label: 'Agency & Client Portfolios' },
  { value: 'E-Commerce & DTC Storefronts', label: 'E-Commerce & DTC Storefronts' },
  { value: 'Personal Brand & Creator Hubs', label: 'Personal Brand & Creator Hubs' },
  { value: 'Web3 & Fintech Platforms', label: 'Web3 & Fintech Platforms' },
  { value: 'Multi-Page Enterprise Portals', label: 'Multi-Page Enterprise Portals' },
];

const PRIORITY_OPTIONS = [
  { value: 'Nice to Have', label: 'Nice to Have (Inspiration for future releases)' },
  { value: 'Important', label: 'Important (Planned for an upcoming client project)' },
  { value: 'Urgent / Blocker', label: 'Urgent / Blocker (Need this for an active build)' },
];

const featureRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  category: z.string().min(1, 'Please select a feature category'),
  useCase: z.string().min(1, 'Please select a use case'),
  title: z.string().min(3, 'Feature title must be at least 3 characters'),
  description: z.string().min(10, 'Please describe your request in at least 10 characters'),
  referenceUrl: z.string().optional(),
  priority: z.string().min(1, 'Please select a priority'),
});

type FeatureRequestFormData = z.infer<typeof featureRequestSchema>;

export default function FeatureRequestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('framedrop@qubtic.tech');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FeatureRequestFormData>({
    resolver: zodResolver(featureRequestSchema),
    defaultValues: {
      category: 'Section Component',
      useCase: 'SaaS & AI Tech Landing Pages',
      priority: 'Important',
    },
  });

  const onSubmit = async (data: FeatureRequestFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      const res = await fetch('/api/feature-request', {
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
        
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#666C64]">
            <Link href="/" className="hover:text-[#141915] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/framer/frame-drop" className="hover:text-[#141915] transition-colors">
              Framer
            </Link>
            <span>/</span>
            <Link href="/framer/frame-drop" className="hover:text-[#141915] transition-colors inline-flex items-center gap-1.5">
              <Image
                src="/images/brand/frame-drop-icon-transparent.png"
                alt="Frame Drop"
                width={14}
                height={14}
                className="h-3.5 w-3.5 object-contain"
              />
              <span>Frame Drop</span>
            </Link>
            <span>/</span>
            <span className="text-[#0C3823] font-bold">Feature Request</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#0C3823]/15 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#0C3823] shadow-2xs backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#CCFF00] animate-pulse" />
              v0.3.0 Sprint Backlog Open
            </span>
            <Link
              href="/framer/frame-drop/docs"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#141915]/10 bg-white/70 px-3 py-1 text-xs font-medium text-[#141915] hover:bg-white transition-colors"
            >
              <span>Explore 25+ Drops</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Hero Section Header with Showcase Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16 lg:mb-20">
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="mb-4 flex items-center justify-start gap-3 select-none">
              <span className="h-px w-10 bg-[#164E33]/30" />
              <span className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-[#164E33]">
                FRAME DROP &bull; COMMUNITY ROADMAP &amp; WISHLIST
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight text-[#141915] font-heading leading-[1.04] mb-6">
              Request A Feature for <span className="text-[#164E33]">Frame Drop</span>
            </h1>

            <p className="text-base sm:text-lg text-[#666C64] leading-relaxed max-w-2xl">
              Have an idea for a high-converting landing section, liquid glass token, or workflow automation for our native Framer plugin? Submit your wishlist below. Our core engineering team reviews every request and prioritizes high-demand drops in our bi-weekly release cycle.
            </p>

            {/* Quick Feature Badges */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0C3823]/5 border border-[#0C3823]/15 px-3 py-1 text-xs font-semibold text-[#0C3823]">
                <Sparkles className="w-3.5 h-3.5 text-[#0C3823]" />
                100% Native Framer Canvas
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0C3823]/5 border border-[#0C3823]/15 px-3 py-1 text-xs font-semibold text-[#0C3823]">
                <Zap className="w-3.5 h-3.5 text-[#0C3823]" />
                Bi-Weekly Release Cadence
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0C3823]/5 border border-[#0C3823]/15 px-3 py-1 text-xs font-semibold text-[#0C3823]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0C3823]" />
                WCAG AA Compliant
              </span>
            </div>
          </div>

          {/* Hero Visual Showcase */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[460px] aspect-[4/3] sm:aspect-square flex items-center justify-center p-2">
              {/* Soft Ambient Radial Glow behind showcase */}
              <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-[#164E33]/15 blur-3xl sm:h-72 sm:w-72" />
              <div className="pointer-events-none absolute h-48 w-48 rounded-full bg-[#CCFF00]/25 blur-2xl sm:h-56 sm:w-56" />

              {/* Showcase Container */}
              <div className="relative z-10 w-full h-full rounded-[28px] overflow-hidden border border-[#E5E0D8] bg-white shadow-xl flex flex-col">
                {/* Window header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#141915]/10 bg-[#FAF8F5]">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-[#141915]">
                    <Image
                      src="/images/brand/frame-drop-icon-transparent.png"
                      alt="Frame Drop"
                      width={14}
                      height={14}
                      className="h-3.5 w-3.5 object-contain"
                    />
                    <span>Frame Drop Studio</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0C3823] bg-[#0C3823]/10 px-2 py-0.5 rounded-full">
                    v0.2.0
                  </span>
                </div>

                {/* Promo Image */}
                <div className="relative flex-1 w-full bg-[#040D1A] overflow-hidden">
                  <Image
                    src="/images/framedrop-banner.png"
                    alt="Frame Drop Framer Plugin by Qubtic"
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 460px"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D0C]/80 via-transparent to-transparent" />
                  
                  {/* Floating Pill Badge 1 */}
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#164E33] shadow-lg backdrop-blur-md">
                    <span className="h-2 w-2 rounded-full bg-[#CCFF00] shadow-[0_0_0_3px_rgba(204,255,0,0.4)] animate-pulse" />
                    <span>Direct Access to Engineers</span>
                  </div>

                  {/* Floating Pill Badge 2 */}
                  <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full border border-[#164E33]/30 bg-[#164E33]/90 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xl backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5 text-[#CCFF00]" />
                    <span>Co-Create With Qubtic</span>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="px-4 py-2.5 bg-[#F8F7F2] border-t border-[#E5E0D8] flex items-center justify-between text-xs text-[#666C64]">
                  <span>25+ Native Framer Sections</span>
                  <Link href="/framer/frame-drop" className="text-[#0C3823] font-bold hover:underline inline-flex items-center gap-1">
                    <span>Learn More</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Form + Feature Details Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Feature Request Form */}
          <div className="lg:col-span-7 bg-white border border-[#E5E0D8] rounded-[28px] md:rounded-[36px] p-8 sm:p-12 shadow-sm relative z-10">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#E5E0D8]">
              <div className="w-10 h-10 rounded-xl bg-[#164E33]/10 text-[#164E33] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#141915] font-heading">
                  Submit a Component or Feature Wish
                </h2>
                <p className="text-xs text-[#666C64]">
                  Tell our Framer plugin architects what section layout or tool you need next.
                </p>
              </div>
            </div>

            {submitStatus === 'success' ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#0C3823]/10 text-[#0C3823] flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#141915] font-heading mb-3">
                  Feature Request Logged!
                </h3>
                <p className="text-[#666C64] max-w-md mx-auto mb-8 text-sm">
                  Thank you for contributing to Frame Drop. Your idea has been submitted to the product triage queue. We&apos;ll notify you via email when it enters active development or ships in a release!
                </p>
                <Button onClick={() => setSubmitStatus('idle')} variant="dark">
                  Submit Another Feature Request
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {submitStatus === 'error' && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    Failed to submit your request. Please verify your internet connection or email us directly at <a href="mailto:framedrop@qubtic.tech" className="underline font-bold">framedrop@qubtic.tech</a>.
                  </div>
                )}

                {/* Row 1: Name and Email */}
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
                      Framer / Work Email *
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="alex@studio.design"
                      className="w-full px-4 py-3 rounded-xl bg-[#F8F7F2] border border-[#E5E0D8] text-[#141915] placeholder:text-[#9EA39C] focus:outline-none focus:border-[#0C3823] transition-colors duration-200 text-sm"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Studio Name & Feature Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#141915] mb-2">
                      Studio / Framer Handle (Optional)
                    </label>
                    <input
                      {...register('company')}
                      placeholder="e.g. Acme Agency or @alexdesign"
                      className="w-full px-4 py-3 rounded-xl bg-[#F8F7F2] border border-[#E5E0D8] text-[#141915] placeholder:text-[#9EA39C] focus:outline-none focus:border-[#0C3823] transition-colors duration-200 text-sm"
                    />
                  </div>
                  <div>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <CustomSelect
                          label="Request Category *"
                          options={CATEGORY_OPTIONS}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.category?.message}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Row 3: Target Use Case & Priority Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Controller
                      name="useCase"
                      control={control}
                      render={({ field }) => (
                        <CustomSelect
                          label="Target Framer Use Case *"
                          options={USE_CASE_OPTIONS}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.useCase?.message}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <Controller
                      name="priority"
                      control={control}
                      render={({ field }) => (
                        <CustomSelect
                          label="Priority for Your Workflow *"
                          options={PRIORITY_OPTIONS}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.priority?.message}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Row 4: Feature Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#141915] mb-2">
                    Feature / Component Title *
                  </label>
                  <input
                    {...register('title')}
                    placeholder="e.g. Liquid Glass Interactive Pricing Matrix with Yearly Toggle"
                    className="w-full px-4 py-3 rounded-xl bg-[#F8F7F2] border border-[#E5E0D8] text-[#141915] placeholder:text-[#9EA39C] focus:outline-none focus:border-[#0C3823] transition-colors duration-200 text-sm font-medium"
                  />
                  {errors.title && (
                    <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>
                  )}
                </div>

                {/* Row 5: Detailed Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#141915] mb-2">
                    Detailed Requirements &amp; Behavior *
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    placeholder="Describe how you envision this component behaving on the Framer canvas. What layout options or props should be editable? What responsive breakpoints are important?"
                    className="w-full px-4 py-3 rounded-xl bg-[#F8F7F2] border border-[#E5E0D8] text-[#141915] placeholder:text-[#9EA39C] focus:outline-none focus:border-[#0C3823] transition-colors duration-200 text-sm"
                  />
                  {errors.description && (
                    <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>
                  )}
                </div>

                {/* Row 6: Reference Link */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#141915] mb-2">
                    Reference URL / Figma Link / Live Preview (Optional)
                  </label>
                  <input
                    {...register('referenceUrl')}
                    placeholder="https://figma.com/... or https://example.com"
                    className="w-full px-4 py-3 rounded-xl bg-[#F8F7F2] border border-[#E5E0D8] text-[#141915] placeholder:text-[#9EA39C] focus:outline-none focus:border-[#0C3823] transition-colors duration-200 text-sm"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="forest"
                  size="lg"
                  className="w-full justify-center group"
                >
                  {isSubmitting ? (
                    <TechLoader size="inline" text="Submitting Feature Request..." />
                  ) : (
                    <>
                      <span>Submit Feature Request</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Right Column: Contact & Roadmap Details Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Dark Forest Card */}
            <div className="bg-[#0C3823] text-white rounded-[28px] md:rounded-[36px] p-8 sm:p-10 shadow-lg flex flex-col gap-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] block mb-2">
                  DIRECT ENGINEERING LABS
                </span>
                <h3 className="text-2xl font-bold font-heading">
                  How Feature Requests Work
                </h3>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#CCFF00] shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-white/60 uppercase tracking-wider block font-medium">
                      1. Weekly Triage
                    </span>
                    <p className="text-sm text-white/90 leading-relaxed mt-0.5">
                      Our lead Framer architects inspect every submission for canvas safety, responsive fluidity, and reusability.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#CCFF00] shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-white/60 uppercase tracking-wider block font-medium">
                      2. Bi-Weekly Release Cadence
                    </span>
                    <p className="text-sm text-white/90 leading-relaxed mt-0.5">
                      Top-requested components enter rapid prototyping, WCAG AA contrast audits, and deploy directly into the plugin library.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#CCFF00] shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-white/60 uppercase tracking-wider block font-medium">
                      3. Zero Code Lock-in
                    </span>
                    <p className="text-sm text-white/90 leading-relaxed mt-0.5">
                      Every dropped section generates clean, native Framer frames with full layer hierarchy and zero external runtime code.
                    </p>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 pt-4 border-t border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#CCFF00] shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-white/60 uppercase tracking-wider block font-medium">
                        Plugin Team Direct Line
                      </span>
                      <a
                        href="mailto:framedrop@qubtic.tech"
                        className="text-base font-semibold text-white hover:text-[#CCFF00] transition-colors"
                      >
                        framedrop@qubtic.tech
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
              </div>
            </div>

            {/* Live Roadmap Box - Matching the Instant Calendar card on Contact page */}
            <div className="relative overflow-hidden rounded-[28px] md:rounded-[32px] border border-[#E5E0D8] bg-gradient-to-br from-white via-[#FAF8F5] to-[#F4EFE6] p-7 md:p-8 shadow-md group transition-all duration-300 hover:shadow-xl hover:border-[#164E33]/30 flex flex-col gap-5">
              {/* Subtle Ambient Radial Glow */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#164E33]/10 blur-2xl group-hover:bg-[#CCFF00]/20 transition-all duration-500" />

              <div className="flex items-start gap-4 relative z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0C3823] text-[#CCFF00] shadow-[0_8px_20px_rgba(12,56,35,0.25)] shrink-0 transition-transform duration-300 group-hover:scale-105">
                  <Rocket className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0C3823]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0C3823] mb-1.5 font-mono">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#164E33] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#164E33]" />
                    </span>
                    <span>LIVE SPRINT &bull; v0.3.0</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-[#141915] font-heading tracking-tight">
                    What We&apos;re Building Right Now
                  </h4>
                  <p className="text-xs sm:text-sm text-[#666C64] leading-relaxed mt-1">
                    Features currently undergoing QA testing for our next major Frame Drop plugin release:
                  </p>
                </div>
              </div>

              {/* Quick Status Pillars */}
              <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-white/80 border border-[#E5E0D8]/70 text-[11px] font-semibold text-[#0C3823] relative z-10">
                <div className="flex flex-col items-center text-center">
                  <span className="text-[#141915] font-bold">3D Shaders</span>
                  <span className="text-[10px] text-[#164E33] bg-[#164E33]/10 px-1.5 py-0.5 rounded-md mt-0.5">In Testing</span>
                </div>
                <div className="flex flex-col items-center text-center border-x border-[#E5E0D8]/60">
                  <span className="text-[#141915] font-bold">CMS Bento</span>
                  <span className="text-[10px] text-[#0C3823] bg-[#CCFF00]/40 px-1.5 py-0.5 rounded-md mt-0.5 font-bold">In Progress</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-[#141915] font-bold">Crystal Light</span>
                  <span className="text-[10px] text-[#666C64] bg-[#666C64]/10 px-1.5 py-0.5 rounded-md mt-0.5">Queued</span>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href="/framer/frame-drop/docs"
                className="group/btn relative z-10 inline-flex items-center justify-center gap-3 w-full rounded-full bg-[#164E33] hover:bg-[#0C3823] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(22,78,51,0.2)] hover:shadow-[0_14px_30px_rgba(22,78,51,0.3)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <span>Explore Current Component Catalog</span>
                <ArrowUpRight className="w-4 h-4 text-[#CCFF00] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            {/* SLA Badge */}
            <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-[24px] p-5 sm:p-6 flex items-center gap-4 shadow-2xs">
              <div className="w-11 h-11 rounded-2xl bg-[#0C3823] text-[#CCFF00] flex items-center justify-center font-heading font-black text-sm shrink-0 shadow-sm">
                48h
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#141915]">
                  Guaranteed Triage Notification
                </p>
                <p className="text-xs text-[#666C64] leading-relaxed mt-0.5">
                  All submitted feature requests receive a status review and email update within 48 business hours.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
