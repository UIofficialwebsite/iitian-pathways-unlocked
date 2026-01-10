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
  Monitor,
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

  const groupedCourses = useMemo(() => {
    const filtered = !selectedSubFilter ? categoryCourses : categoryCourses.filter(course => 
      course.level === selectedSubFilter || course.course_type === selectedSubFilter
    );
    return { "Available Batches": filtered };
  }, [categoryCourses, selectedSubFilter]);

  return (
    <div className="bg-[#f0f2f5] min-h-screen font-sans text-zinc-800 w-full overflow-x-hidden">
      <NavBar />
      
      <main className="pt-16">
        {/* Banner Section */}
        <section className="w-full h-[160px] md:h-[260px] bg-zinc-200 overflow-hidden">
          {bannerLoading ? (
            <div className="w-full h-full animate-pulse bg-zinc-300" />
          ) : bannerImage ? (
            <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-zinc-300 to-zinc-400" />
          )}
        </section>

        {/* Breadcrumb & Title Section */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-2">
           <nav className="flex items-center gap-1 text-[11px] text-zinc-500 mb-4 font-medium uppercase">
            <Link to="/" className="hover:text-primary"><Home className="w-3 h-3" /></Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            <Link to="/courses" className="hover:text-primary">Courses</Link>
            {examCategory && (
              <>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                <span className="font-bold text-zinc-900">{currentCategoryData?.name}</span>
              </>
            )}
          </nav>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-900 mb-1 uppercase tracking-tight font-sans">
            {examCategory ? `${currentCategoryData?.name} 2026: Preparation Resources` : "All Premium Courses"}
          </h1>
          <p className="text-zinc-500 text-[12px] md:text-xs leading-relaxed max-w-2xl font-medium font-sans">
            Explore our curated resources, batches, and study material designed by expert IITians.
          </p>
        </div>

        {/* QUICK LINKS SECTION: White Block with Blue Background Glow */}
        {examCategory && (
          <section className="relative py-12 overflow-hidden">
            {/* Background Blue Glow (Right Side) */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-600/5 blur-[120px] pointer-events-none rounded-full" />
            
            <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
              <div className="bg-white rounded-xl p-8 md:p-10 shadow-sm border border-zinc-100">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-6">
                  <QuickLinkCard 
                    title="Blog" desc="Read Our Latest Blogs" 
                    icon={Monitor} bgColor="bg-[#e8efff]" iconColor="text-[#4a6cf7]" 
                    onClick={() => navigate('/digital-library')} 
                  />
                  <QuickLinkCard 
                    title="PDF Bank" desc="Access PDF Bank" 
                    icon={FileText} bgColor="bg-[#feeceb]" iconColor="text-[#f43f5e]" 
                    onClick={() => navigate('/digital-library')} 
                  />
                  <QuickLinkCard 
                    title="Test Series" desc="Explore JEE 2026 Test Series" 
                    icon={ClipboardList} bgColor="bg-[#e1f7e7]" iconColor="text-[#4a6cf7]" 
                    onClick={() => navigate('/digital-library')} 
                  />
                  <QuickLinkCard 
                    title="Books" desc="Find Preparation Books" 
                    icon={BookOpen} bgColor="bg-[#e0f0ff]" iconColor="text-[#f43f5e]" 
                    onClick={() => navigate('/digital-library')} 
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Courses Listing */}
        <div className="bg-white pb-20 pt-10">
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
                  <h3 className="text-sm font-bold text-zinc-900 mb-6 uppercase tracking-widest opacity-60">{groupName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

// Design for Quick Link Cards based on your provided HTML structure
const QuickLinkCard = ({ title, desc, icon: Icon, bgColor, iconColor, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`group relative h-[110px] md:h-[120px] rounded-xl p-5 flex flex-col justify-center border-1.5 border-transparent transition-all hover:border-black text-left ${bgColor}`}
  >
    {/* Overlapping Circular Icon */}
    <div className="absolute -top-[23px] left-[15px] w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center shadow-[0_3px_8px_rgba(0,0,0,0.1)] z-10 border border-zinc-50">
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    
    <div className="mt-2">
      <h3 className="text-sm md:text-base font-bold text-zinc-900 mb-0.5 font-sans uppercase tracking-tight">{title}</h3>
      <p className="text-[10px] md:text-[11px] text-zinc-500 font-medium font-sans leading-tight">{desc}</p>
    </div>
    
    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-hover:text-black transition-colors" />
  </button>
);

export default Courses;
