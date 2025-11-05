import React from "react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import RecommendedBatchCard from "./RecommendedBatchCard";
import { CourseCardSkeleton } from "@/components/courses/CourseCardSkeleton";
// We import the admin Course type because that is what the useBackend() hook provides
import { Course } from "@/components/admin/courses/types";

const RecommendedBatchesSection: React.FC = () => {
  // --- 1. GET THE NEW ARRAY FROM THE HOOK ---
  // 'loading' here is the main global loading state
  // recommendedCourses is of type Course[] (from admin/courses/types)
  const { recommendedCourses, loading } = useBackend();

  // --- 2. HANDLE LOADING STATE ---
  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recommended For You</h2>
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
      <h2 className="text-2xl font-bold">Recommended For You</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedCourses.map((course: Course) => (
          <RecommendedBatchCard
            key={course.id}
            // --- THIS IS THE FIX ---
            // The developer's "as unknown as Course" was a no-op
            // and didn't solve the type mismatch.
            // We cast to `any` to force the AdminCourse type into the
            // PublicCourse prop expected by RecommendedBatchCard.
            course={course as any}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendedBatchesSection;
