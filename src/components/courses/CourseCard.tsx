import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Calendar,
  Users,
  CheckCircle
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

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="h-full overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300">
        {course.bestseller && (
          <div className="absolute top-0 right-0 z-10">
            <Badge className="m-2 bg-amber-500 hover:bg-amber-600">
              <Star className="h-3 w-3 mr-1 fill-current" /> Bestseller
            </Badge>
          </div>
        )}
        <div className={`h-2 ${course.bestseller ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-royal to-royal-dark'}`}></div>
        <CardHeader className="pb-2">
          <CardTitle>{course.title}</CardTitle>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            {course.duration}
            <Users className="h-4 w-4 ml-4 mr-1" />
            {course.students_enrolled || 0} students
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-gray-600 mb-4">{course.description}</CardDescription>
          <div className="grid grid-cols-2 gap-2">
            {course.features?.map((feature, i) => (
              <div key={i} className="flex items-center text-sm">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                {feature}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
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
