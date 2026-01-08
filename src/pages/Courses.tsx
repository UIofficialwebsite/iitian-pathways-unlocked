import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EmailPopup from "@/components/EmailPopup";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import CourseCardSkeleton from "@/components/courses/CourseCardSkeleton";
import CourseCard from "@/components/courses/CourseCard";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  FileText, 
  Newspaper, 
  CalendarDays, 
  Filter, 
  ArrowRight,
  Library
} from "lucide-react";
import HeroCarousel from "@/components/HeroCarousel";

// Helper to normalize category names for display
const formatCategoryTitle = (param: string | null) => {
  if (!param) return "All Courses";
  if (param === "iitm-bs") return "IITM BS";
  return param.toUpperCase();
};

const Courses = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { courses, contentLoading } = useBackend();
  const [categoryParam, setCategoryParam] = useState<string | null>(null);

  useEffect(() => {
    const cat = searchParams.get("category");
    setCategoryParam(cat);
  }, [searchParams]);

  // Filter courses based on the category parameter
  const filteredCourses = categoryParam
    ? courses.filter(course => {
        const cat = course.exam_category?.toLowerCase();
        const param = categoryParam.toLowerCase();
        if (param === "iitm-bs") return cat === "iitm bs" || cat === "iitm_bs";
        return cat === param;
      })
    : courses;

  // We only show the first 3 courses in the "preview" row
  const displayedCourses = filteredCourses.slice(0, 3);

  const handleQuickLink = (type: string) => {
    // Navigate to respective pages/tabs
    if (type === 'pdf') navigate('/dashboard?tab=library');
    if (type === 'notes') navigate('/notes'); // Assuming notes route exists or uses dashboard
    if (type === 'news') navigate('/news');   // Assuming news route exists
    if (type === 'dates') navigate('/important-dates');
  };

  return (
    <>
      <NavBar />
      
      <main className="pt-16 min-h-screen bg-gray-50">
        
        {/* 1. Auto-Scrolling Image Banner */}
        <section className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
          {/* Reusing HeroCarousel or a simplified banner component */}
          <HeroCarousel /> 
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
             <div className="text-center text-white px-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                  {formatCategoryTitle(categoryParam)} Preparation
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
                  Your one-stop destination for {formatCategoryTitle(categoryParam)} study materials, batches, and guidance.
                </p>
             </div>
          </div>
        </section>

        {/* 2. Quick Access Tabs (Row) */}
        <section className="py-8 bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickAccessCard 
                icon={Library} 
                title="PDF Bank" 
                desc="Digital Library"
                onClick={() => handleQuickLink('pdf')}
              />
              <QuickAccessCard 
                icon={FileText} 
                title="Notes" 
                desc="Chapter-wise Notes"
                onClick={() => handleQuickLink('notes')}
              />
              <QuickAccessCard 
                icon={Newspaper} 
                title="News" 
                desc="Exam Updates"
                onClick={() => handleQuickLink('news')}
              />
              <QuickAccessCard 
                icon={CalendarDays} 
                title="Dates" 
                desc="Important Events"
                onClick={() => handleQuickLink('dates')}
              />
            </div>
          </div>
        </section>

        {/* 3. Filters & Course Row */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header with Filter Button */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Featured {formatCategoryTitle(categoryParam)} Batches
                </h2>
                <p className="text-gray-500 mt-1">Handpicked courses to boost your preparation</p>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>

            {/* Courses Grid (1 Row) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
              {contentLoading ? (
                Array.from({ length: 3 }).map((_, index) => <CourseCardSkeleton key={index} />)
              ) : displayedCourses.length > 0 ? (
                displayedCourses.map((course, index) => (
                  <CourseCard course={course} index={index} key={course.id} />
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed">
                  <p className="text-lg text-gray-500">No active batches found for this category currently.</p>
                  <Button variant="link" onClick={() => navigate('/courses')}>
                    View all available courses
                  </Button>
                </div>
              )}
            </div>

            {/* View All Button */}
            {filteredCourses.length > 3 && (
              <div className="flex justify-center">
                <Button 
                  onClick={() => navigate(`/courses/all?category=${categoryParam || 'all'}`)} // Mock route for "All List"
                  className="bg-royal hover:bg-royal/90 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  View All {formatCategoryTitle(categoryParam)} Courses
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* 4. Testimonials Section */}
        <section className="py-12 bg-gray-50 border-t">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Student Feedback
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Hear from students who cracked {formatCategoryTitle(categoryParam)} with us.
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

// Sub-component for Quick Access Tabs
const QuickAccessCard = ({ icon: Icon, title, desc, onClick }: { icon: any, title: string, desc: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-royal/30 transition-all duration-200 group text-center h-full"
  >
    <div className="w-12 h-12 rounded-full bg-royal/10 text-royal flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="font-semibold text-gray-900">{title}</h3>
    <p className="text-xs text-gray-500 mt-1">{desc}</p>
  </button>
);

export default Courses;
