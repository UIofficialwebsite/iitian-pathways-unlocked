import React from "react";
import { Link } from "react-router-dom";

const ResourceHubSection = () => {
  return (
    <section className="py-24 bg-white font-['Inter',sans-serif]">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center mb-[70px]">
          <h1 className="text-[34px] font-semibold text-[#0f172a] mb-3 tracking-tight">
            Study Resources
          </h1>
          <p className="text-[#64748b] text-[17px] font-normal max-w-[700px] mx-auto leading-relaxed">
            A comprehensive array of academic materials designed to simplify complex concepts and enhance your learning journey.
          </p>
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Reference Batches (Blue) */}
          <Link 
            to="#" 
            className="group relative border border-[#d1d5db] rounded-[14px] p-[45px] h-[280px] flex flex-col overflow-hidden bg-[#f0f9ff] transition-all duration-300 hover:shadow-md"
          >
            {/* Hover Arrow */}
            <svg 
              className="absolute top-[30px] right-[30px] opacity-0 transition-opacity duration-300 z-20 group-hover:opacity-100" 
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

            {/* Content */}
            <div className="relative z-10">
              <h2 className="text-[26px] font-semibold text-[#0f172a] mb-4 tracking-tight w-[90%]">
                Reference Batches
              </h2>
              <p className="text-[#4b5563] text-[15px] font-normal leading-relaxed">
                Structured courses led by top faculty that break down complicated concepts into easily understandable modules for comprehensive exam readiness.
              </p>
            </div>
          </Link>

          {/* Card 2: Notes (Beige) */}
          <Link 
            to="#" 
            className="group relative border border-[#d1d5db] rounded-[14px] p-[45px] h-[280px] flex flex-col overflow-hidden bg-[#fffbeb] transition-all duration-300 hover:shadow-md"
          >
            {/* Hover Arrow */}
            <svg 
              className="absolute top-[30px] right-[30px] opacity-0 transition-opacity duration-300 z-20 group-hover:opacity-100" 
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>

            {/* Static Corner Fade */}
            <div 
              className="absolute bottom-0 right-0 w-full h-full pointer-events-none z-[1]" 
              style={{ background: 'radial-gradient(circle at bottom right, rgba(245, 158, 11, 0.12) 0%, transparent 70%)' }}
            />

            {/* Content */}
            <div className="relative z-10">
              <h2 className="text-[26px] font-semibold text-[#0f172a] mb-4 tracking-tight w-[90%]">
                Notes
              </h2>
              <p className="text-[#4b5563] text-[15px] font-normal leading-relaxed">
                Access detailed, concise study materials that simplify complex ideas into high-yield language for quick revision and deep conceptual clarity.
              </p>
            </div>
          </Link>

          {/* Card 3: Lectures (Green) */}
          <Link 
            to="#" 
            className="group relative border border-[#d1d5db] rounded-[14px] p-[45px] h-[280px] flex flex-col overflow-hidden bg-[#f0fdf4] transition-all duration-300 hover:shadow-md"
          >
            {/* Hover Arrow */}
            <svg 
              className="absolute top-[30px] right-[30px] opacity-0 transition-opacity duration-300 z-20 group-hover:opacity-100" 
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>

            {/* Static Corner Fade */}
            <div 
              className="absolute bottom-0 right-0 w-full h-full pointer-events-none z-[1]" 
              style={{ background: 'radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.12) 0%, transparent 70%)' }}
            />

            {/* Content */}
            <div className="relative z-10">
              <h2 className="text-[26px] font-semibold text-[#0f172a] mb-4 tracking-tight w-[90%]">
                Lectures
              </h2>
              <p className="text-[#4b5563] text-[15px] font-normal leading-relaxed">
                High-quality video sessions that provide step-by-step explanations, ensuring you master every concept with ease and practical insight.
              </p>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
};

export default ResourceHubSection;
