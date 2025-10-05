import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  ImageOff,
  Monitor,
  GitBranch // <=== ADDED GitBranch ICON for course branch
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
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const hasImage = !!course.image_url;
  const isBestseller = !!course.bestseller;
  const showDiscount = course.discounted_price && course.discounted_price < course.price;
  
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="h-full flex flex-col overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300">
        
        {/* Bestseller Badge (Absolute Top Right) */}
        {isBestseller && (
          <div className="absolute top-0 right-0 z-10">
            <Badge className="m-2 bg-amber-500 hover:bg-amber-600 font-semibold text-white">
              <Star className="h-3 w-3 mr-1 fill-current" /> Bestseller
            </Badge>
          </div>
        )}
        
        {/* Top Gradient Bar */}
        <div className={`h-2 ${isBestseller ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-royal to-royal-dark'}`}></div>
        
        {/* === START: IMAGE OR PLACEHOLDER === */}
        {hasImage ? (
            <div className="relative aspect-video w-full overflow-hidden">
                <img 
                    src={course.image_url} 
                    alt={course.title} 
                    className="w-full h-full object-cover"
                />
            </div>
        ) : (
             <div className="relative aspect-video w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                 <ImageOff className="h-10 w-10 text-gray-400" />
             </div>
        )}
        {/* === END: IMAGE OR PLACEHOLDER === */}

        <CardHeader className="pb-3">
            
            {/* Row 1: Title and Rating */}
            <div className="flex justify-between items-start mb-1">
                <CardTitle className="text-xl font-extrabold text-foreground pr-4 leading-snug">
                    {course.title}
                </CardTitle>
                {course.rating && (
                    <div className="flex items-center text-lg font-bold text-amber-600 space-x-1 flex-shrink-0 pt-1">
                        <Star className="h-4 w-4 fill-amber-500 stroke-amber-500" />
                        <span>{course.rating.toFixed(1)}</span>
                    </div>
                )}
            </div>
            
            {/* Row 2: Exam Category and Subject Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
                {course.exam_category && (
                    <Badge className="bg-royal text-white hover:bg-royal-dark font-medium">
                        {course.exam_category}
                    </Badge>
                )}
                {course.subject && (
                    <Badge variant="secondary" className="bg-gray-200 text-gray-700 font-medium">
                        {course.subject}
                    </Badge>
                )}
            </div>

        </CardHeader>
        
        <CardContent className="flex-grow">
          {/* Detail Block (Duration, Students, Start Date, Course Type, and Branch) */}
          <div className="flex flex-wrap items-center text-sm text-gray-600 gap-x-4 gap-y-2 mb-3 p-2 border rounded-lg bg-gray-50">
              
              {/* Duration */}
              <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 flex-shrink-0 text-blue-600" />
                  <span className="font-medium">{course.duration}</span>
              </div>
              
              {/* Students Enrolled */}
              <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 flex-shrink-0 text-green-600" />
                  <span>{course.students_enrolled || 0} students</span>
              </div>
              
              {/* Start Date */}
              {course.start_date && (
                  <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 flex-shrink-0 text-red-600" />
                      <span>Starts: {formatDate(course.start_date)}</span>
                  </div>
              )}
              
              {/* Course Type */}
              {course.course_type && (
                  <div className="flex items-center">
                      <Monitor className="h-4 w-4 mr-1 flex-shrink-0 text-purple-600" />
                      <span>{course.course_type}</span>
                  </div>
              )}
              
              {/* === ADDED BRANCH HERE === */}
              {course.branch && (
                  <div className="flex items-center">
                      <GitBranch className="h-4 w-4 mr-1 flex-shrink-0 text-orange-600" />
                      <span>{course.branch}</span>
                  </div>
              )}
              {/* === END ADDED BRANCH === */}
          </div>
          
          <CardDescription className="text-gray-600 mb-4 line-clamp-3">
              {course.description}
          </CardDescription>
          
          {/* Feature List (Professional checklist) */}
          <div className="flex flex-col space-y-1">
            {course.features?.slice(0, 3).map((feature, i) => ( // Show max 3 features
              <div key={i} className="flex items-start text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-green-500 fill-green-100" />
                <span className="leading-tight">{feature}</span>
              </div>
            ))}
            {course.features && course.features.length > 3 && (
                <div className="text-sm text-gray-500 mt-1">...and {course.features.length - 3} more features</div>
            )}
          </div>

        </CardContent>
        
        <CardFooter className="border-t pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center mt-auto">
          {/* Pricing Block */}
          <div className="mb-3 sm:mb-0 flex items-baseline">
            {showDiscount ? (
              <>
                <span className="text-3xl font-bold text-royal">
                    ₹{course.discounted_price}
                </span>
                <span className="ml-2 text-base text-gray-500 line-through">
                    ₹{course.price}
                </span>
                <span className="ml-3 text-sm font-semibold text-green-600">
                    {Math.round(((course.price - course.discounted_price!) / course.price) * 100)}% OFF
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-royal">
                  ₹{course.price}
              </span>
            )}
          </div>
          
          {/* Enroll Button */}
          <EnrollButton
            courseId={course.id}
            enrollmentLink={course.enroll_now_link || undefined}
            className={`${isBestseller ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700' : 'bg-royal hover:bg-royal-dark'} text-white px-5 py-2 font-semibold transition-all duration-200`}
          />
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
