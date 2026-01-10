import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Clock, Tag } from "lucide-react";

interface CourseCardProps {
  course: any;
  index: number;
}

const CourseCard = ({ course, index }: CourseCardProps) => {
  // Logic to calculate discount percentage
  const discountPercent = course.price && course.discounted_price
    ? Math.round(((course.price - course.discounted_price) / course.price) * 100)
    : 0;

  // Format dates: "14 Apr, 2025"
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "TBA";
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div 
      className="bg-white w-full border-[1.2px] border-[#e2e8f0] relative p-3 shadow-sm transition-all hover:border-[#1E3A8A] font-sans"
      style={{ borderRadius: '6px' }}
    >
      {/* Banner Section - Zoomed out height */}
      <div 
        className="w-full h-[170px] bg-muted relative overflow-hidden mb-3"
        style={{ borderRadius: '6px' }}
      >
        {course.image_url ? (
          <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#fce07c] to-[#f9c83d] flex items-center justify-center">
            <span className="text-white font-black text-xl text-center px-4 uppercase leading-tight">
              {course.title}
            </span>
          </div>
        )}
      </div>

      {/* Header Section */}
      <div className="flex items-start gap-2 mb-4 px-0.5">
        {/* Non-bold title, wraps to 2nd line */}
        <h2 className="text-[17px] font-normal text-[#1a1a1a] flex-1 leading-[1.3] line-clamp-2 h-[44px]">
          {course.title}
        </h2>
        
        {/* Dynamic Tags */}
        <div className="flex gap-1 shrink-0 mt-0.5">
          {course.bestseller && (
            <span className="bg-[#f59e0b] text-white text-[10px] font-bold px-2 py-0.5" style={{ borderRadius: '4px' }}>
              NEW
            </span>
          )}
        </div>
      </div>

      {/* Info Rows */}
      <div className="mb-4 px-0.5 space-y-1.5">
        <div className="flex items-center gap-2 text-[#6b7280] text-[12.5px]">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>For <span className="text-[#1a1a1a] font-semibold uppercase">{course.exam_category}</span> Aspirants</span>
        </div>
        <div className="flex items-center gap-2 text-[#6b7280] text-[12.5px]">
          <Clock className="w-3.5 h-3.5" />
          <span className="truncate">
            Starts <b className="text-[#1a1a1a] font-semibold">{formatDate(course.start_date)}</b>
          </span>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="flex items-end justify-between mb-4 px-0.5">
        <div>
          <div className="flex items-center">
            <span className="text-xl font-bold text-[#1E3A8A]">
              ₹{course.discounted_price?.toLocaleString() || course.price?.toLocaleString()}
            </span>
            {course.discounted_price && (
              <span className="text-xs text-[#94a3b8] line-through ml-1.5">
                ₹{course.price?.toLocaleString()}
              </span>
            )}
          </div>
          <span className="block text-[9px] font-bold text-[#94a3b8] mt-0.5 uppercase">
            (FULL BATCH)
          </span>
        </div>

        {discountPercent > 0 && (
          <div className="bg-[#e6f7ef] text-[#1b8b5a] px-2 py-1 text-[10px] font-bold flex items-center gap-1 shrink-0" style={{ borderRadius: '4px' }}>
            <Tag className="w-3 h-3" />
            {discountPercent}% OFF
          </div>
        )}
      </div>

      {/* Action Buttons - Deep Blue Only */}
      <div className="flex gap-2.5">
        <Link 
          to={`/course/${course.id}`} 
          className="flex-1 border-[1.5px] border-[#1E3A8A] text-[#1E3A8A] bg-white h-10 flex items-center justify-center text-[12px] font-bold uppercase transition-all hover:bg-blue-50"
          style={{ borderRadius: '6px' }}
        >
          Explore
        </Link>
        <button 
          className="flex-1 bg-[#1E3A8A] text-white border-none h-10 flex items-center justify-center text-[12px] font-bold uppercase transition-all hover:bg-[#1e3a8ad9]"
          style={{ borderRadius: '6px' }}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
