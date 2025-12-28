import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, BookOpen, ArrowLeft } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { FreeBatchSection } from './FreeBatchSection';
import { useIsMobile } from "@/hooks/use-mobile";
import SlidersIcon from "@/components/ui/SliderIcon";
import RefineBatchesModal from "./RefineBatchesModal"; 

interface RegularBatchesTabProps {
  focusArea: string;
  onSelectCourse: (id: string) => void;
}

const CourseCard: React.FC<{ 
  course: Tables<'courses'>, 
  onSelect: (id: string) => void 
}> = ({ course, onSelect }) => {
  const discount = course.discounted_price 
    ? Math.round(((course.price - course.discounted_price) / course.price) * 100) 
    : 0;

  return (
    <div className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-[#e0e0e0] flex flex-col transition-all duration-300 h-full">
      <div className="w-full aspect-video overflow-hidden bg-gray-100">
        <img 
          src={course.image_url || "/lovable-uploads/logo_ui_new.png"} 
          alt={course.title} 
          className="w-full h-full object-cover" 
        />
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-[10px]">
          <span className="text-[#f97316] font-bold text-xs uppercase tracking-tight">{course.level || 'Academic'}</span>
          <span className="border border-[#ccc] px-2 py-0.5 rounded-[4px] text-[10px] font-semibold text-[#555] uppercase">{course.language || 'Hinglish'}</span>
        </div>
        
        <h2 className="text-[18px] font-bold text-[#1f2937] mb-[12px] line-clamp-2 leading-tight h-[44px]">{course.title}</h2>
        
        <div className="min-h-[50px] space-y-2 mb-4">
          <div className="flex items-center gap-2.5 text-[#4b5563] text-[14px]">
            <BookOpen className="w-[18px] h-[18px] text-[#666]" />
            {course.subject || 'Foundation'}
          </div>
          <div className="flex items-center gap-2.5 text-[#4b5563] text-[14px]">
            <span className="w-2 h-2 bg-[#dc2626] rounded-full"></span>
            <span className="font-bold">Ongoing</span> 
            <span className="text-[#d1d5db] mx-1">|</span> 
            Starts: {course.start_date ? new Date(course.start_date).toLocaleDateString('en-GB') : "TBD"}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-auto pt-[15px] border-t border-gray-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[20px] font-extrabold text-black">₹{course.discounted_price || course.price}</span>
              {course.discounted_price && <span className="text-[13px] text-[#9ca3af] line-through">₹{course.price}</span>}
            </div>
            {discount > 0 && <span className="text-[#166534] font-bold text-[13px]">{discount}% OFF</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => onSelect(course.id)} className="bg-[#1f2937] text-white py-2 px-5 rounded-lg font-bold text-[13px] hover:bg-black transition-colors">Enroll</button>
            <button onClick={() => onSelect(course.id)} className="bg-white border border-[#e5e7eb] w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-5 h-5 text-[#1f2937]" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegularBatchesTab: React.FC<RegularBatchesTabProps> = ({ focusArea, onSelectCourse }) => {
  const isMobile = useIsMobile();
  const [batches, setBatches] = useState<Tables<'courses'>[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isViewingAllFree, setIsViewingAllFree] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState("All");
  
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data } = await supabase.from('courses')
        .select('*')
        .ilike('exam_category', focusArea)
        .eq('batch_type', 'regular');
      if (data) setBatches(data);
      setLoading(false);
    };
    fetchCourses();
  }, [focusArea]);

  // Intelligence: Extract unique fields for dynamic placeholders
  const availableLevels = Array.from(new Set(batches.filter(b => b.level).map(b => b.level)));
  const availableSubjects = Array.from(new Set(batches.filter(b => b.subject).map(b => b.subject)));

  // Placeholder logic to show existing levels, subjects, or titles
  const getDynamicPlaceholder = () => {
    if (loading || batches.length === 0) return "Search batches...";
    
    const examples: string[] = [];
    if (availableLevels[0]) examples.push(availableLevels[0]);
    if (availableSubjects[0]) examples.push(availableSubjects[0]);
    if (focusArea) examples.push(focusArea);
    if (batches[0]?.title) examples.push(batches[0].title.split(' ')[0]);
    
    // Limits examples to first 3 matches for a clean UI
    return `Search "${examples.slice(0, 3).join('", "')}"...`;
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 10);
  };

  const filtered = batches.filter(b => {
    // Comprehensive Search: Matches title, level, subject, exam category, or branch
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      b.title.toLowerCase().includes(searchLower) ||
      (b.level?.toLowerCase().includes(searchLower) || false) ||
      (b.subject?.toLowerCase().includes(searchLower) || false) ||
      (b.exam_category?.toLowerCase().includes(searchLower) || false) ||
      (b.branch?.toLowerCase().includes(searchLower) || false);

    const matchesQuickFilter = activeQuickFilter === "All" || b.level === activeQuickFilter;
    
    const matchesLevel = !appliedFilters.level?.length || 
      appliedFilters.level.includes(b.level || "") || 
      appliedFilters.level.includes(b.branch || "");

    const matchesSubject = !appliedFilters.subject?.length || 
      appliedFilters.subject.includes(b.subject || "");
    
    const matchesLanguage = !appliedFilters.language?.length || 
      appliedFilters.language.includes(b.language || "");

    const matchesExamCategory = !appliedFilters.exam_category?.length ||
      appliedFilters.exam_category.includes(b.exam_category || "");

    return matchesSearch && matchesQuickFilter && matchesLevel && matchesSubject && matchesLanguage && matchesExamCategory;
  });

  const paidBatches = filtered.filter(b => b.payment_type === 'paid');
  const freeBatches = filtered.filter(b => b.payment_type === 'free');

  return (
    <div className="flex flex-col h-full bg-white"> 
      <div className={`sticky top-0 z-30 bg-white transition-all duration-300 px-4 md:px-6 lg:px-8 shrink-0 flex flex-col ${isScrolled ? 'border-b border-[#e0e0e0] shadow-sm' : 'border-b-transparent shadow-none'}`}>
        <div className="h-[73px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isViewingAllFree && (
              <button onClick={() => setIsViewingAllFree(false)} className="mr-1 p-1 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className={`${isMobile ? 'text-[18px]' : 'text-[22px]'} font-bold tracking-tight text-[#1a1a1a]`}>
              {isViewingAllFree ? "Free Batches" : "Batches"}
            </h1>
          </div>
          <div className="relative flex-1 max-w-[250px] md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            <Input 
              placeholder={getDynamicPlaceholder()} 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-9 h-11 bg-gray-50 border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-800 text-sm shadow-none" 
            />
          </div>
        </div>

        {!isViewingAllFree && (
          <div className="flex gap-2.5 pb-4 overflow-x-auto no-scrollbar items-center">
            <div 
              onClick={() => setIsRefineModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full text-[12px] font-bold text-gray-500 whitespace-nowrap bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
            >
              Filter <SlidersIcon className="w-4 h-4" />
            </div>
            
            <button
              onClick={() => setActiveQuickFilter("All")}
              className={`px-4 py-2 border rounded-full text-[12px] font-bold transition-all whitespace-nowrap ${activeQuickFilter === "All" ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200'}`}
            >
              All
            </button>
            {availableLevels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setActiveQuickFilter(lvl!)}
                className={`px-4 py-2 border rounded-full text-[12px] font-bold transition-all whitespace-nowrap ${activeQuickFilter === lvl ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200'}`}
              >
                {lvl}
              </button>
            ))}
          </div>
        )}
      </div>

      <div onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6 no-scrollbar">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
              {[1, 2, 3].map(i => <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <>
              {!isViewingAllFree && paidBatches.length > 0 && (
                <div className="mb-14">
                  <h2 className="text-[24px] font-semibold tracking-tight text-[#111] uppercase mb-8 hidden md:block">
                    Popular Batches
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                    {paidBatches.map(batch => (
                      <CourseCard key={batch.id} course={batch} onSelect={onSelectCourse} />
                    ))}
                  </div>
                </div>
              )}

              {freeBatches.length > 0 && (
                isViewingAllFree ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-12 w-full">
                    {freeBatches.map(batch => (
                      <CourseCard key={batch.id} course={batch} onSelect={onSelectCourse} />
                    ))}
                  </div>
                ) : (
                  <FreeBatchSection batches={freeBatches} onSelect={onSelectCourse} onViewAll={() => setIsViewingAllFree(true)} />
                )
              )}

              {filtered.length === 0 && (
                <div className="text-center py-24 bg-gray-50 rounded-2xl border border-dashed border-gray-200 w-full">
                  <p className="text-gray-400 text-lg font-medium">No results found matching your search.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <RefineBatchesModal 
        isOpen={isRefineModalOpen} 
        onClose={() => setIsRefineModalOpen(false)} 
        onApply={(filters) => setAppliedFilters(filters)} 
        focusArea={focusArea}
      />
    </div>
  );
};

export default RegularBatchesTab;
