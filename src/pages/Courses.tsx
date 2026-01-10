import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EmailPopup from "@/components/EmailPopup";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import CourseCardSkeleton from "@/components/courses/CourseCardSkeleton";
import CourseCard from "@/components/courses/CourseCard";
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

  const groupedCourses = useMemo(() => {
    if (selectedSubFilter || !examCategory) return { "Available Batches": categoryCourses };
    const groups: Record<string, typeof categoryCourses> = {};
    categoryCourses.forEach(course => {
      const type = course.course_type || "General";
      if (!groups[type]) groups[type] = [];
      groups[type].push(course);
    });
    return groups;
  }, [categoryCourses, selectedSubFilter, examCategory]);

  return (
    <div className="min-h-screen font-sans text-zinc-800 w-full overflow-x-hidden bg-[#fcfdff] relative">
      {/* Background Geometric Shapes */}
      <div 
        className="absolute top-0 left-0 w-[45%] h-[60%] bg-gradient-to-br from-blue-100/50 to-transparent z-0 pointer-events-none"
        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
      />
      <div 
        className="absolute bottom-0 right-0 w-[50%] h-[70%] bg-gradient-to-tl from-blue-50/80 to-transparent z-0 pointer-events-none"
        style={{ clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }}
      />

      <NavBar />
      
      <main className="pt-16 relative z-10">
        {/* BANNER SECTION */}
        <section className="w-full h-[160px] md:h-[260px] bg-zinc-100 overflow-hidden mb-4">
          {bannerLoading ? (
            <div className="w-full h-full animate-pulse bg-zinc-200" />
          ) : bannerImage ? (
            <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-zinc-200 to-zinc-300" />
          )}
        </section>

        {/* BREADCRUMB */}
        <nav className="max-w-6xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-1.5 text-[12px] text-zinc-500 font-medium">
            <Link to="/" className="hover:text-primary"><Home className="w-3.5 h-3.5" /></Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            <span className="uppercase tracking-wide text-zinc-400">Courses</span>
            {examCategory && (
              <>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                <span className="font-bold text-zinc-900 uppercase">{currentCategoryData?.name}</span>
              </>
            )}
          </div>
        </nav>

        {/* HEADER SECTION */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 pb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 mb-3 tracking-tight leading-tight">
            {examCategory ? `${currentCategoryData?.name} 2026: Resources & Prep` : "All Premium Courses"}
          </h1>
          <p className="text-zinc-600 text-[13px] md:text-sm leading-relaxed max-w-4xl font-medium">
            Access our specialized study hub featuring updated syllabus, comprehensive PDF banks, 
            and the latest exam alerts curated by expert IITians.
          </p>
        </section>

        {/* QUICK LINKS: White Block with Tab-Icon Cards */}
        {examCategory && (
          <section className="max-w-6xl mx-auto px-4 md:px-8 mb-16">
            <div className="bg-white rounded-2xl border border-zinc-100 p-8 md:p-10 pt-14 md:pt-14 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
                <QuickLinkTab 
                  title="Syllabus" desc="Detailed Course Roadmap" 
                  icon={LayoutList} bgColor="bg-[#e8efff]" iconColor="text-[#4a6cf7]" 
                  onClick={() => navigate('/digital-library')} 
                />
                <QuickLinkTab 
                  title="PDF Bank" desc="Access Notes & PDFs" 
                  icon={FileText} bgColor="bg-[#feeceb]" iconColor="text-[#f43f5e]" 
                  onClick={() => navigate('/digital-library')} 
                />
                <QuickLinkTab 
                  title="Important Dates" desc="Check Exam Schedule" 
                  icon={ClipboardList} bgColor="bg-[#e1f7e7]" iconColor="text-[#22c55e]" 
                  onClick={() => navigate('/digital-library')} 
                />
                <QuickLinkTab 
                  title="Latest News" desc="Stay Updated on Exams" 
                  icon={BookOpen} bgColor="bg-[#e0f0ff]" iconColor="text-[#0ea5e9]" 
                  onClick={() => navigate('/digital-library')} 
                />
              </div>
            </div>
          </section>
        )}

        {/* COURSES LISTING */}
        <div className="pb-24">
          <section className="max-w-6xl mx-auto px-4 md:px-8">
            {contentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)}
              </div>
            ) : (
              Object.entries(groupedCourses).map(([groupName, groupCourses]) => (
                <div key={groupName} className="mb-14">
                  <div className="flex items-center justify-between mb-8 border-b border-zinc-100 pb-4">
                    <h3 className="text-lg font-bold text-zinc-900 uppercase tracking-wide">{groupName}</h3>
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
        </div>
      </main>

      <Footer />
      <EmailPopup />
    </div>
  );
};

// Replicated Overlapping Tab Card Component
const QuickLinkTab = ({ title, desc, icon: Icon, bgColor, iconColor, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`group relative h-[110px] w-full rounded-xl px-5 flex flex-col justify-center border-2 border-transparent transition-all hover:border-black text-left ${bgColor}`}
  >
    {/* Floating Tab Icon Badge */}
    <div className="absolute -top-6 left-5 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md z-10 border border-zinc-50">
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    
    <div className="mt-2">
      <h3 className="text-sm md:text-base font-bold text-zinc-900 mb-0.5 font-sans tracking-tight">
        {title}
      </h3>
      <p className="text-[11px] md:text-xs text-zinc-500 font-medium leading-tight">
        {desc}
      </p>
    </div>
    
    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-hover:text-black transition-colors" />
  </button>
);

export default Courses;
