import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
import { X, Home, ChevronRight } from "lucide-react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const IITMBSPrep = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courses, pyqs } = useBackend();
  
  const filterRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [filterOffset, setFilterOffset] = useState(0);
  
  const [openDropdown, setOpenDropdown] = useState<'branch' | 'level' | 'examType' | 'year' | 'pyqSubject' | 'courseLevel' | 'courseSubject' | 'coursePricing' | 'notesSubject' | null>(null);

  const [activeTab, setActiveTab] = useState(() => getTabFromUrl(location.pathname));
  
  // Basic Filters state
  const [selectedBranch, setSelectedBranch] = useState("Data Science");
  const [selectedLevel, setSelectedLevel] = useState("Foundation");
  
  // PYQ Specific Filters (State)
  const [pyqYear, setPyqYear] = useState<string | null>(null);
  const [examType, setExamType] = useState<string | null>(null);
  const [pyqSubject, setPyqSubject] = useState<string | null>(null);

  // Other Tools/Course Filters
  const [selectedTool, setSelectedTool] = useState("cgpa-calculator");
  const [selectedCourseLevels, setSelectedCourseLevels] = useState<string[]>([]);
  const [selectedCourseSubjects, setSelectedCourseSubjects] = useState<string[]>([]);
  const [coursePriceRange, setCoursePriceRange] = useState<string | null>(null);
  const [courseNewlyLaunched, setCourseNewlyLaunched] = useState(false);
  const [courseFastrackOnly, setCourseFastrackOnly] = useState(false);
  const [courseBestSellerOnly, setCourseBestSellerOnly] = useState(false);

  // Notes Filters
  const [selectedNotesSubjects, setSelectedNotesSubjects] = useState<string[]>([]);
  const [availableNotesSubjects, setAvailableNotesSubjects] = useState<string[]>([]);

  // Temporary states for Apply/Cancel logic
  const [tempBranch, setTempBranch] = useState("Data Science");
  const [tempLevel, setTempLevel] = useState("Foundation");
  const [tempPyqYear, setTempPyqYear] = useState<string | null>(null);
  const [tempExamType, setTempExamType] = useState<string | null>(null);
  const [tempPyqSubject, setTempPyqSubject] = useState<string | null>(null);
  const [tempCourseLevels, setTempCourseLevels] = useState<string[]>([]);
  const [tempCourseSubjects, setTempCourseSubjects] = useState<string[]>([]);
  const [tempCoursePrice, setTempCoursePrice] = useState<string | null>(null);
  const [tempNotesSubjects, setTempNotesSubjects] = useState<string[]>([]);
  
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');

  // --- DYNAMIC DATA EXTRACTION (NO HARDCODED FILTERS) ---
  const branchSlug = useMemo(() => selectedBranch.toLowerCase().replace(/\s+/g, '-'), [selectedBranch]);
  const levelSlug = useMemo(() => selectedLevel.toLowerCase(), [selectedLevel]);

  // Extract PYQ filters based on current program
  const currentProgramPyqs = useMemo(() => 
    pyqs.filter(p => p.branch === branchSlug && p.level === levelSlug)
  , [pyqs, branchSlug, levelSlug]);

  const dynamicYears = useMemo(() => 
    Array.from(new Set(currentProgramPyqs.map(p => p.year?.toString()).filter(Boolean))).sort((a, b) => Number(b) - Number(a))
  , [currentProgramPyqs]);

  const dynamicExamTypes = useMemo(() => 
    Array.from(new Set(currentProgramPyqs.map(p => p.exam_type).filter(Boolean))).sort()
  , [currentProgramPyqs]);

  const dynamicPyqSubjects = useMemo(() => 
    Array.from(new Set(currentProgramPyqs.map(p => p.subject).filter(Boolean))).sort()
  , [currentProgramPyqs]);

  // Set default filter values once data arrives
  useEffect(() => {
    if (!pyqYear && dynamicYears.length > 0) setPyqYear(dynamicYears[0]);
    if (!examType && dynamicExamTypes.length > 0) setExamType(dynamicExamTypes[0]);
    if (!pyqSubject && dynamicPyqSubjects.length > 0) setPyqSubject(dynamicPyqSubjects[0]);
  }, [dynamicYears, dynamicExamTypes, dynamicPyqSubjects]);

  // Sync Branch/Level filters from available courses
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

  // --- COMPONENT LOGIC ---

  useEffect(() => {
    setSelectedNotesSubjects([]);
  }, [selectedBranch, selectedLevel]);

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
      setTempPyqSubject(pyqSubject);
      setTempCourseLevels(selectedCourseLevels);
      setTempCourseSubjects(selectedCourseSubjects);
      setTempCoursePrice(coursePriceRange);
      setTempNotesSubjects(selectedNotesSubjects);
      setOpenDropdown(type);
    }
  };

  const handleApplyBranch = () => { setSelectedBranch(tempBranch); setOpenDropdown(null); };
  const handleApplyLevel = () => { setSelectedLevel(tempLevel); setOpenDropdown(null); };
  const handleApplyYear = () => { setPyqYear(tempPyqYear); setOpenDropdown(null); };
  const handleApplyExamType = () => { setExamType(tempExamType); setOpenDropdown(null); };
  const handleApplyPyqSubject = () => { setPyqSubject(tempPyqSubject); setOpenDropdown(null); };
  const handleApplyCourseFilters = () => {
    setSelectedCourseLevels(tempCourseLevels);
    setSelectedCourseSubjects(tempCourseSubjects);
    setCoursePriceRange(tempCoursePrice);
    setOpenDropdown(null);
  };
  const handleApplyNotesSubject = () => { setSelectedNotesSubjects(tempNotesSubjects); setOpenDropdown(null); };

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

  const getBreadcrumbItems = () => {
    const items = [];
    items.push(tabs.find(t => t.id === activeTab)?.label || activeTab);
    if (selectedBranch) items.push(selectedBranch);
    if (['notes', 'pyqs', 'tools'].includes(activeTab) && selectedLevel) items.push(selectedLevel);
    if (activeTab === 'pyqs') {
      if (pyqSubject) items.push(pyqSubject);
      if (pyqYear) items.push(pyqYear);
      if (examType) items.push(examType.toUpperCase());
    }
    return items;
  };

  const tabs = [
    { id: "notes", label: "Notes" },
    { id: "pyqs", label: "PYQs" },
    { id: "syllabus", label: "Syllabus" },
    { id: "tools", label: "Tools" },
    { id: "courses", label: "Related Courses"},
    { id: "news", label: "News" },
    { id: "dates", label: "Important Dates" }
  ];

  const tools = [
    { id: "cgpa-calculator", label: "CGPA Calculator" },
    { id: "grade-calculator", label: "Grade Calculator" },
    { id: "marks-predictor", label: "Marks Predictor" }
  ];

  const renderDropdownContent = (type: typeof openDropdown) => {
    if (!type) return null;
    
    switch (type) {
      case 'branch':
        return (
          <>
            <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1 custom-scrollbar">
              {(activeTab === 'courses' ? ["All Branches", ...branches] : branches).map(branch => (
                <label key={branch} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs text-gray-700 font-sans">
                  <input type="radio" name="branch" checked={tempBranch === branch} onChange={() => setTempBranch(branch)} className="accent-[#6366f1]" /> {branch}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 rounded font-bold uppercase">Cancel</button>
              <button onClick={handleApplyBranch} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded font-bold uppercase">Apply</button>
            </div>
          </>
        );
      case 'level':
        return (
          <>
            <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1 custom-scrollbar">
              {levels.map(lvl => (
                <label key={lvl} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs text-gray-700 font-sans">
                  <input type="radio" name="level" checked={tempLevel === lvl} onChange={() => setTempLevel(lvl)} className="accent-[#6366f1]" /> {lvl}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 rounded font-bold uppercase">Cancel</button>
              <button onClick={handleApplyLevel} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded font-bold uppercase">Apply</button>
            </div>
          </>
        );
      case 'year':
        return (
          <>
            <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1 custom-scrollbar">
              {dynamicYears.map(y => (
                <label key={y} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs text-gray-700 font-sans">
                  <input type="radio" name="year" checked={tempPyqYear === y} onChange={() => setTempPyqYear(y)} className="accent-[#6366f1]" /> {y}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 rounded font-bold uppercase">Cancel</button>
              <button onClick={handleApplyYear} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded font-bold uppercase">Apply</button>
            </div>
          </>
        );
      case 'examType':
        return (
          <>
            <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1 custom-scrollbar">
              {dynamicExamTypes.map(type => (
                <label key={type} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs text-gray-700 uppercase font-sans">
                  <input type="radio" name="exam" checked={tempExamType === type} onChange={() => setTempExamType(type)} className="accent-[#6366f1]" /> {type}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 rounded font-bold uppercase">Cancel</button>
              <button onClick={handleApplyExamType} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded font-bold uppercase">Apply</button>
            </div>
          </>
        );
      case 'pyqSubject':
        return (
          <>
            <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1 custom-scrollbar">
              {dynamicPyqSubjects.map(sub => (
                <label key={sub} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs text-gray-700 font-sans">
                  <input type="radio" name="pyqSub" checked={tempPyqSubject === sub} onChange={() => setTempPyqSubject(sub)} className="accent-[#6366f1]" /> {sub}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 rounded font-bold uppercase">Cancel</button>
              <button onClick={handleApplyPyqSubject} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded font-bold uppercase">Apply</button>
            </div>
          </>
        );
      case 'notesSubject':
        return (
          <>
            <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1 custom-scrollbar">
              {availableNotesSubjects.map(sub => (
                <label key={sub} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs text-gray-700 font-sans">
                  <input type="checkbox" checked={tempNotesSubjects.includes(sub)} onChange={() => toggleTempItem(sub, tempNotesSubjects, setTempNotesSubjects)} className="accent-[#6366f1]" /> {sub}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={handleApplyNotesSubject} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded font-bold uppercase w-full">Apply</button>
            </div>
          </>
        );
      case 'courseLevel':
        return (
          <>
            <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1 custom-scrollbar">
              {availableCourseLevels.map(lvl => (
                <label key={lvl} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs text-gray-700 font-sans">
                  <input type="checkbox" checked={tempCourseLevels.includes(lvl)} onChange={() => toggleTempItem(lvl, tempCourseLevels, setTempCourseLevels)} className="accent-[#6366f1]" /> {lvl}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={handleApplyCourseFilters} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded font-bold uppercase w-full">Apply</button>
            </div>
          </>
        );
      case 'courseSubject':
        return (
          <>
            <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1 custom-scrollbar">
              {availableCourseSubjects.map(sub => (
                <label key={sub} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs text-gray-700 font-sans">
                  <input type="checkbox" checked={tempCourseSubjects.includes(sub)} onChange={() => toggleTempItem(sub, tempCourseSubjects, setTempCourseSubjects)} className="accent-[#6366f1]" /> {sub}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={handleApplyCourseFilters} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded font-bold uppercase w-full">Apply</button>
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
              <button onClick={handleApplyCourseFilters} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded font-bold uppercase w-full">Apply</button>
            </div>
          </>
        );
      default: return null;
    }
  };

  const hasSubFilters = ['notes', 'pyqs', 'syllabus', 'tools'].includes(activeTab);

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans">
      <NavBar />
      <main className="pt-16">
        <ExamPrepHeader examName="IITM BS" examPath="/exam-preparation/iitm-bs" currentTab={activeTab} pageTitle="IITM BS Degree Preparation" />

        <div ref={filterRef} className={`w-full transition-shadow duration-300 ${isSticky ? 'fixed top-16 bg-white border-b shadow-none z-[9999]' : 'relative z-[9999]'}`}>
          <div className="bg-[#f4f2ff]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8 pt-4 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`pb-2 text-[14px] md:text-[15px] cursor-pointer whitespace-nowrap transition-all font-sans ${activeTab === tab.id ? 'text-[#6366f1] border-b-[3px] border-[#6366f1] font-semibold' : 'text-[#6b7280] font-medium'}`}>{tab.label}</button>
              ))}
            </div>
          </div>

          <div className="bg-white border-b border-[#f3f4f6] min-h-[56px] relative z-[100]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center overflow-x-auto no-scrollbar">
              <div className="flex flex-nowrap gap-3 items-center whitespace-nowrap">
                {activeTab === 'pyqs' && (
                  <>
                    <button onClick={() => toggleDropdown('pyqSubject')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151] dropdown-container">
                      {pyqSubject || 'Subject'}
                      <span className="ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-t-[#374151] border-l-transparent border-r-transparent"></span>
                    </button>
                    <button onClick={() => toggleDropdown('year')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151] dropdown-container">
                      {pyqYear || 'Year'}
                      <span className="ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-t-[#374151] border-l-transparent border-r-transparent"></span>
                    </button>
                    <button onClick={() => toggleDropdown('examType')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white uppercase font-sans text-[#374151] dropdown-container">
                      {(examType || 'Category').toUpperCase()}
                      <span className="ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-t-[#374151] border-l-transparent border-r-transparent"></span>
                    </button>
                  </>
                )}
                
                {activeTab === 'courses' ? (
                  <>
                    <button onClick={() => toggleDropdown('branch')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151]">Branch</button>
                    <button onClick={() => toggleDropdown('courseLevel')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151]">Level</button>
                    <button onClick={() => toggleDropdown('courseSubject')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151]">Subject</button>
                    <button onClick={() => toggleDropdown('coursePricing')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151]">Pricing</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => toggleDropdown('branch')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151]">Branch</button>
                    <button onClick={() => toggleDropdown('level')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151]">Level</button>
                    {activeTab === 'notes' && <button onClick={() => toggleDropdown('notesSubject')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151]">Subjects</button>}
                  </>
                )}
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              {openDropdown === 'pyqSubject' && <div className="absolute top-0 left-4 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 dropdown-container min-w-[180px]">{renderDropdownContent('pyqSubject')}</div>}
              {openDropdown === 'year' && <div className="absolute top-0 left-4 sm:left-[120px] bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 dropdown-container min-w-[140px]">{renderDropdownContent('year')}</div>}
              {openDropdown === 'examType' && <div className="absolute top-0 left-4 sm:left-[220px] bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 dropdown-container min-w-[160px]">{renderDropdownContent('examType')}</div>}
              {openDropdown === 'branch' && <div className="absolute top-0 right-4 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 dropdown-container min-w-[180px]">{renderDropdownContent('branch')}</div>}
              {openDropdown === 'level' && <div className="absolute top-0 right-4 sm:right-[200px] bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 dropdown-container min-w-[160px]">{renderDropdownContent('level')}</div>}
              {openDropdown === 'courseLevel' && <div className="absolute top-0 left-[100px] bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 dropdown-container min-w-[160px]">{renderDropdownContent('courseLevel')}</div>}
              {openDropdown === 'courseSubject' && <div className="absolute top-0 left-[200px] bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 dropdown-container min-w-[180px]">{renderDropdownContent('courseSubject')}</div>}
              {openDropdown === 'coursePricing' && <div className="absolute top-0 left-[300px] bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 dropdown-container min-w-[140px]">{renderDropdownContent('coursePricing')}</div>}
              {openDropdown === 'notesSubject' && <div className="absolute top-0 left-[220px] bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 dropdown-container min-w-[200px]">{renderDropdownContent('notesSubject')}</div>}
            </div>
          </div>
        </div>

        {isSticky && <div className="h-[120px]" />}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-[#fcfcfc]">
          <Breadcrumb>
            <BreadcrumbList className="flex-wrap gap-1">
              {getBreadcrumbItems().map((label, index) => (
                <React.Fragment key={`${label}-${index}`}>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="capitalize font-medium text-[#6366f1] font-sans">{label}</BreadcrumbPage>
                  </BreadcrumbItem>
                  {index < getBreadcrumbItems().length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <section className="py-8 bg-white min-h-[600px] relative z-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {activeTab === "pyqs" && <PYQsTab branch={selectedBranch} level={selectedLevel} year={pyqYear} examType={examType} subject={pyqSubject} />}
            {activeTab === "notes" && <BranchNotesTab branch={selectedBranch} level={selectedLevel} selectedSubjects={selectedNotesSubjects} onSubjectsLoaded={setAvailableNotesSubjects} />}
            {activeTab === "syllabus" && <SyllabusTab branch={selectedBranch} />}
            {activeTab === "tools" && <IITMToolsTab selectedTool={selectedTool} branch={selectedBranch} level={selectedLevel} />}
            {activeTab === "courses" && <PaidCoursesTab branch={selectedBranch} levels={selectedCourseLevels} subjects={selectedCourseSubjects} priceRange={coursePriceRange} newlyLaunched={courseNewlyLaunched} fasttrackOnly={courseFasttrackOnly} bestSellerOnly={courseBestSellerOnly} />}
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
