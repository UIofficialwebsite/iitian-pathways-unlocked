import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EmailPopup from "@/components/EmailPopup";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import CourseCardSkeleton from "@/components/courses/CourseCardSkeleton";
import CourseCard from "@/components/courses/CourseCard";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";
import { Button } from "@/components/ui/button";
import HeroCarousel from "@/components/HeroCarousel";
import { 
  FileText, 
  StickyNote, 
  Newspaper, 
  CalendarDays, 
  ChevronRight,
  ArrowRight
} from "lucide-react";

// Helper to normalize category titles
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

  // 1. Filter courses by the main Category (Level 1 Filter)
  const filteredCourses = useMemo(() => {
    if (!categoryParam) return courses;
    return courses.filter(course => {
      const cat = course.exam_category?.toLowerCase();
      const param = categoryParam.toLowerCase();
      if (param === "iitm-bs") return cat === "iitm bs" || cat === "iitm_bs";
      return cat === param;
    });
  }, [courses, categoryParam]);

  // 2. Derive Level 2 Filters (Sub-categories like Class 11, 12, Dropper)
  // We extract these dynamically from course titles or tags to avoid hardcoding
  const subCategoryFilters = useMemo(() => {
    const keywords = ["Class 11", "Class 12", "Dropper", "Crash Course", "Foundation"];
    const availableFilters = new Set<string>();

    filteredCourses.forEach(course => {
      const title = course.title.toLowerCase();
      keywords.forEach(key => {
        if (title.includes(key.toLowerCase())) {
          availableFilters.add(key);
        }
      });
    });

    return Array.from(availableFilters).sort();
  }, [filteredCourses]);

  const displayedCourses = filteredCourses.slice(0, 3); // Show top 3

  return (
    <>
      <NavBar />
      
      {/* Main Content Wrapper with top padding for fixed navbar */}
      <main className="pt-16 min-h-screen bg-[#f5f7ff]">
        
        {/* --- 1. Banner Section --- */}
        <section className="relative w-full h-[350px] md:h-[450px] overflow-hidden">
          <HeroCarousel />
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end pb-16 justify-center pointer-events-none">
             <div className="text-center text-white px-4">
                <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight drop-shadow-md">
                  {formatCategoryTitle(categoryParam)} 
                  <span className="text-royal-light ml-3">Preparation</span>
                </h1>
                <p className="text-lg md:text-2xl text-gray-100 max-w-3xl mx-auto font-light">
                  Comprehensive study material, live batches, and guidance to help you crack the exam.
                </p>
             </div>
          </div>
        </section>

        {/* --- 2. Quick Access Tabs (Custom Design) --- */}
        <section className="relative z-20 -mt-10 px-4 mb-16">
          <div className="max-w-7xl mx-auto">
            {/* Scrollable container for mobile */}
            <div className="flex flex-nowrap overflow-x-auto gap-6 pb-8 pt-6 px-2 md:grid md:grid-cols-4 md:overflow-visible">
              
              {/* PDF Bank (Red) */}
              <QuickAccessCard 
                title="PDF Bank" 
                subtitle="Access PDF Bank"
                icon={FileText}
                theme="red"
                onClick={() => navigate('/dashboard?tab=library')}
              />

              {/* Notes (Yellow) */}
              <QuickAccessCard 
                title="Notes" 
                subtitle="Read Study Notes"
                icon={StickyNote}
                theme="yellow"
                onClick={() => navigate('/notes')}
              />

              {/* News (Green) */}
              <QuickAccessCard 
                title="News" 
                subtitle="Latest Notifications"
                icon={Newspaper}
                theme="green"
                onClick={() => navigate('/news')}
              />

              {/* Important Dates (Blue) */}
              <QuickAccessCard 
                title="Dates" 
                subtitle="Important Timelines"
                icon={CalendarDays}
                theme="blue"
                onClick={() => navigate('/important-dates')}
              />

            </div>
          </div>
        </section>

        {/* --- 3. Featured Batches --- */}
        <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Featured Batches</h2>
                <p className="text-gray-500 mt-2">Top rated courses for {formatCategoryTitle(categoryParam)}</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {contentLoading ? (
                Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)
              ) : displayedCourses.length > 0 ? (
                displayedCourses.map((course, index) => (
                  <CourseCard course={course} index={index} key={course.id} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                  <p className="text-gray-500 text-lg">No active batches found currently.</p>
                </div>
              )}
           </div>

           {/* View All Button */}
           <div className="flex justify-center mt-10">
             <Button 
               onClick={() => navigate(`/courses/search?category=${categoryParam || 'all'}`)}
               variant="outline"
               className="rounded-full px-8 py-6 text-base border-royal/20 text-royal hover:bg-royal/5"
             >
               View All Courses
             </Button>
           </div>
        </section>

        {/* --- 4. Level 2 Filters (Explore by Target) --- */}
        {subCategoryFilters.length > 0 && (
          <section className="py-12 bg-white mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore by Target</h2>
               <div className="flex flex-wrap gap-4">
                 {subCategoryFilters.map((filter) => (
                   <button
                     key={filter}
                     onClick={() => navigate(`/courses/search?category=${categoryParam}&q=${filter}`)}
                     className="px-6 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-royal hover:shadow-md transition-all duration-200 flex items-center group"
                   >
                     <span className="font-medium text-gray-700 group-hover:text-royal">{filter}</span>
                     <ArrowRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                   </button>
                 ))}
               </div>
            </div>
          </section>
        )}

        {/* --- 5. Student Feedback --- */}
        <section className="py-16 bg-[#f5f7ff]">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Student Feedback
              </h2>
              <p className="mt-2 text-lg text-gray-500">
                Hear from students who cracked their exams with us.
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

// --- Custom Quick Access Card Component ---
interface QuickAccessCardProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  theme: 'red' | 'yellow' | 'green' | 'blue';
  onClick: () => void;
}

const QuickAccessCard = ({ title, subtitle, icon: Icon, theme, onClick }: QuickAccessCardProps) => {
  // Theme configuration map
  const themes = {
    red: {
      bg: "bg-[#fff1f1]",
      border: "border-[#ffdcdc]",
      iconColor: "text-[#e74c3c]",
      watermarkColor: "text-[#e74c3c]"
    },
    yellow: {
      bg: "bg-[#fff9e6]",
      border: "border-[#ffecb3]",
      iconColor: "text-[#f39c12]",
      watermarkColor: "text-[#f39c12]"
    },
    green: {
      bg: "bg-[#effbf2]",
      border: "border-[#d4f2dc]",
      iconColor: "text-[#27ae60]",
      watermarkColor: "text-[#27ae60]"
    },
    blue: {
      bg: "bg-[#eef7ff]",
      border: "border-[#d6eaff]",
      iconColor: "text-[#3498db]",
      watermarkColor: "text-[#3498db]"
    }
  };

  const currentTheme = themes[theme];

  return (
    <div 
      onClick={onClick}
      className="relative pt-8 min-w-[260px] flex-1 cursor-pointer group transition-transform duration-300 hover:-translate-y-2"
    >
      {/* Overlapping Top Icon */}
      <div className="absolute top-0 left-6 w-14 h-14 bg-white rounded-full shadow-[0_6px_15px_rgba(0,0,0,0.1)] flex items-center justify-center z-10">
        <Icon className={`w-6 h-6 ${currentTheme.iconColor}`} />
      </div>

      {/* Main Card Body */}
      <div className={`relative h-full rounded-2xl p-6 pt-10 overflow-hidden border ${currentTheme.bg} ${currentTheme.border}`}>
        
        {/* Text Content */}
        <div className="relative z-10 flex flex-col h-full justify-center">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>

        {/* Right Chevron */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-800 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </div>

        {/* Watermark Icon */}
        <Icon 
          className={`absolute -bottom-4 -right-2 w-24 h-24 opacity-5 -rotate-12 pointer-events-none ${currentTheme.watermarkColor}`} 
        />
      </div>
    </div>
  );
};

export default Courses;
