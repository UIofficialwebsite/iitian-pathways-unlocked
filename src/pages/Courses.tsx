import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import CourseCard from "@/components/courses/CourseCard";
import CourseCardSkeleton from "@/components/courses/CourseCardSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { FileText, ChevronRight, Home, LayoutList, Newspaper, CalendarDays } from "lucide-react";

const Courses = () => {
  const { examCategory } = useParams<{ examCategory?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { courses, contentLoading } = useBackend();
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanner = async () => {
      const { data } = await supabase.from('page_banners').select('image_url, page_path');
      if (data) {
        const match = data.find(b => b.page_path === location.pathname || b.page_path === (examCategory || 'courses'));
        setBannerImage(match?.image_url || null);
      }
    };
    fetchBanner();
  }, [location.pathname, examCategory]);

  const categoryCourses = useMemo(() => {
    if (!examCategory || examCategory === 'all') return courses;
    return courses.filter(c => c.exam_category?.toLowerCase().replace(/[\s_]/g, '-') === examCategory.toLowerCase());
  }, [courses, examCategory]);

  const availableBranches = useMemo(() => Array.from(new Set(categoryCourses.map(c => c.branch))).filter(Boolean) as string[], [categoryCourses]);

  return (
    <div className="min-h-screen font-sans text-foreground w-full overflow-x-hidden bg-[#fcfdff] relative">
      <NavBar />
      <main className="pt-16">
        {/* Banner Section */}
        <section className="w-full h-[140px] md:h-[200px] bg-muted overflow-hidden relative z-10 border-b border-border/50">
          {bannerImage && <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />}
        </section>

        <div className="relative overflow-hidden flex flex-col items-center px-4 py-8 md:py-10">
          <div className="absolute top-0 left-0 w-[45%] h-full bg-gradient-to-br from-[#e6f0ff]/70 to-transparent z-0 pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          <div className="absolute bottom-0 right-0 w-[50%] h-full bg-gradient-to-tl from-[#ebf2ff]/80 to-transparent z-0 pointer-events-none" style={{ clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }} />

          <div className="relative z-10 w-full max-w-6xl">
            <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-2 font-['Inter',sans-serif]">
              {examCategory ? examCategory.replace(/-/g, ' ').toUpperCase() : "IIT JEE"} 2026: Resources
            </h1>

            {/* QUICK LINKS: 2x2 Grid on Mobile, 1x4 on PC */}
            <section className="mt-4 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-black/5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-x-4">
                <QuickLinkCard title="PDF Bank" desc="Access PDF Bank" icon={FileText} cardColor="bg-[#feeceb]" iconColor="text-[#f43f5e]" onClick={() => navigate('/digital-library')} />
                <QuickLinkCard title="News" desc="Stay Updated..." icon={Newspaper} cardColor="bg-[#e8f0fe]" iconColor="text-[#4a6cf7]" onClick={() => navigate('/digital-library')} />
                <QuickLinkCard title="Dates" desc="Exam Schedule" icon={CalendarDays} cardColor="bg-[#e1f7e7]" iconColor="text-[#4a6cf7]" onClick={() => navigate('/digital-library')} />
                <QuickLinkCard title="Syllabus" desc="Course Roadmap" icon={LayoutList} cardColor="bg-[#e0f0ff]" iconColor="text-[#f43f5e]" onClick={() => navigate('/digital-library')} />
              </div>
            </section>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="w-full bg-white border-y border-border sticky top-16 z-30 overflow-x-auto no-scrollbar">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center gap-x-6 text-[#1E40AF]">
            <button className="relative text-[14px] font-normal whitespace-nowrap group pb-2 border-b-2 border-[#1E40AF]">All Batches</button>
            <span className="text-gray-300">|</span>
            {availableBranches.map((branch, i) => (
              <React.Fragment key={branch}>
                <button className="relative text-[14px] font-normal whitespace-nowrap group pb-2">
                  {branch}
                  <span className="absolute left-0 bottom-0 w-full h-[2.5px] bg-[#1E40AF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                </button>
                {i < availableBranches.length - 1 && <span className="text-gray-300">|</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* BATCH SECTIONS: Horizontal Single Row Scrolling for Mobile */}
        <div className="pb-24 bg-white">
          <section className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
            {availableBranches.map((branch) => {
              const branchCourses = categoryCourses.filter(c => c.branch === branch).slice(0, 3);
              if (branchCourses.length === 0) return null;
              return (
                <div key={branch} className="mb-16">
                  <h3 className="text-xl font-bold mb-6">{branch} Courses</h3>
                  <div className="flex md:grid md:grid-cols-3 overflow-x-auto gap-4 md:gap-6 no-scrollbar snap-x snap-mandatory">
                    {branchCourses.map((course, index) => (
                      <div key={course.id} className="min-w-[85vw] md:min-w-0 flex-shrink-0 snap-start">
                        <CourseCard course={course} index={index} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-8">
                    <button className="bg-[#EFF6FF] text-[#1E3A8A] font-normal py-3 px-10 rounded-md border border-blue-100 flex items-center gap-2" onClick={() => navigate(`/courses/listing/${examCategory || 'all'}?branch=${branch}`)}>View all batches {">"}</button>
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const QuickLinkCard = ({ title, desc, icon: Icon, cardColor, iconColor, onClick }: any) => (
  <button onClick={onClick} className={`group relative h-[100px] w-full rounded-xl px-4 flex flex-col justify-center border-2 border-transparent hover:border-black text-left font-['Inter',sans-serif] ${cardColor}`}>
    <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md border border-black/5 mb-2"><Icon className={`w-4.5 h-4.5 ${iconColor}`} /></div>
    <h3 className="text-[13px] font-bold text-[#1a1a1a] mb-0.5 leading-tight">{title}</h3>
    <p className="text-[10px] text-[#5f6368] font-normal line-clamp-1">{desc}</p>
  </button>
);

export default Courses;
