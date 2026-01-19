import React from 'react';
import { Video, FileText, LayoutDashboard, BarChart3, MessageCircle, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const SSPPortalSection: React.FC = () => {
  const features = [
    {
      icon: Video,
      title: "Recorded Lectures",
      description: "HD recordings available for unlimited replay.",
    },
    {
      icon: FileText,
      title: "Study Materials",
      description: "PDFs, notes, and practice sheets vault.",
    },
    {
      icon: LayoutDashboard,
      title: "Student Dashboard",
      description: "Track goals and manage your schedule.",
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Data-driven insights on your performance.",
    },
    {
      icon: MessageCircle,
      title: "Doubt Resolution",
      description: "Rapid answers from expert instructors.",
    },
    {
      icon: ClipboardCheck,
      title: "Test & Practice",
      description: "Assignments and simulated mock exams.",
    }
  ];

  // Identical Gradients to SubjectsSection
  const gradients = [
    "bg-gradient-to-b from-[#f0f7ff] to-[#e0f2fe]", // Blue
    "bg-gradient-to-b from-[#f5f3ff] to-[#ede9fe]", // Purple
    "bg-gradient-to-b from-[#ecfdf5] to-[#d1fae5]", // Emerald
    "bg-gradient-to-b from-[#fffbeb] to-[#fef3c7]", // Amber
    "bg-gradient-to-b from-[#fff1f2] to-[#ffe4e6]", // Rose
    "bg-gradient-to-b from-[#eef2ff] to-[#e0e7ff]", // Indigo
  ];

  return (
    <section id="ssp" className="scroll-mt-24 w-full font-['Inter',sans-serif]">
       {/* Container matching SubjectsSection style */}
       <div className="bg-white rounded-[24px] p-5 md:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-black/5 max-w-[850px] mx-auto">
         
         <h2 className="text-[20px] md:text-[22px] font-semibold text-black mb-6 md:mb-8 tracking-tight">
           Student Service Portal
         </h2>
         
         {/* 2-Column Grid on Mobile & Desktop */}
         <div className="grid grid-cols-2 gap-3">
            {features.map((feature, idx) => {
               const Icon = feature.icon;
               const gradientClass = gradients[idx % gradients.length];
               
               return (
                 <div 
                   key={idx} 
                   className={cn(
                     // Layout & Shape
                     "group flex flex-col justify-start px-4 py-4 md:px-6 md:py-5 rounded-lg cursor-pointer h-full",
                     "border-[1.2px] border-transparent transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                     // Hover Effects (Same as Subjects)
                     "hover:bg-white hover:border-black hover:shadow-sm",
                     gradientClass
                   )}
                 >
                   {/* Header: Icon + Title */}
                   <div className="flex items-center gap-2 mb-2">
                     <Icon className="w-4 h-4 md:w-5 md:h-5 text-black/70 group-hover:text-black transition-colors" />
                     <h3 className="text-[13px] md:text-[15px] font-semibold text-black leading-tight">
                        {feature.title}
                     </h3>
                   </div>
                   
                   {/* Description (Short & Professional) */}
                   <p className="text-[11px] md:text-[13px] text-black/60 leading-relaxed font-medium">
                     {feature.description}
                   </p>
                 </div>
               )
            })}
         </div>
       </div>
    </section>
  );
};

export default SSPPortalSection;
