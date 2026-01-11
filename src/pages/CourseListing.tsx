import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import CourseCardSkeleton from "@/components/courses/CourseCardSkeleton";
import CourseCard from "@/components/courses/CourseCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight,
  Home,
  X
} from "lucide-react";

const CourseListing = () => {
  // 1. URL & ROUTING STATE
  const { examCategory } = useParams<{ examCategory?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { courses, contentLoading } = useBackend();
  
  // 2. COMPONENT STATE
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [pricingDropdownOpen, setPricingDropdownOpen] = useState(false);
  
  // 3. STICKY FILTER LOGIC
  const filterRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [filterOffset, setFilterOffset] = useState(0);

  const branchFromUrl = searchParams.get('branch');

  useEffect(() => {
    if (filterRef.current) setFilterOffset(filterRef.current.offsetTop);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const navbarHeight = 64; 
      if (filterRef.current && filterOffset > 0) {
        setIsSticky(window.scrollY > filterOffset - navbarHeight);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filterOffset]);

  // BANNER FETCHING - Grounded in Supabase integration
  useEffect(() => {
    const fetchBanner = async () => {
      setBannerLoading(true);
      try {
        const { data } = await supabase.from('page_banners').select('image_url, page_path');
        if (data) {
          const currentFullPath = location.pathname + location.search;
          const match = data.find(b => {
            const dbPath = b.page_path.replace(/^(?:\/\/|[^\/]+)*\//, '/');
            return dbPath === currentFullPath || dbPath === location.pathname || dbPath === (examCategory || 'courses');
          });
          setBannerImage(match?.image_url || null);
        }
      } catch (err) { 
        console.error('Error fetching banner:', err); 
      } finally { 
        setBannerLoading(false); 
      }
    };
    fetchBanner();
  }, [location.pathname, location.search, examCategory]);

  // 4. DATA LOGIC - Grounded in useBackend hook
  const currentCategoryData = useMemo(() => {
    if (!examCategory) return { name: "All Courses" };
    const match = courses.find(c => c.exam_category?.toLowerCase().replace(/[\s_]/g, '-') === examCategory.toLowerCase());
    return match ? { name: match.exam_category } : { name: examCategory.replace(/-/g, ' ') };
  }, [courses, examCategory]);

  const categoryFilteredCourses = useMemo(() => {
    if (!examCategory || examCategory === 'all') return courses;
    return courses.filter(course => 
      course.exam_category?.toLowerCase().replace(/[\s_]/g, '-') === examCategory.toLowerCase()
    );
  }, [courses, examCategory]);

  // Dynamically generate branches based on available courses
  const availableBranches = useMemo(() => {
    const branches = Array.from(new Set(categoryFilteredCourses.map(c => c.branch))).filter(Boolean) as string[];
    return branches.sort();
  }, [categoryFilteredCourses]);

  const filteredCourses = useMemo(() => {
    let result = [...categoryFilteredCourses];
    if (branchFromUrl) result = result.filter(course => course.branch === branchFromUrl);
    if (selectedMode) result = result.filter(course => course.course_type?.toLowerCase() === selectedMode.toLowerCase());
    if (priceRange) {
      const price = (course: any) => course.discounted_price || course.price;
      const ranges: Record<string, (p: number) => boolean> = {
        'free': (p) => p === 0,
        'under-1000': (p) => p > 0 && p < 1000,
        '1000-5000': (p) => p >= 1000 && p <= 5000,
        'above-5000': (p) => p > 5000
      };
      if (ranges[priceRange]) result = result.filter(course => ranges[priceRange](price(course)));
    }
    return result;
  }, [categoryFilteredCourses, branchFromUrl, selectedMode, priceRange]);

  const groupedCourses = useMemo(() => {
    const groups: Record<string, typeof filteredCourses> = {};
    filteredCourses.forEach(course => {
      const type = course.course_type || "Available Batches";
      if (!groups[type]) groups[type] = [];
      groups[type].push(course);
    });
    return groups;
  }, [filteredCourses]);

  const clearAllFilters = () => {
    setSelectedMode(null);
    setPriceRange(null);
    setSearchParams({}); 
  };

  return (
    <div className="min-h-screen font-sans text-foreground w-full overflow-x-hidden bg-[#fcfcfc] relative">
      <NavBar />
      
      <main className="pt-16">
        {/* BANNER SECTION */}
        <section className="w-full h-[clamp(120px,20vw,200px)] bg-muted overflow-hidden relative z-10 border-b border-border/50">
          {bannerLoading ? (
            <div className="w-full h-full animate-pulse bg-muted" />
          ) : bannerImage && (
            <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
          )}
        </section>

        {/* HERO AREA - Grounded in SEO Helpers and Inter font */}
        <div className="relative overflow-hidden flex flex-col items-center px-4 py-6 md:py-8 border-b border-border/50">
          <div className="absolute top-0 left-0 w-[45%] h-full bg-gradient-to-br from-[#e6f0ff]/70 to-transparent z-0 pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          <div className="absolute bottom-0 right-0 w-[50%] h-full bg-gradient-to-tl from-[#ebf2ff]/80 to-transparent z-0 pointer-events-none" style={{ clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }} />

          <div className="relative z-10 w-full max-w-6xl font-['Inter',sans-serif]">
            <nav className="flex items-center gap-2 text-[#666] text-xs mb-3 font-normal">
              <Link to="/" className="hover:text-primary transition-colors"><Home className="w-3 h-3" /></Link>
              <ChevronRight className="w-3 h-3 opacity-50" />
              <Link to="/courses" className="hover:text-primary transition-colors uppercase tracking-tight">{currentCategoryData.name}</Link>
              {branchFromUrl && (
                <>
                  <ChevronRight className="w-3 h-3 opacity-50" />
                  <span className="uppercase tracking-tight text-[#1a1a1a] font-medium">{branchFromUrl}</span>
                </>
              )}
              <ChevronRight className="w-3 h-3 opacity-50" />
              <span className="font-bold text-[#1E3A8A] uppercase tracking-tight">BATCHES</span>
            </nav>
            <h1 className="text-xl md:text-3xl font-bold text-[#1a1a1a] mb-2 leading-tight">
              {currentCategoryData.name} Online Coaching {branchFromUrl && ` For ${branchFromUrl}`}
            </h1>
            <p className="text-[#555] text-xs md:text-sm leading-relaxed max-w-4xl mb-2 font-normal">
              Access curated coaching and live sessions for {currentCategoryData.name} preparation. Explore lectures, study materials, and mock test series to ensure academic success.
            </p>
          </div>
        </div>

        {/* STICKY FILTER BAR - Matches Requested HTML/CSS Design */}
        <div 
          ref={filterRef}
          className={`w-full z-40 transition-shadow duration-300 ${isSticky ? 'fixed top-16 shadow-lg' : 'relative'}`}
        >
          {/* Top Branch Navigation (Lavender Background) */}
          <div className="bg-[#f4f2ff] pt-6 flex justify-center">
            <div className="flex gap-10 overflow-x-auto no-scrollbar px-4">
              <button 
                onClick={() => setSearchParams({})}
                className={`pb-3 text-[18px] cursor-pointer transition-all whitespace-nowrap font-sans ${
                  !branchFromUrl ? 'text-[#6366f1] border-b-[3px] border-[#6366f1] font-semibold' : 'text-[#6b7280] font-medium hover:text-[#4b5563]'
                }`}
              >
                All Batches
              </button>
              {availableBranches.map((branch) => (
                <button
                  key={branch}
                  onClick={() => setSearchParams({ branch: branch })}
                  className={`pb-3 text-[18px] cursor-pointer transition-all whitespace-nowrap font-sans ${
                    branchFromUrl === branch ? 'text-[#6366f1] border-b-[3px] border-[#6366f1] font-semibold' : 'text-[#6b7280] font-medium hover:text-[#4b5563]'
                  }`}
                >
                  {branch}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filter Row (Pill Shapes) */}
          <div className="bg-white py-6 border-b border-[#f3f4f6] flex justify-center">
            <div className="flex flex-wrap justify-center gap-[14px] max-w-[1200px] px-5 font-sans">
              <button 
                onClick={() => setSelectedMode(selectedMode === 'online' ? null : 'online')} 
                className={`px-6 py-2.5 border rounded-[30px] text-[15px] transition-all ${
                  selectedMode === 'online' ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb]'
                }`}
              >
                Online
              </button>
              <button 
                onClick={() => setSelectedMode(selectedMode === 'offline' ? null : 'offline')} 
                className={`px-6 py-2.5 border rounded-[30px] text-[15px] transition-all ${
                  selectedMode === 'offline' ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb]'
                }`}
              >
                Offline
              </button>

              <div className="relative">
                <button 
                  onClick={() => setPricingDropdownOpen(!pricingDropdownOpen)} 
                  className={`px-6 py-2.5 border rounded-[30px] text-[15px] flex items-center transition-all ${
                    priceRange ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white border-[#e5e7eb] text-[#374151]'
                  }`}
                >
                  Pricing <span className={`ml-2.5 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] transition-transform ${pricingDropdownOpen ? 'rotate-180 border-t-white' : 'border-t-[#374151]'} border-l-transparent border-r-transparent`}></span>
                </button>
                {pricingDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-50 min-w-[160px] p-1">
                    {['free', 'under-1000', '1000-5000', 'above-5000'].map((val) => (
                      <button key={val} onClick={() => { setPriceRange(val); setPricingDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-medium rounded-lg hover:bg-[#f9fafb] capitalize">{val.replace('-', ' ')}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Functional filters only - Language and newly launched derived from existing course fields if applicable */}
              <div className="px-6 py-2.5 border border-[#e5e7eb] rounded-[30px] text-[15px] text-[#374151] cursor-not-allowed opacity-50 bg-[#f9fafb]">Language</div>
              <div className="px-6 py-2.5 border border-[#e5e7eb] rounded-[30px] text-[15px] text-[#374151] cursor-not-allowed opacity-50 bg-[#f9fafb]">Power Batch</div>

              {(selectedMode || priceRange || branchFromUrl) && (
                <button onClick={clearAllFilters} className="px-6 py-2.5 text-[15px] font-bold text-destructive hover:bg-destructive/10 rounded-[30px] flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {isSticky && <div className="h-[180px]" />}

        {/* RESULTS SECTION */}
        <div className="pb-32 bg-white">
          <section className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
            {contentLoading ? (
              <div className="grid lg:grid-cols-3 gap-6">{Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)}</div>
            ) : Object.entries(groupedCourses).map(([groupName, groupCourses]) => (
              <div key={groupName} className="mb-20">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-[#1a1a1a] font-['Inter',sans-serif] uppercase tracking-tight">{groupName}</h3>
                  <div className="h-1 w-12 bg-[#6366f1] mt-2 rounded-full" />
                </div>
                <div className="flex overflow-x-auto lg:overflow-x-visible lg:grid lg:grid-cols-3 gap-6 no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
                  {groupCourses.map((course, index) => (
                    <div key={course.id} className="w-[85vw] max-w-[320px] lg:w-auto flex-shrink-0">
                      <CourseCard course={course} index={index} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseListing;
