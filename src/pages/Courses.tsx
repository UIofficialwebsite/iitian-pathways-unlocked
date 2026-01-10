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
  BookOpen,
  ClipboardList,
  ArrowRight
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

  // Extract unique branches from the branch column
  const availableBranches = useMemo(() => {
    const branches = Array.from(new Set(courses.map(c => c.branch))).filter(Boolean) as string[];
    return branches;
  }, [courses]);

  const currentCategoryData = useMemo(() => {
    if (!examCategory) return { name: "All Courses" };
    // Match based on branch instead of exam_category
    const match = courses.find(c => c.branch?.toLowerCase().replace(/[\s_]/g, '-') === examCategory.toLowerCase());
    return match ? { name: match.branch } : { name: examCategory.replace(/-/g, ' ') };
  }, [courses, examCategory]);

  const branchFilteredCourses = useMemo(() => {
    let filtered = [...courses];
    
    // Filter by branch from URL
    if (examCategory) {
      filtered = filtered.filter(course => 
        course.branch?.toLowerCase().replace(/[\s_]/g, '-') === examCategory.toLowerCase()
      );
    }
    
    return filtered;
  }, [courses, examCategory]);

  const featuredCourses = useMemo(() => {
    const bestsellers = branchFilteredCourses.filter(c => c.bestseller);
    return bestsellers.length >= 3 ? bestsellers.slice(0, 3) : branchFilteredCourses.slice(0, 3);
  }, [branchFilteredCourses]);

  const powerCourses = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 60);
    
    const newOrPower = branchFilteredCourses.filter(course => 
      (course.created_at && new Date(course.created_at) > thirtyDaysAgo) ||
      course.course_type?.toLowerCase().includes('power')
    );
    
    if (newOrPower.length < 3) {
      const featuredIds = new Set(featuredCourses.map(c => c.id));
      const remaining = branchFilteredCourses.filter(c => !featuredIds.has(c.id));
      return remaining.slice(0, 3);
    }
    
    return newOrPower.slice(0, 3);
  }, [branchFilteredCourses, featuredCourses]);

  return (
    <div className="min-h-screen font-sans text-foreground w-full overflow-x-hidden bg-background relative">
      <NavBar />
      
      <main className="pt-16">
        <div className="relative overflow-hidden bg-muted/20">
          <div 
            className="absolute top-0 left-0 w-[45%] h-full bg-gradient-to-br from-primary/5 to-transparent z-0 pointer-events-none"
            style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
          />
          <div 
            className="absolute bottom-0 right-0 w-[50%] h-full bg-gradient-to-tl from-primary/10 to-transparent z-0 pointer-events-none"
            style={{ clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }}
          />

          <div className="relative z-10">
            <section className="w-full h-[160px] md:h-[260px] bg-muted overflow-hidden mb-4">
              {bannerLoading ? (
                <div className="w-full h-full animate-pulse bg-muted" />
              ) : bannerImage ? (
                <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-muted to-muted/80" />
              )}
            </section>

            <nav className="max-w-6xl mx-auto px-4 md:px-8 py-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Link to="/" className="hover:text-primary transition-colors"><Home className="w-3.5 h-3.5" /></Link>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                <span className="uppercase tracking-wide text-muted-foreground">Courses</span>
                {examCategory && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    <span className="font-bold text-foreground uppercase">{currentCategoryData?.name}</span>
                  </>
                )}
              </div>
            </nav>

            <section className="max-w-6xl mx-auto px-4 md:px-8 pb-8">
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3 tracking-tight leading-tight">
                {currentCategoryData?.name} 2026: Resources & Prep
              </h1>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-4xl font-medium">
                Access our specialized study hub featuring updated syllabus, comprehensive PDF banks, 
                and the latest exam alerts curated by expert IITians.
              </p>
            </section>

            {examCategory && (
              <section className="max-w-6xl mx-auto px-4 md:px-8 mb-16">
                <div className="bg-card rounded-2xl border border-border p-8 md:p-10 pt-14 md:pt-14 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
                    <QuickLinkTab title="Syllabus" desc="Detailed Course Roadmap" icon={LayoutList} bgColor="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600 dark:text-blue-400" onClick={() => navigate('/digital-library')} />
                    <QuickLinkTab title="PDF Bank" desc="Access Notes & PDFs" icon={FileText} bgColor="bg-rose-100 dark:bg-rose-900/30" iconColor="text-rose-500 dark:text-rose-400" onClick={() => navigate('/digital-library')} />
                    <QuickLinkTab title="Important Dates" desc="Check Exam Schedule" icon={ClipboardList} bgColor="bg-green-100 dark:bg-green-900/30" iconColor="text-green-500 dark:text-green-400" onClick={() => navigate('/digital-library')} />
                    <QuickLinkTab title="Latest News" desc="Stay Updated on Exams" icon={BookOpen} bgColor="bg-sky-100 dark:bg-sky-900/30" iconColor="text-sky-500 dark:text-sky-400" onClick={() => navigate('/digital-library')} />
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="w-full bg-background border-b border-border">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => navigate('/courses/listing/all')}
                className={`px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap border-b-2 ${
                  !examCategory || examCategory === 'all'
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                All Branches
              </button>
              {availableBranches.map((branch) => {
                const branchSlug = branch.toLowerCase().replace(/[\s_]/g, '-');
                return (
                  <button
                    key={branch}
                    onClick={() => navigate(`/courses/listing/${branchSlug}`)} // Navigate on selection
                    className={`px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap border-b-2 ${
                      examCategory === branchSlug 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {branch}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pb-24 bg-background">
          <section className="max-w-6xl mx-auto px-4 md:px-8">
            {contentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-10">
                {Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)}
              </div>
            ) : (
              <>
                {featuredCourses.length > 0 && (
                  <div className="pt-10 mb-16">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-foreground">Featured Batches</h3>
                        <div className="h-0.5 w-12 bg-primary mt-1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {featuredCourses.map((course, index) => (
                        <CourseCard course={course} index={index} key={course.id} />
                      ))}
                    </div>
                    <div className="flex justify-center mt-10">
                      <Button 
                        variant="outline" 
                        className="rounded-full px-8 py-2 border-2 border-border font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all group"
                        onClick={() => navigate(`/courses/listing/${examCategory || 'all'}?filter=featured`)}
                      >
                        View All Batches
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                )}

                {powerCourses.length > 0 && (
                  <div className="mb-16">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-foreground">Power Batches & New Launches</h3>
                        <div className="h-0.5 w-12 bg-primary mt-1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {powerCourses.map((course, index) => (
                        <CourseCard course={course} index={index} key={course.id} />
                      ))}
                    </div>
                    <div className="flex justify-center mt-10">
                      <Button 
                        variant="outline" 
                        className="rounded-full px-8 py-2 border-2 border-border font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all group"
                        onClick={() => navigate(`/courses/listing/${examCategory || 'all'}`)}
                      >
                        View All Courses
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                )}

                {featuredCourses.length === 0 && powerCourses.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-lg text-muted-foreground">No courses available for this branch yet.</p>
                    <Button variant="outline" onClick={() => navigate('/courses')} className="mt-4">
                      Browse All Branches
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />
      <EmailPopup />
    </div>
  );
};

const QuickLinkTab = ({ title, desc, icon: Icon, bgColor, iconColor, onClick }: {
  title: string;
  desc: string;
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
  onClick: () => void;
}) => (
  <button 
    onClick={onClick}
    className={`group relative h-[110px] w-full rounded-xl px-5 flex flex-col justify-center border-2 border-transparent transition-all hover:border-primary text-left ${bgColor}`}
  >
    <div className="absolute -top-6 left-5 w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-md z-10 border border-border">
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div className="mt-2">
      <h3 className="text-sm md:text-base font-bold text-foreground mb-0.5 tracking-tight">{title}</h3>
      <p className="text-xs text-muted-foreground font-medium leading-tight">{desc}</p>
    </div>
    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
  </button>
);

export default Courses;
