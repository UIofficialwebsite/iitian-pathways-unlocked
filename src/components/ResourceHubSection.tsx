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
      iconColor: "#0f172a",
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

  // Unified Card Content - Enforcing PC Layout (absolute image, fixed padding) on Mobile too
  const ResourceCardContent = ({ resource }: { resource: typeof resources[0] }) => (
    <>
      <svg 
        className="absolute top-[25px] right-[25px] lg:top-[30px] lg:right-[30px] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 z-20" 
        width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={resource.iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      >
        <line x1="7" y1="17" x2="17" y2="7"></line>
        <polyline points="7 7 17 7 17 17"></polyline>
      </svg>

      <div 
        className="absolute bottom-0 right-0 w-full h-full pointer-events-none z-[1]" 
        style={{ background: `radial-gradient(circle at bottom right, ${resource.gradientColor} 0%, transparent 70%)` }}
      />

      {/* TEXT SECTION:
        - Forced 'pb-[140px]' on ALL screens to reserve space for the image (matches PC dimension logic).
      */}
      <div className="relative z-10 text-center lg:text-left pb-[140px]">
        <h2 className="text-[22px] lg:text-[26px] font-semibold text-[#0f172a] mb-3 lg:mb-4 tracking-tight w-full lg:w-[90%]">
          {resource.title}
        </h2>
        <p className="text-[#4b5563] text-[14px] lg:text-[15px] font-normal leading-relaxed w-full">
          {resource.description}
        </p>
      </div>

      {/* IMAGE SECTION:
        - Forced 'absolute bottom-0' on ALL screens (matches PC dimension/layout logic).
      */}
      <div className="
        absolute bottom-0 left-0 right-0 z-[5] flex justify-center
        lg:transition-transform lg:duration-500 lg:ease-out lg:group-hover:scale-105 lg:group-hover:-translate-y-4
      ">
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
        {/* - Added 'pb-8' for shadow space.
           - Removed static grid classes.
        */}
        <div className="block md:hidden -mx-6 pb-8">
          <InfiniteSlider 
            gap={20} 
            duration={45} 
            durationOnHover={200}
          >
            {resources.map((resource, index) => (
              <Link 
                key={`mobile-${index}`}
                to="#" 
                // FIXED DIMENSIONS:
                // - Forced 'h-[380px]' (Same as PC)
                // - Forced 'p-[45px]' (Same as PC padding for consistency)
                className={`
                  group relative border ${resource.borderClass} rounded-[14px] flex flex-col overflow-hidden ${resource.bgClass} transition-all duration-300 hover:shadow-lg snap-center
                  min-w-[85vw] sm:min-w-[350px]
                  h-[380px] p-[30px] sm:p-[45px]
                `}
              >
                <ResourceCardContent resource={resource} />
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
                h-[380px] p-[45px] min-w-0
              `}
            >
              <ResourceCardContent resource={resource} />
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ResourceHubSection;
