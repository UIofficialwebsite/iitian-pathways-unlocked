import React from 'react';
import { Tables } from "@/integrations/supabase/types";
import { MoveRight, BookOpen, Maximize2, X, ChevronRight } from "lucide-react";

interface FreeBatchSectionProps {
  batches: Tables<'courses'>[];
  onSelect: (id: string) => void;
  onViewAll: () => void;
}

const FreeCourseCard: React.FC<{ 
  course: Tables<'courses'>, 
  onSelect: (id: string) => void 
}> = ({ course, onSelect }) => {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  
  return (
    <>
      <div className="w-full min-w-[300px] md:min-w-[340px] max-w-[360px] bg-white rounded-[20px] overflow-hidden shadow-sm border border-[#e0e0e0] flex flex-col transition-all hover:shadow-md shrink-0">
        <div className="relative group cursor-pointer" onClick={() => setIsPreviewOpen(true)}>
          <img 
            src={course.image_url || "/lovable-uploads/logo_ui_new.png"} 
            alt={course.title} 
            className="w-full block aspect-video object-cover" 
          />
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Maximize2 className="text-white w-6 h-6" />
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-center mb-[10px]">
            <span className="text-[#f97316] font-bold text-base uppercase tracking-tight">{course.level || 'Academic'}</span>
            <span className="border border-[#ccc] px-2 py-0.5 rounded-[5px] text-[11px] font-semibold text-[#555] uppercase">
              {course.language || 'Hinglish'}
            </span>
          </div>

          <h2 className="text-[18px] font-bold text-[#1f2937] mb-[15px] line-clamp-1">{course.title}</h2>

          <div className="min-h-[50px] space-y-2">
            <div className="flex items-center gap-2.5 text-[#4b5563] text-[14px]">
              <BookOpen className="w-[16px] h-[16px] text-[#666]" />
              {course.subject || 'Foundation'}
            </div>
            <div className="flex items-center gap-2.5 text-[#4b5563] text-[14px]">
              <span className="w-2 h-2 bg-[#dc2626] rounded-full"></span>
              <span className="font-bold">Ongoing</span> 
              <span className="text-[#d1d5db] mx-1">|</span> 
              Starts: {course.start_date ? new Date(course.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : "TBD"}
            </div>
          </div>

          <div className="flex justify-between items-center mt-auto pt-[15px] border-t border-gray-100">
            <span className="text-[20px] font-extrabold text-black uppercase">Free</span>
            <div className="flex gap-2">
              <button 
                onClick={() => onSelect(course.id)} 
                className="bg-[#1f2937] text-white py-1.5 px-4 rounded-[10px] font-bold text-[13px] hover:bg-black transition-colors"
              >
                Enroll
              </button>
              <button 
                onClick={() => onSelect(course.id)} 
                className="bg-white border border-[#e5e7eb] w-9 h-9 rounded-[10px] flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4 text-[#1f2937]" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isPreviewOpen && (
        <div className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4" onClick={() => setIsPreviewOpen(false)}>
          <img src={course.image_url || ""} className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" alt="Preview" />
          <X className="absolute top-6 right-6 text-white w-8 h-8 cursor-pointer" />
        </div>
      )}
    </>
  );
};

export const FreeBatchSection: React.FC<FreeBatchSectionProps> = ({ batches, onSelect, onViewAll }) => {
  return (
    /* Removed shadow-sm and shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] classes */
    <div className="mt-12 mb-10 w-full max-w-7xl mx-auto rounded-[28px] p-6 md:p-12 relative overflow-hidden bg-[#0f0f0f] border border-white/[0.03]">
      {/* Removed radial-gradient entirely to eliminate vignette effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")
        `,
        backgroundSize: '30px 30px, auto'
      }} />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-white text-[32px] md:text-[42px] font-normal tracking-[2px] font-bebas uppercase after:content-['✦'] after:ml-3 after:text-[20px] after:text-[#f36c21]">
            FREE BATCHES
          </h2>
          <button onClick={onViewAll} className="text-[#888888] hover:text-white text-[14px] font-[500] flex items-center gap-2 transition-all">
            View All Batches <MoveRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
          {batches.map((batch) => (
            <FreeCourseCard key={batch.id} course={batch} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
};
