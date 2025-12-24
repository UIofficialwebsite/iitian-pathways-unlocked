import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, BookOpen, Star, Loader2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

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
    <div className="w-full max-w-[360px] bg-white rounded-[24px] overflow-hidden shadow-sm border border-[#e0e0e0] flex flex-col transition-all hover:shadow-md hover:-translate-y-1">
      <div className="bg-[#fffbeb] relative pt-[12px] text-center pb-2">
        <div className="inline-flex items-center gap-1.5 text-[13px] text-[#444] mb-2">
          <Star className="w-4 h-4 fill-[#facc15] text-[#facc15]" />
          <span>Multiple plans inside: <strong>Infinity, Pro</strong></span>
        </div>
        <img src={course.image_url || ""} className="w-full block aspect-video object-cover" alt="Banner" />
        <div className="absolute bottom-[12px] left-1/2 -translate-x-1/2 bg-[#facc15] text-black text-[11px] font-extrabold px-4 py-1.5 rounded-[8px] uppercase whitespace-nowrap shadow-sm">
          {course.course_type || "Comeback Kit Included"}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[#f97316] font-bold text-base">{course.level || 'Academic'}</span>
          <span className="bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-[6px] text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            {course.language || 'Hinglish'}
          </span>
        </div>

        <h2 className="text-[20px] font-bold text-[#1f2937] leading-tight mb-4 line-clamp-1">{course.title}</h2>

        <div className="min-h-[60px] space-y-2.5 mb-6">
          <div className="flex items-center gap-2.5 text-gray-600 text-[15px]">
            < BookOpen className="w-4 h-4 text-gray-400" />
            {course.subject || 'Foundation'}
          </div>
          <div className="flex items-center gap-2.5 text-gray-600 text-[15px]">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="font-bold">Ongoing</span> 
            <span className="text-gray-300 mx-1">|</span> 
            Starts: {course.start_date ? new Date(course.start_date).toLocaleDateString() : "TBD"}
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-extrabold text-gray-900">₹{course.discounted_price || course.price}</span>
              {course.discounted_price && (
                <span className="text-[14px] text-gray-400 line-through font-medium">₹{course.price}</span>
              )}
            </div>
            {discount > 0 && <span className="text-green-700 font-bold text-[14px]">{discount}% OFF</span>}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => onSelect(course.id)} 
              className="bg-gray-900 text-white py-2.5 px-6 rounded-[12px] font-bold text-[14px] hover:bg-black transition-all active:scale-95 shadow-sm"
            >
              Enroll
            </button>
            <button 
              onClick={() => onSelect(course.id)} 
              className="bg-white border border-gray-200 w-11 h-11 rounded-[12px] flex items-center justify-center hover:bg-gray-50 transition-all text-gray-900 active:scale-95 shadow-sm"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegularBatchesTab: React.FC<RegularBatchesTabProps> = ({ focusArea, onSelectCourse }) => {
  const [batches, setBatches] = useState<Tables<'courses'>[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('courses')
        .select('*')
        .ilike('exam_category', focusArea)
        .eq('batch_type', 'regular')
        .eq('payment_type', 'paid');
      
      if (data) setBatches(data);
      setLoading(false);
    };
    fetchCourses();
  }, [focusArea]);

  const filtered = batches.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-[#f9f9f9]/50">
      {/* HEADER: Standard layout, fixed at the top, no rounding */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 shadow-sm h-[65px] flex items-center">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <h1 className="text-[22px] font-bold tracking-tight text-gray-900">Regular Batches</h1>
          <div className="relative w-full max-w-xs md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search by batch name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-gray-50 border-gray-200 rounded-xl focus:ring-1 focus:ring-orange-500 text-sm shadow-none"
            />
          </div>
        </div>
      </div>

      {/* Grid Content: Starts below the header */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 bg-white animate-pulse rounded-[24px] border border-gray-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
              {filtered.map(batch => (
                <CourseCard key={batch.id} course={batch} onSelect={onSelectCourse} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegularBatchesTab;
