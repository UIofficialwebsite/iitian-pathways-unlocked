import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Users, BookOpen } from 'lucide-react';
import { Course } from '@/components/admin/courses/types';

interface CourseHeaderProps {
  course: Course;
}

const CourseHeader: FC<CourseHeaderProps> = ({ course }) => {
  const {
    title = "Course Title Placeholder",
    description = "A brief and engaging subtitle for the course.",
    rating = 4.8,
    duration = "8 weeks",
    students_enrolled = 5000,
    exam_category = "Technology",
    level = "Beginner",
  } = course;

  return (
    <header className="premium-course-header py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge 
            variant="secondary" 
            className="mb-6 bg-blue-50/80 text-blue-700 border border-blue-200/50 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold shadow-sm"
          >
            {exam_category}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 bg-clip-text text-transparent leading-tight">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
          <div className="flex items-center justify-center flex-wrap gap-x-8 gap-y-3 text-slate-700 mb-10">
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-blue-100/50">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="font-semibold">{rating}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-blue-100/50">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-medium">{duration}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-blue-100/50">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium">{students_enrolled?.toLocaleString() || 0} students</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-blue-100/50">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="font-medium">{level}</span>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 px-8 py-6 text-base font-semibold"
            >
              Enroll Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-blue-600 text-blue-700 hover:bg-blue-50 hover:border-blue-700 backdrop-blur-sm bg-white/70 shadow-md hover:shadow-lg transition-all duration-300 px-8 py-6 text-base font-semibold"
            >
              Watch Preview
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CourseHeader;
