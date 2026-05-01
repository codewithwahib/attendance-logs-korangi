"use client";
// app/services/[slug]/ServiceDetailClient.tsx
import React, { useState } from "react";
import Navbar from "@/app/Components/navbar";
import Footer from "@/app/Components/footer";
import { PortableText } from '@portabletext/react';
import ProjectInquiryForm from "@/app/Components/form";
import Image from "next/image";

// Define types
interface Service {
  name: string;
  bigDescription: any;
  image: string;
  price?: string;
}

export default function ServiceDetailClient({ service }: { service: Service }) {
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const handleAskForDemo = () => {
    setShowDemoForm(true);
  };

  const handleRequestQuote = () => {
    setShowQuoteForm(true);
  };

  const handleCloseForms = () => {
    setShowDemoForm(false);
    setShowQuoteForm(false);
  };

  return (
    <>
      <Navbar />
      <section className="bg-white text-black">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          
          {/* Main content - with smaller image */}
          <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12">
            
            {/* Left side - Image (smaller) */}
            <div className="flex-1 flex justify-center w-full">
              <div className="w-full max-w-md bg-gray-200 overflow-hidden shadow-lg relative aspect-[4/3] md:h-[400px] md:aspect-auto">
                {service.image ? (
                  <Image 
                    src={service.image} 
                    alt={service.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image Available
                  </div>
                )}
              </div>
            </div>
            
            {/* Right side - Content - adjusted position */}
            <div className="flex-1 -mt-2 md:-mt-5">
              {/* Service Name - fetched from Sanity */}
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {service.name}
              </h1>
              
              {/* Price if available */}
              {service.price && (
                <div className="mb-4">
                  <span className="inline-block bg-transparent border-2 border-black text-black px-6 py-2 rounded-full font-medium text-sm">
                    {service.price}
                  </span>
                </div>
              )}
              
              {/* Big Description */}
              <div className="space-y-3 text-sm md:text-base text-gray-700 mb-6">
                {typeof service.bigDescription === 'string' ? (
                  <p className="leading-relaxed">
                    {service.bigDescription}
                  </p>
                ) : (
                  <PortableText value={service.bigDescription} />
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-10">
                <button 
                  onClick={handleAskForDemo}
                  className="bg-transparent border-2 border-black text-black hover:bg-black hover:text-white px-7 py-3 rounded-full font-medium transition-all duration-200 text-sm flex-1 cursor-pointer"
                  type="button"
                >
                  Ask For Demo
                </button>
                <button 
                  onClick={handleRequestQuote}
                  className="bg-black text-white border-2 border-black hover:bg-white hover:text-black px-7 py-3 rounded-full font-medium transition-all duration-200 text-sm flex-1 cursor-pointer"
                  type="button"
                >
                  Request A Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Demo Form Modal */}
      {showDemoForm && (
        <ProjectInquiryForm 
          isOpen={showDemoForm}
          onClose={handleCloseForms}
          initialInquiry={`Demo - ${service.name}`}
          readOnlyInquiry={true}
        />
      )}

      {/* Quote Form Modal */}
      {showQuoteForm && (
        <ProjectInquiryForm 
          isOpen={showQuoteForm}
          onClose={handleCloseForms}
          initialInquiry={`Quote - ${service.name}`}
          readOnlyInquiry={true}
        />
      )}
      
      <Footer />
    </>
  );
}