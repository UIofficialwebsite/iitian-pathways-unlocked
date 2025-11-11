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
    <header 
      // Replaced inline style with Tailwind classes for the new background
      className="bg-gray-950 text-gray-50 py-12 md:py-20"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge 
            variant="default" 
            // Styled badge with new card/border colors
            className="mb-4 bg-gray-800 text-gray-400 border-gray-700"
          >
            {exam_category}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-50">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-8">
            {description}
          </p>
          <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2 text-gray-400 mb-8">
            <div className="flex items-center space-x-1">
              {/* Updated icons to use primary accent color */}
              <Star className="w-5 h-5 text-blue-600" />
              <span>{rating}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-5 h-5 text-blue-600" />
              <span>{students_enrolled?.toLocaleString() || 0} students</span>
            </div>
             <div className="flex items-center space-x-1">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>{level}</span>
            </div>
          </div>
          <div className="flex justify-center space-x-4">
            {/* Replaced custom variants with standard buttons styled with the new palette */}
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-gray-50"
            >
              Enroll Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-700 text-gray-50 hover:bg-gray-800 hover:text-gray-50"
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
