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
  bannerImage: string; // Added field for banner images
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
    bannerImage: "/lovable-uploads/uibanner.png", // Example banner path
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
      config.subFilters.forEach(filter => {
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

  const featuredCourses = useMemo(() => {
    const pool = isExamSpecificPage ? categoryCourses : courses;
    return pool.filter(c => c.bestseller || (c.students_enrolled && c.students_enrolled > 50)).slice(0, 3);
  }, [courses, categoryCourses, isExamSpecificPage]);

  return (
    <>
      <NavBar />
      
      <main className="pt-16 min-h-screen bg-white">
        
        {/* === 1. BANNER SECTION (Image with no alt text) === */}
        <section className="w-full">
          <div className="w-full h-[250px] md:h-[400px] overflow-hidden bg-slate-200">
            <img 
              src={isExamSpecificPage ? config.bannerImage : "/lovable-uploads/uibanner.png"} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* === 2. WRITING SECTION (Below Banner) === */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <motion.div 
            key={examCategory || "overview"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="border-primary text-primary">
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
                <Badge className="bg-primary text-primary-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  Live Classes Available
                </Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
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
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Resources</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            </div>
          </section>
        )}

        {/* Breadcrumb Navigation */}
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

        {/* Featured Batches Section */}
        {featuredCourses.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Featured Batches</h2>
                <p className="text-muted-foreground text-sm">Top rated courses for your preparation</p>
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

        {/* Filters and Main Listings */}
        <AnimatePresence>
          {isExamSpecificPage && availableSubFilters.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-slate-50/50 rounded-2xl mb-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Filter by Target</h3>
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

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {contentLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      </main>

      <Footer />
      <EmailPopup />
    </>
  );
};

// Quick Access Card
const QuickAccessCard = ({ title, subtitle, icon: Icon, theme, onClick }: any) => {
  const themes = {
    red: "bg-red-50 border-red-100 text-red-600",
    yellow: "bg-amber-50 border-amber-100 text-amber-600",
    green: "bg-emerald-50 border-emerald-100 text-emerald-600",
    blue: "bg-blue-50 border-blue-100 text-blue-600",
  };
  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all hover:shadow-md text-left flex items-start gap-3 bg-white`}
    >
      <div className={`p-2 rounded-lg ${themes[theme as keyof typeof themes]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-bold text-sm text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </button>
  );
};

export default Courses;
