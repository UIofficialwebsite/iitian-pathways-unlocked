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
        const { data, error } = await supabase
          .from('page_banners')
          .select('image_url, page_path')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data && data.length > 0) {
          // Banner priority: Path match > Category match > Default first
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

  // 4. DATA FILTERING LOGIC
  
  // Step A: Filter by Exam Category (from NavBar)
  const categoryFilteredCourses = useMemo(() => {
    if (!examCategory || examCategory === 'all') return courses;
    return courses.filter(course => 
      course.exam_category?.toLowerCase().replace(/[\s_]/g, '-') === examCategory.toLowerCase()
    );
  }, [courses, examCategory]);

  // Step B: Get unique branches relevant ONLY to the current category
  const availableBranches = useMemo(() => {
    const branches = Array.from(new Set(categoryFilteredCourses.map(c => c.branch))).filter(Boolean) as string[];
    return branches.sort();
  }, [categoryFilteredCourses]);

  // Step C: Apply all filters (Branch + Mode + Price)
  const filteredCourses = useMemo(() => {
    let result = [...categoryFilteredCourses];

    // Filter by branch (sync with URL param 'branch')
    if (branchFromUrl) {
      result = result.filter(course => course.branch === branchFromUrl);
    }

    // Filter by mode (Online/Offline)
    if (selectedMode) {
      result = result.filter(course => 
        course.course_type?.toLowerCase() === selectedMode.toLowerCase()
      );
    }

    // Filter by price range
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

  // Step D: Group final courses by Batch Type
  const groupedCourses = useMemo(() => {
    const groups: Record<string, typeof filteredCourses> = {};
    filteredCourses.forEach(course => {
      const type = course.course_type || "Available Batches";
      if (!groups[type]) groups[type] = [];
      groups[type].push(course);
    });
    return groups;
  }, [filteredCourses]);

  // Helper formatting
  const formatSlug = (slug: string) => slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const clearAllFilters = () => {
    setSelectedMode(null);
    setPriceRange(null);
    setSearchParams({}); // Clears branch from URL
  };

  const hasActiveFilters = selectedMode || priceRange || branchFromUrl;

  return (
    <div className="min-h-screen font-sans text-foreground w-full overflow-x-hidden bg-background">
      <NavBar />
      
      <main className="pt-16">
        {/* HEADER SECTION */}
        <div className="bg-muted/30 border-b border-border">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-6">
              <Link to="/" className="hover:text-primary transition-colors"><Home className="w-3.5 h-3.5" /></Link>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              <Link to="/courses" className="hover:text-primary transition-colors">COURSES</Link>
              {examCategory && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  <span className="font-bold text-foreground uppercase tracking-wider">{formatSlug(examCategory)}</span>
                </>
              )}
              {branchFromUrl && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  <span className="font-bold text-primary uppercase tracking-wider">{branchFromUrl}</span>
                </>
              )}
            </nav>

            <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
              {branchFromUrl ? `${branchFromUrl} Batches` : examCategory ? `${formatSlug(examCategory)} Courses` : "All Batches"}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-3xl font-medium">
              Explore specialized coaching and resources tailored for your {branchFromUrl || formatSlug(examCategory || 'academic')} journey.
            </p>
          </div>
        </div>

        {/* STICKY FILTER BAR */}
        <div 
          ref={filterRef}
          className={`w-full z-40 bg-background border-b border-border transition-all duration-300 ${
            isSticky ? 'fixed top-16 shadow-lg' : 'relative'
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
            {/* Primary Branch Filter (Dynamic) */}
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-3 mb-3 border-b border-border/50">
              <button 
                onClick={() => setSearchParams({})}
                className={`px-4 py-2 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
                  !branchFromUrl ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                All Batches
              </button>
              {availableBranches.map((branch) => (
                <button
                  key={branch}
                  onClick={() => setSearchParams({ branch: branch })}
                  className={`px-4 py-2 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
                    branchFromUrl === branch ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {branch}
                </button>
              ))}
            </div>

            {/* Secondary Filters (Mode & Price) */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mr-2">
                <Filter className="w-3.5 h-3.5" /> REFINE:
              </div>
              
              <button
                onClick={() => setSelectedMode(selectedMode === 'online' ? null : 'online')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  selectedMode === 'online' ? 'bg-primary text-white border-primary' : 'bg-background border-border hover:border-primary/50'
                }`}
              >
                Online
              </button>
              <button
                onClick={() => setSelectedMode(selectedMode === 'offline' ? null : 'offline')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  selectedMode === 'offline' ? 'bg-primary text-white border-primary' : 'bg-background border-border hover:border-primary/50'
                }`}
              >
                Offline
              </button>

              <div className="relative">
                <button
                  onClick={() => setPricingDropdownOpen(!pricingDropdownOpen)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    priceRange ? 'bg-primary text-white border-primary' : 'bg-background border-border hover:border-primary/50'
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
                        className={`w-full text-left px-4 py-2 text-xs font-medium rounded-lg hover:bg-muted transition-colors ${priceRange === opt.val ? 'text-primary bg-primary/5' : ''}`}
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
                  className="px-4 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-full transition-all flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Spacer when sticky */}
        {isSticky && <div className="h-[120px]" />}

        {/* RESULTS SUMMARY */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
          <p className="text-sm text-muted-foreground font-medium">
            Found <span className="text-foreground font-bold">{filteredCourses.length}</span> batches matching your criteria.
          </p>
        </div>

        {/* MAIN LISTING AREA */}
        <div className="pb-32">
          <section className="max-w-6xl mx-auto px-4 md:px-8">
            {contentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
                <p className="text-xl text-muted-foreground font-bold mb-4">No batches found.</p>
                <Button variant="default" onClick={clearAllFilters} className="font-bold">
                  Try Resetting Filters
                </Button>
              </div>
            ) : (
              Object.entries(groupedCourses).map(([groupName, groupCourses]) => (
                <div key={groupName} className="mb-20">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">{groupName}</h3>
                      <div className="h-1.5 w-12 bg-primary mt-2 rounded-full" />
                    </div>
                    <span className="text-sm font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">{groupCourses.length}</span>
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
    </div>
  );
};

export default CourseListing;
