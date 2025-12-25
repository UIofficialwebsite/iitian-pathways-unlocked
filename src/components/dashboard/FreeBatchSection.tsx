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
 * REUSABLE CARD COMPONENT
 * Preserves your original design but adapts the 'Hero' part for mobile wireframe
 */
const FreeCourseCard: React.FC<{ 
  course: Tables<'courses'>, 
  onSelect: (id: string) => void,
  isMobileDesign?: boolean
}> = ({ course, onSelect, isMobileDesign }) => {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  
  return (
    <>
      <div className={`flex flex-col shrink-0 snap-start bg-white transition-all
        ${isMobileDesign 
          ? 'w-full min-w-[280px] rounded-[20px] shadow-md border border-gray-100' 
          : 'w-full min-w-[340px] max-w-[360px] rounded-[32px] shadow-sm border border-[#e0e0e0]'}
      `}>
        
        {/* HERO SECTION: Design changes based on Mobile Wireframe vs Desktop */}
        <div className="relative group cursor-pointer" onClick={() => setIsPreviewOpen(true)}>
          <div className={`w-full flex items-center justify-center overflow-hidden
            ${isMobileDesign 
              ? 'h-[160px] bg-gradient-to-r from-[#f2e8f8] to-[#e8daef] p-5' 
              : 'h-[200px] bg-gray-50'}
          `}>
            {isMobileDesign && (
              <h3 className="text-[#6c5ce7] font-extrabold text-[15px] max-w-[60%] leading-tight uppercase z-10">
                {course.title}
              </h3>
            )}
            <img 
              src={course.image_url || "/lovable-uploads/logo_ui_new.png"} 
              alt={course.title} 
              className={`object-contain transition-transform duration-500
                ${isMobileDesign ? 'absolute bottom-0 right-0 h-[90%]' : 'w-full h-full object-cover'}
              `} 
            />
          </div>
          {!isMobileDesign && (
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="text-white w-6 h-6" />
            </div>
          )}
        </div>

        {/* DETAILS SECTION: Keeps your original logic and labels */}
        <div className={isMobileDesign ? 'p-5' : 'p-7'}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#f97316] font-bold text-sm uppercase tracking-wider">
              {course.level || 'Academic'}
            </span>
            <span className={`font-bold uppercase rounded-md
              ${isMobileDesign ? 'bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500' : 'bg-[#f3f4f6] px-3 py-1 text-[10px] text-[#4b5563]'}
            `}>
              {course.language || 'Hinglish'}
            </span>
          </div>

          <h2 className={`font-semibold text-[#111827] line-clamp-1 leading-tight
            ${isMobileDesign ? 'text-[17px] mb-1' : 'text-[19px] mb-5'}
          `}>
            {course.title}
          </h2>

          <div className={`space-y-2 text-[#6b7280] font-medium
            ${isMobileDesign ? 'text-[12px] mb-4' : 'text-[13px] min-h-[50px]'}
          `}>
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4" />
              {course.subject || 'Foundation'}
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[#ef4444] rounded-full"></span>
              Ongoing <span className="opacity-30">|</span> 
              {course.start_date ? new Date(course.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : "TBD"}
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className={`flex justify-between items-center mt-auto border-t border-[#f1f5f9]
            ${isMobileDesign ? 'pt-4 gap-2' : 'pt-5'}
          `}>
            {!isMobileDesign && (
              <span className="text-2xl font-[800] text-[#022c22] uppercase tracking-tight">Free</span>
            )}
            
            <div className={`flex gap-3 ${isMobileDesign ? 'w-full' : ''}`}>
              <button 
                onClick={() => onSelect(course.id)} 
                className={`font-bold transition-colors
                  ${isMobileDesign 
                    ? 'flex-1 bg-[#1e2124] text-white py-3 rounded-xl text-[14px]' 
                    : 'bg-[#022c22] text-white py-2.5 px-6 rounded-xl text-sm hover:bg-[#064e3b]'}
                `}
              >
                {isMobileDesign ? 'Enroll Now' : 'Enroll Now'}
              </button>
              <button 
                onClick={() => onSelect(course.id)} 
                className={`bg-white border border-[#e5e7eb] flex items-center justify-center transition-colors
                  ${isMobileDesign ? 'w-12 h-12 rounded-xl text-xl text-gray-400' : 'w-11 h-11 rounded-xl hover:border-[#e5c185]'}
                `}
              >
                {isMobileDesign ? '›' : <ChevronRight className="w-5 h-5 text-[#111]" strokeWidth={2.5} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PREVIEW MODAL */}
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
  const isMobile = useIsMobile();

  return (
    <div className={`mt-8 mb-10 w-full max-w-7xl mx-auto overflow-hidden relative shadow-none
      ${isMobile 
        ? 'bg-[#0d4d38] rounded-[24px] p-5' 
        : 'bg-[#022c22] rounded-[40px] p-10 md:p-14 border border-[#e5c185]/20'}
    `}>
      {/* Premium Heritage Pattern (Faded in background) */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23e5c185' stroke-width='0.4' stroke-opacity='0.5'%3E%3Cpath d='M50 0 L100 50 L50 100 L0 50 Z'/%3E%3Ccircle cx='50' cy='50' r='20'/%3E%3Cpath d='M0 0 L100 100 M100 0 L0 100'/%3E%3Crect x='25' y='25' width='50' height='50' transform='rotate(45 50 50)'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px'
      }} />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-white font-bebas uppercase flex items-center gap-3 leading-none
            ${isMobile ? 'text-[24px] tracking-wider' : 'text-[52px] tracking-[4px]'}
          `}>
            FREE BATCHES 
            {!isMobile && <span className="text-[#e5c185] font-poppins text-2xl">✦</span>}
          </h2>
          <button onClick={onViewAll} className={`text-[#e5c185] hover:text-white font-semibold transition-all hover:translate-x-2 flex items-center gap-2
            ${isMobile ? 'text-[12px]' : 'text-base tracking-wide'}
          `}>
            {isMobile ? 'View All →' : 'Explore All Programs'} {!isMobile && <MoveRight className="w-5 h-5" />}
          </button>
        </div>

        {/* SIDE ROLLER / HORIZONTAL SCROLL */}
        <div className="flex overflow-x-auto gap-6 md:gap-8 pb-4 no-scrollbar snap-x snap-mandatory">
          {batches.map((batch) => (
            <FreeCourseCard 
              key={batch.id} 
              course={batch} 
              onSelect={onSelect} 
              isMobileDesign={isMobile} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
