import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Clock, Tag } from "lucide-react";

interface CourseCardProps {
  course: any;
  index: number;
}

const CourseCard = ({ course, index }: CourseCardProps) => {
  const discountPercent = course.price && course.discounted_price
    ? Math.round(((course.price - course.discounted_price) / course.price) * 100)
    : 0;

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
      className="bg-white w-full border-[1.5px] border-[#e2e8f0] relative p-3 shadow-sm transition-colors duration-200 hover:border-black font-sans"
      style={{ borderRadius: '6px' }}
    >
      {/* Banner */}
      <div 
        className="w-full h-[185px] bg-muted relative overflow-hidden mb-4"
        style={{ borderRadius: '6px' }}
      >
        {course.image_url ? (
          <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#fce07c] to-[#f9c83d] flex items-center justify-center">
            <span className="text-white font-extrabold text-2xl text-center px-4 uppercase leading-tight">
              {course.title}
            </span>
          </div>
        )}
      </div>

      {/* Header: BOLD Title & Tags */}
      <div className="flex items-start gap-2 mb-4 px-1">
        <h2 className="text-[20px] font-bold text-[#1a1a1a] flex-1 leading-[1.2] line-clamp-2 h-[48px]">
          {course.title}
        </h2>
        
        <div className="flex flex-col gap-1.5 shrink-0 mt-1">
          {course.bestseller && (
            <span className="bg-[#f59e0b] text-white text-[10px] font-bold px-2 py-1 text-center" style={{ borderRadius: '4px' }}>
              NEW
            </span>
          )}
          {course.language && (
            <span className="bg-[#f3f4f6] text-[#4b5563] text-[10px] font-bold px-2 py-1 text-center" style={{ borderRadius: '4px' }}>
              {course.language}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mb-5 px-1 space-y-2">
        <div className="flex items-center gap-2 text-[#6b7280] text-[13px]">
          <GraduationCap className="w-4 h-4" />
          <span>For <span className="text-[#1a1a1a] font-bold uppercase">{course.exam_category}</span> Aspirants</span>
        </div>
        <div className="flex items-center gap-2 text-[#6b7280] text-[13px]">
          <Clock className="w-4 h-4" />
          <span>Starts <b className="text-[#1a1a1a] font-bold">{formatDate(course.start_date)}</b></span>
        </div>
      </div>

      {/* Pricing */}
      <div className="flex items-end justify-between mb-5 px-1">
        <div>
          <div className="flex items-center">
            <span className="text-2xl font-extrabold text-[#1E3A8A]">
              ₹{course.discounted_price?.toLocaleString() || course.price?.toLocaleString()}
            </span>
            {course.discounted_price && (
              <span className="text-sm text-[#94a3b8] line-through font-medium ml-2">
                ₹{course.price?.toLocaleString()}
              </span>
            )}
          </div>
          <span className="block text-[10px] font-bold text-[#94a3b8] mt-0.5 uppercase tracking-tighter">
            (FOR FULL BATCH)
          </span>
        </div>

        {discountPercent > 0 && (
          <div className="bg-[#e6f7ef] text-[#1b8b5a] px-2.5 py-1.5 text-[11px] font-bold flex items-center gap-1 shrink-0" style={{ borderRadius: '4px' }}>
            <Tag className="w-3.5 h-3.5" />
            {discountPercent}% OFF
          </div>
        )}
      </div>

      {/* Buttons: Deep Blue */}
      <div className="flex gap-3">
        <Link 
          to={`/course/${course.id}`} 
          className="flex-1 border-2 border-[#1E3A8A] text-[#1E3A8A] bg-white h-11 flex items-center justify-center text-[12px] font-extrabold uppercase transition-all hover:bg-blue-50"
          style={{ borderRadius: '8px' }}
        >
          Explore
        </Link>
        <button 
          className="flex-1 bg-[#1E3A8A] text-white border-none h-11 flex items-center justify-center text-[12px] font-extrabold uppercase transition-all hover:opacity-90"
          style={{ borderRadius: '8px' }}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
