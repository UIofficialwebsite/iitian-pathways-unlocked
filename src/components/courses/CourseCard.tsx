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
      className="bg-white w-full max-w-[410px] border-[1.5px] border-[#e2e8f0] relative p-3 shadow-[0_10px_30px_rgba(0,0,0,0.05)] font-['Public_Sans',sans-serif]"
      style={{ borderRadius: '6px' }}
    >
      {/* Banner Section */}
      <div 
        className="w-full h-[195px] bg-muted relative overflow-hidden mb-[15px]"
        style={{ borderRadius: '6px' }}
      >
        {course.image_url ? (
          <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#fce07c] to-[#f9c83d] flex items-center justify-center">
            <span className="text-white font-extrabold text-[34px] text-center px-4 uppercase leading-[1.1]">
              {course.title.split(' ')[0]}<br/>{course.title.split(' ').slice(1).join(' ')}
            </span>
          </div>
        )}
      </div>

      {/* Header Section: Title + Tags + WhatsApp */}
      <div className="flex items-center gap-2 mb-[18px] px-1">
        <h2 className="text-[21px] font-bold text-[#1a1a1a] flex-1 leading-tight line-clamp-1">
          {course.title}
        </h2>
        
        <div className="flex items-center gap-2 shrink-0">
          {course.bestseller && (
            <span className="bg-[#f59e0b] text-white text-[11px] font-bold px-[10px] py-1" style={{ borderRadius: '6px' }}>
              NEW
            </span>
          )}
          {course.language && (
            <span className="bg-[#f3f4f6] text-[#4b5563] text-[11px] font-bold px-[10px] py-1" style={{ borderRadius: '6px' }}>
              {course.language}
            </span>
          )}
          
          {/* WhatsApp Icon - Properly Placed */}
          <div className="cursor-pointer hover:opacity-70 transition-opacity ml-1">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-black">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.602 6.039L0 24l6.135-1.61a11.748 11.748 0 005.911 1.586h.005c6.634 0 12.032-5.396 12.033-12.03a11.811 11.811 0 00-3.417-8.481z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mb-[22px] px-1 space-y-2">
        <div className="flex items-center gap-[10px] text-[#6b7280] text-[13.5px]">
          <GraduationCap className="w-4 h-4" />
          <span>For <span className="text-[#1a1a1a] font-bold uppercase">{course.exam_category}</span> Aspirants</span>
        </div>
        <div className="flex items-center gap-[10px] text-[#6b7280] text-[13.5px]">
          <Clock className="w-4 h-4" />
          <span>
            Starts on <b className="text-[#1a1a1a] font-bold">{formatDate(course.start_date)}</b> Ends on <b className="text-[#1a1a1a] font-bold">{formatDate(course.end_date)}</b>
          </span>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="flex items-end justify-between mb-5 px-1">
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className="text-2xl font-extrabold text-[#1E3A8A]">
              ₹{course.discounted_price?.toLocaleString() || course.price?.toLocaleString()}
            </span>
            {course.discounted_price && (
              <span className="text-sm text-[#94a3b8] line-through font-medium ml-1">
                ₹{course.price?.toLocaleString()}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-[#94a3b8] uppercase mt-[3px]">
            (FOR FULL BATCH)
          </span>
        </div>

        {/* Discount Applied Phrasing */}
        {discountPercent > 0 && (
          <div className="bg-[#e6f7ef] text-[#1b8b5a] px-3 py-2 text-[11px] font-extrabold flex items-center gap-[6px]" style={{ borderRadius: '6px' }}>
            <Tag className="w-[13px] h-[13px]" />
            Discount of {discountPercent}% applied
          </div>
        )}
      </div>

      {/* Buttons: Deep Blue Only */}
      <div className="flex gap-3">
        <Link 
          to={`/course/${course.id}`} 
          className="flex-1 border-2 border-[#1E3A8A] text-[#1E3A8A] bg-white h-[45px] flex items-center justify-center text-[13px] font-extrabold uppercase transition-opacity hover:opacity-80"
          style={{ borderRadius: '8px' }}
        >
          Explore
        </Link>
        <button 
          className="flex-1 bg-[#1E3A8A] text-white border-none h-[45px] flex items-center justify-center text-[13px] font-extrabold uppercase transition-opacity hover:opacity-90"
          style={{ borderRadius: '8px' }}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
