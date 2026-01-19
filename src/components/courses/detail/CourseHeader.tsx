import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, Users, Calendar } from 'lucide-react';
import { Course } from '@/components/admin/courses/types';

interface CourseHeaderProps {
  course: Course;
  isDashboardView?: boolean;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ course, isDashboardView }) => {
  const navigate = useNavigate();

  return (
    <div className="border-b border-slate-200 bg-white shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-4xl">
          {!isDashboardView && (
            <Button 
              onClick={() => navigate('/courses')} 
              variant="ghost" 
              size="sm" 
              className="mb-4 -ml-2 text-slate-500 hover:text-royal"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
            </Button>
          )}
          
          <div className="flex flex-wrap gap-2 mb-4">
            {course.exam_category && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {course.exam_category}
              </Badge>
            )}
            {course.bestseller && (
              <Badge className="bg-amber-500 text-white border-none">
                ⭐ Best Seller
              </Badge>
            )}
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            {course.title}
          </h1>
          
          <p className="text-lg text-slate-600 mb-6 leading-relaxed">
            {course.description}
          </p>
          
          <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2 text-amber-600">
              <Star className="h-5 w-5 fill-amber-500 text-amber-500" /> 
              {course.rating || 4.0}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-royal" /> 
              {course.students_enrolled || 0} students
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-royal" /> 
              Starts: {new Date(course.start_date || "").toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;
