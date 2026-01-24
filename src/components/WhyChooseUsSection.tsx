import React from "react";

const features = [
  {
    title: "1 Lakh+",
    description: "Benefitted students who have transformed their academic performance.",
    bgColor: "bg-[#fffbeb]", // Yellow
    fadeColor: "rgba(251, 191, 36, 0.12)",
    image: "https://res.cloudinary.com/dkywjijpv/image/upload/v1769288362/40328746312_uuvdif.png",
    imgStyle: "h-[180px] w-auto object-contain mb-[-10px]", // Standard sizing
  },
  {
    title: "Expert Mentorship",
    description: "Curated by IIT students who understand what it takes to succeed.",
    bgColor: "bg-[#fff1f2]", // Pink
    fadeColor: "rgba(244, 63, 94, 0.12)",
    image: "https://res.cloudinary.com/dkywjijpv/image/upload/v1769288411/image_zulvw8.png",
    // Crop strategy: Anchored to top to show face/chest, fixed height to cut off lower body
    imgStyle: "h-[210px] w-full object-cover object-top mb-[-20px]", 
  },
  {
    title: "98% Positive",
    description: "Feedback from our community of passionate learners.",
    bgColor: "bg-[#ecfeff]", // Cyan
    fadeColor: "rgba(6, 182, 212, 0.12)",
    image: "https://res.cloudinary.com/dkywjijpv/image/upload/v1769288352/7081009_azrzqg.png",
    imgStyle: "h-[170px] w-auto object-contain mb-[-10px]",
  },
  {
    title: "20k+ Network",
    description: "Strong community network of students and mentors.",
    bgColor: "bg-[#f5f3ff]", // Purple
    fadeColor: "rgba(139, 92, 246, 0.12)",
    image: "https://res.cloudinary.com/dkywjijpv/image/upload/v1769288346/image_9_lsbln5.png",
    imgStyle: "h-[180px] w-auto object-contain mb-[-10px]",
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

        {/* Stats Grid: 4 cols on PC, 2 cols on Tablet/Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative border border-[#d1d5db] rounded-xl p-8 min-h-[280px] flex flex-col justify-start text-center overflow-hidden transition-all duration-300 hover:shadow-md ${feature.bgColor}`}
            >
              {/* Static Corner Fade (Always Visible) */}
              <div 
                className="absolute bottom-0 right-0 w-full h-full pointer-events-none z-[1]" 
                style={{ background: `radial-gradient(circle at bottom right, ${feature.fadeColor} 0%, transparent 70%)` }}
              />

              {/* Text Content (Pushed up slightly on hover to make room for image) */}
              <div className="relative z-[10] transition-transform duration-500 group-hover:-translate-y-2">
                <h3 className="text-[30px] font-semibold text-[#0f172a] mb-4 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-[#4b5563] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Hover Image Animation:
                 - Initially hidden below the card (translate-y-[120%])
                 - Slides up on hover (translate-y-0)
                 - Visible only on PC (hidden md:block)
              */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-center z-[5] translate-y-[120%] transition-transform duration-500 ease-out group-hover:translate-y-0 hidden md:flex pointer-events-none">
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  className={`max-w-[85%] ${feature.imgStyle}`} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
