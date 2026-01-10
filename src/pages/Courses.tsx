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
  Atom,
  Stethoscope,
  GraduationCap,
  Monitor,
  LayoutList,
  BookOpen,
  Sparkles
} from "lucide-react";

// Exam category configuration preserved for dynamic content (Titles/Descriptions)
const EXAM_CONFIG: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  bannerImage: string;
  subFilters: string[];
}> = {
  jee: {
    title: "JEE 2026",
    subtitle: "Exam Dates, Syllabus & Preparation",
    description: "IIT JEE will be conducted in two sessions by NTA, followed by JEE Advanced organized by IIT Roorkee. The exam covers Class 11 and 12 Physics, Chemistry, and Mathematics. Access comprehensive study materials and expert guidance.",
    bannerImage: "/lovable-uploads/uibanner.png",
    subFilters: ["Class 11", "Class 12", "Dropper", "Target 2025", "Target 2026", "Crash Course"],
  },
  neet: {
    title: "NEET 2026",
    subtitle: "Exam Dates, Syllabus & Preparation",
    description: "NEET-UG is the single entrance exam for MBBS, BDS, and other medical courses in India. Master Biology, Physics, and Chemistry with our comprehensive preparation programs designed by top educators.",
    bannerImage: "/lovable-uploads/uibanner.png",
    subFilters: ["Class 11", "Class 12", "Dropper", "Repeater", "Target 2025", "Target 2026", "Crash Course"],
  },
  "iitm-bs": {
    title: "IITM BS Degree",
    subtitle: "Data Science & Electronic Systems",
    description: "The IIT Madras BS Degree in Data Science & Electronic Systems offers world-class education accessible to students nationwide. Access curated study materials, notes, and expert guidance for Foundation, Diploma, and Degree levels.",
    bannerImage: "/lovable-uploads/uibanner.png",
    subFilters: ["Foundation", "Diploma", "Degree", "Data Science", "Electronic Systems"],
  },
};

// Standardized Quick Links for all pages - pointing to Digital Library
const STANDARDIZED_QUICK_LINKS = [
  { title: "Syllabus", subtitle: "Course Syllabus", icon: LayoutList, theme: "blue" as const, href: "/digital-library" },
  { title: "PDF Bank", subtitle: "Access PDF Bank", icon: FileText, theme: "red" as const, href: "/digital-library" },
  { title: "Important Dates", subtitle: "Check Exam Dates", icon: Monitor, theme: "green" as const, href: "/digital-library" },
  { title: "News", subtitle: "Latest Updates", icon: BookOpen, theme: "cyan" as const, href: "/digital-library" },
];

const formatCategoryTitle = (slug: string | undefined) => {
  if (!slug) return "All Courses";
  if (slug === "iitm-bs") return "IITM BS";
  return slug.toUpperCase();
};

