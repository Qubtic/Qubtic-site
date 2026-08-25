import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CaseStudyLayout from '@/components/portfolio/CaseStudyLayout';
import { getProjectsDb } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const projects = await getProjectsDb();
  const project = projects.find((p) => p.slug === slug);

  if (!project) return { title: 'Project Not Found' };

  return {
    title: `${project.title} | Case Study`,
    description: project.challenge ? project.challenge.substring(0, 160) + '...' : project.title,
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projects = await getProjectsDb();
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  const slugs = projects.map((p) => p.slug);
  const currentIndex = slugs.indexOf(slug);
  const prevSlug = currentIndex > 0 ? slugs[currentIndex - 1] : undefined;
  const nextSlug = currentIndex < slugs.length - 1 ? slugs[currentIndex + 1] : undefined;

  // Format results for CaseStudyLayout component
  const formattedResults = (project.results || []).map((res) => {
    if (typeof res === 'string') {
      return { label: res, value: null };
    }
    return res;
  });

  const formattedProject = {
    title: project.title,
    client: project.client || 'Client',
    category: project.category,
    year: project.year || '2026',
    liveUrl: project.liveUrl,
    image: project.image,
    challenge: project.challenge || '',
    solution: project.solution || '',
    results: formattedResults,
    techStack: project.techStack || [],
    testimonial: {
      quote: project.testimonial?.quote || 'Exceptional delivery and technical architecture.',
      author: project.testimonial?.author || project.client || 'Client Lead',
      role: project.testimonial?.role || 'Director',
    },
  };

  return (
    <CaseStudyLayout
      project={formattedProject}
      prevSlug={prevSlug}
      nextSlug={nextSlug}
    />
  );
}
