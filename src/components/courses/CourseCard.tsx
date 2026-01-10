import React from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Clock, Tag } from "lucide-react";
import { Course } from '@/components/admin/courses/types';

interface CourseCardProps {
  course: Course;
  index: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, index }) => {
  const navigate = useNavigate();

  const discountPercent = course.price && course.discounted_price
    ? Math.round(((course.price - course.discounted_price) / course.price) * 100)
    : 0;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "TBA";
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div 
      className="bg-white w-full border-[1.2px] border-[#e2e8f0] relative p-3 shadow-[0_4px_12px_rgba(0,0,0,0.03)] font-['Public_Sans',sans-serif] flex flex-col h-full"
      style={{ borderRadius: '6px' }}
    >
      {/* Banner - Aspect Ratio Container */}
      <div 
        className="w-full aspect-[16/9] bg-gradient-to-b from-[#fce07c] to-[#f9c83d] relative overflow-hidden mb-3 flex flex-col justify-center items-center"
        style={{ borderRadius: '4px' }}
      >
        {course.image_url ? (
          <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-white/90 text-[clamp(18px,5vw,24px)] font-[800] text-center uppercase leading-tight px-3">
            {course.title.split(' ').slice(0, 2).join(' ')}<br/>{course.title.split(' ').slice(2).join(' ')}
          </div>
        )}
      </div>

      {/* Header Section */}
      <div className="flex items-start gap-2 mb-3 px-0.5">
        <h2 className="text-[clamp(16px,4vw,18px)] font-bold text-[#1a1a1a] flex-1 leading-[1.3] line-clamp-2 min-h-[2.6em]">
          {course.title}
        </h2>
        
        <div className="flex flex-col gap-1 shrink-0 mt-0.5">
          {course.bestseller && (
            <span className="bg-[#f59e0b] text-white text-[9px] font-normal px-2 py-0.5 text-center" style={{ borderRadius: '4px' }}>
              NEW
            </span>
          )}
          {course.language && (
            <span className="bg-[#f3f4f6] text-[#4b5563] text-[9px] font-normal px-2 py-0.5 text-center" style={{ borderRadius: '4px' }}>
              {course.language}
            </span>
          )}
        </div>
      </div>

      {/* Info Rows */}
      <div className="mb-4 px-0.5 space-y-1.5 flex-grow">
        <div className="flex items-center gap-2 text-[#6b7280] text-[12px] font-normal">
          <GraduationCap className="w-3.5 h-3.5" />
          <span className="truncate">For <span className="text-[#1a1a1a] uppercase">{course.exam_category}</span> Aspirants</span>
        </div>
        <div className="flex items-center gap-2 text-[#6b7280] text-[12px] font-normal">
          <Clock className="w-3.5 h-3.5" />
          <span className="truncate">Starts <span className="text-[#1a1a1a]">{formatDate(course.start_date)}</span></span>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="flex items-end justify-between mb-4 px-0.5 pt-2 border-t border-gray-50">
        <div>
          <div className="flex items-center">
            <span className="text-[20px] font-bold text-[#1E3A8A]">
              ₹{course.discounted_price?.toLocaleString() || course.price?.toLocaleString()}
            </span>
            {course.discounted_price && (
              <span className="text-[12px] text-[#94a3b8] line-through font-normal ml-1.5">
                ₹{course.price?.toLocaleString()}
              </span>
            )}
          </div>
          <span className="block text-[8px] font-normal text-[#94a3b8] mt-0.5 uppercase">
            (FULL BATCH)
          </span>
        </div>

        {discountPercent > 0 && (
          <div className="bg-[#e6f7ef] text-[#1b8b5a] px-2 py-1 text-[9px] font-normal flex items-center gap-1 shrink-0" style={{ borderRadius: '4px' }}>
            <Tag className="w-3 h-3" />
            {discountPercent}% OFF
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2.5">
        <button 
          className="flex-1 border-[1.2px] border-[#1E3A8A] text-[#1E3A8A] bg-white h-[38px] flex items-center justify-center text-[11px] font-normal uppercase transition-all hover:bg-blue-50"
          style={{ borderRadius: '6px' }}
          onClick={() => navigate(`/course/${course.id}`)}
        >
          Explore
        </button>
        <button 
          className="flex-1 bg-[#1E3A8A] text-white border-none h-[38px] flex items-center justify-center text-[11px] font-normal uppercase transition-all hover:opacity-90"
          style={{ borderRadius: '6px' }}
          onClick={() => navigate(`/course/${course.id}`)}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
