import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; //
import { supabase } from '@/integrations/supabase/client';
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ChevronRight, 
  BookOpen, 
  CheckCircle2, 
  Loader2, 
  Maximize2, 
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";

interface RegularBatchesTabProps {
  focusArea: string;
}

const CourseCard: React.FC<{ course: Tables<'courses'> }> = ({ course }) => {
  const navigate = useNavigate(); //
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const discount = course.discounted_price 
    ? Math.round(((course.price - course.discounted_price) / course.price) * 100) 
    : 0;

  const courseImage = course.image_url || "https://i.imgur.com/eBf29iE.png";

  // Navigation handler for the detail page
  const handleViewDetail = () => {
    navigate(`/course/${course.id}`); // Navigates to the CourseDetail route
  };

  return (
    <>
      <div className="w-full max-w-[360px] bg-white rounded-[20px] overflow-hidden shadow-sm border border-[#e0e0e0] flex flex-col transition-all hover:shadow-md">
        <div className="relative group cursor-pointer" onClick={() => setIsPreviewOpen(true)}>
          <img 
            src={courseImage} 
            alt={course.title} 
            className="w-full block aspect-video object-cover transition-transform duration-300 group-hover:scale-[1.02]" 
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/90 p-2 rounded-full shadow-lg">
              <Maximize2 className="w-5 h-5 text-gray-900" />
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-center mb-[10px]">
            <span className="text-[#f97316] font-bold text-base">{course.level || 'Academic'}</span>
            <span className="border border-[#ccc] px-2 py-0.5 rounded-[5px] text-[11px] font-semibold text-[#555] uppercase">
              {course.language || 'Hinglish'}
            </span>
          </div>

          <h2 className="text-[20px] font-bold text-[#1f2937] m-0 mb-[15px] line-clamp-1">{course.title}</h2>

          <div className="min-h-[70px]">
            <div className="flex items-center gap-2.5 mb-2 text-[#4b5563] text-[15px]">
              <BookOpen className="w-[18px] h-[18px] text-[#666]" />
              {course.subject || 'Foundation'}
            </div>
            <div className="flex items-center gap-2.5 text-[#4b5563] text-[15px]">
              <span className="w-2 h-2 bg-[#dc2626] rounded-full"></span>
              <span className="font-bold">Ongoing</span> 
              <span className="text-[#d1d5db] mx-1">|</span> 
              Started on {course.start_date || "17th Dec'25"}
            </div>
          </div>

          <div className="flex justify-between items-center mt-auto pt-[15px]">
            <div className="leading-tight">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[20px] font-extrabold text-black">₹{course.discounted_price || course.price}</span>
                {course.discounted_price && (
                  <span className="text-[14px] text-[#9ca3af] line-through">₹{course.price}</span>
                )}
              </div>
              {discount > 0 && (
                <span className="block text-[#166534] font-bold text-[15px] mt-0.5">{discount}% OFF</span>
              )}
            </div>
            
            <div className="flex gap-2.5">
              <button 
                onClick={handleViewDetail}
                className="bg-[#1f2937] text-white border-none py-2.5 px-6 rounded-[10px] font-bold text-[15px] hover:bg-[#111827] transition-colors"
              >
                Buy Now
              </button>
              <button 
                onClick={handleViewDetail}
                className="bg-white border border-[#e5e7eb] w-11 h-11 rounded-[10px] flex items-center justify-center transition-all hover:bg-slate-50"
              >
                <ChevronRight className="w-5 h-5 text-[#1f2937]" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsPreviewOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={(e) => { e.stopPropagation(); setIsPreviewOpen(false); }}
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={courseImage} 
            alt="Preview" 
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300" 
          />
        </div>
      )}
    </>
  );
};

const RegularBatchesTab: React.FC<RegularBatchesTabProps> = ({ focusArea }) => {
  const [batches, setBatches] = useState<Tables<'courses'>[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .ilike('exam_category', focusArea)
          .eq('batch_type', 'regular')
          .eq('payment_type', 'paid');
        
        if (error) throw error;
        if (data) setBatches(data);
      } catch (err) {
        console.error("Error fetching batches:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (focusArea) {
      fetchCourses();
    }
  }, [focusArea]);

  const filtered = batches.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#f9f9f9]">
      <div className="sticky top-0 z-40 bg-white border-b border-[#e0e0e0] px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <h1 className="text-[22px] font-bold tracking-tight text-[#1a1a1a] whitespace-nowrap">Regular Batches</h1>
          <div className="relative w-full max-w-xs md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            <Input 
              placeholder="Search batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-white border-[#e0e0e0] rounded-lg focus:ring-1 focus:ring-orange-500 transition-all shadow-none text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[400px] bg-slate-100 animate-pulse rounded-[20px] flex items-center justify-center">
                   <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-8 pb-12">
              {filtered.map(batch => <CourseCard key={batch.id} course={batch} />)}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
              <p className="text-slate-500 text-lg font-medium">No paid regular batches found for "{focusArea}".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegularBatchesTab;
