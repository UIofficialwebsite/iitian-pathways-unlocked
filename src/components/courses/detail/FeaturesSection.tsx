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

interface FeaturesSectionProps {
  course: Course;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ course }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 1. Define Default Features (Rich objects)
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

  // 3. Split into Initial (4) and Extra (Rest)
  const initialFeatures = featuresList.slice(0, 4);
  const extraFeatures = featuresList.slice(4);
  const hasMore = extraFeatures.length > 0;

  return (
    <section id="features" className="scroll-mt-24">
      {/* Container "Holding" Section - White Background, Border, Rounded */}
      <div className="bg-white border border-[#e3e8ee] rounded-xl p-6 md:p-10 w-full shadow-sm">
        
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-[#1a1f36]">
          About the Batch
        </h2>

        {/* --- Grid Layout (Stacks on mobile, 2 columns on desktop) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Render Initial 4 Items */}
          {initialFeatures.map((feature, idx) => (
            <FeatureCard key={`init-${idx}`} icon={feature.icon} text={feature.text} />
          ))}

          {/* Render Extra Items (Hidden/Shown based on state) */}
          <div className={cn(
            "col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500 ease-in-out overflow-hidden",
            isExpanded ? "max-h-[1000px] opacity-100 mt-0" : "max-h-0 opacity-0"
          )}>
            {extraFeatures.map((feature, idx) => (
              <FeatureCard key={`extra-${idx}`} icon={feature.icon} text={feature.text} />
            ))}
          </div>
        </div>

        {/* --- Toggle Button --- */}
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "w-full mt-4 bg-white border border-[#e3e8ee] p-4 rounded-lg",
              "text-[15px] font-semibold text-[#1a1f36] text-center cursor-pointer",
              "hover:border-black transition-all duration-300 ease-out",
              isExpanded ? "hidden pointer-events-none" : "block"
            )}
          >
            More Features
          </button>
        )}
      </div>
    </section>
  );
};

// --- Sub-Component for the Card Design ---
const FeatureCard = ({ icon: Icon, text }: { icon: any, text: string }) => {
  return (
    <div className="group flex items-center gap-4 bg-white border border-[#e3e8ee] p-5 rounded-lg transition-colors duration-200 hover:border-black">
      {/* Icon Circle */}
      <div className="min-w-[36px] h-9 w-9 bg-[#f8fafc] rounded-full flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-gray-700" />
      </div>
      
      {/* Text */}
      <div className="text-[14px] leading-relaxed text-[#1a1f36] font-normal">
        {text}
      </div>
    </div>
  );
};

export default FeaturesSection;
