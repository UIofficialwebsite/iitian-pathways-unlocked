import React from "react";
import { Link } from "react-router-dom";
import { InfiniteSlider } from "./ui/infinite-slider";

const ResourceHubSection = () => {
  const resources = [
    {
      title: "Reference Batches",
      description: "Structured courses led by top faculty that break down complicated concepts into easily understandable modules for comprehensive exam readiness.",
      bgClass: "bg-[#f0f9ff]",
      borderClass: "border-[#d1d5db]",
      gradientColor: "rgba(14, 165, 233, 0.12)",
      iconColor: "#0f172a", // Dark Blue/Black
      imageSrc: "https://res.cloudinary.com/dkywjijpv/image/upload/v1769295469/image_10_r87scl.png",
      imageHeight: "h-[160px]",
    },
    {
      title: "Notes",
      description: "Access detailed, concise study materials that simplify complex ideas into high-yield language for quick revision and deep conceptual clarity.",
      bgClass: "bg-[#fffbeb]",
      borderClass: "border-[#d1d5db]",
      gradientColor: "rgba(245, 158, 11, 0.12)",
      iconColor: "#0f172a",
      imageSrc: "https://res.cloudinary.com/dkywjijpv/image/upload/v1769294911/download_4_psl2o2.png",
      imageHeight: "h-[150px]",
    },
    {
      title: "Lectures",
      description: "High-quality video sessions that provide step-by-step explanations, ensuring you master every concept with ease and practical insight.",
      bgClass: "bg-[#f0fdf4]",
      borderClass: "border-[#d1d5db]",
      gradientColor: "rgba(34, 197, 94, 0.12)",
      iconColor: "#0f172a",
      imageSrc: "https://res.cloudinary.com/dkywjijpv/image/upload/v1769293814/unnamed_13_xriziz.png",
      imageHeight: "h-[170px]",
    },
  ];

  // Common Card Content Component to avoid duplication between Mobile/Desktop views
  const ResourceCardContent = ({ resource, isDesktop = false }: { resource: typeof resources[0], isDesktop?: boolean }) => (
    <>
      <svg 
        className={`absolute top-[25px] right-[25px] ${isDesktop ? 'lg:top-[30px] lg:right-[30px] opacity-100 lg:opacity-0 lg:group-hover:opacity-100' : 'z-20'} transition-opacity duration-300`} 
        width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={resource.iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      >
        <line x1="7" y1="17" x2="17" y2="7"></line>
        <polyline points="7 7 17 7 17 17"></polyline>
      </svg>

      {/* Static Corner Fade */}
      <div 
        className="absolute bottom-0 right-0 w-full h-full pointer-events-none z-[1]" 
        style={{ background: `radial-gradient(circle at bottom right, ${resource.gradientColor} 0%, transparent 70%)` }}
      />

      {/* Content Text */}
      <div className={`relative z-10 mb-6 ${isDesktop ? 'lg:mb-0 text-center lg:text-left lg:pb-[140px]' : 'text-center'}`}>
        <h2 className={`text-[22px] ${isDesktop ? 'lg:text-[26px]' : ''} font-semibold text-[#0f172a] mb-3 ${isDesktop ? 'lg:mb-4' : ''} tracking-tight w-full ${isDesktop ? 'lg:w-[90%]' : ''}`}>
          {resource.title}
        </h2>
        <p className={`text-[#4b5563] text-[14px] ${isDesktop ? 'lg:text-[15px]' : ''} font-normal leading-relaxed w-full`}>
          {resource.description}
        </p>
      </div>

      {/* Image Section */}
      <div className={`
        relative mt-auto flex justify-center 
        ${isDesktop ? 'lg:mt-0 lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:z-[5] lg:transition-transform lg:duration-500 lg:ease-out lg:group-hover:scale-105 lg:group-hover:-translate-y-4' : ''}
      `}>
        <img 
          src={resource.imageSrc} 
          alt={resource.title} 
          className={`${resource.imageHeight} w-auto object-contain`}
        />
      </div>
    </>
  );

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

        {/* --- MOBILE VIEW: Infinite Slider (One Row) --- */}
        <div className="block md:hidden -mx-6">
          <InfiniteSlider 
            gap={20} 
            duration={45} // Slower speed for readability
            durationOnHover={200} // Significant slowdown (almost pause) on hover/touch
          >
            {resources.map((resource, index) => (
              <Link 
                key={`mobile-${index}`}
                to="#" 
                className={`
                  group relative border ${resource.borderClass} rounded-[14px] flex flex-col overflow-hidden ${resource.bgClass} transition-all duration-300 hover:shadow-lg
                  min-w-[85vw] sm:min-w-[350px] h-auto p-8
                `}
              >
                <ResourceCardContent resource={resource} isDesktop={false} />
              </Link>
            ))}
          </InfiniteSlider>
        </div>

        {/* --- DESKTOP VIEW: Static Grid (3 Columns) --- */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {resources.map((resource, index) => (
            <Link 
              key={`desktop-${index}`}
              to="#" 
              className={`
                group relative border ${resource.borderClass} rounded-[14px] flex flex-col overflow-hidden ${resource.bgClass} transition-all duration-300 hover:shadow-lg
                lg:h-[380px] lg:p-[45px] lg:min-w-0
              `}
            >
              <ResourceCardContent resource={resource} isDesktop={true} />
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ResourceHubSection;
