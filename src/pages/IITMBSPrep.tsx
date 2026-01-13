import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ExamPrepHeader from "@/components/ExamPrepHeader";
import BranchNotesTab from "@/components/iitm/BranchNotesTab";
import PYQsTab from "@/components/iitm/PYQsTab";
import NewsTab from "@/components/iitm/NewsTab";
import ImportantDatesTab from "@/components/iitm/ImportantDatesTab";
import SyllabusTab from "@/components/iitm/SyllabusTab";
import IITMToolsTab from "@/components/iitm/IITMToolsTab";
import PaidCoursesTab from "@/components/iitm/PaidCoursesTab";
import { buildExamUrl, getTabFromUrl } from "@/utils/urlHelpers";
import { X } from "lucide-react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { useIsMobile } from "@/hooks/use-mobile";

const IITMBSPrep = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Destructure iitmBranchNotes to derive available subjects for the filter
  const { courses, iitmBranchNotes } = useBackend();
  const isMobile = useIsMobile();
  
  const filterRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [filterOffset, setFilterOffset] = useState(0);
  // Added 'notesSubject' to the allowed dropdown types
  const [openDropdown, setOpenDropdown] = useState<'branch' | 'level' | 'examType' | 'year' | 'courseLevel' | 'courseSubject' | 'coursePricing' | 'notesSubject' | null>(null);

  const [activeTab, setActiveTab] = useState(() => getTabFromUrl(location.pathname));
  
  // Basic Filters state
  const [selectedBranch, setSelectedBranch] = useState("Data Science");
  const [selectedLevel, setSelectedLevel] = useState("Foundation");
  const [pyqYear, setPyqYear] = useState<string | null>(null);
  const [examType, setExamType] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState("cgpa-calculator");

  // Related Courses Advanced Filters
  const [selectedCourseLevels, setSelectedCourseLevels] = useState<string[]>([]);
  const [selectedCourseSubjects, setSelectedCourseSubjects] = useState<string[]>([]);
  const [coursePriceRange, setCoursePriceRange] = useState<string | null>(null);
  const [courseNewlyLaunched, setCourseNewlyLaunched] = useState(false);
  const [courseFastrackOnly, setCourseFastrackOnly] = useState(false);
  const [courseBestSellerOnly, setCourseBestSellerOnly] = useState(false);

  // Notes Advanced Filters - State for multiple subject selections
  const [selectedNotesSubjects, setSelectedNotesSubjects] = useState<string[]>([]);

  // Temporary states for Apply/Cancel logic
  const [tempBranch, setTempBranch] = useState("Data Science");
  const [tempLevel, setTempLevel] = useState("Foundation");
  const [tempPyqYear, setTempPyqYear] = useState<string | null>(null);
  const [tempExamType, setTempExamType] = useState<string | null>(null);
  const [tempCourseLevels, setTempCourseLevels] = useState<string[]>([]);
  const [tempCourseSubjects, setTempCourseSubjects] = useState<string[]>([]);
  const [tempCoursePrice, setTempCoursePrice] = useState<string | null>(null);
  const [tempNotesSubjects, setTempNotesSubjects] = useState<string[]>([]); // Added for Subject multi-select
  
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');

  // Reset subject filter when branch or level changes to keep data in sync
  useEffect(() => {
    setSelectedNotesSubjects([]);
  }, [selectedBranch, selectedLevel]);

  // Dynamic Data Extraction from Backend
  const iitmCourses = useMemo(() => 
    courses.filter(c => c.exam_category === 'IITM BS' || c.exam_category === 'IITM_BS')
  , [courses]);

  const branches = useMemo(() => 
    Array.from(new Set(iitmCourses.map(c => c.branch))).filter(Boolean).sort() as string[]
  , [iitmCourses]);

  const levels = useMemo(() => 
    Array.from(new Set(iitmCourses.map(c => c.level))).filter(Boolean).sort() as string[]
  , [iitmCourses]);

  // Derive available subjects specifically from available Notes for current Branch/Level
  const availableNotesSubjects = useMemo(() => {
    return Array.from(new Set(
      (iitmBranchNotes || [])
        .filter(n => n.branch === selectedBranch && n.level === selectedLevel)
        .map(n => n.subject)
    )).filter(Boolean).sort() as string[];
  }, [iitmBranchNotes, selectedBranch, selectedLevel]);

  const branchFilteredCourses = useMemo(() => {
    if (selectedBranch === "all" || selectedBranch === "All Branches") return iitmCourses;
    return iitmCourses.filter(c => c.branch === selectedBranch);
  }, [iitmCourses, selectedBranch]);

  const availableCourseLevels = useMemo(() => 
    Array.from(new Set(branchFilteredCourses.map(c => c.level))).filter(Boolean).sort() as string[]
  , [branchFilteredCourses]);
  
  const availableCourseSubjects = useMemo(() => 
    Array.from(new Set(branchFilteredCourses.map(c => c.subject))).filter(Boolean).sort() as string[]
  , [branchFilteredCourses]);

  // Static Metadata for logic-based filters
  const years = ["2024", "2023", "2022", "2021", "2020"];
  const examTypes = [
    { id: "quiz1", label: "Quiz 1" },
    { id: "quiz2", label: "Quiz 2" },
    { id: "endterm", label: "End Term" }
  ];
  const tools = [
    { id: "cgpa-calculator", label: "CGPA Calculator" },
    { id: "grade-calculator", label: "Grade Calculator" },
    { id: "marks-predictor", label: "Marks Predictor" }
  ];

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

  useEffect(() => {
    const tabFromUrl = getTabFromUrl(location.pathname);
    setActiveTab(tabFromUrl);
  }, [location.pathname]);

  const updateUrl = (tab: string) => {
    const newUrl = buildExamUrl('iitm-bs', tab, {});
    navigate(newUrl, { replace: true });
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setOpenDropdown(null);
    updateUrl(newTab);
  };

  const toggleDropdown = (type: any) => {
    if (openDropdown === type) {
      setOpenDropdown(null);
    } else {
      setTempBranch(selectedBranch);
      setTempLevel(selectedLevel);
      setTempPyqYear(pyqYear);
      setTempExamType(examType);
      setTempCourseLevels(selectedCourseLevels);
      setTempCourseSubjects(selectedCourseSubjects);
      setTempCoursePrice(coursePriceRange);
      setTempNotesSubjects(selectedNotesSubjects);
      setOpenDropdown(type);
    }
  };

  const handleApplyBranch = () => {
    setSelectedBranch(tempBranch);
    setOpenDropdown(null);
  };

  const handleApplyLevel = () => {
    setSelectedLevel(tempLevel);
    setOpenDropdown(null);
  };

  const handleApplyYear = () => {
    setPyqYear(tempPyqYear);
    setOpenDropdown(null);
  };

  const handleApplyExamType = () => {
    setExamType(tempExamType);
    setOpenDropdown(null);
  };

  const handleApplyCourseFilters = () => {
    setSelectedCourseLevels(tempCourseLevels);
    setSelectedCourseSubjects(tempCourseSubjects);
    setCoursePriceRange(tempCoursePrice);
    setOpenDropdown(null);
  };

  // Logic to apply multi-select subjects for the Notes tab
  const handleApplyNotesSubject = () => {
    setSelectedNotesSubjects(tempNotesSubjects);
    setOpenDropdown(null);
  };

  const toggleTempItem = (item: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openDropdown && !(e.target as Element).closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const tabs = [
    { id: "notes", label: "Notes" },
    { id: "pyqs", label: "PYQs" },
    { id: "syllabus", label: "Syllabus" },
    { id: "tools", label: "Tools" },
    { id: "courses", label: "Related Courses"},
    { id: "news", label: "News" },
    { id: "dates", label: "Important Dates" }
  ];

  const renderDropdownContent = (type: typeof openDropdown) => {
    if (!type) return null;
    
    switch (type) {
      case 'branch':
        return (
          <>
            <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1">
              {(activeTab === 'courses' ? ["All Branches", ...branches] : branches).map(branch => (
                <label key={branch} className="flex items-center gap-2 p-1.5 hover:bg-[#f9fafb] rounded cursor-pointer text-xs text-gray-700">
                  <input type="radio" name="branch" checked={tempBranch === branch} onChange={() => setTempBranch(branch)} className="accent-[#6366f1]" /> {branch}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 rounded hover:bg-slate-50">Cancel</button>
              <button onClick={handleApplyBranch} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded hover:bg-[#5255e0]">Apply</button>
            </div>
          </>
        );
      case 'level':
        return (
          <>
            <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1">
              {levels.map(lvl => (
                <label key={lvl} className="flex items-center gap-2 p-1.5 hover:bg-[#f9fafb] rounded cursor-pointer text-xs text-gray-700">
                  <input type="radio" name="level" checked={tempLevel === lvl} onChange={() => setTempLevel(lvl)} className="accent-[#6366f1]" /> {lvl}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 rounded hover:bg-slate-50">Cancel</button>
              <button onClick={handleApplyLevel} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded hover:bg-[#5255e0]">Apply</button>
            </div>
          </>
        );
      case 'courseLevel':
        return (
          <>
            <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1">
              {availableCourseLevels.map(lvl => (
                <label key={lvl} className="flex items-center gap-2 p-1.5 hover:bg-[#f9fafb] rounded cursor-pointer text-xs text-gray-700">
                  <input type="checkbox" checked={tempCourseLevels.includes(lvl)} onChange={() => toggleTempItem(lvl, tempCourseLevels, setTempCourseLevels)} className="accent-[#6366f1]" /> {lvl}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 rounded hover:bg-slate-50">Cancel</button>
              <button onClick={handleApplyCourseFilters} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded hover:bg-[#5255e0]">Apply</button>
            </div>
          </>
        );
      case 'courseSubject':
        return (
          <>
            <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1">
              {availableCourseSubjects.map(sub => (
                <label key={sub} className="flex items-center gap-2 p-1.5 hover:bg-[#f9fafb] rounded cursor-pointer text-xs text-gray-700">
                  <input type="checkbox" checked={tempCourseSubjects.includes(sub)} onChange={() => toggleTempItem(sub, tempCourseSubjects, setTempCourseSubjects)} className="accent-[#6366f1]" /> {sub}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 rounded hover:bg-slate-50">Cancel</button>
              <button onClick={handleApplyCourseFilters} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded hover:bg-[#5255e0]">Apply</button>
            </div>
          </>
        );
      // Fixed: Case for multi-select Subject dropdown logic
      case 'notesSubject':
        return (
          <>
            <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1 custom-scrollbar">
              {availableNotesSubjects.map(sub => (
                <label key={sub} className="flex items-center gap-2 p-1.5 hover:bg-[#f9fafb] rounded cursor-pointer text-xs text-gray-700">
                  <input 
                    type="checkbox" 
                    checked={tempNotesSubjects.includes(sub)} 
                    onChange={() => toggleTempItem(sub, tempNotesSubjects, setTempNotesSubjects)} 
                    className="accent-[#6366f1] rounded" 
                  /> 
                  {sub}
                </label>
              ))}
              {availableNotesSubjects.length === 0 && (
                <p className="text-[11px] text-gray-400 py-2">No subjects with notes available</p>
              )}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 rounded hover:bg-slate-50">Cancel</button>
              <button onClick={handleApplyNotesSubject} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded hover:bg-[#5255e0]">Apply</button>
            </div>
          </>
        );
      case 'coursePricing':
        return (
          <>
            <div className="space-y-1.5 mb-3">
              {['free', 'paid'].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-slate-50 rounded text-xs capitalize text-gray-700">
                  <input type="radio" name="price" checked={tempCoursePrice === opt} onChange={() => setTempCoursePrice(opt)} className="accent-[#6366f1]" /> {opt}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 rounded hover:bg-slate-50">Cancel</button>
              <button onClick={handleApplyCourseFilters} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded hover:bg-[#5255e0]">Apply</button>
            </div>
          </>
        );
      case 'year':
        return (
          <>
            <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1">
              {years.map(y => (
                <label key={y} className="flex items-center gap-2 p-1.5 hover:bg-[#f9fafb] rounded cursor-pointer text-xs text-gray-700">
                  <input type="radio" name="year" checked={tempPyqYear === y} onChange={() => setTempPyqYear(y)} className="accent-[#6366f1]" /> {y}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 rounded hover:bg-slate-50">Cancel</button>
              <button onClick={handleApplyYear} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded hover:bg-[#5255e0]">Apply</button>
            </div>
          </>
        );
      case 'examType':
        return (
          <>
            <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1">
              {examTypes.map(type => (
                <label key={type.id} className="flex items-center gap-2 p-1.5 hover:bg-[#f9fafb] rounded cursor-pointer text-xs text-gray-700">
                  <input type="radio" name="exam" checked={tempExamType === type.id} onChange={() => setTempExamType(type.id)} className="accent-[#6366f1]" /> {type.label}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 rounded hover:bg-slate-50">Cancel</button>
              <button onClick={handleApplyExamType} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded hover:bg-[#5255e0]">Apply</button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const hasSubFilters = activeTab === 'notes' || activeTab === 'pyqs' || activeTab === 'syllabus' || activeTab === 'tools';

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans">
      <NavBar />
      <main className="pt-16">
        <ExamPrepHeader examName="IITM BS" examPath="/exam-preparation/iitm-bs" currentTab={activeTab} pageTitle="IITM BS Degree Preparation" />

        <div ref={filterRef} className={`w-full transition-shadow duration-300 ${isSticky ? 'fixed top-16 bg-white border-b shadow-none z-[9999]' : 'relative z-[9999]'}`}>
          
          <div className="bg-[#f4f2ff]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex gap-8 pt-4 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`pb-2 text-[14px] md:text-[15px] cursor-pointer whitespace-nowrap transition-all font-sans ${
                      tab.highlight && activeTab !== tab.id 
                        ? 'text-yellow-600 font-semibold' 
                        : activeTab === tab.id 
                          ? 'text-[#6366f1] border-b-[3px] border-[#6366f1] font-semibold' 
                          : 'text-[#6b7280] font-medium'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border-b border-[#f3f4f6] min-h-[56px] relative z-[100]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              <div className="flex flex-nowrap items-center gap-3 py-3 font-sans overflow-x-auto md:overflow-visible no-scrollbar dropdown-container">
                
                {activeTab === 'courses' ? (
                  <>
                    <div className="relative shrink-0">
                      <button onClick={() => toggleDropdown('branch')} className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all bg-white border-[#e5e7eb] text-[#374151] whitespace-nowrap">
                        {selectedBranch !== "Data Science" && <span className="w-5 h-5 bg-[#6366f1] text-white rounded-full text-[10px] flex items-center justify-center mr-2">1</span>}
                        Branch
                        <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'branch' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                      </button>
                      {!isMobile && openDropdown === 'branch' && (
                        <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] min-w-[180px] p-3">
                          {renderDropdownContent('branch')}
                        </div>
                      )}
                    </div>

                    <div className="relative shrink-0">
                      <button onClick={() => toggleDropdown('courseLevel')} className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all bg-white border-[#e5e7eb] text-[#374151] whitespace-nowrap">
                        {selectedCourseLevels.length > 0 && <span className="w-5 h-5 bg-[#6366f1] text-white rounded-full text-[10px] flex items-center justify-center mr-2">{selectedCourseLevels.length}</span>}
                        Level
                        <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'courseLevel' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                      </button>
                      {!isMobile && openDropdown === 'courseLevel' && (
                        <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] min-w-[180px] p-3">
                          {renderDropdownContent('courseLevel')}
                        </div>
                      )}
                    </div>

                    <div className="relative shrink-0">
                      <button onClick={() => toggleDropdown('courseSubject')} className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all bg-white border-[#e5e7eb] text-[#374151] whitespace-nowrap">
                        {selectedCourseSubjects.length > 0 && <span className="w-5 h-5 bg-[#6366f1] text-white rounded-full text-[10px] flex items-center justify-center mr-2">{selectedCourseSubjects.length}</span>}
                        Subject
                        <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'courseSubject' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                      </button>
                      {!isMobile && openDropdown === 'courseSubject' && (
                        <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] min-w-[180px] p-3">
                          {renderDropdownContent('courseSubject')}
                        </div>
                      )}
                    </div>

                    <div className="relative shrink-0">
                      <button onClick={() => toggleDropdown('coursePricing')} className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all bg-white border-[#e5e7eb] text-[#374151] whitespace-nowrap">
                        {coursePriceRange && <span className="w-5 h-5 bg-[#6366f1] text-white rounded-full text-[10px] flex items-center justify-center mr-2">1</span>}
                        Pricing
                        <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'coursePricing' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                      </button>
                      {!isMobile && openDropdown === 'coursePricing' && (
                        <div className="absolute top-full left-0 md:right-0 md:left-auto mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] min-w-[150px] p-3">
                          {renderDropdownContent('coursePricing')}
                        </div>
                      )}
                    </div>

                    <button onClick={() => setCourseBestSellerOnly(!courseBestSellerOnly)} className={`shrink-0 px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] transition-all whitespace-nowrap flex items-center gap-2 bg-white ${courseBestSellerOnly ? 'border-black text-black font-semibold' : 'border-[#e5e7eb] text-[#374151]'}`}>
                      Best Seller {courseBestSellerOnly && <X className="w-3.5 h-3.5" />}
                    </button>

                    <button onClick={() => setCourseNewlyLaunched(!courseNewlyLaunched)} className={`shrink-0 px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] transition-all whitespace-nowrap flex items-center gap-2 bg-white ${courseNewlyLaunched ? 'border-black text-black font-semibold' : 'border-[#e5e7eb] text-[#374151]'}`}>
                      Newly Launched {courseNewlyLaunched && <X className="w-3.5 h-3.5" />}
                    </button>

                    <button onClick={() => setCourseFastrackOnly(!courseFastrackOnly)} className={`shrink-0 px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] transition-all whitespace-nowrap flex items-center gap-2 bg-white ${courseFastrackOnly ? 'border-black text-black font-semibold' : 'border-[#e5e7eb] text-[#374151]'}`}>
                      Fastrack Batch {courseFastrackOnly && <X className="w-3.5 h-3.5" />}
                    </button>

                    {(selectedCourseLevels.length > 0 || selectedCourseSubjects.length > 0 || coursePriceRange || courseBestSellerOnly || courseNewlyLaunched || courseFastrackOnly) && (
                      <button 
                        onClick={() => {
                          setSelectedCourseLevels([]);
                          setSelectedCourseSubjects([]);
                          setCoursePriceRange(null);
                          setCourseBestSellerOnly(false);
                          setCourseNewlyLaunched(false);
                          setCourseFastrackOnly(false);
                        }}
                        className="shrink-0 text-[#6366f1] text-[12px] md:text-[13px] font-medium whitespace-nowrap hover:underline px-2"
                      >
                        Reset Filters
                      </button>
                    )}
                  </>
                ) : hasSubFilters ? (
                  <>
                    <div className="relative shrink-0">
                      <button onClick={() => toggleDropdown('branch')} className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all bg-white border-[#e5e7eb] text-[#374151] whitespace-nowrap">
                        Branch <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'branch' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                      </button>
                      {!isMobile && openDropdown === 'branch' && (
                        <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] min-w-[180px] p-3">
                          {renderDropdownContent('branch')}
                        </div>
                      )}
                    </div>

                    {(activeTab === 'notes' || activeTab === 'pyqs' || activeTab === 'tools') && (
                      <div className="relative shrink-0">
                        <button onClick={() => toggleDropdown('level')} className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all bg-white border-[#e5e7eb] text-[#374151] whitespace-nowrap">
                          Level <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'level' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                        </button>
                        {!isMobile && openDropdown === 'level' && (
                          <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] min-w-[160px] p-3">
                            {renderDropdownContent('level')}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Fixed: Multi-select Subject dropdown for Notes tab */}
                    {activeTab === 'notes' && (
                      <div className="relative shrink-0">
                        <button onClick={() => toggleDropdown('notesSubject')} className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all bg-white border-[#e5e7eb] text-[#374151] whitespace-nowrap">
                          {selectedNotesSubjects.length > 0 && <span className="w-5 h-5 bg-[#6366f1] text-white rounded-full text-[10px] flex items-center justify-center mr-2">{selectedNotesSubjects.length}</span>}
                          Subject
                          <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'notesSubject' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                        </button>
                        {!isMobile && openDropdown === 'notesSubject' && (
                          <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] min-w-[180px] p-3">
                            {renderDropdownContent('notesSubject')}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'pyqs' && (
                      <>
                        <div className="relative shrink-0">
                          <button onClick={() => toggleDropdown('year')} className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all bg-white border-[#e5e7eb] text-[#374151] whitespace-nowrap">
                            Year <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'year' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                          </button>
                          {!isMobile && openDropdown === 'year' && (
                            <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] min-w-[150px] p-3">
                              {renderDropdownContent('year')}
                            </div>
                          )}
                        </div>
                        {selectedLevel !== 'Qualifier' && (
                          <div className="relative shrink-0">
                            <button onClick={() => toggleDropdown('examType')} className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all bg-white border-[#e5e7eb] text-[#374151] whitespace-nowrap">
                              Exam <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'examType' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                            </button>
                            {!isMobile && openDropdown === 'examType' && (
                              <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] min-w-[150px] p-3">
                                {renderDropdownContent('examType')}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                    {activeTab === 'tools' && tools.map((tool) => (
                      <button key={tool.id} onClick={() => setSelectedTool(selectedTool === tool.id ? "" : tool.id)} className={`shrink-0 px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] whitespace-nowrap transition-all flex items-center gap-2 bg-white ${selectedTool === tool.id ? 'border-black text-black font-semibold' : 'border-[#e5e7eb] text-[#374151]'}`}>
                        {tool.label} {selectedTool === tool.id && <X className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </button>
                    ))}
                  </>
                ) : (activeTab === 'news' || activeTab === 'dates') && (
                  <>
                    <button onClick={() => setSortOrder('recent')} className={`shrink-0 px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] whitespace-nowrap transition-all flex items-center gap-2 bg-white ${sortOrder === 'recent' ? 'border-black text-black font-semibold' : 'border-[#e5e7eb] text-[#374151]'}`}>Recent First</button>
                    <button onClick={() => setSortOrder('oldest')} className={`shrink-0 px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] whitespace-nowrap transition-all flex items-center gap-2 bg-white ${sortOrder === 'oldest' ? 'border-black text-black font-semibold' : 'border-[#e5e7eb] text-[#374151]'}`}>Oldest First</button>
                  </>
                )}
              </div>

              {/* MOBILE ONLY: Shared Dropdown Container (Centered below row) */}
              {isMobile && openDropdown && (
                <div className="absolute top-full left-0 right-0 flex justify-center z-[9999] px-4 pointer-events-none">
                  <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-xl min-w-[180px] p-3 dropdown-container pointer-events-auto mt-2">
                    {renderDropdownContent(openDropdown)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isSticky && <div className="h-[120px]" />}

        <section className="py-8 bg-white min-h-[600px] relative z-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {activeTab === "notes" && (
              <BranchNotesTab 
                branch={selectedBranch} 
                level={selectedLevel} 
                selectedSubjects={selectedNotesSubjects} // Synchronized with global filter
              />
            )}
            {activeTab === "pyqs" && <PYQsTab branch={selectedBranch} level={selectedLevel} year={pyqYear} examType={examType} />}
            {activeTab === "syllabus" && <SyllabusTab branch={selectedBranch} />}
            {activeTab === "tools" && <IITMToolsTab selectedTool={selectedTool} branch={selectedBranch} level={selectedLevel} />}
            {activeTab === "courses" && (
              <PaidCoursesTab 
                branch={selectedBranch}
                levels={selectedCourseLevels}
                subjects={selectedCourseSubjects}
                priceRange={coursePriceRange}
                newlyLaunched={courseNewlyLaunched}
                fastrackOnly={courseFastrackOnly}
                bestSellerOnly={courseBestSellerOnly}
              />
            )}
            {activeTab === "news" && <NewsTab sortOrder={sortOrder} />}
            {activeTab === "dates" && <ImportantDatesTab sortOrder={sortOrder} />}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default IITMBSPrep;
