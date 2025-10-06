import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Clock, Star } from "lucide-react";
import EnrollButton from "@/components/EnrollButton";
import { Course } from '@/components/admin/courses/types';

interface CourseHeaderProps {
  course: Course;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
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

  const showDiscount = course.discounted_price && course.discounted_price < course.price;

  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Course Image */}
          <div className="relative">
            {course.image_url ? (
              <img
                src={course.image_url}
                alt={course.title}
                className="w-full rounded-2xl shadow-2xl"
              />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-blue-200 to-purple-200 rounded-2xl flex items-center justify-center">
                <span className="text-4xl text-gray-500">📚</span>
              </div>
            )}
            {course.bestseller && (
              <Badge className="absolute top-4 left-4 bg-amber-500 text-white text-sm px-3 py-1">
                ⭐ Best Seller
              </Badge>
            )}
          </div>

          {/* Right: Course Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{course.title}</h1>
              <p className="text-lg text-gray-600">{course.description}</p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {course.exam_category && (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  {course.exam_category}
                </Badge>
              )}
              {course.level && (
                <Badge variant="secondary">{course.level}</Badge>
              )}
              {course.language && (
                <Badge variant="secondary">{course.language}</Badge>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Enrolled</p>
                  <p className="font-semibold">{course.students_enrolled || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-semibold">{course.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-xs text-gray-500">Starts</p>
                  <p className="font-semibold text-sm">
                    {course.start_date ? formatDate(course.start_date) : 'TBA'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-xs text-gray-500">Rating</p>
                  <p className="font-semibold">{course.rating || 4.0}</p>
                </div>
              </div>
            </div>

            {/* Price & Enroll */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-4xl font-bold text-blue-600">
                    ₹{showDiscount ? course.discounted_price : course.price}
                  </span>
                  {showDiscount && (
                    <span className="ml-3 text-xl text-gray-400 line-through">
                      ₹{course.price}
                    </span>
                  )}
                </div>
                {showDiscount && (
                  <Badge className="bg-red-500 text-white">
                    {Math.round(((course.price - course.discounted_price!) / course.price) * 100)}% OFF
                  </Badge>
                )}
              </div>
              <EnrollButton
                courseId={course.id}
                enrollmentLink={course.enroll_now_link || undefined}
                coursePrice={course.discounted_price || course.price}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseHeader;
