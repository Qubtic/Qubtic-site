import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ServiceDetail from '@/components/services/ServiceDetail';
import { getServicesDb } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const services = await getServicesDb();
  const service = services.find((s) => s.slug === slug);

  if (!service) return { title: 'Service Not Found' };

  return {
    title: `${service.title} - qubtic Services`,
    description: service.shortDescription,
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const services = await getServicesDb();
  const service = services.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  // Format process items to match Step interface { title, description }
  const formattedProcess = (service.process || []).map((step) => ({
    title: (step as any).name || (step as any).title || '',
    description: step.description || '',
  }));

  // Format long description as array of paragraphs
  const longDescArray = service.longDescription
    ? Array.isArray(service.longDescription)
      ? service.longDescription
      : [service.longDescription]
    : [service.shortDescription];

  const serviceData = {
    title: service.title,
    subtitle: service.shortDescription,
    longDescription: longDescArray,
    process: formattedProcess,
    features: service.features || [],
    techStack: service.techStack || [],
    faq: service.faq || [],
  };

  return <ServiceDetail service={serviceData} />;
}
