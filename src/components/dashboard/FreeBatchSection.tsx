import React from 'react';
import { Tables } from "@/integrations/supabase/types";
import { ChevronRight, MoveRight, BookOpen, Maximize2, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface FreeBatchSectionProps {
  batches: Tables<'courses'>[];
  onSelect: (id: string) => void;
  onViewAll: () => void;
}

/**
 * STANDARD COURSE CARD
 * Re-implemented with your exact original dimensions and logic
 * to ensure consistency across paid and free sections.
 */
const StandardCourseCard: React.FC<{ 
  course: Tables<'courses'>, 
  onSelect: (id: string) => void 
}> = ({ course, onSelect }) => {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  
  return (
    <>
      <div className="w-full min-w-[320px] max-w-[360px] bg-white rounded-[20px] overflow-hidden shadow-sm border border-[#e0e0e0] flex flex-col shrink-0 snap-start transition-all">
        {/* Thumbnail Section */}
        <div className="relative group cursor-pointer" onClick={() => setIsPreviewOpen(true)}>
          <div className="w-full h-[200px] bg-gray-50 flex items-center justify-center overflow-hidden">
            <img 
              src={course.image_url || "/lovable-uploads/logo_ui_new.png"} 
              alt={course.title} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Maximize2 className="text-white w-6 h-6" />
          </div>
        </div>

        {/* Info Section */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-center mb-[10px]">
            <span className="text-[#f97316] font-bold text-base uppercase tracking-tight">
              {course.level || 'Academic'}
            </span>
            <span className="border border-[#ccc] px-2 py-0.5 rounded-[5px] text-[11px] font-semibold text-[#555] uppercase">
              {course.language || 'Hinglish'}
            </span>
          </div>

          <h2 className="text-[20px] font-bold text-[#1f2937] mb-[15px] line-clamp-1">
            {course.title}
          </h2>

          <div className="min-h-[60px] space-y-2">
            <div className="flex items-center gap-2.5 text-[#4b5563] text-[15px]">
              <BookOpen className="w-[18px] h-[18px] text-[#666]" />
              {course.subject || 'Foundation'}
            </div>
            <div className="flex items-center gap-2.5 text-[#4b5563] text-[15px]">
              <span className="w-2 h-2 bg-[#dc2626] rounded-full"></span>
              <span className="font-bold">Ongoing</span> 
              <span className="text-[#d1d5db] mx-1">|</span> 
              Starts: {course.start_date ? new Date(course.start_date).toLocaleDateString('en-GB') : "TBD"}
            </div>
          </div>

          {/* Footer Section */}
          <div className="flex justify-between items-center mt-auto pt-[15px] border-t border-gray-100">
            <span className="text-[22px] font-extrabold text-black uppercase tracking-tighter">Free</span>
            
            <div className="flex gap-2">
              <button 
                onClick={() => onSelect(course.id)} 
                className="bg-[#1f2937] text-white py-2 px-5 rounded-[10px] font-bold text-[14px] hover:bg-black transition-colors"
              >
                Enroll
              </button>
              <button 
                onClick={() => onSelect(course.id)} 
                className="bg-white border border-[#e5e7eb] w-10 h-10 rounded-[10px] flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-[#1f2937]" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4" onClick={() => setIsPreviewOpen(false)}>
          <img src={course.image_url || ""} className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" alt="Preview" />
          <X className="absolute top-6 right-6 text-white w-8 h-8 cursor-pointer" />
        </div>
      )}
    </>
  );
};

/**
 * FREE BATCH SECTION
 * Premium Heritage Design Container with side-roller
 */
export const FreeBatchSection: React.FC<FreeBatchSectionProps> = ({ batches, onSelect, onViewAll }) => {
  const isMobile = useIsMobile();

  return (
    <div className={`mt-8 mb-10 w-full max-w-7xl mx-auto overflow-hidden relative shadow-none
      ${isMobile 
        ? 'bg-[#0d4d38] rounded-[24px] p-6' 
        : 'bg-[#022c22] rounded-[40px] p-10 md:p-14 border border-[#e5c185]/20'}
    `}>
      
      {/* Pattern Overlay (Heritage SVG) */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23e5c185' stroke-width='0.4' stroke-opacity='0.5'%3E%3Cpath d='M50 0 L100 50 L50 100 L0 50 Z'/%3E%3Ccircle cx='50' cy='50' r='20'/%3E%3Cpath d='M0 0 L100 100 M100 0 L0 100'/%3E%3Crect x='25' y='25' width='50' height='50' transform='rotate(45 50 50)'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px'
      }} />
      
      <div className="relative z-10">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-white font-bebas uppercase flex items-center gap-3 leading-none
            ${isMobile ? 'text-[26px] tracking-wider' : 'text-[52px] tracking-[4px]'}
          `}>
            FREE BATCHES 
            {!isMobile && <span className="text-[#e5c185] font-poppins text-2xl">✦</span>}
          </h2>
          
          <button 
            onClick={onViewAll} 
            className={`text-[#e5c185] hover:text-white font-semibold transition-all flex items-center gap-2
              ${isMobile ? 'text-[13px]' : 'text-base tracking-wide'}
            `}
          >
            {isMobile ? 'View All →' : 'Explore All Programs'} {!isMobile && <MoveRight className="w-5 h-5" />}
          </button>
        </div>

        {/* SIDE ROLLER / HORIZONTAL SCROLL CONTAINER */}
        <div className="flex overflow-x-auto gap-6 md:gap-8 pb-4 no-scrollbar snap-x snap-mandatory">
          {batches.map((batch) => (
            <StandardCourseCard 
              key={batch.id} 
              course={batch} 
              onSelect={onSelect} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
