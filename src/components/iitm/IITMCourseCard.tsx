
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import EnrollButton from "@/components/EnrollButton";
import { Course } from "@/components/admin/courses/types";

interface IITMCourseCardProps {
  course: Course;
}

const IITMCourseCard: React.FC<IITMCourseCardProps> = ({ course }) => {
  const isPremium = course.course_type === 'Gold';

  return (
    <Card 
      className={`border-none shadow-md hover:shadow-xl transition-all ${isPremium ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300' : ''}`}
    >
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-xl">
            {course.title}
            {isPremium && (
              <Badge className="ml-2 bg-amber-500 text-white">
                <Star className="h-3 w-3 mr-1 fill-current" /> Premium
              </Badge>
            )}
          </CardTitle>
          <Badge variant="outline" className={`${course.level?.toLowerCase() === 'foundation' ? 'bg-blue-100 text-blue-700' : course.level?.toLowerCase() === 'diploma' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
            {course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : ''}
          </Badge>
        </div>
        <CardDescription className="text-base">{course.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium">{course.duration}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Enrolled</p>
            <p className="font-medium">{course.students_enrolled || 0}+ students</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Key Features:</p>
          <ul className="list-disc pl-5 space-y-1">
            {course.features?.map((feature, index) => (
              <li key={index} className="text-sm">{feature}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center">
          {course.discounted_price && course.discounted_price < course.price ? (
            <>
              <span className={`text-xl font-bold ${isPremium ? 'text-amber-600' : 'text-royal'}`}>₹{course.discounted_price}</span>
              <span className="ml-2 text-gray-500 line-through">₹{course.price}</span>
            </>
          ) : (
            <span className={`text-xl font-bold ${isPremium ? 'text-amber-600' : 'text-royal'}`}>₹{course.price}</span>
          )}
        </div>
        <EnrollButton 
          courseId={course.id}
          enrollmentLink={course.enroll_now_link || undefined}
          coursePrice={course.discounted_price || course.price}
          className={isPremium ? 
            "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white" : 
            "bg-royal hover:bg-royal-dark text-white"}
        />
      </CardFooter>
    </Card>
  );
};

export default IITMCourseCard;
