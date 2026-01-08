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
  BookOpen,
  GraduationCap,
  Sparkles,
  Atom,
  Stethoscope,
  ClipboardList,
  Clock
} from "lucide-react";

// Exam category configuration
const EXAM_CONFIG: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
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
      config.subFilters.forEach(filter => {
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

  return (
    <>
      <NavBar />
      
      <main className="pt-16 min-h-screen bg-gradient-to-b from-slate-50 to-white">
        
        {/* === HERO BANNER (No gap from navbar) === */}
        <section 
          key={examCategory || "all"} 
          className={`relative w-full min-h-[360px] md:min-h-[440px] overflow-hidden ${
            isExamSpecificPage 
              ? `bg-gradient-to-br ${config.gradient}` 
              : "bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800"
          }`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          {/* Gradient Orbs */}
          <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-black/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              
              {/* Left Side - Title & Description */}
              <motion.div 
                key={examCategory || "overview"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-white space-y-6"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30">
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
                    <Badge className="bg-white/90 text-gray-900 border-white animate-pulse">
                      <Clock className="w-3 h-3 mr-1" />
                      Live Classes Available
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                  {isExamSpecificPage ? (
                    <>
                      {config.title}:
                      <span className="block text-white/80">{config.subtitle}</span>
                    </>
                  ) : (
                    <>
                      Master Your Exams
                      <span className="block text-white/80">With Expert Guidance</span>
                    </>
                  )}
                </h1>

                <p className="text-white/90 text-base md:text-lg leading-relaxed max-w-xl">
                  {isExamSpecificPage 
                    ? config.description 
                    : "Access premium batches, study materials, and expert guidance tailored for your academic success. Choose your exam category to get started."
                  }
                </p>
              </motion.div>

              {/* Right Side - Quick Access Cards (Desktop) */}
              {isExamSpecificPage && (
                <motion.div 
                  key={`quick-${examCategory}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="hidden lg:grid grid-cols-2 gap-4"
                >
                  {config.quickLinks.map((link, idx) => (
                    <QuickAccessCard 
                      key={idx}
                      title={link.title} 
                      subtitle={link.subtitle}
                      icon={link.icon}
                      theme={link.theme}
                      onClick={() => navigate(link.href)}
                    />
                  ))}
                </motion.div>
              )}

              {/* Overview page - Exam category cards */}
              {!isExamSpecificPage && (
                <div className="hidden lg:grid grid-cols-1 gap-4">
                  {examCategories.slice(0, 3).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => navigate(`/courses/category/${cat.id}`)}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-left transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] group flex items-center gap-4"
                    >
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        {React.createElement(cat.icon, { className: "w-6 h-6 text-white" })}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{cat.title}</h4>
                        <p className="text-sm text-white/70">{cat.subtitle}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/50 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* === MOBILE QUICK ACCESS (Exam-specific only) === */}
        {isExamSpecificPage && (
          <section className="lg:hidden -mt-6 relative z-20 px-4 mb-6">
            <motion.div 
              key={`mobile-quick-${examCategory}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-4 gap-2"
            >
              {config.quickLinks.map((link, idx) => (
                <QuickAccessCardMobile 
                  key={idx}
                  icon={link.icon} 
                  title={link.title.split(' ')[0]} 
                  theme={link.theme} 
                  onClick={() => navigate(link.href)} 
                />
              ))}
            </motion.div>
          </section>
        )}

        {/* === BREADCRUMB NAVIGATION === */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
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
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-border">
            <div className="flex items-center gap-3 mb-6">
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

        {/* === SECONDARY CONTEXTUAL FILTER (Exam-specific only) === */}
        <AnimatePresence mode="wait">
          {isExamSpecificPage && availableSubFilters.length > 0 && (
            <motion.section 
              key={`filters-${examCategory}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Filter by Level / Target</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSubFilter(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    !selectedSubFilter 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  All
                </button>
                {availableSubFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedSubFilter(prev => prev === filter ? null : filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedSubFilter === filter 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
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
                className="mb-12"
              >
                {Object.keys(groupedCourses).length > 1 && (
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-1 bg-primary rounded-full" />
                    <h3 className="text-xl font-bold text-foreground">{groupName}</h3>
                    <Badge variant="secondary">
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
                  <div className="py-16 text-center bg-card rounded-2xl border border-dashed border-border">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Layers className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">No courses found</h3>
                    <p className="text-muted-foreground mt-1">Try adjusting your filters or check back later.</p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </section>

        {/* === EXAM CATEGORY CARDS (Overview page only) === */}
        {!isExamSpecificPage && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-foreground mb-8">Browse by Exam Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {examCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/courses/category/${cat.id}`)}
                  className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl bg-gradient-to-br ${cat.gradient}`}
                >
                  <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                      {React.createElement(cat.icon, { className: "w-7 h-7 text-white" })}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{cat.title}</h3>
                    <p className="text-white/80 text-sm mb-4">{cat.subtitle}</p>
                    <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
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
        <section className="py-16 bg-gradient-to-b from-background to-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Student Success Stories
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">
                Hear from students who achieved their goals with us.
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

// === Quick Access Card (Desktop) ===
interface QuickAccessCardProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  theme: 'red' | 'yellow' | 'green' | 'blue';
  onClick: () => void;
}

const QuickAccessCard = ({ title, subtitle, icon: Icon, theme, onClick }: QuickAccessCardProps) => {
  const themes = {
    red: { bg: "bg-red-50/90", border: "border-red-200/50", iconColor: "text-red-500", iconBg: "bg-red-100" },
    yellow: { bg: "bg-amber-50/90", border: "border-amber-200/50", iconColor: "text-amber-500", iconBg: "bg-amber-100" },
    green: { bg: "bg-emerald-50/90", border: "border-emerald-200/50", iconColor: "text-emerald-500", iconBg: "bg-emerald-100" },
    blue: { bg: "bg-blue-50/90", border: "border-blue-200/50", iconColor: "text-blue-500", iconBg: "bg-blue-100" },
  };

  const t = themes[theme];

  return (
    <button 
      onClick={onClick}
      className={`${t.bg} ${t.border} backdrop-blur-sm border rounded-xl p-4 text-left transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
    >
      <div className="flex items-center gap-3">
        <div className={`${t.iconBg} p-2 rounded-lg`}>
          <Icon className={`w-5 h-5 ${t.iconColor}`} />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
          <p className="text-xs text-gray-600">{subtitle}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

// === Quick Access Card (Mobile) ===
interface QuickAccessCardMobileProps {
  title: string;
  icon: React.ElementType;
  theme: 'red' | 'yellow' | 'green' | 'blue';
  onClick: () => void;
}

const QuickAccessCardMobile = ({ title, icon: Icon, theme, onClick }: QuickAccessCardMobileProps) => {
  const themes = {
    red: { bg: "bg-red-50", iconColor: "text-red-500" },
    yellow: { bg: "bg-amber-50", iconColor: "text-amber-500" },
    green: { bg: "bg-emerald-50", iconColor: "text-emerald-500" },
    blue: { bg: "bg-blue-50", iconColor: "text-blue-500" },
  };

  const t = themes[theme];

  return (
    <button 
      onClick={onClick}
      className={`${t.bg} rounded-xl p-3 flex flex-col items-center gap-1 shadow-sm hover:shadow-md transition-all text-center`}
    >
      <Icon className={`w-5 h-5 ${t.iconColor}`} />
      <span className="text-xs font-medium text-gray-700">{title}</span>
    </button>
  );
};

export default Courses;
