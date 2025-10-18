import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, CalendarDays, Languages } from "lucide-react";
import EnrollButton from "@/components/EnrollButton";
import { Button } from "@/components/ui/button";
import { Course } from "@/components/admin/courses/types";

interface IITMCourseCardProps {
  course: Course;
}

const IITMCourseCard: React.FC<IITMCourseCardProps> = ({ course }) => {
  const isPremium = course.course_type === 'Gold';
  const isOnline = course.course_type === 'Online';
  const hasDiscount = course.discounted_price && course.discounted_price < course.price;

  return (
    <Card
      className={`border-none shadow-md hover:shadow-xl transition-all relative overflow-hidden ${isPremium ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300' : 'bg-white'}`}
    >
      {/* Corner Banners */}
      {course.bestseller && (
        <div className="absolute top-0 left-0">
          <div className="absolute transform -rotate-45 bg-green-500 text-center text-white font-semibold py-1 left-[-34px] top-[32px] w-[170px]">
            Bestseller
          </div>
        </div>
      )}
      {hasDiscount && (
        <div className="absolute top-0 right-0">
          <div className="absolute transform rotate-45 bg-red-500 text-center text-white font-semibold py-1 right-[-34px] top-[32px] w-[170px]">
            {Math.round(((course.price - course.discounted_price!) / course.price) * 100)}% OFF
          </div>
        </div>
      )}
      {isOnline && !course.bestseller && (
        <div className="absolute top-0 left-0">
          <div className="absolute transform -rotate-45 bg-blue-500 text-center text-white font-semibold py-1 left-[-34px] top-[32px] w-[170px]">
            Online Batch
          </div>
        </div>
      )}


      <CardHeader className="pt-12">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-xl flex items-center flex-wrap">
            <span className="mr-2">{course.title}</span>
            {isPremium && (
              <Badge variant="default" className="bg-amber-500 text-white">
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
            <p className="text-sm text-gray-500 flex items-center"><CalendarDays className="h-4 w-4 mr-2" /> Batch Starts</p>
            <p className="font-medium">{course.start_date ? new Date(course.start_date).toLocaleDateString() : 'TBA'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 flex items-center"><Languages className="h-4 w-4 mr-2" /> Language</p>
            <p className="font-medium">{course.language || 'English'}</p>
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
      <CardFooter className="flex justify-between items-center bg-gray-50 p-4">
        <div className="flex items-baseline">
          {hasDiscount ? (
            <>
              <span className={`text-2xl font-bold ${isPremium ? 'text-amber-600' : 'text-royal'}`}>₹{course.discounted_price}</span>
              <span className="ml-2 text-gray-500 line-through">₹{course.price}</span>
            </>
          ) : (
            <span className={`text-2xl font-bold ${isPremium ? 'text-amber-600' : 'text-royal'}`}>₹{course.price}</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
            <Link to={`/courses/${course.id}`}>
                <Button variant="outline">Know More</Button>
            </Link>
            <EnrollButton
              courseId={course.id}
              enrollmentLink={course.enroll_now_link || undefined}
              coursePrice={course.discounted_price || course.price}
              className={isPremium ?
                "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white" :
                "bg-royal hover:bg-royal-dark text-white"}
            />
        </div>
      </CardFooter>
    </Card>
  );
};

export default IITMCourseCard;
