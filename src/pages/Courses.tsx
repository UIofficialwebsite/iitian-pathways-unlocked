import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EmailPopup from "@/components/EmailPopup";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import CourseCardSkeleton from "@/components/courses/CourseCardSkeleton";
import CourseCard from "@/components/courses/CourseCard";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  StickyNote, 
  Newspaper, 
  CalendarDays, 
  ChevronRight,
  Home,
  Layers,
  GraduationCap,
  Sparkles,
  Atom,
  Stethoscope,
  ClipboardList,
  Clock
} from "lucide-react";

// Exam category configuration with added banner images to avoid hardcoding in JSX
const EXAM_CONFIG: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  bannerImage: string;
  gradient: string;
  accentColor: string;
  quickLinks: { title: string; subtitle: string; icon: React.ElementType; theme: 'red' | 'yellow' | 'green' | 'blue'; href: string }[];
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
      { title: "PDF Bank", subtitle: "JEE Digital Library", icon: FileText, theme: "red", href: "/exam-preparation/jee?tab=pyqs" },
      { title: "Notes", subtitle: "Chapter-wise Notes", icon: StickyNote, theme: "yellow", href: "/exam-preparation/jee?tab=notes" },
      { title: "Test Series", subtitle: "Practice Tests", icon: Newspaper, theme: "green", href: "/exam-preparation/jee?tab=tests" },
      { title: "Important Dates", subtitle: "Key Timelines", icon: CalendarDays, theme: "blue", href: "/exam-preparation/jee?tab=dates" },
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
      { title: "PDF Bank", subtitle: "NEET Digital Library", icon: FileText, theme: "red", href: "/exam-preparation/neet?tab=pyqs" },
      { title: "Notes", subtitle: "Subject Notes", icon: StickyNote, theme: "yellow", href: "/exam-preparation/neet?tab=notes" },
      { title: "Test Series", subtitle: "Mock Tests", icon: Newspaper, theme: "green", href: "/exam-preparation/neet?tab=tests" },
      { title: "Important Dates", subtitle: "Exam Schedule", icon: CalendarDays, theme: "blue", href: "/exam-preparation/neet?tab=dates" },
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
      { title: "Notes", subtitle: "Week-wise Notes", icon: StickyNote, theme: "yellow", href: "/exam-preparation/iitm-bs?tab=notes" },
      { title: "PYQs", subtitle: "Previous Papers", icon: ClipboardList, theme: "red", href: "/exam-preparation/iitm-bs?tab=pyqs" },
      { title: "Tools", subtitle: "Calculators", icon: Newspaper, theme: "green", href: "/iitm-tools" },
      { title: "Important Dates", subtitle: "Exam Schedule", icon: CalendarDays, theme: "blue", href: "/exam-preparation/iitm-bs?tab=dates" },
    ],
    subFilters: ["Foundation", "Diploma", "Degree", "Data Science", "Electronic Systems"],
  },
};

// Format display title
const formatCategoryTitle = (slug: string | undefined) => {
  if (!slug) return "All Courses";
  if (slug === "iitm-bs") return "IITM BS";
  return slug.toUpperCase();
};

