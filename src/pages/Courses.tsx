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
  BookOpen,
  Sparkles,
  ClipboardList
} from "lucide-react";

// Exam category configuration preserved for dynamic content
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

// Standardized Quick Links point to Digital Library as per "Ditto" snippet metadata
const STANDARDIZED_QUICK_LINKS = [
  { 
    title: "Syllabus", 
    subtitle: "Read Our Latest Blogs", 
    icon: Monitor, 
    cardClass: "bg-[#e8f0fe]", 
    iconColor: "text-[#4a6cf7]", 
    href: "/digital-library" 
  },
  { 
    title: "PDF Bank", 
    subtitle: "Access PDF Bank", 
    icon: FileText, 
    cardClass: "bg-[#feeceb]", 
    iconColor: "text-[#f43f5e]", 
    href: "/digital-library" 
  },
  { 
    title: "Important Dates", 
    subtitle: "Explore Test Series", 
    icon: ClipboardList, 
    cardClass: "bg-[#e1f7e7]", 
    iconColor: "text-[#4a6cf7]", 
    href: "/digital-library" 
  },
  { 
    title: "Latest News", 
    subtitle: "Find Preparation Books", 
    icon: BookOpen, 
    cardClass: "bg-[#e0f0ff]", 
    iconColor: "text-[#f43f5e]", 
    href: "/digital-library" 
  },
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

  const categoryCourses = useMemo(() => {
    if (!examCategory) return courses;
    return courses.filter(course => {
      const cat = course.exam_category?.toLowerCase().replace(/[\s_]/g, '-');
      return cat === examCategory || 
             course.exam_category?.toLowerCase() === examCategory.replace('-', ' ') ||
             course.exam_category?.toLowerCase() === examCategory.replace('-', '_');
    });
  }, [courses, examCategory]);

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

  const filteredCourses = useMemo(() => {
    if (!selectedSubFilter) return categoryCourses;
    return categoryCourses.filter(course => {
      const searchText = `${course.title} ${course.level || ''} ${course.branch || ''} ${course.course_type || ''}`.toLowerCase();
      return searchText.includes(selectedSubFilter.toLowerCase());
    });
  }, [categoryCourses, selectedSubFilter]);

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

  const featuredCourses = useMemo(() => {
    const pool = isExamSpecificPage ? categoryCourses : courses;
    return pool.filter(c => c.bestseller || (c.students_enrolled && c.students_enrolled > 50)).slice(0, 3);
  }, [courses, categoryCourses, isExamSpecificPage]);

  return (
    <div className="bg-white min-h-screen font-sans text-zinc-800 w-full overflow-x-hidden">
      <NavBar />
      
      <main className="pt-16">
        
        {/* === 1. BANNER SECTION (Precise height for 100% zoomness) === */}
        <section className="w-full relative">
          <div className="w-full h-[250px] md:h-[380px] lg:h-[450px] overflow-hidden bg-slate-100">
            <img 
              src={isExamSpecificPage ? config.bannerImage : "/lovable-uploads/uibanner.png"} 
              alt="" 
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        </section>

        {/* === 2. BREADCRUMBS: Positioned below banner as requested === */}
        <nav className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-1 text-xs md:text-sm text-zinc-500">
            <Link to="/" className="flex items-center gap-1 hover:text-primary">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 opacity-40" />
            <Link to="/courses" className="hover:text-primary">Courses</Link>
            {isExamSpecificPage && (
              <>
                <ChevronRight className="w-4 h-4 opacity-40" />
                <span className="font-semibold text-zinc-900">{formatCategoryTitle(examCategory)}</span>
              </>
            )}
          </div>
        </nav>

        {/* === 3. HEADER CONTENT === */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-8">
          <h1 className="text-2xl md:text-5xl font-bold text-zinc-900 mb-4 tracking-tight">
            {isExamSpecificPage ? (
              <>{config.title}: <span className="text-primary">{config.subtitle}</span></>
            ) : (
              <>Master Your Exams <span className="text-primary">With Expert Guidance</span></>
            )}
          </h1>
          <p className="text-zinc-600 text-sm md:text-lg leading-relaxed max-w-5xl">
            {isExamSpecificPage ? config.description : "Access premium batches and curated study materials tailored for academic success."}
          </p>
        </section>

        {/* === 4. QUICK LINKS SECTION: Ditto Design Implementation === */}
        {isExamSpecificPage && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-[15px] gap-y-[45px]">
              {STANDARDIZED_QUICK_LINKS.map((link, idx) => (
                <DittoQuickLinkCard 
                  key={idx}
                  {...link}
                  onClick={() => navigate(link.href)}
                />
              ))}
            </div>
          </section>
        )}

        {/* === 5. COURSES LISTING SECTION === */}
        <div className="bg-white pb-24">
          
          {/* Featured Courses */}
          {featuredCourses.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Featured Batches</h2>
                  <p className="text-zinc-500 text-sm font-medium">Top rated courses for your preparation</p>
                </div>
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
            </section>
          )}

          {/* Sub-Filters Tabs */}
          <AnimatePresence>
            {isExamSpecificPage && availableSubFilters.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 md:px-8 py-6 sticky top-[80px] z-20 bg-white/95 backdrop-blur-sm border-y border-zinc-100 mb-8">
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setSelectedSubFilter(null)}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                      !selectedSubFilter ? "bg-primary border-primary text-white shadow-md" : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400"
                    }`}
                  >
                    All Batches
                  </button>
                  {availableSubFilters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedSubFilter(prev => prev === filter ? null : filter)}
                      className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                        selectedSubFilter === filter ? "bg-primary border-primary text-white shadow-md" : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </AnimatePresence>

          {/* Main Grid */}
          <section className="max-w-7xl mx-auto px-4 md:px-8">
            {contentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
              </div>
            ) : (
              Object.entries(groupedCourses).map(([groupName, groupCourses]) => (
                <div key={groupName} className="mb-16 last:mb-0">
                  {Object.keys(groupedCourses).length > 1 && (
                    <div className="flex items-center justify-between mb-8 border-b border-zinc-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-1.5 bg-primary rounded-full" />
                        <h3 className="text-xl md:text-2xl font-bold text-zinc-900">{groupName}</h3>
                      </div>
                      <button className="text-primary text-sm font-bold hover:underline">View All →</button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {groupCourses.map((course, index) => (
                      <CourseCard course={course} index={index} key={course.id} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Testimonials */}
          <section className="py-24 bg-zinc-50 border-t border-zinc-100 mt-20">
            <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
              <h2 className="text-3xl font-bold mb-4 text-zinc-900">Student Success Stories</h2>
              <p className="text-zinc-500 mb-16 text-lg">Hear from those who achieved their goals with us</p>
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

// Reusable Ditto Quick Link Card component
const DittoQuickLinkCard = ({ title, subtitle, icon: Icon, cardClass, iconColor, onClick }: any) => {
  return (
    <button 
      onClick={onClick}
      className={`relative h-[140px] rounded-[12px] p-5 flex flex-col justify-center border-2 border-transparent transition-all duration-200 hover:border-black overflow-visible text-left group ${cardClass}`}
    >
      {/* Absolute Icon Tab */}
      <div className="absolute top-[-24px] left-5 w-[50px] h-[50px] bg-white rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.1)] z-10 group-hover:shadow-lg transition-shadow">
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      
      {/* Text Content */}
      <h3 className="text-[#1a1a1a] text-[1.1rem] font-bold mb-[6px] mt-[10px]">
        {title}
      </h3>
      <p className="text-[#5f6368] text-[0.85rem] font-normal leading-snug">
        {subtitle}
      </p>
      
      {/* Right Chevron */}
      <ChevronRight className="absolute right-5 top-[55%] -translate-y-1/2 text-[#1a1a1a] w-[18px] h-[18px] opacity-30 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};

export default Courses;
