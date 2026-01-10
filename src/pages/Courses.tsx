import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EmailPopup from "@/components/EmailPopup";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import CourseCardSkeleton from "@/components/courses/CourseCardSkeleton";
import CourseCard from "@/components/courses/CourseCard";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  ChevronRight,
  Home,
  Monitor,
  LayoutList,
  BookOpen,
  Sparkles,
  ClipboardList
} from "lucide-react";

const Courses = () => {
  const { examCategory } = useParams<{ examCategory?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { courses, contentLoading } = useBackend();
  const [selectedSubFilter, setSelectedSubFilter] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [bannerLoading, setBannerLoading] = useState(true);
  
  // Fetch banner image from page_banners table
  useEffect(() => {
    const fetchBanner = async () => {
      setBannerLoading(true);
      try {
        // Determine the path to search for
        const currentPath = location.pathname;
        const searchPaths = [
          currentPath, // Full path like /courses/category/jee
          examCategory || 'courses', // Just the exam category like 'jee' or 'courses'
        ];
        
        const { data, error } = await supabase
          .from('page_banners')
          .select('image_url, page_path')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Find matching banner - check for exact path match first, then partial
          const matchingBanner = data.find(banner => 
            searchPaths.some(path => 
              banner.page_path === path || 
              banner.page_path === path.replace('/courses/category/', '') ||
              path.includes(banner.page_path)
            )
          );
          
          setBannerImage(matchingBanner?.image_url || data[0]?.image_url || null);
        }
      } catch (err) {
        console.error('Error fetching banner:', err);
      } finally {
        setBannerLoading(false);
      }
    };
    
    fetchBanner();
  }, [location.pathname, examCategory]);
  
  useEffect(() => {
    setSelectedSubFilter(null);
  }, [examCategory]);

  // Derive dynamic category info from backend data
  const currentCategoryData = useMemo(() => {
    if (!examCategory) return null;
    const match = courses.find(c => c.exam_category?.toLowerCase().replace(/[\s_]/g, '-') === examCategory.toLowerCase());
    return match ? { name: match.exam_category } : { name: examCategory.replace(/-/g, ' ') };
  }, [courses, examCategory]);

  const categoryCourses = useMemo(() => {
    if (!examCategory) return courses;
    return courses.filter(course => 
      course.exam_category?.toLowerCase().replace(/[\s_]/g, '-') === examCategory.toLowerCase()
    );
  }, [courses, examCategory]);

  const availableSubFilters = useMemo(() => {
    const filters = new Set<string>();
    categoryCourses.forEach(course => {
      if (course.level) filters.add(course.level);
      if (course.course_type && course.course_type !== "General") filters.add(course.course_type);
    });
    return Array.from(filters).sort();
  }, [categoryCourses]);

  const filteredCourses = useMemo(() => {
    if (!selectedSubFilter) return categoryCourses;
    return categoryCourses.filter(course => 
      course.level === selectedSubFilter || course.course_type === selectedSubFilter
    );
  }, [categoryCourses, selectedSubFilter]);

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

  return (
    <div className="bg-white min-h-screen font-sans text-zinc-800 w-full">
      <NavBar />
      
      <main className="pt-16">
        {/* === 1. BANNER SECTION === */}
        <section className="w-full">
          <div className="w-full h-[200px] md:h-[350px] lg:h-[400px] overflow-hidden bg-zinc-100">
            {bannerLoading ? (
              <div className="w-full h-full bg-zinc-200 animate-pulse" />
            ) : bannerImage ? (
              <img 
                src={bannerImage} 
                alt="Banner" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-zinc-200 to-zinc-300" />
            )}
          </div>
        </section>

        {/* === 2. BREADCRUMB: Strictly below banner === */}
        <nav className="max-w-7xl mx-auto px-4 md:px-8 py-5">
          <div className="flex items-center gap-1 text-[13px] text-zinc-500">
            <Link to="/" className="hover:text-primary"><Home className="w-3.5 h-3.5" /></Link>
            <ChevronRight className="w-4 h-4 opacity-40" />
            <Link to="/courses" className="hover:text-primary">Courses</Link>
            {examCategory && (
              <>
                <ChevronRight className="w-4 h-4 opacity-40" />
                <span className="font-semibold text-zinc-900 uppercase">{currentCategoryData?.name}</span>
              </>
            )}
          </div>
        </nav>

        {/* === 3. HEADER SECTION === */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-4">
          <h1 className="text-2xl md:text-4xl font-extrabold text-zinc-900 mb-3 uppercase tracking-tight">
            {examCategory ? `${currentCategoryData?.name} 2026: Exam Dates, Syllabus & Prep` : "All Premium Courses"}
          </h1>
          <p className="text-zinc-600 text-sm md:text-base leading-relaxed max-w-5xl">
            Access comprehensive study materials and expert guidance. Join thousands of students 
            on their journey to success with Unknown IITians.
          </p>
        </section>

        {/* === 4. QUICK LINKS: Physics Wallah "Ditto" Design === */}
        {examCategory && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-6">
              <QuickLinkCard 
                title="Syllabus" desc="Course Syllabus" 
                icon={LayoutList} bgColor="bg-[#e8efff]" iconColor="text-[#4a6cf7]" 
                onClick={() => navigate('/digital-library')} 
              />
              <QuickLinkCard 
                title="PDF Bank" desc="Access PDF Bank" 
                icon={FileText} bgColor="bg-[#feeceb]" iconColor="text-[#f43f5e]" 
                onClick={() => navigate('/digital-library')} 
              />
              <QuickLinkCard 
                title="Important Dates" desc="Check Exam Dates" 
                icon={ClipboardList} bgColor="bg-[#e1f7e7]" iconColor="text-[#22c55e]" 
                onClick={() => navigate('/digital-library')} 
              />
              <QuickLinkCard 
                title="News" desc="Latest Updates" 
                icon={BookOpen} bgColor="bg-[#e0f0ff]" iconColor="text-[#0ea5e9]" 
                onClick={() => navigate('/digital-library')} 
              />
            </div>
          </section>
        )}

        {/* === 5. COURSES GRID === */}
        <div className="bg-white pb-24 mt-8">
          <section className="max-w-7xl mx-auto px-4 md:px-8">
            
            {/* Dynamic Sub-Filters Bar */}
            {availableSubFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10 py-4 sticky top-[64px] bg-white/95 backdrop-blur-sm z-20 border-b border-zinc-100">
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
                    onClick={() => setSelectedSubFilter(filter)}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                      selectedSubFilter === filter ? "bg-primary text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}

            {/* Main Listing Logic */}
            {contentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
              </div>
            ) : (
              Object.entries(groupedCourses).map(([groupName, groupCourses]) => (
                <div key={groupName} className="mb-16">
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

          {/* Testimonials */}
          <section className="py-20 bg-zinc-50/50 mt-20 border-t border-zinc-100">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold mb-12">Student Success Stories</h2>
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

// Quick Link Card - replicates the overlapping icon design
const QuickLinkCard = ({ title, desc, icon: Icon, bgColor, iconColor, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`relative h-[110px] md:h-[120px] rounded-[10px] p-5 flex flex-col justify-center border-[1.5px] border-transparent transition-all hover:border-black group ${bgColor}`}
  >
    {/* Overlapping Icon */}
    <div className="absolute -top-[23px] left-[15px] w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center shadow-[0_3px_8px_rgba(0,0,0,0.1)] z-10">
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    
    <div className="mt-2 text-left">
      <h3 className="text-sm md:text-base font-bold text-[#1a1a1a] mb-1">{title}</h3>
      <p className="text-[11px] md:text-xs text-[#5f6368] leading-tight">{desc}</p>
    </div>
    
    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-hover:text-black transition-colors" />
  </button>
);

export default Courses;
