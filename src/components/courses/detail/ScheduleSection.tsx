import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, Clock } from "lucide-react";
import { Course } from '@/components/admin/courses/types';

interface ScheduleSectionProps {
  course: Course;
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({ course }) => {
  const schedule = [
    { day: "Monday", time: "6:00 PM - 8:00 PM", topic: "Core Concepts" },
    { day: "Wednesday", time: "6:00 PM - 8:00 PM", topic: "Problem Solving" },
    { day: "Friday", time: "6:00 PM - 8:00 PM", topic: "Practice & Revision" },
    { day: "Sunday", time: "10:00 AM - 12:00 PM", topic: "Doubt Clearing Session" }
  ];

  const subjects = course.subject ? [course.subject] : [
    "Mathematics",
    "Physics", 
    "Chemistry"
  ];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'To be announced';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <section id="schedule" className="py-12 scroll-mt-24">
      <h2 className="text-3xl font-bold mb-8">Schedule & Subjects</h2>
      
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Clock className="h-4 w-4" />
                <span>Course starts: {formatDate(course.start_date)}</span>
              </div>
              {schedule.map((slot, idx) => (
                <div key={idx} className="flex justify-between items-start p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-semibold">{slot.day}</p>
                    <p className="text-sm text-muted-foreground">{slot.topic}</p>
                  </div>
                  <span className="text-sm font-medium">{slot.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subjects Covered</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {subjects.map((subject, idx) => (
                <AccordionItem key={idx} value={`subject-${idx}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <span className="font-semibold">{subject}</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pl-4">
                      <li className="text-sm text-muted-foreground">• Complete theory coverage</li>
                      <li className="text-sm text-muted-foreground">• Problem-solving techniques</li>
                      <li className="text-sm text-muted-foreground">• Previous year questions</li>
                      <li className="text-sm text-muted-foreground">• Practice worksheets</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ScheduleSection;
