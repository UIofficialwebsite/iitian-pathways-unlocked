import React from 'react';
import { Course } from '@/components/admin/courses/types';

interface AboutSectionProps {
  course: Course;
}

const AboutSection: React.FC<AboutSectionProps> = ({ course }) => {
  return (
    <section className="w-full">
      {/* Container "Holding" Section - Matches Features Design */}
      <div className="bg-white border border-[#e3e8ee] rounded-xl p-6 md:p-10 w-full shadow-sm">
        
        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#1a1f36]">
          About This Course
        </h2>
        
        {/* Description - Non-bold Inter font */}
        <div className="prose max-w-none">
          {/* Added whitespace-pre-line to respect line breaks from backend data */}
          <p className="text-[15px] md:text-[16px] leading-relaxed text-[#1a1f36] font-normal font-sans whitespace-pre-line">
            {course.description}
          </p>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;
