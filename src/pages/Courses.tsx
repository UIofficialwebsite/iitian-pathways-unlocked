import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EmailPopup from "@/components/EmailPopup";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import CourseCardSkeleton from "@/components/courses/CourseCardSkeleton";
import CourseCard from "@/components/courses/CourseCard";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  ChevronRight,
  Home,
  LayoutList,
  BookOpen,
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
  
  useEffect(() => {
    const fetchBanner = async () => {
      setBannerLoading(true);
      try {
        const { data, error } = await supabase
          .from('page_banners')
          .select('image_url, page_path')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data && data.length > 0) {
          const matchingBanner = data.find(banner => 
            banner.page_path === location.pathname || 
            banner.page_path === (examCategory || 'courses')
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
    return groups;
  }, [filteredCourses, selectedSubFilter, examCategory]);

  return (
    <div className="bg-white min-h-screen font-sans text-zinc-800 w-full overflow-x-hidden">
      <NavBar />
      
      <main className="pt-16">
        {/* BANNER SECTION */}
        <section className="w-full h-[160px] md:h-[280px] bg-zinc-100 overflow-hidden">
          {bannerLoading ? (
            <div className="w-full h-full animate-pulse bg-zinc-200" />
          ) : bannerImage ? (
            <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-zinc-200 to-zinc-300" />
          )}
        </section>

        {/* BREADCRUMB - Smaller font for zoom */}
        <nav className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
            <Link to="/" className="hover:text-primary"><Home className="w-3 h-3" /></Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            <Link to="/courses" className="hover:text-primary">Courses</Link>
            {examCategory && (
              <>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                <span className="font-semibold text-zinc-800 uppercase">{currentCategoryData?.name}</span>
              </>
            )}
          </div>
        </nav>

        {/* HEADER SECTION - Reduced sizes */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-4">
          <h1 className="text-xl md:text-2xl font-bold text-zinc-900 mb-1.5 uppercase tracking-tight font-sans">
            {examCategory ? `${currentCategoryData?.name} 2026 Preparation` : "All Courses"}
          </h1>
          <p className="text-zinc-500 text-[12px] md:text-xs leading-relaxed max-w-3xl font-medium font-sans">
            Comprehensive resources and expert guidance to help you succeed in your competitive exams.
          </p>
        </section>

        {/* QUICK LINKS SECTION: White Block with Blue Background Effect */}
        {examCategory && (
          <section className="relative py-8 md:py-12 overflow-hidden">
            {/* Background Blue Effect (Right Side) */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] pointer-events-none rounded-full" />
            
            <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
              {/* White Section Block */}
              <div className="bg-white rounded-2xl border border-zinc-100 p-6 md:p-8 shadow-sm">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                  <QuickLinkCard 
                    title="Syllabus" desc="Detailed Course Roadmap" 
                    icon={LayoutList} iconColor="text-blue-600" 
                    onClick={() => navigate('/digital-library')} 
                  />
                  <QuickLinkCard 
                    title="PDF Bank" desc="Study Materials & Notes" 
                    icon={FileText} iconColor="text-rose-500" 
                    onClick={() => navigate('/digital-library')} 
                  />
                  <QuickLinkCard 
                    title="Important Dates" desc="Upcoming Exam Alerts" 
                    icon={ClipboardList} iconColor="text-emerald-500" 
                    onClick={() => navigate('/digital-library')} 
                  />
                  <QuickLinkCard 
                    title="News" desc="Latest Exam Updates" 
                    icon={BookOpen} iconColor="text-sky-500" 
                    onClick={() => navigate('/digital-library')} 
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* COURSES LISTING */}
        <div className="bg-white pb-20">
          <section className="max-w-7xl mx-auto px-4 md:px-8">
            {availableSubFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8 py-3 sticky top-[64px] bg-white/95 backdrop-blur-sm z-20 border-b border-zinc-100">
                <button
                  onClick={() => setSelectedSubFilter(null)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                    !selectedSubFilter ? "bg-primary text-white" : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  All Batches
                </button>
                {availableSubFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedSubFilter(filter)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                      selectedSubFilter === filter ? "bg-primary text-white" : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}

            {contentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)}
              </div>
            ) : (
              Object.entries(groupedCourses).map(([groupName, groupCourses]) => (
                <div key={groupName} className="mb-10">
                  <h3 className="text-base font-bold text-zinc-900 mb-6 border-l-4 border-primary pl-3">{groupName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupCourses.map((course, index) => (
                      <CourseCard course={course} index={index} key={course.id} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </main>

      <Footer />
      <EmailPopup />
    </div>
  );
};

// Updated Tab/Card: White background with Black hover border
const QuickLinkCard = ({ title, desc, icon: Icon, iconColor, onClick }: any) => (
  <button 
    onClick={onClick}
    className="group relative h-[90px] md:h-[100px] bg-white rounded-xl p-4 flex flex-col justify-center border border-zinc-100 transition-all hover:border-black text-left"
  >
    {/* Clean Icon Background */}
    <div className="absolute -top-[18px] left-[15px] w-[36px] h-[36px] bg-white rounded-full flex items-center justify-center shadow-sm z-10 border border-zinc-100">
      <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
    </div>
    
    <div className="mt-1">
      <h3 className="text-xs md:text-sm font-bold text-zinc-900 mb-0.5 font-sans uppercase tracking-tight">{title}</h3>
      <p className="text-[10px] md:text-[11px] text-zinc-500 font-medium font-sans leading-tight">{desc}</p>
    </div>
    
    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300 group-hover:text-black transition-colors" />
  </button>
);

export default Courses;
