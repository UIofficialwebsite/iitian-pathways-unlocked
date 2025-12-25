import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, BookOpen, Maximize2, X, ArrowLeft, Menu } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { FreeBatchSection } from './FreeBatchSection';
import { useIsMobile } from "@/hooks/use-mobile";
import SlidersIcon from "@/components/ui/SliderIcon"; // Import the SliderIcon

interface RegularBatchesTabProps {
  focusArea: string;
  onSelectCourse: (id: string) => void;
}

// RESTORED ORIGINAL COURSE CARD: Design and dimensions strictly maintained
const CourseCard: React.FC<{ 
  course: Tables<'courses'>, 
  onSelect: (id: string) => void 
}> = ({ course, onSelect }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const discount = course.discounted_price 
    ? Math.round(((course.price - course.discounted_price) / course.price) * 100) 
    : 0;

  return (
    <>
      <div className="w-full max-w-[360px] mx-auto bg-white rounded-[20px] overflow-hidden shadow-sm border border-[#e0e0e0] flex flex-col transition-all duration-300">
        <div className="relative group cursor-pointer" onClick={() => setIsPreviewOpen(true)}>
          <div className="w-full h-[200px] bg-gray-50 flex items-center justify-center overflow-hidden">
            <img src={course.image_url || "/lovable-uploads/logo_ui_new.png"} alt={course.title} className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Maximize2 className="text-white w-6 h-6" />
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-center mb-[10px]">
            <span className="text-[#f97316] font-bold text-base uppercase tracking-tight">{course.level || 'Academic'}</span>
            <span className="border border-[#ccc] px-2 py-0.5 rounded-[5px] text-[11px] font-semibold text-[#555] uppercase">{course.language || 'Hinglish'}</span>
          </div>
          <h2 className="text-[20px] font-bold text-[#1f2937] mb-[15px] line-clamp-1">{course.title}</h2>
          <div className="min-h-[60px] space-y-2">
            <div className="flex items-center gap-2.5 text-[#4b5563] text-[15px]"><BookOpen className="w-[18px] h-[18px] text-[#666]" />{course.subject || 'Foundation'}</div>
            <div className="flex items-center gap-2.5 text-[#4b5563] text-[15px]"><span className="w-2 h-2 bg-[#dc2626] rounded-full"></span><span className="font-bold">Ongoing</span> <span className="text-[#d1d5db] mx-1">|</span> Starts: {course.start_date ? new Date(course.start_date).toLocaleDateString('en-GB') : "TBD"}</div>
          </div>
          <div className="flex justify-between items-center mt-auto pt-[15px] border-t border-gray-100">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[20px] font-extrabold text-black">₹{course.discounted_price || course.price}</span>
                {course.discounted_price && <span className="text-[14px] text-[#9ca3af] line-through">₹{course.price}</span>}
              </div>
              {discount > 0 && <span className="text-[#166534] font-bold text-[15px]">{discount}% OFF</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => onSelect(course.id)} className="bg-[#1f2937] text-white py-2 px-5 rounded-[10px] font-bold text-[14px] hover:bg-black">Enroll</button>
              <button onClick={() => onSelect(course.id)} className="bg-white border border-[#e5e7eb] w-10 h-10 rounded-[10px] flex items-center justify-center"><ChevronRight className="w-5 h-5 text-[#1f2937]" strokeWidth={2.5} /></button>
            </div>
          </div>
        </div>
      </div>
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4" onClick={() => setIsPreviewOpen(false)}>
          <img src={course.image_url || ""} className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" alt="Preview" />
          <X className="absolute top-6 right-6 text-white w-8 h-8 cursor-pointer" />
        </div>
      )}
    </>
  );
};

const RegularBatchesTab: React.FC<RegularBatchesTabProps> = ({ focusArea, onSelectCourse }) => {
  const isMobile = useIsMobile();
  const [batches, setBatches] = useState<Tables<'courses'>[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isViewingAllFree, setIsViewingAllFree] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data } = await supabase.from('courses').select('*').ilike('exam_category', focusArea).eq('batch_type', 'regular');
      if (data) setBatches(data);
      setLoading(false);
    };
    fetchCourses();
  }, [focusArea]);

  // Dynamic Filters from Backend Data
  const availableLevels = Array.from(new Set(batches.filter(b => b.level).map(b => b.level)));

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 10);
  };

  const filtered = batches.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "All" || b.level === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const paidBatches = filtered.filter(b => b.payment_type === 'paid');
  const freeBatches = filtered.filter(b => b.payment_type === 'free');

  return (
    <div className="flex flex-col h-full bg-white"> 
      {/* HEADER AREA */}
      <div className={`sticky top-0 z-30 bg-white transition-all duration-300 px-4 md:px-6 lg:px-8 shrink-0 flex flex-col ${isScrolled ? 'border-b border-[#e0e0e0] shadow-sm' : 'border-b-transparent shadow-none'}`}>
        <div className="h-[73px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isMobile && <Menu className="w-6 h-6 text-gray-700" />}
            {isViewingAllFree && (
              <button onClick={() => setIsViewingAllFree(false)} className="mr-1 p-1 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className={`${isMobile ? 'text-[18px]' : 'text-[22px]'} font-bold tracking-tight text-[#1a1a1a]`}>
              {isViewingAllFree ? "Free Batches" : "Batches"}
            </h1>
          </div>
          <div className="relative flex-1 max-w-[200px] md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10 md:h-11 bg-gray-50 border-gray-200 rounded-xl focus:ring-1 focus:ring-orange-500 text-sm shadow-none" />
          </div>
        </div>

        {/* FIXED FILTER BAR */}
        {!isViewingAllFree && (
          <div className="flex gap-2.5 pb-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full text-[13px] font-bold text-gray-500 whitespace-nowrap bg-white shadow-sm">
              Filter <SlidersIcon className="w-4 h-4" /> {/* Replaced Filter with SlidersIcon */}
            </div>
            <button
              onClick={() => setActiveFilter("All")}
              className={`px-4 py-2 border rounded-full text-[13px] font-semibold transition-all whitespace-nowrap ${activeFilter === "All" ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200'}`}
            >
              All
            </button>
            {availableLevels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setActiveFilter(lvl!)}
                className={`px-4 py-2 border rounded-full text-[13px] font-semibold transition-all whitespace-nowrap ${activeFilter === lvl ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200'}`}
              >
                {lvl}
              </button>
            ))}
          </div>
        )}
      </div>

      <div onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-4 no-scrollbar">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
              {[1, 2, 3].map(i => <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <>
              {/* Popular Section */}
              {!isViewingAllFree && paidBatches.length > 0 && (
                <div className="mb-14">
                  <h2 className="text-[28px] font-semibold tracking-wide text-[#111] uppercase font-poppins mb-10 hidden md:block">
                    POPULAR COURSES
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                    {paidBatches.map(batch => (
                      <CourseCard key={batch.id} course={batch} onSelect={onSelectCourse} />
                    ))}
                  </div>
                </div>
              )}

              {/* Free Section */}
              {freeBatches.length > 0 && (
                isViewingAllFree ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12 justify-items-center">
                    {freeBatches.map(batch => (
                      <CourseCard key={batch.id} course={batch} onSelect={onSelectCourse} />
                    ))}
                  </div>
                ) : (
                  <FreeBatchSection batches={freeBatches} onSelect={onSelectCourse} onViewAll={() => setIsViewingAllFree(true)} />
                )
              )}

              {filtered.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-lg font-medium">No batches found.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegularBatchesTab;
