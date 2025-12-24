import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, BookOpen, CheckCircle2, Loader2, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";

interface RegularBatchesTabProps {
  focusArea: string;
  onSelectCourse: (id: string) => void;
}

const CourseCard: React.FC<{ 
  course: Tables<'courses'>, 
  onSelect: (id: string) => void 
}> = ({ course, onSelect }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const discount = course.discounted_price 
    ? Math.round(((course.price - course.discounted_price) / course.price) * 100) 
    : 0;

  const courseImage = course.image_url || "https://i.imgur.com/eBf29iE.png";

  return (
    <>
      <div className="w-full max-w-[360px] bg-white rounded-[20px] overflow-hidden shadow-sm border border-[#e0e0e0] flex flex-col transition-all hover:shadow-md">
        {/* Image Section */}
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

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#f97316] font-bold text-sm uppercase">{course.level || 'Academic'}</span>
            <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase">
              {course.language || 'Hinglish'}
            </span>
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-4 line-clamp-1">{course.title}</h2>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <BookOpen className="w-4 h-4" />
              {course.subject || 'Foundation'}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-gray-600">Starts: {course.start_date || "Coming Soon"}</span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-auto">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-gray-900">₹{course.discounted_price || course.price}</span>
                {course.discounted_price && (
                  <span className="text-xs text-gray-400 line-through">₹{course.price}</span>
                )}
              </div>
              {discount > 0 && <span className="text-xs text-green-600 font-bold">{discount}% OFF</span>}
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => onSelect(course.id)}
                className="bg-royal text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Enroll Now
              </button>
              <button 
                onClick={() => onSelect(course.id)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsPreviewOpen(false)}
        >
          <button className="absolute top-6 right-6 text-white"><X className="w-8 h-8" /></button>
          <img src={courseImage} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
        </div>
      )}
    </>
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
    <div className="flex flex-col h-full bg-white">
      {/* Slim Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Regular Batches</h1>
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm bg-gray-50 border-none rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl" />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {filtered.map(batch => (
                <CourseCard key={batch.id} course={batch} onSelect={onSelectCourse} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400">No regular batches found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegularBatchesTab;
