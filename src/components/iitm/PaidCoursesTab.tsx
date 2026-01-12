import React from "react";
import CourseCardSkeleton from "@/components/courses/CourseCardSkeleton";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import CourseList from "./CourseList";

interface PaidCoursesTabProps {
  branch: string;
  levels: string[];
  subjects: string[];
  priceRange: string | null;
  newlyLaunched: boolean;
  fastrackOnly: boolean;
  bestSellerOnly: boolean;
}

const PaidCoursesTab: React.FC<PaidCoursesTabProps> = ({ 
  branch, 
  levels, 
  subjects, 
  priceRange, 
  newlyLaunched, 
  fastrackOnly, 
  bestSellerOnly 
}) => {
  const { courses, contentLoading } = useBackend();

  // Primary filtering for IITM BS category
  const iitmCourses = courses.filter(course => 
    course.exam_category === 'IITM BS' || course.exam_category === 'IITM_BS'
  );
  
  const filteredCourses = iitmCourses.filter(course => {
    // 1. Branch Filter
    const branchMatch = branch === "all" || branch === "All Branches" || course.branch === branch;
    
    // 2. Multi-Level Filter
    const levelMatch = levels.length === 0 || levels.includes(course.level || '');
    
    // 3. Multi-Subject Filter
    const subjectMatch = subjects.length === 0 || subjects.includes(course.subject || '');

    // 4. Pricing Logic
    let priceMatch = true;
    if (priceRange) {
      const effectivePrice = course.discounted_price ?? course.price;
      priceMatch = priceRange === 'free' ? effectivePrice === 0 : (effectivePrice ?? 0) > 0;
    }

    // 5. Time-based "Newly Launched"
    let newMatch = true;
    if (newlyLaunched) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      newMatch = !!course.updated_at && new Date(course.updated_at) > thirtyDaysAgo;
    }

    // 6. Fastrack Batch Match
    let fastMatch = true;
    if (fastrackOnly) {
      fastMatch = !!course.batch_type?.toLowerCase().includes('fastrack');
    }

    // 7. Bestseller Tag Match
    let bestMatch = true;
    if (bestSellerOnly) {
      bestMatch = course.bestseller === true;
    }

    return branchMatch && levelMatch && subjectMatch && priceMatch && newMatch && fastMatch && bestMatch;
  });

  if (contentLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, index) => <CourseCardSkeleton key={index} />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CourseList courses={filteredCourses} />
    </div>
  );
};

export default PaidCoursesTab;
