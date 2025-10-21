import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Users, BookOpen } from "lucide-react";
import { Course } from "@/components/admin/courses/types";

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
    <header className="relative overflow-hidden text-white py-16 md:py-24 bg-gradient-to-r from-[#1D2B64] to-[#3E517A]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent)]" />
      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-5 bg-white/15 text-[#FFD700] border-none">
            {category}
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.1)]">
            {title}
          </h1>

          <p className="text-lg md:text-xl text-[#E0E0E0] mb-8 opacity-90">
            {subtitle}
          </p>

          <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2 text-[#B0B0B0] mb-10">
            <div className="flex items-center space-x-1">
              <Star className="w-5 h-5 text-[#FFD700]" />
              <span>{rating} ({reviewsCount} reviews)</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-5 h-5 text-[#FFD700]" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-5 h-5 text-[#FFD700]" />
              <span>{studentCount.toLocaleString()} students</span>
            </div>
            <div className="flex items-center space-x-1">
              <BookOpen className="w-5 h-5 text-[#FFD700]" />
              <span>{level}</span>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              size="lg"
              className="bg-[#FFD700] text-black font-semibold hover:bg-[#e6c200]"
            >
              Enroll Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]/10"
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
