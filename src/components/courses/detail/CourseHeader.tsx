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
    subtitle = "A brief and engaging subtitle for the course.",
    rating = 4.8,
    reviewsCount = 250,
    duration = "8 weeks",
    studentCount = 5000,
    category = "Technology",
    level = "Beginner",
  } = course;

  return (
    <header 
      className="text-white py-12 md:py-20"
      style={{
        background: 'linear-gradient(90deg, #0F2027 0%, #203A43 50%, #2C5364 100%)'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge 
            variant="secondary" 
            className="mb-4 bg-opacity-20 bg-white text-white border-none"
          >
            {category}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[#FFFFFF]">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-[#C7B8EA] mb-8">
            {subtitle}
          </p>
          <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2 text-[#A18BD0] mb-8">
            <div className="flex items-center space-x-1">
              <Star className="w-5 h-5 text-[#FFBB00]" />
              <span>{rating} ({reviewsCount} reviews)</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-5 h-5 text-[#FFBB00]" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-5 h-5 text-[#FFBB00]" />
              <span>{studentCount.toLocaleString()} students</span>
            </div>
             <div className="flex items-center space-x-1">
              <BookOpen className="w-5 h-5 text-[#FFBB00]" />
              <span>{level}</span>
            </div>
          </div>
          <div className="flex justify-center space-x-4">
            <Button size="lg" variant="luxury">Enroll Now</Button>
            <Button size="lg" variant="luxury_outline">Watch Preview</Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CourseHeader;
