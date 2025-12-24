import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Users, Star, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";

interface RegularBatchesTabProps {
  focusArea: string;
}

const CourseCard: React.FC<{ course: Tables<'courses'>; isCompact?: boolean }> = ({ course, isCompact }) => (
  <Card className={cn(
    "group overflow-hidden transition-all hover:shadow-lg border-slate-200 bg-white flex flex-col h-full",
    isCompact ? "min-w-[260px] max-w-[260px]" : "w-full"
  )}>
    <div className="relative aspect-video overflow-hidden">
      <img 
        src={course.image_url || "/placeholder.svg"} 
        alt={course.title} 
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {course.bestseller && (
        <Badge className="absolute top-2 left-2 bg-amber-500 text-white border-none text-[10px]">
          BESTSELLER
        </Badge>
      )}
    </div>
    
    <div className="p-4 flex flex-col flex-1">
      <h3 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-1 mb-1">{course.title}</h3>
      <p className="text-xs text-slate-500 line-clamp-2 mb-3 min-h-[32px]">{course.description}</p>
      
      <div className="flex items-center gap-3 text-[10px] sm:text-[11px] text-slate-600 mb-4">
        <span className="flex items-center gap-1"><Users className="w-3 h-3"/> {course.students_enrolled || 0}</span>
        <span className="flex items-center gap-1 text-amber-500"><Star className="w-3 h-3 fill-amber-500"/> {course.rating || 4.0}</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {course.duration}</span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="flex flex-col">
          {course.payment_type === 'free' ? (
            <span className="text-green-600 font-bold text-sm">FREE</span>
          ) : (
            <>
              <span className="text-base sm:text-lg font-bold text-slate-900">₹{course.discounted_price || course.price}</span>
              {course.discounted_price && (
                <span className="text-[10px] text-slate-400 line-through">₹{course.price}</span>
              )}
            </>
          )}
        </div>
        <Button 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-700 h-8 px-3 text-[11px] font-medium shrink-0"
          onClick={() => course.enroll_now_link && window.open(course.enroll_now_link, '_blank')}
        >
          Enroll Now
        </Button>
      </div>
    </div>
  </Card>
);

const RegularBatchesTab: React.FC<RegularBatchesTabProps> = ({ focusArea }) => {
  const [paidBatches, setPaidBatches] = useState<Tables<'courses'>[]>([]);
  const [freeBatches, setFreeBatches] = useState<Tables<'courses'>[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('exam_category', focusArea)
        .eq('batch_type', 'regular');

      if (!error && data) {
        setPaidBatches(data.filter(c => c.payment_type !== 'free'));
        setFreeBatches(data.filter(c => c.payment_type === 'free'));
      }
      setLoading(false);
    };
    fetchCourses();
  }, [focusArea]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading batches...</div>;

  return (
    <div className="space-y-12 pb-24">
      {/* Featured Paid Batches Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Featured Regular Batches
          </h2>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            {paidBatches.length} Available
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {paidBatches.map(batch => (
            <CourseCard key={batch.id} course={batch} />
          ))}
        </div>
      </section>

      {/* Free Regular Batches Horizontal Scroller */}
      {freeBatches.length > 0 && (
        <section className="bg-slate-50 -mx-4 md:-mx-8 p-6 md:p-10 border-y border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Free Regular Batches</h2>
                <p className="text-xs text-slate-500 mt-1">Start your journey for free</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => scroll('left')} className="p-2 bg-white border rounded-full hover:bg-slate-50 shadow-sm">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => scroll('right')} className="p-2 bg-white border rounded-full hover:bg-slate-50 shadow-sm">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div 
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide py-2 scroll-smooth"
            >
              {freeBatches.map(batch => (
                <div key={batch.id} className="flex-shrink-0">
                  <CourseCard course={batch} isCompact />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default RegularBatchesTab;
