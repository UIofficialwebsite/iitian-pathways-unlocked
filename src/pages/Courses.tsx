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
        const currentPath = location.pathname;
        const searchPaths = [currentPath, examCategory || 'courses'];
        const { data, error } = await supabase
          .from('page_banners')
          .select('image_url, page_path')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
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
  
  useEffect(() => { setSelectedSubFilter(null); }, [examCategory]);

  const currentCategoryData = useMemo(() => {
    if (!examCategory) return null;
    const match = courses.find(c => c.exam_category?.toLowerCase().replace(/[\s_]/g, '-') === examCategory.toLowerCase());
    return match ? { name: match.exam_category } : { name: examCategory.replace(/-/g, ' ') };
  }, [courses, examCategory]);

  const categoryCourses = useMemo(() => {
    if (!examCategory) return courses;
    return courses.filter(course => course.exam_category?.toLowerCase().replace(/[\s_]/g, '-') === examCategory.toLowerCase());
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
    return categoryCourses.filter(course => course.level === selectedSubFilter || course.course_type === selectedSubFilter);
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
    <div className="bg-white min-h-screen font-sans text-zinc-800 w-full overflow-x-hidden">
      <NavBar />
      
      <main className="pt-16">
        {/* BANNER SECTION */}
        <section className="w-full">
          <div className="w-full h-[180px] md:h-[300px] overflow-hidden bg-zinc-100">
            {bannerLoading ? (
              <div className="w-full h-full bg-zinc-200 animate-pulse" />
            ) : bannerImage ? (
              <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-zinc-200 to-zinc-300" />
            )}
          </div>
        </section>

        {/* BREADCRUMB - Decreased font size */}
        <nav className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-1 text-[11px] md:text-xs text-zinc-500 font-medium">
            <Link to="/" className="hover:text-primary"><Home className="w-3 h-3" /></Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            <Link to="/courses" className="hover:text-primary">Courses</Link>
            {examCategory && (
              <>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                <span className="font-semibold text-zinc-900 uppercase">{currentCategoryData?.name}</span>
              </>
            )}
          </div>
        </nav>

        {/* HEADER SECTION - Adjusted font sizes for better zoom compatibility */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-4">
          <h1 className="text-xl md:text-3xl font-bold text-zinc-900 mb-2 uppercase tracking-tight">
            {examCategory ? `${currentCategoryData?.name} 2026: Exam Prep` : "All Premium Courses"}
          </h1>
          <p className="text-zinc-600 text-xs md:text-sm leading-relaxed max-w-4xl font-medium">
            Access comprehensive study materials and expert guidance to crack your exams with Unknown IITians.
          </p>
        </section>

        {/* QUICK LINKS: Contained in a White Block with Blue Side Effect */}
        {examCategory && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-10">
            <div className="relative bg-white border border-zinc-100 rounded-2xl p-6 md:p-10 shadow-sm overflow-hidden">
              {/* Blue Effect on Right Side */}
              <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-blue-500/10 blur-[90px] rounded-full -mr-40 -mt-20 pointer-events-none" />
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-6 relative z-10">
                <QuickLinkCard 
                  title="Syllabus" desc="Course Details" 
                  icon={LayoutList} bgColor="bg-[#e8efff]/60" iconColor="text-[#4a6cf7]" 
                  onClick={() => navigate('/digital-library')} 
                />
                <QuickLinkCard 
                  title="PDF Bank" desc="Study Material" 
                  icon={FileText} bgColor="bg-[#feeceb]/60" iconColor="text-[#f43f5e]" 
                  onClick={() => navigate('/digital-library')} 
                />
                <QuickLinkCard 
                  title="Dates" desc="Important Alerts" 
                  icon={ClipboardList} bgColor="bg-[#e1f7e7]/60" iconColor="text-[#22c55e]" 
                  onClick={() => navigate('/digital-library')} 
                />
                <QuickLinkCard 
                  title="Updates" desc="Latest News" 
                  icon={BookOpen} bgColor="bg-[#e0f0ff]/60" iconColor="text-[#0ea5e9]" 
                  onClick={() => navigate('/digital-library')} 
                />
              </div>
            </div>
          </section>
        )}

        {/* COURSES GRID */}
        <div className="bg-white pb-24 mt-4">
          <section className="max-w-7xl mx-auto px-4 md:px-8">
            {/* Dynamic Sub-Filters - Compact sizing */}
            {availableSubFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8 py-3 sticky top-[64px] bg-white/95 backdrop-blur-sm z-20 border-b border-zinc-100">
                <button
                  onClick={() => setSelectedSubFilter(null)}
                  className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-semibold transition-all ${
                    !selectedSubFilter ? "bg-primary text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  All Batches
                </button>
                {availableSubFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedSubFilter(filter)}
                    className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-semibold transition-all ${
                      selectedSubFilter === filter ? "bg-primary text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}

            {contentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)}
              </div>
            ) : (
              Object.entries(groupedCourses).map(([groupName, groupCourses]) => (
                <div key={groupName} className="mb-12">
                  <div className="flex items-center justify-between mb-6 border-b border-zinc-100 pb-3">
                    <h3 className="text-lg font-bold text-zinc-900">{groupName}</h3>
                    <button className="text-primary text-[10px] md:text-xs font-bold hover:underline">View All →</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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

// Compact Quick Link Card
const QuickLinkCard = ({ title, desc, icon: Icon, bgColor, iconColor, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`relative h-[100px] md:h-[110px] rounded-xl p-4 flex flex-col justify-center border-[1.5px] border-transparent transition-all hover:border-black/10 group ${bgColor}`}
  >
    <div className="absolute -top-[20px] left-[15px] w-[40px] h-[40px] bg-white rounded-full flex items-center justify-center shadow-sm z-10 border border-zinc-50">
      <Icon className={`w-4 h-4 ${iconColor}`} />
    </div>
    <div className="mt-2 text-left">
      <h3 className="text-xs md:text-sm font-bold text-[#1a1a1a] mb-0.5">{title}</h3>
      <p className="text-[10px] md:text-[11px] text-[#5f6368] font-medium leading-tight">{desc}</p>
    </div>
    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 group-hover:text-black transition-colors" />
  </button>
);

export default Courses;
