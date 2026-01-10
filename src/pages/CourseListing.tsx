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
  X
} from "lucide-react";

const CourseListing = () => {
  const { examCategory, filterType } = useParams<{ examCategory?: string; filterType?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { courses, contentLoading } = useBackend();
  
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [bannerLoading, setBannerLoading] = useState(true);
  
  // Filter states
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [isPowerBatch, setIsPowerBatch] = useState(false);
  const [isNewlyLaunched, setIsNewlyLaunched] = useState(false);
  const [pricingDropdownOpen, setPricingDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<string | null>(null);
  
  const filterRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [filterOffset, setFilterOffset] = useState(0);

  useEffect(() => {
    if (filterRef.current) {
      setFilterOffset(filterRef.current.offsetTop);
    }
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
            banner.page_path === (examCategory || 'courses') ||
            banner.page_path.includes(examCategory || '')
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

  // Dynamically get unique branches from the courses table
  const availableBranches = useMemo(() => {
    const branches = Array.from(new Set(courses.map(c => c.branch))).filter(Boolean) as string[];
    return branches;
  }, [courses]);

  const availableLanguages = useMemo(() => {
    const languages = Array.from(new Set(courses.map(c => c.language))).filter(Boolean) as string[];
    return languages;
  }, [courses]);

  const formatCategoryTitle = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const pageTitle = useMemo(() => {
    if (filterType) {
      return `${formatCategoryTitle(filterType)} - ${examCategory ? formatCategoryTitle(examCategory) : 'All'} Courses`;
    }
    if (examCategory) {
      return `${formatCategoryTitle(examCategory)} Online Coaching Courses`;
    }
    return "All Courses & Batches";
  }, [examCategory, filterType]);

  const pageDescription = useMemo(() => {
    if (examCategory) {
      return `Access comprehensive ${formatCategoryTitle(examCategory)} coaching with live and recorded sessions, doubt-solving support, and useful study materials.`;
    }
    return "Explore our wide range of courses and batches designed to help you succeed in your academic journey.";
  }, [examCategory]);

  // Filtering logic now compares against the branch column
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Filter by branch from URL parameter
    if (examCategory && examCategory !== 'all') {
      result = result.filter(course => 
        course.branch?.toLowerCase().replace(/[\s_]/g, '-') === examCategory.toLowerCase()
      );
    }

    // Filter by internal tab selection
    if (selectedBranch !== 'all') {
      result = result.filter(course => 
        course.branch?.toLowerCase().replace(/[\s_]/g, '-') === selectedBranch.toLowerCase()
      );
    }

    if (selectedMode) {
      result = result.filter(course => 
        course.course_type?.toLowerCase() === selectedMode.toLowerCase()
      );
    }

    if (selectedLanguage) {
      result = result.filter(course => 
        course.language?.toLowerCase() === selectedLanguage.toLowerCase()
      );
    }

    if (isPowerBatch) {
      result = result.filter(course => 
        course.course_type?.toLowerCase().includes('power')
      );
    }

    if (isNewlyLaunched) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      result = result.filter(course => 
        course.created_at && new Date(course.created_at) > thirtyDaysAgo
      );
    }

    if (priceRange) {
      const price = (course: typeof courses[0]) => course.discounted_price || course.price;
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
  }, [courses, examCategory, selectedBranch, selectedMode, selectedLanguage, isPowerBatch, isNewlyLaunched, priceRange]);

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
    setSelectedLanguage(null);
    setIsPowerBatch(false);
    setIsNewlyLaunched(false);
    setPriceRange(null);
  };

  const hasActiveFilters = selectedMode || selectedLanguage || isPowerBatch || isNewlyLaunched || priceRange;

  return (
    <div className="min-h-screen font-sans text-foreground w-full overflow-x-hidden bg-background">
      <NavBar />
      <main className="pt-16">
        <div className="relative overflow-hidden bg-muted/30">
          <div className="relative z-10 py-8 md:py-12">
            <nav className="max-w-6xl mx-auto px-4 md:px-8 mb-6">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Link to="/" className="hover:text-primary transition-colors"><Home className="w-3.5 h-3.5" /></Link>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                <Link to="/courses" className="hover:text-primary transition-colors uppercase tracking-wide">Courses</Link>
                {examCategory && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    <span className="font-bold text-foreground uppercase">{formatCategoryTitle(examCategory)}</span>
                  </>
                )}
              </div>
            </nav>
            <section className="max-w-6xl mx-auto px-4 md:px-8">
              <h1 className="text-2xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight leading-tight">
                {pageTitle}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-4xl">
                {pageDescription}
              </p>
            </section>
          </div>
        </div>

        <div 
          ref={filterRef}
          className={`w-full z-40 transition-all duration-300 bg-background border-b border-border ${
            isSticky ? 'fixed top-16 shadow-md' : 'relative'
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
            <div className="flex items-center gap-3 mb-4 overflow-x-auto no-scrollbar pb-2">
              <button 
                onClick={() => {
                  setSelectedBranch("all");
                  navigate('/courses/listing/all');
                }}
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
                    onClick={() => {
                      setSelectedBranch(branchSlug);
                      navigate(`/courses/listing/${branchSlug}`); // Navigate on tab selection
                    }}
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

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setSelectedMode(selectedMode === 'online' ? null : 'online')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedMode === 'online' ? 'bg-primary text-primary-foreground' : 'bg-background border-border'
                }`}
              >
                Online
              </button>
              <button
                onClick={() => setSelectedMode(selectedMode === 'offline' ? null : 'offline')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedMode === 'offline' ? 'bg-primary text-primary-foreground' : 'bg-background border-border'
                }`}
              >
                Offline
              </button>

              <div className="relative">
                <button
                  onClick={() => setPricingDropdownOpen(!pricingDropdownOpen)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1 ${
                    priceRange ? 'bg-primary text-primary-foreground' : 'bg-background border-border'
                  }`}
                >
                  Pricing <ChevronDown className="w-3 h-3" />
                </button>
                {pricingDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 min-w-[150px]">
                    {['free', 'under-1000', '1000-5000', 'above-5000'].map(val => (
                      <button 
                        key={val} 
                        className="w-full text-left px-4 py-2 text-sm hover:bg-muted"
                        onClick={() => { setPriceRange(val); setPricingDropdownOpen(false); }}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="text-destructive text-xs flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-bold text-foreground">'{filteredCourses.length}'</span> Total Batches
          </p>
        </div>

        <div className="pb-24 bg-background">
          <section className="max-w-6xl mx-auto px-4 md:px-8">
            {contentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">No courses found matching your filters.</p>
                <Button variant="outline" onClick={clearAllFilters} className="mt-4">Clear Filters</Button>
              </div>
            ) : (
              Object.entries(groupedCourses).map(([groupName, groupCourses]) => (
                <div key={groupName} className="mb-16">
                  <h3 className="text-xl font-bold mb-6">{groupName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
