import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Users, BookOpen, ArrowLeft } from 'lucide-react';
import { Course } from '@/components/admin/courses/types';
import { useNavigate } from 'react-router-dom';

interface CourseHeaderProps {
  course: Course;
}

const CourseHeader: FC<CourseHeaderProps> = ({ course }) => {
  const navigate = useNavigate();
  
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
    <header className="premium-course-header py-8 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Back button integrated into header */}
          <Button 
            onClick={() => navigate('/courses')} 
            variant="ghost" 
            size="sm" 
            className="mb-6 text-slate-300 hover:text-white hover:bg-slate-800/50 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          
          <div className="text-center">
            <Badge 
              variant="secondary" 
              className="mb-6 bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold shadow-lg shadow-blue-500/20"
            >
              {exam_category}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
            <div className="flex items-center justify-center flex-wrap gap-x-8 gap-y-3 text-slate-200 mb-10">
              <div className="flex items-center space-x-2 bg-slate-800/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-slate-700/50">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="font-semibold">{rating}</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-800/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-slate-700/50">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="font-medium">{duration}</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-800/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-slate-700/50">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="font-medium">{students_enrolled?.toLocaleString() || 0} students</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-800/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-slate-700/50">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span className="font-medium">{level}</span>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 px-8 py-6 text-base font-semibold"
              >
                Enroll Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-blue-400 text-blue-300 hover:bg-blue-500/20 hover:border-blue-300 hover:text-white backdrop-blur-sm bg-slate-800/40 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-base font-semibold"
              >
                Watch Preview
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CourseHeader;
