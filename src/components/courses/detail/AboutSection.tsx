import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Course } from '@/components/admin/courses/types';

interface AboutSectionProps {
  course: Course;
}

const AboutSection: React.FC<AboutSectionProps> = ({ course }) => {
  return (
    <section className="scroll-mt-24">
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-5 md:p-6 lg:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-5">About This Course</h2>
          <div className="prose max-w-none">
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {course.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default AboutSection;
