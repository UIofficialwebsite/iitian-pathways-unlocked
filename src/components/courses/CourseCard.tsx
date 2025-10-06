import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  GitBranch,
  Layers,
  Languages,
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
  const discountPercentage = showDiscount ? Math.round(((course.price - course.discounted_price!) / course.price) * 100) : 0;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="h-full flex flex-col overflow-hidden relative border-none shadow-xl hover:shadow-2xl transition-all duration-300">

        {/* Discount Ribbon */}
        {showDiscount && (
            <div className="absolute top-[-5px] right-[-5px] z-10 w-[75px] h-[75px] overflow-hidden text-right">
                <span
                    className="text-xs font-bold text-white uppercase text-center leading-5 transform rotate-45 w-[100px] block bg-red-500 shadow-lg absolute top-[19px] right-[-21px]"
                    style={{
                        "background": "#ef4444",
                        "boxShadow": "0 3px 10px -5px rgba(0, 0, 0, 1)"
                    }}
                >
                    {discountPercentage}% OFF
                </span>
            </div>
        )}

        {/* Top Color Bar */}
        <div className={`h-2 ${isBestseller ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-blue-500 to-blue-700'}`}></div>

        <div className="relative">
          {hasImage ? (
              <div className="aspect-video w-full overflow-hidden">
                  <img
                      src={course.image_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                  />
              </div>
          ) : (
               <div className="aspect-video w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                   <ImageOff className="h-10 w-10 text-gray-400" />
               </div>
          )}
        </div>

        {/* Bestseller Running Text */}
        {isBestseller && (
          <div className="bg-amber-100 text-amber-800 py-0.5 overflow-hidden">
            <motion.div
              className="whitespace-nowrap text-xs font-semibold"
              animate={{ x: ['100%', '-100%'] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 15,
                  ease: "linear",
                },
              }}
            >
              <span className="mx-4">❤️ Trusted by hundreds of Learners</span>
              <span className="mx-4">❤️ Trusted by hundreds of Learners</span>
            </motion.div>
          </div>
        )}

        <CardHeader className="pb-3">
            <CardTitle className="text-xl font-extrabold text-gray-800 pr-4 leading-snug">
                {course.title}
            </CardTitle>

            <div className="flex flex-wrap items-center gap-2 pt-1">
                {course.exam_category && (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 font-medium">
                        {course.exam_category}
                    </Badge>
                )}
                {course.branch && (
                  <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                      <GitBranch className="h-3 w-3 mr-1" /> {course.branch}
                  </Badge>
                )}
                {course.level && (
                  <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                     <Layers className="h-3 w-3 mr-1" /> {course.level}
                  </Badge>
                )}
                 {course.language && (
                  <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                     <Languages className="h-3 w-3 mr-1" /> {course.language}
                  </Badge>
                )}
            </div>
        </CardHeader>

        <CardContent className="flex-grow">
          <div className="flex flex-col space-y-2 text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0 text-red-500" />
                  <span className="font-semibold mr-1">Batch Starts:</span>
                  <span className="font-medium">{course.start_date ? formatDate(course.start_date) : 'TBA'}</span>
              </div>

              <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 flex-shrink-0 text-green-500" />
                  <span className="font-semibold mr-1">Enrolled:</span>
                  <span className="font-medium">{course.students_enrolled || 0} students</span>
              </div>
          </div>
        </CardContent>

        <CardFooter className="border-t pt-4 flex flex-col mt-auto">
           <div className="w-full flex items-baseline justify-center mb-4">
             <span className="text-4xl font-bold text-blue-600">
                  ₹{showDiscount ? course.discounted_price : course.price}
              </span>
              {showDiscount && (
                <span className="ml-2 text-xl text-gray-400 line-through">
                    ₹{course.price}
                </span>
              )}
           </div>

          <div className="w-full grid grid-cols-2 gap-3">
             <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold">Explore</Button>
             <EnrollButton
                courseId={course.id}
                enrollmentLink={course.enroll_now_link || undefined}
                coursePrice={course.discounted_price || course.price}
                className={`w-full ${isBestseller ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold transition-all duration-200`}
              />
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
