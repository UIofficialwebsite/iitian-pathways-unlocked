import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EmailPopup from "@/components/EmailPopup";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import CourseCardSkeleton from "@/components/courses/CourseCardSkeleton";
import CourseCard from "@/components/courses/CourseCard";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  ChevronRight,
  Home,
  Monitor,
  LayoutList,
  BookOpen,
  Sparkles
} from "lucide-react";

const Courses = () => {
  const { examCategory } = useParams<{ examCategory?: string }>();
  const navigate = useNavigate();
  const { courses, contentLoading } = useBackend();
  const [selectedSubFilter, setSelectedSubFilter] = useState<string | null>(null);
  
  useEffect(() => {
    setSelectedSubFilter(null);
  }, [examCategory]);

  // 1. DYNAMIC CATEGORY FILTERING (No Hardcoding)
  const categoryCourses = useMemo(() => {
    if (!examCategory) return courses;
    return courses.filter(course => {
      const normalizedDataCat = course.exam_category?.toLowerCase().replace(/[\s_]/g, '-');
      const normalizedUrlCat = examCategory.toLowerCase();
      return normalizedDataCat === normalizedUrlCat;
    });
  }, [courses, examCategory]);

  // 2. DYNAMIC SUB-FILTER EXTRACTION (Derives Class 11, Dropper, etc. from data)
  const availableSubFilters = useMemo(() => {
    const filters = new Set<string>();
    categoryCourses.forEach(course => {
      if (course.level) filters.add(course.level);
      if (course.course_type && course.course_type !== "General") filters.add(course.course_type);
    });
    return Array.from(filters).sort();
  }, [categoryCourses]);

  // 3. DYNAMIC DATA FILTERING
  const filteredCourses = useMemo(() => {
    if (!selectedSubFilter) return categoryCourses;
    return categoryCourses.filter(course => 
      course.level === selectedSubFilter || course.course_type === selectedSubFilter
    );
  }, [categoryCourses, selectedSubFilter]);

  // 4. DYNAMIC GROUPING (Preserved original functionality)
  const groupedCourses = useMemo(() => {
    if (selectedSubFilter || !examCategory) return { "Available Batches": filteredCourses };
    const groups: Record<string, typeof filteredCourses> = {};
    filteredCourses.forEach(course => {
      const type = course.course_type || "General";
      if (!groups[type]) groups[type] = [];
      groups[type].push(course);
    });
    return Object.keys(groups).length <= 1 ? { "Available Batches": filteredCourses } : groups;
  }, [filteredCourses, selectedSubFilter, examCategory]);

  const featuredCourses = useMemo(() => {
    return categoryCourses.filter(c => c.bestseller || (c.students_enrolled && c.students_enrolled > 50)).slice(0, 3);
  }, [categoryCourses]);

  // Standard Quick Links for all pages
  const quickLinks = [
    { title: "Syllabus", subtitle: "Course Syllabus", icon: LayoutList, theme: "blue" },
    { title: "PDF Bank", subtitle: "Access PDF Bank", icon: FileText, theme: "red" },
    { title: "Important Dates", subtitle: "Check Exam Dates", icon: Monitor, theme: "green" },
    { title: "News", subtitle: "Latest Updates", icon: BookOpen, theme: "cyan" },
  ];

  return (
    <div className="bg-white min-h-screen font-sans text-zinc-800 w-full">
      <NavBar />
      
      <main className="pt-16">
        {/* === BANNER SECTION (PW Size Alignment) === */}
        <section className="w-full">
          <div className="w-full h-[220px] md:h-[380px] lg:h-[450px] overflow-hidden bg-zinc-100">
            <img 
              src="/lovable-uploads/uibanner.png" 
              alt="Banner" 
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        </section>

        {/* === BREADCRUMB POSITION: Strictly below banner inside container === */}
        <nav className="max-w-7xl mx-auto px-4 md:px-8 py-5">
          <div className="flex items-center gap-1 text-[13px] text-zinc-500">
            <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 opacity-40" />
            <Link to="/courses" className="hover:text-primary">Courses</Link>
            {examCategory && (
              <>
                <ChevronRight className="w-4 h-4 opacity-40" />
                <span className="font-semibold text-zinc-900 capitalize">{examCategory.replace(/-/g, ' ')}</span>
              </>
            )}
          </div>
        </nav>

        {/* === WRITING SECTION (Ditto Alignment) === */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-8">
          <h1 className="text-2xl md:text-4xl font-extrabold text-zinc-900 mb-4 uppercase tracking-tight">
            {examCategory ? `${examCategory.replace(/-/g, ' ')} Preparation` : "All Premium Courses"}
          </h1>
          <p className="text-zinc-600 text-sm md:text-base leading-relaxed max-w-5xl">
            Access world-class study materials, live batches, and expert-led curriculum designed to help you ace your exams. 
            Join thousands of students on their journey to success with Unknown IITians.
          </p>
        </section>

        {/* === QUICK LINKS: Uniform for all pages, leading to Digital Library === */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, idx) => (
              <button 
                key={idx}
                onClick={() => navigate('/digital-library')}
                className="flex items-center justify-between p-5 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all bg-white group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    link.theme === 'blue' ? 'bg-blue-50 text-blue-600' :
                    link.theme === 'red' ? 'bg-red-50 text-red-600' :
                    link.theme === 'green' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-sky-50 text-sky-600'
                  }`}>
                    <link.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">{link.title}</h4>
                    <p className="text-[11px] text-zinc-500 font-medium">{link.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
              </button>
            ))}
          </div>
        </section>

        {/* === COURSES GRID (100% Zoomness) === */}
        <div className="bg-white pb-24">
          <section className="max-w-7xl mx-auto px-4 md:px-8">
            {/* Featured Batches Section */}
            {featuredCourses.length > 0 && (
              <div className="mt-12 mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold">Featured Batches</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {contentLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)
                  ) : (
                    featuredCourses.map((course, index) => (
                      <CourseCard course={course} index={index} key={course.id} />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Dynamic Sub-Filters Bar (Class 11, 12, etc.) */}
            {availableSubFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10 py-4 border-y border-zinc-50 sticky top-[64px] bg-white/90 backdrop-blur-sm z-20">
                <button
                  onClick={() => setSelectedSubFilter(null)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                    !selectedSubFilter ? "bg-primary text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  All Batches
                </button>
                {availableSubFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedSubFilter(prev => prev === filter ? null : filter)}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                      selectedSubFilter === filter ? "bg-primary text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}

            {/* Main Listing */}
            {contentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
              </div>
            ) : (
              Object.entries(groupedCourses).map(([groupName, groupCourses]) => (
                <div key={groupName} className="mb-16 last:mb-0">
                  <div className="flex items-center justify-between mb-8 border-b border-zinc-100 pb-4">
                    <h3 className="text-xl font-bold text-zinc-900">{groupName}</h3>
                    <button className="text-primary text-xs font-bold hover:underline">View All →</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {groupCourses.map((course, index) => (
                      <CourseCard course={course} index={index} key={course.id} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Success Stories Section */}
          <section className="py-24 bg-zinc-50/50 mt-20 border-t border-zinc-100">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Student Success Stories</h2>
              <p className="text-zinc-500 text-sm mb-16">Hear from those who achieved their goals with us</p>
              <StaggerTestimonials />
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <EmailPopup />
    </div>
  );
};

export default Courses;
