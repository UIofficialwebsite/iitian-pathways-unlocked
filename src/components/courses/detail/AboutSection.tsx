import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Course } from '@/components/admin/courses/types';

interface AboutSectionProps {
  course: Course;
}

const AboutSection: React.FC<AboutSectionProps> = ({ course }) => {
  return (
    <section id="about" className="py-12 scroll-mt-24">
      <h2 className="text-3xl font-bold mb-6">About This Course</h2>
      
      <div className="prose max-w-none mb-8">
        <p className="text-lg text-muted-foreground leading-relaxed">
          {course.description}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">What You'll Learn</h3>
        <ul className="grid md:grid-cols-2 gap-3">
          {course.features && course.features.length > 0 ? (
            course.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>{feature}</span>
              </li>
            ))
          ) : (
            <>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Master fundamental concepts and theories</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Solve complex problems with confidence</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Practice with previous year questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Get exam-ready with mock tests</span>
              </li>
            </>
          )}
        </ul>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="details">
          <AccordionTrigger className="text-lg font-semibold">
            More Details
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div>
              <h4 className="font-semibold mb-2">Prerequisites</h4>
              <p className="text-muted-foreground">
                Basic understanding of {course.subject || 'the subject'} is helpful but not mandatory. 
                We cover fundamentals from scratch.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Target Audience</h4>
              <p className="text-muted-foreground">
                This course is designed for students preparing for {course.exam_category || 'competitive exams'}.
                Whether you're a beginner or looking to strengthen your concepts, this course is for you.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Course Instructor</h4>
              <p className="text-muted-foreground">
                Our experienced faculty members have years of teaching experience and deep subject expertise.
                They are passionate about helping students achieve their goals.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};

export default AboutSection;
