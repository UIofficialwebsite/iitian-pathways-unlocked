import React from 'react';
import { Course } from '@/components/admin/courses/types';

interface AboutSectionProps {
  course: Course;
}

const AboutSection: React.FC<AboutSectionProps> = ({ course }) => {
  
  // Custom helper to render basic Markdown formatting (Bold, Italic)
  const renderDescription = (text: string) => {
    if (!text) return null;

    // First, split by Bold (**text**)
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    const formattedContent = parts.map((part, i) => {
      // Handle Bold
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return <strong key={i} className="font-bold text-[#1a1f36]">{part.slice(2, -2)}</strong>;
      }
      
      // Handle Italics (_text_) within non-bold parts
      return part.split(/(_.*?_)/g).map((subPart, j) => {
        if (subPart.startsWith('_') && subPart.endsWith('_') && subPart.length >= 2) {
          return <em key={`${i}-${j}`} className="italic">{subPart.slice(1, -1)}</em>;
        }
        return subPart;
      });
    });

    return (
      <p className="text-[15px] md:text-[16px] leading-relaxed text-[#1a1f36] font-normal font-sans whitespace-pre-line">
        {formattedContent}
      </p>
    );
  };

  return (
    <section className="w-full">
      {/* Container "Holding" Section - Matches Features Design */}
      <div className="bg-white border border-[#e3e8ee] rounded-xl p-6 md:p-10 w-full shadow-sm">
        
        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#1a1f36]">
          About This Course
        </h2>
        
        {/* Description - Rendered with custom markdown formatter */}
        <div className="prose max-w-none">
          {renderDescription(course.description)}
        </div>

      </div>
    </section>
  );
};

export default AboutSection;
