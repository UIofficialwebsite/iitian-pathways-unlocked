import React from 'react';
import { Course } from '@/components/admin/courses/types';

interface AboutSectionProps {
  course: Course;
}

const AboutSection: React.FC<AboutSectionProps> = ({ course }) => {
  return (
    <section className="border-t pt-6 md:pt-8 lg:pt-12">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">About This Course</h2>
      
      <div className="prose max-w-none">
        <p className="text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed">
          {course.description}
        </p>
      </div>
    </section>
  );
};

export default AboutSection;