const Courses = () => {
  const { examCategory } = useParams<{ examCategory?: string }>();
  const navigate = useNavigate();
  const { courses, contentLoading } = useBackend();
  
  // Secondary filter state - resets when exam category changes
  const [selectedSubFilter, setSelectedSubFilter] = useState<string | null>(null);
  
  // Reset sub-filter when category changes
  useEffect(() => {
    setSelectedSubFilter(null);
  }, [examCategory]);

  // Get config for current category
  const config = examCategory ? EXAM_CONFIG[examCategory] : null;
  const isExamSpecificPage = !!examCategory && !!config;

  // Filter courses by exam category
  const categoryCourses = useMemo(() => {
    if (!examCategory) return courses;
    return courses.filter(course => {
      const cat = course.exam_category?.toLowerCase().replace(/[\s_]/g, '-');
      return cat === examCategory || 
             course.exam_category?.toLowerCase() === examCategory.replace('-', ' ') ||
             course.exam_category?.toLowerCase() === examCategory.replace('-', '_');
    });
  }, [courses, examCategory]);

  // Get available sub-filters based on courses
  const availableSubFilters = useMemo(() => {
    if (!config) return [];
    const available = new Set<string>();
    
    categoryCourses.forEach(course => {
      const searchText = `${course.title} ${course.level || ''} ${course.branch || ''} ${course.course_type || ''}`.toLowerCase();
      config.subFilters.forEach((filter: string) => {
        if (searchText.includes(filter.toLowerCase())) {
          available.add(filter);
        }
      });
    });
    
    return Array.from(available).sort();
  }, [categoryCourses, config]);

  // Filter by secondary filter
  const filteredCourses = useMemo(() => {
    if (!selectedSubFilter) return categoryCourses;
    return categoryCourses.filter(course => {
      const searchText = `${course.title} ${course.level || ''} ${course.branch || ''} ${course.course_type || ''}`.toLowerCase();
      return searchText.includes(selectedSubFilter.toLowerCase());
    });
  }, [categoryCourses, selectedSubFilter]);

  // Group courses by type
  const groupedCourses = useMemo(() => {
    if (selectedSubFilter || !isExamSpecificPage) {
      return { "Available Batches": filteredCourses };
    }
    
    const groups: Record<string, typeof filteredCourses> = {};
    filteredCourses.forEach(course => {
      const type = course.course_type || "General";
      if (!groups[type]) groups[type] = [];
      groups[type].push(course);
    });
    
    return Object.keys(groups).length <= 1 ? { "Available Batches": filteredCourses } : groups;
  }, [filteredCourses, selectedSubFilter, isExamSpecificPage]);

  // Featured courses for current category
  const featuredCourses = useMemo(() => {
    const pool = isExamSpecificPage ? categoryCourses : courses;
    return pool.filter(c => c.bestseller || (c.students_enrolled && c.students_enrolled > 50)).slice(0, 3);
  }, [courses, categoryCourses, isExamSpecificPage]);

  // All exam categories for overview page
  const examCategories = [
    { id: "jee", ...EXAM_CONFIG.jee },
    { id: "neet", ...EXAM_CONFIG.neet },
    { id: "iitm-bs", ...EXAM_CONFIG["iitm-bs"] },
  ];

  const defaultBanner = "/lovable-uploads/uibanner.png";

  return (
    <>
      <NavBar />
      
      <main className="pt-16 min-h-screen bg-white">
        
        {/* === 1. BANNER SECTION (No alt text) === */}
        <section className="relative w-full h-[240px] md:h-[380px] overflow-hidden">
          <img 
            src={isExamSpecificPage ? (config.bannerImage || defaultBanner) : defaultBanner} 
            alt="" 
            className="w-full h-full object-cover"
          />
          {/* Subtle overlay for gradient categories */}
          {isExamSpecificPage && (
            <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent`} />
          )}
        </section>

        {/* === 2. WRITING SECTION (Below Banner) === */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <motion.div 
            key={examCategory || "overview"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="border-primary text-primary hover:bg-primary/5">
                {isExamSpecificPage ? (
                  <>
                    {React.createElement(config.icon, { className: "w-3 h-3 mr-1" })}
                    {config.title} Portal
                  </>
                ) : (
                  <>
                    <Layers className="w-3 h-3 mr-1" />
                    All Courses
                  </>
                )}
              </Badge>
              {isExamSpecificPage && (
                <Badge className="bg-primary text-primary-foreground border-none">
                  <Clock className="w-3 h-3 mr-1" />
                  Live Classes Available
                </Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-gray-900">
              {isExamSpecificPage ? (
                <>
                  {config.title}:
                  <span className="block text-primary">{config.subtitle}</span>
                </>
              ) : (
                <>
                  Master Your Exams
                  <span className="block text-primary">With Expert Guidance</span>
                </>
              )}
            </h1>

            <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-4xl">
              {isExamSpecificPage 
                ? config.description 
                : "Access premium batches, study materials, and expert guidance tailored for your academic success. Choose your exam category to get started."
              }
            </p>
          </motion.div>
        </section>

        {/* === 3. QUICK LINKS SECTION === */}
        {isExamSpecificPage && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Resources</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          </section>
        )}

        {/* === BREADCRUMB NAVIGATION === */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-gray-100">
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

        {/* === FEATURED BATCHES SECTION === */}
        {featuredCourses.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Featured Batches</h2>
                <p className="text-muted-foreground text-sm">
                  {isExamSpecificPage 
                    ? `Top rated ${formatCategoryTitle(examCategory)} courses`
                    : "Premium courses to accelerate your preparation"
                  }
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* === SECONDARY CONTEXTUAL FILTER === */}
        <AnimatePresence mode="wait">
          {isExamSpecificPage && availableSubFilters.length > 0 && (
            <motion.section 
              key={`filters-${examCategory}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50/50 rounded-2xl mb-8"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Filter by Level / Target</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSubFilter(null)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    !selectedSubFilter 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "bg-white border border-gray-200 text-gray-700 hover:border-primary/50"
                  }`}
                >
                  All Batches
                </button>
                {availableSubFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedSubFilter(prev => prev === filter ? null : filter)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedSubFilter === filter 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "bg-white border border-gray-200 text-gray-700 hover:border-primary/50"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* === COURSE LISTINGS (Grouped by type) === */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {contentLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
            </div>
          ) : (
            Object.entries(groupedCourses).map(([groupName, groupCourses]) => (
              <motion.div 
                key={groupName} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-16"
              >
                {Object.keys(groupedCourses).length > 1 && (
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-8 w-1.5 bg-primary rounded-full" />
                    <h3 className="text-2xl font-bold text-foreground">{groupName}</h3>
                    <Badge variant="secondary" className="font-semibold">
                      {groupCourses.length} {groupCourses.length === 1 ? 'Course' : 'Courses'}
                    </Badge>
                  </div>
                )}

                {groupCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupCourses.map((course, index) => (
                      <CourseCard course={course} index={index} key={course.id} />
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center bg-white rounded-2xl border-2 border-dashed border-gray-100">
                    <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Layers className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your filters or check back later.</p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </section>

        {/* === EXAM CATEGORY CARDS (Overview page only) === */}
        {!isExamSpecificPage && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">Browse by Exam Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {examCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/courses/category/${cat.id}`)}
                  className={`group relative overflow-hidden rounded-3xl p-8 text-left transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl bg-gradient-to-br ${cat.gradient}`}
                >
                  <div className="absolute top-4 right-4 w-24 h-24 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/30">
                      {React.createElement(cat.icon, { className: "w-8 h-8 text-white" })}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{cat.title}</h3>
                    <p className="text-white/80 text-sm mb-6 line-clamp-2">{cat.subtitle}</p>
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <span>Explore Courses</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* === TESTIMONIALS === */}
        <section className="py-20 bg-slate-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
                Student Success Stories
              </h2>
              <div className="w-20 h-1.5 bg-primary mx-auto mt-4 rounded-full" />
              <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
                Join thousands of students who have transformed their preparation with our expert-led programs.
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

