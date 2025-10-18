import React from "react";
import IITMCourseCard from "./IITMCourseCard";
import { Course } from "@/components/admin/courses/types";

interface CourseListProps {
  courses: Course[];
}

const CourseList: React.FC<CourseListProps> = ({ courses }) => {
  if (courses.length === 0) {
    return <p className="text-center text-gray-500">No courses found for the selected filters.</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {courses.map(course => (
        <IITMCourseCard key={course.id} course={course} />
      ))}
    </div>
  );
};

export default CourseList;
