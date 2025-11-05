import React from "react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
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

const RecommendedBatchesSection: React.FC = () => {
  // --- 1. GET THE NEW ARRAY FROM THE HOOK ---
  const { recommendedCourses, loading } = useBackend();

  // --- 2. CHECK IF WE HAVE COURSES (AFTER LOADING) ---
  const hasRecommendations = !loading && recommendedCourses && recommendedCourses.length > 0;

  return (
    <Card>
      {/* --- HEADER (BUTTON REMOVED FROM HERE) --- */}
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
              ? "Based on your preferences"
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
            // --- 2c. NO RECOMMENDATIONS FOUND (BUT WE STILL RENDER) ---
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-500 py-8">
              No specific recommendations found based on your profile.
              <br />
              Explore all our available courses below.
            </div>
          )}
        </div>
      </CardContent>

      {/* --- FOOTER (NEW) --- */}
      {/* --- ADDED FLEX JUSTIFY-CENTER TO CENTER THE BUTTON --- */}
      <CardFooter className="flex justify-center pt-4">
        <Button asChild size="lg" className="text-base">
          <Link to="/courses">View All Courses</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecommendedBatchesSection;
