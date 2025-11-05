import React from "react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { RecommendedBatchCard } from "./RecommendedBatchCard";
import CourseCardSkeleton from "@/components/courses/CourseCardSkeleton";

const RecommendedBatchesSection: React.FC = () => {
  // --- 1. GET THE NEW ARRAY FROM THE HOOK ---
  // 'loading' here is the main global loading state
  // recommendedCourses is now correctly typed as any[]
  const { recommendedCourses, loading } = useBackend();

  // --- 2. HANDLE LOADING STATE ---
  if (loading) {
    return (
      <div className="space-y-4">
        {/* --- START: UPDATED CODE --- */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Top Recommended Batches
          </h2>
          <p className="text-md text-gray-600">
            Based on your preferences
          </p>
        </div>
        {/* --- END: UPDATED CODE --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
        </div>
      </div>
    );
  }

  // --- 3. HANDLE NO RECOMMENDATIONS ---
  // If the array is empty, don't show the section at all
  if (!recommendedCourses || recommendedCourses.length === 0) {
    return null;
  }

  // --- 4. RENDER THE PERSONALIZED COURSES ---
  return (
    <div className="space-y-4">
      {/* --- START: UPDATED CODE --- */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Top Recommended Batches
        </h2>
        <p className="text-md text-gray-600">
          Based on your preferences
        </p>
      </div>
      {/* --- END: UPDATED CODE --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* --- FIX: Type course as 'any' and remove all casts --- */}
        {recommendedCourses.map((course: any) => (
          <RecommendedBatchCard
            key={course.id}
            course={course} // No more cast needed
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendedBatchesSection;
