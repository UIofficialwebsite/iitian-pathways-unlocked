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
  ArrowRight,
  Filter,
  Layers
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
  const subCategoryFilters = useMemo(() => {
    const keywords = ["Class 11", "Class 12", "Dropper", "Crash Course", "Foundation", "Target 2025", "Target 2026"];
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
      
      {/* Main Content Wrapper - pt-16 ensures banner starts exactly after fixed navbar */}
      <main className="pt-16 min-h-screen bg-[#f5f7ff]">
        
        {/* --- 1. Hero Banner (Hanging from Nav) --- */}
        <section className="relative w-full h-[320px] md:h-[400px] overflow-hidden bg-gray-900">
          <HeroCarousel />
          {/* Dark Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-center pb-10">
             <div className="text-center text-white px-4 max-w-4xl mx-auto mt-8">
                <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-4 border border-white/10">
                  {categoryParam ? `${formatCategoryTitle(categoryParam)} Portal` : 'Course Portal'}
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-xl">
                  Master Your <span className="text-royal-light">{formatCategoryTitle(categoryParam)}</span> Prep
                </h1>
                <p className="text-gray-200 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                  Access premium batches, study materials, and expert guidance tailored for your success.
                </p>
             </div>
          </div>
        </section>

        {/* --- 2. Quick Access Tabs (Overlapping/Hanging Design) --- */}
        <section className="relative z-20 px-4 -mt-12 mb-16">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">
              
              {/* Grid for Tabs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                
                {/* PDF Bank (Red) */}
                <QuickAccessCard 
                  title="PDF Bank" 
                  subtitle="Digital Library"
                  icon={FileText}
                  theme="red"
                  onClick={() => navigate('/dashboard?tab=library')}
                />

                {/* Notes (Yellow) */}
                <QuickAccessCard 
                  title="Notes" 
                  subtitle="Chapter-wise Notes"
                  icon={StickyNote}
                  theme="yellow"
                  onClick={() => navigate('/notes')}
                />

                {/* News (Green) */}
                <QuickAccessCard 
                  title="News" 
                  subtitle="Exam Updates"
                  icon={Newspaper}
                  theme="green"
                  onClick={() => navigate('/news')}
                />

                {/* Important Dates (Blue) */}
                <QuickAccessCard 
                  title="Dates" 
                  subtitle="Key Timelines"
                  icon={CalendarDays}
                  theme="blue"
                  onClick={() => navigate('/important-dates')}
                />

              </div>
            </div>
          </div>
        </section>

        {/* --- 3. Featured Batches Section --- */}
        <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Featured Batches</h2>
                <p className="text-gray-500 mt-2">Top rated courses to accelerate your preparation</p>
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
                <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Layers className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No active batches found</h3>
                  <p className="text-gray-500 mt-1">We couldn't find any batches for this category right now.</p>
                </div>
              )}
           </div>
        </section>

        {/* --- 4. 2nd Level Filters (Explore by Target) --- */}
        {subCategoryFilters.length > 0 && (
          <section className="py-16 bg-white mt-12 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center mb-10">
                 <h2 className="text-2xl font-bold text-gray-900">Browse by Class & Target</h2>
                 <p className="text-gray-500 mt-2">Find the specific course that matches your current academic stage.</p>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                 {subCategoryFilters.map((filter) => (
                   <button
                     key={filter}
                     onClick={() => navigate(`/courses/search?category=${categoryParam}&q=${filter}`)}
                     className="relative p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-royal/30 hover:shadow-lg transition-all duration-300 group text-left flex flex-col justify-between h-32"
                   >
                     <div className="flex justify-between items-start">
                       <span className="font-semibold text-lg text-gray-800 group-hover:text-royal transition-colors">
                         {filter}
                       </span>
                       <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                         <ArrowRight className="w-4 h-4 text-royal" />
                       </div>
                     </div>
                     <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                       View Batches
                     </p>
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

// --- Custom Quick Access Card Component (Ditto Design) ---
interface QuickAccessCardProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  theme: 'red' | 'yellow' | 'green' | 'blue';
  onClick: () => void;
}

const QuickAccessCard = ({ title, subtitle, icon: Icon, theme, onClick }: QuickAccessCardProps) => {
  // Theme configuration matching the requested "Ditto" look
  const themes = {
    red: {
      bg: "bg-[#fff1f1]",
      border: "border-[#ffdcdc]",
      iconColor: "text-[#e74c3c]",
      iconBg: "bg-white",
      watermarkColor: "text-[#e74c3c]"
    },
    yellow: {
      bg: "bg-[#fff9e6]",
      border: "border-[#ffecb3]",
      iconColor: "text-[#f39c12]",
      iconBg: "bg-white",
      watermarkColor: "text-[#f39c12]"
    },
    green: {
      bg: "bg-[#effbf2]",
      border: "border-[#d4f2dc]",
      iconColor: "text-[#2ecc71]",
      iconBg: "bg-white",
      watermarkColor: "text-[#2ecc71]"
    },
    blue: {
      bg: "bg-[#eef7ff]",
      border: "border-[#d6eaff]",
      iconColor: "text-[#3498db]",
      iconBg: "bg-white",
      watermarkColor: "text-[#3498db]"
    }
  };

  const currentTheme = themes[theme];

  return (
    <div 
      onClick={onClick}
      className="relative group cursor-pointer mt-6 md:mt-0" // Margin top on mobile for spacing
    >
      {/* 1. The Hanging Icon (Centered on Top Border) */}
      <div className={`absolute top-0 left-8 -translate-y-1/2 w-14 h-14 rounded-full ${currentTheme.iconBg} shadow-lg flex items-center justify-center z-10 transition-transform group-hover:scale-110 duration-300`}>
        <Icon className={`w-6 h-6 ${currentTheme.iconColor}`} />
      </div>

      {/* 2. The Inner Card Content */}
      <div className={`pt-10 pb-6 px-6 rounded-2xl border ${currentTheme.border} ${currentTheme.bg} relative overflow-hidden h-full transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-lg`}>
        
        {/* Text */}
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>

        {/* Chevron */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-800 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </div>

        {/* Watermark Icon (Faded & Clipped) */}
        <Icon className={`absolute -bottom-3 -right-3 w-24 h-24 opacity-[0.08] -rotate-12 pointer-events-none ${currentTheme.watermarkColor}`} />
      </div>
    </div>
  );
};

export default Courses;
