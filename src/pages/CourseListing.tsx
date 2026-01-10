import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import CourseCardSkeleton from "@/components/courses/CourseCardSkeleton";
import CourseCard from "@/components/courses/CourseCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronRight, Home, ChevronDown, X } from "lucide-react";

const CourseListing = () => {
  const { examCategory, filterType } = useParams<{ examCategory?: string; filterType?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { courses, contentLoading } = useBackend();
  
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [bannerLoading, setBannerLoading] = useState(true);
  
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
    if (filterRef.current) setFilterOffset(filterRef.current.offsetTop);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const navbarHeight = 64;
      if (filterRef.current && filterOffset > 0) setIsSticky(window.scrollY > filterOffset - navbarHeight);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filterOffset]);

  useEffect(() => {
    const fetchBanner = async () => {
      setBannerLoading(true);
      try {
        const { data, error } = await supabase.from('page_banners').select('image_url, page_path').order('created_at', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          const matchingBanner = data.find(banner => banner.page_path === location.pathname || banner.page_path === (examCategory || 'courses') || banner.page_path.includes(examCategory || ''));
          setBannerImage(matchingBanner?.image_url || data[0]?.image_url || null);
        }
      } catch (err) { console.error('Error fetching banner:', err); } finally { setBannerLoading(false); }
    };
    fetchBanner();
  }, [location.pathname, examCategory]);

  // Use branch column for available filters
  const availableBranches = useMemo(() => {
    const branches = Array.from(new Set(courses.map(c => c.branch))).filter(Boolean) as string[];
    return branches;
  }, [courses]);

  const availableLanguages = useMemo(() => {
    return Array.from(new Set(courses.map(c => c.language))).filter(Boolean) as string[];
  }, [courses]);

  const formatCategoryTitle = (category: string) => category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const pageTitle = useMemo(() => {
    if (filterType) return `${formatCategoryTitle(filterType)} - ${examCategory ? formatCategoryTitle(examCategory) : 'All'} Courses`;
    if (examCategory && examCategory !== 'all') return `${formatCategoryTitle(examCategory)} Online Coaching Courses`;
    return "All Courses & Batches";
  }, [examCategory, filterType]);

  // Filter logic strictly matches on branch column
  const filteredCourses = useMemo(() => {
    let result = [...courses];
    if (examCategory && examCategory !== 'all') {
      result = result.filter(course => course.branch?.toLowerCase().replace(/[\s_]/g, '-') === examCategory.toLowerCase());
    }
    if (selectedMode) result = result.filter(course => course.course_type?.toLowerCase() === selectedMode.toLowerCase());
    if (selectedLanguage) result = result.filter(course => course.language?.toLowerCase() === selectedLanguage.toLowerCase());
    if (isPowerBatch) result = result.filter(course => course.course_type?.toLowerCase().includes('power'));
    if (isNewlyLaunched) {
      const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      result = result.filter(course => course.created_at && new Date(course.created_at) > thirtyDaysAgo);
    }
    if (priceRange) {
      const price = (course: any) => course.discounted_price || course.price;
      if (priceRange === 'free') result = result.filter(c => price(c) === 0);
      else if (priceRange === 'under-1000') result = result.filter(c => price(c) > 0 && price(c) < 1000);
      else if (priceRange === '1000-5000') result = result.filter(c => price(c) >= 1000 && price(c) <= 5000);
      else if (priceRange === 'above-5000') result = result.filter(c => price(c) > 5000);
    }
    return result;
  }, [courses, examCategory, selectedMode, selectedLanguage, isPowerBatch, isNewlyLaunched, priceRange]);

  const groupedCourses = useMemo(() => {
    const groups: Record<string, typeof filteredCourses> = {};
    filteredCourses.forEach(course => {
      const type = course.course_type || "Available Batches";
      if (!groups[type]) groups[type] = [];
      groups[type].push(course);
    });
    return groups;
  }, [filteredCourses]);

  return (
    <div className="min-h-screen font-sans text-foreground w-full overflow-x-hidden bg-background">
      <NavBar />
      <main className="pt-16">
        <div className="relative z-10 py-12 px-4 md:px-8 max-w-6xl mx-auto">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-6">
            <Link to="/" className="hover:text-primary transition-colors"><Home className="w-3.5 h-3.5" /></Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            <span className="uppercase tracking-wide">Courses</span>
            {examCategory && <><ChevronRight className="w-3.5 h-3.5 opacity-40" /><span className="font-bold text-foreground uppercase">{formatCategoryTitle(examCategory)}</span></>}
          </nav>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">{pageTitle}</h1>
        </div>

        <div ref={filterRef} className={`w-full z-40 bg-background border-b border-border ${isSticky ? 'fixed top-16 shadow-md' : 'relative'}`}>
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
            <div className="flex items-center gap-3 mb-4 overflow-x-auto no-scrollbar pb-2">
              <button onClick={() => navigate('/courses/listing/all')} className={`px-4 py-2 text-sm font-semibold border-b-2 ${!examCategory || examCategory === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>All Batches</button>
              {availableBranches.map((branch) => (
                <button
                  key={branch}
                  onClick={() => navigate(`/courses/listing/${branch.toLowerCase().replace(/[\s_]/g, '-')}`)}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 ${examCategory === branch.toLowerCase().replace(/[\s_]/g, '-') ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                >
                  {branch}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isSticky && <div className="h-[100px]" />}

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 pb-24">
          {contentLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}</div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16"><p className="text-lg text-muted-foreground">No courses found matching your filters.</p></div>
          ) : (
            Object.entries(groupedCourses).map(([groupName, groupCourses]) => (
              <div key={groupName} className="mb-16">
                <h3 className="text-2xl font-bold mb-6">{groupName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupCourses.map((course, index) => <CourseCard course={course} index={index} key={course.id} />)}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourseListing;
