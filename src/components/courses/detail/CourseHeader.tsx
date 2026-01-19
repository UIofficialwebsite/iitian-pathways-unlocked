import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Course } from '@/components/admin/courses/types';
import { cn } from "@/lib/utils";

interface CourseHeaderProps {
  course: Course;
  isDashboardView?: boolean;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ course, isDashboardView }) => {
  const navigate = useNavigate();

  // Helper to format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return "TBD";
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="relative w-full overflow-hidden font-['Inter',sans-serif] bg-gradient-to-br from-[#f0f4ff] via-[#e6e9ff] to-[#f9f7ff]">
      {/* Light Rays Effect (Pseudo-element simulation) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.8)_0%,transparent_40%)]" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-10 md:py-12 flex justify-between items-start">
        
        {/* LEFT CONTENT */}
        <div className="max-w-[700px] w-full">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[13px] md:text-[14px] text-[#4b4b4b] mb-6 font-medium">
             <span className="cursor-pointer hover:text-black transition-colors" onClick={() => navigate('/')}>
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
             </span>
             <span className="text-[#b0b0b0]">&rsaquo;</span>
             <span className="cursor-pointer hover:text-black transition-colors" onClick={() => navigate('/courses')}>Courses</span>
             {course.exam_category && (
               <>
                 <span className="text-[#b0b0b0]">&rsaquo;</span>
                 <span className="uppercase">{course.exam_category}</span>
               </>
             )}
             <span className="text-[#b0b0b0]">&rsaquo;</span>
             <span className="text-black/60 truncate max-w-[150px] sm:max-w-none">{course.title}</span>
          </nav>

          {/* Hero Title */}
          <h1 className="text-3xl md:text-[42px] font-[800] text-[#2d2d2d] leading-[1.2] mb-6 tracking-tight">
            {course.title}
          </h1>

          {/* Info Rows (Using Emojis as icons) */}
          <div className="flex flex-col gap-4 mb-8">
            {/* Target Audience Row */}
            <div className="flex items-center gap-3 text-[15px] md:text-[16px] font-[500] text-[#2d2d2d]">
               <div className="w-8 h-8 rounded-full bg-[#e2e8ff] flex items-center justify-center text-[14px] shrink-0">
                 🎓
               </div>
               <span>
                 For {course.exam_category || "All"} Aspirants
               </span>
            </div>

            {/* Dates Row */}
            <div className="flex items-center gap-3 text-[15px] md:text-[16px] font-[500] text-[#2d2d2d]">
               <div className="w-8 h-8 rounded-full bg-[#e2e8ff] flex items-center justify-center text-[14px] shrink-0">
                 📅
               </div>
               <div className="flex flex-wrap gap-x-2 gap-y-1">
                 <span>Starts on {formatDate(course.start_date || "")}</span>
                 <span className="text-[#ccc]">|</span>
                 <span>Ends on {formatDate(course.end_date || "")}</span>
               </div>
            </div>
          </div>

          {/* Extra Details (Grey Blocks - Last Row) */}
          <div className="flex flex-wrap gap-3 mt-2">
            {/* Rating */}
            <div className="bg-[#f1f3f6] border border-[#e0e0e0] rounded-md px-3 py-1.5 text-[13px] text-black font-normal">
               Rating: {course.rating || "4.8"}/5
            </div>
            
            {/* Enrolled */}
            <div className="bg-[#f1f3f6] border border-[#e0e0e0] rounded-md px-3 py-1.5 text-[13px] text-black font-normal">
               {course.students_enrolled?.toLocaleString() || "1000+"} Students Enrolled
            </div>
            
            {/* Language */}
            <div className="bg-[#f1f3f6] border border-[#e0e0e0] rounded-md px-3 py-1.5 text-[13px] text-black font-normal">
               Language: {course.language || "English"}
            </div>
             
             {/* Bestseller Tag (if applicable) */}
             {course.bestseller && (
                <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-md px-3 py-1.5 text-[13px] text-black font-normal">
                  Bestseller
                </div>
             )}
          </div>

        </div>

        {/* RIGHT CONTENT - Floating Card (Desktop Only) */}
        <div className="hidden lg:block relative z-20 mt-4 mr-4">
          <div className="w-[340px] bg-white rounded-xl border border-[#e0e6ff] shadow-[0_10px_30px_rgba(93,80,230,0.1)] overflow-hidden relative">
            
            {/* Ribbon */}
            <div className="absolute top-[10px] left-[-5px] bg-[#5d50e6] text-white text-[10px] font-bold px-4 py-1 z-30 shadow-sm
              after:content-[''] after:absolute after:right-[-10px] after:top-0 after:border-l-[10px] after:border-l-[#5d50e6] after:border-t-[10px] after:border-t-transparent after:border-b-[10px] after:border-b-transparent after:border-r-[10px] after:border-r-transparent
            ">
              {course.mode?.toUpperCase() || "ONLINE"}
            </div>

            {/* Card Image */}
            <div className="w-full h-[200px] bg-[#f0f2ff] flex items-center justify-center p-2.5">
               <img 
                 src={course.image_url || "https://via.placeholder.com/300x180/5d50e6/ffffff?text=Course+Preview"} 
                 alt={course.title} 
                 className="w-full h-full object-cover rounded-lg"
               />
            </div>

            {/* Card Footer */}
            <div className="p-4 flex justify-between items-center bg-white">
               <div className="text-[14px] font-[600] text-[#2d2d2d] truncate max-w-[200px]">
                 {course.title}
               </div>
               <div className="bg-[#f1f3f6] px-2 py-0.5 rounded text-[11px] font-[700] text-[#666]">
                 {course.language || "Hinglish"}
               </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CourseHeader;
