'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative bg-[#00381F] pt-12 md:pt-16 pb-6 overflow-hidden">
      {/* Ambient Wave Graphic Texture Background (Same as Footer) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/images/footer-bg.jpg"
          alt="CTA Background Texture"
          fill
          priority
          className="object-cover object-center opacity-75 mix-blend-screen"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#002414]/80 via-[#00381F]/50 to-[#002414]/90" />
      </div>

      <div className="relative z-10 w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
        {/* White Rounded CTA Card - Matches Image 1 */}
        <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[32px] p-10 sm:p-14 md:p-20 text-center shadow-xl max-w-6xl mx-auto">
          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#111827] font-heading mb-5 leading-tight">
            Ready To Launch Your Digital <br className="hidden sm:block" />
            Marketing Project?
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-[#6B7280] max-w-xl mx-auto mb-8 leading-relaxed font-normal">
            Ready to launch your digital marketing project? Let us craft strategies that drive results and growth.
          </p>

          {/* Centered Dark Green Pill Button with Mail Icon */}
          <div className="flex justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-[#052814] hover:bg-[#07381C] text-white text-sm font-semibold shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <Mail className="w-4 h-4 text-white shrink-0" />
              <span>Lets&apos; Talk</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
