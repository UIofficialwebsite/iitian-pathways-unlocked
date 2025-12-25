import React from 'react';
import { Tables } from "@/integrations/supabase/types";
import { ChevronRight, MoveRight, BookOpen, Maximize2, X } from "lucide-react";

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
      <div className="w-full min-w-[280px] sm:min-w-[340px] max-w-[360px] bg-white rounded-[32px] overflow-hidden shadow-sm border border-[#e0e0e0] flex flex-col transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl shrink-0">
        <div className="relative group cursor-pointer" onClick={() => setIsPreviewOpen(true)}>
          <div className="w-full h-[200px] bg-gray-50 flex items-center justify-center overflow-hidden">
            <img 
              src={course.image_url || "/lovable-uploads/logo_ui_new.png"} 
              alt={course.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          </div>
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Maximize2 className="text-white w-6 h-6" />
          </div>
        </div>

        <div className="p-7 flex flex-col flex-1">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#f97316] font-bold text-sm uppercase tracking-wider">{course.level || 'Academic'}</span>
            <span className="bg-[#f3f4f6] px-3 py-1 rounded-lg text-[10px] font-bold text-[#4b5563] uppercase">
              {course.language || 'Hinglish'}
            </span>
          </div>

          <h2 className="text-[19px] font-semibold text-[#111827] mb-5 line-clamp-1 leading-tight">{course.title}</h2>

          <div className="min-h-[50px] space-y-2">
            <div className="flex items-center gap-3 text-[#6b7280] text-[13px] font-medium">
              <BookOpen className="w-4 h-4" />
              {course.subject || 'Foundation'}
            </div>
            <div className="flex items-center gap-3 text-[#6b7280] text-[13px] font-medium">
              <span className="w-2 h-2 bg-[#ef4444] rounded-full"></span>
              Ongoing <span className="opacity-30">|</span> 
              Starts: {course.start_date ? new Date(course.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : "TBD"}
            </div>
          </div>

          <div className="flex justify-between items-center mt-auto pt-5 border-t border-[#f1f5f9]">
            <span className="text-2xl font-[800] text-[#022c22] uppercase tracking-tight">Free</span>
            <div className="flex gap-3">
              <button 
                onClick={() => onSelect(course.id)} 
                className="bg-[#022c22] text-white py-2.5 px-6 rounded-xl font-bold text-sm hover:bg-[#064e3b] transition-colors"
              >
                Enroll Now
              </button>
              <button 
                onClick={() => onSelect(course.id)} 
                className="bg-white border border-[#e5e7eb] w-11 h-11 rounded-xl flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5 text-[#111]" strokeWidth={2.5} />
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
    <div className="mt-12 mb-10 w-full max-w-7xl mx-auto rounded-[40px] p-6 md:p-14 relative overflow-hidden bg-[#022c22] border border-[#e5c185]/20 shadow-none">
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23e5c185' stroke-width='0.4' stroke-opacity='0.5'%3E%3Cpath d='M50 0 L100 50 L50 100 L0 50 Z'/%3E%3Ccircle cx='50' cy='50' r='20'/%3E%3Cpath d='M0 0 L100 100 M100 0 L0 100'/%3E%3Crect x='25' y='25' width='50' height='50' transform='rotate(45 50 50)'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px'
      }} />
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <h2 className="text-white text-[32px] md:text-[52px] font-normal tracking-[4px] font-bebas uppercase flex items-center gap-4 leading-none">
            FREE BATCHES <span className="text-[#e5c185] font-poppins text-2xl">✦</span>
          </h2>
          <button onClick={onViewAll} className="text-[#e5c185] hover:text-white text-base font-semibold tracking-wide flex items-center gap-2.5 transition-all hover:translate-x-2">
            Explore All Programs <MoveRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex overflow-x-auto gap-8 pb-6 no-scrollbar snap-x">
          {batches.map((batch) => (
            <div key={batch.id} className="snap-start">
              <FreeCourseCard course={batch} onSelect={onSelect} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
