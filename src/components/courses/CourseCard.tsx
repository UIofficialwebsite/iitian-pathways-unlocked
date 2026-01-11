import React from "react";
import { Link } from "react-router-dom";
import { Course } from "@/components/admin/courses/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Share2, Users, Star, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface CourseCardProps {
  course: Course;
  index?: number;
}

const CourseCard = ({ course, index = 0 }: CourseCardProps) => {
  // Logic for "NEW" tag (based on updated_at)
  const isNewlyLaunched = useMemo(() => {
    if (!course.updated_at) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(course.updated_at) > thirtyDaysAgo;
  }, [course.updated_at]);

  // WhatsApp Share Handler
  const handleWhatsappShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const courseUrl = `${window.location.origin}/course/${course.id}`;
    const message = `Check out this course: ${course.title}\n${courseUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <Link 
      to={`/course/${course.id}`}
      className={`group relative flex flex-col h-full bg-white rounded-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden
        ${course.bestseller 
          ? 'border-t-4 border-x-2 border-b-0 border-blue-400/50 shadow-[0_-10px_20px_-5px_rgba(59,130,246,0.2)]' 
          : 'border border-slate-200 shadow-sm hover:shadow-md'
        }`}
    >
      {/* Course Image */}
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={course.image_url || "/placeholder.svg"} 
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Tags Row - Forced to one row */}
        <div className="absolute top-3 left-3 flex flex-row gap-2 z-10 whitespace-nowrap">
          {isNewlyLaunched && (
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none font-bold px-2 py-0.5 text-[10px] uppercase tracking-wider">
              New
            </Badge>
          )}
          {course.bestseller && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none font-bold px-2 py-0.5 text-[10px] uppercase tracking-wider">
              Bestseller
            </Badge>
          )}
        </div>

        {/* Share Button */}
        <button 
          onClick={handleWhatsappShare}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-600 hover:text-green-600 hover:bg-white transition-colors z-10 shadow-sm"
          title="Share on WhatsApp"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Course Content */}
      <div className="flex flex-col flex-grow p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded">
            {course.exam_category || "General"}
          </span>
          {course.rating && (
            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs ml-auto">
              <Star className="w-3 h-3 fill-current" />
              {course.rating}
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        {/* Course Meta */}
        <div className="grid grid-cols-2 gap-y-2 mb-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Clock className="w-3.5 h-3.5" />
            {course.duration}
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Users className="w-3.5 h-3.5" />
            {course.students_enrolled || 0} Students
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs col-span-2">
            <Calendar className="w-3.5 h-3.5" />
            Starts: {course.start_date ? format(new Date(course.start_date), "MMM d, yyyy") : "TBA"}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            {course.discounted_price ? (
              <>
                <span className="text-slate-400 text-[10px] line-through font-medium">₹{course.price}</span>
                <span className="text-xl font-black text-slate-900 leading-none">₹{course.discounted_price}</span>
              </>
            ) : (
              <span className="text-xl font-black text-slate-900">
                {course.price === 0 ? "FREE" : `₹${course.price}`}
              </span>
            )}
          </div>
          <Button size="sm" className="rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 group/btn">
            View Detail
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
