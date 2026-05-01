"use client";
import React, { useState, useEffect } from "react";
import { client } from '@/sanity/lib/client';
import { groq } from 'next-sanity';
import Link from "next/link";
import Image from "next/image";
import ProjectInquiryForm from '@/app/Components/form'; // Import the form component

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileServices, setShowMobileServices] = useState(false); // State for mobile services dropdown
  const [services, setServices] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Fetch services from Sanity
    const fetchServices = async () => {
      try {
        const servicesQuery = groq`
          *[_type == "service"] | order(_createdAt asc) {
            name,
            "slug": slug.current
          }
        `;
        const fetchedServices = await client.fetch(servicesQuery);
        setServices(fetchedServices);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Close mobile services dropdown when mobile menu closes
  useEffect(() => {
    if (!showMobileMenu) {
      setShowMobileServices(false);
    }
  }, [showMobileMenu]);

  return (
    <>
      <nav className={`bg-white text-gray-900 px-6 shadow-sm sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-1' : 'py-4'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Image */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <Image
                src="/image.png"
                alt="PENGOFFSEC Logo"
                width={scrolled ? 120 : 200}
                height={scrolled ? 48 : 80}
                className={`w-auto object-contain transition-all duration-300 ${
                  scrolled ? 'h-12' : 'h-20'
                }`}
                priority
              />
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-black hover:text-gray-900 transition-colors duration-200 font-medium relative group text-sm"
            >
              HOME
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gray-900 transition-all duration-200 group-hover:w-full"></span>
            </Link>

            {/* Services Dropdown - Desktop */}
            <div 
              className="relative"
              onMouseEnter={() => setShowServices(true)}
              onMouseLeave={() => setShowServices(false)}
            >
              <Link
                href="/services"
                className="text-black hover:text-gray-900 transition-colors duration-200 font-medium relative group text-sm cursor-pointer flex items-center gap-1"
              >
                SERVICES
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${showServices ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 9l-7 7-7-7" 
                  />
                </svg>
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gray-900 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              
              {/* Dropdown Menu - Desktop */}
              <div 
                className="absolute top-full left-0 pt-2 w-64"
                onMouseEnter={() => setShowServices(true)}
                onMouseLeave={() => setShowServices(false)}
              >
                {showServices && (
                  <div className="bg-white border-2 shadow-lg py-2">
                    {services.map((service: any, index: number) => (
                      <Link
                        key={index}
                        href={`/services/${service.slug}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-black hover:text-white transition-colors duration-200"
                        onClick={() => setShowServices(false)}
                      >
                        {service.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Link
              href="/about"
              className="text-black hover:text-gray-900 transition-colors duration-200 font-medium relative group text-sm"
            >
              ABOUT US
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gray-900 transition-all duration-200 group-hover:w-full"></span>
            </Link>

            <Link
              href="/contact"
              className="text-black hover:text-gray-900 transition-colors duration-200 font-medium relative group text-sm"
            >
              CONTACT US
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gray-900 transition-all duration-200 group-hover:w-full"></span>
            </Link>
          </div>

          {/* Get a Quote Button - Desktop */}
          <div className="hidden md:block">
            <button 
              onClick={() => setShowQuoteForm(true)}
              className={`bg-transparent border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-full font-medium transition-all duration-200 text-sm ${
                scrolled ? 'px-4 py-1' : 'px-6 py-2'
              }`}
            >
              Get a Quote
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex items-center"
            onClick={() => setShowMobileMenu(true)}
          >
            <svg
              className="w-6 h-6 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {showMobileMenu && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* Sidebar - Coming from right */}
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 md:hidden animate-slide-in-right flex flex-col">
            <div className="p-6 flex-1 overflow-y-auto">
              {/* Close button */}
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="absolute top-4 right-4"
              >
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Mobile Navigation Links */}
              <div className="mt-8 space-y-4">
                <Link
                  href="/"
                  className="block text-black hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
                  onClick={() => setShowMobileMenu(false)}
                >
                  HOME
                </Link>

                {/* Mobile Services Dropdown - Click to toggle with linkable SERVICES button */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href="/services"
                      className="flex-1 text-black hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      SERVICES
                    </Link>
                    <button
                      onClick={() => setShowMobileServices(!showMobileServices)}
                      className="p-2 text-black hover:text-gray-900 transition-colors duration-200"
                      aria-label="Toggle services menu"
                    >
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${showMobileServices ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M19 9l-7 7-7-7" 
                        />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Mobile Services Dropdown Menu - With bullets instead of lines */}
                  {showMobileServices && (
                    <div className="pl-4 space-y-2">
                      {services.map((service: any, index: number) => (
                        <Link
                          key={index}
                          href={`/services/${service.slug}`}
                          className="flex items-center gap-2 py-2 text-sm text-gray-600 hover:text-black transition-colors duration-200"
                          onClick={() => {
                            setShowMobileMenu(false);
                            setShowMobileServices(false);
                          }}
                        >
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                          {service.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/about"
                  className="block text-black hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
                  onClick={() => setShowMobileMenu(false)}
                >
                  ABOUT US
                </Link>

                <Link
                  href="/contact"
                  className="block text-black hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
                  onClick={() => setShowMobileMenu(false)}
                >
                  CONTACT US
                </Link>

                {/* Mobile Get a Quote Button */}
                <button 
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowQuoteForm(true);
                  }}
                  className="w-full bg-transparent border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-full font-medium transition-all duration-200 text-sm px-6 py-2 mt-4"
                >
                  Get a Quote
                </button>
              </div>
            </div>

            {/* Copyright at bottom */}
            <div className="border-t border-gray-200 p-6 text-center text-sm text-gray-600">
              <p>&copy; {new Date().getFullYear()} Penguin&apos;s Offensive Security. All rights reserved.</p>
            </div>
          </div>
        </>
      )}

      {/* Quote Form Modal */}
      <ProjectInquiryForm 
        isOpen={showQuoteForm} 
        onClose={() => setShowQuoteForm(false)} 
      />

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Navbar;