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

const IITMBSPrep = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courses } = useBackend();
  
  const filterRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [filterOffset, setFilterOffset] = useState(0);
  
  // Renamed 'notesCategory' to 'notesSubject' for consistency
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

  // Notes Advanced Filters - State
  const [selectedNotesSubjects, setSelectedNotesSubjects] = useState<string[]>([]);
  const [availableNotesSubjects, setAvailableNotesSubjects] = useState<string[]>([]);

  // Temporary states for Apply/Cancel logic
  const [tempBranch, setTempBranch] = useState("Data Science");
  const [tempLevel, setTempLevel] = useState("Foundation");
  const [tempPyqYear, setTempPyqYear] = useState<string | null>(null);
  const [tempExamType, setTempExamType] = useState<string | null>(null);
  const [tempCourseLevels, setTempCourseLevels] = useState<string[]>([]);
  const [tempCourseSubjects, setTempCourseSubjects] = useState<string[]>([]);
  const [tempCoursePrice, setTempCoursePrice] = useState<string | null>(null);
  const [tempNotesSubjects, setTempNotesSubjects] = useState<string[]>([]);
  
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');

  // Reset multi-select when branch/level changes for real-time consistency
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

  // Static Metadata
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
                <p className="text-[11px] text-gray-400 py-2 italic">Loading subjects...</p>
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
                      activeTab === tab.id 
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-nowrap items-center gap-3 py-3 font-sans overflow-x-auto no-scrollbar">
                
                {activeTab === 'courses' ? (
                  <>
                    {/* Branch dropdown */}
                    <button onClick={() => toggleDropdown('branch')} className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all dropdown-container bg-white border-[#e5e7eb] text-[#374151]">
                      {selectedBranch !== "Data Science" && <span className="w-5 h-5 bg-[#6366f1] text-white rounded-full text-[10px] flex items-center justify-center mr-2">1</span>}
                      Branch
                      <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'branch' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                    </button>
                    {/* Level dropdown */}
                    <button onClick={() => toggleDropdown('courseLevel')} className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all dropdown-container bg-white border-[#e5e7eb] text-[#374151]">
                      {selectedCourseLevels.length > 0 && <span className="w-5 h-5 bg-[#6366f1] text-white rounded-full text-[10px] flex items-center justify-center mr-2">{selectedCourseLevels.length}</span>}
                      Level
                      <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'courseLevel' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                    </button>
                    {/* Subject dropdown */}
                    <button onClick={() => toggleDropdown('courseSubject')} className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all dropdown-container bg-white border-[#e5e7eb] text-[#374151]">
                      {selectedCourseSubjects.length > 0 && <span className="w-5 h-5 bg-[#6366f1] text-white rounded-full text-[10px] flex items-center justify-center mr-2">{selectedCourseSubjects.length}</span>}
                      Subject
                      <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'courseSubject' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                    </button>
                    {/* Pricing dropdown */}
                    <button onClick={() => toggleDropdown('coursePricing')} className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all dropdown-container bg-white border-[#e5e7eb] text-[#374151]">
                      {coursePriceRange && <span className="w-5 h-5 bg-[#6366f1] text-white rounded-full text-[10px] flex items-center justify-center mr-2">1</span>}
                      Pricing
                      <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'coursePricing' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                    </button>
                    
                    {(selectedCourseLevels.length > 0 || selectedCourseSubjects.length > 0 || coursePriceRange || courseNewlyLaunched || courseFastrackOnly || courseBestSellerOnly) && (
                      <button 
                        onClick={() => { setSelectedCourseLevels([]); setSelectedCourseSubjects([]); setCoursePriceRange(null); setCourseNewlyLaunched(false); setCourseFastrackOnly(false); setCourseBestSellerOnly(false); }}
                        className="text-[#6366f1] text-[12px] md:text-[13px] font-medium whitespace-nowrap hover:underline"
                      >
                        Reset Filters
                      </button>
                    )}
                  </>
                ) : hasSubFilters ? (
                  <>
                    {/* Branch dropdown with count badge */}
                    <button onClick={() => toggleDropdown('branch')} className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all dropdown-container bg-white border-[#e5e7eb] text-[#374151]">
                      {selectedBranch && selectedBranch !== "Data Science" && <span className="w-5 h-5 bg-[#6366f1] text-white rounded-full text-[10px] flex items-center justify-center mr-2">1</span>}
                      Branch
                      <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'branch' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                    </button>

                    {(activeTab === 'notes' || activeTab === 'pyqs' || activeTab === 'tools') && (
                      <>
                        {/* Level dropdown with count badge */}
                        <button onClick={() => toggleDropdown('level')} className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all dropdown-container bg-white border-[#e5e7eb] text-[#374151]">
                          {selectedLevel && <span className="w-5 h-5 bg-[#6366f1] text-white rounded-full text-[10px] flex items-center justify-center mr-2">1</span>}
                          Level
                          <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'level' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                        </button>
                      </>
                    )}
                    
                    {activeTab === 'notes' && (
                      /* Subject dropdown with count badge */
                      <button onClick={() => toggleDropdown('notesSubject')} className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all dropdown-container bg-white border-[#e5e7eb] text-[#374151]">
                        {selectedNotesSubjects.length > 0 && <span className="w-5 h-5 bg-[#6366f1] text-white rounded-full text-[10px] flex items-center justify-center mr-2">{selectedNotesSubjects.length}</span>}
                        Subjects
                        <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'notesSubject' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                      </button>
                    )}

                    {activeTab === 'pyqs' && (
                      <>
                        {/* Year dropdown with count badge */}
                        <button onClick={() => toggleDropdown('year')} className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all dropdown-container bg-white border-[#e5e7eb] text-[#374151]">
                          {pyqYear && <span className="w-5 h-5 bg-[#6366f1] text-white rounded-full text-[10px] flex items-center justify-center mr-2">1</span>}
                          Year
                          <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'year' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                        </button>
                        {/* Exam Type dropdown with count badge */}
                        <button onClick={() => toggleDropdown('examType')} className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all dropdown-container bg-white border-[#e5e7eb] text-[#374151]">
                          {examType && <span className="w-5 h-5 bg-[#6366f1] text-white rounded-full text-[10px] flex items-center justify-center mr-2">1</span>}
                          Exam Type
                          <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'examType' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                        </button>
                      </>
                    )}

                    {activeTab === 'tools' && tools.map(tool => (
                      /* Toggle pill filters with X icon when selected - matching JEE/NEET design */
                      <button 
                        key={tool.id}
                        onClick={() => setSelectedTool(tool.id)}
                        className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] whitespace-nowrap transition-all flex items-center gap-2 bg-white ${selectedTool === tool.id ? 'border-black text-black' : 'border-[#e5e7eb] text-[#374151]'}`}
                      >
                        {tool.label}
                        {selectedTool === tool.id && <X className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </button>
                    ))}
                    
                    {/* Reset Filters link */}
                    {((activeTab === 'notes' && selectedNotesSubjects.length > 0) || (activeTab === 'pyqs' && (pyqYear || examType))) && (
                      <button 
                        onClick={() => { 
                          if (activeTab === 'notes') setSelectedNotesSubjects([]);
                          if (activeTab === 'pyqs') { setPyqYear(null); setExamType(null); }
                        }}
                        className="text-[#6366f1] text-[12px] md:text-[13px] font-medium whitespace-nowrap hover:underline"
                      >
                        Reset Filters
                      </button>
                    )}
                  </>
                ) : (activeTab === 'news' || activeTab === 'dates') && (
                  <>
                    <button 
                      onClick={() => setSortOrder('recent')}
                      className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] whitespace-nowrap transition-all flex items-center gap-2 bg-white ${sortOrder === 'recent' ? 'border-black text-black font-semibold' : 'border-[#e5e7eb] text-[#374151]'}`}
                    >
                      Recent First
                      {sortOrder === 'recent' && <X className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </button>
                    <button 
                      onClick={() => setSortOrder('oldest')}
                      className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] whitespace-nowrap transition-all flex items-center gap-2 bg-white ${sortOrder === 'oldest' ? 'border-black text-black font-semibold' : 'border-[#e5e7eb] text-[#374151]'}`}
                    >
                      Oldest First
                      {sortOrder === 'oldest' && <X className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Dropdowns rendered OUTSIDE scrollable area for proper z-index - matches JEE/NEET pattern */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              {openDropdown === 'branch' && (
                <div className="absolute top-0 left-4 right-4 sm:right-auto sm:left-6 lg:left-8 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] sm:min-w-[180px] max-w-[calc(100vw-2rem)] p-3 dropdown-container">
                  {renderDropdownContent('branch')}
                </div>
              )}
              {openDropdown === 'level' && (
                <div className="absolute top-0 left-4 right-4 sm:right-auto sm:left-[120px] lg:left-[130px] bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] sm:min-w-[160px] max-w-[calc(100vw-2rem)] p-3 dropdown-container">
                  {renderDropdownContent('level')}
                </div>
              )}
              {openDropdown === 'notesSubject' && (
                <div className="absolute top-0 left-4 right-4 sm:right-auto sm:left-[230px] lg:left-[250px] bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] sm:min-w-[200px] max-w-[calc(100vw-2rem)] p-3 dropdown-container">
                  {renderDropdownContent('notesSubject')}
                </div>
              )}
              {openDropdown === 'year' && (
                <div className="absolute top-0 left-4 right-4 sm:right-auto sm:left-[230px] lg:left-[250px] bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] sm:min-w-[140px] max-w-[calc(100vw-2rem)] p-3 dropdown-container">
                  {renderDropdownContent('year')}
                </div>
              )}
              {openDropdown === 'examType' && (
                <div className="absolute top-0 left-4 right-4 sm:right-auto sm:left-[320px] lg:left-[350px] bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] sm:min-w-[160px] max-w-[calc(100vw-2rem)] p-3 dropdown-container">
                  {renderDropdownContent('examType')}
                </div>
              )}
              {openDropdown === 'courseLevel' && (
                <div className="absolute top-0 left-4 right-4 sm:right-auto sm:left-[120px] lg:left-[130px] bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] sm:min-w-[160px] max-w-[calc(100vw-2rem)] p-3 dropdown-container">
                  {renderDropdownContent('courseLevel')}
                </div>
              )}
              {openDropdown === 'courseSubject' && (
                <div className="absolute top-0 left-4 right-4 sm:right-auto sm:left-[210px] lg:left-[230px] bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] sm:min-w-[180px] max-w-[calc(100vw-2rem)] p-3 dropdown-container">
                  {renderDropdownContent('courseSubject')}
                </div>
              )}
              {openDropdown === 'coursePricing' && (
                <div className="absolute top-0 left-4 right-4 sm:right-auto sm:left-[310px] lg:left-[340px] bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] sm:min-w-[140px] max-w-[calc(100vw-2rem)] p-3 dropdown-container">
                  {renderDropdownContent('coursePricing')}
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
                selectedSubjects={selectedNotesSubjects}
                onSubjectsLoaded={setAvailableNotesSubjects}
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
                fasttrackOnly={courseFastrackOnly}
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