// === Quick Access Card Component ===
interface QuickAccessCardProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  theme: 'red' | 'yellow' | 'green' | 'blue';
  onClick: () => void;
}

const QuickAccessCard = ({ title, subtitle, icon: Icon, theme, onClick }: QuickAccessCardProps) => {
  const themes = {
    red: { bg: "bg-red-50", border: "border-red-100", iconColor: "text-red-600", iconBg: "bg-red-100/50" },
    yellow: { bg: "bg-amber-50", border: "border-amber-100", iconColor: "text-amber-600", iconBg: "bg-amber-100/50" },
    green: { bg: "bg-emerald-50", border: "border-emerald-100", iconColor: "text-emerald-600", iconBg: "bg-emerald-100/50" },
    blue: { bg: "bg-blue-50", border: "border-blue-100", iconColor: "text-blue-600", iconBg: "bg-blue-100/50" },
  };

  const t = themes[theme];

  return (
    <button 
      onClick={onClick}
      className={`${t.bg} ${t.border} border-2 rounded-2xl p-4 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group bg-white`}
    >
      <div className="flex flex-col h-full">
        <div className={`${t.iconBg} p-2.5 rounded-xl w-fit mb-3 transition-transform group-hover:scale-110`}>
          <Icon className={`w-5 h-5 ${t.iconColor}`} />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm mb-1">{title}</h4>
          <p className="text-[10px] md:text-xs text-gray-500 font-medium leading-tight">{subtitle}</p>
        </div>
        <div className="mt-4 flex items-center text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-primary transition-colors">
          <span>Access</span>
          <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </button>
  );
};

export default Courses;
