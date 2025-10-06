import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Calendar,
  Users,
  GitBranch,
  Layers, // for level
  Languages, // for language
  ImageOff,
} from "lucide-react";
import EnrollButton from "@/components/EnrollButton";
import { Button } from '@/components/ui/button';
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
        
        {isBestseller && (
          <div className="absolute top-0 right-0 z-10">
            <Badge className="m-2 bg-amber-500 hover:bg-amber-600 font-semibold text-white">
              <Star className="h-3 w-3 mr-1 fill-current" /> Bestseller
            </Badge>
          </div>
        )}
        
        <div className={`h-2 ${isBestseller ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-royal to-royal-dark'}`}></div>
        
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

        <CardHeader className="pb-3">
            <CardTitle className="text-xl font-extrabold text-foreground pr-4 leading-snug">
                {course.title}
            </CardTitle>
            
            <div className="flex flex-wrap items-center gap-2 pt-1">
                {course.exam_category && (
                    <Badge className="bg-royal text-white hover:bg-royal-dark font-medium">
                        {course.exam_category}
                    </Badge>
                )}
                {course.branch && (
                  <Badge variant="secondary">
                      <GitBranch className="h-3 w-3 mr-1" /> {course.branch}
                  </Badge>
                )}
                {course.level && (
                  <Badge variant="secondary">
                     <Layers className="h-3 w-3 mr-1" /> {course.level}
                  </Badge>
                )}
                 {course.language && (
                  <Badge variant="secondary">
                     <Languages className="h-3 w-3 mr-1" /> {course.language}
                  </Badge>
                )}
            </div>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <div className="flex flex-col space-y-2 text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0 text-red-600" />
                  <span className="font-semibold mr-1">Batch Starts:</span> 
                  <span>{course.start_date ? formatDate(course.start_date) : 'TBA'}</span>
              </div>
              
              <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 flex-shrink-0 text-green-600" />
                  <span className="font-semibold mr-1">Enrolled:</span> 
                  <span>{course.students_enrolled || 0} students</span>
              </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex flex-col mt-auto">
          {showDiscount && (
             <div className="w-full text-center mb-3">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 text-sm font-semibold py-1 px-3">
                    {Math.round(((course.price - course.discounted_price!) / course.price) * 100)}% OFF! Price dropped to ₹{course.discounted_price}
                </Badge>
            </div>
          )}
           <div className="w-full flex items-baseline justify-center mb-4">
             <span className="text-3xl font-bold text-royal">
                  ₹{showDiscount ? course.discounted_price : course.price}
              </span>
              {showDiscount && (
                <span className="ml-2 text-base text-gray-500 line-through">
                    ₹{course.price}
                </span>
              )}
           </div>

          <div className="w-full grid grid-cols-2 gap-3">
             <Button variant="outline" className="w-full">Explore</Button>
             <EnrollButton
                courseId={course.id}
                enrollmentLink={course.enroll_now_link || undefined}
                coursePrice={course.discounted_price || course.price}
                className={`w-full ${isBestseller ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700' : 'bg-royal hover:bg-royal-dark'} text-white font-semibold transition-all duration-200`}
              />
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
