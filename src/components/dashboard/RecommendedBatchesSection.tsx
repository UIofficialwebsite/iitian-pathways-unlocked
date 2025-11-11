import React from "react";
// import { useBackend } from "@/components/BackendIntegratedWrapper"; // <-- REMOVED
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
import { Tables } from "@/integrations/supabase/types"; // <-- ADDED

// --- ADDED TYPE ---
type Course = Tables<'courses'>; 

// --- ADDED PROPS ---
interface RecommendedBatchesSectionProps {
  recommendedCourses: Course[];
  loading: boolean;
}

const RecommendedBatchesSection: React.FC<RecommendedBatchesSectionProps> = ({ 
  recommendedCourses, 
  loading 
}) => {
  // --- 1. Data now comes from props ---
  
  // --- 2. CHECK IF WE HAVE COURSES (AFTER LOADING) ---
  const hasRecommendations = !loading && recommendedCourses && recommendedCourses.length > 0;

  return (
    <Card>
      {/* --- HEADER --- */}
      <CardHeader>
        <div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Top Recommended Batches
          </CardTitle>
          {/* --- DYNAMIC SUBTITLE --- */}
          <p className="text-md text-gray-600">
            {loading
              ? "Loading recommendations based on your preferences..."
              : hasRecommendations
              ? "Let's start with these popular courses"
              : "Check out our most popular courses"}
          </p>
        </div>
      </CardHeader>
      
      {/* --- CONTENT (HANDLES ALL 3 STATES) --- */}
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // --- 2a. LOADING STATE ---
            <>
              <CourseCardSkeleton />
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </>
          ) : hasRecommendations ? (
            // --- 2b. RECOMMENDATIONS FOUND ---
            recommendedCourses.map((course: any) => (
              <RecommendedBatchCard key={course.id} course={course} />
            ))
          ) : (
            // --- 2c. NO RECOMMENDATIONS FOUND (FALLBACK) ---
            // This message now appears if the in-depth filter (Levels 2, 1, and 0) finds nothing
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-500 py-8">
              No courses available at the moment.
              <br />
              Please check back later or explore all courses.
            </div>
          )}
        </div>
      </CardContent>

      {/* --- FOOTER (MODIFIED) --- */}
      <CardFooter className="flex justify-center pt-4">
        <Link to="/courses">
          <Button 
            size="lg" 
            variant="outline"
            className="text-base text-black border-black hover:bg-gray-100 hover:text-black"
          >
            View All
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RecommendedBatchesSection;
