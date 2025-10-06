import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Star } from "lucide-react";
import { Course } from '@/components/admin/courses/types';

interface CourseTabsProps {
  course: Course;
}

const CourseTabs: React.FC<CourseTabsProps> = ({ course }) => {
  // Mock curriculum data
  const curriculum = [
    {
      module: "Module 1: Introduction",
      lectures: ["Welcome to the Course", "Course Overview", "Setting Up Your Environment"]
    },
    {
      module: "Module 2: Fundamentals",
      lectures: ["Core Concepts", "Hands-on Practice", "Quiz: Test Your Knowledge"]
    },
    {
      module: "Module 3: Advanced Topics",
      lectures: ["Deep Dive", "Real-world Applications", "Project Assignment"]
    },
    {
      module: "Module 4: Final Project",
      lectures: ["Project Guidelines", "Implementation", "Review & Feedback"]
    }
  ];

  // Mock reviews
  const reviews = [
    { name: "Priya Sharma", rating: 5, comment: "Excellent course! The instructor explains concepts very clearly." },
    { name: "Rahul Kumar", rating: 5, comment: "Best investment for my career. Highly recommended!" },
    { name: "Anjali Patel", rating: 4, comment: "Great content and well-structured. Would love more practice problems." }
  ];

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Description Tab */}
          <TabsContent value="description" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {course.features && course.features.length > 0 ? (
                    course.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Master fundamental concepts and techniques</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Build real-world projects from scratch</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Get personalized feedback and support</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Access to exclusive resources and materials</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-3">Course Description</h3>
                  <p className="text-gray-600 leading-relaxed">{course.description}</p>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-3">Prerequisites</h3>
                  <p className="text-gray-600">
                    Basic understanding of the subject matter is recommended. However, this course is designed 
                    to accommodate students at various skill levels.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Curriculum Tab */}
          <TabsContent value="curriculum">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>
                <Accordion type="single" collapsible className="w-full">
                  {curriculum.map((module, idx) => (
                    <AccordionItem key={idx} value={`module-${idx}`}>
                      <AccordionTrigger className="text-lg font-semibold">
                        {module.module}
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 ml-4">
                          {module.lectures.map((lecture, lectureIdx) => (
                            <li key={lectureIdx} className="flex items-center gap-2 text-gray-700">
                              <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                              {lecture}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Instructor Tab */}
          <TabsContent value="instructor">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-3xl text-white font-bold">
                    UI
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Unknown IITians Team</h2>
                    <p className="text-gray-600 mb-4">Expert Educators & Industry Professionals</p>
                    <p className="text-gray-700 leading-relaxed">
                      Our team consists of experienced educators and industry professionals dedicated to 
                      providing high-quality education. With years of teaching experience and real-world 
                      expertise, we ensure that every student receives personalized attention and practical 
                      knowledge that can be applied immediately.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
                <div className="space-y-6">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{review.name}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 ml-12">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default CourseTabs;
