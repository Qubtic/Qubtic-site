import Link from 'next/link';
import { ArrowLeft, Home, Briefcase, FolderGit2, Mail, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NotFoundAnimation } from '@/components/404/NotFoundAnimation';

export const metadata = {
  title: 'Page Not Found (404) | Qubtic',
  description: 'The page you are looking for does not exist or has been moved.',
};

export default function NotFound() {
  return (
    <div className="relative min-h-[85vh] flex flex-col justify-center px-4 py-20 sm:px-6 md:py-28 overflow-hidden">
      {/* Ambient background glow elements */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[32rem] w-[32rem] rounded-full bg-[#E8C48A]/30 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-[#0C3823]/10 blur-[120px]" />
      
      <div className="relative mx-auto w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
          {/* Lottie Animation Column */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex justify-center">
            <div className="w-full relative">
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#0C3823]/5 to-[#E8C48A]/20 blur-2xl -z-10" />
              <NotFoundAnimation />
            </div>
          </div>

          {/* Content Column */}
          <div className="lg:col-span-6 order-2 lg:order-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0C3823]/15 bg-white/60 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-[#0C3823] tracking-widest uppercase mb-6 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#CCFF00] animate-pulse" />
              Error 404 — Page Not Found
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#141915] font-heading tracking-tight leading-[1.1] mb-5">
              Looks like you&apos;ve skated off the map.
            </h1>

            <p className="text-base sm:text-lg text-[#6E736D] mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              The page you are looking for might have been moved, renamed, or never existed on Qubtic. Let&apos;s get you back on track!
            </p>

            {/* Main CTA buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-10">
              <Button href="/" variant="forest" size="lg" className="group shadow-md">
                <Home className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                <span>Return to Homepage</span>
              </Button>
              <Button href="/portfolio" variant="outline" size="lg">
                <FolderGit2 className="w-4 h-4 mr-1" />
                <span>View Our Work</span>
              </Button>
            </div>

            {/* Quick Links Section */}
            <div className="border-t border-[#141915]/10 pt-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6E736D] block mb-4">
                Or jump directly to:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0">
                <Link
                  href="/services"
                  className="flex items-center gap-2 text-xs font-medium text-[#141915] hover:text-[#0C3823] bg-white/70 hover:bg-white border border-[#141915]/8 rounded-xl px-3.5 py-2.5 transition-all shadow-2xs hover:shadow-xs"
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#0C3823]" />
                  <span>Services</span>
                </Link>
                <Link
                  href="/about"
                  className="flex items-center gap-2 text-xs font-medium text-[#141915] hover:text-[#0C3823] bg-white/70 hover:bg-white border border-[#141915]/8 rounded-xl px-3.5 py-2.5 transition-all shadow-2xs hover:shadow-xs"
                >
                  <Home className="w-3.5 h-3.5 text-[#0C3823]" />
                  <span>About Us</span>
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center gap-2 text-xs font-medium text-[#141915] hover:text-[#0C3823] bg-white/70 hover:bg-white border border-[#141915]/8 rounded-xl px-3.5 py-2.5 transition-all shadow-2xs hover:shadow-xs col-span-2 sm:col-span-1"
                >
                  <Mail className="w-3.5 h-3.5 text-[#0C3823]" />
                  <span>Contact</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
