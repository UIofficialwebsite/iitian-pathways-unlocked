import React from "react";

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

        {/* Stats Grid: 4 cols on PC, 2 cols on Tablet/Large Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Block 1: Yellow */}
          <div className="relative border border-[#d1d5db] rounded-xl p-8 min-h-[250px] flex flex-col justify-center text-center overflow-hidden bg-[#fffbeb] transition-all duration-300 hover:shadow-sm">
            {/* Corner Fade */}
            <div 
              className="absolute bottom-0 right-0 w-full h-full pointer-events-none z-[1]" 
              style={{ background: 'radial-gradient(circle at bottom right, rgba(251, 191, 36, 0.12) 0%, transparent 70%)' }}
            />
            <div className="relative z-[2]">
              <h3 className="text-[30px] font-semibold text-[#0f172a] mb-4 tracking-tight">1 Lakh+</h3>
              <p className="text-[#4b5563] text-sm leading-relaxed">
                Benefitted students who have transformed their academic performance.
              </p>
            </div>
          </div>

          {/* Block 2: Pink */}
          <div className="relative border border-[#d1d5db] rounded-xl p-8 min-h-[250px] flex flex-col justify-center text-center overflow-hidden bg-[#fff1f2] transition-all duration-300 hover:shadow-sm">
             <div 
              className="absolute bottom-0 right-0 w-full h-full pointer-events-none z-[1]" 
              style={{ background: 'radial-gradient(circle at bottom right, rgba(244, 63, 94, 0.12) 0%, transparent 70%)' }}
            />
            <div className="relative z-[2]">
              <h3 className="text-[30px] font-semibold text-[#0f172a] mb-4 tracking-tight">Expert Mentorship</h3>
              <p className="text-[#4b5563] text-sm leading-relaxed">
                Curated by IIT students who understand what it takes to succeed.
              </p>
            </div>
          </div>

          {/* Block 3: Cyan */}
          <div className="relative border border-[#d1d5db] rounded-xl p-8 min-h-[250px] flex flex-col justify-center text-center overflow-hidden bg-[#ecfeff] transition-all duration-300 hover:shadow-sm">
             <div 
              className="absolute bottom-0 right-0 w-full h-full pointer-events-none z-[1]" 
              style={{ background: 'radial-gradient(circle at bottom right, rgba(6, 182, 212, 0.12) 0%, transparent 70%)' }}
            />
            <div className="relative z-[2]">
              <h3 className="text-[30px] font-semibold text-[#0f172a] mb-4 tracking-tight">98% Positive</h3>
              <p className="text-[#4b5563] text-sm leading-relaxed">
                Feedback from our community of passionate learners.
              </p>
            </div>
          </div>

          {/* Block 4: Purple */}
          <div className="relative border border-[#d1d5db] rounded-xl p-8 min-h-[250px] flex flex-col justify-center text-center overflow-hidden bg-[#f5f3ff] transition-all duration-300 hover:shadow-sm">
             <div 
              className="absolute bottom-0 right-0 w-full h-full pointer-events-none z-[1]" 
              style={{ background: 'radial-gradient(circle at bottom right, rgba(139, 92, 246, 0.12) 0%, transparent 70%)' }}
            />
            <div className="relative z-[2]">
              <h3 className="text-[30px] font-semibold text-[#0f172a] mb-4 tracking-tight">20k+ Network</h3>
              <p className="text-[#4b5563] text-sm leading-relaxed">
                Strong community network of students and mentors.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
