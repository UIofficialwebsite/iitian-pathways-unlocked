import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, Link, useSearchParams, useLocation } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import CourseCardSkeleton from "@/components/courses/CourseCardSkeleton";
import CourseCard from "@/components/courses/CourseCard";
import { supabase } from "@/integrations/supabase/client";
import { 
  ChevronRight,
  Home,
  ChevronDown,
  X
} from "lucide-react";

const CourseListing = () => {
  const { examCategory } = useParams<{ examCategory?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { courses, contentLoading } = useBackend();
  
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [bannerLoading, setBannerLoading] = useState(true);

  // Active Filter States
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Dropdown Open States
  const [pricingOpen, setPricingOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);

  // Temporary state for the Pricing Dropdown (for Apply/Cancel logic)
  const [tempPrice, setTempPrice] = useState<string | null>(null);

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

  // BANNER FETCHING
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
      } catch (err) { console.error('Error fetching banner:', err); } finally { setBannerLoading(false); }
    };
    fetchBanner();
  }, [location.pathname, location.search, examCategory]);

  // DATA FILTERING LOGIC
  const categoryFilteredCourses = useMemo(() => {
    if (!examCategory || examCategory === 'all') return courses;
    return courses.filter(course => 
      course.exam_category?.toLowerCase().replace(/[\s_]/g, '-') === examCategory.toLowerCase()
    );
  }, [courses, examCategory]);

  const branchFilteredCourses = useMemo(() => {
    if (!branchFromUrl) return categoryFilteredCourses;
    return categoryFilteredCourses.filter(c => c.branch === branchFromUrl);
  }, [categoryFilteredCourses, branchFromUrl]);

  // Dynamic Options based on current Category/Branch selection
  const availableBranches = useMemo(() => {
    return Array.from(new Set(categoryFilteredCourses.map(c => c.branch))).filter(Boolean).sort();
  }, [categoryFilteredCourses]);

  const availableLevels = useMemo(() => {
    return Array.from(new Set(branchFilteredCourses.map(c => c.level))).filter(Boolean).sort();
  }, [branchFilteredCourses]);

  const availableSubjects = useMemo(() => {
    let base = branchFilteredCourses;
    if (selectedLevel) base = base.filter(c => c.level === selectedLevel);
    return Array.from(new Set(base.map(c => c.subject))).filter(Boolean).sort();
  }, [branchFilteredCourses, selectedLevel]);

  const filteredCourses = useMemo(() => {
    let result = [...branchFilteredCourses];
    if (selectedLevel) result = result.filter(c => c.level === selectedLevel);
    if (selectedSubject) result = result.filter(c => c.subject === selectedSubject);
    if (priceRange) {
      const getPrice = (c: any) => c.discounted_price ?? c.price;
      if (priceRange === 'free') result = result.filter(c => getPrice(c) === 0);
      if (priceRange === 'paid') result = result.filter(c => getPrice(c) > 0);
    }
    return result;
  }, [branchFilteredCourses, selectedLevel, selectedSubject, priceRange]);

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
    setPriceRange(null);
    setSelectedLevel(null);
    setSelectedSubject(null);
    setSearchParams({}); 
  };

  const handleApplyPrice = () => {
    setPriceRange(tempPrice);
    setPricingOpen(false);
  };

  return (
    <div className="min-h-screen font-sans text-foreground w-full overflow-x-hidden bg-[#fcfcfc] relative">
      <NavBar />
      
      <main className="pt-16">
        <section className="w-full h-[clamp(120px,20vw,200px)] bg-muted overflow-hidden relative z-10 border-b border-border/50">
          {bannerLoading ? <div className="w-full h-full animate-pulse bg-muted" /> : bannerImage && <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />}
        </section>

        {/* HERO AREA */}
        <div className="relative overflow-hidden flex flex-col items-center px-4 py-4 md:py-6 border-b border-border/50">
          <div className="absolute top-0 left-0 w-[45%] h-full bg-gradient-to-br from-[#e6f0ff]/70 to-transparent z-0 pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          <div className="absolute bottom-0 right-0 w-[50%] h-full bg-gradient-to-tl from-[#ebf2ff]/80 to-transparent z-0 pointer-events-none" style={{ clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }} />
          <div className="relative z-10 w-full max-w-6xl">
            <nav className="flex items-center gap-2 text-[#666] text-xs mb-2 font-['Inter',sans-serif]">
              <Link to="/" className="hover:text-primary transition-colors"><Home className="w-3 h-3" /></Link>
              <ChevronRight className="w-3 h-3 opacity-50" />
              <Link to="/courses" className="hover:text-primary transition-colors uppercase tracking-tight">{examCategory?.replace(/-/g, ' ')}</Link>
              <ChevronRight className="w-3 h-3 opacity-50" />
              <span className="font-bold text-[#1E3A8A] uppercase tracking-tight">BATCHES</span>
            </nav>
            <h1 className="text-xl md:text-2xl font-bold text-[#1a1a1a] mb-1 leading-tight font-['Inter',sans-serif]">Explore {examCategory?.replace(/-/g, ' ')} Coaching Batches</h1>
          </div>
        </div>

        {/* STICKY FILTER BAR */}
        <div ref={filterRef} className={`w-full z-40 transition-shadow duration-300 ${isSticky ? 'fixed top-16 shadow-lg' : 'relative'}`}>
          {/* BRANCH FILTER - Reduced Height */}
          <div className="bg-[#f4f2ff] pt-4 flex justify-center">
            <div className="flex gap-8 overflow-x-auto no-scrollbar px-4">
              <button onClick={() => setSearchParams({})} className={`pb-2 text-[16px] transition-all whitespace-nowrap ${!branchFromUrl ? 'text-[#6366f1] border-b-2 border-[#6366f1] font-semibold' : 'text-[#6b7280] font-medium'}`}>All Batches</button>
              {availableBranches.map((branch: string) => (
                <button key={branch} onClick={() => setSearchParams({ branch: branch })} className={`pb-2 text-[16px] transition-all whitespace-nowrap ${branchFromUrl === branch ? 'text-[#6366f1] border-b-2 border-[#6366f1] font-semibold' : 'text-[#6b7280] font-medium'}`}>{branch}</button>
              ))}
            </div>
          </div>

          {/* SECONDARY FILTERS - Reduced Height */}
          <div className="bg-white py-4 border-b border-[#f3f4f6] flex justify-center">
            <div className="flex flex-wrap justify-center gap-[10px] max-w-[1200px] px-5 font-sans">
              
              {/* LEVEL FILTER */}
              <div className="relative">
                <button onClick={() => setLevelOpen(!levelOpen)} className={`px-5 py-2 border rounded-[30px] text-[14px] flex items-center transition-all ${selectedLevel ? 'bg-[#6366f1] text-white' : 'bg-white border-[#e5e7eb] text-[#374151]'}`}>
                  Level {selectedLevel ? `: ${selectedLevel}` : ''} <ChevronDown className="ml-2 w-4 h-4" />
                </button>
                {levelOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white border rounded-xl shadow-xl z-50 min-w-[160px] p-1">
                    <button onClick={() => {setSelectedLevel(null); setLevelOpen(false);}} className="w-full text-left px-4 py-2 text-xs hover:bg-[#f9fafb]">All Levels</button>
                    {availableLevels.map(lvl => (
                      <button key={lvl} onClick={() => {setSelectedLevel(lvl); setLevelOpen(false);}} className="w-full text-left px-4 py-2 text-xs hover:bg-[#f9fafb] capitalize">{lvl}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* SUBJECT FILTER */}
              <div className="relative">
                <button onClick={() => setSubjectOpen(!subjectOpen)} className={`px-5 py-2 border rounded-[30px] text-[14px] flex items-center transition-all ${selectedSubject ? 'bg-[#6366f1] text-white' : 'bg-white border-[#e5e7eb] text-[#374151]'}`}>
                  Subject {selectedSubject ? `: ${selectedSubject}` : ''} <ChevronDown className="ml-2 w-4 h-4" />
                </button>
                {subjectOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white border rounded-xl shadow-xl z-50 min-w-[160px] p-1">
                    <button onClick={() => {setSelectedSubject(null); setSubjectOpen(false);}} className="w-full text-left px-4 py-2 text-xs hover:bg-[#f9fafb]">All Subjects</button>
                    {availableSubjects.map(sub => (
                      <button key={sub} onClick={() => {setSelectedSubject(sub); setSubjectOpen(false);}} className="w-full text-left px-4 py-2 text-xs hover:bg-[#f9fafb] capitalize">{sub}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* PRICING FILTER - Custom Dropdown with Apply/Cancel */}
              <div className="relative">
                <button onClick={() => {setPricingOpen(!pricingOpen); setTempPrice(priceRange);}} className={`px-5 py-2 border rounded-[30px] text-[14px] flex items-center transition-all ${priceRange ? 'bg-[#6366f1] text-white' : 'bg-white border-[#e5e7eb] text-[#374151]'}`}>
                  Pricing {priceRange ? `: ${priceRange}` : ''} <ChevronDown className="ml-2 w-4 h-4" />
                </button>
                {pricingOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-2xl z-50 min-w-[200px] p-3">
                    <div className="space-y-2 mb-4">
                      {['free', 'paid'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded-md">
                          <input type="radio" name="price" checked={tempPrice === opt} onChange={() => setTempPrice(opt)} className="accent-[#6366f1]" />
                          <span className="text-sm capitalize font-medium">{opt}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button onClick={() => setPricingOpen(false)} className="flex-1 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-md transition-colors">Cancel</button>
                      <button onClick={handleApplyPrice} className="flex-1 px-3 py-1.5 text-xs font-semibold bg-[#6366f1] text-white rounded-md hover:bg-[#5255e0] transition-colors">Apply</button>
                    </div>
                  </div>
                )}
              </div>

              {(priceRange || branchFromUrl || selectedLevel || selectedSubject) && (
                <button onClick={clearAllFilters} className="px-5 py-2 text-[14px] font-bold text-destructive hover:bg-destructive/10 rounded-[30px] flex items-center gap-1 transition-all"><X className="w-4 h-4" /> Clear</button>
              )}
            </div>
          </div>
        </div>

        {isSticky && <div className="h-[140px]" />}

        <div className="pb-32 bg-white min-h-[500px]">
          <section className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
            {contentLoading ? (
              <div className="grid lg:grid-cols-3 gap-6">{Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)}</div>
            ) : filteredCourses.length === 0 ? (
              <div className="py-20 text-center bg-[#f8faff] rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-lg font-semibold text-slate-400">No batches match your selected filters.</p>
                <button onClick={clearAllFilters} className="mt-4 text-[#6366f1] font-bold hover:underline">Reset All Filters</button>
              </div>
            ) : Object.entries(groupedCourses).map(([groupName, groupCourses]) => (
              <div key={groupName} className="mb-20">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-[#1a1a1a] uppercase tracking-tight">{groupName}</h3>
                  <div className="h-1 w-12 bg-[#6366f1] mt-2 rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupCourses.map((course, index) => (
                    <CourseCard key={course.id} course={course} index={index} />
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
