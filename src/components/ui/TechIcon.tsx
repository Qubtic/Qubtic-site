import * as React from 'react';
import {
  SiReact,
  SiTypescript,
  SiJavascript,
  SiNextdotjs,
  SiTailwindcss,
  SiNodedotjs,
  SiShopify,
  SiPostgresql,
  SiPrisma,
  SiFramer,
  SiStripe,
  SiPython,
  SiSupabase,
  SiFigma,
  SiVercel,
  SiGraphql,
  SiDocker,
  SiRedis,
  SiMongodb,
  SiRemix,
  SiFlutter,
  SiSwift,
  SiKotlin,
  SiRust,
  SiGo,
  SiVite,
  SiAstro,
  SiVuedotjs,
} from 'react-icons/si';

interface TechIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  className?: string;
}

export function TechIcon({ name, className = 'w-4 h-4', ...props }: TechIconProps) {
  const normalized = name.toLowerCase().trim();

  // REMIX (Official Remix Logo)
  if (normalized.includes('remix')) {
    return <SiRemix className={className} color="#000000" />;
  }

  // SHOPIFY / SHOPIFY APP BRIDGE (Official Shopify Bag Logo #96BF48)
  if (normalized.includes('shopify')) {
    return <SiShopify className={className} color="#96BF48" />;
  }

  // REACT (Official React Cyan #61DAFB)
  if (normalized.includes('react') && !normalized.includes('native')) {
    return <SiReact className={className} color="#61DAFB" />;
  }

  // TYPESCRIPT (Official TS Blue #3178C6)
  if (normalized.includes('typescript') || normalized === 'ts') {
    return <SiTypescript className={className} color="#3178C6" />;
  }

  // JAVASCRIPT (Official JS Yellow #F7DF1E)
  if (normalized.includes('javascript') || normalized === 'js') {
    return <SiJavascript className={className} color="#F7DF1E" />;
  }

  // NEXT.JS (Official Next.js Dark/Black)
  if (normalized.includes('next')) {
    return <SiNextdotjs className={className} color="#000000" />;
  }

  // TAILWIND CSS (Official Cyan #06B6D4)
  if (normalized.includes('tailwind')) {
    return <SiTailwindcss className={className} color="#06B6D4" />;
  }

  // NODE.JS (Official Node Green #5FA04E)
  if (normalized.includes('node')) {
    return <SiNodedotjs className={className} color="#5FA04E" />;
  }

  // POSTGRESQL (Official PostgreSQL Blue #4169E1)
  if (normalized.includes('postgres') || normalized.includes('sql')) {
    return <SiPostgresql className={className} color="#4169E1" />;
  }

  // PRISMA (Official Prisma Dark #2D3748)
  if (normalized.includes('prisma')) {
    return <SiPrisma className={className} color="#2D3748" />;
  }

  // FRAMER (Official Framer Blue #0055FF)
  if (normalized.includes('framer')) {
    return <SiFramer className={className} color="#0055FF" />;
  }

  // AWS (Official AWS Orange #FF9900)
  if (normalized.includes('aws') || normalized.includes('cloud')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <rect width="24" height="24" rx="4" fill="#232F3E" />
        <path d="M6 10.5h1.8l.6 2.2.6-2.2h1.8v5h-1.3v-3.4l-.7 3.4h-.9l-.7-3.4v3.4H6v-5zm6.5 0h1.8l1.2 5h-1.4l-.2-1h-1.2l-.2 1h-1.4l1.4-5zm.8 1.2l-.4 1.8h.8l-.4-1.8zm3.5-1.2h1.4l.8 3.5.8-3.5h1.4l-1.4 5h-1.2l-1.8-5z" fill="#FFFFFF" />
        <path d="M6 17.5c4 2 8 2 12 0" stroke="#FF9900" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  // STRIPE (Official Stripe Purple #635BFF)
  if (normalized.includes('stripe')) {
    return <SiStripe className={className} color="#635BFF" />;
  }

  // PYTHON (Official Python Blue #3776AB)
  if (normalized.includes('python')) {
    return <SiPython className={className} color="#3776AB" />;
  }

  // SUPABASE (Official Supabase Emerald #3ECF8E)
  if (normalized.includes('supabase')) {
    return <SiSupabase className={className} color="#3ECF8E" />;
  }

  // FIGMA (Official Figma Pink/Orange #F24E1E)
  if (normalized.includes('figma')) {
    return <SiFigma className={className} color="#F24E1E" />;
  }

  // VERCEL (Official Vercel Black)
  if (normalized.includes('vercel')) {
    return <SiVercel className={className} color="#000000" />;
  }

  // GRAPHQL (Official GraphQL Pink #E10098)
  if (normalized.includes('graphql')) {
    return <SiGraphql className={className} color="#E10098" />;
  }

  // OPENAI / AI (Official OpenAI SVG)
  if (normalized.includes('openai') || normalized.includes('ai') || normalized.includes('gpt')) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} color="#10A37F" {...props}>
        <path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.04 6.04 0 0 0-6.51-2.9 6.07 6.07 0 0 0-4.81-2.4 6.04 6.04 0 0 0-5.77 4.15A6.03 6.03 0 0 0 1.2 9.04a6.04 6.04 0 0 0 .74 7.12 5.98 5.98 0 0 0 .52 4.91 6.04 6.04 0 0 0 6.51 2.9 6.07 6.07 0 0 0 4.81 2.4 6.04 6.04 0 0 0 5.77-4.15 6.03 6.03 0 0 0 3.47-5.28 6.04 6.04 0 0 0-.74-7.12zM12 20.37a4.34 4.34 0 0 1-2.18-.58l.12-.07 3.63-2.1 1.77-1.02a.85.85 0 0 0 .43-.74v-4.9l1.46.85v4.22a4.37 4.37 0 0 1-5.23 4.34zm-7.61-3.66a4.33 4.33 0 0 1-.5-2.2 4.37 4.37 0 0 1 1.34-3.13l.12.08 3.63 2.1 1.77 1.02a.85.85 0 0 0 .86 0l4.24-2.45v1.7a.85.85 0 0 0-.01.07v4.22a4.36 4.36 0 0 1-6.26 1.45l-5.19-2.86zm-1.09-8.47a4.34 4.34 0 0 1 1.68-1.63l.12.07 3.63 2.1v2.04a.85.85 0 0 0 .43.74l4.25 2.45-1.46.85-5.18-2.99a4.36 4.36 0 0 1-3.47-5.63zm10.74-6.38a4.34 4.34 0 0 1 3.86 2.22l-.12.07-3.63 2.1v2.04a.85.85 0 0 0-.43.74l-4.25 2.45-1.46-.84v-5.98a4.36 4.36 0 0 1 6.03-2.8zm7.6 3.66a4.33 4.33 0 0 1 .5 2.2 4.37 4.37 0 0 1-1.34 3.13l-.12-.08-3.63-2.1-1.77-1.02a.85.85 0 0 0-.86 0l-4.24 2.45v-1.7a.85.85 0 0 0 .01-.07v-4.22a4.36 4.36 0 0 1 6.26-1.45l5.19 2.86zm1.09 8.47a4.34 4.34 0 0 1-1.68 1.63l-.12-.07-3.63-2.1v-2.04a.85.85 0 0 0-.43-.74l-4.25-2.45 1.46-.85 5.18 2.99a4.36 4.36 0 0 1 3.47 5.63zM12 13.88l-2.4-1.38 2.4-1.39 2.4 1.39-2.4 1.38z" />
      </svg>
    );
  }

  // DOCKER (Official Docker Blue #2496ED)
  if (normalized.includes('docker')) {
    return <SiDocker className={className} color="#2496ED" />;
  }

  // REDIS (Official Redis Red #DC382D)
  if (normalized.includes('redis')) {
    return <SiRedis className={className} color="#DC382D" />;
  }

  // MONGODB (Official MongoDB Green #47A248)
  if (normalized.includes('mongo')) {
    return <SiMongodb className={className} color="#47A248" />;
  }

  // FLUTTER (Official Flutter Blue #02569B)
  if (normalized.includes('flutter')) {
    return <SiFlutter className={className} color="#02569B" />;
  }

  // SWIFT (Official Swift Orange #F05138)
  if (normalized.includes('swift')) {
    return <SiSwift className={className} color="#F05138" />;
  }

  // KOTLIN (Official Kotlin Purple #7F52FF)
  if (normalized.includes('kotlin')) {
    return <SiKotlin className={className} color="#7F52FF" />;
  }

  // RUST (Official Rust Dark #000000)
  if (normalized.includes('rust')) {
    return <SiRust className={className} color="#000000" />;
  }

  // GO / GOLANG (Official Go Cyan #00ADD8)
  if (normalized.includes('go') || normalized.includes('golang')) {
    return <SiGo className={className} color="#00ADD8" />;
  }

  // VITE (Official Vite Purple #646CFF)
  if (normalized.includes('vite')) {
    return <SiVite className={className} color="#646CFF" />;
  }

  // ASTRO (Official Astro Orange #FF5D01)
  if (normalized.includes('astro')) {
    return <SiAstro className={className} color="#FF5D01" />;
  }

  // VUE (Official Vue Green #4FC08D)
  if (normalized.includes('vue')) {
    return <SiVuedotjs className={className} color="#4FC08D" />;
  }

  // Default fallback code icon
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#0C3823" strokeWidth="2" className={className} {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
