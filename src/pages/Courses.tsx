import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EmailPopup from "@/components/EmailPopup";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import CourseCardSkeleton from "@/components/courses/CourseCardSkeleton";
import CourseCard from "@/components/courses/CourseCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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

  // FETCH BANNER LOGIC
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

  // CATEGORY LOGIC
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
    return Array.from(new Set(categoryCourses.map(c => c.branch))).filter(Boolean) as string[];
  }, [categoryCourses]);

  return (
    <div className="min-h-screen font-sans text-foreground w-full overflow-x-hidden bg-[#fcfdff] relative">
      <NavBar />
      
      <main className="pt-16">
        {/* BANNER */}
        <section className="w-full h-[160px] md:h-[260px] bg-muted overflow-hidden">
          {bannerLoading ? (
            <div className="w-full h-full animate-pulse bg-muted" />
          ) : bannerImage ? (
            <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-muted to-muted/80" />
          )}
        </section>

        {/* HERO AREA WITH GEOMETRIC BACKGROUND */}
        <div className="relative overflow-hidden flex flex-col items-center px-4 py-12">
          {/* Top-Left Geometric Shape */}
          <div 
            className="absolute top-0 left-0 w-[45%] h-full bg-gradient-to-br from-[#e6f0ff]/70 to-transparent z-0 pointer-events-none"
            style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
          />
          {/* Bottom-Right Geometric Shape */}
          <div 
            className="absolute bottom-0 right-0 w-[50%] h-full bg-gradient-to-tl from-[#ebf2ff]/80 to-transparent z-0 pointer-events-none"
            style={{ clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }}
          />

          <div className="relative z-10 w-full max-w-6xl">
            <nav className="flex items-center gap-2 text-[#666] text-sm mb-6 font-medium">
              <Home className="w-4 h-4" />
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="uppercase">{currentCategoryData?.name}</span>
            </nav>

            <h1 className="text-3xl md:text-5xl font-extrabold text-[#1a1a1a] mb-4 tracking-tight leading-tight">
              {currentCategoryData?.name} 2026: Exam Dates, Syllabus, Pattern & Eligibility
            </h1>
            <p className="text-[#555] text-base md:text-lg leading-relaxed max-w-4xl mb-12">
              Explore specialized resources curated by expert IITians. Get the latest {currentCategoryData?.name} alerts, comprehensive PDF banks, and detailed roadmap to success.
            </p>

            {/* QUICK LINKS SECTION - WHITE BACKGROUND */}
            {examCategory && (
              <section className="mt-8 bg-white p-12 md:p-14 rounded-3xl shadow-sm border border-black/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-16">
                  <QuickLinkCard 
                    title="PDF Bank" desc="Access PDF Bank" icon={FileText} 
                    cardColor="bg-[#feeceb]" iconColor="text-[#f43f5e]" onClick={() => navigate('/digital-library')} 
                  />
                  <QuickLinkCard 
                    title="News" desc="Stay Updated on Exams" icon={Newspaper} 
                    cardColor="bg-[#e8f0fe]" iconColor="text-[#4a6cf7]" onClick={() => navigate('/digital-library')} 
                  />
                  <QuickLinkCard 
                    title="Important Dates" desc="Check Exam Schedule" icon={CalendarDays} 
                    cardColor="bg-[#e1f7e7]" iconColor="text-[#4a6cf7]" onClick={() => navigate('/digital-library')} 
                  />
                  <QuickLinkCard 
                    title="Syllabus" desc="Detailed Course Roadmap" icon={LayoutList} 
                    cardColor="bg-[#e0f0ff]" iconColor="text-[#f43f5e]" onClick={() => navigate('/digital-library')} 
                  />
                </div>
              </section>
            )}
          </div>
        </div>

        {/* BRANCH TABS */}
        <div className="w-full bg-white border-y border-border sticky top-16 z-30">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => navigate(`/courses/listing/${examCategory || 'all'}`)}
                className="px-4 py-2 text-sm font-bold transition-all whitespace-nowrap border-b-2 border-transparent text-muted-foreground hover:text-foreground"
              >
                All Batches
              </button>
              {availableBranches.map((branch) => (
                <button
                  key={branch}
                  onClick={() => navigate(`/courses/listing/${examCategory || 'all'}?branch=${branch}`)}
                  className="px-4 py-2 text-sm font-bold transition-all whitespace-nowrap border-b-2 border-transparent text-muted-foreground hover:text-foreground"
                >
                  {branch}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BRANCH SECTIONS */}
        <div className="pb-32 bg-white">
          <section className="max-w-6xl mx-auto px-4 md:px-8 pt-16">
            {contentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)}
              </div>
            ) : (
              availableBranches.map((branch) => {
                const branchCourses = categoryCourses.filter(c => c.branch === branch).slice(0, 3);
                if (branchCourses.length === 0) return null;
                return (
                  <div key={branch} className="mb-24">
                    <div className="mb-10">
                      <h3 className="text-2xl md:text-3xl font-black text-[#1a1a1a]">
                        {currentCategoryData?.name} - {branch} Courses
                      </h3>
                      <div className="h-1.5 w-16 bg-[#1E40AF] mt-3 rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                      {branchCourses.map((course, index) => (
                        <CourseCard course={course} index={index} key={course.id} />
                      ))}
                    </div>
                    <div className="flex justify-center mt-14">
                      <Button 
                        variant="default" 
                        className="rounded-lg px-14 py-8 text-lg font-bold shadow-xl bg-[#1E40AF] text-white hover:bg-[#1E3A8A] transition-all hover:scale-105"
                        onClick={() => navigate(`/courses/listing/${examCategory || 'all'}?branch=${branch}`)}
                      >
                        View All Courses
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// QUICK LINK CARD COMPONENT (REDUCED HEIGHT)
const QuickLinkCard = ({ title, desc, icon: Icon, cardColor, iconColor, onClick }: {
  title: string; desc: string; icon: React.ElementType; cardColor: string; iconColor: string; onClick: () => void;
}) => (
  <button 
    onClick={onClick}
    className={`group relative h-[130px] w-full rounded-xl px-6 flex flex-col justify-center border-2 border-transparent transition-all hover:border-black text-left ${cardColor}`}
  >
    <div className="absolute -top-6 left-5 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md z-10 border border-black/5">
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <div className="mt-4">
      <h3 className="text-lg font-bold text-[#1a1a1a] mb-1 leading-tight">{title}</h3>
      <p className="text-[0.85rem] text-[#5f6368] font-medium">{desc}</p>
    </div>
    <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a1a1a]" />
  </button>
);

export default Courses;
