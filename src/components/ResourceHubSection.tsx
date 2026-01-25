import React from "react";
import { Link } from "react-router-dom";

const ResourceHubSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-white font-['Inter',sans-serif] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center mb-[40px] lg:mb-[70px]">
          <h1 className="text-[28px] lg:text-[34px] font-semibold text-[#0f172a] mb-3 tracking-tight">
            Study Resources
          </h1>
          <p className="text-[#64748b] text-[15px] lg:text-[17px] font-normal max-w-[700px] mx-auto leading-relaxed">
            A comprehensive array of academic materials designed to simplify complex concepts and enhance your learning journey.
          </p>
        </div>

        {/* Resource Grid / Scroll Container */}
        <div className="
          flex overflow-x-auto snap-x snap-mandatory gap-0 pb-8 -mx-6 px-6
          md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:pb-0 md:mx-0 md:px-0 md:overflow-visible
          scrollbar-hide
          [scroll-snap-stop:always]
        ">
          
          {/* Card 1: Reference Batches (Blue) */}
          <Link 
            to="#" 
            className="
              group relative border border-[#d1d5db] rounded-[14px] flex flex-col overflow-hidden bg-[#f0f9ff] transition-all duration-300 hover:shadow-lg snap-center
              min-w-[calc(100vw-48px)] w-[calc(100vw-48px)] aspect-square mx-3 p-6
              lg:h-[380px] lg:p-[45px] lg:min-w-0 lg:w-auto lg:aspect-auto lg:mx-0
            "
          >
            {/* Arrow: Visible on ALL devices now */}
            <svg 
              className="absolute top-[25px] right-[25px] lg:top-[30px] lg:right-[30px] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 z-20" 
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>

            {/* Static Corner Fade */}
            <div 
              className="absolute bottom-0 right-0 w-full h-full pointer-events-none z-[1]" 
              style={{ background: 'radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.12) 0%, transparent 70%)' }}
            />

            {/* Content (Text) */}
            <div className="relative z-10 mb-6 lg:mb-0 text-center lg:text-left lg:pb-[140px]">
              <h2 className="text-[22px] lg:text-[26px] font-semibold text-[#0f172a] mb-3 lg:mb-4 tracking-tight w-full lg:w-[90%]">
                Reference Batches
              </h2>
              <p className="text-[#4b5563] text-[14px] lg:text-[15px] font-normal leading-relaxed w-full">
                Structured courses led by top faculty that break down complicated concepts into easily understandable modules for comprehensive exam readiness.
              </p>
            </div>

            {/* Image Section */}
            <div className="
              relative mt-auto flex justify-center 
              lg:mt-0 lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:z-[5] 
              lg:transition-transform lg:duration-500 lg:ease-out lg:group-hover:scale-105 lg:group-hover:-translate-y-4
            ">
              <img 
                src="https://res.cloudinary.com/dkywjijpv/image/upload/v1769295469/image_10_r87scl.png" 
                alt="Reference Batches" 
                className="h-[160px] w-auto object-contain lg:h-[160px]"
              />
            </div>
          </Link>

          {/* Card 2: Notes (Beige) */}
          <Link 
            to="#" 
            className="
              group relative border border-[#d1d5db] rounded-[14px] flex flex-col overflow-hidden bg-[#fffbeb] transition-all duration-300 hover:shadow-lg snap-center
              min-w-[calc(100vw-48px)] w-[calc(100vw-48px)] aspect-square mx-3 p-6
              lg:h-[380px] lg:p-[45px] lg:min-w-0 lg:w-auto lg:aspect-auto lg:mx-0
            "
          >
            <svg 
              className="absolute top-[25px] right-[25px] lg:top-[30px] lg:right-[30px] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 z-20" 
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>

            <div 
              className="absolute bottom-0 right-0 w-full h-full pointer-events-none z-[1]" 
              style={{ background: 'radial-gradient(circle at bottom right, rgba(245, 158, 11, 0.12) 0%, transparent 70%)' }}
            />

            <div className="relative z-10 mb-6 lg:mb-0 text-center lg:text-left lg:pb-[140px]">
              <h2 className="text-[22px] lg:text-[26px] font-semibold text-[#0f172a] mb-3 lg:mb-4 tracking-tight w-full lg:w-[90%]">
                Notes
              </h2>
              <p className="text-[#4b5563] text-[14px] lg:text-[15px] font-normal leading-relaxed w-full">
                Access detailed, concise study materials that simplify complex ideas into high-yield language for quick revision and deep conceptual clarity.
              </p>
            </div>

            <div className="
              relative mt-auto flex justify-center 
              lg:mt-0 lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:z-[5] 
              lg:transition-transform lg:duration-500 lg:ease-out lg:group-hover:scale-105 lg:group-hover:-translate-y-4
            ">
              <img 
                src="https://res.cloudinary.com/dkywjijpv/image/upload/v1769294911/download_4_psl2o2.png" 
                alt="Notes" 
                className="h-[150px] w-auto object-contain lg:h-[150px]"
              />
            </div>
          </Link>

          {/* Card 3: Lectures (Green) */}
          <Link 
            to="#" 
            className="
              group relative border border-[#d1d5db] rounded-[14px] flex flex-col overflow-hidden bg-[#f0fdf4] transition-all duration-300 hover:shadow-lg snap-center
              min-w-[calc(100vw-48px)] w-[calc(100vw-48px)] aspect-square mx-3 p-6
              lg:h-[380px] lg:p-[45px] lg:min-w-0 lg:w-auto lg:aspect-auto lg:mx-0
            "
          >
            <svg 
              className="absolute top-[25px] right-[25px] lg:top-[30px] lg:right-[30px] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 z-20" 
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>

            <div 
              className="absolute bottom-0 right-0 w-full h-full pointer-events-none z-[1]" 
              style={{ background: 'radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.12) 0%, transparent 70%)' }}
            />

            <div className="relative z-10 mb-6 lg:mb-0 text-center lg:text-left lg:pb-[140px]">
              <h2 className="text-[22px] lg:text-[26px] font-semibold text-[#0f172a] mb-3 lg:mb-4 tracking-tight w-full lg:w-[90%]">
                Lectures
              </h2>
              <p className="text-[#4b5563] text-[14px] lg:text-[15px] font-normal leading-relaxed w-full">
                High-quality video sessions that provide step-by-step explanations, ensuring you master every concept with ease and practical insight.
              </p>
            </div>

            <div className="
              relative mt-auto flex justify-center 
              lg:mt-0 lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:z-[5] 
              lg:transition-transform lg:duration-500 lg:ease-out lg:group-hover:scale-105 lg:group-hover:-translate-y-4
            ">
              <img 
                src="https://res.cloudinary.com/dkywjijpv/image/upload/v1769293814/unnamed_13_xriziz.png" 
                alt="Lectures" 
                className="h-[170px] w-auto object-contain lg:h-[170px]"
              />
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
};

export default ResourceHubSection;
