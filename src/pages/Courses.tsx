import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
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
  MapPin
} from "lucide-react";

// Define exam categories
const EXAM_CATEGORIES = [
  { id: "all", name: "All Courses", icon: Layers },
  { id: "jee", name: "JEE", icon: GraduationCap },
  { id: "neet", name: "NEET", icon: BookOpen },
  { id: "iitm-bs", name: "IITM BS", icon: Sparkles },
];

// Helper to normalize category titles
const formatCategoryTitle = (param: string | null) => {
  if (!param || param === "all") return "All Courses";
  if (param === "iitm-bs") return "IITM BS";
  return param.toUpperCase();
};

// Get dynamic description based on category
const getCategoryDescription = (category: string | null) => {
  switch (category?.toLowerCase()) {
    case "jee":
      return "IIT JEE will be conducted in two sessions by NTA, followed by JEE Advanced organized by IIT Roorkee. The exam covers Class 11 and 12 Physics, Chemistry, and Mathematics.";
    case "neet":
      return "NEET-UG is the single entrance exam for MBBS, BDS, and other medical courses. Master Biology, Physics, and Chemistry with our comprehensive preparation programs.";
    case "iitm-bs":
      return "The IIT Madras BS Degree in Data Science & Electronic Systems offers world-class education. Access curated study materials and expert guidance for every level.";
    default:
      return "Access premium batches, study materials, and expert guidance tailored for your academic success. Choose your exam category to get started.";
  }
};

// Sub-category keywords for each exam type
const getSubCategoryKeywords = (category: string | null) => {
  switch (category?.toLowerCase()) {
    case "jee":
      return ["Class 11", "Class 12", "Dropper", "Crash Course", "Target 2025", "Target 2026"];
    case "neet":
      return ["Class 11", "Class 12", "Dropper", "Crash Course", "Repeater", "Target 2025", "Target 2026"];
    case "iitm-bs":
      return ["Foundation", "Diploma", "Degree", "Data Science", "Electronic Systems"];
    default:
      return [];
  }
};

