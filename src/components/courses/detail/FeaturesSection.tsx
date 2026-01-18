import React, { useState } from 'react';
import { 
  Video, 
  Users, 
  BookOpen, 
  Headphones, 
  WalletMinimal, 
  UserCheck, 
  Star
} from "lucide-react";
import { Course } from '@/components/admin/courses/types';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface FeaturesSectionProps {
  course: Course;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ course }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  // 1. Define Default Features
  const defaultFeatures = [
    {
      icon: Video,
      text: "Live Classes: Interactive live sessions with expert instructors"
    },
    {
      icon: Users,
      text: "Small Batch Size: Personalized attention with limited students"
    },
    {
      icon: WalletMinimal,
      text: "Affordable Learning: High-quality education at accessible prices"
    },
    {
      icon: UserCheck,
      text: "Personal Mentorship: Dedicated mentors for study plans & career guidance"
    },
    {
      icon: BookOpen,
      text: "Study Materials: Comprehensive notes, PDFs, and practice questions"
    },
    {
      icon: Headphones,
      text: "24/7 Support: Get your doubts resolved anytime through our portal"
    }
  ];

  // 2. Determine which list to use
  const hasCustomFeatures = course.features && course.features.length > 0;
  
  const featuresList = hasCustomFeatures
    ? course.features!.map((f) => ({ icon: Star, text: f }))
    : defaultFeatures;

  // 3. Determine Initial Count (2 on mobile, 4 on desktop)
  const initialCount = isMobile ? 2 : 4;

  // 4. Split into Initial and Extra
  const initialFeatures = featuresList.slice(0, initialCount);
  const extraFeatures = featuresList.slice(initialCount);
  const hasMore = extraFeatures.length > 0;

  return (
    <section id="features" className="scroll-mt-24">
      {/* Container "Holding" Section */}
      <div className="bg-white border border-[#e3e8ee] rounded-xl p-6 md:p-10 w-full shadow-sm">
        
        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-[#1a1f36]">
          Batch Features
        </h2>

        {/* --- Grid Layout --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Render Initial Items */}
          {initialFeatures.map((feature, idx) => (
            <FeatureCard key={`init-${idx}`} text={feature.text} />
          ))}

          {/* Render Extra Items (Collapsible) */}
          <div className={cn(
            "col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500 ease-in-out overflow-hidden",
            isExpanded ? "max-h-[1000px] opacity-100 mt-0" : "max-h-0 opacity-0"
          )}>
            {extraFeatures.map((feature, idx) => (
              <FeatureCard key={`extra-${idx}`} text={feature.text} />
            ))}
          </div>
        </div>

        {/* --- Toggle Button --- */}
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "w-full mt-4 bg-white p-4 rounded-lg",
              "border border-gray-800", // Darker border as requested
              "text-[15px] font-semibold text-[#1a1f36] text-center cursor-pointer",
              "hover:bg-gray-50 transition-all duration-300 ease-out",
              "block" // Always visible now
            )}
          >
            {isExpanded ? "Show Less" : "More Features"}
          </button>
        )}
      </div>
    </section>
  );
};

// --- Sub-Component for the Card Design ---
const FeatureCard = ({ text }: { text: string }) => {
  return (
    <div className="group flex items-center gap-4 bg-white border border-[#e3e8ee] p-5 rounded-lg transition-colors duration-200 hover:border-black">
      {/* Icon Circle with Custom Image */}
      <div className="min-w-[36px] h-9 w-9 bg-[#f8fafc] rounded-full flex items-center justify-center shrink-0">
        <img 
          src="https://i.ibb.co/dstqH8V6/image.png" 
          alt="Feature Star" 
          className="w-5 h-5 object-contain"
        />
      </div>
      
      {/* Text */}
      <div className="text-[14px] leading-relaxed text-[#1a1f36] font-normal">
        {text}
      </div>
    </div>
  );
};

export default FeaturesSection;
