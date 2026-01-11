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
  
  // Applied Filter States
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string | null>(null);

  // Temporary states for Apply/Cancel logic
  const [tempLevels, setTempLevels] = useState<string[]>([]);
  const [tempSubjects, setTempSubjects] = useState<string[]>([]);
  const [tempPrice, setTempPrice] = useState<string | null>(null);

  // Dropdown State (Only one open at a time)
  const [openDropdown, setOpenDropdown] = useState<'level' | 'subject' | 'pricing' | null>(null);

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
      } catch (err) { 
        console.error('Error fetching banner:', err); 
      } finally { 
        setBannerLoading(false); 
      }
    };
    fetchBanner();
  }, [location.pathname, location.search, examCategory]);

  // 4. DATA FILTERING LOGIC
  const currentCategoryName = useMemo(() => {
    if (!examCategory) return "All Courses";
    return examCategory.replace(/-/g, ' ').toUpperCase();
  }, [examCategory]);

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

  const availableBranches = useMemo(() => Array.from(new Set(categoryFilteredCourses.map(c => c.branch))).filter(Boolean).sort(), [categoryFilteredCourses]);
  const availableLevels = useMemo(() => Array.from(new Set(branchFilteredCourses.map(c => c.level))).filter(Boolean).sort(), [branchFilteredCourses]);
  const availableSubjects = useMemo(() => Array.from(new Set(branchFilteredCourses.map(c => c.subject))).filter(Boolean).sort(), [branchFilteredCourses]);

  const filteredCourses = useMemo(() => {
    let result = [...branchFilteredCourses];
    if (selectedLevels.length > 0) result = result.filter(c => selectedLevels.includes(c.level || ''));
    if (selectedSubjects.length > 0) result = result.filter(c => selectedSubjects.includes(c.subject || ''));
    if (priceRange) {
      const getPrice = (c: any) => c.discounted_price ?? c.price;
      if (priceRange === 'free') result = result.filter(c => getPrice(c) === 0);
      if (priceRange === 'paid') result = result.filter(c => getPrice(c) > 0);
    }
    return result;
  }, [branchFilteredCourses, selectedLevels, selectedSubjects, priceRange]);

  const groupedCourses = useMemo(() => {
    const groups: Record<string, typeof filteredCourses> = {};
    filteredCourses.forEach(course => {
      const type = course.course_type || "Available Batches";
      if (!groups[type]) groups[type] = [];
      groups[type].push(course);
    });
    return groups;
  }, [filteredCourses]);

  // 5. HANDLERS
  const toggleDropdown = (type: 'level' | 'subject' | 'pricing') => {
    if (openDropdown === type) {
      setOpenDropdown(null);
    } else {
      setTempLevels(selectedLevels);
      setTempSubjects(selectedSubjects);
      setTempPrice(priceRange);
      setOpenDropdown(type);
    }
  };

  const handleApply = () => {
    setSelectedLevels(tempLevels);
    setSelectedSubjects(tempSubjects);
    setPriceRange(tempPrice);
    setOpenDropdown(null);
  };

  const handleCancel = () => setOpenDropdown(null);

  const toggleTempItem = (item: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
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

        {/* HERO AREA */}
        <div className="relative overflow-hidden flex flex-col items-center px-4 py-6 md:py-8 border-b border-border/50">
          <div className="absolute top-0 left-0 w-[45%] h-full bg-gradient-to-br from-[#e6f0ff]/70 to-transparent z-0 pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          <div className="absolute bottom-0 right-0 w-[50%] h-full bg-gradient-to-tl from-[#ebf2ff]/80 to-transparent z-0 pointer-events-none" style={{ clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }} />

          <div className="relative z-10 w-full max-w-6xl font-['Inter',sans-serif]">
            <nav className="flex items-center gap-2 text-[#666] text-xs mb-3 font-normal">
              <Link to="/" className="hover:text-primary transition-colors"><Home className="w-3 h-3" /></Link>
              <ChevronRight className="w-3 h-3 opacity-50" />
              <Link to="/courses" className="hover:text-primary transition-colors uppercase tracking-tight">{currentCategoryName}</Link>
              <ChevronRight className="w-3 h-3 opacity-50" />
              <span className="font-bold text-[#1E3A8A] uppercase tracking-tight">BATCHES</span>
            </nav>

            <h1 className="text-xl md:text-3xl font-bold text-[#1a1a1a] mb-2 leading-tight uppercase tracking-tight">
              {currentCategoryName} Online Coaching
            </h1>
            <p className="text-[#555] text-xs md:text-sm leading-relaxed max-w-4xl mb-2 font-normal">
              Access curated coaching and live sessions for {currentCategoryName} preparation. Explore lectures, study materials, and mock test series to ensure academic success.
            </p>
          </div>
        </div>

        {/* STICKY FILTER BAR - Left Aligned & Reduced Height/Zoom */}
        <div 
          ref={filterRef}
          className={`w-full z-40 transition-shadow duration-300 ${isSticky ? 'fixed top-16 bg-white border-b shadow-none' : 'relative'}`}
        >
          {/* Branch Row */}
          <div className="bg-[#f4f2ff]">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <div className="flex gap-8 pt-4 overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => setSearchParams({})}
                  className={`pb-2 text-[14px] md:text-[15px] cursor-pointer transition-all whitespace-nowrap font-sans ${
                    !branchFromUrl ? 'text-[#6366f1] border-b-[3px] border-[#6366f1] font-semibold' : 'text-[#6b7280] font-medium hover:text-[#4b5563]'
                  }`}
                >
                  All Batches
                </button>
                {availableBranches.map((branch) => (
                  <button
                    key={branch}
                    onClick={() => setSearchParams({ branch: branch })}
                    className={`pb-2 text-[14px] md:text-[15px] cursor-pointer transition-all whitespace-nowrap font-sans ${
                      branchFromUrl === branch ? 'text-[#6366f1] border-b-[3px] border-[#6366f1] font-semibold' : 'text-[#6b7280] font-medium hover:text-[#4b5563]'
                    }`}
                  >
                    {branch}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Pills Row */}
          <div className="bg-white border-b border-[#f3f4f6]">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <div className="flex flex-wrap items-center gap-3 py-3 font-sans">
                {/* Level Multi-Selector */}
                <div className="relative">
                  <button 
                    onClick={() => toggleDropdown('level')} 
                    className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all ${
                      selectedLevels.length > 0 ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white border-[#e5e7eb] text-[#374151]'
                    }`}
                  >
                    Level {selectedLevels.length > 0 ? `(${selectedLevels.length})` : ''} 
                    <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'level' ? 'rotate-180 border-t-white' : 'border-t-[#374151]'} border-l-transparent border-r-transparent`}></span>
                  </button>
                  {openDropdown === 'level' && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-50 min-w-[180px] p-3">
                      <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1">
                        {availableLevels.map(lvl => (
                          <label key={lvl} className="flex items-center gap-2 p-1.5 hover:bg-[#f9fafb] rounded cursor-pointer text-xs">
                            <input 
                              type="checkbox" 
                              checked={tempLevels.includes(lvl)} 
                              onChange={() => toggleTempItem(lvl, tempLevels, setTempLevels)} 
                              className="accent-[#6366f1]" 
                            /> {lvl}
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        <button onClick={handleCancel} className="flex-1 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 rounded transition-colors">Cancel</button>
                        <button onClick={handleApply} className="flex-1 py-1 text-[11px] font-semibold bg-[#6366f1] text-white rounded hover:bg-[#5255e0] transition-colors">Apply</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subject Multi-Selector */}
                <div className="relative">
                  <button 
                    onClick={() => toggleDropdown('subject')} 
                    className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all ${
                      selectedSubjects.length > 0 ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white border-[#e5e7eb] text-[#374151]'
                    }`}
                  >
                    Subject {selectedSubjects.length > 0 ? `(${selectedSubjects.length})` : ''} 
                    <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'subject' ? 'rotate-180 border-t-white' : 'border-t-[#374151]'} border-l-transparent border-r-transparent`}></span>
                  </button>
                  {openDropdown === 'subject' && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-50 min-w-[180px] p-3">
                      <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1">
                        {availableSubjects.map(sub => (
                          <label key={sub} className="flex items-center gap-2 p-1.5 hover:bg-[#f9fafb] rounded cursor-pointer text-xs">
                            <input 
                              type="checkbox" 
                              checked={tempSubjects.includes(sub)} 
                              onChange={() => toggleTempItem(sub, tempSubjects, setTempSubjects)} 
                              className="accent-[#6366f1]" 
                            /> {sub}
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        <button onClick={handleCancel} className="flex-1 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 rounded transition-colors">Cancel</button>
                        <button onClick={handleApply} className="flex-1 py-1 text-[11px] font-semibold bg-[#6366f1] text-white rounded hover:bg-[#5255e0] transition-colors">Apply</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => toggleDropdown('pricing')} 
                    className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all ${
                      priceRange ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white border-[#e5e7eb] text-[#374151]'
                    }`}
                  >
                    Pricing {priceRange ? `: ${priceRange}` : ''} 
                    <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'pricing' ? 'rotate-180 border-t-white' : 'border-t-[#374151]'} border-l-transparent border-r-transparent`}></span>
                  </button>
                  {openDropdown === 'pricing' && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-50 min-w-[180px] p-3">
                      <div className="space-y-1.5 mb-3">
                        {['free', 'paid'].map((opt) => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-slate-50 rounded text-xs capitalize">
                            <input 
                              type="radio" 
                              name="price" 
                              checked={tempPrice === opt} 
                              onChange={() => setTempPrice(opt)} 
                              className="accent-[#6366f1]" 
                            /> {opt}
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        <button onClick={handleCancel} className="flex-1 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 rounded transition-colors">Cancel</button>
                        <button onClick={handleApply} className="flex-1 py-1 text-[11px] font-semibold bg-[#6366f1] text-white rounded hover:bg-[#5255e0] transition-colors">Apply</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Placeholder Dropdown */}
                <div className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] md:text-[13px] text-[#374151] opacity-50 bg-[#f9fafb] flex items-center">
                  Language <span className="ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-t-[#374151] border-l-transparent border-r-transparent"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Spacer */}
        {isSticky && <div className="h-[120px]" />}

        {/* RESULTS SECTION */}
        <div className="pb-32 bg-white">
          <section className="max-w-6xl mx-auto px-4 md:px-8 pt-8 font-['Inter',sans-serif]">
            {contentLoading ? (
              <div className="grid lg:grid-cols-3 gap-6">{Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)}</div>
            ) : filteredCourses.length === 0 ? (
              <div className="py-20 text-center bg-[#f8faff] rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-sm font-semibold text-slate-400">No batches match your selected filters.</p>
                <button 
                  onClick={() => { setSelectedLevels([]); setSelectedSubjects([]); setPriceRange(null); setSearchParams({}); }} 
                  className="mt-2 text-[#6366f1] text-sm font-bold hover:underline"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              Object.entries(groupedCourses).map(([groupName, groupCourses]) => (
                <div key={groupName} className="mb-20">
                  <div className="mb-8">
                    <h3 className="text-lg md:text-xl font-bold text-[#1a1a1a] uppercase tracking-tight">
                      Showing {groupCourses.length} Batches
                    </h3>
                    <div className="h-1 w-12 bg-[#6366f1] mt-2 rounded-full" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupCourses.map((course, index) => (
                      <CourseCard key={course.id} course={course} index={index} />
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
