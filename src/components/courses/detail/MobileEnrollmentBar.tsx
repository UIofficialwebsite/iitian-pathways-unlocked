import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Tag } from "lucide-react";
import { EnrollmentCardProps } from './EnrollmentCard';
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";
import { useLoginModal } from "@/context/LoginModalContext";

export function MobileEnrollmentBar({
  course,
  customEnrollHandler,
  isMainCourseOwned,
  isFullyEnrolled,
  enrolling
}: EnrollmentCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openLogin } = useLoginModal();
  const [isVisible, setIsVisible] = useState(true);

  // Logic to hide bar when footer is reached
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0 } 
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
    if (!user) {
      openLogin();
      return;
    }

    if (customEnrollHandler) {
      customEnrollHandler();
    } else {
       navigate(`/courses/${course.id}/configure`);
    }
  };

  const getButtonText = () => {
    if (enrolling) return "Processing...";
    if (isFullyEnrolled) return "Go to Dashboard";
    if (isMainCourseOwned) return "Upgrade";
    return "Continue with Batch";
  };

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-in-out px-5 py-3 md:hidden flex items-center justify-between min-w-[320px]",
        isVisible ? "translate-y-0" : "translate-y-[110%]"
      )}
    >
      {/* Pricing Info */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-baseline gap-2">
          {price === 0 ? (
            <span className="text-xl font-bold tracking-tight text-[#1b8b5a]">
              FREE
            </span>
          ) : (
            <span className="text-xl font-medium tracking-tight text-blue-800">
              ₹{price.toLocaleString()}
            </span>
          )}
          
          {hasDiscount && price !== 0 && (
            <span className="text-xs text-slate-500 line-through font-normal opacity-80">
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        
        {hasDiscount && price !== 0 && (
          <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 w-fit uppercase tracking-wide">
            <Tag className="w-2.5 h-2.5 fill-green-700" />
            {discountPercentage}% Off
          </div>
        )}
      </div>

      {/* Action Button */}
      <Button
        onClick={handleAction}
        disabled={enrolling}
        className="bg-blue-800 hover:bg-blue-900 text-white border-none px-5 py-2 h-10 rounded-lg text-sm font-medium shadow-sm transition-all active:scale-[0.98]"
      >
        {enrolling ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing
          </>
        ) : (
          getButtonText()
        )}
      </Button>
    </div>
  );
}
