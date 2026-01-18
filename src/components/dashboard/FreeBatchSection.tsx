import React, { useState, useEffect } from 'react';
import { Tables } from "@/integrations/supabase/types";
import { ChevronRight, MoveRight, BookOpen, Maximize2, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from '@/integrations/supabase/client';
import EnrollButton from "@/components/EnrollButton"; 
import { useNavigate } from "react-router-dom"; 

interface FreeBatchSectionProps {
  batches: Tables<'courses'>[];
  onSelect: (id: string) => void;
  onViewAll: () => void;
}

/**
 * STANDARD COURSE CARD
 * Sizing slightly decreased for mobile view using min-w-[280px]
 */
const StandardCourseCard: React.FC<{ 
  course: Tables<'courses'>, 
  onSelect: (id: string) => void 
}> = ({ course, onSelect }) => {
  const navigate = useNavigate();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [minAddonPrice, setMinAddonPrice] = useState<number | null>(null);
  const [hasAddons, setHasAddons] = useState(false);
  const isMobile = useIsMobile();

  // Check for Paid Add-ons if Base is Free
  useEffect(() => {
    const checkAddons = async () => {
      if (course.price === 0 || course.price === null) {
        const { data } = await supabase
          .from('course_addons')
          .select('price')
          .eq('course_id', course.id);
        
        if (data && data.length > 0) {
          setHasAddons(true);
          const paidAddons = data.filter(addon => addon.price > 0);
          if (paidAddons.length > 0) {
            setMinAddonPrice(Math.min(...paidAddons.map(p => p.price)));
          }
        }
      }
    };
    checkAddons();
  }, [course.id, course.price]);

  const renderEnrollAction = () => {
    if (hasAddons) {
      return (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/courses/${course.id}/configure`);
          }} 
          className="bg-black text-white py-1.5 px-4 md:py-2 md:px-5 rounded-[10px] font-bold text-[12px] md:text-[14px] hover:bg-black/90 transition-colors"
        >
          Enroll
        </button>
      );
    }

    return (
      <EnrollButton
        courseId={course.id}
        coursePrice={0} // Free batch
        enrollmentLink={course.enroll_now_link || undefined}
        className="bg-black text-white py-1.5 px-4 md:py-2 md:px-5 rounded-[10px] font-bold text-[12px] md:text-[14px] hover:bg-black/90 transition-colors"
      >
        Enroll
      </EnrollButton>
    );
  };
  
  return (
    <>
      <div className={`bg-white rounded-[20px] overflow-hidden shadow-sm border border-[#e0e0e0] flex flex-col shrink-0 snap-start transition-all
        ${isMobile ? 'min-w-[280px] max-w-[300px]' : 'min-w-[320px] max-w-[360px]'}
      `}>
        {/* Thumbnail Section */}
        <div className="relative group cursor-pointer" onClick={() => setIsPreviewOpen(true)}>
          <div className={`${isMobile ? 'h-[160px]' : 'h-[200px]'} w-full bg-gray-50 flex items-center justify-center overflow-hidden`}>
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
        <div className={`${isMobile ? 'p-4' : 'p-5'} flex flex-col flex-1`}>
          <div className="flex justify-between items-center mb-[8px]">
            <span className="text-[#f97316] font-bold text-[13px] md:text-base uppercase tracking-tight">
              {course.level || 'Academic'}
            </span>
            <span className="border border-[#ccc] px-2 py-0.5 rounded-[5px] text-[10px] font-semibold text-[#555] uppercase">
              {course.language || 'Hinglish'}
            </span>
          </div>

          <h2 className={`${isMobile ? 'text-[17px]' : 'text-[20px]'} font-bold text-[#1f2937] mb-[12px] line-clamp-1`}>
            {course.title}
          </h2>

          <div className={`${isMobile ? 'min-h-[50px]' : 'min-h-[60px]'} space-y-1.5`}>
            <div className="flex items-center gap-2 text-[#4b5563] text-[13px] md:text-[15px]">
              <BookOpen className="w-[16px] h-[16px] text-[#666]" />
              {course.subject || 'Foundation'}
            </div>
            <div className="flex items-center gap-2 text-[#4b5563] text-[13px] md:text-[15px]">
              <span className="w-2 h-2 bg-[#dc2626] rounded-full"></span>
              <span className="font-bold">Ongoing</span> 
              <span className="text-[#d1d5db] mx-1">|</span> 
              {course.start_date ? new Date(course.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : "TBD"}
            </div>
          </div>

          {/* Footer Section */}
          <div className={`flex justify-between items-center mt-auto ${isMobile ? 'pt-3' : 'pt-4'} border-t border-gray-100`}>
            
            {/* PRICE DISPLAY LOGIC */}
            {minAddonPrice !== null ? (
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Starts at</span>
                <span className={`${isMobile ? 'text-[18px]' : 'text-[22px]'} font-extrabold text-black`}>
                  ₹{minAddonPrice.toLocaleString()}
                </span>
              </div>
            ) : (
              <span className={`${isMobile ? 'text-[18px]' : 'text-[22px]'} font-extrabold text-black uppercase tracking-tighter`}>
                Free
              </span>
            )}
            
            <div className="flex gap-2">
              
              {renderEnrollAction()}

              <button 
                onClick={() => onSelect(course.id)} 
                className="bg-white border border-[#e5e7eb] w-8 h-8 md:w-10 md:h-10 rounded-[10px] flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-[#1f2937]" strokeWidth={2.5} />
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

export const FreeBatchSection: React.FC<FreeBatchSectionProps> = ({ batches, onSelect, onViewAll }) => {
  const isMobile = useIsMobile();

  return (
    <div className={`mt-8 mb-10 w-full max-w-7xl mx-auto overflow-hidden relative shadow-none
      ${isMobile 
        ? 'bg-[#0d4d38] rounded-[24px] p-5' 
        : 'bg-[#022c22] rounded-[40px] p-10 md:p-14 border border-[#e5c185]/20'}
    `}>
      
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23e5c185' stroke-width='0.4' stroke-opacity='0.5'%3E%3Cpath d='M50 0 L100 50 L50 100 L0 50 Z'/%3E%3Ccircle cx='50' cy='50' r='20'/%3E%3Cpath d='M0 0 L100 100 M100 0 L0 100'/%3E%3Crect x='25' y='25' width='50' height='50' transform='rotate(45 50 50)'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px'
      }} />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h2 className={`text-white font-bebas uppercase flex items-center gap-3 leading-none
            ${isMobile ? 'text-[22px] tracking-wider' : 'text-[52px] tracking-[4px]'}
          `}>
            FREE BATCHES 
            {!isMobile && <span className="text-[#e5c185] font-poppins text-2xl">✦</span>}
          </h2>
          
          <button 
            onClick={onViewAll} 
            className={`text-[#e5c185] hover:text-white font-semibold transition-all flex items-center gap-2
              ${isMobile ? 'text-[12px]' : 'text-base tracking-wide'}
            `}
          >
            {isMobile ? 'View All →' : 'Explore All Programs'} {!isMobile && <MoveRight className="w-5 h-5" />}
          </button>
        </div>

        <div className={`flex overflow-x-auto gap-4 md:gap-8 pb-4 no-scrollbar snap-x snap-mandatory`}>
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
