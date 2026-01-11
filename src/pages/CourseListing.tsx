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
  ChevronDown,
  X,
  Filter
} from "lucide-react";

const CourseListing = () => {
  // 1. URL & ROUTING STATE
  const { examCategory } = useParams<{ examCategory?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
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

  // Synchronize internal selectedBranch with URL search param
  const branchFromUrl = searchParams.get('branch');

  useEffect(() => {
    if (filterRef.current) {
      setFilterOffset(filterRef.current.offsetTop);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const navbarHeight = 64; // Height of the NavBar
      if (filterRef.current && filterOffset > 0) {
        setIsSticky(window.scrollY > filterOffset - navbarHeight);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filterOffset]);

  useEffect(() => {
    const fetchBanner = async () => {
      setBannerLoading(true);
      try {
        const { data } = await supabase.from('page_banners').select('image_url, page_path');
        if (data) {
          const match = data.find(b => 
            b.page_path === location.pathname || 
            b.page_path === (examCategory || 'courses')
          );
          setBannerImage(match?.image_url || null);
        }
      } catch (err) { 
        console.error('Error fetching banner:', err); 
      } finally { 
        setBannerLoading(false); 
      }
    };
    fetchBanner();
  }, [location.pathname, examCategory]);

  // 4. DATA FILTERING LOGIC
  
  // For consistent naming and capitalization of categories
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

  const availableBranches = useMemo(() => {
    const branches = Array.from(new Set(categoryFilteredCourses.map(c => c.branch))).filter(Boolean) as string[];
    return branches.sort();
  }, [categoryFilteredCourses]);

  const filteredCourses = useMemo(() => {
    let result = [...categoryFilteredCourses];

    if (branchFromUrl) {
      result = result.filter(course => course.branch === branchFromUrl);
    }

    if (selectedMode) {
      result = result.filter(course => 
        course.course_type?.toLowerCase() === selectedMode.toLowerCase()
      );
    }

    if (priceRange) {
      const price = (course: any) => course.discounted_price || course.price;
      switch (priceRange) {
        case 'free':
          result = result.filter(course => price(course) === 0);
          break;
        case 'under-1000':
          result = result.filter(course => price(course) > 0 && price(course) < 1000);
          break;
        case '1000-5000':
          result = result.filter(course => price(course) >= 1000 && price(course) <= 5000);
          break;
        case 'above-5000':
          result = result.filter(course => price(course) > 5000);
          break;
      }
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

  const hasActiveFilters = selectedMode || priceRange || branchFromUrl;

  return (
    <div className="min-h-screen font-sans text-foreground w-full overflow-x-hidden bg-[#fcfdff] relative">
      <NavBar />
      
      <main className="pt-16">
        {/* BANNER SECTION - Matches Courses.tsx scale */}
        <section className="w-full h-[clamp(120px,20vw,200px)] bg-muted overflow-hidden relative z-10 border-b border-border/50">
          {bannerLoading ? (
            <div className="w-full h-full animate-pulse bg-muted" />
          ) : bannerImage ? (
            <img 
              src={bannerImage} 
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
             <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
              <h2 className="text-2xl font-black text-foreground/20 uppercase tracking-tighter">
                {currentCategoryData.name}
              </h2>
            </div>
          )}
        </section>

        {/* HERO AREA - Matches Courses.tsx Background & Fonts */}
        <div className="relative overflow-hidden flex flex-col items-center px-4 py-6 md:py-8 border-b border-border/50">
          {/* Background shapes logic ported from course page */}
          <div className="absolute top-0 left-0 w-[45%] h-full bg-gradient-to-br from-[#e6f0ff]/70 to-transparent z-0 pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          <div className="absolute bottom-0 right-0 w-[50%] h-full bg-gradient-to-tl from-[#ebf2ff]/80 to-transparent z-0 pointer-events-none" style={{ clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }} />

          <div className="relative z-10 w-full max-w-6xl">
            {/* Breadcrumb - Matches font-family and spacing of Courses.tsx */}
            <nav className="flex items-center gap-2 text-[#666] text-xs mb-3 font-normal font-['Inter',sans-serif]">
              <Link to="/" className="hover:text-primary transition-colors"><Home className="w-3 h-3" /></Link>
              <ChevronRight className="w-3 h-3 opacity-50" />
              <Link to="/courses" className="hover:text-primary transition-colors uppercase tracking-tight">
                {currentCategoryData.name}
              </Link>
              {branchFromUrl && (
                <>
                  <ChevronRight className="w-3 h-3 opacity-50" />
                  <span className="uppercase tracking-tight text-[#1a1a1a] font-medium">{branchFromUrl}</span>
                </>
              )}
              <ChevronRight className="w-3 h-3 opacity-50" />
              <span className="font-bold text-[#1E3A8A] uppercase tracking-tight">BATCHES</span>
            </nav>

            {/* Title - Ported size and font-weight from Courses.tsx */}
            <h1 className="text-xl md:text-3xl font-bold text-[#1a1a1a] mb-2 leading-tight font-['Inter',sans-serif]">
              {currentCategoryData.name} Online Coaching 
              {branchFromUrl && ` For ${branchFromUrl}`} Targeting 2026-27 Exams
            </h1>

            {/* Description - Ported text color and size */}
            <p className="text-[#555] text-xs md:text-sm leading-relaxed max-w-4xl mb-2 font-normal font-['Inter',sans-serif]">
              UI offers {branchFromUrl || currentCategoryData.name} coaching, including online classes in multiple languages. 
              Live and recorded sessions, doubt-solving support, and useful study materials. UI ensures a well-rounded preparation for {currentCategoryData.name} aspirants. 
              Check {branchFromUrl || currentCategoryData.name} lectures and mock test series for best preparation.
            </p>
          </div>
        </div>

        {/* STICKY FILTER BAR */}
        <div 
          ref={filterRef}
          className={`w-full z-40 bg-white border-b border-border transition-shadow duration-300 ${
            isSticky ? 'fixed top-16 shadow-lg' : 'relative'
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
            {/* Primary Branch Filter Tabs */}
            <div className="flex items-center gap-2 md:gap-6 overflow-x-auto no-scrollbar pb-3 mb-3 border-b border-border/50">
              <button 
                onClick={() => setSearchParams({})}
                className={`px-3 md:px-4 py-2 text-sm font-bold transition-all whitespace-nowrap border-b-2 font-['Inter',sans-serif] ${
                  !branchFromUrl ? 'border-[#1E3A8A] text-[#1E3A8A]' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                All Batches
              </button>
              {availableBranches.map((branch) => (
                <button
                  key={branch}
                  onClick={() => setSearchParams({ branch: branch })}
                  className={`px-3 md:px-4 py-2 text-sm font-bold transition-all whitespace-nowrap border-b-2 font-['Inter',sans-serif] ${
                    branchFromUrl === branch ? 'border-[#1E3A8A] text-[#1E3A8A]' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {branch}
                </button>
              ))}
            </div>

            {/* Secondary Filters Row */}
            <div className="flex items-center gap-2 md:gap-3 flex-wrap font-['Inter',sans-serif]">
              <button
                onClick={() => setSelectedMode(selectedMode === 'online' ? null : 'online')}
                className={`px-3 md:px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  selectedMode === 'online' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'bg-background border-border hover:border-[#1E3A8A]/50'
                }`}
              >
                Online
              </button>
              <button
                onClick={() => setSelectedMode(selectedMode === 'offline' ? null : 'offline')}
                className={`px-3 md:px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  selectedMode === 'offline' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'bg-background border-border hover:border-[#1E3A8A]/50'
                }`}
              >
                Offline
              </button>

              {/* Pricing Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setPricingDropdownOpen(!pricingDropdownOpen)}
                  className={`px-3 md:px-4 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    priceRange ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'bg-background border-border hover:border-[#1E3A8A]/50'
                  }`}
                >
                  Pricing <ChevronDown className={`w-3 h-3 transition-transform ${pricingDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {pricingDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 min-w-[160px] p-1 animate-in fade-in slide-in-from-top-2">
                    {[
                      { val: 'free', label: 'Free Batches' },
                      { val: 'under-1000', label: 'Under ₹1,000' },
                      { val: '1000-5000', label: '₹1,000 - ₹5,000' },
                      { val: 'above-5000', label: 'Above ₹5,000' }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => { setPriceRange(opt.val); setPricingDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-xs font-medium rounded-lg hover:bg-muted transition-colors ${priceRange === opt.val ? 'text-[#1E3A8A] bg-[#1E3A8A]/5' : ''}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-3 md:px-4 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-full transition-all flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Spacer when sticky */}
        {isSticky && <div className="h-[140px]" />}

        {/* RESULTS SUMMARY */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
          <p className="text-sm text-muted-foreground font-medium font-['Inter',sans-serif]">
            Found <span className="text-foreground font-bold">{filteredCourses.length}</span> batches matching your criteria.
          </p>
        </div>

        {/* MAIN LISTING AREA */}
        <div className="pb-32 bg-white">
          <section className="max-w-6xl mx-auto px-4 md:px-8">
            {contentLoading ? (
              <div className="flex overflow-x-auto lg:overflow-x-visible lg:grid lg:grid-cols-3 gap-5 lg:gap-6 no-scrollbar pb-4 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-[85vw] max-w-[320px] sm:w-[45vw] sm:max-w-[340px] lg:w-auto lg:max-w-none flex-shrink-0">
                    <CourseCardSkeleton />
                  </div>
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
                <p className="text-xl text-muted-foreground font-bold mb-4 font-['Inter',sans-serif]">No batches found.</p>
                <Button variant="default" onClick={clearAllFilters} className="font-bold bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                  Try Resetting Filters
                </Button>
              </div>
            ) : (
              Object.entries(groupedCourses).map(([groupName, groupCourses]) => (
                <div key={groupName} className="mb-20">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-[#1a1a1a] font-['Inter',sans-serif] uppercase tracking-tight">{groupName}</h3>
                      <div className="h-1 w-12 bg-[#1E3A8A] mt-2 rounded-full" />
                    </div>
                    <span className="text-sm font-bold text-[#1E3A8A] bg-blue-50 px-3 py-1 rounded-full">{groupCourses.length}</span>
                  </div>
                  
                  <div className="flex overflow-x-auto lg:overflow-x-visible lg:grid lg:grid-cols-3 gap-5 lg:gap-6 no-scrollbar pb-4 lg:pb-0 snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0">
                    {groupCourses.map((course, index) => (
                      <div key={course.id} className="w-[85vw] max-w-[320px] sm:w-[45vw] sm:max-w-[340px] lg:w-auto lg:max-w-none flex-shrink-0 snap-start">
                        <CourseCard course={course} index={index} />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseListing;
