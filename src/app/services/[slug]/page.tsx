// app/services/[slug]/page.tsx
import { client } from '@/sanity/lib/client';
import { groq } from 'next-sanity';
import ServiceDetailClient from './ServiceDetailClient';

// Generate static params for all services (required for static export)
export async function generateStaticParams() {
  try {
    const services = await client.fetch(
      groq`*[_type == "service"] {
        "slug": slug.current
      }`
    );
    
    return services.map((service: { slug: string }) => ({
      slug: service.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Define types
interface Service {
  name: string;
  bigDescription: any;
  image: string;
  price?: string;
}

// Fetch service data on the server
async function getService(slug: string): Promise<Service | null> {
  try {
    const serviceQuery = groq`
      *[_type == "service" && slug.current == $slug][0] {
        name,           
        bigDescription,
        "image": image.asset->url,
        price
      }
    `;
    
    const service = await client.fetch(serviceQuery, { slug });
    return service;
  } catch (error) {
    console.error("Error fetching service:", error);
    return null;
  }
}

export default async function ServiceDetailPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const service = await getService(params.slug);
  
  if (!service) {
    return null;
  }
  
  return <ServiceDetailClient service={service} />;
}