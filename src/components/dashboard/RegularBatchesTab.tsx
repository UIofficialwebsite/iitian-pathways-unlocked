import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, BookOpen, Star, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";

interface RegularBatchesTabProps {
  focusArea: string;
}

const CourseCard: React.FC<{ course: Tables<'courses'> }> = ({ course }) => {
  const [showDetails, setShowDetails] = useState(false);
  const discount = course.discounted_price 
    ? Math.round(((course.price - course.discounted_price) / course.price) * 100) 
    : 0;

  return (
    <div className="w-full max-w-[360px] bg-white rounded-[20px] overflow-hidden shadow-sm border border-[#e0e0e0] flex flex-col transition-all hover:shadow-md">
      {/* Header Banner Section */}
      <div className="bg-[#fffbeb] relative pt-[10px] text-center">
        <div className="inline-flex items-center gap-1.5 text-[13px] color-[#444]">
          <Star className="w-4 h-4 fill-[#facc15] text-[#facc15]" />
          <span>Multiple plans inside: <strong>Infinity, Pro</strong></span>
        </div>
        <img 
          src={course.image_url || "https://i.imgur.com/eBf29iE.png"} 
          alt="Banner" 
          className="w-full block mt-[5px] aspect-video object-cover" 
        />
        <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 bg-[#facc15] text-black text-[11px] font-extrabold px-3 py-1 rounded-[6px] uppercase shadow-sm whitespace-nowrap">
          {course.course_type || "Comeback Kit Included"}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-[10px]">
          <span className="text-[#f97316] font-bold text-base">{course.level || 'Academic'}</span>
          <span className="border border-[#ccc] px-2 py-0.5 rounded-[5px] text-[11px] font-semibold text-[#555] uppercase">
            {course.language || 'Hinglish'}
          </span>
        </div>

        <h2 className="text-[20px] font-bold text-[#1f2937] m-0 mb-[15px] line-clamp-1">{course.title}</h2>

        <div className="min-h-[70px]">
          {!showDetails ? (
            <>
              <div className="flex items-center gap-2.5 mb-2 text-[#4b5563] text-[15px]">
                <BookOpen className="w-[18px] h-[18px] text-[#666]" />
                {course.subject || 'Boards 2026'}
              </div>
              <div className="flex items-center gap-2.5 text-[#4b5563] text-[15px]">
                <span className="w-2 h-2 bg-[#dc2626] rounded-full"></span>
                <span className="font-bold">Ongoing</span> 
                <span className="text-[#d1d5db] mx-1">|</span> 
                Started on {course.start_date || "17th Dec'25"}
              </div>
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-1 duration-300">
              <ul className="space-y-1.5">
                {(course.features || ['Live Classes', 'DPPs', 'Doubt Support']).slice(0, 3).map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#4b5563]">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Pricing */}
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
            <button className="bg-[#1f2937] text-white border-none py-2.5 px-6 rounded-[10px] font-bold text-[15px] hover:bg-[#111827] transition-colors">
              Buy Now
            </button>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className={cn(
                "bg-white border border-[#e5e7eb] w-11 h-11 rounded-[10px] flex items-center justify-center transition-all",
                showDetails && "rotate-90 bg-slate-50"
              )}
            >
              <ChevronRight className="w-5 h-5 text-[#1f2937]" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegularBatchesTab: React.FC<RegularBatchesTabProps> = ({ focusArea }) => {
  const [batches, setBatches] = useState<Tables<'courses'>[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      console.log("Fetching regular batches for focus area:", focusArea); // Debug log
      
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          // Using ilike for case-insensitive matching to ensure JEE/jee both work
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
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-[#e0e0e0] px-6 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-[32px] font-bold tracking-tight text-[#1a1a1a]">Regular Batches</h1>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            <Input 
              placeholder={`Search for batch name...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-white border-[#e0e0e0] rounded-xl focus:ring-2 focus:ring-orange-500 transition-all shadow-none text-base"
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
              <p className="text-slate-400 text-sm mt-1">Check if the course has batch_type='regular' and payment_type='paid' in Supabase.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegularBatchesTab;
