import React from "react";
import { RecommendedBatchCard } from "./RecommendedBatchCard";
import CourseCardSkeleton from "@/components/courses/CourseCardSkeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type Course = Tables<'courses'>;

interface RecommendedBatchesSectionProps {
  recommendedCourses: Course[];
  loading: boolean;
}

const RecommendedBatchesSection: React.FC<RecommendedBatchesSectionProps> = ({ 
  recommendedCourses, 
  loading 
}) => {
  const hasRecommendations = !loading && recommendedCourses && recommendedCourses.length > 0;

  return (
    <Card className="overflow-hidden border-none shadow-none lg:border lg:shadow-sm">
      <CardHeader className="px-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Top Recommended Batches
            </CardTitle>
            <p className="text-md text-gray-600">
              {loading
                ? "Loading recommendations based on your preferences..."
                : hasRecommendations
                ? "Let's start with these popular courses"
                : "Check out our most popular courses"}
            </p>
          </div>
          {!loading && hasRecommendations && (
            <Link to="/courses" className="hidden sm:block">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700 font-semibold">
                View All →
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0 relative">
        <ScrollArea className="w-full">
          {/* Container with padding and flex-nowrap to prevent vertical stacking */}
          <div className="flex flex-nowrap gap-6 p-6 min-w-full">
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-[280px] sm:w-[320px] md:w-[350px] shrink-0">
                    <CourseCardSkeleton />
                  </div>
                ))}
              </>
            ) : hasRecommendations ? (
              recommendedCourses.map((course: any) => (
                <div key={course.id} className="w-[280px] sm:w-[320px] md:w-[380px] shrink-0">
                  <RecommendedBatchCard course={course} />
                </div>
              ))
            ) : (
              <div className="w-full text-center text-gray-500 py-12">
                No courses available at the moment.
                <br />
                Please check back later or explore all courses.
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" className="bg-gray-100/50" />
        </ScrollArea>
      </CardContent>

      <CardFooter className="flex justify-center pt-2 pb-6 sm:hidden">
        <Link to="/courses">
          <Button 
            size="lg" 
            variant="outline"
            className="text-base text-black border-black hover:bg-gray-100"
          >
            View All
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RecommendedBatchesSection;
