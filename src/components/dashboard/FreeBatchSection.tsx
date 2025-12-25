import React from 'react';
import { Tables } from "@/integrations/supabase/types";
import { BookOpen, ChevronRight, Sparkles } from "lucide-react";

interface FreeBatchSectionProps {
  batches: Tables<'courses'>[];
  onSelect: (id: string) => void;
}

const FreeBatchCard: React.FC<{ batch: Tables<'courses'>, index: number, onSelect: (id: string) => void }> = ({ batch, index, onSelect }) => {
  // Cycle through gradients based on index
  const gradients = ['blue', 'yellow', 'purple'];
  const gradientClass = gradients[index % 3];
  
  const getGradientStyles = (type: string) => {
    switch(type) {
      case 'blue': return "bg-[linear-gradient(135deg,#e0f7fa_0%,#b2ebf2_100%)] text-[#00838f]";
      case 'yellow': return "bg-[linear-gradient(135deg,#fff9c4_0%,#fff176_100%)] text-[#827717]";
      case 'purple': return "bg-[linear-gradient(135deg,#ede7f6_0%,#d1c4e9_100%)] text-[#512da8]";
      default: return "";
    }
  };

  return (
    <div className="bg-white rounded-[20px] overflow-hidden flex flex-col transition-transform hover:-translate-y-2 shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
      <div className={`h-40 relative p-6 flex flex-col justify-center ${getGradientStyles(gradientClass)}`}>
        <div className="font-[800] text-[18px] leading-[1.1] max-w-[75%] z-10 uppercase">
          {batch.title}
        </div>
        <img 
          src={batch.image_url || "https://i.imgur.com/eBf29iE.png"} 
          className="absolute bottom-0 right-1 h-[125px] z-20 object-contain drop-shadow-md" 
          alt="" 
        />
      </div>
      
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[#f36c21] font-bold text-[11px] uppercase">Target</span>
          <span className="text-[9px] font-bold border border-[#e2e8f0] px-2 py-0.5 rounded-[4px] text-[#64748b]">
            {batch.language || 'HINGLISH'}
          </span>
        </div>
        <h3 className="text-[15px] font-semibold text-[#111] mb-4 line-clamp-2 h-[42px] leading-[1.4]">
          {batch.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[12px] text-[#64748b] mb-1">
          <BookOpen className="w-3.5 h-3.5" />
          {batch.subject || 'Exam Target'}
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-[#64748b]">
          <span className="h-[7px] w-[7px] bg-[#ef4444] rounded-full"></span>
          Ongoing <span className="opacity-30 mx-1">|</span> {batch.start_date ? `Started ${new Date(batch.start_date).toLocaleDateString()}` : 'Starts Soon'}
        </div>
      </div>

      <div className="px-5 py-4 flex justify-between items-center border-t border-[#f1f5f9]">
        <span className="font-[800] text-[18px] text-[#111]">Free</span>
        <div className="flex gap-2">
          <button 
            onClick={() => onSelect(batch.id)}
            className="bg-[#1c252e] text-white px-5 py-2 rounded-lg font-semibold text-[13px] hover:opacity-90 transition-opacity"
          >
            Enroll Now
          </button>
          <button 
            onClick={() => onSelect(batch.id)}
            className="w-[38px] h-[38px] border border-[#e2e8f0] rounded-lg flex items-center justify-center hover:bg-gray-50"
          >
            <ChevronRight className="w-[18px] h-[18px] text-[#111]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const FreeBatchSection: React.FC<FreeBatchSectionProps> = ({ batches, onSelect }) => {
  if (batches.length === 0) return null;

  return (
    <div className="mt-12 mb-10 w-full max-w-7xl mx-auto rounded-[24px] p-6 md:p-12 relative overflow-hidden bg-[#0f172a] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] border border-white/5">
      {/* Background Patterns */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.1) 0%, transparent 50%),
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 40px 40px, 40px 40px'
      }} />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-9">
          <h2 className="text-white text-2xl md:text-[28px] font-extrabold tracking-tight flex items-center gap-2.5">
            FREE BATCHES <Sparkles className="text-[#38bdf8] w-5 h-5" />
          </h2>
          <button className="text-[#94a3b8] hover:text-white text-sm font-medium flex items-center gap-1.5 transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch, index) => (
            <FreeBatchCard key={batch.id} batch={batch} index={index} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
};
