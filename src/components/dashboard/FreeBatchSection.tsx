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
 * MOBILE COMPONENT: Purple Hero Design
 */
const MobileHeritageCard: React.FC<{ course: Tables<'courses'>, onSelect: (id: string) => void }> = ({ course, onSelect }) => (
  <div className="w-full min-w-[280px] bg-white rounded-[20px] overflow-hidden text-[#1a1a1a] shadow-md border border-gray-100 shrink-0 snap-start">
    <div className="bg-gradient-to-r from-[#f2e8f8] to-[#e8daef] h-[160px] relative p-5 flex items-center">
      <h3 className="text-[#6c5ce7] font-extrabold text-[15px] max-w-[65%] leading-tight uppercase">
        {course.title}
      </h3>
      <img 
        src={course.image_url || "/lovable-uploads/logo_ui_new.png"} 
        className="absolute bottom-0 right-0 h-[90%] object-contain" 
        alt="" 
      />
    </div>
    <div className="p-5">
      <span className="float-right bg-gray-100 px-2 py-0.5 rounded-md text-[11px] font-bold text-gray-500">
        {course.language || 'HINGLISH'}
      </span>
      <p className="text-[#f39c12] font-bold text-[13px] mb-1">{course.level || 'Academic'}</p>
      <h4 className="text-[17px] font-bold mb-1 truncate">{course.title}</h4>
      <p className="text-[12px] text-gray-500 mb-3">{course.subject || 'Exam Prep'}</p>
      <p className="text-[11px] text-gray-600 mb-4">
        <span className="text-green-600 font-bold">Ongoing</span> | Started {course.start_date ? new Date(course.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'TBD'}
      </p>
      <div className="flex gap-2">
        <button onClick={() => onSelect(course.id)} className="flex-1 bg-[#1e2124] text-white py-3 rounded-xl font-bold text-[14px]">
          Enroll Now
        </button>
        <button onClick={() => onSelect(course.id)} className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center text-xl text-gray-400">
          ›
        </button>
      </div>
    </div>
  </div>
);

/**
 * DESKTOP COMPONENT: Standard Design matching Paid Batches
 */
const DesktopFreeCard: React.FC<{ course: Tables<'courses'>, onSelect: (id: string) => void }> = ({ course, onSelect }) => {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  
  return (
    <>
      <div className="w-full min-w-[340px] max-w-[360px] bg-white rounded-[32px] overflow-hidden shadow-sm border border-[#e0e0e0] flex flex-col shrink-0 snap-start">
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
              <button onClick={() => onSelect(course.id)} className="bg-[#022c22] text-white py-2.5 px-6 rounded-xl font-bold text-sm hover:bg-[#064e3b] transition-colors">
                Enroll Now
              </button>
              <button onClick={() => onSelect(course.id)} className="bg-white border border-[#e5e7eb] w-11 h-11 rounded-xl flex items-center justify-center hover:border-[#e5c185]">
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

/**
 * MAIN SECTION CONTAINER
 */
export const FreeBatchSection: React.FC<FreeBatchSectionProps> = ({ batches, onSelect, onViewAll }) => {
  const isMobile = useIsMobile();

  return (
    <div className={`mt-8 mb-10 w-full max-w-7xl mx-auto overflow-hidden relative
      ${isMobile ? 'bg-[#0d4d38] rounded-[24px] p-5' : 'bg-[#022c22] rounded-[40px] p-10 md:p-14 border border-[#e5c185]/20 shadow-none'}
    `}>
      {/* Premium Heritage Pattern (Only visible on Emerald background) */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23e5c185' stroke-width='0.4' stroke-opacity='0.5'%3E%3Cpath d='M50 0 L100 50 L50 100 L0 50 Z'/%3E%3Ccircle cx='50' cy='50' r='20'/%3E%3Cpath d='M0 0 L100 100 M100 0 L0 100'/%3E%3Crect x='25' y='25' width='50' height='50' transform='rotate(45 50 50)'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px'
      }} />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-white font-bebas uppercase flex items-center gap-3 leading-none tracking-wider
            ${isMobile ? 'text-[24px]' : 'text-[52px] tracking-[4px]'}
          `}>
            FREE BATCHES 
            {!isMobile && <span className="text-[#e5c185] font-poppins text-2xl">✦</span>}
          </h2>
          <button onClick={onViewAll} className={`text-[#e5c185] hover:text-white font-semibold transition-all hover:translate-x-2 flex items-center gap-2
            ${isMobile ? 'text-[12px]' : 'text-base'}
          `}>
            {isMobile ? 'View All →' : 'Explore All Programs'} {!isMobile && <MoveRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Side Roller / Horizontal Scroll */}
        <div className="flex overflow-x-auto gap-5 md:gap-8 pb-4 no-scrollbar snap-x snap-mandatory">
          {batches.map((batch) => (
            isMobile ? <MobileHeritageCard key={batch.id} course={batch} onSelect={onSelect} />
                     : <DesktopFreeCard key={batch.id} course={batch} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
};
