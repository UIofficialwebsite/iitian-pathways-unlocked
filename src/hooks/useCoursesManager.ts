
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Course } from "@/components/admin/courses/types";

export interface UseCoursesManagerProps {
  onSuccessCreate?: () => void;
  onSuccessUpdate?: () => void;
  onError?: (error: string) => void;
}

export const useCoursesManager = (props?: UseCoursesManagerProps) => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCourses((data || []) as unknown as Course[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      });
      props?.onError?.(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createCourse = async (courseData: Omit<Course, "id" | "created_at" | "updated_at">) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("courses").insert([courseData]);
      if (error) throw error;
      props?.onSuccessCreate?.();
      toast({ title: "Success", description: "Course created successfully" });
      await fetchCourses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
      props?.onError?.(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCourse = async (id: string, courseData: Partial<Course>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("courses")
        .update(courseData)
        .eq("id", id);
      if (error) throw error;
      props?.onSuccessUpdate?.();
      toast({ title: "Success", description: "Course updated successfully" });
      await fetchCourses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      });
      props?.onError?.(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCourse = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Course deleted successfully" });
      await fetchCourses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
      props?.onError?.(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // Only on mount
    // eslint-disable-next-line
  }, []);

  return {
    courses,
    isLoading,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
  };
};
