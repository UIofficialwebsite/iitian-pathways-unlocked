import React from 'react';
import { Video, FileText, LayoutDashboard, BarChart3, MessageCircle, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const SSPPortalSection: React.FC = () => {
  const features = [
    {
      icon: Video,
      title: "Recorded Lectures",
      description: "High-definition recordings for every class, available for unlimited replay anytime.",
      color: "bg-teal-50"
    },
    {
      icon: FileText,
      title: "Study Materials",
      description: "Access structured PDFs, handwritten notes, and curated practice sheets in our central vault.",
      color: "bg-rose-50"
    },
    {
      icon: LayoutDashboard,
      title: "Personalized Dashboard",
      description: "A customized workspace to manage your schedule and track your daily learning goals.",
      color: "bg-purple-50"
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Monitor performance with data-driven insights and personalized reports to stay ahead.",
      color: "bg-blue-50"
    },
    {
      icon: MessageCircle,
      title: "Doubt Resolution",
      description: "Get rapid resolutions to all your technical queries from our expert subject instructors.",
      color: "bg-amber-50"
    },
    {
      icon: ClipboardCheck,
      title: "Test & Practice",
      description: "Validate your knowledge with periodic assignments and simulated mock examinations.",
      color: "bg-emerald-50"
    }
  ];

  return (
    <section id="ssp" className="scroll-mt-24 bg-white border border-slate-100 rounded-3xl p-8 md:p-10 w-full shadow-sm">
      <h2 className="text-3xl font-extrabold mb-10 text-slate-900 tracking-tight">Student Service Portal</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((feature, idx) => {
           const Icon = feature.icon;
           return (
             <div 
               key={idx} 
               className={cn(
                 "group flex flex-col p-6 rounded-xl border border-black/5 transition-colors duration-200 cursor-pointer hover:border-black h-full",
                 feature.color
               )}
             >
               <div className="flex items-center gap-3.5 mb-4">
                 <div className="w-[42px] h-[42px] bg-white rounded-[10px] flex items-center justify-center shrink-0 shadow-[0_2px_5px_rgba(0,0,0,0.03)]">
                   <Icon className="w-5 h-5 text-black stroke-[2.2]" />
                 </div>
                 <h3 className="text-[17px] font-bold text-black tracking-tight">{feature.title}</h3>
               </div>
               <p className="text-sm leading-relaxed text-black/80 m-0">
                 {feature.description}
               </p>
             </div>
           )
        })}
      </div>
    </section>
  );
};

export default SSPPortalSection;