const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { courses, contentLoading } = useBackend();
  
  // Primary category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  // Secondary filter state
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  // Sync with URL params
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Handle primary category change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory(null); // Reset secondary filter
    if (categoryId === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryId });
    }
  };

  // Handle secondary filter change
  const handleSubCategoryChange = (subCat: string) => {
    setSelectedSubCategory(prev => prev === subCat ? null : subCat);
  };

  // 1. Filter courses by primary category
  const filteredByCategory = useMemo(() => {
    if (selectedCategory === "all") return courses;
    return courses.filter(course => {
      const cat = course.exam_category?.toLowerCase();
      const param = selectedCategory.toLowerCase();
      if (param === "iitm-bs") return cat === "iitm bs" || cat === "iitm_bs" || cat === "iitm-bs";
      return cat === param;
    });
  }, [courses, selectedCategory]);

  // 2. Get available sub-categories based on current courses
  const availableSubCategories = useMemo(() => {
    if (selectedCategory === "all") return [];
    const keywords = getSubCategoryKeywords(selectedCategory);
    const available = new Set<string>();

    filteredByCategory.forEach(course => {
      const title = course.title.toLowerCase();
      const level = course.level?.toLowerCase() || "";
      const branch = course.branch?.toLowerCase() || "";
      
      keywords.forEach(key => {
        const keyLower = key.toLowerCase();
        if (title.includes(keyLower) || level.includes(keyLower) || branch.includes(keyLower)) {
          available.add(key);
        }
      });
    });

    return Array.from(available).sort();
  }, [filteredByCategory, selectedCategory]);

  // 3. Filter by secondary category
  const filteredCourses = useMemo(() => {
    if (!selectedSubCategory) return filteredByCategory;
    return filteredByCategory.filter(course => {
      const title = course.title.toLowerCase();
      const level = course.level?.toLowerCase() || "";
      const branch = course.branch?.toLowerCase() || "";
      const subCatLower = selectedSubCategory.toLowerCase();
      return title.includes(subCatLower) || level.includes(subCatLower) || branch.includes(subCatLower);
    });
  }, [filteredByCategory, selectedSubCategory]);

  // 4. Group courses by type for display
  const groupedCourses = useMemo(() => {
    if (selectedSubCategory) {
      // If sub-category is selected, no grouping needed
      return { [selectedSubCategory]: filteredCourses };
    }
    
    if (selectedCategory === "all") {
      return { "All Courses": filteredCourses };
    }

    // Group by course_type or use default
    const groups: Record<string, typeof filteredCourses> = {};
    
    filteredCourses.forEach(course => {
      const courseType = course.course_type || "General";
      if (!groups[courseType]) {
        groups[courseType] = [];
      }
      groups[courseType].push(course);
    });

    // If only one group, return without grouping
    if (Object.keys(groups).length <= 1) {
      return { "Available Batches": filteredCourses };
    }

    return groups;
  }, [filteredCourses, selectedCategory, selectedSubCategory]);

  // Featured courses (always show top 3 bestsellers or most popular)
  const featuredCourses = useMemo(() => {
    return courses
      .filter(c => c.bestseller || (c.students_enrolled && c.students_enrolled > 50))
      .slice(0, 3);
  }, [courses]);

  return (
    <>
      <NavBar />
      
      <main className="pt-16 min-h-screen bg-gradient-to-b from-slate-50 to-white">
        
        {/* --- HERO BANNER (Hanging from Nav - ~440px height) --- */}
        <section className="relative w-full min-h-[360px] md:min-h-[440px] bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          {/* Gradient Orbs */}
          <div className="absolute top-10 right-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              
              {/* Left Side - Title & Description */}
              <div className="text-white space-y-6">
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30">
                    <MapPin className="w-3 h-3 mr-1" />
                    {selectedCategory !== "all" ? `${formatCategoryTitle(selectedCategory)} Portal` : "Course Portal"}
                  </Badge>
                  {selectedCategory !== "all" && (
                    <Badge className="bg-amber-500/90 text-white border-amber-400 animate-pulse">
                      Live Classes Available
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                  {selectedCategory !== "all" ? (
                    <>
                      {formatCategoryTitle(selectedCategory)} 2026: 
                      <span className="block text-purple-300">Exam Dates, Syllabus & Prep</span>
                    </>
                  ) : (
                    <>
                      Master Your Exams
                      <span className="block text-purple-300">With Expert Guidance</span>
                    </>
                  )}
                </h1>

                <p className="text-gray-200 text-base md:text-lg leading-relaxed max-w-xl">
                  {getCategoryDescription(selectedCategory === "all" ? null : selectedCategory)}
                </p>
              </div>

              {/* Right Side - Highlight Cards */}
              <div className="hidden lg:grid grid-cols-2 gap-4">
                <QuickAccessCard 
                  title="PDF Bank" 
                  subtitle="Access Digital Library"
                  icon={FileText}
                  theme="red"
                  onClick={() => navigate('/dashboard?tab=library')}
                />
                <QuickAccessCard 
                  title="Notes" 
                  subtitle="Chapter-wise Notes"
                  icon={StickyNote}
                  theme="yellow"
                  onClick={() => navigate('/notes')}
                />
                <QuickAccessCard 
                  title="Test Series" 
                  subtitle="Practice Tests"
                  icon={Newspaper}
                  theme="green"
                  onClick={() => navigate('/tests')}
                />
                <QuickAccessCard 
                  title="Important Dates" 
                  subtitle="Key Timelines"
                  icon={CalendarDays}
                  theme="blue"
                  onClick={() => navigate('/important-dates')}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Quick Access Cards */}
        <section className="lg:hidden -mt-8 relative z-20 px-4 mb-8">
          <div className="grid grid-cols-2 gap-3">
            <QuickAccessCardMobile icon={FileText} title="PDF Bank" theme="red" onClick={() => navigate('/dashboard?tab=library')} />
            <QuickAccessCardMobile icon={StickyNote} title="Notes" theme="yellow" onClick={() => navigate('/notes')} />
            <QuickAccessCardMobile icon={Newspaper} title="Tests" theme="green" onClick={() => navigate('/tests')} />
            <QuickAccessCardMobile icon={CalendarDays} title="Dates" theme="blue" onClick={() => navigate('/important-dates')} />
          </div>
        </section>

        {/* --- BREADCRUMB NAVIGATION --- */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">{formatCategoryTitle(selectedCategory === "all" ? null : selectedCategory)}</span>
          </div>
        </nav>

        {/* --- PRIMARY CATEGORY FILTER --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            {EXAM_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300
                    ${isActive 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105" 
                      : "bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* --- FEATURED COURSES SECTION (Always Visible) --- */}
        {featuredCourses.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Featured Batches</h2>
                <p className="text-gray-500 text-sm">Top rated courses to accelerate your preparation</p>
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

        {/* --- SECONDARY FILTER (Appears after category selection) --- */}
        <AnimatePresence>
          {selectedCategory !== "all" && availableSubCategories.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter by Target / Level</h3>
              <div className="flex flex-wrap gap-2">
                {availableSubCategories.map((subCat) => {
                  const isActive = selectedSubCategory === subCat;
                  return (
                    <button
                      key={subCat}
                      onClick={() => handleSubCategoryChange(subCat)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActive 
                          ? "bg-purple-600 text-white shadow-md" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }
                      `}
                    >
                      {subCat}
                    </button>
                  );
                })}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* --- COURSE CARDS GRID (Grouped by Sub-types) --- */}
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
                    <div className="h-8 w-1 bg-indigo-600 rounded-full" />
                    <h3 className="text-xl font-bold text-gray-900">{groupName}</h3>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      {groupCourses.length} Courses
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
                  <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Layers className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your filters or check back later.</p>
                  </div>
                )}
              </div>
            ))
          )}
        </section>

        {/* --- STUDENT TESTIMONIALS --- */}
        <section className="py-16 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Student Success Stories
              </h2>
              <p className="mt-2 text-lg text-gray-500">
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

// --- Quick Access Card for Desktop ---
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

// --- Quick Access Card for Mobile ---
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
      className={`${t.bg} rounded-xl p-3 flex items-center gap-2 shadow-sm hover:shadow-md transition-all`}
    >
      <Icon className={`w-4 h-4 ${t.iconColor}`} />
      <span className="text-sm font-medium text-gray-700">{title}</span>
      <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
    </button>
  );
};

export default Courses;