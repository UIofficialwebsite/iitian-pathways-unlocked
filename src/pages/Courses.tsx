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
  BookOpen
} from "lucide-react";

// Exam category configuration with standardized links to Digital Library
const EXAM_CONFIG: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  bannerImage: string;
  gradient: string;
  accentColor: string;
  quickLinks: { title: string; subtitle: string; icon: React.ElementType; theme: 'blue' | 'red' | 'green' | 'cyan'; href: string }[];
  subFilters: string[];
}> = {
  jee: {
    title: "JEE 2026",
    subtitle: "Exam Dates, Syllabus & Preparation",
    description: "IIT JEE will be conducted in two sessions by NTA, followed by JEE Advanced organized by IIT Roorkee. The exam covers Class 11 and 12 Physics, Chemistry, and Mathematics. Access comprehensive study materials and expert guidance.",
    icon: Atom,
    bannerImage: "/lovable-uploads/uibanner.png",
    gradient: "from-orange-600 via-amber-600 to-yellow-500",
    accentColor: "orange",
    quickLinks: [
      { title: "Syllabus", subtitle: "Check Exam Syllabus", icon: LayoutList, theme: "blue", href: "/digital-library" },
      { title: "PDF Bank", subtitle: "Access PDF Bank", icon: FileText, theme: "red", href: "/digital-library" },
      { title: "Important Dates", subtitle: "Check Exam Dates", icon: Monitor, theme: "green", href: "/digital-library" },
      { title: "News", subtitle: "Latest Exam News", icon: BookOpen, theme: "cyan", href: "/digital-library" },
    ],
    subFilters: ["Class 11", "Class 12", "Dropper", "Target 2025", "Target 2026", "Crash Course"],
  },
  neet: {
    title: "NEET 2026",
    subtitle: "Exam Dates, Syllabus & Preparation",
    description: "NEET-UG is the single entrance exam for MBBS, BDS, and other medical courses in India. Master Biology, Physics, and Chemistry with our comprehensive preparation programs designed by top educators.",
    icon: Stethoscope,
    bannerImage: "/lovable-uploads/uibanner.png",
    gradient: "from-rose-600 via-red-600 to-pink-500",
    accentColor: "red",
    quickLinks: [
      { title: "Syllabus", subtitle: "Check Exam Syllabus", icon: LayoutList, theme: "blue", href: "/digital-library" },
      { title: "PDF Bank", subtitle: "Access PDF Bank", icon: FileText, theme: "red", href: "/digital-library" },
      { title: "Important Dates", subtitle: "Check Exam Dates", icon: Monitor, theme: "green", href: "/digital-library" },
      { title: "News", subtitle: "Latest Exam News", icon: BookOpen, theme: "cyan", href: "/digital-library" },
    ],
    subFilters: ["Class 11", "Class 12", "Dropper", "Repeater", "Target 2025", "Target 2026", "Crash Course"],
  },
  "iitm-bs": {
    title: "IITM BS Degree",
    subtitle: "Data Science & Electronic Systems",
    description: "The IIT Madras BS Degree in Data Science & Electronic Systems offers world-class education accessible to students nationwide. Access curated study materials, notes, and expert guidance for Foundation, Diploma, and Degree levels.",
    icon: GraduationCap,
    bannerImage: "/lovable-uploads/uibanner.png",
    gradient: "from-emerald-600 via-teal-600 to-cyan-500",
    accentColor: "emerald",
    quickLinks: [
      { title: "Syllabus", subtitle: "Check Exam Syllabus", icon: LayoutList, theme: "blue", href: "/digital-library" },
      { title: "PDF Bank", subtitle: "Access PDF Bank", icon: FileText, theme: "red", href: "/digital-library" },
      { title: "Important Dates", subtitle: "Check Exam Dates", icon: Monitor, theme: "green", href: "/digital-library" },
      { title: "News", subtitle: "Latest Exam News", icon: BookOpen, theme: "cyan", href: "/digital-library" },
    ],
    subFilters: ["Foundation", "Diploma", "Degree", "Data Science", "Electronic Systems"],
  },
};

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
    <>
      <NavBar />
      
      <main className="pt-16 min-h-screen bg-white font-sans">
        
        {/* === 1. BANNER SECTION === */}
        <section className="w-full">
          <div className="w-full h-[250px] md:h-[400px] overflow-hidden bg-slate-200">
            <img 
              src={isExamSpecificPage ? config.bannerImage : "/lovable-uploads/uibanner.png"} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* === 2. BREADCRUMB POSITION (Directly below banner) === */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/courses" className="hover:text-primary transition-colors">
              Courses
            </Link>
            {isExamSpecificPage && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="font-medium text-foreground">{formatCategoryTitle(examCategory)}</span>
              </>
            )}
          </div>
        </nav>

        {/* === 3. WRITING SECTION === */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-8">
          <motion.div 
            key={examCategory || "overview"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111827]">
              {isExamSpecificPage ? (
                <>
                  {config.title}: <span className="text-primary">{config.subtitle}</span>
                </>
              ) : (
                <>
                  Master Your Exams <span className="text-primary">With Expert Guidance</span>
                </>
              )}
            </h1>

            <p className="text-[#4b5563] text-base md:text-lg leading-relaxed max-w-4xl">
              {isExamSpecificPage 
                ? config.description 
                : "Access premium batches, study materials, and expert guidance tailored for your academic success."
              }
            </p>
          </motion.div>
        </section>

        {/* === 4. QUICK LINKS SECTION === */}
        {isExamSpecificPage && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[40px] md:py-[60px]">
            <div className="bg-white p-6 md:p-[60px_40px_40px_40px] rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-[50px] lg:gap-y-5">
                {config.quickLinks.map((link: any, idx: number) => (
                  <QuickAccessCard 
                    key={idx}
                    title={link.title} 
                    subtitle={link.subtitle}
                    icon={link.icon}
                    theme={link.theme}
                    onClick={() => navigate(link.href)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* === BATCHES SECTION === */}
        <div className="bg-white pb-20">
          {/* Featured Batches */}
          {featuredCourses.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Monitor className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Featured Batches</h2>
                  <p className="text-muted-foreground text-sm">Top rated courses for your preparation</p>
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

          {/* Sub Filters */}
          <AnimatePresence>
            {isExamSpecificPage && availableSubFilters.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-8">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSubFilter(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      !selectedSubFilter ? "bg-primary text-white shadow-md" : "bg-white border border-gray-200 hover:border-primary"
                    }`}
                  >
                    All Batches
                  </button>
                  {availableSubFilters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedSubFilter(prev => prev === filter ? null : filter)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedSubFilter === filter ? "bg-primary text-white shadow-md" : "bg-white border border-gray-200 hover:border-primary"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </AnimatePresence>

          {/* Main Course Listing */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {contentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
              </div>
            ) : (
              Object.entries(groupedCourses).map(([groupName, groupCourses]) => (
                <div key={groupName} className="mb-12">
                  {Object.keys(groupedCourses).length > 1 && (
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-6 w-1 bg-primary rounded-full" />
                      <h3 className="text-xl font-bold">{groupName}</h3>
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
          <section className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Student Success Stories</h2>
              <p className="text-muted-foreground mb-12">Hear from those who achieved their goals with us</p>
              <StaggerTestimonials />
            </div>
          </section>
        </div>

      </main>

      <Footer />
      <EmailPopup />
    </>
  );
};

// === Quick Access Card Component ===
interface QuickAccessCardProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  theme: 'blue' | 'red' | 'green' | 'cyan';
  onClick: () => void;
}

const QuickAccessCard = ({ title, subtitle, icon: Icon, theme, onClick }: QuickAccessCardProps) => {
  const themes = {
    blue: { bg: "bg-[#e8f0fe]", iconColor: "text-[#3b82f6]" },
    red: { bg: "bg-[#fef0f0]", iconColor: "text-[#ef4444]" },
    green: { bg: "bg-[#e7f9ee]", iconColor: "text-[#22c55e]" },
    cyan: { bg: "bg-[#e8f4ff]", iconColor: "text-[#0ea5e9]" },
  };
  const t = themes[theme];

  return (
    <button 
      onClick={onClick}
      className={`relative h-[180px] rounded-[15px] p-[30px] flex flex-col justify-center border-2 border-transparent transition-all duration-200 hover:border-black overflow-visible ${t.bg} w-full text-left group`}
    >
      <div className="absolute -top-[30px] left-[25px] w-[60px] h-[60px] bg-white rounded-full flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.08)] z-10">
        <Icon className={`w-7 h-7 ${t.iconColor}`} />
      </div>
      <h3 className="text-[#111827] text-[1.3rem] font-bold mb-[10px] mt-[10px]">{title}</h3>
      <p className="text-[#4b5563] text-[0.95rem] font-normal leading-tight">{subtitle}</p>
      <ChevronRight className="absolute right-[25px] top-1/2 -translate-y-1/2 text-[#111827] w-5 h-5" />
    </button>
  );
};

export default Courses;
