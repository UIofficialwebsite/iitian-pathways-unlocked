import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Clock, Tag } from "lucide-react";
import { Course } from '@/components/admin/courses/types';

interface CourseCardProps {
  course: Course;
  index: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, index }) => {
  const navigate = useNavigate();

  // Logic for "NEW" tag based on updated_at (last 30 days)
  const isNewlyLaunched = useMemo(() => {
    if (!course.updated_at) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(course.updated_at) > thirtyDaysAgo;
  }, [course.updated_at]);

  const discountPercent = course.price && course.discounted_price
    ? Math.round(((course.price - course.discounted_price) / course.price) * 100)
    : 0;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "TBA";
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  // WhatsApp Share Handler
  const handleWhatsappShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const courseUrl = `${window.location.origin}/course/${course.id}`;
    const message = `Check out this course: ${course.title}\n${courseUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div 
      className="bg-white w-full border-[1.5px] border-[#e2e8f0] relative p-[12px] shadow-sm font-['Public_Sans',sans-serif] flex flex-col h-full"
      style={{ borderRadius: '6px' }}
    >
      {/* Banner Section - Maintains 16:9 ratio to prevent zoom */}
      <div 
        className="w-full aspect-video bg-gradient-to-b from-[#fce07c] to-[#f9c83d] relative overflow-hidden mb-[15px] flex flex-col justify-center items-center"
        style={{ borderRadius: '6px' }}
      >
        {course.image_url ? (
          <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-white/90 text-[24px] font-[800] text-center uppercase leading-tight px-4">
            {course.title}
          </div>
        )}
      </div>

      {/* Header: Bold Title + Tags in One Row */}
      <div className="flex items-start justify-between gap-2 mb-[18px] px-1">
        <h2 className="text-[19px] font-bold text-[#1a1a1a] flex-1 leading-[1.2] line-clamp-2 min-h-[46px]">
          {course.title}
        </h2>
        
        {/* Tags Row - Single row horizontal flex */}
        <div className="flex flex-row items-center gap-1.5 shrink-0 mt-1 whitespace-nowrap font-sans">
          {isNewlyLaunched && (
            <span className="bg-[#f59e0b] text-white text-[10px] font-normal px-[10px] py-[3px] text-center uppercase" style={{ borderRadius: '6px' }}>NEW</span>
          )}
          {course.language && (
            <span className="bg-[#f3f4f6] text-[#4b5563] text-[10px] font-normal px-[10px] py-[3px] text-center" style={{ borderRadius: '6px' }}>{course.language}</span>
          )}
        </div>

        {/* WhatsApp Share Button - Black icon */}
        <div className="shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleWhatsappShare}>
          <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-black">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.602 6.039L0 24l6.135-1.61a11.748 11.748 0 005.911 1.586h.005c6.634 0 12.032-5.396 12.033-12.03a11.811 11.811 0 00-3.417-8.481z"/>
          </svg>
        </div>
      </div>

      {/* Info Rows */}
      <div className="mb-[20px] px-1 space-y-2 flex-grow">
        <div className="flex items-center gap-[10px] text-[#6b7280] text-[13.5px] font-normal">
          <GraduationCap className="w-4 h-4" />
          <span>For <span className="text-[#1a1a1a] uppercase">{course.exam_category}</span> Aspirants</span>
        </div>
        <div className="flex items-center gap-[10px] text-[#6b7280] text-[13.5px] font-normal">
          <Clock className="w-4 h-4" />
          <span>Starts on <b className="text-[#1a1a1a] font-normal">{formatDate(course.start_date)}</b> Ends on <b className="text-[#1a1a1a] font-normal">{formatDate(course.end_date)}</b></span>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="flex items-end justify-between mb-[20px] px-1">
        <div>
          <div className="flex items-center">
            {course.discounted_price && course.discounted_price < course.price ? (
              <>
                <span className="text-[22px] font-bold text-[#1E3A8A]">₹{course.discounted_price.toLocaleString()}</span>
                <span className="text-[14px] text-[#94a3b8] line-through ml-1.5 font-normal">₹{course.price?.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-[22px] font-bold text-[#1E3A8A]">₹{course.price?.toLocaleString()}</span>
            )}
          </div>
          <span className="block text-[10px] font-normal text-[#94a3b8] mt-[2px] uppercase">(FOR FULL BATCH)</span>
        </div>
        {discountPercent > 0 && (
          <div className="bg-[#e6f7ef] text-[#1b8b5a] px-[10px] py-[6px] text-[10px] font-normal flex items-center gap-[5px]" style={{ borderRadius: '6px' }}>
            <Tag className="w-[12px] h-[12px]" /> Discount of {discountPercent}% applied
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-[10px]">
        <button className="flex-1 border-[1.5px] border-[#1E3A8A] text-[#1E3A8A] h-[42px] text-[13px] font-normal uppercase" style={{ borderRadius: '8px' }} onClick={() => navigate(`/course/${course.id}`)}>EXPLORE</button>
        <button className="flex-1 bg-[#1E3A8A] text-white h-[42px] text-[13px] font-normal uppercase" style={{ borderRadius: '8px' }} onClick={() => navigate(`/course/${course.id}`)}>BUY NOW</button>
      </div>
    </div>
  );
};

export default CourseCard;
