import React from "react";
import { Link } from "react-router-dom";
import { Course } from "@/components/admin/courses/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, ArrowRight } from "lucide-react";

interface SubCoursesListProps {
  subCourses: Course[];
}

const SubCoursesList = ({ subCourses }: SubCoursesListProps) => {
  if (!subCourses || subCourses.length === 0) return null;

  return (
    <div className="space-y-6 mt-8">
      <h3 className="text-2xl font-bold text-gray-900">Included Sub-Courses</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge variant={course.price === 0 ? "secondary" : "default"} className="mb-2">
                  {course.price === 0 ? "FREE" : `₹${course.price}`}
                </Badge>
                {/* Visual indicator if it's a sub-module */}
                <Badge variant="outline" className="text-xs text-gray-500">
                  Module
                </Badge>
              </div>
              <CardTitle className="text-lg font-semibold line-clamp-2">
                {course.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {course.description}
              </p>
              
              <Link to={`/courses/${course.id}`}>
                <Button variant="outline" className="w-full group">
                  View Course 
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubCoursesList;
