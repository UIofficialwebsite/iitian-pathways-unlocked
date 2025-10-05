// uiofficialwebsite/iitian-pathways-unlocked/iitian-pathways-unlocked-b9e0dbed5caaa215f6a0d2f926b21c6bb717330b/src/components/courses/CourseCard.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Calendar,
  Users,
  CheckCircle,
  Clock // Added Clock icon for improved semantics in the full-feature layout
} from "lucide-react";
import EnrollButton from "@/components/EnrollButton";
import { Course } from '@/components/admin/courses/types';

interface CourseCardProps {
  course: Course;
  index: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, index }) => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  // Helper to format date from string (e.g., 'YYYY-MM-DD')
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString; // Fallback
    }
  };

  const hasImage = !!course.image_url;

  const fullFeatureHeader = (
    <CardHeader className="pb-2">
        {/* Title with Rating */}
        <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-semibold pr-4">{course.title}</CardTitle>
            {course.rating && (
                <div className="flex items-center text-base font-bold text-amber-600 space-x-1 flex-shrink-0">
                    <Star className="h-4 w-4 fill-amber-500 stroke-amber-500" />
                    <span>{course.rating.toFixed(1)}</span>
                </div>
            )}
        </div>
        
        {/* Subject Badge */}
        {course.subject && (
            <Badge className="w-fit bg-royal-light text-royal hover:bg-royal-light/80 mt-2">
                {course.subject}
            </Badge>
        )}

        {/* Detail Row (Duration, Students, Start Date) - Uses Clock for Duration */}
        <div className="flex flex-wrap items-center text-sm text-gray-500 space-x-4 pt-2">
            <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>{course.duration}</span>
            </div>
            <div className="flex items-center">
                <Users className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>{course.students_enrolled || 0} students</span>
            </div>
            {course.start_date && (
                <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>Starts: {formatDate(course.start_date)}</span>
                </div>
            )}
        </div>
    </CardHeader>
  );

  const originalHeader = (
    <CardHeader className="pb-2">
      <CardTitle>{course.title}</CardTitle>
      {/* Original Detail Row (Duration with Calendar, Students) */}
      <div className="flex items-center text-sm text-gray-500">
        <Calendar className="h-4 w-4 mr-1" />
        {course.duration}
        <Users className="h-4 w-4 ml-4 mr-1" />
        {course.students_enrolled || 0} students
      </div>
    </CardHeader>
  );

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="h-full flex flex-col overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300">
        
        {/* Bestseller Badge (Keep existing) */}
        {course.bestseller && (
          <div className="absolute top-0 right-0 z-10">
            <Badge className="m-2 bg-amber-500 hover:bg-amber-600">
              <Star className="h-3 w-3 mr-1 fill-current" /> Bestseller
            </Badge>
          </div>
        )}
        
        {/* Top Gradient Bar (Keep existing) */}
        <div className={`h-2 ${course.bestseller ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-royal to-royal-dark'}`}></div>
        
        {/* === CONDITIONAL IMAGE DISPLAY === */}
        {hasImage && (
            <div className="relative aspect-video w-full overflow-hidden">
                <img 
                    src={course.image_url} 
                    alt={course.title} 
                    className="w-full h-full object-cover"
                />
            </div>
        )}
        {/* === END: CONDITIONAL IMAGE DISPLAY === */}

        {/* === CONDITIONAL HEADER CONTENT === */}
        {hasImage ? fullFeatureHeader : originalHeader}
        {/* === END: CONDITIONAL HEADER CONTENT === */}
        
        <CardContent className="flex-grow">
          <CardDescription className="text-gray-600 mb-4">{course.description}</CardDescription>
          
          {/* === DESIGN IMPROVEMENT START (Keep existing feature list) === */}
          <div className="flex flex-col space-y-2">
            {course.features?.map((feature, i) => (
              <div key={i} className="flex items-start text-sm">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          {/* === DESIGN IMPROVEMENT END === */}

        </CardContent>
        <CardFooter className="border-t pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center mt-auto">
          <div className="mb-3 sm:mb-0">
            {course.discounted_price && course.discounted_price < course.price ? (
              <>
                <span className="text-xl font-bold text-royal">₹{course.discounted_price}</span>
                <span className="ml-2 text-gray-500 line-through">₹{course.price}</span>
              </>
            ) : (
              <span className="text-xl font-bold text-royal">₹{course.price}</span>
            )}
          </div>
          <EnrollButton
            courseId={course.id}
            enrollmentLink={course.enroll_now_link || undefined}
            className={`${course.bestseller ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700' : 'bg-royal hover:bg-royal-dark'} text-white px-5 py-2`}
          />
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
