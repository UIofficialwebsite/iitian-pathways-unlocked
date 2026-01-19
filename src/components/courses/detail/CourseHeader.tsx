import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Course } from '@/components/admin/courses/types';

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

  // Custom Icons
  const calendarIcon = "https://i.ibb.co/S482HQ1X/image.png";
  const studentIcon = "https://i.ibb.co/zh2tG4Yk/image.png";

  return (
    <div className="relative w-full overflow-hidden font-['Inter',sans-serif] bg-gradient-to-br from-[#f0f4ff] via-[#e6e9ff] to-[#f9f7ff]">
      {/* Light Rays Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.8)_0%,transparent_40%)]" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-6 md:py-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[13px] md:text-[14px] text-[#4b4b4b] mb-4 font-medium flex-wrap">
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
             <span className="text-black/60 truncate max-w-[200px] sm:max-w-none">{course.title}</span>
        </nav>

        {/* Hero Title */}
        <h1 className="text-3xl md:text-[40px] font-[800] text-[#2d2d2d] leading-[1.2] mb-5 tracking-tight max-w-5xl">
            {course.title}
        </h1>

        {/* Info Rows (Using Custom Images) */}
        <div className="flex flex-col gap-3 mb-6">
            {/* Target Audience Row */}
            <div className="flex items-center gap-3 text-[15px] md:text-[16px] font-[500] text-[#2d2d2d]">
               <div className="w-8 h-8 rounded-full bg-[#e2e8ff] flex items-center justify-center shrink-0 p-1.5">
                 <img src={studentIcon} alt="Target Audience" className="w-full h-full object-contain" />
               </div>
               <span>
                 For {course.exam_category || "All"} Aspirants
               </span>
            </div>

            {/* Dates Row */}
            <div className="flex items-center gap-3 text-[15px] md:text-[16px] font-[500] text-[#2d2d2d]">
               <div className="w-8 h-8 rounded-full bg-[#e2e8ff] flex items-center justify-center shrink-0 p-1.5">
                 <img src={calendarIcon} alt="Calendar" className="w-full h-full object-contain" />
               </div>
               <div className="flex flex-wrap gap-x-2 gap-y-1">
                 <span>Starts on {formatDate(course.start_date || "")}</span>
                 <span className="text-[#ccc]">|</span>
                 <span>Ends on {formatDate(course.end_date || "")}</span>
               </div>
            </div>
        </div>

        {/* Extra Details (Purple/Violet Blocks with Light Black Border) */}
        <div className="flex flex-wrap gap-3 mt-2">
            {/* Rating */}
            <div className="bg-[#ede9fe] border border-black/10 rounded-md px-3 py-1.5 text-[13px] text-black font-medium">
               Rating: {course.rating || "4.8"}/5
            </div>
            
            {/* Language */}
            <div className="bg-[#ede9fe] border border-black/10 rounded-md px-3 py-1.5 text-[13px] text-black font-medium">
               Language: {course.language || "English"}
            </div>
             
             {/* Bestseller Tag */}
             {course.bestseller && (
                <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-md px-3 py-1.5 text-[13px] text-black font-medium">
                  Bestseller
                </div>
             )}
        </div>

      </div>
    </div>
  );
};

export default CourseHeader;
