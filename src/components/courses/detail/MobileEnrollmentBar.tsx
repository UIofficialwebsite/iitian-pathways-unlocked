import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Tag } from "lucide-react";
import { EnrollmentCardProps } from './EnrollmentCard';
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';

export function MobileEnrollmentBar({
  course,
  customEnrollHandler,
  isMainCourseOwned,
  isFullyEnrolled,
  hasAddons, // You might need to derive this from props if not passed directly, but for now we'll assume logic inside
  isFreeCourse,
  enrolling
}: EnrollmentCardProps & { hasAddons?: boolean }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  // Logic to hide bar when footer is reached
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If footer is intersecting (visible), hide the bar
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0 } // Trigger as soon as 1 pixel of footer is visible
    );

    const footer = document.querySelector('footer');
    if (footer) {
      observer.observe(footer);
    }

    return () => {
      if (footer) observer.unobserve(footer);
    };
  }, []);

  // Price Calculation Logic
  const price = course.discounted_price ?? course.price ?? 0;
  const originalPrice = course.price ?? 0;
  const hasDiscount = course.discounted_price && course.price && course.discounted_price < course.price;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Button Action Logic
  const handleAction = () => {
    if (customEnrollHandler) {
      customEnrollHandler();
    } else {
      // Default fallback if no handler provided (e.g., direct link logic usually handled by parent)
       navigate(`/courses/${course.id}/configure`);
    }
  };

  const getButtonText = () => {
    if (enrolling) return "Processing...";
    if (isFullyEnrolled) return "Go to Dashboard";
    if (isMainCourseOwned) return "Upgrade";
    return "Continue with Batch";
  };

  if (isFullyEnrolled) {
     // Optional: Hide completely if already enrolled, or show "Go to Dashboard"
     // For now, matching the design request for "Continue with Batch" style
  }

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-in-out px-6 py-4 md:hidden flex items-center justify-between min-w-[320px]",
        isVisible ? "translate-y-0" : "translate-y-[110%]"
      )}
    >
      {/* Pricing Info */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline gap-2.5">
          <span className="text-2xl font-extrabold tracking-tight text-blue-800">
            ₹{price.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-sm text-slate-500 line-through font-medium opacity-80">
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        
        {hasDiscount && (
          <div className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 w-fit">
            <Tag className="w-3 h-3 fill-green-700" />
            {discountPercentage}% Off
          </div>
        )}
      </div>

      {/* Action Button */}
      <Button
        onClick={handleAction}
        disabled={enrolling}
        className="bg-blue-800 hover:bg-blue-900 text-white border-none px-6 py-6 rounded-xl text-lg font-semibold shadow-[0_4px_6px_-1px_rgba(30,64,175,0.2)] hover:shadow-[0_10px_15px_-3px_rgba(30,64,175,0.3)] transition-all active:scale-[0.98]"
      >
        {enrolling ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing
          </>
        ) : (
          getButtonText()
        )}
      </Button>
    </div>
  );
}
