import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EmailPopup from "@/components/EmailPopup";
import AdminAddButton from "@/components/admin/AdminAddButton";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import CourseCardSkeleton from "@/components/courses/CourseCardSkeleton";
import CourseCard from "@/components/courses/CourseCard";
import CoursesHeader from "@/components/courses/CoursesHeader";
import WhyChooseUsSection from "@/components/courses/WhyChooseUsSection";
import CategoryFilter from "@/components/courses/CategoryFilter";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";

// Helper function to map URL params to state values
const getCategoryFromUrl = (param: string | null) => {
  if (param === "iitm-bs") return "IITM BS";
  if (param === "jee") return "JEE";
  if (param === "neet") return "NEET";
  return "all";
};

const Courses = () => {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { courses, contentLoading } = useBackend();

  // Sync state with URL params on mount and when URL changes
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const categoryFromUrl = getCategoryFromUrl(categoryParam);
    setSelectedCategory(categoryFromUrl);
  }, [searchParams]);

  const categories = [
    { id: "all", name: "All Courses" },
    { id: "IITM BS", name: "IITM BS" },
    { id: "NEET", name: "NEET" },
    { id: "JEE", name: "JEE" }
  ];

  // Real-time filtering based on selected category
  const filteredCourses = selectedCategory === "all" 
    ? courses 
    : courses.filter(course => {
        // Handle both "IITM BS" and "IITM_BS" variations
        if (selectedCategory === "IITM BS") {
          return course.exam_category === "IITM BS" || course.exam_category === "IITM_BS";
        }
        return course.exam_category === selectedCategory;
      });

  return (
    <>
      <NavBar />
      
      <main className="pt-20">
        <CoursesHeader />

        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <CategoryFilter 
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
              
              <AdminAddButton 
                contentType="courses"
              >
                Add Course
              </AdminAddButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {contentLoading ? (
                Array.from({ length: 6 }).map((_, index) => <CourseCardSkeleton key={index} />)
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((course, index) => (
                  <CourseCard course={course} index={index} key={course.id} />
                ))
              ) : (
                <div className="col-span-full text-center py-16 text-gray-500">
                  <p className="text-lg">No courses found for this category.</p>
                  <p>Please check back later or select a different category.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <WhyChooseUsSection />
        
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                What Our Students Say
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Real experiences from IITM BS students and graduates
              </p>
            </div>
            <StaggerTestimonials />
          </div>
        </section>
      </main>

      <Footer />
      <EmailPopup />
    </>
  );
};

export default Courses;
