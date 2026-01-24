import React from "react";

const features = [
  {
    title: "1 Lakh+",
    description: "Benefitted students who have transformed their academic performance.",
    bgColor: "bg-[#fffbeb]", // Yellow
    fadeColor: "rgba(251, 191, 36, 0.12)",
    image: "https://res.cloudinary.com/dkywjijpv/image/upload/v1769288362/40328746312_uuvdif.png",
    imgStyle: "h-[160px] lg:h-[190px] w-auto object-contain", // Adjusted for mobile/PC
  },
  {
    title: "Expert Mentorship",
    description: "Curated by IIT students who understand what it takes to succeed.",
    bgColor: "bg-[#fff1f2]", // Pink
    fadeColor: "rgba(244, 63, 94, 0.12)",
    image: "https://res.cloudinary.com/dkywjijpv/image/upload/v1769288411/image_zulvw8.png",
    // Mobile: contain/cover based on need. PC: object-top
    imgStyle: "h-[180px] lg:h-[220px] w-full object-contain lg:object-cover lg:object-top", 
  },
  {
    title: "98% Positive",
    description: "Feedback from our community of passionate learners.",
    bgColor: "bg-[#ecfeff]", // Cyan
    fadeColor: "rgba(6, 182, 212, 0.12)",
    image: "https://res.cloudinary.com/dkywjijpv/image/upload/v1769288352/7081009_azrzqg.png",
    imgStyle: "h-[140px] lg:h-[170px] w-auto object-contain",
  },
  {
    title: "20k+ Network",
    description: "Strong community network of students and mentors.",
    bgColor: "bg-[#f5f3ff]", // Purple
    fadeColor: "rgba(139, 92, 246, 0.12)",
    image: "https://res.cloudinary.com/dkywjijpv/image/upload/v1769288346/image_9_lsbln5.png",
    imgStyle: "h-[180px] lg:h-[220px] w-auto object-contain",
  },
];

const WhyChooseUsSection = () => {
  return (
    <section className="py-24 bg-white font-['Inter',sans-serif]">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-[34px] font-semibold text-[#0f172a] mb-3 tracking-tight">
            A Platform Trusted by Students
          </h2>
          <p className="text-[#64748b] text-base leading-relaxed max-w-[700px] mx-auto font-normal">
            Unknown IITians aims to transform not just through words, but provide results with numbers through academic excellence and practical insights.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`
                group relative border border-[#d1d5db] rounded-xl overflow-hidden ${feature.bgColor} flex flex-col transition-all duration-500 ease-in-out hover:shadow-md
                /* Mobile: Height auto to fit image+text. PC: Fixed height that expands */
                h-auto lg:h-[300px] lg:hover:h-[420px]
              `}
            >
              {/* Static Corner Fade (Background) */}
              <div 
                className="absolute bottom-0 right-0 w-full h-full pointer-events-none z-[1]" 
                style={{ background: `radial-gradient(circle at bottom right, ${feature.fadeColor} 0%, transparent 70%)` }}
              />

              {/* MOBILE LAYOUT:
                  - Flex Column
                  - Image First (order-1)
                  - Text Second (order-2)
                  
                  PC LAYOUT:
                  - Image is Absolute Bottom (Hidden/Sliding)
                  - Text is Top (Padded)
              */}

              {/* 1. IMAGE SECTION */}
              <div className={`
                /* Mobile Styles: Relative, Visible, Order-1, Centered */
                relative w-full flex justify-center items-end order-1 pt-6 pb-2 lg:hidden
                /* PC Styles: Absolute, Bottom aligned, Hidden initially, Slide animation */
                lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:h-[220px] lg:p-0 lg:pt-0 lg:pb-0 lg:order-none lg:translate-y-full lg:group-hover:translate-y-0 lg:transition-transform lg:duration-500 lg:ease-out lg:flex lg:z-[5] lg:pointer-events-none
              `}>
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  className={`max-w-[90%] ${feature.imgStyle}`} 
                />
              </div>

              {/* 2. TEXT CONTENT SECTION */}
              <div className={`
                relative z-[10] p-6 lg:p-8 
                /* Mobile: Order-2 (After Image), Center Aligned */
                order-2 text-center
                /* PC: Order-none (Default), Top Aligned (justify-start from parent), Left Aligned Text? No, Center per design */
                lg:pb-0 lg:order-none
              `}>
                <h3 className="text-[26px] lg:text-[30px] font-semibold text-[#0f172a] mb-3 lg:mb-4 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-[#4b5563] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
