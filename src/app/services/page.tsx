import React from "react";
import Navbar from "../Components/navbar";
import Footer from "../Components/footer";
import { client } from '@/sanity/lib/client';
import { groq } from 'next-sanity';
import Image from "next/image";

// Fetch services from Sanity with error handling
async function getServices() {
  const servicesQuery = groq`
    *[_type == "service"] | order(_createdAt asc) {
      _id,
      name,
      "slug": slug.current,
      smallDescription,
      "image": image.asset->url
    }
  `;
  
  try {
    const services = await client.fetch(servicesQuery, {}, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    return services;
  } catch (error) {
    console.error("Error fetching services from Sanity:", error);
    return []; // Return empty array on error
  }
}

const Services = async () => {
  const services = await getServices();

  if (!services || services.length === 0) {
    return (
      <>
        <Navbar/>
        <section className="bg-white text-black">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Our Services
            </h2>
            <p className="text-center text-gray-700">No services found.</p>
          </div>
        </section>
        <Footer/>
      </>
    );
  }

  return (
    <>
      <Navbar/>
      <section className="bg-white text-black">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          
          {/* Section Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Our Services
          </h2>
          
          {/* Services Grid - centered */}
          <div className="flex flex-col md:flex-row flex-wrap justify-center items-stretch gap-8">
            {services.map((service: any) => (
              <div 
                key={service._id} 
                className="w-full md:w-80 border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col"
              >
                {/* Image on top - full size */}
                <div className="w-full h-72 overflow-hidden relative">
                  {service.image ? (
                    <Image 
                      src={service.image} 
                      alt={service.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 320px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                  {/* Service Name */}
                  <h3 className="text-lg font-bold mb-2">
                    {service.name}
                  </h3>
                  
                  {/* Service Description */}
                  <p className="text-xs text-gray-700 mb-3 flex-grow leading-relaxed">
                    {service.smallDescription}
                  </p>
                  
                  {/* Read More Link */}
                  <a 
                    href={`/services/${service.slug}`}
                    className="inline-flex items-center font-bold text-black text-sm hover:underline group mt-auto"
                  >
                    Read More
                    <span className="ml-1 group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer/>
    </>
  );
};

export default Services;