const Courses = () => {
  const { examCategory } = useParams<{ examCategory?: string }>();
  const navigate = useNavigate();
  const { courses, contentLoading } = useBackend();
  
  const [selectedSubFilter, setSelectedSubFilter] = useState<string | null>(null);
  
  useEffect(() => {
    setSelectedSubFilter(null);
  }, [examCategory]);

  const config = examCategory ? EXAM_CONFIG[examCategory] : null;
  const isExamSpecificPage = !!examCategory && !!config;

  // Logic Preserved: Filtering category courses
  const categoryCourses = useMemo(() => {
    if (!examCategory) return courses;
    return courses.filter(course => {
      const cat = course.exam_category?.toLowerCase().replace(/[\s_]/g, '-');
      return cat === examCategory || 
             course.exam_category?.toLowerCase() === examCategory.replace('-', ' ') ||
             course.exam_category?.toLowerCase() === examCategory.replace('-', '_');
    });
  }, [courses, examCategory]);

  // Logic Preserved: Available Sub-filters
  const availableSubFilters = useMemo(() => {
    if (!config) return [];
    const available = new Set<string>();
    categoryCourses.forEach(course => {
      const searchText = `${course.title} ${course.level || ''} ${course.branch || ''} ${course.course_type || ''}`.toLowerCase();
      config.subFilters.forEach((filter: string) => {
        if (searchText.includes(filter.toLowerCase())) available.add(filter);
      });
    });
    return Array.from(available).sort();
  }, [categoryCourses, config]);

  // Logic Preserved: Filtered courses based on sub-filter
  const filteredCourses = useMemo(() => {
    if (!selectedSubFilter) return categoryCourses;
    return categoryCourses.filter(course => {
      const searchText = `${course.title} ${course.level || ''} ${course.branch || ''} ${course.course_type || ''}`.toLowerCase();
      return searchText.includes(selectedSubFilter.toLowerCase());
    });
  }, [categoryCourses, selectedSubFilter]);

  // Logic Preserved: Grouping courses
  const groupedCourses = useMemo(() => {
    if (selectedSubFilter || !isExamSpecificPage) return { "Available Batches": filteredCourses };
    const groups: Record<string, typeof filteredCourses> = {};
    filteredCourses.forEach(course => {
      const type = course.course_type || "General";
      if (!groups[type]) groups[type] = [];
      groups[type].push(course);
    });
    return Object.keys(groups).length <= 1 ? { "Available Batches": filteredCourses } : groups;
  }, [filteredCourses, selectedSubFilter, isExamSpecificPage]);

  // Logic Preserved: Featured courses
  const featuredCourses = useMemo(() => {
    const pool = isExamSpecificPage ? categoryCourses : courses;
    return pool.filter(c => c.bestseller || (c.students_enrolled && c.students_enrolled > 50)).slice(0, 3);
  }, [courses, categoryCourses, isExamSpecificPage]);

  return (
    <div className="bg-white min-h-screen font-sans text-zinc-800 w-full">
      <NavBar />
      
      <main className="pt-16">
        
        {/* === BANNER SECTION === */}
        <section className="w-full relative">
          <div className="w-full h-[250px] md:h-[400px] overflow-hidden bg-slate-100">
            <img 
              src={isExamSpecificPage ? config.bannerImage : "/lovable-uploads/uibanner.png"} 
              alt="" 
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        </section>

        {/* === BREADCRUMB POSITION: Strictly below banner === */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-1 text-[13px] text-zinc-500">
            <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 opacity-50" />
            <Link to="/courses" className="hover:text-primary transition-colors">
              Courses
            </Link>
            {isExamSpecificPage && (
              <>
                <ChevronRight className="w-4 h-4 opacity-50" />
                <span className="font-medium text-zinc-900">{formatCategoryTitle(examCategory)}</span>
              </>
            )}
          </div>
        </nav>

        {/* === TITLE & DESCRIPTION SECTION === */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <div className="space-y-3">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-zinc-900 leading-tight">
              {isExamSpecificPage ? (
                <>{config.title}: <span className="text-primary">{config.subtitle}</span></>
              ) : (
                <>Master Your Exams <span className="text-primary">With Expert Guidance</span></>
              )}
            </h1>
            <p className="text-zinc-600 text-sm md:text-base leading-relaxed max-w-5xl">
              {isExamSpecificPage ? config.description : "Access premium batches, study materials, and expert guidance tailored for academic success."}
            </p>
          </div>
        </section>

        {/* === QUICK LINKS SECTION: point to digital library for all === */}
        {isExamSpecificPage && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STANDARDIZED_QUICK_LINKS.map((link, idx) => (
                <QuickLinkCard 
                  key={idx}
                  {...link}
                  onClick={() => navigate(link.href)}
                />
              ))}
            </div>
          </section>
        )}

        {/* === CONTENT LISTING SECTION === */}
        <div className="bg-white pb-24">
          
          {/* Featured Courses Section */}
          {featuredCourses.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-zinc-50">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">Featured Batches</h2>
                  <p className="text-zinc-500 text-xs">Top rated courses for your preparation</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {contentLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)
                ) : (
                  featuredCourses.map((course, index) => (
                    <CourseCard course={course} index={index} key={course.id} />
                  ))
                )}
              </div>
            </section>
          )}

          {/* Dynamic Sub-Filters */}
          <AnimatePresence>
            {isExamSpecificPage && availableSubFilters.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sticky top-[80px] z-10 bg-white/80 backdrop-blur-md">
                <div className="flex flex-wrap gap-2 pb-2">
                  <button
                    onClick={() => setSelectedSubFilter(null)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      !selectedSubFilter ? "bg-primary text-white shadow-md" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    All Batches
                  </button>
                  {availableSubFilters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedSubFilter(prev => prev === filter ? null : filter)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        selectedSubFilter === filter ? "bg-primary text-white shadow-md" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </AnimatePresence>

          {/* Main Batches Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {contentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
              </div>
            ) : (
              Object.entries(groupedCourses).map(([groupName, groupCourses]) => (
                <div key={groupName} className="mb-12 last:mb-0">
                  {Object.keys(groupedCourses).length > 1 && (
                    <div className="flex items-center justify-between mb-6 border-b border-zinc-100 pb-4">
                      <h3 className="text-lg font-bold text-zinc-900">{groupName}</h3>
                      <button className="text-primary text-xs font-bold hover:underline">View All →</button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {groupCourses.map((course, index) => (
                      <CourseCard course={course} index={index} key={course.id} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Testimonials */}
          <section className="py-20 bg-zinc-50/50 mt-12 border-t border-zinc-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-2xl font-bold mb-4 text-zinc-900">Student Success Stories</h2>
              <p className="text-zinc-500 text-sm mb-12">Hear from those who achieved their goals with us</p>
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

// Reusable Quick Link Card (Physics Wallah UI style)
const QuickLinkCard = ({ title, subtitle, icon: Icon, theme, onClick }: any) => {
  const themes = {
    blue: "bg-[#EEF4FF] border-[#E0EAFF]",
    red: "bg-[#FEF3F2] border-[#FEE4E2]",
    green: "bg-[#EDFCF2] border-[#D3F8DF]",
    cyan: "bg-[#EFF8FF] border-[#D1E9FF]",
  };
  const iconColors = {
    blue: "text-blue-600",
    red: "text-red-600",
    green: "text-emerald-600",
    cyan: "text-sky-600",
  };

  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-lg active:scale-[0.98] group bg-white ${themes[theme as keyof typeof themes]}`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-white shadow-sm`}>
          <Icon className={`w-6 h-6 ${iconColors[theme as keyof typeof iconColors]}`} />
        </div>
        <div className="text-left">
          <h4 className="text-sm font-bold text-zinc-900 leading-tight">{title}</h4>
          <p className="text-[11px] text-zinc-500 font-medium">{subtitle}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
    </button>
  );
};

export default Courses;
