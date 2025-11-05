import React from "react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { RecommendedBatchCard } from "./RecommendedBatchCard";
import CourseCardSkeleton from "@/components/courses/CourseCardSkeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const RecommendedBatchesSection: React.FC = () => {
  // --- 1. GET THE NEW ARRAY FROM THE HOOK ---
  const { recommendedCourses, loading } = useBackend();

  // --- 2. HANDLE LOADING STATE ---
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Top Recommended Batches
            </CardTitle>
            <p className="text-md text-gray-600">
              Let's start with these popular premium courses
            </p>
          </div>
          <Button asChild variant="ghost" className="text-royal hover:text-royal">
            <Link to="/courses">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- 3. HANDLE NO RECOMMENDATIONS ---
  // If the array is empty, don't show the section at all
  if (!recommendedCourses || recommendedCourses.length === 0) {
    return null;
  }

  // --- 4. RENDER THE PERSONALIZED COURSES ---
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Top Recommended Batches
          </CardTitle>
          <p className="text-md text-gray-600">
            Based on your preferences
          </p>
        </div>
        <Button asChild variant="ghost" className="text-royal hover:text-royal">
          <Link to="/courses">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedCourses.map((course: any) => (
            <RecommendedBatchCard
              key={course.id}
              course={course}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedBatchesSection;
