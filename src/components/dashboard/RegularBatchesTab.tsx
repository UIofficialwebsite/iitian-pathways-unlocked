import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronRight, Users, Star, Clock, Sparkles, Languages, CalendarDays, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";

interface RegularBatchesTabProps {
  focusArea: string;
}

const CourseCard: React.FC<{ course: Tables<'courses'> }> = ({ course }) => {
  const [showDetails, setShowDetails] = useState(false);
  const isDark = course.tags?.includes('dark-theme');

  return (
    <div className={cn(
      "flex flex-col rounded-[20px] overflow-hidden border border-slate-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl bg-white",
      isDark && "bg-[#1e292b] text-white border-none"
    )}>
      {/* Banner */}
      <div 
        className="h-[200px] bg-cover bg-center relative bg-slate-100"
        style={{ backgroundImage: `url(${course.image_url || 'https://via.placeholder.com/400x200?text=Batch+Banner'})` }}
      >
        <div className={cn(
          "absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 text-slate-900 shadow-sm",
          isDark && "bg-[#3c2a1e] text-white"
        )}>
          {isDark ? '🎯 OFFLINE CENTRE' : `⚙️ ${course.course_type || 'Regular Batch'}`}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-3">
          <span className={cn("font-bold text-sm", isDark ? "text-[#ff9e43]" : "text-[#f58220]")}>
            {course.level || 'Academic'}
          </span>
          <span className={cn(
            "border px-2 py-0.5 rounded text-[10px] font-bold uppercase",
            isDark ? "border-slate-600 text-slate-300" : "border-slate-300 text-slate-600"
          )}>
            {course.language || 'Hinglish'}
          </span>
        </div>

        <h2 className="text-xl font-bold leading-tight mb-4 min-h-[50px] line-clamp-2">
          {course.title}
        </h2>

        {!showDetails ? (
          <ul className="space-y-2 mb-5">
            <li className="flex items-center gap-2 text-sm opacity-80">
              <Languages className="w-4 h-4 text-blue-500" /> {course.subject || 'All Subjects'}
            </li>
            <li className="flex items-center gap-2 text-sm opacity-80">
              <CalendarDays className="w-4 h-4 text-red-500" /> Starts {course.start_date || 'Soon'}
            </li>
          </ul>
        ) : (
          <div className="mb-5 animate-in fade-in slide-in-from-top-1 duration-300">
             <h4 className="text-xs font-bold uppercase tracking-wider mb-2 opacity-60">Batch Features:</h4>
             <ul className="space-y-1.5">
                {(course.features || ['Experienced Faculty', 'Live Classes', 'Doubt Support']).map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{f}</span>
                  </li>
                ))}
             </ul>
          </div>
        )}

        <div className="flex justify-between items-end mt-auto pt-4">
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold">₹{course.discounted_price || course.price}</span>
            {course.discounted_price && (
              <div className="flex items-center gap-2">
                <span className="text-xs line-through opacity-50">₹{course.price}</span>
                <span className="text-xs font-bold text-green-600">
                  {Math.round(((course.price - course.discounted_price) / course.price) * 100)}% OFF
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button className={cn(
              "font-bold h-10 px-6 rounded-lg",
              isDark ? "bg-white text-slate-900 hover:bg-slate-100" : "bg-[#1a1c1e] text-white hover:bg-slate-800"
            )}>
              {course.payment_type === 'free' ? 'Enroll' : 'Buy Now'}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowDetails(!showDetails)}
              className={cn(
                "h-10 w-10 rounded-lg border-slate-200 transition-transform",
                showDetails && "rotate-90 bg-slate-100"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
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
      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('exam_category', focusArea)
        .eq('batch_type', 'regular');
      if (data) setBatches(data);
      setLoading(false);
    };
    fetchCourses();
  }, [focusArea]);

  const filteredBatches = batches.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Consolidated Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 -mx-4 md:-mx-8 px-4 md:px-8 py-6 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Regular Batches</h1>
            <p className="text-slate-500 text-sm mt-1">Found {filteredBatches.length} courses for {focusArea}</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder={`Search for "${batches[0]?.title || 'batch name'}..."`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-white border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="h-[450px] bg-slate-100 animate-pulse rounded-[20px]" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-8 pb-20">
            {filteredBatches.map(batch => (
              <CourseCard key={batch.id} course={batch} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegularBatchesTab;
