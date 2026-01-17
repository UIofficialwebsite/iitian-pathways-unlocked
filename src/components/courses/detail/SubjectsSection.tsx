import React, { useMemo } from 'react';
import { Course } from '@/components/admin/courses/types';
import { SimpleAddon } from '@/components/courses/detail/BatchConfigurationModal';
import { cn } from "@/lib/utils";

interface SubjectsSectionProps {
  course: Course;
  addons: SimpleAddon[];
}

const SubjectsSection: React.FC<SubjectsSectionProps> = ({ course, addons }) => {
  // 1. Combine and Clean Subjects
  const subjectList = useMemo(() => {
    const list: string[] = [];

    // Process Core Subjects (Split "Maths, Physics" into distinct items)
    if (course.subject) {
      const coreSubjects = course.subject.split(',').map(s => s.trim()).filter(s => s.length > 0);
      list.push(...coreSubjects);
    }

    // Process Add-ons
    if (addons && addons.length > 0) {
      addons.forEach(addon => {
        if (addon.subject_name) {
          list.push(addon.subject_name);
        }
      });
    }

    // Remove duplicates
    return Array.from(new Set(list));
  }, [course.subject, addons]);

  if (subjectList.length === 0) return null;

  // 2. Define Gradient Styles (Cyclical)
  const gradients = [
    "bg-gradient-to-b from-[#f0f7ff] to-[#e0f2fe]", // Blue
    "bg-gradient-to-b from-[#f5f3ff] to-[#ede9fe]", // Purple
    "bg-gradient-to-b from-[#ecfdf5] to-[#d1fae5]", // Emerald
    "bg-gradient-to-b from-[#fffbeb] to-[#fef3c7]", // Amber
    "bg-gradient-to-b from-[#fff1f2] to-[#ffe4e6]", // Rose
    "bg-gradient-to-b from-[#eef2ff] to-[#e0e7ff]", // Indigo
  ];

  return (
    <div className="w-full font-['Inter',sans-serif]">
       <div className="bg-white rounded-[24px] p-6 md:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-black/5 max-w-[850px] mx-auto">
         {/* Title */}
         <h2 className="text-[22px] font-semibold text-black mb-8 tracking-tight">
           Available Subjects
         </h2>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
           {subjectList.map((subject, index) => {
             const gradientClass = gradients[index % gradients.length];

             return (
               <div 
                 key={`${subject}-${index}`}
                 className={cn(
                   // UPDATED: rounded-lg (8px) for less rounded corners
                   "group flex items-center justify-between px-6 py-5 rounded-lg cursor-pointer",
                   "border-[1.2px] border-transparent transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                   // Hover: White background, Black border
                   "hover:bg-white hover:border-black hover:shadow-sm",
                   gradientClass
                 )}
               >
                 {/* Subject Name: Medium to Semi-Bold */}
                 <span className="text-[15px] font-semibold text-black">
                   {subject}
                 </span>
                 
                 {/* Chevron Arrow */}
                 <span className="text-lg text-black/20 group-hover:text-black transition-colors duration-200 font-normal">
                   ›
                 </span>
               </div>
             );
           })}
         </div>
       </div>
    </div>
  );
};

export default SubjectsSection;
