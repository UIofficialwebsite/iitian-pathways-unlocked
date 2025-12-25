import React from 'react';
import { Tables } from "@/integrations/supabase/types";
import { ChevronRight, MoveRight } from "lucide-react";

interface FreeBatchSectionProps {
  batches: Tables<'courses'>[];
  onSelect: (id: string) => void;
}

const FreeBatchCard: React.FC<{ batch: Tables<'courses'>, index: number, onSelect: (id: string) => void }> = ({ batch, index, onSelect }) => {
  // Cycle through gradients: rose, sage, sand
  const variants = ['rose', 'sage', 'sand'];
  const variant = variants[index % 3];
  
  const getHeaderStyles = (type: string) => {
    switch(type) {
      case 'rose': return "bg-[linear-gradient(135deg,#fff1f2_0%,#fecdd3_100%)] text-[#9f1239]";
      case 'sage': return "bg-[linear-gradient(135deg,#f0fdf4_0%,#dcfce7_100%)] text-[#166534]";
      case 'sand': return "bg-[linear-gradient(135deg,#fffbeb_0%,#fef3c7_100%)] text-[#92400e]";
      default: return "";
    }
  };

  return (
    <div className="bg-white rounded-[24px] overflow-hidden flex flex-col transition-all duration-500 cubic-bezier(0.2,1,0.3,1) hover:-translate-y-3 hover:shadow-[0_35px_60px_rgba(0,0,0,0.5)] shadow-[0_15px_30px_rgba(0,0,0,0.4)]">
      {/* Card Header with Instructor Image from backend or placeholder */}
      <div className={`h-[165px] relative p-6 flex flex-col justify-center ${getHeaderStyles(variant)}`}>
        <div className="font-[800] text-[18px] leading-[1.2] max-w-[75%] z-10 uppercase">
          {batch.title}
        </div>
        <img 
          src={batch.image_url || "https://i.imgur.com/eBf29iE.png"} 
          className="absolute bottom-0 right-[10px] h-[135px] z-20 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.1)]" 
          alt={batch.title} 
        />
      </div>
      
      {/* Card Body */}
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-center mb-3">
          {/* Using 'level' from backend instead of 'target' */}
          <span className="text-[#f36c21] font-[700] text-[11px] uppercase tracking-[0.5px]">
            {batch.level || 'Academic'}
          </span>
          <span className="text-[9px] font-[700] bg-[#f8fafc] border border-[#e2e8f0] px-2 py-0.5 rounded-[4px] text-[#64748b]">
            {batch.language || 'HINGLISH'}
          </span>
        </div>
        <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-[18px] line-clamp-2 h-[44px] leading-[1.4]">
          {batch.title}
        </h3>
        <div className="flex items-center gap-[10px] text-[12px] text-[#666]">
          <span className="flex items-center gap-1">
            <span className="h-[7px] w-[7px] bg-[#ff4d4d] rounded-full"></span> 
            Ongoing
          </span>
          <span className="opacity-30">|</span> 
          <span>Starts {batch.start_date ? new Date(batch.start_date).toLocaleDateString() : 'TBD'}</span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-5 flex justify-between items-center bg-[#fafafa] border-t border-[#f1f1f1]">
        <span className="font-[800] text-[18px] text-[#121212]">Free</span>
        <div className="flex gap-[10px]">
          <button 
            onClick={() => onSelect(batch.id)}
            className="bg-[#121212] text-white px-[22px] py-[10px] rounded-[10px] font-semibold text-[13px] hover:opacity-90 transition-opacity"
          >
            Enroll Now
          </button>
          <button 
            onClick={() => onSelect(batch.id)}
            className="w-[40px] h-[40px] bg-white border border-[#ddd] rounded-[10px] flex items-center justify-center hover:bg-gray-50"
          >
            <ChevronRight className="w-[18px] h-[18px] text-[#121212]" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const FreeBatchSection: React.FC<FreeBatchSectionProps> = ({ batches, onSelect }) => {
  if (batches.length === 0) return null;

  return (
    <div className="mt-12 mb-10 w-full max-w-7xl mx-auto rounded-[28px] p-[50px_45px] relative overflow-hidden bg-[#0f0f0f] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] border border-white/[0.03]">
      {/* Premium Obsidian Background Patterns */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(circle at 0% 0%, rgba(255,107,107,0.05) 0%, transparent 35%),
          radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")
        `,
        backgroundSize: '100% 100%, 30px 30px, auto'
      }} />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-white text-[42px] font-normal tracking-[2px] flex items-center gap-[15px] font-bebas uppercase after:content-['✦'] after:font-poppins after:text-[20px] after:text-[#f36c21]">
            FREE BATCHES
          </h2>
          <button className="text-[#888888] hover:text-white text-[14px] font-[500] flex items-center gap-2 transition-all">
            View All Batches <MoveRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[25px]">
          {batches.map((batch, index) => (
            <FreeBatchCard key={batch.id} batch={batch} index={index} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
};
