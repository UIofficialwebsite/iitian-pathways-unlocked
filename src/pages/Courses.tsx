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
  Newspaper,
  CalendarDays,
} from "lucide-react";

const Courses = () => {
  const { examCategory } = useParams<{ examCategory?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { courses, contentLoading } = useBackend();
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
          const match = data.find(b => b.page_path === location.pathname || b.page_path === (examCategory || 'courses'));
          setBannerImage(match?.image_url || data[0]?.image_url || null);
        }
      } catch (err) { console.error('Error fetching banner:', err); } finally { setBannerLoading(false); }
    };
    fetchBanner();
  }, [location.pathname, examCategory]);

  const currentCategoryData = useMemo(() => {
    if (!examCategory) return { name: "All Courses" };
    const match = courses.find(c => c.exam_category?.toLowerCase().replace(/[\s_]/g, '-') === examCategory.toLowerCase());
    return match ? { name: match.exam_category } : { name: examCategory.replace(/-/g, ' ') };
  }, [courses, examCategory]);

  const categoryCourses = useMemo(() => {
    if (!examCategory || examCategory === 'all') return courses;
    return courses.filter(course => 
      course.exam_category?.toLowerCase().replace(/[\s_]/g, '-') === examCategory.toLowerCase()
    );
  }, [courses, examCategory]);

  const availableBranches = useMemo(() => {
    const branches = Array.from(new Set(categoryCourses.map(c => c.branch))).filter(Boolean) as string[];
    return branches;
  }, [categoryCourses]);

  return (
    <div className="min-h-screen font-sans text-foreground w-full overflow-x-hidden bg-[#fcfdff] relative">
      <NavBar />
      
      <main className="pt-16">
        {/* Banner Section */}
        <section className="w-full h-[140px] md:h-[220px] bg-muted overflow-hidden relative z-10 border-b border-border/50">
          {bannerLoading ? <div className="w-full h-full animate-pulse bg-muted" /> : bannerImage && <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />}
        </section>

        {/* Hero Section with Glassy Background */}
        <div className="relative overflow-hidden flex flex-col items-center px-4 py-8 md:py-10">
          <div 
            className="absolute top-0 left-0 w-[45%] h-full bg-gradient-to-br from-[#e6f0ff]/70 to-transparent z-0 pointer-events-none"
            style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
          />
          <div 
            className="absolute bottom-0 right-0 w-[50%] h-full bg-gradient-to-tl from-[#ebf2ff]/80 to-transparent z-0 pointer-events-none"
            style={{ clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }}
          />

          <div className="relative z-10 w-full max-w-6xl">
            <nav className="flex items-center gap-2 text-[#666] text-xs mb-4 font-normal font-['Inter',sans-serif]">
              <Home className="w-3.5 h-3.5" />
              <ChevronRight className="w-3 h-3 opacity-50" />
              <span className="uppercase tracking-tight">{currentCategoryData?.name}</span>
            </nav>

            <h1 className="text-2xl md:text-4xl font-bold text-[#1a1a1a] mb-3 tracking-tight leading-tight font-['Inter',sans-serif]">
              {currentCategoryData?.name} 2026: Exam Dates, Syllabus, Pattern & Eligibility
            </h1>
            <p className="text-[#555] text-sm md:text-base leading-relaxed max-w-4xl mb-10 font-normal font-['Inter',sans-serif]">
              Access specialized study resources curated by expert IITians. Our hub provides the most updated syllabus, comprehensive PDF banks, and essential exam alerts.
            </p>

            {/* QUICK LINKS: 1 row on PC, 2x2 on Mobile */}
            {examCategory && (
              <section className="mt-4 bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-black/5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-x-4 md:gap-y-14 mt-4">
                  <QuickLinkCard title="PDF Bank" desc="Access PDF Bank" icon={FileText} cardColor="bg-[#feeceb]" iconColor="text-[#f43f5e]" onClick={() => navigate('/digital-library')} />
                  <QuickLinkCard title="News" desc="Stay Updated on Exams" icon={Newspaper} cardColor="bg-[#e8f0fe]" iconColor="text-[#4a6cf7]" onClick={() => navigate('/digital-library')} />
                  <QuickLinkCard title="Important Dates" desc="Check Exam Schedule" icon={CalendarDays} cardColor="bg-[#e1f7e7]" iconColor="text-[#4a6cf7]" onClick={() => navigate('/digital-library')} />
                  <QuickLinkCard title="Syllabus" desc="Detailed Course Roadmap" icon={LayoutList} cardColor="bg-[#e0f0ff]" iconColor="text-[#f43f5e]" onClick={() => navigate('/digital-library')} />
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Filter Bar: Inter Font, Blue, Non-Bold, Pipe Separators */}
        <div className="w-full bg-white border-y border-border sticky top-16 z-30">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-[#1E40AF] font-['Inter',sans-serif]">
              <button 
                onClick={() => navigate(`/courses/listing/${examCategory || 'all'}`)}
                className="relative text-[14px] font-normal whitespace-nowrap group pb-2"
              >
                All Batches
                <span className="absolute left-0 bottom-[2px] w-full h-[2.5px] bg-[#1E40AF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </button>
              {availableBranches.length > 0 && <span className="text-gray-300 font-light px-1">|</span>}
              {availableBranches.map((branch, index) => (
                <React.Fragment key={branch}>
                  <button
                    onClick={() => navigate(`/courses/listing/${examCategory || 'all'}?branch=${branch}`)}
                    className="relative text-[14px] font-normal whitespace-nowrap group pb-2"
                  >
                    {branch}
                    <span className="absolute left-0 bottom-[2px] w-full h-[2.5px] bg-[#1E40AF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                  </button>
                  {index < availableBranches.length - 1 && <span className="text-gray-300 font-light px-1">|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Branch Sections: 1 Row Scroller, 3 Cards Max */}
        <div className="pb-24 bg-white">
          <section className="max-w-6xl mx-auto px-4 md:px-8 pt-12">
            {!contentLoading && availableBranches.map((branch) => {
              const branchCourses = categoryCourses.filter(c => c.branch === branch).slice(0, 3);
              if (branchCourses.length === 0) return null;
              return (
                <div key={branch} className="mb-20">
                  <div className="mb-8">
                    <h3 className="text-xl md:text-2xl font-bold text-[#1a1a1a] font-['Inter',sans-serif] no-underline">
                      {currentCategoryData?.name} - {branch} Courses
                    </h3>
                    <div className="h-1 w-12 bg-[#1E3A8A] mt-2 rounded-full" />
                  </div>
                  
                  {/* Single Row Horizontal Scroll Container */}
                  <div className="flex overflow-x-auto gap-6 no-scrollbar pb-6 snap-x snap-mandatory">
                    {branchCourses.map((course, index) => (
                      <div key={course.id} className="min-w-[300px] md:min-w-[calc(33.333%-1rem)] flex-shrink-0 snap-start">
                        <CourseCard course={course} index={index} />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center mt-6">
                    <button 
                      className="bg-[#EFF6FF] text-[#1E3A8A] font-normal font-['Inter',sans-serif] py-3.5 px-12 rounded-md transition-all hover:bg-[#DBEAFE] flex items-center gap-2 text-sm md:text-base border border-blue-100 shadow-sm"
                      onClick={() => navigate(`/courses/listing/${examCategory || 'all'}?branch=${branch}`)}
                    >
                      View all batches {">"}
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </main>

      <Footer />
      <EmailPopup />
    </div>
  );
};

const QuickLinkCard = ({ title, desc, icon: Icon, cardColor, iconColor, onClick }: {
  title: string; desc: string; icon: React.ElementType; cardColor: string; iconColor: string; onClick: () => void;
}) => (
  <button 
    onClick={onClick}
    className={`group relative h-[115px] md:h-[130px] w-full rounded-xl px-4 md:px-5 flex flex-col justify-center border-2 border-transparent transition-all hover:border-black text-left font-['Inter',sans-serif] ${cardColor}`}
  >
    <div className="md:absolute md:-top-6 md:left-5 w-10 h-10 md:w-11 md:h-11 bg-white rounded-full flex items-center justify-center shadow-md z-10 border border-black/5 mb-2 md:mb-0">
      <Icon className={`w-5.5 h-5.5 ${iconColor}`} />
    </div>
    <div className="mt-1 md:mt-3">
      <h3 className="text-[15px] md:text-base font-bold text-[#1a1a1a] mb-1 leading-tight">{title}</h3>
      <p className="text-[0.75rem] md:text-[0.8rem] text-[#5f6368] font-normal line-clamp-1">{desc}</p>
    </div>
    <ChevronRight className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#1a1a1a]" />
  </button>
);

export default Courses;
