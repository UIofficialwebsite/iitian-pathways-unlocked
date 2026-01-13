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

/**
 * Custom Filled Arrow Component
 */
const FilledArrow = ({ isOpen }: { isOpen: boolean }) => (
  <svg 
    width="8" 
    height="6" 
    viewBox="0 0 8 6" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={`ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
  >
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
  
  // --- CORE FILTERS (Single Select) ---
  const [selectedBranch, setSelectedBranch] = useState("Data Science");
  const [selectedLevel, setSelectedLevel] = useState("Foundation");
  
  // --- PYQ FILTERS (Multi-Select Arrays) ---
  const [pyqYears, setPyqYears] = useState<string[]>([]);
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [pyqSubjects, setPyqSubjects] = useState<string[]>([]);

  // --- TAB-SPECIFIC STATES ---
  const [selectedTool, setSelectedTool] = useState("cgpa-calculator");
  const [selectedCourseLevels, setSelectedCourseLevels] = useState<string[]>([]);
  const [selectedCourseSubjects, setSelectedCourseSubjects] = useState<string[]>([]);
  const [coursePriceRange, setCoursePriceRange] = useState<string | null>(null);

  // --- NOTES TAB STATES ---
  const [selectedNotesSubjects, setSelectedNotesSubjects] = useState<string[]>([]);
  const [availableNotesSubjects, setAvailableNotesSubjects] = useState<string[]>([]);

  // --- TEMP STATES FOR APPLY/CANCEL MODALS (Multi-Select) ---
  const [tempBranch, setTempBranch] = useState("Data Science");
  const [tempLevel, setTempLevel] = useState("Foundation");
  const [tempPyqYears, setTempPyqYears] = useState<string[]>([]);
  const [tempExamTypes, setTempExamTypes] = useState<string[]>([]);
  const [tempPyqSubjects, setTempPyqSubjects] = useState<string[]>([]);
  const [tempNotesSubjects, setTempNotesSubjects] = useState<string[]>([]);
  const [tempCourseLevels, setTempCourseLevels] = useState<string[]>([]);
  const [tempCourseSubjects, setTempCourseSubjects] = useState<string[]>([]);
  const [tempCoursePrice, setTempCoursePrice] = useState<string | null>(null);
  
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');

  // --- DYNAMIC DATA DERIVATION ---
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

  const iitmCourses = useMemo(() => 
    courses.filter(c => c.exam_category === 'IITM BS' || c.exam_category === 'IITM_BS')
  , [courses]);

  const branches = useMemo(() => Array.from(new Set(iitmCourses.map(c => c.branch))).filter(Boolean).sort() as string[], [iitmCourses]);
  const levels = useMemo(() => Array.from(new Set(iitmCourses.map(c => c.level))).filter(Boolean).sort() as string[], [iitmCourses]);

  const availableCourseLevels = useMemo(() => 
    Array.from(new Set(iitmCourses.filter(c => c.branch === selectedBranch).map(c => c.level))).filter(Boolean).sort() as string[]
  , [iitmCourses, selectedBranch]);
  
  const availableCourseSubjects = useMemo(() => 
    Array.from(new Set(iitmCourses.filter(c => c.branch === selectedBranch).map(c => c.subject))).filter(Boolean).sort() as string[]
  , [iitmCourses, selectedBranch]);

  // --- HANDLERS ---
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
      // Initialize temps with current applied state
      setTempBranch(selectedBranch);
      setTempLevel(selectedLevel);
      setTempPyqYears(pyqYears);
      setTempExamTypes(examTypes);
      setTempPyqSubjects(pyqSubjects);
      setTempNotesSubjects(selectedNotesSubjects);
      setTempCourseLevels(selectedCourseLevels);
      setTempCourseSubjects(selectedCourseSubjects);
      setTempCoursePrice(coursePriceRange);
      setOpenDropdown(type);
    }
  };

  // Apply Handlers
  const handleApplyBranch = () => { setSelectedBranch(tempBranch); setOpenDropdown(null); };
  const handleApplyLevel = () => { setSelectedLevel(tempLevel); setOpenDropdown(null); };
  const handleApplyPyqYears = () => { setPyqYears(tempPyqYears); setOpenDropdown(null); };
  const handleApplyExamTypes = () => { setExamTypes(tempExamTypes); setOpenDropdown(null); };
  const handleApplyPyqSubjects = () => { setPyqSubjects(tempPyqSubjects); setOpenDropdown(null); };
  const handleApplyNotesSubject = () => { setSelectedNotesSubjects(tempNotesSubjects); setOpenDropdown(null); };
  const handleApplyCourseFilters = () => { setSelectedCourseLevels(tempCourseLevels); setSelectedCourseSubjects(tempCourseSubjects); setCoursePriceRange(tempCoursePrice); setOpenDropdown(null); };
  
  // Reset all dynamic filters to empty arrays (Multi-Select default)
  const resetFilters = () => {
    setPyqYears([]);
    setExamTypes([]);
    setPyqSubjects([]);
    setSelectedNotesSubjects([]);
    setOpenDropdown(null);
  };

  const toggleItemSelection = (item: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  // --- BREADCRUMB LOGIC ---
  const getBreadcrumbItems = () => {
    const items = [];
    const activeLabel = tabs.find(t => t.id === activeTab)?.label || activeTab;
    items.push(activeLabel);
    
    if (selectedBranch) items.push(selectedBranch);
    if (selectedLevel) items.push(selectedLevel);
    
    // Show counts for multi-selected items in breadcrumb
    if (activeTab === 'pyqs') {
      if (pyqSubjects.length > 0) items.push(`${pyqSubjects.length} Subjects`);
      if (pyqYears.length > 0) items.push(`${pyqYears.length} Years`);
      if (examTypes.length > 0) items.push(`${examTypes.length} Exams`);
    } else if (activeTab === 'notes') {
      selectedNotesSubjects.forEach(s => items.push(s));
    }
    return items;
  };

  const tabs = [
    { id: "notes", label: "Notes" }, { id: "pyqs", label: "PYQs" },
    { id: "syllabus", label: "Syllabus" }, { id: "tools", label: "Tools" },
    { id: "courses", label: "Related Courses"}, { id: "news", label: "News" },
    { id: "dates", label: "Important Dates" }
  ];

  const renderDropdownContent = (type: typeof openDropdown) => {
    if (!type) return null;
    let items: string[] = [];
    let isCheckbox = true; // Default to multi-select for everything except Branch/Level/Pricing

    if (type === 'branch') { items = branches; isCheckbox = false; }
    else if (type === 'level') { items = levels; isCheckbox = false; }
    else if (type === 'year') items = dynamicYears;
    else if (type === 'examType') items = dynamicExamTypes;
    else if (type === 'pyqSubject') items = dynamicPyqSubjects;
    else if (type === 'notesSubject') items = availableNotesSubjects;
    else if (type === 'courseLevel') items = availableCourseLevels;
    else if (type === 'courseSubject') items = availableCourseSubjects;
    else if (type === 'coursePricing') { items = ['free', 'paid']; isCheckbox = false; }

    return (
      <div className="z-[9999]">
        <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1 custom-scrollbar">
          {items.map(item => (
            <label key={item} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs text-gray-700 font-sans font-medium">
              <input 
                type={isCheckbox ? "checkbox" : "radio"} 
                checked={
                  isCheckbox 
                    ? (type === 'year' ? tempPyqYears.includes(item) : type === 'examType' ? tempExamTypes.includes(item) : type === 'pyqSubject' ? tempPyqSubjects.includes(item) : type === 'notesSubject' ? tempNotesSubjects.includes(item) : type === 'courseLevel' ? tempCourseLevels.includes(item) : type === 'courseSubject' ? tempCourseSubjects.includes(item) : false)
                    : (type === 'branch' ? tempBranch === item : type === 'level' ? tempLevel === item : type === 'coursePricing' ? tempCoursePrice === item : false)
                } 
                onChange={() => {
                  if (isCheckbox) {
                    if (type === 'year') toggleItemSelection(item, tempPyqYears, setTempPyqYears);
                    else if (type === 'examType') toggleItemSelection(item, tempExamTypes, setTempExamTypes);
                    else if (type === 'pyqSubject') toggleItemSelection(item, tempPyqSubjects, setTempPyqSubjects);
                    else if (type === 'notesSubject') toggleItemSelection(item, tempNotesSubjects, setTempNotesSubjects);
                    else if (type === 'courseLevel') toggleItemSelection(item, tempCourseLevels, setTempCourseLevels);
                    else if (type === 'courseSubject') toggleItemSelection(item, tempCourseSubjects, setTempCourseSubjects);
                  } else {
                    if (type === 'branch') setTempBranch(item);
                    else if (type === 'level') setTempLevel(item);
                    else if (type === 'coursePricing') setTempCoursePrice(item);
                  }
                }} 
                className="accent-[#6366f1]" 
              /> 
              <span className={type === 'examType' ? 'uppercase' : ''}>{item}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2 pt-2 border-t">
          <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 font-bold uppercase">Cancel</button>
          <button onClick={() => {
            if (type === 'branch') handleApplyBranch();
            else if (type === 'level') handleApplyLevel();
            else if (type === 'year') handleApplyPyqYears();
            else if (type === 'examType') handleApplyExamTypes();
            else if (type === 'pyqSubject') handleApplyPyqSubjects();
            else if (type === 'notesSubject') handleApplyNotesSubject();
            else handleApplyCourseFilters();
          }} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded font-bold uppercase">Apply</button>
        </div>
      </div>
    );
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
              <div className="flex flex-nowrap gap-3 items-center whitespace-nowrap overflow-visible w-full">
                
                {/* BRANCH & LEVEL ALWAYS FIRST */}
                <div className="relative dropdown-container overflow-visible">
                  <button onClick={() => toggleDropdown('branch')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151]">
                    Branch <FilledArrow isOpen={openDropdown === 'branch'} />
                  </button>
                  {openDropdown === 'branch' && <div className="absolute top-full left-0 mt-1 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 min-w-[180px]">{renderDropdownContent('branch')}</div>}
                </div>
                <div className="relative dropdown-container overflow-visible">
                  <button onClick={() => toggleDropdown('level')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151]">
                    Level <FilledArrow isOpen={openDropdown === 'level'} />
                  </button>
                  {openDropdown === 'level' && <div className="absolute top-full left-0 mt-1 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 min-w-[160px]">{renderDropdownContent('level')}</div>}
                </div>

                {/* NOTES TAB MULTI-SELECT BADGES */}
                {activeTab === 'notes' && (
                  <div className="flex items-center gap-3 overflow-visible">
                    <div className="relative dropdown-container overflow-visible">
                      <button onClick={() => toggleDropdown('notesSubject')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151]">
                        {selectedNotesSubjects.length > 0 && (
                          <span className="w-5 h-5 flex items-center justify-center bg-[#6366f1] text-white text-[10px] rounded-full mr-2">{selectedNotesSubjects.length}</span>
                        )}
                        Subjects <FilledArrow isOpen={openDropdown === 'notesSubject'} />
                      </button>
                      {openDropdown === 'notesSubject' && <div className="absolute top-full left-0 mt-1 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 min-w-[200px]">{renderDropdownContent('notesSubject')}</div>}
                    </div>
                    {/* Active Pills with Black Border */}
                    {selectedNotesSubjects.map(sub => (
                      <div key={sub} className="px-3 py-1 border border-black rounded-full text-[12px] flex items-center gap-2 bg-white font-medium">
                        {sub} <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => setSelectedNotesSubjects(prev => prev.filter(s => s !== sub))} />
                      </div>
                    ))}
                  </div>
                )}

                {/* PYQ MULTI-SELECT DROPDOWNS */}
                {activeTab === 'pyqs' && (
                  <div className="flex flex-nowrap gap-3 items-center whitespace-nowrap overflow-visible">
                    <div className="relative dropdown-container overflow-visible">
                      <button onClick={() => toggleDropdown('pyqSubject')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151]">
                        {pyqSubjects.length > 0 && <span className="w-5 h-5 flex items-center justify-center bg-[#6366f1] text-white text-[10px] rounded-full mr-2">{pyqSubjects.length}</span>}
                        Subjects <FilledArrow isOpen={openDropdown === 'pyqSubject'} />
                      </button>
                      {openDropdown === 'pyqSubject' && <div className="absolute top-full left-0 mt-1 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 min-w-[180px]">{renderDropdownContent('pyqSubject')}</div>}
                    </div>
                    <div className="relative dropdown-container overflow-visible">
                      <button onClick={() => toggleDropdown('year')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151]">
                        {pyqYears.length > 0 && <span className="w-5 h-5 flex items-center justify-center bg-[#6366f1] text-white text-[10px] rounded-full mr-2">{pyqYears.length}</span>}
                        Year <FilledArrow isOpen={openDropdown === 'year'} />
                      </button>
                      {openDropdown === 'year' && <div className="absolute top-full left-0 mt-1 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 min-w-[140px]">{renderDropdownContent('year')}</div>}
                    </div>
                    <div className="relative dropdown-container overflow-visible">
                      <button onClick={() => toggleDropdown('examType')} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center bg-white font-sans text-[#374151]">
                        {examTypes.length > 0 && <span className="w-5 h-5 flex items-center justify-center bg-[#6366f1] text-white text-[10px] rounded-full mr-2">{examTypes.length}</span>}
                        Exam <FilledArrow isOpen={openDropdown === 'examType'} />
                      </button>
                      {openDropdown === 'examType' && <div className="absolute top-full left-0 mt-1 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 min-w-[160px]">{renderDropdownContent('examType')}</div>}
                    </div>
                  </div>
                )}

                {/* RESET FILTERS (Only shows if any PYQ or Notes filter is active) */}
                {((activeTab === 'pyqs' && (pyqYears.length > 0 || examTypes.length > 0 || pyqSubjects.length > 0)) || (activeTab === 'notes' && selectedNotesSubjects.length > 0)) && (
                  <button onClick={resetFilters} className="text-[#6366f1] text-[12px] font-medium hover:underline px-2 transition-all ml-auto">
                    Reset Filters
                  </button>
                )}
              </div>
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
                    <BreadcrumbPage className="capitalize font-medium text-[#6366f1] font-sans text-[13px]">{label}</BreadcrumbPage>
                  </BreadcrumbItem>
                  {index < getBreadcrumbItems().length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <section className="py-8 bg-white min-h-[600px] relative z-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {activeTab === "pyqs" && <PYQsTab branch={selectedBranch} level={selectedLevel} years={pyqYears} examTypes={examTypes} subjects={pyqSubjects} />}
            {activeTab === "notes" && <BranchNotesTab branch={selectedBranch} level={selectedLevel} selectedSubjects={selectedNotesSubjects} onSubjectsLoaded={setAvailableNotesSubjects} />}
            {activeTab === "syllabus" && <SyllabusTab branch={selectedBranch} />}
            {activeTab === "tools" && <IITMToolsTab selectedTool={selectedTool} branch={selectedBranch} level={selectedLevel} />}
            {activeTab === "courses" && <PaidCoursesTab branch={selectedBranch} levels={selectedCourseLevels} subjects={selectedCourseSubjects} priceRange={coursePriceRange} />}
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
