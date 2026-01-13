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
import { X, Home, ChevronRight, RotateCcw } from "lucide-react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// CUSTOM FILLED ARROW COMPONENT
const FilledArrow = () => (
  <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2">
    <path d="M4 6L0.535898 0L7.4641 0L4 6Z" fill="#374151" />
  </svg>
);

const IITMBSPrep = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courses, pyqs } = useBackend();
  
  const filterRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [filterOffset, setFilterOffset] = useState(0);
  
  const [openDropdown, setOpenDropdown] = useState<'branch' | 'level' | 'examType' | 'year' | 'pyqSubject' | 'courseLevel' | 'courseSubject' | 'coursePricing' | 'notesSubject' | null>(null);

  const [activeTab, setActiveTab] = useState(() => getTabFromUrl(location.pathname));
  
  // --- CORE FILTERS ---
  const [selectedBranch, setSelectedBranch] = useState("Data Science");
  const [selectedLevel, setSelectedLevel] = useState("Foundation");
  
  // --- PYQ FILTERS ---
  const [pyqYear, setPyqYear] = useState<string | null>(null);
  const [examType, setExamType] = useState<string | null>(null);
  const [pyqSubject, setPyqSubject] = useState<string | null>(null);

  // --- ADDITIONAL TAB FILTERS ---
  const [selectedTool, setSelectedTool] = useState("cgpa-calculator");
  const [selectedCourseLevels, setSelectedCourseLevels] = useState<string[]>([]);
  const [selectedCourseSubjects, setSelectedCourseSubjects] = useState<string[]>([]);
  const [coursePriceRange, setCoursePriceRange] = useState<string | null>(null);
  const [courseNewlyLaunched, setCourseNewlyLaunched] = useState(false);
  const [courseFasttrackOnly, setCourseFastrackOnly] = useState(false);
  const [courseBestSellerOnly, setCourseBestSellerOnly] = useState(false);
  const [selectedNotesSubjects, setSelectedNotesSubjects] = useState<string[]>([]);
  const [availableNotesSubjects, setAvailableNotesSubjects] = useState<string[]>([]);

  // --- TEMP STATES ---
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

  // --- DYNAMIC DATA ---
  const branchSlug = useMemo(() => selectedBranch.toLowerCase().replace(/\s+/g, '-'), [selectedBranch]);
  const levelSlug = useMemo(() => selectedLevel.toLowerCase(), [selectedLevel]);

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

  useEffect(() => {
    if (!pyqYear && dynamicYears.length > 0) setPyqYear(dynamicYears[0]);
    if (!examType && dynamicExamTypes.length > 0) setExamType(dynamicExamTypes[0]);
    if (!pyqSubject && dynamicPyqSubjects.length > 0) setPyqSubject(dynamicPyqSubjects[0]);
  }, [dynamicYears, dynamicExamTypes, dynamicPyqSubjects]);

  const iitmCourses = useMemo(() => 
    courses.filter(c => c.exam_category === 'IITM BS' || c.exam_category === 'IITM_BS')
  , [courses]);

  const branches = useMemo(() => 
    Array.from(new Set(iitmCourses.map(c => c.branch))).filter(Boolean).sort() as string[]
  , [iitmCourses]);

  const levels = useMemo(() => 
    Array.from(new Set(iitmCourses.map(c => c.level))).filter(Boolean).sort() as string[]
  , [iitmCourses]);

  const availableCourseLevels = useMemo(() => 
    Array.from(new Set(iitmCourses.filter(c => c.branch === selectedBranch).map(c => c.level))).filter(Boolean).sort() as string[]
  , [iitmCourses, selectedBranch]);
  
  const availableCourseSubjects = useMemo(() => 
    Array.from(new Set(iitmCourses.filter(c => c.branch === selectedBranch).map(c => c.subject))).filter(Boolean).sort() as string[]
  , [iitmCourses, selectedBranch]);

  // --- LOGIC ---
  useEffect(() => {
    if (filterRef.current) setFilterOffset(filterRef.current.offsetTop);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const navbarHeight = 64;
      if (filterRef.current && filterOffset > 0) {
        setIsSticky(window.scrollY > (filterOffset - navbarHeight));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filterOffset]);

  useEffect(() => {
    const tabFromUrl = getTabFromUrl(location.pathname);
    setActiveTab(tabFromUrl);
  }, [location.pathname]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setOpenDropdown(null);
    navigate(buildExamUrl('iitm-bs', newTab, {}), { replace: true });
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
  const handleApplyCourseFilters = () => { setSelectedCourseLevels(tempCourseLevels); setSelectedCourseSubjects(tempCourseSubjects); setCoursePriceRange(tempCoursePrice); setOpenDropdown(null); };
  const handleApplyNotesSubject = () => { setSelectedNotesSubjects(tempNotesSubjects); setOpenDropdown(null); };
  const resetPyqFilters = () => { if (dynamicYears.length > 0) setPyqYear(dynamicYears[0]); if (dynamicExamTypes.length > 0) setExamType(dynamicExamTypes[0]); if (dynamicPyqSubjects.length > 0) setPyqSubject(dynamicPyqSubjects[0]); };
  const toggleTempItem = (item: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => { setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]); };

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
    if (['notes', 'pyqs'].includes(activeTab) && selectedLevel) items.push(selectedLevel);
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

  const renderDropdownContent = (type: typeof openDropdown) => {
    if (!type) return null;
    switch (type) {
      case 'branch':
        return (
          <>
            <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1 custom-scrollbar">
              {branches.map(branch => (
                <label key={branch} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs text-gray-700 font-sans">
                  <input type="radio" checked={tempBranch === branch} onChange={() => setTempBranch(branch)} className="accent-[#6366f1]" /> {branch}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 font-bold uppercase">Cancel</button>
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
                  <input type="radio" checked={tempLevel === lvl} onChange={() => setTempLevel(lvl)} className="accent-[#6366f1]" /> {lvl}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 font-bold uppercase">Cancel</button>
              <button onClick={handleApplyLevel} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded font-bold uppercase">Apply</button>
            </div>
          </>
        );
      case 'year':
        return (
          <>
            <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1 custom-scrollbar">
              {dynamicYears.map(y => (
                <label key={y} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs text-gray-700 font-sans font-medium">
                  <input type="radio" checked={tempPyqYear === y} onChange={() => setTempPyqYear(y)} className="accent-[#6366f1]" /> {y}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 font-bold uppercase">Cancel</button>
              <button onClick={handleApplyYear} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded font-bold uppercase">Apply</button>
            </div>
          </>
        );
      case 'examType':
        return (
          <>
            <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1 custom-scrollbar">
              {dynamicExamTypes.map(type => (
                <label key={type} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs text-gray-700 font-sans uppercase font-bold">
                  <input type="radio" checked={tempExamType === type} onChange={() => setTempExamType(type)} className="accent-[#6366f1]" /> {type}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 font-bold uppercase">Cancel</button>
              <button onClick={handleApplyExamType} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded font-bold uppercase">Apply</button>
            </div>
          </>
        );
      case 'pyqSubject':
        return (
          <>
            <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1 custom-scrollbar">
              {dynamicPyqSubjects.map(sub => (
                <label key={sub} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs text-gray-700 font-sans font-medium">
                  <input type="radio" checked={tempPyqSubject === sub} onChange={() => setTempPyqSubject(sub)} className="accent-[#6366f1]" /> {sub}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 font-bold uppercase">Cancel</button>
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
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans">
      <NavBar />
      <main className="pt-16">
        <ExamPrepHeader examName="IITM BS" examPath="/exam-preparation/iitm-bs" currentTab={activeTab} pageTitle="IITM BS Degree Preparation" />

        <div ref={filterRef} className={`w-full transition-shadow duration-300 z-[5000] ${isSticky ? 'fixed top-16 bg-white border-b shadow-none' : 'relative'}`}>
          <div className="bg-[#f4f2ff]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8 pt-4 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`pb-2 text-[14px] md:text-[15px] cursor-pointer whitespace-nowrap transition-all font-sans ${activeTab === tab.id ? 'text-[#6366f1] border-b-[3px] border-[#6366f1] font-semibold' : 'text-[#6b7280] font-medium'}`}>{tab.label}</button>
              ))}
            </div>
          </div>

          <div className="bg-white border-b border-[#f3f4f6] min-h-[56px] overflow-visible">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center overflow-visible">
              <div className="flex flex-nowrap gap-3 items-center whitespace-nowrap overflow-visible">
                
                {activeTab === 'pyqs' && (
                  <>
                    <div className="relative dropdown-container overflow-visible">
                      <button onClick={() => toggleDropdown('pyqSubject')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151]">
                        Subjects <FilledArrow />
                      </button>
                      {openDropdown === 'pyqSubject' && <div className="absolute top-full left-0 mt-1 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 min-w-[180px]">{renderDropdownContent('pyqSubject')}</div>}
                    </div>

                    <div className="relative dropdown-container">
                      <button onClick={() => toggleDropdown('year')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151]">
                        {pyqYear || 'Year'} <FilledArrow />
                      </button>
                      {openDropdown === 'year' && <div className="absolute top-full left-0 mt-1 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 min-w-[140px]">{renderDropdownContent('year')}</div>}
                    </div>

                    <div className="relative dropdown-container">
                      <button onClick={() => toggleDropdown('examType')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151]">
                        Exam <FilledArrow />
                      </button>
                      {openDropdown === 'examType' && <div className="absolute top-full left-0 mt-1 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 min-w-[160px]">{renderDropdownContent('examType')}</div>}
                    </div>
                  </>
                )}

                <div className="relative dropdown-container">
                  <button onClick={() => toggleDropdown('branch')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151]">
                    Branch <FilledArrow />
                  </button>
                  {openDropdown === 'branch' && <div className="absolute top-full left-0 mt-1 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 min-w-[180px]">{renderDropdownContent('branch')}</div>}
                </div>

                <div className="relative dropdown-container">
                  <button onClick={() => toggleDropdown('level')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151]">
                    Level <FilledArrow />
                  </button>
                  {openDropdown === 'level' && <div className="absolute top-full left-0 mt-1 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 min-w-[160px]">{renderDropdownContent('level')}</div>}
                </div>

                {activeTab === 'notes' && (
                  <div className="relative dropdown-container">
                    <button onClick={() => toggleDropdown('notesSubject')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151]">
                      Subjects <FilledArrow />
                    </button>
                    {openDropdown === 'notesSubject' && <div className="absolute top-full left-0 mt-1 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 min-w-[200px]">{renderDropdownContent('notesSubject')}</div>}
                  </div>
                )}

                {activeTab === 'pyqs' && (
                  <button onClick={resetPyqFilters} className="text-[#6366f1] text-[12px] font-medium hover:underline px-2">
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {isSticky && <div className="h-[120px]" />}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
